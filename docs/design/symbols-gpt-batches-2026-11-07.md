# Icon sheets for GPT (2026-11-07)

The icons of the library are asked from GPT in sheets of 12 (4 columns x 3 rows), always with the same **style block** pasted first so every sheet looks alike. A sheet is cut, traced to SVG and matched back to the library items by its order. Style decided 2026-11-07 after a style test (solid black with bold white detail, front or three-quarter view). See "Styles that worked" below for the three styles in use and what failed.

Left as drawn, not asked from GPT: the 15 luminaires (RP-2 convention) and the 3 power items. Text note and Dimension are not objects. Drawn in the style test and accepted: 5-piece drum kit, Guitar amp, Keyboard, Vocal mic with stand, PA speaker, Mixing desk, Rack, Stage box, Riser, Subwoofer, PA line array.

## Styles that worked (read this before asking for more)

Three prompts have been used with GPT. All three are kept verbatim in this document so any later sheet can be asked the same way. Whatever comes back is traced as **line drawings** (outlines kept as outlines): solid silhouettes were tried and rejected because they stop being understood.

| Style | Use it for | Where the exact text is | Result |
|---|---|---|---|
| **A. Pictogram** | Objects and equipment: sheets 1 to 21 and the later object sheets | "Style block" below, with the "Sheet prompt" template | Accepted for objects. GPT often adds more detail than asked and the result is a detailed line drawing; the user likes those too, so both outcomes are fine |
| **B. Line-art people** | First attempt at people: sheets 56 to 58 | "Line-art people" section | Accepted, but the faces are drawn |
| **D. Detailed line art (GPT's own description)** | **The general style from now on**, objects and people: the look GPT converged to by itself in sheets 22 to 63 | "Style block D" below | Described by GPT from the accepted sheets on 2026-11-07. **Tested the same day** by pasting the block, then the list of sheet 12 (10 items, one per line with size in cm, no sheet template): it gave `sheet-12b.png`, detailed line art with no text on it, clearly better than the blocky first sheet 12 with "CUE" and "STAGE MANAGER" written on the icons. The operator came with a drawn face (no faceless clause was added) |
| **C. Faceless line-art people** | **All people**, groups and crew: sheets 59 to 63 | "Faceless figures" section | **The style to keep for people** |

How it happened: sheets 1 to 21 were asked with style A and came back blocky. From then on GPT drifted by itself towards detailed line art, and that is what the user liked, so the wording of sheets 22 to 55 is not a prompt that was written; it is GPT's drift. To capture it, GPT was shown accepted sheets and asked to describe the style it sees. Its description is style block D below. Use D for new sheets (add the faceless clause from style C for people), and check on the first new sheet that it reproduces the look.

What failed, so it is not asked again:

- **Solid black people with a round head** (sheets 1, 1b, 2, 10): not understood and not liked. People are asked only with style C.
- **RP-2 outline convention for luminaires**: did not read. Lights are asked as real objects seen from the side with the lens pointing right (extra line in sheet 14).
- **Silhouettes** made from the outer outline: lose all detail; discarded.
- **Dotted or mesh grilles** (the wedge monitor): GPT draws them as noise; ask for two or three plain rings.
- **Variants discarded or kept as alternatives:** 35b discarded (35 preferred); 01b, 44b, 47b, 54b, 55b are alternative versions; 63b is a full re-draw of sheet 63 of which only the rock band was used (the first had an error in the drawing).

Removed from the review viewer on 2026-11-07 (70 icons, the files stay in `archive/symbol-ingest/symbol-sheets/`): every person with a round solid head (all of sheets 1 and 1b; the seated person, presenter, wind player and DJ booth of sheet 2; sheet 10 except steel pan and gong; the audience area and FOH position of sheet 3; the choir of sheet 5) and every person with a drawn face (all of sheets 30 and 50; interpreter, stagehand and security of sheet 21; marching snare of sheet 31; camera with operator of sheet 12b). Their roles are redone faceless in sheets 56 to 63. Kept although they show a small person inside: merch stand, ticket booth and food stall (sheet 21), and the solid camera operator of sheet 12.

How to ask for a sheet (what worked):

1. Paste the style block, then the sheet prompt with the list, **one item per line with its size in cm**. GPT keeps relative proportions well when sizes are given.
2. Twelve icons per sheet (4 x 3). GPT does not respect the grid on many sheets; that does not matter, because sheets are cut by connected shapes, not by a grid. What does matter: icons must **not touch each other**. If GPT draws a group touching, ask again or accept a manual cut.
3. Reading order is not always respected. After cutting, every sheet is checked by eye against its list and a permutation is recorded when GPT swapped items (sheets 19, 26, 28, 33, 35, 38, 40, 61).
4. If a sheet drifts from the style, regenerate that sheet with the same text; the user did this several times and it worked.
5. Ask for more than the list needs (extras are welcome, e.g. sheet 7 came with five bonus icons).
6. Things GPT misunderstood and need a clearer wording: monitor wedges (say "a low wedge with a slanted face"); the CO2 jet is still missing.
7. People always with style C, sized "50 x 50" or "60 x 60 cm" for one person; groups with their real width.

## Style block D (detailed line art, written by GPT from the accepted sheets)

Paste this instead of style A for new sheets. It says "faces minimally detailed"; for people the user wants **no facial features at all**, so for people append: *Faces are completely blank, with no eyes, nose, mouth or expression, only the head outline and hair.*

```text
Create clean, detailed black-and-white line-art illustrations in a consistent technical coloring-book / hand-inked editorial illustration style. Use bold, smooth, clearly defined black outer contours with medium-weight internal lines, maintaining consistent line weight throughout each illustration while allowing subtle variation between primary silhouettes and secondary details. Keep all forms predominantly white and unfilled, using black selectively for small solid areas, dark hardware, and essential visual accents. Use restrained fine-line hatching, parallel strokes, stippling, and occasional crosshatching to suggest texture, depth, curvature, and material differences; avoid gradients, soft shadows, color, and large areas of solid black. Give every object a high but controlled level of detail, including recognizable construction, structural components, joints, fasteners, surface features, and functional details without becoming photorealistic or excessively intricate. Use a clear, slightly elevated three-quarter or frontal perspective, with recognizable depth, visible structural relationships, and consistent geometry. Maintain realistic, believable proportions and anatomy rather than exaggerating shapes or simplifying them into symbols. When depicting people, use clean illustrated anatomy, natural body proportions, clearly separated limbs, carefully articulated hands and fingers, and expressive but understated poses. Faces should remain minimally detailed, generally using simple facial outlines and profiles without elaborate eyes, facial expressions, or portrait-level features. Clothing should have recognizable silhouettes, collars, cuffs, seams, folds, buttons, belts, and other defining details, rendered with controlled contour lines. Use a pure white or near-white, completely uncluttered background with no scenery, environmental context, decorative framing, labels, captions, or unnecessary graphic elements. Keep each illustration isolated, fully visible, centered, and separated from neighboring illustrations, with no cropping and consistent visual scale. The overall result should resemble professionally inked instructional illustrations: precise, readable, consistent, detailed, and suitable for a unified library of stage-plot symbols. Avoid flat pictograms, solid-black silhouettes, cartoon exaggeration, sketchy or rough strokes, inconsistent outlines, photorealism, 3D rendering, gradients, colored fills, heavy shadows, unnecessary backgrounds, and decorative visual effects.
```

## Style block E (candidate: described by the GPT conversation that drew the sheets)

The same question was put to the GPT conversation that generated the accepted sheets (not to a fresh one). Its answer differs from D: it describes **clean vector pictograms** with blank faces and **no hatching, no textures, no halftones**, whereas D asks for hatching, stippling and crosshatching. D, tested on sheet 12, gave the hatched look (`sheet-12b`). **E was tested on the same sheet 12 list and rejected as the general style:** it came back as flat solid-black pictograms again, close to the blocky first sheet 12, and it also reinterpreted items (the stage manager desk became a seated person, the presentation desk a presenter standing at a lectern, the cue light box two plain discs). Keep D for objects. What E does well is the blank faces, which D needs as an extra clause. Not saved in `archive/symbol-ingest/symbol-sheets/`.

```text
Create a clean black-and-white vector-style illustration for a professional live-event and stage-plot icon library.

Visual style: Detailed, simplified technical pictograms with a hand-drawn vector aesthetic. Pure black outlines and selective solid black fills on a pure white background. Bold, smooth, consistent linework with rounded corners and clearly defined silhouettes. Medium level of detail: include the distinctive features that make each person, object or piece of equipment immediately recognisable, without unnecessary decoration.

People and characters: Draw anatomically proportioned human figures in natural, recognisable poses. Use varied hairstyles, clothing and body proportions to provide visual diversity. Keep faces completely blank and featureless, without eyes, nose or mouth. Avoid exaggerated cartoon proportions. Show complete bodies, including both feet and footwear, whenever the composition allows. Use gender diversity without relying on stereotypes.

Objects and equipment: Preserve realistic proportions, construction and characteristic components. Include essential mechanical details such as controls, handles, cables, keys, strings, knobs, supports and structural elements.

Linework: Strong black outer contours, with clearly visible interior lines. Consistent stroke thickness throughout. Avoid fine hairlines and excessive detail.

Composition: Arrange multiple icons in a clean, evenly spaced grid on a pure white background. Centre each subject within its allocated area, maintain generous white margins and consistent visual scale, and prevent overlapping or cropping.

Rendering restrictions: No colour, no grey, no gradients, no shadows, no textures, no halftones, no realistic photography, no background scenery, no text, no labels, no numbers and no decorative elements. Maintain a consistent visual language across the entire icon library.

Overall result: A professional, cohesive collection of black-and-white stage-plot pictograms, combining the clarity of technical signage with the character and detail of clean editorial vector illustration.
```

## Style block (style A, pictogram: the blocky start, now superseded by D for objects)

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

## Received sheets (files in `archive/symbol-ingest/symbol-sheets/`, not in git)

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

## Sheet 31 (Drum kits)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Jazz kit 4 pieces | `kit.jazz` | 130 x 100 |
| 2 | Rock kit double bass | `kit.rock-double` | 180 x 140 |
| 3 | Big kit | `kit.big` | 220 x 170 |
| 4 | Hybrid kit | `kit.hybrid` | 160 x 130 |
| 5 | Cocktail kit | `kit.cocktail` | 80 x 70 |
| 6 | Kit with percussion rack | `kit.perc-rack` | 200 x 140 |
| 7 | Minimal kit | `kit.minimal` | 90 x 70 |
| 8 | Concert bass drum | `perc.concert-bass` | 80 x 40 |
| 9 | Marching snare | `person.marching` | 50 x 50 |
| 10 | Tabla | `perc.tabla` | 35 x 35 |
| 11 | Double bass pedal | `kit.pedal` | 15 x 30 |
| 12 | Drum rug | `kit.rug` | 200 x 160 |

List to paste:

```text
1 jazz drum kit with kick, snare, one tom, one floor tom, hi-hat and two cymbals, seen from above (130 x 100 cm)
2 large rock drum kit with two kick drums, several toms and many cymbals, seen from above (180 x 140 cm)
3 very large drum kit with two kicks, many toms, many cymbals and a gong, seen from above (220 x 170 cm)
4 drum kit mixing acoustic drums with electronic pads and a sampler, seen from above (160 x 130 cm)
5 small cocktail drum kit with a kick standing upright, snare, tom and hi-hat, seen from above (80 x 70 cm)
6 drum kit with a side rack of cowbell, tambourine and chimes, seen from above (200 x 140 cm)
7 minimal drum kit with kick, snare and hi-hat only, seen from above (90 x 70 cm)
8 concert bass drum hanging in a frame (80 x 40 cm)
9 marching drummer standing with a snare drum on a sling (50 x 50 cm)
10 pair of tabla drums on round pads (35 x 35 cm)
11 double bass drum pedal (15 x 30 cm)
12 rectangular drum rug with a border (200 x 160 cm)
```

## Sheet 32 (Stage machinery)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Trap door | `mach.trap` | 100 x 100 |
| 2 | Scissor lift | `mach.scissor` | 120 x 80 |
| 3 | Boom lift | `mach.boom` | 150 x 100 |
| 4 | Forklift | `mach.forklift` | 120 x 250 |
| 5 | Revolving stage | `mach.revolve` | 500 x 500 |
| 6 | Wagon on casters | `mach.wagon` | 200 x 200 |
| 7 | Winch | `mach.winch` | 50 x 40 |
| 8 | Fly pipe | `mach.batten` | 500 x 10 |
| 9 | Stage elevator | `mach.elevator` | 300 x 300 |
| 10 | Hoist controller | `mach.hoist-ctrl` | 60 x 40 |
| 11 | Pallet jack | `mach.pallet` | 60 x 150 |
| 12 | Case dolly | `mach.dolly` | 80 x 60 |

List to paste:

```text
1 stage trap door open with a ladder going down (100 x 100 cm)
2 scissor lift raised, seen from the side (120 x 80 cm)
3 aerial boom lift with a basket (150 x 100 cm)
4 forklift with raised forks (120 x 250 cm)
5 circular revolving stage with a rotation arrow (500 x 500 cm)
6 stage wagon platform on four casters (200 x 200 cm)
7 winch with a drum and cable (50 x 40 cm)
8 fly pipe batten hanging on two cables (500 x 10 cm)
9 stage elevator platform with up and down arrows (300 x 300 cm)
10 chain hoist controller case with switches and a cable (60 x 40 cm)
11 hand pallet jack (60 x 150 cm)
12 dolly with four wheels under a road case (80 x 60 cm)
```

## Sheet 33 (Projection and video walls)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Ceiling projector | `video.proj-ceiling` | 45 x 35 |
| 2 | Projector on stand | `video.proj-stand` | 45 x 35 |
| 3 | Large-venue projector | `video.proj-large` | 80 x 60 |
| 4 | Short-throw projector | `video.proj-short` | 35 x 30 |
| 5 | Rear-projection screen | `video.rear` | 300 x 10 |
| 6 | Fast-fold screen | `video.fastfold` | 400 x 20 |
| 7 | Tripod screen | `video.tripod-screen` | 180 x 15 |
| 8 | Roller screen | `video.roller` | 400 x 10 |
| 9 | Gauze | `video.gauze` | 500 x 5 |
| 10 | Projection mapping | `video.mapping` | 100 x 100 |
| 11 | LED processor | `video.led-proc` | 45 x 20 |
| 12 | Curved LED screen | `video.led-curve` | 400 x 60 |

List to paste:

```text
1 projector hanging upside down from a ceiling mount (45 x 35 cm)
2 projector on a tall stand (45 x 35 cm)
3 large venue projector with a big lens and handles (80 x 60 cm)
4 short-throw projector with a mirror arm (35 x 30 cm)
5 rear-projection screen in a frame with a beam arriving from behind (300 x 10 cm)
6 fast-fold projection screen on a frame with legs (400 x 20 cm)
7 tripod projection screen (180 x 15 cm)
8 motorised roller projection screen, half lowered (400 x 10 cm)
9 thin gauze scrim hanging with a light beam through it (500 x 5 cm)
10 cube with projector beams landing on its faces (100 x 100 cm)
11 led video processor with many ports (45 x 20 cm)
12 curved LED video wall seen from above (400 x 60 cm)
```

## Sheet 34 (Winds II, instruments alone)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Soprano sax | `winds.sax-soprano` | 45 x 10 |
| 2 | Tenor sax | `winds.sax-tenor` | 45 x 25 |
| 3 | Baritone sax | `winds.sax-bari` | 50 x 35 |
| 4 | Bass clarinet | `winds.bass-clarinet` | 40 x 20 |
| 5 | Piccolo | `winds.piccolo` | 35 x 4 |
| 6 | Bassoon | `winds.bassoon` | 30 x 20 |
| 7 | Flugelhorn | `winds.flugelhorn` | 30 x 15 |
| 8 | Euphonium | `winds.euphonium` | 35 x 35 |
| 9 | Sousaphone | `winds.sousaphone` | 60 x 60 |
| 10 | Recorder | `winds.recorder` | 35 x 5 |
| 11 | Bagpipes | `winds.bagpipes` | 60 x 40 |
| 12 | Didgeridoo | `winds.didgeridoo` | 130 x 10 |

List to paste:

```text
1 soprano saxophone alone, straight, no player (45 x 10 cm)
2 tenor saxophone alone, no player (45 x 25 cm)
3 baritone saxophone alone with its loop at the top, no player (50 x 35 cm)
4 bass clarinet alone with a curved neck and bell, no player (40 x 20 cm)
5 piccolo alone, no player (35 x 4 cm)
6 bassoon alone with its bocal, no player (30 x 20 cm)
7 flugelhorn alone, no player (30 x 15 cm)
8 euphonium alone, no player (35 x 35 cm)
9 sousaphone alone with its big round bell, no player (60 x 60 cm)
10 recorder alone, no player (35 x 5 cm)
11 bagpipes alone with bag and drones, no player (60 x 40 cm)
12 didgeridoo alone, no player (130 x 10 cm)
```

## Sheet 35 (Pianos and keys II)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Baby grand | `keys.baby-grand` | 150 x 160 |
| 2 | Concert grand | `keys.concert-grand` | 160 x 275 |
| 3 | Piano with bench | `keys.grand-bench` | 150 x 230 |
| 4 | Rhodes electric piano | `keys.rhodes` | 110 x 45 |
| 5 | Harpsichord | `keys.harpsichord` | 100 x 230 |
| 6 | Hammond organ | `keys.hammond` | 120 x 70 |
| 7 | Organ console | `keys.organ-console` | 150 x 100 |
| 8 | Celesta | `keys.celesta` | 100 x 60 |
| 9 | Clavinet | `keys.clavinet` | 100 x 40 |
| 10 | Toy piano | `keys.toy` | 40 x 30 |
| 11 | Piano bench | `furniture.piano-bench` | 90 x 40 |
| 12 | Three-keyboard rig | `keys.rig-3` | 140 x 90 |

List to paste:

```text
1 baby grand piano seen from above with its lid up (150 x 160 cm)
2 concert grand piano seen from above, long, with the lid propped open (160 x 275 cm)
3 grand piano seen from above with its bench in front (150 x 230 cm)
4 rhodes style electric piano with a flat top and legs (110 x 45 cm)
5 harpsichord seen from above, long and narrow (100 x 230 cm)
6 hammond organ with two keyboards and drawbars (120 x 70 cm)
7 church organ console with three keyboards, stops and a pedalboard (150 x 100 cm)
8 celesta small upright keyboard instrument (100 x 60 cm)
9 clavinet keyboard with a slanted top (100 x 40 cm)
10 toy piano small and simple (40 x 30 cm)
11 piano bench with a padded seat (90 x 40 cm)
12 three keyboards stacked on a stand (140 x 90 cm)
```

## Sheet 36 (Production and backstage)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Production desk | `prod.desk` | 180 x 80 |
| 2 | Production office | `prod.office` | 80 x 60 |
| 3 | Catering table | `prod.catering` | 200 x 80 |
| 4 | Water station | `prod.water` | 60 x 40 |
| 5 | Dressing room mirror | `prod.mirror` | 100 x 30 |
| 6 | Wardrobe rack | `prod.wardrobe` | 150 x 50 |
| 7 | Quick-change tent | `prod.quick-change` | 120 x 120 |
| 8 | Props table | `prod.props` | 180 x 70 |
| 9 | Guest list table | `prod.guests` | 150 x 60 |
| 10 | Rope barrier | `prod.rope` | 100 x 10 |
| 11 | Radio charger | `prod.radios` | 30 x 20 |
| 12 | Toolbox | `prod.toolbox` | 50 x 30 |

List to paste:

```text
1 production desk with a laptop, a phone and papers (180 x 80 cm)
2 production office table with a printer and a laptop (80 x 60 cm)
3 catering table with trays and bottles (200 x 80 cm)
4 water station with a cooler and cups (60 x 40 cm)
5 dressing room mirror with round bulbs around it on a table (100 x 30 cm)
6 rolling wardrobe rack with hanging costumes (150 x 50 cm)
7 small quick-change tent with a curtain (120 x 120 cm)
8 props table with a hat, a mask and a lantern (180 x 70 cm)
9 guest list table with a clipboard and a lanyard (150 x 60 cm)
10 two stanchions with a rope between them (100 x 10 cm)
11 bank of walkie-talkies charging in a rack (30 x 20 cm)
12 toolbox with a handle (50 x 30 cm)
```

## Sheet 37 (World percussion)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Timbales | `perc.timbales` | 80 x 60 |
| 2 | Surdo | `perc.surdo` | 45 x 45 |
| 3 | Taiko | `perc.taiko` | 60 x 60 |
| 4 | Doumbek | `perc.doumbek` | 30 x 30 |
| 5 | Tubular bells | `perc.tubular` | 150 x 60 |
| 6 | Xylophone | `perc.xylophone` | 130 x 60 |
| 7 | Maracas | `perc.maracas` | 15 x 15 |
| 8 | Wind chimes | `perc.chimes` | 30 x 30 |
| 9 | Wood block | `perc.woodblock` | 20 x 15 |
| 10 | Kalimba | `perc.kalimba` | 15 x 15 |
| 11 | Guiro | `perc.guiro` | 35 x 10 |
| 12 | Agogo bells | `perc.agogo` | 20 x 15 |

List to paste:

```text
1 timbales, two shallow metal drums on a stand with a cowbell (80 x 60 cm)
2 large surdo drum with a strap (45 x 45 cm)
3 large taiko drum on a stand with two sticks (60 x 60 cm)
4 doumbek goblet drum (30 x 30 cm)
5 tubular bells, a row of long hanging tubes in a frame (150 x 60 cm)
6 xylophone with wooden bars on a frame (130 x 60 cm)
7 pair of maracas (15 x 15 cm)
8 wind chimes hanging from a bar (30 x 30 cm)
9 wood block with a mallet (20 x 15 cm)
10 kalimba thumb piano (15 x 15 cm)
11 guiro with a scraper (35 x 10 cm)
12 agogo double bell (20 x 15 cm)
```

## Sheet 38 (World strings, instruments alone)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Oud | `strings.oud` | 55 x 35 |
| 2 | Bouzouki | `strings.bouzouki` | 45 x 25 |
| 3 | Balalaika | `strings.balalaika` | 65 x 25 |
| 4 | Koto | `strings.koto` | 180 x 30 |
| 5 | Erhu | `strings.erhu` | 80 x 15 |
| 6 | Kora | `strings.kora` | 70 x 35 |
| 7 | Charango | `strings.charango` | 35 x 15 |
| 8 | Lute | `strings.lute` | 60 x 35 |
| 9 | Zither | `strings.zither` | 60 x 30 |
| 10 | Bandoneon | `keys.bandoneon` | 30 x 25 |
| 11 | Hurdy-gurdy | `strings.hurdy` | 60 x 25 |
| 12 | Cavaquinho | `strings.cavaquinho` | 35 x 15 |

List to paste:

```text
1 oud alone, a pear-shaped lute with a bent neck, no player (55 x 35 cm)
2 bouzouki alone, no player (45 x 25 cm)
3 balalaika alone with a triangular body, no player (65 x 25 cm)
4 koto alone, a long japanese zither on legs, no player (180 x 30 cm)
5 erhu alone with its bow, no player (80 x 15 cm)
6 kora alone, a west african harp-lute with a round gourd, no player (70 x 35 cm)
7 charango alone, no player (35 x 15 cm)
8 lute alone with a bent back peg box, no player (60 x 35 cm)
9 zither alone, no player (60 x 30 cm)
10 bandoneon alone, a square-ended concertina, no player (30 x 25 cm)
11 hurdy-gurdy alone with a crank, no player (60 x 25 cm)
12 cavaquinho alone, no player (35 x 15 cm)
```

## Sheet 39 (Orchestra furniture)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Orchestra chair | `orch.chair` | 45 x 45 |
| 2 | Double-desk stand | `orch.stand-2` | 70 x 40 |
| 3 | Conductor podium | `orch.podium` | 100 x 100 |
| 4 | Conductor score stand | `orch.score-stand` | 70 x 40 |
| 5 | Harp bench | `orch.harp-bench` | 70 x 35 |
| 6 | Bass stool | `orch.bass-stool` | 40 x 40 |
| 7 | Percussion trolley | `orch.perc-trolley` | 100 x 50 |
| 8 | Choir riser tier | `orch.riser-tier` | 200 x 60 |
| 9 | Acoustic shell panel | `orch.shell` | 200 x 15 |
| 10 | Stand light | `orch.stand-light` | 10 x 10 |
| 11 | Brass stand rack | `orch.brass-rack` | 60 x 40 |
| 12 | Cello case | `orch.cello-case` | 40 x 130 |

List to paste:

```text
1 orchestra chair with a straight back (45 x 45 cm)
2 double music stand for two players (70 x 40 cm)
3 conductor podium with a safety rail (100 x 100 cm)
4 conductor score stand (70 x 40 cm)
5 harp bench (70 x 35 cm)
6 high stool for a double bass player (40 x 40 cm)
7 percussion trolley with small instruments (100 x 50 cm)
8 curved choir riser tier with steps (200 x 60 cm)
9 acoustic shell panel on wheels (200 x 15 cm)
10 small clip light on a music stand (10 x 10 cm)
11 rack holding several brass instruments (60 x 40 cm)
12 cello case lying flat (40 x 130 cm)
```

## Sheet 40 (Audio consoles and processing)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Portable mixer | `desk.portable` | 35 x 30 |
| 2 | Powered mixer | `desk.powered` | 45 x 40 |
| 3 | Large-format console | `desk.large` | 200 x 90 |
| 4 | Digital stage box | `rack.stagebox-digital` | 45 x 30 |
| 5 | Compressor | `rack.compressor` | 48 x 10 |
| 6 | Graphic EQ | `rack.geq` | 48 x 15 |
| 7 | Effects processor | `rack.fx-unit` | 48 x 10 |
| 8 | Speaker processor | `rack.speaker-proc` | 48 x 10 |
| 9 | Power amp | `rack.power-amp` | 48 x 40 |
| 10 | Cue box | `rack.cue-box` | 20 x 15 |

List to paste:

```text
1 small portable mixer with faders and knobs (35 x 30 cm)
2 powered mixer with faders, knobs and a built-in amplifier (45 x 40 cm)
3 large-format mixing console with many faders and a screen (200 x 90 cm)
4 digital stage box with many XLR inputs and a network port (45 x 30 cm)
5 rack compressor with two meters and knobs (48 x 10 cm)
6 rack graphic equalizer with a row of sliders (48 x 15 cm)
7 rack effects processor with a display and a data wheel (48 x 10 cm)
8 rack speaker processor with a display and two meters (48 x 10 cm)
9 rack power amplifier with large ventilation grilles (48 x 40 cm)
10 headphone cue box with a volume knob (20 x 15 cm)
```

## Sheet 41 (Lighting control and ground support)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Lighting console, large | `control.lx-large` | 150 x 80 |
| 2 | Fader wing | `control.lx-wing` | 60 x 40 |
| 3 | DMX controller | `control.dmx` | 40 x 25 |
| 4 | Dimmer pack | `control.dimmer-pack` | 40 x 30 |
| 5 | Crank-up tower | `rig.crank` | 60 x 60 |
| 6 | Ground support tower | `rig.ground-tower` | 100 x 100 |
| 7 | Lighting boom | `rig.boom` | 40 x 40 |
| 8 | Stage roof section | `rig.roof` | 300 x 300 |
| 9 | Handrail | `rig.handrail` | 200 x 10 |
| 10 | Stage skirt | `rig.skirt` | 300 x 5 |
| 11 | Box truss | `rig.truss-box` | 300 x 300 |
| 12 | Truss corner | `rig.truss-corner` | 60 x 60 |

List to paste:

```text
1 large lighting console with many faders, buttons and two screens (150 x 80 cm)
2 lighting fader wing with a row of faders (60 x 40 cm)
3 small dmx controller with sliders (40 x 25 cm)
4 portable dimmer pack with several sockets (40 x 30 cm)
5 crank-up lighting tower with a bar on top (60 x 60 cm)
6 square truss ground support tower with a hoist (100 x 100 cm)
7 vertical lighting boom with a base plate and several side arms (40 x 40 cm)
8 stage roof section seen from above with its truss frame (300 x 300 cm)
9 stage handrail section (200 x 10 cm)
10 stage skirt cloth with pleats (300 x 5 cm)
11 square truss rectangle seen from above with corners (300 x 300 cm)
12 truss corner block (60 x 60 cm)
```

## Sheet 42 (Video cameras and streaming)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Shoulder camera | `video.shoulder` | 30 x 60 |
| 2 | Steadicam | `video.steadicam` | 80 x 60 |
| 3 | Drone | `video.drone` | 35 x 35 |
| 4 | Action camera | `video.action` | 6 x 6 |
| 5 | Camera slider | `video.slider` | 100 x 20 |
| 6 | Streaming PC | `video.stream-pc` | 40 x 40 |
| 7 | Capture box | `video.capture` | 20 x 15 |
| 8 | Monitor cart | `video.cart` | 60 x 60 |
| 9 | Satellite dish | `video.dish` | 120 x 120 |
| 10 | Wireless video transmitter | `video.wireless` | 15 x 10 |
| 11 | Tally light | `video.tally` | 10 x 10 |
| 12 | Camera dolly | `video.dolly` | 60 x 60 |

List to paste:

```text
1 shoulder-mounted video camera (30 x 60 cm)
2 steadicam rig worn by a camera operator (80 x 60 cm)
3 quadcopter drone with a camera (35 x 35 cm)
4 small action camera in a housing (6 x 6 cm)
5 camera slider rail with a camera on it (100 x 20 cm)
6 streaming computer tower with a monitor (40 x 40 cm)
7 video capture box with HDMI ports (20 x 15 cm)
8 rolling cart with two monitors (60 x 60 cm)
9 satellite uplink dish (120 x 120 cm)
10 wireless video transmitter with an antenna (15 x 10 cm)
11 camera tally light (10 x 10 cm)
12 camera dolly on track with a camera (60 x 60 cm)
```

## Sheet 43 (Scenery and set pieces)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Stage ramp | `set.ramp` | 100 x 300 |
| 2 | Balcony | `set.balcony` | 300 x 100 |
| 3 | Column | `set.column` | 40 x 40 |
| 4 | Archway | `set.arch` | 200 x 30 |
| 5 | Tree | `set.tree` | 100 x 100 |
| 6 | Rock | `set.rock` | 100 x 80 |
| 7 | Picket fence | `set.fence` | 200 x 10 |
| 8 | Street lamp | `set.street-lamp` | 30 x 30 |
| 9 | Prop car | `set.car` | 180 x 400 |
| 10 | Bush | `set.bush` | 60 x 60 |
| 11 | Signpost | `set.signpost` | 30 x 30 |
| 12 | Bridge | `set.bridge` | 300 x 100 |

List to paste:

```text
1 stage ramp with a handrail (100 x 300 cm)
2 balcony with a railing and a column (300 x 100 cm)
3 classical column (40 x 40 cm)
4 archway (200 x 30 cm)
5 large tree with a leafy crown (100 x 100 cm)
6 large rock formation (100 x 80 cm)
7 wooden picket fence section (200 x 10 cm)
8 old-fashioned street lamp (30 x 30 cm)
9 car seen from above (180 x 400 cm)
10 bush (60 x 60 cm)
11 wooden signpost with two arrow boards (30 x 30 cm)
12 small arched bridge with railings (300 x 100 cm)
```

## Sheet 44 (Venue and site II)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Seat row | `venue.seats` | 300 x 45 |
| 2 | Orchestra pit | `venue.pit` | 600 x 200 |
| 3 | Loading dock | `venue.dock` | 300 x 100 |
| 4 | Stage door | `venue.stage-door` | 100 x 20 |
| 5 | Fence panel | `venue.fence` | 250 x 5 |
| 6 | Gate | `venue.gate` | 300 x 10 |
| 7 | Trash bin | `venue.bin` | 50 x 50 |
| 8 | Info desk | `venue.info` | 120 x 60 |
| 9 | Flag pole | `venue.flag` | 20 x 20 |
| 10 | Light tower mast | `venue.mast` | 100 x 100 |
| 11 | Bike rack | `venue.bike` | 200 x 40 |
| 12 | Utility cart | `venue.cart` | 120 x 70 |

List to paste:

```text
1 row of audience chairs (300 x 45 cm)
2 orchestra pit with a rail (600 x 200 cm)
3 loading dock door with a ramp (300 x 100 cm)
4 stage door with a sign (100 x 20 cm)
5 mesh fence panel on feet (250 x 5 cm)
6 double gate (300 x 10 cm)
7 trash bin (50 x 50 cm)
8 information desk with a sign (120 x 60 cm)
9 flag pole with a flag (20 x 20 cm)
10 mobile light tower with lamps on a mast (100 x 100 cm)
11 bicycle rack (200 x 40 cm)
12 utility cart (120 x 70 cm)
```

## Sheet 45 (Safety and signage)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | AED | `safety.aed` | 30 x 30 |
| 2 | Fire blanket | `safety.blanket` | 20 x 20 |
| 3 | Fire alarm | `safety.alarm` | 15 x 15 |
| 4 | Hearing protection | `safety.hearing` | 40 x 40 |
| 5 | Assembly point | `safety.assembly` | 40 x 40 |
| 6 | Emergency light | `safety.emergency-light` | 30 x 15 |
| 7 | Traffic cone | `safety.cone` | 30 x 30 |
| 8 | Caution tape | `safety.tape` | 100 x 5 |
| 9 | Wet floor sign | `safety.wet` | 30 x 30 |
| 10 | No smoking | `safety.no-smoking` | 30 x 30 |
| 11 | Restricted area | `safety.restricted` | 30 x 30 |
| 12 | Exit sign | `safety.exit-sign` | 40 x 10 |

List to paste:

```text
1 defibrillator cabinet with a heart and a bolt (30 x 30 cm)
2 fire blanket in a case (20 x 20 cm)
3 fire alarm call point (15 x 15 cm)
4 hearing protection sign with ear defenders (40 x 40 cm)
5 assembly point sign with a group of people (40 x 40 cm)
6 emergency light (30 x 15 cm)
7 traffic cone (30 x 30 cm)
8 caution tape with diagonal stripes (100 x 5 cm)
9 wet floor sign (30 x 30 cm)
10 no smoking sign (30 x 30 cm)
11 restricted area sign with a hand (30 x 30 cm)
12 exit sign with an arrow (40 x 10 cm)
```

## Sheet 46 (DJ and electronic)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Modular synth | `synth.modular` | 120 x 40 |
| 2 | Drum machine | `synth.drum-machine` | 35 x 30 |
| 3 | Groovebox | `synth.groovebox` | 30 x 25 |
| 4 | CDJ player | `dj.cdj` | 35 x 45 |
| 5 | DJ mixer | `dj.mixer` | 35 x 40 |
| 6 | Vocoder keyboard | `synth.vocoder` | 80 x 30 |
| 7 | Theremin | `synth.theremin` | 60 x 60 |
| 8 | Desktop synth | `synth.desktop` | 30 x 20 |
| 9 | Sequencer | `synth.sequencer` | 30 x 20 |
| 10 | Vinyl crate | `dj.crate` | 35 x 35 |
| 11 | Vocal harmoniser | `rack.harmoniser` | 25 x 15 |
| 12 | Guitar loop station | `pedal.loop-station` | 30 x 15 |

List to paste:

```text
1 modular synthesizer rack with many knobs and patch cables (120 x 40 cm)
2 drum machine with a grid of pads (35 x 30 cm)
3 groovebox with knobs and small pads (30 x 25 cm)
4 cdj media player with a large jog wheel (35 x 45 cm)
5 dj mixer with channel faders and a crossfader (35 x 40 cm)
6 vocoder keyboard with a gooseneck microphone (80 x 30 cm)
7 theremin with two antennas (60 x 60 cm)
8 desktop synth module with knobs (30 x 20 cm)
9 step sequencer with a row of buttons (30 x 20 cm)
10 crate full of vinyl records (35 x 35 cm)
11 vocal harmoniser box with knobs (25 x 15 cm)
12 loop station pedal with two footswitches and a display (30 x 15 cm)
```

## Sheet 47 (Conference and ceremony)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Conference table | `conf.table` | 240 x 80 |
| 2 | Panel table | `conf.panel` | 300 x 70 |
| 3 | Rostrum | `conf.rostrum` | 70 x 50 |
| 4 | Backdrop banner | `conf.banner` | 400 x 20 |
| 5 | Step-and-repeat | `conf.step-repeat` | 300 x 20 |
| 6 | Flag | `conf.flag` | 40 x 40 |
| 7 | Trophy table | `conf.trophy` | 150 x 60 |
| 8 | Red carpet | `conf.carpet` | 500 x 150 |
| 9 | Ceremony chairs | `conf.chairs` | 200 x 45 |
| 10 | Interpretation booth | `conf.booth` | 200 x 150 |
| 11 | Interpreter receiver | `conf.receiver` | 10 x 7 |
| 12 | Captioning screen | `conf.captions` | 100 x 15 |

List to paste:

```text
1 conference table with microphones along it (240 x 80 cm)
2 panel table with a skirt and name cards (300 x 70 cm)
3 rostrum with a microphone and a lamp (70 x 50 cm)
4 large backdrop banner on a frame (400 x 20 cm)
5 step and repeat logo backdrop on a frame (300 x 20 cm)
6 flag on a floor stand (40 x 40 cm)
7 table with trophies (150 x 60 cm)
8 red carpet runner with stanchions (500 x 150 cm)
9 row of ceremony chairs (200 x 45 cm)
10 simultaneous interpretation booth with two seats and a window (200 x 150 cm)
11 interpretation receiver with a headset (10 x 7 cm)
12 live captioning screen (100 x 15 cm)
```

## Sheet 48 (Guitars alone II)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Double-cut electric | `strings.guitar-dc` | 40 x 15 |
| 2 | Single-cut slab electric | `strings.guitar-tele` | 40 x 15 |
| 3 | Carved single-cut | `strings.guitar-lp` | 40 x 15 |
| 4 | Archtop jazz guitar | `strings.guitar-archtop` | 45 x 18 |
| 5 | Semi-hollow guitar | `strings.guitar-semi` | 42 x 17 |
| 6 | V-shaped guitar | `strings.guitar-v` | 45 x 20 |
| 7 | Double-neck guitar | `strings.guitar-double` | 45 x 20 |
| 8 | Classical guitar | `strings.guitar-classical` | 40 x 15 |
| 9 | 12-string guitar | `strings.guitar-12` | 40 x 15 |
| 10 | Resonator guitar | `strings.guitar-reso` | 40 x 15 |
| 11 | Lap steel | `strings.lap-steel` | 60 x 15 |
| 12 | Flamenco guitar | `strings.guitar-flamenco` | 40 x 15 |

List to paste:

```text
1 double-cutaway solid-body electric guitar alone, no player (40 x 15 cm)
2 single-cutaway slab electric guitar alone, no player (40 x 15 cm)
3 carved-top single-cutaway electric guitar alone, no player (40 x 15 cm)
4 archtop hollow-body jazz guitar with f-holes alone, no player (45 x 18 cm)
5 semi-hollow electric guitar with f-holes alone, no player (42 x 17 cm)
6 V-shaped electric guitar alone, no player (45 x 20 cm)
7 double-neck electric guitar alone, no player (45 x 20 cm)
8 classical nylon-string guitar alone with a wide neck, no player (40 x 15 cm)
9 twelve-string acoustic guitar alone, no player (40 x 15 cm)
10 resonator guitar alone with a metal round cone, no player (40 x 15 cm)
11 lap steel guitar alone, no player (60 x 15 cm)
12 flamenco guitar alone with a golpeador plate, no player (40 x 15 cm)
```

## Sheet 49 (Basses alone)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Precision-style bass | `strings.bass-p` | 45 x 15 |
| 2 | Jazz-style bass | `strings.bass-j` | 45 x 15 |
| 3 | 5-string bass | `strings.bass-5` | 48 x 16 |
| 4 | Headless bass | `strings.bass-headless` | 40 x 15 |
| 5 | Acoustic bass guitar | `strings.bass-acoustic` | 50 x 20 |
| 6 | Electric upright bass | `strings.bass-eub` | 50 x 25 |
| 7 | Bass VI | `strings.bass-vi` | 42 x 15 |
| 8 | Bass ukulele | `strings.bass-uke` | 30 x 15 |
| 9 | Chapman stick | `strings.stick` | 90 x 10 |
| 10 | Fretless bass | `strings.bass-fretless` | 45 x 15 |

List to paste:

```text
1 precision style electric bass alone, no player (45 x 15 cm)
2 offset-body jazz style electric bass alone, no player (45 x 15 cm)
3 five-string electric bass alone, no player (48 x 16 cm)
4 headless modern electric bass alone, no player (40 x 15 cm)
5 acoustic bass guitar alone, no player (50 x 20 cm)
6 electric upright bass with a slim body and a stand, no player (50 x 25 cm)
7 six-string baritone bass guitar alone, no player (42 x 15 cm)
8 bass ukulele alone, no player (30 x 15 cm)
9 chapman stick alone, a long flat wide-fretboard instrument, no player (90 x 10 cm)
10 fretless electric bass alone, no player (45 x 15 cm)
```

## Sheet 50 (Guitarists and bassists II)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Singer-songwriter standing | `person.guitar-singer` | 60 x 60 |
| 2 | Classical guitarist seated | `person.classical-guitar` | 60 x 60 |
| 3 | Flamenco guitarist | `person.flamenco` | 60 x 60 |
| 4 | Pedal steel player | `person.pedal-steel` | 120 x 70 |
| 5 | Lap steel player | `person.lap-steel` | 60 x 60 |
| 6 | Electric upright bassist | `person.upright-bass` | 70 x 70 |
| 7 | Slap bassist | `person.slap` | 90 x 90 |
| 8 | Seated bassist | `person.bass-seated` | 70 x 70 |
| 9 | Ukulele player | `person.ukulele` | 50 x 50 |
| 10 | Mandolin player | `person.mandolin` | 50 x 50 |
| 11 | Banjo player standing | `person.banjo-standing` | 60 x 60 |
| 12 | Two guitarists | `person.guitar-duo` | 120 x 70 |

List to paste:

```text
1 person standing with an acoustic guitar on a strap, singing (60 x 60 cm)
2 person seated on a chair with a classical guitar and a footstool (60 x 60 cm)
3 person seated crossing legs playing a flamenco guitar (60 x 60 cm)
4 person seated at a pedal steel guitar (120 x 70 cm)
5 person seated with a lap steel guitar on the lap (60 x 60 cm)
6 person standing playing an electric upright bass (70 x 70 cm)
7 person standing playing a bass guitar with a slapping gesture (90 x 90 cm)
8 person seated on a stool playing a bass guitar (70 x 70 cm)
9 person standing playing a ukulele (50 x 50 cm)
10 person standing playing a mandolin (50 x 50 cm)
11 person standing playing a banjo on a strap (60 x 60 cm)
12 two people standing side by side playing guitars (120 x 70 cm)
```

## Sheet 51 (Guitar accessories)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Guitar hard case | `guitar.case` | 110 x 40 |
| 2 | Bass hard case | `guitar.case-bass` | 125 x 40 |
| 3 | Gig bag | `guitar.gigbag` | 110 x 40 |
| 4 | Single guitar stand | `stand.guitar-single` | 30 x 30 |
| 5 | A-frame stand | `stand.guitar-a` | 40 x 40 |
| 6 | Wall hanger | `stand.guitar-hanger` | 15 x 10 |
| 7 | Guitar footstool | `stand.footstool` | 30 x 20 |

List to paste:

```text
1 electric guitar hard case lying flat with latches (110 x 40 cm)
2 bass guitar hard case lying flat with latches (125 x 40 cm)
3 guitar gig bag with a pocket (110 x 40 cm)
4 single guitar stand holding one electric guitar (30 x 30 cm)
5 a-frame guitar stand holding one acoustic guitar (40 x 40 cm)
6 wall mounted guitar hanger holding one guitar (15 x 10 cm)
7 adjustable guitar footstool (30 x 20 cm)
```

## Sheet 52 (World winds, instruments alone)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Duduk | `winds.duduk` | 35 x 5 |
| 2 | Shakuhachi | `winds.shakuhachi` | 55 x 6 |
| 3 | Panpipes | `winds.panpipes` | 30 x 8 |
| 4 | Quena | `winds.quena` | 40 x 5 |
| 5 | Ocarina | `winds.ocarina` | 15 x 10 |
| 6 | Bansuri | `winds.bansuri` | 60 x 5 |
| 7 | Tin whistle | `winds.whistle` | 30 x 3 |
| 8 | Uilleann pipes | `winds.uilleann` | 60 x 30 |
| 9 | Zurna | `winds.zurna` | 45 x 10 |
| 10 | Sheng | `winds.sheng` | 30 x 20 |
| 11 | Suona | `winds.suona` | 50 x 12 |
| 12 | Ney | `winds.ney` | 65 x 4 |

List to paste:

```text
1 duduk alone, an armenian double-reed wooden pipe, no player (35 x 5 cm)
2 shakuhachi alone, a japanese bamboo flute, no player (55 x 6 cm)
3 panpipes alone, a row of tubes of different lengths, no player (30 x 8 cm)
4 quena alone, an andean notched flute, no player (40 x 5 cm)
5 ocarina alone, a ceramic egg-shaped flute, no player (15 x 10 cm)
6 bansuri alone, an indian bamboo flute, no player (60 x 5 cm)
7 tin whistle alone, no player (30 x 3 cm)
8 uilleann pipes alone with bag, bellows and chanter, no player (60 x 30 cm)
9 zurna alone, a conical double-reed horn with a flared bell, no player (45 x 10 cm)
10 sheng alone, a chinese mouth organ with vertical pipes, no player (30 x 20 cm)
11 suona alone, a chinese horn with a metal bell, no player (50 x 12 cm)
12 ney alone, an end-blown reed flute, no player (65 x 4 cm)
```

## Sheet 53 (World percussion II)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Bendir | `perc.bendir` | 40 x 40 |
| 2 | Darbuka | `perc.darbuka` | 30 x 30 |
| 3 | Dhol | `perc.dhol` | 35 x 55 |
| 4 | Mridangam | `perc.mridangam` | 25 x 60 |
| 5 | Pandeiro | `perc.pandeiro` | 25 x 25 |
| 6 | Berimbau | `perc.berimbau` | 120 x 20 |
| 7 | Shekere | `perc.shekere` | 30 x 30 |
| 8 | Talking drum | `perc.talking` | 30 x 30 |
| 9 | Udu | `perc.udu` | 40 x 40 |
| 10 | Cajon | `perc.cajon-alone` | 30 x 30 |
| 11 | Cuica | `perc.cuica` | 25 x 25 |
| 12 | Daf | `perc.daf` | 45 x 45 |

List to paste:

```text
1 bendir frame drum with a snare (40 x 40 cm)
2 darbuka goblet drum (30 x 30 cm)
3 dhol barrel drum with a strap (35 x 55 cm)
4 mridangam, a two-headed barrel drum lying on its side (25 x 60 cm)
5 pandeiro with metal jingles (25 x 25 cm)
6 berimbau with a gourd and a stretched wire (120 x 20 cm)
7 shekere, a gourd covered with a net of beads (30 x 30 cm)
8 talking drum, an hourglass drum with strings and a curved stick (30 x 30 cm)
9 udu clay pot drum with a side hole (40 x 40 cm)
10 cajon box drum with a round sound hole (30 x 30 cm)
11 cuica friction drum with a stick inside (25 x 25 cm)
12 daf frame drum with metal rings inside (45 x 45 cm)
```

## Sheet 54 (World strings II, instruments alone)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Sarod | `strings.sarod` | 110 x 30 |
| 2 | Veena | `strings.veena` | 120 x 30 |
| 3 | Tanpura | `strings.tanpura` | 130 x 40 |
| 4 | Santoor | `strings.santoor` | 90 x 40 |
| 5 | Shamisen | `strings.shamisen` | 95 x 20 |
| 6 | Pipa | `strings.pipa` | 90 x 30 |
| 7 | Guzheng | `strings.guzheng` | 165 x 40 |
| 8 | Saz | `strings.saz` | 100 x 25 |
| 9 | Nyckelharpa | `strings.nyckelharpa` | 70 x 25 |
| 10 | Cimbalom | `strings.cimbalom` | 120 x 70 |
| 11 | Harmonium | `keys.harmonium` | 90 x 40 |
| 12 | Arpa llanera | `strings.arpa-llanera` | 120 x 50 |

List to paste:

```text
1 sarod alone, an indian fretless lute, no player (110 x 30 cm)
2 saraswati veena alone, an indian long-necked lute with two gourds, no player (120 x 30 cm)
3 tanpura alone, a long-necked drone lute with a large gourd, no player (130 x 40 cm)
4 santoor alone, a trapezoid hammered dulcimer, no player (90 x 40 cm)
5 shamisen alone, a three-string japanese lute, no player (95 x 20 cm)
6 pipa alone, a pear-shaped chinese lute, no player (90 x 30 cm)
7 guzheng alone, a long chinese zither on legs, no player (165 x 40 cm)
8 saz alone, a long-necked turkish lute, no player (100 x 25 cm)
9 nyckelharpa alone, a swedish keyed fiddle, no player (70 x 25 cm)
10 cimbalom alone, a large hammered dulcimer on legs, no player (120 x 70 cm)
11 indian harmonium alone, a small pump organ on legs, no player (90 x 40 cm)
12 arpa llanera alone, a venezuelan folk harp, no player (120 x 50 cm)
```

## Sheet 55 (Gamelan and Asian ensemble)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Gong ageng | `gamelan.gong` | 100 x 40 |
| 2 | Saron | `gamelan.saron` | 90 x 40 |
| 3 | Bonang | `gamelan.bonang` | 100 x 60 |
| 4 | Kenong | `gamelan.kenong` | 60 x 60 |
| 5 | Angklung | `gamelan.angklung` | 30 x 30 |
| 6 | Kulintang | `gamelan.kulintang` | 120 x 40 |
| 7 | Singing bowl | `gamelan.bowl` | 25 x 25 |
| 8 | Temple blocks | `gamelan.temple` | 80 x 30 |
| 9 | Tibetan long horn | `gamelan.dungchen` | 250 x 30 |
| 10 | Dizi | `winds.dizi` | 65 x 4 |

List to paste:

```text
1 large hanging gamelan gong in a carved frame (100 x 40 cm)
2 saron, metal bars over a carved wooden resonator (90 x 40 cm)
3 bonang, a row of small gongs on a wooden frame (100 x 60 cm)
4 kenong, large pot gongs on a frame (60 x 60 cm)
5 angklung, bamboo tubes shaken in a frame (30 x 30 cm)
6 kulintang, a row of small gongs lying on a frame (120 x 40 cm)
7 tibetan singing bowl on a cushion with a mallet (25 x 25 cm)
8 temple blocks, a row of wooden blocks on a stand (80 x 30 cm)
9 long tibetan horn lying on a stand (250 x 30 cm)
10 dizi alone, a chinese bamboo flute, no player (65 x 4 cm)
```

## Line-art people (style B: replace the solid black figures)

The solid black figures with a round head (sheets 1, 1b, 2 and 10) are not liked. Sheets 56 to 58 ask for the same roles in the line-art style that worked in sheets 30 and 50. Use this style block for these three sheets instead of the pictogram one:

```text
Style: clean black ink line-art illustration of people for a live-event stage plot, like a technical engraving: confident medium-thick outlines, small areas of solid black for dark clothes and hair, light hatching only for shadows, natural realistic proportions, friendly diverse adults, no colour, no grey wash, no text, no background. Every person is shown whole, standing or seated, seen from the front or slightly from the side, with the instrument or object clearly visible.
```

## Sheet 56 (People with instruments, line art I)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Double bassist | `person2.doublebass` | 60 x 60 |
| 2 | Violinist | `person2.violin` | 70 x 70 |
| 3 | Cellist | `person2.cello` | 70 x 90 |
| 4 | Harpist | `person2.harp` | 90 x 100 |
| 5 | Electric guitarist | `person2.eguitar` | 90 x 90 |
| 6 | Saxophonist | `person2.sax` | 60 x 70 |
| 7 | Trumpeter | `person2.trumpet` | 50 x 70 |
| 8 | Trombonist | `person2.trombone` | 60 x 90 |
| 9 | Flutist | `person2.flute` | 60 x 60 |
| 10 | Clarinetist | `person2.clarinet` | 60 x 60 |
| 11 | Tuba player | `person2.tuba` | 70 x 70 |
| 12 | French horn player | `person2.horn` | 60 x 60 |

List to paste:

```text
1 musician standing playing an upright double bass (60 x 60 cm)
2 musician standing playing a violin with a bow (70 x 70 cm)
3 musician seated playing a cello (70 x 90 cm)
4 musician seated playing a concert harp (90 x 100 cm)
5 rock guitarist standing playing an electric guitar (90 x 90 cm)
6 musician standing playing a saxophone (60 x 70 cm)
7 musician standing playing a trumpet (50 x 70 cm)
8 musician standing playing a trombone with the slide extended (60 x 90 cm)
9 musician standing playing a transverse flute (60 x 60 cm)
10 musician standing playing a clarinet (60 x 60 cm)
11 musician seated playing a tuba (70 x 70 cm)
12 musician seated playing a french horn (60 x 60 cm)
```

## Sheet 57 (People with instruments, line art II)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Oboist or bassoonist | `person2.oboe` | 50 x 50 |
| 2 | Timpanist | `person2.timpani` | 150 x 120 |
| 3 | Marimba player | `person2.marimba` | 200 x 80 |
| 4 | Vibraphone player | `person2.vibraphone` | 150 x 70 |
| 5 | Accordionist | `person2.accordion` | 60 x 60 |
| 6 | Keytar player | `person2.keytar` | 60 x 60 |
| 7 | Pianist | `person2.piano` | 150 x 200 |
| 8 | Keyboardist | `person2.keys` | 140 x 90 |
| 9 | Organist | `person2.organ` | 130 x 80 |
| 10 | Conga player | `person2.congas` | 90 x 70 |
| 11 | Conductor | `person2.conductor` | 80 x 80 |
| 12 | DJ | `person2.dj` | 180 x 70 |

List to paste:

```text
1 musician standing playing an oboe (50 x 50 cm)
2 musician standing behind four timpani holding mallets (150 x 120 cm)
3 musician standing playing a marimba with four mallets (200 x 80 cm)
4 musician standing playing a vibraphone (150 x 70 cm)
5 musician seated playing an accordion (60 x 60 cm)
6 musician standing with a keytar on a strap (60 x 60 cm)
7 pianist seated at a grand piano seen from the side (150 x 200 cm)
8 keyboardist standing behind two keyboards on a stand (140 x 90 cm)
9 organist seated at an organ with two keyboards (130 x 80 cm)
10 percussionist seated playing two congas (90 x 70 cm)
11 conductor on a podium with a baton (80 x 80 cm)
12 DJ standing behind a table with two turntables and a mixer, wearing headphones (180 x 70 cm)
```

## Sheet 58 (People, line art III)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Standing person | `person2.standing` | 50 x 50 |
| 2 | Seated person | `person2.seated` | 60 x 60 |
| 3 | Presenter | `person2.presenter` | 60 x 60 |
| 4 | Lead singer | `person2.singer` | 70 x 70 |
| 5 | Choir singer | `person2.choir` | 40 x 40 |
| 6 | Speaker at a lectern | `person2.lectern` | 70 x 50 |
| 7 | Person with a laptop | `person2.laptop` | 60 x 60 |
| 8 | Percussionist standing | `person2.perc` | 70 x 70 |

List to paste:

```text
1 neutral adult standing relaxed, arms at the sides (50 x 50 cm)
2 adult seated on a chair (60 x 60 cm)
3 presenter standing holding a microphone and gesturing (60 x 60 cm)
4 singer standing at a microphone stand, one hand on the stand (70 x 70 cm)
5 choir singer standing holding a folder (40 x 40 cm)
6 speaker standing behind a lectern (70 x 50 cm)
7 person seated with a laptop on the knees (60 x 60 cm)
8 percussionist standing with a hand drum and a tambourine (70 x 70 cm)
```

## Faceless figures (style C: the style to keep for people)

Sheets 56 to 58 came back as faceless line art and that is the style to keep. The figures left in other styles are redone in sheets 59 to 61, with this style block:

```text
Style: faceless black line-art figures for a live-event stage plot. Clean, confident, even outlines on a pure white background, no fills, no grey, no shading, no hatching, no text. Each person is whole, with natural proportions, simple modern clothes, a plain blank face with no features, and clearly visible hands. Seen from the front or slightly from the side. Same line weight and same figure size across the sheet.
```

## Sheet 59 (Faceless people with instruments II)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Singer-songwriter standing | `person3.guitar-singer` | 60 x 60 |
| 2 | Classical guitarist seated | `person3.classical-guitar` | 60 x 60 |
| 3 | Flamenco guitarist | `person3.flamenco` | 60 x 60 |
| 4 | Pedal steel player | `person3.pedal-steel` | 120 x 70 |
| 5 | Lap steel player | `person3.lap-steel` | 60 x 60 |
| 6 | Electric upright bassist | `person3.upright-bass` | 70 x 70 |
| 7 | Slap bassist | `person3.slap` | 90 x 90 |
| 8 | Seated bassist | `person3.bass-seated` | 70 x 70 |
| 9 | Ukulele player | `person3.ukulele` | 50 x 50 |
| 10 | Mandolin player | `person3.mandolin` | 50 x 50 |
| 11 | Banjo player standing | `person3.banjo-standing` | 60 x 60 |
| 12 | Two guitarists | `person3.guitar-duo` | 120 x 70 |

List to paste:

```text
1 person standing singing at a microphone and playing an acoustic guitar on a strap (60 x 60 cm)
2 person seated on a chair with a classical guitar and a footstool (60 x 60 cm)
3 person seated with legs crossed playing a flamenco guitar (60 x 60 cm)
4 person seated at a pedal steel guitar (120 x 70 cm)
5 person seated with a lap steel guitar on the lap (60 x 60 cm)
6 person standing playing an electric upright bass (70 x 70 cm)
7 person standing playing a bass guitar with a slapping gesture (90 x 90 cm)
8 person seated on a stool playing a bass guitar (70 x 70 cm)
9 person standing playing a ukulele (50 x 50 cm)
10 person standing playing a mandolin (50 x 50 cm)
11 person standing playing a banjo on a strap (60 x 60 cm)
12 two people standing side by side playing guitars (120 x 70 cm)
```

## Sheet 60 (Faceless people on and around the stage)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Backing vocalist | `person3.backing` | 50 x 50 |
| 2 | Dancer | `person3.dancer` | 80 x 80 |
| 3 | Actor | `person3.actor` | 60 x 60 |
| 4 | Wheelchair user | `person3.wheelchair` | 70 x 110 |
| 5 | Child | `person3.child` | 35 x 35 |
| 6 | Kneeling person | `person3.kneeling` | 60 x 60 |
| 7 | Sound engineer | `person3.engineer` | 90 x 70 |
| 8 | Light technician | `person3.lx` | 60 x 60 |
| 9 | Stage manager | `person3.sm` | 60 x 60 |
| 10 | Guitar tech | `person3.tech` | 60 x 60 |
| 11 | Seated on stool | `person3.stool` | 50 x 50 |
| 12 | Drummer | `person3.drummer` | 60 x 60 |

List to paste:

```text
1 person standing singing with one hand to the ear (50 x 50 cm)
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

## Sheet 61 (Faceless crew, audience and groups)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Sign language interpreter | `person3.interpreter` | 60 x 60 |
| 2 | Stagehand | `person3.crew` | 50 x 50 |
| 3 | Security | `person3.security` | 50 x 50 |
| 4 | Marching drummer | `person3.marching` | 50 x 50 |
| 5 | Camera operator | `person3.camera-op` | 80 x 80 |
| 6 | Steadicam operator | `person3.steadicam` | 80 x 60 |
| 7 | Stage manager at desk | `person3.sm-desk` | 120 x 70 |
| 8 | FOH engineer at console | `person3.foh` | 150 x 80 |
| 9 | Audience | `person3.audience` | 800 x 600 |
| 10 | Choir on risers | `person3.choir-risers` | 400 x 200 |
| 11 | Photographer | `person3.photographer` | 60 x 60 |
| 12 | Bartender | `person3.bartender` | 60 x 60 |

List to paste:

```text
1 sign language interpreter standing with both hands raised (60 x 60 cm)
2 stagehand standing with a coil of cable over the shoulder (50 x 50 cm)
3 security guard standing with arms folded (50 x 50 cm)
4 marching drummer standing with a snare drum on a sling (50 x 50 cm)
5 camera operator with a video camera on a tripod (80 x 80 cm)
6 camera operator wearing a steadicam rig (80 x 60 cm)
7 person with a headset seated at a desk with a monitor (120 x 70 cm)
8 person seated behind a large mixing console (150 x 80 cm)
9 crowd of people seen from behind, three rows (800 x 600 cm)
10 choir of about eight people on three-step risers holding folders (400 x 200 cm)
11 photographer kneeling with a camera at the eye (60 x 60 cm)
12 bartender standing behind a bar counter shaking a cocktail (60 x 60 cm)
```

## Sheet 62 (Faceless staff, emergency and hosts)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Usher | `person3.usher` | 50 x 50 |
| 2 | Paramedic | `person3.paramedic` | 60 x 60 |
| 3 | Firefighter on duty | `person3.firefighter` | 60 x 60 |
| 4 | Police officer | `person3.police` | 50 x 50 |
| 5 | Safety marshal | `person3.marshal` | 50 x 50 |
| 6 | Waiter | `person3.waiter` | 50 x 50 |
| 7 | Merch seller | `person3.merch` | 50 x 50 |
| 8 | Host or MC | `person3.mc` | 60 x 60 |
| 9 | Comedian | `person3.comedian` | 60 x 60 |
| 10 | Magician | `person3.magician` | 60 x 60 |
| 11 | Reporter | `person3.reporter` | 60 x 60 |
| 12 | Rigger | `person3.rigger` | 60 x 60 |

List to paste (with the faceless style block above):

```text
1 usher standing holding a small torch pointing down (50 x 50 cm)
2 paramedic standing with a medical bag and a cross on the uniform (60 x 60 cm)
3 firefighter standing in a helmet and protective coat (60 x 60 cm)
4 police officer standing with a cap and a radio (50 x 50 cm)
5 safety marshal in a high-visibility vest holding a radio (50 x 50 cm)
6 waiter standing holding a tray with glasses (50 x 50 cm)
7 merchandise seller standing holding a t-shirt (50 x 50 cm)
8 host standing with a microphone and one arm raised (60 x 60 cm)
9 stand-up comedian at a microphone stand (60 x 60 cm)
10 magician in a top hat and cape holding a wand (60 x 60 cm)
11 reporter holding a microphone with a press badge (60 x 60 cm)
12 rigger in a safety harness and helmet holding a rope (60 x 60 cm)
```

## Sheet 63 (Faceless groups and ensembles)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Dancing pair | `person3.dance-pair` | 100 x 80 |
| 2 | Two actors | `person3.actors-2` | 120 x 70 |
| 3 | String quartet | `person3.string-quartet` | 250 x 180 |
| 4 | Brass section | `person3.brass-section` | 300 x 100 |
| 5 | Rock band | `person3.rock-band` | 400 x 250 |
| 6 | Vocal quartet | `person3.vocal-quartet` | 200 x 80 |
| 7 | Concert crowd | `person3.crowd-cheering` | 800 x 600 |
| 8 | Seated audience | `person3.audience-seated` | 800 x 600 |

List to paste (with the faceless style block above):

```text
1 two dancers dancing together as a couple (100 x 80 cm)
2 two actors facing each other in conversation (120 x 70 cm)
3 string quartet of four seated musicians: two violins, a viola and a cello (250 x 180 cm)
4 row of four standing brass players with trumpets and trombones (300 x 100 cm)
5 rock band of four: a singer, a guitarist, a bassist and a drummer (400 x 250 cm)
6 four singers standing in a row (200 x 80 cm)
7 crowd seen from behind with hands raised, three rows (800 x 600 cm)
8 seated audience seen from behind in three rows (800 x 600 cm)
```

## Redo list (style D)

Icons the user did not like, asked again with style block D (paste the block first, then the list). Each sheet replaces the icons named in brackets; the three microphone items are new. Sheets 64 to 66.

## Sheet 64 (Redo: amps, PA and monitors)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Bass amp (replaces 02-05) | `amp.bass` | 80 x 45 |
| 2 | Bass amp head (replaces 24-07) | `amp.bass-head` | 50 x 25 |
| 3 | DI box (replaces 02-10) | `rack.di` | 13 x 9 |
| 4 | Front fill (replaces 05-07) | `pa.front-fill` | 40 x 30 |
| 5 | Side fill (replaces 05-09) | `monitor.sidefill` | 70 x 60 |
| 6 | Drum fill (replaces 05-10) | `monitor.drumfill` | 70 x 60 |
| 7 | Wedge monitor (replaces 02-08) | `monitor.wedge` | 60 x 40 |
| 8 | Hazer (replaces 04-05) | `effect.haze` | 45 x 30 |

List to paste (with style block D above):

```text
1 bass combo amplifier, a tall cabinet with a large speaker and a control panel with knobs on top (80 x 45 cm)
2 bass amplifier head, a flat rack-style box with knobs, a display and a handle (50 x 25 cm)
3 direct injection box, a small metal box with a jack input, an XLR output and a switch (13 x 9 cm)
4 small front fill speaker, a compact black cabinet with one speaker cone, lying on the stage edge (40 x 30 cm)
5 side fill, a large two-way speaker cabinet standing on a short stand and tilted slightly, for stage sides (70 x 60 cm)
6 drum fill, a large speaker cabinet with a sub on a stand, aimed at the drummer (70 x 60 cm)
7 stage wedge monitor, a low trapezoid speaker cabinet with a slanted face and a round speaker cone (60 x 40 cm)
8 hazer machine, a rectangular box with a fluid tank, a nozzle and a handle (45 x 30 cm)
```

## Sheet 65 (Redo: microphones and stage kit)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Headband headset mic | `mic.headband` | 20 x 20 |
| 2 | Ear-hook headset mic | `mic.earset` | 15 x 10 |
| 3 | Hairline hidden mic | `mic.hairline` | 10 x 5 |
| 4 | Guitar stand (replaces 09-01) | `stand.guitar` | 40 x 40 |
| 5 | Laptop (replaces 03-08) | `control.laptop` | 40 x 30 |
| 6 | Projector (replaces 04-01) | `video.projector` | 45 x 35 |
| 7 | Curved LED screen (replaces 33-12) | `video.led-curve` | 400 x 60 |
| 8 | Radio charger (replaces 36-11) | `prod.radios` | 30 x 20 |
| 9 | Harp bench (replaces 39-05) | `orch.harp-bench` | 70 x 35 |
| 10 | Cello case (replaces 39-12) | `orch.cello-case` | 40 x 130 |

List to paste (with style block D above):

```text
1 headset microphone alone, no head: a rigid headband that goes over the head with a thin boom to the mouth and a small capsule (20 x 20 cm)
2 earset microphone alone, no head: a thin ear hook with a slim boom and a tiny capsule at the end (15 x 10 cm)
3 miniature hidden microphone: a tiny capsule on a very thin cable with a small clip, drawn large to be recognisable (10 x 5 cm)
4 guitar stand holding two guitars (40 x 40 cm)
5 open laptop computer seen from slightly above (40 x 30 cm)
6 video projector, a compact rectangular box with a large round lens and a vent (45 x 35 cm)
7 curved LED video wall seen from above as a long curved strip of panels (400 x 60 cm)
8 bank of walkie-talkies charging in a rack (30 x 20 cm)
9 wide padded harp bench (70 x 35 cm)
10 cello case lying flat (40 x 130 cm)
```

## Sheet 66 (Redo: percussion, strings and others)

| # | Item | id (proposed) | Size (cm) |
|---|---|---|---|
| 1 | Toy piano (replaces 35-07) | `keys.toy` | 40 x 30 |
| 2 | Wardrobe rack (replaces 36-06) | `prod.wardrobe` | 150 x 50 |
| 3 | Timbales (replaces 37-01) | `perc.timbales` | 80 x 60 |
| 4 | Surdo (replaces 37-02) | `perc.surdo` | 45 x 45 |
| 5 | Taiko (replaces 37-03) | `perc.taiko` | 60 x 60 |
| 6 | Bouzouki (replaces 38-02) | `strings.bouzouki` | 45 x 25 |
| 7 | Balalaika (replaces 38-03) | `strings.balalaika` | 65 x 25 |
| 8 | Bandoneon (replaces 38-06) | `keys.bandoneon` | 30 x 25 |

List to paste (with style block D above):

```text
1 toy piano small and simple (40 x 30 cm)
2 rolling wardrobe rack with hanging costumes (150 x 50 cm)
3 timbales, two shallow metal drums on a stand with a cowbell (80 x 60 cm)
4 large surdo drum with a strap (45 x 45 cm)
5 large taiko drum on a stand with two sticks (60 x 60 cm)
6 bouzouki alone, no player (45 x 25 cm)
7 balalaika alone with a triangular body, no player (65 x 25 cm)
8 bandoneon alone, a square-ended concertina, no player (30 x 25 cm)
```
