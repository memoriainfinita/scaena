import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';
import { contentSecurityPolicy } from './build/csp.ts';
import { serviceWorker } from './build/sw-plugin.ts';
import { typstAssets, typstVersion } from './build/typst-plugin.ts';

const appVersion = (JSON.parse(readFileSync('package.json', 'utf8')) as { version: string }).version;

export default defineConfig({
  // Relative base: works on GitHub Pages under /scaena/ and from any other path.
  base: './',
  plugins: [contentSecurityPolicy(), typstAssets(), serviceWorker(typstVersion())],
  oxc: { jsx: { runtime: 'automatic', importSource: 'preact' } },
  define: { __APP_VERSION__: JSON.stringify(appVersion), __TYPST_VERSION__: JSON.stringify(typstVersion()) },
  worker: { format: 'es' },
  // Nothing inlined as data: URIs.
  build: { target: 'es2022', assetsInlineLimit: 0 },
  test: { include: ['src/**/*.test.{ts,tsx}'], environment: 'node' },
});
