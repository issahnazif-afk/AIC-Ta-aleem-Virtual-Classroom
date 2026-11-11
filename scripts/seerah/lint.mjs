// Checks that every historical passage used by Seerah Quest exists in the source register,
// that episode citations match the source register, and that reported material is never
// narrated as established history. This is a consistency check, not a hadith-authentication tool.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const episodesText = fs.readFileSync(path.join(ROOT, 'src/lib/seerah/episodes.mjs'), 'utf8');
const sourceData = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/seerah/sources.json'), 'utf8'));
const passages = new Map(sourceData.passages.map((p) => [p.id, p]));
const errors = [];
const warnings = [];

const episodeBlocks = [...episodesText.matchAll(/\{\s*n:\s*(\d+),\s*key:\s*'([^']+)'([\s\S]*?)(?=\n\s*\},?\s*\n\s*\{|\n\s*\},?\s*\n\];)/g)];
if (!episodeBlocks.length) errors.push('No episode definitions could be read.');

const used = new Set();
for (const [id, p] of passages) {
  if (!id || !p.ar || !p.en || !p.vol || !p.page || !p.class || !p.review) {
    errors.push(`Source passage "${id || '(missing id)'}" is missing required metadata.`);
  }
  if (!['established', 'reported', 'excluded'].includes(p.class)) {
    errors.push(`Source passage "${id}" has unknown class "${p.class}".`);
  }
}
for (const match of episodesText.matchAll(/(?:narrate|note|quote|order|choice|quiz|route|journey)[\s\S]{0,220}?ids:\s*\[([^\]]*)\]/g)) {
  for (const id of match[1].matchAll(/'([^']+)'/g)) used.add(id[1]);
}
for (const match of episodesText.matchAll(/src:\s*'([^']+)'/g)) used.add(match[1]);
for (const match of episodesText.matchAll(/src:\s*\[([^\]]*)\]/g)) {
  for (const id of match[1].matchAll(/'([^']+)'/g)) used.add(id[1]);
}

for (const id of used) {
  const p = passages.get(id);
  if (!p) errors.push(`Episode references missing source passage "${id}".`);
  else if (p.class === 'excluded') errors.push(`Excluded source passage "${id}" is referenced by an episode.`);
}
for (const match of episodesText.matchAll(/do:\s*'narrate',\s*ids:\s*\[([^\]]*)\]/g)) {
  for (const id of match[1].matchAll(/'([^']+)'/g)) {
    const p = passages.get(id[1]);
    if (p && p.class !== 'established') errors.push(`Narration "${id[1]}" is classified "${p.class}", not "established".`);
  }
}
for (const p of passages.values()) {
  if (p.review !== 'reviewed') warnings.push(`${p.id}: editorial review status is "${p.review}".`);
}
// The game layer (scrolls, climbing challenges, the archive): a scroll only holds a passage the student has already
// read earlier in the same episode, and the game's own English passes the school's writing rules.
const { EPISODES, stepIds } = await import('../../src/lib/seerah/episodes.mjs');
const game = await import('../../src/lib/seerah/game.mjs');
const { lintText } = await import('../books/writing.mjs');
for (const ep of EPISODES) {
  const read = new Set();
  const stages = [];
  for (const s of ep.steps) {
    for (const id of stepIds(s)) read.add(id);
    if (s.do === 'stage') { if (!game.STAGES[s.id]) errors.push(`Episode ${ep.n}: unknown stage "${s.id}".`); stages.push(s.id); }
    const scrolls = s.do === 'scrolls' ? s.items : ['parkour', 'smash', 'vault'].includes(s.do) ? s.scrolls ?? [] : [];
    for (const x of scrolls) if (!read.has(x.src)) errors.push(`Episode ${ep.n}: the scroll "${x.src}" comes before the passage is read in the story.`);
    // a lantern record opens a passage about that person; a tree, a match or an order only uses names and events already read
    for (const x of s.do === 'lanterns' ? s.people : []) { const p = passages.get(x.src); if (!p) errors.push(`Episode ${ep.n}: lantern "${x.name}" has no passage.`); }
    for (const id of s.do === 'tree' ? s.srcs : s.do === 'match' || s.do === 'sort' ? [s.src] : []) if (!read.has(id)) errors.push(`Episode ${ep.n}: the ${s.do} uses "${id}" before it is read.`);
    if (s.do === 'classify') for (const id of s.ids) if (!passages.get(id)) errors.push(`Episode ${ep.n}: classify uses a missing passage "${id}".`);
    // the game's own English (instructions, practice scenarios) passes the writing rules
    const own = ['stage', 'scrolls', 'parkour', 'archive', 'guide', 'smash', 'vault', 'carry', 'build', 'lanterns', 'tree', 'match', 'relay', 'ayahorder', 'recite', 'cavewatch', 'spell', 'sail', 'sort', 'share', 'hold'].includes(s.do) ? [s.title, s.text, s.objective, s.objective2, s.done, s.q, s.meaning, ...(s.items ?? []).map((x) => x[0])]
      : s.do === 'scenario' ? [s.done, ...s.cases.flatMap((c) => [c.q, c.why, ...c.options])] : s.do === 'classify' ? [s.title, s.done] : [];
    for (const t of own.filter(Boolean)) for (const p of lintText(t, 3)) errors.push(`Episode ${ep.n} ${s.do}: ${p} in "${t.slice(0, 50)}…"`);
  }
  if (stages.join('') !== 'ABCDEF') errors.push(`Episode ${ep.n}: the stages run ${stages.join('')}, not A to F in order.`);
}
for (const t of [...Object.values(game.TEXT), ...Object.values(game.MODES).map((m) => m.text), ...game.BADGES.map((b) => b.how), ...Object.values(game.STAGES)]) {
  for (const p of lintText(t, 3)) errors.push(`Game text: ${p} in "${t.slice(0, 50)}…"`);
}
const episodeCount = (episodesText.match(/\n\s*n:\s*\d+,\s*key:/g) || []).length;
console.log(`Seerah source-integrity check: ${episodeCount} episode(s), ${passages.size} registered passage(s), ${used.size} referenced passage(s).`);
if (warnings.length) {
  console.warn(`\n${warnings.length} passage(s) still require editorial review:`);
  for (const w of warnings) console.warn(`  - ${w}`);
}
if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exitCode = 1;
} else {
  console.log('\nNo source-reference or classification errors found.');
  console.log('Reminder: this automated check does not authenticate chains, verify translations, or replace qualified scholarly review.');
}
