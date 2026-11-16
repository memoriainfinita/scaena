// Brings a show that breaks a limit of the file format back inside it: a text that is too long is cut, a number out of its
// range goes to the nearest end of it. Nothing else is touched, and a show with any other fault is not repaired at all.
import { safeParseShow, type Show } from './schema.ts';

export interface Repaired {
  show: Show;
  /** Where something was cut or clamped, as paths into the show: "elements.e3.label". Empty when it was already valid. */
  fixed: string[];
}

type Step = { key: unknown };
type Fault = { type: string; requirement?: unknown; input?: unknown; path?: Step[] | undefined };

/** The value inside its limit, or undefined when this kind of fault is not one to mend by rule. */
function mended(fault: Fault): string | number | undefined {
  const { type, requirement: limit, input } = fault;
  if (typeof limit !== 'number') return undefined;
  if (type === 'max_length' && typeof input === 'string') return input.slice(0, limit);
  if ((type === 'max_value' || type === 'min_value') && typeof input === 'number' && Number.isFinite(input)) return limit;
  return undefined;
}

function setAt(root: unknown, path: Step[], value: string | number): boolean {
  let node = root as Record<string, unknown> | null;
  for (const step of path.slice(0, -1)) {
    if (typeof node !== 'object' || node === null) return false;
    node = node[String(step.key)] as Record<string, unknown> | null;
  }
  if (typeof node !== 'object' || node === null) return false;
  node[String(path[path.length - 1]!.key)] = value;
  return true;
}

/** The show as it is when it is valid, the mended show when only limits were broken, and null when it cannot be mended. */
export function repairShow(raw: unknown): Repaired | null {
  const first = safeParseShow(raw);
  if (first.success) return { show: first.output, fixed: [] };
  let copy: unknown;
  try {
    copy = structuredClone(raw);
  } catch {
    return null;
  }
  const fixed = new Set<string>();
  // A cut text can uncover nothing new, but a second pass costs little and confirms the result.
  for (let pass = 0; pass < 3; pass++) {
    const r = safeParseShow(copy);
    if (r.success) return { show: r.output, fixed: [...fixed] };
    for (const issue of r.issues as Fault[]) {
      const value = mended(issue);
      if (value === undefined || !issue.path || issue.path.length === 0 || !setAt(copy, issue.path, value)) return null;
      fixed.add(issue.path.map((s) => String(s.key)).join('.'));
    }
  }
  return null;
}
