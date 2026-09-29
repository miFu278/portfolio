import React, { type ElementType } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export type TextAnimationType =
  | 'slide-up'
  | 'slide-down'
  | 'slide-right'
  | 'slide-left'
  | 'flip-up'
  | 'blur-in';

export interface TextRevealProps {
  text: string;
  as?: ElementType;
  animation?: TextAnimationType;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  threshold?: number | number[];
  rootMargin?: string;
  splitBy?: 'words' | 'chars' | 'none';
  highlightWords?: string[];
  highlightClassName?: string;
  once?: boolean;
}

export const TextReveal: React.FC<TextRevealProps> = ({
  text,
  as: Component = 'h2',
  animation = 'slide-up',
  className = '',
  wordClassName = '',
  delay = 0,
  stagger = 40,
  threshold = [0, 0.1],
  rootMargin = '0px 0px -30px 0px',
  splitBy = 'words',
  highlightWords = [],
  highlightClassName = 'text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400',
  once = false,
}) => {
  const { ref, isVisible } = useScrollReveal<HTMLElement>({
    threshold,
    rootMargin,
    once,
  });

  const getWordInitialTransform = () => {
    switch (animation) {
      case 'slide-up':
        return 'translate3d(0, 110%, 0)';
      case 'slide-down':
        return 'translate3d(0, -110%, 0)';
      case 'slide-right':
        return 'translate3d(-35px, 0, 0)';
      case 'slide-left':
        return 'translate3d(35px, 0, 0)';
      case 'flip-up':
        return 'perspective(600px) rotateX(75deg) translate3d(0, 20px, 0)';
      case 'blur-in':
        return 'scale(0.92)';
      default:
        return 'translate3d(0, 110%, 0)';
    }
  };

  const getWordInitialFilter = () => {
    switch (animation) {
      case 'blur-in':
        return 'blur(10px)';
      case 'slide-right':
      case 'slide-left':
        return 'blur(6px)';
      default:
        return 'blur(4px)';
    }
  };

  const isMasked = animation === 'slide-up' || animation === 'slide-down';

  if (splitBy === 'none') {
    return (
      <Component
        ref={ref}
        className={`${className} ${isMasked ? 'overflow-hidden' : ''} inline-block`}
      >
        <span
          className={`inline-block ${wordClassName}`}
          style={{
            transform: isVisible ? 'translate3d(0, 0, 0)' : getWordInitialTransform(),
            opacity: isVisible ? 1 : 0,
            filter: isVisible ? 'blur(0px)' : getWordInitialFilter(),
            transition: isVisible
              ? `transform 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, filter 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`
              : 'none',
            willChange: 'transform, opacity, filter',
          }}
        >
          {text}
        </span>
      </Component>
    );
  }

  if (splitBy === 'chars') {
    const chars = Array.from(text);
    return (
      <Component ref={ref} className={`${className} inline-flex flex-wrap`}>
        {chars.map((char, index) => {
          const charDelay = delay + index * stagger;
          if (char === ' ') {
            return (
              <span key={index} className="inline-block w-[0.28em]">
                &nbsp;
              </span>
            );
          }
          return (
            <span
              key={index}
              className={`inline-block ${isMasked ? 'overflow-hidden pt-[0.05em] -mt-[0.05em] pb-[0.1em] -mb-[0.1em]' : ''}`}
            >
              <span
                className={`inline-block ${wordClassName}`}
                style={{
                  transform: isVisible ? 'translate3d(0, 0, 0)' : getWordInitialTransform(),
                  opacity: isVisible ? 1 : 0,
                  filter: isVisible ? 'blur(0px)' : getWordInitialFilter(),
                  transition: isVisible
                    ? `transform 600ms cubic-bezier(0.16, 1, 0.3, 1) ${charDelay}ms, opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) ${charDelay}ms, filter 600ms cubic-bezier(0.16, 1, 0.3, 1) ${charDelay}ms`
                    : 'none',
                  willChange: 'transform, opacity, filter',
                }}
              >
                {char}
              </span>
            </span>
          );
        })}
      </Component>
    );
  }

  // Default: splitBy === 'words'
  const words = text.split(' ');

  return (
    <Component
      ref={ref}
      className={`${className} inline-flex flex-wrap gap-x-[0.28em] gap-y-[0.05em]`}
    >
      {words.map((word, index) => {
        const isHighlighted = highlightWords.some(
          (hw) => hw.toLowerCase() === word.toLowerCase()
        );
        const wordDelay = delay + index * stagger;
        const appliedClass = isHighlighted ? highlightClassName : wordClassName;

        return (
          <span
            key={index}
            className={`inline-block ${isMasked ? 'overflow-hidden pt-[0.05em] -mt-[0.05em] pb-[0.12em] -mb-[0.12em]' : ''}`}
          >
            <span
              className={`inline-block ${appliedClass}`}
              style={{
                transform: isVisible ? 'translate3d(0, 0, 0)' : getWordInitialTransform(),
                opacity: isVisible ? 1 : 0,
                filter: isVisible ? 'blur(0px)' : getWordInitialFilter(),
                transition: isVisible
                  ? `transform 700ms cubic-bezier(0.16, 1, 0.3, 1) ${wordDelay}ms, opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) ${wordDelay}ms, filter 700ms cubic-bezier(0.16, 1, 0.3, 1) ${wordDelay}ms`
                  : 'none',
                willChange: 'transform, opacity, filter',
              }}
            >
              {word}
            </span>
          </span>
        );
      })}
    </Component>
  );
};

export default TextReveal;
