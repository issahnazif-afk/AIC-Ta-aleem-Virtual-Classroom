// Progress kept in this browser only (localStorage). No account, server or analytics.
import { STAGES, GEAR, LOOK } from '../content.js';

const KEY = 'taaleemAdventure.v11';
const fresh = () => ({
  version: '1.1',
  xp: 0,
  stars: 0,            // stars earned (lifetime), spent on gear
  spent: 0,
  stages: {},          // id → { stars, best, done }
  seen: [],            // story sequences already watched
  look: { skin: 1, outfit: 0, accent: 0, head: 1, style: 0 },
  owned: ['satchel'],
  equipped: ['satchel'],
  settings: { quality: 'auto', sound: true, music: true, motion: true },
});

export const save = load();

// The class level, when the game is opened from the Ta'aleem Classroom (…/adventure/?level=1–4): Level 1 runs a little
// slower with more time in the arena, Level 4 a little faster. Played on its own, it is Level 3.
export const level = (() => {
  let n = Number(new URLSearchParams(location.search).get('level'));
  try { if (n >= 1 && n <= 4) sessionStorage.setItem('adv-level', String(n)); else n = Number(sessionStorage.getItem('adv-level')); } catch {}
  return n >= 1 && n <= 4 ? n : 3;
})();
export const pace = { 1: 0.8, 2: 0.9, 3: 1, 4: 1.1 }[level];

function load() {
  let s = fresh();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) s = { ...s, ...JSON.parse(raw) };
    else {
      // v1.0 progress: its XP carries over, and its finished stages count as the first ones here
      const old = JSON.parse(localStorage.getItem('taleemAdventure') || 'null');
      if (old?.xp) s.xp = old.xp;
    }
  } catch {}
  s.settings = { ...fresh().settings, ...s.settings };
  s.look = { ...fresh().look, ...s.look };
  return s;
}

export function persist() { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch {} }

export const starsAvailable = () => save.stars - save.spent;
export const isDone = (id) => !!save.stages[id]?.done;
// a stage is open when it is the first, or the one before it is done
export function isOpen(id) {
  const i = STAGES.findIndex((s) => s.id === id);
  return i === 0 || isDone(STAGES[i - 1].id);
}
export function nextStage() { return STAGES.find((s) => !isDone(s.id)) ?? STAGES[STAGES.length - 1]; }

export function recordStage(id, stars, xp) {
  const prev = save.stages[id] ?? { stars: 0, best: 0, done: false };
  const gained = Math.max(0, stars - prev.stars);   // stars are only counted once per stage (the best result)
  save.stages[id] = { stars: Math.max(prev.stars, stars), best: Math.max(prev.best, xp), done: true };
  save.stars += gained;
  save.xp += xp;
  persist();
  return gained;
}

export function buy(id) {
  const g = GEAR.find((x) => x.id === id);
  if (!g || save.owned.includes(id) || starsAvailable() < g.cost) return false;
  save.spent += g.cost; save.owned.push(id); save.equipped.push(id); persist();
  return true;
}
export function toggleEquip(id) {
  if (!save.owned.includes(id)) return;
  const i = save.equipped.indexOf(id);
  if (i >= 0) save.equipped.splice(i, 1); else save.equipped.push(id);
  persist();
}
// the combined effects of the gear being worn
export function gearEffects() {
  const e = { jump: 1, wind: 1, light: 1, compass: false, magnet: 1.2 };
  for (const id of save.equipped) {
    const g = GEAR.find((x) => x.id === id);
    if (!g?.effect) continue;
    for (const [k, v] of Object.entries(g.effect)) e[k] = typeof v === 'boolean' ? v : k === 'magnet' ? Math.max(e[k], v) : e[k] * v;
  }
  return e;
}
export function lookColors() {
  const l = save.look;
  return { skin: LOOK.skin[l.skin], outfit: LOOK.outfit[l.outfit], accent: LOOK.accent[l.accent], head: LOOK.head[l.head].id, style: LOOK.style[l.style].id };
}
export function resetAll() { try { localStorage.removeItem(KEY); } catch {} location.reload(); }
