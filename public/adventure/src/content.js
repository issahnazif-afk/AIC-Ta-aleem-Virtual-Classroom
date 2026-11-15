// Everything the player reads: regions, stages, knowledge-gate questions, story sequences and gear.
//
// Content boundary (kept in every line below):
//  • Islamic teaching is kept apart from the fictional game. Lessons and questions cite their source and say what
//    kind of source it is (Qur'an, hadith, history, or a general value); the game's own world is fiction.
//  • No sacred text is a collectible, weapon, currency or puzzle piece. Collectibles are "light motes" (fiction).
//  • No prophet, and never Prophet Muhammad ﷺ, is shown, voiced or acted. Stories about them are told only as
//    narration that names the Qur'anic passage, over landscapes with no figure standing in for them.
//  • Stars and XP reward play only. They never measure faith, piety or worth.
//  • These are starter materials: a qualified teacher should review every lesson and question before class use.

export const REGIONS = [
  { id: 'sunlit', name: 'Sunlit Frontier', env: 'desert', tagline: 'Golden dunes, old arches and the first trail.', story: 'intro' },
  { id: 'garden', name: 'Garden of Patience', env: 'oasis', tagline: 'Palm groves, rivers and rope bridges.', story: 'garden' },
  { id: 'caves', name: 'Caves of Reflection', env: 'caves', tagline: 'Glowing crystals in the quiet dark.', story: 'caves' },
  { id: 'mountain', name: 'Mountain of Resolve', env: 'mountain', tagline: 'Wind, ice and the high pass.', story: 'mountain' },
  { id: 'harbour', name: 'Lantern Harbour', env: 'harbour', tagline: 'A night market by the sea, and the festival of lights.', story: 'harbour' },
];

