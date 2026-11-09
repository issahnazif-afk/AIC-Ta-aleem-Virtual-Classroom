// The Tawheed shelf: knowing Allah, level by level. Same book shape as the Reading Library (level1.mjs, level2.mjs),
// so every book gets the reader, the games, stars and passport stamps.
//
// The path through the levels (a spiral: each level comes back to the same three ideas, deeper each time):
//   Level 1 (ages 4–6)   Allah made everything, Allah is One, Allah gives, Allah hears and sees. Feel it, say it.
//   Level 2 (ages 7–8)   The same three ideas with their names: Allah the Lord and Creator, worship and du'a for Allah
//                        alone (no lucky charms), His beautiful Names. Stories: Ibrahim and the stars, Bilal's "Ahad".
//   Level 3 (ages 9–10)  La ilaha illallah (what it denies, what it affirms), why we were created, shirk in daily life.
//   Level 4 (ages 10–14) The school's own textbook, "Tawheed: Islamic Monotheism, Volume One" (Canva), six units.
// Written for the school. Ayat come from the Tanzil text (scripts/stories/quran.mjs); stories of the Prophets and
// Companions follow the Qur'an and the classical accounts (Ibn Kathir's al-Bidaya wan-Nihaya), retold in our own
// words. No Prophet or Companion is drawn: their stories are told by a teacher, an imam or a grandparent.

const A = (who, x, o = {}) => ({ who, x, ...o });
const T = (p, x, y, o = {}) => ({ p, x, y, ...o });

