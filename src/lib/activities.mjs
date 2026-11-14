// The Classroom's activities. The Classroom home shows one card per entry, in this order.
//
// To add an activity later:
//   1. add an entry here,
//   2. if it is a new kind of screen, open it in openActivity() in src/pages/index.astro.
// An entry with  kind: 'soon'  shows as "Coming soon" until it is ready.
//
//   id      unique name
//   kind    'recite' (camera, set-up, the Sheikh listens) | 'alifba' (letters and games) | 'play' (a Play & Learn game) | 'seerah' (the Seerah Quest) | 'stories' (Story Time) | 'library' (the Reading Library) | 'books' (the Ta’aleem Books) | 'deen' (My Deen: du'as, sunnah, Our Prophet, special days) | 'games' (Play & Make, src/lib/games/) | 'tajweed' (the Tajweed classroom, src/lib/tajweed/) | 'soon'
//   group   where it sits on the dashboard: 'hifz' (My Hifz) | 'lessons' (My Lessons) | 'play' (Play & Learn)
//   game    for 'play': detective | ayah | match | journey | salah | akhlaq (src/lib/play.mjs); for 'games': an id in GAMES (src/lib/games/index.mjs)
//   mode    for 'recite': 'hifz' or 'reading'
//   nocam   for 'recite': practice without the camera check, snapshot or look-away check (microphone only)
//   worlds  which learning worlds it belongs to (WORLDS below): the home page's "Choose your adventure"
//   shelf   for 'library': 'library' (the Reading Library), 'tawheed' (the Tawheed shelf) or 'prophets' (Stories of the Prophets)
//   view    for 'deen': which part opens first: duas | sunnah | prophet | days
//   levels  which classes see it (leave out for all)

import { icon } from './home-icons.mjs';

