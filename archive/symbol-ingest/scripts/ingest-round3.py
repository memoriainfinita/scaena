import json, pathlib, re
ROOT = pathlib.Path('D:/DOCS/CODELAB/0_draft/scaena')
TR = ROOT / '.work/ing/assets/symbol-traces'


def seq(ids):
    return [(i + 1, x) for i, x in enumerate(ids)]


# sheet -> list of (cut number, id)
M = {
    67: seq(['pa.compact-10', 'pa.top-12', 'pa.column', 'pa.line-ground', 'pa.cluster', 'pa.sub-dual', 'pa.sub-flown', 'pa.sub-stack', 'pa.lip-fill', 'pa.infill', 'pa.balcony', 'pa.horn']),
    68: seq(['pa.surround', 'pa.sub-15', 'pa.mini-line', 'pa.ceiling', 'pa.wall', 'monitor.wedge-12', 'monitor.wedge-dual', 'monitor.sidefill-stack', 'monitor.drum-sub', 'monitor.pole', 'monitor.rack-amp', 'monitor.cube']),
    69: seq(['vocals.lead', 'vocals.lead-wedge', 'vocals.backing-3', 'vocals.backing-2', 'vocals.songwriter', 'vocals.rapper', 'vocals.reader', 'vocals.narrator', 'vocals.opera', 'vocals.choir-12', 'vocals.quartet', 'vocals.beatbox']),
    # the cut numbers the row of seats 1 and the block of seats 2
    70: [(2, 'room.seats-block'), (1, 'room.seat-row')] + [(i + 3, x) for i, x in enumerate(['room.pit', 'room.booth', 'room.stage-door', 'room.dock', 'room.balcony-edge', 'room.wings', 'room.dressing', 'room.foh-tent', 'room.vomitory', 'room.box'])],
    71: seq(['power.distro-16', 'power.distro-32', 'power.distro-63', 'power.distro-125', 'power.transformer', 'power.battery', 'power.linkbox', 'power.floorbox', 'power.panel', 'power.changeover', 'power.tail', 'power.crossover']),
    72: seq(['desk.large-digital', 'desk.compact-digital', 'desk.rackmount', 'desk.table-8', 'desk.surface', 'rack.stagebox-48', 'rack.stagebox-16', 'rack.stagebox-fibre', 'rack.stagebox-wireless', 'desk.broadcast', 'rack.matrix', 'desk.monitor-ctrl']),
    73: seq(['light.mover-hybrid', 'light.pixel-tube', 'light.matrix', 'light.led-zoom', 'light.hmi', 'light.cyc-led', 'light.footlight', 'light.flood-ip', 'light.uplight-battery', 'light.led-screen', 'light.searchlight', 'light.led-par-mini']),
    74: seq(['rig.pipe', 'rig.clamp', 'rig.coupler', 'rig.motor-1t', 'rig.truss-tri', 'rig.truss-ladder', 'rig.baseplate', 'rig.goalpost', 'rig.pa-wing', 'rig.sleeve', 'rig.cable-tray', 'rig.safety', 'rig.hoist-rack']),
}
# id: (category, layer, es, en, w, d, h in mm, power in W)
N = {
    'pa.sub-15': ('pa', 'audio', 'Subgrave de 15 pulgadas', 'Subwoofer 15 in', 500, 600, 600, 800),
    'pa.mini-line': ('pa', 'audio', 'Mini line array de dos módulos', 'Mini line array, two modules', 600, 400, 900, 400),
    'pa.ceiling': ('pa', 'audio', 'Altavoz de techo', 'Ceiling speaker', 200, 200, 100, 50),
    'pa.wall': ('pa', 'audio', 'Altavoz de pared', 'Wall-mounted speaker', 250, 200, 300, 100),
    'monitor.wedge-12': ('monitor', 'audio', 'Monitor de suelo de 12 pulgadas', 'Floor monitor 12 in', 550, 350, 350, 300),
    'monitor.wedge-dual': ('monitor', 'audio', 'Cuña doble', 'Dual wedge monitor', 900, 450, 400, 500),
    'monitor.sidefill-stack': ('monitor', 'audio', 'Torre de side fill', 'Side fill stack', 800, 600, 1800, 800),
    'monitor.drum-sub': ('monitor', 'audio', 'Subgrave de batería', 'Drum subwoofer', 600, 600, 500, 800),
    'monitor.pole': ('monitor', 'audio', 'Monitor en pie', 'Monitor on a pole', 400, 400, 1400, 150),
    'monitor.rack-amp': ('monitor', 'audio', 'Rack de monitores con amplificadores', 'Stage monitor rack with amps', 550, 600, 700, 1500),
    'monitor.cube': ('monitor', 'audio', 'Cubo de monitor personal', 'Personal monitor cube', 300, 300, 500, 100),
    'vocals.lead': ('vocals', 'audio', 'Cantante principal, micro inalámbrico', 'Lead singer, wireless handheld', 600, 600, 1800, None),
    'vocals.lead-wedge': ('vocals', 'audio', 'Cantante sobre monitor, pie levantado', 'Singer on a wedge, foot up', 700, 600, 1800, None),
    'vocals.backing-3': ('vocals', 'audio', 'Coros: trío', 'Backing vocal trio', 1800, 600, 1800, None),
    'vocals.backing-2': ('vocals', 'audio', 'Coros: dúo', 'Backing vocal duo', 1200, 600, 1800, None),
    'vocals.songwriter': ('vocals', 'audio', 'Cantautor sentado con guitarra', 'Singer-songwriter seated with guitar', 700, 700, 1300, None),
    'vocals.rapper': ('vocals', 'audio', 'Rapero con dos micros', 'Rapper with two mics', 600, 600, 1800, None),
    'vocals.reader': ('vocals', 'audio', 'Lector de poesía en atril', 'Spoken word reader at a stand', 600, 600, 1700, None),
    'vocals.narrator': ('vocals', 'audio', 'Narrador sentado a una mesa', 'Narrator seated at a table', 800, 600, 1200, None),
    'vocals.opera': ('vocals', 'audio', 'Cantante de ópera', 'Opera singer', 700, 700, 1800, None),
    'vocals.choir-12': ('vocals', 'audio', 'Coro pequeño de doce voces', 'Small choir, twelve singers', 2500, 1200, 1800, None),
    'vocals.quartet': ('vocals', 'audio', 'Cuarteto vocal', 'Barbershop quartet', 1600, 600, 1800, None),
    'vocals.beatbox': ('vocals', 'audio', 'Beatboxer', 'Beatboxer', 600, 600, 1800, None),
    'room.seats-block': ('room', 'stage', 'Bloque de butacas', 'Block of seats', 4000, 3000, 0, None),
    'room.seat-row': ('room', 'stage', 'Fila de butacas', 'Row of seats', 3000, 600, 0, None),
    'room.pit': ('room', 'stage', 'Foso de orquesta', 'Orchestra pit', 8000, 2000, 0, None),
    'room.booth': ('room', 'stage', 'Cabina de control', 'Control booth', 3000, 2500, 0, None),
    'room.stage-door': ('room', 'stage', 'Puerta de escenario', 'Stage door', 1000, 300, 0, None),
    'room.dock': ('room', 'stage', 'Muelle de carga', 'Loading dock', 3000, 4000, 0, None),
    'room.balcony-edge': ('room', 'stage', 'Borde de balcón', 'Balcony edge', 8000, 1000, 0, None),
    'room.wings': ('room', 'stage', 'Calles y backstage', 'Wings, backstage area', 3000, 4000, 0, None),
    'room.dressing': ('room', 'stage', 'Camerino', 'Dressing room', 3000, 3000, 0, None),
    'room.foh-tent': ('room', 'stage', 'Carpa de FOH', 'FOH tent', 4000, 3000, 0, None),
    'room.vomitory': ('room', 'stage', 'Vomitorio, entrada de público', 'Vomitory, audience entrance', 2000, 1500, 0, None),
    'room.box': ('room', 'stage', 'Palco', 'Box seats', 2000, 2000, 0, None),
    'power.distro-16': ('power', 'electrical', 'Distribuidor de 16 A', 'Distro 16 A', 400, 300, 300, None),
    'power.distro-32': ('power', 'electrical', 'Distribuidor de 32 A', 'Distro 32 A', 500, 350, 300, None),
    'power.distro-63': ('power', 'electrical', 'Distribuidor de 63 A', 'Distro 63 A', 600, 400, 500, None),
    'power.distro-125': ('power', 'electrical', 'Distribuidor de 125 A', 'Distro 125 A', 800, 500, 800, None),
    'power.transformer': ('power', 'electrical', 'Transformador reductor', 'Step-down transformer', 400, 400, 350, None),
    'power.battery': ('power', 'electrical', 'Estación de batería', 'Battery power station', 400, 250, 300, None),
    'power.linkbox': ('power', 'electrical', 'Caja de conexión', 'Link box', 300, 200, 150, None),
    'power.floorbox': ('power', 'electrical', 'Caja de suelo', 'Floor box', 300, 200, 80, None),
    'power.panel': ('power', 'electrical', 'Panel de corriente de pared', 'Wall power panel', 500, 200, 300, None),
    'power.changeover': ('power', 'electrical', 'Conmutador de red', 'Changeover switch', 400, 300, 250, None),
    'power.tail': ('power', 'electrical', 'Manguera de red', 'Mains tail cable', 600, 200, 100, None),
    'power.crossover': ('power', 'electrical', 'Pasacables', 'Cable cross-over', 1000, 300, 60, None),
    'desk.large-digital': ('desk', 'audio', 'Mesa digital de gran formato', 'Large-format digital desk', 2000, 900, 400, 400),
    'desk.compact-digital': ('desk', 'audio', 'Mesa digital compacta', 'Compact digital desk', 600, 500, 250, 150),
    'desk.rackmount': ('desk', 'audio', 'Mezclador digital en rack', 'Rack-mount digital mixer', 480, 300, 100, 80),
    'desk.table-8': ('desk', 'audio', 'Mezclador de mesa de ocho canales', 'Eight-channel table mixer', 400, 350, 100, 30),
    'desk.surface': ('desk', 'audio', 'Superficie de control táctil', 'Touch control surface', 700, 500, 100, 40),
    'rack.stagebox-48': ('rack', 'audio', 'Stagebox de 48 canales', 'Stagebox 48 channels', 500, 400, 400, 120),
    'rack.stagebox-16': ('rack', 'audio', 'Stagebox de 16 canales', 'Stagebox 16 channels', 480, 300, 150, 60),
    'rack.stagebox-fibre': ('rack', 'audio', 'Stagebox de fibra', 'Fibre stagebox', 500, 350, 250, 80),
    'rack.stagebox-wireless': ('rack', 'audio', 'Stagebox inalámbrica', 'Wireless stagebox', 400, 300, 100, 60),
    'desk.broadcast': ('desk', 'audio', 'Mesa de retransmisión', 'Broadcast desk', 1200, 700, 250, 300),
    'rack.matrix': ('rack', 'audio', 'Rack de matriz y procesador', 'Matrix and processor rack', 550, 600, 700, 150),
    'desk.monitor-ctrl': ('desk', 'audio', 'Controlador de monitores', 'Monitor controller', 250, 200, 100, 10),
    'light.mover-hybrid': ('light', 'lights', 'Cabeza móvil híbrida', 'Hybrid moving head', 400, 400, 500, 350),
    'light.pixel-tube': ('light', 'lights', 'Tubo LED de píxeles', 'LED pixel tube', 1000, 80, 80, 60),
    'light.matrix': ('light', 'lights', 'Cegadora LED matricial', 'LED matrix blinder', 400, 400, 200, 600),
    'light.led-zoom': ('light', 'lights', 'Perfil LED con zoom', 'Zoom LED profile', 300, 550, 300, 300),
    'light.hmi': ('light', 'lights', 'Fresnel HMI', 'HMI fresnel', 400, 500, 400, 1200),
    'light.cyc-led': ('light', 'lights', 'Luz de cíclorama LED', 'LED cyc light', 500, 300, 250, 200),
    'light.footlight': ('light', 'lights', 'Batería de candilejas', 'Footlight', 1000, 200, 150, 150),
    'light.flood-ip': ('light', 'lights', 'Proyector de exterior', 'Outdoor flood', 350, 250, 300, 200),
    'light.uplight-battery': ('light', 'lights', 'Foco de suelo con batería', 'Battery uplight', 200, 200, 250, 20),
    'light.led-screen': ('light', 'lights', 'Panel de pantalla LED', 'LED screen panel', 500, 500, 100, 300),
    'light.searchlight': ('light', 'lights', 'Foco de haz (searchlight)', 'Searchlight beam', 400, 400, 600, 1000),
    'light.led-par-mini': ('light', 'lights', 'Mini PAR LED con pinza', 'Mini LED PAR on a clamp', 120, 120, 150, 30),
    'rig.pipe': ('rigging', 'lights', 'Barra con grapa', 'Fly pipe with clamp', 3000, 80, 150, None),
    'rig.clamp': ('rigging', 'lights', 'Acopladores y grapas', 'Couplers and clamps', 150, 150, 150, None),
    'rig.coupler': ('rigging', 'lights', 'Acoplador giratorio', 'Half coupler', 150, 150, 100, None),
    'rig.motor-1t': ('rigging', 'lights', 'Polipasto eléctrico de cadena de 1 t', 'Electric chain hoist 1 t', 400, 300, 500, 750),
    'rig.truss-tri': ('rigging', 'lights', 'Tramo de truss triangular', 'Triangle truss section', 3000, 300, 300, None),
    'rig.truss-ladder': ('rigging', 'lights', 'Tramo de truss en escalera', 'Ladder truss section', 3000, 200, 200, None),
    'rig.baseplate': ('rigging', 'lights', 'Placa base de truss', 'Truss base plate', 700, 700, 150, None),
    'rig.goalpost': ('rigging', 'lights', 'Pórtico de truss', 'Goalpost truss', 6000, 1000, 3000, None),
    'rig.pa-wing': ('rigging', 'lights', 'Torre de PA lateral', 'PA wing tower', 2000, 2000, 6000, None),
    'rig.sleeve': ('rigging', 'lights', 'Polea de desvío', 'Sleeve block', 300, 300, 400, None),
    'rig.cable-tray': ('rigging', 'lights', 'Bandeja de cables', 'Cable tray', 3000, 200, 150, None),
    'rig.safety': ('rigging', 'lights', 'Cable de seguridad', 'Safety cable', 300, 100, 50, None),
    'rig.hoist-rack': ('rigging', 'lights', 'Rack de control de polipastos', 'Hoist controller rack', 550, 600, 900, 200),
}
CHAN = {
    'vocals.lead': "ch('Voz', 'shure.ulxd', '')", 'vocals.lead-wedge': "ch('Voz', 'shure.ulxd', '')",
    'vocals.backing-3': "ch('Coro 1', 'shure.sm58', 'Pie recto'), ch('Coro 2', 'shure.sm58', 'Pie recto'), ch('Coro 3', 'shure.sm58', 'Pie recto')",
    'vocals.backing-2': "ch('Coro 1', 'shure.sm58', 'Pie recto'), ch('Coro 2', 'shure.sm58', 'Pie recto')",
    'vocals.songwriter': "ch('Voz', 'shure.sm58', 'Pie recto')", 'vocals.rapper': "ch('Voz 1', 'shure.ulxd', ''), ch('Voz 2', 'shure.ulxd', '')",
    'vocals.reader': "ch('Voz', 'shure.sm58', 'Pie recto')", 'vocals.narrator': "ch('Voz', 'shure.sm58', 'Pie de sobremesa')",
    'vocals.opera': "ch('Voz', 'shure.ulxd', '')", 'vocals.beatbox': "ch('Voz', 'shure.sm58', '')",
}
src = (ROOT / 'src/library/items.ts').read_text(encoding='utf8') + ''.join((ROOT / 'src/library' / f).read_text(encoding='utf8') for f in ('items-more.ts', 'items-icons.ts'))
cat_of = dict(re.findall(r"id: '([^']+)', category: '([^']+)'", src))
lines, power, n = [], [], 0
for sheet, rows in M.items():
    tr = {r['i']: r for r in json.load(open(TR / f'{sheet}.json'))}
    for k, i in rows:
        if i in N:
            assert i not in cat_of, i + ' exists'
            cat = N[i][0]
        else:
            assert i in cat_of, i + ' missing'
            cat = cat_of[i]
        r = tr[k]
        out = ROOT / 'symbols' / cat
        out.mkdir(parents=True, exist_ok=True)
        (out / f'{i}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {r["w"]} {r["h"]}" width="{r["w"]}" height="{r["h"]}"><path fill-rule="evenodd" d="{r["d"]}"/></svg>\n', encoding='utf8', newline='\n')
        n += 1
        if i in N:
            c, layer, es, en, w, d, h, pw = N[i]
            q = lambda s: s.replace("'", "\\'")
            slug = i.split('.', 1)[1].replace('-', ' ')
            tags = sorted({es.lower(), en.lower(), slug})
            chn = f", channels: [{CHAN[i]}]" if i in CHAN else ''
            lines.append(f"  {{ id: '{i}', category: '{c}', layer: '{layer}', name: b('{q(es)}', '{q(en)}'), tags: [{', '.join(repr(t) for t in tags)}], w: {w}, d: {d}, h: {h}, symbol: 'generic'{chn} }},")
            if pw:
                power.append(f"'{i}': {pw}")
print(n, 'svgs', len(lines), 'new items', len(power), 'powers')
p = ROOT / 'src/library/items-icons.ts'
t = p.read_text(encoding='utf8')
i = t.rindex('];')
t = t[:i] + '\n'.join(lines) + '\n' + t[i:]
p.write_text(t, encoding='utf8', newline='')
p = ROOT / 'src/library/items.ts'
t = p.read_text(encoding='utf8')
j = t.index('export const TYPICAL_POWER_W')
e = t.index('\n};', j)
t = t[:e] + '\n  // Added with the symbols of round 3.\n  ' + ', '.join(power) + ',' + t[e:]
p.write_text(t, encoding='utf8', newline='')
