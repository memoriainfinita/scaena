import { describe, expect, test } from 'vitest';
import { showFromPackage } from '../library/apply.ts';
import { packageById } from '../library/packages.ts';
import { addChannel } from '../model/audio.ts';
import { newShow } from '../model/new.ts';
import { addElement } from '../model/ops.ts';
import type { Show } from '../model/schema.ts';
import { planSvg, printStrokes } from './plan-svg.ts';
import { ALL_SECTIONS, effectiveSections, TEMPLATE_SECTIONS, templateForPackage } from './sections.ts';
import { buildDocument, lit, txt } from './typst-source.ts';
import { DocSection } from '../model/schema.ts';

const rock = () => showFromPackage(packageById('rock')!, 'Mi banda', 'es');
const theatre = () => showFromPackage(packageById('theatre')!, 'Teatro', 'es');

describe('sections', () => {
  test('the schema and the module agree on the list', () => {
    expect([...DocSection.options]).toEqual([...ALL_SECTIONS]);
  });

  test('templates come from the package, and add what the show needs', () => {
    expect(templateForPackage('rock')).toBe('concert');
    expect(templateForPackage('theatre')).toBe('theatre');
    expect(templateForPackage('conference')).toBe('av');
    const show = rock();
    expect(effectiveSections(show)).toEqual(TEMPLATE_SECTIONS.concert);
    const [withPc] = addElement(show, { type: { id: 'control.laptop', version: 1 }, x: 0, y: 0, layerId: 'l-control', computer: { functions: ['sound'], os: 'other', programs: [], license: '', dongle: false, outputs: [] } });
    expect(effectiveSections(withPc)).toContain('computers');
  });

  test('the light reports come in on their own with the Lights module and something to list', () => {
    expect(effectiveSections(theatre())).toEqual(expect.arrayContaining(['lights', 'rigging', 'magic', 'electrical']));
    const noLights = { ...rock(), modules: ['audio' as const, 'document' as const] };
    expect(effectiveSections(noLights)).not.toContain('lights');
  });

  test('a custom template is exactly its list', () => {
    const show: Show = { ...rock(), document: { template: 'custom', sections: ['inputs', 'cover'], planScale: null } };
    expect(effectiveSections(show)).toEqual(['cover', 'inputs']);
  });

  test('without the audio module there are no input or output lists', () => {
    const show: Show = { ...rock(), modules: ['document'] };
    expect(effectiveSections(show)).not.toContain('inputs');
  });
});

