# Permanent public browser preview

The user explicitly chose a public preview and authorized public repository/history on 2026-11-07. The canonical deployment source is **preview/live**. Main remains unchanged. The generated playable site is published at **https://gerseyli.github.io/little-town/**.

## Current activation status

Hosting is active. Current published gameplay source is **3e293e7453270c86c40c21628c8c4c18649077e0**, including the pharmacy voice pilot and local-file speech correction. Pages run **42686409173** completed successfully. The actual public HTTPS version manifest confirms that source, 43 content-hashed image assets and three separately cached speech resources. The full offline HTML remains supported.

Voice validation uses the actual bundled Vosk/WASM engine, synthetic English speech through Chromium's capture pipeline, first-use recognition with networking disabled in the standalone export, and recognition in an opaque-origin Blob worker. Full Node/gameplay/static tests and pharmacy/grocery browser regressions pass. These do not establish recognition quality for student accents or physical microphones. Earlier ec53368 bank/grocery HTTPS browser checks are historical validation; the user's previously reported preview failure on their device is not claimed diagnosed or repaired.

The preferred delivery for the user is now the verified standalone [Little-Town.html](https://github.com/gerseyli/little-town/releases/download/offline-42686409466/Little-Town.html) (125.3 MB including the offline voice engine/model), published by release run **42686409466**. The actual download matches the tested local file. See VOICE_MODE.md and IMPLEMENTATION_PLAN.md for instructions, integrity and limits.

The owner enabled public-repository GitHub Actions Pages and allowed preview/live in the github-pages deployment environment, retaining main. Earlier activation issues are historical checkpoints.

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
