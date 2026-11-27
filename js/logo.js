'use strict';
// Outlined circle expands through U/G/C and rejoins into a circle each cycle.
(() => {
  const header = document.querySelector('.site-header');
  document.querySelectorAll('.island-logo').forEach(logo => {
  const staticLogo=logo.classList.contains('footer-logo')||logo.classList.contains('phone-menu-static');
  const group = logo.querySelector('[data-logo="assembly"]');
  const support = logo.querySelector('[data-logo="supporting-strokes"]');
  const rays = [...support.querySelectorAll('path:not([data-logo])')];
  const lower = logo.querySelector('[data-logo="lower"]');
  const upper = logo.querySelector('[data-logo="upper"]');
  const bar = logo.querySelector('[data-logo="bar"]');
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx','328'); circle.setAttribute('cy','324');
  circle.setAttribute('vector-effect','non-scaling-stroke');
  logo.querySelectorAll('path').forEach(path=>path.setAttribute('vector-effect','non-scaling-stroke'));
  support.setAttribute('stroke-width','1.1');
  circle.setAttribute('fill','none'); circle.setAttribute('stroke','var(--logo-base)');
  group.append(circle);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const smooth = t => t*t*t*(t*(t*6-15)+10);
  const state = values => ({angle:0,lower:4,upper:4,bar:4,assembly:1,circle:false,radius:64,fill:0,...values});
  const frames = [];
  let duration = 0;
  function add(value, seconds=.02) {duration += seconds; frames.push({value,end:duration});}
  const rest = state({circle:true}); add(rest,.50);
  for(let i=1;i<=45;i++) {const t=i/45;add(state({assembly:smooth(t),lower:4+6*smooth(Math.min(1,t/.8))}));}
  const u=state({lower:10}), g=state({angle:-90,upper:10,bar:10}), c=state({angle:-270,lower:10});
  add(u,.70);
  for(const [from,to,count] of [[u,g,38],[g,c,55]]) {
    for(let i=1;i<=count;i++) {
      const t=smooth(i/count);const value=state();
      for(const key of ['angle','lower','upper','bar']) value[key]=from[key]+(to[key]-from[key])*t;
      add(value);
    }
    add(to,.85);
  }
  for(let i=1;i<=45;i++) {
    const t=i/45,e=smooth(t);
    add(state({angle:-270-90*e,assembly:1-e,lower:4+6*smooth(Math.min(1,(1-t)/.8))}));
  }
  add(rest,.50);
  function stroke(path,weight) {
    path.setAttribute('stroke-width',1.1+(weight-4)*.2);
    const emphasis=(weight-4)/6*100;
    path.style.stroke=`color-mix(in srgb, var(--logo-base) ${100-emphasis}%, var(--logo-accent) ${emphasis}%)`;
  }
  function draw(s) {
    group.setAttribute('transform',`translate(300 300) rotate(${s.angle}) translate(-328 -324)`);
    circle.style.display=s.circle?'':'none';
    support.style.display=s.circle?'none':'';
    lower.parentElement.style.display=s.circle?'none':'';
    if(s.circle) {
      circle.setAttribute('fill','none');
      circle.setAttribute('r','62');
      circle.setAttribute('stroke-width','1.1');return;
    }
    const a=s.assembly, lc=328-31*a, uc=328+31*a, k=34.241655;
    lower.setAttribute('d',`M${lc-62} 324 C${lc-62} ${324+k} ${lc-k} 386 ${lc} 386 C${lc+k} 386 ${lc+62} ${324+k} ${lc+62} 324`);
    upper.setAttribute('d',`M${uc-62} 324 C${uc-62} ${324-k} ${uc-k} 262 ${uc} 262 C${uc+k} 262 ${uc+62} ${324-k} ${uc+62} 324`);
    bar.setAttribute('d',`M${uc-62} 324 h${31*a}`);bar.style.opacity=a>.001?'1':'0';
    rays.forEach((ray,i)=>{
      const theta=i*Math.PI/8, length=i%2===0?143:100;
      const inner=62+54*a, outer=62+(54+length)*a;
      ray.setAttribute('d',`M${328+inner*Math.cos(theta)} ${324-inner*Math.sin(theta)} L${328+outer*Math.cos(theta)} ${324-outer*Math.sin(theta)}`);
      ray.style.opacity=a>.001?'1':'0';
    });
    stroke(lower,s.lower);stroke(upper,s.upper);stroke(bar,s.bar);
  }
  let frame=0,start=0,elapsed=0,last=-1;
  function tick(now) {
    const played=elapsed+(now-start)/1000;
    const time=played%duration;
    const index=frames.findIndex(f=>time<f.end);
    if(index!==last) {draw(frames[index].value);last=index;}
    frame=requestAnimationFrame(tick);
  }
  function sync() {
    const rect=logo.getBoundingClientRect();
    const visible=rect.width>0 && rect.height>0 && rect.bottom>0 && rect.top<innerHeight && !document.hidden;
    if(visible&&!reduced.matches&&!staticLogo) {
      if(!frame) {start=performance.now();last=-1;frame=requestAnimationFrame(tick);}
    } else {
      if(frame) elapsed+=(performance.now()-start)/1000;
      cancelAnimationFrame(frame);frame=0;draw(staticLogo?state():u);
    }
  }
  new MutationObserver(sync).observe(header,{attributes:true,attributeFilter:['class']});
  new IntersectionObserver(sync).observe(logo);
  window.addEventListener('resize',sync);
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
  sync();
  });
})();
