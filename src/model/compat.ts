// What each kind of element can send or receive, and how long a cable of each connector can reasonably be. Used by the
// warnings about cables: they say what looks odd and never stop anything.
import { itemById } from '../library/items.ts';
import type { PlanElement, SignalType } from './schema.ts';

const VIDEO_IDS = new Set(['control.videomixer', 'control.tablet']);
const LIGHT_CONTROL_IDS = new Set(['control.lightdesk']);

/** True when the element plausibly takes part in that kind of signal. Network is not judged. */
export function handlesSignal(el: PlanElement, signal: SignalType): boolean {
  if (signal === 'network') return true;
  const it = itemById(el.type.id);
  if (!it) return true;
  const fns = el.computer?.functions ?? [];
  if (signal === 'audio') return it.layer === 'audio' || fns.includes('sound') || (it.suggestedChannels?.length ?? 0) > 0 || it.category === 'rack';
  if (signal === 'video') return it.category === 'video' || VIDEO_IDS.has(it.id) || fns.includes('video');
  return it.layer === 'lights' || LIGHT_CONTROL_IDS.has(it.id) || fns.includes('lights') || it.category === 'rack';
}

/** Longest usual run in metres per connector (lowercase prefix match); null when unknown. */
const MAX_M: [string, number][] = [
  ['hdmi', 15],
  ['displayport', 15],
  ['usb', 5],
  ['sdi', 100],
  ['dmx', 300],
  ['xlr', 100],
  ['speakon', 100],
  ['ethernet', 100],
  ['cat', 100],
];
export function maxCableM(connector: string): number | null {
  const c = connector.trim().toLowerCase();
  return MAX_M.find(([k]) => c.startsWith(k))?.[1] ?? null;
}
