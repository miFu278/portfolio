import { useEffect, useRef, useState } from 'react';

/**
 * Tracks which project block is most visible, so the sticky registry can
 * highlight only the technologies that project actually uses. This is the
 * scroll-linked stack: the panel is the map, the page is the territory.
 *
 * The ratios of every block are kept, not just the ones the callback happened to
 * carry: an observer reports the targets that *changed*, so choosing the best of
 * one callback's entries leaves the previous block winning whenever the new one
 * crosses no threshold. That showed up as the registry highlighting the second
 * project while the third was on screen.
 */
export const useActiveProject = (ids: string[]) => {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);
  const refs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const elements = ids
      .map((id) => refs.current[id])
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const ratios = new Map<Element, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        let best: Element | null = null;
        let highest = 0;
        for (const [element, ratio] of ratios) {
          if (ratio > highest) {
            highest = ratio;
            best = element;
          }
        }

        if (best) setActiveId((best as HTMLElement).id);
      },
      { threshold: [0, 0.25, 0.5, 0.75], rootMargin: '-25% 0px -25% 0px' },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  const register = (id: string) => (el: HTMLElement | null) => {
    refs.current[id] = el;
  };

  return { activeId, register };
};
