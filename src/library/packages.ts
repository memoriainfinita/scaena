// The example shows. They are meant to be read as much as to be started from: between them they use everything
// the app does (instruments with their amps and mics, stageboxes and desks, racks, wedges, lights on bars,
// trusses, booms and the floor, circuits, dimmers and phases, computers, video, the day's schedule, set lists,
// hospitality, contacts and notes), each with what that kind of show really has. Stage coordinates are in
// millimetres: x from the left, y from the back wall (0) to the front edge; the default stage is 8000 by 5000.
// Every cable is drawn between the two elements it joins, so the plan can show or hide the lines.
import { setUniverseInfo } from '../model/dmx.ts';
import { showcase } from './package-showcase.ts';
import { addContacts, PERSON, addNotes, addSchedule, addSetlist, BAND, bi, build, mount, setElectrical, VENUE } from './packages-data.ts';
import type { ShowPackage } from './types.ts';

/** What each wedge of the rock example asks for, by position in its channel list: 0 kick, 1 snare, 10 and 11 guitars, 12 and 13 keys, 14 to 16 vocals. */
const WEDGE_MIXES: { who: string; mix: Record<number, 'low' | 'normal' | 'high'> }[] = [
  { who: 'Voz 1', mix: { 14: 'high', 10: 'normal', 12: 'low', 13: 'low' } },
  { who: 'Voz 2', mix: { 15: 'high', 14: 'normal', 12: 'normal', 13: 'normal' } },
  { who: 'Voz 3', mix: { 16: 'high', 14: 'normal', 11: 'low' } },
  { who: 'Guitarra 1', mix: { 10: 'high', 14: 'normal', 0: 'low', 1: 'low' } },
];

// ---------------------------------------------------------------------------------------------------------------

