import { useEffect, useState } from 'react';
import { CHAPTERS, PROFILE, chapter } from '../../config/content';
import { useActiveSection } from '../../hooks/useActiveSection';
import { useClock } from '../../hooks/useClock';

const IDS = CHAPTERS.map((c) => c.id);

const Header = () => {
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const active = useActiveSection(IDS);
  const current = chapter(active);
  const clock = useClock(7);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="header" data-stuck={stuck}>
      <div className="shell header__inner">
        <a className="header__brand" href={`#${IDS[0]}`} onClick={() => setOpen(false)}>
          {PROFILE.alias}
          <b>_</b>
        </a>

        <nav className="header__nav" aria-label="Chapters">
          {CHAPTERS.map((c) => (
            <a key={c.id} href={`#${c.id}`} data-active={active === c.id}>
              {c.label.toLowerCase()}
            </a>
          ))}
        </nav>

        <p className="header__meta">
          <i className="dot" aria-hidden="true" />
          {clock} {PROFILE.timezone}
        </p>

        {/* Below the nav breakpoint nothing else says where you are: the rail
            lives in the desktop margin and the chapter menu is closed. */}
        <span key={current.id} className="header__now" aria-hidden="true">
          <b>{current.numeral}</b>
          {current.label}
        </span>

        <button
          type="button"
          className="header__burger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>

      {open && (
        <div className="header__menu">
          {CHAPTERS.map((c) => (
            <a key={c.id} href={`#${c.id}`} onClick={() => setOpen(false)}>
              <span>{c.numeral}</span>
              {c.label.toLowerCase()}
            </a>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
