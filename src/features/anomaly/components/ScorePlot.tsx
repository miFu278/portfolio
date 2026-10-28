/**
 * Static figure, not an animation. It is meant to read like a plot lifted from
 * the paper: two score distributions and one threshold. Only the threshold
 * line draws itself, once.
 */
const ScorePlot = () => {
  // A Gaussian bump, sampled coarsely — enough to read as a distribution.
  const curve = (mean: number, sd: number, scale: number) => {
    const points: string[] = [];
    for (let x = 0; x <= 100; x += 2) {
      const y = Math.exp(-0.5 * ((x - mean) / sd) ** 2) * scale;
      points.push(`${x},${(100 - y).toFixed(2)}`);
    }
    return points.join(' ');
  };

  return (
    <svg viewBox="0 0 100 100" role="img" aria-label="Score distributions for in-distribution and out-of-distribution inputs, with a decision threshold">
      <defs>
        <linearGradient id="idFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* baseline */}
      <line x1="0" y1="100" x2="100" y2="100" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.4" />
      {/* gridlines, deliberately faint */}
      {[25, 50, 75].map((y) => (
        <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="currentColor" strokeOpacity="0.08" strokeWidth="0.3" />
      ))}

      {/* in-distribution */}
      <polygon points={`0,100 ${curve(30, 11, 78)} 100,100`} fill="url(#idFill)" />
      <polyline points={curve(30, 11, 78)} fill="none" stroke="currentColor" strokeOpacity="0.75" strokeWidth="0.7" />

      {/* out-of-distribution */}
      <polygon points={`0,100 ${curve(76, 12, 46)} 100,100`} fill="url(#idFill)" opacity="0.6" />
      <polyline
        points={curve(76, 12, 46)}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="0.7"
        strokeDasharray="2 1.5"
      />

      {/* threshold */}
      <line className="plot-threshold" x1="58" y1="0" x2="58" y2="100" stroke="var(--signal)" strokeWidth="0.6" />
      <text x="59.5" y="8" fontSize="3.6" fill="var(--signal)" fontFamily="var(--font-mono)">
        threshold
      </text>

      <text x="16" y="95" fontSize="3.4" fill="currentColor" fillOpacity="0.65" fontFamily="var(--font-mono)">
        in-distribution
      </text>
      <text x="64" y="95" fontSize="3.4" fill="currentColor" fillOpacity="0.65" fontFamily="var(--font-mono)">
        OOD
      </text>
    </svg>
  );
};

export default ScorePlot;
