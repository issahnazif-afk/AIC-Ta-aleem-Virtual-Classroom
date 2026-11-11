// Shared by the browser and the build scripts: which voice reads what, the spoken form of Arabic words,
// and the key that names each recorded clip (FNV-1a of "voice|spoken text", so a changed sentence or pronunciation gets a new clip).

// Three readers, all made with Kokoro (Apache 2.0) by scripts/voice/make_narration.py:
//   story   a warm, slow storyteller (af_heart), with the characters' words in their own voices
//   seerah  a calm narrator (bm_george) for the history
// The names below are part of each clip's key: change one and every clip of that reader is recorded again.
//   sheikh  the Sheikh's chat before a recitation (src/lib/sheikh-chat.mjs): an older man, slow, low and kind
export const VOICES = { story: 'storyteller-2', seerah: 'narrator-2', sheikh: 'sheikh-1' };

// How the English voice should say the Arabic words in the stories
export const SAY = [
  [/Assalamu alaykum/gi, 'Assalaamu alaikum'], [/Wa alaykum assalam/gi, 'Wa alaikum assalaam'], [/Jazakallahu khayran/gi, 'Jazaakallaahu khairan'],
  [/A‘udhu billahi minash-shaytanir-rajim/g, 'Aoodhu billaahi minash shaitaanir rajeem'], [/A‘udhu billah/g, 'Aoodhu billaah'],
  [/Masha’Allah/g, 'Maashaa Allah'], [/In sha Allah/g, 'In shaa Allah'], [/Alhamdulillah/gi, 'Alhamdu lillaah'], [/SubhanAllah/g, 'Subhaan Allah'],
  [/Bismika Allahumma amutu wa ahya/g, 'Bismika Allaahumma amootu wa ahyaa'], [/Allahumma sayyiban nafi‘a/g, 'Allaahumma sayyiban naafiaa'],
  [/Bismillah/g, 'Bismillaah'], [/\bsalam\b/g, 'salaam'], [/\bMisk\b/g, 'Missk'], [/Eid Mubarak/g, 'Eed Mubaarak'], [/\bwudu\b/g, 'wudoo'], [/\bsalah\b/g, 'salaah'], [/\bQuls\b/g, 'Kulls'],
  [/ﷺ/g, ', peace be upon him,'], [/Ustadha/g, 'Ustaadha'], [/Teta/g, 'Tayta'], [/\bNuh\b/g, 'Nooh'], [/\bYunus\b/g, 'Yoonus'], [/Firaun/g, 'Firown'], [/\bJudi\b/g, 'Joodee'], [/Qurʾan/g, 'Quran'],
  [/ʿAbd al-Muttalib/g, 'Abdul Muttalib'], [/ʿ/g, ''], [/ʾ/g, ''], [/Ka‘bah|Kaʿbah/g, 'Kaaba'], [/Sanaʿa/g, 'Sanaa'], [/Khathʿam/g, 'Khathaam'],
];
// How the recorded storyteller says Muslim names and Islamic words: as a Muslim English speaker would, close to the
// Arabic, not as English guesses them ("MEH-ree-am", "EYE-dris", "AL-uh"). Written in the IPA the voice (Kokoro) uses.
// make_narration.py sends these sounds straight to the voice. Longest phrases first. Changing a sound re-records the
// lines that use it (the sound is part of each clip's key).
export const NAMES = [
  ['Assalamu alaykum', 'assalˈɑːmu alˈaɪkum'], ['Wa alaykum assalam', 'wa alˈaɪkum assalˈɑːm'], ['Jazakallahu khayran', 'dʒazˈɑːkallˌɑːhu xˈaɪɹan'],
  ['Jazakillahu khayran', 'dʒazˈɑːkillˌɑːhu xˈaɪɹan'], ['In sha’ Allah', 'inʃˈɑːllˌɑːh'], ['In sha Allah', 'inʃˈɑːllˌɑːh'], ['Masha’Allah', 'mˌɑːʃɑːllˈɑːh'],
  ['SubhanAllah', 'sˌʊbhɑːnallˈɑːh'], ['Alhamdulillah', 'alhˌamdulillˈɑːh'], ['Allahu Akbar', 'allˌɑːhu ˈakbaɹ'], ['Bismillah', 'bismillˈɑːh'],
  ['Eid Mubarak', 'ˈiːd mubˈɑːɹak'], ['Ramadan Mubarak', 'ɹamadˈɑːn mubˈɑːɹak'], ['Hajj Musa', 'hˈadʒ mˈuːsa'], ['Abdul Muttalib', 'ˈabdul muttˈɑlib'],
  ['Allah', 'allˈɑːh'], ['Muhammad', 'muhˈammad'], ['Ibrahim', 'ibɹɑːhˈiːm'], ['Ismail', 'ismɑːˈiːl'], ['Jibril', 'dʒibɹˈiːl'],
  ['Maryam', 'mˈaɹjam'], ['Idris', 'idɹˈiːs'], ['Yusuf', 'jˈuːsuf'], ['Bilal', 'bilˈɑːl'], ['Omar', 'ˈʊmaɹ'], ['Zara', 'zˈɑːɹa'], ['Huda', 'hˈuːda'],
  ['Salma', 'sˈalma'], ['Sami', 'sˈɑːmi'], ['Hamza', 'hˈamza'], ['Safiya', 'sˈafijja'], ['Layla', 'lˈaɪla'], ['Rashid', 'ɹˈɑːʃid'], ['Khadija', 'xadˈiːdʒa'],
  ['Musa', 'mˈuːsa'], ['Nuh', 'nˈuːh'], ['Yunus', 'jˈuːnus'], ['Firaun', 'fiɹˈaʊn'], ['Judi', 'dʒˈuːdi'], ['Amira', 'amˈiːɹa'], ['Misk', 'mˈisk'], ['Teta', 'tˈɛta'], ['Ustadha', 'ustˈɑːða'], ['Imam', 'imˈɑːm'],
  ['Hashim', 'hˈɑːʃim'], ['Jurhum', 'dʒˈuɹhum'], ['ibn', 'ˈibn'], ['Quraysh', 'kuɹˈaɪʃ'], ['Abraha', 'ˈabɹaha'], ['Makkah', 'mˈakka'], ['Zamzam', 'zˈamzam'], ['Kaaba', 'kˈɑːba'], ['Ishaq', 'ishˈɑːk'],
  ['Mahmud', 'mahmˈuːd'], ['Thaqif', 'θakˈiːf'], ['Kinanah', 'kinˈɑːna'], ['Tihama', 'tihˈɑːma'],
  ['masjid', 'mˈasdʒid'], ['salam', 'salˈɑːm'], ['salah', 'salˈɑːh'], ['wudu', 'wʊdˈuː'], ['dua', 'dˈuːɑː'], ['miswak', 'miswˈɑːk'], ['adhan', 'aðˈɑːn'],
  ['Fajr', 'fˈadʒɹ'], ['Dhuhr', 'ðˈuhɹ'], ['Asr', 'ˈasɹ'], ['Maghrib', 'mˈaɣɹib'], ['Isha', 'iʃˈɑː'], ['Jumuah', 'dʒˈumuːa'], ['taraweeh', 'taɹaːwˈiːh'],
  ['Ramadan', 'ɹamadˈɑːn'], ['iftar', 'iftˈɑːɹ'], ['Eid', 'ˈiːd'], ['Jannah', 'dʒˈanna'], ['Hajj', 'hˈadʒ'], ['sadaqah', 'sˈadaka'], ['nasheed', 'naʃˈiːd'],
  ['Mujawwadah', 'mudʒˈawwada'], ['Hifz', 'hˈifð'], ['ayat', 'aːjˈɑːt'], ['Juz Amma', 'dʒˈuz ˈamma'], ['Yasin', 'jaːsˈiːn'], ['al-Mulk', 'al mˈʊlk'],
  ['al-Kahf', 'al kˈahf'], ['mushaf', 'mˈʊshaf'], ['Sheikh', 'ʃˈeɪx'],
  ['hadith', 'hadˈiːθ'], ['surah', 'sˈuːɹa'], ['ayah', 'ˈɑːja'], ['Qurʾan', 'kʊɹˈɑːn'], ['Quran', 'kʊɹˈɑːn'],
];
const NAME_RE = new RegExp(`(?<![\\p{L}])(${NAMES.map(([w]) => w.replace(/[’']/g, "['’]").replace(/ /g, '\\s+')).join('|')})([’']s)?(?![\\p{L}])`, 'giu');
const NAME_KEY = new Map(NAMES.map(([w, ipa]) => [w.toLowerCase().replace(/’/g, "'"), ipa]));
// spoken(text): what the browser's own voice is given. spoken(text, true): what the recorded voice reads, with each
// name as {its sounds} (also used for the clip keys)
export function spoken(text, sounds = false) {
  let s = text;
  const names = (t) => t.replace(NAME_RE, (m, w, pos) => { const ipa = NAME_KEY.get(w.toLowerCase().replace(/’/g, "'").replace(/\s+/g, ' ')); return ipa ? `{${ipa}${pos ? 'z' : ''}}` : m; });
  if (sounds) s = names(s);
  for (const [a, b] of SAY) s = s.replace(a, b);
  if (sounds) s = names(s);
  return s.replace(/\s+/g, ' ').trim();
}

