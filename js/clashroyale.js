// Clash Royale status panel (simple client-side check + support link)
(function(){
  const container = document.getElementById('clashroyale-status');
  if(!container) return;

  function setContent(state, url){
    container.innerHTML = '';
    const el = document.createElement('div');
    el.className = 'status-item';

    const left = document.createElement('div');
    left.className = 'status-name';
    left.innerHTML = '<strong>Clash Royale</strong><div style="font-size:0.85rem;color:var(--muted)">Status: ' + state.label + '</div>';

    const right = document.createElement('div');
    right.style.display = 'flex';
    right.style.alignItems = 'center';
    right.style.gap = '8px';

    const badge = document.createElement('div');
    badge.className = 'status-badge ' + state.cls;
    badge.textContent = state.text;

    const btn = document.createElement('a');
    btn.className = 'status-btn';
    btn.textContent = 'Support/Status';
    btn.href = url || 'https://supercell.com/';
    btn.target = '_blank';

    right.appendChild(badge);
    right.appendChild(btn);

    el.appendChild(left);
    el.appendChild(right);
    container.appendChild(el);
  }

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
    setContent({label:'Prüfe…', text:'Unbekannt', cls:'unknown'}, 'https://supercell.com/');
    const s = await tryFetch('https://status.supercell.com/', 3000);
    if(s.ok){
      setContent({label:'Erreichbar', text:'Online', cls:'online'}, 'https://status.supercell.com/');
      return;
    }
    setContent({label:'Nicht überprüfbar', text:'Unbekannt', cls:'unknown'}, 'https://supercell.com/');
  }

  run();
})();
