import { customItemById, customItems } from './custom.ts';
import { ICON_DEFS } from './items-icons.ts';
import { MORE_DEFS } from './items-more.ts';
import type { Bilingual, Category, LayerSubject, LibraryItem, SuggestedChannel } from './types.ts';

export const b = (es: string, en: string): Bilingual => ({ es, en });

export interface Def {
  id: string;
  category: Category;
  layer: LayerSubject;
  name: Bilingual;
  tags?: string[];
  w: number;
  d: number;
  h: number;
  symbol: string;
  weightKg?: number | null;
  powerW?: number | null;
  channels?: SuggestedChannel[];
}

export const ch = (name: string, mic: string, stand: string, phantom = false): SuggestedChannel => ({ name, mic, stand, phantom });

// Sizes are typical real dimensions in millimetres. Weight and power are left empty for generic types that
// have no datasheet: the user fills them in, and the power report skips what is empty.
const DEFS: Def[] = [
  { id: 'kit.drums5', category: 'drums', layer: 'audio', name: b('Batería de 5 piezas', '5-piece drum kit'), tags: ['batería', 'drums', 'percusión'], w: 1800, d: 1500, h: 1100, symbol: 'drums',
    channels: [ch('Bombo', 'shure.beta52a', 'Pie corto'), ch('Caja', 'shure.sm57', 'Pinza'), ch('Charles', 'akg.c414xlii', 'Pie recto', true), ch('Tom 1', 'sennheiser.e604', 'Pinza'), ch('Tom 2', 'sennheiser.e604', 'Pinza'), ch('Tom suelo', 'sennheiser.e604', 'Pinza'), ch('OH I', 'akg.c414xlii', 'Pie largo', true), ch('OH D', 'akg.c414xlii', 'Pie largo', true)] },
  { id: 'kit.drums-small', category: 'drums', layer: 'audio', name: b('Batería reducida', 'Small drum kit'), tags: ['batería', 'jazz'], w: 1400, d: 1200, h: 1000, symbol: 'drums',
    channels: [ch('Bombo', 'shure.beta52a', 'Pie corto'), ch('Caja', 'shure.sm57', 'Pinza'), ch('OH I', 'akg.c414xlii', 'Pie largo', true), ch('OH D', 'akg.c414xlii', 'Pie largo', true)] },
  { id: 'amp.guitar', category: 'amp', layer: 'audio', name: b('Ampli de guitarra', 'Guitar amp'), tags: ['guitarra', 'ampli'], w: 700, d: 350, h: 650, symbol: 'guitarAmp', channels: [ch('Guitarra', 'shure.sm57', 'Pie corto')] },
  { id: 'amp.bass', category: 'amp', layer: 'audio', name: b('Ampli de bajo', 'Bass amp'), tags: ['bajo', 'ampli'], w: 800, d: 450, h: 900, symbol: 'bassAmp', channels: [ch('Bajo DI', 'radial.jdi', ''), ch('Bajo ampli', 'shure.sm57', 'Pie corto')] },
  { id: 'keys.keyboard', category: 'keys', layer: 'audio', name: b('Teclado', 'Keyboard'), tags: ['teclado', 'sintetizador'], w: 1300, d: 450, h: 150, symbol: 'keyboard', channels: [ch('Teclado L', 'radial.jdi', ''), ch('Teclado R', 'radial.jdi', '')] },
  { id: 'keys.piano', category: 'keys', layer: 'audio', name: b('Piano de cola', 'Grand piano'), tags: ['piano'], w: 1500, d: 2000, h: 1000, symbol: 'piano', channels: [ch('Piano L', 'akg.c414xlii', 'Pie largo', true), ch('Piano R', 'akg.c414xlii', 'Pie largo', true)] },
  { id: 'strings.doublebass', category: 'strings', layer: 'audio', name: b('Contrabajo', 'Double bass'), tags: ['contrabajo'], w: 600, d: 600, h: 1900, symbol: 'doubleBass', channels: [ch('Contrabajo DI', 'radial.jdi', ''), ch('Contrabajo micro', 'shure.sm57', 'Pie corto')] },
  { id: 'strings.guitar-acoustic', category: 'guitar', layer: 'audio', name: b('Guitarra acústica', 'Acoustic guitar'), tags: ['guitarra', 'acústica'], w: 500, d: 500, h: 1000, symbol: 'person', channels: [ch('Guitarra DI', 'radial.jdi', ''), ch('Guitarra micro', 'shure.sm81', 'Pie recto', true)] },
  { id: 'winds.player', category: 'winds', layer: 'audio', name: b('Viento', 'Wind player'), tags: ['viento', 'saxo', 'trompeta'], w: 500, d: 500, h: 1700, symbol: 'person', channels: [ch('Viento', 'sennheiser.e906', 'Pie recto')] },
  { id: 'vocals.mic-stand', category: 'vocals', layer: 'audio', name: b('Voz con pie', 'Vocal mic with stand'), tags: ['voz', 'cantante', 'micro'], w: 500, d: 500, h: 1600, symbol: 'micStand', channels: [ch('Voz', 'shure.sm58', 'Pie recto')] },
  { id: 'vocals.headset', category: 'vocals', layer: 'audio', name: b('Diadema inalámbrica', 'Wireless headset'), tags: ['diadema', 'actor'], w: 500, d: 500, h: 1700, symbol: 'person', channels: [ch('Diadema', 'sennheiser.ew-dx', '')] },
  { id: 'person.standing', category: 'person', layer: 'stage', name: b('Persona', 'Person'), tags: ['persona', 'actor'], w: 500, d: 500, h: 1700, symbol: 'person' },
  { id: 'pa.line', category: 'pa', layer: 'audio', name: b('Columna de PA', 'PA line array'), tags: ['pa', 'altavoz'], w: 600, d: 500, h: 1800, symbol: 'paLine' },
  { id: 'pa.sub', category: 'pa', layer: 'audio', name: b('Subgrave', 'Subwoofer'), tags: ['sub', 'subgrave'], w: 600, d: 700, h: 600, symbol: 'sub' },
  { id: 'monitor.wedge', category: 'monitor', layer: 'audio', name: b('Cuña de monitor', 'Wedge monitor'), tags: ['cuña', 'monitor', 'retorno'], w: 600, d: 400, h: 350, symbol: 'wedge' },
  { id: 'monitor.iem', category: 'monitor', layer: 'audio', name: b('Petaca in-ear', 'In-ear pack'), tags: ['in-ear', 'iem'], w: 150, d: 100, h: 30, symbol: 'iem' },
  { id: 'desk.digital', category: 'desk', layer: 'audio', name: b('Mesa de mezclas', 'Mixing desk'), tags: ['mesa', 'mezclas'], w: 1000, d: 700, h: 250, symbol: 'desk' },
  { id: 'rack.stagebox', category: 'rack', layer: 'audio', name: b('Stagebox', 'Stage box'), tags: ['stagebox', 'caja de escenario'], w: 500, d: 400, h: 150, symbol: 'stagebox' },
  { id: 'rack.rack', category: 'rack', layer: 'audio', name: b('Rack', 'Rack'), tags: ['rack'], w: 600, d: 600, h: 800, symbol: 'rack' },
  { id: 'rack.di', category: 'rack', layer: 'audio', name: b('Caja de inyección', 'DI box'), tags: ['di', 'inyección'], w: 130, d: 85, h: 45, symbol: 'di' },
  { id: 'dj.booth', category: 'dj', layer: 'audio', name: b('Mesa de DJ', 'DJ booth'), tags: ['dj', 'mesa'], w: 1800, d: 700, h: 1000, symbol: 'djBooth', channels: [ch('DJ L', 'Salida de mesa DJ', ''), ch('DJ R', 'Salida de mesa DJ', '')] },
  { id: 'furniture.riser', category: 'furniture', layer: 'stage', name: b('Tarima', 'Riser'), tags: ['tarima', 'riser'], w: 2000, d: 1000, h: 400, symbol: 'riser' },
  { id: 'furniture.chair', category: 'furniture', layer: 'stage', name: b('Silla', 'Chair'), tags: ['silla'], w: 450, d: 450, h: 900, symbol: 'chair' },
  { id: 'furniture.music-stand', category: 'furniture', layer: 'stage', name: b('Atril', 'Music stand'), tags: ['atril'], w: 500, d: 400, h: 1200, symbol: 'musicStand' },
  { id: 'furniture.table', category: 'furniture', layer: 'stage', name: b('Mesa', 'Table'), tags: ['mesa'], w: 1800, d: 700, h: 750, symbol: 'table' },
  { id: 'furniture.flightcase', category: 'furniture', layer: 'stage', name: b('Flightcase', 'Flight case'), tags: ['flightcase', 'baúl'], w: 800, d: 600, h: 600, symbol: 'flightcase' },
  { id: 'furniture.lectern', category: 'furniture', layer: 'stage', name: b('Atril de conferencia', 'Lectern'), tags: ['atril', 'conferencia'], w: 700, d: 500, h: 1100, symbol: 'lectern', channels: [ch('Atril', 'sennheiser.e835', 'Cuello de cisne')] },
  { id: 'note.text', category: 'furniture', layer: 'notes', name: b('Nota de texto', 'Text note'), tags: ['texto', 'nota', 'text', 'note'], w: 2000, d: 400, h: 0, symbol: 'textbox' },
  { id: 'note.dimension', category: 'furniture', layer: 'notes', name: b('Cota', 'Dimension'), tags: ['cota', 'medida', 'distancia', 'dimension', 'measure'], w: 1000, d: 300, h: 0, symbol: 'dimension' },
  { id: 'power.outlet', category: 'power', layer: 'electrical', name: b('Toma de corriente', 'Power outlet'), tags: ['toma', 'enchufe', 'corriente', 'power', 'outlet'], w: 300, d: 300, h: 0, symbol: 'outlet' },
  { id: 'room.audience', category: 'room', layer: 'stage', name: b('Zona de público', 'Audience area'), tags: ['público', 'sala'], w: 8000, d: 6000, h: 0, symbol: 'audience' },
  { id: 'room.foh', category: 'room', layer: 'audio', name: b('Mesa de FOH', 'FOH position'), tags: ['foh', 'control'], w: 1500, d: 800, h: 1000, symbol: 'foh' },
  { id: 'room.access', category: 'room', layer: 'stage', name: b('Acceso', 'Access'), tags: ['acceso', 'puerta'], w: 1200, d: 300, h: 0, symbol: 'access' },
  { id: 'control.laptop', category: 'control', layer: 'control', name: b('Ordenador portátil', 'Laptop'), tags: ['ordenador', 'portátil', 'pc'], w: 400, d: 300, h: 30, symbol: 'laptop' },
  { id: 'control.lightdesk', category: 'control', layer: 'control', name: b('Mesa de luces', 'Lighting desk'), tags: ['luces', 'mesa de luces', 'consola', 'dmx', 'lighting', 'desk'], w: 900, d: 500, h: 150, symbol: 'lightDesk' },
  { id: 'rack.dimmer', category: 'rack', layer: 'lights', name: b('Rack de dimmers', 'Dimmer rack'), tags: ['dimmer', 'rack', 'potencia', 'luces'], w: 600, d: 600, h: 1000, symbol: 'dimmerRack' },
  { id: 'control.videomixer', category: 'control', layer: 'control', name: b('Mesa de vídeo', 'Video switcher'), tags: ['vídeo', 'mezclador'], w: 500, d: 350, h: 100, symbol: 'videoMixer' },
  { id: 'video.screen', category: 'video', layer: 'control', name: b('Pantalla', 'Screen'), tags: ['pantalla', 'proyección'], w: 3000, d: 120, h: 2000, symbol: 'screen' },
  { id: 'video.projector', category: 'video', layer: 'control', name: b('Proyector', 'Projector'), tags: ['proyector'], w: 450, d: 350, h: 150, symbol: 'projector' },
  { id: 'scenery.curtain', category: 'scenery', layer: 'stage', name: b('Telón o pata', 'Curtain or leg'), tags: ['telón', 'pata', 'masking'], w: 3000, d: 150, h: 4000, symbol: 'curtain' },
  { id: 'scenery.stairs', category: 'scenery', layer: 'stage', name: b('Escalera', 'Stairs'), tags: ['escalera'], w: 1000, d: 1200, h: 800, symbol: 'stairs' },
  { id: 'scenery.platform', category: 'scenery', layer: 'stage', name: b('Plataforma', 'Platform'), tags: ['plataforma'], w: 2000, d: 2000, h: 400, symbol: 'platform' },
];

