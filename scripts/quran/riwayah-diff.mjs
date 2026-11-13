// Where another riwāyah (Warsh ʿan Nāfiʿ, Qālūn ʿan Nāfiʿ) is read differently from Ḥafṣ ʿan ʿĀṣim, word by word,
// worked out ONLY from the official texts of the King Fahd Glorious Quran Printing Complex (KFGQPC), as published in
// the fawazahmed0 Quran API (ara-quranuthmanihaf, ara-quranwarsh, ara-quranqaloon). Nothing here is written by hand:
// a word is listed because the two official texts spell it differently, after the mushafs' writing conventions (the
// Maghribi yāʾ ے, pause marks, the waṣl marks, how sukūn and assimilation are marked) are made the same.
//
//   node scripts/quran/riwayah-diff.mjs   → public/quran/data/riwayah/{warsh,qaloon}-diff.json and -lessons.json
//
// Each difference gets a kind, read from the official text itself:
//   mim      the plural mīm read long (ṣilah): Warsh writes ـمُۥٓ where Ḥafṣ writes ـمۡ (before a hamzah)
//   naql     the hamzah's vowel moves back onto the last letter of the word before: كَمۡ أَهۡلَكۡنَا / كَمَ اَهْلَكْنَا
//            (both words are marked)
//   qasr     the separated madd read short: Ḥafṣ بِمَآ أُنزِلَ, Qālūn بِمَا أُنزِلَ (no madd sign)
//   idkhal   two hamzahs in one word, the second eased with an alif between: ءَأَنذَرۡتَهُمۡ / ءَٰا۬نذَرْتَهُمْ
//   tashil   two hamzahs meeting across two words, one eased (a dotted alif: نَشَآءُ اَ۬صَبْنَٰهُم) or dropped (جَا أَمْرُنَا)
//   ibdal    a hamzah changed into alif, wāw or yāʾ, or left out (يُؤۡمِنُونَ / يُومِنُونَ)
//   imalah   the same letters, with a dot under or over a letter (imālah or taqlīl: نَّه۪ارِ; a vowel said lightly)
//   letters  the letters themselves differ (farsh al-ḥurūf): مَٰلِكِ / مَلِكِ, نَّغۡفِرۡ / يُغْفَرْ
//   vowels   the same letters, other vowels (يَكۡذِبُونَ / يُكَذِّبُونَ, خَالِصَةࣰ / خَالِصَةࣱ)
//   added / dropped   a word on one side only (rare; usually a word written joined on one side)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CACHE = path.join(ROOT, '.cache', 'quran');
const OUT = path.join(ROOT, 'public', 'quran', 'data', 'riwayah');
const SRC = {
  hafs: { file: 'rw-hafs-kfgqpc.json', url: 'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/ara-quranuthmanihaf.json' },
  warsh: { file: 'rw-warsh.json', url: 'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/ara-quranwarsh.json' },
  qaloon: { file: 'rw-qaloon.json', url: 'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/ara-quranqaloon.json' },
};
// The KFGQPC original, with the riwāyah's own āyah numbers (the Madanī count: 6214 āyāt). The API copy above is
// renumbered to the Ḥafṣ (Kūfī) count; the recitations are timed by the riwāyah's own numbers, so each example also
// gets the riwāyah's own āyah(s).
const NATIVE = {
  qaloon: { file: 'qaloon-native.json', url: 'https://raw.githubusercontent.com/thetruetruth/quran-data-kfgqpc/main/qaloon/data/QaloonData_v10.json' },
};

async function load(src) {
  const f = path.join(CACHE, src.file);
  if (!fs.existsSync(f)) {
    fs.mkdirSync(CACHE, { recursive: true });
    const r = await fetch(src.url);
    if (!r.ok) throw new Error(`${src.url}: ${r.status}`);
    fs.writeFileSync(f, await r.text());
  }
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  const m = {};
  // the API copy puts a space after the open-tanwīn marks (هُدࣰ ى, مَرَضࣰ ا): joined back, as in the KFGQPC original
  for (const v of j.quran) m[`${v.chapter}:${v.verse}`] = v.text.replace(/([ࣰ-ࣲ]) ([ىاے])(?=\s|$|[ۖ-ۜ])/g, '$1$2');
  return m;
}

