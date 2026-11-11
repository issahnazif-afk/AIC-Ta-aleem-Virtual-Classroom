// My First Arabic Letters 2: the school’s "Pre-schooler Arabic Book" volume II, page by page.
// Each letter page has the letter with fatha, kasra and dhamma, three picture words and the letter's joined forms.
// Between the letters come practice pages: matching, circling, the short vowels and the joined forms.
const img = (n) => `books/first-arabic-2/${String(n).padStart(3, '0')}.webp`;
const L = (ar, en) => ({ ar, letter: ar, en });
const W = (ar, en) => ({ ar, en });

export default {
  id: 'first-arabic-2', title: 'My First Arabic Letters 2', ar: 'حُرُوفِي الْأُولَى ٢', level: 1, ages: '4–6', color: '#1F9AA8',
  cover: 'books/first-arabic-2/001.webp',
  about: 'The 28 letters again, now with three picture words each, the short vowels and the joined letter shapes.',
  unit: 'chapters',
  note: 'For teachers: every page of the printed workbook is here in order. On each letter page the child taps the letter and the three words to hear them, then colours and fills in the letter shapes with the crayons.',
  chapters: [
    {
      title: 'Alif and Ba', ar: 'أ ب',
      pages: [
        { type: 'scan', img: img(1), draw: false, say: 'This is your second Arabic letter book. Let us read and colour!' },
        { type: 'scan', img: img(2), say: 'This is Alif. Arnab is a rabbit. Udhun is an ear. Ibreeq is a teapot. Colour them all, then trace the Alifs at the bottom.', tap: [L('ا', 'Alif'), W('أَرْنَب', 'rabbit'), W('أُذُن', 'ear'), W('إِبْرِيق', 'teapot')] },
        { type: 'scan', img: img(3), say: 'Join the letters that are the same. Then join the letters in order, from Alif to Ya. What do you see?', tap: [L('ا', 'Alif'), L('س', 'Seen'), L('ف', 'Fa'), L('ح', 'Haa'), L('د', 'Dal')] },
        { type: 'scan', img: img(4), say: 'This is Ba. Bayt is a house. Burtuqala is an orange. Bint is a girl.', tap: [L('ب', 'Ba'), W('بَيْت', 'house'), W('بُرْتُقَالَة', 'orange'), W('بِنْت', 'girl')] },
        { type: 'scan', img: img(5), say: 'Look at the first letter in each row. Circle the one just like it. Then find the first letter of each picture. Circle it!', tap: [W('بَيْت', 'house'), W('جَمَل', 'camel'), W('دِيك', 'rooster')] },
      ],
    },
    {
      title: 'Ta and Tha', ar: 'ت ث',
      pages: [
        { type: 'scan', img: img(6), say: 'This is Ta. Taj is a crown. Tuffaha is an apple. Timsah is a crocodile. Snap!', tap: [L('ت', 'Ta'), W('تَاج', 'crown'), W('تُفَّاحَة', 'apple'), W('تِمْسَاح', 'crocodile')] },
        { type: 'scan', img: img(7), say: 'Some letters lost their dots. Put the dots back! Then write the first letter of each picture in its circle.', tap: [W('أَرْنَب', 'rabbit'), W('تِمْسَاح', 'crocodile'), W('أُذُن', 'ear'), W('إِبْرِيق', 'teapot'), W('تُفَّاحَة', 'apple'), W('بَيْت', 'house')] },
        { type: 'scan', img: img(8), say: 'This is Tha. Thawb is a dress. Thu\'ban is a snake. Thiyab are clothes.', tap: [L('ث', 'Tha'), W('ثَوْب', 'dress'), W('ثُعْبَان', 'snake'), W('ثِيَاب', 'clothes')] },
        { type: 'scan', img: img(9), say: 'The little line on top is a fatha. It says a. Read every letter with a fatha: ba, ta, tha. Then join the letters that match.', tap: [L('ب', 'Ba'), L('ت', 'Ta'), L('ث', 'Tha'), L('س', 'Seen'), L('د', 'Dal')] },
        { type: 'find', letters: ['ا', 'ب', 'ت', 'ث'] },
        { type: 'match', prompt: 'Match each word to its picture word.', pairs: [['تَاج', 'crown'], ['تِمْسَاح', 'crocodile'], ['ثُعْبَان', 'snake'], ['بِنْت', 'girl']] },
      ],
    },
    {
      title: 'Jeem and Haa', ar: 'ج ح',
      pages: [
        { type: 'scan', img: img(10), say: 'This is Jeem. Jamal is a camel. Jundi is a soldier. Jidar is a wall.', tap: [L('ج', 'Jeem'), W('جَمَل', 'camel'), W('جُنْدِيّ', 'soldier'), W('جِدَار', 'wall')] },
        { type: 'scan', img: img(11), say: 'These are doing words. Every letter has a fatha. Read each one with your teacher, then write it on the line.', tap: [W('قَرَأَ', 'he read'), W('كَتَبَ', 'he wrote'), W('جَلَسَ', 'he sat'), W('حَمَلَ', 'he carried'), W('سَبَحَ', 'he swam'), W('سَجَدَ', 'he prostrated')] },
        { type: 'scan', img: img(12), say: 'This is Haa. Haqeeba is a bag. Hoot is a whale. Himar is a donkey.', tap: [L('ح', 'Haa'), W('حَقِيبَة', 'bag'), W('حُوت', 'whale'), W('حِمَار', 'donkey')] },
        { type: 'scan', img: img(13), say: 'Tap the words to hear them. Then circle only the letters that have a fatha on top.', tap: [W('قَمَر', 'moon'), W('عَلَم', 'flag'), W('سَمَكَة', 'fish'), W('جَرَس', 'bell'), W('لَحْم', 'meat'), W('جَزَر', 'carrots'), W('لَبَن', 'milk'), W('جَمَل', 'camel'), W('شَمْس', 'sun')] },
        { type: 'find', letters: ['ج', 'ح', 'ت', 'ث', 'ب'] },
        { type: 'match', prompt: 'Match each word to its picture word.', pairs: [['قَمَر', 'moon'], ['سَمَكَة', 'fish'], ['جَرَس', 'bell'], ['شَمْس', 'sun']] },
      ],
    },
    {
      title: 'Kha and Dal', ar: 'خ د',
      pages: [
        { type: 'scan', img: img(14), say: 'This is Kha. Kharoof is a sheep. Khubz is bread. Khiyar is a cucumber.', tap: [L('خ', 'Kha'), W('خَرُوف', 'sheep'), W('خُبْز', 'bread'), W('خِيَار', 'cucumber')] },
        { type: 'scan', img: img(15), say: 'The little line under a letter is a kasra. It says i. Read the letters: bi, ti, thi. Circle the ones with a kasra.', tap: [L('ب', 'Ba'), L('ت', 'Ta'), L('ض', 'Daad'), L('ح', 'Haa')] },
        { type: 'scan', img: img(16), say: 'This is Dal. Darraja is a bicycle. Dubb is a bear. Deek is a rooster.', tap: [L('د', 'Dal'), W('دَرَّاجَة', 'bicycle'), W('دُبّ', 'bear'), W('دِيك', 'rooster')] },
        { type: 'scan', img: img(17), say: 'More doing words. Look for the kasra in the middle of each one. Read them, then write them.', tap: [W('شَرِبَ', 'he drank'), W('فَرِحَ', 'he was happy'), W('رَكِبَ', 'he rode'), W('لَعِبَ', 'he played'), W('غَضِبَ', 'he got angry')] },
        { type: 'find', letters: ['خ', 'د', 'ج', 'ح'] },
        { type: 'quiz', items: [
          { q: 'Which one is bread?', a: 'خُبْز', w: ['خِيَار', 'دِيك'], why: 'Khubz is bread.' },
          { q: 'Which one is a bear?', a: 'دُبّ', w: ['خَرُوف', 'دَرَّاجَة'], why: 'Dubb is a bear.' },
        ] },
      ],
    },
    {
      title: 'Dhal and Ra', ar: 'ذ ر',
      pages: [
        { type: 'scan', img: img(18), say: 'This is Dhal. Dhayl is a tail. Dhura is corn. Dhi\'b is a wolf. Awoo!', tap: [L('ذ', 'Dhal'), W('ذَيْل', 'tail'), W('ذُرَة', 'corn'), W('ذِئْب', 'wolf')] },
        { type: 'scan', img: img(19), say: 'Lots of words start with a kasra. Tap them and listen for the i. Then write a fatha or a kasra in each circle.', tap: [W('قِرْد', 'monkey'), W('فِيل', 'elephant'), W('قِطّ', 'cat'), W('حِصَان', 'horse'), W('حِمَار', 'donkey'), W('بِنْت', 'girl'), W('لِسَان', 'tongue'), W('تِمْسَاح', 'crocodile'), W('لِحْيَة', 'beard')] },
        { type: 'scan', img: img(20), say: 'This is Ra. Rajul is a man. Rukba is a knee. Reesh is feathers.', tap: [L('ر', 'Ra'), W('رَجُل', 'man'), W('رُكْبَة', 'knee'), W('رِيش', 'feathers')] },
        { type: 'scan', img: img(21), say: 'The little curl on top is a dhamma. It says u. Read bu, tu, thu. Circle all the dhamma letters on the tree.', tap: [L('د', 'Dal'), L('ر', 'Ra'), L('ص', 'Saad'), L('ج', 'Jeem')] },
        { type: 'find', letters: ['ذ', 'ر', 'د', 'خ', 'ز'] },
        { type: 'match', prompt: 'Match each word to its picture word.', pairs: [['قِرْد', 'monkey'], ['فِيل', 'elephant'], ['حِصَان', 'horse'], ['ذِئْب', 'wolf']] },
      ],
    },
    {
      title: 'Zay and Seen', ar: 'ز س',
      pages: [
        { type: 'scan', img: img(22), say: 'This is Zay. Zarafa is a giraffe. Zuhoor are flowers. Zirr is a button.', tap: [L('ز', 'Zay'), W('زَرَافَة', 'giraffe'), W('زُهُور', 'flowers'), W('زِرّ', 'button')] },
        { type: 'scan', img: img(23), say: 'These words start with a dhamma. Read them with your teacher. Then write each word on its line.', tap: [W('سُقِيَ', 'it was watered'), W('وُلِدَ', 'he was born'), W('غُسِلَ', 'he was washed'), W('كُسِرَ', 'it was broken')] },
        { type: 'scan', img: img(24), say: 'This is Seen. Samaka is a fish. Sullam is a ladder. Sikkeen is a knife.', tap: [L('س', 'Seen'), W('سَمَكَة', 'fish'), W('سُلَّم', 'ladder'), W('سِكِّين', 'knife')] },
        { type: 'scan', img: img(25), say: 'Every word here starts with a dhamma. Tap and listen. Then fill in the missing letters at the bottom.', tap: [W('كُرَة', 'ball'), W('كُتُب', 'books'), W('كُرْسِيّ', 'chair'), W('صُنْدُوق', 'box'), W('بُرْتُقَالَة', 'orange'), W('صُورَة', 'picture'), W('سُلَحْفَاة', 'tortoise'), W('دُبّ', 'bear'), W('فُرْشَاة', 'brush')] },
        { type: 'find', letters: ['ز', 'س', 'ر', 'ذ'] },
        { type: 'quiz', items: [
          { q: 'Which one is a giraffe?', a: 'زَرَافَة', w: ['سَمَكَة', 'سُلَّم'], why: 'Zarafa is a giraffe.' },
          { q: 'Which one is a ladder?', a: 'سُلَّم', w: ['سِكِّين', 'زِرّ'], why: 'Sullam is a ladder.' },
        ] },
      ],
    },
    {
      title: 'Sheen and Saad', ar: 'ش ص',
      pages: [
        { type: 'scan', img: img(26), say: 'This is Sheen. Shams is the sun. Shubbak is a window. Shira\' is a sail on a boat.', tap: [L('ش', 'Sheen'), W('شَمْس', 'sun'), W('شُبَّاك', 'window'), W('شِرَاع', 'sail')] },
        { type: 'scan', img: img(27), say: 'Put each letter in the right box: fatha, kasra or dhamma. Then join the letters that have the same vowel.', tap: [L('ب', 'Ba'), L('ف', 'Fa'), L('س', 'Seen')] },
        { type: 'scan', img: img(28), say: 'This is Saad. Saboon is soap. Sundooq is a box. Seeniyya is a tray.', tap: [L('ص', 'Saad'), W('صَابُون', 'soap'), W('صُنْدُوق', 'box'), W('صِينِيَّة', 'tray')] },
        { type: 'scan', img: img(29), say: 'Letters change shape inside a word. Read each letter with your teacher at the start, middle and end.' },
        { type: 'find', letters: ['ش', 'ص', 'س', 'ز'] },
      ],
    },
    {
      title: 'Daad and Taa', ar: 'ض ط',
      pages: [
        { type: 'scan', img: img(30), say: 'This is Daad. Dabu\' is a hyena. Duroos are back teeth. Difda\' is a frog.', tap: [L('ض', 'Daad'), W('ضَبُع', 'hyena'), W('ضُرُوس', 'back teeth'), W('ضِفْدَع', 'frog')] },
        { type: 'scan', img: img(31), say: 'Here is how each letter looks at the start of a word. Circle the shape that matches the letter in each row.', tap: [L('س', 'Seen'), L('ع', 'Ain'), L('ص', 'Saad'), L('ف', 'Fa'), L('ح', 'Haa')] },
        { type: 'scan', img: img(32), say: 'This is Taa. Ta\'ira is an aeroplane. Tuyoor are birds. Tifl is a baby.', tap: [L('ط', 'Taa'), W('طَائِرَة', 'aeroplane'), W('طُيُور', 'birds'), W('طِفْل', 'baby')] },
        { type: 'scan', img: img(33), say: 'Join each joined shape to its letter. Then write each letter the way it looks alone.', tap: [L('س', 'Seen'), L('ك', 'Kaf'), L('ع', 'Ain'), L('ف', 'Fa'), L('ح', 'Haa')] },
        { type: 'find', letters: ['ض', 'ط', 'ص', 'ش', 'ت'] },
        { type: 'match', prompt: 'Which letter does each word start with?', pairs: [['ضِفْدَع', 'ض'], ['طَائِرَة', 'ط'], ['صَابُون', 'ص'], ['شَمْس', 'ش']] },
      ],
    },
    {
      title: 'Dhaa and Ain', ar: 'ظ ع',
      pages: [
        { type: 'scan', img: img(34), say: 'This is Dhaa. Dharf is an envelope. Dhufr is a fingernail. Dhill is the shade of a tree.', tap: [L('ظ', 'Dhaa'), W('ظَرْف', 'envelope'), W('ظُفْر', 'fingernail'), W('ظِلّ', 'shade')] },
        { type: 'scan', img: img(35), say: 'Look at each picture. Circle its name in the row. Then write each letter the way it starts a word.', tap: [W('تُفَّاحَة', 'apple'), W('طَائِرَة', 'aeroplane'), W('شَمْس', 'sun'), W('سَمَكَة', 'fish'), W('أُذُن', 'ear')] },
        { type: 'scan', img: img(36), say: 'This is Ain. Ayn is an eye. Usfoor is a sparrow. Inab is grapes.', tap: [L('ع', 'Ain'), W('عَيْن', 'eye'), W('عُصْفُور', 'sparrow'), W('عِنَب', 'grapes')] },
        { type: 'scan', img: img(37), say: 'Each letter has a few shapes. Join all the shapes of the same letter.', tap: [L('ض', 'Daad'), L('ه', 'Ha'), L('ك', 'Kaf'), L('س', 'Seen'), L('ظ', 'Dhaa')] },
        { type: 'find', letters: ['ظ', 'ع', 'ط', 'ض'] },
        { type: 'quiz', items: [
          { q: 'Which one is an eye?', a: 'عَيْن', w: ['عِنَب', 'ظَرْف'], why: 'Ayn is an eye.' },
          { q: 'Which one is a sparrow?', a: 'عُصْفُور', w: ['ظُفْر', 'عَيْن'], why: 'Usfoor is a sparrow.' },
        ] },
      ],
    },
    {
      title: 'Ghain and Fa', ar: 'غ ف',
      pages: [
        { type: 'scan', img: img(38), say: 'This is Ghain. Ghazal is a gazelle. Ghurab is a crow. Ghita\' is a lid.', tap: [L('غ', 'Ghain'), W('غَزَال', 'gazelle'), W('غُرَاب', 'crow'), W('غِطَاء', 'lid')] },
        { type: 'scan', img: img(39), say: 'Join each word to its picture. Then join two letters to make a little word. Qaf and Dal make qad.', tap: [W('كُرَة', 'ball'), W('حِمَار', 'donkey'), W('عَلَم', 'flag'), W('كُرْسِيّ', 'chair'), W('جَرَس', 'bell'), W('فِيل', 'elephant')] },
        { type: 'scan', img: img(40), say: 'This is Fa. Fa\'r is a rat. Furshah is a brush. Feel is an elephant.', tap: [L('ف', 'Fa'), W('فَأْر', 'rat'), W('فُرْشَاة', 'brush'), W('فِيل', 'elephant')] },
        { type: 'scan', img: img(41), say: 'Which word goes with the picture? Circle it. Then split each little word into its two letters.', tap: [W('عَيْن', 'eye'), W('فَأْر', 'rat'), W('طَائِرَة', 'aeroplane'), W('سَمَكَة', 'fish'), W('سُلَّم', 'ladder'), W('قَمَر', 'moon'), W('جَزَر', 'carrot'), W('جَمَل', 'camel'), W('ذَيْل', 'tail')] },
        { type: 'find', letters: ['غ', 'ف', 'ع', 'ظ', 'ق'] },
        { type: 'match', prompt: 'Match each word to its picture word.', pairs: [['غَزَال', 'gazelle'], ['غُرَاب', 'crow'], ['فَأْر', 'rat'], ['فِيل', 'elephant']] },
      ],
    },
    {
      title: 'Qaf and Kaf', ar: 'ق ك',
      pages: [
        { type: 'scan', img: img(42), say: 'This is Qaf. Qalam is a pen. Qufl is a lock. Qird is a monkey.', tap: [L('ق', 'Qaf'), W('قَلَم', 'pen'), W('قُفْل', 'lock'), W('قِرْد', 'monkey')] },
        { type: 'scan', img: img(43), say: 'Circle the first letter of each picture. Then find the missing letter in each little word.', tap: [W('إِبْرِيق', 'teapot'), W('شَمْس', 'sun'), W('قَلَم', 'pen'), W('فِيل', 'elephant'), W('عِنَب', 'grapes'), W('بِنْت', 'girl')] },
        { type: 'scan', img: img(44), say: 'This is Kaf. Al-Ka\'ba is the Kaaba in Makkah. Kura is a ball. Kitab is a book.', tap: [L('ك', 'Kaf'), W('الْكَعْبَة', 'the Kaaba'), W('كُرَة', 'ball'), W('كِتَاب', 'book')] },
        { type: 'scan', img: img(45), say: 'Write the two letters of each little word in the boxes. Then use the balloons to spell three pictures.', tap: [W('كُرَة', 'ball'), W('قَلَم', 'pen'), W('جَمَل', 'camel')] },
        { type: 'find', letters: ['ق', 'ك', 'ف', 'غ'] },
      ],
    },
    {
      title: 'Lam and Meem', ar: 'ل م',
      pages: [
        { type: 'scan', img: img(46), say: 'This is Lam. Lahm is meat. Lu\'ab are toys. Lisan is a tongue.', tap: [L('ل', 'Lam'), W('لَحْم', 'meat'), W('لُعَب', 'toys'), W('لِسَان', 'tongue')] },
        { type: 'scan', img: img(47), say: 'Join each set of letters to the word they make. Then circle the letters you can see inside each big word.', tap: [L('ص', 'Saad'), L('ف', 'Fa'), L('ر', 'Ra'), L('ك', 'Kaf'), L('ت', 'Ta')] },
        { type: 'scan', img: img(48), say: 'This is Meem. Mawz is a banana. Mudarris is a teacher. Miftah is a key.', tap: [L('م', 'Meem'), W('مَوْز', 'banana'), W('مُدَرِّس', 'teacher'), W('مِفْتَاح', 'key')] },
        { type: 'scan', img: img(49), say: 'Join the letters to make one word. Then write the missing letter under each picture.', tap: [W('جَرَس', 'bell'), W('عَلَم', 'flag'), W('بِنْت', 'girl'), W('كُرَة', 'ball'), W('لِسَان', 'tongue'), W('سَمَكَة', 'fish')] },
        { type: 'find', letters: ['ل', 'م', 'ك', 'ق', 'ن'] },
        { type: 'match', prompt: 'Which letter does each word start with?', pairs: [['لَحْم', 'ل'], ['مَوْز', 'م'], ['كِتَاب', 'ك'], ['قَلَم', 'ق']] },
      ],
    },
    {
      title: 'The last four letters', ar: 'ن و ه ي',
      pages: [
        { type: 'scan', img: img(50), say: 'This is Noon. Nakhla is a palm tree. Sweet dates grow at the top of the palm tree. Nujoom are stars. Nisf is a half.', tap: [L('ن', 'Noon'), W('نَخْلَة', 'palm tree'), W('نُجُوم', 'stars'), W('نِصْف', 'half')] },
        { type: 'scan', img: img(51), say: 'This is Waw. Wajh is a face. Wudoo\' is the washing we do before we pray. Wisada is a pillow.', tap: [L('و', 'Waw'), W('وَجْه', 'face'), W('وُضُوء', 'wudu'), W('وِسَادَة', 'pillow')] },
        { type: 'scan', img: img(52), say: 'This is Ha. Hatif is a telephone. Hudhud is a hoopoe bird. The hoopoe has a crown of feathers on its head. Hirra is a cat.', tap: [L('ه', 'Ha'), W('هَاتِف', 'telephone'), W('هُدْهُد', 'hoopoe'), W('هِرَّة', 'cat')] },
        { type: 'scan', img: img(53), say: 'This is Ya, the last letter. Yad is a hand. Yusroo\' is a caterpillar. Wiggle wiggle!', tap: [L('ي', 'Ya'), W('يَد', 'hand'), W('يُسْرُوع', 'caterpillar')] },
        { type: 'find', letters: ['ن', 'و', 'ه', 'ي', 'م'] },
        { type: 'quiz', items: [
          { q: 'Which one is a cat?', a: 'هِرَّة', w: ['هَاتِف', 'يَد'], why: 'Hirra is a cat.' },
          { q: 'Which one is a pillow?', a: 'وِسَادَة', w: ['وَجْه', 'نَخْلَة'], why: 'Wisada is a pillow.' },
          { q: 'Which one is a hand?', a: 'يَد', w: ['نِصْف', 'هُدْهُد'], why: 'Yad is a hand.' },
        ] },
      ],
    },
    {
      title: 'All my letters', ar: 'كُلُّ حُرُوفِي',
      pages: [
        { type: 'scan', img: img(54), say: 'Join each picture to its word.', tap: [W('مِفْتَاح', 'key'), W('قِرْد', 'monkey'), W('الْكَعْبَة', 'the Kaaba'), W('وِسَادَة', 'pillow'), W('هِرَّة', 'cat')] },
        { type: 'scan', img: img(55), say: 'Join the colour words that are the same. Then colour each flag with its colour.', tap: [W('أَحْمَر', 'red'), W('أَخْضَر', 'green'), W('أَصْفَر', 'yellow'), W('أَزْرَق', 'blue'), W('أَبْيَض', 'white'), W('أَسْوَد', 'black')] },
        { type: 'match', prompt: 'Match each colour word to its name.', pairs: [['أَحْمَر', 'red'], ['أَخْضَر', 'green'], ['أَصْفَر', 'yellow'], ['أَزْرَق', 'blue']] },
        { type: 'scan', img: img(56), say: 'Here are the letters from Alif to Saad with their pictures. Read them with your teacher. How many pictures can you name?' },
        { type: 'scan', img: img(57), say: 'Here are the rest of the letters, from Daad to Ya. Point to each picture and say its name.' },
        { type: 'scan', img: img(58), say: 'Read every letter three ways. Use a fatha, then a kasra, then a dhamma. Ba, bi, bu!' },
        { type: 'find', letters: ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'], rounds: 10 },
        { type: 'scan', img: img(59), say: 'Practise any letters you like on these lines.' },
        { type: 'scan', img: img(60), say: 'Write some words you know. Your teacher can help.' },
        { type: 'scan', img: img(61), say: 'Which letter is the hardest? Practise it here.' },
        { type: 'scan', img: img(62), say: 'Last page! Write the letters of your name. Well done, you finished the book!' },
      ],
    },
  ],
};
