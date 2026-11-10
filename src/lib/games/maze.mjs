// The maze game. The maze is made fresh every time (maze-core.mjs) and always has a way through. The traveller
// moves with the arrow keys or WASD, a swipe on the maze, a tap on the next cell, or the big arrow buttons.
// Walking into a dead end wakes the munching monster, who gobbles the traveller up (a cartoon gulp, no teeth):
// Levels 1 and 2 start again from the last crossroads, Levels 3 and 4 from the start.
// From Level 2 the walls shift every few seconds (with a shimmer first), so the right way can change; the
// shift is always a swap that keeps exactly one way from every cell to the goal (see maze-core.mjs).
// Level 4 adds a slow monster that wanders the corridors, and a moves-and-time challenge.
//   mountMaze(stage, ctx, data)   data: MAZES[id] (mazes.mjs)
import { makeMaze, xy, open, neighbours, degree, isDeadEnd, stepFrom, pathBetween, planShift, applyShift, wander, cellsAround } from './maze-core.mjs';
import { el, btn, svgEl, sfx, bubble, endCard, reduced } from './kit.mjs';
import { ART } from './art.mjs';
import { MAZE_LINES } from './lines.mjs';
import { MAZE_LEVELS } from './mazes.mjs';


const S = 40;   // one cell, in SVG units

