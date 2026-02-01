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

    // 1) Try local cached data produced by CI (data/netflix.json)
    try{
      const local = await fetch('/data/netflix.json', {cache: 'no-store'});
      if(local.ok){
        const j = await local.json();
        const comps = (j.components||[]).filter(c => /netflix|playback|stream|video|account|login/i.test(c.name));
        if(comps.length){ render(comps); return; }
      }
    }catch(e){ /* ignore */ }

    // 2) First try direct client-side requests
    for(const url of ENDPOINTS){
      const data = await tryFetch(url);
      if(data && data.components){
        const comps = data.components.filter(c => /netflix|playback|stream|video|account|login/i.test(c.name));
        render(comps);
        return;
      }
    }

    // 3) If direct requests fail (likely CORS), try proxying via proxy.php on the same host
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
      }catch(e){
        // continue to next
      }
    }

    container.innerHTML = '<p class="muted">Konnte Netflix-Status nicht ermitteln (CORS oder kein passender Endpoint).</p>';
  }

  fetchStatus();
  setInterval(fetchStatus, 60*1000);
})();
