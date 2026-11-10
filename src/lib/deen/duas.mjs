// My Du'as: the du'as of the day, from the Qur'an and the sound hadith only.
// Every hadith reference is checked by scripts/deen/check.mjs against the hadith text (the numbering of sunnah.com),
// and every entry stays "pending" until Ustadh Issah has reviewed it (docs/deen-review.md).
//
//   id       unique name (also the key for "I learnt it")
//   cat      a CATEGORIES id
//   level    the youngest level that sees it (1 to 4)
//   when     when we say it (read aloud first)
//   ar       the du'a, fully voweled, as in the hadith (never typed for a Qur'an du'a: use quran instead)
//   quran    { s, a, w?: [first, last] } or a list of them: the du'a is taken from the Tanzil text
//   tr       how to say it
//   en       what it means (the school's own words)
//   src      [{ c, n }]: collection (bukhari, muslim, abudawud, tirmidhi, nasai, ibnmajah) and number
//   key      (optional) the words the checker looks for in the hadith, when the du'a is not quoted word for word
//   times    (optional) how many times it is said

export const CATEGORIES = [
  { id: 'day', title: 'Waking up and sleeping', ar: 'النَّوْمُ وَالِاسْتِيقَاظُ', icon: 'moon' },
  { id: 'food', title: 'Eating and drinking', ar: 'الطَّعَامُ', icon: 'food' },
  { id: 'home', title: 'At home', ar: 'فِي الْبَيْتِ', icon: 'home' },
  { id: 'salah', title: 'Wudu and salah', ar: 'الْوُضُوءُ وَالصَّلَاةُ', icon: 'salah' },
  { id: 'masjid', title: 'The masjid', ar: 'الْمَسْجِدُ', icon: 'masjid' },
  { id: 'people', title: 'With other people', ar: 'مَعَ النَّاسِ', icon: 'people' },
  { id: 'feelings', title: 'How I feel', ar: 'مَشَاعِرِي', icon: 'heart' },
  { id: 'out', title: 'Outside and travel', ar: 'السَّفَرُ وَالْمَطَرُ', icon: 'rain' },
  { id: 'quran', title: "Du'as from the Qur'an", ar: 'أَدْعِيَةٌ مِنَ الْقُرْآنِ', icon: 'quran' },
];

