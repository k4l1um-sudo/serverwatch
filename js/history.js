(function () {
  const API_URL = 'api/quest.php';
  const PLAYER_STORAGE_KEY = 'serverwatch_quest_player_id';

  function getOrCreatePlayerId() {
    const existing = localStorage.getItem(PLAYER_STORAGE_KEY);
    if (existing && /^[a-zA-Z0-9_-]{4,40}$/.test(existing)) {
      return existing;
    }
    const id = 'kid_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(PLAYER_STORAGE_KEY, id);
    return id;
  }

  function formatDate(value) {
    if (!value) {
      return '-';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '-';
    }
    return date.toLocaleDateString('de-DE') + ' ' + date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }

  function createHistoryCard(quest) {
    const wrapper = document.createElement('article');
    wrapper.className = 'quest-accordion';

    const header = document.createElement('div');
    header.className = 'quest-accordion-header';

    const main = document.createElement('div');
    main.className = 'quest-accordion-main';

    const textWrap = document.createElement('div');
    textWrap.className = 'quest-main-text';

    const title = document.createElement('h4');
    title.className = 'quest-title';
    title.textContent = quest.title || 'Ohne Titel';

    const idLine = document.createElement('p');
    idLine.className = 'quest-id';
    idLine.textContent = 'Quest-ID: ' + String(quest.catalogId || quest.id || '-');

    const time = document.createElement('p');
    time.className = 'quest-time';
    time.textContent = 'Erledigt: ' + formatDate(quest.completedAt);

    const ep = document.createElement('span');
    ep.className = 'quest-ep';
    ep.textContent = String(Number(quest.rewardXp) || 0) + ' EP';

    textWrap.appendChild(title);
    textWrap.appendChild(idLine);
    textWrap.appendChild(time);
    main.appendChild(textWrap);
    main.appendChild(ep);

    const actions = document.createElement('div');
    actions.className = 'quest-actions';

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'quest-toggle-btn';
    toggleButton.textContent = 'Details';
    actions.appendChild(toggleButton);

    header.appendChild(main);
    header.appendChild(actions);

    const body = document.createElement('div');
    body.className = 'quest-accordion-body';
    body.hidden = true;

    const description = document.createElement('p');
    description.className = 'quest-meta';
    description.textContent = quest.description || 'Keine Beschreibung vorhanden.';
    body.appendChild(description);

    toggleButton.addEventListener('click', function () {
      body.hidden = !body.hidden;
      toggleButton.textContent = body.hidden ? 'Details' : 'Weniger';
    });

    wrapper.appendChild(header);
    wrapper.appendChild(body);
    return wrapper;
  }

  async function loadHistory() {
    const playerId = getOrCreatePlayerId();
    const response = await fetch(API_URL + '?action=get_state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: playerId })
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Historie konnte nicht geladen werden.');
    }

    const quests = Array.isArray(data.player.quests) ? data.player.quests : [];
    const completed = quests
      .filter(function (q) { return q.completed; })
      .sort(function (a, b) {
        const aDate = new Date(a.completedAt || 0).getTime();
        const bDate = new Date(b.completedAt || 0).getTime();
        return bDate - aDate;
      });

    const summary = document.getElementById('history-summary');
    if (summary) {
      summary.textContent = completed.length + ' Quest(s) erledigt.';
    }

    const list = document.getElementById('history-list');
    if (!list) {
      return;
    }

    if (completed.length === 0) {
      list.innerHTML = '<p class="muted">Noch keine erledigten Quests vorhanden.</p>';
      return;
    }

    list.innerHTML = '';
    completed.forEach(function (quest) {
      list.appendChild(createHistoryCard(quest));
    });
  }

  loadHistory().catch(function (err) {
    const summary = document.getElementById('history-summary');
    if (summary) {
      summary.textContent = 'Fehler: ' + err.message;
    }
  });
})();