export function mountMaze(stage, ctx, data) {
  const L = MAZE_LEVELS[ctx.level] ?? MAZE_LEVELS[1];
  const timers = [];
  let m, token, lastSafe, moves, gobbles, busy, won, t0, wand, wandFrom, pending, best;

  const wrap = el('div', 'mz mz-' + data.theme + ' mz-l' + ctx.level);
  const bar = el('div', 'mz-bar');
  const info = el('p', 'mz-info'); info.setAttribute('aria-live', 'polite');
  const chal = el('p', 'mz-chal');
  bar.append(info, chal);
  const board = el('div', 'mz-board'); board.tabIndex = 0;
  board.setAttribute('role', 'application');
  board.setAttribute('aria-label', `${data.title} maze. Use the arrow keys to move the ${data.token}.`);
  const svg = svgEl('svg', { class: 'mz-svg' });
  board.append(svg);
  const pad = el('div', 'mz-pad');
  const DIRS = [['↑', 'Up', 0], ['←', 'Left', 3], ['↓', 'Down', 2], ['→', 'Right', 1]];
  for (const [t, name, d] of DIRS) {
    const b = btn('mz-arrow mz-' + name.toLowerCase(), t, name);
    b.addEventListener('click', () => move(d));
    pad.append(b);
  }
  const help = el('p', 'mz-help', ctx.level === 1
    ? 'Tap the arrows to move. Dead ends hide a sleepy monster!'
    : ctx.level === 2
      ? 'Arrows, keys or swipe. Dead ends hide a munching monster, and every few seconds a wall moves.'
      : ctx.level === 3
        ? 'Walls shift every 4 seconds, so the right way can change. A dead end sends you back to the start.'
        : 'Walls shift every 3 seconds, and a hungry monster wanders the corridors. Dead ends send you back to the start.');
  wrap.append(bar, board, pad, help);
  stage.append(wrap);

  // keyboard: arrows and WASD while the maze is on screen
  const KEYS = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3, w: 0, d: 1, s: 2, a: 3, W: 0, D: 1, S: 2, A: 3 };
  const onKey = (e) => {
    if (!wrap.isConnected || e.target.closest?.('input, textarea, select')) return;
    const d = KEYS[e.key];
    if (d == null) return;
    e.preventDefault(); move(d);
  };
  window.addEventListener('keydown', onKey);
  // swipe or tap on the board
  let p0 = null;
  board.addEventListener('pointerdown', (e) => { p0 = [e.clientX, e.clientY]; board.focus({ preventScroll: true }); });
  board.addEventListener('pointerup', (e) => {
    if (!p0) return;
    const dx = e.clientX - p0[0], dy = e.clientY - p0[1]; p0 = null;
    if (Math.hypot(dx, dy) > 24) { move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0)); return; }
    // a tap: towards the tapped cell
    const r = svg.getBoundingClientRect(); const k = r.width / (m.w * S);
    const cx = Math.floor((e.clientX - r.left) / k / S), cy = Math.floor((e.clientY - r.top) / k / S);
    const [tx, ty] = xy(m, token);
    const ddx = cx - tx, ddy = cy - ty;
    if (!ddx && !ddy) return;
    move(Math.abs(ddx) >= Math.abs(ddy) ? (ddx > 0 ? 1 : 3) : (ddy > 0 ? 2 : 0));
  });
  board.style.touchAction = 'none';

  let walls = new Map();   // "a-b" → line
  let tokenG, monG, wandG, layer;
  const centre = (c) => { const [x, y] = xy(m, c); return [x * S + S / 2, y * S + S / 2]; };
  const place = (g, c, scale = 0.8) => { const [x, y] = centre(c); g.setAttribute('transform', `translate(${x - 32 * scale * S / 64} ${y - 32 * scale * S / 64}) scale(${scale * S / 64})`); };

  function start() {
    timers.splice(0).forEach(clearInterval);
    stage.querySelectorAll('.gm-end').forEach((x) => x.remove());
    m = makeMaze(L.size, L.size);
    token = m.start; lastSafe = m.start; moves = 0; gobbles = 0; busy = false; won = false; t0 = Date.now(); pending = null;
    best = pathBetween(m, m.start, m.goal).length - 1;
    draw();
    if (L.wanderer) {
      // the wanderer starts in the middle of the maze, away from the start
      wand = Math.floor(m.n / 2); wandFrom = -1; place(wandG, wand, 0.82);
      timers.push(setInterval(stepWanderer, L.wanderer));
    }
    if (L.every) timers.push(setInterval(shiftSoon, L.every));
    timers.push(setInterval(status, 500));
    status();
    ctx.say(MAZE_LINES[data.id]);
    board.focus({ preventScroll: true });
  }

  function draw() {
    svg.replaceChildren();
    svg.setAttribute('viewBox', `-4 -4 ${m.w * S + 8} ${m.h * S + 8}`);
    svg.append(svgEl('rect', { x: -4, y: -4, width: m.w * S + 8, height: m.h * S + 8, rx: 10, class: 'mz-ground' }));
    // a soft dotted trail where the traveller has been
    layer = svgEl('g', { class: 'mz-trail' }); svg.append(layer);
    const startG = svgEl('g', { class: 'mz-place' }); startG.innerHTML = ART[data.start]; place(startG, m.start, 0.9); svg.append(startG);
    const goalG = svgEl('g', { class: 'mz-place mz-goal' }); goalG.innerHTML = ART[data.goal]; place(goalG, m.goal, 0.95); svg.append(goalG);
    const wallG = svgEl('g', { class: 'mz-walls' }); svg.append(wallG);
    walls = new Map();
    for (let c = 0; c < m.n; c++) for (const x of cellsAround(m, c)) if (x > c) {
      const ln = wallLine(c, x);
      if (!open(m, c, x)) { wallG.append(ln); walls.set(`${c}-${x}`, ln); }
    }
    svg.append(svgEl('rect', { x: 0, y: 0, width: m.w * S, height: m.h * S, class: 'mz-border', rx: 3 }));
    wandG = svgEl('g', { class: 'mz-wanderer' }); wandG.innerHTML = ART.monster('munch'); if (L.wanderer) svg.append(wandG);
    tokenG = svgEl('g', { class: 'mz-token' }); tokenG.innerHTML = ART[data.token]; svg.append(tokenG);
    monG = svgEl('g', { class: 'mz-monster' }); monG.innerHTML = ART.monster(L.mood); svg.append(monG);
    place(tokenG, token);
  }
  function wallLine(a, b) {
    const [ax, ay] = xy(m, a), [bx, by] = xy(m, b);
    const ln = svgEl('line', { class: 'mz-wall' });
    if (ay === by) { const x = Math.max(ax, bx) * S; ln.setAttribute('x1', x); ln.setAttribute('x2', x); ln.setAttribute('y1', ay * S); ln.setAttribute('y2', ay * S + S); }
    else { const y = Math.max(ay, by) * S; ln.setAttribute('y1', y); ln.setAttribute('y2', y); ln.setAttribute('x1', ax * S); ln.setAttribute('x2', ax * S + S); }
    return ln;
  }

  function status() {
    if (!m) return;
    const secs = Math.round((Date.now() - t0) / 1000);
    info.textContent = `Moves: ${moves} · Gobbled: ${gobbles}` + (L.every ? ` · Walls shift every ${L.every / 1000} s` : '');
    chal.textContent = L.challenge ? `Challenge: reach ${data.goalName} in ${limit()} moves and ${limitSecs()} seconds. Time: ${secs} s` : '';
  }
  const limit = () => Math.ceil(best * 1.6) + 4;
  const limitSecs = () => Math.max(45, best * 2);

  function move(d) {
    if (busy || won || !m) return;
    const to = stepFrom(m, token, d);
    if (to < 0 || !open(m, token, to)) {
      sfx.bump();
      tokenG.classList.remove('bump'); void tokenG.getBBox(); tokenG.classList.add('bump');
      return;
    }
    const from = token;
    token = to; moves++;
    sfx.step();
    const [x1, y1] = centre(from), [x2, y2] = centre(to);
    layer.append(svgEl('line', { x1, y1, x2, y2, class: 'mz-step' }));
    tokenG.classList.toggle('flip', d === 3 ? true : d === 1 ? false : tokenG.classList.contains('flip'));
    place(tokenG, token);
    if (token === m.goal) return finish();
    if (L.wanderer && token === wand) return gobble();
    if (isDeadEnd(m, token)) return gobble();
    if (degree(m, token) >= 3) lastSafe = token;
    status();
  }

  async function gobble() {
    busy = true; gobbles++;
    status();
    const at = token;
    place(monG, at, 1.1);
    monG.classList.remove('pop'); void monG.getBBox(); monG.classList.add('pop');
    tokenG.classList.add('eaten');
    sfx.gobble();
    ctx.say(L.mood === 'soft' ? MAZE_LINES.gobbleSoft : MAZE_LINES.gobble);
    bubble(wrap, L.mood === 'soft' ? 'Oops! A sleepy monster lives here. Try another way!' : 'GULP! The munching monster lives in dead ends. Try another way!', 'oops');
    await new Promise((r) => timers.push(setTimeout(r, reduced() ? 700 : 1500)));
    if (!wrap.isConnected) return;
    monG.classList.remove('pop');
    token = L.home === 'junction' ? lastSafe : m.start;
    // a shift may have turned the old crossroads into a corner: that is still a safe place to stand
    if (isDeadEnd(m, token)) token = m.start;
    tokenG.classList.remove('eaten');
    place(tokenG, token);
    layer.replaceChildren();
    busy = false;
  }

  // the walls: shimmer first, then swap
  function shiftSoon() {
    if (busy || won || pending) return;
    const swaps = planShift(m, L.swaps, Math.random, { avoid: [token, m.start, m.goal], bias: L.bias, token });
    if (!swaps.length) return;
    pending = swaps;
    const ghosts = [];
    for (const s of swaps) {
      const [a, b] = s.open.slice().sort((x, y) => x - y);
      walls.get(`${a}-${b}`)?.classList.add('shimmer');
      const [c, d] = s.close.slice().sort((x, y) => x - y);
      const g = wallLine(c, d); g.classList.add('ghost'); svg.querySelector('.mz-walls').append(g); ghosts.push([`${c}-${d}`, g]);
    }
    sfx.shimmer();
    timers.push(setTimeout(() => {
      if (!wrap.isConnected) return;
      // the token may have stepped onto a cell the swap touches while the walls shimmered: then skip this shift
      const touched = pending.some((s) => [...s.open, ...s.close].includes(token));
      if (touched || busy || won) {
        svg.querySelectorAll('.shimmer').forEach((x) => x.classList.remove('shimmer'));
        ghosts.forEach(([, g]) => g.remove());
        pending = null; return;
      }
      applyShift(m, pending);
      for (const s of pending) {
        const [a, b] = s.open.slice().sort((x, y) => x - y);
        const w = walls.get(`${a}-${b}`); if (w) { w.classList.add('gone'); setTimeout(() => w.remove(), 400); walls.delete(`${a}-${b}`); }
      }
      for (const [k, g] of ghosts) { g.classList.remove('ghost'); g.classList.add('new'); walls.set(k, g); }
      pending = null;
      if (degree(m, lastSafe) < 3) lastSafe = m.start;
    }, reduced() ? 1200 : 900));
  }

  function stepWanderer() {
    if (busy || won) return;
    const next = wander(m, wand, wandFrom);
    wandFrom = wand; wand = next;
    place(wandG, wand, 0.82);
    if (wand === token) gobble();
  }

  function finish() {
    won = true; busy = true;
    timers.splice(0).forEach(clearInterval);
    svg.querySelectorAll('.shimmer').forEach((x) => x.classList.remove('shimmer'));
    svg.querySelectorAll('.ghost').forEach((x) => x.remove());
    pending = null;
    const secs = Math.round((Date.now() - t0) / 1000);
    const met = L.challenge && moves <= limit() && secs <= limitSecs();
    const stars = gobbles === 0 ? 3 : gobbles <= 2 ? 2 : 1;
    tokenG.classList.add('home');
    ctx.say(MAZE_LINES.won);
    const e = ctx.earn({ kind: 'game', key: `maze:${data.id}:L${ctx.level}`, score: stars * 100 - moves, good: stars >= 2 || met });
    setTimeout(() => {
      if (!wrap.isConnected) return;
      endCard(stage, {
        stars,
        title: `You reached ${data.goalName}!`,
        line: `${moves} moves, gobbled ${gobbles} time${gobbles === 1 ? '' : 's'}.` + (L.challenge ? (met ? ' Challenge met, masha’Allah!' : ` Challenge: ${limit()} moves in ${limitSecs()} s. Try again?`) : ''),
        fact: data.fact, earned: e, again: start,
      });
    }, 500);
  }

  start();
  // for the automated browser test (scripts in the review notes): the state and the move function
  wrap.__game = { get state() { return { m, token, moves, gobbles, won, busy, wand }; }, move, shiftNow: shiftSoon };
  return { stop() { timers.splice(0).forEach((t) => { clearInterval(t); clearTimeout(t); }); window.removeEventListener('keydown', onKey); }, restart: start, get state() { return { m, token, moves, gobbles, won, busy }; } };
}
