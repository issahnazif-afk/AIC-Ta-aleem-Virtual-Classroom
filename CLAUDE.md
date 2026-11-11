# Ta'aleem Virtual Classroom

An Astro site (one page, `src/pages/index.astro`) published to GitHub Pages by `.github/workflows/deploy.yml`.

## Before any visual change

Read `docs/DESIGN_SYSTEM.md` and follow it. In short:
- Use the tokens in `src/styles/system.css`. Do not add hard-coded colours.
- Forest, ivory, sage and antique gold; Lora headings, Manrope text, Amiri for Arabic, KFGQPC Hafs for Qur'an only.
- No gradients, glass, emoji icons, pill buttons, glowing effects or "AI template" card grids.
- The home shows tiles only; details appear after a tile is opened.

## Religious content

Never invent Qur'an text, hadith, translations or scholarly claims. Seerah content comes only from
`src/data/seerah/sources.json` (Ibn Kathir); run `npm run seerah` after changing it.

## Checks

`npm run build` must pass. Keep sign-in, the class log (Apps Script), the Sheikh's speech checking and the
3D games (Seerah Quest, Guardians of Light) working.
