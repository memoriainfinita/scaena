# Monitor mixes

Proposed on 2026-11-08 and accepted by the user. Before this, an output could only say who it was for and what it carried in free text, in its notes.

## Model

`Output` in `src/model/schema.ts` gains two optional fields, so the file format does not change:

- `who`: who listens to it, free text.
- `mix`: a record from channel id to `low`, `normal` or `high`. A channel that is absent is not sent.

Three levels because that is what a rider says ("a little", "yes", "more"). Numbers in dB would promise a precision nobody has before the soundcheck.

Every output except `main` carries a mix (`mixOutputs`). Setting one channel of a stereo pair sets the other. Removing a channel removes it from every mix.

## Where it shows

- Outputs view: a **For** column, and a matrix below the table with one column per mix and one row per channel, read across like the sends of a desk.
- Document, *Outputs* section: a *Monitor mixes* table with one row per mix, listing its channels in channel order with the level in words. A list and not the matrix, because with many channels a matrix does not fit a page. Mixes with no listener and no channels are left out.
- Outputs report and its CSV: **For** and **Mix** columns.

The rock example fills one mix per wedge.
