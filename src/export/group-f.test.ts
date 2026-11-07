import DxfParser from 'dxf-parser';
import { describe, expect, test } from 'vitest';
import { showFromPackage } from '../library/apply.ts';
import { packageById } from '../library/packages.ts';
import { addCustomItem } from '../model/custom-items.ts';
import { addElement } from '../model/ops.ts';
import { newShow } from '../model/new.ts';
import { applyBackwards, clock, DEFAULT_BACKWARD, MILESTONES, planBackwards } from '../model/production.ts';
import { cleanSvg } from '../library/svg-clean.ts';
import { flattenPath, layerName, parseTransform, planDxf, primitivesOf } from './dxf.ts';

const parse = (text: string) => new DxfParser().parseSync(text)!;
const I: [number, number, number, number, number, number] = [1, 0, 0, 1, 0, 0];

describe('DXF export', () => {
  test('a plan is a valid DXF with a layer per plan layer, lines, circles and texts', () => {
    const show = showFromPackage(packageById('rock')!, 'r', 'es');
    const dxf = planDxf(show);
    expect(dxf.entities).toBeGreaterThan(50);
    expect(dxf.text.startsWith('  0\r\nSECTION')).toBe(true);
    expect(dxf.text.endsWith('EOF\r\n')).toBe(true);
    const d = parse(dxf.text);
    expect(d.entities.length).toBe(dxf.entities);
    const types = new Set(d.entities.map((e) => e.type));
    expect(types.has('LINE')).toBe(true);
    expect(types.has('CIRCLE')).toBe(true);
    expect(types.has('TEXT')).toBe(true);
    const layers = Object.keys(d.tables.layer!.layers);
    expect(layers).toContain('STAGE-OUTLINE');
    expect(layers.length).toBe(show.layers.length + 1);
    for (const e of d.entities) expect(layers).toContain(e.layer);
  });
  test('the stage outline is in millimetres and the plan is mirrored so downstage is down', () => {
    const show = newShow('t');
    const d = parse(planDxf(show).text);
    const lines = d.entities.filter((e) => e.layer === 'STAGE-OUTLINE') as unknown as { vertices: { x: number; y: number }[] }[];
    expect(lines).toHaveLength(4);
    const ys = lines.flatMap((l) => l.vertices.map((v) => v.y));
    expect(show.stage.shape).toMatchObject({ kind: 'rect', depth: 5000 });
    expect(Math.min(...ys)).toBe(-5000);
    expect(Math.max(...ys)).toBe(0);
  });
  test('an element is placed, rotated and labelled; accents in labels are written as escapes', () => {
    let show = newShow('t');
    [show] = addElement(show, { type: { id: 'furniture.chair', version: 1 }, x: 3000, y: 2000, rotation: 90, label: 'Silla ñ', layerId: 'l-stage' });
    const d = parse(planDxf(show).text);
    const text = d.entities.find((e) => e.type === 'TEXT') as unknown as { text: string };
    expect(text.text).toContain('Silla');
    expect(planDxf(show).text).toContain('\\U+00F1');
    const xs = d.entities.filter((e) => e.layer !== 'STAGE-OUTLINE' && e.type === 'LINE').flatMap((e) => (e as unknown as { vertices: { x: number }[] }).vertices.map((v) => v.x));
    expect(Math.min(...xs)).toBeGreaterThan(2500);
    expect(Math.max(...xs)).toBeLessThan(3500);
  });
  test('an own element is drawn from its cleaned drawing', () => {
    const r = cleanSvg('<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/><path d="M0 0 L100 0"/></svg>');
    if (!r.ok) throw new Error('refused');
    let [show] = addCustomItem(newShow('t'), { name: 'Mesa', svg: r.svg, w: 1000, d: 1000, h: 0, weightKg: null, powerW: null, layer: 'stage' });
    [show] = addElement(show, { type: { id: 'custom.cu1', version: 1 }, x: 2000, y: 2000, layerId: 'l-stage' });
    const d = parse(planDxf(show).text);
    const circle = d.entities.find((e) => e.type === 'CIRCLE') as unknown as { radius: number };
    expect(circle.radius).toBeCloseTo(400, 3);
  });
  test('layer names are valid, unique and at most 31 characters', () => {
    const taken = new Set<string>();
    expect(layerName('Vestuario y atrezo', taken)).toBe('VESTUARIO_Y_ATREZO');
    expect(layerName('Vestuario y atrezo', taken)).toBe('VESTUARIO_Y_ATREZO_2');
    expect(layerName('Ñandú <1>', taken)).toBe('NANDU_1');
    expect(layerName('???', taken)).toBe('LAYER');
    expect(layerName('x'.repeat(80), taken).length).toBeLessThanOrEqual(31);
  });
});

