// Cloudflare status panel — fetches https://www.cloudflarestatus.com/api/v2/summary.json
(function(){
  const ENDPOINT = 'https://www.cloudflarestatus.com/api/v2/summary.json';
  const container = document.getElementById('cloudflare-status');
  if(!container) return;

  const mapStatus = s => {
    if(!s) return 'unknown';
    s = s.toLowerCase();
    if(s.includes('operational')) return 'online';
    if(s.includes('degraded') || s.includes('partial')) return 'degraded';
    if(s.includes('major') || s.includes('outage')) return 'down';
    if(s.includes('maintenance') || s.includes('under_maintenance')) return 'maintenance';
    return 'unknown';
  };

  function render(components){
    container.innerHTML = '';
    if(!components || !components.length){
      container.innerHTML = '<p class="muted">Keine Cloudflare-Komponenten gefunden.</p>';
      return;
    }

    components.forEach(c => {
      const el = document.createElement('div');
      el.className = 'status-item';

      const name = document.createElement('div');
      name.className = 'status-name';
      name.textContent = c.name || 'Komponente';

      const badge = document.createElement('span');
      const cls = mapStatus(c.status);
      badge.className = 'status-badge ' + cls;
      badge.textContent = (c.status || 'unknown').replace(/_/g,' ');

      el.appendChild(name);
      el.appendChild(badge);
      container.appendChild(el);
    });
  }

  async function fetchStatus(){
    container.innerHTML = '<p class="muted">Lade Status…</p>';
    try{
      const res = await fetch(ENDPOINT, { cache: 'no-store' });
      if(!res.ok) throw new Error('HTTP ' + res.status);
      const j = await res.json();
      // the API returns components array
      const comps = j.components || [];
      render(comps);
    }catch(err){
      container.innerHTML = '<p class="muted">Fehler beim Laden: ' + (err.message||err) + '</p>';
      console.error('Cloudflare status error', err);
    }
  }

  fetchStatus();
  setInterval(fetchStatus, 60*1000);
})();
