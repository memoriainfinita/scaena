// Looks that the editor and the PDF share. Each renderer applies its own units: pixels on screen, paper millimetres on paper.
import type { Show, SignalType } from '../model/schema.ts';

/** Colour of a cable by signal, always backed by a different dash and the connector name. */
export const LINK_STYLE: Record<SignalType, { stroke: string; dash: string }> = {
  audio: { stroke: '#0b6e78', dash: '' },
  video: { stroke: '#7a3db8', dash: '10 5' },
  lightControl: { stroke: '#b36b00', dash: '10 4 2 4' },
  network: { stroke: '#3a6e1a', dash: '2 5' },
};

/** The dash of a link: its signal's, or short dots for a wireless one. */
export const linkDash = (c: { signal: SignalType; wireless?: boolean | undefined }): string => (c.wireless ? '1 3' : LINK_STYLE[c.signal].dash);

/** Whether the mounts (bars, pipes, trusses) and their names are drawn: they belong to the lights layer. A show with no such layer shows them. */
export const mountsShown = (show: Show, isOn: (layerId: string) => boolean): boolean => {
  const layer = show.layers.find((l) => l.subject === 'lights');
  return layer ? isOn(layer.id) : true;
};
