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

## Sheet 14 (Luminaires)

Replaces the RP-2 outlines, which did not read. Add this line to the style block for this sheet only: *Each light is seen from the side with its lens pointing to the right, so the direction it aims in is clear, with the yoke or clamp visible.*

| # | Item | id | Size (cm) |
|---|---|---|---|
| 1 | Ellipsoidal (profile spot) | `light.ellipsoidal` | 25 x 52 |
| 2 | Fresnel | `light.fresnel` | 25 x 35 |
| 3 | PC | `light.pc` | 25 x 35 |
| 4 | PAR can | `light.par` | 25 x 35 |
| 5 | LED PAR | `light.led-par` | 24 x 24 |
| 6 | Scoop | `light.scoop` | 30 x 30 |
| 7 | Strip light | `light.strip` | 100 x 25 |
| 8 | Cyc light | `light.cyc` | 50 x 30 |
| 9 | Followspot | `light.followspot` | 45 x 120 |
| 10 | Moving head spot | `light.mover-spot` | 35 x 35 |
| 11 | Moving head wash | `light.mover-wash` | 35 x 35 |
| 12 | LED bar | `light.led-bar` | 100 x 10 |

List to paste:

```text
1 ellipsoidal profile spot with a long barrel, shutter slot and yoke (25 x 52 cm)
2 fresnel spotlight with a short barrel and a ridged round lens (25 x 35 cm)
3 plano-convex spotlight with a short barrel and a smooth round lens (25 x 35 cm)
4 PAR can: a short cylinder with a round lens and a U-shaped yoke (25 x 35 cm)
5 compact LED par with a round face of small LED circles (24 x 24 cm)
6 scoop floodlight: a deep open bowl with a bulb (30 x 30 cm)
7 long strip light (batten) with several compartments (100 x 25 cm)
8 asymmetric cyclorama floodlight, a wide box with a slanted front (50 x 30 cm)
9 followspot on a tall stand with a long barrel and a handle (45 x 120 cm)
10 moving head spot: a round head held in a U-shaped arm on a base (35 x 35 cm)
11 moving head wash: a wide round head with a lens, held in a U-shaped arm on a base (35 x 35 cm)
12 LED bar with a row of round LEDs (100 x 10 cm)
```

## Sheet 15 (Wireless, in-ears and personal monitoring)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Bodypack transmitter | `rack.bodypack` | 10 x 7 |
| 2 | Lavalier mic | `mic.lavalier` | 5 x 5 |
| 3 | Headset mic | `mic.headset` | 15 x 15 |
| 4 | IEM transmitter | `rack.iem-tx` | 22 x 20 |
| 5 | Personal monitor mixer | `rack.personal-mixer` | 20 x 20 |
| 6 | Headphones | `monitor.headphones` | 20 x 20 |
| 7 | Headphone amplifier | `rack.headphone-amp` | 25 x 15 |
| 8 | Antenna combiner | `rack.antenna-combiner` | 25 x 10 |
| 9 | Click box | `rack.click` | 15 x 10 |
| 10 | Audio interface | `rack.interface` | 25 x 20 |
| 11 | Mic preamp | `rack.preamp` | 25 x 20 |
| 12 | Power conditioner | `rack.power-conditioner` | 45 x 20 |

List to paste:

```text
1 wireless bodypack transmitter with a belt clip and a short antenna (10 x 7 cm)
2 tiny lavalier clip microphone with a cable (5 x 5 cm)
3 headset microphone worn over the ear with a boom (15 x 15 cm)
4 wireless in-ear monitor transmitter box with two antennas (22 x 20 cm)
5 personal monitor mixer with a row of small knobs and a headphone jack (20 x 20 cm)
6 studio headphones (20 x 20 cm)
7 headphone amplifier box with four headphone jacks (25 x 15 cm)
8 antenna combiner box with several antenna connectors (25 x 10 cm)
9 small click track box with one knob and a display (15 x 10 cm)
10 desktop audio interface with two knobs (25 x 20 cm)
11 single-channel microphone preamp with knobs (25 x 20 cm)
12 power conditioner with a row of outlets (45 x 20 cm)
```

