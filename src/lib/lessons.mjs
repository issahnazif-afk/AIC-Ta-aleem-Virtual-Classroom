// The Alif Ba course, lesson by lesson, following the school's booklet
// "Alif Ba, Your Road to Reading Qur'an Al-Kerim".
//
// Every lesson has a board to learn from (cards the student taps to hear) and a game.
// Qur'an examples are taken word for word from the Tanzil text by scripts/lessons/examples.py
// (src/data/alifba-examples.json), and they play the reciter's own ayah, never a computer voice.
import EX from '../data/alifba-examples.json';
import { LETTERS } from './alifba.mjs';

const V = { a: 'َ', i: 'ِ', u: 'ُ', an: 'ً', in: 'ٍ', un: 'ٌ' };
const carrier = (L) => (L.letter === 'ا' ? 'ء' : L.letter);       // alif takes the hamza when it has a vowel
const seat = (L, v) => (L.letter === 'ا' ? (v === 'i' || v === 'in' ? 'إ' : 'أ') : L.letter);

// one syllable: a letter with a sign, its clip id and how it sounds
export function syllable(L, v) {
  const s = L.sound === 'ʾ' ? '' : L.sound;
  switch (v) {
    case 'a': case 'i': case 'u': return { ar: seat(L, v) + V[v], id: `s-${L.file}-${v}`, latin: s + v };
    case 'an': case 'in': case 'un': return { ar: seat(L, v) + V[v] + (v === 'an' && !'ةءأ'.includes(seat(L, v)) ? 'ا' : ''), id: `s-${L.file}-${v}`, latin: s + v };
    case 'aa': return { ar: (L.letter === 'ا' ? 'آ' : L.letter + 'َا'), id: `s-${L.file}-aa`, latin: s + 'ā' };
    case 'ii': return { ar: seat(L, 'i') + 'ِي', id: `s-${L.file}-ii`, latin: s + 'ī' };
    case 'uu': return { ar: seat(L, 'u') + 'ُو', id: `s-${L.file}-uu`, latin: s + 'ū' };
    case 'sk': return { ar: 'أَ' + carrier(L) + 'ْ', id: `s-${L.file}-sk`, latin: 'a' + (s || 'ʾ') };
    case 'sh': return { ar: 'أَ' + carrier(L) + '\u0651\u064E', id: `s-${L.file}-sh`, latin: 'a' + (s || 'ʾ') + (s || 'ʾ') + 'a' };
  }
}

// the shapes of a letter in a word (the tatweel shows where it joins)
const NONJOIN = new Set(['ا', 'د', 'ذ', 'ر', 'ز', 'و']);
export function forms(L) {
  const l = L.letter, j = 'ـ';
  return NONJOIN.has(l) ? { alone: l, start: l, middle: j + l, end: j + l } : { alone: l, start: l + j, middle: j + l + j, end: j + l };
}

const ex = (group) => (EX[group] ?? []).map((x) => ({ ...x, group }));