describe('symbol geometry', () => {
  test('rect, line and circle become lines and a circle after a transform', () => {
    const prims = primitivesOf('<rect x="0" y="0" width="10" height="20"/><circle cx="5" cy="5" r="2"/><line x1="0" y1="0" x2="1" y2="1"/>', [2, 0, 0, 2, 100, 0]);
    expect(prims.filter((p) => p.k === 'line')).toHaveLength(5);
    expect(prims.find((p) => p.k === 'circle')).toEqual({ k: 'circle', c: [110, 10], r: 4 });
  });
  test('a circle under an uneven scale is drawn as lines, not a wrong circle', () => {
    const prims = primitivesOf('<circle cx="0" cy="0" r="10"/>', [2, 0, 0, 1, 0, 0]);
    expect(prims.some((p) => p.k === 'circle')).toBe(false);
    expect(prims.length).toBe(32);
  });
  test('groups apply their transform to what is inside, and only to it', () => {
    const prims = primitivesOf('<g transform="translate(100 0)"><line x1="0" y1="0" x2="1" y2="0"/></g><line x1="0" y1="0" x2="1" y2="0"/>', I);
    expect(prims).toEqual([
      { k: 'line', a: [100, 0], b: [101, 0] },
      { k: 'line', a: [0, 0], b: [1, 0] },
    ]);
  });
  test('transforms: translate, scale, rotate and matrix', () => {
    expect(parseTransform('translate(1 2) scale(3)')).toEqual([3, 0, 0, 3, 1, 2]);
    const r = parseTransform('rotate(90)');
    expect(r[0]).toBeCloseTo(0);
    expect(r[1]).toBeCloseTo(1);
    expect(parseTransform('matrix(1 2 3 4 5 6)')).toEqual([1, 2, 3, 4, 5, 6]);
    expect(parseTransform('garbage(1)')).toEqual(I);
  });
  test('paths: lines, relative moves, closing, curves and arcs end where they should', () => {
    expect(flattenPath('M0 0 L10 0 L10 10 Z')).toEqual([{ pts: [[0, 0], [10, 0], [10, 10]], closed: true }]);
    expect(flattenPath('M0 0 h10 v5 H0')[0]!.pts.at(-1)).toEqual([0, 5]);
    expect(flattenPath('m1 1 l2 0 l0 2')[0]!.pts).toEqual([[1, 1], [3, 1], [3, 3]]);
    const q = flattenPath('M0 0 Q5 10 10 0')[0]!.pts;
    expect(q.at(-1)).toEqual([10, 0]);
    expect(Math.max(...q.map((p) => p[1]))).toBeGreaterThan(4);
    const c = flattenPath('M0 0 C0 10 10 10 10 0')[0]!.pts;
    expect(c.at(-1)![0]).toBeCloseTo(10);
    const a = flattenPath('M0 0 A5 5 0 0 1 10 0')[0]!.pts;
    expect(a.at(-1)![0]).toBeCloseTo(10);
    expect(Math.max(...a.map((p) => Math.abs(p[1])))).toBeGreaterThan(4.5);
    expect(flattenPath('M0 0 L1')).toEqual([{ pts: [[0, 0]], closed: false }]); // an incomplete command stops reading
    expect(flattenPath('nonsense')).toEqual([]);
  });
});

