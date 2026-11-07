# Icon sheets for GPT (2026-11-07)

How the icons of the library are generated: one **style block** (decided first, from the style test) is pasted at the top of every sheet prompt so all sheets look alike. Each sheet is a 5 x 3 grid of up to 15 icons, in the order listed, which is also how they are cut and matched back to the library items.

Left as drawn (not asked from GPT): the 15 luminaires (RP-2 convention) and the 3 power items. Already generated: the 15 people and instrument players of sheet 0.

## Sheet prompt template

```text
<STYLE BLOCK>

Create ONE image: a sheet of N icons in a 5 columns x 3 rows grid, on a pure white background. Each icon is centred in its own cell with generous white margin and no cell borders, no text, no numbers. Top-down (bird's-eye) view, as on a live-music stage plot, with the front of every object facing the bottom of the image (the audience). Keep the proportions given (width x depth in cm) and show the same kind of object at the same relative scale.

Icons in reading order (left to right, top to bottom):
<LIST>
```

## Sheet 1

| # | Item | id | Size (cm) |
|---|---|---|---|
| 1 | 5-piece drum kit | `kit.drums5` | 180 x 150 |
| 2 | Small drum kit | `kit.drums-small` | 140 x 120 |
| 3 | Guitar amp | `amp.guitar` | 70 x 35 |
| 4 | Bass amp | `amp.bass` | 80 x 45 |
| 5 | Keyboard | `keys.keyboard` | 130 x 45 |
| 6 | Grand piano | `keys.piano` | 150 x 200 |
| 7 | Wind player | `winds.player` | 50 x 50 |
| 8 | Vocal mic with stand | `vocals.mic-stand` | 50 x 50 |
| 9 | PA line array | `pa.line` | 60 x 50 |
| 10 | Subwoofer | `pa.sub` | 60 x 70 |
| 11 | Wedge monitor | `monitor.wedge` | 60 x 40 |
| 12 | In-ear pack | `monitor.iem` | 15 x 10 |
| 13 | Mixing desk | `desk.digital` | 100 x 70 |
| 14 | Stage box | `rack.stagebox` | 50 x 40 |
| 15 | Rack | `rack.rack` | 60 x 60 |

List to paste:

```text
1 5-piece drum kit (180 x 150 cm)
2 small drum kit (140 x 120 cm)
3 guitar amp (70 x 35 cm)
4 bass amp (80 x 45 cm)
5 keyboard (130 x 45 cm)
6 grand piano (150 x 200 cm)
7 wind player (50 x 50 cm)
8 vocal mic with stand (50 x 50 cm)
9 pa line array (60 x 50 cm)
10 subwoofer (60 x 70 cm)
11 wedge monitor (60 x 40 cm)
12 in-ear pack (15 x 10 cm)
13 mixing desk (100 x 70 cm)
14 stage box (50 x 40 cm)
15 rack (60 x 60 cm)
```

## Sheet 2

| # | Item | id | Size (cm) |
|---|---|---|---|
| 1 | DI box | `rack.di` | 13 x 9 |
| 2 | DJ booth | `dj.booth` | 180 x 70 |
| 3 | Riser | `furniture.riser` | 200 x 100 |
| 4 | Chair | `furniture.chair` | 45 x 45 |
| 5 | Music stand | `furniture.music-stand` | 50 x 40 |
| 6 | Table | `furniture.table` | 180 x 70 |
| 7 | Flight case | `furniture.flightcase` | 80 x 60 |
| 8 | Lectern | `furniture.lectern` | 70 x 50 |
| 9 | Text note | `note.text` | 200 x 40 |
| 10 | Dimension | `note.dimension` | 100 x 30 |
| 11 | Audience area | `room.audience` | 800 x 600 |
| 12 | FOH position | `room.foh` | 150 x 80 |
| 13 | Access | `room.access` | 120 x 30 |
| 14 | Laptop | `control.laptop` | 40 x 30 |
| 15 | Lighting desk | `control.lightdesk` | 90 x 50 |

List to paste:

```text
1 di box (13 x 9 cm)
2 dj booth (180 x 70 cm)
3 riser (200 x 100 cm)
4 chair (45 x 45 cm)
5 music stand (50 x 40 cm)
6 table (180 x 70 cm)
7 flight case (80 x 60 cm)
8 lectern (70 x 50 cm)
9 text note (200 x 40 cm)
10 dimension (100 x 30 cm)
11 audience area (800 x 600 cm)
12 foh position (150 x 80 cm)
13 access (120 x 30 cm)
14 laptop (40 x 30 cm)
15 lighting desk (90 x 50 cm)
```

## Sheet 3

| # | Item | id | Size (cm) |
|---|---|---|---|
| 1 | Dimmer rack | `rack.dimmer` | 60 x 60 |
| 2 | Video switcher | `control.videomixer` | 50 x 35 |
| 3 | Screen | `video.screen` | 300 x 12 |
| 4 | Projector | `video.projector` | 45 x 35 |
| 5 | Curtain or leg | `scenery.curtain` | 300 x 15 |
| 6 | Stairs | `scenery.stairs` | 100 x 120 |
| 7 | Platform | `scenery.platform` | 200 x 200 |
| 8 | Hazer | `effect.haze` | 45 x 30 |
| 9 | Smoke machine | `effect.smoke` | 45 x 30 |
| 10 | Strobe | `effect.strobe` | 45 x 20 |
| 11 | Congas | `perc.congas` | 90 x 70 |
| 12 | Cajón | `perc.cajon` | 50 x 60 |
| 13 | Percussion table | `perc.table` | 180 x 90 |
| 14 | Electronic drum kit | `kit.drums-electronic` | 140 x 120 |
| 15 | Pedalboard | `guitar.pedalboard` | 70 x 35 |

