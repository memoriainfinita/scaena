import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { newShow } from '../model/new.ts';
import { calibrate, centredOn, type Background } from './calibrate.ts';
import { DxfError, parseDxf } from './dxf.ts';
import { pngSize } from './png.ts';

const bg: Background = { file: 'b.png', x: 1000, y: 2000, scale: 2, opacity: 0.4, locked: false };

describe('png header', () => {
  test('reads the size and refuses anything that is not a PNG', () => {
    const bytes = new Uint8Array(24);
    bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    new DataView(bytes.buffer).setUint32(16, 3200);
    new DataView(bytes.buffer).setUint32(20, 2262);
    expect(pngSize(bytes)).toEqual({ w: 3200, h: 2262 });
    expect(pngSize(new Uint8Array(24))).toBeNull();
    expect(pngSize(new Uint8Array(5))).toBeNull();
  });
});

describe('calibration by two points', () => {
  test('two points 4 m apart that should be 8 m double the scale about the first point', () => {
    const r = calibrate(bg, { x: 3000, y: 4000 }, { x: 7000, y: 4000 }, 8000)!;
    expect(r.scale).toBe(4);
    // The point under the first click stays where it was.
    expect(r.x).toBe(3000 - (3000 - 1000) * 2);
    expect(r.y).toBe(4000 - (4000 - 2000) * 2);
    // Applying it again with the new distance is a no-op.
    const again = calibrate(r, { x: 3000, y: 4000 }, { x: 11000, y: 4000 }, 8000)!;
    expect(again.scale).toBe(4);
  });

  test('a diagonal measure works and bad input gives null', () => {
    expect(calibrate(bg, { x: 0, y: 0 }, { x: 3000, y: 4000 }, 10000)!.scale).toBe(4);
    expect(calibrate(bg, { x: 1, y: 1 }, { x: 1, y: 1 }, 1000)).toBeNull();
    expect(calibrate(bg, { x: 0, y: 0 }, { x: 1, y: 1 }, 0)).toBeNull();
    expect(calibrate(bg, { x: 0, y: 0 }, { x: 1, y: 1 }, Number.NaN)).toBeNull();
  });

  test('a new background is centred on the stage', () => {
    const show = newShow('t');
    expect(centredOn(show.stage, 2000, 1000)).toEqual({ x: 3000, y: 2000 });
  });
});

describe('DXF', () => {
  const text = readFileSync(new URL('../../e2e/fixtures/sala.dxf', import.meta.url), 'utf8');

  test('the sample parses to lines, arcs and text with bounds', () => {
    const d = parseDxf(text);
    expect(d.prims.length).toBeGreaterThan(300);
    expect(d.prims.some((p) => p.k === 'arc')).toBe(true);
    expect(d.prims.some((p) => p.k === 'text')).toBe(true);
    expect(d.bounds.x1 - d.bounds.x0).toBeGreaterThan(0);
    expect(d.unitMm).toBeGreaterThan(0);
  });

  test('text that is not a DXF is a parse error, and an empty drawing is its own error', () => {
    expect(() => parseDxf('esto no es un dxf')).toThrow(DxfError);
    const empty = '0\nSECTION\n2\nENTITIES\n0\nENDSEC\n0\nEOF\n';
    try {
      parseDxf(empty);
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(DxfError);
      expect((e as DxfError).code).toBe('empty');
    }
  });
});
