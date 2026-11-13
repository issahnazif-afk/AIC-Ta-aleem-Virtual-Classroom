// Examples for the Tajweed classroom (src/lib/tajweed/course.mjs), found in the Qur'an itself: every example is a real
// āyah of the Ḥafṣ mushaf, taken from the tajweed-coloured text the library already shows
// (public/quran/data/tajweed/NNN.json, from AlQuran.cloud's "quran-tajweed", made by scripts/quran/build-data.mjs).
// Most rules are read straight from its colour marks; a few it does not mark (the moon lām, iẓhār, the heavy letters,
// the rāʾ, the pause signs, the saktah) are found from the letters and their vowel signs.
//
//   node scripts/quran/tajweed-lessons.mjs   → public/quran/data/tajweed-lessons.json
//
// { rules: { <rule>: [ { k: "s:a", i: first word, n: words, w: [word html…], j30: in Juz' ʿAmma, t?: a tag } ] } }
// The focus is marked with class "focus" on its letters. Short āyāt only, Juz' ʿAmma and al-Fātiḥah first.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DATA = path.join(ROOT, 'public', 'quran', 'data');
const strip = (h) => h.replace(/<[^>]+>/g, '');
const SUK = '[ْۡ]';                 // sukūn (both forms)
const THROAT = 'ءأإؤئآعحغخه';
const MAX_WORDS = 12, KEEP = 24;

// the examples are a help, never a reason to stop the site's build: any surprise in the text skips them
process.on('uncaughtException', (e) => { console.warn(`– Tajweed lessons skipped: ${e.message}`); process.exit(0); });
let skipped = 0;
if (!fs.existsSync(path.join(DATA, 'tajweed', '001.json'))) { console.log('– Tajweed lessons skipped (no tajweed text)'); process.exit(0); }

// mark the span of a tajweed class inside a word as the focus
function focusClass(html, cls, which = 'first') {
  const re = new RegExp(`<span class="tj-${cls}">`, 'g');
  const all = [...html.matchAll(re)]; if (!all.length) return null;
  const m = which === 'last' ? all.at(-1) : all[0];
  return html.slice(0, m.index) + `<span class="tj-${cls} focus">` + html.slice(m.index + m[0].length);
}
// mark letters found in the plain word (the word loses its other colours, which is fine for these rules)
function focusPlain(plain, start, len) { return plain.slice(0, start) + `<span class="focus">${plain.slice(start, start + len)}</span>` + plain.slice(start + len); }
const startsWithSpan = (html, cls) => html.startsWith(`<span class="tj-${cls}">`);
const firstLetter = (p) => (/[ء-يٱ]/.exec(p) ?? [''])[0];

const R = {};   // rule → examples
const add = (rule, ex) => (R[rule] ??= []).push(ex);

