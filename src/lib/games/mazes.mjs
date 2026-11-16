// The Dhikr Maze (docs/games-plan.md, Game 1). The mazes are data: a new maze is one more entry in MAZES and one
// line in GAMES (index.mjs).
//   token  the traveller (art.mjs): never a person      start, goal  the places at the two ends (art.mjs)
//   theme  the colours (games.css .mz-<theme>)            fact  shown at the goal (content.mjs, with its source)
//   gem    what can be picked up on the way (art.mjs)     fogName  what hides the maze at the "fog" stages
// No DOM here: this file is also read by Node (scripts/games/check.mjs, maze-sim.mjs).
import { FACTS } from './content.mjs';

export const MAZES = {
  hijrah: { id: 'hijrah', title: 'Makkah to Madinah', token: 'camel', start: 'makkah', goal: 'madinah', goalName: 'Madinah', theme: 'sand', fact: FACTS.hijrah,
    gem: 'date', gems: 'dates', fogName: 'sandstorm', fogText: 'A sandstorm! You can only see close to the camel. Remember the way.', tunnel: 'cave' },
  tarawih: { id: 'tarawih', title: 'To the masjid for Tarawih', token: 'lantern', start: 'home', goal: 'masjid', goalName: 'the masjid', theme: 'night', fact: FACTS.tarawih,
    gem: 'star', gems: 'stars', fogName: 'dark night', fogText: 'It is a dark night. You can only see what the lantern lights up.', tunnel: 'alley' },
};

