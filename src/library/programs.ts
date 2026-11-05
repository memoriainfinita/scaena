// Suggested programs for a computer in a rider. Name, operating systems and what it is used for: no versions or prices.
// Source: docs/research/software-ordenadores.md (2026-11-02). Systems marked [PENDIENTE] there are left unknown (null)
// and never raise a compatibility warning.

export type OsId = 'windows' | 'macos' | 'linux';
export type ProgramFunction = 'sound' | 'video' | 'lights' | 'network';
export type ProgramCategory = 'playback' | 'desk' | 'pa' | 'network' | 'lights' | 'visualizer' | 'video';

export interface Program {
  name: string;
  /** Systems it exists for, or null when not confirmed. */
  os: OsId[] | null;
  category: ProgramCategory;
  /** A physical key or license the source mentions. */
  key?: string;
}

const W: OsId = 'windows';
const M: OsId = 'macos';
const L: OsId = 'linux';

export const PROGRAMS: Program[] = [
  { name: 'QLab', os: [M], category: 'playback' },
  { name: 'Show Cue System (SCS)', os: [W], category: 'playback' },
  { name: 'MultiPlay', os: [W], category: 'playback' },
  { name: 'Yamaha DM Editor', os: [W, M], category: 'desk' },
  { name: 'Yamaha DM3 Editor', os: [W, M], category: 'desk' },
  { name: 'Yamaha CL/QL/TF Editor', os: [W, M], category: 'desk' },
  { name: 'Yamaha RIVAGE PM Editor', os: [W, M], category: 'desk' },
  { name: 'Allen & Heath dLive Director', os: [W, M], category: 'desk' },
  { name: 'Allen & Heath Avantis Director', os: [W, M], category: 'desk' },
  { name: 'Allen & Heath SQ MixPad', os: [W, M], category: 'desk' },
  { name: 'Behringer X32-Edit', os: [W, M, L], category: 'desk' },
  { name: 'Midas M32-Edit', os: [W, M, L], category: 'desk' },
  { name: 'Behringer WING Edit', os: [W, M, L], category: 'desk' },
  { name: 'Midas Offline Editor', os: null, category: 'desk' },
  { name: 'DiGiCo SD Offline', os: [W], category: 'desk' },
  { name: 'DiGiCo S-Series Offline Editor', os: [W, M], category: 'desk' },
  { name: 'Soundcraft Vi Offline Editor', os: [W], category: 'desk' },
  { name: 'PreSonus UC Surface', os: [W, M], category: 'desk' },
  { name: 'd&b ArrayCalc', os: [W, M], category: 'pa' },
  { name: 'd&b R1', os: [W, M], category: 'pa' },
  { name: 'L-Acoustics Soundvision', os: [W, M], category: 'pa' },
  { name: 'L-Acoustics LA Network Manager', os: [W, M], category: 'pa' },
  { name: 'Meyer Sound MAPP 3D', os: [W, M], category: 'pa' },
  { name: 'Meyer Sound Compass', os: [W, M], category: 'pa' },
  { name: 'dbx DriveRack VENU360 Control', os: [W, M], category: 'pa' },
  { name: 'BSS Audio Architect', os: [W], category: 'pa' },
  { name: 'Xilica Designer', os: [W], category: 'pa' },
  { name: 'Powersoft ArmoníaPlus', os: null, category: 'pa' },
  { name: 'Smaart', os: [W, M], category: 'pa' },
  { name: 'Open Sound Meter', os: [W, M, L], category: 'pa' },
  { name: 'REW', os: [W, M, L], category: 'pa' },
  { name: 'Shure Wireless Workbench', os: [W, M], category: 'network' },
  { name: 'Sennheiser Wireless Systems Manager', os: [W, M], category: 'network' },
  { name: 'Sennheiser Control Cockpit', os: [W, M], category: 'network' },
  { name: 'Green-GO Control', os: [W, M], category: 'network' },
  { name: 'Clear-Com EHX', os: [W], category: 'network' },
  { name: 'Riedel Director', os: [W], category: 'network' },
  { name: 'Dante Controller', os: [W, M], category: 'network' },
  { name: 'Dante Virtual Soundcard', os: [W, M], category: 'network' },
  { name: 'ETC Eos (ETCnomad)', os: [W, M], category: 'lights', key: 'ETC DMX key' },
  { name: 'grandMA3 onPC', os: [W, M], category: 'lights', key: 'DMX-Key Starter' },
  { name: 'grandMA2 onPC', os: [W], category: 'lights' },
  { name: 'ChamSys MagicQ', os: [W, M, L], category: 'lights', key: 'ChamSys interface' },
  { name: 'Avolites Titan', os: [W], category: 'lights' },
  { name: 'Hog 4 PC', os: [W], category: 'lights' },
  { name: 'Zero 88 ZerOS (Phantom)', os: [W], category: 'lights', key: 'ZerOS dongle' },
  { name: 'Obsidian ONYX', os: [W], category: 'lights' },
  { name: 'QLC+', os: [W, M, L], category: 'lights' },
  { name: 'Lightkey', os: [M], category: 'lights' },
  { name: 'Freestyler', os: [W], category: 'lights' },
  { name: 'Daslight', os: [W], category: 'lights' },
  { name: 'Capture', os: [W, M], category: 'visualizer' },
  { name: 'Vectorworks Spotlight + Vision', os: [W, M], category: 'visualizer' },
  { name: 'Lightwright', os: [W, M], category: 'visualizer' },
  { name: 'LXFree', os: null, category: 'visualizer' },
  { name: 'Millumin', os: [M], category: 'video' },
  { name: 'Isadora', os: [W, M], category: 'video' },
  { name: 'Resolume Arena', os: [W, M], category: 'video' },
  { name: 'MadMapper', os: [W, M], category: 'video' },
  { name: 'TouchDesigner', os: [W, M], category: 'video' },
  { name: 'WATCHOUT', os: [W], category: 'video' },
  { name: 'disguise Designer', os: [W], category: 'video' },
];

/** The function of the computer that a program category belongs to. */
export const CATEGORY_FUNCTION: Record<ProgramCategory, ProgramFunction> = { playback: 'sound', desk: 'sound', pa: 'sound', network: 'network', lights: 'lights', visualizer: 'lights', video: 'video' };

export const programByName = (name: string): Program | undefined => {
  const q = name.trim().toLowerCase();
  return PROGRAMS.find((p) => p.name.toLowerCase() === q);
};

/** Programs worth suggesting for the functions a computer has; with none given, all of them. */
export function suggestPrograms(functions: ProgramFunction[]): Program[] {
  if (functions.length === 0) return PROGRAMS;
  return PROGRAMS.filter((p) => functions.includes(CATEGORY_FUNCTION[p.category]));
}

/**
 * The programs of a computer that do not exist for its operating system. Unknown systems on either side say
 * nothing: a soft warning that is wrong is worse than none.
 */
export function incompatiblePrograms(os: 'windows' | 'macos' | 'linux' | 'other', names: string[]): { program: string; available: OsId[] }[] {
  if (os === 'other') return [];
  const out: { program: string; available: OsId[] }[] = [];
  for (const n of names) {
    const p = programByName(n);
    if (p?.os && !p.os.includes(os)) out.push({ program: p.name, available: p.os });
  }
  return out;
}