// mode: run | explore | arena. Each mode reads its own settings from `cfg`.
export const STAGES = [
  // ── Sunlit Frontier ─────────────────────────────────────────────
  { id: 's1', region: 'sunlit', mode: 'run', name: 'The Sunlit Trail',
    goal: 'Run the trail to the welcome arch. Gather 20 light motes.',
    cfg: { length: 520, speed: 13, accel: 0.012, mix: ['crate', 'beam', 'wall'], motes: 20, gates: ['honesty'], branches: 0 },
    lesson: 'l-intention' },
  { id: 's2', region: 'sunlit', mode: 'explore', name: 'The Old Caravanserai',
    goal: 'Discover the 4 landmarks of the caravan stop and open the knowledge gates to reach the beacon.',
    cfg: { landmarks: ['well', 'sundial', 'stable', 'scroll-house'], gates: [['pillars'], ['ramadan', 'kaaba']], motes: 12 },
    lesson: 'l-knowledge' },
  { id: 's3', region: 'sunlit', mode: 'run', name: 'The Three Pathways',
    goal: 'Choose your path at each fork. Pass the answer arches.',
    cfg: { length: 680, speed: 14, accel: 0.014, mix: ['crate', 'beam', 'wall', 'cart'], motes: 26, gates: ['salaam', 'surahs'], branches: 2 },
    lesson: 'l-choice' },

  // ── Garden of Patience ──────────────────────────────────────────
  { id: 'g1', region: 'garden', mode: 'run', name: 'River Crossing',
    goal: 'Leap the broken bridges and cross the river.',
    cfg: { length: 720, speed: 14.5, accel: 0.014, mix: ['crate', 'beam', 'gap', 'barrel'], motes: 26, gates: ['musa-sea'], branches: 1 },
    lesson: 'l-musa' },
  { id: 'g2', region: 'garden', mode: 'arena', name: 'The Orchard Harvest',
    goal: 'Friendly challenge: roll 6 orchard orbs into your basket before the sun sets.',
    cfg: { kind: 'orbs', time: 75, target: 6, rivals: 1 },
    lesson: 'l-cooperate' },
  { id: 'g3', region: 'garden', mode: 'explore', name: 'The Garden Guardian',
    goal: 'Find the gardener’s 4 lost tools, answer the gate questions and water the old tree.',
    cfg: { landmarks: ['spade', 'basket', 'watering-can', 'seed-pouch'], gates: [['parents', 'smile'], ['bismillah']], motes: 14 },
    lesson: 'l-patience' },

  // ── Caves of Reflection ─────────────────────────────────────────
  { id: 'c1', region: 'caves', mode: 'run', name: 'Crystal Tunnels',
    goal: 'Your lantern lights the way. Dodge the rolling stones in the dark.',
    cfg: { length: 760, speed: 15, accel: 0.015, mix: ['crate', 'beam', 'barrel', 'swing'], motes: 28, gates: ['yunus'], branches: 1, dark: true },
    lesson: 'l-reflect' },
  { id: 'c2', region: 'caves', mode: 'arena', name: 'The Echo Chamber',
    goal: 'Friendly challenge: keep your footing among rolling stones for 50 seconds and gather the motes.',
    cfg: { kind: 'stones', time: 50, target: 10 },
    lesson: 'l-anger' },
  { id: 'c3', region: 'caves', mode: 'explore', name: 'The Hall of Echoes',
    goal: 'Light the 4 crystal lamps and pass the gates of the hidden hall.',
    cfg: { landmarks: ['blue-crystal', 'green-crystal', 'amber-crystal', 'rose-crystal'], gates: [['nuh'], ['iqra', 'trust']], motes: 14, dark: true },
    lesson: 'l-trust' },

  // ── Mountain of Resolve ─────────────────────────────────────────
  { id: 'm1', region: 'mountain', mode: 'run', name: 'The Windy Pass',
    goal: 'Gusts push you sideways and the ice is slippery. Keep your lane.',
    cfg: { length: 820, speed: 15.5, accel: 0.016, mix: ['crate', 'beam', 'wall', 'gap', 'swing'], motes: 30, gates: ['prayer-help'], branches: 2, wind: true, ice: true },
    lesson: 'l-resolve' },
  { id: 'm2', region: 'mountain', mode: 'arena', name: 'Stepping Stones',
    goal: 'Friendly challenge: step on each glowing stone in time while the wind blows.',
    cfg: { kind: 'pads', time: 60, target: 14 },
    lesson: 'l-steady' },
  { id: 'm3', region: 'mountain', mode: 'explore', name: 'The Summit Shelter',
    goal: 'Help the travellers: find the 4 lost supplies, then cross the gates to the summit fire.',
    cfg: { landmarks: ['blanket', 'kettle', 'map-case', 'rope'], gates: [['ibrahim'], ['road-harm', 'hijrah']], motes: 16 },
    lesson: 'l-help' },

  // ── Lantern Harbour ─────────────────────────────────────────────
  { id: 'h1', region: 'harbour', mode: 'explore', name: 'The Night Market',
    goal: 'Meet the market keepers at 4 stalls and open the gates to the harbour.',
    cfg: { landmarks: ['spice-stall', 'lamp-stall', 'book-stall', 'fruit-stall'], gates: [['weights'], ['zakat', 'smile']], motes: 16, night: true },
    lesson: 'l-honest-trade' },
  { id: 'h2', region: 'harbour', mode: 'run', name: 'The Harbour Wall',
    goal: 'Race along the harbour wall past the cargo carts to the lighthouse.',
    cfg: { length: 900, speed: 16, accel: 0.017, mix: ['crate', 'beam', 'wall', 'cart', 'barrel', 'swing', 'gap'], motes: 34, gates: ['increase-knowledge', 'trust'], branches: 2, night: true },
    lesson: 'l-knowledge-light' },
  { id: 'h3', region: 'harbour', mode: 'arena', name: 'The Lantern Festival',
    goal: 'Friendly finale: carry 6 lanterns to their stands around the square while the drifting floats bump you.',
    cfg: { kind: 'lanterns', time: 90, target: 6 },
    lesson: 'l-finale', finaleStory: 'finale' },
];

