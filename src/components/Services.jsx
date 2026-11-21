import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap.js';
import { reduced } from '../lib/env.js';
import { ChatMock, PipeMock, ScoresMock, TableMock } from './Mocks.jsx';
import { spot } from './ui.jsx';

const Icon = ({ children }) => (
  <span className="card__icon" aria-hidden="true"><svg viewBox="0 0 24 24">{children}</svg></span>
);

export default function Services({ onService }) {
  const rootRef = useRef(null);

  // Bento cards rise in sequence; transforms are cleared afterwards so hover lifts stay crisp
  useGSAP(() => {
    if (reduced) return;
    const cards = gsap.utils.toArray('.bento .card');
    gsap.set(cards, { y: 48, opacity: 0 });
    ScrollTrigger.batch(cards, {
      start: 'top 90%', once: true,
      onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'expo.out', clearProps: 'transform' }),
    });
    const t = setTimeout(() => cards.forEach((el) => {
      if (el.getBoundingClientRect().top < innerHeight && +getComputedStyle(el).opacity < 0.05) gsap.to(el, { y: 0, opacity: 1, duration: 0.6, clearProps: 'transform' });
    }), 2500);
    return () => clearTimeout(t);
  }, { scope: rootRef });

  const cta = (service, label) => (
    <a className="card__cta" href="#contact" onClick={() => onService(service)}>{label} <span aria-hidden="true">→</span></a>
  );

  return (
    <section className="sec" id="services" aria-labelledby="services-title" ref={rootRef}>
      <div className="wrap">
        <header className="sec__head" data-reveal>
          <p className="eyebrow mono">Services</p>
          <h2 id="services-title" className="h2">Four ways we put software <em>to work</em>.</h2>
          <p className="sec__sub">Pick the one closest to your problem. Not sure? That's what the discovery call is for.</p>
        </header>

        <div className="bento">
          {/* 01 AI */}
          <article className="card card--ai" data-spot onPointerMove={spot}>
            <div className="card__text">
              <p className="card__kicker mono">
                <Icon><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></Icon>
                01 · AI development
              </p>
              <h3>Agents that read, decide and act.</h3>
              <p>AI agents and automations wired into your CRM, inbox, docs and databases — so repetitive work runs itself and your team handles the exceptions.</p>
              <ul className="card__tags"><li>AI agents</li><li>RAG on your data</li><li>Automation</li></ul>
              {cta('AI development', 'Discuss an AI project')}
            </div>
            <div className="card__visual" aria-hidden="true"><ChatMock /></div>
          </article>

          {/* 02 Custom software */}
          <article className="card card--sw" data-spot onPointerMove={spot}>
            <div className="card__visual" aria-hidden="true"><TableMock /></div>
            <div className="card__text">
              <p className="card__kicker mono">
                <Icon><rect x="3" y="4" width="18" height="16" rx="2.5" /><path d="M3 9h18M9 9v11" /></Icon>
                02 · Custom software
              </p>
              <h3>Internal tools your team wants to use.</h3>
              <p>Dashboards and portals that replace spreadsheets and copy-paste.</p>
              {cta('Custom software', 'Discuss a tool')}
            </div>
          </article>

          {/* 03 Product engineering */}
          <article className="card card--pe" data-spot onPointerMove={spot}>
            <div className="card__visual" aria-hidden="true"><PipeMock /></div>
            <div className="card__text">
              <p className="card__kicker mono">
                <Icon><path d="M12 3l9 5-9 5-9-5z" /><path d="M3 13l9 5 9-5" /><path d="M3 17.5l9 5 9-5" opacity=".5" /></Icon>
                03 · Product engineering
              </p>
              <h3>SaaS from first spec to scale.</h3>
              <p>Architecture, build, launch and the cloud infrastructure behind it.</p>
              {cta('Product engineering', 'Discuss a product')}
            </div>
          </article>

          {/* 04 Web apps */}
          <article className="card card--web" data-spot onPointerMove={spot}>
            <div className="card__visual" aria-hidden="true"><ScoresMock /></div>
            <div className="card__text">
              <p className="card__kicker mono">
                <Icon><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" /></Icon>
                04 · Web apps
              </p>
              <h3>Fast, accessible, headless.</h3>
              <p>Web apps and storefronts on Next.js, React and the commerce stack that fits.</p>
              {cta('Web app', 'Discuss a web app')}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}