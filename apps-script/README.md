# Class log: one Google Sheet per class

The classroom website runs on GitHub Pages, which has no server. Each finished session is sent to a small
Google Apps Script that **you** own. The script checks the class code and password, then adds one row to
that class's Google Sheet in your shared Drive folder. Students never see the log.

```
Shared folder/
├── HIFZ-B-2026 · session log      ← one Google Sheet per class, a row per session
├── HIFZ-B-2026 snapshots/         ← the login photo of each session
├── HIFZ-C-2026 · session log
└── …
```

To get an Excel copy at any time, open a class sheet and choose **File → Download → Microsoft Excel (.xlsx)**,
or open it straight from Excel through Google Drive.

## Set up (about 10 minutes, once)

1. In Google Drive, create (or choose) the shared folder. Open it and copy its ID: the part of the address
   after `/folders/`.
2. Create a new Google Sheet called **Classroom admin**. This is where classes and passwords are kept.
   Do not share it with students.
3. In that sheet: **Extensions → Apps Script**. Delete what is there and paste the whole of `Code.gs`.
4. On the line `const FOLDER_ID = 'PASTE_YOUR_FOLDER_ID_HERE';` paste your folder ID between the quotes. Save.
5. Choose the function **setup** in the toolbar and press **Run**. Allow access when asked (it needs your
   Sheets and Drive). A **Classes** tab appears with one example row.
6. Fill in the **Classes** tab, one row per class:

   | Class code | Class name | Class password | Teacher | Log sheet |
   |---|---|---|---|---|
   | HIFZ-B-2026 | Hifz group B | a password you give the class | Ustadh … | *(filled in automatically)* |

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

## What each row holds

Session ID, student name, class code, login and end time, minutes spent, session type (Hifz test or
Mujawwadah), level, surahs and ayahs recited, number of questions, words recited, right first time (%),
grade, total mistakes, most observed mistakes, wrong words, forgotten words (the Sheikh prompted),
hints used, unclear words, words gone back over, times the student looked away, a link to the login
photo, and the Sheikh's short review.
