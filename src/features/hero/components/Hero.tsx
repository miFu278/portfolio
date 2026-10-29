import { PROFILE, chapter } from '../../../config/content';
import { useClock } from '../../../hooks/useClock';
import Reveal from '../../../components/ui/Reveal';
import TopologyCanvas from '../../../components/layout/TopologyCanvas';
import portrait from '../../../assets/mp-chibi.jpg';
import resumePdf from '../../../assets/ttmp_cv.pdf';

const HERO = chapter('ingress');
const GATEWAY = chapter('gateway');
const SERVICES = chapter('services');
const RESPONSE = chapter('response');

const Hero = () => {
  const clock = useClock(7);

  return (
    <section id={HERO.id} className="hero">
      <TopologyCanvas />

      <div className="shell">
        <Reveal className="hero__top">
          <span className="hero__status">
            <i className="dot" aria-hidden="true" />
            {PROFILE.availability}
          </span>
          <span className="label">
            {HERO.numeral} — {HERO.label}
          </span>
        </Reveal>

        <div className="hero__grid">
          <div>
            <Reveal as="h1" className="display-xl">
              {PROFILE.name}
            </Reveal>
            <Reveal as="p" delay={80} className="hero__claim">
              {PROFILE.claim}
            </Reveal>
            <Reveal as="p" delay={160} className="lead hero__lead">
              {PROFILE.lead}
            </Reveal>

            <Reveal delay={240} className="hero__actions">
              <a className="btn btn--solid" href={`#${SERVICES.id}`} data-magnetic>
                Follow the request ↓
              </a>
              <a className="btn btn--ghost" href={`#${RESPONSE.id}`} data-magnetic>
                Send a request
              </a>
              <a
                className="btn btn--quiet"
                href={resumePdf}
                target="_blank"
                rel="noopener noreferrer"
                data-magnetic
              >
                Résumé ↗
              </a>
            </Reveal>
          </div>

          <Reveal delay={320} className="hero__portrait">
            <img src={portrait} alt={PROFILE.name} width={168} height={168} />
          </Reveal>
        </div>

        <div className="hero__foot">
          <span className="label">{PROFILE.location}</span>
          <span className="label">
            {clock} {PROFILE.timezone}
          </span>
        </div>
      </div>

      {/* A full-viewport hero gives no cue that there is a page below it. */}
      <a className="hero__scroll" href={`#${GATEWAY.id}`} aria-label="Scroll to the next chapter">
        <span>scroll</span>
        <i aria-hidden="true" />
      </a>
    </section>
  );
};

export default Hero;
