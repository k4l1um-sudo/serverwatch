// World of Warcraft status: render a badge + link button
(function(){
  const container = document.getElementById('wow-status');
  if(!container) return;

  const STATUS_PAGE = 'https://worldofwarcraft.blizzard.com/de-de/game/status/eu';

  // WoW displayed like other services (no collapse toggle)

    function renderBadge(text, cls){
      container.innerHTML = '';
      const el = document.createElement('div');
      el.className = 'status-item';

      const name = document.createElement('div');
      name.className = 'status-name';
      name.textContent = 'World of Warcraft';

      const badge = document.createElement('span');
      badge.className = 'status-badge ' + cls;
      badge.textContent = text;

      el.appendChild(name);
      el.appendChild(badge);
      container.appendChild(el);
  }

    function renderLink(){
      container.innerHTML = '';
      const el = document.createElement('div');
      el.className = 'status-item';
      const name = document.createElement('div');
      name.className = 'status-name';
      name.textContent = 'World of Warcraft';
      const badge = document.createElement('span');
      badge.className = 'status-badge unknown';
      badge.textContent = 'Info';
      el.appendChild(name);
      el.appendChild(badge);
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
