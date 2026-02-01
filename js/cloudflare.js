// Cloudflare status panel — fetches https://www.cloudflarestatus.com/api/v2/summary.json
(function(){
  const ENDPOINT = 'https://www.cloudflarestatus.com/api/v2/summary.json';
  const container = document.getElementById('cloudflare-status');
  const section = document.getElementById('cloudflare');
  const toggle = document.getElementById('cloudflare-toggle');
  if(!container || !section || !toggle) return;

  let pollTimer = null;
  const POLL_MS = 5 * 60 * 1000; // 5 minutes

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
      const comps = j.components || [];
      render(comps);
    }catch(err){
      container.innerHTML = '<p class="muted">Fehler beim Laden: ' + (err.message||err) + '</p>';
      console.error('Cloudflare status error', err);
    }
  }

  function startPolling(){
    if(pollTimer) return;
    fetchStatus();
    pollTimer = setInterval(fetchStatus, POLL_MS);
  }

  function stopPolling(){
    if(!pollTimer) return;
    clearInterval(pollTimer);
    pollTimer = null;
  }

  // initial collapsed state: container hidden (index.html sets display:none)
  toggle.addEventListener('click', ()=>{
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    if(expanded){
      // collapse
      container.style.display = 'none';
      toggle.textContent = '+';
      toggle.setAttribute('aria-expanded','false');
      section.classList.add('collapsed');
      stopPolling();
    }else{
      // expand
      container.style.display = '';
      toggle.textContent = '-';
      toggle.setAttribute('aria-expanded','true');
      section.classList.remove('collapsed');
      startPolling();
    }
  });

  // do not start polling until expanded by user; keep collapsed by default
})();
