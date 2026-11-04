// Writes docs/reading-library-review.md: every Reading Library book with its manner, games and hadith or ayah, for teachers to check.
//   node scripts/stories/quran.mjs && node scripts/stories/review-library.mjs
import fs from 'node:fs';
import { LEVEL1 } from '../../src/lib/library/level1.mjs';
import { LEVEL2 } from '../../src/lib/library/level2.mjs';
import { ADDED } from '../../src/lib/library/added.mjs';
const Q = JSON.parse(fs.readFileSync(new URL('../../src/data/stories-quran.json', import.meta.url)));
const out = ['# Reading Library · teacher review sheet', '',
  'Forty original books written for Al-Huda Islamic Weekend School: twenty First Readers (Level 1, ages 4–6, six pages) and twenty',
  'Adventure Readers (Level 2, ages 7–8, eight pages). The characters are made up; no Prophet or Companion is ever shown.',
  'Each book ends with one hadith or ayah. The English is a simple meaning for young readers; please check it and sign the last column.', ''];
const shelves = [['Level 1 · First Readers', [...LEVEL1, ...ADDED.filter((b) => b.level === 1)]], ['Level 2 · Adventure Readers', [...LEVEL2, ...ADDED.filter((b) => b.level === 2)]]];
for (const [name, books] of shelves) {
  out.push(`## ${name}`, '', '| # | Book | Manner | Hadith or ayah (Arabic) | Meaning given to children | Source | Checked by |', '|---|---|---|---|---|---|---|');
  books.forEach((b, i) => {
    const ar = b.hadith ? b.hadith.ar : Q[`${b.quran.s}:${b.quran.a}:${b.quran.w[0]}-${b.quran.w[1]}`].ar;
    const src = b.hadith ? b.hadith.src : `Qurʾan ${b.quran.s}:${b.quran.a} (Tanzil text)`;
    out.push(`| ${i + 1} | ${b.title} | ${b.theme} | ${ar} | ${(b.hadith ?? b.quran).en} | ${src} | |`);
  });
  out.push('');
}
out.push('## The books, page by page', '');
for (const [name, books] of shelves) books.forEach((b, i) => {
  out.push(`### ${name.split(' ·')[0]}, ${i + 1}. ${b.title} (${b.theme})`, '');
  b.pages.forEach((p, k) => { out.push(`${k + 1}. ${p.t}`); if (p.tap) out.push(`   - *Tap:* ${p.tap.prompt} → ${p.tap.say}`); });
  out.push('', `**Words:** ${b.words.map((w) => (w.m ? `${w.w} (${w.m})` : w.w)).join(', ')}`);
  out.push(`**Quiz:** ${b.quiz.map((q) => `${q.q} **${q.a}**`).join(' · ')}`);
  out.push(`**What would you do?** ${b.choose.q} (${b.choose.options.map((o, j) => (j === b.choose.answer ? `**${o}**` : o)).join(' / ')})`, '');
});
fs.writeFileSync(new URL('../../docs/reading-library-review.md', import.meta.url), out.join('\n') + '\n');
console.log('wrote', shelves.reduce((n, [, b]) => n + b.length, 0), 'books');
