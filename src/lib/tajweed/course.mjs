// The Tajweed classroom's course: the riwāyah of Ḥafṣ ʿan ʿĀṣim by the way of ash-Shāṭibiyyah (the lengths and
// choices follow it). Used by the children's classroom (Levels 3 and 4, src/pages/index.astro) and the adults' Quran
// Library (src/pages/quran/tajweed/), through src/lib/tajweed/classroom.mjs.
//
// Three audiences, each written for its age:
//   l3     Level 3, ages 8 to 11: plain words, a nickname for each rule, its Arabic name, finger counts
//   l4     Level 4, ages 11 to 16: the proper terms, the reasons, the signs in the mushaf
//   adult  the Level 4 lesson, then the scholars' detail: definitions, exceptions, the matn lines
//
// A topic: { id, ar, en: {l3,l4}, for: [audiences], rules: [rule ids], intro?, points: {l3, l4, adult} }
//   points: [[say, chalk]]: say is spoken in the Sheikh's voice (plain English, recorded at build time by
//   scripts/voice/narration-list.mjs); chalk is the short line he writes on the board as he says it.
//   points.adult is said after points.l4.
//   qs: {l3, l4, adult}: questions on the ideas [{ q, o: [options], a: index of the right one }]
// The examples (real āyāt, the rule's letters marked) come from data/tajweed-lessons.json, which
// scripts/quran/tajweed-lessons.mjs finds in the tajweed-coloured mushaf text. No example is typed by hand.

export const AUDIENCES = {
  l3: { label: 'Level 3', title: 'Tajweed Explorers', ar: 'مُسْتَكْشِفُو ٱلتَّجْوِيدِ' },
  l4: { label: 'Level 4', title: 'Tajweed Seekers', ar: 'طُلَّابُ ٱلتَّجْوِيدِ' },
  adult: { label: 'Adults', title: 'The Tajweed course', ar: 'عِلْمُ ٱلتَّجْوِيدِ' },
};
export const audOf = (level) => (level === 'adult' ? 'adult' : Number(level) >= 4 ? 'l4' : 'l3');

// each rule's name: [for Level 3, for Level 4 and adults]; counts: how long it is held
export const RULES = {
  heavy: { name: ['Heavy letter', 'Heavy letter (istiʿlāʾ)'] },
  shams: { name: ['Sun letter: the lām is silent', 'Lām shamsiyyah'] },
  qamar: { name: ['Moon letter: say the lām', 'Lām qamariyyah'] },
  wasl: { name: [null, 'Hamzat al-waṣl'] },
  qalq_s: { name: ['Small bounce (qalqalah)', 'Qalqalah ṣughrā'] },
  qalq_k: { name: ['Big bounce at the stop (qalqalah)', 'Qalqalah kubrā'] },
  ghunnah: { name: ['Nose sound on a doubled nūn or mīm', 'Ghunnah (nūn or mīm with shaddah)'], count: '2 counts' },
  izhar: { name: ['Iẓhār: say the nūn clearly', 'Iẓhār ḥalqī'] },
  idgham_g: { name: ['Idghām: merge, with the nose sound', 'Idghām with ghunnah'], count: '2 counts' },
  idgham_n: { name: ['Idghām: merge, no nose sound', 'Idghām without ghunnah'] },
  iqlab: { name: ['Iqlāb: nūn turns into mīm', 'Iqlāb'], count: '2 counts' },
  ikhfa: { name: ['Ikhfāʾ: hide the nūn', 'Ikhfāʾ ḥaqīqī'], count: '2 counts' },
  ikhfa_sh: { name: ['Hide the mīm before bāʾ', 'Ikhfāʾ shafawī'], count: '2 counts' },
  idgham_sh: { name: ['Merge mīm into mīm', 'Idghām shafawī'], count: '2 counts' },
  izhar_sh: { name: ['Say the mīm clearly', 'Iẓhār shafawī'] },
  madd_t: { name: ['Natural stretch', 'Madd ṭabīʿī'], count: '2 counts' },
  muttasil: { name: ['Long stretch in one word', 'Madd muttaṣil'], count: '4 or 5 counts' },
  munfasil: { name: ['Long stretch across two words', 'Madd munfaṣil'], count: '4 or 5 counts' },
  arid: { name: [null, 'Madd ʿāriḍ lis-sukūn'], count: '2, 4 or 6 counts' },
  lazim: { name: [null, 'Madd lāzim'], count: '6 counts' },
  ra_heavy: { name: [null, 'Heavy rāʾ (tafkhīm)'] },
  ra_light: { name: [null, 'Light rāʾ (tarqīq)'] },
  waqf: { name: [null, 'A pause sign'] },
  mithlayn: { name: [null, 'Idghām of two close letters'] },
  sakt: { name: [null, 'Saktah'] },
};
export const ruleName = (r, aud) => RULES[r]?.name[aud === 'l3' ? 0 : 1] ?? RULES[r]?.name[1] ?? r;
export const COUNTS = { l3: ['2 counts', '4 or 5 counts', '6 counts'], l4: ['2 counts', '4 or 5 counts', '2, 4 or 6 counts', '6 counts'] };

const ALL = ['l3', 'l4', 'adult'], OLDER = ['l4', 'adult'];

