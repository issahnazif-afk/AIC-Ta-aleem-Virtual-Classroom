// The hadith behind the Dhikr Maze powers (docs/games-plan.md, section 2), as candidates for Ustadh Issah to review
// (NOT approved, NOT used by the site until he approves them with scripts/sheikh/sources.mjs).
// Writes scripts/sheikh/candidates/game-powers.json; then run  node scripts/sheikh/sources.mjs  to merge them.
//   node scripts/sheikh/candidates/game-powers.mjs
//
// Source: hadith-api by fawazahmed0 (The Unlicense), English of sunnah.com, numbering of sunnah.com: the same editions
// and the same tidy() as hadith-candidates.mjs. Every "text" is taken from the downloaded JSON by code; nothing here is
// typed, paraphrased or translated. The games show only each power's phrase, its meaning and its reference, never these
// texts; approving them adds them to the Sheikh's library (they still need age levels in scripts/sheikh/levels.json
// before he says them). Bukhari 3282 has words that are not for children: the game shows its reference only.
import fs from 'node:fs';
import path from 'node:path';

const root = new URL('../../../', import.meta.url);
const file = (p) => path.join(new URL(p, root).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const cache = file('node_modules/.cache/hadith-api/');
async function edition(c) {
  const f = path.join(cache, `eng-${c}.json`);
  if (!fs.existsSync(f)) {
    fs.mkdirSync(cache, { recursive: true });
    const r = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-${c}.min.json`);
    if (!r.ok) throw new Error(`eng-${c}: ${r.status}`);
    fs.writeFileSync(f, await r.text());
  }
  return JSON.parse(fs.readFileSync(f, 'utf8')).hadiths;
}
// exactly the tidy() of scripts/sheikh/hadith.mjs and hadith-candidates.mjs
const tidy = (t) => {
  let s = t.replace(/`/g, 'ʿ').replace(/\s*\(ﷺ\)/g, ' ﷺ').replace(/\(may Allah's peace upon him\)/g, 'ﷺ').replace(/:(?=\S)/g, ': ').replace(/\s+/g, ' ').replace(/ﷺ\s+([,.;:])/g, 'ﷺ$1').trim();
  if ((s.match(/"/g) ?? []).length % 2) s += '"';
  return s;
};
const NAME = { bukhari: 'Bukhari', muslim: 'Muslim' };
// [collection, sunnah.com arabic number, the power it stands behind, words that must be in the text, the questions it answers]
const PICKS = [
  ['bukhari', '2993', 'saying Allahu Akbar going up and Subhan Allah going down (the stairs; the shield)', /went up a place we would say/, ['what do we say when we go up', 'what do we say when we go down']],
  ['bukhari', '3282', "seeking refuge with Allah from Satan when angry (the Huff storms)", /seek Refuge with Allah from Satan/i, ['what should I say when I am angry']],
  ['bukhari', '6384', 'La hawla wa la quwwata illa billah, a treasure of Paradise (the treasure doors)', /treasures of Paradise/, ['what is la hawla wa la quwwata illa billah', 'what is a treasure of Paradise']],
  ['bukhari', '4563', 'Hasbunallahu wa ni\'mal wakil, said by Ibrahim in the fire (the long shield)', /Sufficient for us/i, ['what is hasbunallah', 'what did Ibrahim say in the fire']],
  ['bukhari', '373', 'the garment whose markings distracted him in prayer (simple prayer mats)', /Khamisa/, ['should a prayer mat have pictures']],
  ['muslim', '408', 'sending blessings on the Prophet ﷺ, ten in return (salawat in the games)', /blesses me once/i, ['what happens when I send salawat on the Prophet']],
  ['muslim', '2734.01', 'saying Al-Hamdu lillah when eating and drinking (Alhamdulillah after a date)', /Al-Hamdu lillah/i, ['when should I say Alhamdulillah']],
];

const eds = { bukhari: await edition('bukhari'), muslim: await edition('muslim') };
const lib = fs.existsSync(file('public/data/sheikh-library.json')) ? JSON.parse(fs.readFileSync(file('public/data/sheikh-library.json'), 'utf8')) : { lines: [] };
const out = [];
for (const [c, a, topic, kw, ask] of PICKS) {
  const hs = eds[c].filter((x) => String(x.arabicnumber) === a);
  if (hs.length !== 1 || !hs[0].text) throw new Error(`${c} ${a}: ${hs.length} matches`);
  const h = hs[0];
  if (!kw.test(h.text)) throw new Error(`${c} ${a}: ${kw} is not in the text`);
  const [whole, dec] = a.split('.');
  const n = Number(whole);
  const letter = dec ? 'abcdefghijklmnopqrstuvwxyz'[Number(dec) - 1] : '';
  const ref = `${NAME[c]} ${n}${letter}`;
  if (lib.lines.some((x) => x.ref === `${NAME[c]} ${n}` || x.ref === ref)) { console.log(`${ref} is already in the Sheikh's library: left out`); continue; }
  out.push({
    id: `h-${c[0]}${n}`, kind: 'hadith', c, n, text: tidy(h.text), ref, url: `https://sunnah.com/${c}:${n}${letter}`, topic, ask,
    edition: { hadithnumber: h.hadithnumber, arabicnumber: h.arabicnumber, inbook: h.reference }, keyword: String(kw), theme: 'Dhikr Maze powers', status: 'pending',
  });
}
fs.writeFileSync(file('scripts/sheikh/candidates/game-powers.json'), JSON.stringify({
  source: 'hadith-api by fawazahmed0 (The Unlicense), https://github.com/fawazahmed0/hadith-api; English of sunnah.com, numbering of sunnah.com',
  status: 'Candidates for review by Ustadh Issah. None is approved; none is used by the site.',
  generated: new Date().toISOString().slice(0, 10), hadith: out,
}, null, 1) + '\n');
console.log(`${out.length} candidates → scripts/sheikh/candidates/game-powers.json: ${out.map((x) => x.id).join(', ')}`);