for (let s = 1; s <= 114; s++) {
  const file = path.join(DATA, 'tajweed', `${String(s).padStart(3, '0')}.json`);
  if (!fs.existsSync(file)) continue;
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const [a, words] of Object.entries(j)) {
    if (!Array.isArray(words) || words.length > MAX_WORDS) continue;
    const k = `${s}:${a}`, j30 = s >= 78 || s === 1;
    const P = words.map(strip);
    // the first place a rule is found in the āyah is the example; d lists every word where it is found
    const hits = new Map();
    const ex = (rule, i, n, w, t) => {
      const span = Array.from({ length: n }, (_, x) => i + x);
      if (hits.has(rule)) { const e = hits.get(rule); for (const x of span) if (!e.d.includes(x)) e.d.push(x); return; }
      const ws = [...words]; for (const [x, h] of Object.entries(w)) ws[x] = h;
      hits.set(rule, { k, i, n, w: ws, d: span, j30, ...(t ? { t } : {}) });
    };
    const once = () => true;
    words.forEach((h, i) => { try {
      const p = P[i], last = i === words.length - 1, next = P[i + 1] ?? '';
      // the sun lām (marked) and the moon lām (a lām with sukūn after the waṣl alif)
      if (h.includes('tj-laam_shamsiyah') && once('shams')) ex('shams', i, 1, { [i]: focusClass(h, 'laam_shamsiyah') });
      { const m = new RegExp(`^(?:[وفبكل][َُِ]?)?ٱ(ل${SUK})`).exec(p); if (m && once('qamar')) ex('qamar', i, 1, { [i]: focusPlain(p, m.index + m[0].length - m[1].length, m[1].length + 1) }); }
      // hamzat al-waṣl, inside the āyah (where it is dropped)
      if (i > 0 && startsWithSpan(h, 'ham_wasl') && once('wasl')) ex('wasl', i, 1, { [i]: focusClass(h, 'ham_wasl') });
      // qalqalah: in the middle (ṣughrā), at the stop (kubrā)
      if (h.includes('tj-qalaqah') && !last && once('qalq_s')) ex('qalq_s', i, 1, { [i]: focusClass(h, 'qalaqah') });
      if (last) { const m = /([قطبجد])[ّ]?[ً-ِْۡ]?[ً-ِ]?[ۢ]?$/.exec(p.split(' ')[0]); if (m && /[قطبجد]/.test(m[1]) && once('qalq_k')) ex('qalq_k', i, 1, { [i]: focusPlain(p.split(' ')[0], m.index, 1) + (p.includes(' ') ? ' ' + p.split(' ').slice(1).join(' ') : '') }); }
      // ghunnah: nūn and mīm with shaddah
      if (h.includes('tj-ghunnah') && once('ghunnah')) ex('ghunnah', i, 1, { [i]: focusClass(h, 'ghunnah') });
      // iẓhār: nūn sākinah or tanwīn before a throat letter
      { const m = new RegExp(`ن${SUK}([${THROAT}])`).exec(p); if (m && once('izhar')) ex('izhar', i, 1, { [i]: focusPlain(p, m.index, m[0].length) }); }
      { const w0 = p.split(' ')[0]; if (!last && /[ًٌٍ][اى]?$/.test(w0) && THROAT.includes(firstLetter(next)) && once('izhar')) ex('izhar', i, 2, { [i]: focusPlain(w0, w0.search(/.[ًٌٍ]/), 2) + p.slice(w0.length), [i + 1]: focusPlain(next, next.indexOf(firstLetter(next)), 1) }); }
      { const w0 = p.split(' ')[0]; if (!last && new RegExp(`ن${SUK}$`).test(w0) && THROAT.includes(firstLetter(next)) && once('izhar')) ex('izhar', i, 2, { [i]: focusPlain(w0, w0.length - 2, 2) + p.slice(w0.length), [i + 1]: focusPlain(next, next.indexOf(firstLetter(next)), 1) }); }
      // the nūn rules and the mīm rules the colours mark: the first half of the pair (the second half starts the next word)
      for (const [cls, rule, cross] of [['idgham_ghunnah', 'idgham_g', true], ['idgham_wo_ghunnah', 'idgham_n', true], ['iqlab', 'iqlab', false], ['ikhafa', 'ikhfa', false], ['ikhafa_shafawi', 'ikhfa_sh', true], ['idgham_shafawi', 'idgham_sh', true], ['idgham_mutajanisayn', 'mithlayn', false], ['idgham_mutaqaribayn', 'mithlayn', false]]) {
        if (!h.includes(`tj-${cls}`)) continue;
        if (startsWithSpan(h, cls)) continue;   // the second half of a pair begun in the word before
        const lastSpan = [...h.matchAll(/<span class="tj-([a-z_]+)">[^<]*<\/span>/g)].at(-1);
        const endsHere = lastSpan && lastSpan[1] === cls && !/[ء-يٱ]/.test(strip(h.slice(lastSpan.index + lastSpan[0].length)));
        const pair = endsHere && !last && startsWithSpan(words[i + 1], cls);
        if (cross && !pair) continue;
        if ((rule === 'idgham_g' || rule === 'idgham_n') && !/[نً-ٍ]/.test(strip(h.match(new RegExp(`<span class="tj-${cls}">([^<]*)</span>`))?.[0] ?? ''))) continue;
        if (!once(rule)) continue;
        ex(rule, i, pair ? 2 : 1, pair ? { [i]: focusClass(h, cls, 'last'), [i + 1]: focusClass(words[i + 1], cls) } : { [i]: focusClass(h, cls) });
      }
      // iẓhār shafawī: mīm sākinah before any letter but mīm and bāʾ
      { const w0 = p.split(' ')[0]; const m = new RegExp(`م${SUK}`).exec(w0);
        if (m) { const after = w0.slice(m.index + 2); const nl = after ? firstLetter(after) : firstLetter(next);
          if (nl && !'مب'.includes(nl) && (after || !last) && once('izhar_sh')) ex('izhar_sh', i, after ? 1 : 2, after ? { [i]: focusPlain(p, m.index, 2) } : { [i]: focusPlain(w0, m.index, 2) + p.slice(w0.length), [i + 1]: focusPlain(next, next.indexOf(nl), 1) }); } }
      // the madd
      if (h.includes('tj-madda_normal') && once('madd_t')) ex('madd_t', i, 1, { [i]: focusClass(h, 'madda_normal') });
      if (h.includes('tj-madda_obligatory')) {
        const mm = /<span class="tj-madda_obligatory">([^<]*)<\/span>(.*)$/.exec(h); const rest = mm ? strip(mm[2]).split(' ')[0] : '';
        if (/[ءأإؤئ]/.test(rest.slice(0, 2)) && once('muttasil')) ex('muttasil', i, 1, { [i]: focusClass(h, 'madda_obligatory') });
        else if (!rest.replace(/[ً-ْٰ۟-ۭ]/g, '') && !last && /^[وف]?[أإءآ]/.test(next) && once('munfasil')) ex('munfasil', i, 2, { [i]: focusClass(h, 'madda_obligatory', 'last'), [i + 1]: focusPlain(next, next.search(/[أإءآ]/), 1) });
      }
      if (h.includes('tj-madda_permissible') && last && once('arid')) ex('arid', i, 1, { [i]: focusClass(h, 'madda_permissible') });
      if (h.includes('tj-madda_necessary') && once('lazim')) ex('lazim', i, 1, { [i]: focusClass(h, 'madda_necessary') }, /ٓ/.test(p) && i === 0 && a === '1' ? 'harfi' : 'kalimi');
      // the rāʾ: heavy with fatḥah or ḍammah, light with kasrah
      { const m = /رّ?([َُِ])/.exec(p); if (m) { const t = m[1] === 'ِ' ? 'ra_light' : 'ra_heavy'; if (once(t)) ex(t, i, 1, { [i]: focusPlain(p, m.index, m[0].length) }); } }
      // the heavy letters (istiʿlāʾ)
      { const m = /[خصضغطقظ]/.exec(p); if (m && once('heavy')) ex('heavy', i, 1, { [i]: focusPlain(p, m.index, 1) }, m[0]); }
      // the pause signs, and Ḥafṣ's saktah (the small sīn)
      { const m = /[ۖۗۚۛۘۙ]/.exec(p); if (m && !last && once('waqf')) ex('waqf', i, 1, { [i]: focusPlain(p, m.index, 1) }, { 'ۘ': 'lazim', 'ۙ': 'la', 'ۚ': 'jaiz', 'ۖ': 'sila', 'ۗ': 'qila', 'ۛ': 'muanaqa' }[m[0]]); }
      { const m = /ۜ/.exec(p); if (m) ex('sakt', i, 1, { [i]: focusPlain(p, m.index - 1, 2) }); }
    } catch { skipped++; } });
    for (const [rule, e] of hits) add(rule, e);
  }
}

