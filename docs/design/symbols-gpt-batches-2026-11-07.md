# Icon sheets for GPT (2026-11-07)

The icons of the library are asked from GPT in sheets of 12 (4 columns x 3 rows), always with the same **style block** pasted first so every sheet looks alike. A sheet is cut, traced to SVG and matched back to the library items by its order. Style decided 2026-11-07 after a style test (solid black with bold white detail, front or three-quarter view).

Left as drawn, not asked from GPT: the 15 luminaires (RP-2 convention) and the 3 power items. Text note and Dimension are not objects. Drawn in the style test and accepted: 5-piece drum kit, Guitar amp, Keyboard, Vocal mic with stand, PA speaker, Mixing desk, Rack, Stage box, Riser, Subwoofer, PA line array.

## Style block

```text
Style: flat black-and-white pictograms for a live-music stage plot. Solid black shapes with bold white interior lines for detail, at a medium level of detail: the features that make each object recognisable (drum heads and cymbals, knobs and handle on an amp, faders on a desk, cone and grille on a speaker), but no more than about 10 interior details per icon. Every interior line is at least 2% of the icon's width thick; no hairlines, no shading, no gradients, no grey, no texture, no dots or mesh patterns (a grille is two or three plain concentric rings), no text. Rounded corners. Clear front or three-quarter view from slightly above, with a distinctive silhouette for every object. People: the head is a plain solid black circle with no hairline, face, neck or hood, separated from the shoulders by a thin white gap.
```

## Sheet prompt

```text
<STYLE BLOCK>

Create ONE image: a sheet of N icons in a 4 columns x 3 rows grid, on a pure white background, each icon centred in its own cell with generous white margin, no cell borders, no numbers. Show every object at the same relative scale, keeping the proportions given (width x depth in cm).

Icons in reading order (left to right, top to bottom):
<LIST>
```

## Sheet 1

| # | Item | id | Size (cm) |
|---|---|---|---|
| 1 | Double bass | `strings.doublebass` | 60 x 60 |
| 2 | Violin or viola | `strings.violin` | 70 x 70 |
| 3 | Cello | `strings.cello` | 70 x 90 |
| 4 | Harp | `strings.harp` | 90 x 100 |
| 5 | Acoustic guitar | `strings.guitar-acoustic` | 50 x 50 |
| 6 | Electric guitarist | `guitar.electric` | 90 x 90 |
| 7 | Bass player | `guitar.bass` | 90 x 90 |
| 8 | Saxophone | `winds.sax` | 60 x 70 |
| 9 | Trumpet | `winds.brass` | 50 x 70 |
| 10 | Trombone | `winds.trombone` | 60 x 90 |
| 11 | Flute or clarinet | `winds.flute` | 60 x 60 |
| 12 | Person | `person.standing` | 50 x 50 |

List to paste:

```text
1 double bass (60 x 60 cm)
2 violin or viola (70 x 70 cm)
3 cello (70 x 90 cm)
4 harp (90 x 100 cm)
5 acoustic guitar (50 x 50 cm)
6 electric guitarist (90 x 90 cm)
7 bass player (90 x 90 cm)
8 saxophone (60 x 70 cm)
9 trumpet (50 x 70 cm)
10 trombone (60 x 90 cm)
11 flute or clarinet (60 x 60 cm)
12 person (50 x 50 cm)
```

## Sheet 2

| # | Item | id | Size (cm) |
|---|---|---|---|
| 1 | Seated person | `person.seated` | 60 x 60 |
| 2 | Presenter | `person.presenter` | 60 x 60 |
| 3 | Wireless headset | `vocals.headset` | 50 x 50 |
| 4 | Small drum kit | `kit.drums-small` | 140 x 120 |
| 5 | Bass amp | `amp.bass` | 80 x 45 |
| 6 | Grand piano | `keys.piano` | 150 x 200 |
| 7 | Wind player | `winds.player` | 50 x 50 |
| 8 | Wedge monitor | `monitor.wedge` | 60 x 40 |
| 9 | In-ear pack | `monitor.iem` | 15 x 10 |
| 10 | DI box | `rack.di` | 13 x 9 |
| 11 | DJ booth | `dj.booth` | 180 x 70 |
| 12 | Chair | `furniture.chair` | 45 x 45 |

