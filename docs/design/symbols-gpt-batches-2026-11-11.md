# Icon sheets for GPT, round 4 (2026-11-11)

Continues `symbols-gpt-batches-2026-11-08.md` (sheets 67 to 74). **Read `symbols-gpt-batches-2026-11-07.md` first**: it holds style block D and the sheet template. For these sheets:

1. Paste **style block D** (objects), then the **sheet prompt** template, then the list of the sheet below.
2. One item per line with its size in cm; icons must not touch each other; ask for extras if GPT has room.
3. Item ids below already exist in the library, **except those marked new**, which are added together with the icon (`docs/design/symbols.md`). An item that exists without icon still draws its old top-view symbol until its sheet comes back.

Why these sheets: `icons-catalog.md` (780 items, 775 with icon) shows only one object without an icon, `effect.co2`. The rest of this round fills gaps found by reading the catalogue category by category against what a rider, a theatre plan or a small-venue plot needs. Not asked: people, lights, amplifiers, PA and desks (covered), `furniture.riser` and `power.outlet` (drawn in plan view on purpose), `note.text` and `note.dimension` (annotations).

| Sheet | Topic | Items | Library state |
|---|---|---|---|
| 75 | Effects, with the CO2 jet | 8 | `effect.co2` exists; the rest **new** |
| 76 | Stage masking, drapes and theatre structure | 12 | **new** |
| 77 | Plucked strings from Spain and Latin America, and others | 12 | **new** |
| 78 | Percussion that is missing | 12 | **new** |
| 79 | Winds that are missing | 9 | **new** |
| 80 | Stands and instrument supports | 9 | **new** |
| 81 | Audio connection points | 6 | **new** |

**Result (2026-11-11):** the seven sheets came back and are in the library. The ids in the tables were adjusted to the library's prefixes when they were added: percussion `perc.*` (category drums), stands `stand.*` (`stand.keyboard-x`, `stand.keyboard-z`, `stand.amp`, `stand.tablet`, `stand.pedalboard-riser`, `stand.sax`, `stand.horn`, `stand.cello`; the stool is `furniture.stool-back`), the counterweight set `mach.counterweight`, the bridge and the grid `rig.bridge-front` and `rig.grid`. The rebab bow that came with sheet 77 was left out.

## Sheet 75 (Effects)

The CO2 jet has been missing since the first rounds because GPT misunderstood it. The wording below describes what is seen, not the name.

| # | Item | id | Size (cm) |
|---|---|---|---|
| 1 | CO2 jet | `effect.co2` | 25 x 25 |
| 2 | Dry ice fogger | `effect.dry-ice` (new) | 60 x 40 |
| 3 | Foam machine | `effect.foam` (new) | 80 x 60 |
| 4 | Flash pot | `effect.flash-pot` (new) | 15 x 15 |
| 5 | Rain machine | `effect.rain` (new) | 100 x 40 |
| 6 | Balloon drop net | `effect.balloon-drop` (new) | 200 x 100 |
| 7 | Inflatable air dancer | `effect.air-dancer` (new) | 60 x 60 |
| 8 | Smoke ring cannon | `effect.vortex` (new) | 40 x 40 |

```text
1 CO2 jet: a short metal nozzle pointing straight up on a small square base, with a thick hose running off to the side to a gas cylinder, and a tall plume of white gas rising from the nozzle (25 x 25 cm)
2 dry ice fogger: a low insulated box with a lid, a hose coming out of the front and a low cloud rolling out of it (60 x 40 cm)
3 foam machine: a large cylindrical tank on a base with a wide nozzle pointing up and a cloud of foam bubbles on top (80 x 60 cm)
4 flash pot: a small squat metal cylinder on a square plate with a short burst of flame and sparks above it (15 x 15 cm)
5 rain machine: a long horizontal pipe with a row of nozzles hanging from two cables, drops falling from it (100 x 40 cm)
6 balloon drop: a large net bag full of balloons hanging from a frame, with a few balloons falling (200 x 100 cm)
7 inflatable air dancer: a tall wavy tube figure with two flailing arms on a small blower base (60 x 60 cm)
8 smoke ring cannon: a short wide barrel pointing right, with a ring of smoke leaving it (40 x 40 cm)
```

