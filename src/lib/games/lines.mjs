import { MAZES, STAGE_INTROS } from './mazes.mjs';
// The English lines the Play & Make games read aloud for Levels 1 and 2. scripts/voice/narration-list.mjs lists
// them for the recorded storyteller voice, and scripts/games/check.mjs runs them through the writing check.
// No DOM here: this file is also read by Node.

export const MAZE_LINES = {
  hijrah: 'Help the camel travel from Makkah to Madinah. Say Bismillah, then use the arrows to move.',
  tarawih: 'Help the lantern find the way to the masjid for Tarawih. Say Bismillah, then use the arrows to move.',
  nap: 'Oops! A sleepy Grumbly naps in that dead end. Try another way.',
  deadEnd: 'That is a dead end. Go back and try another way.',
  caught: 'Bump! A Grumbly bumped into you. Off it goes home.',
  shield: 'SubhanAllah! Your shield is up.',
  shift: 'Look! The walls are moving.',
  won: 'You made it! Masha Allah!',
};

// the cards that say what is new at a maze stage (read aloud at Levels 1 and 2), for both mazes
export const MAZE_INTRO_LINES = Object.values(MAZES).flatMap((d) => Object.values(STAGE_INTROS).map((x) => x.text(d)));

export const ALL_LINES = [...Object.values(MAZE_LINES), ...new Set(MAZE_INTRO_LINES)];
export const TEXTS = ALL_LINES.map((t) => ['read-aloud line', t, 2]);
