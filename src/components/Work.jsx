import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap.js';
import img1 from '../assets/work-1.jpg';
import img2 from '../assets/work-2.jpg';
import img3 from '../assets/work-3.jpg';

const CASES = [
  { brand: '110, 140, 255', domain: 'governata.com', chips: ['React', 'TypeScript', 'Tailwind'], letter: 'G', name: 'Governata', meta: 'Data governance · Saudi Arabia', img: img1,
    lede: 'Data governance software that keeps definitions, compliance and ownership in one place.',
    facts: [['Role', 'Front-end lead'], ['Scope', 'Architecture, UI system, user flows'], ['Market', 'Enterprise · AR & EN']] },
  { brand: '214, 170, 92', domain: 'akru.com', chips: ['Node.js', 'MongoDB', 'Payments'], letter: 'A', name: 'AKRU', meta: 'Real estate investing · Fintech', img: img2,
    lede: 'Opening commercial real estate investing to everyday investors and owners.',
    facts: [['Role', 'Back-end lead'], ['Scope', 'Node.js architecture, APIs, secure transactions'], ['Market', 'Fintech · real estate']] },
  { brand: '244, 167, 232', domain: 'hugabu.com', chips: ['Next.js', 'Shopify', 'Headless'], letter: 'H', name: 'Hugabu', meta: 'E-commerce · Made to order', img: img3,
    lede: 'Custom plush pillows from a photo — upload, instant preview, order.',
    facts: [['Role', 'Full build'], ['Scope', 'Headless storefront, upload & preview, checkout'], ['Market', 'Consumer e-commerce']] },
];

export default function Work() {
  const rootRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
      const cases = gsap.utils.toArray('.case');
      // each case card shrinks and dims as the next one stacks over it
      cases.forEach((c, i) => {
        const next = cases[i + 1];
        if (!next) return;
        gsap.to(c, { scale: 0.94, ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 104px', scrub: true } });
        gsap.to(c.children, { opacity: 0.35, ease: 'none', scrollTrigger: { trigger: next, start: 'top 70%', end: 'top 104px', scrub: true } });
      });
      // the page inside each browser frame pans slowly as the card passes
      cases.forEach((c) => {
        const img = c.querySelector('.case__media img');
        if (img) gsap.fromTo(img, { yPercent: 0 }, { yPercent: -14, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    });
    return () => mm.revert();
  }, { scope: rootRef });

  return (
    <section className="sec sec--work" id="work" aria-labelledby="work-title" ref={rootRef}>
      <div className="wrap">
        <header className="sec__head sec__head--row" data-reveal>
          <div>
            <p className="eyebrow mono">Selected work</p>
            <h2 id="work-title" className="h2">Shipped, live and <em>earning</em>.</h2>
          </div>
          <a href="#contact" className="link">Start your project <span aria-hidden="true">→</span></a>
        </header>

        <div className="cases">
          {CASES.map((c, i) => {
            const url = `https://${c.domain}`;
            return (
              <article className="case" style={{ '--brand': c.brand }} key={c.name}>
                <div className="case__bar" aria-hidden="true">
                  <span className="case__dots"><i /><i /><i /></span>
                  <span className="case__url mono">
                    <svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>{c.domain}
                  </span>
                  <ul className="case__chips" aria-label="Tech stack">{c.chips.map((t) => <li key={t}>{t}</li>)}</ul>
                  <span className="case__live mono"><span />Live</span>
                  <span className="case__count mono">0{i + 1} / 03</span>
                </div>
                <a className="case__media" href={url} target="_blank" rel="noopener" tabIndex={-1} aria-hidden="true" data-cursor>
                  <img src={c.img} alt="" />
                </a>
                <div className="case__panel">
                  <div className="case__who">
                    <span className="case__mono" aria-hidden="true">{c.letter}</span>
                    <div>
                      <h3>{c.name}</h3>
                      <p className="mono case__meta">{c.meta}</p>
                    </div>
                    <p className="case__lede">{c.lede}</p>
                  </div>
                  <dl className="case__facts">{c.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
                  <a className="case__btn" href={url} target="_blank" rel="noopener">
                    View live site <span aria-hidden="true">↗</span><span className="sr"> — {c.domain} (opens in new tab)</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}