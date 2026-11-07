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
