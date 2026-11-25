// Noor Trail: story and level content (plain data, no imports).
// 6 lands x 5 stages = 30 stages, each with its own guide.
// Content rules: no hadith or Qur'an quotes, no sayings attributed to anyone,
// no "magic" wording, spiders are only game villains.

export const TITLE = 'Noor Trail';

export const QUEST = {
  name: 'The Map of Light',
  intro: [
    "Long ago, the people of a quiet green valley kept a special map called the Map of Light. It did not lead to gold or jewels. It showed the way to the Garden of Light, a peaceful place where friends meet to learn, share and thank Allah.",
    "One stormy night, a crowd of zombie spiders crept out of the deep caves. They are green-grey, wobbly and very grumpy, and their eyes glow like old torches. They tore the map into six pieces and hid them across six lands.",
    "The teachers of the valley, thirty kind Sheikhs and Ustadhs, need a fast and brave runner. That runner is you! A different teacher will guide you through every stage of the trail.",
    "Remember your best tool: say SubhanAllah (Glory be to Allah) out loud, and a golden shield of light will wrap around you. Zombie spiders cannot get through it. Say Bismillah, tie your laces, and let's run!"
  ],
  ending: [
    "The sixth piece clicks into place and the Map of Light glows from edge to edge. Alhamdulillah, all praise is for Allah! The path to the Garden of Light shines bright, and the zombie spiders scuttle back to their caves, sulking.",
    "All thirty teachers cheer for you. You ran with patience, you never gave up, and you remembered Allah when things got scary. That is the bravest kind of running.",
    "The map is whole, but the trail is always open. Come back any time to beat your best score, grow your garden, and help a friend start their own run. Barakallahu fik, champion!"
  ]
};

export const LANDS = [
  {
    id: 'oasis', n: 1,
    name: 'The Whispering Oasis',
    tagline: 'Palm gardens, cool water and your very first run.',
    intro: "The first piece of the map is hidden somewhere in the palm gardens. Little water channels run beside the path, and the palms whisper in the breeze. Learn to jump, slide and raise your shield here before the trail gets tricky.",
    treasure: { name: 'Map of Light: piece 1 of 6', text: "A small green chest under the tallest palm holds the first piece. It shows a winding path heading out into the sand." }
  },
  {
    id: 'dunes', n: 2,
    name: 'The Golden Dunes',
    tagline: 'Hot sand, old ruins and something big behind you.',
    intro: "Beyond the oasis lie rolling golden dunes and the crumbling walls of old ruins. The sand is slippery and the sun is bright. Watch out: here, a big zombie spider likes to chase runners from behind!",
    treasure: { name: 'Map of Light: piece 2 of 6', text: "Inside a sandy stone chest you find the second piece. It shows lanterns and arches far to the east." }
  },
  {
    id: 'bazaar', n: 3,
    name: 'The Lantern Bazaar',
    tagline: 'A busy evening market full of arches, carts and secrets.',
    intro: "The sun has set and the lanterns are glowing over the market street. Carts roll, jars wobble and banners hang low under the arches. The spiders hide behind the stalls, so stay sharp and keep collecting stars.",
    treasure: { name: 'Map of Light: piece 3 of 6', text: "A carved wooden chest behind the spice stall holds the third piece. It points down into a dark, sparkling tunnel." }
  },
  {
    id: 'caves', n: 4,
    name: 'The Crystal Caves',
    tagline: 'Glowing crystals, dark tunnels and the spiders’ home.',
    intro: "This is where the zombie spiders live. Crystals glow blue and purple on the walls, and webs hang from the ceiling. Spiders drop from above here, so keep your shield ready and your voice strong.",
    treasure: { name: 'Map of Light: piece 4 of 6', text: "Deep in the caves, a crystal chest sparkles open. The fourth piece shows the sea and a harbour in the morning light." }
  },
  {
    id: 'cliffs', n: 5,
    name: 'The Windy Cliffs',
    tagline: 'Sea breeze, rope bridges and a harbour full of boxes.',
    intro: "You burst out of the caves onto tall cliffs above the sea. The wind is strong, the path is narrow, and the harbour below is stacked with crates and barrels. The spiders followed you, and they are not happy!",
    treasure: { name: 'Map of Light: piece 5 of 6', text: "A sea chest tied to the harbour wall holds the fifth piece. Only one piece is missing now, and it glows like moonlight." }
  },
  {
    id: 'light', n: 6,
    name: 'The Garden of Light',
    tagline: 'White marble paths under the stars. The final run.',
    intro: "The night sky is full of stars above white marble paths, fountains and gentle lamps. This is the Garden of Light, and the last piece of the map is hidden here. Every spider left in the six lands has come to stop you. Bismillah, this is it!",
    treasure: { name: 'Map of Light: piece 6 of 6', text: "A shining white chest opens by itself as you arrive. The final piece slides into place and the whole Map of Light begins to glow." }
  }
];

