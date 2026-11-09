# Grocery store pilot

The former supermarket is now named Grocery store on the Town map, its entrance path and pedestrian directions. Stable map IDs/geometry remain unchanged. Walk near the entrance on Garden Street, east of the pharmacy, and press Space or click Enter the grocery store. Entry takes priority over a nearby pedestrian. A new HD room and one friendly shop assistant replace the pharmacy assets. Click the assistant (or use Enter/Space) to shop.

The separate Little Shop project was not found in the available checkout, attachments or accessible repositories. This implementation reuses Little Town's tested shopping/accounting model already used by the pharmacy, extending it with opt-in grocery quantities while keeping pharmacy one-of-each behavior.

## Food and language

Twenty-four new food illustrations cover cans of beans/tuna, jars of honey/jam, bottles of milk/water, cartons of juice/eggs, packets of pasta/rice, bags of flour/sugar, tubs of yogurt/ice cream, boxes of cereal/tea, a loaf of bread, a bar of chocolate, bunches of bananas/grapes and individual apples/oranges/carrots/tomatoes. No this/that/these/those activity is included.

Choose an item to add it to the basket and show the request “I’d like a can of beans, please.” The container words are highlighted in green. Produce uses normal item phrases such as “an apple”. Basket quantities use appropriate plurals (two cans, loaves, boxes, bunches, tomatoes). Categories filter the catalog without removing basket items. Names on/off supports picture-only practice; accessibility labels retain the complete phrase and price. Prices remain visible.

All new graphics are native-resolution, lossless WebP, with generation prompts in `assets/interiors/grocery/README.md`. The 1672×941 room and 1122×1402 assistant are separate assets. Three 1774×887 transparent sprite sheets provide eight independently addressed pictures each using SVG viewBox, without resizing or destructive cropping. Captions, prices, totals and controls are live HTML.

## Basket and payment

Add several products or multiple units (up to 99 per product), change quantity with +/− or remove a whole line. The basket shows quantities, line totals and total cost. Checkout spends the same saved player wallet used by the pharmacy and HUD. The bank account is not used to pay for groceries. Insufficient wallet funds leave the basket intact and offer a clear message. Empty/repeated/stale checkout cannot charge again.

A successful checkout creates a receipt and advances the shared interaction calendar once, regardless of basket size. Failed checkout, selecting food, changing quantities, filtering and browsing do not advance time. Entry advances time once as with other interiors. If checkout is the tenth completed interaction, scheduled mortgage payments still come from the separate bank account; the groceries come from the wallet. See `BANKING.md`.

Basket and receipt are per visit, with completed spending persisted immediately. Returning to the counter retains an unfinished order; leaving/reloading starts a fresh basket. Money, calendar, mortgages, map position/facing and zoom are preserved. Escape returns to the counter before leaving outside; Back outside exits directly. Outdoors remains inert while shopping. Catalog and basket scroll independently, with compact layouts for portrait and short landscape screens.

## Implementation and checks

`src/grocery-data.json` contains vocabulary, prices, categories and sprite frames. `src/grocery.js`/`src/grocery.css` implement the room consultation/catalog/basket/receipt. `createShopOrder(...,{quantities:true})` adds quantity support to the shared model without changing pharmacy defaults. The existing entrance registry and save remain in use. Offline and web exports embed/include every new asset.

`tests/grocery.cjs` verifies vocabulary/sprites/rename and exact quantity totals, snapshots, removal/funds/repeat guards and shared-wallet behavior. `tests/grocery-browser.py` covers retained-focus Space entry, pedestrian precedence, assistant activation, all 24 food labels, names/categories, quantities, failed/successful checkout, receipt/reload, month-boundary mortgage integration, focus, responsive independent scrolling and pharmacy/bank isolation. Banking and pharmacy regression suites remain required.
