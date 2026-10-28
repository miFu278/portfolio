import {
  SiDotnet,
  SiPostgresql,
  SiMongodb,
  SiRedis,
  SiRabbitmq,
  SiDocker,
  SiGo,
  SiSupabase,
} from 'react-icons/si';
import { VscLayersActive } from 'react-icons/vsc';
import { Mail, Phone, MapPin, Github } from 'lucide-react';
import type {
  Chapter,
  ContactChannel,
  ExperienceEntry,
  Mission,
  Project,
  ResearchEntry,
  Technology,
} from '../types';

/* ------------------------------------------------------------------ profile */

export const PROFILE = {
  name: 'Than Trinh Minh Phuc',
  alias: 'miFu',
  role: 'Backend Software Engineer',
  location: 'Ho Chi Minh City, Vietnam',
  timezone: 'ICT',
  email: 'phucttm.dev@gmail.com',
  phone: '+84 375 331 022',
  github: 'https://github.com/miFu278',
  availability: 'Available for work — Q3 2026',
  /** Hero display line. Not a job title: a claim. */
  claim: 'I build the part you never see.',
  lead: 'Backend engineer in Ho Chi Minh City. APIs, distributed systems, data-intensive applications — Go and .NET. Currently researching out-of-distribution detection.',
  siteUrl: 'https://portfolio.mifu278.workers.dev',
} as const;

/* ----------------------------------------------------------------- chapters */

export const CHAPTERS: Chapter[] = [
  { id: 'ingress', numeral: '01', label: 'INGRESS', title: 'I build the part you never see.' },
  { id: 'gateway', numeral: '02', label: 'GATEWAY', title: 'Nothing gets through by accident.' },
  { id: 'services', numeral: '03', label: 'SERVICES', title: 'Six services. One order. Zero lost messages.' },
  { id: 'anomaly', numeral: '04', label: 'ANOMALY', title: "Some inputs don't belong here." },
  { id: 'observability', numeral: '05', label: 'OBSERVABILITY', title: 'Trace the work.' },
  { id: 'response', numeral: '06', label: 'RESPONSE', title: 'Send the request.' },
];

export const chapter = (id: string): Chapter =>
  CHAPTERS.find((c) => c.id === id) ?? CHAPTERS[0];

/* ------------------------------------------------------------- technologies */

export const TECHNOLOGIES: Record<string, Technology> = {
  '.NET': { name: '.NET', icon: SiDotnet, layer: 'runtime' },
  Go: { name: 'Go', icon: SiGo, layer: 'runtime' },

  'Clean Architecture': { name: 'Clean Architecture', icon: VscLayersActive, layer: 'architecture' },

  RabbitMQ: { name: 'RabbitMQ', icon: SiRabbitmq, layer: 'transport' },

  PostgreSQL: { name: 'PostgreSQL', icon: SiPostgresql, layer: 'data' },
  MongoDB: { name: 'MongoDB', icon: SiMongodb, layer: 'data' },
  Redis: { name: 'Redis', icon: SiRedis, layer: 'data' },
  pgvector: { name: 'pgvector', icon: SiPostgresql, layer: 'data' },
  Supabase: { name: 'Supabase', icon: SiSupabase, layer: 'data' },

  Docker: { name: 'Docker', icon: SiDocker, layer: 'infra' },
};

export const LAYER_ORDER: Technology['layer'][] = [
  'runtime',
  'architecture',
  'transport',
  'data',
  'infra',
];

/* ----------------------------------------------------------------- projects */

