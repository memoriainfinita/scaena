// The rack builder: the devices of a rack from the top, in rack units, with the space left.
import { useState } from 'preact/hooks';
import { buildRack, rackAdd, rackMove, rackRemove, rackSet, rackUnits } from '../app/rack-actions.ts';
import { t } from '../i18n/index.ts';
import { rackLayout, rackUsed } from '../model/racks.ts';
import type { PlanElement } from '../model/schema.ts';

export function RackPanel({ el }: { el: PlanElement }) {
  const [name, setName] = useState('');
  const [u, setU] = useState('1');
  const rack = el.rack;
  if (!rack) {
    return (
      <div class="panel">
        <h2>{t('rack.title')}</h2>
        <button type="button" class="btn" onClick={() => buildRack(el.id)}>
          {t('rack.build')}
        </button>
      </div>
    );
  }
  const used = rackUsed(rack);
  const over = used > rack.units;
  const add = (e: Event) => {
    e.preventDefault();
    if (!name.trim()) return;
    rackAdd(el.id, name.trim(), Number(u) || 1);
    setName('');
  };
  return (
    <div class="panel">
      <h2>{t('rack.title')}</h2>
      <label class="field">
        {t('rack.units')}
        <input class="input mono" type="number" min="1" max="60" value={rack.units} onChange={(e) => rackUnits(el.id, Number((e.currentTarget as HTMLInputElement).value) || 1)} />
      </label>
      <p class={over ? 'warn' : 'muted'} role="status">
        {over ? <span aria-hidden="true">⚠ </span> : null}
        {t(over ? 'rack.over' : 'rack.used', { used, units: rack.units })}
      </p>
      <ol class="racklist" aria-label={t('rack.title')}>
        {rackLayout(rack).map(({ slot, from, to }, i) => (
          <li key={slot.id}>
            <span class="mono racku">{from === to ? from : `${from}-${to}`}</span>
            <input class="input cell" aria-label={t('rack.deviceName', { n: i + 1 })} value={slot.name} maxLength={80} onChange={(e) => rackSet(el.id, slot.id, { name: (e.currentTarget as HTMLInputElement).value })} />
            <input class="input cell mono" style="width:54px" type="number" min="1" max="20" aria-label={t('rack.deviceU', { n: i + 1 })} value={slot.u} onChange={(e) => rackSet(el.id, slot.id, { u: Number((e.currentTarget as HTMLInputElement).value) || 1 })} />
            <button type="button" class="btn" aria-label={t('rack.up', { name: slot.name })} disabled={i === 0} onClick={() => rackMove(el.id, slot.id, -1)}>
              ↑
            </button>
            <button type="button" class="btn" aria-label={t('rack.down', { name: slot.name })} disabled={i === rack.slots.length - 1} onClick={() => rackMove(el.id, slot.id, 1)}>
              ↓
            </button>
            <button type="button" class="btn" aria-label={t('rack.remove', { name: slot.name })} onClick={() => rackRemove(el.id, slot.id)}>
              ×
            </button>
          </li>
        ))}
      </ol>
      <form class="row" onSubmit={add}>
        <label class="field grow">
          {t('rack.newDevice')}
          <input class="input" value={name} maxLength={80} onInput={(e) => setName((e.currentTarget as HTMLInputElement).value)} />
        </label>
        <label class="field">
          U
          <input class="input mono" style="width:60px" type="number" min="1" max="20" value={u} onInput={(e) => setU((e.currentTarget as HTMLInputElement).value)} />
        </label>
        <button type="submit" class="btn primary" disabled={!name.trim()}>
          {t('rack.add')}
        </button>
      </form>
    </div>
  );
}
