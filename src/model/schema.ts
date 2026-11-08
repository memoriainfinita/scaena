// Data model of a show (montaje). Everything is serializable; units are millimetres, kilograms and watts.
// Derived data is not stored: only manual adjustments on top of it (see docs/design/modelo-2026-10-29.md).
import * as v from 'valibot';
import { isCleanMarkup, MAX_SVG_BYTES } from '../library/svg-clean.ts';

export const FORMAT_VERSION = 1;

const id = v.pipe(v.string(), v.minLength(1), v.maxLength(64));
const mm = v.pipe(v.number(), v.finite());
const text = (max = 2000) => v.optional(v.pipe(v.string(), v.maxLength(max)), '');

export const Paper = v.picklist(['A4', 'A3', 'Letter', 'Tabloid']);
export const Units = v.picklist(['metric', 'imperial']);
export const Lang = v.picklist(['es', 'en']);
export const Module = v.picklist(['audio', 'lights', 'computers', 'video', 'room', 'power', 'document', 'production']);
export const Subject = v.picklist(['stage', 'audio', 'lights', 'electrical', 'control', 'notes', 'background', 'custom']);
export const SuppliedBy = v.picklist(['band', 'venue', 'rental', 'unset']);
export const SignalType = v.picklist(['audio', 'video', 'lightControl', 'network']);

export const TypeRef = v.object({ id: v.pipe(v.string(), v.minLength(1), v.maxLength(80)), version: v.pipe(v.number(), v.integer(), v.minValue(1)) });
const Point = v.object({ x: mm, y: mm });

export const Layer = v.object({
  id,
  name: v.pipe(v.string(), v.maxLength(80)),
  subject: Subject,
  visible: v.optional(v.boolean(), true),
  locked: v.optional(v.boolean(), false),
  dim: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(1)), 0),
});

/** An element the user drew: the markup is checked on every load, so a file cannot carry anything the cleaner would not produce. */
export const CustomItem = v.pipe(
  v.object({
    id,
    name: v.pipe(v.string(), v.minLength(1), v.maxLength(80)),
    layer: v.optional(Subject, 'stage'),
    w: v.pipe(v.number(), v.minValue(10), v.maxValue(100000)),
    d: v.pipe(v.number(), v.minValue(10), v.maxValue(100000)),
    h: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(100000)), 0),
    weightKg: v.optional(v.nullable(v.pipe(v.number(), v.minValue(0))), null),
    powerW: v.optional(v.nullable(v.pipe(v.number(), v.minValue(0))), null),
    viewBox: v.tuple([v.pipe(v.number(), v.finite()), v.pipe(v.number(), v.finite()), v.pipe(v.number(), v.finite(), v.minValue(0.000001)), v.pipe(v.number(), v.finite(), v.minValue(0.000001))]),
    markup: v.pipe(v.string(), v.maxLength(MAX_SVG_BYTES)),
  }),
  v.check((c) => isCleanMarkup(c.markup, c.viewBox), 'custom drawing is not clean'),
);

export const Computer = v.object({
  functions: v.pipe(v.array(v.picklist(['sound', 'video', 'lights', 'network'])), v.minLength(1)),
  os: v.optional(v.picklist(['windows', 'macos', 'linux', 'other']), 'other'),
  programs: v.optional(v.array(v.object({ name: v.pipe(v.string(), v.maxLength(120)), version: text(60), use: text(200) })), []),
  license: text(200),
  dongle: v.optional(v.boolean(), false),
  outputs: v.optional(
    v.array(v.object({ signal: SignalType, connector: v.picklist(['hdmi', 'displayport', 'usbAudio', 'dante', 'dmx', 'midi', 'other']), note: text(200) })),
    [],
  ),
});

export const Luminaire = v.object({
  mountId: v.optional(v.nullable(id), null),
  unit: v.optional(v.nullable(v.number()), null),
  channel: v.optional(v.nullable(v.number()), null),
  dimmer: v.optional(v.nullable(v.number()), null),
  circuit: v.optional(v.nullable(v.number()), null),
  universe: v.optional(v.nullable(v.number()), null),
  address: v.optional(v.nullable(v.number()), null),
  /** Name of the DMX mode of its model; `dmxSlots` is the channel count typed by hand for models without modes. */
  dmxMode: v.optional(v.pipe(v.string(), v.maxLength(60)), ''),
  dmxSlots: v.optional(v.nullable(v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(512))), null),
  color: text(40),
  /** A library fixture model id when the user picked one; weight and power then start from it. */
  modelId: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(80))), null),
  accessories: v.optional(v.array(v.pipe(v.string(), v.maxLength(80))), []),
  focus: v.optional(v.nullable(Point), null),
  notes: text(),
});

