import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { cn } from '../../lib/cn';

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  /** Stagger in ms. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Entrance-once reveal. Deliberately does not reverse on scroll-up: content
 * that disappears when you scroll back is worse than no animation at all.
 * Content is always in the DOM and fully readable with reduced motion.
 */
const Reveal = ({ children, as: Tag = 'div', delay = 0, className, style }: RevealProps) => {
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

  return (
    <Tag
      ref={ref}
      className={cn('reveal', className)}
      data-shown={shown}
      style={{ ...style, '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