// ── the four level tracks ─────────────────────────────────────────────────────────────────────────────────────────
// Every class level has its own track of ten stages: 1 to 3 teach, 4 to 7 build up, 8 and 9 test, 10 is the Final.
// A student's ranked track is their own level; they may practise any other. A new idea arrives one stage at a time
// (intro: a card the first time it is met), then joins the ones before it.
//   size        the maze is size × size cells (on every floor)
//   naps        a sleepy Grumbly (Snooze) naps in every dead end: waking him is a bump. Without it, a dead end only
//               says "dead end" (the first two stages of Level 1)
//   home        where a bump sends the traveller: 'junction' (the last crossroads) or 'start' (the start of the floor)
//   every, swaps, bias   the walls shift every `every` ms, `swaps` passages at a time; bias (0–1) is how often a shift
//               closes the way the traveller is on
//   monsters    roaming Grumblies: one appears at the start and another every `every` ms up to `max` (on each floor);
//               each steps every `step` ms. Those numbered in `chase` (0 = the first) follow the traveller, wandering
//               `slack` of the time; those in `fast` are Fib Grumblies (they dash, then rest)
//   gems        dates (stars) to pick up, shared out over the floors: all of them for the second star
//   key         a key opens the gate at the goal (on the first floor when there are more floors)
//   fog         only the cells within this many cells of the traveller can be seen
//   tunnels     a pair of tunnel ends (on the first floor): stepping into one comes out of the other
//   floors      2 or 3 floors joined by stairs (Allahu Akbar going up, SubhanAllah going down)
//   storms      Huff storms on the way, shared out over the floors (A'udhu billah clears them)
//   treasure    treasure doors: shortcuts through a wall (La hawla wa la quwwata illa billah opens one)
//   challenge   reach the goal within a number of moves and seconds (for the third star)
//   hasbuna     the Final of Level 4: once, Hasbunallahu wa ni'mal wakil gives a long shield
// The powers a stage offers follow from the level and the stage (powersOf below). The numbers were tuned with the
// simulated player (scripts/games/check.mjs, maze-sim.mjs), so a steady child of that age finishes every stage.
const G = (step, every, max, more = {}) => ({ step, every, max, ...more });
export const TRACKS = {
  1: [
    { size: 5, naps: false, home: 'junction', intro: 'bismillah' },
    { size: 5, naps: false, home: 'junction', gems: 3, intro: 'gems' },
    { size: 6, naps: true, home: 'junction', gems: 2, intro: 'naps' },
    { size: 6, naps: true, home: 'junction', monsters: G(1800, 40000, 1), intro: 'shield' },
    { size: 6, naps: true, home: 'junction', key: true, monsters: G(1800, 40000, 1), intro: 'key' },
    { size: 7, naps: true, home: 'junction', gems: 2, every: 8000, swaps: 1, bias: 0.15, monsters: G(1800, 40000, 1), intro: 'shift' },
    { size: 7, naps: true, home: 'junction', monsters: G(1700, 30000, 2), intro: 'two' },
    { size: 7, naps: true, home: 'junction', gems: 3, key: true, monsters: G(1700, 30000, 2) },
    { size: 8, naps: true, home: 'junction', gems: 3, fog: 3.2, monsters: G(1700, 36000, 1), intro: 'fog' },
    { size: 8, naps: true, home: 'junction', gems: 3, key: true, monsters: G(1600, 30000, 2), final: true },
  ],
  2: [
    { size: 6, naps: true, home: 'junction', gems: 2, monsters: G(1600, 30000, 1), intro: 'shield' },
    { size: 7, naps: true, home: 'junction', gems: 4, monsters: G(1500, 30000, 1), intro: 'speed' },
    { size: 7, naps: true, home: 'junction', gems: 3, every: 6500, swaps: 1, bias: 0.2, monsters: G(1500, 30000, 1), intro: 'shift' },
    { size: 8, naps: true, home: 'junction', gems: 3, every: 6500, swaps: 1, bias: 0.2, monsters: G(1500, 26000, 2), intro: 'two' },
    { size: 8, naps: true, home: 'junction', gems: 2, key: true, every: 6000, swaps: 1, bias: 0.25, monsters: G(1500, 26000, 2), intro: 'key' },
    { size: 8, naps: true, home: 'junction', gems: 4, fog: 2.6, monsters: G(1500, 26000, 2), intro: 'fog' },
    { size: 9, naps: true, home: 'junction', gems: 3, tunnels: true, every: 5500, swaps: 2, bias: 0.3, monsters: G(1400, 24000, 2), intro: 'tunnels' },
    { size: 9, naps: true, home: 'junction', gems: 3, every: 5500, swaps: 2, bias: 0.3, monsters: G(1400, 22000, 3, { chase: [1], slack: 0.55 }), intro: 'hunters' },
    { size: 9, naps: true, home: 'junction', gems: 3, key: true, fog: 2.8, monsters: G(1400, 24000, 2) },
    { size: 10, naps: true, home: 'junction', gems: 4, key: true, tunnels: true, challenge: true, every: 5000, swaps: 2, bias: 0.35, monsters: G(1300, 20000, 3, { chase: [1], slack: 0.5 }), final: true },
  ],
  3: [
    { size: 9, naps: true, home: 'junction', gems: 3, key: true, every: 5500, swaps: 2, bias: 0.3, monsters: G(1400, 24000, 3, { chase: [1], slack: 0.5 }), intro: 'shield' },
    { size: 9, naps: true, home: 'junction', gems: 2, floors: 2, monsters: G(1400, 24000, 2), intro: 'stairs' },
    { size: 9, naps: true, home: 'junction', gems: 3, storms: 2, every: 5500, swaps: 1, bias: 0.25, monsters: G(1400, 24000, 2), intro: 'storms' },
    { size: 10, naps: true, home: 'junction', gems: 3, floors: 2, every: 5500, swaps: 2, bias: 0.3, monsters: G(1300, 22000, 3, { chase: [0], slack: 0.5 }), intro: 'hunters' },
    { size: 10, naps: true, home: 'junction', gems: 2, floors: 2, key: true, storms: 1, monsters: G(1300, 22000, 2), intro: 'keyfloor' },
    { size: 10, naps: true, home: 'start', gems: 4, storms: 2, every: 5000, swaps: 2, bias: 0.35, monsters: G(1300, 22000, 3, { chase: [1], slack: 0.5 }), intro: 'home' },
    { size: 11, naps: true, home: 'start', gems: 3, fog: 3, monsters: G(1200, 20000, 4, { chase: [1, 2], slack: 0.45 }) },
    { size: 11, naps: true, home: 'start', gems: 3, floors: 2, tunnels: true, storms: 2, every: 5000, swaps: 2, bias: 0.35, monsters: G(1200, 20000, 3, { chase: [1], slack: 0.45 }) },
    { size: 11, naps: true, home: 'start', gems: 3, challenge: true, every: 4500, swaps: 3, bias: 0.45, monsters: G(1100, 18000, 4, { chase: [1], slack: 0.45 }), intro: 'challenge' },
    { size: 12, naps: true, home: 'start', gems: 4, floors: 2, key: true, storms: 2, tunnels: true, fog: 3, every: 4500, swaps: 3, bias: 0.4, monsters: G(1050, 17000, 5, { chase: [1, 3], slack: 0.42 }), final: true },
  ],
  4: [
    { size: 11, naps: true, home: 'start', gems: 3, key: true, storms: 1, every: 4500, swaps: 3, bias: 0.45, monsters: G(1100, 18000, 4, { chase: [1], slack: 0.45 }), intro: 'storms' },
    { size: 11, naps: true, home: 'start', gems: 3, treasure: 1, every: 4500, swaps: 2, bias: 0.4, monsters: G(1100, 18000, 4, { chase: [1], slack: 0.45 }), intro: 'treasure' },
    { size: 11, naps: true, home: 'start', gems: 5, monsters: G(1050, 16000, 5, { chase: [1, 3], slack: 0.42 }), intro: 'light' },
    { size: 12, naps: true, home: 'start', gems: 4, monsters: G(1050, 16000, 5, { chase: [1], fast: [2, 4], slack: 0.42 }), intro: 'fib' },
    { size: 12, naps: true, home: 'start', gems: 3, floors: 3, storms: 1, monsters: G(1050, 16000, 4, { chase: [1], slack: 0.45 }), intro: 'floors3' },
    { size: 12, naps: true, home: 'start', gems: 3, fog: 3, monsters: G(1000, 15000, 5, { chase: [0, 2, 4], slack: 0.45 }) },
    { size: 13, naps: true, home: 'start', gems: 3, key: true, storms: 2, treasure: 1, every: 4500, swaps: 3, bias: 0.4, monsters: G(1000, 15000, 4, { chase: [1], slack: 0.45 }) },
    { size: 13, naps: true, home: 'start', gems: 4, tunnels: true, every: 3200, swaps: 5, bias: 0.55, monsters: G(950, 14000, 5, { chase: [1, 3], slack: 0.42 }) },
    { size: 13, naps: true, home: 'start', gems: 4, key: true, challenge: true, every: 3500, swaps: 4, bias: 0.5, monsters: G(900, 13000, 6, { chase: [1, 3, 5], fast: [2], slack: 0.4 }), intro: 'challenge' },
    { size: 14, naps: true, home: 'start', gems: 5, floors: 2, key: true, storms: 2, treasure: 1, tunnels: true, fog: 3.4, challenge: true, every: 3000, swaps: 5, bias: 0.55, monsters: G(850, 12000, 7, { chase: [1, 3, 5], fast: [2, 6], slack: 0.4 }), hasbuna: true, final: true, intro: 'hasbuna' },
  ],
};
export const TRACK_LEN = 10;
export const LEVELS = [1, 2, 3, 4];
// The night maze is dark more often (the lantern lights the way): these stages are foggy only there.
const NIGHT_FOG = { 2: { 8: 3, 10: 3 }, 3: { 4: 3.2, 8: 3.2 }, 4: { 2: 3.2, 8: 3.4 } };

