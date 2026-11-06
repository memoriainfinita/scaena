// The user's own document templates: a name, the paper and how the rider is laid out, kept in this browser to start
// other shows from. They hold no data of the show and no logo.
import { signal } from '@preact/signals';
import * as v from 'valibot';
import { ALL_SECTIONS, effectiveSections, type SectionId } from '../document/sections.ts';
import { Paper, type Show } from '../model/schema.ts';
import { session } from './state.ts';

export const MAX_TEMPLATES = 30;
export const MAX_NAME = 60;
const KEY = 'scaena:doctemplates';

const Blocks = v.union([v.literal('auto'), v.literal(1), v.literal(2), v.literal(3), v.literal(4)]);
const DocTemplate = v.object({
  id: v.pipe(v.string(), v.minLength(1), v.maxLength(40)),
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(MAX_NAME)),
  paper: Paper,
  sections: v.array(v.picklist(ALL_SECTIONS)),
  planScale: v.nullable(v.pipe(v.number(), v.minValue(1))),
  inputs: v.object({ landscape: v.boolean(), blocks: Blocks }),
});
export type DocTemplate = v.InferOutput<typeof DocTemplate>;

function read(): DocTemplate[] {
  try {
    const parsed = v.safeParse(v.array(DocTemplate), JSON.parse(localStorage.getItem(KEY) ?? '[]'));
    return parsed.success ? parsed.output.slice(0, MAX_TEMPLATES) : [];
  } catch {
    return [];
  }
}

export const docTemplates = signal<DocTemplate[]>(read());

function write(list: DocTemplate[]): void {
  docTemplates.value = list;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Private mode or blocked storage: the templates last for this session only.
  }
}

/** Sections that need a module: left out when a show applying the template has that module off. */
const NEEDS: Partial<Record<SectionId, 'audio' | 'lights'>> = { inputs: 'audio', outputs: 'audio', lights: 'lights', rigging: 'lights', magic: 'lights', electrical: 'lights' };

/** The template as it is for the open show: the sections it prints now, the paper and the layout. */
export function templateOf(show: Show, name: string, id: string): DocTemplate {
  return { id, name: name.trim().slice(0, MAX_NAME), paper: show.paper, sections: effectiveSections(show), planScale: show.document.planScale, inputs: { ...show.document.inputs } };
}

/** The show with the template's layout: a custom document with its sections, minus those whose module is off. */
export function withTemplate(show: Show, tpl: DocTemplate): Show {
  const sections = tpl.sections.filter((s) => !NEEDS[s] || show.modules.includes(NEEDS[s]!));
  return { ...show, paper: tpl.paper, document: { ...show.document, template: 'custom', sections, planScale: tpl.planScale, inputs: { ...tpl.inputs } } };
}

/** Keeps the open show's layout under a name; the same name (any case) is replaced. False when the name is empty or there is no room. */
export function saveDocTemplate(name: string): boolean {
  const s = session.value;
  const clean = name.trim().slice(0, MAX_NAME);
  if (!s || !clean) return false;
  const list = docTemplates.value;
  const same = list.find((x) => x.name.toLowerCase() === clean.toLowerCase());
  if (!same && list.length >= MAX_TEMPLATES) return false;
  const id = same?.id ?? `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
  const tpl = templateOf(s.show.value, clean, id);
  write(same ? list.map((x) => (x.id === id ? tpl : x)) : [...list, tpl]);
  return true;
}

export function applyDocTemplate(id: string): boolean {
  const tpl = docTemplates.value.find((x) => x.id === id);
  if (!tpl || !session.value) return false;
  session.value.commit((show) => withTemplate(show, tpl));
  return true;
}

export const deleteDocTemplate = (id: string): void => write(docTemplates.value.filter((x) => x.id !== id));