## Sheet 16 (Microphone types)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Large-diaphragm condenser | `mic.condenser` | 20 x 20 |
| 2 | Pencil condenser | `mic.pencil` | 15 x 15 |
| 3 | Ribbon mic | `mic.ribbon` | 20 x 20 |
| 4 | Instrument dynamic mic | `mic.dynamic` | 10 x 10 |
| 5 | Kick drum mic | `mic.kick` | 15 x 15 |
| 6 | Drum clip mic | `mic.clip` | 8 x 8 |
| 7 | Contact pickup | `mic.pickup` | 5 x 5 |
| 8 | USB desktop mic | `mic.usb` | 15 x 15 |
| 9 | Hanging choir mic | `mic.hanging` | 20 x 20 |
| 10 | Desktop mic stand | `mic.desktop` | 20 x 20 |
| 11 | Parabolic mic | `mic.parabolic` | 40 x 40 |
| 12 | Talkback mic | `mic.talkback` | 15 x 15 |

List to paste:

```text
1 large-diaphragm condenser microphone in a shock mount (20 x 20 cm)
2 small-diaphragm pencil condenser microphone (15 x 15 cm)
3 ribbon microphone with a long cylindrical grille (20 x 20 cm)
4 small dynamic instrument microphone, classic cylinder shape (10 x 10 cm)
5 kick drum microphone, a short fat cylinder with a stand mount (15 x 15 cm)
6 small clip-on microphone on a drum rim clip (8 x 8 cm)
7 small contact pickup disc with a cable (5 x 5 cm)
8 USB desktop microphone on a small stand (15 x 15 cm)
9 thin microphone hanging from a cable (20 x 20 cm)
10 microphone on a short desktop stand (20 x 20 cm)
11 parabolic dish microphone (40 x 40 cm)
12 talkback microphone with a push button on a gooseneck (15 x 15 cm)
```

## Sheet 17 (Direct boxes and guitar effects)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Active DI box | `rack.di-active` | 13 x 9 |
| 2 | Stereo DI | `rack.di-stereo` | 20 x 10 |
| 3 | Reamp box | `rack.reamp` | 15 x 10 |
| 4 | Signal splitter | `rack.splitter` | 25 x 15 |
| 5 | Distortion pedal | `pedal.drive` | 10 x 12 |
| 6 | Wah pedal | `pedal.wah` | 10 x 25 |
| 7 | Volume or expression pedal | `pedal.volume` | 10 x 25 |
| 8 | Looper pedal | `pedal.looper` | 15 x 15 |
| 9 | Tuner pedal | `pedal.tuner` | 7 x 12 |
| 10 | Multi-effects unit | `pedal.multi` | 50 x 25 |
| 11 | Footswitch controller | `pedal.switch` | 40 x 15 |
| 12 | Large pedalboard | `pedal.board-large` | 100 x 40 |

List to paste:

```text
1 active direct box with a gain switch and two jacks (13 x 9 cm)
2 stereo direct box with two channels (20 x 10 cm)
3 reamp box with a knob (15 x 10 cm)
4 signal splitter box with several outputs (25 x 15 cm)
5 guitar distortion stompbox with three knobs and a footswitch (10 x 12 cm)
6 wah pedal with a long rocker treadle (10 x 25 cm)
7 volume pedal with a long rocker treadle and no knobs (10 x 25 cm)
8 looper pedal with two footswitches and a knob (15 x 15 cm)
9 tuner pedal with a round display (7 x 12 cm)
10 multi-effects floor unit with a row of footswitches and a small screen (50 x 25 cm)
11 footswitch controller with a row of large round switches (40 x 15 cm)
12 large pedalboard with many stompboxes (100 x 40 cm)
```

## Sheet 18 (Backline electronics)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Guitar amp head | `amp.head` | 60 x 25 |
| 2 | Amp stack | `amp.stack` | 80 x 40 |
| 3 | Sampler pad | `perc.sampler` | 30 x 30 |
| 4 | Drum module | `kit.module` | 30 x 25 |
| 5 | MIDI controller | `keys.midi` | 50 x 25 |
| 6 | Looper station | `control.looper` | 40 x 30 |
| 7 | Single drum pad | `perc.pad` | 25 x 25 |
| 8 | Electronic percussion pad | `perc.octapad` | 40 x 40 |

List to paste:

```text
1 guitar amplifier head with knobs (60 x 25 cm)
2 guitar amp head on top of a 4x12 cabinet (80 x 40 cm)
3 sampler pad with a grid of square pads (30 x 30 cm)
4 electronic drum sound module with a screen and knobs (30 x 25 cm)
5 midi keyboard controller with small keys and knobs (50 x 25 cm)
6 looper station with large pads and a small screen (40 x 30 cm)
7 single electronic drum pad on a stand (25 x 25 cm)
8 multi-pad electronic percussion unit (40 x 40 cm)
```

## Sheet 19 (Lamps and practicals)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Floor lamp | `set.floor-lamp` | 40 x 40 |
| 2 | Table lamp | `set.table-lamp` | 30 x 30 |
| 3 | Desk lamp | `set.desk-lamp` | 20 x 30 |
| 4 | Chandelier | `set.chandelier` | 80 x 80 |
| 5 | Candelabra | `set.candelabra` | 30 x 30 |
| 6 | Lantern | `set.lantern` | 25 x 25 |
| 7 | Pendant lamp | `set.pendant` | 40 x 40 |
| 8 | Wall sconce | `set.sconce` | 20 x 15 |
| 9 | Neon sign | `set.neon` | 100 x 10 |
| 10 | String lights | `set.string-lights` | 300 x 10 |
| 11 | LED uplighter | `light.uplighter` | 30 x 30 |
| 12 | Work light on tripod | `light.work` | 40 x 40 |

List to paste:

```text
1 floor lamp with a shade (40 x 40 cm)
2 table lamp with a shade (30 x 30 cm)
3 desk lamp with a jointed arm (20 x 30 cm)
4 chandelier with several arms (80 x 80 cm)
5 candelabra with three candles (30 x 30 cm)
6 lantern (25 x 25 cm)
7 pendant lamp with a dome shade (40 x 40 cm)
8 wall sconce (20 x 15 cm)
9 neon sign tube in a wavy shape (100 x 10 cm)
10 string of festoon lights (300 x 10 cm)
11 LED uplighter can on the floor (30 x 30 cm)
12 work light on a tripod (40 x 40 cm)
```

## Sheet 20 (More furniture)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Round table | `furniture.round-table` | 150 x 150 |
| 2 | Coffee table | `furniture.coffee-table` | 100 x 60 |
| 3 | Side table | `furniture.side-table` | 50 x 50 |
| 4 | High cocktail table | `furniture.cocktail` | 60 x 60 |
| 5 | Folding chair | `furniture.folding-chair` | 45 x 45 |
| 6 | Ottoman | `furniture.ottoman` | 60 x 60 |
| 7 | Director chair | `furniture.director` | 55 x 55 |
| 8 | Bar counter | `furniture.bar` | 200 x 60 |
| 9 | Wardrobe | `furniture.wardrobe` | 100 x 50 |
| 10 | Fireplace | `set.fireplace` | 120 x 40 |
| 11 | Mirror | `set.mirror` | 80 x 10 |
| 12 | Folding screen | `set.folding-screen` | 150 x 10 |

List to paste:

```text
1 round banquet table (150 x 150 cm)
2 low coffee table (100 x 60 cm)
3 small side table (50 x 50 cm)
4 high round cocktail table (60 x 60 cm)
5 folding chair (45 x 45 cm)
6 round ottoman pouf (60 x 60 cm)
7 director chair (55 x 55 cm)
8 bar counter with a footrest (200 x 60 cm)
9 wardrobe with two doors (100 x 50 cm)
10 fireplace with a mantel (120 x 40 cm)
11 tall standing mirror in a frame (80 x 10 cm)
12 folding screen with three panels (150 x 10 cm)
```

## Sheet 21 (Site, access and crew)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Merch stand | `site.merch` | 200 x 80 |
| 2 | Tent | `site.tent` | 300 x 300 |
| 3 | Accessibility platform | `site.wheelchair` | 300 x 200 |
| 4 | Sign language interpreter | `person.interpreter` | 60 x 60 |
| 5 | Stagehand | `person.crew` | 50 x 50 |
| 6 | Security | `person.security` | 50 x 50 |
| 7 | Portable toilet | `site.toilet` | 120 x 120 |
| 8 | Ticket booth | `site.ticket` | 120 x 120 |
| 9 | Food stall | `site.food` | 300 x 200 |
| 10 | Truck | `site.truck` | 250 x 700 |
| 11 | Tour bus | `site.bus` | 250 x 1200 |
| 12 | Trailer | `site.trailer` | 250 x 600 |

