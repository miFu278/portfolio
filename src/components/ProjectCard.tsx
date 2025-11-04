import React from 'react';
import { Github, ExternalLink } from 'lucide-react';
import type { Project } from '../types/type';
import { TECHNOLOGIES } from '../constants';

interface ProjectCardProps {
  project: Project;
  isActive: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, isActive }) => {
  const { title, category, description, links, tech, year } = project;

  return (
    <div
      className={`p-8 rounded-2xl border transition-all duration-500 w-full ${
        isActive ? 'border-white/40 shadow-lg bg-white/5' : 'border-white/10 bg-white/5 opacity-50'
      }`}
    >
      <h3 className="text-4xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-lg mb-4">{category} — {year}</p>
      <p className="text-gray-300 leading-relaxed mb-6">{description}</p>

      {/* Links */}
      <div className="flex items-center gap-4 mb-6">
        <a
          href={links.github}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gray-300 hover:text-white transition"
        >
          <Github size={18} />
          GitHub
        </a>
        {links.demo && (
          <a
            href={links.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition"
          >
            <ExternalLink size={18} />
            Live Demo
          </a>
        )}
      </div>

      {/* Mini Tech badges (mobile only) */}
      <div className="flex flex-wrap gap-2 lg:hidden">
        {tech.map(techId => {
          const info = TECHNOLOGIES[techId];
          if (!info) return null;
          const Icon = info.icon;
          return (
            <div
              key={techId}
              className="flex items-center gap-1.5 bg-gray-700/50 px-2 py-1 rounded text-xs text-gray-200"
            >
              <Icon size={12} />
              <span>{info.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectCard;