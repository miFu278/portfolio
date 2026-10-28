import ChapterHead from '../../../components/ui/ChapterHead';
import Reveal from '../../../components/ui/Reveal';
import { CHAPTERS } from '../../../config/content';

const GATEWAY = CHAPTERS[1];

const MANIFESTO = ['Correctness first.', 'Then latency.', 'Then everything else.'];

const ROUTES = [
  {
    path: 'ROUTE 01 · /backend',
    title: 'Backend Engineering',
    body: 'Event-driven services, transactional boundaries that hold under concurrency, caches that do not lie. Built to be read by someone else at 3 a.m.',
  },
  {
    path: 'ROUTE 02 · /research',
    title: 'Applied AI Research',
    body: 'Out-of-distribution detection with JEPA world models. Whether a model can tell you what it does not know.',
  },
];

const Gateway = () => (
  <section id={GATEWAY.id} className="chapter">
    <div className="shell">
      <ChapterHead
        id={GATEWAY.id}
        lead="A gateway is where a system decides what it will and will not accept. Auth, rate limits, routing, rejection. Mine works the same way."
      />

      <div className="gateway__grid">
        <Reveal as="div">
          <p className="body">
            I am a Software Engineering student at FPT University and a backend engineer focused on
            reliable services, thoughtful data models and clear system boundaries. I like turning
            ambiguous requirements into maintainable APIs, and I stay until the failure modes are
            boring.
          </p>
        </Reveal>

        <Reveal as="ol" delay={120} className="gateway__manifesto">
          {MANIFESTO.map((line, i) => (
            <li key={line}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <span>{line}</span>
            </li>
          ))}
        </Reveal>
      </div>

      <div className="gateway__routes">
        {ROUTES.map((route, i) => (
          <Reveal key={route.path} delay={i * 100} className="route">
            <p className="route__path">{route.path}</p>
            <h3>{route.title}</h3>
            <p className="body">{route.body}</p>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default Gateway;
