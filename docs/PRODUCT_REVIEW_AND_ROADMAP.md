# Ta'aleem · Repository review and product roadmap

## Executive assessment

The supplied repository is already a substantial learning platform. It should be developed as one integrated product, not replaced by a generic learning-management template. The current experience includes student accounts, camera/microphone setup, Qur'an recitation workflows, Alif Ba lessons, learning games, Story Time, a reading library, achievements, a Jannah Garden, a teacher voice studio, reporting, and a Three.js Seerah Quest.

The most important next step is not adding many disconnected mini-games. It is improving the student journey, strengthening teacher review and safeguarding, and expanding content in a controlled way.

## Current implementation inventory

| Area | Current implementation | Review |
|---|---|---|
| Student entry | Username/password sign-in, level selection and class password | Existing; test account recovery and teacher onboarding |
| Recitation | Hifz test and Mujawwadah with speech tracking, camera checks and reports | Core differentiator; validate with real students and varied devices |
| Alif Ba | 18 lessons, games and Jannah Garden | Substantial Level 1–4 foundation |
| Play & Learn | Arabic Letter Detective, Build the Ayah, Match the Deen, Journey to Knowledge, Salah Master, Akhlaq Heroes | Existing activity variety; strengthen curriculum mapping and assessment |
| Story Time | Illustrated manners stories with Qur'an/hadith endings | Content review required before classroom publication |
| Reading Library | Levelled readers and game activities | Existing; continue teacher review and reading-level validation |
| Rewards | Ta'aleem Stars, streaks, badges and garden growth | Positive intrinsic-progress approach; retain no public leaderboard |
| Seerah Quest | Three.js explorer world, source-linked narration, exploration, route/order/quiz/reflect interactions | Two episodes implemented; all 31 source passages currently have `pending` review status |
| Teacher tools | Voice Studio, Apps Script and Google Sheets class logging | Needs a clear teacher dashboard and privacy/role review |
| Deployment | Astro static build and GitHub Pages workflow | Existing; follow `BUILD_AND_DEPLOY.md` |

## Student experience direction

Use a consistent “learning world” metaphor without making every screen look like a game. Students should always understand: where they are, what they can do next, what they have completed, and how to return to the classroom.

### Proposed student home structure

1. **Welcome / My World** — greeting, level, personal progress and one clear “Continue learning” action.
2. **Today's Missions** — a small set of age-appropriate activities, not a long task list.
3. **Learning Worlds** — Qur'an & Hifz; Arabic & Alif Ba; Islamic Knowledge; Seerah Quest; Story & Reading; Character & Daily Life.
4. **My Journey** — personal stars, badges, completed missions and garden growth.
5. **Help & Safety** — teacher support, accessibility options, audio controls and privacy reminders.

Keep the existing visual identity (deep green, warm gold, cream, Arabic typography) but introduce more visual hierarchy, illustrated world tiles, clear progress markers and responsive touch targets. Avoid overstimulating effects, public rankings, loot-box mechanics, manipulative streak pressure or competitive scoring that shames students.

### Age adaptation

- **Levels 1–2:** simple navigation, large illustrated cards, short audio-led activities, limited text, immediate positive feedback.
- **Levels 3–4:** more autonomy, multi-step missions, maps, research prompts, source inspection, strategy and reflection.
- The Seerah Quest is currently limited to Levels 3–4 in `src/lib/activities.mjs`; retain that gate unless a teacher approves an adapted younger version.

## Learning activity expansion

The next content areas should map directly to the school's teaching sequence rather than exist as unrelated games:

| Learning strand | Suggested interactive formats | Learning evidence |
|---|---|---|
| Qur'an / Hifz | Recitation practice, ayah ordering, memorisation revision path | Accuracy, revision history, teacher feedback |
| Arabic | Letter detective, makhraj exploration, word-building, vocabulary trails | Recognition, pronunciation practice, vocabulary mastery |
| Hadith | Match a hadith to its theme, sequence a practical lesson, scenario reflection | Meaning understood, source/reference shown |
| Tawheed | Concept maps, scenario sorting, age-appropriate knowledge checks | Concept understanding and misconceptions |
| Dua & Salah | Arrange steps, complete a dua, daily-life scenario practice | Recall and practical sequence |
| Akhlaq / Seerah | Branching ethical decisions, historical map missions, reflective journal | Reasoned response, source-linked learning |
| Reading | Levelled reading, vocabulary, comprehension and read-aloud | Reading fluency and comprehension |

Every activity should have a teacher-visible learning objective, level, source/教材 reference, feedback rule and completion criterion. Do not award a mastery badge merely for clicking through content.

