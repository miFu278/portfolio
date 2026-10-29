import { useEffect, useState } from 'react';

const MIN_MS = 400;
const MAX_MS = 2500;

/**
 * Real loading progress, not a simulated one.
 * Weighted: fonts 40, the hero portrait 40, window load 20.
 * Always releases — a stuck loader is worse than no loader.
 */
export const useLoadProgress = (portraitSrc?: string): { progress: number; done: boolean } => {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const started = performance.now();
    moveTo(0);

    function moveTo(value: number) {
      if (cancelled) return;
      setProgress((prev) => Math.max(prev, Math.min(100, Math.round(value))));
    }

    const fontsReady = document.fonts?.ready.then(() => moveTo(40)) ?? Promise.resolve();

    const imageReady = new Promise<void>((resolve) => {
      if (!portraitSrc) return resolve();
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = portraitSrc;
    }).then(() => moveTo(80));

    const windowReady = new Promise<void>((resolve) => {
      if (document.readyState === 'complete') return resolve();
      window.addEventListener('load', () => resolve(), { once: true });
    }).then(() => moveTo(100));

    const hardStop = window.setTimeout(() => moveTo(100), MAX_MS);

    Promise.all([fontsReady, imageReady, windowReady]).then(() => {
      const elapsed = performance.now() - started;
      window.setTimeout(
        () => {
          if (cancelled) return;
          moveTo(100);
          setDone(true);
        },
        Math.max(0, MIN_MS - elapsed),
      );
    });

    return () => {
      cancelled = true;
      window.clearTimeout(hardStop);
    };
  }, [portraitSrc]);

  return { progress, done };
};
