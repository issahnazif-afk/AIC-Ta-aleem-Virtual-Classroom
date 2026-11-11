// Every Arabic word or syllable a child can tap in the Ta’aleem Books (not the single letters, which use the letter voice).
// Writes scripts/voice/words.json: [{ id, ar, en, books }]. The clips are made by scripts/voice/make_words.py into
// public/audio/words/<id>.mp3 and checked by ear and by a speech recognizer before they are committed.
//   node scripts/voice/word-list.mjs
import fs from 'node:fs';
import { BOOKS } from '../../src/lib/books/index.mjs';
import { wordClipId } from '../../src/lib/word-id.mjs';

const out = new Map();
for (const b of BOOKS) for (const c of b.chapters ?? []) for (const pg of c.pages ?? []) for (const t of pg.tap ?? []) {
  if (!t.ar || t.letter) continue;
  const id = wordClipId(t.ar);
  const w = out.get(id) ?? { id, ar: t.ar.trim(), en: t.en ?? '', books: [] };
  if (!w.books.includes(b.id)) w.books.push(b.id);
  out.set(id, w);
}
const list = [...out.values()];
fs.writeFileSync(new URL('./words.json', import.meta.url), JSON.stringify(list, null, 1) + '\n');
console.log(`${list.length} Arabic words and syllables to voice.`);
