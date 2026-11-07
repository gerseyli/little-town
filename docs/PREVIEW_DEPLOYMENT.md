# Permanent public browser preview

The user explicitly chose a public preview on 2026-11-07. The canonical deployment source is **`preview/live`**, containing the latest verified game and `.github/workflows/preview.yml`. Main remains unchanged. Repository visibility must remain unchanged; publish only the generated playable site.

## Current activation status

The web build, automatic workflow and local browser checks are prepared. **GitHub Pages activation and the public URL are not yet verified.** The user published the network configuration; the new environment reports the two domains ready/enforced and GitHub API reads now work.

Repository metadata confirms `gerseyli/little-town` is **private**, `has_pages: false`, default branch `main`. Preserve visibility. The connected integration is refused both Pages inspection and site creation with HTTP 403 **Resource not accessible by integration**. This is a GitHub permission limitation, not another environment network issue; do not ask the user to republish the network draft or create a token speculatively.

The user has been directed to `https://github.com/gerseyli/little-town/settings/pages` and asked to select **Build and deployment → Source → GitHub Actions**, saving if offered. If GitHub displays a plan/upgrade requirement, preserve visibility/billing and inspect that actual requirement before choosing an alternative. The `github-pages` deployment environment does not yet exist (GET returned 404).

Actions run `42355953665` at source `8f7b56d` passed checkout, source checks, full gameplay tests and static build/verification. It failed at `actions/configure-pages@v5` because Pages is not enabled; artifact upload/deployment were therefore skipped. Official configure-pages action documentation confirms automatic enablement requires a token with Pages/admin write; its standard GITHUB_TOKEN is insufficient for initial site creation. No new credentials have been requested.

## Finish activation

1. After the user enables Pages, recheck repository metadata with `gh api repos/gerseyli/little-town` (visibility, permissions, has_pages). Preserve visibility and existing settings.
2. Pages API GET/POST is denied to the current integration, so use the user-confirmed GitHub setting plus workflow/public HTTPS evidence unless permissions change. Do not retry the same denied activation call without a meaningful permission change. Do not change billing or repository visibility if the account's plan prevents Pages for this repository; report that specific limitation and prepare an appropriate public-build-only alternative.
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
- No gameplay source or original asset was modified for hosting. GitHub-hosted source/gameplay/static verification also passed. Final public deployment now depends only on GitHub Pages activation and a successful Pages deployment; network configuration is already applied.
