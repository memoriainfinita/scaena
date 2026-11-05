// Inspector sections for a computer element and for the connections of any element.
import { useState } from 'preact/hooks';
import { addComputerOutput, addProgram, dropConnection, removeComputerOutput, removeProgram, setComputerOutput, setConnection, setFunction, setProgramUse, changeComputer } from '../app/computer-actions.ts';
import { lang, t, type Key } from '../i18n/index.ts';
import { itemById } from '../library/items.ts';
import { incompatiblePrograms, suggestPrograms } from '../library/programs.ts';
import { connectionsOf, SIGNALS } from '../model/connections.ts';
import type { Computer, PlanElement, Show } from '../model/schema.ts';

const FUNCTIONS = ['sound', 'video', 'lights', 'network'] as const;
const OSES = ['windows', 'macos', 'linux', 'other'] as const;
const CONNECTORS = ['hdmi', 'displayport', 'usbAudio', 'dante', 'dmx', 'midi', 'other'] as const;

export const elementName = (el: PlanElement | undefined): string => (el ? el.label || itemById(el.type.id)?.name[lang.value] || el.type.id : '');

export function ComputerPanel({ el, c }: { el: PlanElement; c: Computer }) {
  const [draft, setDraft] = useState('');
  const warnings = incompatiblePrograms(
    c.os,
    c.programs.map((p) => p.name),
  );
  const list = new Intl.ListFormat(lang.value, { style: 'long', type: 'conjunction' });
  const add = () => {
    addProgram(el.id, draft);
    setDraft('');
  };
  return (
    <div class="panel">
      <h2>{t('computer.title')}</h2>
      <fieldset class="checks">
        <legend>{t('computer.functions')}</legend>
        {FUNCTIONS.map((f) => (
          <label key={f}>
            <input type="checkbox" checked={c.functions.includes(f)} disabled={c.functions.length === 1 && c.functions.includes(f)} onChange={(e) => setFunction(el.id, f, (e.currentTarget as HTMLInputElement).checked)} />
            {t(`fn.${f}` as Key)}
          </label>
        ))}
      </fieldset>
      <label class="field">
        {t('computer.os')}
        <select class="input" value={c.os} onChange={(e) => changeComputer(el.id, (x) => ({ ...x, os: (e.currentTarget as HTMLSelectElement).value as Computer['os'] }))}>
          {OSES.map((o) => (
            <option key={o} value={o}>
              {t(`os.${o}` as Key)}
            </option>
          ))}
        </select>
      </label>
      <div class="field">
        {t('computer.programs')}
        {c.programs.map((p, i) => (
          <div class="sub" key={`${p.name}-${i}`}>
            <strong>{p.name}</strong>
            <input class="input" aria-label={`${t('computer.use')} · ${p.name}`} value={p.use} maxLength={200} onChange={(e) => setProgramUse(el.id, i, (e.currentTarget as HTMLInputElement).value)} />
            <button type="button" class="pbtn" aria-label={t('computer.removeProgram', { name: p.name })} title={t('computer.removeProgram', { name: p.name })} onClick={() => removeProgram(el.id, i)}>
              ✕
            </button>
          </div>
        ))}
        {warnings.map((w) => (
          <p class="warn" role="note" key={w.program}>
            <span aria-hidden="true">⚠ </span>
            {t('computer.warn', { program: w.program, os: list.format(w.available.map((o) => t(`os.${o}` as Key))) })}
          </p>
        ))}
        <div class="sub">
          <input
            class="input"
            list="programs"
            aria-label={t('computer.programName')}
            value={draft}
            maxLength={120}
            onInput={(e) => setDraft((e.currentTarget as HTMLInputElement).value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                add();
              }
            }}
          />
          <button type="button" class="btn" disabled={!draft.trim()} onClick={add}>
            {t('computer.addProgram')}
          </button>
        </div>
        <datalist id="programs">
          {suggestPrograms(c.functions).map((p) => (
            <option key={p.name} value={p.name} />
          ))}
        </datalist>
      </div>
      <label class="field">
        {t('computer.license')}
        <input class="input" value={c.license} maxLength={200} onChange={(e) => changeComputer(el.id, (x) => ({ ...x, license: (e.currentTarget as HTMLInputElement).value }))} />
      </label>
      <label class="check">
        <input type="checkbox" checked={c.dongle} onChange={(e) => changeComputer(el.id, (x) => ({ ...x, dongle: (e.currentTarget as HTMLInputElement).checked }))} />
        {t('computer.dongle')}
      </label>
      <div class="field">
        {t('computer.outputs')}
        {c.outputs.map((o, i) => {
          const n = i + 1;
          return (
            <div class="sub wrap" key={i}>
              <select class="input" aria-label={`${t('connect.signal')} · ${t('computer.output', { n })}`} value={o.signal} onChange={(e) => setComputerOutput(el.id, i, { signal: (e.currentTarget as HTMLSelectElement).value as Computer['outputs'][number]['signal'] })}>
                {SIGNALS.map((s) => (
                  <option key={s} value={s}>
                    {t(`signal.${s}` as Key)}
                  </option>
                ))}
              </select>
              <select class="input" aria-label={`${t('connections.connector')} · ${t('computer.output', { n })}`} value={o.connector} onChange={(e) => setComputerOutput(el.id, i, { connector: (e.currentTarget as HTMLSelectElement).value as Computer['outputs'][number]['connector'] })}>
                {CONNECTORS.map((k) => (
                  <option key={k} value={k}>
                    {t(`connector.${k}` as Key)}
                  </option>
                ))}
              </select>
              <input class="input" aria-label={`${t('computer.note')} · ${t('computer.output', { n })}`} value={o.note} maxLength={200} onChange={(e) => setComputerOutput(el.id, i, { note: (e.currentTarget as HTMLInputElement).value })} />
              <button type="button" class="pbtn" aria-label={t('computer.removeOutput', { n })} title={t('computer.removeOutput', { n })} onClick={() => removeComputerOutput(el.id, i)}>
                ✕
              </button>
            </div>
          );
        })}
        <button type="button" class="btn" onClick={() => addComputerOutput(el.id)}>
          {t('computer.addOutput')}
        </button>
      </div>
    </div>
  );
}

