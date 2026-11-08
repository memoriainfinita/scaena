# Sizes of the library items from datasheets (2026-11-08)

Two passes on the same day. The first covered the 84 items added with sheets 67 to 74, which came with footprints from the GPT sheet lists and heights estimated per category. The second covered the most-used generic items of the whole library, one common product per type. Where a product has a published size, the item now takes it (width × depth × height, mm). The rest stay estimates.

How a datasheet maps to `w`, `d` and `h`. `h` is the height from the floor as the item stands, which is what the side section uses. Speakers, amps and desks: `w` is the face width and `d` the depth. Wedges: the projected footprint as they sit on the floor, with `h` the height of the box on the floor. Lights: `d` is the length along the beam, and `h` includes the yoke. Moving heads: the base and yoke footprint, with `h` measured head upright. Drums and percussion on stands take only the shell diameter, and the height stays an estimate. Keyboards are measured without their stand, as the library already did. Stands take their highest setting as `h`.

## First pass: items from sheets 67 to 74

| Item | Size now | Reference product | Source |
|---|---|---|---|
| `pa.sub-15` | 480 × 614 × 611 | Yamaha DXS15 MKIII | https://www.thomann.co.uk/yamaha_dxs15_mkiii.htm |
| `desk.compact-digital` | 631 × 512 × 213 | Behringer X32 Compact | https://thomann.co.uk/behringer_x_32_compact.htm |
| `desk.table-8` | 244 × 294 × 71 | Yamaha MG10XU | https://nl.yamaha.com/files/download/other_assets/2/1507032/MG10XU_technical_specifications_En_B0.pdf |
| `desk.large-digital` | 1496 × 875 × 503 | DiGiCo SD7 / Quantum 7 | https://fullcompass.com/common/files/89430-SD7DataSheet.pdf |
| `desk.rackmount` | height 133 | 3 rack units (EIA 1U = 44.45 mm) | rack standard |
| `rack.stagebox-16` | height 89 | Behringer S16, 2 rack units | https://www.thomann.co.uk/behringer_x32_compact_stagebox_plus.htm |
| `light.mover-hybrid` | height 640 | Robe MegaPointe (head upright) | https://www.robe.cz/res/downloads/catalogues/ROBE_MegaPointe_leaflet.pdf |
| `light.pixel-tube` | 1035 × 42 × 42 | Astera Titan Tube | https://astera-led.com/products/titan-tube-kit/specs |
| `light.uplight-battery` | 120 × 120 × 126 | Chauvet DJ Freedom Par Q9 | https://www.huss-licht-ton.de/print_product_info.php/en/products_id/49056 |
| `power.battery` | 400 × 211 × 281 | EcoFlow Delta 2 | https://www.cliftoncameras.co.uk/uploads/specifications/EcoFlow%20DELTA%202%20UK%20Specifications.pdf |
| `power.crossover` | height 55 | Adam Hall Defender MIDI 5 | https://adamhall.com/shop/rs-en/cable-hose-protectors/cable-protectors/1161/midi-5 |

### Looked up and left as estimates

- `light.hmi`: ARRI M18 sizes disagree on which axis is the height (458 mm in one listing, 393 or 388 mm in others)
- `light.cyc-led`: ETC ColorSource CYC datasheet gives 199 mm on the floor and 304 mm hung; the item does not say which
- `rig.truss-tri`, `rig.truss-ladder`: the Prolyte figure found (290 mm) is for the square H30V, not the triangle or ladder sections
- `rig.motor-1t`: CM Lodestar listings give housing sizes per model that do not agree

## Second pass: most-used generic items

