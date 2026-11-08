# Patch from the cables (2026-11-08)

Origin: review of 2026-11-08, accepted by the user. A channel's patch was typed by hand while the cables on the plan said the same thing, so the two could disagree. USITT 4.4.2 asks for numbered ports.

## Model

Two optional fields on `Connection`, no format version change:

- `toPort`: the numbered input the cable arrives at (integer from 1, or null)
- `lines`: how many lines the cable carries from that port on (1 to 64, default 1). A drum loom is one cable with 8 lines. It is needed anyway: two elements can only be joined once per signal

`InputChannel.patch` stays. Empty means "take it from the cables"; a typed value wins, as with a typed cable length.

## Which channel goes to which port (`src/model/patch.ts`)

For each audio cable with a `toPort`, in order of destination and port:

1. Channels feeding it: those whose source is the cable's origin. If the origin has none (a DI box in the path), those of whatever feeds the origin, recursively
2. Sorted by channel number, each takes the next free line: `toPort`, `toPort + 1`…
3. The patch reads `<destination label or item name> <port>`, for example `SB 7`

The result is cached per show object.

## Warnings

| Rule | Severity | When |
|---|---|---|
| `portTaken` | error | Two cables reach the same port of an element |
| `portRange` | warning | A port above what the item has (only items with a known count: 16 and 48 channel stageboxes) |
| `patchMismatch` | warning | A typed patch differs from the one the cables give |
| `cableLinesShort` | warning | An element has more channels than lines arriving |

`duplicatePatch` compares typed or derived patches.

## Interface

- Audio connections in the inspector get **Port** and **Lines**
- In the input list, the Patch cell shows the derived value as a placeholder; typing overrides it, clearing it returns to the cables
- PDF, CSV and reports use the typed value or the derived one

## Not included

Output ports on the origin side (the input patch does not need them), and port names.
