// The Seerah Quest episodes, step by step.
//   narrate: [source ids]   history, shown in English with the citation; "Show the source" gives Ibn Kathir's Arabic
//   guide:   text           the explorer's guide (instructions and game moments; never history)
//   stage:   A-F            the six stages of the design: Arrival, Explore and Discover, Challenge, Knowledge Archive, Final Quest, Reflection
//   scrolls: items          a hunt for knowledge scrolls in the valley; each scroll is a passage the student has already read
//   parkour: course         a climbing challenge (obby) with checkpoints and a lantern at the top; scrolls wait on the way
//   archive:                walk into the Knowledge Archive and reread every passage with its page
// Game text (guide, stage, scrolls, parkour) gives instructions only and passes the writing rules (scripts/seerah/lint.mjs).
// Every historical sentence comes from src/data/seerah/sources.json (Ibn Kathir, al-Bidaya wa'l-Nihaya).
// Knowledge questions only ask what those passages say.

export const EPISODES = [
  {
    n: 1, key: 'zamzam', blurb: 'A dream, a lost well, and a search in the heart of Makkah.', title: 'The Secret of Zamzam', ar: 'سِرُّ زَمْزَم', place: 'Makkah, in the days of ʿAbd al-Muttalib',
    sources: '2/303–305',
    summary: 'ʿAbd al-Muttalib is shown in his sleep where to dig for the lost well of Ismaʿil. Help him find the place, dig, and travel with the caravan to settle the dispute with Quraysh.',
    steps: [
      { do: 'stage', id: 'A' },
      { do: 'scene', time: 'dusk', at: [0, 140, 0, 0] },
      { do: 'fly', shots: [[[180, 90, 220], [0, 5, 0], 0], [[60, 30, 90], [0, 5, 0], 7], [[0, 3.5, 30], [0, 5, 0], 5]] },
      { do: 'guide', title: 'Makkah, long ago', text: 'You are an explorer in the valley of Makkah, in the days of ʿAbd al-Muttalib ibn Hashim, when his son al-Harith was still his only son. Walk with W A S D or the arrow keys, or the stick on the screen. Hold Shift to run, press Space to jump, and drag to look around. Go to the glowing lights.' },
      { do: 'narrate', ids: ['z-title'] },
      { do: 'goto', id: 'hijr', x: 0, z: -14, label: 'Al-Hijr, beside the House', objective: 'Go to al-Hijr, the low curved wall beside the House.' },
      { do: 'stage', id: 'B' },
      { do: 'scene', time: 'night' },
      { do: 'guide', title: 'Four nights', text: 'ʿAbd al-Muttalib slept here in al-Hijr, night after night. Listen to what he was told.' },
      { do: 'narrate', ids: ['z-dream'] },
      { do: 'order', title: 'The four names, night by night', text: 'Put the four names in the order he heard them.', items: ['Tayba', 'Barra', 'al-Madnuna', 'Zamzam'], src: 'z-dream' },
      { do: 'scene', time: 'dawn' },
      { do: 'guide', title: 'Find the signs', text: 'The description gave signs: the colony of the ants, and the crow with the white mark. Search the lights around the House for the place that shows both. (A game search: the other places are only for exploring.)' },
      { do: 'search', spots: [
        { id: 's1', x: 22, z: 16, label: 'A sandy patch', note: 'Only sand here.' },
        { id: 's2', x: -24, z: 10, label: 'Near the stones', note: 'No sign of ants or a crow here.' },
        { id: 'well', x: 14, z: -22, label: 'A place where ants gather', note: 'Ants are gathered here, and a crow with a white mark is pecking at the ground.', right: true },
      ], objective: 'Find the place with the ants and the crow.' },
      { do: 'note', ids: ['z-where'] },
      { do: 'scrolls', title: 'Scrolls in the valley', text: 'Pages of what you have read are lying around the valley. Find the scrolls to keep them in your Knowledge Archive. The gold lights count too.', objective: 'Find the scrolls', items: [{ src: 'z-title', x: -30, z: -30 }, { src: 'z-where', x: 34, z: 26 }] },
      { do: 'stage', id: 'C' },
      { do: 'dig', x: 14, z: -22, objective: 'Help with the digging: press and hold Dig.' },
      { do: 'narrate', ids: ['z-dig'] },
      { do: 'note', ids: ['z-umawi'] },
      { do: 'parkour', title: 'The rooftops of Makkah', text: 'A game challenge: run and jump across the rooftops and light the lantern on the highest roof. If you fall, you go back to the last flag. Two scrolls wait on the roofs.', objective: 'Reach the lantern on the highest roof', course: { x: 40, z: -48, axis: 'x', kind: 'roof', seed: 11 }, scrolls: [{ src: 'z-dig' }, { src: 'z-umawi' }] },
      { do: 'stage', id: 'D' },
      { do: 'archive', objective: 'Go into the Knowledge Archive, the stone hall with the books.' },
      { do: 'stage', id: 'E' },
      { do: 'scene', time: 'day' },
      { do: 'narrate', ids: ['z-claim'] },
      { do: 'journey', src: ['z-journey', 'z-graves'], objective: 'Travel with the caravan towards the north.' },
      { do: 'choice', q: 'They had given up hope and sat waiting. What did ʿAbd al-Muttalib decide?', options: ['To travel on and keep searching, hoping Allah would provide water', 'To wait where they were', 'To turn back to Makkah'], answer: 0, src: 'z-spring' },
      { do: 'spring' },
      { do: 'narrate', ids: ['z-spring', 'z-verdict'] },
      { do: 'scene', time: 'day', at: [10, -12, 14, -22] },
      { do: 'fillwell', x: 14, z: -22 },
      { do: 'narrate', ids: ['z-siqaya'] },
      { do: 'stage', id: 'F' },
      { do: 'quiz', questions: [
        { q: 'Where was ʿAbd al-Muttalib sleeping when he was told to dig?', a: 'In al-Hijr, beside the House', w: ['In his house in Makkah', 'In the desert'], src: 'z-dream' },
        { q: 'What was the fourth name he was told to dig?', a: 'Zamzam', w: ['Tayba', 'Barra'], src: 'z-dream' },
        { q: 'Who dug with him?', a: 'His son al-Harith, his only son at that time', w: ['The whole of Quraysh', 'A man from Jurhum'], src: 'z-dig' },
        { q: 'Whose well did Quraysh say it was?', a: 'The well of their father Ismaʿil', w: ['The well of Jurhum', 'The well of the soothsayer'], src: 'z-claim' },
        { q: 'What happened when ʿAbd al-Muttalib’s camel rose?', a: 'A spring of sweet water burst out from under its hoof', w: ['It led them to a well', 'Rain began to fall'], src: 'z-spring' },
        { q: 'What did Quraysh say after drinking?', a: 'The One who gave you this water in the desert is the One who gave you Zamzam', w: ['We will still go to the soothsayer', 'The water belongs to all of us'], src: 'z-verdict' },
      ] },
      { do: 'reflect', prompt: 'When all hope seemed gone, ʿAbd al-Muttalib chose to keep going and seek, and Allah gave them water. What can you keep going with, even when it feels hard?', options: ['Learning the Qurʾan', 'Being patient with my family', 'Praying on time', 'Helping someone who needs it'] },
    ],
  },
  {
    n: 2, key: 'elephant', blurb: 'An army marches on the Kaʿbah, and the House has a Lord who protects it.', title: 'The Year of the Elephant', ar: 'عَامُ الْفِيل', place: 'Yemen to Makkah', sources: '2/211–219',
    summary: 'Abraha marches on the Kaʿbah with his elephant. Follow his route, go with ʿAbd al-Muttalib to the king, lead the people of Makkah to safety, and witness how Allah protected His House.',
    steps: [
      { do: 'stage', id: 'A' },
      { do: 'scene', time: 'day', at: [0, 120, 0, 0] },
      { do: 'guide', title: 'A church in Sanaʿa', text: 'Far to the south, in Yemen, the ruler Abraha had a plan.' },
      { do: 'narrate', ids: ['e-qullays', 'e-anger'] },
      { do: 'route', title: 'Abraha’s march', text: 'Follow the march north. Tap the places in the order the army reached them.', stops: [
        { id: 'sanaa', name: 'Sanaʿa', x: 70, y: 86, src: 'e-march' },
        { id: 'khatham', name: 'The land of Khathʿam', x: 60, y: 60, src: 'e-nufayl' },
        { id: 'taif', name: 'al-Taʾif', x: 64, y: 34, src: 'e-taif' },
        { id: 'mughammas', name: 'al-Mughammas, near Makkah', x: 42, y: 16, src: 'e-camels' },
      ] },
      { do: 'stage', id: 'B' },
      { do: 'scene', time: 'day', at: [0, 40, 0, 0] },
      { do: 'scrolls', title: 'Scrolls in the town', text: 'Pages of what you have read are lying around the town. Find the scrolls to keep them in your Knowledge Archive. The gold lights count too.', objective: 'Find the scrolls', items: [{ src: 'e-anger', x: -26, z: 46 }, { src: 'e-camels', x: 32, z: 58 }] },
      { do: 'guide', title: 'A messenger', text: 'A messenger from the camp has come into Makkah, asking for the leader of Quraysh.' },
      { do: 'goto', id: 'hunata', x: 18, z: 34, label: 'The messenger from the camp', objective: 'Go to the messenger at the edge of the town.' },
      { do: 'narrate', ids: ['e-hunata'] },
      { do: 'stage', id: 'C' },
      { do: 'order', title: 'Reaching the king', text: 'ʿAbd al-Muttalib went to the camp. Who helped him reach the king, in order?', items: ['Dhu Nafr, his friend, a prisoner in the camp', 'Unays, the keeper of the elephant', 'Abraha, the king'], src: 'e-friends' },
      { do: 'narrate', ids: ['e-friends', 'e-meeting'] },
      { do: 'quote', ar: 'إِنِّي أَنَا رَبُّ الْإِبِلِ، وَإِنَّ لِلْبَيْتِ رَبًّا سَيَمْنَعُهُ', en: '“I am the lord of the camels, and the House has a Lord who will protect it.”', src: 'e-meeting' },
      { do: 'choice', q: 'What did ʿAbd al-Muttalib mean?', options: ['He could only look after what was his; the House belongs to Allah, who would protect it', 'He did not care about the House', 'He would fight the army for the House'], answer: 0, src: 'e-meeting', explain: 'He told Hunata the same: “This is the Sacred House of Allah … if He protects it, it is His Sanctuary and His House.”' },
      { do: 'stage', id: 'D' },
      { do: 'archive', objective: 'Go into the Knowledge Archive, the stone hall with the books.' },
      { do: 'stage', id: 'E' },
      { do: 'narrate', ids: ['e-mountains'] },
      { do: 'guide_groups', n: 6, objective: 'Lead the families of Makkah up to the mountain tops: tap each group of lanterns.' },
      { do: 'parkour', title: 'The rocky path', text: 'A game challenge: climb the rocky ledges towards the mountains and light the lantern at the lookout. If you fall, you go back to the last flag. Two scrolls wait on the ledges.', objective: 'Reach the lantern at the lookout', course: { x: -30, z: -45, axis: '-z', kind: 'rock', seed: 23 }, scrolls: [{ src: 'e-hunata' }, { src: 'e-meeting' }] },
      { do: 'goto', id: 'door', x: -2, z: 9, label: 'The door of the Kaʿbah', objective: 'Go to the door of the Kaʿbah.' },
      { do: 'narrate', ids: ['e-dua', 'e-peaks'] },
      { do: 'scene', time: 'dawn' },
      { do: 'elephant' },
      { do: 'narrate', ids: ['e-elephant'] },
      { do: 'birds' },
      { do: 'narrate', ids: ['e-birds', 'e-abraha'] },
      { do: 'scene', time: 'day', at: [0, 40, 0, 0] },
      { do: 'narrate', ids: ['e-surah'] },
      { do: 'recite', surah: 105, ayahs: 5 },
      { do: 'narrate', ids: ['e-meaning', 'e-year'] },
      { do: 'stage', id: 'F' },
      { do: 'quiz', questions: [
        { q: 'What did Abraha build in Sanaʿa?', a: 'A church, al-Qullays, to turn the Arabs’ pilgrimage to it', w: ['A fort', 'A palace for the Negus'], src: 'e-qullays' },
        { q: 'Who became Abraha’s guide in the land of the Arabs?', a: 'Nufayl ibn Habib al-Khathʿami', w: ['Dhu Nafr', 'Hunata'], src: 'e-nufayl' },
        { q: 'What did ʿAbd al-Muttalib ask Abraha for?', a: 'His two hundred camels', w: ['To leave the Kaʿbah alone', 'A third of the wealth of Tihama'], src: 'e-meeting' },
        { q: 'What did ʿAbd al-Muttalib tell Quraysh to do?', a: 'Leave Makkah and shelter on the mountain tops', w: ['Fight the army', 'Hide inside the Kaʿbah'], src: 'e-mountains' },
        { q: 'What did the elephant Mahmud do when turned towards Makkah?', a: 'It knelt and would not go on', w: ['It charged forward', 'It ran away to the sea'], src: 'e-elephant' },
        { q: 'According to Ibn Kathir, who was the victory for?', a: 'The Sacred House, as a preparation for the sending of Muhammad ﷺ', w: ['Quraysh, against the Abyssinians', 'The tribes of Yemen'], src: 'e-meaning' },
      ] },
      { do: 'reflect', prompt: '“The House has a Lord who will protect it.” ʿAbd al-Muttalib did his part, and trusted Allah with what was beyond him. When have you done your part and left the rest to Allah?', options: ['Before a test, after I studied', 'When someone I love was ill', 'When I was worried about something', 'I want to remember this next time'] },
    ],
  },
];

// The rest of the journey, from the design document. They open once their sources have been researched and reviewed.
export const LATER = [
  'The Birth of the Messenger ﷺ', 'The Trustworthy One', 'The First Revelation', 'The First Believers', 'The Courage of Bilal (RA)',
  'Escape to Abyssinia', 'The Years of Hardship', 'The Great Migration to Madinah', 'Building the Muslim Community',
  'Badr, Uhud and the Trench', 'The Treaty and the Return to Makkah', 'The Final Years and the Legacy',
];