| Item | Size now | Reference product | Source |
|---|---|---|---|
| `monitor.wedge` | 580 × 505 × 363 | d&b M4 | https://www.dbaudio.com/global/en/products/series/monitors/m4/ |
| `monitor.wedge-15` | 580 × 505 × 363 | d&b M4 | https://www.dbaudio.com/global/en/products/series/monitors/m4/ |
| `monitor.coax` | 580 × 505 × 363 | d&b M4 | https://www.dbaudio.com/global/en/products/series/monitors/m4/ |
| `monitor.wedge-12` | 486 × 425 × 324 | d&b MAX12 | https://www.dbaudio.com/global/en/products/heritage/max12 |
| `pa.top` | 445 × 380 × 700 | Yamaha DXR15mkII | https://usa.yamaha.com/products/proaudio/speakers/dxr/specs.html |
| `pa.top-15` | 445 × 380 × 700 | Yamaha DXR15mkII | https://usa.yamaha.com/products/proaudio/speakers/dxr/specs.html |
| `pa.top-12` | 356 × 350 × 602 | QSC K12.2 | https://www.huss-licht-ton.de/print_product_info.php/en/products_id/23231 |
| `pa.compact-10` | 320 × 300 × 519 | QSC K10.2 | https://www.qscaudio.com/index.php?id=12708 |
| `pa.column` | 318 × 440 × 2005 | Bose L1 Pro8 | https://thomann.co.uk/bose_l1_pro8.htm |
| `pa.sub` | 520 × 785 × 640 | QSC KS118, with casters | https://soundpro.com/products/qsc-ks118-18-inch-compact-powered-subwoofer |
| `pa.sub-cardioid` | 700 × 728 × 606 | d&b V-SUB, without wheels | https://www.dbaudio.com/global/en/products/series/v-series/v-sub/ |
| `pa.sub-flown` | 700 × 728 × 606 | d&b V-SUB, without wheels | https://www.dbaudio.com/global/en/products/series/v-series/v-sub/ |
| `pa.line` | 733 × 500, height stays 1800 (estimate) | L-Acoustics Kara II, one module wide | https://www.l-acoustics.com/k-series |
| `pa.line-ground` | 733 × 500, height stays 2400 (estimate) | L-Acoustics Kara II, one module wide | https://www.l-acoustics.com/k-series |
| `pa.array-hung` | 733 × 500, height stays 800 (estimate) | L-Acoustics Kara II, one module wide | https://www.l-acoustics.com/k-series |
| `pa.array-hang` | 733 × 500, height stays 800 (estimate) | L-Acoustics Kara II, one module wide | https://www.l-acoustics.com/k-series |
| `pa.mini-line` | 525 × 357 × 404 | L-Acoustics Kiva II, two modules of 202 mm | https://www.l-acoustics.com/k-series |
| `amp.vintage` | 702 × 265 × 556 | Vox AC30C2 | https://voxamps.com/es/?p=12986 |
| `amp.stack` | 770 × 365 × 755 | Marshall 1960A | https://www.marshall.com/fi/en/product/1960a-4x12-angled-cabinet |
| `amp.head` | 740 × 210 × 315 | Marshall JCM800 2203 | https://richtonemusic.co.uk/Marshall-JCM800-2203-Vintage-Reissue-Head |
| `amp.cab-2x12` | 740 × 305 × 600 | Marshall 1936 | https://personalcare.manualsonline.com/manuals/mfg/marshall_amplification/jcm800_series.html?p=22 |
| `amp.bass` | 482 × 355 × 584 | Fender Rumble 500 | https://thomannmusic.no/fender_rumble_500.htm |
| `amp.bass-head` | 610 × 330 × 292 | Ampeg SVT-CL | https://babycare.manualsonline.com/manuals/mfg/ampeg/svtcl_1.html?p=11 |
| `amp.bass-cab` | 660 × 406 × 1219 | Ampeg SVT-810E | https://www.soundhouse.co.jp/en/products/detail/item/9420/ |
| `amp.cab-4x10` | 610 × 406 × 635 | Ampeg SVT-410HE | https://www.riffsandlicks.com.au/ampeg-classic-svt-410he-500w-8-ohms-4-x-10-horn-lo |
| `amp.cab-2x10` | 330 × 280 × 610 | Ampeg SVT-210AV | https://thomannmusic.no/ampeg_svt210av.htm |
| `amp.keyboard` | 490 × 385 × 470 | Roland KC-400 | https://www.roland.com/global/products/kc-400/specifications/ |
| `amp.acoustic` | 394 × 292 × 343 | Fishman Loudbox Artist | https://www.thomannmusic.com/fishman_loudbox_artist_with_bluetooth.htm |
| `amp.practice` | 470 × 238 × 398 | Boss Katana-50 MkII | https://www.long-mcquade.com/154076/Guitars/Amps/Boss/Katana-50-MkII-Combo-Amplifier.htm |
| `amp.leslie` | 743 × 525 × 1045 | Hammond Leslie 122H | https://www.thomann.co.uk/hammond_leslie_122h.htm |
| `kit.drums-electronic` | 1315 × 1100 × 1200 | Roland TD-17KVX2, assembled | https://www.roland.com/global/products/td-17kvx2/specifications/ |
| `kit.kick` | 559 × 432 × 559 | Yamaha Stage Custom Birch, 22 x 17 in | https://drumcenternh.com/products/yamaha-stage-custom-birch-5pc-drum-set-w-22-bd-natural-wood |
| `kit.snare` | 356 × 356, height stays 800 (estimate) | Yamaha Stage Custom Birch, 14 in | https://drumcenternh.com/products/yamaha-stage-custom-birch-5pc-drum-set-w-22-bd-natural-wood |
| `kit.floor-tom` | 406 × 406, height stays 800 (estimate) | Yamaha Stage Custom Birch, 16 in | https://drumcenternh.com/products/yamaha-stage-custom-birch-5pc-drum-set-w-22-bd-natural-wood |
| `kit.tom` | 305 × 305, height stays 800 (estimate) | Yamaha Stage Custom Birch, 12 in | https://drumcenternh.com/products/yamaha-stage-custom-birch-5pc-drum-set-w-22-bd-natural-wood |
| `kit.throne` | height 665 | Tama HT430, top of the 500 to 665 mm range | https://www.thomann.ae/tama_ht430cvkh_drum_throne.htm |
| `perc.congas` | height 762 | LP Classic II, 30 in | https://www.guitarcenter.com/LP/Classic-II-2-Piece-Conga-Set-with-Bongos-Chrome-Hardware-Natural-1300744184330.gc |
| `desk.digital` | 1053 × 667 × 299 | Yamaha CL5 | https://usa.yamaha.com/products/proaudio/mixers/cl_series/specs.html |
| `desk.monitor` | 917 × 627 × 269 | Allen & Heath Avantis | https://media.musson.com/mti/docs/a/v/avantis-weightsdims.pdf |
| `desk.analog` | 1008 × 670 × 278 | Midas Venice F32 | https://bax-shop.co.uk/analogue-mixing-desk/midas-f-32-analogue-pa-and-studio-mixer |
| `desk.portable` | 444 × 500 × 130 | Yamaha MG16XU | https://www.manualowl.com/m/Yamaha/MG16XU/Manual/406055 |
| `desk.powered` | 465 × 325 × 308 | Yamaha EMX5 | https://thomann.ae/yamaha_emx_5.htm |
| `rack.stagebox` | 483 × 242 × 138 | Midas DL32 | https://cdn.mediavalet.com/aunsw/musictribe/I2S29IMZHUa0yyJi8oqqEQ/oeq7RxOvc0uXAz8JkXayZA/Original/QSG_MI_0606-ACR_DL32_JP.pdf |
| `rack.stagebox-48` | 482 × 255 × 230 | Allen & Heath GX4816, with feet | https://media.musson.com/mti/docs/g/x/gx4816-datasheet.pdf |
| `rack.di` | 127 × 84 × 46 | Radial JDI | https://www.radialeng.com/product/jdi/specifications |
| `rack.wireless-receiver` | 197 × 151 × 41 | Shure QLXD4 | https://pubs.shure.com/view/guide/QLXD/en-US.pdf |
| `rack.iem-tx` | 197 × 166 × 42 | Shure PSM 900 transmitter | https://content-files.shure.com/Pubs/psm900/psm900-datasheet.pdf |
| `rack.bodypack` | 65 × 86 × 23 | Shure QLXD1, lying flat | https://pubs.shure.com/view/guide/QLXD/en-US.pdf |
| `keys.keyboard` | 1393 × 354 × 138 | Roland FANTOM-08 | https://www.roland.com/global/products/fantom-08/specifications/ |
| `keys.synth` | 1072 × 333 × 118 | Roland JUNO-X | https://www.roland.com/global/products/juno-x/specifications/ |
| `keys.stage-piano` | 1412 × 367 × 140 | Roland RD-2000 | https://www.roland.com/global/products/rd-2000/specifications/ |
| `keys.midi` | 836 × 182 × 84 | Roland A-49 | https://www.roland.com/global/products/a-49/specifications/ |
| `keys.piano` | 1490 × 1860 × 1010 | Yamaha C3X | https://ca.yamaha.com/en/musical-instruments/pianos/explore/piano-webar/acoustic/ |
| `keys.baby-grand` | 1460 × 1510 × 990 | Yamaha GB1K | https://sg.yamaha.com/en/products/musical_instruments/pianos/grand_pianos/gb1k/specs.html |
| `keys.upright` | 1530 × 620 × 1210 | Yamaha U1 | https://no.yamaha.com/no/products/musical_instruments/pianos/upright_pianos/u_series/specs.html |
| `keys.rhodes` | 1153 × 563 × 225 | Rhodes Mk 8, 73 keys | https://www.thomann.ae/rhodes_mk_8_73_american_classic.htm |
| `keys.hammond` | 1308 × 711 × 965 | Hammond Portable B-3 MK2, 51.5 x 28 x 38 in | https://musicredone.com/products/hammond-portable-b-3-mk-2-organ |
| `keys.organ` | 1308 × 711 × 965 | Hammond Portable B-3 MK2, 51.5 x 28 x 38 in | https://musicredone.com/products/hammond-portable-b-3-mk-2-organ |
| `furniture.music-stand` | height 1225 | K&M 101, top of the 650 to 1225 mm range | https://www.bassbags.co.uk/product/km-101-music-stand/ |
| `mic.boom-tall` | height 1600 | K&M 210/9, top of the 900 to 1600 mm range | https://www.boullard.ch/en/product/sono-studio/microphones/microphone-accessories/113265-k-m-210-9s-black-double-boom-microphone-stand/ |
| `light.ellipsoidal` | 338 × 579 × 541 | ETC Source Four 26 degrees, with yoke | https://soundpro.com/etc-426-source-four-26-degree-ellipsoidal |
| `light.par` | 265 × 410 × 345 | Eurolite PAR-64 Spot Long, with yoke | https://www.kirstein.de/en/Live-Studio/Light/Headlights/Eurolite-PAR-64-Spot-Long-With-Plug-Black.html |
| `light.par64` | 265 × 410 × 345 | Eurolite PAR-64 Spot Long, with yoke | https://www.kirstein.de/en/Live-Studio/Light/Headlights/Eurolite-PAR-64-Spot-Long-With-Plug-Black.html |
| `light.led-par` | 203 × 240 × 310 | ETC ColorSource PAR | https://www.etcconnect.com/Products/Entertainment-Fixtures/ColorSource-PAR/Tech-Specs.aspx |
| `light.moving-wash` | 302 × 302 × 360 | Martin MAC Aura XB, head upright | https://media.musson.com/mti/docs/m/a/mac-aura-xb.pdf |
| `light.moving-spot` | 343 × 409 × 489 | Chauvet Rogue R2 Spot | https://cdn01.4wall.com/cms/rentals/files/f55fb53297ba40.pdf |
| `light.led-bar` | 1047 × 185 × 166 | Chauvet COLORado Batten Q15 | https://chauvetprofessional.com/wp-content/uploads/pdf/en/COLORADOBATTENQ15.pdf |

