# Ta'aleem design system

The rules every screen of Ta'aleem follows. Read this before changing anything visual.

**There are two styles.** Levels 3 and 4 (and every grown-up screen) use the calm **standard style** described
first. Levels 1 and 2 (ages 4 to 8) use the **young learners' style** (see that section): brighter, drawn,
with sound and bounce. The religious and content rules apply to both. Do not merge the two styles.
It comes from the Professional Website Redesign Kit (Phases 1 and 2) and from Ta'aleem's own choices.

Ta'aleem is an Islamic education platform. It should feel like a respected learning institution that uses
digital tools thoughtfully: calm, warm, credible and well organised. It must never look like a generic
technology template or an AI-generated page.

## Where the system lives

| File | What it holds |
|---|---|
| `src/styles/system.css` | The tokens (colours, type, spacing, corners) and the shared components. Loaded last. |
| `src/lib/home-icons.mjs` | The one icon family (line icons in round medallions). |
| `src/lib/kids-home.mjs` | The Classroom home for every level (the night scene for Levels 3 and 4, the picture scene for Levels 1 and 2). |
| `public/img/home/` | The school's own Canva pictures for the young learners' home (scene and five places). |

Use the tokens. Do not write new hex colours into a stylesheet or a script: add a token, or use an existing one.

## Colour

| Token | Hex | Use |
|---|---|---|
| `--forest` | `#173D32` | The anchor: headers, primary buttons, headings on light surfaces |
| `--forest-deep` | `#0F2A22` | Deep panels and hover states |
| `--ivory` | `#F7F4EA` | The main background and the tiles on dark scenes |
| `--white` | `#FFFFFF` | Clear surfaces (forms, cards) |
| `--sage` / `--sage-soft` | `#A9B9A0` / `#E9EEE4` | Gentle variation, selected states |
| `--gold` | `#B99A5B` | Fine accents only (rules, stars, focus on dark) |
| `--gold-text` | `#7A6232` | Gold *text* on light surfaces (plain `--gold` fails contrast there) |
| `--terracotta` | `#B96F50` | A rare warm accent |
| `--ink` / `--ink-muted` | `#292D29` / `#5C625B` | Body text and secondary text |

