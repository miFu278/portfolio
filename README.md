# Portfolio — Than Trinh Minh Phuc

Single-page portfolio for a backend software engineer. Six chapters, one page, no router.
Deployed as static assets on Cloudflare Workers.

## Stack

| Concern | Choice |
|---|---|
| Framework | React 19 + TypeScript (strict) |
| Build | Vite 7 + React Compiler |
| Styling | Hand-written CSS with custom-property tokens (`src/styles/`) |
| Icons | `lucide-react`, `react-icons/si` |
| Contact form | `@emailjs/browser` — no backend |
| Deploy | Cloudflare Workers static assets (`wrangler.jsonc`) |

**Package manager: pnpm only.** `scripts/ensure-pnpm.mjs` runs on `preinstall` and exits 1 for
npm/yarn, so a stray `npm install` cannot create a second lockfile.

## Commands

```bash
pnpm install     # dependencies
pnpm dev         # dev server
pnpm build       # tsc -b && vite build → dist/
pnpm preview     # serve the build
pnpm lint        # eslint
pnpm deploy      # wrangler deploy
pnpm icons       # regenerate the favicon set from src/assets/mp-chibi.jpg
pnpm shots       # full-page screenshots via Chrome DevTools Protocol → screenshots/
pnpm scroll      # scroll-pass checks + screenshots → screenshots/scroll/
```

## Structure

```
src/
├── components/
│   ├── layout/   Header · ChapterRail · ScrollProgress · Loader · TopologyCanvas · Footer
│   └── ui/       Reveal · ChapterHead · Lightbox
├── config/
│   └── content.ts     ← every word and number on the site
├── features/          one folder per chapter, each with an index.ts barrel
│   ├── hero/          components/Hero
│   ├── gateway/       components/Gateway          (about)
│   ├── services/      components/Services + hooks/useActiveProject
│   ├── anomaly/       components/Anomaly          (research)
│   ├── observability/ components/Observability    (experience)
│   └── response/      components/Response + hooks/useContactForm
├── hooks/        useActiveSection · useChapterProgress · useClock · useLoadProgress
│                 useReducedMotion · useScrollMotion
├── lib/          emailjs.ts — the only third-party transport boundary
├── pages/        Home.tsx — composes the chapters, owns no logic
├── styles/       tokens.css (design tokens) · app.css (layout + components)
├── types/        index.ts
└── utils/        cn.ts
```

**Editing content never means editing a component.** Copy, project data, technologies,
experience, research and contact channels all live in `src/config/content.ts`.

## Docs

- `DESIGN.md` — design system, chapter structure, motion and accessibility rules.
- `docs/diagrams/README.md` — how the project figures are drawn, exported and wired in.
- `DEPLOY.md` — Cloudflare Workers setup and troubleshooting.
- `EMAILJS_SETUP.md` — contact form credentials.
- `.diagram-design/README.md` — brand profile for the diagram-design skill.
