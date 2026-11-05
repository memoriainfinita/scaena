import { describe, expect, test } from 'vitest';
import { showFromPackage } from '../library/apply.ts';
import { packageById } from '../library/packages.ts';
import { addMount, magicPosition, resetMagicLayout, riggingPlan, setMagicPosition, updateLuminaire } from '../model/lights.ts';
import { updateElement } from '../model/ops.ts';
import { safeParseShow } from '../model/schema.ts';
import { buildReport } from '../reports/reports.ts';
import { magicSheet } from './magic-svg.ts';
import { buildDocument } from './typst-source.ts';

const theatre = () => showFromPackage(packageById('theatre')!, 'Teatro', 'es');

describe('magic sheet', () => {
  test('there is none without instruments', () => {
    expect(magicSheet(showFromPackage(packageById('rock')!, 'Rock', 'es'))).toBeNull();
  });
  test('every instrument is a circle with its channel, and a missing channel shows a dash', () => {
    let show = theatre();
    const lights = Object.values(show.elements).filter((e) => e.luminaire);
    show = updateLuminaire(show, lights[0]!.id, { channel: 21, color: 'R26' });
    const sheet = magicSheet(show)!;
    expect(sheet.count).toBe(lights.length);
    expect(sheet.svg.match(/<circle/g)).toHaveLength(lights.length);
    expect(sheet.svg).toContain('>21<');
    expect(sheet.svg).toContain('>R26<');
    expect(sheet.svg).toContain('>–<');
    expect(sheet.aspect).toBeGreaterThan(0);
  });
  test('text from the show is escaped', () => {
    let show = theatre();
    const e = Object.values(show.elements).find((x) => x.luminaire)!;
    show = updateLuminaire(show, e.id, { color: '<b>&' });
    expect(magicSheet(show)!.svg).toContain('&lt;b&gt;&amp;');
  });
  test('the rider has the hanging plot and the magic sheet as pages of the document', () => {
    const b = buildDocument(theatre());
    expect(b.sections).toEqual(expect.arrayContaining(['rigging', 'magic']));
    expect(Object.keys(b.files)).toContain('/magic.svg');
  });
});

describe('magic sheet arrangement', () => {
  const light = (show: ReturnType<typeof theatre>) => Object.values(show.elements).find((x) => x.luminaire)!;
  test('a moved instrument takes its own place, rounded to 10 mm, and the plan is untouched', () => {
    const show = theatre();
    const e = light(show);
    const moved = setMagicPosition(show, e.id, { x: 1234, y: 4321 });
    expect(magicPosition(moved, e)).toEqual({ x: 1230, y: 4320 });
    expect(moved.elements[e.id]).toEqual(show.elements[e.id]);
    expect(magicSheet(moved)!.svg).toContain('cx="1230" cy="4320"');
    expect(magicPosition(show, e)).toEqual({ x: e.x, y: e.y });
  });
  test('the hanging lines go once the sheet is arranged, and come back on reset', () => {
    const show = theatre();
    expect(magicSheet(show)!.svg).toContain('stroke-dasharray');
    const moved = setMagicPosition(show, light(show).id, { x: 500, y: 500 });
    expect(magicSheet(moved)!.svg).not.toContain('stroke-dasharray');
    expect(magicSheet(resetMagicLayout(moved))!.svg).toBe(magicSheet(show)!.svg);
  });
  test('resetting an untouched sheet changes nothing, and only luminaires can be placed', () => {
    const show = theatre();
    expect(resetMagicLayout(show)).toBe(show);
    const other = Object.values(show.elements).find((x) => !x.luminaire)!;
    expect(setMagicPosition(show, other.id, { x: 1, y: 1 })).toBe(show);
    expect(setMagicPosition(show, 'nope', { x: 1, y: 1 })).toBe(show);
  });
  test('an entry for an instrument that no longer exists is ignored when drawing', () => {
    const show = theatre();
    const ghost = { ...show, magicLayout: { gone: { x: 99999, y: 99999 } } };
    const sheet = magicSheet(ghost)!;
    expect(sheet.svg).not.toContain('99999');
    expect(sheet.svg.match(/<circle/g)).toHaveLength(sheet.count);
  });
  test('the editor version makes each instrument a button; the rider version has none', () => {
    const show = theatre();
    const n = magicSheet(show)!.count;
    const edit = magicSheet(show, 'es', { interactive: { label: (ch) => `Canal ${ch}` } })!.svg;
    expect(edit.match(/role="button"/g)).toHaveLength(n);
    expect(edit.match(/data-id=/g)).toHaveLength(n);
    expect(magicSheet(show)!.svg).not.toContain('data-id');
  });
  test('the arrangement is kept in the file', () => {
    const show = theatre();
    const moved = setMagicPosition(show, light(show).id, { x: 700, y: 800 });
    const parsed = safeParseShow(JSON.parse(JSON.stringify(moved)));
    expect(parsed.success && parsed.output.magicLayout).toEqual(moved.magicLayout);
  });
});