## Sheet 76 (Stage masking, drapes and theatre structure)

Terms follow `docs/research/glosario-escena.md`: telón de boca, bambalina, pata, ciclorama, telón cortafuegos, puente frontal.

| # | Item | id | Size (cm) |
|---|---|---|---|
| 1 | Main curtain, closed | `scenery.main-curtain` (new) | 600 x 40 |
| 2 | Main curtain, drawn open | `scenery.main-curtain-open` (new) | 600 x 40 |
| 3 | Border (bambalina) | `scenery.border` (new) | 600 x 30 |
| 4 | Cyclorama cloth | `scenery.cyc-cloth` (new) | 800 x 20 |
| 5 | Pair of legs | `scenery.legs-pair` (new) | 300 x 20 |
| 6 | Traveller track with curtain | `scenery.traveller` (new) | 600 x 30 |
| 7 | Fire curtain | `scenery.fire-curtain` (new) | 600 x 30 |
| 8 | Proscenium frame | `scenery.proscenium` (new) | 800 x 60 |
| 9 | Black cube | `scenery.cube` (new) | 50 x 50 |
| 10 | Counterweight set | `machinery.counterweight` (new) | 60 x 60 |
| 11 | Front lighting bridge | `rigging.bridge-front` (new) | 600 x 80 |
| 12 | Grid (peine) | `rigging.grid` (new) | 300 x 200 |

```text
1 theatre main curtain closed: a wide heavy curtain with deep vertical folds hanging from a top valance (600 x 40 cm)
2 theatre main curtain drawn open: two heavy curtains gathered to each side with tie-backs, the middle empty (600 x 40 cm)
3 stage border: a wide flat horizontal black fabric panel hanging from a pipe by ties (600 x 30 cm)
4 cyclorama: a wide smooth pale cloth stretched tight between a top and a bottom pipe (800 x 20 cm)
5 two black stage legs: tall narrow fabric panels hanging side by side from a pipe, seen from the front (300 x 20 cm)
6 traveller curtain on a track: a curtain with folds hanging from an overhead rail with a pull cord (600 x 30 cm)
7 fire curtain: a heavy riveted iron shutter half lowered, with a chain and guide rails at the sides (600 x 30 cm)
8 proscenium arch frame: a wide rectangular frame around an opening with a decorative top and side columns (800 x 60 cm)
9 black cube: a plain cube stage block with a slightly bevelled top edge (50 x 50 cm)
10 counterweight set: a tall rail with a rope, a pulley on top and a stack of weights in a carriage (60 x 60 cm)
11 front lighting bridge: a long horizontal walkway with railings and a row of lamps hanging from its front edge (600 x 80 cm)
12 theatre grid: a flat lattice of crossing beams with pulleys at the joints (300 x 200 cm)
```

## Sheet 77 (Plucked strings from Spain and Latin America, and others)

| # | Item | id | Size (cm) |
|---|---|---|---|
| 1 | Bandurria | `strings.bandurria` (new) | 20 x 60 |
| 2 | Venezuelan cuatro | `strings.cuatro` (new) | 25 x 80 |
| 3 | Tiple | `strings.tiple` (new) | 30 x 90 |
| 4 | Mexican vihuela | `strings.vihuela` (new) | 30 x 90 |
| 5 | Guitarrón mexicano | `strings.guitarron` (new) | 55 x 110 |
| 6 | Bajo sexto | `strings.bajo-sexto` (new) | 40 x 110 |
| 7 | Tres cubano | `strings.tres` (new) | 35 x 90 |
| 8 | Mandola | `strings.mandola` (new) | 30 x 75 |
| 9 | Electric violin | `strings.electric-violin` (new) | 25 x 60 |
| 10 | Kantele | `strings.kantele` (new) | 30 x 70 |
| 11 | N'goni | `strings.ngoni` (new) | 25 x 90 |
| 12 | Rebab | `strings.rebab` (new) | 25 x 70 |

