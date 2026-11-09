// Checks the Al-Huda Books (src/lib/books/) before they reach the children:
//   1. the shape of every book and page (docs/al-huda-books.md), and that every picture is there
//   2. reading level: the longest sentence for each level
//   3. writing that sounds machine-made, following Wikipedia's "Signs of AI writing" guide
//      (WP:AISIGNS): AI vocabulary, puffed-up significance, "-ing" tails that add shallow analysis, vague
//      "associated with" links, weasel words, the "despite these challenges" formula, avoiding plain "is",
//      negative parallelisms ("not just … but", "it's not X, it's Y"), the rule of three, summary endings,
//      chatbot phrases ("I hope this helps"), hedging ("it is important to note"), title-case headings,
//      emoji, Markdown, curly quotes, em dashes, placeholders, and sentences that are all the same length.
// Then it writes docs/al-huda-books-review.md: every book's words, page by page, for a teacher to check.
//   node scripts/books/lint.mjs              all books
//   node scripts/books/lint.mjs dua-activity one book (no review file)
import fs from 'node:fs';
const only = process.argv[2];
// one book: load only its own file, so a half-written book elsewhere does not stop the check
const BOOKS = only ? [(await import(`../../src/lib/books/${only}.mjs`)).default] : (await import('../../src/lib/books/index.mjs')).BOOKS;
const list = BOOKS;

// ── AI writing (Wikipedia: Signs of AI writing) ──
// always flagged: the "AI vocabulary" lists of each era, and the stock words of AI fiction
const WORDS = ['additionally', 'align with', 'aligns with', 'boasts', 'bolstered', 'crucial', 'deep dive', 'delve', 'delves', 'emphasizing', 'emphasising',
  'enduring', 'enhance', 'enhances', 'enhancing', 'foster', 'fosters', 'fostering', 'garner', 'highlights', 'highlighting', 'highlighted', 'interplay',
  'intricate', 'intricacies', 'meticulous', 'meticulously', 'pivotal', 'robust', 'showcase', 'showcases', 'showcasing', 'tapestry', 'testament',
  'underscore', 'underscores', 'underscoring', 'vibrant', 'leverage', 'multifaceted', 'prioritize', 'prioritise', 'universally', 'dependable',
  'realm', 'embark', 'embarked', 'nestled', 'bustling', 'invaluable', 'unwavering', 'resonate', 'resonates', 'beacon', 'seamless', 'seamlessly',
  'transformative', 'harness', 'elevate', 'empower', 'empowering', 'symphony', 'kaleidoscope', 'boundless', 'enchanting', 'captivating',
  'breathtaking', 'treasure trove', 'heartwarming', 'whimsical', 'tirelessly', 'indelible', 'groundbreaking', 'renowned', 'diverse array',
  'in the heart of', 'natural beauty', 'commitment to', 'exemplifies', 'navigate', 'navigating', 'landscape', 'paramount', 'profound', 'profoundly'];
