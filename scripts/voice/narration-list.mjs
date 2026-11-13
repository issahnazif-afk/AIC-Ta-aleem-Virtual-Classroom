// Lists every English line the classroom reads aloud (Story Time, the Reading Library and the Seerah Quest), for make_narration.py.
// Writes scripts/voice/narration.json: [{ key, reader, text (as shown), parts: [[who, words as spoken]] }]
import fs from 'node:fs';
import { VOICES, spoken, clipKey, parts, STORY_LINES, LIBRARY_LINES, wordForVoice } from '../../src/lib/narration-text.mjs';
import { STORIES } from '../../src/lib/stories/level1.mjs';
import { EPISODES } from '../../src/lib/seerah/episodes.mjs';
import { LEVEL1 } from '../../src/lib/library/level1.mjs';
import { LEVEL2 } from '../../src/lib/library/level2.mjs';
import { ADDED } from '../../src/lib/library/added.mjs';
import { TAWHEED } from '../../src/lib/library/tawheed.mjs';
import { PROPHETS } from '../../src/lib/library/prophets.mjs';
import { BOOKS as HUDA_BOOKS } from '../../src/lib/books/index.mjs';
import { DUAS } from '../../src/lib/deen/duas.mjs';
import { SUNNAH } from '../../src/lib/deen/sunnah.mjs';
import { VIRTUES, DAY, LIFE } from '../../src/lib/deen/prophet.mjs';
import { ALL_LINES as GAME_LINES } from '../../src/lib/games/lines.mjs';

const SRC = JSON.parse(fs.readFileSync(new URL('../../src/data/seerah/sources.json', import.meta.url)));
const out = new Map();
const add = (reader, text, where) => {
  if (!text) return;
  const key = clipKey(VOICES[reader], text);
  if (out.has(key)) return;
  const ps = reader === 'story' ? parts(text, where) : [['narrator', text]];
  out.set(key, { key, reader, text, parts: ps.map(([who, w]) => [who, spoken(w, true, reader === 'sheikh')]) });
};

// Story Time: every page, every tap, the question and answers, the hadith or ayah
for (const st of STORIES) {
  st.pages.forEach((p, i) => { add('story', p.t, `${st.id}:${i}`); add('story', p.tap?.say, `${st.id}:${i}:say`); });
  add('story', `${st.ask.q} ${st.ask.options.join('? ')}?`);
  add('story', st.ask.why);
  add('story', st.hadith ? st.hadith.en : st.quran.en);
}
for (const k of Object.values(STORY_LINES)) add('story', k);

// The Reading Library: the same as Story Time, plus (Level 1 only) the quiz questions and the picture words.
// Level 2 games are read by the child, so they are not narrated.
for (const b of [...LEVEL1, ...LEVEL2, ...ADDED, ...TAWHEED, ...PROPHETS]) {
  const L1 = b.level === 1 || /^l1-/.test(b.id);
  b.pages.forEach((p, i) => { add('story', p.t, `${b.id}:${i}`); add('story', p.tap?.say, `${b.id}:${i}:say`); });
  add('story', `${b.choose.q} ${b.choose.options.join('? ')}?`);
  add('story', b.choose.why);
  add('story', b.hadith ? b.hadith.en : b.quran.en);
  if (L1) { for (const q of b.quiz) add('story', q.q); for (const w of b.words) add('story', w.w); }
}
for (const k of Object.values(LIBRARY_LINES)) add('story', k);

// The Ta’aleem Books for Levels 1 and 2 (read aloud from the start). Levels 3 and 4 read for themselves, and
// their pages use the browser's voice if a student turns reading aloud on.
for (const b of HUDA_BOOKS.filter((x) => x.level <= 2)) {
  for (const c of b.chapters) for (const p of c.pages) {
    add('story', p.say); add('story', p.prompt);
    if (b.level === 1 && p.h) add('story', p.h);
    for (const t of p.text ?? []) { if (typeof t === 'string') add('story', t); else if (t.note) add('story', t.note.t); else if (t.list) t.list.forEach((x) => add('story', x)); }
    if (p.type === 'dua') { add('story', p.when); add('story', p.en); }
    if (p.type === 'hadith' || p.type === 'ayah') add('story', p.en);
    for (const it of p.items ?? []) if (it && typeof it === 'object' && !Array.isArray(it)) { add('story', it.q); if (it.why) { add('story', `Right! ${it.why}`); add('story', `That's it. ${it.why}`); } if (b.level === 1) { add('story', it.a); (it.w ?? []).forEach((w) => add('story', w)); } }
    for (const t of p.tap ?? []) if (t.en && !t.latin && !t.letter) add('story', wordForVoice(t.en)); else if (t.letter) add('story', t.en);
  }
}
for (const k of ['All done. Turn the page.', 'All matched! Turn the page.', "That's the right order!", 'All sorted! Turn the page.', 'Masha Allah! Turn the page.',
  "Masha'Allah! Well done.", 'Good work. Try it again to earn three stars.', 'You finished it. Read it again and try once more.',
  'Tap one on the left, then its partner on the right.', 'Tap them in the right order.', 'Tap a card, then the basket it goes in.']) add('story', k);

