// The Sheikh's Arabic phrases (praise and instructions, src/lib/phrases.mjs) in his VoxCPM2 voice.
// They are recorded on a developer's GPU (CI can't run the model), checked word by word with Whisper, and committed
// to scripts/voice/phrases/p-<file>.mp3. This copies them into public/audio/voice/ over the Piper clips that
// make_voice.py makes, and adds them to that folder's index.json. Run by `npm run data`, after make_voice.py in CI.
// A teacher's own recording (public/audio/sheikh/) or a Voice Studio recording still comes first.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const FROM = path.join(ROOT, 'scripts', 'voice', 'phrases');
const TO = path.join(ROOT, 'public', 'audio', 'voice');
const clips = fs.readdirSync(FROM).filter((f) => /^p-.+\.mp3$/.test(f));
fs.mkdirSync(TO, { recursive: true });
for (const f of clips) fs.copyFileSync(path.join(FROM, f), path.join(TO, f));
const idx = path.join(TO, 'index.json');
let made = [];
try { made = JSON.parse(fs.readFileSync(idx, 'utf8')); } catch {}
const all = [...new Set([...made, ...clips.map((f) => f.slice(0, -4))])].sort();
fs.writeFileSync(idx, JSON.stringify(all));
console.log(`The Sheikh's phrases: ${clips.length} VoxCPM2 clips in public/audio/voice`);
