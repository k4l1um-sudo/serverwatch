(function () {
  const DEFAULT_SHOP_IMAGE_PATH = 'assets/deinbild.png';
  const PLAYER_STORAGE_KEY = 'serverwatch_quest_player_id';
  const SHARED_PLAYER_ID = 'kid_shared_main';
  const graphCanvas = document.getElementById('progress-curve');
  const graphStats = document.getElementById('graph-stats');
  const achievementsTotalEl = document.getElementById('stats-achievements-total');
  const achievementsWeekEl = document.getElementById('stats-achievements-week');
  const questsTotalEl = document.getElementById('stats-quests-total');
  const questsWeekEl = document.getElementById('stats-quests-week');
  const coinsSpentEl = document.getElementById('stats-coins-spent');
  const availableQuestsEl = document.getElementById('parent-quests-available');
  const acceptedQuestsEl = document.getElementById('parent-quests-accepted');
  const pendingQuestsEl = document.getElementById('parent-quests-pending');
  const toggleNewQuestBtn = document.getElementById('toggle-new-quest');
  const newQuestPanel = document.getElementById('new-quest-panel');
  const newQuestForm = document.getElementById('new-quest-form');
  const newQuestMsg = document.getElementById('new-quest-msg');
  const newQuestDifficultyEl = document.getElementById('new-quest-difficulty');
  const newQuestEpValueEl = document.getElementById('new-quest-ep-value');
  const editQuestPanel = document.getElementById('edit-quest-panel');
  const editQuestForm = document.getElementById('edit-quest-form');
  const editQuestMsg = document.getElementById('edit-quest-msg');
  const deleteQuestBtn = document.getElementById('delete-quest-btn');
  const parentShopItemsEl = document.getElementById('parent-shop-items');
  const toggleNewShopItemBtn = document.getElementById('toggle-new-shop-item');
  const newShopItemPanel = document.getElementById('new-shop-item-panel');
  const newShopItemForm = document.getElementById('new-shop-item-form');
  const newShopItemMsg = document.getElementById('new-shop-item-msg');
  const editShopItemPanel = document.getElementById('edit-shop-item-panel');
  const editShopItemForm = document.getElementById('edit-shop-item-form');
  const editShopItemMsg = document.getElementById('edit-shop-item-msg');
  const deleteShopItemBtn = document.getElementById('delete-shop-item-btn');
  const parentRewardsActiveEl = document.getElementById('parent-rewards-active');
  const parentRewardsRedeemedEl = document.getElementById('parent-rewards-redeemed');
  const toggleNewRewardItemBtn = document.getElementById('toggle-new-reward-item');
  const newRewardItemPanel = document.getElementById('new-reward-item-panel');
  const newRewardItemForm = document.getElementById('new-reward-item-form');
  const newRewardItemMsg = document.getElementById('new-reward-item-msg');
  const editRewardItemPanel = document.getElementById('edit-reward-item-panel');
  const editRewardItemForm = document.getElementById('edit-reward-item-form');
  const editRewardItemMsg = document.getElementById('edit-reward-item-msg');
  const deleteRewardItemBtn = document.getElementById('delete-reward-item-btn');
  const unlockRewardItemBtn = document.getElementById('unlock-reward-item-btn');
  const parentAchievementItemsEl = document.getElementById('parent-achievement-items');
  const toggleNewAchievementItemBtn = document.getElementById('toggle-new-achievement-item');
  const newAchievementItemPanel = document.getElementById('new-achievement-item-panel');
  const newAchievementItemForm = document.getElementById('new-achievement-item-form');
  const newAchievementItemMsg = document.getElementById('new-achievement-item-msg');
  const editAchievementItemPanel = document.getElementById('edit-achievement-item-panel');
  const editAchievementItemForm = document.getElementById('edit-achievement-item-form');
  const editAchievementItemMsg = document.getElementById('edit-achievement-item-msg');
  const deleteAchievementItemBtn = document.getElementById('delete-achievement-item-btn');
  const childForm = document.getElementById('child-password-form');
  const parentForm = document.getElementById('parent-pin-form');
  const childMsg = document.getElementById('child-security-msg');
  const parentMsg = document.getElementById('parent-security-msg');
  const parentCoinsCurrentEl = document.getElementById('parent-coins-current');
  const parentCoinsAmountEl = document.getElementById('parent-coins-amount');
  const parentCoinsAddBtn = document.getElementById('parent-coins-add-btn');
  const parentCoinsSubtractBtn = document.getElementById('parent-coins-subtract-btn');
  const parentCoinsMsg = document.getElementById('parent-coins-msg');
  const maintenanceToggleButtons = Array.from(document.querySelectorAll('.wartung-toggle-btn'));
  let currentPlayer = null;
  let currentCatalogQuests = [];
  let currentShopItems = [];
  let currentAchievementItems = [];
  let maintenanceEnabled = false;
  const rewardConditionState = {
    new: { questIds: [], rewardIds: [] },
    edit: { questIds: [], rewardIds: [] }
  };
  const achievementConditionState = {
    new: { questIds: [], rewardIds: [] },
    edit: { questIds: [], rewardIds: [] }
  };

  function getOrCreatePlayerId() {
    localStorage.setItem(PLAYER_STORAGE_KEY, SHARED_PLAYER_ID);
    return SHARED_PLAYER_ID;
  }

  async function loadPlayerState() {
    const response = await fetch('api/quest.php?action=get_state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: getOrCreatePlayerId() })
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Spielerstatus konnte nicht geladen werden.');
    }
    return data.player;
  }

  async function loadShopItems() {
    const response = await fetch('api/shop_items.php', { method: 'GET' });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Shop-Items konnten nicht geladen werden.');
    }
    return Array.isArray(data.items) ? data.items : [];
  }

  async function loadAchievementItems() {
    const response = await fetch('api/achievement_items.php', { method: 'GET' });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Achievements konnten nicht geladen werden.');
    }
    return Array.isArray(data.items) ? data.items : [];
  }

  async function loadQuestCatalog() {
    const response = await fetch('api/quest_catalog.php', { method: 'GET' });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Quest-Katalog konnte nicht geladen werden.');
    }
    return Array.isArray(data.quests) ? data.quests : [];
  }

  function createQuestMetaLine(quest) {
    const parts = [];
    if (quest && quest.id !== undefined) {
      parts.push('Quest-ID: ' + String(quest.id));
    }
    if (quest && quest.rewardXp !== undefined) {
      parts.push(String(Number(quest.rewardXp) || 0) + ' EP');
    }
    return parts.join(' | ');
  }

  function renderQuestList(container, quests, emptyText) {
    if (!container) {
      return;
    }

    container.innerHTML = '';
    if (!Array.isArray(quests) || quests.length === 0) {
      container.innerHTML = '<p class="muted">' + emptyText + '</p>';
      return;
    }

    quests.forEach(function (quest) {
      const item = document.createElement('article');
      item.className = 'parent-quest-entry';

      const title = document.createElement('h5');
      title.className = 'quest-title';
      title.textContent = quest.title || 'Ohne Titel';

      const meta = document.createElement('p');
      meta.className = 'quest-meta';
      meta.textContent = createQuestMetaLine(quest);

      item.appendChild(title);
      item.appendChild(meta);

      if (quest && typeof quest._action === 'function') {
        const actionBtn = document.createElement('button');
        actionBtn.type = 'button';
        actionBtn.className = 'chip';
        actionBtn.textContent = quest._actionLabel || 'Ausfuehren';
        actionBtn.addEventListener('click', function () {
          quest._action();
        });
        item.appendChild(actionBtn);
      }

      if (quest && quest._catalogId) {
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'quest-edit-btn';
        editBtn.textContent = 'Bearbeiten';
        editBtn.addEventListener('click', function () {
          openQuestEditor(quest);
        });

        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'chip';
        copyBtn.textContent = 'Kopieren';
        copyBtn.addEventListener('click', function () {
          duplicateCatalogQuest(quest);
        });

        item.appendChild(copyBtn);
        item.appendChild(editBtn);
      }
      container.appendChild(item);
    });
  }

  function buildQuestCopyTitle(title) {
    const sourceTitle = String(title || '').trim() || 'Ohne Titel';
    const cleanTitle = sourceTitle.replace(/^(Kopie\s*-\s*)+/i, '').trim() || sourceTitle;
    return 'Kopie - ' + cleanTitle;
  }

  async function duplicateCatalogQuest(quest) {
    const title = buildQuestCopyTitle(quest && quest.title);
    const description = String((quest && quest.description) || '').trim();
    const difficultyRaw = String((quest && quest.difficulty) || 'mittel').toLowerCase();
    const difficulty = ['leicht', 'mittel', 'schwer'].indexOf(difficultyRaw) >= 0 ? difficultyRaw : 'mittel';
    const rewardXp = Math.max(1, Math.min(1000, Number(quest && quest.rewardXp) || 100));
    const rewardCoins = Math.max(0, Math.min(100000, Number(quest && quest.rewardCoins) || 0));

    try {
      const response = await fetch('api/quest_catalog.php?action=create_quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          description: description,
          difficulty: difficulty,
          rewardXp: rewardXp,
          rewardCoins: rewardCoins
        })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        window.alert(data.error || 'Quest konnte nicht kopiert werden.');
        return;
      }

      await refreshParentQuestLists();
      window.alert('Quest wurde als Kopie angelegt.');
    } catch (e) {
      window.alert('Verbindungsfehler beim Kopieren der Quest.');
    }
  }

  function renderParentQuestStatus(player, catalogQuests) {
    const catalogById = new Map((Array.isArray(catalogQuests) ? catalogQuests : []).map(function (q) {
      return [String(q.id), q];
    }));

    function mergeFromCatalog(playerQuest) {
      const originalQuestId = playerQuest && playerQuest.id ? String(playerQuest.id) : null;
      const catalogId = playerQuest && playerQuest.catalogId !== undefined && playerQuest.catalogId !== null
        ? String(playerQuest.catalogId)
        : null;
      const catalogQuest = catalogId ? catalogById.get(catalogId) : null;
      const merged = Object.assign({}, playerQuest || {}, catalogQuest || {});
      merged._catalogId = catalogId || (catalogQuest ? String(catalogQuest.id) : null);
      merged._playerQuestId = originalQuestId;
      merged.id = merged._catalogId || merged.id;
      return merged;
    }

    const playerQuests = Array.isArray(player && player.quests) ? player.quests : [];
    const accepted = playerQuests.filter(function (q) {
      return q && !q.completed && !q.completionRequested;
    }).map(mergeFromCatalog);

    const pending = playerQuests.filter(function (q) {
      return q && !q.completed && q.completionRequested;
    }).map(mergeFromCatalog).map(function (quest) {
      const enriched = Object.assign({}, quest);
      enriched._actionLabel = 'Jetzt bestaetigen';
      enriched._action = function () {
        return confirmPendingQuest(quest);
      };
      return enriched;
    });

    const knownCatalogIds = new Set(
      playerQuests
        .map(function (q) { return q && q.catalogId; })
        .filter(function (id) { return id !== null && id !== undefined && id !== ''; })
        .map(function (id) { return String(id); })
    );

    const available = (Array.isArray(catalogQuests) ? catalogQuests : []).filter(function (q) {
      return !knownCatalogIds.has(String(q && q.id));
    }).map(function (q) {
      const merged = Object.assign({}, q);
      merged._catalogId = String(q.id);
      return merged;
    });

    renderQuestList(availableQuestsEl, available, 'Keine verfuegbaren Quests.');
    renderQuestList(acceptedQuestsEl, accepted, 'Keine angenommenen Quests.');
    renderQuestList(pendingQuestsEl, pending, 'Keine Quests zur Bestaetigung.');
  }

  async function confirmPendingQuest(quest) {
    const questId = quest && (quest._playerQuestId || quest.id) ? String(quest._playerQuestId || quest.id) : '';
    if (!questId) {
      return;
    }

    try {
      const response = await fetch('api/quest.php?action=confirm_quest_completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: getOrCreatePlayerId(),
          questId: questId
        })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        window.alert(data.error || 'Quest konnte nicht bestaetigt werden.');
        return;
      }

      currentPlayer = data.player;
      drawCurve(currentPlayer);
      renderParentStats(currentPlayer, currentShopItems, currentAchievementItems);
      renderParentRewards(currentPlayer, currentShopItems);
      await refreshParentQuestLists();
    } catch (e) {
      window.alert('Verbindungsfehler bei der Bestaetigung.');
    }
  }

  async function refreshParentQuestLists() {
    const catalogQuests = await loadQuestCatalog();
    currentCatalogQuests = catalogQuests;
    renderParentQuestStatus(currentPlayer || { quests: [] }, catalogQuests);
  }

  function createShopMetaLine(item) {
    const cost = Number(item && item.costCoins) || 0;
    const typeLabels = {
      'profile_image': 'Profilbild',
      'xp_boost_perk': 'EP-Boost Perk',
      'reallife_item': 'Reallife Gegenstand',
      'reward_item': 'Belohnung',
      'shop_item': 'Shopitem'
    };
    const typeLabel = typeLabels[item && item.type] || (item && item.type) || 'Shopitem';

    if (!item || item.type !== 'reward_item') {
      return String(cost) + ' Coins · ' + typeLabel;
    }

    const claimXp = Math.max(0, Number(item.claimRewardXp) || 0);
    const claimCoins = Math.max(0, Number(item.claimRewardCoins) || 0);
    const claimTitle = String(item.claimRewardTitle || '').trim();
    const bonuses = [];
    if (claimXp > 0) {
      bonuses.push('+' + String(claimXp) + ' EP');
    }
    if (claimCoins > 0) {
      bonuses.push('+' + String(claimCoins) + ' Coins');
    }
    if (claimTitle) {
      bonuses.push('Titel: ' + claimTitle);
    }

    const base = String(cost) + ' Coins · ' + typeLabel;
    if (bonuses.length === 0) {
      return base;
    }
    return base + ' · Einloesepreis: ' + bonuses.join(', ');
  }

  function isRewardItem(item) {
    const id = String(item && item.id ? item.id : '').toLowerCase();
    return id.indexOf('belohnung') === 0;
  }

  function renderRewardList(container, items, emptyText, mode) {
    if (!container) {
      return;
    }

    container.innerHTML = '';
    if (!Array.isArray(items) || items.length === 0) {
      container.innerHTML = '<p class="muted">' + emptyText + '</p>';
      return;
    }

    items.forEach(function (item) {
      const progress = getRewardProgressData(item, currentPlayer || { level: 1, coins: 0, quests: [] });
      const unlocked = progress.percent >= 100;

      const entry = document.createElement('article');
      entry.className = 'quest-accordion';

      const header = document.createElement('div');
      header.className = 'quest-accordion-header';

      const main = document.createElement('div');
      main.className = 'quest-accordion-main';

      const textWrap = document.createElement('div');
      textWrap.className = 'quest-main-text';

      const title = document.createElement('h5');
      title.className = 'quest-title';
      title.textContent = item.title || 'Ohne Titel';

      const meta = document.createElement('p');
      meta.className = 'quest-meta';
      meta.textContent = createShopMetaLine(item);

      const condition = document.createElement('p');
      condition.className = 'quest-meta';
      condition.textContent = progress.conditionLabel;

      textWrap.appendChild(title);
      textWrap.appendChild(meta);
      textWrap.appendChild(condition);

      const status = document.createElement('span');
      status.className = unlocked ? 'quest-pending-check' : 'quest-ep';
      status.textContent = unlocked ? 'Eingeloest' : (mode === 'active' ? 'Aktiv' : 'Nicht aktiv');

      main.appendChild(textWrap);
      main.appendChild(status);

      const actions = document.createElement('div');
      actions.className = 'quest-actions';

      const toggleButton = document.createElement('button');
      toggleButton.type = 'button';
      toggleButton.className = 'quest-toggle-btn';
      toggleButton.textContent = 'Details';
      actions.appendChild(toggleButton);

      if (mode === 'active') {
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'quest-edit-btn';
        editBtn.textContent = 'Bearbeiten';
        editBtn.addEventListener('click', function () {
          openRewardEditor(item);
        });
        actions.appendChild(editBtn);
      }

      header.appendChild(main);
      header.appendChild(actions);

      const body = document.createElement('div');
      body.className = 'quest-accordion-body';
      body.hidden = true;

      const progressLabel = document.createElement('p');
      progressLabel.className = 'quest-meta';
      progressLabel.textContent = progress.label;

      const progressWrap = document.createElement('div');
      progressWrap.className = 'reward-progress-wrap';

      const progressBar = document.createElement('div');
      progressBar.className = 'reward-progress-bar reward-progress-' + String(progress.conditionType || 'coins_purchase');
      progressBar.style.width = String(progress.percent) + '%';
      progressWrap.appendChild(progressBar);

      body.appendChild(progressLabel);
      body.appendChild(progressWrap);

      if (item.image) {
        const img = document.createElement('img');
        img.className = 'shop-preview';
        img.src = item.image;
        img.alt = item.title || 'Belohnung';
        img.loading = 'lazy';
        img.addEventListener('error', function () {
          img.style.display = 'none';
        });
        body.appendChild(img);
      }

      toggleButton.addEventListener('click', function () {
        body.hidden = !body.hidden;
        toggleButton.textContent = body.hidden ? 'Details' : 'Weniger';
      });

      entry.appendChild(header);
      entry.appendChild(body);

      container.appendChild(entry);
    });
  }

  function renderParentRewards(player, shopItems) {
    const rewardItems = (Array.isArray(shopItems) ? shopItems : []).filter(isRewardItem);
    const ownedIds = new Set(
      (Array.isArray(player && player.ownedShopItems) ? player.ownedShopItems : []).map(String)
    );

    const activeRewards = rewardItems.filter(function (item) {
      return !ownedIds.has(String(item && item.id ? item.id : ''));
    });
    const redeemedRewards = rewardItems.filter(function (item) {
      return ownedIds.has(String(item && item.id ? item.id : ''));
    });

    renderRewardList(parentRewardsActiveEl, activeRewards, 'Keine aktiven Belohnungen vorhanden.', 'active');
    renderRewardList(parentRewardsRedeemedEl, redeemedRewards, 'Noch keine Belohnung wurde eingeloest.', 'inactive');
  }

  function openRewardEditor(item) {
    if (!editRewardItemPanel || !item) {
      return;
    }

    document.getElementById('edit-reward-item-id').value = String(item.id || '').trim();
    document.getElementById('edit-reward-item-title').value = item.title || '';
    document.getElementById('edit-reward-item-description').value = item.description || '';
    document.getElementById('edit-reward-item-coins').value = String(Number(item.costCoins) || 0);
    document.getElementById('edit-reward-claim-xp').value = String(Math.max(0, Number(item.claimRewardXp) || 0));
    document.getElementById('edit-reward-claim-coins').value = String(Math.max(0, Number(item.claimRewardCoins) || 0));
    document.getElementById('edit-reward-claim-title').value = String(item.claimRewardTitle || '');
    document.getElementById('edit-reward-item-image').value = item.image || '';

    const conditionType = String(item.unlockConditionType || 'coins_purchase');
    const conditionValue = Number(item.unlockConditionValue) || 0;
    const conditionQuestIds = Array.isArray(item.unlockConditionQuestIds)
      ? item.unlockConditionQuestIds.map(function (id) { return String(id); })
      : [];
    const conditionRewardIds = Array.isArray(item.unlockConditionRewardIds)
      ? item.unlockConditionRewardIds.map(function (id) { return String(id); })
      : [];

    document.getElementById('edit-reward-condition').value = conditionType;
    document.getElementById('edit-reward-condition-level').value = String(conditionValue || 2);
    rewardConditionState.edit.questIds = conditionQuestIds;
    rewardConditionState.edit.rewardIds = conditionRewardIds;

    updateRewardConditionFields(conditionType, 'edit');

    editRewardItemPanel.hidden = false;
    setMsg(editRewardItemMsg, '', '');
    editRewardItemPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function getRewardProgressData(item, player) {
    const conditionType = String(item && item.unlockConditionType ? item.unlockConditionType : 'coins_purchase');
    const value = Number(item && item.unlockConditionValue) || 0;
    const startCompletedQuests = Math.max(0, Number(item && item.unlockStartCompletedQuests) || 0);
    const startLevel = Math.max(1, Number(item && item.unlockStartLevel) || 1);
    const cost = Math.max(0, Number(item && item.costCoins) || 0);
    const completedQuests = Array.isArray(player && player.quests)
      ? player.quests.filter(function (q) { return q && q.completed; }).length
      : 0;
    const level = Math.max(1, Number(player && player.level) || 1);
    const coins = Math.max(0, Number(player && player.coins) || 0);
    const completedSinceStart = Math.max(0, completedQuests - startCompletedQuests);
    const levelUpsSinceStart = Math.max(0, level - startLevel);
    const selectedQuestIds = Array.isArray(item && item.unlockConditionQuestIds)
      ? item.unlockConditionQuestIds.map(function (id) { return String(id); }).filter(Boolean)
      : [];
    const selectedRewardIds = Array.isArray(item && item.unlockConditionRewardIds)
      ? item.unlockConditionRewardIds.map(function (id) { return String(id); }).filter(Boolean)
      : [];
    const completedCatalogIds = new Set(
      (Array.isArray(player && player.quests) ? player.quests : [])
        .filter(function (q) { return q && q.completed; })
        .map(function (q) {
          return q.catalogId !== null && q.catalogId !== undefined && q.catalogId !== ''
            ? String(q.catalogId)
            : String(q.id || '');
        })
        .filter(Boolean)
    );
    const ownedIds = new Set(
      (Array.isArray(player && player.ownedShopItems) ? player.ownedShopItems : []).map(String)
    );
    const unlocked = ownedIds.has(String(item && item.id ? item.id : ''));

    if (unlocked) {
      return {
        conditionType: conditionType,
        percent: 100,
        label: '100% abgeschlossen',
        conditionLabel: 'Voraussetzung erreicht und eingelost'
      };
    }

    if (conditionType === 'quests_completed') {
      const target = Math.max(1, value);
      const current = Math.min(target, completedSinceStart);
      return {
        conditionType: conditionType,
        percent: Math.max(0, Math.min(100, (current / target) * 100)),
        label: String(current) + ' / ' + String(target) + ' erledigte Quests seit Anlage',
        conditionLabel: 'Voraussetzung: Quest-Abschluesse'
      };
    }
    if (conditionType === 'level_up') {
      const target = Math.max(1, value);
      const current = Math.min(target, levelUpsSinceStart);
      return {
        conditionType: conditionType,
        percent: Math.max(0, Math.min(100, (current / target) * 100)),
        label: String(current) + ' / ' + String(target) + ' Levelaufstiege seit Anlage',
        conditionLabel: 'Voraussetzung: Levelaufstiege'
      };
    }
    if (conditionType === 'reach_level') {
      const target = Math.max(1, value);
      const current = Math.min(target, level);
      return {
        conditionType: conditionType,
        percent: Math.max(0, Math.min(100, (current / target) * 100)),
        label: 'Level ' + String(current) + ' / ' + String(target),
        conditionLabel: 'Voraussetzung: Level erreichen'
      };
    }

    if (conditionType === 'quest_ids') {
      const target = Math.max(1, selectedQuestIds.length);
      const current = Math.min(target, selectedQuestIds.filter(function (questId) {
        return completedCatalogIds.has(String(questId));
      }).length);
      return {
        conditionType: conditionType,
        percent: Math.max(0, Math.min(100, (current / target) * 100)),
        label: String(current) + ' / ' + String(target) + ' Ziel-Quests erledigt',
        conditionLabel: 'Voraussetzung: Ausgewaehlte Quests'
      };
    }

    if (conditionType === 'reward_ids') {
      const target = Math.max(1, selectedRewardIds.length);
      const current = Math.min(target, selectedRewardIds.filter(function (rewardId) {
        return ownedIds.has(String(rewardId));
      }).length);
      return {
        conditionType: conditionType,
        percent: Math.max(0, Math.min(100, (current / target) * 100)),
        label: String(current) + ' / ' + String(target) + ' Ziel-Belohnungen vorhanden',
        conditionLabel: 'Voraussetzung: Ausgewaehlte Belohnungen'
      };
    }

    const target = Math.max(1, cost);
    const current = Math.min(target, coins);
    const missing = Math.max(0, target - coins);
    return {
      conditionType: conditionType,
      percent: Math.max(0, Math.min(100, (current / target) * 100)),
      label: String(coins) + ' / ' + String(target) + ' Coins',
      conditionLabel: missing > 0 ? 'Noch ' + missing + ' Coins bis Kauf' : 'Kaufbar'
    };
  }

  function updateRewardConditionFields(conditionType, prefix) {
    const p = prefix || 'new';
    const state = rewardConditionState[p] || { questIds: [], rewardIds: [] };
    const coinsRow = document.getElementById(p + '-reward-coins-row');
    const levelRow = document.getElementById(p + '-reward-condition-level-row');
    const questsRow = document.getElementById(p + '-reward-condition-quests-row');
    const rewardsRow = document.getElementById(p + '-reward-condition-rewards-row');
    const coinsInput = document.getElementById(p + '-reward-item-coins');

    function toggleRow(row, show) {
      if (!row) {
        return;
      }
      row.hidden = !show;
      row.style.display = show ? '' : 'none';
    }

    toggleRow(coinsRow, conditionType === 'coins_purchase');
    toggleRow(levelRow, conditionType === 'reach_level');
    toggleRow(questsRow, conditionType === 'quest_ids');
    toggleRow(rewardsRow, conditionType === 'reward_ids');

    if (conditionType === 'quest_ids') {
      renderRewardQuestSelector(p);
      renderRewardQuestSummary(p);
    }

    if (conditionType === 'reward_ids') {
      renderRewardDependencySelector(p);
      renderRewardDependencySummary(p);
    }

    const questSelect = document.getElementById(p + '-reward-quest-select');
    if (questSelect) {
      questSelect.disabled = conditionType !== 'quest_ids' || questSelect.options.length <= 1;
      questSelect.required = conditionType === 'quest_ids';
    }

    const rewardSelect = document.getElementById(p + '-reward-reward-select');
    if (rewardSelect) {
      rewardSelect.disabled = conditionType !== 'reward_ids' || rewardSelect.options.length <= 1;
      rewardSelect.required = conditionType === 'reward_ids';
    }

    if (coinsInput) {
      coinsInput.disabled = conditionType !== 'coins_purchase';
      if (conditionType !== 'coins_purchase') {
        coinsInput.value = '0';
      }
    }
  }

  function getRewardConditionState(prefix) {
    const p = prefix || 'new';
    if (!rewardConditionState[p]) {
      rewardConditionState[p] = { questIds: [], rewardIds: [] };
    }
    return rewardConditionState[p];
  }

  function collectRewardQuestIds(prefix) {
    const state = getRewardConditionState(prefix);
    return Array.isArray(state.questIds) ? state.questIds.slice() : [];
  }

  function collectRewardDependencyIds(prefix) {
    const state = getRewardConditionState(prefix);
    return Array.isArray(state.rewardIds) ? state.rewardIds.slice() : [];
  }

  function buildQuestDependencyOptions(prefix) {
    const state = getRewardConditionState(prefix);
    const selectedSet = new Set((Array.isArray(state.questIds) ? state.questIds : []).map(String));
    const completedCatalogIds = new Set(
      (Array.isArray(currentPlayer && currentPlayer.quests) ? currentPlayer.quests : [])
        .filter(function (q) { return q && q.completed; })
        .map(function (q) {
          return q && q.catalogId !== undefined && q.catalogId !== null && q.catalogId !== ''
            ? String(q.catalogId)
            : '';
        })
        .filter(Boolean)
    );

    return (Array.isArray(currentCatalogQuests) ? currentCatalogQuests : []).map(function (quest) {
      return {
        id: String(quest && quest.id !== undefined ? quest.id : ''),
        title: String(quest && quest.title ? quest.title : 'Ohne Titel'),
        active: !quest || quest.active !== false
      };
    }).filter(function (q) {
      return q.id !== '';
    }).filter(function (q) {
      if (selectedSet.has(q.id)) {
        return true;
      }
      return q.active && !completedCatalogIds.has(q.id);
    });
  }

  function buildRewardDependencyOptions(prefix) {
    const p = prefix || 'new';
    const state = getRewardConditionState(p);
    const selectedSet = new Set((Array.isArray(state.rewardIds) ? state.rewardIds : []).map(String));
    const ownedIds = new Set((Array.isArray(currentPlayer && currentPlayer.ownedShopItems) ? currentPlayer.ownedShopItems : []).map(String));
    const editingItemId = p === 'edit' ? String((document.getElementById('edit-reward-item-id') || {}).value || '') : '';

    return (Array.isArray(currentShopItems) ? currentShopItems : []).filter(function (item) {
      return isRewardItem(item);
    }).map(function (item) {
      return {
        id: String(item && item.id ? item.id : ''),
        title: String(item && item.title ? item.title : 'Ohne Titel'),
        active: !item || item.active !== false
      };
    }).filter(function (item) {
      return item.id !== '' && item.id !== editingItemId;
    }).filter(function (item) {
      if (selectedSet.has(item.id)) {
        return true;
      }
      return item.active && !ownedIds.has(item.id);
    });
  }

  function renderRewardQuestSelector(prefix) {
    const p = prefix || 'new';
    const select = document.getElementById(p + '-reward-quest-select');
    if (!select) {
      return;
    }

    const options = buildQuestDependencyOptions(p);
    const currentValue = String(select.value || '').trim();

    select.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = options.length > 0 ? 'Quest auswaehlen...' : 'Keine aktive offene Quest verfuegbar';
    select.appendChild(placeholder);

    options.forEach(function (questOption) {
      const opt = document.createElement('option');
      opt.value = questOption.id;
      opt.textContent = '[' + questOption.id + '] ' + questOption.title;
      if (questOption.id === currentValue) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });

    const conditionSelect = document.getElementById(p + '-reward-condition');
    const conditionType = String(conditionSelect && conditionSelect.value ? conditionSelect.value : '');
    select.disabled = conditionType !== 'quest_ids' || options.length === 0;
  }

  function renderRewardDependencySelector(prefix) {
    const p = prefix || 'new';
    const select = document.getElementById(p + '-reward-reward-select');
    if (!select) {
      return;
    }

    const options = buildRewardDependencyOptions(p);
    const currentValue = String(select.value || '').trim();

    select.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = options.length > 0 ? 'Belohnung auswaehlen...' : 'Keine aktive offene Belohnung verfuegbar';
    select.appendChild(placeholder);

    options.forEach(function (rewardOption) {
      const opt = document.createElement('option');
      opt.value = rewardOption.id;
      opt.textContent = '[' + rewardOption.id + '] ' + rewardOption.title;
      if (rewardOption.id === currentValue) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });

    const conditionSelect = document.getElementById(p + '-reward-condition');
    const conditionType = String(conditionSelect && conditionSelect.value ? conditionSelect.value : '');
    select.disabled = conditionType !== 'reward_ids' || options.length === 0;
  }

  function renderRewardQuestSummary(prefix) {
    const p = prefix || 'new';
    const state = getRewardConditionState(p);
    const summaryEl = document.getElementById(p + '-reward-quest-summary');
    if (!summaryEl) {
      return;
    }

    const selectedQuestIds = Array.isArray(state.questIds) ? state.questIds : [];
    const byId = new Map((Array.isArray(currentCatalogQuests) ? currentCatalogQuests : []).map(function (quest) {
      return [String(quest && quest.id !== undefined ? quest.id : ''), String(quest && quest.title ? quest.title : 'Ohne Titel')];
    }));

    summaryEl.innerHTML = '';
    if (selectedQuestIds.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'quest-meta';
      empty.textContent = 'Noch keine Voraussetzung ausgewaehlt.';
      summaryEl.appendChild(empty);
      return;
    }

    const title = document.createElement('p');
    title.className = 'quest-meta';
    title.textContent = 'Aktuelle Voraussetzungen:';
    summaryEl.appendChild(title);

    const list = document.createElement('ul');
    list.className = 'reward-quest-summary-list';

    selectedQuestIds.forEach(function (questId) {
      const li = document.createElement('li');
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'chip danger';
      removeBtn.textContent = 'Loeschen';
      removeBtn.addEventListener('click', function () {
        state.questIds = state.questIds.filter(function (id) {
          return String(id) !== String(questId);
        });
        renderRewardQuestSelector(p);
        renderRewardQuestSummary(p);
      });
      const questTitle = byId.get(String(questId)) || '(nicht mehr aktiv/offen)';
      const txt = document.createElement('span');
      txt.textContent = '[' + String(questId) + '] ' + questTitle;
      li.appendChild(txt);
      li.appendChild(removeBtn);
      list.appendChild(li);
    });

    summaryEl.appendChild(list);
  }

  function renderRewardDependencySummary(prefix) {
    const p = prefix || 'new';
    const state = getRewardConditionState(p);
    const summaryEl = document.getElementById(p + '-reward-reward-summary');
    if (!summaryEl) {
      return;
    }

    const selectedRewardIds = Array.isArray(state.rewardIds) ? state.rewardIds : [];
    const byId = new Map((Array.isArray(currentShopItems) ? currentShopItems : []).map(function (item) {
      return [String(item && item.id ? item.id : ''), String(item && item.title ? item.title : 'Ohne Titel')];
    }));

    summaryEl.innerHTML = '';
    if (selectedRewardIds.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'quest-meta';
      empty.textContent = 'Noch keine Voraussetzung ausgewaehlt.';
      summaryEl.appendChild(empty);
      return;
    }

    const title = document.createElement('p');
    title.className = 'quest-meta';
    title.textContent = 'Aktuelle Voraussetzungen:';
    summaryEl.appendChild(title);

    const list = document.createElement('ul');
    list.className = 'reward-quest-summary-list';

    selectedRewardIds.forEach(function (rewardId) {
      const li = document.createElement('li');
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'chip danger';
      removeBtn.textContent = 'Loeschen';
      removeBtn.addEventListener('click', function () {
        state.rewardIds = state.rewardIds.filter(function (id) {
          return String(id) !== String(rewardId);
        });
        renderRewardDependencySelector(p);
        renderRewardDependencySummary(p);
      });

      const rewardTitle = byId.get(String(rewardId)) || '(nicht mehr aktiv/offen)';
      const txt = document.createElement('span');
      txt.textContent = '[' + String(rewardId) + '] ' + rewardTitle;
      li.appendChild(txt);
      li.appendChild(removeBtn);
      list.appendChild(li);
    });

    summaryEl.appendChild(list);
  }

  function renderParentShopItems(items) {
    if (!parentShopItemsEl) {
      return;
    }

    parentShopItemsEl.innerHTML = '';
    const sorted = (Array.isArray(items) ? items.slice() : []).sort(function (a, b) {
      const aCost = Number(a && a.costCoins) || 0;
      const bCost = Number(b && b.costCoins) || 0;
      if (aCost !== bCost) {
        return aCost - bCost;
      }
      return String(a && a.title ? a.title : '').localeCompare(String(b && b.title ? b.title : ''), 'de');
    });

    if (sorted.length === 0) {
      parentShopItemsEl.innerHTML = '<p class="muted">Noch keine Shopitems vorhanden.</p>';
      return;
    }

    sorted.forEach(function (item) {
      const entry = document.createElement('article');
      entry.className = 'parent-shop-entry';

      const header = document.createElement('div');
      header.className = 'parent-shop-header';

      const titleWrap = document.createElement('div');

      const title = document.createElement('h5');
      title.className = 'quest-title';
      title.textContent = item.title || 'Ohne Titel';

      const meta = document.createElement('p');
      meta.className = 'quest-meta';
      meta.textContent = createShopMetaLine(item);

      titleWrap.appendChild(title);
      titleWrap.appendChild(meta);

      const actions = document.createElement('div');
      actions.className = 'parent-shop-actions';

      const expandBtn = document.createElement('button');
      expandBtn.type = 'button';
      expandBtn.className = 'chip';
      expandBtn.textContent = 'Beschreibung';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'quest-edit-btn';
      editBtn.textContent = 'Bearbeiten';

      actions.appendChild(expandBtn);
      actions.appendChild(editBtn);

      header.appendChild(titleWrap);
      header.appendChild(actions);

      const description = document.createElement('p');
      description.className = 'parent-shop-description';
      description.hidden = true;
      description.textContent = item.description || 'Keine Beschreibung.';

      expandBtn.addEventListener('click', function () {
        const isHidden = description.hidden;
        description.hidden = !isHidden;
        expandBtn.textContent = isHidden ? 'Beschreibung verbergen' : 'Beschreibung';
      });

      editBtn.addEventListener('click', function () {
        openShopItemEditor(item);
      });

      entry.appendChild(header);
      entry.appendChild(description);
      parentShopItemsEl.appendChild(entry);
    });
  }

  async function refreshParentShopItems() {
    const items = await loadShopItems();
    currentShopItems = items;
    renderParentShopItems(items);
    renderParentRewards(currentPlayer || { ownedShopItems: [] }, items);
  }

  async function createNewRewardItem(event) {
    event.preventDefault();

    const title = (document.getElementById('new-reward-item-title').value || '').trim();
    const description = (document.getElementById('new-reward-item-description').value || '').trim();
    const costCoins = Number(document.getElementById('new-reward-item-coins').value || 0);
    const claimRewardXp = Number(document.getElementById('new-reward-claim-xp').value || 0);
    const claimRewardCoins = Number(document.getElementById('new-reward-claim-coins').value || 0);
    const claimRewardTitle = (document.getElementById('new-reward-claim-title').value || '').trim();
    const image = (document.getElementById('new-reward-item-image').value || '').trim();
    const conditionType = (document.getElementById('new-reward-condition').value || 'quest_ids').trim();
    const levelValue = Number(document.getElementById('new-reward-condition-level').value || 0);
    const startLevel = Math.max(1, Number(currentPlayer && currentPlayer.level) || 1);
    const selectedQuestIds = collectRewardQuestIds('new');
    const selectedRewardIds = collectRewardDependencyIds('new');
    const completedQuestCount = Array.isArray(currentPlayer && currentPlayer.quests)
      ? currentPlayer.quests.filter(function (q) { return q && q.completed; }).length
      : 0;

    const conditionValue = conditionType === 'reach_level' ? levelValue : null;

    if (!title) {
      setMsg(newRewardItemMsg, 'Bitte einen Titel eingeben.', 'error');
      return;
    }

    if (conditionType === 'quest_ids' && selectedQuestIds.length === 0) {
      setMsg(newRewardItemMsg, 'Bitte mindestens eine Quest als Voraussetzung auswaehlen.', 'error');
      return;
    }

    if (conditionType === 'reward_ids' && selectedRewardIds.length === 0) {
      setMsg(newRewardItemMsg, 'Bitte mindestens eine Belohnung als Voraussetzung auswaehlen.', 'error');
      return;
    }

    try {
      const response = await fetch('api/shop_items.php?action=create_item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          description: description,
          costCoins: costCoins,
          type: 'reward_item',
          image: image,
          unlockConditionType: conditionType,
          unlockConditionValue: conditionValue,
          unlockConditionQuestIds: conditionType === 'quest_ids' ? selectedQuestIds : [],
          unlockConditionRewardIds: conditionType === 'reward_ids' ? selectedRewardIds : [],
          claimRewardXp: claimRewardXp,
          claimRewardCoins: claimRewardCoins,
          claimRewardTitle: claimRewardTitle,
          unlockStartCompletedQuests: completedQuestCount,
          unlockStartLevel: startLevel
        })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMsg(newRewardItemMsg, data.error || 'Belohnung konnte nicht erstellt werden.', 'error');
        return;
      }

      setMsg(newRewardItemMsg, 'Belohnung wurde erstellt.', 'success');
      if (newRewardItemForm) {
        newRewardItemForm.reset();
      }
      rewardConditionState.new.questIds = [];
      rewardConditionState.new.rewardIds = [];
      updateRewardConditionFields('quest_ids', 'new');
      if (newRewardItemPanel) {
        newRewardItemPanel.hidden = true;
      }
      if (toggleNewRewardItemBtn) {
        toggleNewRewardItemBtn.textContent = 'Belohnung anlegen';
      }

      await refreshParentShopItems();
    } catch (e) {
      setMsg(newRewardItemMsg, 'Verbindungsfehler beim Erstellen.', 'error');
    }
  }

  async function saveEditedRewardItem(event) {
    event.preventDefault();

    const itemId = (document.getElementById('edit-reward-item-id').value || '').trim();
    const title = (document.getElementById('edit-reward-item-title').value || '').trim();
    const description = (document.getElementById('edit-reward-item-description').value || '').trim();
    const costCoins = Number(document.getElementById('edit-reward-item-coins').value || 0);
    const claimRewardXp = Number(document.getElementById('edit-reward-claim-xp').value || 0);
    const claimRewardCoins = Number(document.getElementById('edit-reward-claim-coins').value || 0);
    const claimRewardTitle = (document.getElementById('edit-reward-claim-title').value || '').trim();
    const image = (document.getElementById('edit-reward-item-image').value || '').trim();
    const conditionType = (document.getElementById('edit-reward-condition').value || 'coins_purchase').trim();
    const levelValue = Number(document.getElementById('edit-reward-condition-level').value || 0);
    const selectedQuestIds = collectRewardQuestIds('edit');
    const selectedRewardIds = collectRewardDependencyIds('edit');

    const conditionValue = conditionType === 'reach_level' ? levelValue : null;

    if (!itemId || !title) {
      setMsg(editRewardItemMsg, 'Bitte Titel ausfuellen.', 'error');
      return;
    }

    if (conditionType === 'quest_ids' && selectedQuestIds.length === 0) {
      setMsg(editRewardItemMsg, 'Bitte mindestens eine Quest als Voraussetzung auswaehlen.', 'error');
      return;
    }

    if (conditionType === 'reward_ids' && selectedRewardIds.length === 0) {
      setMsg(editRewardItemMsg, 'Bitte mindestens eine Belohnung als Voraussetzung auswaehlen.', 'error');
      return;
    }

    try {
      const response = await fetch('api/shop_items.php?action=update_item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: itemId,
          title: title,
          description: description,
          costCoins: costCoins,
          type: 'reward_item',
          image: image,
          unlockConditionType: conditionType,
          unlockConditionValue: conditionValue,
          unlockConditionQuestIds: conditionType === 'quest_ids' ? selectedQuestIds : [],
          unlockConditionRewardIds: conditionType === 'reward_ids' ? selectedRewardIds : [],
          claimRewardXp: claimRewardXp,
          claimRewardCoins: claimRewardCoins,
          claimRewardTitle: claimRewardTitle
        })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMsg(editRewardItemMsg, data.error || 'Belohnung konnte nicht gespeichert werden.', 'error');
        return;
      }

      setMsg(editRewardItemMsg, 'Belohnung gespeichert.', 'success');
      await refreshParentShopItems();
      if (editRewardItemPanel) {
        editRewardItemPanel.hidden = true;
      }
    } catch (e) {
      setMsg(editRewardItemMsg, 'Verbindungsfehler beim Speichern.', 'error');
    }
  }

  async function deleteEditedRewardItem() {
    const itemId = (document.getElementById('edit-reward-item-id').value || '').trim();
    if (!itemId) {
      setMsg(editRewardItemMsg, 'Keine Belohnung ausgewaehlt.', 'error');
      return;
    }

    const sure = window.confirm('Soll diese Belohnung wirklich geloescht werden?');
    if (!sure) {
      return;
    }

    try {
      const response = await fetch('api/shop_items.php?action=delete_item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: itemId })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMsg(editRewardItemMsg, data.error || 'Belohnung konnte nicht geloescht werden.', 'error');
        return;
      }

      setMsg(editRewardItemMsg, 'Belohnung geloescht.', 'success');
      if (editRewardItemPanel) {
        editRewardItemPanel.hidden = true;
      }
      await refreshParentShopItems();
    } catch (e) {
      setMsg(editRewardItemMsg, 'Verbindungsfehler beim Loeschen.', 'error');
    }
  }

  async function unlockEditedRewardItem() {
    const itemId = (document.getElementById('edit-reward-item-id').value || '').trim();
    if (!itemId) {
      setMsg(editRewardItemMsg, 'Keine Belohnung ausgewaehlt.', 'error');
      return;
    }

    try {
      const response = await fetch('api/quest.php?action=unlock_reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: getOrCreatePlayerId(),
          rewardItemId: itemId
        })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMsg(editRewardItemMsg, data.error || 'Belohnung konnte nicht freigeschaltet werden.', 'error');
        return;
      }

      currentPlayer = data.player;
      setMsg(editRewardItemMsg, 'Belohnung wurde freigeschaltet.', 'success');
      await refreshParentShopItems();
      renderParentRewards(currentPlayer, currentShopItems);
    } catch (e) {
      setMsg(editRewardItemMsg, 'Verbindungsfehler beim Freischalten.', 'error');
    }
  }

  function createAchievementMetaLine(item) {
    if (item && item.systemManaged) {
      return 'System-Achievement';
    }

    const conditionType = String(item && item.unlockConditionType ? item.unlockConditionType : 'quest_ids');
    const conditionValue = Number(item && item.unlockConditionValue) || 0;
    const questIds = Array.isArray(item && item.unlockConditionQuestIds) ? item.unlockConditionQuestIds : [];
    const rewardIds = Array.isArray(item && item.unlockConditionRewardIds) ? item.unlockConditionRewardIds : [];
    const rewardTitle = String(item && item.titleReward ? item.titleReward : '').trim();
    let base = '';

    if (conditionType === 'reach_level') {
      base = 'Level ' + String(conditionValue) + ' erreichen';
    } else if (conditionType === 'reward_ids') {
      base = String(rewardIds.length) + ' Belohnung(en) als Voraussetzung';
    } else {
      base = String(questIds.length) + ' Quest(s) als Voraussetzung';
    }

    if (!rewardTitle) {
      return base;
    }
    return base + ' | Titel: ' + rewardTitle;
  }

  function getAchievementConditionState(prefix) {
    const p = prefix || 'new';
    if (!achievementConditionState[p]) {
      achievementConditionState[p] = { questIds: [], rewardIds: [] };
    }
    return achievementConditionState[p];
  }

  function collectAchievementQuestIds(prefix) {
    return getAchievementConditionState(prefix).questIds.slice();
  }

  function collectAchievementRewardIds(prefix) {
    return getAchievementConditionState(prefix).rewardIds.slice();
  }

  function buildAchievementQuestOptions(prefix) {
    const state = getAchievementConditionState(prefix);
    const selectedSet = new Set(state.questIds.map(String));
    const completedCatalogIds = new Set(
      (Array.isArray(currentPlayer && currentPlayer.quests) ? currentPlayer.quests : [])
        .filter(function (q) { return q && q.completed; })
        .map(function (q) {
          return q && q.catalogId !== undefined && q.catalogId !== null && q.catalogId !== ''
            ? String(q.catalogId)
            : '';
        })
        .filter(Boolean)
    );

    return (Array.isArray(currentCatalogQuests) ? currentCatalogQuests : []).map(function (quest) {
      return {
        id: String(quest && quest.id !== undefined ? quest.id : ''),
        title: String(quest && quest.title ? quest.title : 'Ohne Titel'),
        active: !quest || quest.active !== false
      };
    }).filter(function (quest) {
      return quest.id !== '';
    }).filter(function (quest) {
      if (selectedSet.has(quest.id)) {
        return true;
      }
      return quest.active && !completedCatalogIds.has(quest.id);
    });
  }

  function buildAchievementRewardOptions(prefix) {
    const p = prefix || 'new';
    const state = getAchievementConditionState(p);
    const selectedSet = new Set(state.rewardIds.map(String));
    const ownedIds = new Set((Array.isArray(currentPlayer && currentPlayer.ownedShopItems) ? currentPlayer.ownedShopItems : []).map(String));
    const editingItemId = p === 'edit' ? String((document.getElementById('edit-achievement-item-id') || {}).value || '') : '';

    return (Array.isArray(currentShopItems) ? currentShopItems : []).filter(isRewardItem).map(function (item) {
      return {
        id: String(item && item.id ? item.id : ''),
        title: String(item && item.title ? item.title : 'Ohne Titel'),
        active: !item || item.active !== false
      };
    }).filter(function (item) {
      return item.id !== '' && item.id !== editingItemId;
    }).filter(function (item) {
      if (selectedSet.has(item.id)) {
        return true;
      }
      return item.active && !ownedIds.has(item.id);
    });
  }

  function renderAchievementQuestSelector(prefix) {
    const p = prefix || 'new';
    const select = document.getElementById(p + '-achievement-quest-select');
    if (!select) {
      return;
    }

    const options = buildAchievementQuestOptions(p);
    const currentValue = String(select.value || '').trim();
    select.innerHTML = '';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = options.length > 0 ? 'Quest auswaehlen...' : 'Keine aktive offene Quest verfuegbar';
    select.appendChild(placeholder);

    options.forEach(function (questOption) {
      const opt = document.createElement('option');
      opt.value = questOption.id;
      opt.textContent = '[' + questOption.id + '] ' + questOption.title;
      if (questOption.id === currentValue) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });

    const conditionSelect = document.getElementById(p + '-achievement-condition');
    const conditionType = String(conditionSelect && conditionSelect.value ? conditionSelect.value : '');
    select.disabled = conditionType !== 'quest_ids' || options.length === 0;
  }

  function renderAchievementRewardSelector(prefix) {
    const p = prefix || 'new';
    const select = document.getElementById(p + '-achievement-reward-select');
    if (!select) {
      return;
    }

    const options = buildAchievementRewardOptions(p);
    const currentValue = String(select.value || '').trim();
    select.innerHTML = '';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = options.length > 0 ? 'Belohnung auswaehlen...' : 'Keine aktive offene Belohnung verfuegbar';
    select.appendChild(placeholder);

    options.forEach(function (rewardOption) {
      const opt = document.createElement('option');
      opt.value = rewardOption.id;
      opt.textContent = '[' + rewardOption.id + '] ' + rewardOption.title;
      if (rewardOption.id === currentValue) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });

    const conditionSelect = document.getElementById(p + '-achievement-condition');
    const conditionType = String(conditionSelect && conditionSelect.value ? conditionSelect.value : '');
    select.disabled = conditionType !== 'reward_ids' || options.length === 0;
  }

  function renderAchievementQuestSummary(prefix) {
    const p = prefix || 'new';
    const state = getAchievementConditionState(p);
    const summaryEl = document.getElementById(p + '-achievement-quest-summary');
    if (!summaryEl) {
      return;
    }

    const byId = new Map((Array.isArray(currentCatalogQuests) ? currentCatalogQuests : []).map(function (quest) {
      return [String(quest && quest.id !== undefined ? quest.id : ''), String(quest && quest.title ? quest.title : 'Ohne Titel')];
    }));

    summaryEl.innerHTML = '';
    if (state.questIds.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'quest-meta';
      empty.textContent = 'Noch keine Voraussetzung ausgewaehlt.';
      summaryEl.appendChild(empty);
      return;
    }

    const title = document.createElement('p');
    title.className = 'quest-meta';
    title.textContent = 'Aktuelle Voraussetzungen:';
    summaryEl.appendChild(title);

    const list = document.createElement('ul');
    list.className = 'reward-quest-summary-list';
    state.questIds.forEach(function (questId) {
      const li = document.createElement('li');
      const text = document.createElement('span');
      text.textContent = '[' + String(questId) + '] ' + (byId.get(String(questId)) || '(nicht mehr aktiv/offen)');
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'chip danger';
      removeBtn.textContent = 'Loeschen';
      removeBtn.addEventListener('click', function () {
        state.questIds = state.questIds.filter(function (id) { return String(id) !== String(questId); });
        renderAchievementQuestSelector(p);
        renderAchievementQuestSummary(p);
      });
      li.appendChild(text);
      li.appendChild(removeBtn);
      list.appendChild(li);
    });
    summaryEl.appendChild(list);
  }

  function renderAchievementRewardSummary(prefix) {
    const p = prefix || 'new';
    const state = getAchievementConditionState(p);
    const summaryEl = document.getElementById(p + '-achievement-reward-summary');
    if (!summaryEl) {
      return;
    }

    const byId = new Map((Array.isArray(currentShopItems) ? currentShopItems : []).map(function (item) {
      return [String(item && item.id ? item.id : ''), String(item && item.title ? item.title : 'Ohne Titel')];
    }));

    summaryEl.innerHTML = '';
    if (state.rewardIds.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'quest-meta';
      empty.textContent = 'Noch keine Voraussetzung ausgewaehlt.';
      summaryEl.appendChild(empty);
      return;
    }

    const title = document.createElement('p');
    title.className = 'quest-meta';
    title.textContent = 'Aktuelle Voraussetzungen:';
    summaryEl.appendChild(title);

    const list = document.createElement('ul');
    list.className = 'reward-quest-summary-list';
    state.rewardIds.forEach(function (rewardId) {
      const li = document.createElement('li');
      const text = document.createElement('span');
      text.textContent = '[' + String(rewardId) + '] ' + (byId.get(String(rewardId)) || '(nicht mehr aktiv/offen)');
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'chip danger';
      removeBtn.textContent = 'Loeschen';
      removeBtn.addEventListener('click', function () {
        state.rewardIds = state.rewardIds.filter(function (id) { return String(id) !== String(rewardId); });
        renderAchievementRewardSelector(p);
        renderAchievementRewardSummary(p);
      });
      li.appendChild(text);
      li.appendChild(removeBtn);
      list.appendChild(li);
    });
    summaryEl.appendChild(list);
  }

  function updateAchievementConditionFields(conditionType, prefix) {
    const p = prefix || 'new';
    const levelRow = document.getElementById(p + '-achievement-condition-level-row');
    const questsRow = document.getElementById(p + '-achievement-condition-quests-row');
    const rewardsRow = document.getElementById(p + '-achievement-condition-rewards-row');

    function toggleRow(row, show) {
      if (!row) {
        return;
      }
      row.hidden = !show;
      row.style.display = show ? '' : 'none';
    }

    toggleRow(levelRow, conditionType === 'reach_level');
    toggleRow(questsRow, conditionType === 'quest_ids');
    toggleRow(rewardsRow, conditionType === 'reward_ids');

    renderAchievementQuestSelector(p);
    renderAchievementQuestSummary(p);
    renderAchievementRewardSelector(p);
    renderAchievementRewardSummary(p);
  }

  function renderParentAchievementItems(items) {
    if (!parentAchievementItemsEl) {
      return;
    }

    parentAchievementItemsEl.innerHTML = '';
    const sorted = (Array.isArray(items) ? items.slice() : []).filter(function (item) {
      return item && !item.systemManaged;
    }).sort(function (a, b) {
      return String(a && a.title ? a.title : '').localeCompare(String(b && b.title ? b.title : ''), 'de');
    });

    if (sorted.length === 0) {
      parentAchievementItemsEl.innerHTML = '<p class="muted">Noch keine benutzerdefinierten Achievements vorhanden. System-Achievements bleiben unveraendert und werden hier nicht gelistet.</p>';
      return;
    }

    sorted.forEach(function (item) {
      const entry = document.createElement('article');
      entry.className = 'parent-shop-entry';

      const header = document.createElement('div');
      header.className = 'parent-shop-header';

      const titleWrap = document.createElement('div');

      const title = document.createElement('h5');
      title.className = 'quest-title';
      title.textContent = item.title || 'Ohne Titel';

      const meta = document.createElement('p');
      meta.className = 'quest-meta';
      meta.textContent = createAchievementMetaLine(item);

      titleWrap.appendChild(title);
      titleWrap.appendChild(meta);

      const actions = document.createElement('div');
      actions.className = 'parent-shop-actions';

      const expandBtn = document.createElement('button');
      expandBtn.type = 'button';
      expandBtn.className = 'chip';
      expandBtn.textContent = 'Details';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'quest-edit-btn';
      editBtn.textContent = 'Bearbeiten';

      actions.appendChild(expandBtn);
      actions.appendChild(editBtn);

      header.appendChild(titleWrap);
      header.appendChild(actions);

      const description = document.createElement('p');
      description.className = 'parent-shop-description';
      description.hidden = true;
      description.textContent = createAchievementMetaLine(item) + ' | Bild: ' + (item.image || 'Kein Bildpfad.');

      expandBtn.addEventListener('click', function () {
        const isHidden = description.hidden;
        description.hidden = !isHidden;
        expandBtn.textContent = isHidden ? 'Details verbergen' : 'Details';
      });

      editBtn.addEventListener('click', function () {
        openAchievementItemEditor(item);
      });

      entry.appendChild(header);
      entry.appendChild(description);
      parentAchievementItemsEl.appendChild(entry);
    });
  }

  async function refreshParentAchievementItems() {
    const items = await loadAchievementItems();
    currentAchievementItems = items;
    renderParentAchievementItems(items);
  }

  function openAchievementItemEditor(item) {
    if (!editAchievementItemPanel || !item) {
      return;
    }

    const idEl = document.getElementById('edit-achievement-item-id');
    const titleEl = document.getElementById('edit-achievement-item-title');
    const imageEl = document.getElementById('edit-achievement-item-image');
    const rewardTitleEl = document.getElementById('edit-achievement-reward-title');
    const conditionEl = document.getElementById('edit-achievement-condition');
    const levelEl = document.getElementById('edit-achievement-condition-level');

    idEl.value = String(item.id || '').trim();
    titleEl.value = item.title || '';
    imageEl.value = item.image || '';
    rewardTitleEl.value = item.titleReward || '';
    conditionEl.value = item.unlockConditionType || 'quest_ids';
    levelEl.value = String(Number(item.unlockConditionValue) || 2);
    achievementConditionState.edit.questIds = Array.isArray(item.unlockConditionQuestIds) ? item.unlockConditionQuestIds.map(String) : [];
    achievementConditionState.edit.rewardIds = Array.isArray(item.unlockConditionRewardIds) ? item.unlockConditionRewardIds.map(String) : [];
    updateAchievementConditionFields(conditionEl.value, 'edit');

    editAchievementItemPanel.hidden = false;
    setMsg(editAchievementItemMsg, '', '');
    editAchievementItemPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async function createNewAchievementItem(event) {
    event.preventDefault();

    const title = (document.getElementById('new-achievement-item-title').value || '').trim();
    const image = (document.getElementById('new-achievement-item-image').value || '').trim();
    const titleReward = (document.getElementById('new-achievement-reward-title').value || '').trim();
    const conditionType = (document.getElementById('new-achievement-condition').value || 'quest_ids').trim();
    const conditionValue = Number(document.getElementById('new-achievement-condition-level').value || 0);
    const questIds = collectAchievementQuestIds('new');
    const rewardIds = collectAchievementRewardIds('new');

    if (!title) {
      setMsg(newAchievementItemMsg, 'Bitte einen Titel eingeben.', 'error');
      return;
    }
    if (conditionType === 'reach_level' && conditionValue < 1) {
      setMsg(newAchievementItemMsg, 'Bitte ein gueltiges Level-Ziel eingeben.', 'error');
      return;
    }
    if (conditionType === 'quest_ids' && questIds.length === 0) {
      setMsg(newAchievementItemMsg, 'Bitte mindestens eine Quest als Voraussetzung hinzufuegen.', 'error');
      return;
    }
    if (conditionType === 'reward_ids' && rewardIds.length === 0) {
      setMsg(newAchievementItemMsg, 'Bitte mindestens eine Belohnung als Voraussetzung hinzufuegen.', 'error');
      return;
    }

    try {
      const response = await fetch('api/achievement_items.php?action=create_item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          image: image,
          titleReward: titleReward,
          unlockConditionType: conditionType,
          unlockConditionValue: conditionType === 'reach_level' ? conditionValue : null,
          unlockConditionQuestIds: conditionType === 'quest_ids' ? questIds : [],
          unlockConditionRewardIds: conditionType === 'reward_ids' ? rewardIds : []
        })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMsg(newAchievementItemMsg, data.error || 'Achievement konnte nicht erstellt werden.', 'error');
        return;
      }

      setMsg(newAchievementItemMsg, 'Achievement wurde erstellt.', 'success');
      newAchievementItemForm.reset();
      achievementConditionState.new.questIds = [];
      achievementConditionState.new.rewardIds = [];
      updateAchievementConditionFields('quest_ids', 'new');
      if (newAchievementItemPanel) {
        newAchievementItemPanel.hidden = true;
      }
      if (toggleNewAchievementItemBtn) {
        toggleNewAchievementItemBtn.textContent = 'Achievement anlegen';
      }
      await refreshParentAchievementItems();
      renderParentStats(currentPlayer || { quests: [] }, currentShopItems, currentAchievementItems);
    } catch (e) {
      setMsg(newAchievementItemMsg, 'Verbindungsfehler beim Erstellen.', 'error');
    }
  }

  async function saveEditedAchievementItem(event) {
    event.preventDefault();

    const itemId = (document.getElementById('edit-achievement-item-id').value || '').trim();
    const title = (document.getElementById('edit-achievement-item-title').value || '').trim();
    const image = (document.getElementById('edit-achievement-item-image').value || '').trim();
    const titleReward = (document.getElementById('edit-achievement-reward-title').value || '').trim();
    const conditionType = (document.getElementById('edit-achievement-condition').value || 'quest_ids').trim();
    const conditionValue = Number(document.getElementById('edit-achievement-condition-level').value || 0);
    const questIds = collectAchievementQuestIds('edit');
    const rewardIds = collectAchievementRewardIds('edit');

    if (!itemId || !title) {
      setMsg(editAchievementItemMsg, 'Bitte alle Felder korrekt ausfuellen.', 'error');
      return;
    }
    if (conditionType === 'reach_level' && conditionValue < 1) {
      setMsg(editAchievementItemMsg, 'Bitte ein gueltiges Level-Ziel eingeben.', 'error');
      return;
    }
    if (conditionType === 'quest_ids' && questIds.length === 0) {
      setMsg(editAchievementItemMsg, 'Bitte mindestens eine Quest als Voraussetzung hinzufuegen.', 'error');
      return;
    }
    if (conditionType === 'reward_ids' && rewardIds.length === 0) {
      setMsg(editAchievementItemMsg, 'Bitte mindestens eine Belohnung als Voraussetzung hinzufuegen.', 'error');
      return;
    }

    try {
      const response = await fetch('api/achievement_items.php?action=update_item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: itemId,
          title: title,
          image: image,
          titleReward: titleReward,
          unlockConditionType: conditionType,
          unlockConditionValue: conditionType === 'reach_level' ? conditionValue : null,
          unlockConditionQuestIds: conditionType === 'quest_ids' ? questIds : [],
          unlockConditionRewardIds: conditionType === 'reward_ids' ? rewardIds : []
        })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMsg(editAchievementItemMsg, data.error || 'Achievement konnte nicht gespeichert werden.', 'error');
        return;
      }

      setMsg(editAchievementItemMsg, 'Achievement erfolgreich gespeichert.', 'success');
      await refreshParentAchievementItems();
      renderParentStats(currentPlayer || { quests: [] }, currentShopItems, currentAchievementItems);

      if (editAchievementItemForm) {
        editAchievementItemForm.reset();
      }
      if (editAchievementItemPanel) {
        window.setTimeout(function () {
          editAchievementItemPanel.hidden = true;
        }, 800);
      }
    } catch (e) {
      setMsg(editAchievementItemMsg, 'Verbindungsfehler beim Speichern.', 'error');
    }
  }

  async function deleteEditedAchievementItem() {
    const itemId = (document.getElementById('edit-achievement-item-id').value || '').trim();
    if (!itemId) {
      setMsg(editAchievementItemMsg, 'Kein Achievement ausgewaehlt.', 'error');
      return;
    }

    const sure = window.confirm('Bist du sicher, dass du dieses Achievement loeschen moechtest?');
    if (!sure) {
      return;
    }

    try {
      const response = await fetch('api/achievement_items.php?action=delete_item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: itemId })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMsg(editAchievementItemMsg, data.error || 'Achievement konnte nicht geloescht werden.', 'error');
        return;
      }

      setMsg(editAchievementItemMsg, 'Achievement wurde geloescht.', 'success');
      if (editAchievementItemForm) {
        editAchievementItemForm.reset();
      }
      if (editAchievementItemPanel) {
        editAchievementItemPanel.hidden = true;
      }
      await refreshParentAchievementItems();
      renderParentStats(currentPlayer || { quests: [] }, currentShopItems, currentAchievementItems);
    } catch (e) {
      setMsg(editAchievementItemMsg, 'Verbindungsfehler beim Loeschen.', 'error');
    }
  }

  function openShopItemEditor(item) {
    if (!editShopItemPanel || !item) {
      return;
    }

    const idEl = document.getElementById('edit-shop-item-id');
    const titleEl = document.getElementById('edit-shop-item-title');
    const descEl = document.getElementById('edit-shop-item-description');
    const coinsEl = document.getElementById('edit-shop-item-coins');
    const typeEl = document.getElementById('edit-shop-item-type');
    const imageEl = document.getElementById('edit-shop-item-image');
    const boostPctEl = document.getElementById('edit-shop-item-boost-percent');
    const boostQEl = document.getElementById('edit-shop-item-boost-quests');

    idEl.value = String(item.id || '').trim();
    titleEl.value = item.title || '';
    descEl.value = item.description || '';
    coinsEl.value = String(Number(item.costCoins) || 0);

    const type = item.type || 'profile_image';
    typeEl.value = type;
    if (imageEl) { imageEl.value = item.image || DEFAULT_SHOP_IMAGE_PATH; }
    if (boostPctEl) { boostPctEl.value = String(Number(item.boostPercent) || 5); }
    if (boostQEl) { boostQEl.value = String(Number(item.boostQuests) || 5); }
    updateShopTypeFields('edit', type);

    editShopItemPanel.hidden = false;
    setMsg(editShopItemMsg, '', '');
    editShopItemPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async function createNewShopItem(event) {
    event.preventDefault();

    const title = (document.getElementById('new-shop-item-title').value || '').trim();
    const description = (document.getElementById('new-shop-item-description').value || '').trim();
    const costCoins = Number(document.getElementById('new-shop-item-coins').value || 0);
    const type = (document.getElementById('new-shop-item-type') || {}).value || 'profile_image';
    const image = ((document.getElementById('new-shop-item-image') || {}).value || '').trim();
    const boostPercent = Number((document.getElementById('new-shop-item-boost-percent') || {}).value || 5);
    const boostQuests = Number((document.getElementById('new-shop-item-boost-quests') || {}).value || 5);

    if (!title) {
      setMsg(newShopItemMsg, 'Bitte einen Titel eingeben.', 'error');
      return;
    }

    try {
      const response = await fetch('api/shop_items.php?action=create_item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          description: description,
          costCoins: costCoins,
          type: type,
          image: image,
          boostPercent: boostPercent,
          boostQuests: boostQuests
        })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMsg(newShopItemMsg, data.error || 'Shopitem konnte nicht erstellt werden.', 'error');
        return;
      }

      setMsg(newShopItemMsg, 'Shopitem wurde erstellt.', 'success');
      newShopItemForm.reset();
      const newTypeEl = document.getElementById('new-shop-item-type');
      if (newTypeEl) {
        newTypeEl.value = 'profile_image';
      }
      const newImageEl = document.getElementById('new-shop-item-image');
      if (newImageEl) {
        newImageEl.value = DEFAULT_SHOP_IMAGE_PATH;
      }
      updateShopTypeFields('new', 'profile_image');
      if (newShopItemPanel) {
        newShopItemPanel.hidden = true;
      }
      if (toggleNewShopItemBtn) {
        toggleNewShopItemBtn.textContent = 'Shopitem anlegen';
      }
      await refreshParentShopItems();
    } catch (e) {
      setMsg(newShopItemMsg, 'Verbindungsfehler beim Erstellen.', 'error');
    }
  }

  async function saveEditedShopItem(event) {
    event.preventDefault();

    const itemId = (document.getElementById('edit-shop-item-id').value || '').trim();
    const title = (document.getElementById('edit-shop-item-title').value || '').trim();
    const description = (document.getElementById('edit-shop-item-description').value || '').trim();
    const costCoins = Number(document.getElementById('edit-shop-item-coins').value || 0);
    const type = (document.getElementById('edit-shop-item-type') || {}).value || 'profile_image';
    const image = ((document.getElementById('edit-shop-item-image') || {}).value || '').trim();
    const boostPercent = Number((document.getElementById('edit-shop-item-boost-percent') || {}).value || 5);
    const boostQuests = Number((document.getElementById('edit-shop-item-boost-quests') || {}).value || 5);

    if (!itemId || !title) {
      setMsg(editShopItemMsg, 'Bitte Titel eingeben.', 'error');
      return;
    }

    try {
      const response = await fetch('api/shop_items.php?action=update_item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: itemId,
          title: title,
          description: description,
          costCoins: costCoins,
          type: type,
          image: image,
          boostPercent: boostPercent,
          boostQuests: boostQuests
        })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMsg(editShopItemMsg, data.error || 'Shopitem konnte nicht gespeichert werden.', 'error');
        return;
      }

      setMsg(editShopItemMsg, 'Shopitem erfolgreich gespeichert.', 'success');
      await refreshParentShopItems();

      if (editShopItemForm) {
        editShopItemForm.reset();
      }
      if (editShopItemPanel) {
        window.setTimeout(function () {
          editShopItemPanel.hidden = true;
        }, 800);
      }
    } catch (e) {
      setMsg(editShopItemMsg, 'Verbindungsfehler beim Speichern.', 'error');
    }
  }

  async function deleteEditedShopItem() {
    const itemId = (document.getElementById('edit-shop-item-id').value || '').trim();
    if (!itemId) {
      setMsg(editShopItemMsg, 'Kein Shopitem ausgewaehlt.', 'error');
      return;
    }

    const sure = window.confirm('Bist du sicher, dass du dieses Shopitem loeschen moechtest?');
    if (!sure) {
      return;
    }

    try {
      const response = await fetch('api/shop_items.php?action=delete_item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: itemId })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMsg(editShopItemMsg, data.error || 'Shopitem konnte nicht geloescht werden.', 'error');
        return;
      }

      setMsg(editShopItemMsg, 'Shopitem wurde geloescht.', 'success');
      if (editShopItemForm) {
        editShopItemForm.reset();
      }
      if (editShopItemPanel) {
        editShopItemPanel.hidden = true;
      }
      await refreshParentShopItems();
    } catch (e) {
      setMsg(editShopItemMsg, 'Verbindungsfehler beim Loeschen.', 'error');
    }
  }

  function openQuestEditor(quest) {
    if (!editQuestPanel || !quest) {
      return;
    }

    const questId = quest._catalogId || quest.id;
    if (questId === null || questId === undefined || questId === '') {
      setMsg(editQuestMsg, 'Diese Quest kann nicht bearbeitet werden.', 'error');
      return;
    }

    const idEl = document.getElementById('edit-quest-id');
    const titleEl = document.getElementById('edit-quest-title');
    const descEl = document.getElementById('edit-quest-description');
    const coinsEl = document.getElementById('edit-quest-coins');
    const difficultyEl = document.getElementById('edit-quest-difficulty');
    const xpEl = document.getElementById('edit-quest-xp');

    idEl.value = String(questId);
    titleEl.value = quest.title || '';
    descEl.value = quest.description || '';
    coinsEl.value = String(Number(quest.rewardCoins) || 0);
    const difficultyValue = (quest.difficulty || 'mittel').toLowerCase();
    difficultyEl.value = ['leicht', 'mittel', 'schwer'].indexOf(difficultyValue) >= 0 ? difficultyValue : 'mittel';
    xpEl.value = String(Number(quest.rewardXp) || 100);

    editQuestPanel.hidden = false;
    setMsg(editQuestMsg, '', '');
    editQuestPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async function saveEditedQuest(event) {
    event.preventDefault();

    const questId = (document.getElementById('edit-quest-id').value || '').trim();
    const title = (document.getElementById('edit-quest-title').value || '').trim();
    const description = (document.getElementById('edit-quest-description').value || '').trim();
    const rewardCoins = Number(document.getElementById('edit-quest-coins').value || 0);
    const difficulty = (document.getElementById('edit-quest-difficulty').value || 'mittel').trim();
    const rewardXp = Number(document.getElementById('edit-quest-xp').value || 0);

    if (!questId || !title || !description) {
      setMsg(editQuestMsg, 'Bitte alle Pflichtfelder ausfuellen.', 'error');
      return;
    }

    try {
      const response = await fetch('api/quest_catalog.php?action=update_quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questId: questId,
          title: title,
          description: description,
          rewardCoins: rewardCoins,
          difficulty: difficulty,
          rewardXp: rewardXp
        })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMsg(editQuestMsg, data.error || 'Quest konnte nicht gespeichert werden.', 'error');
        return;
      }

      setMsg(editQuestMsg, 'Quest erfolgreich gespeichert.', 'success');
      await refreshParentQuestLists();
    } catch (e) {
      setMsg(editQuestMsg, 'Verbindungsfehler beim Speichern.', 'error');
    }
  }

  async function deleteEditedQuest() {
    const questId = (document.getElementById('edit-quest-id').value || '').trim();
    if (!questId) {
      setMsg(editQuestMsg, 'Keine Quest ausgewaehlt.', 'error');
      return;
    }

    const sure = window.confirm('Bist du sicher, dass du diese Quest loeschen moechtest?');
    if (!sure) {
      return;
    }

    try {
      const response = await fetch('api/quest_catalog.php?action=delete_quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId: questId })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMsg(editQuestMsg, data.error || 'Quest konnte nicht geloescht werden.', 'error');
        return;
      }

      setMsg(editQuestMsg, 'Quest wurde geloescht.', 'success');
      if (editQuestForm) {
        editQuestForm.reset();
      }
      if (editQuestPanel) {
        editQuestPanel.hidden = true;
      }
      await refreshParentQuestLists();
    } catch (e) {
      setMsg(editQuestMsg, 'Verbindungsfehler beim Loeschen.', 'error');
    }
  }

  function suggestRewardXp(level, difficulty) {
    const lvl = Math.max(1, Math.min(1000, Number(level) || 1));
    const difficultyKey = String(difficulty || 'mittel').toLowerCase();

    let base = 100;
    let growth = 12;

    if (difficultyKey === 'leicht') {
      base = 60;
      growth = 8;
    } else if (difficultyKey === 'schwer') {
      base = 160;
      growth = 17;
    }

    const levelFactor = Math.pow(lvl, 0.58);
    const xp = Math.round(base + (levelFactor * growth));
    return Math.max(1, Math.min(1000, xp));
  }

  function refreshSuggestedQuestXp() {
    if (!newQuestEpValueEl || !newQuestDifficultyEl) {
      return;
    }
    const level = currentPlayer && currentPlayer.level ? currentPlayer.level : 1;
    const xp = suggestRewardXp(level, newQuestDifficultyEl.value);
    newQuestEpValueEl.textContent = String(xp);
  }

  async function createNewQuest(event) {
    event.preventDefault();

    const title = (document.getElementById('new-quest-title').value || '').trim();
    const description = (document.getElementById('new-quest-description').value || '').trim();
    const rewardCoins = Number(document.getElementById('new-quest-coins').value || 0);
    const difficulty = (newQuestDifficultyEl && newQuestDifficultyEl.value) ? newQuestDifficultyEl.value : 'mittel';
    const level = currentPlayer && currentPlayer.level ? currentPlayer.level : 1;
    const rewardXp = suggestRewardXp(level, difficulty);

    if (!title || !description) {
      setMsg(newQuestMsg, 'Bitte Titel und Beschreibung ausfuellen.', 'error');
      return;
    }

    try {
      const response = await fetch('api/quest_catalog.php?action=create_quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          description: description,
          rewardCoins: rewardCoins,
          rewardXp: rewardXp,
          difficulty: difficulty
        })
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMsg(newQuestMsg, data.error || 'Quest konnte nicht erstellt werden.', 'error');
        return;
      }

      setMsg(newQuestMsg, 'Neue Quest wurde erstellt.', 'success');
      newQuestForm.reset();
      if (newQuestDifficultyEl) {
        newQuestDifficultyEl.value = 'mittel';
      }
      refreshSuggestedQuestXp();
      if (newQuestPanel) {
        newQuestPanel.hidden = true;
      }
      if (toggleNewQuestBtn) {
        toggleNewQuestBtn.textContent = 'Neue Quest anlegen';
      }
      await refreshParentQuestLists();
    } catch (e) {
      setMsg(newQuestMsg, 'Verbindungsfehler beim Erstellen der Quest.', 'error');
    }
  }

  function updateShopTypeFields(prefix, type) {
    const imageRow = document.getElementById(prefix + '-shop-item-image-row');
    const boostRow = document.getElementById(prefix + '-shop-item-boost-row');
    if (imageRow) { imageRow.hidden = (type === 'xp_boost_perk'); }
    if (boostRow) { boostRow.hidden = (type !== 'xp_boost_perk'); }
  }

  function setupNewQuestPanel() {
    if (toggleNewQuestBtn && newQuestPanel) {
      toggleNewQuestBtn.addEventListener('click', function () {
        newQuestPanel.hidden = !newQuestPanel.hidden;
        toggleNewQuestBtn.textContent = newQuestPanel.hidden ? 'Neue Quest anlegen' : 'Formular schliessen';
      });
    }

    if (newQuestDifficultyEl) {
      newQuestDifficultyEl.addEventListener('change', refreshSuggestedQuestXp);
    }

    if (newQuestForm) {
      newQuestForm.addEventListener('submit', createNewQuest);
    }

    if (editQuestForm) {
      editQuestForm.addEventListener('submit', saveEditedQuest);
    }

    if (deleteQuestBtn) {
      deleteQuestBtn.addEventListener('click', deleteEditedQuest);
    }

    if (toggleNewShopItemBtn && newShopItemPanel) {
      toggleNewShopItemBtn.addEventListener('click', function () {
        newShopItemPanel.hidden = !newShopItemPanel.hidden;
        toggleNewShopItemBtn.textContent = newShopItemPanel.hidden ? 'Shopitem anlegen' : 'Formular schliessen';
      });
    }

    if (toggleNewRewardItemBtn && newRewardItemPanel) {
      toggleNewRewardItemBtn.addEventListener('click', function () {
        newRewardItemPanel.hidden = !newRewardItemPanel.hidden;
        toggleNewRewardItemBtn.textContent = newRewardItemPanel.hidden ? 'Belohnung anlegen' : 'Formular schliessen';
      });
    }

    const rewardConditionSelect = document.getElementById('new-reward-condition');
    if (rewardConditionSelect) {
      rewardConditionSelect.addEventListener('change', function () {
        updateRewardConditionFields(rewardConditionSelect.value, 'new');
      });
      updateRewardConditionFields(rewardConditionSelect.value, 'new');
    }

    const addNewRewardQuestBtn = document.getElementById('new-reward-add-quest-btn');
    if (addNewRewardQuestBtn) {
      addNewRewardQuestBtn.addEventListener('click', function () {
        const questSelect = document.getElementById('new-reward-quest-select');
        const selectedQuestId = String(questSelect && questSelect.value ? questSelect.value : '').trim();
        if (!selectedQuestId) {
          setMsg(newRewardItemMsg, 'Bitte zuerst eine Quest auswaehlen.', 'error');
          return;
        }
        const state = getRewardConditionState('new');
        if (state.questIds.indexOf(selectedQuestId) === -1) {
          state.questIds.push(selectedQuestId);
        }
        renderRewardQuestSelector('new');
        renderRewardQuestSummary('new');
        questSelect.value = '';
        setMsg(newRewardItemMsg, 'Voraussetzung hinzugefuegt.', 'success');
      });
    }

    const addNewRewardRewardBtn = document.getElementById('new-reward-add-reward-btn');
    if (addNewRewardRewardBtn) {
      addNewRewardRewardBtn.addEventListener('click', function () {
        const rewardSelect = document.getElementById('new-reward-reward-select');
        const selectedRewardId = String(rewardSelect && rewardSelect.value ? rewardSelect.value : '').trim();
        if (!selectedRewardId) {
          setMsg(newRewardItemMsg, 'Bitte zuerst eine Belohnung auswaehlen.', 'error');
          return;
        }
        const state = getRewardConditionState('new');
        if (state.rewardIds.indexOf(selectedRewardId) === -1) {
          state.rewardIds.push(selectedRewardId);
        }
        renderRewardDependencySelector('new');
        renderRewardDependencySummary('new');
        rewardSelect.value = '';
        setMsg(newRewardItemMsg, 'Voraussetzung hinzugefuegt.', 'success');
      });
    }

    const editRewardConditionSelect = document.getElementById('edit-reward-condition');
    if (editRewardConditionSelect) {
      editRewardConditionSelect.addEventListener('change', function () {
        updateRewardConditionFields(editRewardConditionSelect.value, 'edit');
      });
      updateRewardConditionFields(editRewardConditionSelect.value, 'edit');
    }

    const addEditRewardQuestBtn = document.getElementById('edit-reward-add-quest-btn');
    if (addEditRewardQuestBtn) {
      addEditRewardQuestBtn.addEventListener('click', function () {
        const questSelect = document.getElementById('edit-reward-quest-select');
        const selectedQuestId = String(questSelect && questSelect.value ? questSelect.value : '').trim();
        if (!selectedQuestId) {
          setMsg(editRewardItemMsg, 'Bitte zuerst eine Quest auswaehlen.', 'error');
          return;
        }
        const state = getRewardConditionState('edit');
        if (state.questIds.indexOf(selectedQuestId) === -1) {
          state.questIds.push(selectedQuestId);
        }
        renderRewardQuestSelector('edit');
        renderRewardQuestSummary('edit');
        questSelect.value = '';
        setMsg(editRewardItemMsg, 'Voraussetzung hinzugefuegt.', 'success');
      });
    }

    const addEditRewardRewardBtn = document.getElementById('edit-reward-add-reward-btn');
    if (addEditRewardRewardBtn) {
      addEditRewardRewardBtn.addEventListener('click', function () {
        const rewardSelect = document.getElementById('edit-reward-reward-select');
        const selectedRewardId = String(rewardSelect && rewardSelect.value ? rewardSelect.value : '').trim();
        if (!selectedRewardId) {
          setMsg(editRewardItemMsg, 'Bitte zuerst eine Belohnung auswaehlen.', 'error');
          return;
        }
        const state = getRewardConditionState('edit');
        if (state.rewardIds.indexOf(selectedRewardId) === -1) {
          state.rewardIds.push(selectedRewardId);
        }
        renderRewardDependencySelector('edit');
        renderRewardDependencySummary('edit');
        rewardSelect.value = '';
        setMsg(editRewardItemMsg, 'Voraussetzung hinzugefuegt.', 'success');
      });
    }

    renderRewardQuestSelector('new');
    renderRewardQuestSummary('new');
    renderRewardDependencySelector('new');
    renderRewardDependencySummary('new');
    renderRewardQuestSelector('edit');
    renderRewardQuestSummary('edit');
    renderRewardDependencySelector('edit');
    renderRewardDependencySummary('edit');

    if (editRewardItemForm) {
      editRewardItemForm.addEventListener('submit', saveEditedRewardItem);
    }
    if (deleteRewardItemBtn) {
      deleteRewardItemBtn.addEventListener('click', deleteEditedRewardItem);
    }
    if (unlockRewardItemBtn) {
      unlockRewardItemBtn.addEventListener('click', unlockEditedRewardItem);
    }

    if (newRewardItemForm) {
      newRewardItemForm.addEventListener('submit', createNewRewardItem);
    }

    if (newShopItemForm) {
      newShopItemForm.addEventListener('submit', createNewShopItem);
    }

    const newTypeSelect = document.getElementById('new-shop-item-type');
    if (newTypeSelect) {
      newTypeSelect.addEventListener('change', function () {
        updateShopTypeFields('new', newTypeSelect.value);
      });
      if (!newTypeSelect.value) {
        newTypeSelect.value = 'profile_image';
      }
      updateShopTypeFields('new', newTypeSelect.value);
    }

    const newImageInput = document.getElementById('new-shop-item-image');
    if (newImageInput && !newImageInput.value.trim()) {
      newImageInput.value = DEFAULT_SHOP_IMAGE_PATH;
    }

    const editImageInput = document.getElementById('edit-shop-item-image');
    if (editImageInput && !editImageInput.value.trim()) {
      editImageInput.value = DEFAULT_SHOP_IMAGE_PATH;
    }

    const editTypeSelect = document.getElementById('edit-shop-item-type');
    if (editTypeSelect) {
      editTypeSelect.addEventListener('change', function () {
        updateShopTypeFields('edit', editTypeSelect.value);
      });
      updateShopTypeFields('edit', editTypeSelect.value || 'profile_image');
    }

    if (editShopItemForm) {
      editShopItemForm.addEventListener('submit', saveEditedShopItem);
    }

    if (deleteShopItemBtn) {
      deleteShopItemBtn.addEventListener('click', deleteEditedShopItem);
    }

    if (toggleNewAchievementItemBtn && newAchievementItemPanel) {
      toggleNewAchievementItemBtn.addEventListener('click', function () {
        newAchievementItemPanel.hidden = !newAchievementItemPanel.hidden;
        toggleNewAchievementItemBtn.textContent = newAchievementItemPanel.hidden ? 'Achievement anlegen' : 'Formular schliessen';
      });
    }

    const newAchievementConditionSelect = document.getElementById('new-achievement-condition');
    if (newAchievementConditionSelect) {
      newAchievementConditionSelect.addEventListener('change', function () {
        updateAchievementConditionFields(newAchievementConditionSelect.value, 'new');
      });
      updateAchievementConditionFields(newAchievementConditionSelect.value, 'new');
    }

    const editAchievementConditionSelect = document.getElementById('edit-achievement-condition');
    if (editAchievementConditionSelect) {
      editAchievementConditionSelect.addEventListener('change', function () {
        updateAchievementConditionFields(editAchievementConditionSelect.value, 'edit');
      });
      updateAchievementConditionFields(editAchievementConditionSelect.value, 'edit');
    }

    const addNewAchievementQuestBtn = document.getElementById('new-achievement-add-quest-btn');
    if (addNewAchievementQuestBtn) {
      addNewAchievementQuestBtn.addEventListener('click', function () {
        const questSelect = document.getElementById('new-achievement-quest-select');
        const selectedQuestId = String(questSelect && questSelect.value ? questSelect.value : '').trim();
        if (!selectedQuestId) {
          setMsg(newAchievementItemMsg, 'Bitte zuerst eine Quest auswaehlen.', 'error');
          return;
        }
        const state = getAchievementConditionState('new');
        if (state.questIds.indexOf(selectedQuestId) === -1) {
          state.questIds.push(selectedQuestId);
        }
        renderAchievementQuestSelector('new');
        renderAchievementQuestSummary('new');
        questSelect.value = '';
      });
    }

    const addEditAchievementQuestBtn = document.getElementById('edit-achievement-add-quest-btn');
    if (addEditAchievementQuestBtn) {
      addEditAchievementQuestBtn.addEventListener('click', function () {
        const questSelect = document.getElementById('edit-achievement-quest-select');
        const selectedQuestId = String(questSelect && questSelect.value ? questSelect.value : '').trim();
        if (!selectedQuestId) {
          setMsg(editAchievementItemMsg, 'Bitte zuerst eine Quest auswaehlen.', 'error');
          return;
        }
        const state = getAchievementConditionState('edit');
        if (state.questIds.indexOf(selectedQuestId) === -1) {
          state.questIds.push(selectedQuestId);
        }
        renderAchievementQuestSelector('edit');
        renderAchievementQuestSummary('edit');
        questSelect.value = '';
      });
    }

    const addNewAchievementRewardBtn = document.getElementById('new-achievement-add-reward-btn');
    if (addNewAchievementRewardBtn) {
      addNewAchievementRewardBtn.addEventListener('click', function () {
        const rewardSelect = document.getElementById('new-achievement-reward-select');
        const selectedRewardId = String(rewardSelect && rewardSelect.value ? rewardSelect.value : '').trim();
        if (!selectedRewardId) {
          setMsg(newAchievementItemMsg, 'Bitte zuerst eine Belohnung auswaehlen.', 'error');
          return;
        }
        const state = getAchievementConditionState('new');
        if (state.rewardIds.indexOf(selectedRewardId) === -1) {
          state.rewardIds.push(selectedRewardId);
        }
        renderAchievementRewardSelector('new');
        renderAchievementRewardSummary('new');
        rewardSelect.value = '';
      });
    }

    const addEditAchievementRewardBtn = document.getElementById('edit-achievement-add-reward-btn');
    if (addEditAchievementRewardBtn) {
      addEditAchievementRewardBtn.addEventListener('click', function () {
        const rewardSelect = document.getElementById('edit-achievement-reward-select');
        const selectedRewardId = String(rewardSelect && rewardSelect.value ? rewardSelect.value : '').trim();
        if (!selectedRewardId) {
          setMsg(editAchievementItemMsg, 'Bitte zuerst eine Belohnung auswaehlen.', 'error');
          return;
        }
        const state = getAchievementConditionState('edit');
        if (state.rewardIds.indexOf(selectedRewardId) === -1) {
          state.rewardIds.push(selectedRewardId);
        }
        renderAchievementRewardSelector('edit');
        renderAchievementRewardSummary('edit');
        rewardSelect.value = '';
      });
    }

    renderAchievementQuestSelector('new');
    renderAchievementQuestSummary('new');
    renderAchievementRewardSelector('new');
    renderAchievementRewardSummary('new');
    renderAchievementQuestSelector('edit');
    renderAchievementQuestSummary('edit');
    renderAchievementRewardSelector('edit');
    renderAchievementRewardSummary('edit');

    if (newAchievementItemForm) {
      newAchievementItemForm.addEventListener('submit', createNewAchievementItem);
    }

    if (editAchievementItemForm) {
      editAchievementItemForm.addEventListener('submit', saveEditedAchievementItem);
    }

    if (deleteAchievementItemBtn) {
      deleteAchievementItemBtn.addEventListener('click', deleteEditedAchievementItem);
    }

    const closeButtons = Array.from(document.querySelectorAll('.panel-close-btn'));
    closeButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const panelId = btn.getAttribute('data-close-panel');
        if (!panelId) {
          return;
        }

        const panel = document.getElementById(panelId);
        if (panel) {
          panel.hidden = true;
        }

        if (panelId === 'new-quest-panel' && toggleNewQuestBtn) {
          toggleNewQuestBtn.textContent = 'Neue Quest anlegen';
        }

        if (panelId === 'new-shop-item-panel' && toggleNewShopItemBtn) {
          toggleNewShopItemBtn.textContent = 'Shopitem anlegen';
        }

        if (panelId === 'new-reward-item-panel' && toggleNewRewardItemBtn) {
          toggleNewRewardItemBtn.textContent = 'Belohnung anlegen';
        }

        if (panelId === 'new-achievement-item-panel' && toggleNewAchievementItemBtn) {
          toggleNewAchievementItemBtn.textContent = 'Achievement anlegen';
        }
      });
    });
  }

  function buildAchievementMilestones(items) {
    const list = Array.isArray(items) ? items : [];
    const targets = list.map(function (item) {
      return Number(item && item.target);
    }).filter(function (target) {
      return Number.isFinite(target) && target > 0;
    });

    if (targets.length === 0) {
      return [1, 10, 50, 200, 400, 600, 800, 1000, 1500, 2000];
    }

    return Array.from(new Set(targets)).sort(function (a, b) { return a - b; });
  }

  function isInLastWeek(isoDate) {
    if (!isoDate) {
      return false;
    }
    const time = new Date(isoDate).getTime();
    if (!Number.isFinite(time)) {
      return false;
    }
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    return time >= (now - sevenDaysMs) && time <= now;
  }

  function renderParentStats(player, shopItems, achievementItems) {
    const quests = Array.isArray(player && player.quests) ? player.quests : [];
    const completedQuests = quests.filter(function (q) {
      return q && q.completed;
    });
    const completedThisWeek = completedQuests.filter(function (q) {
      return isInLastWeek(q.completedAt);
    });

    const totalCompletedCount = completedQuests.length;
    const weekCompletedCount = completedThisWeek.length;

    const milestones = buildAchievementMilestones(achievementItems);
    const achievementsTotal = milestones.filter(function (target) {
      return totalCompletedCount >= target;
    }).length;

    const completedBeforeWeek = Math.max(0, totalCompletedCount - weekCompletedCount);
    const achievementsBeforeWeek = milestones.filter(function (target) {
      return completedBeforeWeek >= target;
    }).length;
    const achievementsThisWeek = Math.max(0, achievementsTotal - achievementsBeforeWeek);

    const ownedIds = new Set(
      (Array.isArray(player && player.ownedShopItems) ? player.ownedShopItems : []).map(String)
    );
    const coinsSpent = (Array.isArray(shopItems) ? shopItems : []).reduce(function (sum, item) {
      const id = String(item && item.id ? item.id : '');
      if (!ownedIds.has(id)) {
        return sum;
      }
      return sum + (Number(item && item.costCoins) || 0);
    }, 0);

    if (achievementsTotalEl) {
      achievementsTotalEl.textContent = String(achievementsTotal);
    }
    if (achievementsWeekEl) {
      achievementsWeekEl.textContent = String(achievementsThisWeek);
    }
    if (questsTotalEl) {
      questsTotalEl.textContent = String(totalCompletedCount);
    }
    if (questsWeekEl) {
      questsWeekEl.textContent = String(weekCompletedCount);
    }
    if (coinsSpentEl) {
      coinsSpentEl.textContent = String(coinsSpent);
    }

    renderParentSystemMessages(player);
  }

  function renderParentSystemMessages(player) {
    const el = document.getElementById('parent-system-messages');
    if (!el) { return; }

    const messages = Array.isArray(player && player.systemMessages) ? player.systemMessages : [];
    el.innerHTML = '';

    if (messages.length === 0) {
      el.innerHTML = '<p class="muted" style="margin-top:10px">Keine Systemnachrichten vorhanden.</p>';
      return;
    }

    const list = document.createElement('ul');
    list.className = 'system-messages-list';
    list.style.marginTop = '12px';

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

      list.appendChild(item);
    });

    el.appendChild(list);
  }

  function xpRequiredForLevel(level) {
    const lvl = Math.max(1, Number(level) || 1);

    if (lvl <= 8) {
      return 90 + ((lvl - 1) * 22);
    }

    if (lvl <= 20) {
      const d = lvl - 8;
      return 244 + (d * 45) + (d * d * 3);
    }

    const e = lvl - 20;
    return 1216 + (e * 18) + Math.floor((e * e) / 180);
  }

  function buildCumulativeCurve(maxLevel) {
    const points = [];
    let cumulative = 0;

    for (let level = 1; level <= maxLevel; level += 1) {
      points.push({ level: level, xpTotal: cumulative });
      if (level < maxLevel) {
        cumulative += xpRequiredForLevel(level);
      }
    }

    return points;
  }

  function drawCurve(player) {
    if (!graphCanvas) {
      return;
    }

    const ctx = graphCanvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const maxLevel = 1000;
    const points = buildCumulativeCurve(maxLevel);
    const totalXpToMax = points[points.length - 1].xpTotal;
    const currentTotalXp = Math.max(0, Number(player.xp) || 0);
    const currentLevel = Math.max(1, Math.min(maxLevel, Number(player.level) || 1));

    const width = graphCanvas.width;
    const height = graphCanvas.height;
    const padLeft = 46;
    const padRight = 16;
    const padTop = 18;
    const padBottom = 30;
    const innerW = width - padLeft - padRight;
    const innerH = height - padTop - padBottom;

    const maxY = Math.log10(totalXpToMax + 1);

    function toX(level) {
      return padLeft + ((level - 1) / (maxLevel - 1)) * innerW;
    }

    function toY(xpTotal) {
      const y = Math.log10((xpTotal || 0) + 1);
      const ratio = maxY > 0 ? (y / maxY) : 0;
      return padTop + (1 - ratio) * innerH;
    }

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(padLeft, padTop, innerW, innerH);

    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop + innerH);
    ctx.lineTo(width - padRight, padTop + innerH);
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, padTop + innerH);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(130, 208, 255, 0.42)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach(function (point, index) {
      const x = toX(point.level);
      const y = toY(point.xpTotal);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    ctx.strokeStyle = 'rgba(40, 220, 255, 0.95)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    points.forEach(function (point, index) {
      if (point.level > currentLevel) {
        return;
      }

      const x = toX(point.level);
      const y = toY(point.xpTotal);
      if (index === 0 || point.level === 1) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    const markerX = toX(currentLevel);
    const markerY = toY(currentTotalXp);
    ctx.fillStyle = '#6af5ff';
    ctx.beginPath();
    ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(225,245,255,0.85)';
    ctx.font = '12px sans-serif';
    ctx.fillText('L1', padLeft - 8, height - 10);
    ctx.fillText('L1000', width - padRight - 38, height - 10);
    ctx.fillText('EP', 8, padTop + 4);

    if (graphStats) {
      graphStats.textContent =
        'Aktuell: Level ' + String(currentLevel) +
        ' | Gesamt EP: ' + String(currentTotalXp) +
        ' | EP bis Level 1000: ' + String(totalXpToMax);
    }
  }

  function setMsg(target, text, type) {
    if (!target) {
      return;
    }
    target.textContent = text;
    target.className = 'rename-msg ' + (type || '');
  }

  async function getMaintenanceStatus() {
    const response = await fetch('api/maintenance.php?action=get', {
      method: 'GET',
      cache: 'no-store'
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Wartungsstatus konnte nicht geladen werden.');
    }
    return Boolean(data.enabled);
  }

  async function setMaintenanceStatus(enabled) {
    const response = await fetch('api/maintenance.php?action=set', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: Boolean(enabled) })
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Wartungsstatus konnte nicht gespeichert werden.');
    }
    return Boolean(data.enabled);
  }

  function renderMaintenanceButtons() {
    maintenanceToggleButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', maintenanceEnabled ? 'true' : 'false');
      btn.classList.toggle('active', maintenanceEnabled);
      btn.textContent = maintenanceEnabled ? 'Wartung: AN' : 'Wartung: AUS';
    });
  }

  async function toggleMaintenanceMode() {
    if (!maintenanceToggleButtons.length) {
      return;
    }

    maintenanceToggleButtons.forEach(function (btn) {
      btn.disabled = true;
    });

    try {
      maintenanceEnabled = await setMaintenanceStatus(!maintenanceEnabled);
      renderMaintenanceButtons();
    } catch (err) {
      window.alert(String(err && err.message ? err.message : 'Wartungsstatus konnte nicht geaendert werden.'));
    } finally {
      maintenanceToggleButtons.forEach(function (btn) {
        btn.disabled = false;
      });
    }
  }

  async function initMaintenanceToggle() {
    if (!maintenanceToggleButtons.length) {
      return;
    }

    maintenanceToggleButtons.forEach(function (btn) {
      btn.addEventListener('click', toggleMaintenanceMode);
    });

    try {
      maintenanceEnabled = await getMaintenanceStatus();
    } catch (err) {
      maintenanceEnabled = false;
    }
    renderMaintenanceButtons();
  }

  function renderParentCoinsSection(player) {
    if (!parentCoinsCurrentEl) {
      return;
    }
    const coins = Number(player && player.coins) || 0;
    parentCoinsCurrentEl.textContent = String(coins);
  }

  async function adjustParentCoins(operation) {
    if (!parentCoinsAmountEl) {
      return;
    }

    const amount = Number(parentCoinsAmountEl.value || 0);
    if (!Number.isFinite(amount) || amount < 1) {
      setMsg(parentCoinsMsg, 'Bitte eine gueltige Coin-Anzahl eingeben.', 'error');
      return;
    }

    try {
      const response = await fetch('api/quest.php?action=adjust_coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: getOrCreatePlayerId(),
          operation: operation,
          amount: Math.floor(amount)
        })
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMsg(parentCoinsMsg, data.error || 'Coins konnten nicht angepasst werden.', 'error');
        return;
      }

      currentPlayer = data.player;
      renderParentCoinsSection(currentPlayer);
      renderParentStats(currentPlayer, currentShopItems, currentAchievementItems);
      renderParentRewards(currentPlayer, currentShopItems);
      setMsg(parentCoinsMsg, operation === 'add' ? 'Coins wurden hinzugefuegt.' : 'Coins wurden abgezogen.', 'success');
    } catch (e) {
      setMsg(parentCoinsMsg, 'Verbindungsfehler bei Coins-Anpassung.', 'error');
    }
  }

  async function submitChildPasswordUpdate(event) {
    event.preventDefault();

    const currentParentPin = document.getElementById('child-current-parent-pin').value.trim();
    const newChildPassword = document.getElementById('new-child-password').value.trim();

    if (!currentParentPin || !newChildPassword) {
      setMsg(childMsg, 'Bitte alle Felder ausfuellen.', 'error');
      return;
    }

    try {
      const response = await fetch('api/security.php?action=update_child_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentParentPin: currentParentPin,
          newChildPassword: newChildPassword
        })
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMsg(childMsg, data.error || 'Aenderung fehlgeschlagen.', 'error');
        return;
      }

      setMsg(childMsg, 'Kinderpasswort erfolgreich gespeichert.', 'success');
      childForm.reset();
    } catch (e) {
      setMsg(childMsg, 'Verbindungsfehler.', 'error');
    }
  }

  async function submitParentPinUpdate(event) {
    event.preventDefault();

    const currentParentPin = document.getElementById('parent-current-parent-pin').value.trim();
    const newParentPin = document.getElementById('new-parent-pin').value.trim();

    if (!currentParentPin || !newParentPin) {
      setMsg(parentMsg, 'Bitte alle Felder ausfuellen.', 'error');
      return;
    }

    try {
      const response = await fetch('api/security.php?action=update_parent_pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentParentPin: currentParentPin,
          newParentPin: newParentPin
        })
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMsg(parentMsg, data.error || 'Aenderung fehlgeschlagen.', 'error');
        return;
      }

      setMsg(parentMsg, 'Eltern-PIN erfolgreich gespeichert.', 'success');
      parentForm.reset();
    } catch (e) {
      setMsg(parentMsg, 'Verbindungsfehler.', 'error');
    }
  }

  if (childForm) {
    childForm.addEventListener('submit', submitChildPasswordUpdate);
  }

  if (parentForm) {
    parentForm.addEventListener('submit', submitParentPinUpdate);
  }

  if (parentCoinsAddBtn) {
    parentCoinsAddBtn.addEventListener('click', function () {
      adjustParentCoins('add');
    });
  }

  if (parentCoinsSubtractBtn) {
    parentCoinsSubtractBtn.addEventListener('click', function () {
      adjustParentCoins('subtract');
    });
  }

  setupNewQuestPanel();
  initMaintenanceToggle();

  Promise.all([loadPlayerState(), loadShopItems(), loadQuestCatalog(), loadAchievementItems()])
    .then(function (results) {
      const player = results[0];
      const shopItems = results[1];
      const catalogQuests = results[2];
      const achievementItems = results[3];
      currentPlayer = player;
      currentShopItems = shopItems;
      currentCatalogQuests = catalogQuests;
      currentAchievementItems = achievementItems;
      drawCurve(player);
      renderParentStats(player, shopItems, achievementItems);
      renderParentCoinsSection(player);
      renderParentQuestStatus(player, catalogQuests);
      renderParentShopItems(shopItems);
      renderParentRewards(player, shopItems);
      renderParentAchievementItems(achievementItems);
      renderRewardQuestSelector('new');
      renderRewardQuestSummary('new');
      renderRewardDependencySelector('new');
      renderRewardDependencySummary('new');
      renderRewardQuestSelector('edit');
      renderRewardQuestSummary('edit');
      renderRewardDependencySelector('edit');
      renderRewardDependencySummary('edit');
      renderAchievementQuestSelector('new');
      renderAchievementQuestSummary('new');
      renderAchievementRewardSelector('new');
      renderAchievementRewardSummary('new');
      renderAchievementQuestSelector('edit');
      renderAchievementQuestSummary('edit');
      renderAchievementRewardSelector('edit');
      renderAchievementRewardSummary('edit');
      refreshSuggestedQuestXp();
    })
    .catch(function (err) {
      if (graphStats) {
        graphStats.textContent = 'Fehler beim Laden des Graphen: ' + err.message;
      }
      renderQuestList(availableQuestsEl, [], 'Fehler beim Laden der Quests.');
      renderQuestList(acceptedQuestsEl, [], 'Fehler beim Laden der Quests.');
      renderQuestList(pendingQuestsEl, [], 'Fehler beim Laden der Quests.');
      renderParentShopItems([]);
      renderParentAchievementItems([]);
    });

  document.querySelectorAll('.collapsible-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const body = btn.closest('.collapsible-section').querySelector('.collapsible-body');
      if (!body) { return; }
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      body.hidden = isOpen;
    });
  });
})();

