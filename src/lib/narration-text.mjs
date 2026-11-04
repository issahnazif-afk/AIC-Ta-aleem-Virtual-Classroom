// Shared by the browser and the build scripts: which voice reads what, the spoken form of Arabic words,
// and the key that names each recorded clip (FNV-1a of "voice|spoken text", so a changed sentence or pronunciation gets a new clip).

// Two readers, both made with Kokoro (Apache 2.0) by scripts/voice/make_narration.py:
//   story   a warm, slow storyteller (af_heart), with the characters' words in their own voices
//   seerah  a calm narrator (bm_george) for the history
// The names below are part of each clip's key: change one and every clip of that reader is recorded again.
export const VOICES = { story: 'storyteller-2', seerah: 'narrator-2' };

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

// Who says the words in “quotes” on a page. Found from the words around them ("said Mama", "Baba asked"), or the
// first person named in the sentence before; these pages say it outright where that guess would be wrong.
export const CHILD = { Maryam: 'girl', Zara: 'girl', Yusuf: 'boy', Bilal: 'boy', Omar: 'boy', Adam: 'boy' };
const WHO = { ...CHILD, Mama: 'mama', Teta: 'teta', 'Aunty Salma': 'mama', 'Ustadha Huda': 'teacher', Baba: 'man', 'Uncle Sami': 'man', Jiddo: 'jiddo' };
const SPEAKERS = {
  'smile:5': ['man', 'mama'], 'vase:5': ['mama', 'boy'], 'thanks:2:say': ['boy'], 'bismillah:5': ['jiddo'], 'cookies:3:say': ['girl'],
  'misk:1': ['cat'], 'neighbour:3:say': ['girl'], 'sleep:2': ['girl'], 'shoes:4': ['girl', 'girl'], 'jiddo:2:say': ['girl'], 'mama:3': ['girl', 'girl'],
  'mama:2': ['boy'], 'salam:1': ['boy', 'teta'], 'salam:3:say': ['boy', 'boy'], 'shoes:3:say': ['girl'],
};
const VERB = '(?:said|asked|laughed|called|whispered|shouted|smiled|nodded|grumbled|thought)';
function guess(before, after) {
  const names = Object.keys(WHO).sort((a, b) => b.length - a.length).join('|');
  for (const re of [new RegExp(`^[\\s,]*(?:he|she)?\\s*${VERB}\\s+(${names})`), new RegExp(`^[\\s,]*(${names})\\s+${VERB}`), new RegExp(`(${names})\\s+${VERB}[^.!?]*$`)]) {
    const m = re.exec(re.source.startsWith('(') ? before : after) || re.exec(after);
    if (m) return WHO[m[1]];
  }
  const last = before.trim().split(/(?<=[.!?])\s+/).pop() ?? '';
  const first = Object.keys(WHO).map((n) => [n, last.indexOf(n)]).filter(([, i]) => i >= 0).sort((a, b) => a[1] - b[1])[0];
  return first ? WHO[first[0]] : 'boy';
}
// split a line into [who, words] parts: the narrator, and each quote in its speaker's voice
export function parts(text, where) {
  const bits = text.split(/(“[^”]+”)/), out = [], fixed = SPEAKERS[where] ?? [];
  let q = 0;
  bits.forEach((b, i) => {
    if (!b.trim()) return;
    if (b.startsWith('“')) out.push([fixed[q++] ?? guess(bits[i - 1] ?? '', bits[i + 1] ?? ''), b.slice(1, -1)]);
    else out.push(['narrator', b.trim()]);
  });
  return out;
}

export function clipKey(voice, text) {
  let h = 0x811c9dc5;
  for (const b of new TextEncoder().encode(`${voice}|${spoken(text)}`)) { h ^= b; h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}

// The fixed lines the story reader says
export const STORY_LINES = { right: 'Masha’Allah, that’s right!', yes: 'Yes!', again: 'Not quite. Try again!', prophet: 'The Prophet Muhammad ﷺ said:', quran: 'Allah says in the Qurʾan:' };
