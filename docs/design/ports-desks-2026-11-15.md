# Ports, desks and multichannel connections (2026-11-15)

Design approved by the user on 2026-11-15, from their notes on the first real try of the app. State of the model before this: one desk per show (`show.desk`), channels and outputs that belong to the whole show, and connections that only say "element A to element B" with an optional input number and a count of lines.

## Goals

1. More than one desk in a show (FOH, monitors, broadcast, other), each with its own channel numbering and patch.
2. Every piece of equipment can declare its ports (what it takes in and puts out, in which format, how many channels).
3. A connection joins two ports and says how many channels travel (mono, stereo, 4, 8, 32...), so a stereo link, a pedalboard with four outputs or a desk-to-desk split are one connection each.
4. USB (audio, MIDI, data) is a signal like the others.
5. Video does not enter the channel and output lists, which are audio. It lives in ports and connections and gets its own table in the global panel (see the Elements and Connections panel, later).

## Model (format 2, additive)

All additions are optional with a default, so a format 1 file loads unchanged after an identity migration.

- `SignalType` gains `usb`.
- `Port`: `{ id, name, dir: 'in' | 'out' | 'io', signal: SignalType, format: text, channels: 1..512, note }`. `format` is a short free text with suggestions (analogue, AES, Dante, MADI, USB, HDMI, SDI, DMX...). `PlanElement.ports` is an optional list, empty by default. A library item may bring default ports (consoles and stageboxes already know their physical inputs); the user edits them per element. The `outputs` of a computer stay as they are and are shown as ports in the panels; they are not moved, so nothing the computer module does changes.
- `Desk`: `{ id, name, role: 'foh' | 'monitors' | 'broadcast' | 'other', model, showFile, elementId }`. `Show.desks` is a list; the first one is the main desk. `elementId` links it to a console drawn on the plan when there is one. The old `show.desk` (model and show file) is the data of the main desk; the migration creates the main desk from it, and `show.desk` is kept as a mirror of it so everything that reads it keeps working.
- `InputChannel` keeps `number` and `patch` as its row on the **main desk**: the number is the row order and, by default, the channel number on the main desk. A new `assign` record, by desk id, holds the assignment on any other desk, or an override on the main one: `{ number: int | null, patch }`. `number: null` means the source is not sent to that desk. One row per source, one number per desk, as agreed: changing a mic is done once, and each desk keeps its own numbering and patch.
- `Output` gains `deskId` (optional): the desk the mix comes out of. Absent means the main desk. An output belongs to one desk because a wedge is fed by one desk.
- `Connection` gains `fromPortId` and `toPortId` (optional), `channels` (how many channels travel, 1 to 512, default 1) and `stereo` (the channels are left/right pairs). `lines` and `toPort` (the number of the first input at the far end) keep their meaning for existing files; `channels` wins over `lines` when set. The rule that refuses a second connection of the same signal between the same two elements is relaxed when the ports differ.

## Behaviour

- Desk helpers: `desksOf(show)` (never empty: a virtual main desk when the list is empty), `channelOn(show, channel, deskId)` giving `{ number, patch } | null`, `channelsOnDesk(show, deskId)` sorted by that number, and `outputsOnDesk`.
- The Inputs and Outputs views show one table. With one desk nothing changes. With more, the table gets a desk selector, and the inputs table shows the number and patch of the chosen desk; a row not sent to that desk is greyed and can be added with its number.
- Stereo pairs must start on an odd channel on every desk where they exist (the current validator, applied per desk).
- New validators: more channels than the port has, a port used by two connections, signals that differ at the two ends, two sources with the same number on one desk, a desk with outputs and no inputs sent to it.
- PDF: the inputs and outputs sections print one table per desk when there is more than one, titled with the desk name and role, ordered by that desk's number.

## Risk and order

1. Schema, identity migration to format 2, `usb`, helpers and tests (nothing visible changes).
2. Desk list in the interface and per-desk numbering in Inputs and Outputs.
3. Ports in the inspector and the connection editor, with the new validators.
4. PDF per desk.

Each step ends with typecheck, lint, unit tests and the e2e of the area it touches.
