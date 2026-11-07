# Visible walking-path audit

Audited against the current detailed integrated Town and Suburbs map images. The artwork itself is unchanged. Debug navigation overlays were inspected in Chromium, including enlarged riverbank, lake and coastal sections.

- **Town:** retained the corrected hotel/cinema lane at x=1090; aligned the upper riverbank at x=1360 and southern bank at x=1365; connected the adjoining streets and bridges; extended the meadow path to x=1960. Added short paved entrance approaches which stop at the facade apron rather than entering buildings.
- **Suburbs:** retained the harbor/theme-park connection and curved bay promenade; added Field Lane at x=1382.812; added the inner lake promenade with a narrow walkable band and west access; matched the hill/mountain turns and their destination access points to the artwork. Added four paved driveways and the farm's entrance approach. Split West Lane into northern and southern parts so its drawn navigation line does not imply an unmarked crossing of the carriageway.
- **Safety:** walking through water, building interiors, the fountain and railway remains blocked. Marked crossings retain traffic-light protection. Coast Road retains the newer yield/clearance checks at actual movement time, independently of static route planning.

`tests/motion-paths.cjs` checks independently traced connector coordinates in both directions, then samples every registered path segment at intervals of at most two world units (20,880 centre-line probes). Negative probes verify buildings and inner lake/bay water remain blocked. The three original bug regressions remain in `tests/world.cjs`. These centre-line checks complement the visual overlay audit; they are not a claim that every painted paving pixel has been classified automatically.


## Paving-edge follow-up — 2026-11-07

The user found that the earlier centre-line coverage did not make the full painted path usable. In particular, Garden Street's old centre was too high, and the former harbor connector was not the actual gate opening. These were remeasured against the native images rather than accepting the old model as truth.

| Reported corridor | Native image measurements used for regression | Corrected world geometry |
| --- | --- | --- |
| Garden Street | Town rows 753, 758, 765, 772 and 777 across x=95…1010 | Centre y=1020, radius 22; adjacent Garden Lane centre x=710 |
| Theme-park gate link | Suburbs columns 1221, 1228, 1235, 1242 and 1249 across y=779…813 | Centre x=1929.6875, y=1209.375…1278.125, radius 24 |

Additional independent native-coordinate corridor rectangles cover 42 straight paved regions on both maps. Together with the reported corridors, 3,784 samples cover paved edges and interiors; they are not derived from `MAPS.paths` itself. Chromium also walks the player across the reported regions at multiple edge offsets using real keyboard events. Water, building, parked-car, railway and traffic-safety exclusions remain in place. Curved paths and bridge approaches were inspected visually alongside these fixtures.

`src/paths.js` derives label anchors and orientation from the same geometry used for walking. SVG text uses a central baseline rather than positioning its text baseline on the paving centre. There is no separate hand-maintained street-label coordinate list. Long bent roads repeat their names on major sections, and the lake promenade keeps a readable label size.

Directions use a turn-aware search and name continuous paths once, even when they curve. The wording retains meaningful turns and safe crossings while suppressing grid alignment. Complete short clauses are packed into concise items, never cut off to meet the limit. Searches are reused for successive destination choices from the same conversation and bounded to four cached origins. The 1,258 route regression cases validate safe walking legs, destination arrival, train advice, item length and the six-item maximum; current output is one to five items.
