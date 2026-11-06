# Little Town — implementation plan

Last updated: 2026-11-06. User-authorized scope; update this file after each milestone so work can resume after a chat interruption.

1. **Done — Fix known path bugs.** LT-001 (hotel–cinema), LT-002 (harbor–theme park), and LT-003 (bay-edge path) have corrected geometry. Exact-connection tests pass in both directions, including the curved bay path. Chromium screenshots were inspected against the artwork; water/building/crossing regressions and original smoke checks pass. See `KNOWN_BUGS.md`.
2. **Prototype implemented; next task — Moving road traffic.** Six separate generated vehicle assets exist: car, truck, bus, taxi, ambulance and police car. Lane movement, red-light stops, queues and pedestrian clearance are implemented and tested on both maps. A road overlay currently covers the original painted moving cars; parked mall cars and scenery are preserved. **Remaining:** review artwork and road finish with the user; decide whether to edit original map raster roads instead of keeping the overlay; stress-test phase changes, wrapping and queue tails; tighten safety at the unsignalized Coast Road gap (an approaching player can still step into its road segment while a vehicle is already traversing it). Do this before calling traffic release-ready.
3. **Prototype implemented; pending review — Distinct walking pedestrians.** Six different separately generated WebP assets, six pedestrians on each map, valid-path patrols, catchable speeds (115–135 versus player 180), no player collision, proximity pause and conversation pause are implemented. Extended movement and collision tests pass. **Remaining:** review appearance/scale and visible walking motion with the user; consider broader patrol routes including crossings (current patrols stay on their named paths); verify longer play sessions and saved-position approaches.
4. **Prototype implemented; pending refinement — Ask-for-directions interaction.** A prompt above nearby figures offers “Ask for directions · Space”; Space or clicking opens a dialogue with “Excuse me, how can I get to …?” and all town/suburb destinations. Transport offers have priority. Native dialogue keyboard controls and Escape work; Chromium tested both maps. **Remaining:** review prompt positioning at zoom/viewport edges, mobile/touch layout and keyboard focus; polish classroom wording and dialogue styling with the user.
5. **Prototype implemented; pending refinement — Phrasebook-based route directions.** A weighted walkable-grid planner uses current location and the same collision rules, directed bus next stops, and train stations. Safe cross-map routes to all 34 destinations and a useful bus-6 suggestion pass tests. **Remaining:** simplify grid-alignment instructions (some small redundant turns/“go straight on” steps remain); improve junction/end-of-segment landmarks so learners know exactly where to turn; manually follow representative directions including buses, crossings, curved promenades and both maps. Confirm route quality before release. Requirement: sensible efficient routes, useful bus suggestions and train travel for cross-map destinations; the user withdrew the earlier 50%-shortest-route idea.
6. **Checkpoint validated; final delivery pending — Validation and delivery.** `npm run check`, `npm test` (original smoke plus focused world checks), and `python3 tests/browser.py` passed. Browser screenshots show maps and a working destination dialogue; no runtime page errors. The offline HTML includes all assets. Final release QA must follow the remaining refinements above; this checkpoint is not a finished release. Save focused commits for later tasks. Do not publish the source publicly.

## Resume notes

- Existing checkout: `/workspace/little-town`; Node.js >=18; no external package dependencies.
- Read `AGENTS.md`, `README.md`, `docs/PROJECT_BRIEF.md`, `docs/KNOWN_BUGS.md` and this plan.
- Commands: `npm run check`, `npm test`, `npm run build`.
- Source: `src/`, `assets/`; `dist/` is generated and untracked. Do not edit or commit generated exports.
- Imported baseline commit: `d3acb447be076dd6900f5c850387e21fa8e8f408`. Original checks passed and exported SHA-256 matched `docs/BASELINE.json` before this work. Authorized gameplay changes will intentionally differ from that baseline.
- Separate asset generation is part of this plan; keep final artwork consistent with the existing colourful raster style.

## Handoff — stop here, per user request

- The user requested a stop after the current validation checkpoint and will open a new chat. **Do not automatically start the next numbered task.** Read this plan and let the user choose the next focused task.
- Checkpoint branch: `little-town/living-world-checkpoint` (remote persistence will be reported separately; do not assume a local commit has been pushed).
- Initial numbered-plan commit: `1b26476`.
- New runtime modules: `src/navigation.js` (grid routing and language) and `src/world-life.js` (traffic, NPCs and dialogue). Builder embeds them and all actor assets; no external runtime dependencies.
- New tests: `tests/world.cjs` and optional `tests/browser.py`. Browser QA uses a temporary internal HTTP server because this environment's Chromium policy blocks `file://` URLs; the game itself remains standalone/offline.
- Generated source sheets are retained outside the checkout at `/workspace/scratch/little-town-sprite-sources`; individual game-ready assets are tracked in `assets/vehicles/` and `assets/pedestrians/`. Raw tool-generated images also remain under `/workspace/generated_images/`.
- `dist/` is a disposable generated output. `docs/BASELINE.json` intentionally remains the fingerprint of the original import and must not be used as a pass/fail check for the changed game.


## Combined artwork and gameplay preview — 2026-11-06

The user requested all latest gameplay additions with the new integrated artwork. Merged the complete `little-town/living-world-checkpoint` (`7e38b66`) with the in-place map-detail artwork (`e9ffb6d`). The two updated map images are unchanged. All gameplay source, actor assets, builder configuration and path fixes are taken from the checkpoint. Browser QA now additionally asserts actual vehicle and pedestrian movement on both maps, then exercises the proximity prompt, Space/click dialogue entry and cross-map destination answers. The earlier handoff pause was superseded by this integration request; unrelated prototype refinements listed above remain pending.
