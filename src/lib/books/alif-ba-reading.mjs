// Alif Ba: I'm Learning Qur'an. The school's reading primer and workbook (Level 2, ages 6–8):
// the letters, their joined forms, the harakat, madd, sukun, shadda, tanween, then the first tajweed rules,
// the du'as of the prayer and the short surahs.
const P = (n) => `books/alif-ba-reading/${String(n).padStart(3, '0')}.webp`;
const NAME = {
  'ا': 'Alif', 'ب': 'Ba', 'ت': 'Ta', 'ث': 'Tha', 'ج': 'Jim', 'ح': 'Ḥa', 'خ': 'Kha', 'د': 'Dal', 'ذ': 'Dhal', 'ر': 'Ra',
  'ز': 'Zay', 'س': 'Sin', 'ش': 'Shin', 'ص': 'Ṣad', 'ض': 'Ḍad', 'ط': 'Ṭa', 'ظ': 'Ẓa', 'ع': 'ʿAyn', 'غ': 'Ghayn', 'ف': 'Fa',
  'ق': 'Qaf', 'ك': 'Kaf', 'ل': 'Lam', 'م': 'Mim', 'ن': 'Nun', 'ه': 'Ha', 'و': 'Waw', 'ي': 'Ya',
};
// letters to tap: the Sheikh's letter voice says each one
const T = (s) => s.split(' ').map((c) => ({ ar: c, letter: c, en: NAME[c] }));
// syllables and words to tap: the sound is read out
const S = (...xs) => xs.map(([ar, en]) => ({ ar, en }));
const ALL = 'ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي';

