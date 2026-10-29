import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useRotatingIndex } from '../../hooks/useRotatingIndex';

/** How long the word that is leaving stays in the DOM. */
const EXIT_MS = 640;

/** Glyph fragments that fly off on each swap, as if the word broke apart. */
const BITS = ['0', '1', '#', '<', ';', '·'];

interface RoleSwapProps {
  roles: readonly string[];
  tail: string;
  intervalMs?: number;
}

/**
 * The hero's role: one word that changes, one that does not.
 *
 * The changing word is the accent, so it is the one that gets the serif and the
 * colour. It leaves by dissolving left to right, a character at a time, rather
 * than by sliding out of a mask, which is the difference between a word being
 * replaced and a word coming apart. The word after it is set in the page face
 * and simply gets out of the way while that happens: it dips out of its own clip
 * and comes back up, and because it is in normal flow it moves with the width of
 * the word in front of it rather than being pinned to a slot.
 */
const RoleSwap = ({ roles, tail, intervalMs = 3400 }: RoleSwapProps) => {
  const active = useRotatingIndex(roles.length, intervalMs);
  const [leaving, setLeaving] = useState<{ word: string; key: number } | null>(null);
  const previous = useRef(roles[0]);

  useEffect(() => {
    const word = roles[active];
    if (word === previous.current) return;

    setLeaving({ word: previous.current, key: Date.now() });
    previous.current = word;

    const timer = window.setTimeout(() => setLeaving(null), EXIT_MS);
    return () => window.clearTimeout(timer);
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
        <span className="role__word" key={`in-${word}`}>
          {[...word].map((char, i) => (
            <span className="role__char" key={i} style={{ '--i': i } as CSSProperties}>
              {char}
            </span>
          ))}
        </span>
        <span className="role__bits" aria-hidden="true">
          {BITS.map((bit, i) => (
            <span
              className="role__bit"
              key={`${word}-${i}`}
              style={{ '--n': i, '--drift': i % 2 === 0 ? -1 : 1 } as CSSProperties}
            >
              {bit}
            </span>
          ))}
        </span>
      </span>

      <span className="role__tail" aria-hidden="true">
        <span className="role__tail-in" key={`tail-${word}`}>
          {tail}
        </span>
      </span>

      <span className="sr-only">
        {word} {tail}
      </span>
    </span>
  );
};

export default RoleSwap;