List to paste:

```text
1 seated person (60 x 60 cm)
2 presenter (60 x 60 cm)
3 wireless headset (50 x 50 cm)
4 small drum kit (140 x 120 cm)
5 bass amp (80 x 45 cm)
6 grand piano (150 x 200 cm)
7 wind player (50 x 50 cm)
8 wedge monitor (60 x 40 cm)
9 in-ear pack (15 x 10 cm)
10 di box (13 x 9 cm)
11 dj booth (180 x 70 cm)
12 chair (45 x 45 cm)
```

## Sheet 3

| # | Item | id | Size (cm) |
|---|---|---|---|
| 1 | Music stand | `furniture.music-stand` | 50 x 40 |
| 2 | Table | `furniture.table` | 180 x 70 |
| 3 | Flight case | `furniture.flightcase` | 80 x 60 |
| 4 | Lectern | `furniture.lectern` | 70 x 50 |
| 5 | Audience area | `room.audience` | 800 x 600 |
| 6 | FOH position | `room.foh` | 150 x 80 |
| 7 | Access | `room.access` | 120 x 30 |
| 8 | Laptop | `control.laptop` | 40 x 30 |
| 9 | Lighting desk | `control.lightdesk` | 90 x 50 |
| 10 | Dimmer rack | `rack.dimmer` | 60 x 60 |
| 11 | Video switcher | `control.videomixer` | 50 x 35 |
| 12 | Screen | `video.screen` | 300 x 12 |

List to paste:

```text
1 music stand (50 x 40 cm)
2 table (180 x 70 cm)
3 flight case (80 x 60 cm)
4 lectern (70 x 50 cm)
5 audience area (800 x 600 cm)
6 foh position (150 x 80 cm)
7 access (120 x 30 cm)
8 laptop (40 x 30 cm)
9 lighting desk (90 x 50 cm)
10 dimmer rack (60 x 60 cm)
11 video switcher (50 x 35 cm)
12 screen (300 x 12 cm)
```

## Sheet 4

| # | Item | id | Size (cm) |
|---|---|---|---|
| 1 | Projector | `video.projector` | 45 x 35 |
| 2 | Curtain or leg | `scenery.curtain` | 300 x 15 |
| 3 | Stairs | `scenery.stairs` | 100 x 120 |
| 4 | Platform | `scenery.platform` | 200 x 200 |
| 5 | Hazer | `effect.haze` | 45 x 30 |
| 6 | Smoke machine | `effect.smoke` | 45 x 30 |
| 7 | Strobe | `effect.strobe` | 45 x 20 |
| 8 | Congas | `perc.congas` | 90 x 70 |
| 9 | Cajón | `perc.cajon` | 50 x 60 |
| 10 | Percussion table | `perc.table` | 180 x 90 |
| 11 | Electronic drum kit | `kit.drums-electronic` | 140 x 120 |
| 12 | Pedalboard | `guitar.pedalboard` | 70 x 35 |

List to paste:

```text
1 projector (45 x 35 cm)
2 curtain or leg (300 x 15 cm)
3 stairs (100 x 120 cm)
4 platform (200 x 200 cm)
5 hazer (45 x 30 cm)
6 smoke machine (45 x 30 cm)
7 strobe (45 x 20 cm)
8 congas (90 x 70 cm)
9 cajón (50 x 60 cm)
10 percussion table (180 x 90 cm)
11 electronic drum kit (140 x 120 cm)
12 pedalboard (70 x 35 cm)
```

## Sheet 5

| # | Item | id | Size (cm) |
|---|---|---|---|
| 1 | Guitar cabinet 4×12 | `amp.stack` | 80 x 40 |
| 2 | Synthesizer | `keys.synth` | 110 x 40 |
| 3 | Stage piano | `keys.stage-piano` | 140 x 40 |
| 4 | Organ | `keys.organ` | 130 x 80 |
| 5 | Handheld vocal | `vocals.handheld` | 70 x 70 |
| 6 | Choir on risers | `vocals.choir` | 400 x 200 |
| 7 | Front fill | `pa.front-fill` | 40 x 30 |
| 8 | Delay tower | `pa.delay` | 50 x 50 |
| 9 | Side fill | `monitor.sidefill` | 70 x 60 |
| 10 | Drum fill | `monitor.drumfill` | 70 x 60 |
| 11 | IEM rack | `rack.iem` | 55 x 60 |
| 12 | Wireless rack | `rack.wireless` | 55 x 60 |

