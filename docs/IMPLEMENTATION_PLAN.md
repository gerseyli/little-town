# Little Town — implementation plan

Last updated: 2026-11-06. User-authorized scope; update this file after each milestone so work can resume after a chat interruption.

1. **Done — Fix known path bugs.** LT-001 (hotel–cinema), LT-002 (harbor–theme park), and LT-003 (bay-edge path) have corrected geometry. Exact-connection tests pass in both directions, including the curved bay path. Chromium screenshots were inspected against the artwork; water/building/crossing regressions and original smoke checks pass. See `KNOWN_BUGS.md`.
2. **Traffic safety implemented and validated; artwork review pending — Moving road traffic.** Six separate vehicle assets (car, truck, bus, taxi, ambulance and police car) move in both directions on both maps. Vehicles stop for walking phases, retain queue spacing and let walkers finish crossing after phase changes. At the unsignalized Coast Road gap, approaching walkers request a yield and cannot enter until vehicles already passing have cleared; queued cars restart once the walker leaves. Clearance uses the full gap width. Vehicles wrap only after reaching their exit edge, wait off-map if the entry is blocked, and initialize off-map when a saved walker resumes in the road. `tests/traffic.cjs` covers ten-vehicle queues in both directions, variable-frame signal transitions, 123 wraps across both maps, saved-position safety, and Coast Road entry/yield/clearance/restart from both sides and directions. Chromium also verifies actual blocked-then-admitted movement at Coast Road, with no runtime page errors. **Artwork choice for this milestone:** retain the existing reversible road overlay, keeping original rasters and mall parking untouched. Screenshots inspected for lane/queue alignment; user review of vehicle appearance and road finish remains before calling the traffic artwork final.
3. **Directional walking implemented and validated — Distinct walking pedestrians and tourist.** All six pedestrians now move at exactly half their original speed (57.5–67.5 versus tourist 180). Seven generated 4×4 transparent walking atlases preserve the existing six character designs and the tourist's orange jacket, hat and backpack. Each has four gait frames for front/south, left/west, right/east and back/north views. Actual distance traveled advances gait; blocking, nearby-person pauses, conversations and open dialogs rest the sprite in its last facing direction. Measured foot margins keep frames grounded, replacing the old whole-body bob. Source references remain intact; the standalone build embeds all atlases. Unit regressions cover half-speed displacement, all direction/frame selections, idle/block/conversation behavior and four-way patrol turns. Chromium verifies all seven atlases decode offline, tourist direction/frame changes and pedestrian animation, with no runtime errors. **Remaining for later tasks:** user review of visual appearance and gait; broader patrols including crossings (current patrols remain on existing named paths); longer classroom play sessions.
4. **Prototype implemented; pending refinement — Ask-for-directions interaction.** A prompt above nearby figures offers “Ask for directions · Space”; Space or clicking opens a dialogue with “Excuse me, how can I get to …?” and all town/suburb destinations. Transport offers have priority. Native dialogue keyboard controls and Escape work; Chromium tested both maps. **Remaining:** review prompt positioning at zoom/viewport edges, mobile/touch layout and keyboard focus; polish classroom wording and dialogue styling with the user.
5. **Prototype implemented; pending refinement — Phrasebook-based route directions.** A weighted walkable-grid planner uses current location and the same collision rules, directed bus next stops, and train stations. Safe cross-map routes to all 34 destinations and a useful bus-6 suggestion pass tests. **Remaining:** simplify grid-alignment instructions (some small redundant turns/“go straight on” steps remain); improve junction/end-of-segment landmarks so learners know exactly where to turn; manually follow representative directions including buses, crossings, curved promenades and both maps. Confirm route quality before release. Requirement: sensible efficient routes, useful bus suggestions and train travel for cross-map destinations; the user withdrew the earlier 50%-shortest-route idea.
6. **Checkpoint validated; final delivery pending — Validation and delivery.** `npm run check`, `npm test` (original smoke plus focused world checks), and `python3 tests/browser.py` passed. Traffic safety follow-up passes its stress suite and Chromium movement checks. Directional walking follow-up passes `tests/actors.cjs` and `python3 tests/actors-browser.py` alongside the existing checks. Browser screenshots show maps and a working destination dialogue; no runtime page errors. The offline HTML includes all assets. Final release QA must follow the remaining refinements above; this checkpoint is not a finished release. Save focused commits for later tasks. Do not publish the source publicly.

## Resume notes

- Existing checkout: `/workspace/little-town`; Node.js >=18; no external package dependencies.
- Read `AGENTS.md`, `README.md`, `docs/PROJECT_BRIEF.md`, `docs/KNOWN_BUGS.md` and this plan.
- Commands: `npm run check`, `npm test`, `npm run build`.
- Source: `src/`, `assets/`; `dist/` is generated and untracked. Do not edit or commit generated exports.
- Imported baseline commit: `d3acb447be076dd6900f5c850387e21fa8e8f408`. Original checks passed and exported SHA-256 matched `docs/BASELINE.json` before this work. Authorized gameplay changes will intentionally differ from that baseline.
- Separate asset generation is part of this plan; keep final artwork consistent with the existing colourful raster style.

## Handoff — current focused task

- After traffic safety, the user selected slower pedestrians and generated four-direction walking for all six pedestrians and the tourist (item 3). This focused implementation is complete; do not automatically start the other numbered tasks. Visual review remains a user decision.
- Starting checkpoint: remote branch `little-town/living-world-checkpoint`, commit `7e38b66`. Traffic follow-up commit: `c4757c5` on `little-town/traffic-safety`. The directional-walking follow-up is a separate local commit; do not assume it has been pushed.
- Initial numbered-plan commit: `1b26476`.
- New runtime modules: `src/actors.js` (directional sprite frames and distance-based gait), `src/navigation.js` (grid routing and language) and `src/world-life.js` (traffic, NPCs and dialogue). Builder embeds them and all actor assets; no external runtime dependencies.
- New tests: `tests/world.cjs` and optional `tests/browser.py`. Browser QA uses a temporary internal HTTP server because this environment's Chromium policy blocks `file://` URLs; the game itself remains standalone/offline.
- Generated source sheets are retained outside the checkout at `/workspace/scratch/little-town-sprite-sources`; individual game-ready assets are tracked in `assets/vehicles/`, `assets/pedestrians/` and `assets/walking/`. Walking-atlas PNG sources are retained in `/workspace/generated_images`; all final lossless WebP atlases and foot-anchor metadata are tracked. Raw tool-generated images also remain under `/workspace/generated_images/`.
- `dist/` is a disposable generated output. `docs/BASELINE.json` intentionally remains the fingerprint of the original import and must not be used as a pass/fail check for the changed game.