// ── making the two mushafs' conventions the same ──
const PAUSE = /[ۖ-ۜ۞۩‏‎]/g;          // pause and section marks, direction marks
const isPauseOnly = (w) => w.replace(PAUSE, '') === '';
const WASL = /ا[َُِ]?[۪۬۟]/g;          // اِ۬ اَ۬ اُ۪ : the Maghribi way of marking a waṣl alif
// the reading: letters + vowels, with the Maghribi writing conventions mapped to the Mashriqi ones
const reading = (w) => w.replace(PAUSE, '')
  .replace(/ا([ً-ْۡ]?)ٔ/g, 'أ$1').replace(/ا([ً-ْۡ]?)ٕ/g, 'إ$1')  // ا + ٔ (KFGQPC Ḥafṣ) → أ
  .replace(/^([وفبلك]?)اٰ/, '$1ءَا')                              // اٰمَنَ (Maghribi) = ءَامَنَ
  .replace(/ے/g, 'ي')                                 // ے (Maghribi final yāʾ) → ي
  .replace(/ى/g, 'ي')                                     // ى → ي
  .replace(/ٱ/g, 'ا')                                     // ٱ (waṣl) → ا
  .replace(WASL, 'ا')
  .replace(/[۪۬۠]/g, '')                             // the Warsh dots are counted apart (marks)
  .replace(/ۡ/g, 'ْ')                                     // two sukūn shapes → one
  .replace(/ࣰ/g, 'ً').replace(/ࣱ/g, 'ٌ').replace(/ࣲ/g, 'ٍ')
  .replace(/ـ/g, '');
// the letters only (dagger alif and small wāw/yāʾ count as letters: they are read); every hamzah shape → ء
const letters = (w) => reading(w).replace(/ٰ/g, 'ا').replace(/ۥ/g, 'و').replace(/ۦ/g, 'ي')
  .replace(/[آأإءؤئٕٔ]/g, 'ء').replace(/[ً-ٟۖ-ۭ]/g, '')
  .replace(/ءا|اء/g, 'ء');
const hamzaless = (w) => letters(w).replace(/[ءا]/g, '');            // for lining the words up
// the Warsh-only dots, not counting the dot on a waṣl alif (only a writing style)
const marks = (w) => [...w.replace(WASL, '')].filter((c) => /[۪۬۠]/.test(c)).length;
// the reading without the marks the two mushafs write differently for the same sound (sukūn, the shaddah of
// assimilation, small high/low meem and nūn signs): what is left differs only where the reading differs
// (the vowel on the doubled lām of ٱلَّذِي / ٱلَّتِي, a long ā written as alif or as a small alif, tanwīn of
// assimilation (ـمُۢ / ـمࣱ), a kasrah written under the hamzah or the letter: likewise)
const plain = (w) => reading(w)
  .replace(/^([\u0648\u0641\u0628\u0643][\u064E\u0650]?)?(\u0627\u0644|\u0644\u0650\u0644)\u0651?[\u064E\u064F\u0650]?\u0651?/, '$1$2')
  .replace(/\u064E[\u06E2\u06ED]/g, '\u064B').replace(/\u064F[\u06E2\u06ED]/g, '\u064C').replace(/\u0650[\u06E2\u06ED]/g, '\u064D')
  .replace(/[\u0651\u0652\u06ED\u06E2]/g, '').replace(/\u064E?\u0670/g, '\u064E\u0627').replace(/\u064E\u0627\u0627/g, '\u064E\u0627')
  .replace(/\u0650?\u0626/g, '\u0626\u0650');
