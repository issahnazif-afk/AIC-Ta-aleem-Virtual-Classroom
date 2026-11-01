// The Classroom's activities. The Classroom home shows one card per entry, in this order.
//
// To add an activity later:
//   1. add an entry here,
//   2. if it is a new kind of screen, open it in openActivity() in src/pages/index.astro.
// An entry with  kind: 'soon'  shows as "Coming soon" until it is ready.
//
//   id      unique name
//   kind    'recite' (camera, set-up, the Sheikh listens) | 'alifba' (letters and games) | 'play' (a Play & Learn game) | 'seerah' (the Seerah Quest) | 'soon'
//   group   where it sits on the dashboard: 'hifz' (My Hifz) | 'lessons' (My Lessons) | 'play' (Play & Learn)
//   game    for 'play': detective | ayah | match | journey | salah | akhlaq (src/lib/play.mjs)
//   mode    for 'recite': 'hifz' or 'reading'
//   levels  which classes see it (leave out for all)

export const ACTIVITIES = [
  {
    id: 'hifz', kind: 'recite', mode: 'hifz', icon: 'hifz', group: 'hifz',
    title: 'Hifz test', ar: 'اِخْتِبَارُ ٱلْحِفْظ',
    text: 'The Sheikh recites the opening of an ayah. You carry on from memory until he stops you.',
  },
  {
    id: 'reading', kind: 'recite', mode: 'reading', icon: 'mushaf', group: 'hifz',
    title: 'Mujawwadah', ar: 'ٱلْمُجَوَّدَة',
    text: 'Read aloud from the mushaf page while the Sheikh follows every word.',
  },
  {
    id: 'alifba', kind: 'alifba', icon: 'lantern', group: 'lessons',
    title: 'Alif Ba', ar: 'أَلِف بَاء',
    text: 'Eighteen lessons, from the letters to tajweed and the short surahs, each with a game.',
  },
  // Play & Learn (the AICWIS Interactive Learning Proposal). `suggested`: the levels the proposal suggests it for;
  // every level can play, and the game adjusts to the student's level.
  { id: 'detective', kind: 'play', game: 'detective', icon: 'detective', group: 'play', suggested: [1, 2],
    title: 'Arabic Letter Detective', ar: 'مُحَقِّقُ ٱلْحُرُوف', text: 'Listen, look and find the letter. Open the alphabet garden part by part.' },
  { id: 'ayah', kind: 'play', game: 'ayah', icon: 'ayah', group: 'play', suggested: [2, 3, 4],
    title: 'Build the Ayah', ar: 'رَتِّبِ ٱلْآيَة', text: 'Put the words of an ayah in order, find the missing word, choose what comes next.' },
  { id: 'match', kind: 'play', game: 'match', icon: 'match', group: 'play', suggested: [1, 2, 3, 4],
    title: 'Match the Deen', ar: 'طَابِقْ', text: 'Turn the cards and find the pairs: Names of Allah, words, Prophets, duas.' },
  { id: 'journey', kind: 'play', game: 'journey', icon: 'journey', group: 'play', suggested: [1, 2, 3, 4],
    title: 'Journey to Knowledge', ar: 'رِحْلَةُ ٱلْعِلْم', text: 'Answer questions to travel through four places of learning.' },
  { id: 'salah', kind: 'play', game: 'salah', icon: 'salah', group: 'play', suggested: [1, 2, 3, 4],
    title: 'Salah Master', ar: 'ٱلصَّلَاة', text: 'The steps of the prayer in order, what we say, and when.' },
  { id: 'akhlaq', kind: 'play', game: 'akhlaq', icon: 'akhlaq', group: 'play', suggested: [1, 2, 3, 4],
    title: 'Akhlaq Heroes', ar: 'أَبْطَالُ ٱلْأَخْلَاق', text: 'What would you do? Good choices grow your kindness garden.' },
  // The Seerah Quest: a 3D journey through the history before the Prophet ﷺ, from Ibn Kathir's al-Bidaya wa'l-Nihaya only.
  { id: 'seerah', kind: 'seerah', icon: 'seerah', group: 'play', levels: [3, 4], suggested: [3, 4],
    title: 'The Seerah Quest', ar: 'رِحْلَةُ ٱلسِّيرَة', text: 'Walk through Makkah before the Prophet ﷺ: the well of Zamzam and the Year of the Elephant, told only from Ibn Kathir.' },
];