## Combined artwork and gameplay preview — 2026-11-06

The user requested all latest gameplay additions with the new integrated artwork. Merged the complete `little-town/living-world-checkpoint` (`7e38b66`) with the in-place map-detail artwork (`e9ffb6d`). The two updated map images are unchanged. All gameplay source, actor assets, builder configuration and path fixes are taken from the checkpoint. Browser QA now additionally asserts actual vehicle and pedestrian movement on both maps, then exercises the proximity prompt, Space/click dialogue entry and cross-map destination answers. The earlier handoff pause was superseded by this integration request; unrelated prototype refinements listed above remain pending.

## Smooth walking and visible-path audit — 2026-11-06

The user explicitly requested animation, smoother movement and fixes for all visible walking paths. Integrated `little-town/traffic-safety` at `6bc1a83`, including its existing seven directional atlases, measured foot anchors, half-speed pedestrians and Coast Road/queue safety fixes. Atlas binaries are reused unchanged; no newly generated replacement is used. Player cruising speed is 210 world units/s; pedestrian cruising speeds retain the agreed 57.5–67.5 world units/s.

`src/motion.js` adds short acceleration/braking ramps, responsive tap nudges, bounded small simulation steps and frame-rate-independent travel. The camera follows with an eased dead zone, settles after stopping and respects manual panning. NPCs and cars ease into motion. Gait remains tied to actual distance: blocked, resting and talking actors stop stepping. Existing traffic-safety limits remain hard constraints.

The visible-path audit adds the western field lane, inner lake promenade and its entrance, four house driveways, farm/venue entrance aprons; realigns riverbank paths and hill/mountain turns; extends the meadow path to its visible end; and separates West Lane at the carriageway rather than enabling an unmarked road crossing. The three previously reported connectors remain fixed. See `WALKING_PATH_AUDIT.md`.

Validation: syntax checks; smoke, world, traffic, actor and motion/path suites; 20,880 path-centre samples plus independent map-traced connector checks and water/building exclusions. Browser suites cover all atlas directions/frames and rest poses, animated traffic and pedestrians, directions dialogues, actual keyboard acceleration/stopping, camera continuity and collision-frozen gait. Remaining unrelated route-language/UI refinements from earlier plan items are not part of this change. The updated map images and imported atlas binaries are unchanged.

## Active task — paved widths, labels and concise directions (2026-11-06)

User request: preserve the approved artwork, animation, speeds and gameplay; fix Garden Street and the short theme-park/harbor approach; make the **whole visible paved width** walkable rather than only a top/bottom strip; name every path and centre its label on the paving; keep route instructions **as short as possible, never more than six items**, keeping them concise and useful.

Working branch: `preview/path-widths-concise-directions-20261106`. Starting version: `45ff4e6` (animated walking preview). No other chat's pending work should be discarded.

- [x] Reproduce the two reported obstructions using actual map pixel coordinates and keyboard travel, not only the old navigation centre lines.
- [x] Trace paved centres/edges on both map images; repair geometry and usable widths at joins, bends, bridge approaches, entrance aprons and promenades. Keep water, buildings, parked cars, railway and unsafe road entry blocked.
- [x] Ensure every registered path has a stable name and a centred map label. Derive placement from actual path geometry; avoid the current incomplete, offset hand-maintained street-label lists. Preserve the place-label toggle and legibility.
- [x] Replace grid-step narration with a concise route summary. Prefer understandable routes, suppress grid-alignment zigzags, combine continuous street travel, retain necessary turns/crossings/bus/train instructions and arrival. Do not merely truncate a long route or hide it in huge bullets. Use as few items as needed; never pad to five. Hard maximum six.
- [x] Add independent full-width corridor/edge and keyboard regressions for Garden Street and the real harbor approach, plus both-map route and label checks. Manually inspect overlays/labels and follow representative directions. Run syntax, gameplay, traffic, animation and browser suites.
- [x] Update this section after each verified milestone; commit and push checkpoints to the branch above. Package an updated standalone ZIP under `preview/`, verify it against the build and push it for the user's established GitHub **Download raw file** workflow. Leave `main` unchanged.

Resume instructions: read this section, `AGENTS.md`, `docs/KNOWN_BUGS.md`, `docs/WALKING_PATH_AUDIT.md` and current Git status/history. Work in the existing checkout, without a new worktree. Previously passing centre-line tests do **not** prove that the painted paving width is usable; the new user report takes precedence over the earlier audit's completeness claim. Update known-bug status honestly. Do not regenerate artwork or walking sprites. Existing seven atlases are in `assets/walking/`; motion and animation modules are `src/motion.js` and `src/actors.js`. `dist/` is generated. Existing tests are `npm run check`, `npm test`, and the Playwright Python suites in `tests/`.

Resume checkpoint (2026-11-07): environment access is restored and the in-progress edits survived. Prepared, not yet fully validated: native-pixel calibration for Garden Street (centre y=1020), the actual gate connector (Suburbs x=1929.6875), wider paving, per-path IDs, geometry-derived centred labels in `src/paths.js`, and a continuous-path direction summarizer. Direction length cap still needs completion and regression tests; the experimental turn-aware route planner needs performance and route-quality checks. Do not treat the earlier six-item cap as implemented yet.


Verified checkpoint (2026-11-07): 415 independent native-image paving-width probes pass. Chromium keyboard input traverses Garden Street at five separate painted rows and the real harbor link at five separate columns. Wrong connector at x=2134.375/y=1245 remains blocked as landscaping; the correct link is x=1929.6875. All paths now have stable IDs/names and geometry-centred labels, with repeated labels on long bent streets. Direction groups follow streets rather than grid alignment, and a turn-aware route search avoids unnecessary zigzags. Complete instructions are packed with maximum 160 characters/28 words per item; transport and crossing information is retained. 1,258 start/NPC/patrol-end journeys passed the six-item maximum and destination/safety checks; most required one to three items. Final full-suite run, visual QA, documentation cleanup and downloadable ZIP remain to finish. No artwork or walking-atlas changes.


Final verification milestone (2026-11-07): all syntax and Node suites passed, including traffic queues/yielding, all seven walking atlases, smooth motion and routing. Paving tests now cover 3,784 independent native-image samples over the reported paths and 42 corridor rectangles. All 1,258 route cases pass with one to five items, within the six-item ceiling. Browser suites passed for actual full-width keyboard travel, every path's centred labels and toggle, concise NPC dialogue, traffic, walking frames and camera motion. Visual checks confirmed Garden Street's label on the paving and the gate connector's correct location. Updated artwork and walking atlases are unchanged. Packaging and the final push are the only remaining delivery steps.


