# Design

What this site is and why it is built the way it is. Describes the current code, not an
intention.

## 1. Purpose

Personal portfolio for a backend engineer. Goals in priority order:

1. Establish identity â€” name, role, one claim.
2. Prove depth â€” two running systems, one internship, one paper.
3. Convert â€” rÃ©sumÃ©, GitHub, contact.

Audience: recruiters and hiring engineers screening for backend / distributed-systems work.

## 2. The organising idea

The page is not a list of sections. It is a request travelling through a system, and each
chapter is a hop:

```
01 INGRESS â†’ 02 GATEWAY â†’ 03 SERVICES â†’ 04 ANOMALY â†’ 05 OBSERVABILITY â†’ 06 RESPONSE
```

Chapter ids, the `ChapterRail`, the header nav and `config/content.ts` all read from one
list (`CHAPTERS`), so the metaphor cannot drift between them.

Each chapter title is a sentence with a verb â€” *"Nothing gets through by accident."*,
*"Some inputs don't belong here."* Nouns like "About" or "Skills" were deliberately dropped.

## 3. Architecture

Feature-sliced. `config/content.ts` is the content source of truth; `pages/Home.tsx` is a
routing shell that composes features and owns no logic; each feature exposes one barrel.

```
content.ts â”€â”€â†’ features/*/components â”€â”€â†’ pages/Home.tsx
                    â†‘
        components/ui, components/layout, hooks, lib
```

Rules that keep it honest:

- A feature never imports another feature. Shared code moves down into `components/ui`,
  `hooks`, `lib` or `utils`.
- `lib/` is only for third-party boundaries (today: EmailJS). Everything above it speaks
  `ContactPayload`.
- No global client state. There is none to manage; adding a store would be dead weight.

## 4. Visual language

One skin, dark: a systems console.

### Colour

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0b0d0e` | page |
| `--bg-raised` | `#14181a` | cards, panels |
| `--bg-sunk` | `#050708` | wells, the viewer's backdrop |
| `--line` | `#212a2d` | hairlines |
| `--line-hot` | `rgba(232,237,238,.26)` | hover borders |
| `--text-primary` | `#e8edee` | headings, node names |
| `--text-body` | `#9fb0b4` | paragraphs |
| `--text-dim` | `#5d6b6f` | labels only |
| `--signal` | `#38bdf8` | the request |
| `--plate` | `#121212` | the diagrams' own plate |

**Accent discipline.** `--signal` belongs to the request. It appears on the active chapter
marker, the availability dot, the technologies the visible project actually uses, one number
per section, and the event arrow in the e-commerce figure. Nowhere else. Budget: about 2% of
pixels.

It is a cool signal on a cool page: the page ground is already blue-leaning, so the accent
carries by chroma and brightness rather than by temperature. On `--bg` it clears 9.1:1, and
`--bg` on it clears the same, which is what the solid button's hover depends on.

`--text-dim` is 11px labels only. It does not clear 4.5:1 against `--bg-raised`, so it must
never carry a sentence.

**Figures carry their own plate.** `--plate` is `#121212` because that colour is painted into
every exported raster: the frame matches the raster instead of boxing it, and the figure reads
as a screen rather than as a hole in the card.

The hero's topology is drawn into a canvas, which has no cascade, so the two values it needs
(`--net-edge`, `--net-node`) are tokens it reads like any other.

### The sky

Behind every frame and under every page there is a star field: a fixed layer at `z-index: 0` that
takes no pointer events, so it is atmosphere and never surface. It is a sphere around the camera,
not a texture -- every star is a direction at a fixed radius, projected each frame -- which is what
lets one field answer the pointer (a shallow orbit), the scroll (a warp that decays), and the
cursor itself: stars near it bend toward it and the nearest few are joined to it, as if the pointer
were a well in the field.

It is two elements. The cloud is a static `div` whose gradients are the `--star-veil` tokens; the
stars are a canvas above it. That split is not tidiness: painted as the canvas's own background,
the gradient was re-rastered every time the canvas was invalidated, which is every frame.

What keeps it off the frame budget, in the order each one buys: the count comes from the viewport
area (`DENSITY`) instead of being fixed; pinpoints are `fillRect` calls and only the few anchors
pay for a path, an arc and an aura; the backing store is 1:1 with CSS pixels, because a scaled
canvas is resampled every frame; and the loop runs at 30fps. It pauses with the tab.

Under `prefers-reduced-motion` it paints one frame and never starts a loop -- the sky is there, the
movement is not.

