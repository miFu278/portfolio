import { useEffect, useRef, useState } from 'react';

/**
 * Tracks which project block is most visible, so the sticky registry can
 * highlight only the technologies that project actually uses. This is the
 * scroll-linked stack: the panel is the map, the page is the territory.
 */
export const useActiveProject = (ids: string[]) => {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);
  const refs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
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
  }, [ids]);

  const register = (id: string) => (el: HTMLElement | null) => {
    refs.current[id] = el;
  };

  return { activeId, register };
};
