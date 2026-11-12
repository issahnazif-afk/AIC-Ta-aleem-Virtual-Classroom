// Writes the Sheikh's conversation library (src/lib/sheikh-library.mjs) for the classroom and the class server:
//   public/data/sheikh-library.json   every line, the openings for quotations, and the everyday intents
//   public/data/sheikh-vectors.bin    the meaning of each quotation and each intent example (Float32, 384 numbers
//                                      each, in the order of match.quotes, match.intents (each example)
//                                      and match.asks (each example question)), made with the same
//                                      on-device model the classroom uses (src/lib/sheikh-embed.mjs)
// The classroom plays the lines from it; the class server, when it has an AI key, gives its ids to the AI model.
import fs from 'node:fs';
import * as ort from 'onnxruntime-web';
import { library, INTROS, INTENTS, ASK } from '../../src/lib/sheikh-library.mjs';
import { embedder } from '../../src/lib/sheikh-embed.mjs';
import { ensureModel } from './model.mjs';

const lib = await library();
const ids = new Set(lib.map((x) => x.id));
if (ids.size !== lib.length) throw new Error('two library lines share an id');
for (const it of INTENTS) for (const id of it.say) if (!ids.has(id)) throw new Error('an intent says an unknown line: ' + id);
for (const id of Object.keys(ASK)) if (!ids.has(id)) throw new Error('ASK names an unknown quotation: ' + id);

// what each quotation is matched on: its topic and its words, without the chain of narrators at the start
export const matchText = (x) => `${x.topic ? x.topic + '. ' : ''}${x.text.replace(/^(Narrated [^:]{1,60}:|[^:]{1,80}\breported\b[^:]{0,60}:)\s*/, '')}`;
const quotes = lib.filter((x) => x.kind !== 'line');

ort.env.wasm.numThreads = 1;
const { embed } = await embedder({ ort, ...(await ensureModel()) });
const rows = [];
for (const x of quotes) rows.push(await embed(matchText(x)));
for (const it of INTENTS) for (const e of it.ex) rows.push(await embed(e));
const asks = Object.entries(ASK).flatMap(([id, qs]) => qs.map(() => id));
const askText = Object.values(ASK).flat();
for (const qs of Object.values(ASK)) for (const q of qs) rows.push(await embed(q));
const bin = new Float32Array(rows.length * 384);
rows.forEach((v, i) => bin.set(v, i * 384));

const dir = new URL('../../public/data/', import.meta.url);
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(new URL('sheikh-library.json', dir), JSON.stringify({ v: 2, lines: lib, intros: INTROS, match: { quotes: quotes.map((x) => x.id), intents: INTENTS, asks, askText } }));
fs.writeFileSync(new URL('sheikh-vectors.bin', dir), Buffer.from(bin.buffer));
const n = (k) => lib.filter((x) => x.kind === k).length;
console.log(`Sheikh's library: ${n('line')} lines, ${n('hadith')} hadith, ${n('ayah')} ayat, ${n('seerah')} Ibn Kathir passages; ${rows.length} meanings`);
