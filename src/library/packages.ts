// The seven show packages accepted on 2026-11-02 (docs/design/paquetes-2026-11-02.md). Stage coordinates are
// in millimetres: x from the left, y from the back wall (0) to the front edge; the default stage is 8000 by 5000.
// Packages carry no console model and no lights, except theatre (basic light plot). Suggested microphones are
// editable and marked "suggestion" only in the editor.
import type { PackageChannel, PackageElement, ShowPackage } from './types.ts';

const el = (type: string, x: number, y: number, label = '', extra: Partial<PackageElement> = {}): PackageElement => ({ type, x, y, label, ...extra });
const ch = (name: string, mic: string, stand: string, phantom = false, element?: number): PackageChannel => ({ name, mic, stand, phantom, ...(element === undefined ? {} : { element }) });

const rock: ShowPackage = {
  id: 'rock',
  name: { es: 'Banda de rock', en: 'Rock band' },
  description: { es: 'Batería, bajo, dos guitarras, teclado y tres voces con cuatro cuñas.', en: 'Drums, bass, two guitars, keyboard and three vocals with four wedges.' },
  modules: ['audio', 'document'],
  elements: [
    el('kit.drums5', 4000, 1400, 'Batería', { suppliedBy: 'band' }), // 0
    el('amp.bass', 1300, 1700, 'Bajo', { suppliedBy: 'band' }), // 1
    el('amp.guitar', 6600, 1700, 'Guitarra 1', { suppliedBy: 'band' }), // 2
    el('amp.guitar', 5600, 1700, 'Guitarra 2', { suppliedBy: 'band' }), // 3
    el('keys.keyboard', 6000, 3000, 'Teclado', { suppliedBy: 'band' }), // 4
    el('vocals.mic-stand', 2800, 3700, 'Voz 1'), // 5
    el('vocals.mic-stand', 4000, 3900, 'Voz 2'), // 6
    el('vocals.mic-stand', 5200, 3700, 'Voz 3'), // 7
    el('monitor.wedge', 2500, 4500, 'Cuña 1'), // 8
    el('monitor.wedge', 3500, 4500, 'Cuña 2'), // 9
    el('monitor.wedge', 4500, 4500, 'Cuña 3'), // 10
    el('monitor.wedge', 5500, 4500, 'Cuña 4'), // 11
    el('rack.stagebox', 7400, 600, 'Stagebox'), // 12
    el('desk.digital', 4000, 7600, 'Mesa'), // 13
    el('pa.line', 500, 3800, 'PA izquierda', { suppliedBy: 'venue' }), // 14
    el('pa.line', 7500, 3800, 'PA derecha', { suppliedBy: 'venue' }), // 15
  ],
  channels: [
    ch('Bombo', 'shure.beta52a', 'Pie corto', false, 0),
    ch('Caja', 'shure.sm57', 'Pinza', false, 0),
    ch('Charles', 'akg.c414xlii', 'Pie recto', true, 0),
    ch('Tom 1', 'sennheiser.e604', 'Pinza', false, 0),
    ch('Tom 2', 'sennheiser.e604', 'Pinza', false, 0),
    ch('Tom suelo', 'sennheiser.e604', 'Pinza', false, 0),
    ch('OH I', 'akg.c414xlii', 'Pie largo', true, 0),
    ch('OH D', 'akg.c414xlii', 'Pie largo', true, 0),
    ch('Bajo DI', 'radial.jdi', '', false, 1),
    ch('Bajo ampli', 'shure.sm57', 'Pie corto', false, 1),
    ch('Guitarra 1', 'shure.sm57', 'Pie corto', false, 2),
    ch('Guitarra 2', 'shure.sm57', 'Pie corto', false, 3),
    ch('Teclado L', 'radial.jdi', '', false, 4),
    ch('Teclado R', 'radial.jdi', '', false, 4),
    ch('Voz 1', 'shure.sm58', 'Pie recto', false, 5),
    ch('Voz 2', 'shure.sm58', 'Pie recto', false, 6),
    ch('Voz 3', 'shure.sm58', 'Pie recto', false, 7),
  ],
  outputs: [...[8, 9, 10, 11].map((element) => ({ kind: 'wedge' as const, element })), { kind: 'main' as const, element: 14 }, { kind: 'main' as const, element: 15 }],
  links: [{ from: 12, to: 13, signal: 'audio', connector: 'Multipar' }, { from: 13, to: 14, signal: 'audio' }, { from: 13, to: 15, signal: 'audio' }, ...[8, 9, 10, 11].map((to) => ({ from: 13, to, signal: 'audio' as const }))],
};

