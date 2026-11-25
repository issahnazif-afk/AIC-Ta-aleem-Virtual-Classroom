// Writes src/lib/quran-index.mjs: the shape of the Qur'an (Hafs, Madani mushaf of 604 pages) that the reading tracker
// and the khatm quest need, from the library's surah files (public/quran/data/surah/, built from Tanzil):
// ayahs per surah, and where each page and each juz starts, as a running ayah number from 0 to 6235.
// Run after scripts/quran/build-data.mjs; the output is committed, so the site does not need this at run time.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ayahs = [], page = [], juz = [];
let g = 0;
for (let s = 1; s <= 114; s++) {
  const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/quran/data/surah', String(s).padStart(3, '0') + '.json'), 'utf8'));
  ayahs.push(j.ayahs.length);
  for (const a of j.ayahs) { if (page[a.page - 1] === undefined) page[a.page - 1] = g; if (juz[a.juz - 1] === undefined) juz[a.juz - 1] = g; g++; }
}
if (g !== 6236 || page.length !== 604 || juz.length !== 30 || page.some((x) => x === undefined)) throw new Error(`unexpected shape: ${g} ayahs, ${page.length} pages, ${juz.length} juz`);
const out = `// Made by scripts/quran/reading-index.mjs from the library's Tanzil text: do not edit by hand.
// Ayahs are numbered 0 to 6235 in mushaf order. PAGE_START[p - 1] is the first ayah that starts on page p (Madani
// mushaf, 604 pages); JUZ_START[j - 1] the first ayah of juz j. A page's ayahs run up to the next page's start.
export const AYAHS = ${JSON.stringify(ayahs)};
export const PAGE_START = ${JSON.stringify(page)};
export const JUZ_START = ${JSON.stringify(juz)};
export const TOTAL_AYAHS = ${g};
export const TOTAL_PAGES = ${page.length};
`;
fs.writeFileSync(path.join(ROOT, 'src/lib/quran-index.mjs'), out);
console.log('✓ src/lib/quran-index.mjs: 6236 ayahs, 604 pages, 30 juz');
