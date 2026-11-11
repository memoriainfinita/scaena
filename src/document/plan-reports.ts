// The plan sheets of the rider: any number of pages of the plan, each one a report with its own title, scale, layers and luminaire tags.
// Both kinds work the same way and differ in their defaults: the stage plan draws the layers the editor shows, without tags; the light
// plot draws the lighting layers, with tags (docs/design/plan-sheets-2026-11-11.md).
import type { ReportConfig, Show, Subject } from '../model/schema.ts';

export const PLAN = 'plan';
export const LIGHT_PLAN = 'lightPlan';
export type SheetKind = typeof PLAN | typeof LIGHT_PLAN;

/** What a light plot draws when its report names no layers. */
const LIGHT_SUBJECTS: readonly Subject[] = ['stage', 'lights', 'electrical', 'notes', 'background'];

/** The sheets of a kind. A show with none has the one with the defaults: for the stage plan, the single page older files print. */
export function planReports(show: Show, kind: SheetKind): ReportConfig[] {
  const own = show.reports.filter((r) => r.kind === kind);
  if (own.length > 0) return own;
  return [{ id: `${kind}-default`, kind, title: '', columns: [], landscape: false, scale: kind === PLAN ? show.document.planScale ?? null : null, layerPreset: [] }];
}

/** The layers a sheet draws. Ids the show no longer has are dropped; an empty preset takes the defaults of its kind. */
export function reportLayerIds(show: Show, report: ReportConfig): Set<string> {
  const known = new Set(show.layers.map((l) => l.id));
  const chosen = report.layerPreset.filter((id) => known.has(id));
  if (chosen.length > 0) return new Set(chosen);
  if (report.kind === PLAN) return new Set(show.layers.filter((l) => l.visible).map((l) => l.id));
  return new Set(show.layers.filter((l) => LIGHT_SUBJECTS.includes(l.subject)).map((l) => l.id));
}

/** Whether a sheet tags its luminaires; unset takes the default of its kind. */
export const reportTags = (report: ReportConfig): boolean => report.tags ?? report.kind === LIGHT_PLAN;

/** The heading of a sheet: its own title, or the name of the kind, numbered from the second sheet on. */
export const sheetTitle = (report: ReportConfig, base: string, index: number): string => report.title || (index === 0 ? base : `${base} ${index + 1}`);
