import { describe, expect, test } from 'vitest';
import { ALL_SECTIONS } from '../document/sections.ts';
import { buildDocument } from '../document/typst-source.ts';
import { diffShows } from '../model/diff.ts';
import { restore } from '../model/revisions.ts';
import { Module, SignalType, type Show } from '../model/schema.ts';
import { availableReports, REPORT_IDS } from '../reports/reports.ts';
import { validate } from '../validate/rules.ts';
import { showFromPackage, withHistory } from './apply.ts';
import { packageById } from './packages.ts';

// When a feature is added to the app and this example does not use it, it stops being the example that shows everything.
describe('the full example', () => {
  const pkg = packageById('showcase')!;
  const show: Show = showFromPackage(pkg, 'showcase', 'es');
  const elements = Object.values(show.elements);
  const channels = Object.values(show.channels);
  const outputs = Object.values(show.outputs);
  const cables = Object.values(show.connections);
  const lights = elements.filter((e) => e.luminaire);
  const set = <T>(v: T[]) => [...new Set(v)].sort();

  test('every module, report and document section', () => {
    expect(set(show.modules)).toEqual(set([...Module.options]));
    expect(set(availableReports(show))).toEqual(set([...REPORT_IDS]));
    expect(set(show.document.sections)).toEqual(set([...ALL_SECTIONS]));
    expect(buildDocument(show).source).toContain('Rack de escenario');
  });

  test('every kind of cable, output, mount, control protocol and computer', () => {
    expect(set(cables.map((c) => c.signal))).toEqual(set([...SignalType.options]));
    expect(set(outputs.map((o) => o.kind))).toEqual(['iem', 'main', 'send', 'wedge']);
    expect(set(Object.values(show.mounts).map((m) => m.kind))).toEqual(['bar', 'boom', 'floor', 'pipe', 'truss']);
    expect(set(Object.values(show.universes).map((u) => u.protocol))).toEqual(['artnet', 'dmx', 'sacn']);
    expect(set(elements.flatMap((e) => e.computer?.functions ?? []))).toEqual(['lights', 'network', 'sound', 'video']);
    expect(set(elements.flatMap((e) => (e.computer ? [e.computer.os] : [])))).toEqual(['linux', 'macos', 'windows']);
    expect(set(elements.map((e) => e.suppliedBy))).toEqual(expect.arrayContaining(['band', 'rental', 'venue']));
  });

  test('every field of an element, a channel, an output and a cable that can be filled in', () => {
    const every = <T>(list: T[], checks: ((x: T) => unknown)[]) => checks.forEach((has) => expect(list.some(has), String(has)).toBe(true));
    every(elements, [(e) => e.rotation !== 0, (e) => e.flipX, (e) => e.width !== null, (e) => e.height !== null, (e) => e.groupId, (e) => e.notes, (e) => e.weightKg !== null, (e) => e.phase !== null, (e) => e.computer, (e) => e.luminaire, (e) => e.rack, (e) => e.ip, (e) => e.labelAt]);
    every(channels, [(c) => c.phantom, (c) => c.insert, (c) => c.patch, (c) => c.stereoPairWith, (c) => c.sourceElementId, (c) => c.notes]);
    every(outputs, [(o) => o.stereo, (o) => o.aux, (o) => o.who, (o) => Object.keys(o.mix).length, (o) => o.notes]);
    every(cables, [(c) => c.lengthMm, (c) => c.label, (c) => c.toPort, (c) => c.lines > 1]);
    every(lights, [(l) => l.luminaire!.focus, (l) => l.luminaire!.accessories.length, (l) => l.luminaire!.notes, (l) => l.luminaire!.color, (l) => l.luminaire!.dmxMode, (l) => l.luminaire!.dmxSlots, (l) => l.luminaire!.dimmer, (l) => l.luminaire!.address]);
  });

  test('the whole of the show around the plan', () => {
    expect(show.stage.shape.kind).toBe('polygon');
    expect(show.stage.background?.file).toBeDefined();
    expect(Object.keys(pkg.images!())).toEqual(expect.arrayContaining([show.stage.background!.file, show.titleBlock.logo!]));
    expect(show.stage.prosceniumHeight).not.toBeNull();
    expect(Object.keys(show.customItems)).toHaveLength(1);
    expect(show.layers.some((l) => l.subject === 'custom' && l.dim > 0)).toBe(true);
    expect(Object.keys(show.magicLayout).length).toBeGreaterThan(0);
    expect(show.workNotes.some((n) => n.done) && show.workNotes.some((n) => n.refId)).toBe(true);
    expect(show.contacts.some((c) => c.hidden.length > 0)).toBe(true);
    expect(set(show.schedule.map((s) => s.kind))).toEqual(['build', 'day']);
    expect(show.setlist.length).toBeGreaterThan(0);
    expect(show.view.rp2Lights).toBe(true);
    expect(show.desk.model && show.desk.showFile).toBeTruthy();
    for (const v of [...Object.values(show.hospitality), ...Object.values(show.contract), ...Object.values(show.event), ...Object.values(show.titleBlock)]) expect(v === '' || v === null || v === false).toBe(false);
  });

  test('nothing to warn about, except the one silenced on purpose and no warning without a date or contact', () => {
    const found = validate(show);
    expect(found.filter((i) => !i.muted).map((i) => i.key)).toEqual([]);
    expect(found.filter((i) => i.muted).map((i) => i.rule)).toEqual(['channelGaps']);
  });

  test('it starts with two saved revisions that can be compared and restored', () => {
    const { show: withRevs, stored } = withHistory(pkg, show);
    expect(withRevs.revisions.map((r) => r.number)).toEqual([1, 2]);
    expect(withRevs.revision).toBe(2);
    expect(withRevs.revisions[1]!.changes.length).toBeGreaterThan(0);
    expect(stored.map((r) => r.number)).toEqual([1, 2]);
    expect(diffShows(restore(stored[0]!.data), restore(stored[1]!.data), 'es').length).toBeGreaterThan(0);
  });
});
