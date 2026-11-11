import { describe, expect, test } from 'vitest';
import { bare } from '../library/bare.ts';
import { showFromPackage } from '../library/apply.ts';
import { packageById } from '../library/packages.ts';
import { autoNumber, luminaires } from '../model/lights.ts';
import { paperText, plotTexts, tagKey } from '../plan/labels.ts';
import { planBox } from '../plan/geometry.ts';
import { effectiveSections } from './sections.ts';
import { planSvg } from './plan-svg.ts';
import { LIGHT_PLAN, PLAN, planReports, reportLayerIds, reportTags, sheetTitle } from './plan-reports.ts';
import { buildDocument } from './typst-source.ts';

const theatre = () => bare(showFromPackage(packageById('theatre')!, 'Teatro', 'es'));
const rock = () => bare(showFromPackage(packageById('rock')!, 'Banda', 'es'));
const opts = { availWidthMm: 267, availHeightMm: 150, planScale: null, lang: 'es' as const };

describe('light plot reports', () => {
  test('a show with none has the default one, and a preset keeps only layers the show has', () => {
    const show = theatre();
    expect(planReports(show, LIGHT_PLAN)).toHaveLength(1);
    const lights = show.layers.find((l) => l.subject === 'lights')!;
    const audio = show.layers.find((l) => l.subject === 'audio')!;
    const defaults = reportLayerIds(show, planReports(show, LIGHT_PLAN)[0]!);
    expect(defaults.has(lights.id)).toBe(true);
    expect(defaults.has(audio.id)).toBe(false);
    const own = { ...planReports(show, LIGHT_PLAN)[0]!, layerPreset: [audio.id, 'gone'] };
    expect([...reportLayerIds(show, own)]).toEqual([audio.id]);
  });

  test('the section comes in with the Lights module and something to list', () => {
    expect(effectiveSections(theatre())).toContain(LIGHT_PLAN);
    expect(effectiveSections({ ...rock(), modules: ['audio', 'document'] })).not.toContain(LIGHT_PLAN);
  });
});

describe('the light plot drawing', () => {
  test('only the layers of the preset are drawn', () => {
    const show = theatre();
    const all = planSvg(show, {}, opts);
    const lightsOnly = planSvg(show, {}, { ...opts, layerIds: new Set(show.layers.filter((l) => l.subject === 'lights').map((l) => l.id)) });
    expect(lightsOnly.svg.length).toBeLessThan(all.svg.length);
  });

  test('a luminaire carries its unit in a circle and its channel and colour under it, instead of its name', () => {
    const show = autoNumber(theatre());
    const lum = luminaires(show).find((e) => e.luminaire!.unit !== null)!;
    expect(lum).toBeTruthy();
    const plain = planSvg(show, {}, opts).svg;
    const tagged = planSvg(show, {}, { ...opts, fixtureTags: true }).svg;
    expect((tagged.match(/<circle /g) ?? []).length).toBeGreaterThanOrEqual(luminaires(show).length);
    expect((plain.match(/<circle /g) ?? []).length).toBeLessThan((tagged.match(/<circle /g) ?? []).length);
    expect(tagged).toContain(`>${lum.luminaire!.unit}</text>`);
  });

  test('tags are placed without covering each other', () => {
    const show = theatre();
    const box = planBox(show, 700);
    const placed = plotTexts(show, { sizes: paperText(1 / 50), bounds: box, lang: 'es', mounts: true, fixtureTags: true });
    const tags = luminaires(show).map((e) => placed.get(tagKey(e.id))?.box).filter((b): b is NonNullable<typeof b> => !!b);
    expect(tags.length).toBe(luminaires(show).length);
    let overlaps = 0;
    for (let i = 0; i < tags.length; i++) for (let j = i + 1; j < tags.length; j++) {
      const a = tags[i]!;
      const b = tags[j]!;
      if (Math.min(a.x1, b.x1) > Math.max(a.x0, b.x0) && Math.min(a.y1, b.y1) > Math.max(a.y0, b.y0)) overlaps++;
    }
    expect(overlaps).toBe(0);
  });
});

describe('the document', () => {
  test('writes a page per light plot report, with the title block under each plan', () => {
    const show = { ...theatre(), date: '2026-11-11', titleBlock: { production: 'Obra X', author: 'Oficina', venue: 'Sala Y', logo: null } };
    const two = { ...show, reports: [{ id: 'a', kind: LIGHT_PLAN, title: 'Luces sala', columns: [], landscape: false, scale: null, layerPreset: [] }, { id: 'b', kind: LIGHT_PLAN, title: '', columns: [], landscape: false, scale: 100, layerPreset: [] }] };
    const b = buildDocument({ ...two, document: { ...two.document, template: 'custom', sections: ['plan', LIGHT_PLAN] } }, {});
    expect(Object.keys(b.files)).toEqual(expect.arrayContaining(['/plan-0.svg', '/lightPlan-0.svg', '/lightPlan-1.svg']));
    expect(b.source).toContain('Luces sala');
    expect(b.source).toContain('Plano de luces');
    for (const text of ['Obra X', 'Sala Y', 'Oficina', '2026-11-11']) expect(b.source.split(text).length - 1).toBeGreaterThanOrEqual(3);
    expect(b.source).toContain('1:100');
  });
});