List to paste:

```text
1 dimmer rack (60 x 60 cm)
2 video switcher (50 x 35 cm)
3 screen (300 x 12 cm)
4 projector (45 x 35 cm)
5 curtain or leg (300 x 15 cm)
6 stairs (100 x 120 cm)
7 platform (200 x 200 cm)
8 hazer (45 x 30 cm)
9 smoke machine (45 x 30 cm)
10 strobe (45 x 20 cm)
11 congas (90 x 70 cm)
12 cajón (50 x 60 cm)
13 percussion table (180 x 90 cm)
14 electronic drum kit (140 x 120 cm)
15 pedalboard (70 x 35 cm)
```

## Sheet 4

| # | Item | id | Size (cm) |
|---|---|---|---|
| 1 | Guitar cabinet 4×12 | `amp.stack` | 80 x 40 |
| 2 | Synthesizer | `keys.synth` | 110 x 40 |
| 3 | Stage piano | `keys.stage-piano` | 140 x 40 |
| 4 | Organ | `keys.organ` | 130 x 80 |
| 5 | Handheld vocal | `vocals.handheld` | 70 x 70 |
| 6 | Choir on risers | `vocals.choir` | 400 x 200 |
| 7 | PA speaker | `pa.top` | 50 x 45 |
| 8 | Front fill | `pa.front-fill` | 40 x 30 |
| 9 | Delay tower | `pa.delay` | 50 x 50 |
| 10 | Side fill | `monitor.sidefill` | 70 x 60 |
| 11 | Drum fill | `monitor.drumfill` | 70 x 60 |
| 12 | IEM rack | `rack.iem` | 55 x 60 |
| 13 | Wireless rack | `rack.wireless` | 55 x 60 |
| 14 | Amplifier rack | `rack.amps` | 60 x 80 |
| 15 | FX rack | `rack.fx` | 55 x 60 |

List to paste:

```text
1 guitar cabinet 4×12 (80 x 40 cm)
2 synthesizer (110 x 40 cm)
3 stage piano (140 x 40 cm)
4 organ (130 x 80 cm)
5 handheld vocal (70 x 70 cm)
6 choir on risers (400 x 200 cm)
7 pa speaker (50 x 45 cm)
8 front fill (40 x 30 cm)
9 delay tower (50 x 50 cm)
10 side fill (70 x 60 cm)
11 drum fill (70 x 60 cm)
12 iem rack (55 x 60 cm)
13 wireless rack (55 x 60 cm)
14 amplifier rack (60 x 80 cm)
15 fx rack (55 x 60 cm)
```

## Sheet 5

| # | Item | id | Size (cm) |
|---|---|---|---|
| 1 | Network switch | `rack.network` | 45 x 25 |
| 2 | Analog desk | `desk.analog` | 110 x 70 |
| 3 | Monitor desk | `desk.monitor` | 90 x 60 |
| 4 | DJ controller | `dj.controller` | 80 x 40 |
| 5 | Turntables and mixer | `dj.turntables` | 130 x 45 |
| 6 | Stool | `furniture.stool` | 40 x 40 |
| 7 | Bench | `furniture.bench` | 120 x 40 |
| 8 | Cable ramp | `furniture.cable-ramp` | 100 x 30 |
| 9 | Flat or set piece | `scenery.flat` | 200 x 10 |
| 10 | Ladder | `scenery.ladder` | 50 x 180 |
| 11 | Laser | `effect.laser` | 40 x 30 |
| 12 | Mirror ball | `effect.mirror-ball` | 50 x 50 |
| 13 | CO2 jet | `effect.co2` | 25 x 25 |
| 14 | LED wall | `video.led-wall` | 400 x 15 |
| 15 | Monitor or TV | `video.tv` | 100 x 30 |

List to paste:

```text
1 network switch (45 x 25 cm)
2 analog desk (110 x 70 cm)
3 monitor desk (90 x 60 cm)
4 dj controller (80 x 40 cm)
5 turntables and mixer (130 x 45 cm)
6 stool (40 x 40 cm)
7 bench (120 x 40 cm)
8 cable ramp (100 x 30 cm)
9 flat or set piece (200 x 10 cm)
10 ladder (50 x 180 cm)
11 laser (40 x 30 cm)
12 mirror ball (50 x 50 cm)
13 co2 jet (25 x 25 cm)
14 led wall (400 x 15 cm)
15 monitor or tv (100 x 30 cm)
```

## Sheet 6

| # | Item | id | Size (cm) |
|---|---|---|---|
| 1 | Camera | `video.camera` | 60 x 60 |
| 2 | Control tablet | `control.tablet` | 28 x 20 |
| 3 | PC or media server | `control.server` | 45 x 45 |

List to paste:

```text
1 camera (60 x 60 cm)
2 control tablet (28 x 20 cm)
3 pc or media server (45 x 45 cm)
```
