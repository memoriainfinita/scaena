"""Audit montages: every cut icon with the name the list expects at that position.
usage: audit.py <out-prefix> <sheet,sheet,...>   (2 x 2 sheets per image)"""
import re
import sys

from PIL import Image, ImageDraw

import pathlib
ROOT = pathlib.Path(__file__).resolve().parents[2].as_posix() + '/'
SP = ROOT + '.work/symbols/'


def names():
    txt = open(ROOT + 'docs/design/symbols-gpt-batches-2026-11-07.md', encoding='utf8').read()
    out = {}
    for m in re.finditer(r'^## Sheet (\d+)[^\n]*\n(.*?)(?=^## |\Z)', txt, re.S | re.M):
        rows = []
        for l in m.group(2).split('\n'):
            r = re.match(r'\| (\d+) \| ([^|]+) \|', l)
            if r:
                rows.append(r.group(2).strip())
        out[int(m.group(1))] = rows
    return out


NAMES = names()
CELL = 150
COLS = 4


def panel(sheet):
    import os
    files = sorted(f for f in os.listdir(SP + f'cut/{sheet}') if not f.startswith('_'))
    nm = NAMES.get(int(re.sub(r'\D', '', sheet)), [])
    rows = (len(files) + COLS - 1) // COLS
    im = Image.new('RGB', (COLS * CELL, rows * (CELL + 14) + 18), 'white')
    d = ImageDraw.Draw(im)
    d.text((2, 2), f'SHEET {sheet}  ({len(files)} icons, {len(nm)} listed)', fill=(0, 0, 200))
    for i, f in enumerate(files):
        c = Image.open(SP + f'cut/{sheet}/{f}').convert('RGB')
        c.thumbnail((CELL - 8, CELL - 8))
        x, y = (i % COLS) * CELL, (i // COLS) * (CELL + 14) + 18
        im.paste(c, (x + 4 + (CELL - 8 - c.width) // 2, y + 2 + (CELL - 8 - c.height) // 2))
        label = f'{i + 1} {nm[i] if i < len(nm) else "?"}'
        d.text((x + 3, y + CELL - 6), label[:30], fill=(200, 0, 0))
    return im


sheets = sys.argv[2].split(',')
per = 4
for k in range(0, len(sheets), per):
    ps = [panel(s) for s in sheets[k:k + per]]
    w = COLS * CELL
    cols = 2
    rowsn = (len(ps) + 1) // 2
    hs = [max(p.height for p in ps[r * 2:r * 2 + 2]) for r in range(rowsn)]
    out = Image.new('RGB', (cols * (w + 6), sum(hs) + 6 * rowsn), 'white')
    y = 0
    for r in range(rowsn):
        for c, p in enumerate(ps[r * 2:r * 2 + 2]):
            out.paste(p, (c * (w + 6), y))
        y += hs[r] + 6
    out.save(SP + f'{sys.argv[1]}{k // per + 1}.png')
print('ok')