describe('hanging plot', () => {
  test('groups the instruments by mount, left to right, with totals; loose ones go last', () => {
    const show = theatre();
    const groups = riggingPlan(show);
    const total = groups.reduce((n, g) => n + g.lights.length, 0);
    expect(total).toBe(Object.values(show.elements).filter((e) => e.luminaire).length);
    for (const g of groups) for (let i = 1; i < g.lights.length; i++) expect(g.lights[i]!.x).toBeGreaterThanOrEqual(g.lights[i - 1]!.x);
    const loose = riggingPlan({ ...show, mounts: {} });
    expect(loose).toHaveLength(1);
    expect(loose[0]!.mount).toBeNull();
  });
  test('weight and power add up per mount, and a missing figure counts as zero', () => {
    let show = theatre();
    const mount = Object.values(show.mounts)[0]!;
    const here = Object.values(show.elements).filter((e) => e.luminaire?.mountId === mount.id);
    expect(here.length).toBeGreaterThan(1);
    show = updateElement(show, here[0]!.id, { weightKg: 6.5, powerW: 575 });
    show = updateElement(show, here[1]!.id, { weightKg: 3, powerW: 300 });
    for (const e of here.slice(2)) show = updateElement(show, e.id, { weightKg: undefined, powerW: undefined });
    const g = riggingPlan(show).find((x) => x.mount?.id === mount.id)!;
    expect(g.weightKg).toBeCloseTo(9.5);
    expect(g.powerW).toBe(875);
  });
  test('a side tower is read along its own axis', () => {
    let show = theatre();
    const [boomShow, boom] = addMount(show, { kind: 'boom', name: 'Torre', from: { x: 300, y: 500 }, to: { x: 300, y: 4500 } });
    show = boomShow;
    const lights = Object.values(show.elements).filter((e) => e.luminaire).slice(0, 3);
    const ys = [3000, 1000, 2000];
    lights.forEach((e, i) => {
      show = updateElement(show, e.id, { x: 100 + i * 100, y: ys[i]! });
      show = updateLuminaire(show, e.id, { mountId: boom.id });
    });
    const g = riggingPlan(show).find((x) => x.mount?.id === boom.id)!;
    expect(g.lights.map((e) => e.y)).toEqual([1000, 2000, 3000]);
  });
  test('the report lists the instruments of each mount numbered, then a total row', () => {
    const show = theatre();
    const r = buildReport(show, 'rigging');
    const groups = riggingPlan(show);
    expect(r.rows).toHaveLength(groups.reduce((n, g) => n + g.lights.length + 1, 0));
    const first = groups[0]!;
    expect(r.rows[0]![1]).toBe('1');
    expect(r.rows[first.lights.length]![3]).toBeTruthy(); // the total row carries the "Total" label
    expect(r.rows[first.lights.length]![1]).toBe('');
  });
});
