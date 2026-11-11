// Ta'aleem: Guardians of Light. The valley of Noor, Region 1 (The First Beacon), level by level.
// Built from the Guardians of Light game pack (spec/04_WORLD_LEVEL_STAGE_BIBLE.md). The levels are played by the
// Seerah Quest's 3D runner (src/lib/seerah/quest.mjs) in the Noor setting.
//
// Rules from the pack, kept here:
//   - Reading is the heart of every level: the "read" step sends the child to the Sheikh (the Mujawwadah classroom),
//     and the adventure carries on when they come back. The Qur'an is never typed by the game, never a prop or a power-up.
//   - Listening uses the reciter's recordings only (the "recite" step).
//   - No combat, no lives lost, no timers on reading, no leaderboards. Mistakes lead to a practice tip, never a penalty.
//   - Everything in Noor is fiction: no prophets, angels or sacred places are shown.
// Level 2 (ages 6 to 8) plays Region 1 only, with the gentle climbs. Levels 3 and 4 play every region as it is built.
import { u } from '../url.mjs';

export const STAGES = { A: 'Arrival', B: 'Explore', C: 'Read to the Sheikh', D: 'Restore', E: 'Reflect' };

export const BADGES = [
  { id: 'first-steps', title: 'First Steps', how: 'Finish The Quiet Path and read to the Sheikh for the first time.', img: 'first_steps.svg' },
  { id: 'listener', title: 'Careful Listener', how: 'Listen to the reciter, read, and match each note to its practice tip.', img: 'careful_listener.svg' },
  { id: 'patience', title: 'Patience', how: 'Find the planks, read, and mend the Bridge of Patience.', img: 'patience.svg' },
  { id: 'beacon-1', title: 'The First Beacon', how: 'Finish all three levels of Region 1.', img: 'first_beacon.svg' },
  { id: 'focus', title: 'Focus', how: 'Climb the canopy, recite from memory, and remember every pattern.', img: 'focus.svg' },
  { id: 'echo-keeper', title: 'Echo Keeper', how: 'Listen to the reciter, recite from memory, and repeat every echo.', img: 'echo_keeper.svg' },
  { id: 'revision-garden', title: 'Revision Garden', how: 'Revise a passage, join the roots, and plan your next revision.', img: 'revision_garden.svg' },
  { id: 'beacon-2', title: 'The Second Beacon', how: 'Finish all three levels of Region 2.', img: 'second_beacon.svg' },
].map((b) => ({ ...b, url: u(`guardians/badges/${b.img}`) }));

export const REGIONS = [
  { n: 1, title: 'The First Beacon', theme: 'Foundations', text: 'A green valley at dawn, with a stream, a waterwheel and a quiet learning pavilion.', ready: true },
  { n: 2, title: 'The Memory Canopy', theme: 'Hifz and revision', text: 'Giant trees and walkways in the leaves, for remembering what you learn.', ready: true },
  { n: 3, title: 'The City of Wisdom', theme: 'Hadith and knowledge', text: 'A bright city square with an observatory and a learning hall.' },
  { n: 4, title: 'The Garden of Good Company', theme: 'Adab and character', text: 'A community garden and workshop, for kindness, honesty and care.' },
  { n: 5, title: 'The Beacon Summit', theme: 'Bringing it together', text: 'A high lookout where every beacon of Noor can be seen.' },
];

// where things are in the valley (they match the Noor setting in src/lib/seerah/world.mjs)
const PAVILION = { x: 0, z: -4 };          // the open side of the learning pavilion
const WHEEL = { x: -26, z: -34 };          // beside the waterwheel and its channel
const BRIDGE = { x: 26, z: -33 };          // the near end of the broken bridge
const FAR = { x: 26, z: -55 };             // the far bank

const READ = {
  1: 'Choose the surah and ayahs your teacher gave you, and read them aloud from the mushaf. The Sheikh follows every word.',
  2: 'Read the passage your teacher gave you, slowly and clearly. The Sheikh follows every word.',
};

