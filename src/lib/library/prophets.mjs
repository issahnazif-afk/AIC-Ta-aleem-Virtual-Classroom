// Stories of the Prophets: the stories Allah tells in the Qur'an, retold simply for Levels 2 and 3 (ages 7–10).
// Same book shape as the Reading Library (level2.mjs), so each book gets the reader, the read-aloud voice, the games,
// stars and passport stamps. Written for Ta'aleem from the Qur'an itself (the ayat are given with each book).
//
// The rules for these books:
//   - Nothing is added to what a Prophet says. His words, and Allah's, are only a faithful simple meaning of the ayah,
//     always introduced with "Allah tells us in the Qurʾan", and they are read by the narrator, never a character voice
//     (SPEAKERS in src/lib/narration-text.mjs).
//   - No Prophet, and no person at all, is drawn: the pictures show only places and things (the fire, the ark, the
//     whale, the parted sea).
//   - The ayah at the end comes from the Tanzil text (scripts/stories/quran.mjs), never typed, and plays with the
//     class's reciter.
// cover: the picture on the shelf (a scene, never a person). Checked by Ustadh Issah before use with the class (docs/reading-library-review.md).

const T = (p, x, y, o = {}) => ({ p, x, y, ...o });

export const PROPHETS = [
  {
    id: 'p-ibrahim', level: 2, title: 'Ibrahim and the Fire', theme: 'Trusting Allah alone', color: '#D4562E',
    ayat: 'Al-Anbiya 21:51–70 and As-Saffat 37:83–98',
    cover: { bg: 'garden', time: 'dusk', props: [T('coolfire', 400, 440)], fx: [['sparkles', 400, 120]] },
    pages: [
      { t: 'Long ago, Allah gave a young man called Ibrahim (peace be upon him) wisdom. Allah chose him to be a Prophet.', art: { bg: 'desert', time: 'dawn', fx: [['sparkles', 400, 120]] } },
      { t: 'Ibrahim’s people carved statues out of stone and bowed down to them. Allah tells us in the Qurʾan that Ibrahim asked, “What are these statues you worship?”', art: { bg: 'desert', props: [T('stone', 300, 440, { s: 1.4 }), T('stone', 470, 450, { s: 1.8 }), T('stone', 620, 440, { s: 1.2 })], fx: [['question', 400, 120]] } },
      { t: '“We found our fathers worshipping them,” they said. Ibrahim said their real Lord is the Lord of the heavens and the earth.', art: { bg: 'desert', time: 'dusk', props: [T('star', 220, 120, { s: 1.2, color: '#FFF3C4' }), T('star', 600, 90, { s: 0.9, color: '#FFF3C4' })] } },
      { t: 'One day, when the people were away, Ibrahim broke the statues into pieces. He left only the biggest one.', art: { bg: 'desert', props: [T('stone', 250, 460, { s: 0.7 }), T('stone', 330, 470, { s: 0.6 }), T('stone', 420, 440, { s: 2.2 }), T('stone', 560, 465, { s: 0.7 }), T('stone', 630, 470, { s: 0.5 })] } },
      { t: 'When they came back, they were furious. “Who has done this to our gods?” they asked.', art: { bg: 'desert', time: 'dusk', props: [T('stone', 300, 465, { s: 0.7 }), T('stone', 420, 440, { s: 2.2 }), T('stone', 540, 465, { s: 0.6 })], fx: [['steam', 380, 150], ['question', 520, 120]] } },
      { t: 'Allah tells us in the Qurʾan that Ibrahim told them, “Ask them, if they can speak.” But statues cannot speak, and the people knew it.', art: { bg: 'desert', time: 'dusk', props: [T('stone', 420, 440, { s: 2.2 })], fx: [['question', 420, 150]] } },
      { t: 'Still they would not listen. “Burn him!” they shouted. They built a huge fire and threw Ibrahim into it.', art: { bg: 'desert', time: 'night', props: [T('bigfire', 400, 440, { id: 'fire' })] },
        tap: { id: 'fire', prompt: 'Tap the fire to hear what Allah said.', say: 'Allah tells us in the Qurʾan that He said, “O fire, be cool and safe for Ibrahim.”', after: { bg: 'garden', time: 'night', props: [T('coolfire', 400, 440)], fx: [['sparkles', 400, 150]] } } },
      { t: 'The fire did not hurt him at all. They had planned to harm Ibrahim, but Allah made their plan fail.', art: { bg: 'garden', props: [T('coolfire', 400, 440)], fx: [['sparkles', 400, 120], ['sparkles', 640, 200]] } },
    ],
    words: [{ w: 'statue', m: 'a shape of a person or animal carved from stone or wood' }, { w: 'worship', m: 'to pray to and obey. We worship Allah alone' }, { w: 'furious', m: 'very, very angry' }, { w: 'Prophet', m: 'a man Allah chose to bring His message to people' }],
    quiz: [{ q: 'What did Ibrahim’s people bow down to?', a: 'Statues of stone', w: ['The sun', 'A tree'] }, { q: 'Which statue did Ibrahim leave?', a: 'The biggest one', w: ['The smallest one', 'None of them'] }, { q: 'What did Allah tell the fire?', a: 'Be cool and safe for Ibrahim', w: ['Burn even brighter', 'Go out for ever'] }],
    choose: { q: 'Everyone around you says something that is not true. What would Ibrahim do?', options: ['Say the truth kindly, and trust Allah', 'Pretend to agree with them', 'Make fun of them'], answer: 0, why: 'Ibrahim spoke the truth even when he stood alone, and Allah kept him safe.' },
    quran: { s: 21, a: 69, w: [1, 7], en: 'We said: O fire, be cool and safe for Ibrahim.' },
  },
  {
    id: 'p-nuh', level: 2, title: 'Nuh and the Ark', theme: 'Obeying Allah when others laugh', color: '#2F6FA8',
    ayat: 'Hud 11:25–48',
    cover: { bg: 'sea', rain: true, props: [T('ark', 400, 400, { s: 0.75 })] },
    pages: [
      { t: 'Allah sent the Prophet Nuh (peace be upon him) to his people with a clear warning. Allah tells us in the Qurʾan that Nuh said, “Worship only Allah. I fear for you a painful day.”', art: { bg: 'mountain', time: 'dawn', fx: [['sparkles', 400, 110]] } },
      { t: 'The leaders laughed at him. “You are only a man like us,” they said. “And only the weakest of us follow you.”', art: { bg: 'desert', time: 'dusk', props: [T('stone', 320, 450), T('stone', 520, 455, { s: 0.8 })], fx: [['question', 420, 130]] } },
      { t: 'Nuh kept calling his people to Allah for a very long time. But only a few of them believed.', art: { bg: 'desert', time: 'night', props: [T('oillamp', 400, 450, { s: 1.4 })], fx: [['sparkles', 400, 340]] } },
      { t: 'Then Allah told Nuh to build an ark, a very big boat. Allah watched over him as he worked.', art: { bg: 'garden', props: [T('ark', 420, 440, { s: 0.75 })] } },
      { t: 'Whenever the leaders walked past, they made fun of the ark. Nuh kept on building.', art: { bg: 'garden', time: 'dusk', props: [T('ark', 420, 440, { s: 0.75 })], fx: [['notes', 620, 130]] } },
      { t: 'When Allah’s command came, Nuh took a pair of every kind of animal. His family and the believers came too.', art: { bg: 'garden', props: [T('ark', 470, 420, { s: 0.7, id: 'ark' }), T('sheep', 150, 470, { s: 0.8 }), T('camel', 120, 450, { s: 0.6, back: true })] },
        tap: { id: 'ark', prompt: 'Tap the ark to fill it.', say: 'Two by two, the animals went inside the ark.', after: { bg: 'garden', props: [T('ark', 470, 420, { s: 0.7 })], fx: [['hearts', 470, 160]] } } },
      { t: 'Allah tells us in the Qurʾan that Nuh said, “Ride in it. In the name of Allah it sails and it stops.” The ark sailed on waves as high as mountains.', art: { bg: 'sea', rain: true, props: [T('ark', 400, 400, { s: 0.75 })] } },
      { t: 'Allah tells us in the Qurʾan that Nuh called, “My son, come and ride with us!” His son said, “I will go up a mountain. It will keep me safe from the water.” But a wave came between them, and his son was among those who drowned.', art: { bg: 'sea', rain: true, props: [T('ark', 560, 380, { s: 0.45 })] } },
      { t: 'Allah tells us in the Qurʾan that He said, “O earth, swallow your water! O sky, hold back your rain!” The ark came to rest on Mount Judi.', art: { bg: 'mountain', time: 'dawn', props: [T('ark', 430, 300, { s: 0.55 })], fx: [['sparkles', 600, 110]] } },
      { t: 'Nuh and the believers stepped out onto the land, safe, with peace and blessings from Allah.', art: { bg: 'mountain', props: [T('ark', 470, 300, { s: 0.5 }), T('sheep', 200, 470, { s: 0.8 }), T('bird', 640, 200)], fx: [['sparkles', 360, 120]] } },
    ],
    words: [{ w: 'warning', m: 'telling someone about a danger before it comes' }, { w: 'ark', m: 'a very big boat' }, { w: 'pair', m: 'two of the same kind, a male and a female' }, { w: 'believers', m: 'people who believe in Allah and obey Him' }],
    quiz: [{ q: 'What did Allah tell Nuh to build?', a: 'An ark', w: ['A tower', 'A house'] }, { q: 'What did the leaders do when they walked past?', a: 'They made fun of the ark', w: ['They helped Nuh build', 'They brought him wood'] }, { q: 'Where did the ark come to rest?', a: 'On Mount Judi', w: ['On a beach', 'In a big city'] }],
    choose: { q: 'People laugh at you for doing something good. What can you do?', options: ['Keep doing it, like Nuh', 'Stop at once', 'Laugh back at them'], answer: 0, why: 'Nuh kept building even when the leaders made fun of him, and Allah saved him and the believers.' },
    quran: { s: 11, a: 41, w: [1, 12], en: 'Nuh said: Ride in it. In the name of Allah it sails and it stops. My Lord is Forgiving and Merciful.' },
  },
  {
    id: 'p-yunus', level: 2, title: 'Yunus and the Whale', theme: 'Turning to Allah in hard times', color: '#1F5F8E',
    ayat: 'Al-Anbiya 21:87–88 and As-Saffat 37:139–148',
    cover: { bg: 'sea', props: [T('whale', 420, 380)] },
    pages: [
      { t: 'Yunus (peace be upon him) was one of Allah’s messengers. Allah tells us his story in the Qurʾan.', art: { bg: 'sea', fx: [['sparkles', 400, 110]] } },
      { t: 'One day Yunus left his people in anger. He hurried to a ship that was full of people.', art: { bg: 'beach', props: [T('boat', 520, 300, { s: 1.3 })] } },
      { t: 'Out at sea, the people on the ship drew lots. Yunus lost, and he went into the sea.', art: { bg: 'sea', time: 'dusk', props: [T('boat', 420, 300, { s: 1.4 })] } },
      { t: 'A huge fish swallowed him. Many people call it a whale.', art: { bg: 'sea', time: 'dusk', props: [T('whale', 420, 380)] } },
      { t: 'Inside the fish it was very dark. Yunus called out to Allah from the darkness.', art: { bg: 'undersea', time: 'night', props: [T('whale', 400, 330, { s: 1.3, held: true, color: '#2F5A8E' })] } },
      { t: 'Allah tells us in the Qurʾan that Yunus said, “There is no god but You. Glory be to You. I have done wrong.”', art: { bg: 'undersea', time: 'night', props: [T('whale', 400, 330, { s: 1.3, held: true, color: '#2F5A8E' })], fx: [['sparkles', 400, 120]] } },
      { t: 'Allah answered him and saved him from his sadness. Allah says He saves the believers in the same way.', art: { bg: 'undersea', props: [T('whale', 420, 300, { s: 1.1, held: true }), T('fish', 160, 380, { s: 1.4 }), T('fish', 660, 420, { s: 1.2, color: '#F6C64B' })], fx: [['bubbles', 200, 200]] } },
      { t: 'The fish put Yunus out on the open shore. He was weak and ill. Allah made a gourd plant grow over him.', art: { bg: 'beach', props: [T('gourd', 360, 460, { id: 'gourd' }), T('whale', 640, 300, { s: 0.45 })] },
        tap: { id: 'gourd', prompt: 'Tap the gourd plant.', say: 'Its big green leaves grew over Yunus while he was weak.', after: { bg: 'beach', props: [T('gourd', 360, 460, { s: 1.25 })], fx: [['sparkles', 360, 300]] } } },
      { t: 'Then Allah sent him to a hundred thousand people or more. They believed, and Allah let them enjoy life for a while.', art: { bg: 'garden', time: 'dawn', props: [T('fruittree', 600, 440), T('flowers', 220, 470)], fx: [['sparkles', 400, 120]] } },
    ],
    words: [{ w: 'ship', m: 'a big boat that carries people across the sea' }, { w: 'swallow', m: 'to take something into the mouth and down inside' }, { w: 'darkness', m: 'a place with no light at all' }, { w: 'gourd', m: 'a climbing plant with big leaves and round fruit, like a pumpkin' }],
    quiz: [{ q: 'What swallowed Yunus?', a: 'A huge fish', w: ['A big wave', 'A crocodile'] }, { q: 'What did Yunus say in the darkness?', a: 'There is no god but You', w: ['I am not afraid', 'Let me out, fish'] }, { q: 'What grew over Yunus on the shore?', a: 'A gourd plant', w: ['A palm tree', 'A rose bush'] }],
    choose: { q: 'You did something wrong and now you feel sad. What can you do?', options: ['Say sorry to Allah and ask Him for help', 'Hide it and hope nobody knows', 'Blame someone else'], answer: 0, why: 'Yunus turned to Allah in the dark, and Allah answered him.' },
    quran: { s: 21, a: 87, w: [15, 23], en: 'There is no god but You. Glory be to You. I have been one of those who did wrong.' },
  },
  {
    id: 'p-musa', level: 2, title: 'Musa and the Sea', theme: 'Allah is with us', color: '#3BA7D1',
    ayat: 'Ash-Shuʿara 26:52–67',
    cover: { bg: 'parted' },
    pages: [
      { t: 'Musa (peace be upon him) and the Children of Israel lived under Firaun, a cruel king. Allah tells us in the Qurʾan that He told Musa, “Travel by night with My servants. You will be followed.”', art: { bg: 'desert', time: 'night', fx: [['sparkles', 400, 110]] } },
      { t: 'Firaun sent men to every city to gather his army. He said, “They are only a small group, and they have made us angry.”', art: { bg: 'desert', time: 'dusk', fx: [['steam', 400, 160]] } },
      { t: 'Musa and his people travelled through the night. At sunrise, Firaun and his army came after them.', art: { bg: 'desert', time: 'dawn', props: [T('footprints', 400, 460)] } },
      { t: 'When the two groups saw each other, Musa’s people cried, “We will be caught!” In front of them was the sea.', art: { bg: 'beach', time: 'dawn', props: [T('footprints', 300, 470)], fx: [['question', 400, 130]] } },
      { t: 'Allah tells us in the Qurʾan that Musa said, “No! My Lord is with me. He will guide me.”', art: { bg: 'beach', time: 'dawn', fx: [['sparkles', 400, 120], ['sparkles', 620, 180]] } },
      { t: 'Allah told Musa to strike the sea with his staff. The sea split apart!', art: { bg: 'sea', props: [T('drop', 400, 200, { s: 1.6, id: 'sea' })], fx: [['sparkles', 400, 260]] },
        tap: { id: 'sea', prompt: 'Tap the sea to see what happened.', say: 'Allah tells us in the Qurʾan that each side was like a huge mountain.', after: { bg: 'parted', fx: [['sparkles', 400, 200]] } } },
      { t: 'Musa and his people crossed on the path between the two sides. Allah saved them all.', art: { bg: 'parted', props: [T('footprints', 400, 470)] } },
      { t: 'Firaun’s army went in after them. Then the water came back, and Allah drowned them.', art: { bg: 'sea', rain: true } },
      { t: 'Allah tells us in the Qurʾan that in this there is a sign for people. Allah is the Mighty, the Merciful.', art: { bg: 'beach', time: 'dawn', fx: [['sparkles', 400, 120]] } },
    ],
    words: [{ w: 'army', m: 'a very big group of soldiers' }, { w: 'sunrise', m: 'the time in the morning when the sun comes up' }, { w: 'staff', m: 'a long, strong walking stick' }, { w: 'guide', m: 'to show someone the way' }],
    quiz: [{ q: 'When did Firaun’s army come after them?', a: 'At sunrise', w: ['At midnight', 'At lunchtime'] }, { q: 'What did Musa say when his people were afraid?', a: 'My Lord is with me', w: ['Let us run back', 'We are lost'] }, { q: 'What did Musa strike the sea with?', a: 'His staff', w: ['A stone', 'A sword'] }],
    choose: { q: 'Something scary happens and you feel stuck. What would Musa do?', options: ['Trust that Allah is with him', 'Give up', 'Blame his friends'], answer: 0, why: 'Musa’s people were afraid, but Musa knew Allah was with him, and Allah opened a way.' },
    quran: { s: 26, a: 62, w: [1, 7], en: 'Musa said: No! My Lord is with me. He will guide me.' },
  },
];
