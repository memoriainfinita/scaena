// More library items. Sizes are typical real dimensions in millimetres; weight and power stay empty for generic types
// with no datasheet. Suggested channels use the microphones of models.ts and are only suggestions.
import type { Def } from './items.ts';
import type { Bilingual, SuggestedChannel } from './types.ts';

const b = (es: string, en: string): Bilingual => ({ es, en });
const ch = (name: string, mic: string, stand: string, phantom = false): SuggestedChannel => ({ name, mic, stand, phantom });

export const MORE_DEFS: Def[] = [
  // Percussion
  { id: 'perc.congas', category: 'drums', layer: 'audio', name: b('Congas', 'Congas'), tags: ['congas', 'percusión', 'percussion'], w: 900, d: 700, h: 762, symbol: 'congas', channels: [ch('Congas', 'sennheiser.e604', 'Pinza')] },
  { id: 'perc.cajon', category: 'drums', layer: 'audio', name: b('Cajón', 'Cajón'), tags: ['cajón', 'percusión', 'percussion'], w: 500, d: 600, h: 500, symbol: 'cajon', channels: [ch('Cajón', 'shure.sm57', 'Pie corto')] },
  { id: 'perc.table', category: 'drums', layer: 'audio', name: b('Mesa de percusión', 'Percussion table'), tags: ['percusión', 'mesa', 'shaker', 'percussion'], w: 1800, d: 900, h: 900, symbol: 'percussionTable', channels: [ch('Percusión L', 'akg.c414xlii', 'Pie largo', true), ch('Percusión R', 'akg.c414xlii', 'Pie largo', true)] },
  { id: 'kit.drums-electronic', category: 'drums', layer: 'audio', name: b('Batería electrónica', 'Electronic drum kit'), tags: ['batería electrónica', 'pads', 'electronic'], w: 1315, d: 1100, h: 1200, symbol: 'drumsElectronic', channels: [ch('Batería L', 'radial.jdi', ''), ch('Batería R', 'radial.jdi', '')] },

  // Guitars, bass and pedals
  { id: 'guitar.electric', category: 'guitar', layer: 'audio', name: b('Guitarrista eléctrico', 'Electric guitarist'), tags: ['guitarra eléctrica', 'guitarrista', 'electric guitar'], w: 900, d: 900, h: 1000, symbol: 'guitarist' },
  { id: 'guitar.bass', category: 'guitar', layer: 'audio', name: b('Bajista', 'Bass player'), tags: ['bajo', 'bajista', 'bass'], w: 900, d: 900, h: 1000, symbol: 'bassist' },
  { id: 'guitar.pedalboard', category: 'guitar', layer: 'audio', name: b('Pedalera', 'Pedalboard'), tags: ['pedalera', 'pedales', 'pedalboard'], w: 700, d: 350, h: 100, symbol: 'pedalboard' },
  { id: 'amp.stack', category: 'amp', layer: 'audio', name: b('Pantalla de guitarra 4×12', 'Guitar cabinet 4×12'), tags: ['pantalla', 'cabinet', 'stack', 'marshall', '4x12'], w: 770, d: 365, h: 755, symbol: 'ampStack', channels: [ch('Guitarra', 'shure.sm57', 'Pie corto')] },

  // Keys
  { id: 'keys.synth', category: 'keys', layer: 'audio', name: b('Sintetizador', 'Synthesizer'), tags: ['sintetizador', 'synth', 'teclado'], w: 1072, d: 333, h: 118, symbol: 'synth', channels: [ch('Synth L', 'radial.jdi', ''), ch('Synth R', 'radial.jdi', '')] },
  { id: 'keys.stage-piano', category: 'keys', layer: 'audio', name: b('Piano de escenario', 'Stage piano'), tags: ['piano de escenario', 'piano digital', 'stage piano'], w: 1412, d: 367, h: 140, symbol: 'stagePiano', channels: [ch('Piano L', 'radial.jdi', ''), ch('Piano R', 'radial.jdi', '')] },
  { id: 'keys.organ', category: 'keys', layer: 'audio', name: b('Órgano', 'Organ'), tags: ['órgano', 'hammond', 'organ'], w: 1308, d: 711, h: 965, symbol: 'organ', channels: [ch('Órgano L', 'radial.jdi', ''), ch('Órgano R', 'radial.jdi', '')] },

  // Strings
  { id: 'strings.violin', category: 'strings', layer: 'audio', name: b('Violín o viola', 'Violin or viola'), tags: ['violín', 'viola', 'violin'], w: 700, d: 700, h: 1000, symbol: 'violin', channels: [ch('Violín', 'shure.sm81', 'Pie recto', true)] },
  { id: 'strings.cello', category: 'strings', layer: 'audio', name: b('Violonchelo', 'Cello'), tags: ['violonchelo', 'chelo', 'cello'], w: 700, d: 900, h: 1100, symbol: 'cello', channels: [ch('Chelo', 'shure.sm81', 'Pie recto', true)] },
  { id: 'strings.harp', category: 'strings', layer: 'audio', name: b('Arpa', 'Harp'), tags: ['arpa', 'harp'], w: 900, d: 1000, h: 1800, symbol: 'harp', channels: [ch('Arpa', 'akg.c414xlii', 'Pie recto', true)] },

  // Winds
  { id: 'winds.sax', category: 'winds', layer: 'audio', name: b('Saxofón', 'Saxophone'), tags: ['saxofón', 'saxo', 'sax'], w: 600, d: 700, h: 1000, symbol: 'sax', channels: [ch('Saxo', 'sennheiser.e906', 'Pie recto')] },
  { id: 'winds.brass', category: 'winds', layer: 'audio', name: b('Trompeta', 'Trumpet'), tags: ['trompeta', 'metal', 'trumpet', 'brass'], w: 500, d: 700, h: 1000, symbol: 'brass', channels: [ch('Trompeta', 'sennheiser.e906', 'Pie recto')] },
  { id: 'winds.trombone', category: 'winds', layer: 'audio', name: b('Trombón', 'Trombone'), tags: ['trombón', 'metal', 'trombone', 'brass'], w: 600, d: 900, h: 1000, symbol: 'trombone', channels: [ch('Trombón', 'sennheiser.e906', 'Pie recto')] },
  { id: 'winds.flute', category: 'winds', layer: 'audio', name: b('Flauta o clarinete', 'Flute or clarinet'), tags: ['flauta', 'clarinete', 'flute', 'clarinet'], w: 600, d: 600, h: 1000, symbol: 'flute', channels: [ch('Flauta', 'shure.sm81', 'Pie recto', true)] },

  // Voices
  { id: 'vocals.handheld', category: 'vocals', layer: 'audio', name: b('Voz con micro de mano', 'Handheld vocal'), tags: ['micro de mano', 'inalámbrico', 'handheld', 'wireless'], w: 700, d: 700, h: 1000, symbol: 'handheld', channels: [ch('Voz', 'shure.ulxd', '')] },
  { id: 'vocals.choir', category: 'vocals', layer: 'audio', name: b('Coro en gradas', 'Choir on risers'), tags: ['coro', 'gradas', 'choir'], w: 4000, d: 2000, h: 1200, symbol: 'choir', channels: [ch('Coro L', 'akg.c414xlii', 'Pie largo', true), ch('Coro R', 'akg.c414xlii', 'Pie largo', true)] },

  // PA and monitors
  { id: 'pa.top', category: 'pa', layer: 'audio', name: b('Altavoz de PA', 'PA speaker'), tags: ['pa', 'altavoz', 'top', 'speaker'], w: 445, d: 380, h: 700, symbol: 'paTop' },
  { id: 'pa.front-fill', category: 'pa', layer: 'audio', name: b('Front fill', 'Front fill'), tags: ['front fill', 'relleno', 'frontal'], w: 400, d: 300, h: 300, symbol: 'frontFill' },
  { id: 'pa.delay', category: 'pa', layer: 'audio', name: b('Torre de delay', 'Delay tower'), tags: ['delay', 'torre', 'retardo'], w: 500, d: 500, h: 2500, symbol: 'delayTower' },
  { id: 'pa.compact-10', category: 'pa', layer: 'audio', name: b('Altavoz compacto de 10 pulgadas', 'Compact speaker 10 in'), tags: ['compacto', 'compact', '10', 'altavoz'], w: 320, d: 300, h: 519, symbol: 'paTop' },
  { id: 'pa.top-12', category: 'pa', layer: 'audio', name: b('Altavoz de 12 pulgadas', 'Point source 12 in'), tags: ['top 12', 'point source 12 in', '12', 'altavoz'], w: 356, d: 350, h: 602, symbol: 'paTop' },
  { id: 'pa.column', category: 'pa', layer: 'audio', name: b('Columna portátil', 'Portable column'), tags: ['columna', 'column', 'portátil', 'portable'], w: 318, d: 440, h: 2005, symbol: 'paLine' },
  { id: 'pa.line-ground', category: 'pa', layer: 'audio', name: b('Línea de array en suelo', 'Ground-stacked line array'), tags: ['array', 'línea', 'suelo', 'ground', 'stack'], w: 733, d: 500, h: 2400, symbol: 'paLine' },
  { id: 'pa.cluster', category: 'pa', layer: 'audio', name: b('Cluster central', 'Centre cluster'), tags: ['cluster', 'central', 'centre', 'center'], w: 900, d: 600, h: 1200, symbol: 'paTop' },
  { id: 'pa.sub-dual', category: 'pa', layer: 'audio', name: b('Subgrave doble de 18 pulgadas', 'Dual 18 in subwoofer'), tags: ['sub', 'subgrave', 'doble', 'dual', '18'], w: 1200, d: 800, h: 600, symbol: 'sub' },
  { id: 'pa.sub-flown', category: 'pa', layer: 'audio', name: b('Subgrave colgado', 'Flown subwoofer'), tags: ['sub', 'subgrave', 'colgado', 'flown'], w: 700, d: 728, h: 606, symbol: 'sub' },
  { id: 'pa.sub-stack', category: 'pa', layer: 'audio', name: b('Array de subgraves en suelo', 'Ground subwoofer array'), tags: ['sub', 'subgrave', 'array', 'suelo', 'ground'], w: 2400, d: 800, h: 600, symbol: 'sub' },
  { id: 'pa.lip-fill', category: 'pa', layer: 'audio', name: b('Lip fill', 'Lip fill'), tags: ['lip fill', 'relleno', 'borde'], w: 500, d: 250, h: 250, symbol: 'frontFill' },
  { id: 'pa.infill', category: 'pa', layer: 'audio', name: b('Infill', 'Infill'), tags: ['infill', 'relleno', 'lateral'], w: 350, d: 300, h: 500, symbol: 'frontFill' },
  { id: 'pa.balcony', category: 'pa', layer: 'audio', name: b('Altavoz de balcón', 'Under-balcony speaker'), tags: ['balcón', 'balcony', 'delay'], w: 300, d: 300, h: 300, symbol: 'frontFill' },
  { id: 'pa.horn', category: 'pa', layer: 'audio', name: b('Bocina', 'Horn'), tags: ['bocina', 'horn', 'trompeta'], w: 450, d: 450, h: 450, symbol: 'paTop' },
  { id: 'pa.surround', category: 'pa', layer: 'audio', name: b('Altavoz surround', 'Surround speaker'), tags: ['surround', 'envolvente'], w: 300, d: 300, h: 350, symbol: 'frontFill' },
  { id: 'monitor.sidefill', category: 'monitor', layer: 'audio', name: b('Side fill', 'Side fill'), tags: ['side fill', 'monitores laterales'], w: 700, d: 600, h: 1100, symbol: 'sideFill' },
  { id: 'monitor.drumfill', category: 'monitor', layer: 'audio', name: b('Drum fill', 'Drum fill'), tags: ['drum fill', 'monitor de batería'], w: 700, d: 600, h: 800, symbol: 'drumFill' },
  { id: 'rack.iem', category: 'rack', layer: 'audio', name: b('Rack de in-ears', 'IEM rack'), tags: ['in-ear', 'iem', 'rack', 'transmisores'], w: 550, d: 600, h: 600, symbol: 'iemRack' },
  { id: 'rack.wireless', category: 'rack', layer: 'audio', name: b('Rack de inalámbricos', 'Wireless rack'), tags: ['inalámbricos', 'receptores', 'wireless', 'antenas'], w: 550, d: 600, h: 600, symbol: 'iemRack' },
  { id: 'rack.amps', category: 'rack', layer: 'audio', name: b('Rack de amplificadores', 'Amplifier rack'), tags: ['amplificadores', 'etapas', 'amps', 'rack'], w: 600, d: 800, h: 900, symbol: 'ampRack' },
  { id: 'rack.fx', category: 'rack', layer: 'audio', name: b('Rack de efectos', 'FX rack'), tags: ['efectos', 'procesadores', 'fx', 'rack'], w: 550, d: 600, h: 900, symbol: 'fxRack' },
  { id: 'rack.network', category: 'rack', layer: 'control', name: b('Switch de red', 'Network switch'), tags: ['switch', 'red', 'router', 'network', 'dante'], w: 450, d: 250, h: 60, symbol: 'networkSwitch' },

  // Desks and DJ
  { id: 'desk.analog', category: 'desk', layer: 'audio', name: b('Mesa analógica', 'Analog desk'), tags: ['mesa analógica', 'analógica', 'analog'], w: 1008, d: 670, h: 278, symbol: 'deskAnalog' },
  { id: 'desk.monitor', category: 'desk', layer: 'audio', name: b('Mesa de monitores', 'Monitor desk'), tags: ['mesa de monitores', 'monitores', 'monitor desk'], w: 917, d: 627, h: 269, symbol: 'deskMonitor' },
  { id: 'dj.controller', category: 'dj', layer: 'audio', name: b('Controlador de DJ', 'DJ controller'), tags: ['controlador', 'dj', 'controller'], w: 800, d: 400, h: 100, symbol: 'djController' },
  { id: 'dj.turntables', category: 'dj', layer: 'audio', name: b('Giradiscos y mezclador', 'Turntables and mixer'), tags: ['giradiscos', 'vinilo', 'turntables', 'cdj'], w: 1300, d: 450, h: 150, symbol: 'turntables' },

  // People and furniture
  { id: 'person.seated', category: 'person', layer: 'stage', name: b('Persona sentada', 'Seated person'), tags: ['sentada', 'persona', 'seated'], w: 600, d: 600, h: 1000, symbol: 'seated' },
  { id: 'person.presenter', category: 'person', layer: 'stage', name: b('Presentador', 'Presenter'), tags: ['presentador', 'ponente', 'presenter', 'speaker'], w: 600, d: 600, h: 1700, symbol: 'presenter' },
  { id: 'furniture.stool', category: 'furniture', layer: 'stage', name: b('Taburete', 'Stool'), tags: ['taburete', 'banqueta', 'stool'], w: 400, d: 400, h: 650, symbol: 'stool' },
  { id: 'furniture.bench', category: 'furniture', layer: 'stage', name: b('Banco', 'Bench'), tags: ['banco', 'bench'], w: 1200, d: 400, h: 450, symbol: 'bench' },
  { id: 'furniture.cable-ramp', category: 'furniture', layer: 'stage', name: b('Pasacables', 'Cable ramp'), tags: ['pasacables', 'cables', 'rampa', 'ramp'], w: 1000, d: 300, h: 40, symbol: 'cableRamp' },
  { id: 'scenery.flat', category: 'scenery', layer: 'stage', name: b('Bastidor o decorado', 'Flat or set piece'), tags: ['bastidor', 'decorado', 'flat', 'set piece'], w: 2000, d: 100, h: 2400, symbol: 'flat' },
  { id: 'scenery.ladder', category: 'scenery', layer: 'stage', name: b('Escalera de mano', 'Ladder'), tags: ['escalera de mano', 'ladder'], w: 500, d: 1800, h: 1800, symbol: 'ladder' },

  // Power
  { id: 'power.distro', category: 'power', layer: 'electrical', name: b('Distribuidor de potencia', 'Power distro'), tags: ['distribuidor', 'potencia', 'distro', 'cuadro', 'power'], w: 600, d: 400, h: 500, symbol: 'powerDistro' },
  { id: 'power.strip', category: 'power', layer: 'electrical', name: b('Regleta', 'Power strip'), tags: ['regleta', 'ladrón', 'power strip', 'extension'], w: 500, d: 70, h: 40, symbol: 'powerStrip' },

  // Lights and effects
  { id: 'light.moving-spot', category: 'light', layer: 'lights', name: b('Móvil spot', 'Moving spot'), tags: ['móvil', 'spot', 'moving head', 'cabeza móvil'], w: 343, d: 409, h: 489, symbol: 'movingSpot' },
  { id: 'light.moving-wash', category: 'light', layer: 'lights', name: b('Móvil wash', 'Moving wash'), tags: ['móvil', 'wash', 'moving head', 'cabeza móvil'], w: 302, d: 302, h: 360, symbol: 'movingWash' },
  { id: 'light.beam', category: 'light', layer: 'lights', name: b('Beam', 'Beam'), tags: ['beam', 'haz', 'móvil'], w: 300, d: 350, h: 450, symbol: 'beam' },
  { id: 'light.led-bar', category: 'light', layer: 'lights', name: b('Barra LED', 'LED bar'), tags: ['barra led', 'led bar', 'tira led'], w: 1047, d: 185, h: 166, symbol: 'ledBar' },
  { id: 'light.blinder', category: 'light', layer: 'lights', name: b('Blinder', 'Blinder'), tags: ['blinder', 'deslumbrador', 'público'], w: 400, d: 220, h: 220, symbol: 'blinder' },
  { id: 'light.led-profile', category: 'light', layer: 'lights', name: b('Perfil LED', 'LED profile'), tags: ['perfil led', 'recorte led', 'led profile', 'ellipsoidal led'], w: 250, d: 500, h: 300, symbol: 'ledProfile' },
  { id: 'effect.laser', category: 'effect', layer: 'lights', name: b('Láser', 'Laser'), tags: ['láser', 'laser'], w: 400, d: 300, h: 250, symbol: 'laser' },
  { id: 'effect.mirror-ball', category: 'effect', layer: 'lights', name: b('Bola de espejos', 'Mirror ball'), tags: ['bola de espejos', 'espejos', 'mirror ball'], w: 500, d: 500, h: 500, symbol: 'mirrorBall' },
  { id: 'effect.co2', category: 'effect', layer: 'lights', name: b('Jet de CO2', 'CO2 jet'), tags: ['co2', 'jet', 'criogenia'], w: 250, d: 250, h: 250, symbol: 'co2Jet' },

  // Video and control
  { id: 'video.led-wall', category: 'video', layer: 'control', name: b('Pared LED', 'LED wall'), tags: ['pared led', 'led wall', 'pantalla led', 'led screen'], w: 4000, d: 150, h: 2500, symbol: 'ledWall' },
  { id: 'video.tv', category: 'video', layer: 'control', name: b('Monitor o televisor', 'Monitor or TV'), tags: ['televisor', 'monitor', 'tv', 'confidence'], w: 1000, d: 300, h: 600, symbol: 'tv' },
  { id: 'video.camera', category: 'video', layer: 'control', name: b('Cámara', 'Camera'), tags: ['cámara', 'camera', 'trípode', 'tripod'], w: 600, d: 600, h: 1500, symbol: 'camera' },
  { id: 'control.tablet', category: 'control', layer: 'control', name: b('Tablet de control', 'Control tablet'), tags: ['tablet', 'ipad', 'control remoto'], w: 280, d: 200, h: 20, symbol: 'tablet' },
  { id: 'control.server', category: 'control', layer: 'control', name: b('PC o servidor de medios', 'PC or media server'), tags: ['pc', 'servidor', 'media server', 'ordenador'], w: 450, d: 450, h: 150, symbol: 'server' },
];