// keep a spread: Juz' ʿAmma and al-Fātiḥah first (the children's examples), then a spread from the rest of the mushaf
const out = {};
for (const [rule, list] of Object.entries(R)) {
  const short = list.filter((x) => x.j30), rest = list.filter((x) => !x.j30);
  const bucket = (arr, n) => { if (arr.length <= n) return arr; const step = arr.length / n; return Array.from({ length: n }, (_, i) => arr[Math.floor(i * step)]); };
  // tagged rules keep every tag
  let pick = [...bucket(short, KEEP), ...bucket(rest, KEEP - Math.min(short.length, KEEP / 2))].slice(0, KEEP);
  for (const t of new Set(list.map((x) => x.t).filter(Boolean))) if (!pick.some((x) => x.t === t)) pick.push(...list.filter((x) => x.t === t).slice(0, 2));
  out[rule] = pick;
}
fs.writeFileSync(path.join(DATA, 'tajweed-lessons.json'), JSON.stringify({ rules: out }));
console.log(`✓ Tajweed lessons${skipped ? ` (${skipped} words skipped)` : ''}: ${Object.entries(out).map(([r, l]) => `${r} ${l.length}${l.filter((x) => x.j30).length ? ` (${l.filter((x) => x.j30).length} short)` : ''}`).join(', ')}`);
