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

0. **Classroom** (after signing in): one card per activity: **Hifz test**, **Mujawwadah** and **Alif Ba**.
   Hifz test and Mujawwadah go on to the camera check and set-up below; Alif Ba opens the Jannah Garden with its
   lessons and games. To add an activity later, add an entry to `src/lib/activities.mjs`.
1. **Sign in or create an account.** Each student creates their own username and password once, choosing their
   level (Level 1–4) and entering that level's class password from the teacher. After that they sign in with
   their username and password.
2. **Camera and microphone check**: camera preview, microphone level, speaker test, a face check that records
   the student's normal position, and the login snapshot.
3. **Set up**: level, surah and ayah range, number of questions (Hifz test), Sheikh's voice.
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

## How quickly the words appear

The words a student recites appear as soon as the speech engine hears them. To keep that fast:

- **On-device listening (Chrome).** On the camera check, *Fast listening* shows whether Chrome can recognise
  Arabic on the computer itself. If it can, the Arabic speech pack is downloaded once when the student presses
  Continue, and from then on recognition happens on the computer, with no round trip to a server.
  Otherwise the browser's online recognition is used.
- **Expected words.** The recogniser is told the next words of the passage (Chrome's contextual biasing), so it
  settles on Quranic words sooner and mishears them less.
- **No animation delay.** Each word is shown the instant it is matched.
- **The Qāf model**, when published from the main app, now decodes in short pieces (up to 6 s, every 0.15 s)
  so it keeps pace in long ayahs.

Use **Chrome** on Windows or macOS for the fastest tracking.

## Alif Ba: the Jannah Garden and its 18 lessons

After choosing **Alif Ba** in the Classroom, students arrive in their **Jannah Garden**: 18 plots, one for each
lesson of the school's booklet *Alif Ba, Your Road to Reading Qur'an Al-Kerim*. A plot shows a seed, a sprout while
the lesson is being learned, and a date palm once it is grown (from the hadith of the date palm planted in Paradise
for *SubhanAllahi wa bihamdihi*, At-Tirmidhi).

Every lesson has a page to learn from and a game. On the page, the student taps a card and the Sheikh says it.

| # | Lesson | The page | The game |
|---|---|---|---|
| 1 | The letters and their names | The 28 letters | Noor Lanterns |
| 2 | Huruf Muqatta'at | The 14 openings, recited | Mosaic Maker: hear an opening, find it |
| 3 | Writing the letters | Every letter alone, at the beginning, middle and end | Mosaic Maker: which letter is this shape? |
| 4 | Harakat | Every letter with fat-ha, kes-ra, dom-ma | Rain of Mercy |
| 5 | Sukun, shadda, tanween | Every letter with sukun, shadda and the three tanween | Rain of Mercy |
| 6 | The rules of Madd | Tabi'i, Muttasil, Munfasil, Lazim, 'Arid, Leen, with Qur'an examples | Date Baskets |
| 7 | Madd letters | Every letter with alif, ya and waw madd | Rain of Mercy |
| 8 | Speeds of recitation | Tahqeeq, Tadweer, Hadr: how long each Madd and ghunnah is held | Mosaic Maker |
| 9 | Special pronunciations | The pronoun ha, long and short; the small upright alif | Date Baskets |
| 10 | Lafzatullah | The Name of Allah, heavy and light | Date Baskets |
| 11 | The rule of Ra | Heavy and light Ra | Date Baskets |
| 12 | Stopping | Words as written and as read when stopping | Mosaic Maker |
| 13–16 | Idgham, Iqlab, Izhar, Ikhfa | Nun with sukun and tanween, with Qur'an examples | Date Baskets (the baskets build up lesson by lesson) |
| 17 | Supplications in Salat | Subhanaka, At-Tahiyyat, the Salat Ibrahimiyya, Rabbana, Du'a al-Qunut | String of Pearls |
| 18 | Short surahs | Al-Fatihah and Al-Fil to An-Nas | Recite to the Sheikh (a real Mujawwadah session) |

**The games**, all in the night masjid courtyard:

- **Noor Lanterns**: the Sheikh says a letter; the student lights its lantern. From Level 2, every third round the
  student says the letter to the Sheikh (its sound or its name).
- **Rain of Mercy**: the Sheikh says a sound; the student catches its raindrop before it reaches the garden, where a
  flower blooms.
- **Mosaic Maker**: every right answer lays a tile of an eight-pointed star, gold if right the first time.
- **Date Baskets**: each date carries a Qur'an example; the student puts it in the basket of its rule, and can hear
  the ayah.
- **String of Pearls**: the lines of a supplication, shuffled; the student strings them in order.

| | Level 1 (4–6) | Level 2 (7–8) | Level 3 (8–10) | Level 4 (11–16) |
|---|---|---|---|---|
| Choices | 3, letters that look different | 4 | 6, look-alikes | 8, look-alikes |
| Rounds | 8 | 10 | 12 | 14 |
| Raindrops fall in | 11 s | 9 s | 7 s | 5.5 s |
| Lantern timer | none | none | 25 s | 15 s |
| Saying the letter | no | yes | yes | yes |
| Score, streak, best | no | no | yes | yes |

**How a palm grows.** Lesson 1: when all 28 letters are known (each lit right the first time on two rounds).
Lesson 18: when three short surahs have been recited to the Sheikh with at least 70% of words right first time.
Every other lesson: when its game is won with 80% right first time. Progress is saved in the student's row of the
admin sheet (*Alif Ba progress*), so it follows them to any computer, and every game is added to the **Games** tab
of their class's session log.

**Qur'an examples** (Lessons 2, 6, 9–11, 13–16 and Rabbana in 17) are copied word for word from the Tanzil text by
`scripts/lessons/examples.py`, which stops if an example is not found in the ayah it names; they play Sheikh
Husary's (or the chosen reciter's) recitation of that ayah, so tajweed is always heard from a real reciter. To add an
example, add it to the list in that script and run `python scripts/lessons/examples.py`.

