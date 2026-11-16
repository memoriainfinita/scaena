"""Round 5 (sheets 82 and 83, 2026-11-16): writes symbols/<category>/<id>.svg from the traces. Sheet 82 replaces the
13 stand icons that showed the instrument; sheet 83 gives an icon to the webcam, tripods and selfie stick."""
import json, pathlib
ROOT = pathlib.Path('D:/DOCS/CODELAB/2_finished/scaena')
TR = pathlib.Path('C:/Users/mykl/AppData/Local/Temp/claude/df96b491f9a7489a/e5df9fe1-5240-4515-9a56-53203b370b5e/scratchpad/ing/assets/symbol-traces')
M = {
    82: ('furniture', ['stand.guitar', 'stand.guitar-single', 'stand.guitar-a', 'stand.guitar-hanger', 'stand.keyboard-x', 'stand.keyboard-z', 'stand.amp', 'stand.tablet', 'stand.pedalboard-riser', 'stand.sax', 'stand.horn', 'stand.cello', 'stand.instrument-rack']),
    83: (None, ['video.webcam', 'video.tripod-camera', 'video.tripod-wheels', 'video.tripod-mini', 'video.tripod-phone', 'video.tripod-flex', 'video.monopod', 'video.copy-stand', 'video.selfie-stick', 'light.ring-tripod']),
}
n = 0
for sheet, (cat, ids) in M.items():
    res = {r['i']: r for r in json.load(open(TR / f'{sheet}.json'))}
    for i, id_ in enumerate(ids, 1):
        r = res[i]
        folder = cat or id_.split('.')[0]
        out = ROOT / 'symbols' / folder
        out.mkdir(parents=True, exist_ok=True)
        (out / f'{id_}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {r["w"]} {r["h"]}" width="{r["w"]}" height="{r["h"]}"><path fill-rule="evenodd" d="{r["d"]}"/></svg>\n', encoding='utf8', newline='\n')
        n += 1
print(n, 'svgs')
