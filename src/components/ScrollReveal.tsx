import React, { type ElementType } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export type AnimationType =
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'slide-left'
  | 'slide-right'
  | 'slide-left-long'
  | 'slide-right-long'
  | 'zoom-in'
  | 'blur-in'
  | 'flip-up'
  | 'pop';

export interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  as?: ElementType;
  threshold?: number | number[];
  rootMargin?: string;
  once?: boolean;
  style?: React.CSSProperties;
  id?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 750,
  className = '',
  as: Component = 'div',
  threshold = [0, 0.1],
  rootMargin = '0px 0px -30px 0px',
  once = true,
  style = {},
  id,
  ...rest
}) => {
  const { ref, isVisible } = useScrollReveal<HTMLElement>({
    threshold,
    rootMargin,
    once,
  });

  const getTransform = () => {
    switch (animation) {
      case 'fade-up':
        return 'translate3d(0, 32px, 0)';
      case 'fade-down':
        return 'translate3d(0, -32px, 0)';
      case 'fade-left':
      case 'slide-left':
        return 'translate3d(36px, 0, 0)';
      case 'fade-right':
      case 'slide-right':
        return 'translate3d(-36px, 0, 0)';
      case 'slide-left-long':
        return 'translate3d(80px, 0, 0)';
      case 'slide-right-long':
        return 'translate3d(-80px, 0, 0)';
      case 'zoom-in':
        return 'scale3d(0.92, 0.92, 1)';
      case 'pop':
        return 'scale3d(0.85, 0.85, 1) translate3d(0, 20px, 0)';
      case 'flip-up':
        return 'perspective(1000px) rotateX(25deg) translate3d(0, 35px, 0)';
      case 'blur-in':
        return 'none';
      default:
        return 'translate3d(0, 32px, 0)';
    }
  };

  const getFilter = () => {
    switch (animation) {
      case 'zoom-in':
      case 'pop':
        return 'blur(6px)';
      case 'blur-in':
        return 'blur(10px)';
      case 'slide-left-long':
      case 'slide-right-long':
        return 'blur(6px)';
      default:
        return 'blur(4px)';
    }
  };

  const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';

  // Keyframe values live in CSS variables so the element itself is never hidden
  const revealVars = {
    '--reveal-from': getTransform(),
    '--reveal-filter': getFilter(),
    '--reveal-duration': `${duration}ms`,
    '--reveal-easing': easing,
    '--reveal-delay': `${delay}ms`,
  } as React.CSSProperties;

  return (
    <Component
      ref={ref}
      id={id}
      className={`${className} ${isVisible ? 'reveal-run' : ''}`}
      style={{ ...style, ...revealVars }}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default ScrollReveal;
