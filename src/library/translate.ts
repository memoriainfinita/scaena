// The packages are written in Spanish; a show made from one in English gets the same words in English. Only what the
// packages and the library's suggested channels say is here: whatever the user types stays as typed.
import type { Lang } from '../i18n/index.ts';

const EN: Record<string, string> = {
  // Plan labels
  Batería: 'Drums', Bajo: 'Bass', Guitarra: 'Guitar', Teclado: 'Keys', Voz: 'Vocal', Cuña: 'Wedge', Mesa: 'Desk', Contrabajo: 'Double bass', Piano: 'Piano', Viento: 'Horn', Silla: 'Chair',
  'Segunda voz': 'Second vocal', 'Mesa de DJ': 'DJ booth', Portátil: 'Laptop', MC: 'MC', 'PA izquierda': 'PA left', 'PA derecha': 'PA right', 'Sub izquierdo': 'Sub left', 'Sub derecho': 'Sub right',
  Atril: 'Lectern', 'Mesa de ponentes': "Speakers' table", Diadema: 'Headset', Pantalla: 'Screen', Proyector: 'Projector', 'Portátil de presentación': 'Presentation laptop', Actor: 'Actor',
  'Pata izquierda': 'Left leg', 'Pata derecha': 'Right leg', 'Telón de fondo': 'Back curtain', 'Ordenador de sonido': 'Sound computer', Recorte: 'Ellipsoidal', Fresnel: 'Fresnel',
  'Mesa de vídeo': 'Video mixer', 'Ordenador de vídeo': 'Video computer', Micro: 'Mic', Stagebox: 'Stagebox', SB: 'SB', Reserva: 'Spare', Efectos: 'Effects', Ordenador: 'Computer',
  // The fuller examples: instruments with their amps, lights by where they hang, racks, video and network
  'Tarima de batería': 'Drum riser', 'Ampli de bajo': 'Bass amp', 'Ampli guitarra': 'Guitar amp', 'DI bajo': 'Bass DI', 'DI teclado': 'Keys DI', 'DI contrabajo': 'Double bass DI', 'DI guitarra': 'Guitar DI',
  Wash: 'Wash', Suelo: 'Floor', Distribución: 'Power distro', 'Toma 16 A derecha': 'Outlet 16 A right', 'Toma 16 A izquierda': 'Outlet 16 A left', Público: 'Audience', Hazer: 'Hazer', Móvil: 'Mover',
  'Pantalla LED': 'LED wall', 'Portátil de visuales': 'Visuals laptop', Cámara: 'Camera', 'Rack inalámbrico': 'Wireless rack', 'Recorte FOH': 'Ellipsoidal FOH', 'Recorte vara 2': 'Ellipsoidal bar 2',
  Ciclorama: 'Cyc', PC: 'PC', 'Servidor de vídeo': 'Video server', 'Conmutador de red': 'Network switch', 'Control de luces': 'Lighting control', Emisión: 'Streaming',
  // The full example
  Switch: 'Switch', Baúl: 'Flight case', 'Boca útil': 'Clear opening', Butacas: 'Seats', Cabina: 'Booth', Camerino: 'Dressing room', Frontal: 'Front fill', 'Mesa de monitores': 'Monitor console', 'Mesa de producción': 'Production table', 'Muelle de carga': 'Loading dock', 'Nodo Art-Net': 'Art-Net node', 'Petacas IEM': 'IEM packs', 'Rack de escenario': 'Stage rack', 'Splitter DMX': 'DMX splitter',
  // Channel names (drums and others)
  'OH I': 'OH L', 'OH D': 'OH R', Tom: 'Tom', 'DJ L': 'DJ L', 'DJ R': 'DJ R', 'Salida de mesa DJ': 'DJ desk output', 'Micro de mesa': 'Table mic', 'Salida del portátil': 'Laptop output',
  Bombo: 'Kick', Caja: 'Snare', Charles: 'Hi-hat', 'Tom suelo': 'Floor tom', 'Bajo DI': 'Bass DI', 'Bajo ampli': 'Bass amp', 'Teclado L': 'Keys L', 'Teclado R': 'Keys R', 'Piano L': 'Piano L', 'Piano R': 'Piano R',
  'Contrabajo DI': 'Double bass DI', 'Contrabajo micro': 'Double bass mic', 'Guitarra DI': 'Guitar DI', 'Guitarra micro': 'Guitar mic', 'Portátil L': 'Laptop L', 'Portátil R': 'Laptop R',
  'Efectos L': 'Effects L', 'Efectos R': 'Effects R', 'Ordenador L': 'Computer L', 'Ordenador R': 'Computer R',
  // Stands, microphones that are text, and what programs are for
  'Pie corto': 'Short stand', Pinza: 'Clamp', 'Pie recto': 'Straight stand', 'Pie largo': 'Boom stand', 'Cuello de cisne': 'Gooseneck', 'Salida del ordenador': 'Computer output',
  Multipar: 'Multicore', Inalámbrico: 'Wireless', 'Mesa de luces': 'Lighting desk', 'Rack de dimmers': 'Dimmer rack', Reproducción: 'Playback', Diapositivas: 'Slides', 'Efectos y música': 'Effects and music', 'Vídeo en directo': 'Live video',
};

/** `Voz 2` becomes `Vocal 2`: the base is translated and a trailing number stays. */
export function translatePackageText(text: string, lang: Lang): string {
  if (lang !== 'en' || !text) return text;
  const direct = EN[text];
  if (direct) return direct;
  const m = /^(.*\S) (\d+)$/.exec(text);
  if (m && EN[m[1]!]) return `${EN[m[1]!]} ${m[2]}`;
  return text;
}

/** Every Spanish phrase the dictionary knows, for the test that checks the packages are covered. */
export const translatableTexts = (): string[] => Object.keys(EN);