// Lessons shown on the mission report. `kind` says what sort of source it is.
export const LESSONS = {
  'l-intention': { title: 'A good intention', text: 'Every journey begins with an intention. Setting out to learn, help and do good gives the whole trip a purpose.', kind: 'Hadith', ref: 'Sahih al-Bukhari 1 — “Actions are judged by intentions.”' },
  'l-knowledge': { title: 'Seeking knowledge', text: 'The first word revealed of the Qur’an was “Read” (Iqra’). Learning is a journey that never ends.', kind: 'Qur’an', ref: 'Qur’an 96:1' },
  'l-choice': { title: 'Choosing well', text: 'At a fork in the road, pause and think. Wisdom is choosing what is right, not only what is quick.', kind: 'General value', ref: 'A value for the game, not a quotation.' },
  'l-musa': { title: 'Trust and rescue', text: 'The Qur’an recounts how Prophet Musa (Moses), peace be upon him, and his people were saved when the sea was parted for them.', kind: 'Qur’an', ref: 'Qur’an 26:60–68' },
  'l-cooperate': { title: 'Helping one another', text: 'The Qur’an tells believers to help one another in goodness and in being mindful of Allah — not in wrongdoing.', kind: 'Qur’an', ref: 'Qur’an 5:2' },
  'l-patience': { title: 'Patience grows slowly', text: 'Like a tree that needs water and time, patience grows when we keep doing the right thing, even when it is hard.', kind: 'Qur’an', ref: 'Qur’an 2:153 — “Seek help through patience and prayer.”' },
  'l-reflect': { title: 'A call from the darkness', text: 'The Qur’an tells how Prophet Yunus (Jonah), peace be upon him, called on Allah from the darkness, and was answered.', kind: 'Qur’an', ref: 'Qur’an 21:87–88' },
  'l-anger': { title: 'True strength', text: 'The strong person is not the one who overpowers others, but the one who controls themselves when angry.', kind: 'Hadith', ref: 'Sahih al-Bukhari 6114' },
  'l-trust': { title: 'Keeping trusts', text: 'Allah commands that trusts be returned to those they belong to. A trustworthy person looks after what is given to them.', kind: 'Qur’an', ref: 'Qur’an 4:58' },
  'l-resolve': { title: 'Patience and prayer', text: 'When the way is hard, the Qur’an teaches us to seek help through patience and prayer.', kind: 'Qur’an', ref: 'Qur’an 2:153' },
  'l-steady': { title: 'Steady steps', text: 'Small good deeds done steadily are better than big ones that stop. Keep going, one step at a time.', kind: 'Hadith', ref: 'Sahih al-Bukhari 6464 — the most beloved deeds are those done regularly, even if small.' },
  'l-help': { title: 'Clearing the path', text: 'Removing something harmful from the road is a charity. Helping travellers is a good deed.', kind: 'Hadith', ref: 'Sahih al-Bukhari 2989' },
  'l-honest-trade': { title: 'Fair measure', text: 'The Qur’an commands giving full measure and weighing with a just balance.', kind: 'Qur’an', ref: 'Qur’an 17:35' },
  'l-knowledge-light': { title: 'More knowledge', text: 'The Qur’an teaches the prayer: “My Lord, increase me in knowledge.”', kind: 'Qur’an', ref: 'Qur’an 20:114' },
  'l-finale': { title: 'Light to share', text: 'Knowledge shines brightest when it is joined with good character and shared to help others.', kind: 'General value', ref: 'A value for the game, not a quotation.' },
};

