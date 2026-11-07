# Entering places: pharmacy pilot

Walk near the pharmacy entrance on Garden Street (between the post office and supermarket). A directions-style **Enter the pharmacy · Space** prompt appears. Click it or press Space to enter. Only the pharmacy is enabled in this pilot; other venues retain their existing outdoor behaviour.

The pharmacy uses the supplied room image and neutral chemist portrait unchanged. Her lower body is clipped at the rear edge of the front countertop, so she stands behind it. The accessible HTML speech bubble says **Hello, how can I help you today?** The chemist supports mouse, touch, Space and Enter. Her next interaction is intentionally left for the user's next request: clicks currently emit the extension event described below and keep the neutral greeting. No purchase, charge or expression change occurs.

**Back outside** or Escape returns the player to the exact outdoor position and facing. Money is shown indoors and preserved. Held movement clears on entry and exit. Tab cycles through interior controls; outdoor controls and directions cannot be activated while indoors. Reloading the game resumes outside using the existing save.

## Implementation and future scenes

- `src/interiors.js` owns `PLACE_INTERIORS`, entrance detection, priority, interior lifecycle and the chemist hook. Add future supported venues to the registry when their assets and interactions are ready. No dead-end prompts appear for unfinished venues.
- Each entry identifies map/place, the actual named entrance approach, a proximity radius, background, character and greeting. Pharmacy proximity uses distance to `pharmacy-entrance`, plus 42 world units of tolerance, only on walkable paving. Facing is unrestricted; the player does not have to line up with one pixel.
- Both prompt selection and activation revalidate the entrance. Entrance priority suppresses the nearby pedestrian prompt and rejects stale directions clicks. Existing bus and train logic is preserved.
- The interior is a full-screen native modal dialog. The room keeps its original aspect ratio, with blurred room framing when the screen aspect ratio differs. The portrait is composed in CSS without editing the original image. A queued-close guard prevents an old visit's close event from ending a rapid new visit.
- `playerMoney` remains the same account indoors; `renderMoney()` also updates the indoor readout. Current entry/click/exit actions do not charge money.

The next pharmacy interaction can subscribe to:

```js
document.addEventListener('little-town:chemist-interact', event => {
  // event.detail: {map: 'town', place: 'pharmacy'}
  // Implement the user-specified next interaction here.
});
```

The supplied displeased and smiling chemist portraits, and the bank lobby included in the archive, are retained as source assets for later requests. They are not activated or embedded in this pilot. Original filenames and SHA-256 hashes are in `assets/interiors/source-manifest.json`.

## Verification

`npm run check` and `npm test` include entrance geometry, priority, stale clicks, repeated Space, neutral greeting, event hook, movement isolation, native close/Escape/reset, position/money/focus preservation and original image hashes.

`python3 tests/interiors-browser.py` covers real keyboard walking to the entrance, an entrance/pedestrian overlap, image decoding, clickable and keyboard chemist interaction, focus cycling, held-key release, Back outside/Escape/re-entry (including queued-close timing), outdoor directions away from the entrance and layout at 1920×1080, 1440×1000, 375×812, 812×375 and 320×640. Screenshots are written under `/tmp/little-town-pharmacy-*.png`. Existing gameplay and money browser suites also pass.
