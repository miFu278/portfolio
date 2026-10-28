# SPEC — "ONE REQUEST"

Visual + narrative spec for the portfolio rebuild.
Supersedes `DESIGN.md` as the *target* state (DESIGN.md describes the current build).

Reference points: `devinthehood.com` (narrative metaphor, chapter structure, editorial craft)
and `puture.co.kr` (manifesto copy, concrete case descriptions, restraint).

---

## 1. Thesis

> A portfolio about backend engineering should behave like backend engineering:
> you see the result, and the interesting part is the path that produced it.

**The concept:** the whole site is the lifecycle of a single HTTP request.
The starfield is no longer decoration — it is the service topology, and one packet
travels through it as you scroll. Each chapter is a hop: ingress → gateway → services
→ anomaly → observability → response.

**Why this and not a new aesthetic:** the existing starfield canvas, monochrome token set,
and JetBrains Mono base are already coded and already read as "engineer". The problem was
never the look — it was that six animations competed and none of them meant anything.
This spec keeps the assets and gives them a job.

**The rule that keeps it honest:** one color, one meaning. The accent color belongs to the
request. If it is on screen for a decorative reason, it is a bug.

---

## 2. Design principles

1. **One metaphor, all the way down.** Section ids, component names, and copy all speak the
   same language (`ingress`, `gateway`, `registry`, `trace`). No mixed metaphors.
2. **Copy is the design.** Every chapter title is a sentence with a verb in it. No
   "About me", no "My Skills", no "Welcome to my portfolio".
3. **Concrete beats impressive.** "Six services, one order, zero lost messages" is worth more
   than "passionate about scalable architecture". Numbers over adjectives, always.
4. **One moment of spectacle, total silence elsewhere.** The hero packet is the spectacle.
   Every other section earns its motion by revealing hierarchy — nothing moves for decoration.
5. **Reveal, don't animate.** Content is present in the DOM and visible by default; motion
   only plays an entrance. (Already the pattern in `index.css` — keep it.)
6. **Craft shows in details users never name:** a real loader, a live clock, a focus ring,
   a 2px alignment. Fake details are worse than no details.

---

## 3. Design tokens

Replaces the ad-hoc values scattered across JSX. Implement as CSS custom properties in
`src/index.css`, consumed via Tailwind v4 `@theme`.

### Color

| Token | Value | Use |
|---|---|---|
| `--ink-void` | `#08080a` | page background (not `#000` — pure black kills depth) |
| `--ink-raised` | `#111114` | cards, panels |
| `--ink-line` | `#1e1e23` | default 1px borders |
| `--ink-line-hot` | `rgba(255,255,255,0.28)` | hover/focus borders |
| `--text-primary` | `#f2f2f0` | headings |
| `--text-body` | `#b4b4b8` | paragraphs |
| `--text-dim` | `#6e6e76` | meta, labels, timestamps |
| `--signal` | `#5ae6b0` | **the request only** |

**Accent discipline:** `--signal` may appear on: the traveling packet, the active chapter
marker, the availability dot, and a single number per section that matters. Nothing else.
Budget: ≤2% of visible pixels.

### Type

Two families. This is deliberate.

| Role | Family | Notes |
|---|---|---|
| Display + body | **Archivo** (variable, `wdth 62..125`, `wght 100..900`) | the width axis is an expressive tool: condensed for meta, expanded for hero |
| Meta / mono | **JetBrains Mono** 400, 500 | labels, timestamps, log lines, code, numerals only |

**Drop JetBrains Mono as the body font.** Monospace paragraphs are hostile to reading and
were the single biggest legibility cost in the current build. Mono becomes a *signal*:
if it's mono, it's machine output.

Fluid scale (all `clamp`):