export const TAWHEED_L1 = [
  {
    id: 't1-moon', level: 1, title: 'Who Made the Moon?', theme: 'Allah made everything', color: '#2F4A7A',
    pages: [
      { t: 'Zara and Jiddo sit in the garden. It is dark and cool.', art: { bg: 'garden', time: 'night', actors: [A('grandpa', 300, { face: 'happy' }), A('zara', 440, { face: 'happy' })] } },
      { t: '“Look, Jiddo! The moon is big and bright tonight.”', art: { bg: 'garden', time: 'night', actors: [A('grandpa', 300, { face: 'happy' }), A('zara', 440, { face: 'surprised', pose: 'point' })], fx: [['sparkles', 660, 90]] } },
      { t: 'Zara thinks hard. “Jiddo, who made the moon?”', art: { bg: 'garden', time: 'night', actors: [A('grandpa', 300, { face: 'calm', id: 'jiddo' }), A('zara', 440, { face: 'calm', pose: 'think' })], fx: [['question', 440, 120]] },
        tap: { id: 'jiddo', prompt: 'Tap Jiddo to hear his answer.', say: '“Allah made the moon,” says Jiddo. “And every star too.”', after: { bg: 'garden', time: 'night', actors: [A('grandpa', 300, { face: 'happy', pose: 'point' }), A('zara', 440, { face: 'happy' })], fx: [['sparkles', 660, 90]] } } },
      { t: 'Zara counts the stars. One, two, three, four… too many!', art: { bg: 'garden', time: 'night', actors: [A('zara', 380, { face: 'happy', pose: 'point' })], props: [T('star', 220, 150, { color: '#FFF3C4' }), T('star', 520, 170, { color: '#FFF3C4' })] } },
      { t: '“Who made me, Jiddo?” Jiddo laughs. “Allah made you too.”', art: { bg: 'garden', time: 'night', actors: [A('grandpa', 300, { face: 'happy' }), A('zara', 440, { face: 'surprised' })], fx: [['hearts', 380, 130]] } },
      { t: 'Zara looks up and whispers, “Subhanallah.” Then she gives a big yawn.', art: { bg: 'garden', time: 'night', actors: [A('grandpa', 300, { face: 'happy' }), A('zara', 440, { face: 'sleepy' })], fx: [['zzz', 470, 140]] } },
    ],
    words: [{ w: 'moon', p: 'moon' }, { w: 'star', p: 'star' }, { w: 'tree', p: 'tree' }],
    quiz: [{ q: 'Who made the moon?', a: 'Allah', w: ['Jiddo', 'Zara'] }, { q: 'What did Zara try to count?', a: 'The stars', w: ['The cats', 'The cookies'] }],
    choose: { q: 'You see a big rainbow after the rain. What can you say?', options: ['Subhanallah! Allah made it.', 'Nothing at all', 'It is mine!'], answer: 0, why: 'Something lovely makes us think of the One who made it.' },
    quran: { s: 39, a: 62, w: [1, 4], en: 'Allah is the Creator of everything.' },
  },
  {
    id: 't1-one', level: 1, title: 'One, Only One', theme: 'Allah is One', color: '#1F7A5C',
    pages: [
      { t: 'Adam is learning to count. He holds up one finger.', art: { bg: 'home', actors: [A('adam', 380, { face: 'happy', pose: 'point' })] } },
      { t: 'One apple. One red ball. Adam giggles.', art: { bg: 'home', actors: [A('adam', 330, { face: 'happy', pose: 'cheer' })], props: [T('apple', 480, 460), T('ball', 560, 470)] } },
      { t: 'Maryam points out of the window. “Look, Adam. One moon.”', art: { bg: 'home', time: 'night', actors: [A('maryam', 300, { face: 'happy', pose: 'point', id: 'maryam' }), A('adam', 440, { face: 'surprised' })] } },
      { t: '“Now listen. This one is the most special of all.”', art: { bg: 'home', time: 'night', actors: [A('maryam', 300, { face: 'calm', id: 'maryam' }), A('adam', 440, { face: 'calm' })], fx: [['idea', 300, 120]] },
        tap: { id: 'maryam', prompt: 'Tap Maryam. What does she tell Adam?', say: '“Allah is One. Only One. Nobody is like Him.”', after: { bg: 'home', time: 'night', actors: [A('maryam', 300, { face: 'happy', pose: 'point' }), A('adam', 440, { face: 'happy', pose: 'point' })], fx: [['sparkles', 380, 120]] } } },
      { t: 'Adam holds up one finger, high, high. “Allah is One!” he shouts.', art: { bg: 'home', time: 'night', actors: [A('adam', 380, { face: 'happy', pose: 'cheer' })], fx: [['star', 380, 110]] } },
      { t: 'Mama calls from the kitchen. “Masha’Allah, Adam! Now say it softly.”', art: { bg: 'kitchen', actors: [A('mama', 300, { face: 'happy' }), A('adam', 450, { face: 'happy' })], fx: [['hearts', 380, 130]] } },
    ],
    words: [{ w: 'apple', p: 'apple' }, { w: 'ball', p: 'ball' }, { w: 'moon', p: 'moon' }],
    quiz: [{ q: 'How many is Allah?', a: 'One', w: ['Two', 'Ten'] }, { q: 'Who taught Adam about Allah?', a: 'Maryam', w: ['The cat', 'Baba'] }],
    choose: { q: 'A friend asks, “How many gods are there?” What do you say?', options: ['Lots and lots', 'Only One: Allah', 'I don’t know'], answer: 1, why: 'Allah is One. He has no partner, and nobody is like Him.' },
    quran: { s: 112, a: 1, w: [1, 4], en: 'Say: He is Allah, the One.' },
  },
  {
    id: 't1-rain', level: 1, title: 'Rain for the Flowers', theme: 'Allah gives us what we need', color: '#4FA9D9',
    pages: [
      { t: 'Maryam has a little garden. Her flowers are droopy and sad.', art: { bg: 'garden', actors: [A('maryam', 300, { face: 'sad' })], props: [T('flowers', 480, 470), T('flowers', 580, 470)] } },
      { t: 'The ground is dry. There has been no rain for days.', art: { bg: 'garden', time: 'dusk', actors: [A('maryam', 320, { face: 'sad', pose: 'shrug' })], props: [T('pot', 500, 470), T('flowers', 600, 470)], fx: [['crack', 520, 470]] } },
      { t: 'Maryam lifts her hands. “Ya Allah, please send us rain.”', art: { bg: 'garden', time: 'dusk', actors: [A('maryam', 380, { face: 'calm', pose: 'dua' })], props: [T('flowers', 560, 470)] } },
      { t: 'Pitter-patter! Big drops fall from the grey sky.', art: { bg: 'garden', rain: true, actors: [A('maryam', 320, { face: 'surprised' })], props: [T('umbrella', 520, 360, { id: 'umb' }), T('flowers', 600, 470)], fx: [['rain', 400, 100]] },
        tap: { id: 'umb', prompt: 'Tap the umbrella to go outside!', say: 'Maryam jumps in the puddles. Splash, splash, splash!', after: { bg: 'garden', rain: true, actors: [A('maryam', 380, { face: 'happy', pose: 'hold', hold: { R: 'umbrella' } })], props: [T('puddle', 380, 480)], fx: [['rain', 400, 100]] } } },
      { t: 'In the morning the flowers stand up tall. Pink and yellow and purple.', art: { bg: 'garden', time: 'dawn', actors: [A('maryam', 300, { face: 'happy', pose: 'cheer' })], props: [T('flowers', 460, 470), T('flowers', 560, 470), T('flowers', 660, 470)], fx: [['sparkles', 560, 400]] } },
      { t: '“Alhamdulillah,” says Maryam. “Thank You, Allah, for the rain.”', art: { bg: 'garden', actors: [A('maryam', 360, { face: 'happy', pose: 'dua' })], props: [T('flowers', 540, 470), T('puddle', 620, 480)] } },
    ],
    words: [{ w: 'flowers', p: 'flowers' }, { w: 'umbrella', p: 'umbrella' }, { w: 'puddle', p: 'puddle' }],
    quiz: [{ q: 'What did Maryam ask Allah for?', a: 'Rain', w: ['A cake', 'A kite'] }, { q: 'Who sent the rain?', a: 'Allah', w: ['Maryam', 'The flowers'] }],
    choose: { q: 'You have a yummy dinner on your plate. Who gave it to us?', options: ['Allah', 'Nobody', 'The plate'], answer: 0, why: 'The farmer grew it and Mama cooked it. Allah gave it all.' },
    quran: { s: 51, a: 58, w: [1, 4], en: 'Allah is the One who provides.' },
  },
  {
    id: 't1-whisper', level: 1, title: 'Allah Hears a Whisper', theme: 'Allah hears us', color: '#8C7AE6',
    pages: [
      { t: 'BOOM! Thunder shakes the window. Yusuf hides under his blanket.', art: { bg: 'bedroom', time: 'night', actors: [A('yusuf', 232, { lying: true, y: 316, z: 130, face: 'surprised' })], props: [T('bed', 340, 430, { s: 1.4 }), T('blanket', 340, 430, { s: 1.4, z: 140 })], fx: [['crack', 610, 120]] } },
      { t: 'Mama is downstairs. Yusuf does not want to shout.', art: { bg: 'bedroom', time: 'night', actors: [A('yusuf', 232, { lying: true, y: 316, z: 130, face: 'sad' })], props: [T('bed', 340, 430, { s: 1.4 }), T('blanket', 340, 430, { s: 1.4, z: 140 })] } },
      { t: 'So he whispers, very softly. “Ya Allah, help me be brave.”', art: { bg: 'bedroom', time: 'night', actors: [A('yusuf', 360, { face: 'calm', pose: 'dua' })], props: [T('bed', 340, 430, { s: 1.4 })], fx: [['hearts', 360, 150]] } },
      { t: 'The door opens. Mama peeks in. “Did you call me?”', art: { bg: 'bedroom', time: 'night', actors: [A('mama', 220, { face: 'calm' }), A('yusuf', 420, { face: 'happy', id: 'yusuf' })], props: [T('bed', 420, 430, { s: 1.4 })] },
        tap: { id: 'yusuf', prompt: 'Tap Yusuf to hear what he says.', say: '“No, Mama. I was talking to Allah. He heard me.”', after: { bg: 'bedroom', time: 'night', actors: [A('mama', 220, { face: 'happy' }), A('yusuf', 420, { face: 'happy', pose: 'point' })], props: [T('bed', 420, 430, { s: 1.4 })], fx: [['sparkles', 420, 140]] } } },
      { t: 'Mama sits on the bed. “Allah hears every whisper, even in the dark.”', art: { bg: 'bedroom', time: 'night', actors: [A('mama', 300, { face: 'happy', pose: 'hug' }), A('yusuf', 420, { face: 'happy' })], props: [T('bed', 380, 430, { s: 1.4 })] } },
      { t: 'The rain goes on and on. But Yusuf is not scared now. Soon he is asleep.', art: { bg: 'bedroom', time: 'night', actors: [A('yusuf', 232, { lying: true, y: 316, z: 130, face: 'sleepy' })], props: [T('bed', 340, 430, { s: 1.4 }), T('blanket', 340, 430, { s: 1.4, z: 140 })], fx: [['zzz', 400, 280]] } },
    ],
    words: [{ w: 'bed', p: 'bed' }, { w: 'blanket', p: 'blanket' }, { w: 'moon', p: 'moon' }],
    quiz: [{ q: 'What scared Yusuf?', a: 'Thunder', w: ['A cat', 'A clown'] }, { q: 'Who heard Yusuf’s whisper?', a: 'Allah', w: ['The rain', 'Nobody'] }],
    choose: { q: 'You feel scared at night. What can you do?', options: ['Make du’a to Allah', 'Kick and scream', 'Stay awake all night'], answer: 0, why: 'Allah is always near. He hears you, even when you whisper.' },
    quran: { s: 2, a: 186, w: [1, 6], en: 'When My servants ask about Me, I am near.' },
  },
  {
    id: 't1-dates', level: 1, title: 'Who Made the Dates?', theme: 'Thanking Allah', color: '#8A5A33',
    pages: [
      { t: 'Baba puts a plate of dates on the table. Yum!', art: { bg: 'kitchen', actors: [A('baba', 300, { face: 'happy', pose: 'give' }), A('bilal', 460, { face: 'happy' })], props: [T('dates', 380, 430)] } },
      { t: 'Bilal takes one. “Bismillah,” he says. He takes a big bite.', art: { bg: 'kitchen', actors: [A('bilal', 380, { face: 'happy', pose: 'hold', hold: { R: 'dates' } })] } },
      { t: '“Baba, where do dates come from?” “From a palm tree,” says Baba.', art: { bg: 'kitchen', actors: [A('baba', 300, { face: 'happy' }), A('bilal', 460, { face: 'calm' })], props: [T('dates', 380, 430)] } },
      { t: '“Then who made the palm tree?” asks Bilal.', art: { bg: 'kitchen', actors: [A('baba', 300, { face: 'calm', id: 'baba' }), A('bilal', 460, { face: 'calm', pose: 'think' })], fx: [['question', 460, 120]] },
        tap: { id: 'baba', prompt: 'Tap Baba to find out.', say: '“Allah made the tree. He sends the sun and the rain. Allah gives us our food.”', after: { bg: 'desert', actors: [A('baba', 300, { face: 'happy', pose: 'point' }), A('bilal', 440, { face: 'happy' })], props: [T('fruittree', 620, 470, { s: 1.2 })] } } },
      { t: 'Bilal looks at his date. It is sweet and sticky and brown.', art: { bg: 'kitchen', actors: [A('bilal', 380, { face: 'happy', pose: 'hold', hold: { R: 'dates' } })] } },
      { t: 'He licks his fingers. “Alhamdulillah,” he says. “Thank You, Allah.”', art: { bg: 'kitchen', actors: [A('baba', 300, { face: 'happy' }), A('bilal', 460, { face: 'happy', pose: 'dua' })], fx: [['hearts', 460, 130]] } },
    ],
    words: [{ w: 'dates', p: 'dates' }, { w: 'plate', p: 'plate' }, { w: 'tree', p: 'tree' }],
    quiz: [{ q: 'What did Bilal eat?', a: 'Dates', w: ['Pizza', 'Soup'] }, { q: 'What did Bilal say before eating?', a: 'Bismillah', w: ['Goodnight', 'Oops'] }],
    choose: { q: 'You finish your lunch. What do you say?', options: ['Alhamdulillah', 'More, now!', 'Yuck'], answer: 0, why: 'Every bite comes from Allah. Alhamdulillah is how we thank Him.' },
    quran: { s: 16, a: 53, w: [1, 6], en: 'Every good thing you have is from Allah.' },
  },
  {
    id: 't1-ant', level: 1, title: 'The Tiny Ant', theme: 'Allah sees everything', color: '#6A8E3C',
    pages: [
      { t: 'Safiya is playing in the grass. She sees a tiny black ant.', art: { bg: 'garden', actors: [A('safiya', 340, { face: 'happy', pose: 'point' })], props: [T('ant', 520, 470)] } },
      { t: 'The ant carries a crumb. The crumb is bigger than the ant!', art: { bg: 'garden', actors: [A('safiya', 300, { face: 'surprised', pose: 'point' })], props: [T('ant', 500, 470), T('crumb', 520, 462)] } },
      { t: 'The ant goes under a leaf. Now Safiya cannot see it.', art: { bg: 'garden', actors: [A('safiya', 320, { face: 'sad', pose: 'shrug' })], props: [T('plant', 520, 470)] } },
      { t: '“Teta, where did the ant go?”', art: { bg: 'garden', actors: [A('grandma', 260, { face: 'calm', id: 'teta' }), A('safiya', 420, { face: 'calm', pose: 'point' })], props: [T('plant', 600, 470)], fx: [['question', 420, 120]] },
        tap: { id: 'teta', prompt: 'Tap Teta to hear what she says.', say: '“We can’t see it. But Allah can. Allah sees everything.”', after: { bg: 'garden', actors: [A('grandma', 260, { face: 'happy', pose: 'point' }), A('safiya', 420, { face: 'surprised' })], props: [T('plant', 600, 470)], fx: [['sparkles', 600, 380]] } } },
      { t: '“Even a tiny ant under a leaf?” “Even that,” says Teta.', art: { bg: 'garden', time: 'dusk', actors: [A('grandma', 260, { face: 'happy' }), A('safiya', 420, { face: 'happy' })], props: [T('plant', 600, 470)] } },
      { t: 'Safiya puts a cookie crumb by the leaf. “Here you go, little ant.”', art: { bg: 'garden', time: 'dusk', actors: [A('safiya', 420, { face: 'happy', pose: 'give' })], props: [T('crumb', 560, 470), T('plant', 600, 470)], fx: [['hearts', 520, 380]] } },
    ],
    words: [{ w: 'ant', p: 'ant' }, { w: 'crumb', p: 'crumb' }, { w: 'flowers', p: 'flowers' }],
    quiz: [{ q: 'What did the ant carry?', a: 'A crumb', w: ['A ball', 'A shoe'] }, { q: 'Who can see the ant under the leaf?', a: 'Allah', w: ['Nobody', 'The cat'] }],
    choose: { q: 'Nobody is in the kitchen. You want a cookie. What do you do?', options: ['Ask Mama first', 'Take it quietly', 'Take two'], answer: 0, why: 'Allah sees us all the time. We do the right thing, even alone.' },
    quran: { s: 67, a: 19, w: [14, 17], en: 'He sees everything.' },
  },
];