```text
1 bandurria: a small flat-backed lute with a pear-shaped body, twelve strings in six pairs and a short neck (20 x 60 cm)
2 cuatro: a small four-string guitar with a figure-eight body and a short neck (25 x 80 cm)
3 tiple: a small guitar-like instrument with twelve strings in four triple courses (30 x 90 cm)
4 vihuela: a small round-backed guitar with five strings and a short neck (30 x 90 cm)
5 guitarrón: a very large deep-bodied round-backed bass guitar with a short wide neck (55 x 110 cm)
6 bajo sexto: a large twelve-string guitar with a deep body and a long neck (40 x 110 cm)
7 tres: a guitar-like instrument with three pairs of strings and a small waisted body (35 x 90 cm)
8 mandola: a larger mandolin with a deep round-backed teardrop body and four pairs of strings (30 x 75 cm)
9 electric violin: a thin skeletal violin body without a resonating box, with a chin rest (25 x 60 cm)
10 kantele: a flat wing-shaped zither with a row of strings, held on the lap (30 x 70 cm)
11 n'goni: a long-necked lute with a small oval body, without a pegboard, played with the fingers (25 x 90 cm)
12 rebab: a bowed spike fiddle with a round body, a long neck and two strings (25 x 70 cm)
```

## Sheet 78 (Percussion that is missing)

The people exist for the marimba and the vibraphone (and the timpanist); the instruments do not.

| # | Item | id | Size (cm) |
|---|---|---|---|
| 1 | Timpani set | `drums.timpani` (new) | 160 x 80 |
| 2 | Marimba | `drums.marimba` (new) | 200 x 90 |
| 3 | Vibraphone | `drums.vibraphone` (new) | 130 x 80 |
| 4 | Bodhran | `drums.bodhran` (new) | 45 x 45 |
| 5 | Castanets | `drums.castanets` (new) | 10 x 10 |
| 6 | Cabasa | `drums.cabasa` (new) | 15 x 15 |
| 7 | Vibraslap | `drums.vibraslap` (new) | 15 x 25 |
| 8 | Rainstick | `drums.rainstick` (new) | 10 x 80 |
| 9 | Bombo legüero | `drums.bombo-leguero` (new) | 50 x 50 |
| 10 | Balafon | `drums.balafon` (new) | 120 x 60 |
| 11 | Ratchet | `drums.ratchet` (new) | 15 x 25 |
| 12 | Crash cymbal on a stand | `drums.crash` (new) | 45 x 45 |

```text
1 set of four copper timpani of different sizes in a curve, each on a tripod with a tuning pedal (160 x 80 cm)
2 marimba: a long row of wooden bars with a tube resonator under each, on a frame with four legs (200 x 90 cm)
3 vibraphone: two rows of metal bars with tube resonators and a pedal, on a frame with wheels (130 x 80 cm)
4 bodhran: a shallow wide Irish frame drum held with one hand, with a crossbar inside and a short double-ended stick (45 x 45 cm)
5 castanets: two small shell-shaped wooden clappers joined by a cord (10 x 10 cm)
6 cabasa: a metal cylinder wrapped in rows of steel beads with a wooden handle (15 x 15 cm)
7 vibraslap: a wooden ball on a metal rod joined to a box with a row of loose pins (15 x 25 cm)
8 rainstick: a long hollow tube with spiral pins inside and decorated ends (10 x 80 cm)
9 bombo legüero: a deep wide drum with a laced body, a hoop and a mallet on top (50 x 50 cm)
10 balafon: a row of wooden bars over gourds of descending size on a curved frame (120 x 60 cm)
11 ratchet: a wooden cog wheel in a frame with a tongue and a handle (15 x 25 cm)
12 crash cymbal on a straight stand with a tripod base (45 x 45 cm)
```

## Sheet 79 (Winds that are missing)

| # | Item | id | Size (cm) |
|---|---|---|---|
| 1 | Melodica | `winds.melodica` (new) | 40 x 12 |
| 2 | Cornet | `winds.cornet` (new) | 30 x 12 |
| 3 | Bugle | `winds.bugle` (new) | 30 x 12 |
| 4 | Alphorn | `winds.alphorn` (new) | 40 x 220 |
| 5 | English horn | `winds.cor-anglais` (new) | 15 x 80 |
| 6 | Contrabassoon | `winds.contrabassoon` (new) | 40 x 130 |
| 7 | Bass trombone | `winds.bass-trombone` (new) | 25 x 130 |
| 8 | Jaw harp | `winds.jaw-harp` (new) | 8 x 12 |
| 9 | Slide whistle | `winds.slide-whistle` (new) | 6 x 35 |

