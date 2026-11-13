// The Sheikh's tajweed ear: compares what the tajweed model heard (in the Quran phonetic script) with the expected
// sounds of the words recited, and returns a remark for each tajweed rule broken. A port of the rule part of imam.py
// from HisnLabs tajweed-v2 (Apache-2.0, https://huggingface.co/Hisnlabs/tajweed-v2). Clear mistakes (another word,
// letter or vowel) are left to the word checker that already follows the recitation: only the rules are judged here,
// and only the rules the student chose. No imports: used in the browser and tested in Node.
//
// ref (from public/quran/data/tajweed-ref/NNN.json): { p: phonetic script, w: [[s, e]] per word, u: units }
//   unit: [s, e, kind, word, golden, rule, char]   (kinds and rules: the lists at the top of each file)

const LONG = new Set(['ا', 'ۦ', 'ۥ']);
const HARAKAT = new Set(['َ', 'ُ', 'ِ']);
export const KINDS = ['madd', 'qalqalah', 'ikhfa', 'iqlab', 'ghunnah', 'idgham_ghunnah', 'shadda', 'idgham'];
export const RULES = ['NormalMaddRule', 'MonfaselMaddRule', 'MottaselMaddRule', 'MottaselMaddPauseRule', 'LazemMaddRule',
  'AaredMaddRule', 'LeenMaddRule', 'BadalMadd', 'LeenHamzaMadd'];
// the lengths a teacher accepts, Ḥafṣ by ash-Shāṭibiyyah (as taught in the Tajweed classroom): munfaṣil 4 or 5
export const ALLOWED = {
  NormalMaddRule: [2], MonfaselMaddRule: [4, 5], MottaselMaddRule: [4, 5, 6], MottaselMaddPauseRule: [4, 5, 6],
  LazemMaddRule: [6], AaredMaddRule: [2, 4, 6], LeenMaddRule: [2, 4, 6], BadalMadd: [2], LeenHamzaMadd: [4, 6],
};
const TIME_SIX = 8.3, TIME_FIVE = 7.0;

// edit script between two strings, as [tag, i1, i2, j1, j2] blocks (like Levenshtein.opcodes)
export function opcodes(a, b) {
  const n = a.length, m = b.length, W = m + 1;
  const d = new Uint32Array((n + 1) * W);
  for (let i = 0; i <= n; i++) d[i * W] = i;
  for (let j = 0; j <= m; j++) d[j] = j;
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    const c = a[i - 1] === b[j - 1] ? 0 : 1;
    d[i * W + j] = Math.min(d[(i - 1) * W + j - 1] + c, d[(i - 1) * W + j] + 1, d[i * W + j - 1] + 1);
  }
  const ops = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && d[i * W + j] === d[(i - 1) * W + j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) { ops.push([a[i - 1] === b[j - 1] ? 'equal' : 'replace', i - 1, j - 1]); i--; j--; }
    else if (i > 0 && d[i * W + j] === d[(i - 1) * W + j] + 1) { ops.push(['delete', i - 1, j]); i--; }
    else { ops.push(['insert', i, j - 1]); j--; }
  }
  ops.reverse();
  const out = [];
  let ai = 0, bj = 0;
  for (const [t] of ops) {
    const last = out[out.length - 1];
    const di = t === 'insert' ? 0 : 1, dj = t === 'delete' ? 0 : 1;
    if (last && last[0] === t) { last[2] += di; last[4] += dj; }
    else out.push([t, ai, ai + di, bj, bj + dj]);
    ai += di; bj += dj;
  }
  return { ops: out, distance: d[n * W + m] };
}

function boundaries(ref, heard, ops) {
  const b = new Array(ref.length + 1).fill(0);
  for (const [, i1, i2, j1, j2] of ops) for (let k = i1; k <= i2; k++) b[k] = j1 + (i2 > i1 ? Math.round(((k - i1) * (j2 - j1)) / (i2 - i1)) : 0);
  b[ref.length] = heard.length;
  return b;
}
function run(heard, a, b, c) {
  let k = -1;
  for (let x = a; x < b; x++) if (heard[x] === c) { k = x; break; }
  if (k < 0) return [0, a, a];
  let s = k, e = k;
  while (s > 0 && heard[s - 1] === c) s--;
  while (e < heard.length && heard[e] === c) e++;
  return [e - s, s, e];
}
const dur = (heard, times, s, e) => Math.max(0, times[Math.min(e, times.length - 1)] - (s && HARAKAT.has(heard[s - 1]) ? times[s - 1] : times[s]));

