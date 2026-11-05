import { describe, expect, test } from 'vitest';
import { buildReport } from '../reports/reports.ts';
import { newShow } from './new.ts';
import { addElement } from './ops.ts';
import { addRackSlot, makeRack, moveRackSlot, rackLayout, rackUsed, removeRackSlot, setRackUnits, updateRackSlot } from './racks.ts';

function withRack() {
  const [s, el] = addElement(newShow('t'), { type: { id: 'rack.rack', version: 1 }, x: 0, y: 0, layerId: 'l-audio', label: 'Rack FOH' });
  return [makeRack(s, el.id), el.id] as const;
}

describe('racks', () => {
  test('a rack starts empty with 12 U and keeps its devices in order, counted from the top', () => {
    let [show, id] = withRack();
    show = addRackSlot(show, id, 'Procesador', 1);
    show = addRackSlot(show, id, 'Amplificador', 2);
    const rack = show.elements[id]!.rack!;
    expect(rack.units).toBe(12);
    expect(rackUsed(rack)).toBe(3);
    expect(rackLayout(rack).map((r) => [r.slot.name, r.from, r.to])).toEqual([['Procesador', 1, 1], ['Amplificador', 2, 3]]);
  });
  test('devices move, change size and are removed; sizes stay within 1 to 20 U', () => {
    let [show, id] = withRack();
    show = addRackSlot(show, id, 'A', 1);
    show = addRackSlot(show, id, 'B', 30);
    expect(show.elements[id]!.rack!.slots[1]!.u).toBe(20);
    show = moveRackSlot(show, id, 's2', -1);
    expect(show.elements[id]!.rack!.slots.map((s) => s.name)).toEqual(['B', 'A']);
    expect(moveRackSlot(show, id, 's2', -1)).toBe(show); // already first
    show = updateRackSlot(show, id, 's1', { u: 0 });
    expect(show.elements[id]!.rack!.slots.find((s) => s.id === 's1')!.u).toBe(1);
    show = removeRackSlot(show, id, 's2');
    expect(show.elements[id]!.rack!.slots).toHaveLength(1);
    expect(setRackUnits(show, id, 99).elements[id]!.rack!.units).toBe(60);
  });
  test('the report lists each device with its units and a total per rack', () => {
    let [show, id] = withRack();
    show = addRackSlot(show, id, 'Procesador', 1);
    show = addRackSlot(show, id, 'Amplificador', 2);
    expect(buildReport(show, 'racks').rows).toEqual([['Rack FOH', '1', 'Procesador', '1'], ['Rack FOH', '2-3', 'Amplificador', '2'], ['Rack FOH', '', 'Total', '3 / 12']]);
  });
});
