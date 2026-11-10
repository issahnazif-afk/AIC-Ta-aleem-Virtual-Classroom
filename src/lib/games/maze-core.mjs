// The maze itself, with no screen: a grid of cells whose open passages always form a spanning tree (a "perfect"
// maze), so there is exactly one way between any two cells and every side branch ends in a dead end.
// Pure JavaScript, used by the game (maze.mjs) and by the automated check (scripts/games/check.mjs).
//
//   const m = makeMaze(w, h, rnd)              start: top-left cell 0, goal: bottom-right cell w*h-1
//   open(m, a, b)  degree(m, c)  neighbours(m, c)  isDeadEnd(m, c)  pathBetween(m, a, b)  reachable(m, a, b)
//   planShift(m, n, rnd, { avoid, bias, token }) → swaps     applyShift(m, swaps)
//
// The walls shift by swapping passages: one passage is closed, which splits the tree in two, and a wall between
// the two halves is opened. The result is again a spanning tree, so the goal stays reachable from every cell,
// the token's cell included, and no cell is ever shut inside a closed pocket. Passages at the token's own cell are
// never touched, so a wall never closes on the token as it stands.

const key = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);

export function makeMaze(w, h, rnd = Math.random) {
  const m = { w, h, n: w * h, edges: new Set(), start: 0, goal: w * h - 1 };
  const seen = new Uint8Array(m.n);
  const stack = [0]; seen[0] = 1;
  while (stack.length) {
    const c = stack[stack.length - 1];
    const next = cellsAround(m, c).filter((x) => !seen[x]);
    if (!next.length) { stack.pop(); continue; }
    const x = next[Math.floor(rnd() * next.length)];
    m.edges.add(key(c, x)); seen[x] = 1; stack.push(x);
  }
  return m;
}

export const xy = (m, c) => [c % m.w, Math.floor(c / m.w)];
export function cellsAround(m, c) {
  const [x, y] = xy(m, c), out = [];
  if (y > 0) out.push(c - m.w);
  if (x < m.w - 1) out.push(c + 1);
  if (y < m.h - 1) out.push(c + m.w);
  if (x > 0) out.push(c - 1);
  return out;
}
export const open = (m, a, b) => m.edges.has(key(a, b));
export const neighbours = (m, c) => cellsAround(m, c).filter((x) => open(m, c, x));
export const degree = (m, c) => neighbours(m, c).length;
export const isDeadEnd = (m, c) => c !== m.start && c !== m.goal && degree(m, c) === 1;
// the cell one step in a direction (0 up, 1 right, 2 down, 3 left), or -1 at the edge of the maze
export function stepFrom(m, c, dir) {
  const [x, y] = xy(m, c);
  if (dir === 0) return y > 0 ? c - m.w : -1;
  if (dir === 1) return x < m.w - 1 ? c + 1 : -1;
  if (dir === 2) return y < m.h - 1 ? c + m.w : -1;
  return x > 0 ? c - 1 : -1;
}

function bfs(m, from, skip = null) {
  const prev = new Int32Array(m.n).fill(-2); prev[from] = -1;
  const q = [from];
  for (let i = 0; i < q.length; i++) {
    const c = q[i];
    for (const x of neighbours(m, c)) {
      if (prev[x] !== -2) continue;
      if (skip && skip(c, x)) continue;
      prev[x] = c; q.push(x);
    }
  }
  return prev;
}
export function pathBetween(m, a, b) {
  const prev = bfs(m, a);
  if (prev[b] === -2) return null;
  const p = [];
  for (let c = b; c !== -1; c = prev[c]) p.push(c);
  return p.reverse();
}
export const reachable = (m, a, b) => bfs(m, a)[b] !== -2;
export function isTree(m) {
  if (m.edges.size !== m.n - 1) return false;
  const prev = bfs(m, 0);
  for (let c = 0; c < m.n; c++) if (prev[c] === -2) return false;
  return true;
}

