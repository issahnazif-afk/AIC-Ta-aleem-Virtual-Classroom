// Takes the Qur'an words used by the stories from the Tanzil text (sources/), so the Arabic is never typed by hand.
// Writes src/data/stories-quran.json. Run after `npm run data`:  node scripts/stories/quran.mjs
import fs from 'node:fs';
import { STORIES } from '../../src/lib/stories/level1.mjs';
const out = {};
for (const st of STORIES) {
  if (!st.quran) continue;
  const { s, a, w: [w0, w1] } = st.quran;
  const sura = JSON.parse(fs.readFileSync(new URL(`../../public/data/surah/${String(s).padStart(3, '0')}.json`, import.meta.url)));
  const words = sura.ayahs[a - 1].ar.split(' ');
  if (!(w0 >= 1 && w1 <= words.length && w0 <= w1)) throw new Error(`${st.id}: words ${w0}-${w1} are outside ${s}:${a}`);
  out[`${s}:${a}:${w0}-${w1}`] = { ar: words.slice(w0 - 1, w1).join(' '), surah: sura.en, s, a };
  console.log(st.id, s + ':' + a, out[`${s}:${a}:${w0}-${w1}`].ar);
}
fs.writeFileSync(new URL('../../src/data/stories-quran.json', import.meta.url), JSON.stringify(out, null, 1) + '\n');
