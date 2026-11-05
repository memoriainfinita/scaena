// Edits of the document settings: template, sections, print scale and paper.
import { ALL_SECTIONS, effectiveSections, type SectionId, type Template } from '../document/sections.ts';
import type { Show } from '../model/schema.ts';
import { session } from './state.ts';

const commit = (fn: (show: Show) => Show): void => session.value?.commit(fn);

export const setTemplate = (template: Template): void =>
  commit((show) => ({ ...show, document: { ...show.document, template, sections: template === 'custom' && show.document.template !== 'custom' ? effectiveSections(show) : show.document.sections } }));

/** Switching one section on or off turns the document into a custom one that starts from what it has now. */
export const toggleSection = (id: SectionId, on: boolean): void =>
  commit((show) => {
    const current = new Set(effectiveSections(show));
    if (on) current.add(id);
    else current.delete(id);
    return { ...show, document: { ...show.document, template: 'custom', sections: ALL_SECTIONS.filter((s) => current.has(s)) } };
  });

export const setPlanScale = (planScale: number | null): void => commit((show) => ({ ...show, document: { ...show.document, planScale } }));
export const setPaper = (paper: Show['paper']): void => commit((show) => ({ ...show, paper }));
