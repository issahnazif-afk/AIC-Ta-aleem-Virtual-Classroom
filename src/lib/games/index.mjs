// Play & Make: games and activities for young learners (mazes, word search, snakes and ladders, the family tree,
// guess who, the Seerah timeline, building games, colouring, and small daily tools). The classroom loads this file
// only when a student opens one of them, and each game loads its own code when it starts.
//   mountGame(root, { id, level, progress, earn, flash, onSave, onExit }) → { stop() }
//     earn(kind, key, score, good) → what was earned (the classroom records the Ta'aleem Stars); flash(earned)
// Each entry in GAMES: { title, ar, levels: the levels it adapts to, load: () => (stage, ctx) => { stop() } }.
// The level chips let a student try an easier or harder level than their own.
import './games.css';
import { el, btn, sfx, sayer, hush, store } from './kit.mjs';
import { MAZES } from './mazes.mjs';

const maze = (id) => () => import('./maze.mjs').then((mod) => (stage, ctx) => mod.mountMaze(stage, ctx, MAZES[id]));

export const GAMES = {
  'maze-hijrah': { title: 'Makkah to Madinah', ar: 'مِنْ مَكَّةَ إِلَى الْمَدِينَةِ', levels: [1, 2, 3, 4], load: maze('hijrah') },
  'maze-tarawih': { title: 'To the masjid for Tarawih', ar: 'إِلَى صَلَاةِ التَّرَاوِيحِ', levels: [1, 2, 3, 4], load: maze('tarawih') },
};

export function mountGame(root, { id, level = 1, progress = {}, earn, flash, onSave, onExit } = {}) {
  const g = GAMES[id];
  root.replaceChildren();
  root.className = 'gm';
  if (!g) { root.append(el('p', null, 'This game is not ready yet.')); return { stop() {} }; }
  const own = Math.min(4, Math.max(1, level || 1));
  let lv = g.levels.includes(own) ? own : g.levels.reduce((a, b) => (Math.abs(b - own) < Math.abs(a - own) ? b : a));
  let game = null, run = 0;

  const head = el('div', 'gm-head');
  const titles = el('div', 'gm-titles');
  const ar = el('p', 'gm-ar', g.ar); ar.lang = 'ar'; ar.dir = 'rtl';
  titles.append(el('h2', 'gm-title', g.title), ar);
  const tools = el('div', 'gm-tools');
  if (g.levels.length > 1) {
    const chips = el('div', 'gm-levels'); chips.setAttribute('role', 'radiogroup'); chips.setAttribute('aria-label', 'Level');
    for (const n of g.levels) {
      const c = btn('gm-chip'); c.innerHTML = `<span class="gm-lv-word">Level </span>${n}`; c.setAttribute('aria-label', `Level ${n}`); c.setAttribute('role', 'radio'); c.dataset.level = n;
      c.setAttribute('aria-checked', String(n === lv));
      c.addEventListener('click', () => { lv = n; chips.querySelectorAll('.gm-chip').forEach((x) => x.setAttribute('aria-checked', String(Number(x.dataset.level) === lv))); start(); });
      chips.append(c);
    }
    tools.append(chips);
  }
  const snd = btn('gm-chip gm-sound', '', 'Sound effects');
  const paintSnd = () => { snd.textContent = sfx.muted ? '🔇 Sound off' : '🔊 Sound on'; snd.setAttribute('aria-pressed', String(!sfx.muted)); };
  snd.addEventListener('click', () => { sfx.setMuted(!sfx.muted); paintSnd(); });
  paintSnd();
  tools.append(snd);
  head.append(titles, tools);
  const stage = el('div', 'gm-stage');
  root.append(head, stage);

  async function start() {
    const my = ++run;
    game?.stop?.(); game = null; hush();
    stage.replaceChildren(el('p', 'gm-loading', 'Getting the game ready…'));
    const mount = await g.load();
    if (my !== run) return;
    stage.replaceChildren();
    stage.className = 'gm-stage gm-l' + lv;
    const ctx = {
      id, level: lv, own, progress, store, sfx, say: sayer(lv),
      earn: ({ kind = 'game', key, score = 1, good = false }) => { const e = earn?.(kind, key, score, good); flash?.(e); onSave?.(); return e; },
      save: () => onSave?.(),
      exit: () => onExit?.(),
    };
    game = mount(stage, ctx);
  }
  start();
  return { stop() { run++; game?.stop?.(); game = null; hush(); }, get game() { return game; } };
}
