// My First Arabic Letters 1: the Al-Huda "Pre-schooler Arabic Book" volume I, page by page.
// Each letter has a big letter page with one picture word, then a page to trace. Review pages come between.
const img = (n) => `books/first-arabic-1/${String(n).padStart(3, '0')}.webp`;
const L = (ar, en) => ({ ar, letter: ar, en });
const W = (ar, en) => ({ ar, en });

export default {
  id: 'first-arabic-1', title: 'My First Arabic Letters 1', ar: 'حُرُوفِي الْأُولَى ١', level: 1, ages: '4–6', color: '#E2574C',
  cover: 'books/first-arabic-1/001.webp',
  about: 'Meet all 28 Arabic letters, one picture word for each, and trace them with crayons.',
  unit: 'chapters',
  note: 'For teachers: every page of the printed workbook is here in order. The child colours and traces on screen, taps a letter to hear the Sheikh say it, and plays a listen-and-find game after each group.',
  chapters: [
    {
      title: 'Alif and Ba', ar: 'ا ب',
      pages: [
        { type: 'scan', img: img(1), draw: false, say: 'This is your Arabic letter book. Let us meet the letters!' },
        { type: 'scan', img: img(2), say: 'This is Alif. Alif is tall and straight. Arnab is a rabbit. Colour the rabbit and the big Alif.', tap: [L('ا', 'Alif'), W('أَرْنَب', 'rabbit')] },
        { type: 'scan', img: img(3), say: 'Trace the dotted Alif from the top down. Now write your own Alif on the lines.', tap: [L('ا', 'Alif')] },
        { type: 'scan', img: img(4), say: 'This is Ba. Ba says b. Bayt is a house. Colour the house.', tap: [L('ب', 'Ba'), W('بَيْت', 'house')] },
        { type: 'scan', img: img(5), say: 'Ba has one dot under it. Trace the Ba. Then put in the dot!', tap: [L('ب', 'Ba')] },
      ],
    },
    {
      title: 'Ta and Tha', ar: 'ت ث',
      pages: [
        { type: 'scan', img: img(6), say: 'This is Ta. Ta has two dots on top. Tuffaha is an apple. Colour it red or green.', tap: [L('ت', 'Ta'), W('تُفَّاحَة', 'apple')] },
        { type: 'scan', img: img(7), say: 'Trace the Ta. Do not forget the two dots.', tap: [L('ت', 'Ta')] },
        { type: 'scan', img: img(8), say: 'This is Tha. Tha has three dots. Thawb is a dress. Colour the pretty dress.', tap: [L('ث', 'Tha'), W('ثَوْب', 'dress')] },
        { type: 'scan', img: img(9), say: 'Trace the Tha. Count the dots: one, two, three.', tap: [L('ث', 'Tha')] },
        { type: 'scan', img: img(10), say: 'Every picture is on this page two times, so look carefully. Draw a line to join the two that match.', tap: [W('تُفَّاحَة', 'apple'), W('أَرْنَب', 'rabbit'), W('بَيْت', 'house'), W('ثَوْب', 'dress')] },
        { type: 'scan', img: img(11), say: 'Find two letters that are the same. Join them with a line.', tap: [L('ا', 'Alif'), L('ب', 'Ba'), L('ت', 'Ta'), L('ث', 'Tha')] },
        { type: 'find', letters: ['ا', 'ب', 'ت', 'ث'] },
        { type: 'match', prompt: 'Which letter does each word start with?', pairs: [['أَرْنَب', 'ا'], ['بَيْت', 'ب'], ['تُفَّاحَة', 'ت'], ['ثَوْب', 'ث']] },
      ],
    },
    {
      title: 'Jeem, Haa and Kha', ar: 'ج ح خ',
      pages: [
        { type: 'scan', img: img(12), say: 'This is Jeem. Jeem has a dot inside. Jamal is a camel. Colour the camel brown.', tap: [L('ج', 'Jeem'), W('جَمَل', 'camel')] },
        { type: 'scan', img: img(13), say: 'Trace the Jeem. Put the dot in the middle.', tap: [L('ج', 'Jeem')] },
        { type: 'scan', img: img(14), say: 'This is Haa. Say it from deep in your throat. Himar is a donkey.', tap: [L('ح', 'Haa'), W('حِمَار', 'donkey')] },
        { type: 'scan', img: img(15), say: 'Haa looks like Jeem with no dot. Trace it carefully.', tap: [L('ح', 'Haa')] },
        { type: 'scan', img: img(16), say: 'This is Kha. Kha has a dot on top. Khubz is bread. Yum!', tap: [L('خ', 'Kha'), W('خُبْز', 'bread')] },
        { type: 'scan', img: img(17), say: 'Trace the Kha. The dot goes on top this time.', tap: [L('خ', 'Kha')] },
        { type: 'find', letters: ['ج', 'ح', 'خ', 'ب', 'ت'] },
        { type: 'quiz', items: [
          { q: 'Which letter has a dot inside?', a: 'ج', w: ['ح', 'خ'], why: 'Jeem has its dot inside.' },
          { q: 'Which letter has a dot on top?', a: 'خ', w: ['ج', 'ح'], why: 'Kha has its dot on top.' },
        ] },
      ],
    },
    {
      title: 'Dal and Dhal', ar: 'د ذ',
      pages: [
        { type: 'scan', img: img(18), say: 'This is Dal. Dal says d. Deek is a rooster. Cock-a-doodle-doo!', tap: [L('د', 'Dal'), W('دِيك', 'rooster')] },
        { type: 'scan', img: img(19), say: 'Trace the Dal. It is small and bent like a knee.', tap: [L('د', 'Dal')] },
        { type: 'scan', img: img(20), say: 'Find the letters that are the same. Join each pair with a line.', tap: [L('ا', 'Alif'), L('ب', 'Ba'), L('ث', 'Tha'), L('ح', 'Haa'), L('د', 'Dal')] },
        { type: 'scan', img: img(21), say: 'Each duck has a letter. Each egg has a letter too. Join every duck to the egg with its letter.', tap: [L('ا', 'Alif'), L('ب', 'Ba'), L('ح', 'Haa'), L('د', 'Dal')] },
        { type: 'scan', img: img(22), say: 'This is Dhal. It is Dal with a dot. Dhayl is a tail.', tap: [L('ذ', 'Dhal'), W('ذَيْل', 'tail')] },
        { type: 'scan', img: img(23), say: 'Trace the Dhal and give it a dot.', tap: [L('ذ', 'Dhal')] },
        { type: 'find', letters: ['د', 'ذ', 'ج', 'ح', 'خ'] },
      ],
    },
    {
      title: 'Ra and Zay', ar: 'ر ز',
      pages: [
        { type: 'scan', img: img(24), say: 'This is Ra. Ra says r. Reesh is a feather. Colour the soft feather.', tap: [L('ر', 'Ra'), W('رِيش', 'feather')] },
        { type: 'scan', img: img(25), say: 'Trace the Ra. It slides down below the line.', tap: [L('ر', 'Ra')] },
        { type: 'scan', img: img(26), say: 'This is Zay. Zay is Ra with a dot. Zahra is a flower.', tap: [L('ز', 'Zay'), W('زَهْرَة', 'flower')] },
        { type: 'scan', img: img(27), say: 'Trace the Zay. Then add its dot.', tap: [L('ز', 'Zay')] },
        { type: 'find', letters: ['ر', 'ز', 'د', 'ذ'] },
        { type: 'match', prompt: 'Match each word to its picture word.', pairs: [['دِيك', 'rooster'], ['ذَيْل', 'tail'], ['رِيش', 'feather'], ['زَهْرَة', 'flower']] },
      ],
    },
    {
      title: 'Seen and Sheen', ar: 'س ش',
      pages: [
        { type: 'scan', img: img(28), say: 'This is Seen. Seen has three little teeth. Sayyara is a car. Beep beep!', tap: [L('س', 'Seen'), W('سَيَّارَة', 'car')] },
        { type: 'scan', img: img(29), say: 'Trace the Seen. Go up and down for each tooth.', tap: [L('س', 'Seen')] },
        { type: 'scan', img: img(30), say: 'These are things in the classroom. Tap each one to hear it. Then colour them.', tap: [W('طَلَّاسَة', 'board duster'), W('سَبُّورَة', 'board'), W('كِتَاب', 'book'), W('قَلَم', 'pen'), W('كُرْسِيّ', 'chair'), W('مَائِدَة', 'table')] },
        { type: 'scan', img: img(31), say: 'Look at the first letter in the row. Circle it every time you see it again.', tap: [L('ا', 'Alif'), L('ح', 'Haa'), L('س', 'Seen'), L('ب', 'Ba'), L('د', 'Dal')] },
        { type: 'scan', img: img(32), say: 'This is Sheen. Sheen is Seen with three dots. Shajara is a tree.', tap: [L('ش', 'Sheen'), W('شَجَرَة', 'tree')] },
        { type: 'scan', img: img(33), say: 'Trace the Sheen. Put three dots on top.', tap: [L('ش', 'Sheen')] },
        { type: 'find', letters: ['س', 'ش', 'ر', 'ز', 'ب'] },
        { type: 'quiz', items: [
          { q: 'Which one is a book?', a: 'كِتَاب', w: ['قَلَم', 'كُرْسِيّ'], why: 'Kitab is a book.' },
          { q: 'Which one is a pen?', a: 'قَلَم', w: ['كِتَاب', 'سَبُّورَة'], why: 'Qalam is a pen.' },
        ] },
      ],
    },
    {
      title: 'Saad and Daad', ar: 'ص ض',
      pages: [
        { type: 'scan', img: img(34), say: 'This is Saad. It is a strong, heavy s. Sundooq is a box.', tap: [L('ص', 'Saad'), W('صُنْدُوق', 'box')] },
        { type: 'scan', img: img(35), say: 'Trace the Saad. Make a round loop, then a big bowl.', tap: [L('ص', 'Saad')] },
        { type: 'scan', img: img(36), say: 'This is Daad. It is Saad with a dot. Difda is a frog. Ribbit!', tap: [L('ض', 'Daad'), W('ضِفْدَع', 'frog')] },
        { type: 'scan', img: img(37), say: 'Trace the Daad. Do not forget its dot.', tap: [L('ض', 'Daad')] },
        { type: 'find', letters: ['ص', 'ض', 'س', 'ش'] },
      ],
    },
    {
      title: 'Taa and Dhaa', ar: 'ط ظ',
      pages: [
        { type: 'scan', img: img(38), say: 'This is Taa. It is a strong, heavy t. Tayr is a bird.', tap: [L('ط', 'Taa'), W('طَيْر', 'bird')] },
        { type: 'scan', img: img(39), say: 'Trace the Taa. Draw the tall line last.', tap: [L('ط', 'Taa')] },
        { type: 'scan', img: img(40), say: 'Look at each picture. Join it to the letter its name starts with.', tap: [W('أَرْنَب', 'rabbit'), W('سَيَّارَة', 'car'), W('رِيش', 'feather'), W('تُفَّاحَة', 'apple'), W('دِيك', 'rooster')] },
        { type: 'scan', img: img(41), say: 'Each boy is fishing for his letter. Join each boy to the fish with the same letter.', tap: [L('س', 'Seen'), L('ص', 'Saad'), L('ج', 'Jeem')] },
        { type: 'scan', img: img(42), say: 'This is Dhaa. It is Taa with a dot. Dharf is an envelope.', tap: [L('ظ', 'Dhaa'), W('ظَرْف', 'envelope')] },
        { type: 'scan', img: img(43), say: 'Trace the Dhaa. Put the dot by the tall line.', tap: [L('ظ', 'Dhaa')] },
        { type: 'find', letters: ['ط', 'ظ', 'ص', 'ض', 'ت'] },
        { type: 'match', prompt: 'Which letter does each word start with?', pairs: [['سَيَّارَة', 'س'], ['رِيش', 'ر'], ['صُنْدُوق', 'ص'], ['طَيْر', 'ط']] },
      ],
    },
    {
      title: 'Ain and Ghain', ar: 'ع غ',
      pages: [
        { type: 'scan', img: img(44), say: 'This is Ain. Say it from the middle of your throat. Ayn is an eye.', tap: [L('ع', 'Ain'), W('عَيْن', 'eye')] },
        { type: 'scan', img: img(45), say: 'Trace the Ain. Start with the little curve at the top.', tap: [L('ع', 'Ain')] },
        { type: 'scan', img: img(46), say: 'This is Ghain. It is Ain with a dot. Ghazal is a gazelle. It runs fast!', tap: [L('غ', 'Ghain'), W('غَزَال', 'gazelle')] },
        { type: 'scan', img: img(47), say: 'Trace the Ghain. Add the dot on top.', tap: [L('غ', 'Ghain')] },
        { type: 'find', letters: ['ع', 'غ', 'ط', 'ظ'] },
      ],
    },
    {
      title: 'Fa and Qaf', ar: 'ف ق',
      pages: [
        { type: 'scan', img: img(48), say: 'This is Fa. Fa has one dot. Fam is a mouth. Smile!', tap: [L('ف', 'Fa'), W('فَم', 'mouth')] },
        { type: 'scan', img: img(49), say: 'Trace the Fa. One dot goes on its head.', tap: [L('ف', 'Fa')] },
        { type: 'scan', img: img(50), say: 'Look at each picture. Circle the letter its name starts with.', tap: [W('دِيك', 'rooster'), W('عَيْن', 'eye'), W('بَيْت', 'house'), W('طَيْر', 'bird'), W('شَجَرَة', 'tree')] },
        { type: 'scan', img: img(51), say: 'These are fruits. Tap each fruit to hear its name. Have you tasted every one of these fruits at home?', tap: [W('مَوْزَة', 'banana'), W('تُفَّاحَة', 'apple'), W('عِنَب', 'grapes'), W('بُرْتُقَالَة', 'orange'), W('أَنَانَاس', 'pineapple'), W('مَنْجَا', 'mango')] },
        { type: 'scan', img: img(52), say: 'This is Qaf. Qaf has two dots. Qalam is a pen.', tap: [L('ق', 'Qaf'), W('قَلَم', 'pen')] },
        { type: 'scan', img: img(53), say: 'Trace the Qaf. Its tail goes down low.', tap: [L('ق', 'Qaf')] },
        { type: 'find', letters: ['ف', 'ق', 'ع', 'غ'] },
        { type: 'match', prompt: 'Match each fruit to its name.', pairs: [['مَوْزَة', 'banana'], ['عِنَب', 'grapes'], ['بُرْتُقَالَة', 'orange'], ['أَنَانَاس', 'pineapple']] },
      ],
    },
    {
      title: 'Kaf, Lam and Meem', ar: 'ك ل م',
      pages: [
        { type: 'scan', img: img(54), say: 'This is Kaf. Kaf says k. Kursi is a chair. A chair has four legs and a back to lean on.', tap: [L('ك', 'Kaf'), W('كُرْسِيّ', 'chair')] },
        { type: 'scan', img: img(55), say: 'Trace the Kaf. Draw the little hook inside it.', tap: [L('ك', 'Kaf')] },
        { type: 'scan', img: img(56), say: 'This is Lam. Lam says l. Lisan is a tongue. Can you show your tongue?', tap: [L('ل', 'Lam'), W('لِسَان', 'tongue')] },
        { type: 'scan', img: img(57), say: 'Trace the Lam. It stands tall and then curves round at the bottom.', tap: [L('ل', 'Lam')] },
        { type: 'scan', img: img(58), say: 'This is Meem. Meem says m. Mawz is a banana. Colour it yellow.', tap: [L('م', 'Meem'), W('مَوْز', 'banana')] },
        { type: 'scan', img: img(59), say: 'Trace the Meem. Make a small round head first.', tap: [L('م', 'Meem')] },
        { type: 'find', letters: ['ك', 'ل', 'م', 'ف', 'ق'] },
      ],
    },
    {
      title: 'Noon and Waw', ar: 'ن و',
      pages: [
        { type: 'scan', img: img(60), say: 'This is Noon. Noon says n. Najm is a star. Twinkle twinkle!', tap: [L('ن', 'Noon'), W('نَجْم', 'star')] },
        { type: 'scan', img: img(61), say: 'Trace the Noon. Its dot sits in the middle.', tap: [L('ن', 'Noon')] },
        { type: 'scan', img: img(62), say: 'These are toys. Tap each toy to hear its name. Which toy do you like best?', tap: [W('كُرَة', 'ball'), W('قِطَار', 'train'), W('دُبّ', 'teddy bear'), W('عَرُوسَة', 'doll'), W('دَرَّاجَة', 'bicycle'), W('طَائِرَة', 'aeroplane')] },
        { type: 'scan', img: img(63), say: 'Join each picture to the letter its name starts with.', tap: [W('صُنْدُوق', 'box'), W('قَلَم', 'pen'), W('ثَوْب', 'dress'), W('زَهْرَة', 'flower'), W('جَمَل', 'camel')] },
        { type: 'scan', img: img(64), say: 'This is Waw. Waw says w. Wajh is a face. Draw a big smile!', tap: [L('و', 'Waw'), W('وَجْه', 'face')] },
        { type: 'scan', img: img(65), say: 'Trace the Waw. Round head, then a long tail.', tap: [L('و', 'Waw')] },
        { type: 'find', letters: ['ن', 'و', 'ك', 'ل', 'م'] },
        { type: 'match', prompt: 'Match each toy to its name.', pairs: [['كُرَة', 'ball'], ['قِطَار', 'train'], ['دَرَّاجَة', 'bicycle'], ['طَائِرَة', 'aeroplane']] },
      ],
    },
    {
      title: 'Ha, Lam alif, Hamza and Ya', ar: 'ه لا ء ي',
      pages: [
        { type: 'scan', img: img(66), say: 'This is Ha. It is a soft h, like a breath. Hirra is a cat. Meow!', tap: [L('ه', 'Ha'), W('هِرَّة', 'cat')] },
        { type: 'scan', img: img(67), say: 'Trace the Ha. It has two little windows.', tap: [L('ه', 'Ha')] },
        { type: 'scan', img: img(68), say: 'Lam and Alif join together like this. We say la. Trace it.', tap: [W('لا', 'La')] },
        { type: 'scan', img: img(69), say: 'This little letter is Hamza. Trace the Hamza.', tap: [W('ء', 'Hamza')] },
        { type: 'scan', img: img(70), say: 'This is Ya. Ya has two dots under it. Yad is a hand. Wave hello!', tap: [L('ي', 'Ya'), W('يَد', 'hand')] },
        { type: 'scan', img: img(71), say: 'Trace the Ya. Two dots go underneath.', tap: [L('ي', 'Ya')] },
        { type: 'find', letters: ['ه', 'ي', 'ن', 'و'] },
        { type: 'quiz', items: [
          { q: 'Which word is a cat?', a: 'هِرَّة', w: ['يَد', 'وَجْه'], why: 'Hirra is a cat.' },
          { q: 'Which letter has two dots under it?', a: 'ي', w: ['ه', 'ن'], why: 'Ya has two dots under it.' },
        ] },
      ],
    },
    {
      title: 'Pictures and letters', ar: 'صُوَر وَحُرُوف',
      pages: [
        { type: 'scan', img: img(72), say: 'Join each picture to the letter its name starts with.', tap: [W('ضِفْدَع', 'frog'), W('يَد', 'hand'), W('لِسَان', 'tongue'), W('هِرَّة', 'cat'), W('حِمَار', 'donkey')] },
        { type: 'scan', img: img(73), say: 'Look at each picture. Circle the first letter of its name.', tap: [W('وَجْه', 'face'), W('غَزَال', 'gazelle'), W('نَجْم', 'star'), W('ظَرْف', 'envelope'), W('مَوْز', 'banana')] },
        { type: 'scan', img: img(74), say: 'This is your body. Tap each part to hear its name. Then point to it on you!', tap: [W('رِجْل', 'leg'), W('رَأْس', 'head'), W('أُذُن', 'ear'), W('أَنْف', 'nose'), W('أَسْنَان', 'teeth'), W('شَعْر', 'hair')] },
        { type: 'match', prompt: 'Match each part of the body to its name.', pairs: [['رَأْس', 'head'], ['أُذُن', 'ear'], ['أَنْف', 'nose'], ['شَعْر', 'hair']] },
        { type: 'scan', img: img(75), say: 'Trace the dotted letters on the balloons. Then write each one in a box.', tap: [L('ف', 'Fa'), L('ت', 'Ta'), L('ح', 'Haa'), L('م', 'Meem'), L('ل', 'Lam'), L('د', 'Dal'), L('ا', 'Alif'), L('ر', 'Ra')] },
        { type: 'find', letters: ['ض', 'ل', 'ح', 'غ', 'ظ', 'م'] },
      ],
    },
    {
      title: 'Writing the letters', ar: 'أَكْتُبُ الْحُرُوف',
      pages: [
        { type: 'scan', img: img(76), say: 'Read these letters with your teacher. Copy them on the lines.', tap: [L('ا', 'Alif'), L('ب', 'Ba'), L('ت', 'Ta'), L('ث', 'Tha'), L('ج', 'Jeem')] },
        { type: 'scan', img: img(77), say: 'Each girl is fishing for her letter. Join each girl to the fish with the same letter.', tap: [L('ت', 'Ta'), L('و', 'Waw'), L('ل', 'Lam')] },
        { type: 'scan', img: img(78), say: 'Read the next letters. Now copy them on the lines.', tap: [L('ح', 'Haa'), L('خ', 'Kha'), L('د', 'Dal'), L('ذ', 'Dhal'), L('ر', 'Ra')] },
        { type: 'scan', img: img(79), say: 'Each star has a colour name. Tap to hear it, then colour the star that colour.', tap: [W('أَسْوَد', 'black'), W('أَحْمَر', 'red'), W('أَزْرَق', 'blue'), W('أَبْيَض', 'white'), W('أَخْضَر', 'green'), W('أَصْفَر', 'yellow')] },
        { type: 'match', prompt: 'Match each colour word to its name.', pairs: [['أَحْمَر', 'red'], ['أَزْرَق', 'blue'], ['أَخْضَر', 'green'], ['أَصْفَر', 'yellow']] },
        { type: 'scan', img: img(80), say: 'More letters to read and copy. Take your time.', tap: [L('ز', 'Zay'), L('س', 'Seen'), L('ش', 'Sheen'), L('ص', 'Saad'), L('ض', 'Daad')] },
        { type: 'scan', img: img(81), say: 'Some letters are missing from these chains. Write the letters that come in between.', tap: [L('ا', 'Alif'), L('ث', 'Tha'), L('ر', 'Ra'), L('س', 'Seen'), L('غ', 'Ghain'), L('ق', 'Qaf')] },
        { type: 'scan', img: img(82), say: 'Read these letters. Copy each one on the lines.', tap: [L('ط', 'Taa'), L('ظ', 'Dhaa'), L('ع', 'Ain'), L('غ', 'Ghain'), L('ف', 'Fa')] },
        { type: 'scan', img: img(83), say: 'Help each mother find her babies. The camel walks on Jeem. The bird hops on Taa.', tap: [L('ج', 'Jeem'), L('ط', 'Taa')] },
        { type: 'scan', img: img(84), say: 'Read and copy these letters too.', tap: [L('ق', 'Qaf'), L('ك', 'Kaf'), L('ل', 'Lam'), L('م', 'Meem'), L('ن', 'Noon')] },
        { type: 'scan', img: img(85), say: 'Some train carriages have no letter. Write the missing letters on the trains.', tap: [L('ب', 'Ba'), L('ز', 'Zay'), L('ق', 'Qaf')] },
        { type: 'scan', img: img(86), say: 'These are the last letters. Read them and copy them.', tap: [L('و', 'Waw'), L('ه', 'Ha'), W('لا', 'La'), W('ء', 'Hamza'), L('ي', 'Ya')] },
        { type: 'scan', img: img(87), say: 'Join the letters in order, from Alif to Ya. What animal do you get?', tap: [L('ا', 'Alif'), L('ي', 'Ya')] },
        { type: 'scan', img: img(88), say: 'Write all the letters in order. Start at Alif and finish at Ya.', tap: [L('ا', 'Alif'), L('ي', 'Ya')] },
        { type: 'find', letters: ['ب', 'ج', 'ر', 'ش', 'ع', 'ن'] },
      ],
    },
    {
      title: 'All my letters', ar: 'كُلُّ حُرُوفِي',
      pages: [
        { type: 'scan', img: img(89), say: 'Join each picture to the letter its name starts with.', tap: [W('لِسَان', 'tongue'), W('مَوْز', 'banana'), W('دِيك', 'rooster'), W('أَرْنَب', 'rabbit'), W('ثَوْب', 'dress'), W('رِيش', 'feather')] },
        { type: 'scan', img: img(90), say: 'Here are more pictures. Join each one to its first letter.', tap: [W('ضِفْدَع', 'frog'), W('وَجْه', 'face'), W('عَيْن', 'eye'), W('بَيْت', 'house'), W('تُفَّاحَة', 'apple'), W('جَمَل', 'camel')] },
        { type: 'match', prompt: 'Which letter does each word start with?', pairs: [['لِسَان', 'ل'], ['مَوْز', 'م'], ['عَيْن', 'ع'], ['وَجْه', 'و'], ['جَمَل', 'ج']] },
        { type: 'scan', img: img(91), say: 'Here are all your letters with their pictures. Read them with your teacher. Can you name every picture?' },
        { type: 'scan', img: img(92), say: 'Practise any letters you like on these lines.' },
        { type: 'scan', img: img(93), say: 'Which letter is your favourite? Write it lots of times here.' },
        { type: 'scan', img: img(94), say: 'One more page to practise. Try to write the letters of your name.' },
        { type: 'find', letters: ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'], rounds: 10 },
        { type: 'quiz', items: [
          { q: 'Which word is a camel?', a: 'جَمَل', w: ['قَلَم', 'دِيك'], why: 'Jamal is a camel.' },
          { q: 'Which word is a star?', a: 'نَجْم', w: ['شَجَرَة', 'بَيْت'], why: 'Najm is a star.' },
          { q: 'Which letter is the first letter of all?', a: 'ا', w: ['ي', 'م'], why: 'Alif comes first. Ya comes last.' },
        ] },
      ],
    },
  ],
};
