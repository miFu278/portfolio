import { useEffect } from 'react';

interface LoaderProps {
  progress: number;
  done: boolean;
}

const WORD_FOR = (p: number) =>
  p < 40 ? 'ESTABLISHING CONNECTION' : p < 80 ? 'NEGOTIATING' : 'READY';

/**
 * Real progress only. The previous build advanced this with a random number
 * every 150ms, which is the first thing a technical reader notices.
 *
 * When it finishes it hands over: the flag on the root is what tells the pointer
 * layer it may hide the native cursor, and the event is what lets the hero start
 * as the curtain leaves instead of finishing behind it.
 */
const Loader = ({ progress, done }: LoaderProps) => {
  useEffect(() => {
    if (!done) return;
    document.documentElement.dataset.loaded = 'true';
    window.dispatchEvent(new Event('app:loaded'));
  }, [done]);

  return (
    <div className="loader" data-done={done} aria-hidden={done}>
      <p className="loader__word">{WORD_FOR(progress)}</p>
      <div>
        <div className="loader__bar">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="loader__foot">
          <span className="label">miFu · Ho Chi Minh City</span>
          <span className="loader__count">{String(progress).padStart(3, '0')}</span>
        </div>
      </div>
    </div>
  );
};

export default Loader;