const rock = (): ShowPackage => {
  const b = build();
  const { el, ch, link } = b;
  el('furniture.riser', 4000, 1300, 'Tarima de batería', { ...VENUE, size: { w: 2600, d: 2000, height: 300 } });
  const drums = el('kit.drums5', 4000, 1300, 'Batería', BAND);
  const ampBass = el('amp.bass', 1300, 1400, 'Ampli de bajo', BAND);
  const ampG1 = el('amp.guitar', 6700, 1400, 'Ampli guitarra 1', BAND);
  const ampG2 = el('amp.guitar', 5400, 1400, 'Ampli guitarra 2', BAND);
  const keys = el('keys.keyboard', 6200, 3000, 'Teclado', BAND);
  const bass = el('guitar.bass', 1300, 2800, 'Bajo', BAND);
  const g1 = el('guitar.electric', 6700, 2400, 'Guitarra 1', BAND);
  const g2 = el('guitar.electric', 5400, 2400, 'Guitarra 2', BAND);
  const diBass = el('rack.di', 1900, 2000, 'DI bajo', BAND);
  const diKeys = el('rack.di-stereo', 4900, 3100, 'DI teclado', BAND);
  const v1 = el('vocals.mic-stand', 2700, 3700, 'Voz 1');
  const v2 = el('vocals.mic-stand', 4000, 3900, 'Voz 2');
  const v3 = el('vocals.mic-stand', 5300, 3700, 'Voz 3');
  const wedges = [2500, 3500, 4500, 5500].map((x, i) => el('monitor.wedge', x, 4600, `Cuña ${i + 1}`, VENUE));
  const sb = el('rack.stagebox', 7500, 700, 'SB', { ...VENUE, rack: { units: 6, slots: [[bi('Stagebox Midas DL16', 'Midas DL16 stagebox'), 2], [bi('Splitter de monitores', 'Monitor splitter'), 1], [bi('Regleta de corriente', 'Power strip'), 1]] } });
  const desk = el('desk.digital', 4000, 7600, 'Mesa', VENUE);
  const paL = el('pa.line', 500, 3800, 'PA izquierda', VENUE);
  const paR = el('pa.line', 7500, 3800, 'PA derecha', VENUE);
  const ld = el('control.lightdesk', 5600, 7600, 'Mesa de luces', VENUE);
  // Lights: four LED pars on the rear truss, two on the floor at each side.
  const par = (x: number, y: number, label: string, n: number, mountIx: number, addr: number) =>
    el('light.led-par', x, y, label, { light: { modelId: 'ofl.chauvet-dj.slim-par-64', channel: n, circuit: n, mount: mountIx, universe: 1, address: addr, dmxMode: '7ch' } });
  const truss = [1500, 3000, 5000, 6500].map((x, i) => par(x, 400, `Wash ${i + 1}`, i + 1, 0, 1 + i * 7));
  const floorL = [2300, 2900].map((y, i) => par(350, y, `Suelo ${i + 1}`, 5 + i, 1, 29 + i * 7));
  const floorR = [2300, 2900].map((y, i) => par(7650, y, `Suelo ${i + 3}`, 7 + i, 2, 43 + i * 7));
  el('power.distro', 6800, 4500, 'Distribución', VENUE);
  el('power.outlet', 7700, 4400, 'Toma 16 A derecha', VENUE);
  el('power.outlet', 300, 4400, 'Toma 16 A izquierda', VENUE);
  el('note.text', 4000, 5300, 'Público');

  // The signal path: instrument, then amp or DI, then the stagebox, then the desk and out to the PA and the wedges.
  link(bass, diBass, 'audio', 'Jack');
  link(diBass, ampBass, 'audio', 'Jack');
  link(diBass, sb, 'audio', 'XLR', 9);
  link(ampBass, sb, 'audio', 'XLR', 10);
  link(g1, ampG1, 'audio', 'Jack');
  link(g2, ampG2, 'audio', 'Jack');
  link(ampG1, sb, 'audio', 'XLR', 11);
  link(ampG2, sb, 'audio', 'XLR', 12);
  link(keys, diKeys, 'audio', 'Jack');
  link(diKeys, sb, 'audio', 'XLR', 13, 2);
  link(drums, sb, 'audio', 'XLR', 1, 8);
  [v1, v2, v3].forEach((v, i) => link(v, sb, 'audio', 'XLR', 15 + i));
  link(sb, desk, 'audio', 'Cat6');
  for (const w of wedges) link(desk, w, 'audio', 'XLR');
  link(desk, paL, 'audio', 'XLR');
  link(desk, paR, 'audio', 'XLR');
  // DMX runs as one daisy chain: desk, the rear truss left to right, then the floor units.
  const chain = [ld, ...truss, ...floorR.slice().reverse(), ...floorL];
  for (let i = 1; i < chain.length; i++) link(chain[i - 1]!, chain[i]!, 'lightControl', 'DMX');

  ch('Bombo', 'shure.beta52a', 'Pie corto', false, drums);
  ch('Caja', 'shure.sm57', 'Pinza', false, drums);
  ch('Charles', 'shure.sm81', 'Pie recto', true, drums);
  ch('Tom 1', 'sennheiser.e604', 'Pinza', false, drums);
  ch('Tom 2', 'sennheiser.e604', 'Pinza', false, drums);
  ch('Tom suelo', 'sennheiser.e604', 'Pinza', false, drums);
  ch('OH I', 'akg.c414xlii', 'Pie largo', true, drums);
  ch('OH D', 'akg.c414xlii', 'Pie largo', true, drums);
  ch('Bajo DI', 'radial.jdi', '', false, diBass);
  ch('Bajo ampli', 'shure.sm57', 'Pie corto', false, ampBass);
  ch('Guitarra 1', 'shure.sm57', 'Pie corto', false, ampG1);
  ch('Guitarra 2', 'shure.sm57', 'Pie corto', false, ampG2);
  ch('Teclado L', 'radial.jdi', '', false, keys);
  ch('Teclado R', 'radial.jdi', '', false, keys);
  ch('Voz 1', 'shure.sm58', 'Pie recto', false, v1);
  ch('Voz 2', 'shure.sm58', 'Pie recto', false, v2);
  ch('Voz 3', 'shure.sm58', 'Pie recto', false, v3);

  return {
    id: 'rock',
    name: bi('Banda de rock', 'Rock band'),
    description: bi('Batería, bajo, dos guitarras, teclado y tres voces: cada instrumento con su ampli o su DI, stagebox, cuatro cuñas, luces en truss y en suelo, producción y eléctrica.', 'Drums, bass, two guitars, keyboard and three vocals: each instrument with its amp or DI, stagebox, four wedges, lights on a truss and the floor, production and electrical.'),
    modules: ['audio', 'lights', 'power', 'production', 'document'],
    elements: b.elements,
    channels: b.channels,
    outputs: [...wedges.map((element, i) => ({ kind: 'wedge' as const, element, ...WEDGE_MIXES[i]! })), { kind: 'main' as const, element: paL, who: bi('Público', 'Audience') }, { kind: 'main' as const, element: paR, who: bi('Público', 'Audience') }],
    links: b.links,
    mounts: [mount('truss', 'Truss trasero', 'Rear truss', [1000, 400], [7000, 400], 5000, 300), mount('floor', 'Suelo izquierda', 'Floor left', [350, 2200], [350, 3000], 0), mount('floor', 'Suelo derecha', 'Floor right', [7650, 2200], [7650, 3000], 0)],
    desk: 'behringer.x32',
    finish: (show, placed, tx) => {
      show = { ...show, titleBlock: { ...show.titleBlock, production: tx(bi('Banda de ejemplo, gira de otoño', 'Example band, autumn tour')), venue: tx(bi('Sala de ejemplo', 'Example club')) } };
      show = addContacts(show, tx, [
        [bi('Jefe de producción', 'Production manager'), ...PERSON],
        [bi('Técnico de sonido', 'Sound engineer'), ...PERSON],
        [bi('Técnico de luces', 'Lighting technician'), ...PERSON],
        [bi('Jefe de sala', 'House manager'), ...PERSON],
      ]);
      show = addSchedule(show, tx, [
        ['build', '15:00', bi('Carga', 'Load-in')],
        ['build', '16:00', bi('Montaje de escenario y luces', 'Stage and lights build')],
        ['day', '18:00', bi('Prueba de sonido', 'Soundcheck')],
        ['day', '19:30', bi('Cena', 'Dinner')],
        ['day', '21:00', bi('Puertas', 'Doors')],
        ['day', '22:00', bi('Concierto', 'Show')],
        ['day', '23:30', bi('Desmontaje', 'Load-out')],
        ['day', '01:00', bi('Toque de queda', 'Curfew')],
      ]);
      show = addSetlist(show, tx, [
        [bi('Apertura', 'Opener'), 240, bi('Intro con pista', 'Intro with backing track')],
        [bi('Tema 2', 'Song 2'), 215],
        [bi('Tema 3', 'Song 3'), 260, bi('Cambio de guitarra', 'Guitar change')],
        [bi('Tema 4', 'Song 4'), 205],
        [bi('Balada', 'Ballad'), 290, bi('Solo de teclado', 'Keys solo')],
        [bi('Cierre', 'Closer'), 330],
      ]);
      show = {
        ...show,
        hospitality: { ...show.hospitality, dressingRooms: 1, meals: 7, dietary: tx(bi('1 vegetariano, 1 sin gluten', '1 vegetarian, 1 gluten free')), afterShowMeal: true, supplies: tx(bi('Agua, toallas y fruta', 'Water, towels and fruit')), transport: tx(bi('Furgoneta de la banda', 'Band van')) },
        contract: { ...show.contract, setLengthMin: 90, crew: tx(bi('1 técnico de sonido, 1 de luces y 1 de backline', '1 sound, 1 lighting and 1 backline technician')), other: tx(bi('Mesa y PA de la sala', 'House desk and PA')) },
        event: { ...show.event, venueAddress: tx(bi('Calle de la Sala 1, 00000 Ciudad (ejemplo)', '1 Club Street, 00000 City (example)')), parking: tx(bi('Furgoneta junto al acceso de carga', 'Van next to the loading door')) },
      };
      show = setElectrical(show, { breakers: [16, 16, 16], circuits: [[1, 1], [2, 1], [3, 1], [4, 1], [5, 2], [6, 2], [7, 3], [8, 3]] });
      show = setUniverseInfo(show, 1, { output: tx(bi('Salida A de la mesa de luces', 'Lighting desk output A')) });
      return addNotes(show, placed, tx, [[bi('Confirmar con la sala las dos tomas de 16 A', 'Confirm the two 16 A outlets with the venue')], [bi('Colocar el ampli del bajo sobre su caja', 'Put the bass amp on its stand'), ampBass]]);
    },
  };
};

