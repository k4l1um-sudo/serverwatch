
// Netflix: render a simple name + button layout linking to the official help page
(function(){
  const container = document.getElementById('netflix-status');
  if(!container) return;

  const EXTERNAL_URL = 'https://help.netflix.com/de/is-netflix-down';

  function renderLink(){
    container.innerHTML = '';
    const el = document.createElement('div');
    el.className = 'status-item';

    const name = document.createElement('div');
    name.className = 'status-name';
    name.textContent = 'Netflix';

    const badge = document.createElement('span');
    badge.className = 'status-badge unknown';
    badge.textContent = 'Info';

    el.appendChild(name);
    el.appendChild(badge);
    container.appendChild(el);
  }

  renderLink();
})();