| Token | Value | Use |
|---|---|---|
| `--fs-display-xl` | `clamp(3rem, 11vw, 9.5rem)` | hero name |
| `--fs-display-l` | `clamp(2.25rem, 6vw, 4.5rem)` | chapter titles |
| `--fs-display-m` | `clamp(1.75rem, 3.5vw, 2.75rem)` | project titles |
| `--fs-lead` | `clamp(1.0625rem, 1.55vw, 1.375rem)` | lead paragraphs, line-height 1.55 |
| `--fs-body` | `1rem` / 1.65 | paragraphs |
| `--fs-mono` | `0.8125rem` | mono body |
| `--fs-label` | `0.6875rem`, tracking `0.16em`, uppercase | eyebrows, kickers |

Numbers always `font-variant-numeric: tabular-nums`.

### Grid + space

- **One container:** `--w-content: 1320px`, gutters `clamp(1.25rem, 4vw, 4rem)`.
  The current three different `max-w` values (`6xl` / `5xl` / `[1600px]`) put sections on
  three different vertical axes. This is the cheapest visible upgrade in the whole spec.
- Full-bleed sections may escape the container but must re-enter on the same left edge.
- 12 columns, `gap: 1.5rem`. Content rarely exceeds 8 columns; wide type may span 10–12.
- Vertical rhythm: `4 / 8 / 12 / 16 / 24 / 40 / 64 / 96 / 160px`.
  Chapter padding: `clamp(6rem, 12vh, 12rem)` top.

### Radii + elevation

`--r-sm: 4px` (pills, chips), `--r-md: 10px` (cards), `--r-full` (avatar, dots).
Kill `rounded-2xl` on the nav pill — a floating fully-rounded header bar is a 2021 signal.
The header becomes a **flat bar with a bottom hairline** that appears after 80px of scroll.

### Motion

| Token | Value |
|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` (keep — it's already right) |
| `--ease-inout` | `cubic-bezier(0.65, 0, 0.35, 1)` |
| `--d-micro` | `180ms` |
| `--d-ui` | `320ms` |
| `--d-reveal` | `750ms` |
| `--d-chapter` | `1100ms` |
| stagger: lines | `60ms` |
| stagger: chars | `28ms` |

Smooth scroll: **Lenis** (~3KB) driven by `requestAnimationFrame`. No GSAP.
Pinning is done with `position: sticky`, not ScrollTrigger — one less dependency.

---

## 4. Chapter map

Section ids double as the metaphor. `Header` nav and `data-chapter` markers read from this list.

| # | id | Chapter | Content currently in that slot |
|---|---|---|---|
| 00 | — | `ENTRY` | loader (real) |
| 01 | `ingress` | `INGRESS` | Hero |
| 02 | `gateway` | `GATEWAY` | About / focus areas |
| 03 | `services` | `SERVICES` | Projects + tech registry |
| 04 | `anomaly` | `ANOMALY` | Research (JEPA / OOD) |
| 05 | `observability` | `OBSERVABILITY` | Experience |
| 06 | `response` | `RESPONSE` | Contact |

A slim fixed **chapter rail** on the left (desktop only, `≥1280px`): vertical stack of
`01`–`06` in mono, active one gets a `--signal` dot and expands to show its label.
On mobile it collapses to a 2px progress line at the top.

---

## 5. Section specs

### 00 — ENTRY (loader)

**Problem now:** `setInterval` adds a random `+15` every 150ms. Anyone technical spots it in
one second, and it makes the whole site look fake. This single detail costs credibility with
exactly the audience you're targeting.

**Spec:**
- Real progress from three signals: `document.fonts.ready`, hero image `decode()`, and
  `window` load — weighted 40 / 40 / 20.
- Mono counter, tabular nums, `clamp(2rem, 6vw, 4rem)`, bottom-right.
- Words, not a spinner: `ESTABLISHING CONNECTION` → `NEGOTIATING` → `READY`.
- Minimum display 400ms (prevents a flash), hard cap 2.5s, then always releases.
- Exit: content fades up `120ms` behind a `--d-reveal` curtain wipe. No bounce.

### 01 — INGRESS (hero)

**Layout:** full viewport, no vertical centering tricks. The name sits low-left, occupying
columns 1–10. The topology canvas fills the viewport behind it at 35% opacity.

```
┌──────────────────────────────────────────────┐
│ ● Available for work — Q3 2026      01—INGRESS│  ← top row, mono, hairline under
│                                              │
│                                              │
│  Than Trinh                                  │  ← display-xl, wdth 110
│  Minh Phuc                                   │
│                                              │
│  I build the part                            │  ← display-l, italic, --text-body
│  you never see.                              │
│                                              │
│  Backend engineer. APIs, distributed         │  ← lead, max 52ch
│  systems, data-intensive applications.       │
│  Go and .NET.                                │
│                                              │
│  ┌ Follow the request ↓ ┐ ┌ Résumé ┐ ┌ Send a request ┐
│                                              │
│                    [live clock · GMT+7]  ↓   │  ← bottom-right mono
└──────────────────────────────────────────────┘
```

**Copy (final):**
- eyebrow L: `● Available for work — Q3 2026`
- eyebrow R: `01 — INGRESS`
- h1: `Than Trinh Minh Phuc`
- display line: *I build the part you never see.*
- lead: `Backend engineer in Ho Chi Minh City. APIs, distributed systems, data-intensive applications — Go and .NET. Currently researching out-of-distribution detection.`
- CTAs: `Follow the request ↓` (solid) · `Résumé` (ghost) · `Send a request` (ghost)
- corner: `ICT · 14:32:07` (live, ticking, mono)

**Motion:** the h1 reveals by line with a `28ms` char stagger and a `1.05 → 1` width-axis
shrink (the variable font does the work — no transform needed). The packet enters from the
bottom edge and travels up into the topology over `--d-chapter`. Avatar: **remove both orbit
rings and the corona.** Replace with the avatar as one **node** in the topology, slightly
larger than the others, sitting right of the name. It connects. That is the whole idea.

**Mobile:** avatar moves above the name at 96px, topology stays but at 45% opacity and
`0.6×` node count. CTAs stack full-width; `Follow the request` becomes `Scroll ↓`.

### 02 — GATEWAY (about)

**Layout:** asymmetric two-thirds. Chapter title spans cols 1–8 at `--fs-display-l`.
Three manifesto lines to its right, mono, numbered.

**Copy:**
- kicker: `02 — GATEWAY`
- title: `Nothing gets through by accident.`
- lead: `A gateway is where a system decides what it will and won't accept. Auth, rate limits, routing, rejection. Mine works the same way.`
- manifesto (mono, numbered, right col):
  ```
  01  Correctness first.
  02  Then latency.
  03  Then everything else.
  ```
