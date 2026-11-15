// The ports of an element: what it takes in and puts out, so cables can say which one they use.
import { addElementPort, removeElementPort, setElementPort } from '../app/computer-actions.ts';
import { t, type Key } from '../i18n/index.ts';
import { SIGNALS } from '../model/connections.ts';
import { PORT_FORMATS } from '../model/ports.ts';
import type { PlanElement, Port } from '../model/schema.ts';

const DIRS: Port['dir'][] = ['in', 'out', 'io'];

export function PortsPanel({ el }: { el: PlanElement }) {
  return (
    <div class="panel">
      <h2 title={t('ports.tip')}>{t('ports.title')}</h2>
      {el.ports.length === 0 && <span class="muted">{t('ports.none')}</span>}
      {el.ports.map((p) => {
        const tag = (k: Key) => `${t(k)} · ${p.name}`;
        return (
          <div class="sub wrap" key={p.id}>
            <input class="input" aria-label={tag('ports.name')} value={p.name} maxLength={60} onChange={(e) => setElementPort(el.id, p.id, { name: (e.currentTarget as HTMLInputElement).value })} />
            <select class="input" aria-label={tag('ports.dir')} value={p.dir} onChange={(e) => setElementPort(el.id, p.id, { dir: (e.currentTarget as HTMLSelectElement).value as Port['dir'] })}>
              {DIRS.map((d) => (
                <option key={d} value={d}>
                  {t(`ports.dir.${d}` as Key)}
                </option>
              ))}
            </select>
            <select class="input" aria-label={tag('connections.signal')} value={p.signal} onChange={(e) => setElementPort(el.id, p.id, { signal: (e.currentTarget as HTMLSelectElement).value as Port['signal'] })}>
              {SIGNALS.map((s) => (
                <option key={s} value={s}>
                  {t(`signal.${s}` as Key)}
                </option>
              ))}
            </select>
            <input class="input" list={`formats-${p.signal}`} aria-label={tag('ports.format')} value={p.format} maxLength={40} onChange={(e) => setElementPort(el.id, p.id, { format: (e.currentTarget as HTMLInputElement).value })} />
            <input
              class="input mono"
              type="number"
              min="1"
              max="512"
              step="1"
              aria-label={tag('ports.channels')}
              title={t('ports.channels')}
              value={p.channels}
              onChange={(e) => {
                const v = Math.floor(Number((e.currentTarget as HTMLInputElement).value));
                if (Number.isFinite(v) && v >= 1 && v <= 512) setElementPort(el.id, p.id, { channels: v });
              }}
            />
            <button type="button" class="pbtn" aria-label={t('ports.remove', { name: p.name })} title={t('ports.remove', { name: p.name })} onClick={() => removeElementPort(el.id, p.id)}>
              ✕
            </button>
          </div>
        );
      })}
      <div class="sub wrap">
        <button type="button" class="btn" onClick={() => addElementPort(el.id, { dir: 'in' })}>
          {t('ports.addIn')}
        </button>
        <button type="button" class="btn" onClick={() => addElementPort(el.id, { dir: 'out' })}>
          {t('ports.addOut')}
        </button>
      </div>
      {SIGNALS.map((s) => (
        <datalist key={s} id={`formats-${s}`}>
          {PORT_FORMATS[s].map((x) => (
            <option key={x} value={x} />
          ))}
        </datalist>
      ))}
    </div>
  );
}
