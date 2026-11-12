# Ta'aleem Virtual Classroom

An Astro site (one page, `src/pages/index.astro`) published to GitHub Pages by `.github/workflows/deploy.yml`.

## Before any visual change

Read `docs/DESIGN_SYSTEM.md` and follow it. In short:
- Use the tokens in `src/styles/system.css`. Do not add hard-coded colours.
- Forest, ivory, sage and antique gold; Lora headings, Manrope text, Amiri for Arabic, KFGQPC Hafs for Qur'an only.
- Two styles: the calm standard style (Levels 3 and 4, grown-up screens) and the young learners' style
  (Levels 1 and 2: bright picture tiles, sound and bounce). Keep both; see the design guide.
- No glass, emoji icons, glowing effects or "AI template" card grids in either style.
- The home shows tiles only; details appear after a tile is opened.

## Religious content

Never invent Qur'an text, hadith, translations or scholarly claims. Seerah content comes only from
`src/data/seerah/sources.json` (Ibn Kathir); run `npm run seerah` after changing it.
The Sheikh's conversation library (`src/lib/sheikh-library.mjs`) only quotes those checked sources word for word;
the AI on the class server can only choose ids from it, never write text.

## Checks

`npm run build` must pass. Keep sign-in, the class log (Apps Script), the Sheikh's speech checking and the
3D games (Seerah Quest, Guardians of Light) working.
