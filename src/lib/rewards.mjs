// Ta'aleem Stars: one rewards system for every activity, kept in the student's progress (saved to the admin
// sheet, where teachers see Stars, Badges and Day streak). Stars reward effort, improvement and steady practice,
// never a ranking: there is no class leaderboard, and recitation itself is never scored against others.

const today = () => new Date().toLocaleDateString('en-CA');   // 2026-10-31, in the student's own time zone

export const BADGES = [
  { id: 'first', name: 'First Steps', text: 'Complete your first activity.', icon: '🌱' },
  { id: 'quran', name: 'Quran Explorer', text: 'Complete five Qurʾan activities.', icon: '📖' },
  { id: 'lantern', name: 'Lantern Keeper', text: 'Complete ten learning challenges.', icon: '🏮' },
  { id: 'kindness', name: 'Kindness Champion', text: 'Complete five Akhlaq challenges or character missions.', icon: '🤝' },
  { id: 'daily', name: 'Daily Achiever', text: 'Finish all three of a day’s missions.', icon: '☀️' },
  { id: 'streak', name: 'Steady Steps', text: 'Learn on seven days in a row.', icon: '👣' },
  { id: 'garden', name: 'Garden Grower', text: 'Grow five Alif Ba palms.', icon: '🌴' },
  { id: 'improve', name: 'Rising Star', text: 'Do better than your last try three times.', icon: '⭐' },
];

// which daily mission an activity counts towards
const KIND = {
  hifz: 'quran', reading: 'quran', ayah: 'quran',
  journey: 'knowledge', match: 'knowledge', salah: 'knowledge', detective: 'knowledge', alifba: 'knowledge', seerah: 'knowledge',
  akhlaq: 'character', story: 'character', library: 'character',
  book: 'knowledge',   // a chapter of an Al-Huda Book (a story book counts as 'library')
};

export function rewardsOf(progress) {
  const r = progress.rewards ??= {};
  r.stars ??= 0; r.badges ??= {}; r.counts ??= {}; r.best ??= {}; r.days ??= []; r.streak ??= 0;
  if (r.daily?.date !== today()) r.daily = { date: today(), done: {}, deed: null };
  return r;
}

function markDay(r) {
  const d = today();
  if (!r.days.includes(d)) r.days = [...r.days, d].slice(-60);
  // the streak: consecutive days up to today
  let n = 0;
  for (let t = new Date(); ; t.setDate(t.getDate() - 1)) {
    if (r.days.includes(t.toLocaleDateString('en-CA'))) n++; else break;
  }
  r.streak = n;
}

// Record a finished activity. kind: hifz | reading | ayah | journey | match | salah | detective | alifba | akhlaq | seerah | story | library
// key: what "your last try" means (e.g. "match:Prophets"); score: higher is better (accuracy %, or fewer mistakes as a negative).
// Returns what was earned, for the end screen.
export function record(progress, { kind, key, score = null, good = false, gardenPalms = 0 }) {
  const r = rewardsOf(progress);
  const earned = { stars: 0, notes: [], badges: [] };
  const give = (n, note) => { r.stars += n; earned.stars += n; if (note) earned.notes.push(note); };
  give(1, 'for finishing');
  if (good) give(1, 'for a strong result');
  if (key && score != null) {
    const prev = r.best[key];
    if (prev != null && score > prev) { give(1, 'for doing better than last time'); r.counts.improve = (r.counts.improve ?? 0) + 1; }
    if (prev == null || score > prev) r.best[key] = score;
  }
  r.counts.all = (r.counts.all ?? 0) + 1;
  if (KIND[kind] === 'quran') r.counts.quran = (r.counts.quran ?? 0) + 1;
  if (kind === 'akhlaq') r.counts.kindness = (r.counts.kindness ?? 0) + 1;
  markDay(r);
  const mission = KIND[kind];
  if (mission && mission !== 'character' && !r.daily.done[mission]) { r.daily.done[mission] = true; give(1, `${mission === 'quran' ? 'Qurʾan' : 'Knowledge'} mission done`); }
  if (KIND[kind] === 'character' && !r.daily.done.character) { r.daily.done.character = true; give(1, 'Character mission done'); }
  dailyBonus(r, give);
  earned.badges = checkBadges(r, gardenPalms);
  return earned;
}

// The character mission: the student marks today's good deed as done (it counts towards Kindness Champion).
export function deedDone(progress) {
  const r = rewardsOf(progress);
  const earned = { stars: 0, notes: [], badges: [] };
  if (r.daily.done.character) return earned;
  const give = (n, note) => { r.stars += n; earned.stars += n; if (note) earned.notes.push(note); };
  r.daily.done.character = true;
  r.counts.kindness = (r.counts.kindness ?? 0) + 1;
  markDay(r);
  give(1, 'Character mission done');
  dailyBonus(r, give);
  earned.badges = checkBadges(r, 0);
  return earned;
}

function dailyBonus(r, give) {
  const d = r.daily.done;
  if (d.quran && d.knowledge && d.character && !d.all) { d.all = true; r.counts.dailies = (r.counts.dailies ?? 0) + 1; give(2, 'All three missions done today'); }
}

function checkBadges(r, palms) {
  const c = r.counts, got = [];
  const has = {
    first: c.all >= 1, quran: (c.quran ?? 0) >= 5, lantern: (c.all ?? 0) >= 10, kindness: (c.kindness ?? 0) >= 5,
    daily: (c.dailies ?? 0) >= 1, streak: r.streak >= 7, garden: palms >= 5, improve: (c.improve ?? 0) >= 3,
  };
  for (const b of BADGES) if (has[b.id] && !r.badges[b.id]) { r.badges[b.id] = today(); got.push(b); }
  return got;
}

// Today's three missions, with the character mission chosen from the approved good deeds.
export function todaysMissions(progress, deeds, username = '') {
  const r = rewardsOf(progress);
  if (!r.daily.deed && deeds.length) {
    const seed = [...(today() + username)].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
    r.daily.deed = deeds[seed % deeds.length].prompt;
  }
  return [
    { key: 'quran', title: 'Qurʾan mission', text: 'Recite to the Sheikh (Hifz test or Mujawwadah), or play Build the Ayah.', done: !!r.daily.done.quran },
    { key: 'knowledge', title: 'Knowledge mission', text: 'Play Journey to Knowledge, Match the Deen, Salah Master, Letter Detective or an Alif Ba game.', done: !!r.daily.done.knowledge },
    { key: 'character', title: 'Character mission', text: r.daily.deed ?? 'Play Akhlaq Heroes, or do a good deed today.', done: !!r.daily.done.character, deed: !!r.daily.deed },
  ];
}
