// Lists every English line the classroom reads aloud (Story Time and the Seerah Quest), for make_narration.py.
// Writes scripts/voice/narration.json: [{ key, voice, text (as shown), say (as spoken) }]
import fs from 'node:fs';
import { VOICES, SPEED, spoken, clipKey, STORY_LINES } from '../../src/lib/narration-text.mjs';
import { STORIES } from '../../src/lib/stories/level1.mjs';
import { EPISODES } from '../../src/lib/seerah/episodes.mjs';

const SRC = JSON.parse(fs.readFileSync(new URL('../../src/data/seerah/sources.json', import.meta.url)));
const out = new Map();
const add = (voice, text) => { if (!text) return; const v = VOICES[voice], key = clipKey(v, text); if (!out.has(key)) out.set(key, { key, voice: v, speed: SPEED[voice], text, say: spoken(text) }); };

// Story Time: every page, every tap, the question and answers, the hadith or ayah
for (const st of STORIES) {
  for (const p of st.pages) { add('story', p.t); add('story', p.tap?.say); }
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
const words = list.reduce((n, x) => n + x.say.split(' ').length, 0);
console.log(`${list.length} lines (${words} words): ${list.filter((x) => x.voice === VOICES.story).length} story, ${list.filter((x) => x.voice === VOICES.seerah).length} seerah`);
