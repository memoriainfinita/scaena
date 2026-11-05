// Edits of the plan background (an imported PDF or DXF, kept as a PNG inside the show).
import { signal } from '@preact/signals';
import { calibrate, centredOn, type Background } from '../background/calibrate.ts';
import { pngSize } from '../background/png.ts';
import type { Show } from '../model/schema.ts';
import { session } from './state.ts';

/** Bumped when the plan should fit its view again, e.g. after an import. */
export const fitRequest = signal(0);

const commit = (fn: (show: Show) => Show): void => session.value?.commit(fn);

/** Makes a PNG the background, centred on the stage at the size it had on paper (or in the drawing's units). */
export function setBackgroundImage(png: Uint8Array, widthMm: number, heightMm: number): void {
  const s = session.value;
  const size = pngSize(png);
  if (!s || !size) throw new Error('not a PNG');
  const name = `background-${Date.now().toString(36)}.png`;
  s.addImage(name, png);
  commit((show) => {
    const at = centredOn(show.stage, widthMm, heightMm);
    return { ...show, stage: { ...show.stage, background: { file: name, x: at.x, y: at.y, scale: widthMm / size.w, opacity: 0.4, locked: false } } };
  });
  fitRequest.value++;
}

export const updateBackground = (patch: Partial<Background>): void => commit((show) => (show.stage.background ? { ...show, stage: { ...show.stage, background: { ...show.stage.background, ...patch } } } : show));
export const removeBackground = (): void => commit((show) => ({ ...show, stage: { ...show.stage, background: null } }));

/** Rescales the background so two points on the plan are `realMm` apart. Returns false when it cannot. */
export function calibrateBackground(a: { x: number; y: number }, b: { x: number; y: number }, realMm: number): boolean {
  const bg = session.value?.show.peek().stage.background;
  if (!bg) return false;
  const next = calibrate(bg, a, b, realMm);
  if (!next) return false;
  updateBackground(next);
  return true;
}