- Two route cards, framed as endpoints:
  - `ROUTE 01 · /backend` — **Backend Engineering** — `Event-driven services, transactional boundaries that hold under concurrency, caches that don't lie. Built to be read by someone else at 3 a.m.`
  - `ROUTE 02 · /research` — **Applied AI Research** — `Out-of-distribution detection with JEPA world models. Whether a model can tell you what it doesn't know.`

**Motion:** title reveals by line. Route cards rise `16px` with `60ms` stagger on first
entry only (never re-trigger on scroll-up — the current build re-hides content, which is
worse than no animation).

### 03 — SERVICES (projects) — the centerpiece

**Layout (≥1024px):** two columns. Left `col-span-8` = stacked project blocks, each
`min-h-[85vh]` so one occupies the viewport. Right `col-span-4` = **sticky registry panel**
(`top: 8rem`, `height: 70vh`) listing all technologies grouped by layer, with the current
project's stack lit and the rest at 35%.

Rename the panel from "tech stack" to **`REGISTRY`** with a mono header
`registry · 10 services alive`.

**Each project block contains** — this is the big content upgrade:

```
PROJECT 01 / 02 ─────────────────────── 2026
Distributed E-Commerce Platform          ← display-m
6 services · .NET Aspire · RabbitMQ      ← mono, --text-dim

[ architecture diagram — see §7 ]        ← full width, 16:9, real asset

An order touches user, product, cart,    ← body, max 56ch
order, payment and notification.
RabbitMQ keeps them consistent,
Redis keeps them fast, the gateway
keeps them honest.

6 services   2 databases   event-driven  ← 3 stat cells, tabular nums
                                     ↗ GitHub
```

