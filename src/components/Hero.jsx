import { Fragment, useEffect, useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap.js';
import { reduced } from '../lib/env.js';
import { createStack } from '../three/stack.js';
import { ArrowIcon, Lbl } from './ui.jsx';

const HEADLINE = ['AI', 'systems', '&', 'software,', { em: 'engineered' }, 'to', 'run', 'your\u00a0business.'];
const MASK = { display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '.08em', marginBottom: '-.08em' };
const LOGOS = ['Governata', 'AKRU', 'Hugabu', 'Morning Wood', 'Barret Media', 'iYUREK.ai'];
const FEED = ['Invoice #4821 reconciled', 'Lead scored 92 / 100', 'Ticket resolved in 38s', 'Weekly KPI report sent', 'Contract summarised · 12 pp', 'Refund approved under policy'];

/* The floating feed narrates what the stack is doing. */
function Feed() {
  const ref = useRef(null);
  useEffect(() => {
    const box = ref.current;
    let i = 0;
    const first = document.createElement('span'); first.textContent = FEED[0]; box.appendChild(first);
    let id;
    if (!reduced) {
      id = setInterval(() => {
        if (document.hidden || box.getBoundingClientRect().bottom < 0) return;
        i = (i + 1) % FEED.length;
        const old = box.lastElementChild, nw = document.createElement('span');
        nw.textContent = FEED[i]; box.appendChild(nw);
        gsap.fromTo(nw, { yPercent: 110 }, { yPercent: 0, duration: 0.6, ease: 'expo.out' });
        gsap.to(old, { yPercent: -110, duration: 0.45, ease: 'expo.in', onComplete: () => old.remove() });
      }, 2600);
    }
    return () => { clearInterval(id); gsap.killTweensOf(box.children); box.innerHTML = ''; };
  }, []);
  return <span className="float__feed" ref={ref} />;
}

export default function Hero() {
  const rootRef = useRef(null), canvasRef = useRef(null), tagRefs = useRef([]);

  useGSAP(() => {
    const tags = tagRefs.current;
    const hero = createStack(canvasRef.current, {
      labels: tags,
      onHover: (i) => tags.forEach((t, k) => t.classList.toggle('is-on', k === i)),
    });
    if (!hero) document.documentElement.classList.add('no-webgl');

    if (!reduced) {
      // Intro: words rise, the stack builds itself
      const words = gsap.utils.toArray('.w-in'), others = gsap.utils.toArray('[data-in]');
      gsap.set(words, { yPercent: 110 });
      gsap.set(others, { y: 20, opacity: 0 });
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.15 });
      tl.to(words, { yPercent: 0, duration: 1.1, stagger: 0.045 }, 0)
        .to(others, { y: 0, opacity: 1, duration: 1, stagger: 0.08 }, 0.3);
      if (hero) {
        hero.set('build', 1);
        tl.to(hero.state, { build: 3, duration: 2.6, ease: 'power2.inOut', onUpdate: hero.render }, 0.2);
        // scrolling away assembles the stack: "engineered"
        gsap.to(hero.state, { explode: 0.15, ease: 'none', onUpdate: hero.render, scrollTrigger: { trigger: rootRef.current, start: 'top top', end: 'bottom top', scrub: true } });
      }
    } else if (hero) {
      hero.set('explode', 0.6);
    }

    return () => { hero && hero.dispose(); document.documentElement.classList.remove('no-webgl'); };
  }, { scope: rootRef });

  return (
    <section className="hero" id="top" aria-labelledby="hero-title" ref={rootRef}>
      <div className="hero__bg" aria-hidden="true" />
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <p className="badge" data-in><span className="badge__dot" aria-hidden="true" />Senior engineers only · Proposal in 48h</p>
          <h1 id="hero-title" className="h1">
            {HEADLINE.map((w, i) => {
              const inner = typeof w === 'string' ? w : <em>{w.em}</em>;
              return (
                <Fragment key={i}>
                  {i > 0 && ' '}
                  {reduced ? inner : <span style={MASK}><span className="w-in" style={{ display: 'inline-block' }}>{inner}</span></span>}
                </Fragment>
              );
            })}
          </h1>
          <p className="lede" data-in>We design and build AI agents, workflow automation, internal tools and SaaS products — in fixed-price, two-week sprints.</p>
          <div className="actions" data-in>
            <a href="#contact" className="btn btn--accent" data-magnetic><Lbl>Book a discovery call</Lbl><ArrowIcon /></a>
            <a href="#work" className="btn btn--ghost"><Lbl>See our work</Lbl></a>
          </div>
          <dl className="hero__facts" data-in>
            <div><dt>Clients</dt><dd>40+</dd></div>
            <div><dt>Launches</dt><dd>50+</dd></div>
            <div><dt>Code &amp; IP</dt><dd>100% yours</dd></div>
          </dl>
        </div>

        <figure className="hero__stage" aria-label="Diagram: the three layers we build — interface, AI agents, and data and integrations">
          <div className="stage__orbit" aria-hidden="true"><i /><i /></div>
          <canvas className="stage__canvas" ref={canvasRef} aria-hidden="true" />
          <div className="float float--a" aria-hidden="true"><span className="float__pulse" /><span><b>AI agent</b> · running</span></div>
          <div className="float float--b" aria-hidden="true"><span className="float__label mono">Just now</span><Feed /></div>
          <div className="stage__labels" aria-hidden="true">
            {[['Data & integrations', 'CRM · ERP · email · docs'], ['AI agents', 'Read, decide, act'], ['Interface', 'Dashboards & portals']].map(([b, s], i) => (
              <div className="tag" key={b} ref={(el) => (tagRefs.current[i] = el)}><b>{b}</b><span>{s}</span></div>
            ))}
          </div>
          <p className="stage__hint mono" aria-hidden="true">Hover a layer</p>
          <div className="stage__fallback" aria-hidden="true"><span>Interface</span><span>AI agents</span><span>Data &amp; integrations</span></div>
        </figure>
      </div>

      <div className="wrap">
        <div className="logos" aria-label="Clients">
          <p className="logos__label mono">Trusted by teams at</p>
          <div className="logos__track">
            <ul>{LOGOS.map((n) => <li key={n}>{n}</li>)}</ul>
            <ul aria-hidden="true">{LOGOS.map((n) => <li key={n}>{n}</li>)}</ul>
          </div>
        </div>
      </div>
    </section>
  );
}