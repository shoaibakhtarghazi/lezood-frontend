import { fine } from '../lib/env.js';

// Small shared pieces.

// Button label that "rolls" on hover (the CSS duplicates the text via data-t).
export const Lbl = ({ children }) => (
  <span className="lbl"><i data-t={children}>{children}</i></span>
);

export const ArrowIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

export const LogoMark = () => (
  <span className="logo__mark" aria-hidden="true"><i /><i /><i /></span>
);

export const Check = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);

export const Cross = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17" /></svg>
);

// Spotlight border follows the pointer ([data-spot] cards)
export const spot = (e) => {
  if (!fine) return;
  const el = e.currentTarget, r = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - r.left}px`);
  el.style.setProperty('--my', `${e.clientY - r.top}px`);
};