describe('plan sheets', () => {
  const sheet = (id: string, over: Record<string, unknown> = {}) => ({ id, kind: PLAN, title: '', columns: [], landscape: false, scale: null, layerPreset: [], ...over });

  test('a show with no stage plan reports has the single sheet older files print, with its scale and the visible layers', () => {
    const show = { ...rock(), document: { ...rock().document, planScale: 50 }, layers: rock().layers.map((l, i) => ({ ...l, visible: i === 0 })) };
    const [only, ...rest] = planReports(show, PLAN);
    expect(rest).toEqual([]);
    expect(only!.scale).toBe(50);
    expect([...reportLayerIds(show, only!)]).toEqual([show.layers[0]!.id]);
    expect(reportTags(only!)).toBe(false);
    expect(reportTags(planReports(show, LIGHT_PLAN)[0]!)).toBe(true);
    expect(reportTags({ ...only!, tags: true })).toBe(true);
  });

  test('sheets of the same kind are numbered from the second on, unless they have a title', () => {
    expect([0, 1, 2].map((n) => sheetTitle(sheet('x'), 'Plano', n))).toEqual(['Plano', 'Plano 2', 'Plano 3']);
    expect(sheetTitle(sheet('x', { title: 'Sonido' }), 'Plano', 1)).toBe('Sonido');
  });

  test('three stage plan sheets with different layers make three pages, each drawing only its layers', () => {
    const show = rock();
    const by = (subject: string) => show.layers.filter((l) => l.subject === subject).map((l) => l.id);
    const reports = [sheet('p1', { title: 'Solo sonido', layerPreset: by('audio') }), sheet('p2', { layerPreset: by('stage') }), sheet('p3', { scale: 100 })];
    const b = buildDocument({ ...show, reports, document: { ...show.document, template: 'custom', sections: [PLAN] } }, {});
    expect(Object.keys(b.files).filter((f) => /^\/plan-\d\.svg$/.test(f)).sort()).toEqual(['/plan-0.svg', '/plan-1.svg', '/plan-2.svg']);
    expect(b.source).toContain('Solo sonido');
    expect(b.source).toContain('Plano del escenario 2');
    const text = (k: string) => new TextDecoder().decode(b.files[`/${k}.svg`] as Uint8Array);
    expect(text('plan-0').length).not.toBe(text('plan-1').length);
  });
});

describe('units in the document', () => {
  test('the count by mount shows a dash for a weight nobody stated, not a lone slash', () => {
    const show = theatre();
    const stripped = { ...show, elements: Object.fromEntries(Object.entries(show.elements).map(([k, e]) => [k, { ...e, weightKg: null }])), mounts: Object.fromEntries(Object.entries(show.mounts).map(([k, m]) => [k, { ...m, maxLoadKg: 250 }])) };
    const b = buildDocument({ ...stripped, document: { ...stripped.document, template: 'custom', sections: ['lights'] } }, {});
    expect(b.source).toContain('— / 250');
    expect(b.source).not.toMatch(/\[ \/ 250\]|\[\/ 250\]/);
  });

  test('an imperial show writes its scale, its headers and its weights in feet and pounds', () => {
    const show = { ...theatre(), units: 'imperial' as const };
    const b = buildDocument({ ...show, reports: [{ id: 'a', kind: PLAN, title: '', columns: [], landscape: false, scale: 96, layerPreset: [] }], document: { ...show.document, template: 'custom', sections: [PLAN, 'lights'] } }, {});
    expect(b.source).toContain('⅛″ = 1′ (1:96)');
    expect(b.source).toContain('(ft)');
    expect(b.source).toContain('(lb)');
    expect(b.source).not.toContain('(kg)');
  });

  test('a wireless link is drawn straight and dotted, in the colour of its signal', () => {
    const show = bare(showFromPackage(packageById('conference')!, 'Congreso', 'es'));
    const radio = Object.values(show.connections).find((c) => c.wireless)!;
    const svg = planSvg(show, {}, opts).svg;
    expect(svg).toMatch(/<line [^>]*stroke="#0b6e78"[^>]*stroke-dasharray="[\d. ]+"/);
    expect(radio.signal).toBe('audio');
  });
});
