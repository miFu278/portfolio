import React, { useState, useEffect, type ElementType } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  cursor?: string;
  as?: ElementType;
  once?: boolean;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 45,
  delay = 200,
  className = '',
  cursor = '_',
  as: Component = 'span',
  once = false,
}) => {
  const { ref, isVisible } = useScrollReveal<HTMLElement>({ once });
  const [displayedLength, setDisplayedLength] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setDisplayedLength(0);
      return;
    }

    let currentIdx = 0;
    let timeoutId: number;
    let intervalId: number;

    timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        currentIdx++;
        setDisplayedLength(currentIdx);
        if (currentIdx >= text.length) {
          clearInterval(intervalId);
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [isVisible, text, speed, delay]);

  return (
    <Component ref={ref} className={`${className} inline-flex items-center font-mono`}>
      <span>{text.slice(0, displayedLength)}</span>
      <span className="inline-block animate-pulse text-white/90 ml-1 font-bold">{cursor}</span>
    </Component>
  );
};

export default TypewriterText;
