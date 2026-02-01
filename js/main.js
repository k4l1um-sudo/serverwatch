// Simple canvas particle map animation — pulsing nodes and faint links
(function(){
  const canvas=document.getElementById('bg');
  const ctx=canvas.getContext('2d');
  let W, H, particles=[];

  function resize(){
    W=canvas.width = window.innerWidth;
    H=canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  function rand(min,max){return Math.random()*(max-min)+min}

  function makeParticles(n){
    particles=[];
    for(let i=0;i<n;i++){
      particles.push({
        x:rand(0,W), y:rand(0,H),
        vx:rand(-0.2,0.2), vy:rand(-0.2,0.2),
        r:rand(1.2,3.5), phase:rand(0,Math.PI*2)
      });
    }
  }

  makeParticles(Math.round((W*H)/90000));

  function draw(){
    ctx.clearRect(0,0,W,H);

    // faint radial vignette
    const g = ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'rgba(4,16,34,0.0)');
    g.addColorStop(1,'rgba(2,6,12,0.25)');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);

    // draw links
    for(let i=0;i<particles.length;i++){
      const a=particles[i];
      for(let j=i+1;j<particles.length;j++){
        const b=particles[j];
        const dx=a.x-b.x, dy=a.y-b.y; const d=dx*dx+dy*dy;
        if(d<15000){
          const alpha=0.00008*(15000-d);
          ctx.strokeStyle='rgba(61,241,255,'+alpha+')';
          ctx.lineWidth=0.6; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }

    // draw particles
    let count=0;
    for(const p of particles){
      p.x+=p.vx; p.y+=p.vy; p.phase+=0.03;
      if(p.x<0||p.x>W) p.vx*=-1; if(p.y<0||p.y>H) p.vy*=-1;
      const pulse = (Math.sin(p.phase)+1)/2;
      const rad = p.r*(1+0.8*pulse);

      const grad = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,rad*6);
      grad.addColorStop(0,'rgba(61,241,255,'+(0.6*pulse)+')');
      grad.addColorStop(0.2,'rgba(61,241,255,'+(0.15*pulse)+')');
      grad.addColorStop(1,'rgba(4,12,18,0)');

      ctx.fillStyle=grad;
      ctx.beginPath(); ctx.arc(p.x,p.y,rad*3,0,Math.PI*2); ctx.fill();

      // bright core
      ctx.fillStyle='rgba(255,255,255,'+(0.6*pulse)+')';
      ctx.beginPath(); ctx.arc(p.x,p.y,rad*0.6,0,Math.PI*2); ctx.fill();
      count++;
    }

    const el=document.getElementById('node-count');
    if(el) el.textContent = count;
    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();
