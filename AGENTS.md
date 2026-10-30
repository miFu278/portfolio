# Agent notes

Read `README.md` (stack, commands) and `DESIGN.md` (visual language, motion and
accessibility contracts) before changing anything. `DESIGN.md` describes the
current code, so a change that contradicts it is either a bug or needs the doc
updated in the same commit.

Rules that have cost time here before:

- **pnpm only.** `scripts/ensure-pnpm.mjs` exits non-zero for npm and yarn.
- **Every word and number lives in `src/config/content.ts`.** Editing content
  never means editing a component.
- **A feature never imports another feature.** Shared code moves down into
  `components/ui`, `hooks`, `lib` or `utils`.
- **`Reveal` fires once and never reverses.** Positional scroll effects may
  scrub in both directions; entrance reveals may not.
- **`prefers-reduced-motion` renders a complete static page**, never a page
  waiting for motion to show its content.
- **`--signal` belongs to the request.** Active marker, availability dot, the
  current project's technologies, one number per section. Budget ~2% of pixels.
- **`--text-dim` is 11px labels only.** It does not clear 4.5:1 on
  `--bg-raised`, so it never carries a sentence.
- **No colour outside the token layer.** Anything painted in JS — the hero
  canvas, the star field — reads its tokens too.

## In-flight work

If `.pi/handoff.md` exists — it is gitignored and local — read it first. It
carries the uncommitted state of the current branch, reproductions for the open
bugs, and the remaining to-do list.