Figures converted from inches: `perc.congas` (30 in), the Yamaha shell diameters and the Hammond console, rounded to the millimetre.

### Where sources differ

- `light.ellipsoidal`: the width is 338 mm in the SoundPro listing and 315 mm at Panavision; the height (541 mm) agrees
- `light.par`, `light.par64`: 345 mm high with the yoke (Kirstein); Steinigke gives 270 mm, which matches the can without it
- `light.moving-wash`: 360 mm head upright in the spec sheet; other listings give 390 mm as the maximum height with the head tilted
- `pa.mini-line`: the L-Acoustics K-series page gives a Kiva II module 202 mm high; Novelty lists 175 mm
- `amp.cab-2x12`: the Marshall catalogue table gives 740 × 600 × 305 without saying which is which; only one reading fits a 2×12 cabinet

### Looked up and left as estimates

- `pa.sub-dual`: for the L-Acoustics KS28 the maker's page gives 1340 wide, 550 high and 719 deep (https://l-acoustics.com/products/KS28), while retailers give 719 as the height and 565 as the depth
- `amp.guitar`: the figures for the Fender '65 Twin Reverb conflict, 673 × 267 × 505 in most listings and 750 × 335 × 895 on a bundle page
- `amp.cab-1x12`: the Marshall 1912 row (510 × 465 × 290) came misaligned from the catalogue table, with no second source
- `amp.cab-1x15`: no size found for the Ampeg SVT-15E or the Orange PPC112
- `light.fresnel`: B&H gives the ETC Source Four Fresnel as 277 × 498 × 315 and also as 315 × 277 × 342 with the yoke, so the axes are unclear
- `light.led-mover`: the only figure (Chauvet Intimidator Spot 375Z IRC, 220 × 322 × 466) is from a retailer and could not be checked against Chauvet
- `pa.tripod`: the K&M 21435 lists a 1150 mm base without saying it is the leg span, and its height is given as both 1430 to 2240 and 1320 to 2020 mm
- `mic.boom-tall`, `kit.throne`, `furniture.music-stand`: the height is sourced, but no datasheet gave the leg span, so the footprint stays an estimate
- `perc.cajon`, `perc.djembe`, `monitor.iem`, `rack.stagebox-fibre`: no usable size found
- `furniture.riser`: the Bütec 2 × 1 m deck confirms the footprint already in the library (https://www.musicstore.de/en_DE/EUR/Buetec-Stage-elements-Standard-2x-1m-Indoor/art-LIG0005166-000); the height depends on the legs, so it does not change

### Priority categories not looked up

- Placement roles rather than products: `pa.front-fill`, `pa.lip-fill`, `pa.infill`, `pa.outfill`, `pa.balcony`, `pa.surround`, `pa.wall`, `pa.ceiling`, `pa.horn`
- Monitors: `monitor.sidefill`, `monitor.drumfill`, `monitor.wedge-dual`, `monitor.drum-sub`, `monitor.pole`, `monitor.cube`, `monitor.headphones`
- Amps and desks: `amp.iso-box`, `desk.surface`, `desk.broadcast`, `desk.monitor-ctrl`
- Rack units, where 19-inch items would give the width and rack height but each needs its own product: `rack.di-active`, `rack.di-stereo`, `rack.reamp`, `rack.splitter`, `rack.preamp`, `rack.interface`, `rack.recorder`, `rack.compressor`, `rack.geq`, `rack.fx-unit`, `rack.speaker-proc`, `rack.power-amp`, `rack.harmoniser`, `rack.power-conditioner`, `rack.network`, `rack.dimmer`, `rack.personal-mixer`, `rack.headphone-amp`, `rack.antenna`, `rack.antenna-combiner`, `rack.snake-reel`, `rack.click`, `rack.cue-box`, `rack.timecode`, `rack.stagebox-wireless`
- Keys and synths: `keys.epiano`, `keys.grand-bench`, `keys.harpsichord`, `keys.organ-console`, `keys.celesta`, `keys.clavinet`, `keys.harmonium`, `keys.harmonium-2`, `keys.toy`, `keys.accordion-alone`, `keys.bandoneon`, `synth.modular`, `synth.drum-machine`, `synth.groovebox`, `synth.vocoder`, `synth.theremin`, `synth.desktop`, `synth.sequencer`
- Lights: `light.pc`, `light.scoop`, `light.strip`, `light.cyc`, `light.followspot`, `light.beam`, `light.blinder`, `light.led-profile`, `light.led-fresnel`, `light.led-panel`, `light.led-zoom`, `light.led-screen`, `light.led-par-mini`, `light.uplighter`, `light.work`, `light.pinspot`, `light.uv`, `light.gobo`, `light.ground-row`, `light.tbar`, `light.tree`, `light.matrix`, `light.footlight`, `light.flood-ip`, `light.searchlight`
- Percussion: the 65 drum items outside the tables, including `kit.hihat` and the small and world percussion
### Estimates by nature

No single datasheet can give these, because they are arrangements of several things: whole acoustic kits (`kit.drums5`, `kit.drums-small`, `kit.big`, `kit.cocktail`, `kit.minimal`, `kit.perc-rack`), `kit.rug`, `keys.rig-3`, `dj.booth`, stacks and arrays (`amp.stack-2`, `amp.bass-stack`, `pa.sub-stack`, `pa.cluster`, `pa.delay`, `pa.pole`, `monitor.sidefill-stack`), filled racks (`rack.rack`, `rack.iem`, `rack.wireless`, `rack.amps`, `rack.fx`, `rack.matrix`, `monitor.rack-amp`) and pedalboards. In `pa.line`, `pa.line-ground`, `pa.array-hung` and `pa.array-hang` only the height is an estimate, because it depends on the number of modules.

## Not looked up

People (`vocals.*`, `person.*`) and rooms (`room.*`) keep their sizes on purpose. Still with category estimates, and often a placeholder height: small percussion and world instruments, most microphones, pedals and outboard units, effects, video, control, network, power, rigging, scenery, site and safety items, and the remaining lights and keys.
