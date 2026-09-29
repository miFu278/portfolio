import React, { useState, useRef, useEffect } from 'react';
import { PROJECTS, TECHNOLOGIES } from '../constants';
import ScrollReveal from './ScrollReveal';
import TextReveal from './TextReveal';

const ProjectsAndTech: React.FC = () => {
    const [activeProjectId, setActiveProjectId] = useState<string | null>(PROJECTS[0]?.id || null);
    const projectRefs = useRef<(HTMLDivElement | null)[]>([]);
    const lastActiveRef = useRef<string | null>(null);

    // Debug log - only when actually changes
    useEffect(() => {
        if (lastActiveRef.current !== activeProjectId) {
            lastActiveRef.current = activeProjectId;
        }
    }, [activeProjectId]);

    // Only use intersection observer on desktop
    useEffect(() => {
        const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
        if (!isDesktop) return;

        let rafId: number | null = null;

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }

            rafId = requestAnimationFrame(() => {
                let maxRatio = 0;
                let mostVisibleEntry: IntersectionObserverEntry | null = null;

                for (const entry of entries) {
                    if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
                        maxRatio = entry.intersectionRatio;
                        mostVisibleEntry = entry;
                    }
                }

                if (mostVisibleEntry) {
                    const target = mostVisibleEntry.target as HTMLElement;
                    const newId = target.id;

                    setActiveProjectId(prev => {
                        if (prev !== newId) {
                            return newId;
                        }
                        return prev;
                    });
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersection, {
            threshold: [0.3, 0.5, 0.7],
            rootMargin: '-30% 0px -30% 0px'
        });

        projectRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            projectRefs.current.forEach((ref) => {
                if (ref) observer.unobserve(ref);
            });
        };
    }, []);

    const activeProject = PROJECTS.find((p) => p.id === activeProjectId);
    const activeTechIds = new Set(activeProject?.tech || []);

    // Get all unique technologies from all projects
    const allTechIds = Array.from(new Set(PROJECTS.flatMap(p => p.tech)));
    const allTechs = allTechIds.map(id => ({ id, ...TECHNOLOGIES[id] })).filter(t => t.name);

    return (
        <section
            id="projects"
            className="relative py-20 md:py-28 scroll-mt-24"
        >
            <div className="text-center mb-12 md:mb-16 px-4">
                <div className="flex justify-center">
                    <TextReveal
                        text="Selected Projects & Tech Stack"
                        animation="slide-right"
                        className="text-3xl sm:text-4xl md:text-5xl font-bold text-white justify-center"
                        delay={100}
                    />
                </div>
                <ScrollReveal animation="slide-left" delay={200}>
                    <p className="text-sm sm:text-base text-gray-400 mt-2 max-w-xl mx-auto">
                        A selection of backend systems and applied AI work.
                    </p>
                </ScrollReveal>
            </div>

            <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8">
                {/* Mobile Layout - Project with its tech stack below */}
                <div className="lg:hidden space-y-12">
                    {PROJECTS.map((project, index) => {
                        const projectTechs = project.tech.map(id => ({ id, ...TECHNOLOGIES[id] })).filter(t => t.name);

                        return (
                            <ScrollReveal
                                key={project.id}
                                animation="fade-up"
                                delay={index * 100}
                                className="space-y-6"
                            >
                                {/* Project Card */}
                                <div className="card-hover-glow w-full rounded-xl p-6 sm:p-8 border border-gray-700/80 hover:border-white/50 bg-white/[0.02]">
                                    <TextReveal
                                        text={project.title}
                                        as="h3"
                                        animation="slide-right"
                                        className="text-2xl sm:text-3xl font-bold text-white mb-2"
                                        delay={100}
                                    />
                                    <p className="text-gray-400 text-xs sm:text-sm uppercase tracking-wider mb-4 font-mono">{project.category}</p>

                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-gray-500 text-xs uppercase tracking-wider mb-2 font-mono">DESCRIPTION</h4>
                                            <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{project.description}</p>
                                        </div>

                                        <div className="flex justify-end pt-4 border-t border-gray-800">
                                            <a
                                                href={project.links.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-400 hover:text-white transition-colors text-sm font-mono flex items-center gap-1 group"
                                            >
                                                View Project <span className="transition-transform group-hover:translate-x-1">→</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Tech Stack for this project */}
                                <div className="rounded-xl p-5 border border-gray-700/80 bg-white/[0.01]">
                                    <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider font-mono">
                                        Technologies Used
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {projectTechs.map((tech) => {
                                            const IconComponent = tech.icon;
                                            return (
                                                <div
                                                    key={tech.id}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/15 text-gray-200 rounded-lg text-xs font-medium"
                                                >
                                                    <IconComponent size={14} />
                                                    <span>{tech.name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </ScrollReveal>
                        );
                    })}
                </div>

                {/* Desktop Layout - Side-by-side layout */}
                <div className="hidden lg:flex gap-20">
                    {/* Left side - Projects */}
                    <div className="flex-1 min-w-0 space-y-32">
                        {PROJECTS.map((project, index) => (
                            <div
                                key={project.id}
                                id={project.id}
                                ref={(el) => {
                                    projectRefs.current[index] = el;
                                }}
                                className="min-h-[80vh] flex items-center"
                            >
                                <ScrollReveal animation="fade-right" delay={80} className="w-full">
                                    <div className="card-hover-glow w-full rounded-xl p-12 border border-gray-700/80 hover:border-white/50 bg-white/[0.02]">
                                        <TextReveal
                                            text={project.title}
                                            as="h3"
                                            animation="slide-right"
                                            className="text-4xl lg:text-5xl font-bold text-white mb-4"
                                            delay={120}
                                        />
                                        <p className="text-gray-400 text-sm uppercase tracking-wider mb-8 font-mono">{project.category}</p>

                                        <div className="space-y-8">
                                            <div>
                                                <h4 className="text-gray-500 text-xs uppercase tracking-wider mb-3 font-mono">DESCRIPTION</h4>
                                                <p className="text-gray-300 leading-relaxed text-base lg:text-lg">{project.description}</p>
                                            </div>

                                            <div className="flex justify-end pt-6 border-t border-gray-800">
                                                <a
                                                    href={project.links.github}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-400 hover:text-white transition-colors text-base font-mono flex items-center gap-1.5 group"
                                                >
                                                    View Project <span className="transition-transform group-hover:translate-x-1.5">→</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            </div>
                        ))}
                    </div>

                    {/* Right side - Sticky Tech Stack (Desktop only) */}
                    <aside className="w-[550px] shrink-0">
                        <div className="sticky top-52 max-h-[calc(100vh-120px)]">
                            <ScrollReveal animation="fade-left" delay={200}>
                                <div className="rounded-xl p-8 border border-gray-700/80 hover:border-white/50 bg-white/[0.02] card-hover-glow">
                                    <h3 className="text-2xl font-bold text-white mb-8 font-mono">Tech Stacks</h3>

                                    <div className="flex flex-wrap gap-3.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                                        {allTechs.map((tech) => {
                                            const IconComponent = tech.icon;
                                            const isActive = activeTechIds.has(tech.id);
                                            const isLarge = ['PostgreSQL', 'ASP.NET Core', 'Clean Architecture'].includes(tech.name);
                                            const isMedium = ['React', '.NET', 'MongoDB', 'Go'].includes(tech.name);

                                            return (
                                                <div
                                                    key={tech.id}
                                                    className={`relative flex items-center justify-center rounded-2xl transition-all duration-300 ${
                                                        isLarge ? 'px-8 py-5 min-w-[180px]' :
                                                        isMedium ? 'px-6 py-4 min-w-[140px]' :
                                                        'px-5 py-4 min-w-[110px]'
                                                    } ${isActive
                                                        ? 'bg-white/95 text-gray-900 shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-100 font-semibold'
                                                        : 'bg-gray-800/40 text-gray-500 opacity-40 scale-95 hover:opacity-70'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <IconComponent size={isLarge ? 24 : 20} />
                                                        <span className={`font-mono ${isLarge ? 'text-base' : 'text-sm'}`}>
                                                            {tech.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
};

export default ProjectsAndTech;