// Plan n passage swaps (without changing m). avoid: cells whose passages stay as they are (the token's cell).
// bias (0–1): how often the closed passage is taken from the token's way to the goal, so the route that was right
// a moment ago changes (higher levels).
export function planShift(m, n, rnd = Math.random, { avoid = [], bias = 0, token = m.start } = {}) {
  const work = { ...m, edges: new Set(m.edges) };
  const keep = new Set(avoid);
  const swaps = [];
  for (let k = 0; k < n; k++) {
    const all = [...work.edges].map((e) => e.split('-').map(Number)).filter(([a, b]) => !keep.has(a) && !keep.has(b));
    if (!all.length) break;
    let pool = all;
    if (bias && rnd() < bias) {
      const p = pathBetween(work, token, work.goal) ?? [];
      const on = new Set(); for (let i = 1; i < p.length; i++) on.add(key(p[i - 1], p[i]));
      const onPath = all.filter(([a, b]) => on.has(key(a, b)));
      if (onPath.length) pool = onPath;
    }
    const [a, b] = pool[Math.floor(rnd() * pool.length)];
    work.edges.delete(key(a, b));
    const side = bfs(work, a);                    // the half of the tree that holds a
    const inA = (c) => side[c] !== -2;
    const cands = [];
    for (let c = 0; c < work.n; c++) {
      if (!inA(c) || keep.has(c)) continue;
      for (const x of cellsAround(work, c)) if (!inA(x) && !keep.has(x) && !(c === a && x === b) && !(c === b && x === a)) cands.push([c, x]);
    }
    if (!cands.length) { work.edges.add(key(a, b)); continue; }
    const [c, x] = cands[Math.floor(rnd() * cands.length)];
    work.edges.add(key(c, x));
    swaps.push({ close: [a, b], open: [c, x] });
  }
  return swaps;
}
export function applyShift(m, swaps) {
  for (const s of swaps) { m.edges.delete(key(...s.close)); m.edges.add(key(...s.open)); }
  return m;
}

// The monster that wanders the corridors (Level 4): one step at a time, not turning back unless it must, and never
// into the start cell, so the traveller always has a safe place to begin.
export function wander(m, at, from, rnd = Math.random) {
  let opts = neighbours(m, at).filter((x) => x !== m.start);
  const fwd = opts.filter((x) => x !== from);
  if (fwd.length) opts = fwd;
  return opts.length ? opts[Math.floor(rnd() * opts.length)] : at;
}

// ── roaming monsters (Levels 2–4) ──
// how many steps from a cell to every other cell (along the passages)
export function distances(m, from) {
  const d = new Int32Array(m.n).fill(-1); d[from] = 0;
  const q = [from];
  for (let i = 0; i < q.length; i++) for (const x of neighbours(m, q[i])) if (d[x] < 0) { d[x] = d[q[i]] + 1; q.push(x); }
  return d;
}
// Where a new monster may appear: somewhere towards the traveller (min–max steps away along the passages), never on
// the traveller or right next to it, never on the start, the goal or another monster. Returns -1 if there is no room.
export function spawnCell(m, token, taken = [], rnd = Math.random, { min = 3, max = 6 } = {}) {
  const d = distances(m, token);
  const busy = new Set([m.start, m.goal, ...taken]);
  const ok = (c) => d[c] >= min && !busy.has(c) && taken.every((t) => t !== c);
  let pool = [];
  for (let c = 0; c < m.n; c++) if (ok(c) && d[c] <= max) pool.push(c);
  if (!pool.length) for (let c = 0; c < m.n; c++) if (ok(c)) pool.push(c);
  return pool.length ? pool[Math.floor(rnd() * pool.length)] : -1;
}
// One step of a monster that hunts: along the shortest way to the target, never into the start cell. With
// probability `slack` it wanders instead, so it can be dodged.
export function chaseStep(m, at, from, target, rnd = Math.random, slack = 0.3) {
  if (rnd() < slack) return wander(m, at, from, rnd);
  const p = pathBetween(m, at, target);
  const next = p && p.length > 1 ? p[1] : at;
  return next === m.start ? at : next;
}
// Move every roaming monster one step. mons: [{ cell, from, chase }]. Two monsters never share a cell. Returns true
// when a monster reaches the traveller (the game then gobbles, as at a dead end).
export function monstersStep(m, mons, token, rnd = Math.random, slack = 0.35) {
  let hit = false;
  for (const x of mons) {
    let next = x.chase ? chaseStep(m, x.cell, x.from, token, rnd, slack) : wander(m, x.cell, x.from, rnd);
    if (mons.some((o) => o !== x && o.cell === next)) next = x.cell;
    if (next !== x.cell) { x.from = x.cell; x.cell = next; }
    if (x.cell === token) hit = true;
  }
  return hit;
}
// After a gobble: monsters closer than `room` steps to where the traveller starts again go somewhere far away,
// so the traveller is never caught again straight away.
export function clearAround(m, mons, cell, rnd = Math.random, room = 5) {
  const d = distances(m, cell);
  for (const x of mons) {
    if (d[x.cell] >= room) continue;
    const c = spawnCell(m, cell, mons.filter((o) => o !== x).map((o) => o.cell), rnd, { min: room + 1, max: m.n });
    if (c >= 0) { x.cell = c; x.from = -1; }
  }
}
// The monster that gobbled the traveller is full and goes home: it leaves the maze. Returns the ones that left.
export function fullUp(mons, cell) {
  const out = mons.filter((x) => x.cell === cell);
  for (const x of out) mons.splice(mons.indexOf(x), 1);
  return out;
}
