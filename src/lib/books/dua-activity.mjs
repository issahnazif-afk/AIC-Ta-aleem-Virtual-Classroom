// My Du'a Activity Book (Level 1, ages 4-6): the little du'as of the day, each with a du'a card,
// the workbook pages (trace, colour, write the letters) and a small game, then a review at the end.
const P = (n) => `books/dua-activity/${String(n).padStart(3, '0')}.webp`;

const WRITE = 'Look at the letters in the pink boxes. Copy each one into the boxes below.';

export default {
  id: 'dua-activity', title: 'My Du\'a Activity Book', ar: 'كِتَابُ أَدْعِيَتِي', level: 1, ages: '4–6', color: '#E8797A',
  cover: 'books/dua-activity/001.webp',
  about: 'The little du\'as of the day: hear them, say them, trace and colour them, then play.',
  unit: 'du\'as',
  note: 'For teachers: each du\'a opens with a card the child can listen to, then the workbook pages and a short game. The Bismillah, the lesson du\'a and the du\'a for parents come from the Qur\'an and play the class reciter.',
  chapters: [
    {
      title: 'My du\'a book', pages: [
        { type: 'scan', img: P(1), h: 'This is my book', say: 'This is your du\'a book. Can you write your name on it?' },
        { type: 'scan', img: P(2), draw: false, h: 'What is inside', say: 'Inside are the du\'as we say every day. Let\'s start!' },
      ],
    },
    {
      title: 'Bismillah', ar: 'بِسْمِ اللَّهِ', pages: [
        { type: 'read', h: 'Before we start anything', text: ['Before we start anything, we say Bismillah.', 'It means "In the name of Allah."', 'We say it before we eat. We say it before we read and play too.'] },
        { type: 'ayah', s: 1, a: 1, w: [1, 2], en: 'In the name of Allah.' },
        { type: 'scan', img: P(3), h: 'Trace it', say: 'Trace Bismillah with your crayon. Go slowly along the lines.' },
        { type: 'scan', img: P(4), h: 'Colour me in', say: 'She says Bismillah before she draws. Colour her picture!' },
        { type: 'scan', img: P(5), h: 'Writing activity', say: WRITE },
        { type: 'quiz', items: [
          { q: 'What do we say before we start something?', a: 'Bismillah', w: ['Shukran', 'Ma\'a as-salamah'] },
          { q: 'Bismillah means...', a: 'In the name of Allah', w: ['Good night', 'Thank you'] },
        ] },
      ],
    },
    {
      title: 'Before eating', ar: 'بِسْمِ اللَّهِ', pages: [
        { type: 'dua', when: 'Before we eat', ar: 'بِسْمِ اللَّهِ', tr: 'Bismillah', en: 'In the name of Allah.', src: 'Bukhari 5376, Muslim 2022' },
        { type: 'dua', h: 'If we forget', when: 'If we forget, we say it when we remember', ar: 'بِسْمِ اللَّهِ أَوَّلَهُ وَآخِرَهُ', tr: 'Bismillahi awwalahu wa akhirahu', en: 'In the name of Allah, at the start and at the end.', src: 'Abu Dawud 3767, Tirmidhi 1858' },
        { type: 'scan', img: P(7), h: 'Colour me in', say: 'He is sitting down to eat. What does he say first? Colour his kitchen.' },
        { type: 'scan', img: P(6), h: 'Count the fruit', say: 'Count each kind of fruit. Write how many on the lines.' },
        { type: 'quiz', items: [
          { q: 'What do we say before we eat?', a: 'Bismillah', w: ['Ghufranak', 'Yarhamukallah'] },
          { q: 'Which hand do we eat with?', a: 'The right hand', w: ['The left hand'], why: 'The Prophet ﷺ told a boy to eat with his right hand.' },
        ] },
      ],
    },
    {
      title: 'Before drinking', ar: 'بِسْمِ اللَّهِ', pages: [
        { type: 'dua', when: 'Before we drink', ar: 'بِسْمِ اللَّهِ', tr: 'Bismillah', en: 'I drink in the name of Allah.', src: 'Bukhari 5376', check: 'Bukhari 5376 is the hadith about saying Bismillah before eating. The book uses the same Bismillah before drinking. Please confirm this source is fine for drinking.' },
        { type: 'scan', img: P(9), h: 'Trace it', say: 'We say Bismillah before we drink too. Trace it!' },
        { type: 'scan', img: P(10), h: 'Colour me in', say: 'He is having a drink of water. Colour the jug and the cup.' },
        { type: 'scan', img: P(11), h: 'Writing activity', say: WRITE },
        { type: 'quiz', items: [
          { q: 'You want a drink of milk. What do you say first?', a: 'Bismillah', w: ['Ma\'a as-salamah', 'Ghufranak'] },
          { q: 'Is it better to sit down when we drink?', a: 'Yes, we sit down', w: ['No, we run around'] },
        ] },
      ],
    },
    {
      title: 'When someone sneezes', ar: 'يَرْحَمُكَ اللَّهُ', pages: [
        { type: 'dua', when: 'When someone sneezes and says Alhamdulillah', ar: 'يَرْحَمُكَ اللَّهُ', tr: 'Yarhamukallah', en: 'May Allah have mercy on you!', src: 'Bukhari 6224' },
        { type: 'read', h: 'Atchoo!', text: ['When we sneeze, we say Alhamdulillah.', 'Then our friend says Yarhamukallah.', 'And we answer them like this:', { ar: 'يَهْدِيكُمُ اللَّهُ وَيُصْلِحُ بَالَكُمْ' }, 'Yahdikumullahu wa yuslihu balakum.', 'It means "May Allah guide you and make things good for you."', 'Bukhari 6224'] },
        { type: 'scan', img: P(12), h: 'Trace it', say: 'Trace Yarhamukallah with your crayon.' },
        { type: 'scan', img: P(13), h: 'Colour me in', say: 'Atchoo! His friend sneezed. What does he say? Colour them both.' },
        { type: 'scan', img: P(14), h: 'Writing activity', say: WRITE },
        { type: 'match', prompt: 'Who says it? Tap one, then its partner.', pairs: [
          ['I sneeze', 'Alhamdulillah'],
          ['My friend hears me', 'Yarhamukallah'],
        ] },
      ],
    },
    {
      title: 'Saying goodbye', ar: 'مَعَ السَّلَامَةِ', pages: [
        { type: 'dua', when: 'When we leave our friends', ar: 'السَّلَامُ عَلَيْكُمْ', tr: 'As-salamu alaykum', en: 'Peace be on you.', src: 'Abu Dawud 5208, Tirmidhi 2706' },
        { type: 'read', h: 'Ma\'a as-salamah', text: ['When we part, we can also say Ma\'a as-salamah.', { ar: 'مَعَ السَّلَامَةِ' }, 'It means "Go safely!"'], check: 'The book teaches "Ma\'a as-salamah", a kind Arabic goodbye but not a du\'a from a hadith. The chapter opens with the Sunnah salam on leaving (Abu Dawud 5208, Tirmidhi 2706) and keeps Ma\'a as-salamah as the book\'s word.' },
        { type: 'scan', img: P(15), h: 'Trace it', say: 'Trace Ma\'a as-salamah. Wave goodbye when you finish!' },
        { type: 'scan', img: P(16), h: 'Colour me in', say: 'He is giving his dad a big hug goodbye. Colour them in.' },
        { type: 'scan', img: P(17), h: 'Writing activity', say: WRITE },
        { type: 'quiz', items: [
          { q: 'Your friend is going home. What can you say?', a: 'Ma\'a as-salamah', w: ['Yarhamukallah', 'Ghufranak'] },
          { q: 'Ma\'a as-salamah means...', a: 'Go safely', w: ['Good morning', 'I am hungry'] },
        ] },
      ],
    },
    {
      title: 'Thank you', ar: 'جَزَاكَ اللَّهُ خَيْرًا', pages: [
        { type: 'dua', when: 'When someone does something kind for us', ar: 'جَزَاكَ اللَّهُ خَيْرًا', tr: 'Jazakallahu khayran', en: 'May Allah give you good for it.', src: 'Tirmidhi 2035', check: 'The book teaches "Shukran" (thank you). The chapter opens with the Sunnah words Jazakallahu khayran (Tirmidhi 2035) and keeps Shukran on the next page.' },
        { type: 'read', h: 'Shukran', text: ['In Arabic, thank you is Shukran.', { ar: 'شُكْرًا' }, 'Did someone help you? Say Shukran, or Jazakallahu khayran!'] },
        { type: 'scan', img: P(19), h: 'Trace it', say: 'Trace Shukran with your crayon.' },
        { type: 'scan', img: P(20), h: 'Writing activity', say: WRITE },
        { type: 'scan', img: P(21), h: 'Colour me in', say: 'She gives her friend a present. What does her friend say? Colour them.' },
        { type: 'quiz', items: [
          { q: 'Mum gives you a drink. What do you say?', a: 'Jazakallahu khayran', w: ['Bismika Allahumma', 'Ghufranak'] },
          { q: 'Shukran means...', a: 'Thank you', w: ['Goodbye', 'Good night'] },
        ] },
      ],
    },
    {
      title: 'Before sleeping', ar: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', pages: [
        { type: 'dua', when: 'When we lie down to sleep', ar: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', tr: 'Bismika Allahumma amutu wa ahya', en: 'In Your name, O Allah, I die and I live.', src: 'Bukhari 6324' },
        { type: 'read', h: 'Sleeping and waking', text: ['The du\'a says "I die and I live."', 'Sleep is a little like dying.', 'In the morning, Allah gives us our life back. Then we wake up!'] },
        { type: 'scan', img: P(22), h: 'Trace it', say: 'Trace the sleeping du\'a with your crayon.' },
        { type: 'scan', img: P(23), h: 'Writing activity', say: WRITE },
        { type: 'scan', img: P(24), h: 'Colour me in', say: 'Shh, she is fast asleep. Colour her cosy bedroom.' },
        { type: 'scan', img: P(40), h: 'Say it again', say: 'Here is the sleeping du\'a again. Can you say it with me?' },
        { type: 'scan', img: P(41), h: 'Colour me in', say: 'It is night time. The moon is out! Colour his room.' },
        { type: 'quiz', items: [
          { q: 'It is bedtime. Which du\'a do we say?', a: 'Bismika Allahumma amutu wa ahya', w: ['Ghufranak', 'Jazakallahu khayran'] },
          { q: 'When do we say Bismika Allahumma?', a: 'Before sleeping', w: ['After sneezing', 'Before drinking'] },
        ] },
      ],
    },
    {
      title: 'Before a lesson', ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', pages: [
        { type: 'read', h: 'Before we learn', text: ['Before a lesson, we say the first two ayat of Al-Fatihah.', 'Listen, then say them with the reciter.'] },
        { type: 'ayah', s: 1, a: 1, en: 'In the name of Allah, the Most Kind, the Most Merciful.' },
        { type: 'ayah', s: 1, a: 2, en: 'All praise is for Allah, the Lord of all the worlds.' },
        { type: 'scan', img: P(25), h: 'Trace it', say: 'Trace the words with your crayon. Start on the right side!' },
        { type: 'scan', img: P(26), h: 'Colour me in', say: 'They are ready for their lesson. Colour their books and toys.' },
        { type: 'scan', img: P(27), h: 'Writing activity', say: WRITE },
        { type: 'quiz', items: [
          { q: 'Your lesson is starting. What do you say?', a: 'Bismillahir Rahmanir Rahim', w: ['Ma\'a as-salamah', 'Yarhamukallah'] },
          { q: 'Who is the Lord of all the worlds?', a: 'Allah', w: ['The teacher', 'The sun'] },
        ] },
      ],
    },
    {
      title: 'Leaving the house', ar: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ', pages: [
        { type: 'dua', when: 'When we go out of the house', ar: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', tr: 'Bismillah, tawakkaltu \'alallah, wa la hawla wa la quwwata illa billah', en: 'In the name of Allah. I trust in Allah. Only Allah can help me and make me strong.', src: 'Abu Dawud 5095, Tirmidhi 3426' },
        { type: 'scan', img: P(28), h: 'Trace it', say: 'This du\'a is a long one! Trace it slowly.' },
        { type: 'scan', img: P(29), h: 'Writing activity', say: WRITE },
        { type: 'scan', img: P(30), h: 'Colour me in', say: 'She is opening the door to go out. Colour her picture.' },
        { type: 'scan', img: P(8), h: 'Off to school', say: 'He says Bismillah and salam as he goes. Colour him and his mum.' },
        { type: 'quiz', items: [
          { q: 'We are going to the park. What do we say at the door?', a: 'Bismillah, tawakkaltu \'alallah', w: ['Ghufranak', 'Bismika Allahumma'] },
          { q: 'Who keeps us safe when we go out?', a: 'Allah', w: ['Our shoes', 'The car'] },
        ] },
      ],
    },
    {
      title: 'Going into the toilet', ar: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ', pages: [
        { type: 'dua', when: 'Before we go into the toilet', ar: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ', tr: 'Allahumma inni a\'udhu bika minal khubuthi wal khaba\'ith', en: 'O Allah, I ask You to keep me safe from the bad ones.', src: 'Bukhari 142, Muslim 375' },
        { type: 'read', h: 'Left foot first', text: ['We say the du\'a outside the door.', 'Then we step in with our left foot.'], check: 'Going in with the left foot is what the scholars teach; no hadith is quoted for it here.' },
        { type: 'scan', img: P(34), h: 'Trace it', say: 'Trace the du\'a with your crayon.' },
        { type: 'scan', img: P(35), h: 'Colour me in', say: 'He is going into the bathroom. Colour the tiles and the towel.' },
        { type: 'scan', img: P(36), h: 'Writing activity', say: WRITE },
        { type: 'quiz', items: [
          { q: 'When do we say Allahumma inni a\'udhu bika?', a: 'Before going into the toilet', w: ['Before eating', 'In bed'] },
          { q: 'Which foot goes in first?', a: 'The left foot', w: ['The right foot'] },
        ] },
      ],
    },
    {
      title: 'Coming out of the toilet', ar: 'غُفْرَانَكَ', pages: [
        { type: 'dua', when: 'When we come out of the toilet', ar: 'غُفْرَانَكَ', tr: 'Ghufranak', en: 'I ask for Your forgiveness.', src: 'Abu Dawud 30, Tirmidhi 7' },
        { type: 'scan', img: P(37), h: 'Trace it', say: 'Ghufranak is a short du\'a. Trace it!' },
        { type: 'scan', img: P(38), h: 'Writing activity', say: WRITE },
        { type: 'scan', img: P(39), h: 'Colour me in', say: 'All done! Now he washes his hands. Colour the bathroom.' },
        { type: 'scan', img: P(18), h: 'Do not waste water', say: 'Use just a little water when you wash. Colour the picture.', check: 'The words printed under this picture ("even if you are taking ablution from a stream") come from a narration in Ibn Majah 425 that many scholars grade weak. The reader does not read them out. A teacher may wish to reprint the page without them.' },
        { type: 'match', prompt: 'Tap the du\'a, then when we say it.', pairs: [
          ['Allahumma inni a\'udhu bika', 'Going in'],
          ['Ghufranak', 'Coming out'],
        ] },
      ],
    },
    {
      title: 'A du\'a for my parents', ar: 'رَبِّ ارْحَمْهُمَا', pages: [
        { type: 'read', h: 'Mum and Dad', text: ['Mum and Dad looked after us when we were tiny.', 'Allah teaches us a du\'a for them in the Qur\'an.', 'Listen, then say it with the reciter.'] },
        { type: 'ayah', s: 17, a: 24, w: [8, 12], en: 'My Lord, have mercy on them, as they looked after me when I was small.' },
        { type: 'scan', img: P(31), h: 'Trace it', say: 'Trace the du\'a for Mum and Dad.' },
        { type: 'scan', img: P(32), h: 'Join the shapes', say: 'Join the shapes from the boy to his grandparents. Colour the hearts!' },
        { type: 'scan', img: P(33), h: 'Writing activity', say: WRITE },
        { type: 'quiz', items: [
          { q: 'Who is this du\'a for?', a: 'Mum and Dad', w: ['My cat', 'My toys'] },
          { q: 'What do we ask Allah to give them?', a: 'Mercy', w: ['Sweets', 'A new car'] },
        ] },
      ],
    },
    {
      title: 'After waking up', ar: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا', pages: [
        { type: 'dua', when: 'When we wake up', ar: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', tr: 'Alhamdu lillahil-ladhi ahyana ba\'da ma amatana wa ilayhin-nushur', en: 'All praise is for Allah, who gave us life after death. And to Him we all return.', src: 'Bukhari 6324' },
        { type: 'scan', img: P(43), h: 'Say it with me', say: 'Good morning! Here is the waking up du\'a.', check: 'The last word on this page is printed "النشوء"; the sound wording is "النُّشُورُ" (Bukhari 6324). The du\'a card uses the correct wording. The page may need fixing in Canva.' },
        { type: 'scan', img: P(44), h: 'Colour me in', say: 'The sun is up and so is he! Colour his room.' },
        { type: 'quiz', items: [
          { q: 'You just woke up. What do you say?', a: 'Alhamdu lillahil-ladhi ahyana', w: ['Bismika Allahumma', 'Ghufranak'] },
          { q: 'Who wakes us up every morning?', a: 'Allah', w: ['The clock', 'The sun'] },
        ] },
      ],
    },
    {
      title: 'Let\'s play', pages: [
        { type: 'scan', img: P(42), h: 'Match the du\'a', say: 'Draw a line from each du\'a to when we say it.' },
        { type: 'match', prompt: 'Now tap a du\'a, then when we say it.', pairs: [
          ['Bismika Allahumma amutu wa ahya', 'Before sleeping'],
          ['Alhamdulillah', 'After I sneeze'],
          ['Bismillah', 'Before eating'],
        ] },
        { type: 'scan', img: P(45), h: 'Help me find my way', say: 'Help her get to the masjid. Draw her path with your crayon.' },
        { type: 'match', prompt: 'One more! Tap a du\'a, then its time.', pairs: [
          ['Ghufranak', 'Leaving the toilet'],
          ['Yarhamukallah', 'When a friend sneezes'],
          ['Jazakallahu khayran', 'When someone helps me'],
          ['Rabbirhamhuma', 'For Mum and Dad'],
        ] },
        { type: 'scan', img: P(46), h: 'Colour me in', say: 'The family is eating together. What did they say first?' },
        { type: 'scan', img: P(47), h: 'Circle the right one', say: 'Which du\'a do we say before eating? Circle it!' },
        { type: 'quiz', items: [
          { q: 'Which du\'a do we say before eating?', a: 'Bismillah', w: ['Alhamdulillah', 'Subhanallah'] },
          { q: 'Which du\'a do we say when we wake up?', a: 'Alhamdu lillahil-ladhi ahyana', w: ['Ma\'a as-salamah', 'Ghufranak'] },
          { q: 'What do we say when we leave the toilet?', a: 'Ghufranak', w: ['Bismillah', 'Shukran'] },
        ] },
        { type: 'scan', img: P(48), h: 'Colour me in', say: 'He raises his hands before his meal. Colour his plate.' },
        { type: 'scan', img: P(49), h: 'Draw your own', say: 'Draw your favourite food on the plate. Then thank Allah for it!' },
      ],
    },
  ],
};
