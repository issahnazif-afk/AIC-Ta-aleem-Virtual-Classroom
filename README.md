# Ta'aleem Virtual Classroom

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


## Project handover and next steps

- [Product review and development roadmap](docs/PRODUCT_REVIEW_AND_ROADMAP.md): current feature inventory, student experience direction, learning activity expansion, Seerah production standards, teacher/parent experience and phased priorities.
- [Build and deployment guide](docs/BUILD_AND_DEPLOY.md): local setup, GitHub Pages deployment, optional Google Sheets logging, speech assets and release checklist.
- Run `npm run seerah` to check Seerah source references and classification consistency. This check is not a substitute for qualified Islamic/historical review.

## Screens

0. **Classroom** (after signing in): **Choose your adventure** shows the seven learning worlds (Qur'an, Arabic,
   Tawheed, Seerah, Hadith, Akhlaq, Du'a & Salah); pick one to see only its activities, or Everything. The whole
   plan, level by level, is in [docs/CURRICULUM_PATH.md](docs/CURRICULUM_PATH.md). One card per activity:
   **Hifz test**, **Mujawwadah**, **Recite (no camera)**, **Alif Ba**, **Tawheed** and the rest.
   Hifz test and Mujawwadah go on to the camera check and set-up below. **Recite (no camera)** is for practice on
   your own, as on the main app's Recite page: it goes straight to the set-up and uses only the microphone (no
   camera check, snapshot or look-away check), with the same Qāf tracker following every word. **Tawheed** opens
   the Tawheed shelf: picture books about knowing Allah for Levels 1 and 2 (`src/lib/library/tawheed.mjs`), with
   the same games and stars as the Reading Library. Alif Ba opens the Jannah Garden with its lessons and games. To add an activity later, add an entry to `src/lib/activities.mjs`.
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

With the Qāf model (published from the main app and downloaded by the deploy), Mujawwadah and the Hifz test use
the **Qāf tracker**:

- It follows the student through the expected text on the computer, in a background worker.
- A word turns green about half a second after it is said, two to three seconds at worst on a slow laptop.
- The word being recited fills as it is said.
- The Sheikh waits while the student is still reciting.
- The next page is prepared in advance and slides in.

How it works, what was wrong before, and how to measure it on real reciters: [docs/qaaf-tracker.md](docs/qaaf-tracker.md).
Browsers that cannot run the model (old Safari, Firefox) use the browser's speech recognition, as before.

**The room's view.** In the session bar:

- **Page · A⁺ · A⁺⁺**: the printed 15-line page, or large and extra-large flowing text for young readers.
- **Notes**: the Sheikh's notes, the colour key and the reading theme.
- **Full screen**.

The Sheikh, the camera and his words sit in a narrow rail; the controls float over the foot of the page.

Use **Chrome** or **Edge** on Windows or macOS.

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

### How the Sheikh reads the letters: sound-first

Reading is blending sounds, not reciting letter names. A child who knows *nnn + a + sss* can sound out نَسَ; a child
who only knows *noon, alif, seen* cannot. So the Sheikh teaches the **sound** of each letter first.

On the letter pages a drop-down chooses how the Sheikh says each letter. It is remembered on that computer.

- **Sound-first (nnn, mmm, sss)**, the default: the letter's own sound. Letters that can be held are held for about
  a second (ن *nnn*, م *mmm*, س *sss*, ف *fff*, ش, ص, ز, ر, ل, ه, ح, خ, ع, غ, ث, ذ, ظ); letters that stop
  (ب ت د ط ق ك ج ض أ) are said as a short clean burst with the lightest vowel, because they cannot be held. Lesson 1's
  cards show what to say: *Say: nnn · Nun*.
- **With fat-ha**: *ba, ta, tha*, as the booklet teaches the sounds.
- **Pure sound, with sukun**: *ab, at, ath*, the letter held on its own point of articulation.
- **Letter names**: *Alif, Ba, Ta*.

### Where the sound comes from (makhraj)

