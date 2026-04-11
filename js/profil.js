(function () {
  const PLAYER_STORAGE_KEY = 'serverwatch_quest_player_id';
  const SHARED_PLAYER_ID = 'kid_shared_main';
  const API = 'api/quest.php';
  const SHOP_API = 'api/shop_items.php';
  const PLACEHOLDER_IMAGE = 'assets/avatar-placeholder.svg';

  function getPlayerId() {
    localStorage.setItem(PLAYER_STORAGE_KEY, SHARED_PLAYER_ID);
    return SHARED_PLAYER_ID;
  }

  async function api(params) {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ player_id: getPlayerId() }, params))
    });
    return res.json();
  }

  async function loadShopItems() {
    const res = await fetch(SHOP_API, { method: 'GET' });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error || 'Shop-Items konnten nicht geladen werden.');
    }
    return Array.isArray(data.items) ? data.items : [];
  }

  function setMsg(text, type) {
    const el = document.getElementById('rename-msg');
    el.textContent = text;
    el.className = 'rename-msg ' + (type || '');
    if (text) {
      setTimeout(function () { el.textContent = ''; el.className = 'rename-msg'; }, 3000);
    }
  }

  function getOwnedItems(player, allItems) {
    const ownedIds = Array.isArray(player.ownedShopItems) ? player.ownedShopItems.map(String) : [];
    return allItems.filter(function (item) {
      return ownedIds.indexOf(String(item.id)) !== -1;
    });
  }

  function getAchievementUnlockedItems(player) {
    if (!player || !Array.isArray(player.achievementUnlockedProfileImages)) {
      return [];
    }

    return player.achievementUnlockedProfileImages.map(function (item) {
      return {
        id: String(item && item.id ? item.id : ''),
        title: String(item && item.title ? item.title : 'Achievement-Profilbild'),
        image: String(item && item.image ? item.image : PLACEHOLDER_IMAGE),
        type: 'profile_image'
      };
    }).filter(function (item) {
      return item.id !== '';
    });
  }

  function mergeUniqueItems(primary, secondary) {
    const seen = {};
    const result = [];

    primary.concat(secondary).forEach(function (item) {
      const id = String(item.id || '');
      if (!id || seen[id]) {
        return;
      }
      seen[id] = true;
      result.push(item);
    });

    return result;
  }

  function renderOwnedItems(ownedItems) {
    const list = document.getElementById('owned-items');
    if (!list) {
      return;
    }

    list.innerHTML = '';
    if (!ownedItems.length) {
      list.innerHTML = '<p class="muted">Noch keine gekauften Artikel vorhanden.</p>';
      return;
    }

    ownedItems.forEach(function (item) {
      const card = document.createElement('article');
      card.className = 'shop-item';

      const title = document.createElement('h4');
      title.className = 'quest-title';
      title.textContent = item.title || 'Unbenanntes Item';

      const type = document.createElement('p');
      type.className = 'quest-meta';
      type.textContent = item.description || '-';

      const img = document.createElement('img');
      img.className = 'shop-preview';
      img.src = item.image || PLACEHOLDER_IMAGE;
      img.alt = (item.title || 'Item') + ' Vorschau';
      img.loading = 'lazy';
      img.addEventListener('error', function () {
        img.src = PLACEHOLDER_IMAGE;
      });

      card.appendChild(title);
      card.appendChild(img);
      card.appendChild(type);
      list.appendChild(card);
    });
  }

  function renderProfileImageSelection(player, selectableItems) {
    const preview = document.getElementById('profile-image-preview');
    const select = document.getElementById('profile-image-select');
    if (!preview || !select) {
      return;
    }

    const currentProfileImage = player.profileImage && player.profileImage.image ? player.profileImage.image : PLACEHOLDER_IMAGE;
    preview.src = currentProfileImage;
    preview.addEventListener('error', function () {
      preview.src = PLACEHOLDER_IMAGE;
    });

    const selectableProfileImages = selectableItems.filter(function (item) {
      return (item.type || '') === 'profile_image';
    });

    select.innerHTML = '<option value="">Standard (Platzhalter)</option>';
    selectableProfileImages.forEach(function (item) {
      const option = document.createElement('option');
      option.value = String(item.id || '');
      option.textContent = item.title || String(item.id || 'Profilbild');
      select.appendChild(option);
    });

    const selectedId = player.profileImageItemId ? String(player.profileImageItemId) : '';
    select.value = selectedId;
  }

  function renderPlayerTitle(player) {
    const badge = document.getElementById('current-title');
    if (!badge) {
      return;
    }

    const selectedTitle = player && player.selectedTitle && player.selectedTitle.title
      ? String(player.selectedTitle.title).trim()
      : '';

    if (!selectedTitle) {
      badge.hidden = true;
      badge.textContent = '';
      return;
    }

    badge.hidden = false;
    badge.textContent = selectedTitle;
  }

  function renderTitleSelection(player) {
    const select = document.getElementById('player-title-select');
    if (!select) {
      return;
    }

    const unlockedTitles = Array.isArray(player && player.achievementUnlockedTitles)
      ? player.achievementUnlockedTitles
      : [];

    select.innerHTML = '<option value="">Kein Titel</option>';
    unlockedTitles.forEach(function (entry) {
      const achievementId = String(entry && entry.achievementId ? entry.achievementId : '');
      const title = String(entry && entry.title ? entry.title : '').trim();
      if (!achievementId || !title) {
        return;
      }
      const option = document.createElement('option');
      option.value = achievementId;
      option.textContent = title;
      select.appendChild(option);
    });

    const selectedId = player && player.selectedTitleAchievementId
      ? String(player.selectedTitleAchievementId)
      : '';
    select.value = selectedId;
  }

  async function load() {
    try {
      const data = await api({ action: 'get_state' });
      if (!data.ok) { setMsg('Profil konnte nicht geladen werden.', 'error'); return; }
      const shopItems = await loadShopItems();
      const name = data.player.name || 'Spieler';
      document.getElementById('current-name').textContent = name;
      document.getElementById('name-input').value = name;
      renderPlayerTitle(data.player);
      renderTitleSelection(data.player);

      const ownedItems = getOwnedItems(data.player, shopItems);
      const achievementUnlockedItems = getAchievementUnlockedItems(data.player);
      const selectableItems = mergeUniqueItems(ownedItems, achievementUnlockedItems);
      renderOwnedItems(ownedItems);
      renderProfileImageSelection(data.player, selectableItems);
    } catch (e) {
      setMsg('Verbindungsfehler.', 'error');
    }
  }

  async function rename(e) {
    e.preventDefault();
    const newName = document.getElementById('name-input').value.trim();
    if (!newName) { setMsg('Bitte einen Namen eingeben.', 'error'); return; }
    try {
      const data = await api({ action: 'rename_player', name: newName });
      if (data.ok) {
        document.getElementById('current-name').textContent = data.player.name;
        setMsg('Name erfolgreich gespeichert.', 'success');
      } else {
        setMsg(data.error || 'Fehler beim Speichern.', 'error');
      }
    } catch (e) {
      setMsg('Verbindungsfehler.', 'error');
    }
  }

  async function setProfileImage(e) {
    e.preventDefault();
    const select = document.getElementById('profile-image-select');
    const itemId = (select && typeof select.value === 'string') ? select.value : '';

    try {
      const data = await api({ action: 'set_profile_image', itemId: itemId });
      if (data.ok) {
        setMsg('Profilbild aktualisiert.', 'success');
        await load();
      } else {
        setMsg(data.error || 'Profilbild konnte nicht gesetzt werden.', 'error');
      }
    } catch (e) {
      setMsg('Verbindungsfehler.', 'error');
    }
  }

  async function setPlayerTitle(e) {
    e.preventDefault();
    const select = document.getElementById('player-title-select');
    const achievementId = (select && typeof select.value === 'string') ? select.value : '';

    try {
      const data = await api({ action: 'set_player_title', achievementId: achievementId });
      if (data.ok) {
        setMsg('Titel aktualisiert.', 'success');
        await load();
      } else {
        setMsg(data.error || 'Titel konnte nicht gesetzt werden.', 'error');
      }
    } catch (e) {
      setMsg('Verbindungsfehler.', 'error');
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    load();
    document.getElementById('rename-form').addEventListener('submit', rename);
    document.getElementById('player-title-form').addEventListener('submit', setPlayerTitle);
    document.getElementById('profile-image-form').addEventListener('submit', setProfileImage);
  });
})();
