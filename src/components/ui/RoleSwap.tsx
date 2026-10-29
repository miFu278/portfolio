import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useRotatingIndex } from '../../hooks/useRotatingIndex';

/** How long the word that is leaving stays in the DOM while it dissolves. */
const EXIT_MS = 620;

/** How long the tail stays out of its clip before snapping back. */
const DIP_MS = 400;

interface RoleSwapProps {
  roles: readonly string[];
  tail: string;
  intervalMs?: number;
}

/**
 * The hero's role: one word that changes, one that does not.
 *
 * Only the leaving animates. The word that goes dissolves left to right, one
 * character at a time, and the word that comes stays behind it rather than
 * appearing on top, so the new word is legible the instant it is there. The tail
 * after it dips out of its own clip, then snaps back when the next word has
 * landed: an exit with a hard return, because a return animation would drag the
 * line back into place a beat after the reader has already read it.
 */
const RoleSwap = ({ roles, tail, intervalMs = 4200 }: RoleSwapProps) => {
  const active = useRotatingIndex(roles.length, intervalMs);
  const [leaving, setLeaving] = useState<{ word: string; key: number } | null>(null);
  const [dipping, setDipping] = useState(false);
  const previous = useRef(roles[0]);

  useEffect(() => {
    const word = roles[active];
    if (word === previous.current) return;

    setLeaving({ word: previous.current, key: Date.now() });
    setDipping(true);
    previous.current = word;

    const exit = window.setTimeout(() => setLeaving(null), EXIT_MS);
    const dip = window.setTimeout(() => setDipping(false), DIP_MS);
    return () => {
      window.clearTimeout(exit);
      window.clearTimeout(dip);
    };
  }, [active, roles]);

  const word = roles[active];

  return (
    <span className="role">
      <span className="role__accent" aria-hidden="true">
        {leaving && (
          <span className="role__word role__word--out" key={leaving.key}>
            {[...leaving.word].map((char, i) => (
              <span className="role__char" key={i} style={{ '--i': i } as CSSProperties}>
                {char}
              </span>
            ))}
          </span>
        )}
        <span className="role__word">
          {[...word].map((char, i) => (
            <span className="role__char" key={i}>
              {char}
            </span>
          ))}
        </span>
      </span>

      <span className="role__tail" aria-hidden="true">
        <span className={dipping ? 'role__tail-in is-dipping' : 'role__tail-in'}>{tail}</span>
      </span>

      <span className="sr-only">
        {word} {tail}
      </span>
    </span>
  );
};

export default RoleSwap;
