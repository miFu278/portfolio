import { LAYER_ORDER, PROJECTS, TECHNOLOGIES } from '../../../config/content';
import type { Project, UIVariant } from '../../../types';
import ChapterHead from '../../../components/ui/ChapterHead';
import Reveal from '../../../components/ui/Reveal';
import { useActiveProject } from '../hooks/useActiveProject';
import { CHAPTERS } from '../../../config/content';

const SERVICES = CHAPTERS[2];
const PROJECT_IDS = PROJECTS.map((p) => p.id);

const toTechs = (ids: string[]) =>
  ids.map((id) => ({ id, ...TECHNOLOGIES[id] })).filter((t) => t.name);

const TechRow = ({ project }: { project: Project }) => (
  <div className="services__techrow">
    {toTechs(project.tech).map((tech) => (
      <span key={tech.id} className="tech" data-active="true">
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
}: {
  project: Project;
  total: number;
  register: (el: HTMLElement | null) => void;
}) => (
  <article className="project" id={project.id} ref={register}>
    <div className="project__head">
      <p className="project__index">
        {project.index} / {String(total).padStart(2, '0')} — {project.year}
      </p>
      <h3 className="display-m project__title">{project.title}</h3>
      <p className="project__meta">{project.meta}</p>
    </div>

    <div className="project__body">
      <p className="body">{project.body}</p>

      {project.diagram && (
        <Reveal as="figure" className="project__diagram">
          <img src={project.diagram} alt={`${project.title} architecture`} loading="lazy" />
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

const Services = ({ variant }: { variant: UIVariant }) => {
  const { activeId, register } = useActiveProject(PROJECT_IDS, variant === '1');
  const activeProject = PROJECTS.find((p) => p.id === activeId);

  return (
    <section id={SERVICES.id} className="chapter">
      <div className="shell">
        <ChapterHead
          id={SERVICES.id}
          lead="Two systems, both still running. One is a distributed order pipeline; the other keeps a model from answering with something the documents never said."
        />

        <div className="services__split">
          <div className="services__list">
            {PROJECTS.map((project) => (
              <ProjectBlock
                key={project.id}
                project={project}
                total={PROJECTS.length}
                register={register(project.id)}
              />
            ))}
          </div>

          {variant === '1' && <Registry activeProject={activeProject} />}
        </div>
      </div>
    </section>
  );
};

export default Services;
