import { useEffect, useState } from 'react';
import { LAYER_ORDER, PROJECTS, TECHNOLOGIES, chapter } from '../../../config/content';
import type { DiagramKey, Project } from '../../../types';
import ChapterHead from '../../../components/ui/ChapterHead';
import Reveal from '../../../components/ui/Reveal';
import Lightbox, { type LightboxFigure } from '../../../components/ui/Lightbox';
import { warmImage } from '../../../lib/warmImage';
import { useActiveProject } from '../hooks/useActiveProject';
import { useWarmFigures } from '../hooks/useWarmFigures';

const SERVICES = chapter('services');
const PROJECT_IDS = PROJECTS.map((p) => p.id);

/**
 * Figures exported by hand from docs/diagrams/*.excalidraw.
 * That folder holds the editable scene; the site ships the raster.
 *
 * The intrinsic size travels with the source because a lazy raster without one
 * contributes no height until it decodes. The box is zero tall at first paint,
 * then grows by the scaled image height, which drags every chapter below it
 * down the page while the reader is mid-scroll. Width and height reserve the
 * box up front; the CSS `width: 100%; height: auto` scales it from there.
 *
 * An export is 1460–1687px wide shown in a ~680px card, and as a PNG it is
 * 78–332KB of bytes the card cannot use at that size. `pnpm images` writes each
 * one at half and at full width in AVIF and WebP; the URLs below are derived
 * from `src` and `width`, so a new figure is one row here plus the script.
 */
interface Diagram {
  src: string;
  width: number;
  height: number;
}

const DIAGRAMS: Record<DiagramKey, Diagram> = {
  ecommerce: { src: '/diagrams/ecommerce.png', width: 1460, height: 804 },
  rag: { src: '/diagrams/rag.png', width: 1687, height: 921 },
  // Not a diagram: a capture of this page's own hero, so the figure the card
  // shows for this project is the thing being described.
  portfolio: { src: '/shots/portfolio-hero.jpg', width: 1600, height: 1000 },
};

type Format = 'avif' | 'webp';

/** The rungs `pnpm images` writes for a source this wide. */
const RUNGS = (width: number) => [Math.round(width / 4) * 2, width];

const stem = (src: string) => src.replace(/\.(png|jpe?g)$/, '');

const rungUrl = (diagram: Diagram, format: Format) =>
  `${stem(diagram.src)}-${RUNGS(diagram.width)[1]}.${format}`;

const srcSet = (diagram: Diagram, format: Format) =>
  RUNGS(diagram.width)
    .map((width) => `${stem(diagram.src)}-${width}.${format} ${width}w`)
    .join(', ');

/**
 * How wide the card actually draws the figure: 680px in the desktop split
 * (1240 content, less gutters, the 320px registry, the gaps and card padding),
 * and the viewport less its gutters below that. Only the format switch reads it,
 * so being a rung out costs bytes, never layout.
 */
const FIGURE_SIZES = '(min-width: 1024px) 680px, 92vw';

const toTechs = (ids: string[]) =>
  ids.map((id) => ({ id, ...TECHNOLOGIES[id] })).filter((t) => t.name);

const TechRow = ({ project }: { project: Project }) => (
  <div className="services__techrow">
    {toTechs(project.tech).map((tech) => (
      <span key={tech.id} className="tech">
        <tech.icon size={12} />
        {tech.name}
      </span>
    ))}
  </div>
);