When a student picks a letter in Lesson 1, the side card shows a simple drawing of the mouth and throat with the
letter's place lit up (the nose too, for the humming of ن and م), its name in Arabic (e.g. طَرَفُ اللِّسَان), and one
sentence on how to make the sound. Heavy letters (خ ص ض غ ط ق ظ) say that the back of the tongue rises. The places
follow the 17 makharij of Ibn al-Jazari's *Muqaddimah*; the drawing and the words are our own
(`src/lib/makhraj.mjs`), so a teacher can change any sentence there.

### The Sheikh's voice for letters and syllables

So the Sheikh is heard on every computer (Chrome on Windows has no Arabic voice of its own), every letter sound,
name and syllable has a clip in `public/audio/voice/`. They are made with an open neural Arabic voice (Piper
*Kareem*) by `scripts/voice/make_voice.py`, from hand-checked phonemes rather than from text. This version makes the
voice calmer and more natural: the sing-song rise and fall is halved and the pitch is lowered slightly (with the
WORLD vocoder), and the held sound-first letters are steady in loudness and pitch, so a child who is not a native
Arabic speaker hears one clear, unbroken sound. GitHub makes the clips during each deploy; nothing to do by hand.

They are still a computer voice. **The realistic voice is a teacher's**, and the classroom now has a place to record
it:

#### The Voice Studio (for teachers)

On the sign-in page, choose **Teachers: record the Sheikh's voice (Voice Studio)** (or add `#studio` to the
address). Sign in with your name and the **Voice Studio password** (it is in the *Settings* tab of the admin sheet).
The Studio lists every clip by group: sound-first letters (with what to say, e.g. "hold nnn for about a second"),
the Sheikh's words, names, fat-ha / kes-ra / dom-ma, sukun and shadda, tanween and madd. For each one:
**Hear now** → **Record** → **My take** → **Save**. The recording is trimmed, levelled and saved to the *Sheikh voice*
folder in Google Drive, listed in the *Voice* tab, and from then on **every student hears your recording instead of
the computer voice**, with no redeploy. **Remove recording** brings back the computer voice.
Start with the 28 sound-first letters: they are what the youngest students hear most.

(Uploading files to `public/audio/letters/` with the clip's name, e.g. `f-nun.mp3`, `s-ba-a.mp3`, `n-ba.mp3`, still
works too, and is used when there is no Studio recording.)

### Reading theme

Mujawwadah, the Hifz test and every Alif Ba page have a **Reading theme** choice. A theme sets the paper, the ink
and the colours of the reading marks together, so the marks stay easy to see on every paper:

| Theme | For |
|---|---|
| Warm cream (default) | the printed mushaf look |
| Bright white | crisp and clear in daylight |
| Low-glare sepia | tired eyes and long sessions |
| Soft green | calm and restful |
| Calm blue | readers who find white pages glare or the letters swim |
| High contrast | black on white with bolder letters, for low vision |
| Yellow on black | the strongest contrast, for low vision and dark rooms |
| Colour-blind safe | blue (read), orange (mistake) and purple (hint) instead of green, red and gold |
| Night | a dark page for evenings |

The **B** button next to the themes makes the letters bolder on any theme. In the high-contrast, yellow and
colour-blind themes, mistakes are also underlined, so they never rely on colour alone, and the colour key under
the page names the marks as that theme shows them. The choice is remembered on that computer. The list is in
`src/lib/themes.mjs`; the colours are in `src/styles/aic.css`.

## Play & Learn, Ta'aleem Stars and the daily challenge

From the **AICWIS Ta'aleem Virtual Classroom Interactive Learning Proposal** (Phases 1 and 2). After signing in,
the dashboard has the proposal's five destinations: **My Lessons** (Alif Ba), **Play & Learn**, **My Hifz**
(Hifz test, Mujawwadah), **My Achievements** and **My Jannah Garden**, with **Today's Ta'aleem Challenge** above
them.

