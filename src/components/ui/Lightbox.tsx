import { useCallback, useEffect, useRef, useState } from 'react';

interface LightboxProps {
  open: boolean;
  src: string;
  alt: string;
  onClose: () => void;
}

const MIN = 0.5;
const MAX = 4;
const STEP = 0.25;

const clamp = (v: number) => Math.min(MAX, Math.max(MIN, Math.round(v * 100) / 100));

/**
 * Full-screen viewer for the project figures. The rasters are ~1500px wide shown
 * in a ~680px card, so the labels are unreadable at rest; this is the escape
 * hatch. Built on <dialog> so focus trapping, ::backdrop and Esc come from the
 * platform instead of being re-implemented.
 */
const Lightbox = ({ open, src, alt, onClose }: LightboxProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const reset = useCallback(() => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  }, []);

  const zoom = useCallback((delta: number) => {
    setScale((s) => {
      const next = clamp(s + delta);
      if (next === 1) setPos({ x: 0, y: 0 });
      return next;
    });
  }, []);

  // open/close against the native dialog, and stop the page scrolling behind it
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    if (open && !el.open) {
      reset();
      el.showModal();
      document.body.style.overflow = 'hidden';
    } else if (!open && el.open) {
      el.close();
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open, reset]);

  // wheel zoom, and +/- from the keyboard
  useEffect(() => {
    if (!open) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoom(e.deltaY < 0 ? STEP : -STEP);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') zoom(STEP);
      if (e.key === '-' || e.key === '_') zoom(-STEP);
      if (e.key === '0') reset();
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, zoom, reset]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (scale <= 1) return;
    drag.current = { x: e.clientX, y: e.clientY, ox: pos.x, oy: pos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    setPos({ x: d.ox + (e.clientX - d.x), y: d.oy + (e.clientY - d.y) });
  };

  const endDrag = () => {
    drag.current = null;
  };

  return (
    <dialog
      ref={dialogRef}
      className="lightbox"
      onClose={onClose}
      aria-label={alt}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="lightbox__bar">
        <span className="label">{alt}</span>
        <div className="lightbox__tools">
          <button type="button" onClick={() => zoom(-STEP)} aria-label="Zoom out">
            −
          </button>
          <span className="lightbox__pct">{Math.round(scale * 100)}%</span>
          <button type="button" onClick={() => zoom(STEP)} aria-label="Zoom in">
            +
          </button>
          <button type="button" onClick={reset} aria-label="Reset zoom">
            reset
          </button>
          <button type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
      </div>

      <div
        className="lightbox__stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})` }}
        />
      </div>
    </dialog>
  );
};

export default Lightbox;
