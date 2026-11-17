// Edits of the input and output lists: each one is a single undo step.
import { itemById } from '../library/items.ts';
import { audioById, audioFromLabel, needsPhantom } from '../library/models.ts';
import { addDesk, mainDeskId, removeDesk, sendToDesk, setDeskPatch, setOutputDesk, updateDesk } from '../model/desks.ts';
import { addChannel, addOutput, moveChannel, numberWedges, moveOutput, removeChannel, removeOutput, setMixLevel, setStereoPair, sortChannels, updateChannel, updateOutput } from '../model/audio.ts';
import type { Desk, InputChannel, MixLevel, Output, Show, SourceKind } from '../model/schema.ts';
import { selection, session } from './state.ts';

type ChannelPatch = Partial<Omit<InputChannel, 'id' | 'number'>>;
type OutputPatch = Partial<Omit<Output, 'id' | 'number'>>;

const commit = (fn: (show: Show) => Show): void => session.value?.commit(fn);

/** Adds a source. Added while looking at a desk that is not the main one, it goes to that desk only. */
export function addChannelRow(deskId?: string): string | null {
  let id: string | null = null;
  commit((show) => {
    const [next, ch] = addChannel(show);
    id = ch.id;
    if (!deskId || deskId === mainDeskId(show)) return next;
    return sendToDesk(sendToDesk(next, ch.id, mainDeskId(show), null), ch.id, deskId);
  });
  return id;
}

export const setChannel = (id: string, patch: ChannelPatch): void => commit((show) => (show.channels[id] ? updateChannel(show, id, patch) : show));

/** Sets the device from what the user typed or picked; a known model also sets the kind of source and the phantom power. */
export function setChannelMic(id: string, text: string): void {
  const mic = audioFromLabel(text);
  const phantom = needsPhantom(mic);
  const model = audioById(mic);
  const kind = model && (model.kind === 'mic' || model.kind === 'di') ? { kind: model.kind } : {};
  setChannel(id, { mic, ...kind, ...(phantom === null ? {} : { phantom }) });
}

/** Sets the kind of source. A known mic or DI that does not fit the new kind is cleared, and only mics and DI boxes can take phantom power. */
export const setChannelKind = (id: string, kind: SourceKind): void =>
  commit((show) => {
    const ch = show.channels[id];
    if (!ch) return show;
    const model = audioById(ch.mic);
    return updateChannel(show, id, { kind, ...(model && model.kind !== kind ? { mic: '' } : {}), ...(kind === 'mic' || kind === 'di' ? {} : { phantom: false }) });
  });

export const removeChannelRow = (id: string): void => commit((show) => removeChannel(show, id));
export const moveChannelRow = (id: string, delta: -1 | 1): void => commit((show) => moveChannel(show, id, delta));
export const pairChannel = (id: string, other: string | null): void => commit((show) => setStereoPair(show, id, other));

const ORDER = ['drums', 'amp', 'guitar', 'keys', 'strings', 'winds', 'vocals', 'dj', 'person', 'video', 'control', 'pa', 'monitor', 'desk', 'rack', 'furniture'];

/** Numbers the drawn wedges left to right and front to back, as one undo step. */
export const numberWedgeOutputs = (): void => commit((show) => numberWedges(show));

/** Groups the channels by the category of the element they come from; channels with no source go last. */
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

export function addOutputRow(kind: Output['kind'] = 'wedge', deskId?: string): string | null {
  let id: string | null = null;
  commit((show) => {
    const [next, o] = addOutput(show, { kind });
    id = o.id;
    return deskId ? setOutputDesk(next, o.id, deskId) : next;
  });
  return id;
}
export const setOutput = (id: string, patch: OutputPatch): void => commit((show) => (show.outputs[id] ? updateOutput(show, id, patch) : show));
export const setMix = (output: string, channel: string, level: MixLevel | null): void => commit((show) => setMixLevel(show, output, channel, level));
export const removeOutputRow = (id: string): void => commit((show) => removeOutput(show, id));
export const moveOutputRow = (id: string, delta: -1 | 1): void => commit((show) => moveOutput(show, id, delta));

/** Edits the model or show file of the main desk, keeping the desk list (when there is one) in step. */
const mainDeskField = (show: Show, patch: { model?: string; showFile?: string }): Show => (show.desks.length > 0 ? updateDesk(show, mainDeskId(show), patch) : { ...show, desk: { ...show.desk, ...patch } });
export const setDeskShowFile = (file: string): void => commit((show) => mainDeskField(show, { showFile: file.slice(0, 120) }));
export const setDeskModel = (model: string): void => commit((show) => mainDeskField(show, { model: model.slice(0, 80) }));

/** Adds a desk and returns its id. */
export function addDeskRow(): string | null {
  let id: string | null = null;
  commit((show) => {
    const [next, desk] = addDesk(show);
    id = desk.id;
    return next;
  });
  return id;
}
export const setDesk = (id: string, patch: Partial<Omit<Desk, 'id'>>): void => commit((show) => updateDesk(show, id, patch));
export const removeDeskRow = (id: string): void => commit((show) => removeDesk(show, id));
/** Sends a source to a desk, or stops sending it with `null`. The main desk keeps the row's own number. */
export const sendChannelToDesk = (channelId: string, deskId: string, number?: number | null): void =>
  commit((show) => {
    const ch = show.channels[channelId];
    if (!ch) return show;
    return sendToDesk(show, channelId, deskId, number === undefined && deskId === mainDeskId(show) ? ch.number : number);
  });
export const setChannelDeskPatch = (channelId: string, deskId: string, patch: string): void => commit((show) => setDeskPatch(show, channelId, deskId, patch.slice(0, 24)));
export const moveOutputToDesk = (outputId: string, deskId: string): void => commit((show) => setOutputDesk(show, outputId, deskId));

/** Selects the plan element a row comes from, so the plan and the lists stay together. */
export function selectSource(elementId: string | null | undefined): void {
  if (elementId && session.value?.show.peek().elements[elementId]) selection.value = [elementId];
}
