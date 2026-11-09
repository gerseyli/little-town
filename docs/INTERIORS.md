# Entering places: bank, pharmacy and Grocery store

Walk near the pharmacy entrance on Garden Street (between the post office and Grocery store). A directions-style **Enter the pharmacy · Space** prompt appears. Click it or press Space to enter. The bank on Oak Street also supports **Enter the bank · Space** and shows the supplied City Bank lobby. Bank entry uses the same loose proximity/keyboard priority and exit behaviour. It has no pharmacy portrait, greeting or shop. The ATM and mortgage desk open the illustrated banking pilot described in [BANKING.md](BANKING.md). The Grocery store on Garden Street also supports entry; its friendly assistant opens the [food/container shop](GROCERY_STORE.md). Other venues retain their existing outdoor behaviour.

The pharmacy uses the supplied room image and neutral chemist portrait unchanged. Her lower body is clipped at the rear edge of the front countertop, so she stands behind it. The accessible HTML speech bubble says **Hello, how can I help you today?** The chemist supports mouse, touch, Space and Enter. Clicking her now opens the [pharmacy consultation and shop](PHARMACY_SHOP.md): symptom selection, recommendations, an editable basket and checkout using saved player money. Her portrait remains neutral.

**Back outside** returns the player to the exact outdoor position and facing. Escape first closes a consultation, grocery shop or bank service back to its room, then leaves from the room. Money is shown indoors and preserved. Held movement clears on entry and exit. Tab cycles through interior controls; outdoor controls and directions cannot be activated while indoors. Reloading the game resumes outside using the existing save.

## Implementation and future scenes

- `src/interiors.js` owns `PLACE_INTERIORS`, entrance detection, priority, interior lifecycle and the chemist hook. Add future supported venues to the registry when their assets and interactions are ready. No dead-end prompts appear for unfinished venues.
- Each entry identifies map/place, the actual named entrance approach, a proximity radius, background and accessible background description. Character and greeting are optional; the bank uses background only. The Grocery store uses its own portrait and greeting with the shared actor button, and never opens the pharmacy consultation. Pharmacy proximity uses distance to `pharmacy-entrance`, plus 42 world units of tolerance, only on walkable paving. Facing is unrestricted; the player does not have to line up with one pixel.
- Both prompt selection and activation revalidate the entrance. Entrance priority suppresses the nearby pedestrian prompt and rejects stale directions clicks. Entrance Space is handled during capture before focused map/walking controls, so their retained keyboard focus cannot steal entry or take an extra step. Existing bus and train logic is preserved.
- The interior is a full-screen native modal dialog. The room keeps its original aspect ratio, with blurred room framing when the screen aspect ratio differs. The portrait is composed in CSS without editing the original image. A queued-close guard prevents an old visit's close event from ending a rapid new visit.
- `playerMoney` remains the same account indoors; `renderMoney()` also updates the indoor readout. Checkout spends money atomically; entry, opening the consultation and exit do not charge money.

Chemist activation opens the current consultation and also emits the following event for future extensions:

```js
document.addEventListener('little-town:chemist-interact', event => {
  // event.detail: {map: 'town', place: 'pharmacy'}
  // Observe chemist activation; consultation is already opened.
});
```

The supplied bank lobby is now embedded and displayed on bank entry. The displeased and smiling chemist portraits are retained as source assets for later requests. Original filenames and SHA-256 hashes are in `assets/interiors/source-manifest.json`.

## Verification

`npm run check` and `npm test` include entrance geometry, priority, stale clicks, repeated Space, neutral greeting, event hook, movement isolation, native close/Escape/reset, position/money/focus preservation and original image hashes.

`python3 tests/bank-browser.py` covers real keyboard walking to the bank, Space priority after a focused map button, pedestrian precedence, original image decoding, no pharmacy overlays, bank-service focus cycling, button/keyboard/Escape exit, preserved position/facing/zoom/money, responsive layouts and switching between bank and pharmacy. `python3 tests/interiors-browser.py` covers real keyboard walking to the entrance, an entrance/pedestrian overlap, image decoding, clickable and keyboard chemist interaction, focus cycling, held-key release, Back outside/Escape/re-entry (including queued-close timing), outdoor directions away from the entrance and layout at 1920×1080, 1440×1000, 375×812, 812×375 and 320×640. Screenshots are written under `/tmp/little-town-pharmacy-*.png`. Existing gameplay and money browser suites also pass.
