// The words of the printed document. They follow the show's document language, not the interface language.
import type { Lang } from '../i18n/index.ts';

export interface DocStrings {
  rider: string;
  date: string;
  revision: string;
  venue: string;
  production: string;
  author: string;
  page: string;
  of: string;
  contacts: string;
  schedule: string;
  plan: string;
  inputs: string;
  outputs: string;
  computers: string;
  lights: string;
  electrical: string;
  notes: string;
  revisions: string;
  role: string;
  name: string;
  phone: string;
  email: string;
  time: string;
  what: string;
  scaleLabel: string;
  channel: string;
  shortName: string;
  mic: string;
  stand: string;
  phantom: string;
  pair: string;
  source: string;
  yes: string;
  no: string;
  kind: string;
  stereo: string;
  aux: string;
  supplier: string;
  unset: string;
  band: string;
  venueSupplies: string;
  rental: string;
  os: string;
  functions: string;
  programs: string;
  license: string;
  dongle: string;
  outputsOf: string;
  unit: string;
  universe: string;
  address: string;
  element: string;
  model: string;
  mount: string;
  dimmer: string;
  circuit: string;
  color: string;
  weight: string;
  power: string;
  height: string;
  maxLoad: string;
  count: string;
  phase: string;
  amps: string;
  voltage: string;
  plug: string;
  total: string;
  note: string;
  legend: string;
  patch: string;
  position: string;
  positionLegend: string;
  none: string;
  magic: string;
  audience: string;
  rigging: string;
  desk: string;
  showFile: string;
  racks: string;
  task: string;
  done: string;
  ref: string;
  changes: string;
  kinds: Record<'wedge' | 'iem' | 'main' | 'send', string>;
  mountKinds: Record<'bar' | 'pipe' | 'truss' | 'boom' | 'floor', string>;
  fn: Record<'sound' | 'video' | 'lights' | 'network', string>;
  oses: Record<'windows' | 'macos' | 'linux' | 'other', string>;
  signals: Record<'audio' | 'video' | 'lightControl' | 'network', string>;
  stageFront: string;
  stageBack: string;
}

const es: DocStrings = {
  rider: 'Rider técnico', date: 'Fecha', revision: 'Revisión', venue: 'Sala', production: 'Producción', author: 'Autoría', page: 'Pág.', of: 'de',
  contacts: 'Contactos', schedule: 'Horario', plan: 'Plano del escenario', inputs: 'Lista de entradas', outputs: 'Lista de salidas', computers: 'Ordenadores y programas',
  lights: 'Instrumentos de luz', electrical: 'Eléctrica', notes: 'Notas', revisions: 'Revisiones',
  role: 'Función', name: 'Nombre', phone: 'Teléfono', email: 'Correo', time: 'Hora', what: 'Qué', scaleLabel: 'Escala',
  channel: 'Canal', shortName: 'Nombre', mic: 'Micro o DI', stand: 'Pie', phantom: '48 V', pair: 'Par', source: 'Fuente', yes: 'Sí', no: 'No',
  kind: 'Tipo', stereo: 'Estéreo', aux: 'Aux', supplier: 'Lo aporta', unset: 'Sin indicar', band: 'Banda', venueSupplies: 'Sala', rental: 'Alquiler',
  os: 'Sistema', functions: 'Funciones', programs: 'Programas', license: 'Licencia', dongle: 'Llave física', outputsOf: 'Salidas',
  unit: 'Unidad', universe: 'Univ.', address: 'Dir.', element: 'Instrumento', model: 'Modelo', mount: 'Montaje', dimmer: 'Dimmer', circuit: 'Circuito', color: 'Color', weight: 'Peso (kg)', power: 'Potencia (W)',
  height: 'Altura sobre la tarima (m)', maxLoad: 'Carga máx. (kg)', count: 'Recuento', phase: 'Fase', amps: 'Amperios', voltage: 'Tensión', plug: 'Enchufe', total: 'Total', note: 'Nota',
  legend: 'Leyenda', patch: 'Patch', position: 'Pos.', positionLegend: 'US fondo · DS proscenio (hacia el público) · C centro · SL izquierda del artista · SR derecha del artista', none: '—', magic: 'Magic sheet', audience: 'Público', rigging: 'Plan de varas', desk: 'Mesa', showFile: 'Show file', racks: 'Racks', task: 'Tarea', done: 'Hecha', ref: 'Elemento', changes: 'Cambios',
  kinds: { wedge: 'Cuña', iem: 'In-ear', main: 'Principal', send: 'Envío' },
  mountKinds: { bar: 'Vara', pipe: 'Tubo', truss: 'Truss', boom: 'Calle lateral', floor: 'Suelo' },
  fn: { sound: 'Sonido', video: 'Vídeo', lights: 'Luces', network: 'Red' },
  oses: { windows: 'Windows', macos: 'macOS', linux: 'Linux', other: 'Sin indicar' },
  signals: { audio: 'Audio', video: 'Vídeo', lightControl: 'Control de luces', network: 'Red' },
  stageFront: 'Público', stageBack: 'Fondo',
};

