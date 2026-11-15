// Similar phrases (mutashābihāt): for every ayah, the other ayahs that share a run of the same words with it, the
// places a hafiz most often mixes up. Made from the library's own text (recite-index.json: each ayah's plain words,
// without vowel marks), so nothing is copied from another source.
// Writes public/quran/data/mutashabihat.json: { "s:a": [["s:a", shared words], …] }, best match first.
// Run by `npm run data`, after build-data.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DATA = path.join(ROOT, 'public', 'quran', 'data');
const rows = JSON.parse(fs.readFileSync(path.join(DATA, 'recite-index.json'), 'utf8'));

const N = 4;          // a phrase is at least four words in a row
const COMMON = 12;    // a phrase found in more ayahs than this is a set formula (such as "and Allah is Forgiving, Merciful"), not a trap
const KEEP = 8;       // at most this many similar ayahs for each ayah

const words = rows.map(([, , t]) => t.split(' ').filter(Boolean));
const keys = rows.map(([s, a]) => `${s}:${a}`);
const where = new Map();   // phrase → ayah indexes
words.forEach((w, i) => {
  const seen = new Set();
  for (let k = 0; k + N <= w.length; k++) {
    const g = w.slice(k, k + N).join(' ');
    if (seen.has(g)) continue;
    seen.add(g);
    if (!where.has(g)) where.set(g, []);
    where.get(g).push(i);
  }
});

// the longest run of words two ayahs share
function longest(x, y) {
  let best = 0;
  const prev = new Array(y.length + 1).fill(0);
  for (let i = 1; i <= x.length; i++) {
    let diag = 0;
    for (let j = 1; j <= y.length; j++) {
      const t = prev[j];
      prev[j] = x[i - 1] === y[j - 1] ? diag + 1 : 0;
      if (prev[j] > best) best = prev[j];
      diag = t;
    }
  }
  return best;
}

const out = {};
let pairs = 0;
words.forEach((w, i) => {
  const cand = new Set();
  for (let k = 0; k + N <= w.length; k++) {
    const list = where.get(w.slice(k, k + N).join(' '));
    if (list && list.length > 1 && list.length <= COMMON) for (const j of list) if (j !== i) cand.add(j);
  }
  if (!cand.size) return;
  const scored = [...cand].map((j) => [j, longest(w, words[j])]).filter(([, n]) => n >= N);
  scored.sort((p, q) => q[1] - p[1] || p[0] - q[0]);
  if (!scored.length) return;
  out[keys[i]] = scored.slice(0, KEEP).map(([j, n]) => [keys[j], n]);
  pairs += out[keys[i]].length;
});
fs.writeFileSync(path.join(DATA, 'mutashabihat.json'), JSON.stringify(out));
console.log(`Similar phrases: ${Object.keys(out).length} ayahs have look-alikes (${pairs} links)`);
