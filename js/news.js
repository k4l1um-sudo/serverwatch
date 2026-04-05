(function () {
  const API_URL = 'api/news.php';

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatTime(value) {
    if (!value) {
      return '';
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return '';
    }
    return d.toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' });
  }

  function createLandingCard(item) {
    const link = document.createElement('a');
    link.className = 'news-card';
    link.href = 'news.html#' + encodeURIComponent(String(item.id || ''));

    const img = document.createElement('img');
    img.className = 'news-card-image';
    img.src = item.image || 'assets/News.png';
    img.alt = 'News Vorschau';
    img.loading = 'lazy';
    img.addEventListener('error', function () {
      img.src = 'assets/News.png';
    });

    const body = document.createElement('div');
    body.className = 'news-card-body';

    const title = document.createElement('h4');
    title.className = 'news-card-title';
    title.textContent = String(item.title || 'News');

    const teaser = document.createElement('p');
    teaser.className = 'news-card-teaser';
    teaser.textContent = String(item.teaser || '');

    const time = document.createElement('p');
    time.className = 'news-card-time';
    time.textContent = formatTime(item.updatedAt || item.createdAt);

    body.appendChild(title);
    body.appendChild(teaser);
    if (time.textContent) {
      body.appendChild(time);
    }

    link.appendChild(img);
    link.appendChild(body);
    return link;
  }

  function createNewsArticle(item) {
    const article = document.createElement('article');
    article.className = 'news-article';
    article.id = String(item.id || '');

    const img = document.createElement('img');
    img.className = 'news-card-image';
    img.src = item.image || 'assets/News.png';
    img.alt = 'News Bild';
    img.loading = 'lazy';
    img.addEventListener('error', function () {
      img.src = 'assets/News.png';
    });

    const body = document.createElement('div');
    body.className = 'news-article-body';

    const title = document.createElement('h3');
    title.className = 'news-article-title';
    title.textContent = String(item.title || 'News');

    const teaser = document.createElement('p');
    teaser.className = 'news-article-teaser';
    teaser.textContent = String(item.teaser || '');

    const content = document.createElement('div');
    content.className = 'news-article-content';
    content.innerHTML = String(item.contentHtml || '');

    const time = document.createElement('p');
    time.className = 'news-card-time';
    time.textContent = formatTime(item.updatedAt || item.createdAt);

    body.appendChild(title);
    body.appendChild(teaser);
    if (time.textContent) {
      body.appendChild(time);
    }
    body.appendChild(content);

    article.appendChild(img);
    article.appendChild(body);
    return article;
  }

  async function loadNews() {
    const response = await fetch(API_URL + '?action=list', { method: 'GET' });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'News konnten nicht geladen werden.');
    }
    return Array.isArray(data.items) ? data.items : [];
  }

  function renderLanding() {
    const container = document.getElementById('landing-news-grid');
    if (!container) {
      return;
    }
    loadNews().then(function (items) {
      container.innerHTML = '';
      if (!items.length) {
        container.innerHTML = '<p class="muted">Noch keine News vorhanden.</p>';
        return;
      }
      items.slice(0, 3).forEach(function (item) {
        container.appendChild(createLandingCard(item));
      });
    }).catch(function (err) {
      container.innerHTML = '<p class="muted">Fehler: ' + escapeHtml(err.message || 'Unbekannter Fehler') + '</p>';
    });
  }

  function renderNewsPage() {
    const latestContainer = document.getElementById('news-list-latest');
    const archiveSection = document.getElementById('news-archive-section');
    const archiveBody = document.getElementById('news-archive-body');
    const archiveContainer = document.getElementById('news-list-archive');
    const archiveToggle = document.getElementById('news-archive-toggle');

    if (!latestContainer) {
      return;
    }

    if (archiveToggle && archiveBody) {
      archiveToggle.addEventListener('click', function () {
        const isOpen = archiveToggle.getAttribute('aria-expanded') === 'true';
        archiveToggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
        archiveBody.hidden = isOpen;
      });
    }

    loadNews().then(function (items) {
      latestContainer.innerHTML = '';

      if (!items.length) {
        latestContainer.innerHTML = '<p class="muted">Noch keine News vorhanden.</p>';
        if (archiveSection) {
          archiveSection.hidden = true;
        }
        return;
      }

      const latestItems = items.slice(0, 5);
      const archivedItems = items.slice(5);

      latestItems.forEach(function (item) {
        latestContainer.appendChild(createNewsArticle(item));
      });

      if (archiveSection && archiveContainer) {
        archiveContainer.innerHTML = '';

        if (archivedItems.length > 0) {
          archivedItems.forEach(function (item) {
            archiveContainer.appendChild(createNewsArticle(item));
          });
          archiveSection.hidden = false;
        } else {
          archiveSection.hidden = true;
        }
      }
    }).catch(function (err) {
      latestContainer.innerHTML = '<p class="muted">Fehler: ' + escapeHtml(err.message || 'Unbekannter Fehler') + '</p>';
      if (archiveSection) {
        archiveSection.hidden = true;
      }
    });
  }

  renderLanding();
  renderNewsPage();
})();
