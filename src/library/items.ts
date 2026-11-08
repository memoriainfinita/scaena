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

/** Typical draw in watts of the equipment that needs mains, as a starting point the user edits. Items not listed here have none. */
export const TYPICAL_POWER_W: Record<string, number> = {
  'amp.guitar': 150, 'amp.bass': 400, 'amp.stack': 300, 'keys.keyboard': 40, 'keys.synth': 50, 'keys.stage-piano': 60, 'keys.organ': 200,
  'pa.line': 600, 'pa.sub': 1000, 'pa.top': 600, 'pa.front-fill': 300, 'pa.delay': 600,
  'monitor.wedge': 300, 'monitor.iem': 5, 'monitor.sidefill': 600, 'monitor.drumfill': 600,
  'desk.digital': 100, 'desk.analog': 150, 'desk.monitor': 100, 'rack.stagebox': 60, 'rack.iem': 60, 'rack.wireless': 60, 'rack.amps': 2000, 'rack.fx': 150, 'rack.network': 100,
  'dj.booth': 300, 'dj.controller': 30, 'dj.turntables': 30,
  'control.laptop': 65, 'control.lightdesk': 100, 'control.videomixer': 60, 'control.tablet': 15, 'control.server': 300,
  'video.projector': 400, 'video.led-wall': 1500, 'video.tv': 150, 'video.camera': 30,
  'effect.haze': 400, 'effect.smoke': 1000, 'effect.strobe': 1000, 'effect.laser': 300, 'effect.mirror-ball': 20, 'effect.co2': 50,
  // Rest of the library. Passive things (microphones, cabinets, acoustic pianos, screens, cable reels, machinery without a motor) have none.
  'effect.smoke-2': 1000, 'effect.bubble': 100, 'effect.confetti': 50, 'effect.snow': 400, 'effect.flame': 300, 'effect.fan': 500, 'effect.coldspark': 600, 'effect.lowfog': 1500, 'effect.streamer': 50,
  'control.phone': 10, 'control.pad': 10, 'control.looper': 20, 'control.slides': 65, 'control.sm-desk': 60, 'control.lx-large': 200, 'control.lx-wing': 50, 'control.dmx': 20, 'comms.beltpack': 3, 'comms.station': 30, 'comms.cue-light': 10,
  'amp.leslie': 100, 'amp.head': 150, 'amp.stack-2': 300, 'amp.bass-stack': 600, 'amp.bass-head': 400, 'amp.acoustic': 100, 'amp.keyboard': 150, 'amp.practice': 50, 'amp.vintage': 100,
  'pa.compact-10': 200, 'pa.top-12': 300, 'pa.column': 400, 'pa.line-ground': 2400, 'pa.cluster': 1200, 'pa.sub-dual': 1800, 'pa.sub-flown': 1000, 'pa.sub-stack': 3000, 'pa.lip-fill': 150, 'pa.infill': 200, 'pa.balcony': 100, 'pa.horn': 200, 'pa.surround': 150,
  'pa.tripod': 300, 'pa.top-15': 400, 'pa.sub-cardioid': 1000, 'pa.array-hang': 1200, 'pa.array-hung': 1200, 'pa.outfill': 600, 'pa.pole': 300, 'monitor.coax': 300, 'monitor.wedge-15': 300,
  'rack.wireless-receiver': 20, 'rack.iem-tx': 30, 'rack.personal-mixer': 20, 'rack.headphone-amp': 40, 'rack.antenna-combiner': 15, 'rack.click': 10, 'rack.interface': 30, 'rack.preamp': 40, 'rack.power-conditioner': 20, 'rack.splitter': 20, 'rack.recorder': 60,
  'rack.compressor': 30, 'rack.geq': 20, 'rack.fx-unit': 40, 'rack.speaker-proc': 40, 'rack.power-amp': 1200, 'rack.cue-box': 10, 'rack.timecode': 15, 'rack.harmoniser': 30,
  'net.wifi-ap': 15, 'net.router': 15, 'net.hotspot': 10, 'net.poe': 100, 'net.fibre': 10, 'net.dante': 15, 'net.dmx-splitter': 10, 'net.artnet': 10,
  'keys.epiano': 60, 'keys.hammond': 200, 'keys.organ-console': 200, 'keys.midi': 10, 'synth.modular': 50, 'synth.drum-machine': 15, 'synth.groovebox': 15, 'synth.vocoder': 30, 'synth.desktop': 20, 'synth.sequencer': 15,
  'dj.cdj': 40, 'dj.mixer': 30, 'desk.portable': 40, 'desk.powered': 150,
  'video.proj-ceiling': 400, 'video.proj-stand': 400, 'video.proj-large': 1500, 'video.proj-short': 300, 'video.led-proc': 100, 'video.led-curve': 1500, 'video.ptz': 40, 'video.teleprompter': 80, 'video.confidence': 100, 'video.stream-pc': 300, 'video.capture': 20, 'video.cart': 200, 'video.wireless': 15, 'video.tally': 5,
  'mach.winch': 1500, 'mach.revolve': 2200, 'mach.elevator': 3000, 'mach.trap': 750, 'mach.hoist-ctrl': 100,
};

