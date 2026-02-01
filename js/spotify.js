// Spotify status: try statuspage API, otherwise show link
(async function(){
  const container = document.getElementById('spotify-status');
  if(!container) return;

  const API = 'https://spotify.statuspage.io/api/v2/summary.json';
  const PAGE = 'https://status.spotify.com/';

  function showLink(){
    container.innerHTML = '<p>Spotify Status: <a href="' + PAGE + '" target="_blank" rel="noopener">' + PAGE + '</a></p>';
  }

  container.innerHTML = '<p class="muted">Lade Status…</p>';
  try{
    const res = await fetch(API, { cache: 'no-store' });
    if(res.ok){
      const j = await res.json();
      const overall = j.status && j.status.description ? j.status.description : 'Status verfügbar';
      container.innerHTML = '<div class="status-item"><div class="status-name">Spotify</div><div class="status-badge online">' + overall + '</div></div>';
      return;
    } else {
      // if API endpoint responds but with non-OK, show link
      showLink();
    }
  }catch(e){
    // likely CORS — show link only
    showLink();
  }

  setInterval(()=>{ /* periodic refresh */ }, 60*1000);
})();
