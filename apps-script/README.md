# Ta'aleem Virtual Classroom: class log, one Google Sheet per class

The classroom website runs on GitHub Pages, which has no server. Each finished session is sent to a small
Google Apps Script that **you** own. The script checks the class code and password, then adds one row to
that class's Google Sheet in your shared Drive folder. Students never see the log.

```
Shared folder/
├── Level 1/
│   ├── Level 1 · session log      ← one Google Sheet per class, a row per session
│   └── Snapshots/                 ← the login photo of each session
├── Level 2/
├── Level 3/
└── Level 4/
```

To get an Excel copy at any time, open a class sheet and choose **File → Download → Microsoft Excel (.xlsx)**,
or open it straight from Excel through Google Drive.

## Set up (about 10 minutes, once)

1. In Google Drive, create (or choose) the shared folder. Open it and copy its ID: the part of the address
   after `/folders/`.
2. Create a new Google Sheet called **Ta'aleem classroom admin**. This is where classes and passwords are kept.
   Do not share it with students.
3. In that sheet: **Extensions → Apps Script**. Delete what is there and paste the whole of `Code.gs`.
4. On the line `const FOLDER_ID = 'PASTE_YOUR_FOLDER_ID_HERE';` paste your folder ID between the quotes. Save.
5. Choose the function **setup** in the toolbar and press **Run**. Allow access when asked (it needs your
   Sheets and Drive). A **Classes** tab appears with one example row.
6. Fill in the **Classes** tab, one row per class:

   | Class code | Class name | Class password | Teacher | Log sheet |
   |---|---|---|---|---|
   | LEVEL-1 | Level 1 | *(made by setup, change if you like)* | Ustadh … | *(filled in automatically)* |
   | LEVEL-2 | Level 2 | … | … | |
   | LEVEL-3 | Level 3 | … | … | |
   | LEVEL-4 | Level 4 | … | … | |

7. **Deploy → New deployment → Select type: Web app.**
   *Execute as:* **Me**. *Who has access:* **Anyone**. Press **Deploy** and copy the **Web app URL**
   (it ends in `/exec`).
8. In the GitHub repository: **Settings → Secrets and variables → Actions → Variables → New repository
   variable**. Name: `CLASS_LOG_URL`. Value: the Web app URL. Then run the **Build and deploy** workflow
   (Actions tab) or push any change.

"Anyone" means the web app accepts requests from the website without a Google sign-in. It only does two
things: it checks a class code and password, and it adds a row for a class whose password matches.
Nobody can read the sheets through it.

## Changing the script later

After editing `Code.gs`, use **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**.
The Web app URL stays the same, so the website needs no change.

## Student accounts

Each student creates their own account on the classroom's **Create account** tab: full name, whether they are a
boy or a girl (so the Sheikh addresses them properly), their level,
the level's **class password** (from the Classes tab — this is how you control who joins which level),
a username and a password. Accounts appear in the **Students** tab of the admin sheet:

| Username | Full name | Class | Joined | Last sign-in | Reset password | Gender | Progress | Stars | Badges | Day streak | Last activity |
|---|---|---|---|---|---|---|---|---|---|---|---|

Passwords are stored only as salted hashes (in two hidden columns), so nobody can read them. Students whose
accounts were made before the Gender column existed are asked once, the next time they sign in.

- **A student forgot their password:** type a temporary password in their **Reset password** cell and tell
  them. They sign in with it once; it becomes their password and the cell clears itself.
- **Move a student to another level:** change their **Class** cell (for example to `Level 3`).
- **Remove a student:** delete their row.
- **Stop new sign-ups for a level:** change that level's class password. Existing accounts keep working.

## Adult accounts (the Quran Library, taaleem.ca/quran/)

Adults reach the Quran Library from the **Adults** door on the classroom's welcome screen (or at taaleem.ca/quran/).
Every page there needs an account. Adults create their own: full name, Brother or Sister (so the Sheikh addresses
them properly), a username and a password of at least 8 characters. **No class password is needed.**

They are kept in their own **Adults** tab, made the first time someone registers (nothing to set up):

| Username | Full name | Gender | Joined | Last sign-in | Reset password | Saved (bookmarks, last read, settings) | Hifz tests | Last activity |
|---|---|---|---|---|---|---|---|---|

- One username is one person across the whole site: an adult cannot take a student's username, or the reverse.
  A student's sign-in never opens an adult account, and an adult's never opens a student's.
- Their bookmarks, last reading place, Recite and Hifz test set-ups and reading settings are saved to the
  **Saved** column, so they follow them to another device. Signing out clears them from the device.
