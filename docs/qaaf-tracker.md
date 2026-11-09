# The Qāf tracker: following a reader word by word

Used by the Recite page and the Hifz test (Qāf wal-Qurʾān al-Majīd) and by the Mujawwadah and Hifz sessions of the
Ta'aleem Virtual Classroom. Same files in both repos: `src/lib/tracker.mjs`, `src/lib/qaaf-worker.mjs`,
`src/lib/track-recognition.mjs`.

## What was wrong (November 2026)

Measured by playing the same 55 s recitation through each engine, with each step charged at the speed of a
student laptop:

| Engine | Words shown | Typical delay | Worst delay | Longest freeze |
|---|---|---|---|---|
| Classroom: Qāf model as a recogniser (`asr-local.mjs`) | 43 / 44 | 3.1 s | 14.8 s | 14.8 s |
| App: Qāf aligner, as it was wired (`align-recognition.mjs`) | 10 / 44 | 23 s | 41 s | 11.5 s |
| App default: browser speech (Google's service) | not measurable here | about 1 s or more | | stops and restarts |
| **Qāf tracker** | **44 / 44** | **0.4–0.7 s** | **1.8–3.4 s** | **1.8–3.4 s** |

1. **The classroom re-decoded the whole utterance every 0.15 s.** An ayah recited in one breath is 10–14 s of
   audio, so each step cost 1–3 s on a laptop, on the page's own thread. Words came late and in bursts, and the
   page froze while it worked.
2. **The app's aligner restarted itself into a loop.** Over its 2.4 s window it often passed a word having heard
   only part of it. The page dropped that word, the aligner saw that the page had not moved, and started again
   from the page's word, though the reader had already gone on. Each restart threw away seconds of listening.
3. **Browser speech is not built for recitation.** It sends audio to a server, settles on words only at pauses,
   hears tajweed as everyday Arabic, and ends its session every so often, so it has to be restarted. It stays as
   the fallback for browsers that cannot run the model.
4. **The Sheikh prompted readers who were still reciting.** His silence timer counted confirmed words only.
5. **Page turns rebuilt the page at the moment of turning**, so the next words waited for it to be laid out.

## How the tracker works

We already know the text, so the reader is followed through it rather than transcribed. That is also how
Tarteel works: a recitation model (theirs is a NeMo Conformer-CTC) whose letter probabilities are matched to the
expected text. The Qāf model is the same kind of model (a small Conformer-CTC trained on CAIR).

- **Off the page's thread.** An AudioWorklet sends the microphone straight to a Web Worker, which runs the model
  and the tracker. The page only draws.
- **A short look, often.** Every 0.12–0.4 s (slower devices look less often), the model looks at the last
  1.6 s of audio. That costs 60–250 ms, whatever the length of the ayah.
- **Frames are rewritten.** Each look replaces its recent letter probabilities with better ones, because by
  then it has heard a little more audio after each letter. This alone halved the delay on fast devices.
- **The recent past is re-aligned every time.** The tracker aligns the last few seconds against a window of the
  text around the reader (semi-global CTC alignment). An early slip by the tracker is corrected a moment later
  instead of sending it off course. It allows for:
  - pauses and held vowels;
  - a reader starting further on;
  - going back to repeat words;
  - something that is not in the text at all (a cough, a wrong word, the teacher talking).
- **Words are committed only forward, and only when they were really said.** Each letter of a word is looked
  for at its clearest moment while the reader is in that word. The word the reader lands on must be heard well
  before anything turns green, so a wrong word or a wrong ayah never moves the page on (see below).
- **A live cursor.** Several times a second the page learns which word the reader is in and how far into it.
  That word fills from right to left as it is said, before it is confirmed.

## Second round (7 November 2026): wrong words and going back

Two faults were reported after the first version went live: the tracker turned words green even when the reader
recited something wrong, and it kept moving forward when the reader went back to repeat. Both were reproduced
with a scenario test (recitations built from ayah recordings: normal, repeat an ayah, repeat two words, a wrong
ayah, one wrong word, a skipped ayah) and fixed:

| Scenario (Al-Fatiha) | Before | After |
|---|---|---|
| Normal | all 29 words; delay median 0.40 s, worst 1.75 s | all 29 words; median 0.39 s, worst 0.82 s |
| Al-Ikhlas recited after ayah 2 (wrong ayah) | ran on through ayahs 3–7 (10 words turned green) | stops; nothing after ayah 2 turns green; "That did not sound like the next words" |
| One wrong word in ayah 4 | accepted as "unclear" | marked missed (red); the rest of the ayah read |
| Ayah 3 left out | accepted as "unclear" | both words marked missed (red) |
| Going back to repeat ayahs 2 and 3 | cursor stayed put | cursor goes back, the repeated words light up again, the page waits |

What changed in `tracker.mjs`:

- **A word must be said to move the page.** The word the reader lands on needs its letters heard (each at its
  clearest moment, the weakest letter of a long word set aside, since long vowels and hamzas are often folded
  into a neighbour). Landing more than one word ahead needs two words in a row said well.
- **Mistakes are named.** A word passed over badly, or left out, is "missed". A word the reader ran into its
  neighbour (as in "bismillāh") is still "unclear", never a mistake: its letters are found around it.
- **Going back.** The tracker now looks up to 30 words behind the reader's place. When the reader repeats, the
  live cursor follows them back (`offset < 0` on `ql:align`) and the page lights the repeated words; nothing is
  committed until they come forward again.
- **Off the text.** After about two words' worth of letters that are not the text (silence never counts), the
  page shows a hint once (`ql:offtext`). It is not marked as a mistake; a word is only marked once the reader
  goes on past it.
- **The "Qāf aligner" menu option is gone** (main app). It was an earlier, weaker version of the same idea; a reader
  who had chosen it now gets the tracker.

Real-browser checks (Chrome, the real model, the microphone fed from a recording): the main app's Recite page
read all 29 words with a median delay of 0.51 s (worst 0.9 s); with the wrong ayah it stopped after ayah 2 and
showed the hint; with the repeat it lit the repeated words and carried on. The test voices are synthetic, so
please run the measuring workflow below on real Qaris.

## Checking it on real reciters

Actions → **Speech - measure the Qāf tracker** → Run workflow. It plays 25 ayahs each by Husary and Minshawy (not
in the model's training) and Alafasy (in it), and uploads `tracker-report.txt`:

- words tracked;
- typical, 90th-percentile and worst delay;
- correctly recited words wrongly flagged;
- words wrongly run on to.

Locally: `node tools/tracker/measure.mjs <model dir> <audio dir>` (set `DEVICE=1` for a fast computer).

The thresholds in `createTracker` (`weak`, `filler`, `jump`) were set on test recordings. The workflow's report
is what to tune them against.