## Current task complete — 2026-11-07

All items in the active paved-width/labels/concise-directions task above are complete and verified. The earlier recovery notes describe intermediate states, not unfinished requirements. Final changes preserve the approved artwork and walking/traffic modules. The updated offline preview is `preview/Little-Town-Paths-and-Short-Directions.zip`; its contents were checked byte for byte against the build. Current branch remains `preview/path-widths-concise-directions-20261106`; `main` is unchanged. Completed implementation checkpoints were pushed during work; this final delivery commit contains the results and package. No new user feature is implicitly queued after this task.

## Active task — money counter (2026-11-07)

User request: introduce a reusable player money balance starting at **$100**, visible in the HUD with a newly generated wallet icon and a matching illustrated number panel. Future game events will add or subtract money. Preserve all approved art, paths, directions, traffic, animation and current transport behaviour.

Working branch: `preview/money-counter-20261107`, based on verified `8d5224f`.

- [x] Generate separate transparent wallet and blank number-panel assets in the existing warm illustrated game style; record prompts and embed assets in the offline build.
- [x] Add a shared money model with safe credit/debit operations, $100 default, readable dollar formatting and save/load migration for older saves. Back to start and map travel keep the balance.
- [x] Add accessible, responsive HUD placement without overlapping map controls or the map badge; respect the existing HUD visibility shortcut.
- [x] Verify default/old/malformed saves, earnings/spending, insufficient funds, reload, map travel and reset; check desktop and small-screen layout in Chromium and run existing checks.
- [x] Update this plan with results, commit/push recovery checkpoints, and package a verified standalone GitHub preview ZIP. Leave main unchanged.

Scope: no new fares, purchases, reward triggers, debug buttons or economy balancing in this first introduction. Shared transaction API is for subsequent game events. Balance persists using the existing local game save and remains usable in memory if browser storage is unavailable.

Money implementation checkpoint: separate generated high-definition PNGs and generation prompts are in `assets/ui/`; builder embeds both. `src/money.js` provides integer-cent storage, `playerMoney.credit(dollars)`, `debit(dollars)` and `canAfford(dollars)`. Credits/spending update the HUD and save immediately; insufficient funds leave the balance unchanged. Existing saves without a valid `moneyCents` field default to $100. Unit checks pass; full suites and responsive browser validation are running. No map/actor/traffic/navigation source or existing artwork was modified.


### Money counter complete — 2026-11-07

Implemented the $100 player account, safe atomic credit/debit methods, saved integer cents and migration of older/invalid saves. Both generated transparent high-definition assets and their prompts are tracked in `assets/ui/`; live HTML text displays the balance. Final rendering uses ordinary image elements because Chromium rejected the large panel data URL as a CSS custom property. Desktop/mobile visual review confirms the panel is visible and readable. HUD hides with H and avoids both badge and relocated controls.

Validation passed: `npm run check`, full `npm test` (including money, traffic, walking, 3,784 independent paving samples and 1,258 concise routes), `python3 tests/browser.py`, and `python3 tests/money-browser.py`. Money browser tests cover reload persistence, old and malformed saves, zero, insufficient funds, train travel, Back to start, denied browser storage and HUD geometry at widths 1920/701/700/375/320. No browser errors. Existing maps, paths, navigation, walking atlases, actor/motion and traffic modules are unchanged from `8d5224f`.

Integration API and limits: `docs/MONEY.md`. New game events should call `playerMoney.credit(dollars)` or check `playerMoney.debit(dollars)` before granting a purchase. No fares, shops or reward triggers are introduced yet. Preview delivery: `preview/Little-Town-Money-Counter.zip`, containing the current standalone HTML verified byte for byte against the build. Branch: `preview/money-counter-20261107`; `main` remains unchanged. This task is complete; await the user's next mechanic request.

## Active task — entering places / pharmacy pilot (2026-11-07)

User request: reusable loose-proximity entrance prompt in the directions-prompt style, naming the place and offering Space. Entry takes precedence over nearby pedestrian directions. Pilot only the pharmacy: full-screen supplied interior, supplied neutral chemist behind the counter, speech bubble “Hello, how can I help you today?”, clickable chemist. Her later interaction is deliberately unspecified. Preserve money, exterior art, movement, traffic and directions.

Branch: `preview/pharmacy-entry-20261107`, based on `2640762`.

- [x] Locate/import the supplied original pharmacy background and three chemist expressions. Images are visible in chat but no downloadable attachment paths/IDs are exposed yet; requested ZIP or repository originals. Do not regenerate or approximate supplied art.
- [x] Implement reusable entrance configuration/proximity and prompt; enable only pharmacy in this pilot. Entrance beats pedestrian prompt and Space/click interaction, with revalidation to prevent stale-target bugs.
- [x] Implement accessible full-screen interior, responsive art placement, neutral chemist behind countertop, greeting speech bubble, clickable/keyboard-accessible chemist and an extension event for future interaction. Do not invent shops, dialogue branches, purchases or expression changes.
- [x] Provide Back outside/Escape, preserving exact outdoor position, facing and money; stop held movement on entry/exit, prevent exterior actions and repeated Space from opening other UI indoors.
- [x] Verify proximity edges, simultaneous entrance/pedestrian priority, entry/exit/cancel/re-entry, held keys, focus/keyboard, art layering, responsive layout and existing gameplay/money suites.
- [x] Save verified recovery checkpoints and final plan on GitHub; package a verified standalone preview ZIP when supplied original assets are available. Main stays unchanged.

Asset composition reference: background 1672×941; neutral chemist is first portrait, then displeased and smiling portraits. Use neutral only now; retain others for later requests. Place the chemist in the central recess and clip her below the front countertop's rear edge (about 66.8% of background height). Use a styled HTML speech bubble so greeting stays crisp and accessible.

Pharmacy asset checkpoint: Downloads.rar arrived and was extracted using the installed libarchive library. Four pharmacy originals are now copied unchanged to `assets/interiors/pharmacy/`; the additional bank lobby is retained for later in `assets/interiors/bank/`. SHA-256 mapping is recorded in `assets/interiors/source-manifest.json`. Actual portrait size is 1129×1393. Background and neutral chemist will be embedded for this pilot; other expressions and bank are not activated. Earlier attachment-blocker notes are superseded.

