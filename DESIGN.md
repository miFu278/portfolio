# Design

What this site is and why it is built the way it is. Describes the current code, not an
intention.

## 1. Purpose

Personal portfolio for a backend engineer. Goals in priority order:

1. Establish identity — name, role, one claim.
2. Prove depth — two running systems, one internship, one paper.
3. Convert — résumé, GitHub, contact.

Audience: recruiters and hiring engineers screening for backend / distributed-systems work.

## 2. The organising idea

The page is not a list of sections. It is a request travelling through a system, and each
chapter is a hop:

```
01 INGRESS → 02 GATEWAY → 03 SERVICES → 04 ANOMALY → 05 OBSERVABILITY → 06 RESPONSE
```

Chapter ids, the `ChapterRail`, the header nav and `config/content.ts` all read from one
list (`CHAPTERS`), so the metaphor cannot drift between them.

Each chapter title is a sentence with a verb — *"Nothing gets through by accident."*,
*"Some inputs don't belong here."* Nouns like "About" or "Skills" were deliberately dropped.

## 3. Architecture

Feature-sliced. `config/content.ts` is the content source of truth; `pages/Home.tsx` is a
routing shell that composes features and owns no logic; each feature exposes one barrel.

```
content.ts ──→ features/*/components ──→ pages/Home.tsx
                    ↑
        components/ui, components/layout, hooks, lib
```

Rules that keep it honest:

- A feature never imports another feature. Shared code moves down into `components/ui`,
  `hooks`, `lib` or `utils`.
- `lib/` is only for third-party boundaries (today: EmailJS). Everything above it speaks
  `ContactPayload`.
- No global client state. There is none to manage; adding a store would be dead weight.

## 4. Visual language

One skin, dark: a systems console. No light mode.

### Colour

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0b0d0e` | page |
| `--bg-raised` | `#14181a` | cards, panels |
| `--bg-sunk` | `#050708` | figure plates, wells |
| `--line` | `#212a2d` | hairlines |
| `--line-hot` | `rgba(232,237,238,.26)` | hover borders |
| `--text-primary` | `#e8edee` | headings, node names |
| `--text-body` | `#9fb0b4` | paragraphs |
| `--text-dim` | `#5d6b6f` | labels only |
| `--signal` | `#ffb224` | the request |

**Accent discipline.** `--signal` belongs to the request. It appears on the active chapter
marker, the availability dot, the technologies the visible project actually uses, one number
per section, and the event arrow in the e-commerce figure. Nowhere else. Budget: about 2% of
pixels.

`--text-dim` is 11px labels only. It does not clear 4.5:1 against `--bg-raised`, so it must
never carry a sentence.

### Type

Two families, both loaded in `index.html`:

- **Archivo** 400–700 — display and body.
- **JetBrains Mono** 400/500 — technical content only: labels, meta, timestamps, node names,
  arrow labels. Never used as a blanket "dev" font for prose.

Fluid scale via `clamp()` in `tokens.css`: `--fs-display-xl` down to `--fs-label`.

### Layout

One container (`--w-content: 1240px`) and one gutter. Every section shares it; the chapter
rail sits outside it and only appears at ≥1360px, where there is margin to hold it.

## 5. Motion

- `--ease-out` everywhere, `--d-micro` (180ms) through `--d-chapter` (1100ms).
- One spectacle: the topology canvas behind the hero. The rest is depth and hierarchy, so what
  moves says how far away it is or which layer it belongs to.
- The hero canvas sits on a camera that drifts toward the pointer and gives a little to scroll
  speed. It is clamped inside the 6% margin the camera adds by scaling, so it can never uncover
  an edge of the hero. The graph does not change between resizes, so it is painted once into an
  offscreen sheet and blitted each frame, and the accent colour is read once per build: reading
  it with `getComputedStyle` on every frame forced a style recalculation on every frame.
- `Reveal` fires once and never reverses. Content that vanishes on scroll-up is worse than
  no animation.
- `prefers-reduced-motion` renders a complete static page: reveals are instant and the canvas
  draws a single frame.