**Supplications** other than Rabbana are written out in `src/lib/lessons.mjs`. Please have a teacher read them
through once; a teacher can also record them (see below).

Sound follows the school's guidance: a soft night breeze and a fountain (made in the browser, no music), a warm
chime for a right answer, praise in the student's gender, and anasheed only at milestones. To add a nasheed for
the moment a palm grows, upload it as `public/audio/nasheed/milestone.mp3`. There is a mute button on every game.

### How the Sheikh reads the letters

On the letter pages a drop-down chooses how the Sheikh says each letter. It is remembered on that computer.

- **Letter sounds** (the default): the letter with a fat-ha, *ba, ta, tha*, as the booklet teaches the sounds.
- **Pure sound, with sukun**: *ab, at, ath*, the letter held on its own point of articulation.
- **Letter names**: *Alif, Ba, Ta*.

### The Sheikh's voice for letters and syllables

So the Sheikh is heard on every computer (Chrome on Windows has no Arabic voice of its own), every letter sound,
name and syllable has a clip in `public/audio/voice/`: 28 letters × (sound, pure sound, name, kes-ra, dom-ma, the
three tanween, the three madd, shadda), and the Sheikh's phrases. They are made with an open neural Arabic voice
(Piper *Kareem*) by `scripts/voice/make_voice.py`, from hand-checked phonemes rather than from text, and each letter
is spoken inside a carrier phrase and cut out, so it is articulated as in real speech.

They are clear, but they are a computer voice, and the hardest letters (ع غ ص ض ط ظ ق) are where a teacher is
better. **A teacher's recording always replaces a clip**: record it and upload it to `public/audio/letters/` with the
clip's file name. The names follow one pattern:

| Clip | Says | Example |
|---|---|---|
| `s-<letter>-a.mp3` | the sound with fat-ha | `s-ba-a.mp3` بَ |
| `s-<letter>-i.mp3`, `s-<letter>-u.mp3` | with kes-ra, dom-ma | `s-ba-i.mp3` بِ |
| `s-<letter>-sk.mp3` | the pure sound, with sukun | `s-ba-sk.mp3` أَبْ |
| `n-<letter>.mp3` | the letter's name | `n-ba.mp3` بَاء |
| `s-<letter>-an/in/un.mp3` | tanween | `s-ba-an.mp3` بًا |
| `s-<letter>-aa/ii/uu.mp3` | madd | `s-ba-aa.mp3` بَا |
| `s-<letter>-sh.mp3` | shadda | `s-ba-sh.mp3` أَبَّ |

`<letter>` is one of: alif, ba, ta, tha, jim, ha-hollow (ح), kha, dal, dhal, ra, zay, sin, shin, sad, dad,
ta-heavy (ط), dha-heavy (ظ), ayn, ghayn, fa, qaf, kaf, lam, mim, nun, ha (ه), waw, ya. Start with the 28
`s-<letter>-a.mp3` sounds: those are what the youngest students hear most.

### Page colour

Mujawwadah, the Hifz test and every Alif Ba page have a **Page colour** choice: cream (the default), white, sepia,
soft green, or night. It is remembered on that computer.

## The Sheikh's voice and praise

The Sheikh speaks to each student in their own gender, chosen when they create their account:
أَحْسَنْتَ (*Ahsanta*) to a boy and أَحْسَنْتِ (*Ahsanti*) to a girl, مُمْتَاز / مُمْتَازَة (*Mumtaaz / Mumtaaza*),
جَيِّدٌ جِدًّا (*Jayyid jiddan*) for both, and every instruction (اقرأ / اقرئي, تابع / تابعي, …) the same way.
After each passage he praises the student: *Mumtaaz(a)* when every word was right first time, *Jayyid jiddan* at
85% and above, otherwise *Ahsanta / Ahsanti*. The praise also appears at the top of the report.