export const RackSlot = v.object({ id, name: v.pipe(v.string(), v.maxLength(80)), u: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(20)) });
/** A rack and what is mounted in it, from the top, in rack units. */
export const Rack = v.object({ units: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(60)), slots: v.optional(v.array(RackSlot), []) });

export const PlanElement = v.object({
  id,
  type: TypeRef,
  x: mm,
  y: mm,
  z: v.optional(mm, 0),
  rotation: v.optional(mm, 0),
  flipX: v.optional(v.boolean(), false),
  flipY: v.optional(v.boolean(), false),
  width: v.optional(v.nullable(v.pipe(v.number(), v.minValue(0))), null),
  depth: v.optional(v.nullable(v.pipe(v.number(), v.minValue(0))), null),
  /** Top of a riser or platform above the stage deck, in millimetres; null uses the library's. */
  height: v.optional(v.nullable(v.pipe(v.number(), v.minValue(0))), null),
  layerId: id,
  label: text(120),
  groupId: v.optional(v.nullable(id), null),
  suppliedBy: v.optional(SuppliedBy, 'unset'),
  notes: text(),
  weightKg: v.optional(v.nullable(v.number()), null),
  powerW: v.optional(v.nullable(v.number()), null),
  /** Mains phase (1 to 3) a piece of equipment that is not a light is plugged into; lights take theirs from their circuit. */
  phase: v.optional(v.nullable(v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(3))), null),
  computer: v.optional(v.nullable(Computer), null),
  luminaire: v.optional(v.nullable(Luminaire), null),
  rack: v.optional(v.nullable(Rack), null),
  /** Network address of a computer, switch or desk. */
  ip: v.optional(v.pipe(v.string(), v.maxLength(45)), ''),
});

export const InputChannel = v.object({
  id,
  number: v.pipe(v.number(), v.integer(), v.minValue(1)),
  shortName: v.optional(v.pipe(v.string(), v.maxLength(16)), ''),
  mic: text(80),
  stand: text(80),
  phantom: v.optional(v.boolean(), false),
  insert: text(80),
  /** Where it plugs in: stagebox and port, for example "SB A 12". */
  patch: v.optional(v.pipe(v.string(), v.maxLength(24)), ''),
  stereoPairWith: v.optional(v.nullable(id), null),
  sourceElementId: v.optional(v.nullable(id), null),
  notes: text(),
});

export const Output = v.object({
  id,
  number: v.pipe(v.number(), v.integer(), v.minValue(1)),
  kind: v.picklist(['wedge', 'iem', 'main', 'send']),
  stereo: v.optional(v.boolean(), false),
  aux: text(40),
  sourceElementId: v.optional(v.nullable(id), null),
  notes: text(),
});

export const Connection = v.object({
  id,
  from: id,
  to: id,
  signal: SignalType,
  connector: text(40),
  lengthMm: v.optional(v.nullable(v.pipe(v.number(), v.minValue(0))), null),
  label: text(80),
  /** The numbered input an audio cable arrives at; the channels it carries take their patch from it. */
  toPort: v.optional(v.nullable(v.pipe(v.number(), v.integer(), v.minValue(1))), null),
  /** Lines the cable carries from that port on: a drum loom is one cable with 8 lines. */
  lines: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(64)), 1),
});

export const Mount = v.object({
  id,
  kind: v.picklist(['bar', 'pipe', 'truss', 'boom', 'floor']),
  name: v.pipe(v.string(), v.maxLength(80)),
  from: Point,
  to: Point,
  heightMm: v.optional(mm, 0),
  maxLoadKg: v.optional(v.nullable(v.number()), null),
});

export const Electrical = v.object({
  circuits: v.optional(v.array(v.object({ id, number: v.number(), dimmerId: v.optional(v.nullable(id), null), phase: v.optional(v.nullable(v.number()), null) })), []),
  dimmers: v.optional(v.array(v.object({ id, number: v.number(), maxW: v.optional(v.nullable(v.number()), null) })), []),
  phases: v.optional(v.array(v.object({ id, name: v.pipe(v.string(), v.maxLength(20)), breakerA: v.optional(v.nullable(v.number()), null) })), []),
});

