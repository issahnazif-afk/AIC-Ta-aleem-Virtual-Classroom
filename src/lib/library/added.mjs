// Books a teacher adds to the Reading Library. See docs/reading-library.md for the full guide.
// Each book goes on the shelf for its `level` (1 or 2), after the school's own books.
//
// A picture book (for example pages exported from Canva) puts its pictures in public/library/<book-id>/
// and gives each page `img` instead of `art`:
//   { img: 'library/<book-id>/01.jpg', t: 'The words under the picture.' }
// Level 1 words use `p` (a picture name from src/lib/stories/art.mjs); Level 2 words use `m` (the meaning).
// Check a new book with:  npm run books
//
// The five books below use the school's own watercolour pictures from the Canva book "Islamic Moral Stories"
// (Grandpa Musa's stories). The words were written again for young readers, and each story ends with a sound hadith.

const pages = (id, texts) => texts.map((t, i) => ({ img: `library/${id}/${String(i + 1).padStart(2, '0')}.jpg`, t }));

export const ADDED = [
  {
    id: 'add-honest-ibrahim', level: 2, title: 'The Boy Who Never Lied', theme: 'Honesty', color: '#7FA65A',
    pages: pages('add-honest-ibrahim', [
      'In a small village with dusty lanes lived a boy called Ibrahim. People called him the boy who never lies.',
      'Every morning his mother held his hands. “Speak only the truth, Ibrahim, even when it is hard.”',
      'One windy day at Madrasa, CRASH! A clay vase fell off the shelf and smashed right beside Ibrahim’s desk.',
      'Everyone stared at him. “It was the wind, teacher. I saw it fall.” The teacher believed him at once.',
      'On the way home, something shiny lay in the dust. It was a leather pouch, heavy with gold coins!',
      '“This is not mine,” Ibrahim said. So he knocked on door after door. “Did you lose a pouch?”',
      'At the very last house, an old woman opened the door and gasped. “My pouch! I lost it this morning!”',
      'She pressed some coins into his hand as a reward. Ibrahim gave them back. “I didn’t do it for coins, Aunty.”',
      'That evening his elbow knocked Baba’s favourite cup to the floor. Nobody saw. He could blame the cat…',
      '“Baba, I broke your cup. I’m sorry.” Baba hugged him tight. “A cup can be replaced. Your honesty can’t.”',
    ]),
    words: [{ w: 'pouch', m: 'a small bag for keeping money' }, { w: 'reward', m: 'something given to say thank you' }, { w: 'smashed', m: 'broke into many pieces' }, { w: 'honesty', m: 'always telling the truth' }],
    quiz: [{ q: 'What fell off the shelf at Madrasa?', a: 'A clay vase', w: ['A book', 'A clock'] }, { q: 'What was inside the pouch?', a: 'Gold coins', w: ['Sweets', 'Seeds'] }, { q: 'Whose cup did Ibrahim break?', a: 'Baba’s', w: ['His teacher’s', 'The old woman’s'] }],
    choose: { q: 'You break something and nobody saw. What do you do?', options: ['Say what happened', 'Hide the pieces', 'Blame the cat'], answer: 0, why: 'The truth leads to goodness, and goodness leads to Jannah.' },
    hadith: { ar: 'إِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ، وَإِنَّ الْبِرَّ يَهْدِي إِلَى الْجَنَّةِ', en: 'Truthfulness leads to goodness, and goodness leads to Paradise.', src: 'Bukhari 6094, Muslim 2607' },
  },
  {
    id: 'add-aminah-rain', level: 2, title: 'Aminah and the Long Rain', theme: 'Patience and thankfulness', color: '#5B8FB9',
    pages: pages('add-aminah-rain', [
      'Aminah loved mornings on the farm. She fed the hens, swung her basket and said, “Alhamdulillah!”',
      'One year the rain came early and would not stop. Day after day it drummed on the roof.',
      'When it slowed at last, Baba walked out to the fields. “The crops are gone,” he said quietly.',
      'Aminah sat on the wet step with her chin in her hands. “We worked so hard. Why us?”',
      'That night Mama sat on her bed. “Sabr means trusting Allah, even before we can see His plan.”',
      'In the morning Mama filled a pot with soup. “Take some to Aunty Khadijah. She lives all alone.”',
      'The roads flooded and Madrasa closed. So Aminah brought Madrasa home and taught the little ones their letters.',
      'Then one morning there was no drip, drip, drip. Aminah ran outside. A rainbow stretched across the sky!',
      'Baba planted again, and the new crops grew faster than ever in the rich, soaked soil. “SubhanAllah!”',
      'At their first full meal in weeks, the whole family thanked Allah. Aminah even thanked Him for the rain.',
    ]),
    words: [{ w: 'crops', m: 'plants grown on a farm for food' }, { w: 'flooded', m: 'covered with too much water' }, { w: 'sabr', m: 'patience: trusting Allah and not giving up' }, { w: 'soaked', m: 'very, very wet' }],
    quiz: [{ q: 'Why did Madrasa close?', a: 'The roads flooded', w: ['It was Eid', 'The teacher was ill'] }, { q: 'Who did Aminah take soup to?', a: 'Aunty Khadijah', w: ['Grandpa Musa', 'Her teacher'] }, { q: 'What did she see when the rain stopped?', a: 'A rainbow', w: ['A fox', 'Snow'] }],
    choose: { q: 'Your trip to the park is cancelled because of rain. What do you do?', options: ['Say Alhamdulillah and find something good to do', 'Sulk all day', 'Shout at the window'], answer: 0, why: 'For a believer, everything can be good: thankful in good times, patient in hard ones.' },
    hadith: { ar: 'عَجَبًا لِأَمْرِ الْمُؤْمِنِ، إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ', en: 'How wonderful is the affair of the believer: all of it is good for him.', src: 'Muslim 2999' },
  },
  {
    id: 'add-yusuf-noor', level: 2, title: 'Yusuf and the Little Bird', theme: 'Mercy to creatures', color: '#E59A3C',
    pages: pages('add-yusuf-noor', [
      'Yusuf was the fastest runner in the village. Nobody could kick a football as far as he could.',
      'One afternoon he heard a tiny “cheep, cheep”. A little bird lay by the path with a bent wing.',
      '“Leave it, Yusuf! Come and play!” called his friends. Yusuf knelt down. “It’s hurt. I can’t leave it.”',
      'He carried the bird home, step by careful step. It was the slowest walk of his life.',
      'Mama helped him line a box with soft cloth. Yusuf named the bird Noor, which means light.',
      'One day the neighbour’s cat crept in. Yusuf jumped in front of the box. “No! Stay away!”',
      'Then one morning Noor fluttered! A hop, a flap, and then a wobbly flight across the room.',
      'At school a new boy called Bilal sat alone on a bench. He looked as frightened as Noor had.',
      '“Assalamu alaykum! Do you want to share my lunch?” Bilal smiled shyly, and they shared bread and dates.',
      'When Noor was strong again, Yusuf opened his hands in the field. Up, up she flew into the blue.',
    ]),
    words: [{ w: 'frightened', m: 'very scared' }, { w: 'fluttered', m: 'moved its wings quickly and lightly' }, { w: 'shyly', m: 'in a quiet, nervous way' }, { w: 'mercy', m: 'being gentle and kind to those who need it' }],
    quiz: [{ q: 'What did Yusuf name the bird?', a: 'Noor', w: ['Misk', 'Pepper'] }, { q: 'What was wrong with the bird?', a: 'It had a bent wing', w: ['It was asleep', 'It was too big'] }, { q: 'Who did Yusuf share his lunch with?', a: 'Bilal', w: ['Hassan', 'The cat'] }],
    choose: { q: 'A new child is sitting alone at lunch. What do you do?', options: ['Say salam and sit with them', 'Pretend you didn’t see', 'Laugh with your friends'], answer: 0, why: 'Be merciful to those on earth, and Allah will be merciful to you.' },
    hadith: { ar: 'ارْحَمُوا مَنْ فِي الْأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ', en: 'Be merciful to those on earth, and the One above the heavens will be merciful to you.', src: 'Tirmidhi 1924, Abu Dawud 4941' },
  },
  {
    id: 'add-hassan-mornings', level: 2, title: 'Hassan’s Grumpy Mornings', theme: 'Honouring parents', color: '#8C7AE6',
    pages: pages('add-hassan-mornings', [
      '“Hassan! Time for school!” “Five more minutes!” Every morning was the same battle.',
      'Hassan never noticed that Mama woke at Fajr. She prayed, cooked breakfast and ironed his clothes.',
      'One morning he grabbed his bag and stomped out of the door. No goodbye. No thank you.',
      'At school the teacher told them a hadith. Someone asked who deserves our best kindness. “Your mother,” three times, “then your father.”',
      'That evening Hassan really looked at Mama. Her eyes were tired and her shoulders drooped.',
      'The next morning he woke first and made his bed. Nobody had to ask him.',
      'He poured breakfast for his little sister. “You made it for me?” giggled Maryam.',
      'Then he folded the whole basket of laundry. His arms ached. “Mama does this every day,” he thought.',
      'When Mama came downstairs, she stopped and stared. “Hassan… did you do all of this?”',
      'That evening Hassan brought Baba a glass of water and his slippers. Baba’s eyes filled with happy tears.',
    ]),
    words: [{ w: 'grumpy', m: 'in a bad mood' }, { w: 'ironed', m: 'made clothes smooth with a hot iron' }, { w: 'drooped', m: 'hung down, because of being tired' }, { w: 'laundry', m: 'clothes that need washing or folding' }],
    quiz: [{ q: 'When does Mama wake up?', a: 'At Fajr', w: ['At lunchtime', 'At Maghrib'] }, { q: 'Who did Hassan make breakfast for?', a: 'His sister Maryam', w: ['Grandpa Musa', 'His teacher'] }, { q: 'What did Hassan bring Baba?', a: 'Water and his slippers', w: ['A football', 'A book'] }],
    choose: { q: 'Mama asks you to tidy up while you are playing. What do you do?', options: ['Help her straight away', 'Say “uff” and carry on', 'Pretend you didn’t hear'], answer: 0, why: 'The Prophet ﷺ said our mother deserves our best kindness, then our father.' },
    hadith: { ar: 'مَنْ أَحَقُّ النَّاسِ بِحُسْنِ صَحَابَتِي؟ قَالَ: أُمُّكَ، ثُمَّ أُمُّكَ، ثُمَّ أُمُّكَ، ثُمَّ أَبُوكَ', en: 'A man asked who most deserves his kindness. The Prophet ﷺ said: your mother, then your mother, then your mother, then your father.', src: 'Bukhari 5971, Muslim 2548' },
  },
  {
    id: 'add-amina-dolls', level: 2, title: 'Amina’s Twelve Dolls', theme: 'Giving', color: '#E86A92',
    pages: pages('add-amina-dolls', [
      'Amina had shelves full of toys and twelve dolls. Still, every week she asked for a new one.',
      'On the way to the market she saw a family with no shoes. The little girl held a doll with one arm.',
      '“Mama, why don’t they have anything?” Mama knelt down. “Allah tests some people with less, and some with more.”',
      'That night Amina looked at her twelve dolls. A small, selfish voice whispered, “They’re YOURS.”',
      'In the morning she packed a box. In went three dolls, two dresses and five books she had read.',
      'Her hands shook a little as she carried it. “What if I miss them?” she asked Mama.',
      'She knelt down and held out a doll. The little girl hugged it as if she would never let go.',
      'At school, Bilal had forgotten his lunch. Amina split her sandwich and gave him the bigger half.',
      'On the way home she carried Aunty Khadijah’s heavy shopping right to her front door.',
      'Then all the children planted a Giving Garden, and shared its tomatoes from door to door.',
    ]),
    words: [{ w: 'selfish', m: 'thinking only about yourself' }, { w: 'tests', m: 'gives a chance to show what we will do' }, { w: 'split', m: 'cut or broke into two parts' }, { w: 'shared', m: 'gave part of what you have to others' }],
    quiz: [{ q: 'How many dolls did Amina have?', a: 'Twelve', w: ['Two', 'Fifty'] }, { q: 'What did Amina share with Bilal?', a: 'Her sandwich', w: ['Her pencil', 'Her coat'] }, { q: 'What did the children plant?', a: 'A Giving Garden', w: ['A tree house', 'A flower crown'] }],
    choose: { q: 'You have two snacks and your friend has none. What do you do?', options: ['Give one to your friend', 'Eat both quickly', 'Hide them in your bag'], answer: 0, why: 'The giving hand is better than the taking hand.' },
    hadith: { ar: 'الْيَدُ الْعُلْيَا خَيْرٌ مِنَ الْيَدِ السُّفْلَى', en: 'The upper hand (the one that gives) is better than the lower hand (the one that takes).', src: 'Bukhari 1429, Muslim 1033' },
  },
];
