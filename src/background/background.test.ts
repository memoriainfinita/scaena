import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { newShow } from '../model/new.ts';
import { calibrate, centredOn, type Background } from './calibrate.ts';
import { decodeDxf, DxfError, parseDxf, type Prim } from './dxf.ts';
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

describe('DXF from real drawings', () => {
  type Poly = Extract<Prim, { k: 'poly' }>;
  const dxf = (entities: string[], blocks: string[] = [], tables: string[] = []) => ['0', 'SECTION', '2', 'TABLES', ...tables, '0', 'ENDSEC', '0', 'SECTION', '2', 'BLOCKS', ...blocks, '0', 'ENDSEC', '0', 'SECTION', '2', 'ENTITIES', ...entities, '0', 'ENDSEC', '0', 'EOF'].join('\n');
  const line = (x0: number, y0: number, x1: number, y1: number, layer = 'A', extra: string[] = []) => ['0', 'LINE', '8', layer, ...extra, '10', `${x0}`, '20', `${y0}`, '30', '0', '11', `${x1}`, '21', `${y1}`, '31', '0'];
  const circle = (x: number, y: number, r: number) => ['0', 'CIRCLE', '8', 'A', '10', `${x}`, '20', `${y}`, '30', '0', '40', `${r}`];
  const block = (name: string, base: [number, number], body: string[]) => ['0', 'BLOCK', '8', '0', '2', name, '70', '0', '10', `${base[0]}`, '20', `${base[1]}`, '30', '0', '3', name, ...body, '0', 'ENDBLK', '8', '0'];
  const insert = (name: string, x: number, y: number, sx: number, sy: number) => ['0', 'INSERT', '8', 'A', '2', name, '10', `${x}`, '20', `${y}`, '30', '0', '41', `${sx}`, '42', `${sy}`];

  test('ellipses and bulged polylines become curves', () => {
    const d = parseDxf(dxf([...['0', 'ELLIPSE', '8', 'A', '10', '0', '20', '0', '30', '0', '11', '10', '21', '0', '31', '0', '40', '0.5', '41', '0', '42', '6.283185307179586'], ...['0', 'LWPOLYLINE', '8', 'A', '90', '2', '70', '0', '10', '20', '20', '0', '42', '1', '10', '30', '20', '0']]));
    const [ellipse, half] = d.prims as Poly[];
    expect(Math.max(...ellipse!.pts.map((p) => p.y))).toBeCloseTo(5, 0);
    expect(ellipse!.closed).toBe(true);
    expect(half!.pts.length).toBeGreaterThan(4);
    expect(Math.min(...half!.pts.map((p) => p.y))).toBeCloseTo(-5, 0);
  });

  test('a spline passes through its clamped ends', () => {
    const d = parseDxf(dxf(['0', 'SPLINE', '8', 'A', '70', '8', '71', '2', '72', '6', '73', '3', '74', '0', '40', '0', '40', '0', '40', '0', '40', '1', '40', '1', '40', '1', '10', '0', '20', '0', '30', '0', '10', '5', '20', '10', '30', '0', '10', '10', '20', '0', '30', '0']));
    const s = d.prims[0] as Poly;
    expect(s.pts[0]!.x).toBeCloseTo(0);
    expect(s.pts.at(-1)!.x).toBeCloseTo(10);
    expect(Math.max(...s.pts.map((p) => p.y))).toBeCloseTo(5, 0);
  });

  test('a scaled block scales its circles, from the base point of the block', () => {
    const d = parseDxf(dxf(insert('B', 100, 0, 2, 2), block('B', [10, 0], circle(10, 0, 3))));
    expect(d.prims[0]).toMatchObject({ k: 'arc', r: 6, c: { x: 100, y: 0 } });
  });

  test('a mirrored block draws its arcs on the mirrored side', () => {
    const d = parseDxf(dxf(insert('B', 0, 0, -1, 1), block('B', [0, 0], ['0', 'ARC', '8', 'A', '10', '0', '20', '0', '30', '0', '40', '10', '50', '0', '51', '90'])));
    const a = d.prims[0] as Poly;
    expect(a.k).toBe('poly');
    expect(a.pts[0]!.x).toBeCloseTo(-10);
    expect(a.pts.at(-1)!.y).toBeCloseTo(10);
  });

  test('frozen and switched-off layers and paper space are left out', () => {
    const layer = (name: string, flags: number, color: number) => ['0', 'LAYER', '2', name, '70', `${flags}`, '62', `${color}`];
    const tables = ['0', 'TABLE', '2', 'LAYER', '70', '3', ...layer('A', 0, 7), ...layer('Off', 0, -7), ...layer('Ice', 1, 7), '0', 'ENDTAB'];
    const d = parseDxf(dxf([...line(0, 0, 1, 0), ...line(0, 0, 900, 0, 'Off'), ...line(0, 0, 900, 0, 'Ice'), ...line(0, 0, 900, 0, 'A', ['67', '1'])], [], tables));
    expect(d.prims).toHaveLength(1);
    expect(d.bounds.x1).toBe(1);
  });

  test('a triangular 3D face does not break the bounds', () => {
    const d = parseDxf(dxf(['0', '3DFACE', '8', 'A', '10', '0', '20', '0', '30', '0', '11', '4', '21', '0', '31', '0', '12', '4', '22', '3', '32', '0']));
    expect(d.bounds).toEqual({ x0: 0, y0: 0, x1: 4, y1: 3 });
  });

  test('deep nesting is drawn and a block that contains itself does not loop', () => {
    const chain = ['1', '2', '3', '4', '5'].flatMap((n, i, all) => block(n, [0, 0], i < all.length - 1 ? insert(all[i + 1]!, 0, 0, 1, 1) : circle(0, 0, 1)));
    expect(parseDxf(dxf(insert('1', 0, 0, 1, 1), chain)).prims).toHaveLength(1);
    expect(parseDxf(dxf(insert('S', 0, 0, 1, 1), block('S', [0, 0], [...insert('S', 0, 0, 1, 1), ...circle(5, 5, 1)]))).prims).toHaveLength(1);
  });

  test('old files in a code page keep their accents, and special codes become characters', () => {
    const body = dxf(['0', 'TEXT', '8', 'A', '10', '0', '20', '0', '30', '0', '40', '2', '1', 'Sal\xF3n %%c50 %%d', '50', '90']);
    const d = parseDxf(decodeDxf(Uint8Array.from(body, (c) => c.charCodeAt(0))));
    expect(d.prims[0]).toMatchObject({ k: 'text', text: 'Salón ø50 °', h: 2 });
    expect((d.prims[0] as { rot: number }).rot).toBeCloseTo(Math.PI / 2);
  });
});