Pharmacy implementation checkpoint: new `src/interiors.js` is embedded by the builder. Pharmacy-only proximity prompt uses its real entrance approach and a forgiving 42-world-unit margin, constrained to walkable paving. Both displayed prompts and Space/click handlers enforce entrance priority over pedestrian directions, including stale targets. Modal interior shows the supplied neutral portrait clipped behind the counter and accessible HTML greeting. Chemist click/Space/Enter emits `little-town:chemist-interact` without inventing further gameplay. Back outside/Escape/native close preserve position/facing and money, clear movement and restore camera focus. Focus cycles within the scene. A queued-close guard protects rapid re-entry. Full Node and existing browser/money suites passed; final rapid re-entry and updated portrait/landscape visual QA remain to confirm before delivery.


### Pharmacy entry pilot complete — 2026-11-07

All pharmacy-pilot checklist items are complete. The attachment-transfer blocker above was resolved by Downloads.rar. Originals are preserved byte for byte with hash regressions. The neutral chemist stands behind the countertop, with the specified greeting. She is mouse/touch/keyboard clickable; her extension event is ready for the next request, with no invented purchases, dialogue branches or expression changes. Only pharmacy entry is enabled. Other portraits and the archive's extra bank lobby are retained for later.

Verification passed: syntax checks, full `npm test`, final `tests/interiors.cjs`, `python3 tests/interiors-browser.py`, `python3 tests/money-browser.py` and `python3 tests/browser.py`. Covered proximity/priority, stale targets, repeat/held keys, modal focus, native close/Escape/exit/reset, same-turn rapid re-entry, correct greeting/neutral image, unchanged money/position/facing, real image decoding, original file hashes and outdoor traffic/directions/money. Visual review at desktop, portrait and landscape sizes confirms countertop occlusion, a readable speech bubble and visible exit/money controls. No browser errors. Existing map art, path geometry, navigation, walking atlases and motion/actor modules are unchanged from `2640762`.

Integration notes: `docs/INTERIORS.md`; future interaction hook: `little-town:chemist-interact`. Deliverable: `preview/Little-Town-Pharmacy-Entry.zip`, a verified byte-identical standalone HTML build. Branch `preview/pharmacy-entry-20261107`; recovery checkpoints are pushed, main unchanged. Next work requires the user's description of what happens when the chemist is clicked.

## Symptom artwork received — 2026-11-07

The user uploaded **Pharmacy symptom clip-art sprite sheet.rar** without additional interaction instructions. Source preparation is complete on `assets/pharmacy-symptoms-20261107`, based on the completed pharmacy pilot `9ae4008`.

- [x] Extract and inspect the archive. It contains one transparent 1448×1086 PNG, with twelve illustrations in a 4×3 grid.
- [x] Preserve original bytes in `assets/interiors/pharmacy/symptoms/atlas.png`; record source archive/filename/SHA-256 in `assets/interiors/source-manifest.json`.
- [x] Record 362×362 cell coordinates and descriptive working labels in `symptoms/atlas.json` and `symptoms/README.md`. Verify bounds, unique IDs, transparency and unchanged bytes. All six supplied original image hashes pass.
- [x] Save this source checkpoint on GitHub. The existing playable preview and runtime remain unchanged; no new game ZIP is needed for a source-only asset receipt.
- [x] The user subsequently supplied the detailed consultation/shop interaction below; this former waiting item is resolved.

Resume from this branch so the new atlas is available. The extension point remains `little-town:chemist-interact` in `src/interiors.js`; behaviour and current export are described in `docs/INTERIORS.md`. The latest playable ZIP remains `preview/Little-Town-Pharmacy-Entry.zip`. No further gameplay has been requested by the upload alone.

## Active task — pharmacy consultation and shop pilot (2026-11-07)

User request: click the chemist to open a close-up interaction, with a larger chemist on the left and a generated HD pharmacy-style panel on the right. Scrollable symptom pictures, “I think I have …”, names on/off, multiple togglable selections highlighted green. Generated “What would you recommend?” button advances to the chemist's concise recommendations and medicine cards with names/prices. Clicking cards adds products to a separate generated basket panel, with removal, total and checkout deducted from existing money.

Branch: `preview/pharmacy-shop-20261107`, based on `996830c` (includes original symptom atlas). User's detailed request now authorizes the interaction previously left pending.

- [x] Generate matching HD blank consultation frame, basket frame and action-button artwork; retain generation prompts and embed in the offline export. Reuse all supplied portraits, room and symptom art unchanged.
- [x] Implement reusable order/cart accounting in integer cents, generic symptom-relief products and simple fictional prices; one of each product in this pilot, deduplicate shared recommendations. No dosage, diagnosis engine or health effects.
- [x] Build close-up symptom selection with independent scrolling, names toggle, accessible multi-select green frames, exact phrase labels including food poisoning, and disabled empty recommendation action.
- [x] Show chemist recommendations and priced product cards, editable basket, live total/balance, atomic insufficient-funds-safe checkout and a receipt. Prevent repeated charges and hidden/stale product actions.
- [x] Preserve entrance priority and outdoor state, exit/escape/focus/keyboard behavior, existing money save, maps/traffic/paths/directions and standalone offline build. Back to consultation and changing symptoms should remain usable.
- [x] Verify all symptom/product mappings, selection/unselection/toggle, deduplication, removal/totals, successful/failed/repeated checkout, balance persistence, entry/exit and desktop/small-screen scrolling/focus/layout in Chromium. Run relevant existing suites.
- [x] Update recovery notes, push checkpoints and deliver a verified GitHub preview ZIP; leave main unchanged.

Pilot choices: use generic recognizable products for symptom relief, no dosing or claims of cure. Food poisoning maps to oral rehydration salts; shared pain/fever recommendations map to one paracetamol product. Basket contents and receipt are per visit, with completed spending saved through the existing player account. No medicine-use or inventory system is implied by this pilot.

Shop implementation checkpoint: new `src/shop.js` supplies integer-cent basket/payment logic, with unique products, snapshot items, insufficient-funds preservation and repeat/reentrant checkout protection. `src/pharmacy-data.json` maps all twelve original pictures to full-sentence labels and nine generic products ($4–$8). `src/pharmacy.js` and `src/pharmacy.css` implement close-up selection, names toggle, recommendations, editable basket, receipt and fresh orders. Generated HD UI frames/button are embedded as lossless WebP; all supplied art remains unchanged. Unit/accounting and initial Chromium flow checks pass, including a $15 purchase saving $85 from $100 and failed payment preserving the basket. Responsive overflow was found at 1024px and corrected with explicit basket sizing; final cross-size and existing gameplay suites are running.

