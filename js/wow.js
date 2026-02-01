// World of Warcraft status: show link and attempt a lightweight fetch if possible
(function(){
  const container = document.getElementById('wow-status');
  if(!container) return;

  const STATUS_PAGE = 'https://worldofwarcraft.com/de-de/support';

  function showLink(){
    container.innerHTML = '<p>Offizielle Status/Supportseite: <a href="' + STATUS_PAGE + '" target="_blank" rel="noopener">' + STATUS_PAGE + '</a></p>';
  }

  async function update(){
    container.innerHTML = '<p class="muted">Lade Status…</p>';
    // No reliable public status API used here — show link as primary information.
    showLink();
  }

  update();
  setInterval(update, 60*1000);
})();