const TOPICS = [
  {
    id: 'intro', ar: 'مَا هُوَ ٱلتَّجْوِيدُ؟', en: { l3: 'What is tajweed?', l4: 'What tajweed is, and why we learn it' }, for: ALL, rules: [], intro: true,
    points: {
      l3: [
        ['Assalamu alaykum! Today we begin a special journey: learning tajweed.', 'Tajweed = reading the Qur’an beautifully'],
        ['Tajweed means making something good and beautiful. When we read the Quran with tajweed, we say every letter the right way.', 'تَجْوِيد: to make it good'],
        ['The angel Jibreel taught the Quran to the Prophet, sallallahu alayhi wa sallam, and he taught it to his companions, letter by letter. We read it the same way today.', 'Jibrīl → the Prophet ﷺ → the Companions → us'],
        ['Allah tells us: and recite the Quran slowly and beautifully.', 'وَرَتِّلِ ٱلْقُرْءَانَ تَرْتِيلًا (73:4)'],
        ['In every lesson I will write on this board, show you the rule in the mushaf, and then you will practise and answer some questions. Ready? Let us begin!', 'Learn → see it → practise → questions'],
      ],
      l4: [
        ['Assalamu alaykum, and welcome to the tajweed class.', 'عِلْمُ ٱلتَّجْوِيدِ'],
        ['In the language, tajweed means to improve something, to make it good. In recitation, it means giving every letter its right: where it comes from and its qualities, and what it is due where it stands.', 'Each letter: its place, its qualities, its rules'],
        ['Allah says: and recite the Quran with tarteel. It is reported from Ali, may Allah be pleased with him, that tarteel is reading the letters well and knowing where to stop.', 'وَرَتِّلِ ٱلْقُرْءَانَ تَرْتِيلًا (73:4)'],
        ['There are two kinds of mistakes. A clear mistake changes a letter or a vowel, and can change the meaning: this must always be avoided. A hidden mistake breaks a rule of tajweed, such as a ghunnah or a madd left out.', 'Clear mistake (jalī) · hidden mistake (khafī)'],
        ['We read the riwayah of Hafs from Aasim, as most of the world does. The lengths I give you follow the way of ash-Shatibiyyah.', 'Ḥafṣ ʿan ʿĀṣim · ash-Shāṭibiyyah'],
        ['For each topic: I explain on the board, we see it in the mushaf with a reciter, you practise, and then I test you.', 'Learn → see it → practise → test'],
      ],
      adult: [
        ['Ibn al-Jazari wrote in his poem on tajweed that taking up tajweed is a firm duty, and that the Quran came down from Allah with it, and reached us that way.', 'وَٱلْأَخْذُ بِٱلتَّجْوِيدِ حَتْمٌ لَازِمُ'],
        ['The scholars say: knowing the rules in detail is a communal duty, while reciting with tajweed, free of clear mistakes, is asked of everyone who recites.', 'Theory: farḍ kifāyah · practice: on every reciter'],
        ['Our two main texts are Tuhfat al-Atfal by al-Jamzuri, on the noon and the madd, and the Muqaddimah of Ibn al-Jazari, on the letters and their qualities.', 'تُحْفَةُ ٱلْأَطْفَالِ · ٱلْمُقَدِّمَةُ ٱلْجَزَرِيَّةُ'],
        ['Tajweed is learnt by hearing it from a teacher and reading back to him. This class prepares you, and does not replace a teacher with ijazah.', 'Learnt by talaqqī: from a teacher’s mouth'],
      ],
    },
  },
  {
    id: 'makharij', ar: 'مَخَارِجُ ٱلْحُرُوفِ', en: { l4: 'Where the letters come from (makhārij)' }, for: OLDER, rules: [], intro: true,
    points: {
      l4: [
        ['Every letter has its own place in the mouth or throat where its sound is made. This is its makhraj.', 'مَخْرَج: where the sound is made'],
        ['There are five main areas. First, the empty space of the mouth and throat, where the three madd letters come from.', '1. ٱلْجَوْف: ا و ي (madd)'],
        ['Second, the throat, in three parts. Deepest: hamzah and haa. Middle: ain and haa. Nearest the mouth: ghain and khaa.', '2. ٱلْحَلْق: ء ه · ع ح · غ خ'],
        ['Third, the tongue, the largest area: eighteen letters from different parts of it.', '3. ٱللِّسَان: 18 letters'],
        ['Fourth, the two lips: faa, baa, meem and waw.', '4. ٱلشَّفَتَان: ف ب م و'],
        ['Fifth, the nose, where the ghunnah of noon and meem comes from.', '5. ٱلْخَيْشُوم: the ghunnah'],
        ['To find a letter’s place, put a hamzah with a vowel before it and say it with a sukoon: ab, aq, ad. Where your sound stops is its makhraj.', 'أَبْ  أَقْ  أَدْ  → where it stops'],
      ],
      adult: [
        ['Ibn al-Jazari counts seventeen points within these five areas. The tongue alone has ten.', '17 makhārij in 5 areas (Ibn al-Jazarī)'],
        ['Take care with letters near one another: the daad from the side of the tongue against the upper molars, the dhaa from the tip of the tongue with the tips of the upper front teeth.', 'ض: side of the tongue · ظ ذ ث: the tip, with the teeth'],
      ],
    },
    qs: {
      l4: [
        { q: 'Where do ع and ح come from?', o: ['The middle of the throat', 'The lips', 'The nose'], a: 0 },
        { q: 'Which letters come from the lips?', o: ['ف ب م و', 'ء ه ع ح', 'ق ك ج'], a: 0 },
        { q: 'Where does the ghunnah come from?', o: ['The nose (al-khayshūm)', 'The throat', 'The tip of the tongue'], a: 0 },
      ],
    },
  },
  {
    id: 'heavy', ar: 'ٱلتَّفْخِيمُ وَٱلتَّرْقِيقُ', en: { l3: 'Heavy letters and light letters', l4: 'Heavy and light letters (tafkhīm and tarqīq)' }, for: ALL, rules: ['heavy'],
    points: {
      l3: [
        ['Some letters are heavy: we say them with a full, round mouth. There are seven of them.', 'خ ص ض غ ط ق ظ = heavy'],
        ['Here is a way to remember them: khussa daghtin qidh.', 'خُصَّ ضَغْطٍ قِظْ'],
        ['When you say a heavy letter, the back of your tongue rises up, and the sound is full and deep.', 'Back of the tongue goes up ↑'],
        ['All the other letters are light: say them with a thin, flat mouth.', 'The others = light'],
        ['Listen to the difference: saad is heavy, seen is light. Taa is heavy, ta is light.', 'صَ / سَ   ·   طَ / تَ'],
      ],
      l4: [
        ['Tafkheem means making a letter heavy, filling the mouth with its sound. Tarqeeq means making it light.', 'تَفْخِيم: heavy · تَرْقِيق: light'],
        ['Seven letters are always heavy, because the back of the tongue rises when they are said. They are called the letters of istilaa.', 'خُصَّ ضَغْطٍ قِظْ'],
        ['They are heaviest with a fathah followed by an alif, then with a fathah, then a dammah, then a sukoon, and lightest with a kasrah, but they never become light.', 'طَا > طَ > طُ > طْ > طِ'],
        ['Most other letters are always light. Three change: the raa, the laam of the name Allah, and the alif, which follows the letter before it.', 'Change: ر · ل in ٱللَّه · ا'],
        ['The laam of Allah is heavy after a fathah or a dammah, and light after a kasrah: as in qul huwa Allah, and bismillah.', 'هُوَ ٱللَّهُ (heavy) · بِسْمِ ٱللَّهِ (light)'],
      ],
      adult: [
        ['Four of the seven are also letters of itbaq, where the tongue presses against the roof of the mouth: saad, daad, taa and dhaa. They are the heaviest of all.', 'إِطْبَاق: ص ض ط ظ'],
        ['Be careful not to make a light letter heavy next to a heavy one, as in the seen of mustaqeem, or the taa of tatahhara.', 'ٱلْمُسْتَقِيمَ: keep the س light'],
      ],
    },
    qs: {
      l3: [
        { q: 'Which letter is heavy?', o: ['ص', 'س', 'ت'], a: 0 },
        { q: 'How do we say a heavy letter?', o: ['With a full, round mouth', 'With a thin, flat mouth', 'Through the nose'], a: 0 },
      ],
      l4: [
        { q: 'Which group is all letters of istiʿlāʾ?', o: ['خ ص ض غ ط ق ظ', 'ب ت ث ج د', 'ء ه ع ح غ خ'], a: 0 },
        { q: 'The lām of ٱللَّه after a kasrah, as in بِسْمِ ٱللَّهِ, is…', o: ['light', 'heavy', 'silent'], a: 0 },
      ],
    },
  },
  {
    id: 'lam', ar: 'ٱللَّامُ ٱلشَّمْسِيَّةُ وَٱلْقَمَرِيَّةُ', en: { l3: 'Sun letters and moon letters', l4: 'The lām of al-: shamsiyyah and qamariyyah' }, for: ALL, rules: ['qamar', 'shams'],
    points: {
      l3: [
        ['When al comes before a word, sometimes we say the laam, and sometimes we do not.', 'ٱلْـ … say the lām, or not?'],
        ['Moon letters: we say the laam clearly, as in al-qamar, the moon. In the mushaf the laam has a sukoon on it.', 'ٱلْقَمَرُ → say the لْ'],
        ['Sun letters: the laam goes quiet, and the next letter is doubled, as in ash-shams, the sun. In the mushaf the next letter has a shaddah.', 'ٱلشَّمْسُ → the ل is silent'],
        ['There are fourteen moon letters. They are all in this sentence: ibghi hajjaka wa khaf aqeemah.', 'ٱبْغِ حَجَّكَ وَخَفْ عَقِيمَهُ'],
        ['The other fourteen are sun letters. Look at the mushaf: sukoon on the laam, moon. Shaddah after it, sun.', 'لْ = moon 🌙 · ـّ after = sun ☀️'],
      ],
      l4: [
        ['The laam of al, the definite article, is read in two ways, depending on the letter after it.', 'لَامُ ٱلتَّعْرِيفِ'],
        ['Before fourteen letters, the moon letters, it is said clearly. This is the clear laam, al-qamariyyah, named after the word al-qamar.', 'إِظْهَارٌ قَمَرِيٌّ: ٱبْغِ حَجَّكَ وَخَفْ عَقِيمَهُ'],
        ['Before the other fourteen, the sun letters, it merges into the next letter, which is doubled. This is the laam ash-shamsiyyah, named after ash-shams.', 'إِدْغَامٌ شَمْسِيٌّ: ٱلشَّمْسُ'],
        ['Why? The sun letters are close to the laam in where they are said, so the laam merges into them. The moon letters are far from it, so it stays clear.', 'Close makhraj → merge · far → clear'],
        ['The mushaf shows it: a sukoon on the laam for a moon letter, no sukoon and a shaddah on the next letter for a sun letter.', 'ٱلْحَمْدُ · ٱلرَّحِيمِ'],
      ],
      adult: [
        ['This rule is for the laam of the definite article only. A laam that is part of the word is always clear, as in iltaqaa and alhaakum, except before a laam or a raa.', 'ٱلْتَقَى · أَلْهَىٰكُمُ: always clear'],
      ],
    },
    qs: {
      l3: [
        { q: 'In ٱلشَّمْسُ, do we say the lām?', o: ['No, it is silent', 'Yes, clearly'], a: 0 },
        { q: 'In ٱلْقَمَرُ, do we say the lām?', o: ['Yes, clearly', 'No, it is silent'], a: 0 },
      ],
      l4: [
        { q: 'Which word has a lām shamsiyyah?', o: ['ٱلنَّاسِ', 'ٱلْحَمْدُ', 'ٱلْكِتَٰبُ'], a: 0 },
        { q: 'Why does the lām merge into the sun letters?', o: ['They are close to it in makhraj', 'They are heavy letters', 'They come from the throat'], a: 0 },
      ],
    },
  },
  {
    id: 'wasl', ar: 'هَمْزَةُ ٱلْوَصْلِ', en: { l4: 'Hamzat al-waṣl: the joining hamzah' }, for: OLDER, rules: ['wasl'],
    points: {
      l4: [
        ['Look at this alif with a small saad on top. It is the joining hamzah, hamzat al-wasl.', 'ٱ = hamzat al-waṣl'],
        ['When you start reading from it, you say it. When you join it to the word before, it is dropped.', 'Start: say it · joined: silent'],
        ['As in bismillah: we do not say bismi allah, but bismillah, joining straight on.', 'بِسْمِ ٱللَّهِ → bismillāh'],
        ['When you start with it: in al, say it with a fathah. In a verb, with a dammah if the third letter has a dammah, otherwise with a kasrah.', 'ٱلْـ → a · ٱدْعُ → u · ٱهْدِنَا → i'],
        ['In a few nouns, such as ibn, ism and imraah, start it with a kasrah.', 'ٱبْن · ٱسْم · ٱمْرَأَة → i'],
      ],
      adult: [
        ['The nouns are learnt by listening: ibn, ibnah, imru, imraah, ithnan, ithnatan and ism.', 'ٱبْن ٱبْنَة ٱمْرِئ ٱمْرَأَة ٱثْنَان ٱثْنَتَان ٱسْم'],
        ['Where the dammah of the third letter is only temporary, start with a kasrah: imshoo, iqdoo, ibnoo.', 'ٱمْشُوا · ٱقْضُوا · ٱبْنُوا → i'],
        ['Do not confuse it with the silent alif after the waw of the plural, as in kafaroo. It is written, and never said.', 'كَفَرُوا: the alif is never said'],
      ],
    },
    qs: {
      l4: [
        { q: 'When is hamzat al-waṣl said?', o: ['Only when you start from it', 'Always', 'Never'], a: 0 },
        { q: 'Starting with ٱهْدِنَا, you say…', o: ['ihdinā', 'uhdinā', 'ahdinā'], a: 0 },
      ],
    },
  },
  {
    id: 'qalqalah', ar: 'ٱلْقَلْقَلَةُ', en: { l3: 'The bouncing letters (qalqalah)', l4: 'Qalqalah' }, for: ALL, rules: ['qalq_s', 'qalq_k'],
    points: {
      l3: [
        ['Five letters bounce when they have a sukoon. They are qaaf, taa, baa, jeem and daal.', 'ق ط ب ج د'],
        ['Remember them with: qutbu jad.', 'قُطْبُ جَدٍّ'],
        ['In the middle of a word it is a small bounce, as in yaj-alu.', 'يَجْعَلُ → small bounce'],
        ['When you stop at the end of an ayah, it is a big bounce, as in al-falaq.', 'ٱلْفَلَقْ → BIG bounce'],
        ['Be careful: it is a little echo, not a new vowel. Do not say qa, qi or qu.', 'An echo, not a vowel'],
      ],
      l4: [
        ['Qalqalah is an echo, a slight bounce, when one of five letters has a sukoon: qaaf, taa, baa, jeem and daal.', 'قُطْبُ جَدٍّ'],
        ['These letters hold back the breath and the sound together, so without the bounce they would not be heard.', 'Breath and sound held → bounce'],
        ['The small qalqalah is in the middle of a word or at its end when joined, as in yaj-alu.', 'صُغْرَى: يَجْعَلُ'],
        ['The great qalqalah is where you stop, as on al-falaq. With a shaddah, as on al-haqq when you stop, it is strongest.', 'كُبْرَى: ٱلْفَلَقْ · ٱلْحَقّْ'],
        ['Do not turn the bounce into a vowel, and do not add a hamzah after it.', 'Not a vowel, not a hamzah'],
      ],
      adult: [
        ['The five letters share two qualities: jahr, where the breath is held, and shiddah, where the sound is held. The bounce lets them be heard.', 'جَهْر + شِدَّة'],
        ['Scholars differ on the colour of the bounce: some follow the vowel before, others lean it towards a fathah. Follow your teacher.', 'Its colour: follow your teacher'],
      ],
    },
    qs: {
      l3: [
        { q: 'Which letter bounces with a sukūn?', o: ['د', 'م', 'س'], a: 0 },
        { q: 'When is the bounce biggest?', o: ['When we stop at the end of an ayah', 'In the middle of a word', 'Never'], a: 0 },
      ],
      l4: [
        { q: 'The qalqalah letters are…', o: ['ق ط ب ج د', 'ي ر م ل و ن', 'ء ه ع ح غ خ'], a: 0 },
        { q: 'Stopping on ٱلْفَلَقِ gives…', o: ['Qalqalah kubrā', 'Qalqalah ṣughrā', 'No qalqalah'], a: 0 },
      ],
    },
  },
  {
    id: 'ghunnah', ar: 'ٱلْغُنَّةُ', en: { l3: 'The nose sound (ghunnah)', l4: 'Ghunnah: nūn and mīm with shaddah' }, for: ALL, rules: ['ghunnah'],
    points: {
      l3: [
        ['Ghunnah is a sweet humming sound from your nose. Try it: nnnn, and mmmm.', 'غُنَّة = humming from the nose 👃'],
        ['When noon or meem has a shaddah, we hold the humming for two counts.', 'نّ  مّ = 2 counts'],
        ['As in inna, and thumma. Hold your nose gently: if the sound stops, that was the ghunnah!', 'إِنَّ · ثُمَّ'],
        ['Count on your fingers as you hum: one, two.', '☝️ ✌️ = 2 counts'],
      ],
      l4: [
        ['Ghunnah is a sound from the nose that belongs to the noon and the meem.', 'غُنَّة: from the khayshūm'],
        ['When noon or meem has a shaddah, the ghunnah is complete and held for two counts. This is the ghunnah mushaddadah.', 'نّ مّ: 2 counts'],
        ['A count is about the time it takes to fold or open one finger at an even pace.', '1 count = 1 finger'],
        ['You will meet the ghunnah again in the rules of the noon and meem with sukoon.', 'Also in idghām, iqlāb, ikhfāʾ'],
      ],
      adult: [
        ['The ghunnah is strongest on a doubled noon or meem, then in idghaam, then in ikhfaa, and weakest on a noon or meem with a vowel.', 'mushaddad > idghām > ikhfāʾ > sākin > with a vowel'],
        ['Before a heavy letter, the ghunnah of ikhfaa takes on heaviness too, as in yansurukum.', 'يَنصُرُكُمْ: a heavy ghunnah'],
      ],
    },
    qs: {
      l3: [
        { q: 'Where does the ghunnah come from?', o: ['The nose', 'The lips', 'The throat'], a: 0 },
        { q: 'Which word has a ghunnah?', o: ['إِنَّ', 'قُلْ', 'رَبِّ'], a: 0 },
      ],
      l4: [
        { q: 'How long is the ghunnah of نّ or مّ?', o: ['2 counts', '4 counts', '6 counts'], a: 0 },
        { q: 'Which word has a ghunnah mushaddadah?', o: ['ثُمَّ', 'قَالَ', 'ٱلْحَمْدُ'], a: 0 },
      ],
    },
  },
  {
    id: 'izhar', ar: 'ٱلنُّونُ ٱلسَّاكِنَةُ وَٱلتَّنْوِينُ: ٱلْإِظْهَارُ', en: { l3: 'Nūn sākinah and tanwīn: say it clearly (iẓhār)', l4: 'Nūn sākinah and tanwīn: iẓhār ḥalqī' }, for: ALL, rules: ['izhar'],
    points: {
      l3: [
        ['A noon with a sukoon, or tanween, the double vowel at the end of a word, has four rules. Each depends on the letter after it.', 'نْ  ـًـٍـٌ → 4 rules'],
        ['Rule one: izhaar, which means clear. Before the six throat letters, say the noon clearly, with no humming.', 'Iẓhār = clear'],
        ['The six throat letters are hamzah, haa, ain, haa, ghain and khaa.', 'ء ه ع ح غ خ'],
        ['As in an-amta in al-Fatihah, and min khayr.', 'أَنْعَمْتَ · مِنْ خَيْرٍ'],
        ['In the mushaf, a clear noon has a sukoon on it, and the two marks of the tanween sit one on top of the other.', 'نْ  ـٌ ـً ـٍ = clear'],
      ],
      l4: [
        ['The noon saakinah is a noon without a vowel. Tanween is a noon saakinah said at the end of a noun but not written as a noon.', 'نْ · tanwīn = an unwritten nūn'],
        ['They have four rules: izhaar, idghaam, iqlaab and ikhfaa. Which one depends on the letter that follows.', 'إِظْهَار · إِدْغَام · إِقْلَاب · إِخْفَاء'],
        ['Izhaar means making clear. Before the six throat letters, the noon is said clearly, with no extra ghunnah.', 'Before ء ه ع ح غ خ'],
        ['It is called halqi, of the throat. The throat is far from where the noon is said, so they do not mix.', 'Far makhraj → kept clear'],
        ['The mushaf shows a sukoon on the noon, and the tanween marks stacked one over the other.', 'نْ · ـٌ ـً ـٍ stacked'],
      ],
      adult: [
        ['Al-Jamzuri lists the throat letters in order, from the deepest: hamzah and haa, then ain and haa, then ghain and khaa.', 'هَمْزٌ فَهَاءٌ ثُمَّ عَيْنٌ حَاءُ ۞ مُهْمَلَتَانِ ثُمَّ غَيْنٌ خَاءُ'],
        ['The iz-haar is clearest before the hamzah and haa, the deepest letters, and least before the ghain and khaa.', 'Clearest before ء ه'],
      ],
    },
    qs: {
      l3: [
        { q: 'Before which letter is the nūn said clearly?', o: ['ح', 'ب', 'ي'], a: 0 },
        { q: 'Iẓhār means…', o: ['clear', 'hidden', 'merged'], a: 0 },
      ],
      l4: [
        { q: 'The letters of iẓhār ḥalqī are…', o: ['ء ه ع ح غ خ', 'ي ن م و', 'ق ط ب ج د'], a: 0 },
        { q: 'Why is the nūn clear before them?', o: ['The throat is far from the nūn’s makhraj', 'They are heavy letters', 'They have a shaddah'], a: 0 },
      ],
    },
  },
  {
    id: 'idgham', ar: 'ٱلْإِدْغَامُ', en: { l3: 'Merging (idghām)', l4: 'Idghām, with and without ghunnah' }, for: ALL, rules: ['idgham_g', 'idgham_n'],
    points: {
      l3: [
        ['Rule two: idghaam, which means merging. The noon melts into the next letter, and the two become one.', 'Idghām = merge'],
        ['Its six letters are in the word yarmaloon.', 'يَرْمَلُونَ'],
        ['With yaa, noon, meem and waw, we merge with the humming sound, for two counts. Remember them in: yanmoo.', 'ي ن م و → merge + 👃 2 counts'],
        ['With laam and raa, we merge with no humming at all.', 'ل ر → merge, no humming'],
        ['It only happens across two words, as in hudal lil-muttaqeen. In the mushaf, the next letter has a shaddah.', 'هُدًى لِّلْمُتَّقِينَ'],
      ],
      l4: [
        ['Idghaam is merging a letter with a sukoon into the next letter, so they are said as one doubled letter.', 'إِدْغَام: two become one'],
        ['Its letters are six, gathered in yarmaloon.', 'يَرْمَلُونَ'],
        ['With ghunnah, before yaa, noon, meem and waw: the letters of yanmoo. Held for two counts.', 'يَنْمُو: with ghunnah'],
        ['Without ghunnah, before laam and raa: the merge is complete, and the noon leaves no trace.', 'ل ر: no ghunnah'],
        ['Idghaam happens only across two words. In one word, as in dunyaa, the noon is said clearly.', 'دُنْيَا → clear (one word)'],
      ],
      adult: [
        ['Into yaa and waw the merge is incomplete: the ghunnah of the noon remains. Into noon and meem it is complete, with the ghunnah of the doubled letter.', 'ي و: nāqiṣ · ن م: kāmil'],
        ['Four words keep the noon clear, as the noon and the yaa or waw are in one word: dunyaa, bunyaan, sinwaan and qinwaan.', 'دُنْيَا · بُنْيَانٌ · صِنْوَانٌ · قِنْوَانٌ'],
        ['Hafs also reads yaa seen wal-quran, and noon wal-qalam, with the noon clear.', 'يسٓ وَٱلْقُرْءَانِ · نٓ وَٱلْقَلَمِ'],
      ],
    },
    qs: {
      l3: [
        { q: 'Idghām means…', o: ['merging', 'hiding', 'bouncing'], a: 0 },
        { q: 'Which letters merge with NO humming?', o: ['ل ر', 'ي و', 'ن م'], a: 0 },
      ],
      l4: [
        { q: 'The letters of idghām with ghunnah are…', o: ['ي ن م و', 'ل ر', 'ق ط ب ج د'], a: 0 },
        { q: 'In دُنْيَا, the nūn is…', o: ['clear: it is one word', 'merged with ghunnah', 'hidden'], a: 0 },
      ],
    },
  },
  {
    id: 'iqlab', ar: 'ٱلْإِقْلَابُ', en: { l3: 'The nūn turns into mīm (iqlāb)', l4: 'Iqlāb' }, for: ALL, rules: ['iqlab'],
    points: {
      l3: [
        ['Rule three: iqlaab, which means changing. It has only one letter: baa.', 'Iqlāb = change · only ب'],
        ['Before baa, the noon or tanween changes into a meem, with the humming sound for two counts.', 'نْ + ب → مْ (2 counts)'],
        ['Look for the little meem the mushaf writes above it.', 'ۢ  little mīm = say mīm'],
        ['As in min baadi: we say mim baadi.', 'مِنۢ بَعْدِ → mim baʿdi'],
        ['Close your lips softly. Do not press them hard.', 'Lips closed softly'],
      ],
      l4: [
        ['Iqlaab means turning one thing into another. Before baa, the noon saakinah or tanween turns into a meem.', 'إِقْلَاب: ن → م before ب'],
        ['The meem is then hidden with a ghunnah of two counts, the lips closing lightly.', 'Then ikhfāʾ with ghunnah: 2 counts'],
        ['Why? A clear noon before baa is heavy on the tongue, and it cannot merge, as they are far apart. The meem shares the lips with the baa.', 'م and ب: both from the lips'],
        ['The mushaf writes a small meem over the noon, or in place of the second mark of the tanween.', 'مِنۢ بَعْدِ · سَمِيعُۢ بَصِيرٌ'],
      ],
      adult: [
        ['It is in one word, as in ambiaahum, and across two words, as in min badi.', 'أَنۢبِئْهُم · مِنۢ بَعْدِ'],
        ['Most teachers close the lips lightly, without pressing; some leave a slight gap. Follow your teacher.', 'Lips: closed lightly (follow your teacher)'],
      ],
    },
    qs: {
      l3: [
        { q: 'Iqlāb happens before which letter?', o: ['ب', 'م', 'ن'], a: 0 },
        { q: 'In iqlāb, the nūn turns into…', o: ['a mīm', 'a lām', 'nothing'], a: 0 },
      ],
      l4: [
        { q: 'What does the small mīm (ۢ) in the mushaf tell you?', o: ['Say a mīm: iqlāb', 'Stop here', 'Stretch 6 counts'], a: 0 },
        { q: 'Why does the nūn become a mīm before ب?', o: ['The mīm and bāʾ both come from the lips', 'The bāʾ is a throat letter', 'The bāʾ is heavy'], a: 0 },
      ],
    },
  },
  {
    id: 'ikhfa', ar: 'ٱلْإِخْفَاءُ', en: { l3: 'Hiding the nūn (ikhfāʾ)', l4: 'Ikhfāʾ ḥaqīqī' }, for: ALL, rules: ['ikhfa'],
    points: {
      l3: [
        ['Rule four: ikhfaa, which means hiding. It is for the fifteen letters left over.', 'Ikhfāʾ = hide · 15 letters'],
        ['The noon is not clear and not merged: it hides, half-way between, with the humming sound for two counts.', 'Not clear, not merged: hidden 👃'],
        ['Your tongue gets ready for the next letter while you hum, and does not press for the noon.', 'Tongue does not press for the ن'],
        ['As in min sharri, and innaa anzalnaahu.', 'مِن شَرِّ · أَنزَلْنَٰهُ'],
        ['In the mushaf, the noon has no sukoon, and the two marks of the tanween are written one after the other.', 'ن  (no sukūn) · ـًـ marks side by side'],
      ],
      l4: [
        ['Ikhfaa means hiding. Before fifteen letters, the noon saakinah or tanween is hidden: between clear and merged, with a ghunnah of two counts.', 'إِخْفَاء: 15 letters · 2 counts'],
        ['The fifteen are the first letters of the words in this line of Tuhfat al-Atfal.', 'صِفْ ذَا ثَنَا كَمْ جَادَ شَخْصٌ قَدْ سَمَا'],
        ['And its second half.', 'دُمْ طَيِّبًا زِدْ فِي تُقًى ضَعْ ظَالِمَا'],
        ['The tongue does not touch for the noon. It moves towards the next letter while the ghunnah is held.', 'Prepare for the next letter'],
        ['Before a heavy letter, the ghunnah is heavy; before a light letter, it is light.', 'يَنصُرُكُمْ (heavy) · مِن تَحْتِهَا (light)'],
      ],
      adult: [
        ['It is called true ikhfaa, haqeeqi, as the hiding is agreed upon by all the readers.', 'حَقِيقِيّ: agreed by all'],
        ['The hiding is strongest before taa, daal and taa, nearest to the noon, and weakest before qaaf and kaaf, the furthest.', 'Strongest: ت د ط · weakest: ق ك'],
      ],
    },
    qs: {
      l3: [
        { q: 'Ikhfāʾ means…', o: ['hiding', 'merging', 'changing'], a: 0 },
        { q: 'How long is the humming in ikhfāʾ?', o: ['2 counts', '6 counts', 'No humming'], a: 0 },
      ],
      l4: [
        { q: 'How many letters of ikhfāʾ are there?', o: ['15', '6', '4'], a: 0 },
        { q: 'Which word has ikhfāʾ?', o: ['مِن شَرِّ', 'مِنْ خَيْرٍ', 'مِن رَّبِّهِمْ'], a: 0 },
      ],
    },
  },
  {
    id: 'mim', ar: 'ٱلْمِيمُ ٱلسَّاكِنَةُ', en: { l3: 'Mīm with a sukūn', l4: 'Mīm sākinah: its three rules' }, for: ALL, rules: ['ikhfa_sh', 'idgham_sh', 'izhar_sh'],
    points: {
      l3: [
        ['A meem with a sukoon has three rules. Again, the next letter decides.', 'مْ → 3 rules'],
        ['Before baa: hide the meem, with the humming sound for two counts, lips closed softly. As in tarmeehim bihijaarah.', 'مْ + ب = hide 👃 · تَرْمِيهِم بِحِجَارَةٍ'],
        ['Before another meem: merge them, with the humming sound for two counts. As in lahum maa.', 'مْ + م = merge 👃'],
        ['Before any other letter: say the meem clearly. As in al-hamdu.', 'مْ + others = clear · ٱلْحَمْدُ'],
        ['Be extra careful before faa and waw: keep the meem clear!', 'Careful before و ف!'],
      ],
      l4: [
        ['The meem saakinah has three rules, named shafawi, of the lips, as the meem comes from the lips.', 'شَفَوِيّ: of the lips'],
        ['Before baa: ikhfaa shafawi. The meem is hidden with a ghunnah of two counts.', 'إِخْفَاء شَفَوِيّ: تَرْمِيهِم بِحِجَارَةٍ'],
        ['Before a meem: idghaam shafawi, also called the small idghaam of two alike letters. Ghunnah of two counts.', 'إِدْغَام شَفَوِيّ: لَهُم مَّا'],
        ['Before all other letters: izhaar shafawi. The meem is said clearly.', 'إِظْهَار شَفَوِيّ: ٱلْحَمْدُ'],
        ['Take most care before waw and faa: the waw shares the lips, and the faa is close, so people wrongly hide the meem.', 'عَلَيْهِمْ وَلَا · هُمْ فِيهَا'],
      ],
      adult: [
        ['The mushaf shows a sukoon on the meem for izhaar; no sukoon for ikhfaa; and no sukoon with a shaddah on the next meem for idghaam.', 'مْ clear · م hidden · م مّ merged'],
        ['In ikhfaa shafawi, most teachers close the lips lightly; some leave a slight gap. Follow your teacher.', 'Lips: follow your teacher'],
      ],
    },
    qs: {
      l3: [
        { q: 'مْ before ب: what do we do?', o: ['Hide it with humming', 'Say it clearly', 'Stop'], a: 0 },
        { q: 'Before which letters must we be extra careful to keep the mīm clear?', o: ['و and ف', 'ب and م', 'ق and ط'], a: 0 },
      ],
      l4: [
        { q: 'Mīm sākinah before ب is…', o: ['Ikhfāʾ shafawī', 'Iẓhār shafawī', 'Iqlāb'], a: 0 },
        { q: 'Mīm sākinah before ف is…', o: ['Iẓhār shafawī', 'Ikhfāʾ shafawī', 'Idghām shafawī'], a: 0 },
      ],
    },
  },
  {
    id: 'madd', ar: 'ٱلْمَدُّ ٱلطَّبِيعِيُّ', en: { l3: 'Stretching: the natural madd', l4: 'Madd ṭabīʿī: the natural madd' }, for: ALL, rules: ['madd_t'],
    points: {
      l3: [
        ['Madd means stretching a sound. Some vowels are stretched for two counts: this is the natural madd.', 'Madd = stretch'],
        ['Alif after a fathah, waw after a dammah, yaa after a kasrah.', 'ـَا  ـُو  ـِي'],
        ['As in qaala, yaqoolu, and qeela. Count on your fingers: one, two.', 'قَالَ · يَقُولُ · قِيلَ = ✌️'],
        ['The little letters count too: the small alif, the small waw and the small yaa are stretched for two.', 'ـٰ  ـۥ  ـۦ = 2'],
        ['Not too short, not too long: exactly two.', 'Exactly 2 counts'],
      ],
      l4: [
        ['Madd is lengthening the sound of a madd letter. The natural madd, madd tabeei, is two counts, no more and no less.', 'مَدّ طَبِيعِيّ: 2 counts'],
        ['The madd letters are alif after a fathah, waw saakinah after a dammah, and yaa saakinah after a kasrah.', 'نُوحِيهَا: ا و ي'],
        ['It is natural because it has no cause after it: no hamzah and no sukoon. A cause makes it longer, as we will learn.', 'No hamzah, no sukūn after it'],
        ['The small alif and the small waw and yaa after the haa of the pronoun count as natural madd too.', 'ٱلرَّحْمَٰنِ · إِنَّهُۥ · بِهِۦ'],
        ['When you stop on a tanween with fathah, it becomes a natural madd of two counts: ahadaa.', 'أَحَدًا → أَحَدَا (stop)'],
      ],
      adult: [
        ['A hamzah before the madd letter, as in aamanoo, makes madd al-badal. For Hafs it stays two counts.', 'بَدَل: ءَامَنُوا = 2'],
        ['A waw or yaa with sukoon after a fathah, before a letter you stop on, is madd al-leen: two, four or six counts, as in khawf.', 'لِين: خَوْفْ · ٱلْبَيْتْ'],
      ],
    },
    qs: {
      l3: [
        { q: 'How long is the natural madd?', o: ['2 counts', '4 counts', '6 counts'], a: 0 },
        { q: 'Which word has a natural madd?', o: ['قَالَ', 'قُلْ', 'لَمْ'], a: 0 },
      ],
      l4: [
        { q: 'Why is madd ṭabīʿī "natural"?', o: ['No hamzah or sukūn comes after it', 'It is in every word', 'It has a shaddah'], a: 0 },
        { q: 'Stopping on أَحَدًا you say…', o: ['aḥadā (2 counts)', 'aḥadan', 'aḥad'], a: 0 },
      ],
    },
  },
  {
    id: 'madd_hamz', ar: 'ٱلْمَدُّ ٱلْمُتَّصِلُ وَٱلْمُنْفَصِلُ', en: { l3: 'Long stretches before a hamzah', l4: 'Madd muttaṣil and munfaṣil' }, for: ALL, rules: ['muttasil', 'munfasil'],
    points: {
      l3: [
        ['When a stretch letter meets a hamzah, we stretch it longer: four or five counts.', 'madd + ء → 4 or 5 counts'],
        ['The mushaf shows it with a wavy line above the letter.', 'ٓ  wavy line = stretch longer'],
        ['In one word, as in as-samaaa-u, it must be long.', 'ٱلسَّمَآءُ (one word)'],
        ['Across two words, as in innaaa a-taynaaka, we stretch it too.', 'إِنَّآ أَعْطَيْنَٰكَ (two words)'],
        ['Choose four or five, and keep the same length every time.', 'Same length every time'],
      ],
      l4: [
        ['When a hamzah comes after a madd letter, the madd is lengthened. The hamzah is the cause.', 'Cause: a hamzah'],
        ['Madd muttasil, joined: the madd letter and the hamzah in one word. It is obligatory, waajib: four or five counts.', 'مُتَّصِل (wājib): ٱلسَّمَآءُ · جَآءَ'],
        ['Madd munfasil, separated: the madd letter ends one word and the hamzah begins the next. It is permitted, jaaiz: four or five counts in our way.', 'مُنْفَصِل (jāʾiz): بِمَآ أُنزِلَ'],
        ['Choose one length and keep it the same through your recitation.', 'Keep it consistent'],
      ],
      adult: [
        ['By the way of Tayyibat an-Nashr, Hafs also reads the separated madd short, two counts. Do not mix the ways in one recitation.', 'Ṭayyibah: munfaṣil 2 · do not mix the ways'],
        ['If you stop on a joined madd whose hamzah ends the word, as as-samaa, you may stretch four, five or six.', 'ٱلسَّمَآءْ (stop): 4, 5 or 6'],
      ],
    },
    qs: {
      l3: [
        { q: 'A madd before a hamzah is stretched…', o: ['4 or 5 counts', '2 counts', 'Not at all'], a: 0 },
        { q: 'What does the wavy line ( ٓ ) tell you?', o: ['Stretch longer', 'Stop here', 'Bounce'], a: 0 },
      ],
      l4: [
        { q: 'ٱلسَّمَآءُ has…', o: ['Madd muttaṣil', 'Madd munfaṣil', 'Madd ṭabīʿī'], a: 0 },
        { q: 'Madd munfaṣil is…', o: ['madd letter at a word’s end, hamzah starting the next', 'madd and hamzah in one word', 'madd before a sukūn'], a: 0 },
      ],
    },
  },
  {
    id: 'madd_stop', ar: 'ٱلْمَدُّ ٱلْعَارِضُ وَٱللَّازِمُ', en: { l4: 'Madd before a sukūn: ʿāriḍ and lāzim' }, for: OLDER, rules: ['arid', 'lazim'],
    points: {
      l4: [
        ['A sukoon after a madd letter is the other cause of a long madd.', 'Cause: a sukūn'],
        ['Madd aarid lis-sukoon: the sukoon comes only because you stop, as on ar-raheem and nastaeen. Two, four or six counts.', 'عَارِض: ٱلرَّحِيمْ · نَسْتَعِينْ (2, 4 or 6)'],
        ['When you join instead of stopping, it is a natural madd of two again.', 'Joined → 2 counts'],
        ['Madd laazim: the sukoon or shaddah is always there, stopping or not. Always six counts, as in ad-daaalleen.', 'لَازِم: ٱلضَّآلِّينَ = 6'],
        ['It is also in the letters that open some surahs, as alif laaam meeem.', 'الٓمٓ: lām 6 · mīm 6'],
      ],
      adult: [
        ['Madd laazim has four kinds: in a word with a shaddah, as ad-daaalleen; in a word with a plain sukoon, as aaal-aan in Surah Yunus.', 'كَلِمِيّ مُثَقَّل: ٱلضَّآلِّينَ · مُخَفَّف: ءَآلْـَٰٔنَ'],
        ['And in the opening letters, with a merge, as the laam of alif laam meem, or without, as saad.', 'حَرْفِيّ: الٓمٓ · صٓ'],
        ['The opening letters read with six are in: kam asal naqas. The ain of kaaf haa yaa ain saad and of ain seen qaaf may be four or six.', 'كَمْ عَسَلْ نَقَصْ · ع: 4 or 6'],
      ],
    },
    qs: {
      l4: [
        { q: 'Stopping on ٱلرَّحِيمِ, the madd may be…', o: ['2, 4 or 6 counts', 'only 6', 'only 2'], a: 0 },
        { q: 'ٱلضَّآلِّينَ has…', o: ['Madd lāzim: 6 counts', 'Madd ʿāriḍ', 'Madd munfaṣil'], a: 0 },
      ],
    },
  },
  {
    id: 'ra', ar: 'أَحْكَامُ ٱلرَّاءِ', en: { l4: 'The rāʾ: heavy or light' }, for: OLDER, rules: ['ra_heavy', 'ra_light'],
    points: {
      l4: [
        ['The raa is sometimes heavy and sometimes light, depending on its vowel.', 'ر: heavy or light'],
        ['With a fathah or a dammah it is heavy, as in rabbi and rizqan.', 'رَبِّ · رُزِقُوا → heavy'],
        ['With a kasrah it is light, as in rijaal.', 'رِجَالٌ → light'],
        ['With a sukoon, it follows the vowel before it: heavy after a fathah or dammah, as in maryam; light after a kasrah, as in firawn.', 'مَرْيَمَ (heavy) · فِرْعَوْنَ (light)'],
        ['But it is heavy after a kasrah if the kasrah is only for starting, as in irjiee, or if a heavy letter follows in the word, as in mirsaadaa.', 'ٱرْجِعِىٓ · مِرْصَادًا → heavy'],
      ],
      adult: [
        ['When you stop on a raa, look before it: after a kasrah or a yaa saakinah it is light, as in qadeer. Otherwise it follows the vowel before, as in al-fajr, which is heavy.', 'قَدِيرْ (light) · ٱلْفَجْرْ (heavy)'],
        ['A few words allow both, such as firq in Surah ash-Shuara, and misr and al-qitr when stopping. Your teacher will show you which to prefer.', 'فِرْقٍ · مِصْرَ · ٱلْقِطْرِ: both allowed'],
      ],
    },
    qs: {
      l4: [
        { q: 'رِجَالٌ: the rāʾ is…', o: ['light', 'heavy'], a: 0 },
        { q: 'مَرْيَمَ: the rāʾ (sukūn after a fatḥah) is…', o: ['heavy', 'light'], a: 0 },
        { q: 'مِرْصَادًا: the rāʾ after a kasrah is heavy because…', o: ['a heavy letter follows it in the word', 'it has a fatḥah', 'it is at the end'], a: 0 },
      ],
    },
  },
  {
    id: 'waqf', ar: 'ٱلْوَقْفُ وَعَلَامَاتُهُ', en: { l4: 'Stopping, and the pause signs' }, for: OLDER, rules: ['waqf'],
    points: {
      l4: [
        ['Waqf is stopping at the end of a word to take a breath, meaning to carry on.', 'وَقْف: stop, breathe, carry on'],
        ['When you stop, the last vowel becomes a sukoon. A tanween with fathah becomes an alif, and a taa marbootah becomes a haa.', 'ـُ → ـْ · ـًا → ـَا · ـَة → ـَهْ'],
        ['The mushaf guides you. A small meem: stop here, it is necessary. Laa: do not stop.', 'مـ must stop · لا do not stop'],
        ['Jeem: stopping and joining are both fine. Sala: joining is better. Qala: stopping is better.', 'ج either · صلى join · قلى stop'],
        ['Three dots in two places: stop at one of them, not at both.', '∴ … ∴ stop at one only'],
      ],
      adult: [
        ['Umm Salamah described the Prophet, sallallahu alayhi wa sallam, reciting and pausing at the end of each ayah, as narrated by Abu Dawud and at-Tirmidhi.', 'Stopping at the āyah’s end: sunnah'],
        ['A stop that spoils the meaning is to be avoided. If you must stop there for breath, go back and start from a place where the meaning is sound.', 'Bad stop → go back and restart'],
      ],
    },
    qs: {
      l4: [
        { q: 'The sign لا means…', o: ['Do not stop here', 'You must stop', 'Stopping is better'], a: 0 },
        { q: 'Stopping on رَحِيمًا you say…', o: ['raḥīmā', 'raḥīman', 'raḥīm'], a: 0 },
        { q: 'The sign قلى means…', o: ['Stopping is better', 'Joining is better', 'Do not stop'], a: 0 },
      ],
    },
  },
  {
    id: 'mithlayn', ar: 'ٱلْمِثْلَانِ وَٱلْمُتَجَانِسَانِ وَٱلْمُتَقَارِبَانِ', en: { l4: 'Two letters meeting: alike, related, close' }, for: ['adult'], rules: ['mithlayn'],
    points: {
      adult: [
        ['When two letters meet, the first with a sukoon and the second with a vowel, the first often merges into the second.', 'Sākin + moving → idghām ṣaghīr'],
        ['Alike, mithlayn: the same letter, always merged, as in idrib bi-asaaka.', 'مِثْلَان: ٱضْرِب بِّعَصَاكَ'],
        ['Related, mutajaanisayn: the same makhraj but different qualities, as qad tabayyana, athqalat daawaa, yalhath dhaalik, irkab maanaa.', 'مُتَجَانِسَان: قَد تَّبَيَّنَ · ٱرْكَب مَّعَنَا'],
        ['In basatta, the taa merges but its heaviness stays: an incomplete merge.', 'بَسَطتَ: nāqiṣ (the ṭāʾ’s weight stays)'],
        ['Close, mutaqaaribayn: letters near in makhraj, as qur rabbi, and nakhlukkum, which is usually merged completely.', 'مُتَقَارِبَان: قُل رَّبِّ · نَخْلُقكُّم'],
      ],
    },
    qs: {
      adult: [
        { q: 'قَد تَّبَيَّنَ is an idghām of…', o: ['mutajānisayn (related)', 'mithlayn (alike)', 'mutaqāribayn (close)'], a: 0 },
        { q: 'قُل رَّبِّ is an idghām of…', o: ['mutaqāribayn (close)', 'mutajānisayn (related)', 'it is not merged'], a: 0 },
      ],
    },
  },
  {
    id: 'sakt', ar: 'ٱلسَّكَتَاتُ', en: { l4: 'The saktah of Ḥafṣ' }, for: ['adult'], rules: ['sakt'],
    points: {
      adult: [
        ['A saktah is a short pause, without taking a breath, about two counts.', 'سَكْتَة: pause, no breath'],
        ['By the way of ash-Shatibiyyah, Hafs makes it in four places, marked in the mushaf with a small seen.', 'ۜ  small sīn = saktah'],
        ['In al-Kahf: iwajaa, then qayyimaa. And in Yaseen: min marqadinaa, then haadhaa.', 'عِوَجَا ۜ قَيِّمًا · مِن مَّرْقَدِنَا ۜ هَٰذَا'],
        ['In al-Qiyaamah: man, then raaq. And in al-Mutaffifeen: bal, then raan. Here it keeps the noon and the laam from merging into the raa.', 'مَنْ ۜ رَاقٍ · بَلْ ۜ رَانَ'],
      ],
    },
    qs: {
      adult: [
        { q: 'A saktah is…', o: ['a short pause without breath', 'a full stop with breath', 'a long madd'], a: 0 },
        { q: 'How many saktāt does Ḥafṣ make by ash-Shāṭibiyyah?', o: ['4', '2', '7'], a: 0 },
      ],
    },
  },
];

