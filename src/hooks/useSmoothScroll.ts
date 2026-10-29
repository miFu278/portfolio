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

    // lerp, not duration: a duration gives the wheel an easing curve with a
    // long tail, and every scrubbed position on the page then chases that eased
    // value. A fixed fraction per frame tracks the wheel directly, which is what
    // reads as smooth rather than heavy.
    const lenis = new Lenis({ lerp: 0.2, smoothWheel: true });

    let frame = 0;
    let eased = 0;
    let published = 0;
    let last = 0;

    const raf = (time: number) => {
      lenis.raf(time);

      // Speed is measured here as pixels moved per frame rather than read from
      // Lenis's own velocity, whose unit is internal and unrelated to a pixel
      // step. With lerp at 0.2 an eased scroll steps about 26px per frame on a
      // normal wheel tick and over 50 on a fling, so 55 puts a tick below half
      // the shear and reserves the clamp for a fling.
      const y = lenis.animatedScroll;
      const step = y - last;
      last = y;
      eased += (step - eased) * 0.25;

      const value = Math.max(-1, Math.min(1, eased / 55));
      scrollVelocity.value = value;

      const skew = +(value * SKEW_MAX).toFixed(3);
      if (skew !== published) {
        published = skew;
        root.style.setProperty('--scroll-skew', `${skew}deg`);
      }

      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    // Snap. When the wheel stops close to a chapter boundary, finish the move in
    // the direction the reader was already going. It only ever closes a gap of a
    // fifth of a viewport or less, never pulls against the direction of travel,
    // and never fires twice for the same boundary, so a position the reader
    // chose is not taken away from them.
    const SNAP_ROOM = 0.2;
    const SNAP_NEAR = 24;
    const SNAP_DURATION = 0.6;
    let direction = 1;
    let previousY = window.scrollY;
    let settleTimer = 0;
    let snappedTo = -1;

    const snap = () => {
      if (document.querySelector('dialog[open]')) return;

      const y = window.scrollY;
      if (Math.abs(y - snappedTo) < 8) return;

      const tops = [...document.querySelectorAll('main > section[id]')].map(
        (el) => el.getBoundingClientRect().top + y,
      );
      const ahead = tops.filter((top) =>
        direction > 0 ? top > y + SNAP_NEAR : top < y - SNAP_NEAR,
      );
      if (ahead.length === 0) return;

      const target = direction > 0 ? Math.min(...ahead) : Math.max(...ahead);
      if (Math.abs(target - y) > window.innerHeight * SNAP_ROOM) return;

      snappedTo = target;
      lenis.scrollTo(target, { duration: SNAP_DURATION });
    };

    const onScroll = () => {
      const y = window.scrollY;
      if (y > previousY) direction = 1;
      else if (y < previousY) direction = -1;
      previousY = y;

      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(snap, 200);
    };
    lenis.on('scroll', onScroll);

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
      lenis.scrollTo(target, { duration: 0.9 });
      history.replaceState(null, '', `#${id}`);
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    };

    document.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
      document.removeEventListener('click', onClick);
      lenis.destroy();
      root.style.scrollBehavior = cssBehaviour;
      root.style.removeProperty('--scroll-skew');
      scrollVelocity.value = 0;
    };
  }, [reduced]);
};