// The 18 lessons. `board` says how the learning page is laid out; `game` which game it opens.
export const LESSONS = [
  { n: 1, name: 'The letters and their names', ar: 'الحُرُوفُ الهِجَائِيَّة', board: 'letters', game: 'lanterns', voice: true,
    intro: ['The Qur’an is written with 28 letters. Tap a letter to hear the Sheikh say it. Choose above whether he says its sound or its name.'] },
  { n: 2, name: 'Huruf Muqatta’at', ar: 'الحُرُوفُ المُقَطَّعَة', board: 'examples', groups: [['muqattaat', 'Openings of the surahs']], game: 'mosaic',
    intro: ['In the Qur’an, 29 surahs begin with letters on their own. These letters are read by their names, not with vowel sounds.', 'Tap an opening to hear Sheikh Husary recite it.'] },
  { n: 3, name: 'Writing the letters', ar: 'كِتَابَةُ الحُرُوف', board: 'forms', game: 'mosaic', voice: true,
    intro: ['A letter changes its shape at the beginning, middle and end of a word. Six letters (ا د ذ ر ز و) never join the letter after them.'] },
  { n: 4, name: 'Harakat', ar: 'الحَرَكَات', board: 'syllables', vowels: ['a', 'i', 'u'], game: 'rain',
    intro: ['Fat-ha ( َ ) is placed above the letter and makes it sound “a”.', 'Kes-ra ( ِ ) is placed below the letter and makes it sound “i”.', 'Dom-ma ( ُ ) is placed above the letter and makes it sound “u”.'] },
  { n: 5, name: 'Sukun, shadda, tanween', ar: 'السُّكُون والشَّدَّة والتَّنْوِين', board: 'syllables', vowels: ['sk', 'sh', 'an', 'in', 'un'], game: 'rain',
    intro: ['Sukun ( ْ ) means the letter has no vowel; it is read joined to the letter before it: أَبْ.', 'Shadda ( ّ ) joins the letter to the one before like a sukun, then reads it again with its vowel: أَبَّ.', 'Tanween is two fat-ha, two kes-ra or two dom-ma at the end of a word: “an”, “in”, “un”.'] },
  { n: 6, name: 'The rules of Madd', ar: 'أَحْكَامُ المَدّ', board: 'examples', game: 'baskets',
    groups: [['madd-tabii', 'Madd Tabi‘i · natural, one alif'], ['madd-muttasil', 'Madd Muttasil · hamzah in the same word'], ['madd-munfasil', 'Madd Munfasil · hamzah in the next word'], ['madd-lazim', 'Madd Lazim · a fixed sukun or shadda'], ['madd-arid', 'Madd ‘Arid · stopping at the end'], ['madd-leen', 'Madd Leen · soft و or ي after fat-ha']],
    intro: ['Madd means lengthening. The primary Madd (Madd Tabi‘i) is one alif long. The secondary Madd are longer, because a hamzah or a sukun comes after the Madd letter.'] },
  { n: 7, name: 'Madd letters', ar: 'حُرُوفُ المَدّ', board: 'syllables', vowels: ['aa', 'ii', 'uu'], game: 'rain',
    intro: ['The Madd letters are ا و ي without a vowel of their own.', 'Alif after fat-ha makes a long “aa”. Ya after kes-ra makes a long “ii”. Waw after dom-ma makes a long “uu”. Each is held for the length of one alif.'] },
  { n: 8, name: 'Speeds of recitation', ar: 'مَرَاتِبُ القِرَاءَة', board: 'speeds', game: 'mosaic',
    intro: ['Tahqeeq is the slow, careful reading that gives every letter its full right. Tadweer is the middle speed. Hadr is the quick reading that still keeps every rule.', 'How long each Madd and each ghunnah is held depends on the speed.'] },
  { n: 9, name: 'Special pronunciations', ar: 'قِرَاءَاتٌ خَاصَّة', board: 'examples', game: 'baskets',
    groups: [['ha-long', 'The pronoun ha after a vowel: read long'], ['ha-short', 'The pronoun ha after a sukun: not lengthened'], ['hidden-alif', 'The small upright alif: read “aa”']],
    intro: ['The pronoun ha ( ـهُ / ـهِ ) at the end of a word is read long when the letter before it has a vowel, and short when the letter before it has a sukun.', 'A small upright alif above a letter lengthens it to “aa”.'] },
  { n: 10, name: 'Lafzatullah', ar: 'لَفْظُ الجَلَالَة', board: 'examples', game: 'baskets',
    groups: [['allah-heavy', 'After fat-ha or dom-ma: the lam is heavy'], ['allah-light', 'After kes-ra: the lam is light']],
    intro: ['If the letter before the Name of Allah has a dom-ma or a fat-ha, the lam in ٱللَّه is said heavy, with a full sound.', 'If it has a kes-ra, the lam is said light, with the tongue straight.'] },
  { n: 11, name: 'The rule of Ra', ar: 'أَحْكَامُ الرَّاء', board: 'examples', game: 'baskets',
    groups: [['ra-heavy', 'Heavy Ra'], ['ra-light', 'Light Ra']],
    intro: ['Ra is heavy when it has a fat-ha or a dom-ma, or when it has a sukun after a fat-ha or a dom-ma.', 'Ra is light when it has a kes-ra, or a sukun after a kes-ra.'] },
  { n: 12, name: 'Stopping', ar: 'الوَقْف', board: 'stops', game: 'mosaic',
    intro: ['When you stop at the end of an ayah, or for breath, the last letter takes a sukun.', 'Fat-ha tanween becomes a long “aa”. Ta marbuta ( ة ) becomes ha with a sukun. The pronoun ha is not lengthened.'] },
  { n: 13, name: 'Idgham', ar: 'الإِدْغَام', board: 'examples', game: 'baskets',
    groups: [['idgham-ghunnah', 'With ghunnah: ي ن م و'], ['idgham-plain', 'Without ghunnah: ل ر']],
    intro: ['Idgham means merging. When nun with sukun or tanween comes before ي ن م و, it merges into that letter with a ghunnah, a sound held in the nose.', 'Before ل or ر it merges with no ghunnah.'] },
  { n: 14, name: 'Iqlab', ar: 'الإِقْلَاب', board: 'examples', game: 'baskets', groups: [['iqlab', 'Nun or tanween before ب']],
    intro: ['When nun with sukun or tanween comes before ب, it turns into a meem with a ghunnah. The mushaf marks it with a small meem.'] },
  { n: 15, name: 'Izhar', ar: 'الإِظْهَار', board: 'examples', game: 'baskets', groups: [['izhar', 'Before ء ه ع ح غ خ']],
    intro: ['When nun with sukun or tanween comes before one of the throat letters ء ه ع ح غ خ, the nun is said fully and clearly.'] },
  { n: 16, name: 'Ikhfa', ar: 'الإِخْفَاء', board: 'examples', game: 'baskets', groups: [['ikhfa', 'Before the 15 letters of ikhfa']],
    intro: ['When nun with sukun or tanween comes before one of the 15 letters of ikhfa, the nun is hidden: said softly in the nose, without the tongue touching.', 'The letters of ikhfa: ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك.'] },
  { n: 17, name: 'Supplications in Salat', ar: 'أَدْعِيَةُ الصَّلَاة', board: 'duas', game: 'pearls',
    intro: ['The supplications we say in every prayer. Learn them a line at a time, then string their pearls in the right order.'] },
  { n: 18, name: 'Short surahs', ar: 'قِصَارُ السُّوَر', board: 'surahs', game: 'surahs',
    intro: ['The short surahs of the booklet. Listen to the Sheikh recite, then recite to him yourself: he follows every word.'] },
];