// ---------------------------------------------------------------------------------------------------------------

const jazz = (): ShowPackage => {
  const b = build();
  const { el, ch, link } = b;
  const drums = el('kit.drums-small', 4000, 1300, 'Batería', BAND);
  const bassist = el('strings.doublebass', 2200, 2000, 'Contrabajo', BAND);
  const diBass = el('rack.di', 3000, 1500, 'DI contrabajo', BAND);
  const piano = el('keys.piano', 6300, 2200, 'Piano', VENUE);
  const amp = el('amp.guitar', 1300, 1000, 'Ampli guitarra', BAND);
  const guitar = el('guitar.electric', 1300, 2300, 'Guitarra', BAND);
  const w1 = el('winds.player', 3300, 3300, 'Viento 1', BAND);
  const w2 = el('winds.player', 4700, 3300, 'Viento 2', BAND);
  const voice = el('vocals.mic-stand', 4000, 3900, 'Voz');
  const wedges = [3300, 4700].map((x, i) => el('monitor.wedge', x, 4600, `Cuña ${i + 1}`, VENUE));
  const sb = el('rack.stagebox', 7400, 600, 'Stagebox', VENUE);
  const desk = el('desk.digital', 4000, 7600, 'Mesa', VENUE);
  const paL = el('pa.line', 500, 3800, 'PA izquierda', VENUE);
  const paR = el('pa.line', 7500, 3800, 'PA derecha', VENUE);
  const ld = el('control.lightdesk', 5600, 7600, 'Mesa de luces', VENUE);
  const dimmer = el('rack.dimmer', 7400, 1500, 'Rack de dimmers', VENUE);
  const washes = [1500, 3000, 5000, 6500].map((x, i) => el('light.led-par', x, 400, `Wash ${i + 1}`, { light: { modelId: 'ofl.chauvet-dj.slim-par-64', channel: i + 1, circuit: i + 1, mount: 0, universe: 1, address: 1 + i * 7, dmxMode: '7ch' } }));
  [3000, 5000].forEach((x, i) => el('light.ellipsoidal', x, 6200, `Recorte ${i + 1}`, { light: { modelId: 'etc.s4-26', channel: 5 + i, circuit: 5 + i, dimmer: 1 + i, mount: 1, color: 'R02', universe: 1, address: 29 + i, dmxSlots: 1 } }));

  // DMX: the desk, then the rear truss, then the dimmers of the front of house.
  [ld, ...washes, dimmer].forEach((e, i, all) => { if (i > 0) link(all[i - 1]!, e, 'lightControl', 'DMX'); });

  link(bassist, diBass, 'audio', 'Jack');
  link(diBass, sb, 'audio', 'XLR');
  link(bassist, sb, 'audio', 'XLR');
  link(guitar, amp, 'audio', 'Jack');
  link(amp, sb, 'audio', 'XLR');
  link(drums, sb, 'audio', 'XLR');
  link(piano, sb, 'audio', 'XLR');
  for (const x of [w1, w2, voice]) link(x, sb, 'audio', 'XLR');
  link(sb, desk, 'audio', 'Cat6');
  for (const w of wedges) link(desk, w, 'audio', 'XLR');
  link(desk, paL, 'audio', 'XLR');
  link(desk, paR, 'audio', 'XLR');

  ch('Bombo', 'shure.beta52a', 'Pie corto', false, drums, 'SB 1');
  ch('Caja', 'shure.sm57', 'Pinza', false, drums, 'SB 2');
  ch('OH I', 'akg.c414xlii', 'Pie largo', true, drums, 'SB 3');
  ch('OH D', 'akg.c414xlii', 'Pie largo', true, drums, 'SB 4');
  ch('Contrabajo DI', 'radial.jdi', '', false, diBass, 'SB 5');
  ch('Contrabajo micro', 'shure.sm57', 'Pie corto', false, bassist, 'SB 6');
  ch('Piano L', 'akg.c414xlii', 'Pie largo', true, piano, 'SB 7');
  ch('Piano R', 'akg.c414xlii', 'Pie largo', true, piano, 'SB 8');
  ch('Guitarra', 'shure.sm57', 'Pie corto', false, amp, 'SB 9');
  ch('Viento 1', 'sennheiser.e906', 'Pie recto', false, w1, 'SB 10');
  ch('Viento 2', 'sennheiser.e906', 'Pie recto', false, w2, 'SB 11');
  ch('Voz', 'shure.sm58', 'Pie recto', false, voice, 'SB 12');

  return {
    id: 'jazz',
    name: bi('Jazz', 'Jazz'),
    description: bi('Combo acústico: batería reducida, contrabajo con DI y micro, piano de la sala, guitarra con ampli, dos vientos y voz; luces cálidas, repertorio y hospitalidad.', 'Acoustic combo: small kit, double bass with DI and mic, house piano, guitar with amp, two winds and vocals; warm lights, set list and hospitality.'),
    modules: ['audio', 'lights', 'production', 'document'],
    elements: b.elements,
    channels: b.channels,
    outputs: [
      { kind: 'wedge' as const, element: wedges[0]!, who: 'Viento 1', mix: { 9: 'high', 11: 'normal', 6: 'low', 7: 'low' } },
      { kind: 'wedge' as const, element: wedges[1]!, who: 'Viento 2', mix: { 10: 'high', 11: 'normal', 4: 'low' } },
      { kind: 'main' as const, element: paL, who: bi('Público', 'Audience') },
      { kind: 'main' as const, element: paR, who: bi('Público', 'Audience') },
    ],
    links: b.links,
    mounts: [mount('truss', 'Truss trasero', 'Rear truss', [1000, 400], [7000, 400], 4500, 200), mount('pipe', 'Frente de sala', 'Front of house', [2000, 6200], [6000, 6200], 4500, 100)],
    finish: (show, placed, tx) => {
      show = addContacts(show, tx, [
        [bi('Líder del grupo', 'Band leader'), ...PERSON],
        [bi('Programador de la sala', 'Venue booker'), ...PERSON],
      ]);
      show = addSchedule(show, tx, [
        ['day', '18:30', bi('Montaje y prueba de sonido', 'Setup and soundcheck')],
        ['day', '20:00', bi('Cena', 'Dinner')],
        ['day', '21:30', bi('Primer pase', 'First set')],
        ['day', '23:00', bi('Segundo pase', 'Second set')],
      ]);
      show = addSetlist(show, tx, [['Autumn Leaves', 360], ['Blue in Green', 330], ['All Blues', 420, bi('Solo de contrabajo', 'Bass solo')], ['Take Five', 300]]);
      show = {
        ...show,
        hospitality: { ...show.hospitality, dressingRooms: 1, meals: 6, supplies: tx(bi('Agua y café', 'Water and coffee')) },
        contract: { ...show.contract, setLengthMin: 60, other: tx(bi('Dos pases de una hora; piano afinado por la sala', 'Two one-hour sets; piano tuned by the venue')) },
      };
      show = setElectrical(show, { breakers: [16, 16], circuits: [[1, 1], [2, 1], [3, 2], [4, 2], [5, 1], [6, 2]], dimmers: [[1, 2300], [2, 2300]] });
      show = setUniverseInfo(show, 1, { output: tx(bi('Salida A de la mesa de luces', 'Lighting desk output A')) });
      return addNotes(show, placed, tx, [[bi('Pedir a la sala el piano afinado antes de la prueba', 'Ask the venue for the piano tuned before soundcheck'), piano]]);
    },
  };
};