List to paste:

```text
1 guitar cabinet 4×12 (80 x 40 cm)
2 synthesizer (110 x 40 cm)
3 stage piano (140 x 40 cm)
4 organ (130 x 80 cm)
5 handheld vocal (70 x 70 cm)
6 choir on risers (400 x 200 cm)
7 front fill (40 x 30 cm)
8 delay tower (50 x 50 cm)
9 side fill (70 x 60 cm)
10 drum fill (70 x 60 cm)
11 iem rack (55 x 60 cm)
12 wireless rack (55 x 60 cm)
```

## Sheet 6

| # | Item | id | Size (cm) |
|---|---|---|---|
| 1 | Amplifier rack | `rack.amps` | 60 x 80 |
| 2 | FX rack | `rack.fx` | 55 x 60 |
| 3 | Network switch | `rack.network` | 45 x 25 |
| 4 | Analog desk | `desk.analog` | 110 x 70 |
| 5 | Monitor desk | `desk.monitor` | 90 x 60 |
| 6 | DJ controller | `dj.controller` | 80 x 40 |
| 7 | Turntables and mixer | `dj.turntables` | 130 x 45 |
| 8 | Stool | `furniture.stool` | 40 x 40 |
| 9 | Bench | `furniture.bench` | 120 x 40 |
| 10 | Cable ramp | `furniture.cable-ramp` | 100 x 30 |
| 11 | Flat or set piece | `scenery.flat` | 200 x 10 |
| 12 | Ladder | `scenery.ladder` | 50 x 180 |

List to paste:

```text
1 amplifier rack (60 x 80 cm)
2 fx rack (55 x 60 cm)
3 network switch (45 x 25 cm)
4 analog desk (110 x 70 cm)
5 monitor desk (90 x 60 cm)
6 dj controller (80 x 40 cm)
7 turntables and mixer (130 x 45 cm)
8 stool (40 x 40 cm)
9 bench (120 x 40 cm)
10 cable ramp (100 x 30 cm)
11 flat or set piece (200 x 10 cm)
12 ladder (50 x 180 cm)
```

## Sheet 7

| # | Item | id | Size (cm) |
|---|---|---|---|
| 1 | Laser | `effect.laser` | 40 x 30 |
| 2 | Mirror ball | `effect.mirror-ball` | 50 x 50 |
| 3 | CO2 jet | `effect.co2` | 25 x 25 |
| 4 | LED wall | `video.led-wall` | 400 x 15 |
| 5 | Monitor or TV | `video.tv` | 100 x 30 |
| 6 | Camera | `video.camera` | 60 x 60 |
| 7 | Control tablet | `control.tablet` | 28 x 20 |
| 8 | PC or media server | `control.server` | 45 x 45 |

List to paste:

```text
1 laser (40 x 30 cm)
2 mirror ball (50 x 50 cm)
3 co2 jet (25 x 25 cm)
4 led wall (400 x 15 cm)
5 monitor or tv (100 x 30 cm)
6 camera (60 x 60 cm)
7 control tablet (28 x 20 cm)
8 pc or media server (45 x 45 cm)
```

## Sheet 8 (Microphones and wireless)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Mic on tall boom stand | `mic.boom-tall` | 50 x 50 |
| 2 | Mic on short boom stand | `mic.boom-short` | 40 x 40 |
| 3 | Mic on straight stand | `mic.straight` | 40 x 40 |
| 4 | Gooseneck mic | `mic.gooseneck` | 10 x 10 |
| 5 | Stereo pair on bar | `mic.stereo-pair` | 60 x 40 |
| 6 | Boundary mic | `mic.boundary` | 20 x 20 |
| 7 | Shotgun mic on pole | `mic.shotgun` | 40 x 40 |
| 8 | Wireless handheld mic | `mic.wireless-handheld` | 10 x 10 |
| 9 | Wireless receiver | `rack.wireless-receiver` | 25 x 20 |
| 10 | Antenna on stand | `rack.antenna` | 30 x 30 |
| 11 | Speaker on tripod | `pa.tripod` | 60 x 60 |
| 12 | Intercom beltpack | `comms.beltpack` | 15 x 10 |

