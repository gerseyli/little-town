# Living-world gameplay with updated map artwork

Download `Little-Town-Living-World-Updated-Art.zip` using **Download raw file**, extract it and open `Little-Town.html` in your browser. Everything is embedded for offline play.

This combines the complete gameplay checkpoint `7e38b66` with the updated integrated map artwork from `e9ffb6d`:

- Six moving vehicles on each map, traffic-light stops, queues and crossing clearance.
- Six distinct walking pedestrians on each map. Walk close to one and click **Ask for directions**, or press **Space**.
- Choose any Town or Suburbs destination for walking, bus and train route advice.
- The checkpoint's three path fixes, original bus services, railway travel and phrase book.

The updated Town and Suburbs map images are unchanged. The gameplay source and actor assets exactly match the latest living-world checkpoint. The road overlay is retained to conceal the map's stationary painted road cars under the moving traffic.

Validation passed: syntax checks; original smoke suite; world/traffic/pedestrian/path/directions tests; browser assertions of actual movement on both maps and functioning directions dialogues. The ZIP matches the built HTML byte for byte.

This is a preview of the existing living-world prototype. Its remaining traffic and directions refinements are documented in `docs/IMPLEMENTATION_PLAN.md`; this integration does not claim to resolve those.
