import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const LERP = 0.2;
const PULL = 8;

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * The pointer layer: a ring that trails the cursor and takes the shape of what
 * it is over, and a magnetic pull on the calls to action that ask for it.
 *
 * It only mounts where a pointer really hovers, and it only hides the native
 * cursor once the page has finished loading. Every path out of here leaves the
 * page with the cursor it shipped with: reduced motion, a touch screen, a
 * dialog that needs a real cursor, or a script that never ran.
 */
const Cursor = () => {
  const ringRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const ring = ringRef.current;
    if (!ring) return;

    const root = document.documentElement;
    let aimX = 0;
    let aimY = 0;
    let x = 0;
    let y = 0;
    let placed = false;
    let frame = 0;

    const draw = () => {
      x += (aimX - x) * LERP;
      y += (aimY - y) * LERP;
      ring.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      aimX = event.clientX;
      aimY = event.clientY;
      if (!placed) {
        x = aimX;
        y = aimY;
        placed = true;
      }
      // Nothing to trail while a full-screen sheet is up.
      if (root.dataset.loaded === 'true') root.dataset.cursor = 'on';
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      const hit = target?.closest<HTMLElement>('a, button, [data-cursor]');
      if (!hit) {
        delete ring.dataset.shape;
        return;
      }
      ring.dataset.shape = hit.dataset.cursor ?? 'link';
    };

    const onLeave = () => {
      delete ring.dataset.shape;
      delete root.dataset.cursor;
    };

    // The rect is taken before the pull moves the button, otherwise the element
    // chases its own centre and the pull oscillates.
    const magnets = [...document.querySelectorAll<HTMLElement>('[data-magnetic]')].map((el) => {
      let base: Rect | null = null;

      const measure = () => {
        el.style.transform = '';
        base = el.getBoundingClientRect();
      };

      const move = (event: PointerEvent) => {
        if (!base) measure();
        if (!base) return;
        const dx = (event.clientX - (base.left + base.width / 2)) / (base.width / 2 || 1);
        const dy = (event.clientY - (base.top + base.height / 2)) / (base.height / 2 || 1);
        el.style.transform = `translate3d(${(dx * PULL).toFixed(2)}px, ${(dy * PULL).toFixed(2)}px, 0)`;
      };

      const leave = () => {
        base = null;
        el.style.transform = '';
      };

      el.addEventListener('pointerenter', measure);
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', leave);

      return () => {
        el.removeEventListener('pointerenter', measure);
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerleave', leave);
        el.style.transform = '';
      };
    });

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerleave', onLeave);
      magnets.forEach((off) => off());
      delete root.dataset.cursor;
    };
  }, [reduced]);

  return (
    <div ref={ringRef} className="cursor" aria-hidden="true">
      <i />
    </div>
  );
};

export default Cursor;
