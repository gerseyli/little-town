# City Bank pilot

Enter the bank from Oak Street with the existing loose entrance/Space prompt. The unchanged lobby has five mouse/touch/keyboard targets: ATM, mortgages, loans, savings accounts and investments. Loans, savings and investments display a named future-service screen; their products have not been specified. Escape returns from a service to the lobby, then outside. Back outside exits directly. Position, facing, zoom, wallet and pharmacy behavior remain shared with the existing game.

## Wallet and bank

Wallet defaults to $100 and is the spendable HUD balance. Bank account defaults to $500. ATM offers account balance, withdrawal and deposit. A confirmed transfer moves exact integer cents between them, then saves both balances and the interaction calendar before playing the decorative cash animation. Failed/zero/invalid/over-precise amounts change nothing. Amount input accepts positive dollars with at most two decimal places. Negative bank balances appear in red; deposits reduce the overdraft, and withdrawals require sufficient positive bank funds. The wallet never permits negative balances.

The generated ATM, cash slot, dollar-stack and computer assets are documented in `assets/ui/bank/README.md`. Cash is clipped behind the slot and animated using CSS transforms; reduced motion uses a short animation. Closing or refreshing during animation preserves the already confirmed transfer. Repeated confirmation is blocked.

## Houses and mortgage plans

The four catalog pictures are exact crops of the current suburbs map using existing world crop coordinates, converted to native pixel boxes. No house or map is regenerated. Names remain The Bakers’ house, The Johnsons’ house, The Millers’ house and The Wilsons’ house. Source coordinates and crop sizes are in `assets/interiors/bank/houses/crops.json`.

| House | Price |
| --- | ---: |
| The Bakers’ house | $285,000 |
| The Johnsons’ house | $425,000 |
| The Millers’ house | $345,000 |
| The Wilsons’ house | $510,000 |

Choose a house, then one of three fixed plans: 15 years at 5%, 20 years at 5.5%, or 30 years at 6% annual interest. The computer shows monthly payment, interest rate, term and borrowed amount before an explicit confirmation. The pilot finances the whole price, with no down payment, fees or approval simulation. Signing saves ownership and an active mortgage; the same house cannot be bought twice. Houses remain visible on the map and their entrances are unchanged.

Monthly payments follow the amortizing formula `principal × monthlyRate / (1 − (1 + monthlyRate)^−months)`, rounded to cents; monthly rate is annual rate / 12. Each installment splits rounded interest and principal. The last installment adjusts to repay the remaining principal exactly. Active mortgages show principal remaining, payment count, next due month and the last twelve payments. Paid-off homes remain owned and visible after reload.

## Interaction calendar and collection

Ten completed meaningful interactions advance one game month. Calendar starts at Month 1, 0/10. Successful entrances, opening a directions conversation, completed bus/train travel, pharmacy checkout, ATM transfers, signing a mortgage and manual mortgage payments each count once. Click and Space use the same action functions. Failed transactions, held-key repeats, browsing products/plans, choosing directions destinations, closing screens, walking and cancelled travel do not advance time. Real elapsed time and time away from the game do not count.

A new mortgage first becomes due at the next month boundary. During each monthly window the player may manually pay the next installment from available bank funds. That installment is marked covered and is not collected again at rollover. Further early payments in that window are disabled. At rollover, any uncovered installment is collected automatically from the bank account, even if it makes the balance negative. There are no extra penalties or fees. A negative balance is the pilot's representation of going into the red; no separate missed-payment debt is duplicated. Every active mortgage is processed independently. Signing or paying can itself be the tenth interaction, so the review states how many interactions remain until rollover.

## Persistence and validation

Existing `little-town-worlds-v3` local save remains in use; `moneyCents` remains wallet money. New `banking` snapshot contains signed `bankCents`, total interactions and mortgage records. Older saves initialize only the missing banking fields. Zero balances, valid debt and completed mortgages survive reload. Unknown/invalid house/plan records are ignored. Saved copies cannot mutate the live model. Persistence is local to this browser/origin, as with the existing wallet and map state.

`src/money.js` supplies atomic cent transfers and a restricted scheduled-payment primitive. `src/banking.js` owns calendar, mortgages, amortization and transaction rules. `src/bank.js` and `src/bank.css` implement the illustrated bank screens and animation. Model tests cover full multi-house amortization, zero/debt/migration, coherent save callbacks, month-boundary manual payments, duplicate signing and payoff reload. Browser tests exercise real controls, animation, persistence, keyboard/focus, small-screen scrolling and scene isolation.