export function ConnectionsPanel({ show, el }: { show: Show; el: PlanElement }) {
  const list = connectionsOf(show, el.id);
  return (
    <div class="panel">
      <h2>{t('connections.title')}</h2>
      {list.length === 0 && <span class="muted">{t('connections.none')}</span>}
      {list.map((c) => {
        const otherId = c.from === el.id ? c.to : c.from;
        const name = elementName(show.elements[otherId]);
        return (
          <div class="conn" key={c.id}>
            <strong>{t('connections.with', { signal: t(`signal.${c.signal}` as Key), name })}</strong>
            <div class="sub">
              <input class="input" aria-label={`${t('connections.connector')} · ${name}`} value={c.connector} maxLength={40} onChange={(e) => setConnection(c.id, { connector: (e.currentTarget as HTMLInputElement).value })} />
              <input
                class="input mono"
                type="number"
                min="0"
                step="0.5"
                aria-label={`${t('connections.length')} · ${name}`}
                value={c.lengthMm === null ? '' : Math.round(c.lengthMm) / 1000}
                onChange={(e) => {
                  const raw = (e.currentTarget as HTMLInputElement).value;
                  const v = Number(raw);
                  setConnection(c.id, { lengthMm: raw === '' || !Number.isFinite(v) || v < 0 ? null : Math.round(v * 1000) });
                }}
              />
              <button type="button" class="pbtn" aria-label={t('connections.remove', { name })} title={t('connections.remove', { name })} onClick={() => dropConnection(c.id)}>
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
