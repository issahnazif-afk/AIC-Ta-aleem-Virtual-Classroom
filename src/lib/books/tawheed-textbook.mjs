// Tawheed: Islamic Monotheism, Volume One (Level 4, ages 10–14).
// The school's Canva textbook as an interactive book: six units of lessons, each with its objectives, the words to
// know, the teaching, the ayat and hadith, the textbook's activities and a reflection, and a test after each unit.
// The PDF's pages 103 to 120 repeat the Unit Five and Unit Six pages, and it has no closing page, so the closing
// message here is written from the book's opening letter.
const IMG = (n) => `books/tawheed-textbook/${String(n).padStart(3, '0')}.webp`;
// a true-or-false question
const tf = (q, yes, why) => ({ q, a: yes ? 'True' : 'False', w: [yes ? 'False' : 'True'], why });

// ── Introduction ──
const letter = {
  title: 'A letter to the student',
  pages: [
    {
      type: 'read', h: 'Dear student', img: IMG(4), cap: 'The letter at the start of the textbook.',
      text: [
        'Welcome to this book about Tawheed. It is the most important knowledge in Islam, because everything else in our religion is built on it.',
        'Tawheed means believing that Allah is One. He has no partner and no equal. No one shares in His power, His knowledge or His creation. He is perfect, and He is unlike anything we can imagine.',
        'When you understand Tawheed, your heart grows stronger. You know who your Lord is. You know you can turn to Him at any moment. That knowledge changes the way you see the world and the way you live each day.',
        'You start to worship Him sincerely. You obey Him gladly. You trust Him with whatever happens.',
        'This book was written for you, so that you can learn, think, and grow closer to Allah.',
      ],
    },
    {
      type: 'read', h: 'What is in this book',
      text: [
        'The book has six units. Each unit has four lessons and ends with a test.',
        { table: [
          ['Unit', 'What it is about'],
          ['1', 'What Tawheed is, why we were created, and its three categories'],
          ['2', 'Tawheed ar-Rububiyyah: Allah as the only Lord'],
          ['3', 'Tawheed al-Uluhiyyah: worshipping Allah alone'],
          ['4', 'Tawheed al-Asma was-Sifat: the Names and Attributes of Allah'],
          ['5', 'How Tawheed changes our character'],
          ['6', 'Tawheed in daily life, in every moment'],
        ] },
        'In every lesson you will find explanations, examples from real life, stories from Islamic history, and ayat of the Qur\'an and hadith with their meanings. There are activities to do and questions to think about.',
        { note: { h: 'A du\'a from the writers', t: 'O Allah, make this knowledge of benefit to us. Help us to understand it, remember it and act on it. Make us among those who worship You alone and follow Your guidance. Ameen.' } },
      ],
    },
    {
      type: 'write', h: 'Before you begin', lines: 5,
      prompt: 'What do you already know about Tawheed? Write two or three sentences. Then write one question you hope this book will answer.',
    },
  ],
};

// ── Unit One: Introduction to Tawheed and its importance ──
const u1l1 = {
  title: '1.1 What is Tawheed?', ar: 'مَا هُوَ ٱلتَّوْحِيدُ؟',
  pages: [
    {
      type: 'read', h: 'Unit One: introduction to Tawheed', img: IMG(5),
      text: [
        'This unit is about the most important knowledge in Islam. You will learn what Tawheed means and why it is the foundation of the religion.',
        'You will see how the scholars explain Tawheed in three categories. Then you will learn about the blessings that come from living by it.',
        { list: ['Lesson 1: What is Tawheed?', 'Lesson 2: Why were we created?', 'Lesson 3: The three categories of Tawheed', 'Lesson 4: The blessings and fruits of Tawheed', 'Unit One test'] },
      ],
    },
    {
      type: 'read', h: 'Lesson objectives', img: IMG(6),
      text: [
        'By the end of this lesson you will be able to:',
        { list: ['define Tawheed correctly', 'explain the Arabic root of the word Tawheed', 'explain La ilaha illallah in your own words'] },
      ],
    },
    {
      type: 'read', h: 'Words to know',
      text: [
        { table: [
          ['Word', 'Arabic', 'Meaning'],
          ['Tawheed', 'تَوْحِيد', 'Singling out Allah alone in His Lordship, in worship, and in His Names and Attributes'],
          ['Wahhada', 'وَحَّدَ', 'To make something one'],
          ['Ilah', 'إِلَٰه', 'A god: anything that is worshipped'],
          ['Allah', 'ٱللَّه', 'The one true God, who alone deserves worship'],
          ['Ibadah', 'عِبَادَة', 'Worship: everything Allah loves and is pleased with'],
          ['Shirk', 'شِرْك', 'Giving Allah a partner in what belongs only to Him'],
        ] },
      ],
    },
    {
      type: 'read', h: 'The meaning of Tawheed',
      text: [
        'The word Tawheed comes from the Arabic verb wahhada, which means "to make one". To do tawheed of something is to single it out, so that nothing else shares with it.',
        'In Islam, Tawheed means believing that Allah is the One and only God. All worship belongs to Him. We love Him, obey Him and rely on Him above everything else.',
        { note: { h: 'In one sentence', t: 'Tawheed is to single out Allah alone in His Lordship, in worship, and in His Names and Attributes.' } },
        'The opposite of Tawheed is shirk. Shirk is giving someone or something a share in what belongs only to Allah, such as praying to an idol.',
      ],
      words: [{ w: 'single', m: 'pick out one thing on its own, so that nothing else shares with it' }, { w: 'shirk', m: 'giving Allah a partner in what belongs only to Him' }],
    },
    { type: 'ayah', s: 112, a: 1, en: 'Say: He is Allah, the One.' },
    { type: 'ayah', s: 21, a: 25, en: 'And We did not send any messenger before you except that We revealed to him: there is no god but Me, so worship Me.' },
    {
      type: 'read', h: 'The statement of Tawheed',
      text: [
        { ar: 'لَا إِلَٰهَ إِلَّا ٱللَّهُ' },
        'La ilaha illallah means: there is no god worthy of worship except Allah. It has two parts.',
        { table: [
          ['Part', 'Words', 'What it does'],
          ['Negation (an-nafy)', 'La ilaha', 'Denies every false thing that people worship'],
          ['Affirmation (al-ithbat)', 'illa Allah', 'Affirms that Allah alone deserves worship'],
        ] },
        'Both parts are needed. Someone who says that Allah is God but also prays to idols has not said "la ilaha". Someone who rejects idols but does not worship Allah has not said "illa Allah".',
      ],
      words: [{ w: 'negation', m: 'saying "no" to something' }, { w: 'affirmation', m: 'saying "yes, this is true"' }],
    },
    {
      type: 'read', h: 'Ibrahim searches for the truth',
      text: [
        'The Qur\'an tells us that the people of Prophet Ibrahim worshipped idols, and so did his father. Ibrahim did not follow them because everyone else did.',
        'Surah al-An\'am (6:74 to 79) describes how he looked at a star, then the moon, then the sun. Each one rose and then set. A thing that disappears cannot be the Lord of the worlds.',
        'So Ibrahim turned away from everything his people worshipped. He turned to the One who created the heavens and the earth.',
      ],
    },
    { type: 'ayah', s: 6, a: 79, en: 'Indeed, I have turned my face to the One who created the heavens and the earth, inclining to the truth, and I am not one of those who associate partners with Allah.' },
    {
      type: 'gap', h: 'Activity 1: fill in the blanks',
      items: [
        { t: 'The Arabic root of the word Tawheed is ___.', a: 'wahhada', w: ['ibadah', 'ilah'] },
        { t: 'Tawheed is explained in ___ categories.', a: 'three', w: ['two', 'five'] },
        { t: '"La ilaha", which denies every false god, is the ___ part of the statement.', a: 'negation', w: ['affirmation', 'worship'] },
        { t: '"Illa Allah", which says that Allah alone deserves worship, is the ___ part.', a: 'affirmation', w: ['negation', 'shirk'] },
        { t: 'Giving Allah a partner in worship is called ___.', a: 'shirk', w: ['ibadah', 'tawheed'] },
      ],
    },
    {
      type: 'quiz', h: 'Activity 2: true or false',
      items: [
        tf('Tawheed means believing in many gods.', false, 'Tawheed means believing that Allah is One. Believing in many gods is the opposite of Tawheed.'),
        tf('All the prophets came to teach Tawheed.', true, 'Allah tells us in Surah al-Anbiya 21:25 that every messenger was told: there is no god but Me, so worship Me.'),
        tf('Ibadah (worship) is part of Tawheed.', true, 'Worshipping Allah alone is one of the three categories of Tawheed: Tawheed al-Uluhiyyah.'),
        tf('Shirk means giving Allah a partner in what belongs only to Him.', true, 'Shirk is the opposite of Tawheed. It is the greatest sin.'),
        tf('Ibrahim followed the idols of his people without thinking.', false, 'Ibrahim looked for the truth. He saw that the star, the moon and the sun all set, so he turned to the One who created them.'),
      ],
    },
    {
      type: 'match', h: 'Match each word with its meaning',
      pairs: [['Tawheed', 'Singling out Allah alone'], ['Ilah', 'Anything that is worshipped'], ['Ibadah', 'Worship'], ['Shirk', 'Giving Allah a partner'], ['Wahhada', 'To make one']],
    },
    {
      type: 'write', h: 'Activity 3: reflect and write', lines: 6,
      prompt: 'In three or four sentences, write what you learn from the story of Ibrahim about finding the truth.',
      hint: 'Think about what his people did, what he looked at, and where he turned in the end.',
    },
  ],
};

const u1l2 = {
  title: '1.2 Why were we created?',
  pages: [
    {
      type: 'read', h: 'Lesson objectives', img: IMG(9),
      text: [
        'By the end of this lesson you will be able to:',
        { list: ['answer the question of why Allah created us', 'understand Surah adh-Dhariyat 51:56', 'connect Tawheed to the purpose of life'] },
      ],
    },
    { type: 'ayah', s: 51, a: 56, en: 'And I did not create the jinn and mankind except to worship Me.' },
    {
      type: 'read', h: 'The greatest question',
      text: [
        'Things that are made have a purpose. A pencil is made for writing. A key is made to open a lock. So what about us? Why did Allah create us?',
        'Allah gives the answer in the Qur\'an. He created jinn and human beings to worship Him. That is the greatest purpose of our lives.',
        'Worship is much wider than prayer. It covers everything we do to please Allah, done with love and obedience, for Him alone.',
        { table: [
          ['The words of the ayah', 'What they teach us'],
          ['"I did not create"', 'Allah does not depend on us. He needs nothing. He created us with wisdom and for a purpose.'],
          ['"the jinn and mankind"', 'This means every being that can choose and understand. We were all created for the same purpose.'],
          ['"except to worship Me"', 'Worship means loving Allah, obeying Him, remembering Him and doing everything for His pleasure.'],
        ] },
      ],
    },
    {
      type: 'read', h: 'What does this have to do with Tawheed?',
      text: [
        { list: ['We were created to worship Allah.', 'Worship must be sincere, for Allah alone.', 'This sincerity is Tawheed.'], numbered: true },
        'So the purpose of our life and Tawheed are joined together. We live to worship Allah, and Tawheed means worshipping Him alone.',
        { note: { h: 'Allah does not need us', t: 'Allah does not need our worship. We are the ones who need Him. When we worship Him, the good of it comes back to us.' } },
      ],
    },
    {
      type: 'hadith', kicker: 'The Prophet ﷺ said to Mu\'adh ibn Jabal:',
      ar: 'حَقُّ اللَّهِ عَلَى عِبَادِهِ أَنْ يَعْبُدُوهُ وَلَا يُشْرِكُوا بِهِ شَيْئًا، وَحَقُّ الْعِبَادِ عَلَى اللَّهِ أَنْ لَا يُعَذِّبَ مَنْ لَا يُشْرِكُ بِهِ شَيْئًا',
      en: 'The right of Allah over His servants is that they worship Him and do not associate anything with Him. The right of the servants over Allah is that He does not punish anyone who does not associate anything with Him.',
      src: 'Sahih al-Bukhari 2856 and Sahih Muslim 30',
    },
    {
      type: 'read', h: 'Salman al-Farisi: the man who searched for the truth',
      check: 'Salman\'s story is summarised from his own account in Musnad Ahmad 23737 (graded hasan). The textbook\'s line that "his heart found peace when he heard the Qur\'an" is not in that account, so it is left out.',
      text: [
        'Salman grew up in Persia, in a family that worshipped fire. His father loved him so much that he kept him at home to tend the fire, so that it never went out.',
        'One day Salman passed a church and saw Christians at prayer. He liked their worship more than the fire worship of his people. He left home and went to Syria to learn their religion.',
        'He served one monk after another. As each one was dying, Salman asked whom he should follow next. The last monk told him that a prophet would soon appear in Arabia with the religion of Ibrahim. He would move to a land of palm trees.',
        'On the way to Arabia, Salman was betrayed and sold as a slave. He was taken to Madinah, a land of palm trees. When the Prophet ﷺ arrived there, Salman went to him and saw the signs the monk had described. He accepted Islam.',
        { note: { h: 'Think about it', t: 'Salman left his home and his comfort because he wanted the truth more than anything. He did not follow his people blindly.' } },
      ],
    },
    {
      type: 'order', h: 'Put Salman\'s story in order',
      items: ['He grows up in a fire-worshipping family in Persia', 'He sees Christians praying and leaves home', 'He serves one monk after another', 'The last monk tells him about a prophet in Arabia', 'He is sold as a slave and taken to Madinah', 'He meets the Prophet ﷺ and accepts Islam'],
    },
    {
      type: 'quiz',
      items: [
        { q: 'Why did Allah create jinn and human beings?', a: 'To worship Him', w: ['To earn wealth', 'Because He needed them', 'To build great cities'], why: 'Allah says in Surah adh-Dhariyat 51:56 that He created jinn and mankind only to worship Him.' },
        { q: 'Which sentence about Allah is true?', a: 'He does not need anything from us', w: ['He needs our worship', 'He created us without a purpose'], why: 'Allah needs nothing. We need Him, and the good of our worship comes back to us.' },
        { q: 'How can schoolwork become worship?', a: 'By doing it well with the intention of pleasing Allah', w: ['By doing it so people praise us', 'Schoolwork can never be worship'], why: 'Worship covers everything we do to please Allah. A good intention turns ordinary work into worship.' },
        { q: 'What is "the right of Allah over His servants"?', a: 'That they worship Him and do not associate anything with Him', w: ['That they become rich', 'That they never make a mistake'], why: 'The Prophet ﷺ told Mu\'adh ibn Jabal this, in a hadith reported by al-Bukhari and Muslim.' },
      ],
    },
    {
      type: 'write', h: 'Reflect and think', lines: 7,
      prompt: 'What is the main reason we were created? How can your schoolwork and daily activities become acts of worship? How does believing in Tawheed change the way you live each day?',
    },
  ],
};

const u1l3 = {
  title: '1.3 The three categories of Tawheed',
  pages: [
    {
      type: 'read', h: 'Lesson objectives', img: IMG(11),
      text: [
        'Allah is One. He alone is our Lord. He alone deserves worship. He alone has perfect Names and Attributes. To help us understand our belief clearly, the scholars of Ahl as-Sunnah explain Tawheed in three categories.',
        'By the end of this lesson you will be able to:',
        { list: ['name the three categories of Tawheed', 'define each category', 'give an example of each from daily life', 'understand how the three categories work together'] },
      ],
    },
    {
      type: 'read', h: 'Words to know',
      text: [
        { table: [
          ['Word', 'Arabic', 'Meaning'],
          ['Rabb', 'رَبّ', 'Lord: the One who creates, owns, provides and controls'],
          ['Tawheed ar-Rububiyyah', 'تَوْحِيدُ ٱلرُّبُوبِيَّة', 'Oneness of Allah in His Lordship'],
          ['Tawheed al-Uluhiyyah', 'تَوْحِيدُ ٱلْأُلُوهِيَّة', 'Oneness of Allah in worship'],
          ['Tawheed al-Asma was-Sifat', 'تَوْحِيدُ ٱلْأَسْمَاءِ وَٱلصِّفَات', 'Oneness of Allah in His Names and Attributes'],
        ] },
      ],
    },
    {
      type: 'read', h: '1. Tawheed ar-Rububiyyah: Lordship',
      text: [
        'This is believing that Allah alone is the Creator and Owner of everything. He provides for all of creation. He controls and runs every affair.',
        { note: { h: 'Example', t: 'When it rains, we know that Allah sent the rain. When plants grow, we know that Allah gave them life and made them grow.' } },
      ],
    },
    { type: 'ayah', s: 1, a: 2, en: 'All praise is for Allah, Lord of the worlds.' },
    {
      type: 'read', h: '2. Tawheed al-Uluhiyyah: worship',
      text: [
        'This is believing that Allah alone deserves every act of worship, and then worshipping Him alone.',
        { note: { h: 'Example', t: 'We pray only to Allah. We make du\'a only to Him. We put our hope and our trust in Him alone.' } },
      ],
    },
    { type: 'ayah', s: 1, a: 5, en: 'You alone we worship, and You alone we ask for help.' },
    {
      type: 'read', h: '3. Tawheed al-Asma was-Sifat: Names and Attributes',
      text: [
        'This is believing in Allah\'s perfect Names and Attributes as they come in the Qur\'an and the Sunnah. We do not deny them or change their meaning. We do not say they are like the qualities of anything He created.',
        { note: { h: 'Example', t: 'We believe Allah is Al-\'Alim, the All-Knowing, and As-Sami\', the All-Hearing. Each of these is perfect, in a way that belongs to Him alone.' } },
        { table: [
          ['Category', 'Focus', 'What we believe', 'Everyday example'],
          ['Ar-Rububiyyah', 'Lordship', 'Allah alone is the Lord and Sustainer of everything.', 'Rain falls and crops grow by Allah\'s will.'],
          ['Al-Uluhiyyah', 'Worship', 'Allah alone deserves every act of worship.', 'We pray to Allah and trust only in Him.'],
          ['Al-Asma was-Sifat', 'Names and Attributes', 'Allah\'s Names and Attributes are perfect and belong to Him alone.', 'We believe Allah hears every du\'a.'],
        ] },
      ],
    },
    {
      type: 'read', h: 'A lesson from the time of the Prophet ﷺ',
      text: [
        'Many Arabs in Makkah in the time of the Prophet ﷺ believed that Allah created everything. The Qur\'an tells us what they would answer if they were asked.',
      ],
    },
    { type: 'ayah', s: 31, a: 25, w: [1, 8], en: 'And if you ask them who created the heavens and the earth, they will surely say: Allah.' },
    {
      type: 'read', h: 'Why that was not enough',
      text: [
        'They believed that Allah was the Creator and the Provider. Yet they still worshipped idols. They called on them, asked them for help and offered sacrifices to them.',
        'So believing in Allah\'s Lordship on its own did not make them Muslims. Tawheed is complete when a person believes in Allah as Lord, worships Him alone, and affirms His perfect Names and Attributes.',
        { note: { h: 'The three go together', t: 'Allah created me and provides for me: that is Lordship. So I pray and make du\'a only to Him: that is worship. I call on Him as Ar-Rahman, the Most Merciful: that is His Names and Attributes.' } },
      ],
    },
    {
      type: 'sort', h: 'Activity: which category?', prompt: 'Put each sentence in the basket of the category it belongs to.',
      groups: ['Lordship (Rububiyyah)', 'Worship (Uluhiyyah)', 'Names and Attributes'],
      items: [
        ['Allah created the heavens and the earth.', 0], ['I pray only to Allah.', 1], ['Allah is the All-Knowing.', 2], ['I ask Allah for help.', 1],
        ['Allah provides food and water.', 0], ['Allah is the All-Hearing.', 2], ['Rain falls by Allah\'s will.', 0], ['I put my trust in Allah alone.', 1],
        ['Allah is Ar-Rahman, the Most Merciful.', 2],
      ],
    },
    {
      type: 'quiz',
      items: [
        { q: 'The people of Makkah believed Allah was the Creator. Why were they still not upon Tawheed?', a: 'They worshipped idols as well as Allah', w: ['They did not believe in any god', 'They did not know where rain came from'], why: 'They accepted Allah\'s Lordship but gave their worship to idols. Tawheed needs all three categories.' },
        { q: 'Which category is about doing every act of worship for Allah alone?', a: 'Tawheed al-Uluhiyyah', w: ['Tawheed ar-Rububiyyah', 'Tawheed al-Asma was-Sifat'], why: 'Uluhiyyah comes from ilah, the one who is worshipped.' },
        { q: 'Which is the right way to believe in Allah\'s Attributes?', a: 'As they come in the Qur\'an and Sunnah, without likening them to creation', w: ['By imagining what they look like', 'By changing their meaning'], why: 'We affirm what Allah and His Messenger ﷺ told us, and we do not compare Allah to anything He created.' },
      ],
    },
    {
      type: 'write', h: 'Write your own examples', lines: 6,
      prompt: 'Write one example from your own day for each category: Lordship, worship, and Names and Attributes.',
    },
    {
      type: 'write', h: 'Explain to a friend', lines: 5,
      prompt: 'Explain to a friend why all three categories of Tawheed are needed. Use the example of the people of Makkah.',
    },
  ],
};

