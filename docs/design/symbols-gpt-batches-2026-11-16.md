# Icon sheets for GPT, round 5 (2026-11-16)

Continues `symbols-gpt-batches-2026-11-11.md`. **Read `symbols-gpt-batches-2026-11-07.md` first**: it holds style block D and the sheet template. For these sheets:

1. Paste **style block D** (objects), then the **sheet prompt** template, then the list of the sheet below.
2. One item per line with its size in cm; icons must not touch each other.
3. Sheet 82 **replaces** icons that exist. Cut each icon to the file name of the same id in `symbols/furniture/` (overwrite it) and run `pnpm symbols`. Sheet 83 is for items that already exist and draw a hand-made top-view symbol until their icon arrives: put each SVG in `symbols/video/` (or `symbols/light/`) under the id and run `pnpm symbols`; then add the id to nothing else, the item is already in `items-more.ts`.

## Why sheet 82

The user found that stand icons draw the instrument as well as the stand, so a plan reads as if the instrument were part of the item. The cause is in the sheet 80 prompts of round 4 ("a keyboard resting on two crossed metal frames", "a clamp holding a tablet", "a platform with pedals on it"). The wording below asks for the **bare stand, with nothing on it**, and says so in every line.

Add this sentence at the end of the style block for this sheet: *Every object is the bare support only: no instrument, no keyboard, no guitar, no tablet, no pedals, no amplifier, nothing resting on it or held by it.*

| Sheet | Topic | Items | Library state |
|---|---|---|---|
| 82 | Empty stands (replace) | 13 | exist, with an icon that shows the instrument |
| 83 | Webcam, loose tripods, selfie stick | 10 | exist, without icon |

## Sheet 82 (Empty stands)

| # | Item | id | Size (cm) |
|---|---|---|---|
| 1 | Guitar stand | `stand.guitar` | 40 x 40 |
| 2 | Single guitar stand | `stand.guitar-single` | 30 x 30 |
| 3 | A-frame guitar stand | `stand.guitar-a` | 40 x 40 |
| 4 | Wall hanger | `stand.guitar-hanger` | 15 x 10 |
| 5 | Keyboard stand, X type | `stand.keyboard-x` | 100 x 40 |
| 6 | Keyboard stand, Z type | `stand.keyboard-z` | 100 x 45 |
| 7 | Amp stand | `stand.amp` | 60 x 40 |
| 8 | Tablet stand | `stand.tablet` | 25 x 25 |
| 9 | Pedalboard riser | `stand.pedalboard-riser` | 80 x 40 |
| 10 | Saxophone stand | `stand.sax` | 30 x 30 |
| 11 | Horn stand | `stand.horn` | 25 x 25 |
| 12 | Cello stand | `stand.cello` | 40 x 40 |
| 13 | Instrument rack | `stand.instrument-rack` | 120 x 40 |

```text
1 guitar stand: a folding stand with a tripod base, a tall neck and a padded yoke, empty, no guitar (40 x 40 cm)
2 single guitar stand: a small tripod stand with two padded arms and a neck rest, empty, no guitar (30 x 30 cm)
3 A-frame guitar stand: two tubular legs folded in an A with padded rests, empty, no guitar (40 x 40 cm)
4 wall hanger: a small wooden plate with a padded hook, empty, no guitar (15 x 10 cm)
5 X-type keyboard stand: two crossed tubular frames with rubber feet and a strap, empty, no keyboard (100 x 40 cm)
6 Z-type keyboard stand: a folded Z-shaped tubular frame with a wing nut and two flat rests, empty, no keyboard (100 x 45 cm)
7 amp stand: a short angled platform on two folding legs, empty, no amplifier (60 x 40 cm)
8 tablet stand: a clamp with a flexible neck and an open tablet holder, empty, no tablet (25 x 25 cm)
9 pedalboard riser: a flat empty board tilted on two low wedges, no pedals (80 x 40 cm)
10 saxophone stand: a folding tripod stand with a padded cradle and a peg, empty, no saxophone (30 x 30 cm)
11 horn stand: a small folding stand with a bell holder and a long pole, empty, no horn (25 x 25 cm)
12 cello stand: a stand with a curved holder and a spike plate, empty, no cello (40 x 40 cm)
13 instrument rack: a wide frame with several padded holders in a row, empty, no instruments (120 x 40 cm)
```

## Sheet 83 (Webcam, loose tripods and selfie stick)

| # | Item | id | Size (cm) |
|---|---|---|---|
| 1 | Webcam | `video.webcam` | 9 x 6 |
| 2 | Camera tripod | `video.tripod-camera` | 70 x 70 |
| 3 | Tripod on a wheeled base | `video.tripod-wheels` | 90 x 90 |
| 4 | Tabletop tripod | `video.tripod-mini` | 20 x 20 |
| 5 | Phone tripod | `video.tripod-phone` | 50 x 50 |
| 6 | Flexible tripod | `video.tripod-flex` | 20 x 20 |
| 7 | Monopod | `video.monopod` | 15 x 15 |
| 8 | Overhead camera arm | `video.copy-stand` | 60 x 40 |
| 9 | Selfie stick | `video.selfie-stick` | 10 x 10 |
| 10 | Ring light on a tripod | `light.ring-tripod` | 60 x 60 |

```text
1 webcam: a small flat camera with a round lens and a hinged clip that hangs over the top edge of a screen (9 x 6 cm)
2 camera tripod: a three-legged extendable tripod with a pan handle and an empty camera head, no camera (70 x 70 cm)
3 tripod on a wheeled base: a three-legged tripod standing on a triangular dolly with three small wheels, empty head, no camera (90 x 90 cm)
4 tabletop tripod: a short three-legged tripod with a ball head, no camera (20 x 20 cm)
5 phone tripod: a light three-legged tripod with a spring clamp for a phone at the top, empty clamp, no phone (50 x 50 cm)
6 flexible tripod: a small tripod with bendable segmented legs curled round a pole, no camera (20 x 20 cm)
7 monopod: a single telescopic pole with a rubber foot, a wrist strap and a small head, no camera (15 x 15 cm)
8 overhead camera arm: a flat base with an upright pole and a long arm bent over the base ending in a camera plate, no camera (60 x 40 cm)
9 selfie stick: a telescopic rod with a foam handle and a phone clamp at the end, empty clamp, no phone (10 x 10 cm)
10 ring light on a tripod: a large round LED ring on a pole above a three-legged stand, with a clamp in the middle for a phone, no phone (60 x 60 cm)
```
