// The page's side of the Typst worker: one compile at a time, the worker recycled every RECYCLE compilations,
// and the finished PDF fixed up so it opens with its title and keeps its tab order.
import type { WorkerReply, WorkerRequest } from './typst.worker.ts';

export const RECYCLE = 50;
const FONTS = ['Inter-Regular.ttf', 'Inter-Medium.ttf', 'Inter-Bold.ttf', 'JetBrainsMono-Regular.ttf', 'JetBrainsMono-Bold.ttf'];

let worker: Worker | null = null;
let ready: Promise<void> | null = null;
let used = 0;
let seq = 0;
const pending = new Map<number, { ok: (r: WorkerReply & { ok: true }) => void; fail: (e: Error) => void }>();
let chain: Promise<unknown> = Promise.resolve();

function fail(e: Error): void {
  for (const p of pending.values()) p.fail(e);
  pending.clear();
}

type Body<T> = T extends { id: number } ? Omit<T, 'id'> : never;

function send(msg: Body<WorkerRequest>, transfer: Transferable[] = []): Promise<WorkerReply & { ok: true }> {
  const id = ++seq;
  return new Promise((ok, failed) => {
    pending.set(id, { ok, fail: failed });
    worker!.postMessage({ ...msg, id } as WorkerRequest, transfer);
  });
}

function start(): Promise<void> {
  worker = new Worker(new URL('./typst.worker.ts', import.meta.url), { type: 'module' });
  worker.onmessage = (ev: MessageEvent<WorkerReply>) => {
    const p = pending.get(ev.data.id);
    if (!p) return;
    pending.delete(ev.data.id);
    if (ev.data.ok) p.ok(ev.data);
    else p.fail(new Error(ev.data.error));
  };
  worker.onerror = (e) => fail(new Error(e.message || 'worker error'));
  used = 0;
  const base = document.baseURI;
  return send({ cmd: 'init', wasm: new URL(`typst/${__TYPST_VERSION__}/compiler.wasm`, base).href, fonts: FONTS.map((f) => new URL(`typst/fonts/${f}`, base).href) }).then(() => undefined);
}

function recycle(): void {
  worker?.terminate();
  worker = null;
  ready = null;
}

/** Closes the worker, e.g. when leaving the document view for a long time. */
export const stopCompiler = recycle;

/** Compiles a Typst project to PDF bytes. Calls are queued; a failed one does not stop the next. */
export function compilePdf(source: string, files: Record<string, Uint8Array> = {}): Promise<Uint8Array> {
  const run = async () => {
    if (used >= RECYCLE) recycle();
    if (!worker || !ready) ready = start();
    try {
      await ready;
    } catch (e) {
      recycle();
      throw e;
    }
    used++;
    const copy = Object.fromEntries(Object.entries(files).map(([k, v]) => [k, v.slice()]));
    const r = await send({ cmd: 'compile', source, files: copy });
    if (!r.pdf) throw new Error('no PDF');
    return r.pdf;
  };
  const next = chain.then(run, run);
  chain = next.catch(() => undefined);
  return next;
}

/** Typst does not write DisplayDocTitle or /Tabs; both are needed for a PDF that reads well with assistive technology. */
export async function fixPdf(bytes: Uint8Array): Promise<Uint8Array> {
  // pdf-lib weighs about 400 KB: it loads when the first PDF is made, not with the app.
  const { PDFBool, PDFDict, PDFDocument, PDFName } = await import('pdf-lib');
  const doc = await PDFDocument.load(bytes, { updateMetadata: false });
  const root = doc.catalog;
  let prefs = root.lookup(PDFName.of('ViewerPreferences'), PDFDict);
  if (!prefs) {
    prefs = doc.context.obj({});
    root.set(PDFName.of('ViewerPreferences'), prefs);
  }
  prefs.set(PDFName.of('DisplayDocTitle'), PDFBool.True);
  for (const page of doc.getPages()) page.node.set(PDFName.of('Tabs'), PDFName.of('S'));
  return doc.save({ useObjectStreams: false });
}
