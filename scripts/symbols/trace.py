"""Traces the cut icons of a sheet to SVG paths (marching squares + Douglas-Peucker, even-odd).
usage: trace.py <sheet> [eps] [maxside]  -> assets/symbol-traces/<sheet>.json  (list of {i, w, h, d, bytes})"""
import json
import math
import os
import sys

import numpy as np
from PIL import Image

import pathlib
ROOT = pathlib.Path(__file__).resolve().parents[2].as_posix() + '/'
SP = ROOT + '.work/symbols/'
OUT = ROOT + 'assets/symbol-traces/'

TABLE = {
    1: [('l', 'b')], 2: [('b', 'r')], 3: [('l', 'r')], 4: [('t', 'r')], 5: None, 6: [('t', 'b')], 7: [('l', 't')],
    8: [('l', 't')], 9: [('t', 'b')], 10: None, 11: [('t', 'r')], 12: [('l', 'r')], 13: [('b', 'r')], 14: [('l', 'b')],
}


def marching(f, level=0.5):
    h, w = f.shape
    segs = []
    for y in range(h - 1):
        row0, row1 = f[y], f[y + 1]
        for x in range(w - 1):
            tl, tr, br, bl = row0[x], row0[x + 1], row1[x + 1], row1[x]
            idx = (tl > level) * 8 + (tr > level) * 4 + (br > level) * 2 + (bl > level) * 1
            if idx == 0 or idx == 15:
                continue
            edge = {
                't': (('h', y, x), (x + (level - tl) / (tr - tl), y)),
                'b': (('h', y + 1, x), (x + (level - bl) / (br - bl), y + 1)),
                'l': (('v', y, x), (x, y + (level - tl) / (bl - tl))),
                'r': (('v', y, x + 1), (x + 1, y + (level - tr) / (br - tr))),
            }
            if idx in (5, 10):
                centre = (tl + tr + br + bl) / 4 > level
                pairs = [('l', 't'), ('b', 'r')] if (idx == 5) != centre else [('t', 'r'), ('l', 'b')]
            else:
                pairs = TABLE[idx]
            for p, q in pairs:
                segs.append((edge[p], edge[q]))
    return segs


def loops(segs):
    adj, pos = {}, {}
    for (ea, pa), (eb, pb) in segs:
        adj.setdefault(ea, []).append(eb)
        adj.setdefault(eb, []).append(ea)
        pos[ea], pos[eb] = pa, pb
    seen, out = set(), []
    for start in adj:
        if start in seen:
            continue
        loop = [start]
        seen.add(start)
        prev, cur = None, start
        while True:
            nxt = [n for n in adj[cur] if n != prev and n not in seen]
            if not nxt:
                break
            prev, cur = cur, nxt[0]
            seen.add(cur)
            loop.append(cur)
        if len(loop) >= 4:
            out.append([pos[e] for e in loop])
    return out


def rdp(pts, eps):
    if len(pts) < 3:
        return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1
    norm = math.hypot(dx, dy) or 1e-9
    best, bi = -1, 0
    for i in range(1, len(pts) - 1):
        d = abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / norm
        if d > best:
            best, bi = d, i
    if best <= eps:
        return [pts[0], pts[-1]]
    return rdp(pts[: bi + 1], eps)[:-1] + rdp(pts[bi:], eps)


def simplify_loop(pts, eps):
    n = len(pts)
    far = max(range(n), key=lambda k: (pts[k][0] - pts[0][0]) ** 2 + (pts[k][1] - pts[0][1]) ** 2)
    a1 = rdp(pts[0: far + 1], eps)
    a2 = rdp(pts[far:] + [pts[0]], eps)
    return a1[:-1] + a2[:-1]


def trace_image(im, eps=0.8, maxside=420):
    im = im.convert('L')
    w, h = im.size
    k = min(1.0, maxside / max(w, h))
    if k < 1:
        im = im.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS)
    a = 1.0 - np.asarray(im, dtype=np.float32) / 255.0
    f = np.pad(a, 2, constant_values=0.0)
    k3 = np.array([1, 2, 1], dtype=np.float32) / 4
    f = np.apply_along_axis(lambda r: np.convolve(r, k3, mode='same'), 1, f)
    f = np.apply_along_axis(lambda r: np.convolve(r, k3, mode='same'), 0, f)
    ls = [simplify_loop(l, eps) for l in loops(marching(f))]
    ls = [l for l in ls if len(l) >= 3 and abs(sum(l[i][0] * l[(i + 1) % len(l)][1] - l[(i + 1) % len(l)][0] * l[i][1] for i in range(len(l)))) / 2 >= 5]
    d = ''.join('M' + 'L'.join(f'{round(x - 2, 1):g} {round(y - 2, 1):g}' for x, y in l) + 'Z' for l in ls)
    return {'w': f.shape[1] - 4, 'h': f.shape[0] - 4, 'd': d, 'bytes': len(d), 'loops': len(ls)}


if __name__ == '__main__':
    sheet = sys.argv[1]
    eps = float(sys.argv[2]) if len(sys.argv) > 2 else 0.8
    maxside = int(sys.argv[3]) if len(sys.argv) > 3 else 420
    src = SP + f'cut/{sheet}/'
    res = []
    for f in sorted(os.listdir(src)):
        if f.startswith('_'):
            continue
        r = trace_image(Image.open(src + f), eps, maxside)
        r['i'] = int(f[:2])
        res.append(r)
    os.makedirs(OUT, exist_ok=True)
    json.dump(res, open(OUT + f'{sheet}.json', 'w'))
    print(sheet, len(res), 'icons, bytes:', [r['bytes'] for r in res])
