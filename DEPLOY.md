# Deploy to Cloudflare Workers

Hosting target: Cloudflare Workers (static assets). Config lives in `wrangler.jsonc`.

## First-time setup (dashboard)

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Import a repository**.
2. Pick this repo, then:
   - Build command: `pnpm build`
   - Deploy command: `pnpm deploy` (= `wrangler deploy`)
3. Save. Every push to `main` rebuilds and deploys.

`wrangler.jsonc` already pins `name`, `compatibility_date`, `assets.directory = ./dist`
and `not_found_handling: single-page-application`, so the build does not need to guess
anything (and must not re-run the interactive setup wizard).

## Deploy from your machine

```bash
pnpm deploy                      # wrangler deploy (builds first via wrangler build.command)
pnpm exec wrangler login         # once, if not logged in
pnpm exec wrangler dev           # preview the built site locally, SPA routing included
```

## Environment variables

EmailJS keys stay in `.env` (gitignored) for local dev. For production set the same
`VITE_*` values as **Build variables** in the Cloudflare project settings, so they are
inlined at build time.

## Troubleshooting

### `ERR_PNPM_IGNORED_BUILDS: workerd`
pnpm blocks dependency build scripts. `workerd` must be in `onlyBuiltDependencies`
in `pnpm-workspace.yaml` (already done). Same fix if another native dep shows up.

### Site loads but CSS/JS 404
`base` in `vite.config.ts` must be `'/'` for Cloudflare. It was `/portfolio/` when the
site ran on GitHub Pages.

### Deploy runs an interactive "Configuring project for Vite / Proceed with setup?"
`wrangler.jsonc` was missing or not committed. Commit it so the wizard never runs in CI.

### Custom domain
Workers → project → **Settings** → **Domains & Routes** → **Add custom domain**, then point
the DNS record at Cloudflare. After that, update the canonical/OG URLs in `index.html`,
`public/sitemap.xml` and `public/robots.txt`.