const u1l4 = {
  title: '1.4 The blessings and fruits of Tawheed',
  pages: [
    {
      type: 'read', h: 'Lesson objectives', img: IMG(13),
      text: [
        'By the end of this lesson you will be able to:',
        { list: ['list some of the blessings of Tawheed', 'understand how Tawheed affects daily life', 'see why Tawheed comes first in Islam'] },
      ],
    },
    {
      type: 'read', h: 'Tawheed is something you live',
      text: [
        'Tawheed is the foundation of our faith. It is also the way to a happy life. It brings great blessings in this world and in the Hereafter. Four of them are below.',
        { note: { h: '1. Peace and safety in the heart', t: 'When you worship only Allah, your heart rests in Him. You stop worrying about pleasing people or winning their approval.' } },
        { note: { h: '2. Forgiveness and Paradise', t: 'Allah promises forgiveness and Paradise to those who hold on to Tawheed and avoid shirk.' } },
        { note: { h: '3. Dignity and honour', t: 'Tawheed gives us real honour. We bow to no one except the One who created everything.' } },
        { note: { h: '4. Unity of the Muslims', t: 'Tawheed brings Muslims together as one Ummah. We worship the same Lord and follow the same truth.' } },
      ],
      words: [{ w: 'dignity', m: 'being worthy of respect' }, { w: 'Ummah', m: 'the whole community of Muslims' }],
    },
    { type: 'ayah', s: 6, a: 82, en: 'Those who believe and do not mix their belief with injustice: they will have security, and they are rightly guided.' },
    {
      type: 'read', h: 'Which injustice?',
      text: [
        'When this ayah came down, the Companions were worried, because everyone does some wrong. The Prophet ﷺ explained that the "injustice" here means shirk (Sahih al-Bukhari 32).',
        'So the security and guidance in this ayah are promised to the people of Tawheed.',
      ],
    },
    {
      type: 'hadith',
      ar: 'مَنْ مَاتَ وَهُوَ يَعْلَمُ أَنَّهُ لَا إِلَهَ إِلَّا اللَّهُ دَخَلَ الْجَنَّةَ',
      en: 'Whoever dies knowing that there is no god but Allah will enter Paradise.',
      src: 'Sahih Muslim 26',
    },
    {
      type: 'read', h: 'Bilal ibn Rabah: "One, One"',
      check: '"Ahad, Ahad" is in Sunan Ibn Majah 150 (graded hasan). The rock on his chest and his master Umayyah ibn Khalaf come from Ibn Ishaq\'s Sirah. Please check the summary.',
      text: [
        'Bilal ibn Rabah was a slave in Makkah when he accepted Islam. His master, Umayyah ibn Khalaf, was furious that Bilal now worshipped Allah alone.',
        'The idol-worshippers tortured Bilal to make him leave Islam. They laid him on the burning sand in the midday sun. Ibn Ishaq reports that Umayyah had a heavy rock placed on his chest. He told Bilal he would stay that way until he left the religion of Muhammad ﷺ.',
        'Bilal kept repeating one word: "Ahad, Ahad." It means "One, One." He was declaring that Allah is One.',
        'The pain did not change his words. Later, Abu Bakr bought Bilal and set him free, and Bilal became the first mu\'adhdhin of Islam.',
      ],
      words: [{ w: 'mu\'adhdhin', m: 'the person who calls the adhan for prayer' }],
    },
    {
      type: 'match', h: 'Match each blessing with what it means',
      pairs: [
        ['Peace in the heart', 'You stop worrying about pleasing people'],
        ['Forgiveness and Paradise', 'Allah\'s promise to those who avoid shirk'],
        ['Dignity and honour', 'You bow to no one but your Creator'],
        ['Unity', 'Muslims are one Ummah with one Lord'],
      ],
    },
    {
      type: 'quiz',
      items: [
        { q: 'In Surah al-An\'am 6:82, what does "injustice" mean?', a: 'Shirk', w: ['Being late', 'Being poor'], why: 'The Prophet ﷺ explained this himself, as reported in Sahih al-Bukhari 32.' },
        { q: 'What did Bilal say while he was being tortured?', a: '"Ahad, Ahad": One, One', w: ['Nothing at all', 'He asked the idols for help'], why: 'He kept declaring that Allah is One, even in great pain.' },
        { q: 'How does Tawheed bring Muslims together?', a: 'They all worship the same Lord and follow the same truth', w: ['They all live in one country', 'They all speak the same language'], why: 'Muslims come from every land and language, but they share one Lord and one belief.' },
      ],
    },
    {
      type: 'write', h: 'Personal reflection', lines: 5,
      prompt: 'Write two benefits of Tawheed that you feel in your life, or that you would like to feel.',
    },
    {
      type: 'write', h: 'Reflect and think', lines: 6,
      prompt: 'How does believing in Tawheed bring peace to our hearts? What does Bilal\'s story teach you about courage and faith? How does Tawheed help Muslims stay united?',
    },
  ],
};

const u1test = {
  title: 'Unit One test', test: true,
  pages: [
    {
      type: 'read', h: 'Before you start',
      text: ['This test covers Unit One: what Tawheed is, why we were created, the three categories of Tawheed and its blessings. Read each question carefully. Do your best and trust Allah.'],
    },
    {
      type: 'quiz', h: 'Part A: multiple choice',
      items: [
        { q: 'What is the meaning of La ilaha illallah?', a: 'There is no god worthy of worship except Allah', w: ['Allah is the Greatest', 'All praise is for Allah', 'Allah is the Protector'], why: '"La ilaha" denies every false god. "Illa Allah" affirms Allah alone.' },
        { q: 'What is the main purpose of our creation?', a: 'To worship Allah alone', w: ['To earn wealth and live happily', 'To build strong communities', 'To travel and explore the world'], why: 'Surah adh-Dhariyat 51:56.' },
        { q: 'In how many categories is Tawheed explained?', a: 'Three', w: ['Two', 'Four', 'Five'], why: 'Lordship, worship, and Names and Attributes.' },
        { q: 'Which of these is a fruit of Tawheed?', a: 'Peace in the heart', w: ['Fear of people', 'Arrogance', 'Showing off'], why: 'When the heart rests in Allah, it stops chasing people\'s approval.' },
        { q: 'The Arabic root of the word Tawheed means:', a: 'To make one', w: ['To worship', 'To create', 'To pray'], why: 'Tawheed comes from wahhada, "to make one".' },
        { q: 'The people of Makkah believed Allah was the Creator. What was missing?', a: 'They did not worship Allah alone', w: ['They did not believe in a Creator', 'They did not believe in rain', 'Nothing was missing'], why: 'They accepted Lordship but gave worship to idols.' },
      ],
    },
    {
      type: 'quiz', h: 'Part B: true or false',
      items: [
        tf('Tawheed means believing that Allah alone deserves worship.', true, 'That is Tawheed al-Uluhiyyah. It was the message of every prophet.'),
        tf('Tawheed ar-Rububiyyah means that Allah alone is our Creator and Provider.', true, 'Rububiyyah is about Allah\'s Lordship: He creates, owns, provides and controls.'),
        tf('Tawheed al-Uluhiyyah means we worship Allah alone.', true, 'Uluhiyyah is about worship.'),
        tf('Shirk means associating partners with Allah in what belongs to Him.', true, 'Shirk is the opposite of Tawheed.'),
        tf('Believing in Tawheed has no effect on how we live.', false, 'Tawheed changes our worship, our character and the way we face every day.'),
      ],
    },
    {
      type: 'match', h: 'Part C: match the words',
      pairs: [['Tawheed ar-Rububiyyah', 'Oneness of Allah in His Lordship'], ['Tawheed al-Uluhiyyah', 'Oneness of Allah in worship'], ['Tawheed al-Asma was-Sifat', 'Oneness of Allah in His Names and Attributes'], ['Ibadah', 'Everything Allah loves and is pleased with'], ['Shirk', 'Giving Allah a partner']],
    },
    {
      type: 'write', h: 'Part D: define the terms', lines: 6,
      prompt: 'Write a clear definition of each term: Tawheed, Tawheed ar-Rububiyyah, Tawheed al-Uluhiyyah.',
    },
    {
      type: 'write', h: 'Part E: answer in full', lines: 8,
      prompt: 'Allah says: "And I did not create the jinn and mankind except to worship Me" (51:56). Explain in your own words what this ayah teaches about why we were created. Then describe the three categories of Tawheed with an example of each.',
    },
    {
      type: 'write', h: 'Part F: Bilal\'s faith', lines: 5,
      prompt: 'Bilal\'s story shows great trust in Allah. What can you learn from his faith and courage that you can use in your own life?',
    },
  ],
};

// ── Unit Two: Tawheed ar-Rububiyyah ──
const u2l1 = {
  title: '2.1 Allah, the Creator', ar: 'ٱلْخَالِق',
  pages: [
    {
      type: 'read', h: 'Unit Two: Tawheed ar-Rububiyyah', img: IMG(16),
      text: [
        'This unit is about believing in Allah as the only Lord. He creates, He provides, and He plans and controls everything. He gives life and He takes it.',
        'You will look at the world He made and the way He looks after it. You will also see how this belief changes the way we work, pray and trust.',
        { list: ['Lesson 1: Allah, the Creator', 'Lesson 2: Allah, the Provider', 'Lesson 3: Allah, the Planner and Controller', 'Lesson 4: Allah, the Giver of life and death', 'Unit Two test'] },
      ],
    },
    {
      type: 'read', h: 'Lesson objectives', img: IMG(17),
      text: [
        'By the end of this lesson you will be able to:',
        { list: ['define creation', 'give evidence from the Qur\'an that Allah is the Creator', 'compare Allah\'s creation with things that people make'] },
      ],
    },
    { type: 'ayah', s: 39, a: 62, en: 'Allah is the Creator of all things, and He is the Guardian over all things.' },
    {
      type: 'read', h: 'What does it mean that Allah is the Creator?',
      text: [
        'To create means to bring something into being from nothing. Allah needed no material and no helper. He created everything by His will alone.',
        'Look at the sky and the mountains. Look at the trees, the oceans and the stars. Think about your own body: your heartbeat, your senses, and your ability to learn and to love.',
        'None of this came about by chance. All of it points to one perfect Creator.',
      ],
      words: [{ w: 'chance', m: 'happening by accident, with no one planning it' }],
    },
    { type: 'ayah', s: 36, a: 82, en: 'His command, when He wills a thing, is only that He says to it, "Be," and it is.' },
    {
      type: 'read', h: 'Allah\'s creation and human making',
      text: [
        'People make things too. But what people make is very different from what Allah creates.',
        { table: [
          ['Allah\'s creation', 'Human making'],
          ['Created from nothing', 'Made from materials that already exist'],
          ['Perfect, without any flaw', 'Can have mistakes or faults'],
          ['Kept going by Allah\'s constant care', 'Stops working when its parts wear out'],
          ['Full of wisdom and perfect order', 'Made for a few limited uses'],
        ] },
        { note: { h: 'Only Allah creates', t: 'A carpenter shapes wood, but he did not create the tree. An engineer builds a phone, but he did not create the metal, the light or the mind he used to design it.' } },
      ],
    },
    { type: 'ayah', s: 16, a: 20, en: 'And those they call on besides Allah create nothing, and they themselves are created.' },
    { type: 'ayah', s: 22, a: 73, w: [8, 19], en: 'Indeed, those you call on besides Allah will never create a fly, even if they all gathered together to do it.' },
    {
      type: 'read', h: 'The scientist who found Allah in a lab',
      text: [
        'Dr Yasir loved science. He spent years studying cells, the tiny building blocks of our bodies. Under his microscope he saw a whole world.',
        'He saw mitochondria, tiny power stations that give the cell energy. He saw the nucleus, which stores information like a perfect library. Other parts carried messages, built new materials or recycled old ones. Every cell was like a busy city where everything worked together.',
        'Dr Yasir tried to build even a simple living cell in the lab. However hard he tried, he could not create life. He saw that one human cell is far more complex than any machine or computer.',
        'He looked up from his microscope and smiled. "This could not happen by itself," he said. "It must have been created by the All-Knowing, All-Powerful Creator."',
        'The more he learned about creation, the more he saw the greatness of the One who created it all.',
      ],
      words: [{ w: 'mitochondria', m: 'tiny parts inside a cell that turn food into energy' }, { w: 'nucleus', m: 'the centre of a cell, which holds its instructions' }],
    },
    {
      type: 'sort', h: 'Allah\'s creation or human making?', prompt: 'Put each card in the right basket.',
      groups: ['Allah\'s creation', 'Human making'],
      items: [['Created from nothing', 0], ['Made from materials that already exist', 1], ['Perfect, without any flaw', 0], ['Can break or wear out', 1], ['A living cell', 0], ['A computer', 1], ['The sun and the stars', 0], ['A wooden table', 1]],
    },
    {
      type: 'quiz',
      items: [
        { q: 'What does "to create" mean?', a: 'To bring something into being from nothing', w: ['To fix something that is broken', 'To join two things together'], why: 'Only Allah creates from nothing. People can only shape what Allah has already created.' },
        { q: 'What does Surah al-Hajj 22:73 say the false gods could never create?', a: 'A fly', w: ['A mountain', 'A city'], why: 'Even all of them together could not create a single fly.' },
        { q: 'What did Dr Yasir find when he tried to build a living cell?', a: 'He could not create life', w: ['It was easy', 'The computer did it for him'], why: 'A single cell is more complex than any machine. Life comes only from Allah.' },
        { q: 'How does Allah bring a thing into being?', a: 'He says to it "Be," and it is', w: ['He needs helpers', 'He needs materials first'], why: 'Surah Ya-Sin 36:82.' },
      ],
    },
    {
      type: 'write', h: 'Activity: I reflect on Allah\'s creations', lines: 8,
      prompt: 'Look around you today. Name five things Allah created that you can see. Next to each one, write one thought about it.',
      hint: 'For example: "The sun: it rises every day without anyone switching it on."',
    },
    {
      type: 'write', h: 'Thinking deeper', lines: 6,
      prompt: 'How does learning about the universe increase your awe of Allah? Why do you think the things people worship besides Allah cannot create even a tiny fly?',
    },
  ],
};

const u2l2 = {
  title: '2.2 Allah, the Provider', ar: 'ٱلرَّزَّاق',
  pages: [
    {
      type: 'read', h: 'Lesson objectives', img: IMG(20),
      text: [
        'By the end of this lesson you will be able to:',
        { list: ['understand the Name Ar-Razzaq', 'tell the difference between provision for the body and provision for the heart', 'explain how our effort and Allah\'s provision fit together', 'show gratitude for what Allah gives'] },
      ],
    },
    { type: 'ayah', s: 51, a: 58, en: 'Indeed, it is Allah who is the Provider, the Possessor of strength, the Firm.' },
    {
      type: 'read', h: 'Ar-Razzaq, the One who provides',
      text: [
        'Ar-Razzaq is one of Allah\'s beautiful Names. It means the One who provides for all of creation. He gives without limit, and He gives even when no one asks.',
        'No one can provide anything except by His permission. Every bird, fish and insect eats from what He provides.',
        { table: [
          ['Provision for the body', 'Provision for the heart'],
          ['Food and water', 'Faith and guidance'],
          ['Clothing and a home', 'Useful knowledge'],
          ['Health and wealth', 'Contentment, patience and forgiveness'],
        ] },
      ],
      words: [{ w: 'provision', m: 'everything Allah gives us that we need, for our bodies and our hearts' }, { w: 'Razzaq', m: 'the One who provides, again and again' }],
    },
    { type: 'ayah', s: 11, a: 6, en: 'And there is no creature on the earth except that its provision is from Allah. He knows where it lives and where it is kept. All is in a clear record.' },
    {
      type: 'read', h: 'If Allah is the Provider, why do we work?',
      text: [
        'Working hard is part of our duty. We plan, study and work, using the means Allah has given us. But the provision itself does not come from our effort. It comes from Allah.',
        { note: { h: 'Effort is the means. Provision is from Allah.', t: 'We do our part, and we trust Allah for the result.' } },
        { table: [
          ['What we do', 'What Allah does'],
          ['We take medicine when we are ill.', 'Healing comes from Allah.'],
          ['We plant seeds and water them.', 'Allah makes the plant grow.'],
          ['We look for work and do our best.', 'The provision from that work comes from Allah.'],
        ] },
      ],
    },
    {
      type: 'hadith',
      ar: 'لَوْ أَنَّكُمْ كُنْتُمْ تَوَكَّلُونَ عَلَى اللَّهِ حَقَّ تَوَكُّلِهِ لَرُزِقْتُمْ كَمَا تُرْزَقُ الطَّيْرُ، تَغْدُو خِمَاصًا وَتَرُوحُ بِطَانًا',
      en: 'If you were to rely on Allah as He should be relied on, He would provide for you as He provides for the birds. They go out in the morning hungry and come back in the evening full.',
      src: 'Jami at-Tirmidhi 2344 and Sunan Ibn Majah 4164',
      text: ['Notice that the birds do not stay in their nests. They fly out and search. Effort and trust go together: this is tawakkul.'],
    },
    {
      type: 'read', h: 'Thanking Allah for His provision',
      text: [
        'We did not create our food, our water or our homes. We did not give them to ourselves. Allah gives them out of His mercy. When we see that everything comes from Him, our hearts fill with gratitude, and our worship grows stronger.',
        'We show shukr (gratitude) for what Allah provides when we:',
        { list: ['thank Allah with our hearts and our tongues', 'spend in ways that please Allah', 'avoid waste', 'share with people in need'] },
        'We also say the du\'a the Prophet ﷺ taught for these moments: Bismillah before eating, Alhamdulillah after it.',
      ],
    },
    {
      type: 'dua', when: 'After eating',
      ar: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
      tr: 'Alhamdu lillahil-ladhi at\'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah',
      en: 'All praise is for Allah, who fed me this and provided it for me without any power or strength from me.',
      src: 'Sunan Abi Dawud 4023 and Jami at-Tirmidhi 3458',
      check: 'Graded hasan. The textbook gives a shorter "Alhamdulillah"; this is the full du\'a taught by the Prophet ﷺ.',
    },
    {
      type: 'dua', when: 'When it rains',
      ar: 'اللَّهُمَّ صَيِّبًا نَافِعًا',
      tr: 'Allahumma sayyiban nafi\'a',
      en: 'O Allah, make it a beneficial rain.',
      src: 'Sahih al-Bukhari 1032',
      check: 'The textbook has "Alhamdulillah \'ala al-matar"; it is replaced with the du\'a the Prophet ﷺ said when it rained.',
    },
    {
      type: 'sort', h: 'Two kinds of provision', prompt: 'Is it provision for the body or for the heart?',
      groups: ['For the body', 'For the heart'],
      items: [['Food', 0], ['Guidance', 1], ['A home', 0], ['Faith', 1], ['Health', 0], ['Useful knowledge', 1], ['Clean water', 0], ['Patience', 1]],
    },
    {
      type: 'quiz',
      items: [
        { q: 'What does Ar-Razzaq mean?', a: 'The One who provides for all creation', w: ['The One who creates from nothing', 'The One who gives life'], why: 'Ar-Razzaq comes from rizq, which means provision.' },
        { q: 'A farmer plants seeds and waters them. Who makes them grow?', a: 'Allah', w: ['The farmer', 'The water by itself'], why: 'The farmer does his part. The growth comes from Allah.' },
        { q: 'What does the hadith of the birds teach?', a: 'Make an effort and trust Allah for the result', w: ['Stay at home and wait for food', 'Worry about every meal'], why: 'The birds go out searching, and Allah feeds them.' },
      ],
    },
    {
      type: 'write', h: 'Count Allah\'s blessings on you', lines: 8,
      prompt: 'Write five blessings Allah has given you. Next to each one, write how you will thank Him for it.',
    },
  ],
};

