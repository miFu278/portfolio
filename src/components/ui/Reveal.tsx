import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { cn } from '../../utils/cn';
import { splitLines, CHAR_STEP, type SplitMode } from '../../utils/splitLines';

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  /** Stagger in ms. */
  delay?: number;
  /** How the text is broken up for its entrance. Omit for a plain fade. */
  split?: SplitMode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Entrance-once reveal. Deliberately does not reverse on scroll-up: content
 * that disappears when you scroll back is worse than no animation at all.
 * Content is always in the DOM and fully readable with reduced motion.
 *
 * With a `split` the entrance works on the text itself rather than on the block,
 * and the block is broken up again on resize and once the webfont lands, because
 * both move where the text breaks.
 */
const Reveal = ({
  children,
  as: Tag = 'div',
  delay = 0,
  split,
  className,
  style,
}: RevealProps) => {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setShown(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  useEffect(() => {
    if (!split || reduced) return;

    const el = ref.current;
    if (!el) return;

    let restore = splitLines(el, split);
    let width = el.getBoundingClientRect().width;
    let frame = 0;

    const resplit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = el.getBoundingClientRect().width;
        if (Math.abs(next - width) < 1) return;
        width = next;
        restore();
        restore = splitLines(el, split);
      });
    };

    // A webfont swap changes every line break, and it lands after first paint.
    void document.fonts.ready.then(() => {
      restore();
      restore = splitLines(el, split);
    });

    const observer = new ResizeObserver(resplit);
    observer.observe(el);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      restore();
    };
  }, [split, reduced]);

  // The caret follows the character being typed. The schedule can place it in
  // time but not in the text, so one frame loop moves it along, and it comes to
  // rest after the last character where it retires on its own.
  useEffect(() => {
    if (split !== 'type' || reduced || !shown) return;

    const el = ref.current;
    const caret = el?.querySelector<HTMLElement>('.type-caret');
    if (!el || !caret) return;

    const glyphs = [...el.querySelectorAll<HTMLElement>('.line__c')].filter(
      (glyph) => glyph !== caret,
    );
    if (glyphs.length === 0) return;

    const started = performance.now();
    let frame = 0;

    const step = () => {
      const elapsed = performance.now() - started;
      const at = glyphs[Math.min(glyphs.length - 1, Math.floor(elapsed / CHAR_STEP))];
      if (at.nextSibling !== caret) at.after(caret);
      if (elapsed < glyphs.length * CHAR_STEP + 60) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame);
  }, [split, reduced, shown]);

  return (
    <Tag
      ref={ref}
      className={cn('reveal', className)}
      data-shown={shown}
      data-split={split}
      style={{ ...style, '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
