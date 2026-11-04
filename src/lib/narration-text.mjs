// Shared by the browser and the build scripts: which voice reads what, the spoken form of Arabic words,
// and the key that names each recorded clip (FNV-1a of "voice|spoken text", so a changed sentence or pronunciation gets a new clip).

// Kokoro voices (Apache 2.0): a warm storyteller for Story Time, a calm male narrator for the Seerah Quest.
export const VOICES = { story: 'af_heart', seerah: 'bm_george' };
export const SPEED = { story: 0.9, seerah: 0.92 };

// How the English voice should say the Arabic words in the stories
export const SAY = [
  [/Assalamu alaykum/gi, 'Assalaamu alaikum'], [/Wa alaykum assalam/gi, 'Wa alaikum assalaam'], [/Jazakallahu khayran/gi, 'Jazaakallaahu khairan'],
  [/A‘udhu billahi minash-shaytanir-rajim/g, 'Aoodhu billaahi minash shaitaanir rajeem'], [/A‘udhu billah/g, 'Aoodhu billaah'],
  [/Masha’Allah/g, 'Maashaa Allah'], [/In sha Allah/g, 'In shaa Allah'], [/Alhamdulillah/gi, 'Alhamdu lillaah'], [/SubhanAllah/g, 'Subhaan Allah'],
  [/Bismika Allahumma amutu wa ahya/g, 'Bismika Allaahumma amootu wa ahyaa'], [/Allahumma sayyiban nafi‘a/g, 'Allaahumma sayyiban naafiaa'],
  [/Bismillah/g, 'Bismillaah'], [/\bsalam\b/g, 'salaam'], [/\bMisk\b/g, 'Missk'], [/Eid Mubarak/g, 'Eed Mubaarak'], [/\bwudu\b/g, 'wudoo'], [/\bsalah\b/g, 'salaah'], [/\bQuls\b/g, 'Kulls'],
  [/ﷺ/g, ', peace be upon him,'], [/Ustadha/g, 'Ustaadha'], [/Jiddo/g, 'Jiddoh'], [/Teta/g, 'Tayta'], [/Qurʾan/g, 'Quran'],
  [/ʿAbd al-Muttalib/g, 'Abdul Muttalib'], [/ʿ/g, ''], [/ʾ/g, ''], [/Ka‘bah|Kaʿbah/g, 'Kaaba'], [/Sanaʿa/g, 'Sanaa'], [/Khathʿam/g, 'Khathaam'],
];
export function spoken(text) { let s = text; for (const [a, b] of SAY) s = s.replace(a, b); return s.replace(/\s+/g, ' ').trim(); }

export function clipKey(voice, text) {
  let h = 0x811c9dc5;
  for (const b of new TextEncoder().encode(`${voice}|${spoken(text)}`)) { h ^= b; h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}

// The fixed lines the story reader says
export const STORY_LINES = { right: 'Masha’Allah, that’s right!', yes: 'Yes!', again: 'Not quite. Try again!', prophet: 'The Prophet Muhammad ﷺ said:', quran: 'Allah says in the Qurʾan:' };
