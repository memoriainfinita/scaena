import type { Show } from './schema.ts';

/** Sequential ids per prefix ("e1", "e2", "ch1"). The counter lives in the show so ids stay stable across saves. */
export function nextId(show: Show, prefix: string): [string, Show] {
  const n = (show.counters[prefix] ?? 0) + 1;
  return [`${prefix}${n}`, { ...show, counters: { ...show.counters, [prefix]: n } }];
}
