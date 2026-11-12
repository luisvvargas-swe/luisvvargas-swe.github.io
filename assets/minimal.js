'use strict';
const scene = document.querySelector('.scene');
const composition = document.querySelector('.composition');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const hoverPointer = matchMedia('(hover: hover) and (pointer: fine)');
const disclosures = [...document.querySelectorAll('details')];
const animations = new Map();
const desired = new Map();
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
function setExpanded(item, expanded) {
  const summary = item.querySelector(':scope > summary');
  const content = item.querySelector(':scope > .detail-content');
  const from = item.open ? content.getBoundingClientRect().height : 0;
  const currentStyle = getComputedStyle(content);
  const fromPaddingTop = item.open ? currentStyle.paddingTop : '0px';
  const fromPaddingBottom = item.open ? currentStyle.paddingBottom : '0px';
  animations.get(item)?.cancel();
  desired.set(item, expanded);
  item.open = true;
  content.style.height = '';
  content.inert = !expanded;
  const to = expanded ? content.getBoundingClientRect().height : 0;
  const targetStyle = getComputedStyle(content);
  const toPaddingTop = expanded ? targetStyle.paddingTop : '0px';
  const toPaddingBottom = expanded ? targetStyle.paddingBottom : '0px';
  const finish = () => {
    item.open = expanded;
    content.style.height = '';
    content.style.overflow = '';
    animations.delete(item);
  };
  if (reducedMotion.matches || !content.animate) { finish(); return; }
  content.style.overflow = 'hidden';
  const animation = content.animate([{height:`${from}px`,paddingTop:fromPaddingTop,paddingBottom:fromPaddingBottom,opacity:expanded?.15:1},{height:`${to}px`,paddingTop:toPaddingTop,paddingBottom:toPaddingBottom,opacity:expanded?1:0}], {
    duration:360,easing:'cubic-bezier(.22,.8,.2,1)',fill:'both'
  });
  animations.set(item, animation);
  animation.onfinish = () => { finish(); animation.cancel(); };
}
const deck = document.querySelector('.deck');
const deckItems = [...deck.querySelectorAll('.offerings > .entry, .deck > .experience-group')];
let hoveredItem = null;
let activeItem = null;
let keyboardMode = false;
document.addEventListener('keydown',()=>{keyboardMode=true;},{capture:true});
document.addEventListener('pointerdown',()=>{keyboardMode=false;},{capture:true});
function focusItem() {
  return (keyboardMode || document.activeElement?.matches(':focus-visible')) ? deckItems.find(item => item.contains(document.activeElement)) : null;
}
function highlight(item) {
  activeItem = item || null;
  deck.classList.toggle('has-focus', !!item);
  const activeIndex = deckItems.indexOf(item);
  deckItems.forEach((entry,index) => {
    const distance = index-activeIndex;
    const label = entry.querySelector(':scope > summary > .label');
    entry.classList.toggle('is-front',entry===item);
    // Labels move in depth; the summary hit areas remain stationary.
    const depth = Math.min(Math.abs(distance),3);
    entry.style.setProperty('--retreat-x',`${16+depth*10}px`);
    entry.style.setProperty('--retreat-y',`${Math.sign(distance)*(14+depth*4)}px`);
    entry.style.setProperty('--retreat-z',`${-65-depth*30}px`);
    entry.style.setProperty('--retreat-angle',`${-Math.sign(distance)*(16+depth*4)}deg`);
    entry.style.setProperty('--retreat-blur',`${.45+depth*.18}px`);
    if(entry===item && label) {
      const summary=entry.querySelector('summary');
      // Account for perspective magnification and preserve room for the indicator.
      const scale=Math.min(2.05,(summary.clientWidth-40)/label.offsetWidth*.91);
      entry.style.setProperty('--front-scale',Math.max(1,scale).toFixed(3));
    }
  });
}
for(const item of deckItems){
  item.querySelector('summary').addEventListener('pointerenter',()=>{
    if(!hoverPointer.matches)return;
    hoveredItem=item;if(!keyboardMode)highlight(item);
  });
}
deck.addEventListener('pointermove',event=>{
  if(!hoverPointer.matches || (!event.movementX && !event.movementY))return;
  keyboardMode=false;
  if(hoveredItem && hoveredItem!==activeItem)highlight(hoveredItem);
});
deck.addEventListener('pointerleave',()=>{hoveredItem=null;highlight(focusItem());});
deck.addEventListener('focusin',()=>highlight(focusItem() || hoveredItem));
deck.addEventListener('focusout',()=>setTimeout(()=>highlight(focusItem() || hoveredItem),0));
window.addEventListener('resize',()=>{position=velocity=0;paint();if(activeItem)highlight(activeItem);});
if(document.fonts)document.fonts.ready.then(()=>{if(activeItem)highlight(activeItem);});

for (const item of disclosures) {
  const summary = item.querySelector(':scope > summary');
  summary.addEventListener('click', event => {
    event.preventDefault();
    setExpanded(item, !(desired.has(item) ? desired.get(item) : item.open));
  });
  summary.addEventListener('keydown', event => {
    const siblings = deckItems.includes(item) ? deckItems : [...item.parentElement.children].filter(element => element.tagName === 'DETAILS');
    const index = siblings.indexOf(item);
    let target;
    if (event.key === 'ArrowDown') target = siblings[Math.min(index + 1, siblings.length - 1)];
    if (event.key === 'ArrowUp') target = siblings[Math.max(index - 1, 0)];
    if (event.key === 'Home') target = siblings[0];
    if (event.key === 'End') target = siblings.at(-1);
    if (target) {
      event.preventDefault(); event.stopPropagation();
      const next = target.querySelector('summary');
      next.focus({preventScroll:true});
      const rect = next.getBoundingClientRect();
      const viewport = scene.getBoundingClientRect();
      if(rect.top < viewport.top || rect.bottom > viewport.bottom) next.scrollIntoView({block:'nearest',behavior:'instant'});
    }
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
function openHash(){
  const id=location.hash.slice(1);
  if(!id)return;
  const item=disclosures.find(entry=>entry.id===id);
  if(item)setExpanded(item,true);
}
window.addEventListener('hashchange',openHash);openHash();
