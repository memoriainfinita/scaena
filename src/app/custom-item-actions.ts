// The user's own elements: read a drawing file, check it, and keep it in the open show.
import { cleanSvg, MAX_SVG_BYTES, type CleanError, type CleanSvg } from '../library/svg-clean.ts';
import { addCustomItem, removeCustomItem, type CustomDraft } from '../model/custom-items.ts';
import { session } from './state.ts';

/** Reads the bytes of a file as an SVG and cleans it. A file over the limit is refused before it is decoded. */
export function readDrawing(bytes: Uint8Array): { ok: true; svg: CleanSvg } | { ok: false; error: CleanError } {
  if (bytes.length > MAX_SVG_BYTES) return { ok: false, error: 'tooBig' };
  return cleanSvg(new TextDecoder('utf-8', { fatal: false }).decode(bytes));
}

/** Keeps a new element in the show's library as one undo step; the new element's type id, or null when it was refused. */
export function createCustomItem(draft: CustomDraft): string | null {
  const s = session.value;
  if (!s) return null;
  const [, item] = addCustomItem(s.show.value, draft);
  if (!item) return null;
  s.commit((show) => addCustomItem(show, draft)[0]);
  return `custom.${item.id}`;
}

export function deleteCustomItem(id: string): void {
  session.value?.commit((show) => removeCustomItem(show, id));
}
