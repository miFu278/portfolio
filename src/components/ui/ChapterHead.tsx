import { chapter } from '../../config/content';
import Reveal from './Reveal';

interface ChapterHeadProps {
  /** Chapter id from config/content.ts */
  id: string;
  /** Optional lead paragraph under the title. */
  lead?: string;
}

const ChapterHead = ({ id, lead }: ChapterHeadProps) => {
  const c = chapter(id);

  return (
    <header className="chapter-head">
      <Reveal className="chapter-head__kicker" as="div">
        <i aria-hidden="true" />
        <span className="label">
          {c.numeral} — {c.label}
        </span>
      </Reveal>

      <Reveal as="h2" delay={80} className="display-l chapter-head__title">
        {c.title}
      </Reveal>

      {lead && (
        <Reveal as="p" delay={140} className="lead">
          {lead}
        </Reveal>
      )}
    </header>
  );
};

export default ChapterHead;
