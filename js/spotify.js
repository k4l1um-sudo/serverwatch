// Spotify status: try statuspage API, otherwise show link button
(async function(){
  const container = document.getElementById('spotify-status');
  if(!container) return;

  const API = 'https://spotify.statuspage.io/api/v2/summary.json';
  const PAGE = 'https://status.spotify.com/';

  function showLink(){
    container.innerHTML = '<p><a class="status-btn unknown" href="' + PAGE + '" target="_blank" rel="noopener">Spotify Status</a></p>';
  }

  function renderBadge(text, cls){
    container.innerHTML = '<div class="status-item"><div class="status-name">Spotify</div><div class="status-badge ' + cls + '">' + text + '</div></div>' +
      '<p><a class="status-btn ' + cls + '" href="' + PAGE + '" target="_blank" rel="noopener">Spotify Status</a></p>';
  }

  container.innerHTML = '<p class="muted">Lade Status…</p>';
  try{
    const res = await fetch(API, { cache: 'no-store' });
    if(res.ok){
      const j = await res.json();
      const indicator = j.status && j.status.indicator ? j.status.indicator : null;
      const desc = j.status && j.status.description ? j.status.description : 'Status verfügbar';
      if(indicator === 'none'){
        renderBadge('Online', 'online');
      } else if(indicator === 'minor'){
        renderBadge(desc || 'Eingeschränkte Leistung', 'degraded');
      } else if(indicator === 'major'){
        renderBadge(desc || 'Ausfall', 'down');
      } else {
        renderBadge(desc, 'unknown');
      }
      return;
    } else {
      showLink();
    }
  }catch(e){
    showLink();
  }

  setInterval(()=>{}, 60*1000);
})();
