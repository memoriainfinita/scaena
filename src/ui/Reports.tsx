// The reports view: the lists of the rider as tables, each with its CSV and a copy-as-text.
import { signal } from '@preact/signals';
import { useState } from 'preact/hooks';
import { saveFile } from '../export/exports.ts';
import { baseName } from '../export/exports.ts';
import { t, type Key } from '../i18n/index.ts';
import type { Show } from '../model/schema.ts';
import { availableReports, buildReport, toCsv, toTsv, type ReportId } from '../reports/reports.ts';

const current = signal<ReportId | null>(null);

export function ReportsView({ show }: { show: Show }) {
  const ids = availableReports(show);
  const [copied, setCopied] = useState(false);
  if (ids.length === 0) return <p class="muted pad">{t('reports.none')}</p>;
  const id = current.value && ids.includes(current.value) ? current.value : ids[0]!;
  const table = buildReport(show, id);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(toTsv(table));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div class="scroll">
      <nav class="subtabs" aria-label={t('reports.label')}>
        {ids.map((x) => (
          <button key={x} type="button" class="chipbtn" aria-pressed={x === id} aria-current={x === id ? 'page' : undefined} onClick={() => (current.value = x)}>
            {t(`report.${x}` as Key)}
          </button>
        ))}
      </nav>
      <div class="listbar">
        <button type="button" class="btn" onClick={() => saveFile({ name: `${baseName(show.name)}-${id}.csv`, bytes: new TextEncoder().encode(toCsv(table)), mime: 'text/csv' })}>
          {t('reports.csv')}
        </button>
        <button type="button" class="btn" onClick={() => void copy()}>
          {t('reports.copy')}
        </button>
        <span class="muted" role="status">
          {copied ? t('reports.copied') : ''}
        </span>
      </div>
      {table.rows.length === 0 ? (
        <p class="muted pad">{t('reports.empty')}</p>
      ) : (
        <table class="list editable wide">
          <caption class="sr-only">{t(`report.${id}` as Key)}</caption>
          <thead>
            <tr>
              {table.header.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j} class="plain">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
