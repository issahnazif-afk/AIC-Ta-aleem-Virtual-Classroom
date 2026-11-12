// Writes the Sheikh's conversation library (src/lib/sheikh-library.mjs) to public/data/sheikh-library.json.
// The classroom plays the lines from it, and the class server (apps-script/Code.gs) gives its ids and texts to the
// AI model, which may only answer with those ids.
import fs from 'node:fs';
import { library } from '../../src/lib/sheikh-library.mjs';

const lib = await library();
const ids = new Set();
for (const x of lib) { if (ids.has(x.id)) throw new Error('two lines with the id ' + x.id); ids.add(x.id); }
const dir = new URL('../../public/data/', import.meta.url);
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(new URL('sheikh-library.json', dir), JSON.stringify({ v: 1, lines: lib }));
const n = (k) => lib.filter((x) => x.kind === k).length;
console.log(`Sheikh's library: ${n('line')} lines, ${n('hadith')} hadith, ${n('ayah')} ayat, ${n('seerah')} Ibn Kathir passages`);