// Knowledge-gate questions. Wrong answers are never punished: the explanation is shown and another try is given.
export const QUESTIONS = {
  honesty: { q: 'Which quality helps people trust one another?', a: ['Honesty', 'Showing off', 'Blaming others'], c: 0, why: 'Honesty builds trust. The Qur’an tells believers to be with the truthful.', ref: 'Qur’an 9:119' },
  pillars: { q: 'How many pillars of Islam are there?', a: ['Three', 'Five', 'Seven'], c: 1, why: 'The five pillars are the testimony of faith, prayer, zakat, fasting in Ramadan and Hajj.', ref: 'Sahih al-Bukhari 8; Sahih Muslim 16' },
  ramadan: { q: 'In which month was the Qur’an first sent down?', a: ['Shawwal', 'Ramadan', 'Muharram'], c: 1, why: 'The Qur’an tells us it was sent down in the month of Ramadan.', ref: 'Qur’an 2:185' },
  kaaba: { q: 'In which city is the Ka‘bah?', a: ['Madinah', 'Jerusalem', 'Makkah'], c: 2, why: 'The Ka‘bah is in Makkah. Muslims face it when they pray.', ref: 'Qur’an 2:144; 3:96' },
  salaam: { q: 'What is the Islamic greeting?', a: ['As-salamu ‘alaykum', 'Good luck', 'See you'], c: 0, why: '“As-salamu ‘alaykum” means “Peace be upon you.” Spreading the greeting of peace is encouraged.', ref: 'Sahih Muslim 54' },
  surahs: { q: 'How many surahs (chapters) are in the Qur’an?', a: ['99', '114', '120'], c: 1, why: 'The Qur’an has 114 surahs, from Al-Fatihah to An-Nas.', ref: 'The order of the mushaf' },
  'musa-sea': { q: 'Which prophet’s people were saved when the sea was parted, in the Qur’an’s account?', a: ['Musa (Moses)', 'Yusuf (Joseph)', 'Nuh (Noah)'], c: 0, why: 'The Qur’an recounts the rescue of Prophet Musa, peace be upon him, and his people.', ref: 'Qur’an 26:60–68' },
  parents: { q: 'How does the Qur’an tell us to treat our parents?', a: ['With kindness and respect', 'Only when we want something', 'It does not mention them'], c: 0, why: 'The Qur’an commands kindness to parents and gentle words to them.', ref: 'Qur’an 17:23' },
  smile: { q: 'Which simple act did the Prophet ﷺ describe as charity?', a: ['Smiling at your brother or sister', 'Winning a race', 'Collecting gems'], c: 0, why: 'A smile for someone is a charity — something anyone can give.', ref: 'Jami‘ at-Tirmidhi 1956' },
  bismillah: { q: 'What do we say before we start eating?', a: ['Bismillah', 'Ready, set, go', 'Nothing'], c: 0, why: 'The Prophet ﷺ taught a boy to mention Allah’s name, eat with his right hand and eat from what is near him.', ref: 'Sahih al-Bukhari 5376' },
  yunus: { q: 'Which prophet called on Allah from the darkness, in the Qur’an’s account?', a: ['Ibrahim (Abraham)', 'Yunus (Jonah)', 'Dawud (David)'], c: 1, why: 'The Qur’an tells how Prophet Yunus, peace be upon him, called out from the darkness and Allah answered him.', ref: 'Qur’an 21:87–88' },
  nuh: { q: 'Which prophet was told to build the ark, in the Qur’an?', a: ['Nuh (Noah)', 'Musa (Moses)', 'Isa (Jesus)'], c: 0, why: 'The Qur’an tells how Prophet Nuh, peace be upon him, built the ark as he was commanded.', ref: 'Qur’an 11:37–38' },
  iqra: { q: 'What was the first word revealed of the Qur’an?', a: ['“Pray”', '“Read” (Iqra’)', '“Run”'], c: 1, why: 'The first revelation began with “Read” (Iqra’).', ref: 'Qur’an 96:1' },
  trust: { q: 'Someone lends you their book. What shows trustworthiness?', a: ['Keep it as your own', 'Look after it and give it back', 'Give it to a friend'], c: 1, why: 'Allah commands that trusts be returned to those they belong to.', ref: 'Qur’an 4:58' },
  'prayer-help': { q: 'When something is hard, the Qur’an tells us to seek help through…', a: ['Patience and prayer', 'Shouting', 'Giving up'], c: 0, why: '“Seek help through patience and prayer.”', ref: 'Qur’an 2:153' },
  ibrahim: { q: 'Who raised the foundations of the Ka‘bah, in the Qur’an’s account?', a: ['Ibrahim and Isma‘il', 'Nuh and his sons', 'Musa and Harun'], c: 0, why: 'The Qur’an mentions Prophet Ibrahim and his son Isma‘il, peace be upon them, raising the foundations of the House.', ref: 'Qur’an 2:127' },
  'road-harm': { q: 'You see a sharp stone on the path. What is the good deed?', a: ['Walk past it', 'Move it out of the way', 'Throw it at a bird'], c: 1, why: 'Removing something harmful from the road is a charity.', ref: 'Sahih al-Bukhari 2989' },
  hijrah: { q: 'The Hijrah was the journey from Makkah to which city?', a: ['Madinah', 'Damascus', 'Cairo'], c: 0, why: 'The Prophet ﷺ and his companions migrated from Makkah to Madinah. The Islamic calendar counts its years from the Hijrah.', ref: 'History (sirah)' },
  weights: { q: 'A trader uses a false scale. What does the Qur’an command instead?', a: ['Full measure and a just balance', 'Whatever earns the most', 'Hiding the scale'], c: 0, why: 'The Qur’an commands giving full measure and weighing with a just balance.', ref: 'Qur’an 17:35' },
  zakat: { q: 'Zakat is one of the pillars of Islam. What is it?', a: ['A yearly charity from savings, given to those in need', 'A kind of prayer', 'A festival'], c: 0, why: 'Zakat is an obligatory charity from wealth above a set amount, given to those in need.', ref: 'Sahih al-Bukhari 8; Qur’an 9:60' },
  'increase-knowledge': { q: 'Which prayer for knowledge is taught in the Qur’an?', a: ['“My Lord, increase me in knowledge”', '“Make me the fastest”', '“Give me many gems”'], c: 0, why: '“My Lord, increase me in knowledge.”', ref: 'Qur’an 20:114' },
};