export const TAWHEED_L2 = [
  {
    id: 't2-sky', level: 2, title: 'The Night Walk', theme: 'Allah the Creator (Rububiyyah)', color: '#24476B',
    pages: [
      { t: 'Uncle Idris took Hamza up the hill behind the farm. He carried a telescope on his back.', art: { bg: 'mountain', time: 'dusk', actors: [A('uncle', 300, { face: 'happy', pose: 'carry' }), A('hamza', 440, { face: 'happy' })], props: [T('telescope', 600, 450)] } },
      { t: 'By the time they reached the top, the sky was black and full of stars.', art: { bg: 'mountain', time: 'night', actors: [A('uncle', 300, { face: 'happy' }), A('hamza', 440, { face: 'surprised', pose: 'point' })] } },
      { t: 'Hamza looked through the telescope. The moon had grey holes all over it, like a cheese.', art: { bg: 'mountain', time: 'night', actors: [A('hamza', 380, { face: 'surprised' })], props: [T('telescope', 470, 450, { id: 'scope' })] },
        tap: { id: 'scope', prompt: 'Tap the telescope to look again.', say: '“Those are craters,” said Uncle Idris. “Some are bigger than a whole city.”', after: { bg: 'mountain', time: 'night', actors: [A('uncle', 280, { face: 'happy', pose: 'point' }), A('hamza', 440, { face: 'surprised' })], props: [T('telescope', 520, 450)], fx: [['sparkles', 660, 90]] } } },
      { t: '“Who keeps it all up there?” asked Hamza. “Why doesn’t the moon just fall on us?”', art: { bg: 'mountain', time: 'night', actors: [A('uncle', 300, { face: 'calm' }), A('hamza', 440, { face: 'calm', pose: 'think' })], fx: [['question', 440, 120]] } },
      { t: 'Uncle Idris smiled. “Allah made it, and Allah holds it in its place. Every single night.”', art: { bg: 'mountain', time: 'night', actors: [A('uncle', 300, { face: 'happy', pose: 'point' }), A('hamza', 440, { face: 'calm' })] } },
      { t: 'Some people know Allah made the world, he said. But they still ask stones and idols for help.', art: { bg: 'mountain', time: 'night', actors: [A('uncle', 300, { face: 'calm' }), A('hamza', 440, { face: 'surprised' })], props: [T('stone', 600, 470)] } },
      { t: '“That makes no sense,” said Hamza. “If Allah made the moon, I should ask Allah.” Uncle Idris laughed. “Exactly.”', art: { bg: 'mountain', time: 'night', actors: [A('uncle', 300, { face: 'happy' }), A('hamza', 440, { face: 'happy', pose: 'point' })], fx: [['idea', 440, 120]] } },
      { t: 'On the way down, Hamza kept turning round to look at the moon. He said “Subhanallah” so many times he lost count.', art: { bg: 'mountain', time: 'night', actors: [A('hamza', 360, { face: 'happy', pose: 'wave' }), A('uncle', 500, { face: 'happy', pose: 'carry' })], fx: [['sparkles', 660, 90]] } },
    ],
    words: [{ w: 'telescope', m: 'a tube with glass that makes far things look near' }, { w: 'crater', m: 'a big round hole in the ground of the moon' }, { w: 'Creator', m: 'the One who makes things from nothing: Allah' }, { w: 'Rabb', m: 'Lord: the One who creates, owns and looks after everything' }],
    quiz: [{ q: 'What did Hamza see on the moon?', a: 'Craters', w: ['Trees', 'Houses'] }, { q: 'Who holds the moon in its place?', a: 'Allah', w: ['The stars', 'Nobody'] }, { q: 'Since Allah made everything, who should we ask for help?', a: 'Allah', w: ['A lucky stone', 'The moon'] }],
    choose: { q: 'Your friend says the world just made itself. What could you ask him?', options: ['“Did your bike build itself?”', '“Who cares?”', 'Say nothing and walk off'], answer: 0, why: 'Even a bike needs a maker. The sky and the stars need a Maker far more.' },
    quran: { s: 3, a: 191, w: [13, 18], en: 'Our Lord, You did not create this for nothing. Glory be to You.' },
  },
  {
    id: 't2-birds', level: 2, title: 'The Bird Feeder', theme: 'Allah the Provider (Ar-Razzaq)', color: '#3BA7D1',
    pages: [
      { t: 'It had snowed all night. Idris pressed his nose to the window and counted six hungry birds in the garden.', art: { bg: 'snow', actors: [A('idris', 360, { face: 'sad', pose: 'point' })], props: [T('bird', 560, 420), T('bird', 640, 430)] } },
      { t: 'He made a bird feeder from an old bottle and filled it with seeds. Teta helped him hang it on the tree.', art: { bg: 'snow', actors: [A('grandma', 260, { face: 'happy', pose: 'point' }), A('idris', 420, { face: 'happy', pose: 'hold', hold: { R: 'seed' } })], props: [T('tree', 620, 470)] } },
      { t: 'Every morning Idris filled the feeder before school. The birds waited for him on the fence.', art: { bg: 'snow', time: 'dawn', actors: [A('idris', 380, { face: 'happy', pose: 'give' })], props: [T('bird', 560, 380), T('bird', 620, 390), T('bird', 680, 380)] } },
      { t: 'Then Idris caught a cold. For three whole days he stayed in bed, and nobody filled the feeder.', art: { bg: 'bedroom', actors: [A('idris', 232, { lying: true, y: 316, z: 130, face: 'sad' })], props: [T('bed', 340, 430, { s: 1.4 }), T('blanket', 340, 430, { s: 1.4, z: 140 })], fx: [['tear', 360, 300]] } },
      { t: '“My birds will starve,” he croaked. Teta opened the curtains. “Come and see.”', art: { bg: 'bedroom', actors: [A('grandma', 520, { face: 'happy', pose: 'point', id: 'teta' }), A('idris', 340, { face: 'sad' })], props: [T('bed', 340, 430, { s: 1.4 })] },
        tap: { id: 'teta', prompt: 'Tap Teta to look out of the window.', say: 'The birds were pecking berries off a bush and drinking from the melting snow.', after: { bg: 'snow', actors: [A('idris', 300, { face: 'surprised', pose: 'point' })], props: [T('bird', 520, 440), T('bird', 600, 450), T('plant', 680, 470)], fx: [['sparkles', 600, 380]] } } },
      { t: '“Who fed them?” asked Idris. “The One who fed them before you were born,” said Teta. “Allah, Ar-Razzaq.”', art: { bg: 'home', actors: [A('grandma', 280, { face: 'happy' }), A('idris', 430, { face: 'surprised' })] } },
      { t: 'She told him what the Prophet ﷺ said about birds. They leave hungry in the morning and come home full.', art: { bg: 'home', actors: [A('grandma', 280, { face: 'calm', pose: 'point' }), A('idris', 430, { face: 'calm' })], props: [T('bird', 620, 300)] } },
      { t: 'When Idris was better, he filled the feeder again. “I help,” he told the birds, “but Allah feeds you.”', art: { bg: 'snow', time: 'dawn', actors: [A('idris', 380, { face: 'happy', pose: 'give' })], props: [T('tree', 620, 470), T('bird', 560, 380), T('bird', 640, 390)], fx: [['hearts', 520, 300]] } },
    ],
    words: [{ w: 'feeder', m: 'a box or bottle that holds food for birds' }, { w: 'starve', m: 'to be very ill from having no food' }, { w: 'Ar-Razzaq', m: 'the Provider: a Name of Allah. He gives every living thing what it needs' }, { w: 'tawakkul', m: 'trusting Allah after you have done your part' }],
    quiz: [{ q: 'What did Idris make the feeder from?', a: 'An old bottle', w: ['A shoe box', 'A hat'] }, { q: 'Why did nobody fill the feeder?', a: 'Idris was ill in bed', w: ['It was too hot', 'The birds flew away'] }, { q: 'Who fed the birds while Idris was ill?', a: 'Allah', w: ['The cat', 'Nobody did'] }],
    choose: { q: 'You studied hard for a test. Now you feel worried. What is best?', options: ['Make du’a and trust Allah', 'Cry all night', 'Give up studying'], answer: 0, why: 'We do our part and then we trust Allah, like the birds who fly out every morning.' },
    hadith: { ar: 'لَوْ أَنَّكُمْ كُنْتُمْ تَوَكَّلُونَ عَلَى اللَّهِ حَقَّ تَوَكُّلِهِ لَرُزِقْتُمْ كَمَا تُرْزَقُ الطَّيْرُ، تَغْدُو خِمَاصًا وَتَرُوحُ بِطَانًا', en: 'If you trusted Allah as you truly should, He would provide for you as He provides for the birds. They go out hungry in the morning and come back full in the evening.', src: 'Tirmidhi 2344, Ibn Majah 4164' },
  },
  {
    id: 't2-charm', level: 2, title: 'The Lucky Bracelet', theme: 'Worship and du’a for Allah alone', color: '#B23A48',
    pages: [
      { t: 'The big spelling test was on Friday. Layla had been practising her words every night.', art: { bg: 'bedroom', time: 'night', actors: [A('layla', 380, { face: 'calm', pose: 'hold', hold: { R: 'book' } })], props: [T('lantern', 560, 440)] } },
      { t: 'On Thursday, Zara showed her a blue bracelet with an eye on it. “It’s lucky,” Zara said. “Wear it and you can’t fail.”', art: { bg: 'class', actors: [A('zara', 320, { face: 'happy', pose: 'give' }), A('layla', 460, { face: 'surprised' })] } },
      { t: 'Layla nearly took it. Then she remembered something Ustadha Huda had said in class.', art: { bg: 'class', actors: [A('layla', 400, { face: 'calm', pose: 'think' })], fx: [['idea', 400, 120]] } },
      { t: 'She went to find her. “Ustadha, can a bracelet help me pass?”', art: { bg: 'class', actors: [A('huda', 300, { face: 'calm', id: 'huda' }), A('layla', 450, { face: 'calm' })], props: [T('desk', 600, 460)] },
        tap: { id: 'huda', prompt: 'Tap Ustadha Huda to hear her answer.', say: '“A bracelet can’t hear you or help you. Only Allah can. Study hard, then ask Him.”', after: { bg: 'class', actors: [A('huda', 300, { face: 'happy', pose: 'point' }), A('layla', 450, { face: 'happy' })], props: [T('desk', 600, 460)], fx: [['sparkles', 380, 120]] } } },
      { t: 'That night Layla went over her hardest words one more time. Necessary. Separate. Because.', art: { bg: 'bedroom', time: 'night', actors: [A('layla', 380, { face: 'calm', pose: 'hold', hold: { R: 'book' } })], props: [T('lantern', 560, 440)] } },
      { t: 'Before bed she made du’a. “Ya Allah, help me remember what I learned.”', art: { bg: 'bedroom', time: 'night', actors: [A('layla', 380, { face: 'calm', pose: 'dua' })], props: [T('mat', 380, 470)] } },
      { t: 'She got eighteen out of twenty. She spelled “necessary” wrong, again. But she laughed about it.', art: { bg: 'class', actors: [A('layla', 380, { face: 'happy', pose: 'hold', hold: { R: 'paper' } })], fx: [['star', 380, 110]] } },
      { t: 'At home time she told Zara what Ustadha had said. Zara looked at the bracelet for a long time. Then she put it in her bag.', art: { bg: 'street', actors: [A('layla', 320, { face: 'calm', pose: 'point' }), A('zara', 460, { face: 'calm', pose: 'think' })] } },
    ],
    words: [{ w: 'practise', m: 'to do something again and again to get better at it' }, { w: 'charm', m: 'a thing people wear because they think it brings luck. It cannot help or harm' }, { w: 'du’a', m: 'asking Allah, in your own words' }, { w: 'shirk', m: 'giving to anyone or anything what belongs only to Allah' }],
    quiz: [{ q: 'What did Zara say the bracelet would do?', a: 'Make Layla pass', w: ['Keep her warm', 'Tell the time'] }, { q: 'What did Layla do the night before the test?', a: 'Practised and made du’a', w: ['Watched TV all night', 'Wore the bracelet'] }, { q: 'Who can really help us?', a: 'Allah alone', w: ['A lucky bracelet', 'A blue eye'] }],
    choose: { q: 'Someone gives you a “lucky” key ring for a football match. What do you do?', options: ['Say thanks, but put your trust in Allah', 'Kiss it before every goal', 'Never play without it'], answer: 0, why: 'Things cannot bring luck. We train hard and ask Allah.' },
    quran: { s: 1, a: 5, w: [1, 4], en: 'You alone we worship, and You alone we ask for help.' },
  },
  {
    id: 't2-names', level: 2, title: 'A Name on the Fridge', theme: 'Allah’s beautiful Names', color: '#C9A24A',
    pages: [
      { t: 'Every Saturday, Mama stuck a new card on the fridge. Each card had one of Allah’s Names on it.', art: { bg: 'kitchen', actors: [A('mama', 300, { face: 'happy', pose: 'hold', hold: { R: 'paper' } }), A('omar', 450, { face: 'calm' })] } },
      { t: 'This week’s card said Ar-Rahman. “The Most Merciful,” Mama read. “His mercy is bigger than everything.”', art: { bg: 'kitchen', actors: [A('mama', 300, { face: 'happy', pose: 'point' }), A('omar', 450, { face: 'happy' })], fx: [['hearts', 300, 120]] } },
      { t: 'On Monday Omar broke his little brother’s toy car. He hid it under the sofa and said nothing.', art: { bg: 'home', actors: [A('omar', 360, { face: 'sad', pose: 'hold', hold: { R: 'toycar' } })], fx: [['crack', 400, 360]] } },
      { t: 'All day his tummy felt funny. At dinner he could not finish his rice.', art: { bg: 'kitchen', actors: [A('omar', 380, { face: 'sad' })], props: [T('plate', 500, 440)] } },
      { t: 'Then he saw the card on the fridge. Ar-Rahman.', art: { bg: 'kitchen', actors: [A('omar', 340, { face: 'calm', pose: 'think', id: 'omar' })], props: [T('paper', 560, 300, { id: 'card' })] },
        tap: { id: 'card', prompt: 'Tap the card on the fridge.', say: 'Omar said sorry to Allah in his heart. Then he went to find Adam.', after: { bg: 'home', actors: [A('omar', 320, { face: 'sad', pose: 'give', hold: { R: 'toycar' } }), A('adam', 470, { face: 'surprised' })] } } },
      { t: '“I broke it,” he said. “I’m sorry. You can have my blue car instead.”', art: { bg: 'home', actors: [A('omar', 320, { face: 'calm', pose: 'give' }), A('adam', 470, { face: 'happy' })], props: [T('toycar', 420, 470, { color: '#3B82B5' })] } },
      { t: 'Adam hugged him. Then he zoomed the blue car straight into the cat.', art: { bg: 'home', actors: [A('adam', 360, { face: 'happy', pose: 'cheer' }), A('omar', 500, { face: 'happy' })], props: [T('cat', 620, 470)], fx: [['hearts', 430, 120]] } },
      { t: 'Next Saturday the new card said As-Sami’, the All-Hearing. Omar already knew what that one meant.', art: { bg: 'kitchen', actors: [A('mama', 300, { face: 'happy', pose: 'hold', hold: { R: 'paper' } }), A('omar', 450, { face: 'happy', pose: 'point' })] } },
    ],
    words: [{ w: 'mercy', m: 'kindness and forgiving, even when someone gets it wrong' }, { w: 'Ar-Rahman', m: 'the Most Merciful: a Name of Allah' }, { w: 'As-Sami’', m: 'the All-Hearing: a Name of Allah' }, { w: 'Al-Asma’ al-Husna', m: 'Allah’s most beautiful Names' }],
    quiz: [{ q: 'What did Mama put on the fridge?', a: 'A card with a Name of Allah', w: ['A shopping list', 'A drawing of a cat'] }, { q: 'What did Omar break?', a: 'Adam’s toy car', w: ['A plate', 'The fridge'] }, { q: 'What does Ar-Rahman mean?', a: 'The Most Merciful', w: ['The All-Seeing', 'The Strong'] }],
    choose: { q: 'You learn that Allah is As-Sami’, the All-Hearing. What could you do?', options: ['Make du’a more often', 'Shout your du’a', 'Stop talking to Allah'], answer: 0, why: 'He hears every word, even a whisper. So we call on Him by His Names.' },
    quran: { s: 7, a: 180, w: [1, 5], en: 'Allah has the most beautiful Names, so call on Him by them.' },
  },
  {
    id: 't2-ibrahim', level: 2, title: 'The Boy Who Asked Questions', theme: 'Ibrahim and the true Lord', color: '#E07A3C',
    pages: [
      { t: 'Ustadha Huda turned off the classroom lights. “Today’s story begins at night,” she said, “a very long time ago.”', art: { bg: 'class', time: 'night', actors: [A('huda', 300, { face: 'calm', pose: 'point' }), A('safiya', 460, { face: 'surprised' }), A('hamza', 580, { face: 'surprised' })] } },
      { t: '“There was a young man called Ibrahim. His people bowed down to statues of stone. Ibrahim could not see why.”', art: { bg: 'class', time: 'night', actors: [A('huda', 300, { face: 'calm' }), A('safiya', 460, { face: 'calm' }), A('hamza', 580, { face: 'calm', pose: 'think' })], props: [T('stone', 680, 470)] } },
      { t: '“One night he saw a bright star. ‘Is this my Lord?’ he asked. But the star set and was gone.”', art: { bg: 'desert', time: 'night', props: [T('star', 520, 160, { s: 1.6, color: '#FFF3C4' })], fx: [['sparkles', 520, 140]] } },
      { t: '“Then the moon rose, and later the sun. Both of them set too. Ibrahim said, ‘I love nothing that disappears.’”', art: { bg: 'desert', time: 'dusk', fx: [['question', 400, 140]] } },
      { t: '“My Lord is the One who made the sky and the earth,” said Ibrahim. “He never sets and never sleeps.”', art: { bg: 'desert', time: 'dawn', fx: [['sparkles', 400, 120]] } },
      { t: 'Hamza put his hand up. “Did his people listen?”', art: { bg: 'class', actors: [A('huda', 300, { face: 'calm', id: 'huda' }), A('hamza', 520, { face: 'calm', pose: 'point' })] },
        tap: { id: 'huda', prompt: 'Tap Ustadha Huda to hear what happened.', say: '“No. They were so angry that they threw him into a huge fire.”', after: { bg: 'class', actors: [A('huda', 300, { face: 'calm', pose: 'point' }), A('hamza', 520, { face: 'surprised' }), A('safiya', 640, { face: 'surprised' })], fx: [['steam', 420, 150]] } } },
      { t: '“But Allah told the fire to be cool and safe. Ibrahim walked out without a single burn.”', art: { bg: 'class', actors: [A('huda', 300, { face: 'happy', pose: 'point' }), A('safiya', 460, { face: 'happy', pose: 'cheer' }), A('hamza', 580, { face: 'happy' })], fx: [['sparkles', 450, 120]] } },
      { t: 'Safiya thought about it all the way home. Stars set. The moon sets. Allah is always there.', art: { bg: 'street', time: 'dusk', actors: [A('safiya', 380, { face: 'calm', pose: 'think' })], fx: [['idea', 380, 120]] } },
    ],
    words: [{ w: 'statue', m: 'a shape of a person or animal made from stone or wood' }, { w: 'set', m: 'to go down and disappear, like the sun in the evening' }, { w: 'Prophet', m: 'a man Allah chose to bring His message to people' }, { w: 'Lord', m: 'the One who made us and looks after us: Allah' }],
    quiz: [{ q: 'What did Ibrahim’s people bow down to?', a: 'Statues of stone', w: ['The sea', 'A king'] }, { q: 'Why was the star not his Lord?', a: 'It set and disappeared', w: ['It was too small', 'It was blue'] }, { q: 'What did Allah tell the fire?', a: 'Be cool and safe', w: ['Burn brighter', 'Go out for ever'] }],
    choose: { q: 'Your friends all do something wrong and laugh at you for not joining in. What would Ibrahim do?', options: ['Stay with the truth, kindly', 'Join in to fit in', 'Laugh at them back'], answer: 0, why: 'Ibrahim stood alone with the truth, and Allah looked after him.' },
    quran: { s: 21, a: 69, w: [1, 7], en: 'We said: O fire, be cool and safe for Ibrahim.' },
  },
  {
    id: 't2-ahad', level: 2, title: 'Ahad, Ahad', theme: 'Holding on to Tawheed', color: '#F08A3C',
    pages: [
      { t: 'The masjid open day was on Saturday, and Imam Rashid had chosen Bilal to give the adhan.', art: { bg: 'masjid', actors: [A('imam', 300, { face: 'happy', pose: 'point' }), A('bilal', 460, { face: 'surprised', kufi: '#fff' })] } },
      { t: '“Why me?” Bilal asked. “Because of your name,” said the Imam. “Do you know who the first Bilal was?”', art: { bg: 'masjid-in', actors: [A('imam', 300, { face: 'happy' }), A('bilal', 460, { face: 'calm', kufi: '#fff', pose: 'think' })], fx: [['question', 460, 120]] } },
      { t: '“Bilal ibn Rabah lived in Makkah. He was a slave, and his master worshipped idols.”', art: { bg: 'masjid-in', actors: [A('imam', 300, { face: 'calm', pose: 'point' }), A('bilal', 460, { face: 'calm', kufi: '#fff' })] } },
      { t: '“When Bilal became Muslim, his master was furious. He made him lie on the burning sand to make him give up.”', art: { bg: 'desert', fx: [['steam', 400, 400]] } },
      { t: '“But Bilal would only say one word, over and over. Ahad. Ahad. One. One.”', art: { bg: 'desert', time: 'dusk', fx: [['sparkles', 400, 200]] } },
      { t: 'Bilal felt his throat go tight. “What happened to him?”', art: { bg: 'masjid-in', actors: [A('imam', 300, { face: 'happy', id: 'imam' }), A('bilal', 460, { face: 'sad', kufi: '#fff' })] },
        tap: { id: 'imam', prompt: 'Tap Imam Rashid to hear the end of the story.', say: '“He was set free. And the Prophet ﷺ chose him to call the very first adhan.”', after: { bg: 'masjid-in', actors: [A('imam', 300, { face: 'happy', pose: 'point' }), A('bilal', 460, { face: 'happy', kufi: '#fff' })], fx: [['sparkles', 380, 120]] } } },
      { t: 'On Saturday Bilal’s legs were shaking. Then he thought of the hot sand, and the word Ahad. His voice came out strong.', art: { bg: 'masjid', actors: [A('bilal', 400, { face: 'calm', kufi: '#fff', pose: 'dua' })], fx: [['notes', 400, 120]] } },
      { t: 'Afterwards a visitor asked what the adhan meant. Bilal held up one finger. “It starts with this. Allah is One.”', art: { bg: 'masjid', actors: [A('bilal', 340, { face: 'happy', kufi: '#fff', pose: 'point' }), A('salma', 500, { face: 'happy' })], fx: [['star', 340, 110]] } },
    ],
    words: [{ w: 'adhan', m: 'the call to prayer' }, { w: 'slave', m: 'a person who was owned by another person and not free' }, { w: 'Ahad', m: 'One: Allah is One, with no partner' }, { w: 'furious', m: 'very, very angry' }],
    quiz: [{ q: 'Who chose Bilal to give the adhan?', a: 'Imam Rashid', w: ['His teacher', 'His sister'] }, { q: 'What did Bilal ibn Rabah keep saying?', a: 'Ahad, Ahad', w: ['Help me', 'I give up'] }, { q: 'What does Ahad mean?', a: 'One', w: ['Strong', 'Hot'] }],
    choose: { q: 'Someone makes fun of you for praying at school. What can you do?', options: ['Keep praying, and stay calm and kind', 'Stop praying for ever', 'Shout at them'], answer: 0, why: 'Bilal held on to “Ahad” in a much harder test. Allah gives strength to those who hold on.' },
    quran: { s: 2, a: 163, w: [1, 10], en: 'Your God is One God. There is no god but Him, the Most Merciful, the Most Kind.' },
  },
];

export const TAWHEED = [...TAWHEED_L1, ...TAWHEED_L2];
