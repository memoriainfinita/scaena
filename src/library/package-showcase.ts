// The example that uses everything the app does, to try it out: a concert with video in a theatre. Coordinates are in
// millimetres, x from the left and y from the back wall. `package-showcase.test.ts` fails when a feature goes missing.
import { removeChannel, updateChannel, updateOutput } from '../model/audio.ts';
import { updateConnection } from '../model/connections.ts';
import { addCustomItem } from '../model/custom-items.ts';
import { setUniverseInfo } from '../model/dmx.ts';
import { addLayer } from '../model/layers.ts';
import { setMagicPosition, updateLuminaire } from '../model/lights.ts';
import { addElement, groupElements, updateElement } from '../model/ops.ts';
import type { Show } from '../model/schema.ts';
import { validate } from '../validate/rules.ts';
import { addContacts, addNotes, addSchedule, addSetlist, BAND, bi, build, mount, PERSON, setElectrical, VENUE } from './packages-data.ts';
import { SHOWCASE_LOGO_PNG, SHOWCASE_PLAN_PNG } from './showcase-assets.ts';
import { cleanSvg } from './svg-clean.ts';
import type { ShowPackage } from './types.ts';

const PLAN_FILE = 'background-showcase.png';
const LOGO_FILE = 'logo-showcase.png';
const RENTAL = { suppliedBy: 'rental' as const };
const fromBase64 = (b: string): Uint8Array => Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
const SPOT = 'ofl.chauvet-dj.intimidator-spot-160';
const SLIM = 'ofl.chauvet-dj.slim-par-64';
const AUDIENCE = bi('Público', 'Audience');
const CASE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><rect x="4" y="4" width="92" height="52" rx="4" fill="none" stroke="#000" stroke-width="3"/><path d="M4 30H96M50 4V56" fill="none" stroke="#000" stroke-width="2"/></svg>';

