// Dialog to import a PDF or DXF as the plan background and to adjust it.
import { useRef, useState } from 'preact/hooks';
import { removeBackground, setBackgroundImage, updateBackground } from '../app/background-actions.ts';
import { tool } from '../app/plan-actions.ts';
import { session } from '../app/state.ts';
import { DxfError, parseDxf, renderDxf } from '../background/dxf.ts';
import { openPdf, type PdfDoc } from '../background/pdf.ts';
import { t } from '../i18n/index.ts';
import { Modal } from './Dialogs.tsx';

const MAX_BYTES = 25 * 1024 * 1024;

export function BackgroundDialog({ onClose }: { onClose: () => void }) {
  const show = session.value!.show.value;
  const bg = show.stage.background;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdf, setPdf] = useState<PdfDoc | null>(null);
  const [page, setPage] = useState(1);
  const input = useRef<HTMLInputElement>(null);

  const finish = () => {
    pdf?.destroy();
    onClose();
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setPdf(null);
    if (file.size > MAX_BYTES) return setError(t('bg.error.tooBig'));
    const name = file.name.toLowerCase();
    setBusy(true);
    try {
      if (name.endsWith('.pdf')) {
        const doc = await openPdf(new Uint8Array(await file.arrayBuffer()));
        if (doc.pages === 1) {
          const r = await doc.render(1);
          setBackgroundImage(r.png, r.widthMm, r.heightMm);
          doc.destroy();
          onClose();
        } else {
          setPdf(doc);
          setPage(1);
        }
      } else if (name.endsWith('.dxf')) {
        const r = await renderDxf(parseDxf(await file.text()));
        setBackgroundImage(r.png, r.widthMm, r.heightMm);
        onClose();
      } else {
        setError(t('bg.error.type'));
      }
    } catch (e) {
      if (e instanceof DxfError && e.code === 'empty') setError(t('bg.error.empty'));
      else if (e instanceof DxfError && e.code === 'tooMany') setError(t('bg.error.tooMany'));
      else setError(t('bg.error.read', { detail: e instanceof Error ? e.message : String(e) }));
    } finally {
      setBusy(false);
    }
  };

  const importPage = async () => {
    if (!pdf) return;
    setBusy(true);
    try {
      const r = await pdf.render(page);
      setBackgroundImage(r.png, r.widthMm, r.heightMm);
      pdf.destroy();
      onClose();
    } catch (e) {
      setError(t('bg.error.read', { detail: e instanceof Error ? e.message : String(e) }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={t('bg.title')} onClose={finish}>
      <div class="stack">
        <label class="field">
          {t('bg.choose')}
          <input ref={input} class="input" type="file" accept=".pdf,.dxf,application/pdf" disabled={busy} onChange={(e) => void onFile((e.currentTarget as HTMLInputElement).files?.[0])} />
        </label>
        {busy && (
          <p class="muted" role="status">
            {t('bg.busy')}
          </p>
        )}
        {error && (
          <p class="warn" role="alert">
            <span aria-hidden="true">⚠ </span>
            {error}
          </p>
        )}
        {pdf && (
          <div class="sub">
            <label class="field" style="flex:1">
              {t('bg.page')}
              <select class="input" value={page} onChange={(e) => setPage(Number((e.currentTarget as HTMLSelectElement).value))}>
                {Array.from({ length: pdf.pages }, (_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1} / {pdf.pages}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" class="btn primary" disabled={busy} onClick={() => void importPage()}>
              {t('bg.import')}
            </button>
          </div>
        )}
        {bg && (
          <fieldset class="bgbox">
            <legend>{t('bg.current')}</legend>
            <label class="field">
              {t('bg.opacity')}
              <input type="range" min="5" max="100" step="5" value={Math.round(bg.opacity * 100)} onChange={(e) => updateBackground({ opacity: Number((e.currentTarget as HTMLInputElement).value) / 100 })} />
            </label>
            <label class="check">
              <input type="checkbox" checked={bg.locked} onChange={(e) => updateBackground({ locked: (e.currentTarget as HTMLInputElement).checked })} />
              {t('bg.locked')}
            </label>
            <div class="grid2">
              <label class="field">
                {t('bg.x')}
                <input class="input mono" type="number" step="0.1" disabled={bg.locked} value={Math.round(bg.x) / 1000} onChange={(e) => updateBackground({ x: Math.round(Number((e.currentTarget as HTMLInputElement).value) * 1000) })} />
              </label>
              <label class="field">
                {t('bg.y')}
                <input class="input mono" type="number" step="0.1" disabled={bg.locked} value={Math.round(bg.y) / 1000} onChange={(e) => updateBackground({ y: Math.round(Number((e.currentTarget as HTMLInputElement).value) * 1000) })} />
              </label>
            </div>
            <div class="sub wrap">
              <button
                type="button"
                class="btn"
                disabled={bg.locked}
                onClick={() => {
                  tool.value = 'background';
                  onClose();
                }}
              >
                {t('bg.calibrate')}
              </button>
              <button
                type="button"
                class="btn"
                disabled={bg.locked}
                onClick={() => {
                  tool.value = 'bgmove';
                  onClose();
                }}
              >
                {t('bg.move')}
              </button>
              <button type="button" class="btn" onClick={() => removeBackground()}>
                {t('bg.remove')}
              </button>
            </div>
          </fieldset>
        )}
      </div>
    </Modal>
  );
}
