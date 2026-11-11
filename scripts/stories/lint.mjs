// Checks the Reading Library and Story Time for writing that sounds machine-made, using the patterns in Wikipedia's
// "Signs of AI writing" guide (words to watch, negative parallelisms, the rule of three, summary endings,
// em dashes, sermon-like morals) and for reading level (sentence length by level).
// It also checks that every library book has all its parts (the shape is in src/lib/library/added.mjs).
//   node scripts/stories/lint.mjs          → lists every problem; exits 1 if there are any
import fs from 'node:fs';
import { ADDED } from '../../src/lib/library/added.mjs';
import { prop } from '../../src/lib/stories/art.mjs';
import { LEVEL1 } from '../../src/lib/library/level1.mjs';
import { LEVEL2 } from '../../src/lib/library/level2.mjs';
import { TAWHEED } from '../../src/lib/library/tawheed.mjs';
import { PROPHETS } from '../../src/lib/library/prophets.mjs';
import { STORIES } from '../../src/lib/stories/level1.mjs';

const WORDS = ['delve', 'tapestry', 'testament', 'pivotal', 'crucial', 'vibrant', 'foster', 'enhance', 'underscore', 'showcase', 'intricate',
  'realm', 'embark', 'nestled', 'bustling', 'profound', 'invaluable', 'unwavering', 'resonate', 'beacon', 'meticulous', 'seamless', 'navigate',
  'landscape', 'multifaceted', 'transformative', 'harness', 'elevate', 'empower', 'journey of', 'symphony', 'kaleidoscope', 'boundless',
  'enchanting', 'captivating', 'breathtaking', 'treasure trove', 'heartwarming', 'ever-', 'whimsical', 'tirelessly', 'steadfast', 'indelible'];
