// Faux scrollbar: always-visible visual scrollbar that mirrors page scroll
(function(){
  const container = document.createElement('div');
  container.className = 'faux-scrollbar';
  container.innerHTML = '<div class="track"><div class="thumb"></div></div>';
  document.body.appendChild(container);

  const track = container.querySelector('.track');
  const thumb = container.querySelector('.thumb');

  function update(){
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop || 0;
    const viewH = window.innerHeight || doc.clientHeight;
    const docH = Math.max(doc.scrollHeight, doc.offsetHeight);

    if(docH <= viewH){
      container.classList.add('hidden');
      return;
    } else {
      container.classList.remove('hidden');
    }

    const trackH = track.clientHeight;
    const thumbH = Math.max(Math.round((viewH / docH) * trackH), 20);
    const maxTop = trackH - thumbH;
    const top = Math.round((scrollTop / (docH - viewH)) * maxTop);

    thumb.style.height = thumbH + 'px';
    thumb.style.top = top + 'px';
  }

  let raf = null;
  function schedule(){
    if(raf) return;
    raf = requestAnimationFrame(()=>{ raf = null; update(); });
  }

  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule);
  document.addEventListener('DOMContentLoaded', schedule);
  // initial
  schedule();
})();
