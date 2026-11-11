import { MAZES, STAGE_INTROS } from './mazes.mjs';
// The English lines the Play & Make games read aloud for Levels 1 and 2. scripts/voice/narration-list.mjs lists
// them for the recorded storyteller voice, and scripts/games/check.mjs runs them through the writing check.
// No DOM here: this file is also read by Node.

export const MAZE_LINES = {
  hijrah: 'Help the camel travel from Makkah to Madinah. Use the arrows to move.',
  tarawih: 'Help the lantern find the way to the masjid for Tarawih. Use the arrows to move.',
  gobble: 'Oops! The munching monster lives in that dead end. Try another way.',
  gobbleSoft: "Oops! Silly monster. Let's try another way.",
  caught: 'Gulp! A monster caught you. Now it is full, so it goes home.',
  shift: 'Look! The walls are moving.',
  won: 'You made it! Masha Allah!',
};

// the cards that say what is new at a maze stage (read aloud at Levels 1 and 2), for both mazes
export const MAZE_INTRO_LINES = Object.values(MAZES).flatMap((d) => Object.values(STAGE_INTROS).map((f) => f(d)));

export const ALL_LINES = [...Object.values(MAZE_LINES), ...new Set(MAZE_INTRO_LINES)];
export const TEXTS = ALL_LINES.map((t) => ['read-aloud line', t, 2]);
