import { useEffect, useState } from 'react';
import { CHAPTERS, PROFILE, chapter } from '../../config/content';
import { useActiveSection } from '../../hooks/useActiveSection';
import { useClock } from '../../hooks/useClock';

const IDS = CHAPTERS.map((c) => c.id);

const Header = () => {
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [hidden, setHidden] = useState(false);
  const active = useActiveSection(IDS);
  const current = chapter(active);
  const clock = useClock(7);

  // The bar is part of the sky, so it has no surface to hide behind: instead it
  // gets out of the way. It leaves on the way down, where the reader is going
  // somewhere and the chapter rail and the readout already say where, and comes
  // back on the way up, which is the gesture that means "take me back".
  useEffect(() => {
    let last = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      setStuck(y > 80);
      setHidden(y > 120 && y > last);
      last = y;
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // A keyboard reader tabbing into the menu must never land on a control that
  // has been translated off the top of the screen.
  const reveal = () => setHidden(false);

  return (
    <header className="header" data-stuck={stuck} data-hidden={hidden} onFocus={reveal}>
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
