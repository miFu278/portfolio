# Portfolio — Than Trinh Minh Phuc

Single-page portfolio for a backend software engineer. Live at
**https://miFu278.github.io/portfolio**.

## Stack

React 19 + TypeScript + Vite 7 (React Compiler enabled), Tailwind classes via CDN in
`index.html` plus hand-written CSS, `@emailjs/browser` for the contact form, deployed to
GitHub Pages with `gh-pages`.

## Commands

Package manager: **pnpm** (see `packageManager` in `package.json`).

```bash
pnpm install     # install dependencies
pnpm dev         # dev server
pnpm build       # type-check + production build into dist/
pnpm preview     # serve the built output
pnpm lint        # eslint
pnpm deploy      # build then publish dist/ to the gh-pages branch
```

## Structure

```
src/
  App.tsx               section order: Hero → About → Experience → ProjectsAndTech → Research → Contact
  constants.ts          PROJECTS and TECHNOLOGIES data — add content here, not in components
  types/type.ts         shared types
  context/              LoadingContext gates the entrance animations behind the page loader
  hooks/                useScrollReveal (IntersectionObserver), useFadeIn
  components/           one file per section + shared reveal/animation primitives
public/                 favicon, robots.txt, sitemap.xml
```

No router (anchor links only), no state library, no test runner.

## Docs

- `DESIGN.md` — design system: layout, tokens, motion, component inventory.
- `DEPLOY.md` — GitHub Pages deploy details and troubleshooting.
- `EMAILJS_SETUP.md` — contact form credentials.
