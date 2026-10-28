import { useEffect } from 'react';

const REDUCED = '(prefers-reduced-motion: reduce)';

/**
 * Scroll motion that needs pin/scrub timing, which CSS animation-timeline cannot do.
 *
 * Three effects, all of them scrubbed or staggered by ScrollTrigger:
 *   1. hero — the name rises word by word
 *   2. chapter titles — eased in step with scroll position, not a fixed duration
 *   3. project cards — a shallow depth move as they come up
 *
 * GSAP is imported dynamically so it lands in its own chunk: the first paint
 * ships none of it. Everything below is skipped outright when the user asks for
 * reduced motion, and each effect only touches transform/opacity so a failure
 * leaves the content fully readable.
 */
export const useScrollMotion = () => {
  useEffect(() => {
    if (window.matchMedia(REDUCED).matches) return;

    let cancelled = false;
    let revert = () => {};

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        // 1 · hero name, word by word
        const heading = document.querySelector<HTMLElement>('#ingress h1');
        if (heading && !heading.dataset.split) {
          const words = (heading.textContent ?? '').trim().split(/\s+/);
          heading.textContent = '';
          words.forEach((word, i) => {
            const span = document.createElement('span');
            span.className = 'word';
            span.textContent = word;
            heading.append(span);
            if (i < words.length - 1) heading.append(' ');
          });
          heading.dataset.split = 'true';

          gsap.from(heading.querySelectorAll('.word'), {
            yPercent: 110,
            opacity: 0,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.075,
            delay: 0.2,
          });
        }

        // 2 · chapter titles, scrubbed. Transform only: Reveal already owns the
        // opacity of these elements, so touching it here would fight the class.
        gsap.utils.toArray<HTMLElement>('.chapter-head__title').forEach((el) => {
          gsap.fromTo(
            el,
            { yPercent: 14 },
            {
              yPercent: 0,
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top 88%', end: 'top 45%', scrub: true },
            },
          );
        });

        // 3 · project cards, shallow depth
        gsap.utils.toArray<HTMLElement>('.services__list .project').forEach((el) => {
          gsap.fromTo(
            el,
            { y: 56 },
            {
              y: 0,
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 58%', scrub: true },
            },
          );
        });
      });

      revert = () => ctx.revert();
    })();

    return () => {
      cancelled = true;
      revert();
    };
  }, []);
};
