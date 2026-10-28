import { useEffect, useState } from 'react';

const ScrollProgress = () => {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      // Guard: a short viewport can make `total` zero, which used to produce NaN%.
      setPct(total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return <div className="progress" style={{ width: `${pct}%` }} aria-hidden="true" />;
};

export default ScrollProgress;