// do the letters differ only by a hamzah left out, or turned into alif, wāw or yāʾ?
const esc = (c) => (/[.*+?^${}()|[\]\\]/.test(c) ? '\\' + c : c);
function onlyHamz(a, b) {
  if (!a.includes('ء')) return false;
  const re = new RegExp('^' + [...a].map((c) => (c === 'ء' ? '[اويء]?' : esc(c))).join('') + '$');
  return re.test(b);
}

// tanwīn written on the letter or on the alif after it is the same reading
const tanwin = (s) => s.replace(/ًا|اً/g, 'ً').replace(/يً/g, 'ًي');
const HAMZA = /[ء-ئٕٔ]/;
// a hamzah written as alif + a separate hamzah mark (both KFGQPC texts do this) → one letter
const compose = (w) => w.replace(PAUSE, '').replace(/ا([ً-ْۡ]?)ٔ/g, 'أ$1').replace(/ا([ً-ْۡ]?)ٕ/g, 'إ$1');
const startsHamza = (h) => /^[وفبلك]?[ءأإ]/.test(reading(h));
const endsSukun = (s) => /[ْۡ]$/.test(s.replace(PAUSE, '').replace(/[ۭۢ]/g, ''));
const endsVowel = (s) => /[َُِ]$/.test(s.replace(PAUSE, ''));

// kinds that need the next word too (naql: the hamzah's vowel moves back onto the last letter of this word)
function kindOf(h, w, wNext, hNext, wPrev, hAfter = hNext) {   // hAfter: the next word even across the āyah's end
  const lh = letters(h), lw = letters(w);
  if (/مُ?ۥ/.test(reading(w)) && /مْ?$/.test(reading(h).replace(/ۢ/g, ''))) return 'mim';
  // two hamzahs in one word, the second eased with an alif put between them (idkhāl, Qālūn): Ḥafṣ ءَأَنذَرۡتَهُمۡ,
  // Qālūn ءَٰا۬نذَرْتَهُمْ / أَءِذَا, أَٰ۟ذَا (the small alif after the first hamzah is the alif of idkhāl)
  if (/^[وف]?[ءأ]َ[ءأإئؤ]/.test(compose(h)) && /^[وف]?(?:[ءأا]َ?ٰ|ءَاٰ)/.test(compose(w))) return 'idkhal';   // (أَٰ۟ذَا is written ا + َ + ٰ + ٔ)
  // naql into the lām of al-: وَٱلۡأَرۡضِ / وَالَارْضِ
  if (/(ا|لِ)ل[ْ]?[ءأإ]/.test(reading(h)) && /ل[َُِ]ا/.test(reading(w))) return 'naql';
  // naql, the word that loses its hamzah: Warsh writes a bare alif with a vowel (no hamzah, no dot)
  if (startsHamza(h) && /^[وفبلك]?ا[َُِ](?![۪۬])/.test(compose(w))) return 'naql';
  // naql, the word before: its last letter takes the vowel instead of a sukūn
  if (endsSukun(h) && endsVowel(w) && hNext && startsHamza(hNext) && wNext && /^ا[َُِٰ](?![۪۬])/.test(compose(wNext))) return 'naql';
  // tashīl: where two hamzahs meet (the word before ends in a hamzah in Warsh's own text), the second is written as a
  // dotted alif. A dotted alif anywhere else is a waṣl alif where Ḥafṣ has a hamzah: a farsh difference, not tashīl.
  const endsHamza = (s) => !!s && /[ء-ئٔ][ً-ِ]?[۪۬]?$/.test(compose(s));
  if (startsHamza(h) && /^ا[َُِ]?[۪۬]/.test(compose(w)) && endsHamza(wPrev)) return 'tashil';
  // two hamzahs meeting, the FIRST one dropped (Qālūn, both with fatḥah): جَآءَ أَجَلُهُمۡ / جَا أَجَلُهُمْ
  if (endsHamza(h) && !endsHamza(w) && hNext && startsHamza(hNext)) return 'tashil';
  // yāʾ al-iḍāfah opened: Ḥafṣ ـيٓ / ـي, Warsh ـيَ
  if (/ي[ْۡٓ]?$/.test(compose(h)) && /يَ$/.test(compose(w)) && lh === lw) return 'ya';
  // yāʾāt al-zawāʾid: a yāʾ Warsh adds at the end of a word when reading on (written small: ـِۦ)
  // (only the yāʾ added: رِسَالَتَهُۥ / رِسَٰلَٰتِهِۦ is a different word, not an added yāʾ)
  if (/ۦٓ?$/.test(compose(w)) && !/[يۦ]ٓ?$/.test(compose(h)) && lw === lh + 'ي') return 'zawaid';
  if (lh === lw || lh === lw.replace(/اا/g, 'ء')) {
    // the separated madd read short (qaṣr al-munfaṣil): Ḥafṣ writes the madd sign on a long vowel before a hamzah
    // in the next word (بِمَآ أُنزِلَ, يَٰٓأَيُّهَا); the riwāyah's text does not
    const madd = (x) => (compose(x).match(/[ٓۤ]/g) || []).length;
    const noMadd = (x) => tanwin(plain(x).replace(/[ٓۤ]/g, ''));
    if (madd(h) > madd(w) && noMadd(h) === noMadd(w)
      && (/[ٓۤ][ءأإؤئ]/.test(compose(h)) || (/[ٓۤ][اْۡ]*$/.test(compose(h)) && hAfter && startsHamza(hAfter)))) return 'qasr';
    if (marks(w) > marks(h)) return 'imalah';   // (a dot Ḥafṣ has too, as in تَأۡمَ۬نَّا, is no difference)
    return tanwin(plain(h)) === tanwin(plain(w)) ? null : 'vowels';
  }
  // the hamzah differs, and a shaddah too: a different word form (فَأَتۡبَعَ / فَاتَّبَعَ), so farsh
  const shaddas = (x) => (reading(x).replace(/^([وفبك][َِ]?)?ال./, '').match(/ّ/g) || []).length;
  if (onlyHamz(lh, lw) || onlyHamz(lw, lh)) return shaddas(h) === shaddas(w) ? 'ibdal' : 'vowels';
  return 'letters';
}

