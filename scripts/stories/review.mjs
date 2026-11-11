// Writes docs/story-time-level1.md: every story with its moral, question and hadith or ayah, for teachers to check.
import fs from 'node:fs';
import { STORIES } from '../../src/lib/stories/level1.mjs';
const Q = JSON.parse(fs.readFileSync(new URL('../../src/data/stories-quran.json', import.meta.url)));
const out = ['# Story Time · Level 1 (ages 4–8): teacher review sheet', '',
  "Twenty-two original picture stories written for Ta'aleem. The characters (Yusuf, Maryam, Adam, Mama, Baba,",
  'Grandpa Musa, Teta, Bilal, Zara, Omar, Ustadha Huda, Aunty Salma, Uncle Sami) are made up; no Prophet or Companion is ever shown.',
  'Each story ends with one hadith or ayah. The English of each hadith is a simple meaning for young children; please check it.', '',
  '| # | Story | Manner | Hadith or ayah (Arabic) | Meaning given to children | Source | Checked by |', '|---|---|---|---|---|---|---|'];
STORIES.forEach((s, i) => {
  const ar = s.hadith ? s.hadith.ar : Q[`${s.quran.s}:${s.quran.a}:${s.quran.w[0]}-${s.quran.w[1]}`].ar;
  const src = s.hadith ? s.hadith.src : `Qurʾan ${s.quran.s}:${s.quran.a} (Tanzil text)`;
  out.push(`| ${i + 1} | ${s.title} | ${s.theme} | ${ar} | ${(s.hadith ?? s.quran).en} | ${src} | |`);
});
out.push('', '## The stories, page by page', '');
STORIES.forEach((s, i) => {
  out.push(`### ${i + 1}. ${s.title} (${s.theme})`, '');
  s.pages.forEach((p, k) => { out.push(`${k + 1}. ${p.t}`); if (p.tap) out.push(`   - *Tap:* ${p.tap.prompt} → ${p.tap.say}`); });
  out.push('', `**Question:** ${s.ask.q} (${s.ask.options.map((o, j) => (j === s.ask.answer ? `**${o}**` : o)).join(' / ')})`, '');
});
fs.writeFileSync(new URL('../../docs/story-time-level1.md', import.meta.url), out.join('\n') + '\n');
console.log('wrote', STORIES.length, 'stories,', STORIES.reduce((n, s) => n + s.pages.length, 0), 'pages');
