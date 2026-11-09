# Pharmacy interior originals

Original images supplied in Downloads.rar on 2026-11-07, copied byte for byte. Preserve this artwork unchanged. Files:

- `background.png` — pharmacy counter and shelving, 1672×941.
- `chemist-neutral.png` — first supplied portrait, 1129×1393, transparent.
- `chemist-displeased.png` — second portrait; retained for later interaction.
- `chemist-smiling.png` — third portrait; retained for later interaction.

The builder embeds the background and neutral portrait. The entrance requires both. No replacement artwork or placeholder is displayed in the game. Later portraits are retained as source assets; they do not switch expressions in this pilot.

If originals have another file type, use that original extension and update the file mapping in `scripts/build.mjs`. Do not merely rename a JPEG to PNG.

The archive also contained a bank lobby, retained unchanged as `../bank/background.png` and now displayed on bank entry. All five original file hashes are recorded in `../source-manifest.json`.

A later upload supplied a 12-picture transparent symptom sheet. Original art and cell metadata are in [`symptoms/`](symptoms/README.md); it is used in the consultation and shop described in `docs/PHARMACY_SHOP.md`.
