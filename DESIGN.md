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
- One spectacle: the topology canvas behind the hero. Everything else moves only to reveal
  hierarchy.
- `Reveal` fires once and never reverses. Content that vanishes on scroll-up is worse than
  no animation.
- `prefers-reduced-motion` renders a complete static page: reveals are instant and the canvas
  draws a single frame.

## 6. Figures

Project diagrams are Excalidraw scenes exported by hand to PNG and shown through a `<dialog>`
lightbox (zoom, pan, keyboard). See `docs/diagrams/README.md`.

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