export const ACTIVITIES = [
  {
    id: 'hifz', worlds: ['quran'], kind: 'recite', mode: 'hifz', icon: 'hifz', group: 'hifz',
    title: 'Hifz test', ar: 'اِخْتِبَارُ ٱلْحِفْظ',
    text: 'The Sheikh recites the opening of an ayah. You carry on from memory until he stops you.',
  },
  {
    id: 'follow', worlds: ['quran'], kind: 'recite', mode: 'follow', icon: 'hifz', group: 'hifz',
    title: 'Follow my recitation', ar: 'تَسْمِيعُ ٱلْحِفْظ',
    text: 'Choose your surahs and ayahs, then recite them from memory. The Sheikh follows every word and helps only when you stop.',
  },
  {
    id: 'reading', worlds: ['quran'], kind: 'recite', mode: 'reading', icon: 'mushaf', group: 'hifz',
    title: 'Mujawwadah', ar: 'ٱلْمُجَوَّدَة',
    text: 'Read aloud from the mushaf page while the Sheikh follows every word.',
  },
  {
    id: 'recite', worlds: ['quran'], kind: 'recite', mode: 'reading', nocam: true, icon: 'mushaf', group: 'hifz',
    title: 'Recite (no camera)', ar: 'ٱلتِّلَاوَة',
    text: 'Practise on your own: recite from the mushaf with the Sheikh following every word. Only the microphone is used.',
  },
  // The Tajweed classroom (src/lib/tajweed/): the Sheikh teaches each rule on the board, shows it in the mushaf, then tests.
  {
    id: 'tajweed', worlds: ['quran'], kind: 'tajweed', icon: 'tajweed', group: 'lessons', levels: [3, 4], suggested: [3, 4],
    title: 'Tajweed with the Sheikh', ar: 'ٱلتَّجْوِيد',
    text: 'The Sheikh teaches each rule on the board, shows it in the Qur’an, then you practise and answer his questions.',
  },
  {
    id: 'alifba', worlds: ['arabic'], kind: 'alifba', icon: 'lantern', group: 'lessons',
    title: 'Alif Ba', ar: 'أَلِف بَاء',
    text: 'Eighteen lessons, from the letters to tajweed and the short surahs, each with a game.',
  },
  // Story Time: picture stories with good manners, each ending with a hadith or an ayah (src/lib/stories/).
  {
    id: 'stories', worlds: ['akhlaq', 'hadith'], kind: 'stories', icon: 'stories', group: 'lessons', suggested: [1],
    title: 'Story Time', ar: 'وَقْتُ الْقِصَّة',
    text: 'Twenty-two picture stories about good manners. Tap the pictures, listen, and learn a hadith with each one.',
  },
  // The Reading Library: a reading journey by level, each book with story games (src/lib/library/).
  {
    id: 'library', worlds: ['akhlaq', 'hadith'], kind: 'library', icon: 'library', group: 'lessons', suggested: [1, 2],
    title: 'Reading Library', ar: 'مَكْتَبَةُ ٱلْقِرَاءَة',
    text: 'Forty books on a reading journey. Read a book, play its games, collect stars and passport stamps.',
  },
  // Tawheed: knowing Allah, a shelf of picture books by level (src/lib/library/tawheed.mjs).
  {
    id: 'tawheed', worlds: ['tawheed'], kind: 'library', shelf: 'tawheed', icon: 'tawheed', group: 'lessons', suggested: [1, 2],
    title: 'Tawheed', ar: 'ٱلتَّوْحِيد',
    text: 'Who made the moon? Who hears a whisper? Twelve picture books about knowing Allah, with games and stars.',
  },
  // Stories of the Prophets: the stories Allah tells in the Qur'an (src/lib/library/prophets.mjs).
  {
    id: 'prophets', worlds: ['tawheed', 'quran'], kind: 'library', shelf: 'prophets', icon: 'prophets', group: 'lessons', suggested: [1, 2, 3],
    title: 'Stories of the Prophets', ar: 'قَصَصُ ٱلْأَنْبِيَاء',
    text: 'Ibrahim and the fire, Nuh and the ark, Yunus and the whale, Musa and the sea: stories Allah tells in the Qur’an, with an ayah and games.',
  },
  // The Ta’aleem Books: the school's own Canva books as interactive digital books, one shelf for every level (src/lib/books/).
  {
    id: 'books', worlds: ['arabic', 'dua', 'akhlaq', 'hadith', 'tawheed'], kind: 'books', icon: 'books', group: 'lessons', suggested: [1, 2, 3, 4],
    title: 'My Books', ar: 'كُتُبِي',
    text: 'The books for your level to read, tap, colour and answer, with stars to collect.',
  },
  // My Deen (src/lib/deen/): du'as, the Sunnah of the day, Our Prophet ﷺ and the special days. Qur'an and sound hadith only.
  {
    id: 'duas', worlds: ['dua'], kind: 'deen', view: 'duas', icon: 'dua', group: 'lessons', suggested: [1, 2, 3, 4],
    title: "My Du'as", ar: 'أَدْعِيَتِي',
    text: "The du'as of the day, from waking up to going to sleep. Hear them, learn them and keep your favourites.",
  },
  {
    id: 'sunnah', worlds: ['hadith', 'akhlaq'], kind: 'deen', view: 'sunnah', icon: 'sunnah', group: 'lessons', suggested: [1, 2, 3, 4],
    title: 'Sunnah of the Day', ar: 'سُنَّةُ ٱلْيَوْم',
    text: 'One thing the Prophet ﷺ did or taught, to do today. It is also your character mission.',
  },
  {
    id: 'prophet', worlds: ['seerah', 'akhlaq', 'hadith'], kind: 'deen', view: 'prophet', icon: 'prophet', group: 'lessons', suggested: [1, 2, 3, 4],
    title: 'Our Prophet ﷺ', ar: 'نَبِيُّنَا ﷺ',
    text: 'His character, a day lived his way, and the main moments of his life, from the Qur\'an and sound hadith.',
  },
  {
    id: 'days', worlds: ['dua', 'seerah'], kind: 'deen', view: 'days', icon: 'calendar', group: 'lessons',
    title: 'Special Days', ar: 'أَيَّامٌ مُبَارَكَة',
    text: 'Today\'s Hijri date, Jumu\'ah, Ramadan, the two Eids and the other blessed days, with what the Prophet ﷺ taught about them.',
  },
  // Play & Learn (the Ta'aleem Interactive Learning Proposal). `suggested`: the levels the proposal suggests it for;
  // every level can play, and the game adjusts to the student's level.
  { id: 'detective', worlds: ['arabic'], kind: 'play', game: 'detective', icon: 'detective', group: 'play', suggested: [1, 2],
    title: 'Arabic Letter Detective', ar: 'مُحَقِّقُ ٱلْحُرُوف', text: 'Listen, look and find the letter. Open the alphabet garden part by part.' },
  { id: 'ayah', worlds: ['quran'], kind: 'play', game: 'ayah', icon: 'ayah', group: 'play', suggested: [2, 3, 4],
    title: 'Build the Ayah', ar: 'رَتِّبِ ٱلْآيَة', text: 'Put the words of an ayah in order, find the missing word, choose what comes next.' },
  { id: 'match', worlds: ['tawheed', 'dua'], kind: 'play', game: 'match', icon: 'match', group: 'play', suggested: [1, 2, 3, 4],
    title: 'Match the Deen', ar: 'طَابِقْ', text: 'Turn the cards and find the pairs: Names of Allah, words, Prophets, duas.' },
  { id: 'journey', worlds: ['seerah'], kind: 'play', game: 'journey', icon: 'journey', group: 'play', suggested: [1, 2, 3, 4],
    title: 'Journey to Knowledge', ar: 'رِحْلَةُ ٱلْعِلْم', text: 'Answer questions to travel through four places of learning.' },
  { id: 'salah', worlds: ['dua'], kind: 'play', game: 'salah', icon: 'salah', group: 'play', suggested: [1, 2, 3, 4],
    title: 'Salah Master', ar: 'ٱلصَّلَاة', text: 'The steps of the prayer in order, what we say, and when.' },
  { id: 'akhlaq', worlds: ['akhlaq'], kind: 'play', game: 'akhlaq', icon: 'akhlaq', group: 'play', suggested: [1, 2, 3, 4],
    title: 'Akhlaq Heroes', ar: 'أَبْطَالُ ٱلْأَخْلَاق', text: 'What would you do? Good choices grow your kindness garden.' },
  // Play & Make (src/lib/games/): games and activities with ideas from printable worksheets, all written and drawn anew.
  { id: 'maze-hijrah', worlds: ['seerah'], kind: 'games', game: 'maze-hijrah', icon: 'maze', group: 'play', suggested: [1, 2, 3, 4],
    title: 'Makkah to Madinah', ar: 'مِنْ مَكَّةَ إِلَى الْمَدِينَةِ', text: 'Guide the camel through a maze to Madinah. Dead ends hide a munching monster, and from Level 2 the walls move!' },
  { id: 'maze-tarawih', worlds: ['dua'], kind: 'games', game: 'maze-tarawih', icon: 'mazeNight', group: 'play', suggested: [1, 2, 3, 4],
    title: 'To the masjid for Tarawih', ar: 'إِلَى صَلَاةِ التَّرَاوِيحِ', text: 'A Ramadan night maze: carry the lantern to the masjid, and keep away from the dead ends.' },
  { id: 'maze-board', worlds: ['seerah', 'dua'], kind: 'games', game: 'maze-board', icon: 'trophy', group: 'play', suggested: [1, 2, 3, 4],
    title: 'Maze leaderboard', ar: 'لَوْحَةُ ٱلْأَبْطَالِ', text: 'See who in your class has reached the highest maze stage, and how fast.' },
  // The Seerah Quest: a 3D journey through the history before the Prophet ﷺ, from Ibn Kathir's al-Bidaya wa'l-Nihaya only.
  { id: 'seerah', worlds: ['seerah'], kind: 'seerah', icon: 'seerah', group: 'play', levels: [3, 4], suggested: [3, 4],
    title: 'The Seerah Quest', ar: 'رِحْلَةُ ٱلسِّيرَة', text: 'Walk through Makkah before the Prophet ﷺ: the well of Zamzam and the Year of the Elephant, told only from Ibn Kathir.' },
  // Guardians of Light: read to the Sheikh, and each reading restores the light of the valley of Noor (src/lib/guardians/).
  { id: 'guardians', worlds: ['quran'], kind: 'guardians', icon: 'beacon', group: 'hifz', levels: [2, 3, 4], suggested: [2, 3, 4],
    title: 'Guardians of Light', ar: 'حُرَّاسُ ٱلنُّور', text: 'Read to the Sheikh, and bring the light back to the valley of Noor, one adventure at a time.' },
];