**For the calmest, most natural voice, record it.** A teacher with a gentle voice records each phrase below
(phone voice-memo is fine: quiet room, unhurried, about a hand's width from the mouth), saves it as MP3 with exactly
the file name shown, and uploads it to `public/audio/sheikh/` in this repository. Any phrase that has a recording is
played from it; the rest use the clips made for them in `public/audio/voice/` (see *The Sheikh's voice for letters
and syllables* above). You can record some now and the rest later.

| File | Arabic | Meaning |
|---|---|---|
| `ahsanta.mp3` | أَحْسَنْتَ | Well done. |
| `ahsanti.mp3` | أَحْسَنْتِ | Well done. |
| `mumtaz.mp3` | مُمْتَاز | Excellent. |
| `mumtazah.mp3` | مُمْتَازَة | Excellent. |
| `jayyid-jiddan.mp3` | جَيِّدٌ جِدًّا | Very good. |
| `mashaallah.mp3` | مَا شَاءَ ٱللَّه | Masha'Allah. |
| `barakallahu-fik.mp3` | بَارَكَ ٱللَّهُ فِيكَ | May Allah bless you. |
| `barakallahu-fiki.mp3` | بَارَكَ ٱللَّهُ فِيكِ | May Allah bless you. |
| `iqra-min.mp3` | ٱقْرَأْ مِنْ قَوْلِهِ تَعَالَى | Recite from where Allah says: |
| `iqrai-min.mp3` | ٱقْرَئِي مِنْ قَوْلِهِ تَعَالَى | Recite from where Allah says: |
| `tafaddal-iqra.mp3` | تَفَضَّلْ، ٱقْرَأْ | Go ahead, recite. |
| `tafaddali-iqrai.mp3` | تَفَضَّلِي، ٱقْرَئِي | Go ahead, recite. |
| `iqra.mp3` | ٱقْرَأْ | Read. |
| `iqrai.mp3` | ٱقْرَئِي | Read. |
| `tabi.mp3` | تَابِعْ | Carry on. |
| `tabii.mp3` | تَابِعِي | Carry on. |
| `intabih.mp3` | ٱنْتَبِهْ | Take care, that is not right. |
| `intabihi.mp3` | ٱنْتَبِهِي | Take care, that is not right. |
| `aid.mp3` | أَعِدْ | Try that word again. |
| `aidi.mp3` | أَعِيدِي | Try that word again. |
| `istami.mp3` | ٱسْتَمِعْ | Listen. |
| `istamii.mp3` | ٱسْتَمِعِي | Listen. |
| `unzur.mp3` | ٱنْظُرْ إِلَيَّ | Look at the screen. |
| `unzuri.mp3` | ٱنْظُرِي إِلَيَّ | Look at the screen. |
| `hasbuka.mp3` | حَسْبُكَ | That is enough. |
| `hasbuki.mp3` | حَسْبُكِ | That is enough. |
| `raji.mp3` | رَاجِعْ هَذَا ٱلْمَوْضِعَ | Revise this passage. |
| `rajii.mp3` | رَاجِعِي هَذَا ٱلْمَوْضِعَ | Revise this passage. |
| `test-over-m.mp3` | ٱنْتَهَى ٱلِٱخْتِبَارُ، جَزَاكَ ٱللَّهُ خَيْرًا | The test is over. May Allah reward you. |
| `test-over-f.mp3` | ٱنْتَهَى ٱلِٱخْتِبَارُ، جَزَاكِ ٱللَّهُ خَيْرًا | The test is over. May Allah reward you. |

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
- Student passwords are stored in the admin sheet only as salted hashes, never as text. Class passwords are
  checked by your Apps Script and are not part of the site.
- After signing in, the browser holds a signed token (valid 30 days) used to send that student's session logs.

## Project layout

```
site.config.mjs              settings: site address, class log URL, Sheikh's voices
scripts/build-data.mjs       builds public/data from sources/ (works offline)
scripts/copy-vendor.mjs      copies the face-check runtime into public/mediapipe
scripts/voice/make_voice.py  makes the Sheikh's letter and phrase clips (run by hand, not in CI)
scripts/lessons/examples.py  copies the Alif Ba Qur'an examples from the Tanzil text
sources/                     Tanzil text, QUL mushaf layout, surah names (never edited)
src/pages/index.astro        every screen
src/styles/classroom.css     classroom styles
src/styles/aic.css           the Al-Huda look (alhudaislamiccentre.ca), the mushaf page and page colours, Alif Ba
src/lib/lessons.mjs          the 18 Alif Ba lessons; src/data/alifba-examples.json, their Qur'an examples
src/lib/games.mjs            Rain of Mercy, Mosaic Maker, Date Baskets, String of Pearls (lanterns.mjs: Noor Lanterns)
src/lib/voice.mjs            the Sheikh's voice for letters: teacher recording, else clip, else browser voice
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
