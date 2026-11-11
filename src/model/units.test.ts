import { describe, expect, test } from 'vitest';
import { barText, inUnits, lengthScale, lengthText, lengthValue, niceLengths, numberText, printScales, scaleText, weightScale, weightValue } from './units.ts';

describe('units', () => {
  test('a length field is in metres or in feet, a weight field in kilograms or in pounds', () => {
    expect(lengthScale('metric')).toBe(1000);
    expect(lengthScale('imperial')).toBeCloseTo(304.8);
    expect(weightScale('imperial')).toBeCloseTo(0.4536, 4);
    expect(inUnits('Height (m) · Max load (kg)', 'imperial')).toBe('Height (ft) · Max load (lb)');
    expect(inUnits('Height (m)', 'metric')).toBe('Height (m)');
  });

  test('numbers are written the way the language writes them', () => {
    expect(numberText(19.13, 'es', 2)).toBe('19,13');
    expect(numberText(19.13, 'en', 2)).toBe('19.13');
    expect(lengthValue(3250, 'metric', 'es')).toBe('3,3');
    expect(lengthValue(3000, 'metric', 'es')).toBe('3');
    expect(lengthValue(3048, 'imperial', 'en')).toBe('10');
    expect(weightValue(10, 'imperial', 'en')).toBe('22');
    expect(lengthText(3250, 'metric', 'es')).toBe('3,25 m');
    expect(lengthText(3810, 'imperial', 'es')).toBe('12′ 6″');
  });

  test('imperial shows print at the architectural scales, and read them as such', () => {
    expect(printScales('metric')).toEqual([25, 50, 100, 200]);
    expect(printScales('imperial')).toEqual([24, 48, 96, 192]);
    expect(scaleText(48, 'imperial')).toBe('¼″ = 1′ (1:48)');
    expect(scaleText(50, 'imperial')).toBe('1:50');
    expect(scaleText(50, 'metric')).toBe('1:50');
  });

  test('the scale bar takes round feet in imperial shows', () => {
    expect(niceLengths('metric', 500)[0]).toBe(500);
    expect(niceLengths('imperial').every((mm) => Number.isInteger(Math.round(mm / 304.8)))).toBe(true);
    expect(barText(3048, 'imperial', 'en')).toBe('10 ft');
    expect(barText(2000, 'metric', 'es')).toBe('2 m');
    expect(barText(500, 'metric', 'es')).toBe('500 mm');
  });
});
