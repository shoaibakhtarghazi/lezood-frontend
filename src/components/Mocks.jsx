// The four little "product UIs" inside the services cards. Each plays only while on screen.
import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/gsap.js';
import { reduced } from '../lib/env.js';
import { LogoMark } from './ui.jsx';

const watch = (el, onIn, onOut) => {
  const io = new IntersectionObserver(([e]) => (e.isIntersecting ? onIn() : onOut && onOut()), { threshold: 0.35 });
  io.observe(el);
  return () => io.disconnect();
};

/* AI card: the agent works through its steps, then starts over */
export function ChatMock() {
  const ref = useRef(null);
  useEffect(() => {
    const steps = [...ref.current.querySelectorAll('.chat__steps li')];
    if (reduced) { steps.forEach((s) => s.classList.add('is-done')); return; }
    const reset = () => steps.forEach((s) => s.classList.remove('is-done', 'is-busy'));
    const tl = gsap.timeline({ repeat: -1, paused: true, onRepeat: reset });
    tl.to({}, { duration: 0.5 });
    steps.forEach((s) => tl.call(() => s.classList.add('is-busy')).to({}, { duration: 0.75 }).call(() => { s.classList.remove('is-busy'); s.classList.add('is-done'); }));
    tl.to({}, { duration: 1.8 });
    reset();
    const stop = watch(ref.current, () => tl.play(), () => tl.pause());
    return () => { stop(); tl.kill(); };
  }, []);

  return (
    <div className="mock mock--chat" ref={ref}>
      <div className="chat__head mono"><span className="chat__bot"><LogoMark /></span>Support agent<span className="chat__live">running</span></div>
      <div className="chat__msg">Summarise yesterday's support tickets and draft replies.</div>
      <ol className="chat__steps">
        {['Read 48 tickets from the help desk', 'Grouped them into 3 themes', 'Drafted 12 replies for review', 'Posted a summary to #support'].map((t) => (
          <li key={t}><span className="tick" />{t}</li>
        ))}
      </ol>
    </div>
  );
}

/* Custom software card: an order gets approved */
export function TableMock() {
  const ref = useRef(null);
  const [paid, setPaid] = useState(false);
  const [flash, setFlash] = useState(-1);
  useEffect(() => {
    if (reduced) return;
    let n = 0, id = null, t;
    const stop = watch(ref.current, () => {
      if (id) return;
      id = setInterval(() => {
        n++;
        setFlash(n % 3); clearTimeout(t); t = setTimeout(() => setFlash(-1), 700);
        if (n % 3 === 1) setPaid((p) => !p);
      }, 1300);
    }, () => { clearInterval(id); id = null; });
    return () => { stop(); clearInterval(id); clearTimeout(t); };
  }, []);

  const rows = [['#1193', 'Northwind'], ['#1194', 'Acme Co.'], ['#1195', 'Globex']];
  return (
    <div className="mock mock--table" ref={ref}>
      <div className="tbar"><span className="tbar__search mono">Search orders…</span><span className="tbar__btn mono">Export</span></div>
      <div className="tr th"><span>Order</span><span>Client</span><span>Status</span></div>
      {rows.map(([id, client], i) => {
        const ok = i === 1 ? paid : true;
        return (
          <div key={id} className={'tr' + (flash === i ? ' is-flash' : '')}>
            <span>{id}</span><span>{client}</span><span className={'pill' + (ok ? ' pill--ok' : '')}>{ok ? 'Paid' : 'Review'}</span>
          </div>
        );
      })}
    </div>
  );
}

/* Product card: commit → test → build → deploy */
export function PipeMock() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current, bar = root.querySelector('.pipe__bar'), steps = [...root.querySelectorAll('.pipe__steps li')];
    if (reduced) { bar.style.transform = 'scaleX(1)'; steps.forEach((s) => s.classList.add('is-done')); return; }
    const reset = () => { gsap.set(bar, { scaleX: 0, opacity: 1 }); steps.forEach((s, i) => s.classList.toggle('is-done', i === 0)); };
    const tl = gsap.timeline({ repeat: -1, paused: true, onRepeat: reset });
    tl.to({}, { duration: 0.4 })
      .to(bar, {
        scaleX: 1, duration: 2.6, ease: 'sine.inOut',
        onUpdate() { const p = this.progress() * 100; steps.forEach((s, i) => s.classList.toggle('is-done', p >= (i / (steps.length - 1)) * 100 - 1)); },
      })
      .to({}, { duration: 1.6 })
      .to(bar, { opacity: 0, duration: 0.35 });
    reset();
    const stop = watch(root, () => tl.play(), () => tl.pause());
    return () => { stop(); tl.kill(); };
  }, []);

  return (
    <div className="mock mock--pipe" ref={ref}>
      <div className="pipe__head mono"><span className="pipe__branch">main</span><span>a3f9c2</span><span className="pipe__env">production</span></div>
      <div className="pipe__track">
        <span className="pipe__line"><i className="pipe__bar" /></span>
        <ol className="pipe__steps"><li>Commit</li><li>Test</li><li>Build</li><li>Deploy</li></ol>
      </div>
      <div className="pipe__log mono"><span>✓ 218 tests</span><span>4m 12s</span><span className="pipe__ok">● deployed</span></div>
    </div>
  );
}

/* Web card: score rings fill once */
const SCORES = [[99, 'Speed'], [100, 'Access'], [100, 'SEO']];
export function ScoresMock() {
  const ref = useRef(null);
  useEffect(() => {
    const rings = [...ref.current.querySelectorAll('.ring')];
    const fill = (r, animate) => {
      const s = +r.dataset.score, c = r.querySelector('.ring__v'), b = r.querySelector('b'), target = 119.4 * (1 - s / 100);
      if (!animate) { c.style.strokeDashoffset = target; b.textContent = s; return; }
      const o = { v: 0 };
      gsap.fromTo(c, { strokeDashoffset: 119.4 }, { strokeDashoffset: target, duration: 1.6, ease: 'expo.out' });
      gsap.to(o, { v: s, duration: 1.6, ease: 'expo.out', onUpdate: () => (b.textContent = Math.round(o.v)) });
    };
    if (reduced) { rings.forEach((r) => fill(r, false)); return; }
    rings.forEach((r) => (r.querySelector('b').textContent = r.dataset.score));
    let done = false;
    const stop = watch(ref.current, () => { if (!done) { done = true; rings.forEach((r) => fill(r, true)); } });
    return () => { stop(); rings.forEach((r) => gsap.killTweensOf([r.querySelector('.ring__v'), r.querySelector('b')])); };
  }, []);

  return (
    <div className="mock mock--scores" ref={ref}>
      <div className="mini-browser"><i /><i /><i /><span className="mono">yourstore.com</span></div>
      <div className="scores">
        {SCORES.map(([s, label]) => (
          <div className="ring" data-score={s} key={label}>
            <svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19" /><circle className="ring__v" cx="22" cy="22" r="19" /></svg>
            <b /><span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}