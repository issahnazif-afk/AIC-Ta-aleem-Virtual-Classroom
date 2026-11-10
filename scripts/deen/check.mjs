// Checks every hadith in My Deen (src/lib/deen/) against the hadith text, then writes the review sheet for the
// Islamic Studies teacher (docs/deen-review.md).
//   node scripts/deen/check.mjs            check (downloads the collections once, into node_modules/.cache)
//
// The text comes from the open hadith-api (github.com/fawazahmed0/hadith-api, public domain), which uses the
// numbering of sunnah.com (for Sahih Muslim the numbers of Muhammad Fu'ad 'Abd al-Baqi, e.g. 2713 for 2713a-c).
// For each reference the check asks:
//   1. is there a hadith with that number in that collection?
//   2. are the words of the du'a (or the entry's key words) in it, letter for letter (vowels and hamza forms aside)?
//   3. is it sound? Bukhari and Muslim are; for the Sunan, al-Albani's grade must be sahih or hasan.
// It stops with a list of problems if any reference fails. Passing this check is not a scholar's review: every
// entry also has its sunnah.com link in the review sheet, for Ustadh Issah to read and approve.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DUAS, CATEGORIES } from '../../src/lib/deen/duas.mjs';
import { SUNNAH } from '../../src/lib/deen/sunnah.mjs';
import { VIRTUES, DAY, LIFE } from '../../src/lib/deen/prophet.mjs';
import { DAYS } from '../../src/lib/deen/days.mjs';
import { NAMES, refText, refUrl } from '../../src/lib/deen/refs.mjs';

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
export const bare = (t) => t
  .replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ‏‎]/g, '')
  .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/ء/g, '')
  .replace(/[^ء-ي ]/g, ' ').replace(/\s+/g, ' ').trim();

// every item that cites a hadith, with what to look for
const items = [];
const cite = (where, title, src, look) => { for (const r of src ?? []) items.push({ where, title, r, look }); };
for (const d of DUAS) cite(`du'a ${d.id}`, d.when, d.src, d.key ?? d.ar);
for (const s of SUNNAH) cite(`sunnah ${s.id}`, s.title, s.src, s.key);
for (const v of VIRTUES) { cite(`virtue ${v.id}`, v.title, [v.hadith.src], v.hadith.key); if (v.story?.src) cite(`virtue ${v.id} (story)`, v.title, [v.story.src], v.story.key); }
for (const e of LIFE) if (e.src) cite(`life ${e.id}`, e.title, [e.src], e.key);
for (const d of DAYS) if (d.src) cite(`day ${d.id}`, d.title, [d.src], d.key);

const problems = [];
const loaded = {};
const found = {};
for (const it of items) {
  const { c, n } = it.r;
  if (!NAMES[c]) { problems.push(`${it.where}: unknown collection "${c}"`); continue; }
  loaded[c] ??= await edition(c);
  const hs = loaded[c].get(n);
  if (!hs) { problems.push(`${it.where}: there is no ${refText(it.r)}`); continue; }
  const text = bare(hs.map((h) => h.text).join(' '));
  // a du'a written with "·" between its parts (the sneezing du'a, the tasbih) is checked part by part
  const parts = (it.look ?? '').split('·').map((p) => bare(p.replace(/[٠-٩0-9()]/g, ''))).filter(Boolean);
  const missing = parts.filter((p) => !text.includes(p));
  if (!parts.length) problems.push(`${it.where}: nothing to look for (add key)`);
  else if (missing.length) problems.push(`${it.where}: ${refText(it.r)} does not contain "${missing[0]}"`);
  let grade = 'Sahih (in the Sahih)';
  if (!['bukhari', 'muslim'].includes(c)) {
    const g = hs.flatMap((h) => h.grades ?? []);
    const alb = g.find((x) => /albani/i.test(x.name))?.grade ?? '';
    grade = alb ? `${alb} (al-Albani)` : g.map((x) => `${x.grade} (${x.name})`).join('; ');
    if (!/sahih|hasan/i.test(alb) || /da.?if|weak|munkar|mawdu/i.test(alb)) problems.push(`${it.where}: ${refText(it.r)} is graded "${grade || 'no grade'}"`);
  }
  found[`${c}:${n}`] = grade;
}

