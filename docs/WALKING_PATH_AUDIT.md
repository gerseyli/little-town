# Visible walking-path audit

Audited against the current detailed integrated Town and Suburbs map images. The artwork itself is unchanged. Debug navigation overlays were inspected in Chromium, including enlarged riverbank, lake and coastal sections.

- **Town:** retained the corrected hotel/cinema lane at x=1090; aligned the upper riverbank at x=1360 and southern bank at x=1365; connected the adjoining streets and bridges; extended the meadow path to x=1960. Added short paved entrance approaches which stop at the facade apron rather than entering buildings.
- **Suburbs:** retained the harbor/theme-park connection and curved bay promenade; added Field Lane at x=1382.812; added the inner lake promenade with a narrow walkable band and west access; matched the hill/mountain turns and their destination access points to the artwork. Added four paved driveways and the farm's entrance approach. Split West Lane into northern and southern parts so its drawn navigation line does not imply an unmarked crossing of the carriageway.
- **Safety:** walking through water, building interiors, the fountain and railway remains blocked. Marked crossings retain traffic-light protection. Coast Road retains the newer yield/clearance checks at actual movement time, independently of static route planning.

`tests/motion-paths.cjs` checks independently traced connector coordinates in both directions, then samples every registered path segment at intervals of at most two world units (20,880 centre-line probes). Negative probes verify buildings and inner lake/bay water remain blocked. The three original bug regressions remain in `tests/world.cjs`. These centre-line checks complement the visual overlay audit; they are not a claim that every painted paving pixel has been classified automatically.
