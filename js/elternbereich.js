(function () {
  const PLAYER_STORAGE_KEY = 'serverwatch_quest_player_id';
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
  let currentPlayer = null;
  let currentCatalogQuests = [];
  let currentShopItems = [];
  let currentAchievementItems = [];

  function getOrCreatePlayerId() {
    const existing = localStorage.getItem(PLAYER_STORAGE_KEY);
    if (existing && /^[a-zA-Z0-9_-]{4,40}$/.test(existing)) {
      return existing;
    }
    const id = 'kid_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(PLAYER_STORAGE_KEY, id);
    return id;
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
        item.appendChild(editBtn);
      }
      container.appendChild(item);
    });
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

    const confirmationPin = window.prompt('PIN fuer finale Bestaetigung eingeben:');
    if (confirmationPin === null) {
      return;
    }

    try {
      const response = await fetch('api/quest.php?action=confirm_quest_completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: getOrCreatePlayerId(),
          questId: questId,
          confirmationPin: confirmationPin
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
      'shop_item': 'Shopitem'
    };
    const typeLabel = typeLabels[item && item.type] || (item && item.type) || 'Shopitem';
    return String(cost) + ' Coins · ' + typeLabel;
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
  }

  function createAchievementMetaLine(item) {
    const target = Number(item && item.target) || 0;
    return String(target) + ' Quests';
  }

  function renderParentAchievementItems(items) {
    if (!parentAchievementItemsEl) {
      return;
    }

    parentAchievementItemsEl.innerHTML = '';
    const sorted = (Array.isArray(items) ? items.slice() : []).sort(function (a, b) {
      return (Number(a && a.target) || 0) - (Number(b && b.target) || 0);
    });

    if (sorted.length === 0) {
      parentAchievementItemsEl.innerHTML = '<p class="muted">Noch keine Achievements vorhanden.</p>';
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
      expandBtn.textContent = 'Bildpfad';

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
      description.textContent = item.image || 'Kein Bildpfad.';

      expandBtn.addEventListener('click', function () {
        const isHidden = description.hidden;
        description.hidden = !isHidden;
        expandBtn.textContent = isHidden ? 'Bildpfad verbergen' : 'Bildpfad';
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
    const targetEl = document.getElementById('edit-achievement-item-target');
    const imageEl = document.getElementById('edit-achievement-item-image');

    idEl.value = String(item.id || '').trim();
    titleEl.value = item.title || '';
    targetEl.value = String(Number(item.target) || 1);
    imageEl.value = item.image || '';

    editAchievementItemPanel.hidden = false;
    setMsg(editAchievementItemMsg, '', '');
    editAchievementItemPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async function createNewAchievementItem(event) {
    event.preventDefault();

    const title = (document.getElementById('new-achievement-item-title').value || '').trim();
    const target = Number(document.getElementById('new-achievement-item-target').value || 0);
    const image = (document.getElementById('new-achievement-item-image').value || '').trim();

    if (!title || target < 1 || !image) {
      setMsg(newAchievementItemMsg, 'Bitte Titel, Meilenstein und Bildpfad eingeben.', 'error');
      return;
    }

    try {
      const response = await fetch('api/achievement_items.php?action=create_item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title, target: target, image: image })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMsg(newAchievementItemMsg, data.error || 'Achievement konnte nicht erstellt werden.', 'error');
        return;
      }

      setMsg(newAchievementItemMsg, 'Achievement wurde erstellt.', 'success');
      newAchievementItemForm.reset();
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
    const target = Number(document.getElementById('edit-achievement-item-target').value || 0);
    const image = (document.getElementById('edit-achievement-item-image').value || '').trim();

    if (!itemId || !title || target < 1 || !image) {
      setMsg(editAchievementItemMsg, 'Bitte alle Felder korrekt ausfuellen.', 'error');
      return;
    }

    try {
      const response = await fetch('api/achievement_items.php?action=update_item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: itemId, title: title, target: target, image: image })
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

    const type = item.type || 'reallife_item';
    typeEl.value = type;
    if (imageEl) { imageEl.value = item.image || ''; }
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
    const type = (document.getElementById('new-shop-item-type') || {}).value || 'reallife_item';
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
      updateShopTypeFields('new', 'reallife_item');
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
    const type = (document.getElementById('edit-shop-item-type') || {}).value || 'reallife_item';
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
    if (imageRow) { imageRow.hidden = (type !== 'profile_image'); }
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

    if (newShopItemForm) {
      newShopItemForm.addEventListener('submit', createNewShopItem);
    }

    const newTypeSelect = document.getElementById('new-shop-item-type');
    if (newTypeSelect) {
      newTypeSelect.addEventListener('change', function () {
        updateShopTypeFields('new', newTypeSelect.value);
      });
    }

    const editTypeSelect = document.getElementById('edit-shop-item-type');
    if (editTypeSelect) {
      editTypeSelect.addEventListener('change', function () {
        updateShopTypeFields('edit', editTypeSelect.value);
      });
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

  setupNewQuestPanel();

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
      renderParentQuestStatus(player, catalogQuests);
      renderParentShopItems(shopItems);
      renderParentAchievementItems(achievementItems);
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

