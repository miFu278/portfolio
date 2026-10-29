import { useState } from 'react';
import { LAYER_ORDER, PROJECTS, TECHNOLOGIES, chapter } from '../../../config/content';
import type { DiagramKey, Project } from '../../../types';
import ChapterHead from '../../../components/ui/ChapterHead';
import Reveal from '../../../components/ui/Reveal';
import Lightbox from '../../../components/ui/Lightbox';
import { useActiveProject } from '../hooks/useActiveProject';

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
 */
const DIAGRAMS: Record<DiagramKey, { src: string; width: number; height: number }> = {
  ecommerce: { src: '/diagrams/ecommerce.png', width: 1460, height: 804 },
  rag: { src: '/diagrams/rag.png', width: 1687, height: 921 },
};

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
  onZoom: (project: Project) => void;
}) => {
  const diagram = project.diagram ? DIAGRAMS[project.diagram] : undefined;

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
              onClick={() => onZoom(project)}
              aria-label={`Open ${project.title} architecture full screen`}
            >
              <img
                src={diagram.src}
                width={diagram.width}
                height={diagram.height}
                alt={`${project.title} architecture`}
                loading="lazy"
                decoding="async"
              />
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
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);

  return (
    <section id={SERVICES.id} className="chapter">
      <div className="shell">
        <ChapterHead
          id={SERVICES.id}
          lead="Two systems, both still running. One is a distributed order pipeline; the other keeps a model from answering with something the documents never said."
        />

        <div className="services__split">
          <div className="services__pin">
            <div className="services__stage">
              <div className="services__list">
                {PROJECTS.map((project) => (
                  <ProjectBlock
                    key={project.id}
                    project={project}
                    total={PROJECTS.length}
                    register={register(project.id)}
                    onZoom={(p) =>
                      setZoom(
                        p.diagram
                          ? { src: DIAGRAMS[p.diagram].src, alt: `${p.title} architecture` }
                          : null,
                      )
                    }
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
        src={zoom?.src ?? ''}
        alt={zoom?.alt ?? ''}
        onClose={() => setZoom(null)}
      />
    </section>
  );
};

export default Services;
