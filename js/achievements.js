(function () {
  const API_URL = 'api/quest.php';
  const ACHIEVEMENT_API_URL = 'api/achievement_items.php';
  const QUEST_CATALOG_API_URL = 'api/quest_catalog.php';
  const SHOP_API_URL = 'api/shop_items.php';
  const PLAYER_STORAGE_KEY = 'serverwatch_quest_player_id';
  const SHARED_PLAYER_ID = 'kid_shared_main';

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

  function achievementMilestoneCoins(target) {
    const t = Math.max(1, Number(target) || 1);

    if (t <= 10) {
      return 25;
    }
    if (t <= 50) {
      return 60;
    }
    if (t <= 200) {
      return 120;
    }
    if (t <= 400) {
      return 180;
    }
    if (t <= 600) {
      return 240;
    }
    if (t <= 800) {
      return 320;
    }
    if (t <= 1000) {
      return 380;
    }
    if (t <= 1500) {
      return 450;
    }

    return 500;
  }

  function getOrCreatePlayerId() {
    localStorage.setItem(PLAYER_STORAGE_KEY, SHARED_PLAYER_ID);
    return SHARED_PLAYER_ID;
  }

  async function loadAchievementCatalog() {
    try {
      const response = await fetch(ACHIEVEMENT_API_URL, { method: 'GET' });
      const data = await response.json();
      if (!response.ok || !data.ok || !Array.isArray(data.items)) {
        return { systemItems: DEFAULT_ACHIEVEMENTS.slice(), customItems: [] };
      }

      const cleaned = data.items
        .map(function (item) {
          return {
            id: String(item && item.id ? item.id : ''),
            title: String(item && item.title ? item.title : ''),
            target: Number(item && item.target),
            image: String(item && item.image ? item.image : '').trim(),
            systemManaged: Boolean(item && item.systemManaged),
            unlockConditionType: String(item && item.unlockConditionType ? item.unlockConditionType : ''),
            unlockConditionValue: Number(item && item.unlockConditionValue),
            unlockConditionQuestIds: Array.isArray(item && item.unlockConditionQuestIds) ? item.unlockConditionQuestIds.map(String) : [],
            unlockConditionRewardIds: Array.isArray(item && item.unlockConditionRewardIds) ? item.unlockConditionRewardIds.map(String) : [],
            titleReward: String(item && item.titleReward ? item.titleReward : '').trim()
          };
        })
        .filter(function (item) {
          return item.id && item.title;
        });

      const systemItems = cleaned
        .filter(function (item) {
          return item.systemManaged && Number.isFinite(item.target) && item.target > 0;
        })
        .sort(function (a, b) { return a.target - b.target; });

      const customItems = cleaned
        .filter(function (item) {
          return !item.systemManaged && item.unlockConditionType;
        })
        .sort(function (a, b) { return a.title.localeCompare(b.title, 'de'); });

      return { systemItems: systemItems.length ? systemItems : DEFAULT_ACHIEVEMENTS.slice(), customItems: customItems };
    } catch (e) {
      return { systemItems: DEFAULT_ACHIEVEMENTS.slice(), customItems: [] };
    }
  }

  async function loadQuestCatalog() {
    const response = await fetch(QUEST_CATALOG_API_URL, { method: 'GET' });
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
      throw new Error(data.error || 'Belohnungen konnten nicht geladen werden.');
    }
    return Array.isArray(data.items) ? data.items : [];
  }

  function buildSystemAchievements(player, catalogItems) {
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
        rewardCoins: achievementMilestoneCoins(target),
        progress: completedCount,
        description: 'Erledige insgesamt ' + target + ' Quest(s), um das Profilbild ' + title + ' freizuschalten.',
        done: completedCount >= target,
        image: entry.image || 'assets/avatar-placeholder.svg'
      };
    });
  }

  function buildCustomAchievements(player, catalogItems, questCatalog, shopItems) {
    const quests = Array.isArray(player && player.quests) ? player.quests : [];
    const ownedIds = new Set((Array.isArray(player && player.ownedShopItems) ? player.ownedShopItems : []).map(String));
    const completedCatalogIds = new Set(
      quests
        .filter(function (q) { return q && q.completed; })
        .map(function (q) {
          return q && q.catalogId !== null && q.catalogId !== undefined && q.catalogId !== ''
            ? String(q.catalogId)
            : String(q.id || '');
        })
        .filter(Boolean)
    );
    const level = Math.max(1, Number(player && player.level) || 1);
    const questById = new Map((Array.isArray(questCatalog) ? questCatalog : []).map(function (quest) {
      return [String(quest && quest.id !== undefined ? quest.id : ''), String(quest && quest.title ? quest.title : 'Ohne Titel')];
    }));
    const rewardById = new Map((Array.isArray(shopItems) ? shopItems : []).map(function (item) {
      return [String(item && item.id ? item.id : ''), String(item && item.title ? item.title : 'Ohne Titel')];
    }));

    return (Array.isArray(catalogItems) ? catalogItems : []).map(function (entry) {
      const type = String(entry && entry.unlockConditionType ? entry.unlockConditionType : 'quest_ids');
      const questIds = Array.isArray(entry && entry.unlockConditionQuestIds) ? entry.unlockConditionQuestIds.map(String) : [];
      const rewardIds = Array.isArray(entry && entry.unlockConditionRewardIds) ? entry.unlockConditionRewardIds.map(String) : [];
      const conditionValue = Math.max(0, Number(entry && entry.unlockConditionValue) || 0);
      let current = 0;
      let target = 1;
      let conditionLabel = '';
      let detailStates = [];

      if (type === 'reach_level') {
        target = Math.max(1, conditionValue);
        current = Math.min(target, level);
        conditionLabel = 'Level ' + level + ' / ' + target;
      } else if (type === 'reward_ids') {
        target = Math.max(1, rewardIds.length);
        detailStates = rewardIds.map(function (rewardId) {
          return {
            id: String(rewardId),
            title: rewardById.get(String(rewardId)) || ('Belohnung ' + rewardId),
            completed: ownedIds.has(String(rewardId))
          };
        });
        current = detailStates.filter(function (item) { return item.completed; }).length;
        conditionLabel = current + ' / ' + target + ' Belohnungen vorhanden';
      } else {
        target = Math.max(1, questIds.length);
        detailStates = questIds.map(function (questId) {
          return {
            id: String(questId),
            title: questById.get(String(questId)) || ('Quest ' + questId),
            completed: completedCatalogIds.has(String(questId))
          };
        });
        current = detailStates.filter(function (item) { return item.completed; }).length;
        conditionLabel = current + ' / ' + target + ' Quests erledigt';
      }

      return {
        id: entry.id,
        title: entry.title,
        image: String(entry && entry.image ? entry.image : '').trim(),
        done: current >= target,
        current: current,
        target: target,
        percent: Math.max(0, Math.min(100, Math.round((current / target) * 100))),
        type: type,
        conditionLabel: conditionLabel,
        detailStates: detailStates,
        titleReward: String(entry && entry.titleReward ? entry.titleReward : '').trim(),
        description: type === 'reach_level'
          ? 'Erreiche Level ' + target + ', um dieses Achievement abzuschliessen.'
          : (type === 'reward_ids'
            ? 'Besitze alle ausgewaehlten Belohnungen, um dieses Achievement abzuschliessen.'
            : 'Erledige alle ausgewaehlten Quests, um dieses Achievement abzuschliessen.')
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

    const coins = document.createElement('p');
    coins.className = 'achievement-coins';

    const coinsText = document.createElement('span');
    coinsText.textContent = '+' + String(item.rewardCoins || 0) + ' Coins';
    coins.appendChild(coinsText);

    const coinIcon = document.createElement('img');
    coinIcon.className = 'coin-icon';
    coinIcon.src = 'assets/coin.png';
    coinIcon.alt = 'Coin Symbol';
    coinIcon.loading = 'lazy';
    coinIcon.addEventListener('error', function () {
      coinIcon.style.display = 'none';
    });
    coins.appendChild(coinIcon);

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
    node.appendChild(coins);
    node.appendChild(state);

    return node;
  }

  function renderPath(container, items, customItems) {
    if (!container) {
      return;
    }

    container.innerHTML = '';
    if (items.length === 0 && customItems.length === 0) {
      const p = document.createElement('p');
      p.className = 'muted';
      p.textContent = 'Keine Achievements vorhanden.';
      container.appendChild(p);
      return;
    }

    if (items.length > 0) {
      const systemTitle = document.createElement('h4');
      systemTitle.className = 'quest-title';
      systemTitle.textContent = 'System-Achievements';
      container.appendChild(systemTitle);
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

    if (items.length > 0) {
      container.appendChild(rail);
    }

    if (customItems.length > 0) {
      const customTitle = document.createElement('h4');
      customTitle.className = 'quest-title';
      customTitle.textContent = 'Individuelle Achievements';
      container.appendChild(customTitle);

      const customList = document.createElement('div');
      customList.className = 'status-list achievement-custom-list';

      customItems.forEach(function (item) {
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
        title.textContent = item.title;

        const meta = document.createElement('p');
        meta.className = 'quest-meta';
        meta.textContent = item.done ? 'Voraussetzung erfuellt' : item.conditionLabel;

        textWrap.appendChild(title);
        textWrap.appendChild(meta);

        const status = document.createElement('span');
        status.className = item.done ? 'quest-pending-check' : 'quest-ep';
        status.textContent = item.done ? 'Freigeschaltet' : 'Aktiv';

        main.appendChild(textWrap);
        main.appendChild(status);

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

        if (!item.done) {
          const progressLabel = document.createElement('p');
          progressLabel.className = 'quest-meta';
          progressLabel.textContent = 'Fortschritt: ' + item.current + ' / ' + item.target + ' (' + item.percent + ' %)';
          body.appendChild(progressLabel);

          const progressWrap = document.createElement('div');
          progressWrap.className = 'reward-progress-wrap';
          const progressBar = document.createElement('div');
          progressBar.className = 'reward-progress-bar reward-progress-' + item.type;
          progressBar.style.width = item.percent + '%';
          progressWrap.appendChild(progressBar);
          body.appendChild(progressWrap);
        } else {
          const readyText = document.createElement('p');
          readyText.className = 'quest-meta';
          readyText.textContent = 'Achievement ist freigeschaltet.';
          body.appendChild(readyText);
        }

        if (item.detailStates.length > 0) {
          const requirementWrap = document.createElement('div');
          requirementWrap.className = 'reward-requirements';
          const completedCount = item.detailStates.filter(function (detail) {
            return Boolean(detail && detail.completed);
          }).length;
          const totalCount = Math.max(1, item.detailStates.length);
          const requirementPercent = Math.round((completedCount / totalCount) * 100);

          const requirementProgress = document.createElement('p');
          requirementProgress.className = 'quest-meta';
          requirementProgress.textContent = 'Fortschritt: ' + completedCount + ' / ' + totalCount + ' Voraussetzungen (' + requirementPercent + ' %)';
          requirementWrap.appendChild(requirementProgress);

          const requirementTitle = document.createElement('p');
          requirementTitle.className = 'quest-meta';
          requirementTitle.textContent = item.type === 'reward_ids' ? 'Erforderliche Belohnungen:' : 'Erforderliche Quests:';
          requirementWrap.appendChild(requirementTitle);

          item.detailStates.forEach(function (detail) {
            const row = document.createElement('label');
            row.className = 'reward-requirement-item';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = Boolean(detail.completed);
            checkbox.disabled = true;
            const text = document.createElement('span');
            text.textContent = '[' + detail.id + '] ' + detail.title;
            row.appendChild(checkbox);
            row.appendChild(text);
            requirementWrap.appendChild(row);
          });

          body.appendChild(requirementWrap);
        }

        if (item.titleReward) {
          const titleRewardLine = document.createElement('p');
          titleRewardLine.className = 'quest-meta';
          titleRewardLine.textContent = 'Freischaltbarer Titel: ' + item.titleReward;
          body.appendChild(titleRewardLine);
        }

        if (item.image) {
          const preview = document.createElement('img');
          preview.className = 'shop-preview';
          preview.src = item.image;
          preview.alt = item.title;
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
        customList.appendChild(card);
      });

      container.appendChild(customList);
    }
  }

  function toOverviewEntries(systemItems, customItems) {
    const systemEntries = (Array.isArray(systemItems) ? systemItems : []).map(function (item) {
      const target = Math.max(1, Number(item && item.target) || 1);
      const rawCurrent = Math.max(0, Number(item && item.progress) || 0);
      const current = Math.min(target, rawCurrent);
      const done = current >= target;
      return {
        id: String(item && item.id ? item.id : ''),
        title: String(item && item.title ? item.title : 'Ohne Titel'),
        image: String(item && item.image ? item.image : '').trim(),
        current: current,
        target: target,
        percent: Math.max(0, Math.min(100, Math.round((current / target) * 100))),
        done: done,
        typeLabel: 'System',
        description: String(item && item.description ? item.description : 'Keine Beschreibung vorhanden.')
      };
    });

    const customEntries = (Array.isArray(customItems) ? customItems : []).map(function (item) {
      const target = Math.max(1, Number(item && item.target) || 1);
      const current = Math.min(target, Math.max(0, Number(item && item.current) || 0));
      const done = current >= target;
      return {
        id: String(item && item.id ? item.id : ''),
        title: String(item && item.title ? item.title : 'Ohne Titel'),
        image: String(item && item.image ? item.image : '').trim(),
        current: current,
        target: target,
        percent: Math.max(0, Math.min(100, Math.round((current / target) * 100))),
        done: done,
        typeLabel: 'Individuell',
        description: String(item && item.description ? item.description : 'Keine Beschreibung vorhanden.')
      };
    });

    return systemEntries.concat(customEntries);
  }

  function renderAchievementOverview(container, entries) {
    if (!container) {
      return;
    }

    const allEntries = Array.isArray(entries) ? entries : [];
    container.innerHTML = '';

    if (allEntries.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'muted';
      empty.textContent = 'Keine Achievements vorhanden.';
      container.appendChild(empty);
      return;
    }

    const notStarted = allEntries.filter(function (entry) {
      return !entry.done && Number(entry.current) <= 0;
    });
    const inProgress = allEntries.filter(function (entry) {
      return !entry.done && Number(entry.current) > 0;
    });
    const completed = allEntries.filter(function (entry) {
      return entry.done;
    });

    function appendGroup(title, groupEntries) {
      const groupWrap = document.createElement('article');
      groupWrap.className = 'quest-accordion';

      const groupHeader = document.createElement('div');
      groupHeader.className = 'quest-accordion-header';

      const groupMain = document.createElement('div');
      groupMain.className = 'quest-accordion-main';

      const heading = document.createElement('h4');
      heading.className = 'quest-title';
      heading.textContent = title + ' (' + groupEntries.length + ')';
      groupMain.appendChild(heading);

      const actions = document.createElement('div');
      actions.className = 'quest-actions';
      const toggleButton = document.createElement('button');
      toggleButton.type = 'button';
      toggleButton.className = 'quest-toggle-btn';
      toggleButton.textContent = 'Einklappen';
      actions.appendChild(toggleButton);

      groupHeader.appendChild(groupMain);
      groupHeader.appendChild(actions);

      const groupBody = document.createElement('div');
      groupBody.className = 'quest-accordion-body';
      groupBody.hidden = false;

      toggleButton.addEventListener('click', function () {
        groupBody.hidden = !groupBody.hidden;
        toggleButton.textContent = groupBody.hidden ? 'Ausklappen' : 'Einklappen';
      });

      if (groupEntries.length === 0) {
        const none = document.createElement('p');
        none.className = 'muted';
        none.textContent = 'Keine Eintraege.';
        groupBody.appendChild(none);
        groupWrap.appendChild(groupHeader);
        groupWrap.appendChild(groupBody);
        container.appendChild(groupWrap);
        return;
      }

      groupEntries.forEach(function (entry) {
        const card = document.createElement('article');
        card.className = 'quest-accordion';

        const header = document.createElement('div');
        header.className = 'quest-accordion-header';

        const main = document.createElement('div');
        main.className = 'quest-accordion-main';

        if (entry.image) {
          const thumb = document.createElement('img');
          thumb.className = 'achievement-overview-thumb';
          thumb.src = entry.image;
          thumb.alt = entry.title;
          thumb.loading = 'lazy';
          thumb.addEventListener('error', function () {
            thumb.style.display = 'none';
          });
          main.appendChild(thumb);
        }

        const titleWrap = document.createElement('div');
        titleWrap.className = 'quest-main-text';
        const cardTitle = document.createElement('h5');
        cardTitle.className = 'quest-title';
        cardTitle.textContent = entry.title;

        const meta = document.createElement('p');
        meta.className = 'quest-meta';
        meta.textContent = entry.typeLabel + ' | Fortschritt: ' + entry.current + ' / ' + entry.target + ' (' + entry.percent + ' %)';

        titleWrap.appendChild(cardTitle);
        titleWrap.appendChild(meta);

        const status = document.createElement('span');
        if (entry.done) {
          status.className = 'quest-pending-check';
          status.textContent = 'Abgeschlossen';
        } else if (entry.current > 0) {
          status.className = 'quest-ep';
          status.textContent = 'Begonnen';
        } else {
          status.className = 'quest-ep';
          status.textContent = 'Nicht begonnen';
        }

        main.appendChild(titleWrap);
        main.appendChild(status);

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

        if (entry.image) {
          const largePreview = document.createElement('img');
          largePreview.className = 'achievement-overview-preview';
          largePreview.src = entry.image;
          largePreview.alt = entry.title;
          largePreview.loading = 'lazy';
          largePreview.addEventListener('error', function () {
            largePreview.style.display = 'none';
          });
          body.appendChild(largePreview);
        }

        const description = document.createElement('p');
        description.className = 'quest-meta';
        description.textContent = entry.description;
        body.appendChild(description);

        toggleButton.addEventListener('click', function () {
          body.hidden = !body.hidden;
          toggleButton.textContent = body.hidden ? 'Details' : 'Weniger';
        });

        card.appendChild(header);
        card.appendChild(body);
        groupBody.appendChild(card);
      });

      groupWrap.appendChild(groupHeader);
      groupWrap.appendChild(groupBody);
      container.appendChild(groupWrap);
    }

    appendGroup('Noch nicht begonnen', notStarted);
    appendGroup('Begonnen', inProgress);
    appendGroup('Abgeschlossen', completed);
  }

  async function loadAchievements() {
    const playerId = getOrCreatePlayerId();
    const statePromise = fetch(API_URL + '?action=get_state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: playerId })
    });
    const catalogPromise = loadAchievementCatalog();
    const questCatalogPromise = loadQuestCatalog();
    const shopItemsPromise = loadShopItems();

    const response = await statePromise;
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Achievements konnten nicht geladen werden.');
    }
    const catalogPayload = await catalogPromise;
    const questCatalog = await questCatalogPromise;
    const shopItems = await shopItemsPromise;

    const achievements = buildSystemAchievements(data.player, catalogPayload.systemItems);
    const customAchievements = buildCustomAchievements(data.player, catalogPayload.customItems, questCatalog, shopItems);
    const done = achievements.filter(function (a) { return a.done; }).length;
    const customDone = customAchievements.filter(function (a) { return a.done; }).length;

    const summary = document.getElementById('achievement-summary');
    if (summary) {
      summary.textContent = done + ' von ' + achievements.length + ' System-Achievements errungen. ' + customDone + ' von ' + customAchievements.length + ' individuellen Achievements freigeschaltet.';
    }

    renderPath(document.getElementById('achievement-path'), achievements, customAchievements);
    renderAchievementOverview(
      document.getElementById('achievement-overview'),
      toOverviewEntries(achievements, customAchievements)
    );
  }

  loadAchievements().catch(function (err) {
    const summary = document.getElementById('achievement-summary');
    if (summary) {
      summary.textContent = 'Fehler: ' + err.message;
    }
  });
})();
