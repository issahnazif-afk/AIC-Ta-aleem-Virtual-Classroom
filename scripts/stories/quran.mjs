// Takes the Qur'an words used by the stories and the Reading Library from the Tanzil text (sources/), so the Arabic is never typed by hand.
// Writes src/data/stories-quran.json. Run after `npm run data`:  node scripts/stories/quran.mjs
import fs from 'node:fs';
import { STORIES } from '../../src/lib/stories/level1.mjs';
import { LEVEL1 } from '../../src/lib/library/level1.mjs';
import { LEVEL2 } from '../../src/lib/library/level2.mjs';
import { ADDED } from '../../src/lib/library/added.mjs';
import { TAWHEED } from '../../src/lib/library/tawheed.mjs';
const out = {};
for (const st of [...STORIES, ...LEVEL1, ...LEVEL2, ...ADDED, ...TAWHEED]) {
  if (!st.quran) continue;
  const { s, a, w: [w0, w1] } = st.quran;
  const sura = JSON.parse(fs.readFileSync(new URL(`../../public/data/surah/${String(s).padStart(3, '0')}.json`, import.meta.url)));
  const words = sura.ayahs[a - 1].ar.split(' ');
  if (!(w0 >= 1 && w1 <= words.length && w0 <= w1)) throw new Error(`${st.id}: words ${w0}-${w1} are outside ${s}:${a}`);
  // the word-by-word recordings (quran.com) count only words, not the small pause marks (ۚ ۖ ۛ) that Tanzil writes as words
  const mark = (w) => /^[\u06D6-\u06ED]+$/.test(w);
  const real = (n) => words.slice(0, n).filter((w) => !mark(w)).length;   // real words among the first n
  const wbw = [real(w0 - 1), real(w1) - 1];                                  // 0-based, first and last
  out[`${s}:${a}:${w0}-${w1}`] = { ar: words.slice(w0 - 1, w1).join(' '), surah: sura.en, s, a, wbw, whole: w0 === 1 && w1 === words.length };
  console.log(st.id, s + ':' + a, out[`${s}:${a}:${w0}-${w1}`].ar);
}
fs.writeFileSync(new URL('../../src/data/stories-quran.json', import.meta.url), JSON.stringify(out, null, 1) + '\n');
