import type { UIVariant } from '../types';

export interface UIVariantMeta {
  id: UIVariant;
  name: string;
  tagline: string;
  tone: 'dark' | 'light';
  /** Enables the canvas topology behind the hero. */
  canvas: boolean;
  /** Enables the fixed left chapter rail. */
  rail: boolean;
  /** Project section layout. */
  projects: 'sticky-registry' | 'editorial' | 'spec-sheet';
}

export const UI_VARIANTS: Record<UIVariant, UIVariantMeta> = {
  '1': {
    id: '1',
    name: 'ONE REQUEST',
    tagline: 'Dark. Topology canvas. One packet travels as you scroll.',
    tone: 'dark',
    canvas: true,
    rail: true,
    projects: 'sticky-registry',
  },
  '2': {
    id: '2',
    name: 'PAPER',
    tagline: 'Light editorial. Hairline rules. Type does all the work.',
    tone: 'light',
    canvas: false,
    rail: false,
    projects: 'editorial',
  },
  '3': {
    id: '3',
    name: 'REGISTRY',
    tagline: 'Dark console. Mono discipline. Projects as a spec sheet.',
    tone: 'dark',
    canvas: false,
    rail: true,
    projects: 'spec-sheet',
  },
};

export const DEFAULT_VARIANT: UIVariant = '1';

/** Reads `?ui=` from the URL, falling back to the default. */
export const resolveVariant = (search = window.location.search): UIVariant => {
  const raw = new URLSearchParams(search).get('ui');
  if (raw === '1' || raw === '2' || raw === '3') return raw;
  return DEFAULT_VARIANT;
};
