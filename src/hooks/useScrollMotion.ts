import { useEffect } from 'react';

const REDUCED = '(prefers-reduced-motion: reduce)';

/**
 * Scroll motion that needs pin/scrub timing, which CSS animation-timeline cannot do.
 *
 * Four effects, all of them scrubbed or staggered by ScrollTrigger:
 *   1. hero — the name rises word by word
 *   2. chapter titles — rise a fixed 13px inside the heading's own grid gap,
 *      eased in step with scroll position, not a fixed duration
 *   3. project cards — a shallow depth move as they come up
 *   4. hero exit — the opening frame lifts and dims as the first chapter arrives
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
        // An explicit pixel rise, never yPercent: the title sits in a 16px grid
        // gap above the lead, and a percentage of the title's own height grows
        // with the line count until a 3-line headline overruns that gap. 13px
        // can never reach the lead. The class also parks the title 18px down
        // while it is hidden, so the start value has to be written outright or
        // GSAP adopts that offset as the resting position.
        gsap.utils.toArray<HTMLElement>('.chapter-head__title').forEach((el) => {
          gsap.fromTo(
            el,
            { y: 13 },
            {
              y: 0,
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

        // 4 · hero exit. Without this the opening frame is inert once its
        // entrance is over and the first chapter arrives as a cut. The shell
        // lifts and dims with the scroll, so leaving 01 reads as the camera
        // pulling back. The scroll cue is furniture and goes first.
        const hero = document.querySelector<HTMLElement>('#ingress');
        const heroShell = hero?.querySelector<HTMLElement>('.shell');
        if (hero && heroShell) {
          gsap.to(heroShell, {
            yPercent: -9,
            opacity: 0.1,
            ease: 'none',
            scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
          });

          const cue = hero.querySelector<HTMLElement>('.hero__scroll');
          if (cue) {
            gsap.to(cue, {
              opacity: 0,
              ease: 'none',
              scrollTrigger: { trigger: hero, start: 'top top', end: '40% top', scrub: true },
            });
          }
        }
      });

      revert = () => ctx.revert();
    })();

    return () => {
      cancelled = true;
      revert();
    };
  }, []);
};
