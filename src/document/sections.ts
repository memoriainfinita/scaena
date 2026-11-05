// Which sections the rider has. A template is a starting list; touching a section switches to "custom" with an explicit list.
import { luminaires } from '../model/lights.ts';
import type { Show } from '../model/schema.ts';

export const ALL_SECTIONS = ['cover', 'contacts', 'schedule', 'build', 'plan', 'inputs', 'outputs', 'computers', 'lights', 'electrical', 'setlist', 'hospitality', 'contract', 'notes', 'revisions'] as const;
export type SectionId = (typeof ALL_SECTIONS)[number];

export const TEMPLATES = ['concert', 'theatre', 'av', 'custom'] as const;
export type Template = (typeof TEMPLATES)[number];

export const TEMPLATE_SECTIONS: Record<Exclude<Template, 'custom'>, SectionId[]> = {
  concert: ['cover', 'contacts', 'schedule', 'plan', 'inputs', 'outputs', 'setlist', 'hospitality', 'contract', 'notes', 'revisions'],
  theatre: ['cover', 'contacts', 'schedule', 'build', 'plan', 'inputs', 'outputs', 'lights', 'electrical', 'hospitality', 'notes', 'revisions'],
  av: ['cover', 'contacts', 'schedule', 'build', 'plan', 'computers', 'inputs', 'outputs', 'notes', 'revisions'],
};

const inOrder = (ids: Iterable<SectionId>): SectionId[] => {
  const set = new Set(ids);
  return ALL_SECTIONS.filter((s) => set.has(s));
};

/**
 * The sections of the document, in canonical order. Templates add what the show needs on their own: a computer always
 * appears in the computers section, and the light reports come in when the Lights module is on and there is something to list.
 */
export function effectiveSections(show: Show): SectionId[] {
  const { template, sections } = show.document;
  if (template === 'custom') return inOrder(sections);
  const list = new Set(TEMPLATE_SECTIONS[template]);
  if (Object.values(show.elements).some((e) => e.computer)) list.add('computers');
  if (show.modules.includes('lights') && luminaires(show).length > 0) {
    list.add('lights');
    list.add('electrical');
  }
  if (!show.modules.includes('audio')) {
    list.delete('inputs');
    list.delete('outputs');
  }
  return inOrder(list);
}

/** The template a package starts with. */
export function templateForPackage(id: string): Exclude<Template, 'custom'> {
  if (id === 'theatre') return 'theatre';
  if (id === 'conference' || id === 'av') return 'av';
  return 'concert';
}
