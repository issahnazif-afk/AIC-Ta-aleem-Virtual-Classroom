# Al-Huda Islamic Weekend School · Ta'aleem Virtual Classroom

![Al-Huda Islamic Centre](public/logo-160.png)

The Ta'aleem virtual classroom of Al-Huda Islamic Weekend School (Al-Huda Islamic Centre). A desktop classroom where the
automated Sheikh from the Qa-af Wal Quran-ul-Majeed app listens to a student
recite, with the student's camera on. Two kinds of session:

- **Hifz test.** The Sheikh recites the opening of a random ayah; the student carries on from memory while the
  words stay hidden and appear only as they are recited correctly. The Sheikh prompts after a silence and stops
  the student at the end of the passage. If the student looks away from the screen or leaves the camera, the
  Sheikh pauses the test.
- **Mujawwadah (reading from the mushaf).** The Madani mushaf page is open beside the video; each word turns green
  as it is read correctly, and mistakes are marked on the page.

Every finished session is added as one row to its class's Google Sheet in a shared Google Drive folder, with the
student's login photo. Students see their own report; they never see the log.

Hosted on GitHub Pages, with no server of its own. Built with [Astro](https://astro.build).

## Screens

1. **Sign in** with full name, class code and class password (checked against the Classes list in Google Sheets).
2. **Camera and microphone check**: camera preview, microphone level, speaker test, a face check that records
   the student's normal position, and the login snapshot.
3. **Session setup**: Hifz test or Mujawwadah, level, surah and ayah range, number of questions, Sheikh's voice.
4. **Classroom**: the Sheikh and the student's camera side by side, the Sheikh's notes, and the mushaf page.
5. **Report**: time, mistakes, looks away, most observed mistakes, the Sheikh's review, ayah by ayah, and
   confirmation that the session reached the class log.

The interface design these screens follow is on the design canvas *Al-Huda Islamic Weekend School · Ta'aleem Virtual Classroom*.

## What the Sheikh checks

The speech engine hears the letters of each word but not its harakat, so the Sheikh checks memorisation and
word accuracy:

| In the report | Meaning |
|---|---|
| Wrong word | A different word was said in place of the expected one |
| Forgotten word (Sheikh prompted) | The student stopped, or got the word wrong three times, and the Sheikh said it |
| Hint used | The student asked for the next word |
| Unclear word | The word was not heard clearly (counted as a mistake only at Ijazah level) |
| Went back over words | The student repeated words already recited |
| Looked away | Hifz tests only: the student turned away, looked down or left the camera |

Levels change how strictly words are matched, how long the Sheikh waits before helping, and whether hints are
allowed. **Tajweed (harakat, madd, ghunnah, idgham and so on) is not checked yet**: it needs a speech model
trained to hear them.

The speech engine is the Qāf model (`qaaf-asr`) from the main app when it has been published as the GitHub
release `qaaf-asr-model` in `issahnazif-afk/Qa-af-Wal-Quran-ul-Majeed`. It runs on the student's computer.
Until then the browser's own speech recognition is used (Chrome and Edge send the audio to Google's speech
service; nothing is stored by this site).

## Putting it online

1. Create a GitHub repository called **AIC-Ta-aleem-Virtual-Classroom** and push this folder to `main`.
   (Another name works too: change `base` in `site.config.mjs` to `'/<name>/'`.)
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
3. Set up the class log: follow [`apps-script/README.md`](apps-script/README.md). It ends with adding the
   repository variable `CLASS_LOG_URL`.
4. Run the **Build and deploy** workflow (Actions tab), or push any change. The site appears at
   `https://issahnazif-afk.github.io/AIC-Ta-aleem-Virtual-Classroom/`.

Without `CLASS_LOG_URL` the classroom runs in **demo mode**: any class code works and sessions are not saved.

## Running it on your computer

```bash
npm install
npm run dev          # builds the data, then opens http://localhost:4321/AIC-Ta-aleem-Virtual-Classroom/
```

The look-away check needs the face model. The deploy workflow downloads it; locally, download
[face_landmarker.task](https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task)
into `public/models/`. To try the Qāf speech model locally, put `qaaf-asr.onnx`, `features.json` and
`vocab.json` in `public/models/` as well.

Troubleshooting the face check: add `?debug=1` to the address and read `window.__qcGaze` in the browser console
(frames analysed, faces found, current measurements). `?gaze=cpu` runs the face model without the GPU.

## Privacy

- Video and audio are never recorded or uploaded. The face check runs in the browser.
- One small photo per session (about 15 KB) is saved to the class's snapshots folder in your Google Drive.
- The class password is checked by your Apps Script; it is not stored in the site.

## Project layout

```
site.config.mjs              settings: site address, class log URL, Sheikh's voices
scripts/build-data.mjs       builds public/data from sources/ (works offline)
scripts/copy-vendor.mjs      copies the face-check runtime into public/mediapipe
sources/                     Tanzil text, QUL mushaf layout, surah names (never edited)
src/pages/index.astro        the five screens
src/styles/classroom.css     classroom styles (colours from global.css, as in the main app)
src/lib/engine.mjs           the Sheikh: questions, listening, prompting, marking (from the Hifz test page)
src/lib/recite.mjs, follow.mjs, mushaf.mjs, asr-local.mjs   shared with the main app, unchanged
src/lib/gaze.mjs             look-away check (MediaPipe Face Landmarker)
src/lib/media.mjs            camera, microphone level, snapshot
src/lib/session.mjs          levels, mistake tally, grade, the Sheikh's review
src/lib/classlog.mjs         sending sessions to the class log, with retry when offline
apps-script/                 the Google Apps Script that writes the class sheets
.github/workflows/deploy.yml build and publish to GitHub Pages
```

See `SOURCES.md` for attribution and licences.
