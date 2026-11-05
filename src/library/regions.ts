// Closed list of 15 countries plus an editable "other" (decided 2026-11-02). Source: docs/research/region-electrica.md
// (Wikipedia, secondary). One default circuit voltage per country, always editable by the user.
import type { ConnectorType, Region } from './types.ts';

const r = (code: string, es: string, en: string, voltage: number, frequency: Region['frequency'], plugs: string[], toConfirm = false): Region => ({ code, name: { es, en }, voltage, frequency, plugs, ...(toConfirm ? { toConfirm } : {}) });

export const REGIONS: Region[] = [
  r('ES', 'España', 'Spain', 230, '50', ['C', 'F']),
  r('MX', 'México', 'Mexico', 127, '60', ['A', 'B'], true),
  r('AR', 'Argentina', 'Argentina', 220, '50', ['C', 'I']),
  r('CO', 'Colombia', 'Colombia', 120, '60', ['A', 'B'], true),
  r('CL', 'Chile', 'Chile', 220, '50', ['C', 'F', 'L']),
  r('PE', 'Perú', 'Peru', 220, '60', ['A', 'B', 'C']),
  r('UY', 'Uruguay', 'Uruguay', 230, '50', ['C', 'F', 'I', 'L']),
  r('US', 'Estados Unidos', 'United States', 120, '60', ['A', 'B'], true),
  r('CA', 'Canadá', 'Canada', 120, '60', ['A', 'B'], true),
  r('GB', 'Reino Unido', 'United Kingdom', 230, '50', ['G']),
  r('DE', 'Alemania', 'Germany', 230, '50', ['C', 'F']),
  r('FR', 'Francia', 'France', 230, '50', ['C', 'E']),
  r('IT', 'Italia', 'Italy', 230, '50', ['C', 'F', 'L']),
  r('PT', 'Portugal', 'Portugal', 230, '50', ['C', 'E', 'F']),
  r('BR', 'Brasil', 'Brazil', 127, '60', ['C', 'N'], true),
  // Free entry: the user types voltage and plug.
  r('XX', 'Otra', 'Other', 230, '50/60', []),
];

export const regionByCode = (code: string): Region | undefined => REGIONS.find((x) => x.code === code);

// Short fixed list accepted 2026-11-02. Details from docs/research/conectores-teatro.md; the "Edison" of the
// accepted list is read as the NEMA 5-15 pending the user's confirmation, and Socapex has no current in the source.
export const CONNECTORS: ConnectorType[] = [
  { id: 'schuko', name: { es: 'Schuko', en: 'Schuko' }, amps: 16 },
  { id: 'cee16', name: { es: 'CEE 16 A', en: 'CEE 16 A' }, amps: 16, note: 'IEC 60309; azul monofásico, rojo trifásico' },
  { id: 'cee32', name: { es: 'CEE 32 A', en: 'CEE 32 A' }, amps: 32, note: 'IEC 60309; habitual en eventos' },
  { id: 'powercon', name: { es: 'Powercon', en: 'Powercon' }, amps: 20, note: 'Hay versiones de 32 A y TRUE1 de 16 A' },
  { id: 'socapex', name: { es: 'Socapex', en: 'Socapex' }, amps: null, note: 'Seis circuitos; corriente sin dato en la fuente' },
  { id: 'twistlock', name: { es: 'Twistlock (NEMA L5-20)', en: 'Twistlock (NEMA L5-20)' }, amps: 20, note: '20 A deducido por el nombre' },
  { id: 'edison', name: { es: 'Edison (NEMA 5-15)', en: 'Edison (NEMA 5-15)' }, amps: 15, note: 'Equivalencia por confirmar' },
];
