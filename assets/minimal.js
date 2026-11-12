'use strict';
const scene = document.querySelector('.scene');
const composition = document.querySelector('.composition');
const items = [...document.querySelectorAll('.item')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let pinned = items.find(item => item.open) || null;
let position = 0;
let velocity = 0;
let frame = 0;
let previousTime = 0;
let dragging = false;
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
function fits() {
  const space = getComputedStyle(composition.parentElement);
  return composition.offsetHeight + parseFloat(space.paddingTop) + parseFloat(space.paddingBottom) <= scene.clientHeight + 2;
}
function paint() { composition.style.setProperty('--spring-y', `${position.toFixed(2)}px`); }
function tick(now) {
  const steps = clamp((now - previousTime) / 16.67, .25, 2);
  previousTime = now;
  if (reducedMotion.matches) { position = velocity = 0; paint(); frame = 0; return; }
  if (!dragging) {
    velocity += -position * .11 * steps;
    velocity *= Math.pow(.68, steps);
    position = clamp(position + velocity * steps, -64, 64);
  }
  paint();
  if (dragging || Math.abs(position) > .12 || Math.abs(velocity) > .12) frame = requestAnimationFrame(tick);
  else { position = velocity = 0; paint(); frame = 0; }
}
function animate() { if (!frame) { previousTime = performance.now(); frame = requestAnimationFrame(tick); } }
function bounce(delta) {
  if (reducedMotion.matches) return;
  position = clamp(position + delta, -48, 48);
  velocity = 0;
  paint(); animate();
}
function changeLayout(update) {
  const oldTop = composition.getBoundingClientRect().top;
  const oldPosition = position;
  update();
  const newTop = composition.getBoundingClientRect().top;
  if (fits() && !reducedMotion.matches) {
    position = clamp(oldPosition + oldTop - newTop, -48, 48);
    velocity = 0; paint(); animate();
  } else { position = velocity = 0; paint(); }
}
function activate(item) {
  if (item.open && items.every(other => other === item || !other.open)) return;
  changeLayout(() => { for (const other of items) other.open = other === item; });
}
function close(item) {
  if (!item.open) return;
  changeLayout(() => { item.open = false; });
}
function focusSummary(item) {
  item.querySelector('summary').focus({preventScroll:true});
}
for (const item of items) {
  const summary = item.querySelector('summary');
  summary.addEventListener('click', event => {
    event.preventDefault();
    if (pinned === item && item.open) { pinned = null; close(item); }
    else { pinned = item; activate(item); }
  });
  summary.addEventListener('keydown', event => {
    const index = items.indexOf(item);
    let destination;
    if (event.key === 'ArrowDown') destination = items[Math.min(index + 1, items.length - 1)];
    if (event.key === 'ArrowUp') destination = items[Math.max(index - 1, 0)];
    if (event.key === 'Home') destination = items[0];
    if (event.key === 'End') destination = items[items.length - 1];
    if (destination) { event.preventDefault(); destination.querySelector('summary').focus({preventScroll:true}); }
  });
}
scene.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    const active = items.find(item => item.open);
    if (active) { event.preventDefault(); pinned = null; focusSummary(active); close(active); }
  }
  if (fits() && (event.key === 'PageDown' || event.key === 'PageUp')) {
    event.preventDefault(); bounce(event.key === 'PageDown' ? -32 : 32);
  }
});
scene.addEventListener('wheel', event => {
  if (!fits() || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
  event.preventDefault();
  const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? scene.clientHeight : 1);
  bounce(-clamp(delta, -120, 120) * .3);
}, {passive:false});
let touchY = null;
scene.addEventListener('touchstart', event => {
  if (event.touches.length === 1 && fits()) touchY = event.touches[0].clientY;
}, {passive:true});
scene.addEventListener('touchmove', event => {
  if (touchY === null || event.touches.length !== 1 || !fits() || reducedMotion.matches) return;
  const delta = event.touches[0].clientY - touchY;
  if (Math.abs(delta) < 6) return;
  event.preventDefault(); dragging = true; position = clamp(delta * .23, -48, 48); velocity = 0; paint(); animate();
}, {passive:false});
function release() { touchY = null; dragging = false; if (Math.abs(position) > .1) animate(); }
scene.addEventListener('touchend', release, {passive:true});
scene.addEventListener('touchcancel', release, {passive:true});
window.addEventListener('resize', () => { position = velocity = 0; release(); paint(); });
reducedMotion.addEventListener('change', () => { position = velocity = 0; dragging = false; paint(); });
function openHash() {
  const item = items.find(entry => `#${entry.id}` === location.hash);
  if (item) { pinned = item; activate(item); if (fits()) scene.scrollTop = 0; }
}
for (const link of document.querySelectorAll('a[href="#contacto"]')) {
  link.addEventListener('click', event => {
    event.preventDefault(); const contact = document.getElementById('contacto');
    pinned = contact; focusSummary(contact); activate(contact);
    history.replaceState(null, '', '#contacto');
    if (fits()) scene.scrollTop = 0;
    else contact.scrollIntoView({block:'center',behavior:reducedMotion.matches?'instant':'smooth'});
  });
}
window.addEventListener('hashchange', openHash);
openHash();
