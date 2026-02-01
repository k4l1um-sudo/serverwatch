// Netflix status client: try direct fetch of help.netflix.com, fallback to server endpoints on CORS
(function(){
  const container = document.getElementById('netflix-status');
  if(!container) return;

  function renderOk(){
    container.innerHTML = '<div class="status-item"><div class="status-name">Netflix</div><div class="status-badge online">OK</div></div>';
  }

  function renderDown(){
    container.innerHTML = '<div class="status-item"><div class="status-name">Netflix</div><div class="status-badge down">Nicht erreichbar</div></div>';
  }

  const EXTERNAL_URL = 'https://help.netflix.com/de/is-netflix-down';
  const VERCEL_BASE = 'https://serverwatch-qskejdd38-k4l1um-sudos-projects.vercel.app';

  async function update(){
    container.innerHTML = '<p class="muted">Lade Status…</p>';

    // 1) Try direct fetch of the help page (may be blocked by CORS)
    try{
      const res = await fetch(EXTERNAL_URL, { cache: 'no-store' });
      if(res.ok){
        const html = await res.text();
        const visible = html.replace(/<[^>]+>/g, ' ');
        const phrase = 'Netflix ist verfügbar';
        if(visible.includes(phrase)) { renderOk(); return; }
        else { renderDown(); return; }
      }
      // if non-ok, continue to fallback
    }catch(err){
      console.warn('Direct fetch blocked or failed, falling back to server endpoint:', err && err.message);
    }

    // 2) Try local server endpoint /api/netflixstatus, then Vercel deployment
    try{
      let res = await fetch('/api/netflixstatus', { cache: 'no-store' });
      if(!res.ok){
        res = await fetch(VERCEL_BASE + '/api/netflixstatus', { cache: 'no-store' });
      }
      if(!res.ok){ renderDown(); return; }
      const j = await res.json();
      if(j && j.available === true) { renderOk(); }
      else { renderDown(); }
      return;
    }catch(err){
      try{
        const r2 = await fetch(VERCEL_BASE + '/api/netflixstatus', { cache: 'no-store' });
        if(r2.ok){ const j2 = await r2.json(); if(j2 && j2.available === true){ renderOk(); return; } }
      }catch(e){ /* ignore */ }
    }

    renderDown();
  }

  update();
  setInterval(update, 60*1000);
})();
            if(!res.ok){
