// Checks Play & Make (src/lib/games/) and writes the review sheet for Ustadh Issah (docs/activities-review.md).
//   node scripts/games/check.mjs                                  check everything
//   node scripts/games/check.mjs --approve "Ustadh Issah" YYYY-MM-DD   record his approval of every entry as it is now
//
// 1. Every hadith reference, as scripts/deen/check.mjs does it (the same open hadith-api, sunnah.com numbering):
//    the number exists, the key Arabic words are in that hadith letter for letter, and a hadith outside Bukhari and
//    Muslim is graded sahih or hasan by al-Albani. Facts from a book of seerah name the book and the page or chapter.
// 2. The English: the writing check of the Ta’aleem Books (scripts/books/writing.mjs: signs of AI writing, and the
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
import { MAZES, mazeTrack, LEVELS, TRACK_LEN, STAGE_INTROS } from '../../src/lib/games/mazes.mjs';
import { simulate } from './maze-sim.mjs';

// the data files of the games (no DOM): each may export REVIEW (entries to approve), TEXTS ([where, text, level])
// and CHECKS (a function returning a list of problems)
const DATA = ['content.mjs', 'lines.mjs'];
const DATA_DIR = new URL('../../src/lib/games/data/', import.meta.url);
const extra = fs.existsSync(DATA_DIR) ? fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.mjs')).map((f) => `data/${f}`) : [];
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
// every stage of every level track of every maze (the night maze has its own dark stages, so every track is checked)
const TRACKS = Object.keys(MAZES).flatMap((id) => LEVELS.map((lv) => [id, lv, mazeTrack(id, lv)]));
let shifts = 0;
for (const [, , st] of TRACKS.filter(([id]) => id === 'hijrah')) for (const L of st) {
  if (!L.every) continue;
  for (let run = 0; run < 8; run++) {
    const m = makeMaze(L.size, L.size);
    let token = m.start;
    for (let i = 0; i < 100; i++) {
      applyShift(m, planShift(m, L.swaps, Math.random, { avoid: [token, m.start, m.goal], bias: L.bias, token }));
      shifts++;
      if (!isTree(m)) { problems.push(`maze L${L.level} stage ${L.n}: a shift left the maze with a loop or a closed pocket`); break; }
      if (!reachable(m, token, m.goal)) { problems.push(`maze L${L.level} stage ${L.n}: a shift cut the traveller off from the goal`); break; }
      const nb = neighbours(m, token); token = nb[Math.floor(Math.random() * nb.length)];
    }
  }
}
// every track has ten stages, the last is the Final, a track never gets smaller, and every intro has its card
for (const [id, lv, st] of TRACKS) {
  if (st.length !== TRACK_LEN) problems.push(`maze ${id} L${lv}: ${st.length} stages, not ${TRACK_LEN}`);
  if (!st[st.length - 1].final) problems.push(`maze ${id} L${lv}: the last stage is not marked final`);
  for (let i = 1; i < st.length; i++) if (st[i].size < st[i - 1].size) problems.push(`maze ${id} L${lv}: stage ${i + 1} is smaller than stage ${i}`);
  for (const L of st) if (L.intro && !STAGE_INTROS[L.intro]) problems.push(`maze ${id} L${lv} stage ${L.n}: no card for "${L.intro}"`);
}

// the class server checks each ranked score against the size of its maze: its table must match the tracks
{
  const gs = fs.readFileSync(new URL('apps-script/Code.gs', root), 'utf8');
  const sizes = JSON.parse((/const MAZE_SIZES = (\{[^;]+\});/.exec(gs)?.[1] ?? '{}').replace(/(\d):/g, '"$1":'));
  const floors = JSON.parse((/const MAZE_FLOORS = (\{[^;]+\});/.exec(gs)?.[1] ?? '{}').replace(/(\d+):/g, '"$1":'));
  for (const lv of LEVELS) {
    const st = mazeTrack('hijrah', lv);
    if (JSON.stringify(sizes[lv]) !== JSON.stringify(st.map((L) => L.size))) problems.push(`apps-script/Code.gs MAZE_SIZES for Level ${lv} does not match the track (${st.map((L) => L.size)})`);
    for (const L of st) if ((floors[lv]?.[L.n] ?? 1) !== L.floors) problems.push(`apps-script/Code.gs MAZE_FLOORS: Level ${lv} stage ${L.n} has ${L.floors} floor(s)`);
  }
}

// whole games with the walls, the Grumblies, the key, the tunnels, the floors, the storms, the doors and the powers
// together, at a steady pace for each level's age. Fog only hides the maze, so a track that differs only in its fog
// is played once.
const paceOf = (lv) => ({ 1: 650, 2: 550, 3: 450, 4: 450 })[lv], simLines = [];
const played = new Set();
const RUNS = Number(process.env.MAZE_RUNS || 50);
for (const [id, lv, st] of TRACKS) for (const L of st) {
  const sig = JSON.stringify({ ...L, fog: 0, powers: [...L.powers] });
  if (played.has(sig)) continue;
  played.add(sig);
  const rs = Array.from({ length: RUNS }, () => simulate(L, { pace: paceOf(lv) }));
  const won = rs.filter((r) => r.won), secs = won.map((r) => r.secs).sort((a, b) => a - b);
  const par = won.filter((r) => r.secs <= r.par).length;
  if (rs.some((r) => r.cutOff)) problems.push(`maze ${id} L${lv} stage ${L.n}: in a simulated game the goal or the key was cut off`);
  if (won.length < RUNS * 0.9) problems.push(`maze ${id} L${lv} stage ${L.n}: only ${won.length} of ${RUNS} simulated games were won in five minutes`);
  simLines.push(`L${lv} ${String(L.n).padStart(2)}: ${won.length}/${RUNS} won, median ${secs[secs.length >> 1] ?? '-'} s (par ${Math.round(rs.reduce((a, r) => a + r.par, 0) / rs.length)} s, ${won.length ? Math.round((100 * par) / won.length) : 0}% within par), ${(rs.reduce((a, r) => a + r.bumps, 0) / rs.length).toFixed(1)} bumps, ${(rs.reduce((a, r) => a + r.said, 0) / rs.length).toFixed(1)} dhikr, stars ${(won.reduce((a, r) => a + r.stars, 0) / Math.max(1, won.length)).toFixed(1)}`);
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
console.log('Simulated Dhikr Maze games (each stage of each level track):' + simLines.map((x) => '\n  ' + x).join(''));
console.log(approval ? `Approved by ${approval.by} on ${approval.date}: ${REVIEW.length - pending.length} of ${REVIEW.length}.` : `Not yet approved: ${pending.length} entries pending review.`);
console.log(problems.length ? problems.join('\n') : 'No problems found.');
process.exit(problems.length ? 1 : 0);
