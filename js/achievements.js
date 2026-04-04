(function () {
  const API_URL = 'api/quest.php';
  const ACHIEVEMENT_API_URL = 'api/achievement_items.php';
  const PLAYER_STORAGE_KEY = 'serverwatch_quest_player_id';

  const DEFAULT_ACHIEVEMENTS = [
    { id: 'ach_beginner_1', title: 'Beginner', target: 1, image: 'assets/avatars/beginner.png' },
    { id: 'ach_holz_10', title: 'Holz', target: 10, image: 'assets/avatars/holz.png' },
    { id: 'ach_silber_50', title: 'Silber', target: 50, image: 'assets/avatars/silber.png' },
    { id: 'ach_gold_200', title: 'Gold', target: 200, image: 'assets/avatars/gold.png' },
    { id: 'ach_elite_400', title: 'Elite', target: 400, image: 'assets/avatars/elite.png' },
    { id: 'ach_smaragd_600', title: 'Smaragd', target: 600, image: 'assets/avatars/smaragd.png' },
    { id: 'ach_rubin_800', title: 'Rubin', target: 800, image: 'assets/avatars/rubin.png' },
    { id: 'ach_diamant_1000', title: 'Diamant', target: 1000, image: 'assets/avatars/diamant.png' },
    { id: 'ach_meister_1500', title: 'Meister', target: 1500, image: 'assets/avatars/meister.png' },
    { id: 'ach_grossmeister_2000', title: 'Grossmeister', target: 2000, image: 'assets/avatars/grossmeister.png' }
  ];

  function getOrCreatePlayerId() {
    const existing = localStorage.getItem(PLAYER_STORAGE_KEY);
    if (existing && /^[a-zA-Z0-9_-]{4,40}$/.test(existing)) {
      return existing;
    }
    const id = 'kid_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(PLAYER_STORAGE_KEY, id);
    return id;
  }

  async function loadAchievementCatalog() {
    try {
      const response = await fetch(ACHIEVEMENT_API_URL, { method: 'GET' });
      const data = await response.json();
      if (!response.ok || !data.ok || !Array.isArray(data.items)) {
        return DEFAULT_ACHIEVEMENTS.slice();
      }

      const cleaned = data.items
        .map(function (item) {
          return {
            id: String(item && item.id ? item.id : ''),
            title: String(item && item.title ? item.title : ''),
            target: Number(item && item.target),
            image: String(item && item.image ? item.image : 'assets/avatar-placeholder.svg')
          };
        })
        .filter(function (item) {
          return item.id && item.title && Number.isFinite(item.target) && item.target > 0;
        })
        .sort(function (a, b) { return a.target - b.target; });

      return cleaned.length ? cleaned : DEFAULT_ACHIEVEMENTS.slice();
    } catch (e) {
      return DEFAULT_ACHIEVEMENTS.slice();
    }
  }

  function buildAchievements(player, catalogItems) {
    const quests = Array.isArray(player.quests) ? player.quests : [];
    const completedCount = quests.filter(function (q) { return q.completed; }).length;
    const items = Array.isArray(catalogItems) ? catalogItems : [];

    return items.map(function (entry) {
      const target = Number(entry.target) || 0;
      const title = entry.title || ('Meilenstein ' + target);

      return {
        id: entry.id || ('quests_' + target),
        title: title,
        target: target,
        progress: completedCount,
        description: 'Erledige insgesamt ' + target + ' Quest(s), um das Profilbild ' + title + ' freizuschalten.',
        done: completedCount >= target,
        image: entry.image || 'assets/avatar-placeholder.svg'
      };
    });
  }

  function createAchievementPathNode(item, index, isCurrent) {
    const done = !!item.done;

    const node = document.createElement('article');
    node.className = 'achievement-path-node ' + (done ? 'done' : 'open') + (isCurrent ? ' current' : '');

    const step = document.createElement('span');
    step.className = 'achievement-step';
    step.textContent = '#' + (index + 1);

    const point = document.createElement('div');
    point.className = 'achievement-point';

    const img = document.createElement('img');
    img.className = 'achievement-path-image';
    img.src = item.image || 'assets/avatar-placeholder.svg';
    img.alt = item.title + ' Profilbild';
    img.loading = 'lazy';
    img.addEventListener('error', function () {
      img.src = 'assets/avatar-placeholder.svg';
    });
    point.appendChild(img);

    const target = document.createElement('p');
    target.className = 'achievement-target';
    target.textContent = item.target + ' Quests';

    const title = document.createElement('h4');
    title.className = 'achievement-path-title';
    title.textContent = item.title;

    const state = document.createElement('span');
    state.className = done ? 'achievement-state done' : 'achievement-state open';
    state.textContent = done ? 'Errungen' : 'Offen';

    if (isCurrent) {
      const marker = document.createElement('span');
      marker.className = 'achievement-current-marker';
      marker.textContent = 'Naechstes Ziel';
      node.appendChild(marker);
    }

    node.appendChild(step);
    node.appendChild(point);
    node.appendChild(target);
    node.appendChild(title);
    node.appendChild(state);

    return node;
  }

  function renderPath(container, items) {
    if (!container) {
      return;
    }

    container.innerHTML = '';
    if (items.length === 0) {
      const p = document.createElement('p');
      p.className = 'muted';
      p.textContent = 'Keine Achievements vorhanden.';
      container.appendChild(p);
      return;
    }

    const rail = document.createElement('div');
    rail.className = 'achievement-rail';

    const doneCount = items.filter(function (item) { return !!item.done; }).length;
    const progressPercent = items.length > 0
      ? Math.round((doneCount / items.length) * 100)
      : 0;
    rail.style.setProperty('--achievement-progress', progressPercent + '%');

    const currentOpenIndex = items.findIndex(function (item) { return !item.done; });

    items.forEach(function (item, index) {
      rail.appendChild(createAchievementPathNode(item, index, index === currentOpenIndex));
    });

    container.appendChild(rail);
  }

  async function loadAchievements() {
    const playerId = getOrCreatePlayerId();
    const statePromise = fetch(API_URL + '?action=get_state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: playerId })
    });
    const catalogPromise = loadAchievementCatalog();

    const response = await statePromise;
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Achievements konnten nicht geladen werden.');
    }
    const catalogItems = await catalogPromise;

    const achievements = buildAchievements(data.player, catalogItems);
    const done = achievements.filter(function (a) { return a.done; }).length;

    const summary = document.getElementById('achievement-summary');
    if (summary) {
      summary.textContent = done + ' von ' + achievements.length + ' Achievements errungen.';
    }

    renderPath(document.getElementById('achievement-path'), achievements);
  }

  loadAchievements().catch(function (err) {
    const summary = document.getElementById('achievement-summary');
    if (summary) {
      summary.textContent = 'Fehler: ' + err.message;
    }
  });
})();
