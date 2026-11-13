// The riwāyah classroom's course (src/pages/quran/riwayat/): for each riwāyah, the topics the Sheikh teaches in
// order, what he says (say: plain English, recorded in his voice at build time, scripts/voice/narration-list.mjs) and
// what he writes on the board (chalk: a short handwritten line; ar: Arabic in chalk). The Arabic examples of each
// topic (Ḥafṣ → the riwāyah) come from the official KFGQPC texts: data/riwayah/<id>-lessons.json, built by
// scripts/quran/riwayah-diff.mjs. Nothing Arabic in the examples is typed by hand.
//
// The explanations describe what the official mushaf of each riwāyah shows. They have NOT yet been reviewed by a
// teacher with ijāzah in these riwāyāt (the classroom says so). Where a riwāyah is transmitted two ways, the topic
// says so and leaves the choice to the student's teacher.
//
// check: what the Sheikh can check when the student recites with today's listening model
//   'word' the letters differ, so the Sheikh can tell the riwāyah's word from the Ḥafṣ word
//   'ear'  the difference is in how the word is said: the student compares their recording with the reciter

export const RIWAYAT = {
  warsh: { short: 'Warsh', say: 'Warsh', ar: 'رِوَايَةُ وَرْشٍ عَنْ نَافِعٍ', imam: 'Nāfiʿ of Madinah', line: 'Nāfiʿ (Madinah, d. 169 AH) → Warsh (Egypt, d. 197 AH)', today: 'North and West Africa' },
  qaloon: { short: 'Qālūn', say: 'Qaloon', ar: 'رِوَايَةُ قَالُونَ عَنْ نَافِعٍ', imam: 'Nāfiʿ of Madinah', line: 'Nāfiʿ (Madinah, d. 169 AH) → Qālūn (Madinah, d. 220 AH)', today: 'Libya and Tunisia' },
  doori: { short: 'ad-Dūrī', say: 'ad-Doori', ar: 'رِوَايَةُ ٱلدُّورِيِّ عَنْ أَبِي عَمْرٍو', imam: 'Abū ʿAmr of Basra', line: 'Abū ʿAmr (Basra, d. 154 AH) → al-Yazīdī → ad-Dūrī (d. 246 AH)', today: 'Sudan and parts of West Africa' },
  soosi: { short: 'as-Sūsī', say: 'as-Soosi', ar: 'رِوَايَةُ ٱلسُّوسِيِّ عَنْ أَبِي عَمْرٍو', imam: 'Abū ʿAmr of Basra', line: 'Abū ʿAmr (Basra, d. 154 AH) → al-Yazīdī → as-Sūsī (d. 261 AH)', today: 'taught and recited by qurrāʾ in many lands' },
  shouba: { short: 'Shuʿbah', say: 'Shoubah', ar: 'رِوَايَةُ شُعْبَةَ عَنْ عَاصِمٍ', imam: 'ʿĀṣim of Kufa', line: 'ʿĀṣim (Kufa, d. 127 AH) → Shuʿbah (Kufa, d. 193 AH)', today: 'taught alongside Ḥafṣ, from the same imām' },
  bazzi: { short: 'al-Bazzī', say: 'al-Bazzi', ar: 'رِوَايَةُ ٱلْبَزِّيِّ عَنِ ٱبْنِ كَثِيرٍ', imam: 'Ibn Kathīr of Makkah', line: 'Ibn Kathīr (Makkah, d. 120 AH) → al-Bazzī (Makkah, d. 250 AH)', today: 'taught and recited by qurrāʾ in many lands' },
};

