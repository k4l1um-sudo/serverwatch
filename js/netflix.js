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

        // Try to fetch the external help page directly (may be blocked by CORS).
        // If direct fetch succeeds, search visible text for the exact phrase.
        // On CORS/network error fall back to server endpoints.
        async function update(){
          container.innerHTML = '<p class="muted">Lade Status…</p>';
          // 1) Try direct fetch of the help page
          try{
            const res = await fetch(EXTERNAL_URL, { cache: 'no-store' });
            if(res.ok){
              const html = await res.text();
              const visible = html.replace(/<[^>]+>/g, ' ');
              const phrase = 'Netflix ist verfügbar';
              if(visible.includes(phrase)) { renderOk(); return; }
              else { renderDown(); return; }
            }
            // non-ok response -> fall through to server fallback
          }catch(err){
            // Likely CORS or network failure — fallback to server endpoints
            console.warn('Direct fetch blocked or failed, falling back to server endpoint:', err && err.message);
          }

          // 2) Try local server endpoint /api/netflixstatus
          try{
            let res = await fetch('/api/netflixstatus', { cache: 'no-store' });
            if(!res.ok){
              // fallback to known Vercel deployment if available
              res = await fetch(VERCEL_BASE + '/api/netflixstatus', { cache: 'no-store' });
            }
            if(!res.ok){ renderDown(); return; }
            const j = await res.json();
            if(j && j.available === true) { renderOk(); }
            else { renderDown(); }
            return;
          }catch(err){
            // last resort: try Vercel directly
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
