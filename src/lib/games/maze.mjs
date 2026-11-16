// The Dhikr Maze (docs/games-plan.md, Game 1): the screen. The rules live in maze-world.mjs (the same code the
// simulated player in scripts/games/check.mjs plays), the stages in mazes.mjs.
//
// It opens on the stage map: four level tracks of ten stages. A student's own level is their ranked track; any other
// track is practice. The traveller moves with the arrow keys or WASD, a swipe, a tap on the next cell, or the big
// arrow buttons. Every stage starts with Bismillah, said aloud. The dhikr powers (the bar under the maze, or Q for the
// shield and E for the one shown) are said aloud too and heard on the device (dhikr.mjs); in practice mode (no
// microphone, or chosen) the child says the phrase and taps. Practice runs are never on the leaderboard.
// Dhikr never earns points: points come from stars and speed only (mazes.mjs).
// The stage reached, the stars, the best time and the points are kept in the student's progress (progress.mazes), so
// they follow the student to any device. Each finished stage is passed to ctx.record (the class sheet and the boards).
//   mountMaze(stage, ctx, data)   data: MAZES[id] (mazes.mjs)
import { xy, open, cellsAround, tunnelEnd } from './maze-core.mjs';
import { createWorld } from './maze-world.mjs';
import { el, btn, arEl, svgEl, sfx, bubble, endCard, reduced, starsText, store, srcOf } from './kit.mjs';
import { ART } from './art.mjs';
import { MAZE_LINES } from './lines.mjs';
import { mazeTrack, TRACK_LEN, LEVELS, STAGE_INTROS, migrate, trackOf, speedBonus } from './mazes.mjs';
import { DHIKR, canListen, warmListening, listenFor } from './dhikr.mjs';

const S = 40;   // one cell, in SVG units
const BUMP_SHOW = 1500;
let uid = 0;
const POWER = {
  shield: 'Shield', hasbuna: 'Long shield', up: 'Go up the stairs', down: 'Go down the stairs', calm: 'Calm the storm',
  treasure: 'Open the treasure door', speed: 'Glide fast', light: 'Walk lightly',
};
const INTRO_ART = { naps: ['grumbly', 'snooze'], shield: ['grumbly', 'grumble'], two: ['grumbly', 'grumble'], hunters: ['grumbly', 'huff'], fib: ['grumbly', 'fib'], key: ['key'], storms: ['storm'], stairs: ['stairsUp'], floors3: ['stairsUp'], treasure: ['door'], challenge: ['star'], hasbuna: ['star'] };
const artOf = (k, ...a) => (typeof ART[k] === 'function' ? ART[k](...a) : ART[k]);
const kindOf = (L) => (L.level >= 3 ? 'huff' : 'grumble');

