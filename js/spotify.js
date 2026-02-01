// Spotify status: try statuspage API, otherwise show link
(async function(){
  const container = document.getElementById('spotify-status');
  if(!container) return;

  const API = 'https://spotify.statuspage.io/api/v2/summary.json';
  const PAGE = 'https://status.spotify.com/';

  function showLink(){
    container.innerHTML = '<p><a class="btn" href="' + PAGE + '" target="_blank" rel="noopener">Spotify Status</a></p>';
  }

  function renderStatus(text, cls){
    container.innerHTML = '<div class="status-item"><div class="status-name">Spotify</div><div class="status-badge ' + cls + '">' + text + '</div></div>';
  }

  container.innerHTML = '<p class="muted">Lade Status…</p>';
  try{
    const res = await fetch(API, { cache: 'no-store' });
    if(res.ok){
      const j = await res.json();
      const indicator = j.status && j.status.indicator ? j.status.indicator : null;
      const desc = j.status && j.status.description ? j.status.description : 'Status verfügbar';
      if(indicator === 'none'){
        renderStatus('Online', 'online');
      } else if(indicator === 'minor'){
        renderStatus(desc || 'Eingeschränkte Leistung', 'degraded');
      } else if(indicator === 'major'){
        renderStatus(desc || 'Ausfall', 'down');
      } else {
        // unknown indicator — show description
        renderStatus(desc, 'unknown');
      }
      return;
    } else {
      // API responded with non-OK — show link
      showLink();
    }
  }catch(e){
    // likely CORS — show link only
    showLink();
  }

  setInterval(()=>{ /* periodic refresh */ }, 60*1000);
})();