// the first topic of every riwāyah: who transmitted it
const INTRO = {
  warsh: [
    ['Bismillah. Today we begin the riwayah of Warsh, from Imam Nafi of Madinah.', 'Warsh ʿan Nāfiʿ'],
    ['Imam Nafi was the great Quran teacher of Madinah. Warsh, Uthman ibn Saeed of Egypt, travelled to him and learnt his reading.', 'Nāfiʿ (Madinah, d. 169 AH) → Warsh (Egypt, d. 197 AH)'],
    ['Today Warsh is recited across North and West Africa. It is the same Quran: the differences are in how some words are said, and in a few words.', 'Read today: North & West Africa'],
  ],
  qaloon: [
    ['Bismillah. Today we begin the riwayah of Qaloon, from Imam Nafi of Madinah.', 'Qālūn ʿan Nāfiʿ'],
    ['Qaloon, Eesa ibn Meena, was a student of Imam Nafi in Madinah, and his stepson. Nafi gave him this name, which means good.', 'Nāfiʿ (d. 169 AH) → Qālūn (Madinah, d. 220 AH)'],
    ['Today Qaloon is recited in Libya and Tunisia. It is close to Warsh, as both come from Nafi, but lighter in its hamzahs and its long vowels.', 'Read today: Libya & Tunisia'],
  ],
  doori: [
    ['Bismillah. Today we begin the riwayah of ad-Doori, from Imam Abu Amr of Basra.', 'ad-Dūrī ʿan Abī ʿAmr'],
    ['Abu Amr was the imam of the readers of Basra. His student al-Yazeedi taught his reading to ad-Doori.', 'Abū ʿAmr → al-Yazīdī → ad-Dūrī (d. 246 AH)'],
    ['Today ad-Doori is recited in Sudan and parts of West Africa. You will notice the leaning alif, and letters that merge.', 'Read today: Sudan & West Africa'],
  ],
  soosi: [
    ['Bismillah. Today we begin the riwayah of as-Soosi, from Imam Abu Amr of Basra.', 'as-Sūsī ʿan Abī ʿAmr'],
    ['As-Soosi learnt the reading of Abu Amr from al-Yazeedi, as ad-Doori did. The two share most rules.', 'Abū ʿAmr → al-Yazīdī → as-Sūsī (d. 261 AH)'],
    ['As-Soosi is known for the great merging, where a letter at the end of a word merges into the same letter at the start of the next.', 'Known for: the great merging (idghām kabīr)'],
  ],
  shouba: [
    ['Bismillah. Today we begin the riwayah of Shoubah, from Imam Aasim of Kufa.', 'Shuʿbah ʿan ʿĀṣim'],
    ['Aasim is the same imam as Hafs. Shoubah, Abu Bakr ibn Ayyash, was his other famous student.', 'ʿĀṣim (Kufa) → Ḥafṣ and Shuʿbah'],
    ['So Shoubah is the closest riwayah to Hafs. The differences are mostly in particular words, which we learn one by one.', 'Closest to Ḥafṣ: learnt word by word'],
  ],
  bazzi: [
    ['Bismillah. Today we begin the riwayah of al-Bazzi, from Imam Ibn Katheer of Makkah.', 'al-Bazzī ʿan Ibn Kathīr'],
    ['Ibn Katheer was the imam of the readers of Makkah. Al-Bazzi was a reader and muezzin of the Haram, who carried his reading.', 'Ibn Kathīr (Makkah, d. 120 AH) → al-Bazzī (d. 250 AH)'],
    ['You will hear the long vowels joined to the pronouns, and some doubled letters. Let us take them one at a time.', 'Long ū and ī after the pronouns'],
  ],
};