**Copy — project 01:**
- title: `Distributed E-Commerce Platform`
- meta: `2026 · 6 services · .NET Aspire · RabbitMQ · Redis`
- body: `An order touches user, product, cart, order, payment and notification. RabbitMQ keeps them consistent, Redis keeps them fast, the gateway keeps them honest. Ocelot fronts the whole thing; Aspire plus Docker means one command brings the topology up.`
- stats: `6 services` / `2 databases` / `event-driven`
- link: `github.com/miFu278/ECommercePlatform ↗`

**Copy — project 02:**
- title: `RAG Learning Assistant`
- meta: `2026 · team of 4 · pgvector · Supabase`
- body: `Document ingestion, chunking, embedding, retrieval. Multi-turn answers that can only say what the documents actually said. I owned the backend: the pipeline, the vector search, auth, course management, usage credits, and the background jobs that keep ingestion off the request path.`
- stats: `4-person team` / `pgvector` / `document-grounded`
- link: `github.com/miFu278/PRN222_ASM ↗`

**Motion:** the block reveals once. The registry panel cross-fades its active layer over
`--d-ui`. No 50ms pill stagger cascade on load (current build) — that reads as a toy.
Projects do **not** animate per project on scroll; only the registry responds.

**Mobile:** registry becomes a horizontally scrollable chip row *pinned under the header*
while projects scroll. Do not repeat the full pill list per card (current behaviour) — it
triples page height for no information.

### 04 — ANOMALY (research) — the differentiator

Almost no junior portfolio has a first-author paper. Give it a chapter of its own, not a card.

**Layout:** full-bleed. Left 5 cols = copy. Right 7 cols = a **score plot** visual
(two distributions, in-distribution vs out-of-distribution, with a threshold line) rendered
as static SVG — not animated, not canvas. It reads as a figure from a paper, which is exactly
the point.

**Copy:**
- kicker: `04 — ANOMALY`
- title: `Some inputs don't belong here.`
- lead: `Anomaly detection is the layer that decides a request is unlike anything the system has seen before. My research asks whether a world model can tell — before the request reaches a service that can't handle it.`
- body: `We probe JEPA world models as OOD detectors: a model that predicts in latent space gives you a distance signal for free. Across ten paired seeds we found that EMA score normalization reverses AUROC rankings — meaning the evaluation protocol, not the architecture, was deciding which detector looked best.`
- facts (mono list):
  ```
  ROLE        First author
  VENUE       FISAT · EAI · 2026
  STATUS      Under review
  METHOD      10 paired seeds · EMA score normalization
  ```

**Motion:** the plot draws its threshold line once (`400ms`), everything else static. This
section should feel like reading, not watching.

### 05 — OBSERVABILITY (experience)

**Layout:** rendered as a trace, not a resume bullet list. Mono, left-aligned timestamp
gutter, hairline guides.

```
2026-01-06 ─┬─ BEGIN    Backend Engineering Intern
            │           <Company> · <Location>
            │
            ├─ DID      <achievement 1 — verb first, keep it to one line>
            ├─ DID      <achievement 2>
            └─ DID      <achievement 3>
2026-05-xx ─┴─ END      completed
```

Keep the real bullets from `Experience.tsx`, but rewrite each to start with a verb and end
with a number. If a bullet has no number, it is not a bullet — it is a sentence.

**Motion:** rows fade in with `60ms` stagger on first entry. That's it.

### 06 — RESPONSE (contact)

**Layout:** two columns. Left = the ask. Right = the form. Full-bleed bottom.

**Copy:**
- kicker: `06 — RESPONSE`
- title: `Send the request.`
- lead: `Tell me what you're building. I'll tell you what it takes.`
- meta: `Replies within 24h · ICT (GMT+7)`
- **mission chips** (pre-fill the form subject — this is the one idea worth stealing from
  devinthehood): `Hiring` · `Freelance` · `Research` · `Just talking`
  Selecting one sets `subject` and writes the first line of the message field.