export const GUIDES = {
  bilal:      { name: 'Ustadh Bilal',       title: 'Ustadh', look: { skin: '#8d5524', beard: '#2b1a0e', turban: '#ffffff', hat: 'kufi',   thobe: '#f4f1ea', bisht: null,      glasses: false }, trait: 'cheerful coach who loves warm-ups' },
  mansur:     { name: 'Sheikh Mansur',      title: 'Sheikh', look: { skin: '#c68642', beard: '#d9d9d9', turban: '#f5f5f0', hat: 'imama',  thobe: '#e8e2d0', bisht: '#6b4423', glasses: true  }, trait: 'gardener who names every palm tree' },
  tariq:      { name: 'Ustadh Tariq',       title: 'Ustadh', look: { skin: '#e0ac69', beard: null,      turban: '#2e7d32', hat: 'kufi',   thobe: '#dfe9e0', bisht: null,      glasses: false }, trait: 'speedy runner who counts everything' },
  rafiq:      { name: 'Sheikh Rafiq',       title: 'Sheikh', look: { skin: '#5c3a21', beard: '#9e9e9e', turban: '#ffffff', hat: 'imama',  thobe: '#ffffff', bisht: '#1f3a5f', glasses: false }, trait: 'loves riddles and puzzles' },
  jalal:      { name: 'Sheikh Jalal',       title: 'Sheikh', look: { skin: '#f1c27d', beard: '#f2f2f2', turban: '#e6e0cf', hat: 'imama',  thobe: '#d7ccb4', bisht: '#3e2723', glasses: true  }, trait: 'calm and brave, never rushes' },
  kareem:     { name: 'Ustadh Kareem',      title: 'Ustadh', look: { skin: '#a0662f', beard: '#3b2414', turban: '#c62828', hat: 'ghutra', thobe: '#ffffff', bisht: null,      glasses: false }, trait: 'shares his snacks with everyone' },
  nasir:      { name: 'Sheikh Nasir',       title: 'Sheikh', look: { skin: '#7a4a2a', beard: '#bdbdbd', turban: '#fafafa', hat: 'ghutra', thobe: '#eeeae0', bisht: '#8d6e63', glasses: false }, trait: 'old desert guide who reads the wind' },
  faisal:     { name: 'Ustadh Faisal',      title: 'Ustadh', look: { skin: '#d8a06a', beard: '#1b1b1b', turban: '#37474f', hat: 'kufi',   thobe: '#cfd8dc', bisht: null,      glasses: true  }, trait: 'map nerd with too many pencils' },
  murad:      { name: 'Sheikh Murad',       title: 'Sheikh', look: { skin: '#3d2314', beard: '#e0e0e0', turban: '#fff8e1', hat: 'imama',  thobe: '#f5f0e1', bisht: '#4e342e', glasses: false }, trait: 'tells jokes about camels' },
  ghalib:     { name: 'Sheikh Ghalib',      title: 'Sheikh', look: { skin: '#b5835a', beard: '#ffffff', turban: '#ffffff', hat: 'imama',  thobe: '#e3dccb', bisht: '#000000', glasses: true  }, trait: 'strong voice, very steady' },
  jamal:      { name: 'Ustadh Jamal',       title: 'Ustadh', look: { skin: '#6f4e37', beard: '#2a1a10', turban: '#ff8f00', hat: 'kufi',   thobe: '#fff3e0', bisht: null,      glasses: false }, trait: 'loves lanterns and bright colours' },
  rashid:     { name: 'Sheikh Rashid',      title: 'Sheikh', look: { skin: '#e8b98a', beard: '#a1887f', turban: '#f0ebe0', hat: 'imama',  thobe: '#efe6d6', bisht: '#5d4037', glasses: true  }, trait: 'honest shopkeeper who never rounds up' },
  samir:      { name: 'Ustadh Samir',       title: 'Ustadh', look: { skin: '#c99064', beard: null,      turban: '#6a1b9a', hat: 'kufi',   thobe: '#ede7f6', bisht: null,      glasses: false }, trait: 'quick talker who loves races' },
  anwar:      { name: 'Sheikh Anwar',       title: 'Sheikh', look: { skin: '#4a2c1a', beard: '#cfcfcf', turban: '#ffffff', hat: 'ghutra', thobe: '#ffffff', bisht: '#1b5e20', glasses: false }, trait: 'smiles even when spiders appear' },
  habib:      { name: 'Sheikh Habib',       title: 'Sheikh', look: { skin: '#ffdbac', beard: '#f5f5f5', turban: '#e0d6c2', hat: 'imama',  thobe: '#d9cfbd', bisht: '#880e4f', glasses: true  }, trait: 'gentle, speaks softly, very wise' },
  kamal:      { name: 'Ustadh Kamal',       title: 'Ustadh', look: { skin: '#8b5a2b', beard: '#1a1a1a', turban: '#0277bd', hat: 'kufi',   thobe: '#e1f5fe', bisht: null,      glasses: true  }, trait: 'crystal collector with a torch' },
  mahmud:     { name: 'Sheikh Mahmud',      title: 'Sheikh', look: { skin: '#d1a47a', beard: '#9e9e9e', turban: '#fafafa', hat: 'imama',  thobe: '#ece5d8', bisht: '#263238', glasses: false }, trait: 'explorer who has seen every tunnel' },
  adil:       { name: 'Ustadh Adil',        title: 'Ustadh', look: { skin: '#5a3825', beard: '#2b1b12', turban: '#455a64', hat: 'kufi',   thobe: '#eceff1', bisht: null,      glasses: false }, trait: 'fair referee, loves rules' },
  fadl:       { name: 'Sheikh Fadl',        title: 'Sheikh', look: { skin: '#c68642', beard: '#ffffff', turban: '#ffffff', hat: 'imama',  thobe: '#f3eee3', bisht: '#4a148c', glasses: true  }, trait: 'patient, hums while walking' },
  burhan:     { name: 'Sheikh Burhan',      title: 'Sheikh', look: { skin: '#2e1a0f', beard: '#e6e6e6', turban: '#ece4d0', hat: 'imama',  thobe: '#ffffff', bisht: '#212121', glasses: false }, trait: 'fearless, deep thunder voice' },
  nabil:      { name: 'Ustadh Nabil',       title: 'Ustadh', look: { skin: '#f0c8a0', beard: '#6d4c41', turban: '#00897b', hat: 'kufi',   thobe: '#e0f2f1', bisht: null,      glasses: false }, trait: 'sailor at heart, loves knots' },
  shakir:     { name: 'Sheikh Shakir',      title: 'Sheikh', look: { skin: '#9c6b3f', beard: '#bdbdbd', turban: '#c62828', hat: 'ghutra', thobe: '#ffffff', bisht: '#795548', glasses: false }, trait: 'says Alhamdulillah for everything' },
  rayyan:     { name: 'Ustadh Rayyan',      title: 'Ustadh', look: { skin: '#3b2219', beard: null,      turban: '#ffffff', hat: 'kufi',   thobe: '#f5f5f5', bisht: null,      glasses: true  }, trait: 'youngest teacher, super energetic' },
  munir:      { name: 'Sheikh Munir',       title: 'Sheikh', look: { skin: '#e0ac69', beard: '#d6d6d6', turban: '#f7f3ea', hat: 'imama',  thobe: '#e6dccb', bisht: '#0d47a1', glasses: true  }, trait: 'lighthouse keeper, loves the sea' },
  saleem:     { name: 'Sheikh Saleem',      title: 'Sheikh', look: { skin: '#7b4b2a', beard: '#f9f9f9', turban: '#ffffff', hat: 'imama',  thobe: '#efe8da', bisht: '#3e2723', glasses: false }, trait: 'brave captain of the harbour' },
  faris:      { name: 'Ustadh Faris',       title: 'Ustadh', look: { skin: '#b07b4f', beard: '#2b1a0e', turban: '#283593', hat: 'kufi',   thobe: '#e8eaf6', bisht: null,      glasses: false }, trait: 'star-gazer who knows the night sky' },
  abdullatif: { name: 'Sheikh Abdul-Latif', title: 'Sheikh', look: { skin: '#ffe0bd', beard: '#e0e0e0', turban: '#ffffff', hat: 'imama',  thobe: '#ffffff', bisht: '#bf9b30', glasses: true  }, trait: 'kind gardener of the marble paths' },
  hadi:       { name: 'Ustadh Hadi',        title: 'Ustadh', look: { skin: '#4b2e1e', beard: '#1c1c1c', turban: '#f9a825', hat: 'kufi',   thobe: '#fffde7', bisht: null,      glasses: false }, trait: 'shows the way, never gets lost' },
  najib:      { name: 'Sheikh Najib',       title: 'Sheikh', look: { skin: '#d2a679', beard: '#cfcfcf', turban: '#fafafa', hat: 'ghutra', thobe: '#f2ede2', bisht: '#1b5e20', glasses: true  }, trait: 'quiet strength, big warm laugh' },
  nuruddin:   { name: 'Sheikh Nuruddin',    title: 'Sheikh', look: { skin: '#6b3e26', beard: '#ffffff', turban: '#ffffff', hat: 'imama',  thobe: '#ffffff', bisht: '#c9a227', glasses: false }, trait: 'keeper of the Map of Light' }
};

