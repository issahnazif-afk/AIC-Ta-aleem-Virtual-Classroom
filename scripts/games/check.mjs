// Checks Play & Make (src/lib/games/) and writes the review sheet for Ustadh Issah (docs/activities-review.md).
//   node scripts/games/check.mjs                                  check everything
//   node scripts/games/check.mjs --approve "Ustadh Issah" YYYY-MM-DD   record his approval of every entry as it is now
//
// 1. Every hadith reference, as scripts/deen/check.mjs does it (the same open hadith-api, sunnah.com numbering):
//    the number exists, the key Arabic words are in that hadith letter for letter, and a hadith outside Bukhari and
//    Muslim is graded sahih or hasan by al-Albani. Facts from a book of seerah name the book and the page or chapter.
// 2. The English: the writing check of the Al-Huda Books (scripts/books/writing.mjs: signs of AI writing, and the
//    longest sentence for each level), on every line the games show or read aloud.
// 3. The maze: thousands of wall shifts at every level, checking after each one that the maze is still a perfect
//    maze (one way between any two cells) and that the goal can be reached from the traveller's cell. Then whole
//    games played by a simulated student (maze-sim.mjs) with the shifting walls and the roaming monsters together:
//    the goal must never be cut off, and nine in ten games at each level must be won within five minutes.
// 4. Each game's own checks (its data file's CHECKS: puzzles that can be solved, boards that add up).
// Then the review sheet: every entry with its source and link, ticked when it matches what Ustadh Issah approved
// (scripts/games/approved.json keeps a fingerprint of each approved entry, as for My Deen); new or changed entries
// show as pending review.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { lintText } from '../books/writing.mjs';
import { NAMES, refText, refUrl } from '../../src/lib/deen/refs.mjs';
import { makeMaze, planShift, applyShift, isTree, reachable, neighbours } from '../../src/lib/games/maze-core.mjs';
import { MAZE_LEVELS } from '../../src/lib/games/mazes.mjs';
import { simulate } from './maze-sim.mjs';

// the data files of the games (no DOM): each may export REVIEW (entries to approve), TEXTS ([where, text, level])
// and CHECKS (a function returning a list of problems)
const DATA = ['content.mjs', 'lines.mjs'];
const extra = fs.readdirSync(new URL('../../src/lib/games/data/', import.meta.url)).filter((f) => f.endsWith('.mjs')).map((f) => `data/${f}`);
const mods = [];
for (const f of [...DATA, ...extra]) mods.push([f, await import(`../../src/lib/games/${f}`)]);

const root = new URL('../../', import.meta.url);
const cache = path.join(new URL('node_modules/.cache/hadith-api/', root).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
fs.mkdirSync(cache, { recursive: true });
async function edition(c) {
  const f = path.join(cache, `ara-${c}.json`);
  if (!fs.existsSync(f)) {
    const url = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${c}.min.json`;
    process.stdout.write(`Downloading ${NAMES[c]}… `);
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${url}: ${r.status}`);
    fs.writeFileSync(f, await r.text());
    console.log('done');
  }
  const byNo = new Map();
  for (const h of JSON.parse(fs.readFileSync(f, 'utf8')).hadiths) {
    const n = Math.floor(Number(h.arabicnumber ?? h.hadithnumber));
    if (!byNo.has(n)) byNo.set(n, []);
    byNo.get(n).push(h);
  }
  return byNo;
}
// letters only: no vowels, no tatweel, one form of alif, ya and ta marbuta, no punctuation
const bare = (t) => t
  .replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ‎‏]/g, '')
  .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/ء/g, '')
  .replace(/[^ء-ي ]/g, ' ').replace(/\s+/g, ' ').trim();

const problems = [];
const REVIEW = mods.flatMap(([, m]) => m.REVIEW ?? []);
const TEXTS = mods.flatMap(([, m]) => m.TEXTS ?? []);

