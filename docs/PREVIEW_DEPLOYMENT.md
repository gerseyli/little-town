# Permanent public browser preview

The user explicitly chose a public preview and authorized public repository/history on 2026-11-07. The canonical deployment source is **preview/live**. Main remains unchanged. The generated playable site is published at **https://gerseyli.github.io/little-town/**.

## Current activation status

Hosting is active. The user enabled GitHub Actions Pages and added the exact preview/live branch rule to the github-pages deployment environment, retaining main. Run **42356996477** at commit **68fc8d9** completed its full build, gameplay/static checks, artifact upload and deployment successfully on 2026-11-07.

The interrupted final check was completed on 2026-11-09 after the environment recovered: live HTTPS metadata reports that same commit, and `tests/hosted-preview.py` passed against the actual public site. Verified the launcher, HD assets, retained-focus Space entry, pharmacy consultation/checkout ($100 → $91) and saved 120% zoom/money after reload. No asset failures or browser errors. The bank update is being published through the same pipeline; its task/deployment result is recorded in IMPLEMENTATION_PLAN.md.

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