List to paste:

```text
1 microphone on a tall boom stand (50 x 50 cm)
2 microphone on a short boom stand (40 x 40 cm)
3 microphone on a straight stand (40 x 40 cm)
4 gooseneck lectern microphone (10 x 10 cm)
5 stereo pair of microphones on one bar stand (60 x 40 cm)
6 boundary microphone lying flat (20 x 20 cm)
7 shotgun microphone on a boom pole (40 x 40 cm)
8 wireless handheld microphone (10 x 10 cm)
9 wireless microphone receiver with two antennas (25 x 20 cm)
10 directional antenna on a stand (30 x 30 cm)
11 loudspeaker on a tripod stand (60 x 60 cm)
12 intercom beltpack with a headset (15 x 10 cm)
```

## Sheet 9 (Small backline and stands)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Guitar stand | `stand.guitar` | 40 x 40 |
| 2 | Drum throne | `kit.throne` | 40 x 40 |
| 3 | Leslie cabinet | `amp.leslie` | 60 x 60 |
| 4 | Bass cabinet 8x10 | `amp.bass-cab` | 60 x 50 |
| 5 | Small combo amp | `amp.combo` | 50 x 25 |
| 6 | Keyboard stand, two tiers | `keys.stand-2` | 140 x 70 |
| 7 | Cymbal stand | `kit.cymbal-stand` | 50 x 50 |
| 8 | Tech station | `furniture.tech` | 150 x 80 |
| 9 | Laptop stand with controller | `control.laptop-stand` | 60 x 40 |
| 10 | Instrument rack | `stand.instrument-rack` | 120 x 40 |
| 11 | Cable reel | `power.cable-reel` | 50 x 50 |
| 12 | Snake reel | `rack.snake-reel` | 60 x 60 |

List to paste:

```text
1 guitar stand holding two guitars (40 x 40 cm)
2 drum throne (40 x 40 cm)
3 leslie rotary speaker cabinet (60 x 60 cm)
4 tall bass speaker cabinet (60 x 50 cm)
5 small combo amplifier (50 x 25 cm)
6 two-tier keyboard stand with two keyboards (140 x 70 cm)
7 cymbal stand (50 x 50 cm)
8 backline technician station with a small table and a case (150 x 80 cm)
9 laptop on a stand with a midi controller (60 x 40 cm)
10 rack holding several guitars (120 x 40 cm)
11 cable reel (50 x 50 cm)
12 multicore snake reel (60 x 60 cm)
```

## Sheet 10 (Orchestral and world instruments)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Tuba | `winds.tuba` | 70 x 70 |
| 2 | French horn | `winds.horn` | 60 x 60 |
| 3 | Oboe or bassoon | `winds.double-reed` | 50 x 50 |
| 4 | Timpani | `perc.timpani` | 150 x 120 |
| 5 | Marimba | `perc.marimba` | 200 x 80 |
| 6 | Vibraphone | `perc.vibraphone` | 150 x 70 |
| 7 | Accordion | `keys.accordion` | 60 x 60 |
| 8 | Keytar | `keys.keytar` | 60 x 60 |
| 9 | Banjo or mandolin | `strings.banjo` | 50 x 50 |
| 10 | Steel pan | `perc.steelpan` | 90 x 90 |
| 11 | Gong | `perc.gong` | 90 x 40 |
| 12 | Conductor | `person.conductor` | 80 x 80 |

List to paste:

```text
1 tuba player (70 x 70 cm)
2 french horn player (60 x 60 cm)
3 oboe or bassoon player (50 x 50 cm)
4 timpani, four kettledrums (150 x 120 cm)
5 marimba with its player (200 x 80 cm)
6 vibraphone with its player (150 x 70 cm)
7 accordion player (60 x 60 cm)
8 keytar player (60 x 60 cm)
9 banjo or mandolin player (50 x 50 cm)
10 steel pan on a stand (90 x 90 cm)
11 gong on a standing frame (90 x 40 cm)
12 conductor on a podium (80 x 80 cm)
```