// line the words of an ayah up (longest common subsequence), so an extra word on one side does not shift the rest
function align(hw, ww) {
  const n = hw.length, m = ww.length;
  const L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) {
    L[i][j] = hamzaless(hw[i]) === hamzaless(ww[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  }
  const pairs = []; let i = 0, j = 0;
  while (i < n && j < m) {
    if (hamzaless(hw[i]) === hamzaless(ww[j])) { pairs.push([i, j]); i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) { pairs.push([i, null]); i++; }
    else { pairs.push([null, j]); j++; }
  }
  while (i < n) pairs.push([i++, null]);
  while (j < m) pairs.push([null, j++]);
  // a word left out on one side next to a word added on the other = the same word, read differently
  const out = [];
  for (let k = 0; k < pairs.length; k++) {
    const [a, b] = pairs[k], nx = pairs[k + 1];
    if (a != null && b == null && nx && nx[0] == null && nx[1] != null) { out.push([a, nx[1]]); k++; }
    else if (a == null && b != null && nx && nx[0] != null && nx[1] == null) { out.push([nx[0], b]); k++; }
    else out.push([a, b]);
  }
  return out;
}

// the riwāyah's own numbers for each Ḥafṣ-numbered āyah: [first, last] native āyah (they differ where the two counts
// split an āyah differently), found by walking both copies of each sūrah word by word
async function nativeMap(RW, W) {
  const f = path.join(CACHE, NATIVE[RW].file);
  if (!fs.existsSync(f)) {
    const r = await fetch(NATIVE[RW].url);
    if (!r.ok) throw new Error(`${NATIVE[RW].url}: ${r.status}`);
    fs.writeFileSync(f, await r.text());
  }
  const rows = JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, ''));
  const toks = (t) => t.replace(/[ ‏‎]/g, ' ').split(/\s+/).filter((w) => /[ء-يٱ]/.test(w) && !/^[٠-٩]+$/.test(w));
  const bySura = new Map();
  // words compared by their bare letters (the two copies are different versions of the same KFGQPC text)
  // (the letter skeleton: no marks, every hamzah and alif shape made one, so the two versions' spellings agree)
  const bare = (w) => w.replace(/[^ء-يٱ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ؤ/g, 'و').replace(/[ئى]/g, 'ي').replace(/[ءا]/g, '');
  for (const r of rows) { if (!bySura.has(r.sura_no)) bySura.set(r.sura_no, []); for (const w of toks(r.aya_text)) bySura.get(r.sura_no).push({ a: r.aya_no, b: bare(w) }); }
  const map = {}; let bad = 0;
  for (let s = 1; s <= 114; s++) {
    const nat = bySura.get(s) ?? [];
    const keys = Object.keys(W).filter((x) => x.startsWith(s + ':')).sort((a, b) => +a.split(':')[1] - +b.split(':')[1]);
    // al-Fātiḥah: Ḥafṣ counts the basmalah as āyah 1; the Madanī count does not (it is not in the native text)
    const ws = keys.flatMap((key) => (s === 1 && key === '1:1' ? [] : toks(W[key]).map((w) => ({ key, b: bare(w) }))));
    const span = {}; let k = 0;
    for (let i = 0; i < ws.length; i++) {
      // a word spelt or split differently in one copy: pick the thread up again where two words in a row agree
      let at = k;
      if (nat[k]?.b !== ws[i].b) {
        for (let f = -2; f <= 3; f++) {
          if (f && nat[k + f]?.b === ws[i].b && nat[k + f + 1]?.b === ws[i + 1]?.b) { at = k + f; break; }
        }
      }
      if (nat[at]) (span[ws[i].key] ??= []).push(nat[at].a);
      k = at + 1;
    }
    // [first, last] native āyah, and whether the native āyah is exactly this one (no words of a neighbour joined on)
    const words = {}; for (const x of nat) words[x.a] = (words[x.a] ?? 0) + 1;
    for (const key of keys) {
      const sp = span[key];
      map[key] = sp?.length ? { n: [Math.min(...sp), Math.max(...sp)], exact: sp[0] === sp.at(-1) && words[sp[0]] === sp.length } : null;
    }
    if (k !== nat.length) bad++;
  }
  if (bad) console.warn(`! ${RW}: ${bad} sūrahs where the two copies have a different number of words`);
  return map;
}