Final shop validation milestone: syntax and full Node suites pass, including all twelve symptom mappings, shared products, integer-cent payments, failed/repeated/reentrant checkout, unchanged supplied-image hashes and all earlier gameplay regressions. Chromium consultation suite passes at 1920/1440/1024/375/812/320 widths, including $100 → $85 paid checkout/reload, insufficient funds, green multi-selection, names toggle, editing/removal, stale-product rejection, focus and independent scrolling. Existing interior, money and exterior gameplay browser suites pass after updating the interior regression to account for chemist activation now opening the consultation. Final accessibility/shortcut text refinement preserves Escape-to-counter before Escape-to-outside. Documentation updated; final export packaging/push remains.


### Pharmacy consultation/shop pilot complete — 2026-11-07

The requested shop flow is implemented and verified: close-up chemist, generated HD consultation/basket/action assets, twelve original symptom pictures, names toggle and green multi-selection, sensible generic relief recommendations, nine priced product cards, an editable deduplicated basket, saved money checkout and a receipt. Payment failures preserve the cart; repeated checkout cannot charge again. Existing entrance priority, exterior position/facing, walking/traffic/directions and original artwork are preserved. Back/Escape/focus/scrolling are verified across desktop/tablet/portrait/landscape screens.

Final checks: `npm run check`, full `npm test`, final model/interior checks, final `python3 tests/pharmacy-browser.py`, plus `tests/interiors-browser.py`, `tests/money-browser.py` and `tests/browser.py`. No browser errors. Original supplied image hashes pass. Generated WebP assets retain original resolution. Shared cart and exact-price catalog are documented in `docs/PHARMACY_SHOP.md`.

Delivery: `preview/Little-Town-Pharmacy-Shop.zip` contains the current HTML verified byte for byte against `dist/Little-Town.html`; `preview/Pharmacy-Shop.png` provides a visual preview. Current branch: `preview/pharmacy-shop-20261107`; main unchanged. Implementation checkpoint `214a301` is pushed; final delivery commit contains current docs, accessibility/shortcut refinement, updated regression and preview. No further feature is implicitly queued; wait for the user's pilot feedback.

## Active fixes — entrance Space and persistent map view (2026-11-07)

User reports that pressing Space at the entrance prompt does nothing. Also requests Whole map as the default starting view and persistence of the selected scale between Town and Suburbs.

Branch: `fix/entry-space-and-map-view-20261107`, based on shop pilot `78f84ac`.

- [x] Reproduce entrance Space after normal UI interaction/walking, including retained focus on map controls. Fix keyboard precedence without breaking native pharmacy/shop controls or held-key safety; add real-browser regression.
- [x] Start new/legacy saves at Whole map (100%). Preserve the selected zoom percentage across map changes, resize, Back to start and saved-game reload. Save view changes immediately and validate restored zoom.
- [x] Verify the exact keyboard reproduction plus entry/shop, initial fit, changed scale, train round trips and reloads. Run appropriate regression checks.
- [x] Update known bugs/handoff notes and push recoverable commits. Replace the playable preview ZIP with a verified updated export, leaving main unchanged.

Entry/view checkpoint: reproduced the reported failure in Chromium by clicking +, walking on Garden Street into entrance range without changing focus, then pressing Space. The old build left the zoom button focused and failed to enter. Entrance Space now runs in the capture phase before native/map/walking button handlers, preserving facing/position and rejecting repeats. The exact reproduction and four additional focused-control cases pass. New/old saves default to Whole map, and valid saved zoom (100–300%) is restored. Rendering/travel/resize now keeps the chosen percentage; +/- and Whole map save immediately. Real train round trips at 160% and Whole map, reload, resize, reset and invalid zoom/money migration checks pass. Full regression suites are running.


### Entrance Space and map view fixes complete — 2026-11-07

Both user requests are complete. Space entry was reproduced failing after + retained focus, then verified working after +, −, labels, Whole map and walking-button focus. Capture-phase entry prevents native zoom/toggle/step side effects and keeps entry ahead of pedestrians. Pharmacy/shop native Space/Enter interactions and Escape behavior remain intact.

New and legacy saves begin at Whole map (100%). The user-selected zoom percentage (100–300%) is shared between Town/Suburbs and saved immediately on zoom changes/Whole map. Train round trips, reload, resizing/fullscreen and Back to start preserve it. Missing or invalid view fields default to 100% without discarding valid money/map progress. See `docs/MAP_VIEW.md`.

Validation passed: syntax checks; full `npm test`; `tests/entry-view-browser.py` (failed before fix, passes after); existing interior, pharmacy shop, motion, exterior and paving browser checks. No browser errors. Approved assets, map geometry, traffic, navigation, actor/motion and shop modules are unchanged. Updated helper calls in existing browser fixtures explicitly select `frameMap(1)` for Whole map.

Delivery: `preview/Little-Town-Entry-and-Map-View.zip`, containing a standalone HTML export verified byte for byte against the build. Branch `fix/entry-space-and-map-view-20261107`; code checkpoint `87b14c4` is pushed and final delivery commit contains docs and the ZIP. Main remains unchanged. Earlier previews remain on their branches. Open the newly extracted HTML to use these fixes.

## Active task — permanent public browser preview (2026-11-07)

User authorized setting up a permanent browser preview and explicitly selected **Public preview (simplest)**. Future verified changes should update the same link, without ZIP downloads. Starting game commit: `b0d89cd` (Space entry and persistent Whole map/zoom fixes).

Canonical preview source branch: `preview/live`; main remains unchanged. Preserve repository visibility and all gameplay/assets. Only the generated playable site is to be published.

- [x] Confirm public-preview preference. Discover existing GitHub authentication; native Git works, GitHub API CONNECT currently denied by network policy.
- [x] Save a narrow environment network draft adding `api.github.com` and `gerseyli.github.io` while retaining presets. Draft save confirmed; requires user review/save/publication. User asked for a walkthrough; instructions supplied for the little-town environment. Do not claim network change is applied yet.
- [x] Build a static web distribution from the verified offline export, with unchanged game logic and content-hashed HD image assets for browser caching. Keep offline export available. Use a stable launcher/version manifest so refresh loads the latest build.
- [x] Add automatic GitHub Pages build/deploy workflow triggered by pushes to preview/live; test generated site under the repository URL path, keyboard interaction, pharmacy checkout and saved state.
- [x] Owner activated public Pages and allowed preview/live; build/deploy and real HTTPS checks pass. Repository/history publication was explicitly authorized in the later owner-setting checkpoint. No paid resources.
- [x] Verified actual public HTTPS launcher/assets/gameplay and saved money/zoom. Deployment/recovery instructions are saved; preview/live updates the same stable URL.

