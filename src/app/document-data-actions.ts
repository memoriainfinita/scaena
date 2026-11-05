// Edits of what the printed document says about the production: title block, date, contacts and schedule.
import { nextId } from '../model/ids.ts';
import type { Show } from '../model/schema.ts';
import { session } from './state.ts';

type Contact = Show['contacts'][number];

const commit = (fn: (show: Show) => Show): void => session.value?.commit(fn);

export const setTitleBlock = (patch: Partial<Show['titleBlock']>): void => commit((show) => ({ ...show, titleBlock: { ...show.titleBlock, ...patch } }));
export const setDate = (date: string): void => commit((show) => ({ ...show, date }));
export const setRevisionNumber = (n: number): void => commit((show) => ({ ...show, revision: Math.max(1, Math.round(n)) }));

export const addContact = (): void =>
  commit((show) => {
    const [id, s] = nextId(show, 'ct');
    const c: Contact = { id, role: '', name: '', phone: '', email: '', hidden: [] };
    return { ...s, contacts: [...s.contacts, c] };
  });
export const updateContact = (id: string, patch: Partial<Omit<Contact, 'id'>>): void => commit((show) => ({ ...show, contacts: show.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
export const removeContact = (id: string): void => commit((show) => ({ ...show, contacts: show.contacts.filter((c) => c.id !== id) }));
/** Whether a field of a contact is left out of the printed document. */
export const setContactHidden = (id: string, field: 'phone' | 'email', hide: boolean): void =>
  commit((show) => ({ ...show, contacts: show.contacts.map((c) => (c.id === id ? { ...c, hidden: hide ? [...new Set([...c.hidden, field])] : c.hidden.filter((f) => f !== field) } : c)) }));