export const STAGES = [
  // ---------------- Land 1: The Whispering Oasis ----------------
  {
    id: '1-1', land: 'oasis', n: 1, name: 'First Steps in the Palms', guide: 'bilal',
    minutes: 3.5,
    goal: { type: 'distance', treasures: 1, spiders: 'few', chaser: false },
    difficulty: 0.05,
    item: { name: 'a lost golden key', icon: '\u{1F511}' },
    brief: "Assalamu alaykum, runner! I'm Ustadh Bilal, and today is warm-up day. Swipe left and right to change lanes, swipe up to jump, swipe down to slide, and grab every golden star you see.",
    hints: [
      "Nice and easy! Move into the lane with the stars.",
      "Little wall ahead: swipe up to jump it!",
      "Low banner coming: swipe down and slide under.",
      "A spider! Say SubhanAllah out loud and your golden shield will light up!"
    ],
    win: "Masha Allah, you did it! Your first run is done and you found the golden key.",
    lose: "No problem at all. Every runner trips on the first day. Let's warm up and go again!",
    fact: "Say Bismillah (In the name of Allah) before you start something, even a game."
  },
  {
    id: '1-2', land: 'oasis', n: 2, name: 'The Water Channel Dash', guide: 'mansur',
    minutes: 3.75,
    goal: { type: 'treasure', treasures: 3, spiders: 'few', chaser: false },
    difficulty: 0.12,
    item: { name: 'clay water jugs', icon: '\u{1F3FA}' },
    brief: "Ah, welcome to my palm garden. I am Sheikh Mansur, and yes, every palm here has a name. Three clay jugs fell into the water channels, so please fetch them for me, and mind Old Wobbly, the leaning palm on your left.",
    hints: [
      "Jugs float near the channel. Stay in the side lanes to grab them.",
      "Jump the little bridges, don't bump them!",
      "Spider by the palms! SubhanAllah, and up goes your shield.",
      "Stars line up in rows. Stay in one lane and scoop them all."
    ],
    win: "Alhamdulillah, all three jugs are safe! My palms thank you, in their own quiet way.",
    lose: "The channels are slippery. Take a breath and try once more.",
    fact: "Helping someone carry their things is a kind thing to do."
  },
  {
    id: '1-3', land: 'oasis', n: 3, name: 'Count the Dates', guide: 'tariq',
    minutes: 4,
    goal: { type: 'treasure', treasures: 4, spiders: 'some', chaser: false },
    difficulty: 0.18,
    item: { name: 'baskets of dates', icon: '\u{1F334}' },
    brief: "Ustadh Tariq here! I counted 4 baskets of dates hiding on this path, 112 palms, and 9 very sleepy spiders. Let's find all the baskets before the spiders wake up. Ready? 3, 2, 1, go!",
    hints: [
      "Basket on the far right lane in 3, 2, 1!",
      "Two rocks in a row: jump, land, jump again.",
      "Spiders waking up! Say SubhanAllah nice and clear.",
      "Low palm leaves ahead. Slide, slide, slide!"
    ],
    win: "4 baskets out of 4! That is 100 percent, my friend. Masha Allah!",
    lose: "Hmm, we were short a few. Counting again from zero, let's go!",
    fact: "Sharing your food with others makes it taste even better."
  },
  {
    id: '1-4', land: 'oasis', n: 4, name: 'The Riddle of the Old Well', guide: 'rafiq',
    minutes: 4,
    goal: { type: 'treasure', treasures: 3, spiders: 'some', chaser: false },
    difficulty: 0.24,
    item: { name: 'riddle stones', icon: '\u{1FAA8}' },
    brief: "I am Sheikh Rafiq, and I love a good riddle. Here is one: what gets wetter the more it dries? A towel! Now find the three riddle stones around the old well, and they will show us where the chest is.",
    hints: [
      "Riddle: what has a lane but no car? This path! Pick the middle lane.",
      "Carts ahead. Hop into another lane early.",
      "Spider by the well! SubhanAllah, shield up!",
      "Use a Star Magnet from your garden here. Lots of stars ahead!"
    ],
    win: "All three riddle stones! They point to the tallest palm. Clever runner!",
    lose: "Riddles take patience. Think, breathe, and try again.",
    fact: "Being patient helps you solve hard problems."
  },
  {
    id: '1-5', land: 'oasis', n: 5, name: 'Boss: Old Grumblelegs', guide: 'jalal',
    minutes: 4.5,
    goal: { type: 'boss', treasures: 0, spiders: 'swarm', chaser: true },
    difficulty: 0.32,
    item: { name: 'the green chest of the oasis', icon: '\u{1F381}' },
    brief: "I am Sheikh Jalal. Old Grumblelegs, the biggest spider in the oasis, sits on top of the map piece. Stay calm, keep running, and say SubhanAllah whenever he gets close. We do not rush and we do not panic.",
    hints: [
      "Grumblelegs is behind you. Keep moving, don't look back!",
      "His babies are dropping in. SubhanAllah, shield up!",
      "Stay calm. Change lanes one at a time.",
      "Feeling tired? A Slow Steps power from your garden helps here."
    ],
    win: "Grumblelegs gave up and crawled under a rock! The green chest is yours, with piece 1 of the Map of Light. Allahu Akbar!",
    lose: "That was a big spider. Rest a moment, then try again with a calm heart.",
    fact: "When something feels scary, remembering Allah helps the heart feel calm."
  },

  // ---------------- Land 2: The Golden Dunes ----------------
  {
    id: '2-1', land: 'dunes', n: 1, name: 'Sandy Snack Run', guide: 'kareem',
    minutes: 4,
    goal: { type: 'distance', treasures: 2, spiders: 'some', chaser: false },
    difficulty: 0.28,
    item: { name: 'lost lunch boxes', icon: '\u{1F371}' },
    brief: "Hello! I'm Ustadh Kareem, and I dropped two lunch boxes somewhere in the dunes. If you find them, we share, deal? The sand is soft, so watch your jumps.",
    hints: [
      "Lunch box behind that rock! Jump, then grab it.",
      "Sand ramps ahead. Stay in the middle lane.",
      "Spider crawling in! SubhanAllah and you're safe.",
      "Stars everywhere! Keep moving side to side."
    ],
    win: "You found my lunch! Half is yours. Barakallahu fik!",
    lose: "Sand is tricky. Brush it off and run again!",
    fact: "Sharing what you have, even a little, is good character."
  },
  {
    id: '2-2', land: 'dunes', n: 2, name: 'Whispers of the Wind', guide: 'nasir',
    minutes: 4.25,
    goal: { type: 'treasure', treasures: 3, spiders: 'some', chaser: false },
    difficulty: 0.33,
    item: { name: 'brass compasses', icon: '\u{1F9ED}' },
    brief: "I am Sheikh Nasir. I have walked these dunes for many years, and the wind tells me things. Today it says three brass compasses are buried in the ruins. Run with the wind, little one.",
    hints: [
      "Ruins ahead. Low arches mean slide!",
      "Compass shining on the left. Go, go!",
      "Spiders hiding in the walls. SubhanAllah, nice and loud.",
      "A Treasure Compass power from your garden would help find these."
    ],
    win: "Three compasses, all pointing east. The wind was right! Alhamdulillah.",
    lose: "The wind changes, and so can your luck. Try again.",
    fact: null
  },
  {
    id: '2-3', land: 'dunes', n: 3, name: 'The Big Chase Begins', guide: 'faisal',
    minutes: 4.5,
    goal: { type: 'escape', treasures: 2, spiders: 'some', chaser: true },
    difficulty: 0.38,
    item: { name: 'map scraps', icon: '\u{1F4DC}' },
    brief: "Ustadh Faisal here, with five pencils and some bad news. My map shows a giant dune spider sleeping right... oh. It's awake. It's behind you. Run, and grab my two map scraps on the way!",
    hints: [
      "Don't stop! If you crash, the big spider gets closer.",
      "Scrap on the right after the ruins. Grab it!",
      "Big spider is close! SubhanAllah, shield up!",
      "Carts! Switch lanes early so you don't lose speed."
    ],
    win: "We lost it in the dunes! And I have my scraps back. Excellent running!",
    lose: "That spider is fast, but you'll be faster. Try again!",
    fact: "Not giving up is a strength, even when things are hard."
  },
  {
    id: '2-4', land: 'dunes', n: 4, name: 'Camel Joke Canyon', guide: 'murad',
    minutes: 4.5,
    goal: { type: 'treasure', treasures: 4, spiders: 'many', chaser: false },
    difficulty: 0.43,
    item: { name: 'silver bells', icon: '\u{1F514}' },
    brief: "I am Sheikh Murad. Why did the camel bring a map? Because it kept getting the hump! Ha! Four silver bells fell off my camel's saddle in this canyon. Please find them before the spiders start ringing them.",
    hints: [
      "Bell on the left! Ding ding!",
      "Canyon rocks ahead. Jump the small ones, dodge the big ones.",
      "Lots of spiders today. SubhanAllah, and keep it up!",
      "Use Double Stars from your garden now. This canyon is full of stars!"
    ],
    win: "All four bells! My camel is so happy, she nearly smiled. Masha Allah!",
    lose: "That canyon is twisty. Laugh it off and run again!",
    fact: "A kind joke that makes everyone smile is a good gift."
  },
  {
    id: '2-5', land: 'dunes', n: 5, name: 'Boss: The Dune Dragger', guide: 'ghalib',
    minutes: 5,
    goal: { type: 'boss', treasures: 0, spiders: 'swarm', chaser: true },
    difficulty: 0.5,
    item: { name: 'the sandstone chest', icon: '\u{1F381}' },
    brief: "I am Sheikh Ghalib. The Dune Dragger is huge and it drags sand behind it like a storm. When it comes close, say SubhanAllah with a strong, steady voice. Steady feet, steady heart.",
    hints: [
      "Sand storm! Stay in the middle lane and watch closely.",
      "Here it comes! SubhanAllah, strong and steady!",
      "Baby spiders on both sides. Jump over them!",
      "A Longer Shield power from your garden is very helpful now."
    ],
    win: "The Dune Dragger is buried in its own sand! Piece 2 of the Map of Light is yours. Allahu Akbar!",
    lose: "Strong runners fall sometimes too. Stand up and try again.",
    fact: "La hawla wa la quwwata illa billah: there is no power and no strength except with Allah."
  },

  // ---------------- Land 3: The Lantern Bazaar ----------------
  {
    id: '3-1', land: 'bazaar', n: 1, name: 'Lanterns On!', guide: 'jamal',
    minutes: 4.5,
    goal: { type: 'treasure', treasures: 4, spiders: 'some', chaser: false },
    difficulty: 0.45,
    item: { name: 'coloured lanterns', icon: '\u{1F3EE}' },
    brief: "Welcome to the bazaar! I'm Ustadh Jamal, and I love lanterns, the brighter the better. Four of my best lanterns were carried off by spiders. Let's bring them back and light up this street!",
    hints: [
      "Orange lantern above the cart. Jump to grab it!",
      "Banners hang low here. Slide under them.",
      "Spider behind a stall! SubhanAllah, light that shield!",
      "Stars under the arches. Stay in the middle lane."
    ],
    win: "The street is glowing again! Masha Allah, what a beautiful sight.",
    lose: "The market is busy, it's easy to bump into things. Try again!",
    fact: null
  },
  {
    id: '3-2', land: 'bazaar', n: 2, name: 'The Honest Scales', guide: 'rashid',
    minutes: 4.75,
    goal: { type: 'treasure', treasures: 4, spiders: 'some', chaser: false },
    difficulty: 0.5,
    item: { name: 'brass weights', icon: '⚖️' },
    brief: "I am Sheikh Rashid, and my scales are always fair. But the spiders stole my four brass weights! Without them I can't weigh anything properly. Will you find them for me?",
    hints: [
      "Weight on the right, near the spice jars.",
      "Jars rolling! Change lanes, don't jump them.",
      "Spiders under the tables. SubhanAllah, shield on!",
      "A Star Magnet power pulls in the stars while you dodge."
    ],
    win: "All four weights! Now everything is fair again. Barakallahu fik!",
    lose: "Not quite. Honest effort counts, so try again!",
    fact: "Being honest, even in small things, is a sign of good character."
  },
  {
    id: '3-3', land: 'bazaar', n: 3, name: 'The Great Market Race', guide: 'samir',
    minutes: 5,
    goal: { type: 'distance', treasures: 2, spiders: 'many', chaser: false },
    difficulty: 0.55,
    item: { name: 'racing ribbons', icon: '\u{1F380}' },
    brief: "Ustadh Samir here, ready set race! The market closes soon and we need to reach the far gate before the lanterns dim. Grab two racing ribbons on the way. Fast feet, fast feet!",
    hints: [
      "Speed up! Long straight path ahead.",
      "Cart, cart, jar! Left, then right!",
      "Spider swarm by the fruit stall! SubhanAllah!",
      "Ribbon after the big arch. Don't miss it!"
    ],
    win: "We made it to the gate in time! What a race, Masha Allah!",
    lose: "Close one! Races are won by trying again.",
    fact: null
  },
  {
    id: '3-4', land: 'bazaar', n: 4, name: 'Escape the Web Alley', guide: 'anwar',
    minutes: 5,
    goal: { type: 'escape', treasures: 3, spiders: 'many', chaser: true },
    difficulty: 0.59,
    item: { name: 'silk scarves', icon: '\u{1F9E3}' },
    brief: "I am Sheikh Anwar, and yes, I am smiling even though there's a giant spider in this alley. Smiling helps! Run through the back alley, grab three silk scarves, and don't let that spider catch you.",
    hints: [
      "Webs across the lanes! Jump over the low ones.",
      "The big spider is gaining. Don't crash!",
      "SubhanAllah, now! Shield up and keep smiling.",
      "Got a Second Chance power? Today is a good day for it."
    ],
    win: "Out of the alley and into the light! You kept going, and look, you're smiling too.",
    lose: "That alley is tough. Smile, breathe, and try once more.",
    fact: "A smile for someone else is a simple kindness."
  },
  {
    id: '3-5', land: 'bazaar', n: 5, name: 'Boss: The Lantern Lurker', guide: 'habib',
    minutes: 5.5,
    goal: { type: 'boss', treasures: 0, spiders: 'swarm', chaser: true },
    difficulty: 0.65,
    item: { name: 'the carved wooden chest', icon: '\u{1F381}' },
    brief: "I am Sheikh Habib. The Lantern Lurker hides in shadows and blows out the lights as it chases you. Listen closely: stay where the lanterns are bright, and say SubhanAllah when the dark comes near.",
    hints: [
      "Lights going out! Stay in the brightest lane.",
      "It's right behind you. SubhanAllah, gently and clearly.",
      "Spiders dropping from the arches! Slide, then dodge.",
      "Use your Extra Heart power if you have one. This is a long run."
    ],
    win: "The lanterns shine again and the Lurker has fled! Piece 3 of the Map of Light is yours. Alhamdulillah.",
    lose: "Even in the dark, keep hope. Try again when you are ready.",
    fact: "Saying Alhamdulillah (All praise is for Allah) is a good way to thank Allah every day."
  },

  // ---------------- Land 4: The Crystal Caves ----------------
  {
    id: '4-1', land: 'caves', n: 1, name: 'Torch and Crystals', guide: 'kamal',
    minutes: 5,
    goal: { type: 'treasure', treasures: 4, spiders: 'some', chaser: false },
    difficulty: 0.6,
    item: { name: 'blue crystals', icon: '\u{1F48E}' },
    brief: "Ustadh Kamal here, torch on! These caves are full of crystals, and I need four blue ones for my collection. Careful: spiders like to drop from the ceiling here, so look up as well as ahead.",
    hints: [
      "Blue crystal glowing on the left!",
      "Shadow on the floor? A spider is about to drop. SubhanAllah!",
      "Low rocks ahead. Slide!",
      "Stars sparkle more in the dark. Follow them."
    ],
    win: "Four perfect crystals! My collection is complete. Masha Allah!",
    lose: "Caves are dark and confusing. Let's light up and try again.",
    fact: null
  },
  {
    id: '4-2', land: 'caves', n: 2, name: 'The Tunnel of Echoes', guide: 'mahmud',
    minutes: 5,
    goal: { type: 'distance', treasures: 3, spiders: 'many', chaser: false },
    difficulty: 0.65,
    item: { name: 'echo shells', icon: '\u{1F41A}' },
    brief: "I am Sheikh Mahmud, and I have explored every tunnel in these caves. In this one, your voice echoes. Say SubhanAllah and hear it fill the whole tunnel! Find three echo shells on the way.",
    hints: [
      "Echo shell in the middle lane, coming up.",
      "Tunnel splits! Stay in the lane with stars.",
      "Spiders everywhere. SubhanAllah, and listen to the echo!",
      "Feeling rushed? Slow Steps power will help you think."
    ],
    win: "We reached the end of the tunnel! And what a lovely echo. Alhamdulillah.",
    lose: "Tunnels can be long. Rest, then try again.",
    fact: "Remembering Allah often, with words like SubhanAllah, keeps the heart bright."
  },
  {
    id: '4-3', land: 'caves', n: 3, name: 'Out of the Spider Nest!', guide: 'adil',
    minutes: 5.25,
    goal: { type: 'escape', treasures: 2, spiders: 'many', chaser: true },
    difficulty: 0.7,
    item: { name: 'spider-nest keys', icon: '\u{1F5DD}️' },
    brief: "Ustadh Adil here. Oops, we took a wrong turn into a spider nest. Rules are rules: no stopping, no turning back, and shield up whenever they get close. Grab the two keys and get us out!",
    hints: [
      "Rule one: keep running! The big one is behind you.",
      "Sticky webs on the floor. Jump them!",
      "Rule two: SubhanAllah when spiders come close!",
      "Key above the rock. Jump and grab it!"
    ],
    win: "We're out of the nest! You followed every rule. Fair and square, well done!",
    lose: "That nest is scary. Rule three: always try again!",
    fact: "Playing fairly and following the rules is part of good character."
  },
  {
    id: '4-4', land: 'caves', n: 4, name: 'The Crystal Lake Bridge', guide: 'fadl',
    minutes: 5.5,
    goal: { type: 'treasure', treasures: 5, spiders: 'many', chaser: false },
    difficulty: 0.74,
    item: { name: 'pearl drops', icon: '\u{1FAE7}' },
    brief: "Hmm hmm hmm... oh, hello! I am Sheikh Fadl, I hum when I walk. A long bridge crosses the crystal lake, and five pearl drops are hidden along it. Walk... I mean, run, with patience.",
    hints: [
      "Bridge ahead. Only two lanes are safe. Watch the gaps!",
      "Pearl on the edge. Careful now.",
      "Spiders on the railings. SubhanAllah, and hum along!",
      "Double Stars works well on this bridge. So many stars!"
    ],
    win: "Five pearls, all safe and sound. Patience pays off. Masha Allah!",
    lose: "Bridges need patience. Hum a little and try again.",
    fact: "Patience is a strength, not a weakness."
  },
  {
    id: '4-5', land: 'caves', n: 5, name: 'Boss: The Spider Queen of the Caves', guide: 'burhan',
    minutes: 5.75,
    goal: { type: 'boss', treasures: 0, spiders: 'swarm', chaser: true },
    difficulty: 0.8,
    item: { name: 'the crystal chest', icon: '\u{1F381}' },
    brief: "I am Sheikh Burhan. The Spider Queen of the Caves is the biggest, grumpiest spider of all, and she has the fourth piece. She will chase you, drop babies from the ceiling, and shake the ground. Be brave, and say SubhanAllah loudly!",
    hints: [
      "The ground is shaking! Jump the falling rocks!",
      "The Queen is right behind you! SubhanAllah, loud and strong!",
      "Babies from the ceiling! Watch the shadows.",
      "Now is the time for your best garden powers!"
    ],
    win: "The Spider Queen has retreated into the deepest dark! Piece 4 of the Map of Light is yours. Allahu Akbar!",
    lose: "She is tough, but you are brave. Try again, In sha Allah you will do it.",
    fact: "Allahu Akbar means Allah is the Greatest. Nothing is bigger than that."
  },

  // ---------------- Land 5: The Windy Cliffs ----------------
  {
    id: '5-1', land: 'cliffs', n: 1, name: 'Ropes and Knots', guide: 'nabil',
    minutes: 5,
    goal: { type: 'treasure', treasures: 4, spiders: 'some', chaser: false },
    difficulty: 0.75,
    item: { name: 'coils of rope', icon: '\u{1FAA2}' },
    brief: "Ahoy! I'm Ustadh Nabil, and I love the sea and a good knot. The spiders tangled up my four coils of rope along the cliff path. Grab them, and mind the wind, it pushes you sideways!",
    hints: [
      "Wind blowing! Hold your lane steady.",
      "Rope coil on the cliff edge. Careful!",
      "Spider on the fence. SubhanAllah, shield up!",
      "Rope bridge ahead. Jump the broken planks!"
    ],
    win: "All four ropes untangled! Now we can tie up the boats. Barakallahu fik!",
    lose: "That wind is cheeky. Hold steady and try again.",
    fact: null
  },
  {
    id: '5-2', land: 'cliffs', n: 2, name: 'Runaway from the Cliff Crawler', guide: 'shakir',
    minutes: 5.25,
    goal: { type: 'escape', treasures: 3, spiders: 'many', chaser: true },
    difficulty: 0.79,
    item: { name: 'seagull feathers', icon: '\u{1FAB6}' },
    brief: "Alhamdulillah, what a lovely windy day! I am Sheikh Shakir. Alhamdulillah, a big spider is chasing us! Well, Alhamdulillah we have legs to run with. Grab three seagull feathers and keep going!",
    hints: [
      "Alhamdulillah for fast feet! Keep moving!",
      "Feather floating in the right lane!",
      "Spider right behind! SubhanAllah, now!",
      "Crates on the path. Jump or switch lanes early."
    ],
    win: "We escaped! Alhamdulillah, Alhamdulillah, Alhamdulillah!",
    lose: "Alhamdulillah, we can try again. Let's go!",
    fact: "Thanking Allah for small things makes us notice how much we have."
  },
  {
    id: '5-3', land: 'cliffs', n: 3, name: 'The Speedy Seawall Sprint', guide: 'rayyan',
    minutes: 5.5,
    goal: { type: 'distance', treasures: 3, spiders: 'many', chaser: false },
    difficulty: 0.83,
    item: { name: 'sea glass', icon: '\u{1F535}' },
    brief: "Yo yo, Ustadh Rayyan here, the youngest teacher on the trail! This seawall is long and fast, and I've got SO much energy! Let's sprint the whole thing and grab three pieces of sea glass. Wooo!",
    hints: [
      "Faster, faster! Long run ahead!",
      "Waves splashing! Jump the puddles!",
      "Spiders on the wall! SubhanAllah, shield on!",
      "Sea glass by the lamp post. Grab it!"
    ],
    win: "WOOO! We did it! You're as fast as me now. Masha Allah!",
    lose: "Aww, so close! Shake it off and sprint again!",
    fact: null
  },
  {
    id: '5-4', land: 'cliffs', n: 4, name: 'Lighthouse in the Storm', guide: 'munir',
    minutes: 5.75,
    goal: { type: 'escape', treasures: 4, spiders: 'many', chaser: true },
    difficulty: 0.87,
    item: { name: 'lighthouse lenses', icon: '\u{1F4A1}' },
    brief: "I am Sheikh Munir, keeper of the lighthouse. A storm is rolling in, the spiders have stolen my four lenses, and a big one is chasing you up the cliff steps. Find the lenses so the light can shine for the ships tonight.",
    hints: [
      "Rain is slippery. Change lanes slowly.",
      "Lens on the stairs! Jump to grab it.",
      "Big spider below you! SubhanAllah, shield up!",
      "Treasure Compass helps you spot the lenses in the storm."
    ],
    win: "The lighthouse shines again! The ships are safe. Alhamdulillah.",
    lose: "Storms pass. Wait a moment and try again.",
    fact: "Helping others stay safe is one of the best things you can do."
  },
  {
    id: '5-5', land: 'cliffs', n: 5, name: 'Boss: Captain Clatterclaws', guide: 'saleem',
    minutes: 6,
    goal: { type: 'boss', treasures: 0, spiders: 'swarm', chaser: true },
    difficulty: 0.92,
    item: { name: 'the sea chest', icon: '\u{1F381}' },
    brief: "I am Sheikh Saleem, captain of the harbour. Captain Clatterclaws, the spider of the docks, has taken over my harbour and the fifth piece of the map! Run through the docks, dodge the crates, and say SubhanAllah when his claws clatter near.",
    hints: [
      "Crates flying off the ships! Dodge!",
      "Clatterclaws is behind you! SubhanAllah, captain's orders!",
      "Spiders on the ropes above! Slide under!",
      "Second Chance and Extra Heart are perfect for this battle."
    ],
    win: "Clatterclaws jumped into the sea with a big splash! Piece 5 of the Map of Light is yours. Allahu Akbar!",
    lose: "Every sailor faces rough waves. Try again, In sha Allah.",
    fact: null
  },

  // ---------------- Land 6: The Garden of Light ----------------
  {
    id: '6-1', land: 'light', n: 1, name: 'Under the Starry Sky', guide: 'faris',
    minutes: 5.5,
    goal: { type: 'treasure', treasures: 5, spiders: 'many', chaser: false },
    difficulty: 0.88,
    item: { name: 'star lamps', icon: '\u{1F31F}' },
    brief: "Ustadh Faris here. Look up! The sky is full of stars tonight, SubhanAllah. Five little star lamps on the marble path have gone out, and I need you to collect them so we can light the way.",
    hints: [
      "Star lamp on the left, by the fountain!",
      "Marble steps ahead. Jump them!",
      "Spiders in the bushes. SubhanAllah, shield of light!",
      "Use Star Magnet here. The sky has dropped so many stars!"
    ],
    win: "All five lamps are glowing! The path is bright. Masha Allah!",
    lose: "Even stars hide behind clouds sometimes. Try again!",
    fact: "Looking at the stars and the sky is a good time to say SubhanAllah."
  },
  {
    id: '6-2', land: 'light', n: 2, name: 'The Fountain Riddles', guide: 'abdullatif',
    minutes: 5.5,
    goal: { type: 'treasure', treasures: 5, spiders: 'many', chaser: false },
    difficulty: 0.91,
    item: { name: 'fountain gems', icon: '\u{1F4A0}' },
    brief: "I am Sheikh Abdul-Latif, gardener of these marble paths. The fountains here each guard a gem. Run gently past the flowers, grab all five gems, and please don't trample my roses!",
    hints: [
      "Fountain on the right. The gem is behind it!",
      "Flower beds in the middle. Jump over them gently!",
      "Spiders near the hedges. SubhanAllah!",
      "Low hanging vines. Slide under."
    ],
    win: "Five gems and not one rose trampled. Barakallahu fik!",
    lose: "My garden is tricky. Take your time and try again.",
    fact: "Taking care of plants and animals is a kind thing to do."
  },
  {
    id: '6-3', land: 'light', n: 3, name: 'Follow the Glowing Path', guide: 'hadi',
    minutes: 5.75,
    goal: { type: 'escape', treasures: 4, spiders: 'swarm', chaser: true },
    difficulty: 0.94,
    item: { name: 'glowing pebbles', icon: '✨' },
    brief: "Ustadh Hadi here. I never get lost, and I'll show you the way! Follow the glowing pebbles through the maze of hedges. A whole swarm of spiders and a big chaser are on our tail, so stay sharp!",
    hints: [
      "Follow the glow! Left lane now!",
      "Swarm incoming! SubhanAllah, shield up!",
      "Hedge walls ahead. Jump the short ones!",
      "Slow Steps power makes the maze much easier."
    ],
    win: "We made it through the maze! Told you I never get lost. Alhamdulillah!",
    lose: "Mazes are tricky. I'll lead you through again.",
    fact: null
  },
  {
    id: '6-4', land: 'light', n: 4, name: 'The Last Gate', guide: 'najib',
    minutes: 6,
    goal: { type: 'escape', treasures: 4, spiders: 'swarm', chaser: true },
    difficulty: 0.97,
    item: { name: 'gate seals', icon: '\u{1F536}' },
    brief: "I am Sheikh Najib. Ha ha, you've come so far! The last gate is closed with four seals, and every spider in the six lands is behind us. Grab the seals, open the gate, and never stop running.",
    hints: [
      "Seal on top of the arch! Jump!",
      "They're all behind you! SubhanAllah, strong and loud!",
      "Marble pillars ahead. Weave between the lanes!",
      "Now is the time for your Longer Shield power!"
    ],
    win: "The gate is open! Ha ha, wonderful! Only the final run is left.",
    lose: "Ha ha, that was a big crowd of spiders! Try again, you're nearly there.",
    fact: "Bismillah: In the name of Allah. Say it before every big step."
  },
  {
    id: '6-5', land: 'light', n: 5, name: 'Final Boss: The Great Shadow Spider', guide: 'nuruddin',
    minutes: 6,
    goal: { type: 'boss', treasures: 0, spiders: 'swarm', chaser: true },
    difficulty: 1.0,
    item: { name: 'the shining white chest', icon: '\u{1F381}' },
    brief: "I am Sheikh Nuruddin, keeper of the Map of Light. You have done so well, my dear runner. The Great Shadow Spider guards the last piece, and it is the biggest one of all. Say Bismillah, run with all your heart, and say SubhanAllah whenever it comes near.",
    hints: [
      "The Great Shadow Spider is here! Keep running!",
      "SubhanAllah, SubhanAllah! Your shield is your light!",
      "Spiders from every side. Watch the lanes and stay calm.",
      "Use every garden power you have. This is the final run!"
    ],
    win: "The Great Shadow Spider is gone, and the last piece of the Map of Light is yours! Allahu Akbar! Alhamdulillah!",
    lose: "You are so close. Rest, say Bismillah, and try once more. In sha Allah you will win.",
    fact: "La hawla wa la quwwata illa billah: there is no power and no strength except with Allah."
  }
];