| Game | What the student does | Content from |
|---|---|---|
| Arabic Letter Detective | Hear a letter and find it; find a letter by its name; name a letter; find the missing letter in a row; tell look-alike letters apart. Letters the student misses come back more often. The alphabet garden opens in four parts of seven letters: 80% right first time opens the next part (Levels 3–4 start with all 28). | The app (letters and their clips) |
| Build the Ayah | Choose a short surah, then put each ayah's words in order, find a missing word, choose which ayah comes next (Level 3+), or put ayahs in order (Level 4). After each ayah the reciter recites it, and at the end the student can recite the surah to the Sheikh. | The Tanzil text, never typed by hand |
| Match the Deen | Memory cards: Names of Allah, Arabic words, Prophets, duas and when we say them, Islamic words. | Question bank |
| Journey to Knowledge | A 20-step journey through the Knowledge Garden, Arabic Valley, Seerah Library and the Garden of Good Manners; each right answer moves one step, with a bonus step at each place. | Question bank |
| Salah Master | Put the steps of the prayer in order, say when each recitation is said, answer prayer facts. | Question bank |
| Akhlaq Heroes | Everyday situations: what would you do? Good choices grow a kindness garden. | Question bank |

All of them use the student's level for difficulty and content, explain every answer kindly, show the answer after
two tries, and have a **Read it to me** button for young readers. None of them use the camera, and none is a speed
race: there are no timers on Qur'an or dhikr content.

**The Question bank** lives in the admin sheet, where teachers approve, edit and add questions. Only approved rows
reach students. The starter set (141 rows) is in `src/data/question-bank.json`, written by
`scripts/questions/starter.py`; every row starts as *Review*. See `apps-script/README.md`. Without a class log
connected (demo mode) the starter set is shown with a *Preview* note.

**Ta'aleem Stars** are one reward system for every activity: a star for finishing, one for a strong result, one for
doing better than your last try, one for each daily mission, and two more for finishing all three missions in a day.
Hifz and Mujawwadah sessions earn stars for finishing and for improving, never for being compared with anyone.
There is no class ranking.

| Badge | How |
|---|---|
| First Steps | Complete your first activity |
| Quran Explorer | Five Qur'an activities (Hifz, Mujawwadah, Build the Ayah) |
| Lantern Keeper | Ten activities |
| Kindness Champion | Five Akhlaq Heroes games or character missions |
| Daily Achiever | All three missions in one day |
| Steady Steps | Seven days in a row |
| Garden Grower | Five Alif Ba palms |
| Rising Star | Doing better than your last try three times |

**Today's Ta'aleem Challenge**: a Qur'an mission (recite to the Sheikh, or Build the Ayah), a knowledge mission (any
knowledge game or Alif Ba game) and a character mission (a good deed from the Question bank's `daily` rows, marked
by the student, or a game of Akhlaq Heroes). Missions tick themselves off as the student plays.

**My Jannah Garden** is a picture of the student's learning, not a picture of Jannah: a flower for every game, a
tree for every Qur'an activity, a date palm for every Alif Ba lesson, a lantern for every badge, a kindness garden,
and a fountain and an arch for learning several days in a row.

Teachers see each student's stars, badges and day streak in the Students tab, and every game in the Games tab of the
class log.

## Story Time (Level 1 first)

**Story Time** is under *My Lessons*: a shelf of twenty-two picture stories for ages 4–8, each teaching one good manner
(smiling, saying Bismillah, kindness to animals, telling the truth, salam, sharing, helping, saying thank you, staying
calm, respecting elders, helping our mother, not wasting, keeping clean, neighbours, patience, a little every day,
kind words, giving, bedtime, being thankful, helping others, a good heart).

- Each story is 6 pages: a picture with the words laid over it. The classroom reads it aloud in a warm, natural voice
  (the words light up as they are read), or the child can switch to "I’ll read myself". Swipe, or tap the big arrows.
- On one page in every story the child **does something**: taps Maryam to smile at the bus driver, moves the stone off
  the path, gives Misk the cat her water, turns off the tap, says the sleeping dua with Adam.
- Then a question about the story, and the hadith of the Prophet ﷺ or the ayah it teaches, in Arabic with its meaning
  and source. Ayahs come word for word from the Tanzil text (`scripts/stories/quran.mjs`), and the reciter can play them.