// ── the games for each lesson ──────────────────────────────────
export const GAMES = {
  lanterns: { name: 'Noor Lanterns', text: 'Hear a letter and light its lantern.' },
  rain: { name: 'Rain of Mercy', text: 'Hear a sound and catch its raindrop before it reaches the garden.' },
  mosaic: { name: 'Mosaic Maker', text: 'Every right answer lays a tile of the star.' },
  baskets: { name: 'Date Baskets', text: 'Put each date in the basket of its rule.' },
  pearls: { name: 'String of Pearls', text: 'Put the pearls of each supplication in order.' },
  surahs: { name: 'Recite to the Sheikh', text: 'He listens and follows every word.' },
};

// Lesson 8: how long each Madd and ghunnah is held, at each speed (from the booklet).
export const SPEEDS = {
  cols: ['Tahqeeq', 'Tadweer', 'Hadr'],
  rows: [
    ['Madd Tabi‘i', '1 alif', '1 alif', '1 alif'],
    ['Madd Muttasil', '4–5 alifs', '2–3 alifs', '2 alifs'],
    ['Madd Munfasil', '4–5 alifs', '2–3 alifs', '1 alif'],
    ['Madd Lazim', '4 alifs', '3–4 alifs', '3 alifs'],
    ['Madd ‘Arid', '4 alifs', '2 alifs', '1 alif'],
    ['Madd Leen', '3–4 alifs', '2 alifs', '1 alif'],
    ['Ghunnah', '1½ alifs', '1 alif', '1 alif'],
  ],
};

