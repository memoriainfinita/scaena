"""Builds assets/symbol-manifest.json: every kept icon with its name, proposed id and size.
Reads assets/symbol-traces/*.json (traced paths), scripts/symbols/selection.json and the sheet lists in
docs/design/symbols-gpt-batches-2026-11-07.md.  usage: python scripts/symbols/build-manifest.py"""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[2]
sel = json.load(open(ROOT / 'scripts/symbols/selection.json', encoding='utf8'))
kept = set(sel['kept'])
txt = (ROOT / 'docs/design/symbols-gpt-batches-2026-11-07.md').read_text(encoding='utf8')

lists = {}
for m in re.finditer(r'^## Sheet (\d+)[^\n]*\n(.*?)(?=^## |\Z)', txt, re.S | re.M):
    rows = []
    for line in m.group(2).split('\n'):
        r = re.match(r'\| (\d+) \| ([^|]+) \| `([^`]+)` \| ([^|]+) \|', line)
        if r:
            rows.append((re.sub(r' \(replaces [^)]*\)', '', r.group(2).strip()), r.group(3), r.group(4).strip()))
    lists[int(m.group(1))] = rows

out = []
for f in sorted((ROOT / 'assets/symbol-traces').glob('*.json')):
    sheet = f.stem
    num = int(re.sub(r'\D', '', sheet))
    rows = lists.get(num, [])
    for r in json.load(open(f)):
        i = r['i']
        key = f'{sheet}-{i:02d}'
        if key not in kept:
            continue
        size = ''
        if sheet in sel['specials']:
            name, pid = sel['specials'][sheet]
        elif key in sel['specials']:
            name, pid = sel['specials'][key]
        elif sheet == '07':
            name, pid = sel['sheet07'][i - 1], ''
        else:
            perm = sel['perms'].get(sheet)
            k = (perm[i - 1] if perm else i) - 1
            name, pid, size = rows[k] if k < len(rows) else ('?', '', '')
        out.append({'key': key, 'sheet': sheet, 'name': name, 'pid': pid, 'size': size, 'w': r['w'], 'h': r['h']})
json.dump(out, open(ROOT / 'assets/symbol-manifest.json', 'w', encoding='utf8'), indent=0, ensure_ascii=False)
print(len(out), 'icons')
print('without name:', [o['key'] for o in out if o['name'] == '?'])
