import { describe, expect, test } from 'vitest';
import { cleanSvg, MAX_SVG_BYTES } from './svg-clean.ts';

const ok = (s: string) => {
  const r = cleanSvg(s);
  if (!r.ok) throw new Error(`refused: ${r.error}`);
  return r.svg;
};

describe('svg sanitizer', () => {
  test('keeps shapes and builds new markup with constant strokes', () => {
    const svg = ok('<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50"><rect x="0" y="0" width="100" height="50" fill="#fff" stroke="#000" stroke-width="9"/><circle cx="50" cy="25" r="10" style="fill:#ccc;stroke:#000"/></svg>');
    expect(svg.viewBox).toEqual([0, 0, 100, 50]);
    expect(svg.markup).toContain('<rect x="0" y="0" width="100" height="50" fill="#fff" stroke="#000" stroke-width="1.5" vector-effect="non-scaling-stroke"/>');
    expect(svg.markup).toContain('fill="#ccc"');
    expect(svg.markup).not.toContain('stroke-width="9"');
    expect(svg.dropped).toBe(0);
  });
  test('width and height stand in for a missing viewBox', () => {
    expect(ok('<svg width="200px" height="100"><line x1="0" y1="0" x2="5" y2="5"/></svg>').viewBox).toEqual([0, 0, 200, 100]);
  });
  test('groups with transforms are kept, and their strokes stay constant', () => {
    const svg = ok('<svg viewBox="0 0 10 10"><g transform="translate(2 2) scale(2)" stroke="#000"><path d="M0 0 L5 5 Z"/></g></svg>');
    expect(svg.markup).toBe('<g transform="translate(2 2) scale(2)" stroke="#000"><path d="M0 0 L5 5 Z" stroke-width="1.5" vector-effect="non-scaling-stroke"/></g>');
  });
  test('nothing active survives: scripts, handlers, links, images, styles, text, use and foreign content', () => {
    const svg = ok(
      '<svg viewBox="0 0 10 10" onload="alert(1)"><script>alert(1)</script><style>rect{fill:url(http://x)}</style><a href="javascript:alert(1)"><rect width="5" height="5" onclick="x()" id="a" class="b"/></a><image href="http://evil/x.png" width="5" height="5"/><use href="#a"/><foreignObject><div>hi</div></foreignObject><text>hello</text><rect width="5" height="5" fill="url(#g)" stroke="javascript:1"/></svg>',
    );
    expect(svg.markup).toBe('<rect width="5" height="5" stroke-width="1.5" vector-effect="non-scaling-stroke"/>');
    for (const bad of ['script', 'onload', 'onclick', 'href', 'javascript', 'http', 'url(', 'image', 'text', 'style', 'class', 'id=']) expect(svg.markup).not.toContain(bad);
    expect(svg.dropped).toBeGreaterThanOrEqual(6);
  });
  test('an element that is not supported hides everything inside it', () => {
    const svg = ok('<svg viewBox="0 0 10 10"><switch><rect width="5" height="5"/></switch><defs><rect width="9" height="9"/></defs><rect width="1" height="1"/></svg>');
    expect(svg.markup).toBe('<rect width="1" height="1" stroke-width="1.5" vector-effect="non-scaling-stroke"/>');
  });
  test('bad values drop the shape instead of passing through', () => {
    const svg = ok(
      '<svg viewBox="0 0 10 10"><path d="M0 0 L5 5 &#x22; onload=1"/><rect width="50%" height="5"/><rect width="5" height="5" transform="rotate(1) url(x)"/><polygon points="0,0 5,0 5,5"/></svg>',
    );
    expect(svg.markup).toBe('<polygon points="0,0 5,0 5,5" stroke-width="1.5" vector-effect="non-scaling-stroke"/>');
    expect(svg.dropped).toBe(3);
    // A value that tries to close the tag is not read at all.
    expect(cleanSvg('<svg viewBox="0 0 1 1"><path d="M0 0"><script>x</script>"/></svg>').ok).toBe(false);
  });
  test('refuses what is not a plain SVG document', () => {
    const bad = (s: string) => {
      const r = cleanSvg(s);
      return r.ok ? 'ok' : r.error;
    };
    expect(bad('<!DOCTYPE svg [<!ENTITY x "y">]><svg viewBox="0 0 1 1"><rect width="1" height="1"/></svg>')).toBe('forbidden');
    expect(bad('<svg viewBox="0 0 1 1"><![CDATA[x]]><rect width="1" height="1"/></svg>')).toBe('forbidden');
    expect(bad('<svg viewBox="0 0 1 1"><?php echo 1 ?><rect width="1" height="1"/></svg>')).toBe('forbidden');
    expect(bad('<html><body>hi</body></html>')).toBe('notSvg');
    expect(bad('<svg viewBox="0 0 1 1"><rect width="1" height="1"></svg>')).toBe('notSvg');
    expect(bad('<svg viewBox="0 0 1 1"><rect width=1 height="1"/></svg>')).toBe('notSvg');
    expect(bad('<svg viewBox="0 0 1 1"><rect width="1" height="1"/></svg><script>x</script>')).toBe('notSvg');
    expect(bad('<svg viewBox="0 0 0 1"><rect width="1" height="1"/></svg>')).toBe('badBox');
    expect(bad('<svg><rect width="1" height="1"/></svg>')).toBe('badBox');
    expect(bad('<svg viewBox="0 0 1 1"><title>only a title</title></svg>')).toBe('empty');
    expect(bad(`<svg viewBox="0 0 1 1">${' '.repeat(MAX_SVG_BYTES)}</svg>`)).toBe('tooBig');
    expect(bad(`<svg viewBox="0 0 1 1">${'<rect width="1" height="1"/>'.repeat(2001)}</svg>`)).toBe('tooBig');
    expect(bad(`<svg viewBox="0 0 1 1">${'<g>'.repeat(20)}<rect width="1" height="1"/>${'</g>'.repeat(20)}</svg>`)).toBe('tooBig');
  });
  test('comments and a prolog are read past, and nothing of a comment is kept', () => {
    const svg = ok('<?xml version="1.0" encoding="UTF-8"?><!-- <script>alert(1)</script> --><svg viewBox="0 0 4 4"><!-- hi --><rect width="4" height="4"/></svg>');
    expect(svg.markup).not.toContain('script');
  });
});