export const POWERS = [
  { id: 'shield-plus',     name: 'Longer Shield',    text: 'Your SubhanAllah shield of light lasts a few seconds longer each level.', cost: 20, max: 3 },
  { id: 'star-magnet',     name: 'Star Magnet',      text: 'Pulls nearby golden stars towards you from every lane for a while.', cost: 15, max: 3 },
  { id: 'extra-heart',     name: 'Extra Heart',      text: 'Start the stage with one more heart, so you can take one more bump.', cost: 30, max: 2 },
  { id: 'double-stars',    name: 'Double Stars',     text: 'Every star you collect counts twice for a short time.', cost: 40, max: 2 },
  { id: 'slow-time',       name: 'Slow Steps',       text: 'Everything slows down for a few seconds so you can choose your lane calmly.', cost: 35, max: 2 },
  { id: 'second-chance',   name: 'Second Chance',    text: 'After a crash, get back up and keep running from the same spot.', cost: 50, max: 2 },
  { id: 'treasure-finder', name: 'Treasure Compass', text: 'An arrow shows which lane the next treasure item is in.', cost: 25, max: 3 }
];

export const TIPS = [
  'Say SubhanAllah out loud to raise your golden shield of light.',
  'Swipe up to jump, swipe down to slide, and swipe left or right to change lanes.',
  'Look for shadows on the ground. A spider may be about to drop from above!',
  'Golden stars are your points. Grab as many as you can.',
  'Grow your My Garden by learning on Ta’aleem, then spend points on powers.',
  'Change lanes early. Last-second moves are the hardest.',
  'Boss stages are long. Save your best powers for them.',
  'Say Bismillah before you start every run.',
  'Crashed? That is fine. Every great runner tries again.',
  'Find all 6 pieces of the Map of Light to finish the quest.'
];