const u2l3 = {
  title: '2.3 Allah, the Planner and Controller', ar: 'ٱلْمُدَبِّر',
  pages: [
    {
      type: 'read', h: 'Lesson objectives', img: IMG(23),
      text: [
        'By the end of this lesson you will be able to:',
        { list: ['understand that Allah controls everything', 'find examples of Allah\'s planning in nature', 'understand tawakkul, trust in Allah'] },
      ],
    },
    {
      type: 'read', h: 'What is tadbir?',
      text: [
        'Tadbir means Allah\'s perfect planning and managing of every affair. Nothing happens by chance. Allah knows everything, plans everything and controls everything, with perfect wisdom.',
      ],
      words: [{ w: 'tadbir', m: 'Allah\'s planning and running of every affair' }],
    },
    { type: 'ayah', s: 32, a: 5, w: [1, 6], en: 'He arranges every affair from the heaven to the earth.' },
    {
      type: 'read', h: 'Signs of Allah\'s control in the world',
      text: [
        { note: { h: 'Day and night', t: 'Allah turns the earth, bringing day and night. He knows when each will come and how long it will last.' } },
        { note: { h: 'The water cycle', t: 'Allah sends rain from the sky, stores it in rivers and oceans, then raises it again into the clouds. He provides water for all life.' } },
        { note: { h: 'Your heartbeat', t: 'Your heart beats without you telling it to. Allah keeps it going every second to keep you alive.' } },
        { note: { h: 'Gravity', t: 'Allah holds everything in perfect order. The earth stays in its path, and we stay on the earth.' } },
      ],
    },
    {
      type: 'read', h: 'Four signs of Allah\'s control',
      text: [
        { list: [
          'He creates and provides. The sun rises, plants grow and food reaches our tables by His will.',
          'He brings benefit and harm. He sends rain that helps crops grow. He can also send a storm or an illness as a test.',
          'He knows what is hidden. He knows what we think, what we say and what we hide.',
          'He controls time and events. He decides when things happen. Not a leaf falls without His knowledge.',
        ], numbered: true },
      ],
    },
    { type: 'ayah', s: 6, a: 59, w: [15, 20], en: 'And not a leaf falls but that He knows it.' },
    {
      type: 'hadith', kicker: 'A man asked: "O Messenger of Allah, shall I tie my camel and trust in Allah, or leave it untied and trust in Allah?" The Prophet ﷺ said:',
      ar: 'اعْقِلْهَا وَتَوَكَّلْ',
      en: 'Tie it, and trust in Allah.',
      src: 'Jami at-Tirmidhi 2517',
      check: 'Graded hasan by al-Albani; at-Tirmidhi called it gharib. The textbook tells this as a story about Umar ibn al-Khattab; the hadith is a question put to the Prophet ﷺ, as given here.',
    },
    {
      type: 'read', h: 'Effort and tawakkul',
      text: [
        'Islam teaches a balance. We take the means (asbab) that Allah has created. We tie the camel, study for the exam and wear a seatbelt. Then we place our hearts in Allah\'s hands, because He is the One who protects and provides.',
        'That is real tawakkul. Lazy "tawakkul" means doing nothing and saying "Allah will sort it out". The Prophet ﷺ did not teach that.',
      ],
      words: [{ w: 'asbab', m: 'the means or causes Allah has made, like medicine or study' }, { w: 'tawakkul', m: 'relying on Allah after doing your part' }],
    },
    { type: 'ayah', s: 64, a: 11, w: [1, 7], en: 'No disaster strikes except by the permission of Allah.' },
    {
      type: 'hadith', kicker: 'The Prophet ﷺ said to Ibn Abbas:',
      ar: 'وَاعْلَمْ أَنَّ الْأُمَّةَ لَوِ اجْتَمَعَتْ عَلَى أَنْ يَنْفَعُوكَ بِشَيْءٍ لَمْ يَنْفَعُوكَ إِلَّا بِشَيْءٍ قَدْ كَتَبَهُ اللَّهُ لَكَ، وَلَوِ اجْتَمَعُوا عَلَى أَنْ يَضُرُّوكَ بِشَيْءٍ لَمْ يَضُرُّوكَ إِلَّا بِشَيْءٍ قَدْ كَتَبَهُ اللَّهُ عَلَيْكَ',
      en: 'Know that if the whole nation gathered together to benefit you with something, they could only benefit you with what Allah has already written for you. And if they gathered together to harm you with something, they could only harm you with what Allah has already written against you.',
      src: 'Jami at-Tirmidhi 2516',
    },
    {
      type: 'quiz',
      items: [
        { q: 'What does tadbir mean?', a: 'Allah\'s perfect planning and running of every affair', w: ['Luck', 'People planning their week'], why: 'Nothing happens by chance. Allah plans and controls everything.' },
        { q: 'What did the Prophet ﷺ tell the man with the camel?', a: 'Tie it, and trust in Allah', w: ['Leave it untied and trust in Allah', 'Do not trust anyone'], why: 'Take the means, then rely on Allah.' },
        { q: 'Which is real tawakkul?', a: 'Revising for an exam, then trusting Allah with the result', w: ['Not revising and hoping for the best', 'Revising and then worrying all night'], why: 'Tawakkul joins effort with trust.' },
        { q: 'Who keeps your heart beating while you sleep?', a: 'Allah', w: ['You do', 'Nobody, it happens by chance'], why: 'Your heart beats without you telling it to. Allah keeps it going.' },
      ],
    },
    {
      type: 'gap', h: 'Complete the sentences',
      items: [
        { t: 'Taking means like medicine or study is called taking the ___.', a: 'asbab', w: ['tadbir', 'shukr'] },
        { t: 'Relying on Allah after doing your part is called ___.', a: 'tawakkul', w: ['tadbir', 'shirk'] },
        { t: 'Not a ___ falls without Allah knowing it.', a: 'leaf', w: ['star', 'mountain'] },
      ],
    },
    {
      type: 'write', h: 'Reflect and think', lines: 7,
      prompt: 'When you study hard for an exam, how can you also put your trust in Allah? Think of a time you were ill and then got better: what does it teach you about Allah\'s control over our health? What is the difference between lazy tawakkul and real tawakkul?',
    },
    {
      type: 'write', h: 'Observe and reflect', lines: 6,
      prompt: 'Choose one thing in nature that you can see around you: the sky, the seasons, the sea or something else. Describe it. Explain how it shows Allah\'s control and planning, and write how it makes you feel.',
    },
  ],
};

const u2l4 = {
  title: '2.4 Allah, the Giver of life and death',
  pages: [
    {
      type: 'read', h: 'Lesson objectives',
      text: [
        'By the end of this lesson you will be able to:',
        { list: ['understand that life and death belong to Allah', 'believe in the resurrection', 'use your life well'] },
      ],
    },
    {
      type: 'read', h: 'Life and death belong to Allah',
      check: 'Al-Muhyi and Al-Mumit are in the list of names in Jami at-Tirmidhi 3507, whose list is weak. The meaning, that Allah gives life and causes death, is in many ayat (for example 10:56 and 30:40), and Allah is described as "muhyi al-mawta" in 30:50.',
      text: [
        { table: [
          ['Name', 'Arabic', 'Meaning'],
          ['Al-Muhyi', 'ٱلْمُحْيِي', 'The Giver of life'],
          ['Al-Mumit', 'ٱلْمُمِيت', 'The One who causes death'],
        ] },
        'Allah gives life to everything that lives. Without Him, nothing could live for a moment. He also takes the souls of all living beings when their time comes. No one can give life or cause death except by His will.',
      ],
    },
    { type: 'ayah', s: 10, a: 56, en: 'It is He who gives life and causes death, and to Him you will be returned.' },
    {
      type: 'read', h: 'The three stages of life',
      text: [
        { table: [
          ['Stage', 'What happens'],
          ['First life', 'Allah gives us life in this world. We are born, we grow, we learn, we worship and we do good deeds.'],
          ['Death', 'Allah takes our souls and this life ends. Every soul will taste death.'],
          ['Second life: the resurrection', 'Allah brings us back to life. We are raised and judged for our deeds.'],
        ] },
      ],
      words: [{ w: 'resurrection', m: 'being brought back to life after death, on the Day of Judgement' }],
    },
    { type: 'ayah', s: 3, a: 185, w: [1, 4], en: 'Every soul will taste death.' },
    { type: 'ayah', s: 67, a: 2, w: [1, 8], en: 'He who created death and life to test you, which of you is best in deeds.' },
    {
      type: 'read', h: 'Life is a trust',
      text: [
        'Allah did not give us life for nothing. He created death and life to test which of us does the best deeds.',
        'Knowing that we will die, and be raised again, helps us live with purpose. It gives us hope, because Allah rewards every good deed. It also makes us careful, because we will answer for what we did.',
        { note: { h: 'One ayah, the whole unit', t: 'Surah ar-Rum 30:40 says that Allah created us, then provided for us, then will cause us to die, then will give us life again. It asks: can any of the false gods do any of that?' } },
      ],
    },
    { type: 'ayah', s: 30, a: 40, w: [1, 9], en: 'Allah is the One who created you, then provided for you, then will cause you to die, then will give you life.' },
    {
      type: 'order', h: 'Put the stages of life in order',
      items: ['First life in this world', 'Death', 'Resurrection', 'Judgement for our deeds'],
    },
    {
      type: 'quiz',
      items: [
        { q: 'Who decides when a person dies?', a: 'Allah alone', w: ['Doctors', 'The person himself'], why: 'No one can give life or cause death except by Allah\'s will.' },
        { q: 'Why did Allah create death and life?', a: 'To test which of us does the best deeds', w: ['For no reason', 'So that we can collect money'], why: 'Surah al-Mulk 67:2.' },
        { q: 'What happens after death for every person?', a: 'They will be raised again and judged', w: ['Nothing at all', 'They come back as an animal'], why: 'Allah will bring everyone back to life on the Day of Resurrection.' },
      ],
    },
    {
      type: 'write', h: 'Use your time well', lines: 6,
      prompt: 'Allah gave you life so you can do good. Write one good deed you will do, one useful skill you will learn, and one habit you will improve.',
    },
    {
      type: 'write', h: 'Reflect and write', lines: 6,
      prompt: 'How should believing that Allah gives life and causes death change your daily life? How does believing in the resurrection change the choices you make today?',
    },
  ],
};

const u2test = {
  title: 'Unit Two test', test: true,
  pages: [
    {
      type: 'read', h: 'Before you start',
      text: ['This test covers Unit Two: Allah as the Creator, the Provider, the Planner and Controller, and the Giver of life and death. Do your best and trust Allah.'],
    },
    {
      type: 'match', h: 'Part A: match each term with its meaning',
      pairs: [['Ar-Razzaq', 'The Provider'], ['Tadbir', 'Allah\'s planning and control of all affairs'], ['Tawakkul', 'Trusting Allah after taking the means'], ['Al-Muhyi', 'The Giver of life'], ['Al-Mumit', 'The One who causes death']],
    },
    {
      type: 'quiz', h: 'Part B: multiple choice',
      items: [
        { q: 'Who provides for every living being?', a: 'Allah', w: ['People', 'Angels', 'Jinn'], why: 'Surah Hud 11:6: every creature\'s provision is from Allah.' },
        { q: 'The belief that everything happens under Allah\'s control is called:', a: 'Tadbir', w: ['Tawakkul', 'Ikhlas', 'Shukr'], why: 'Tadbir is Allah\'s planning and running of every affair.' },
        { q: 'We should take the means and then:', a: 'Trust Allah for the result', w: ['Worry about the result', 'Give up and do nothing', 'Depend only on ourselves'], why: '"Tie it, and trust in Allah."' },
        { q: 'What happens after death?', a: 'Resurrection and return to Allah', w: ['Nothing', 'Coming back as another creature', 'Staying in the grave forever'], why: '"To Him you will be returned" (10:56).' },
      ],
    },
    {
      type: 'quiz', h: 'Part C: true or false',
      items: [
        tf('Allah is the only One who can create.', true, 'Those called on besides Allah cannot create even a fly.'),
        tf('Only Allah gives provision to His creation.', true, 'People work, but the provision itself is from Allah.'),
        tf('Everything happens randomly, without any plan.', false, 'Nothing happens by chance. Allah arranges every affair.'),
        tf('After death, people will be brought back to life.', true, 'Everyone will be raised and judged.'),
        tf('We should rely only on the means and not on Allah.', false, 'We take the means and rely on Allah.'),
      ],
    },
    {
      type: 'write', h: 'Part D: short answers', lines: 10,
      prompt: '1. What does it mean that Allah is the Creator? Give an example from creation. 2. How does Allah provide for His creation? Give two examples. 3. What does it mean that Allah plans and controls everything? 4. How is Allah the Giver of life and the One who causes death?',
    },
  ],
};

// ── Unit Three: Tawheed al-Uluhiyyah ──
const u3l1 = {
  title: '3.1 What is worship?', ar: 'ٱلْعِبَادَة',
  pages: [
    {
      type: 'read', h: 'Unit Three: Tawheed al-Uluhiyyah', img: IMG(30),
      text: [
        'In this unit you will learn what worship (ibadah) means and why it belongs to Allah alone.',
        'You will see how two conditions protect our worship from mistakes: sincerity, and following the Sunnah. You will also learn how everyday actions can become worship when they are done for Allah.',
        { list: ['Lesson 1: What is worship?', 'Lesson 2: Sincerity: worshipping Allah alone', 'Lesson 3: Following the Messenger ﷺ', 'Lesson 4: Types of worship', 'Unit Three review and test'] },
      ],
    },
    {
      type: 'read', h: 'Lesson objectives', img: IMG(31),
      text: [
        'By the end of this lesson you will be able to:',
        { list: ['define ibadah', 'explain why Allah alone deserves worship', 'find worship in daily life'] },
      ],
    },
    {
      type: 'read', h: 'Ibadah (worship)',
      text: [
        'The scholar Ibn Taymiyyah gave a definition of worship that is often taught: ibadah is a name for everything Allah loves and is pleased with, from words and actions, inside and outside.',
        'Allah alone deserves worship because He alone is our Lord. He created us and He provides for us. It makes no sense to worship something that cannot create anything, or even hear a du\'a.',
        { note: { h: 'Worship is wider than rituals', t: 'Prayer and fasting are worship. So is every act done for the sake of Allah, in the way He loves. Worship includes what is in our hearts, what we say, and what we do.' } },
      ],
      words: [{ w: 'ibadah', m: 'worship: everything Allah loves and is pleased with' }, { w: 'rituals', m: 'set acts of worship such as prayer and fasting' }],
    },
    { type: 'ayah', s: 6, a: 162, en: 'Say: Indeed, my prayer, my sacrifice, my living and my dying are for Allah, Lord of the worlds.' },
    {
      type: 'read', h: 'Your whole life can be worship',
      text: [
        'When you do something good with the right intention for Allah, it becomes worship. Study, work, helping others and being kind can all be acts of worship.',
        { table: [
          ['Examples of worship', ''],
          ['Prayer', 'Charity'],
          ['Du\'a', 'Honesty'],
          ['Dhikr (remembering Allah)', 'Helping your parents'],
          ['Fasting', 'Seeking useful knowledge'],
        ] },
      ],
    },
    {
      type: 'read', h: 'The three men in the cave',
      check: 'Sahih al-Bukhari 2272 and Sahih Muslim 2743. The textbook\'s version (three young men who slept in a cave for many years) mixes this hadith with the story of the People of the Cave; the hadith is told here instead.',
      text: [
        'The Prophet ﷺ told of three men from the people before us. They were travelling when they took shelter in a cave. A huge rock rolled down the mountain and closed the mouth of the cave. They could not move it.',
        'They said to each other that nothing would save them except calling on Allah by the good deeds they had done sincerely for Him.',
        'The first man had elderly parents. Every night he gave them their milk before anyone else. One night they fell asleep before he came. He stood holding the cup until dawn rather than wake them, while his own children cried from hunger.',
        'The second man had the chance to commit a serious sin. He left it out of fear of Allah.',
        'The third man had hired workers. One of them left without taking his wages. The man invested those wages until they grew into large herds of animals. Years later the worker returned, and he gave him all of it.',
        'After each du\'a the rock moved a little. After the third, the mouth of the cave opened and they walked out.',
      ],
    },
    {
      type: 'quiz',
      items: [
        { q: 'Which is the best definition of ibadah?', a: 'Everything Allah loves and is pleased with, from words and actions, inside and outside', w: ['Only the five daily prayers', 'Anything that makes people praise us'], why: 'Worship is much wider than rituals.' },
        { q: 'Why does Allah alone deserve worship?', a: 'He alone is our Lord, who created us and provides for us', w: ['Because our parents tell us to', 'Because it is a tradition'], why: 'Lordship belongs to Allah alone, so worship belongs to Him alone.' },
        { q: 'What saved the three men in the cave?', a: 'Calling on Allah by good deeds they had done sincerely for Him', w: ['Shouting for help', 'Breaking the rock with their hands'], why: 'Their sincere deeds became a means of relief from Allah.' },
        { q: 'Can sleeping become worship?', a: 'Yes, if you rest so you can worship Allah and do good the next day', w: ['No, never', 'Only if people see you'], why: 'A good intention turns ordinary actions into worship.' },
      ],
    },
    {
      type: 'write', h: 'Activity: turn an ordinary action into worship', lines: 6,
      prompt: 'Write three everyday actions. Next to each one, write how you can do it for the sake of Allah.',
      hint: 'Think about schoolwork, chores, kindness to others, and sleep.',
    },
    {
      type: 'write', h: 'Reflect and think', lines: 5,
      prompt: 'How can the things you do every day become worship when you do them for Allah?',
    },
  ],
};

