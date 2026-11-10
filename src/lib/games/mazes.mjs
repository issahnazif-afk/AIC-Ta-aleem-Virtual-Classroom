// The mazes are data: a new maze is one more entry here and one line in GAMES (index.mjs).
//   token  the traveller (art.mjs): never a person      start, goal  the places at the two ends (art.mjs)
//   theme  the colours (games.css .mz-<theme>)            fact  shown at the goal (content.mjs, with its source)
import { FACTS } from './content.mjs';

export const MAZES = {
  hijrah: { id: 'hijrah', title: 'Makkah to Madinah', token: 'camel', start: 'makkah', goal: 'madinah', goalName: 'Madinah', theme: 'sand', fact: FACTS.hijrah },
  tarawih: { id: 'tarawih', title: 'To the masjid for Tarawih', token: 'lantern', start: 'home', goal: 'masjid', goalName: 'the masjid', theme: 'night', fact: FACTS.tarawih },
};

// How each level plays: the size, how often the walls shift and how many passages swap, how often the shift
// closes the way the traveller is on (bias), where a gobbled traveller starts again, and the monster's mood.
export const MAZE_LEVELS = {
  1: { size: 5, every: 0, swaps: 0, bias: 0, home: 'junction', mood: 'soft' },
  2: { size: 7, every: 6000, swaps: 1, bias: 0.25, home: 'junction', mood: 'munch' },
  3: { size: 10, every: 4000, swaps: 3, bias: 0.45, home: 'start', mood: 'munch' },
  4: { size: 13, every: 3000, swaps: 5, bias: 0.6, home: 'start', mood: 'munch', wanderer: 1100, challenge: true },
};