// ---------------------------------------------------------------------------------------------------------------

const singer = (): ShowPackage => {
  const b = build();
  const { el, ch, link } = b;
  const voice = el('vocals.mic-stand', 3600, 3400, 'Voz');
  const guitar = el('strings.guitar-acoustic', 3000, 2700, 'Guitarra', BAND);
  el('furniture.chair', 3600, 2700, 'Silla');
  const di = el('rack.di', 2400, 2700, 'DI guitarra', BAND);
  const second = el('vocals.mic-stand', 4600, 3400, 'Segunda voz');
  const wedge = el('monitor.wedge', 4000, 4600, 'Cuña', VENUE);
  const desk = el('desk.analog', 4000, 7600, 'Mesa', VENUE);
  const paL = el('pa.line', 500, 3800, 'PA izquierda', VENUE);
  const paR = el('pa.line', 7500, 3800, 'PA derecha', VENUE);

  link(guitar, di, 'audio', 'Jack');
  link(di, desk, 'audio', 'XLR');
  link(voice, desk, 'audio', 'XLR');
  link(second, desk, 'audio', 'XLR');
  link(desk, wedge, 'audio', 'XLR');
  link(desk, paL, 'audio', 'XLR');
  link(desk, paR, 'audio', 'XLR');

  ch('Voz', 'shure.sm58', 'Pie recto', false, voice, '1');
  ch('Guitarra DI', 'radial.jdi', '', false, di, '2');
  ch('Guitarra micro', 'shure.sm81', 'Pie recto', true, guitar, '3');
  ch('Segunda voz', 'shure.sm58', 'Pie recto', false, second, '4');

  return {
    id: 'singer',
    name: bi('Cantautor o dúo acústico', 'Singer-songwriter or acoustic duo'),
    description: bi('Voz, guitarra acústica con DI y micro, segunda voz y una cuña, directo a una mesa analógica: lo mínimo, con su repertorio.', 'Vocal, acoustic guitar with DI and mic, second vocal and one wedge, straight into an analogue desk: the minimum, with its set list.'),
    modules: ['audio', 'production', 'document'],
    elements: b.elements,
    channels: b.channels,
    outputs: [{ kind: 'wedge', element: wedge, who: bi('Voz y guitarra', 'Vocal and guitar'), mix: { 0: 'high', 1: 'normal', 3: 'normal' } }, { kind: 'main', element: paL, who: bi('Público', 'Audience') }, { kind: 'main', element: paR, who: bi('Público', 'Audience') }],
    links: b.links,
    finish: (show, placed, tx) => {
      show = addContacts(show, tx, [[bi('Artista', 'Artist'), ...PERSON]]);
      show = addSchedule(show, tx, [['day', '19:00', bi('Montaje y prueba de sonido', 'Setup and soundcheck')], ['day', '21:00', bi('Concierto', 'Show')]]);
      show = addSetlist(show, tx, [[bi('Canción 1', 'Song 1'), 200], [bi('Canción 2', 'Song 2'), 230, bi('Con segunda voz', 'With second vocal')], [bi('Canción 3', 'Song 3'), 250]]);
      show = { ...show, hospitality: { ...show.hospitality, meals: 2, supplies: tx(bi('Agua', 'Water')) } };
      return addNotes(show, placed, tx, [[bi('Llevar un cable de jack de repuesto', 'Bring a spare jack cable'), guitar]]);
    },
  };
};

// ---------------------------------------------------------------------------------------------------------------