// a topic: { ar, en, check, listen, points: [[say, chalk]], ex: index of the point after which the examples are
// written on the board }. R: the riwāyah's spoken name.
function topic(kind, rw) {
  const R = RIWAYAT[rw].say;
  const T = {
    mim: rw === 'bazzi' ? {
      ar: 'صِلَةُ مِيمِ ٱلْجَمْعِ', en: 'The plural mīm joined to a long ū', check: 'ear',
      points: [
        ['In Hafs, the mim of the plural, as in alayhim and antum, has a sukoon.', 'Ḥafṣ: ـهِمْ ـكُمْ ـتُمْ (sukūn)'],
        [`${R} joins this mim to a long u before any letter with a vowel: alayhimoo, antumoo.`, 'al-Bazzī: ـهِمُو ـكُمُو + a moving letter'],
        ['Before a silent letter, as in alayhimul qitaal, the mim takes a short vowel only, as in Hafs.', 'not before a sukūn'],
      ],
      listen: 'Listen for the long “ū” after the mīm.',
    } : {
      ar: 'صِلَةُ مِيمِ ٱلْجَمْعِ', en: 'The plural mīm joined to a long ū', check: 'ear',
      points: [
        ['In Hafs, the mim of the plural, as in alayhim and antum, has a sukoon.', 'Ḥafṣ: ـهِمْ ـكُمْ (sukūn)'],
        [`${R} joins this mim to a long u, but only when the next word begins with a hamzah.`, 'Warsh: ـهُمُو + hamzah'],
      ],
      listen: 'Listen for the long “ū” at the end of the word, running into the hamzah.',
    },
    ha: {
      ar: 'صِلَةُ هَاءِ ٱلْكِنَايَةِ', en: 'The hāʾ of “him” joined to a long vowel', check: 'ear',
      points: [
        ['The pronoun ha, meaning him or it, after a silent letter: Hafs reads it short, as in feehi and minhu.', 'Ḥafṣ: فِيهِ  مِنْهُ (short)'],
        [`${R} reads it long: feehee, minhoo. The mushaf writes a small yaa or waaw after it.`, 'al-Bazzī: فِيهِۦ  مِنْهُۥ (long)'],
      ],
      listen: 'Listen for the long vowel after the hāʾ.',
    },
    naql: {
      ar: 'نَقْلُ حَرَكَةِ ٱلْهَمْزِ', en: 'Moving the hamzah’s vowel back (naql)', check: 'ear',
      points: [
        ['When a word ends in a silent letter and the next word begins with a hamzah, Warsh drops the hamzah.', 'silent letter + hamzah'],
        ['Its vowel moves back onto the silent letter: qad aflaha is read qada flaha, and al-ard is read alard.', 'قَدْ أَفْلَحَ → قَدَ اَفْلَحَ'],
        ['The Warsh mushaf writes the hamzah’s alif bare, with no hamzah sign.', 'bare alif = no hamzah'],
      ],
      listen: 'Listen to the letter before the hamzah: it carries the vowel, and there is no catch of a hamzah.',
    },
    qasr: {
      ar: 'قَصْرُ ٱلْمَدِّ ٱلْمُنْفَصِلِ', en: 'The separated madd read short', check: 'ear',
      points: [
        ['When a word ends in a long vowel and the next word begins with a hamzah, Hafs stretches the vowel four or five counts.', 'Ḥafṣ: بِمَآ أُنزِلَ  (4–5 counts)'],
        [`The official mushaf of ${R} leaves out the madd sign there: the vowel keeps its natural length, two counts.`, `${RIWAYAT[rw].short}: بِمَا أُنزِلَ  (2 counts)`],
        [rw === 'qaloon' || rw === 'soosi' ? `${R} is also transmitted with a moderate lengthening here. Ask your teacher which to use.` : 'A long vowel inside one word, before a hamzah, is still stretched, as in jaa-a and as-samaa-i.', rw === 'qaloon' || rw === 'soosi' ? 'also: moderate length (ask your teacher)' : 'inside one word: still long'],
      ],
      listen: 'Listen to the long vowel before the hamzah: two counts, not stretched.',
    },
    idkhal: {
      ar: 'ٱلْهَمْزَتَانِ مِنْ كَلِمَةٍ', en: 'Two hamzahs in one word', check: 'ear',
      points: [
        ['Some words begin with two hamzahs: a-andhartahum, a-anta, a-idhaa.', 'ءَأَنذَرْتَهُمْ  ءَأَنتَ  أَءِذَا'],
        [`${R} eases the second hamzah, saying it lightly, between a hamzah and a vowel letter.`, 'the second hamzah: eased (tashīl)'],
        [`And ${R} puts an alif between the two. The mushaf writes it as a small alif after the first hamzah.`, 'an alif between them (idkhāl)'],
      ],
      listen: 'Listen for the long “ā” after the first hamzah, then a soft second hamzah.',
    },
    tashil: {
      ar: 'ٱلْهَمْزَتَانِ مِنْ كَلِمَتَيْنِ', en: 'Two hamzahs meeting across two words', check: 'ear',
      points: rw === 'warsh' ? [
        ['When one word ends in a hamzah and the next begins with one, Warsh keeps the first and eases the second.', 'hamzah | hamzah → the second eased'],
        ['The eased hamzah is said lightly. The Warsh mushaf marks it with a dot instead of the hamzah sign.', 'dot = eased hamzah'],
      ] : [
        [`When one word ends in a hamzah and the next begins with one, ${R} does not say both fully.`, 'hamzah | hamzah'],
        [rw === 'doori' || rw === 'soosi' ? 'If the two have the same vowel, Abu Amr drops the first: jaa-a amruna is read jaa amruna.' : `If both have a fatha, the first is dropped: jaa-a amruna is read jaa amruna. With two kasras or two dammas, the first is eased.`, 'same vowel → the first dropped or eased'],
        ['If the two vowels differ, the second is eased, or turned into a waaw or a yaa.', 'different vowels → the second changes'],
      ],
      listen: 'Listen where the two words meet: only one hamzah is said clearly.',
    },
    ibdal: rw === 'warsh' || rw === 'soosi' ? {
      ar: 'إِبْدَالُ ٱلْهَمْزِ', en: 'A silent hamzah turned into a vowel', check: 'ear',
      points: [
        [`In many words ${R} changes a silent hamzah into a long vowel: yu'minoon is read yoominoon, and ya'tee is read yaatee.`, 'يُؤْمِنُونَ → يُومِنُونَ'],
        ['The mushaf writes the vowel letter in place of the hamzah.', 'a vowel letter, no hamzah'],
      ],
      listen: 'Listen for a smooth long vowel where Ḥafṣ has the stop of a hamzah.',
    } : {
      ar: 'كَلِمَاتٌ تَخْتَلِفُ فِي ٱلْهَمْزِ', en: 'Words where the hamzah differs', check: 'ear',
      points: [
        [`In some words ${R} says the hamzah differently from Hafs.`, 'the hamzah, word by word'],
        ['It may be eased, left out, or said where Hafs has none. These are learnt word by word.', 'eased · left out · added'],
      ],
      listen: 'Listen to the hamzah in the highlighted word: softened, left out, or added.',
    },
    idgham: {
      ar: 'ٱلْإِدْغَامُ', en: {
        doori: 'Letters that merge (idghām)', soosi: 'The great merging (idghām kabīr)', shouba: 'Reading on without a pause', bazzi: 'The doubled tāʾ', warsh: 'Letters that merge', qaloon: 'Letters that merge',
      }[rw], check: 'ear',
      points: {
        doori: [
          ['Abu Amr merges some silent letters into the next letter: the daal of qad, the dhaal of idh, and the taa of she.', 'قَدْ جَّآءَكُمْ'],
          ['The merged letter is not said; the next letter is said doubled. The mushaf writes a shaddah on it.', 'shaddah = the merge'],
        ],
        soosi: [
          ['As-Soosi merges a letter at the end of a word into the same, or a close, letter at the start of the next, even when it has a vowel.', 'ٱلرَّحِيم مَّلِكِ'],
          ['So ar-raheemi maaliki is read ar-raheem-maaliki. The mushaf writes a shaddah on the first letter of the second word.', 'shaddah = the great merge'],
          ['Reciters also read these with a trace of the dropped vowel. Listen to your reciter, and ask your teacher.', 'listen for rawm and ishmām'],
        ],
        shouba: [
          ['In a few places Hafs makes a short pause, a sakt, as in man raaq and bal raan.', 'Ḥafṣ: مَنْۜ رَاقٍ  (sakt)'],
          ['Shoubah reads on without the pause, so the letters merge: mar-raaq, bar-raan.', 'Shuʿbah: مَن رَّاقٍ'],
        ],
        bazzi: [
          ['In thirty one places al-Bazzi doubles the taa at the start of a verb after a word that ends in a vowel: wa laa tayammamoo is read wa lat-tayammamoo.', 'وَلَا تَّيَمَّمُواْ'],
          ['The mushaf writes a shaddah on the taa.', 'shaddah on the tāʾ'],
        ],
        warsh: [['In a few places Warsh merges a silent letter into the next one, as in faqad dalla.', 'فَقَدْ ضَّلَّ']],
        qaloon: [['In a few places Qaloon merges a letter into the next one, as in yu-adhdhib man.', 'merging']],
      }[rw] ?? [],
      listen: 'Listen to where the two words meet: one letter, said doubled.',
    },
    ya: {
      ar: 'يَاءَاتُ ٱلْإِضَافَةِ', en: 'The yāʾ of “my” and “me”', check: 'ear',
      points: [
        [`In many places ${R} reads the yaa of my and me with a fatha, where Hafs reads it silent: innee a'lamu is read inniya a'lamu.`, 'إِنِّي → إِنِّيَ'],
        ['In a few places it is the other way round. Each is learnt word by word.', 'learnt word by word'],
      ],
      listen: 'Listen for the short “ya” at the end of the word.',
    },
    zawaid: {
      ar: 'ٱلْيَاءَاتُ ٱلزَّوَائِدُ', en: 'An extra yāʾ when reading on', check: 'ear',
      points: [
        [`In some words ${R} adds a yaa at the end that is not written in the rasm, when reading on: ad-daa'i is read ad-daa'ee.`, 'ٱلدَّاعِ → ٱلدَّاعِي'],
        ['The mushaf writes it as a small yaa.', 'a small yāʾ'],
      ],
      listen: 'Listen for the long “ī” at the end of the word when the reciter carries on.',
    },
    letters: {
      ar: 'فَرْشُ ٱلْحُرُوفِ: ٱلْكَلِمَاتُ', en: 'Words with different letters', check: 'word',
      points: [
        [`In some words ${R} has different letters from Hafs: maaliki is read maliki, and some verbs change person.`, 'مَٰلِكِ → مَلِكِ'],
        ['These are learnt word by word. I can hear these when you recite, so read them carefully.', 'I will listen for these'],
      ],
      listen: 'Listen for the different word, and read it as the mushaf writes it.',
    },
    vowels: {
      ar: 'فَرْشُ ٱلْحُرُوفِ: ٱلْحَرَكَاتُ', en: 'Words with different vowels', check: 'ear',
      points: [
        [`Some words keep their letters but change their vowels in ${R}.`, 'same letters · other vowels'],
        ['These are learnt word by word, from the mushaf and from the reciter.', 'learnt word by word'],
      ],
      listen: 'Listen to the vowels of the highlighted word.',
    },
  };
  const t = T[kind];
  if (kind === 'imalah') {
    const base = {
      warsh: { ar: 'ٱلتَّقْلِيلُ وَٱلْإِمَالَةُ', en: 'Leaning the alif (taqlīl)' },
      doori: { ar: 'ٱلْإِمَالَةُ وَٱلتَّقْلِيلُ', en: 'Leaning the alif (imālah)' },
      soosi: { ar: 'ٱلْإِمَالَةُ', en: 'Leaning the alif (imālah)' },
      shouba: { ar: 'ٱلْإِمَالَةُ', en: 'Leaning the alif (imālah)' },
      qaloon: { ar: 'حَرَكَاتٌ تُقْرَأُ بِلُطْفٍ', en: 'Vowels said lightly (ishmām and ikhtilās)' },
    }[rw];
    return { ...base, ...IMALAH[rw], check: 'ear', listen: 'Listen to the marked letter: its vowel leans, or is only partly said.' };
  }
  return t;
}
const IMALAH = {
  warsh: { points: [
    ['Warsh reads many alifs leaning towards ee: a sound between aa and ee.', 'ā → between ā and ē'],
    ['This is in words ending in alif maqsoorah, like moosaa and ad-duhaa, and in some alifs before a final raa with kasrah.', 'مُوسَى  ٱلضُّحَى  ٱلنَّارِ'],
    ['The Warsh mushaf marks it with a dot under the letter.', 'the dot = lean the alif'],
  ] },
  doori: { points: [
    ['Abu Amr leans many alifs towards ee. In some words fully, in others only between aa and ee.', 'ā → ē (imālah) · between (taqlīl)'],
    ['Most often in an alif before a final raa with kasrah, as in an-naar and al-kaafireen, and in words ending in alif maqsoorah.', 'ٱلنَّارِ  ٱلْكَافِرِينَ  مُوسَى'],
    ['The mushaf marks it with a dot under the letter.', 'the dot = lean the alif'],
  ] },
  soosi: { points: [
    ['Abu Amr leans many alifs towards ee, especially before a final raa with kasrah: an-naar, al-kaafireen.', 'ٱلنَّارِ  ٱلْكَافِرِينَ'],
    ['And in many words ending in alif maqsoorah. The mushaf marks it with a dot under the letter.', 'the dot = lean the alif'],
  ] },
  shouba: { points: [
    ['Shoubah leans the alif towards ee in some particular words, such as ra-aa, he saw, and adraaka.', 'رَأَى  أَدْرَاكَ'],
    ['These are learnt word by word. The mushaf marks them with a dot under the letter.', 'the dot = lean the alif'],
  ] },
  qaloon: { points: [
    ['In a few words the Qaloon mushaf puts a dot to show a vowel said only partly.', 'a dot = a vowel said lightly'],
    ['In seeya and seeyat, the kasrah of the seen is mixed with a trace of dammah. In yakhissimoon the vowel is said quickly.', 'سِيٓءَ (ishmām)  يَخِصِّمُونَ (ikhtilās)'],
  ] },
};