export const ITEMS: LibraryItem[] = [...DEFS, ...LIGHT_DEFS, ...MORE_DEFS, ...ICON_DEFS].map((x) => ({
  id: x.id,
  version: 1,
  category: x.category,
  layer: x.layer,
  name: x.name,
  tags: x.tags ?? [],
  size: { w: x.w, d: x.d, h: x.h },
  weightKg: x.weightKg ?? null,
  powerW: x.powerW ?? TYPICAL_POWER_W[x.id] ?? null,
  symbol: x.symbol,
  ...(x.channels ? { suggestedChannels: x.channels } : {}),
}));

const BY_ID = new Map(ITEMS.map((i) => [i.id, i]));
export const itemById = (id: string): LibraryItem | undefined => BY_ID.get(id) ?? customItemById(id);

/** The order the categories are listed in: what is on a stage first, then the room, production and the technical side. */
export const CATEGORY_ORDER: Category[] = ['vocals', 'guitar', 'amp', 'keys', 'drums', 'strings', 'winds', 'dj', 'mic', 'desk', 'rack', 'pa', 'monitor', 'light', 'effect', 'video', 'control', 'network', 'power', 'person', 'furniture', 'scenery', 'room', 'site', 'rigging', 'machinery', 'safety', 'production'];
const RANK = new Map(CATEGORY_ORDER.map((c, i) => [c, i]));
const rank = (c: Category): number => RANK.get(c) ?? CATEGORY_ORDER.length;

/** Own items are listed first, under their own heading; the rest by category. */
export const isCustomItem = (i: LibraryItem): boolean => customItemById(i.id) !== undefined && !BY_ID.has(i.id);

const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/** Accent-insensitive search over names and tags, in both languages. Without a query: own items, then by category, then by name. With one: names that start with it, then names that contain it, then tags. */
export function searchItems(query: string, lang: 'es' | 'en' = 'es'): LibraryItem[] {
  const q = norm(query).trim();
  const all = [...customItems(), ...ITEMS];
  const byName = (a: LibraryItem, b: LibraryItem) => a.name[lang].localeCompare(b.name[lang], lang);
  const byCategory = (a: LibraryItem, b: LibraryItem) => Number(isCustomItem(b)) - Number(isCustomItem(a)) || rank(a.category) - rank(b.category) || byName(a, b);
  if (!q) return all.sort(byCategory);
  const score = (i: LibraryItem): number => {
    const names = [i.name[lang], i.name[lang === 'es' ? 'en' : 'es']].map(norm);
    if (names[0]!.startsWith(q)) return 0;
    if (names[0]!.split(/[\s/-]+/).some((w) => w.startsWith(q))) return 1;
    if (names[0]!.includes(q)) return 2;
    if (names[1]!.includes(q)) return 3;
    return i.tags.some((t) => norm(t).includes(q)) ? 4 : -1;
  };
  return all
    .map((i) => [i, score(i)] as const)
    .filter(([, sc]) => sc >= 0)
    .sort(([a, x], [b, y]) => x - y || byCategory(a, b))
    .map(([i]) => i);
}
