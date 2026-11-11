// The pages of the plan the rider can hold: each one is a preset of layers and a scale. The first is the stage plan as the editor shows it;
// the light plot is a report of its own, once per `ReportConfig` of kind `lightPlan` (docs/design/grupo-1-2026-11-11.md).
import type { ReportConfig, Show, Subject } from '../model/schema.ts';

export const LIGHT_PLAN = 'lightPlan';

/** What a light plot draws when its report names no layers. */
const LIGHT_SUBJECTS: readonly Subject[] = ['stage', 'lights', 'electrical', 'notes', 'background'];

/** The light plot reports of a show; a show with none has the one with the defaults. */
export function lightPlanReports(show: Show): ReportConfig[] {
  const own = show.reports.filter((r) => r.kind === LIGHT_PLAN);
  return own.length > 0 ? own : [{ id: 'lightPlan-default', kind: LIGHT_PLAN, title: '', columns: [], landscape: false, scale: null, layerPreset: [] }];
}

/** The layers a report draws. Ids the show no longer has are dropped; an empty preset takes the defaults of its kind. */
export function reportLayerIds(show: Show, report: ReportConfig): Set<string> {
  const known = new Set(show.layers.map((l) => l.id));
  const chosen = report.layerPreset.filter((id) => known.has(id));
  if (chosen.length > 0) return new Set(chosen);
  return new Set(show.layers.filter((l) => LIGHT_SUBJECTS.includes(l.subject)).map((l) => l.id));
}