describe('Typst source', () => {
  test('user text can never become markup or code', () => {
    expect(lit('a "b" \\ c\nd')).toBe('"a \\"b\\" \\\\ c\\nd"');
    const [show] = addChannel(newShow('#panic("boom")'), { shortName: '*bold* #let x', mic: '$x$ <label> @ref' });
    const b = buildDocument({ ...show, name: '#panic("boom")', modules: ['audio'], document: { template: 'custom', sections: ['inputs', 'cover'], planScale: null } });
    expect(b.source).toContain(txt('#panic("boom")'));
    expect(b.source).not.toMatch(/\n#panic/);
    expect(b.source).toContain(txt('*bold* #let x'));
  });

  test('the footer and title carry the show name, and the language follows the show', () => {
    const b = buildDocument({ ...rock(), lang: 'en' });
    expect(b.source).toContain('lang: "en"');
    expect(b.source).toContain('Technical rider');
    expect(b.source).toContain('#set document(title: "Mi banda — Technical rider"');
  });

  test('empty contacts, schedule, notes and revisions are left out; the plan, inputs and outputs stay', () => {
    const b = buildDocument(rock());
    expect(b.sections).not.toContain('contacts');
    expect(b.sections).not.toContain('schedule');
    expect(b.sections).not.toContain('revisions');
    expect(b.sections).toEqual(expect.arrayContaining(['cover', 'plan', 'inputs', 'outputs']));
    expect(b.files['/plan.svg']).toBeDefined();
  });

  test('hidden contact fields print as a dash and never leak', () => {
    const show: Show = { ...rock(), contacts: [{ id: 'c1', role: 'Técnico', name: 'Ana', phone: '600123456', email: 'ana@x.org', hidden: ['phone', 'email'] }] };
    const b = buildDocument(show);
    expect(b.source).toContain(txt('Ana'));
    expect(b.source).not.toContain('600123456');
    expect(b.source).not.toContain('ana@x.org');
  });

  test('a word too long for its column is reported, and an ordinary note is not', () => {
    const [s1] = addChannel(rock(), { shortName: 'Ñ', mic: 'm', notes: 'una nota normal' });
    const [s2] = addChannel(s1, { shortName: 'https://example.org/una/direccion/larguisima/que/no/se/puede/partir', mic: 'm' });
    const b = buildDocument(s2);
    const over = b.warnings.filter((w) => w.kind === 'overflow');
    expect(over).toHaveLength(1);
    expect(over[0]!.text).toContain('https://example.org');
  });

  test('a print scale the plan cannot fit is reported and the used scale is smaller', () => {
    const show: Show = { ...rock(), document: { ...rock().document, planScale: 5 } };
    const b = buildDocument(show);
    expect(b.warnings.some((w) => w.kind === 'scale')).toBe(true);
    expect(buildDocument({ ...rock(), document: { ...rock().document, planScale: 200 } }).warnings.filter((w) => w.kind === 'scale')).toEqual([]);
  });

  test('the paper changes the page setup', () => {
    expect(buildDocument({ ...rock(), paper: 'Letter' }).source).toContain('paper: "us-letter"');
    expect(buildDocument({ ...rock(), paper: 'A3' }).source).toContain('paper: "a3"');
  });
});

describe('plan SVG', () => {
  const opts = { availWidthMm: 267, availHeightMm: 170, planScale: null, lang: 'es' as const };

  test('print strokes drop non-scaling-stroke and scale widths and dashes to plan units', () => {
    const out = printStrokes('<rect stroke-width="1.5" vector-effect="non-scaling-stroke"/><line stroke-width="4" stroke-dasharray="6 4"/>', 2);
    expect(out).not.toContain('vector-effect');
    expect(out).toContain('stroke-width="3"');
    expect(out).toContain('stroke-width="8"');
    expect(out).toContain('stroke-dasharray="12 8"');
  });

  test('the drawing fits the page, has a legend and a scale bar, and labels every element', () => {
    const p = planSvg(rock(), {}, opts);
    expect(p.widthMm).toBeLessThanOrEqual(267 + 0.01);
    expect(p.heightMm).toBeLessThanOrEqual(170 + 0.01);
    expect(p.fits).toBe(true);
    expect(p.svg).toContain('Guitarra 1');
    expect(p.svg).toMatch(/Escala 1:\d+/);
    expect(p.svg).not.toContain('vector-effect');
  });

  test('an explicit scale is used when it fits and reported when it does not', () => {
    const ok = planSvg(rock(), {}, { ...opts, planScale: 200 });
    expect(ok.fits).toBe(true);
    expect(ok.scaleN).toBe(200);
    const bad = planSvg(rock(), {}, { ...opts, planScale: 5 });
    expect(bad.fits).toBe(false);
    expect(bad.scaleN).toBeGreaterThan(5);
  });

  test('hidden layers are not drawn and user labels are escaped', () => {
    const base = rock();
    const [withText] = addElement(base, { type: { id: 'note.text', version: 1 }, x: 100, y: 100, layerId: 'l-notes', label: '<b>&"x"' });
    const svg = planSvg(withText, {}, opts).svg;
    expect(svg).toContain('&lt;b&gt;&amp;&quot;x&quot;');
    const hidden = { ...withText, layers: withText.layers.map((l) => (l.id === 'l-audio' ? { ...l, visible: false } : l)) };
    expect(planSvg(hidden, {}, opts).svg).not.toContain('Guitarra 1');
  });
});