const u3l2 = {
  title: '3.2 Sincerity: worshipping Allah alone', ar: 'ٱلْإِخْلَاص',
  pages: [
    {
      type: 'read', h: 'Lesson objectives', img: IMG(33),
      text: [
        'By the end of this lesson you will be able to:',
        { list: ['define ikhlas', 'explain why worship must be for Allah alone', 'recognise the signs of sincerity'] },
      ],
    },
    { type: 'ayah', s: 98, a: 5, w: [1, 8], en: 'And they were not commanded except to worship Allah, being sincere to Him in religion.' },
    {
      type: 'read', h: 'What is sincerity?',
      text: [
        'Sincerity is called ikhlas in Arabic. It means doing all of our worship for Allah alone. When we are sincere, we want Allah\'s pleasure. We are not after praise or attention from people.',
        'Allah knows what is in our hearts. He accepts only sincere worship.',
        { table: [
          ['Worship for Allah alone', 'Worship to be seen by people'],
          ['We want Allah\'s pleasure.', 'We want people\'s praise.'],
          ['We do it even when no one is watching.', 'We show it off when others can see.'],
          ['We hope for Allah\'s reward in the Hereafter.', 'We hope for praise in this life.'],
          ['We keep going even if no one praises us.', 'We stop if people do not notice.'],
        ] },
      ],
      words: [{ w: 'ikhlas', m: 'sincerity: doing a deed for Allah alone' }],
    },
    {
      type: 'hadith', kicker: 'The Prophet ﷺ said that Allah says:',
      ar: 'أَنَا أَغْنَى الشُّرَكَاءِ عَنِ الشِّرْكِ، مَنْ عَمِلَ عَمَلًا أَشْرَكَ فِيهِ مَعِي غَيْرِي تَرَكْتُهُ وَشِرْكَهُ',
      en: 'I am the One who least needs a partner. Whoever does a deed in which he associates someone else with Me, I leave him and his shirk.',
      src: 'Sahih Muslim 2985',
    },
    {
      type: 'read', h: 'For Allah or for people?',
      text: [
        'Two people can do exactly the same action. One does it for Allah. The other does it to be seen.',
        { table: [
          ['Action', 'For Allah', 'For people'],
          ['Prayer', 'I pray because Allah commands me.', 'I pray so people think I am pious.'],
          ['Charity', 'I give because Allah loves it.', 'I give so people call me generous.'],
          ['Helping', 'I help because Allah tells me to.', 'I help so people will like me.'],
          ['Studying', 'I study to learn and please Allah.', 'I study so people say I am clever.'],
          ['Reciting Qur\'an', 'I recite to draw close to Allah.', 'I recite so people praise my voice.'],
        ] },
      ],
    },
    {
      type: 'hadith', kicker: 'The Prophet ﷺ named seven people whom Allah will shade on the day when there is no shade but His. One of them is:',
      ar: 'وَرَجُلٌ تَصَدَّقَ بِصَدَقَةٍ فَأَخْفَاهَا حَتَّى لَا تَعْلَمَ شِمَالُهُ مَا تُنْفِقُ يَمِينُهُ',
      en: 'A man who gives in charity and hides it, so that his left hand does not know what his right hand gives.',
      src: 'Sahih al-Bukhari 1423 and Sahih Muslim 1031',
      check: 'The textbook has a made-up story of a rich man who gave in secret at night; it is replaced with this hadith, which teaches the same thing.',
    },
    {
      type: 'read', h: 'Protecting our sincerity',
      text: [
        'Sincerity is a precious gift from Allah. Shaytan tries to take it away by whispering in our hearts. So we have to protect it. Here are four ways.',
        { list: [
          'Remember that Allah sees the heart. He knows what is inside you, even when no one else does.',
          'Ask Allah to keep your heart sincere. Make du\'a for it often.',
          'Hide some good deeds. Do some of them in secret, so that only Allah knows.',
          'Accept correction. When someone corrects you, accept it gladly and improve for the sake of Allah.',
        ], numbered: true },
        { table: [
          ['Word', 'Meaning'],
          ['Ikhlas', 'Sincerity: doing everything for the sake of Allah alone'],
          ['Riya', 'Showing off: doing good deeds to be seen or praised by people'],
          ['Niyyah', 'Intention: the decision in the heart to do something for a purpose'],
          ['Qabul', 'Acceptance: when Allah accepts our deeds'],
        ] },
      ],
    },
    {
      type: 'dua', when: 'A du\'a to protect us from hidden shirk',
      ar: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أُشْرِكَ بِكَ وَأَنَا أَعْلَمُ، وَأَسْتَغْفِرُكَ لِمَا لَا أَعْلَمُ',
      tr: 'Allahumma inni a\'udhu bika an ushrika bika wa ana a\'lam, wa astaghfiruka lima la a\'lam',
      en: 'O Allah, I seek refuge in You from associating anything with You knowingly, and I ask Your forgiveness for what I do not know.',
      src: 'al-Adab al-Mufrad 716',
      check: 'Graded sahih by al-Albani. The textbook\'s du\'a ("make all my actions righteous and sincere for Your sake") is a saying of Umar, not of the Prophet ﷺ, so this du\'a is used instead.',
    },
    {
      type: 'sort', h: 'Activity: for Allah or for people?', prompt: 'Read each sentence. Is it done for Allah, or to be seen by people?',
      groups: ['For Allah', 'For people'],
      items: [
        ['I help a friend and hope Allah is pleased.', 0], ['I share my food so people will praise me.', 1], ['I give charity quietly because Allah sees.', 0],
        ['I pray longer only when the imam is watching.', 1], ['I pray on time because I want Allah\'s reward.', 0], ['I post my good deeds online to get likes.', 1],
        ['I smile at others because the Prophet ﷺ called it charity.', 0],
      ],
    },
    {
      type: 'quiz',
      items: [
        { q: 'What is riya?', a: 'Doing good deeds to be seen or praised by people', w: ['Doing good deeds in secret', 'Making du\'a'], why: 'Riya is showing off. It spoils the deed.' },
        { q: 'Is it sincere to pray because you want Allah\'s reward?', a: 'Yes, hoping for Allah\'s reward is part of sincerity', w: ['No, you must want nothing at all', 'Only if people see you'], why: 'Sincerity is wanting Allah, His pleasure and His reward, rather than people.' },
        { q: 'Which of these helps protect sincerity?', a: 'Doing some good deeds in secret', w: ['Telling everyone about your good deeds', 'Only doing good when someone is watching'], why: 'A secret deed is known only to Allah.' },
      ],
    },
    {
      type: 'write', h: 'Private good deed challenge', lines: 5,
      prompt: 'Think of one good deed you can do in secret this week, for Allah alone. Write what it is and how you will do it. (You do not need to tell anyone!)',
    },
    {
      type: 'write', h: 'Reflect', lines: 6,
      prompt: 'Why do we sometimes want people to see our good deeds? How can you check your intention before you do something? Why is ikhlas so important in our worship?',
    },
  ],
};

const u3l3 = {
  title: '3.3 Following the Messenger ﷺ',
  pages: [
    {
      type: 'read', h: 'Lesson objectives', img: IMG(37),
      text: [
        'By the end of this lesson you will be able to:',
        { list: ['explain why Muslims follow Prophet Muhammad ﷺ', 'tell the difference between worship taught by revelation and worship people invent', 'say what the Sunnah is'] },
      ],
    },
    { type: 'ayah', s: 33, a: 21, w: [1, 8], en: 'There has certainly been for you in the Messenger of Allah an excellent example.' },
    {
      type: 'read', h: 'What is the Sunnah?',
      text: [
        'The Sunnah is everything Prophet Muhammad ﷺ said, did or approved of. It explains the Qur\'an and shows us how to live. It guides our beliefs, our worship and our character.',
        'Sincerity is the first condition for worship to be accepted. Following the Sunnah is the second. A deed must be for Allah alone, and it must be done the way the Prophet ﷺ taught.',
      ],
      words: [{ w: 'Sunnah', m: 'what the Prophet ﷺ said, did or approved of' }],
    },
    {
      type: 'read', h: 'Why do we follow the Messenger ﷺ?',
      text: [
        { list: [
          'Allah commanded us to obey the Messenger (Surah an-Nisa 4:59).',
          'He taught us the true way to worship Allah.',
          'He is the best example for us in every part of life.',
          'Loving him and following him is part of our faith.',
        ] },
      ],
    },
    { type: 'ayah', s: 4, a: 59, w: [1, 7], en: 'O you who believe, obey Allah and obey the Messenger.' },
    { type: 'ayah', s: 3, a: 31, en: 'Say: If you love Allah, then follow me; Allah will love you and forgive you your sins. And Allah is Forgiving and Merciful.' },
    {
      type: 'hadith',
      ar: 'صَلُّوا كَمَا رَأَيْتُمُونِي أُصَلِّي',
      en: 'Pray as you have seen me pray.',
      src: 'Sahih al-Bukhari 631',
    },
    {
      type: 'hadith',
      ar: 'مَنْ أَحْدَثَ فِي أَمْرِنَا هَذَا مَا لَيْسَ فِيهِ فَهُوَ رَدٌّ',
      en: 'Whoever brings into this matter of ours something that is not part of it, it is rejected.',
      src: 'Sahih al-Bukhari 2697 and Sahih Muslim 1718',
      text: ['"This matter of ours" means the religion. No one may invent a new act of worship, however good it looks. We worship Allah the way He taught through His Messenger ﷺ.'],
    },
    {
      type: 'read', h: 'The Prophet\'s mercy to children',
      text: [
        'Anas ibn Malik once passed by some children and greeted them with salam. He said that the Prophet ﷺ used to do the same (Sahih al-Bukhari 6247).',
        'The Prophet ﷺ did not ignore children. He greeted them, was gentle with them and showed them respect. Following his example means being kind to everyone, young and old.',
      ],
    },
    {
      type: 'read', h: 'Following the Sunnah in daily life',
      text: [
        { table: [
          ['Area', 'How we follow the Sunnah'],
          ['Prayer', 'We pray on time and with humility, as the Prophet ﷺ taught.'],
          ['Eating', 'We say Bismillah, eat with the right hand and thank Allah afterwards.'],
          ['Greeting', 'We greet others with salam and spread peace.'],
          ['Honesty', 'We speak the truth and keep our promises, as he always did.'],
          ['Kindness', 'We are kind to everyone, especially the weak and those in need.'],
          ['Cleanliness', 'We keep our bodies, clothes and places clean.'],
        ] },
      ],
    },
    {
      type: 'sort', h: 'Taught by revelation, or invented?', prompt: 'Is this worship taught by Allah and His Messenger ﷺ, or something people invented?',
      groups: ['Taught by revelation', 'Invented by people'],
      items: [
        ['Praying the five daily prayers', 0], ['Adding a sixth daily prayer', 1], ['Fasting in Ramadan', 0], ['Making up a new compulsory fast', 1],
        ['Saying Bismillah before eating', 0], ['Praying Fajr with four rak\'ahs instead of two', 1], ['Greeting with as-salamu alaykum', 0],
      ],
    },
    {
      type: 'quiz',
      items: [
        { q: 'What is the Sunnah?', a: 'What the Prophet ﷺ said, did or approved of', w: ['A new idea someone has', 'Only the Qur\'an'], why: 'The Sunnah explains the Qur\'an and shows us how to live it.' },
        { q: 'What are the two conditions for worship to be accepted?', a: 'Sincerity to Allah, and following the Sunnah', w: ['Being seen, and being praised', 'Being rich, and being strong'], why: 'A deed must be for Allah alone and done the way the Prophet ﷺ taught.' },
        { q: 'What does Surah Al Imran 3:31 say we must do if we love Allah?', a: 'Follow the Messenger ﷺ', w: ['Invent new acts of worship', 'Follow whatever most people do'], why: 'Following him brings Allah\'s love and forgiveness.' },
      ],
    },
    {
      type: 'write', h: 'One Sunnah I will practise this week', lines: 6,
      prompt: 'Choose one Sunnah from the table: greeting with salam, eating with the right hand, kindness to children, keeping promises, or cleanliness. When will you practise it this week, and how will it help you?',
    },
    {
      type: 'write', h: 'Reflect and think', lines: 5,
      prompt: 'How does copying the Prophet\'s good character help us in daily life? How can we remind ourselves to follow his guidance every day?',
    },
  ],
};

const u3l4 = {
  title: '3.4 Types of worship',
  pages: [
    {
      type: 'read', h: 'Lesson objectives', img: IMG(40),
      text: [
        'By the end of this lesson you will be able to:',
        { list: ['identify worship of the heart, the tongue, the body and wealth', 'give examples of each type', 'understand that worship is both inward and outward', 'remember that all worship must be sincere and follow the Sunnah'] },
      ],
    },
    {
      type: 'read', h: 'Four kinds of worship',
      text: [
        'We can sort worship by where it takes place. Whatever the type, it must be sincere for Allah alone and done the way the Prophet ﷺ taught.',
        { table: [
          ['Type', 'What it is', 'Examples'],
          ['Heart', 'What happens inside us', 'Loving Allah, trusting Him, fearing Him, a sincere intention'],
          ['Tongue', 'What we say', 'Dhikr, du\'a, telling the truth, kind words'],
          ['Body', 'What we do with our bodies', 'Prayer, fasting, helping others'],
          ['Wealth', 'How we use our money and belongings', 'Charity, supporting family and others'],
        ] },
      ],
    },
    {
      type: 'read', h: 'Worship of the heart',
      text: [
        { note: { h: 'Love of Allah (al-mahabbah)', t: 'Loving Allah more than anything else. We enjoy obeying Him, and we choose what He loves even when it is hard.' } },
        { note: { h: 'Fear of Allah (al-khawf)', t: 'Being afraid of disobeying Allah and of His punishment. It keeps us away from sin, even when no one is watching.' } },
        { note: { h: 'Hope in Allah (ar-raja\')', t: 'Hoping for Allah\'s mercy and reward. It keeps us positive and makes us keep making du\'a.' } },
        { note: { h: 'Trust in Allah (at-tawakkul)', t: 'Relying on Allah in every affair. We study for the test, then trust Allah with the result.' } },
      ],
    },
    {
      type: 'read', h: 'Worship of the tongue',
      text: [
        { note: { h: 'Dhikr', t: 'Remembering Allah with words like SubhanAllah, Alhamdulillah and Allahu Akbar. Say SubhanAllah when you see something amazing.' } },
        { note: { h: 'Du\'a', t: 'Speaking to Allah with humility. We ask Him for help, guidance, forgiveness and every good thing.' } },
        { note: { h: 'Reciting the Qur\'an', t: 'Reading the Qur\'an with understanding and reflection, even a few ayat a day.' } },
        { note: { h: 'Truthful speech', t: 'Telling the truth and using kind words. We avoid lying, backbiting and harsh words.' } },
      ],
    },
    {
      type: 'read', h: 'Worship with our bodies and our wealth',
      text: [
        'Islam teaches us to worship Allah with everything He has given us.',
        { table: [
          ['With our bodies', 'With our wealth'],
          ['Salah: we pray five times a day, talking to Allah.', 'Sadaqah: we give some of our money to help others.'],
          ['Sawm: we fast in Ramadan, which teaches patience and self-control.', 'We spend on good causes, like food for the poor, water projects and education.'],
          ['Ruku\' and sujud: we bow and put our foreheads on the ground, in humility before Allah.', 'We support our family and our relatives.'],
          ['We serve our parents with love and kindness.', 'We spend in halal ways and avoid waste.'],
        ] },
      ],
    },
    {
      type: 'read', h: 'Abu Bakr\'s generosity',
      check: 'Sunan Abi Dawud 1678 and Jami at-Tirmidhi 3675 (graded hasan). The textbook adds that "Allah blessed his wealth even more"; that is not in the narration and is left out.',
      text: [
        'Umar ibn al-Khattab said that the Prophet ﷺ once asked the Companions to give in charity. Umar had some wealth at the time, and he brought half of it.',
        'Then Abu Bakr came with everything he had. The Prophet ﷺ asked him what he had left for his family. Abu Bakr answered, "I have left them Allah and His Messenger."',
        'Umar said that he knew then he could never get ahead of Abu Bakr in doing good.',
      ],
    },
    {
      type: 'read', h: 'Everyday actions can become worship',
      text: [
        'When we do something lawful with a sincere intention for Allah, it can become an act of worship.',
        { table: [
          ['Action', 'How it becomes worship'],
          ['Study', 'Learning to understand Allah\'s religion and to be useful to others'],
          ['Work', 'Earning a halal income to support our families'],
          ['Rest', 'Resting so we can worship and do good the next day'],
          ['Exercise', 'Keeping our bodies strong to obey Allah and serve others'],
          ['Eating', 'Eating halal food with thanks, to gain strength for good deeds'],
        ] },
        'One evening a boy saw that his mother was tired after a long day. Without saying anything, he filled her water bottle and left her a kind note. When she thanked him, he said, "I did it for Allah, so you can rest." The action was small. The intention made it worship.',
      ],
    },
    {
      type: 'hadith',
      ar: 'إِنَّ اللَّهَ لَيَرْضَى عَنِ الْعَبْدِ أَنْ يَأْكُلَ الْأَكْلَةَ فَيَحْمَدَهُ عَلَيْهَا، أَوْ يَشْرَبَ الشَّرْبَةَ فَيَحْمَدَهُ عَلَيْهَا',
      en: 'Allah is pleased with a servant who eats a meal and praises Him for it, or drinks a drink and praises Him for it.',
      src: 'Sahih Muslim 2734',
    },
    {
      type: 'sort', h: 'Which type of worship?', prompt: 'Put each act of worship in the right basket.',
      groups: ['Heart', 'Tongue', 'Body', 'Wealth'],
      items: [
        ['Loving Allah', 0], ['Saying SubhanAllah', 1], ['Praying salah', 2], ['Giving sadaqah', 3], ['Trusting Allah', 0], ['Making du\'a', 1],
        ['Fasting in Ramadan', 2], ['Paying for a water well', 3], ['Hoping for Allah\'s mercy', 0], ['Telling the truth', 1],
      ],
    },
    {
      type: 'quiz',
      items: [
        { q: 'Which of these is worship of the heart?', a: 'Trusting Allah', w: ['Fasting', 'Giving money', 'Reciting Qur\'an'], why: 'Trust, love, fear and hope all happen inside the heart.' },
        { q: 'What did Abu Bakr say he had left for his family?', a: 'Allah and His Messenger', w: ['Half of his wealth', 'His house and his camels'], why: 'He gave everything he had, trusting Allah completely.' },
        { q: 'How can eating a meal become worship?', a: 'By eating halal food and praising Allah for it', w: ['By eating as much as possible', 'It cannot be worship'], why: 'Sahih Muslim 2734: Allah is pleased with a servant who eats and praises Him.' },
      ],
    },
    {
      type: 'write', h: 'Activity: change the intention', lines: 8,
      prompt: 'Write a sincere intention that turns each of these into worship: studying for a test, doing homework, taking a nap, playing a sport, eating a meal, helping at home.',
    },
    {
      type: 'write', h: 'Reflect and think', lines: 5,
      prompt: 'Which kind of heart or tongue worship is easiest for you? Which do you find hardest? How can you improve it this week?',
    },
  ],
};