const H = await load(SRC.hafs);
// the first word of the next āyah (a madd at the end of an āyah can meet a hamzah at the start of the next)
const firstOfNext = (key) => { const [s, a] = key.split(':'); return (H[`${s}:${+a + 1}`] ?? '').split(/\s+/).find((w) => w && !isPauseOnly(w)); };

async function riwayah(RW) {
const W = await load(SRC[RW]);
const nat = NATIVE[RW] ? await nativeMap(RW, W) : null;
const diff = {}, count = { mim: 0, naql: 0, qasr: 0, idkhal: 0, ya: 0, zawaid: 0, tashil: 0, ibdal: 0, imalah: 0, letters: 0, vowels: 0, added: 0, dropped: 0 };
for (const key of Object.keys(H)) {
  const hw = H[key].split(/\s+/).filter((w) => w && !isPauseOnly(w));
  const ww = (W[key] ?? '').split(/\s+/).filter((w) => w && !isPauseOnly(w));
  const rows = [];
  for (const [a, b] of align(hw, ww)) {
    if (a != null && b != null) {
      const k = kindOf(hw[a], ww[b], ww.at(b + 1), hw.at(a + 1), b > 0 ? ww.at(b - 1) : null, hw.at(a + 1) ?? firstOfNext(key));
      if (k) { rows.push({ i: a, j: b, h: hw[a].replace(PAUSE, ''), w: ww[b].replace(PAUSE, ''), k }); count[k]++; }
    } else if (a != null) { rows.push({ i: a, h: hw[a].replace(PAUSE, ''), w: '', k: 'dropped' }); count.dropped++; }
    else { rows.push({ i: -1, j: b, h: '', w: ww[b].replace(PAUSE, ''), k: 'added' }); count.added++; }
  }
  if (rows.length) diff[key] = rows;
}
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, `${RW}-diff.json`), JSON.stringify({
  _source: `Worked out from the KFGQPC Uthmani Hafs text and the KFGQPC ${RW} text, via github.com/fawazahmed0/quran-api. Not edited by hand.`,
  count, diff,
}));
console.log(`✓ ${RW} differences:`, JSON.stringify(count), Object.keys(diff).length, 'ayahs');

