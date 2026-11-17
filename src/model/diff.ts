// What changed between two states of a show, in a few lines a person can read. Used for revisions.
import type { Lang } from '../i18n/index.ts';
import { itemById } from '../library/items.ts';
import type { PlanElement, Show } from './schema.ts';

const W: Record<Lang, Record<string, string>> = {
  es: { added: 'Añadido', removed: 'Quitado', changed: 'Cambiado o movido', more: 'y {n} más', channels: 'Canales', outputs: 'Salidas', mounts: 'Montajes', connections: 'Conexiones', lights: 'Datos de instrumentos de luz modificados', settings: 'Ajustes', content: 'Contenido del documento', same: 'Sin cambios', elements: 'elementos', paper: 'papel', region: 'región eléctrica', modules: 'módulos', stage: 'escenario', lang: 'idioma del documento', units: 'unidades' },
  en: { added: 'Added', removed: 'Removed', changed: 'Changed or moved', more: 'and {n} more', channels: 'Channels', outputs: 'Outputs', mounts: 'Mounts', connections: 'Connections', lights: 'Lighting instrument data changed', settings: 'Settings', content: 'Document content', same: 'No changes', elements: 'elements', paper: 'paper', region: 'electrical region', modules: 'modules', stage: 'stage', lang: 'document language', units: 'units' },
};

/** Parts of the document that are not drawn on the plan: what changed in them is named in one line. `list` ones also say how many entries were added or removed. */
const AREAS: { key: keyof Show; list?: true; es: string; en: string }[] = [
  { key: 'name', es: 'nombre', en: 'name' },
  { key: 'date', es: 'fecha', en: 'date' },
  { key: 'desk', es: 'mesa', en: 'desk' },
  { key: 'desks', list: true, es: 'mesas', en: 'desks' },
  { key: 'universes', es: 'universos', en: 'universes' },
  { key: 'electrical', es: 'instalación eléctrica', en: 'electrical' },
  { key: 'contacts', list: true, es: 'contactos', en: 'contacts' },
  { key: 'schedule', list: true, es: 'horario', en: 'schedule' },
  { key: 'titleBlock', es: 'cajetín', en: 'title block' },
  { key: 'workNotes', list: true, es: 'notas de trabajo', en: 'work notes' },
  { key: 'setlistKind', es: 'tipo de lista', en: 'list kind' },
  { key: 'setlist', list: true, es: 'lista de temas', en: 'setlist' },
  { key: 'notes', es: 'notas', en: 'notes' },
  { key: 'hospitality', es: 'hospitalidad', en: 'hospitality' },
  { key: 'contract', es: 'contrato', en: 'contract' },
  { key: 'event', es: 'evento', en: 'event' },
  { key: 'layers', list: true, es: 'capas', en: 'layers' },
  { key: 'customItems', es: 'elementos propios', en: 'custom items' },
  { key: 'reports', list: true, es: 'informes', en: 'reports' },
  { key: 'document', es: 'configuración del documento', en: 'document settings' },
];

const label = (e: PlanElement, lang: Lang) => e.label || itemById(e.type.id)?.name[lang] || e.type.id;
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function names(list: string[], lang: Lang): string {
  const shown = list.slice(0, 6).join(', ');
  return list.length > 6 ? `${shown} ${W[lang].more!.replace('{n}', String(list.length - 6))}` : shown;
}

/** Added, removed and changed things between `prev` and `next`, one line each; the empty list means nothing changed. */
export function diffShows(prev: Show, next: Show, lang: Lang = next.lang): string[] {
  const w = W[lang];
  const out: string[] = [];

  const added = Object.values(next.elements).filter((e) => !prev.elements[e.id]);
  const removed = Object.values(prev.elements).filter((e) => !next.elements[e.id]);
  const changed = Object.values(next.elements).filter((e) => prev.elements[e.id] && !same(e, prev.elements[e.id]));
  if (added.length) out.push(`${w.added}: ${names(added.map((e) => label(e, lang)), lang)}`);
  if (removed.length) out.push(`${w.removed}: ${names(removed.map((e) => label(e, lang)), lang)}`);
  if (changed.length) out.push(`${w.changed}: ${names(changed.map((e) => label(e, lang)), lang)}`);

  const delta = (title: string, a: Record<string, unknown>, b: Record<string, unknown>) => {
    const plus = Object.keys(b).filter((k) => !(k in a)).length;
    const minus = Object.keys(a).filter((k) => !(k in b)).length;
    const mod = Object.keys(b).filter((k) => k in a && !same(a[k], b[k])).length;
    const parts = [plus ? `+${plus}` : '', minus ? `−${minus}` : '', mod ? `~${mod}` : ''].filter(Boolean);
    if (parts.length) out.push(`${title}: ${parts.join(' ')}`);
  };
  delta(w.channels!, prev.channels, next.channels);
  delta(w.outputs!, prev.outputs, next.outputs);
  delta(w.mounts!, prev.mounts, next.mounts);
  delta(w.connections!, prev.connections, next.connections);

  const lit = Object.values(next.elements).filter((e) => e.luminaire && prev.elements[e.id]?.luminaire && !same(e.luminaire, prev.elements[e.id]!.luminaire)).length;
  if (lit) out.push(`${w.lights}: ${lit}`);

  const settings: string[] = [];
  if (prev.paper !== next.paper) settings.push(w.paper!);
  if (!same(prev.region, next.region)) settings.push(w.region!);
  if (!same(prev.modules, next.modules)) settings.push(w.modules!);
  if (!same(prev.stage.shape, next.stage.shape)) settings.push(w.stage!);
  if (prev.lang !== next.lang) settings.push(w.lang!);
  if (prev.units !== next.units) settings.push(w.units!);
  if (settings.length) out.push(`${w.settings}: ${settings.join(', ')}`);

  const content = AREAS.filter((a) => !same(prev[a.key], next[a.key])).map((a) => {
    const before = prev[a.key];
    const after = next[a.key];
    const n = a.list && Array.isArray(before) && Array.isArray(after) ? after.length - before.length : 0;
    return `${a[lang]}${n ? ` (${n > 0 ? '+' : '−'}${Math.abs(n)})` : ''}`;
  });
  if (content.length) out.push(`${w.content}: ${content.join(', ')}`);
  return out;
}

export const noChangesText = (lang: Lang): string => W[lang].same!;