// the writing: straight quotes, no em dashes
const words = [];
for (const d of DUAS) words.push([`du'a ${d.id}`, d.when, d.en]);
for (const s of SUNNAH) words.push([`sunnah ${s.id}`, s.title, s.do, s.en]);
for (const v of VIRTUES) words.push([`virtue ${v.id}`, v.text, v.hadith.en, v.story?.en, v.today]);
for (const e of [...DAY, ...LIFE, ...DAYS]) words.push([e.id, e.title, e.text, e.en]);
for (const [where, ...ts] of words) for (const t of ts) if (t && /[—“”‘’]/.test(t)) problems.push(`${where}: em dash or curly quote in "${t.slice(0, 50)}…"`);

// each du'a's parts, put back together, must be exactly its words (vowels and all)
const same = (t) => t.replace(/[0-9()·]/g, ' ').replace(/\s+/g, ' ').trim();
for (const d of DUAS) {
  if (d.quran) { if (d.parts) problems.push(`du'a ${d.id}: a Qur'an du'a takes its parts from the ayat (remove parts)`); continue; }
  if (!d.parts?.length) { problems.push(`du'a ${d.id}: needs parts`); continue; }
  if (same(d.parts.join(' ')) !== same(d.ar)) problems.push(`du'a ${d.id}: the parts do not add up to the du'a`);
}
const HISN_FITS = ['exact', 'close', 'longer'];
for (const d of DUAS) if (d.hisn && (!Number.isInteger(d.hisn.id) || !HISN_FITS.includes(d.hisn.fit))) problems.push(`du'a ${d.id}: hisn needs { id, fit: ${HISN_FITS.join(' | ')} }`);

// links from the day and the life to the du'as and sunnahs
const ids = new Set([...DUAS.map((d) => d.id), ...SUNNAH.map((s) => s.id)]);
for (const s of DAY) for (const l of s.links ?? []) if (!ids.has(l)) problems.push(`day step ${s.id}: no du'a or sunnah "${l}"`);
for (const d of DUAS) if (!CATEGORIES.some((c) => c.id === d.cat)) problems.push(`du'a ${d.id}: no category "${d.cat}"`);
const dup = [...DUAS, ...SUNNAH, ...VIRTUES].map((x) => x.id).filter((x, i, a) => a.indexOf(x) !== i);
if (dup.length) problems.push(`ids used twice: ${dup.join(', ')}`);

// ── the teacher's approval ──
// scripts/deen/approved.json keeps, for every entry the Islamic Studies teacher approved, a fingerprint (hash) of
// its content. An entry that is new, or has changed since, no longer matches and shows as pending on the sheet.
//   node scripts/deen/check.mjs --approve "Ustadh Issah" 2026-11-10   records an approval of every entry as it is now
const APPROVED = new URL('scripts/deen/approved.json', root);
const hash = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
const entries = [
  ...DUAS.map((x) => [`dua:${x.id}`, x]), ...SUNNAH.map((x) => [`sunnah:${x.id}`, x]), ...VIRTUES.map((x) => [`virtue:${x.id}`, x]),
  ...DAY.map((x) => [`day:${x.id}`, x]), ...LIFE.map((x) => [`life:${x.id}`, x]), ...DAYS.map((x) => [`special:${x.id}`, x]),
];
const ai = process.argv.indexOf('--approve');
if (ai > -1) {
  const by = process.argv[ai + 1], date = process.argv[ai + 2];
  if (!by || !/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) { console.log('Use: --approve "Name" YYYY-MM-DD'); process.exit(1); }
  fs.writeFileSync(APPROVED, JSON.stringify({ by, date, entries: Object.fromEntries(entries.map(([k, x]) => [k, hash(x)])) }, null, 1) + '\n');
}
const approval = fs.existsSync(APPROVED) ? JSON.parse(fs.readFileSync(APPROVED, 'utf8')) : null;
const ok = (key, x) => approval?.entries?.[key] === hash(x);
const nApproved = entries.filter(([k, x]) => ok(k, x)).length;
const pending = entries.filter(([k, x]) => !ok(k, x)).map(([k]) => k);
const box = (key, x) => (ok(key, x) ? '[x]' : '[ ] **pending review**');