export const ICONS = {
  hifz: '<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true"><path d="M8 14 Q20 10 32 16 Q44 10 56 14 V50 Q44 46 32 52 Q20 46 8 50 Z" fill="#E6F2EC" stroke="#0E6B4E" stroke-width="2.5"/><path d="M32 16 V52" stroke="#0E6B4E" stroke-width="2"/><circle cx="46" cy="22" r="9" fill="#FBE3A6" stroke="#C9A24A" stroke-width="2"/><path d="M42 22 l3 3 5-6" fill="none" stroke="#0E6B4E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  mushaf: '<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true"><path d="M6 18 Q19 13 32 19 Q45 13 58 18 V52 Q45 47 32 53 Q19 47 6 52 Z" fill="#FFFDF7" stroke="#C9A24A" stroke-width="2.5"/><path d="M32 19 V53" stroke="#C9A24A" stroke-width="2"/><g stroke="#0E6B4E" stroke-width="2" stroke-linecap="round"><path d="M12 26 H26 M12 32 H26 M12 38 H24 M38 26 H52 M38 32 H52 M40 38 H52"/></g><path d="M20 58 L32 50 L44 58" fill="none" stroke="#8A5A12" stroke-width="2.5" stroke-linecap="round"/></svg>',
  lantern: '<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true"><path d="M32 2 V9" stroke="#C9A24A" stroke-width="2"/><path d="M24 9 H40 L37 15 H27 Z" fill="#C9A24A"/><path d="M26 15 H38 L46 33 L38 52 H26 L18 33 Z" fill="#FBE3A6" stroke="#C9A24A" stroke-width="2.5"/><text x="32" y="40" text-anchor="middle" font-family="KFGQPC Hafs, Amiri, serif" font-size="20" fill="#0F2A24">ب</text><path d="M28 52 H36 L34 58 H30 Z" fill="#C9A24A"/></svg>',
  detective: '<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true"><circle cx="27" cy="27" r="15" fill="#FFFDF7" stroke="#0E6B4E" stroke-width="3"/><path d="M38 38 L54 54" stroke="#0E6B4E" stroke-width="5" stroke-linecap="round"/><text x="27" y="34" text-anchor="middle" font-family="Amiri, serif" font-size="20" fill="#8A5A12">ج</text></svg>',
  ayah: '<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true"><rect x="6" y="14" width="22" height="14" rx="5" fill="#FBE3A6" stroke="#C9A24A" stroke-width="2"/><rect x="34" y="14" width="24" height="14" rx="5" fill="#E6F2EC" stroke="#0E6B4E" stroke-width="2"/><rect x="14" y="36" width="36" height="14" rx="5" fill="#FFFDF7" stroke="#C9A24A" stroke-width="2" stroke-dasharray="4 3"/><path d="M45 31 L39 37" stroke="#0E6B4E" stroke-width="2.5" stroke-linecap="round"/></svg>',
  match: '<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true"><rect x="8" y="12" width="22" height="30" rx="4" fill="#0E6B4E" transform="rotate(-8 19 27)"/><rect x="32" y="18" width="22" height="30" rx="4" fill="#FBE3A6" stroke="#C9A24A" stroke-width="2" transform="rotate(8 43 33)"/><path d="M38 33 l4 4 7-8" fill="none" stroke="#0E6B4E" stroke-width="2.5" stroke-linecap="round"/></svg>',
  journey: '<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true"><path d="M8 52 Q20 30 32 40 T56 14" fill="none" stroke="#C9A24A" stroke-width="3" stroke-dasharray="3 6" stroke-linecap="round"/><circle cx="8" cy="52" r="5" fill="#0E6B4E"/><circle cx="32" cy="40" r="5" fill="#0E6B4E"/><path d="M50 6 L58 6 L58 20 L54 16 L50 20 Z" fill="#8A5A12"/></svg>',
  salah: '<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true"><path d="M10 54 H54 V50 Q32 42 10 50 Z" fill="#0E6B4E"/><path d="M14 50 V22 Q32 8 50 22 V50" fill="#E6F2EC" stroke="#C9A24A" stroke-width="2.5"/><path d="M32 14 V8 M29 10 H35" stroke="#C9A24A" stroke-width="2"/></svg>',
  akhlaq: '<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true"><path d="M32 54 C 10 40 6 26 16 18 C 24 12 30 18 32 22 C 34 18 40 12 48 18 C 58 26 54 40 32 54 Z" fill="#FBE3A6" stroke="#C9A24A" stroke-width="2.5"/><path d="M32 46 V30 M32 36 Q24 32 24 26 M32 34 Q40 30 40 24" stroke="#0E6B4E" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>',
  seerah: '<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true"><path d="M2 50 L18 30 L28 40 L40 22 L62 50 Z" fill="#E8D6B0" stroke="#C9A24A" stroke-width="2"/><rect x="24" y="36" width="16" height="16" fill="#0F2A24"/><path d="M24 40 H40" stroke="#C9A24A" stroke-width="2.5"/><circle cx="50" cy="12" r="6" fill="#FBE3A6"/><path d="M2 56 H62" stroke="#0E6B4E" stroke-width="3"/></svg>',
  soon: '<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true"><circle cx="32" cy="32" r="24" fill="#F7F8F6" stroke="#B9C3BE" stroke-width="2.5"/><path d="M32 20 V33 L40 38" fill="none" stroke="#4F5B56" stroke-width="2.5" stroke-linecap="round"/></svg>',
};

export const forLevel = (level) => ACTIVITIES.filter((a) => !a.levels || a.levels.includes(level));
