import { useRef, useState } from 'react';
import { ArrowIcon, Check, spot } from './ui.jsx';

const SERVICES = ['AI development', 'Custom software', 'Product engineering', 'Web app', 'Not sure yet'];
const RULES = {
  name: (v) => (v.trim().length > 1 ? '' : 'Please enter your name.'),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter an email like name@company.com.'),
};

export default function Contact({ service, setService }) {
  const formRef = useRef(null);
  const [errs, setErrs] = useState({ name: '', email: '' });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState('');
  const [copied, setCopied] = useState('');

  const check = (input) => {
    const msg = RULES[input.name](input.value);
    setErrs((e) => ({ ...e, [input.name]: msg }));
    return !msg;
  };
  const fieldProps = (n) => ({
    name: n, 'aria-invalid': errs[n] ? 'true' : 'false', 'aria-describedby': errs[n] ? `f-${n}-err` : undefined,
    onBlur: (e) => e.target.value && check(e.target),
    onChange: (e) => errs[n] && check(e.target),
  });

  const copy = async () => {
    try { await navigator.clipboard.writeText('hello@lezood.com'); setCopied('Copied'); }
    catch { setCopied('Press ⌘/Ctrl + C'); }
    setTimeout(() => setCopied(''), 2400);
  };

  const submit = (e) => {
    e.preventDefault();
    const f = formRef.current.elements;
    const bad = Object.keys(RULES).map((n) => f[n]).filter((el) => !check(el));
    if (bad.length) { bad[0].focus(); return; }
    setSending(true);
    // TODO (dev): replace with fetch() to the real endpoint. Fallback: prefilled email.
    const body = `Name: ${f.name.value}\nEmail: ${f.email.value}\nNeed: ${service}\n\n${f.message.value || ''}`;
    window.location.href = `mailto:hello@lezood.com?subject=${encodeURIComponent('Project brief — ' + service)}&body=${encodeURIComponent(body)}`;
    setTimeout(() => {
      setSending(false);
      setDone('Thanks — your email app has the brief ready to send. We reply within 24 hours.');
    }, 600);
  };

  return (
    <section className="sec sec--contact" id="contact" aria-labelledby="contact-title">
      <div className="wrap">
        <div className="contact" data-spot onPointerMove={spot}>
          <div className="contact__intro">
            <p className="eyebrow mono">Start a project</p>
            <h2 id="contact-title" className="h2">Tell us what you want <em>to build</em>.</h2>
            <p className="sec__sub">A senior engineer replies within 24 hours — not a sales team.</p>
            <ul className="assure">
              {['Mutual NDA before you share anything', 'Fixed-price proposal within 48 hours', '100% code and IP ownership'].map((t) => <li key={t}><Check />{t}</li>)}
            </ul>
            <div className="mail">
              <a href="mailto:hello@lezood.com" className="link mail__addr">hello@lezood.com</a>
              <button className="mail__copy mono" type="button" onClick={copy}>Copy</button>
              <span className="mail__status mono" role="status" aria-live="polite">{copied}</span>
            </div>
          </div>

          <form className="form" id="brief" noValidate ref={formRef} onSubmit={submit}>
            <div className={'field' + (errs.name ? ' has-err' : '')}>
              <label htmlFor="f-name">Your name</label>
              <input id="f-name" type="text" autoComplete="name" required {...fieldProps('name')} />
              <p className="field__err" id="f-name-err">{errs.name}</p>
            </div>
            <div className={'field' + (errs.email ? ' has-err' : '')}>
              <label htmlFor="f-email">Work email</label>
              <input id="f-email" type="email" autoComplete="email" inputMode="email" required {...fieldProps('email')} />
              <p className="field__err" id="f-email-err">{errs.email}</p>
            </div>
            <fieldset className="field">
              <legend>What do you need?</legend>
              <div className="pick">
                {SERVICES.map((s) => (
                  <label key={s}><input type="radio" name="service" value={s} checked={service === s} onChange={() => setService(s)} /><span>{s}</span></label>
                ))}
              </div>
            </fieldset>
            <div className="field">
              <label htmlFor="f-msg">Project in a few sentences <span className="opt">(optional)</span></label>
              <textarea id="f-msg" name="message" rows="4" />
            </div>
            <button className="btn btn--accent btn--block" type="submit" disabled={sending}>
              <span>{sending ? 'Sending…' : 'Send brief'}</span><ArrowIcon />
            </button>
            <p className="form__done" role="status" aria-live="polite">{done}</p>
          </form>
        </div>
      </div>
    </section>
  );
}