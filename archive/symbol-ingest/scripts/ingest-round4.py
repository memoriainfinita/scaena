"""Round 4 (sheets 75 to 81, 2026-11-11): writes symbols/<category>/<id>.svg from the traces and the new item lines
to src/library/items-icons.ts. Cut numbers that are not listed are leftovers (stray marks, the rebab bow, single drops)."""
import json, pathlib, re, sys
ROOT = pathlib.Path('D:/DOCS/CODELAB/0_draft/scaena')
TR = pathlib.Path(sys.argv[1])

# sheet -> list of (cut number, id)
M = {
    75: [(2, 'effect.co2'), (3, 'effect.dry-ice'), (4, 'effect.foam'), (5, 'effect.flash-pot'), (6, 'effect.rain'), (9, 'effect.balloon-drop'), (11, 'effect.air-dancer'), (12, 'effect.vortex')],
    76: [(1, 'scenery.main-curtain'), (2, 'scenery.main-curtain-open'), (3, 'scenery.border'), (4, 'scenery.cyc-cloth'), (5, 'scenery.legs-pair'), (6, 'scenery.traveller'), (7, 'scenery.fire-curtain'), (8, 'scenery.proscenium'), (9, 'scenery.cube'), (10, 'mach.counterweight'), (11, 'rig.bridge-front'), (12, 'rig.grid')],
    77: [(1, 'strings.bandurria'), (2, 'strings.cuatro'), (3, 'strings.tiple'), (4, 'strings.vihuela'), (5, 'strings.guitarron'), (6, 'strings.bajo-sexto'), (7, 'strings.tres'), (8, 'strings.mandola'), (9, 'strings.electric-violin'), (10, 'strings.kantele'), (11, 'strings.ngoni'), (12, 'strings.rebab')],
    78: [(1, 'perc.timpani'), (2, 'perc.marimba'), (3, 'perc.vibraphone'), (4, 'perc.bodhran'), (5, 'perc.castanets'), (6, 'perc.cabasa'), (7, 'perc.vibraslap'), (8, 'perc.rainstick'), (9, 'perc.bombo-leguero'), (10, 'perc.balafon'), (11, 'perc.ratchet'), (12, 'perc.crash')],
    79: [(1, 'winds.melodica'), (2, 'winds.cornet'), (3, 'winds.bugle'), (5, 'winds.alphorn'), (6, 'winds.cor-anglais'), (7, 'winds.contrabassoon'), (8, 'winds.bass-trombone'), (4, 'winds.jaw-harp'), (9, 'winds.slide-whistle')],
    80: [(1, 'stand.keyboard-x'), (2, 'stand.keyboard-z'), (3, 'stand.amp'), (4, 'stand.tablet'), (5, 'stand.pedalboard-riser'), (6, 'stand.sax'), (7, 'stand.horn'), (8, 'stand.cello'), (9, 'furniture.stool-back')],
    81: [(1, 'rack.stage-pocket'), (2, 'rack.floor-pocket'), (3, 'rack.wall-panel'), (4, 'rack.fanout'), (5, 'rack.paddle'), (6, 'rack.speaker-box')],
}
# id: (category, layer, es, en, w, d, h in mm)
N = {
    'effect.dry-ice': ('effect', 'lights', 'Máquina de hielo seco', 'Dry ice fogger', 600, 400, 400),
    'effect.foam': ('effect', 'lights', 'Máquina de espuma', 'Foam machine', 800, 600, 1000),
    'effect.flash-pot': ('effect', 'lights', 'Mortero de flash', 'Flash pot', 150, 150, 150),
    'effect.rain': ('effect', 'lights', 'Máquina de lluvia', 'Rain machine', 1000, 400, 300),
    'effect.balloon-drop': ('effect', 'lights', 'Red de globos', 'Balloon drop net', 2000, 1000, 1000),
    'effect.air-dancer': ('effect', 'lights', 'Muñeco hinchable', 'Inflatable air dancer', 600, 600, 3000),
    'effect.vortex': ('effect', 'lights', 'Cañón de anillos de humo', 'Smoke ring cannon', 400, 400, 400),
    'scenery.main-curtain': ('scenery', 'stage', 'Telón de boca', 'Main curtain', 6000, 400, 4000),
    'scenery.main-curtain-open': ('scenery', 'stage', 'Telón de boca abierto', 'Main curtain, drawn open', 6000, 400, 4000),
    'scenery.border': ('scenery', 'stage', 'Bambalina', 'Border', 6000, 300, 1000),
    'scenery.cyc-cloth': ('scenery', 'stage', 'Tela de ciclorama', 'Cyclorama cloth', 8000, 200, 4500),
    'scenery.legs-pair': ('scenery', 'stage', 'Pareja de patas', 'Pair of legs', 3000, 200, 4000),
    'scenery.traveller': ('scenery', 'stage', 'Telón de corredera', 'Traveller curtain', 6000, 300, 4000),
    'scenery.fire-curtain': ('scenery', 'stage', 'Telón cortafuegos', 'Fire curtain', 6000, 300, 5000),
    'scenery.proscenium': ('scenery', 'stage', 'Marco de proscenio', 'Proscenium frame', 8000, 600, 5000),
    'scenery.cube': ('scenery', 'stage', 'Cubo negro', 'Black cube', 500, 500, 500),
    'mach.counterweight': ('machinery', 'stage', 'Contrapeso de vara', 'Counterweight set', 600, 600, 3000),
    'rig.bridge-front': ('rigging', 'lights', 'Puente frontal', 'Front lighting bridge', 6000, 800, 2500),
    'rig.grid': ('rigging', 'lights', 'Peine', 'Grid', 3000, 2000, 150),
    'strings.bandurria': ('strings', 'audio', 'Bandurria', 'Bandurria', 200, 100, 600),
    'strings.cuatro': ('strings', 'audio', 'Cuatro venezolano', 'Venezuelan cuatro', 250, 100, 800),
    'strings.tiple': ('strings', 'audio', 'Tiple', 'Tiple', 300, 100, 900),
    'strings.vihuela': ('strings', 'audio', 'Vihuela mexicana', 'Mexican vihuela', 300, 150, 900),
    'strings.guitarron': ('strings', 'audio', 'Guitarrón mexicano', 'Guitarrón mexicano', 550, 250, 1100),
    'strings.bajo-sexto': ('strings', 'audio', 'Bajo sexto', 'Bajo sexto', 400, 150, 1100),
    'strings.tres': ('strings', 'audio', 'Tres cubano', 'Cuban tres', 350, 100, 900),
    'strings.mandola': ('strings', 'audio', 'Mandola', 'Mandola', 300, 150, 750),
    'strings.electric-violin': ('strings', 'audio', 'Violín eléctrico', 'Electric violin', 250, 100, 600),
    'strings.kantele': ('strings', 'audio', 'Kantele', 'Kantele', 700, 300, 100),
    'strings.ngoni': ('strings', 'audio', "N'goni", "N'goni", 250, 100, 900),
    'strings.rebab': ('strings', 'audio', 'Rebab', 'Rebab', 250, 100, 700),
    'perc.timpani': ('drums', 'audio', 'Timbales sinfónicos', 'Timpani set', 1600, 800, 900),
    'perc.marimba': ('drums', 'audio', 'Marimba', 'Marimba', 2000, 900, 1000),
    'perc.vibraphone': ('drums', 'audio', 'Vibráfono', 'Vibraphone', 1300, 800, 900),
    'perc.bodhran': ('drums', 'audio', 'Bodhrán', 'Bodhran', 450, 150, 450),
    'perc.castanets': ('drums', 'audio', 'Castañuelas', 'Castanets', 100, 100, 50),
    'perc.cabasa': ('drums', 'audio', 'Cabasa', 'Cabasa', 150, 150, 150),
    'perc.vibraslap': ('drums', 'audio', 'Vibraslap', 'Vibraslap', 150, 250, 150),
    'perc.rainstick': ('drums', 'audio', 'Palo de lluvia', 'Rainstick', 100, 800, 100),
    'perc.bombo-leguero': ('drums', 'audio', 'Bombo legüero', 'Bombo legüero', 500, 500, 600),
    'perc.balafon': ('drums', 'audio', 'Balafón', 'Balafon', 1200, 600, 700),
    'perc.ratchet': ('drums', 'audio', 'Carraca', 'Ratchet', 150, 250, 150),
    'perc.crash': ('drums', 'audio', 'Plato crash con pie', 'Crash cymbal on a stand', 450, 450, 1500),
    'winds.melodica': ('winds', 'audio', 'Melódica', 'Melodica', 400, 120, 120),
    'winds.cornet': ('winds', 'audio', 'Corneta', 'Cornet', 300, 120, 120),
    'winds.bugle': ('winds', 'audio', 'Clarín', 'Bugle', 300, 120, 120),
    'winds.alphorn': ('winds', 'audio', 'Alphorn', 'Alphorn', 1200, 1800, 400),
    'winds.cor-anglais': ('winds', 'audio', 'Corno inglés', 'English horn', 150, 800, 150),
    'winds.contrabassoon': ('winds', 'audio', 'Contrafagot', 'Contrabassoon', 500, 1300, 500),
    'winds.bass-trombone': ('winds', 'audio', 'Trombón bajo', 'Bass trombone', 350, 1300, 300),
    'winds.jaw-harp': ('winds', 'audio', 'Arpa de boca', 'Jaw harp', 120, 65, 10),
    'winds.slide-whistle': ('winds', 'audio', 'Flauta de émbolo', 'Slide whistle', 200, 350, 40),
    'stand.keyboard-x': ('furniture', 'audio', 'Soporte de teclado en X', 'Keyboard stand, X type', 1000, 400, 800),
    'stand.keyboard-z': ('furniture', 'audio', 'Soporte de teclado en Z', 'Keyboard stand, Z type', 1000, 450, 800),
    'stand.amp': ('furniture', 'audio', 'Soporte de ampli', 'Amp stand', 600, 400, 400),
    'stand.tablet': ('furniture', 'audio', 'Soporte de tableta', 'Tablet stand', 250, 250, 1200),
    'stand.pedalboard-riser': ('furniture', 'audio', 'Elevador de pedalera', 'Pedalboard riser', 800, 400, 150),
    'stand.sax': ('furniture', 'audio', 'Soporte de saxofón', 'Saxophone stand', 300, 300, 600),
    'stand.horn': ('furniture', 'audio', 'Soporte de trompa', 'Horn stand', 250, 250, 700),
    'stand.cello': ('furniture', 'audio', 'Soporte de violonchelo', 'Cello stand', 400, 400, 900),
    'furniture.stool-back': ('furniture', 'stage', 'Taburete con respaldo', 'Stool with backrest', 400, 400, 700),
    'rack.stage-pocket': ('rack', 'audio', 'Caja de escenario', 'Stage pocket', 200, 150, 100),
    'rack.floor-pocket': ('rack', 'audio', 'Caja de suelo de audio', 'Floor pocket', 250, 250, 50),
    'rack.wall-panel': ('rack', 'audio', 'Panel XLR de pared', 'Wall XLR panel', 300, 150, 20),
    'rack.fanout': ('rack', 'audio', 'Cola de abanico', 'Fan-out tail', 250, 250, 50),
    'rack.paddle': ('rack', 'audio', 'Antena de paleta', 'Antenna paddle', 200, 200, 1500),
    'rack.speaker-box': ('rack', 'audio', 'Caja de altavoz', 'Speaker cable box', 250, 200, 200),
}
src = (ROOT / 'src/library/items.ts').read_text(encoding='utf8') + ''.join((ROOT / 'src/library' / f).read_text(encoding='utf8') for f in ('items-more.ts', 'items-icons.ts'))
cat_of = dict(re.findall(r"id: '([^']+)', category: '([^']+)'", src))
lines, n = [], 0
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
            c, layer, es, en, w, d, h = N[i]
            q = lambda s: s.replace("'", "\\'")
            slug = i.split('.', 1)[1].replace('-', ' ')
            tags = sorted({es.lower(), en.lower(), slug})
            lines.append(f"  {{ id: '{i}', category: '{c}', layer: '{layer}', name: b('{q(es)}', '{q(en)}'), tags: [{', '.join(repr(t) if chr(39) not in t else chr(34) + t + chr(34) for t in tags)}], w: {w}, d: {d}, h: {h}, symbol: 'generic' }},")
print(n, 'svgs', len(lines), 'new items')
p = ROOT / 'src/library/items-icons.ts'
t = p.read_text(encoding='utf8')
i = t.rindex('];')
t = t[:i] + '\n'.join(lines) + '\n' + t[i:]
p.write_text(t, encoding='utf8', newline='')
