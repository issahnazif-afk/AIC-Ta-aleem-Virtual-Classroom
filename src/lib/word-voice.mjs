// The Arabic words in the Ta’aleem Books, said by a recorded voice on every device (an iPad has an Arabic voice built in,
// a Windows computer usually does not). Where a word's sound comes from, best first:
//   1. a teacher's recording in the Voice Studio (id w-…), then
//   2. the checked clip in public/audio/words/<id>.mp3 (scripts/voice/make_words.py), then
//   3. the browser's own Arabic voice, if it has one.
import { u } from './url.mjs';
import { studioUrl, playUrl, browserSay } from './voice.mjs';

export { wordClipId, meaningClipId } from './word-id.mjs';
import { wordClipId, meaningClipId } from './word-id.mjs';

let made = null;
const madeSet = () => (made ??= fetch(u('audio/words/index.json')).then((r) => (r.ok ? r.json() : []), () => []).then((xs) => new Set(xs)));

export async function sayWord(ar) {
  const id = wordClipId(ar);
  const rec = await studioUrl(id);
  if (rec && (await playUrl(rec, 8000))) return true;
  if ((await madeSet()).has(id) && (await playUrl(u(`audio/words/${id}.mp3`), 8000))) return true;
  return browserSay(ar);
}

// The English meaning after the Arabic ("apple"): the checked clip in public/audio/words/e-….mp3 if there is one,
// otherwise the storyteller's narration of the word.
export async function sayMeaning(en, narrate) {
  if (!en) return;
  const id = meaningClipId(en);
  if ((await madeSet()).has(id) && (await playUrl(u(`audio/words/${id}.mp3`), 6000))) return;
  narrate();
}
