import { CHAPTERS, EXPERIENCE } from '../../../config/content';
import ChapterHead from '../../../components/ui/ChapterHead';
import Reveal from '../../../components/ui/Reveal';

const OBSERVABILITY = CHAPTERS[4];

const Observability = () => (
  <section id={OBSERVABILITY.id} className="chapter">
    <div className="shell">
      <ChapterHead
        id={OBSERVABILITY.id}
        lead="A resume says what a role was called. A trace says what actually happened."
      />

      {EXPERIENCE.map((entry) => (
        <div className="trace" key={entry.company}>
          <Reveal className="trace__row trace__row--head">
            <span className="trace__time">{entry.start}</span>
            <span className="trace__verb">BEGIN</span>
            <span>
              {entry.role} · {entry.company} · {entry.location}
            </span>
          </Reveal>

          {entry.bullets.map((bullet, i) => (
            <Reveal key={bullet} delay={80 + i * 60} className="trace__row">
              <span className="trace__time" aria-hidden="true">
                │
              </span>
              <span className="trace__verb">DID</span>
              <span className="trace__text">{bullet}</span>
            </Reveal>
          ))}

          <Reveal delay={260} className="trace__row">
            <span className="trace__time">{entry.end}</span>
            <span className="trace__verb">END</span>
            <span className="trace__text">completed</span>
          </Reveal>
        </div>
      ))}
    </div>
  </section>
);

export default Observability;
