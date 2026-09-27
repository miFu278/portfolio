# Design — Than Trinh Minh Phuc Portfolio

Reverse-engineered from the current source (single-page React portfolio). Describes what
exists, not what was intended.

## 1. Purpose

Personal portfolio for a backend software engineer. Goals, in order of page priority:

1. Establish identity (name, role, one-line positioning).
2. Prove depth: real projects, one internship, one paper.
3. Convert: resume download, GitHub, email contact form.

Audience: recruiters and hiring engineers screening for backend/.NET/Go + applied-AI work.

## 2. Stack

| Concern | Choice |
|---|---|
| Framework | React 19 + TypeScript, strict mode |
| Build | Vite 7 (`@vitejs/plugin-react`) + React Compiler (Babel plugin) |
| Styling | Tailwind via **CDN script** in `index.html` + hand-written CSS (`App.css`, `index.css`) |
| Icons | `lucide-react` (UI), `react-icons/si` (brand/tech logos) |
| Email | `@emailjs/browser` (`sendForm`, no backend) |
| Deploy | GitHub Pages at `/portfolio/` via `gh-pages -d dist` |
| Lint | ESLint 9 flat config, react-hooks + react-refresh |

No router, no state library, no CSS framework build step, no test runner.

## 3. Page structure

`src/App.tsx` composes a fixed render order — this order *is* the design:

```
PageLoader        (overlay, self-dismissing)
ScrollProgress    (fixed 1px top bar)
└─ relative min-h-screen bg-black text-gray-100
   ├─ fixed inset-0     → Starfield (canvas, z-0)
   └─ relative z-10
      ├─ Header          #home #about #experience #projects #research #contact
      ├─ Hero            #home
      ├─ About           #about
      ├─ Experience      #experience
      ├─ ProjectsAndTech #projects
      ├─ Research        #research
      └─ Contact         #contact
```

Every section is `id`-addressable and `scroll-mt-24` so the fixed header does not cover
anchor targets. The header nav and the section IDs are the only routing mechanism.

## 4. Visual language

Monochrome terminal aesthetic: black canvas, white ink, gray hierarchy, thin 1px borders
that brighten to `white/50` on hover. Color is used nowhere; the starfield supplies motion
and depth instead of accent hue.

**Tokens (as used in JSX):**

- Background: `#000` (body) — the `#0a0a1a` in `index.html` is overridden by `index.css`.
- Text: `gray-100` (primary), `gray-300` (body), `gray-400` (secondary/meta), `gray-500` (labels).
- Surfaces: `bg-white/5`, borders `border-gray-700` → `hover:border-white/50`; glass variants `border-white/10`, `bg-black/30` + `backdrop-blur-md`.
- Accent/inverted: pure white fill with black text (buttons, active tech pills).
- Radius: `rounded-xl` (cards/inputs), `rounded-2xl` (nav bar, cards), `rounded-full` (avatar, pills).
- Type scale: section `h2` `text-3xl → text-5xl`; card `h3` `text-2xl → text-5xl` (desktop project titles are deliberately oversized); body `text-sm → text-lg`; labels `text-xs uppercase tracking-wider`.
- Responsive: mobile-first, breakpoints `sm / md / lg`; `lg` is also the layout switch (see §7).
- Fonts: `JetBrains Mono` for the whole body (loaded from Google Fonts, set in `App.css`). `Inter` is referenced in `index.html` inline CSS but never loaded — it resolves to monospace.
- Motion: `fadeInUp` keyframe (0.8s ease-out, 30px rise) with staggered `animationDelay` (Hero 200/400/600/800ms; tech pills 50ms × index); `transition-colors duration-300` for hovers; `duration-1000` for section reveals.

Container widths are intentionally inconsistent per section: Hero `max-w-6xl`,
About/Experience/Research `max-w-5xl`, Projects/Contact `max-w-[1600px]`.

## 5. Sections

**PageLoader** — full-screen black overlay, `miFu` wordmark, simulated progress: 150ms
interval, random `+15` per tick, fade at 100%, unmount after 500ms. Purely cosmetic.

**Header** — fixed, blurred, floating pill (`rounded-full`, `border-white/10`) inset with
`px-6 md:px-12 lg:px-24` + `mt-4`. Left: `miFu` logo → `#home`. Center (desktop):
6 nav links. Right (desktop): email. Mobile: hamburger toggling a full menu panel.
Active link is derived from an IntersectionObserver over `section[id]`
(`rootMargin: -30% 0px -65% 0px`).

**Hero** — 10-column grid, text spans 6 (left, desktop) and avatar spans 4 (right).
On mobile the avatar is ordered first. Contents: gradient-clipped name (`bg-clip-text`,
`gray-100 → gray-400`), role, one-line pitch, three CTAs (`View Projects` solid,
`Contact Me` outline, `Resume` outline+download of `ttmp_cv.pdf` with a canonical
filename), and an animated scroll-down cue.

**About** — centered narrative paragraph + two equal cards, "Backend Engineering" and
"Applied AI Research", rendered by a local `CurrentlyLearningItem` component (named for a
previous iteration; content is now focus areas).

