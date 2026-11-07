# Pharmacy consultation and shop pilot

Enter the pharmacy on Garden Street, then click the chemist (or focus her and press Enter/Space). The close-up view places the larger chemist on the left and the illustrated consultation panel on the right.

## Player flow

1. **I think I have …**: choose one or more of the 12 supplied symptom pictures. Each selection gains a green border/check; click again to deselect. **Names: on/off** shows or hides the full English phrases, including “I have a headache”, “I have food poisoning” and “I have a sore throat”. Names remain available to assistive technology. The symptom area scrolls, while the recommendation action remains below it.
2. **What would you recommend?**: enabled when at least one symptom is selected. The chemist says “For …, I would recommend …” for each selected symptom. The right panel displays unique recommended products as cards with names, descriptions and prices. Shared recommendations produce one product card.
3. Click product cards to add them to the illustrated **Your basket** panel. A product appears once; clicking it repeatedly does not multiply it. Remove products with their labelled × buttons. Item count and total update immediately. **Change symptoms** returns to selection, preserving the selected pictures; products no longer recommended are removed when advancing again.
4. **Check out** deducts the basket total from the same player money account used outside. An insufficient balance leaves money and basket unchanged and explains the shortage. A successful payment shows a receipt, clears the basket, updates the HUD and saves spending immediately. Double/repeated checkout cannot charge twice. **Start a new order** returns to empty symptom selection.

**Back to counter** or Escape closes the close-up view, preserving its current selection/order until the player leaves the pharmacy. Another Escape from the room leaves the building. **Back outside** always leaves directly. Leaving preserves the outdoor position/facing and any completed spending, and discards unpaid basket/receipt state. Reload resumes outside with the saved balance. This pilot does not add an inventory or medicine-use/health system.

## Catalog

The game uses recognizable generic symptom-relief products and fictional prices. No dosing, prescription treatment, diagnosis engine or claims of cure are introduced.

| Symptom picture / phrase | Recommended product | Price |
| --- | --- | --- |
| Headache, toothache, fever, flu aches/fever | Paracetamol | $5 |
| Stomachache from indigestion | Antacid tablets | $7.50 |
| Food poisoning / lost fluids | Oral rehydration salts | $6 |
| Backache | Heat patches | $6.50 |
| Dry, tickly cough | Soothing cough syrup | $8 |
| Runny nose | Saline nasal spray | $4.50 |
| Sore throat | Throat lozenges | $4 |
| Sunburn | Cooling after-sun gel | $7 |
| Itchy insect bite | Anti-itch cream | $5.50 |

`src/pharmacy-data.json` is the authoritative vocabulary, recommendation and price catalog. The supplied atlas's `nausea` frame is used for food poisoning, and `chills` for flu; original artwork identifiers/bytes are preserved. Selecting all 12 symptoms yields nine unique products for $54.

## Implementation

- `src/shop.js`: reusable one-of-each-product order, integer-cent totals, immutable catalog snapshots and atomic `playerMoney.debit(dollars)` checkout. Empty/insufficient/reentrant checkout is rejected without a charge. Orders clear only on successful payment.
- `src/pharmacy.js`: selection/recommendation/receipt state, names toggle, renderers, guarded product actions and focus. Unrecommended or hidden-stage actions cannot add products or charge money.
- `src/pharmacy.css`: close-up layout and scrolling; wide screens show recommendations and basket side by side, narrow screens stack panels. The chemist's long recommendation bubble also scrolls. The existing interior modal owns focus and prevents exterior movement.
- `src/interiors.js`: chemist activation opens the consultation and still emits `little-town:chemist-interact`. Entry priority and native-close/rapid-re-entry protections remain. Escape closes consultation before leaving the room.
- `assets/ui/pharmacy/`: generated high-definition frames and action button, lossless WebP at original resolution, with generation prompts recorded. Live text and controls are HTML. Original room, portraits and symptom PNG are unchanged. One shared SVG image definition supplies all atlas cells without copying its data URL 12 times.

All used assets are embedded by `scripts/build.mjs`. No runtime network calls or added dependencies.

## Verification

`npm run check` and `npm test` pass. New `tests/shop.cjs` checks account totals, add/remove, unknown/duplicate products, failed/exact-balance/repeated/reentrant payment, snapshots/catalog validation and the actual twelve-to-nine catalog mapping.

`python3 tests/pharmacy-browser.py` covers actual UI multi-selection/unselection, visible green state, names toggle, all asset decoding, recommendations and deduplication, basket/removal/totals, insufficient funds, a $15 purchase reducing $100 to $85, repeated checkout, saved spending after reload, stale product rejection, changed symptoms, fresh orders, back/exit/reopen, focus and keyboard activation. Layout/scroll checks run at 1920×1080, 1440×1000, 1024×768, 375×812, 812×375 and 320×640. Screenshots under `/tmp/little-town-pharmacy-*` were visually reviewed.

Existing interior, money and exterior gameplay Chromium suites also pass. The full Node suite retains traffic, walking, 3,784 independent paving samples, all 1,258 concise route cases and supplied-image hash checks.
