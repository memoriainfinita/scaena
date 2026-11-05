// Drawing primitives shared by the symbol files: millimetres, strokes in screen pixels that do not scale with zoom.
export const S = 'stroke="#000" vector-effect="non-scaling-stroke"';
export const sw = (n: number) => `stroke-width="${n}"`;
export const n = (v: number) => Math.round(v * 10) / 10;

export const rect = (x: number, y: number, w: number, h: number, fill = '#fff') => `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${fill}" ${S} ${sw(1.5)}/>`;
export const circle = (cx: number, cy: number, r: number, fill = '#fff') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}" ${S} ${sw(1.5)}/>`;
export const ellipse = (cx: number, cy: number, rx: number, ry: number, fill = '#fff') => `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}" ${S} ${sw(1.5)}/>`;
export const line = (x1: number, y1: number, x2: number, y2: number, width = 1.5, dash = '') => `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" ${S} ${sw(width)}${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
export const path = (d: string, fill = 'none', width = 1.5, dash = '') => `<path d="${d}" fill="${fill}" ${S} ${sw(width)}${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
/** The thick front line, towards the audience. */
export const front = (w: number, d: number) => line(0, d, w, d, 4);
