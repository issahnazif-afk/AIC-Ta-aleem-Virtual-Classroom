// The maze game: a ladder of stages (mazes.mjs, mazeStages). It opens on the stage map; a student plays any stage that
// is open, and finishing one opens the next. The class level sets where the ladder starts and how far it goes
// (STAGE_OPEN, STAGE_CAP). The maze is made fresh every time (maze-core.mjs) and always has a way through.
// The traveller moves with the arrow keys or WASD, a swipe on the maze, a tap on the next cell, or the big arrow buttons.
// Walking into a dead end wakes the munching monster, who gobbles the traveller up (a cartoon gulp, no teeth).
// What the stages add, one at a time (the first time, a card says what is new):
//   pick-ups (dates, stars) for three stars · walls that shift (with a shimmer first, always keeping one way through)
//   roaming monsters · a key that opens the gate at the goal · fog (a sandstorm, a dark night): only the cells near
//   the traveller can be seen · a pair of tunnels (stand on one end and choose to go through) · a gobble sends you back
//   to the start · hunting monsters · a moves-and-time challenge.
// The stage reached, the stars and the best time are kept in the student's progress (progress.mazes), so they follow
// the student to any device. Each finished stage is passed to ctx.record (the class sheet and the leaderboard).
//   mountMaze(stage, ctx, data)   data: MAZES[id] (mazes.mjs)
import { makeMaze, xy, open, degree, isDeadEnd, stepFrom, planShift, applyShift, cellsAround, distances, spawnCell, monstersStep, clearAround, fullUp, placeItems, placeTunnels, relocate, pathWith, tunnelEnd } from './maze-core.mjs';
import { el, btn, svgEl, sfx, bubble, endCard, reduced, starsText } from './kit.mjs';
import { ART } from './art.mjs';
import { MAZE_LINES } from './lines.mjs';
import { mazeStages, STAGE_COUNT, STAGE_OPEN, STAGE_CAP, STAGE_INTROS } from './mazes.mjs';

const S = 40;   // one cell, in SVG units
let uid = 0;
const INTRO_ART = { gems: null, shift: null, monsters: 'monster', key: 'key', fog: null, tunnels: null, home: 'monster', hunters: 'monster', challenge: 'star' };

