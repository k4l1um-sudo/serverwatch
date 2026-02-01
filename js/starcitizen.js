// Star Citizen: simple button link rendered like other services
(function(){
  const container = document.getElementById('starcitizen-status');
  if(!container) return;

  const PAGE = 'https://robertsspaceindustries.com/';

  function render(){
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

  render();
})();