const PHRASES = [
  [/\bnot (?:just|only|merely)\b/i, 'negative parallelism ("not just / not only")'],
  [/\b(?:isn'?t|is not|wasn'?t|was not) (?:just|only|about)\b/i, 'negative parallelism ("is not just / about")'],
  [/\bmore than just\b/i, '"more than just"'],
  [/\bthis is called\b/i, 'textbook tag ("This is called …")'],
  [/\bis contagious\b/i, 'cliché ("… is contagious")'],
  [/\b(?:in the end|in conclusion|in summary|overall),/i, 'summary ending'],
  [/^remember,/i, 'sermon opening ("Remember, …")'],
  [/\b(?:it'?s|it is) important to\b/i, '"it is important to"'],
  [/\blearned (?:an? )?(?:important|valuable) lesson\b/i, 'stated moral ("learned an important lesson")'],
  [/\bthe (?:true|real) (?:meaning|treasure|strength|secret)\b/i, 'stated moral ("the true meaning / real treasure")'],
  [/\bfrom that day (?:on|forward)\b/i, 'formula ending ("from that day on")'],
  [/\b(?:heart|chest) (?:swelled|swell|bloomed)\b/i, 'stock emotion ("heart swelled")'],
  [/\bcouldn'?t help but\b/i, 'stock phrase ("couldn\'t help but")'],
  [/\blittle did (?:he|she|they)\b/i, 'stock phrase ("little did")'],
  [/\ba sense of\b/i, '"a sense of"'],
  [/\b(?:moreover|furthermore|additionally)\b/i, 'essay transition'],
  [/\bas if (?:to say|saying) thank you\b/i, 'stock phrase'],
  [/—/, 'em dash (use a comma or a full stop)'],
];
const LIMIT = { 1: 12, 2: 18 };   // longest sentence, in words, by level

const problems = [];
const say = (book, where, msg) => problems.push(`${book.id} ${where}: ${msg}`);
function check(book, level) {
  const texts = [];
  book.pages.forEach((p, i) => { texts.push([`p${i + 1}`, p.t]); if (p.tap) texts.push([`p${i + 1} tap`, p.tap.say]); });
  if (book.ask) texts.push(['ask', book.ask.why]);
  if (book.choose) texts.push(['choose', book.choose.why]);
  let threes = 0;
  const lens = [];
  for (const [where, t] of texts) {
    for (const w of WORDS) if (new RegExp(`\\b${w}`, 'i').test(t)) say(book, where, `AI word "${w}"`);
    for (const [re, msg] of PHRASES) if (re.test(t)) say(book, where, msg);
    threes += (t.match(/\b\w+, \w+(?: \w+)?,? and \w+/g) ?? []).length;
    for (const s of t.split(/(?<=[.!?…])\s+/)) lens.push(s.split(/\s+/).filter(Boolean).length);
    // the longest sentence: a sentence can also end inside a quote (“… safe.” Then …)
    for (const s of t.split(/(?<=[.!?…]”?)\s+/)) {
      const n = s.split(/\s+/).filter(Boolean).length;
      if (level && n > LIMIT[level]) say(book, where, `sentence of ${n} words is long for Level ${level}: "${s.slice(0, 60)}…"`);
    }
  }
  if (threes > 2) say(book, 'all', `${threes} lists of three (the rule of three): vary them`);
  if (lens.length > 8) {
    const m = lens.reduce((a, b) => a + b, 0) / lens.length, sd = Math.sqrt(lens.reduce((a, b) => a + (b - m) ** 2, 0) / lens.length);
    if (sd < (level === 1 ? 1.5 : 2)) say(book, 'all', `every sentence is about the same length (${m.toFixed(1)} ± ${sd.toFixed(1)} words): mix short and long`);
  }
}
// the parts every library book needs
function shape(b, level) {
  const bad = (m) => say(b, 'shape', m);
  for (const k of ['id', 'title', 'theme', 'color']) if (typeof b[k] !== 'string' || !b[k]) bad(`missing "${k}"`);
  if (!/^[a-z0-9][a-z0-9-]{1,30}$/.test(b.id ?? '')) bad('id must be short, lower case, letters, numbers and dashes');
  if (!Array.isArray(b.pages) || b.pages.length < 4) bad('needs at least 4 pages');
  (b.pages ?? []).forEach((p, i) => {
    if (!p.t) bad(`page ${i + 1} has no words (t)`);
    if (!p.art && !p.img) bad(`page ${i + 1} needs art or img`);
    if (p.img && !fs.existsSync(new URL(`../../public/${p.img}`, import.meta.url))) bad(`page ${i + 1}: picture public/${p.img} is not there`);
    if (p.tap && !p.img) { const ids = [...(p.art.actors ?? []), ...(p.art.props ?? [])].map((x) => x.id); if (!ids.includes(p.tap.id)) bad(`page ${i + 1}: nothing in the picture has id "${p.tap.id}"`); }
    if (p.tap && p.img) bad(`page ${i + 1}: a tap needs drawn art, not a picture file`);
  });
  if (!Array.isArray(b.words) || b.words.length < 3) bad('needs at least 3 words');
  for (const w of b.words ?? []) {
    if (level === 1 && (!w.p || !prop({ p: w.p, x: 0, y: 0 }))) bad(`word "${w.w}" needs p: a picture name from art.mjs`);
    if (level === 2 && !w.m) bad(`word "${w.w}" needs m: its meaning`);
  }
  if (!Array.isArray(b.quiz) || !b.quiz.length) bad('needs a quiz');
  for (const q of b.quiz ?? []) if (!q.q || !q.a || !Array.isArray(q.w) || q.w.length < 1) bad(`quiz "${q.q}" needs q, a and w (wrong answers)`);
  const c = b.choose;
  if (!c?.q || !Array.isArray(c.options) || !(c.answer >= 0 && c.answer < c.options.length) || !c.why) bad('choose needs q, options, answer (a number) and why');
  if (!b.hadith && !b.quran) bad('needs a hadith or an ayah');
  if (b.hadith && !(b.hadith.ar && b.hadith.en && b.hadith.src)) bad('hadith needs ar, en and src');
  if (b.quran && !(b.quran.s && b.quran.a && b.quran.w?.length === 2 && b.quran.en)) bad('quran needs s, a, w: [first, last] and en');
}
for (const b of LEVEL1) { check(b, 1); shape(b, 1); }
for (const b of LEVEL2) { check(b, 2); shape(b, 2); }
for (const b of ADDED) { if (![1, 2].includes(b.level)) say(b, 'shape', 'level must be 1 or 2'); check(b, b.level); shape(b, b.level); }
for (const b of TAWHEED) { check(b, b.level); shape(b, b.level); }
for (const b of PROPHETS) { check(b, b.level); shape(b, b.level); if (!b.ayat) say(b, 'shape', 'needs ayat: the ayat the story is told from'); }
for (const b of STORIES) check(b, 0);
const ids = [...LEVEL1, ...LEVEL2, ...ADDED, ...TAWHEED, ...PROPHETS].map((b) => b.id);
const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
if (dup.length) problems.push('duplicate ids: ' + dup.join(', '));
console.log(`${LEVEL1.length} Level 1 books, ${LEVEL2.length} Level 2 books, ${ADDED.length} added books, ${TAWHEED.length} Tawheed books, ${PROPHETS.length} Stories of the Prophets, ${STORIES.length} Story Time stories checked.`);
console.log(problems.length ? problems.join('\n') : 'No problems found.');
process.exit(problems.length ? 1 : 0);
