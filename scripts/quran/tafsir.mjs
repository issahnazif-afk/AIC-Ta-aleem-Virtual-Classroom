// The Tafsir section (/quran/tafsir/): Shaykh Muhammad ibn Salih al-ʿUthaymin's tafsir, in Arabic, shown verbatim.
// (Ibn Kathir is not stored here: the page reads it from the Quran.com API v4 while the adult reads.)
//
// Source: tafsir.app (Nuqayah), https://tafsir.app/ibn-uthaymeen. The rights belong to the Shaykh's charitable
// foundation (Muʾassasat al-Shaykh Muhammad ibn Salih al-ʿUthaymin al-Khayriyyah); Ta'aleem is free and non-commercial
// and credits both on the page. tafsir.app does not let other sites load it in the browser, so it is downloaded once.
// The Shaykh did not explain the whole Qur'an: an āyah with no passage is simply not covered.
//
//   node scripts/quran/tafsir.mjs --fetch   download into sources/tafsir-app/ibn-uthaymeen/ (slow, one request at a
//                                            time; resumable; run once, then commit)
//   node scripts/quran/tafsir.mjs           sources → public/quran/data/tafsir/uthaymeen/
//
// Output: index.json { surahs: { "<n>": [[from, to], ...] } } and <sss>/<fff>.json { s, from, to, text } per passage,
// so a reader downloads only the passage it opens (al-Baqarah alone is several megabytes).

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC = path.join(ROOT, 'sources', 'tafsir-app', 'ibn-uthaymeen');
const OUT = path.join(ROOT, 'public', 'quran', 'data', 'tafsir', 'uthaymeen');
const pad = (n) => String(n).padStart(3, '0');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const AYAHS = JSON.parse(await fs.readFile(path.join(ROOT, 'sources', 'surah-names.json'), 'utf8').catch(() => 'null'));

async function ayahCounts() {
  if (Array.isArray(AYAHS) && AYAHS[0]?.ayahs) return AYAHS.map((s) => s.ayahs);
  const meta = JSON.parse(await fs.readFile(path.join(ROOT, 'public', 'quran', 'data', 'meta.json'), 'utf8'));
  return meta.surahs.map((s) => s.ayahs);
}

if (process.argv.includes('--fetch')) {
  await fs.mkdir(SRC, { recursive: true });
  const counts = await ayahCounts();
  const get = async (s, a) => {
    for (let i = 0; i < 6; i++) {
      try {
        const r = await fetch(`https://tafsir.app/get.php?src=ibn-uthaymeen&s=${s}&a=${a}&ver=1`);
        if (r.ok) return await r.json();
      } catch {}
      await wait(3000 * (i + 1));
    }
    throw new Error(`could not fetch ${s}:${a}`);
  };
  for (let s = 1; s <= 114; s++) {
    const f = path.join(SRC, pad(s) + '.json');
    if (existsSync(f)) continue;
    const parts = [];
    for (let a = 1; a <= counts[s - 1];) {
      const j = await get(s, a);
      const from = j.ayahs_start ?? a, to = from + (j.count ?? 0);   // count is the number of āyāt after the first
      if (j.data?.trim()) parts.push({ from, to, text: j.data });
      a = Math.max(a + 1, to + 1);
      await wait(350);
    }
    await fs.writeFile(f, JSON.stringify(parts));
    console.log(`✓ ${s}: ${parts.length} passages`);
  }
  process.exit(0);
}

// build
await fs.rm(OUT, { recursive: true, force: true });
await fs.mkdir(OUT, { recursive: true });
const index = { source: 'https://tafsir.app/ibn-uthaymeen', surahs: {} };
let n = 0;
for (let s = 1; s <= 114; s++) {
  const f = path.join(SRC, pad(s) + '.json');
  if (!existsSync(f)) continue;
  const parts = JSON.parse(await fs.readFile(f, 'utf8'));
  if (!parts.length) continue;
  await fs.mkdir(path.join(OUT, pad(s)), { recursive: true });
  index.surahs[s] = parts.map((p) => [p.from, p.to]);
  for (const p of parts) {
    await fs.writeFile(path.join(OUT, pad(s), pad(p.from) + '.json'), JSON.stringify({ s, from: p.from, to: p.to, text: p.text }));
    n++;
  }
}
await fs.writeFile(path.join(OUT, 'index.json'), JSON.stringify(index));
console.log(`✓ tafsir Ibn ʿUthaymin: ${Object.keys(index.surahs).length} surahs, ${n} passages`);
