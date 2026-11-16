// The rules of one Dhikr Maze stage, with no screen: the game (maze.mjs) draws it and the simulated player
// (scripts/games/maze-sim.mjs) plays it, so both follow exactly the same rules.
//
//   const W = createWorld(L, { rnd })   L: a stage of mazeTrack(id, level) (mazes.mjs)
//   W.begin()                start the clock (after Bismillah)          W.tick(t)   advance to t ms after the start
//   W.move(dir)              0 up, 1 right, 2 down, 3 left              W.tunnel()  go through the tunnel stood on
//   W.powers()               the powers that can be used right now      W.use(id)   use one (after its dhikr was said)
//   W.events                 what happened since the renderer last looked (it empties the list)
//   W.result()               the stars, points and figures of a finished stage
//
// Floors: floor f has the stairs up at floors[f].up and the stairs down at floors[f].down (the same cell as the floor
// below's stairs up). The traveller starts on floor 0 at cell 0; the goal is the last cell of the top floor.
// Only the floor the traveller is on moves (its walls shift, its Grumblies walk); the others wait.
import { makeMaze, xy, open, degree, isDeadEnd, stepFrom, planShift, applyShift, distances, spawnCell, clearAround, fullUp, placeItems, placeTunnels, relocate, pathWith, tunnelEnd, placeStairs, placeStorms, placeDoor, grumbliesStep } from './maze-core.mjs';
import { SHIELD_MS, SHIELD_REST, SPEED_MS, LIGHT_MS, HASBUNA_MS, THANKS_WINDOW, parSecs, starsOf, pointsOf, challengeOf } from './mazes.mjs';

const BUMP_MS = 1500, PAUSE_MS = 2000, PUFF_MS = 1200, SHIMMER_MS = 900, TUNNEL_MS = 450;
const share = (total, k, F) => Math.floor(total / F) + (k < total % F ? 1 : 0);

