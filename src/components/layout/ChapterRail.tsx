import { CHAPTERS } from '../../config/content';
import { useActiveSection } from '../../hooks/useActiveSection';

const IDS = CHAPTERS.map((c) => c.id);

/**
 * Fixed chapter rail. Hidden below 1360px: at 1440 the content column already
 * reaches the viewport edges, and a rail that overlaps the headline is worse
 * than no rail. Labels expand on hover rather than sitting open, so the rail
 * stays inside the margin.
 *
 * The spine makes the six markers one path rather than six unrelated dashes.
 */
const ChapterRail = () => {
  const active = useActiveSection(IDS);

  return (
    <nav className="rail" aria-label="Chapter rail">
      {CHAPTERS.map((c) => (
        <a key={c.id} href={`#${c.id}`} data-active={active === c.id} title={c.label}>
          <i aria-hidden="true" />
          <b>{c.numeral}</b>
          <span>{c.label}</span>
        </a>
      ))}
    </nav>
  );
};

export default ChapterRail;
