// The patch of each channel, worked out from the audio cables that arrive at a numbered port (docs/design/patch-from-cables-2026-11-08.md).
import { itemById } from '../library/items.ts';
import type { Connection, InputChannel, Show } from './schema.ts';

/** Items whose number of inputs is known, for the out-of-range warning. */
export const PORTS_OF_ITEM: Record<string, number> = { 'rack.stagebox-16': 16, 'rack.stagebox-48': 48 };

export interface PatchAnalysis {
  /** Channel id to its patch according to the cables. */
  derived: Map<string, string>;
  /** Ports reached by more than one cable. */
  taken: { element: string; port: number }[];
  /** Ports above what the item has. */
  over: { element: string; port: number; max: number }[];
  /** Origins with more channels than lines arriving. */
  short: { element: string; channels: number; lines: number }[];
}

const portName = (show: Show, id: string): string => {
  const el = show.elements[id];
  if (!el) return '';
  return el.label.trim() || itemById(el.type.id)?.name[show.lang] || el.type.id;
};

function analyse(show: Show): PatchAnalysis {
  const channels = Object.values(show.channels).sort((a, b) => a.number - b.number);
  const audio = Object.values(show.connections).filter((c) => c.signal === 'audio');

  // The channels a cable leaving this element carries: its own, or those of what feeds it (a DI box has none).
  const feeding = (element: string, seen = new Set<string>()): InputChannel[] => {
    if (seen.has(element)) return [];
    seen.add(element);
    const own = channels.filter((c) => c.sourceElementId === element);
    if (own.length) return own;
    return audio.filter((c) => c.to === element).flatMap((c) => feeding(c.from, seen));
  };

  const cables = audio.filter((c): c is Connection & { toPort: number } => c.toPort !== null).sort((a, b) => (a.to === b.to ? a.toPort - b.toPort : a.to < b.to ? -1 : 1));
  const derived = new Map<string, string>();
  const used = new Map<string, Set<number>>();
  const result: PatchAnalysis = { derived, taken: [], over: [], short: [] };

  for (const c of cables) {
    const ports = used.get(c.to) ?? new Set<number>();
    used.set(c.to, ports);
    const toEl = show.elements[c.to];
    const max = toEl ? PORTS_OF_ITEM[toEl.type.id] : undefined;
    const waiting = feeding(c.from).filter((ch) => !derived.has(ch.id));
    for (let line = 0; line < c.lines; line++) {
      const port = c.toPort + line;
      if (ports.has(port)) result.taken.push({ element: c.to, port });
      ports.add(port);
      if (max !== undefined && port > max) result.over.push({ element: c.to, port, max });
      const ch = waiting[line];
      if (ch) derived.set(ch.id, `${portName(show, c.to)} ${port}`);
    }
  }

  const reported = new Set<string>();
  for (const c of cables) {
    if (reported.has(c.from)) continue;
    const all = feeding(c.from);
    if (all.some((ch) => !derived.has(ch.id) && !ch.patch.trim())) {
      reported.add(c.from);
      result.short.push({ element: c.from, channels: all.length, lines: cables.filter((o) => o.from === c.from).reduce((a, o) => a + o.lines, 0) });
    }
  }
  return result;
}

const cache = new WeakMap<Show, PatchAnalysis>();

/** What the cables say about the patch of this show. */
export function patchAnalysis(show: Show): PatchAnalysis {
  let a = cache.get(show);
  if (!a) {
    a = analyse(show);
    cache.set(show, a);
  }
  return a;
}

/** The patch a channel is shown with: the typed one, or the one the cables give. */
export const effectivePatch = (show: Show, ch: InputChannel): string => ch.patch.trim() || patchAnalysis(show).derived.get(ch.id) || '';
