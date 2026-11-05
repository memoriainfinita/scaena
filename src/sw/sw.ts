// Service worker: offline app shell, the Typst compiler cached on first use, a Content Security Policy header,
// and updates that wait until the user accepts them.
import { cachesToDelete, routeFor, shellCacheName, typstCacheName, withHeaders } from './logic.ts';

declare const self: ServiceWorkerGlobalScope;
// Filled in at build time by build/sw-plugin.ts.
declare const __PRECACHE__: string[];
declare const __VERSION__: string;
declare const __TYPST__: string;
declare const __CSP__: string;

const SHELL = shellCacheName(__VERSION__);
const TYPST = typstCacheName(__TYPST__);
const precache = new Set(__PRECACHE__);
const scopeUrl = (path: string) => new URL(path, self.registration.scope).href;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL).then((cache) =>
      // 'reload' skips the HTTP cache so index.html and its assets come from the same deploy.
      cache.addAll([...precache].map((path) => new Request(scopeUrl(path), { cache: 'reload' }))),
    ),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(cachesToDelete(names, [SHELL, TYPST]).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'skip-waiting') void self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const route = routeFor(event.request, self.registration.scope, precache);
  if (route === 'ignore') return;
  // The page gets its policy as a header too: only a header can forbid framing it.
  event.respondWith(respond(event.request, route).then((r) => (route === 'navigation' ? withHeaders(r, { 'Content-Security-Policy': __CSP__ }) : r)));
});

async function respond(request: Request, route: string): Promise<Response> {
  // The shell is cached by exact URL. Vary is ignored so a module request with another Origin still hits.
  if (route === 'navigation') {
    const cached = await caches.match(scopeUrl('index.html'), { cacheName: SHELL, ignoreVary: true });
    return cached ?? fetch(request);
  }
  if (route === 'shell') return (await caches.match(request, { cacheName: SHELL, ignoreVary: true })) ?? fetch(request);
  if (route === 'typst') {
    const cache = await caches.open(TYPST);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  }
  return fetch(request);
}