export const LEVELS = [
  {
    id: '1.1', region: 1, label: 'Level 1.1', title: 'The Quiet Path', blurb: 'Follow the lanterns, read for the first time, and start the waterwheel.',
    steps: [
      { do: 'stage', id: 'A' },
      { do: 'scene', time: 'dawn', at: [0, 44, 0, 0] },
      { do: 'fly', shots: [[[90, 60, 120], [0, 4, -40], 0], [[30, 22, 70], [0, 3, -10], 6], [[0, 3.5, 52], [0, 3, 30], 4]] },
      { do: 'guide', title: 'The valley of Noor', text: 'The beacons of Noor have gone dim. Guardians bring the light back by learning. Walk with W A S D, the arrow keys or the stick. Space jumps, and Shift runs.' },
      { do: 'trail', points: [[0, 34], [1, 25], [-1, 16], [1, 7]], label: 'A lantern', objective: 'Follow the lantern trail along the stone path.' },
      { do: 'goto', id: 'pavilion', ...PAVILION, label: 'The learning pavilion', objective: 'Go into the learning pavilion.' },
      { do: 'stage', id: 'B' },
      { do: 'guide', title: 'The stepping stones', text: 'Before you read, warm up. Jump across the stepping stones and light the lantern at the top. If you fall, you go back to the last flag.' },
      { do: 'parkour', title: 'The stepping stones', text: 'Jump from stone to stone and light the lantern at the top.', objective: 'Reach the lantern on the stones', course: { x: 44, z: 14, axis: 'x', kind: 'rock', seed: 5 }, scrolls: [] },
      { do: 'goto', id: 'pavilion2', ...PAVILION, label: 'The reading desk', objective: 'Go back to the reading desk in the pavilion.' },
      { do: 'stage', id: 'C' },
      { do: 'read', title: 'Your first reading', text: READ[1] },
      { do: 'stage', id: 'D' },
      { do: 'guide', title: 'The waterwheel', text: 'The waterwheel by the stream has stopped, and the garden channel is dry. Go and look.' },
      { do: 'goto', id: 'wheel', ...WHEEL, label: 'The waterwheel', objective: 'Go to the waterwheel by the stream.' },
      { do: 'order', title: 'Start the waterwheel', text: 'Put the three jobs in the right order.', items: ['Clear the leaves from the channel', 'Open the little wooden gate', 'Push the wheel to start it turning'] },
      { do: 'wheel', title: 'The water runs', text: 'The wheel turns, and water runs along the channel to the garden.' },
      { do: 'beacon', k: 0.2, title: 'The first light', text: 'Your reading sent the first light to the beacon on the hill.' },
      { do: 'stage', id: 'E' },
      { do: 'reward', badge: 'first-steps', title: 'First Steps', text: 'You followed the path, read to the Sheikh and started the waterwheel.' },
      { do: 'reflect', prompt: 'What helped you read carefully today?', options: ['Going slowly', 'Listening to the Sheikh', 'A quiet place', 'Trying again'], finish: 'Finish the level' },
    ],
  },
  {
    id: '1.2', region: 1, label: 'Level 1.2', title: 'The Listening Garden', blurb: 'Listen to the reciter, read to the Sheikh, and learn from his notes.',
    steps: [
      { do: 'state', wheel: true, beacon: 0.2 },
      { do: 'stage', id: 'A' },
      { do: 'scene', time: 'day', at: [0, 30, 0, 0] },
      { do: 'guide', title: 'The Listening Garden', text: 'Listen to the birds and the wind. Use Sound and Narration at the top to turn sounds on or off.' },
      { do: 'goto', id: 'bench', x: -18, z: 10, label: 'A quiet bench', objective: 'Find the quiet bench in the garden.' },
      { do: 'stage', id: 'B' },
      { do: 'recite', surah: 1, ayahs: 7, title: 'Listen first', text: 'Listen to the reciter read Surah al-Fatihah. Notice how he stops and starts.' },
      { do: 'goto', id: 'pavilion', ...PAVILION, label: 'The reading desk', objective: 'Go to the reading desk in the pavilion.' },
      { do: 'stage', id: 'C' },
      { do: 'read', title: 'Read to the Sheikh', text: READ[2] },
      { do: 'stage', id: 'D' },
      { do: 'match', title: 'Notes and practice tips', text: 'Match each note from the Sheikh to the practice tip that helps with it.', pairs: [
        ['A word was missed', 'Read that ayah again slowly, word by word'],
        ['The Sheikh had to prompt you', 'Listen to the reciter, then read the ayah again'],
        ['You went back and fixed a word', 'Well done: correcting yourself is a good habit'],
      ], good: 'Every note has its tip. Notes are there to help, never to blame.' },
      { do: 'beacon', k: 0.45, title: 'Brighter', text: 'Listening and reading made the beacon brighter.' },
      { do: 'stage', id: 'E' },
      { do: 'reward', badge: 'listener', title: 'Careful Listener', text: 'You listened, read, and used the notes to practise.' },
      { do: 'reflect', prompt: 'Which practice tip will you try next time?', options: ['Read slowly, word by word', 'Listen first, then read', 'Fix my own mistakes', 'Ask my teacher'], finish: 'Finish the level' },
    ],
  },
  {
    id: '1.3', region: 1, label: 'Level 1.3', title: 'The Bridge of Patience', blurb: 'Find three planks, read, and mend the bridge across the stream.',
    steps: [
      { do: 'state', wheel: true, beacon: 0.45 },
      { do: 'stage', id: 'A' },
      { do: 'scene', time: 'day', at: [0, 30, 26, -20] },
      { do: 'guide', title: 'A broken bridge', text: 'The bridge across the stream has three planks missing. The water is too fast to wade through.' },
      { do: 'goto', id: 'bridge', ...BRIDGE, label: 'The broken bridge', objective: 'Go to the broken bridge.' },
      { do: 'stage', id: 'B' },
      { do: 'pieces', items: [[-44, 18], [52, -6], [14, 46]], unit: 'planks', each: 'You found a plank.', objective: 'Find the three glowing planks in the valley.' },
      { do: 'goto', id: 'pavilion', ...PAVILION, label: 'The reading desk', objective: 'Go to the reading desk in the pavilion.' },
      { do: 'stage', id: 'C' },
      { do: 'read', title: 'Read to the Sheikh', text: READ[2] },
      { do: 'stage', id: 'D' },
      { do: 'goto', id: 'bridge2', ...BRIDGE, label: 'The broken bridge', objective: 'Take the planks to the bridge.' },
      { do: 'order', title: 'Mend the bridge calmly', text: 'Put the jobs in order. Patient work is safe work.', items: ['Check the old planks', 'Lay the three new planks', 'Tie each plank firmly', 'Test the bridge with one step'] },
      { do: 'bridge', title: 'The bridge is mended', text: 'The bridge is mended. Walk across it.' },
      { do: 'goto', id: 'far', ...FAR, label: 'The far bank', objective: 'Cross the bridge to the far bank.' },
      { do: 'beacon', k: 0.75, title: 'The way north', text: 'The beacon shines brighter. The way north is open.' },
      { do: 'stage', id: 'E' },
      { do: 'reward', badge: 'patience', title: 'Patience', text: 'You kept going, read to the Sheikh, and mended the bridge step by step.' },
      { do: 'reflect', prompt: 'When something is hard to learn, what helps you be patient?', options: ['Taking one small step at a time', 'Asking for help', 'Trying again tomorrow', 'Remembering why I learn'], finish: 'Finish the level' },
    ],
  },
  {
    id: '2.1', region: 2, label: 'Level 2.1', title: 'The Pattern Walk', blurb: 'Climb the great trees, recite from memory, and remember the patterns.',
    steps: [
      { do: 'state', beacon: 0 },
      { do: 'stage', id: 'A' },
      { do: 'scene', time: 'dawn', at: [0, 40, 0, 0] },
      { do: 'fly', shots: [[[70, 46, 30], [0, 20, -44], 0], [[24, 28, 4], [0, 20, -44], 6], [[0, 3.5, 34], [0, 3, 0], 4]] },
      { do: 'guide', title: 'The Memory Canopy', text: 'Giant trees hold the light of memory here. Climb the spiral steps, cross the walkways in the leaves, and practise remembering.' },
      { do: 'goto', id: 'court', court: true, label: 'The memory courtyard', objective: 'Go to the memory courtyard, the ring of standing stones.' },
      { do: 'guide', title: 'How recall works', text: 'In a Hifz test, the Sheikh recites the start of an ayah. You carry on from memory until he stops you. If you get stuck, he helps you.' },
      { do: 'stage', id: 'B' },
      { do: 'goto', id: 'foot', foot: 'west', label: 'The spiral steps', objective: 'Go to the spiral steps of the west tree.' },
      { do: 'guide', title: 'Climb!', text: 'Jump from step to step around the trunk. If you fall, you land softly on the forest floor, so just try again.' },
      { do: 'goto', id: 'deck', deck: 'west', label: 'The west deck', objective: 'Climb the spiral steps to the deck.' },
      { do: 'trail', walk: ['west', 'great'], label: 'A lantern', objective: 'Follow the lanterns along the walkway to the great tree.' },
      { do: 'stage', id: 'C' },
      { do: 'read', mode: 'hifz', kicker: 'Recite to the Sheikh', title: 'Recite from memory', text: 'Choose the passage you are memorising. The Sheikh recites the start of each ayah, and you carry on from memory.', button: 'Go and recite to the Sheikh' },
      { do: 'stage', id: 'D' },
      { do: 'pattern', title: 'The Pattern Walk', text: 'Watch the shapes light up, then tap them in the same order.', rounds: [3, 4, 5], good: 'You remembered every pattern.' },
      { do: 'beacon', k: 0.25, title: 'A light in the leaves', text: 'Your recitation woke the beacon of the Memory Canopy.' },
      { do: 'stage', id: 'E' },
      { do: 'reward', badge: 'focus', title: 'Focus', text: 'You climbed, recited from memory and remembered every pattern.' },
      { do: 'reflect', prompt: 'What helps you remember an ayah?', options: ['Repeating it many times', 'Listening to the reciter', 'Reading it before I sleep', 'Reciting it to someone'], finish: 'Finish the level' },
    ],
  },
  {
    id: '2.2', region: 2, label: 'Level 2.2', title: 'The Echo Chamber', blurb: 'Listen to the reciter, recite from memory, and play the echo game.',
    steps: [
      { do: 'state', beacon: 0.25 },
      { do: 'stage', id: 'A' },
      { do: 'scene', time: 'day', at: [0, 30, 0, -44] },
      { do: 'guide', title: 'The Echo Hollow', text: 'Deep in the canopy, the hollow tree carries every sound. Reach it by the walkways high in the leaves.' },
      { do: 'goto', id: 'foot', foot: 'great', label: 'The spiral steps', objective: 'Go to the spiral steps of the great tree.' },
      { do: 'goto', id: 'deck', deck: 'great', label: 'The great deck', objective: 'Climb to the deck of the great tree.' },
      { do: 'trail', walk: ['great', 'hollow'], label: 'A lantern', objective: 'Follow the lanterns to the hollow tree.' },
      { do: 'stage', id: 'B' },
      { do: 'listen', title: 'Listen first', text: 'Listen to the reciter read the passage you are memorising. Notice where he pauses.' },
      { do: 'stage', id: 'C' },
      { do: 'read', mode: 'hifz', kicker: 'Recite to the Sheikh', title: 'Recite from memory', text: 'Choose the passage you are memorising. The Sheikh recites the start of each ayah, and you carry on from memory.', button: 'Go and recite to the Sheikh' },
      { do: 'stage', id: 'D' },
      { do: 'reflect', prompt: 'Choose one tip to practise this week.', options: ['Recite each ayah three times without looking', 'Listen to the reciter, then recite along', 'Join the end of each ayah to the start of the next', 'Recite the passage to my family'], finish: 'Continue' },
      { do: 'pattern', mode: 'sound', title: 'The Echo Game', text: 'Listen to the tones, then tap the shapes in the same order. Tick the box to see the pattern too.', rounds: [3, 4, 5], good: 'You repeated every echo.' },
      { do: 'beacon', k: 0.5, title: 'Brighter', text: 'Listening and reciting made the beacon brighter.' },
      { do: 'stage', id: 'E' },
      { do: 'reward', badge: 'echo-keeper', title: 'Echo Keeper', text: 'You listened carefully, recited from memory and repeated every echo.' },
      { do: 'reflect', prompt: 'How did listening first help you?', options: ['I knew where to pause', 'I remembered the words better', 'I heard how to say them', 'I felt calmer'], finish: 'Finish the level' },
    ],
  },
  {
    id: '2.3', region: 2, label: 'Level 2.3', title: 'The Roots of Revision', blurb: 'Revise a passage you know, join the roots, and light the beacon.',
    steps: [
      { do: 'state', beacon: 0.5 },
      { do: 'stage', id: 'A' },
      { do: 'scene', time: 'day', at: [0, 30, 34, -66] },
      { do: 'guide', title: 'Revision', text: 'What we memorise stays strong when we come back to it. Today you revise a passage you learned before.' },
      { do: 'goto', id: 'roots', x: 34, z: -64, label: 'The old tree', objective: 'Go to the roots of the old tree.' },
      { do: 'stage', id: 'B' },
      { do: 'pieces', thing: 'seed', items: [[-20, -40], [62, -48], [10, -104], [-62, -58]], unit: 'seeds', each: 'You found a seed.', objective: 'Find the four glowing seeds for the roots.' },
      { do: 'stage', id: 'C' },
      { do: 'read', mode: 'hifz', kicker: 'Revise with the Sheikh', title: 'Revise from memory', text: 'Choose a passage you memorised before, not a new one. Recite it to the Sheikh from memory.', button: 'Go and revise with the Sheikh' },
      { do: 'stage', id: 'D' },
      { do: 'roots', title: 'The Roots of Revision', text: 'Tap the tiles to turn them, until the roots join the spring to the old tree.' },
      { do: 'goto', id: 'foot', foot: 'great', label: 'The spiral steps', objective: 'Go to the spiral steps of the great tree.' },
      { do: 'goto', id: 'deck', deck: 'great', label: 'The beacon', objective: 'Climb to the beacon on the great deck.' },
      { do: 'beacon', k: 1, title: 'The beacon shines', text: 'The beacon of the Memory Canopy shines in full. The road to the City of Wisdom opens next.' },
      { do: 'stage', id: 'E' },
      { do: 'reflect', prompt: 'When will you revise this passage again?', options: ['Tomorrow', 'In three days', 'At my next class', 'A little every day'], finish: 'Continue' },
      { do: 'reward', badge: 'revision-garden', title: 'Revision Garden', text: 'You revised, joined the roots and planned your next revision. A Revision Garden grows in Noor.' },
    ],
  },
];

// a level as an episode for the quest runner
export function levelEpisode(id) {
  const L = LEVELS.find((x) => x.id === id);
  return { ...L, n: id, theme: L.region === 2 ? 'canopy' : 'noor', stages: STAGES, label: L.label, guideKicker: 'Guardian’s guide', loading: L.region === 2 ? 'Preparing the Memory Canopy…' : 'Preparing the valley of Noor…', noArchive: true };
}

// which levels the child can play: each opens when the one before it is finished
export function unlocked(id, done = {}) { const i = LEVELS.findIndex((x) => x.id === id); return i <= 0 || !!done[LEVELS[i - 1].id]; }