// The learning worlds: one subject each, a strand that runs from Level 1 to Level 4 (docs/CURRICULUM_PATH.md).
export const WORLDS = [
  { id: 'quran', title: 'Qur’an', ar: 'ٱلْقُرْآن', text: 'Recite, memorise and build the ayat.' },
  { id: 'arabic', title: 'Arabic', ar: 'ٱلْعَرَبِيَّة', text: 'Letters, sounds and reading.' },
  { id: 'tawheed', title: 'Tawheed', ar: 'ٱلتَّوْحِيد', text: 'Knowing Allah, the One.' },
  { id: 'seerah', title: 'Seerah', ar: 'ٱلسِّيرَة', text: 'The life and times of the Prophet ﷺ.' },
  { id: 'hadith', title: 'Hadith', ar: 'ٱلْحَدِيث', text: 'His words ﷺ, a story at a time.' },
  { id: 'akhlaq', title: 'Akhlaq', ar: 'ٱلْأَخْلَاق', text: 'Good character, at home and at school.' },
  { id: 'dua', title: 'Du’a & Salah', ar: 'ٱلدُّعَاء وَٱلصَّلَاة', text: 'How we pray and what we say.' },
];

// Each activity's icon: the Classroom's painted icons (src/lib/home-icons.mjs), one family across the app.
// [painting, tone of the star behind it]
const ICON_ART = {
  tajweed: ['tajweed', 'forest'], beacon: ['lantern', 'gold'], prophets: ['prophets', 'sand'], tawheed: ['tawheed', 'gold'],
  hifz: ['hifz', 'sage'], mushaf: ['quran', 'sage'], lantern: ['lantern', 'gold'], detective: ['detective', 'sand'], ayah: ['ayah', 'gold'],
  match: ['match', 'sage'], journey: ['journey', 'sand'], salah: ['salah', 'clay'], akhlaq: ['akhlaq', 'clay'], library: ['library', 'sand'],
  books: ['books', 'sage'], stories: ['stories', 'clay'], seerah: ['seerah', 'sand'], dua: ['duas', 'sage'], sunnah: ['sunnah', 'gold'],
  prophet: ['prophet', 'sage'], calendar: ['days', 'stone'], garden: ['garden', 'sage'], awards: ['awards', 'gold'], maze: ['mazes', 'sand'],
  trophy: ['trophy', 'gold'], mazeNight: ['mazes', 'forest'], soon: ['soon', 'stone'],
};
export const ICONS = Object.fromEntries(Object.entries(ICON_ART).map(([k, [n, t]]) => [k, icon(n, t)]));

export const forLevel = (level) => ACTIVITIES.filter((a) => !a.levels || a.levels.includes(level));
