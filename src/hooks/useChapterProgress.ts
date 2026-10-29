import { useEffect, useRef } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Where the request sits on the chapter rail, continuously.
 *
 * The highlighted marker answers "which chapter am I in" — a discrete
 * question. This answers the other half: "how far along the path am I". The
 * six chapters are one path, not six links, so the packet travels between
 * markers instead of jumping between them.
 *
 * Position is piecewise-linear between chapter anchors. A chapter's anchor is
 * the scroll offset at which its top reaches the middle of the viewport, so
 * the packet never arrives at a chapter before that chapter's heading has.
 * The write is a single custom property that the dot consumes as a transform,
 * so no scroll frame touches layout.
 *
 * Skipped outright under reduced motion: the active marker already carries
 * the position, and the packet is decoration on top of it.
 */
export const useChapterProgress = (ids: string[]) => {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const rail = ref.current;
    if (!rail || reduced) return;

    const links = Array.from(rail.querySelectorAll<HTMLElement>(':scope > a'));
    if (links.length === 0) return;

    let anchors: number[] = [];
    let marks: number[] = [];
    let frame = 0;

    const measure = () => {
      const mid = window.innerHeight * 0.5;
      anchors = ids.map((id) => {
        const el = document.getElementById(id);
        if (!el) return Number.POSITIVE_INFINITY;
        return Math.max(0, el.getBoundingClientRect().top + window.scrollY - mid);
      });
      marks = links.map((link) => link.offsetTop + link.offsetHeight / 2);
    };

    const place = () => {
      const count = Math.min(anchors.length, marks.length);
      if (count === 0) return;

      const y = window.scrollY;
      let value = marks[0];

      if (y >= anchors[count - 1]) {
        value = marks[count - 1];
      } else {
        for (let i = 0; i < count - 1; i += 1) {
          // Above this anchor: the packet is still on the previous marker.
          if (y < anchors[i]) break;
          if (y < anchors[i + 1]) {
            const span = anchors[i + 1] - anchors[i];
            const t = span > 0 ? (y - anchors[i]) / span : 1;
            value = marks[i] + (marks[i + 1] - marks[i]) * t;
            break;
          }
        }
      }

      rail.style.setProperty('--rail-y', `${value.toFixed(2)}px`);
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        place();
      });
    };

    const remeasure = () => {
      measure();
      place();
    };

    remeasure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', remeasure);

    // Anything that changes the document height moves every chapter offset
    // below it: a raster that decodes late, a webfont that swaps, a viewport
    // that reflows.
    const observer = new ResizeObserver(remeasure);
    observer.observe(document.body);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', remeasure);
      observer.disconnect();
    };
  }, [ids, reduced]);

  return ref;
};
