"""One-off: writes symbols/<category>/<item id>.svg from the sheet chunks and icon-map.ts (migration of 2026-11-08)."""
import json, pathlib, re
ROOT = pathlib.Path(__file__).resolve().parents[2]
icon_of = dict(re.findall(r"'([^']+)': '([^']+)'", (ROOT / 'src/library/icon-map.ts').read_text(encoding='utf8')))
cat_of = {}
for f in ('items.ts', 'items-more.ts', 'items-icons.ts'):
    for line in (ROOT / 'src/library' / f).read_text(encoding='utf8').split('\n'):
        m = re.search(r"id: '([^']+)', category: '([^']+)'", line)
        if m: cat_of[m.group(1)] = m.group(2)
chunks = {}
n = 0
for i, k in icon_of.items():
    sheet = k[:k.rindex('-')]
    if sheet not in chunks:
        chunks[sheet] = json.load(open(ROOT / 'src/library/icons' / f'{sheet}.json', encoding='utf8'))
    w, h, d = chunks[sheet][k]
    out = ROOT / 'symbols' / cat_of[i]
    out.mkdir(parents=True, exist_ok=True)
    (out / f'{i}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}"><path fill-rule="evenodd" d="{d}"/></svg>\n', encoding='utf8')
    n += 1
print(n, 'svgs', len(set(cat_of[i] for i in icon_of)), 'categories')