const jazz: ShowPackage = {
  id: 'jazz',
  name: { es: 'Jazz', en: 'Jazz' },
  description: { es: 'Combo acústico: batería reducida, contrabajo, piano, guitarra, dos vientos y voz.', en: 'Acoustic combo: small kit, double bass, piano, guitar, two winds and vocals.' },
  modules: ['audio', 'document'],
  elements: [
    el('kit.drums-small', 4000, 1300, 'Batería', { suppliedBy: 'band' }), // 0
    el('strings.doublebass', 2200, 2000, 'Contrabajo', { suppliedBy: 'band' }), // 1
    el('keys.piano', 6300, 2200, 'Piano', { suppliedBy: 'venue' }), // 2
    el('amp.guitar', 1200, 1500, 'Guitarra', { suppliedBy: 'band' }), // 3
    el('winds.player', 3300, 3300, 'Viento 1'), // 4
    el('winds.player', 4700, 3300, 'Viento 2'), // 5
    el('vocals.mic-stand', 4000, 3900, 'Voz'), // 6
    el('monitor.wedge', 3300, 4500, 'Cuña 1'), // 7
    el('monitor.wedge', 4700, 4500, 'Cuña 2'), // 8
    el('desk.digital', 4000, 7600, 'Mesa'), // 9
    el('rack.stagebox', 7400, 600, 'Stagebox'), // 10
    el('pa.line', 500, 3800, 'PA izquierda', { suppliedBy: 'venue' }), // 11
    el('pa.line', 7500, 3800, 'PA derecha', { suppliedBy: 'venue' }), // 12
  ],
  channels: [
    ch('Bombo', 'shure.beta52a', 'Pie corto', false, 0),
    ch('Caja', 'shure.sm57', 'Pinza', false, 0),
    ch('OH I', 'akg.c414xlii', 'Pie largo', true, 0),
    ch('OH D', 'akg.c414xlii', 'Pie largo', true, 0),
    ch('Contrabajo DI', 'radial.jdi', '', false, 1),
    ch('Contrabajo micro', 'shure.sm57', 'Pie corto', false, 1),
    ch('Piano L', 'akg.c414xlii', 'Pie largo', true, 2),
    ch('Piano R', 'akg.c414xlii', 'Pie largo', true, 2),
    ch('Guitarra', 'shure.sm57', 'Pie corto', false, 3),
    ch('Viento 1', 'sennheiser.e906', 'Pie recto', false, 4),
    ch('Viento 2', 'sennheiser.e906', 'Pie recto', false, 5),
    ch('Voz', 'shure.sm58', 'Pie recto', false, 6),
  ],
  outputs: [...[7, 8].map((element) => ({ kind: 'wedge' as const, element })), { kind: 'main' as const, element: 11 }, { kind: 'main' as const, element: 12 }],
  links: [{ from: 10, to: 9, signal: 'audio', connector: 'Multipar' }, { from: 9, to: 11, signal: 'audio' }, { from: 9, to: 12, signal: 'audio' }, { from: 9, to: 7, signal: 'audio' }, { from: 9, to: 8, signal: 'audio' }],
};

