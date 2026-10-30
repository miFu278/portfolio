import { useCallback, useEffect, useRef, useState } from 'react';

interface LightboxProps {
  open: boolean;
  /** Absent while closed: with no `src` the element holds no box and asks for nothing. */
  figure: LightboxFigure | null;
  /** The card figure that opened it, in viewport coordinates. */
  from?: DOMRect | null;
  onClose: () => void;
}

export interface LightboxFigure {
  /** The raster shown when the browser decodes none of `sources`. */
  src: string;
  /** Format ladder, most efficient first, exactly as the card carries it. */
  sources?: LightboxSource[];
  alt: string;
  /** The raster's real pixel size: it reserves the box before the bytes land,
   *  which is what the flip has to measure. */
  width: number;
  height: number;
}

export interface LightboxSource {
  type: string;
  /** The `srcset` attribute as written in markup: one URL or a descriptor list. */
  srcSet: string;
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
const Lightbox = ({ open, figure, from = null, onClose }: LightboxProps) => {
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

  // The figure the reader clicked expands into the viewer rather than the sheet
  // appearing over it: the raster is placed back on the card's rect for one
  // frame, then released, and the transition carries it to its own box.
  useEffect(() => {
    if (!open || !from) return;
    const el = dialogRef.current;
    const img = el?.querySelector('img');
    if (!el || !img) return;

    const frame = requestAnimationFrame(() => {
      const box = img.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) return;

      const scale = from.width / box.width;
      const dx = from.left + from.width / 2 - (box.left + box.width / 2);
      const dy = from.top + from.height / 2 - (box.top + box.height / 2);

      img.dataset.flip = 'true';
      img.style.transition = 'none';
      img.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${scale.toFixed(3)})`;
      void img.offsetWidth;
      img.style.transition = 'transform 420ms var(--ease-out)';
      img.style.transform = '';

      const end = () => {
        delete img.dataset.flip;
        img.style.transition = '';
        img.removeEventListener('transitionend', end);
      };
      img.addEventListener('transitionend', end);
    });

    return () => cancelAnimationFrame(frame);
  }, [open, from]);

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
      aria-label={figure?.alt ?? ''}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="lightbox__bar">
        <span className="label">{figure?.alt ?? ''}</span>
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
        <picture>
          {figure?.sources?.map((source) => (
            <source key={source.type} type={source.type} srcSet={source.srcSet} />
          ))}
          <img
            src={figure?.src || undefined}
            width={figure?.width}
            height={figure?.height}
            alt={figure?.alt ?? ''}
            draggable={false}
            style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})` }}
          />
        </picture>
      </div>
    </dialog>
  );
};

export default Lightbox;
