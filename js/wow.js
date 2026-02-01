// World of Warcraft status: render a badge + link button
(function(){
  const container = document.getElementById('wow-status');
  if(!container) return;

  const STATUS_PAGE = 'https://worldofwarcraft.com/de-de/status';

  function renderBadge(text, cls){
    container.innerHTML = '<div class="status-item"><div class="status-name">World of Warcraft</div><div class="status-badge ' + cls + '">' + text + '</div></div>' +
      '<p><a class="status-btn ' + cls + '" href="' + STATUS_PAGE + '" target="_blank" rel="noopener">Offizielle Statusseite</a></p>';
  }

  function showLink(){
    container.innerHTML = '<p><a class="status-btn unknown" href="' + STATUS_PAGE + '" target="_blank" rel="noopener">Offizielle Statusseite</a></p>';
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