export function mountMaze(stage, ctx, data) {
  const own = Math.min(4, Math.max(1, ctx.own ?? ctx.level ?? 1));
  // the student's own tracks, kept in their progress (saved with the rest of it); the old 15-stage ladder is moved over
  const all = (ctx.progress.mazes ??= {});
  const was = all[data.id];
  const my = (all[data.id] = migrate(was, own));
  if (my !== was) ctx.save?.();
  my.seen ??= [];
  let track = store.get(`mz-track-${data.id}`, own);
  if (!LEVELS.includes(track)) track = own;
  let mode = store.get('mz-mode', 'voice');
  let micOk = null;
  canListen().then((x) => { micOk = x; if (x && mode === 'voice') warmListening(); paintMode?.(); });

  const timers = [];
  const clear = () => timers.splice(0).forEach((t) => { clearInterval(t); clearTimeout(t); });
  let onKey = null, listening = null, paintMode = null;
  const keyHandler = (e) => onKey?.(e);
  window.addEventListener('keydown', keyHandler);
  let view = null;
  const T = () => trackOf(my, track, own);
  const practiceNow = () => mode === 'practice' || micOk === false;

  // ── the stage map ──
  function showMap(focusN) {
    clear(); stopListening(); onKey = null; stage.replaceChildren();
    const t = T();
    const wrap = el('div', `mz-pick mz-${data.theme}`);
    const head = el('div', 'mz-pick-head');
    head.append(el('h3', 'mz-pick-h', 'Choose a stage'), el('p', 'mz-pick-sub', `Level ${track} track: ${Math.min(t.open, TRACK_LEN)} of ${TRACK_LEN} stages open. Finish a stage to open the next one.`));
    wrap.append(head);
    // the four tracks
    const chips = el('div', 'gm-levels mz-tracks'); chips.setAttribute('role', 'radiogroup'); chips.setAttribute('aria-label', 'Level track');
    for (const n of LEVELS) {
      const c = btn('gm-chip mz-track'); c.setAttribute('role', 'radio'); c.setAttribute('aria-checked', String(n === track)); c.dataset.level = n;
      c.textContent = `Level ${n}`;
      if (n === own) c.append(el('span', 'mz-yours', 'yours'));
      c.addEventListener('click', () => { track = n; store.set(`mz-track-${data.id}`, n); showMap(); stage.querySelector(`.mz-track[data-level="${n}"]`)?.focus(); });
      chips.append(c);
    }
    wrap.append(chips);
    wrap.append(el('p', 'mz-rank-note', track === own ? 'Your own level: your stages count on the leaderboard (with the microphone).' : `Practice: the Level ${track} track does not count on the leaderboard.`));
    // speak or practise
    const modes = el('div', 'gm-levels mz-modes'); modes.setAttribute('role', 'radiogroup'); modes.setAttribute('aria-label', 'How you say the dhikr');
    const note = el('p', 'mz-mode-note');
    const mk = (id, text) => {
      const c = btn('gm-chip mz-mode', text); c.setAttribute('role', 'radio'); c.dataset.mode = id;
      c.addEventListener('click', () => { if (c.disabled) return; mode = id; store.set('mz-mode', id); if (id === 'voice') warmListening(); paintMode(); });
      modes.append(c); return c;
    };
    const cv = mk('voice', 'Speak (microphone)'), cp = mk('practice', 'Practice (tap)');
    paintMode = () => {
      if (!cv.isConnected) return;
      cv.disabled = micOk === false;
      cv.setAttribute('aria-checked', String(!practiceNow())); cp.setAttribute('aria-checked', String(practiceNow()));
      note.textContent = micOk === false ? 'This device cannot listen, so the game is in practice mode: say each dhikr aloud, then tap. Practice is not on the leaderboard.'
        : practiceNow() ? 'Practice: say each dhikr aloud, then tap. Practice is not on the leaderboard.'
          : 'Say each dhikr aloud. The listening happens on this device: your voice is never sent anywhere.';
    };
    wrap.append(modes, note);
    paintMode();
    // the ten stones
    const grid = el('ol', 'mz-stones'); grid.setAttribute('aria-label', 'Stages');
    const stages = mazeTrack(data.id, track);
    const next = stages.find((L) => L.n <= t.open && !t.best[L.n])?.n ?? Math.min(t.open, TRACK_LEN);
    for (const L of stages) {
      const li = el('li');
      const b = btn('mz-stone');
      const best = t.best[L.n];
      const locked = L.n > t.open;
      b.dataset.stage = L.n;
      b.append(el('span', 'mz-stone-n', String(L.n)));
      if (best) b.append(el('span', 'mz-stone-stars', starsText(best.stars)));
      else if (!locked && L.intro && !my.seen.includes(L.intro)) b.append(el('span', 'mz-stone-new', 'New'));
      if (locked) {
        b.classList.add('locked'); b.disabled = true;
        b.setAttribute('aria-label', `Stage ${L.n}, locked: finish the stage before it`); b.title = 'Locked: finish the stage before it';
        b.insertAdjacentHTML('beforeend', '<svg class="mz-stone-lock" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>');
      } else {
        if (best) b.classList.add('done');
        if (L.n === next && !best) b.classList.add('next');
        if (L.final) b.classList.add('final');
        b.setAttribute('aria-label', `Stage ${L.n}` + (best ? `, ${best.stars} star${best.stars === 1 ? '' : 's'}${best.points ? `, ${best.points} points` : ''}` : L.n === next ? ', play next' : ''));
        b.addEventListener('click', () => play(L.n));
      }
      li.append(b); grid.append(li);
    }
    wrap.append(grid);
    const row = el('div', 'gm-row');
    const go = btn('btn btn-primary gm-big', `Play stage ${next}`); go.addEventListener('click', () => play(next)); row.append(go);
    if (ctx.leaderboard) { const lb = btn('btn gm-big mz-lb', 'Leaderboard'); lb.addEventListener('click', () => ctx.leaderboard(data.id, { track, stage: next })); row.append(lb); }
    wrap.append(row);
    stage.append(wrap);
    view = { kind: 'map' };
    (focusN != null ? grid.querySelector(`[data-stage="${focusN}"]:not(:disabled)`) : null)?.focus({ preventScroll: true });
  }

  function stopListening() { try { listening?.stop(); } catch {} listening = null; }

  // ── one stage ──
  function play(n) {
    clear(); stopListening(); stage.replaceChildren();
    const L = mazeTrack(data.id, track)[n - 1];
    let W = null, t0 = 0, practice = practiceNow(), ranked = track === own && !practice, shown = -1, frozenTo = 0;

    const wrap = el('div', `mz mz-${data.theme} mz-l${track} mz-s${n}` + (L.size >= 10 ? ' mz-big' : ''));
    const bar = el('div', 'mz-bar');
    const top = el('div', 'mz-top');
    const back = btn('mz-back', '', 'All stages');
    back.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>Stages';
    back.addEventListener('click', () => showMap(n));
    const floorTag = el('p', 'mz-floor');
    top.append(back, el('p', 'mz-stage', `Level ${track} · Stage ${n} of ${TRACK_LEN}`), floorTag);
    const info = el('p', 'mz-info'); info.setAttribute('aria-live', 'polite');
    const chal = el('p', 'mz-chal');
    bar.append(top, info, chal);
    const board = el('div', 'mz-board'); board.tabIndex = 0;
    board.setAttribute('role', 'application');
    board.setAttribute('aria-label', `${data.title}, Level ${track} stage ${n}. Use the arrow keys to move the ${data.token}.`);
    const svg = svgEl('svg', { class: 'mz-svg' });
    board.append(svg);
    const powers = el('div', 'mz-powers'); powers.setAttribute('aria-label', 'Dhikr powers');
    const pad = el('div', 'mz-pad');
    for (const [tx, name, d] of [['↑', 'Up', 0], ['←', 'Left', 3], ['↓', 'Down', 2], ['→', 'Right', 1]]) {
      const b = btn('mz-arrow mz-' + name.toLowerCase(), tx, name);
      b.addEventListener('click', () => move(d));
      pad.append(b);
    }
    const tunnelB = btn('btn mz-tunnel-b', 'Go through the tunnel'); tunnelB.hidden = true;
    tunnelB.addEventListener('click', () => useTunnel());
    const help = el('p', 'mz-help', helpText(L));
    wrap.append(bar, board, powers, tunnelB, pad, help);
    stage.append(wrap);

    // keyboard: arrows and WASD; Space or Enter goes through a tunnel; Q the shield, E the other dhikr shown
    const KEYS = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3, w: 0, d: 1, s: 2, a: 3, W: 0, D: 1, S: 2, A: 3 };
    onKey = (e) => {
      if (!wrap.isConnected || e.target.closest?.('input, textarea, select') || stage.querySelector('.gm-end, .mz-intro, .mz-gate')) return;
      if (!W?.started) return;
      if ((e.key === ' ' || e.key === 'Enter') && tunnelEnd(W.fl.tunnels, W.token) >= 0 && !e.target.closest?.('button')) { e.preventDefault(); useTunnel(); return; }
      if (e.key === 'q' || e.key === 'Q') { const p = W.powers().find((x) => (x.id === 'shield' || x.id === 'hasbuna') && x.ready); if (p) { e.preventDefault(); sayPower(p); } return; }
      if (e.key === 'e' || e.key === 'E') { const p = W.powers().find((x) => !x.always && x.id !== 'hasbuna'); if (p) { e.preventDefault(); sayPower(p); } return; }
      const d = KEYS[e.key];
      if (d == null) return;
      e.preventDefault(); move(d);
    };
    // swipe or tap on the board
    let p0 = null;
    board.addEventListener('pointerdown', (e) => { p0 = [e.clientX, e.clientY]; board.focus({ preventScroll: true }); });
    board.addEventListener('pointerup', (e) => {
      if (!p0 || !W) return;
      const dx = e.clientX - p0[0], dy = e.clientY - p0[1]; p0 = null;
      if (Math.hypot(dx, dy) > 24) { move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0)); return; }
      const m = W.m, r = svg.getBoundingClientRect(), k = r.width / (m.w * S + 8);
      const cx = Math.floor(((e.clientX - r.left) / k - 4) / S), cy = Math.floor(((e.clientY - r.top) / k - 4) / S);
      const [tx, ty] = xy(m, W.token);
      const ddx = cx - tx, ddy = cy - ty;
      if (!ddx && !ddy) { if (tunnelEnd(W.fl.tunnels, W.token) >= 0) useTunnel(); return; }
      move(Math.abs(ddx) >= Math.abs(ddy) ? (ddx > 0 ? 1 : 3) : (ddy > 0 ? 2 : 0));
    });
    board.style.touchAction = 'none';

    // ── drawing ──
    let walls = new Map(), tokenG, ring, monLayer, layer, itemLayer, fogHole = null, popG, lockG = null, mons = new Map();
    const k2 = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
    const centre = (c) => { const [x, y] = xy(W.m, c); return [x * S + S / 2, y * S + S / 2]; };
    const place = (g, c, scale = 0.8) => { const [x, y] = centre(c); g.setAttribute('transform', `translate(${x - 32 * scale * S / 64} ${y - 32 * scale * S / 64}) scale(${scale * S / 64})`); };
    const artG = (cls, html, c, scale) => { const g = svgEl('g', { class: cls }); g.innerHTML = html; place(g, c, scale); return g; };

    function draw() {
      const m = W.m, x = W.fl, top = W.f === W.F - 1;
      svg.replaceChildren(); mons = new Map();
      const id = 'mz' + (++uid);
      svg.setAttribute('viewBox', `-4 -4 ${m.w * S + 8} ${m.h * S + 8}`);
      svg.append(svgEl('rect', { x: -4, y: -4, width: m.w * S + 8, height: m.h * S + 8, rx: 10, class: 'mz-ground' + (W.f ? ` mz-f${W.f}` : '') }));
      layer = svgEl('g', { class: 'mz-trail' }); svg.append(layer);
      if (W.f === 0) svg.append(artG('mz-place', ART[data.start], m.start, 0.9));
      itemLayer = svgEl('g', { class: 'mz-items' }); svg.append(itemLayer);
      drawItems();
      const wallG = svgEl('g', { class: 'mz-walls' }); svg.append(wallG);
      walls = new Map();
      for (let c = 0; c < m.n; c++) for (const y of cellsAround(m, c)) if (y > c && !open(m, c, y)) { const ln = wallLine(c, y); wallG.append(ln); walls.set(k2(c, y), ln); }
      svg.append(svgEl('rect', { x: 0, y: 0, width: m.w * S, height: m.h * S, class: 'mz-border', rx: 3 }));
      // the treasure doors sit in their walls, above them
      for (const d of x.doors) {
        const [ax, ay] = centre(d.a), [bx, by] = centre(d.b);
        const g = svgEl('g', { class: 'mz-door' + (d.open ? ' open' : '') }); g.innerHTML = d.open ? ART.doorOpen : ART.door;
        const sc = 0.62 * S / 64; g.setAttribute('transform', `translate(${(ax + bx) / 2 - 32 * sc} ${(ay + by) / 2 - 32 * sc}) scale(${sc})`);
        g.dataset.a = d.a; svg.append(g);
      }
      monLayer = svgEl('g', { class: 'mz-roamers' }); svg.append(monLayer);
      for (const y of x.mons) addMon(y, false);
      fogHole = null;
      if (L.fog) {
        const defs = svgEl('defs');
        defs.innerHTML = `<radialGradient id="${id}g"><stop offset="0" stop-color="#000"/><stop offset=".62" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient>`
          + `<mask id="${id}m" maskUnits="userSpaceOnUse" x="-4" y="-4" width="${m.w * S + 8}" height="${m.h * S + 8}"><rect x="-4" y="-4" width="${m.w * S + 8}" height="${m.h * S + 8}" fill="#fff"/><circle class="mz-light" r="${L.fog * S}" cx="0" cy="0" fill="url(#${id}g)"/></mask>`;
        svg.append(defs);
        svg.append(svgEl('rect', { x: -4, y: -4, width: m.w * S + 8, height: m.h * S + 8, rx: 10, class: 'mz-fog', mask: `url(#${id}m)` }));
        fogHole = defs.querySelector('.mz-light');
      }
      // the goal (on the top floor) can always be seen, with a lock while the gate is shut
      lockG = null;
      if (top) {
        svg.append(artG('mz-place mz-goal', ART[data.goal], m.goal, 0.95));
        if (!W.hasKey) { lockG = artG('mz-lock', ART.lock, m.goal, 0.5); svg.append(lockG); }
      }
      ring = svgEl('circle', { class: 'mz-shield', r: S * 0.62, cx: 0, cy: 0 }); svg.append(ring);
      tokenG = svgEl('g', { class: 'mz-token' }); tokenG.innerHTML = ART[data.token]; svg.append(tokenG);
      popG = svgEl('g', { class: 'mz-monster' }); svg.append(popG);
      floorTag.textContent = W.F > 1 ? `Floor ${W.f + 1} of ${W.F}` : '';
      placeToken();
    }
    function drawItems() {
      const x = W.fl;
      itemLayer.replaceChildren();
      if (x.tunnels) for (const c of x.tunnels) itemLayer.append(artG('mz-tunnel', ART[data.tunnel], c, 0.86));
      if (x.up >= 0) itemLayer.append(artG('mz-stairs up', ART.stairsUp, x.up, 0.8));
      if (x.down >= 0 && W.f > 0) itemLayer.append(artG('mz-stairs down', ART.stairsDown, x.down, 0.8));
      for (const c of x.storms) itemLayer.append(artG('mz-storm', ART.storm, c, 0.92));
      for (const c of x.gems) itemLayer.append(artG('mz-gem', ART[data.gem], c, 0.55));
      if (!W.hasKey && W.key.f === W.f) itemLayer.append(artG('mz-key', ART.key, W.key.c, 0.62));
    }
    function wallLine(a, b) {
      const [ax, ay] = xy(W.m, a), [bx, by] = xy(W.m, b);
      const ln = svgEl('line', { class: 'mz-wall' });
      if (ay === by) { const x = Math.max(ax, bx) * S; ln.setAttribute('x1', x); ln.setAttribute('x2', x); ln.setAttribute('y1', ay * S); ln.setAttribute('y2', ay * S + S); }
      else { const y = Math.max(ay, by) * S; ln.setAttribute('y1', y); ln.setAttribute('y2', y); ln.setAttribute('x1', ax * S); ln.setAttribute('x2', ax * S + S); }
      return ln;
    }
    function addMon(y, born) {
      const g = svgEl('g', { class: 'mz-roamer' + (y.chase ? ' chaser' : '') + (y.fast ? ' fast' : '') + (born ? ' born' : '') });
      g.innerHTML = ART.grumbly(y.kind);
      place(g, y.cell, 0.82); monLayer.append(g); mons.set(y.id, g);
    }
    function placeToken(c = W.token) {
      shown = c;
      place(tokenG, c);
      const [x, y] = centre(c);
      ring.setAttribute('cx', x); ring.setAttribute('cy', y);
      if (fogHole) { fogHole.setAttribute('cx', x); fogHole.setAttribute('cy', y); }
      tunnelB.hidden = !W.started || tunnelEnd(W.fl.tunnels, W.token) < 0 || W.won;
    }

    // ── the start: an intro card the first time something is new, then Bismillah ──
    function start() {
      clear(); stopListening();
      stage.querySelectorAll('.gm-end').forEach((x) => x.remove());
      wrap.querySelectorAll('.mz-intro, .mz-gate').forEach((x) => x.remove());
      W = createWorld(L);
      frozenTo = 0;
      draw(); status(); paintPowers(true);
      if (L.intro && !my.seen.includes(L.intro)) showIntro(); else gate();
    }
    function dhikrCard(id) {
      const d = DHIKR[id], src = srcOf(d);
      const c = el('div', 'mz-dhikr');
      c.append(arEl('p', 'mz-dhikr-ar', d.ar), el('p', 'mz-dhikr-tr', d.tr), el('p', 'mz-dhikr-en', d.en));
      const s = el('p', 'mz-dhikr-src');
      const a = el('a', null, src.text); a.href = src.url; a.target = '_blank'; a.rel = 'noopener';
      s.append('Taught in ', a);
      c.append(s);
      return c;
    }
    function showIntro() {
      const I = STAGE_INTROS[L.intro], text = I.text(data);
      const card = el('div', 'mz-intro'); card.setAttribute('role', 'dialog'); card.setAttribute('aria-label', 'Something new');
      const art = L.intro === 'gems' || L.intro === 'speed' || L.intro === 'light' ? [data.gem] : L.intro === 'tunnels' ? [data.tunnel] : L.intro === 'fog' || L.intro === 'bismillah' ? [data.token] : INTRO_ART[L.intro];
      if (art) card.insertAdjacentHTML('beforeend', `<svg class="mz-intro-art" viewBox="0 0 64 64" width="84" height="84" aria-hidden="true">${artOf(...art)}</svg>`);
      card.append(el('p', 'mz-intro-k', `Stage ${n}: something new!`), el('p', 'mz-intro-t', text));
      if (I.say) card.append(dhikrCard(I.say));
      const go = btn('btn btn-primary gm-big', 'Start');
      go.addEventListener('click', () => { card.remove(); if (!my.seen.includes(L.intro)) { my.seen.push(L.intro); ctx.save?.(); } gate(); });
      card.append(go);
      wrap.append(card);
      ctx.say(text);
      go.focus({ preventScroll: true });
    }
    // Bismillah, said aloud (or said and tapped in practice): then the clock starts
    function gate() {
      const g = el('div', 'mz-gate'); g.setAttribute('role', 'dialog'); g.setAttribute('aria-label', 'Say Bismillah to set off');
      g.append(el('p', 'mz-intro-k', 'Bismillah'), dhikrCard('bismillah'));
      const msg = el('p', 'mz-gate-msg'); msg.setAttribute('aria-live', 'polite');
      const row = el('div', 'gm-row');
      const say = btn('btn btn-primary gm-big', practice ? 'I said Bismillah' : 'Say Bismillah');
      say.addEventListener('click', async () => {
        if (practice) return setOff();
        if (listening) return;
        say.disabled = true; msg.textContent = 'Getting ready to listen…';
        listening = listenFor('bismillah', { onState: (s) => { if (s === 'listening') msg.textContent = 'Listening… say Bismillah now.'; } });
        const r = await listening.finished; listening = null;
        if (!g.isConnected) return;
        say.disabled = false;
        if (r === 'ok') return setOff();
        if (r === 'no' || r === 'stopped') { msg.textContent = 'I did not hear all of it. Try again, slowly and clearly.'; sfx.wrong(); return; }
        msg.textContent = r === 'denied' ? 'The microphone is switched off for this site. You can play in practice mode.' : 'This device cannot listen right now. You can play in practice mode.';
        if (!row.querySelector('.mz-to-practice')) {
          const p = btn('btn gm-big mz-to-practice', 'Play in practice mode');
          p.addEventListener('click', () => { practice = true; ranked = false; say.textContent = 'I said Bismillah'; p.remove(); msg.textContent = 'Practice: say Bismillah aloud, then tap.'; say.focus(); });
          row.append(p);
        }
      });
      row.append(say);
      g.append(msg, row);
      if (practice) msg.textContent = 'Practice: say Bismillah aloud, then tap.';
      wrap.append(g);
      say.focus({ preventScroll: true });
      function setOff() {
        g.remove(); sfx.right();
        W.begin(); t0 = performance.now();
        timers.push(setInterval(frame, 50));
        if (n === 1) ctx.say(MAZE_LINES[data.id]);
        status(); paintPowers(true);
        board.focus({ preventScroll: true });
      }
    }

    // ── the game clock: the world moves on, and the screen follows what happened ──
    let lastStatus = 0;
    function frame() {
      if (!wrap.isConnected || !W || W.won) return;
      const now = performance.now() - t0;
      W.tick(now);
      events();
      if (now - lastStatus > 400) { lastStatus = now; status(); }
      paintPowers();
      ring.classList.toggle('on', W.active('shield'));
      tokenG.classList.toggle('light', W.active('light'));
      tokenG.classList.toggle('fast', W.active('speed'));
    }
    function events() {
      const evs = W.events.splice(0);
      for (const e of evs) {
        switch (e.type) {
          case 'step': {
            const [x1, y1] = centre(e.from), [x2, y2] = centre(e.to);
            layer.append(svgEl('line', { x1, y1, x2, y2, class: 'mz-step' }));
            const [ax] = xy(W.m, e.from), [bx] = xy(W.m, e.to);
            if (bx !== ax) tokenG.classList.toggle('flip', bx < ax);
            if (!e.glide) sfx.step();
            if (Date.now() >= frozenTo) placeToken(e.to);
            break;
          }
          case 'wall': sfx.bump(); tokenG.classList.remove('bump'); void tokenG.getBBox(); tokenG.classList.add('bump'); break;
          case 'door-shut': sfx.bump(); bubble(wrap, 'The treasure door is shut. Stand next to it and say La hawla wa la quwwata illa billah.', 'oops'); break;
          case 'storm-block': sfx.bump(); bubble(wrap, "A Huff storm is in the way. Say A'udhu billah to calm it.", 'oops'); break;
          case 'dead-end': sfx.bump(); bubble(wrap, 'A dead end! Go back and try another way.'); ctx.say(MAZE_LINES.deadEnd); break;
          case 'locked': sfx.bump(); bubble(wrap, 'The gate is locked. Find the key first!', 'oops'); break;
          case 'tunnel':
            sfx.slide(); tokenG.classList.add('tunnel'); layer.replaceChildren();
            timers.push(setTimeout(() => { tokenG.classList.remove('tunnel'); placeToken(); }, reduced() ? 150 : 450));
            break;
          case 'key': sfx.coin(); drawItems(); lockG?.classList.add('open'); setTimeout(() => lockG?.remove(), 600); bubble(wrap, `You found the key! Now go to ${data.goalName}.`); break;
          case 'gem': {
            sfx.sparkle();
            const g = artG('mz-gem got', ART[data.gem], e.c, 0.55); itemLayer.append(g); setTimeout(() => g.remove(), 500);
            drawItems();
            if (W.powers().some((p) => p.id === 'speed' || p.id === 'light')) bubble(wrap, 'Say Alhamdulillah!');
            else if (!e.left) bubble(wrap, `All the ${data.gems}, masha’Allah!`);
            break;
          }
          case 'bump': {
            sfx.gobble(); frozenTo = Date.now() + (reduced() ? 700 : BUMP_SHOW);
            for (const id of e.gone) { const g = mons.get(id); if (g) { g.classList.add('full'); setTimeout(() => g.remove(), 900); mons.delete(id); } }
            placeToken(e.at);
            popG.innerHTML = ART.grumbly(e.kind === 'nap' ? 'snooze' : kindOf(L)); place(popG, e.at, 1.05);
            popG.classList.remove('pop'); void popG.getBBox(); popG.classList.add('pop');
            tokenG.classList.add('bumped');
            ctx.say(e.kind === 'nap' ? MAZE_LINES.nap : MAZE_LINES.caught);
            bubble(wrap, e.kind === 'nap' ? 'Bump! A sleepy Grumbly naps in that dead end. Try another way!' : 'Bump! A Grumbly bumped into you. Off it goes home.', 'oops');
            timers.push(setTimeout(() => { if (!wrap.isConnected) return; popG.classList.remove('pop'); tokenG.classList.remove('bumped'); layer.replaceChildren(); placeToken(); for (const y of W.fl.mons) { const g = mons.get(y.id); if (g) place(g, y.cell, 0.82); } }, reduced() ? 700 : BUMP_SHOW));
            status();
            break;
          }
          case 'blocked': if (e.by === 'shield') { sfx.snap(); ring.classList.remove('hit'); void ring.getBBox(); ring.classList.add('hit'); } for (const y of W.fl.mons) { const g = mons.get(y.id); if (g) place(g, y.cell, 0.82); } break;
          case 'shimmer':
            for (const s of e.swaps) {
              walls.get(k2(...s.open))?.classList.add('shimmer');
              const g = wallLine(...s.close); g.classList.add('ghost'); g.dataset.k = k2(...s.close); svg.querySelector('.mz-walls').append(g);
            }
            sfx.shimmer();
            break;
          case 'shift':
            for (const s of e.swaps) { const k = k2(...s.open), w = walls.get(k); if (w) { w.classList.add('gone'); setTimeout(() => w.remove(), 400); walls.delete(k); } }
            for (const g of svg.querySelectorAll('.mz-wall.ghost')) { g.classList.remove('ghost'); g.classList.add('new'); walls.set(g.dataset.k, g); }
            drawItems();
            break;
          case 'shift-off': svg.querySelectorAll('.shimmer').forEach((x) => x.classList.remove('shimmer')); svg.querySelectorAll('.mz-wall.ghost').forEach((x) => x.remove()); break;
          case 'puff': { const g = svgEl('g', { class: 'mz-puff' }); g.innerHTML = '<g fill="#F3EEFF" stroke="#8E78C2" stroke-width="2"><circle cx="22" cy="36" r="13"/><circle cx="42" cy="36" r="13"/><circle cx="32" cy="26" r="14"/></g>'; place(g, e.c, 0.95); monLayer.append(g); sfx.pop(); setTimeout(() => g.remove(), 1200); break; }
          case 'spawn': addMon(e.mon, true); break;
          case 'walk': if (Date.now() >= frozenTo) for (const y of W.fl.mons) { const g = mons.get(y.id); if (g) place(g, y.cell, 0.82); } break;
          case 'power': powerFx(e.id); break;
          case 'floor': layer.replaceChildren(); draw(); bubble(wrap, `Floor ${W.f + 1} of ${W.F}`); break;
          case 'won': finish(); break;
        }
      }
    }
    function powerFx(id) {
      if (id === 'shield' || id === 'hasbuna') { sfx.climb(); ring.classList.add('on'); ctx.say(MAZE_LINES.shield); bubble(wrap, id === 'hasbuna' ? 'Hasbunallahu wa ni’mal wakil! A long shield.' : 'SubhanAllah! Your shield is up.'); }
      else if (id === 'calm') { sfx.sparkle(); drawItems(); bubble(wrap, 'The storm has calmed. The way is clear.'); }
      else if (id === 'treasure') { sfx.coin(); draw(); bubble(wrap, 'The treasure door is open!'); }
      else if (id === 'speed') { sfx.right(); bubble(wrap, 'Alhamdulillah! Glide fast along the paths.'); }
      else if (id === 'light') { sfx.right(); bubble(wrap, 'Alhamdulillah! Walk lightly past the Grumblies.'); }
      else if (id === 'up' || id === 'down') sfx.climb();
      status();
    }

    // ── the dhikr powers ──
    let paintedSig = '';
    function paintPowers(force = false) {
      if (!W) return;
      const ps = W.powers();
      const sig = (listening ? 'L' : '') + ps.map((p) => `${p.id}:${p.ready ? 1 : 0}:${p.wait ?? 0}`).join(',');
      if (!force && sig === paintedSig) return;
      paintedSig = sig;
      if (listening || powers.querySelector('.mz-practice')) return;   // the listening or practice panel is up
      powers.replaceChildren();
      if (!W.started) { powers.hidden = true; return; }
      powers.hidden = !ps.length;
      for (const p of ps) {
        const d = DHIKR[p.say];
        const b = btn('mz-pw' + (p.always ? ' main' : ' ctx'));
        b.disabled = !p.ready;
        b.dataset.power = p.id;
        const ar = arEl('span', 'mz-pw-ar', d.ar);
        b.append(ar, el('span', 'mz-pw-tr', d.tr), el('span', 'mz-pw-what', !p.ready && p.wait ? `${POWER[p.id]}: again in ${p.wait} s` : `${POWER[p.id]}${p.always ? ' (Q)' : ' (E)'}`));
        b.setAttribute('aria-label', `${POWER[p.id]}: say ${d.tr}` + (!p.ready && p.wait ? `, ready in ${p.wait} seconds` : ''));
        b.addEventListener('click', () => sayPower(p));
        powers.append(b);
      }
    }
    async function sayPower(p) {
      if (!W?.started || W.won || listening || !p.ready) return;
      const d = DHIKR[p.say];
      if (practice) {
        powers.replaceChildren();
        const box = el('div', 'mz-practice');
        box.append(el('p', 'mz-practice-k', 'Say it aloud:'), arEl('p', 'mz-dhikr-ar', d.ar), el('p', 'mz-dhikr-tr', d.tr));
        const row = el('div', 'gm-row');
        const yes = btn('btn btn-primary', 'I said it'), no = btn('btn', 'Not now');
        yes.addEventListener('click', () => { box.remove(); if (!W.use(p.id)) bubble(wrap, 'You have moved on. Try again when you are there.'); paintPowers(true); board.focus({ preventScroll: true }); });
        no.addEventListener('click', () => { box.remove(); paintPowers(true); board.focus({ preventScroll: true }); });
        row.append(yes, no); box.append(row); powers.append(box);
        yes.focus({ preventScroll: true });
        return;
      }
      powers.replaceChildren();
      const box = el('div', 'mz-listen'); box.setAttribute('aria-live', 'polite');
      const msg = el('p', 'mz-listen-msg', 'Getting ready to listen…');
      const stop = btn('btn', 'Stop'); stop.addEventListener('click', () => listening?.stop());
      box.append(arEl('p', 'mz-dhikr-ar', d.ar), msg, stop);
      powers.append(box);
      listening = listenFor(p.say, { onState: (s) => { if (s === 'listening') msg.textContent = `Listening… say ${d.tr} now.`; } });
      const r = await listening.finished; listening = null;
      if (!wrap.isConnected) return;
      box.remove();
      if (r === 'ok') { if (!W.use(p.id)) bubble(wrap, 'You have moved on. Try again when you are there.'); }
      else if (r === 'no') { sfx.wrong(); bubble(wrap, 'I did not hear all of it. Try again, slowly and clearly.', 'oops'); }
      else if (r === 'unavailable' || r === 'denied') {
        practice = true; ranked = false;
        bubble(wrap, 'The microphone is not working, so this run is now practice: say it aloud and tap.', 'oops');
      }
      paintPowers(true);
      board.focus({ preventScroll: true });
    }

    function status() {
      if (!W) return;
      const secs = W.started ? Math.round(W.t / 1000) : 0;
      const parts = [`Moves: ${W.moves}`, `Bumps: ${W.bumps}`];
      if (W.gemsAll) parts.push(`${data.gems[0].toUpperCase() + data.gems.slice(1)}: ${W.gemsGot()}/${W.gemsAll}`);
      if (W.key) parts.push(W.hasKey ? 'Key: found ✓' : 'Key: not yet');
      if (W.active('shield')) parts.push(`Shield: ${Math.ceil((W.eff.shield - W.t) / 1000)} s`);
      if (!ranked) parts.push('Practice');
      info.textContent = parts.join(' · ');
      const c = W.started ? W.result().limit : null;
      chal.textContent = L.challenge && c ? `Challenge: reach ${data.goalName} in ${c.moves} moves and ${c.secs} seconds. Time: ${secs} s` : `Time: ${secs} s. Speed star: within ${W.par} s.`;
    }

    function move(d) { if (!W || Date.now() < frozenTo || listening) return; W.move(d); events(); }
    function useTunnel() { if (!W || Date.now() < frozenTo || listening) return; W.tunnel(); events(); }

    function finish() {
      clear(); stopListening();
      svg.querySelectorAll('.shimmer').forEach((x) => x.classList.remove('shimmer'));
      svg.querySelectorAll('.mz-wall.ghost').forEach((x) => x.remove());
      tunnelB.hidden = true; powers.replaceChildren(); powers.hidden = true;
      placeToken();
      const r = W.result();
      tokenG.classList.add('home');
      ctx.say(MAZE_LINES.won);
      // the student's track: best stars, time and points for this stage, and the next stage opens
      const t = T(), was = t.best[n];
      t.best[n] = { stars: Math.max(r.stars, was?.stars ?? 0), secs: Math.min(r.secs, was?.secs ?? Infinity), moves: Math.min(r.moves, was?.moves ?? Infinity), points: Math.max(r.points, was?.points ?? 0) };
      const opened = n < TRACK_LEN && t.open < n + 1;
      t.open = Math.max(t.open, Math.min(TRACK_LEN, n + 1));
      ctx.earn({ kind: 'game', key: `maze:${data.id}:L${track}S${n}`, score: r.points, good: r.stars >= 2 });
      ctx.record?.({ maze: data.id, track, stage: n, secs: r.secs, moves: r.moves, bumps: r.bumps, stars: r.stars, points: r.points, best: r.best, par: r.par, size: L.size, floors: L.floors, ranked });
      setTimeout(() => {
        if (!wrap.isConnected) return;
        const more = [];
        if (n < TRACK_LEN) more.push({ text: `Next: stage ${n + 1}`, onClick: () => play(n + 1) });
        more.push({ text: 'All stages', onClick: () => showMap(n) });
        if (ctx.leaderboard) more.push({ text: 'Leaderboard', onClick: () => ctx.leaderboard(data.id, { track, stage: n }) });
        let line = `${r.moves} moves in ${r.secs} s, bumped ${r.bumps} time${r.bumps === 1 ? '' : 's'}.`;
        if (r.gemsAll) line += ` ${data.gems[0].toUpperCase() + data.gems.slice(1)}: ${r.gemsGot} of ${r.gemsAll}.`;
        if (L.challenge) line += r.met ? ' Challenge met, masha’Allah!' : ` Challenge: ${r.limit.moves} moves in ${r.limit.secs} s.`;
        line += ` Points: ${r.points} (${r.stars} star${r.stars === 1 ? '' : 's'} and a speed bonus of ${speedBonus(r.secs, r.par)}).`;
        line += ranked ? ' This run counts on the leaderboard.' : ' Practice: this run is not on the leaderboard.';
        if (opened) line += ` Stage ${n + 1} is open!`;
        if (n === TRACK_LEN) line += ` You finished the Level ${track} track!`;
        const card = endCard(stage, {
          stars: r.stars,
          title: L.final ? `You finished the whole journey to ${data.goalName}!` : `Stage ${n}: you reached ${data.goalName}!`,
          line, fact: n === 1 || n === 5 || L.final ? data.fact : null, again: start, more,
        });
        const nb = [...card.querySelectorAll('button')].find((b) => b.textContent.startsWith('Next'));
        if (nb) { card.querySelector('.btn-primary')?.classList.remove('btn-primary'); nb.classList.add('btn-primary'); nb.parentElement.prepend(nb); nb.focus({ preventScroll: true }); }
      }, 500);
    }

    start();
    view = { kind: 'stage', n, wrap };
    // for the automated browser test: the world and the moves
    wrap.__game = { get W() { return W; }, get ranked() { return ranked; }, move, useTunnel, sayPower: (id) => { const p = W?.powers().find((x) => x.id === id); if (p) return sayPower(p); } };
  }

  function helpText(L) {
    const bits = ['Arrows, keys or swipe.'];
    if (L.naps) bits.push('Dead ends hide a sleepy Grumbly!');
    if (L.every) bits.push(`A wall moves every ${L.every / 1000} s.`);
    if (L.key) bits.push('Find the key to open the gate.');
    if (L.tunnels) bits.push('Stand on a tunnel and press Space (or the tunnel button) to go through.');
    if (L.powers.has('shield')) bits.push('Q or the Shield button: say SubhanAllah.');
    if (L.powers.size > 2) bits.push('E: say the dhikr the game shows.');
    if (L.home === 'start') bits.push('A bump sends you back to the start of the floor.');
    return bits.join(' ');
  }

  showMap();
  stage.__maze = { play, showMap, get view() { return view; }, my, setTrack: (t) => { track = t; } };
  return {
    stop() { clear(); stopListening(); window.removeEventListener('keydown', keyHandler); },
    restart: () => showMap(),
  };
}
