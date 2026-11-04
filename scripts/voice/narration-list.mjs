// Lists every English line the classroom reads aloud (Story Time and the Seerah Quest), for make_narration.py.
// Writes scripts/voice/narration.json: [{ key, reader, text (as shown), parts: [[who, words as spoken]] }]
import fs from 'node:fs';
import { VOICES, spoken, clipKey, parts, STORY_LINES } from '../../src/lib/narration-text.mjs';
import { STORIES } from '../../src/lib/stories/level1.mjs';
import { EPISODES } from '../../src/lib/seerah/episodes.mjs';

const SRC = JSON.parse(fs.readFileSync(new URL('../../src/data/seerah/sources.json', import.meta.url)));
const out = new Map();
const add = (reader, text, where) => {
  if (!text) return;
  const key = clipKey(VOICES[reader], text);
  if (out.has(key)) return;
  const ps = reader === 'story' ? parts(text, where) : [['narrator', text]];
  out.set(key, { key, reader, text, parts: ps.map(([who, w]) => [who, spoken(w)]) });
};

// Story Time: every page, every tap, the question and answers, the hadith or ayah
for (const st of STORIES) {
  st.pages.forEach((p, i) => { add('story', p.t, `${st.id}:${i}`); add('story', p.tap?.say, `${st.id}:${i}:say`); });
  add('story', `${st.ask.q} ${st.ask.options.join('? ')}?`);
  add('story', st.ask.why);
  add('story', st.hadith ? st.hadith.en : st.quran.en);
}
for (const k of Object.values(STORY_LINES)) add('story', k);

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
const list = [...out.values()];
fs.writeFileSync(new URL('./narration.json', import.meta.url), JSON.stringify(list, null, 1) + '\n');
const words = list.reduce((n, x) => n + x.parts.reduce((m, [, w]) => m + w.split(' ').length, 0), 0);
console.log(`${list.length} lines (${words} words): ${list.filter((x) => x.reader === 'story').length} story, ${list.filter((x) => x.reader === 'seerah').length} seerah`);
