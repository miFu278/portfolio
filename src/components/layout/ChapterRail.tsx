import { CHAPTERS } from '../../config/content';
import { useActiveSection } from '../../hooks/useActiveSection';
import { useChapterProgress } from '../../hooks/useChapterProgress';

const IDS = CHAPTERS.map((c) => c.id);

/**
 * Fixed chapter rail. Hidden below 1360px: at 1440 the content column already
 * reaches the viewport edges, and a rail that overlaps the headline is worse
 * than no rail. Labels expand on hover rather than sitting open, so the rail
 * stays inside the margin.
 *
 * The spine and the packet make it a path: the request enters at chapter 01
 * and travels to 06 as you scroll, which is what the page says it is doing.
 */
const ChapterRail = () => {
  const active = useActiveSection(IDS);
  const ref = useChapterProgress(IDS);

  return (
    <nav ref={ref} className="rail" aria-label="Chapter rail">
      {CHAPTERS.map((c) => (
        <a key={c.id} href={`#${c.id}`} data-active={active === c.id} title={c.label}>
          <i aria-hidden="true" />
          <b>{c.numeral}</b>
          <span>{c.label}</span>
        </a>
      ))}
      <i className="rail__packet" aria-hidden="true" />
    </nav>
  );
};

export default ChapterRail;