const singer: ShowPackage = {
  id: 'singer',
  name: { es: 'Cantautor o dúo acústico', en: 'Singer-songwriter or acoustic duo' },
  description: { es: 'Voz, guitarra acústica y segunda voz, con una cuña.', en: 'Vocal, acoustic guitar and second vocal, with one wedge.' },
  modules: ['audio', 'document'],
  elements: [
    el('vocals.mic-stand', 3600, 3300, 'Voz'), // 0
    el('strings.guitar-acoustic', 3600, 2500, 'Guitarra', { suppliedBy: 'band' }), // 1
    el('furniture.chair', 3600, 2000, 'Silla'), // 2
    el('vocals.mic-stand', 4600, 3300, 'Segunda voz'), // 3
    el('monitor.wedge', 4000, 4500, 'Cuña'), // 4
    el('desk.digital', 4000, 7600, 'Mesa'), // 5
    el('pa.line', 500, 3800, 'PA izquierda', { suppliedBy: 'venue' }), // 6
    el('pa.line', 7500, 3800, 'PA derecha', { suppliedBy: 'venue' }), // 7
  ],
  channels: [ch('Voz', 'shure.sm58', 'Pie recto', false, 0), ch('Guitarra DI', 'radial.jdi', '', false, 1), ch('Guitarra micro', 'shure.sm81', 'Pie recto', true, 1), ch('Segunda voz', 'shure.sm58', 'Pie recto', false, 3)],
  outputs: [{ kind: 'wedge', element: 4 }, { kind: 'main', element: 6 }, { kind: 'main', element: 7 }],
  links: [{ from: 5, to: 6, signal: 'audio' }, { from: 5, to: 7, signal: 'audio' }, { from: 5, to: 4, signal: 'audio' }],
};

const dj: ShowPackage = {
  id: 'dj',
  name: { es: 'DJ', en: 'DJ' },
  description: { es: 'Mesa de DJ con ordenador, PA con subs y un micro de MC.', en: 'DJ booth with a laptop, PA with subs and an MC mic.' },
  modules: ['audio', 'computers', 'document'],
  elements: [
    el('dj.booth', 4000, 2200, 'Mesa de DJ', { suppliedBy: 'band' }), // 0
    el('control.laptop', 4000, 1700, 'Portátil', { suppliedBy: 'band', computer: { functions: ['sound'], os: 'macos', programs: [{ name: 'Rekordbox', use: 'Reproducción' }] } }), // 1
    el('vocals.mic-stand', 5300, 3000, 'MC'), // 2
    el('pa.line', 500, 3800, 'PA izquierda', { suppliedBy: 'venue' }), // 3
    el('pa.line', 7500, 3800, 'PA derecha', { suppliedBy: 'venue' }), // 4
    el('pa.sub', 1300, 4300, 'Sub izquierdo', { suppliedBy: 'venue' }), // 5
    el('pa.sub', 6700, 4300, 'Sub derecho', { suppliedBy: 'venue' }), // 6
  ],
  channels: [ch('DJ L', 'Salida de mesa DJ', '', false, 0), ch('DJ R', 'Salida de mesa DJ', '', false, 0), ch('MC', 'shure.sm58', 'Pie recto', false, 2)],
  outputs: [{ kind: 'main', element: 3 }, { kind: 'main', element: 4 }],
  links: [{ from: 1, to: 0, signal: 'audio', connector: 'USB' }, { from: 2, to: 0, signal: 'audio' }, { from: 0, to: 3, signal: 'audio' }, { from: 0, to: 4, signal: 'audio' }, { from: 3, to: 5, signal: 'audio', connector: 'Speakon' }, { from: 4, to: 6, signal: 'audio', connector: 'Speakon' }],
};

