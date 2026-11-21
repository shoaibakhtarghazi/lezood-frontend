import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, useGSAP } from './lib/gsap.js';
import { reduced } from './lib/env.js';
import { setLenis } from './lib/scroll.js';
import { pointerEffects } from './lib/pointer.js';
import { createNetwork } from './three/network.js';
import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import Services from './components/Services.jsx';
import Work from './components/Work.jsx';
import Process from './components/Process.jsx';
import Why from './components/Why.jsx';
import Voices from './components/Voices.jsx';
import Faq from './components/Faq.jsx';
import Contact from './components/Contact.jsx';
import Footer, { Partner } from './components/Footer.jsx';

export default function App() {
  const [service, setService] = useState('AI development');
  const bgRef = useRef(null), progressRef = useRef(null);

  // Ambient neural background
  useEffect(() => {
    const bg = createNetwork(bgRef.current);
    return () => bg && bg.dispose();
  }, []);

  // Page-wide behaviour. Runs after every section has mounted, so it can see all their elements.
  useGSAP(() => {
    /* Smooth scroll (Lenis) driven by GSAP's ticker */
    let lenis = null, tick = null;
    if (!reduced) {
      lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
      setLenis(lenis);
      lenis.on('scroll', ScrollTrigger.update);
      tick = (t) => lenis.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    /* Anchor links: smooth, offset for the floating nav, focus moved for keyboard users */
    const onAnchor = (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href'), target = id === '#top' ? document.body : document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: id === '#top' ? 0 : -24, duration: 1.3 });
      else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
      const f = id === '#top' ? document.getElementById('hero-title') : target;
      f.setAttribute('tabindex', '-1'); f.focus({ preventScroll: true });
    };
    document.addEventListener('click', onAnchor);

    /* Reading progress bar */
    gsap.to(progressRef.current, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

    /* Section reveals (fade + rise, once). Transforms are cleared afterwards so CSS hover lifts still work. */
    let failsafe;
    if (!reduced) {
      const els = gsap.utils.toArray(document.querySelectorAll('[data-reveal]'));
      gsap.set(els, { y: 28, opacity: 0 });
      ScrollTrigger.batch(els, {
        start: 'top 90%', once: true,
        onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: 'expo.out', clearProps: 'transform' }),
      });
      // failsafe: nothing may stay hidden
      failsafe = setTimeout(() => els.forEach((el) => {
        if (el.getBoundingClientRect().top < innerHeight && +getComputedStyle(el).opacity < 0.05) gsap.to(el, { y: 0, opacity: 1, duration: 0.6, clearProps: 'transform' });
      }), 2500);
    }

    const stopPointer = pointerEffects(lenis);

    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
    addEventListener('load', refresh);

    return () => {
      clearTimeout(failsafe);
      removeEventListener('load', refresh);
      document.removeEventListener('click', onAnchor);
      stopPointer();
      if (lenis) { gsap.ticker.remove(tick); lenis.destroy(); setLenis(null); }
    };
  }, []);

  return (
    <>
      <canvas className="bgfx" aria-hidden="true" ref={bgRef} />
      <a className="skip" href="#main">Skip to content</a>
      <div className="progress" aria-hidden="true"><span ref={progressRef} /></div>

      <Nav />
      <main id="main">
        <Hero />
        <Services onService={setService} />
        <Work />
        <Process />
        <Why />
        <Voices />
        <Faq />
        <Contact service={service} setService={setService} />
        <Partner />
      </main>
      <Footer />

      <div className="cursor-chip" aria-hidden="true">Visit ↗</div>
    </>
  );
}