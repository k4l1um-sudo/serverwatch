(function () {
  const API_URL = 'api/quest.php';
  const PLAYER_STORAGE_KEY = 'serverwatch_quest_player_id';

  const elements = {
    playerId: document.getElementById('player-id'),
    levelNumber: document.getElementById('level-number'),
    xpTotal: document.getElementById('xp-total'),
    levelProgress: document.getElementById('level-progress'),
    levelProgressText: document.getElementById('level-progress-text'),
    questForm: document.getElementById('quest-form'),
    questTitle: document.getElementById('quest-title'),
    questReward: document.getElementById('quest-reward'),
    questList: document.getElementById('quest-list'),
    refreshBtn: document.getElementById('refresh-btn'),
    resetBtn: document.getElementById('reset-btn')
  };

  function getOrCreatePlayerId() {
    const existing = localStorage.getItem(PLAYER_STORAGE_KEY);
    if (existing && /^[a-zA-Z0-9_-]{4,40}$/.test(existing)) {
      return existing;
    }

    const random = Math.random().toString(36).slice(2, 10);
    const id = 'kid_' + random;
    localStorage.setItem(PLAYER_STORAGE_KEY, id);
    return id;
  }

  const playerId = getOrCreatePlayerId();
  elements.playerId.textContent = 'Spieler-ID: ' + playerId;

  async function request(action, payload) {
    const response = await fetch(API_URL + '?action=' + encodeURIComponent(action), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ player_id: playerId }, payload || {}))
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Unbekannter Fehler');
    }
    return data;
  }

  function renderState(player) {
    elements.levelNumber.textContent = String(player.level);
    elements.xpTotal.textContent = String(player.xp);

    const progressPercent = Math.max(0, Math.min(100, (player.xpInLevel / player.xpForNextLevel) * 100));
    elements.levelProgress.style.width = progressPercent + '%';
    elements.levelProgressText.textContent = player.xpInLevel + ' / ' + player.xpForNextLevel + ' XP';

    const quests = Array.isArray(player.quests) ? player.quests : [];
    if (quests.length === 0) {
      elements.questList.innerHTML = '<p class="muted">Noch keine Quests vorhanden.</p>';
      return;
    }

    const html = quests
      .slice()
      .reverse()
      .map(function (quest) {
        const statusText = quest.completed ? 'Erledigt' : 'Offen';
        const button = quest.completed
          ? ''
          : '<button class="chip" data-complete-id="' + quest.id + '">Als erledigt markieren</button>';

        return (
          '<article class="quest-item">' +
            '<div class="quest-head">' +
              '<div>' +
                '<h4 class="quest-title">' + escapeHtml(quest.title) + '</h4>' +
                '<p class="quest-meta">Belohnung: ' + Number(quest.rewardXp) + ' XP | Status: ' + statusText + '</p>' +
              '</div>' +
              button +
            '</div>' +
          '</article>'
        );
      })
      .join('');

    elements.questList.innerHTML = html;

    const completeButtons = elements.questList.querySelectorAll('[data-complete-id]');
    completeButtons.forEach(function (button) {
      button.addEventListener('click', async function () {
        const id = button.getAttribute('data-complete-id');
        if (!id) {
          return;
        }
        button.disabled = true;
        try {
          const result = await request('complete_quest', { questId: id });
          renderState(result.player);
        } catch (err) {
          alert('Quest konnte nicht abgeschlossen werden: ' + err.message);
          button.disabled = false;
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async function loadState() {
    elements.questList.innerHTML = '<p class="muted">Lade Quests...</p>';
    try {
      const result = await request('get_state');
      renderState(result.player);
    } catch (err) {
      elements.questList.innerHTML = '<p class="muted">Fehler: ' + escapeHtml(err.message) + '</p>';
    }
  }

  elements.questForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const title = elements.questTitle.value.trim();
    const rewardXp = Number(elements.questReward.value);

    if (!title) {
      alert('Bitte einen Quest-Titel eingeben.');
      return;
    }

    try {
      const result = await request('create_quest', { title: title, rewardXp: rewardXp });
      elements.questTitle.value = '';
      renderState(result.player);
    } catch (err) {
      alert('Quest konnte nicht gespeichert werden: ' + err.message);
    }
  });

  elements.refreshBtn.addEventListener('click', function () {
    loadState();
  });

  elements.resetBtn.addEventListener('click', async function () {
    const ok = window.confirm('Wirklich den kompletten Spielstand zuruecksetzen?');
    if (!ok) {
      return;
    }

    try {
      const result = await request('reset_player');
      renderState(result.player);
    } catch (err) {
      alert('Reset fehlgeschlagen: ' + err.message);
    }
  });

  loadState();
})();
