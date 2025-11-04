import type { Project, Technology } from './types/type';
import {
  SiReact,
  SiDotnet,
  SiPostgresql,
  SiMongodb,
  SiRedis,
  SiRabbitmq,
  SiDocker,
  SiKubernetes,
  SiSwagger,
  SiGo
} from 'react-icons/si';
import { TbBrandCSharp, TbBrandGolang } from 'react-icons/tb';
import { VscLayersActive, VscGitMerge } from 'react-icons/vsc';
import { MdSecurity } from 'react-icons/md';

export const TECHNOLOGIES: { [key: string]: Technology } = {
  // Frontend
  'React': { name: 'React', icon: SiReact },

  // Backend
  'C#': { name: 'C#', icon: TbBrandCSharp },
  '.NET': { name: '.NET', icon: SiDotnet },
  'ASP.NET Core': { name: 'ASP.NET Core', icon: SiDotnet },
  'Go': { name: 'Go', icon: SiGo },
  'Gin': { name: 'Gin', icon: TbBrandGolang },

  // Architecture
  'Clean Architecture': { name: 'Clean Architecture', icon: VscLayersActive },
  'CQRS': { name: 'CQRS', icon: VscGitMerge },

  // Databases
  'PostgreSQL': { name: 'PostgreSQL', icon: SiPostgresql },
  'MongoDB': { name: 'MongoDB', icon: SiMongodb },
  'Redis': { name: 'Redis', icon: SiRedis },

  // Message Queue
  'RabbitMQ': { name: 'RabbitMQ', icon: SiRabbitmq },

  // DevOps
  'Docker': { name: 'Docker', icon: SiDocker },
  'Kubernetes': { name: 'Kubernetes', icon: SiKubernetes },

  // Tools
  'Swagger': { name: 'Swagger', icon: SiSwagger },
  'JWT': { name: 'JWT', icon: MdSecurity },
};

export const PROJECTS: Project[] = [
  {
    id: 'speak-up-api',
    title: 'Speak Up API',
    category: 'Backend Developer • Learning Go',
    year: 2025,
    image: 'https://picsum.photos/seed/speakup/800/450',
    description: 'RESTful API backend for English learning application built with Go and Gin framework. Features JWT authentication with refresh tokens, multi-device session management, OAuth integration, email/phone verification, and comprehensive Swagger documentation.',
    metrics: { commits: 150, contributors: 1 },
    links: { github: 'https://github.com/miFu278/speak-up-api', demo: '#' },
    tech: ['Go', 'Gin', 'PostgreSQL', 'Docker', 'JWT', 'Swagger'],
  },
  {
    id: 'ecommerce-platform',
    title: 'Scalable E-Commerce Platform',
    category: 'Backend Developer • Microservices',
    year: 2025,
    image: 'https://picsum.photos/seed/ecommerce/800/450',
    description: 'Microservices E-Commerce Platform with .NET 9, Clean Architecture, CQRS, Event-Driven design using PostgreSQL, MongoDB, Redis, RabbitMQ, and Kubernetes deployment.',
    metrics: { commits: 450, contributors: 1 },
    links: { github: 'https://github.com/miFu278/ECommercePlatform', demo: '#' },
    tech: ['ASP.NET Core', 'C#', 'Clean Architecture', 'CQRS', 'PostgreSQL', 'MongoDB', 'Redis', 'RabbitMQ', 'Docker', 'Kubernetes', 'Swagger', 'JWT'],
  },
  {
    id: 'online-compiler',
    title: 'Online Code Compiler',
    category: 'Fullstack Developer',
    year: 2025,
    image: 'https://picsum.photos/seed/compiler/800/450',
    description: 'Full-stack web application for writing, compiling, and executing code online across multiple programming languages with syntax-highlighted editor, real-time output, and secure Docker-based execution.',
    metrics: { commits: 320, contributors: 1 },
    links: { github: 'https://github.com/miFu278/online-code-compiler', demo: '#' },
    tech: ['ASP.NET Core', 'C#', 'React', 'PostgreSQL', 'Docker', 'JWT', 'Swagger'],
  },
  {
    id: 'leaderboard',
    title: 'Real Time Leaderboard',
    category: 'Backend Developer',
    year: 2025,
    image: 'https://picsum.photos/seed/leaderboard/800/450',
    description: 'High-performance leaderboard service with ASP.NET Core, PostgreSQL, Redis implementing Clean Architecture and CQRS for real-time score tracking and live rank updates.',
    metrics: { commits: 280, contributors: 1 },
    links: { github: 'https://github.com/miFu278/real-time-leaderboard-api', demo: '#' },
    tech: ['ASP.NET Core', 'C#', 'Clean Architecture', 'CQRS', 'PostgreSQL', 'Redis', 'Docker', 'Swagger', 'JWT'],
  },
];