List to paste:

```text
1 merchandise stand with a table and a hanging banner (200 x 80 cm)
2 event tent (300 x 300 cm)
3 accessibility platform with a wheelchair symbol (300 x 200 cm)
4 sign language interpreter standing with both hands raised (60 x 60 cm)
5 stagehand standing with a cable coil (50 x 50 cm)
6 security guard standing with arms folded (50 x 50 cm)
7 portable toilet cabin (120 x 120 cm)
8 ticket booth with a window (120 x 120 cm)
9 food stall with an awning (300 x 200 cm)
10 box truck seen from above (250 x 700 cm)
11 tour bus seen from above (250 x 1200 cm)
12 trailer seen from above (250 x 600 cm)
```

## Received sheets (files in `assets/symbol-sheets/`, not in git)

The sheets of 1 to 21 came back as `sheet-NN.png` (renamed from their GPT names). `sheet-01b.png` is a second version of sheet 1 with slimmer figures. Sheets 14 and 21 and a few others have an irregular layout (not 4 x 3), so they are cut by connected shapes, not by a grid.

## Sheet 22 (Luminaires II)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | PAR 64 | `light.par64` | 30 x 40 |
| 2 | LED wash panel | `light.led-panel` | 40 x 15 |
| 3 | 4-lite blinder | `light.blinder` | 50 x 20 |
| 4 | LED profile | `light.led-profile` | 30 x 50 |
| 5 | LED fresnel | `light.led-fresnel` | 25 x 30 |
| 6 | Moving beam | `light.mover-beam` | 35 x 35 |
| 7 | Pinspot | `light.pinspot` | 10 x 15 |
| 8 | UV blacklight bar | `light.uv` | 50 x 15 |
| 9 | Gobo projector | `light.gobo` | 30 x 40 |
| 10 | Ground row | `light.ground-row` | 100 x 40 |
| 11 | T-bar with four PARs | `light.tbar` | 100 x 40 |
| 12 | Lighting tree | `light.tree` | 40 x 40 |

List to paste:

```text
1 large PAR 64 can with a round lens and a U-shaped yoke (30 x 40 cm)
2 flat rectangular LED wash panel with a grid of small LEDs (40 x 15 cm)
3 four-lamp audience blinder, a flat box with four round lamps (50 x 20 cm)
4 LED profile spot with a long barrel, a fan vent and a yoke (30 x 50 cm)
5 LED fresnel with a short barrel, ridged lens and a heat sink on the back (25 x 30 cm)
6 moving head beam: a slim round head with a small lens in a U-shaped arm on a base (35 x 35 cm)
7 tiny pinspot with a small lens and a clamp (10 x 15 cm)
8 UV blacklight bar with violet tubes (50 x 15 cm)
9 gobo projector with a long lens barrel (30 x 40 cm)
10 ground row cyc light with several compartments in a long low box (100 x 40 cm)
11 T-bar light stand with four PAR cans (100 x 40 cm)
12 vertical lighting boom with three side lights (40 x 40 cm)
```

## Sheet 23 (Effects)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Bubble machine | `effect.bubble` | 40 x 30 |
| 2 | Confetti cannon | `effect.confetti` | 15 x 15 |
| 3 | Snow machine | `effect.snow` | 45 x 30 |
| 4 | Flame projector | `effect.flame` | 30 x 30 |
| 5 | Pyro fountain | `effect.pyro` | 20 x 20 |
| 6 | Wind fan | `effect.fan` | 60 x 40 |
| 7 | Cold spark machine | `effect.coldspark` | 30 x 30 |
| 8 | Low fog machine | `effect.lowfog` | 60 x 40 |
| 9 | Streamer cannon | `effect.streamer` | 15 x 15 |
| 10 | Fireworks rack | `effect.fireworks` | 50 x 30 |

List to paste:

```text
1 bubble machine blowing bubbles (40 x 30 cm)
2 confetti cannon shooting confetti (15 x 15 cm)
3 snow machine with falling snowflakes (45 x 30 cm)
4 flame projector shooting a flame (30 x 30 cm)
5 pyro fountain showing sparks (20 x 20 cm)
6 large stage fan on a stand (60 x 40 cm)
7 cold spark machine shooting sparks (30 x 30 cm)
8 low fog machine with a fog cloud near the floor (60 x 40 cm)
9 streamer cannon shooting ribbons (15 x 15 cm)
10 rack of firework tubes with a burst above (50 x 30 cm)
```

## Sheet 24 (Amplifiers and cabinets)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Guitar cabinet 1x12 | `amp.cab-1x12` | 50 x 30 |
| 2 | Guitar cabinet 2x12 | `amp.cab-2x12` | 70 x 30 |
| 3 | Guitar combo 2x12 | `amp.combo-2x12` | 70 x 25 |
| 4 | Bass cabinet 4x10 | `amp.cab-4x10` | 60 x 45 |
| 5 | Bass cabinet 2x10 | `amp.cab-2x10` | 60 x 40 |
| 6 | Bass cabinet 1x15 | `amp.cab-1x15` | 50 x 45 |
| 7 | Bass amp head | `amp.bass-head` | 50 x 25 |
| 8 | Bass stack | `amp.bass-stack` | 60 x 45 |
| 9 | Acoustic guitar amp | `amp.acoustic` | 40 x 30 |
| 10 | Keyboard amp | `amp.keyboard` | 50 x 40 |
| 11 | Practice amp | `amp.practice` | 30 x 20 |
| 12 | Vintage tube combo | `amp.vintage` | 60 x 30 |

List to paste:

```text
1 guitar speaker cabinet with one round speaker (50 x 30 cm)
2 guitar speaker cabinet with two round speakers (70 x 30 cm)
3 guitar combo amplifier with two round speakers and a row of knobs on top (70 x 25 cm)
4 bass speaker cabinet with four round speakers (60 x 45 cm)
5 bass speaker cabinet with two round speakers (60 x 40 cm)
6 bass speaker cabinet with one large round speaker (50 x 45 cm)
7 bass amplifier head with knobs and a display (50 x 25 cm)
8 bass amp head on top of a bass cabinet (60 x 45 cm)
9 acoustic guitar amplifier, a small combo with a curved top (40 x 30 cm)
10 keyboard amplifier, a combo with a horn on top (50 x 40 cm)
11 small practice amplifier (30 x 20 cm)
12 vintage tube combo amplifier with a woven grille cloth and a handle (60 x 30 cm)
```

## Sheet 25 (PA and monitors)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Point source 12 in | `pa.top-12` | 40 x 35 |
| 2 | Point source 15 in | `pa.top-15` | 45 x 40 |
| 3 | Column array | `pa.column` | 25 x 25 |
| 4 | Double 18 sub | `pa.sub-double` | 120 x 60 |
| 5 | Cardioid sub | `pa.sub-cardioid` | 60 x 80 |
| 6 | Hanging array | `pa.array-hang` | 45 x 60 |
| 7 | Outfill | `pa.outfill` | 40 x 35 |
| 8 | Coaxial wedge | `monitor.coax` | 60 x 40 |
| 9 | Floor monitor 15 in | `monitor.wedge-15` | 65 x 45 |
| 10 | Drum shield | `furniture.drum-shield` | 200 x 15 |
| 11 | Speaker on pole | `pa.pole` | 50 x 50 |
| 12 | Amp isolation box | `amp.iso-box` | 60 x 60 |

List to paste:

```text
1 trapezoid two-way speaker with a round woofer and a horn (40 x 35 cm)
2 large two-way speaker with a big round woofer and a horn (45 x 40 cm)
3 tall column array speaker with a row of small drivers (25 x 25 cm)
4 subwoofer cabinet with two large round speakers (120 x 60 cm)
5 deep cardioid subwoofer cabinet with a round speaker and a vent (60 x 80 cm)
6 cluster of line array cabinets hanging in a curve (45 x 60 cm)
7 small speaker on a pole (40 x 35 cm)
8 floor wedge monitor with a coaxial speaker (60 x 40 cm)
9 large floor wedge monitor with a big round speaker (65 x 45 cm)
10 curved clear acrylic drum shield panel on feet (200 x 15 cm)
11 speaker on a pole mounted on a subwoofer (50 x 50 cm)
12 amp isolation cabinet with a lid and a handle (60 x 60 cm)
```

