import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useRotatingIndex } from '../../hooks/useRotatingIndex';

/** The whole swap. The exit and the entrance share it, so nothing overlaps. */
const SWAP_MS = 1400;

/** When the leaving word is gone and the arriving one takes its place. The tail
 * is fully out of its clip by then, which is the point: the line only reflows
 * while the tail is invisible, so it never jumps in front of the reader. */
const OUT_MS = 800;

/** How long one character takes to fade once its turn comes. */
const CHAR_MS = 320;

/**
 * Spreads the characters of the leaving word across the exit window, so a short
 * word and a long one both finish dissolving exactly when the line reflows.
 */
const stagger = (index: number, length: number) =>
  Math.round((index * (OUT_MS - CHAR_MS)) / Math.max(1, length - 1));

interface RoleSwapProps {
  roles: readonly string[];
  tail: string;
  intervalMs?: number;
}

/**
 * The hero's role: one word that changes, one that does not.
 *
 * A swap runs in two halves on one clock. For the first 800ms the word on the
 * line is still the old one, dissolving left to right a character at a time,
 * while the tail after it dips out of its own clip. That is why the line holds
 * the old width for the whole exit: the tail cannot move until it is gone.
 * At 800ms the arriving word takes the line, the reflow happens behind the
 * hidden tail, and both halves come back together: the word fades up out of
 * nothing, with no direction to it, and the tail rises into place.
 */
const RoleSwap = ({ roles, tail, intervalMs = 4200 }: RoleSwapProps) => {
  const active = useRotatingIndex(roles.length, intervalMs);
  const [shown, setShown] = useState(roles[0]);
  const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('idle');
  const previous = useRef(roles[0]);

  useEffect(() => {
    const word = roles[active];
    if (word === previous.current) return;
    previous.current = word;

    setPhase('out');

    const swap = window.setTimeout(() => {
      setShown(word);
      setPhase('in');
    }, OUT_MS);
    const rest = window.setTimeout(() => setPhase('idle'), SWAP_MS);

    return () => {
      window.clearTimeout(swap);
      window.clearTimeout(rest);
    };
  }, [active, roles]);

  const wordClass =
    phase === 'out' ? 'role__word is-leaving' : phase === 'in' ? 'role__word is-arriving' : 'role__word';

  return (
    <span className="role">
      <span className="role__accent" aria-hidden="true">
        <span className={wordClass} key={shown}>
          {[...shown].map((char, i) => (
            <span
              className="role__char"
              key={i}
              style={
                phase === 'out'
                  ? ({ animationDelay: `${stagger(i, shown.length)}ms` } as CSSProperties)
                  : undefined
              }
            >
              {char}
            </span>
          ))}
        </span>
      </span>

      <span className="role__tail" aria-hidden="true">
        <span className={phase === 'idle' ? 'role__tail-in' : 'role__tail-in is-dipping'}>{tail}</span>
      </span>

      <span className="sr-only">
        {roles[active]} {tail}
      </span>
    </span>
  );
};

export default RoleSwap;
