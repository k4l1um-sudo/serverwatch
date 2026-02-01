// Star Citizen: try client-side status fetch (statuspage API -> HTML heuristics), else link
(async function(){
  const container = document.getElementById('starcitizen-status');
  if(!container) return;

  const PAGE = 'https://robertsspaceindustries.com/';
  const API = 'https://robertsspaceindustries.statuspage.io/api/v2/summary.json';

  function renderBadge(text, cls){
    container.innerHTML = '';
    const el = document.createElement('div');
    el.className = 'status-item';

    const name = document.createElement('div');
    name.className = 'status-name';
    name.textContent = 'Star Citizen';

    const right = document.createElement('div');
    right.style.display = 'flex';
    right.style.gap = '8px';

    const badge = document.createElement('div');
    badge.className = 'status-badge ' + cls;
    badge.textContent = text;

    const btn = document.createElement('a');
    btn.className = 'status-btn ' + cls;
    btn.href = PAGE;
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.textContent = 'Offizielle Seite';

    right.appendChild(badge);
    right.appendChild(btn);

    el.appendChild(name);
    el.appendChild(right);
    container.appendChild(el);
  }

  function renderLink(){
    container.innerHTML = '';
    const el = document.createElement('div');
    el.className = 'status-item';
    const name = document.createElement('div');
    name.className = 'status-name';
    name.textContent = 'Star Citizen';
    const right = document.createElement('div');
    right.style.display = 'flex';
    right.style.gap = '8px';
    const btn = document.createElement('a');
    btn.className = 'status-btn unknown';
    btn.href = PAGE;
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.textContent = 'Offizielle Seite';
    right.appendChild(btn);
    el.appendChild(name);
    el.appendChild(right);
    container.appendChild(el);
  }

  container.innerHTML = '<p class="muted">Lade Status…</p>';

  // 1) Try statuspage API
  try{
    const res = await fetch(API, { cache: 'no-store' });
    if(res.ok){
      const j = await res.json();
      const indicator = j.status && j.status.indicator ? j.status.indicator : null;
      const desc = j.status && j.status.description ? j.status.description : 'Status verfügbar';
      if(indicator === 'none') return renderBadge('Online', 'online');
      if(indicator === 'minor') return renderBadge(desc || 'Eingeschränkt', 'degraded');
      if(indicator === 'major') return renderBadge(desc || 'Ausfall', 'down');
      return renderBadge(desc, 'unknown');
    }
  }catch(e){
    // ignore and fall back
  }

  // 2) Try a lightweight fetch of the main page and look for keywords
  try{
    const res2 = await fetch(PAGE, { cache: 'no-store' });
    if(res2.ok){
      const html = await res2.text();
      const visible = html.replace(/<[^>]+>/g, ' ').toLowerCase();
      const keywordsOnline = ['online','operational','available','running'];
      const keywordsProblem = ['down','offline','maintenance','störung','ausfall','probleme'];
      if(keywordsProblem.some(k => visible.includes(k))) return renderBadge('Probleme', 'down');
      if(keywordsOnline.some(k => visible.includes(k))) return renderBadge('Online', 'online');
    }
  }catch(e){
    // probably CORS or network error
  }

  // fallback: just show link button
  renderLink();

})();