## Sheet 26 (Network and data)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Wi-Fi access point | `net.wifi-ap` | 20 x 20 |
| 2 | Wi-Fi router | `net.router` | 30 x 20 |
| 3 | 4G hotspot | `net.hotspot` | 10 x 7 |
| 4 | PoE switch | `net.poe` | 45 x 25 |
| 5 | Fibre converter | `net.fibre` | 25 x 15 |
| 6 | Patch panel | `net.patch` | 48 x 10 |
| 7 | Dante interface | `net.dante` | 45 x 25 |
| 8 | Network cable drum | `net.cable-drum` | 40 x 40 |
| 9 | UPS | `power.ups` | 40 x 25 |
| 10 | DMX splitter | `net.dmx-splitter` | 30 x 20 |
| 11 | Art-Net node | `net.artnet` | 25 x 15 |
| 12 | Timecode generator | `rack.timecode` | 25 x 15 |

List to paste:

```text
1 ceiling wi-fi access point with signal waves (20 x 20 cm)
2 wireless router with two antennas (30 x 20 cm)
3 pocket 4G hotspot with signal waves (10 x 7 cm)
4 rack network switch with a row of ethernet ports (45 x 25 cm)
5 fibre media converter with a fibre connector (25 x 15 cm)
6 patch panel with two rows of ports (48 x 10 cm)
7 audio network interface with many ports and a display (45 x 25 cm)
8 ethernet cable drum (40 x 40 cm)
9 uninterruptible power supply with a battery symbol (40 x 25 cm)
10 dmx splitter box with several outputs (30 x 20 cm)
11 art-net dmx node with ethernet and dmx ports (25 x 15 cm)
12 timecode generator with a clock display (25 x 15 cm)
```

## Sheet 27 (Instruments alone: strings)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Double bass | `strings.doublebass-alone` | 60 x 60 |
| 2 | Violin | `strings.violin-alone` | 25 x 25 |
| 3 | Cello | `strings.cello-alone` | 40 x 40 |
| 4 | Harp | `strings.harp-alone` | 90 x 60 |
| 5 | Acoustic guitar | `strings.guitar-alone` | 40 x 15 |
| 6 | Electric guitar | `strings.eguitar-alone` | 40 x 15 |
| 7 | Bass guitar | `strings.bass-alone` | 45 x 15 |
| 8 | Banjo | `strings.banjo-alone` | 35 x 15 |
| 9 | Mandolin | `strings.mandolin-alone` | 30 x 12 |
| 10 | Ukulele | `strings.ukulele-alone` | 25 x 10 |
| 11 | Pedal steel guitar | `strings.pedal-steel` | 120 x 50 |
| 12 | Sitar | `strings.sitar` | 40 x 20 |

List to paste:

```text
1 double bass alone, upright, no player (60 x 60 cm)
2 violin alone with its bow, no player (25 x 25 cm)
3 cello alone with its bow, no player (40 x 40 cm)
4 concert harp alone, no player (90 x 60 cm)
5 acoustic guitar alone, no player (40 x 15 cm)
6 electric guitar alone, no player (40 x 15 cm)
7 electric bass guitar alone, no player (45 x 15 cm)
8 banjo alone, no player (35 x 15 cm)
9 mandolin alone, no player (30 x 12 cm)
10 ukulele alone, no player (25 x 10 cm)
11 pedal steel guitar on legs with pedals, no player (120 x 50 cm)
12 sitar alone, no player (40 x 20 cm)
```

## Sheet 28 (Instruments alone: winds and keys)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Alto sax | `winds.sax-alone` | 30 x 20 |
| 2 | Trumpet | `winds.trumpet-alone` | 30 x 12 |
| 3 | Trombone | `winds.trombone-alone` | 70 x 20 |
| 4 | Flute | `winds.flute-alone` | 65 x 5 |
| 5 | Clarinet | `winds.clarinet-alone` | 60 x 8 |
| 6 | Tuba | `winds.tuba-alone` | 45 x 40 |
| 7 | French horn | `winds.horn-alone` | 35 x 30 |
| 8 | Oboe | `winds.oboe-alone` | 60 x 8 |
| 9 | Accordion | `keys.accordion-alone` | 40 x 20 |
| 10 | Harmonica | `winds.harmonica` | 12 x 4 |
| 11 | Upright piano | `keys.upright` | 150 x 60 |
| 12 | Electric piano | `keys.epiano` | 130 x 50 |