const conference: ShowPackage = {
  id: 'conference',
  name: { es: 'Conferencia', en: 'Conference' },
  description: { es: 'Atril, mesa de ponentes, diademas inalámbricas, pantalla y proyector.', en: 'Lectern, speakers table, wireless headsets, screen and projector.' },
  modules: ['audio', 'computers', 'video', 'document'],
  elements: [
    el('furniture.lectern', 1600, 3000, 'Atril'), // 0
    el('furniture.table', 5000, 3200, 'Mesa de ponentes'), // 1
    el('vocals.headset', 3000, 2500, 'Diadema 1'), // 2
    el('vocals.headset', 3800, 2500, 'Diadema 2'), // 3
    el('video.screen', 4000, 300, 'Pantalla', { suppliedBy: 'venue' }), // 4
    el('video.projector', 4000, 7000, 'Proyector', { suppliedBy: 'venue' }), // 5
    el('control.laptop', 1600, 3800, 'Portátil de presentación', { suppliedBy: 'band', computer: { functions: ['video', 'sound'], os: 'windows', programs: [{ name: 'PowerPoint', use: 'Diapositivas' }] } }), // 6
    el('desk.digital', 4000, 7600, 'Mesa'), // 7
    el('pa.line', 500, 3800, 'PA izquierda', { suppliedBy: 'venue' }), // 8
    el('pa.line', 7500, 3800, 'PA derecha', { suppliedBy: 'venue' }), // 9
  ],
  channels: [
    ch('Atril', 'sennheiser.e835', 'Cuello de cisne', false, 0),
    ch('Diadema 1', 'sennheiser.ew-dx', '', false, 2),
    ch('Diadema 2', 'sennheiser.ew-dx', '', false, 3),
    ch('Mesa 1', 'Micro de mesa', 'Cuello de cisne', false, 1),
    ch('Mesa 2', 'Micro de mesa', 'Cuello de cisne', false, 1),
    ch('Mesa 3', 'Micro de mesa', 'Cuello de cisne', false, 1),
    ch('Mesa 4', 'Micro de mesa', 'Cuello de cisne', false, 1),
    ch('Portátil L', 'Salida del portátil', '', false, 6),
    ch('Portátil R', 'Salida del portátil', '', false, 6),
  ],
  outputs: [{ kind: 'main', element: 8 }, { kind: 'main', element: 9 }],
  links: [{ from: 6, to: 5, signal: 'video', connector: 'HDMI' }, { from: 6, to: 7, signal: 'audio', connector: 'Jack' }, { from: 0, to: 7, signal: 'audio' }, { from: 2, to: 7, signal: 'audio', connector: 'Inalámbrico' }, { from: 3, to: 7, signal: 'audio', connector: 'Inalámbrico' }, { from: 7, to: 8, signal: 'audio' }, { from: 7, to: 9, signal: 'audio' }],
};

