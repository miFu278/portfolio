import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { cn } from '../../utils/cn';
import { splitLines } from '../../utils/splitLines';

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  /** Stagger in ms. */
  delay?: number;
  /** Wrap each rendered line in its own mask and raise them from behind it. */
  lines?: boolean;
  /**
   * Set the heading word by word inside the line masks instead of sliding each
   * line as one block. Implies `lines`.
   */
  words?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Entrance-once reveal. Deliberately does not reverse on scroll-up: content
 * that disappears when you scroll back is worse than no animation at all.
 * Content is always in the DOM and fully readable with reduced motion.
 *
 * With `lines` the entrance is masked instead of faded: each line rises out of
 * a box the size of the line, which is the difference between text appearing
 * and text arriving. The masks are rebuilt on resize and once the webfont
 * lands, because both change where the lines break.
 */
const Reveal = ({
  children,
  as: Tag = 'div',
  delay = 0,
  lines = false,
  words = false,
  className,
  style,
}: RevealProps) => {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  const reduced = useReducedMotion();
  const masked = lines || words;

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
    if (!masked || reduced) return;

    const el = ref.current;
    if (!el) return;

    let restore = splitLines(el, words);
    let width = el.getBoundingClientRect().width;
    let frame = 0;

    const resplit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = el.getBoundingClientRect().width;
        if (Math.abs(next - width) < 1) return;
        width = next;
        restore();
        restore = splitLines(el, words);
      });
    };

    // A webfont swap changes every line break, and it lands after first paint.
    void document.fonts.ready.then(() => {
      restore();
      restore = splitLines(el, words);
    });

    const observer = new ResizeObserver(resplit);
    observer.observe(el);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      restore();
    };
  }, [masked, words, reduced]);

  return (
    <Tag
      ref={ref}
      className={cn('reveal', className)}
      data-shown={shown}
      data-words={words || undefined}
      style={{ ...style, '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