const LIGHT_DEFS: Def[] = [
  { id: 'light.ellipsoidal', category: 'light', layer: 'lights', name: b('Recorte (elipsoidal)', 'Ellipsoidal'), tags: ['recorte', 'elipsoidal', 'source four'], w: 250, d: 520, h: 300, symbol: 'ellipsoidal' },
  { id: 'light.fresnel', category: 'light', layer: 'lights', name: b('Fresnel', 'Fresnel'), tags: ['fresnel'], w: 250, d: 350, h: 300, symbol: 'fresnel' },
  { id: 'light.pc', category: 'light', layer: 'lights', name: b('Plano convexo', 'PC'), tags: ['pc', 'plano convexo'], w: 250, d: 350, h: 300, symbol: 'pc' },
  { id: 'light.par', category: 'light', layer: 'lights', name: b('PAR', 'PAR can'), tags: ['par', 'par 64'], w: 250, d: 350, h: 250, symbol: 'par' },
  { id: 'light.led-par', category: 'light', layer: 'lights', name: b('PAR LED', 'LED PAR'), tags: ['led', 'par'], w: 240, d: 240, h: 200, symbol: 'ledPar' },
  { id: 'light.scoop', category: 'light', layer: 'lights', name: b('Scoop', 'Scoop'), tags: ['scoop', 'inundación'], w: 300, d: 300, h: 300, symbol: 'scoop' },
  { id: 'light.strip', category: 'light', layer: 'lights', name: b('Tira o panorama', 'Strip light'), tags: ['tira', 'panorama', 'zip strip'], w: 1000, d: 250, h: 150, symbol: 'strip' },
  { id: 'light.cyc', category: 'light', layer: 'lights', name: b('Ciclorama', 'Cyc light'), tags: ['ciclorama', 'cyc', 'econocyc'], w: 500, d: 300, h: 250, symbol: 'cyc' },
  { id: 'light.followspot', category: 'light', layer: 'lights', name: b('Seguidor', 'Followspot'), tags: ['seguidor', 'cañón'], w: 450, d: 1200, h: 1500, symbol: 'followspot' },
  { id: 'effect.haze', category: 'effect', layer: 'lights', name: b('Máquina de haze', 'Hazer'), tags: ['haze', 'niebla'], w: 450, d: 300, h: 250, symbol: 'haze' },
  { id: 'effect.smoke', category: 'effect', layer: 'lights', name: b('Máquina de humo', 'Smoke machine'), tags: ['humo', 'partículas'], w: 450, d: 300, h: 250, symbol: 'smoke' },
  { id: 'effect.strobe', category: 'effect', layer: 'lights', name: b('Estroboscopio', 'Strobe'), tags: ['estrobo', 'strobe'], w: 450, d: 200, h: 150, symbol: 'strobe' },
];

export const ITEMS: LibraryItem[] = [...DEFS, ...LIGHT_DEFS, ...MORE_DEFS, ...ICON_DEFS].map((x) => ({
  id: x.id,
  version: 1,
  category: x.category,
  layer: x.layer,
  name: x.name,
  tags: x.tags ?? [],
  size: { w: x.w, d: x.d, h: x.h },
  weightKg: x.weightKg ?? null,
  powerW: x.powerW ?? null,
  symbol: x.symbol,
  ...(x.channels ? { suggestedChannels: x.channels } : {}),
}));

const BY_ID = new Map(ITEMS.map((i) => [i.id, i]));
export const itemById = (id: string): LibraryItem | undefined => BY_ID.get(id) ?? customItemById(id);

/** Accent-insensitive search over names and tags, in both languages. */
export function searchItems(query: string): LibraryItem[] {
  const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const q = norm(query).trim();
  const all = [...customItems(), ...ITEMS];
  if (!q) return all;
  return all.filter((i) => [i.name.es, i.name.en, ...i.tags].some((t) => norm(t).includes(q)));
}
