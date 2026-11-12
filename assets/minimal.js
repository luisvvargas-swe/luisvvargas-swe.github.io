'use strict';
const scene = document.querySelector('.scene');
const composition = document.querySelector('.composition');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const reducedTransparency = matchMedia('(prefers-reduced-transparency: reduce)');
const hoverPointer = matchMedia('(hover: hover) and (pointer: fine)');
const disclosures = [...document.querySelectorAll('details')];
const animations = new Map();
const desired = new Map();
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
function updateMaterial() {
  composition.classList.toggle('is-expanded', disclosures.some(item => item.open));
}
function setExpanded(item, expanded) {
  const summary = item.querySelector(':scope > summary');
  const content = item.querySelector(':scope > .detail-content');
  const from = item.getBoundingClientRect().height;
  animations.get(item)?.cancel();
  desired.set(item, expanded);
  item.style.height = '';
  item.open = true;
  content.inert = !expanded;
  const to = expanded ? item.getBoundingClientRect().height : summary.offsetHeight + parseFloat(getComputedStyle(item).paddingTop) + parseFloat(getComputedStyle(item).borderTopWidth);
  const finish = () => {
    item.open = expanded;
    item.style.height = '';
    item.style.overflow = '';
    animations.delete(item);
    updateMaterial();
  };
  updateMaterial();
  if (reducedMotion.matches || !item.animate) { finish(); return; }
  item.style.overflow = 'hidden';
  const animation = item.animate([{height:`${from}px`},{height:`${to}px`}], {
    duration:420,easing:'cubic-bezier(.22,.8,.2,1)',fill:'both'
  });
  animations.set(item, animation);
  animation.onfinish = () => { finish(); animation.cancel(); };
}
for (const item of disclosures) {
  const summary = item.querySelector(':scope > summary');
  summary.addEventListener('click', event => {
    event.preventDefault();
    setExpanded(item, !(desired.has(item) ? desired.get(item) : item.open));
  });
  summary.addEventListener('keydown', event => {
    const siblings = [...item.parentElement.children].filter(element => element.tagName === 'DETAILS');
    const index = siblings.indexOf(item);
    let target;
    if (event.key === 'ArrowDown') target = siblings[Math.min(index + 1, siblings.length - 1)];
    if (event.key === 'ArrowUp') target = siblings[Math.max(index - 1, 0)];
    if (event.key === 'Home') target = siblings[0];
    if (event.key === 'End') target = siblings.at(-1);
    if (target) { event.preventDefault(); event.stopPropagation(); target.querySelector('summary').focus({preventScroll:true}); }
  });
}
scene.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const item = event.target.closest('details[open]');
  if (item) { event.preventDefault(); item.querySelector('summary').focus({preventScroll:true}); setExpanded(item, false); }
});
// A finite spring returns short compositions to the center; long content scrolls normally.
let position = 0, velocity = 0, frame = 0, previousTime = 0;
function fits() {
  const space = getComputedStyle(composition.parentElement);
  return composition.offsetHeight + parseFloat(space.paddingTop) + parseFloat(space.paddingBottom) <= scene.clientHeight + 2;
}
function paint() { composition.style.setProperty('--spring-y',`${position.toFixed(2)}px`); }
function tick(now) {
  const step = clamp((now-previousTime)/16.67,.25,2); previousTime=now;
  velocity = (velocity-position*.11*step)*Math.pow(.68,step);
  position = clamp(position+velocity*step,-48,48); paint();
  if (Math.abs(position)>.12 || Math.abs(velocity)>.12) frame=requestAnimationFrame(tick);
  else {position=velocity=frame=0;paint();}
}
scene.addEventListener('wheel',event=>{
  if (!fits() || event.ctrlKey || Math.abs(event.deltaX)>Math.abs(event.deltaY) || reducedMotion.matches) return;
  event.preventDefault();
  const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?scene.clientHeight:1);
  position=clamp(position-clamp(delta,-120,120)*.25,-38,38);velocity=0;paint();
  if(!frame){previousTime=performance.now();frame=requestAnimationFrame(tick);}
},{passive:false});
reducedMotion.addEventListener('change',()=>{
  cancelAnimationFrame(frame);position=velocity=frame=0;paint();
  for(const [item,animation] of [...animations]) {animation.cancel();setExpanded(item,desired.get(item));}
});
// Edge-normal displacement map: rounded lens edges, neutral center, no distortion on text.
const mapImage = document.getElementById('glass-map');
const lensCanvas = document.createElement('canvas');
const lensContext = lensCanvas.getContext('2d');
let previousMapSize='', lensFrame=0;
function updateLens() {
  lensFrame=0;
  if (!lensContext || reducedTransparency.matches) return;
  const box=composition.getBoundingClientRect();
  const width=Math.ceil(box.width/2),height=Math.ceil(box.height/2);
  const key=`${width}:${height}`;
  if(key===previousMapSize)return;
  previousMapSize=key;lensCanvas.width=width;lensCanvas.height=height;
  const pixels=lensContext.createImageData(width,height);
  const radius=parseFloat(getComputedStyle(composition).borderRadius)/2,edge=9;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const px=x-width/2,py=y-height/2;
    const qx=Math.abs(px)-(width/2-radius),qy=Math.abs(py)-(height/2-radius);
    const ox=Math.max(qx,0),oy=Math.max(qy,0),distance=Math.hypot(ox,oy);
    const inside=-(distance+Math.min(Math.max(qx,qy),0)-radius);
    const strength=inside>0&&inside<edge?Math.sin(Math.PI*inside/edge):0;
    const nx=distance?ox/distance*Math.sign(px):qx>qy?Math.sign(px):0;
    const ny=distance?oy/distance*Math.sign(py):qy>=qx?Math.sign(py):0;
    const i=(y*width+x)*4;
    pixels.data[i]=128+nx*strength*105;pixels.data[i+1]=128+ny*strength*105;
    pixels.data[i+2]=128;pixels.data[i+3]=255;
  }
  lensContext.putImageData(pixels,0,0);mapImage.setAttribute('href',lensCanvas.toDataURL());
  composition.classList.add('glass-ready');
}
function scheduleLens(){if(!lensFrame)lensFrame=requestAnimationFrame(updateLens);}
if('ResizeObserver' in window)new ResizeObserver(scheduleLens).observe(composition);
scheduleLens();
let lightFrame=0,lightX=.22,lightY=.1;
function paintLight(){
  lightFrame=0;
  composition.style.setProperty('--light-x',`${lightX*100}%`);
  composition.style.setProperty('--light-y',`${lightY*100}%`);
  composition.style.setProperty('--light-angle',`${90+lightX*110}deg`);
}
composition.addEventListener('pointermove',event=>{
  if(!hoverPointer.matches||reducedMotion.matches)return;
  const box=composition.getBoundingClientRect();
  lightX=clamp((event.clientX-box.left)/box.width,0,1);lightY=clamp((event.clientY-box.top)/box.height,0,1);
  if(!lightFrame)lightFrame=requestAnimationFrame(paintLight);
});
composition.addEventListener('pointerleave',()=>{lightX=.22;lightY=.1;paintLight();composition.classList.remove('is-pressing');});
composition.addEventListener('pointerdown',()=>{if(!reducedMotion.matches)composition.classList.add('is-pressing');});
window.addEventListener('pointerup',()=>composition.classList.remove('is-pressing'));
window.addEventListener('pointercancel',()=>composition.classList.remove('is-pressing'));
window.addEventListener('resize',()=>{position=velocity=0;paint();scheduleLens();});
function openHash(){
  const id=location.hash.slice(1);
  if(!id)return;
  const item=disclosures.find(entry=>entry.id===id);
  if(item)setExpanded(item,true);
}
window.addEventListener('hashchange',openHash);openHash();