// Lesson 12: written, and as read when stopping.
export const STOPS = [
  { written: 'يَعْلَمُونَ', stop: 'يَعْلَمُونْ', wrong: ['يَعْلَمُونَا', 'يَعْلَمُونُ'], rule: 'The last letter takes a sukun.' },
  { written: 'عَلِيمٌ', stop: 'عَلِيمْ', wrong: ['عَلِيمُنْ', 'عَلِيمَا'], rule: 'Dom-ma tanween is not said: the letter takes a sukun.' },
  { written: 'حَكِيمٍ', stop: 'حَكِيمْ', wrong: ['حَكِيمِنْ', 'حَكِيمَا'], rule: 'Kes-ra tanween is not said: the letter takes a sukun.' },
  { written: 'عَلِيمًا', stop: 'عَلِيمَا', wrong: ['عَلِيمْ', 'عَلِيمَنْ'], rule: 'Fat-ha tanween becomes a long “aa”.' },
  { written: 'أَفْوَاجًا', stop: 'أَفْوَاجَا', wrong: ['أَفْوَاجْ', 'أَفْوَاجَنْ'], rule: 'Fat-ha tanween becomes a long “aa”.' },
  { written: 'رَحْمَةٌ', stop: 'رَحْمَهْ', wrong: ['رَحْمَتْ', 'رَحْمَةُنْ'], rule: 'Ta marbuta is read as ha with a sukun.' },
  { written: 'ٱلْقَارِعَةُ', stop: 'ٱلْقَارِعَهْ', wrong: ['ٱلْقَارِعَتْ', 'ٱلْقَارِعَةُ'], rule: 'Ta marbuta is read as ha with a sukun.' },
  { written: 'لَهُۥ', stop: 'لَهْ', wrong: ['لَهُو', 'لَهُ'], rule: 'The pronoun ha is not lengthened when stopping.' },
  { written: 'ٱلرَّحِيمِ', stop: 'ٱلرَّحِيمْ', wrong: ['ٱلرَّحِيمِي', 'ٱلرَّحِيمِ'], rule: 'The last letter takes a sukun.' },
  { written: 'ٱلْفَلَقِ', stop: 'ٱلْفَلَقْ', wrong: ['ٱلْفَلَقِي', 'ٱلْفَلَقَا'], rule: 'The last letter takes a sukun.' },
];