// ── 1. sources ──
const loaded = {}, grades = {};
const cites = [];
for (const e of REVIEW) {
  if (e.src) cites.push([e.id, e.src, e.key]);
  if (e.also) cites.push([e.id, e.also, e.alsoKey]);
  if (!e.src && !e.book) problems.push(`${e.id}: no source (src or book)`);
  if (e.book && !/\d/.test(e.book)) problems.push(`${e.id}: the book source needs a volume, page or chapter number`);
}
for (const [where, r, look] of cites) {
  if (!NAMES[r.c]) { problems.push(`${where}: unknown collection "${r.c}"`); continue; }
  loaded[r.c] ??= await edition(r.c);
  const hs = loaded[r.c].get(r.n);
  if (!hs) { problems.push(`${where}: there is no ${refText(r)}`); continue; }
  const text = bare(hs.map((h) => h.text).join(' '));
  const parts = (look ?? '').split('·').map(bare).filter(Boolean);
  if (!parts.length) problems.push(`${where}: nothing to look for in ${refText(r)} (add key)`);
  for (const p of parts) if (!text.includes(p)) problems.push(`${where}: ${refText(r)} does not contain "${p}"`);
  if (!['bukhari', 'muslim'].includes(r.c)) {
    const g = hs.flatMap((h) => h.grades ?? []);
    const alb = g.find((x) => /albani/i.test(x.name))?.grade ?? '';
    grades[`${r.c}:${r.n}`] = alb ? `${alb} (al-Albani)` : 'no grade';
    if (!/sahih|hasan/i.test(alb) || /da.?if|weak|munkar|mawdu/i.test(alb)) problems.push(`${where}: ${refText(r)} is graded "${alb || 'no grade'}"`);
  }
}

// ── 2. the English ──
for (const [where, t, level] of TEXTS) {
  if (!t) continue;
  if (/[—“”‘’]/.test(t)) problems.push(`${where}: em dash or curly quotes in "${t.slice(0, 50)}…"`);
  for (const m of lintText(t, level ?? 4)) problems.push(`${where}: ${m}: "${t.slice(0, 70)}…"`);
}

// ── 3. the maze: shifting walls never shut the way to the goal ──
let shifts = 0;
for (const [lv, L] of Object.entries(MAZE_LEVELS)) {
  if (!L.every) continue;
  for (let run = 0; run < 20; run++) {
    const m = makeMaze(L.size, L.size);
    let token = m.start;
    for (let i = 0; i < 150; i++) {
      applyShift(m, planShift(m, L.swaps, Math.random, { avoid: [token, m.start, m.goal], bias: L.bias, token }));
      shifts++;
      if (!isTree(m)) { problems.push(`maze level ${lv}: a shift left the maze with a loop or a closed pocket`); break; }
      if (!reachable(m, token, m.goal)) { problems.push(`maze level ${lv}: a shift cut the traveller off from the goal`); break; }
      const nb = neighbours(m, token); token = nb[Math.floor(Math.random() * nb.length)];
    }
  }
}

// whole games with the walls and the monsters together (a steady pace for each level's age)
const PACE = { 2: 600, 3: 480, 4: 400 }, simLines = [];
for (const [lv, L] of Object.entries(MAZE_LEVELS)) {
  if (!L.monsters) continue;
  const rs = Array.from({ length: 50 }, () => simulate(L, { pace: PACE[lv] }));
  const won = rs.filter((r) => r.won), secs = won.map((r) => r.secs).sort((a, b) => a - b);
  if (rs.some((r) => r.cutOff)) problems.push(`maze level ${lv}: in a simulated game the goal was cut off`);
  if (won.length < 45) problems.push(`maze level ${lv}: only ${won.length} of 50 simulated games were won in five minutes`);
  simLines.push(`Level ${lv}: ${won.length}/50 won, median ${secs[secs.length >> 1] ?? '-'} s, ${(rs.reduce((a, r) => a + r.gobbles, 0) / rs.length).toFixed(1)} gobbles a game`);
}

