# Original-map detail pass

Both maps remain single integrated images with their original dense composition. The artwork pass was based on the original maps (`d3acb44`). The current combined preview uses all gameplay from `little-town/living-world-checkpoint` (`7e38b66`), including moving traffic, walking pedestrians, ask-for-directions, route planning and the three path fixes. Its updated map images are byte-identical to the artwork preview (`e9ffb6d`). The living-world road overlay hides painted traffic cars beneath the animated vehicles; parked cars and scenery remain in the map images.

## Generation prompt

SURGICAL MAP IMAGE EDIT. The FIRST reference is the original complete playable game map. Preserve its exact canvas, aspect ratio, framing, scale, building locations and plot coverage. This is NOT a redesigned map, NOT separate sprites, NOT a concept sketch. Return the same COMPLETE richly illustrated map with every place still baked into it. The second reference is ONLY a guide to the desirable material and window detail, never its layout or building sizes.

Change ONLY the architectural interiors / facades / roof detail inside existing building silhouettes. Keep each building at its ORIGINAL footprint, ORIGINAL apparent size and ORIGINAL orientation. Retain the original elevated map camera and sunny, warm, slightly whimsical but realistic painted style. Add refined crisp masonry, physically coherent roof tiles, wood grain, believable glass, detailed shop displays and inviting little storytelling details. Render details cleanly at the greatest supported native resolution, not oversharpened or noisy. No random lettering, invented logos, doubled fixtures, warped geometry or melted props. Existing entrances must stay exactly where they are.

EVERYTHING ELSE MUST REMAIN UNCHANGED: all streets, cobblestone pavements, narrow walkways, intersections, crossings, traffic lights, street lamps, signs, vehicles and their colors/positions, benches, gardens, trees, flowers, water, riverbanks, bridges, railway tracks, fences and map borders. Do not remove anything. Do not invent new paths or resize landmarks. Do not enlarge facades into roads or lawns. No empty plots, no floating sprites, no GUI, no new pedestrians, no text labels. Maintain dense beautiful integrated scenery, with architecture embedded naturally in the original landscape.

Town identifying details: individual croissants, baguettes, loaves and berry tarts at the original bakery; a dinosaur skull/skeleton and fossils visible inside the original museum; books, globe, reception, coffee and cakes, postal parcels, pharmacy bottles, produce and cinema display details inside the corresponding existing buildings.

Suburban detail: refine original house facades/roofs, barn/silo, rural station, long low mall shop displays and amusement-park structures. Preserve all original colors, footprints and orientations. Keep field, forest, hill, mountain, lake, coast, boats, cars and parking unchanged.

## Integration guard

`MAP_EDIT_REGIONS.json` lists allowed building-area rectangles in the native source image coordinates. Generated candidates are registered to the original canvas, then only those selected regions are applied with a small inward feather. Pixels outside their union must be identical to the decoded original map; the final WebP is encoded losslessly so streets, traffic, vegetation, water and railway cannot drift from re-encoding. This preserves original terrain rather than accepting the generator's changes elsewhere on the map. Canvas sizes remain 1500×1049 (Town) and 1536×1024 (Suburbs); this edit does not add native 4K resolution.

This is a visual edit, so the original HTML baseline fingerprint is historical and will differ. Validate gameplay source files against `7e38b66`, the map images against `e9ffb6d`, run syntax/gameplay checks, and inspect both browser maps. The three path fixes are restored from the gameplay checkpoint. Remaining prototype refinements are listed in `docs/IMPLEMENTATION_PLAN.md`.
