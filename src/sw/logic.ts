// Pure parts of the service worker, kept apart so they can be unit tested.

// Every cache this app owns starts with this. Other apps on the same github.io origin share
// CacheStorage, so cleanup must never touch a name without it.
export const CACHE_PREFIX = 'scaena-';

export const shellCacheName = (version: string): string => `${CACHE_PREFIX}shell-${version}`;
/** The Typst compiler (28 MB) is cached on first use, under a folder named by its version. */
export const typstCacheName = (version: string): string => `${CACHE_PREFIX}typst-${version}`;

export function cachesToDelete(existing: readonly string[], keep: readonly string[]): string[] {
  return existing.filter((name) => name.startsWith(CACHE_PREFIX) && !keep.includes(name));
}

/** `extra` adds headers for this response only, such as the page's Content Security Policy. */
export function withHeaders(response: Response, extra: Readonly<Record<string, string>>): Response {
  // Opaque responses cannot be rebuilt.
  if (response.type === 'opaque' || response.type === 'opaqueredirect') return response;
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(extra)) headers.set(name, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export type Route = 'navigation' | 'shell' | 'typst' | 'network' | 'ignore';

/** Decides how the service worker answers a request. `precache` holds paths relative to the scope. */
export function routeFor(request: { url: string; method: string; mode: string }, scope: string, precache: ReadonlySet<string>): Route {
  const url = new URL(request.url);
  const base = new URL(scope);
  if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) return 'ignore';
  const path = url.pathname.slice(base.pathname.length);
  if (request.method !== 'GET') return 'ignore';
  if (request.mode === 'navigate') return 'navigation';
  if (path.startsWith('typst/')) return 'typst';
  if (precache.has(path)) return 'shell';
  return 'network';
}
