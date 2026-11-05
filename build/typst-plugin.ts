// The Typst compiler (28 MB of WebAssembly) is not part of the app bundle: it is served from typst/<version>/compiler.wasm,
// which the service worker caches on first use instead of on install.
import { createReadStream, readFileSync } from 'node:fs';
import type { Plugin } from 'vite';

const WASM = 'node_modules/@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm';

export const typstVersion = (): string => (JSON.parse(readFileSync('node_modules/@myriaddreamin/typst.ts/package.json', 'utf8')) as { version: string }).version;

export function typstAssets(): Plugin {
  const version = typstVersion();
  const path = `typst/${version}/compiler.wasm`;
  return {
    name: 'scaena-typst',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.endsWith(path)) return next();
        res.setHeader('Content-Type', 'application/wasm');
        createReadStream(WASM).pipe(res);
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: path, source: readFileSync(WASM) });
    },
  };
}
