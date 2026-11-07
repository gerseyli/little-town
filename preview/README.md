# Entrance Space and saved map view — corrected preview

Download **Little-Town-Entry-and-Map-View.zip** with GitHub's **Download raw file** button. Extract it and open the **newly extracted Little-Town.html**. The game is fully offline.

## Fixed in this version

- **Space enters at the pharmacy prompt**, even when a zoom, labels, Whole map or walking button retains keyboard focus. Entry wins before the button's native action and nearby pedestrian interaction.
- New games/older saves start at **Whole map (100%)**.
- Your chosen zoom percentage stays the same between Town and Suburbs and survives resize, Back to start and reload. View changes save immediately.
- The complete pharmacy shop pilot is retained: symptom multi-selection/names toggle, recommendations, editable basket and saved-money checkout.

## Try the pharmacy

Enter the pharmacy on Garden Street, then click the chemist. Select symptom pictures and ask **What would you recommend?** Add product cards to **Your basket** and check out. Insufficient funds preserve the basket and balance; paid spending saves. **Back to counter** or Escape returns to the room; Escape from the room leaves. **Back outside** leaves directly.

![Pharmacy shop](Pharmacy-Shop.png)

## Verification

The retained-focus entrance regression failed on the previous build and now passes for five control types. Real train journeys confirm zoom persistence at 160% and Whole map, along with reload/resize/reset and invalid-save fallback retaining money. Syntax/full Node and interior/shop/motion/exterior/paving Chromium suites pass. The archived HTML is byte-identical to the build; all artwork and existing gameplay data are preserved.

[Recovery plan](../docs/IMPLEMENTATION_PLAN.md) · [Map view and keyboard fix](../docs/MAP_VIEW.md) · [Pharmacy shop](../docs/PHARMACY_SHOP.md)

Branch: `fix/entry-space-and-map-view-20261107`. Main unchanged.
