// Hadith references in My Deen: { c: collection, n: number }, with the numbering of sunnah.com.
export const NAMES = { bukhari: 'Bukhari', muslim: 'Muslim', abudawud: 'Abu Dawud', tirmidhi: 'Tirmidhi', nasai: "an-Nasa'i", ibnmajah: 'Ibn Majah' };
export const refText = (r) => `${NAMES[r.c] ?? r.c} ${r.n}`;
export const refUrl = (r) => `https://sunnah.com/${r.c}:${r.n}`;

// hisnmuslim.com recordings of the du'as. OFF until the school has written permission to use them: keep this false.
// When it is turned on, a du'a with a `hisn` id (src/lib/deen/duas.mjs) and no teacher recording plays that item.
// Its parts will need timings (from silence detection on the file) before "Repeat after me" can use it; until then
// only "Listen" would play it, as one piece. No hisnmuslim audio is downloaded or kept in this repository.
export const HISN_AUDIO = false;
export const hisnAudioUrl = (id) => (HISN_AUDIO && id ? `https://www.hisnmuslim.com/audio/ar/${id}.mp3` : null);