// ── 4. each game's own checks ──
for (const [f, m] of mods) if (typeof m.CHECKS === 'function') for (const p of m.CHECKS()) problems.push(`${f}: ${p}`);
const ids = REVIEW.map((e) => e.id), dup = ids.filter((x, i) => ids.indexOf(x) !== i);
if (dup.length) problems.push(`ids used twice: ${dup.join(', ')}`);

// ── the approval and the review sheet ──
const APPROVED = new URL('scripts/games/approved.json', root);
const hash = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
const ai = process.argv.indexOf('--approve');
if (ai > -1) {
  const by = process.argv[ai + 1], date = process.argv[ai + 2];
  if (!by || !/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) { console.log('Use: --approve "Name" YYYY-MM-DD'); process.exit(1); }
  fs.writeFileSync(APPROVED, JSON.stringify({ by, date, entries: Object.fromEntries(REVIEW.map((e) => [e.id, hash(e)])) }, null, 1) + '\n');
}
const approval = fs.existsSync(APPROVED) ? JSON.parse(fs.readFileSync(APPROVED, 'utf8')) : null;
const ok = (e) => approval?.entries?.[e.id] === hash(e);
const pending = REVIEW.filter((e) => !ok(e));
const box = (e) => (ok(e) ? '[x]' : '[ ] **pending review**');
const srcMd = (e) => [e.src, e.also].filter(Boolean).map((r) => `[${refText(r)}](${refUrl(r)})${grades[`${r.c}:${r.n}`] ? ` (${grades[`${r.c}:${r.n}`]})` : ''}`).concat(e.book ? [e.book] : []).join(', ');
const longDate = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const md = ['# Play & Make: review sheet', '',
  approval ? `> **Approved by ${approval.by} on ${longDate(approval.date)}**: ${REVIEW.length - pending.length} of ${REVIEW.length} entries.${pending.length ? ` ${pending.length} are new or changed since and marked **pending review**.` : ''}`
    : `> **Not yet reviewed.** All ${REVIEW.length} entries are pending review by Ustadh Issah.`, '',
  'Made by `node scripts/games/check.mjs` (`npm run games`) from `src/lib/games/`. Every fact, clue, name and date the',
  'games show, with its source. The script has checked that each hadith number exists, that the Arabic words are in that',
  'hadith, and that a hadith outside Bukhari and Muslim is graded sahih or hasan by al-Albani. Facts of history name the',
  'book they come from. After checking, record the approval with',
  '`node scripts/games/check.mjs --approve "Ustadh Issah" YYYY-MM-DD`; an entry changed after that shows as pending again.', '',
  'The games took their ideas (not their words, pictures or puzzles) from printable worksheets; every word here is the',
  'school\'s own.', ''];
const groups = [...new Set(REVIEW.map((e) => e.group ?? 'Fact cards'))];
for (const g of groups) {
  md.push(`## ${g}`, '');
  for (const e of REVIEW.filter((x) => (x.group ?? 'Fact cards') === g)) md.push(`- ${box(e)} **${e.title}**: ${e.text}${e.ar ? ` (${e.ar})` : ''} Source: ${srcMd(e)}.${e.note ? ` *Note:* ${e.note}` : ''}`);
  md.push('');
}
fs.writeFileSync(new URL('docs/activities-review.md', root), md.join('\n'));

console.log(`Play & Make: ${REVIEW.length} entries, ${cites.length} hadith references, ${TEXTS.length} lines of English, ${shifts} maze shifts checked.`);
console.log(`Simulated maze games: ${simLines.join('; ')}.`);
console.log(approval ? `Approved by ${approval.by} on ${approval.date}: ${REVIEW.length - pending.length} of ${REVIEW.length}.` : `Not yet approved: ${pending.length} entries pending review.`);
console.log(problems.length ? problems.join('\n') : 'No problems found.');
process.exit(problems.length ? 1 : 0);
