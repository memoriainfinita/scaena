# Group 2: a plan that reads

Approved by the user on 2026-11-11, from the audit of 2026-11-09 (cables crossing elements and texts, texts covered by cables and bars, the editor and the PDF drawn by two functions that diverged).

## One scene, two renderers

`src/plan/scene.ts` (pure, no DOM) decides what the plan draws and where: the elements on the layers drawn, bottom layer first; the mounts (only when the lights layer is drawn); the cables with their path; and the place of every text. The editor (`PlanView.tsx`) and the PDF (`plan-svg.ts`) turn the scene into markup, each with its own units and its own interactivity, and nothing else is decided twice. `src/plan/style.ts` holds the looks they share (cable colours and dashes, which mounts are shown). Before the change the PDF output of the examples was captured; after the refactor it was byte for byte the same.

Texts keep their sizes per renderer (fixed in plan millimetres on screen, a size in paper millimetres divided by the print scale on paper), as in `plot-labels-2026-11-08.md`; that is the only thing the two still do differently on purpose.

## Cables around the elements

`src/plan/routes.ts`: A* over a grid of square cells (100 mm or more, from the size of the plan). Elements are blocked with one cell of clearance, a turn costs 4 steps, and a cell another cable already uses costs 1.5 more, so cables that share a corridor drift into neighbouring lanes. The element a cable leaves from, the one it arrives at, and any element that contains one of them (a riser) do not block it. The path is right-angled, starts and ends at the edge of its elements, and is the same whatever the order of the input. A cable that finds no path within its budget stays a straight line between the centres. Routes are derived data, not stored; they are recomputed when a change is committed, as the labels are, and the cables of a dragged element stay hidden while it moves.

`view.linkStyle` is `routed` (default) or `straight`, saved in the file, with a "Straight cables" button next to "Connection lines". Files saved before this open routed; their cables change shape, nothing else.

## Texts keep clear of cables and bars

Cable paths and mounts are solids for the label placement: thin boxes along each segment, with a small weight (`LINE_WEIGHT`). A slot is judged first by what it covers of elements and texts, and only then by how many lines it crosses, so a text never trades covering an element for crossing a cable. A cable's own connector text and a mount's own name may touch their line. Connector texts follow the path of their cable, and get 9 rings of slots instead of 6. In the PDF every text has a white edge, so a line behind it does not strike it through.

## Also fixed

- The magic sheet counts the names of its mounts and the colours as part of its size, so "Calle izquierda" is no longer cut, and gives them a white edge.
- Mounts and their names are drawn by the PDF only when the lights layer is drawn, as the editor already did.
- The full example's dressing room, control booth and loading dock stand in the side rooms of its venue plan, not on its seats; the seats block is gone because the venue plan draws the house.

## Measured

Cable segments that cross an element that is neither end nor a thing the cable starts on, on the screen layout (`scene.test.ts`, straight / routed): rock 106 / 0, jazz 56 / 0, singer 8 / 0, DJ 19 / 0, conference 63 / 0, theatre 81 / 0, AV 12 / 0. The full example draws no cables on the plan by design. The tests of non-collision between texts and elements, on screen and on paper, still hold for every example. Editor with 1000 elements (`scripts/perf.mjs`, Firefox): zoom 37 fps, drag 28 fps, inside the range of `docs/research/rendimiento-app-2026-11-05.md`.

## Not done

- Cables drawn by hand, or moved by the user: routes are always automatic.
- Cables that share a corridor run in neighbouring lanes, not as one bundle; on a busy plan (rock, 29 cables) the perimeter of the stage fills with parallel lines.
- A wireless link is still a cable in the model (group 3).
- The front-of-house equipment of the full example still stands among the seats of its venue plan, as a position among seats does.
