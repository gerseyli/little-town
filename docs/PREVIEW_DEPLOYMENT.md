# Permanent public browser preview

The user explicitly chose a public preview on 2026-11-07. The canonical deployment source is **`preview/live`**, containing the latest verified game and `.github/workflows/preview.yml`. Main remains unchanged. Repository visibility must remain unchanged; publish only the generated playable site.

## Current activation status

The web build, automatic workflow and local browser checks are prepared. **GitHub Pages activation and the public URL are not yet verified.** The environment currently denies CONNECT to `api.github.com`. A network draft adding `api.github.com` and `gerseyli.github.io` was saved successfully in the **little-town** environment. The user is being guided through **Edit environment → Publish**; saving a draft alone has not applied its domains to the running environment.

After publication/reconnection, refresh environment status and retry the specific GitHub API operation. Reuse injected GitHub authentication; do not extract credentials or request tokens just because access was blocked by network policy.

## Finish activation

1. Read repository metadata with `gh api repos/gerseyli/little-town` (visibility, permissions, has_pages). Preserve visibility and existing settings.
2. Inspect `gh api repos/gerseyli/little-town/pages`. If no site exists, create a workflow-based Pages site with `POST /repos/gerseyli/little-town/pages` and JSON `{"build_type":"workflow"}`. If a site exists, review its settings before updating its build type. Do not change billing or repository visibility if the account's plan prevents Pages for this repository; report that specific limitation and prepare an appropriate public-build-only alternative.
3. Verify the `github-pages` deployment environment permits the `preview/live` branch. Preserve existing unrelated environment restrictions. The workflow deploys only from that branch, never from pull requests.
4. Inspect the latest **Publish game preview** Actions run for `preview/live`. If the first run failed because Pages was not enabled, rerun it after activation. The workflow runs syntax/gameplay checks, builds/verifies the web artifact, then uses official GitHub Pages deployment actions.
5. Use the Pages API's actual `html_url` as the stable user link. The expected repository-based URL is `https://gerseyli.github.io/little-town/`, but do not describe it as live until HTTPS and the current manifest/game/assets are verified.
6. Verify `version.json` reports the deployed source commit, and test the actual hosted game. Update this status section and `docs/IMPLEMENTATION_PLAN.md` with confirmed results.

## Future updates

Start from the latest `preview/live`, not the historical main branch. Develop/review/test changes, then advance `preview/live` with the verified result. Its push automatically triggers deployment. Once Actions succeeds, the user opens/refreshes the same stable link. Do not require ZIP downloads for ordinary previewing. Continue producing the standalone offline export when explicitly requested; `npm run build` remains supported.

Commands:

```sh
npm run check
npm test
npm run test:preview
python3 tests/preview-browser.py
```

`npm run build:preview` first builds the offline HTML, then generates `dist/preview-site/`. Only that generated directory is uploaded to Pages. No `.git`, editor source tree, archives or credentials are in the artifact.

## Browser update/cache behaviour

The stable `index.html` launcher requests `version.json` with a cache-busting timestamp and `cache: no-store`. It opens the current content-hashed game file in a full-screen iframe, keeping the stable address in the browser. All 27 HD images have content-hashed URLs, so unchanged art can be cached while code updates become visible on refresh. The online game differs from the offline HTML only in image URLs; tests verify exact code/markup and image-byte equivalence.

Saved money, zoom and progress use the same browser origin/localStorage across game filenames and deployments. Existing downloaded-file saves live under a different browser origin and are not automatically transferred. This pilot adds no cloud accounts or server storage.

## Evidence already collected

- Syntax checks and `npm run test:preview` pass: image bytes/hashes, unchanged game content, safe relative asset paths, version manifest and build-only publication.
- Chromium under a `/little-town/` path loads the launcher and external HD art, enters with Space after retained zoom-button focus, selects symptoms and pays $11 from a $100 wallet.
- A simulated next deployment loads the new game filename on refresh while preserving $89 and the chosen 120% zoom. No asset failures or browser script errors.
- No gameplay source or original asset was modified for hosting. Final public deployment remains dependent on applying the saved network draft and configuring GitHub Pages.
