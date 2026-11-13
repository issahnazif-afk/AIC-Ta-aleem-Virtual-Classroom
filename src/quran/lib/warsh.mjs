// The Warsh classroom's lessons (src/pages/quran/warsh/). One lesson for each kind of difference that
// scripts/quran/riwayah-diff.mjs finds between the official KFGQPC Ḥafṣ and Warsh mushaf texts; its examples and
// counts come from public/quran/data/riwayah/warsh-lessons.json, worked out from those two texts.
//
// The short explanations describe what the official Warsh mushaf shows. They have NOT yet been reviewed by a qāriʾ
// with ijāzah in Warsh (the page says so). Rulings, exceptions and the madd lengths are left to the recitation of the
// reciters and to that review.
//
// check: what the Sheikh can check when the student recites, with today's listening model
//   'word'  the letters differ, so the model can tell the Warsh word from the Ḥafṣ word
//   'ear'   the difference is in how the word is said (a vowel, a softened hamzah, taqlīl): the student compares by ear
export const LESSONS = [
  {
    id: 'mim', ar: 'صِلَةُ مِيمِ ٱلْجَمْعِ', en: 'The plural mīm joined to a wāw', check: 'ear',
    about: 'Where Ḥafṣ reads the plural mīm (ـهُمْ، ـكُمْ، ـتُمْ) with a sukūn, Warsh joins it to a wāw sound (ـهُمُو) when the next word begins with a hamzah. The Warsh mushaf writes this as ـمُۥٓ.',
    listen: 'Listen for the long “mū” at the end of the word, running into the hamzah of the next word.',
  },
  {
    id: 'naql', ar: 'نَقْلُ حَرَكَةِ ٱلْهَمْزِ', en: 'Moving the hamzah’s vowel back (naql)', check: 'ear',
    about: 'When a word ends in a consonant and the next word begins with a hamzah, Warsh drops the hamzah and gives its vowel to the consonant before it: وَٱلْأَرْضِ is read وَالَارْضِ, and قَدْ أَفْلَحَ is read قَدَ اَفْلَحَ. The Warsh mushaf writes the hamzah’s alif bare, with no hamzah sign.',
    listen: 'Listen to the consonant before the hamzah: it carries the vowel, and there is no catch of a hamzah.',
  },
  {
    id: 'ibdal', ar: 'إِبْدَالُ ٱلْهَمْزِ', en: 'A hamzah changed into a vowel letter (ibdāl)', check: 'ear',
    about: 'In many words Warsh changes a hamzah into a long vowel: يُؤْمِنُونَ is read يُومِنُونَ, and يَأْتِي is read يَاتِي. The Warsh mushaf writes the vowel letter in place of the hamzah.',
    listen: 'Listen for a smooth long vowel where Ḥafṣ has the stop of a hamzah.',
  },
  {
    id: 'tashil', ar: 'تَسْهِيلُ ٱلْهَمْزِ', en: 'Easing the second of two hamzahs (tashīl)', check: 'ear',
    about: 'Where two hamzahs meet across two words, Warsh eases the second one: it is read lightly, between a hamzah and a vowel letter. The Warsh mushaf marks the eased hamzah with a dot instead of the hamzah sign.',
    listen: 'Listen to the second hamzah: it is softened, not cut sharply.',
  },
  {
    id: 'imalah', ar: 'ٱلتَّقْلِيلُ وَٱلْإِمَالَةُ', en: 'Leaning the alif towards yāʾ (taqlīl and imālah)', check: 'ear',
    about: 'Warsh reads many alifs with taqlīl: a sound between a clear “ā” and “ē”, for example in words ending in ـىٰ (مُوسَىٰ، ٱلضُّحَىٰ) and in some alifs before a final rāʾ with kasrah. The Warsh mushaf marks these with a dot under the letter.',
    listen: 'Listen to the alif: it leans towards “ē” instead of a full “ā”.',
  },
  {
    id: 'ya', ar: 'يَاءَاتُ ٱلْإِضَافَةِ', en: 'The yāʾ of “my” and “me” read with a fatḥah', check: 'ear',
    about: 'In many places Warsh reads the first-person yāʾ (my, me) with a fatḥah where Ḥafṣ reads it silent: إِنِّيٓ أَعْلَمُ is read إِنِّيَ أَعْلَمُ.',
    listen: 'Listen for the short “ya” at the end of the word.',
  },
  {
    id: 'zawaid', ar: 'ٱلْيَاءَاتُ ٱلزَّوَائِدُ', en: 'An extra yāʾ when reading on', check: 'ear',
    about: 'In some words Warsh adds a yāʾ at the end that is not written in the rasm, when reading on to the next word: ٱلدَّاعِ is read ٱلدَّاعِي. The Warsh mushaf writes it as a small yāʾ.',
    listen: 'Listen for the long “ī” at the end of the word when the reciter carries on.',
  },
  {
    id: 'letters', ar: 'فَرْشُ ٱلْحُرُوفِ: ٱلْكَلِمَاتُ', en: 'Words with different letters', check: 'word',
    about: 'In some words Nāfiʿ’s reading, which Warsh transmits, has different letters from Ḥafṣ: مَٰلِكِ is read مَلِكِ, and some verbs change person (تَعْمَلُونَ / يَعْمَلُونَ). These are learnt word by word.',
    listen: 'Listen for the different word, and read it as the Warsh mushaf writes it.',
  },
  {
    id: 'vowels', ar: 'فَرْشُ ٱلْحُرُوفِ: ٱلْحَرَكَاتُ', en: 'Words with different vowels', check: 'ear',
    about: 'Some words keep their letters but change their vowels or doubling in Warsh: ٱلرُّجْزَ is read ٱلرِّجْزَ, and يَتَّبِعُهُمُ is read يَتْبَعُهُمُ. These are also learnt word by word.',
    listen: 'Listen to the vowels of the highlighted word.',
  },
];

// The Warsh reciters, āyah by āyah, from EveryAyah.com (the same source as the library's Ḥafṣ recitations).
export const WARSH_RECITERS = [
  { id: 'warsh/warsh_yassin_al_jazaery_64kbps', name: 'Yassin al-Jazaery' },
  { id: 'warsh/warsh_ibrahim_aldosary_128kbps', name: 'Ibrahim al-Dosary' },
  { id: 'warsh/warsh_Abdul_Basit_128kbps', name: 'Abdul Basit ʿAbd al-Ṣamad (Warsh)' },
];