// the topics each riwāyah teaches, in order (the same kinds as scripts/quran/riwayah-diff.mjs KINDS)
const KINDS = {
  warsh: ['mim', 'naql', 'ibdal', 'tashil', 'imalah', 'ya', 'zawaid', 'letters', 'vowels'],
  qaloon: ['qasr', 'idkhal', 'tashil', 'ibdal', 'imalah', 'ya', 'zawaid', 'letters', 'vowels'],
  doori: ['idgham', 'imalah', 'idkhal', 'tashil', 'ibdal', 'ya', 'zawaid', 'letters', 'vowels'],
  soosi: ['idgham', 'qasr', 'ibdal', 'imalah', 'idkhal', 'tashil', 'ya', 'letters', 'vowels'],
  shouba: ['imalah', 'idgham', 'ibdal', 'letters', 'vowels'],
  bazzi: ['mim', 'ha', 'qasr', 'idgham', 'tashil', 'ibdal', 'ya', 'zawaid', 'letters', 'vowels'],
};

// the course of a riwāyah: [{ id, ar, en, check, listen, points: [[say, chalk]] }], starting with who transmitted it
export function course(rw) {
  const intro = { id: 'intro', ar: 'ٱلتَّعْرِيفُ بِٱلرِّوَايَةِ', en: `Meet the riwāyah of ${RIWAYAT[rw].short}`, check: 'none', intro: true, listen: '', points: INTRO[rw] };
  return [intro, ...KINDS[rw].map((k) => ({ id: k, ...topic(k, rw) }))];
}

