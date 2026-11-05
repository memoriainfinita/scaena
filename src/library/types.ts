// Library: what can be placed on the plan. Data lives in the repository, under the same license as the code.

export type Category = 'drums' | 'guitar' | 'amp' | 'keys' | 'strings' | 'winds' | 'vocals' | 'pa' | 'monitor' | 'desk' | 'rack' | 'dj' | 'person' | 'furniture' | 'room' | 'control' | 'video' | 'light' | 'effect' | 'scenery' | 'power';

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

export type FixtureKind = 'ellipsoidal' | 'fresnel' | 'pc' | 'par' | 'scoop' | 'strip' | 'cyc' | 'followspot' | 'ledpar' | 'haze' | 'smoke' | 'strobe';

export interface FixtureModel {
  id: string;
  brand: string;
  model: string;
  kind: FixtureKind;
  weightKg: number | null;
  powerW: number | null;
  /** Lens angle or range, as text: "26°", "15-30°", "16-35°". */
  beam: string;
  /** Datasheet URL; absent for generic estimates. */
  source?: string;
  /** True for generic values that are not from a datasheet. */
  estimate?: boolean;
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
  /** Channels or inputs, for consoles and stageboxes. */
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
  computer?: { functions: ('sound' | 'video' | 'lights' | 'network')[]; os: 'windows' | 'macos' | 'linux' | 'other'; programs: { name: string; use: string }[] };
}

export interface PackageChannel {
  name: string;
  mic: string;
  stand: string;
  phantom: boolean;
  /** Index into the package's elements, when the channel belongs to one. */
  element?: number;
}

export interface ShowPackage {
  id: string;
  name: Bilingual;
  description: Bilingual;
  modules: ('audio' | 'lights' | 'computers' | 'video' | 'room' | 'power' | 'document' | 'production')[];
  elements: PackageElement[];
  channels: PackageChannel[];
  /** Number of wedge monitors (placed by the package among the elements) and in-ears. */
  outputs: { kind: 'wedge' | 'iem' | 'main' | 'send'; element?: number }[];
}
