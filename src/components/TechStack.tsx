import React from 'react';
import type { Technology } from '../types/type';

interface TechStackProps {
  technologies: Technology[];
  activeTech: string[]; // Array of tech names that are active
}

const TechStack: React.FC<TechStackProps> = ({ technologies, activeTech }) => {
  return (
    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
      <h3 className="text-2xl font-bold mb-6 text-center text-white">Tech Stack</h3>
      <div className="flex flex-wrap justify-center gap-3">
        {technologies.map((tech) => {
          const Icon = tech.icon;
          const isActive = activeTech.includes(tech.name);

          return (
            <div
              key={tech.name}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ease-in-out border ${
                isActive
                  ? 'bg-white text-black border-white scale-105 shadow-lg'
                  : 'bg-transparent border-white/20 text-gray-500 opacity-40'
              }`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{tech.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TechStack;