// Edits of the document settings: template, sections, print scale and paper.
import { ALL_SECTIONS, effectiveSections, type SectionId, type Template } from '../document/sections.ts';
import { LIGHT_PLAN, lightPlanReports } from '../document/plan-reports.ts';
import type { ReportConfig, Show } from '../model/schema.ts';
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

export const setPlanLegend = (planLegend: boolean): void => commit((show) => ({ ...show, document: { ...show.document, planLegend } }));
export const setPlanScale = (planScale: number | null): void => commit((show) => ({ ...show, document: { ...show.document, planScale } }));
export const setInputsLayout = (patch: Partial<Show['document']['inputs']>): void => commit((show) => ({ ...show, document: { ...show.document, inputs: { ...show.document.inputs, ...patch } } }));
export const setPaper = (paper: Show['paper']): void => commit((show) => ({ ...show, paper }));

/** Light plot pages: a report of kind `lightPlan` each. Editing the one a show has by default writes it into the show. */
export function updateLightPlan(id: string, patch: Partial<Omit<ReportConfig, 'id' | 'kind'>>): void {
  commit((show) => {
    const current = lightPlanReports(show).find((r) => r.id === id);
    if (!current) return show;
    const next = { ...current, ...patch };
    const own = show.reports.some((r) => r.id === id);
    return { ...show, reports: own ? show.reports.map((r) => (r.id === id ? next : r)) : [...show.reports, next] };
  });
}

export function addLightPlan(): void {
  commit((show) => {
    const used = new Set(show.reports.map((r) => r.id));
    let n = 1;
    while (used.has(`lightPlan-${n}`)) n++;
    // The default one is written out first, so adding a second keeps the first as it was.
    const base = show.reports.some((r) => r.kind === LIGHT_PLAN) ? show.reports : [...show.reports, ...lightPlanReports(show).map((r) => ({ ...r, id: `lightPlan-${n++}` }))];
    const taken = new Set(base.map((r) => r.id));
    let m = 1;
    while (taken.has(`lightPlan-${m}`)) m++;
    return { ...show, reports: [...base, { id: `lightPlan-${m}`, kind: LIGHT_PLAN, title: '', columns: [], landscape: false, scale: null, layerPreset: [] }] };
  });
}

export const removeLightPlan = (id: string): void => commit((show) => ({ ...show, reports: show.reports.filter((r) => r.id !== id) }));
