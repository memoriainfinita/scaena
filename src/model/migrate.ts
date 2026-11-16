import { repairShow } from './repair.ts';
import { FORMAT_VERSION, parseShow, type Show } from './schema.ts';

type Migration = (raw: Record<string, unknown>) => Record<string, unknown>;

/** Index n - 1 migrates format n to n + 1. Format 2 only adds optional fields. */
export const MIGRATIONS: Migration[] = [
  // 1 to 2: ports, desks, per-desk assignments and multichannel connections, all optional; nothing to rewrite.
  (raw) => raw,
];

export class UnsupportedFormat extends Error {
  constructor(
    readonly found: unknown,
    message: string,
    /** True when the file comes from a later scaena, which is not a fault of the file. */
    readonly newer = false,
  ) {
    super(message);
  }
}

/** A saved show brought to the current format, not yet validated. Never guesses on a newer file. */
function migrated(raw: unknown, target: number): Record<string, unknown> {
  if (typeof raw !== 'object' || raw === null) throw new UnsupportedFormat(raw, 'not an object');
  let obj = { ...(raw as Record<string, unknown>) };
  const version = obj.formatVersion;
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) throw new UnsupportedFormat(version, 'missing format version');
  if (version > target) throw new UnsupportedFormat(version, `file is from a newer scaena (format ${version})`, true);
  for (let n = version; n < target; n++) {
    const step = MIGRATIONS[n - 1];
    if (!step) throw new UnsupportedFormat(version, `no migration from format ${n}`);
    obj = { ...step(obj), formatVersion: n + 1 };
  }
  return obj;
}

/** Reads any saved show: brings it to the current format and validates it. A show that breaks the format is refused. */
export function loadShow(raw: unknown, target = FORMAT_VERSION): Show {
  return parseShow(migrated(raw, target));
}

export interface Opened {
  show: Show;
  /** How many values were cut or clamped to fit the format; 0 for a show that was valid as saved. */
  repaired: number;
}

/**
 * Reads a saved show to open it. One that only breaks a limit of the format (a text too long, a number out of range) is
 * mended and opened; any other fault is refused, as in `loadShow`.
 */
export function openShow(raw: unknown, target = FORMAT_VERSION): Opened {
  const obj = migrated(raw, target);
  const mended = repairShow(obj);
  if (mended) return { show: mended.show, repaired: mended.fixed.length };
  return { show: parseShow(obj), repaired: 0 };
}
