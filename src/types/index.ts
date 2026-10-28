import type { IconType } from 'react-icons';

/** Logical layer a technology belongs to. Drives grouping in the registry panel. */
export type TechLayer = 'runtime' | 'transport' | 'data' | 'infra' | 'architecture';

export interface Technology {
  name: string;
  icon: IconType;
  layer: TechLayer;
}

export interface ProjectStat {
  value: string;
  label: string;
}

export interface Project {
  id: string;
  /** Display ordinal, e.g. '01'. Content, not derived from array position. */
  index: string;
  title: string;
  year: string;
  /** Short mono line under the title: stack + scale. */
  meta: string;
  body: string;
  stats: ProjectStat[];
  /** Optional SVG diagram in /public/diagrams. Rendered when present. */
  diagram?: string;
  links: { github: string; demo?: string };
  tech: string[];
}

export interface Chapter {
  id: string;
  numeral: string;
  label: string;
  /** Chapter heading. Always a sentence with a verb. */
  title: string;
}

export interface ExperienceEntry {
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
}

export interface ResearchEntry {
  role: string;
  venue: string;
  status: string;
  title: string;
  lead: string;
  body: string;
  facts: { label: string; value: string }[];
}

export interface ContactChannel {
  icon: IconType;
  label: string;
  value: string;
  href: string | null;
}

export interface Mission {
  id: string;
  label: string;
  subject: string;
  opener: string;
}