// My Deen (read aloud for Levels 1 and 2): the du'as' meanings, the sunnahs, the Prophet's ﷺ character, the day and his life
for (const d of DUAS) { add('story', d.when); add('story', d.en); }
for (const x of SUNNAH) { add('story', x.title); add('story', x.do); add('story', x.en); }
for (const v of VIRTUES) { add('story', v.title); add('story', v.text); add('story', v.hadith.en); add('story', v.story?.en); add('story', v.today); }
for (const x of [...DAY, ...LIFE]) { add('story', x.title); add('story', x.text); }
add('story', 'What can I do today?');
// the du'a lesson (the meaning of a du'a is read only when the student taps Translation)
for (const t of ["Get ready to learn this du'a.", 'Now get ready to repeat after me.', "Well done! Say it once more, or go on to the next du'a."]) add('story', t);
// the picture home (Levels 1 and 2) says each place's name
// Play & Make (src/lib/games/lines.mjs): the games' instructions and cheers for Levels 1 and 2
for (const t of GAME_LINES) add('story', t);
for (const t of ['My letters', "My du'as", 'Sunnah of the day', 'Our Prophet sallallahu alayhi wa sallam', 'Stories', 'My books', 'Reading Library', 'Knowing Allah', 'Stories of the Prophets', "Qur'an", 'Games', 'Special days', 'My garden', 'My stars', 'Back', 'Mazes']) add('story', t);

// The Seerah Quest: the passages from al-Bidaya, the explorer's guide, the questions and the reflections
for (const p of SRC.passages) if (p.class !== 'excluded') add('seerah', p.en);
const questSrc = fs.readFileSync(new URL('../../src/lib/seerah/quest.mjs', import.meta.url), 'utf8');
for (const m of questSrc.matchAll(/kicker: 'Watch', text: '([^']+)'/g)) add('seerah', m[1].replace(/\\'/g, "'"));
for (const ep of EPISODES) for (const s of ep.steps) {
  if (s.do === 'guide') add('seerah', s.text);
  if (s.do === 'quote') add('seerah', s.en);
  if (s.do === 'choice') add('seerah', s.q);
  if (s.do === 'reflect') add('seerah', s.prompt);
  if (s.do === 'search') for (const sp of s.spots) add('seerah', sp.note);
}
// The Sheikh's chat before a recitation (src/lib/sheikh-chat.mjs): every sentence he can say, in his own voice
const { allSpoken } = await import('../../src/lib/sheikh-chat.mjs');
for (const t of await allSpoken()) add('sheikh', t);
// and everything in his conversation library (src/lib/sheikh-library.mjs), which the AI chooses from
const { spk } = await import('../../src/lib/sheikh-chat.mjs');
const { library, INTROS } = await import('../../src/lib/sheikh-library.mjs');
for (const x of await library()) add('sheikh', spk(x.text));
for (const t of Object.values(INTROS).flat()) add('sheikh', spk(t));
// the riwāyah classroom (src/quran/lib/riwayat/course.mjs): every topic he teaches and everything he says around it
const { allLines: riwayahLines } = await import('../../src/quran/lib/riwayat/course.mjs');
for (const t of riwayahLines()) add('sheikh', t);
// the tajweed classroom (src/lib/tajweed/course.mjs): every point of every level's course, and the lines around it
const { allLines: tajweedLines } = await import('../../src/lib/tajweed/course.mjs');
for (const t of tajweedLines()) add('sheikh', t);

const list = [...out.values()];
fs.writeFileSync(new URL('./narration.json', import.meta.url), JSON.stringify(list, null, 1) + '\n');
const words = list.reduce((n, x) => n + x.parts.reduce((m, [, w]) => m + w.split(' ').length, 0), 0);
console.log(`${list.length} lines (${words} words): ${list.filter((x) => x.reader === 'story').length} story, ${list.filter((x) => x.reader === 'seerah').length} seerah`);