export default {
  id: 'alif-ba-reading', title: 'Alif Ba: I\'m Learning Qur\'an', ar: 'أَلِف بَاء', level: 2, ages: '6–8', color: '#D7263D',
  cover: 'books/alif-ba-reading/001.webp',
  about: 'Learn to read the Qur\'an step by step: the letters and their shapes, the vowel marks, madd, sukun, shadda and tanween, with workbook pages to write on.',
  unit: 'chapters',
  note: 'For teachers: the workbook pages open with crayons, so children can trace and write on them. Page 83 prints the wrong letters for idgham; the spoken line on that page gives the right ones (see the review sheet).',
  chapters: [
    {
      title: 'Welcome', ar: 'بِسْمِ اللّٰهِ',
      pages: [
        { type: 'scan', img: P(1), draw: false, h: 'Alif Ba: I\'m learning Qur\'an', say: 'This is your Alif Ba book. With it you will learn to read the Qur\'an, one letter at a time.' },
        { type: 'scan', img: P(2), draw: false, say: 'Let\'s begin in the name of Allah. Say Bismillah!', check: 'Page 2 is a calligraphy panel. Please confirm what it says, so the spoken line can name it.' },
        {
          type: 'read', h: 'Before we start',
          text: [
            'Assalamu alaikum! This book teaches you to read Arabic. Arabic is the language of the Qur\'an.',
            'First you will meet the 28 letters. You will hear each one and trace it with your crayon.',
            'Then you will see how the letters join to make words.',
            'After that come the little marks. They tell each letter how to sound.',
            { note: { h: 'For parents', t: 'Sit with your child for ten minutes at a time. Let them tap a letter to hear it, then say it back. Arabic is read from right to left, so point with your finger as you go.' } },
            'Ready? Turn the page and let\'s begin.',
          ],
        },
        { type: 'scan', img: P(3), draw: false, h: 'What is in this book', say: 'Here are the parts of the book. Each part has pages to read and pages to write on.' },
      ],
    },
    {
      title: 'Alif to Tha', ar: 'ا ب ت ث',
      pages: [
        { type: 'scan', img: P(4), h: 'The Arabic letters', say: 'Here are all the Arabic letters. The red ones are the four we learn first, and you can tap each one to hear it.', tap: T('ا ب ت ث') },
        { type: 'scan', img: P(5), h: 'Alif', say: 'Alif is the first letter. It is thin and long, like a pen. Trace the big Alifs, then write Alif in the little boxes.', tap: T('ا') },
        { type: 'scan', img: P(6), h: 'Find the hidden Alif', say: 'Some Alifs are hiding in this picture. Can you find them? Circle each one.' },
        { type: 'scan', img: P(7), h: 'Ba', say: 'Ba is wide, and Alif comes before it. Ba has one dot under its body. Trace it and say its name.', tap: T('ب') },
        { type: 'scan', img: P(8), h: 'Circle the Ba', say: 'Look at all these letters. Circle every Ba, then read it out loud.', tap: T('ا ب ت ث') },
        { type: 'scan', img: P(9), h: 'Ta', say: 'Ta looks like Ba and comes right after it. Ta has two dots on top. Colour it in with your favourite colour.', tap: T('ت') },
        { type: 'scan', img: P(10), h: 'Find the Ta', say: 'Find every Ta on this page. Colour it, then read it out loud.' },
        { type: 'scan', img: P(11), h: 'Tha', say: 'Tha comes after Ba and Ta. It has three dots on top. Write a Tha in each little circle and read them all.', tap: T('ث') },
        { type: 'find', letters: ['ا', 'ب', 'ت', 'ث'] },
        { type: 'scan', img: P(12), h: 'Help Zaid get to the mosque', say: 'Zaid wants to go to the mosque, so follow the path of Tha letters to take him there.' },
        { type: 'scan', img: P(13), h: 'Trace the lines', say: 'Trace each wavy line from the top down to the bottom. Read the letter at each end.', tap: T('ا ب ت ث') },
        { type: 'scan', img: P(14), h: 'A prayer mat', say: 'Colour the letters on the prayer mat. The colour dots at the bottom show which colour goes with which letter.' },
        {
          type: 'quiz', h: 'Who am I?',
          items: [
            { q: 'I am the first letter. I am thin and long, like a pen. Who am I?', a: 'ا', w: ['ب', 'ت'], why: 'Alif is the first letter of the alphabet.' },
            { q: 'I am wide. I have one dot under me. Who am I?', a: 'ب', w: ['ت', 'ث'], why: 'Ba has one dot, and it sits underneath.' },
            { q: 'I look like Ba, but my two dots are on top. Who am I?', a: 'ت', w: ['ب', 'ث'], why: 'Ta has two dots on top.' },
            { q: 'I have three dots on top. Who am I?', a: 'ث', w: ['ت', 'ب'], why: 'Tha is the one with three dots.' },
          ],
        },
      ],
    },
    {
      title: 'Jim to Lam',
      pages: [
        { type: 'scan', img: P(15), h: 'Jim to Kha', say: 'These three letters have the same shape, and only the dot moves from place to place. Tap and listen.', tap: T('ج ح خ') },
        { type: 'find', letters: ['ج', 'ح', 'خ', 'ب', 'ت'] },
        { type: 'scan', img: P(16), h: 'Dal to Zay', say: 'Dal and Dhal are a pair. So are Ra and Zay. The dot is the only difference.', tap: T('د ذ ر ز') },
        { type: 'scan', img: P(17), h: 'Sin to Ḍad', say: 'Sin has three little teeth. Shin has the same teeth with three dots on top. Ṣad and Ḍad have a round loop.', tap: T('س ش ص ض') },
        { type: 'find', letters: ['د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض'] },
        { type: 'scan', img: P(18), h: 'Ṭa to Ghayn', say: 'Ṭa and Ẓa stand up tall. ʿAyn and Ghayn open their mouths at the top.', tap: T('ط ظ ع غ') },
        { type: 'scan', img: P(19), h: 'Fa to Lam', say: 'Fa has one dot on top and Qaf has two, so look closely at the dots. Then come Kaf and Lam.', tap: T('ف ق ك ل') },
        { type: 'find', letters: ['ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل'] },
        {
          type: 'match', h: 'Letters and their names', prompt: 'Match each letter to its name.',
          pairs: [['ج', 'Jim'], ['ذ', 'Dhal'], ['ش', 'Shin'], ['ع', 'ʿAyn'], ['ق', 'Qaf'], ['ك', 'Kaf']],
        },
      ],
    },
    {
      title: 'Mim to Ya', ar: 'م ن ه و ي',
      pages: [
        { type: 'scan', img: P(20), h: 'The last five letters', say: 'Here are the last five letters. Ya comes at the very end, so it is the last letter you will learn.', tap: T('م ن ه و ي') },
        { type: 'scan', img: P(22), h: 'Ha', say: 'Ha comes from deep in the throat. Trace the big Ha, colour it and say it out loud.', tap: T('ه') },
        { type: 'scan', img: P(23), h: 'Letters at the mosque', say: 'Find the letters in the cloud and on the mosque. Write each one in the boxes below.', tap: T('م ن ه') },
        { type: 'scan', img: P(24), h: 'Waw', say: 'I am small and round, and I have no dot. Can you guess who I am? I am Waw! Colour me in.', tap: T('و') },
        { type: 'scan', img: P(25), h: 'Ya', say: 'Ya is the last letter of the alphabet. It curls like a little stream and has two dots under it.', tap: T('ي'), check: 'The riddle on page 25 is printed in Turkish. The spoken line gives it in English.' },
        { type: 'find', letters: ['م', 'ن', 'ه', 'و', 'ي'] },
        { type: 'scan', img: P(26), h: 'Write the letters', say: 'Write these letters in the shapes. Say each one as you write it.' },
        { type: 'scan', img: P(27), h: 'Match the shapes', say: 'Draw a line between the letters that are the same. Then read them out loud.' },
        {
          type: 'match', h: 'Letters and their names', prompt: 'Match each letter to its name.',
          pairs: [['م', 'Mim'], ['ن', 'Nun'], ['ه', 'Ha'], ['و', 'Waw'], ['ي', 'Ya']],
        },
      ],
    },
    {
      title: 'Where letters come from',
      pages: [
        { type: 'scan', img: P(21), h: 'Where letters come from', say: 'Every letter comes from a place in your mouth. Some come from the throat. Most come from the tongue, and four come from the lips.', tap: T('ب م و ف'), tapLabel: 'Lip letters: tap and feel your lips move' },
        {
          type: 'read', h: 'Try it yourself',
          text: [
            'Put your hand on your throat and say Ḥa. Can you feel it?',
            'Now say Ba. Your lips press together.',
            'Say Ta. The tip of your tongue touches the back of your top teeth.',
            { table: [['Where', 'Letters'], ['Throat', 'ا ح خ ع غ ه'], ['Tongue', 'ت ث ج د ذ ر ز س ش ص ض ط ظ ق ك ل ن ي'], ['Lips', 'ب م و ف']] },
          ],
        },
        {
          type: 'sort', h: 'Throat, tongue or lips?', prompt: 'Where does each letter come from? Tap a letter, then its basket.',
          groups: ['Throat', 'Tongue', 'Lips'],
          items: [['ع', 0], ['ح', 0], ['غ', 0], ['خ', 0], ['ت', 1], ['ك', 1], ['ل', 1], ['س', 1], ['ب', 2], ['م', 2], ['ف', 2], ['و', 2]],
        },
      ],
    },
    {
      title: 'Letters in words',
      pages: [
        { type: 'scan', img: P(28), h: 'All the letters', say: 'Here are all the letters together. Read them from the right, row by row.', tap: T(ALL) },
        { type: 'scan', img: P(29), h: 'The letters mixed up', say: 'The letters are in a new order here. Start at the right and read each one.' },
        { type: 'scan', img: P(30), h: 'Write the letters', say: 'Copy each letter into the empty boxes.' },
        {
          type: 'scan', img: P(31), h: 'Start, middle or end',
          say: 'Letters change shape when they join. Look at Ba at the start of a word, in the middle or at the end.',
          tap: [{ ar: 'ب', letter: 'ب', en: 'Ba' }, { ar: 'بـ', letter: 'ب', en: 'start' }, { ar: 'ـبـ', letter: 'ب', en: 'middle' }, { ar: 'ـب', letter: 'ب', en: 'end' },
            { ar: 'ع', letter: 'ع', en: 'ʿAyn' }, { ar: 'عـ', letter: 'ع', en: 'start' }, { ar: 'ـعـ', letter: 'ع', en: 'middle' }, { ar: 'ـع', letter: 'ع', en: 'end' }],
          tapLabel: 'Ba and ʿAyn in their joined shapes',
        },
        {
          type: 'match', h: 'The start shape', prompt: 'Each letter has a shape for the start of a word. Match the letter to its start shape.',
          pairs: [['ب', 'بـ'], ['ج', 'جـ'], ['س', 'سـ'], ['ع', 'عـ'], ['ف', 'فـ'], ['م', 'مـ']],
        },
        { type: 'scan', img: P(32), h: 'Write the joined shapes', say: 'Write each letter as it looks at the start, in the middle or at the end.' },
        { type: 'scan', img: P(33), h: 'Keep writing', say: 'Keep going with the rest of the letters. Say each shape out loud.' },
        { type: 'scan', img: P(34), h: 'Letters that stand alone', say: 'Look for the stars. Those six letters never join to the letter after them.', tap: T('ا د ذ ر ز و'), tapLabel: 'The letters that do not join forward' },
        {
          type: 'quiz', h: 'Which one does not join?',
          items: [
            { q: 'Which letter never joins to the letter after it?', a: 'د', w: ['ب', 'م'], why: 'Dal joins to the letter before it, but never to the one after.' },
            { q: 'Which letter never joins to the letter after it?', a: 'ر', w: ['س', 'ك'], why: 'Ra always leaves a little gap after it.' },
            { q: 'Which letter never joins to the letter after it?', a: 'و', w: ['ن', 'ع'], why: 'Waw does not hold hands with the next letter.' },
            { q: 'Which letter never joins to the letter after it?', a: 'ا', w: ['ل', 'ف'], why: 'Alif stands on its own after it.' },
          ],
        },
        {
          type: 'match', h: 'The end shape', prompt: 'Now match each letter to its shape at the end of a word.',
          pairs: [['ب', 'ـب'], ['ن', 'ـن'], ['ه', 'ـه'], ['ي', 'ـي'], ['ك', 'ـك'], ['ع', 'ـع']],
        },
        { type: 'scan', img: P(35), h: 'Joined letters with vowels', say: 'Now the joined letters have little marks on them. Read them slowly from the right.' },
        { type: 'scan', img: P(36), h: 'Copy the letters', say: 'Copy these letters into the space below. Take your time.' },
      ],
    },
    {
      title: 'Fat-ha', ar: 'فَتْحَة',
      pages: [
        {
          type: 'read', h: 'The little marks',
          text: [
            'Arabic letters wear little marks. The marks are called harakat, and they tell us how to say each letter.',
            'There are three short vowels.',
            { table: [['Mark', 'Name', 'Sound'], ['بَ', 'Fat-ha: a little line on top', 'ba'], ['بِ', 'Kasra: a little line underneath', 'bi'], ['بُ', 'Damma: a tiny Waw on top', 'bu']] },
            'Let\'s start with fat-ha.',
          ],
        },
        {
          type: 'scan', img: P(37), h: 'Fat-ha', say: 'Fat-ha is a small line on top of a letter. It makes an a sound, like in ba. Read each box from the right, and say the a sound clearly every time.',
          tap: S(['دَ', 'da'], ['مَ', 'ma'], ['طَ', 'ta'], ['صَ', 'sa'], ['فَتَحَ', 'fataha'], ['جَلَسَ', 'jalasa'], ['نَصَرَ', 'nasara'], ['خَرَجَ', 'kharaja']),
        },
        {
          type: 'scan', img: P(38), h: 'More fat-ha words', say: 'Every letter here has a fat-ha. Read the words slowly, one sound at a time.',
          tap: S(['بَ', 'ba'], ['تَ', 'ta'], ['ثَ', 'tha'], ['جَ', 'ja'], ['حَ', 'ha'], ['خَ', 'kha']), tapLabel: 'Tap to hear fat-ha',
        },
        {
          type: 'match', h: 'Match the sound', prompt: 'Match each letter with its sound.',
          pairs: [['بَ', 'ba'], ['تَ', 'ta'], ['دَ', 'da'], ['رَ', 'ra'], ['سَ', 'sa'], ['مَ', 'ma']],
        },
        { type: 'scan', img: P(39), h: 'Keep reading', say: 'Keep reading! Can you read a whole row without stopping?' },
        { type: 'scan', img: P(40), h: 'Writing', say: 'Copy each word into the box below it.' },
        { type: 'scan', img: P(41), h: 'Homework', say: 'This is your homework. Write the words in the boxes, then read them to someone at home.' },
      ],
    },
    {
      title: 'Kasra', ar: 'كَسْرَة',
      pages: [
        {
          type: 'scan', img: P(42), h: 'Kasra', say: 'Kasra is a small line under a letter. It makes an i sound, like in bi, so your mouth smiles a little when you say it. The book calls it kes-ra.',
          tap: S(['ثِ', 'thi'], ['ذِ', 'dhi'], ['زِ', 'zi'], ['بِكَ', 'bika'], ['لِمَ', 'lima'], ['فَرِحَ', 'fariha'], ['عَلِمَ', 'alima']),
        },
        {
          type: 'scan', img: P(43), h: 'More kasra words', say: 'Look for the line under the letter. That is where you say i.',
          tap: S(['بِ', 'bi'], ['تِ', 'ti'], ['سِ', 'si'], ['مِ', 'mi'], ['نِ', 'ni'], ['لِ', 'li']), tapLabel: 'Tap to hear kasra',
        },
        {
          type: 'quiz', h: 'How do you read it?',
          items: [
            { q: 'How do you read بِ?', a: 'bi', w: ['ba', 'bu'], why: 'The line is under the letter, so it says i.' },
            { q: 'How do you read مَ?', a: 'ma', w: ['mi', 'mu'], why: 'The line is on top. That is fat-ha, so it says a.' },
            { q: 'How do you read سِ?', a: 'si', w: ['sa', 'su'] },
            { q: 'Where does the kasra go?', a: 'Under the letter', w: ['On top of the letter'] },
          ],
        },
        { type: 'scan', img: P(44), h: 'Fat-ha and kasra', say: 'Some letters have fat-ha and some have kasra, so look closely at each mark before you read.' },
        {
          type: 'match', h: 'Match the sound', prompt: 'Match each letter with its sound.',
          pairs: [['بِ', 'bi'], ['مِ', 'mi'], ['لِ', 'li'], ['نِ', 'ni'], ['فِ', 'fi'], ['كِ', 'ki']],
        },
        { type: 'scan', img: P(45), h: 'Writing', say: 'Copy each word into the box below it.' },
        { type: 'scan', img: P(46), h: 'Homework', say: 'Your homework: write the kasra words in the boxes, then read them out loud.' },
      ],
    },
    {
      title: 'Damma', ar: 'ضَمَّة',
      pages: [
        {
          type: 'scan', img: P(47), h: 'Damma', say: 'Damma looks like a tiny Waw on top of a letter. It makes a u sound, like in bu. The book calls it dom-ma.',
          tap: S(['ثُ', 'thu'], ['صُ', 'su'], ['ذُ', 'dhu'], ['ظُ', 'zu'], ['هُوَ', 'huwa'], ['كَبُرَ', 'kabura'], ['تَجِدُ', 'tajidu']),
        },
        {
          type: 'scan', img: P(48), h: 'More damma words', say: 'Round your lips for the u sound, then read every word on the page from the right.',
          tap: S(['بُ', 'bu'], ['تُ', 'tu'], ['جُ', 'ju'], ['دُ', 'du'], ['رُ', 'ru'], ['نُ', 'nu']), tapLabel: 'Tap to hear damma',
        },
        { type: 'scan', img: P(49), h: 'Keep reading', say: 'This page mixes all three vowels, so look at each mark before you read the word.' },
        {
          type: 'sort', h: 'Fat-ha, kasra or damma?', prompt: 'Tap a letter, then the basket for its mark.',
          groups: ['Fat-ha (a)', 'Kasra (i)', 'Damma (u)'],
          items: [['بَ', 0], ['تِ', 1], ['جُ', 2], ['دَ', 0], ['رِ', 1], ['سُ', 2], ['كَ', 0], ['لِ', 1], ['مُ', 2], ['نَ', 0], ['هِ', 1], ['وُ', 2]],
        },
        {
          type: 'quiz', h: 'Which mark?',
          items: [
            { q: 'Which mark makes the u sound?', a: 'Damma', w: ['Fat-ha', 'Kasra'], why: 'Damma is the tiny Waw on top. It says u.' },
            { q: 'Which mark sits under the letter?', a: 'Kasra', w: ['Fat-ha', 'Damma'] },
            { q: 'How do you read تُ?', a: 'tu', w: ['ta', 'ti'] },
            { q: 'How do you read رَ?', a: 'ra', w: ['ri', 'ru'] },
            { q: 'Which mark makes the a sound?', a: 'Fat-ha', w: ['Kasra', 'Damma'], why: 'Fat-ha is the little line on top.' },
          ],
        },
        { type: 'scan', img: P(50), h: 'Joined letters with vowels', say: 'Here the letters are joined and each one has a vowel. Read from the right, one sound at a time.' },
        {
          type: 'match', h: 'Match the sound', prompt: 'Same letter, different marks. Match each one with its sound.',
          pairs: [['جَ', 'ja'], ['جِ', 'ji'], ['جُ', 'ju'], ['لَ', 'la'], ['لِ', 'li'], ['لُ', 'lu']],
        },
      ],
    },
    {
      title: 'The long Alif', ar: 'مَدّ',
      pages: [
        {
          type: 'read', h: 'Long sounds',
          text: [
            'Sometimes a letter is followed by Alif, Waw or Ya with no mark on it.',
            'That plain letter makes the sound longer. It is called a madd letter.',
            { table: [['Short', 'Long'], ['بَ ba', 'بَا baa'], ['بِ bi', 'بِي bii'], ['بُ bu', 'بُو buu']] },
            'Hold a long sound for two counts.',
          ],
        },
        {
          type: 'scan', img: P(51), h: 'Madd with Alif', say: 'Alif with no mark is a madd letter. A fat-ha before it makes a long aa, like in maa.',
          tap: S(['يَا', 'yaa'], ['مَا', 'maa'], ['قَالَ', 'qaala'], ['صَامَ', 'saama'], ['كِتَابُ', 'kitaabu'], ['عَذَابُ', 'adhaabu']),
        },
        {
          type: 'scan', img: P(52), h: 'Madd mushrooms', say: 'Read the word on each mushroom, and make the aa sound nice and long, like a song!',
          tap: S(['قَالَ', 'qaala'], ['كَانَ', 'kaana'], ['صَارَ', 'saara'], ['قَامَ', 'qaama'], ['زَادَ', 'zaada'], ['دَامَ', 'daama']),
        },
        { type: 'scan', img: P(53), h: 'Writing', say: 'Copy the words into the boxes.' },
        {
          type: 'quiz', h: 'Short or long?',
          items: [
            { q: 'Which one has a long aa sound?', a: 'بَا', w: ['بَ', 'بِ'], why: 'The Alif after the fat-ha makes the sound long.' },
            { q: 'Which one has a long aa sound?', a: 'مَا', w: ['مَ', 'مُ'] },
            { q: 'Which mark comes before a madd Alif?', a: 'Fat-ha', w: ['Kasra', 'Damma'], why: 'Fat-ha and Alif go together to make aa.' },
          ],
        },
        { type: 'scan', img: P(54), h: 'More long Alif words', say: 'Here are more words with the long Alif, so read them slowly and hold each aa.' },
        { type: 'scan', img: P(55), h: 'Madd reading', say: 'Read every word on this page. Stretch each aa for two counts.' },
      ],
    },
    {
      title: 'The long Ya and Waw', ar: 'ي و',
      pages: [
        {
          type: 'scan', img: P(56), h: 'Madd with Ya', say: 'Ya with no mark is a madd letter too. A kasra before it makes a long ii, like in fii.',
          tap: S(['فِى', 'fii'], ['قِيلَ', 'qiila'], ['رَحِيمُ', 'rahiimu'], ['عَلِيمُ', 'aliimu'], ['كَثِيرُ', 'kathiiru'], ['بَصِيرُ', 'basiiru']),
        },
        { type: 'scan', img: P(57), h: 'Writing', say: 'Copy the words in the big box.' },
        { type: 'scan', img: P(58), h: 'Writing', say: 'Copy each word into the empty box under it.' },
        { type: 'scan', img: P(59), h: 'More long Ya words', say: 'More words with the long ii. Read them once, then read them again a bit faster.' },
        {
          type: 'scan', img: P(60), h: 'Madd with Waw', say: 'Waw with no mark is a madd letter. A damma before it makes a long uu, like in nuur.',
          tap: S(['رُوحُ', 'ruuhu'], ['رَسُولُ', 'rasuulu'], ['يَقُولُ', 'yaquulu'], ['يُوسُفُ', 'yuusufu'], ['غَفُورُ', 'ghafuuru'], ['قُلُوبُ', 'quluubu']),
        },
        { type: 'scan', img: P(61), h: 'More long Waw words', say: 'Keep reading the uu words. Round your lips and hold the sound.' },
        {
          type: 'sort', h: 'Which long sound?', prompt: 'Listen in your head. Is it aa, ii or uu?',
          groups: ['aa (Alif)', 'ii (Ya)', 'uu (Waw)'],
          items: [['مَا', 0], ['قَالَ', 0], ['كِتَابُ', 0], ['فِى', 1], ['قِيلَ', 1], ['رَحِيمُ', 1], ['يَقُولُ', 2], ['رَسُولُ', 2], ['غَفُورُ', 2]],
        },
        { type: 'scan', img: P(62), h: 'Madd practice', say: 'This page mixes all the madd letters, so give each word its own long sound.' },
        { type: 'scan', img: P(63), h: 'Madd practice', say: 'Read each row from the right. Which madd letter do you see?' },
        { type: 'scan', img: P(64), h: 'Madd practice', say: 'One more page! Read it slowly, then show your teacher how well you can read the long sounds.' },
        {
          type: 'match', h: 'Match the long sound', prompt: 'Match each one with its long sound.',
          pairs: [['بَا', 'baa'], ['بِي', 'bii'], ['بُو', 'buu'], ['تَا', 'taa'], ['تِي', 'tii'], ['تُو', 'tuu']],
        },
      ],
    },
    {
      title: 'Sukun', ar: 'سُكُون',
      pages: [
        {
          type: 'scan', img: P(65), h: 'Sukun', say: 'Sukun is a small circle on top of a letter. That letter has no vowel of its own. Join it to the letter before it.',
          tap: S(['لَمْ', 'lam'], ['قَدْ', 'qad'], ['عَنْ', 'an'], ['مَنْ', 'man'], ['هَلْ', 'hal'], ['كُنْ', 'kun']),
        },
        {
          type: 'quiz', h: 'Sukun',
          items: [
            { q: 'What does a sukun tell you?', a: 'The letter has no vowel', w: ['Say the letter twice', 'Make the sound long'] },
            { q: 'How do you read مِنْ?', a: 'min', w: ['mini', 'mina'], why: 'The Nun has a sukun, so we stop on it: min.' },
            { q: 'How do you read لَمْ?', a: 'lam', w: ['lama', 'lamu'] },
          ],
        },
        { type: 'scan', img: P(66), h: 'Reading with sukun', say: 'Read each word. When you reach a sukun, stop on that letter. Don\'t add a vowel.' },
        { type: 'scan', img: P(67), h: 'Writing', say: 'Copy the words above into the empty boxes.' },
      ],
    },
    {
      title: 'Shadda', ar: 'شَدَّة',
      pages: [
        {
          type: 'scan', img: P(68), h: 'Shadda', say: 'Shadda looks like a small w on top of a letter. It means you say the letter twice. First with a sukun, then with its vowel.',
          tap: S(['اَنَّ', 'anna'], ['اِنَّ', 'inna'], ['كُلَّ', 'kulla'], ['مُرَّ', 'murra'], ['حَقَّ', 'haqqa'], ['سَلَّمَ', 'sallama']),
        },
        { type: 'scan', img: P(69), h: 'More shadda words', say: 'Read each word. Press on the letter with the shadda and hold it a little.' },
        { type: 'scan', img: P(70), h: 'Shadda and sukun', say: 'This page has words with sukun and with shadda. Read slowly and look at every mark.' },
        {
          type: 'quiz', h: 'Shadda or sukun?',
          items: [
            { q: 'Which mark means you say the letter twice?', a: 'Shadda', w: ['Sukun', 'Fat-ha'] },
            { q: 'Which mark means the letter has no vowel?', a: 'Sukun', w: ['Shadda', 'Damma'] },
            { q: 'How do you read اِنَّ?', a: 'in-na', w: ['i-na', 'i-naa'], why: 'The shadda doubles the Nun: in, then na.' },
            { q: 'How do you read كُلَّ?', a: 'kul-la', w: ['ku-la', 'kaa-la'] },
          ],
        },
      ],
    },
    {
      title: 'Tanween', ar: 'تَنْوِين',
      pages: [
        {
          type: 'read', h: 'Two marks at the end',
          text: [
            'Sometimes the last letter of a word has two vowel marks. This is called tanween.',
            'Tanween adds a little n sound at the end.',
            { table: [['Marks', 'Sound', 'Example'], ['ـً', 'an', 'وَلَدًا waladan'], ['ـٍ', 'in', 'نُورٍ nuurin'], ['ـٌ', 'un', 'قَمَرٌ qamarun']] },
          ],
        },
        {
          type: 'scan', img: P(71), h: 'Two fat-has', say: 'Two fat-has make an an sound, like in waladan. An Alif often comes after them.',
          tap: S(['اَبَدًا', 'abadan'], ['وَلَدًا', 'waladan'], ['حَسَنًا', 'hasanan'], ['عَمَلًا', 'amalan'], ['نَهَرًا', 'naharan']),
        },
        {
          type: 'scan', img: P(72), h: 'Two kasras', say: 'Two kasras make an in sound, like in nuurin.',
          tap: S(['نُورٍ', 'nuurin'], ['خَوْفٍ', 'khawfin'], ['لَهَبٍ', 'lahabin'], ['جُوعٍ', 'juuin'], ['اَجْرٍ', 'ajrin']),
        },
        {
          type: 'scan', img: P(73), h: 'Two dammas', say: 'Two dammas make an un sound, like in qamarun.',
          tap: S(['قَمَرٌ', 'qamarun'], ['نَجْمٌ', 'najmun'], ['قَلَمٌ', 'qalamun'], ['رَحِيمٌ', 'rahiimun'], ['غَفُورٌ', 'ghafuurun']),
        },
        {
          type: 'sort', h: 'an, in or un?', prompt: 'Which sound does the tanween make? Put each word in its basket.',
          groups: ['an', 'in', 'un'],
          items: [['وَلَدًا', 0], ['حَسَنًا', 0], ['عَمَلًا', 0], ['نُورٍ', 1], ['خَوْفٍ', 1], ['لَهَبٍ', 1], ['قَمَرٌ', 2], ['نَجْمٌ', 2], ['رَحِيمٌ', 2]],
        },
        {
          type: 'match', h: 'Match the sound', prompt: 'Match each one with its sound.',
          pairs: [['بًا', 'ban'], ['بٍ', 'bin'], ['بٌ', 'bun'], ['دًا', 'dan'], ['دٍ', 'din'], ['دٌ', 'dun']],
        },
      ],
    },
    {
      title: 'Special signs',
      pages: [
        {
          type: 'scan', img: P(74), h: 'Ha at the end of a word',
          say: 'The little Ha at the end of a word can be long or short. After a letter with a vowel, make it long. After a sukun or a madd letter, keep it short.',
          tap: S(['لَهُ', 'lahuu'], ['رَبِّهِ', 'rabbihii'], ['مِنْهُ', 'minhu'], ['عَلَيْهِ', 'alayhi']),
          check: 'The second rule on page 74 is printed in Turkish. The spoken line gives it in English.',
        },
        { type: 'scan', img: P(75), h: 'Long Ha or short Ha?', say: 'Read the words again. For each one, decide: long Ha or short Ha?' },
        {
          type: 'scan', img: P(76), h: 'Hidden madd', say: 'A small standing line on top is a hidden Alif. Read it as a long aa. A small standing line underneath is a long ii. The wavy madd sign means hold the sound even longer.',
          tap: S(['ذٰلِكَ', 'dhaalika'], ['اِلٰهِ', 'ilaahi'], ['اٰمِينَ', 'aamiina']),
        },
        {
          type: 'scan', img: P(77), h: 'Letters we write but do not read',
          say: 'When a word ends in Waw and Alif, we do not read the Alif. In a few words, a Waw or a Ya is read as a long aa.',
          tap: S(['قَالُوا', 'qaaluu'], ['كَانُوا', 'kaanuu'], ['صَلٰوةٌ', 'salaatun'], ['مُوسٰى', 'muusaa']),
        },
        { type: 'scan', img: P(78), h: 'Long or short', say: 'A small madd sign under a letter means make it long. The word qasr under a letter means keep it short.' },
        {
          type: 'quiz', h: 'Special signs',
          items: [
            { q: 'In قَالُوا, do we read the Alif at the end?', a: 'No', w: ['Yes'], why: 'After a Waw at the end of a word, that Alif is silent.' },
            { q: 'What does the wavy madd sign tell you?', a: 'Hold the sound longer', w: ['Stop reading', 'Skip the letter'] },
            { q: 'In ذٰلِكَ, how do you read the Dhal?', a: 'dhaa', w: ['dha', 'dhi'], why: 'The small standing line is a hidden Alif, so it is long.' },
          ],
        },
      ],
    },
    {
      title: 'Reading the Qur\'an',
      pages: [
        {
          type: 'scan', img: P(79), h: 'Letters at the start of surahs',
          say: 'Twenty-nine surahs begin with single letters. We read each one by its name, like Alif Lam Mim. Tap to hear them.',
          tap: T('ا ل م ي س ق ن ص'), tapLabel: 'Hear the letter names',
        },
        { type: 'scan', img: P(80), h: 'The name of Allah', say: 'After a fat-ha or a damma, say the Lam in Allah full and heavy. After a kasra, say it light and thin, as in Bismillah. Try it now.' },
        {
          type: 'quiz', h: 'Heavy or light?',
          items: [
            { q: 'In هُوَ اللّٰهُ, is the Lam in Allah heavy or light?', a: 'Heavy', w: ['Light'], why: 'The letter before Allah has a fat-ha, so the Lam is heavy.' },
            { q: 'In بِسْمِ اللّٰهِ, is the Lam in Allah heavy or light?', a: 'Light', w: ['Heavy'], why: 'The Mim has a kasra, so the Lam is light.' },
            { q: 'In رَسُولُ اللّٰهِ, is the Lam in Allah heavy or light?', a: 'Heavy', w: ['Light'], why: 'The Lam before Allah has a damma, so we say it heavy.' },
            { q: 'In عِبَادِ اللّٰهِ, is the Lam in Allah heavy or light?', a: 'Light', w: ['Heavy'] },
          ],
        },
        { type: 'scan', img: P(81), h: 'Stopping', say: 'When you stop at the end of a word, the last letter gets a sukun. Tanween with an Alif turns into a long aa. Try a few words.' },
        {
          type: 'scan', img: P(82), h: 'Sun and moon letters',
          say: 'Shamsiyya means sun letters. After al, we do not say the Lam before them. Qamariyya means moon letters, and we say the Lam clearly. Tap and listen.',
          tap: S(['اَلرَّحِيمُ', 'ar-rahiimu'], ['اَلسَّلَامُ', 'as-salaamu'], ['اَلنَّهَارُ', 'an-nahaaru'], ['اَلْحَمْدُ', 'al-hamdu'], ['اَلْقُدُّوسُ', 'al-qudduusu'], ['اَلْكَعْبَةُ', 'al-kabatu']),
        },
        {
          type: 'sort', h: 'Sun or moon?', prompt: 'Is it a sun letter or a moon letter?',
          groups: ['Sun: no Lam sound', 'Moon: say the Lam'],
          items: [['ت', 0], ['د', 0], ['ر', 0], ['س', 0], ['ش', 0], ['ن', 0], ['ب', 1], ['ج', 1], ['ح', 1], ['ق', 1], ['ك', 1], ['م', 1]],
        },
      ],
    },
    {
      title: 'Nun with sukun',
      pages: [
        {
          type: 'read', h: 'Four rules for Nun',
          text: [
            'Here are four rules for a Nun with sukun (نْ) and for tanween.',
            'Which rule you use depends on the letter that comes next.',
            { table: [['Rule', 'What you do', 'Next letter'], ['Izhar', 'Say the Nun clearly', 'ء ه ع ح غ خ'], ['Idgham', 'Merge the Nun into the next letter', 'ي ن م و ل ر'], ['Iqlab', 'Change the Nun to a Mim sound', 'ب'], ['Ikhfa', 'Hide the Nun in a soft nasal sound', 'the other 15 letters']] },
          ],
        },
        {
          type: 'scan', img: P(83), h: 'Idgham',
          say: 'Idgham means merging. Before Ya, Nun, Mim or Waw, the Nun merges with a hum called ghunna. Before Lam or Ra, it merges with no hum.',
          check: 'Page 83 prints the idgham letters as ب ج م و (with ghunna) and ا ل ر ز (without). The correct letters are ي ن م و with ghunna and ل ر without, as the examples on the page show. The spoken line and the table give the correct letters; please correct the page in the Canva book.',
        },
        { type: 'scan', img: P(84), h: 'Iqlab', say: 'Iqlab means changing. When Ba comes after the Nun, we say a Mim sound instead, with a hum.' },
        { type: 'scan', img: P(85), h: 'Izhar', say: 'Izhar means making clear. Before the six throat letters, say the Nun clearly with no hum.' },
        { type: 'scan', img: P(86), h: 'Ikhfa', say: 'Ikhfa means hiding. Before these fifteen letters, say the Nun softly through your nose.' },
        {
          type: 'match', h: 'What does it mean?', prompt: 'Match each rule with what it means.',
          pairs: [['Izhar', 'Make it clear'], ['Idgham', 'Merge it'], ['Iqlab', 'Change it to Mim'], ['Ikhfa', 'Hide it']],
        },
        {
          type: 'quiz', h: 'Which rule?',
          items: [
            { q: 'Which letter after a Nun makes iqlab?', a: 'ب', w: ['ه', 'ل'], why: 'Only Ba makes iqlab.' },
            { q: 'In مِنْ خَوْفٍ, Kha comes after the Nun. Which rule is it?', a: 'Izhar', w: ['Idgham', 'Ikhfa'], why: 'Kha is a throat letter, so the Nun is said clearly.' },
            { q: 'Which rule means hiding?', a: 'Ikhfa', w: ['Izhar', 'Iqlab'] },
            { q: 'Which letter merges with the Nun without a hum?', a: 'ر', w: ['ب', 'ع'], why: 'Lam and Ra merge with no hum.' },
          ],
        },
      ],
    },
    {
      title: 'Du\'as of the prayer', ar: 'دُعَاء',
      pages: [
        { type: 'scan', img: P(87), draw: false, h: 'Du\'a', say: 'These are du\'as we say in our prayer. Ask a grown-up to read them with you.' },
        {
          type: 'dua', h: 'Opening the prayer',
          ar: 'سُبْحَانَكَ اللّٰهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالٰى جَدُّكَ وَجَلَّ ثَنَاؤُكَ وَلَا اِلٰهَ غَيْرُكَ',
          tr: 'Subhanaka Allahumma wa bihamdika, wa tabarakasmuka, wa ta\'ala jadduka, wa jalla thana\'uka, wa la ilaha ghairuk.',
          en: 'Glory be to You, O Allah, and all praise is Yours. Blessed is Your name and high is Your majesty. Great is Your praise, and there is no god but You.',
          when: 'At the start of the prayer, after the first Allahu akbar.',
          check: 'Arabic typed from page 87; please compare. "Wa jalla thana\'uk" is in brackets in the book.',
        },
        {
          type: 'dua', h: 'At-tahiyyat',
          ar: 'اَلتَّحِيَّاتُ لِلّٰهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، اَلسَّلَامُ عَلَيْكَ اَيُّهَا النَّبِيُّ وَرَحْمَةُ اللّٰهِ وَبَرَكَاتُهُ، اَلسَّلَامُ عَلَيْنَا وَعَلٰى عِبَادِ اللّٰهِ الصَّالِحِينَ، اَشْهَدُ اَنْ لَا اِلٰهَ اِلَّا اللّٰهُ وَاَشْهَدُ اَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
          tr: 'At-tahiyyatu lillahi was-salawatu wat-tayyibat. As-salamu alaika ayyuhan-nabiyyu wa rahmatullahi wa barakatuh. As-salamu alaina wa ala ibadillahis-salihin. Ash-hadu an la ilaha illallah, wa ash-hadu anna Muhammadan abduhu wa rasuluh.',
          en: 'All greetings, prayers and good words are for Allah. Peace be on you, O Prophet, and the mercy of Allah and His blessings. Peace be on us and on the good servants of Allah. I bear witness that there is no god but Allah, and I bear witness that Muhammad is His servant and His Messenger.',
          when: 'When we sit in the prayer.',
          src: 'Sahih al-Bukhari 831',
          check: 'Arabic typed from page 87; please compare.',
        },
        {
          type: 'dua', h: 'Salawat',
          ar: 'اَللّٰهُمَّ صَلِّ عَلٰى مُحَمَّدٍ وَعَلٰى اٰلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلٰى اِبْرَاهِيمَ وَعَلٰى اٰلِ اِبْرَاهِيمَ، اِنَّكَ حَمِيدٌ مَجِيدٌ. اَللّٰهُمَّ بَارِكْ عَلٰى مُحَمَّدٍ وَعَلٰى اٰلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلٰى اِبْرَاهِيمَ وَعَلٰى اٰلِ اِبْرَاهِيمَ، اِنَّكَ حَمِيدٌ مَجِيدٌ',
          tr: 'Allahumma salli ala Muhammadin wa ala ali Muhammad, kama sallaita ala Ibrahima wa ala ali Ibrahim, innaka hamidun majid. Allahumma barik ala Muhammadin wa ala ali Muhammad, kama barakta ala Ibrahima wa ala ali Ibrahim, innaka hamidun majid.',
          en: 'O Allah, send Your prayers on Muhammad and on the family of Muhammad, as You sent Your prayers on Ibrahim and on the family of Ibrahim. You are the Praised, the Glorious. O Allah, bless Muhammad and the family of Muhammad, as You blessed Ibrahim and the family of Ibrahim. You are the Praised, the Glorious.',
          when: 'After at-tahiyyat, in the last sitting of the prayer.',
          src: 'Sahih al-Bukhari 3370',
          check: 'Arabic typed from page 87; please compare.',
        },
        {
          type: 'scan', img: P(88), draw: false, h: 'More du\'as', say: 'Two of these du\'as begin with Rabbana. Rabbana means our Lord.',
          check: 'Page 88 also has the du\'a of qunut and Amantu billahi. They are shown only in the page picture.',
        },
        { type: 'ayah', h: 'Rabbana atina', s: 2, a: 201, w: [4, 14], en: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.' },
        { type: 'ayah', h: 'Rabbanaghfir li', s: 14, a: 41, en: 'Our Lord, forgive me and my parents and the believers on the Day the account is taken.' },
      ],
    },
    {
      title: 'Short surahs', ar: 'قُرْآن',
      pages: [
        { type: 'scan', img: P(89), draw: false, h: 'Qur\'an', say: 'Here is al-Fatiha, followed by al-Fil and Quraysh. Read them with your teacher, slowly and clearly.' },
        { type: 'scan', img: P(90), draw: false, h: 'Three more surahs', say: 'This page has al-Ma\'un and al-Kawthar. Then comes al-Kafirun.' },
        { type: 'scan', img: P(91), draw: false, h: 'An-Nasr to al-Ikhlas', say: 'Here are an-Nasr and al-Masad. The last one on the page is al-Ikhlas.' },
        { type: 'ayah', h: 'Al-Ikhlas', s: 112, a: 1, en: 'Say: He is Allah, the One.' },
        { type: 'ayah', s: 112, a: 2, en: 'Allah, the One everyone needs, who needs no one.' },
        { type: 'ayah', s: 112, a: 3, en: 'He has no child, and He was not born.' },
        { type: 'ayah', s: 112, a: 4, en: 'And there is nothing like Him.' },
        { type: 'scan', img: P(92), draw: false, h: 'Al-Falaq and an-Nas', say: 'These are the last two surahs of the Qur\'an. We read them to ask Allah to keep us safe.' },
      ],
    },
    {
      title: 'Writing practice',
      pages: [
        { type: 'scan', img: P(93), h: 'Copy the words', say: 'Copy these words into the boxes. Write neatly, from right to left.' },
        { type: 'scan', img: P(94), h: 'Write the letters', say: 'Write the letters in the shapes. Say each one as you write. Well done for finishing your Alif Ba book!' },
      ],
    },
  ],
};
