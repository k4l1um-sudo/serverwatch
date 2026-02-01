// Netflix status client: try direct fetch of help.netflix.com, fallback to server endpoints on CORS
(function(){
  const container = document.getElementById('netflix-status');
  if(!container) return;

  function renderOk(){
    container.innerHTML = '<div class="status-item"><div class="status-name">Netflix</div><div class="status-badge online">OK</div></div>';
  }

  function renderDown(){
    container.innerHTML = '<div class="status-item"><div class="status-name">Netflix</div><div class="status-badge down">Nicht erreichbar</div></div>';
  }

  const EXTERNAL_URL = 'https://help.netflix.com/de/is-netflix-down';

  async function update(){
    container.innerHTML = '<p class="muted">Lade Status…</p>';
    try{
      const res = await fetch(EXTERNAL_URL, { cache: 'no-store' });
      if(!res.ok){
        // can't fetch the page — show link
        container.innerHTML = '<p>Direkte Abfrage nicht möglich. Siehe <a href="' + EXTERNAL_URL + '" target="_blank" rel="noopener">Statusseite</a></p>';
        return;
      }
      const html = await res.text();
      const visible = html.replace(/<[^>]+>/g, ' ');
      const phrase = 'Netflix ist verfügbar';
      if(visible.includes(phrase)) { renderOk(); }
      else { renderDown(); }
    }catch(err){
      // likely CORS or network error — show link only
      container.innerHTML = '<p>Direkte Abfrage blockiert. Siehe <a href="' + EXTERNAL_URL + '" target="_blank" rel="noopener">Statusseite</a></p>';
    }
  }

  update();
  setInterval(update, 60*1000);
})();
            if(!res.ok){
