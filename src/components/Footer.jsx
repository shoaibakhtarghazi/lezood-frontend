import { LogoMark } from './ui.jsx';

const ext = { target: '_blank', rel: 'noopener' };

export function Partner() {
  return (
    <section className="partner" aria-labelledby="partner-title">
      <div className="wrap partner__row">
        <p id="partner-title" className="partner__title"><span className="mono">Partners</span> Know a business that needs software? Earn 10–20% for the introduction.</p>
        <a href="/partners/apply" className="link">Become a partner <span aria-hidden="true">→</span></a>
      </div>
    </section>
  );
}

export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot__top">
          <div>
            <a href="#top" className="logo" aria-label="Lezood home"><LogoMark />lezood</a>
            <p className="foot__tag">AI and custom software, engineered for real operations.</p>
          </div>
          <nav aria-label="Footer" className="foot__cols">
            <div><p className="mono foot__h">Explore</p><ul><li><a href="#services">Services</a></li><li><a href="#work">Work</a></li><li><a href="#process">Process</a></li><li><a href="/partners/apply">Partners</a></li></ul></div>
            <div><p className="mono foot__h">Follow</p><ul><li><a href="https://x.com/lezoodofficial" {...ext}>X / Twitter</a></li><li><a href="https://www.linkedin.com/company/lezood" {...ext}>LinkedIn</a></li><li><a href="https://www.instagram.com/lezood" {...ext}>Instagram</a></li></ul></div>
            <div><p className="mono foot__h">Contact</p><ul><li><a href="mailto:hello@lezood.com">hello@lezood.com</a></li></ul></div>
          </nav>
        </div>
        <div className="foot__base mono">
          <span>© {new Date().getFullYear()} Lezood</span>
          {/* TODO (client): publish these pages before launch */}
          <span className="foot__legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/security">Security</a></span>
        </div>
      </div>
    </footer>
  );
}