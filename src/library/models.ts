// Datasheet values read on 2026-11-02 (docs/research/luminarias-teatro.md and audio-modelos.md).
// Every number has its source URL; what had no datasheet is empty or marked as an estimate.
import type { AudioModel, FixtureModel } from './types.ts';

const ETC_WEIGHTS = 'https://support.etcconnect.com/ETC/Fixtures/Source_Four/Source_Four_ERS_and_HID/Fixture_and_Shipping_Weights_of_Source_Four';
const ALTMAN = 'https://www.altmanlighting.com/wp-content/uploads';

export const FIXTURES: FixtureModel[] = [
  { id: 'etc.s4-5', brand: 'ETC', model: 'Source Four 5°', kind: 'ellipsoidal', weightKg: 8.7, powerW: 750, beam: '5°', source: ETC_WEIGHTS },
  { id: 'etc.s4-10', brand: 'ETC', model: 'Source Four 10°', kind: 'ellipsoidal', weightKg: 6.8, powerW: 750, beam: '10°', source: ETC_WEIGHTS },
  { id: 'etc.s4-14', brand: 'ETC', model: 'Source Four 14°', kind: 'ellipsoidal', weightKg: 8.8, powerW: 750, beam: '14°', source: ETC_WEIGHTS },
  { id: 'etc.s4-19', brand: 'ETC', model: 'Source Four 19°', kind: 'ellipsoidal', weightKg: 6.3, powerW: 750, beam: '19°', source: ETC_WEIGHTS },
  { id: 'etc.s4-26', brand: 'ETC', model: 'Source Four 26°', kind: 'ellipsoidal', weightKg: 6.4, powerW: 750, beam: '26°', source: 'https://www.etcconnect.com/WorkArea/DownloadAsset.aspx?id=10737460435', note: 'Con pinza; largo de 511 a 579 mm según la pinza' },
  { id: 'etc.s4-36', brand: 'ETC', model: 'Source Four 36°', kind: 'ellipsoidal', weightKg: 6.3, powerW: 750, beam: '36°', source: ETC_WEIGHTS },
  { id: 'etc.s4-50', brand: 'ETC', model: 'Source Four 50°', kind: 'ellipsoidal', weightKg: 6.3, powerW: 750, beam: '50°', source: ETC_WEIGHTS },
  { id: 'etc.s4-70', brand: 'ETC', model: 'Source Four 70°', kind: 'ellipsoidal', weightKg: 7.9, powerW: 750, beam: '70°', source: ETC_WEIGHTS },
  { id: 'etc.s4-90', brand: 'ETC', model: 'Source Four 90°', kind: 'ellipsoidal', weightKg: 8.0, powerW: 750, beam: '90°', source: ETC_WEIGHTS },
  { id: 'etc.s4-zoom-15-30', brand: 'ETC', model: 'Source Four Zoom 15-30°', kind: 'ellipsoidal', weightKg: 9.5, powerW: 750, beam: '15-30°', source: ETC_WEIGHTS },
  { id: 'etc.s4-zoom-25-50', brand: 'ETC', model: 'Source Four Zoom 25-50°', kind: 'ellipsoidal', weightKg: 7.6, powerW: 750, beam: '25-50°', source: ETC_WEIGHTS },
  { id: 'etc.s4-jr', brand: 'ETC', model: 'Source Four Jr 26/36/50°', kind: 'ellipsoidal', weightKg: 4.5, powerW: null, beam: '26-50°', source: ETC_WEIGHTS, note: 'Potencia sin leer' },
  { id: 'etc.s4-par-ea', brand: 'ETC', model: 'Source Four PAR EA', kind: 'par', weightKg: 3.4, powerW: 750, beam: 'según lente', source: ETC_WEIGHTS },
  { id: 'etc.s4-fresnel', brand: 'ETC', model: 'Source Four Fresnel', kind: 'fresnel', weightKg: null, powerW: 750, beam: '20-65°', source: 'https://images.static-thomann.de/pics/atg/atgdata/document/specs/s4_fresnel_datasheet.pdf', note: 'Peso oficial sin dato' },
  { id: 'etc.colorsource-par', brand: 'ETC', model: 'ColorSource PAR', kind: 'ledpar', weightKg: 3.8, powerW: 120, beam: 'según lente', source: 'https://www.etcconnect.com/Products/Entertainment-Fixtures/ColorSource-PAR/Tech-Specs.aspx', note: '90 W típica, 120 W máxima' },
  { id: 'altman.360q', brand: 'Altman', model: '360Q 6x9', kind: 'ellipsoidal', weightKg: 6.15, powerW: 750, beam: '16° haz, 37° campo', source: `${ALTMAN}/2016/08/360Q-Specifications.pdf` },
  { id: 'altman.shakespeare', brand: 'Altman', model: 'Shakespeare (fijo)', kind: 'ellipsoidal', weightKg: 8.5, powerW: 750, beam: '5-50°', source: `${ALTMAN}/2016/08/shakespeare_datasheet.pdf`, note: 'Peso de 8 a 9 kg según el modelo' },
  { id: 'altman.65q', brand: 'Altman', model: '65Q Fresnel 6"', kind: 'fresnel', weightKg: 4.1, powerW: 750, beam: '8,8-59° haz', source: `${ALTMAN}/2016/04/65Q.pdf` },
  { id: 'altman.scoop-153', brand: 'Altman', model: 'Scoop 153 (10")', kind: 'scoop', weightKg: 2.5, powerW: 400, beam: 'abierto', source: `${ALTMAN}/2018/10/Scoop153_Disc_Oct2018.pdf` },
  { id: 'altman.scoop-161', brand: 'Altman', model: 'Scoop 161 (16")', kind: 'scoop', weightKg: 3.83, powerW: 1000, beam: 'abierto', source: `${ALTMAN}/2016/04/Scoop161.pdf` },
  { id: 'altman.zipstrip-1', brand: 'Altman', model: 'Zip Strip ZS-1', kind: 'strip', weightKg: 6.8, powerW: 750, beam: 'abierto', source: `${ALTMAN}/2020/08/ZipStripData.pdf`, note: 'Potencia por circuito; MR-16 de 12 V' },
  { id: 'altman.zipstrip-4', brand: 'Altman', model: 'Zip Strip ZS-4', kind: 'strip', weightKg: 27, powerW: 750, beam: 'abierto', source: `${ALTMAN}/2020/08/ZipStripData.pdf`, note: 'Potencia por circuito' },
  { id: 'altman.econocyc', brand: 'Altman', model: 'EconoCyc', kind: 'cyc', weightKg: 4.3, powerW: 2000, beam: 'asimétrico', source: `${ALTMAN}/2016/04/EconoCyc.pdf` },
  { id: 'rj.614sx', brand: 'Robert Juliat', model: '614SX', kind: 'ellipsoidal', weightKg: 13, powerW: 1200, beam: '16-35°', source: 'https://www.robertjuliat.com/Product_Specifications/Fiches_EN/Standard/DSEN049_614SX.pdf', note: '1000/1200 W; 695 × 330 × 415 mm' },
  { id: 'rj.merlin-1515', brand: 'Robert Juliat', model: 'Merlin 1515', kind: 'followspot', weightKg: 76, powerW: 2500, beam: 'zoom', source: 'https://www.robertjuliat.com/Product_Specifications/Fiches_EN/Standard/DSEN226_1515.pdf', note: 'HMI de 2500 W' },
  // No datasheet read: generic types marked as estimates (decided 2026-11-02).
  { id: 'generic.par64', brand: 'Generic', model: 'PAR 64 (1000 W)', kind: 'par', weightKg: 3.6, powerW: 1000, beam: 'según lámpara', estimate: true, note: 'Estimación; ficha sin leer' },
  { id: 'generic.par56', brand: 'Generic', model: 'PAR 56 (300 W)', kind: 'par', weightKg: 2.0, powerW: 300, beam: 'según lámpara', estimate: true, note: 'Estimación' },
  { id: 'generic.fresnel-2k', brand: 'Generic', model: 'Fresnel 2 kW', kind: 'fresnel', weightKg: null, powerW: 2000, beam: 'zoom', estimate: true },
  { id: 'generic.pc-1k', brand: 'Generic', model: 'PC 1 kW', kind: 'pc', weightKg: null, powerW: 1000, beam: 'zoom', estimate: true },
];

