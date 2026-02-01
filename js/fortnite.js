// Fetch Fortnite-related components from Epic Games Statuspage and render statuses
(function(){
  const ENDPOINT = 'https://status.epicgames.com/api/v2/summary.json';
  const container = document.getElementById('fortnite-status');

  if(!container) return;

  const mapStatus = s => {
    // possible statuses from statuspage: operational, degraded_performance, partial_outage, major_outage, under_maintenance
    if(!s) return 'unknown';
    s = s.toLowerCase();
    if(s.includes('operational')) return 'online';
    if(s.includes('degraded') || s.includes('partial')) return 'degraded';
    if(s.includes('major') || s.includes('outage')) return 'down';
    if(s.includes('maintenance')) return 'maintenance';
    return 'unknown';
  };

  function render(components){
    container.innerHTML = '';
    if(!components.length){
      container.innerHTML = '<p class="muted">Keine Fortnite-Komponenten gefunden.</p>';
      return;
    }

    components.forEach(c => {
      const el = document.createElement('div');
      el.className = 'status-item';
      const badge = document.createElement('span');
      badge.className = 'status-badge ' + mapStatus(c.status);
      badge.textContent = (c.status||'unknown').replace('_',' ');

      const name = document.createElement('div');
      name.className = 'status-name';
      name.textContent = c.name;

      el.appendChild(name);
      el.appendChild(badge);
      container.appendChild(el);
    });
  }

  async function fetchStatus(){
    try{
      const res = await fetch(ENDPOINT, {cache: 'no-store'});
      if(!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      const comps = (json.components||[]).filter(c => /fortnite/i.test(c.name));
      render(comps);
    }catch(err){
      container.innerHTML = '<p class="muted">Fehler beim Laden: '+(err.message||err)+'</p>';
      console.error('Fortnite status error', err);
    }
  }

  // initial fetch + poll every 60s
  fetchStatus();
  setInterval(fetchStatus, 60*1000);
})();
