'use strict';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
for (const control of document.querySelectorAll('.glass')) {
  control.addEventListener('pointermove', event => {
    if (reduceMotion.matches || !finePointer.matches) return;
    const box = control.getBoundingClientRect();
    control.style.setProperty('--pointer-x', `${event.clientX - box.left}px`);
    control.style.setProperty('--pointer-y', `${event.clientY - box.top}px`);
  });
  control.addEventListener('pointerleave', () => {
    control.style.removeProperty('--pointer-x');
    control.style.removeProperty('--pointer-y');
  });
}