const SHURE = 'https://pubs.shure.com/view/guide';

export const AUDIO: AudioModel[] = [
  { id: 'shure.sm58', brand: 'Shure', model: 'SM58', kind: 'mic', micType: 'dynamic', pattern: 'Cardioide', weightKg: 0.33, source: `${SHURE}/SM58/en-US.pdf` },
  { id: 'shure.sm57', brand: 'Shure', model: 'SM57', kind: 'mic', micType: 'dynamic', pattern: 'Cardioide', weightKg: 0.284, source: `${SHURE}/SM57/en-US.pdf` },
  { id: 'shure.beta52a', brand: 'Shure', model: 'Beta 52A', kind: 'mic', micType: 'dynamic', pattern: 'Supercardioide', weightKg: 0.605, source: 'https://content-files.shure.com/Pubs/BETA/Beta52a_Spec_Sheet.pdf' },
  { id: 'shure.beta91a', brand: 'Shure', model: 'Beta 91A', kind: 'mic', micType: 'condenser', pattern: 'Semicardioide (de superficie)', weightKg: 0.47, source: `${SHURE}/BETA91A/en-US.pdf` },
  { id: 'shure.sm81', brand: 'Shure', model: 'SM81', kind: 'mic', micType: 'condenser', pattern: 'Cardioide', weightKg: null, source: `${SHURE}/SM81/en-US.pdf`, note: 'Fantasma de 11 a 52 V según la guía' },
  { id: 'shure.ksm137', brand: 'Shure', model: 'KSM137', kind: 'mic', micType: 'condenser', pattern: 'Cardioide', weightKg: null, source: `${SHURE}/KSM137/en-US.pdf` },
  { id: 'shure.ksm32', brand: 'Shure', model: 'KSM32', kind: 'mic', micType: 'condenser', pattern: 'Cardioide', weightKg: null, source: `${SHURE}/KSM32/en-US.pdf` },
  { id: 'sennheiser.e604', brand: 'Sennheiser', model: 'e 604', kind: 'mic', micType: 'dynamic', pattern: 'Cardioide', weightKg: 0.06, source: 'https://www.sennheiser.com/en-us/catalog/products/microphones/e-604/e-604-004519', note: 'Sin cable' },
  { id: 'sennheiser.e609', brand: 'Sennheiser', model: 'e 609', kind: 'mic', micType: 'dynamic', pattern: 'Supercardioide', weightKg: 0.14, source: 'https://docs.cloud.sennheiser.com/en-us/evolution-wired/evolution-wired/specifications-e609.html' },
  { id: 'sennheiser.e835', brand: 'Sennheiser', model: 'e 835', kind: 'mic', micType: 'dynamic', pattern: 'Cardioide', weightKg: 0.33, source: 'https://www.sennheiser.com/en-us/catalog/products/microphones/e-835/e-835-004513', note: '330 o 346 g según la página' },
  { id: 'sennheiser.e906', brand: 'Sennheiser', model: 'e 906', kind: 'mic', micType: 'dynamic', pattern: 'Supercardioide', weightKg: 0.14, source: 'https://www.sennheiser.com/en-se/catalog/products/microphones/e-906/e-906-500202' },
  { id: 'akg.c414xlii', brand: 'AKG', model: 'C414 XLII', kind: 'mic', micType: 'condenser', pattern: 'Nueve patrones', weightKg: 0.3, source: 'https://www.akg.com/microphones/condenser-microphones/C414+XLII.html', note: '48 V (44 a 52 V)' },
  { id: 'radial.jdi', brand: 'Radial', model: 'JDI', kind: 'di', weightKg: 0.703, source: 'https://www.radialeng.com/product/jdi/specifications', note: 'Pasiva; 127 × 84 × 46 mm' },
  { id: 'radial.prodi', brand: 'Radial', model: 'ProDI', kind: 'di', weightKg: null, source: 'https://www.radialeng.com/product/prodi/specifications', note: 'Pasiva; ignora el fantasma' },
  { id: 'radial.j48', brand: 'Radial', model: 'J48', kind: 'di', weightKg: null, source: 'https://www.radialeng.com/product/j48', note: 'Activa; fantasma de 48 V' },
  { id: 'shure.psm300', brand: 'Shure', model: 'PSM 300', kind: 'iem', weightKg: 0.783, source: 'https://content-files.shure.com/Pubs/PSM300/PSM300_Spec_Sheet.pdf', note: 'Emisor; petaca P3R 98 g sin pilas' },
  { id: 'shure.psm900', brand: 'Shure', model: 'PSM 900', kind: 'iem', weightKg: 0.85, source: 'https://content-files.shure.com/Pubs/psm900/psm900-datasheet.pdf', note: 'Emisor' },
  { id: 'behringer.x32', brand: 'Behringer', model: 'X32', kind: 'console', weightKg: null, inputs: 32, source: 'https://www.behringer.com/en/products/0603-ACE', note: 'Peso y medidas sin dato' },
  { id: 'midas.m32', brand: 'Midas', model: 'M32', kind: 'console', weightKg: null, inputs: 40, source: 'https://www.midasconsoles.com/en/products/0603-ADX', note: 'Peso y medidas sin dato' },
  { id: 'midas.dl16', brand: 'Midas', model: 'DL16', kind: 'stagebox', weightKg: null, inputs: 16, source: 'https://www.midasconsoles.com/en/products/0606-ACJ', note: '16 entradas, 8 salidas; peso y medidas sin dato' },
  { id: 'midas.dl32', brand: 'Midas', model: 'DL32', kind: 'stagebox', weightKg: 5.7, inputs: 32, source: 'https://cdn.mediavalet.com/aunsw/musictribe/I2S29IMZHUa0yyJi8oqqEQ/oeq7RxOvc0uXAz8JkXayZA/Original/QSG_MI_0606-ACR_DL32_JP.pdf', note: '483 × 242 × 138 mm; 32 entradas, 16 salidas' },
  { id: 'yamaha.dm3', brand: 'Yamaha', model: 'DM3', kind: 'console', weightKg: 6.5, inputs: 16, source: 'https://usa.yamaha.com/products/proaudio/mixers/dm3/specs.html', note: '320 × 140 × 455 mm' },
  { id: 'yamaha.ql1', brand: 'Yamaha', model: 'QL1', kind: 'console', weightKg: 14.7, source: 'https://usa.yamaha.com/products/proaudio/mixers/ql_series/specs.html', note: '468 × 272 × 562 mm; descatalogada' },
  { id: 'yamaha.cl5', brand: 'Yamaha', model: 'CL5', kind: 'console', weightKg: 36, source: 'https://usa.yamaha.com/products/proaudio/mixers/cl_series/specs.html', note: '1053 × 299 × 667 mm; descatalogada' },
  { id: 'sennheiser.ew-dx', brand: 'Sennheiser', model: 'EW-DX', kind: 'wireless', weightKg: null, source: 'https://docs.cloud.sennheiser.com/en-us/ew-d/ew-d/specifications-ew-dx-em2.html', note: 'Receptor EM 2: unos 1000 g; las bandas dependen de la región' },
  { id: 'shure.ulxd', brand: 'Shure', model: 'ULX-D', kind: 'wireless', weightKg: 0.913, source: `${SHURE}/ULXD/en-US.pdf`, note: 'Receptor cuádruple sin antenas; petaca 142 g sin pilas' },
  { id: 'shure.qlxd', brand: 'Shure', model: 'QLX-D', kind: 'wireless', weightKg: 0.777, source: `${SHURE}/QLXD/en-US.pdf`, note: 'Receptor QLXD4 sin antenas; petaca 138 g sin pilas' },
  { id: 'shure.slxd', brand: 'Shure', model: 'SLX-D', kind: 'wireless', weightKg: 0.816, source: 'https://content-files.shure.com/publications/specSheet/en/slx-d-spec-sheet.pdf', note: 'Receptor SLXD4 sin antenas' },
];

export const audioById = (id: string): AudioModel | undefined => AUDIO.find((a) => a.id === id);
export const fixtureById = (id: string): FixtureModel | undefined => FIXTURES.find((f) => f.id === id);

/** What the user reads: "Shure SM57". Free text that is not a model id is shown as it is. */
export const audioLabel = (value: string): string => {
  const m = audioById(value);
  return m ? `${m.brand} ${m.model}` : value;
};

/** The model id for a label the user picked or typed ("shure sm57"), or the text itself when it is no known model. */
export function audioFromLabel(text: string): string {
  const q = text.trim().toLowerCase();
  const m = AUDIO.find((a) => a.id === q || `${a.brand} ${a.model}`.toLowerCase() === q);
  return m ? m.id : text.trim();
}

/** Phantom power follows the microphone type; a DI follows its own model; unknown models say nothing. */
export function needsPhantom(modelId: string): boolean | null {
  const m = audioById(modelId);
  if (!m) return null;
  if (m.kind === 'mic') return m.micType === 'condenser';
  if (m.id === 'radial.j48') return true;
  return false;
}
