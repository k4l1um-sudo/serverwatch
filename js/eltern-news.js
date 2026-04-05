(function () {
  const API_URL = 'api/news.php';

  const listEl = document.getElementById('parent-news-list');
  const form = document.getElementById('parent-news-form');
  const formTitleEl = document.getElementById('news-form-title');
  const msgEl = document.getElementById('news-form-msg');
  const cancelEditBtn = document.getElementById('news-cancel-edit');
  const deleteEditBtn = document.getElementById('news-delete-edit');

  const idEl = document.getElementById('news-id');
  const titleEl = document.getElementById('news-title');
  const teaserEl = document.getElementById('news-teaser');
  const contentEl = document.getElementById('news-content');
  const editorEl = document.getElementById('news-editor');

  let currentItems = [];

  function setMsg(text, isError) {
    if (!msgEl) {
      return;
    }
    msgEl.textContent = text || '';
    msgEl.classList.remove('success', 'error');
    if (!text) {
      return;
    }
    msgEl.classList.add(isError ? 'error' : 'success');
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async function loadNews() {
    const response = await fetch(API_URL + '?action=list', { method: 'GET' });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'News konnten nicht geladen werden.');
    }
    return Array.isArray(data.items) ? data.items : [];
  }

  function formatTime(value) {
    if (!value) {
      return '-';
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return '-';
    }
    return d.toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' });
  }

  function setEditMode(item) {
    if (!item) {
      idEl.value = '';
      titleEl.value = '';
      teaserEl.value = '';
      editorEl.innerHTML = '';
      contentEl.value = '';
      if (formTitleEl) {
        formTitleEl.textContent = 'Neue News';
      }
      if (cancelEditBtn) {
        cancelEditBtn.hidden = true;
      }
      if (deleteEditBtn) {
        deleteEditBtn.hidden = true;
      }
      return;
    }

    idEl.value = String(item.id || '');
    titleEl.value = String(item.title || '');
    teaserEl.value = String(item.teaser || '');
    editorEl.innerHTML = String(item.contentHtml || '');
    contentEl.value = editorEl.innerHTML;
    if (formTitleEl) {
      formTitleEl.textContent = 'News bearbeiten';
    }
    if (cancelEditBtn) {
      cancelEditBtn.hidden = false;
    }
    if (deleteEditBtn) {
      deleteEditBtn.hidden = false;
    }
    window.scrollTo({ top: form.offsetTop - 80, behavior: 'smooth' });
  }

  function renderList(items) {
    if (!listEl) {
      return;
    }

    listEl.innerHTML = '';
    if (!Array.isArray(items) || items.length === 0) {
      listEl.innerHTML = '<p class="muted">Noch keine News vorhanden.</p>';
      return;
    }

    items.slice(0, 5).forEach(function (item) {
      const card = document.createElement('article');
      card.className = 'parent-news-item';

      const head = document.createElement('div');
      head.className = 'parent-news-head';

      const title = document.createElement('h4');
      title.className = 'quest-title';
      title.textContent = String(item.title || 'Ohne Titel');

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'chip';
      editBtn.textContent = 'Bearbeiten';
      editBtn.addEventListener('click', function () {
        setEditMode(item);
      });

      head.appendChild(title);
      head.appendChild(editBtn);

      const teaser = document.createElement('p');
      teaser.className = 'quest-meta';
      teaser.textContent = String(item.teaser || '');

      const meta = document.createElement('p');
      meta.className = 'quest-meta';
      meta.innerHTML = 'Aktualisiert: <strong>' + escapeHtml(formatTime(item.updatedAt || item.createdAt)) + '</strong>';

      card.appendChild(head);
      card.appendChild(teaser);
      card.appendChild(meta);
      listEl.appendChild(card);
    });
  }

  async function refresh() {
    currentItems = await loadNews();
    renderList(currentItems);
  }

  async function saveNews(event) {
    event.preventDefault();
    setMsg('', false);

    const title = String(titleEl.value || '').trim();
    const teaser = String(teaserEl.value || '').trim();
    const html = String(editorEl.innerHTML || '').trim();

    contentEl.value = html;

    if (!title || !teaser || !html) {
      setMsg('Bitte Titel, Teaser und Inhalt ausfuellen.', true);
      return;
    }

    const payload = {
      title: title,
      teaser: teaser,
      contentHtml: html
    };

    if (idEl.value) {
      payload.id = idEl.value;
    }

    try {
      const response = await fetch(API_URL + '?action=save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'News konnte nicht gespeichert werden.');
      }

      setMsg('News gespeichert.', false);
      setEditMode(null);
      await refresh();
    } catch (err) {
      setMsg(String(err && err.message ? err.message : 'Unbekannter Fehler'), true);
    }
  }

  async function deleteNews() {
    setMsg('', false);

    const id = String(idEl.value || '').trim();
    if (!id) {
      setMsg('Bitte zuerst eine News zum Bearbeiten auswaehlen.', true);
      return;
    }

    if (!window.confirm('Diese News wirklich loeschen?')) {
      return;
    }

    try {
      const response = await fetch(API_URL + '?action=delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'News konnte nicht geloescht werden.');
      }

      setMsg('News geloescht.', false);
      setEditMode(null);
      await refresh();
    } catch (err) {
      setMsg(String(err && err.message ? err.message : 'Unbekannter Fehler'), true);
    }
  }

  document.querySelectorAll('[data-cmd]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const cmd = btn.getAttribute('data-cmd');
      if (!cmd) {
        return;
      }
      editorEl.focus();
      document.execCommand(cmd, false);
    });
  });

  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', function () {
      setEditMode(null);
      setMsg('', false);
    });
  }

  if (deleteEditBtn) {
    deleteEditBtn.addEventListener('click', deleteNews);
  }

  if (form) {
    form.addEventListener('submit', saveNews);
  }

  refresh().catch(function (err) {
    if (listEl) {
      listEl.innerHTML = '<p class="muted">Fehler: ' + escapeHtml(err.message || 'Unbekannter Fehler') + '</p>';
    }
  });
})();