// Who says the words in “quotes” on a page, so each is read in a voice that fits who they are. The voices (the cast in
// scripts/voice/make_narration.py, and the browser's pitch and pace in narration.mjs when there is no recording):
//   girl, boy   the children           mama   a mother           woman    the aunties and other women
//   teta        a grandmother          man    Baba, the uncles   grandpa  Grandpa Musa
//   imam        Imam Rashid            teacher  Ustadha Huda     cat      Misk
//   narrator    the storyteller: also every word of the Qur'an and of a Prophet, which no character voice reads
// Found from the words around the quote ("said Mama", "Teta says,", "she whispered"), or the person named just before;
// SPEAKERS says it outright where that guess would be wrong (keys are "story:page" or "story:page:say" for a tap).
export const CHILD = { Maryam: 'girl', Zara: 'girl', Safiya: 'girl', Layla: 'girl', Aminah: 'girl', Amina: 'girl',
  Yusuf: 'boy', Bilal: 'boy', Omar: 'boy', Adam: 'boy', Hamza: 'boy', Idris: 'boy', Hassan: 'boy' };
export const WHO = {
  ...CHILD, Mama: 'mama', Teta: 'teta', 'Aunty Salma': 'woman', 'Aunty Khadija': 'woman', 'Aunty Khadijah': 'woman',
  'Ustadha Huda': 'teacher', Ustadha: 'teacher', Baba: 'man', 'Uncle Sami': 'man', 'Uncle Idris': 'man',
  'Imam Rashid': 'imam', 'the Imam': 'imam', 'Grandpa Musa': 'grandpa', Grandpa: 'grandpa',
};
export const VOICE_KINDS = ['narrator', 'girl', 'boy', 'mama', 'woman', 'teta', 'man', 'grandpa', 'imam', 'teacher', 'cat'];
const SHE = new Set(['girl', 'mama', 'woman', 'teta', 'teacher']);
export const SPEAKERS = {
  // Story Time
  'smile:5': ['man', 'mama'], 'vase:5': ['mama', 'boy'], 'thanks:2:say': ['boy'], 'bismillah:5': ['grandpa'], 'cookies:3:say': ['girl'],
  'misk:1': ['cat'], 'neighbour:3:say': ['girl'], 'sleep:2': ['girl'], 'shoes:4': ['girl', 'girl'], 'grandpa:2:say': ['girl'], 'mama:3': ['girl', 'girl'],
  'mama:2': ['boy'], 'salam:1': ['boy', 'teta'], 'salam:3:say': ['boy', 'boy'], 'shoes:3:say': ['girl'], 'thanks:3': ['boy'],
  'vase:3:say': ['boy'], 'words:3:say': ['boy'], 'sleep:3:say': ['boy'],
  // the Reading Library, Level 1
  'l1-kite:3:say': ['boy'], 'l1-ducks:3:say': ['boy'], 'l1-snow:3:say': ['girl'], 'l1-market:3:say': ['boy'],
  'l1-bee:4': ['girl', 'teta'], 'l1-glasses:4': ['teta'], 'l1-puddle:3:say': ['boy'], 'l1-puddle:4': ['girl'],
  'l1-hill:1': ['man'], 'l1-hill:5': ['girl'], 'l1-stars:2': ['boy'], 'l1-sheep:1': ['boy'], 'l1-sheep:4': ['boy'], 'l1-sheep:5': ['man'],
  'l1-fast:3:say': ['boy'], 'l1-fast:4': ['woman'], 'l1-fast:5': ['boy'], 'l1-tooth:2': ['mama', 'mama'], 'l1-book:1': ['teacher', 'teacher'],
  'l1-book:3:say': ['girl'], 'l1-book:5': ['teacher'], 'l1-dark:2': ['boy'], 'l1-dark:3': ['mama'], 'l1-dark:4': ['mama'],
  'l1-camel:2': ['girl', 'grandpa'], 'l1-lemonade:2': ['girl'], 'l1-lemonade:3:say': ['girl'], 'l1-lemonade:5': ['girl'], 'l1-garden:4': ['girl', 'imam'],
  // the Reading Library, Level 2
  'l2-map:3': ['narrator'], 'l2-map:3:say': ['narrator'], 'l2-map:7': ['imam'], 'l2-kitten:2': ['girl'], 'l2-kitten:6': ['woman'], 'l2-kitten:7': ['woman'],
  'l2-wallet:4:say': ['boy'], 'l2-wallet:6': ['man', 'man'], 'l2-beach:7': ['teacher'], 'l2-race:4:say': ['boy'],
  'l2-moon:4:say': ['girl'], 'l2-well:2': ['man', 'man'], 'l2-well:4:say': ['girl'], 'l2-well:7': ['man'],
  'l2-mountain:1': ['narrator'], 'l2-mountain:3:say': ['boy', 'boy'], 'l2-science:6': ['narrator'], 'l2-train:2:say': ['mama'],
  'l2-argument:2': ['girl', 'girl'], 'l2-argument:5:say': ['narrator'], 'l2-argument:6': ['girl'], 'l2-lanterns:4:say': ['girl'],
  'l2-detectives:4:say': ['girl'], 'l2-bully:3': ['man'], 'l2-hospital:5': ['mama'], 'l2-bully:4:say': ['boy'],
  // the added books
  'add-honest-ibrahim:1': ['mama'], 'add-honest-ibrahim:6': ['woman'], 'add-honest-ibrahim:7': ['boy'], 'add-honest-ibrahim:9': ['boy', 'man'],
  'add-aminah-rain:0': ['girl'], 'add-aminah-rain:3': ['girl'], 'add-yusuf-noor:1': ['narrator'], 'add-yusuf-noor:2': ['boy', 'boy'],
  'add-yusuf-noor:8': ['boy'], 'add-hassan-mornings:0': ['mama', 'boy'], 'add-hassan-mornings:3': ['teacher', 'teacher'], 'add-hassan-mornings:6': ['girl'],
  'add-amina-dolls:2': ['girl', 'mama'], 'add-amina-dolls:3': ['girl'], 'add-amina-dolls:5': ['girl'],
  // Tawheed
  't1-moon:1': ['girl'], 't1-moon:2:say': ['grandpa', 'grandpa'], 't1-moon:4': ['girl', 'grandpa'], 't1-one:3': ['girl'], 't1-one:3:say': ['girl'],
  't1-rain:5': ['girl', 'girl'], 't1-whisper:3:say': ['boy'], 't1-dates:2': ['boy', 'man'], 't1-dates:3:say': ['man'],
  't1-ant:3': ['girl'], 't1-ant:3:say': ['teta'], 't1-ant:4': ['girl', 'teta'], 't1-ant:5': ['girl'],
  't2-sky:2:say': ['man', 'man'], 't2-sky:4': ['man'], 't2-sky:6': ['boy', 'boy', 'man'], 't2-sky:7': ['boy'],
  't2-charm:3': ['girl'], 't2-charm:3:say': ['teacher'], 't2-charm:5': ['girl'], 't2-charm:6': ['narrator'], 't2-names:1': ['mama', 'mama'],
  // Ustadha Huda and the Imam tell the stories of Ibrahim and of Bilal ibn Rabah: the whole telling is in their voice
  't2-ibrahim:0': ['teacher', 'teacher'], 't2-ibrahim:1': ['teacher'], 't2-ibrahim:2': ['teacher'], 't2-ibrahim:3': ['teacher'], 't2-ibrahim:4': ['teacher', 'teacher'],
  't2-ibrahim:5:say': ['teacher'], 't2-ibrahim:6': ['teacher'],
  // Stories of the Prophets (src/lib/library/prophets.mjs): the words of Allah and of a Prophet are always the narrator's;
  // the people who spoke against them ("Burn him!", "We will be caught!") are men's voices
  'p-ibrahim:1': ['narrator'], 'p-ibrahim:2': ['man'], 'p-ibrahim:4': ['man'], 'p-ibrahim:5': ['narrator'], 'p-ibrahim:6': ['man'], 'p-ibrahim:6:say': ['narrator'],
  'p-nuh:0': ['narrator'], 'p-nuh:1': ['man', 'man'], 'p-nuh:6': ['narrator'], 'p-nuh:7': ['narrator', 'man'], 'p-nuh:8': ['narrator'],
  'p-yunus:5': ['narrator'], 'p-musa:0': ['narrator'], 'p-musa:1': ['man'], 'p-musa:3': ['man'], 'p-musa:4': ['narrator'],
  't2-ahad:1': ['boy', 'imam', 'imam'], 't2-ahad:2': ['imam'], 't2-ahad:3': ['imam'], 't2-ahad:4': ['imam'], 't2-ahad:5:say': ['imam'],
};
const VERB = '(?:said|says|say|asked|asks|told|tells|read|reads|thought|thinks|cried|cries|(?:laugh|call|whisper|shout|smile|nod|grumble|cheer|gasp|croak|mumble|promise|giggle|sigh|wink|answer|add|explain|yell|repl)(?:s|es|ed|d|ded|ied|ies)?)';
const NAMES_ALT = Object.keys(WHO).sort((a, b) => b.length - a.length).map((n) => n.replace(/ /g, '\\s+')).join('|');
const who = (n) => WHO[n] ?? WHO[Object.keys(WHO).find((k) => k.toLowerCase() === n.replace(/\s+/g, ' ').toLowerCase())];
const sentences = (t) => t.trim().split(/(?<=[.!?:])\s+/).filter(Boolean);
// the first person (of a kind: she, he or anyone) named in the last sentence that names one
function named(ctx, ok = () => true) {
  for (const s of sentences(ctx).reverse()) {
    const hits = [...s.matchAll(new RegExp(`(?<![\\p{L}])(${NAMES_ALT})(?![\\p{L}])`, 'gu'))].map((m) => who(m[1])).filter(ok);
    if (hits.length) return hits[0];
  }
  return null;
}
// before: the narration just before the quote; after: just after it; ctx: the whole line up to the quote; prev: the last speaker
function guess(before, after, ctx, prev) {
  let m;
  // a quote the narrator introduces as the Qur'an's own words (Allah's, or a Prophet's) stays in the narrator's voice
  if (/Allah tells us in the Qurʾan/.test(before.split(/(?<=[.!?])\s+/).pop() ?? '')) return 'narrator';
  if ((m = new RegExp(`^[\\s,]*${VERB}\\s+(${NAMES_ALT})\\b`).exec(after)) || (m = new RegExp(`^[\\s,]*(${NAMES_ALT})\\s+${VERB}\\b`).exec(after))) return who(m[1]);
  if ((m = new RegExp(`^[\\s,]*(she|he)\\s+(?:\\w+\\s+)?${VERB}\\b`, 'i').exec(after))) {
    const she = m[1].toLowerCase() === 'she', ok = (k) => SHE.has(k) === she;
    return named(ctx, ok) ?? (prev && ok(prev) ? prev : she ? 'girl' : 'boy');
  }
  const near = [...before.matchAll(new RegExp(`(?:${VERB}\\s+(${NAMES_ALT})|(${NAMES_ALT})\\s+(?:\\w+\\s+)?${VERB})\\b`, 'g'))].pop();
  if (near) return who(near[1] ?? near[2]);
  return named(before) ?? prev ?? 'boy';
}
// split a line into [who, words] parts: the narrator, and each quote in its speaker's voice
export function parts(text, where) {
  const bits = text.split(/(“[^”]+”)/), out = [], fixed = SPEAKERS[where] ?? [];
  let q = 0, prev = null;
  bits.forEach((b, i) => {
    if (!b.trim()) return;
    if (b.startsWith('“')) {
      prev = fixed[q++] ?? guess(bits[i - 1] ?? '', bits[i + 1] ?? '', bits.slice(0, i).join(''), prev);
      out.push([prev, b.slice(1, -1)]);
    } else out.push(['narrator', b.trim()]);
  });
  return out;
}