const en: DocStrings = {
  rider: 'Technical rider', date: 'Date', revision: 'Revision', venue: 'Venue', production: 'Production', author: 'Author', page: 'Page', of: 'of',
  contacts: 'Contacts', schedule: 'Schedule', plan: 'Stage plan', inputs: 'Input list', outputs: 'Output list', computers: 'Computers and software',
  lights: 'Lighting instruments', electrical: 'Electrical', notes: 'Notes', revisions: 'Revisions',
  role: 'Role', name: 'Name', phone: 'Phone', email: 'Email', time: 'Time', what: 'What', scaleLabel: 'Scale',
  channel: 'Ch.', shortName: 'Name', mic: 'Mic or DI', stand: 'Stand', phantom: '48 V', pair: 'Pair', source: 'Source', yes: 'Yes', no: 'No',
  kind: 'Type', stereo: 'Stereo', aux: 'Aux', supplier: 'Supplied by', unset: 'Not stated', band: 'Band', venueSupplies: 'Venue', rental: 'Rental',
  os: 'System', functions: 'Functions', programs: 'Programs', license: 'License', dongle: 'Physical key', outputsOf: 'Outputs',
  unit: 'Unit', universe: 'Univ.', address: 'Addr.', element: 'Instrument', model: 'Model', mount: 'Mount', dimmer: 'Dimmer', circuit: 'Circuit', color: 'Color', weight: 'Weight (kg)', power: 'Power (W)',
  height: 'Height above the stage (m)', maxLoad: 'Max load (kg)', count: 'Count', phase: 'Phase', amps: 'Amps', voltage: 'Voltage', plug: 'Plug', total: 'Total', note: 'Note',
  legend: 'Legend', patch: 'Patch', position: 'Pos.', positionLegend: 'US upstage · DS downstage (towards the audience) · C centre · SL stage left · SR stage right', none: '—', magic: 'Magic sheet', audience: 'Audience', rigging: 'Hanging plot', desk: 'Desk', showFile: 'Show file', racks: 'Racks', task: 'Task', done: 'Done', ref: 'Element', changes: 'Changes',
  kinds: { wedge: 'Wedge', iem: 'In-ear', main: 'Main', send: 'Send' },
  mountKinds: { bar: 'Bar', pipe: 'Pipe', truss: 'Truss', boom: 'Boom', floor: 'Floor' },
  fn: { sound: 'Sound', video: 'Video', lights: 'Lights', network: 'Network' },
  oses: { windows: 'Windows', macos: 'macOS', linux: 'Linux', other: 'Not stated' },
  signals: { audio: 'Audio', video: 'Video', lightControl: 'Light control', network: 'Network' },
  stageFront: 'Audience', stageBack: 'Back',
};

export const docStrings = (lang: Lang): DocStrings => (lang === 'en' ? en : es);