- form fields: name, email, message. States: `idle → sending → sent | failed`.
- Sent state replaces the button with mono `200 OK · request received`, not a toast.
- Direct links below: email, GitHub, phone, location — as `mailto:` / `https:` rows with a
  hairline between, not as four icon tiles.

**Footer:** single line, mono: `Than Trinh Minh Phuc · Ho Chi Minh City · <clock> · Built by hand`.

---

## 6. The topology canvas (replacing the starfield)

This is the one genuinely custom piece. It is what makes the site defensible as "built, not
templated" — and it is the metaphor, so it has to actually mean something.

**Model**
- `NODES` — 28–40 points, positions relaxed (no two closer than `minDist`), each with a layer
  tag: `edge | gateway | service | store`.
- `EDGES` — each node connects to its 2 nearest neighbours within `maxDist`. Stroke
  `rgba(255,255,255,0.055)`, width `1`.
- `PACKET` — 1–3 particles traveling edge paths on a cubic bezier, `--signal` at 90%,
  with a 12px tail gradient. Speed constant; the *scroll* decides which path.
- Node layers are drawn at different radii (edge 1.5px → store 3px), which gives the
  parallax depth the old starfield faked with `z`.

**Scroll coupling**
`scrollY / docHeight` → `progress`. The active chapter maps to a band of the topology; the
packet travels toward the node band for that chapter. At chapter 04 the packet visibly
diverges and halts before a node — that *is* the OOD detection story, told in 2 seconds
without a paragraph. Time this once; it's the payoff of the whole concept.

**Performance (non-negotiable)**
- `devicePixelRatio` capped at `2`.
- Pause the RAF loop on `document.hidden`, and via `IntersectionObserver` when the canvas
  leaves the viewport.
- Node count scales with area: `clamp(18, w*h/40000, 40)`.
- Single static frame (no loop) when `prefers-reduced-motion: reduce`.
- Draw the edge set once to an offscreen canvas and blit it per frame; only the packet moves.

**Removal list:** `avatar-corona`, `avatar-orbit-slow`, `avatar-orbit-fast`, the `+15` fake
loader, and the 3 `console.log` in `ProjectsAndTech.tsx` + 2 in `StarField.tsx`.

---

## 7. Assets needed from you

Not code — content. These block the section they belong to.

| Asset | For | Format |
|---|---|---|
| Architecture diagram, e-commerce | 03 | SVG preferred (exports crisp, ~10KB). Draw it: `client → Ocelot → 6 services → RabbitMQ / Redis / PostgreSQL / MongoDB` |
| Architecture diagram, RAG pipeline | 03 | SVG: `upload → chunk → embed → pgvector → retrieve → LLM` |
| 1–2 real screenshots per project | 03 | `.avif`, ≤1600px wide, ≤120KB each |
| OOD score plot | 04 | SVG if you can export from your paper; otherwise I'll generate it from your described result |
| Portrait crop, square, neutral bg | 01 | `.avif`, 600×600 |
| 3 achievement bullets with numbers | 05 | text |
| Real deployed URL | meta | text — see §9 |

**You have zero dependency on me to start.** Everything except 03 and 04 can ship without
these.

---

## 8. Accessibility + performance budget

| Requirement | Target |
|---|---|
| JS shipped (gz) | < 180 KB (currently inflated by the Tailwind CDN runtime) |
| LCP on 4G mobile | < 2.0s |
| CLS | < 0.05 |
| Lighthouse a11y | 100 |
| `prefers-reduced-motion` | full support (canvas static, reveals instant) |
| Keyboard | all chapters reachable, visible focus everywhere (already partly done in `index.css` — keep it) |
| Contrast | body text ≥ 4.5:1 on `--ink-void`; `--text-dim` allowed only at ≥ 16px |

**Tailwind CDN removal is the highest-value single change.** `cdn.tailwindcss.com` ships the
full JIT compiler to every visitor; it is explicitly labelled not-for-production. Migrate to
`tailwindcss` v4 as a Vite plugin with `@theme` tokens from §3. Expect a several-hundred-KB
drop and, more importantly, you unlock real tokens instead of string-duplicated classnames.

