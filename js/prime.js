// Amazon Prime Video status: show link and placeholder
(function(){
  const container = document.getElementById('prime-status');
  if(!container) return;

  const STATUS_PAGE = 'https://www.amazon.de/gp/help/customer/display.html?nodeId=201910060';

  function showLink(){
    container.innerHTML = '<p>Offizielle Hilfe/Status: <a href="' + STATUS_PAGE + '" target="_blank" rel="noopener">' + STATUS_PAGE + '</a></p>';
  }

  async function update(){
    container.innerHTML = '<p class="muted">Lade Status…</p>';
    showLink();
  }

  update();
  setInterval(update, 60*1000);
})();
