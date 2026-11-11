// The mazes are data: a new maze is one more entry here and one line in GAMES (index.mjs).
//   token  the traveller (art.mjs): never a person      start, goal  the places at the two ends (art.mjs)
//   theme  the colours (games.css .mz-<theme>)            fact  shown at the goal (content.mjs, with its source)
//   gem    what can be picked up on the way (art.mjs)     fogName  what hides the maze at the "fog" stages
import { FACTS } from './content.mjs';

export const MAZES = {
  hijrah: { id: 'hijrah', title: 'Makkah to Madinah', token: 'camel', start: 'makkah', goal: 'madinah', goalName: 'Madinah', theme: 'sand', fact: FACTS.hijrah,
    gem: 'date', gems: 'dates', fogName: 'sandstorm', fogText: 'A sandstorm! You can only see close to the camel. Remember the way.', tunnel: 'cave' },
  tarawih: { id: 'tarawih', title: 'To the masjid for Tarawih', token: 'lantern', start: 'home', goal: 'masjid', goalName: 'the masjid', theme: 'night', fact: FACTS.tarawih,
    gem: 'star', gems: 'stars', fogName: 'dark night', fogText: 'It is a dark night. You can only see what the lantern lights up.', tunnel: 'alley' },
};

// ── the stages ────────────────────────────────────────────────────────────────────────────────────────────────────
// Every maze is a ladder of stages, from a small, calm maze to a big one with every challenge at once. A new idea
// arrives one stage at a time (intro: shown on a card the first time), then joins the ones before it.
//   size        the maze is size × size cells
//   every, swaps, bias   the walls shift every `every` ms, `swaps` passages at a time; bias (0–1) is how often a shift
//               closes the way the traveller is on
//   home        where a gobbled traveller starts again: 'junction' (the last crossroads) or 'start'
//   mood        the dead-end monster: 'soft' (a sleepy smile) or 'munch'
//   monsters    roaming monsters: one appears at the start and another every `every` ms up to `max`; each steps every
//               `step` ms. The ones numbered in `chase` (0 = the first) hunt the traveller, wandering `slack` of the time.
//   gems        things to pick up on the way (dates, stars): optional, needed for three stars
//   key         a key somewhere in the maze opens the gate at the goal
//   fog         only the cells within this many steps' distance (as the crow flies) of the traveller can be seen
//   tunnels     a pair of tunnel ends: stepping into one comes out of the other
//   challenge   reach the goal within a number of moves and seconds (for three stars)
// The numbers were tuned with the simulated player in scripts/games/check.mjs, so a steady player finishes every stage.
const LADDER = [
  { size: 5, mood: 'soft', home: 'junction' },
  { size: 6, mood: 'soft', home: 'junction', gems: 3, intro: 'gems' },
  { size: 7, mood: 'munch', home: 'junction', gems: 3, every: 6500, swaps: 1, bias: 0.2, intro: 'shift' },
  { size: 7, mood: 'munch', home: 'junction', every: 6000, swaps: 1, bias: 0.25, monsters: { step: 1600, every: 30000, max: 1 }, intro: 'monsters' },
  { size: 8, mood: 'munch', home: 'junction', key: true, every: 6000, swaps: 1, bias: 0.25, monsters: { step: 1500, every: 26000, max: 2 }, intro: 'key' },
  { size: 8, mood: 'munch', home: 'junction', gems: 4, fog: 2.6, monsters: { step: 1500, every: 26000, max: 2 }, intro: 'fog' },
  { size: 9, mood: 'munch', home: 'junction', gems: 3, tunnels: true, every: 5500, swaps: 2, bias: 0.3, monsters: { step: 1400, every: 24000, max: 3 }, intro: 'tunnels' },
  { size: 9, mood: 'munch', home: 'start', key: true, every: 5000, swaps: 2, bias: 0.35, monsters: { step: 1300, every: 22000, max: 3 }, intro: 'home' },
  { size: 10, mood: 'munch', home: 'start', gems: 4, every: 4500, swaps: 3, bias: 0.4, monsters: { step: 1150, every: 20000, max: 4, chase: [1], slack: 0.45 }, intro: 'hunters' },
  { size: 10, mood: 'munch', home: 'start', key: true, fog: 3, every: 6000, swaps: 1, bias: 0.3, monsters: { step: 1150, every: 20000, max: 4, chase: [1], slack: 0.45 } },
  { size: 11, mood: 'munch', home: 'start', challenge: true, every: 4000, swaps: 3, bias: 0.45, monsters: { step: 1050, every: 18000, max: 5, chase: [1], slack: 0.42 }, intro: 'challenge' },
  { size: 11, mood: 'munch', home: 'start', gems: 4, key: true, tunnels: true, every: 4000, swaps: 3, bias: 0.5, monsters: { step: 1000, every: 16000, max: 5, chase: [1, 3], slack: 0.4 } },
  { size: 12, mood: 'munch', home: 'start', gems: 5, fog: 3, every: 3500, swaps: 4, bias: 0.5, monsters: { step: 950, every: 15000, max: 6, chase: [1, 3], slack: 0.4 } },
  { size: 13, mood: 'munch', home: 'start', gems: 5, key: true, tunnels: true, every: 3200, swaps: 5, bias: 0.55, monsters: { step: 900, every: 13000, max: 7, chase: [1, 3, 5], slack: 0.4 } },
  { size: 14, mood: 'munch', home: 'start', gems: 6, key: true, tunnels: true, fog: 3.4, challenge: true, every: 3000, swaps: 5, bias: 0.6, monsters: { step: 850, every: 12000, max: 7, chase: [1, 3, 5], slack: 0.4 }, final: true },
];
// The night maze is dark more often: from stage 7 every other stage is lit only by the lantern.
const NIGHT_FOG = { 7: 3, 9: 3, 12: 3.2, 14: 3.2 };

export function mazeStages(id) {
  return LADDER.map((s, i) => {
    const n = i + 1;
    const fog = id === 'tarawih' && NIGHT_FOG[n] && !s.fog ? NIGHT_FOG[n] : s.fog;
    return { ...s, n, fog: fog || 0 };
  });
}
export const STAGE_COUNT = LADDER.length;

// The student's class level sets where the ladder starts and how far it goes: younger children see the gentler stages
// first, and the hardest stages open from Level 3. Any stage that is open can be played again.
export const STAGE_OPEN = { 1: 1, 2: 3, 3: 5, 4: 7 };      // stages open from the start
export const STAGE_CAP = { 1: 6, 2: 9, 3: 15, 4: 15 };    // the last stage a level can reach

// What each new idea says on its card, the first time it appears
export const STAGE_INTROS = {
  gems: (d) => `Pick up the ${d.gems} on the way. Find them all for three stars!`,
  shift: () => 'Watch the walls! Every few seconds one shimmers and moves, so the way can change.',
  monsters: () => 'A monster now roams the corridors. Keep away from it, or wait for it to pass.',
  key: (d) => `The gate of ${d.goalName} is locked. Find the key first, then go to the gate.`,
  fog: (d) => d.fogText,
  tunnels: () => 'Two tunnels are joined together: step into one, and you come out of the other.',
  home: () => 'From now on, a gobble sends you all the way back to the start. Take care!',
  hunters: () => 'The orange monsters hunt you! They follow you, but sometimes they lose the way.',
  challenge: (d) => `A challenge: reach ${d.goalName} in a few moves and a short time for three stars.`,
};