- Finishing a story gives Ta'aleem Stars and counts as the day's **Character mission**; it appears in the Games tab.

The stories, the characters and every picture are the school's own: the pictures are drawn in code
(`src/lib/stories/art.mjs`), so there is nothing to license, and they stay sharp at any size (on a phone or a classroom
projector). Each picture has outlines, light and shade on faces and clothes, soft shadows, window light, and textured
floors and grass. Prophets and Companions are never shown.
**Please have a teacher check `docs/story-time-level1.md`** (every story, page by page, with each hadith and its source).
Other levels see the Level 1 shelf until their own stories are added (`STORY_SHELVES` in `src/pages/index.astro`).

## The Reading Library (Levels 1 and 2)

**Reading Library** is under *My Lessons*: a reading journey of forty books, twenty First Readers for Level 1 and twenty
Adventure Readers for Level 2. A book is read in the Story Time reader (with its tap page and the read-aloud voice), then
the child plays its story games (word game, quiz, fill the gap for Level 2, story order) and earns 1 to 3 stars, a
passport stamp and a Ta'aleem Star. There is a day streak and a badge every five books. The books, the games, the
writing rules and how a teacher adds a book (including pages exported from Canva) are in
[docs/reading-library.md](docs/reading-library.md). Check new or changed books with `npm run books`.

## The Al-Huda Books (every level)

**Al-Huda Books** is under *My Lessons*: the school's own Canva books, each turned into an interactive digital book
for the age it was written for. The shelf shows the books for the student's class first, then the rest.

| Book | Level | What the child does |
|---|---|---|
| My First Arabic Letters 1 and 2 | 1 (4–6) | Colour, trace and circle on the workbook pages with crayons; tap a letter to hear it; listen-and-find games |
| My Du'a Activity Book | 1 (4–6) | Each du'a with its Arabic, how to say it and its meaning; the colouring and tracing pages; matching games |
| Alif Ba: I'm Learning Qur'an | 2 (6–8) | Letters, their forms and the harakat, with the workbook pages, letter sounds, matching and sorting |
| Islamic Stories for Kids | 2 (6–9) | Grandpa Musa's stories read aloud with the book's pictures, new words, questions, the hadith, a pledge |
| Arabic for Beginners | 3 (8–10) | The textbook pages, vocabulary tables, matching and fill-the-gap practice, the tests |
| The Book of Hadith | 3 (9–11) | Each hadith with its vocabulary and story, questions, a reflection to write, the unit tests |
| Tawheed: Islamic Monotheism | 4 (10–14) | Six units of lessons with key words, ayat and hadith, a quiz after each lesson, the unit tests |

Levels 1 and 2 are read aloud from the start; Levels 3 and 4 read for themselves, tests show a percentage, and
written answers stay on that computer. Every finished chapter gives stars and Ta'aleem Stars and appears in the class
log's Games tab. The words were rewritten where needed to read as a person wrote them, and `npm run books` checks
them against Wikipedia's *Signs of AI writing* guide. The page pictures are in `public/books/`; the PDFs are not kept
in the repository (`scripts/books/render.py` makes the pictures from them). How the books are built, the page types
and the writing rules: [docs/al-huda-books.md](docs/al-huda-books.md). **Please have a teacher read
[docs/al-huda-books-review.md](docs/al-huda-books-review.md)**: every hadith, ayah and du'a, book by book.

### The reading voice (Story Time and the Seerah Quest)

**The most human voice is a real one.** In the Voice Studio there is now a **Story Time** tab: a teacher or parent
reads each page (slowly, warmly, with expression) and saves it, and every student then hears that recording for that
page. Pages not yet recorded use the computer storyteller.

