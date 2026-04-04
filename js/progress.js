(function () {
  const API_URL = 'api/quest.php';
  const CATALOG_API_URL = 'api/quest_catalog.php';
  const ACHIEVEMENT_API_URL = 'api/achievement_items.php';
  const PLAYER_STORAGE_KEY = 'serverwatch_quest_player_id';

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

  function getOrCreatePlayerId() {
    const existing = localStorage.getItem(PLAYER_STORAGE_KEY);
    if (existing && /^[a-zA-Z0-9_-]{4,40}$/.test(existing)) {
      return existing;
    }
    const id = 'kid_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(PLAYER_STORAGE_KEY, id);
    return id;
  }

  const playerId = getOrCreatePlayerId();
  const playerIdEl = document.getElementById('player-id');
  const levelEl = document.getElementById('level-number');
  const xpTotalEl = document.getElementById('xp-total');
  const coinsTotalEl = document.getElementById('coins-total');
  const progressEl = document.getElementById('level-progress');
  const progressTextEl = document.getElementById('level-progress-text');
  const progressAvatarEl = document.getElementById('progress-avatar');
  const acceptedListEl = document.getElementById('accepted-quests');
  const availableListEl = document.getElementById('available-quests');
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

    const player = stateData.player;
    renderLevel(player);
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
                  const enteredPassword = window.prompt('Passwort fuer Quest-Abgabe eingeben:');
                  if (enteredPassword === null) {
                    return;
                  }

                  await requestQuestApi('complete_quest', {
                    questId: quest.id,
                    completePassword: enteredPassword
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
                const enteredPassword = window.prompt('Passwort fuer Quest-Annahme eingeben:');
                if (enteredPassword === null) {
                  return;
                }

                await requestQuestApi('create_quest', {
                  title: quest.title || 'Quest',
                  rewardXp: Number(quest.rewardXp) || 0,
                  rewardCoins: Number(quest.rewardCoins) || 0,
                  description: quest.description || '',
                  catalogId: quest.id,
                  acceptPassword: enteredPassword
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
})();