// What each landmark says when discovered (fictional world details and gentle values; no sacred text as objects).
export const LANDMARKS = {
  well: ['The Old Well', 'Travellers shared this water for hundreds of years. Sharing water is one of the kindest gifts.'],
  sundial: ['The Sundial', 'Long ago people used the sun’s shadow to tell the time. Muslims still use the sun’s path to know the prayer times.'],
  stable: ['The Camel Stable', 'Caravans rested here on long journeys. A good traveller cares for their animals.'],
  'scroll-house': ['The House of Books', 'Scholars once copied books here by hand. Libraries kept knowledge safe for everyone.'],
  spade: ['The Gardener’s Spade', 'Found! Good work takes the right tool — and a little patience.'],
  basket: ['The Harvest Basket', 'Found! A harvest is shared with family, neighbours and those in need.'],
  'watering-can': ['The Watering Can', 'Found! Water, sunlight and time: that is how a garden grows.'],
  'seed-pouch': ['The Seed Pouch', 'Found! Every great tree began as a tiny seed.'],
  'blue-crystal': ['Blue Crystal Lamp', 'Lit! In the quiet of the cave you can hear your own thoughts.'],
  'green-crystal': ['Green Crystal Lamp', 'Lit! Reflection means looking back to learn, then moving forward.'],
  'amber-crystal': ['Amber Crystal Lamp', 'Lit! A little light is enough to take the next step.'],
  'rose-crystal': ['Rose Crystal Lamp', 'Lit! The whole hall glows when every lamp is lit together.'],
  blanket: ['The Warm Blanket', 'Found! Someone at the shelter will sleep warm tonight.'],
  kettle: ['The Copper Kettle', 'Found! A hot drink for tired travellers.'],
  'map-case': ['The Map Case', 'Found! Good guides share the safe way with others.'],
  rope: ['The Climbing Rope', 'Found! Strong ropes and strong friends keep climbers safe.'],
  'spice-stall': ['The Spice Stall', '“Welcome! Every pinch weighed fairly — that is how a market stays honest.”'],
  'lamp-stall': ['The Lamp Stall', '“Lanterns for the festival tonight! Light is best when it is shared.”'],
  'book-stall': ['The Book Stall', '“Stories, maps and science books. Knowledge travels further than any ship.”'],
  'fruit-stall': ['The Fruit Stall', '“Dates, figs and pomegranates. Take one for your journey, and one for a friend.”'],
};

