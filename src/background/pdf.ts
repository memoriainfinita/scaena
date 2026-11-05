// PDF background: pdf.js loaded only when the user imports one, rasterised to a PNG. The file never leaves the browser.
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { canvasToPng } from './png.ts';

export interface Rasterised {
  png: Uint8Array;
  /** The page's size on paper, in millimetres: the starting scale until the user calibrates. */
  widthMm: number;
  heightMm: number;
}

export interface PdfDoc {
  pages: number;
  render(page: number, maxPx?: number): Promise<Rasterised>;
  destroy(): void;
}

const PT_TO_MM = 25.4 / 72;

export async function openPdf(bytes: Uint8Array): Promise<PdfDoc> {
  const pdfjs = await import('pdfjs-dist/build/pdf.min.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  // pdf.js takes ownership of the buffer it is given, so it gets a copy.
  const task = pdfjs.getDocument({ data: bytes.slice() });
  const doc = await task.promise;
  return {
    pages: doc.numPages,
    async render(n, maxPx = 3200) {
      const page = await doc.getPage(n);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: Math.min(8, maxPx / Math.max(base.width, base.height)) });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('no 2d canvas');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      const png = await canvasToPng(canvas);
      page.cleanup();
      return { png, widthMm: base.width * PT_TO_MM, heightMm: base.height * PT_TO_MM };
    },
    destroy() {
      void task.destroy();
    },
  };
}
