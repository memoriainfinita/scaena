// The limits of the file format that a form field can reach. The schema and the fields both read them from here,
// so a field can never let through what the file would then refuse.
export const LIMITS = {
  showName: 120,
  /** The label of an element, which is also the whole text of a note on the plan. */
  label: 500,
  notes: 2000,
  voltage: { min: 1, max: 1000 },
  dressingRooms: 99,
  meals: 999,
  setLengthMin: 1440,
  /** The longest item of a setlist, run of show or programme: one day. */
  listSeconds: 86400,
} as const;
