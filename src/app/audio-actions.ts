// Edits of the input and output lists: each one is a single undo step.
import { itemById } from '../library/items.ts';
import { audioFromLabel, needsPhantom } from '../library/models.ts';
import { addChannel, addOutput, moveChannel, numberWedges, moveOutput, removeChannel, removeOutput, setStereoPair, sortChannels, updateChannel, updateOutput } from '../model/audio.ts';
import type { InputChannel, Output, Show } from '../model/schema.ts';
import { selection, session } from './state.ts';

type ChannelPatch = Partial<Omit<InputChannel, 'id' | 'number'>>;
type OutputPatch = Partial<Omit<Output, 'id' | 'number'>>;

const commit = (fn: (show: Show) => Show): void => session.value?.commit(fn);

export function addChannelRow(): string | null {
  let id: string | null = null;
  commit((show) => {
    const [next, ch] = addChannel(show);
    id = ch.id;
    return next;
  });
  return id;
}

export const setChannel = (id: string, patch: ChannelPatch): void => commit((show) => (show.channels[id] ? updateChannel(show, id, patch) : show));

/** Sets the microphone from what the user typed or picked; a known model also sets the phantom power. */
export function setChannelMic(id: string, text: string): void {
  const mic = audioFromLabel(text);
  const phantom = needsPhantom(mic);
  setChannel(id, phantom === null ? { mic } : { mic, phantom });
}

export const removeChannelRow = (id: string): void => commit((show) => removeChannel(show, id));
export const moveChannelRow = (id: string, delta: -1 | 1): void => commit((show) => moveChannel(show, id, delta));
export const pairChannel = (id: string, other: string | null): void => commit((show) => setStereoPair(show, id, other));

const ORDER = ['drums', 'amp', 'guitar', 'keys', 'strings', 'winds', 'vocals', 'dj', 'person', 'video', 'control', 'pa', 'monitor', 'desk', 'rack', 'furniture'];

/** Groups the channels by the category of the element they come from; channels with no source go last. */
/** Numbers the drawn wedges left to right and front to back, as one undo step. */
export const numberWedgeOutputs = (): void => commit((show) => numberWedges(show));

export function sortByInstrument(): void {
  commit((show) =>
    sortChannels(show, (c) => {
      const el = c.sourceElementId ? show.elements[c.sourceElementId] : undefined;
      const cat = el ? itemById(el.type.id)?.category : undefined;
      const i = cat ? ORDER.indexOf(cat) : -1;
      return i < 0 ? ORDER.length : i;
    }),
  );
}

export function addOutputRow(kind: Output['kind'] = 'wedge'): string | null {
  let id: string | null = null;
  commit((show) => {
    const [next, o] = addOutput(show, { kind });
    id = o.id;
    return next;
  });
  return id;
}
export const setOutput = (id: string, patch: OutputPatch): void => commit((show) => (show.outputs[id] ? updateOutput(show, id, patch) : show));
export const removeOutputRow = (id: string): void => commit((show) => removeOutput(show, id));
export const moveOutputRow = (id: string, delta: -1 | 1): void => commit((show) => moveOutput(show, id, delta));

export const setDeskShowFile = (file: string): void => commit((show) => ({ ...show, desk: { ...show.desk, showFile: file.slice(0, 120) } }));
export const setDeskModel = (model: string): void => commit((show) => ({ ...show, desk: { ...show.desk, model: model.slice(0, 80) } }));

/** Selects the plan element a row comes from, so the plan and the lists stay together. */
export function selectSource(elementId: string | null | undefined): void {
  if (elementId && session.value?.show.peek().elements[elementId]) selection.value = [elementId];
}