const dj = (): ShowPackage => {
  const b = build();
  const { el, ch, link } = b;
  const booth = el('dj.booth', 4000, 2200, 'Mesa de DJ', BAND);
  const laptop = el('control.laptop', 4000, 1100, 'Portátil', { ...BAND, computer: { functions: ['sound'], os: 'macos', programs: [{ name: 'Rekordbox', use: 'Reproducción' }] } });
  const mc = el('vocals.mic-stand', 5400, 3100, 'MC');
  const paL = el('pa.line', 500, 3800, 'PA izquierda', VENUE);
  const paR = el('pa.line', 7500, 3800, 'PA derecha', VENUE);
  const subL = el('pa.sub', 1900, 3800, 'Sub izquierdo', VENUE);
  const subR = el('pa.sub', 6100, 3800, 'Sub derecho', VENUE);
  const wall = el('video.led-wall', 4000, 250, 'Pantalla LED', { ...VENUE, size: { w: 5000, d: 200 } });
  const visuals = el('control.laptop', 6700, 1100, 'Portátil de visuales', { ...BAND, computer: { functions: ['video', 'lights'], os: 'macos', programs: [{ name: 'Resolume', use: 'Vídeo en directo' }, { name: 'MadMapper', use: 'Control de luces' }] } });
  const haze = el('effect.haze', 700, 900, 'Hazer', VENUE);
  const movers = [1500, 3000, 5000, 6500].map((x, i) => el('light.moving-spot', x, 1800, `Móvil ${i + 1}`, { light: { modelId: 'ofl.chauvet-dj.intimidator-spot-160', channel: 1 + i, circuit: 1 + i, mount: 0, universe: 1, address: 1 + i * 16 } }));
  const ledL = el('light.led-par', 1400, 2800, 'Suelo 1', { light: { modelId: 'ofl.chauvet-dj.slim-par-64', channel: 5, circuit: 5, mount: 1, universe: 1, address: 65, dmxMode: '7ch' } });
  const ledR = el('light.led-par', 6600, 2800, 'Suelo 2', { light: { modelId: 'ofl.chauvet-dj.slim-par-64', channel: 6, circuit: 6, mount: 2, universe: 1, address: 72, dmxMode: '7ch' } });

  link(laptop, booth, 'audio', 'USB');
  link(mc, booth, 'audio', 'XLR');
  link(booth, paL, 'audio', 'XLR');
  link(booth, paR, 'audio', 'XLR');
  link(paL, subL, 'audio', 'Speakon');
  link(paR, subR, 'audio', 'Speakon');
  link(visuals, wall, 'video', 'HDMI');
  link(visuals, movers[0]!, 'lightControl', 'DMX');
  link(visuals, haze, 'lightControl', 'DMX');
  link(visuals, ledL, 'lightControl', 'DMX');
  link(visuals, ledR, 'lightControl', 'DMX');

  ch('DJ L', 'Salida de mesa DJ', '', false, booth, '1');
  ch('DJ R', 'Salida de mesa DJ', '', false, booth, '2');
  ch('MC', 'shure.sm58', 'Pie recto', false, mc, '3');

  return {
    id: 'dj',
    name: bi('DJ', 'DJ'),
    description: bi('Mesa de DJ con portátil, micro de MC, PA con subs, pantalla LED con su ordenador de visuales, hazer y luces móviles en truss con LED en el suelo, todo con DMX.', 'DJ booth with a laptop, MC mic, PA with subs, an LED wall with its visuals computer, a hazer and moving lights on a truss with LED lights on the floor, all on DMX.'),
    modules: ['audio', 'lights', 'computers', 'video', 'power', 'production', 'document'],
    elements: b.elements,
    channels: b.channels,
    outputs: [{ kind: 'main', element: paL, who: bi('Público', 'Audience') }, { kind: 'main', element: paR, who: bi('Público', 'Audience') }, { kind: 'send', element: subL, who: bi('Subgrave', 'Subs') }, { kind: 'send', element: subR, who: bi('Subgrave', 'Subs') }],
    links: b.links,
    mounts: [mount('truss', 'Truss', 'Truss', [1000, 1800], [7000, 1800], 4500, 400), mount('floor', 'Suelo izquierda', 'Floor left', [1400, 2700], [1400, 2900], 0), mount('floor', 'Suelo derecha', 'Floor right', [6600, 2700], [6600, 2900], 0)],
    finish: (show, placed, tx) => {
      show = addContacts(show, tx, [
        [bi('DJ', 'DJ'), ...PERSON],
        [bi('Técnico de la sala', 'Venue technician'), ...PERSON],
      ]);
      show = addSchedule(show, tx, [
        ['build', '18:00', bi('Carga y montaje del truss', 'Load-in and truss build')],
        ['day', '20:00', bi('Prueba de sonido y visuales', 'Soundcheck and visuals check')],
        ['day', '22:00', bi('Puertas', 'Doors')],
        ['day', '00:00', bi('Sesión', 'Set')],
        ['day', '03:00', bi('Toque de queda', 'Curfew')],
      ]);
      show = {
        ...show,
        hospitality: { ...show.hospitality, dressingRooms: 1, meals: 3, supplies: tx(bi('Agua y toallas', 'Water and towels')) },
        contract: { ...show.contract, setLengthMin: 120, crew: tx(bi('DJ y técnico de visuales', 'DJ and visuals technician')), other: tx(bi('Hazer permitido; avisar a la sala del humo', 'Hazer allowed; tell the venue about the haze')) },
      };
      show = setElectrical(show, { breakers: [16, 16, 16], circuits: [[1, 1], [2, 1], [3, 2], [4, 2], [5, 3], [6, 3]] });
      show = setUniverseInfo(show, 1, { output: tx(bi('Interfaz DMX del portátil de visuales', 'DMX interface of the visuals laptop')) });
      return addNotes(show, placed, tx, [[bi('Avisar a la sala del hazer antes de la prueba', 'Tell the venue about the hazer before soundcheck'), haze], [bi('Probar el DMX de los móviles desde el portátil de visuales', 'Test the movers DMX from the visuals laptop'), visuals]]);
    },
  };
};

// ---------------------------------------------------------------------------------------------------------------

