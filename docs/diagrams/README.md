# Project diagrams

## What lives here

| File | Role |
|---|---|
| `ecommerce-full.excalidraw` | Editable scene for the e-commerce platform. The detailed one. |
| `ecommerce.excalidraw` | Compact scene, kept for reference. Not currently used. |

Excalidraw scenes are JSON. No browser can display them, so there is always an export step.
The rendered figures the site ships are the PNGs the repo owner exports by hand from
Excalidraw — see below.

## Workflow

1. Open a `.excalidraw` file at [excalidraw.com](https://excalidraw.com) (File → Open) or in
   the VS Code extension.
2. Edit the scene. It is the single source of truth for the figure.
3. Export PNG with the background **on** and the colour set to `#121212` — that is the plate
   colour the card uses (`--dg` figure plate / `#121212`), so the raster does not show as a
   lighter rectangle inside the dark card.
4. Crop the margins before exporting. At ~1500px wide inside a ~680px card the figure scales
   to about 0.47, which puts a 13px label on screen at ~6px. Cropping is worth more than
   zooming.
5. Save over the matching file in `public/diagrams/`:

```
public/diagrams/ecommerce.png   ←  from ecommerce-full.excalidraw
public/diagrams/rag.png         ←  from the RAG scene
```

6. `pnpm build` — nothing to edit in code. The mapping lives in one place:

```ts
// src/features/services/components/Services.tsx
const DIAGRAM_SRC: Record<DiagramKey, string> = {
  ecommerce: '/diagrams/ecommerce.png',
  rag: '/diagrams/rag.png',
};
```

## Why PNG and not inline SVG

Both were tried.

- **Inline SVG** keeps brand fonts and reads CSS tokens, but it has to be hand-mirrored from
  the scene, so it drifts every time the scene changes. It was removed.
- **Rendering the scene headlessly** to get a real SVG was attempted with
  `coleam00/excalidraw-diagram-skill`'s Playwright renderer. The module bundle builds and
  serves, but the Excalidraw module throws at import time in headless Chromium, so
  `window.__moduleReady` never fires. Not pursued further — manual export is 30 seconds.

PNG is a raster, so **the figure is only as sharp as the export**. Export at the largest
sensible canvas and crop tight.

## Editing the content

Content corrections belong in the scene, not in code. If a label is wrong, fix the
`.excalidraw`, re-export, replace the PNG.

Known drift: the current PNGs predate the code corrections, so they still read `Stripe`,
`MassTransit` and `Serilog → Seq/Jaeger`. The corrected strings live in
`ecommerce-full.excalidraw` but were never re-exported.
