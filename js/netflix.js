// Simple Netflix status client: calls /api/netflixstatus and shows OK / unreachable
(function(){
  const container = document.getElementById('netflix-status');
  if(!container) return;

  function renderOk(){
    container.innerHTML = '<div class="status-item"><div class="status-name">Netflix</div><div class="status-badge online">OK</div></div>';
  }

  function renderDown(){
    container.innerHTML = '<div class="status-item"><div class="status-name">Netflix</div><div class="status-badge down">Nicht erreichbar</div></div>';
  }

  async function update(){
    container.innerHTML = '<p class="muted">Lade Status…</p>';
    // Try local serverless path first (works when site is deployed together with functions)
    const VERCEL_BASE = 'https://serverwatch-qskejdd38-k4l1um-sudos-projects.vercel.app';
    try{
      let res = await fetch('/api/netflixstatus', {cache: 'no-store'});
      if(!res.ok){
        // fallback to Vercel deployment (if functions are hosted there)
        res = await fetch(VERCEL_BASE + '/api/netflixstatus', {cache: 'no-store'});
      }
      if(!res.ok){ renderDown(); return; }
      const j = await res.json();
      if(j && j.available === true){ renderOk(); }
      else { renderDown(); }
    }catch(e){
      // try Vercel as last resort
      try{
        const res2 = await fetch(VERCEL_BASE + '/api/netflixstatus', {cache: 'no-store'});
        if(res2.ok){
          const j2 = await res2.json();
          if(j2 && j2.available === true) { renderOk(); return; }
        }
      }catch(_){/* ignore */}
      renderDown();
    }
  }

  update();
  setInterval(update, 60*1000);
})();
// Netflix integration removed. See commit history for prior implementation.
console.info('Netflix integration removed: js/netflix.js is now a stub.');