const Registry = ({ activeProject }: { activeProject?: Project }) => {
  const active = new Set(activeProject?.tech ?? []);
  const all = toTechs(Array.from(new Set(PROJECTS.flatMap((p) => p.tech))));

  return (
    <aside className="registry" aria-label="Technology registry">
      <div className="registry__inner">
        <div className="registry__head">
          <span className="label">registry</span>
          <span className="label signal">{all.length} alive</span>
        </div>

        {LAYER_ORDER.map((layer) => {
          const items = all.filter((t) => t.layer === layer);
          if (items.length === 0) return null;
          return (
            <div className="registry__group" key={layer}>
              <p className="registry__group-title">{layer}</p>
              <div className="registry__items">
                {items.map((tech) => (
                  <span key={tech.id} className="tech" data-active={active.has(tech.id)}>
                    <tech.icon size={12} />
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

const ProjectBlock = ({
  project,
  total,
  register,
  onZoom,
}: {
  project: Project;
  total: number;
  register: (el: HTMLElement | null) => void;
  onZoom: (project: Project, from: DOMRect) => void;
}) => {
  const diagram = project.diagram ? DIAGRAMS[project.diagram] : undefined;

  /** The viewer draws the raster near full screen and zooms to 4x, so it asks
   *  for the full rung. On a 2x desktop that is the rung the card already holds,
   *  which is why hovering the frame warms it before the click. */
  const warmFull = () => {
    if (diagram) warmImage({ url: rungUrl(diagram, 'avif'), type: 'image/avif' });
  };

  return (
    <article className="project" id={project.id} ref={register}>
      <div className="project__head">
        <p className="project__index">
          {project.index} / {String(total).padStart(2, '0')} — {project.year}
        </p>
        <h3 className="project__title">{project.title}</h3>
        <p className="project__meta">{project.meta}</p>
      </div>

      <div className="project__body">
        <p className="body">{project.body}</p>

        {diagram && (
          <Reveal as="figure" className="project__diagram">
            <button
              type="button"
              className="figure"
              data-cursor="media"
              onPointerEnter={warmFull}
              onFocus={warmFull}
              onClick={(event) => onZoom(project, event.currentTarget.getBoundingClientRect())}
              aria-label={`Open ${project.title} architecture full screen`}
            >
              {/* First decodable format wins: AVIF is roughly half the bytes of
                  WebP for line art at the same PSNR. The PNG in `src` is the
                  export itself, and is only fetched by a browser that decodes
                  neither — it is why public/ keeps it. */}
              <picture>
                <source type="image/avif" srcSet={srcSet(diagram, 'avif')} sizes={FIGURE_SIZES} />
                <source type="image/webp" srcSet={srcSet(diagram, 'webp')} sizes={FIGURE_SIZES} />
                <img
                  src={diagram.src}
                  width={diagram.width}
                  height={diagram.height}
                  alt={project.figureAlt ?? `${project.title} architecture`}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
              <span className="figure__hint">click to zoom</span>
            </button>
          </Reveal>
        )}

        <div className="project__stats">
          {project.stats.map((s) => (
            <div key={s.label}>
              <p className="stat__value">{s.value}</p>
              <p className="stat__label">{s.label}</p>
            </div>
          ))}
        </div>

        <TechRow project={project} />

        <a
          className="project__link"
          href={project.links.github}
          target="_blank"
          rel="noopener noreferrer"
        >
          {project.links.github.replace('https://', '')} ↗
        </a>
      </div>
    </article>
  );
};

const Services = () => {
  const { activeId, register } = useActiveProject(PROJECT_IDS);
  const activeProject = PROJECTS.find((p) => p.id === activeId);
  const { ref: splitRef, warm } = useWarmFigures();
  const [zoom, setZoom] = useState<{ diagram: Diagram; alt: string; from: DOMRect } | null>(null);

  // The slides are off to the right of a pinned track, which is a place the
  // lazy loader cannot see (see useWarmFigures). Ask for them here instead, as
  // soon as the chapter is a viewport out, at the priority of something nobody
  // is waiting on yet.
  useEffect(() => {
    if (!warm) return;
    for (const project of PROJECTS) {
      const diagram = project.diagram ? DIAGRAMS[project.diagram] : undefined;
      if (!diagram) continue;
      warmImage({
        url: rungUrl(diagram, 'avif'),
        type: 'image/avif',
        srcSet: srcSet(diagram, 'avif'),
        sizes: FIGURE_SIZES,
      });
    }
  }, [warm]);

  /** The viewer draws the raster near full screen and zooms to 4x, so it asks
   *  for the full rung. The WebP `src` is the fallback for a browser that decoded
   *  no AVIF; on a 2x card it is already in cache from the figure itself, and
   *  hovering the frame warms it for the card that only took the half rung. */
  const zoomFigure: LightboxFigure | null = zoom
    ? {
        src: rungUrl(zoom.diagram, 'webp'),
        sources: [
          { type: 'image/avif', srcSet: rungUrl(zoom.diagram, 'avif') },
          { type: 'image/webp', srcSet: rungUrl(zoom.diagram, 'webp') },
        ],
        alt: zoom.alt,
        width: zoom.diagram.width,
        height: zoom.diagram.height,
      }
    : null;

  return (
    <section id={SERVICES.id} className="chapter chapter--sheet">
      <div className="shell">
        <ChapterHead
          id={SERVICES.id}
          lead="Two systems, both still running. One is a distributed order pipeline; the other keeps a model from answering with something the documents never said."
        />

        <div className="services__split" ref={splitRef}>
          <div className="services__pin">
            <div className="services__stage">
              <div className="services__list">
                {PROJECTS.map((project) => (
                  <ProjectBlock
                    key={project.id}
                    project={project}
                    total={PROJECTS.length}
                    register={register(project.id)}
                    onZoom={(p, from) => {
                      if (!p.diagram) return;
                      setZoom({
                        diagram: DIAGRAMS[p.diagram],
                        alt: p.figureAlt ?? `${p.title} architecture`,
                        from,
                      });
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <Registry activeProject={activeProject} />
        </div>
      </div>

      <Lightbox
        open={zoom !== null}
        figure={zoomFigure}
        from={zoom?.from ?? null}
        onClose={() => setZoom(null)}
      />
    </section>
  );
};

export default Services;