describe('calendar back from the curfew', () => {
  const base = { curfew: '23:00', ...DEFAULT_BACKWARD };
  const at = (rows: ReturnType<typeof planBackwards>, m: (typeof MILESTONES)[number]) => rows!.find((r) => r.milestone === m)?.minutes;
  test('works back with the extra time on loading and unloading only', () => {
    const rows = planBackwards(base)!;
    // load-out 60 min + 50 % = 90 min before 23:00
    expect(clock(at(rows, 'loadOut')!)).toBe('21:30');
    expect(clock(at(rows, 'show')!)).toBe('20:00');
    expect(clock(at(rows, 'doors')!)).toBe('19:30');
    expect(clock(at(rows, 'soundcheck')!)).toBe('18:30');
    // load-in 120 min + 50 % = 180 min before the soundcheck
    expect(clock(at(rows, 'loadIn')!)).toBe('15:30');
    expect(clock(at(rows, 'curfew')!)).toBe('23:00');
    expect(rows.map((r) => r.milestone)).toEqual(['loadIn', 'soundcheck', 'doors', 'show', 'loadOut', 'curfew']);
  });
  test('no extra, and a changeover before the show', () => {
    const rows = planBackwards({ ...base, extraPct: 0, changeoverMin: 30 })!;
    expect(clock(at(rows, 'loadOut')!)).toBe('22:00');
    expect(clock(at(rows, 'show')!)).toBe('20:30');
    expect(clock(at(rows, 'changeover')!)).toBe('20:00');
    expect(clock(at(rows, 'doors')!)).toBe('20:00');
  });
  test('it refuses what cannot be worked out', () => {
    expect(planBackwards({ ...base, curfew: '25:00' })).toBeNull();
    expect(planBackwards({ ...base, curfew: '' })).toBeNull();
    expect(planBackwards({ ...base, showMin: -5 })).toBeNull();
    expect(planBackwards({ ...base, showMin: 1.5 })).toBeNull();
    expect(planBackwards({ ...base, showMin: Number.NaN })).toBeNull();
    expect(planBackwards({ ...base, extraPct: -1 })).toBeNull();
    expect(planBackwards({ ...base, curfew: '05:00' })).toBeNull(); // the first call would be the day before
  });
  test('applying fills the day schedule, replacing a milestone that is already there', () => {
    const names = { loadIn: 'Carga', soundcheck: 'Prueba de sonido', meal: 'Comida', doors: 'Puertas', opener: 'Telonero', changeover: 'Cambio de escenario', show: 'Show', loadOut: 'Descarga', curfew: 'Toque de queda', dressingEnd: 'Fin de camerino' };
    let show = newShow('t');
    show = { ...show, schedule: [{ id: 'sl1', time: '10:00', what: 'carga', kind: 'day' }, { id: 'sl2', time: '12:00', what: 'Comida', kind: 'day' }, { id: 'sl3', time: '09:00', what: 'Carga', kind: 'build' }] };
    const out = applyBackwards(show, planBackwards(base)!, names);
    expect(out.schedule.find((s) => s.id === 'sl1')!.time).toBe('15:30');
    expect(out.schedule.find((s) => s.id === 'sl2')!.time).toBe('12:00');
    expect(out.schedule.find((s) => s.id === 'sl3')!.time).toBe('09:00');
    const day = out.schedule.filter((s) => s.kind === 'day');
    expect(day.map((s) => s.what).sort()).toEqual(['Comida', 'Descarga', 'Prueba de sonido', 'Puertas', 'Show', 'Toque de queda', 'carga'].sort());
  });
});
