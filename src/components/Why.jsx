import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap.js';
import { reduced } from '../lib/env.js';
import { Check, Cross, LogoMark, spot } from './ui.jsx';

const US = ['Senior engineers only', 'You talk to the engineers, directly', 'Fixed price per sprint', 'Live staging link every Friday', 'Code & IP yours from day one', '30 days on call after launch'];
const THEM = ['Mixed, junior-heavy teams', 'Everything goes through an account manager', 'Open-ended hourly billing', 'Weekly status emails', 'IP transferred at the end', 'Support needs a new contract'];

/* A number that counts up the first time it scrolls into view */
function Stat({ end, suffix, dec = 0, label }) {
  const ref = useRef(null);
  useGSAP(() => {
    const el = ref.current;
    el.textContent = end.toFixed(dec) + suffix; // final value is always the starting text
    if (reduced) return;
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => {
        const o = { v: 0 };
        gsap.to(o, { v: end, duration: 1.8, ease: 'expo.out', onUpdate: () => (el.textContent = o.v.toFixed(dec) + suffix) });
      },
    });
  });
  return <div className="stat" data-reveal><b ref={ref} /><span>{label}</span></div>;
}

export default function Why() {
  return (
    <section className="sec" aria-labelledby="why-title">
      <div className="wrap">
        <header className="sec__head" data-reveal>
          <p className="eyebrow mono">Why Lezood</p>
          <h2 id="why-title" className="h2">Agency outcomes, without <em>agency layers</em>.</h2>
        </header>
        <div className="compare">
          <div className="compare__card compare__card--us" data-reveal data-spot onPointerMove={spot}>
            <p className="compare__title"><LogoMark />Lezood</p>
            <ul>{US.map((t) => <li key={t}><Check />{t}</li>)}</ul>
          </div>
          <div className="compare__card" data-reveal>
            <p className="compare__title">Typical agency</p>
            <ul>{THEM.map((t) => <li key={t}><Cross />{t}</li>)}</ul>
          </div>
        </div>

        <div className="stats" aria-label="Track record">
          <Stat end={40} suffix="+" label="Clients served" />
          <Stat end={50} suffix="+" label="Production launches" />
          <Stat end={99.8} suffix="%" dec={1} label="Delivered on time" />
          <Stat end={48} suffix="h" label="To a fixed-price proposal" />
        </div>
      </div>
    </section>
  );
}