- Each finished Hifz test adds a row to the **Adult sessions** tab: time, name, passage, words recited, right first
  time (%), prompts, hints, grade and the words to revise.
- **An adult forgot their password:** type a temporary password in their **Reset password** cell and tell them,
  as for students.
- **Remove an adult** (or when they ask for their data to be deleted): delete their row, and their rows in
  Adult sessions.
- Against automated sign-ups: a hidden form field that only robots fill in, at most 120 new adult accounts an
  hour (`ADULT_SIGNUPS_PER_HOUR`), and 10 wrong passwords in 15 minutes locks that username for 15 minutes.
- A Google Sheet stays quick up to a few thousand accounts. If the adults' section grows far beyond that, move
  accounts to a proper database.

## Games, stars and badges

Each game a student plays (Alif Ba and Play & Learn) is added to a **Games** tab inside their class's session log
(created on first use): time, student, username, gender, class, game, lesson or topic, rounds, right first time,
accuracy, score, letters to practise, letters known (of 28) and minutes.

The Students tab shows each student's **Stars**, **Badges**, **Day streak** (days in a row with learning) and
**Last activity**, so teachers can follow effort and consistency. Students never see each other's stars: there is
no class ranking. The *Progress* column holds the details the app needs; leave it as it is.

## The Question bank (Match the Deen, Journey to Knowledge, Salah Master, Akhlaq Heroes, daily missions)

`setup()` adds a **Question bank** tab with a starter set of questions. **Every starter row is marked
`Review`, and students only ever see rows marked `Yes`.** So nothing appears in those four games until a teacher
has read the questions and approved them. Letter Detective and Build the Ayah do not use the bank: their letters
and Qur'an text come from the app itself.

| Column | What to put |
|---|---|
| ID | Any short label (Q001, …). |
| Approved | `Yes` to show it to students; `Review` or `No` to hide it. |
| Game | `match`, `journey`, `salah`, `akhlaq`, or `daily` (character missions). |
| Kind | `pair` (two cards that match), `choice` (a question with one right answer), `order` (steps in order), `deed` (a good deed for the daily character mission). |
| Topic | Groups the questions. Match the Deen offers one topic per group (*Names of Allah*, *Prophets*, …). Journey to Knowledge uses the four places: *Knowledge Garden*, *Arabic Valley*, *Seerah Library*, *Garden of Good Manners*. |
| Levels | Which classes see it: `1-4`, `2-4`, `3`, or `1,3`. |
| Question / card A | The question, the first card, or the deed. |
| Answer / card B | The right answer or the matching card. For `order`, all the steps in order, separated by `\|`. |
| Wrong answers | For `choice`: the wrong answers, separated by `\|`. |
| Explanation | A short, kind explanation shown after the answer. |
| Teacher notes | Anything for the other teachers; never shown. |

To add a question, add a row; to change one, edit it; to hide one, set Approved to `No`. Changes reach students
the next time they open the classroom; no redeployment is needed. A Match the Deen topic needs at least three
approved pairs for the level; Journey to Knowledge needs four questions, Salah Master and Akhlaq Heroes three.

To approve many rows at once, select the Approved cells and type `Yes`, or copy one `Yes` down the column.

## The Voice Studio (teachers record the Sheikh's voice)

`setup` adds a **Settings** tab with the **Voice Studio password** (a random word; change it in the sheet whenever
you like) and the alert at the end of `setup` shows it. Teachers sign in to the Studio in the classroom with their
name and that password. Each recording is saved to a **Sheikh voice** folder inside the classroom's Drive folder and
listed in the **Voice** tab (clip, file, when, by whom, size). To take a recording away, use *Remove recording* in
the Studio (or delete its row). Students cannot record or change anything: they only play the recordings.

## The maze leaderboard

Every finished maze stage is written to a **Maze board** tab in the class log (made the first time a student
finishes a stage). Students see their own class only, each classmate once by first name and the first letter of
the family name, ranked by the highest stage reached and then the quickest time on it. Recitation is never ranked.
To remove a row (for example a test run), delete it from the Maze board tab; the board updates within a minute.

To switch it on for an existing set-up, paste the new `Code.gs` and make a **New version** of the deployment
(see *Changing the script later*). Until then the leaderboard says it is not switched on yet.

## Talking with the Sheikh (free on the student's device; optional AI)

Before each recitation the Sheikh chats with the student. He understands answers in the student's own words, and
before the recitation he asks "Is there anything you would like to ask me?". The student can speak or type a
question.