const u3review = {
  title: 'Unit Three review',
  pages: [
    {
      type: 'read', h: 'Words to know',
      text: [
        { table: [
          ['Word', 'Arabic', 'Meaning'],
          ['Ibadah', 'عِبَادَة', 'Worship and obedience to Allah alone'],
          ['Ikhlas', 'إِخْلَاص', 'Sincerity: doing good deeds only for Allah'],
          ['Sunnah', 'سُنَّة', 'The way of the Prophet ﷺ in his words and actions'],
          ['Niyyah', 'نِيَّة', 'Intention: the reason behind our actions'],
          ['Riya', 'رِيَاء', 'Showing off: doing good deeds for people\'s praise'],
          ['Tawakkul', 'تَوَكُّل', 'Trusting Allah and relying on Him alone'],
        ] },
        'Look over these six words before the test.',
        'Each of them came up in more than one lesson, so try to think of an example from your own life for each word, as well as its meaning.',
      ],
    },
    {
      type: 'order', h: 'How it all connects', prompt: 'Tap the steps in order, from worship to its result.',
      items: ['We worship Allah alone in everything we do and say', 'We make our intention only for Allah', 'We follow the Prophet\'s example ﷺ', 'Allah accepts our worship and blesses us'],
    },
    {
      type: 'quiz', h: 'True or false',
      items: [
        tf('We should do good deeds only for Allah\'s pleasure.', true, 'That is ikhlas.'),
        tf('Riya means doing good deeds to get people\'s praise.', true, 'Riya is showing off, and it spoils the deed.'),
        tf('Following the Sunnah does not matter as long as our intention is good.', false, 'Worship needs both: sincerity and following the Sunnah.'),
        tf('Tawakkul means relying on Allah after doing our part.', true, 'We take the means and trust Allah with the result.'),
      ],
    },
    {
      type: 'write', h: 'Review questions', lines: 10,
      prompt: 'Answer in your own words. What does it mean to worship Allah alone? Why is ikhlas important? What is niyyah, and how does it affect our deeds? What is the difference between ikhlas and riya? How can we follow the Sunnah in daily life?',
    },
  ],
};

const u3test = {
  title: 'Unit Three test', test: true,
  pages: [
    {
      type: 'read', h: 'Before you start',
      text: ['This test covers Unit Three: worship, sincerity, following the Messenger ﷺ and the types of worship. Do your best and trust Allah.'],
    },
    {
      type: 'match', h: 'Part A: vocabulary',
      pairs: [['Ibadah', 'Worship of Allah alone'], ['Ikhlas', 'Doing deeds only for Allah'], ['Sunnah', 'The way of the Prophet ﷺ'], ['Niyyah', 'Intention'], ['Riya', 'Showing off'], ['Tawakkul', 'Relying on Allah']],
    },
    {
      type: 'quiz', h: 'Part B: multiple choice',
      items: [
        { q: 'What does it mean to worship Allah alone?', a: 'Giving every act of worship to Allah and no one else', w: ['Doing good deeds for people', 'Asking others instead of Allah', 'Hoping for rewards from people'], why: 'That is Tawheed al-Uluhiyyah.' },
        { q: 'What is ikhlas?', a: 'Doing deeds only for Allah', w: ['Praying many extra prayers', 'Showing off good deeds', 'Trusting in Allah'], why: 'Ikhlas is sincerity.' },
        { q: 'Who is the best example for us to follow in worship?', a: 'The Prophet ﷺ', w: ['Our friends', 'Famous people', 'Whoever is popular'], why: 'Surah al-Ahzab 33:21.' },
        { q: 'Which of these is NOT worship?', a: 'Bragging about good deeds', w: ['Prayer', 'Fasting', 'Helping parents'], why: 'Bragging is riya. It spoils good deeds.' },
        { q: 'Why should we avoid riya?', a: 'It is a sin and takes away the reward', w: ['Because people will be happy', 'Because good deeds are hard', 'Because smiling is not allowed'], why: 'Allah leaves the deed done for someone else (Sahih Muslim 2985).' },
        { q: 'What does tawakkul mean?', a: 'Doing our best and trusting Allah\'s plan', w: ['Doing nothing and waiting', 'Relying on people instead of Allah', 'Praying only when we need something'], why: '"Tie it, and trust in Allah."' },
      ],
    },
    {
      type: 'quiz', h: 'Part C: true or false',
      items: [
        tf('Worship means obeying Allah alone and doing what He loves.', true, 'Ibadah covers everything Allah loves and is pleased with.'),
        tf('Ikhlas means doing good deeds to show off to people.', false, 'That is riya. Ikhlas is the opposite.'),
        tf('We should follow the Sunnah of the Prophet ﷺ in our worship.', true, '"Pray as you have seen me pray."'),
        tf('Riya is doing good deeds to gain people\'s praise.', true, 'Riya is showing off.'),
        tf('Tawakkul means relying on Allah after doing our best.', true, 'Effort and trust go together.'),
      ],
    },
    {
      type: 'write', h: 'Part D: short answers', lines: 8,
      prompt: '1. Give two examples of everyday actions that can become worship when done for Allah. 2. Name the four types of worship (heart, tongue, body, wealth) and explain each one briefly.',
    },
  ],
};

// ── Unit Four: Tawheed al-Asma was-Sifat ──
const u4l1 = {
  title: '4.1 Allah\'s beautiful Names', ar: 'أَسْمَاءُ ٱللَّهِ ٱلْحُسْنَىٰ',
  pages: [
    {
      type: 'read', h: 'Unit Four: Tawheed al-Asma was-Sifat', img: IMG(46),
      text: [
        'In this unit you will come to know Allah through His beautiful Names and perfect Attributes.',
        'You will learn why His Names matter and how to understand His Attributes correctly, without comparing Allah to anything He created. You will also see how knowing His Names improves our worship and our character.',
        { list: ['Lesson 1: Allah\'s beautiful Names', 'Lesson 2: Understanding Allah\'s Attributes', 'Lesson 3: Living by the Names of Allah', 'Lesson 4: Names that strengthen faith', 'Unit Four test'] },
      ],
    },
    {
      type: 'read', h: 'Lesson objectives', img: IMG(47),
      text: [
        'By the end of this lesson you will be able to:',
        { list: ['define al-Asma al-Husna, the most beautiful Names', 'explain why Allah\'s Names are perfect', 'connect learning the Names with worship'] },
      ],
    },
    { type: 'ayah', s: 7, a: 180, w: [1, 5], en: 'And to Allah belong the most beautiful Names, so call on Him by them.' },
    {
      type: 'hadith',
      ar: 'إِنَّ لِلَّهِ تِسْعَةً وَتِسْعِينَ اسْمًا، مِائَةً إِلَّا وَاحِدًا، مَنْ أَحْصَاهَا دَخَلَ الْجَنَّةَ',
      en: 'Allah has ninety-nine Names, one hundred less one. Whoever preserves them will enter Paradise.',
      src: 'Sahih al-Bukhari 2736 and Sahih Muslim 2677',
      text: ['"Preserving" the Names means more than memorising a list. Ibn al-Qayyim explained it in three steps: learning the Names, understanding their meanings, and calling on Allah by them in our worship.'],
    },
    {
      type: 'read', h: 'What is a Name of Allah?',
      text: [
        'A Name of Allah (ism) is a word that describes Him with one of His perfect qualities. His Names are perfect, and they never change. Each one teaches us something about Him.',
        { list: [
          'They show us who He is and what He does. Ar-Rahman, the Most Merciful, shows His endless mercy.',
          'They guide our actions. Al-\'Adl, the Just, teaches us to be fair.',
          'They help us worship Him with love, hope and trust.',
        ] },
        'These Names belong to Allah alone. Nothing and no one can share them with Him in their perfect meaning.',
      ],
      words: [{ w: 'ism', m: 'a name' }],
    },
    {
      type: 'read', h: 'Four Names to begin with',
      text: [
        { table: [
          ['Name', 'Arabic', 'Meaning', 'What it means for me'],
          ['Ar-Rahman', 'ٱلرَّحْمَٰن', 'The Most Merciful: His mercy covers everyone.', 'I show kindness and care to others, especially those in need.'],
          ['Al-Ghafur', 'ٱلْغَفُور', 'The Most Forgiving: He forgives our mistakes when we turn back to Him.', 'I repent sincerely, and I forgive others when they make mistakes.'],
          ['Al-\'Alim', 'ٱلْعَلِيم', 'The All-Knowing: He knows everything in the heavens, the earth and our hearts.', 'I do my best and rely on Allah, who knows what is best.'],
          ['As-Sami\'', 'ٱلسَّمِيع', 'The All-Hearing: He hears every sound, every word and every du\'a.', 'I speak carefully and kindly, knowing He always hears me.'],
        ] },
      ],
    },
    {
      type: 'read', h: 'Aisha and the All-Knowing',
      text: [
        'Aisha loved learning about Allah. One day her teacher wrote Al-\'Alim, the All-Knowing, on the board. Aisha put up her hand. "Does Allah know everything?" she asked.',
        '"Yes," said her teacher. "Allah knows what is in the skies and on the earth. He knows what we say and what we feel, even our hidden thoughts."',
        'Aisha thought for a moment. "So He knows when I am happy to help my friend, and when I am feeling sad?"',
        '"Yes. That is why we can always talk to Him. He understands us completely."',
        'Aisha smiled. "Alhamdulillah. Knowing that makes me feel safe. It also reminds me to do what is good."',
      ],
    },
    {
      type: 'read', h: 'How the Names change our hearts',
      text: [
        { table: [
          ['Feeling', 'Where it comes from'],
          ['Hope', 'Knowing Allah is Ar-Rahman fills us with hope in His endless mercy.'],
          ['Fear', 'Knowing Allah is Al-\'Alim reminds us He sees everything, so we stay away from wrong.'],
          ['Gratitude', 'Knowing Allah gives and provides helps us thank Him for every blessing.'],
          ['Humility', 'Knowing Allah is Al-Ghafur teaches us to be humble and ask for His forgiveness.'],
        ] },
      ],
    },
    {
      type: 'match', h: 'Match the Names with their meanings',
      pairs: [['Ar-Rahman', 'The Most Merciful'], ['Al-Ghafur', 'The Most Forgiving'], ['Al-\'Alim', 'The All-Knowing'], ['As-Sami\'', 'The All-Hearing'], ['Al-Qadir', 'The All-Powerful'], ['As-Salam', 'The Source of Peace']],
    },
    {
      type: 'quiz',
      items: [
        { q: 'What does al-Asma al-Husna mean?', a: 'The most beautiful Names', w: ['The hardest words', 'The names of the prophets'], why: 'Asma means names. Husna means most beautiful.' },
        { q: 'What does "preserving" Allah\'s Names include?', a: 'Learning them, understanding them and calling on Allah by them', w: ['Only writing them on a poster', 'Saying them very fast'], why: 'Ibn al-Qayyim explained it in these three steps.' },
        { q: 'Knowing that Allah is As-Sami\' should make us:', a: 'Careful about what we say', w: ['Shout our du\'a', 'Stop making du\'a'], why: 'Allah hears every word, so we choose good words.' },
      ],
    },
    {
      type: 'write', h: 'My Asma al-Husna learning card', lines: 8,
      prompt: 'Choose one beautiful Name of Allah. Write the Name, its meaning in English, what it teaches us about Allah, and one action you will do this week because of it.',
    },
    {
      type: 'write', h: 'Think and reflect', lines: 5,
      prompt: 'Which of these four Names do you find most comforting, and why? How does learning the Names of Allah help you grow closer to Him?',
    },
  ],
};

const u4l2 = {
  title: '4.2 Understanding Allah\'s Attributes', ar: 'صِفَاتُ ٱللَّه',
  pages: [
    {
      type: 'read', h: 'Lesson objectives', img: IMG(51),
      text: [
        'By the end of this lesson you will be able to:',
        { list: ['explain what an Attribute of Allah is', 'understand that Allah\'s Attributes are perfect', 'avoid comparing Allah to His creation'] },
      ],
    },
    { type: 'ayah', s: 42, a: 11, w: [17, 23], en: 'There is nothing like Him, and He is the All-Hearing, the All-Seeing.' },
    {
      type: 'read', h: 'Allah is not like His creation',
      text: [
        'An Attribute (sifah) is a quality that Allah has told us about Himself, such as His hearing, His sight, His knowledge, His mercy and His power.',
        'Allah\'s Attributes are perfect. They are not like the qualities of human beings. He hears, but not with ears like ours. He sees, but not with eyes like ours. He knows without ever having to learn. He is powerful without any weakness.',
        { table: [
          ['Allah\'s perfect Attribute', 'The limited human quality'],
          ['Al-\'Alim, the All-Knowing', 'Humans learn slowly and forget.'],
          ['As-Sami\', the All-Hearing', 'Humans hear with ears and miss sounds.'],
          ['Al-Basir, the All-Seeing', 'Humans see with eyes and cannot see everything.'],
          ['Ar-Rahim, the Most Merciful', 'Human mercy can be weak and can change.'],
          ['Al-Qadir, the All-Powerful', 'Humans are weak and need help.'],
        ] },
      ],
      words: [{ w: 'sifah', m: 'an Attribute: a quality Allah has told us He has' }],
    },
    { type: 'ayah', s: 112, a: 4, en: 'And there is none equal to Him.' },
    {
      type: 'read', h: 'Four mistakes to avoid',
      text: [
        'Ahl as-Sunnah believe in every Name and Attribute that Allah and His Messenger ﷺ told us about. We affirm them as they came, and we stay away from four mistakes.',
        { table: [
          ['Mistake', 'What it means'],
          ['Tahrif', 'Changing the meaning of an Attribute into something else'],
          ['Ta\'til', 'Denying an Attribute that Allah has affirmed'],
          ['Takyif', 'Asking "how?" and trying to describe exactly how an Attribute is'],
          ['Tamthil', 'Saying that an Attribute of Allah is like that of a creation'],
        ] },
        { note: { h: 'Why we do not imagine', t: 'We believe in Allah\'s Attributes because He told us about them. We do not imagine how they are, because they are perfect and beyond our understanding. Picturing them like the qualities of creation would make Allah like His creation, and that is wrong.' } },
      ],
    },
    {
      type: 'read', h: 'How do we learn about Allah\'s Attributes?',
      text: [
        { table: [
          ['Source', 'What it gives us'],
          ['The Qur\'an', 'Allah tells us about Himself in His own words. We read, understand and believe.'],
          ['The authentic Sunnah', 'The Prophet ﷺ taught us about Allah. His words and actions explain the Qur\'an.'],
          ['Reflecting on creation', 'Creation shows Allah\'s power and wisdom. It does not tell us how He is or what He is like.'],
        ] },
      ],
    },
    { type: 'ayah', s: 3, a: 190, en: 'Indeed, in the creation of the heavens and the earth and the alternation of the night and the day are signs for people of understanding.' },
    {
      type: 'read', h: 'The child who asked a big question',
      text: [
        'A young boy looked up at the night sky. "What does Allah look like?" he asked his teacher.',
        '"That is a big question," she said gently. "Allah is not like anything we can see. He made everything, and nothing is like Him."',
        '"Then how do we know about Him?" asked the boy.',
        '"Allah tells us about Himself in the Qur\'an. The Prophet ﷺ teaches us in the Sunnah. And we reflect on what He created."',
        'The boy nodded. "So we believe what Allah and His Messenger told us, and we love Him with our hearts."',
        '"Exactly," said his teacher.',
      ],
    },
    {
      type: 'sort', h: 'Attribute or creation?', prompt: 'Does each sentence describe Allah, or human beings?',
      groups: ['Allah (Attribute)', 'Humans (creation)'],
      items: [
        ['Knows everything perfectly', 0], ['May forget or not know', 1], ['His mercy is endless and perfect', 0], ['Can be kind in their own small way', 1],
        ['His power has no limit', 0], ['Have strength, but it runs out', 1], ['Hears every du\'a at the same moment', 0], ['Need sleep and rest', 1],
      ],
    },
    {
      type: 'quiz',
      items: [
        { q: 'What does "There is nothing like Him" (42:11) teach us?', a: 'Allah\'s Attributes are not like anything in creation', w: ['Allah has no Attributes', 'Allah is like a very strong person'], why: 'The same ayah also says He is the All-Hearing, the All-Seeing. We affirm the Attributes without likening them to creation.' },
        { q: 'Which mistake is "trying to describe exactly how an Attribute is"?', a: 'Takyif', w: ['Tahrif', 'Ta\'til'], why: 'Takyif means asking "how". Only Allah knows how His Attributes are.' },
        { q: 'Which source does NOT tell us how Allah is?', a: 'Looking at creation', w: ['The Qur\'an', 'The authentic Sunnah'], why: 'Creation shows His power and wisdom, but only revelation tells us about His Attributes.' },
      ],
    },
    {
      type: 'write', h: 'Think and write', lines: 6,
      prompt: 'Complete these sentences. "Allah is unlike His creation because..." "Learning Allah\'s Attributes helps me to..."',
    },
  ],
};

