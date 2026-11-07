# Known bugs

The user authorized fixes on 2026-11-06. The three original issues are fixed in the current development checkpoint, with exact-path regressions in `tests/world.cjs` and alignment inspected against the map artwork in Chromium. General reachability checks also pass.

| ID | Map | Reported problem | Next action |
| --- | --- | --- | --- |
| LT-001 | Town | The vertical road between the hotel and cinema is inactive. | Fixed: align Cinema Lane at x=1090, connecting both southern streets and pavements; remove the misplaced continuation through the cinema. |
| LT-002 | Suburbs | The short path connection between the harbor and theme park cannot be walked. | Fixed after rechecking the artwork: the gate link is at x=1929.6875, connecting Theme Park Walk to the harbor promenade. Its full painted width is covered; the former x=2134.375 shortcut through landscaping is blocked. |
| LT-003 | Suburbs | The vertical path beside the edge of the bay works intermittently. | Fixed: follow the curved bay-edge promenade instead of the old straight line through landscaping. |

Do not mark these fixed because general reachability tests pass. A destination can be reachable by another route while a particular connection remains broken. Each issue needs an exact route test and a visual alignment check when work on it is authorized.

See `IMPLEMENTATION_PLAN.md` for the current validated checkpoint and any remaining refinements.


## Visible-path follow-up

The latest audit also corrects riverbank alignment, adds the missing western field lane and inner lake promenade, connects paved driveways/entrance approaches and adjusts hill/mountain turns. The three original fixes remain included. `tests/motion-paths.cjs` and `docs/WALKING_PATH_AUDIT.md` record the additional coverage. Water, buildings and railway remain blocked; road crossings remain governed by traffic safety.


## Full-width paving and concise directions — 2026-11-07

- **LT-004 — Garden Street:** its former centre y=1000 sat above the painted paving. Corrected to y=1020 with the full usable width and centred label. Independent native-image probes and keyboard traversal cover both edges and the middle across the street.
- **LT-002 follow-up — Actual theme-park gate:** the earlier centre-line regression tested the wrong connector. Replaced it with the painted link at native image x≈1235 (world x=1929.6875), tested across its full width from the gate to the harbor promenade.
- **Path coverage and labels:** calibrated the paving widths and adjoining lanes on both maps, with 3,784 independent native-image probes across 42 additional corridor regions plus the two reported paths. Every registered path has a stable ID/name and a label centred on its own geometry. Long bent streets repeat labels on their major sections; label visibility still follows the existing toggle.
- **Overlong directions:** replaced grid-cell narration with continuous named-path guidance and simpler turn-aware routes. Complete instructions retain transport, crossing safety and arrival. They are not padded or truncated. Each item is bounded to 160 characters/28 words, with six items as the requirement ceiling. All 1,258 start/NPC/patrol-end test journeys currently use one to five items.

The earlier centre-line audit alone did not establish paving-edge usability. The independent width fixtures in `tests/fixtures/paved-corridors.json`, regressions in `tests/paving-directions.cjs` and real-input browser checks in `tests/paving-browser.py` are the stronger checks for this revision.
