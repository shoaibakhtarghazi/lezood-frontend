import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap.js';
import { reduced } from '../lib/env.js';
import { Lbl, LogoMark } from './ui.jsx';

const LINKS = [['#services', 'Services'], ['#work', 'Work'], ['#process', 'Process'], ['#faq', 'FAQ']];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const navRef = useRef(null), menuRef = useRef(null), btnRef = useRef(null), openRef = useRef(false);
  openRef.current = open;

  // Nav hides on scroll down, returns on scroll up
//   useEffect(() => {
//     let lastY = 0;
//     const onScroll = () => {
//       const y = window.scrollY, nav = navRef.current;
//       if (!openRef.current) nav.classList.toggle('is-hidden', y > 400 && y > lastY + 2);
//       if (y < lastY - 2) nav.classList.remove('is-hidden');
//       lastY = y;
//     };
//     addEventListener('scroll', onScroll, { passive: true });
//     return () => removeEventListener('scroll', onScroll);
//   }, []);

  // Mobile menu: Escape + click outside close it
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && openRef.current) { setOpen(false); btnRef.current.focus(); } };
    const onDoc = (e) => { if (openRef.current && !navRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onDoc);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('click', onDoc); };
  }, []);

  // Menu links rise in when it opens
  useEffect(() => {
    if (!open || reduced) return;
    const tw = gsap.fromTo(menuRef.current.querySelectorAll('a'), { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.04, ease: 'expo.out' });
    return () => tw.kill();
  }, [open]);

  // Scrollspy: highlight the nav link for the section in view
  useGSAP(() => {
    navRef.current.querySelectorAll('.nav__links a').forEach((a) => {
      const sec = document.querySelector(a.getAttribute('href'));
      if (sec) ScrollTrigger.create({ trigger: sec, start: 'top 45%', end: 'bottom 45%', onToggle: (s) => a.classList.toggle('is-active', s.isActive) });
    });
  }, { scope: navRef });

  const close = () => setOpen(false);

  return (
    <header className="nav" id="nav" ref={navRef}>
      <div className="nav__pill">
        <a href="#top" className="logo" aria-label="Lezood home"><LogoMark />lezood</a>
        <nav className="nav__links" aria-label="Primary">
          {LINKS.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
        </nav>
        <a href="#contact" className="btn btn--accent btn--sm nav__cta"><Lbl>Book a call</Lbl></a>
        <button ref={btnRef} className="nav__menu" aria-expanded={open} aria-controls="menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
          <span className="nav__burger" aria-hidden="true"><i /><i /></span>
        </button>
      </div>
      <div className="menu" id="menu" hidden={!open} ref={menuRef}>
        <nav aria-label="Mobile">
          {LINKS.map(([href, label]) => <a key={href} href={href} onClick={close}>{label}</a>)}
          <a href="#contact" className="btn btn--accent btn--block" onClick={close}><Lbl>Book a discovery call</Lbl></a>
        </nav>
      </div>
    </header>
  );
}