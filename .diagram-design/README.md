# Diagram brand profile

Project profile for the `diagram-design` skill (installed at user scope from
`cathrynlavery/diagram-design`). The skill's §0 gate asks for this on first use;
this file is the answer, so later runs skip it.

## Skin: dark, matched to `src/styles/tokens.css`

| Skill role | This project's token | Value |
|---|---|---|
| `paper` / mask | `--bg-sunk` (figure bg) / `--bg-raised` (label masks) | `#050708` / `#14181a` |
| `ink` | `--text-primary` | `#e8edee` |
| `muted` | `--text-body` | `#9fb0b4` |
| `soft` | `--text-body` | `#9fb0b4` |
| `accent` | `--signal` | `#ffb224` |
| `rule` | `--line` | `#212a2d` |
| `link` | not used | — |

**`soft` deliberately equals `muted`.** The site's own `--text-dim` (`#5d6b6f`) is
about 3:1 on `#14181a` and fails the skill's 4.5:1 text contract. Do not map `soft`
to `--text-dim` in a figure.

`link` (blue) is dropped on purpose: the site runs one accent, and architecture
arrows here are either the focal event path (accent) or async/background (muted
dashed). Adding a hue would break the "one accent" rule the site already follows.

## Typography — a documented deviation

| Skill role | Skill default | Here |
|---|---|---|
| `{title}` | Instrument Serif | **not used** — the exported figure carries no page title; the project card already renders one |
| `{node-name}` | Geist 600 | **Archivo 600** (site display face) |
| `{sublabel}` `{eyebrow}` `{arrow-label}` | Geist Mono | **JetBrains Mono 400** |

The skill's anti-pattern is *"JetBrains Mono as blanket dev font"*. It is not used
that way here: mono carries only sublabels, arrow labels and eyebrows, which is the
technical role the skill reserves for mono. Brand consistency wins over the letter
of the rule; the reason the rule exists does not apply.

## Delivery — inline SVG, not `<img src>`

Figures live in `src/features/services/components/diagrams/*.tsx` and are inlined.

An `<img>`-referenced SVG renders in static mode with no external resource loading,
so a webfont inside it silently falls back to system fonts and the brand pairing is
lost. Inlining also lets the drawing read the same CSS custom properties as the page
(`--dg-*` in `src/styles/app.css`), so there is exactly one source for colour.

## Geometry notes

- viewBox width is 840. The project card is ~760–800px at desktop widths, so the
  figure scales ~0.9; internal type is sized for that (names 13, sublabels 10,
  arrow labels 9, tags 8) rather than for a 1:1 render.
- Node budget held at 9 (skill §7). The e-commerce data plane is an annotation
  column, not three more store nodes.
- The RAG figure kept 7 nodes; the two zones are the point (ingestion off the
  request path vs retrieval on it).
