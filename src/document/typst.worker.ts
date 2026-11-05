// Runs the Typst compiler off the main thread. The page recycles this worker every 50 compilations: typst.ts 0.7.0 leaks
// about 4 MB of WebAssembly memory per compilation (docs/research/typst-medidas.md).
import { CompileFormatEnum, createTypstCompiler, type TypstCompiler } from '@myriaddreamin/typst.ts/compiler';
import { loadFonts } from '@myriaddreamin/typst.ts/options.init';

export type WorkerRequest = { id: number; cmd: 'init'; wasm: string; fonts: string[] } | { id: number; cmd: 'compile'; source: string; files: Record<string, Uint8Array> };
export type WorkerReply = { id: number; ok: true; pdf?: Uint8Array } | { id: number; ok: false; error: string };

let compiler: TypstCompiler | null = null;

const reply = (m: WorkerReply, transfer: Transferable[] = []) => (self as unknown as Worker).postMessage(m, transfer);

self.onmessage = async (ev: MessageEvent<WorkerRequest>) => {
  const req = ev.data;
  try {
    if (req.cmd === 'init') {
      const fonts = await Promise.all(req.fonts.map(async (u) => new Uint8Array(await (await fetch(u)).arrayBuffer())));
      compiler = createTypstCompiler();
      await compiler.init({ getModule: () => fetch(req.wasm), beforeBuild: [loadFonts(fonts, { assets: false })] });
      reply({ id: req.id, ok: true });
    } else {
      if (!compiler) throw new Error('compiler not started');
      compiler.resetShadow();
      compiler.addSource('/main.typ', req.source);
      for (const [path, bytes] of Object.entries(req.files)) compiler.mapShadow(path, bytes);
      const r = (await compiler.compile({ mainFilePath: '/main.typ', format: CompileFormatEnum.pdf, diagnostics: 'full' })) as { result?: Uint8Array; diagnostics?: unknown };
      const pdf = r?.result;
      if (!pdf || pdf.length < 5 || pdf[0] !== 0x25 || pdf[1] !== 0x50) throw new Error('Typst: ' + JSON.stringify(r?.diagnostics ?? r).slice(0, 1200));
      reply({ id: req.id, ok: true, pdf }, [pdf.buffer]);
    }
  } catch (e) {
    reply({ id: req.id, ok: false, error: e instanceof Error ? e.message : String(e) });
  }
};