List to paste:

```text
1 alto saxophone alone, no player (30 x 20 cm)
2 trumpet alone, no player (30 x 12 cm)
3 trombone alone, no player (70 x 20 cm)
4 flute alone, no player (65 x 5 cm)
5 clarinet alone, no player (60 x 8 cm)
6 tuba alone, no player (45 x 40 cm)
7 french horn alone, no player (35 x 30 cm)
8 oboe alone, no player (60 x 8 cm)
9 accordion alone, no player (40 x 20 cm)
10 harmonica alone, no player (12 x 4 cm)
11 upright piano seen from the front, no player (150 x 60 cm)
12 electric piano with a stand, no player (130 x 50 cm)
```

## Sheet 29 (Percussion alone)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Kick drum | `kit.kick` | 55 x 45 |
| 2 | Snare drum | `kit.snare` | 40 x 40 |
| 3 | Tom on stand | `kit.tom` | 35 x 35 |
| 4 | Floor tom | `kit.floor-tom` | 45 x 45 |
| 5 | Hi-hat | `kit.hihat` | 40 x 40 |
| 6 | Djembe | `perc.djembe` | 35 x 35 |
| 7 | Bongos | `perc.bongos` | 35 x 20 |
| 8 | Tambourine | `perc.tambourine` | 25 x 25 |
| 9 | Cowbell | `perc.cowbell` | 15 x 15 |
| 10 | Glockenspiel | `perc.glockenspiel` | 80 x 35 |
| 11 | Triangle | `perc.triangle` | 20 x 20 |
| 12 | Handpan | `perc.handpan` | 55 x 55 |

List to paste:

```text
1 bass drum on its side with a beater pedal (55 x 45 cm)
2 snare drum on a stand (40 x 40 cm)
3 rack tom drum on a stand (35 x 35 cm)
4 floor tom with three legs (45 x 45 cm)
5 hi-hat on a stand with a pedal (40 x 40 cm)
6 djembe drum (35 x 35 cm)
7 bongo drums on a stand (35 x 20 cm)
8 tambourine (25 x 25 cm)
9 cowbell on a mount (15 x 15 cm)
10 glockenspiel with metal bars (80 x 35 cm)
11 triangle hanging from a stand (20 x 20 cm)
12 handpan on a stand (55 x 55 cm)
```

## Sheet 30 (People II)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Backing vocalist | `person.backing` | 50 x 50 |
| 2 | Dancer | `person.dancer` | 80 x 80 |
| 3 | Actor | `person.actor` | 60 x 60 |
| 4 | Wheelchair user | `person.wheelchair` | 70 x 110 |
| 5 | Child | `person.child` | 35 x 35 |
| 6 | Kneeling person | `person.kneeling` | 60 x 60 |
| 7 | Sound engineer | `person.engineer` | 90 x 70 |
| 8 | Light technician | `person.lx` | 60 x 60 |
| 9 | Stage manager | `person.sm` | 60 x 60 |
| 10 | Guitar tech | `person.tech` | 60 x 60 |
| 11 | Seated on stool | `person.stool` | 50 x 50 |
| 12 | Drummer | `person.drummer` | 60 x 60 |

List to paste:

```text
1 person standing singing with a hand to one ear (50 x 50 cm)
2 dancer in a dynamic pose (80 x 80 cm)
3 actor standing with arms open (60 x 60 cm)
4 person in a wheelchair (70 x 110 cm)
5 small child standing (35 x 35 cm)
6 person kneeling (60 x 60 cm)
7 person seated at a mixing desk (90 x 70 cm)
8 person standing with a headset and a clipboard (60 x 60 cm)
9 person with a headset and a clipboard (60 x 60 cm)
10 person kneeling beside a guitar (60 x 60 cm)
11 person seated on a high stool (50 x 50 cm)
12 drummer seated with both arms raised holding sticks (60 x 60 cm)
```
