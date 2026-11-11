// Arabic for Beginners (تَعَلَّمُ الْعَرَبِيَّةَ، الْمُجَلَّدُ الْأَوَّلُ): Unit One of the school's Arabic textbook.
// Level 3 (ages 8–10). The textbook pages are shown with crayons; the words are typed with full harakat
// and practised with matching, gap-filling, sorting and quizzes.
// Pages 44 and 63–68 of the Canva book carry broken Arabic, so their content is typed here instead of shown.
const img = (n) => `books/arabic-beginners/${String(n).padStart(3, '0')}.webp`;
const scan = (n, say, more = {}) => ({ type: 'scan', img: img(n), say, ...more });

export default {
  id: 'arabic-beginners', title: 'Arabic for Beginners', ar: 'تَعَلَّمُ ٱلْعَرَبِيَّة', level: 3, ages: '8–10', color: '#1E9BB0',
  cover: 'books/arabic-beginners/001.webp',
  about: 'Unit One of the Arabic textbook: greetings, pronouns, this and that, the classroom, numbers, animals, colours, places, sun and moon letters, families and short stories, with the pages to write on and practice after each lesson.',
  unit: 'lessons',
  note: 'For teachers: the typed Arabic follows the textbook, with a few printing slips put right (each one is listed as a check note on the review sheet). Pages 44 and 63 to 68 have broken Arabic letters from the picture maker, so they are not shown; their words are typed in the lessons on sun letters, families and food.',
  chapters: [
    // ── 1. Greetings (pages 1–4) ──
    {
      title: 'Greetings', ar: 'تَحِيَّاتٌ',
      pages: [
        scan(1, 'This is your Arabic book. Unit One starts with greetings: the words we say when we meet someone and when we leave.', { draw: false }),
        scan(2, 'Read each greeting and look at its picture. When would you say it? Colour the pictures that happen in the morning.'),
        {
          type: 'read', h: 'Greetings and their replies',
          text: [
            'Many Arabic greetings have their own reply. When someone says صَبَاحُ الْخَيْرِ, you answer صَبَاحُ النُّورِ.',
            { table: [
              ['Arabic', 'English', 'When we say it'],
              ['السَّلَامُ عَلَيْكُمْ', 'Peace be upon you', 'When we meet anyone'],
              ['وَعَلَيْكُمُ السَّلَامُ', 'And upon you be peace', 'The reply'],
              ['أَهْلًا / مَرْحَبًا', 'Hello, welcome', 'When we meet someone'],
              ['تَشَرَّفْنَا', 'Pleased to meet you', 'When we meet someone new'],
              ['صَبَاحُ الْخَيْرِ', 'Good morning', 'In the morning'],
              ['صَبَاحُ النُّورِ', 'Good morning (the reply)', 'The reply'],
              ['مَسَاءُ الْخَيْرِ', 'Good evening', 'In the afternoon or evening'],
              ['مَسَاءُ النُّورِ', 'Good evening (the reply)', 'The reply'],
              ['كَيْفَ حَالُكَ؟', 'How are you?', 'After saying salam'],
              ['بِخَيْرٍ، الْحَمْدُ لِلَّهِ', 'Fine, all praise is for Allah', 'The reply'],
              ['مَعَ السَّلَامَةِ', 'Goodbye', 'When someone leaves'],
              ['إِلَى اللِّقَاءِ', 'See you again', 'When someone leaves'],
              ['فِي أَمَانِ اللهِ', 'Go in Allah\'s care', 'When someone leaves'],
              ['لَيْلَةً سَعِيدَةً', 'Have a good night', 'At bedtime'],
              ['تُصْبِحُ عَلَى خَيْرٍ', 'Good night (wake up well)', 'At bedtime'],
            ] },
          ],
        },
        scan(3, 'Two teachers meet at school. Listen to what they say, then say it with a friend. One of you starts with السَّلَامُ عَلَيْكُمْ.'),
        {
          type: 'match', prompt: 'Match each greeting with its meaning.',
          pairs: [
            ['صَبَاحُ الْخَيْرِ', 'Good morning'],
            ['مَسَاءُ الْخَيْرِ', 'Good evening'],
            ['مَعَ السَّلَامَةِ', 'Goodbye'],
            ['تَشَرَّفْنَا', 'Pleased to meet you'],
            ['كَيْفَ حَالُكَ؟', 'How are you?'],
            ['تُصْبِحُ عَلَى خَيْرٍ', 'Good night'],
          ],
        },
        scan(4, 'Look at the six pictures. Write the letter of the right picture in the small box next to each greeting.'),
        {
          type: 'quiz',
          items: [
            { q: 'It is 8 o\'clock in the morning and you meet your teacher. What do you say?', a: 'صَبَاحُ الْخَيْرِ', w: ['مَسَاءُ الْخَيْرِ', 'لَيْلَةً سَعِيدَةً'] },
            { q: 'Your friend says السَّلَامُ عَلَيْكُمْ. What do you answer?', a: 'وَعَلَيْكُمُ السَّلَامُ', w: ['تَشَرَّفْنَا', 'مَعَ السَّلَامَةِ'] },
            { q: 'Someone asks you كَيْفَ حَالُكَ؟ Which is a good answer?', a: 'بِخَيْرٍ، الْحَمْدُ لِلَّهِ', w: ['إِلَى اللِّقَاءِ', 'صَبَاحُ النُّورِ'] },
            { q: 'Your friend is going home after school. What do you say?', a: 'مَعَ السَّلَامَةِ', w: ['أَهْلًا', 'صَبَاحُ الْخَيْرِ'] },
            { q: 'You meet a new classmate for the first time. Which word means "pleased to meet you"?', a: 'تَشَرَّفْنَا', w: ['تُصْبِحُ عَلَى خَيْرٍ', 'مَسَاءُ النُّورِ'] },
            { q: 'It is bedtime. What do you say to your family?', a: 'تُصْبِحُ عَلَى خَيْرٍ', w: ['صَبَاحُ الْخَيْرِ', 'مَرْحَبًا'], why: 'You could also say لَيْلَةً سَعِيدَةً.' },
          ],
        },
        {
          type: 'gap',
          items: [
            { t: 'مَسَاءُ الْخَيْرِ. مَسَاءُ ___.', a: 'النُّورِ', w: ['السَّلَامَةِ', 'اللِّقَاءِ'] },
            { t: 'السَّلَامُ عَلَيْكُمْ. وَعَلَيْكُمُ ___.', a: 'السَّلَامُ', w: ['النُّورُ', 'الْخَيْرُ'] },
            { t: '___ حَالُكَ؟ بِخَيْرٍ، الْحَمْدُ لِلَّهِ.', a: 'كَيْفَ', w: ['مَنْ', 'أَيْنَ'] },
            { t: 'إِلَى ___.', a: 'اللِّقَاءِ', w: ['النُّورِ', 'الْخَيْرِ'] },
            { t: 'صَبَاحُ ___.', a: 'الْخَيْرِ', w: ['السَّلَامَةِ', 'اللِّقَاءِ'] },
          ],
        },
      ],
    },

    // ── 2. Personal pronouns (page 5) ──
    {
      title: 'Personal pronouns', ar: 'الضَّمَائِرُ الشَّخْصِيَّةُ',
      pages: [
        {
          type: 'read', h: 'Words for people',
          text: [
            'A pronoun is a short word we use in place of a name. Instead of saying أَحْمَدُ again and again, we say هُوَ (he).',
            'Arabic has more pronouns than English. English has one word, "you". Arabic says أَنْتَ to a boy and أَنْتِ to a girl. Look at the last letter: a fatha for a boy, a kasra for a girl.',
            { table: [
              ['Arabic', 'English'],
              ['أَنَا', 'I'],
              ['نَحْنُ', 'we'],
              ['أَنْتَ', 'you (one boy or man)'],
              ['أَنْتِ', 'you (one girl or woman)'],
              ['أَنْتُمَا', 'you (two people)'],
              ['أَنْتُمْ', 'you (a group of boys, or boys and girls)'],
              ['أَنْتُنَّ', 'you (a group of girls)'],
              ['هُوَ', 'he'],
              ['هِيَ', 'she'],
              ['هُمَا', 'they (two people)'],
              ['هُمْ', 'they (a group of boys, or boys and girls)'],
              ['هُنَّ', 'they (a group of girls)'],
            ] },
          ],
        },
        scan(5, 'Look at the wheel. Which pronoun goes with each picture? In the box of examples at the bottom, write what each sentence means in English.', { check: 'The printed table labels the أَنْتَ row الْمُخَاطَبَةُ (it should be الْمُخَاطَبُ). The typed table on the page before is correct.' }),
        {
          type: 'read', h: 'He and she for things too',
          text: [
            'In Arabic every thing is a boy word or a girl word. Most girl words end in ة.',
            'So a table, طَاوِلَةٌ, is هِيَ, and a television, تِلْفَازٌ, is هُوَ. That is why the wheel puts a table next to هِيَ and a television next to هُوَ.',
            { table: [
              ['Sentence', 'Meaning'],
              ['أَنَا صَالِحٌ', 'I am Salih.'],
              ['هِيَ زَيْنَبُ', 'She is Zaynab.'],
              ['هُوَ أَحْمَدُ', 'He is Ahmad.'],
              ['هُمَا عِيسَى وَمَحْمُودٌ', 'They are Isa and Mahmud.'],
            ] },
          ],
        },
        {
          type: 'match', prompt: 'Match each pronoun with its meaning.',
          pairs: [
            ['أَنَا', 'I'],
            ['نَحْنُ', 'we'],
            ['هُوَ', 'he'],
            ['هِيَ', 'she'],
            ['أَنْتَ', 'you (a boy)'],
            ['أَنْتِ', 'you (a girl)'],
            ['هُمْ', 'they (a group)'],
          ],
        },
        {
          type: 'sort', prompt: 'Is each thing a boy word or a girl word? Girl words often end in ة.',
          groups: ['Boy word (هُوَ)', 'Girl word (هِيَ)'],
          items: [['بَابٌ', 0], ['سَيَّارَةٌ', 1], ['قَلَمٌ', 0], ['طَاوِلَةٌ', 1], ['كِتَابٌ', 0], ['مَدْرَسَةٌ', 1], ['بَيْتٌ', 0], ['حَقِيبَةٌ', 1], ['تِلْفَازٌ', 0], ['سَاعَةٌ', 1]],
        },
        {
          type: 'gap',
          items: [
            { t: 'أَحْمَدُ طَالِبٌ. ___ فِي الْفَصْلِ.', a: 'هُوَ', w: ['هِيَ', 'نَحْنُ'] },
            { t: 'زَيْنَبُ مُعَلِّمَةٌ. ___ فِي الْمَدْرَسَةِ.', a: 'هِيَ', w: ['هُوَ', 'أَنَا'] },
            { t: 'يَا عَلِيُّ، مَنْ ___؟', a: 'أَنْتَ', w: ['أَنْتِ', 'هِيَ'] },
            { t: 'يَا مَرْيَمُ، مَنْ ___؟', a: 'أَنْتِ', w: ['أَنْتَ', 'هُوَ'] },
            { t: '___ عِيسَى وَمَحْمُودٌ.', a: 'هُمَا', w: ['هِيَ', 'أَنَا'] },
          ],
        },
      ],
    },

    // ── 3. Pronoun endings (pages 6–7) ──
    {
      title: 'Pronoun endings', ar: 'الضَّمَائِرُ الْمُتَّصِلَةُ',
      pages: [
        scan(6, 'The top table shows pronouns that start with إِيَّا. The bottom table shows the short endings that join onto a word. Read both tables aloud.', { check: 'The top table mixes قَلَمُهُ, قَلَمُهَا, قَلَمُكَ and قَلَمُهُمْ into the إِيَّا column, and two of its examples (هُوَ أَحْمَدُ, هُمَا عِيسَى وَمَحْمُودٌ) are not إِيَّا sentences. The typed tables in this lesson give the forms in full.' }),
        {
          type: 'read', h: 'Endings for my, your, his and her',
          text: [
            'Some pronouns are so short that they join onto the end of a word. بَيْتٌ is "a house". Add ـِي and it becomes بَيْتِي, "my house".',
            'When an ending joins on, the tanween (the double mark at the end) goes away. A word that ends in ة changes it to ت: حَقِيبَةٌ becomes حَقِيبَتِي.',
            { table: [
              ['With the ending', 'Meaning'],
              ['بَيْتِي', 'my house'],
              ['بَيْتُنَا', 'our house'],
              ['بَيْتُكَ', 'your house (one boy)'],
              ['بَيْتُكِ', 'your house (one girl)'],
              ['بَيْتُكُمَا', 'your house (two people)'],
              ['بَيْتُكُمْ', 'your house (a group)'],
              ['بَيْتُكُنَّ', 'your house (a group of girls)'],
              ['بَيْتُهُ', 'his house'],
              ['بَيْتُهَا', 'her house'],
              ['بَيْتُهُمَا', 'their house (two people)'],
              ['بَيْتُهُمْ', 'their house (a group)'],
              ['بَيْتُهُنَّ', 'their house (a group of girls)'],
            ] },
          ],
        },
        scan(7, 'Here are the endings joined to بَيْتٌ and قَلَمٌ. Cover one column with your hand and try to say it from memory.'),
        {
          type: 'read', h: 'Pronouns that start with إِيَّا',
          text: [
            'When a pronoun is the one something is done to, Arabic can use a word that starts with إِيَّا. أَعْطَيْتُهُ إِيَّاهُ means "I gave it to him".',
            { table: [
              ['Arabic', 'English'],
              ['إِيَّايَ', 'me'],
              ['إِيَّانَا', 'us'],
              ['إِيَّاكَ', 'you (one boy)'],
              ['إِيَّاكِ', 'you (one girl)'],
              ['إِيَّاكُمْ', 'you (a group)'],
              ['إِيَّاهُ', 'him'],
              ['إِيَّاهَا', 'her'],
              ['إِيَّاهُمْ', 'them'],
            ] },
          ],
        },
        {
          type: 'match', prompt: 'Whose pen is it? Match each word with its meaning.',
          pairs: [
            ['قَلَمِي', 'my pen'],
            ['قَلَمُكَ', 'your pen (a boy)'],
            ['قَلَمُكِ', 'your pen (a girl)'],
            ['قَلَمُهُ', 'his pen'],
            ['قَلَمُهَا', 'her pen'],
            ['قَلَمُنَا', 'our pen'],
          ],
        },
        {
          type: 'gap',
          items: [
            { t: 'هَذَا كِتَابُ أَحْمَدَ. هَذَا ___.', a: 'كِتَابُهُ', w: ['كِتَابُهَا', 'كِتَابُكِ'] },
            { t: 'هَذِهِ حَقِيبَةُ مَرْيَمَ. هَذِهِ ___.', a: 'حَقِيبَتُهَا', w: ['حَقِيبَتُهُ', 'حَقِيبَتُكَ'] },
            { t: 'يَا عَلِيُّ، أَيْنَ ___؟', a: 'قَلَمُكَ', w: ['قَلَمُكِ', 'قَلَمُهَا'] },
            { t: 'يَا فَاطِمَةُ، أَيْنَ ___؟', a: 'قَلَمُكِ', w: ['قَلَمُكَ', 'قَلَمُهُ'] },
          ],
        },
      ],
    },

    // ── 4. Furniture at home (pages 8 and 10) ──
    {
      title: 'Furniture at home', ar: 'الْأَثَاثُ',
      pages: [
        scan(8, 'Read the furniture words. Then read the four sentences in the box. Is each one about هُوَ or هِيَ?'),
        {
          type: 'read', h: 'Things in the home',
          text: [
            'Some things have two names, written with a slash between them. أَرِيكَةٌ and كَنَبَةٌ are both a sofa.',
            { table: [
              ['Arabic', 'English'],
              ['أَثَاثٌ', 'furniture'],
              ['طَاوِلَةٌ', 'table'],
              ['كُرْسِيٌّ', 'chair'],
              ['تِلْفَازٌ', 'television'],
              ['أَرِيكَةٌ / كَنَبَةٌ', 'sofa'],
              ['دُرْجٌ', 'chest of drawers'],
              ['مِصْبَاحٌ', 'lamp'],
              ['مِدْفَأَةٌ', 'heater, stove'],
              ['مُكَيِّفٌ', 'air conditioner'],
              ['مِرْوَحَةٌ', 'fan'],
              ['سَجَّادَةٌ', 'rug'],
              ['مَكْتَبَةٌ', 'bookcase'],
              ['مِنْشَفَةٌ / فُوطَةٌ', 'towel'],
              ['خِزَانَةُ الصُّحُونِ', 'cupboard for dishes'],
              ['ثَلَّاجَةٌ / بَرَّادَةٌ', 'fridge'],
              ['حَاسُوبٌ', 'computer'],
              ['خِزَانَةُ الْمَلَابِسِ', 'wardrobe'],
              ['سَرِيرٌ / فِرَاشٌ', 'bed'],
              ['مِرْآةٌ', 'mirror'],
              ['سَخَّانٌ', 'water heater'],
              ['غَلَّايَةٌ', 'kettle'],
              ['مَغْسَلَةٌ', 'sink'],
              ['غَسَّالَةُ الصُّحُونِ', 'dishwasher'],
              ['فُرْنٌ', 'oven'],
            ] },
          ],
          check: 'The sink is printed مَغْسَل; it is typed here as مَغْسَلَةٌ.',
        },
        {
          type: 'read', h: 'Sentences about the home',
          text: [
            'Notice the verbs. A verb about هِيَ often ends in ـَتْ or starts with تَـ. A verb about هُوَ often starts with يُـ or يَـ.',
            { table: [
              ['Arabic', 'English'],
              ['هِيَ جَلَسَتْ عَلَى الْكُرْسِيِّ.', 'She sat on the chair.'],
              ['هِيَ تَسْتَرِيحُ عَلَى الْأَرِيكَةِ.', 'She is resting on the sofa.'],
              ['هُوَ يُشَاهِدُ التِّلْفَازَ فِي الْغُرْفَةِ.', 'He is watching television in the room.'],
              ['هُوَ وَضَعَ الطَّعَامَ عَلَى الطَّاوِلَةِ الْكَبِيرَةِ.', 'He put the food on the big table.'],
            ] },
          ],
        },
        scan(10, 'Point to each picture and say its name in Arabic. Then colour the things you have in your own home.'),
        {
          type: 'match', prompt: 'Match the furniture with its English name.',
          pairs: [
            ['طَاوِلَةٌ', 'table'],
            ['كُرْسِيٌّ', 'chair'],
            ['سَرِيرٌ', 'bed'],
            ['ثَلَّاجَةٌ', 'fridge'],
            ['مِرْآةٌ', 'mirror'],
            ['مِصْبَاحٌ', 'lamp'],
            ['فُرْنٌ', 'oven'],
            ['مِرْوَحَةٌ', 'fan'],
          ],
        },
        {
          type: 'quiz',
          items: [
            { q: 'Where do you keep the milk cold?', a: 'ثَلَّاجَةٌ', w: ['فُرْنٌ', 'سَجَّادَةٌ'] },
            { q: 'What do you sleep on?', a: 'سَرِيرٌ', w: ['مِرْآةٌ', 'غَلَّايَةٌ'] },
            { q: 'What do you boil water in?', a: 'غَلَّايَةٌ', w: ['مَكْتَبَةٌ', 'مِرْوَحَةٌ'] },
            { q: 'Where do your books go?', a: 'مَكْتَبَةٌ', w: ['مَغْسَلَةٌ', 'ثَلَّاجَةٌ'] },
            { q: 'What do you look in to comb your hair?', a: 'مِرْآةٌ', w: ['فُرْنٌ', 'دُرْجٌ'] },
          ],
        },
      ],
    },

    // ── 5. This and that (pages 9, 11, 12) ──
    {
      title: 'This and that', ar: 'أَسْمَاءُ الْإِشَارَةِ',
      pages: [
        scan(9, 'These words point at people and things. Look at the bottom of the page. For a group of animals, objects or plants we use the girl word هَذِهِ, even when there are many.'),
        {
          type: 'read', h: 'Near and far',
          text: [
            'Close by, a boy word takes هَذَا and a girl word takes هَذِهِ. Far away, a boy word takes ذَلِكَ and a girl word takes تِلْكَ.',
            { table: [
              ['', 'Near (this)', 'Far (that)'],
              ['one boy word', 'هَذَا', 'ذَلِكَ'],
              ['one girl word', 'هَذِهِ', 'تِلْكَ'],
              ['two boy words', 'هَذَانِ', 'ذَانِكَ'],
              ['two girl words', 'هَاتَانِ', 'تَانِكَ'],
              ['a group of people', 'هَؤُلَاءِ', 'أُولَئِكَ'],
            ] },
            { note: { h: 'Groups of things', t: 'For a group of things or animals, Arabic uses هَذِهِ and تِلْكَ: هَذِهِ كُتُبٌ means "these are books". We keep هَؤُلَاءِ for people.' } },
            { table: [
              ['Example', 'Meaning'],
              ['هَذَا بَيْتٌ', 'This is a house.'],
              ['ذَلِكَ مَسْجِدٌ', 'That is a mosque.'],
              ['تِلْكَ بِنْتٌ', 'That is a girl.'],
              ['هَؤُلَاءِ رِجَالٌ', 'These are men.'],
            ] },
          ],
        },
        scan(11, 'Read the two tables, near and far. In the box of examples, write what each sentence means in English.'),
        scan(12, 'Read each question and answer. Circle هَذِهِ every time you see it. Who are the girls and women on this page?'),
        {
          type: 'quiz',
          items: [
            { q: 'A woman is teaching at the board. مَنْ هَذِهِ؟', a: 'هِيَ مُعَلِّمَةٌ', w: ['هُوَ مُعَلِّمٌ', 'هَذَا مُعَلِّمٌ'] },
            { q: 'A man leads the prayer in the mosque. أَهَذَا إِمَامٌ؟', a: 'نَعَمْ، هَذَا إِمَامٌ', w: ['نَعَمْ، هَذِهِ إِمَامٌ', 'لَا، هَذِهِ طَالِبَةٌ'] },
            { q: 'A girl is carrying her school bag. أَهَذَا وَلَدٌ؟', a: 'لَا، هَذِهِ طَالِبَةٌ', w: ['نَعَمْ، هَذَا وَلَدٌ', 'لَا، هَذَا طَالِبٌ'] },
            { q: 'A man is working in a field with a fork. مَنْ هَذَا؟', a: 'هَذَا فَلَّاحٌ', w: ['هَذِهِ فَلَّاحٌ', 'هَذَا طَبِيبٌ'] },
            { q: 'A nurse is smiling at you. مَنْ هَذِهِ؟', a: 'هِيَ مُمَرِّضَةٌ', w: ['هُوَ مُمَرِّضٌ', 'هَذَا مُحَامٍ'] },
          ],
        },
        {
          type: 'sort', prompt: 'Does each word go with هَذَا or هَذِهِ? Watch out for بِنْتٌ: it is a girl word without ة.',
          groups: ['هَذَا', 'هَذِهِ'],
          items: [['وَلَدٌ', 0], ['طَالِبَةٌ', 1], ['مُعَلِّمٌ', 0], ['مُمَرِّضَةٌ', 1], ['طَبِيبٌ', 0], ['بِنْتٌ', 1], ['إِمَامٌ', 0], ['مُعَلِّمَةٌ', 1], ['مُهَنْدِسٌ', 0], ['سَيَّارَةٌ', 1], ['رَجُلٌ', 0], ['حَقِيبَةٌ', 1]],
        },
        {
          type: 'gap',
          items: [
            { t: '___ قَلَمٌ.', a: 'هَذَا', w: ['هَذِهِ', 'هَؤُلَاءِ'] },
            { t: '___ سَاعَةٌ.', a: 'هَذِهِ', w: ['هَذَا', 'هَؤُلَاءِ'] },
            { t: '___ طُلَّابٌ.', a: 'هَؤُلَاءِ', w: ['هَذَا', 'هَذِهِ'] },
            { t: '___ نَجْمٌ بَعِيدٌ.', a: 'ذَلِكَ', w: ['تِلْكَ', 'هَذِهِ'] },
            { t: '___ طَائِرَةٌ بَعِيدَةٌ.', a: 'تِلْكَ', w: ['ذَلِكَ', 'هَذَا'] },
            { t: '___ كُتُبٌ.', a: 'هَذِهِ', w: ['هَذَا', 'هَؤُلَاءِ'] },
          ],
        },
      ],
    },

    // ── 6. A student at Al-Noor School (pages 13–16) ──
    {
      title: 'A student at Al-Noor School', ar: 'طَالِبٌ مِنْ مَدْرَسَةِ النُّورِ',
      pages: [
        scan(13, 'Meet Aisha and her friends. Use the words in the box at the top to answer each مَنْ question, like the example: مَنْ أَنَا؟ أَنْتِ عَائِشَةُ.'),
        scan(14, 'Aisha tells us about her friend Rayhana. Read it aloud.', { check: 'Line 2 is printed وَهَذا صَدِيقَتِي and line 6 وَهَذا أَصْدِقَاؤُهَا. The typed version on the next page uses هَذِهِ and هَؤُلَاءِ.' }),
        {
          type: 'read', h: 'Aisha and her friends',
          text: [
            { ar: 'أَنَا عَائِشَةُ، وَهَذِهِ صَدِيقَتِي. اسْمُهَا رَيْحَانَةُ، وَعُمُرُهَا اثْنَتَا عَشْرَةَ سَنَةً.' },
            { ar: 'هِيَ فِي مَدْرَسَةِ النُّورِ، وَهَؤُلَاءِ أَصْدِقَاؤُهَا.' },
            { ar: 'مِنَ الْيَمِينِ عَلِيٌّ، وَمِنَ الْيَسَارِ سُلَيْمَانُ. هُمَا فِي نَفْسِ الْفَصْلِ.' },
            'Aisha points at her friend Rayhana, who is twelve. Rayhana goes to Al-Noor School. Ali stands on the right and Sulayman on the left. The two boys are in the same class.',
            { table: [
              ['Arabic', 'English'],
              ['صَدِيقَتِي', 'my friend (a girl)'],
              ['اسْمُهَا', 'her name'],
              ['عُمُرُهَا', 'her age'],
              ['أَصْدِقَاؤُهَا', 'her friends'],
              ['الْيَمِينُ', 'the right'],
              ['الْيَسَارُ', 'the left'],
              ['الْفَصْلُ', 'the class'],
            ] },
          ],
        },
        {
          type: 'quiz',
          items: [
            { q: 'How old is Rayhana?', a: '١٢', w: ['١١', '١٠'] },
            { q: 'Which school do the friends go to?', a: 'مَدْرَسَةُ النُّورِ', w: ['مَدْرَسَةُ الْأَمَلِ', 'الْجَامِعَةُ'] },
            { q: 'Who is standing on the right?', a: 'عَلِيٌّ', w: ['سُلَيْمَانُ', 'عُمَرُ'] },
            { q: 'Why does Aisha say صَدِيقَتِي and not صَدِيقِي?', a: 'Her friend is a girl.', w: ['Her friend is far away.', 'She has two friends.'], why: 'صَدِيقٌ is a boy friend and صَدِيقَةٌ is a girl friend.' },
          ],
        },
        scan(15, 'Choose the right name for each pronoun and write the whole sentence, like the two examples. Then answer the questions under the pictures.'),
        {
          type: 'gap',
          items: [
            { t: 'هَذِهِ ___.', a: 'خَدِيجَةُ', w: ['طه'] },
            { t: 'هِيَ ___.', a: 'مَرْيَمُ', w: ['يُوسُفُ'] },
            { t: 'هُوَ ___.', a: 'طَالِبٌ', w: ['طَالِبَةٌ'] },
            { t: 'هُوَ ___.', a: 'مُعَلِّمٌ', w: ['مُعَلِّمَةٌ'] },
            { t: 'هَذَا ___.', a: 'صَدِيقٌ', w: ['صَدِيقَةٌ'] },
            { t: 'هَلْ هِيَ طَبِيبَةٌ؟ نَعَمْ، ___ طَبِيبَةٌ.', a: 'هِيَ', w: ['هُوَ', 'أَنَا'] },
          ],
        },
        scan(16, 'Aisha\'s teacher phones her home. Listen to the call, say it again, then read it with a partner.'),
        {
          type: 'order', prompt: 'Put the phone call in order. The teacher speaks first.',
          items: [
            'آلُو، مَرْحَبًا.',
            'مَرْحَبًا، تَفَضَّلْ!',
            'أَنَا مُعَلِّمُ عَائِشَةَ.',
            'أَهْلًا يَا أُسْتَاذُ!',
            'عَائِشَةُ غَائِبَةٌ الْيَوْمَ. هَلْ هِيَ فِي الْبَيْتِ؟',
            'هِيَ مَرِيضَةٌ، وَلِذَلِكَ ذَهَبَتْ إِلَى الْمُسْتَشْفَى.',
            'اللهُ يَشْفِيهَا.',
            'شُكْرًا.',
          ],
        },
        {
          type: 'quiz',
          items: [
            { q: 'Why is Aisha not at school today?', a: 'She is ill.', w: ['She is on holiday.', 'She missed the bus.'] },
            { q: 'Where did Aisha go?', a: 'To the hospital', w: ['To the mosque', 'To her friend\'s house'] },
            { q: 'What does اللهُ يَشْفِيهَا mean?', a: 'May Allah make her well.', w: ['See you tomorrow.', 'She is at home.'] },
          ],
        },
      ],
    },

    // ── 7. Things in the classroom (pages 17–19) ──
    {
      title: 'Things in the classroom', ar: 'أَشْيَاءُ الْفَصْلِ',
      pages: [
        scan(17, 'Read the labels in the classroom. Point to each thing and say its name.'),
        scan(18, 'Here are more classroom words. Colour the coloured pencils, the school bag and the map.'),
        {
          type: 'read', h: 'Classroom words',
          text: [
            'Most of these are boy words. The girl words end in ة, like سَبُّورَةٌ and نَافِذَةٌ.',
            { table: [
              ['Arabic', 'English'],
              ['سَبُّورَةٌ', 'board'],
              ['نَافِذَةٌ', 'window'],
              ['بَابٌ', 'door'],
              ['كُرْسِيٌّ', 'chair'],
              ['طَاوِلَةٌ', 'table'],
              ['مَكْتَبٌ', 'desk'],
              ['كِتَابٌ', 'book'],
              ['دَفْتَرٌ', 'notebook'],
              ['قَلَمٌ', 'pen'],
              ['قَلَمُ رَصَاصٍ', 'pencil'],
              ['أَقْلَامُ تَلْوِينٍ', 'coloured pencils'],
              ['مِمْحَاةٌ', 'eraser'],
              ['مِبْرَاةٌ', 'sharpener'],
              ['مِسْطَرَةٌ', 'ruler'],
              ['مِقَصٌّ', 'scissors'],
              ['حَقِيبَةُ الْأَقْلَامِ', 'pencil case'],
              ['حَقِيبَةُ الْمَدْرَسَةِ', 'school bag'],
              ['خَرِيطَةٌ', 'map'],
              ['سَلَّةُ النُّفَايَاتِ', 'bin'],
            ] },
          ],
        },
        scan(19, 'Write the Arabic name of each thing in the box with the same letter.'),
        {
          type: 'match', prompt: 'Match the classroom words.',
          pairs: [
            ['مِقَصٌّ', 'scissors'],
            ['مِمْحَاةٌ', 'eraser'],
            ['مِسْطَرَةٌ', 'ruler'],
            ['كِتَابٌ', 'book'],
            ['دَفْتَرٌ', 'notebook'],
            ['كُرْسِيٌّ', 'chair'],
            ['نَافِذَةٌ', 'window'],
            ['سَبُّورَةٌ', 'board'],
          ],
        },
      ],
    },

    // ── 8. Numbers (pages 20–21) ──
    {
      title: 'Numbers', ar: 'الْأَعْدَادُ',
      pages: [
        scan(20, 'Say each number aloud with your teacher, from ١ to ٥٠.'),
        {
          type: 'read', h: 'Counting in Arabic',
          text: [
            'Arabic has its own digits: the 2 we write in English is ٢ in Arabic. From 13 to 19 you say the small number first, then عَشَرَ. So ثَلَاثَةَ عَشَرَ is 13.',
            'For 25 you say "five and twenty": خَمْسَةٌ وَعِشْرُونَ.',
            { table: [
              ['Number', 'Arabic digit', 'In words'],
              ['1', '١', 'وَاحِدٌ'], ['2', '٢', 'اثْنَانِ'], ['3', '٣', 'ثَلَاثَةٌ'], ['4', '٤', 'أَرْبَعَةٌ'], ['5', '٥', 'خَمْسَةٌ'],
              ['6', '٦', 'سِتَّةٌ'], ['7', '٧', 'سَبْعَةٌ'], ['8', '٨', 'ثَمَانِيَةٌ'], ['9', '٩', 'تِسْعَةٌ'], ['10', '١٠', 'عَشَرَةٌ'],
              ['11', '١١', 'أَحَدَ عَشَرَ'], ['12', '١٢', 'اثْنَا عَشَرَ'], ['13', '١٣', 'ثَلَاثَةَ عَشَرَ'], ['14', '١٤', 'أَرْبَعَةَ عَشَرَ'],
              ['15', '١٥', 'خَمْسَةَ عَشَرَ'], ['16', '١٦', 'سِتَّةَ عَشَرَ'], ['17', '١٧', 'سَبْعَةَ عَشَرَ'], ['18', '١٨', 'ثَمَانِيَةَ عَشَرَ'],
              ['19', '١٩', 'تِسْعَةَ عَشَرَ'], ['20', '٢٠', 'عِشْرُونَ'], ['25', '٢٥', 'خَمْسَةٌ وَعِشْرُونَ'], ['30', '٣٠', 'ثَلَاثُونَ'],
              ['35', '٣٥', 'خَمْسَةٌ وَثَلَاثُونَ'], ['40', '٤٠', 'أَرْبَعُونَ'], ['45', '٤٥', 'خَمْسَةٌ وَأَرْبَعُونَ'], ['50', '٥٠', 'خَمْسُونَ'],
              ['60', '٦٠', 'سِتُّونَ'], ['70', '٧٠', 'سَبْعُونَ'], ['80', '٨٠', 'ثَمَانُونَ'], ['90', '٩٠', 'تِسْعُونَ'], ['100', '١٠٠', 'مِئَةٌ'],
            ] },
          ],
        },
        {
          type: 'match', prompt: 'Match each number with its name.',
          pairs: [
            ['٣', 'ثَلَاثَةٌ'],
            ['٧', 'سَبْعَةٌ'],
            ['٩', 'تِسْعَةٌ'],
            ['١٢', 'اثْنَا عَشَرَ'],
            ['٢٠', 'عِشْرُونَ'],
            ['٤٠', 'أَرْبَعُونَ'],
            ['١٠٠', 'مِئَةٌ'],
          ],
        },
        scan(21, 'Write each number in Arabic words. Then finish the sentences about the things in your school bag.'),
        {
          type: 'quiz',
          items: [
            { q: 'How do you write 53 in Arabic words?', a: 'ثَلَاثَةٌ وَخَمْسُونَ', w: ['خَمْسَةٌ وَثَلَاثُونَ', 'ثَلَاثَةَ عَشَرَ'] },
            { q: 'How do you write 17?', a: 'سَبْعَةَ عَشَرَ', w: ['سَبْعُونَ', 'سَبْعَةٌ'] },
            { q: 'How do you write 100?', a: 'مِئَةٌ', w: ['عَشَرَةٌ', 'أَلْفٌ'] },
            { q: 'How do you write 20?', a: 'عِشْرُونَ', w: ['اثْنَانِ', 'اثْنَا عَشَرَ'] },
            { q: 'Which number is خَمْسَةٌ وَأَرْبَعُونَ?', a: '٤٥', w: ['٥٤', '١٥'] },
          ],
        },
      ],
    },

    // ── 9. Talking in class (pages 22–23) ──
    {
      title: 'Talking in class', ar: 'مُمَارَسَةُ التَّحَدُّثِ',
      pages: [
        scan(22, 'Read how the children ask for things politely. Then ask your partner for a pen, then a book.'),
        {
          type: 'read', h: 'Polite words',
          text: [
            'Say مِنْ فَضْلِكَ to a boy and مِنْ فَضْلِكِ to a girl. It is the same fatha and kasra you saw in أَنْتَ and أَنْتِ.',
            { table: [
              ['Arabic', 'English'],
              ['أَعْطِنِي الْقَلَمَ، مِنْ فَضْلِكَ.', 'Give me the pen, please.'],
              ['تَفَضَّلْ', 'Here you are.'],
              ['بِالتَّأْكِيدِ / طَبْعًا', 'Of course.'],
              ['شُكْرًا', 'Thank you.'],
              ['عَفْوًا', 'You\'re welcome.'],
              ['آسِفٌ، لَيْسَ الْآنَ.', 'Sorry, not now.'],
              ['قُلْ ذَلِكَ مَرَّةً أُخْرَى، مِنْ فَضْلِكَ.', 'Say that again, please.'],
            ] },
          ],
        },
        scan(23, 'These are things the teacher says in class. Act each one out when your teacher says it.'),
        {
          type: 'read', h: 'What the teacher says',
          text: [
            'When the teacher speaks to the whole class, the word gets ـُوا on the end. اِجْلِسْ is "sit down" to one child, and اِجْلِسُوا is "sit down" to everyone.',
            { table: [
              ['Arabic', 'English'],
              ['اِجْلِسْ / اِجْلِسُوا', 'Sit down.'],
              ['قِفْ / قُمْ', 'Stand up.'],
              ['تَفَضَّلْ (دَاخِلًا)', 'Come in.'],
              ['اُسْكُتْ / اُسْكُتُوا', 'Be quiet.'],
              ['اِفْتَحِ النَّافِذَةَ', 'Open the window.'],
              ['أَغْلِقِ الْبَابَ', 'Close the door.'],
              ['أَشْعِلِ النُّورَ', 'Turn on the light.'],
              ['أَطْفِئِ النُّورَ', 'Turn off the light.'],
              ['اِمْسَحِ السَّبُّورَةَ', 'Wipe the board.'],
              ['أَجِبْ عَنِ السُّؤَالِ', 'Answer the question.'],
              ['اُنْظُرْ إِلَى السَّبُّورَةِ', 'Look at the board.'],
              ['تَدَرَّبْ', 'Practise.'],
            ] },
          ],
          check: 'Page 23 prints اغْلِقِ الْبَابَ without the hamza, and the second word for "stand up" looks like كُم. They are typed as أَغْلِقِ and قُمْ.',
        },
        {
          type: 'match', prompt: 'Match what the teacher says with its meaning.',
          pairs: [
            ['اِجْلِسْ', 'Sit down.'],
            ['قُمْ', 'Stand up.'],
            ['اُسْكُتْ', 'Be quiet.'],
            ['اِفْتَحِ النَّافِذَةَ', 'Open the window.'],
            ['أَغْلِقِ الْبَابَ', 'Close the door.'],
            ['اُنْظُرْ إِلَى السَّبُّورَةِ', 'Look at the board.'],
          ],
        },
        {
          type: 'quiz',
          items: [
            { q: 'Your classmate says أَعْطِنِي الْمِقَصَّ، مِنْ فَضْلِكَ. You hand over the scissors. What do you say?', a: 'تَفَضَّلْ', w: ['آسِفٌ', 'عَفْوًا'] },
            { q: 'Now they say شُكْرًا. What do you answer?', a: 'عَفْوًا', w: ['تَفَضَّلْ', 'مِنْ فَضْلِكَ'] },
            { q: 'You did not hear the teacher. What can you say?', a: 'قُلْ ذَلِكَ مَرَّةً أُخْرَى، مِنْ فَضْلِكَ.', w: ['أَطْفِئِ النُّورَ', 'تَدَرَّبْ'] },
            { q: 'The room is dark. What does the teacher ask?', a: 'أَشْعِلِ النُّورَ', w: ['أَطْفِئِ النُّورَ', 'اِمْسَحِ السَّبُّورَةَ'] },
          ],
        },
      ],
    },

    // ── 10. What is this? (pages 24–28) ──
    {
      title: 'What is this?', ar: 'مَا هَذَا؟',
      pages: [
        scan(24, 'Write the meaning of مَا and هَذَا in the table. Then read the sentence under each picture.'),
        {
          type: 'read', h: 'Asking about things',
          text: [
            'مَا means "what" and we use it for things. مَنْ means "who" and we use it for people.',
            'To ask a yes or no question, put أَ in front: أَهَذَا بَيْتٌ؟ means "Is this a house?" Answer with نَعَمْ (yes) or لَا (no).',
            { note: { h: 'One and many', t: 'A plural of things takes هَذِهِ, even when the single word is a boy word: هَذَا بَابٌ, هَذِهِ أَبْوَابٌ.' } },
            { table: [
              ['One', 'Many', 'English'],
              ['هَذَا بَيْتٌ', 'هَذِهِ بُيُوتٌ', 'house, houses'],
              ['هَذَا مَسْجِدٌ', 'هَذِهِ مَسَاجِدُ', 'mosque, mosques'],
              ['هَذَا فَصْلٌ', 'هَذِهِ فُصُولٌ', 'class, classes'],
              ['هَذَا دَفْتَرٌ', 'هَذِهِ دَفَاتِرُ', 'notebook, notebooks'],
              ['هَذَا بَابٌ', 'هَذِهِ أَبْوَابٌ', 'door, doors'],
              ['هَذَا مِفْتَاحٌ', 'هَذِهِ مَفَاتِيحُ', 'key, keys'],
              ['هَذَا سَرِيرٌ', 'هَذِهِ سُرُرٌ', 'bed, beds'],
              ['هَذَا كُرْسِيٌّ', 'هَذِهِ كَرَاسِيُّ', 'chair, chairs'],
              ['هَذَا قَلَمُ رَصَاصٍ', 'هَذِهِ أَقْلَامُ رَصَاصٍ', 'pencil, pencils'],
              ['هَذِهِ حَقِيبَةٌ', 'هَذِهِ حَقَائِبُ', 'bag, bags'],
              ['هَذَا مَكْتَبٌ', 'هَذِهِ مَكَاتِبُ', 'desk, desks'],
            ] },
          ],
        },
        scan(25, 'Write the English meaning next to each pair. Notice that every plural uses هَذِهِ.', { check: 'Row 9 is printed هَذَا رَصَاصَةٌ / هَذِهِ رَصَاصَاتٌ, which means a bullet. The typed table uses قَلَمُ رَصَاصٍ (a pencil). كُرَاسٍ is typed as كَرَاسِيُّ.' }),
        {
          type: 'match', prompt: 'Match one with many.',
          pairs: [
            ['بَيْتٌ', 'بُيُوتٌ'],
            ['مَسْجِدٌ', 'مَسَاجِدُ'],
            ['دَفْتَرٌ', 'دَفَاتِرُ'],
            ['بَابٌ', 'أَبْوَابٌ'],
            ['مِفْتَاحٌ', 'مَفَاتِيحُ'],
            ['حَقِيبَةٌ', 'حَقَائِبُ'],
            ['مَكْتَبٌ', 'مَكَاتِبُ'],
          ],
        },
        scan(26, 'Answer the question next to each picture. If the guess is wrong, start your answer with لَا.'),
        {
          type: 'quiz',
          items: [
            { q: 'You are looking at a hospital. أَهَذَا بَيْتٌ؟', a: 'لَا، هَذَا مُسْتَشْفًى', w: ['نَعَمْ، هَذَا بَيْتٌ', 'لَا، هَذِهِ مُسْتَشْفًى'] },
            { q: 'You are looking at a red notebook. أَهَذَا كُرْسِيٌّ؟', a: 'لَا، هَذَا دَفْتَرٌ', w: ['نَعَمْ، هَذَا كُرْسِيٌّ', 'لَا، هَذِهِ دَفْتَرٌ'] },
            { q: 'You are looking at a door. أَهَذَا بَيْتٌ؟', a: 'لَا، هَذَا بَابٌ', w: ['نَعَمْ، هَذَا بَيْتٌ', 'لَا، هَذِهِ بَابٌ'] },
            { q: 'You are looking at a bed. أَهَذَا سَرِيرٌ؟', a: 'نَعَمْ، هَذَا سَرِيرٌ', w: ['لَا، هَذَا سَرِيرٌ', 'نَعَمْ، هَذِهِ سَرِيرٌ'] },
            { q: 'You are looking at a school bag. مَا هَذِهِ؟', a: 'هَذِهِ حَقِيبَةٌ', w: ['هَذَا حَقِيبَةٌ', 'هَذِهِ حَقَائِبُ'] },
          ],
        },
        scan(27, 'Work with a friend. One of you asks مَا هَذَا؟ or أَهَذَا ...؟ about things in the room. The other answers with a whole sentence, starting with نَعَمْ or لَا.'),
        scan(28, 'Listen to your teacher. Write the words you hear, then write the sentences.'),
        { type: 'write', prompt: 'Look around your room. Write three sentences in Arabic about things you can see, like هَذَا بَابٌ.', lines: 3, hint: 'هَذَا ... / هَذِهِ ...' },
      ],
    },

    // ── 11. Unit test (pages 30–31) ──
    {
      title: 'Unit One test', ar: 'اخْتِبَارٌ', test: true,
      pages: [
        scan(30, 'This is the test. Do it on paper first, then answer the questions on the next pages.', { check: 'Question 2 (عندما يطابق كتب البيع شكل أيّ نجد؟) is not clear, so it is left out of the online test. In question 6 all four number pairs look correct; the online test asks the same kind of question with one wrong pair.' }),
        scan(31, 'Questions 7 and 10 are on this page.'),
        {
          type: 'quiz',
          items: [
            { q: 'The teacher puts a finger on her lips and says "shhh". Which sentence explains the picture?', a: 'كُنْ هَادِئًا', w: ['نَظِّفِ اللَّوْحَ', 'اِجْلِسْ', 'اِنْتَظِرْ'] },
            { q: 'Put these letters together to make a number: ث ل ا ث و ن', a: 'ثَلَاثُونَ', w: ['ثَلَاثَةٌ', 'ثَمَانُونَ', 'ثَلَاثَةَ عَشَرَ'] },
            { q: 'The pictures show a girl raising her hand, a girl opening a window and a girl walking out. Which instruction is not in the pictures?', a: 'أَشْعِلِ النُّورَ', w: ['اُخْرُجْ', 'اِفْتَحِ النَّافِذَةَ', 'اِرْفَعْ يَدَيْكَ'] },
            { q: 'Which number and word do not match?', a: '٢٣ = ثَلَاثُونَ', w: ['١٤ = أَرْبَعَةَ عَشَرَ', '١٩ = تِسْعَةَ عَشَرَ', '٥٢ = اثْنَانِ وَخَمْسُونَ'] },
            { q: 'A girl asks هَلْ يُمْكِنُنِي اسْتِعَارَةُ دَفْتَرِكَ؟ The boy gives her the notebook. What does he say?', a: 'بِالطَّبْعِ', w: ['آسِفٌ، لَيْسَ الْآنَ', 'لَا، أَنَا آسِفٌ', 'لَا، لَا يُمْكِنُكِ'] },
            { q: 'On the table are a school bag, a ruler, a book and a pencil case. What is missing?', a: 'مِبْرَاةٌ', w: ['حَقِيبَةُ الْمَدْرَسَةِ', 'كِتَابٌ', 'مِسْطَرَةٌ'] },
          ],
        },
        {
          type: 'order', prompt: 'Make a question from these words: "Can I close the door?"',
          items: ['أَيُمْكِنُنِي', 'إِغْلَاقُ', 'الْبَابِ؟'],
        },
        {
          type: 'gap',
          items: [
            { t: 'صَبَاحُ الْخَيْرِ. صَبَاحُ ___.', a: 'النُّورِ', w: ['السَّلَامَةِ', 'الْخَيْرِ'] },
            { t: '___ مُعَلِّمَةٌ.', a: 'هَذِهِ', w: ['هَذَا', 'هُوَ'] },
            { t: '___ طَبِيبٌ.', a: 'هُوَ', w: ['هِيَ', 'هَذِهِ'] },
            { t: 'هَذِهِ ___.', a: 'مَسَاجِدُ', w: ['مَسْجِدٌ', 'رَجُلٌ'] },
            { t: 'يَا مَرْيَمُ، أَيْنَ ___؟', a: 'قَلَمُكِ', w: ['قَلَمُكَ', 'قَلَمُهُ'] },
          ],
        },
        {
          type: 'match', prompt: 'Match the Arabic with the English.',
          pairs: [
            ['تَشَرَّفْنَا', 'Pleased to meet you'],
            ['اِمْسَحِ السَّبُّورَةَ', 'Wipe the board.'],
            ['مِمْحَاةٌ', 'eraser'],
            ['نَحْنُ', 'we'],
            ['عَفْوًا', 'You\'re welcome.'],
            ['خَمْسُونَ', '٥٠'],
          ],
        },
      ],
    },

    // ── 12. Animals (pages 29, 32–35) ──
    {
      title: 'Animals', ar: 'الْحَيَوَانَاتُ',
      pages: [
        scan(29, 'Read the questions and answers about the animals. One answer is wrong: the rooster is دِيكٌ, a boy word, so the answer should be نَعَمْ، هَذَا دِيكٌ.', { check: 'The rooster is printed أ هذه ديك؟ نعم، هذه دجاجة. The children are told the right answer is أَهَذَا دِيكٌ؟ نَعَمْ، هَذَا دِيكٌ. The goat is printed مِعْزَى; this book uses مَاعِزٌ, as on page 51.' }),
        {
          type: 'read', h: 'Animal words',
          text: [
            'Animals are boy words or girl words too. Most of them are boy words, but نَمْلَةٌ, قِطَّةٌ, بَطَّةٌ and دَجَاجَةٌ are girl words.',
            { table: [
              ['Arabic', 'English'],
              ['كَلْبٌ', 'dog'], ['قِطَّةٌ', 'cat'], ['خَرُوفٌ', 'sheep'], ['مَاعِزٌ', 'goat'],
              ['بَقَرَةٌ', 'cow'], ['حِصَانٌ', 'horse'], ['حِمَارٌ', 'donkey'], ['جَمَلٌ', 'camel'],
              ['دِيكٌ', 'rooster'], ['دَجَاجَةٌ', 'hen'], ['بَطَّةٌ', 'duck'], ['طَائِرٌ', 'bird'],
              ['بَبَّغَاءُ', 'parrot'], ['لَقْلَقٌ', 'stork'], ['أَرْنَبٌ', 'rabbit'], ['خِنْزِيرٌ', 'pig'],
              ['أَسَدٌ / قَسْوَرَةٌ', 'lion'], ['نَمِرٌ', 'tiger'], ['فِيلٌ', 'elephant'], ['قِرْدٌ', 'monkey'],
              ['دُبٌّ', 'bear'], ['تِمْسَاحٌ', 'crocodile'], ['ثُعْبَانٌ', 'snake'], ['سَمَكَةٌ', 'fish'],
              ['حُوتٌ', 'whale'], ['نَمْلَةٌ', 'ant'], ['بَعُوضَةٌ', 'mosquito'], ['ذُبَابٌ', 'fly'], ['دُودٌ', 'worm'],
            ] },
          ],
        },
        scan(32, 'Write each animal in the grid into the right row: animals that live with people, and animals that live in the wild.'),
        scan(33, 'Here are more animals. Sort these into the two rows as well.'),
        {
          type: 'sort', prompt: 'Does each animal live with people (مَنْزِلِيٌّ) or in the wild (بَرِّيٌّ)?',
          groups: ['Lives with people (مَنْزِلِيٌّ)', 'Lives in the wild (بَرِّيٌّ)'],
          items: [['كَلْبٌ', 0], ['أَسَدٌ', 1], ['قِطَّةٌ', 0], ['فِيلٌ', 1], ['خَرُوفٌ', 0], ['قِرْدٌ', 1], ['بَقَرَةٌ', 0], ['نَمِرٌ', 1], ['حِصَانٌ', 0], ['دُبٌّ', 1], ['دَجَاجَةٌ', 0], ['تِمْسَاحٌ', 1], ['جَمَلٌ', 0], ['ثُعْبَانٌ', 1]],
        },
        scan(34, 'Talk with a friend. Say what the animal is, then say whether it lives with people or in the wild, like the two examples.'),
        {
          type: 'match', prompt: 'Match the animals.',
          pairs: [
            ['حِصَانٌ', 'horse'],
            ['جَمَلٌ', 'camel'],
            ['بَقَرَةٌ', 'cow'],
            ['أَرْنَبٌ', 'rabbit'],
            ['قِرْدٌ', 'monkey'],
            ['تِمْسَاحٌ', 'crocodile'],
            ['بَطَّةٌ', 'duck'],
            ['نَمْلَةٌ', 'ant'],
          ],
        },
        {
          type: 'gap',
          items: [
            { t: 'هَذَا كَلْبٌ. الْكَلْبُ حَيَوَانٌ ___.', a: 'مَنْزِلِيٌّ', w: ['بَرِّيٌّ'] },
            { t: 'هَذَا أَسَدٌ. الْأَسَدُ حَيَوَانٌ ___.', a: 'بَرِّيٌّ', w: ['مَنْزِلِيٌّ'] },
            { t: '___ جَمَلٌ.', a: 'هَذَا', w: ['هَذِهِ'] },
            { t: '___ نَمْلَةٌ.', a: 'هَذِهِ', w: ['هَذَا'] },
            { t: 'أَهَذَا حِصَانٌ؟ لَا، هَذَا ___.', a: 'طَائِرٌ', w: ['بَقَرَةٌ', 'دَجَاجَةٌ'] },
          ],
        },
        scan(35, 'Some answers on this page do not match their pictures. Find the wrong ones and write the right answer. For example, the boy is not a playground, so write هَذَا وَلَدٌ.', { check: 'Many answers on page 35 do not fit their pictures (a boy labelled مَلْعَب, a board labelled طَالِبٌ, chalk labelled طَبِيبٌ, a hand after أَهَذَا رِجْلٌ؟, a shoe labelled مُحَامٍ). It is set as a find-the-mistakes page; please confirm that is what the teacher wants.' }),
      ],
    },

    // ── 13. Colours (pages 36, 40, 41) ──
    {
      title: 'Colours', ar: 'الْأَلْوَانُ',
      pages: [
        scan(36, 'Read the colours. Colour a small patch next to each name with your crayons.'),
        {
          type: 'read', h: 'Colours for boy words and girl words',
          text: [
            'A colour changes when it describes a girl word. The main colours have a special girl form, like أَحْمَرُ and حَمْرَاءُ. Colours that end in ـِيٌّ just add ة.',
            'The colour comes after the thing: قَمِيصٌ أَحْمَرُ is "a red shirt", and حَقِيبَةٌ خَضْرَاءُ is "a green bag".',
            { table: [
              ['Boy word', 'Girl word', 'English'],
              ['أَحْمَرُ', 'حَمْرَاءُ', 'red'],
              ['أَزْرَقُ', 'زَرْقَاءُ', 'blue'],
              ['أَخْضَرُ', 'خَضْرَاءُ', 'green'],
              ['أَصْفَرُ', 'صَفْرَاءُ', 'yellow'],
              ['أَسْوَدُ', 'سَوْدَاءُ', 'black'],
              ['أَبْيَضُ', 'بَيْضَاءُ', 'white'],
              ['بُنِّيٌّ', 'بُنِّيَّةٌ', 'brown'],
              ['بُرْتُقَالِيٌّ', 'بُرْتُقَالِيَّةٌ', 'orange'],
              ['بَنَفْسَجِيٌّ', 'بَنَفْسَجِيَّةٌ', 'purple'],
              ['رَمَادِيٌّ', 'رَمَادِيَّةٌ', 'grey'],
              ['وَرْدِيٌّ', 'وَرْدِيَّةٌ', 'pink'],
              ['ذَهَبِيٌّ', 'ذَهَبِيَّةٌ', 'gold'],
              ['فِضِّيٌّ', 'فِضِّيَّةٌ', 'silver'],
            ] },
            { table: [
              ['More colour words', 'English'],
              ['أَسْمَرُ', 'light brown, tan'],
              ['أَشْقَرُ', 'fair, reddish blond'],
              ['نِيلِيٌّ', 'dark blue'],
              ['تُرْكُوَازِيٌّ', 'turquoise'],
              ['عَسَلِيٌّ', 'honey-coloured'],
              ['أَحْمَرُ دَاكِنٌ', 'dark red'],
              ['مُلَوَّنٌ', 'colourful'],
            ] },
          ],
          check: 'Turquoise is printed تُركواز; it is typed as تُرْكُوَازِيٌّ so it matches the other colour words.',
        },
        {
          type: 'match', prompt: 'Match the colours.',
          pairs: [
            ['أَحْمَرُ', 'red'],
            ['أَزْرَقُ', 'blue'],
            ['أَخْضَرُ', 'green'],
            ['أَصْفَرُ', 'yellow'],
            ['أَسْوَدُ', 'black'],
            ['أَبْيَضُ', 'white'],
            ['بُرْتُقَالِيٌّ', 'orange'],
            ['وَرْدِيٌّ', 'pink'],
          ],
        },
        scan(40, 'Write the name of each thing and its colour, like طَائِرٌ أَصْفَرُ.'),
        {
          type: 'gap', h: 'Boy colour or girl colour?',
          items: [
            { t: 'طَائِرٌ ___', a: 'أَصْفَرُ', w: ['صَفْرَاءُ', 'حَمْرَاءُ'] },
            { t: 'قَمِيصٌ ___', a: 'أَحْمَرُ', w: ['حَمْرَاءُ', 'زَرْقَاءُ'] },
            { t: 'حَقِيبَةٌ ___', a: 'خَضْرَاءُ', w: ['أَخْضَرُ', 'أَزْرَقُ'] },
            { t: 'فِيلٌ ___', a: 'رَمَادِيٌّ', w: ['رَمَادِيَّةٌ', 'وَرْدِيَّةٌ'] },
            { t: 'قُبَّعَةٌ ___', a: 'زَرْقَاءُ', w: ['أَزْرَقُ', 'أَصْفَرُ'] },
            { t: 'سَيَّارَةٌ ___', a: 'بَيْضَاءُ', w: ['أَبْيَضُ', 'أَسْوَدُ'] },
          ],
        },
        scan(41, 'A family is choosing paint for their sitting room. Read the conversation with your teacher, taking a part each.'),
        {
          type: 'quiz',
          items: [
            { q: 'Which colour does the son want for the sitting room?', a: 'Blue', w: ['Pink', 'Yellow'] },
            { q: 'Which colour does the daughter like?', a: 'Dark pink', w: ['Light green', 'Grey'] },
            { q: 'Which colours does the mother like?', a: 'Calm colours, like light green', w: ['Dark red and black', 'Orange and gold'] },
            { q: 'Why is the paint good for the mother, who wipes the walls every month?', a: 'It can be washed and has no smell.', w: ['It is very cheap.', 'It dries in one minute.'] },
          ],
        },
      ],
    },

    // ── 14. Places in town (pages 37–39) ──
    {
      title: 'Places in town', ar: 'أَمَاكِنُ فِي الْمَدِينَةِ',
      pages: [
        scan(37, 'Read the names of the places. Which ones do you pass on the way to school?'),
        {
          type: 'read', h: 'Places',
          text: [
            { table: [
              ['Arabic', 'English'],
              ['الشَّارِعُ', 'the street'],
              ['السُّوقُ', 'the market'],
              ['مَرْكَزُ الشُّرْطَةِ', 'the police station'],
              ['الْمُسْتَشْفَى', 'the hospital'],
              ['الْفُنْدُقُ', 'the hotel'],
              ['الْحَدِيقَةُ الْعَامَّةُ', 'the park'],
              ['الْمَطْعَمُ', 'the restaurant'],
              ['الْمَحَطَّةُ', 'the station'],
              ['مَكْتَبُ الْبَرِيدِ', 'the post office'],
              ['الصَّيْدَلِيَّةُ', 'the pharmacy'],
              ['الْمَحَلُّ / الْمَتْجَرُ', 'the shop'],
              ['الْبَنْكُ / الْمَصْرِفُ', 'the bank'],
              ['الْمَكْتَبَةُ', 'the library'],
              ['الْمَسْجِدُ', 'the mosque'],
              ['الْجَامِعَةُ', 'the university'],
              ['الْمَطَارُ', 'the airport'],
              ['الْجِسْرُ', 'the bridge'],
              ['إِشَارَةُ الْمُرُورِ', 'the traffic sign'],
              ['الْمَعْهَدُ', 'the institute'],
              ['مَقْهَى الْحَاسُوبِ', 'the internet café'],
              ['السِّفَارَةُ', 'the embassy'],
              ['النَّفَقُ', 'the tunnel'],
              ['الصَّرَّافُ', 'the cash machine'],
              ['مَوْقِفُ السَّيَّارَاتِ', 'the car park'],
            ] },
          ],
        },
        scan(38, 'These words tell us where something is. Look at where the ball is next to each box.'),
        {
          type: 'read', h: 'Where is it?',
          text: [
            'Look carefully at two words that look alike. شِمَالٌ with a kasra means "left", and شَمَالٌ with a fatha means "north".',
            { table: [
              ['Arabic', 'English'],
              ['فَوْقَ', 'above, on top of'],
              ['تَحْتَ', 'under'],
              ['أَمَامَ', 'in front of'],
              ['وَرَاءَ / خَلْفَ', 'behind'],
              ['بَيْنَ', 'between'],
              ['عِنْدَ / لَدَى', 'at, by'],
              ['بِجَانِبِ', 'next to'],
              ['دَاخِلَ', 'inside'],
              ['خَارِجَ', 'outside'],
              ['وَسَطَ', 'in the middle of'],
              ['حَوْلَ', 'around'],
              ['قَبْلَ', 'before'],
              ['بَعْدَ', 'after'],
              ['يَمِينٌ', 'right'],
              ['شِمَالٌ / يَسَارٌ', 'left'],
              ['زَاوِيَةٌ', 'corner'],
              ['شَمَالٌ', 'north'],
              ['جَنُوبٌ', 'south'],
              ['شَرْقٌ', 'east'],
              ['غَرْبٌ', 'west'],
            ] },
          ],
        },
        scan(39, 'Look at the town. Write sentences about where things are, using words like أَمَامَ and بِجَانِبِ.'),
        {
          type: 'match', prompt: 'Match the places.',
          pairs: [
            ['الْمَسْجِدُ', 'the mosque'],
            ['الْمُسْتَشْفَى', 'the hospital'],
            ['الْمَطَارُ', 'the airport'],
            ['السُّوقُ', 'the market'],
            ['الْمَكْتَبَةُ', 'the library'],
            ['الْجِسْرُ', 'the bridge'],
            ['الْمَطْعَمُ', 'the restaurant'],
          ],
        },
        {
          type: 'match', prompt: 'Match each word with its opposite.',
          pairs: [
            ['فَوْقَ', 'تَحْتَ'],
            ['أَمَامَ', 'خَلْفَ'],
            ['دَاخِلَ', 'خَارِجَ'],
            ['يَمِينٌ', 'يَسَارٌ'],
            ['قَبْلَ', 'بَعْدَ'],
            ['شَرْقٌ', 'غَرْبٌ'],
          ],
        },
        {
          type: 'quiz',
          items: [
            { q: 'Where do you go to buy medicine?', a: 'الصَّيْدَلِيَّةُ', w: ['الْمَطَارُ', 'الْفُنْدُقُ'] },
            { q: 'Where do planes land?', a: 'الْمَطَارُ', w: ['النَّفَقُ', 'الْبَنْكُ'] },
            { q: 'Where do we pray Jumu\'ah?', a: 'الْمَسْجِدُ', w: ['السُّوقُ', 'الْمَطْعَمُ'] },
            { q: 'Where can you borrow books?', a: 'الْمَكْتَبَةُ', w: ['الْمَحَطَّةُ', 'السِّفَارَةُ'] },
            { q: 'The ball is under the box. Which word means "under"?', a: 'تَحْتَ', w: ['فَوْقَ', 'أَمَامَ'] },
            { q: 'Which word means "north"?', a: 'شَمَالٌ', w: ['شِمَالٌ', 'جَنُوبٌ'], why: 'شِمَالٌ with a kasra means "left".' },
          ],
        },
      ],
    },

    // ── 15. Sun and moon letters (pages 42–44) ──
    {
      title: 'Sun and moon letters', ar: 'الْحُرُوفُ الشَّمْسِيَّةُ وَالْقَمَرِيَّةُ',
      pages: [
        {
          type: 'read', h: 'Can you hear the lam?',
          text: [
            'الـ means "the". With some letters you can hear the ل clearly: الْقَمَرُ is said "al-qamar". These are the moon letters, because قَمَرٌ means "moon".',
            'With the other letters the ل goes silent and the next letter is said twice, with a shadda: الشَّمْسُ is said "ash-shams". These are the sun letters, because شَمْسٌ means "sun".',
            { table: [
              ['', 'The 14 letters'],
              ['Moon letters (you hear the ل)', 'أ ب ج ح خ ع غ ف ق ك م ه و ي'],
              ['Sun letters (the ل is silent)', 'ت ث د ذ ر ز س ش ص ض ط ظ ل ن'],
            ] },
            { note: { h: 'A quick trick', t: 'Look at the letter after الـ. If it has a shadda, it is a sun letter. If the ل has a sukun, it is a moon letter.' } },
          ],
        },
        scan(42, 'Read the two lists of letters. In the empty boxes, write how each example word sounds.'),
        {
          type: 'read', h: 'Say them aloud',
          text: [
            { table: [
              ['Word', 'With الـ', 'Say it'],
              ['قَمَرٌ', 'الْقَمَرُ', 'al-qamar'],
              ['بَيْتٌ', 'الْبَيْتُ', 'al-bayt'],
              ['مَاءٌ', 'الْمَاءُ', 'al-maa\''],
              ['كِتَابٌ', 'الْكِتَابُ', 'al-kitab'],
              ['شَمْسٌ', 'الشَّمْسُ', 'ash-shams'],
              ['تُفَّاحَةٌ', 'التُّفَّاحَةُ', 'at-tuffaha'],
              ['رَجُلٌ', 'الرَّجُلُ', 'ar-rajul'],
              ['نَخْلَةٌ', 'النَّخْلَةُ', 'an-nakhla'],
              ['لَاعِبٌ', 'اللَّاعِبُ', 'al-la\'ib'],
              ['سِنْجَابٌ', 'السِّنْجَابُ', 'as-sinjab'],
              ['طَائِرَةٌ', 'الطَّائِرَةُ', 'at-ta\'ira'],
              ['ظَلَامٌ', 'الظَّلَامُ', 'adh-dhalam'],
              ['صَبْرٌ', 'الصَّبْرُ', 'as-sabr'],
              ['ضُيُوفٌ', 'الضُّيُوفُ', 'ad-duyuf'],
              ['ذُرَةٌ', 'الذُّرَةُ', 'adh-dhura'],
            ] },
          ],
          check: 'Page 44 (the table of sun-letter words) has several slips, for example ظَلَام written as اظّلام, the ط row given twice, رَمْل under ر with أَزْهَرَةٌ beside it, and ذُرَة under د. It is not shown; this typed table gives the same kind of examples. The "say it" spellings are a guide for children.',
        },
        scan(43, 'Write sun or moon next to each word.'),
        {
          type: 'sort', prompt: 'Does the word start with a sun letter or a moon letter after الـ?',
          groups: ['Moon letter', 'Sun letter'],
          items: [['الشَّمْسُ', 1], ['الْقَلَمُ', 0], ['السَّمَاءُ', 1], ['الْمَكْتَبُ', 0], ['التُّفَّاحَةُ', 1], ['الْكِتَابُ', 0], ['الضُّيُوفُ', 1], ['الْمَنْزِلُ', 0], ['الرَّجُلُ', 1], ['الْعَالَمُ', 0], ['النُّورُ', 1], ['الْبَابُ', 0]],
        },
        {
          type: 'quiz',
          items: [
            { q: 'In الشَّمْسُ, do you hear the ل?', a: 'No. ش is a sun letter.', w: ['Yes. ش is a moon letter.'] },
            { q: 'Which word starts with a moon letter?', a: 'الْقَمَرُ', w: ['الشَّمْسُ', 'النُّورُ'] },
            { q: 'Which word starts with a sun letter?', a: 'الدَّرْسُ', w: ['الْبَيْتُ', 'الْوَلَدُ'] },
            { q: 'How do you say الرَّجُلُ?', a: 'ar-rajul', w: ['al-rajul', 'ra-jul-al'] },
            { q: 'How do you say الْبَابُ?', a: 'al-bab', w: ['ab-bab', 'ba-bal'] },
          ],
        },
      ],
    },

    // ── 16. My family and me (pages 45–48, with the family words of pages 63–65) ──
    {
      title: 'My family and me', ar: 'عَائِلَتِي',
      pages: [
        {
          type: 'read', h: 'Family words',
          text: [
            'Arabic has two words for "uncle" and two for "aunt". عَمٌّ and عَمَّةٌ are your father\'s brother and sister. خَالٌ and خَالَةٌ are your mother\'s brother and sister.',
            { table: [
              ['Arabic', 'English'],
              ['أُسْرَةٌ / عَائِلَةٌ', 'family'],
              ['أَبٌ', 'father'],
              ['أُمٌّ', 'mother'],
              ['أَخٌ', 'brother'],
              ['أُخْتٌ', 'sister'],
              ['جَدٌّ', 'grandfather'],
              ['جَدَّةٌ', 'grandmother'],
              ['عَمٌّ', 'uncle (father\'s brother)'],
              ['عَمَّةٌ', 'aunt (father\'s sister)'],
              ['خَالٌ', 'uncle (mother\'s brother)'],
              ['خَالَةٌ', 'aunt (mother\'s sister)'],
            ] },
          ],
          check: 'Pages 63 to 65 (the family words, a story about a boy\'s family and a family exercise) have broken Arabic letters from the picture maker, for example ليتر and عاية أجمد, and some labels sit under the wrong person. They are not shown. The family words are typed here instead.',
        },
        {
          type: 'match', prompt: 'Match the family words.',
          pairs: [
            ['أَبٌ', 'father'],
            ['أُمٌّ', 'mother'],
            ['أَخٌ', 'brother'],
            ['أُخْتٌ', 'sister'],
            ['جَدٌّ', 'grandfather'],
            ['جَدَّةٌ', 'grandmother'],
            ['عَمٌّ', 'uncle (father\'s brother)'],
            ['خَالَةٌ', 'aunt (mother\'s sister)'],
          ],
        },
        scan(45, 'Read about Fatima and her family. Then fill in the table at the bottom: who has which job?'),
        {
          type: 'read', h: 'Fatima and her family',
          text: [
            { ar: 'اسْمِي فَاطِمَةُ. لَدَيَّ أَخَوَانِ وَأُخْتٌ صَغِيرَةٌ.' },
            { ar: 'اسْمُ أَبِي عَبْدُ اللهِ، وَاسْمُ أُمِّي أَمِينَةُ. أَبِي طَبِيبٌ، وَأُمِّي مُعَلِّمَةٌ.' },
            { ar: 'اسْمُ أَخِي الْكَبِيرِ مُحَمَّدٌ، وَاسْمُ أَخِي الصَّغِيرِ جَمَالٌ. أَخِي مُحَمَّدٌ مُهَنْدِسٌ.' },
            { ar: 'نَحْنُ نَعِيشُ فِي سَانْت جُونْز فِي بَيْتٍ كَبِيرٍ. أَنَا طَالِبَةٌ. أُحِبُّ عَائِلَتِي.' },
            { table: [
              ['Arabic', 'English'],
              ['لَدَيَّ', 'I have'],
              ['أَخَوَانِ', 'two brothers'],
              ['الْكَبِيرُ', 'the big (older) one'],
              ['الصَّغِيرُ', 'the little (younger) one'],
              ['نَعِيشُ', 'we live'],
              ['أُحِبُّ', 'I love'],
              ['طَبِيبٌ', 'doctor'],
              ['مُهَنْدِسٌ', 'engineer'],
            ] },
          ],
        },
        {
          type: 'quiz',
          items: [
            { q: 'What is Fatima\'s father\'s job?', a: 'طَبِيبٌ', w: ['مُهَنْدِسٌ', 'مُعَلِّمٌ'] },
            { q: 'What is her mother\'s name?', a: 'أَمِينَةُ', w: ['فَاطِمَةُ', 'جَمِيلَةُ'] },
            { q: 'Who is the engineer?', a: 'مُحَمَّدٌ', w: ['جَمَالٌ', 'عَبْدُ اللهِ'] },
            { q: 'How many brothers does Fatima have?', a: 'Two', w: ['One', 'Three'] },
            { q: 'What does أُحِبُّ عَائِلَتِي mean?', a: 'I love my family.', w: ['I am a student.', 'We live in a big house.'] },
          ],
        },
        scan(46, 'Two grown-ups tell us about themselves. Read the Arabic, then check it against the English beside it.', { check: 'The first person\'s name is hard to read in the Arabic (it looks like زُهَاء), while the English says Zuhair. The page is shown as printed.' }),
        scan(47, 'Read what Muhammad, a boy at Al-Noor School, says about himself.', { check: 'The page says أَنَا عَازِبٌ ("I am single"), which is odd for an 11-year-old, repeats one line, and ends with "مِنْطَقَةِ جَمَاعَةِ الْقَلْبِ". The typed version on the next page leaves these out.' }),
        {
          type: 'read', h: 'Who is Muhammad?',
          text: [
            { ar: 'اسْمِي مُحَمَّدٌ، أَنَا مِنْ بَنْغْلَادِيش. عُمُرِي أَحَدَ عَشَرَ عَامًا.' },
            { ar: 'أَنَا فِي الصَّفِّ السَّادِسِ فِي مَدْرَسَةِ النُّورِ. مَادَّتِي الْمُفَضَّلَةُ هِيَ الرِّيَاضِيَّاتُ.' },
            { ar: 'لَدَيَّ شَقِيقَانِ. اسْمُ أُخْتِي الصَّغِيرَةِ جَمِيلَةُ، وَاسْمُ أَخِي الْكَبِيرِ حَافِظٌ. كِلَاهُمَا طَالِبٌ.' },
            { ar: 'هِوَايَتِي تِنِسُ الطَّاوِلَةِ وَالسَّفَرُ. أُحِبُّ قَضَاءَ الْوَقْتِ مَعَ وَالِدَيَّ.' },
            { ar: 'أَنَا أَتَعَلَّمُ اللُّغَةَ الْعَرَبِيَّةَ. أَقْرَأُ الْكُتُبَ الْعَرَبِيَّةَ جَيِّدًا. أَسْكُنُ فِي مَدِينَةِ سَانْت جُونْز.' },
            { table: [
              ['Arabic', 'English'],
              ['عُمُرِي', 'my age'],
              ['الصَّفُّ السَّادِسُ', 'Year 6'],
              ['مَادَّتِي الْمُفَضَّلَةُ', 'my favourite subject'],
              ['الرِّيَاضِيَّاتُ', 'maths'],
              ['شَقِيقَانِ', 'a brother and a sister'],
              ['هِوَايَتِي', 'my hobby'],
              ['وَالِدَيَّ', 'my parents'],
              ['أَسْكُنُ', 'I live'],
            ] },
          ],
        },
        {
          type: 'quiz',
          items: [
            { q: 'Where is Muhammad from?', a: 'بَنْغْلَادِيش', w: ['نَيْجِيرِيَا', 'مِصْرُ'] },
            { q: 'How old is he?', a: '١١', w: ['١٢', '٦'] },
            { q: 'What is his favourite subject?', a: 'Maths', w: ['Science', 'Art'] },
            { q: 'What does he like doing?', a: 'Table tennis and travelling', w: ['Football and drawing', 'Swimming and cooking'] },
            { q: 'What is his big brother called?', a: 'حَافِظٌ', w: ['جَمَالٌ', 'يُوسُفُ'] },
          ],
        },
        scan(48, 'Now write about yourself on this page, the way Muhammad did.'),
        { type: 'write', prompt: 'Write about yourself in Arabic. Start with اسْمِي. Say where you are from and how old you are, then something you love.', lines: 6, hint: 'اسْمِي ... أَنَا مِنْ ... عُمُرِي ... أُحِبُّ ...' },
      ],
    },

    // ── 17. Near and far again (pages 49–50) ──
    {
      title: 'What is that?', ar: 'مَا ذَلِكَ؟',
      pages: [
        scan(49, 'هَذَا points to something near. ذَاكَ and ذَلِكَ point to something far away, like a star in the sky.'),
        {
          type: 'read', h: 'Far away',
          text: [
            'Use ذَلِكَ for a boy word that is far away, and تِلْكَ for a girl word that is far away. ذَاكَ means the same as ذَلِكَ.',
            { table: [
              ['Word', 'Use', 'Question', 'Example'],
              ['هَذَا', 'something near', 'مَا هَذَا؟', 'هَذَا كِتَابٌ.'],
              ['ذَاكَ', 'something far', 'مَا ذَاكَ؟', 'ذَاكَ نَجْمٌ.'],
              ['ذَلِكَ', 'something far', 'مَا ذَلِكَ؟', 'ذَلِكَ نَجْمٌ.'],
              ['تِلْكَ', 'a girl word, far', 'مَا تِلْكَ؟', 'تِلْكَ طَائِرَةٌ.'],
            ] },
          ],
        },
        scan(50, 'Answer each question with هَذَا, هَذِهِ, ذَلِكَ or تِلْكَ and a word from the box.', { check: 'The example is printed هذه سيارة وذلك طائرة. طَائِرَةٌ is a girl word, so the gap page teaches تِلْكَ طَائِرَةٌ.' }),
        {
          type: 'gap',
          items: [
            { t: 'مَا ذَلِكَ؟ ___ نَجْمٌ.', a: 'ذَلِكَ', w: ['تِلْكَ', 'هَذِهِ'] },
            { t: 'هَذِهِ سَيَّارَةٌ وَ___ طَائِرَةٌ.', a: 'تِلْكَ', w: ['ذَلِكَ', 'هَذَا'] },
            { t: 'هَذَا بَيْتٌ وَ___ مَسْجِدٌ.', a: 'ذَلِكَ', w: ['تِلْكَ', 'هَذِهِ'] },
            { t: 'هَذَا فَصْلٌ وَ___ مَكْتَبَةٌ.', a: 'تِلْكَ', w: ['ذَلِكَ', 'هَؤُلَاءِ'] },
          ],
        },
        {
          type: 'quiz',
          items: [
            { q: 'Your friend points at a car far down the road. What do you say?', a: 'تِلْكَ سَيَّارَةٌ', w: ['ذَلِكَ سَيَّارَةٌ', 'هَذَا سَيَّارَةٌ'] },
            { q: 'The book is in your hand. What do you say?', a: 'هَذَا كِتَابٌ', w: ['ذَلِكَ كِتَابٌ', 'هَذِهِ كِتَابٌ'] },
            { q: 'You can see a mosque on the hill. What do you say?', a: 'ذَلِكَ مَسْجِدٌ', w: ['تِلْكَ مَسْجِدٌ', 'هَذِهِ مَسْجِدٌ'] },
          ],
        },
      ],
    },

    // ── 18. Reading: Yusuf's farm (pages 51–52) ──
    {
      title: 'Reading: Yusuf\'s farm', ar: 'فَهْمُ الْمَقْرُوءِ',
      pages: [
        scan(51, 'Read Yusuf\'s story. The new words are in the box at the top.'),
        {
          type: 'read', h: 'Yusuf\'s farm',
          text: [
            { ar: 'اسْمِي يُوسُفُ. لَدَيَّ أَخَوَانِ: أَخِي الْكَبِيرُ اسْمُهُ مُحَمَّدٌ، وَأُخْتِي الصَّغِيرَةُ اسْمُهَا زَهْرَاءُ.' },
            { ar: 'لَدَى وَالِدِي مَزْرَعَةٌ فِي الْمَنْزِلِ. يُوجَدُ لَدَيْهِ الْعَدِيدُ مِنَ الْحَيَوَانَاتِ الْمَنْزِلِيَّةِ.' },
            { ar: 'فِي الْمَزْرَعَةِ، يُمْكِنُكَ أَنْ تَرَى خَرُوفًا، وَمَاعِزًا، وَسَمَكًا، وَبَقَرَةً، وَدَجَاجًا، وَحِصَانًا، وَحِمَارًا.' },
            { ar: 'أَنَا أُحِبُّ الْمَزْرَعَةَ.' },
            { table: [
              ['Arabic', 'English'],
              ['أَخِي', 'my brother'],
              ['أُخْتِي', 'my sister'],
              ['أَخَوَانِ', 'two brothers, or a brother and a sister'],
              ['مَزْرَعَةٌ', 'farm'],
              ['الْمَنْزِلُ', 'the home'],
              ['يُوجَدُ', 'there is'],
              ['الْعَدِيدُ', 'many'],
              ['يُمْكِنُكَ أَنْ تَرَى', 'you can see'],
              ['أُحِبُّ', 'I love'],
            ] },
          ],
        },
        scan(52, 'Answer the questions about Yusuf\'s story in whole sentences.'),
        {
          type: 'quiz',
          items: [
            { q: 'مَنْ هُوَ الْأَخُ الْكَبِيرُ لِيُوسُفَ؟', a: 'مُحَمَّدٌ', w: ['زَهْرَاءُ', 'يُوسُفُ'] },
            { q: 'مَنْ هِيَ الْأُخْتُ الصَّغِيرَةُ لِيُوسُفَ؟', a: 'زَهْرَاءُ', w: ['فَاطِمَةُ', 'مَرْيَمُ'] },
            { q: 'Where is the farm of Yusuf\'s father?', a: 'At home', w: ['At school', 'At the market'] },
            { q: 'Which animal is not on the farm?', a: 'أَسَدٌ', w: ['خَرُوفٌ', 'حِمَارٌ'] },
            { q: 'Yusuf points at the goat. مَا هَذَا؟', a: 'هَذَا مَاعِزٌ', w: ['هَذَا حِصَانٌ', 'هَذِهِ بَقَرَةٌ'] },
          ],
        },
      ],
    },

    // ── 19. "The" and "a", and describing words (pages 53–55) ──
    {
      title: 'The and a; describing words', ar: 'الْمَعْرِفَةُ وَالنَّكِرَةُ',
      pages: [
        scan(53, 'Write the English meaning next to each pair: الْكِتَابُ is "the book" and كِتَابٌ is "a book".', { check: 'The sentence under the gate is printed الْبَابُ الْمَزْرَعَةِ مَفْتُوحٌ; it is typed as بَابُ الْمَزْرَعَةِ مَفْتُوحٌ. The new words غَلْقٌ / مَغْلُوقٌ and فَتْحٌ are typed as أَغْلَقَ / مُغْلَقٌ and فَتَحَ.' }),
        {
          type: 'read', h: 'The and a',
          text: [
            'الـ at the start of a word means "the". The double mark at the end (tanween) means "a". A word has one or the other, never both.',
            { table: [
              ['the (مَعْرِفَةٌ)', 'a (نَكِرَةٌ)', 'English'],
              ['الْكِتَابُ', 'كِتَابٌ', 'book'],
              ['الْمَزْرَعَةُ', 'مَزْرَعَةٌ', 'farm'],
              ['الْخَرُوفُ', 'خَرُوفٌ', 'sheep'],
              ['الْمَاعِزُ', 'مَاعِزٌ', 'goat'],
              ['الْبَابُ', 'بَابٌ', 'door'],
            ] },
            'A doing word can also become a describing word. جَلَسَ الْوَلَدُ means "the boy sat down", and الْوَلَدُ جَالِسٌ means "the boy is sitting".',
            { table: [
              ['Did it', 'Is doing it', 'English'],
              ['وَقَفَ', 'وَاقِفٌ', 'stood / standing'],
              ['جَلَسَ', 'جَالِسٌ', 'sat / sitting'],
              ['فَتَحَ', 'مَفْتُوحٌ', 'opened / open'],
              ['أَغْلَقَ', 'مُغْلَقٌ', 'closed / closed'],
              ['ذَهَبَ', 'ذَاهِبٌ', 'went / going'],
              ['نَامَ', 'نَائِمٌ', 'slept / sleeping'],
            ] },
            { table: [
              ['Sentence', 'English'],
              ['الْوَلَدُ جَالِسٌ.', 'The boy is sitting.'],
              ['الْمُعَلِّمُ وَاقِفٌ.', 'The teacher is standing.'],
              ['الطَّالِبُ مَرِيضٌ.', 'The student is ill.'],
              ['الْكَلْبُ نَائِمٌ.', 'The dog is asleep.'],
              ['بَابُ الْمَزْرَعَةِ مَفْتُوحٌ.', 'The farm gate is open.'],
              ['الْكُرْسِيُّ مَكْسُورٌ.', 'The chair is broken.'],
            ] },
          ],
        },
        {
          type: 'sort', prompt: 'Does each word mean "the ..." or "a ..."?',
          groups: ['the (مَعْرِفَةٌ)', 'a (نَكِرَةٌ)'],
          items: [['الْكِتَابُ', 0], ['كِتَابٌ', 1], ['مَزْرَعَةٌ', 1], ['الْخَرُوفُ', 0], ['مَاعِزٌ', 1], ['الْبَابُ', 0], ['قَلَمٌ', 1], ['الشَّمْسُ', 0]],
        },
        scan(54, 'Fill each gap with a word from the box. Then write two sentences of your own with وَقَفَ / وَاقِفٌ and two with جَلَسَ / جَالِسٌ.'),
        {
          type: 'gap',
          items: [
            { t: 'الطَّالِبُ ___ عَلَى الْكُرْسِيِّ.', a: 'جَالِسٌ', w: ['نَائِمٌ', 'مَفْتُوحٌ'] },
            { t: 'الْمُعَلِّمُ ___ فِي الْفَصْلِ.', a: 'وَاقِفٌ', w: ['مُغْلَقٌ', 'مَفْتُوحٌ'] },
            { t: 'الْبَابُ ___ لِلدُّخُولِ.', a: 'مَفْتُوحٌ', w: ['جَالِسٌ', 'نَائِمٌ'] },
            { t: 'الشُّبَّاكُ ___ مِنَ الرِّيحِ.', a: 'مُغْلَقٌ', w: ['وَاقِفٌ', 'ذَاهِبٌ'] },
            { t: 'الطِّفْلُ ___ عَلَى السَّرِيرِ.', a: 'نَائِمٌ', w: ['مَفْتُوحٌ', 'مُغْلَقٌ'] },
          ],
        },
        {
          type: 'read', h: 'Describing words',
          text: [
            'Describing words come in pairs of opposites. For a girl word, add ة: كِتَابٌ جَدِيدٌ, but حَقِيبَةٌ جَدِيدَةٌ.',
            { table: [
              ['Arabic', 'English', 'Opposite', 'English'],
              ['جَدِيدٌ', 'new', 'قَدِيمٌ', 'old'],
              ['طَوِيلٌ', 'tall, long', 'قَصِيرٌ', 'short'],
              ['كَبِيرٌ', 'big', 'صَغِيرٌ', 'small'],
              ['ثَقِيلٌ', 'heavy', 'خَفِيفٌ', 'light'],
              ['قَرِيبٌ', 'near', 'بَعِيدٌ', 'far'],
            ] },
            'Two more words from the box: نَظِيفٌ means "clean" and جَمِيلٌ means "beautiful".',
          ],
        },
        {
          type: 'match', prompt: 'Match each word with its opposite.',
          pairs: [
            ['جَدِيدٌ', 'قَدِيمٌ'],
            ['طَوِيلٌ', 'قَصِيرٌ'],
            ['كَبِيرٌ', 'صَغِيرٌ'],
            ['ثَقِيلٌ', 'خَفِيفٌ'],
            ['قَرِيبٌ', 'بَعِيدٌ'],
          ],
        },
        {
          type: 'gap',
          items: [
            { t: 'الْحَجَرُ ___ وَالْوَرَقَةُ خَفِيفَةٌ.', a: 'ثَقِيلٌ', w: ['خَفِيفٌ', 'قَصِيرٌ'] },
            { t: 'الْحِمَارُ قَصِيرٌ وَالْحِصَانُ ___.', a: 'طَوِيلٌ', w: ['قَصِيرٌ', 'ثَقِيلَةٌ'] },
            { t: 'الْمَنْزِلُ قَرِيبٌ وَالْمَسْجِدُ ___.', a: 'بَعِيدٌ', w: ['قَرِيبٌ', 'جَدِيدَةٌ'] },
            { t: 'زَيْدٌ كَبِيرٌ وَأَخُوهُ جَمَالٌ ___.', a: 'صَغِيرٌ', w: ['كَبِيرٌ', 'صَغِيرَةٌ'] },
          ],
        },
        scan(55, 'Read the words in the first box with the right ending. Fill each gap with a describing word. Then match each word in list أ with a word in list ب.'),
        {
          type: 'match', prompt: 'Match each sentence with its meaning.',
          pairs: [
            ['الْمَاءُ حَارٌّ.', 'The water is hot.'],
            ['التُّفَّاحَةُ لَذِيذَةٌ.', 'The apple is tasty.'],
            ['الِامْتِحَانُ صَعْبٌ.', 'The exam is hard.'],
            ['الدَّرْسُ مُمِلٌّ.', 'The lesson is boring.'],
            ['الْقَلَمُ مَكْسُورٌ.', 'The pen is broken.'],
            ['الدُّكَّانُ مَفْتُوحٌ.', 'The shop is open.'],
          ],
        },
      ],
    },

    // ── 20. Belonging and little place words (pages 56–58) ──
    {
      title: 'Belonging and place words', ar: 'الْجَرُّ وَالْمُضَافُ',
      pages: [
        scan(56, 'This page explains two things: how one noun can belong to another, and the small words like فِي and عَلَى.', { check: 'The Arabic explanation calls the second noun الْمُضَاف; it is usually called الْمُضَافُ إِلَيْهِ. The example الْبَيْتُ عَلِيٍّ is typed as بَيْتُ عَلِيٍّ (no الـ on the first word).' }),
        {
          type: 'read', h: 'Whose is it?',
          text: [
            'Put two nouns side by side to show that something belongs to someone. كِتَابُ مُحَمَّدٍ means "Muhammad\'s book".',
            'The first word loses its الـ and its tanween. The second word ends with a kasra. Some names, like أَحْمَدُ and فَاطِمَةُ, take a fatha instead.',
            { table: [
              ['Arabic', 'English'],
              ['كِتَابُ مُحَمَّدٍ', 'Muhammad\'s book'],
              ['سَيَّارَةُ أَحْمَدَ', 'Ahmad\'s car'],
              ['بَيْتُ عَلِيٍّ', 'Ali\'s house'],
              ['كِتَابُ فَاطِمَةَ', 'Fatima\'s book'],
              ['سَاعَةُ يَاسِرٍ', 'Yasir\'s watch'],
            ] },
          ],
        },
        {
          type: 'read', h: 'Little place words',
          text: [
            'After these little words, the noun ends with a kasra: الْبَيْتُ becomes فِي الْبَيْتِ.',
            { table: [
              ['Word', 'English', 'Example'],
              ['فِي', 'in', 'الْكِتَابُ فِي الْحَقِيبَةِ.'],
              ['عَلَى', 'on', 'الْكِتَابُ عَلَى الطَّاوِلَةِ.'],
              ['عِنْدَ', 'at, by', 'أَنَا عِنْدَ الْبَابِ.'],
              ['إِلَى', 'to', 'أَنَا ذَاهِبٌ إِلَى الْمَدْرَسَةِ.'],
              ['مَعَ', 'with', 'أَنَا مَعَ أَصْدِقَائِي.'],
              ['مِنْ', 'from', 'أَنَا مِنَ الْمَدِينَةِ.'],
            ] },
          ],
        },
        scan(57, 'Read the table, then ask and answer the أَيْنَ questions with a partner.'),
        {
          type: 'quiz',
          items: [
            { q: 'أَيْنَ السَّاعَةُ؟', a: 'هِيَ عَلَى الْجِدَارِ.', w: ['هُوَ عَلَى الْجِدَارِ.', 'هِيَ عَلَى الْجِدَارُ.'] },
            { q: 'أَيْنَ الْقِطُّ؟', a: 'هُوَ عِنْدَ الْبَابِ.', w: ['هِيَ عِنْدَ الْبَابِ.', 'هُوَ عِنْدَ الْبَابُ.'] },
            { q: 'أَيْنَ الْحَقِيبَةُ؟', a: 'هِيَ عَلَى الْمَكْتَبِ.', w: ['هُوَ عَلَى الْمَكْتَبِ.', 'هِيَ عَلَى مَكْتَبٌ.'] },
            { q: 'أَيْنَ خَدِيجَةُ؟', a: 'هِيَ فِي الْمَطْبَخِ.', w: ['هُوَ فِي الْمَطْبَخِ.', 'هِيَ فِي الْمَطْبَخُ.'] },
          ],
        },
        scan(58, 'Look at each picture and make a sentence with فِي, عَلَى or عِنْدَ. For example: الْقِطُّ فِي الصُّنْدُوقِ.'),
        {
          type: 'gap',
          items: [
            { t: 'الْكِتَابُ ___ الطَّاوِلَةِ.', a: 'عَلَى', w: ['إِلَى', 'مِنْ'] },
            { t: 'عَمَّارٌ ___ حَامِدٍ.', a: 'مَعَ', w: ['فِي', 'عَلَى'] },
            { t: 'أَنَا ___ الْبَيْتِ.', a: 'فِي', w: ['إِلَى', 'مَعَ'] },
            { t: 'ذَهَبَ مُحَمَّدٌ ___ الْمَدْرَسَةِ.', a: 'إِلَى', w: ['عَلَى', 'مَعَ'] },
            { t: 'السَّاعَةُ ___ الْجِدَارِ.', a: 'عَلَى', w: ['مِنْ', 'مَعَ'] },
            { t: 'أَيْنَ خَدِيجَةُ؟ هِيَ ___ الْبَابِ.', a: 'عِنْدَ', w: ['إِلَى', 'مِنْ'] },
          ],
        },
      ],
    },

    // ── 21. A conversation in class (pages 59–60) ──
    {
      title: 'A conversation in class', ar: 'مُحَادَثَةٌ فِي الْفَصْلِ',
      pages: [
        scan(59, 'Read this conversation between the teacher and the students. Take turns, each reading one part.'),
        {
          type: 'read', h: 'New words',
          text: [
            { table: [
              ['Arabic', 'English'],
              ['مَا اسْمُكَ؟', 'What is your name?'],
              ['مِنْ أَيْنَ أَنْتَ؟', 'Where are you from?'],
              ['مَنْ هَذَانِ؟', 'Who are these two?'],
              ['هَيَّا نُرَحِّبُ بِـ', 'Let us welcome'],
              ['خَرَجَتْ', 'she went out'],
              ['الْمُدِيرُ', 'the head teacher'],
              ['الْمِرْحَاضُ', 'the toilet'],
            ] },
          ],
        },
        scan(60, 'Answer the questions about the conversation.'),
        {
          type: 'quiz',
          items: [
            { q: 'مِنْ أَيْنَ مُحَمَّدٌ؟', a: 'مِنْ نَيْجِيرِيَا', w: ['مِنَ الْهِنْدِ', 'مِنَ السُّعُودِيَّةِ'] },
            { q: 'مِنْ أَيْنَ عَمَّارٌ؟', a: 'مِنَ السُّعُودِيَّةِ', w: ['مِنْ نَيْجِيرِيَا', 'مِنَ الْهِنْدِ'] },
            { q: 'مِنْ أَيْنَ حَامِدٌ؟', a: 'مِنَ الْهِنْدِ', w: ['مِنَ السُّعُودِيَّةِ', 'مِنْ مِصْرَ'] },
            { q: 'أَيْنَ ذَهَبَتْ خَدِيجَةُ؟', a: 'إِلَى الْمُدِيرِ', w: ['إِلَى الْبَيْتِ', 'إِلَى الْمَسْجِدِ'] },
            { q: 'Who told the teacher where Khadijah went?', a: 'أَمَةُ اللهِ', w: ['آدَمُ', 'عَمَّارٌ'] },
            { q: 'أَيْنَ أَمْجَدُ؟', a: 'ذَهَبَ إِلَى الْمِرْحَاضِ', w: ['ذَهَبَ إِلَى الْمُدِيرِ', 'هُوَ مِنَ الْهِنْدِ'] },
            { q: 'How many new students does the teacher welcome?', a: '٣', w: ['٢', '٥'] },
          ],
        },
      ],
    },

    // ── 22. Hanifa's story (pages 61–62) ──
    {
      title: 'Hanifa\'s story', ar: 'قِصَّةُ حَنِيفَةَ',
      pages: [
        scan(61, 'First fill the gaps at the top with the right little word: فِي, عَلَى, إِلَى, مَعَ or عِنْدَ. Then read Hanifa\'s story.'),
        {
          type: 'read', h: 'Words from the story',
          text: [
            'Hanifa is getting ready for weekend school. She looks for each of her things in a different place.',
            { table: [
              ['Arabic', 'English'],
              ['تَسْتَيْقِظُ مُبَكِّرًا', 'she wakes up early'],
              ['تَسْتَعِدُّ', 'she gets ready'],
              ['أَدَوَاتُهَا الدِّرَاسِيَّةُ', 'her school things'],
              ['خِزَانَةٌ', 'cupboard'],
              ['الدُّرْجُ', 'the drawer'],
              ['الْمُصْحَفُ', 'the copy of the Qur\'an'],
              ['الرَّفُّ', 'the shelf'],
              ['ارْتَدَتْ', 'she put on'],
              ['حِجَابٌ', 'hijab'],
              ['مُسْتَعِدَّةٌ', 'ready'],
            ] },
          ],
        },
        {
          type: 'order', prompt: 'Put Hanifa\'s morning in order.',
          items: [
            'She took the book from the table.',
            'She found the mushaf in the drawer.',
            'She found the notebook on the shelf.',
            'She took a pen from the kitchen table.',
            'She put on her hijab.',
            'She left the house for school.',
          ],
        },
        scan(62, 'Answer the questions about Hanifa.', { check: 'Two questions say خَزَانَتِكَ and حَقِيبَتِكَ ("your") where the story means Hanifa\'s (خِزَانَتِهَا, حَقِيبَتِهَا).' }),
        {
          type: 'quiz',
          items: [
            { q: 'أَيْنَ كَانَ الْكِتَابُ؟', a: 'عَلَى الطَّاوِلَةِ', w: ['فِي الدُّرْجِ', 'عَلَى الرَّفِّ'] },
            { q: 'أَيْنَ وَجَدَتْ حَنِيفَةُ الْمُصْحَفَ؟', a: 'فِي الدُّرْجِ', w: ['فِي الْمَطْبَخِ', 'عَلَى الطَّاوِلَةِ'] },
            { q: 'أَيْنَ وَجَدَتِ الدَّفْتَرَ؟', a: 'عَلَى الرَّفِّ', w: ['فِي الْحَقِيبَةِ', 'فِي الدُّرْجِ'] },
            { q: 'مِنْ أَيْنَ أَخَذَتِ الْقَلَمَ؟', a: 'مِنَ الْمَطْبَخِ', w: ['مِنَ الْمَدْرَسَةِ', 'مِنْ غُرْفَتِهَا'] },
            { q: 'مَاذَا ارْتَدَتْ حَنِيفَةُ؟', a: 'حِجَابَهَا', w: ['حَقِيبَتَهَا', 'قَلَمَهَا'] },
            { q: 'Why was Hanifa happy at the end?', a: 'She had found everything she needed.', w: ['School was closed.', 'She got a new bag.'] },
          ],
        },
      ],
    },

    // ── 23. Food and drink (from pages 66–68) ──
    {
      title: 'Food and drink', ar: 'الطَّعَامُ وَالشَّرَابُ',
      pages: [
        {
          type: 'read', h: 'Food words',
          text: [
            'Some food words are about "some" of a thing, not one. مَوْزٌ means bananas in general, and one banana is مَوْزَةٌ.',
            { table: [
              ['Arabic', 'English'],
              ['خُبْزٌ', 'bread'],
              ['أَرُزٌّ', 'rice'],
              ['لَحْمٌ', 'meat'],
              ['سَمَكٌ', 'fish'],
              ['بَيْضٌ', 'eggs'],
              ['جُبْنٌ', 'cheese'],
              ['تُفَّاحٌ', 'apples'],
              ['مَوْزٌ', 'bananas'],
              ['طَمَاطِمُ', 'tomatoes'],
              ['حَلِيبٌ', 'milk'],
              ['مَاءٌ', 'water'],
            ] },
          ],
          check: 'Pages 66 to 68 (Food and Drink, In the kitchen, and the food exercise) were made with a picture maker that broke the Arabic letters, for example جبنز under the bread and موز under the milk. They are not shown. The food words are typed here.',
        },
        {
          type: 'match', prompt: 'Match the food and drink.',
          pairs: [
            ['خُبْزٌ', 'bread'],
            ['أَرُزٌّ', 'rice'],
            ['لَحْمٌ', 'meat'],
            ['سَمَكٌ', 'fish'],
            ['حَلِيبٌ', 'milk'],
            ['مَاءٌ', 'water'],
            ['بَيْضٌ', 'eggs'],
            ['مَوْزٌ', 'bananas'],
          ],
        },
        {
          type: 'read', h: 'In the kitchen',
          text: [
            { ar: 'أُمِّي تَطْبُخُ الطَّعَامَ كُلَّ يَوْمٍ.' },
            { ar: 'الْيَوْمَ طَبَخَتْ أَرُزًّا، وَنَحْنُ نُحِبُّ الْأَرُزَّ.' },
            { ar: 'أُخْتِي تُحِبُّ الْفَوَاكِهَ. هِيَ تَأْكُلُ التُّفَّاحَ وَالْمَوْزَ كُلَّ يَوْمٍ.' },
            { ar: 'نَشْرَبُ الْحَلِيبَ فِي الصَّبَاحِ.' },
            'Mum cooks every day. Today she made rice, which the whole family loves. The sister eats apples and bananas every day, and everyone drinks milk in the morning.',
          ],
          check: 'This short kitchen story is retold from page 67, whose letters are broken. Please check that it matches what the teacher meant the page to say.',
        },
        {
          type: 'quiz',
          items: [
            { q: 'مَاذَا طَبَخَتِ الْأُمُّ الْيَوْمَ؟', a: 'أَرُزًّا', w: ['سَمَكًا', 'بَيْضًا'] },
            { q: 'مَاذَا تَأْكُلُ الْأُخْتُ كُلَّ يَوْمٍ؟', a: 'التُّفَّاحَ وَالْمَوْزَ', w: ['الْخُبْزَ وَالْجُبْنَ', 'اللَّحْمَ'] },
            { q: 'Which one is a drink?', a: 'حَلِيبٌ', w: ['خُبْزٌ', 'أَرُزٌّ'] },
            { q: 'What does نَشْرَبُ mean?', a: 'we drink', w: ['we cook', 'we love'] },
          ],
        },
        { type: 'write', prompt: 'Write two sentences in Arabic about food you like. Start each one with أُحِبُّ.', lines: 2, hint: 'أُحِبُّ الْخُبْزَ. أُحِبُّ ...' },
      ],
    },
  ],
};
