// Ustadh Hakim's lines for the VoxCPM2 recorder (scripts/voice/voxcpm_lines.py):
//   node scripts/voice/hakim-list.mjs   → scripts/voice/hakim.json  [{ key, parts: [{ text } | { q }] }]
// The Qur'an words in a line (QURAN_IN_LINES in public/adventure/src/content.js) are left out of the recording
// and played from the reciter instead. References in brackets are shown, not spoken.
import { writeFileSync } from 'node:fs';
import { hakimLines, QURAN_IN_LINES } from '../../public/adventure/src/content.js';
import { forVoice } from './voxcpm-say.mjs';

const out = [];
for (const [key, line] of Object.entries(hakimLines())) {
  const qs = QURAN_IN_LINES[key];
  const pieces = qs ? line.split(qs.say) : [line];
  if (qs && pieces.length !== 2) throw new Error(`${key}: the Qur'an words "${qs.say}" are not in the line once`);
  const parts = [];
  pieces.forEach((p, i) => {
    if (i) parts.push({ q: qs.q });
    const text = forVoice(p);
    if (/[\p{L}\p{N}]/u.test(text)) parts.push({ text });
  });
  out.push({ key, parts });
}
writeFileSync(new URL('./hakim.json', import.meta.url), JSON.stringify(out, null, 1));
console.log(`${out.length} lines, ${out.filter((l) => l.parts.some((p) => p.q)).length} with the reciter → scripts/voice/hakim.json`);
