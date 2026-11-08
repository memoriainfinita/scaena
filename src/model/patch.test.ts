import { describe, expect, test } from 'vitest';
import { showFromPackage } from '../library/apply.ts';
import { packageById } from '../library/packages.ts';
import { RULES } from '../validate/rules.ts';
import { addChannel, channelList, updateChannel } from './audio.ts';
import { addConnection, updateConnection } from './connections.ts';
import { newShow } from './new.ts';
import { addElement, updateElement } from './ops.ts';
import { effectivePatch, patchAnalysis } from './patch.ts';
import type { Show } from './schema.ts';

const base = (): Show => newShow('t', ['audio', 'document']);
const put = (show: Show, type: string, label = ''): [Show, string] => {
  const layer = show.layers.find((l) => l.subject === 'audio')!.id;
  const [s, e] = addElement(show, { type: { id: type, version: 1 }, x: 0, y: 0, layerId: layer });
  return [label ? updateElement(s, e.id, { label }) : s, e.id];
};
const cable = (show: Show, from: string, to: string, toPort: number | null, lines = 1): Show => {
  const [s, c] = addConnection(show, from, to, 'audio');
  return updateConnection(s, c!.id, { toPort, lines });
};
const channel = (show: Show, source: string, patch = ''): [Show, string] => {
  const [s, c] = addChannel(show, { shortName: 'x', mic: 'y', patch });
  return [updateChannel(s, c.id, { sourceElementId: source }), c.id];
};

describe('patch from the cables', () => {
  test('a loom gives consecutive ports to the channels of its element, in channel order', () => {
    let [s, drums] = put(base(), 'kit.drums5');
    let sb: string;
    [s, sb] = put(s, 'rack.stagebox', 'SB');
    let a: string, b: string;
    [s, a] = channel(s, drums);
    [s, b] = channel(s, drums);
    s = cable(s, drums, sb, 5, 2);
    expect(effectivePatch(s, s.channels[a]!)).toBe('SB 5');
    expect(effectivePatch(s, s.channels[b]!)).toBe('SB 6');
  });
  test('a DI box in the path passes on the channels of what feeds it', () => {
    let [s, keys] = put(base(), 'keys.keyboard');
    let di: string, sb: string, l: string, r: string;
    [s, di] = put(s, 'rack.di-stereo');
    [s, sb] = put(s, 'rack.stagebox', 'SB');
    [s, l] = channel(s, keys);
    [s, r] = channel(s, keys);
    s = cable(s, keys, di, null);
    s = cable(s, di, sb, 13, 2);
    expect(patchAnalysis(s).derived.get(l)).toBe('SB 13');
    expect(patchAnalysis(s).derived.get(r)).toBe('SB 14');
  });
  test('a DI that has its own channel keeps it', () => {
    let [s, bass] = put(base(), 'guitar.bass');
    let di: string, sb: string, c: string;
    [s, di] = put(s, 'rack.di');
    [s, sb] = put(s, 'rack.stagebox', 'SB');
    [s, c] = channel(s, di);
    s = cable(s, bass, di, null);
    s = cable(s, di, sb, 9);
    expect(patchAnalysis(s).derived.get(c)).toBe('SB 9');
  });
  test('the name comes from the item when the destination has no label', () => {
    let [s, mic] = put(base(), 'vocals.mic-stand');
    let sb: string, c: string;
    [s, sb] = put(s, 'rack.stagebox');
    [s, c] = channel(s, mic);
    s = cable(s, mic, sb, 3);
    expect(patchAnalysis(s).derived.get(c)).toMatch(/\S+ 3$/);
  });
  test('a typed patch wins, and a different one is flagged', () => {
    let [s, mic] = put(base(), 'vocals.mic-stand');
    let sb: string, c: string;
    [s, sb] = put(s, 'rack.stagebox', 'SB');
    [s, c] = channel(s, mic, 'A 1');
    s = cable(s, mic, sb, 3);
    expect(effectivePatch(s, s.channels[c]!)).toBe('A 1');
    expect(RULES.patchMismatch(s)[0]).toMatchObject({ severity: 'warning', vars: { typed: 'A 1', cables: 'SB 3' } });
    expect(RULES.patchMismatch(updateChannel(s, c, { patch: 'sb  3' }))).toEqual([]);
  });
});

describe('port warnings', () => {
  test('two cables on one port is an error, also when a loom overlaps', () => {
    let [s, a] = put(base(), 'kit.drums5');
    let b: string, sb: string;
    [s, b] = put(s, 'vocals.mic-stand');
    [s, sb] = put(s, 'rack.stagebox', 'SB');
    s = cable(s, a, sb, 1, 8);
    s = cable(s, b, sb, 8);
    const found = RULES.portTaken(s);
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({ severity: 'error', vars: { port: 8 } });
  });
  test('a port above what a stagebox has is flagged only when the count is known', () => {
    let [s, a] = put(base(), 'vocals.mic-stand');
    let small: string, plain: string, b: string;
    [s, small] = put(s, 'rack.stagebox-16');
    [s, plain] = put(s, 'rack.stagebox');
    [s, b] = put(s, 'vocals.mic-stand');
    s = cable(s, a, small, 17);
    s = cable(s, b, plain, 40);
    expect(RULES.portRange(s).map((i) => i.vars.max)).toEqual([16]);
  });
  test('more channels than lines is flagged unless the rest are typed', () => {
    let [s, drums] = put(base(), 'kit.drums5');
    let sb: string, c2: string;
    [s, sb] = put(s, 'rack.stagebox', 'SB');
    [s] = channel(s, drums);
    [s, c2] = channel(s, drums);
    s = cable(s, drums, sb, 1);
    expect(RULES.cableLinesShort(s)[0]).toMatchObject({ vars: { channels: 2, lines: 1 } });
    expect(RULES.cableLinesShort(updateChannel(s, c2, { patch: 'X 1' }))).toEqual([]);
  });
});

test('the rock example takes every patch from its cables, in order', () => {
  const show = showFromPackage(packageById('rock')!, 'rock', 'es');
  expect(channelList(show).map((c) => c.patch)).toEqual(Array(17).fill(''));
  expect(channelList(show).map((c) => effectivePatch(show, c))).toEqual(Array.from({ length: 17 }, (_, i) => `SB ${i + 1}`));
});
