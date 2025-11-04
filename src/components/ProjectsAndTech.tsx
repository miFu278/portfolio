import React, { useState, useRef, useEffect } from 'react';
import { PROJECTS, TECHNOLOGIES } from '../constants';
import useFadeIn from '../hooks/useFadeIn';

const ProjectsAndTech: React.FC = () => {
    const [activeProjectId, setActiveProjectId] = useState<string | null>(PROJECTS[0]?.id || null);
    const projectRefs = useRef<(HTMLDivElement | null)[]>([]);
    const sectionRef = useRef<HTMLDivElement>(null);
    const lastActiveRef = useRef<string | null>(null);
    useFadeIn(sectionRef);

    // Debug log - only when actually changes
    useEffect(() => {
        if (lastActiveRef.current !== activeProjectId) {
            console.log('🎯 Active project changed:', activeProjectId);
            lastActiveRef.current = activeProjectId;
        }
    }, [activeProjectId]);

    // Only use intersection observer on desktop
    useEffect(() => {
        // Check if desktop
        const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
        if (!isDesktop) return;

        let rafId: number | null = null;

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            // Cancel previous animation frame to debounce
            if (rafId) {
                cancelAnimationFrame(rafId);
            }

            rafId = requestAnimationFrame(() => {
                let maxRatio = 0;
                let mostVisibleEntry: IntersectionObserverEntry | null = null;

                // Find the most visible entry
                for (const entry of entries) {
                    if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
                        maxRatio = entry.intersectionRatio;
                        mostVisibleEntry = entry;
                    }
                }

                if (mostVisibleEntry) {
                    const target = mostVisibleEntry.target as HTMLElement;
                    const newId = target.id;

                    // Only update if actually changed
                    setActiveProjectId(prev => {
                        if (prev !== newId) {
                            console.log('📍 Switching from', prev, 'to', newId, '| ratio:', maxRatio.toFixed(2));
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
            ref={sectionRef}
            className="opacity-0 transform translate-y-8 transition-all duration-1000 ease-out py-16 md:py-24 scroll-mt-24"
        >
            <div className="text-center mb-12 md:mb-16 px-4">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">My Projects & Tech Stack</h2>
                <p className="text-sm sm:text-base text-gray-400 mt-2">Scroll through to see my work and tools.</p>
            </div>

            <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8">
                {/* Mobile Layout - Project with its tech stack below */}
                <div className="lg:hidden space-y-12">
                    {PROJECTS.map((project) => {
                        const projectTechs = project.tech.map(id => ({ id, ...TECHNOLOGIES[id] })).filter(t => t.name);

                        return (
                            <div key={project.id} className="space-y-6">
                                {/* Project Card */}
                                <div className="w-full bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-gray-800/50">
                                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">{project.title}</h3>
                                    <p className="text-gray-400 text-xs sm:text-sm uppercase tracking-wider mb-4">{project.category}</p>

                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-gray-500 text-xs uppercase tracking-wider mb-2">DESCRIPTION</h4>
                                            <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{project.description}</p>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-800 gap-3">
                                            <div className="flex gap-8">
                                                <div>
                                                    <h4 className="text-gray-500 text-xs uppercase tracking-wider mb-1">TYPE</h4>
                                                    <p className="text-white text-sm">{project.category}</p>
                                                </div>
                                                <div>
                                                    <h4 className="text-gray-500 text-xs uppercase tracking-wider mb-1">YEAR</h4>
                                                    <p className="text-white text-sm">{project.year}</p>
                                                </div>
                                            </div>
                                            <a
                                                href={project.links.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-400 hover:text-white transition-colors text-sm"
                                            >
                                                View Project →
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Tech Stack for this project */}
                                <div className="bg-black/50 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                                    <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                                        Technologies Used
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {projectTechs.map((tech) => {
                                            const IconComponent = tech.icon;
                                            return (
                                                <div
                                                    key={tech.id}
                                                    className="flex items-center gap-2 px-3 py-2 bg-white/90 text-gray-900 rounded-lg text-xs font-medium"
                                                >
                                                    <IconComponent size={14} />
                                                    <span>{tech.name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Desktop Layout - Original side-by-side layout */}
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
                                <div className="w-full bg-gray-900/50 backdrop-blur-sm rounded-xl p-12 border border-gray-800/50 hover:border-white/20 hover:shadow-2xl hover:shadow-white/5 hover:-translate-y-2 transition-all duration-500 group">
                                    <h3 className="text-5xl font-bold text-white mb-6">{project.title}</h3>
                                    <p className="text-gray-400 text-base uppercase tracking-wider mb-10">{project.category}</p>

                                    <div className="space-y-10">
                                        <div>
                                            <h4 className="text-gray-500 text-sm uppercase tracking-wider mb-4">DESCRIPTION</h4>
                                            <p className="text-gray-300 leading-relaxed text-lg">{project.description}</p>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-gray-800">
                                            <div className="flex gap-16">
                                                <div>
                                                    <h4 className="text-gray-500 text-sm uppercase tracking-wider mb-2">TYPE</h4>
                                                    <p className="text-white text-base">{project.category}</p>
                                                </div>
                                                <div>
                                                    <h4 className="text-gray-500 text-sm uppercase tracking-wider mb-2">YEAR</h4>
                                                    <p className="text-white text-base">{project.year}</p>
                                                </div>
                                            </div>
                                            <a
                                                href={project.links.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-400 hover:text-white transition-colors text-base"
                                            >
                                                View Project →
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right side - Sticky Tech Stack (Desktop only) */}
                    <aside className="w-[550px] shrink-0">
                        <div className="sticky top-52 max-h-[calc(100vh-120px)]">
                            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-8 border border-white/10">
                                <h3 className="text-3xl font-bold text-white mb-10">
                                    Tech Stacks
                                    <span className="ml-3 text-base text-gray-500">
                                        ({activeTechIds.size}/{allTechs.length})
                                    </span>
                                </h3>

                                <div className="flex flex-wrap gap-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                                    {allTechs.map((tech, index) => {
                                        const IconComponent = tech.icon;
                                        const isActive = activeTechIds.has(tech.id);
                                        const isLarge = ['PostgreSQL', 'ASP.NET Core', 'Clean Architecture'].includes(tech.name);
                                        const isMedium = ['React', '.NET', 'MongoDB', 'Go'].includes(tech.name);

                                        return (
                                            <div
                                                key={tech.id}
                                                style={{ animationDelay: `${index * 50}ms` }}
                                                className={`relative flex items-center justify-center rounded-2xl transition-all duration-300 animate-fade-in-up ${isLarge ? 'px-8 py-5 min-w-[180px]' :
                                                    isMedium ? 'px-6 py-4 min-w-[140px]' :
                                                        'px-5 py-4 min-w-[110px]'
                                                    } ${isActive
                                                        ? 'bg-white/90 text-gray-900 shadow-lg scale-100'
                                                        : 'bg-gray-800/50 text-gray-500 opacity-50 scale-95'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <IconComponent size={isLarge ? 24 : 20} />
                                                    <span className={`font-medium ${isLarge ? 'text-base' : 'text-sm'}`}>
                                                        {tech.name}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
};

export default ProjectsAndTech;