export function clipKey(voice, text) {
  let h = 0x811c9dc5;
  for (const b of new TextEncoder().encode(`${voice}|${spoken(text, true)}`)) { h ^= b; h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}

// The fixed lines the story reader says
export const STORY_LINES = { right: 'Masha’Allah, that’s right!', yes: 'Yes!', again: 'Not quite. Try again!', prophet: 'The Prophet Muhammad ﷺ said:', quran: 'Allah says in the Qurʾan:' };

// The Reading Library games (src/lib/library/library.mjs). Each line is recorded once and reused by every book.
export const LIBRARY_LINES = {
  right: 'Masha’Allah, that’s right!',
  again: 'Not quite. Try again!',
  pictureWord: 'Look at the picture. Which word goes with it?',
  wordMeaning: 'Read the word. Which meaning is right?',
  gap: 'One word is missing. Which word fits?',
  order: 'What happened first? Tap the pictures in order.',
  three: 'Three stars! You are a super reader.',
  two: 'Two stars! Great reading. Try again for three.',
  one: 'One star! Every book makes you a better reader.',
};

// The Voice Studio id of a teacher's recording of a hadith in Arabic: one recording serves every book with that hadith
export function hadithClipId(ar) {
  let h = 0x811c9dc5;
  for (const b of new TextEncoder().encode(ar.replace(/\s+/g, ' ').trim())) { h ^= b; h = Math.imul(h, 0x01000193) >>> 0; }
  return 'ha-' + h.toString(16).padStart(8, '0');
}

// A vocabulary word's meaning, as the storyteller says it after the Arabic ("Apple." rather than "apple"): the recorded
// voice adds a stray sound before a lone lowercase word, so each one is read as a short sentence of its own.
export function wordForVoice(en) {
  const s = String(en ?? '').trim();
  if (!s) return s;
  return s[0].toUpperCase() + s.slice(1) + (/[.!?]$/.test(s) ? '' : '.');
}