Environment network draft is saved, not applied/published. It is tied to the existing little-town cloud configuration. GitHub API denial was an environment CONNECT 403; no missing credential was inferred, no new token requested. Continue independent build/workflow work while the user navigates settings.

Hosting preparation checkpoint: `scripts/build-preview.mjs` converts the current offline export to a static site with 27 byte-identical content-hashed images, a small stable launcher, version manifest and hashed game file. Game logic/markup is unchanged apart from asset URLs. `npm run test:preview` passes. Chromium at a Pages-style /little-town/ path verifies assets, Space entry, shop checkout ($100 → $89), and refreshed deployment preserving $89/120% zoom. `.github/workflows/preview.yml` is ready to test/build/deploy on preview/live pushes. Deployment instructions and future-agent guidance are recorded. Running environment status still has an empty custom-domain list: draft is saved, not applied. User has opened Edit environment and sees the two domains; Publish is the next UI action. No live-site claim is made.


Hosting resume checkpoint after environment publication (2026-11-07): user explained the automatic pause message was a glitch and resumed the existing hosting task. New executor is ready; `api.github.com` and `gerseyli.github.io` are applied/enforced and GitHub API reads work. Existing preview/live checkout survived at `8f7b56d`. Repository is private with no Pages site; preserve visibility. Both Pages GET and POST fail with GitHub HTTP403 “Resource not accessible by integration”. No extra environment publication or credential is needed. User was given the direct repository Pages settings link and asked to choose Source → GitHub Actions (or show an actual upgrade requirement). The deployment environment is absent (404). Actions run 42355953665 passed all build/source/gameplay/web-export checks and failed only at configure-pages before site activation; upload/deploy were skipped. Official action docs confirm standard GITHUB_TOKEN cannot initially enable Pages. Finish deployment after the owner setting is enabled; do not claim a live URL yet.


Hosting owner-setting checkpoint (2026-11-07): user screenshot confirmed GitHub requires an upgrade or public repository for Pages. Offered free Cloudflare private-source hosting versus public-repository Pages. User explicitly selected **GitHub Pages — make the entire repository and its history public**. The one-time public visibility change is now authorized, superseding previous keep-private guidance. PATCH /repos/gerseyli/little-town with private:false returned GitHub HTTP403 Resource not accessible by integration; no visibility change was applied. User is being guided to General → Danger Zone → Change repository visibility → Make public, then Pages → Source → GitHub Actions. Do not upgrade billing. Finish activation/deploy/HTTPS verification after owner UI changes; no need to re-publish the already-applied cloud environment.


Pages activation checkpoint (2026-11-07): owner completed public visibility and Pages Source=GitHub Actions. API confirms private:false/has_pages:true and public HTTPS URL https://gerseyli.github.io/little-town/. Full build plus static verification and artifact upload passed on run 42356686612. Deployment alone was rejected before steps: github-pages environment permits only main. Adding the exact preview/live branch policy via API returned integration HTTP403. User is instructed to Environments → github-pages → Deployment branches and tags → add Branch preview/live, preserving main. URL still404: do not claim live yet. Workflow now excludes docs/README/AGENTS/preview-only changes to avoid unnecessary redeploys for recovery notes; source/build/workflow changes still deploy automatically. After owner rule is saved, follow/retry latest run and verify actual game/HTTPS.

## Active task — bank entrance and supplied lobby (2026-11-09)

User request: allow the player to enter the bank and show the exact City Bank lobby image supplied in chat. That image is already tracked unchanged as `assets/interiors/bank/background.png` from Downloads.rar (1672×941; original hash in source-manifest.json).

Work on canonical `preview/live`, preserving the current verified game and main. Preserve the existing untracked `tests/hosted-preview.py` from the earlier interrupted deployment check.

- [x] Add bank to the existing loose-proximity entrance system using `bank-entrance`; keep Space/button focus priority and pedestrian precedence.
- [x] Support a background-only interior with the supplied bank art, money HUD and Back outside/Escape. The pharmacy chemist, greeting and shop must appear only in the pharmacy. No ATM, banking transaction or staff interaction is requested yet.
- [x] Verify bank proximity/keyboard entry, correct HD art with no pharmacy overlay, focus, exit/re-entry, preserved position/facing/zoom/money, and pharmacy regression. Keep supplied image bytes unchanged and embed bank in offline/web builds.
- [x] Bank entry deployed successfully in run 42670728615 at 3f7266a; real public HTTPS bank entry, exact lobby, pharmacy checkout, saved money/zoom and exit checks pass. Interrupted hosting handoff complete.


Bank implementation checkpoint (2026-11-09): reuses the exact existing supplied lobby unchanged. Registry now supports optional character/greeting, the bank uses its named approach and a background-only view, and pharmacy-only actions are guarded. Node interior/hash checks, real bank keyboard/focus/exit/scene-switching browser regression and the existing pharmacy shop browser suite pass. Responsive screenshots confirm the whole supplied image, no pharmacy overlays and readable exit/money controls. `npm run test:preview` verifies 28 external HD assets and unchanged game/asset bytes. Prior deployment 68fc8d9 was also verified in a real HTTPS browser today, completing the interrupted hosting check. Bank deployment/hosted verification is next.

## Active task — bank hotspots and ATM pilot (2026-11-09)

The user dictated this next mechanic while bank entry was being deployed. Preserve that bank entrance/lobby work. Make all five visible bank services clickable: ATM, mortgages, loans, savings accounts and investments. Implement the ATM first; other desks get selection feedback and an extension hook without invented financial products.

- [x] Generate an ATM close-up matching the supplied lobby ATM, a separate cash-slot asset and realistic illustrated dollar-stack asset. Preserve prompts and use clipped, smooth cash-in/cash-out animation.
- [x] Add a distinct persistent bank account starting at $500, separate from spendable wallet money ($100 default). Migrate older saves, preserve zero and validate malformed stored balances. Transfers must conserve total cents, prevent overdrafts/overflow, and save both balances coherently.
- [x] ATM menu: Account balance, Withdraw money and Deposit money. Amount entry asks the requested question, supports confirm/back/keyboard, validates positive two-decimal dollar amounts and funds, and shows clear errors/success. Prevent repeated confirmation while animating.
- [x] Wire accurately aligned lobby hotspots, close-up/back/Escape/focus rules, separate bank/wallet readouts and robust animation cleanup. Confirmed transfer persists immediately; exiting/reloading during the visual animation must not lose or repeat it.
- [x] Test account defaults/save migration, deposit/withdraw/exact/insufficient funds and cents conservation, click targets, amount input, repeat clicks, cash direction/slot clipping, reduced motion and exit/re-entry/reload. Preserve pharmacy checkout and bank entry.
- [x] Bank/ATM/mortgages checkpoint 5ebc59f deployed successfully (run 42674608432). Actual public HTTPS browser verifies transfers, mortgage purchase, automatic red balance, reload and existing pharmacy checkout.


