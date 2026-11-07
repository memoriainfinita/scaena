"""Cuts a sheet into icons by connected shapes, then separates touching icons at clean gaps.
usage: cut.py <sheet>[:dilate] ...  [--ops "m3+4;s2:h"]   writes cut/<sheet>/NN.png and _debug.png"""
import os
import re
import sys

import numpy as np
from PIL import Image, ImageDraw

import pathlib
ROOT = pathlib.Path(__file__).resolve().parents[2].as_posix() + '/'
SP = ROOT + '.work/symbols/'
F = 4


def label(mask):
    h, w = mask.shape
    lab = np.zeros((h, w), np.int32)
    n = 0
    for y0, x0 in zip(*np.nonzero(mask)):
        if lab[y0, x0]:
            continue
        n += 1
        lab[y0, x0] = n
        stack = [(y0, x0)]
        while stack:
            y, x = stack.pop()
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < h and 0 <= xx < w and mask[yy, xx] and not lab[yy, xx]:
                        lab[yy, xx] = n
                        stack.append((yy, xx))
    return lab, n


def dilate(m, r):
    out = m.copy()
    for _ in range(r):
        p = np.pad(out, 1)
        out = p[1:-1, 1:-1] | p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:] | p[:-2, :-2] | p[2:, 2:] | p[:-2, 2:] | p[2:, :-2]
    return out


def bbox(m):
    ys, xs = np.nonzero(m)
    return ys.min(), ys.max() + 1, xs.min(), xs.max() + 1


def valley(m, axis, lo=0.22, hi=0.78, gap=3):
    """Position of a clean gap (>= gap empty lines) across axis; None if there is none."""
    y0, y1, x0, x1 = bbox(m)
    sub = m[y0:y1, x0:x1]
    prof = sub.sum(axis=1 if axis == 'h' else 0)
    n = len(prof)
    best = None
    i = int(n * lo)
    while i < int(n * hi):
        if prof[i] == 0:
            j = i
            while j < n and prof[j] == 0:
                j += 1
            if j - i >= gap and (best is None or j - i > best[1] - best[0]):
                best = (i, j)
            i = j
        else:
            i += 1
    if best is None:
        return None
    return (y0 if axis == 'h' else x0) + (best[0] + best[1]) // 2


def split(m, axis, at):
    a, b = m.copy(), m.copy()
    if axis == 'h':
        a[at:, :] = False
        b[:at, :] = False
    else:
        a[:, at:] = False
        b[:, :at] = False
    return [x for x in (a, b) if x.sum() > 30]