const u4l3 = {
  title: '4.3 Living by the Names of Allah',
  pages: [
    {
      type: 'read', h: 'Lesson objectives', img: IMG(55),
      text: [
        'Knowing Allah\'s Names is the first step. Then we live by them.',
        'By the end of this lesson you will be able to:',
        { list: ['connect Allah\'s Names with worship', 'build mercy, honesty, gratitude and patience', 'choose actions guided by faith'] },
      ],
    },
    {
      type: 'read', h: 'Knowledge should change us',
      check: 'As-Sabur is in the list of names in Jami at-Tirmidhi 3507, whose list is weak. That Allah is patient is affirmed in Sahih al-Bukhari 6099 ("No one is more patient with harmful words than Allah"). A teacher may prefer to teach Al-Halim (the Forbearing, Qur\'an 2:235) here.',
      text: [
        'When we learn the Names of Allah, we let them guide our hearts and our actions.',
        { table: [
          ['Name', 'Arabic', 'Meaning', 'Our response'],
          ['Ar-Rahman', 'ٱلرَّحْمَٰن', 'The Most Merciful', 'Be kind and show mercy to others.'],
          ['Al-Ghafur', 'ٱلْغَفُور', 'The Most Forgiving', 'Ask for forgiveness, and forgive others.'],
          ['Ash-Shakur', 'ٱلشَّكُور', 'The Most Appreciative', 'Thank Allah often and be grateful.'],
          ['As-Sabur', 'ٱلصَّبُور', 'The Most Patient', 'Be patient in hard times.'],
        ] },
      ],
    },
    {
      type: 'read', h: 'When I know Allah is Al-Ghafur and Ash-Shakur',
      text: [
        { note: { h: 'Al-Ghafur, the Forgiving', t: 'He forgives our mistakes when we are sorry. So I will say sorry when I get something wrong. I will forgive others, and ask Allah for forgiveness every day.' } },
        { note: { h: 'Ash-Shakur, the Most Appreciative', t: 'He rewards even the smallest good deed. So I will thank Allah for His many gifts with my words and my actions, and try to do more good.' } },
        'A teacher once saw a boy upset because his friend had knocked over his tower of blocks. She reminded him that Allah is Ar-Rahman, the Most Merciful, who is kind to us all the time. The boy took a deep breath and forgave his friend. Then he helped him build the tower again.',
      ],
    },
    {
      type: 'read', h: 'When I know Allah is patient',
      text: [
        'Allah is never in a hurry. He gives each thing its right time, and He is with those who are patient. So when things are hard, I will be patient. I will work calmly and trust Allah\'s timing.',
        'Yusuf planted seeds in his field. Some days were hot and some days it rained. He wanted the plants to grow quickly, but they did not. He kept watering and caring for them. Weeks later his field was green.',
        { note: { h: 'Practise sabr', t: 'Pause and take a breath. Ask Allah for patience. Choose a good response. Then keep trying.' } },
      ],
    },
    { type: 'ayah', s: 2, a: 153, en: 'O you who believe, seek help through patience and prayer. Indeed, Allah is with the patient.' },
    {
      type: 'read', h: 'Do not claim Allah\'s Names for yourself',
      text: [
        'Allah\'s Names are perfect, and their full meaning belongs to Him alone. Some Names, like Allah and Ar-Rahman, may not be given to any person at all. That is why Muslims name their children Abdullah and Abd ar-Rahman: servant of Allah, servant of the Most Merciful.',
        'People can show a little mercy and learn a few things. They are never perfect the way Allah is.',
        { table: [
          ['', 'Allah', 'We'],
          ['Mercy', 'His mercy is endless and perfect.', 'We can be kind and caring to others.'],
          ['Knowledge', 'He knows everything, past, present and future.', 'We can learn and seek knowledge.'],
          ['Forgiveness', 'He forgives completely and accepts repentance.', 'We can forgive others when they are sorry.'],
        ] },
      ],
    },
    {
      type: 'quiz', h: 'Which Name helps me here?',
      items: [
        { q: 'Your little brother broke your toy by accident.', a: 'Al-Ghafur: I forgive him, because Allah forgives me', w: ['As-Sami\': I tell everyone what he did', 'Ash-Shakur: I thank him for breaking it'], why: 'Knowing that Allah forgives us helps us forgive others.' },
        { q: 'Your friend is sad after a bad day.', a: 'Ar-Rahman: I show her mercy and comfort her', w: ['Al-\'Alim: I tell her I knew it would happen', 'As-Sabur: I ignore her until she feels better'], why: 'Allah\'s mercy reminds us to be merciful.' },
        { q: 'You received a gift you really wanted.', a: 'Ash-Shakur: I thank Allah and the person who gave it', w: ['Al-Ghafur: I ask for forgiveness', 'As-Sabur: I wait before opening it'], why: 'Gratitude is the response to a blessing.' },
        { q: 'You have to wait a long time in a queue.', a: 'As-Sabur: I stay calm and wait patiently', w: ['Ar-Rahman: I push to the front', 'Al-\'Alim: I complain loudly'], why: 'Patience is the response to waiting and hardship.' },
        { q: 'You promised your parents you would tidy your room.', a: 'Al-\'Alim: Allah knows whether I keep my promise', w: ['Al-Ghafur: I can break promises because Allah forgives', 'As-Sami\': promises do not matter'], why: 'Allah knows everything, even when no one else is checking.' },
      ],
    },
    {
      type: 'write', h: 'Name of Allah, action of mine', lines: 8,
      prompt: 'For each situation, write the Name of Allah that can help you and the action you will take. 1. A friend did not invite me to play. 2. I broke something by accident. 3. My test result was better than I expected. 4. Someone said something unkind to me and I feel angry.',
    },
    {
      type: 'write', h: 'This week I will', lines: 4,
      prompt: 'Choose one action to practise this week to please Allah, using one of the Names from this lesson.',
    },
  ],
};

const u4l4 = {
  title: '4.4 Names that strengthen faith',
  pages: [
    {
      type: 'read', h: 'Lesson objectives', img: IMG(61),
      text: [
        'Allah\'s beautiful Names tell us who He is and how He cares for us. When we know and remember them, our faith grows and we feel close to Him.',
        'By the end of this lesson you will be able to:',
        { list: ['explain how Allah\'s Names strengthen faith', 'connect Allah\'s Names with hope and fear', 'use Allah\'s Names in hard times and in times of gratitude'] },
      ],
    },
    {
      type: 'read', h: 'Four more Names',
      text: [
        { table: [
          ['Name', 'Arabic', 'Meaning', 'How it strengthens my faith'],
          ['Al-Hafiz', 'ٱلْحَفِيظ', 'The Preserver: He protects and keeps everything safe.', 'I feel safe knowing Allah watches over me.'],
          ['Al-Wakil', 'ٱلْوَكِيل', 'The Trustee: He takes care of every affair.', 'I rely on Allah for what I cannot control.'],
          ['Al-Muqit', 'ٱلْمُقِيت', 'The Sustainer: He gives us everything we need.', 'I am grateful for His daily blessings and I do not waste them.'],
          ['Al-Mujib', 'ٱلْمُجِيب', 'The One who answers: He hears our du\'a and responds.', 'I make du\'a with hope, believing He will answer in the best way.'],
        ] },
      ],
    },
    { type: 'ayah', s: 2, a: 186, w: [1, 12], en: 'And when My servants ask you about Me, I am near. I answer the call of the caller when he calls on Me.' },
    {
      type: 'read', h: 'Trusting Allah on a difficult day',
      text: [
        'Yusuf had a big test, but he had forgotten to study. He felt worried.',
        'He decided to do his best. He studied carefully and asked his teacher for help.',
        'Then he turned to Allah and said, "Ya Allah, help me do my best."',
        'He remembered that Allah is Al-Wakil, the Trustee. Whatever the result, Allah is in control. Yusuf felt calm, because he had done his part and trusted Allah with the rest.',
      ],
    },
    {
      type: 'order', h: 'What did Yusuf do?', prompt: 'Put Yusuf\'s steps in order.',
      items: ['He saw the problem and felt worried', 'He took responsible steps and studied', 'He made du\'a to Allah', 'He remembered Al-Wakil and trusted the result to Allah'],
    },
    { type: 'ayah', s: 65, a: 3, w: [7, 12], en: 'And whoever relies on Allah, He is enough for him.' },
    {
      type: 'read', h: 'Hope and fear',
      text: [
        { note: { h: 'Hope in Allah', t: 'We always hope in Allah\'s mercy. Allah wants good for us. Hope keeps us positive and patient. It stops us giving up, and it helps us believe Allah can make things better.' } },
        { note: { h: 'Fear that guides us', t: 'We fear displeasing Allah and we fear His punishment. This fear keeps us away from sin and bad choices. It makes us respect Allah and His rules, and it protects our hearts.' } },
        'A believer keeps both together. Hope without fear makes a person careless about sin. Fear without hope makes a person give up. With both, we keep doing good and keep asking for forgiveness.',
      ],
    },
    {
      type: 'read', h: 'Du\'a, effort and trust',
      text: [
        'Tawakkul means relying on Allah while taking the right steps. It has three parts:',
        { list: ['Make du\'a: turn to Allah and ask Him with hope.', 'Take the right steps: work hard, be responsible and do what is right.', 'Trust the result: leave it to Allah, who knows what is best.'], numbered: true },
      ],
    },
    {
      type: 'match', h: 'Activity 1: match the Names of Allah',
      pairs: [['Al-Hakim', 'The All-Wise'], ['Al-Qadir', 'The All-Powerful'], ['Al-Ghafur', 'The Forgiving'], ['Al-Wakil', 'The Trustee, who takes care of us'], ['Al-Hafiz', 'The Preserver'], ['Al-Mujib', 'The One who answers du\'a']],
    },
    {
      type: 'quiz', h: 'Activity 2: choose the best way',
      items: [
        { q: 'You have a big test next week and you feel worried.', a: 'Revise, make du\'a and trust Allah with the result', w: ['Do nothing because Allah will decide anyway', 'Worry so much that you cannot study'], why: 'That is tawakkul: effort, du\'a and trust.' },
        { q: 'You did not win the game and you want to give up.', a: 'Be patient, keep practising and hope in Allah', w: ['Quit and never play again', 'Blame your team'], why: 'Hope in Allah keeps us going.' },
        { q: 'A friend is upset and you want to help.', a: 'Listen kindly, help where you can and make du\'a for them', w: ['Tell them to stop being upset', 'Walk away'], why: 'Allah is Al-Mujib. Our du\'a for others is worship too.' },
      ],
    },
    {
      type: 'write', h: 'Activity 3: my du\'a and my steps', lines: 7,
      prompt: 'Write a short du\'a you will make to Allah about something you care about. Then write what you can control (your effort) and what you leave to Allah. Finish with one step you will take.',
    },
  ],
};

const u4test = {
  title: 'Unit Four test', test: true,
  pages: [
    {
      type: 'read', h: 'Unit Four review',
      text: [
        { table: [
          ['Topic', 'What we learned'],
          ['Asma al-Husna', 'Allah has the most beautiful Names. They show us who He is.'],
          ['Perfect Attributes (sifat)', 'Allah\'s Attributes are perfect and are not like those of creation.'],
          ['Living by the Names', 'Knowing Allah\'s Names helps us worship and obey Him better.'],
          ['Hope and fear', 'We hope for Allah\'s mercy and fear His punishment.'],
          ['Du\'a and tawakkul', 'We ask Allah with du\'a, do our part, and trust Him.'],
        ] },
        'Read each question carefully. Do your best and trust Allah.',
      ],
    },
    {
      type: 'match', h: 'Part A: vocabulary',
      pairs: [['Al-Wakil', 'The Trustee, who takes care of all affairs'], ['Ar-Razzaq', 'The Provider'], ['Tawakkul', 'Trusting Allah while doing your part'], ['Du\'a', 'Asking Allah for help'], ['Raja\' (hope)', 'Expecting good from Allah\'s mercy'], ['Khawf (fear)', 'A feeling that keeps us away from sin']],
    },
    {
      type: 'quiz', h: 'Part B: multiple choice',
      items: [
        { q: 'Which Name of Allah means "the Trustee"?', a: 'Al-Wakil', w: ['Al-\'Alim', 'Al-Qadir'], why: 'Al-Wakil takes care of every affair of those who rely on Him.' },
        { q: 'Which Name means that Allah provides for all His creation?', a: 'Ar-Razzaq', w: ['Al-Hakim', 'Al-Malik'], why: 'Ar-Razzaq is the Provider.' },
        { q: 'When we hope in Allah\'s mercy, we should:', a: 'Do good and ask for His forgiveness', w: ['Sin more because He forgives', 'Ignore His rules'], why: 'Real hope leads to good deeds, not carelessness.' },
        { q: 'Which shows fear of Allah?', a: 'Avoiding wrong because Allah sees', w: ['Doing good only for praise', 'Hiding sins from people'], why: 'Fear of Allah keeps us from sin even when no one else is watching.' },
        { q: 'What is the best meaning of tawakkul?', a: 'Trusting Allah and doing our best', w: ['Doing nothing and waiting', 'Only making du\'a and not acting'], why: 'Effort and trust go together.' },
      ],
    },
    {
      type: 'quiz', h: 'Part C: true or false',
      items: [
        tf('Allah has Names and Attributes that are perfect.', true, 'His Names are the most beautiful, and His Attributes have no flaw.'),
        tf('Allah is like His creation in some ways.', false, '"There is nothing like Him" (42:11).'),
        tf('If we trust Allah, we should still do our part.', true, '"Tie it, and trust in Allah."'),
        tf('Hope in Allah means we can ignore His rules.', false, 'Hope comes with obedience and repentance.'),
        tf('Fear of Allah helps us stay away from sins.', true, 'That is the purpose of healthy fear.'),
      ],
    },
    {
      type: 'write', h: 'Part D: short answers', lines: 9,
      prompt: '1. Why is Allah unlike His creation? 2. How does believing in Allah\'s Names and Attributes change our character? 3. How can we combine du\'a with responsible effort in daily life?',
    },
  ],
};

// ── Unit Five: Iman in practice, how Tawheed shapes character ──
const u5l1 = {
  title: '5.1 Tawheed gives us courage', ar: 'ٱلشَّجَاعَة',
  pages: [
    {
      type: 'read', h: 'Unit Five: the effects of Tawheed', img: IMG(67),
      text: [
        'In this unit you will learn how Tawheed, believing in One Allah, changes our hearts and our actions.',
        'You will see how it builds courage, gratitude and good character. It also teaches us to look after everything Allah has trusted us with.',
        { list: ['Lesson 1: Tawheed gives us courage', 'Lesson 2: Tawheed gives us gratitude', 'Lesson 3: Tawheed builds good character', 'Lesson 4: Tawheed and responsibility', 'Unit Five test'] },
      ],
    },
    {
      type: 'read', h: 'Lesson objectives', img: IMG(68),
      text: [
        'By the end of this lesson you will be able to:',
        { list: ['explain how belief in Allah gives courage', 'tell the difference between courage and recklessness', 'make brave choices while trusting Allah'] },
      ],
    },
    { type: 'ayah', s: 3, a: 175, w: [6, 11], en: 'So do not fear them, but fear Me, if you are believers.' },
    {
      type: 'read', h: 'What is true courage?',
      text: [
        'True courage (shaja\'ah) comes from believing in Allah. When we know that Allah is with us, our hearts become strong. We are not frightened of people, of hard tasks or of difficult times.',
        'Courage does not mean doing dangerous things or showing off. That is recklessness. Real courage is doing what is right, even when it is hard and even when others disagree.',
        { note: { h: 'Courage and tawakkul', t: 'When we rely on Allah, we find strength we did not know we had. With Tawheed and tawakkul, we can face anything with courage and calm.' } },
      ],
      words: [{ w: 'recklessness', m: 'doing something dangerous without thinking, often to show off' }],
    },
    {
      type: 'hadith', kicker: 'In the cave of Thawr, Abu Bakr said: "If one of them looked down at his feet, he would see us." The Prophet ﷺ said:',
      ar: 'مَا ظَنُّكَ يَا أَبَا بَكْرٍ بِاثْنَيْنِ اللَّهُ ثَالِثُهُمَا',
      en: 'O Abu Bakr, what do you think of two when Allah is the third of them?',
      src: 'Sahih al-Bukhari 3653 and Sahih Muslim 2381',
      text: ['The Prophet ﷺ and Abu Bakr were hiding from the people of Makkah, who were searching for them. The enemy stood right at the mouth of the cave. Allah tells us about this moment in the Qur\'an.'],
    },
    { type: 'ayah', s: 9, a: 40, w: [19, 23], en: 'Do not grieve; indeed Allah is with us.' },
    {
      type: 'hadith',
      ar: 'الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ، وَفِي كُلٍّ خَيْرٌ، احْرِصْ عَلَى مَا يَنْفَعُكَ، وَاسْتَعِنْ بِاللَّهِ وَلَا تَعْجِزْ',
      en: 'The strong believer is better and more beloved to Allah than the weak believer, and there is good in both. Be eager for what benefits you, seek Allah\'s help, and do not give up.',
      src: 'Sahih Muslim 2664',
    },
    {
      type: 'sort', h: 'Courage or recklessness?', prompt: 'Is each choice real courage, or recklessness?',
      groups: ['Courage', 'Recklessness'],
      items: [
        ['Telling the truth when you could get in trouble', 0], ['Jumping off a high wall to impress friends', 1], ['Standing up for a classmate who is being bullied', 0],
        ['Riding your bike on a busy road without a helmet', 1], ['Praying at school even if others stare', 0], ['Saying no when friends dare you to cheat', 0], ['Accepting a dangerous dare online', 1],
      ],
    },
    {
      type: 'quiz',
      items: [
        { q: 'Where does true courage come from?', a: 'Believing in Allah and trusting Him', w: ['Being the strongest person', 'Not caring about anything'], why: 'When we know Allah is with us, our hearts become strong.' },
        { q: 'What did the Prophet ﷺ say to Abu Bakr in the cave?', a: 'What do you think of two when Allah is the third of them?', w: ['Let us run away', 'We have no hope'], why: 'Sahih al-Bukhari 3653: even with the enemy outside, he trusted Allah completely.' },
        { q: 'Which is recklessness rather than courage?', a: 'Doing something dangerous to show off', w: ['Doing what is right when it is hard', 'Speaking the truth kindly'], why: 'Courage is doing what is right. Recklessness is taking pointless risks.' },
      ],
    },
    {
      type: 'write', h: 'Reflect and think', lines: 6,
      prompt: 'Think of a time when doing the right thing needed courage. What happened? How could trusting Allah help you be brave next time?',
    },
  ],
};

const u5l2 = {
  title: '5.2 Tawheed gives us gratitude', ar: 'ٱلشُّكْر',
  pages: [
    {
      type: 'read', h: 'Lesson objectives', img: IMG(69),
      text: [
        'By the end of this lesson you will be able to:',
        { list: ['explain shukr (gratitude) and qana\'ah (contentment)', 'show gratitude even in hard times', 'choose contentment instead of complaining'] },
      ],
    },
    {
      type: 'read', h: 'Words to know',
      text: [
        { table: [
          ['Word', 'Arabic', 'Meaning'],
          ['Shukr', 'شُكْر', 'Thanking Allah for His blessings'],
          ['Hamd', 'حَمْد', 'Praising Allah for who He is and what He does'],
          ['Qana\'ah', 'قَنَاعَة', 'Being content with what Allah has given'],
          ['Ni\'mah', 'نِعْمَة', 'A blessing from Allah'],
        ] },
      ],
    },
    { type: 'ayah', s: 14, a: 7, w: [1, 6], en: 'And when your Lord proclaimed: If you are grateful, I will surely give you more.' },
    {
      type: 'read', h: 'Gratitude during difficulty',
      text: [
        'Shukr does not mean pretending that a hard time is easy. When things are hard, we still trust Allah and stay thankful. We can show gratitude by:',
        { list: ['noticing the blessings we still have', 'making du\'a and asking Allah for ease', 'asking for help from Allah and from others', 'responding with sabr (patience) and a good heart'] },
        'Yusuf had a terrible week. He failed a test, his best friend moved away, and he felt tired and sad. That night he made a list of what was still good. He had loving parents. He was healthy. He could learn and try again. Allah was always with him.',
        'Yusuf made du\'a, asked for help with his studies and stayed patient. By the end of the week he felt stronger and more thankful.',
      ],
    },
    {
      type: 'read', h: 'Gratitude and contentment',
      text: [
        'Gratitude (shukr) is thanking Allah for what He has given us. Contentment (qana\'ah) is being happy with what Allah has chosen for us.',
        'Not every wish will come true. When we are grateful and content, our hearts are at peace and we stay close to Allah.',
      ],
    },
    {
      type: 'hadith',
      ar: 'انْظُرُوا إِلَى مَنْ أَسْفَلَ مِنْكُمْ، وَلَا تَنْظُرُوا إِلَى مَنْ هُوَ فَوْقَكُمْ، فَهُوَ أَجْدَرُ أَنْ لَا تَزْدَرُوا نِعْمَةَ اللَّهِ',
      en: 'Look at those who have less than you, and do not look at those who have more than you. That is better, so that you do not look down on Allah\'s blessings to you.',
      src: 'Sahih Muslim 2963',
    },
    {
      type: 'hadith',
      ar: 'لَيْسَ الْغِنَى عَنْ كَثْرَةِ الْعَرَضِ، وَلَكِنَّ الْغِنَى غِنَى النَّفْسِ',
      en: 'Being rich is not having many possessions. Being rich is being content in the soul.',
      src: 'Sahih al-Bukhari 6446 and Sahih Muslim 1051',
    },
    {
      type: 'sort', h: 'Contentment or complaining?', prompt: 'Is each response contentment or complaining?',
      groups: ['Contentment (qana\'ah)', 'Complaining'],
      items: [
        ['"I thank Allah for the toys I already have."', 0], ['"It\'s not fair! I want that one."', 1], ['"Alhamdulillah for the rain."', 0], ['"This weather is the worst!"', 1],
        ['"I\'ll try harder next time."', 0], ['"It\'s useless. I can\'t do anything."', 1], ['"I\'m happy for my friend."', 0], ['"Why are they always better than me?"', 1],
        ['"Helping at home is worship."', 0], ['"I always have to do everything!"', 1],
      ],
    },
    {
      type: 'hadith',
      ar: 'لَا يَشْكُرُ اللَّهَ مَنْ لَا يَشْكُرُ النَّاسَ',
      en: 'Whoever does not thank people has not thanked Allah.',
      src: 'Sunan Abi Dawud 4811 and Jami at-Tirmidhi 1954',
    },
    {
      type: 'quiz',
      items: [
        { q: 'What does Allah promise to those who are grateful?', a: 'He will give them more', w: ['Nothing changes', 'They will never have a hard day'], why: 'Surah Ibrahim 14:7.' },
        { q: 'Who is really rich, according to the hadith?', a: 'The person who is content in the soul', w: ['The person with the most money', 'The person with the biggest house'], why: 'Sahih al-Bukhari 6446.' },
        { q: 'You got a lower grade than you hoped. Which response shows qana\'ah?', a: '"Alhamdulillah, I will learn from it and try again."', w: ['"This is useless."', '"The teacher hates me."'], why: 'Contentment accepts what happened and keeps trying.' },
        { q: 'What is the difference between shukr and hamd?', a: 'Shukr is thanks for blessings; hamd is praising Allah for who He is', w: ['They are both types of fasting', 'Hamd is only said in Ramadan'], why: 'We praise Allah always, and we thank Him for each blessing.' },
      ],
    },
    {
      type: 'write', h: 'A week of shukr', lines: 10,
      prompt: 'For seven days, write one blessing from Allah, one sentence of praise to Allah, one person you thanked, and one action of gratitude. At the end of the week, write how gratitude changed your words, your choices and your mood.',
    },
  ],
};