## Seerah Quest: proposed production standard

The existing 3D explorer experience is a strong prototype foundation. Preserve the explorer perspective, cinematic environmental design, and the rule that Prophets are never depicted.

### Episode structure

Each episode should contain:

1. **Historical setting** — time, place and context, without invented certainty.
2. **Explorer briefing** — what the student is investigating.
3. **Source-linked narration** — every historical claim linked to a passage in the source register.
4. **World exploration** — movement, landmarks, maps, objects and environmental puzzles.
5. **Mission sequence** — tasks that teach or reinforce the historical passage, not arbitrary gameplay.
6. **Knowledge check** — questions answerable from the presented source.
7. **Reflection** — a carefully framed lesson or value, clearly distinguished from the historical report.
8. **Explorer journal** — sources consulted, key facts learned and teacher feedback.

### Historical integrity rules

- Ibn Kathir's *al-Bidaya wa'l-Nihaya* is the selected source foundation for this series; cite the edition, volume and page for each passage.
- A citation to Ibn Kathir establishes where the report appears in that work; it does not by itself authenticate the chain or establish that all historians agree.
- Keep the application's `established`, `reported` and `excluded` editorial categories, but document their definitions and require a qualified reviewer to approve each passage.
- Do not present a reported/weak/contested account as settled fact. Label uncertainty in student-friendly language or omit the report from the mission.
- Have a qualified reviewer check Arabic transcription, translation, context, chronology, and whether a report is suitable for children.
- Keep historical narration separate from game-guide dialogue, imagined scenery, and reflective lessons.
- Do not invent conversations, motives, emotions, or actions for historical figures to make a mission more dramatic.
- Do not depict Prophets. Do not visually represent Allah. Use landscapes, architecture, maps, objects, calligraphy and non-figurative environmental storytelling.
- For copyrighted modern translations, use licensed text or original translations reviewed by a qualified person; do not copy a copyrighted translation wholesale.

### Current Seerah content status

- 2 playable episode definitions are present.
- 31 passages are in the source register.
- 21 passage IDs are used by historical narration; 2 reported passages are used as notes.
- All 31 entries show `review: pending` in the source data.
- The source record itself says translations are project translations and asks for review.

This is a strong traceability foundation, but not yet a scholar-reviewed publication. The new `npm run seerah` check validates source IDs and classifications; it deliberately does not claim to authenticate narrations.

## Teacher and parent experience

A production school platform should give teachers a dedicated view with:

- class roster and level assignment;
- assignment creation and due dates;
- activity completion and recitation reports;
- review queue for student work and content;
- student support notes with restricted access;
- exportable progress summaries;
- content approval state (draft, in review, approved, retired);
- clear privacy notices and retention rules.

Parents should see only their own child's progress, not class-wide student records. Student reports and class logs must remain private. Review authentication, authorization and Apps Script endpoint access before adding more student data.

## Priority implementation sequence

### Phase 1 — Stabilise and clarify (now)
- Keep existing sign-in, recitation, Alif Ba, stories, library and Seerah modules intact.
- Run the book and Seerah consistency checks.
- Establish teacher approval states for all educational content.
- Validate the GitHub Pages build and class-log integration.
- Add a clear build/deployment guide.

### Phase 2 — Student home redesign
- Reorganise the home screen into Learning Worlds.
- Add “Continue where you left off” based on existing progress data.
- Make age/level differences visible without duplicating the whole application.
- Improve mobile layout, keyboard support, reduced-motion behavior and low-bandwidth performance.

### Phase 3 — Teacher control centre
- Build class overview, assignments, review queue and student progress.
- Define role permissions and privacy rules before exposing additional student information.
- Use the current Google Sheets integration only as an interim data layer if it meets the school's governance needs.

### Phase 4 — Seerah Quest expansion
- Complete qualified review of the current 31 source passages.
- Improve the explorer journal and episode map.
- Add new episodes only after source and translation approval.
- Test performance on school laptops and tablets, including low-quality graphics mode.

### Phase 5 — Curriculum expansion and analytics
- Add Hadith, Tawheed, Dua and Islamic Studies activities aligned to school materials.
- Build teacher-friendly learning evidence and intervention indicators.
- Evaluate the activities with teachers and students before scaling.

## Definition of done for a release

A release is ready only when:

- the build passes from a clean install;
- core student journeys work on supported desktop and mobile devices;
- content has a recorded teacher/reviewer status;
- source-based activities expose their references;
- no Prophets are depicted;
- student data is private and access-controlled;
- low-bandwidth and accessibility behavior are acceptable;
- teachers have a clear way to report errors and request content changes;
- deployment and rollback steps are documented.
