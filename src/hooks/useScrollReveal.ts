import { useEffect, useRef, useState } from 'react';
import { useLoading } from '../context/LoadingContext';

export interface UseScrollRevealOptions {
  threshold?: number | number[];
  rootMargin?: string;
  once?: boolean;
  enabled?: boolean;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
) {
  const {
    threshold = [0, 0.1],
    rootMargin = '0px 0px -30px 0px',
    once = true,
    enabled = true,
  } = options;
  const { isLoaded } = useLoading();
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Wait until page load completes before revealing initial viewport elements
    if (!enabled || !isLoaded) {
      return;
    }

    const element = ref.current;
    if (!element) return;

    // Content stays visible for reduced-motion users and browsers without IntersectionObserver
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold: Array.isArray(threshold) ? threshold : [0, threshold],
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, once, enabled, isLoaded]);

  return { ref, isVisible };
}

export default useScrollReveal;
