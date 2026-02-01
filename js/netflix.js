// Simple Netflix status client: calls /api/netflixstatus and shows OK / unreachable
(function(){
  const container = document.getElementById('netflix-status');
  if(!container) return;

  function renderOk(){
    container.innerHTML = '<div class="status-item"><div class="status-name">Netflix</div><div class="status-badge online">OK</div></div>';
  }

  function renderDown(){
    container.innerHTML = '<div class="status-item"><div class="status-name">Netflix</div><div class="status-badge down">Nicht erreichbar</div></div>';
  }

  async function update(){
    container.innerHTML = '<p class="muted">Lade Status…</p>';
    try{
      const res = await fetch('/api/netflixstatus', {cache: 'no-store'});
      if(!res.ok){ renderDown(); return; }
      const j = await res.json();
      // Expect { available: true|false, summary: '...' }
      if(j && j.available === true){ renderOk(); }
      else { renderDown(); }
    }catch(e){ renderDown(); }
  }

  update();
  setInterval(update, 60*1000);
})();
// Netflix integration removed. See commit history for prior implementation.
console.info('Netflix integration removed: js/netflix.js is now a stub.');
