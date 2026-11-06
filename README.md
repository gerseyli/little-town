# Little Town — source starter

This is the editable source of the current Town & Suburbs game. The source was separated into files without changing the game. Its first build matches the already delivered HTML byte for byte. The three reported path bugs remain unchanged; see docs/KNOWN_BUGS.md.

## First-time upload

1. Extract Little-Town-Source-Starter.zip.
2. Create a private GitHub repository called little-town. Initializing it with a README makes the upload controls easy to find.
3. In the repository, choose Add file > Upload files.
4. Open the extracted little-town folder and drag its contents into the upload area. Upload the files and folders inside it, not the ZIP or an extra enclosing folder. package.json and AGENTS.md should appear at the repository's top level.
5. Save/commit the upload with a message such as Import current Little Town source.
6. In ChatGPT/Codex Cloud, create an environment connected to that repository, review its setup, and publish the environment. Publishing this environment prepares the coding workspace; it does not publish the game as a public website.

## Commands

Requires Node.js 18 or newer. There are no external package dependencies to install.

```sh
npm run check
npm test
npm run build
```

Open dist/Little-Town.html to play. It is a single offline file with all seven images embedded. dist/index.html is the same game for supported preview tools.

## Source layout

| Path | Purpose |
| --- | --- |
| src/index.html | Page and overlay markup |
| src/styles.css | Styling |
| src/game.js | Game engine and interaction logic |
| src/phrasebook.js | Illustrated glossary |
| src/maps.json | Map geometry, names, routes and stops |
| assets/ | Seven WebP image assets |
| scripts/build.mjs | Standalone HTML builder |
| tests/smoke.cjs | Baseline game checks |
| docs/ | Project brief, pending bugs and baseline fingerprint |
| AGENTS.md | Instructions for coding agents |

## Validation limits

The existing checks cover general reachability, some collision rules, grammar labels, glossary coverage and transport round trips. They do not prove that every visible connection works. Known issues are deliberately recorded for later focused repairs.

## First Codex task

Read AGENTS.md, README.md, docs/PROJECT_BRIEF.md and docs/KNOWN_BUGS.md. Run npm run check and npm test. Compare dist/Little-Town.html with docs/BASELINE.json. Confirm the project is ready for future work. Do not fix the deferred bugs or change gameplay in this setup task.
