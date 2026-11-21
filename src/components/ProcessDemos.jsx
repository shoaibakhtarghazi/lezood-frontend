// The four live demos inside the Process window. Each one plays while `running` is true
// (stage is selected AND the window is on screen) and starts from scratch every time.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from '../lib/gsap.js';
import { reduced } from '../lib/env.js';
import { LogoMark } from './ui.jsx';

/* 01 — a live call: waveform, timer, agenda ticking off */
export function CallDemo({ running }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!running) return;
    const d = ref.current;
    const ticks = [...d.querySelectorAll('.call__agenda li')], bars = [...d.querySelectorAll('.call__wave i')];
    const time = d.querySelector('.call__time'), tiles = [...d.querySelectorAll('.call__tile')];
    ticks.forEach((t) => t.classList.remove('is-done'));
    if (reduced) {
      ticks.forEach((t) => t.classList.add('is-done')); time.textContent = '30:00';
      bars.forEach((b, i) => (b.style.transform = `scaleY(${0.25 + 0.6 * Math.abs(Math.sin(i))})`));
      return;
    }
    bars.forEach((b) => (b.style.transition = 'transform .16s ease'));
    const wave = setInterval(() => bars.forEach((b, i) => (b.style.transform = `scaleY(${0.12 + Math.random() * (0.35 + 0.5 * Math.sin((i / bars.length) * Math.PI))})`)), 140);
    let sp = 1;
    const speak = setInterval(() => { sp = 1 - sp; tiles.forEach((t, i) => t.classList.toggle('is-speaking', i === sp)); }, 2200);
    const o = { s: 0 };
    const clock = gsap.to(o, {
      s: 1800, duration: 6, ease: 'sine.out',
      onUpdate: () => { const m = Math.floor(o.s / 60), s = Math.floor(o.s % 60); time.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; },
    });
    const ids = [700, 1900, 3200].map((ms, i) => setTimeout(() => ticks[i].classList.add('is-done'), ms));
    return () => { clearInterval(wave); clearInterval(speak); clock.kill(); ids.forEach(clearTimeout); };
  }, [running]);

  return (
    <div className="demo demo--call" aria-hidden="true" ref={ref}>
      <div className="call__tiles">
        <div className="call__tile"><span className="call__av">YOU</span><span className="call__name">You</span></div>
        <div className="call__tile is-speaking"><span className="call__av call__av--lz"><LogoMark /></span><span className="call__name">Senior engineer</span></div>
      </div>
      <div className="call__wave">{Array.from({ length: 24 }, (_, i) => <i key={i} />)}</div>
      <div className="call__foot"><span className="call__rec mono"><span />REC</span><span className="call__time mono">00:00</span></div>
      <ol className="call__agenda">
        <li><span className="tick" />What's slowing the team down</li>
        <li><span className="tick" />Who uses it, and where</li>
        <li><span className="tick" />What “done” means</li>
      </ol>
    </div>
  );
}

/* 02 — the proposal writes itself, then gets stamped */
export function DocDemo({ running }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!running || reduced) return;
    const d = ref.current;
    const lines = d.querySelectorAll('.doc__line, .doc__gantt i'), chips = d.querySelectorAll('.doc__chips em');
    const price = d.querySelector('.doc__price'), stamp = d.querySelector('.stamp');
    const tl = gsap.timeline();
    tl.fromTo(lines, { scaleX: 0 }, { scaleX: 1, duration: 0.9, stagger: 0.22, ease: 'expo.out' }, 0.2)
      .fromTo(chips, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.09, ease: 'expo.out' }, 0.5)
      .fromTo(price, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'none' }, 1.5)
      .fromTo(stamp, { opacity: 0, scale: 2.4, rotation: -28 }, { opacity: 1, scale: 1, rotation: -10, duration: 0.7, ease: 'back.out(1.7)' }, 2);
    return () => tl.kill();
  }, [running]);

  return (
    <div className="demo demo--doc" aria-hidden="true" ref={ref}>
      <div className="doc">
        <p className="doc__title">Proposal <span className="mono">v1 · sample</span></p>
        <div className="doc__row"><span className="mono">Scope</span><span className="doc__line" style={{ '--w': '86%' }} /></div>
        <div className="doc__row"><span className="mono">Stack</span><span className="doc__chips"><em>Next.js</em><em>Node</em><em>Postgres</em><em>LLM</em></span></div>
        <div className="doc__row"><span className="mono">Timeline</span>
          <span className="doc__gantt"><i style={{ '--s': 0, '--e': '34%' }} /><i style={{ '--s': '30%', '--e': '66%' }} /><i style={{ '--s': '62%', '--e': '100%' }} /></span>
        </div>
        <div className="doc__row"><span className="mono">Sprints</span><span className="doc__line" style={{ '--w': '58%' }} /></div>
        <div className="doc__row doc__row--price"><span className="mono">Price</span><span className="doc__price">Fixed, per sprint</span></div>
      </div>
      <span className="stamp mono">Delivered<br />in 48h</span>
    </div>
  );
}

