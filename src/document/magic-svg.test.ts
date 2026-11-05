import { describe, expect, test } from 'vitest';
import { showFromPackage } from '../library/apply.ts';
import { packageById } from '../library/packages.ts';
import { riggingPlan, updateLuminaire } from '../model/lights.ts';
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
});
