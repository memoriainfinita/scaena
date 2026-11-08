import { describe, expect, test } from 'vitest';
import { validate } from '../validate/rules.ts';
import { showFromPackage } from './apply.ts';
import { planSvg } from '../document/plan-svg.ts';
import { PACKAGES } from './packages.ts';

// What a new show may still ask the user for: the data only they have.
const THEIRS = new Set(['noContact', 'noDate']);

describe('the example packages', () => {
  for (const pkg of PACKAGES) {
    const show = showFromPackage(pkg, pkg.id, 'es');
    test(`${pkg.id}: no warning of its own, only the contact and the date`, () => {
      expect(validate(show).filter((i) => !THEIRS.has(i.rule)).map((i) => `${i.rule} ${JSON.stringify(i.vars)}`)).toEqual([]);
    });
    test(`${pkg.id}: no two elements on top of each other`, () => {
      const under = /^(furniture|scenery)\./;
      const els = Object.values(show.elements).filter((e) => !under.test(e.type.id));
      const close = [];
      for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) if (Math.hypot(els[i]!.x - els[j]!.x, els[i]!.y - els[j]!.y) < 600) close.push(`${els[i]!.label} / ${els[j]!.label}`);
      expect(close).toEqual([]);
    });
    test(`${pkg.id}: every cable joins two elements of the plan`, () => {
      for (const c of Object.values(show.connections)) {
        expect(show.elements[c.from]).toBeDefined();
        expect(show.elements[c.to]).toBeDefined();
      }
    });
  }
});

describe('connection lines', () => {
  const opts = { availWidthMm: 267, availHeightMm: 170, planScale: null, lang: 'es' as const };
  test('the view setting hides them in the exported plan too', () => {
    const show = showFromPackage(PACKAGES[0]!, 'rock', 'es');
    expect(show.view.links).toBe(true);
    expect(planSvg(show, {}, opts).svg).toContain('#0b6e78');
    expect(planSvg({ ...show, view: { ...show.view, links: false } }, {}, opts).svg).not.toContain('#0b6e78');
  });
});

describe('names, outlines and the legend of the exported plan', () => {
  const opts = { availWidthMm: 267, availHeightMm: 170, planScale: null, lang: 'es' as const };
  const labelled = (show: ReturnType<typeof showFromPackage>) => {
    const first = Object.values(show.elements).find((e) => e.label);
    return first!.label;
  };

  test('the view settings hide the names under the elements', () => {
    const show = showFromPackage(PACKAGES[0]!, 'rock', 'es');
    const label = labelled(show);
    expect(planSvg(show, {}, opts).svg).toContain(`>${label}</text>`);
    expect(planSvg({ ...show, view: { ...show.view, labels: false } }, {}, opts).svg).not.toContain(`>${label}</text>`);
  });

  test('the legend is optional and the plan gets the room back', () => {
    const show = showFromPackage(PACKAGES[0]!, 'rock', 'es');
    const on = planSvg(show, {}, opts);
    const off = planSvg({ ...show, document: { ...show.document, planLegend: false } }, {}, opts);
    expect(off.scaleN).toBeLessThanOrEqual(on.scaleN);
    expect(off.svg.length).toBeLessThan(on.svg.length);
    const portrait = { ...opts, availWidthMm: 130, availHeightMm: 200 };
    expect(planSvg({ ...show, document: { ...show.document, planLegend: false } }, {}, portrait).scaleN).toBeLessThan(planSvg(show, {}, portrait).scaleN);
  });

  test('on a wide page the legend goes beside the plan and prints it larger', () => {
    const show = showFromPackage(PACKAGES[0]!, 'rock', 'es');
    const wide = planSvg(show, {}, { ...opts, availWidthMm: 257, availHeightMm: 170 });
    expect(wide.scaleN).toBeLessThan(100);
  });
});
