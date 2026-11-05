// Data model of a show (montaje). Everything is serializable; units are millimetres, kilograms and watts.
// Derived data is not stored: only manual adjustments on top of it (see docs/design/modelo-2026-10-29.md).
import * as v from 'valibot';

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
  color: text(40),
  /** A library fixture model id when the user picked one; weight and power then start from it. */
  modelId: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(80))), null),
  accessories: v.optional(v.array(v.pipe(v.string(), v.maxLength(80))), []),
  focus: v.optional(v.nullable(Point), null),
  notes: text(),
});

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
  layerId: id,
  label: text(120),
  groupId: v.optional(v.nullable(id), null),
  suppliedBy: v.optional(SuppliedBy, 'unset'),
  notes: text(),
  weightKg: v.optional(v.nullable(v.number()), null),
  powerW: v.optional(v.nullable(v.number()), null),
  computer: v.optional(v.nullable(Computer), null),
  luminaire: v.optional(v.nullable(Luminaire), null),
});

export const InputChannel = v.object({
  id,
  number: v.pipe(v.number(), v.integer(), v.minValue(1)),
  shortName: v.optional(v.pipe(v.string(), v.maxLength(16)), ''),
  mic: text(80),
  stand: text(80),
  phantom: v.optional(v.boolean(), false),
  insert: text(80),
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
    v.object({ kind: v.literal('polygon'), points: v.pipe(v.array(Point), v.minLength(3)) }),
  ]),
  height: v.optional(mm, 0),
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
export const ViewSettings = v.object({ grid: v.optional(v.boolean(), true), gridMm: v.optional(v.pipe(v.number(), v.minValue(1)), 500), greyscale: v.optional(v.boolean(), false) });

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
  reports: v.optional(v.array(ReportConfig), []),
  revisions: v.optional(v.array(RevisionMeta), []),
  view: v.optional(ViewSettings, {}),
  /** Last number given per id prefix, so ids stay sequential and stable. */
  counters: v.optional(v.record(v.string(), v.number()), {}),
});

export type Show = v.InferOutput<typeof Show>;
export type PlanElement = v.InferOutput<typeof PlanElement>;
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

export const parseShow = (raw: unknown): Show => v.parse(Show, raw);
export const safeParseShow = (raw: unknown) => v.safeParse(Show, raw);
