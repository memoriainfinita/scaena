// The desks of the show: a selector above the input and output lists, and the details of the chosen one.
import { signal } from '@preact/signals';
import { addDeskRow, removeDeskRow, setDesk } from '../app/audio-actions.ts';
import { t, type Key } from '../i18n/index.ts';
import { deskById, desksOf } from '../model/desks.ts';
import type { Desk, Show } from '../model/schema.ts';

/** The desk whose rows the lists show; an id that no longer exists falls back to the main desk. */
export const activeDesk = signal('');

const ROLES: Desk['role'][] = ['foh', 'monitors', 'broadcast', 'other'];

/** What a desk is called: its name, or its role when it has none. */
export const deskLabel = (d: Desk): string => d.name || t(`desk.role.${d.role}` as Key);

export const currentDesk = (show: Show): Desk => deskById(show, activeDesk.value);

export function DeskBar({ show }: { show: Show }) {
  const desks = desksOf(show);
  const cur = currentDesk(show);
  const main = desks[0]!;
  return (
    <>
      <div class="listbar">
        {desks.length > 1 && (
          <div class="deskbar" role="group" aria-label={t('desk.title')}>
            {desks.map((d) => (
              <button key={d.id} type="button" class="btn" aria-pressed={d.id === cur.id} onClick={() => (activeDesk.value = d.id)}>
                {deskLabel(d)}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          class="btn"
          title={t('desk.add.tip')}
          onClick={() => {
            const id = addDeskRow();
            if (id) activeDesk.value = id;
          }}
        >
          {t('desk.add')}
        </button>
      </div>
      {desks.length > 1 && (
        <fieldset class="card deskcard">
          <legend>{deskLabel(cur)}</legend>
          <label class="field">
            {t('desk.name')}
            <input class="input" placeholder={t(`desk.role.${cur.role}` as Key)} value={cur.name} maxLength={60} onChange={(e) => setDesk(cur.id, { name: (e.currentTarget as HTMLInputElement).value })} />
          </label>
          <label class="field">
            {t('desk.role')}
            <select class="input" title={t('desk.role.tip')} value={cur.role} onChange={(e) => setDesk(cur.id, { role: (e.currentTarget as HTMLSelectElement).value as Desk['role'] })}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {t(`desk.role.${r}` as Key)}
                </option>
              ))}
            </select>
          </label>
          <label class="field">
            {t('desk.model')}
            <input class="input" value={cur.model} maxLength={80} onChange={(e) => setDesk(cur.id, { model: (e.currentTarget as HTMLInputElement).value })} />
          </label>
          <label class="field">
            {t('desk.showFile')}
            <input class="input" value={cur.showFile} maxLength={120} onChange={(e) => setDesk(cur.id, { showFile: (e.currentTarget as HTMLInputElement).value })} />
          </label>
          <label class="field">
            {t('desk.element')}
            <select class="input" title={t('desk.element.tip')} value={cur.elementId ?? ''} onChange={(e) => setDesk(cur.id, { elementId: (e.currentTarget as HTMLSelectElement).value || null })}>
              <option value="">{t('desk.element.none')}</option>
              {Object.values(show.elements)
                .filter((x) => x.type.id.startsWith('desk.'))
                .map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.label || x.id}
                  </option>
                ))}
            </select>
          </label>
          {cur.id !== main.id && (
            <button
              type="button"
              class="btn"
              title={t('desk.remove.tip')}
              onClick={() => {
                activeDesk.value = main.id;
                removeDeskRow(cur.id);
              }}
            >
              {t('desk.remove')}
            </button>
          )}
        </fieldset>
      )}
    </>
  );
}
