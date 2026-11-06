# Known bugs

The user authorized fixes on 2026-11-06. The three original issues are fixed in the current development checkpoint, with exact-path regressions in `tests/world.cjs` and alignment inspected against the map artwork in Chromium. General reachability checks also pass.

| ID | Map | Reported problem | Next action |
| --- | --- | --- | --- |
| LT-001 | Town | The vertical road between the hotel and cinema is inactive. | Fixed: align Cinema Lane at x=1090, connecting both southern streets and pavements; remove the misplaced continuation through the cinema. |
| LT-002 | Suburbs | The short path connection between the harbor and theme park cannot be walked. | Fixed: connect Harbor Pier to Theme Park Walk at x=2134.375. |
| LT-003 | Suburbs | The vertical path beside the edge of the bay works intermittently. | Fixed: follow the curved bay-edge promenade instead of the old straight line through landscaping. |

Do not mark these fixed because general reachability tests pass. A destination can be reachable by another route while a particular connection remains broken. Each issue needs an exact route test and a visual alignment check when work on it is authorized.

The moving-world features are a development checkpoint, not a finished release. See `IMPLEMENTATION_PLAN.md` for remaining traffic, artwork and directions refinements.


## Visible-path follow-up

The latest audit also corrects riverbank alignment, adds the missing western field lane and inner lake promenade, connects paved driveways/entrance approaches and adjusts hill/mountain turns. The three original fixes remain included. `tests/motion-paths.cjs` and `docs/WALKING_PATH_AUDIT.md` record the additional coverage. Water, buildings and railway remain blocked; road crossings remain governed by traffic safety.
