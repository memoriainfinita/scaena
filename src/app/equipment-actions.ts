// What the equipment view remembers while it is open: the sub-tab and the filters. The edits themselves are the ones of the inspector.
import { signal } from '@preact/signals';
import { NO_EQUIPMENT_FILTER, type ConnectionFilter, type EquipmentFilter } from '../model/equipment.ts';

export type EquipTab = 'elements' | 'connections' | 'video';
export const equipTab = signal<EquipTab>('elements');
export const equipFilter = signal<EquipmentFilter>(NO_EQUIPMENT_FILTER);
export const connFilter = signal<ConnectionFilter>({ query: '', signal: '' });

export const setEquipFilter = (patch: Partial<EquipmentFilter>): void => {
  equipFilter.value = { ...equipFilter.value, ...patch };
};
export const setConnFilter = (patch: Partial<ConnectionFilter>): void => {
  connFilter.value = { ...connFilter.value, ...patch };
};
