interface LoaderProps {
  progress: number;
  done: boolean;
}

const WORD_FOR = (p: number) =>
  p < 40 ? 'ESTABLISHING CONNECTION' : p < 80 ? 'NEGOTIATING' : 'READY';

/**
 * Real progress only. The previous build advanced this with a random number
 * every 150ms, which is the first thing a technical reader notices.
 */
const Loader = ({ progress, done }: LoaderProps) => (
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

export default Loader;