// ── the classroom's examples: for each kind, a few short āyāt where it is clear ──
// (short āyāt first, one example per Warsh word, then in mushaf order). Both official texts of the āyah go with it,
// so the classroom shows exactly the words that were compared.
const INITIALS = new Set(['2:1', '3:1', '7:1', '10:1', '11:1', '12:1', '13:1', '14:1', '15:1', '19:1', '20:1', '26:1', '27:1', '28:1', '29:1', '30:1', '31:1', '32:1', '36:1', '38:1', '40:1', '41:1', '42:1', '42:2', '43:1', '44:1', '45:1', '46:1', '50:1', '68:1']);
const KINDS = RW === 'qaloon'
  ? ['qasr', 'idkhal', 'tashil', 'ibdal', 'imalah', 'ya', 'zawaid', 'letters', 'vowels']
  : ['mim', 'naql', 'ibdal', 'tashil', 'imalah', 'ya', 'zawaid', 'letters', 'vowels'];
const ord = (k) => { const [s, a] = k.split(':').map(Number); return s * 1000 + a; };
const lessons = {};
for (const kind of KINDS) {
  const cand = [];
  for (const [key, rows] of Object.entries(diff)) {
    const n = H[key].split(/\s+/).filter((w) => w && !isPauseOnly(w)).length;
    if (n > 14 || INITIALS.has(key)) continue;   // the disjointed letters are a lesson of their own
    if (nat && !nat[key]?.exact) continue;   // the recitation is timed by the riwāyah's own āyāt: only where they are the same
    for (const r of rows) if (r.k === kind && r.j != null && r.i >= 0) cand.push({ key, n, ...r });
  }
  cand.sort((x, y) => x.n - y.n || ord(x.key) - ord(y.key));
  const seen = new Set(), pick = [];
  for (const c of cand) {
    const word = letters(c.w);
    if (word.length < letters(c.h).length - 2) continue;   // a word written split in the source text
    if (seen.has(word)) continue;
    seen.add(word); pick.push(c);
    if (pick.length === 6) break;
  }
  pick.sort((x, y) => ord(x.key) - ord(y.key));
  lessons[kind] = {
    count: count[kind],
    examples: pick.map((c) => ({ k: c.key, i: c.i, j: c.j, h: c.h, w: c.w, hafs: H[c.key].replace(PAUSE, '').replace(/\s+/g, ' ').trim(), rw: W[c.key].replace(/[\u200F\u200E]/g, '').replace(/\s+/g, ' ').trim(), ...(nat ? { n: nat[c.key].n[0] } : {}) })),
  };
}
fs.writeFileSync(path.join(OUT, `${RW}-lessons.json`), JSON.stringify({
  _source: `Examples chosen automatically from the differences between the KFGQPC Hafs and ${RW} texts (${RW}-diff.json).`,
  lessons,
}));
console.log(`✓ ${RW} lessons:`, KINDS.map((k) => `${k} ${lessons[k].examples.length}`).join(', '));
}

for (const RW of ['warsh', 'qaloon']) await riwayah(RW);