export const DUAS = [
  // ── waking up and sleeping ──
  {
    id: 'wake', cat: 'day', level: 1, when: 'When I wake up',
    ar: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    tr: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur",
    en: 'All praise is for Allah, who gave us life again after He made us sleep, and to Him we will return.',
    src: [{ c: 'bukhari', n: 6324 }],
  },
  {
    id: 'sleep', cat: 'day', level: 1, when: 'When I go to sleep',
    ar: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    tr: 'Bismika Allahumma amutu wa ahya',
    en: 'In Your name, O Allah, I sleep and I wake.',
    src: [{ c: 'bukhari', n: 6324 }],
  },
  {
    id: 'morning', cat: 'day', level: 2, when: 'In the morning',
    ar: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
    tr: "Allahumma bika asbahna wa bika amsayna wa bika nahya wa bika namutu wa ilaykal-masir",
    en: 'O Allah, by You we reach the morning and by You we reach the evening. By You we live and by You we die, and to You is the return.',
    src: [{ c: 'tirmidhi', n: 3391 }],
  },
  {
    id: 'evening', cat: 'day', level: 2, when: 'In the evening',
    ar: 'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
    tr: "Allahumma bika amsayna wa bika asbahna wa bika nahya wa bika namutu wa ilaykan-nushur",
    en: 'O Allah, by You we reach the evening and by You we reach the morning. By You we live and by You we die, and to You we will return.',
    src: [{ c: 'tirmidhi', n: 3391 }],
  },
  {
    id: 'protect', cat: 'day', level: 3, when: 'Three times in the morning and three times in the evening', times: 3,
    ar: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    tr: "Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa huwas-sami'ul-'alim",
    en: 'In the name of Allah, with whose name nothing on the earth or in the sky can harm. He is the All-Hearing, the All-Knowing.',
    src: [{ c: 'abudawud', n: 5088 }, { c: 'tirmidhi', n: 3388 }],
  },

  // ── eating and drinking ──
  {
    id: 'eat', cat: 'food', level: 1, when: 'Before I eat or drink',
    ar: 'بِسْمِ اللَّهِ', key: 'يا غلام سم الله',
    tr: 'Bismillah',
    en: 'In the name of Allah.',
    src: [{ c: 'bukhari', n: 5376 }],
  },
  {
    id: 'eat-forgot', cat: 'food', level: 2, when: 'If I forgot to say Bismillah at the start',
    ar: 'بِسْمِ اللَّهِ أَوَّلَهُ وَآخِرَهُ',
    tr: "Bismillahi awwalahu wa akhirahu",
    en: 'In the name of Allah, at its beginning and at its end.',
    src: [{ c: 'abudawud', n: 3767 }],
  },
  {
    id: 'ate', cat: 'food', level: 2, when: 'When I finish eating',
    ar: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
    tr: "Alhamdu lillahil-ladhi at'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah",
    en: 'All praise is for Allah, who fed me this and gave it to me, with no power or strength from me.',
    src: [{ c: 'tirmidhi', n: 3458 }],
  },

  // ── at home ──
  {
    id: 'leave-home', cat: 'home', level: 1, when: 'When I leave the house',
    ar: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    tr: "Bismillah, tawakkaltu 'alallah, la hawla wa la quwwata illa billah",
    en: 'In the name of Allah. I trust in Allah. There is no power and no strength except with Allah.',
    src: [{ c: 'abudawud', n: 5095 }, { c: 'tirmidhi', n: 3426 }],
  },
  {
    id: 'enter-home', cat: 'home', level: 1, when: 'When I come into the house',
    ar: 'بِسْمِ اللَّهِ', key: 'فذكر الله عند دخوله',
    tr: 'Bismillah',
    en: 'In the name of Allah. When we remember Allah as we come in and when we eat, the Shaytan finds no place to stay with us.',
    src: [{ c: 'muslim', n: 2018 }],
  },
  {
    id: 'dress', cat: 'home', level: 3, when: 'When I put on new clothes',
    ar: 'الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا الثَّوْبَ وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
    tr: "Alhamdu lillahil-ladhi kasani hadhath-thawba wa razaqanihi min ghayri hawlin minni wa la quwwah",
    en: 'All praise is for Allah, who dressed me in this garment and gave it to me, with no power or strength from me.',
    src: [{ c: 'abudawud', n: 4023 }],
  },
  {
    id: 'toilet-in', cat: 'home', level: 1, when: 'Before I go into the toilet',
    ar: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
    tr: "Allahumma inni a'udhu bika minal-khubuthi wal-khaba'ith",
    en: 'O Allah, I ask You to keep me safe from bad things and bad ones.',
    src: [{ c: 'bukhari', n: 142 }, { c: 'muslim', n: 375 }],
  },
  {
    id: 'toilet-out', cat: 'home', level: 1, when: 'When I come out of the toilet',
    ar: 'غُفْرَانَكَ',
    tr: 'Ghufranak',
    en: 'I ask You to forgive me.',
    src: [{ c: 'abudawud', n: 30 }, { c: 'tirmidhi', n: 7 }],
  },

  // ── wudu and salah ──
  {
    id: 'after-wudu', cat: 'salah', level: 2, when: 'When I finish my wudu',
    ar: 'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    tr: "Ash-hadu an la ilaha illallahu wahdahu la sharika lah, wa ash-hadu anna Muhammadan 'abduhu wa rasuluh",
    en: 'I bear witness that there is no god but Allah alone, with no partner, and I bear witness that Muhammad is His servant and His Messenger.',
    src: [{ c: 'muslim', n: 234 }],
  },
  {
    id: 'istighfar', cat: 'salah', level: 1, when: 'Three times when I finish my salah', times: 3,
    ar: 'أَسْتَغْفِرُ اللَّهَ',
    tr: 'Astaghfirullah',
    en: 'I ask Allah to forgive me.',
    src: [{ c: 'muslim', n: 591 }],
  },
  {
    id: 'tasbih', cat: 'salah', level: 2, when: 'After every salah',
    ar: 'سُبْحَانَ اللَّهِ (33) · الْحَمْدُ لِلَّهِ (33) · اللَّهُ أَكْبَرُ (34)', key: 'ثلاث وثلاثون تسبيحه وثلاث وثلاثون تحميده واربع وثلاثون تكبيره',
    tr: 'SubhanAllah 33 times, Alhamdulillah 33 times, Allahu akbar 34 times',
    en: 'Glory be to Allah. All praise is for Allah. Allah is the Greatest.',
    src: [{ c: 'muslim', n: 596 }],
  },

  // ── the masjid ──
  {
    id: 'masjid-in', cat: 'masjid', level: 1, when: 'When I go into the masjid',
    ar: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    tr: "Allahummaf-tah li abwaba rahmatik",
    en: 'O Allah, open for me the doors of Your mercy.',
    src: [{ c: 'muslim', n: 713 }],
  },
  {
    id: 'masjid-out', cat: 'masjid', level: 2, when: 'When I leave the masjid',
    ar: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    tr: "Allahumma inni as'aluka min fadlik",
    en: 'O Allah, I ask You for Your kindness and Your gifts.',
    src: [{ c: 'muslim', n: 713 }],
  },

  // ── with other people ──
  {
    id: 'greet', cat: 'people', level: 1, when: 'When I meet someone',
    ar: 'السَّلَامُ عَلَيْكُمْ',
    tr: "Assalamu 'alaykum",
    en: 'Peace be upon you.',
    src: [{ c: 'bukhari', n: 6227 }],
  },
  {
    id: 'sneeze', cat: 'people', level: 1, when: 'When I sneeze, and when someone else sneezes',
    ar: 'الْحَمْدُ لِلَّهِ · يَرْحَمُكَ اللَّهُ · يَهْدِيكُمُ اللَّهُ وَيُصْلِحُ بَالَكُمْ', key: 'يهديكم الله ويصلح بالكم',
    tr: "I say: Alhamdulillah. My friend says: Yarhamukallah. I answer: Yahdikumullahu wa yuslihu balakum",
    en: 'All praise is for Allah. May Allah have mercy on you. May Allah guide you and make your life good.',
    src: [{ c: 'bukhari', n: 6224 }],
  },
  {
    id: 'thanks', cat: 'people', level: 1, when: 'When someone does something kind for me',
    ar: 'جَزَاكَ اللَّهُ خَيْرًا',
    tr: 'Jazakallahu khayran',
    en: 'May Allah reward you with good.',
    src: [{ c: 'tirmidhi', n: 2035 }],
  },
  {
    id: 'sick', cat: 'people', level: 2, when: 'When I visit someone who is ill',
    ar: 'لَا بَأْسَ طَهُورٌ إِنْ شَاءَ اللَّهُ',
    tr: "La ba's, tahurun in sha Allah",
    en: 'Do not worry. It is a cleansing for you, if Allah wills.',
    src: [{ c: 'bukhari', n: 5656 }],
  },

  // ── how I feel ──
  {
    id: 'angry', cat: 'feelings', level: 1, when: 'When I feel angry',
    ar: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
    tr: "A'udhu billahi minash-shaytanir-rajim",
    en: 'I ask Allah to keep me safe from the Shaytan, the rejected one.',
    src: [{ c: 'bukhari', n: 6115 }],
  },
  {
    id: 'worried', cat: 'feelings', level: 2, when: 'When I feel worried or afraid',
    ar: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    tr: "Hasbunallahu wa ni'mal-wakil",
    en: 'Allah is enough for us, and He is the best One to trust.',
    src: [{ c: 'bukhari', n: 4563 }],
  },

  // ── outside and travel ──
  {
    id: 'rain', cat: 'out', level: 1, when: 'When it rains',
    ar: 'صَيِّبًا نَافِعًا',
    tr: "Sayyiban nafi'a",
    en: 'May it be a rain that does good.',
    src: [{ c: 'bukhari', n: 1032 }],
  },
  {
    id: 'ride', cat: 'out', level: 3, when: 'When I get into a car or ride on a journey',
    quran: [{ s: 43, a: 13, w: [12, 20] }, { s: 43, a: 14 }],
    tr: "Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila rabbina lamunqalibun",
    en: 'Glory be to the One who made this ride easy for us. We could not have done it ourselves, and to our Lord we will return.',
    src: [],
  },

  // ── from the Qur'an ──
  {
    id: 'knowledge', cat: 'quran', level: 1, when: 'When I want to learn more',
    quran: { s: 20, a: 114, w: [17, 19] },
    tr: "Rabbi zidni 'ilma",
    en: 'My Lord, give me more knowledge.',
    src: [],
  },
  {
    id: 'parents', cat: 'quran', level: 1, when: 'When I make du\'a for my mother and father',
    quran: { s: 17, a: 24, w: [8, 12] },
    tr: "Rabbir-hamhuma kama rabbayani saghira",
    en: 'My Lord, have mercy on them both, as they looked after me when I was little.',
    src: [],
  },
  {
    id: 'good', cat: 'quran', level: 2, when: 'Any time, for good in this life and the next',
    quran: { s: 2, a: 201, w: [4, 14] },
    tr: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar",
    en: 'Our Lord, give us good in this world and good in the next, and keep us safe from the Fire.',
    src: [],
  },
  {
    id: 'salah-dua', cat: 'quran', level: 3, when: 'For keeping up my salah',
    quran: { s: 14, a: 40 },
    tr: "Rabbij-'alni muqimas-salati wa min dhurriyyati, rabbana wa taqabbal du'a'",
    en: 'My Lord, make me one who keeps up the prayer, and my children too. Our Lord, accept my du\'a.',
    src: [],
  },
  {
    id: 'yunus', cat: 'quran', level: 3, when: 'When things are hard, as Prophet Yunus said',
    quran: { s: 21, a: 87, w: [15, 23] },
    tr: "La ilaha illa anta subhanaka inni kuntu minaz-zalimin",
    en: 'There is no god but You. Glory be to You. I have done wrong.',
    src: [],
  },
];
