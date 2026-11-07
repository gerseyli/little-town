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