## Active task — mortgages and interaction calendar (2026-11-09)

User dictated this alongside the ATM implementation. Finish both together; keep exact bank lobby, pharmacy, traffic, saved wallet and zoom. House catalog must crop the existing suburbs map and preserve the Bakers’, Johnsons’, Millers’ and Wilsons’ names.

- [x] Generate a matching bank computer frame; crop all four existing house pictures (no regenerated houses/map). Add realistic six-figure catalog prices.
- [x] Mortgage desk opens computer: choose house, compare fixed annual interest rate/term/monthly payment plans, review and explicitly confirm purchase; prevent duplicate ownership and accidental repeated signing. Show congratulations and saved active mortgages, including “None” when empty.
- [x] Add persistent interaction calendar: ten completed meaningful interactions = one month. Equivalent click/Space actions count once; held keys, browsing choices, cancelled/failed actions do not advance time. Show month and progress, document counted actions.
- [x] Fixed amortizing monthly payments use integer cents and annual interest. Allow one manual monthly payment from bank account ahead of due date; at month rollover automatically collect any installment not already paid. Future installments must not double-charge. Show remaining principal, next due month, payment history and final payoff.
- [x] Bank account may go negative only for scheduled mortgage collection. Show negative numbers in red in ATM, mortgage screen and bank balance; deposits reduce overdraft and withdrawals require sufficient positive funds. Wallet remains nonnegative. Persist account, calendar, ownership and schedules coherently; preserve older saves and zero balances.
- [x] Verify amortization, multiple mortgages, automatic/manual timing, no duplicate charges, overdue overdraft/deposits, reload/migration, keyboard/focus/scrolling, exact image crops, responsive desktop/mobile and existing ATM/pharmacy/gameplay suites.
- [x] Mortgage plans/checkpoints are pushed; run 42674608432 deployed 5ebc59f. Real HTTPS bank transactions, loan signing, month rollover/negative balance and saved state pass. Main unchanged.

Pilot rules: fully financed houses; three fixed-rate plans (15/20/30 years), no down payment or fees. A manual payment covers the next installment when within its monthly payment window. Automatic collection can overdraw the bank with no invented penalty. Time counts successful entrances, directions conversations, travel, purchases, ATM transfers, mortgage signing and manual mortgage payments, using their shared action functions for mouse/keyboard parity. Browsing/service clicks and rejected transactions do not count.


## Active task — Grocery store and container vocabulary (2026-11-09)

User added this while banking was being verified. Rename the Town supermarket to Grocery store. Reuse the Little Shop style shopping flow, with new artwork and shared wallet checkout. Explicitly omit this/that/these/those exercises; teach food containers and unwrapped produce instead.

- [x] Locate available Little Shop baseline, preserving the current game. Generate a matching HD grocery interior, one friendly assistant state and at least 24 identifiable food illustrations covering cans, packets, bags, tubs, jars, bottles, cartons, boxes and loose produce. Keep prompts and native image resolution.
- [x] Enable the existing supermarket entrance under the new Grocery store name and center its map/path labels; preserve stable place/path IDs and directions routes.
- [x] Build assistant/catalog interaction, container phrases, food categories, basket quantities/removal/total and checkout/receipt using the existing spendable wallet. No demonstrative grammar or separate money balance.
- [x] Count one completed grocery checkout in the new interaction calendar; failed/empty/repeated checkout and browsing do not advance time. Preserve bank mortgages, ATM, pharmacy, outdoor position, zoom, traffic and keyboard/focus/Escape behavior.
- [x] Final model/browser/combined regressions and static preview pass. Grocery/banking build ec53368 deployed successfully in run 42676590783; actual public HTTPS checks pass for all three interiors, grocery/ATM payments, mortgage rollover, HD assets and saved balances/zoom.

Banking validation checkpoint: all Node suites pass, including multiple full mortgage amortizations, exact cent transfers, safe defaults/debt, duplicate ownership, manual payment at rollover and payoff reload. Chromium tests pass for all five bank desks, retained-focus entry, cash clipping/direction, reload/exit during animation, insufficient funds, payment history, automatic red bank balances, mobile/reduced-motion and scene isolation. Fixed a real Chrome close-watcher issue: repeated native cancel events can become non-cancelable; Escape now handles the nested service/lobby/outside navigation before requesting native dialog closure. Bank/grocery work remains on preview/live; bank deployment and grocery assets are next.

Grocery implementation checkpoint: generated a new 1672×941 room, one 1122×1402 friendly assistant and 24 distinct food illustrations across three native 1774×887 transparent sheets. Exact prompts are retained. Store/path labels now say Grocery store while IDs/geometry remain stable. Shared basket adds opt-in quantities; pharmacy stays one-of-each. Chromium grocery suite passes entry/priority, all 24 phrases/sprites, names/categories, quantity editing, successful/failed/repeated checkout, receipts/reload, shared wallet and mortgage collection on the same tenth interaction. Fixed a short-landscape grid placement failure; independent scrolling and focus now pass 1920/1440/1024/768/375/812/320 widths. Final combined regressions/web export/deployment are running.

Final combined validation before grocery publication: npm run check, full npm test and npm run test:preview pass (41 byte-identical external assets, unchanged offline/web gameplay). Final Chromium grocery, ATM/mortgage, pharmacy and Pages-style preview browser suites pass with no JavaScript errors. All 1,258 directions routes still use at most five items; independent paving widths, traffic/motion and original supplied image hashes pass. Grocery publication/actual HTTPS verification is the only remaining delivery step.

## Banking and Grocery store pilots complete — 2026-11-09

Canonical branch preview/live; main unchanged. Source commit ec53368864d253f3c083973c35f19a4ab10a39ff is live at https://gerseyli.github.io/little-town/ via successful run 42676590783. Actual HTTPS browser test `tests/hosted-preview.py --banking --grocery` passes: retained-focus entry; unchanged bank lobby; pharmacy $100 → $91 checkout/reload; ATM withdrawals/deposits; mortgage signing and automatic month-end overdraft; all 24 Grocery store food pictures, shared-wallet checkout, repeat guard and saved state. No JavaScript errors or failed game/asset requests.