const conference = (): ShowPackage => {
  const b = build();
  const { el, ch, link, radio } = b;
  const lectern = el('furniture.lectern', 1600, 3000, 'Atril');
  el('furniture.table', 5900, 3200, 'Mesa de ponentes');
  const tableMics = [5000, 5600, 6200, 6800].map((x, i) => el('vocals.mic-stand', x, 3200, `Micro ${i + 1}`));
  const h1 = el('vocals.headset', 3000, 2300, 'Diadema 1');
  const h2 = el('vocals.headset', 4100, 2300, 'Diadema 2');
  el('video.screen', 4000, 300, 'Pantalla', VENUE);
  const projector = el('video.projector', 4000, 6700, 'Proyector', VENUE);
  const laptop = el('control.laptop', 2700, 3800, 'Portátil de presentación', { ...BAND, computer: { functions: ['video', 'sound'], os: 'windows', programs: [{ name: 'PowerPoint', use: 'Diapositivas' }] } });
  const camera = el('video.camera', 5300, 6200, 'Cámara', BAND);
  const mixer = el('control.videomixer', 5700, 7700, 'Mesa de vídeo', BAND);
  const desk = el('desk.digital', 2600, 7600, 'Mesa', { ...VENUE, ip: '192.168.1.10' });
  const sb = el('rack.stagebox', 7500, 1800, 'Stagebox', VENUE);
  const wl = el('rack.wireless', 7500, 700, 'Rack inalámbrico', { ...BAND, ip: '192.168.1.20', rack: { units: 8, slots: [[bi('Receptor doble inalámbrico (×4)', 'Dual wireless receiver (x4)'), 4], [bi('Combinador de antenas', 'Antenna combiner'), 1], [bi('Distribuidor de antenas', 'Antenna distributor'), 1], [bi('Conmutador de red', 'Network switch'), 1]] } });
  const paL = el('pa.line', 500, 3800, 'PA izquierda', VENUE);
  const paR = el('pa.line', 7500, 3800, 'PA derecha', VENUE);

  link(lectern, sb, 'audio', 'XLR');
  for (const m of tableMics) link(m, sb, 'audio', 'XLR');
  link(sb, desk, 'audio', 'Cat6');
  radio(h1, wl, 'Inalámbrico');
  link(h2, wl, 'audio', '');
  link(wl, desk, 'audio', 'XLR');
  link(laptop, desk, 'audio', 'Jack');
  link(laptop, mixer, 'video', 'HDMI');
  link(camera, mixer, 'video', 'SDI');
  link(mixer, projector, 'video', 'HDMI');
  link(desk, paL, 'audio', 'XLR');
  link(desk, paR, 'audio', 'XLR');
  link(wl, desk, 'network', 'Cat6');

  ch('Atril', 'sennheiser.e835', 'Cuello de cisne', false, lectern, 'SB 1');
  ch('Diadema 1', 'sennheiser.ew-dx', '', false, h1, 'RX 1');
  ch('Diadema 2', 'sennheiser.ew-dx', '', false, h2, 'RX 2');
  tableMics.forEach((m, i) => ch(`Mesa ${i + 1}`, 'Micro de mesa', 'Cuello de cisne', false, m, `SB ${i + 2}`));
  ch('Portátil L', 'Salida del portátil', '', false, laptop, 'SB 6');
  ch('Portátil R', 'Salida del portátil', '', false, laptop, 'SB 7');

  return {
    id: 'conference',
    name: bi('Conferencia', 'Conference'),
    description: bi('Atril, mesa de ponentes con micros, diademas inalámbricas en su rack, portátil de presentación, cámara, mesa de vídeo, proyector y pantalla; agenda, comida y acreditaciones.', 'Lectern, speakers table with mics, wireless headsets in their rack, presentation laptop, camera, video mixer, projector and screen; agenda, lunch and registration.'),
    modules: ['audio', 'computers', 'video', 'production', 'document'],
    elements: b.elements,
    channels: b.channels,
    outputs: [{ kind: 'main', element: paL, who: bi('Público', 'Audience') }, { kind: 'main', element: paR, who: bi('Público', 'Audience') }],
    links: b.links,
    desk: 'yamaha.dm3',
    finish: (show, placed, tx) => {
      show = { ...show, titleBlock: { ...show.titleBlock, production: tx(bi('Jornada de ejemplo', 'Example conference')), venue: tx(bi('Palacio de congresos de ejemplo', 'Example conference centre')) } };
      show = addContacts(show, tx, [
        [bi('Organización', 'Organiser'), ...PERSON],
        [bi('Técnico audiovisual', 'AV technician'), ...PERSON],
        [bi('Jefe de sala', 'House manager'), ...PERSON],
      ]);
      show = addSchedule(show, tx, [
        ['build', '07:30', bi('Carga', 'Load-in')],
        ['build', '08:30', bi('Montaje de sonido y vídeo', 'Sound and video build')],
        ['build', '09:15', bi('Pruebas con los ponentes', 'Speaker checks')],
        ['day', '09:30', bi('Acreditaciones', 'Registration')],
        ['day', '10:00', bi('Apertura', 'Opening')],
        ['day', '13:30', bi('Comida', 'Lunch')],
        ['day', '16:30', bi('Cierre', 'Closing')],
        ['day', '17:30', bi('Desmontaje', 'Load-out')],
      ]);
      show = {
        ...show,
        hospitality: { ...show.hospitality, meals: 40, dietary: tx(bi('3 vegetarianos, 1 celíaco', '3 vegetarian, 1 coeliac')), cateringNotes: tx(bi('Café a las 11:30', 'Coffee at 11:30')), dressingRooms: 1 },
        event: { ...show.event, venueAddress: tx(bi('Avenida del Congreso 10, 00000 Ciudad (ejemplo)', '10 Congress Avenue, 00000 City (example)')), parking: tx(bi('Muelle de carga en la calle trasera', 'Loading dock on the back street')), notes: tx(bi('Sala para 150 personas', 'Room for 150 people')) },
      };
      return addNotes(show, placed, tx, [[bi('Probar HDMI y USB-C con el portátil del ponente', 'Test HDMI and USB-C with the speaker laptop'), laptop], [bi('Cargar las baterías de las diademas la víspera', 'Charge the headset batteries the day before'), wl]]);
    },
  };
};

// ---------------------------------------------------------------------------------------------------------------

