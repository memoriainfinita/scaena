import { describe, expect, it } from 'vitest';
import { needsWideFonts } from './compile.ts';

describe('needsWideFonts', () => {
  it('stays on the small fonts for Latin, with accents and Polish letters', () => {
    expect(needsWideFonts('= Teatro Ñandú, Łódź Žilina')).toBe(false);
  });
  it('asks for the wide fonts for Cyrillic, Greek and combining marks', () => {
    expect(needsWideFonts('= Группа')).toBe(true);
    expect(needsWideFonts('= Ελληνικά')).toBe(true);
    expect(needsWideFonts('= á')).toBe(true);
  });
  it('looks inside the SVG files of the project, not in other files', () => {
    const enc = new TextEncoder();
    expect(needsWideFonts('= x', { 'plan.svg': enc.encode('<text>Сцена</text>') })).toBe(true);
    expect(needsWideFonts('= x', { 'logo.png': enc.encode('Сцена') })).toBe(false);
  });
});
