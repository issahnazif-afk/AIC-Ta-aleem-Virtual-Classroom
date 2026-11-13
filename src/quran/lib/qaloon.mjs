// The Qālūn classroom's lessons (src/pages/quran/qaloon/). One lesson for each kind of difference that
// scripts/quran/riwayah-diff.mjs finds between the official KFGQPC Ḥafṣ and Qālūn mushaf texts; its examples and
// counts come from public/quran/data/riwayah/qaloon-lessons.json, worked out from those two texts.
//
// The short explanations describe what the official Qālūn mushaf shows. They have NOT yet been reviewed by a qāriʾ
// with ijāzah in Qālūn (the page says so). Where Qālūn has two transmitted ways (the separated madd, the plural
// mīm), the page says so and leaves the choice to the student's teacher.
//
// check: what the Sheikh can check when the student recites (see warsh.mjs)
export const LESSONS = [
  {
    id: 'qasr', ar: 'قَصْرُ ٱلْمَدِّ ٱلْمُنْفَصِلِ', en: 'The separated madd read short (qaṣr)', check: 'ear',
    about: 'When a word ends in a long vowel and the next word begins with a hamzah (بِمَآ أُنزِلَ، يَٰٓأَيُّهَا), Ḥafṣ stretches the long vowel to four or five counts. The official Qālūn mushaf leaves out the madd sign there: the long vowel keeps its natural length of two counts (بِمَا أُنزِلَ، يَٰأَيُّهَا). Qālūn is also transmitted with a moderate lengthening here; listen to which one your reciter uses. A madd inside one word (جَآءَ، ٱلسَّمَآءِ) is stretched as in Ḥafṣ.',
    listen: 'Listen to the long vowel before the hamzah: it is short, two counts, not stretched.',
  },
  {
    id: 'idkhal', ar: 'ٱلْهَمْزَتَانِ مِنْ كَلِمَةٍ', en: 'Two hamzahs in one word (tashīl and idkhāl)', check: 'ear',
    about: 'Where a word begins with two hamzahs (ءَأَنذَرْتَهُمْ، ءَأَنتَ، أَءِذَا), Qālūn eases the second one, reading it lightly between a hamzah and a vowel letter, and puts an alif between the two (idkhāl). The official Qālūn mushaf writes a small alif after the first hamzah and marks the eased one: ءَٰا۬نذَرْتَهُمْ، أَٰ۟ذَا.',
    listen: 'Listen for the long “ā” after the first hamzah, then a soft second hamzah.',
  },
  {
    id: 'tashil', ar: 'ٱلْهَمْزَتَانِ مِنْ كَلِمَتَيْنِ', en: 'Two hamzahs meeting across two words', check: 'ear',
    about: 'When one word ends in a hamzah and the next begins with one, Qālūn does not say both fully. If both have a fatḥah, the first is dropped: جَآءَ أَمْرُنَا is read جَا أَمْرُنَا. If both have a kasrah or both a ḍammah, the first is eased (وَرَآءِ إِسْحَٰقَ). If the two vowels differ, the second is eased or turned into a wāw or yāʾ (نَبَأَ إِبْرَٰهِيمَ). The official Qālūn mushaf shows each of these.',
    listen: 'Listen where the two words meet: only one hamzah is said clearly.',
  },
  {
    id: 'ibdal', ar: 'كَلِمَاتٌ تَخْتَلِفُ فِي ٱلْهَمْزِ', en: 'Words where the hamzah differs', check: 'ear',
    about: 'In some words Qālūn says the hamzah differently from Ḥafṣ. It may be eased (أَرَءَيْتَ is read with a light hamzah), left out (سَأَلَ is read سَالَ, مُّؤْصَدَةٌ is read مُّوصَدَةٌ), or said where Ḥafṣ has none (ٱلْأَنۢبِيَآءَ is read ٱلْأَنۢبِئَآءَ). These are learnt word by word.',
    listen: 'Listen to the hamzah in the highlighted word: softened, left out, or added.',
  },
  {
    id: 'imalah', ar: 'حَرَكَاتٌ تُقْرَأُ بِلُطْفٍ', en: 'Vowels said lightly (ishmām and ikhtilās)', check: 'ear',
    about: 'In a few words the official Qālūn mushaf puts a dot on a letter to show a vowel said only partly. In سِيٓءَ and سِيٓـَٔتْ the kasrah of the sīn is mixed with a trace of ḍammah (ishmām). In يَخِصِّمُونَ, يَهِدِّي, نِعِمَّا and تَعْدُوا the vowel is said quickly and lightly (ikhtilās). In هَارٍ the alif leans towards “ē” (imālah).',
    listen: 'Listen closely to the dotted letter: its vowel is only partly said.',
  },
  {
    id: 'ya', ar: 'يَاءَاتُ ٱلْإِضَافَةِ', en: 'The yāʾ of “my” and “me”', check: 'ear',
    about: 'In many places Qālūn reads the first-person yāʾ (my, me) with a fatḥah where Ḥafṣ reads it silent: إِنِّيٓ أَعْلَمُ is read إِنِّيَ أَعْلَمُ. In a few places it is the other way round (مَعِيَ is read مَعِي).',
    listen: 'Listen for the short “ya” at the end of the word.',
  },
  {
    id: 'zawaid', ar: 'ٱلْيَاءَاتُ ٱلزَّوَائِدُ', en: 'An extra yāʾ when reading on', check: 'ear',
    about: 'In some words Qālūn adds a yāʾ at the end that is not written in the rasm, when reading on to the next word: ٱلدَّاعِ is read ٱلدَّاعِي. The Qālūn mushaf writes it as a small yāʾ.',
    listen: 'Listen for the long “ī” at the end of the word when the reciter carries on.',
  },
  {
    id: 'letters', ar: 'فَرْشُ ٱلْحُرُوفِ: ٱلْكَلِمَاتُ', en: 'Words with different letters', check: 'word',
    about: 'In some words Nāfiʿ’s reading, which Qālūn transmits, has different letters from Ḥafṣ: مَٰلِكِ is read مَلِكِ, وَتَوَكَّلْ is read فَتَوَكَّلْ, and some verbs change person (يَدْعُونَ / تَدْعُونَ). These are learnt word by word.',
    listen: 'Listen for the different word, and read it as the Qālūn mushaf writes it.',
  },
  {
    id: 'vowels', ar: 'فَرْشُ ٱلْحُرُوفِ: ٱلْحَرَكَاتُ', en: 'Words with different vowels', check: 'ear',
    about: 'Some words keep their letters but change their vowels in Qālūn: ٱلرُّجْزَ is read ٱلرِّجْزَ, نَزَّاعَةً is read نَزَّاعَةٌ, and وَهُوَ is read وَهْوَ (the hāʾ of هُوَ and هِيَ is silent after wa, fa and la). These are also learnt word by word.',
    listen: 'Listen to the vowels of the highlighted word.',
  },
];

// The Qālūn reciters: whole-sūrah recordings from mp3quran.net, with the time of every āyah published by mp3quran
// (api/v3/ayat_timing), so one āyah can be played on its own. Āyāt are numbered by the Madanī count.
export const QALOON_RECITERS = [
  { id: '270', name: 'Maḥmūd Khalīl al-Ḥuṣarī (Qālūn)', folder: 'https://cdn.mp3quran.net/audio/mahmoud-husary/r5/' },
  { id: '75', name: 'ʿAlī al-Ḥudhayfī (Qālūn)', folder: 'https://cdn.mp3quran.net/audio/ali-hudhaifi/r2/' },
  { id: '208', name: 'ad-Dūkālī Muḥammad al-ʿĀlim', folder: 'https://cdn.mp3quran.net/audio/dokali-alim/r1/' },
];