// common words the guide lists for newer models: flagged only when a chapter leans on them
const SOFT = ['challenge', 'clearer', 'echoed', 'matters', 'practical', 'quietly', 'steady', 'key', 'valuable', 'rich', 'journey', 'truly', 'deeply', 'vital'];
const PHRASES = [
  // undue emphasis on significance and legacy
  [/\b(?:stands|serves|functions|operates) as\b/i, 'avoids plain "is" ("serves as / stands as")'],
  [/\bis a (?:testament|reminder)\b/i, 'puffery ("is a testament / reminder")'],
  [/\b(?:a )?(?:crucial|pivotal|vital|significant|key|important) (?:role|moment)\b/i, 'puffery ("a vital role / pivotal moment")'],
  [/\b(?:setting the stage|marking (?:a|the)|shaping the|represents a shift|key turning point|focal point|deeply rooted|reflects (?:a )?broader|lasting legacy|enduring legacy)\b/i, 'puffery about significance'],
  [/\b(?:symboli[sz]es|symboli[sz]ing)\b/i, 'shallow analysis ("symbolizing")'],
  // superficial "-ing" tails
  [/,\s(?:highlighting|underscoring|emphasi[sz]ing|ensuring|reflecting|contributing to|cultivating|fostering|encompassing|showcasing|demonstrating|illustrating)\b/i, '"-ing" tail adding shallow analysis'],
  [/\bvaluable (?:insights?|lessons?)\b/i, 'stock phrase ("valuable lesson / insights")'],
  // vague connection, weasel words, challenges formula
  [/\bin (?:connection|association) with\b/i, 'vague connection ("in connection with")'],
  [/\b(?:experts|scholars|observers|researchers|studies|many people) (?:say|argue|agree|believe|suggest|show|have noted)\b/i, 'vague attribution (weasel words)'],
  [/\bdespite (?:these|its|their|the) challenges\b|\bfaces? (?:several |many |numerous )?challenges\b|\bfuture (?:outlook|prospects)\b/i, '"despite these challenges" formula'],
  // negative parallelisms
  [/\bnot (?:just|only|merely|simply)\b/i, 'negative parallelism ("not just / not only")'],
  [/\b(?:isn'?t|is not|wasn'?t|was not|aren'?t|are not) (?:just|only|merely|about)\b/i, 'negative parallelism ("is not just / about")'],
  [/\b(?:it'?s|it is|this is|that'?s|that is) not\b[^.!?]{1,50}[,;:]\s*(?:it'?s|it is|but)\b/i, 'negative parallelism ("it\'s not X, it\'s Y")'],
  [/\bno [a-z]+, no [a-z]+, (?:just|only)\b/i, 'negative parallelism ("no X, no Y, just Z")'],
  [/\bmore than just\b/i, '"more than just"'],
  // summaries, sermons, hedges, chatbot talk
  [/\b(?:in the end|in conclusion|in summary|to sum up|overall|ultimately),/i, 'summary ending'],
  [/^remember,/i, 'sermon opening ("Remember, …")'],
  [/\b(?:it'?s|it is) (?:important|worth|essential|crucial) to (?:note|remember|mention|understand)\b|\bworth (?:noting|mentioning)\b/i, 'hedging ("it is important to note")'],
  [/\b(?:it'?s|it is) important to\b/i, '"it is important to"'],
  [/\b(?:i hope this helps|certainly!|of course!|let me know|would you like|here is a|here are some|great question)\b/i, 'chatbot talk'],
  [/\bbased on (?:the )?available\b|\bnot widely (?:documented|available|known)\b/i, 'hedging about sources'],
  [/\blearned (?:an? )?(?:important|valuable) lesson\b/i, 'stated moral ("learned an important lesson")'],
  [/\bthe (?:true|real) (?:meaning|treasure|strength|secret|power)\b|\bthe power of\b/i, 'stated moral ("the true meaning / the power of")'],
  [/\bfrom that day (?:on|forward)\b|\bever since that day\b/i, 'formula ending ("from that day on")'],
  [/\b(?:heart|chest) (?:swelled|swell|bloomed|soared)\b/i, 'stock emotion ("heart swelled")'],
  [/\bcouldn'?t help but\b|\blittle did (?:he|she|they)\b|\ba sense of\b|\bin today'?s (?:world|fast-paced)\b|\bfast-paced\b/i, 'stock phrase'],
  [/\b(?:moreover|furthermore|consequently|notably),/i, 'essay transition'],
  [/\bjourney of\b|\bon a journey\b/i, 'stock metaphor ("a journey of")'],
  // typography and markup
  [/—/, 'em dash (use a comma, a colon or a full stop)'],
  [/[“”‘’]/, 'curly quotes: use straight quotes (" and \')'],
  [/\*\*|__|^#+\s|^---|```|\[[^\]]+\]\([^)]+\)/m, 'Markdown'],
  [/\p{Extended_Pictographic}/u, 'emoji in the text'],
  [/\b(?:TODO|lorem ipsum|insert [a-z ]+ here|\[insert|xx-xx)\b/i, 'placeholder text'],
];
const LIMIT = { 1: 12, 2: 18, 3: 26, 4: 32 };   // longest sentence, in words
const SMALL = new Set(['a', 'an', 'the', 'and', 'or', 'of', 'in', 'on', 'to', 'for', 'with', 'at', 'by', 'from', 'is', 'as', 'but', 'his', 'her', 'its', 'our', 'your', 'my', 'we', 'he', 'she']);

const problems = [];
const say = (b, where, msg) => problems.push(`${b.id} ${where}: ${msg}`);

// the English text of a page that the school writes (quotations of hadith, ayat and du'a meanings are left as translated)
function proseOf(pg) {
  const out = [];
  const add = (t) => { if (typeof t === 'string' && t.trim()) out.push(t); };
  add(pg.say); add(pg.prompt); add(pg.cap);
  for (const t of pg.text ?? []) { if (typeof t === 'string') add(t); else if (t.note) add(t.note.t); else if (t.list) t.list.forEach(add); }
  for (const it of pg.items ?? []) if (typeof it === 'object' && !Array.isArray(it)) { add(it.q); add(it.why); add(it.t?.replace('___', 'something')); }
  return out;
}
const headingsOf = (pg) => [pg.h].filter(Boolean);

function titleCase(h) {
  const ws = h.replace(/[^A-Za-z' ]/g, ' ').split(/\s+/).filter(Boolean);
  if (ws.length < 4) return false;
  const big = ws.filter((w, i) => i > 0 && !SMALL.has(w.toLowerCase()));
  return big.length >= 3 && big.every((w) => /^[A-Z]/.test(w));
}

function checkWriting(b) {
  b.chapters.forEach((c, ci) => {
    let threes = 0, soft = 0; const lens = [];
    for (const h of [c.title, ...c.pages.flatMap(headingsOf)]) {
      if (titleCase(h)) say(b, `ch${ci + 1}`, `heading in Title Case: "${h}" (use sentence case)`);
      if (/\p{Extended_Pictographic}/u.test(h)) say(b, `ch${ci + 1}`, `emoji in heading "${h}"`);
    }
    c.pages.forEach((pg, pi) => {
      const where = `ch${ci + 1} p${pi + 1}`;
      for (const t of proseOf(pg)) {
        for (const w of WORDS) if (new RegExp(`\\b${w}\\b`, 'i').test(t)) say(b, where, `AI word "${w}": "${t.slice(0, 70)}…"`);
        for (const w of SOFT) soft += (t.match(new RegExp(`\\b${w}\\b`, 'gi')) ?? []).length;
        for (const [re, msg] of PHRASES) if (re.test(t)) say(b, where, `${msg}: "${t.slice(0, 80)}…"`);
        threes += (t.match(/\b[\w'-]+(?: [\w'-]+){0,2}, [\w'-]+(?: [\w'-]+){0,2},? and [\w'-]+/g) ?? []).length;
        for (const s of t.split(/(?<=[.!?…])\s+/)) {
          const n = s.split(/\s+/).filter(Boolean).length;
          if (n > 2) lens.push(n);
          if (n > LIMIT[b.level]) say(b, where, `sentence of ${n} words is long for Level ${b.level}: "${s.slice(0, 60)}…"`);
        }
      }
      // the meanings we quote still must not carry our own typography slips
      for (const t of [pg.en].filter(Boolean)) if (/[—“”]/.test(t)) say(b, where, 'em dash or curly quotes in a meaning');
    });
    const pages = c.pages.length;
    if (threes > Math.max(3, pages / 2)) say(b, `ch${ci + 1}`, `${threes} lists of three (the rule of three): vary them`);
    if (soft > Math.max(4, pages)) say(b, `ch${ci + 1}`, `leans on words the guide lists for newer AI models (challenge, practical, steady, key, journey…): ${soft} times`);
    if (lens.length > 12) {
      const m = lens.reduce((a, x) => a + x, 0) / lens.length, sd = Math.sqrt(lens.reduce((a, x) => a + (x - m) ** 2, 0) / lens.length);
      if (sd < (b.level <= 1 ? 1.5 : 2.5)) say(b, `ch${ci + 1}`, `every sentence is about the same length (${m.toFixed(1)} ± ${sd.toFixed(1)} words): mix short and long`);
    }
  });
}

// ── the shape of a book ──
const TYPES = {
  scan: (p) => (!p.img ? 'needs img' : !fs.existsSync(new URL(`../../public/${p.img}`, import.meta.url)) ? `picture public/${p.img} is not there` : null),
  read: (p) => (!p.text?.length ? 'needs text' : p.img && !fs.existsSync(new URL(`../../public/${p.img}`, import.meta.url)) ? `picture public/${p.img} is not there` : null),
  quiz: (p) => (!p.items?.length ? 'needs items' : p.items.find((q) => !q.q || !q.a || !Array.isArray(q.w) || !q.w.length) ? 'every question needs q, a and w (wrong answers)' : p.items.find((q) => q.w.includes(q.a)) ? 'a wrong answer is the same as the right one' : null),
  match: (p) => (!(p.pairs?.length >= 2) ? 'needs at least 2 pairs' : p.pairs.find((x) => x.length !== 2 || !x[0] || !x[1]) ? 'every pair needs two sides' : new Set(p.pairs.map((x) => x[1])).size !== p.pairs.length ? 'two pairs have the same right side' : null),
  order: (p) => (!(p.items?.length >= 3) ? 'needs at least 3 items' : null),
  gap: (p) => (!p.items?.length ? 'needs items' : p.items.find((x) => !x.t?.includes('___') || !x.a || !x.w?.length) ? 'every item needs t with ___, a and w' : null),
  sort: (p) => (!(p.groups?.length >= 2) || !p.items?.length ? 'needs groups and items' : p.items.find(([t, g]) => !t || !(g >= 0 && g < p.groups.length)) ? 'every item is [text, group number]' : null),
  find: (p) => (!(p.letters?.length >= 3) ? 'needs at least 3 letters' : null),
  write: (p) => (!p.prompt ? 'needs prompt' : null),
  dua: (p) => (!p.ar || !p.en ? 'needs ar and en' : null),
  hadith: (p) => (!p.en || !p.src ? 'needs en and src' : !/\d/.test(p.src) ? 'src needs the collection and number' : null),
  ayah: (p) => (!(p.s >= 1 && p.s <= 114 && p.a >= 1) || !p.en ? 'needs s, a and en' : null),
};
function checkShape(b) {
  const bad = (m) => say(b, 'shape', m);
  for (const k of ['id', 'title', 'ages', 'color', 'cover', 'about']) if (!b[k]) bad(`missing "${k}"`);
  if (![1, 2, 3, 4].includes(b.level)) bad('level must be 1 to 4');
  if (b.cover && !fs.existsSync(new URL(`../../public/${b.cover}`, import.meta.url))) bad(`cover public/${b.cover} is not there`);
  if (!b.chapters?.length) return bad('needs chapters');
  b.chapters.forEach((c, ci) => {
    if (!c.title) bad(`chapter ${ci + 1} has no title`);
    if (!c.pages?.length) return bad(`chapter ${ci + 1} has no pages`);
    c.pages.forEach((p, pi) => {
      const f = TYPES[p.type];
      if (!f) return bad(`ch${ci + 1} p${pi + 1}: unknown page type "${p.type}"`);
      const m = f(p); if (m) bad(`ch${ci + 1} p${pi + 1} (${p.type}): ${m}`);
    });
  });
}

for (const b of list) { checkShape(b); checkWriting(b); }
const ids = BOOKS.map((b) => b.id), dup = ids.filter((x, i) => ids.indexOf(x) !== i);
if (dup.length) problems.push('duplicate ids: ' + dup.join(', '));

// ── the review sheet for teachers ──
if (!only) {
  const md = ['# Al-Huda Books: review sheet', '',
    'Made by `node scripts/books/lint.mjs` from `src/lib/books/`. Every book, chapter by chapter, with each hadith, ayah and du\'a,',
    'for an Islamic Studies teacher to check before class. Items marked **check** need a teacher\'s eye in particular.', ''];
  for (const b of BOOKS) {
    md.push(`## ${b.title} (Level ${b.level}, ages ${b.ages})`, '', b.about, '');
    b.chapters.forEach((c, ci) => {
      md.push(`### ${ci + 1}. ${c.title}${c.test ? ' (test)' : ''}`, '');
      c.pages.forEach((p, pi) => {
        const n = `${pi + 1}.`;
        if (p.check) md.push(`- **check:** ${p.check}`);
        if (p.type === 'scan') md.push(`${n} Workbook page \`${p.img}\`${p.say ? `: ${p.say}` : ''}`);
        else if (p.type === 'read') md.push(`${n} ${p.h ? `*${p.h}.* ` : ''}${(p.text ?? []).map((t) => (typeof t === 'string' ? t : t.ar ?? t.note?.t ?? t.list?.join('; ') ?? (t.table ? '[table]' : ''))).join(' ')}`);
        else if (p.type === 'hadith') md.push(`${n} Hadith: ${p.ar ?? ''} "${p.en}" (${p.src})`);
        else if (p.type === 'ayah') md.push(`${n} Ayah ${p.s}:${p.a}: "${p.en}"`);
        else if (p.type === 'dua') md.push(`${n} Du'a${p.when ? ` (${p.when})` : ''}: ${p.ar} / ${p.tr ?? ''} / "${p.en}"${p.src ? ` (${p.src})` : ''}`);
        else if (p.type === 'quiz') md.push(`${n} Quiz: ${p.items.map((q) => `${q.q} **${q.a}**`).join(' · ')}`);
        else if (p.type === 'match') md.push(`${n} Match: ${p.pairs.map((x) => `${x[0]} = ${x[1]}`).join(' · ')}`);
        else if (p.type === 'order') md.push(`${n} Order: ${p.items.join(' → ')}`);
        else if (p.type === 'gap') md.push(`${n} Fill the gap: ${p.items.map((x) => x.t.replace('___', `**${x.a}**`)).join(' · ')}`);
        else if (p.type === 'sort') md.push(`${n} Sort into ${p.groups.join(' / ')}: ${p.items.map(([t, g]) => `${t} (${p.groups[g]})`).join(' · ')}`);
        else if (p.type === 'find') md.push(`${n} Listen and find: ${p.letters.join(' ')}`);
        else if (p.type === 'write') md.push(`${n} Write: ${p.prompt}`);
      });
      md.push('');
    });
  }
  fs.writeFileSync(new URL('../../docs/al-huda-books-review.md', import.meta.url), md.join('\n') + '\n');
}

const pages = list.reduce((n, b) => n + b.chapters.reduce((m, c) => m + c.pages.length, 0), 0);
console.log(`${list.length} Al-Huda books, ${list.reduce((n, b) => n + b.chapters.length, 0)} chapters, ${pages} pages checked.`);
console.log(problems.length ? problems.join('\n') : 'No problems found.');
process.exit(problems.length ? 1 : 0);