export const Stage = v.object({
  shape: v.variant('kind', [
    v.object({ kind: v.literal('rect'), width: v.pipe(v.number(), v.minValue(1)), depth: v.pipe(v.number(), v.minValue(1)), prosceniumWidth: v.optional(v.nullable(v.number()), null) }),
    v.object({ kind: v.literal('polygon'), points: v.pipe(v.array(Point), v.minLength(3)), prosceniumWidth: v.optional(v.nullable(v.number()), null) }),
  ]),
  height: v.optional(mm, 0),
  /** Height of the proscenium opening above the deck, for the side section. */
  prosceniumHeight: v.optional(v.nullable(v.pipe(v.number(), v.minValue(0))), null),
  referenceLines: v.optional(v.object({ center: v.optional(v.boolean(), true), plaster: v.optional(v.boolean(), true), proscenium: v.optional(v.boolean(), true) }), {}),
  background: v.optional(
    v.nullable(v.object({ file: v.string(), x: mm, y: mm, scale: v.pipe(v.number(), v.minValue(0.000001)), opacity: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(1)), 0.4), locked: v.optional(v.boolean(), true) })),
    null,
  ),
});

export const Region = v.object({
  code: v.pipe(v.string(), v.maxLength(8)),
  voltage: v.pipe(v.number(), v.minValue(1), v.maxValue(1000)),
  plug: text(40),
});

export const Contact = v.object({ id, role: text(80), name: text(120), phone: text(60), email: text(120), hidden: v.optional(v.array(v.picklist(['role', 'name', 'phone', 'email'])), []) });
export const ScheduleItem = v.object({ id, time: text(10), what: text(200), kind: v.optional(v.picklist(['day', 'build']), 'day') });
export const TitleBlock = v.object({ production: text(120), author: text(120), venue: text(120), logo: v.optional(v.nullable(v.string()), null) });
export const WorkNote = v.object({ id, text: text(), done: v.optional(v.boolean(), false), refId: v.optional(v.nullable(id), null) });
export const ReportConfig = v.object({
  id,
  kind: v.pipe(v.string(), v.maxLength(40)),
  columns: v.optional(v.array(v.pipe(v.string(), v.maxLength(40))), []),
  landscape: v.optional(v.boolean(), false),
  scale: v.optional(v.nullable(v.number()), null),
  layerPreset: v.optional(v.array(id), []),
});
export const RevisionMeta = v.object({ number: v.pipe(v.number(), v.integer(), v.minValue(1)), date: v.string(), note: text(), changes: v.optional(v.array(v.pipe(v.string(), v.maxLength(300))), []) });
export const ViewSettings = v.object({ grid: v.optional(v.boolean(), true), gridMm: v.optional(v.pipe(v.number(), v.minValue(1)), 500), greyscale: v.optional(v.boolean(), false), links: v.optional(v.boolean(), true), labels: v.optional(v.boolean(), true), outlines: v.optional(v.boolean(), true), rp2Lights: v.optional(v.boolean(), false) });

export const SetlistItem = v.object({ id, title: v.pipe(v.string(), v.maxLength(160)), comment: text(200), seconds: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(86400)), 0) });

/** What the artist asks of the venue for the day: structured, not free-form (docs/investigacion.md, section on hospitality). */
export const Hospitality = v.object({
  dressingRooms: v.optional(v.nullable(v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(99))), null),
  dressingNotes: text(),
  meals: v.optional(v.nullable(v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(999))), null),
  dietary: text(),
  cateringNotes: text(),
  afterShowMeal: v.optional(v.boolean(), false),
  busStock: v.optional(v.boolean(), false),
  supplies: text(),
  transport: text(),
  lodging: text(),
  localTransport: text(),
  cashInstead: v.optional(v.boolean(), false),
  cashAmount: text(60),
});

/** The business terms that travel with the rider. Text fields: the app records them, it does not judge them. */
export const Contract = v.object({
  fee: text(120),
  deposit: text(120),
  payment: text(300),
  cancellation: text(500),
  insurance: text(300),
  setLengthMin: v.optional(v.nullable(v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(1440))), null),
  crew: text(300),
  other: text(),
});

/** Facts about the one event this show is for. Several dates are several shows (decided 2026-10-29). */
export const EventInfo = v.object({ venueAddress: text(300), parking: text(300), notes: text() });

