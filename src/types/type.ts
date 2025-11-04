import type { IconType } from 'react-icons';

export interface Technology {
  name: string;
  icon: IconType;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  year: number;
  image: string;
  description: string;
  metrics?: { commits: number; contributors: number };
  links: { github: string; demo?: string };
  tech: string[];
}