// the course for one audience: [{ id, ar, en, rules, intro, points: [[say, chalk]], qs }]
export function course(aud) {
  return TOPICS.filter((t) => t.for.includes(aud)).map((t) => ({
    id: t.id, ar: t.ar, rules: t.rules, intro: !!t.intro,
    en: aud === 'l3' ? t.en.l3 ?? t.en.l4 : t.en.l4 ?? t.en.l3,
    points: aud === 'l3' ? t.points.l3 : aud === 'l4' ? t.points.l4 ?? t.points.adult : [...(t.points.l4 ?? []), ...(t.points.adult ?? [])],
    qs: aud === 'l3' ? t.qs?.l3 ?? [] : aud === 'l4' ? t.qs?.l4 ?? [] : [...(t.qs?.l4 ?? []), ...(t.qs?.adult ?? [])],
  }));
}

// what the Sheikh says around the lessons. l3 has its own, warmer lines; the others share them.
const BASE = {
  welcome: 'Assalamu alaykum, and welcome to the tajweed classroom. What would you like to do today?',
  syllabus: 'Here are the topics of the course. We start with the first, or carry on where you stopped.',
  examples: 'Here are examples from the Quran. Look at the highlighted letters.',
  toMushaf: 'Now let us see it in the mushaf. Listen to the reciter, and pay attention to the highlighted letters.',
  listenAgain: 'Listen once more to the highlighted letters.',
  repeat: 'Now repeat after the reciter, three times.',
  yourTurn: 'Your turn. Recite the ayah, and apply the rule. I am listening.',
  quizStart: 'Well done. Now a few questions, to see what you have learnt.',
  right: 'Correct. Masha Allah.',
  wrong: 'Not quite. Look at the right answer.',
  passed: 'Masha Allah, you have passed this topic. Let us move on to the next one.',
  retry: 'Let us go over this topic once more, then try the questions again.',
  courseDone: 'Masha Allah, you have finished every topic. Now take the final test.',
  finalStart: 'This is the final test. Questions from every topic.',
  finalPassed: 'Masha Allah, you have passed the final test. Keep reciting with what you have learnt, and read to a teacher.',
  qConcept: 'Choose the right answer.',
  qWhich: 'Which rule is in the highlighted letters?',
  qSpot: 'Tap a word in this ayah where you find this rule.',
  qCount: 'How long is the highlighted sound held?',
  qRecite: 'Listen to the reciter, then recite the ayah yourself. I am listening.',
  noListening: 'Listening is not available in this browser. Compare your recitation with the reciter.',
  heardNone: 'I did not hear the ayah. Check the microphone, then try again.',
  followed: 'Masha Allah, I followed every word. I cannot yet hear tajweed rules, so compare the highlighted letters with the reciter.',
  readAgain: 'I missed some words. Read the underlined words again, and listen to the reciter once more.',
  practiseMore: 'Practise it on more ayat: go to the next example.',
};
const L3 = {
  welcome: 'Assalamu alaykum, my dear student! Welcome to the tajweed classroom. What shall we do today?',
  examples: 'Look at these words from the Quran. Can you see the highlighted letters?',
  quizStart: 'Great work! Now let us see what you remember. Here come some questions.',
  right: 'Excellent! Masha Allah!',
  wrong: 'Good try! Look, this is the right answer.',
  passed: 'Masha Allah, you passed! You earned a star. On to the next lesson!',
  retry: 'Let us learn it once more together, then try again. You can do it!',
  courseDone: 'Masha Allah! You finished every lesson. Now try the big final test!',
  finalPassed: 'Masha Allah, you passed the final test! You are a tajweed star. Keep reading to your teacher.',
  followed: 'Masha Allah, I followed every word! Now listen to the reciter again, and check the highlighted letters sound the same.',
};
export function lines(aud) { return aud === 'l3' ? { ...BASE, ...L3 } : BASE; }

// every sentence the Sheikh says here, for scripts/voice/narration-list.mjs
export function allLines() {
  const out = new Set([...Object.values(BASE), ...Object.values(L3)]);
  for (const aud of Object.keys(AUDIENCES)) for (const t of course(aud)) for (const [say] of t.points) out.add(say);
  return [...out];
}