// The powers each level has (the plan's table): the shield from the first roaming Grumbly; Alhamdulillah after a date
// gives speed at Levels 2 and 3 and the light step at Level 4; the stairs, the storms and the doors come with their
// stages. Bismillah sets off every stage.
export function powersOf(level, L) {
  const p = new Set(['bismillah']);
  if (L.monsters || level >= 2) p.add('shield');
  if (level >= 2 && L.gems) p.add(level >= 4 ? 'light' : 'speed');
  if (L.floors > 1) { p.add('up'); p.add('down'); }
  if (L.storms) p.add('calm');
  if (L.treasure) p.add('treasure');
  if (L.hasbuna) p.add('hasbuna');
  return p;
}
// how long a power lasts and how long before the shield can be said again (ms), by level
export const SHIELD_MS = { 1: 12000, 2: 10000, 3: 8000, 4: 6000 };
export const SHIELD_REST = { 1: 8000, 2: 12000, 3: 15000, 4: 18000 };
export const SPEED_MS = 8000, LIGHT_MS = 5000, HASBUNA_MS = 15000, THANKS_WINDOW = 6000;

export function mazeTrack(id, level) {
  return TRACKS[level].map((s, i) => {
    const n = i + 1;
    const fog = id === 'tarawih' && NIGHT_FOG[level]?.[n] && !s.fog ? NIGHT_FOG[level][n] : s.fog;
    return { ...s, n, level, fog: fog || 0, floors: s.floors || 1, powers: powersOf(level, s) };
  });
}

