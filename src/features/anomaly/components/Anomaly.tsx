import { CHAPTERS, RESEARCH } from '../../../config/content';
import ChapterHead from '../../../components/ui/ChapterHead';
import Reveal from '../../../components/ui/Reveal';
import ScorePlot from './ScorePlot';

const ANOMALY = CHAPTERS[3];

const Anomaly = () => (
  <section id={ANOMALY.id} className="chapter">
    <div className="shell">
      <ChapterHead id={ANOMALY.id} lead={RESEARCH.lead} />

      <div className="anomaly__grid">
        <div>
          <Reveal as="p" className="body">
            {RESEARCH.body}
          </Reveal>

          <Reveal as="p" delay={80} className="anomaly__paper" style={{ marginTop: '2rem' }}>
            {RESEARCH.status}
          </Reveal>

          <Reveal as="dl" delay={140} className="anomaly__facts">
            {RESEARCH.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </Reveal>
        </div>

        <Reveal as="figure" delay={120} className="anomaly__plot">
          <ScorePlot />
          <figcaption>
            Latent surprise, in-distribution vs out-of-distribution · 10 paired seeds
          </figcaption>
        </Reveal>
      </div>
    </div>
  </section>
);

export default Anomaly;