**Free, with nothing to set up.** By default a small sentence model (all-MiniLM-L6-v2, Apache 2.0, about 23 MB,
downloaded once by the student's browser) finds the library line closest in meaning to what the student said. It
runs on the student's own device: nothing they say is sent anywhere, and there is no cost. It quotes a hadith, ayah
or Ibn Kathir passage only when it clearly answers the question (and Ibn Kathir only for questions the library
lists); otherwise he says it is a good question for their teacher. `node scripts/sheikh/try.mjs` checks it on 68
sentences a child might say.

**Optional: an AI model.** For a better understanding of unusual questions, the class server can ask an AI model
(Claude, by Anthropic) instead. This costs money (see below) and is off until you add a key. The AI reads what the
student said and chooses the Sheikh's reply from his **library** (`public/data/sheikh-library.json`, made from `src/lib/sheikh-library.mjs`). The model can only
answer with the ids of library lines: the answer format allows nothing else, so the Sheikh never says words that are
not in the library. The library holds:

- short everyday lines (encouragement, "I am sorry to hear that", "Please ask your teacher") with no religious claims;
- the hadith of My Deen (checked and approved);
- 40 hadith from Sahih al-Bukhari and Sahih Muslim (English of sunnah.com, from hadith-api; `src/data/sheikh-hadith.json`);
- the ayat of the Reading Library;
- Ibn Kathir's *al-Bidaya wa'l-Nihaya* (the "established" Seerah Quest passages).

If nothing in the library answers a religious question, he says *"That is a very good question. … Please ask your
teacher or your parents."* If a student says they are hurt or unsafe, he tells them to talk to their parents or
teacher today. Every line is recorded in his voice when the site is built.

**Turn the AI on** (not needed for the free version)

1. Make an API key at **console.anthropic.com** (Settings → API keys). Set a monthly spend limit there too
   (Settings → Limits).
2. Paste the new `Code.gs` and make a **New version** of the deployment (see *Changing the script later*).
3. In the Apps Script editor: **Project Settings (gear) → Script properties → Add script property**:
   `ANTHROPIC_API_KEY` = your key. Save.
4. Choose **testSheikh** in the function list and press **Run**. The log shows what the Sheikh would say to three test
   sentences, for example `why should I be kind to my neighbours → {"ok":true,"answer":-1,"say":["c-good-question","h-b6136"]}`.

Optional script properties:

| Property | What it does | Default |
|---|---|---|
| `SHEIKH_MODEL` | The AI model. `claude-haiku-5-5` is faster and costs far less; `claude-opus-5-5` judges best. | `claude-opus-5-5` |
| `SHEIKH_DAILY_LIMIT` | The most AI replies a day for the whole school. Each student also has at most 60 a day. | `2000` |
| `SHEIKH_LIBRARY_URL` | Where the library is published. | `https://taaleem.ca/data/sheikh-library.json` |

**Cost.** Each reply sends the library (about 20,000 tokens, cached by Anthropic for a few minutes between replies)
and gets a short answer. On `claude-opus-5-5` that is roughly 1 to 10 cents a reply. On `claude-haiku-5-5` it is
well under a cent. The daily limit caps the total. Delete the `ANTHROPIC_API_KEY` property to turn it off at once.

**Privacy.** Only the Sheikh's question, the answer buttons and the words the student said (as text) are sent to
Anthropic. Names, usernames and recordings are never sent. Students must be signed in to use it. Check with your
board and tell parents before turning it on.

## Updating an existing set-up (for this version)

1. Open the admin sheet → **Extensions → Apps Script**, replace everything with the new `Code.gs` (keep your folder
   ID on the `FOLDER_ID` line), and save.
2. Run **setup** once. It adds the Question bank, Settings and Voice tabs and the new Students columns, and shows
   the Voice Studio password. It never changes your classes,
   students or class logs, and it never overwrites a Question bank that already has rows.
3. **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy.** The URL stays the same.
4. Ask a teacher to review the Question bank and set **Approved** to `Yes` on the rows to use.

Adult accounts need only steps 1 and 3: the Adults and Adult sessions tabs are made by themselves when the first
adult registers. Until the new version is deployed, the adults' sign-up says accounts are not switched on yet.

## What each row holds

Session ID, student name, username, gender, class, login and end time, minutes spent, session type (Hifz test or
Mujawwadah), difficulty, surahs and ayahs recited, number of questions, words recited, right first time (%),
grade, total mistakes, most observed mistakes, wrong words, forgotten words (the Sheikh prompted),
hints used, unclear words, words gone back over, times the student looked away, a link to the login
photo, and the Sheikh's short review.
