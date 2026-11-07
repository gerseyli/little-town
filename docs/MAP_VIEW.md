# Default and saved map view

New games and older saves without a zoom preference start in **Whole map (100%)**. The entire active map fits in the available screen area. The user can still pan and use the existing +/−/Whole map controls.

The selected zoom percentage is shared between Town and Suburbs. For example, selecting **160%** in Town keeps **160%** after taking the train to Suburbs and returning. Resizing/full-screen changes, Back to start and map rendering also preserve the selection. Zoom is a percentage of each map's Whole map fit, so 100% fits either complete map on the current screen.

The existing `little-town-worlds-v3` save now includes numeric `zoom` (1 = 100%, 3 = 300%). +/−, Ctrl+wheel and Whole map save the preference immediately, and ordinary game saves retain it. A valid stored zoom restores on reload. Missing, nonnumeric, nonfinite or out-of-range values use 100%, while other valid saved state, including money, is retained. Storage denial still allows view changes for the current session.

`frameMap(nextZoom = zoom)` lays out/recentres the active map using the current preference; `frameMap(1)` explicitly selects Whole map. `setZoom()` handles bounded incremental zoom and saves it. Layout no longer chooses a new cover zoom on every map change/resize.

## Entrance Space regression

The old entrance handler skipped Space if a map button retained keyboard focus. Clicking + and then walking with arrow keys leaves that button focused; Space therefore zoomed instead of entering, even with the entrance prompt visible. The previous entrance browser test explicitly focused the map and missed this normal sequence.

`handleEntranceKeydown()` in `src/interiors.js` now claims entrance Space during event capture, before the focused map/walking button or general keyboard handler. It cancels the button's native action and stops propagation, so a walking button cannot change facing/take a step first. Repeat keys cannot enter again. Text fields are excluded, and available-entrance checks preserve native keyboard controls inside the pharmacy, shop, phrase book and directions dialog.

`python3 tests/entry-view-browser.py` reproduces the failure on the old build and passes with the fix. It covers retained focus on +, −, labels, Whole map and a walking button, plus Space hold/release, unchanged position/facing, startup fit, real train round trips, saved zoom reload/resize/reset, and invalid/older view saves retaining money. Existing interior/shop/motion suites cover native keyboard interaction and camera behaviour.
