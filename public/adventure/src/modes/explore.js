// Mode 2 — exploration and knowledge gates.
// A valley in zones. Walk anywhere, discover the landmarks (each one opens a clue card), gather light motes, and
// open the knowledge gate in each zone wall by answering its questions. A wrong answer shows the explanation and
// its source, then lets you try again — nothing is lost. Reach the goal once every landmark has been found.
import { THREE, mat, glow, mesh, rng } from '../engine/renderer.js';
import { buildEnv, SCATTER, pick, water, G, PROPS } from '../world/environments.js';
import { makeExplorer, makeGuide, animate } from '../world/explorer.js';
import { textSign, mote, spinMote, burst, barrier } from '../world/bits.js';
import { LANDMARKS } from '../content.js';
import { input, take } from '../engine/input.js';
import { sfx } from '../engine/audio.js';
import { lookColors, save, gearEffects } from '../engine/save.js';
import { hash } from './runner.js';

const W = 64, ZONE = 46;

export function createExplore(ctx, stage, region) {
  const cfg = stage.cfg, fx = gearEffects(), r = rng(hash(stage.id));
  const env = buildEnv(region.env, { night: !!cfg.night });
  const { scene } = env;
  const nz = cfg.gates.length + 1, D = nz * ZONE;

  // ── ground: gentle hills, rising into walls round the edge ──────
  const hgt = (x, z) => {
    let h = 0.5 * Math.sin(x * 0.13) * Math.cos(z * 0.11) + 0.35 * Math.sin((x + z) * 0.07);
    const ex = Math.max(0, Math.abs(x) - W / 2 + 4), ez = Math.max(0, z - 4) + Math.max(0, -z - D + 4);
    h += Math.pow(Math.min(ex, 10), 1.5) * 0.45 + Math.pow(Math.min(ez, 10), 1.5) * 0.45;   // the valley sides rise, then level off
    return h;
  };
  const gw = W + 60, gd = D + 60;
  const geo = new THREE.PlaneGeometry(gw, gd, 70, Math.ceil(gd / 1.6)); geo.rotateX(-Math.PI / 2);
  const pa = geo.attributes.position.array;
  for (let i = 0; i < pa.length; i += 3) { pa[i + 2] -= D / 2; pa[i + 1] = hgt(pa[i], pa[i + 2]); }
  geo.computeVertexNormals();
  scene.add(mesh(geo, mat(env.pal.ground), { receive: true, cast: false }));
  // a path running up the valley through each gate
  const gatesX = cfg.gates.map(() => (r() - 0.5) * 30);

  const colliders = [];   // { x, z, r, gate? }
  const solid = (x, z, rad, extra = {}) => { const c = { x, z, r: rad, ...extra }; colliders.push(c); return c; };

  // ── zone walls with a knowledge gate in each ───────────────────
  const wallProp = { desert: 'rock', oasis: 'bush', caves: 'cavewall', mountain: 'snowrock', harbour: 'house', storm: 'rock' }[region.env] ?? 'rock';
  const gates = cfg.gates.map((qids, i) => {
    const z = -(i + 1) * ZONE, gx = gatesX[i];
    for (let x = -W / 2 - 2; x <= W / 2 + 2; x += region.env === 'harbour' ? 4.5 : 2.6) {
      if (Math.abs(x - gx) < 3.4) continue;
      const pr = PROPS[wallProp](r); pr.position.set(x, hgt(x, z), z + (r() - 0.5) * 0.8);
      if (wallProp === 'bush') pr.scale.set(2.2, 2.4, 2.2);
      if (wallProp === 'rock') pr.scale.multiplyScalar(1.6);
      scene.add(pr); solid(x, z, wallProp === 'house' ? 2.5 : 1.7);
    }
    const arch = PROPS.arch(r, '#c9a26a'); arch.position.set(gx, hgt(gx, z), z); scene.add(arch);
    const bar = barrier(3, 4.2); bar.position.set(gx, hgt(gx, z) + 2.1, z); env.add(bar);
    const sign = textSign('Knowledge gate', { w: 2.6, h: 0.7, size: 48 }); sign.position.set(gx, hgt(gx, z) + 5.9, z + 0.5); scene.add(sign);
    const col = solid(gx, z, 1.8, { gate: true });
    return { i, z, x: gx, qids, open: false, bar, col, firstTry: true };
  });

  // ── landmarks ──────────────────────────────────────────────────
  const marks = cfg.landmarks.map((id, k) => {
    const zone = Math.min(nz - 1, Math.floor((k * nz) / cfg.landmarks.length));
    let x, z, tries = 0;
    do { x = (r() - 0.5) * (W - 16); z = -zone * ZONE - 10 - r() * (ZONE - 20); tries++; }
    while (tries < 30 && (Math.abs(x) < 3 && zone === 0 || gates.some((g) => Math.hypot(g.x - x, g.z - z) < 8)));
    const obj = landmarkProp(id, r); obj.position.set(x, hgt(x, z), z); scene.add(obj);
    // its real size: buildings (the stable, the House of Books) are solid all the way to their walls, and the ring
    // floats clear above the top, however tall the landmark is
    const box = new THREE.Box3().setFromObject(obj), size = box.getSize(new THREE.Vector3());
    const rad = Math.min(3.2, Math.max(1.3, Math.max(size.x, size.z) / 2 * 0.92));
    const ringY = box.max.y + 1.3;
    const ring = mesh(new THREE.TorusGeometry(0.7, 0.08, 8, 24), glow('#f3c66d', 1.8), { x, y: ringY, z, rx: Math.PI / 2, cast: false }); scene.add(ring);
    solid(x, z, rad);
    // close enough to look: within a couple of steps of its walls, not of its centre
    return { id, x, z, obj, ring, ringY, reach: rad + 2.4, found: false, name: LANDMARKS[id][0] };
  });

  // ── the goal ───────────────────────────────────────────────────
  const goalZ = -D + 12, goalX = 0;
  const goal = cfg.cave ? caveProp() : goalProp(region.env); goal.position.set(goalX, hgt(goalX, goalZ), goalZ); scene.add(goal); solid(goalX, goalZ, cfg.cave ? 3.2 : 2);
  const goalRing = mesh(new THREE.TorusGeometry(1.2, 0.1, 8, 28), glow('#9bd5bd', 1.8), { x: goalX, y: hgt(goalX, goalZ) + 7, z: goalZ, rx: Math.PI / 2, cast: false }); scene.add(goalRing);

  // ── scenery, motes, water ──────────────────────────────────────
  const list = SCATTER[region.env];
  for (let k = 0; k < 150; k++) {
    const x = (r() - 0.5) * (W + 24), z = 6 - r() * (D + 12);
    if (Math.abs(x) < 4 && z > -12) continue;
    if (gates.some((g) => Math.abs(g.z - z) < 4) || marks.some((m) => Math.hypot(m.x - x, m.z - z) < 5) || Math.hypot(goalX - x, goalZ - z) < 7) continue;
    const name = pick(list, r);
    if (name === 'dune') continue;   // dunes are for the runs' far horizon
    if (name === 'cavewall' && Math.abs(x) < W / 2 - 2) continue;
    const p = PROPS[name](r); p.position.set(x, hgt(x, z), z); p.rotation.y = r() * 6; scene.add(p);
    if (Math.abs(x) < W / 2) solid(x, z, { palm: 0.5, tree: 0.7, house: 2.4, stall: 1.8, rock: 1.1, snowrock: 1.4, pine: 0.8, stalagmite: 0.9, crystal: 0.8, tent: 1.6, lantern: 0.3 }[name] ?? 0.6);
  }
  if (region.env === 'oasis') { const w = water(14, D + 40, '#3f9ab8'); w.position.set(W / 2 - 2, 0.2, -D / 2); env.add(w); }
  if (region.env === 'harbour') { const w = water(60, D + 60, '#203c6a'); w.position.set(-W / 2 - 22, 0.3, -D / 2); env.add(w); for (let k = 0; k < 6; k++) { const b = PROPS.boat(r); b.position.set(-W / 2 - 10 - r() * 14, 0.2, -k * 30 - 10); env.add(Object.assign(b, { userData: { update: (dt, t) => { b.position.y = 0.2 + Math.sin(t + k) * 0.15; b.rotation.z = Math.sin(t * 0.8 + k) * 0.05; } } })); } }
  const motes = [];
  for (let k = 0; k < cfg.motes; k++) {
    const zone = k % nz; const x = (r() - 0.5) * (W - 10), z = -zone * ZONE - 6 - r() * (ZONE - 12);
    const m = mote(); m.position.set(x, hgt(x, z) + 1, z); scene.add(m); motes.push(m);
  }

  // ── people: the explorer and the guide ─────────────────────────
  const hero = makeExplorer(lookColors(), save.equipped); scene.add(hero);
  const guide = makeGuide(); guide.position.set(3.2, hgt(3.2, -3), -3); guide.rotation.y = -0.6; scene.add(guide); solid(3.2, -3, 0.6);
  let lamp = null;
  if (cfg.dark || cfg.night) { lamp = new THREE.PointLight('#ffcf8a', 34 * fx.light, 16 * fx.light, 1.5); scene.add(lamp); if (cfg.dark) env.hemi.intensity *= 0.75; }
  // crystal lamps light the cave as they are found
  const p = { x: 0, z: 2, y: 0, vy: 0, heading: Math.PI, speed: 0 };
  let yaw = 0, lastLook = 0;
  const st = { motes: 0, found: 0, done: false, talked: false, firstTryAll: true, rushT: 40, time: 0, recited: null };
  const cam = new THREE.Vector3(0, 6, 10);

  ctx.hud({ title: stage.name, mode: 'explore', motes: [0, cfg.motes], found: [0, marks.length], progress: 0 });
  ctx.controls('explore');

  function nearest() {
    let best = null, bd = 1e9;
    for (const m of marks) if (!m.found) { const d = Math.hypot(m.x - p.x, m.z - p.z); if (d < bd) { bd = d; best = m; } }
    return best ?? (gates.find((g) => !g.open) || { x: goalX, z: goalZ });
  }

  function update(dt, t) {
    if (take('pause')) ctx.pause();
    // camera turn: dragging, plus a gentle follow behind the explorer when walking forwards
    const dl = input.look - lastLook; lastLook = input.look; yaw -= dl;
    const F = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw)), R = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
    const mx = input.move.x, my = input.move.y;
    const dir = F.clone().multiplyScalar(my).add(R.clone().multiplyScalar(mx));
    const mag = Math.min(1, dir.length());
    if (st.done) { animate(hero, 'wave', dt); }
    else {
      if (mag > 0.05) {
        dir.normalize();
        p.speed += (6.2 * mag - p.speed) * Math.min(1, dt * 8);
        const want = Math.atan2(dir.x, dir.z);
        p.heading += angleDiff(want, p.heading) * Math.min(1, dt * 10);
        if (my > 0.3 && Math.abs(dl) < 1e-4) yaw += angleDiff(Math.atan2(-dir.x, -dir.z), yaw) * dt * 0.9;
      } else p.speed += (0 - p.speed) * Math.min(1, dt * 10);
      const vx = Math.sin(p.heading) * p.speed, vz = Math.cos(p.heading) * p.speed;
      move(vx * dt, vz * dt);
      if (take('hop') && p.y <= hgt(p.x, p.z) + 0.01) { p.vy = 7; sfx.jump(); }
      take('jump'); take('slide'); take('left'); take('right');
      p.vy -= 22 * dt; p.y += p.vy * dt;
      const gy = hgt(p.x, p.z); if (p.y < gy) { p.y = gy; p.vy = 0; }
      animate(hero, p.y > gy + 0.05 ? 'jump' : p.speed > 0.4 ? 'run' : 'idle', dt, p.speed / 6.2);
    }
    hero.position.set(p.x, p.y, p.z); hero.rotation.y = p.heading;

    st.time += dt;
    st.rushT -= dt;
    if (st.rushT <= 0 && !st.done) {
      st.rushT = 45;
      ctx.listenPhrase('subhanallah', 'Say it and the motes nearby fly to you').then((ok) => {
        if (!ok || st.done) return;
        let n = 0;
        for (let i = motes.length - 1; i >= 0; i--) { const m = motes[i]; if (Math.hypot(m.position.x - p.x, m.position.z - p.z) < 16) { burst(scene, m.position.clone(), '#ffe29a', 6); scene.remove(m); motes.splice(i, 1); n++; } }
        if (n) { st.motes += n; ctx.hud({ motes: [st.motes, cfg.motes] }); sfx.mote(); ctx.toast(`SubhanAllah! +${n} motes`, 'good'); } else ctx.toast('SubhanAllah! (No motes near — try again by the next ones.)', 'good');
      });
    }
    // motes
    for (let i = motes.length - 1; i >= 0; i--) {
      const m = motes[i]; spinMote(m, dt, t);
      if (Math.hypot(m.position.x - p.x, m.position.z - p.z) < fx.magnet && Math.abs(m.position.y - p.y - 0.9) < 2) { scene.remove(m); motes.splice(i, 1); st.motes++; sfx.mote(); ctx.hud({ motes: [st.motes, cfg.motes] }); }
    }
    // what is near enough to use
    let prompt = null, act = null;
    if (!st.done) {
      for (const m of marks) {
        m.ring.rotation.z += dt; m.ring.position.y = m.ringY + Math.sin(t * 2) * 0.2;
        if (!m.found && Math.hypot(m.x - p.x, m.z - p.z) < m.reach) { prompt = `Look at ${m.name}`; act = () => discover(m); }
      }
      for (const g of gates) if (!g.open && Math.hypot(g.x - p.x, g.z - p.z) < 4.2) { prompt = 'Answer the gate’s question'; act = () => openGate(g); }
      if (Math.hypot(goalX - p.x, goalZ - p.z) < 5) { prompt = 'Complete the quest'; act = reachGoal; }
      if (!st.talked && Math.hypot(guide.position.x - p.x, guide.position.z - p.z) < 3) { st.talked = true; ctx.toast(`Ustadh Hakim: “Look for the golden rings — each marks a landmark. Answer the gates wisely.”`, 'info', 5000); }
    }
    ctx.prompt(prompt);
    if (act && (take('act') || take('tap'))) act(); else { take('act'); }
    animate(guide, Math.hypot(guide.position.x - p.x, guide.position.z - p.z) < 6 ? 'wave' : 'idle', dt);
    goalRing.rotation.z += dt * 0.6;

    // compass (Explorer's Compass): the way to the next landmark, gate or goal
    if (fx.compass) { const n = nearest(); ctx.hud({ compass: Math.atan2(n.x - p.x, n.z - p.z) - Math.atan2(-F.x, -F.z) + Math.PI }); }

    // the camera behind the explorer
    const target = new THREE.Vector3(p.x + Math.sin(yaw) * 8.5, p.y + 5.2, p.z + Math.cos(yaw) * 8.5);
    target.y = Math.max(target.y, hgt(target.x, target.z) + 1.5);
    cam.lerp(target, Math.min(1, dt * 5));
    ctx.camera.position.copy(cam); ctx.camera.lookAt(p.x, p.y + 1.6, p.z);
    env.follow(hero.position);
    if (lamp) lamp.position.set(p.x, p.y + 2.6, p.z);
    env.update(dt, t, ctx.camera);
    ctx.hud({ progress: Math.min(1, -p.z / (D - 12)) });
  }

  function move(dx, dz) {
    let nx = p.x + dx, nz = p.z + dz;
    nx = Math.max(-W / 2 + 1.5, Math.min(W / 2 - 1.5, nx)); nz = Math.min(4, Math.max(-D + 4, nz));
    for (const c of colliders) {
      if (c.gate && c.open) continue;
      const ddx = nx - c.x, ddz = nz - c.z, d = Math.hypot(ddx, ddz), min = c.r + 0.45;
      if (d < min && d > 1e-4) { nx = c.x + (ddx / d) * min; nz = c.z + (ddz / d) * min; }
    }
    // a closed gate's wall line cannot be crossed anywhere
    for (const g of gates) if (!g.open && Math.sign(p.z - g.z) !== Math.sign(nz - g.z)) nz = p.z;
    p.x = nx; p.z = nz;
  }

  function discover(m) {
    m.found = true; st.found++; sfx.discover();
    m.ring.visible = false; burst(scene, new THREE.Vector3(m.x, hgt(m.x, m.z) + 2, m.z), '#f3c66d', 30);
    m.obj.traverse((o) => { if (o.material?.emissive) o.material.emissiveIntensity = 2.6; });
    if (region.env === 'caves') { const l = new THREE.PointLight('#9fd8ff', 40, 22, 1.4); l.position.set(m.x, hgt(m.x, m.z) + 3, m.z); scene.add(l); }
    ctx.hud({ found: [st.found, marks.length] });
    const [title, text] = LANDMARKS[m.id];
    const left = marks.filter((x) => !x.found);
    ctx.card(title, text, !left.length ? 'All landmarks discovered! Head for the goal.' : left.length === 1 ? `One left: ${left[0].name}. ${where(left[0])}` : `${left.length} left to discover.`);
  }
  // which way something is from the explorer, in words (north is up the valley, away from the start)
  function where(m) {
    const dx = m.x - p.x, dz = m.z - p.z, d = Math.hypot(dx, dz);
    const ns = dz < -d * 0.38 ? 'north' : dz > d * 0.38 ? 'south' : '', ew = dx > d * 0.38 ? 'east' : dx < -d * 0.38 ? 'west' : '';
    const gate = gates.find((g) => !g.open && Math.sign(p.z - g.z) !== Math.sign(m.z - g.z));
    return `Look for its golden ring to the ${ns}${ns && ew ? '-' : ''}${ew}, about ${Math.round(d / 5) * 5 || 5} steps away${gate ? ', beyond a knowledge gate' : ''}.`;
  }
  function openGate(g) {
    ctx.ask(g.qids, (firstTry) => {
      g.open = true; g.col.open = true; if (!firstTry) st.firstTryAll = false;
      sfx.gateOpen(); burst(scene, new THREE.Vector3(g.x, hgt(g.x, g.z) + 2, g.z), '#9bd5bd', 40);
      const m = g.bar.material; const t0 = performance.now();
      const fade = () => { const k = 1 - (performance.now() - t0) / 900; m.uniforms.fade.value = Math.max(0, k); if (k > 0) requestAnimationFrame(fade); else g.bar.visible = false; };
      fade();
      ctx.toast('The gate is open!', 'good');
    });
  }
  function reachGoal() {
    if (st.found < marks.length) { const left = marks.filter((x) => !x.found); ctx.toast(left.length === 1 ? `First find ${left[0].name}. ${where(left[0])}` : `Discover ${left.length} more landmarks first: ${left.map((x) => x.name).join(', ')}.`, 'info', 6000); return; }
    st.done = true; ctx.prompt(null);
    if (cfg.cave) {
      // recite the du'a for parents (Qur'an 17:24), and the rock rolls away from the cave
      ctx.recite('parents').then((res) => {
        st.recited = res; ctx.hakim('rock-open');
        const rock = goal.userData.rock, t0 = performance.now();
        const roll = () => { const k = Math.min(1, (performance.now() - t0) / 2200); rock.position.x = 3.6 * k; rock.rotation.z = -k * 2.2; if (k < 1) requestAnimationFrame(roll); };
        roll(); sfx.gateOpen(); win();
      });
      return;
    }
    win();
  }
  function win() {
    sfx.win();
    goal.traverse((o) => { if (o.material?.emissive) o.material.emissiveIntensity = 3; });
    burst(scene, new THREE.Vector3(goalX, hgt(goalX, goalZ) + 4, goalZ), '#ffe29a', 60);
    const stars = 1 + (st.motes >= Math.ceil(cfg.motes * 0.8) ? 1 : 0) + (st.firstTryAll ? 1 : 0);
    const lines = [[`${st.found} / ${marks.length}`, 'landmarks'], [`${st.motes} / ${cfg.motes}`, 'light motes'], [st.firstTryAll ? 'All first try' : 'All opened', 'knowledge gates']];
    if (st.recited && !st.recited.unavailable && !st.recited.skipped) lines.push([`${Math.round((st.recited.read / st.recited.total) * 100)}%`, 'of the du’a recited']);
    setTimeout(() => ctx.finish({ stars, xp: 30 + st.motes * 2 + marks.length * 8 + gates.length * 10 + (st.recited ? 20 : 0), lines, run: { stage: stage.id, motes: st.motes, stars, secs: Math.round(st.time), path: [] } }), cfg.cave ? 2600 : 1400);
  }

  return { scene, env, update, p, st, marks, gates, colliders, hgt, W, D, dispose() {} };
}

const angleDiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };

// What each landmark looks like
function landmarkProp(id, r) {
  const g = new THREE.Group();
  const stone = mat('#a89880'), wood = mat('#7a5a3e');
  const pedestal = () => g.add(mesh(G.cyl, stone, { y: 0.4, s: [1.4, 0.8, 1.4] }));
  switch (id) {
    case 'well': g.add(mesh(G.cyl, stone, { y: 0.6, s: [2.4, 1.2, 2.4] })); g.add(mesh(G.cyl, mat('#1f3b4d'), { y: 1.21, s: [1.9, 0.02, 1.9], cast: false })); for (const x of [-1, 1]) g.add(mesh(G.box, wood, { x, y: 1.8, s: [0.15, 2.4, 0.15] })); g.add(mesh(G.cone, mat('#8a3b3b'), { y: 3.4, s: [3, 1, 3], ry: Math.PI / 4 })); break;
    case 'sundial': g.add(mesh(G.cyl, stone, { y: 0.5, s: [2.2, 1, 2.2] })); g.add(mesh(G.cyl, mat('#d8c9a8'), { y: 1.02, s: [2, 0.05, 2] })); g.add(mesh(G.box, mat('#6b5a44'), { y: 1.45, s: [0.08, 0.9, 0.7], rx: -0.6 })); break;
    case 'stable': { const h = PROPS.house(r, '#c9a87a'); g.add(h); for (let x = -2; x <= 2; x += 1) g.add(mesh(G.box, wood, { x, y: 0.5, z: 3, s: [0.12, 1, 0.12] })); g.add(mesh(G.box, wood, { y: 0.8, z: 3, s: [4.2, 0.1, 0.1] })); break; }
    case 'scroll-house': { const h = PROPS.house(r, '#e8d7b8'); g.add(h); const s = textSign('House of Books', { w: 2.4, h: 0.6, size: 46 }); s.position.set(0, 3.2, 2.6); g.add(s); break; }
    case 'spade': pedestal(); g.add(mesh(G.cyl, wood, { y: 1.5, s: [0.08, 1.4, 0.08], rz: 0.3 })); g.add(mesh(G.box, mat('#9aa3ad', { metalness: 0.6 }), { x: 0.25, y: 0.95, s: [0.4, 0.5, 0.06], rz: 0.3 })); break;
    case 'basket': pedestal(); g.add(mesh(G.cyl, mat('#b9853a'), { y: 1.1, s: [1, 0.6, 1] })); for (let k = 0; k < 4; k++) g.add(mesh(G.sph, mat('#c43d3d'), { x: (k - 1.5) * 0.25, y: 1.45, s: 0.3 })); break;
    case 'watering-can': pedestal(); g.add(mesh(G.cyl, mat('#3f7f8f', { metalness: 0.5 }), { y: 1.2, s: [0.6, 0.6, 0.6] })); g.add(mesh(G.cyl, mat('#3f7f8f'), { x: 0.5, y: 1.4, s: [0.08, 0.8, 0.08], rz: -0.9 })); break;
    case 'seed-pouch': pedestal(); g.add(mesh(G.sph, mat('#a0784a'), { y: 1.2, s: [0.7, 0.8, 0.7] })); break;
    case 'blanket': pedestal(); g.add(mesh(G.box, mat('#b84a3a'), { y: 1, s: [1, 0.35, 0.8] })); break;
    case 'kettle': pedestal(); g.add(mesh(G.sph, mat('#b87333', { metalness: 0.7, roughness: 0.4 }), { y: 1.15, s: [0.7, 0.6, 0.7] })); g.add(mesh(G.cyl, mat('#b87333'), { x: 0.42, y: 1.25, s: [0.07, 0.5, 0.07], rz: -1 })); break;
    case 'map-case': pedestal(); g.add(mesh(G.cyl, mat('#6b4a2e'), { y: 1.05, s: [0.3, 1.2, 0.3], rz: Math.PI / 2 })); break;
    case 'rope': pedestal(); g.add(mesh(new THREE.TorusGeometry(0.4, 0.1, 8, 18), mat('#c9b48a'), { y: 1, rx: Math.PI / 2 })); g.add(mesh(new THREE.TorusGeometry(0.32, 0.1, 8, 18), mat('#c9b48a'), { y: 1.15, rx: Math.PI / 2 })); break;
    case 'blue-crystal': case 'green-crystal': case 'amber-crystal': case 'rose-crystal': {
      const c = { 'blue-crystal': '#6fd6ff', 'green-crystal': '#9cf2b8', 'amber-crystal': '#ffd27a', 'rose-crystal': '#f5a3c7' }[id];
      const cr = PROPS.crystal(r, c); cr.scale.setScalar(1.6); cr.traverse((o) => { if (o.material?.emissive) o.material.emissiveIntensity = 0.25; }); g.add(cr); break;
    }
    case 'spice-stall': case 'lamp-stall': case 'book-stall': case 'fruit-stall': {
      const s = PROPS.stall(r); g.add(s);
      if (id === 'lamp-stall') for (let k = 0; k < 3; k++) { const l = PROPS.hanginglamp(r, ['#ffc56b', '#9bd5bd', '#f5a3c7'][k]); l.position.set(-1 + k, 2.3, 0.6); g.add(l); }
      break;
    }
    default: pedestal(); g.add(mesh(G.oct, glow('#f3c66d', 1), { y: 1.4 }));
  }
  return g;
}

