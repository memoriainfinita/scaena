import { describe, expect, test } from 'vitest';
import { diffShows } from './diff.ts';
import { newShow } from './new.ts';
import type { Show } from './schema.ts';

const a = (): Show => newShow('Diff', ['audio', 'document', 'production']);

describe('diffShows: what is not on the plan', () => {
  test('two equal shows have no changes', () => {
    expect(diffShows(a(), a(), 'es')).toEqual([]);
  });

  const cases: [string, (s: Show) => Show, string][] = [
    ['name', (s) => ({ ...s, name: 'Otro' }), 'nombre'],
    ['date', (s) => ({ ...s, date: '2026-12-01' }), 'fecha'],
    ['desk', (s) => ({ ...s, desk: { model: 'X32', showFile: '' } }), 'mesa'],
    ['universes', (s) => ({ ...s, universes: { '1': { protocol: 'artnet', net: '0:0:1', output: '' } } }), 'universos'],
    ['title block', (s) => ({ ...s, titleBlock: { ...s.titleBlock, venue: 'Sala' } }), 'cajetín'],
    ['list kind', (s) => ({ ...s, setlistKind: 'programme' as never }), 'tipo de lista'],
    ['notes', (s) => ({ ...s, notes: 'Dejar libre el pasillo' }), 'notas'],
    ['hospitality', (s) => ({ ...s, hospitality: { ...s.hospitality, dietary: 'Vegano' } }), 'hospitalidad'],
    ['contract', (s) => ({ ...s, contract: { ...s.contract, notes: 'Pago a 30 días' } as Show['contract'] }), 'contrato'],
    ['event', (s) => ({ ...s, event: { ...s.event, venue: 'Teatro' } as Show['event'] }), 'evento'],
    ['document settings', (s) => ({ ...s, document: { ...s.document, landscape: !(s.document as { landscape?: boolean }).landscape } as Show['document'] }), 'configuración del documento'],
  ];
  for (const [name, change, word] of cases) {
    test(`a change in ${name} is named`, () => {
      const lines = diffShows(a(), change(a()), 'es');
      expect(lines).toHaveLength(1);
      expect(lines[0]).toMatch(new RegExp(`^Contenido del documento: .*${word}`));
    });
  }

  test('lists say how many entries came or went, in the language asked for', () => {
    const base = a();
    const more: Show = {
      ...base,
      contacts: [{ id: 'c1', role: 'FOH', name: 'Ana', phone: '', email: '', hidden: [] }],
      schedule: [
        { id: 's1', time: '17:00', what: 'Carga', kind: 'build' },
        { id: 's2', time: '21:00', what: 'Concierto', kind: 'day' },
      ],
      workNotes: [{ id: 'w1', text: 'Revisar', done: false, refId: null }],
    };
    expect(diffShows(base, more, 'es')).toEqual(['Contenido del documento: contactos (+1), horario (+2), notas de trabajo (+1)']);
    expect(diffShows(more, base, 'en')).toEqual(['Document content: contacts (−1), schedule (−2), work notes (−1)']);
  });

  test('editor state and internals do not count as a change', () => {
    const base = a();
    const next: Show = { ...base, view: { ...base.view, grid: !base.view.grid }, muted: ['rule:thing'], counters: { e: 99 }, revision: base.revision + 1 };
    expect(diffShows(base, next, 'es')).toEqual([]);
  });
});
