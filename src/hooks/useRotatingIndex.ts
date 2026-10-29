import { useEffect, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Cycles an index from 0 to `length - 1`, one step every `ms`.
 *
 * Stops under reduced motion, where the first item is the whole story. A step
 * every few seconds is slow enough that state is the right place for it: this is
 * not a per-frame signal.
 */
export const useRotatingIndex = (length: number, ms: number): number => {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced || length <= 1) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % length), ms);
    return () => window.clearInterval(timer);
  }, [length, ms, reduced]);

  return index;
};