// ── stars and points ──────────────────────────────────────────────────────────────────────────────────────────────
// ★ reach the goal · ★★ every date (on a stage without dates: at most two bumps) · ★★★ within the par time (and the
// challenge on a challenge stage; with no bump at Levels 3 and 4). Points: 100 a star and a speed bonus of up to 100
// (100 at or under the par time, falling to 0 at twice the par time). Dhikr never earns points.
// The par: the shortest way at a steady pace for the age, with time for each date and for each dhikr the way needs.
const SECS_A_MOVE = { 1: 1.1, 2: 0.9, 3: 0.75, 4: 0.65 };
export function parSecs({ level, best, gems = 0, says = 0 }) { return Math.round(best * SECS_A_MOVE[level] + gems * 4 + says * 3 + 6); }
export const challengeOf = (best) => ({ moves: Math.ceil(best * 1.6) + 4, secs: Math.max(45, best * 2) });
export function starsOf({ level, gemsAll, gemsGot, bumps, secs, moves, par, best, challenge }) {
  const second = gemsAll ? gemsGot >= gemsAll : bumps <= 2;
  const c = challengeOf(best);
  const met = !challenge || (moves <= c.moves && secs <= c.secs);
  const third = secs <= par && met && (level < 3 || bumps === 0);
  return 1 + (second ? 1 : 0) + (third ? 1 : 0);
}
export const speedBonus = (secs, par) => (secs <= par ? 100 : Math.max(0, Math.round((100 * (2 * par - secs)) / par)));
export const pointsOf = (stars, secs, par) => stars * 100 + speedBonus(secs, par);