The computer storyteller is made at build time from **Kokoro** (an open neural voice, Apache 2.0), directed sentence by
sentence by `scripts/voice/make_narration.py`: a slow pace with real pauses; the melody widened so the voice rises and
falls like a storyteller's; exclamations brighter, questions lifted at the end, quiet moments ("slowly… slowly…",
bedtime) lower and softer; and the characters' words in their own voices (Yusuf, Maryam and friends lighter and higher,
Mama, Teta, Baba, Jiddo, Ustadha Huda). Who says each line is worked out from the text, with corrections in
`SPEAKERS` in `src/lib/narration-text.mjs`. The Seerah Quest is read by a calm male narrator. GitHub records the clips
during the deploy (`scripts/voice/narration-list.mjs` lists the lines) and keeps them in its cache: the first deploy
takes about 30–40 minutes, later ones only record new or changed sentences.

**Muslim names and Islamic words** (Maryam, Idris, Khadija, Masha’Allah, In sha’ Allah, Assalamu alaykum, Fajr, Jannah…)
are said as a Muslim English speaker says them, close to the Arabic, not as English guesses them ("MEH-ree-am",
"EYE-dris"). Their sounds are written once in `NAMES` in `src/lib/narration-text.mjs`, and the recorder
(`scripts/voice/kokoro_direct.py`) gives those sounds straight to the voice. To add a name or change how one is said,
edit that list: every line with that word is re-recorded on the next deploy. (`SAY` in the same file is only for the
browser's own voice, used when there is no clip.)

### The Arabic on the hadith and ayah pages

The last page of every book is read in three steps: "The Prophet Muhammad ﷺ said:" (or "Allah says in the Qurʾan:"),
then **the Arabic in a real human voice**, then the meaning in English with the storyteller.

- **An ayah** is read by a Qari: the words shown, word by word, from the quran.com word recordings; a whole ayah by
  the class's chosen reciter. *Listen to the whole ayah* plays the full ayah.
- **A hadith** is read by the Sheikh or a teacher: the Voice Studio has a **Hadith in Arabic** tab with each of the 43
  hadith, recorded once and used by every book that has it. Until a hadith is recorded, the page goes straight from
  "The Prophet ﷺ said:" to the English.

No computer voice reads the Arabic of a hadith. The open Arabic voices were tested on these hadith with a speech
recogniser, and every one of them changed words (for example الرحمن heard as الروحمن), which is not acceptable for the
words of the Prophet ﷺ.

The Sheikh's **Arabic** voice for Alif Ba is still the computer voice *Kareem*: the newer open Arabic voices (Piper
dii and miro, 2025) were no clearer. A teacher's recording in the Voice Studio is the way to make the Sheikh fully
human: every letter, syllable and phrase recorded there replaces the computer voice for every student.

## The picture home and the level doors (Levels 1 and 2)

The welcome page has four **level doors** (Level 1 to Level 4). A door remembers the level and chooses it in
*Create account*; a student's own account still decides their level when they sign in.

After signing in, **Levels 1 and 2** land on a **picture home** (`src/lib/kids-home.mjs`): one bright scene with big
places to tap (My letters, My du'as, Sunnah of the day, Our Prophet ﷺ, Stories, My books, Qur'an, Games, Special
days, My garden, My stars; Level 2 also has the Reading Library and Knowing Allah). Pointing at a place, or tapping
it once on a tablet, says its name and makes it bounce; clicking it, or a second tap, opens it. *Grown-up view* shows
the full dashboard, and *Picture home* on the dashboard goes back. Levels 3 and 4 keep the dashboard. The background is
the school's Canva picture of a masjid courtyard (`public/img/home/scene-wide.webp` for computers and `scene-phone.webp`
for phones, under a soft veil so the places stay easy to read; the line of text printed in its sky was painted out so it
does not show between the cards). Four places use the school's Canva pictures (Our Prophet ﷺ, Qur'an, Sunnah of the
day, Stories); the other places are drawn from simple shapes until more Canva pictures are made.

## My Deen: du'as, the Sunnah of the day, Our Prophet ﷺ and special days (every level)

Under *My Lessons* (and on the picture home). Content in `src/lib/deen/`, the screen in `src/lib/deen/deen.mjs`.

