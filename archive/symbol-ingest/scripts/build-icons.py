"""Writes src/library/icons/<sheet>.json with the kept icons only: { "<key>": [w, h, "<path>"] }.
usage: python scripts/symbols/build-icons.py   (after build-manifest.py)"""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
manifest = json.load(open(ROOT / 'assets/symbol-manifest.json', encoding='utf8'))
kept = {m['key'] for m in manifest}
out = ROOT / 'src/library/icons'
out.mkdir(parents=True, exist_ok=True)
for f in out.glob('*.json'):
    f.unlink()
total = 0
for f in sorted((ROOT / 'assets/symbol-traces').glob('*.json')):
    sheet = f.stem
    icons = {}
    for r in json.load(open(f)):
        key = f'{sheet}-{r["i"]:02d}'
        if key in kept:
            icons[key] = [r['w'], r['h'], r['d']]
    if icons:
        (out / f'{sheet}.json').write_text(json.dumps(icons, separators=(',', ':')), encoding='utf8')
        total += len(icons)
print(total, 'icons in', len(list(out.glob('*.json'))), 'files')