// Cinematic story sequences: camera shots over each region, with narration captions. No figure stands in for any
// prophet; the explorer and the fictional guide (Ustadha Noor / Ustadh Hakim) are the only characters.
export const STORIES = {
  intro: { env: 'desert', title: 'The Journey Begins', shots: [
    { cam: [[0, 9, 34], [0, 5, 18]], look: [0, 2, 0], t: 5.5, text: 'Long ago and far away, at the edge of a golden desert…', act: 'sunrise' },
    { cam: [[8, 3, 10], [4, 2.2, 6]], look: [0, 1.4, 0], t: 4.5, text: 'a young explorer packed a bag, filled a water flask and made an intention: to learn, and to help.', act: 'explorer' },
    { cam: [[-6, 2.5, 7], [-3, 2, 5]], look: [0, 1.6, 0], t: 4.5, text: 'Your guide will be Ustadh Hakim, who has walked these roads for many years.', act: 'guide' },
    { cam: [[0, 4, 9], [0, 14, 30]], look: [0, 2, -20], t: 5, text: 'Five lands lie ahead. Each one holds a lesson worth carrying home.' },
  ] },
  garden: { env: 'oasis', title: 'The Garden of Patience', shots: [
    { cam: [[-20, 10, 20], [-6, 6, 12]], look: [0, 1, 0], t: 5, text: 'Beyond the dunes, palms rise around a quiet river.' },
    { cam: [[6, 2, 6], [3, 2, 4]], look: [0, 1.5, 0], t: 5, text: '“Rivers can be crossed,” says Ustadh Hakim, “by those who are patient and trust in Allah.”', act: 'guide' },
    { cam: [[0, 3, 14], [0, 6, 30]], look: [0, 1, -10], t: 5.5, text: 'The Qur’an tells of Prophet Musa and his people, saved at the sea. (Qur’an 26:60–68)', act: 'river' },
  ] },
  caves: { env: 'caves', title: 'The Caves of Reflection', shots: [
    { cam: [[0, 4, 18], [0, 3, 8]], look: [0, 2, -6], t: 5, text: 'Under the mountain, crystals glow in the quiet dark.' },
    { cam: [[4, 2, 5], [2, 1.8, 4]], look: [0, 1.4, 0], t: 5, text: 'In the stillness, the explorer remembers how Prophet Yunus called on Allah from the darkness, and was answered. (Qur’an 21:87–88)', act: 'explorer' },
    { cam: [[-5, 6, 6], [5, 6, 6]], look: [0, 2, -4], t: 5, text: 'A little light is enough to take the next step.', act: 'lantern' },
  ] },
  mountain: { env: 'mountain', title: 'The Mountain of Resolve', shots: [
    { cam: [[0, 20, 40], [0, 12, 22]], look: [0, 6, -10], t: 5.5, text: 'Snow and wind guard the high pass.' },
    { cam: [[5, 2.5, 6], [3, 2, 4]], look: [0, 1.6, 0], t: 5, text: '“When the way is hard,” says Ustadh Hakim, “seek help through patience and prayer.” (Qur’an 2:153)', act: 'guide' },
    { cam: [[-8, 4, 8], [-4, 8, -6]], look: [0, 6, -20], t: 5, text: 'Step by step, steady and sure, the explorer begins to climb.', act: 'explorer' },
  ] },
  harbour: { env: 'harbour', title: 'Lantern Harbour', shots: [
    { cam: [[-18, 8, 18], [-8, 5, 10]], look: [0, 2, 0], t: 5, text: 'At last the road reaches the sea. Tonight the harbour prepares a festival of lights.', act: 'lanterns' },
    { cam: [[5, 2.2, 6], [3, 2, 4]], look: [0, 1.5, 0], t: 5, text: '“A lantern does not lose its light by lighting another,” smiles Ustadh Hakim.', act: 'guide' },
    { cam: [[0, 3, 12], [0, 10, 26]], look: [0, 4, -10], t: 5.5, text: 'Market keepers, sailors and families — everyone has a part to play.' },
  ] },
  finale: { env: 'harbour', title: 'The Festival of Lights', shots: [
    { cam: [[0, 4, 12], [0, 12, 24]], look: [0, 5, 0], t: 6, text: 'Lanterns rise over the harbour, one for every friend made along the way.', act: 'lanterns' },
    { cam: [[4, 2, 5], [2, 2, 4]], look: [0, 1.5, 0], t: 5.5, text: 'The explorer’s journey is complete — but learning never ends. “My Lord, increase me in knowledge.” (Qur’an 20:114)', act: 'explorer' },
  ] },
};

