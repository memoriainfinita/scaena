import { FORMAT_VERSION, parseShow, type Show } from './schema.ts';

type Migration = (raw: Record<string, unknown>) => Record<string, unknown>;

/** Index n - 1 migrates format n to n + 1. Empty while there is only one format. */
export const MIGRATIONS: Migration[] = [];

export class UnsupportedFormat extends Error {
  constructor(
    readonly found: unknown,
    message: string,
  ) {
    super(message);
  }
}

/** Reads any saved show: brings it to the current format and validates it. Never guesses on a newer file. */
export function loadShow(raw: unknown, target = FORMAT_VERSION): Show {
  if (typeof raw !== 'object' || raw === null) throw new UnsupportedFormat(raw, 'not an object');
  let obj = { ...(raw as Record<string, unknown>) };
  const version = obj.formatVersion;
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) throw new UnsupportedFormat(version, 'missing format version');
  if (version > target) throw new UnsupportedFormat(version, `file is from a newer scaena (format ${version})`);
  for (let n = version; n < target; n++) {
    const step = MIGRATIONS[n - 1];
    if (!step) throw new UnsupportedFormat(version, `no migration from format ${n}`);
    obj = { ...step(obj), formatVersion: n + 1 };
  }
  return parseShow(obj);
}