function caveProp() {
  const g = new THREE.Group();
  g.add(mesh(G.ico, mat('#7d7468'), { y: 2.6, s: [9, 6.5, 7], ry: 0.4 }));
  g.add(mesh(new THREE.CircleGeometry(1.9, 24), new THREE.MeshBasicMaterial({ color: '#120f0c' }), { y: 1.9, z: 3.05, cast: false }));
  const rock = mesh(new THREE.IcosahedronGeometry(1.9, 1), mat('#9a8f80'), { y: 1.9, z: 3.4 });
  g.add(rock); g.userData.rock = rock;
  return g;
}
function goalProp(envKey) {
  const g = new THREE.Group(), r = rng(7);
  if (envKey === 'desert') { g.add(mesh(G.cyl, mat('#a89880'), { y: 1, s: [2.6, 2, 2.6] })); g.add(mesh(G.cyl, mat('#7a5a3e'), { y: 2.2, s: [2, 0.4, 2] })); g.add(mesh(G.cone, glow('#ffb347', 1.2), { y: 3.2, s: [1.6, 2.2, 1.6], cast: false })); }
  else if (envKey === 'oasis') { const t = PROPS.tree(r); t.scale.setScalar(2.4); g.add(t); for (let k = 0; k < 8; k++) g.add(mesh(G.sph, glow(['#f2c94c', '#eb8fa8', '#c79bf2'][k % 3], 0.4), { x: Math.cos(k) * 2.4, y: 0.25, z: Math.sin(k) * 2.4, s: 0.4, cast: false })); }
  else if (envKey === 'caves') { const c = PROPS.crystal(r, '#9fd8ff'); c.scale.setScalar(3.4); g.add(c); }
  else if (envKey === 'mountain') { g.add(mesh(G.cyl, mat('#6b5a4a'), { y: 0.3, s: [3, 0.6, 3] })); g.add(mesh(G.cone, glow('#ff9a3c', 1.4), { y: 1.4, s: [1.4, 2, 1.4], cast: false })); for (let k = 0; k < 4; k++) g.add(mesh(G.cyl, mat('#5c4433'), { y: 0.7, s: [0.15, 1.8, 0.15], rz: 0.8, ry: (k * Math.PI) / 2 })); }
  else if (envKey === 'storm') { const h = PROPS.house(r, '#d9c7a4'); h.scale.setScalar(1.3); g.add(h); g.add(mesh(G.oct, glow('#ffc56b', 2.4), { x: 2.6, y: 2.6, z: 2.6, s: [0.6, 0.9, 0.6], cast: false })); }
  else { const l = PROPS.lighthouse(); l.scale.setScalar(0.6); g.add(l); }
  return g;
}
