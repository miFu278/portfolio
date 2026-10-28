import ChapterHead from '../../../components/ui/ChapterHead';
import Reveal from '../../../components/ui/Reveal';
import { CHAPTERS, CONTACT_CHANNELS, MISSIONS, PROFILE } from '../../../config/content';
import { useContactForm } from '../hooks/useContactForm';

const RESPONSE = CHAPTERS[5];

const STATUS_TEXT: Record<string, string> = {
  idle: '',
  sending: 'sending…',
  sent: '200 OK · request received',
  failed: '503 · transport unavailable — email me directly',
};

const Response = () => {
  const { form, mission, status, setField, pickMission, submit } = useContactForm();

  return (
    <section id={RESPONSE.id} className="chapter">
      <div className="shell">
        <ChapterHead
          id={RESPONSE.id}
          lead="Tell me what you are building. I will tell you what it takes."
        />

        <div className="response__grid">
          <Reveal>
            <div className="response__channels">
              {CONTACT_CHANNELS.map((channel) => {
                const Icon = channel.icon;
                const inner = (
                  <>
                    <Icon aria-hidden="true" />
                    <span className="channel__label">{channel.label}</span>
                    <span className="channel__value">{channel.value}</span>
                  </>
                );

                return channel.href ? (
                  <a
                    key={channel.label}
                    className="channel"
                    href={channel.href}
                    target={channel.href.startsWith('http') ? '_blank' : undefined}
                    rel={channel.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {inner}
                  </a>
                ) : (
                  <div className="channel" key={channel.label}>
                    {inner}
                  </div>
                );
              })}
            </div>

            <p className="label" style={{ marginTop: '1.5rem' }}>
              Replies within 24h · {PROFILE.timezone} (GMT+7)
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="missions" role="group" aria-label="Kind of request">
              {MISSIONS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="mission"
                  data-active={mission?.id === m.id}
                  onClick={() => pickMission(m)}
                  aria-pressed={mission?.id === m.id}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <form className="form" onSubmit={submit}>
              <div className="field">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={setField('name')}
                  placeholder="Your name"
                  required
                  autoComplete="name"
                />
              </div>

              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={setField('email')}
                  placeholder="you@company.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="field">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={setField('message')}
                  placeholder="What are you building?"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn--solid btn--full"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'Sending…' : 'Send the request'}
              </button>

              <p className="form__status" data-state={status} aria-live="polite">
                {STATUS_TEXT[status]}
              </p>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Response;