/* 03 — tasks move across the sprint board (FLIP), Fridays light up */
const CARDS = [['API', 'Invoice sync'], ['AI', 'Ticket triage agent'], ['UI', 'Ops dashboard']];
const PLAN = [[600, 0, 1], [1700, 0, 2], [1900, 1, 1], [3000, 1, 2], [3200, 2, 1], [4400, 2, 2]];
export function BoardDemo({ running }) {
  const [cols, setCols] = useState([0, 0, 0]);   // which column each card sits in
  const [cycle, setCycle] = useState(0);
  const els = useRef([]), firsts = useRef({}), fillRef = useRef(null);

  const move = (k, col) => {
    if (els.current[k]) firsts.current[k] = els.current[k].getBoundingClientRect(); // FLIP: remember "First"
    setCols((c) => c.map((v, i) => (i === k ? col : v)));
  };

  // FLIP: after React moved the card, animate from the old position to the new one
  useLayoutEffect(() => {
    Object.entries(firsts.current).forEach(([k, f]) => {
      const el = els.current[k]; if (!el) return;
      const l = el.getBoundingClientRect();
      gsap.fromTo(el, { x: f.left - l.left, y: f.top - l.top, scale: 1.04 }, { x: 0, y: 0, scale: 1, duration: 0.75, ease: 'expo.inOut' });
    });
    firsts.current = {};
  }, [cols]);

  useEffect(() => {
    if (!running) return;
    const fill = fillRef.current;
    firsts.current = {};
    setCols([0, 0, 0]);
    if (reduced) { setCols([2, 2, 2]); gsap.set(fill, { scaleX: 1 }); return; }
    gsap.set(fill, { scaleX: 0 });
    const bar = gsap.to(fill, { scaleX: 1, duration: 5.2, ease: 'none', delay: 0.3 });
    const ids = PLAN.map(([ms, k, col]) => setTimeout(() => move(k, col), ms));
    ids.push(setTimeout(() => setCycle((c) => c + 1), 7000)); // keep the sprint cycling
    return () => { bar.kill(); ids.forEach(clearTimeout); };
  }, [running, cycle]);

  return (
    <div className="demo demo--board" aria-hidden="true">
      <div className="board">
        {['To do', 'In progress', 'Done'].map((name, c) => (
          <div className="board__col" data-col={c} key={name}>
            <p className="mono">{name}</p>
            {CARDS.map(([tag, text], k) => cols[k] === c && (
              <div className="kcard" key={k} data-k={k} ref={(el) => (els.current[k] = el)}><span className="kcard__tag">{tag}</span>{text}</div>
            ))}
          </div>
        ))}
      </div>
      <div className="sprints mono">
        <span>Sprint 1</span><span>Sprint 2</span><span>Sprint 3</span>
        <div className="sprints__track"><i className="sprints__fill" ref={fillRef} /><b style={{ '--x': '31%' }}>Fri · staging</b><b style={{ '--x': '64%' }}>Fri · staging</b><b style={{ '--x': '97%' }}>Fri · staging</b></div>
      </div>
    </div>
  );
}

/* 04 — the deploy log types out, handoff completes */
const DEPLOY = '$ deploy --env production';
export function TermDemo({ running }) {
  const ref = useRef(null);
  useLayoutEffect(() => { ref.current.querySelector('[data-l]').textContent = DEPLOY; }, []);
  useEffect(() => {
    if (!running) return;
    const d = ref.current;
    const lines = [...d.querySelectorAll('[data-l]')], ticks = [...d.querySelectorAll('.handoff li')], first = lines[0];
    ticks.forEach((t) => t.classList.remove('is-done'));
    if (reduced) { lines.forEach((l) => (l.style.opacity = 1)); first.textContent = DEPLOY; ticks.forEach((t) => t.classList.add('is-done')); return; }
    lines.forEach((l) => (l.style.opacity = 0));
    first.style.opacity = 1; first.textContent = '';
    const o = { n: 0 };
    const type = gsap.to(o, { n: DEPLOY.length, duration: 0.7, ease: 'none', onUpdate: () => (first.textContent = DEPLOY.slice(0, Math.round(o.n))) });
    const rest = lines.slice(1).map((l, i) => gsap.fromTo(l, { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.4, ease: 'expo.out', delay: 1 + i * 0.52 }));
    const ids = ticks.map((t, i) => setTimeout(() => t.classList.add('is-done'), 3300 + i * 380));
    return () => { type.kill(); rest.forEach((t) => t.kill()); ids.forEach(clearTimeout); };
  }, [running]);

  return (
    <div className="demo demo--term" aria-hidden="true" ref={ref}>
      <div className="term">
        <p data-l />
        <p data-l className="ok">✓ build completed</p>
        <p data-l className="ok">✓ tests passed</p>
        <p data-l className="ok">✓ migrations applied</p>
        <p data-l className="hi">● live — app.yourcompany.com</p>
      </div>
      <ol className="handoff">
        {['Docs', 'CI/CD', 'IP transfer', '30-day on-call'].map((t) => <li key={t}><span className="tick" />{t}</li>)}
      </ol>
    </div>
  );
}