import { describe, expect, test } from 'vitest';
import { newShow } from '../model/new.ts';
import { addElement } from '../model/ops.ts';
import type { PlanElement } from '../model/schema.ts';
import { HANDLES, handlePoint, resizeTo, rotationAt, turnKnob, turnPoint } from './transform.ts';

function box(over: Partial<PlanElement> = {}): PlanElement {
  const [, e] = addElement(newShow('T'), { type: { id: 'x.box', version: 1 }, x: 1000, y: 1000, width: 400, depth: 200, layerId: 'l-audio', ...over });
  return e;
}
const handle = (id: string) => HANDLES.find((h) => h.id === id)!;

describe('handles', () => {
  test('sit on the sides of the box, turned with the element', () => {
    expect(handlePoint(box(), handle('e'))).toEqual({ x: 1200, y: 1000 });
    expect(handlePoint(box(), handle('nw'))).toEqual({ x: 800, y: 900 });
    const p = handlePoint(box({ rotation: 90 }), handle('e'));
    expect([Math.round(p.x), Math.round(p.y)]).toEqual([1000, 1200]);
    // Past the top-right corner, at a diagonal.
    expect(turnPoint(box(), 100)).toEqual({ x: 1270, y: 830 });
  });
});

describe('resizing', () => {
  test('dragging the right side keeps the left side where it was', () => {
    expect(resizeTo(box(), handle('e'), { x: 1600, y: 1300 })).toEqual({ x: 1200, y: 1000, width: 800, depth: 200 });
  });

  test('dragging the top-left corner moves both sides and keeps the opposite corner', () => {
    const r = resizeTo(box(), handle('nw'), { x: 600, y: 700 });
    expect(r).toEqual({ x: 900, y: 900, width: 600, depth: 400 });
    expect([r.x + r.width / 2, r.y + r.depth / 2]).toEqual([1200, 1100]);
  });

  test('follows the rotation of the element', () => {
    const r = resizeTo(box({ rotation: 90 }), handle('e'), { x: 1000, y: 1600 });
    expect(r).toMatchObject({ x: 1000, y: 1200, width: 800, depth: 200 });
  });

  test('grows from the centre, keeps the ratio on a corner, and snaps to the grid', () => {
    expect(resizeTo(box(), handle('e'), { x: 1500, y: 1000 }, { fromCentre: true })).toEqual({ x: 1000, y: 1000, width: 1000, depth: 200 });
    const ratio = resizeTo(box(), handle('se'), { x: 1400, y: 1100 }, { keepRatio: true });
    expect(ratio.width / ratio.depth).toBeCloseTo(2, 1);
    expect(resizeTo(box(), handle('e'), { x: 1730, y: 1000 }, { step: 500 }).width).toBe(1000);
  });

  test('never collapses below the smallest size', () => {
    expect(resizeTo(box(), handle('e'), { x: 0, y: 1000 }).width).toBe(20);
    expect(resizeTo(box(), handle('e'), { x: 0, y: 1000 }, { step: 500 }).width).toBe(500);
  });

  test('a side handle leaves the other dimension alone', () => {
    expect(resizeTo(box(), handle('n'), { x: 5000, y: 500 })).toMatchObject({ width: 400, depth: 600 });
  });
});

describe('turning', () => {
  test('the handle under the pointer gives the rotation', () => {
    const e = box();
    expect(rotationAt(e, { x: 1000, y: 100 })).toBe(0);
    expect(rotationAt(e, { x: 2000, y: 1000 })).toBe(90);
    expect(rotationAt(e, { x: 1000, y: 2000 })).toBe(180);
    expect(rotationAt(e, { x: 0, y: 1000 })).toBe(270);
    expect(rotationAt(e, { x: 1800, y: 100 }, 15)).toBe(45);
    // With the handle past the corner, putting it back under the pointer where it started gives no turn.
    const knob = turnKnob({ w: 400, d: 200 }, 100);
    expect(rotationAt(e, turnPoint(e, 100), 0, knob)).toBe(0);
    expect(rotationAt({ ...e }, { x: 1000 - knob.y, y: 1000 + knob.x }, 0, knob)).toBe(90);
  });
});
