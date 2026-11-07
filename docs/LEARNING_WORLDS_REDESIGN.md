# Ta'aleem Learning Worlds redesign

## What changed

The signed-in student home (`#s-home`) has been redesigned as a responsive Learning Worlds dashboard. The sign-in, camera/microphone check, recitation engine, Alif Ba garden, progress store, existing games, reading library, Story Time, and Seerah Quest flows remain in place.

### Student dashboard

- Full-width 3D learning-world hero, rendered locally with Three.js from procedural geometry (pavilion, garden, water feature, palms, lanterns, sandstone ridges and a subtle star field).
- Responsive desktop navigation rail and mobile horizontal navigation.
- Personal greeting, level, Hijri/Gregorian date, Ta'aleem Stars, streak, completion and badge metrics.
- Daily challenge panel and activity cards.
- Seven curriculum worlds: Qur'an, Arabic, Seerah, Akhlaq, Tawheed, Hadith and Dua.
- Existing Hifz, recitation, Alif Ba, Story Time, Reading Library and Play & Learn activities are still populated from `src/lib/activities.mjs` and retain their existing handlers.
- Reduced-motion support and a low-power WebGL renderer configuration.

### Curriculum starter activities

The new curriculum hub contains two short practice prompts for each of Qur'an, Arabic, Akhlaq, Tawheed, Hadith and Dua. Correct completion is recorded in the existing progress/reward store. These are deliberately labelled starter activities: Hadith translations/references, Tawheed lesson sequence, Arabic examples, Qur'an selections and age/level mapping must be checked by the school's curriculum lead before formal assignment. The prompts are not a substitute for the approved textbooks or teacher instruction.

### Teacher Control Centre

The new staff workspace is a polished front-end shell with sections for:

1. Weekly learning plan
2. Curriculum review checklist
3. Student support planning
4. Teaching resources

**Important security/data boundary:** this repository is a static GitHub Pages application. The new staff workspace does not authenticate staff and does not read or expose individual student records. Attendance, marks, rosters, assignment distribution, student-level analytics and editing/publishing require a separate authenticated teacher service and role checks in the data layer. Do not treat the visible staff workspace as an access-control boundary.

## 3D scene notes

`src/lib/dashboard-world.mjs` builds the dashboard scene at runtime using Three.js. It contains no depictions of Prophets or Companions. It is decorative and navigational rather than a historical reconstruction. The existing Seerah Quest world remains separate and retains its source-linked episode system.

## Files changed

- `src/pages/index.astro` — redesigned signed-in dashboard, curriculum hub, teacher workspace shell, and interactions.
- `src/styles/aic.css` — responsive Learning Worlds visual system.
- `src/lib/dashboard-world.mjs` — procedural Three.js dashboard scene.
- `docs/LEARNING_WORLDS_REDESIGN.md` — this implementation and integration note.

## Local run and deployment

Use Node.js 22.19 or newer:

```bash
npm ci
npm run books
npm run seerah
npm run build
npm run preview
```

Push the complete repository to the configured GitHub repository's `main` branch. The existing GitHub Actions deployment workflow remains the deployment path. Check the Actions run before announcing the site is updated.

## Next integration phase

- Add authenticated teacher roles and a server-side teacher API before enabling live teacher records.
- Map the starter activities to the official AICWIS level-by-level schemes of work and approved textbooks.
- Add reviewed Hadith text with exact collection/reference, approved translation and review sign-off.
- Add teacher assignment workflows and student-specific activity recommendations only after role-secured backend support exists.
- Conduct device testing on school laptops/tablets, including WebGL-off fallback, keyboard navigation, touch controls and reduced-motion settings.
