import { useState } from 'react';
import { ScrollTrigger } from '../lib/gsap.js';

const ITEMS = [
  ['What does Lezood do?', 'We design and build AI agents, workflow automation, internal tools, SaaS products and web applications — from the first spec through launch and support.'],
  ['What kinds of businesses do you work with?', 'Founders building a first product, scale-ups adding AI or removing manual work, and established companies modernising internal tools. Recent work spans data governance, real estate investing and e-commerce.'],
  ['Do you build AI agents and workflow automation?', 'Yes. Agents that read and act on your data, automations between the tools you already use, and copilots for your team — using the models and hosting that fit your security requirements.'],
  ['Do you only work on new products?', 'No. We also take over existing codebases for audits, refactors, new features and performance work.'],
  ['Can you work with our internal team?', 'Yes. We can join your repo, stand-ups and tools as an embedded squad, or own a self-contained part of the product end to end.'],
  ['Do I own the code and IP?', 'Yes, from day one. Repositories live in your accounts, and we sign a mutual NDA before you share anything.'],
  ['How quickly can you start?', "Book a discovery call this week. You'll have a fixed-price proposal within 48 hours of it, and the first sprint starts as soon as it's signed."],
];

export default function Faq() {
  const [open, setOpen] = useState(() => new Set());
  const toggle = (i) => {
    setOpen((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
    setTimeout(() => ScrollTrigger.refresh(), 500); // the page got taller/shorter
  };

  return (
    <section className="sec" id="faq" aria-labelledby="faq-title">
      <div className="wrap faq">
        <header className="sec__head faq__head" data-reveal>
          <p className="eyebrow mono">FAQ</p>
          <h2 id="faq-title" className="h2">Straight <em>answers</em>.</h2>
          <p className="sec__sub">Something else? <a className="link" href="#contact">Ask us directly</a> — a senior engineer replies within 24 hours.</p>
        </header>
        <div className="acc" data-reveal>
          {ITEMS.map(([q, a], i) => (
            <div className="acc__item" key={q}>
              <h3>
                <button aria-expanded={open.has(i)} aria-controls={`q${i + 1}`} id={`q${i + 1}-b`} onClick={() => toggle(i)}>
                  {q}<span className="acc__icon" aria-hidden="true" />
                </button>
              </h3>
              <div className="acc__panel" id={`q${i + 1}`} role="region" aria-labelledby={`q${i + 1}-b`}><div><p>{a}</p></div></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}