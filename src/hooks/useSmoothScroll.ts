import { useEffect } from 'react';
import Lenis from 'lenis';
import { useReducedMotion } from './useReducedMotion';
import { scrollVelocity } from '../lib/scrollVelocity';

/** Largest shear the velocity layer may apply, in degrees. */
const SKEW_MAX = 2;

/**
 * Inertial scrolling, and the two things that need to know the page's speed.
 *
 * Lenis lerps the native scroll position instead of replacing it, so the
 * scrollbar, the keyboard, `window.scrollY`, and every anchor measurement keep
 * working: nothing here takes the scroll away from the browser, it only eases
 * it. The velocity it produces is published to `scrollVelocity` and, as one
 * custom property on the root, to the velocity layer in CSS.
 *
 * Skipped outright under reduced motion. Nothing else in the page depends on
 * this hook running: it is an easing, not a source of content.
 */
export const useSmoothScroll = () => {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const root = document.documentElement;
    // Lenis owns the easing now. The CSS rule would ease every programmatic
    // scroll a second time, and two easings on one scroll fight.
    const cssBehaviour = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';

    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });

    let frame = 0;
    let eased = 0;
    let published = 0;
    let last = 0;

    const raf = (time: number) => {
      lenis.raf(time);

      // Speed is measured here as pixels moved per frame rather than read from
      // Lenis's own velocity, whose unit is internal and unrelated to a pixel
      // step. Measured on this page, an eased scroll peaks near 42px per frame,
      // so 30 puts a normal wheel at most of the shear and a fling at the clamp.
      const y = lenis.animatedScroll;
      const step = y - last;
      last = y;
      eased += (step - eased) * 0.25;

      const value = Math.max(-1, Math.min(1, eased / 30));
      scrollVelocity.value = value;

      const skew = +(value * SKEW_MAX).toFixed(3);
      if (skew !== published) {
        published = skew;
        root.style.setProperty('--scroll-skew', `${skew}deg`);
      }

      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    // A fragment link would jump: the browser sets the scroll position, Lenis
    // corrects it back on the next frame. Route it through Lenis instead, and
    // keep the URL and the focus behaviour a fragment link is supposed to have.
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.('a[href^="#"]');
      const id = anchor?.getAttribute('href')?.slice(1);
      if (!id) return;

      const target = document.getElementById(id);
      if (!target) return;

      event.preventDefault();
      lenis.scrollTo(target, { duration: 1.2 });
      history.replaceState(null, '', `#${id}`);
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    };

    document.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('click', onClick);
      lenis.destroy();
      root.style.scrollBehavior = cssBehaviour;
      root.style.removeProperty('--scroll-skew');
      scrollVelocity.value = 0;
    };
  }, [reduced]);
};
