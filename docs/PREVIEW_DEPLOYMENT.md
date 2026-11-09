# Permanent public browser preview

The user explicitly chose a public preview and authorized public repository/history on 2026-11-07. The canonical deployment source is **preview/live**. Main remains unchanged. The generated playable site is published at **https://gerseyli.github.io/little-town/**.

## Current activation status

Hosting is active. Current gameplay deployment is **ec53368864d253f3c083973c35f19a4ab10a39ff** (Grocery store, ATM and mortgage pilots). Run **42676590783** completed build, source/gameplay/static checks, artifact upload and Pages deployment successfully on 2026-11-09. The static site contains 41 content-hashed HD image assets and the standalone offline export remains supported.

The actual public HTTPS browser check `tests/hosted-preview.py --banking --grocery` passed against that exact deployed commit: launcher/current version, HD assets, retained-focus Space entry, pharmacy checkout/reload, original bank lobby, saved ATM transfers, mortgage signing/monthly overdraft, Grocery store's 24 food catalog, shared-wallet checkout/repeat protection and saved 120% zoom/money after reload. No asset failures or JavaScript errors. Screenshot artifacts are in `/tmp/little-town-public-*.png` in the development workspace. Completion/recovery notes are in IMPLEMENTATION_PLAN.md.

The owner previously enabled public-repository GitHub Actions Pages and added the exact preview/live branch rule to github-pages, retaining main. Earlier activation and bank-only deployments are historical checkpoints; they are superseded by the verified combined deployment above.

No further GitHub/environment activation is required. Earlier 403/404/branch-rule notes in the plan are historical checkpoints, not remaining setup work.

## Future updates

Start from the latest `preview/live`, not the historical main branch. Develop/review/test changes, then advance `preview/live` with the verified result. Game/build/workflow pushes automatically trigger deployment; docs/README/AGENTS/preview-archive-only pushes are excluded so recovery notes do not redeploy the game. Once Actions succeeds, the user opens/refreshes the same stable link. Do not require ZIP downloads for ordinary previewing. Continue producing the standalone offline export when explicitly requested; `npm run build` remains supported.

Commands:

```sh
npm run check
npm test
npm run test:preview
python3 tests/preview-browser.py
```

`npm run build:preview` first builds the offline HTML, then generates `dist/preview-site/`. Only that generated directory is uploaded to Pages. No `.git`, editor source tree, archives or credentials are in the artifact.

## Browser update/cache behaviour

The stable `index.html` launcher requests `version.json` with a cache-busting timestamp and `cache: no-store`. It opens the current content-hashed game file in a full-screen iframe, keeping the stable address in the browser. All embedded HD images have content-hashed URLs, so unchanged art can be cached while code updates become visible on refresh. The online game differs from the offline HTML only in image URLs; tests verify exact code/markup and image-byte equivalence.

Saved money, zoom and progress use the same browser origin/localStorage across game filenames and deployments. Existing downloaded-file saves live under a different browser origin and are not automatically transferred. This pilot adds no cloud accounts or server storage.

## Evidence already collected

- Syntax checks and `npm run test:preview` pass: image bytes/hashes, unchanged game content, safe relative asset paths, version manifest and build-only publication.
- Chromium under a `/little-town/` path loads the launcher and external HD art, enters with Space after retained zoom-button focus, selects symptoms and pays $11 from a $100 wallet.
- A simulated next deployment loads the new game filename on refresh while preserving $89 and the chosen 120% zoom. No asset failures or browser script errors.
- No gameplay source or original asset was modified for hosting. GitHub-hosted source/gameplay/static verification also passed. Pages is public, enabled and verified.

Hosted verification: `python3 tests/hosted-preview.py https://gerseyli.github.io/little-town/ --commit <deployed-sha>`; add `--bank` to check the new bank scene once deployed. Uses the normal environment HTTPS proxy without disabling certificate verification.

## Download fallback — 2026-11-09

The user reports that the live preview does not work for them and requested a standalone HTML. No user-device diagnosis or site repair is claimed. The latest complete game is available as [Little-Town.html](https://github.com/gerseyli/little-town/releases/download/offline-42678595210/Little-Town.html), published by successful release-export run 42678595210. All 41 assets are embedded; the downloaded bytes match the locally verified build. ATM and Grocery store play pass with networking disabled. See IMPLEMENTATION_PLAN.md for digest and validation details.