const u5l3 = {
  title: '5.3 Tawheed builds good character', ar: 'ٱلْأَخْلَاق',
  pages: [
    {
      type: 'read', h: 'Lesson objectives', img: IMG(72),
      text: [
        'By the end of this lesson you will be able to:',
        { list: ['explain how Tawheed shapes character', 'connect worship with honesty, kindness, humility and trustworthiness', 'see good character as part of living Islam'] },
      ],
    },
    { type: 'ayah', s: 2, a: 195, w: [11, 16], en: 'And do good; indeed, Allah loves those who do good.' },
    {
      type: 'read', h: 'What does Tawheed teach us?',
      text: [
        'Tawheed means we believe that Allah alone is our Lord. When our hearts belong to Allah, our actions show it. Tawheed shapes our akhlaq, our character.',
        { list: [
          'Honesty: we tell the truth, even when no one is watching.',
          'Kindness: we treat others with care.',
          'Humility: we stay modest and do not look down on anyone.',
          'Trustworthiness (amanah): we keep our promises and can be relied on.',
        ] },
        'Good character is a sign of a strong connection with Allah.',
      ],
      words: [{ w: 'akhlaq', m: 'character: the way we think, speak and act' }, { w: 'humility', m: 'being modest and not thinking you are better than others' }],
    },
    {
      type: 'hadith',
      ar: 'أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا',
      en: 'The most complete of the believers in faith are those with the best character.',
      src: 'Sunan Abi Dawud 4682 and Jami at-Tirmidhi 1162',
    },
    {
      type: 'read', h: 'Belief and character',
      text: [
        { table: [
          ['Belief', 'The character it builds'],
          ['Allah sees me.', 'Honesty: I am truthful because Allah sees me.'],
          ['Prayer and obedience', 'Discipline: I obey Allah in prayer and in daily life.'],
          ['Gratitude to Allah', 'Kindness: I thank Allah and I am kind to others.'],
          ['Allah knows what is best.', 'Trust: I trust that Allah knows what is best for me.'],
          ['I will be asked about my deeds, and Allah is just.', 'Fairness and responsibility'],
        ] },
      ],
    },
    {
      type: 'read', h: 'The trustworthy classmate',
      text: [
        'At break time Ahmed found a wallet in the playground. Inside were some money and an ID card.',
        'He remembered that Allah sees everything, so he took the wallet straight to his teacher. The teacher found the owner, who was very grateful.',
        'Ahmed felt happy. He knew he had done the right thing, and that he had done it for Allah.',
      ],
    },
    {
      type: 'read', h: 'Small actions, great character',
      text: [
        { list: [
          'Greet others with as-salamu alaykum and a smile.',
          'Give back what you borrow.',
          'Use gentle words, not harsh ones.',
          'Do what you said you would do.',
          'Help your family with love.',
          'Say sorry when you are wrong, and try to do better.',
        ] },
      ],
    },
    {
      type: 'quiz', h: 'Character in action',
      items: [
        { q: 'You meet a classmate in the morning.', a: 'Say as-salamu alaykum with a smile', w: ['Ignore them', 'Make fun of them'], why: 'Spreading salam is a Sunnah and builds love between Muslims.' },
        { q: 'A friend lends you their pencil.', a: 'Return it on time', w: ['Keep it', 'Lose it on purpose'], why: 'What we borrow is an amanah.' },
        { q: 'Someone says something hurtful to you.', a: 'Speak gently', w: ['Shout back', 'Spread rumours about them'], why: 'A believer controls his tongue, because Allah hears every word.' },
        { q: 'You promised to finish your homework.', a: 'Do it and hand it in', w: ['Forget about it', 'Wait for someone to remind you'], why: 'Keeping promises is trustworthiness.' },
        { q: 'Your parents are busy and need help.', a: 'Offer to help', w: ['Watch TV', 'Leave the house'], why: 'Helping parents is worship and good character.' },
        { q: 'You break a glass by accident.', a: 'Admit it and clean it up', w: ['Hide it', 'Blame someone else'], why: 'Honesty comes from knowing Allah sees us.' },
      ],
    },
    {
      type: 'write', h: 'Reflect and think', lines: 6,
      prompt: 'How does believing in Tawheed help you make good choices? Which part of good character do you most want to grow in, and why?',
    },
  ],
};

const u5l4 = {
  title: '5.4 Tawheed and responsibility', ar: 'ٱلْأَمَانَة',
  pages: [
    {
      type: 'read', h: 'Lesson objectives', img: IMG(77),
      text: [
        'Because Allah is One and we worship Him alone, He has given us many trusts. He also holds us responsible for how we use them.',
        'By the end of this lesson you will be able to:',
        { list: ['understand amanah as a trust from Allah', 'explain that every choice will be asked about', 'practise responsible choices at home and at school'] },
      ],
    },
    {
      type: 'read', h: 'Words to know',
      text: [
        { table: [
          ['Word', 'Arabic', 'Meaning'],
          ['Amanah', 'أَمَانَة', 'A trust given to us by Allah, such as our body, our time, our family and our belongings'],
          ['Mas\'uliyyah', 'مَسْؤُولِيَّة', 'Responsibility: answering for our choices and using our trusts in ways that please Allah'],
          ['Hisab', 'حِسَاب', 'Being called to account by Allah for how we used our trusts'],
          ['Sidq', 'صِدْق', 'Truthfulness'],
          ['Tawbah', 'تَوْبَة', 'Turning back to Allah with regret, determined to do better'],
        ] },
        'A Muslim asks, "What can I do?" A Muslim also asks, "What has Allah trusted me with?"',
      ],
    },
    { type: 'ayah', s: 4, a: 58, w: [1, 8], en: 'Indeed, Allah commands you to give back trusts to those they belong to.' },
    {
      type: 'hadith',
      ar: 'كُلُّكُمْ رَاعٍ، وَكُلُّكُمْ مَسْئُولٌ عَنْ رَعِيَّتِهِ',
      en: 'Each of you is a shepherd, and each of you is responsible for his flock.',
      src: 'Sahih al-Bukhari 893 and Sahih Muslim 1829',
      text: ['A shepherd looks after sheep that are not his own. In the same way, we look after what Allah has trusted us with: our family, our things, our bodies and our time.'],
    },
    {
      type: 'read', h: 'Our first responsibility: worshipping Allah',
      text: [
        'Tawheed means worshipping Allah alone. It shapes every act of worship and makes us trustworthy servants.',
        { table: [
          ['Worship', 'What I do'],
          ['Salah', 'I pray only to Allah. Every rak\'ah is for Him.'],
          ['Du\'a', 'I call on Allah alone.'],
          ['Qur\'an', 'I read the Qur\'an for guidance and to come close to Allah.'],
          ['Sincerity', 'I do my worship for Allah, not for people.'],
          ['Obedience', 'I follow Allah\'s commands because I love and trust Him.'],
        ] },
      ],
    },
    { type: 'ayah', s: 40, a: 60, w: [1, 5], en: 'And your Lord says: Call on Me; I will answer you.' },
    {
      type: 'read', h: 'Time is an amanah',
      text: [
        'Time is one of the greatest trusts from Allah. Every hour is a chance to please Him. When we use our time well, we worship Allah, grow in knowledge, care for our families, rest properly and serve others.',
        'Rest is part of the plan too. A tired body cannot pray well, study well or help anyone.',
      ],
    },
    {
      type: 'hadith',
      ar: 'لَا تَزُولُ قَدَمَا عَبْدٍ يَوْمَ الْقِيَامَةِ حَتَّى يُسْأَلَ عَنْ عُمُرِهِ فِيمَا أَفْنَاهُ، وَعَنْ عِلْمِهِ فِيمَ فَعَلَ، وَعَنْ مَالِهِ مِنْ أَيْنَ اكْتَسَبَهُ وَفِيمَ أَنْفَقَهُ، وَعَنْ جِسْمِهِ فِيمَ أَبْلَاهُ',
      en: 'The feet of a servant will not move on the Day of Resurrection until he is asked about his life and how he spent it, his knowledge and what he did with it, his wealth and where he earned it and how he spent it, and his body and how he used it.',
      src: 'Jami at-Tirmidhi 2417',
    },
    {
      type: 'read', h: 'Responsible speech and choices',
      text: [
        'A believer knows that Allah sees every word and every choice. That includes how we speak face to face and how we behave online.',
        { list: ['Words: choosing what is true, kind and helpful', 'Promises: keeping what we commit to', 'Online: using technology with good manners and respect', 'Everyday choices: doing what pleases Allah in small ways and big ones'] },
        { table: [
          ['Situation', 'Responsible response'],
          ['A friend asks you to pass on a rumour.', 'I refuse to spread it. I say only what is true and helpful.'],
          ['You see something unkind online.', 'I do not like, comment on or share it. I report it if needed.'],
          ['You are angry and want to say harsh words.', 'I pause, breathe, and speak calmly.'],
          ['No one is watching and a wrong choice seems easy.', 'I remember that Allah always sees me.'],
        ] },
      ],
    },
    { type: 'ayah', s: 50, a: 18, en: 'He does not utter a word except that there is a watcher with him, ready to record.' },
    {
      type: 'hadith',
      ar: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
      en: 'Whoever believes in Allah and the Last Day, let him say something good or stay silent.',
      src: 'Sahih al-Bukhari 6018 and Sahih Muslim 47',
    },
    {
      type: 'read', h: 'Accountability is not fear alone',
      text: [
        'Believing that we will be asked about our deeds is a gift. It reminds us that every choice counts, because Allah sees and knows all we do. It helps us:',
        { list: ['think before we act', 'repent quickly when we make a mistake', 'put things right with Allah and with people', 'keep hoping in Allah\'s mercy, because He loves those who turn back to Him'] },
      ],
    },
    { type: 'ayah', s: 99, a: 7, en: 'So whoever does an atom\'s weight of good will see it.' },
    {
      type: 'sort', h: 'Excuse or responsibility?', prompt: 'Is each sentence an excuse, or taking responsibility?',
      groups: ['Excuse', 'Responsibility'],
      items: [
        ['"It wasn\'t my fault."', 0], ['"I made a mistake and I will fix it."', 1], ['"Everyone else was doing it."', 0], ['"I choose to do what is right."', 1],
        ['"You made me do it."', 0], ['"I\'m sorry. I will be more careful."', 1], ['"I can\'t change."', 0], ['"I will try, and ask Allah for help."', 1],
      ],
    },
    {
      type: 'order', h: 'My accountability pathway', prompt: 'Put the steps in order.',
      items: ['Notice: what is happening?', 'Remember: Allah sees and knows', 'Choose: which action is honest and kind?', 'Act: do it carefully, then look back'],
    },
    {
      type: 'order', h: 'The responsibility ladder', prompt: 'Put the steps of looking after a trust in order.',
      items: ['Receive the trust with gratitude', 'Understand what it is for', 'Care for it and keep it safe', 'Use it for good and allowed things', 'Return it in good condition, or keep caring for it'],
    },
    {
      type: 'quiz', h: 'What would a responsible Muslim do?',
      items: [
        { q: 'You borrowed a book from a friend and it is due back tomorrow.', a: 'Return it on time and in good condition', w: ['Keep it a bit longer', 'Lend it to someone else'], why: 'A borrowed item is an amanah.' },
        { q: 'You find some money in the classroom.', a: 'Give it to the teacher', w: ['Keep it, since no one saw', 'Spend it on snacks'], why: 'It is not yours. Allah sees.' },
        { q: 'A friend asks you to help hide a mistake.', a: 'Tell the truth kindly and help fix it', w: ['Lie for them', 'Blame someone else'], why: 'Truthfulness (sidq) is part of responsibility.' },
        { q: 'Your little sister asks for help with her homework.', a: 'Help her kindly', w: ['Say "I\'m busy" and walk away', 'Do it badly so she stops asking'], why: 'Family members have rights over us.' },
        { q: 'You see litter in the park on your way home.', a: 'Pick it up and put it in the bin', w: ['Ignore it', 'Kick it further away'], why: 'Looking after the earth is part of the amanah.' },
      ],
    },
    {
      type: 'write', h: 'Own it, fix it, learn from it', lines: 7,
      prompt: 'Think of a time you made a mistake. Own it: what happened? Fix it: what can you do to put it right? Learn from it: what will you remember for next time?',
    },
    {
      type: 'write', h: 'Reflect and act', lines: 5,
      prompt: 'What is one amanah Allah has given you? How will you use it to please Him this week? Write one du\'a asking Allah to make you a person of trust.',
    },
  ],
};

const u5test = {
  title: 'Unit Five test', test: true,
  pages: [
    {
      type: 'read', h: 'Unit Five review',
      text: [
        { list: ['Tawheed gives us courage.', 'Tawheed gives us gratitude.', 'Tawheed builds good character.', 'Tawheed teaches responsibility.'], numbered: true },
        'Look back over the words, the main ideas and your own actions. Then do your best and trust Allah.',
      ],
    },
    {
      type: 'match', h: 'Part A: vocabulary',
      pairs: [['Tawheed', 'Belief that Allah is One, and worshipping Him alone'], ['Shukr', 'Thanking Allah for His blessings'], ['Akhlaq', 'Good character in words and actions'], ['Amanah', 'A trust we must look after'], ['Qana\'ah', 'Being content with what Allah gives']],
    },
    {
      type: 'quiz', h: 'Part B: multiple choice',
      items: [
        { q: 'Belief in Allah gives us courage to:', a: 'Do what is right', w: ['Give up easily', 'Ignore others'], why: 'True courage is doing what is right, even when it is hard.' },
        { q: 'When we feel thankful for Allah\'s blessings, we should:', a: 'Say Alhamdulillah and use them well', w: ['Complain more', 'Waste them'], why: 'Shukr is in the heart, on the tongue and in how we use the blessing.' },
        { q: 'Good character means we should:', a: 'Be kind and honest', w: ['Lie to others', 'Look down on people'], why: '"The most complete believers in faith are those with the best character."' },
        { q: 'Responsibility means we should:', a: 'Do our part and keep promises', w: ['Blame others', 'Avoid work'], why: 'Each of us is a shepherd responsible for his flock.' },
        { q: 'Which is real courage?', a: 'Telling the truth when it may get you in trouble', w: ['Taking a dangerous dare', 'Showing off to friends'], why: 'Courage is doing what is right, not taking pointless risks.' },
      ],
    },
    {
      type: 'quiz', h: 'Part C: true or false',
      items: [
        tf('Belief in Allah helps us face difficult situations.', true, 'A heart that trusts Allah is strong.'),
        tf('We should only thank Allah when we get something we want.', false, 'We thank Allah in every situation, and we still have countless blessings in hard times.'),
        tf('Good character is part of living Islam.', true, 'The best believers are those with the best character.'),
        tf('Amanah means we are responsible for what we are given.', true, 'Every trust will be asked about.'),
        tf('If no one is watching, our choices do not count.', false, 'Allah always sees, and a watcher records every word (50:18).'),
      ],
    },
    {
      type: 'write', h: 'Part D: short answers', lines: 8,
      prompt: 'Write one example of each: courage that comes from belief in Allah; gratitude for a blessing; good character; looking after an amanah.',
    },
    {
      type: 'write', h: 'Part E: final reflection', lines: 4,
      prompt: 'One change I will make this week is...',
    },
  ],
};

// ── Unit Six: Tawheed in daily life ──
const u6l1 = {
  title: '6.1 Niyyah: the heart behind every action', ar: 'ٱلنِّيَّة',
  pages: [
    {
      type: 'read', h: 'Unit Six: Tawheed in daily life', img: IMG(87),
      text: [
        'Tawheed is something we learn, and it is also something we live. It touches every moment, every decision and every relationship, as we remember Allah and try to please Him.',
        { table: [
          ['Word', 'Arabic', 'Meaning'],
          ['Niyyah', 'نِيَّة', 'Intention'],
          ['Ihsan', 'إِحْسَان', 'Excellence: doing our best for Allah'],
          ['Tawakkul', 'تَوَكُّل', 'Relying on Allah'],
          ['Shukr', 'شُكْر', 'Gratitude'],
          ['Sabr', 'صَبْر', 'Patience that holds firm'],
        ] },
        { list: ['Lesson 1: Niyyah, the heart behind every action', 'Lesson 2: Ihsan, doing our best for Allah', 'Lesson 3: Tawakkul, trusting Allah while we act', 'Lesson 4: Shukr and sabr', 'Unit Six test'] },
      ],
    },
    {
      type: 'read', h: 'Lesson objectives', img: IMG(88),
      text: [
        'Intention gives an action its direction.',
        'By the end of this lesson you will be able to:',
        { list: ['define niyyah (intention)', 'understand that Allah knows the intention behind every action', 'practise making sincere intentions'] },
      ],
    },
    {
      type: 'hadith',
      ar: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
      en: 'Actions are only judged by intentions, and every person will have only what he intended.',
      src: 'Sahih al-Bukhari 1 and Sahih Muslim 1907',
    },
    {
      type: 'read', h: 'When the heart chooses',
      text: [
        'Niyyah is the intention in the heart before an action. It is the silent choice we make before we start. A sincere intention is made to please Allah.',
        'The same action can be worth a great deal or almost nothing, depending on the intention. When the niyyah is for Allah, even simple actions become worship.',
        { table: [
          ['Action', 'An unhelpful intention', 'A sincere intention'],
          ['Studying', 'I study to get good grades and show others I am clever.', 'I study to learn, to grow and to please Allah.'],
          ['Helping at home', 'I help so my family praises me, or so I do not get in trouble.', 'I help to make life easier for my family and to please Allah.'],
          ['Giving sadaqah', 'I give so people see me as kind and generous.', 'I give to help others and to please Allah.'],
        ] },
        { note: { h: 'Pause and ask', t: 'Who am I trying to please?' } },
      ],
    },
    {
      type: 'hadith',
      ar: 'إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ، وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ',
      en: 'Allah does not look at your appearance or your wealth. He looks at your hearts and your deeds.',
      src: 'Sahih Muslim 2564',
    },
    {
      type: 'match', h: 'Match each action with a sincere intention',
      pairs: [
        ['Studying for a test', 'To gain knowledge and benefit others'],
        ['Helping at home', 'To support my family and bring blessings'],
        ['Exercising', 'To keep my body healthy to serve Allah'],
        ['Sharing a snack', 'To be kind and strengthen brotherhood'],
        ['Tidying my desk', 'To make a clean space to focus'],
      ],
    },
    {
      type: 'quiz',
      items: [
        { q: 'What is niyyah?', a: 'The intention in the heart before an action', w: ['Saying the action out loud', 'The reward we get afterwards'], why: 'Niyyah lives in the heart. Allah knows it even when no one else does.' },
        { q: 'Two boys tidy their rooms. One does it to please Allah, the other so he is allowed to play. What is different?', a: 'Their intentions, and so their reward', w: ['Nothing at all', 'Only how tidy the rooms are'], why: '"Every person will have only what he intended."' },
        { q: 'What does Allah look at, according to Sahih Muslim 2564?', a: 'Our hearts and our deeds', w: ['How rich we are', 'How we look'], why: 'Appearance and wealth do not matter to Allah. The heart and the deeds do.' },
      ],
    },
    {
      type: 'write', h: 'Rewrite with a sincere intention', lines: 6,
      prompt: 'Write how you can do each of these to please Allah: doing homework, eating a meal, going to bed.',
    },
    {
      type: 'write', h: 'Yusuf helps Amin', lines: 6,
      prompt: 'Yusuf sees his classmate Amin stuck on a maths problem, and explains it to him during break. What might Yusuf\'s intention be? How could he make his intention better? Then set one sincere intention for your own day today.',
    },
  ],
};

