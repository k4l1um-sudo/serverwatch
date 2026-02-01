// IP Status panel (client-side best-effort checks)
(function(){
  const container = document.getElementById('ip-status-list');
  if(!container) return;

  // Nur die letzten drei Einträge anzeigen (Google, Cloudflare, Quad9)
  const ENTRIES = [
    { id:'google', name:'Google Public DNS', ip:'8.8.8.8' },
    { id:'cloudflare', name:'Cloudflare DNS', ip:'1.1.1.1' },
    { id:'quad9', name:'Quad9 DNS', ip:'9.9.9.9' }
  ];

  function renderEntry(e){
    const el = document.createElement('div');
    el.className = 'status-item ip-item';

    const left = document.createElement('div');
    left.className = 'status-name';
    left.innerHTML = '<strong>' + e.name + '</strong><div style="font-size:0.85rem;color:var(--muted)">' + e.ip + '</div>';

    const right = document.createElement('div');
    right.style.display = 'flex';
    right.style.alignItems = 'center';
    right.style.gap = '8px';

    const badge = document.createElement('div');
    badge.className = 'status-badge unknown';
    badge.textContent = 'Unbekannt';

    const btn = document.createElement('button');
    btn.className = 'status-btn unknown';
    btn.textContent = 'Test';
    btn.addEventListener('click', ()=> runTest(e, badge));

    right.appendChild(badge);
    right.appendChild(btn);

    el.appendChild(left);
    el.appendChild(right);
    return {el,badge};
  }

  function setBadge(badge, state){
    badge.className = 'status-badge ' + (state === 'online' ? 'online' : state === 'cors' ? 'degraded' : state === 'offline' ? 'down' : 'unknown');
    badge.textContent = state === 'online' ? 'Online' : state === 'cors' ? 'Erreichbar (CORS)' : state === 'offline' ? 'Nicht erreichbar' : 'Unbekannt';
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

  async function tryImage(url, timeoutMs=3000){
    return new Promise((resolve)=>{
      let done=false;
      const img = new Image();
      const t = setTimeout(()=>{ if(!done){ done=true; resolve(false); } }, timeoutMs);
      img.onload = ()=>{ if(!done){ done=true; clearTimeout(t); resolve(true); } };
      img.onerror = ()=>{ if(!done){ done=true; clearTimeout(t); resolve(false); } };
      try{ img.src = url + '?_=' + Date.now(); }catch(e){ clearTimeout(t); resolve(false); }
    });
  }

  async function runTest(entry, badge){
    setBadge(badge,'unknown');
    // Try HTTPS fetch (may fail due to certs), then HTTPS image, then HTTP image
    const httpsUrl = 'https://' + entry.ip + '/';
    const httpUrl = 'http://' + entry.ip + '/';

    // 1) try fetch https
    const f1 = await tryFetch(httpsUrl, 3000);
    if(f1.ok) { setBadge(badge,'online'); return; }

    // 2) try image https
    const imgHttps = await tryImage('https://' + entry.ip + '/favicon.ico', 3000);
    if(imgHttps){ setBadge(badge,'online'); return; }

    // 3) try image http (may be blocked on https pages as mixed content)
    const imgHttp = await tryImage('http://' + entry.ip + '/favicon.ico', 2500);
    if(imgHttp){ setBadge(badge,'cors'); return; }

    // 4) try fetch http (likely blocked by browser mixed content) — best-effort
    const f2 = await tryFetch(httpUrl, 2500);
    if(f2.ok) { setBadge(badge,'cors'); return; }

    setBadge(badge,'offline');
  }

  // render list
  container.innerHTML = '';
  const nodes = ENTRIES.map(e=>{ const r = renderEntry(e); container.appendChild(r.el); return {entry:e,badge:r.badge}; });

  async function runAll(){
    for(const n of nodes){ await runTest(n.entry,n.badge); }
  }

  document.getElementById('ip-refresh').addEventListener('click', runAll);
  // run once on load
  runAll();

})();
