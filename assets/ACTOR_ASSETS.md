# Actor assets

Generated for this development checkpoint using the image generation tool, then cut out with that tool and exported as individual WebP sprites. Raster style and transparent backgrounds were chosen to match the existing classroom game. The six vehicle kinds and six distinct people each have their own file; all are embedded by the standalone builder.

- `vehicles/`: car, truck, bus, taxi, ambulance, police; source artwork faces right and is mirrored for the opposite lane.
- `pedestrians/0.webp` through `5.webp`: Maya, Arthur, Lin, Sam, Rosie and Nora. Each has different hair, clothes and appearance.
- Original generated sheets and cutouts are preserved outside the checkout in `/workspace/scratch/little-town-sprite-sources` and `/workspace/generated_images`. Export packaging extracts the six grid cells, crops transparent margins and resizes before WebP encoding; it does not redraw the subjects.

These are the first artwork pass, pending user review. Pedestrians currently use a walking pose with a subtle movement bob rather than a multi-frame gait animation.
