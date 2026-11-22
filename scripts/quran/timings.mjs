// Word timings for Listen: when each word starts and ends in each āyah recording, so the page can light up the word
// being recited (src/quran/lib/client.mjs → 'ql:word').
//
// Source: Quran.com API v4 (Quran Foundation), /recitations/<id>/by_chapter/<n>?fields=segments. Its recordings are
// the same files EveryAyah serves (checked byte for byte for Alafasy, Abdul Basit and Minshawi; Husary is timed on
// the 64 kbps copy of the same recording, which has the same length). Times are milliseconds from the start of the
// āyah's file, so the speed control does not affect them.
//
//   node scripts/quran/timings.mjs --fetch   download into sources/qurancom/ (run once, then commit)
//   node scripts/quran/timings.mjs           sources/qurancom/ → public/quran/data/timings/<reciter>/<sss>.json
//
// Output per surah: { "<āyah>": [[word index from 0, start ms, end ms], ...] }. Word indexes count the words of the
// Tanzil text as the mushaf layout does; a pair whose word is past the end of the āyah is dropped and counted.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC = path.join(ROOT, 'sources', 'qurancom');
const OUT = path.join(ROOT, 'public', 'quran', 'data', 'timings');
const pad = (n) => String(n).padStart(3, '0');
// EveryAyah folder (src/quran/config.mjs reciters) → Quran.com recitation id
export const RECITATIONS = { Alafasy_128kbps: 7, Husary_128kbps: 6, Abdul_Basit_Murattal_192kbps: 2, Minshawy_Murattal_128kbps: 9 };
const NOTICE = 'Word timings: Quran.com API v4 (Quran Foundation), https://api.quran.com. Recordings: EveryAyah.';

if (process.argv.includes('--fetch')) {
  await fs.mkdir(SRC, { recursive: true });
  for (const [reciter, id] of Object.entries(RECITATIONS)) {
    const all = {};
    for (let n = 1; n <= 114; n++) {
      let tries = 0, j;
      for (;;) {
        try { const r = await fetch(`https://api.quran.com/api/v4/recitations/${id}/by_chapter/${n}?per_page=300&fields=segments`); if (!r.ok) throw new Error(r.status); j = await r.json(); break; }
        catch (e) { if (++tries > 5) throw e; await new Promise((r) => setTimeout(r, 2000 * tries)); }
      }
      for (const f of j.audio_files) all[f.verse_key] = (f.segments ?? []).filter((s) => Array.isArray(s) && s.length === 4).map(([, w, a, b]) => [w, a, b]);
    }
    await fs.writeFile(path.join(SRC, `timings-${reciter}.json`), JSON.stringify({ source: `https://api.quran.com/api/v4/recitations/${id}`, fetched: new Date().toISOString().slice(0, 10), verses: all }));
    console.log(`✓ ${reciter}: ${Object.keys(all).length} āyāt`);
  }
}

// word counts per āyah, from the built surah files (scripts/quran/build-data.mjs runs first)
const words = {};
for (let n = 1; n <= 114; n++) {
  const s = JSON.parse(await fs.readFile(path.join(ROOT, 'public', 'quran', 'data', 'surah', `${pad(n)}.json`), 'utf8'));
  // pause marks the Tanzil text writes as their own token (ۛ ۚ ۖ …) are not words, in the layout or in the timings
  for (const x of s.ayahs) words[`${n}:${x.a}`] = x.ar.trim().split(/\s+/).filter((t) => /[ء-يٱ]/.test(t)).length;
}
let made = 0;
for (const reciter of Object.keys(RECITATIONS)) {
  const file = path.join(SRC, `timings-${reciter}.json`);
  let src; try { src = JSON.parse(await fs.readFile(file, 'utf8')); } catch { console.log(`· word timings: no ${path.relative(ROOT, file)} (run with --fetch)`); continue; }
  await fs.mkdir(path.join(OUT, reciter), { recursive: true });
  let pairs = 0, dropped = 0, ayahs = 0;
  for (let n = 1; n <= 114; n++) {
    const out = { _copyright: NOTICE };
    for (const [k, segs] of Object.entries(src.verses)) {
      const [s, a] = k.split(':').map(Number); if (s !== n) continue;
      const max = words[k] ?? 0, keep = [];
      for (const [w, t0, t1] of segs) { if (w >= 1 && w <= max && t1 > t0) keep.push([w - 1, t0, t1]); else dropped++; }
      if (keep.length) { out[a] = keep; pairs += keep.length; ayahs++; }
    }
    await fs.writeFile(path.join(OUT, reciter, `${pad(n)}.json`), JSON.stringify(out));
  }
  made++;
  console.log(`✓ Word timings ${reciter}: ${ayahs} āyāt, ${pairs} words${dropped ? `, ${dropped} pairs dropped` : ''}`);
}
if (made) await fs.writeFile(path.join(OUT, 'index.json'), JSON.stringify({ reciters: Object.keys(RECITATIONS), _copyright: NOTICE }));