// One ref out of slices of several ayahs: parts = [{ ref, from, to }] (word indices, `to` excluded)
export function sliceRefs(parts) {
  let p = '', w = [], u = [];
  for (const { ref, from, to } of parts) {
    const spans = ref.w.slice(from, to);
    const s0 = spans.find(([a, z]) => z > a)?.[0] ?? spans[0]?.[0] ?? 0;
    const e0 = [...spans].reverse().find(([a, z]) => z > a)?.[1] ?? s0;
    const o = p.length - s0, w0 = w.length - from;
    p += ref.p.slice(s0, e0);
    w.push(...spans.map(([a, z]) => [Math.max(s0, a) + o, Math.min(e0, Math.max(a, z)) + o]));
    for (const x of ref.u) if (x[3] >= from && x[3] < to && x[0] >= s0 && x[1] <= e0) u.push([x[0] + o, x[1] + o, x[2], x[3] + w0, x[4], x[5], x[6]]);
  }
  return { p, w, u };
}

// heard: the script the model wrote; probs / times: per heard symbol (times has one more: the end).
// opts: { kinds: Set of what to judge (see CHECKS in rules.mjs), ends: Set of word indices where a breath ended,
//         tempo: [] kept by the caller for the session, minProb }
// → { words: [[remark]], distance, length }   remark: { check, rule, kind, heard, want, text }
export function judge(ref, heard, probs = null, times = null, opts = {}) {
  const { kinds = null, ends = new Set([ref.w.length - 1]), tempo = null, minProb = 0.3 } = opts;
  const on = (k) => !kinds || kinds.has(k);
  const { ops, distance } = opcodes(ref.p, heard);
  const b = boundaries(ref.p, heard, ops);
  const words = ref.w.map(() => []);
  const unsure = (hs, he) => {
    if (!probs) return false;
    let lo = 1; for (let i = Math.max(0, hs - 1); i < Math.min(probs.length, he + 1); i++) lo = Math.min(lo, probs[i]);
    return lo < minProb;
  };
  const units = ref.u.map(([s, e, k, w, golden, r, c]) => ({ s, e, kind: KINDS[k], word: w, golden, rule: r >= 0 ? RULES[r] : '', char: c }));
  // the reciter's own pace: half the median natural madd (not at the end of a breath)
  let unit = null;
  if (times && times.length === heard.length + 1) {
    const nat = [];
    for (const x of units) if (x.kind === 'madd' && x.rule === 'NormalMaddRule' && !ends.has(x.word)) {
      const [n, s, e] = run(heard, Math.max(0, b[x.s] - 1), Math.min(heard.length, b[x.e] + 1), x.char);
      if (n >= 1 && n <= 3) { const d = dur(heard, times, s, e); if (d > 0.08 && d < 2) nat.push(d); }
    }
    if (tempo) { tempo.push(...nat); tempo.splice(0, Math.max(0, tempo.length - 40)); }
    const src = nat.length >= 2 ? nat : tempo && tempo.length >= 3 ? tempo : [];
    if (src.length) unit = [...src].sort((x, y) => x - y)[Math.floor(src.length / 2)] / 2;
  }
  const add = (x, check, extra) => words[x.word].push({ check, kind: x.kind, rule: x.rule, char: x.char, ...extra });
  const seen = {};
  for (const x of units) {
    const hs = b[x.s], he = b[x.e];
    if (x.kind === 'madd') {
      const check = x.rule === 'NormalMaddRule' ? 'madd' : ['MonfaselMaddRule', 'MottaselMaddRule', 'MottaselMaddPauseRule'].includes(x.rule) ? 'madd_hamz' : 'madd_stop';
      let [n, rs, re] = run(heard, Math.max(0, hs - 1), Math.min(heard.length, he + 1), x.char);
      if (x.rule.startsWith('Leen') && n > 0) n++;
      const sym = n;
      if (unit && (n === 4 || n === 5)) { const tc = dur(heard, times, rs, re) / unit; n = tc >= TIME_SIX ? 6 : tc >= TIME_FIVE ? 5 : 4; }
      const allowed = ALLOWED[x.rule];
      const near = allowed.reduce((p, a) => (Math.abs(a - n) < Math.abs(p - n) ? a : p), allowed[0]);
      (seen[x.rule] ??= []).push([x.word, sym]);
      if (!on(check)) continue;
      if (n === 0 && !x.rule.startsWith('Leen')) { if (!unsure(hs, he)) add(x, check, { heard: 0, want: x.golden, what: 'missing' }); }
      else if (Math.abs(n - near) > 1 && !unsure(hs, he)) add(x, check, { heard: n, want: allowed.includes(x.golden) ? x.golden : near, what: n > near ? 'long' : 'short' });
    } else if (x.kind === 'qalqalah') {
      if (on('qalqalah') && !heard.slice(Math.max(0, hs - 1), he + 1).includes('ڇ') && !unsure(hs, he)) add(x, 'qalqalah', { what: 'missing', letter: ref.p[x.s - 1] ?? '' });
    } else if (x.kind === 'ikhfa') {
      if (!on('ikhfa') || unsure(hs, he)) continue;
      const [n] = run(heard, hs, Math.max(he, hs + 1), 'ں');
      if (n === 0 && heard.slice(hs, he + 1).includes('ن')) add(x, 'ikhfa', { what: 'izhar' });
      else if (n && n < x.golden - 1) add(x, 'ikhfa', { what: 'short' });
    } else if (x.kind === 'iqlab') {
      if (on('iqlab') && !heard.slice(Math.max(0, hs - 1), he + 1).includes('۾') && !unsure(hs, he)) add(x, 'iqlab', { what: 'missing' });
    } else if (x.kind === 'ghunnah' || x.kind === 'idgham_ghunnah') {
      const check = x.kind === 'idgham_ghunnah' ? 'idgham' : x.char === 'م' ? 'mim' : 'ghunnah';
      const alsoMim = x.char === 'م' && x.kind === 'ghunnah';
      if (!(on(check) || (alsoMim && on('ghunnah'))) || unsure(hs, he)) continue;
      const [n] = run(heard, Math.max(0, hs - 1), Math.min(heard.length, he + 1), x.char);
      const moreNun = (heard.slice(Math.max(0, hs - 2), he).split('ن').length) > (ref.p.slice(Math.max(0, x.s - 2), x.e).split('ن').length);
      if (x.kind === 'idgham_ghunnah' && x.char !== 'ن' && moreNun) add(x, check, { what: 'not_merged', letter: x.char });
      else if (n < x.golden) add(x, on(check) ? check : 'ghunnah', { what: 'short' });
    } else if (x.kind === 'idgham') {
      if (!on('idgham') || unsure(hs, he)) continue;
      const moreNun = (heard.slice(Math.max(0, hs - 2), he).split('ن').length) > (ref.p.slice(Math.max(0, x.s - 2), x.e).split('ن').length);
      if (moreNun) add(x, 'idgham', { what: 'not_merged', letter: x.char });
    }
  }
  // the same kind of madd keeps the same length through the recitation
  for (const [rule, list] of Object.entries(seen)) {
    const check = ['MonfaselMaddRule', 'MottaselMaddRule'].includes(rule) ? 'madd_hamz' : rule === 'AaredMaddRule' ? 'madd_stop' : null;
    if (!check || !on(check) || list.length < 2) continue;
    const lens = list.map(([, n]) => n).filter(Boolean);
    if (lens.length && Math.max(...lens) - Math.min(...lens) >= 2) {
      const avg = Math.round(lens.reduce((t, n) => t + n, 0) / lens.length);
      const [w] = list.reduce((p, x) => (Math.abs(x[1] - avg) > Math.abs(p[1] - avg) ? x : p));
      if (!words[w].some((r) => r.rule === rule)) words[w].push({ check, kind: 'madd', rule, what: 'uneven', lens });
    }
  }
  return { words, distance, length: ref.p.length };
}
