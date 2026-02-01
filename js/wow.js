// World of Warcraft status: render a badge + link button
(function(){
  const container = document.getElementById('wow-status');
  if(!container) return;

  const STATUS_PAGE = 'https://worldofwarcraft.com/de-de/status';

  function renderBadge(text, cls){
    // layout like Fortnite: left name, right badge/button
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

  function showLink(){
    container.innerHTML = '';
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.className = 'status-btn unknown';
    a.href = STATUS_PAGE;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = 'Offizielle Statusseite';
    p.appendChild(a);
    container.appendChild(p);
  }

  async function update(){
    container.innerHTML = '<p class="muted">Lade Status…</p>';
    try{
      const res = await fetch(STATUS_PAGE, { cache: 'no-store' });
      if(!res.ok){ showLink(); return; }
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

      showLink();
    }catch(e){
      showLink();
    }
  }

  update();
  setInterval(update, 60*1000);
})();
