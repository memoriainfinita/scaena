// For tests: an example package as it was before it carried real-looking data, so a test that counts what a show
// says (contacts, schedule, lights' numbers) starts from nothing.
import { emptyLuminaire } from '../model/lights.ts';
import { parseShow, type Show } from '../model/schema.ts';

export function bare(show: Show): Show {
  const elements = Object.fromEntries(
    Object.entries(show.elements).map(([id, e]) => [id, e.luminaire ? { ...e, luminaire: { ...emptyLuminaire(), mountId: e.luminaire.mountId } } : e]),
  );
  return parseShow({
    ...show,
    elements,
    contacts: [],
    schedule: [],
    setlist: [],
    workNotes: [],
    hospitality: {},
    contract: {},
    event: {},
    titleBlock: {},
    electrical: {},
    desk: {},
  });
}
