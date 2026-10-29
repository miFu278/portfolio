import { useEffect } from 'react';

const REDUCED = '(prefers-reduced-motion: reduce)';

/**
 * Scroll motion that needs pin/scrub timing, which CSS animation-timeline cannot do.
 *
 * Five effects, all of them scrubbed or staggered by ScrollTrigger:
 *   1. hero — the name rises word by word
 *   2. chapter titles — rise a fixed 13px inside the heading's own grid gap,
 *      eased in step with scroll position, not a fixed duration
 *   3. project cards — a shallow depth move as they come up
 *   4. hero exit — the opening frame recedes as the first chapter arrives
 *   5. depth — kickers and figures travel faster than the copy between them
 *   6. services — the stage is pinned and its two projects are carried sideways
 *
 * Nothing here moves body copy. The reading plane keeps its place under the
 * eye, and only things at a distance from it drift, which is what makes the
 * page read as layers instead of a flat sheet.
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

      const media = gsap.matchMedia();
      let startHero = () => {};

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

          // The loader owns the first paint. The name rises as the curtain
          // leaves, not behind it; if that event never arrives the words are
          // already in place and simply stay there.
          startHero = () => {
            gsap.from(heading.querySelectorAll('.word'), {
              yPercent: 110,
              opacity: 0,
              duration: 0.9,
              ease: 'power3.out',
              stagger: 0.075,
              delay: 0.15,
            });
          };

          if (document.documentElement.dataset.loaded === 'true') startHero();
          else window.addEventListener('app:loaded', startHero, { once: true });
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
        // entrance is over and the first chapter arrives as a cut. The
        // foreground recedes: it shrinks, lifts faster than the backdrop and
        // dims to a third, while the backdrop scales up and drifts with the
        // scroll. Two layers leaving at different rates is what reads as a
        // camera pulling back rather than a page fading out. The scroll cue is
        // furniture and goes first.
        const hero = document.querySelector<HTMLElement>('#ingress');
        if (hero) {
          const depth = () => ({
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          });

          const shell = hero.querySelector<HTMLElement>('.shell');
          if (shell) {
            gsap.to(shell, {
              scale: 0.93,
              yPercent: -16,
              opacity: 0.35,
              ease: 'none',
              scrollTrigger: depth(),
            });
          }

          // The backdrop covers the hero, so it has to grow as it drifts or it
          // uncovers the page background at an edge.
          const backdrop = hero.querySelector<HTMLElement>('.hero__canvas');
          if (backdrop) {
            gsap.to(backdrop, {
              scale: 1.12,
              yPercent: -6,
              ease: 'none',
              scrollTrigger: depth(),
            });
          }

          const cue = hero.querySelector<HTMLElement>('.hero__scroll');
          if (cue) {
            gsap.to(cue, {
              opacity: 0,
              ease: 'none',
              scrollTrigger: { trigger: hero, start: 'top top', end: '40% top', scrub: true },
            });
          }
        }

        // 5 · depth across the page. Kickers and figures travel the other way
        // from the scroll, so each chapter reads as a layer under the copy. At
        // the reading position both sit at 0; they are only off home while
        // entering or leaving. Each amplitude stays inside the space that
        // element owns, so nothing can land on a neighbour.
        gsap.utils.toArray<HTMLElement>('.chapter-head__kicker').forEach((el) => {
          gsap.fromTo(
            el,
            { y: 8 },
            {
              y: -8,
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          );
        });

        // The frame moves as one piece. Panning the raster inside it would zoom
        // a diagram whose labels are already small, and cropping it would lose
        // the edge of the drawing.
        gsap.utils.toArray<HTMLElement>('.project__diagram').forEach((el) => {
          gsap.fromTo(
            el,
            { y: 12 },
            {
              y: -12,
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          );
        });
      });

      // 6 · services, pinned. The two projects are one path as much as the six
      // chapters are, so the stage holds still while the track is carried
      // sideways. The hold is a sticky stage inside a wrapper the hook sizes,
      // not a ScrollTrigger pin: a pin spacer appears during a refresh, after
      // the triggers below it have measured, and every chapter under services
      // then scrubs a wrapper-width too early. The travel is written as a custom
      // property rather than as a transform, because the track already carries
      // the velocity shear in CSS and two owners of one transform is how the
      // chapter title broke once.
      media.add('(min-width: 1024px)', () => {
        const stage = document.querySelector<HTMLElement>('.services__stage');
        const hold = stage?.parentElement;
        const track = stage?.querySelector<HTMLElement>('.services__list');
        if (!stage || !hold || !track) return;

        const travel = { x: 0 };
        const spread = () => Math.max(0, (track.children.length - 1) * stage.clientWidth);

        // The wrapper is one viewport plus one spread of scroll room, and it is
        // resized before every refresh rather than after, so nothing ever
        // measures a layout that is about to change.
        const room = () => {
          hold.style.height = `calc(100svh + ${spread()}px)`;
        };
        room();
        ScrollTrigger.addEventListener('refreshInit', room);

        const tween = gsap.to(travel, {
          x: () => -spread(),
          ease: 'none',
          scrollTrigger: { trigger: hold, start: 'top top', end: 'bottom bottom', scrub: true },
          onUpdate: () => {
            track.style.setProperty('--services-x', `${travel.x.toFixed(1)}px`);
          },
        });

        return () => {
          ScrollTrigger.removeEventListener('refreshInit', room);
          tween.kill();
          hold.style.removeProperty('height');
          track.style.removeProperty('--services-x');
        };
      });

      // The pin adds its own height below everything already measured, so the
      // triggers created before it are re-measured on the next frame, once the
      // pin spacer exists. A refresh in the same pass still sees the old layout
      // and leaves the chapters under services scrubbing 736px too early.
      requestAnimationFrame(() => {
        if (!cancelled) ScrollTrigger.refresh();
      });

      revert = () => {
        window.removeEventListener('app:loaded', startHero);
        media.revert();
        ctx.revert();
      };
    })();

    return () => {
      cancelled = true;
      revert();
    };
  }, []);
};
