// A simulated student playing one Dhikr Maze stage, with the game's own rules (src/lib/games/maze-world.mjs, the same
// code the game runs): the walls shift, the Grumblies roam, join, hunt and dash, a bump sends the player back, the key
// opens the gate, the tunnels and open treasure doors join cells, and the floors are joined by stairs.
// The player walks the shortest way (through a tunnel or a door when that is shorter) to the key, the stairs and then
// the goal at a steady pace, and waits when a Grumbly is in the next cell or right beside it (as a careful child
// would). Pick-ups on the way are collected; the player does not go out of the way for them.
// Saying a dhikr takes the player 1.2 to 2.5 s, during which they do not move (the Grumblies do):
//   the shield when a Grumbly is two cells away · Alhamdulillah after a date · the stairs · a storm in the way ·
//   a treasure door when it is a shortcut.
// Fog only hides the maze from a child, so the simulated player plays as if it could see (fog is checked by hand).
//   simulate(L, { pace, limit, rnd }) → { won, secs, bumps, moves, cutOff, best, par, gems, gemsGot, stars, points, said }
import { isTree, reachable, neighbours, distances, isDeadEnd, pathWith, tunnelEnd, stepFrom } from '../../src/lib/games/maze-core.mjs';
import { createWorld } from '../../src/lib/games/maze-world.mjs';

const DT = 50;
const dirTo = (m, a, b) => [0, 1, 2, 3].find((d) => stepFrom(m, a, d) === b);

export function simulate(L, { pace = 450, limit = 300000, rnd = Math.random, trace = null } = {}) {
  const W = createWorld(L, { rnd });
  W.begin();
  let t = 0, nextMove = pace, sayingTo = -1, saying = null, cutOff = false;
  const sayMs = () => 1200 + rnd() * 1300;
  const say = (id) => { saying = id; sayingTo = t + sayMs(); trace?.(t, W, { type: 'say', id }); };
  for (; t < limit && !W.won; t += DT) {
    W.tick(t);
    const shifted = W.events.some((e) => e.type === 'shift');
    if (trace) for (const e of W.events) if (e.type !== 'walk') trace(t, W, e);
    W.events.length = 0;
    if (W.won) break;
    // the walls must never cut the traveller off
    if (shifted && (!isTree(W.m) || !reachable(W.m, W.token, W.exit(W.f)))) { cutOff = true; break; }
    if (saying && t >= sayingTo) { W.use(saying); saying = null; nextMove = t + pace; continue; }
    if (saying) continue;
    if (t < nextMove || t < W.busyTo) continue;
    nextMove = t + pace;
    const P = W.powers();
    const can = (id) => P.find((p) => p.id === id && p.ready);
    // after a date: Alhamdulillah
    if (can('speed') || can('light')) { say(can('speed') ? 'speed' : 'light'); continue; }
    const m = W.m, x = W.fl;
    const mons = new Set(x.mons.map((y) => y.cell));
    const dTok = distances(m, W.token);
    const close = x.mons.some((y) => dTok[y.cell] >= 0 && dTok[y.cell] <= 2);
    if (close && can('hasbuna')) { say('hasbuna'); continue; }
    if (close && can('shield')) { say('shield'); continue; }
    // where to: the key on this floor, then the stairs up, then the goal (the stairs down if the key is below)
    let target;
    if (!W.hasKey && W.key.f === W.f) target = W.key.c;
    else if (!W.hasKey && W.key.f < W.f) target = x.down;
    else target = W.exit(W.f);
    if (W.token === target) {
      if (can('up') && target === x.up) { say('up'); continue; }
      if (can('down') && target === x.down) { say('down'); continue; }
    }
    // a closed treasure door that would make the way shorter: go and open it
    const plain = pathWith(m, W.token, target, x.tunnels, W.links());
    if (!plain) { cutOff = true; break; }
    if (can('treasure')) { const all = pathWith(m, W.token, target, x.tunnels, x.doors.map((d) => [d.a, d.b])); if (all && all.length < plain.length) { say('treasure'); continue; } }
    let p = plain;
    const shut = x.doors.filter((d) => !d.open);
    if (shut.length) {
      const viaDoor = pathWith(m, W.token, target, x.tunnels, x.doors.map((d) => [d.a, d.b]));
      if (viaDoor && viaDoor.length + 2 < plain.length) {
        // walk to the nearer end of the door that the shorter way crosses
        const d = shut.find((dd) => viaDoor.includes(dd.a) && viaDoor.includes(dd.b));
        if (d) p = pathWith(m, W.token, viaDoor.indexOf(d.a) < viaDoor.indexOf(d.b) ? d.a : d.b, x.tunnels, W.links()) ?? plain;
      }
    }
    if (p.length < 2) continue;
    const next = p[1];
    if (x.storms.has(next)) { if (can('calm')) say('calm'); continue; }
    const jump = tunnelEnd(x.tunnels, W.token) === next;
    const danger = (c) => { if (mons.has(c)) return true; const d = distances(m, c); return x.mons.some((y) => d[y.cell] === 1); };
    const safe = W.active('shield') || W.active('light');
    let go = next;
    if (!safe && danger(next) && rnd() > 0.15) {
      // a careful player waits, or steps back out of the way if a Grumbly is right beside them
      go = -1;
      if (danger(W.token)) {
        const away = neighbours(m, W.token).filter((c) => !mons.has(c) && !isDeadEnd(m, c) && !danger(c) && !x.storms.has(c));
        if (away.length) go = away[Math.floor(rnd() * away.length)];
      }
    }
    if (go < 0) continue;
    if (jump) W.tunnel();
    else {
      const d = dirTo(m, W.token, go);
      if (d == null) continue;
      W.move(d);
    }
  }
  const r = W.won ? W.result() : null;
  return {
    won: W.won, secs: r ? r.secs : limit / 1000, bumps: W.bumps, moves: W.moves, cutOff, best: W.best, par: W.par,
    gems: W.gemsAll, gemsGot: W.gemsGot(), stars: r?.stars ?? 0, points: r?.points ?? 0, said: W.said,
  };
}