const u6l2 = {
  title: '6.2 Ihsan: doing our best for Allah', ar: 'ٱلْإِحْسَان',
  pages: [
    {
      type: 'read', h: 'Lesson objectives', img: IMG(91),
      text: [
        'Excellence means doing what is right with care, even when no one is watching.',
        'By the end of this lesson you will be able to:',
        { list: ['define ihsan', 'recognise excellence in worship and daily work', 'choose one way to improve your effort'] },
      ],
    },
    {
      type: 'hadith', kicker: 'When Jibril asked the Prophet ﷺ what ihsan is, he said:',
      ar: 'أَنْ تَعْبُدَ اللَّهَ كَأَنَّكَ تَرَاهُ، فَإِنْ لَمْ تَكُنْ تَرَاهُ فَإِنَّهُ يَرَاكَ',
      en: 'That you worship Allah as though you see Him, and if you do not see Him, He surely sees you.',
      src: 'Sahih Muslim 8 and Sahih al-Bukhari 50',
    },
    {
      type: 'hadith',
      ar: 'إِنَّ اللَّهَ كَتَبَ الْإِحْسَانَ عَلَى كُلِّ شَيْءٍ',
      en: 'Allah has prescribed excellence in everything.',
      src: 'Sahih Muslim 1955',
    },
    {
      type: 'read', h: 'Excellence in ordinary moments',
      text: [
        'Ihsan means doing the best we can for Allah in every moment. It is for everyday life as well as for big occasions.',
        { table: [
          ['Setting', 'Ordinary effort', 'Excellent effort (ihsan)'],
          ['Salah', 'I pray on time and try to focus.', 'I pray calmly, with my mind present and full attention.'],
          ['Learning', 'I study my lessons and finish my homework.', 'I study with focus, understand deeply and ask good questions.'],
          ['Helping others', 'I help when someone asks me.', 'I look for ways to help before I am asked, and I do it kindly.'],
          ['Shared spaces', 'I do not make a mess.', 'I keep places clean, pick up litter and encourage others to care too.'],
        ] },
        { note: { h: 'Small moments, sincere heart', t: 'Allah sees the care we put into what we do. That care is ihsan.' } },
      ],
    },
    {
      type: 'quiz', h: 'Choose the better response',
      items: [
        { q: 'You are given a small task and no one will check it.', a: 'I do it carefully, because Allah sees my effort', w: ['I rush it just to finish', 'I skip it'], why: 'Ihsan is worshipping Allah knowing that He sees you.' },
        { q: 'You find some money on the playground.', a: 'I hand it in, because it is not mine', w: ['I keep it, because no one saw me', 'I share it with my friends'], why: 'Allah saw, even if no one else did.' },
        { q: 'A friend makes a mistake and blames you.', a: 'I stay calm and speak kindly and honestly', w: ['I get angry and argue back', 'I blame someone else'], why: 'Ihsan includes how we treat people when we are upset.' },
      ],
    },
    {
      type: 'read', h: 'Self-check: am I practising ihsan?',
      text: [
        'Read each sentence and ask yourself honestly whether it is true for you most of the time.',
        { list: ['I try to do my work carefully and with full effort.', 'I am honest in my words and actions.', 'I am kind and polite to others.', 'I try to worship Allah with focus and sincerity.', 'I take care of my belongings and the things around me.'] },
      ],
    },
    {
      type: 'write', h: 'One small improvement', lines: 4,
      prompt: 'Write one thing you will do more carefully today to practise ihsan.',
    },
    {
      type: 'write', h: 'Reflection', lines: 5,
      prompt: 'How can ihsan change the way you work when nobody is watching?',
    },
  ],
};

const u6l3 = {
  title: '6.3 Tawakkul: trusting Allah while we act', ar: 'ٱلتَّوَكُّل',
  pages: [
    {
      type: 'read', h: 'Lesson objectives', img: IMG(94),
      text: [
        'Tawakkul means relying on Allah while taking responsible steps. We prepare, we ask for help, and then we place our trust in Allah.',
        'By the end of this lesson you will be able to:',
        { list: ['define tawakkul', 'tell the difference between trusting Allah and simply doing nothing', 'practise trusting Allah after a sincere effort'] },
      ],
    },
    { type: 'ayah', s: 3, a: 159, w: [25, 34], en: 'And when you have decided, then rely on Allah. Indeed, Allah loves those who rely on Him.' },
    {
      type: 'read', h: 'Effort first, then trust',
      text: [
        'Tawakkul does not mean ignoring our duties. It means taking the right steps, making du\'a, and trusting Allah with the outcome. Remember the man with the camel in Unit Two: "Tie it, and trust in Allah."',
        { table: [
          ['Situation', 'My effort', 'My trust in Allah'],
          ['Studying for a test', 'I make a study plan, pay attention in class, revise and ask questions.', 'I make du\'a to understand, and I accept the result with contentment.'],
          ['Preparing for salah', 'I make wudu, wear clean clothes, pray on time and focus.', 'I ask Allah to accept my prayer and leave the reward to Him.'],
          ['Sorting out a disagreement', 'I listen, speak kindly, apologise if I was wrong and look for a fair solution.', 'I make du\'a for a good outcome and trust Allah to guide hearts.'],
          ['Looking after my health', 'I eat well, exercise, rest, keep clean and see a doctor when needed.', 'I ask Allah for good health. He is the One who heals.'],
        ] },
      ],
    },
    {
      type: 'read', h: 'A real-life scenario',
      text: [
        'A student prepares for a class presentation. She practises many times. On the day, she still feels nervous. She takes a deep breath, makes du\'a, and trusts Allah as she begins.',
        'She did everything that was in her control. The rest, she left to Allah.',
      ],
    },
    {
      type: 'sort', h: 'What can I do, and what do I leave to Allah?', prompt: 'Sort the six cards.',
      groups: ['Steps I can take', 'The outcome I leave to Allah'],
      items: [['Study for my test', 0], ['Get a good grade', 1], ['Pray sincerely', 0], ['Win the competition', 1], ['Plan my project', 0], ['People like my idea', 1]],
    },
    {
      type: 'quiz',
      items: [
        { q: 'Which is real tawakkul?', a: 'Practising for the match, making du\'a and accepting the result', w: ['Not practising because Allah decides who wins', 'Practising and then refusing to accept losing'], why: 'Tawakkul joins effort with trust.' },
        { q: 'Omar has studied well and asked Allah for help. Now he is waiting for his result. What can tawakkul give him?', a: 'Calm, because he did his part and Allah is in charge', w: ['Nothing, he should keep worrying', 'A guaranteed top mark'], why: 'A person who relies on Allah finds that Allah is enough for him (65:3).' },
      ],
    },
    {
      type: 'write', h: 'Complete the sentences', lines: 6,
      prompt: 'Before I begin something hard, I can... When I feel worried, I can... After I have tried my best, I can...',
    },
    {
      type: 'write', h: 'My tawakkul plan', lines: 5,
      prompt: 'Write three actions you will take this week where you will do your part with care, then trust Allah with the result.',
    },
  ],
};

const u6l4 = {
  title: '6.4 Shukr and sabr: gratitude and patience',
  pages: [
    {
      type: 'read', h: 'Lesson objectives', img: IMG(97),
      text: [
        'A believer thanks Allah for blessings and holds firm through difficulty.',
        'By the end of this lesson you will be able to:',
        { list: ['define shukr and sabr', 'see how they work together', 'practise a grateful response and a patient response'] },
      ],
    },
    {
      type: 'hadith',
      ar: 'عَجَبًا لِأَمْرِ الْمُؤْمِنِ، إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ، وَلَيْسَ ذَاكَ لِأَحَدٍ إِلَّا لِلْمُؤْمِنِ، إِنْ أَصَابَتْهُ سَرَّاءُ شَكَرَ فَكَانَ خَيْرًا لَهُ، وَإِنْ أَصَابَتْهُ ضَرَّاءُ صَبَرَ فَكَانَ خَيْرًا لَهُ',
      en: 'How wonderful is the affair of the believer! All of his affairs are good, and that is for no one except the believer. If something good happens to him, he is grateful, and that is good for him. If something bad happens to him, he is patient, and that is good for him.',
      src: 'Sahih Muslim 2999',
    },
    {
      type: 'read', h: 'Shukr: seeing blessings and giving thanks',
      text: [
        'Shukr is more than saying "thank you". It is a way of life. It starts when we notice the blessings Allah has given us. It continues when we thank Him with our hearts and our words. It shows in how we use those blessings.',
        { table: [
          ['Blessing', 'One way to show shukr'],
          ['Health', 'Take care of my body by eating well, moving and resting.'],
          ['Family', 'Be kind and helpful, and spend good time with them.'],
          ['Knowledge', 'Study with focus and use what I learn to help others.'],
          ['Time', 'Plan my time well and avoid wasting it.'],
        ] },
      ],
    },
    {
      type: 'order', h: 'The three steps of shukr',
      items: ['Notice the blessing around you', 'Thank Allah with your heart and your words', 'Use the blessing in ways that please Allah'],
    },
    { type: 'ayah', s: 2, a: 152, en: 'So remember Me; I will remember you. And be grateful to Me, and do not be ungrateful.' },
    {
      type: 'read', h: 'Sabr: holding firm with Allah',
      text: [
        'Sabr is patience that holds firm. It means continuing to do what is right, staying away from what is wrong, and keeping control of ourselves when life is hard. Sabr keeps our hearts calm and our actions good.',
        { table: [
          ['Kind of sabr', 'What it means', 'Examples'],
          ['Patience in worship', 'Keeping up worship even when we feel tired or lazy', 'Praying on time, reading Qur\'an regularly'],
          ['Patience away from sin', 'Holding ourselves back from what Allah has forbidden', 'Not lying, not cheating, no unkind words'],
          ['Patience in hardship', 'Staying calm and hopeful when things go wrong', 'Trusting Allah\'s plan, not giving up, asking for help in the right way'],
        ] },
        { note: { h: 'Pause and practise', t: 'Stop. Breathe. Remember Allah. Choose the best next action.' } },
      ],
    },
    { type: 'ayah', s: 39, a: 10, w: [19, 24], en: 'Indeed, the patient will be given their reward without measure.' },
    { type: 'ayah', s: 94, a: 6, en: 'Indeed, with hardship comes ease.' },
    {
      type: 'sort', h: 'Grateful or patient?', prompt: 'Does each situation call for shukr or for sabr?',
      groups: ['A grateful response (shukr)', 'A patient response (sabr)'],
      items: [
        ['A friend helps you with a difficult subject.', 0], ['A plan you were excited about does not work out.', 1], ['You receive a gift from someone you love.', 0],
        ['You have to wait your turn for something you want.', 1], ['Someone forgives you when you make a mistake.', 0], ['You find an exam question very hard.', 1],
      ],
    },
    {
      type: 'quiz',
      items: [
        { q: 'According to Sahih Muslim 2999, why is every affair of the believer good?', a: 'He is grateful in good times and patient in bad times', w: ['Nothing bad ever happens to him', 'He never feels sad'], why: 'Both shukr and sabr bring reward.' },
        { q: 'A teammate did not do their part of a group project and the result was poor. What is a patient response?', a: 'Stay calm, speak to them kindly and work out the next step', w: ['Shout at them in front of the class', 'Give up on the project'], why: 'Sabr is self-control when things go wrong, plus a helpful next step.' },
        { q: 'Which shows shukr for the blessing of time?', a: 'Planning my day so I do not waste it', w: ['Spending hours on things that do not help', 'Saying thank you and changing nothing'], why: 'Shukr shows in how we use a blessing.' },
      ],
    },
    {
      type: 'write', h: 'Gratitude journal', lines: 6,
      prompt: 'Write three blessings you noticed today and how you thanked Allah for each one.',
    },
    {
      type: 'write', h: 'My gratitude and patience plan', lines: 6,
      prompt: 'A teacher spent extra time helping a student, and the student improved. Later the student did badly in a test even after studying hard. How can the student show shukr for the help, and sabr after the setback? Then choose three actions you will do this week to practise shukr and sabr.',
    },
  ],
};

const u6test = {
  title: 'Unit Six test', test: true,
  pages: [
    {
      type: 'read', h: 'Unit Six review',
      text: [
        { table: [
          ['Word', 'Meaning'],
          ['Niyyah', 'The intention in the heart before an action'],
          ['Ihsan', 'Doing your best to please Allah in all you do'],
          ['Tawakkul', 'Relying on Allah while doing what you can'],
          ['Shukr', 'Being thankful to Allah for His many blessings'],
          ['Sabr', 'Being patient and holding firm in good and hard times'],
        ] },
        'Before the test, make sure you can explain all five words and give an example of each from your own life. Ask Allah for help and do your best.',
      ],
    },
    {
      type: 'match', h: 'Part A: vocabulary',
      pairs: [['Niyyah', 'Making a sincere intention for the sake of Allah'], ['Ihsan', 'Doing something with excellence, knowing Allah sees'], ['Tawakkul', 'Trusting Allah while doing our best'], ['Shukr', 'Being grateful for the blessings of Allah'], ['Sabr', 'Being patient in difficulty and hardship']],
    },
    {
      type: 'quiz', h: 'Part B: multiple choice',
      items: [
        { q: 'Which word means making our intention only for Allah?', a: 'Niyyah', w: ['Ihsan', 'Sabr', 'Shukr'], why: 'A sincere niyyah is for Allah alone.' },
        { q: 'Doing your best in work or study even when nobody is watching is an example of:', a: 'Ihsan', w: ['Shukr', 'Niyyah', 'Tawakkul'], why: 'Ihsan: worship Allah as though you see Him.' },
        { q: 'Before we trust Allah for the result, we should:', a: 'Do our best and be responsible', w: ['Do nothing', 'Make du\'a only', 'Wait for a miracle'], why: '"Tie it, and trust in Allah."' },
        { q: 'Saying Alhamdulillah after a blessing is an example of:', a: 'Shukr', w: ['Sabr', 'Ihsan', 'Tawakkul'], why: 'Shukr is thanking Allah for His blessings.' },
        { q: 'When something is difficult, a patient Muslim will:', a: 'Keep trying and trust Allah', w: ['Give up', 'Get angry', 'Blame others'], why: 'That is sabr.' },
      ],
    },
    {
      type: 'quiz', h: 'Part C: true or false',
      items: [
        tf('Niyyah is the heart behind every action.', true, '"Actions are only judged by intentions."'),
        tf('Ihsan means doing our best only when people are watching.', false, 'Ihsan is doing our best because Allah sees us, whoever else is watching.'),
        tf('Tawakkul means trusting Allah while we act and do our best.', true, 'Effort and trust go together.'),
        tf('Shukr means being grateful for Allah\'s blessings.', true, 'We notice, thank and use the blessing well.'),
        tf('Sabr means being patient in difficulty and not giving up.', true, 'Sabr holds firm through hard times.'),
        tf('Tawakkul means we do not need to study, because Allah decides.', false, 'We take the means and then rely on Allah.'),
      ],
    },
    {
      type: 'write', h: 'Part D: short answers', lines: 10,
      prompt: '1. How does intention (niyyah) change an action? 2. How can we show ihsan in daily life? 3. How does effort join with trust in Allah? 4. How do shukr and sabr guide us in everyday life?',
    },
  ],
};

// ── Closing ──
const closing = {
  title: 'Closing message',
  pages: [
    {
      type: 'read', h: 'Dear student',
      text: [
        'You have reached the end of Volume One. You started by asking what Tawheed is. Now you know that it means singling out Allah alone: as your Lord, in your worship, and in His beautiful Names and Attributes.',
        'You have seen that Tawheed is something to live as well as to learn. It is in the intention you make before you study. It is in the money you hand back, the promise you keep and the du\'a you make before a hard test. It is in the "Alhamdulillah" you say over a meal and the calm you keep when a plan goes wrong.',
        'Bilal held on to one word, "Ahad", in the burning sun. Salman left his home to find the truth. You will not be tested in the same way. But every day you will have small chances to choose Allah over everything else.',
        'Keep coming back to these lessons. Keep asking Allah to keep your heart firm.',
      ],
    },
    {
      type: 'dua', when: 'A du\'a the Prophet ﷺ often made',
      ar: 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ',
      tr: 'Ya muqallibal-qulub, thabbit qalbi \'ala dinik',
      en: 'O Turner of hearts, keep my heart firm on Your religion.',
      src: 'Jami at-Tirmidhi 2140',
    },
    {
      type: 'write', h: 'What I will carry with me', lines: 6,
      prompt: 'Which lesson in this book meant the most to you, and why? Write one thing you will do differently because of what you have learned about Tawheed.',
    },
  ],
};

export default {
  id: 'tawheed-textbook', title: 'Tawheed: Islamic Monotheism', ar: 'ٱلتَّوْحِيد', level: 4, ages: '10–14', color: '#0E5E4E',
  cover: 'books/tawheed-textbook/001.webp',
  about: 'Volume One of the school\'s Tawheed course: six units on the Oneness of Allah, from the three categories of Tawheed to living it every day, with ayat, hadith, activities and a test after each unit.',
  unit: 'lessons',
  note: 'For teachers: each lesson follows the textbook (objectives, words to know, teaching, ayat and hadith, activities, reflection). A few stories in the textbook were replaced or corrected to match the hadith sources; these pages carry a note on the review sheet. Written answers stay on the computer they were typed on.',
  chapters: [
    letter,
    u1l1, u1l2, u1l3, u1l4, u1test,
    u2l1, u2l2, u2l3, u2l4, u2test,
    u3l1, u3l2, u3l3, u3l4, u3review, u3test,
    u4l1, u4l2, u4l3, u4l4, u4test,
    u5l1, u5l2, u5l3, u5l4, u5test,
    u6l1, u6l2, u6l3, u6l4, u6test,
    closing,
  ],
};
