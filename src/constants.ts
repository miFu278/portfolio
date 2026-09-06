import type { Project, Technology } from './types/type';
import {
  SiDotnet,
  SiPostgresql,
  SiMongodb,
  SiRedis,
  SiRabbitmq,
  SiDocker,
  SiGo,
  SiSupabase
} from 'react-icons/si';
import { VscLayersActive } from 'react-icons/vsc';

export const TECHNOLOGIES: { [key: string]: Technology } = {
  // Backend
  '.NET': { name: '.NET', icon: SiDotnet },
  'Go': { name: 'Go', icon: SiGo },

  // Architecture
  'Clean Architecture': { name: 'Clean Architecture', icon: VscLayersActive },

  // Databases
  'PostgreSQL': { name: 'PostgreSQL', icon: SiPostgresql },
  'MongoDB': { name: 'MongoDB', icon: SiMongodb },
  'Redis': { name: 'Redis', icon: SiRedis },

  // Message Queue
  'RabbitMQ': { name: 'RabbitMQ', icon: SiRabbitmq },
  'pgvector': { name: 'pgvector', icon: SiPostgresql },
  'Supabase': { name: 'Supabase', icon: SiSupabase },

  // Infrastructure
  'Docker': { name: 'Docker', icon: SiDocker },
};

export const PROJECTS: Project[] = [
  {
    id: 'distributed-ecommerce-platform',
    title: 'Distributed E-Commerce Platform',
    category: 'Backend Engineer • Distributed Systems',
    image: 'https://picsum.photos/seed/ecommerce/800/450',
    description: 'Designed and built a six-service .NET e-commerce platform for user, product, cart, order, payment, and notification domains. Implemented event-driven communication with RabbitMQ, Redis caching, an Ocelot API Gateway, and PostgreSQL and MongoDB persistence. Orchestrated the distributed application with .NET Aspire and Docker.',
    links: { github: 'https://github.com/miFu278/ECommercePlatform' },
    tech: ['.NET', 'Clean Architecture', 'RabbitMQ', 'Redis', 'PostgreSQL', 'MongoDB', 'Docker'],
  },
  {
    id: 'rag-learning-assistant',
    title: 'RAG Learning Assistant',
    category: 'Backend Engineer • Applied AI',
    image: 'https://picsum.photos/seed/rag-learning/800/450',
    description: 'Led backend development for a four-person RAG learning platform. Built the document ingestion, chunking, embedding, and vector retrieval pipeline with PostgreSQL and pgvector, plus multi-turn, document-grounded chat workflows. Developed supporting logic for authentication, course management, usage credits, and background processing.',
    links: { github: 'https://github.com/miFu278/PRN222_ASM' },
    tech: ['.NET', 'PostgreSQL', 'pgvector', 'Supabase'],
  },
];