export interface ProdStrings {
  setlist: string;
  song: string;
  songTitle: string;
  comment: string;
  duration: string;
  total: string;
  build: string;
  daySheet: string;
  hospitality: string;
  contract: string;
  event: string;
  venueAddress: string;
  parking: string;
  dressingRooms: string;
  dressingNotes: string;
  meals: string;
  dietary: string;
  cateringNotes: string;
  afterShowMeal: string;
  busStock: string;
  supplies: string;
  transport: string;
  lodging: string;
  localTransport: string;
  cashInstead: string;
  cashAmount: string;
  fee: string;
  deposit: string;
  payment: string;
  cancellation: string;
  insurance: string;
  setLength: string;
  crew: string;
  other: string;
  minutes: string;
  yes: string;
  milestones: Record<'loadIn' | 'soundcheck' | 'meal' | 'doors' | 'opener' | 'changeover' | 'show' | 'loadOut' | 'curfew' | 'dressingEnd', string>;
}

const prodEs: ProdStrings = {
  setlist: 'Setlist', song: 'N.º', songTitle: 'Título', comment: 'Comentario', duration: 'Duración', total: 'Total', build: 'Programación de montaje', daySheet: 'Hoja de ruta', hospitality: 'Hospitalidad', contract: 'Contrato', event: 'El evento',
  venueAddress: 'Dirección de la sala', parking: 'Aparcamiento', dressingRooms: 'Camerinos', dressingNotes: 'Camerino: condiciones', meals: 'Comidas', dietary: 'Restricciones dietéticas', cateringNotes: 'Catering: notas', afterShowMeal: 'Comida tras el show', busStock: 'Bus stock',
  supplies: 'Suministros de camerino', transport: 'Transporte', lodging: 'Alojamiento', localTransport: 'Transporte local', cashInstead: 'Compensación en efectivo en lugar de suministros', cashAmount: 'Importe',
  fee: 'Caché', deposit: 'Anticipo', payment: 'Forma y plazo de pago', cancellation: 'Cancelación', insurance: 'Seguros', setLength: 'Duración del show', crew: 'Personal', other: 'Otras condiciones', minutes: 'min', yes: 'Sí',
  milestones: { loadIn: 'Carga', soundcheck: 'Prueba de sonido', meal: 'Comida', doors: 'Puertas', opener: 'Telonero', changeover: 'Cambio de escenario', show: 'Show', loadOut: 'Descarga', curfew: 'Toque de queda', dressingEnd: 'Fin de camerino' },
};

const prodEn: ProdStrings = {
  setlist: 'Setlist', song: 'No.', songTitle: 'Title', comment: 'Comment', duration: 'Length', total: 'Total', build: 'Build schedule', daySheet: 'Day sheet', hospitality: 'Hospitality', contract: 'Contract', event: 'The event',
  venueAddress: 'Venue address', parking: 'Parking', dressingRooms: 'Dressing rooms', dressingNotes: 'Dressing room: conditions', meals: 'Meals', dietary: 'Dietary restrictions', cateringNotes: 'Catering: notes', afterShowMeal: 'Meal after the show', busStock: 'Bus stock',
  supplies: 'Dressing room supplies', transport: 'Transport', lodging: 'Lodging', localTransport: 'Local transport', cashInstead: 'Cash in place of supplies', cashAmount: 'Amount',
  fee: 'Fee', deposit: 'Deposit', payment: 'Payment terms', cancellation: 'Cancellation', insurance: 'Insurance', setLength: 'Show length', crew: 'Crew', other: 'Other terms', minutes: 'min', yes: 'Yes',
  milestones: { loadIn: 'Load-in', soundcheck: 'Soundcheck', meal: 'Meal', doors: 'Doors', opener: 'Opener', changeover: 'Changeover', show: 'Show', loadOut: 'Load-out', curfew: 'Curfew', dressingEnd: 'End of dressing room' },
};

export const prodStrings = (lang: Lang): ProdStrings => (lang === 'en' ? prodEn : prodEs);
