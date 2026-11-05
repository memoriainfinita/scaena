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
  none: string;
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
  unit: 'Unidad', element: 'Instrumento', model: 'Modelo', mount: 'Montaje', dimmer: 'Dimmer', circuit: 'Circuito', color: 'Color', weight: 'Peso (kg)', power: 'Potencia (W)',
  height: 'Altura (m)', maxLoad: 'Carga máx. (kg)', count: 'Recuento', phase: 'Fase', amps: 'Amperios', voltage: 'Tensión', plug: 'Enchufe', total: 'Total', note: 'Nota',
  legend: 'Leyenda', none: '—', ref: 'Elemento', changes: 'Cambios',
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
  unit: 'Unit', element: 'Instrument', model: 'Model', mount: 'Mount', dimmer: 'Dimmer', circuit: 'Circuit', color: 'Color', weight: 'Weight (kg)', power: 'Power (W)',
  height: 'Height (m)', maxLoad: 'Max load (kg)', count: 'Count', phase: 'Phase', amps: 'Amps', voltage: 'Voltage', plug: 'Plug', total: 'Total', note: 'Note',
  legend: 'Legend', none: '—', ref: 'Element', changes: 'Changes',
  kinds: { wedge: 'Wedge', iem: 'In-ear', main: 'Main', send: 'Send' },
  mountKinds: { bar: 'Bar', pipe: 'Pipe', truss: 'Truss', boom: 'Boom', floor: 'Floor' },
  fn: { sound: 'Sound', video: 'Video', lights: 'Lights', network: 'Network' },
  oses: { windows: 'Windows', macos: 'macOS', linux: 'Linux', other: 'Not stated' },
  signals: { audio: 'Audio', video: 'Video', lightControl: 'Light control', network: 'Network' },
  stageFront: 'Audience', stageBack: 'Back',
};

export const docStrings = (lang: Lang): DocStrings => (lang === 'en' ? en : es);