---

## 9. Bugs to fix while in there (verified, cheap)

- `index.html`: `canonical`, `og:url`, `og:image`, and JSON-LD `url` all still point at
  `miFu278.github.io/portfolio/` — but hosting moved to Cloudflare Workers (`wrangler.jsonc`).
  Wrong canonical is worse than none.
- `index.html`: `<html class="scroll-smooth">` conflicts with Lenis. Remove it.
- `index.html`: `Inter` is loaded and then overridden by JetBrains Mono in `App.css`, so the
  browser downloads a font it never uses. Delete or use per §3.
- `App.css` and `index.css` both reset `html, body, #root`. Duplicate.
- `ScrollProgress` divides by a possibly-zero `totalHeight` → `NaN%` on a short viewport.
- Dead files: `components/TechStack.tsx`, `components/ProjectCard.tsx` (never imported),
  plus `.glassmorphism`, `.glow`, `.tech-icon-disabled` in `index.html`.
- `Project.image`, `Project.metrics`, `links.demo` are declared and never rendered — either
  render them (§5.3) or delete them.

---

## 10. Build order

Sequenced so every phase leaves the site deployable.

**Phase 1 — Foundations (no visual change to speak of, everything else depends on it)**
1. Tailwind CDN → Tailwind v4 build, tokens from §3 as `@theme`.
2. One container width; delete the three `max-w` variants.
3. Font swap: Archivo + JetBrains Mono (mono demoted to meta only).
4. Fix §9 bugs. Ship. Site is now faster and consistent, still monochrome.

**Phase 2 — Structure (the visible payoff)**
5. Chapter ids + chapter rail + real loader counter.
6. Section copy rewritten per §5 (this is most of the "wow", and it's free).
7. Hero rebuilt per §5.01; remove orbit rings/corona.
8. Header: floating pill → flat bar + hairline on scroll.

**Phase 3 — The canvas**
9. Starfield → topology: nodes, edges, packet, scroll coupling, perf guards.
10. The chapter-04 divergence moment.

**Phase 4 — Content depth**
11. Architecture diagrams + screenshots into project blocks.
12. Research section: score plot + facts block.
13. Experience rewritten as a trace.
14. Contact: mission chips + `200 OK` state.

**Phase 5 — Polish**
15. Lenis smoothing.
16. Custom cursor with context labels (`Open ↗` on links, `Drag` on the canvas).
17. JSON-LD/OG refresh against the real domain; `humans.txt`.

Ship after each phase. A portfolio that is 40% of this spec and deployed beats 100% of it
sitting on a branch.

---

## 11. Explicitly out of scope

Written down so it doesn't creep back in:

- **Day/night theme toggle.** Devinthehood has one; it doubles the surface area of every
  color decision for zero hiring signal.
- **CSS-illustrated environments** (their street and factory). 300–600 hours. The payoff is
  their award, not your interview.
- **Horizontal scroll for whole sections.** Kills mobile usability and accessibility.
  One sideways strip is fine; a sideways site is not.
- **3D/WebGL.** The 2D canvas is faster, ships less, and suits a backend engineer better than
  a shader demo does.
- **More than one accent color.** §3.
- **A blog/CMS.** Write the two case studies as static data in `constants.ts` first. If it
  survives three months, then build the system.

---

## 12. Definition of done

- [ ] First paint under 2s on a throttled 4G profile
- [ ] Loader reports real progress; no random numbers anywhere in the source
- [ ] Exactly one animation runs at any moment that isn't revealing hierarchy
- [ ] `--signal` appears on the packet, the active chapter, the availability dot, and one number per section — nowhere else
- [ ] Every chapter title is a sentence with a verb
- [ ] Both projects show a real diagram and at least one number
- [ ] Research section is a chapter, not a card
- [ ] `prefers-reduced-motion` renders a static, complete, readable page
- [ ] Keyboard-only pass reaches all six chapters and submits the form
- [ ] Canonical URL, OG image, and JSON-LD match the deployed domain
