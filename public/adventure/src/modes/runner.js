// Mode 1 — 3D adventure running.
// Lanes, jumping and sliding; obstacles that stand, roll, slide across and swing; broken bridges to leap; forks
// where the route splits in two; and answer arches: a question appears, and you run through the arch with the
// right answer. A wrong arch is never a fail: the answer and its source are shown, and the run goes on.
import { THREE, mat, glow, mesh, rng } from '../engine/renderer.js';
import { buildEnv, SCATTER, pick, water, G, PROPS } from '../world/environments.js';
import { makeExplorer, animate } from '../world/explorer.js';
import { textSign, mote, spinMote, burst } from '../world/bits.js';
import { QUESTIONS } from '../content.js';
import { input, take } from '../engine/input.js';
import { sfx } from '../engine/audio.js';
import { lookColors, lookOf, save, gearEffects, pace } from '../engine/save.js';
import { ghostsFor } from '../engine/online.js';

const LANE = 2.3, BRANCH_OFF = 6, TILE = 10;
const GRAV = -26, JUMP_V = 9.2;

export function createRunner(ctx, stage, region) {
  const cfg = { ...stage.cfg, speed: stage.cfg.speed * pace }, fx = gearEffects();
  const r = rng(hash(stage.id));
  const env = buildEnv(region.env, { night: !!cfg.night });
  const { scene } = env;
  const L = cfg.length;

  // ── the course plan ────────────────────────────────────────────
  // branches: [{ z0, z1 }] (z grows negative along the run); gates: [{ z, qid }]
  const branches = [];
  for (let k = 0; k < cfg.branches; k++) {
    const z0 = -(L * (0.25 + 0.45 * (k / Math.max(1, cfg.branches)))) - 30, z1 = z0 - 90;
    branches.push({ z0, z1, choice: null });
  }
  const gates = (cfg.gates ?? []).map((qid, k, a) => ({ qid, z: -L * ((k + 1) / (a.length + 1)) - 10, asked: false, done: false, right: null }));
  // keep gates out of branch sections
  for (const g of gates) for (const b of branches) if (g.z < b.z0 + 20 && g.z > b.z1 - 20) g.z = b.z1 - 30;
  const inBranch = (z) => branches.find((b) => z <= b.z0 && z >= b.z1);
  const branchAt = (z) => inBranch(z);

  // ── track tiles ────────────────────────────────────────────────
  const trackMat = mat(env.pal.track), edgeMat = mat(env.pal.edge);
  const tileGeo = new THREE.BoxGeometry(LANE * 3 + 1.2, 0.6, TILE);
  const edgeGeo = new THREE.BoxGeometry(0.35, 0.5, TILE);
  const lineGeo = new THREE.BoxGeometry(0.08, 0.02, TILE * 0.55);
  const lineMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.35 });
  const gaps = [];   // [{ z0, z1, offset }]
  function tile(z, off) {
    const g = new THREE.Group(); g.position.set(off, 0, z);
    g.add(mesh(tileGeo, trackMat, { y: -0.3, receive: true, cast: false }));
    for (const s of [-1, 1]) g.add(mesh(edgeGeo, edgeMat, { x: s * (LANE * 1.5 + 0.6), y: 0.1, receive: true }));
    for (const s of [-0.5, 0.5]) g.add(mesh(lineGeo, lineMat, { x: s * LANE, y: 0.01, cast: false }));
    scene.add(g);
  }
  const track = new THREE.Group(); scene.add(track);
  // which z ranges are gaps (broken bridges), chosen before the tiles are laid
  if (cfg.mix.includes('gap')) for (let z = -60; z > -L + 40; z -= 70 + r() * 50) if (!inBranch(z) && !gates.some((g) => Math.abs(g.z - z) < 25)) gaps.push({ z0: z, z1: z - 3.2 });
  const isGap = (z) => gaps.find((g) => z <= g.z0 && z >= g.z1);
  for (let z = 10; z > -L - 40; z -= TILE) {
    const zc = z - TILE / 2;
    const b = inBranch(zc);
    if (b) { tile(zc, -BRANCH_OFF); tile(zc, BRANCH_OFF); }
    else if (!gaps.some((g) => zc + TILE / 2 > g.z1 && zc - TILE / 2 < g.z0)) tile(zc, 0);
    else {
      // a broken bridge: the tile is split around the gap
      const g = gaps.find((g) => zc + TILE / 2 > g.z1 && zc - TILE / 2 < g.z0);
      const before = z - g.z0, after = (g.z1) - (z - TILE);
      if (before > 0.1) { const m = mesh(new THREE.BoxGeometry(LANE * 3 + 1.2, 0.6, before), trackMat, { y: -0.3, z: z - before / 2, receive: true }); scene.add(m); }
      if (after > 0.1) { const m = mesh(new THREE.BoxGeometry(LANE * 3 + 1.2, 0.6, after), trackMat, { y: -0.3, z: g.z1 - after / 2, receive: true }); scene.add(m); }
    }
  }
  // the gap's water (or abyss) below, and broken plank ends
  for (const g of gaps) {
    const w = water(LANE * 3 + 6, 4, region.env === 'mountain' ? '#cfe3f2' : region.env === 'caves' ? '#16304a' : '#3f8fb0'); w.position.set(0, -2.2, (g.z0 + g.z1) / 2); env.add(w);
    for (const s of [-1, 1]) for (const zz of [g.z0, g.z1]) scene.add(mesh(G.box, mat('#6b4a2e'), { x: s * 2.6 + (r() - 0.5), y: -0.1, z: zz + (zz === g.z0 ? -0.3 : 0.3), s: [1.6, 0.25, 0.5], rz: (r() - 0.5) * 0.3 }));
  }
  // branch signposts at each fork, and the joins
  for (const b of branches) {
    const post = new THREE.Group(); post.position.set(0, 0, b.z0 + 14);
    post.add(mesh(G.cyl, mat('#6b4b32'), { y: 1.5, s: [0.18, 3, 0.18] }));
    const sl = textSign('◀ Quiet path', { w: 2.6, h: 0.8, size: 54 }); sl.position.set(-1.4, 2.7, 0); post.add(sl);
    const sr = textSign('Mote path ▶', { w: 2.6, h: 0.8, size: 54, bg: '#3b2a10' }); sr.position.set(1.4, 2.0, 0); post.add(sr);
    scene.add(post);
    // short ramps of tiles joining the split tracks to the main one
    for (const z of [b.z0, b.z1]) for (const s of [-1, 1]) scene.add(mesh(new THREE.BoxGeometry(BRANCH_OFF, 0.6, 4), trackMat, { x: s * BRANCH_OFF / 2, y: -0.3, z: z + (z === b.z0 ? -2 : 2), receive: true }));
  }

  // ── obstacles and motes ────────────────────────────────────────
  const obstacles = [];   // { kind, x, z, w, h, d, y0, mesh, move? }
  const motes = [];
  const addMote = (x, y, z) => { const m = mote(); m.position.set(x, y, z); scene.add(m); motes.push(m); };
  const shelterZ = cfg.storm ? [-14, -Math.round(L * 0.55)] : [];
  const free = (z) => !shelterZ.some((s) => Math.abs(s - z) < 24) && !gates.some((g) => Math.abs(g.z - z) < 18) && !gaps.some((g) => z < g.z0 + 12 && z > g.z1 - 12) && !branches.some((b) => Math.abs(z - b.z0) < 16 || Math.abs(z - b.z1) < 10);
  function place(kind, lane, z, off) {
    const x = off + lane * LANE;
    const o = { kind, x, z, lane };
    if (kind === 'crate') { o.w = 1.4; o.h = 1.1; o.d = 1.2; o.mesh = mesh(G.box, mat('#9a6b3f'), { x, y: 0.55, z, s: [1.5, 1.1, 1.2] }); }
    if (kind === 'beam') {
      o.w = LANE * 3 + 1; o.h = 1.2; o.y0 = 1.25; o.d = 0.6; o.x = off;
      const g = new THREE.Group(); g.position.set(off, 0, z);
      g.add(mesh(G.box, mat(region.env === 'harbour' ? '#7a3b3b' : '#8a6040'), { y: 1.75, s: [LANE * 3 + 1.4, 0.55, 0.55] }));
      for (const s of [-1, 1]) g.add(mesh(G.box, mat('#6b4a2e'), { x: s * (LANE * 1.5 + 0.7), y: 1, s: [0.4, 2, 0.4] }));
      g.add(mesh(G.box, glow('#f3c66d', 0.6), { y: 1.42, s: [LANE * 3 + 1.4, 0.08, 0.58], cast: false }));
      o.mesh = g;
    }
    if (kind === 'wall') { o.w = 1.7; o.h = 3; o.d = 1; o.mesh = mesh(G.box, mat(env.pal.edge), { x, y: 1.5, z, s: [1.9, 3, 1] }); }
    if (kind === 'cart') {
      o.w = 1.5; o.h = 1.6; o.d = 1.6; o.move = { base: off, amp: LANE, speed: 1.2 + r() * 0.6, phase: r() * 6 };
      const g = new THREE.Group(); g.position.set(x, 0, z);
      g.add(mesh(G.box, mat('#a0522d'), { y: 0.95, s: [1.6, 1, 1.6] }));
      for (const sx of [-0.7, 0.7]) for (const sz of [-0.5, 0.5]) g.add(mesh(G.cyl, mat('#3a2c22'), { x: sx, y: 0.32, z: sz, s: [0.6, 0.15, 0.6], rz: Math.PI / 2 }));
      g.add(mesh(G.sph, mat('#e2a23b'), { y: 1.6, s: [0.9, 0.5, 0.9] }));
      o.mesh = g;
    }
    if (kind === 'barrel') { o.w = 1.1; o.h = 1; o.d = 1; o.roll = 5 + r() * 2; o.mesh = mesh(G.cyl, mat('#8a5a34'), { x, y: 0.5, z, s: [1, 1.1, 1], rz: Math.PI / 2 }); }
    if (kind === 'swing') {
      // a soft sack on a rope, swinging across the lanes
      o.w = 1.2; o.h = 1.2; o.d = 1; o.y0 = 0.6; o.swing = { off, phase: r() * 6, speed: 1.6 + r() * 0.5 };
      const g = new THREE.Group(); g.position.set(off, 5.2, z);
      const rope = mesh(G.cyl, mat('#c9b48a'), { y: -2.2, s: [0.06, 4.4, 0.06] });
      const sack = mesh(G.sph, mat('#c79a5a'), { y: -4.5, s: [1.2, 1.4, 1.1] });
      g.add(rope, sack); o.mesh = g; o.sack = sack;
      // the frame it hangs from
      const f = new THREE.Group(); f.position.set(off, 0, z);
      for (const s of [-1, 1]) f.add(mesh(G.box, mat('#6b4a2e'), { x: s * (LANE * 1.5 + 0.9), y: 2.7, s: [0.35, 5.4, 0.35] }));
      f.add(mesh(G.box, mat('#6b4a2e'), { y: 5.4, s: [LANE * 3 + 2.2, 0.35, 0.35] }));
      scene.add(f);
    }
    scene.add(o.mesh); obstacles.push(o);
    return o;
  }
  const mix = cfg.mix.filter((k) => k !== 'gap');
  // obstacles get closer together further along the course
  for (let z = -40; z > -L + 25; ) {
    const step = 17 - 6 * (-z / L) + r() * 6;
    z -= step;
    if (!free(z)) continue;
    const b = inBranch(z);
    const routes = b ? [-BRANCH_OFF, BRANCH_OFF] : [0];
    for (const off of routes) {
      const hard = off > 0;   // the mote path is busier
      const kind = mix[Math.floor(r() * mix.length)];
      const lane = Math.floor(r() * 3) - 1;
      if (kind === 'beam') place('beam', 0, z, off);
      else if (kind === 'wall') { place('wall', lane, z, off); if (hard || r() < 0.4) place('wall', lane === 1 ? -1 : lane + 1, z, off); }
      else if (kind === 'crate') { place('crate', lane, z, off); if (r() < 0.45) place('crate', lane === -1 ? 1 : -1, z, off); }
      else if (kind === 'swing' || kind === 'cart') place(kind, 0, z, off);
      else place(kind, lane, z, off);
      // motes: a line in a lane, or an arc over a crate
      const ml = Math.floor(r() * 3) - 1, n = hard ? 6 : 4;
      for (let k = 0; k < n; k++) addMote(off + ml * LANE, 1, z + 6 + k * 1.6);
    }
  }
  // extra motes on the long quiet stretches
  for (let z = -20; z > -L; z -= 26) if (free(z) && !inBranch(z)) for (let k = 0; k < 3; k++) addMote((Math.floor(r() * 3) - 1) * LANE, 1, z - k * 1.6);

  // ── answer arches ──────────────────────────────────────────────
  for (const g of gates) {
    const q = QUESTIONS[g.qid];
    // the options in a fixed shuffled order, one per lane
    const order = [0, 1, 2].sort(() => r() - 0.5);
    g.order = order;
    const grp = new THREE.Group(); grp.position.set(0, 0, g.z);
    for (let k = 0; k < 3; k++) {
      const x = (k - 1) * LANE;
      const a = PROPS.arch(r, '#c9a26a'); a.scale.set(0.55, 0.85, 0.5); a.position.set(x, 0, 0); grp.add(a);
      const s = textSign(q.a[order[k]], { w: 2.1, h: 1.1, size: 52 }); s.position.set(x, 4.6, 0.3); grp.add(s);
      const veil = mesh(new THREE.PlaneGeometry(1.6, 3.4), new THREE.MeshBasicMaterial({ color: '#9bd5bd', transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false }), { x, y: 1.75, cast: false });
      grp.add(veil);
    }
    scene.add(grp); g.group = grp;
  }

  // the finish arch
  const finish = PROPS.arch(r, '#d8b07a'); finish.scale.set(2.2, 1.4, 1); finish.position.set(0, 0, -L); scene.add(finish);
  const banner = textSign(stage.name, { w: 6, h: 1.2, size: 60 }); banner.position.set(0, 8, -L + 0.6); scene.add(banner);

  // ── scenery either side ────────────────────────────────────────
  const list = SCATTER[region.env];
  for (let z = 20; z > -L - 60; z -= 6 + r() * 5) for (const side of [-1, 1]) {
    if (r() < 0.25) continue;
    const name = pick(list, r);
    const p = PROPS[name](r);
    const far = name === 'dune' || name === 'cavewall' ? 16 + r() * 18 : 9 + r() * 14;
    p.position.set(side * (far + (inBranch(z) ? BRANCH_OFF : 0)), 0, z);
    p.rotation.y = r() * 6;
    scene.add(p);
  }
  if (region.env === 'oasis') { const w = water(30, L + 120, '#3f9ab8'); w.position.set(-26, -0.4, -L / 2); env.add(w); }
  if (region.env === 'harbour') { const w = water(80, L + 160, '#203c6a'); w.position.set(48, -0.6, -L / 2); env.add(w); const lh = PROPS.lighthouse(); lh.position.set(14, 0, -L - 20); scene.add(lh); }
  const ground = mesh(new THREE.PlaneGeometry(400, L + 300), mat(env.pal.ground), { rx: -Math.PI / 2, y: -1.2, z: -L / 2, receive: true, cast: false });
  if (!gaps.length) scene.add(ground); else { ground.position.y = -3; scene.add(ground); }
  if (region.env === 'caves') {
    // a cave ceiling and hanging crystals
    for (let z = 0; z > -L - 40; z -= 14) { const c = PROPS.crystal(r); c.position.set((r() - 0.5) * 14, 7 + r() * 2, z); c.rotation.z = Math.PI; scene.add(c); }
  }

  // ── the explorer ───────────────────────────────────────────────
  const hero = makeExplorer(lookColors(), save.equipped); hero.rotation.y = Math.PI; scene.add(hero);
  let lamp = null;
  if (cfg.dark || cfg.night) {
    lamp = new THREE.PointLight('#ffcf8a', 45 * fx.light, 18 * fx.light, 1.5); scene.add(lamp);
    env.hemi.intensity *= cfg.dark ? 0.7 : 0.9;
  }
  const p = { lane: 0, x: 0, y: 0, vy: 0, z: 0, slide: 0, stumble: 0, invuln: 0, off: 0 };
  const st = { speed: cfg.speed, time: 0, motes: 0, hearts: 3, stumbles: 0, correct: 0, asked: 0, done: false, wind: 0, windDir: 0, windT: 4,
    phase: 'ready', boost: 0, shield: 0, podT: 2, rushT: 28, alhAsked: false, path: [], pathT: 0, recited: [] };

  // ── the bubble shield (storm stages): raised by reciting Ayat al-Kursi at a shelter ──
  const shieldMat = new THREE.MeshStandardMaterial({ color: '#a8e6ff', emissive: '#5fc8ff', emissiveIntensity: 0.7, transparent: true, opacity: 0.22, roughness: 0.1, depthWrite: false, side: THREE.DoubleSide });
  const shieldMesh = mesh(new THREE.SphereGeometry(1.3, 28, 18), shieldMat, { cast: false }); shieldMesh.visible = false; scene.add(shieldMesh);
  const shelters = shelterZ.map((z) => { const g = shelterProp(); g.position.set(0, 0, z); scene.add(g); return { z, used: false }; });
  const pods = [];
  const podGeo = new THREE.IcosahedronGeometry(0.55, 0), spikeGeo = new THREE.ConeGeometry(0.12, 0.6, 5);
  const podMat = new THREE.MeshStandardMaterial({ color: '#3a2a4a', emissive: '#6a2f8a', emissiveIntensity: 0.5, flatShading: true, roughness: 0.6 });
  function makePod() {
    const g = new THREE.Group(); g.add(mesh(podGeo, podMat));
    for (let k = 0; k < 10; k++) { const s = mesh(spikeGeo, podMat); const a = (k / 10) * Math.PI * 2, b = (k % 2 ? 0.6 : -0.6); s.position.set(Math.cos(a) * 0.5, b * 0.5, Math.sin(a) * 0.5); s.lookAt(Math.cos(a) * 2, b * 2, Math.sin(a) * 2); s.rotateX(Math.PI / 2); g.add(s); }
    return g;
  }

  // ── classmates' ghost runs: their best run on this stage, alongside you (when playing from the Classroom) ──
  const ghosts = [];
  ghostsFor(stage.id).then((list) => {
    for (const gh of list) {
      if (!gh.path?.length) continue;
      const m = makeExplorer(lookOf(gh.look), ['satchel']);
      m.traverse((o) => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.42; o.material.depthWrite = false; } o.castShadow = false; });
      m.rotation.y = Math.PI;
      const tag = textSign(gh.name, { w: 1.8, h: 0.42, size: 46, bg: '#0f2a36' }); tag.position.y = 2.5; tag.rotation.y = Math.PI; m.add(tag);
      scene.add(m); ghosts.push({ m, path: gh.path, name: gh.name });
    }
    if (ghosts.length) ctx.toast(`Running with ${ghosts.map((g) => g.name).join(', ')} — your classmates’ best runs.`, 'info', 4500);
  });

  // ── the start: say Bismillah (or tap) ──
  ctx.startPrompt().then((said) => {
    if (st.done) return;
    st.phase = 'run';
    if (said) { st.boost = 12; ctx.toast('Bismillah! The motes gather to you.', 'good'); burst(scene, new THREE.Vector3(0, 1.5, -1), '#ffe29a', 30); }
  });
  const camPos = new THREE.Vector3(0, 5, 8), camLook = new THREE.Vector3();

  ctx.hud({ title: stage.name, mode: 'run', motes: [0, cfg.motes], hearts: [3, 3], progress: 0 });
  ctx.controls('run');

  function hit(o) {
    if (p.invuln > 0) return;
    p.stumble = 0.55; p.invuln = 1.4; st.hearts--; st.stumbles++;
    st.speed = Math.max(cfg.speed * 0.7, st.speed * 0.75);
    sfx.bump(); ctx.shake(0.35);
    if (o) { o.hit = true; o.mesh.visible = false; burst(scene, new THREE.Vector3(o.x, 1, o.z), '#e8d3a8'); }
    ctx.hud({ hearts: [st.hearts, 3] });
    if (st.hearts <= 0) { st.done = true; ctx.fail('Time for a rest!', 'Every explorer stumbles. Catch your breath and try the trail again.'); }
    else {
      ctx.toast(st.hearts === 1 ? 'Last chance — watch the path!' : 'Oops! Keep going.');
      if (!st.alhAsked) {
        st.alhAsked = true;
        ctx.listenPhrase('alhamdulillah', 'Patience in hardship: say it to get your heart back').then((ok) => {
          if (!ok || st.done || st.hearts >= 3) return;
          st.hearts++; ctx.hud({ hearts: [st.hearts, 3] }); sfx.right(); ctx.hakim('alhamdulillah-yes');
        });
      }
    }
  }

  function hold(dt, t) {
    hero.position.set(p.x, p.y, p.z); animate(hero, st.phase === 'shelter' ? 'wave' : 'idle', dt);
    camPos.lerp(new THREE.Vector3(p.x * 0.75, 4.3, p.z + 7.6), Math.min(1, dt * 6)); camLook.lerp(new THREE.Vector3(p.x * 0.85, 1.2, p.z - 7), Math.min(1, dt * 8));
    ctx.camera.position.copy(camPos); ctx.camera.lookAt(camLook); env.follow(hero.position); env.update(dt, t, ctx.camera);
    shieldMesh.position.set(p.x, p.y + 0.95, p.z);
  }
  function update(dt, t) {
    if (st.done) { animate(hero, 'idle', dt); return; }
    if (st.phase !== 'run') { hold(dt, t); return; }
    st.time += dt;
    // the path, for a ghost run classmates can race against
    st.pathT += dt; if (st.pathT >= 0.25) { st.pathT = 0; st.path.push([+p.z.toFixed(1), +p.x.toFixed(2), +p.y.toFixed(2)]); }
    for (const g of ghosts) {
      const f = st.time / 0.25, i = Math.floor(f), a = g.path[i], b = g.path[i + 1];
      if (!a) { g.m.visible = false; continue; }
      const k = b ? f - i : 0, q = b ?? a;
      g.m.position.set(a[1] + (q[1] - a[1]) * k, a[2] + (q[2] - a[2]) * k, a[0] + (q[0] - a[0]) * k);
      animate(g.m, g.m.position.y > 0.1 ? 'jump' : 'run', dt);
    }
    // a storm shelter: stop and recite Ayat al-Kursi for the bubble shield
    const sh = shelters.find((s) => !s.used && p.z <= s.z + 2);
    if (sh) {
      sh.used = true; st.phase = 'shelter'; ctx.banner(null);
      ctx.recite('kursi').then((res) => {
        if (st.done) return;
        const ratio = res.total ? res.read / res.total : 0;
        const hits = res.unavailable || res.skipped ? 1 : ratio >= 0.95 && res.missed <= 2 ? 5 : ratio >= 0.5 ? 3 : 1;
        st.shield = Math.max(st.shield, hits); st.recited.push({ ratio, missed: res.missed });
        shieldMesh.visible = true; ctx.hud({ shield: st.shield });
        ctx.hakim(hits >= 5 ? 'kursi-done' : 'kursi-partial');
        st.phase = 'run';
      });
      return;
    }
    // storm-pods fall where you will be: their shadows warn you; the shield turns them away
    if (cfg.storm && shelters[0]?.used) {
      st.podT -= dt;
      if (st.podT <= 0) {
        st.podT = 1.3 + r() * 1.1;
        const lane = r() < 0.55 ? p.lane : Math.floor(r() * 3) - 1, tt = 1.7;
        const z = p.z - st.speed * tt, x = p.off + lane * LANE;
        const pod = makePod(); pod.position.set(x, 24, z); scene.add(pod);
        const ring = mesh(new THREE.RingGeometry(0.4, 0.9, 24), new THREE.MeshBasicMaterial({ color: '#2a1838', transparent: true, opacity: 0.55, depthWrite: false }), { rx: -Math.PI / 2, x, y: 0.03, z, cast: false });
        scene.add(ring); pods.push({ pod, ring, x, z, vy: 24 / tt });
      }
    }
    for (let i = pods.length - 1; i >= 0; i--) {
      const d = pods[i]; d.pod.position.y -= d.vy * dt; d.pod.rotation.x += dt * 2; d.pod.rotation.y += dt * 3;
      const k = Math.max(0, 1 - d.pod.position.y / 24); d.ring.scale.setScalar(0.4 + k * 1.2); d.ring.material.opacity = 0.2 + k * 0.5;
      if (d.pod.position.y <= 0.6) {
        burst(scene, new THREE.Vector3(d.x, 0.6, d.z), '#9a6fc0', 22);
        scene.remove(d.pod, d.ring); d.ring.geometry.dispose(); d.ring.material.dispose(); pods.splice(i, 1);
        if (Math.abs(d.x - p.x) < 1.35 && Math.abs(d.z - p.z) < 1.8 && p.y < 1.4) {
          if (st.shield > 0) {
            st.shield--; sfx.gateOpen(); ctx.hud({ shield: st.shield }); shieldMat.emissiveIntensity = 2.5;
            if (!st.shield) { shieldMesh.visible = false; ctx.hakim('shield-gone'); } else ctx.toast('The shield held!', 'good', 1400);
          } else hit(null);
        }
      }
    }
    shieldMat.emissiveIntensity += (0.7 - shieldMat.emissiveIntensity) * Math.min(1, dt * 3);
    shieldMesh.position.set(p.x, p.y + 0.95, p.z); shieldMesh.rotation.y += dt;
    // Bismillah's blessing: the motes gather to you for a while
    st.boost = Math.max(0, st.boost - dt);
    // now and then: say SubhanAllah, and the motes ahead fly to you
    st.rushT -= dt;
    if (st.rushT <= 0) {
      st.rushT = 32;
      ctx.listenPhrase('subhanallah', 'Say it and the motes ahead fly to you').then((ok) => {
        if (!ok || st.done) return;
        let n = 0;
        for (let i = motes.length - 1; i >= 0; i--) { const m = motes[i]; const dz = m.position.z - p.z; if (dz < 2 && dz > -30) { burst(scene, m.position.clone(), '#ffe29a', 6); scene.remove(m); motes.splice(i, 1); n++; } }
        if (n) { st.motes += n; ctx.hud({ motes: [st.motes, cfg.motes] }); sfx.mote(); ctx.toast(`SubhanAllah! +${n} motes`, 'good'); }
      });
    }
    st.speed = Math.min(cfg.speed * 1.55, st.speed + cfg.speed * cfg.accel * dt * (p.stumble > 0 ? -2 : 1));
    const spd = st.speed * (p.stumble > 0 ? 0.55 : 1);
    p.z -= spd * dt;

    // input
    if (take('left')) { p.lane = Math.max(-1, p.lane - 1); sfx.lane(); }
    if (take('right')) { p.lane = Math.min(1, p.lane + 1); sfx.lane(); }
    if ((take('jump') || take('hop') || take('tap')) && p.y <= 0.01 && !isGapUnder()) { p.vy = JUMP_V * fx.jump; p.slide = 0; sfx.jump(); }
    else if (take('jump') || take('hop')) {}
    if (take('slide')) { if (p.y > 0.05) p.vy = Math.min(p.vy, -14); p.slide = 0.75; sfx.slide(); }
    if (take('pause')) ctx.pause();

    // which route a fork takes: decided by the lane you are in as you reach it
    const b = branchAt(p.z);
    if (b && b.choice === null) { b.choice = p.lane <= 0 ? -1 : 1; ctx.toast(b.choice < 0 ? 'The quiet path' : 'The mote path — more motes, more obstacles!'); }
    const targetOff = b ? b.choice * BRANCH_OFF : 0;
    p.off += (targetOff - p.off) * Math.min(1, dt * 5);

    // wind on the mountain: a warning, then a push of one lane unless you lean into it
    if (cfg.wind) {
      st.windT -= dt;
      if (st.windT <= 0 && !st.windDir) { st.windDir = r() < 0.5 ? -1 : 1; st.windWarn = 1.1; ctx.toast(st.windDir < 0 ? '⟵ A gust is coming!' : 'A gust is coming! ⟶'); }
      if (st.windDir) {
        st.windWarn -= dt;
        if (st.windWarn <= 0) {
          const resisted = input.held.has(st.windDir < 0 ? 'right' : 'left') || r() > 0.85 / fx.wind;
          if (!resisted) p.lane = Math.max(-1, Math.min(1, p.lane + st.windDir));
          st.windDir = 0; st.windT = 4 + r() * 4;
        }
      }
    }
    const tx = p.off + p.lane * LANE;
    p.x += (tx - p.x) * Math.min(1, dt * (cfg.ice ? 5 : 14));
    if (cfg.ice) p.x += Math.sin(t * 6) * 0.01;

    // jumping, sliding, gaps
    p.vy += GRAV * dt; p.y += p.vy * dt;
    const overGap = isGapUnder();
    if (p.y <= 0 && !overGap) { p.y = 0; p.vy = 0; }
    if (p.y < -1.6) {
      // fell into the river: a splash, then back on the far side
      sfx.splash(); const g = isGap(p.z) ?? gaps.find((g) => p.z < g.z0 + 4);
      if (g) p.z = g.z1 - 1.5; p.y = 2; p.vy = 0; hit(null);
    }
    p.slide = Math.max(0, p.slide - dt); p.stumble = Math.max(0, p.stumble - dt); p.invuln = Math.max(0, p.invuln - dt);

    // moving obstacles
    for (const o of obstacles) {
      if (o.hit) continue;
      if (o.move) { o.x = o.move.base + Math.sin(t * o.move.speed + o.move.phase) * o.move.amp; o.mesh.position.x = o.x; }
      if (o.roll && Math.abs(o.z - p.z) < 70) { o.z += o.roll * dt; o.mesh.position.z = o.z; o.mesh.rotation.x += o.roll * dt; }
      if (o.swing) { const a = Math.sin(t * o.swing.speed + o.swing.phase) * 0.75; o.mesh.rotation.z = a; o.x = o.swing.off + Math.sin(a) * 4.5; }
    }
    // collisions: the player's box against each obstacle's
    const ph = p.slide > 0 ? 0.75 : 1.7, px = p.x;
    for (const o of obstacles) {
      if (o.hit || Math.abs(o.z - p.z) > 1.4) continue;
      const oy0 = o.y0 ?? 0, oy1 = oy0 + o.h;
      if (Math.abs(o.x - px) < (o.w / 2 + 0.3) && Math.abs(o.z - p.z) < (o.d / 2 + 0.35) && p.y < oy1 - 0.05 && p.y + ph > oy0 + 0.05) hit(o);
    }
    // motes (drawn in from a little further away with the Mote Charm)
    for (let i = motes.length - 1; i >= 0; i--) {
      const m = motes[i]; spinMote(m, dt, t);
      const dz = m.position.z - p.z, dx = m.position.x - p.x, dy = m.position.y - (p.y + 0.9);
      const reach = fx.magnet * (st.boost > 0 ? 3 : 1);
      if (Math.abs(dz) < reach && Math.abs(dx) < reach * 0.8 && Math.abs(dy) < 1.6 + (st.boost > 0 ? 1 : 0)) {
        scene.remove(m); motes.splice(i, 1); st.motes++; sfx.mote(); ctx.hud({ motes: [st.motes, cfg.motes] });
      } else if (dz > 12) { scene.remove(m); motes.splice(i, 1); }
    }

    // answer arches: the question appears ahead; the arch you run through is your answer
    for (const g of gates) {
      if (!g.asked && p.z < g.z + 85) {
        g.asked = true; const q = QUESTIONS[g.qid];
        ctx.banner(q.q, ctx.canSpeak() ? 'Say your answer out loud — or run through its arch' : 'Run through the arch with the right answer'); sfx.click();
        // the options in lane order (left, middle, right)
        ctx.listenAnswer(g.order.map((i) => q.a[i])).then((k) => {
          if (k < 0 || g.done || st.done) return;
          p.lane = k - 1; ctx.toast(`Heading for “${q.a[g.order[k]]}”`, 'info', 1800);
        });
      }
      if (!g.done && p.z < g.z) {
        g.done = true; st.asked++;
        const k = Math.round((p.x - 0) / LANE) + 1, chosen = g.order[Math.max(0, Math.min(2, k))];
        const q = QUESTIONS[g.qid];
        g.right = chosen === q.c;
        ctx.banner(null);
        if (g.right) { st.correct++; sfx.right(); burst(scene, new THREE.Vector3(p.x, 2, p.z), '#9bd5bd', 30); for (let k2 = 0; k2 < 5; k2++) st.motes++; ctx.hud({ motes: [st.motes, cfg.motes] }); ctx.toast(`Correct! +5 motes — ${q.why}`, 'good', 4200, q.ref); }
        else { sfx.wrong(); ctx.toast(`The answer is “${q.a[q.c]}”. ${q.why}`, 'info', 5200, q.ref); }
      }
    }

    // finish
    if (p.z <= -L) {
      st.done = true;
      const stars = 1 + (st.motes >= cfg.motes ? 1 : 0) + (st.correct === gates.length && st.stumbles <= 1 ? 1 : 0);
      const xp = 20 + st.motes * 2 + st.correct * 10;
      sfx.win();
      const lines = [[`${st.motes} / ${cfg.motes}`, 'light motes'], [`${st.correct} / ${gates.length}`, 'answer arches'], [`${st.stumbles}`, 'stumbles']];
      if (st.recited.length) lines.push([`${Math.round(Math.max(...st.recited.map((x) => x.ratio)) * 100)}%`, 'of Ayat al-Kursi recited']);
      ctx.finish({ stars, xp: xp + st.recited.length * 20, lines, run: { stage: stage.id, motes: st.motes, stars, secs: Math.round(st.time), path: st.path } });
    }

    // the explorer and the camera
    hero.position.set(p.x, p.y, p.z);
    hero.rotation.z = (tx - p.x) * -0.08;
    animate(hero, p.stumble > 0 ? 'stumble' : p.slide > 0 ? 'slide' : p.y > 0.05 ? 'jump' : 'run', dt, spd / cfg.speed);
    camPos.lerp(new THREE.Vector3(p.x * 0.75, p.y * 0.4 + 4.3, p.z + 7.6), Math.min(1, dt * 6));
    camLook.lerp(new THREE.Vector3(p.x * 0.85, 1.2 + p.y * 0.3, p.z - 7), Math.min(1, dt * 8));
    ctx.camera.position.copy(camPos); ctx.camera.lookAt(camLook);
    env.follow(hero.position);
    if (lamp) lamp.position.set(p.x, p.y + 2.8, p.z + 1.6);   // behind and above: the explorer and the path ahead are both lit
    env.update(dt, t, ctx.camera);
    ctx.hud({ progress: Math.min(1, -p.z / L) });
  }
  // a small stone shelter over the track, where the storm cannot reach
  function shelterProp() {
    const g = new THREE.Group();
    for (const s of [-1, 1]) g.add(mesh(G.box, mat('#8d8576'), { x: s * (LANE * 1.5 + 0.8), y: 2.2, s: [0.6, 4.4, 2.6] }));
    g.add(mesh(G.box, mat('#6f685c'), { y: 4.6, s: [LANE * 3 + 2.6, 0.5, 3.2] }));
    g.add(mesh(new THREE.RingGeometry(1.6, 2.1, 40), new THREE.MeshBasicMaterial({ color: '#9fe3ff', transparent: true, opacity: 0.5, side: THREE.DoubleSide }), { rx: -Math.PI / 2, y: 0.04, cast: false }));
    const s = textSign('Shelter — recite Ayat al-Kursi', { w: 4.2, h: 0.7, size: 46 }); s.position.set(0, 5.4, 1.65); g.add(s);
    return g;
  }
  function isGapUnder() { return !!gaps.find((g) => p.z <= g.z0 + 0.3 && p.z >= g.z1 - 0.3); }

  return { scene, env, update, hero, p, st, dispose() {} };
}

export function hash(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
