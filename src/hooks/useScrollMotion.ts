import { useEffect } from 'react';

const REDUCED = '(prefers-reduced-motion: reduce)';

/**
 * The chapters that arrive over the one before them, and how far each is tilted
 * as it starts. Positive turns clockwise, so the sheet's left corner is held up
 * and the reveal runs left to right; negative leads with the right corner. The
 * two seams alternate, so the page never hands over twice the same way.
 */
const SHEETS: ReadonlyArray<{ id: string; tilt: number; held: string }> = [
  { id: 'services', tilt: 2.8, held: '#gateway' },
  { id: 'anomaly', tilt: -2.8, held: '#services' },
];

/**
 * Document offset from layout alone. The sheet this drives is the element being
 * tilted, so anything that reads its rect reads its own output back; `offsetTop`
 * is the box the layout gave it, which the transform cannot move.
 */
const layoutTop = (el: HTMLElement) => {
  let y = 0;
  for (let node: HTMLElement | null = el; node; node = node.offsetParent as HTMLElement | null) {
    y += node.offsetTop;
  }
  return y;
};

/**
 * Scroll motion that needs pin/scrub timing, which CSS animation-timeline cannot do.
 *
 * Eight effects, all of them scrubbed or staggered by ScrollTrigger:
 *   1. hero — the name rises word by word
 *   2. chapter titles — rise a fixed 13px inside the heading's own grid gap,
 *      eased in step with scroll position, not a fixed duration
 *   3. project cards — a shallow depth move as they come up
 *   4. hero exit — the opening frame recedes as the first chapter arrives
 *   5. depth — kickers and figures travel faster than the copy between them
 *   6. services — the stage is pinned and its two projects are carried sideways
 *   7. the seam — the first chapter opens out of a slit
 *   8. the handover — chapter 02 holds while chapter 03 rises over it as a sheet
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
      const teardown: Array<() => void> = [];
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
        // foreground recedes: it shrinks and lifts faster than the backdrop,
        // while the backdrop scales up and drifts the other way. Two layers
        // leaving at different rates is what reads as a camera pulling back.
        // No dimming: the seam in effect 7 is what carries the hand-off, and a
        // fade on top of it would read as the page dying rather than moving.
        // The scroll cue is furniture and goes first.
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

        // 7 · the seam. The first chapter does not scroll away, it opens: the
        // second widens out of a vertical slit at the centre as it rises. One
        // clip-path on the whole chapter, driven by the section's own position,
        // so the read is the same at any scroll speed. A clip reserves no space
        // and moves no box, so the rail and every measurement under it are
        // untouched.
        const gateway = document.querySelector<HTMLElement>('#gateway');
        if (gateway) {
          const open = (progress: number) => {
            gateway.style.setProperty('--seam', `${((1 - progress) * 50).toFixed(2)}%`);
          };
          const seam = ScrollTrigger.create({
            trigger: gateway,
            start: 'top bottom',
            // Opens across the whole arrival, not the first third of it: the
            // chapter head sits ~180px below the section's top edge, so an end
            // any earlier has the slit finishing before there is anything inside
            // it to see.
            end: 'top 12%',
            onUpdate: (self) => open(self.progress),
            onRefresh: (self) => open(self.progress),
          });

          teardown.push(() => {
            seam.kill();
            gateway.style.removeProperty('--seam');
          });
        }

        // 8 · the handover. A chapter does not scroll in after the one before it:
        // that one holds at the top of the viewport while this one rises over it
        // as an opaque sheet, tilted and straightening as it takes the screen.
        // The hold is a sticky stage inside a wrapper the layout gives extra
        // height (.gateway__hold, .services__pin), so this effect owns only the
        // tilt — the geometry that has to stay in time is the sheet's own place
        // in the document.
        const sheets = SHEETS.flatMap(({ id, tilt, held }) => {
          const el = document.getElementById(id);
          const covered = document.querySelector<HTMLElement>(held);
          return el?.classList.contains('chapter--sheet') ? [{ el, tilt, covered }] : [];
        });

        if (sheets.length > 0) {
          const paint = () => {
            const rise = window.innerHeight;
            for (const sheet of sheets) {
              // Read from layout, never from the sheet's own rect: the rect is
              // the thing being tilted. 0 while the top edge is still at the
              // bottom of the viewport, 1 once it has reached the top — the same
              // one screen of travel that the hold gives the chapter underneath.
              const progress = (rise - (layoutTop(sheet.el) - window.scrollY)) / rise;
              const eased = Math.min(1, Math.max(0, progress));
              sheet.el.style.setProperty(
                '--sheet-tilt',
                `${((1 - eased) * sheet.tilt).toFixed(2)}deg`,
              );
              // Flat and out of the compositor once it has landed: the pinned
              // beat inside one of these is what needs the frames.
              if (eased >= 1) sheet.el.dataset.flat = 'true';
              else delete sheet.el.dataset.flat;
              // The cover retires the moment the sheet has landed: it only ever
              // existed to hide the chapter underneath, and that chapter is gone
              // by then, faded out where nobody can see it happen. Past this
              // point the sky runs behind the page.
              const past = Math.max(0, progress - 1) / 0.15;
              sheet.el.style.setProperty('--sheet-plate', Math.max(0, 1 - past).toFixed(3));

              // The chapter being covered is gone by the time the sheet lands, so
              // that the cover can retire there and let the sky through. The fade
              // is squeezed into the last sliver of the rise -- the strip of the
              // old page still on screen above the sheet's edge -- because the
              // hand-over should look like pages stacking, not like a dissolve.
              const leave = Math.min(1, Math.max(0, (eased - 0.85) / 0.15));
              sheet.covered?.style.setProperty('--stage-fade', (1 - leave).toFixed(3));
            }
          };

          // A refresh measures rects this effect is about to move. The tilt costs
          // a sheet's top edge up to a corner of travel, which would land in
          // every trigger measured below it, so the measurement gets the untilted
          // boxes and the property is handed straight back afterwards.
          const release = () =>
            sheets.forEach((sheet) => sheet.el.style.setProperty('--sheet-tilt', '0deg'));
          ScrollTrigger.addEventListener('refreshInit', release);
          ScrollTrigger.addEventListener('refresh', paint);

          // One trigger over the whole page: a scroll callback that measures
          // nothing, so it cannot chase its own output either.
          const driver = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: paint });

          paint();
          teardown.push(() => {
            driver.kill();
            ScrollTrigger.removeEventListener('refreshInit', release);
            ScrollTrigger.removeEventListener('refresh', paint);
            for (const sheet of sheets) {
              sheet.el.style.removeProperty('--sheet-tilt');
              sheet.el.style.removeProperty('--sheet-plate');
              sheet.covered?.style.removeProperty('--stage-fade');
              delete sheet.el.dataset.flat;
            }
          });
        }
      });

      // 6 · services, held. The two projects are one path as much as the six
      // chapters are, so the stage holds still while the track is carried
      // sideways, and then holds again after the second project lands: the extra
      // scroll is a dwell, and leaving the chapter takes deliberate scrolling.
      //
      // The hold is a sticky stage inside a wrapper the hook sizes, not a
      // ScrollTrigger pin: a pin spacer appears during a refresh, after the
      // triggers below it have measured, and every chapter under services then
      // scrubs a wrapper-width too early. The sideways travel is written as a
      // custom property rather than as a transform, because the track already
      // carries the velocity shear in CSS and one transform has one owner.
      // One trigger spans travel plus dwell, and its progress is split by hand,
      // so the two numbers stay independent.
      media.add('(min-width: 1024px)', () => {
        const stage = document.querySelector<HTMLElement>('.services__stage');
        const hold = stage?.parentElement;
        const track = stage?.querySelector<HTMLElement>('.services__list');
        if (!stage || !hold || !track) return;

        const spread = () => Math.max(0, (track.children.length - 1) * stage.clientWidth);
        // Four numbers, in scroll order: a hold on the first project so it can be
        // read before it moves, the travel itself, the dwell that releases the
        // chapter, and then one screen of hold in which chapter 04 rises over
        // the stage (the handover, effect 8). The last one is room for the stage
        // to be under a sheet, not part of the beat, so it never enters the
        // progress below.
        const lead = () => Math.round(window.innerHeight * 0.4);
        const dwell = () => Math.round(window.innerHeight * 0.5);
        const handover = () => Math.round(window.innerHeight);
        const held = () => lead() + spread() + dwell();

        // The wrapper is one viewport plus all four, and it is resized before
        // every refresh rather than after, so nothing ever measures a layout that
        // is about to change.
        const room = () => {
          hold.style.height = `calc(100svh + ${held() + handover()}px)`;
        };
        room();
        ScrollTrigger.addEventListener('refreshInit', room);

        const place = (progress: number) => {
          const gone = progress * held();
          const slid = spread() > 0 ? Math.min(1, Math.max(0, (gone - lead()) / spread())) : 1;
          const leave =
            dwell() > 0 ? Math.max(0, Math.min(1, (gone - lead() - spread()) / dwell())) : 0;

          track.style.setProperty('--services-x', `${(-spread() * slid).toFixed(1)}px`);

          // The dwell is a release, not a freeze: the stage lifts, pulls back a
          // little and dims, so the hold reads as the chapter making way rather
          // than the page stalling.
          stage.style.transform = `translate3d(0, ${(-6 * leave).toFixed(2)}%, 0) scale(${(
            1 - 0.04 * leave
          ).toFixed(3)})`;
          stage.style.setProperty('--stage-dim', (1 - 0.45 * leave).toFixed(3));
        };

        const apply = () => {
          // How far the wrapper's top has gone above the viewport top is the
          // same number the sticky stage uses, so reading it here means the
          // travel cannot start before the stage has actually stuck. A
          // ScrollTrigger progress is a second, independent measurement of that
          // distance, and when the two disagree by a few dozen pixels the track
          // is already part way across while the card is still scrolling into
          // view, which shows as a sliver of the next project at the hold.
          const gone = Math.min(held(), Math.max(0, -hold.getBoundingClientRect().top));
          place(gone / (held() || 1));
        };

        const trigger = ScrollTrigger.create({
          trigger: hold,
          start: 'top top',
          end: () => `+=${held()}`,
          onUpdate: apply,
          onRefresh: apply,
        });
        apply();

        return () => {
          ScrollTrigger.removeEventListener('refreshInit', room);
          trigger.kill();
          hold.style.removeProperty('height');
          track.style.removeProperty('--services-x');
          stage.style.removeProperty('transform');
          stage.style.removeProperty('--stage-dim');
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
        teardown.forEach((off) => off());
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
