# Ta'aleem Games: the plan (approved 16 November 2026)

Six games for **Play & Make**, adapted from the activity types in the "Beginner Reader Storybook / New" folder.
Approved by Ustadh Issah with the four decisions in section 8. Building starts with the Dhikr Maze.

**Where the ideas come from, and what we take.** The PDFs are from Madrasah Abu Hurairah, Twinkl, SmartArk and
IslamicResources4Teaching. SmartArk and IslamicResources4Teaching forbid copying or changing their material, and
the others are their own work too. So we take only the *kind* of activity (a maze, a word search, guess-who, a
ladder board, a timeline, a shape picture). Every word, picture, layout and fact in our games is our own. Every
religious fact comes from our checked library (`src/lib/sheikh-library.mjs`, the same rules as the Sheikh:
Qur'an, Sahih al-Bukhari, Sahih Muslim, and the established Ibn Kathir passages). Several things in the PDFs
fail that standard, so they are not used:
- the story of the old woman who threw rubbish (no authentic source);
- "he recited Surah Yasin as he walked out" (weak);
- "each SubhanAllah grows a tree in Jannah" (misquoted);
- the battles;
- the Ramadan fiqh pages (where the schools of law differ).

## 1. Rules every game keeps (so no scholar or parent has a question)

1. **Dhikr is said properly, never spammed.** The on-device Qāf tracker (already used in Ta'aleem Adventure) must
   hear the whole phrase. Saying it again quickly does nothing: each power has a cool-down, and the game asks
   for one calm, clear saying. No audio ever leaves the device.
2. **The game never claims dhikr does something in real life.** A power is a picture of what an authentic hadith
   teaches (table below), and the screen says so in plain words, e.g. "The Prophet ﷺ taught us to say SubhanAllah
   when going down (Sahih al-Bukhari 2993)". It never says "SubhanAllah makes you invisible".
3. **Worship is never ranked.** Recitation, du'a and dhikr earn no points and are never counted on a board. They
   are how you play, not your score. This keeps the rule we already have: "recitation is never ranked". Points come
   only from game skill: stars, time, moves.
4. **No frightening or questionable creatures.** No zombies, ghosts, skeletons, blood, or pictures of jinn or Shaytan.
   The chasers are the **Grumblies**: soft cartoon clouds of bad habits:
   - Grumble (complaining);
   - Snooze (laziness);
   - Huff (anger, from Level 3);
   - Fib (fibbing, Level 4).

   They *bump*, never eat. A bump pops your bubble and sends you back.
5. **No pictures of people of the Seerah.** No faces of prophets, companions or family members, ever. They appear
   as names in calligraphy. The player's token is never a person (a camel, a lantern, a boat). This is the same
   rule the mazes already follow.
6. **No dice.** Some scholars dislike dice games, so the ladder game moves by answering and saying, never by
   chance.
7. **No musical instruments.** Sound effects and voices only.
8. **Gentle failure.** No lives and no "game over". A bump sends you back to a crossroads (Levels 1–2) or the
   start (Levels 3–4, harder stages). Mistakes lead to a tip, never a penalty.
9. **Microphone needed for ranked play.** With no microphone, or with a teacher's exemption (speech difficulty), a
   child plays in *practice mode*: the phrase is shown, they say it aloud and tap. Practice runs are never on a board.

## 2. The dhikr powers (shared by the games)

| Say | When, in the game | What it does | Taught by (checked) | From level |
|---|---|---|---|---|
| **Bismillah** | to begin every stage, to open the gate | the traveller starts; the gate opens | Bukhari 5376: "O boy! Mention the Name of Allah…" | 1 |
| **SubhanAllah** | when a Grumbly comes near; going *down* stairs/slides | a bubble shield (L1 12 s, L2 10 s, L3 8 s, L4 6 s); safe slide down | Bukhari 2993: "whenever we went down a place we would say Subhan Allah" | 1 |
| **Alhamdulillah** | after picking up a date or water | a burst of speed (L2–3); at L4 a "light step" past Grumblies for 5 s | Muslim 2734: "Allah is pleased with His servant who says Al-Hamdu lillah while taking a morsel of food and while drinking" | 2 |
| **Allahu Akbar** | going *up* stairs or a ladder | climb | Bukhari 2993: "whenever we went up a place we would say Allahu Akbar" | 3 (ladder game: 1) |
| **A'udhu billahi min ash-shaytan ir-rajim** | when a Huff storm (anger) blocks the way | the storm calms and clears | Bukhari 3282 (a word that makes the anger go away) | 3 |
| **La hawla wa la quwwata illa billah** | at a treasure gate | the gate opens (a shortcut) | Bukhari 6384: "one of the treasures of Paradise" | 4 |
| **Hasbunallahu wa ni'mal wakil** | the final stage, once | a long shield | Bukhari 4563 (said by Ibrahim in the fire; Qur'an 3:173) | 4 |
| **Allahumma salli 'ala Muhammad** | whenever the Prophet ﷺ is named in a card | the game carries on | Muslim 408: "He who blesses me once, Allah would bless him ten times" | 1 |

The hadith texts above were checked word for word in the same sunnah.com editions as the Sheikh's library. They will
be added to the library through `scripts/sheikh/sources.mjs` and approved before any game shows them. Bukhari 3282
contains words that are not for children, so for that one the game shows only its reference, never its text.

## 3. One shape for every game

- **Four level tracks.** Every game has a track for each class level: Level 1 (ages 4–6), Level 2 (7–8), Level 3
  (9–10) and Level 4 (10–14). A child's ranked track is their own level. They may practise any other track.
- **Ten stages a track.** Stages 1–3 teach, 4–7 build up, 8–9 test, and 10 is the Final. Each new idea arrives
  alone on a card the first time, as in the mazes now.
- **Stars and points, per stage.**
  - ★ finish the stage;
  - ★★ the stage's collecting goal;
  - ★★★ beat the par (time or moves).

  Points: 100 per star, plus a speed bonus of up to 100, for at most 400 a stage. The best run counts.
- **Why the shape matters.** Every level has the same number of stages and points (6 games × 10 stages × 400 =
  24,000). So a Level 1 child on their track and a Level 4 child on theirs compete fairly on the all-levels board.
  (As built: the Dhikr Maze's two mazes, Makkah to Madinah and Tarawih, each count as a game on the boards, so the
  total is 7 × 10 × 400 = 28,000; it is the same for every level, so the board stays fair.)

## 4. Leaderboards

| Board | Ranks | Who is on it |
|---|---|---|
| **Stage** | the best time on one stage | my class / my level |
| **Game** | the total points in one game, on my level's track | my class / my level |
| **My level** | the total points across all six games | my class / my level (all classes at that level) |
| **All levels** | the total points across all games: **this week** and **all time** | the whole school |

- **Names:** first name and initial, plus a level badge. No photos. Parents can hide the name, which then shows as
  "a Ta'aleem student".
- **What it shows:** the top 10 and your own row. The bottom of a board is never shown. Ties go to whoever got
  there first.
- **Weekly board:** resets every week, so every child has a fresh chance.
- **Server:** the class server (Apps Script) already has the maze board. It is widened to these boards and checks
  each score is possible (e.g. no stage faster than the par allows).
- **Unchanged:** Guardians of Light stays a calm reading game with no boards (its own rule).

## 5. The games

### Game 1 · The Dhikr Maze: Makkah to Madinah (day) and To the masjid for Tarawih (night)
*From: Makkah to Madinah Maze, Ramadan Maze. These two mazes already exist; this adds the dhikr powers, the
Grumblies and the four tracks.*

**How it plays.** Guide the camel (or the lantern) to the goal. Say Bismillah to set off. Grumblies wander, and
from Level 2 some hunt. When one comes close, say SubhanAllah for the bubble shield. Pick up a date and say
Alhamdulillah for a burst of speed. At Levels 3–4 the mazes have floors joined by stairs: Allahu Akbar going up,
SubhanAllah going down. A Huff storm needs A'udhu billah, and a treasure gate needs La hawla. At the goal, a fact
card from the library tells one true thing about the Hijrah or about Tarawih.

**Stars.**
- ★ reach the goal;
- ★★ every date (or star);
- ★★★ within par time, and at Levels 3–4 with no bump.

| Stage | Level 1 (4–6) | Level 2 (7–8) | Level 3 (9–10) | Level 4 (10–14) |
|---|---|---|---|---|
| 1 | 5×5 · move, say Bismillah | 6×6 · recap: Bismillah, shield | 9×9 · recap: all Level 2 powers | 11×11 · recap |
| 2 | 5×5 · dates to collect | 7×7 · **Alhamdulillah** speed | 9×9 · **two floors**: Allahu Akbar up, SubhanAllah down | 11×11 · **treasure gates**: La hawla |
| 3 | 6×6 · a sleepy Grumbly in a dead end | 7×7 · walls that shift | 9×9 · **Huff storms**: A'udhu billah | 11×11 · **light step** (Alhamdulillah) |
| 4 | 6×6 · first roaming Grumbly · **SubhanAllah** shield | 8×8 · 2 Grumblies | 10×10 · a hunter + stairs | 12×12 · fast Fib Grumblies (sprint, then rest) |
| 5 | 6×6 · key and gate | 8×8 · key and gate | 10×10 · the key is on the other floor | 12×12 · three floors |
| 6 | 7×7 · a slow-shifting wall | 8×8 · sandstorm / dark night (fog) | 10×10 · from now a bump sends you to the start | 12×12 · 3 hunters + fog |
| 7 | 7×7 · 2 slow Grumblies | 9×9 · tunnels | 11×11 · fog + 2 hunters | 13×13 · storms + treasure + key |
| 8 | 7×7 · dates + key | 9×9 · first hunter (often loses the way) | 11×11 · tunnels + stairs + storms | 13×13 · fast-shifting walls |
| 9 | 8×8 · a wide lantern light (fog) | 9×9 · key + fog + 2 Grumblies | 11×11 · moves-and-time challenge | 13×13 · moves-and-time challenge |
| 10 Final | 8×8 · dates, key, 2 Grumblies | 10×10 · everything + par time | 12×12 · everything | 14×14 · everything; **Hasbunallah** shield once |

Speeds and timings will be tuned with the simulated player (`scripts/games/check.mjs`), so a steady child of that age
finishes every stage. Students keep the stars they have already earned on the current 15-stage ladder.

### Game 2 · Ladders of Good Character
*From: Snakes and Ladders – Prophetic Character. No dice, and no snakes: ladders and slides.*

**How it plays.** A board of squares. Each turn you draw a card:
- a **question** about good character (from the library, for your level);
- a **"say it" card** (a short du'a or dhikr, said correctly).

A good answer moves you forward: Level 1 always 2 squares; at higher levels 1–4 squares, by how well you did. Some
squares hold a good deed ("You shared your lunch"), and a ladder takes you up: say **Allahu Akbar** as you climb.
Others hold a bad habit ("You broke a promise"), and a slide takes you down: say **SubhanAllah** as you slide.
This follows Bukhari 2993 exactly. When the Prophet ﷺ is named, say the salawat to carry on.

- **Players:** play alone for the board (fewest turns), or pass-and-play with 2–4 classmates on one screen (not ranked).
- **Deed wording:** the everyday deed words are our own; every religious statement is a quotation.
- **Stars:** ★ reach the top; ★★ within par turns; ★★★ every "say it" card right first time. That last star is for
  saying it correctly, not for how many times; the board never counts dhikr.

| | Level 1 | Level 2 | Level 3 | Level 4 |
|---|---|---|---|---|
| Board | 30 squares, 3 ladders, 2 slides | 50 squares, 5 + 4 | 80 squares, 7 + 7 | 100 squares, 9 + 10 |
| Cards | picture cards, read aloud by the Sheikh; yes/no | 3 choices | 3 choices, "which hadith teaches…" | fill the gap, say the du'a |

Stages (the same themes at every level, in words for the age):
1. Honesty
2. Kindness
3. Patience
4. Generosity
5. Mercy
6. Keeping promises (trustworthiness)
7. Gratitude
8. Good speech
9. Cleanliness and salah
10. Final: all of them

### Game 3 · Who Am I? The Prophet's ﷺ nearest and dearest
*From: Guess Who – The Prophet's ﷺ Nearest and Dearest.*

**How it plays.**
1. Grandpa Musa thinks of a person.
2. You ask yes/no questions by tapping (or saying) question chips: "Was this person one of the first Muslims?",
   "Did this person make the Hijrah?"
3. The cards that no longer fit fold down, and you guess.
4. Say each name with *radiyallahu 'anhu / 'anha*. Say the salawat when the Prophet ﷺ is named.

- **The cards:** names in calligraphy, never faces. Every clue comes from the established Ibn Kathir passages or
  Bukhari/Muslim, and shows its source on the back.
- **Left out:** no clue mentions a death, a battle or a killing.
- **Stars:** ★ right guess; ★★ within the question limit; ★★★ par time.

| | Level 1 | Level 2 | Level 3 | Level 4 |
|---|---|---|---|---|
| Cards | 4 | 6 | 9 | 12–16 |
| Questions | 4 ready-made questions, read aloud | 6 to choose from | 8, some about the Seerah | many; the fewest questions wins |

Stages:
1. The Prophet's ﷺ family
2. The first Muslims
3. His closest companions
4. The women of his household
5. Those who made the Hijrah
6. The Ansar of Madinah
7. Those who called the adhan and taught the Qur'an
8. Mixed A
9. Mixed B
10. Final: everyone

**Left out:** people whose stories raise questions for children (e.g. Abu Talib, Abu Lahab).

### Game 4 · Word Hunt
*From: Word Search Pack, Ramadan Key Words, Animals in the Qur'an.*

**How it plays.** Find the hidden words in the grid. A found word turns gold only when you **say it aloud**
correctly: Arabic words through the on-device tracker, English words through the browser's speech service
(parents are already told about this in the settings). The theme's fact card comes only from the library, never
from the PDFs' facts.

- **Stars:** ★ every word found; ★★ every word said correctly; ★★★ par time. Saying a *word* is vocabulary, not
  worship, so it may count.

| | Level 1 | Level 2 | Level 3 | Level 4 |
|---|---|---|---|---|
| Grid | 5×5, 3 words | 7×7, 5 words | 9×9, 7 words | 12×12, 10 words |
| Directions | across only | across, down | + diagonal | all 8, including backwards |
| Words | letters and short words with pictures | English + Arabic (with harakat) | mixed | Arabic script |

Stages:
1. Wudu
2. Salah
3. Ramadan
4. Animals in the Qur'an. The surah names an-Naml, an-Nahl, al-Baqarah, al-Fil and al-'Ankabut: the Qur'an is the
   source.
5. The Islamic months
6. The five pillars
7. The three masjids (al-Haram, an-Nabawi, al-Aqsa)
8. Prophets named in the Qur'an
9. Qur'an words
10. Final: mixed

### Game 5 · The Seerah Timeline Train
*From: Sirah Timeline (from birth), Sirah Timeline (from the first revelation), Qur'anic Year Timeline.*

**How it plays.**
1. Event carriages arrive out of order. Put them in order and read each one aloud.
2. Say Bismillah, and the train sets off past the scenes.
3. A wrong carriage shows a gentle tip from its source.

**What goes in:**
- only events whose order is agreed, from the established Ibn Kathir passages;
- no battles;
- no deaths;
- no years that scholars dispute (for example, the year of al-Isra' wal-Mi'raj is left out).

- **Stars:** ★ right order; ★★ every carriage read aloud; ★★★ par time.

| | Level 1 | Level 2 | Level 3 | Level 4 |
|---|---|---|---|---|
| Carriages | 3, with pictures of places (no people) | 5 | 8 | 12, with ages and years |

Stages:
1. His birth and childhood
2. The first revelation
3. The first Muslims
4. Life in Makkah
5. The Hijrah journey
6. Building the Masjid in Madinah
7. Brotherhood in Madinah
8. The change of Qiblah
9. The Farewell Hajj
10. Final: his whole life

### Game 6 · Build a Masjid
*From: 2D Shape Masjid Picture, Design Your Own Prayer Mat.*

**How it plays.** Build a masjid picture from shapes. Say Bismillah to begin and name each shape. When it is done,
name your masjid and choose one good deed that happens inside it.

- **Levels 3–4:** the same idea grows into geometric star patterns: Islamic geometry with angles and symmetry.
- **Unlocking:** each finished stage unlocks a prayer-mat design. Mats follow Bukhari 373 (the garment whose
  markings distracted him in prayer): simple patterns, never pictures of living things.
- **Stars:** ★ finished; ★★ every shape named; ★★★ par time.

| | Level 1 | Level 2 | Level 3 | Level 4 |
|---|---|---|---|---|
| Pieces | 5 big shapes, outlines shown | 10 shapes, half outlined | tile a star pattern (6–8 pieces) | build a pattern from a rule (angles, rotation) |

Stages: 10 masjids and patterns, from a small village masjid to the domes and minarets of famous masjids (buildings
only).

## 6. The rest of the folder, for My Books (after the games)

| PDF | Becomes | Levels |
|---|---|---|
| Ramadan Key Words colouring, Qualities of Muhammad ﷺ (al-Amin, as-Sadiq) | "Colour and Learn": tap-to-colour pages with the word read aloud | 1–2 |
| Animals in the Qur'an | a picture book: each animal, its Arabic name and the surah named after it | 1–2 |
| My Salah Journal, Sadaqah Jar, the Ramadan good-deeds tree and tracker | "My Good Deeds": a private tracker, never on a board | 1–4 |
| Kindness Postcards | a kindness-card maker | 1–4 |
| Design Your Own Prayer Mat | the mat designer (also unlocked in Game 6) | 1–4 |
| Family Tree of the Prophet ﷺ (short and long) | an interactive family-tree page: names only, from Ibn Kathir | 3–4 |
| A Description of my Beloved Messenger ﷺ | a fill-in page, words only (no picture), only descriptions in Sahih al-Bukhari | 3–4 |
| Letter to My Younger Self, Growing Together, Effective Speech Targets, the Seerah poem | "My Reflections": a private journal with these prompts, written our own way | 3–4 |
| The Ramadan pack's fiqh pages, recipes, and anything with Twinkl/SmartArk art | **not adapted** | – |

## 7. Order of building

1. The Dhikr Maze (it reuses the maze engine and the tracker) and the leaderboards.
2. Ladders of Good Character.
3. Word Hunt.
4. Who Am I? and the Timeline Train.
5. Build a Masjid.
6. The My Books pages.

Each game is tested with the simulated player, and its religious content passes `scripts/sheikh/try.mjs`-style checks
before it is switched on.

## 8. Decisions (approved by Ustadh Issah, 16 November 2026)

1. The ladder game moves by answering, not by dice.
2. The school-wide board shows first name and initial, and parents can hide the name.
3. The two mazes are rebuilt into the four 10-stage tracks; students keep the stars they already have.
4. Ranked play needs the microphone; everyone else plays in practice mode.
