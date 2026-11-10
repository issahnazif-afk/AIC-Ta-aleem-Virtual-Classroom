// Where the voice of a du'a comes from. Only ever a real person:
//   1. a teacher's Voice Studio recording: one clip per part (and, if recorded, one of the whole du'a);
//   2. hisnmuslim.com, only when HISN_AUDIO is on (refs.mjs), and then only for the whole du'a;
//   3. nothing: the page says the recording is not ready. A computer voice never reads the Arabic.
// A Qur'an du'a plays the class reciter (a whole ayah) or the word-by-word recitation (part of an ayah).
import { studioUrl } from '../voice.mjs';
import { hadithClipId } from '../narration-text.mjs';
import { audioUrl, wordAudioUrl } from '../client.mjs';
import { hisnAudioUrl } from './refs.mjs';

// the Voice Studio id of a part (the same words share one recording, in every du'a that has them)
export const partClipId = (ar) => hadithClipId(ar);
export const wholeClipId = (d) => hadithClipId(d.ar);

// the du'a's parts: [{ ar, quran? }]. A Qur'an du'a has one part for each ayah it uses.
export function partsOf(d) {
  if (d.quran) return [d.quran].flat().map((q) => ({ quran: q, ar: '' }));
  return (d.parts ?? [d.ar]).map((ar) => ({ ar }));
}

// the audio of one part: a list of URLs played one after the other (empty when there is no recording)
export async function partAudio(part, { reciter, words } = {}) {
  if (part.quran) {
    const q = part.quran;
    if (!q.w) return [audioUrl(reciter, q.s, q.a)];
    // part of an ayah: the word-by-word recitation, counting only real words (not the small pause marks)
    const mark = (w) => /^[ۖ-ۭ]+$/.test(w);
    const real = (n) => (words ?? []).slice(0, n).filter((w) => !mark(w)).length;
    const first = real(q.w[0] - 1), last = real(q.w[1]) - 1;
    return Array.from({ length: last - first + 1 }, (_, i) => wordAudioUrl(q.s, q.a, first + i));
  }
  const url = await studioUrl(partClipId(part.ar)).catch(() => null);
  return url ? [url] : [];
}

// the whole du'a: { mode: 'parts' (one clip per part, so each part lights up), 'whole' (one clip), 'none' }
export async function wholeAudio(d, parts, opts) {
  const each = await Promise.all(parts.map((p) => partAudio(p, opts)));
  if (each.every((x) => x.length)) return { mode: 'parts', each };
  if (d.ar) {
    const url = (await studioUrl(wholeClipId(d)).catch(() => null)) ?? hisnAudioUrl(d.hisn?.id);
    if (url) return { mode: 'whole', url, each };
  }
  return { mode: 'none', each };
}