const theatre = (): ShowPackage => {
  const b = build();
  const { el, ch, link, radio } = b;
  const actors = Array.from({ length: 8 }, (_, i) => el('vocals.headset', 1500 + i * 700, 4000, `Actor ${i + 1}`));
  el('scenery.curtain', 800, 300, 'Pata izquierda');
  el('scenery.curtain', 7200, 300, 'Pata derecha');
  el('scenery.curtain', 4000, 200, 'Telón de fondo');
  const computer = el('control.laptop', 2600, 7600, 'Ordenador de sonido', { ...BAND, computer: { functions: ['sound'], os: 'macos', programs: [{ name: 'QLab', use: 'Efectos y música' }] } });
  const desk = el('desk.digital', 4000, 7600, 'Mesa', VENUE);
  const lightdesk = el('control.lightdesk', 5600, 7600, 'Mesa de luces', { ...VENUE, ip: '10.101.0.10' });
  const dimmer = el('rack.dimmer', 7600, 1000, 'Rack de dimmers', { ...VENUE, ip: '10.101.0.20' });
  const wl = el('rack.wireless', 7500, 2800, 'Rack inalámbrico', { ...BAND, rack: { units: 8, slots: [[bi('Receptor doble inalámbrico (×4)', 'Dual wireless receiver (x4)'), 4], [bi('Combinador de antenas', 'Antenna combiner'), 1], [bi('Distribuidor de antenas', 'Antenna distributor'), 1], [bi('Conmutador de red', 'Network switch'), 1]] } });
  const paL = el('pa.line', 500, 3800, 'PA izquierda', VENUE);
  const paR = el('pa.line', 7500, 3800, 'PA derecha', VENUE);
  // Lights, by where they hang: front of house, the three bars, the side booms and the floor.
  const lamp = (type: string, x: number, y: number, label: string, n: number, mountIx: number, model: string, color = '') =>
    el(type, x, y, label, { light: { modelId: model, channel: n, circuit: n, dimmer: n, mount: mountIx, color, universe: 1, address: n, dmxSlots: 1 } });
  [1500, 3000, 5000, 6500].forEach((x, i) => lamp('light.ellipsoidal', x, 6200, `Recorte FOH ${i + 1}`, 1 + i, 3, 'etc.s4-19', i < 2 ? 'R02' : 'R33'));
  const bar1 = [1500, 4000, 6500].map((x, i) => lamp('light.fresnel', x, 3300, `Fresnel ${i + 1}`, 5 + i, 0, 'etc.s4-fresnel', 'L201'));
  [1500, 4000, 6500].forEach((x, i) => lamp('light.ellipsoidal', x, 1800, `Recorte vara 2 ${i + 1}`, 8 + i, 1, 'etc.s4-26'));
  const cyc = [2500, 5500].map((x, i) => lamp('light.cyc', x, 1000, `Ciclorama ${i + 1}`, 11 + i, 2, 'altman.econocyc', 'R80'));
  lamp('light.pc', 250, 2200, 'PC 1', 13, 4, 'generic.pc-1k');
  lamp('light.pc', 7750, 2200, 'PC 2', 14, 5, 'generic.pc-1k');
  lamp('light.scoop', 2000, 600, 'Suelo 1', 15, 6, 'altman.scoop-153', 'R80');
  lamp('light.scoop', 6000, 600, 'Suelo 2', 16, 6, 'altman.scoop-153', 'R80');

  actors.forEach((a, i) => radio(a, wl, i === 0 ? 'Inalámbrico' : ''));
  link(wl, desk, 'audio', 'Dante');
  link(computer, desk, 'audio', 'Jack');
  link(desk, paL, 'audio', 'XLR');
  link(desk, paR, 'audio', 'XLR');
  link(lightdesk, dimmer, 'lightControl', 'Ethernet');

  actors.forEach((a, i) => ch(`Actor ${i + 1}`, 'sennheiser.ew-dx', '', false, a, `RX ${i + 1}`));
  ch('Reserva 1', 'sennheiser.ew-dx', '', false);
  ch('Reserva 2', 'sennheiser.ew-dx', '', false);
  ch('Efectos L', 'Salida del ordenador', '', false, computer);
  ch('Efectos R', 'Salida del ordenador', '', false, computer);

  return {
    id: 'theatre',
    name: bi('Teatro con micros de diadema', 'Theatre with headset mics'),
    description: bi('Ocho actores con diadema en su rack inalámbrico, patas y telón, ordenador de efectos y un plano de luces completo: frente de sala, tres varas, calles laterales y suelo, con circuitos, dimmers y fases.', 'Eight headset actors on their wireless rack, legs and curtain, an effects computer and a full light plot: front of house, three bars, side booms and the floor, with circuits, dimmers and phases.'),
    modules: ['audio', 'lights', 'computers', 'power', 'production', 'document'],
    elements: b.elements,
    channels: b.channels,
    outputs: [{ kind: 'main', element: paL, who: bi('Público', 'Audience') }, { kind: 'main', element: paR, who: bi('Público', 'Audience') }],
    links: b.links,
    mounts: [
      mount('bar', 'Vara 1', 'Bar 1', [600, 3300], [7400, 3300], 6000, 250),
      mount('bar', 'Vara 2', 'Bar 2', [600, 1800], [7400, 1800], 6000, 250),
      mount('bar', 'Contra', 'Backlight bar', [600, 1000], [7400, 1000], 6000, 250),
      mount('pipe', 'Frente de sala', 'Front of house', [1000, 6200], [7000, 6200], 5500, 200),
      mount('boom', 'Calle izquierda', 'Left boom', [250, 1500], [250, 3500], 3000, 80),
      mount('boom', 'Calle derecha', 'Right boom', [7750, 1500], [7750, 3500], 3000, 80),
      mount('floor', 'Suelo', 'Floor', [1500, 600], [6500, 600], 0),
    ],
    desk: 'yamaha.dm3',
    finish: (show, placed, tx) => {
      // A theatre light plot is read in RP-2 top-view outlines.
      show = setUniverseInfo(show, 1, { protocol: 'sacn', net: '1', output: tx(bi('Entrada de red del rack de dimmers', 'Network input of the dimmer rack')) });
      show = { ...show, view: { ...show.view, rp2Lights: true }, titleBlock: { ...show.titleBlock, production: tx(bi('Obra de ejemplo', 'Example play')), venue: tx(bi('Teatro de ejemplo', 'Example theatre')) } };
      show = addContacts(show, tx, [
        [bi('Regidora', 'Stage manager'), ...PERSON],
        [bi('Técnico de luces', 'Lighting technician'), ...PERSON],
        [bi('Técnica de sonido', 'Sound technician'), ...PERSON],
        [bi('Jefe de sala', 'House manager'), ...PERSON],
      ]);
      show = addSchedule(show, tx, [
        ['build', '08:00', bi('Carga y montaje de escenografía', 'Load-in and scenery build')],
        ['build', '10:00', bi('Colgado y enfoque de luces', 'Light hang and focus')],
        ['day', '14:00', bi('Prueba de sonido con diademas', 'Headset soundcheck')],
        ['day', '16:00', bi('Pase técnico', 'Technical run')],
        ['day', '18:30', bi('Comida', 'Dinner')],
        ['day', '20:30', bi('Puertas', 'Doors')],
        ['day', '21:00', bi('Función', 'Show')],
        ['day', '23:30', bi('Desmontaje', 'Load-out')],
      ]);
      show = {
        ...show,
        hospitality: { ...show.hospitality, dressingRooms: 3, dressingNotes: tx(bi('Uno con ducha', 'One with a shower')), meals: 14, dietary: tx(bi('2 vegetarianos', '2 vegetarian')) },
        contract: { ...show.contract, setLengthMin: 110, crew: tx(bi('Regidora, técnico de luces y de sonido, 2 tramoyistas', 'Stage manager, lighting and sound technicians, 2 stagehands')) },
        event: { ...show.event, venueAddress: tx(bi('Plaza del Teatro 1, 00000 Ciudad (ejemplo)', '1 Theatre Square, 00000 City (example)')), parking: tx(bi('Camión en la puerta de carga', 'Truck at the loading door')) },
      };
      show = setElectrical(show, {
        breakers: [32, 32, 32],
        circuits: Array.from({ length: 16 }, (_, i) => [i + 1, (i % 3) + 1] as [number, number]),
        dimmers: Array.from({ length: 16 }, (_, i) => [i + 1, 2300] as [number, number]),
      });
      return addNotes(show, placed, tx, [
        [bi('Enfocar la vara 1 con el actor en su marca', 'Focus bar 1 with the actor on their mark'), bar1[0]],
        [bi('Revisar las gelatinas del ciclorama', 'Check the cyc gels'), cyc[0]],
        [bi('Probar el cue de efectos de QLab con los actores', 'Run the QLab effects cue with the actors'), computer],
      ]);
    },
  };
};