def cut(sheet, d=1, ops='', auto=True):
    path = ROOT + f'assets/symbol-sheets/sheet-{sheet}.png'
    g = np.asarray(Image.open(path).convert('L'))
    ink = g < 140
    H, W = ink.shape
    h4, w4 = H // F, W // F
    small = ink[:h4 * F, :w4 * F].reshape(h4, F, w4, F).any(axis=(1, 3))
    lab, n = label(dilate(small, d))
    big = np.kron(lab, np.ones((F, F), np.int32))
    full = np.zeros((H, W), np.int32)
    full[:big.shape[0], :big.shape[1]] = big
    items = []
    for k in range(1, n + 1):
        m = (full == k) & ink
        if m.sum() > 30:
            items.append(m)
    areas = [m.sum() for m in items]
    top = max(areas)
    items = [m for m in items if m.sum() >= top * 0.004]
    # tiny leftovers join the nearest bigger shape
    med = sorted(m.sum() for m in items)[len(items) // 2]
    bigs = [m for m in items if m.sum() >= 0.06 * med]
    for m in [m for m in items if m.sum() < 0.06 * med]:
        by0, by1, bx0, bx1 = bbox(m)
        best, bd = None, 1e9
        for t, o in enumerate(bigs):
            oy0, oy1, ox0, ox1 = bbox(o)
            dy = max(oy0 - by1, by0 - oy1, 0)
            dx = max(ox0 - bx1, bx0 - ox1, 0)
            dd = (dx * dx + dy * dy) ** 0.5
            if dd < bd:
                best, bd = t, dd
        if best is not None and bd < 90:
            bigs[best] = bigs[best] | m
    items = bigs
    # a shape lying inside the box of another belongs to it
    changed = True
    while changed:
        changed = False
        for i, a in enumerate(items):
            ay0, ay1, ax0, ax1 = bbox(a)
            for j, b in enumerate(items):
                if i == j:
                    continue
                by0, by1, bx0, bx1 = bbox(b)
                if by0 >= ay0 - 10 and by1 <= ay1 + 10 and bx0 >= ax0 - 10 and bx1 <= ax1 + 10:
                    items[i] = a | b
                    items.pop(j)
                    changed = True
                    break
            if changed:
                break
    # touching icons: cut at clean gaps, but only shapes much bigger than the usual one
    if auto:
        med = sorted(m.sum() for m in items)[len(items) // 2]
        out = []
        for m in items:
            parts = [m]
            if m.sum() > 1.7 * med:
                done = False
                while not done:
                    done = True
                    nxt = []
                    for p in parts:
                        cand = None
                        for ax in ('h', 'v'):
                            v = valley(p, ax)
                            if v is not None:
                                pieces = split(p, ax, v)
                                if len(pieces) == 2 and min(x.sum() for x in pieces) > 0.12 * p.sum():
                                    cand = pieces
                                    break
                        if cand and p.sum() > 1.7 * med:
                            nxt += cand
                            done = False
                        else:
                            nxt.append(p)
                    parts = nxt
            out += parts
        items = out
    # reading order
    def cy(m):
        y0, y1, _, _ = bbox(m)
        return (y0 + y1) / 2
    items.sort(key=cy)
    rows = []
    for m in items:
        c = cy(m)
        h = bbox(m)[1] - bbox(m)[0]
        for r in rows:
            if abs(c - r['cy']) < 0.45 * r['h']:
                r['items'].append(m)
                r['cy'] = sum(cy(i) for i in r['items']) / len(r['items'])
                r['h'] = max(r['h'], h)
                break
        else:
            rows.append({'cy': c, 'h': h, 'items': [m]})
    ordered = [m for r in rows for m in sorted(r['items'], key=lambda m: bbox(m)[2])]
    slots = [[m] for m in ordered]  # operations use the numbers of the first listing
    for op in [o for o in ops.split(';') if o]:
        if op[0] == 'm':
            a, b = (int(x) - 1 for x in op[1:].split('+'))
            slots[a] = [np.logical_or.reduce(slots[a] + slots[b])]
            slots[b] = []
        elif op[0] == 's':
            idx, ax = op[1:].split(':')
            idx = int(idx) - 1
            v = valley(slots[idx][0], ax[0], 0.1, 0.9, 1)
            if v is not None:
                slots[idx] = split(slots[idx][0], ax[0], v)
        elif op[0] == 'x':
            slots[int(op[1:]) - 1] = []
    ordered = [m for sl in slots for m in sl]
    out = SP + f'cut/{sheet}/'
    os.makedirs(out, exist_ok=True)
    for f in os.listdir(out):
        os.remove(out + f)
    dbg = Image.open(path).convert('RGB')
    dr = ImageDraw.Draw(dbg)
    for i, m in enumerate(ordered, 1):
        y0, y1, x0, x1 = bbox(m)
        Image.fromarray(np.where(m[y0:y1, x0:x1], 0, 255).astype('uint8')).save(out + f'{i:02d}.png')
        dr.rectangle([x0, y0, x1, y1], outline=(255, 0, 0), width=2)
        dr.text((x0 + 4, y0 + 2), str(i), fill=(255, 0, 0))
    dbg.save(out + '_debug.png')
    return len(ordered)


def expected_counts():
    txt = open(ROOT + 'docs/design/symbols-gpt-batches-2026-11-07.md', encoding='utf8').read()
    out = {}
    for m in re.finditer(r'^## Sheet (\d+)[^\n]*\n(.*?)(?=^## |\Z)', txt, re.S | re.M):
        out[int(m.group(1))] = len([l for l in m.group(2).split('\n') if re.match(r'\| \d+ \|', l)])
    return out


if __name__ == '__main__':
    exp = expected_counts()
    ops = ''
    args = sys.argv[1:]
    if '--ops' in args:
        i = args.index('--ops')
        ops = args[i + 1]
        args = args[:i] + args[i + 2:]
    for a in args:
        s, _, d = a.partition(':')
        n = cut(s, int(d) if d else 1, ops)
        e = exp.get(int(re.sub(r'\D', '', s)), '?')
        print(s, 'found', n, 'expected', e, 'OK' if n == e else 'CHECK')