### Positional and entrance motion

Two kinds of motion, one rule each.

An **entrance** (`Reveal`) fires once and never reverses. A **positional** effect is scrubbed
by scroll position and runs both ways, because scrolling back must restore the page it left.
Nothing positional here is an entrance, so nothing can leave a reader with content they cannot
scroll back for.

### Scroll

Lenis lerps the native scroll position rather than replacing it, so the scrollbar, the keyboard,
`window.scrollY` and every anchor measurement the rail takes keep working unchanged. Fragment
links are routed through `lenis.scrollTo`, and `html`'s `scroll-behavior` is handed to Lenis for
the lifetime of the hook so the page is never eased twice. Under reduced motion the hook does
not start and the page scrolls natively. Nothing on the page depends on it: it is an easing, not
a source of content.

It is a fixed fraction per frame, not a duration. A duration gives the wheel an easing curve with
a long tail, and every scrubbed position on the page then chases that already-eased value.
Measured after one 400px wheel tick: a 1.05s duration settled in 776ms and reached 90% of the
travel at 334ms, `lerp: 0.2` settled in 574ms and reached 90% at 208ms, and the shipped
`lerp: 0.16` settles in 690ms and reaches 90% at 241ms. The first movement comes 8ms after the
wheel event, so the lag is the curve, not the input.

### Snap

When the reader stops with a chapter boundary inside the bottom band of the viewport going down,
or the top band going up, the page finishes the move onto that boundary by itself. The idle
window is 2.4s, the band is 45% of the viewport, and the snap takes 1.1s so it reads as the page
settling rather than jumping. A stop well inside a chapter is left alone, and a boundary the page
is already sitting on is ignored.

### The pointer layer

On a pointer that really hovers, a ring trails the cursor and takes the shape of what it is over,
and the marked calls to action lean up to 8px toward it. The rect of a magnetic button is taken on
`pointerenter`, before the pull moves it, or the element chases its own centre.

The native cursor is hidden only after the loader has finished, so a touch screen, reduced motion
or a script that never ran all leave the page with the pointer it shipped with. Inputs and dialogs
take a real cursor back, because a ring cannot show a caret or a grab hand.

### Small motions

The repo link wipes its underline in from the left, drawn with `background-size` rather than
`text-decoration` so it covers the arrow too. The viewer opens from the card: the raster is placed
back on the figure's rect for one frame, then released, and the transition carries it to its own
box. The loader leaves as a curtain, and the hero name starts on that handover instead of finishing
behind it.

### Velocity layer

Speed is measured as pixels moved per frame, not taken from an easing library's internal unit.
That number is written to one custom property, `--scroll-skew`, once per frame, and the services
list shears by at most 2 degrees with it before settling flush. Measured on this page a single
wheel tick shears 0.88deg and a rapid burst reaches 1.86deg, so the clamp is reserved for a
fling. It stays at 0 when the hook is off, which is what keeps reduced motion and a failed
script both square.

### Depth

The reading plane does not move. Body copy keeps its place under the eye, and only what sits at
a distance from it drifts, which is what makes the page read as layers instead of a flat sheet.

The hero is that stack at full size. Leaving 01 pulls the camera back: the foreground shrinks
to 0.93, lifts and dims to 0.35 while the topology backdrop grows to 1.12 and drifts with the
scroll. The two layers separate by about 24px at mid-transit and 47px at the end. The scroll
cue is furniture and goes first, over the first 40% of the range. A dim alone read as a page
fading out; the scale and the counter-moving backdrop are what read as depth.

Down the page the same stack runs smaller. Chapter kickers travel 8px against the scroll,
project figures 12px, and the copy between them not at all. Each sits at 0 at its reading
position and is off home only while entering or leaving.

### Text and figures

Chapter titles and leads arrive through a mask. Each rendered line sits in its own clipping box
and rises out of it, which is the difference between text appearing and text arriving. The boxes
are rebuilt when the column's width changes and once the webfont lands, because both move the
line breaks. A masked line keeps the room the plain line had, so the split shifts nothing.

