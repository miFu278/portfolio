/**
 * The raster pipeline: one export in, two rungs in two formats out.
 *
 *   pnpm images            # writes only what is missing or stale
 *   pnpm images --force    # rewrites everything
 *
 * A figure on this page is a 1460–1687px drawing shown in a ~680px card, so the
 * export is both the wrong size for the card and the wrong format: the PNGs are
 * 186–332KB and decode slowly, while the same pixels at the width the card
 * actually asks for, in AVIF, are 12–56KB. `Services.tsx` lists the AVIF first
 * and the WebP second, and the browser takes the first it can decode.
 *
 * The rung set is fixed at [half, full] so the component can derive the URLs
 * from the source path and its pixel width alone — there is no manifest to keep
 * in sync. Half is rounded to an even width so a 1687px drawing yields
 * `rag-844` rather than a fractional scale.
 */
import sharp from 'sharp';
import { mkdir, readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';

/** Most efficient first. Keep this order in step with the `<picture>` sources. */
const FORMATS = [
  { ext: 'avif', options: { quality: 60, effort: 7 } },
  { ext: 'webp', options: { quality: 85, effort: 6 } },
];

/**
 * `background` is for the exports that carry a plate of their own: they are
 * fully opaque but saved with an alpha channel, and flattening drops the plane
 * `avif` would otherwise spend bits on.
 */
const SOURCES = [
  { file: 'public/diagrams/ecommerce.png', background: '#121212' },
  { file: 'public/diagrams/rag.png', background: '#121212' },
  { file: 'public/shots/portfolio-hero.jpg' },
];

const force = process.argv.includes('--force');
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

const rungs = (width) => [Math.round(width / 4) * 2, width];

const run = async ({ file, background }) => {
  const source = await stat(file);
  const { width } = await sharp(file).metadata();
  const stem = file.replace(/\.(png|jpe?g)$/, '');
  const expected = new Set();

  let wrote = 0;
  for (const rung of rungs(width)) {
    for (const { ext, options } of FORMATS) {
      const out = `${stem}-${rung}.${ext}`;
      expected.add(path.basename(out));

      const fresh = await stat(out).then(
        (info) => info.mtimeMs >= source.mtimeMs,
        () => false,
      );
      if (fresh && !force) continue;

      let pipeline = sharp(file);
      if (background) pipeline = pipeline.flatten({ background });
      const info = await pipeline
        .resize({ width: rung })
        .toFormat(ext, options)
        .toFile(out);

      wrote += 1;
      console.log(`  ${out.padEnd(34)} ${String(info.width).padStart(5)}w  ${kb(info.size).padStart(9)}`);
    }
  }

  // A renamed or re-runged source would otherwise leave its old derivatives in
  // public/ to ship forever.
  const dir = path.dirname(file);
  for (const name of await readdir(dir)) {
    if (name.startsWith(`${path.basename(stem)}-`) && !expected.has(name)) {
      await unlink(path.join(dir, name));
      console.log(`  removed ${path.join(dir, name)} (no longer a rung)`);
    }
  }

  console.log(`${file}  ${width}px  ${kb(source.size)} → ${wrote} file(s)`);
};

for (const source of SOURCES) {
  const dir = path.dirname(source.file);
  if (path.basename(dir) !== '.') await mkdir(dir, { recursive: true });
  await run(source);
}
