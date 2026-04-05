(function () {
  const DASHBOARD_ID = 'landing-player-dashboard';
  const QUEST_API_URL = 'api/quest.php';
  const ACHIEVEMENT_API_URL = 'api/achievement_items.php';
  const PLAYER_STORAGE_KEY = 'serverwatch_quest_player_id';
  const SHARED_PLAYER_ID = 'kid_shared_main';

  function getPlayerId() {
    const stored = String(localStorage.getItem(PLAYER_STORAGE_KEY) || '').trim();
    if (stored) {
      return stored;
    }
    localStorage.setItem(PLAYER_STORAGE_KEY, SHARED_PLAYER_ID);
    return SHARED_PLAYER_ID;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async function loadPlayer() {
    const response = await fetch(QUEST_API_URL + '?action=get_state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: getPlayerId() })
    });
    const data = await response.json();
    if (!response.ok || !data.ok || !data.player) {
      throw new Error((data && data.error) || 'Spielerstatus konnte nicht geladen werden.');
    }
    return data.player;
  }

  async function loadAchievementItems() {
    const response = await fetch(ACHIEVEMENT_API_URL, { method: 'GET' });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error((data && data.error) || 'Achievement-Pfad konnte nicht geladen werden.');
    }
    return Array.isArray(data.items) ? data.items : [];
  }

  function getCurrentRank(items, completedCount) {
    const sorted = items
      .filter(function (item) {
        return item && item.active !== false && Number(item.target) > 0;
      })
      .slice()
      .sort(function (a, b) {
        return (Number(a.target) || 0) - (Number(b.target) || 0);
      });

    if (!sorted.length) {
      return null;
    }

    let current = sorted[0];
    sorted.forEach(function (item) {
      if ((Number(completedCount) || 0) >= (Number(item.target) || 0)) {
        current = item;
      }
    });

    return current;
  }

  function renderDashboard(container, player, rankItem) {
    const name = String(player && player.name ? player.name : 'Spieler');
    const level = Math.max(1, Number(player && player.level) || 1);
    const xpInLevel = Math.max(0, Number(player && player.xpInLevel) || 0);
    const xpForNext = Math.max(1, Number(player && player.xpForNextLevel) || 1);
    const coins = Math.max(0, Number(player && player.coins) || 0);
    const completedQuests = Math.max(0, Number(player && player.completedQuestCount) || 0);

    const profileImg =
      (player && player.profileImage && player.profileImage.image)
      || (rankItem && rankItem.image)
      || 'assets/questio-logo.png';

    const rankTitle = rankItem && rankItem.title ? String(rankItem.title) : 'Noch kein Rang';
    const rankTarget = Math.max(0, Number(rankItem && rankItem.target) || 0);
    const rankImg = (rankItem && rankItem.image) ? String(rankItem.image) : 'assets/questio-logo.png';

    container.innerHTML =
      '<div class="landing-dashboard-grid">' +
        '<article class="landing-dashboard-card">' +
          '<div class="landing-dashboard-head">' +
            '<img class="landing-dashboard-avatar" src="' + escapeHtml(profileImg) + '" alt="Profilbild" loading="lazy">' +
            '<div>' +
              '<p class="landing-dashboard-name">' + escapeHtml(name) + '</p>' +
              '<p class="landing-dashboard-level">Level ' + escapeHtml(level) + '</p>' +
              '<p class="quest-meta">EP: ' + escapeHtml(xpInLevel) + ' / ' + escapeHtml(xpForNext) + '</p>' +
            '</div>' +
          '</div>' +
          '<div class="reward-progress-wrap" aria-label="EP Fortschritt">' +
            '<div class="reward-progress-bar reward-progress-level_up" style="width:' + escapeHtml(Math.max(0, Math.min(100, (xpInLevel / xpForNext) * 100)).toFixed(1)) + '%"></div>' +
          '</div>' +
          '<div class="landing-dashboard-stats">' +
            '<div class="landing-stat-chip"><strong>' + escapeHtml(coins) + '</strong><span>Coins</span></div>' +
            '<div class="landing-stat-chip"><strong>' + escapeHtml(completedQuests) + '</strong><span>Erledigte Quests</span></div>' +
            '<div class="landing-stat-chip"><strong>' + escapeHtml(level) + '</strong><span>Aktuelles Level</span></div>' +
          '</div>' +
        '</article>' +
        '<article class="landing-dashboard-card">' +
          '<img class="landing-rank-image" src="' + escapeHtml(rankImg) + '" alt="Rangbild" loading="lazy">' +
          '<h4 class="landing-rank-title">Rang im Pfad: ' + escapeHtml(rankTitle) + '</h4>' +
          '<p class="landing-rank-meta">Freischaltung bei ' + escapeHtml(rankTarget || '-') + ' erledigten Quests.</p>' +
        '</article>' +
      '</div>';

    container.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.src = 'assets/questio-logo.png';
      });
    });
  }

  async function init() {
    const container = document.getElementById(DASHBOARD_ID);
    if (!container) {
      return;
    }

    try {
      const results = await Promise.all([loadPlayer(), loadAchievementItems()]);
      const player = results[0];
      const achievementItems = results[1];
      const rankItem = getCurrentRank(achievementItems, Number(player.completedQuestCount) || 0);
      renderDashboard(container, player, rankItem);
    } catch (err) {
      container.innerHTML = '<p class="muted">Spielerdaten konnten aktuell nicht geladen werden.</p>';
    }
  }

  init();
})();
