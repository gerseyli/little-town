# Supplied symptom sprite sheet

Source: **Pharmacy symptom clip-art sprite sheet.rar**, uploaded 2026-11-07. `atlas.png` is the enclosed **Pharmacy symptom clip-art sprite sheet.png**, copied byte for byte with transparency preserved. Original hash is recorded in `../../source-manifest.json`.

The sheet is **1448×1086**, arranged as **4 columns × 3 rows** of **362×362** cells. `atlas.json` records the coordinates for future use without resampling or regenerating the artwork. Coordinates start at the upper-left corner.

| Row | Column 1 | Column 2 | Column 3 | Column 4 |
| --- | --- | --- | --- | --- |
| 1 | Headache | Stomachache | Feeling sick | Backache |
| 2 | Toothache | Fever | Cough | Chills |
| 3 | Runny nose | Sore throat | Sunburn | Insect bite |

The atlas retains these descriptive source labels. Active teaching phrases, recommendations and prices now live in `src/pharmacy-data.json`: the nausea picture is labelled “I have food poisoning” and the chills picture “I have the flu” in the shop.

The supplied PNG is now embedded in the standalone pharmacy shop. Individual cells use a shared SVG definition, preserving the original bytes and resolution. See `docs/PHARMACY_SHOP.md` for the implemented interaction.