All requested pilots are delivered. New gameplay: separate saved $500 bank account, animated cash, five bank service targets, four-house mortgage catalog and fixed-rate plans, saved ownership/active mortgages/manual or automatic amortizing payments, signed red bank balances, ten-interaction monthly calendar, renamed Grocery store, new friendly assistant/interior and 24 foods with container phrases, quantity basket and shared-wallet checkout. Loans, savings-account and investment products are deliberately future-service screens because their rules were not specified. Assets, prompts, financial rules and verification are documented in BANKING.md, GROCERY_STORE.md and asset READMEs. Open/refresh the same stable link; no download or additional environment publication is needed.

## Standalone HTML download — 2026-11-09

User reports the live preview does not work and explicitly requests a downloadable HTML. Preserve gameplay/artwork and provide the current standalone build, including all bank/mortgage/grocery features. Build/copy the HTML to shared downloads, verify all 41 assets are embedded and exercise it without network access. Publish the exact same HTML as a GitHub release asset so downloading does not depend on the preview website or chat artifact transport. A narrow offline-download workflow builds and publishes only when that workflow changes on preview/live (or is dispatched). Record the verified release URL and digest on completion. No further live-preview repair was requested in this turn.

Standalone download complete: release workflow 42678595210 succeeded and published https://github.com/gerseyli/little-town/releases/download/offline-42678595210/Little-Town.html. The public download was fetched back successfully and matches the local export byte for byte: 60,650,027 bytes, SHA-256 71dec9a5536b479141fd83039885dbfcdada1f5c57f1552f230cbf42505381be. Chromium loaded the HTML and then ran the map, ATM transfer and Grocery store checkout with networking disabled: all 41 assets embedded, no external game requests or JavaScript errors. Shared local copy: /workspace/shared/downloads/Little-Town-Latest.html. Gameplay source is unchanged. A first attempt to send the entire 60 MB document through Playwright route.fulfill timed out; loading the exact file normally before disabling networking passes. The user-reported live-preview failure is not diagnosed or claimed fixed; the requested standalone download is delivered.

## Active task — reusable voice mode / pharmacy pilot (2026-11-09)

User requests generated speaker on/off icons and a free speech engine installed into the game. Pilot pharmacy symptom selection: accept keywords with or without a full sentence and tolerate learner grammar (e.g. “headache”, “I have a headache”, “I has a headache”). Preserve manual clicking and all existing game/shop/accounting behavior. Deliver an updated standalone HTML as well as the existing preview, because the user reported preview problems.

- [x] Evaluate/license and vendor a free browser speech engine plus English model; prefer local speech processing without an API key, paid service or audio upload. Verify compatibility with standalone HTML and web preview. Preserve licenses, provenance and hashes.
- [x] Generate matching HD speaker on/off assets and preserve prompts. Build reusable opt-in voice controller and per-screen adapter; enable the pharmacy symptom chooser first.
- [x] Add tolerant symptom-keyword/alias matching for all 12 symptoms, multiple symptoms per utterance, negation handling and uncertain/no-match feedback. Recognized final phrases should select corresponding icons without erasing manual selections; reject interim/stale results and avoid duplicate toggles. Let students review/remove selections before recommendations.
- [x] Show clear off/loading/listening/processing/error states, recognized words, retry and keyboard-accessible controls. Stop mic tracks/recognizer on off, leaving the chooser, closing/changing place or hiding the game. No silent activation, automatic purchases or time/money changes from speech.
- [x] Keyword/lifecycle/vendor unit tests, complete game tests, static equivalence and real Vosk synthetic-input browser tests pass. Verified first-use standalone recognition offline, manual pharmacy checkout, grocery regression, stopped tracks, cancellation/late permissions, reload without auto-recording and unsupported-API manual fallback. No physical-mic/student-accent claim.
- [ ] Build/verify a complete downloadable HTML with embedded assets/engine/model, publish and verify its direct download. Save checkpoints and deployment/recovery notes. Be candid about accent recognition and browser/device limitations; do not claim live-microphone testing if only fixtures are available.

Voice implementation checkpoint: vendored verified Vosk-browser 0.0.8 and the official small US English 0.15 model with licenses and hashes. Derived memory-only runtime avoids IndexedDB caching; generated speaker states retained as lossless WebP. Context-neutral single-take controller and pharmacy adapter support off/loading/permission/listening/recognizing/retry, final-only keyword selection, twelve symptom vocabularies, multiple symptoms, grammar tolerance, explicit negation and uncertainty confirmation. No speech action spends money or advances time. Node matching/lifecycle/vendor tests pass. Chromium real Vosk/WASM through its fake-microphone capture pipeline recognizes “I have a headache and a sore throat”; repeat/manual/negative/uncertain/permission/cancel/late-result/track-stop/responsive scenarios pass. The full standalone HTML also initializes the real engine/model and recognizes “I has a headache” after networking is disabled. These tests use Flite synthetic speech, not a physical microphone or student accents. Final gameplay/shop/static regressions and release delivery are in progress.

Voice final local validation: full npm test passes (including all original image hashes, path/traffic/directions, money, bank/mortgage and grocery accounting); npm run check and npm run test:preview pass. Web preview uses 43 images plus three byte-identical content-hashed speech resources with microphone delegation in the iframe. Final voice browser suite passes real microphone-pipeline synthetic ASR, manual preservation, duplicate/stale/negated/uncertain cases, permission errors and late grants, responsive views, offline warm recognition, saved preference without auto-start, cold cancellation and unsupported API fallback. Full standalone HTML initializes engine/model offline and recognizes the deliberately nonstandard “I has a headache”. Existing pharmacy and grocery real-browser regressions pass. A map-test harness intentionally freezes requestAnimationFrame; voice waits were corrected to timed polling so tests observe async speech results. Publication/direct download verification remains.

Local-file compatibility correction before final voice delivery: source inspection found that the upstream worker strips `blob:` from its own location before resolving model URLs; a direct local HTML worker can have `blob:null/...`, leaving an invalid `null/...` base. The build-time derived runtime now parses the absolute model URL supplied by our adapter directly. The original upstream vendor file remains unchanged. A new Node regression and an actual Chromium opaque-origin worker/ASR test pass, including “I has a headache”. Static offline/web equivalence still passes. The release workflow now runs voice model/lifecycle/integrity tests before upload. Share only the corrected release produced from the next commit, superseding the first unannounced c31074a voice export.
