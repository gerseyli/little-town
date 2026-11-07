# Little Town — source starter

## Browser preview

Automatic public preview hosting is prepared on **preview/live**. The environment network update is applied and GitHub build/gameplay checks pass. The repository is public and GitHub Pages is enabled. The owner is allowing preview/live in the Pages deployment environment; successful public deployment is still pending. See [deployment status and instructions](docs/PREVIEW_DEPLOYMENT.md). Once activated, future verified pushes update the same browser link. `npm run build:preview` builds the static site while preserving the standalone offline export.

## Enter the pharmacy

Walk near the pharmacy entrance on Garden Street and click **Enter the pharmacy · Space** or press Space. Entry takes priority over nearby pedestrians. Inside, click the supplied neutral chemist to open the pharmacy shop: select symptoms, toggle phrase names, ask for recommendations, add medicines to a basket and check out using your saved balance. See [the pharmacy shop pilot](docs/PHARMACY_SHOP.md). **Back outside** or Escape returns you to the same position, preserving money. Only pharmacy entry is enabled in this pilot. See [interior behaviour and extension notes](docs/INTERIORS.md).

## Map view

The game starts in **Whole map (100%)**. Your chosen zoom percentage is saved and stays the same across Town/Suburbs travel, resizing, Back to start and reloads. Space enters when the entrance prompt is visible, including after using map or walking controls. See [map view and entrance keyboard behaviour](docs/MAP_VIEW.md).

## Player money

The player now starts with **$100**, shown in a generated wallet HUD at the upper left. The balance saves with progress and stays intact during travel and Back to start. Pharmacy checkout now uses the shared spending method and saves the updated balance immediately. Fares and rewards retain their existing behaviour. See [the money model and integration notes](docs/MONEY.md).

## Current development checkpoint

The original three path bugs are fixed. A first implementation of moving traffic, six distinct slower pedestrians per map, and an “Ask for directions · Space” dialogue is available. Directions cover all 34 destinations, existing directed bus services, and train journeys between maps. These additions still need the refinements listed in [the numbered plan](docs/IMPLEMENTATION_PLAN.md); they are not a finished release.

Pedestrians now walk at half their original speed, and all six pedestrians plus the tourist use generated four-direction walking sprite sheets.

Run `npm run check` and `npm test` (includes world/path/routing, traffic and animation regressions). Optional browser QA: `python3 tests/browser.py` and `python3 tests/actors-browser.py`, using installed Python Playwright and `/usr/bin/chromium`; it starts an internal temporary server and saves screenshots under `/tmp`. Build output remains a standalone offline HTML file.

`docs/BASELINE.json` records the **original import**, not this authorized development version. A hash difference is expected after gameplay changes.

This is the editable source of the current Town & Suburbs game. The source was separated into files without changing the game. Its first build matches the already delivered HTML byte for byte. The three reported path bugs remain unchanged; see docs/KNOWN_BUGS.md.

## First-time upload

1. Extract Little-Town-Source-Starter.zip.
2. Create a private GitHub repository called little-town. Initializing it with a README makes the upload controls easy to find.
3. In the repository, choose Add file > Upload files.
4. Open the extracted little-town folder and drag its contents into the upload area. Upload the files and folders inside it, not the ZIP or an extra enclosing folder. package.json and AGENTS.md should appear at the repository's top level.
5. Save/commit the upload with a message such as Import current Little Town source.
6. In ChatGPT/Codex Cloud, create an environment connected to that repository, review its setup, and publish the environment. Publishing this environment prepares the coding workspace; it does not publish the game as a public website.

## Commands

Requires Node.js 18 or newer. There are no external package dependencies to install.

```sh
npm run check
npm test
npm run build
```

Open dist/Little-Town.html to play. It is a single offline file with all image assets embedded. dist/index.html is the same game for supported preview tools.

## Source layout

| Path | Purpose |
| --- | --- |
| src/index.html | Page and overlay markup |
| src/styles.css | Styling |
| src/game.js | Game engine and interaction logic |
| src/shop.js | Reusable basket and atomic paid checkout |
| src/pharmacy.js / src/pharmacy-data.json | Pharmacy consultation, symptoms, recommendations and catalog |
| src/interiors.js | Entrance proximity, interaction priority and pharmacy scene |
| src/money.js | Saved player account and money HUD updates |
| src/motion.js | Eased movement and camera simulation |
| src/actors.js | Directional walking frames and grounded foot anchors |
| src/phrasebook.js | Illustrated glossary |
| src/maps.json | Map geometry, names, routes and stops |
| assets/ | Integrated maps, interface artwork, vehicle sprites and directional walking atlases |
| scripts/build.mjs | Standalone HTML builder |
| tests/smoke.cjs | Baseline game checks |
| docs/ | Project brief, pending bugs and baseline fingerprint |
| AGENTS.md | Instructions for coding agents |

## Validation limits

The existing checks cover general reachability, some collision rules, grammar labels, glossary coverage and transport round trips. They do not prove that every visible connection works. Known issues are deliberately recorded for later focused repairs.

## First Codex task

Read AGENTS.md, README.md, docs/PROJECT_BRIEF.md and docs/KNOWN_BUGS.md. Run npm run check and npm test. Compare dist/Little-Town.html with docs/BASELINE.json. Confirm the project is ready for future work. Do not fix the deferred bugs or change gameplay in this setup task.


## Current movement and paths

The live game uses the existing four-direction walking atlases from `assets/walking/`. The player cruises at 210 map units/second; pedestrians retain their agreed half-speed pace of 57.5–67.5. Acceleration, stopping and camera following are eased. Walk up to a pedestrian and press Space or click **Ask for directions**. The detailed integrated map artwork is unchanged.

The original three path bugs are fixed, with further visible-path connections audited in `docs/WALKING_PATH_AUDIT.md`. `npm test` includes traffic, animation, route, terrain and frame-rate regressions. Optional Chromium QA: `python3 tests/browser.py`, `python3 tests/actors-browser.py`, `python3 tests/motion-browser.py` (Playwright required only for these development checks). The baseline fingerprint is historical and applies only to the initial import.


## Paved widths, path names and short directions

Garden Street and the actual theme-park/harbor gate link now use their painted widths. The path data also supplies the street names and centred labels, including repeated names on long bent roads. The existing label toggle controls these names.

NPC directions follow named paths rather than narrating grid adjustments. They use as few concise items as needed, never padding the list; six is the maximum. Current start/NPC/patrol-end regression journeys take one to five items. Bus/train transfers, safe road crossings and the destination are retained. The approved map artwork, walking atlases and speeds are unchanged. See `docs/IMPLEMENTATION_PLAN.md` for the recovery plan and `docs/WALKING_PATH_AUDIT.md` for verification details.
