// Tries the Sheikh's counselling (COUNSEL in src/lib/sheikh-library.mjs) on things a child might say, at each level.
// Run after `node scripts/sheikh/library.mjs`:   node scripts/sheikh/counsel-try.mjs
// Checks: the right feeling is heard; the reply follows feel → (one quotation for that feeling and level) → step → du'a;
// every line said is for the student's level; safety still comes first.
import fs from 'node:fs';
import * as ort from 'onnxruntime-web';
import { embedder } from '../../src/lib/sheikh-embed.mjs';
import { createLocalMind } from '../../src/lib/sheikh-local.mjs';
import { SYN } from '../../src/lib/listen-en.mjs';

const dir = new URL('../../public/', import.meta.url);
const data = JSON.parse(fs.readFileSync(new URL('data/sheikh-library.json', dir), 'utf8'));
const vectors = new Float32Array(fs.readFileSync(new URL('data/sheikh-vectors.bin', dir)).buffer.slice(0));
ort.env.wasm.numThreads = 1;
const { embed } = await embedder({ ort, model: new Uint8Array(fs.readFileSync(new URL('models/minilm/model.onnx', dir))), vocab: fs.readFileSync(new URL('models/minilm/vocab.txt', dir), 'utf8') });
const mind = createLocalMind({ data, vectors, embed, phrases: SYN });
const lib = Object.fromEntries(data.lines.map((x) => [x.id, x]));

// [what the child says, the feeling the Sheikh should hear (null: not counselling)]
const CASES = [
  ['I am really nervous about my hifz test today', 'nervous'],
  ['I am scared I will forget the ayat', 'nervous'],
  ['I am just not good at memorising', 'discouraged'],
  ['I want to give up, it is too hard', 'discouraged'],
  ['my cousin knows way more surahs than me', 'comparing'],
  ['I am the best reciter in my whole class', 'proud'],
  ['reciting is so boring', 'bored'],
  ['I am really angry at my little brother', 'angry'],
  ['I feel sad today', 'sad'],
  ['my grandpa passed away last week', null],          // a loss: his own line for it (c-sorry-loss), not the counselling
  ['I lied to my mum yesterday', 'guilty'],
  ['I had a fight with my best friend', 'unkind'],
  ['I did not practise at all this week', 'lazy'],
  ['I memorised surah al-Mulk', 'grateful'],
  ['someone at school hits me', 'SAFE'],                // safety first: c-thanks, c-tell-adult
];
let ok = 0, n = 0;
for (const level of [1, 2, 3, 4]) {
  for (const [said, want] of CASES) {
    n++;
    const r = await mind.think({ phase: 'question', said, recent: [], level });
    const wrongLevel = r.say.filter((id) => lib[id]?.levels && !lib[id].levels.includes(level));
    const y = level <= 2 ? '-y' : '';
    let good;
    if (want === 'SAFE') good = r.say.join() === 'c-thanks,c-tell-adult';
    else if (!want) good = !r.trait;
    else good = r.trait === want && r.say[0] === `k-${want}${y}` && r.say.at(-2) === `k-${want}-step${y}` && /^k-dua/.test(r.say.at(-1)) && r.say.length <= 4;
    good &&= !wrongLevel.length;
    if (good) ok++;
    if (!good || process.argv.includes('--all')) console.log(`${good ? 'ok  ' : 'MISS'} L${level} "${said}" → ${r.trait ?? '-'}: ${r.say.join(', ')}${wrongLevel.length ? '  (NOT FOR THIS LEVEL: ' + wrongLevel + ')' : ''}`);
  }
}
console.log(`${ok} / ${n} as expected`);
process.exitCode = ok === n ? 0 : 1;
