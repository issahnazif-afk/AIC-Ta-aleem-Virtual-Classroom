# The Ta'aleem curriculum path

How the Virtual Classroom is meant to work as a weekend school online: seven learning worlds, four levels, and a
clear route through each one. The home page's **Choose your adventure** shows the worlds; every activity is tagged
with the worlds it belongs to in `src/lib/activities.mjs` (`worlds: [...]`).

## The idea

Each world is a strand that runs from Level 1 to Level 4. A child meets the same big ideas every year, a little
deeper each time (a spiral), so nothing is learned once and forgotten. Every unit follows the same rhythm:

1. **Meet it**: a picture book or a short lesson (read aloud for Levels 1–2).
2. **Play it**: the book's games, or a Play & Learn game.
3. **Live it**: one "What would you do?" choice, taken home.
4. **Show it**: stars, passport stamps, and the teacher's class log.

| Level | Ages | Reading | How a lesson feels |
|---|---|---|---|
| 1 | 4–6 | read to them; sentences of 12 words or fewer | wonder, a picture, one idea, tap and say |
| 2 | 7–8 | reading with help; 18 words or fewer | a story with a problem, new words with meanings |
| 3 | 9–10 | reading alone | the idea named and explained, a story, a short task |
| 4 | 10–14 | textbook | units, evidence from Qur'an and Sunnah, tests |

## The seven worlds

Status: ✅ ready · 🟡 partly there · ⬜ planned

| World | Level 1 | Level 2 | Level 3 | Level 4 |
|---|---|---|---|---|
| **Qur'an** | ✅ Alif Ba lesson 18, Recite (no camera) | ✅ Mujawwadah, Build the Ayah | ✅ Hifz test, Mujawwadah | ✅ Hifz test |
| **Arabic** | ✅ Alif Ba, Letter Detective | ✅ Alif Ba (tajweed lessons) | ⬜ reading fluency | ⬜ |
| **Tawheed** | ✅ 6 books: *Allah Made Everything* | ✅ 6 books: *Who Is My Lord?* | ⬜ *La ilaha illallah* (bridge) | 🟡 the school's textbook, Volume One (Canva), to be brought in |
| **Seerah** | 🟡 Journey to Knowledge | 🟡 Journey to Knowledge | ✅ Seerah Quest | ✅ Seerah Quest |
| **Hadith** | ✅ a hadith with every story and book | ✅ the same | ⬜ 40 short hadith with stories | ⬜ |
| **Akhlaq** | ✅ Story Time (22), Library, Akhlaq Heroes | ✅ Library, Akhlaq Heroes | 🟡 Akhlaq Heroes | 🟡 Akhlaq Heroes |
| **Du'a & Salah** | ✅ Salah Master, Match the Deen | ✅ the same | ⬜ | ⬜ |

## Tawheed, level by level

The same three ideas come back every year: **Allah is the Lord** (Rububiyyah: He creates, provides and runs
everything), **Allah alone is worshipped** (Uluhiyyah: du'a, trust and worship for Him only), and **His beautiful
Names** (al-Asma' was-Sifat).

**Level 1 · Allah Made Everything** (`src/lib/library/tawheed.mjs`, ready)
Who Made the Moon? (Creator) · One, Only One (Allah is One, 112:1) · Rain for the Flowers (the Provider) ·
Allah Hears a Whisper (He hears, 2:186) · Who Made the Dates? (thanking Him) · The Tiny Ant (He sees, 67:19)

**Level 2 · Who Is My Lord?** (ready)
The Night Walk (Rububiyyah, 3:191) · The Bird Feeder (Ar-Razzaq and tawakkul, Tirmidhi 2344) ·
The Lucky Bracelet (no charms, du'a to Allah alone, 1:5) · A Name on the Fridge (Ar-Rahman, As-Sami', 7:180) ·
The Boy Who Asked Questions (Ibrahim and the stars, 6:76–79, 21:69) · Ahad, Ahad (Bilal ibn Rabah, 2:163)

**Level 3 · La ilaha illallah** (planned, the bridge to the textbook)
1. What the words mean: the "no" and the "except Allah"
2. Why we were created (51:56), told through Salman al-Farisi's search for the truth
3. Signs in creation: the cell, the bee, the water cycle
4. Du'a and trust in daily life
5. Ten Names of Allah and what each one asks of us
6. Shirk in daily life: charms, horoscopes, "lucky" things, showing off

**Level 4 · Tawheed: Islamic Monotheism, Volume One** (the school's own textbook in Canva, ages 10–14)
Unit 1 Introduction to Tawheed · Unit 2 Tawheed ar-Rububiyyah · Unit 3 Tawheed al-Uluhiyyah ·
Unit 4 al-Asma was-Sifat · Unit 5 Iman in Practice · Unit 6 Tawheed in Daily Life, each with its lessons,
activities and unit test. Brought into the classroom as lessons with the textbook's own illustrations, a quiz
after each lesson and the unit test at the end.

## Sources and how we use them

| Source | What it is | How we use it |
|---|---|---|
| Qur'an (Tanzil text) | the Uthmani text | quoted exactly, never typed by hand (`scripts/stories/quran.mjs`) |
| Sahih hadith collections | Bukhari, Muslim, Tirmidhi and others | quoted with the collection and number; weak narrations are left out |
| The school's Tawheed textbook (Canva) | the school's own book | adapted freely: text, structure and illustrations |
| Ibn Kathir, *al-Bidaya wan-Nihaya* and *Tafsir* | the Arabic originals are centuries old and free to use | the stories of the Prophets and the explanation of the ayat follow them, **retold in our own words**. The English translations on archive.org carry no licence (they are modern, copyrighted translations), so none of their wording is copied |
| *Smiling Child* (islamicpublishing.org) | a preschool colouring book, marked "All Rights Reserved", with no licence for adaptation | used only as a reference for themes (the Prophet's smile, manners for little ones). Our books are written fresh, and nothing is copied from it |

## Writing for children

Every book is checked by `npm run books` (`scripts/stories/lint.mjs`): sentence length by level, and the patterns
in Wikipedia's "Signs of AI writing" guide (stock words such as *delve* or *testament*, "not just … but",
the rule of three, summary endings, em dashes, sermon-like morals). The moral is shown, not preached: the last
page of a story ends on something a child would do or say, and the lesson sits in the "What would you do?".

## What comes next

1. Tawheed Level 4 from the textbook, with its illustrations (needs the Canva pages exported).
2. Tawheed Level 3.
3. Hadith world: forty short hadith for Levels 3–4, each with a story.
4. Du'a & Salah world: daily du'as with audio for Levels 1–2.
5. Akhlaq Levels 3–4: longer stories with real dilemmas.
6. Teacher side: assign a world unit to a class and see who finished it (needs the class log to carry unit IDs).