export function createWorld(L, { rnd = Math.random } = {}) {
  const level = L.level ?? 1, F = L.floors || 1, M = L.monsters ?? null;
  const floors = [];
  for (let f = 0; f < F; f++) floors.push({ m: makeMaze(L.size, L.size, rnd), mons: [], spawns: [], born: 0, storms: new Set(), doors: [], gems: [], tunnels: null, up: -1, down: -1, nextSpawn: 0, nextTick: 0, tick: 0 });
  const entryOf = (f) => (f === 0 ? floors[0].m.start : floors[f].down);
  const exitOf = (f) => (f === F - 1 ? floors[f].m.goal : floors[f].up);
  // stairs
  for (let f = 0; f < F - 1; f++) {
    const c = placeStairs(floors[f].m, floors[f + 1].m, entryOf(f), rnd, [floors[f].m.start], f + 1 === F - 1);
    floors[f].up = c; floors[f + 1].down = c;
  }
  const taken = (f) => { const x = floors[f]; return [entryOf(f), exitOf(f), x.up, x.down, ...(x.tunnels ?? []), ...(key && key.f === f ? [key.c] : []), ...x.gems, ...x.storms, ...x.doors.flatMap((d) => [d.a, d.b])].filter((c) => c >= 0); };
  let key = null;
  if (L.tunnels) floors[0].tunnels = placeTunnels(floors[0].m, rnd, taken(0));
  if (L.key) {
    const c = placeItems(floors[0].m, 1, rnd, { taken: taken(0), min: 4, spread: true })[0];
    if (c >= 0 && c != null) key = { f: 0, c };
  }
  for (let k = 0; k < (L.treasure || 0); k++) {
    const f = k % F, x = floors[f];
    const d = placeDoor(x.m, entryOf(f), key && key.f === f ? key.c : exitOf(f), rnd, taken(f));
    if (d) x.doors.push({ a: d[0], b: d[1], open: false });
  }
  for (let f = 0; f < F; f++) {
    const x = floors[f];
    for (const c of placeStorms(x.m, entryOf(f), key && key.f === f ? key.c : exitOf(f), share(L.storms || 0, f, F), rnd, taken(f))) x.storms.add(c);
    x.gems = placeItems(x.m, share(L.gems || 0, f, F), rnd, { taken: taken(f), spread: true });
  }
  const gemsAll = floors.reduce((a, x) => a + x.gems.length, 0);
  // the shortest way: every floor in turn (doors counted open, storms counted cleared), and the key on its floor
  const links = (x, all = false) => x.doors.filter((d) => all || d.open).map((d) => [d.a, d.b]);
  let best = F - 1;
  for (let f = 0; f < F; f++) {
    const x = floors[f], pts = [entryOf(f), ...(key && key.f === f ? [key.c] : []), exitOf(f)];
    for (let i = 1; i < pts.length; i++) best += (pathWith(x.m, pts[i - 1], pts[i], x.tunnels, links(x, true))?.length ?? 1) - 1;
  }
  const storms0 = floors.reduce((a, x) => a + x.storms.size, 0);
  const par = parSecs({ level, best, gems: gemsAll, says: (F - 1) + storms0 + floors.reduce((a, x) => a + x.doors.length, 0) });

  const W = {
    L, level, F, floors, key, gemsAll, best, par, events: [],
    f: 0, token: floors[0].m.start, lastSafe: floors[0].m.start, hasKey: !key,
    moves: 0, bumps: 0, t: 0, started: false, won: false, busyTo: 0, bumpTo: 0, pauseTo: 0, pending: null,
    nextShift: L.every || Infinity, eff: { shield: 0, light: 0, speed: 0 }, shieldReady: 0, thanksTo: 0, hasbunaUsed: false, said: 0,
    get fl() { return floors[this.f]; },
    get m() { return floors[this.f].m; },
    entry: entryOf, exit: exitOf,
    links: (f = W.f) => links(floors[f]),   // the open treasure doors
    active: (k) => W.eff[k] > W.t,
    gemsGot: () => gemsAll - floors.reduce((a, x) => a + x.gems.length, 0),
  };
  const ev = (type, x = {}) => W.events.push({ type, t: W.t, ...x });

  W.begin = () => { if (W.started) return; W.started = true; W.t = 0; floors[0].nextSpawn = 0; ev('begin'); };

  // ── the clock ──
  W.tick = (t) => {
    if (!W.started || W.won) return;
    W.t = t;
    const x = W.fl, m = x.m, busy = t < W.busyTo;
    if (L.every && t >= W.nextShift) {
      W.nextShift += L.every;
      if (!busy && !W.pending) {
        const avoid = [W.token, m.start, m.goal, x.up, x.down, ...(x.tunnels ?? []), ...x.storms, ...x.doors.flatMap((d) => [d.a, d.b])].filter((c) => c >= 0);
        const swaps = planShift(m, L.swaps, rnd, { avoid, bias: L.bias, token: W.token });
        if (swaps.length) { W.pending = { swaps, at: t + SHIMMER_MS, f: W.f }; ev('shimmer', { swaps }); }
      }
    }
    if (W.pending && t >= W.pending.at) {
      const p = W.pending; W.pending = null;
      const touched = p.f !== W.f || p.swaps.some((s) => [...s.open, ...s.close].includes(W.token));
      if (touched || t < W.busyTo) ev('shift-off');
      else {
        applyShift(m, p.swaps);
        if (degree(m, W.lastSafe) < 3) W.lastSafe = W.entry(W.f);
        // a key or a date on a cell that became a dead end rolls to a safe cell nearby
        const things = () => [...thingsOn(W.f), W.token];
        if (!W.hasKey && key.f === W.f) { const c = relocate(m, key.c, things()); if (c !== key.c) key.c = c; }
        x.gems = x.gems.map((c) => relocate(m, c, things()));
        ev('shift', { swaps: p.swaps });
      }
    }
    if (M) {
      if (t >= x.nextSpawn) {
        x.nextSpawn = t + M.every;
        if (!busy && x.mons.length + x.spawns.length < M.max) {
          const c = spawnCell(m, W.token, [...x.mons.map((y) => y.cell), ...x.storms], rnd);
          if (c >= 0) { x.spawns.push({ at: t + PUFF_MS, c }); ev('puff', { c }); }
        }
      }
      for (let i = x.spawns.length - 1; i >= 0; i--) {
        const s = x.spawns[i];
        if (s.at > t) continue;
        x.spawns.splice(i, 1);
        let c = s.c;
        if (distances(m, W.token)[c] < 3 || x.mons.some((y) => y.cell === c)) c = spawnCell(m, W.token, [...x.mons.map((y) => y.cell), ...x.storms], rnd);
        if (c < 0) continue;
        const k = x.born++;
        const chase = !!M.chase?.includes(k), fast = !!M.fast?.includes(k);
        const mon = { cell: c, from: -1, chase, fast, kind: fast ? 'fib' : chase ? (level >= 3 ? 'huff' : 'grumble') : 'grumble', id: `${W.f}-${k}` };
        x.mons.push(mon);
        ev('spawn', { mon });
      }
      if (t >= x.nextTick) {
        x.nextTick = t + M.step / 2; x.tick++;
        if (!busy && t >= W.pauseTo && x.mons.length) {
          const hit = grumbliesStep(m, x.mons, W.token, rnd, M.slack ?? 0.35, x.tick, x.storms);
          ev('walk');
          if (hit) meet();
        }
      }
    }
  };
  const thingsOn = (f) => { const x = floors[f]; return [...(x.tunnels ?? []), ...(!W.hasKey && key.f === f ? [key.c] : []), ...x.gems, x.up, x.down, ...x.storms, ...x.doors.flatMap((d) => [d.a, d.b])].filter((c) => c >= 0); };

  // a Grumbly and the traveller in the same cell
  // returns true when it was a bump
  function meet() {
    const x = W.fl, on = x.mons.filter((y) => y.cell === W.token);
    if (!on.length) return false;
    if (W.active('shield')) {
      // the shield: the Grumbly bounces away, far off
      clearAround(W.m, x.mons, W.token, rnd, 4);
      ev('blocked', { by: 'shield' });
      return false;
    }
    if (W.active('light')) { ev('blocked', { by: 'light' }); return false; }
    return bump('roamer');
  }
  function bump(kind) {
    if (W.t < W.bumpTo) return false;
    const x = W.fl, at = W.token;
    W.bumps++; W.busyTo = W.bumpTo = W.t + BUMP_MS;
    const gone = kind === 'roamer' ? fullUp(x.mons, at) : [];
    let to = L.home === 'junction' ? W.lastSafe : W.entry(W.f);
    if (isDeadEnd(W.m, to)) to = W.entry(W.f);
    W.token = to;
    if (x.mons.length) { clearAround(W.m, x.mons, to, rnd); W.pauseTo = W.busyTo + PAUSE_MS; }
    ev('bump', { kind, at, to, gone: gone.map((y) => y.id) });
    return true;
  }

  // ── moving ──
  const doorAt = (a, b) => W.fl.doors.find((d) => (d.a === a && d.b === b) || (d.a === b && d.b === a));
  W.canStep = (to) => to >= 0 && (open(W.m, W.token, to) || !!doorAt(W.token, to)?.open) && !W.fl.storms.has(to);
  W.move = (d) => {
    if (!W.started || W.won || W.t < W.busyTo) return false;
    const to = stepFrom(W.m, W.token, d);
    if (to < 0) { ev('wall'); return false; }
    const door = doorAt(W.token, to);
    if (!open(W.m, W.token, to) && !door?.open) { ev(door ? 'door-shut' : 'wall', { to }); return false; }
    if (W.fl.storms.has(to)) { ev('storm-block', { to }); return false; }
    step(to, false);
    // speed: glide on along a straight corridor
    for (let k = 0; k < 6 && W.active('speed') && !W.won && W.t >= W.busyTo; k++) {
      const c = W.token, next = stepFrom(W.m, c, d);
      if (next < 0 || !open(W.m, c, next) || degree(W.m, c) !== 2 || thingsOn(W.f).includes(c) || W.fl.storms.has(next) || isDeadEnd(W.m, next) || W.fl.mons.some((y) => y.cell === next)) break;
      step(next, true);
    }
    return true;
  };
  function step(to, glide) {
    const from = W.token;
    W.token = to; W.moves++;
    ev('step', { from, to, glide });
    arrive(false);
  }
  W.tunnel = () => {
    if (!W.started || W.won || W.t < W.busyTo) return false;
    const o = tunnelEnd(W.fl.tunnels, W.token);
    if (o < 0) return false;
    const from = W.token;
    W.busyTo = W.t + TUNNEL_MS; W.moves++; W.token = o;
    ev('tunnel', { from, to: o });
    arrive(true);
    return true;
  };
  function arrive(viaTunnel) {
    const x = W.fl, m = x.m;
    if (W.f === F - 1 && W.token === m.goal) {
      if (W.hasKey) return finish();
      ev('locked');
    }
    if (meet()) return;
    if (!viaTunnel && tunnelEnd(x.tunnels, W.token) < 0 && isDeadEnd(m, W.token)) {
      if (!L.naps) ev('dead-end');
      else if (W.active('shield')) ev('blocked', { by: 'shield', nap: true });
      else return bump('nap');
    }
    if (!W.hasKey && key.f === W.f && W.token === key.c) { W.hasKey = true; ev('key'); }
    const gi = x.gems.indexOf(W.token);
    if (gi >= 0) {
      x.gems.splice(gi, 1);
      if (L.powers.has('speed') || L.powers.has('light')) W.thanksTo = W.t + THANKS_WINDOW;
      ev('gem', { c: W.token, left: W.gemsAll - W.gemsGot() });
    }
    if (degree(m, W.token) >= 3) W.lastSafe = W.token;
  }

  // ── the powers (each one used after its dhikr was heard, or tapped in practice) ──
  const near = (cells, r) => { const d = distances(W.m, W.token); return [...cells].filter((c) => d[c] >= 0 && d[c] <= r); };
  W.powers = () => {
    const out = [], P = L.powers, x = W.fl;
    if (!W.started || W.won) return out;
    if (P.has('shield')) out.push({ id: 'shield', say: 'subhanallah', ready: W.t >= W.shieldReady && !W.active('shield'), wait: Math.max(0, Math.ceil((Math.max(W.shieldReady, W.eff.shield) - W.t) / 1000)), always: true });
    if (P.has('up') && W.token === x.up) out.push({ id: 'up', say: 'allahuakbar', ready: true });
    if (P.has('down') && W.token === x.down && W.f > 0) out.push({ id: 'down', say: 'subhanallah', ready: true });
    if (P.has('calm') && x.storms.size && near(x.storms, 2).length) out.push({ id: 'calm', say: 'audhu', ready: true });
    if (P.has('treasure') && x.doors.some((d) => !d.open && (d.a === W.token || d.b === W.token))) out.push({ id: 'treasure', say: 'lahawla', ready: true });
    if ((P.has('speed') || P.has('light')) && W.t < W.thanksTo && !W.active('speed') && !W.active('light')) out.push({ id: P.has('light') ? 'light' : 'speed', say: 'alhamdulillah', ready: true });
    if (P.has('hasbuna') && !W.hasbunaUsed) out.push({ id: 'hasbuna', say: 'hasbunallah', ready: !W.active('shield') });
    return out;
  };
  W.use = (id) => {
    const p = W.powers().find((x) => x.id === id);
    if (!p || !p.ready) return false;
    const t = W.t, x = W.fl;
    W.said++;
    if (id === 'shield') { W.eff.shield = t + SHIELD_MS[level]; W.shieldReady = W.eff.shield + SHIELD_REST[level]; }
    else if (id === 'hasbuna') { W.eff.shield = t + HASBUNA_MS; W.hasbunaUsed = true; W.shieldReady = Math.max(W.shieldReady, W.eff.shield); }
    else if (id === 'speed') { W.eff.speed = t + SPEED_MS; W.thanksTo = 0; }
    else if (id === 'light') { W.eff.light = t + LIGHT_MS; W.thanksTo = 0; }
    else if (id === 'calm') { for (const c of near(x.storms, 3)) x.storms.delete(c); }
    else if (id === 'treasure') { for (const d of x.doors) if (d.a === W.token || d.b === W.token) d.open = true; }
    else if (id === 'up' || id === 'down') {
      W.pending = null;
      W.f += id === 'up' ? 1 : -1;
      W.token = id === 'up' ? W.fl.down : W.fl.up;
      W.lastSafe = W.token; W.moves++;
      const y = W.fl;
      if (y.mons.length) clearAround(y.m, y.mons, W.token, rnd);
      y.nextSpawn = Math.max(y.nextSpawn, t); y.nextTick = t + (M?.step ?? 0);
      W.pauseTo = t + PAUSE_MS;
    }
    ev('power', { id });
    if (id === 'up' || id === 'down') ev('floor', { f: W.f });
    return true;
  };

  function finish() {
    W.won = true; W.pending = null;
    ev('won');
  }
  W.result = () => {
    const secs = Math.max(1, Math.round(W.t / 1000));
    const gemsGot = W.gemsGot();
    const stars = starsOf({ level, gemsAll, gemsGot, bumps: W.bumps, secs, moves: W.moves, par, best, challenge: !!L.challenge });
    const c = challengeOf(best);
    return { secs, moves: W.moves, bumps: W.bumps, gemsAll, gemsGot, stars, points: pointsOf(stars, secs, par), par, best, met: !L.challenge || (W.moves <= c.moves && secs <= c.secs), limit: c };
  };
  return W;
}
export { xy };
