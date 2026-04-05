(function () {
  const PLAYER_STORAGE_KEY = 'serverwatch_quest_player_id';
  const SHARED_PLAYER_ID = 'kid_shared_main';
  const QUEST_API = 'api/quest.php';
  const SHOP_API = 'api/shop_items.php';

  const coinsEl = document.getElementById('shop-coins');
  const listEl = document.getElementById('shop-items');
  const msgEl = document.getElementById('shop-msg');
  const headingEl = document.getElementById('shop-items-heading');

  function getOrCreatePlayerId() {
    localStorage.setItem(PLAYER_STORAGE_KEY, SHARED_PLAYER_ID);
    return SHARED_PLAYER_ID;
  }

  const playerId = getOrCreatePlayerId();

  async function questApi(action, payload) {
    const response = await fetch(QUEST_API + '?action=' + encodeURIComponent(action), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ player_id: playerId }, payload || {}))
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Quest API Fehler');
    }
    return data;
  }

  async function loadShopItems() {
    const response = await fetch(SHOP_API, { method: 'GET' });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Shop konnte nicht geladen werden.');
    }
    return Array.isArray(data.items) ? data.items : [];
  }

  function showMessage(text, type) {
    if (!msgEl) {
      return;
    }
    msgEl.textContent = text;
    msgEl.className = 'shop-msg ' + (type || '');
    if (text) {
      window.setTimeout(function () {
        msgEl.textContent = '';
        msgEl.className = 'shop-msg';
      }, 3000);
    }
  }

  function createCard(item, player, onBuy) {
    const ownedItems = Array.isArray(player.ownedShopItems) ? player.ownedShopItems.map(String) : [];
    const isOwned = ownedItems.indexOf(String(item.id)) !== -1;
    const cost = Number(item.costCoins) || 0;
    const canBuy = !isOwned && (Number(player.coins) || 0) >= cost;

    const card = document.createElement('article');
    card.className = 'shop-item';

    const itemType = String((item && item.type) || 'shop_item');
    const titleText = item.title || item.name || 'Ohne Namen';

    const title = document.createElement('h4');
    title.className = 'quest-title';
    title.textContent = titleText;

    const description = document.createElement('p');
    description.className = 'quest-meta';
    description.textContent = item.description || 'Keine Beschreibung';

    let preview = null;
    if (item.image) {
      preview = document.createElement('img');
      preview.className = 'shop-preview';
      preview.src = item.image || '';
      preview.alt = titleText + ' Vorschau';
      preview.loading = 'lazy';
      preview.addEventListener('error', function () {
        preview.classList.add('missing');
        preview.alt = 'Bild fehlt';
        preview.removeAttribute('src');
      });
    }

    const type = document.createElement('p');
    type.className = 'quest-meta';
    if (itemType === 'profile_image') {
      type.textContent = 'Typ: Profilbild';
    } else if (itemType === 'reward_item') {
      type.textContent = 'Typ: Belohnung (Coins)';
    } else {
      type.textContent = 'Typ: Shopitem';
    }

    const costLine = document.createElement('p');
    costLine.className = 'quest-meta quest-coins-line';

    const costText = document.createElement('span');
    costText.textContent = 'Preis: ' + String(cost) + ' Coins';
    costLine.appendChild(costText);

    const coin = document.createElement('img');
    coin.className = 'coin-icon';
    coin.src = 'assets/coin.png';
    coin.alt = 'Coin';
    coin.addEventListener('error', function () {
      coin.style.display = 'none';
    });
    costLine.appendChild(coin);

    let imageHint = null;
    if (item.image) {
      imageHint = document.createElement('p');
      imageHint.className = 'quest-meta';
      imageHint.textContent = item.image ? 'Datei: ' + item.image : 'Datei: nicht gesetzt';
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chip';

    if (isOwned) {
      button.textContent = 'Gekauft';
      button.disabled = true;
    } else {
      button.textContent = canBuy ? 'Kaufen' : 'Zu wenig Coins';
      button.disabled = !canBuy;
      button.addEventListener('click', function () {
        onBuy(item);
      });
    }

    card.appendChild(title);
    card.appendChild(description);
    if (preview) {
      card.appendChild(preview);
    }
    card.appendChild(type);
    card.appendChild(costLine);
    if (imageHint) {
      card.appendChild(imageHint);
    }
    card.appendChild(button);

    return card;
  }

  async function refresh() {
    if (listEl) {
      listEl.innerHTML = '<p class="muted">Lade Shop-Items...</p>';
    }

    const state = await questApi('get_state');
    const player = state.player || {};
    const items = await loadShopItems();
    const ownedIds = new Set((Array.isArray(player.ownedShopItems) ? player.ownedShopItems : []).map(String));
    const availableItems = items.filter(function (item) {
      const id = String((item && item.id) || '');
      if (ownedIds.has(id)) {
        return false;
      }

      if (String((item && item.type) || '') === 'reward_item') {
        return false;
      }

      return true;
    }).sort(function (a, b) {
      return (Number(a && a.costCoins) || 0) - (Number(b && b.costCoins) || 0);
    });

    if (coinsEl) {
      coinsEl.textContent = String(Number(player.coins) || 0);
    }

    if (headingEl) {
      headingEl.textContent = 'Items (' + items.length + ')';
    }

    if (listEl) {
      listEl.innerHTML = '';
      if (availableItems.length === 0) {
        listEl.innerHTML = '<p class="muted">Alle Shopitems wurden bereits gekauft.</p>';
      } else {
        availableItems.forEach(function (item) {
          listEl.appendChild(createCard(item, player, async function (selected) {
            try {
              await questApi('purchase_item', { itemId: selected.id });
              showMessage('Item gekauft: ' + (selected.title || selected.name || selected.id), 'success');
              await refresh();
            } catch (err) {
              showMessage(err.message, 'error');
              await refresh();
            }
          }));
        });
      }
    }
  }

  refresh().catch(function (err) {
    showMessage('Fehler: ' + err.message, 'error');
    if (listEl) {
      listEl.innerHTML = '<p class="muted">Fehler beim Laden des Shops.</p>';
    }
  });
})();
