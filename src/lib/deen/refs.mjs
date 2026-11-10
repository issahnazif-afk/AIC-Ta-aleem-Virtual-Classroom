// Hadith references in My Deen: { c: collection, n: number }, with the numbering of sunnah.com.
export const NAMES = { bukhari: 'Bukhari', muslim: 'Muslim', abudawud: 'Abu Dawud', tirmidhi: 'Tirmidhi', nasai: "an-Nasa'i", ibnmajah: 'Ibn Majah' };
export const refText = (r) => `${NAMES[r.c] ?? r.c} ${r.n}`;
export const refUrl = (r) => `https://sunnah.com/${r.c}:${r.n}`;