// ---------------------------------------------------------------------------------------------------------------

const av = (): ShowPackage => {
  const b = build();
  const { el, ch, link } = b;
  el('video.screen', 4000, 300, 'Pantalla', VENUE);
  const projector = el('video.projector', 4000, 6700, 'Proyector', VENUE);
  const camera = el('video.camera', 6500, 6300, 'Cámara', BAND);
  const m1 = el('vocals.mic-stand', 3200, 3500, 'Micro 1');
  const m2 = el('vocals.mic-stand', 4800, 3500, 'Micro 2');
  const desk = el('desk.digital', 1500, 7700, 'Mesa', VENUE);
  const computer = el('control.laptop', 3000, 7700, 'Ordenador de vídeo', { ...BAND, ip: '192.168.10.11', computer: { functions: ['video', 'sound'], os: 'windows', programs: [{ name: 'Resolume', use: 'Vídeo en directo' }] } });
  const server = el('control.server', 4300, 7700, 'Servidor de vídeo', { ...BAND, ip: '192.168.10.12', computer: { functions: ['video', 'network'], os: 'linux', programs: [{ name: 'OBS Studio', use: 'Emisión' }] } });
  const mixer = el('control.videomixer', 5600, 7700, 'Mesa de vídeo', { ...BAND, ip: '192.168.10.13' });
  const net = el('rack.network', 7000, 7700, 'Conmutador de red', { ...BAND, ip: '192.168.10.1', rack: { units: 2, slots: [[bi('Conmutador de 24 puertos', '24-port switch'), 1], [bi('Panel de parcheo', 'Patch panel'), 1]] } });
  const paL = el('pa.line', 500, 3800, 'PA izquierda', VENUE);
  const paR = el('pa.line', 7500, 3800, 'PA derecha', VENUE);

  link(computer, mixer, 'video', 'HDMI');
  link(camera, mixer, 'video', 'SDI');
  link(mixer, projector, 'video', 'HDMI');
  link(computer, desk, 'audio', 'Jack');
  link(m1, desk, 'audio', 'XLR');
  link(m2, desk, 'audio', 'XLR');
  link(desk, paL, 'audio', 'XLR');
  link(desk, paR, 'audio', 'XLR');
  link(computer, net, 'network', 'Ethernet');
  link(server, net, 'network', '');
  link(mixer, net, 'network', '');

  ch('Ordenador L', 'Salida del ordenador', '', false, computer, '1');
  ch('Ordenador R', 'Salida del ordenador', '', false, computer, '2');
  ch('Micro 1', 'shure.sm58', 'Pie recto', false, m1, '3');
  ch('Micro 2', 'shure.sm58', 'Pie recto', false, m2, '4');

  return {
    id: 'av',
    name: bi('Audiovisual y proyección', 'Audiovisual and projection'),
    description: bi('Pantalla, proyector, cámara, mesa de vídeo, ordenador y servidor de vídeo en red, dos micros y PA; con agenda y notas de trabajo.', 'Screen, projector, camera, video mixer, computer and a networked video server, two mics and PA; with a schedule and work notes.'),
    modules: ['audio', 'computers', 'video', 'production', 'document'],
    elements: b.elements,
    channels: b.channels,
    outputs: [{ kind: 'main', element: paL, who: bi('Público', 'Audience') }, { kind: 'main', element: paR, who: bi('Público', 'Audience') }],
    links: b.links,
    finish: (show, placed, tx) => {
      show = addContacts(show, tx, [
        [bi('Productor', 'Producer'), ...PERSON],
        [bi('Técnico de vídeo', 'Video technician'), ...PERSON],
      ]);
      show = addSchedule(show, tx, [
        ['build', '08:00', bi('Montaje de pantalla y proyector', 'Screen and projector build')],
        ['build', '10:00', bi('Cableado de vídeo y red', 'Video and network cabling')],
        ['day', '12:00', bi('Pruebas de vídeo y sonido', 'Video and sound check')],
        ['day', '16:00', bi('Evento', 'Event')],
        ['day', '19:00', bi('Desmontaje', 'Load-out')],
      ]);
      return addNotes(show, placed, tx, [
        [bi('Comprobar la resolución del proyector con el ordenador', 'Check the projector resolution with the computer'), projector],
        [bi('Reservar una IP fija para el servidor de vídeo', 'Reserve a fixed IP for the video server'), server],
      ]);
    },
  };
};

export const PACKAGES: ShowPackage[] = [rock(), jazz(), singer(), dj(), conference(), theatre(), av(), showcase()];
export const packageById = (id: string): ShowPackage | undefined => PACKAGES.find((p) => p.id === id);
