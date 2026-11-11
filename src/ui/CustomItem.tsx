import { useState } from 'preact/hooks';
import { createCustomItem, deleteCustomItem, readDrawing } from '../app/custom-item-actions.ts';
import { session } from '../app/state.ts';
import { inUnits, lengthScale, lengthUnit, lengthValue, weightScale } from '../model/units.ts';
import { lang, t, type Key } from '../i18n/index.ts';
import type { CleanError, CleanSvg } from '../library/svg-clean.ts';
import { customItemUses } from '../model/custom-items.ts';
import { Modal } from './Dialogs.tsx';

const LAYERS = ['stage', 'audio', 'lights', 'electrical', 'control'] as const;
const num = (s: string): number | null => (s.trim() === '' || !Number.isFinite(Number(s)) ? null : Number(s));

/** Create an element of your own from an SVG drawing, and see or remove the ones this show already has. */
export function CustomItemDialog({ onClose }: { onClose: () => void }) {
  const show = session.value!.show.value;
  const [svg, setSvg] = useState<CleanSvg | null>(null);
  const [error, setError] = useState<CleanError | null>(null);
  const [name, setName] = useState('');
  const [w, setW] = useState('1');
  const [d, setD] = useState('1');
  const [h, setH] = useState('0');
  const [weight, setWeight] = useState('');
  const [power, setPower] = useState('');
  const [layer, setLayer] = useState<(typeof LAYERS)[number]>('stage');
  const [saved, setSaved] = useState('');
  const own = Object.values(show.customItems);
  const F = lengthScale(show.units);

  const onFile = async (file: File | undefined) => {
    setSaved('');
    if (!file) return;
    const r = readDrawing(new Uint8Array(await file.arrayBuffer()));
    if (!r.ok) {
      setSvg(null);
      setError(r.error);
      return;
    }
    setError(null);
    setSvg(r.svg);
    setName((cur) => cur || file.name.replace(/\.[^.]+$/, '').slice(0, 80));
    const [, , vw, vh] = r.svg.viewBox;
    const long = Math.max(vw, vh);
    setW(String(Math.round((vw / long) * 100) / 100));
    setD(String(Math.round((vh / long) * 100) / 100));
  };
  const wm = num(w);
  const dm = num(d);
  const hm = num(h);
  const valid = !!svg && name.trim() !== '' && wm !== null && wm >= 0.01 && dm !== null && dm >= 0.01 && hm !== null && hm >= 0;
  const save = () => {
    if (!svg || !valid) return;
    const id = createCustomItem({ name, svg, w: Math.round(wm! * F), d: Math.round(dm! * F), h: Math.round(hm! * F), weightKg: num(weight) === null ? null : num(weight)! * weightScale(show.units), powerW: num(power), layer });
    if (id) {
      setSaved(t('custom.saved', { name: name.trim() }));
      setSvg(null);
      setName('');
      setWeight('');
      setPower('');
    }
  };
  return (
    <Modal title={t('custom.title')} onClose={onClose}>
      <div class="stackS">
        <label class="field">
          {t('custom.file')}
          <input class="input" type="file" accept=".svg,image/svg+xml" onChange={(e) => void onFile((e.currentTarget as HTMLInputElement).files?.[0])} />
        </label>
        {error && (
          <span class="warn" role="alert">
            {t(`custom.err.${error}` as Key)}
          </span>
        )}
        {svg && (
          <>
            {svg.dropped > 0 && <span class="warn">{t('custom.dropped', { n: svg.dropped })}</span>}
            <span
              class="sym"
              role="img"
              aria-label={t('custom.preview')}
              style="width:96px;height:96px;display:block"
              dangerouslySetInnerHTML={{ __html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${svg.viewBox.join(' ')}" width="96" height="96" preserveAspectRatio="xMidYMid meet">${svg.markup}</svg>` }}
            />
            <label class="field">
              {t('custom.name')}
              <input class="input" value={name} maxLength={80} onInput={(e) => setName((e.currentTarget as HTMLInputElement).value)} />
            </label>
            <div class="grid2">
              <label class="field">
                {inUnits(t('custom.w'), show.units)}
                <input class="input mono" type="number" min="0.01" step="0.01" value={w} onInput={(e) => setW((e.currentTarget as HTMLInputElement).value)} />
              </label>
              <label class="field">
                {inUnits(t('custom.d'), show.units)}
                <input class="input mono" type="number" min="0.01" step="0.01" value={d} onInput={(e) => setD((e.currentTarget as HTMLInputElement).value)} />
              </label>
              <label class="field">
                {inUnits(t('custom.h'), show.units)}
                <input class="input mono" type="number" min="0" step="0.01" value={h} onInput={(e) => setH((e.currentTarget as HTMLInputElement).value)} />
              </label>
              <label class="field">
                {inUnits(t('custom.weight'), show.units)}
                <input class="input mono" type="number" min="0" step="0.1" value={weight} onInput={(e) => setWeight((e.currentTarget as HTMLInputElement).value)} />
              </label>
              <label class="field">
                {t('custom.power')}
                <input class="input mono" type="number" min="0" step="1" value={power} onInput={(e) => setPower((e.currentTarget as HTMLInputElement).value)} />
              </label>
              <label class="field">
                {t('custom.layer')}
                <select class="input" value={layer} onChange={(e) => setLayer((e.currentTarget as HTMLSelectElement).value as (typeof LAYERS)[number])}>
                  {LAYERS.map((l) => (
                    <option key={l} value={l}>
                      {t(`layer.${l}` as Key)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button type="button" class="btn primary" disabled={!valid} onClick={save}>
              {t('custom.save')}
            </button>
          </>
        )}
        {saved && <span role="status">{saved}</span>}
        {own.length > 0 && (
          <section aria-label={t('custom.list')}>
            <h2 style="font-size:13px">{t('custom.list')}</h2>
            {own.map((c) => {
              const uses = customItemUses(show, c.id);
              return (
                <div class="layer" key={c.id}>
                  <span style="flex:1">
                    {c.name} · {lengthValue(c.w, show.units, lang.value, 2)} × {lengthValue(c.d, show.units, lang.value, 2)} {lengthUnit(show.units)}
                  </span>
                  <button type="button" class="btn" disabled={uses > 0} title={uses > 0 ? t('custom.inUse', { name: c.name, n: uses }) : undefined} aria-label={t('custom.remove', { name: c.name })} onClick={() => deleteCustomItem(c.id)}>
                    {t('custom.delete')}
                  </button>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </Modal>
  );
}
