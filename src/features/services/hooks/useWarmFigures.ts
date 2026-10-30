import { useEffect, useRef, useState } from 'react';

/**
 * Whether the chapter is close enough that its figures should already be on
 * their way.
 *
 * Below 1024px the projects are one vertical list and the browser's own lazy
 * loading does the right thing, starting each raster about a viewport out. At
 * 1024px and up the same figures live in a flex track carried sideways by a
 * transform, and lazy loading measures distance in transformed coordinates — the
 * slides that are still off to the right are not near anything, so nothing is
 * fetched until the travel has already begun.
 *
 * One viewport of warning is enough on any connection: the whole set is under
 * 130KB now, and the fetch is issued at low priority so it cannot displace
 * anything the reader is waiting on.
 */
export const useWarmFigures = (rootMargin = '100% 0px') => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [warm, setWarm] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || warm) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setWarm(true);
        observer.disconnect();
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, warm]);

  return { ref, warm };
};