const theatre: ShowPackage = {
  id: 'theatre',
  name: { es: 'Teatro con micros de diadema', en: 'Theatre with headset mics' },
  description: { es: 'Ocho actores con diadema, patas y telón, ordenador de sonido y plano de luces básico.', en: 'Eight headset actors, legs and curtain, sound computer and a basic light plot.' },
  modules: ['audio', 'lights', 'computers', 'document'],
  elements: [
    ...Array.from({ length: 8 }, (_, i) => el('vocals.headset', 1500 + i * 700, 2800, `Actor ${i + 1}`)), // 0 a 7
    el('scenery.curtain', 800, 300, 'Pata izquierda'), // 8
    el('scenery.curtain', 7200, 300, 'Pata derecha'), // 9
    el('scenery.curtain', 4000, 200, 'Telón de fondo'), // 10
    el('control.laptop', 4000, 7400, 'Ordenador de sonido', { suppliedBy: 'band', computer: { functions: ['sound'], os: 'macos', programs: [{ name: 'QLab', use: 'Efectos y música' }] } }), // 11
    el('light.ellipsoidal', 1500, 1500, 'Recorte 1'), // 12
    el('light.ellipsoidal', 4000, 1500, 'Recorte 2'), // 13
    el('light.ellipsoidal', 6500, 1500, 'Recorte 3'), // 14
    el('light.fresnel', 2000, 3000, 'Fresnel 1'), // 15
    el('light.fresnel', 6000, 3000, 'Fresnel 2'), // 16
    el('desk.digital', 4000, 7600, 'Mesa'), // 17
    el('pa.line', 500, 3800, 'PA izquierda', { suppliedBy: 'venue' }), // 18
    el('pa.line', 7500, 3800, 'PA derecha', { suppliedBy: 'venue' }), // 19
    el('control.lightdesk', 5600, 7600, 'Mesa de luces'), // 20
    el('rack.dimmer', 7400, 700, 'Rack de dimmers'), // 21
  ],
  channels: [
    ...Array.from({ length: 8 }, (_, i) => ch(`Actor ${i + 1}`, 'sennheiser.ew-dx', '', false, i)),
    ch('Reserva 1', 'sennheiser.ew-dx', '', false),
    ch('Reserva 2', 'sennheiser.ew-dx', '', false),
    ch('Efectos L', 'Salida del ordenador', '', false, 11),
    ch('Efectos R', 'Salida del ordenador', '', false, 11),
  ],
  outputs: [{ kind: 'main', element: 18 }, { kind: 'main', element: 19 }],
  links: [{ from: 11, to: 17, signal: 'audio', connector: 'Jack' }, { from: 17, to: 18, signal: 'audio' }, { from: 17, to: 19, signal: 'audio' }, { from: 20, to: 21, signal: 'lightControl', connector: 'DMX' }],
};

const av: ShowPackage = {
  id: 'av',
  name: { es: 'Audiovisual y proyección', en: 'Audiovisual and projection' },
  description: { es: 'Pantalla, proyector, mesa de vídeo y un ordenador con programa de vídeo.', en: 'Screen, projector, video switcher and a computer running video software.' },
  modules: ['audio', 'computers', 'video', 'document'],
  elements: [
    el('video.screen', 4000, 300, 'Pantalla', { suppliedBy: 'venue' }), // 0
    el('video.projector', 4000, 7000, 'Proyector', { suppliedBy: 'venue' }), // 1
    el('control.videomixer', 5800, 7400, 'Mesa de vídeo'), // 2
    el('control.laptop', 4400, 7400, 'Ordenador de vídeo', { suppliedBy: 'band', computer: { functions: ['video', 'sound'], os: 'windows', programs: [{ name: 'Resolume', use: 'Vídeo en directo' }] } }), // 3
    el('vocals.mic-stand', 3200, 3500, 'Micro 1'), // 4
    el('vocals.mic-stand', 4800, 3500, 'Micro 2'), // 5
    el('desk.digital', 2600, 7600, 'Mesa'), // 6
    el('pa.line', 500, 3800, 'PA izquierda', { suppliedBy: 'venue' }), // 7
    el('pa.line', 7500, 3800, 'PA derecha', { suppliedBy: 'venue' }), // 8
  ],
  channels: [ch('Ordenador L', 'Salida del ordenador', '', false, 3), ch('Ordenador R', 'Salida del ordenador', '', false, 3), ch('Micro 1', 'shure.sm58', 'Pie recto', false, 4), ch('Micro 2', 'shure.sm58', 'Pie recto', false, 5)],
  outputs: [{ kind: 'main', element: 7 }, { kind: 'main', element: 8 }],
  links: [{ from: 3, to: 2, signal: 'video', connector: 'HDMI' }, { from: 2, to: 1, signal: 'video', connector: 'HDMI' }, { from: 3, to: 6, signal: 'audio', connector: 'Jack' }, { from: 4, to: 6, signal: 'audio' }, { from: 5, to: 6, signal: 'audio' }, { from: 6, to: 7, signal: 'audio' }, { from: 6, to: 8, signal: 'audio' }],
};

export const PACKAGES: ShowPackage[] = [rock, jazz, singer, dj, conference, theatre, av];
export const packageById = (id: string): ShowPackage | undefined => PACKAGES.find((p) => p.id === id);
