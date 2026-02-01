// Try several likely Netflix status endpoints and render components mentioning Netflix
(function(){
  const ENDPOINTS = [
    'https://netflix.statuspage.io/api/v2/summary.json',
    'https://status.netflix.com/api/v2/summary.json',
    'https://statuspage.com/netflix/api/v2/summary.json'
  ];
  const container = document.getElementById('netflix-status');
  if(!container) return;

  const mapStatus = s => {
    if(!s) return 'unknown';
    s = s.toLowerCase();
    if(s.includes('operational')) return 'online';
    if(s.includes('degraded') || s.includes('partial')) return 'degraded';
    if(s.includes('major') || s.includes('outage') || s.includes('down')) return 'down';
    if(s.includes('maintenance')) return 'maintenance';
    return 'unknown';
  };

  function render(components){
    container.innerHTML='';
    if(!components.length){
      container.innerHTML = '<p class="muted">Keine Netflix-Komponenten gefunden.</p>';
      return;
    }
    components.forEach(c => {
      const el=document.createElement('div'); el.className='status-item';
      const name=document.createElement('div'); name.className='status-name'; name.textContent=c.name;
      const badge=document.createElement('span'); badge.className='status-badge '+mapStatus(c.status); badge.textContent=(c.status||'unknown').replace('_',' ');
      el.appendChild(name); el.appendChild(badge); container.appendChild(el);
    });
  }

  // small helper to escape text for insertion into simple HTML
  function escapeHtml(str){
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  async function tryFetch(url){
    try{
      const res = await fetch(url, {cache:'no-store'});
      if(!res.ok) throw new Error('HTTP '+res.status);
      const json = await res.json();
      return json;
    }catch(e){
      return null;
    }
  }

  async function fetchStatus(){
    container.innerHTML = '<p class="muted">Lade Status…</p>';
      // Vercel deployment base URL (use provided deployment)
      const VERCEL_BASE = 'https://serverwatch-qskejdd38-k4l1um-sudos-projects.vercel.app';

      // 1) Try Vercel serverless endpoint (live, CORS-enabled)
      try{
        const svc = await fetch(VERCEL_BASE + '/api/netflix', {cache:'no-store'});
        if(svc.ok){
          const j = await svc.json();
          const comps = (j.components||[]).filter(c => /netflix|playback|stream|video|account|login/i.test(c.name));
          if(comps.length){ render(comps); return; }
        } else {
          // upstream failed (e.g. 502) — try human-readable help page summary as fallback
          try{
            const res = await fetch(VERCEL_BASE + '/api/netflixstatus', {cache:'no-store'});
            if(res.ok){
              const h = await res.json();
              if(h && h.summary){
                container.innerHTML = '<div class="status-item"><div class="status-name">Netflix (help)</div><div class="status-badge unknown">'+escapeHtml(h.summary.slice(0,200))+'</div></div>';
                return;
              }
            }
          }catch(_){/* ignore */}
        }
      }catch(e){
        // fetch threw (network) — fallback to help page summary
        try{
          const res = await fetch(VERCEL_BASE + '/api/netflixstatus', {cache:'no-store'});
          if(res.ok){
            const h = await res.json();
            if(h && h.summary){
              container.innerHTML = '<div class="status-item"><div class="status-name">Netflix (help)</div><div class="status-badge unknown">'+escapeHtml(h.summary.slice(0,200))+'</div></div>';
              return;
            }
          }
        }catch(_){/* ignore */}
      }

    // 2) Try local cached data produced by CI (data/netflix.json)
    try{
      const local = await fetch('/data/netflix.json', {cache: 'no-store'});
      if(local.ok){
        const j = await local.json();
        const comps = (j.components||[]).filter(c => /netflix|playback|stream|video|account|login/i.test(c.name));
        if(comps.length){ render(comps); return; }
      }
    }catch(e){ /* ignore */ }

    // 3) First try direct client-side requests
    for(const url of ENDPOINTS){
      const data = await tryFetch(url);
      if(data && data.components){
        const comps = data.components.filter(c => /netflix|playback|stream|video|account|login/i.test(c.name));
        render(comps);
        return;
      }
    }

    // 4) Fallback: try proxy.php on same host (if available)
    for(const url of ENDPOINTS){
      try{
        const proxyUrl = '/proxy.php?url=' + encodeURIComponent(url);
        const res = await fetch(proxyUrl, {cache:'no-store'});
        if(!res.ok) continue;
        const data = await res.json();
        if(data && data.components){
          const comps = data.components.filter(c => /netflix|playback|stream|video|account|login/i.test(c.name));
          render(comps);
          return;
        }
      }catch(e){ /* continue */ }
    }

    container.innerHTML = '<p class="muted">Konnte Netflix-Status nicht ermitteln (kein Endpoint erreichbar).</p>';
  }

  // Fetch Netflix help page summary (is-netflix-down)
  async function fetchHelp(){
    const helpEl = document.getElementById('netflix-help');
    if(!helpEl) return;
    try{
      const res = await fetch(VERCEL_BASE + '/api/netflixstatus', {cache:'no-store'});
      if(!res.ok) return;
      const j = await res.json();
      if(j && j.summary){
        helpEl.textContent = j.summary;
      }
    }catch(e){ /* ignore */ }
  }

  fetchHelp();

  fetchStatus();
  setInterval(fetchStatus, 60*1000);
})();
