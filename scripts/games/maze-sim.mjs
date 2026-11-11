// A simulated student playing one maze stage, with the game's own rules (maze-core.mjs and mazeStages in mazes.mjs):
// the walls shift, the monsters roam, join and hunt, a gobble sends the player back, the key opens the gate and the
// tunnels join two cells. The player walks the shortest way (through a tunnel when that is shorter) to the key and
// then to the goal at a steady pace, and waits when a monster is in the next cell or right beside it (as a careful
// child would). Pick-ups on the way are collected; the player does not go out of the way for them.
// Fog only hides the maze from a child, so the simulated player plays as if it could see (fog is checked by hand).
// Used by scripts/games/check.mjs to show every stage stays winnable, and to tune the numbers.
//   simulate(L, { pace, limit, rnd }) → { won, secs, gobbles, moves, cutOff, best, gems, gemsGot }
import { makeMaze, planShift, applyShift, reachable, isTree, isDeadEnd, degree, neighbours, distances, spawnCell, monstersStep, clearAround, fullUp, placeItems, placeTunnels, relocate, pathWith, tunnelEnd } from '../../src/lib/games/maze-core.mjs';

export function simulate(L, { pace = 450, limit = 300000, rnd = Math.random } = {}) {
  const m = makeMaze(L.size, L.size, rnd);
  const M = L.monsters;
  const tunnels = L.tunnels ? placeTunnels(m, rnd) : null;
  let key = L.key ? placeItems(m, 1, rnd, { taken: tunnels ?? [], min: 4, spread: true })[0] ?? -1 : -1;
  let gems = L.gems ? placeItems(m, L.gems, rnd, { taken: [...(tunnels ?? []), key], spread: true }) : [];
  const gemsAll = gems.length;
  let hasKey = key < 0;
  const best = (key >= 0 ? (pathWith(m, m.start, key, tunnels).length - 1) + (pathWith(m, key, m.goal, tunnels).length - 1) : pathWith(m, m.start, m.goal, tunnels).length - 1);
  let token = m.start, lastSafe = m.start, gobbles = 0, moves = 0, t = 0, pauseTo = 0, busyTo = 0, born = 0, cutOff = false;
  const mons = [], spawns = [];
  const DT = 50;
  let nextMove = pace, nextShift = L.every || Infinity, nextStep = M ? M.step : Infinity, nextSpawn = M ? 0 : Infinity;
  const things = () => [...(tunnels ?? []), ...(hasKey ? [] : [key]), ...gems];
  const gobble = () => {
    gobbles++; busyTo = t + 1500;
    fullUp(mons, token);
    token = L.home === 'junction' ? lastSafe : m.start;
    if (isDeadEnd(m, token)) token = m.start;
    if (mons.length) { clearAround(m, mons, token, rnd); pauseTo = busyTo + 2000; }
  };
  const arrive = () => {
    if (!hasKey && token === key) hasKey = true;
    const g = gems.indexOf(token); if (g >= 0) gems.splice(g, 1);
  };
  for (; t < limit; t += DT) {
    const busy = t < busyTo;
    if (t >= nextShift) {
      nextShift += L.every;
      if (!busy) {
        applyShift(m, planShift(m, L.swaps, rnd, { avoid: [token, m.start, m.goal, ...(tunnels ?? [])], bias: L.bias, token }));
        if (!isTree(m) || !reachable(m, token, m.goal)) cutOff = true;
        if (degree(m, lastSafe) < 3) lastSafe = m.start;
        // the things on cells that became dead ends move to a safe cell nearby (as in the game)
        if (!hasKey) key = relocate(m, key, [...things(), token]);
        gems = gems.map((c) => relocate(m, c, [...things(), token]));
      }
    }
    if (t >= nextSpawn) {
      nextSpawn += M.every;
      if (!busy && mons.length + spawns.length < M.max) { const c = spawnCell(m, token, mons.map((x) => x.cell), rnd); if (c >= 0) spawns.push([t + 1200, c]); }
    }
    for (let i = spawns.length - 1; i >= 0; i--) {
      if (spawns[i][0] > t) continue;
      let c = spawns[i][1]; spawns.splice(i, 1);
      if (distances(m, token)[c] < 3 || mons.some((x) => x.cell === c)) c = spawnCell(m, token, mons.map((x) => x.cell), rnd);
      if (c >= 0) mons.push({ cell: c, from: -1, chase: !!M.chase?.includes(born++) });
    }
    if (t >= nextStep) {
      nextStep += M.step;
      if (!busy && t >= pauseTo && monstersStep(m, mons, token, rnd, M.slack ?? 0.35)) gobble();
    }
    if (t >= nextMove && t >= busyTo) {
      nextMove = t + pace;
      const target = hasKey ? m.goal : key;
      const p = pathWith(m, token, target, tunnels);
      if (!p) { cutOff = true; continue; }
      const next = p[1];
      const jump = tunnelEnd(tunnels, token) === next;
      const near = new Set(mons.map((x) => x.cell));
      const danger = (c) => { if (near.has(c)) return true; const d = distances(m, c); return mons.some((x) => d[x.cell] === 1); };
      let go = next;
      if (danger(next) && rnd() > 0.15) {
        // a careful player waits, or steps back out of the way if a monster is right beside them
        go = -1;
        if (danger(token)) {
          const away = neighbours(m, token).filter((c) => !near.has(c) && !isDeadEnd(m, c) && !danger(c));
          if (away.length) go = away[Math.floor(rnd() * away.length)];
        }
      }
      if (go >= 0) {
        token = go; moves++;
        if (token === m.goal && hasKey) return { won: true, secs: t / 1000, gobbles, moves, cutOff, best, gems: gemsAll, gemsGot: gemsAll - gems.length };
        if (near.has(token)) { gobble(); continue; }
        if (!jump && go !== next && isDeadEnd(m, token)) { gobble(); continue; }
        arrive();
        if (degree(m, token) >= 3) lastSafe = token;
      }
    }
  }
  return { won: false, secs: limit / 1000, gobbles, moves, cutOff, best, gems: gemsAll, gemsGot: gemsAll - gems.length };
}