A sheet is pulled up over the chapter before it, so its first screens have that chapter behind
them, and a page cannot be transparent over another page. The cover that hides it is a `::after`
plate on the sheet itself, and it retires the moment the sheet lands -- by then the chapter
underneath has faded out where nobody could see it happen. So the sky is behind every frame on the
page, including the two that arrive as sheets, and hidden only for the length of a hand-over.

The plate is not a flat `--bg`: it carries the same sky it is standing in front of -- the ground,
the `--star-veil` cloud, and its own field of stars. Without them the sheet rose as a black card
against a lit sky and the seam read as two unrelated surfaces. The stars on it are painted, not
projected, because the live field is behind the page and cannot show through a page; they
cross-fade to the live ones as the plate retires. Eight background layers, so eight
`background-size` values: a short list repeats, and a repeated size tiles the cloud into a
patchwork.

The header is open in every section and at every scroll position, for the same reason: a bar of
`--bg` there cut the field off at the fold, and a blur on it smeared the stars into a band that read
as black. It has no surface to hide behind, so it gets out of the way instead -- it leaves on the
way down, where the chapter rail and the readout already say where the reader is, and comes back on
the way up, which is the gesture that means "take me back", and on focus, so a keyboard reader can
never land on a control that has been translated off the screen. What it does carry is a hairline
once the page is scrolled, and a text shadow on its own type, because that type can end up over a
headline.


### Type

Three families, all loaded in `index.html`:

- **Archivo** 400â€“700 â€” display and body.
- **JetBrains Mono** 400/500 â€” technical content only: labels, meta, timestamps, node names,
  arrow labels. Never used as a blanket "dev" font for prose.
- **Instrument Serif** italic â€” one line on the page, the hero's role. It is a voice, not a
  scale step, which is why a third face earns its download.

Fluid scale via `clamp()` in `tokens.css`: `--fs-display-xl` down to `--fs-label`.

### Layout

One container (`--w-content: 1240px`) and one gutter. Every section shares it; the chapter
rail sits outside it and only appears at â‰¥1360px, where there is margin to hold it.

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

Titles are typed rather than slid: characters take their place in reading order, a caret runs
with them and retires once the last one lands. The lead keeps the line-level rise, because a
paragraph arriving character by character is noise.

The mask is a `clip-path: inset(-0.6em -0.25em 0 -0.25em)`: the bottom edge stays flush so a
line can enter from below it, and the top and sides are given back so ascenders and descenders
are never cut. That is what kigo.studio does, and it beats the padding-and-negative-margin hack
this started as, because the masked box is then exactly the line box it replaced.

The hero's role swaps one word and keeps the other still. All the variants sit in the same grid
cell, right-aligned, with only the active one visible, so the cell is exactly as wide as the
longest of them and the word after it cannot move at any font size or zoom.

The project figure arrives as a wipe down its frame, with the raster settling from a 6% over-scale.
The wipe sits on the button inside the frame and not on the frame itself: an element clipped to
nothing never reports itself as intersecting, so a mask on the observed element would never open.

### The services beat

The two projects are one path as much as the six chapters are, so the stage holds still while the
track is carried sideways. In scroll order: a hold of 40% of a viewport on the first project so it
can be read before it moves, one spread of scroll room to travel, then a dwell of half a viewport
before the chapter lets go. The dwell is the release. The stage lifts 6%, pulls back to 0.96 and
dims to 0.55 across it, so the hold reads as the chapter making way instead of the page stalling,
and leaving the chapter costs deliberate scrolling.

The stage is `position: sticky` inside a wrapper the hook sizes, not a ScrollTrigger pin. A pin
spacer is created during a refresh, after the triggers below it have measured, so every chapter
under services then scrubs a wrapper width too early. Sticky needs no spacer and changes nothing
mid-refresh. The travel is written as `--services-x`, not as a transform, because the track
already carries the velocity shear in CSS and one transform has one owner.

A slide is exactly one stage tall and the figure takes whatever height is left, so no viewport
height can push the stats, the tech row and the repo link off it. The registry follows whichever
slide is on the stage, from the intersection observer that already tracked the active project.

### The handover

A chapter does not scroll in after the one before it: that one is held at the top of the viewport
while this one rises over it as an opaque sheet, tilted a couple of degrees and straightening as
it takes the screen. Two seams do this, and they lead from opposite corners â€” 02 into 03 is tilted
one way, 03 into 04 the other â€” so the page never hands over twice the same way.