// ── what each new idea says on its card, the first time it is met ──
// say: the dhikr the card teaches (shown with its meaning and source, dhikr.mjs)
export const STAGE_INTROS = {
  bismillah: { say: 'bismillah', text: () => 'Say Bismillah to set off. Then use the arrows to move.' },
  gems: { text: (d) => `Pick up the ${d.gems} on the way. Find them all for two stars!` },
  naps: { text: () => 'A sleepy Grumbly naps in every dead end. If you wake him, he bumps you back. Try another way!' },
  shield: { say: 'subhanallah', text: () => 'A Grumbly is out walking. If it comes near, say SubhanAllah. A bubble shield keeps you safe for a short time.' },
  key: { text: (d) => `The gate of ${d.goalName} is locked. Find the key first, then go to the gate.` },
  shift: { text: () => 'Watch the walls! Every few seconds one shimmers and moves, so the way can change.' },
  two: { text: () => 'Two Grumblies are out now. Keep away, or say SubhanAllah for your shield.' },
  fog: { text: (d) => d.fogText },
  speed: { say: 'alhamdulillah', text: (d) => `When you pick up a ${d.gem}, say Alhamdulillah. You will glide fast along the paths for a few seconds.` },
  tunnels: { text: () => 'Two tunnels are joined together: step into one, and you come out of the other.' },
  hunters: { text: () => 'Some Grumblies follow you now! They lose the way sometimes, and your shield still works.' },
  stairs: { say: 'allahuakbar', text: () => 'This maze has two floors. On the stairs, say Allahu Akbar to go up and SubhanAllah to go down.' },
  storms: { say: 'audhu', text: () => "A Huff storm blocks the way. Stand near it and say A'udhu billah, and the storm clears." },
  keyfloor: { text: (d) => `The key is on the first floor. Find it before you climb, or the gate of ${d.goalName} stays shut.` },
  home: { text: () => 'From now on, a bump sends you back to the start of the floor. Take care!' },
  challenge: { text: (d) => `A challenge: reach ${d.goalName} in a few moves and a short time for three stars.` },
  treasure: { say: 'lahawla', text: () => 'A treasure door is a shortcut through a wall. Stand next to it and say La hawla wa la quwwata illa billah to open it.' },
  light: { say: 'alhamdulillah', text: (d) => `Now, when you pick up a ${d.gem}, say Alhamdulillah. You can walk lightly past the Grumblies for a few seconds.` },
  fib: { text: () => 'Fib Grumblies dash fast, then stop to rest. Wait for the rest, then slip past.' },
  floors3: { text: () => 'Three floors now! Find the stairs on each floor.' },
  hasbuna: { say: 'hasbunallah', text: () => "The Final! Once in this stage, you may say Hasbunallahu wa ni'mal wakil for a long shield." },
};

// ── the student's progress (progress.mazes[id]) ───────────────────────────────────────────────────────────────────
// { v: 2, tracks: { '1': { open, best: { [stage]: { stars, secs, moves, points } } }, ... }, seen: [intro ids] }
// The first version had one ladder of 15 stages (opened from stage 1, 3, 5 or 7 by level, up to stage 6, 9 or 15).
// A student keeps what they earned: their own track opens as far as they had got (in proportion), and each stage
// before that carries the stars of the old stage at the same place in the ladder. Tracks below their level are open.
const OLD = { from: { 1: 1, 2: 3, 3: 5, 4: 7 }, cap: { 1: 6, 2: 9, 3: 15, 4: 15 } };
// intros whose idea did not change keep counting as seen
const SEEN_KEEP = ['gems', 'shift', 'key', 'fog', 'tunnels', 'challenge'];
export function trackOf(my, level, own) {
  my.tracks ??= {};
  return (my.tracks[level] ??= { open: level < own ? TRACK_LEN : 1, best: {} });
}
export function migrate(o, own) {
  if (o?.v === 2) return o;
  const out = { v: 2, tracks: {}, seen: (o?.seen ?? []).filter((x) => SEEN_KEEP.includes(x)) };
  const from = OLD.from[own] ?? 1, cap = OLD.cap[own] ?? 6, span = cap - from + 1;
  const old = o?.best ?? {};
  const done = Object.keys(old).map(Number).filter((n) => n >= from && n <= cap).sort((a, b) => a - b);
  const mine = trackOf(out, own, own);
  mine.open = Math.min(TRACK_LEN, Math.max(1, 1 + Math.floor((done.length / span) * TRACK_LEN)));
  for (let k = 1; k < mine.open; k++) {
    const j = Math.min(cap, from - 1 + Math.max(1, Math.ceil((k * span) / TRACK_LEN)));
    const b = old[j] ?? old[done.filter((x) => x <= j).pop()] ?? old[done[0]];
    const stars = Math.max(1, Math.min(3, b?.stars ?? 1));
    mine.best[k] = { stars, points: stars * 100, carried: true };
  }
  return out;
}
// the points of a track: the best run of each stage
export const trackPoints = (t) => Object.values(t?.best ?? {}).reduce((a, b) => a + (b.points ?? (b.stars ?? 0) * 100), 0);