export const PROJECTS: Project[] = [
  {
    id: 'distributed-ecommerce',
    index: '01',
    title: 'Distributed E-Commerce Platform',
    year: '2026',
    meta: '6 services · .NET Aspire · RabbitMQ · Redis',
    body: 'An order touches user, product, cart, order, payment and notification. RabbitMQ keeps them consistent, Redis keeps them fast, the gateway keeps them honest. Ocelot fronts the whole thing; Aspire plus Docker means one command brings the topology up.',
    stats: [
      { value: '6', label: 'services' },
      { value: '2', label: 'databases' },
      { value: 'event', label: 'driven' },
    ],
    diagram: '/diagrams/ecommerce.svg',
    links: { github: 'https://github.com/miFu278/ECommercePlatform' },
    tech: ['.NET', 'Clean Architecture', 'RabbitMQ', 'Redis', 'PostgreSQL', 'MongoDB', 'Docker'],
  },
  {
    id: 'rag-learning-assistant',
    index: '02',
    title: 'RAG Learning Assistant',
    year: '2026',
    meta: 'team of 4 · pgvector · Supabase',
    body: 'Document ingestion, chunking, embedding, retrieval. Multi-turn answers that can only say what the documents actually said. I owned the backend: the pipeline, the vector search, auth, course management, usage credits, and the background jobs that keep ingestion off the request path.',
    stats: [
      { value: '4', label: 'person team' },
      { value: 'pgvector', label: 'retrieval' },
      { value: 'grounded', label: 'answers' },
    ],
    diagram: '/diagrams/rag.svg',
    links: { github: 'https://github.com/miFu278/PRN222_ASM' },
    tech: ['.NET', 'PostgreSQL', 'pgvector', 'Supabase'],
  },
];

/* --------------------------------------------------------------- experience */

export const EXPERIENCE: ExperienceEntry[] = [
  {
    role: 'Backend Engineer Intern',
    company: 'Tel4VN',
    location: 'Ho Chi Minh City, Vietnam',
    start: '2026-01-06',
    end: '2026-05-29',
    bullets: [
      'Shipped ~50 REST endpoints in Go for an internal HR system — employee, attendance, leave, email and notification workflows.',
      'Designed the PostgreSQL data model: relationships, migrations, indexes, and JWT role-based access control.',
      'Set up Clean Architecture, the repository workflow and Git conventions across a 7-person cross-functional team.',
    ],
  },
];

/* ----------------------------------------------------------------- research */

export const RESEARCH: ResearchEntry = {
  role: 'First author',
  venue: 'FISAT · EAI · 2026',
  status: 'Under review',
  title: 'Latent Surprise Is Protocol-Sensitive: JEPA-Based OOD Detection',
  lead: 'Anomaly detection is the layer that decides a request is unlike anything the system has seen before. My research asks whether a world model can tell — before the request reaches a service that cannot handle it.',
  body: 'We probe JEPA world models as out-of-distribution detectors: a model that predicts in latent space gives you a distance signal for free. Across ten paired seeds we found that online EMA score normalization reverses AUROC rankings — meaning the evaluation protocol, not the architecture, was deciding which detector looked best.',
  facts: [
    { label: 'ROLE', value: 'First author' },
    { label: 'VENUE', value: 'FISAT · EAI · 2026' },
    { label: 'STATUS', value: 'Under review' },
    { label: 'METHOD', value: '10 paired seeds · EMA normalization' },
  ],
};

/* ------------------------------------------------------------------ contact */

export const CONTACT_CHANNELS: ContactChannel[] = [
  { icon: Mail, label: 'Email', value: PROFILE.email, href: `mailto:${PROFILE.email}` },
  { icon: Github, label: 'GitHub', value: '@miFu278', href: PROFILE.github },
  { icon: Phone, label: 'Phone', value: PROFILE.phone, href: `tel:${PROFILE.phone.replace(/\s/g, '')}` },
  { icon: MapPin, label: 'Location', value: PROFILE.location, href: null },
];

export const MISSIONS: Mission[] = [
  { id: 'hiring', label: 'Hiring', subject: 'Role opportunity', opener: "We're hiring for a backend role and your work looked relevant." },
  { id: 'freelance', label: 'Freelance', subject: 'Project enquiry', opener: "I'd like to talk about a project." },
  { id: 'research', label: 'Research', subject: 'Research collaboration', opener: 'I read your OOD detection work and want to discuss it.' },
  { id: 'talking', label: 'Just talking', subject: 'Hello', opener: '' },
];