```text
1 melodica: a small keyboard with a blow tube mouthpiece at one end (40 x 12 cm)
2 cornet: a short compact brass instrument with three valves and a conical bore, wound twice (30 x 12 cm)
3 bugle: a short brass instrument with no valves, wound once with a flared bell (30 x 12 cm)
4 alphorn: a very long straight wooden horn with a flared bell resting on the ground (40 x 220 cm)
5 English horn: a slim reed instrument with a bulb-shaped bell and a bent crook at the top (15 x 80 cm)
6 contrabassoon: a very large folded reed instrument with a long metal crook and a downward bell (40 x 130 cm)
7 bass trombone: a large trombone with a wide bell and a trigger on the slide (25 x 130 cm)
8 jaw harp: a small metal frame with a bent tongue in the middle (8 x 12 cm)
9 slide whistle: a thin tube with a mouthpiece and a plunger rod (6 x 35 cm)
```

## Sheet 80 (Stands and instrument supports)

| # | Item | id | Size (cm) |
|---|---|---|---|
| 1 | Keyboard stand, X type | `furniture.keyboard-x` (new) | 100 x 40 |
| 2 | Keyboard stand, Z type | `furniture.keyboard-z` (new) | 100 x 45 |
| 3 | Amp stand | `furniture.amp-stand` (new) | 60 x 40 |
| 4 | Tablet stand | `furniture.tablet-stand` (new) | 25 x 25 |
| 5 | Pedalboard riser | `furniture.pedalboard-riser` (new) | 80 x 40 |
| 6 | Saxophone stand | `furniture.sax-stand` (new) | 30 x 30 |
| 7 | Horn stand | `furniture.horn-stand` (new) | 25 x 25 |
| 8 | Cello stand | `furniture.cello-stand` (new) | 40 x 40 |
| 9 | Stool with backrest | `furniture.stool-back` (new) | 40 x 40 |

```text
1 X-type keyboard stand: a keyboard resting on two crossed metal frames, seen from the front (100 x 40 cm)
2 Z-type keyboard stand: a keyboard resting on a folded Z-shaped metal frame with a wing nut (100 x 45 cm)
3 amp stand: a short angled platform with two folding legs that tilts a combo amp back (60 x 40 cm)
4 tablet stand: a clamp with a flexible neck holding a tablet in front of a mic stand pole (25 x 25 cm)
5 pedalboard riser: a flat board tilted on two low wedges with a few pedals on it (80 x 40 cm)
6 saxophone stand: a folding stand with a tripod base and a padded cradle with a peg (30 x 30 cm)
7 horn stand: a small folding stand with a bell holder and a long pole (25 x 25 cm)
8 cello stand: a stand with a curved holder for the body and a spike plate, seen from the side (40 x 40 cm)
9 stool with a low backrest and a round padded seat on a tripod base (40 x 40 cm)
```

## Sheet 81 (Audio connection points)

| # | Item | id | Size (cm) |
|---|---|---|---|
| 1 | Stage pocket | `rack.stage-pocket` (new) | 20 x 15 |
| 2 | Floor pocket | `rack.floor-pocket` (new) | 25 x 25 |
| 3 | Wall XLR panel | `rack.wall-panel` (new) | 30 x 15 |
| 4 | Fan-out tail | `rack.fanout` (new) | 25 x 25 |
| 5 | Antenna paddle | `rack.paddle` (new) | 20 x 20 |
| 6 | Speaker cable box | `rack.speaker-box` (new) | 25 x 20 |

```text
1 stage pocket: a small metal box with a row of XLR sockets on its face, mounted at the stage edge (20 x 15 cm)
2 floor pocket: a square floor-recessed box with a hinged lid and a row of connectors inside (25 x 25 cm)
3 wall panel: a flat plate with two rows of XLR sockets and a few speaker sockets (30 x 15 cm)
4 fan-out tail: a thick cable that splits into several thin cables with male XLR plugs, each with a label tag (25 x 25 cm)
5 paddle antenna: a flat directional antenna with a mounting bracket on a pole, pointing right (20 x 20 cm)
6 speaker cable box: a small box with four speaker sockets on the front and a handle (25 x 20 cm)
```