The hold is the same shape as the services beat: a sticky stage inside a wrapper with one screen
more height than the stage needs. Where that height comes from differs by chapter and is the only
per-seam difference in the layout: `#gateway` gives it with a `::after` tail, and `#services`
inside the pinned wrapper the beat already sizes. Either way the arriving chapter is pulled up by
exactly that hold (`margin-top: calc(-100svh - â€¦)`), so its top edge sits at the content edge of the
chapter it covers and starts rising over it the moment the hold starts. Both values cancel in the
document height.

It has to be height, not padding: a sticky box is given no travel room by its parent's padding in
Chrome, and the stage simply scrolls past. Measured, not assumed.

The chapter being covered fades out under the sheet -- the whole chapter, not just its pinned stage,
because the registry panel sits beside the stage and was showing through on its own. The fade is
squeezed into the last sliver of the rise, where the only part of the old page still on screen is
the strip above the sheet's edge: the hand-over should read as pages stacking, not as a dissolve.
It is also what makes the cover safe to retire at landing.

The tilt is written as `--sheet-tilt` and read off layout (`offsetTop`), never off the sheet's own
rect, which is the thing being tilted. `refreshInit` neutralises it for the measurement and the
scroll callback writes it back immediately after: a tilted rect would land in every trigger
measured below it.

Two consequences worth knowing. A tilted ancestor breaks line measurement, so `splitLines` groups
words against the word before them rather than against the first word of the line â€” otherwise every
word on a tilted line measures a few pixels lower than the last and becomes its own line. And a
chapter is only rotated while it is arriving: once it is flat it carries `data-flat`, which drops
the transform and hands the frames back to whatever is pinned inside it.

Chapter 04 is a panel, not a column of content: one screen tall, its copy and its plot sharing the
screen, because a handover has to land on a page rather than on a fragment. Its padding comes down
and the plot gives way â€” a square figure, so its height is the chapter's â€” down to a floor at short
viewports, where the copy wraps onto more lines than the screen has room for and the panel is
allowed a few percent of overrun.

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

### Chapter rail

A fixed column of six markers stubs off one spine, so the six chapters read as one path rather than
six links. The active marker widens and takes the signal colour; the label is a hover affordance, not
furniture, because it would run into the headline below about 1700px. There is no travelling dot:
it answered "how far along" on behalf of nobody, and cost a scroll listener and a remeasure on every
height change to do it.

### Header chapter readout

Below 900px nothing else says where you are: the rail lives in the desktop margin and the
chapter menu is closed. `.header__now` renders `NN LABEL`, keyed by chapter so the fade replays
on a boundary, and `aria-hidden` because it repeats the heading already in the document.

## 6. Figures

Project diagrams are Excalidraw scenes exported by hand to PNG and shown through a `<dialog>`
lightbox (zoom, pan, keyboard). See `docs/diagrams/README.md`.

An export is 1460â€“1687px wide drawn in a ~680px card, and as a PNG it is 78â€“332KB of bytes the
card cannot use at that size. `pnpm images` writes each one at half and at full width in AVIF and
WebP â€” 10â€“56KB per raster at a PSNR the eye cannot tell from the export â€” and `Services.tsx`
lists them through `<picture>`/`srcset`, so the browser takes the first format it decodes and the
rung its own density asks for. The PNG stays as the last-resort `src` for a browser that decodes
neither format, which is the only way it is ever fetched.

The pixel size travels with the source in `Services.tsx`, and the `<img>` carries it as
`width`/`height`. A lazy raster with no intrinsic size contributes no height until it loads, and
the ~750px it then adds shifts every chapter below it out from under the reader.

Lazy loading alone is not enough for these. Below 1024px the projects are one vertical list and
the browser's own heuristics start each raster about a viewport out, but at 1024px and up they live
in a track carried sideways by a transform, and the loader measures what is near the viewport in
*transformed* coordinates: a slide two stages to the right is not near anything, so its raster was
still arriving while the reader looked at the frame. The chapter's figures are warmed a viewport
early instead (`warmImage`, `useWarmFigures`), as a low-priority preload carrying the same
`srcset`/`sizes` the markup does, so the warm and the `<img>` resolve to the same URL and the
second one is a cache hit. Hovering a figure warms the full rung the viewer will ask for.

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
  show `Stripe`, `MassTransit` and `Serilog â†’ Seq/Jaeger`. Deliberately left as is.
- No automated tests and no CI beyond the Cloudflare build.
- Content is English-only, in one file; there is no i18n layer.
- Lighthouse and mobile passes have not been re-run since the redesign.