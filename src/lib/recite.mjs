// Matching logic for "Recite from memory".
// Pure functions only, so they can be tested without a browser.

// Turn Uthmani text (or speech-recognition output) into plain comparable letters.
export function normalize(s) {
  return s
    .replace(/ىٰ/g, 'ى')                 // alif maqsura + dagger alif → alif maqsura
    .replace(/\u0670/g, 'ا')             // dagger alif is pronounced, so keep it as alif
    .replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED\u0640]/g, '') // harakat, Quranic marks, tatweel
    .replace(/[ٱأإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[^\u0621-\u063A\u0641-\u064A\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function similarity(a, b) {
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;
  const m = a.length, n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return 1 - prev[n] / Math.max(m, n);
}

// Ayahs that open with disjointed letters, which are recited by letter name.
const INITIALS = new Set([
  '2:1', '3:1', '7:1', '10:1', '11:1', '12:1', '13:1', '14:1', '15:1', '19:1', '20:1', '26:1',
  '27:1', '28:1', '29:1', '30:1', '31:1', '32:1', '36:1', '38:1', '40:1', '41:1', '42:1', '42:2',
  '43:1', '44:1', '45:1', '46:1', '50:1', '68:1',
]);
const LETTER_NAMES = {
  'ا': 'الف', 'ل': 'لام', 'م': 'ميم', 'ص': 'صاد', 'ر': 'را', 'ك': 'كاف', 'ه': 'ها', 'ي': 'يا',
  'ع': 'عين', 'ط': 'طا', 'س': 'سين', 'ح': 'حا', 'ق': 'قاف', 'ن': 'نون',
};

// Display form for the KFGQPC Hafs font. The Tanzil text is unchanged; only marks are mapped
// to the code points this font uses for the same signs (as in the printed Madani mushaf):
//   sukun (U+0652) → jazm, the head-of-khah shape (U+06E1)
//   small high rounded zero (U+06DF, silent letter) → the font's round sign (U+0652)
//   a tatweel carrying a dagger alif is dropped, as the font attaches the alif directly
export function qpc(text) {
  return text
    .replace(/\u0652/g, '\u06E1')
    .replace(/\u06DF/g, '\u0652')
    .replace(/\u0640(?=[\u064B-\u0652\u06E1]*\u0670)/g, '');
}

const HAS_LETTER = /[\u0621-\u063A\u0641-\u064A\u0671]/;

// Split an ayah into words to recite. Pause marks stay attached to the word before them.
export function tokenize(ar, key, { raw = false } = {}) {
  const show = raw ? (t) => t : qpc;
  const words = [];
  for (const tok of ar.split(/\s+/).filter(Boolean)) {
    if (!HAS_LETTER.test(tok) && words.length) { words[words.length - 1].display += ' ' + show(tok); continue; }
    const plain = normalize(tok).replace(/\s/g, '');
    words.push({ display: show(tok), plain, targets: [plain], maxN: 2 });
  }
  // QUL and Quran.com count «إِلْ يَاسِينَ» (37:130) as one word
  if (key === '37:130' && words.length >= 2) {
    const b = words.pop(), a = words.pop();
    words.push({ display: a.display + ' ' + b.display, plain: a.plain + b.plain, targets: [a.plain + b.plain], maxN: 3 });
  }
  if (key && INITIALS.has(key) && words.length) {
    const w = words[0];
    const names = [...w.plain].map((c) => LETTER_NAMES[c] ?? c);
    w.targets = [names.join(''), w.plain];
    w.maxN = names.length + 1;
    w.initials = true;
  }
  return words;
}

// Does the spoken text starting at word i say the expected word?
// Returns how many spoken words were used (0 = no match).
// A missing or extra prefix letter (wa-, fa-, bi-, li-, ka-) changes the meaning, so it is never forgiven.
const PREFIXES = 'وفبلك';
function prefixDiffers(a, b) {
  const [long, short] = a.length > b.length ? [a, b] : [b, a];
  if (long.length === short.length + 1 && PREFIXES.includes(long[0]) && long.slice(1) === short) return true;
  // same length, different first letter, and one of them is a prefix letter (li- vs al-, wa- vs fa-)
  return a.length === b.length && a[0] !== b[0] && (PREFIXES.includes(a[0]) || PREFIXES.includes(b[0])) && a.slice(1) === b.slice(1);
}

// The consonant outline of a word: long vowels and hamza seats removed after the first letter.
// Speech engines and the Uthmani script often differ only in these (الصلاة / الصلوة, ءامنوا / آمنوا).
const skeleton = (w) => w[0] + w.slice(1).replace(/[اويء]/g, '');

// What is written but not said, and what is said two ways, so that only real differences count:
// the ل of ال before a sun letter ("ar-raḥmān", also after و ف ب ك), a letter doubled by shadda or by the
// speech engine, a final ة (written ه here) said as ت when joined to the next word, and ءا written آ.
function spokenForm(w) {
  let s = w.replace(/^([وفبك]?)ءا/, '$1ا').replace(/^([وفبك]?ا)ل(?=[تثدذرزسشصضطظلن])/, '$1');
  s = s.replace(/(.)\1+/g, '$1');
  return s.replace(/ت$/, 'ه');
}
const outline = (w) => skeleton(spokenForm(w));

// Pairs of consonants that sound alike; only "lenient" checking forgives one of them, and never at the start
// of a word, where look-alike words differ most (قاهرون / كاهرون, خالدون / حاسدون).
const NEAR = ['سص', 'تط', 'دض', 'ذظ', 'ذز', 'زظ', 'ثس', 'قك', 'حه', 'عء', 'غخ', 'ذد', 'ثت'];
const near = (a, b) => NEAR.some((p) => p.includes(a) && p.includes(b) && a !== b);
function oneNearSwap(a, b) {
  if (a.length !== b.length || a.length < 4) return false;
  let diff = -1;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) { if (diff >= 0) return false; diff = i; }
  return diff >= 2 && near(a[diff], b[diff]);
}

// Letter by letter. Words that look alike share most of their letters, at the end (خالدون مفسدون حاسدون كاذبون
// قاهرون) or at the start (عذاب عظيم / عذاب أليم), so a likeness score over the whole word lets the one letter
// that differs pass. Instead every consonant must be the same, in the same order; only the ways of writing the
// same sounds are forgiven (long vowels and hamza seats, the unsaid ل of ال, shadda, ة said as ت).
//   strict    the letters as written, long vowels too (after the forgiven spellings)
//   normal    every consonant, in order
//   lenient   as normal, but one consonant may be a sound-alike (س/ص, ت/ط, ق/ك …), past the first two letters
export function wordMatches(said, target, threshold) {
  if (said === target) return true;
  if (prefixDiffers(said, target)) return false;
  const a = spokenForm(said), b = spokenForm(target);
  if (a === b) return true;
  if (threshold >= THRESHOLDS.strict) return false;
  const oa = outline(said), ob = outline(target);
  if (oa === ob && oa.length >= 2) return true;
  if (threshold <= THRESHOLDS.lenient) return oneNearSwap(oa, ob);
  return false;
}

// The old likeness score, for finding where the reader is in the Quran (buildLocator, locate): there the words
// around a word confirm it, so a speech engine's slips must not lose the place.
export function wordNear(said, target, threshold) {
  if (said === target) return true;
  if (prefixDiffers(said, target)) return false;
  if (threshold < THRESHOLDS.strict) {
    const a = skeleton(said), b = skeleton(target);
    if (a === b && a.length >= 2) return true;
  }
  if (target.length <= 3 && threshold > THRESHOLDS.lenient) return false;
  return similarity(said, target) >= threshold;
}

// Does the speech starting at spoken[i] say words[next]?
// Speech engines sometimes split one word in two or join two words into one,
// so this also tries 2 spoken words for 1 written word, and 1 spoken word for 2 written words.
// Returns { n, e }: spoken words used and written words matched. { n: 0 } means no match.
export function matchAt(spoken, i, words, next, threshold) {
  const w = words[next];
  for (let n = 1; n <= w.maxN && i + n <= spoken.length; n++) {
    const said = spoken.slice(i, i + n).join('');
    if (w.targets.some((t) => wordMatches(said, t, threshold))) return { n, e: 1 };
  }
  const w2 = words[next + 1];
  if (w2 && w2.item === w.item && !w.initials && !w2.initials && spoken[i]) {
    if (wordMatches(spoken[i], w.plain + w2.plain, threshold)) return { n: 1, e: 2 };
  }
  return { n: 0, e: 0 };
}

export const THRESHOLDS = { strict: 0.8, normal: 0.62, lenient: 0.5 };

// ── Finding where the reader is ─────────────────────────────────
// rows: [[surah, ayah, "w1 w2 …"], …] using the same plain words as tokenize().
export function buildLocator(rows) {
  const W = [], R = [], exact = new Map();
  for (const [s, a, str] of rows) {
    str.split(' ').filter(Boolean).forEach((w, i) => {
      if (!exact.has(w)) exact.set(w, []);
      exact.get(w).push(W.length);
      W.push(w);
      R.push([s, a, i]);
    });
  }
  return { W, R, exact };
}

function candidatesFor(L, word, threshold) {
  const hit = L.exact.get(word);
  if (hit) return hit;
  const out = [];
  for (let p = 0; p < L.W.length; p++) {
    const w = L.W[p];
    if (Math.abs(w.length - word.length) > 2 || w[0] !== word[0]) continue;
    if (wordNear(word, w, threshold)) out.push(p);
  }
  return out;
}

// spoken: plain words just heard (newest last).
// Returns { found: {start, last} } with positions in L, or { ambiguous: [...] }, or null.
export function locate(L, spoken, threshold = THRESHOLDS.normal) {
  const n = spoken.length;
  if (n < 3) return null;
  const found = new Map(); // keyed by last matched position
  const starts = [];
  for (let k = 0; k <= n - 3; k++) {
    for (const p of candidatesFor(L, spoken[k], threshold)) starts.push([k, p, 1]);
    // the engine may split one written word in two (يا ايها → ياايها)
    for (const p of candidatesFor(L, spoken[k] + spoken[k + 1], threshold)) starts.push([k, p, 2]);
  }
  {
    for (const [k, p, used] of starts) {
      let j = k + used, q = p + 1, matched = 1, misses = 0, lastJ = k + used - 1, lastQ = p;
      while (j < n && q < L.W.length) {
        if (wordNear(spoken[j], L.W[q], threshold)) { matched++; lastJ = j; lastQ = q; j++; q++; misses = 0; continue; }
        if (q + 1 < L.W.length && wordNear(spoken[j], L.W[q] + L.W[q + 1], threshold)) { matched += 2; lastJ = j; lastQ = q + 1; j++; q += 2; misses = 0; continue; }
        if (j + 1 < n && wordNear(spoken[j] + spoken[j + 1], L.W[q], threshold)) { matched++; lastJ = j + 1; lastQ = q; j += 2; q++; misses = 0; continue; }
        if (++misses > 1) break;
        j++; // the speech engine heard an extra word; skip it
      }
      if (matched < 3) continue;
      const prev = found.get(lastQ);
      if (!prev || matched > prev.matched) found.set(lastQ, { start: p, last: lastQ, matched, lastJ });
    }
  }
  if (!found.size) return null;
  const list = [...found.values()].sort((x, y) => y.lastJ - x.lastJ || y.matched - x.matched);
  const best = list[0];
  const rivals = list.filter((c) => c.lastJ === best.lastJ && c.matched === best.matched);
  if (rivals.length === 1 && (best.matched >= 4 || best.lastJ === n - 1)) return { found: best };
  return { ambiguous: rivals.slice(0, 4) };
}
