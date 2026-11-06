# Little Town — implementation plan

Last updated: 2026-11-06. User-authorized scope; update this file after each milestone so work can resume after a chat interruption.

1. **In progress — Fix known path bugs.** Reproduce LT-001 (hotel–cinema), LT-002 (harbor–theme park), and LT-003 (bay-edge path). Align geometry with artwork, add exact-connection regression checks, preserve collision and crossing rules.
2. **Pending — Moving road traffic.** Remove the driving vehicles baked into the road artwork while preserving scenery and parked cars. Add moving cars, trucks, buses, taxis, ambulances and police cars as separate assets. Traffic follows lanes, queues safely and stops before zebra crossings on its red signal, continuing on green; synchronize vehicle and pedestrian signals.
3. **Pending — Distinct walking pedestrians.** Add five or six per map, each with a different separately generated asset. They walk on valid paths slower than the player, who can catch up and walk through them. Pause the approached pedestrian for conversation.
4. **Pending — Ask-for-directions interaction.** Show a small prompt above the nearby player/pedestrian: “Ask for directions · Space”. Space opens a dialogue with “Excuse me, how can I get to …?” and clickable destination choices (including cinema, hotel, supermarket, pharmacy and suburban places). Support closing and keyboard use without conflicting with transport controls.
5. **Pending — Phrasebook-based route directions.** Use current player location, valid walkable geometry and existing phrasebook language to generate useful step-by-step directions. Cover both maps, pedestrian crossings, bus routes/stops and train stations. Use sensible efficient routes; suggest useful bus journeys and include train travel for cross-map destinations. The user explicitly withdrew the earlier idea of choosing shortest routes only 50% of the time.
6. **Pending — Validation and delivery.** Run syntax, build, original smoke checks and focused regressions for paths, signals, traffic, pedestrians and routing. Inspect the playable export in a browser when supported. Retain the fully offline embedded-asset HTML. Record limitations, update docs, and save recoverable local Git milestones; do not push or publish publicly.

## Resume notes

- Existing checkout: `/workspace/little-town`; Node.js >=18; no external package dependencies.
- Read `AGENTS.md`, `README.md`, `docs/PROJECT_BRIEF.md`, `docs/KNOWN_BUGS.md` and this plan.
- Commands: `npm run check`, `npm test`, `npm run build`.
- Source: `src/`, `assets/`; `dist/` is generated and untracked. Do not edit or commit generated exports.
- Imported baseline commit: `d3acb447be076dd6900f5c850387e21fa8e8f408`. Original checks passed and exported SHA-256 matched `docs/BASELINE.json` before this work. Authorized gameplay changes will intentionally differ from that baseline.
- Separate asset generation is part of this plan; keep final artwork consistent with the existing colourful raster style.
