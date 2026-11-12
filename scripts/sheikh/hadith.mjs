// The extra hadith the Sheikh can quote in conversation (src/data/sheikh-hadith.json), from Sahih al-Bukhari and
// Sahih Muslim only, in the English of hadith-api (fawazahmed0, the numbering of sunnah.com). Chosen by hand for
// children: manners, kindness, family, neighbours, anger, the Qur'an and learning. Only spacing is tidied and a
// missing closing quotation mark added; the words are as published. Ustadh Issah reviewed and approved these 40
// on 12 November 2026: a hadith added to PICKED later needs his review too.
//   node scripts/sheikh/hadith.mjs
import fs from 'node:fs';
import path from 'node:path';

export const PICKED = {
  bukhari: [68, 75, 77, 5027, 5031, 5033, 5037, 5049, 5054, 5997, 6011, 6012, 6065, 6114, 6116, 6125, 6129, 6136, 6168, 6221, 6234, 6236, 6237, 6244, 6464, 6465, 6484],
  muslim: [1914, 2168, 2548, 2552, 2553, 2564, 2588, 2618, 2624, 2626, 2694, 2708, 2732],
};
const root = new URL('../../', import.meta.url);
const file = (p) => path.join(new URL(p, root).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const cache = file('node_modules/.cache/hadith-api/');
fs.mkdirSync(cache, { recursive: true });

async function edition(c) {
  const f = path.join(cache, `eng-${c}.json`);
  if (!fs.existsSync(f)) {
    const r = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-${c}.min.json`);
    if (!r.ok) throw new Error(`eng-${c}: ${r.status}`);
    fs.writeFileSync(f, await r.text());
  }
  return JSON.parse(fs.readFileSync(f, 'utf8')).hadiths;
}
const tidy = (t) => {
  let s = t.replace(/`/g, 'ʿ').replace(/\s*\(ﷺ\)/g, ' ﷺ').replace(/\(may Allah's peace upon him\)/g, 'ﷺ').replace(/:(?=\S)/g, ': ').replace(/\s+/g, ' ').replace(/ﷺ\s+([,.;:])/g, 'ﷺ$1').trim();
  if ((s.match(/"/g) ?? []).length % 2) s += '"';
  return s;
};
const out = [];
for (const [c, nums] of Object.entries(PICKED)) {
  const hs = await edition(c);
  for (const n of nums) {
    const h = hs.find((x) => Math.floor(Number(x.arabicnumber ?? x.hadithnumber)) === n);
    if (!h?.text) throw new Error(`${c} ${n} not found`);
    out.push({ c, n, en: tidy(h.text) });
  }
}
fs.writeFileSync(file('src/data/sheikh-hadith.json'), JSON.stringify({ source: 'hadith-api by fawazahmed0 (The Unlicense), English of sunnah.com; Sahih al-Bukhari and Sahih Muslim', reviewed: 'The 40 below: Ustadh Issah, 12 November 2026', hadith: out }, null, 1) + '\n');
console.log(out.length, 'hadith written');
