// Units of a show. Everything is stored in millimetres and kilograms; a show in imperial units reads and writes feet and pounds.
// One place turns stored values into text and into the numbers of form fields, so the plan, the editor and the documents agree.
export type Units = 'metric' | 'imperial';

const MM_PER_FOOT = 304.8;
const KG_PER_POUND = 0.45359237;

/** Stored millimetres per unit of a length field: metres or feet. */
export const lengthScale = (units: Units): number => (units === 'imperial' ? MM_PER_FOOT : 1000);
/** Stored kilograms per unit of a weight field: kilograms or pounds. */
export const weightScale = (units: Units): number => (units === 'imperial' ? KG_PER_POUND : 1);
export const lengthUnit = (units: Units): string => (units === 'imperial' ? 'ft' : 'm');
export const weightUnit = (units: Units): string => (units === 'imperial' ? 'lb' : 'kg');

/** A label written in metric ("Height (m)", "Weight (kg)") in the units of the show. */
export const inUnits = (label: string, units: Units): string => (units === 'imperial' ? label.replace('(m)', '(ft)').replace('(kg)', '(lb)') : label);

/** A number the way the language writes it: decimal comma in Spanish, point in English. */
export const numberText = (n: number, lang: string, digits = 0, fixed = true): string => new Intl.NumberFormat(lang, { maximumFractionDigits: digits, minimumFractionDigits: fixed ? digits : 0 }).format(n);

/** A field value in its unit, without the unit: for table cells whose header carries it. */
export const lengthValue = (mm: number, units: Units, lang: string, digits = 1, fixed = false): string => numberText(mm / lengthScale(units), lang, digits, fixed);
export const weightValue = (kg: number, units: Units, lang: string, digits = 1, fixed = false): string => numberText(kg / weightScale(units), lang, digits, fixed);

/** A distance in a readable form: metres, or feet and inches for imperial shows. */
export function lengthText(mm: number, units: Units, lang: string): string {
  if (units === 'imperial') {
    const inches = mm / 25.4;
    const ft = Math.floor(inches / 12);
    const inch = Math.round(inches - ft * 12);
    return inch === 12 ? `${ft + 1}′ 0″` : `${ft}′ ${inch}″`;
  }
  return `${numberText(mm / 1000, lang, 2)} m`;
}

/** A length with its unit and the given decimals: "3.3 m" or "10.8 ft". */
export const lengthWithUnit = (mm: number, units: Units, lang: string, digits = 1, fixed = false): string => `${lengthValue(mm, units, lang, digits, fixed)} ${lengthUnit(units)}`;
export const weightWithUnit = (kg: number, units: Units, lang: string, digits = 1, fixed = false): string => `${weightValue(kg, units, lang, digits, fixed)} ${weightUnit(units)}`;

/** Print scales offered for a show: the metric series, or the architectural ones of imperial drawings (½″, ¼″, ⅛″ and 1/16″ to the foot). */
export const printScales = (units: Units): number[] => (units === 'imperial' ? [24, 48, 96, 192] : [25, 50, 100, 200]);

const ARCH: Record<number, string> = { 12: '1″ = 1′', 24: '½″ = 1′', 48: '¼″ = 1′', 96: '⅛″ = 1′', 192: '1/16″ = 1′' };
/** How a scale reads on a drawing: 1:50, or ¼″ = 1′ (1:48) in imperial. */
export const scaleText = (n: number, units: Units): string => (units === 'imperial' && ARCH[n] ? `${ARCH[n]} (1:${n})` : `1:${n}`);

/** Round lengths for a scale bar, in millimetres: metric steps from `smallestMm` up, or whole feet for imperial shows. */
export const niceLengths = (units: Units, smallestMm = 100): number[] =>
  units === 'imperial' ? [1, 2, 5, 10, 20, 50, 100, 200].map((ft) => ft * MM_PER_FOOT) : [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000].filter((mm) => mm >= smallestMm);

/** The length of a scale bar as written beside it. */
export const barText = (mm: number, units: Units, lang: string): string => (units === 'imperial' ? `${numberText(Math.round(mm / MM_PER_FOOT), lang)} ft` : mm >= 1000 ? `${numberText(mm / 1000, lang, 1, false)} m` : `${mm} mm`);
