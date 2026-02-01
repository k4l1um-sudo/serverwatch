// World of Warcraft status: render a badge + link button
(function(){
  const container = document.getElementById('wow-status');
  if(!container) return;

  const STATUS_PAGE = 'https://worldofwarcraft.blizzard.com/de-de/game/status/eu';

  // WoW displayed like other services (no collapse toggle)

    function renderBadge(text, cls){
      // layout like Star Citizen: left name, right badge + button
      container.innerHTML = '';
    const el = document.createElement('div');
    el.className = 'status-item';

    const name = document.createElement('div');
    name.className = 'status-name';
    name.textContent = 'World of Warcraft';

    const right = document.createElement('div');
    right.style.display = 'flex';
    right.style.gap = '8px';

    const badge = document.createElement('div');
    badge.className = 'status-badge ' + cls;
    badge.textContent = text;

    const btn = document.createElement('a');
    btn.className = 'status-btn ' + cls;
    btn.href = STATUS_PAGE;
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.textContent = 'Statusseite';

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
      name.textContent = 'World of Warcraft';
      const right = document.createElement('div');
      right.style.display = 'flex';
      right.style.gap = '8px';
      const btn = document.createElement('a');
      btn.className = 'status-btn unknown';
      btn.href = STATUS_PAGE;
      btn.target = '_blank';
      btn.rel = 'noopener';
      btn.textContent = 'Offizielle Statusseite';
      right.appendChild(btn);
      el.appendChild(name);
      el.appendChild(right);
      container.appendChild(el);
  }

  async function update(){
    container.innerHTML = '<p class="muted">Lade Status…</p>';
    try{
      const res = await fetch(STATUS_PAGE, { cache: 'no-store' });
      if(!res.ok){ renderLink(); return; }
      const html = await res.text();
      const visible = html.replace(/<[^>]+>/g, ' ').toLowerCase();
      const keywordsOnline = ['verfügbar','online','operational','available','running'];
      const keywordsProblem = ['störung','ausfall','probleme','down','maintenance','wartung'];

      if(keywordsProblem.some(k => visible.includes(k))) {
        renderBadge('Probleme', 'down');
        return;
      }

      if(keywordsOnline.some(k => visible.includes(k))) {
        renderBadge('Online', 'online');
        return;
      }

      renderLink();
    }catch(e){
      renderLink();
    }
  }

  update();
  setInterval(update, 60*1000);
})();
