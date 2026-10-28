import { CHAPTERS, PROFILE } from '../../../config/content';
import { UI_VARIANTS } from '../../../config/ui';
import type { UIVariant } from '../../../types';
import { useClock } from '../../../hooks/useClock';
import Reveal from '../../../components/ui/Reveal';
import TopologyCanvas from '../../../components/layout/TopologyCanvas';
import portrait from '../../../assets/mp.jpg';
import resumePdf from '../../../assets/ttmp_cv.pdf';

const HERO = CHAPTERS[0];

const Hero = ({ variant }: { variant: UIVariant }) => {
  const clock = useClock(7);

  return (
    <section id={HERO.id} className="hero">
      {UI_VARIANTS[variant].canvas && <TopologyCanvas />}

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
              <a className="btn btn--solid" href={`#${CHAPTERS[2].id}`}>
                Follow the request ↓
              </a>
              <a className="btn btn--ghost" href="#response">
                Send a request
              </a>
              <a
                className="btn btn--quiet"
                href={resumePdf}
                target="_blank"
                rel="noopener noreferrer"
              >
                Résumé ↗
              </a>
            </Reveal>
          </div>

          <Reveal delay={320} className="hero__portrait">
            <img src={portrait} alt={`${PROFILE.name}`} width={168} height={168} />
          </Reveal>
        </div>

        <div className="hero__foot">
          <span className="label">{PROFILE.location}</span>
          <span className="label">
            {clock} {PROFILE.timezone}
          </span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