The project figure arrives as a wipe down its frame, with the raster settling from a 6% over-scale.
The wipe sits on the button inside the frame and not on the frame itself: an element clipped to
nothing never reports itself as intersecting, so a mask on the observed element would never open.

### The services beat

The two projects are one path as much as the six chapters are, so the stage holds still while the
track is carried sideways: one slide per viewport, one spread of scroll room to travel it, and
then a dwell of half a viewport before the chapter lets go. The dwell is the release. The stage
lifts 6%, pulls back to 0.96 and dims to 0.55 across it, so the hold reads as the chapter making
way instead of the page stalling, and leaving the chapter costs deliberate scrolling.

The stage is `position: sticky` inside a wrapper the hook sizes, not a ScrollTrigger pin. A pin
spacer is created during a refresh, after the triggers below it have measured, so every chapter
under services then scrubs a wrapper width too early. Sticky needs no spacer and changes nothing
mid-refresh. The travel is written as `--services-x`, not as a transform, because the track
already carries the velocity shear in CSS and one transform has one owner.

A slide is exactly one stage tall and the figure takes whatever height is left, so no viewport
height can push the stats, the tech row and the repo link off it. The registry follows whichever
slide is on the stage, from the intersection observer that already tracked the active project.

### One owner per transform

An element gets its transform from one mechanism only. A scrubbed element must not also carry
an entrance transform, and must not inherit a transition on `transform`. A 750ms transition
makes a per-frame scrub chase the scroll instead of following it, and the element arrives late.
The scrubbed elements therefore transition opacity only, and GSAP owns their position.

A scrubbed displacement must also fit the space it moves into, because a transform reserves no
space. The chapter title rises 13px inside the 16px grid gap above its lead, the kicker travels
8px inside that same gap, and a figure 12px inside the 24px it owns above and below.
Percentages of the element's own height do not hold that promise: a three line title at 14%
overran the gap and landed on the lead.

### Chapter rail packet

`useChapterProgress` writes `--rail-y` on the rail from a single rAF-throttled scroll listener,
and `.rail__packet` consumes it as a transform, so no scroll frame touches layout. Position is
piecewise-linear between chapter anchors, where a chapter's anchor is the scroll offset at which
its top reaches the middle of the viewport, so the packet never reaches a chapter before that
chapter's heading has. It remeasures on resize and through a `ResizeObserver` on `body`, because
anything that changes the document height moves every anchor below it.
Under reduced motion the hook returns early and the packet is not drawn.

### Header chapter readout

Below 900px nothing else says where you are: the rail lives in the desktop margin and the
chapter menu is closed. `.header__now` renders `NN LABEL`, keyed by chapter so the fade replays
on a boundary, and `aria-hidden` because it repeats the heading already in the document.

## 6. Figures

Project diagrams are Excalidraw scenes exported by hand to PNG and shown through a `<dialog>`
lightbox (zoom, pan, keyboard). See `docs/diagrams/README.md`.

The pixel size travels with the source in `Services.tsx`, and the `<img>` carries it as
`width`/`height`. A lazy raster with no intrinsic size contributes no height until it loads, and
the ~750px it then adds shifts every chapter below it out from under the reader.

Inline SVG was tried and removed: the rasters are what Excalidraw actually produces, and the
hand-mirrored SVG twin drifted from the scene.

## 7. Accessibility

- Every interactive element is a real button or link; figures are `<button aria-label>`.
- Focus is visible (`:focus-visible` outline in `--signal`).
- The lightbox uses native `<dialog>`, so focus trapping and Esc come from the platform.
- `aria-labelledby` on every diagram; `aria-hidden` on decoration.
- Text stays readable without JS: reveals are CSS transitions over present DOM.

## 8. Known gaps

- `public/diagrams/*.png` were exported before the code corrections landed, so they still
  show `Stripe`, `MassTransit` and `Serilog → Seq/Jaeger`. Deliberately left as is.
- No automated tests and no CI beyond the Cloudflare build.
- Content is English-only, in one file; there is no i18n layer.
- Lighthouse and mobile passes have not been re-run since the redesign.
