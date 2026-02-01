// World of Warcraft status: show link and attempt a lightweight fetch if possible
(function(){
  const container = document.getElementById('wow-status');
  if(!container) return;

  const STATUS_PAGE = 'https://worldofwarcraft.com/de-de/status';

  function showLink(){
    container.innerHTML = '<p>Offizielle Statusseite: <a href="' + STATUS_PAGE + '" target="_blank" rel="noopener">' + STATUS_PAGE + '</a></p>';
  }

  function renderStatus(text, cls){
    container.innerHTML = '<div class="status-item"><div class="status-name">World of Warcraft</div><div class="status-badge ' + cls + '">' + text + '</div></div>';
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

      if(keywordsOnline.some(k => visible.includes(k)) && !keywordsProblem.some(k => visible.includes(k))) {
        renderStatus('Online', 'online');
        return;
      }

      if(keywordsProblem.some(k => visible.includes(k))) {
        renderStatus('Probleme', 'down');
        return;
      }

      // Fallback: reachable but no clear keywords
      showLink();
    }catch(e){
      // CORS or network error — show link only
      showLink();
    }
  }

  update();
  setInterval(update, 60*1000);
})();
