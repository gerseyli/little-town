# Money counter preview

Download **Little-Town-Money-Counter.zip** using GitHub's **Download raw file** button. Extract the ZIP, then open **Little-Town.html** in a browser. The game is fully offline and needs no server or installation.

## New in this version

- Player balance starts at **$100**, with a generated leather wallet and matching parchment number panel at the upper left.
- Balance saves with progress and survives travel and Back to start.
- Shared safe earning/spending operations are ready for future game events. No fares or rewards are added yet.
- HUD accommodates desktop/small screens and hides with H.
- Approved map artwork, moving traffic, pedestrians/directions, walking sprites and all paving fixes are preserved.

## Verification

Syntax and full Node suites pass, including money accounting, traffic, walking, paving and all 1,258 tested route cases. Chromium checks pass for existing gameplay, money save/load migration, earning/spending, zero/insufficient funds, travel/reset, storage denial and HUD non-overlap at 1920, 701, 700, 375 and 320 pixels. Desktop and small-screen screenshots were visually reviewed. The HTML in this ZIP is byte-identical to the current build.

Recovery plan: [implementation plan](../docs/IMPLEMENTATION_PLAN.md). Account integration: [money model](../docs/MONEY.md). Generated assets and prompts: [UI assets](../assets/ui/README.md).

Working branch: `preview/money-counter-20261107`. Earlier approved previews remain on their earlier branches. Main is unchanged.
