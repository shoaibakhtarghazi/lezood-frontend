import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap.js';
import { reduced } from '../lib/env.js';
import { getLenis } from '../lib/scroll.js';
import { BoardDemo, CallDemo, DocDemo, TermDemo } from './ProcessDemos.jsx';

const STATES = ['In discovery', 'Proposal sent', 'Sprint in progress', 'Live'];
const STAGES = [
  { no: '01', title: 'Discovery call', when: 'Day 1', kicker: 'Step 01 · Day 1 · 30 minutes', h: 'Discovery call',
    p: 'A call with a senior engineer — not a salesperson. We map the problem, the people who\'ll use it and what “done” looks like.',
    list: ['Problem & current workflow', 'Users and constraints', 'A shared definition of done'], Demo: CallDemo },
  { no: '02', title: 'Scoped proposal', when: '+48 hours', kicker: 'Step 02 · Within 48 hours', h: 'Scoped proposal',
    p: 'A written spec, the stack, a timeline split into sprints and one fixed price. No hourly surprises.',
    list: ['Scope & spec', 'Architecture & stack', 'Sprint plan with a fixed price'], Demo: DocDemo },
  { no: '03', title: 'Sprints', when: '2-week cycles', kicker: 'Step 03 · Two-week cycles', h: 'Sprint execution',
    p: 'We build in two-week sprints. Every Friday you get a live staging link — progress you can click, not status emails.',
    list: ['Direct chat with the engineers', 'Staging link every Friday', 'Fixed price per sprint'], Demo: BoardDemo },
  { no: '04', title: 'Launch & handoff', when: 'Go-live', kicker: 'Step 04 · Go-live', h: 'Launch & handoff',
    p: 'We deploy, document and hand over everything — code, infrastructure and IP. Then we stay on call for 30 days.',
    list: ['Production deploy & CI/CD', 'Docs and full IP transfer', '30 days on call'], Demo: TermDemo },
];

export default function Process() {
  const rootRef = useRef(null), railRef = useRef(null), fillRef = useRef(null), packetRef = useRef(null), winRef = useRef(null);
  const nodes = useRef([]), panes = useRef([]), stRef = useRef(null), cur = useRef(0), prev = useRef(-1);
  const [current, setCurrent] = useState(0);
  const [inView, setInView] = useState(false);

  const setRail = (p) => {
    p = Math.max(0, Math.min(1, p));
    fillRef.current.style.transform = `scaleX(${p})`;
    packetRef.current.style.left = `${p * 100}%`;
  };

  // select a stage (fromScroll: the pinned scroll drives the rail itself)
  const go = (i, fromScroll) => {
    if (i === cur.current) return;
    const was = cur.current; cur.current = i; setCurrent(i);
    if (!fromScroll) {
      if (reduced) setRail(i / 3);
      else gsap.to({ v: was / 3 }, { v: i / 3, duration: 0.6, ease: 'expo.out', onUpdate() { setRail(this.targets()[0].v); } });
    }
  };

  // after a stage change: bring the tab into view (mobile) + animate the new pane in
  useLayoutEffect(() => {
    const rail = railRef.current, was = prev.current; prev.current = current;
    if (rail.scrollWidth > rail.clientWidth + 4) rail.scrollTo({ left: nodes.current[current].offsetLeft - 16, behavior: reduced ? 'auto' : 'smooth' });
    if (was < 0 || reduced) return;
    const pane = panes.current[current];
    gsap.fromTo(pane.querySelector('.pane__info').children, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'expo.out' });
    gsap.fromTo(pane.querySelector('.demo'), { y: 18, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'expo.out' });
  }, [current]);

  // demos (re)start whenever the window comes into view
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
    io.observe(winRef.current);
    return () => io.disconnect();
  }, []);

  // Desktop: the section is pinned and scroll walks through the four stages
  useGSAP(() => {
    setRail(0);
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
      stRef.current = ScrollTrigger.create({
        trigger: rootRef.current, start: 'top top', end: '+=260%', pin: '.process__pin', anticipatePin: 1, refreshPriority: 1,
        onUpdate: (s) => { setRail((s.progress * 4) / 3); go(Math.min(3, Math.floor(s.progress * 4)), true); },
      });
      return () => { stRef.current = null; };
    });
    return () => mm.revert();
  }, { scope: rootRef });

  const pick = (i) => {
    const st = stRef.current, lenis = getLenis();
    if (st && lenis) lenis.scrollTo(st.start + (st.end - st.start) * ((i + 0.5) / 4), { duration: 1.1 });
    else go(i);
  };

  // Keyboard: arrows move between stages (WAI-ARIA tabs pattern)
  const onKey = (e) => {
    const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (k === undefined && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    const n = e.key === 'Home' ? 0 : e.key === 'End' ? 3 : (cur.current + k + 4) % 4;
    nodes.current[n].focus(); nodes.current[n].click();
  };

  return (
    <section className="process" id="process" aria-labelledby="process-title" ref={rootRef}>
      <div className="process__pin">
        <div className="wrap">
          <header className="process__head">
            <div>
              <p className="eyebrow mono">Process</p>
              <h2 id="process-title" className="h2">From idea to production <em>in weeks</em>.</h2>
            </div>
            <p className="process__hint">Pick a stage to see it in action.</p>
          </header>

          {/* Timeline rail = tablist */}
          <div className="rail" role="tablist" aria-label="Project stages" ref={railRef} onKeyDown={onKey}>
            <span className="rail__track" aria-hidden="true"><i className="rail__fill" ref={fillRef} /><i className="rail__packet" ref={packetRef} /></span>
            {STAGES.map((s, i) => (
              <button key={s.no} ref={(el) => (nodes.current[i] = el)} role="tab" id={`pt-${i}`} aria-controls={`pp-${i}`}
                className={'rail__node' + (i === current ? ' is-active' : '') + (i < current ? ' is-done' : '')}
                aria-selected={i === current} tabIndex={i === current ? 0 : -1} onClick={() => pick(i)}>
                <span className="rail__dot" aria-hidden="true" /><span className="rail__no mono">{s.no}</span><b>{s.title}</b><span className="rail__when mono">{s.when}</span>
              </button>
            ))}
          </div>

          {/* Stage window */}
          <div className="win" data-stage={current} ref={winRef}>
            <div className="win__bar" aria-hidden="true"><i /><i /><i /><span className="mono win__title">lezood / project</span><span className="win__status mono"><span className="win__led" /><span className="win__state">{STATES[current]}</span></span></div>
            <div className="win__body">
              {STAGES.map(({ kicker, h, p, list, Demo }, i) => (
                <div className="pane" role="tabpanel" id={`pp-${i}`} aria-labelledby={`pt-${i}`} data-stage={i} hidden={i !== current} key={h} ref={(el) => (panes.current[i] = el)}>
                  <div className="pane__info">
                    <p className="mono pane__kicker">{kicker}</p>
                    <h3>{h}</h3>
                    <p>{p}</p>
                    <ul className="pane__list">{list.map((t) => <li key={t}>{t}</li>)}</ul>
                  </div>
                  <Demo running={inView && i === current} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}