// Character customisation. Clothing is modest; the headwear options are everyday ones.
export const LOOK = {
  skin: ['#f3d2b3', '#e2b48c', '#c98e62', '#a8714a', '#7d5236', '#5a3a26'],
  outfit: ['#1f6f63', '#2d5c8a', '#8a3b3b', '#6b4f8a', '#b9853a', '#3d6b3a', '#e7e1d2', '#2b2b33'],
  accent: ['#f3c66d', '#e8e2d0', '#9bd5bd', '#e08a5f', '#7fb2e5', '#c7a1e8'],
  head: [
    { id: 'none', name: 'None' }, { id: 'kufi', name: 'Kufi' }, { id: 'turban', name: 'Turban' },
    { id: 'scarf', name: 'Headscarf' }, { id: 'hat', name: 'Explorer hat' },
  ],
  style: [{ id: 'tunic', name: 'Tunic' }, { id: 'thobe', name: 'Long robe' }, { id: 'jacket', name: 'Explorer jacket' }],
};

// Gear: bought with stars (earned only by playing), each with a small, gentle effect.
export const GEAR = [
  { id: 'satchel', name: 'Traveller’s Satchel', slot: 'back', cost: 0, text: 'Your first bag. Holds your water flask.', effect: null },
  { id: 'boots', name: 'Trail Boots', slot: 'feet', cost: 6, text: 'Springier jumps in runs (+10% jump height).', effect: { jump: 1.1 } },
  { id: 'scarf', name: 'Wind Scarf', slot: 'neck', cost: 10, text: 'Gusts push you less on the mountain (−40% wind).', effect: { wind: 0.6 } },
  { id: 'lantern', name: 'Brass Lantern', slot: 'hand', cost: 14, text: 'A brighter, wider light in dark places.', effect: { light: 1.7 } },
  { id: 'compass', name: 'Explorer’s Compass', slot: 'hand2', cost: 18, text: 'Points to the nearest landmark when exploring.', effect: { compass: true } },
  { id: 'magnet', name: 'Mote Charm', slot: 'neck2', cost: 24, text: 'Light motes drift towards you from a little further away.', effect: { magnet: 2.2 } },
  { id: 'cape', name: 'Festival Cape', slot: 'back2', cost: 32, text: 'A cape of woven light, for those who finish the journey.', effect: null },
];