- **My du'as** (`duas.mjs`): 30 du'as by moment of the day, each with the voweled Arabic, how to say it, its meaning,
  when we say it and its source, linked to sunnah.com. *Listen* plays a teacher's recording from the Voice Studio
  (*Hadith in Arabic* tab); a computer voice never reads the Arabic. Qur'an du'as come from the Tanzil text with the
  class reciter. *I learnt it* gives Ta'aleem Stars (the Knowledge mission); favourites are kept.
  Each du'a opens as a short lesson: **1 See it** (the Arabic first, in its parts; the English meaning is behind the
  *Translation* button and is read aloud only when tapped), **2 Listen** (the whole du'a, each part lighting up as it is
  said) and **3 Repeat after me** (a part, then a pause the length of the part and a second and a half for the child
  to say it; *Next* moves on, a tap on any part plays it again, *Once more* starts again). The parts are in `duas.mjs`
  and in the review sheet. The voice is only ever a real person (`dua-audio.mjs`): the teacher's Voice Studio
  recording of each part (Voice Studio, *My Du'as* tab: one clip per part, the whole du'a optional), then the
  hisnmuslim.com recording once the school has permission (`HISN_AUDIO` in `refs.mjs`, off; each du'a's matching item
  is stored as `hisn`), and otherwise a note that the recording is not ready. A Qur'an du'a plays the class reciter for
  a whole ayah and the word-by-word recitation for part of one.
- **Sunnah of the day** (`sunnah.mjs`): 40 small sunnahs a child can do, one a day for each level. It is now the
  character mission of *Today's Ta'aleem Challenge*.
- **Our Prophet ﷺ** (`prophet.mjs`): his character (12 cards, each with a hadith, a true example and "What can I do
  today?"), a day lived his way (linked to the du'as and sunnahs), and the main moments of his life from the Qur'an and
  the two Sahihs only. No one is pictured and no words are invented.
- **Special days** (`days.mjs`): today's Hijri date (Umm al-Qura) and the coming blessed days, with their hadith.

**Sources.** The Qur'an (Tanzil) and sound hadith only. `npm run deen` (`scripts/deen/check.mjs`) checks every
reference against the hadith text of the open *hadith-api*, which uses sunnah.com's numbering: the number must exist,
the Arabic words must be in that hadith, and any hadith outside Bukhari and Muslim must be graded sahih or hasan by
al-Albani. It then writes **`docs/deen-review.md`** with every entry and its sunnah.com link.

**Approved.** Ustadh Issah reviewed every entry on that sheet and approved it on 10 November 2026 (116 entries).
`scripts/deen/approved.json` keeps a fingerprint of each approved entry; the checker ticks the entries that still match
and marks anything added or changed since as **pending review**, so new content waits for his review. After he has
checked the pending entries, record it with `node scripts/deen/check.mjs --approve "Ustadh Issah" YYYY-MM-DD`.

## The Seerah Quest (Levels 3 and 4)

*From Darkness to Light*: a first-person 3D journey through Makkah in the years before the Prophet ﷺ was born.
It is under Play & Learn for Levels 3 and 4. This first prototype has two connected episodes:

1. **The Secret of Zamzam**: ʿAbd al-Muttalib's dream, the search by the House, the digging, the dispute with
   Quraysh, the journey north to the judge and the water that came out under his camel.
2. **The Year of the Elephant** (opens after Episode 1): Abraha's church in Sanaʿa, the march north, the camels,
   ʿAbd al-Muttalib's words *"I am the lord of the camels, and the House has a Lord who will protect it"*, Quraysh
   going up into the mountains, the elephant that knelt, the birds, and Surah al-Fil from the reciter.

Each episode mixes the modes in the design: story (narration), adventure (walking to the lights), discovery
(search, dig, the map of the march), knowledge (a six-question challenge, every answer from the passages) and
reflection (a question with no wrong answer). Stars, the Knowledge mission and the game log work as for the other
games, and a student can leave and carry on later. **Picture quality** (low, medium, high) is on the episode page.

### The source policy

- **One source only**: Ibn Kathir, *al-Bidaya wa'l-Nihaya*, ed. ʿAli Shiri (Dar Ihyaʾ al-Turath al-ʿArabi,
  1408/1988), from the OpenITI digital text. Every historical sentence the student reads is a translation of a
  passage from it, shown with its volume and page; **Show the source** opens Ibn Kathir's Arabic.