export function mountMaze(stage, ctx, data) {
  const STAGES = mazeStages(data.id);
  const lvl = Math.min(4, Math.max(1, ctx.own ?? ctx.level ?? 1));
  const CAP = STAGE_CAP[lvl], FROM = STAGE_OPEN[lvl];
  // the student's own ladder, kept in their progress (it is saved with the rest of their progress)
  const all = (ctx.progress.mazes ??= {});
  const my = (all[data.id] ??= { open: 1, best: {}, seen: [] });
  my.open = Math.max(my.open || 1, FROM); my.best ??= {}; my.seen ??= [];
  const playable = () => Math.min(my.open, CAP);

  const timers = [];
  const clear = () => timers.splice(0).forEach((t) => { clearInterval(t); clearTimeout(t); });
  let onKey = null;
  const keyHandler = (e) => onKey?.(e);
  window.addEventListener('keydown', keyHandler);
  let view = null;      // what is on screen: { kind: 'map' } or the game

  // ── the stage map ──
  function showMap(focusN) {
    clear(); onKey = null; stage.replaceChildren();
    const wrap = el('div', `mz-pick mz-${data.theme}`);
    const head = el('div', 'mz-pick-head');
    head.append(el('h3', 'mz-pick-h', 'Choose a stage'), el('p', 'mz-pick-sub', `${playable()} of ${STAGE_COUNT} stages open. Finish a stage to open the next one.`));
    wrap.append(head);
    const grid = el('ol', 'mz-stones'); grid.setAttribute('aria-label', 'Stages');
    // the stage to play next: the first open one not finished yet (or the last open one)
    const next = STAGES.find((L) => L.n <= playable() && !my.best[L.n])?.n ?? Math.min(playable(), STAGE_COUNT);
    for (const L of STAGES) {
      const li = el('li');
      const b = btn('mz-stone');
      const best = my.best[L.n];
      const locked = L.n > playable();
      b.dataset.stage = L.n;
      b.append(el('span', 'mz-stone-n', String(L.n)));
      if (best) b.append(el('span', 'mz-stone-stars', starsText(best.stars)));
      else if (!locked && L.intro) { const tag = el('span', 'mz-stone-new', 'New'); b.append(tag); }
      if (locked) {
        b.classList.add('locked'); b.disabled = true;
        const why = L.n > CAP ? `opens at Level ${L.n > STAGE_CAP[2] ? 3 : 2}` : 'finish the stage before it';
        b.setAttribute('aria-label', `Stage ${L.n}, locked: ${why}`); b.title = `Locked: ${why}`;
        b.insertAdjacentHTML('beforeend', '<svg class="mz-stone-lock" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>');
      } else {
        if (best) b.classList.add('done');
        if (L.n === next && !best) b.classList.add('next');
        if (L.final) b.classList.add('final');
        b.setAttribute('aria-label', `Stage ${L.n}` + (best ? `, ${best.stars} star${best.stars === 1 ? '' : 's'}, best ${best.secs} seconds` : L.n === next ? ', play next' : ''));
        b.addEventListener('click', () => play(L.n));
      }
      li.append(b); grid.append(li);
    }
    wrap.append(grid);
    const row = el('div', 'gm-row');
    const go = btn('btn btn-primary gm-big', `Play stage ${next}`); go.addEventListener('click', () => play(next)); row.append(go);
    if (ctx.leaderboard) { const lb = btn('btn gm-big mz-lb', 'Leaderboard'); lb.addEventListener('click', () => ctx.leaderboard(data.id)); row.append(lb); }
    wrap.append(row);
    if (CAP < STAGE_COUNT) wrap.append(el('p', 'gm-help', lvl === 1 ? `Stages ${CAP + 1} to ${STAGE_CAP[2]} open from Level 2, and ${STAGE_CAP[2] + 1} to ${STAGE_COUNT} from Level 3.` : `Stages ${CAP + 1} to ${STAGE_COUNT} open from Level 3.`));
    stage.append(wrap);
    view = { kind: 'map' };
    (grid.querySelector(`[data-stage="${focusN ?? next}"]:not(:disabled)`) ?? go).focus({ preventScroll: true });
  }

  // ── one stage ──
  function play(n) {
    clear(); stage.replaceChildren();
    const L = STAGES[n - 1];
    const M = L.monsters;
    let m, token, lastSafe, moves, gobbles, busy, won, t0, pending, best, mons = [], spawning = 0, pauseTo = 0, born = 0;
    let keyCell = -1, hasKey = true, gems = [], gemsAll = 0, tunnels = null, started = false;

    const wrap = el('div', `mz mz-${data.theme} mz-s${n}` + (L.size >= 10 ? ' mz-big' : ''));
    const bar = el('div', 'mz-bar');
    const top = el('div', 'mz-top');
    const back = btn('mz-back', '', 'All stages');
    back.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>Stages';
    back.addEventListener('click', () => showMap(n));
    top.append(back, el('p', 'mz-stage', `Stage ${n} of ${STAGE_COUNT}`));
    const info = el('p', 'mz-info'); info.setAttribute('aria-live', 'polite');
    const chal = el('p', 'mz-chal');
    bar.append(top, info, chal);
    const board = el('div', 'mz-board'); board.tabIndex = 0;
    board.setAttribute('role', 'application');
    board.setAttribute('aria-label', `${data.title}, stage ${n}. Use the arrow keys to move the ${data.token}.`);
    const svg = svgEl('svg', { class: 'mz-svg' });
    board.append(svg);
    const pad = el('div', 'mz-pad');
    for (const [t, name, d] of [['↑', 'Up', 0], ['←', 'Left', 3], ['↓', 'Down', 2], ['→', 'Right', 1]]) {
      const b = btn('mz-arrow mz-' + name.toLowerCase(), t, name);
      b.addEventListener('click', () => move(d));
      pad.append(b);
    }
    const tunnelB = btn('btn mz-tunnel-b', 'Go through the tunnel'); tunnelB.hidden = true;
    tunnelB.addEventListener('click', () => useTunnel());
    const help = el('p', 'mz-help', helpText(L));
    wrap.append(bar, board, tunnelB, pad, help);
    stage.append(wrap);

    // keyboard: arrows and WASD; Space or Enter goes through a tunnel
    const KEYS = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3, w: 0, d: 1, s: 2, a: 3, W: 0, D: 1, S: 2, A: 3 };
    onKey = (e) => {
      if (!wrap.isConnected || e.target.closest?.('input, textarea, select') || stage.querySelector('.gm-end, .mz-intro')) return;
      if ((e.key === ' ' || e.key === 'Enter') && tunnelEnd(tunnels, token) >= 0 && e.target.closest?.('.mz-board, body') && !e.target.closest?.('button')) { e.preventDefault(); useTunnel(); return; }
      const d = KEYS[e.key];
      if (d == null) return;
      e.preventDefault(); move(d);
    };
    // swipe or tap on the board
    let p0 = null;
    board.addEventListener('pointerdown', (e) => { p0 = [e.clientX, e.clientY]; board.focus({ preventScroll: true }); });
    board.addEventListener('pointerup', (e) => {
      if (!p0 || !m) return;
      const dx = e.clientX - p0[0], dy = e.clientY - p0[1]; p0 = null;
      if (Math.hypot(dx, dy) > 24) { move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0)); return; }
      const r = svg.getBoundingClientRect(); const k = r.width / (m.w * S + 8);
      const cx = Math.floor(((e.clientX - r.left) / k - 4) / S), cy = Math.floor(((e.clientY - r.top) / k - 4) / S);
      const [tx, ty] = xy(m, token);
      const ddx = cx - tx, ddy = cy - ty;
      if (!ddx && !ddy) { if (tunnelEnd(tunnels, token) >= 0) useTunnel(); return; }
      move(Math.abs(ddx) >= Math.abs(ddy) ? (ddx > 0 ? 1 : 3) : (ddy > 0 ? 2 : 0));
    });
    board.style.touchAction = 'none';

    let walls = new Map();
    let tokenG, monG, monLayer, layer, itemLayer, lockG, fogHole = null, keyG = null;
    const centre = (c) => { const [x, y] = xy(m, c); return [x * S + S / 2, y * S + S / 2]; };
    const place = (g, c, scale = 0.8) => { const [x, y] = centre(c); g.setAttribute('transform', `translate(${x - 32 * scale * S / 64} ${y - 32 * scale * S / 64}) scale(${scale * S / 64})`); };
    const things = () => [...(tunnels ?? []), ...(hasKey ? [] : [keyCell]), ...gems.map((x) => x.cell)];

    function start() {
      clear();
      stage.querySelectorAll('.gm-end').forEach((x) => x.remove());
      m = makeMaze(L.size, L.size);
      tunnels = L.tunnels ? placeTunnels(m) : null;
      keyCell = L.key ? placeItems(m, 1, Math.random, { taken: tunnels ?? [], min: 4, spread: true })[0] ?? -1 : -1;
      hasKey = keyCell < 0;
      gems = (L.gems ? placeItems(m, L.gems, Math.random, { taken: [...(tunnels ?? []), keyCell], spread: true }) : []).map((cell) => ({ cell }));
      gemsAll = gems.length;
      token = m.start; lastSafe = m.start; moves = 0; gobbles = 0; busy = false; won = false; pending = null; started = false;
      best = keyCell >= 0 ? (pathWith(m, m.start, keyCell, tunnels).length - 1) + (pathWith(m, keyCell, m.goal, tunnels).length - 1) : pathWith(m, m.start, m.goal, tunnels).length - 1;
      draw();
      mons = []; spawning = 0; pauseTo = 0; born = 0;
      status();
      // the first time a stage brings something new, a card says what it is; the clock starts after it
      if (L.intro && !my.seen.includes(L.intro)) showIntro(); else begin();
    }
    function begin() {
      if (started) return;
      started = true; t0 = Date.now();
      if (M) {
        spawnSoon();
        timers.push(setInterval(stepMonsters, M.step));
        timers.push(setInterval(spawnSoon, M.every));
      }
      if (L.every) timers.push(setInterval(shiftSoon, L.every));
      timers.push(setInterval(status, 500));
      status();
      if (n === 1) ctx.say(MAZE_LINES[data.id]);
      board.focus({ preventScroll: true });
    }
    function showIntro() {
      const text = STAGE_INTROS[L.intro](data);
      const card = el('div', 'mz-intro'); card.setAttribute('role', 'dialog'); card.setAttribute('aria-label', 'Something new');
      const art = L.intro === 'gems' ? data.gem : L.intro === 'tunnels' ? data.tunnel : L.intro === 'fog' ? data.token : INTRO_ART[L.intro];
      if (art) card.insertAdjacentHTML('beforeend', `<svg class="mz-intro-art${L.intro === 'hunters' ? ' chaser' : ''}" viewBox="0 0 64 64" width="84" height="84" aria-hidden="true">${typeof ART[art] === 'function' ? ART[art]('munch') : ART[art]}</svg>`);
      card.append(el('p', 'mz-intro-k', `Stage ${n}: something new!`), el('p', 'mz-intro-t', text));
      const go = btn('btn btn-primary gm-big', 'Start');
      go.addEventListener('click', () => { card.remove(); if (!my.seen.includes(L.intro)) { my.seen.push(L.intro); ctx.save?.(); } begin(); });
      card.append(go);
      wrap.append(card);
      ctx.say(text);
      go.focus({ preventScroll: true });
    }

    function draw() {
      svg.replaceChildren();
      const id = 'mz' + (++uid);
      svg.setAttribute('viewBox', `-4 -4 ${m.w * S + 8} ${m.h * S + 8}`);
      svg.append(svgEl('rect', { x: -4, y: -4, width: m.w * S + 8, height: m.h * S + 8, rx: 10, class: 'mz-ground' }));
      layer = svgEl('g', { class: 'mz-trail' }); svg.append(layer);
      const startG = svgEl('g', { class: 'mz-place' }); startG.innerHTML = ART[data.start]; place(startG, m.start, 0.9); svg.append(startG);
      itemLayer = svgEl('g', { class: 'mz-items' }); svg.append(itemLayer);
      if (tunnels) for (const c of tunnels) { const g = svgEl('g', { class: 'mz-tunnel' }); g.innerHTML = ART[data.tunnel]; place(g, c, 0.86); itemLayer.append(g); }
      for (const x of gems) { x.g = svgEl('g', { class: 'mz-gem' }); x.g.innerHTML = ART[data.gem]; place(x.g, x.cell, 0.55); itemLayer.append(x.g); }
      keyG = null;
      if (!hasKey) { keyG = svgEl('g', { class: 'mz-key' }); keyG.innerHTML = ART.key; place(keyG, keyCell, 0.62); itemLayer.append(keyG); }
      const wallG = svgEl('g', { class: 'mz-walls' }); svg.append(wallG);
      walls = new Map();
      for (let c = 0; c < m.n; c++) for (const x of cellsAround(m, c)) if (x > c) {
        const ln = wallLine(c, x);
        if (!open(m, c, x)) { wallG.append(ln); walls.set(`${c}-${x}`, ln); }
      }
      svg.append(svgEl('rect', { x: 0, y: 0, width: m.w * S, height: m.h * S, class: 'mz-border', rx: 3 }));
      monLayer = svgEl('g', { class: 'mz-roamers' }); svg.append(monLayer);
      // fog: everything above is hidden except a soft circle of light around the traveller
      fogHole = null;
      if (L.fog) {
        const defs = svgEl('defs');
        defs.innerHTML = `<radialGradient id="${id}g"><stop offset="0" stop-color="#000"/><stop offset=".62" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient>`
          + `<mask id="${id}m" maskUnits="userSpaceOnUse" x="-4" y="-4" width="${m.w * S + 8}" height="${m.h * S + 8}"><rect x="-4" y="-4" width="${m.w * S + 8}" height="${m.h * S + 8}" fill="#fff"/><circle class="mz-light" r="${L.fog * S}" cx="0" cy="0" fill="url(#${id}g)"/></mask>`;
        svg.append(defs);
        svg.append(svgEl('rect', { x: -4, y: -4, width: m.w * S + 8, height: m.h * S + 8, rx: 10, class: 'mz-fog', mask: `url(#${id}m)` }));
        fogHole = defs.querySelector('.mz-light');
      }
      // the goal can always be seen (its lights shine through the fog), with a lock while the gate is shut
      const goalG = svgEl('g', { class: 'mz-place mz-goal' }); goalG.innerHTML = ART[data.goal]; place(goalG, m.goal, 0.95); svg.append(goalG);
      lockG = null;
      if (!hasKey) { lockG = svgEl('g', { class: 'mz-lock' }); lockG.innerHTML = ART.lock; place(lockG, m.goal, 0.5); svg.append(lockG); }
      tokenG = svgEl('g', { class: 'mz-token' }); tokenG.innerHTML = ART[data.token]; svg.append(tokenG);
      monG = svgEl('g', { class: 'mz-monster' }); monG.innerHTML = ART.monster(L.mood); svg.append(monG);
      placeToken();
    }
    function placeToken() {
      place(tokenG, token);
      if (fogHole) { const [x, y] = centre(token); fogHole.setAttribute('cx', x); fogHole.setAttribute('cy', y); }
      tunnelB.hidden = tunnelEnd(tunnels, token) < 0 || won;
    }
    function wallLine(a, b) {
      const [ax, ay] = xy(m, a), [bx, by] = xy(m, b);
      const ln = svgEl('line', { class: 'mz-wall' });
      if (ay === by) { const x = Math.max(ax, bx) * S; ln.setAttribute('x1', x); ln.setAttribute('x2', x); ln.setAttribute('y1', ay * S); ln.setAttribute('y2', ay * S + S); }
      else { const y = Math.max(ay, by) * S; ln.setAttribute('y1', y); ln.setAttribute('y2', y); ln.setAttribute('x1', ax * S); ln.setAttribute('x2', ax * S + S); }
      return ln;
    }

    const limit = () => Math.ceil(best * 1.6) + 4;
    const limitSecs = () => Math.max(45, best * 2);
    function status() {
      if (!m) return;
      const secs = started ? Math.round((Date.now() - t0) / 1000) : 0;
      const parts = [`Moves: ${moves}`, `Gobbled: ${gobbles}`];
      if (gemsAll) parts.push(`${data.gems[0].toUpperCase() + data.gems.slice(1)}: ${gemsAll - gems.length}/${gemsAll}`);
      if (keyCell >= 0) parts.push(hasKey ? 'Key: found ✓' : 'Key: not yet');
      if (M) parts.push(`Monsters: ${mons.length}`);
      info.textContent = parts.join(' · ');
      chal.textContent = L.challenge ? `Challenge: reach ${data.goalName} in ${limit()} moves and ${limitSecs()} seconds. Time: ${secs} s` : (L.every ? `Walls shift every ${L.every / 1000} s` : '');
    }

    function move(d) {
      if (busy || won || !m || !started) return;
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
      arrive();
    }
    // after a step or a tunnel trip: the goal, a monster, a dead end, then anything to pick up
    function arrive(viaTunnel = false) {
      placeToken();
      if (token === m.goal) {
        if (hasKey) return finish();
        sfx.bump(); bubble(wrap, `The gate is locked. Find the key first!`, 'oops');
      }
      if (mons.some((x) => x.cell === token)) return gobble(true);
      if (!viaTunnel && tunnelEnd(tunnels, token) < 0 && isDeadEnd(m, token)) return gobble();
      if (!hasKey && token === keyCell) {
        hasKey = true; sfx.coin(); keyG?.classList.add('got'); lockG?.classList.add('open');
        setTimeout(() => { keyG?.remove(); lockG?.remove(); }, 600);
        bubble(wrap, `You found the key! Now go to ${data.goalName}.`);
      }
      const gi = gems.findIndex((x) => x.cell === token);
      if (gi >= 0) {
        const [x] = gems.splice(gi, 1); x.g.classList.add('got'); setTimeout(() => x.g.remove(), 500); sfx.sparkle();
        if (!gems.length) bubble(wrap, `All the ${data.gems}, masha’Allah!`);
      }
      if (degree(m, token) >= 3) lastSafe = token;
      status();
    }
    function useTunnel() {
      if (busy || won || !started) return;
      const o = tunnelEnd(tunnels, token);
      if (o < 0) return;
      busy = true; moves++; sfx.slide();
      tokenG.classList.add('tunnel');
      timers.push(setTimeout(() => {
        if (!wrap.isConnected) return;
        token = o; layer.replaceChildren();
        tokenG.classList.remove('tunnel');
        busy = false;
        arrive(true);
      }, reduced() ? 150 : 450));
    }

    async function gobble(roamer = false) {
      if (busy) return;
      busy = true; gobbles++;
      status();
      const at = token;
      for (const x of fullUp(mons, at)) { x.g.classList.add('full'); setTimeout(() => x.g.remove(), 900); }
      place(monG, at, 1.1);
      monG.classList.remove('pop'); void monG.getBBox(); monG.classList.add('pop');
      tokenG.classList.add('eaten');
      sfx.gobble();
      ctx.say(L.mood === 'soft' ? MAZE_LINES.gobbleSoft : roamer ? MAZE_LINES.caught : MAZE_LINES.gobble);
      bubble(wrap, L.mood === 'soft' ? 'Oops! A sleepy monster lives here. Try another way!' : roamer ? 'GULP! A roaming monster caught you. Now it is full and goes home.' : 'GULP! The munching monster lives in dead ends. Try another way!', 'oops');
      await new Promise((r) => timers.push(setTimeout(r, reduced() ? 700 : 1500)));
      if (!wrap.isConnected) return;
      monG.classList.remove('pop');
      token = L.home === 'junction' ? lastSafe : m.start;
      if (isDeadEnd(m, token)) token = m.start;
      tokenG.classList.remove('eaten');
      placeToken();
      layer.replaceChildren();
      if (mons.length) { clearAround(m, mons, token); mons.forEach(drawMon); pauseTo = Date.now() + 2000; }
      busy = false;
    }

    // the walls: shimmer first, then swap (never at the traveller, the start, the goal or a tunnel end)
    function shiftSoon() {
      if (busy || won || pending) return;
      const swaps = planShift(m, L.swaps, Math.random, { avoid: [token, m.start, m.goal, ...(tunnels ?? [])], bias: L.bias, token });
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
        // a key or a pick-up whose cell became a dead end rolls to a safe cell nearby
        if (!hasKey) { const c = relocate(m, keyCell, [...things(), token]); if (c !== keyCell) { keyCell = c; place(keyG, c, 0.62); } }
        for (const x of gems) { const c = relocate(m, x.cell, [...things(), token]); if (c !== x.cell) { x.cell = c; place(x.g, c, 0.55); } }
      }, reduced() ? 1200 : 900));
    }

    // ── roaming monsters ──
    function drawMon(x) { place(x.g, x.cell, 0.82); }
    function stepMonsters() {
      if (busy || won || Date.now() < pauseTo) return;
      const hit = monstersStep(m, mons, token, Math.random, M.slack ?? 0.35);
      mons.forEach(drawMon);
      if (hit) gobble(true);
    }
    function spawnSoon() {
      if (busy || won || mons.length + spawning >= M.max) return;
      let c = spawnCell(m, token, mons.map((x) => x.cell));
      if (c < 0) return;
      spawning++;
      const puff = svgEl('g', { class: 'mz-puff' });
      puff.innerHTML = '<g fill="#EDE6FF" stroke="#8E6CD9" stroke-width="2"><circle cx="22" cy="36" r="13"/><circle cx="42" cy="36" r="13"/><circle cx="32" cy="26" r="14"/></g><g fill="#F6C64B"><circle cx="10" cy="14" r="3"/><circle cx="54" cy="12" r="2.5"/><circle cx="56" cy="50" r="3"/><circle cx="8" cy="52" r="2.5"/></g>';
      place(puff, c, 0.95); monLayer.append(puff);
      sfx.pop();
      timers.push(setTimeout(() => {
        puff.remove(); spawning--;
        if (!wrap.isConnected || won) return;
        if (distances(m, token)[c] < 3 || mons.some((x) => x.cell === c)) c = spawnCell(m, token, mons.map((x) => x.cell));
        if (c < 0) return;
        const chase = !!M.chase?.includes(born);
        born++;
        const g = svgEl('g', { class: 'mz-roamer' + (chase ? ' chaser' : '') });
        g.innerHTML = ART.monster('munch');
        const x = { cell: c, from: -1, chase, g };
        monLayer.append(g); drawMon(x);
        g.classList.add('born');
        mons.push(x);
        status();
      }, 1200));
    }

    function finish() {
      won = true; busy = true;
      clear();
      svg.querySelectorAll('.shimmer').forEach((x) => x.classList.remove('shimmer'));
      svg.querySelectorAll('.ghost').forEach((x) => x.remove());
      pending = null; tunnelB.hidden = true;
      const secs = Math.max(1, Math.round((Date.now() - t0) / 1000));
      const met = !L.challenge || (moves <= limit() && secs <= limitSecs());
      let stars = gobbles === 0 ? 3 : gobbles <= 2 ? 2 : 1;
      if (gems.length || !met) stars = Math.min(stars, 2);
      tokenG.classList.add('home');
      ctx.say(MAZE_LINES.won);
      // the student's ladder: best stars and time for this stage, and the next stage opens
      const was = my.best[n];
      my.best[n] = { stars: Math.max(stars, was?.stars ?? 0), secs: Math.min(secs, was?.secs ?? Infinity), moves: Math.min(moves, was?.moves ?? Infinity) };
      const opened = n + 1 <= STAGE_COUNT && my.open < n + 1;
      my.open = Math.max(my.open, Math.min(STAGE_COUNT, n + 1));
      const e = ctx.earn({ kind: 'game', key: `maze:${data.id}:S${n}`, score: stars * 100 - moves, good: stars >= 2 });
      ctx.record?.({ maze: data.id, stage: n, secs, moves, gobbles, stars });
      setTimeout(() => {
        if (!wrap.isConnected) return;
        const nextOk = n + 1 <= CAP;
        const more = [];
        if (nextOk) more.push({ text: `Next: stage ${n + 1}`, onClick: () => play(n + 1) });
        more.push({ text: 'All stages', onClick: () => showMap(n) });
        if (ctx.leaderboard) more.push({ text: 'Leaderboard', onClick: () => ctx.leaderboard(data.id) });
        let line = `${moves} moves in ${secs} s, gobbled ${gobbles} time${gobbles === 1 ? '' : 's'}.`;
        if (gemsAll) line += ` ${data.gems[0].toUpperCase() + data.gems.slice(1)}: ${gemsAll - gems.length} of ${gemsAll}.`;
        if (L.challenge) line += met ? ' Challenge met, masha’Allah!' : ` Challenge: ${limit()} moves in ${limitSecs()} s.`;
        if (opened && nextOk) line += ` Stage ${n + 1} is open!`;
        if (!nextOk && n < STAGE_COUNT) line += ` The next stages open from Level ${lvl === 1 ? 2 : 3}.`;
        if (n === STAGE_COUNT) line += ' You finished every stage!';
        const card = endCard(stage, {
          stars,
          title: L.final ? `You finished the whole journey to ${data.goalName}!` : `Stage ${n}: you reached ${data.goalName}!`,
          line, fact: n === 1 || n % 5 === 0 || L.final ? data.fact : null, again: start, more,
        });
        // the next stage is the main button when there is one
        const nb = [...card.querySelectorAll('button')].find((b) => b.textContent.startsWith('Next'));
        if (nb) { card.querySelector('.btn-primary')?.classList.remove('btn-primary'); nb.classList.add('btn-primary'); nb.parentElement.prepend(nb); nb.focus({ preventScroll: true }); }
      }, 500);
    }

    start();
    view = { kind: 'stage', n, wrap };
    // for the automated browser test: the state and the moves
    wrap.__game = {
      get state() { return { n, m, token, moves, gobbles, won, busy, started, hasKey, keyCell, gems: gems.map((x) => x.cell), tunnels, mons: mons.map((x) => ({ cell: x.cell, chase: x.chase })) }; },
      move, useTunnel, begin, shiftNow: shiftSoon, spawnNow: () => M && spawnSoon(),
    };
  }

  function helpText(L) {
    const bits = ['Arrows, keys or swipe.'];
    if (L.mood === 'soft') bits.push('Dead ends hide a sleepy monster!'); else bits.push('Keep away from dead ends.');
    if (L.every) bits.push(`A wall moves every ${L.every / 1000} s.`);
    if (L.key) bits.push('Find the key to open the gate.');
    if (L.tunnels) bits.push('Stand on a tunnel and press Space (or the tunnel button) to go through.');
    if (L.monsters?.chase) bits.push('Orange monsters hunt you.');
    if (L.home === 'start') bits.push('A gobble sends you back to the start.');
    return bits.join(' ');
  }

  showMap();
  stage.__maze = { play, showMap, get view() { return view; }, my };
  return {
    stop() { clear(); window.removeEventListener('keydown', keyHandler); },
    restart: () => showMap(),
  };
}
