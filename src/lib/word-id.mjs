// A short, stable id for an Arabic word in the Ta’aleem Books, from its letters and vowel marks (no browser needed,
// so the build scripts can use it too). The clip is public/audio/words/<id>.mp3, or a Voice Studio recording.
export function wordClipId(ar) {
  const s = ar.normalize('NFC').trim();
  let h = 2166136261;
  for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return 'w-' + h.toString(36);
}

// the id of the English meaning of a picture word ("apple"), said by the storyteller after the Arabic
export const meaningClipId = (en) => 'e-' + wordClipId(String(en).trim().toLowerCase()).slice(2);
