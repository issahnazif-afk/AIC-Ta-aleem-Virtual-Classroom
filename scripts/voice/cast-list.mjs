// The lines the VoxCPM2 voices record (scripts/voice/voxcpm_lines.py), from scripts/voice/narration.json:
//   node scripts/voice/narration-list.mjs && node scripts/voice/cast-list.mjs
//   → scripts/voice/cast-sheikh.json   every sentence the Sheikh says (key = the narration clip key)
//   → scripts/voice/cast-grandpa.json  Grandpa Musa's words in the stories (key = castId of the words as spoken)
// The clips go to public/audio/cast/<who>/ (committed). The Sheikh's are played in place of the Kokoro clip
// (src/lib/narration.mjs, src/lib/sheikh-chat.mjs); Grandpa's are put into the story lines by make_narration.py.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spk } from '../../src/lib/sheikh-chat.mjs';
import { forVoice } from './voxcpm-say.mjs';

// the same id make_narration.py computes for a part (md5 of the words as spoken, first 12 hex)
export const castId = (spoken) => createHash('md5').update(spoken, 'utf8').digest('hex').slice(0, 12);

const lines = JSON.parse(readFileSync(new URL('./narration.json', import.meta.url), 'utf8'));
const sheikh = lines.filter((l) => l.reader === 'sheikh').map((l) => ({ key: l.key, parts: [{ text: forVoice(spk(l.text)) }] }));
const grandpa = new Map();
for (const l of lines) for (const [who, spoken, plain] of l.parts) if (who === 'grandpa' && plain) grandpa.set(castId(spoken), { key: castId(spoken), parts: [{ text: forVoice(plain) }] });

writeFileSync(new URL('./cast-sheikh.json', import.meta.url), JSON.stringify(sheikh, null, 1));
writeFileSync(new URL('./cast-grandpa.json', import.meta.url), JSON.stringify([...grandpa.values()], null, 1));
const words = (xs) => xs.reduce((n, x) => n + x.parts[0].text.split(/\s+/).length, 0);
console.log(`the Sheikh: ${sheikh.length} lines, ${words(sheikh)} words · Grandpa Musa: ${grandpa.size} lines, ${words([...grandpa.values()])} words`);
