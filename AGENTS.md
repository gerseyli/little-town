# Little Town project instructions

## Purpose
An elementary / pre-intermediate ESL directions exploration game. The user describes design and teaching goals in ordinary language. Preserve the colourful semi-realistic raster artwork, full-screen map, small illustrated controls, town buses, two maps, railway travel and pictorial phrase book unless a task explicitly changes them.

## Source of truth
- Read README.md and docs/KNOWN_BUGS.md before making changes.
- Edit files in src/ and assets/. Generated dist/ is not the editable source.
- src/maps.json contains map geometry, labels, stops and route data.
- src/game.js contains the current game engine, UI, movement and transport logic.
- src/phrasebook.js contains glossary data and pictograms.
- src/index.html and src/styles.css contain markup and presentation.
- Future restructuring may split the engine further, but preserve behaviour unless the user requests a gameplay change.

## Pending bugs
The user explicitly deferred fixes to the three issues in docs/KNOWN_BUGS.md. Initial project import/setup must not fix them. A later user request to fix a bug authorizes that work.

## Development and validation
- Node.js 18 or newer; no third-party dependencies needed for the current build.
- npm run check checks JavaScript syntax.
- npm test builds and runs baseline reachability, glossary and transport checks.
- npm run build produces dist/Little-Town.html and dist/index.html.
- For the first import, compare the built file with docs/BASELINE.json. It should match exactly.
- The current tests do not prove every visible path works. For an authorized path fix, add a regression test for that exact connection and inspect alignment with the artwork. Keep terrain, water, buildings and traffic rules meaningful.
- Use supported browser-preview tools when available. If browser QA is unavailable, report that limitation.
- Keep each task focused, summarize changed behaviour and verification, and save a recoverable Git commit when authorized by the task/workflow.

## Delivery
Keep a fully offline standalone HTML export with all image assets embedded. The game currently needs no server or external API. Do not introduce hosting, accounts, payments, licensing or extra dependencies unless a task needs them. Do not publish the source publicly without the user's instruction.


## Permanent browser preview

The user authorized a public browser preview. `preview/live` is the canonical source for future preview work; fetch/inspect it before starting from the historical main branch. Preserve main and repository visibility. Read `docs/PREVIEW_DEPLOYMENT.md` for activation status and hosting prerequisites.

Once Pages is activated, pushes to `preview/live` automatically test/build/deploy the generated site. Advance that branch only with verified changes, then confirm Actions/deployed version before giving the stable URL. Prefer the stable browser preview for delivery; create ZIPs only when requested. Keep `npm run build` producing the offline export. `npm run test:preview` verifies the web artifact, and `python3 tests/preview-browser.py` tests its launcher, assets and saved state across updates. Do not publish editor sources, archives or credentials as the site artifact.
