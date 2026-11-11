// Writes docs/reading-library-review.md: every Reading Library book with its manner, games and hadith or ayah, for teachers to check.
//   node scripts/stories/quran.mjs && node scripts/stories/review-library.mjs
import fs from 'node:fs';
import { LEVEL1 } from '../../src/lib/library/level1.mjs';
import { LEVEL2 } from '../../src/lib/library/level2.mjs';
import { TAWHEED_L1, TAWHEED_L2 } from '../../src/lib/library/tawheed.mjs';
import { ADDED } from '../../src/lib/library/added.mjs';
import { PROPHETS } from '../../src/lib/library/prophets.mjs';
const Q = JSON.parse(fs.readFileSync(new URL('../../src/data/stories-quran.json', import.meta.url)));
const out = ['# Reading Library · teacher review sheet', '',
  "Original books written for Ta'aleem: the First Readers (Level 1, ages 4–6), the Adventure Readers (Level 2, ages 7–8),",
  'the Tawheed shelf and the Stories of the Prophets (Levels 2 and 3). The children and families are made up. No Prophet or',
  'Companion is ever shown: the Stories of the Prophets show only places and things, and give the Prophets no words beyond the Qurʾan.',
  'Each book ends with one hadith or ayah. The English is a simple meaning for young readers; please check it and sign the last column.',
  'The Stories of the Prophets are marked **For Ustadh Issah**: please check each one against the ayat named under its title.', ''];
const shelves = [['Level 1 · First Readers', [...LEVEL1, ...ADDED.filter((b) => b.level === 1)]], ['Level 2 · Adventure Readers', [...LEVEL2, ...ADDED.filter((b) => b.level === 2)]], ['Tawheed · Level 1', TAWHEED_L1], ['Tawheed · Level 2', TAWHEED_L2], ['Stories of the Prophets · Levels 2 and 3', PROPHETS]];
for (const [name, books] of shelves) {
  out.push(`## ${name}`, '', '| # | Book | Manner | Hadith or ayah (Arabic) | Meaning given to children | Source | Checked by |', '|---|---|---|---|---|---|---|');
  books.forEach((b, i) => {
    const ar = b.hadith ? b.hadith.ar : Q[`${b.quran.s}:${b.quran.a}:${b.quran.w[0]}-${b.quran.w[1]}`].ar;
    const src = b.hadith ? b.hadith.src : `Qurʾan ${b.quran.s}:${b.quran.a} (Tanzil text)`;
    out.push(`| ${i + 1} | ${b.title} | ${b.theme} | ${ar} | ${(b.hadith ?? b.quran).en} | ${src} | ${b.ayat ? '**For Ustadh Issah**' : ''} |`);
  });
  out.push('');
}
out.push('## The books, page by page', '');
for (const [name, books] of shelves) books.forEach((b, i) => {
  out.push(`### ${name.split(' ·')[0]}, ${i + 1}. ${b.title} (${b.theme})`, '');
  if (b.ayat) out.push(`*Told from the Qurʾan: ${b.ayat}. For Ustadh Issah to check: every word given to a Prophet or to Allah is a faithful simple meaning of these ayat, and nothing is added.*`, '');
  b.pages.forEach((p, k) => { out.push(`${k + 1}. ${p.t}`); if (p.tap) out.push(`   - *Tap:* ${p.tap.prompt} → ${p.tap.say}`); });
  out.push('', `**Words:** ${b.words.map((w) => (w.m ? `${w.w} (${w.m})` : w.w)).join(', ')}`);
  out.push(`**Quiz:** ${b.quiz.map((q) => `${q.q} **${q.a}**`).join(' · ')}`);
  out.push(`**What would you do?** ${b.choose.q} (${b.choose.options.map((o, j) => (j === b.choose.answer ? `**${o}**` : o)).join(' / ')})`, '');
});
fs.writeFileSync(new URL('../../docs/reading-library-review.md', import.meta.url), out.join('\n') + '\n');
console.log('wrote', shelves.reduce((n, [, b]) => n + b.length, 0), 'books');
