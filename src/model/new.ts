import { FORMAT_VERSION, parseShow, type Layer, type Module, type Show } from './schema.ts';

export const DEFAULT_LAYERS: Layer[] = [
  { id: 'l-stage', name: 'Escenario', subject: 'stage', visible: true, locked: false, dim: 0 },
  { id: 'l-audio', name: 'Audio', subject: 'audio', visible: true, locked: false, dim: 0 },
  { id: 'l-lights', name: 'Luces', subject: 'lights', visible: true, locked: false, dim: 0 },
  { id: 'l-electrical', name: 'Eléctrica', subject: 'electrical', visible: true, locked: false, dim: 0 },
  { id: 'l-control', name: 'Control y vídeo', subject: 'control', visible: true, locked: false, dim: 0 },
  { id: 'l-notes', name: 'Anotaciones', subject: 'notes', visible: true, locked: false, dim: 0 },
  { id: 'l-background', name: 'Fondo', subject: 'background', visible: true, locked: true, dim: 0 },
];

/** An empty show: one rectangular stage, the default layers, and the Spanish region. */
export function newShow(name: string, modules: Module[] = ['audio', 'document']): Show {
  return parseShow({
    formatVersion: FORMAT_VERSION,
    name,
    lang: 'es',
    modules,
    region: { code: 'ES', voltage: 230, plug: 'Schuko' },
    stage: { shape: { kind: 'rect', width: 8000, depth: 5000, prosceniumWidth: 6000 }, height: 800 },
    layers: DEFAULT_LAYERS,
    elements: {},
  });
}