// Lesson 17. Rabbana is from the Qur’an and plays the ayah; please have your teacher check the others with you.
export const DUAS = [
  { key: 'thana', name: 'Subhanaka (the opening praise)', lines: ['سُبْحَانَكَ ٱللَّهُمَّ وَبِحَمْدِكَ', 'وَتَبَارَكَ ٱسْمُكَ', 'وَتَعَالَىٰ جَدُّكَ', 'وَلَا إِلَٰهَ غَيْرُكَ'] },
  { key: 'tahiyyat', name: 'At-Tahiyyat', lines: ['ٱلتَّحِيَّاتُ لِلَّهِ وَٱلصَّلَوَاتُ وَٱلطَّيِّبَاتُ', 'ٱلسَّلَامُ عَلَيْكَ أَيُّهَا ٱلنَّبِيُّ وَرَحْمَةُ ٱللَّهِ وَبَرَكَاتُهُ', 'ٱلسَّلَامُ عَلَيْنَا وَعَلَىٰ عِبَادِ ٱللَّهِ ٱلصَّالِحِينَ', 'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا ٱللَّهُ', 'وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ'] },
  { key: 'salli', name: 'Salat Ibrahimiyya · Allahumma salli', lines: ['ٱللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ', 'كَمَا صَلَّيْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ', 'إِنَّكَ حَمِيدٌ مَجِيدٌ'] },
  { key: 'barik', name: 'Salat Ibrahimiyya · Allahumma barik', lines: ['ٱللَّهُمَّ بَارِكْ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ', 'كَمَا بَارَكْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ', 'إِنَّكَ حَمِيدٌ مَجِيدٌ'] },
  { key: 'rabbana1', name: 'Rabbana atina', ref: '2:201', fromQuran: true },
  { key: 'rabbana2', name: 'Rabbanaghfir li', ref: '14:41', fromQuran: true },
  { key: 'qunut1', name: 'Du‘a al-Qunut · first part', lines: ['ٱللَّهُمَّ إِنَّا نَسْتَعِينُكَ وَنَسْتَغْفِرُكَ وَنَسْتَهْدِيكَ', 'وَنُؤْمِنُ بِكَ وَنَتُوبُ إِلَيْكَ وَنَتَوَكَّلُ عَلَيْكَ', 'وَنُثْنِي عَلَيْكَ ٱلْخَيْرَ كُلَّهُ', 'نَشْكُرُكَ وَلَا نَكْفُرُكَ', 'وَنَخْلَعُ وَنَتْرُكُ مَنْ يَفْجُرُكَ'] },
  { key: 'qunut2', name: 'Du‘a al-Qunut · second part', lines: ['ٱللَّهُمَّ إِيَّاكَ نَعْبُدُ', 'وَلَكَ نُصَلِّي وَنَسْجُدُ', 'وَإِلَيْكَ نَسْعَىٰ وَنَحْفِدُ', 'نَرْجُو رَحْمَتَكَ وَنَخْشَىٰ عَذَابَكَ', 'إِنَّ عَذَابَكَ بِٱلْكُفَّارِ مُلْحِقٌ'] },
].map((d) => {
  if (!d.fromQuran) return d;
  const x = EX.rabbana.find((e) => e.ref === d.ref);
  const w = x.ar.split(' ');
  const cut = Math.ceil(w.length / 3);
  return { ...d, lines: [w.slice(0, cut).join(' '), w.slice(cut, 2 * cut).join(' '), w.slice(2 * cut).join(' ')] };
});

// Lesson 18: the booklet's short surahs.
export const SURAHS = [1, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114];

export function examples(lesson) { return (lesson.groups ?? []).map(([g, title]) => ({ group: g, title, items: ex(g) })); }

// ── what each game asks, built from the lesson ─────────────────
export function letterItems() { return LETTERS; }
export function syllableItems(lesson) {
  const out = [];
  for (const L of LETTERS) for (const v of lesson.vowels) out.push({ ...syllable(L, v), L, v });
  return out;
}
// the baskets for a lesson, and the dates to sort
export function basketsFor(lesson) {
  const sets = {
    6: [['madd-tabii', 'Tabi‘i'], ['madd-muttasil', 'Muttasil'], ['madd-munfasil', 'Munfasil'], ['madd-lazim', 'Lazim'], ['madd-arid', '‘Arid'], ['madd-leen', 'Leen']],
    9: [['ha-long', 'Ha read long'], ['ha-short', 'Ha not lengthened']],
    10: [['allah-heavy', 'Heavy lam'], ['allah-light', 'Light lam']],
    11: [['ra-heavy', 'Heavy Ra'], ['ra-light', 'Light Ra']],
    13: [['idgham-ghunnah', 'Idgham with ghunnah'], ['idgham-plain', 'Idgham without ghunnah']],
    14: [['idgham', 'Idgham'], ['iqlab', 'Iqlab']],
    15: [['idgham', 'Idgham'], ['iqlab', 'Iqlab'], ['izhar', 'Izhar']],
    16: [['izhar', 'Izhar'], ['idgham', 'Idgham'], ['iqlab', 'Iqlab'], ['ikhfa', 'Ikhfa']],
  }[lesson.n] ?? [];
  const groupsOf = (k) => (k === 'idgham' ? ['idgham-ghunnah', 'idgham-plain'] : [k]);
  const items = sets.flatMap(([k]) => groupsOf(k).flatMap((g) => ex(g).map((e) => ({ ...e, basket: k }))));
  return { baskets: sets.map(([key, label]) => ({ key, label })), items };
}
