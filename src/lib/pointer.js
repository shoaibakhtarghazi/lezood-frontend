// Pointer niceties (fine pointers only): the "Visit ↗" cursor chip over project screenshots,
// and the magnetic hero button. Returns a cleanup function.
import { gsap } from './gsap.js';
import { fine, reduced } from './env.js';

export function pointerEffects(lenis) {
  if (!fine || reduced) return () => {};
  const off = [];
  const on = (target, type, fn, opts) => { target.addEventListener(type, fn, opts); off.push(() => target.removeEventListener(type, fn, opts)); };

  const chip = document.querySelector('.cursor-chip');
  gsap.set(chip, { xPercent: -50, yPercent: -50 });
  let chipOn = false;
  const hideChip = () => { if (chipOn) { chipOn = false; gsap.to(chip, { scale: 0, opacity: 0, duration: 0.2, ease: 'power2.in' }); } };

  // Content moves under a still pointer while scrolling, which fires no pointerleave:
  // re-check what is actually under the pointer instead of trusting enter/leave.
  let lx = -1, ly = -1, pending = false;
  on(window, 'pointermove', (e) => { lx = e.clientX; ly = e.clientY; }, { passive: true });
  const recheck = () => {
    if (pending) return; pending = true;
    requestAnimationFrame(() => {
      pending = false;
      const el = lx < 0 ? null : document.elementFromPoint(lx, ly);
      if (!el || !el.closest('[data-cursor]')) hideChip();
    });
  };
  on(window, 'scroll', recheck, { passive: true });
  on(document, 'pointerleave', hideChip);
  const xTo = gsap.quickTo(chip, 'x', { duration: 0.4, ease: 'power3' }), yTo = gsap.quickTo(chip, 'y', { duration: 0.4, ease: 'power3' });
  on(window, 'pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); }, { passive: true });
  document.querySelectorAll('[data-cursor]').forEach((el) => {
    on(el, 'pointerenter', () => { chipOn = true; gsap.to(chip, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' }); });
    on(el, 'pointerleave', hideChip);
  });

  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    let x, y;
    on(el, 'pointermove', (e) => {
      if (!x) { x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' }); y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' }); }
      const r = el.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * 0.2); y((e.clientY - r.top - r.height / 2) * 0.3);
    });
    on(el, 'pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, .4)' }));
  });

  return () => { off.forEach((fn) => fn()); gsap.killTweensOf(chip); };
}