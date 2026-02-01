// Spotify status panel (simple client-side check + status link)
(function(){
  const container = document.getElementById('spotify-status');
  if(!container) return;

  function setContent(state, url){
    container.innerHTML = '';
    const el = document.createElement('div');
    el.className = 'status-item';

    const left = document.createElement('div');
    left.className = 'status-name';
    left.innerHTML = '<strong>Spotify</strong><div style="font-size:0.85rem;color:var(--muted)">Status: ' + state.label + '</div>';

    const badge = document.createElement('span');
    badge.className = 'status-badge ' + state.cls;
    badge.textContent = state.text;

    el.appendChild(left);
    el.appendChild(badge);
    container.appendChild(el);
  }

  function timeout(ms){ return new Promise((res)=>setTimeout(res, ms)); }

  async function tryFetch(url, timeoutMs=3000){
    try{
      const controller = new AbortController();
      const id = setTimeout(()=>controller.abort(), timeoutMs);
      const res = await fetch(url, {mode:'no-cors', cache:'no-store', signal: controller.signal});
      clearTimeout(id);
      return {ok:true, opaque: res.type === 'opaque'};
    }catch(e){ return {ok:false}; }
  }

  async function run(){
    setContent({label:'Prüfe…', text:'Unbekannt', cls:'unknown'}, 'https://status.spotify.com/');
    // Try Spotify status page (best-effort). If fetch resolves (opaque) mark online.
    const s = await tryFetch('https://status.spotify.com/', 3000);
    if(s.ok){
      setContent({label:'Erreichbar', text:'Online', cls:'online'}, 'https://status.spotify.com/');
      return;
    }
    // fallback: show link and unknown
    setContent({label:'Nicht überprüfbar', text:'Unbekannt', cls:'unknown'}, 'https://status.spotify.com/');
  }

  run();
})();