export const DocSection = v.picklist(['cover', 'contacts', 'schedule', 'build', 'plan', 'inputs', 'outputs', 'computers', 'lights', 'rigging', 'magic', 'racks', 'cables', 'dmx', 'electrical', 'setlist', 'hospitality', 'contract', 'notes', 'revisions']);
export const DocumentConfig = v.object({
  template: v.optional(v.picklist(['concert', 'theatre', 'av', 'custom']), 'concert'),
  /** The sections of a custom document; the other templates have their own list. */
  sections: v.optional(v.array(DocSection), []),
  /** Print scale of the plan as 1:N, or null to fit the page. */
  planScale: v.optional(v.nullable(v.pipe(v.number(), v.minValue(1))), null),
  /** The legend of item symbols under the plan; absent counts as on. */
  planLegend: v.optional(v.boolean()),
  /** The channel list: horizontal pages, and how many blocks side by side (automatic fits it on one page). */
  inputs: v.optional(v.object({ landscape: v.optional(v.boolean(), false), blocks: v.optional(v.union([v.literal('auto'), v.literal(1), v.literal(2), v.literal(3), v.literal(4)]), 'auto') }), {}),
});

export const Show = v.object({
  formatVersion: v.literal(FORMAT_VERSION),
  name: v.pipe(v.string(), v.maxLength(120)),
  lang: Lang,
  units: v.optional(Units, 'metric'),
  paper: v.optional(Paper, 'A4'),
  modules: v.array(Module),
  date: v.optional(v.string(), ''),
  revision: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1)), 1),
  region: Region,
  desk: v.optional(v.object({ model: text(80), showFile: text(120) }), {}),
  stage: Stage,
  layers: v.array(Layer),
  customItems: v.optional(v.record(id, CustomItem), {}),
  elements: v.record(id, PlanElement),
  channels: v.optional(v.record(id, InputChannel), {}),
  outputs: v.optional(v.record(id, Output), {}),
  connections: v.optional(v.record(id, Connection), {}),
  mounts: v.optional(v.record(id, Mount), {}),
  electrical: v.optional(Electrical, {}),
  contacts: v.optional(v.array(Contact), []),
  schedule: v.optional(v.array(ScheduleItem), []),
  titleBlock: v.optional(TitleBlock, {}),
  workNotes: v.optional(v.array(WorkNote), []),
  /** The magic sheet's own arrangement: luminaire id to a position in millimetres; no entry means the plan position. */
  magicLayout: v.optional(v.record(id, Point), {}),
  /** Warnings the user chose to silence, by key (rule and thing). */
  muted: v.optional(v.array(v.pipe(v.string(), v.maxLength(120))), []),
  reports: v.optional(v.array(ReportConfig), []),
  revisions: v.optional(v.array(RevisionMeta), []),
  view: v.optional(ViewSettings, {}),
  document: v.optional(DocumentConfig, {}),
  setlist: v.optional(v.array(SetlistItem), []),
  hospitality: v.optional(Hospitality, {}),
  contract: v.optional(Contract, {}),
  event: v.optional(EventInfo, {}),
  /** Last number given per id prefix, so ids stay sequential and stable. */
  counters: v.optional(v.record(v.string(), v.number()), {}),
});

export type Show = v.InferOutput<typeof Show>;
export type DocumentConfig = v.InferOutput<typeof DocumentConfig>;
export type SetlistItem = v.InferOutput<typeof SetlistItem>;
export type Hospitality = v.InferOutput<typeof Hospitality>;
export type Contract = v.InferOutput<typeof Contract>;
export type EventInfo = v.InferOutput<typeof EventInfo>;
export type PlanElement = v.InferOutput<typeof PlanElement>;
export type CustomItem = v.InferOutput<typeof CustomItem>;
export type Layer = v.InferOutput<typeof Layer>;
export type InputChannel = v.InferOutput<typeof InputChannel>;
export type Output = v.InferOutput<typeof Output>;
export type Connection = v.InferOutput<typeof Connection>;
export type Mount = v.InferOutput<typeof Mount>;
export type Computer = v.InferOutput<typeof Computer>;
export type Luminaire = v.InferOutput<typeof Luminaire>;
export type SignalType = v.InferOutput<typeof SignalType>;
export type Module = v.InferOutput<typeof Module>;
export type RevisionMeta = v.InferOutput<typeof RevisionMeta>;
export type Rack = v.InferOutput<typeof Rack>;
export type RackSlot = v.InferOutput<typeof RackSlot>;
export type WorkNote = v.InferOutput<typeof WorkNote>;

export const parseShow = (raw: unknown): Show => v.parse(Show, raw);
export const safeParseShow = (raw: unknown) => v.safeParse(Show, raw);