**Experience** — single entry, non-card text block: role, company · location, date
(`Jan 2026 - May 2026`), three bullet achievements. Deliberately unembellished compared
to Projects.

**ProjectsAndTech** — the page's centerpiece and its only stateful layout.
- Data: `PROJECTS` + `TECHNOLOGIES` from `src/constants.ts`.
- Desktop (`lg+`): two columns. Left = one project per `min-h-[80vh]` block, spaced
  `space-y-32`; right = `w-[550px]` sticky (`top-52`) tech panel, `overflow-y-auto`, custom
  `scrollbar-thin`. The sticky panel highlights the technologies of the project currently
  most visible (IntersectionObserver, `threshold: [0.3,0.5,0.7]`, `rootMargin: -30% 0px`,
  updates batched in `requestAnimationFrame`); inactive pills drop to `opacity-50 scale-95`.
  Pill sizing is hand-tuned per tech name (`isLarge` / `isMedium` lists) — a manual
  importance ranking, not derived from data.
- Mobile/tablet: the same projects stack, each card followed by its own tech pill row.
- Projects carry `links.github` only; `links.demo` and `metrics` exist in the type but are unused.

**Research** — one card: badge `Under Review`, `First Author · Submitted to FISAT EAI 2026`,
title, two bullets (JEPA world models for OOD detection; 10 paired seeds, EMA score
normalization reversing AUROC rankings).

**Contact** — two columns: contact methods (email, phone, location, GitHub — each an icon
tile + label/value row, mailto/tel/https links) and a three-field form
(name/email/message) posting through EmailJS with a four-state machine
`idle → sending → success | error`; success and error auto-reset after 5s, success clears
the fields. Credentials come from `VITE_EMAILJS_SERVICE_ID / _TEMPLATE_ID / _PUBLIC_KEY`
(see `.env.example`).

## 6. Background and motion system

**Starfield** (`StarField.tsx`) — 2D canvas, no WebGL. Stars are `{x, y, z}`; count is
`width * height / 1000`; each frame `z -= 1.5` and recycles to `canvas.width` when it
reaches 0, giving forward flight. Projection is `perspective = width / z`, offset by a
mouse-parallax term eased toward the cursor at 0.05 per frame (`* 0.1` of raw delta).
Trails come from compositing `rgba(0,0,0,0.2)` over the previous frame instead of clearing.
Resize rebuilds the star array. Cannot be paused — it is a permanent animation loop.

**Reveal on scroll** (`hooks/useFadeIn.ts`) — the single shared reveal mechanism: an
IntersectionObserver at `threshold: 0.1` toggles `opacity-0 translate-y-8` on and off as
the element enters and leaves. Used by Contact and ProjectsAndTech only; other sections are
static. `ScrollProgress` and `Header` run their own observers.

## 7. Responsive strategy

- Base: single column, all sections `px-4 sm:px-6 lg:px-8`, `py-16 md:py-24`.
- `md`: nav links replace the hamburger; Hero splits into text + avatar.
- `lg`: Projects switches from stacked-with-per-project-tech to
  scroll-linked sticky tech panel. This is the only breakpoint that changes layout
  topology rather than density.
- `index.css` adds mobile hygiene: transparent tap highlight, no text-size adjust.

## 8. Data and types

`src/types/type.ts` defines `Technology { name, icon: IconType }` and
`Project { id, title, category, image, description, metrics?, links{github, demo?}, tech[] }`.

`src/constants.ts` holds the entire content model: `TECHNOLOGIES` (a keyed map of 10
entries grouped by comment into Backend / Architecture / Databases / Message Queue /
Infrastructure) and `PROJECTS` (2 entries) whose `tech` fields are keys into that map.
Rendering joins the two: `tech.map(id => ({ id, ...TECHNOLOGIES[id] })).filter(t => t.name)`.

This is the seam to extend: adding content means editing `constants.ts` only. Images are
placeholder `picsum.photos` URLs and `image` is never rendered — projects are text-only.

## 9. Build and deploy

`npm run build` = `tsc -b && vite build`; Vite `base` is `/portfolio/` for builds, `/` for
dev. `npm run deploy` runs the build then `gh-pages -d dist`. Deploy specifics are in
`DEPLOY.md`, EmailJS setup in `EMAILJS_SETUP.md`.

## 10. Known gaps (verified in source, not fixed)

- Tailwind ships as a CDN `<script>`; production users download the full runtime and the
  import map in `index.html` still points at `aistudiocdn.com` for React.
- Dead code: `components/TechStack.tsx`, `components/ProjectCard.tsx` are never imported;
  `.glassmorphism`, `.glow`, `.tech-icon-disabled` in `index.html` are unused;
  `Project.image`, `Project.metrics`, `links.demo` are unrendered.
- Debug `console.log` in `ProjectsAndTech.tsx` (3 sites) and `StarField.tsx` (2 sites).
- `App.css` and `index.css` duplicate the same `html, body, #root` reset.
- `ScrollProgress` divides by possibly-zero `totalHeight` (short viewport → `NaN%`).
- No reduced-motion handling: the starfield loop and scroll-driven reveals always animate.
- All content is hard-coded English; there is no CMS or i18n layer.
- No tests and no CI.
