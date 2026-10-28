import { useEffect, useRef, useState } from 'react';

/**
 * Tracks which project block is most visible, so the sticky registry can
 * highlight only the technologies that project actually uses.
 */
export const useActiveProject = (ids: string[], enabled: boolean) => {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);
  const refs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!enabled) return;

    const elements = ids
      .map((id) => refs.current[id])
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!best) return;
        setActiveId(best.target.id);
      },
      { threshold: [0.25, 0.5, 0.75], rootMargin: '-25% 0px -25% 0px' },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids, enabled]);

  const register = (id: string) => (el: HTMLElement | null) => {
    refs.current[id] = el;
  };

  return { activeId, register };
};
