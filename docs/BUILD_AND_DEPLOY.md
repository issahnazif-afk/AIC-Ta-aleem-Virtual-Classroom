# Ta'aleem · Build, test and deployment guide

This guide is for the repository owner or a school administrator deploying the existing Astro application.

## 1. What is in this repository

- **Astro static site** (`src/pages/index.astro`) with student sign-in, classroom, recitation, lessons, games, stories, library, achievements and reports.
- **Three.js Seerah Quest** (`src/lib/seerah/`) with a browser-rendered 3D world, two historical episodes, exploration tasks, narration and quizzes.
- **Source register** (`src/data/seerah/sources.json`) and editorial record (`docs/seerah-source-record.md`).
- **Google Apps Script integration** (`apps-script/`) for class-session logs and student progress.
- **GitHub Pages workflow** (`.github/workflows/deploy.yml`) for building and deploying the static site.

The project is not a blank starter. Keep its existing architecture and content modules when adding features.

## 2. Requirements

- Node.js **22.19 or later** (Node 22 LTS recommended).
- npm 10 or later.
- Git.
- A modern desktop browser with WebGL for the 3D Seerah environment. Chrome or Edge is the recommended browser for the recitation experience.

Check versions:

```bash
node --version
npm --version
```

## 3. Install and run locally

From the repository root:

```bash
npm ci
npm run dev
```

Astro prints the local development address, normally `http://localhost:4321/`. The live site is https://taaleem.ca (GitHub Pages with a custom domain, see `public/CNAME`).

To build the production site:

```bash
npm run build
npm run preview
```

The production files are written to `dist/`.

Other repository checks:

```bash
npm run books
npm run seerah
```

- `npm run books` runs the story and reading-library content checks.
- `npm run seerah` checks Seerah episode references against the source register. It is a consistency check only; it does not authenticate hadith chains or certify historical claims.

## 4. Configure GitHub Pages

The deployment workflow is already present at `.github/workflows/deploy.yml`.

1. Push the project to the GitHub repository named `AIC-Ta-aleem-Virtual-Classroom`.
2. In GitHub, open **Settings → Pages** and select **GitHub Actions** as the build and deployment source.
3. Open **Settings → Actions → General** and ensure the workflow has permission to deploy Pages. The workflow declares `contents: read`, `pages: write`, and `id-token: write`.
4. Push to the `main` branch or run **Actions → Build and deploy → Run workflow**.
5. When the workflow succeeds, the site is published at the URL configured in `site.config.mjs`.

### Repository name or URL changes

Edit `site.config.mjs` if the GitHub username, repository name, or Pages URL changes:

- `site`: the GitHub Pages origin, for example `https://YOUR-USER.github.io`.
- `base`: the repository path, for example `/YOUR-REPOSITORY/`.

Keep the trailing slash in `base`. The app's asset and route helpers use this value.

## 5. Optional class-session logging

The app can work without a class-log endpoint, but sessions will not be written to the school's Google Sheets until the Apps Script web app is deployed.

1. Follow `apps-script/README.md` to create the spreadsheet structure and deploy the Apps Script as a web app.
2. Copy the deployed web-app URL.
3. In GitHub, open **Settings → Secrets and variables → Actions → Variables**.
4. Add a repository variable named `CLASS_LOG_URL` with that URL.
5. Run the deployment workflow again.

Do not commit private deployment credentials, passwords, API keys, student records, or `.env` files to the repository.

## 6. Speech and face-check assets

The workflow attempts to retrieve the optional Qāf ASR model from the configured companion repository. If the release is unavailable, the app falls back to browser speech recognition.

The workflow also downloads the MediaPipe face-landmarker model. The `npm run build` data step copies the MediaPipe runtime from the installed npm package into `public/mediapipe/`. If that copy step fails, check that `npm ci` completed successfully and that `@mediapipe/tasks-vision` is present in `node_modules`.

The workflow can generate voice assets and narration clips. The first narration generation may take a long time (the workflow comments estimate roughly 30–40 minutes); later deployments use the GitHub Actions cache. These voice-generation steps are configured to continue if generation fails, allowing browser voice fallback.

## 7. Seerah content workflow

The current Seerah Quest contains two episodes:

1. The Secret of Zamzam.
2. The Year of the Elephant.

The 3D environment is in `src/lib/seerah/world.mjs`; episode steps and missions are in `src/lib/seerah/episodes.mjs`; the player is in `src/lib/seerah/quest.mjs`; the passage register is in `src/data/seerah/sources.json`.

When adding an episode:

1. Add the exact source passage and edition/page metadata to the source register.
2. Record its classification and review status in `docs/seerah-source-record.md`.
3. Have a qualified reviewer check the Arabic transcription, translation, context, and historical use.
4. Add the episode using source IDs from the register. Historical narration must not use passages marked `reported` or `excluded`.
5. Add age-appropriate learning objectives, exploration tasks, knowledge checks and a reflection.
6. Run `npm run seerah` and manually play the full episode on desktop and mobile.
7. Do not depict Prophets. Keep the existing symbolic/environmental approach to people and sacred moments.

**Important:** “Established” in the project source register is an editorial category used by this application. It must not be presented to students as equivalent to a formal hadith grading or independent scholarly authentication. At present, the registered passages are marked `pending` for review. The application should remain clearly labelled as teacher-review preview content until that review is completed.

## 8. Where to extend the learning experience

- Add or adjust classroom activity cards in `src/lib/activities.mjs`.
- Add question-bank content in `src/data/question-bank.json` and review the question-generation scripts.
- Add Seerah episodes in `src/lib/seerah/episodes.mjs` only after the source review described above.
- Add student-facing visual styles in `src/styles/aic.css`, `src/styles/classroom.css` and `src/styles/global.css`.
- Keep student data and teacher-only functions separate. Students should not be able to browse other students' reports or class logs.

## 9. Pre-deployment checklist

- [ ] `npm ci` completes without errors.
- [ ] `npm run books` passes.
- [ ] `npm run seerah` reports no reference/classification errors.
- [ ] `npm run build` completes and creates `dist/`.
- [ ] Sign-in, sign-out and level-based activity visibility work.
- [ ] Camera/microphone permissions and fallback behavior are tested.
- [ ] Hifz and reading sessions are tested with real student recitation.
- [ ] Seerah Quest runs on a WebGL-capable computer and has a usable low-quality setting.
- [ ] Teacher-reviewed content is distinguished from preview content.
- [ ] The class-log URL is configured only if the school has deployed the Apps Script.
- [ ] No secrets, student data or private credentials are committed.