// ── the review sheet ──
const longDate = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const md = ['# My Deen: review sheet', '',
  ...(approval ? [`> **Approved by ${approval.by} on ${longDate(approval.date)}** (${approval.date}): ${nApproved} of ${entries.length} entries.`
    + (pending.length ? ` ${pending.length} ${pending.length === 1 ? 'entry is' : 'entries are'} new or changed since then and marked **pending review**.` : ' Nothing has changed since.'), ''] : []),
  'Made by `node scripts/deen/check.mjs` from `src/lib/deen/`. Every du\'a, sunnah, hadith and ayah in the My Deen section,',
  'with its source and a link to read it on sunnah.com. The script has checked that each number exists, that the Arabic',
  'words are in that hadith, and that each hadith outside Bukhari and Muslim is graded sahih or hasan by al-Albani.',
  'A ticked box was approved by the Islamic Studies teacher. An entry added or changed after the approval shows',
  '"pending review" until it is approved again (`node scripts/deen/check.mjs --approve "Name" YYYY-MM-DD`).', '',
  `${DUAS.length} du'as, ${SUNNAH.length} sunnahs, ${VIRTUES.length} character cards, ${DAY.length} steps of the day, ${LIFE.length} moments of the Seerah, ${DAYS.length} special days.`, ''];
const src = (list) => list.map((r) => `[${refText(r)}](${refUrl(r)})${found[`${r.c}:${r.n}`] && !['bukhari', 'muslim'].includes(r.c) ? ` (${found[`${r.c}:${r.n}`]})` : ''}`).join(', ');
const ayah = (q) => [q].flat().map((x) => `Qur'an ${x.s}:${x.a}${x.w ? ` (words ${x.w[0]}–${x.w[1]})` : ''}`).join(' and ');
md.push('## My du\'as', '', 'Each du\'a is split into parts at its natural pauses: the lesson plays one part, then the child says it back,',
  'and each part is its own Voice Studio recording. The last column is the matching item on hisnmuslim.com (used only',
  'after the school has permission): exact, close (one small difference) or longer (our words are inside a longer item).', '');
for (const c of CATEGORIES) {
  md.push(`### ${c.title}`, '');
  md.push('| ✓ | When | Parts (for "Repeat after me") | How to say it | Meaning | Source | hisnmuslim.com |', '|---|---|---|---|---|---|---|');
  for (const d of DUAS.filter((x) => x.cat === c.id)) {
    const parts = d.quran ? `the ayat: ${ayah(d.quran)}` : d.parts.map((x, i) => `${i + 1}. ${x}`).join('<br>');
    const hisn = d.hisn ? `item ${d.hisn.id} (${d.hisn.fit})` : d.quran ? '' : 'no match';
    md.push(`| ${box(`dua:${d.id}`, d)} | ${d.when} (Level ${d.level}+) | ${parts} | *${d.tr}* | "${d.en}" | ${d.quran ? `Tanzil text` : src(d.src)} | ${hisn} |`);
  }
  md.push('');
}
md.push('## Sunnah of the day', '');
for (const s of SUNNAH) md.push(`- ${box(`sunnah:${s.id}`, s)} **${s.title}** (Level ${s.level}+). ${s.do} Hadith: "${s.en}" ${src(s.src)}.`);
md.push('', '## Our Prophet ﷺ: his character', '');
for (const v of VIRTUES) md.push(`- ${box(`virtue:${v.id}`, v)} **${v.title}**. ${v.text} Hadith: "${v.hadith.en}" ${src([v.hadith.src])}.${v.story ? ` Example: "${v.story.en}" ${src([v.story.src])}.` : ''} Today: ${v.today}`);
md.push('', '## A day like the Prophet ﷺ', '');
for (const s of DAY) md.push(`- ${box(`day:${s.id}`, s)} **${s.title}**: ${s.text} (links: ${(s.links ?? []).join(', ')})`);
md.push('', '## His life ﷺ', '');
for (const e of LIFE) md.push(`- ${box(`life:${e.id}`, e)} **${e.title}**: ${e.text}${e.src ? ` ${src([e.src])}.` : ''}${e.quran ? ` ${ayah(e.quran)}.` : ''}`);
md.push('', '## Special days (Hijri calendar)', '');
for (const d of DAYS) md.push(`- ${box(`special:${d.id}`, d)} **${d.title}**: ${d.text}${d.src ? ` ${src([d.src])}.` : ''}${d.quran ? ` ${ayah(d.quran)}.` : ''}`);
md.push('');
fs.writeFileSync(new URL('docs/deen-review.md', root), md.join('\n'));

console.log(`My Deen: ${items.length} hadith references checked in ${Object.keys(loaded).length} collections.`);
console.log(approval ? `Approved by ${approval.by} on ${approval.date}: ${nApproved} of ${entries.length} entries.${pending.length ? ` Pending review: ${pending.join(', ')}` : ''}` : 'Not yet approved by the Islamic Studies teacher.');
console.log(problems.length ? problems.join('\n') : 'No problems found.');
process.exit(problems.length ? 1 : 0);