- Nothing is invented: no events, no dialogue. The explorer's guide only gives instructions; it never tells history.
- Where Ibn Kathir himself marks a report as uncertain or as an addition, the game shows it as **A report**, in grey.
  Passages that are disputed or that only describe details the design excludes (e.g. the arrows of the lots,
  ʿAbd al-Muttalib's offer to Abraha) are kept out of the game and listed as *excluded* in the source record.
- The Prophet ﷺ, the Companions and the people of the time are **never portrayed**: people appear only as lanterns.
  The elephant kneeling and the birds are **non-interactive scenes**, with nothing graphic.
- Every passage, with its Arabic, translation, page and classification, is in `docs/seerah-source-record.md`
  (made by `scripts/seerah/sources.py`, which stops if any quoted Arabic cannot be found word for word in the
  book). **The English translations are marked "pending" until an Islamic Studies teacher reviews them**; please
  have one go through that file before the Quest is used in class.

Later episodes (the birth of the Messenger ﷺ, the first revelation, the Hijrah, …) are shown as "coming after source
review": each will be built the same way, from al-Bidaya only, after its passages have been chosen and checked.

The 3D world is made of simple shapes (no photographs or models of real people or places), drawn with three.js.
On older computers choose *Low*; on a computer without WebGL the Quest says so instead of starting.

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
scripts/voice/make_voice.py  makes the Sheikh's letter and phrase clips (run by the deploy workflow)
scripts/seerah/sources.py    checks and writes the Seerah Quest's passages from al-Bidaya (sources.json + docs/seerah-source-record.md)
scripts/lessons/examples.py  copies the Alif Ba Qur'an examples from the Tanzil text
sources/                     Tanzil text, QUL mushaf layout, surah names (never edited)
src/pages/index.astro        every screen
src/styles/classroom.css     classroom styles
src/styles/aic.css           the Al-Huda look (alhudaislamiccentre.ca), the mushaf page and page colours, Alif Ba
src/lib/lessons.mjs          the 18 Alif Ba lessons; src/data/alifba-examples.json, their Qur'an examples
src/lib/games.mjs            Rain of Mercy, Mosaic Maker, Date Baskets, String of Pearls (lanterns.mjs: Noor Lanterns)
src/lib/voice.mjs            the Sheikh's voice for letters: teacher recording, else clip, else browser voice
src/lib/play.mjs             Play & Learn: Letter Detective, Build the Ayah, Match the Deen, Journey, Salah Master, Akhlaq Heroes
src/lib/questions.mjs        the teachers' Question bank (approved rows only); src/data/question-bank.json, the starter set
src/lib/rewards.mjs          Ta'aleem Stars, badges and the daily challenge
src/lib/studio.mjs           the Voice Studio, where teachers record the Sheikh's voice
src/lib/makhraj.mjs          where each letter's sound comes from: the 17 makharij, the drawing and how-to sentences
src/lib/stories/             Story Time: art.mjs (the pictures), level1.mjs (the 22 stories), reader.mjs (shelf and book)
src/lib/books/               Al-Huda Books: one file per book, index.mjs (the shelf order), ebook.mjs (shelf and reader)
scripts/books/               render.py (page pictures from the Canva PDFs), lint.mjs (checks + the teachers' review sheet)
src/lib/library/             Reading Library: level1.mjs, level2.mjs (the 40 books), added.mjs (teachers' books), library.mjs (journey and games)
scripts/stories/             quran.mjs (ayah words from Tanzil), review.mjs (docs/story-time-level1.md)
src/lib/seerah/              the Seerah Quest: world.mjs (the 3D valley), episodes.mjs (the steps), quest.mjs (the player)
scripts/questions/starter.py writes the starter Question bank (and its copy in apps-script/Code.gs)
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
