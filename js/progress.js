(function () {
  const API_URL = 'api/quest.php';
  const CATALOG_API_URL = 'api/quest_catalog.php';
  const ACHIEVEMENT_API_URL = 'api/achievement_items.php';
  const SHOP_API_URL = 'api/shop_items.php';
  const PLAYER_STORAGE_KEY = 'serverwatch_quest_player_id';
  const SHARED_PLAYER_ID = 'kid_shared_main';

  const DEFAULT_ACHIEVEMENTS = [
    { title: 'Beginner', target: 1 },
    { title: 'Holz', target: 10 },
    { title: 'Silber', target: 50 },
    { title: 'Gold', target: 200 },
    { title: 'Elite', target: 400 },
    { title: 'Smaragd', target: 600 },
    { title: 'Rubin', target: 800 },
    { title: 'Diamant', target: 1000 },
    { title: 'Meister', target: 1500 },
    { title: 'Grossmeister', target: 2000 }
  ];

  const LEVEL_MILESTONES = [10, 25, 50, 75, 100, 150, 200, 300, 500, 750, 1000];

  function getOrCreatePlayerId() {
    localStorage.setItem(PLAYER_STORAGE_KEY, SHARED_PLAYER_ID);
    return SHARED_PLAYER_ID;
  }

  const playerId = getOrCreatePlayerId();
  const playerIdEl = document.getElementById('player-id');
  const levelEl = document.getElementById('level-number');
  const xpTotalEl = document.getElementById('xp-total');
  const coinsTotalEl = document.getElementById('coins-total');
  const progressEl = document.getElementById('level-progress');
  const progressTextEl = document.getElementById('level-progress-text');
  const progressAvatarEl = document.getElementById('progress-avatar');
  const levelMilestonesEl = document.getElementById('level-milestones');
  const acceptedListEl = document.getElementById('accepted-quests');
  const availableListEl = document.getElementById('available-quests');
  const rewardsListEl = document.getElementById('rewards-list');
  const boostIndicatorEl = document.getElementById('boost-indicator');
  const sysMessagesEl = document.getElementById('system-messages-list');

  if (playerIdEl) {
    playerIdEl.textContent = 'Spieler: wird geladen...';
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function countCompletedQuests(player) {
    const quests = Array.isArray(player && player.quests) ? player.quests : [];
    return quests.filter(function (q) { return q && q.completed; }).length;
  }

  async function loadAchievementCatalog() {
    try {
      const response = await fetch(ACHIEVEMENT_API_URL, { method: 'GET' });
      const data = await response.json();
      if (!response.ok || !data.ok || !Array.isArray(data.items)) {
        return DEFAULT_ACHIEVEMENTS.slice();
      }

      const catalog = data.items
        .map(function (item) {
          return {
            title: String(item && item.title ? item.title : ''),
            target: Number(item && item.target)
          };
        })
        .filter(function (item) {
          return item.title && Number.isFinite(item.target) && item.target > 0;
        })
        .sort(function (a, b) { return a.target - b.target; });

      return catalog.length ? catalog : DEFAULT_ACHIEVEMENTS.slice();
    } catch (e) {
      return DEFAULT_ACHIEVEMENTS.slice();
    }
  }

  function findNewlyUnlockedAchievements(beforeCompleted, afterCompleted, achievementCatalog) {
    const milestones = Array.isArray(achievementCatalog) ? achievementCatalog : [];
    return milestones
      .filter(function (entry) {
        return beforeCompleted < entry.target && afterCompleted >= entry.target;
      })
      .map(function (entry) {
        return entry.title;
      });
  }

  function showAchievementPopup(unlockedTitles) {
    if (!Array.isArray(unlockedTitles) || unlockedTitles.length === 0) {
      return;
    }

    const existing = document.querySelector('.achievement-unlock-popup');
    if (existing) {
      existing.remove();
    }

    const popup = document.createElement('aside');
    popup.className = 'achievement-unlock-popup';

    const heading = document.createElement('h4');
    heading.textContent = 'Neues Achievement freigeschaltet';
    popup.appendChild(heading);

    const list = document.createElement('ul');
    unlockedTitles.forEach(function (title) {
      const li = document.createElement('li');
      li.textContent = title;
      list.appendChild(li);
    });
    popup.appendChild(list);

    document.body.appendChild(popup);
    requestAnimationFrame(function () {
      popup.classList.add('show');
    });

    window.setTimeout(function () {
      popup.classList.remove('show');
      window.setTimeout(function () {
        if (popup.parentNode) {
          popup.remove();
        }
      }, 220);
    }, 4200);
  }

  async function requestQuestApi(action, payload) {
    const response = await fetch(API_URL + '?action=' + encodeURIComponent(action), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ player_id: playerId }, payload || {}))
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Quest-API Fehler');
    }
    return data;
  }

  async function loadCatalog() {
    const response = await fetch(CATALOG_API_URL, { method: 'GET' });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Quest-Katalog konnte nicht geladen werden.');
    }
    return Array.isArray(data.quests) ? data.quests : [];
  }

  async function loadShopItems() {
    const response = await fetch(SHOP_API_URL, { method: 'GET' });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Shop-Katalog konnte nicht geladen werden.');
    }
    return Array.isArray(data.items) ? data.items : [];
  }

  function renderBoostIndicator(player) {
    if (!boostIndicatorEl) { return; }
    boostIndicatorEl.innerHTML = '';
    const boosts = Array.isArray(player && player.activeBoosts) ? player.activeBoosts : [];
    const active = boosts.filter(function (b) { return b && Number(b.remainingQuests) > 0; });
    if (active.length === 0) { return; }

    const badge = document.createElement('span');
    badge.className = 'boost-badge';

    const icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '\u26A1';
    badge.appendChild(icon);

    const lbl = document.createElement('span');
    lbl.textContent = 'Boost aktiv';
    badge.appendChild(lbl);

    const tooltip = document.createElement('div');
    tooltip.className = 'boost-tooltip';
    tooltip.setAttribute('aria-hidden', 'true');

    const ttTitle = document.createElement('p');
    ttTitle.className = 'boost-tooltip-title';
    ttTitle.textContent = 'Aktive Boni:';
    tooltip.appendChild(ttTitle);

    active.forEach(function (boost) {
      const entry = document.createElement('div');
      entry.className = 'boost-tooltip-entry';
      const pct = Math.round(((Number(boost.multiplier) || 1) - 1) * 100);
      const rem = Number(boost.remainingQuests) || 0;
      entry.textContent = (boost.label || 'Boost') + ' (+' + pct + '\u00a0% EP, noch\u00a0' + rem + '\u00a0Quest' + (rem !== 1 ? 's' : '') + ')';
      tooltip.appendChild(entry);
    });

    badge.appendChild(tooltip);
    boostIndicatorEl.appendChild(badge);
  }

  function renderSystemMessages(player) {
    if (!sysMessagesEl) { return; }
    const messages = Array.isArray(player && player.systemMessages) ? player.systemMessages : [];
    sysMessagesEl.innerHTML = '';

    if (messages.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'muted';
      empty.textContent = 'Noch keine Systemnachrichten vorhanden.';
      sysMessagesEl.appendChild(empty);
      return;
    }

    messages.slice().reverse().slice(0, 5).forEach(function (msg) {
      const item = document.createElement('li');
      item.className = 'system-message-item';

      const text = document.createElement('p');
      text.textContent = String(msg && msg.text ? msg.text : '');
      item.appendChild(text);

      if (msg && msg.timestamp) {
        const time = document.createElement('p');
        time.className = 'system-message-time';
        try {
          const d = new Date(msg.timestamp);
          time.textContent = isNaN(d.getTime()) ? '' : d.toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' });
        } catch (e) { time.textContent = ''; }
        item.appendChild(time);
      }

      sysMessagesEl.appendChild(item);
    });
  }

  function renderLevel(player) {
    if (playerIdEl) {
      playerIdEl.textContent = 'Spieler: ' + String(player.name || 'Spieler');
    }
    if (levelEl) {
      levelEl.textContent = String(player.level);
    }
    if (xpTotalEl) {
      xpTotalEl.textContent = String(player.xp);
    }
    if (coinsTotalEl) {
      coinsTotalEl.textContent = String(Number(player.coins) || 0);
    }
    if (progressEl) {
      const progressPercent = Math.max(0, Math.min(100, (player.xpInLevel / player.xpForNextLevel) * 100));
      progressEl.style.width = progressPercent + '%';
    }
    if (progressTextEl) {
      progressTextEl.textContent = player.xpInLevel + ' / ' + player.xpForNextLevel + ' EP';
    }
    if (progressAvatarEl) {
      const avatarPath = player.profileImage && player.profileImage.image ? player.profileImage.image : 'assets/avatar-placeholder.svg';
      progressAvatarEl.src = avatarPath;
      progressAvatarEl.onerror = function () {
        progressAvatarEl.src = 'assets/avatar-placeholder.svg';
      };
    }
    renderBoostIndicator(player);
  }

  function levelUpBaseCoins(levelReached) {
    const lvl = Math.max(2, Number(levelReached) || 2);

    if (lvl <= 50) {
      return 5;
    }
    if (lvl <= 100) {
      return 8;
    }
    if (lvl <= 200) {
      return 12;
    }
    if (lvl <= 500) {
      return 18;
    }
    return 25;
  }

  function levelMilestoneBonusCoins(levelReached) {
    const bonusByLevel = {
      10: 20,
      25: 35,
      50: 60,
      75: 90,
      100: 130,
      150: 180,
      200: 230,
      300: 300,
      500: 380,
      750: 450,
      1000: 475
    };

    return Number(bonusByLevel[levelReached]) || 0;
  }

  function levelUpCoins(levelReached) {
    const base = levelUpBaseCoins(levelReached);
    const milestoneBonus = levelMilestoneBonusCoins(levelReached);
    if (milestoneBonus > 0) {
      return Math.min(500, base + milestoneBonus);
    }
    return base;
  }

  function renderLevelMilestones(player) {
    if (!levelMilestonesEl) {
      return;
    }

    const currentLevel = Math.max(1, Number(player && player.level) || 1);
    levelMilestonesEl.innerHTML = '';

    LEVEL_MILESTONES.forEach(function (target) {
      const card = document.createElement('article');
      card.className = 'quest-item';

      const title = document.createElement('h4');
      title.className = 'quest-title';
      title.textContent = 'Meilenstein Level ' + target;

      const state = document.createElement('p');
      state.className = 'quest-meta';
      state.textContent = currentLevel >= target
        ? 'Status: erreicht'
        : 'Status: offen';

      const coinsLine = document.createElement('p');
      coinsLine.className = 'quest-meta quest-coins-line';

      const totalCoins = levelUpCoins(target);
      const coinsText = document.createElement('span');
      coinsText.textContent = 'Coins beim Erreichen: ' + String(totalCoins);
      coinsLine.appendChild(coinsText);

      const coinsIcon = document.createElement('img');
      coinsIcon.className = 'coin-icon';
      coinsIcon.src = 'assets/coin.png';
      coinsIcon.alt = 'Coin Symbol';
      coinsIcon.loading = 'lazy';
      coinsIcon.addEventListener('error', function () {
        coinsIcon.style.display = 'none';
      });
      coinsLine.appendChild(coinsIcon);

      card.appendChild(title);
      card.appendChild(state);
      card.appendChild(coinsLine);
      levelMilestonesEl.appendChild(card);
    });
  }

  function renderRewards(player, shopItems, catalogQuests) {
    if (!rewardsListEl) {
      return;
    }

    rewardsListEl.innerHTML = '';

    const completedQuests = Array.isArray(player && player.quests)
      ? player.quests.filter(function (q) { return q && q.completed; }).length
      : 0;
    const currentLevel = Math.max(1, Number(player && player.level) || 1);
    const currentCoins = Math.max(0, Number(player && player.coins) || 0);
    const completedCatalogQuestIds = new Set(
      (Array.isArray(player && player.quests) ? player.quests : [])
        .filter(function (q) { return q && q.completed; })
        .map(function (q) {
          return q.catalogId !== null && q.catalogId !== undefined && q.catalogId !== ''
            ? String(q.catalogId)
            : String(q.id || '');
        })
        .filter(Boolean)
    );
    const catalogById = new Map(
      (Array.isArray(catalogQuests) ? catalogQuests : [])
        .map(function (q) {
          return [String(q && q.id !== undefined ? q.id : ''), q];
        })
        .filter(function (entry) { return entry[0] !== ''; })
    );
    const rewardById = new Map(
      (Array.isArray(shopItems) ? shopItems : [])
        .filter(function (item) {
          return String(item && item.type ? item.type : '') === 'reward_item';
        })
        .map(function (item) {
          return [String(item && item.id ? item.id : ''), item];
        })
        .filter(function (entry) { return entry[0] !== ''; })
    );

    const ownedIds = new Set(
      (Array.isArray(player && player.ownedShopItems) ? player.ownedShopItems : []).map(String)
    );
    const unlockedIds = new Set(
      (Array.isArray(player && player.unlockedRewardItemIds) ? player.unlockedRewardItemIds : []).map(String)
    );

    function getRewardProgressData(item) {
      const conditionType = String(item && item.unlockConditionType ? item.unlockConditionType : 'coins_purchase');
      const conditionValue = Math.max(0, Number(item && item.unlockConditionValue) || 0);
      const startCompletedQuests = Math.max(0, Number(item && item.unlockStartCompletedQuests) || 0);
      const startLevel = Math.max(1, Number(item && item.unlockStartLevel) || 1);
      const costCoins = Math.max(0, Number(item && item.costCoins) || 0);
      const itemId = String(item && item.id ? item.id : '');
      const unlocked = ownedIds.has(itemId);
      const completedSinceStart = Math.max(0, completedQuests - startCompletedQuests);
      const levelUpsSinceStart = Math.max(0, currentLevel - startLevel);
      const conditionQuestIds = Array.isArray(item && item.unlockConditionQuestIds)
        ? item.unlockConditionQuestIds.map(function (id) { return String(id); }).filter(Boolean)
        : [];
      const conditionRewardIds = Array.isArray(item && item.unlockConditionRewardIds)
        ? item.unlockConditionRewardIds.map(function (id) { return String(id); }).filter(Boolean)
        : [];

      if (unlocked) {
        return {
          conditionType: conditionType,
          current: 1,
          target: 1,
          percent: 100,
          label: 'Bereits freigeschaltet',
          conditionLabel: 'Status: eingelost'
        };
      }

      if (conditionType === 'quests_completed') {
        const target = Math.max(1, conditionValue);
        const current = Math.min(target, completedSinceStart);
        const missing = Math.max(0, target - completedSinceStart);
        return {
          conditionType: conditionType,
          current: current,
          target: target,
          percent: Math.max(0, Math.min(100, (current / target) * 100)),
          label: String(current) + ' / ' + String(target) + ' Quests seit Anlage',
          conditionLabel: missing > 0 ? 'Voraussetzung offen: noch ' + missing + ' Quest(s)' : 'Voraussetzung erfuellt'
        };
      }

      if (conditionType === 'level_up') {
        const target = Math.max(1, conditionValue);
        const current = Math.min(target, levelUpsSinceStart);
        const missing = Math.max(0, target - levelUpsSinceStart);
        return {
          conditionType: conditionType,
          current: current,
          target: target,
          percent: Math.max(0, Math.min(100, (current / target) * 100)),
          label: String(current) + ' / ' + String(target) + ' Levelaufstiege seit Anlage',
          conditionLabel: missing > 0 ? 'Voraussetzung offen: noch ' + missing + ' Levelaufstieg(e)' : 'Voraussetzung erfuellt'
        };
      }

      if (conditionType === 'reach_level') {
        const target = Math.max(1, conditionValue);
        const current = Math.min(target, currentLevel);
        const missing = Math.max(0, target - currentLevel);
        return {
          conditionType: conditionType,
          current: current,
          target: target,
          percent: Math.max(0, Math.min(100, (current / target) * 100)),
          label: 'Level ' + String(currentLevel) + ' / ' + String(target),
          conditionLabel: missing > 0 ? 'Voraussetzung offen: noch ' + missing + ' Level' : 'Voraussetzung erfuellt'
        };
      }

      if (conditionType === 'quest_ids') {
        const target = Math.max(1, conditionQuestIds.length);
        const completed = conditionQuestIds.filter(function (questId) {
          return completedCatalogQuestIds.has(String(questId));
        }).length;
        const current = Math.min(target, completed);
        const missing = Math.max(0, target - completed);
        const questStates = conditionQuestIds.map(function (questId) {
          const quest = catalogById.get(String(questId));
          return {
            id: String(questId),
            title: quest && quest.title ? String(quest.title) : 'Quest ' + String(questId),
            completed: completedCatalogQuestIds.has(String(questId))
          };
        });
        return {
          conditionType: conditionType,
          current: current,
          target: target,
          percent: Math.max(0, Math.min(100, (current / target) * 100)),
          label: String(current) + ' / ' + String(target) + ' Ziel-Quests erledigt',
          conditionLabel: missing > 0 ? 'Voraussetzung offen: noch ' + missing + ' Quest(s)' : 'Voraussetzung erfuellt',
          questStates: questStates
        };
      }

      if (conditionType === 'reward_ids') {
        const target = Math.max(1, conditionRewardIds.length);
        const completed = conditionRewardIds.filter(function (rewardId) {
          return ownedIds.has(String(rewardId));
        }).length;
        const current = Math.min(target, completed);
        const missing = Math.max(0, target - completed);
        const rewardStates = conditionRewardIds.map(function (rewardId) {
          const rewardItem = rewardById.get(String(rewardId));
          return {
            id: String(rewardId),
            title: rewardItem && rewardItem.title ? String(rewardItem.title) : 'Belohnung ' + String(rewardId),
            completed: ownedIds.has(String(rewardId))
          };
        });
        return {
          conditionType: conditionType,
          current: current,
          target: target,
          percent: Math.max(0, Math.min(100, (current / target) * 100)),
          label: String(current) + ' / ' + String(target) + ' Ziel-Belohnungen vorhanden',
          conditionLabel: missing > 0 ? 'Voraussetzung offen: noch ' + missing + ' Belohnung(en)' : 'Voraussetzung erfuellt',
          rewardStates: rewardStates
        };
      }

      const target = Math.max(1, costCoins);
      const current = Math.min(target, currentCoins);
      const missing = Math.max(0, target - currentCoins);
      return {
        conditionType: conditionType,
        current: current,
        target: target,
        percent: Math.max(0, Math.min(100, (current / target) * 100)),
        label: String(currentCoins) + ' / ' + String(target) + ' Coins',
        conditionLabel: missing > 0 ? 'Noch ' + missing + ' Coins bis Kauf' : 'Kaufbar'
      };
    }

    const allRewards = (Array.isArray(shopItems) ? shopItems : []).filter(function (item) {
      const id = String(item && item.id ? item.id : '').toLowerCase();
      return id.indexOf('belohnung') === 0 && !ownedIds.has(String(item && item.id ? item.id : ''));
    });

    if (allRewards.length === 0) {
      rewardsListEl.innerHTML = '<p class="muted">Noch keine Belohnungen freigeschaltet.</p>';
      return;
    }

    allRewards.forEach(function (rewardItem) {
      const claimRewardXp = Math.max(0, Number(rewardItem && rewardItem.claimRewardXp) || 0);
      const claimRewardCoins = Math.max(0, Number(rewardItem && rewardItem.claimRewardCoins) || 0);
      const claimRewardTitle = String(rewardItem && rewardItem.claimRewardTitle ? rewardItem.claimRewardTitle : '').trim();
      const reward = {
        id: String(rewardItem && rewardItem.id ? rewardItem.id : ''),
        title: String(rewardItem && rewardItem.title ? rewardItem.title : 'Belohnung'),
        image: String(rewardItem && rewardItem.image ? rewardItem.image : ''),
        progress: getRewardProgressData(rewardItem),
        claimRewardXp: claimRewardXp,
        claimRewardCoins: claimRewardCoins,
        claimRewardTitle: claimRewardTitle,
        unlocked: ownedIds.has(String(rewardItem && rewardItem.id ? rewardItem.id : '')),
        readyToRedeem: unlockedIds.has(String(rewardItem && rewardItem.id ? rewardItem.id : ''))
      };

      const card = document.createElement('article');
      card.className = 'quest-accordion';

      const header = document.createElement('div');
      header.className = 'quest-accordion-header';

      const main = document.createElement('div');
      main.className = 'quest-accordion-main';

      const textWrap = document.createElement('div');
      textWrap.className = 'quest-main-text';

      const title = document.createElement('h4');
      title.className = 'quest-title';
      title.textContent = reward.title;

      const source = document.createElement('p');
      source.className = 'quest-meta';
      source.textContent = reward.progress.conditionLabel;

      textWrap.appendChild(title);
      textWrap.appendChild(source);

      const status = document.createElement('span');
      status.className = reward.readyToRedeem ? 'quest-pending-check' : 'quest-ep';
      status.textContent = reward.readyToRedeem ? 'Freigeschaltet' : 'Aktiv';

      main.appendChild(textWrap);
      main.appendChild(status);

      const actions = document.createElement('div');
      actions.className = 'quest-actions';

      const toggleButton = document.createElement('button');
      toggleButton.type = 'button';
      toggleButton.className = 'quest-toggle-btn';
      toggleButton.textContent = 'Details';
      actions.appendChild(toggleButton);

      if (reward.readyToRedeem) {
        const redeemButton = document.createElement('button');
        redeemButton.type = 'button';
        redeemButton.className = 'chip';
        redeemButton.textContent = 'Einloesen';
        redeemButton.addEventListener('click', function () {
          showRedeemRewardModal(reward);
        });
        actions.appendChild(redeemButton);
      }

      header.appendChild(main);
      header.appendChild(actions);

      const body = document.createElement('div');
      body.className = 'quest-accordion-body';
      body.hidden = true;

      const rewardBonusParts = [];
      if (reward.claimRewardXp > 0) {
        rewardBonusParts.push('+' + String(reward.claimRewardXp) + ' EP');
      }
      if (reward.claimRewardCoins > 0) {
        rewardBonusParts.push('+' + String(reward.claimRewardCoins) + ' Coins');
      }
      if (reward.claimRewardTitle) {
        rewardBonusParts.push('Titel: ' + reward.claimRewardTitle);
      }

      if (rewardBonusParts.length > 0) {
        const rewardBonusLine = document.createElement('p');
        rewardBonusLine.className = 'quest-meta';
        rewardBonusLine.textContent = 'Beim Einloesen: ' + rewardBonusParts.join(', ');
        body.appendChild(rewardBonusLine);
      }

      if (!reward.readyToRedeem) {
        const progressLabel = document.createElement('p');
        progressLabel.className = 'quest-meta';
        progressLabel.textContent = reward.progress.label;

        const progressWrap = document.createElement('div');
        progressWrap.className = 'reward-progress-wrap';

        const progressBar = document.createElement('div');
        progressBar.className = 'reward-progress-bar reward-progress-' + String(reward.progress.conditionType || 'coins_purchase');
        progressBar.style.width = String(reward.progress.percent) + '%';
        progressWrap.appendChild(progressBar);

        body.appendChild(progressLabel);
        body.appendChild(progressWrap);

        if ((reward.progress.conditionType === 'quest_ids' && Array.isArray(reward.progress.questStates)) ||
            (reward.progress.conditionType === 'reward_ids' && Array.isArray(reward.progress.rewardStates))) {
          const requirementWrap = document.createElement('div');
          requirementWrap.className = 'reward-requirements';

          const rows = reward.progress.conditionType === 'reward_ids'
            ? reward.progress.rewardStates
            : reward.progress.questStates;

          const completedCount = rows.filter(function (qs) {
            return Boolean(qs && qs.completed);
          }).length;
          const totalCount = Math.max(1, rows.length);
          const percent = Math.round((completedCount / totalCount) * 100);

          const requirementProgress = document.createElement('p');
          requirementProgress.className = 'quest-meta';
          requirementProgress.textContent = 'Fortschritt: ' + completedCount + ' / ' + totalCount + ' Voraussetzungen (' + percent + ' %)';
          requirementWrap.appendChild(requirementProgress);

          const requirementTitle = document.createElement('p');
          requirementTitle.className = 'quest-meta';
          requirementTitle.textContent = reward.progress.conditionType === 'reward_ids'
            ? 'Erforderliche Belohnungen:'
            : 'Erforderliche Quests:';
          requirementWrap.appendChild(requirementTitle);

          rows.forEach(function (questState) {
            const row = document.createElement('label');
            row.className = 'reward-requirement-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = Boolean(questState.completed);
            checkbox.disabled = true;

            const text = document.createElement('span');
            text.textContent = '[' + questState.id + '] ' + questState.title;

            row.appendChild(checkbox);
            row.appendChild(text);
            requirementWrap.appendChild(row);
          });

          body.appendChild(requirementWrap);
        }
      } else {
        const readyText = document.createElement('p');
        readyText.className = 'quest-meta';
        readyText.textContent = 'Belohnung ist freigeschaltet und kann jetzt eingelost werden.';
        body.appendChild(readyText);
      }

      if (reward.image) {
        const preview = document.createElement('img');
        preview.className = 'shop-preview';
        preview.src = reward.image;
        preview.alt = reward.title;
        preview.loading = 'lazy';
        preview.addEventListener('error', function () {
          preview.style.display = 'none';
        });
        body.appendChild(preview);
      }

      toggleButton.addEventListener('click', function () {
        body.hidden = !body.hidden;
        toggleButton.textContent = body.hidden ? 'Details' : 'Weniger';
      });

      card.appendChild(header);
      card.appendChild(body);

      rewardsListEl.appendChild(card);
    });
  }

  function showRedeemRewardModal(reward) {
    const existing = document.querySelector('.reward-redeem-modal-backdrop');
    if (existing) {
      existing.remove();
    }

    const backdrop = document.createElement('div');
    backdrop.className = 'reward-redeem-modal-backdrop';

    const modal = document.createElement('div');
    modal.className = 'reward-redeem-modal';

    const title = document.createElement('h4');
    title.textContent = reward.title;

    const text = document.createElement('p');
    text.className = 'quest-meta';
    text.textContent = 'Jetzt einloesen';

    const modalBonusParts = [];
    if (Math.max(0, Number(reward && reward.claimRewardXp) || 0) > 0) {
      modalBonusParts.push('+' + String(Math.max(0, Number(reward.claimRewardXp) || 0)) + ' EP');
    }
    if (Math.max(0, Number(reward && reward.claimRewardCoins) || 0) > 0) {
      modalBonusParts.push('+' + String(Math.max(0, Number(reward.claimRewardCoins) || 0)) + ' Coins');
    }
    if (String(reward && reward.claimRewardTitle ? reward.claimRewardTitle : '').trim()) {
      modalBonusParts.push('Titel: ' + String(reward.claimRewardTitle).trim());
    }

    const bonus = document.createElement('p');
    bonus.className = 'quest-meta';
    bonus.textContent = modalBonusParts.length > 0
      ? 'Du erhaeltst: ' + modalBonusParts.join(', ')
      : 'Kein zusaetzlicher Preis konfiguriert.';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '100';
    slider.step = '1';
    slider.value = '0';
    slider.className = 'reward-redeem-slider';

    const actions = document.createElement('div');
    actions.className = 'parent-edit-actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'chip';
    cancelBtn.textContent = 'Abbrechen';

    const redeemBtn = document.createElement('button');
    redeemBtn.type = 'button';
    redeemBtn.className = 'status-btn';
    redeemBtn.textContent = 'Einloesen';
    redeemBtn.disabled = true;

    slider.addEventListener('input', function () {
      redeemBtn.disabled = Number(slider.value) < 100;
    });

    cancelBtn.addEventListener('click', function () {
      backdrop.remove();
    });

    redeemBtn.addEventListener('click', async function () {
      try {
        await requestQuestApi('redeem_reward', { rewardItemId: reward.id });
        backdrop.remove();
        await refresh();
      } catch (err) {
        alert('Belohnung konnte nicht eingelost werden: ' + err.message);
      }
    });

    actions.appendChild(cancelBtn);
    actions.appendChild(redeemBtn);

    modal.appendChild(title);
    modal.appendChild(text);
    modal.appendChild(bonus);
    modal.appendChild(slider);
    modal.appendChild(actions);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
  }

  function createQuestCard(options) {
    const wrapper = document.createElement('article');
    wrapper.className = 'quest-accordion';

    const header = document.createElement('div');
    header.className = 'quest-accordion-header';

    const main = document.createElement('div');
    main.className = 'quest-accordion-main';

    const title = document.createElement('h4');
    title.className = 'quest-title';
    title.textContent = options.title;

    const idLine = document.createElement('p');
    idLine.className = 'quest-id';
    idLine.textContent = 'Quest-ID: ' + String(options.questId);

    const ep = document.createElement('span');
    ep.className = 'quest-ep';
    ep.textContent = String(options.rewardXp) + ' EP';

    const textWrap = document.createElement('div');
    textWrap.className = 'quest-main-text';
    textWrap.appendChild(title);
    textWrap.appendChild(idLine);

    main.appendChild(textWrap);
    main.appendChild(ep);

    if (options.pendingConfirmation) {
      const pendingBadge = document.createElement('span');
      pendingBadge.className = 'quest-pending-check';
      pendingBadge.textContent = 'Abgabe markiert';
      main.appendChild(pendingBadge);
    }

    const actions = document.createElement('div');
    actions.className = 'quest-actions';

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'quest-toggle-btn';
    toggleButton.textContent = 'Details';

    const actionButton = document.createElement('button');
    actionButton.type = 'button';
    actionButton.className = 'chip';
    actionButton.textContent = options.actionLabel;

    actions.appendChild(toggleButton);
    actions.appendChild(actionButton);

    header.appendChild(main);
    header.appendChild(actions);

    const body = document.createElement('div');
    body.className = 'quest-accordion-body';
    body.hidden = true;

    const description = document.createElement('p');
    description.className = 'quest-meta';
    description.textContent = options.description || 'Keine Beschreibung vorhanden.';
    body.appendChild(description);

    const coinsLine = document.createElement('p');
    coinsLine.className = 'quest-meta quest-coins-line';

    const coinsRaw = Number(options.rewardCoins) || 0;
    const hasCoins = coinsRaw > 0;

    const coinsValue = document.createElement('span');
    coinsValue.textContent = 'Coins: ' + (hasCoins ? String(coinsRaw) : '-');
    coinsLine.appendChild(coinsValue);

    if (hasCoins) {
      const coinsIcon = document.createElement('img');
      coinsIcon.className = 'coin-icon';
      coinsIcon.src = 'assets/coin.png';
      coinsIcon.alt = 'Coin Symbol';
      coinsIcon.loading = 'lazy';
      coinsIcon.addEventListener('error', function () {
        coinsIcon.style.display = 'none';
      });
      coinsLine.appendChild(coinsIcon);
    }

    body.appendChild(coinsLine);

    toggleButton.addEventListener('click', function () {
      body.hidden = !body.hidden;
      toggleButton.textContent = body.hidden ? 'Details' : 'Weniger';
    });

    actionButton.addEventListener('click', options.onAction);

    wrapper.appendChild(header);
    wrapper.appendChild(body);
    return wrapper;
  }

  async function refresh() {
    if (acceptedListEl) {
      acceptedListEl.innerHTML = '<p class="muted">Lade angenommene Quests...</p>';
    }
    if (availableListEl) {
      availableListEl.innerHTML = '<p class="muted">Lade verfuegbare Quests...</p>';
    }

    const stateData = await requestQuestApi('get_state');
    const catalogQuests = await loadCatalog();
    const achievementCatalog = await loadAchievementCatalog();
    const shopItems = await loadShopItems();

    const player = stateData.player;
    renderLevel(player);
    renderLevelMilestones(player);
    renderRewards(player, shopItems, catalogQuests);
    renderSystemMessages(player);

    const quests = Array.isArray(player.quests) ? player.quests : [];
    const acceptedQuests = quests.filter(function (q) { return !q.completed; });
    const catalogIdSet = new Set(
      quests
        .map(function (q) { return q.catalogId; })
        .filter(function (id) { return id !== null && id !== undefined && id !== ''; })
        .map(function (id) { return String(id); })
    );
    const availableQuests = catalogQuests.filter(function (q) {
      return !catalogIdSet.has(String(q.id));
    });

    if (acceptedListEl) {
      acceptedListEl.innerHTML = '';
      if (acceptedQuests.length === 0) {
        acceptedListEl.innerHTML = '<p class="muted">Noch keine Quest angenommen.</p>';
      } else {
        acceptedQuests.forEach(function (quest) {
          const isPendingConfirmation = Boolean(quest.completionRequested);
          acceptedListEl.appendChild(createQuestCard({
            title: quest.title || 'Ohne Titel',
            questId: quest.catalogId || quest.id,
            rewardXp: Number(quest.rewardXp) || 0,
            rewardCoins: Number(quest.rewardCoins) || 0,
            description: quest.description || 'Keine Beschreibung vorhanden.',
            pendingConfirmation: isPendingConfirmation,
            actionLabel: isPendingConfirmation ? 'Bestaetigen' : 'Als erledigt markieren',
            onAction: async function () {
              try {
                if (isPendingConfirmation) {
                  const beforeState = await requestQuestApi('get_state');
                  const beforeCompleted = countCompletedQuests(beforeState.player);

                  const enteredPin = window.prompt('PIN fuer finale Bestaetigung eingeben:');
                  if (enteredPin === null) {
                    return;
                  }

                  await requestQuestApi('confirm_quest_completion', {
                    questId: quest.id,
                    confirmationPin: enteredPin
                  });

                  const playerAfter = await refresh();
                  const afterCompleted = countCompletedQuests(playerAfter);
                  const unlocked = findNewlyUnlockedAchievements(beforeCompleted, afterCompleted, achievementCatalog);
                  showAchievementPopup(unlocked);
                } else {
                  await requestQuestApi('complete_quest', {
                    questId: quest.id
                  });
                  await refresh();
                }
              } catch (err) {
                alert('Quest konnte nicht abgeschlossen werden: ' + err.message);
              }
            }
          }));
        });
      }
    }

    if (availableListEl) {
      availableListEl.innerHTML = '';
      if (availableQuests.length === 0) {
        availableListEl.innerHTML = '<p class="muted">Keine verfuegbaren Quests mehr vorhanden.</p>';
      } else {
        availableQuests.forEach(function (quest) {
          availableListEl.appendChild(createQuestCard({
            title: quest.title || 'Ohne Titel',
            questId: quest.id,
            rewardXp: Number(quest.rewardXp) || 0,
            rewardCoins: Number(quest.rewardCoins) || 0,
            description: quest.description || 'Keine Beschreibung vorhanden.',
            actionLabel: 'Quest annehmen',
            onAction: async function () {
              try {
                await requestQuestApi('create_quest', {
                  title: quest.title || 'Quest',
                  rewardXp: Number(quest.rewardXp) || 0,
                  rewardCoins: Number(quest.rewardCoins) || 0,
                  description: quest.description || '',
                  catalogId: quest.id
                });
                await refresh();
              } catch (err) {
                alert('Quest konnte nicht angenommen werden: ' + err.message);
              }
            }
          }));
        });
      }
    }

    return player;
  }

  refresh().catch(function (err) {
    if (acceptedListEl) {
      acceptedListEl.innerHTML = '<p class="muted">Fehler: ' + escapeHtml(err.message) + '</p>';
    }
    if (availableListEl) {
      availableListEl.innerHTML = '<p class="muted">Fehler: ' + escapeHtml(err.message) + '</p>';
    }
  });

  document.querySelectorAll('.collapsible-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const section = btn.closest('.collapsible-section');
      if (!section) {
        return;
      }
      const body = section.querySelector('.collapsible-body');
      if (!body) {
        return;
      }

      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      body.hidden = isOpen;
    });
  });
})();
