// Library: what can be placed on the plan. Data lives in the repository, under the same license as the code.
import type { PlanElement, Show } from '../model/schema.ts';

export type Category = 'drums' | 'guitar' | 'amp' | 'keys' | 'strings' | 'winds' | 'vocals' | 'pa' | 'monitor' | 'desk' | 'rack' | 'dj' | 'person' | 'furniture' | 'room' | 'control' | 'video' | 'light' | 'effect' | 'scenery' | 'power' | 'mic' | 'safety' | 'site' | 'production' | 'machinery' | 'rigging' | 'network';

/** The layer subject an element of this item belongs to by default. */
export type LayerSubject = 'stage' | 'audio' | 'lights' | 'electrical' | 'control' | 'notes' | 'background' | 'custom';

export interface Bilingual {
  es: string;
  en: string;
}

export interface SuggestedChannel {
  /** Short name shown in the input list. */
  name: string;
  /** Suggested microphone or DI: an AudioModel id, or free text. */
  mic: string;
  stand: string;
  phantom: boolean;
}

export interface LibraryItem {
  id: string;
  version: number;
  category: Category;
  layer: LayerSubject;
  name: Bilingual;
  tags: string[];
  /** Real size in millimetres: width (x), depth (y). The symbol is drawn in these units, front towards +y. */
  size: { w: number; d: number; h: number };
  weightKg: number | null;
  powerW: number | null;
  /** Symbol key in `symbols.ts`. */
  symbol: string;
  suggestedChannels?: SuggestedChannel[];
  /** True when weight or power are estimates for a generic type, not datasheet values. */
  estimate?: boolean;
}

export type FixtureKind = 'ellipsoidal' | 'fresnel' | 'pc' | 'par' | 'scoop' | 'strip' | 'cyc' | 'followspot' | 'ledpar' | 'haze' | 'smoke' | 'strobe' | 'moving' | 'led';

export interface FixtureModel {
  id: string;
  brand: string;
  model: string;
  kind: FixtureKind;
  weightKg: number | null;
  powerW: number | null;
  /** Lens angle or range, as text: "26°", "15-30°", "16-35°". */
  beam: string;
  /** DMX modes as [name, channels], from the Open Fixture Library. */
  modes?: [string, number][];
  /** Datasheet URL; absent for generic estimates. */
  source?: string;
  /** True for generic values that are not from a datasheet. */
  estimate?: boolean;
  /** True for entries from the Open Fixture Library: contributed by volunteers, not checked against a datasheet. */
  community?: boolean;
  note?: string;
}

export type AudioKind = 'mic' | 'di' | 'iem' | 'console' | 'stagebox' | 'wireless';

export interface AudioModel {
  id: string;
  brand: string;
  model: string;
  kind: AudioKind;
  /** Microphones: dynamic needs no phantom power, condenser does (defined by type, decision 2026-11-02). */
  micType?: 'dynamic' | 'condenser';
  pattern?: string;
  weightKg: number | null;
  /** Physical mic/line inputs (preamps), for consoles and stageboxes; not the number of mixing channels. */
  inputs?: number;
  source?: string;
  note?: string;
}

export interface Region {
  code: string;
  name: Bilingual;
  /** Default circuit voltage for the plan, editable by the user. */
  voltage: number;
  frequency: '50' | '60' | '50/60';
  plugs: string[];
  /** The default voltage is a proposal the user has yet to confirm. */
  toConfirm?: boolean;
}

export interface ConnectorType {
  id: string;
  name: Bilingual;
  /** Rated current in amps, when known. */
  amps: number | null;
  note?: string;
}

export interface PackageElement {
  type: string;
  x: number;
  y: number;
  rotation?: number;
  label?: string;
  suppliedBy?: 'band' | 'venue' | 'rental' | 'unset';
  /** Computers: what they do and run. */
  /** Lights: fixture model, the numbers that identify it and where it hangs (index into the package's mounts). */
  light?: { modelId: string; channel: number; circuit?: number; dimmer?: number; mount?: number; color?: string; universe?: number; address?: number; dmxMode?: string; dmxSlots?: number };
  /** Risers, platforms and the like: size and height when they differ from the library's. */
  size?: { w: number; d: number; height?: number };
  /** A rack: its height in units and what is mounted in it, from the top. */
  rack?: { units: number; slots: [Bilingual, number][] };
  notes?: Bilingual;
  /** Network address of a computer, switch or desk. */
  ip?: string;
  computer?: { functions: ('sound' | 'video' | 'lights' | 'network')[]; os: 'windows' | 'macos' | 'linux' | 'other'; programs: { name: string; use: string }[] };
}

export interface PackageChannel {
  name: string;
  mic: string;
  stand: string;
  phantom: boolean;
  /** Index into the package's elements, when the channel belongs to one. */
  element?: number;
  /** Where it plugs in, for example "SB 1". */
  patch?: string;
}

/** A cable drawn on the plan between two of the package's elements (indexes into `elements`). */
export interface PackageLink {
  from: number;
  to: number;
  signal: 'audio' | 'video' | 'lightControl' | 'network';
  connector?: string;
  /** A radio link: no cable, no length. */
  wireless?: boolean;
  /** Numbered input the cable arrives at, and the lines it carries from there. */
  toPort?: number;
  lines?: number;
}

/** Where lights hang or stand: a bar, pipe, truss, side boom, or the floor. */
export interface PackageMount {
  kind: 'bar' | 'pipe' | 'truss' | 'boom' | 'floor';
  name: Bilingual;
  from: { x: number; y: number };
  to: { x: number; y: number };
  heightMm: number;
  maxLoadKg?: number;
}

export interface ShowPackage {
  id: string;
  name: Bilingual;
  description: Bilingual;
  modules: ('audio' | 'lights' | 'computers' | 'video' | 'room' | 'power' | 'document' | 'production')[];
  elements: PackageElement[];
  channels: PackageChannel[];
  /** Number of wedge monitors (placed by the package among the elements) and in-ears. */
  outputs: { kind: 'wedge' | 'iem' | 'main' | 'send'; element?: number; who?: Bilingual | string; mix?: Record<number, 'low' | 'normal' | 'high'> }[];
  links?: PackageLink[];
  mounts?: PackageMount[];
  /** The mixing desk the example uses (a library audio model id). */
  desk?: string;
  /** Everything that is not on the plan: contacts, schedule, hospitality, electrical, notes. Texts come as both languages. */
  finish?: (show: Show, placed: PlanElement[], tx: (b: Bilingual) => string) => Show;
  /** Images the example brings with it, by the file name the show refers to them by. */
  images?: () => Record<string, Uint8Array>;
  /** Two saved versions of the example: `earlier` turns the finished show into the first one. */
  history?: { earlier: (show: Show) => Show; first: [string, Bilingual]; second: [string, Bilingual] };
}