## Sheet 11 (Rigging, power and safety)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Truss section | `rig.truss` | 300 x 30 |
| 2 | Light stand | `rig.light-stand` | 80 x 80 |
| 3 | Chain hoist | `rig.hoist` | 30 x 30 |
| 4 | Power distribution | `power.distro` | 50 x 30 |
| 5 | Generator | `power.generator` | 100 x 60 |
| 6 | Power strip | `power.strip` | 40 x 10 |
| 7 | Fire extinguisher | `safety.extinguisher` | 15 x 15 |
| 8 | First aid | `safety.first-aid` | 30 x 30 |
| 9 | Crowd barrier | `safety.barrier` | 200 x 50 |
| 10 | Emergency exit | `safety.exit` | 100 x 20 |
| 11 | Sandbag | `rig.sandbag` | 30 x 30 |
| 12 | Gaffer tape marks | `rig.marks` | 30 x 30 |

List to paste:

```text
1 section of lighting truss seen from above (300 x 30 cm)
2 tripod light stand with one light (80 x 80 cm)
3 chain hoist motor (30 x 30 cm)
4 power distribution box (50 x 30 cm)
5 portable generator (100 x 60 cm)
6 power strip (40 x 10 cm)
7 fire extinguisher (15 x 15 cm)
8 first aid kit with a cross (30 x 30 cm)
9 crowd barrier section (200 x 50 cm)
10 emergency exit door with a running figure (100 x 20 cm)
11 sandbag ballast (30 x 30 cm)
12 cross-shaped spike mark (30 x 30 cm)
```

## Sheet 12 (Video, comms and show control)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | PTZ camera on tripod | `video.ptz` | 60 x 60 |
| 2 | Camera with operator | `video.camera-op` | 80 x 80 |
| 3 | Jib crane | `video.jib` | 300 x 100 |
| 4 | Teleprompter | `video.teleprompter` | 60 x 40 |
| 5 | Intercom station | `comms.station` | 30 x 20 |
| 6 | Cue light | `comms.cue-light` | 15 x 15 |
| 7 | Stage manager desk | `control.sm-desk` | 120 x 70 |
| 8 | Audio recorder | `rack.recorder` | 45 x 30 |
| 9 | Confidence monitor | `video.confidence` | 60 x 30 |
| 10 | Presentation remote desk | `control.slides` | 60 x 40 |

List to paste:

```text
1 remote PTZ camera on a tripod (60 x 60 cm)
2 video camera on a tripod with its operator (80 x 80 cm)
3 camera jib crane (300 x 100 cm)
4 teleprompter on a stand (60 x 40 cm)
5 intercom master station (30 x 20 cm)
6 cue light box (15 x 15 cm)
7 stage manager desk with monitor and headset (120 x 70 cm)
8 multitrack audio recorder (45 x 30 cm)
9 confidence monitor on a stand (60 x 30 cm)
10 presentation desk with laptop and clicker (60 x 40 cm)
```

## Sheet 13 (Theatre furniture and set)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Sofa | `set.sofa` | 200 x 90 |
| 2 | Armchair | `set.armchair` | 90 x 90 |
| 3 | Bed | `set.bed` | 200 x 140 |
| 4 | Door flat | `set.door` | 100 x 15 |
| 5 | Window flat | `set.window` | 120 x 15 |
| 6 | Bookcase | `set.bookcase` | 120 x 35 |
| 7 | Bar stool | `set.bar-stool` | 40 x 40 |
| 8 | Desk with chair | `set.desk` | 140 x 70 |
| 9 | Rug | `set.rug` | 200 x 140 |
| 10 | Plant or tree | `set.plant` | 60 x 60 |
| 11 | Trunk | `set.trunk` | 80 x 50 |
| 12 | Banner stand | `set.banner` | 85 x 20 |

List to paste:

```text
1 sofa (200 x 90 cm)
2 armchair (90 x 90 cm)
3 bed with pillows (200 x 140 cm)
4 door in a flat (100 x 15 cm)
5 window in a flat (120 x 15 cm)
6 bookcase (120 x 35 cm)
7 bar stool (40 x 40 cm)
8 desk with a chair (140 x 70 cm)
9 rectangular rug with a border (200 x 140 cm)
10 potted plant or tree (60 x 60 cm)
11 travel trunk (80 x 50 cm)
12 roll-up banner stand (85 x 20 cm)
```
