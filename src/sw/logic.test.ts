import { expect, test } from 'vitest';
import { cachesToDelete, routeFor, shellCacheName, typstCacheName, withHeaders } from './logic.ts';

const scope = 'https://user.github.io/scaena/';
const pre = new Set(['index.html', 'assets/app-1.js']);
const req = (path: string, method = 'GET', mode = 'cors') => ({ url: scope + path, method, mode });

test('routes navigations, precached files, the Typst folder and the rest', () => {
  expect(routeFor(req('', 'GET', 'navigate'), scope, pre)).toBe('navigation');
  expect(routeFor(req('assets/app-1.js'), scope, pre)).toBe('shell');
  expect(routeFor(req('typst/0.7.0/compiler.wasm'), scope, pre)).toBe('typst');
  expect(routeFor(req('other.json'), scope, pre)).toBe('network');
});

test('ignores other origins, other paths on the same origin and non-GET requests', () => {
  expect(routeFor({ url: 'https://example.com/x.js', method: 'GET', mode: 'cors' }, scope, pre)).toBe('ignore');
  expect(routeFor({ url: 'https://user.github.io/other/x.js', method: 'GET', mode: 'cors' }, scope, pre)).toBe('ignore');
  expect(routeFor(req('assets/app-1.js', 'POST'), scope, pre)).toBe('ignore');
});

test('cleanup only removes our own old caches', () => {
  const keep = [shellCacheName('b'), typstCacheName('0.7.0')];
  const existing = [shellCacheName('a'), shellCacheName('b'), typstCacheName('0.7.0'), typstCacheName('0.6.0'), 'compositio-shell-x', 'other'];
  expect(cachesToDelete(existing, keep)).toEqual([shellCacheName('a'), typstCacheName('0.6.0')]);
});

test('adds headers to a response without touching its body', async () => {
  const r = withHeaders(new Response('hola', { status: 200, headers: { 'Content-Type': 'text/plain' } }), { 'Content-Security-Policy': "default-src 'self'" });
  expect(r.headers.get('Content-Security-Policy')).toBe("default-src 'self'");
  expect(r.headers.get('Content-Type')).toBe('text/plain');
  expect(await r.text()).toBe('hola');
});
