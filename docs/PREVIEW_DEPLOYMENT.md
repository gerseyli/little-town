# Permanent public browser preview

The user explicitly chose a public preview on 2026-11-07. The canonical deployment source is **`preview/live`**, containing the latest verified game and `.github/workflows/preview.yml`. Main remains unchanged. The user subsequently explicitly authorized making the entire repository and its history public to use free GitHub Pages; that one-time transition is pending the owner UI. Publish only the generated playable site as the Pages artifact.

## Current activation status

The network configuration is applied and GitHub API access works. The user completed the approved public visibility change and enabled Pages with GitHub Actions. Verified metadata: repository **public**, `has_pages: true`; Pages uses `build_type: workflow`, HTTPS enforced, public URL **https://gerseyli.github.io/little-town/**. The URL still returns 404 because no deployment has completed yet.

The build and artifact upload passed on run `42356686612` at commit `80f586d`. The deploy job was rejected before running because GitHub's newly created `github-pages` environment permits only **main** (policy 65831481). Exact annotation: **Branch "preview/live" is not allowed to deploy to github-pages due to environment protection rules.**

Attempting to add the narrow `preview/live` branch rule with the integration returned HTTP403 Resource not accessible by integration. The user is being guided to **Settings → Environments → github-pages → Deployment branches and tags → add Branch rule preview/live**, preserving the existing main rule. No new environment network publication, token, paid upgrade or visibility change is needed. Complete deployment and public HTTPS verification after that owner setting is saved.

## Finish activation

1. Confirm `GET /repos/gerseyli/little-town/environments/github-pages/deployment-branch-policies` includes the exact `preview/live` branch rule.
2. Check the latest preview workflow. A workflow/config change may already have queued a fresh run. If the latest run failed before the rule changed, rerun failed jobs; if the integration cannot rerun, an intentional empty commit on preview/live can trigger the existing verified pipeline.
3. Follow build/upload/deploy to success. Inspect deployment status/output and the Pages API's actual `html_url`.
4. Fetch the public launcher and `version.json`, check deployed source/game hash, and exercise the hosted game/assets. Do not describe the URL as playable while it still returns 404.
5. Update this status and `docs/IMPLEMENTATION_PLAN.md` with confirmed deployment and HTTPS/browser evidence.

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

The stable `index.html` launcher requests `version.json` with a cache-busting timestamp and `cache: no-store`. It opens the current content-hashed game file in a full-screen iframe, keeping the stable address in the browser. All 27 HD images have content-hashed URLs, so unchanged art can be cached while code updates become visible on refresh. The online game differs from the offline HTML only in image URLs; tests verify exact code/markup and image-byte equivalence.

Saved money, zoom and progress use the same browser origin/localStorage across game filenames and deployments. Existing downloaded-file saves live under a different browser origin and are not automatically transferred. This pilot adds no cloud accounts or server storage.

## Evidence already collected

- Syntax checks and `npm run test:preview` pass: image bytes/hashes, unchanged game content, safe relative asset paths, version manifest and build-only publication.
- Chromium under a `/little-town/` path loads the launcher and external HD art, enters with Space after retained zoom-button focus, selects symptoms and pays $11 from a $100 wallet.
- A simulated next deployment loads the new game filename on refresh while preserving $89 and the chosen 120% zoom. No asset failures or browser script errors.
- No gameplay source or original asset was modified for hosting. GitHub-hosted source/gameplay/static verification also passed. Pages is now public and enabled; final deployment depends on allowing preview/live in the github-pages environment and verifying deployment/HTTPS.
