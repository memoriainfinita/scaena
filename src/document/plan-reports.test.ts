import { describe, expect, test } from 'vitest';
import { bare } from '../library/bare.ts';
import { showFromPackage } from '../library/apply.ts';
import { packageById } from '../library/packages.ts';
import { autoNumber, luminaires } from '../model/lights.ts';
import { paperText, plotTexts, tagKey } from '../plan/labels.ts';
import { planBox } from '../plan/geometry.ts';
import { effectiveSections } from './sections.ts';
import { planSvg } from './plan-svg.ts';
import { LIGHT_PLAN, lightPlanReports, reportLayerIds } from './plan-reports.ts';
import { buildDocument } from './typst-source.ts';

const theatre = () => bare(showFromPackage(packageById('theatre')!, 'Teatro', 'es'));
const rock = () => bare(showFromPackage(packageById('rock')!, 'Banda', 'es'));
const opts = { availWidthMm: 267, availHeightMm: 150, planScale: null, lang: 'es' as const };

describe('light plot reports', () => {
  test('a show with none has the default one, and a preset keeps only layers the show has', () => {
    const show = theatre();
    expect(lightPlanReports(show)).toHaveLength(1);
    const lights = show.layers.find((l) => l.subject === 'lights')!;
    const audio = show.layers.find((l) => l.subject === 'audio')!;
    const defaults = reportLayerIds(show, lightPlanReports(show)[0]!);
    expect(defaults.has(lights.id)).toBe(true);
    expect(defaults.has(audio.id)).toBe(false);
    const own = { ...lightPlanReports(show)[0]!, layerPreset: [audio.id, 'gone'] };
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
    expect(Object.keys(b.files)).toEqual(expect.arrayContaining(['/plan.svg', '/lightplan-0.svg', '/lightplan-1.svg']));
    expect(b.source).toContain('Luces sala');
    expect(b.source).toContain('Plano de luces');
    for (const text of ['Obra X', 'Sala Y', 'Oficina', '2026-11-11']) expect(b.source.split(text).length - 1).toBeGreaterThanOrEqual(3);
    expect(b.source).toContain('1:100');
  });
});