// what the Sheikh says around the lessons (fixed sentences, so they can be recorded in his voice)
export const LINES = {
  welcome: 'Assalamu alaykum, and welcome to the riwayah classroom. Which riwayah would you like to study today?',
  whatToDo: 'What shall we do in this riwayah? We can learn it topic by topic, you can recite to me, or I can test your memory.',
  syllabus: 'Here are the topics of this riwayah. We start with the first, or carry on where you stopped.',
  examples: 'Here are examples from the mushaf. On the left, as Hafs reads. On the right, as this riwayah reads.',
  toMushaf: 'Now let us see it in the mushaf. Listen to Hafs first, then to this riwayah.',
  repeat: 'Now repeat after the reciter, three times.',
  yourTurn: 'Your turn. Recite the highlighted ayah in this riwayah. I am listening.',
  quizStart: 'Well done. Now a few questions, to see what you have learnt.',
  right: 'Correct. Masha Allah.',
  wrong: 'Not quite. Look again at the right answer.',
  passed: 'Masha Allah, you have passed this topic. Let us move on to the next one.',
  retry: 'Let us go over this topic once more, then try the questions again.',
  courseDone: 'Masha Allah, you have finished every topic of this riwayah. Now take the final test, or recite to me.',
  finalStart: 'This is the final test of the riwayah. Questions from every topic.',
  qPick: 'How does this riwayah read the highlighted word?',
  qEar: 'Listen. Is this Hafs, or this riwayah?',
  qSpot: 'Tap a word in this ayah that this riwayah reads differently from Hafs.',
  qRecite: 'Recite this ayah in this riwayah. I am listening.',
  noAudio: 'There is no openly available recitation of this riwayah yet, so we will learn it from the mushaf.',
  noListening: 'Listening is not available in this browser. Compare your recitation with the reciter.',
  heardNone: 'I did not hear the ayah. Check the microphone, then try again.',
  wordRight: 'Masha Allah. You read that word the way of this riwayah.',
  wordWrong: 'Listen again to the highlighted word: this riwayah reads it differently from Hafs. Try once more.',
  followed: 'Masha Allah, I followed you. This rule is in how the word is said, so compare your sound with the reciter.',
  readAgain: 'Read the underlined words again. This rule is in how the word is said, so compare your sound with the reciter.',
  finalPassed: 'Masha Allah, you have passed the final test of this riwayah.',
};

// every sentence the Sheikh says here, for scripts/voice/narration-list.mjs
export function allLines() {
  const out = new Set(Object.values(LINES));
  for (const rw of Object.keys(RIWAYAT)) for (const t of course(rw)) { for (const [say] of t.points) out.add(say); if (t.listen) out.add(t.listen); }
  return [...out];
}