export function showcase(): ShowPackage {
  const b = build();
  const { el, ch, link } = b;

  // Stage: the riser and what stands on it, the backline, then the front line.
  el('furniture.riser', 5000, 1600, 'Tarima de batería', { ...VENUE, size: { w: 2600, d: 2000, height: 300 } });
  const drums = el('kit.drums5', 5000, 1600, 'Batería', BAND);
  const ampBass = el('amp.bass', 2200, 1700, 'Ampli de bajo', BAND);
  const ampG1 = el('amp.guitar', 8000, 1700, 'Ampli guitarra 1', { ...BAND, rotation: -15 });
  const ampG2 = el('amp.guitar', 6900, 1700, 'Ampli guitarra 2', { ...BAND, rotation: 15 });
  const bass = el('guitar.bass', 2000, 3100, 'Bajo', BAND);
  const diBass = el('rack.di', 2800, 3200, '', BAND);
  const g2 = el('guitar.electric', 6200, 3100, 'Guitarra 2', BAND);
  const g1 = el('guitar.electric', 7400, 3100, 'Guitarra 1', BAND);
  const keys = el('keys.keyboard', 8400, 3700, 'Teclado', BAND);
  const diKeys = el('rack.di-stereo', 9000, 3000, '', BAND);
  const v1 = el('vocals.mic-stand', 3300, 3900, 'Voz 1');
  const v2 = el('vocals.mic-stand', 5000, 3900, 'Voz 2', { notes: bi('Zurda: el pie va a su derecha', 'Left-handed: the stand goes on the right') });
  const v3 = el('vocals.mic-stand', 6700, 3900, 'Voz 3');
  const headset = el('vocals.headset', 4150, 3900, 'Diadema 1', RENTAL);
  const sax = el('winds.player', 5850, 3900, 'Viento 1', BAND);
  const wedges = [3000, 4200, 5800, 7000].map((x) => el('monitor.wedge', x, 4700, '', VENUE));

  // Side of stage.
  const sb = el('rack.stagebox', 9300, 1000, 'SB', VENUE);
  const rack = el('rack.rack', 9300, 1700, 'Rack de escenario', { ...RENTAL, rack: { units: 12, slots: [[bi('Stagebox Midas DL16', 'Midas DL16 stagebox'), 2], [bi('Splitter de monitores', 'Monitor splitter'), 1], [bi('Procesador del PA', 'PA processor'), 1], [bi('Regleta de corriente', 'Power strip'), 1]] } });
  const wl = el('rack.wireless', 9300, 2400, 'Rack inalámbrico', { ...RENTAL, rack: { units: 8, slots: [[bi('Receptor doble inalámbrico', 'Dual wireless receiver'), 1], [bi('Distribuidor de antenas', 'Antenna distributor'), 1]] } });
  const iem = el('rack.iem', 9950, 1000, 'Petacas IEM', RENTAL);
  const monDesk = el('desk.monitor', 9900, 3800, 'Mesa de monitores', { ...VENUE, ip: '192.168.1.11' });
  const dimmer = el('rack.dimmer', 800, 1000, 'Rack de dimmers', { ...VENUE, ip: '192.168.1.40' });
  const splitter = el('net.dmx-splitter', 800, 1700, 'Splitter DMX', VENUE);
  const node = el('net.artnet', 1000, 2400, 'Nodo Art-Net', { ...RENTAL, ip: '192.168.1.41' });
  const distro = el('power.distro', 800, 3100, 'Distribución', VENUE);
  el('power.outlet', 10000, 5050, 'Toma 16 A derecha', VENUE);
  el('power.outlet', 200, 4300, 'Toma 16 A izquierda', VENUE);
  const haze = el('effect.haze', 1400, 1500, 'Hazer', RENTAL);

  // Sound out to the room.
  const paL = el('pa.line', 800, 4800, 'PA izquierda', VENUE);
  const paR = el('pa.line', 9400, 4850, 'PA derecha', VENUE);
  const subL = el('pa.sub', 2200, 5600, 'Sub izquierdo', VENUE);
  const subR = el('pa.sub', 7800, 5600, 'Sub derecho', VENUE);
  const fill = el('pa.compact-10', 5000, 5400, 'Frontal', VENUE);

  // Video and computers.
  const wall = el('video.led-wall', 5000, 300, '', { ...RENTAL, size: { w: 6000, d: 200 } });
  const projector = el('video.projector', 5000, 7000, 'Proyector', VENUE);
  const camera = el('video.camera', 8300, 7000, 'Cámara', BAND);
  const soundPc = el('control.laptop', 2000, 7900, 'Ordenador de sonido', { ...BAND, ip: '192.168.1.21', computer: { functions: ['sound'], os: 'macos', programs: [{ name: 'QLab', use: 'Efectos y música' }] } });
  const desk = el('desk.digital', 3400, 7900, 'Mesa', { ...VENUE, ip: '192.168.1.10' });
  const ld = el('control.lightdesk', 4800, 7900, 'Mesa de luces', { ...VENUE, ip: '192.168.1.30' });
  const mixer = el('control.videomixer', 6200, 7900, 'Mesa de vídeo', { ...BAND, ip: '192.168.1.31' });
  const server = el('control.server', 7400, 7900, 'Servidor de vídeo', { ...BAND, ip: '192.168.1.32', computer: { functions: ['video', 'network'], os: 'linux', programs: [{ name: 'OBS Studio', use: 'Emisión' }] } });
  const videoPc = el('control.laptop', 8600, 7900, 'Ordenador de vídeo', { ...BAND, ip: '192.168.1.33', computer: { functions: ['video', 'lights'], os: 'windows', programs: [{ name: 'Resolume', use: 'Vídeo en directo' }] } });
  const net = el('rack.network', 9850, 8000, 'Switch', { ...BAND, ip: '192.168.1.1', rack: { units: 2, slots: [[bi('Conmutador de 24 puertos', '24-port switch'), 1], [bi('Panel de parcheo', 'Patch panel'), 1]] } });

  // The room, furniture and notes on the plan.
  // The venue plan already draws the house, so these stand in its side rooms and not on its seats.
  el('room.dressing', -1200, 1200, 'Camerino', { size: { w: 1400, d: 800 } });
  el('room.booth', -1200, 3600, '', { size: { w: 1400, d: 800 } });
  el('room.dock', 11200, 2400, 'Muelle de carga', { size: { w: 1400, d: 800 } });
  el('furniture.chair', 8700, 4950, 'Silla');
  el('furniture.table', 3400, 6800, 'Mesa de producción');
  el('scenery.curtain', 5000, 120);
  el('note.text', 1000, 6500, 'Público');
  el('note.dimension', 1500, 7000, 'Boca útil', { size: { w: 2000, d: 300 } });

  // Lights, by where they hang: 0 truss, 1 bar, 2 pipe, 3 and 4 booms, 5 and 6 floor. With this many elements the lights,
  // wedges and DIs go by their symbol, as on a real plot, and only what needs a name has one.
  const spots = [2000, 4000, 6000, 8000].map((x, i) => el('light.moving-spot', x, 900, '', { light: { modelId: SPOT, channel: 1 + i, circuit: 1 + i, mount: 0, universe: 1, address: 1 + i * 16 } }));
  const ers = [3000, 7000].map((x, i) => el('light.ellipsoidal', x, 2400, '', { light: { modelId: 'etc.s4-26', channel: 5 + i, circuit: 5 + i, dimmer: 1 + i, mount: 1, color: 'R02', universe: 2, address: 1 + i, dmxSlots: 1 } }));
  const fresnels = [4400, 5600].map((x, i) => el('light.fresnel', x, 2400, '', { light: { modelId: 'etc.s4-fresnel', channel: 7 + i, circuit: 7 + i, dimmer: 3 + i, mount: 1, color: 'L201', universe: 2, address: 3 + i, dmxSlots: 1 } }));
  const washes = [3000, 4400, 5600, 7000].map((x, i) => el('light.led-par', x, 6200, '', { light: { modelId: SLIM, channel: 9 + i, circuit: 9 + i, mount: 2, universe: 3, address: 1 + i * 7, dmxMode: '7ch' } }));
  const pcL = el('light.pc', 250, 2200, '', { light: { modelId: 'generic.pc-1k', channel: 13, circuit: 13, dimmer: 5, mount: 3, color: 'R33', universe: 2, address: 5, dmxSlots: 1 } });
  const pcR = el('light.pc', 9750, 2900, '', { light: { modelId: 'generic.pc-1k', channel: 14, circuit: 14, dimmer: 6, mount: 4, color: 'R33', universe: 2, address: 6, dmxSlots: 1 } });
  const floorL = el('light.led-par', 1100, 3800, '', { light: { modelId: SLIM, channel: 15, circuit: 15, mount: 5, universe: 1, address: 65, dmxMode: '7ch' } });
  const floorR = el('light.led-par', 9000, 4300, '', { light: { modelId: SLIM, channel: 16, circuit: 16, mount: 6, universe: 1, address: 72, dmxMode: '7ch' } });

  // Audio: instrument, amp or DI, stagebox with its numbered inputs, desk, and out.
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
  link(sax, sb, 'audio', 'XLR', 18);
  link(headset, wl, 'audio', 'Inalámbrico');
  link(wl, desk, 'audio', 'Dante');
  link(sb, rack, 'audio', 'Cat6');
  link(rack, desk, 'audio', 'Cat6');
  link(rack, monDesk, 'audio', 'Cat6');
  link(soundPc, desk, 'audio', 'USB');
  for (const w of wedges) link(monDesk, w, 'audio', 'XLR');
  link(monDesk, iem, 'audio', 'XLR');
  link(desk, paL, 'audio', 'XLR');
  link(desk, paR, 'audio', 'XLR');
  link(paL, subL, 'audio', 'Speakon');
  link(paR, subR, 'audio', 'Speakon');
  link(desk, fill, 'audio', 'XLR');

  // Video.
  link(videoPc, mixer, 'video', 'HDMI');
  link(camera, mixer, 'video', 'SDI');
  link(mixer, wall, 'video', 'SDI');
  link(server, projector, 'video', 'HDMI');

  // Light control: DMX through a splitter, sACN to the dimmers, Art-Net to a node.
  link(ld, splitter, 'lightControl', 'DMX');
  [splitter, ...spots].forEach((e, i, all) => { if (i > 0) link(all[i - 1]!, e, 'lightControl', 'DMX'); });
  link(splitter, floorL, 'lightControl', 'DMX');
  link(floorL, floorR, 'lightControl', 'DMX');
  link(splitter, haze, 'lightControl', 'DMX');
  link(ld, dimmer, 'lightControl', 'Ethernet');
  [node, ...washes].forEach((e, i, all) => { if (i > 0) link(all[i - 1]!, e, 'lightControl', 'DMX'); });

  // Network: every device hangs off the switch, so there is no loop.
  for (const e of [desk, monDesk, soundPc, ld, mixer, server, videoPc, node, dimmer]) link(net, e, 'network', 'Cat6');

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
  ch('Viento 1', 'sennheiser.e906', 'Pie recto', false, sax);
  ch('Diadema 1', 'sennheiser.ew-dx', '', false, headset, 'RX 1');
  ch('Efectos L', 'Salida del ordenador', '', false, soundPc);
  ch('Efectos R', 'Salida del ordenador', '', false, soundPc);
  ch('Reserva 1', 'shure.sm58', 'Pie recto', false);

  return {
    id: 'showcase',
    name: bi('Muestra completa', 'Full showcase'),
    description: bi('El ejemplo para probar la aplicación entera: usa todas las funciones, de los cables numerados y las mezclas al fondo de sala, las revisiones y el documento con todas sus secciones.', 'The example for trying the whole app: it uses every feature, from numbered cables and mixes to the venue background, revisions and a document with every section.'),
    modules: ['audio', 'lights', 'computers', 'video', 'room', 'power', 'production', 'document'],
    elements: b.elements,
    channels: b.channels,
    outputs: [
      { kind: 'wedge', element: wedges[0]!, who: 'Voz 1', mix: { 14: 'high', 10: 'normal', 12: 'low', 13: 'low' } },
      { kind: 'wedge', element: wedges[1]!, who: 'Diadema 1', mix: { 18: 'high', 14: 'normal', 12: 'low' } },
      { kind: 'wedge', element: wedges[2]!, who: 'Viento 1', mix: { 17: 'high', 15: 'normal', 8: 'low' } },
      { kind: 'wedge', element: wedges[3]!, who: 'Voz 3', mix: { 16: 'high', 14: 'normal', 11: 'low' } },
      { kind: 'iem', element: iem, who: 'Batería', mix: { 0: 'high', 1: 'high', 8: 'normal', 14: 'normal', 19: 'high', 20: 'high' } },
      { kind: 'iem', element: iem, who: 'Teclado', mix: { 12: 'high', 13: 'high', 14: 'normal', 0: 'low' } },
      { kind: 'main', element: paL, who: AUDIENCE },
      { kind: 'main', element: paR, who: AUDIENCE },
      { kind: 'send', element: subL, who: bi('Subgrave', 'Subs') },
      { kind: 'send', element: subR, who: bi('Subgrave', 'Subs') },
      { kind: 'send', element: fill, who: bi('Primeras filas', 'Front rows') },
    ],
    links: b.links,
    mounts: [
      mount('truss', 'Truss', 'Truss', [1500, 900], [8500, 900], 6000, 400),
      mount('bar', 'Vara 1', 'Bar 1', [2000, 2400], [8000, 2400], 6500, 250),
      mount('pipe', 'Frente de sala', 'Front of house', [2000, 6200], [8000, 6200], 5500, 200),
      mount('boom', 'Calle izquierda', 'Left boom', [250, 1500], [250, 3000], 3000, 80),
      mount('boom', 'Calle derecha', 'Right boom', [9750, 1500], [9750, 3000], 3000, 80),
      mount('floor', 'Suelo 1', 'Floor 1', [1100, 3700], [1100, 3900], 0),
      mount('floor', 'Suelo 2', 'Floor 2', [9000, 4200], [9000, 4400], 0),
    ],
    desk: 'midas.m32',
    images: () => ({ [PLAN_FILE]: fromBase64(SHOWCASE_PLAN_PNG), [LOGO_FILE]: fromBase64(SHOWCASE_LOGO_PNG) }),
    history: {
      // The first version had no spare channel and no encore.
      earlier: (show) => ({ ...removeChannel(show, Object.values(show.channels).find((c) => c.number === 32)!.id), setlist: show.setlist.slice(0, -1) }),
      first: ['2026-10-20', bi('Primera versión para la sala', 'First version for the venue')],
      second: ['2026-11-02', bi('Añadidos el bis y un canal de reserva', 'Encore and a spare channel added')],
    },
    finish: (input, placed, tx) => {
      let show: Show = input;
      const id = (i: number) => placed[i]!.id;

      // The stage and its venue plan.
      show = {
        ...show,
        date: '2026-12-12',
        desk: { ...show.desk, showFile: 'gira-otono-v3.scn' },
        // With some sixty cables the lines start hidden, so the plan can be read; the button under the plan shows them.
        view: { ...show.view, rp2Lights: true, gridMm: 250, links: false },
        stage: {
          ...show.stage,
          shape: { kind: 'polygon', points: [{ x: 600, y: 0 }, { x: 9400, y: 0 }, { x: 10000, y: 3000 }, { x: 9000, y: 5400 }, { x: 1000, y: 5400 }, { x: 0, y: 3000 }], prosceniumWidth: 8000 },
          height: 900,
          prosceniumHeight: 6000,
          referenceLines: { center: true, plaster: true, proscenium: true },
          background: { file: PLAN_FILE, x: -3000, y: -2000, scale: 10, opacity: 0.35, locked: true },
        },
        titleBlock: { production: tx(bi('Banda de ejemplo, gira de otoño', 'Example band, autumn tour')), author: tx(bi('Oficina técnica de ejemplo', 'Example technical office')), venue: tx(bi('Teatro de ejemplo', 'Example theatre')), logo: LOGO_FILE },
        hospitality: {
          dressingRooms: 3, dressingNotes: tx(bi('Uno con ducha y espejo de cuerpo entero', 'One with a shower and a full-length mirror')),
          meals: 14, dietary: tx(bi('2 vegetarianos, 1 sin gluten', '2 vegetarian, 1 gluten free')), cateringNotes: tx(bi('Comida caliente antes de la prueba', 'Hot meal before soundcheck')),
          afterShowMeal: true, busStock: true, supplies: tx(bi('Agua, toallas, fruta y café', 'Water, towels, fruit and coffee')),
          transport: tx(bi('Furgoneta y camión de la gira', 'Tour van and truck')), lodging: tx(bi('Siete habitaciones dobles', 'Seven double rooms')), localTransport: tx(bi('Traslado del hotel al teatro', 'Transfer from hotel to theatre')),
          cashInstead: true, cashAmount: tx(bi('25 € por persona si no hay cena', '25 € per person if there is no dinner')),
        },
        contract: {
          fee: tx(bi('Caché de ejemplo', 'Example fee')), deposit: tx(bi('50 % a la firma', '50 % on signature')), payment: tx(bi('Resto, transferencia antes del concierto', 'Balance by transfer before the show')),
          cancellation: tx(bi('Sin coste hasta 30 días antes', 'Free up to 30 days before')), insurance: tx(bi('Responsabilidad civil de la sala', "The venue's public liability")), setLengthMin: 100,
          crew: tx(bi('Sonido, monitores, luces, vídeo y backline', 'Sound, monitors, lights, video and backline')), other: tx(bi('Mesa y PA de la sala', 'House desk and PA')),
        },
        event: { venueAddress: tx(bi('Plaza del Teatro 1, 00000 Ciudad (ejemplo)', '1 Theatre Square, 00000 City (example)')), parking: tx(bi('Camión en el muelle de carga', 'Truck at the loading dock')), notes: tx(bi('Aforo de 450 personas', 'Capacity of 450')) },
        document: { template: 'custom', sections: ['cover', 'contacts', 'schedule', 'build', 'plan', 'lightPlan', 'inputs', 'outputs', 'computers', 'lights', 'rigging', 'magic', 'racks', 'cables', 'dmx', 'electrical', 'setlist', 'hospitality', 'contract', 'notes', 'revisions'], planScale: null, planLegend: true, inputs: { landscape: false, blocks: 2 } },
      };

      show = addContacts(show, tx, [
        [bi('Jefe de producción', 'Production manager'), ...PERSON],
        [bi('Técnico de sonido', 'Sound engineer'), ...PERSON],
        [bi('Técnico de monitores', 'Monitor engineer'), ...PERSON],
        [bi('Técnico de luces', 'Lighting technician'), ...PERSON],
        [bi('Técnico de vídeo', 'Video technician'), ...PERSON],
        [bi('Jefe de sala', 'House manager'), ...PERSON],
      ]);
      show = { ...show, contacts: show.contacts.map((c, i) => (i === 5 ? { ...c, hidden: ['email'] } : c)) };
      show = addSchedule(show, tx, [
        ['build', '08:00', bi('Carga', 'Load-in')],
        ['build', '09:00', bi('Colgado y enfoque de luces', 'Light hang and focus')],
        ['build', '12:00', bi('Montaje de sonido y vídeo', 'Sound and video build')],
        ['day', '15:00', bi('Comida', 'Lunch')],
        ['day', '16:30', bi('Prueba de sonido', 'Soundcheck')],
        ['day', '19:00', bi('Cena', 'Dinner')],
        ['day', '20:30', bi('Puertas', 'Doors')],
        ['day', '21:00', bi('Concierto', 'Show')],
        ['day', '23:00', bi('Desmontaje', 'Load-out')],
        ['day', '01:00', bi('Toque de queda', 'Curfew')],
      ]);
      show = addSetlist(show, tx, [
        [bi('Apertura', 'Opener'), 240, bi('Intro con pista y vídeo', 'Intro with backing track and video')],
        [bi('Tema 2', 'Song 2'), 215],
        [bi('Tema 3', 'Song 3'), 260, bi('Cambio de guitarra', 'Guitar change')],
        [bi('Balada', 'Ballad'), 290, bi('Solo de teclado', 'Keys solo')],
        [bi('Cierre', 'Closer'), 330],
        [bi('Bis', 'Encore'), 280],
      ]);

      // Power: three phases, each circuit on one, dimmers with their limit; equipment that is not a light says its phase.
      show = setElectrical(show, {
        breakers: [32, 32, 32],
        circuits: Array.from({ length: 16 }, (_, i) => [i + 1, (i % 3) + 1] as [number, number]),
        dimmers: Array.from({ length: 6 }, (_, i) => [i + 1, 2300] as [number, number]),
      });
      show = updateElement(show, id(desk), { phase: 1 });
      show = updateElement(show, id(rack), { phase: 2, weightKg: 62, powerW: 900 });
      show = updateElement(show, id(distro), { phase: 3 });

      show = setUniverseInfo(show, 1, { protocol: 'dmx', output: tx(bi('Salida A, por el splitter', 'Output A, through the splitter')) });
      show = setUniverseInfo(show, 2, { protocol: 'sacn', net: '2', output: tx(bi('Entrada de red del rack de dimmers', 'Network input of the dimmer rack')) });
      show = setUniverseInfo(show, 3, { protocol: 'artnet', net: '0:0:3', output: tx(bi('Nodo Art-Net del frente de sala', 'Art-Net node at front of house')) });

      // What can only be set on an element that already exists.
      show = updateElement(show, id(ampG1), { flipX: true });
      show = updateElement(show, id(v1), { labelAt: { x: -1150, y: 900 } });
      show = updateLuminaire(show, id(ers[0]!), { focus: { x: 3300, y: 3900 }, accessories: [tx(bi('Visera', 'Top hat')), tx(bi('Iris', 'Iris'))], notes: tx(bi('Enfocar con la voz en su marca', 'Focus with the vocal on their mark')) });
      show = updateLuminaire(show, id(fresnels[0]!), { focus: { x: 5000, y: 1600 } });
      show = setMagicPosition(show, id(pcL), { x: 1000, y: 2000 });
      show = setMagicPosition(show, id(pcR), { x: 9000, y: 2000 });
      show = groupElements(show, [id(wedges[0]!), id(wedges[1]!)])[0];

      // Cables with their measured length and a name.
      const cable = (a: number, c: number) => Object.values(show.connections).find((x) => x.from === id(a) && x.to === id(c))!;
      show = updateConnection(show, cable(rack, desk).id, { lengthMm: 45000, label: tx(bi('Tirada a la mesa', 'Run to the desk')) });
      show = updateConnection(show, cable(net, ld).id, { lengthMm: 12000, label: tx(bi('Red de luces', 'Lighting network')) });
      show = updateConnection(show, cable(server, projector).id, { lengthMm: 8000, label: tx(bi('Proyector', 'Projector')) });

      // Channels and outputs: a stereo pair, an insert, notes, and a spare at the end of the desk.
      const channel = (n: number) => Object.values(show.channels).find((c) => c.number === n)!;
      const [kl, kr] = [channel(13).id, channel(14).id];
      show = updateChannel(show, kl, { stereoPairWith: kr });
      show = updateChannel(show, kr, { stereoPairWith: kl });
      show = updateChannel(show, channel(15).id, { insert: tx(bi('Compresor externo', 'External compressor')), notes: tx(bi('Voz principal', 'Lead vocal')) });
      const spare = channel(22).id;
      show = { ...show, channels: { ...show.channels, [spare]: { ...show.channels[spare]!, number: 32, notes: tx(bi('Reserva por si falla una voz', 'Spare in case a vocal fails')) } } };
      const output = (n: number) => Object.values(show.outputs).find((o) => o.number === n)!;
      show = updateOutput(show, output(5).id, { stereo: true, aux: 'Aux 5-6', notes: tx(bi('Con click', 'With click')) });
      show = updateOutput(show, output(7).id, { stereo: true });

      // A layer of the user's own with an element they drew.
      const [layered, layer] = addLayer(show, tx(bi('Mobiliario de gira', 'Tour furniture')));
      show = layered;
      const drawing = cleanSvg(CASE_SVG);
      if (layer && drawing.ok) {
        const [drawn, item] = addCustomItem(show, { name: tx(bi('Baúl de la gira', 'Tour flight case')), layer: 'custom', w: 1200, d: 700, h: 800, weightKg: 45, powerW: null, svg: drawing.svg });
        show = drawn;
        if (item) [show] = addElement(show, { type: { id: `custom.${item.id}`, version: 1 }, x: 9000, y: 6800, layerId: layer.id, label: tx(bi('Baúl', 'Flight case')), suppliedBy: 'band' });
        show = { ...show, layers: show.layers.map((l) => (l.id === layer.id ? { ...l, dim: 0.3 } : l)) };
      }

      show = addNotes(show, placed, tx, [
        [bi('Confirmar con la sala las tomas de 32 A', 'Confirm the 32 A outlets with the venue')],
        [bi('Enfocar la vara con la voz en su marca', 'Focus the bar with the vocal on their mark'), ers[0]],
        [bi('Avisar a la sala del hazer', 'Tell the venue about the hazer'), haze],
      ]);
      show = { ...show, workNotes: show.workNotes.map((n, i) => (i === 0 ? { ...n, done: true } : n)) };

      // The reserve channel leaves a gap at the end of the desk: a warning silenced on purpose, to show how that looks.
      return { ...show, muted: validate(show).filter((i) => i.rule === 'channelGaps').map((i) => i.key) };
    },
  };
}
