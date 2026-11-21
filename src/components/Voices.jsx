import { spot } from './ui.jsx';

// TODO (client): confirm each quote, name and company is approved; add photos + company links.
const QUOTES = [
  ['RA', 'Dr. Rami Al-Shaikh', 'Founder, OrthoCloud', '“Lezood delivered a fully HIPAA-compliant dental portal in six weeks. Code quality and communication were exceptional.”'],
  ['SL', 'Sophie Laurent', 'CEO, Aura Luxury', '“They rebuilt our entire checkout in one sprint and cut cart abandonment by 34%. Direct engineer access made all the difference.”'],
  ['MV', 'Marcus Venn', 'CTO, ApexFlow AI', '“ApexFlow went from concept to production in under ten weeks, on an architecture that handles 50k concurrent users.”'],
];

export default function Voices() {
  return (
    <section className="sec sec--tight" aria-labelledby="voices-title">
      <div className="wrap">
        <header className="sec__head" data-reveal>
          <p className="eyebrow mono">Clients</p>
          <h2 id="voices-title" className="h2">What founders say <em>after launch</em>.</h2>
        </header>
        <div className="voices">
          {QUOTES.map(([ini, name, role, text]) => (
            <figure className="quote" data-reveal data-spot onPointerMove={spot} key={ini}>
              <blockquote><p>{text}</p></blockquote>
              <figcaption><span className="avatar" aria-hidden="true">{ini}</span><span><b>{name}</b>{role}</span></figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}