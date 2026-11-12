# Ta'aleem Virtual Classroom

An Astro site published to GitHub Pages by `.github/workflows/deploy.yml`:
- the children's classroom: one page, `src/pages/index.astro`;
- the adults' Quran Library at /quran/: `src/pages/quran/` and `src/quran/` (layout, components, styles, the libs
  that differ from the classroom's), its data built by `scripts/quran/build-data.mjs` into `public/quran/data/`.
  Every page needs an adult account (`src/quran/lib/account.mjs`, the Adults tab of `apps-script/Code.gs`), except
  sign-in, About and Privacy (`open` on the layout). Links there go through `src/quran/lib/url.mjs` (`u()` adds
  /quran/; models, audio and mediapipe stay shared at the root). The speech tracker, its worker and the recitation
  matching (`src/lib/tracker.mjs`, `qaaf-worker.mjs`, `track-recognition.mjs`, `recite.mjs`, `features.mjs`)
  are shared by both: a fix there reaches children and adults.

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
the on-device model (src/lib/sheikh-local.mjs) and the optional AI on the class server can only choose ids from it,
never write text. Run `node scripts/sheikh/try.mjs` after changing the library or the matching.

## Checks

`npm run build` must pass. Keep sign-in (children and adults), the class log (Apps Script), the Sheikh's speech checking and the
3D games (Seerah Quest, Guardians of Light) working.