On the dark night scene, text is ivory `#F7F4EA`, secondary text is ivory at 70 to 80%, and the one warm
highlight (the child's name, an Arabic subject title) is light gold `#DCC48E`.

**Never use (standard style):** purple or blue gradients, teal-to-blue skies, neon or candy colours, glossy multi-stop gradients
on icons, bright yellow `#FFE08A`-style highlights, or the old greens `#0E6B4E` and `#12603A`.

## Type

- **Headings:** Lora (600; italic 500 for one highlighted word, such as the child's name).
- **Text and controls:** Manrope (400 to 800).
- **Arabic labels:** Amiri.
- **Qur'anic text only:** KFGQPC Hafs (`--font-quran`). Never use it as decoration.
- No other font families.

## Spacing and corners

- Spacing: 4, 8, 12, 16, 24, 32, 48, 64, 88, 112 px (`--s-1` to `--s-10`). Content width about 1200 px.
- Corners: 8 px for controls (`--r-control`), 14 px for surfaces (`--r-surface`), 18 px for large panels,
  6 px for small tags. **No pill shapes** for buttons or tags.
- Prefer borders and tone over shadows. At most one quiet shadow.

## Components

- **Primary button:** forest, white text, 48 px tall, 8 px corners, a plain arrow for "go" actions.
- **Secondary button:** white or transparent, forest border and text.
- **Header:** a plain full-width bar (ivory with a bottom rule, or forest on dark screens). No floating or glass bar.
- **Cards:** only when content is genuinely grouped or actionable. Never a card inside a card.
- **Icons:** one family only, from `home-icons.mjs`: 24 px grid, 1.6 stroke, round joins, inside a round
  medallion in a muted tone (sage, sand, gold, clay, forest, stone). **No emoji as icons.** No 3D clip-art
  mixed with line icons.
- **Focus:** always visible: forest ring on light surfaces, gold ring on dark ones.
- **Motion:** 150 to 250 ms, small movements only (2 to 3 px), and none under reduced motion.

## The Classroom home (Levels 3 and 4; Levels 1 and 2 follow the same structure in the young learners' style)

The home answers one question: *what should I do next?*

1. One scene: for Levels 3 and 4 the forest night sky with fixed stars, a crescent and the mosque and palm skyline;
   for Levels 1 and 2 the school's sunny courtyard picture.
2. A centred greeting ("Assalamu alaikum, *Name*") and the Hijri date.
3. One **Continue** button for the last activity opened.
4. Big labelled tiles, and nothing else. **Details appear only after a tile is opened.**
   - Levels 1 and 2: one tile per place (letters, du'as, stories, Qur'an, games, garden, stars).
     Pointing at a tile says its name; on a touch screen the first tap says it and the second opens it.
   - Levels 3 and 4: one tile per subject (Qur'an, Arabic, Knowing Allah, Seerah, Hadith, Akhlaq,
     Du'a & Salah, Adventures, Games, Today's missions, Achievements, Garden). An opened subject shows its
     activities as rows, each with one line of description, and an "All subjects" button to go back.
5. "Grown-up view: see every activity as a list" stays one tap away.

No streak counters, no public rankings, no "NEW" badges, no pressure words.

## Young learners' style (Levels 1 and 2, ages 4 to 8)

Inspired by the best early-learning sites (for example Starfall): big bright pictures to tap, a friendly drawn world,
sound first, bouncy feedback and very little text. Ta'aleem uses its **own** art and characters, never another
site's art, layout, characters or branding.

- **Scene:** the school's Canva picture (`public/img/home/scene-wide.webp`, `scene-phone.webp`) under a soft light veil.
- **Tiles:** white, 26 px corners, a 3 px white border and a soft drop shadow. Each has a big round picture
  (the Canva pictures, or the colourful drawn icons in `ICONS` in `src/lib/activities.mjs`) on its own soft
  bright colour (`color` in `showKids()`). One short label, 16 to 19 px, extra-bold.
- **Colour:** leaf green `--leaf` (`#23774A`) for the main action and highlights, `--leaf-deep` for the header,
  sun yellow `--sun` (`#F6C64B`) for the hover border, and soft pastels behind the pictures. Text stays dark
  (`#0F2A22`) for contrast.
- **Sound first:** pointing at a tile says its name; on a touch screen the first tap says it and the second opens it.
- **Motion:** a springy lift on hover (6 px up, 4% larger) and a bounce when a tile is said. None under reduced motion.
- **Activity screens** for these levels (`body[data-age="young"]`): 14 px button corners, leaf-green primary
  buttons, 20 to 22 px card corners.
- **Still never:** emoji as icons, neon colours, glossy multi-stop gradients, glass, "NEW" badges, streaks or timers
  that pressure a child.

## Activity and game screens

- **Home screens of an activity** (the Seerah Quest, Guardians of Light): a forest banner with a faint geometric
  pattern, a Lora title, light-gold kicker, ivory text, and one ivory "Start" button with an arrow. Below it,
  white panels with a 1 px rule, ivory cards, forest buttons. Locked items are a quiet stone tone, not dark navy.
- **Figures** (shards, seals, books read, stars): a ruled row of numbers, never glass pills.
- **No streaks anywhere** (no fire emoji, no "days in a row"): nothing is lost by missing a day.
- **Speakers and sound:** the drawn line speaker (`ic-say`), never emoji speakers.
- **Play & Make games:** level choice is a row of 8 px buttons with the chosen one in forest; every game with
  controls to learn shows one "How to play" line under its title (`help` in `src/lib/games/index.mjs`).
- **Inside the 3D games** (the HUD, the panels) the game keeps its own look; change it only with the gameplay
  harnesses passing.

## Content rules (from the kit)

- Never invent Qur'anic verses, hadith, Arabic text, translations, scholarly claims, teacher credentials,
  testimonials, statistics or accreditation.
- Never use sacred text as decoration, a game token, an obstacle or a texture (in both styles).
- Never depict prophets, angels or the Companions, in any style. The Qur'an appears as text only in reading contexts.
- Do not imply that an app replaces a qualified teacher.
- Rewards say what earned them. Participation and teacher-verified mastery are kept apart.

## Checks before shipping a visual change

- 360, 390, 768, 1024 and 1440 px wide: no horizontal scroll, nothing cut off.
- Keyboard: every control reachable, focus visible.
- Contrast: body text at least 4.5:1; large text and focus rings at least 3:1.
- Arabic shapes correctly and reads right to left.
- The games still play (`scratchpad` harnesses or a manual run), and sign-in and sessions still reach the class log.
