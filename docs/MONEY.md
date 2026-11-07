# Player money

New games and existing saves without a valid balance start with **$100**. The wallet HUD stays at the upper left, below the badge or relocated controls; small screens reserve a row below the controls. `H` hides it with the other HUD elements. Both generated transparent assets are embedded in the standalone export, and the amount remains selectable-by-assistive-technology HTML text with polite live updates.

`src/money.js` is the shared account model. Game events use the one `playerMoney` account:

```js
playerMoney.balanceCents;  // read-only integer cents, initially 10000
playerMoney.credit(25);    // earn $25; returns the new balance in cents
playerMoney.canAfford(5);  // whether the balance covers $5
playerMoney.debit(5);      // spend $5 atomically; true on success
```

Amounts passed to these methods are non-negative dollar numbers with at most two decimal places. Invalid amounts and balance overflow throw `RangeError`. Insufficient funds return `false` from `debit`, leaving the balance unchanged. Zero is valid. Integer-cent accounting avoids accumulated fractional-dollar rounding errors. Check the result of `debit` before granting a future purchase or ride.

Successful nonzero transactions update the HUD and save immediately. The existing `little-town-worlds-v3` record now includes `moneyCents`; previous save keys remain readable. Missing, negative, fractional, nonnumeric or unsafe stored cents fall back to $100, while a saved zero remains zero. Map travel, walking, label settings and **Back to start** preserve the account. If storage is unavailable, the game still keeps its balance in memory for the current session.

The pharmacy shop now calls this account for paid checkout; spending is saved immediately and shown both inside and outside. See `PHARMACY_SHOP.md`. Existing transport behaviour is unchanged. Future events can also use the account without managing UI or storage themselves.

Validation: `node tests/money.cjs` (included in `npm test`) and `python3 tests/money-browser.py`. The latter covers save migration/reload, earnings/spending, zero, insufficient funds, blocked storage, train travel/reset and nonoverlapping HUD geometry at 1920, 701, 700, 375 and 320 pixels. Asset prompts are recorded in `assets/ui/README.md`.
