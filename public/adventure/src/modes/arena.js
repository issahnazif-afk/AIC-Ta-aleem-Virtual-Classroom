// Mode 3 — the friendly physics arena.
// A round platform with real 2D physics (mass, momentum, friction, bouncing). No one is hit or hurt: you push
// orbs, dodge rolling stones, step on lit stones in time, or carry lanterns. Slide off the edge and you simply
// float back to the middle a moment later.
//   orbs      roll orchard orbs into your basket (a friendly rival fills theirs; your score is what counts)
//   stones    keep your footing among rolling stones and gather the motes
//   pads      step on each glowing stone before it fades, while the wind blows
//   lanterns  carry lanterns from the centre to the stands round the edge; drifting floats bump you
import { THREE, mat, glow, mesh, rng } from '../engine/renderer.js';
import { buildEnv, SCATTER, pick, water, G, PROPS } from '../world/environments.js';
import { makeExplorer, makeFriend, animate } from '../world/explorer.js';
import { mote, spinMote, burst, textSign } from '../world/bits.js';
import { input, take } from '../engine/input.js';
import { sfx } from '../engine/audio.js';
import { lookColors, save, gearEffects, pace } from '../engine/save.js';
import { hash } from './runner.js';

const R = 11;   // the platform's radius

export function createArena(ctx, stage, region) {
  const cfg = { ...stage.cfg, time: Math.round(stage.cfg.time / pace) }, fx = gearEffects(), r = rng(hash(stage.id));
  const env = buildEnv(region.env, { night: region.env === 'harbour' });
  const { scene } = env;

  // ── the arena ──────────────────────────────────────────────────
  const plat = new THREE.Group(); scene.add(plat);
  plat.add(mesh(new THREE.CylinderGeometry(R, R * 0.92, 1.2, 48), mat(env.pal.track), { y: -0.6, receive: true }));
  plat.add(mesh(new THREE.TorusGeometry(R, 0.18, 8, 64), mat('#f3c66d'), { y: 0.02, rx: Math.PI / 2, cast: false }));
  // an eight-point star inlaid in the floor (a geometric pattern)
  const star = new THREE.Shape();
  for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2, rr = k % 2 ? 2.4 : 4; const fn = k ? 'lineTo' : 'moveTo'; star[fn](Math.cos(a) * rr, Math.sin(a) * rr); }
  plat.add(mesh(new THREE.ShapeGeometry(star), mat(env.pal.edge), { y: 0.015, rx: -Math.PI / 2, cast: false, receive: true }));
  const below = region.env === 'mountain' ? mesh(new THREE.PlaneGeometry(400, 400), mat('#eef3f8'), { rx: -Math.PI / 2, y: -9 }) : water(240, 240, region.env === 'caves' ? '#16304a' : region.env === 'harbour' ? '#203c6a' : '#3f9ab8');
  if (below.userData.update) { below.position.y = -3; env.add(below); } else scene.add(below);
  const list = SCATTER[region.env];
  for (let k = 0; k < 40; k++) { const a = r() * Math.PI * 2, d = R + 12 + r() * 40; const p = PROPS[pick(list, r)](r); p.position.set(Math.cos(a) * d, region.env === 'mountain' ? -9 : -2.5, Math.sin(a) * d); scene.add(p); }
  if (region.env === 'harbour') for (let k = 0; k < 14; k++) { const l = PROPS.lantern(r, ['#ffc56b', '#9bd5bd', '#f5a3c7'][k % 3]); const a = (k / 14) * Math.PI * 2; l.position.set(Math.cos(a) * (R + 2.5), -0.5, Math.sin(a) * (R + 2.5)); scene.add(l); }

  // dark lands: lanterns hung over the arena
  if (region.env === 'caves' || region.env === 'harbour') { const l = new THREE.PointLight('#ffd9a0', 120, 40, 1.2); l.position.set(0, 12, 2); scene.add(l); }

  // ── bodies ─────────────────────────────────────────────────────
  const bodies = [];
  function body(kind, x, z, rad, mass, obj, extra = {}) {
    const b = { kind, x, z, vx: 0, vz: 0, r: rad, m: mass, obj, y: 0, vy: 0, falling: 0, damp: 2.2, ...extra };
    bodies.push(b); if (obj) scene.add(obj); return b;
  }
  const hero = makeExplorer(lookColors(), save.equipped);
  const me = body('me', 0, 4, 0.5, 1.2, hero);
  const st = { time: cfg.time, score: 0, falls: 0, done: false, carry: null, dash: 0, rivalScore: 0, wind: { x: 0, z: 0, t: 3 }, rushT: 22 };

  // per challenge
  const baskets = [], orbs = [], rivals = [], stones = [], pads = [], stands = [], floats = [], motes = [];
  let pile = null, padIdx = -1, padT = 0;
  if (cfg.kind === 'orbs') {
    const mk = (a, color, owner) => {
      const x = Math.cos(a) * (R - 1.6), z = Math.sin(a) * (R - 1.6);
      const g = new THREE.Group(); g.position.set(x, 0, z);
      g.add(mesh(new THREE.TorusGeometry(1.5, 0.2, 8, 28), mat(color), { y: 0.2, rx: Math.PI / 2 }));
      g.add(mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.05, 28), glow(color, 0.5), { y: 0.03, cast: false }));
      const s = textSign(owner === 'me' ? 'Your basket' : 'Friend’s basket', { w: 2.4, h: 0.6, size: 46 }); s.position.set(0, 2.2, 0); g.add(s);
      scene.add(g); baskets.push({ x, z, r: 1.5, owner, ring: g });
    };
    mk(-Math.PI * 0.75, '#f3c66d', 'me'); mk(-Math.PI * 0.25, '#7fb2e5', 'rival');
    for (let k = 0; k < 7; k++) spawnOrb();
    for (let k = 0; k < (cfg.rivals ?? 1); k++) { const f = makeFriend(k); rivals.push(body('rival', 3, 3, 0.5, 1.2, f, { target: null })); }
  }
  function spawnOrb(o) {
    const a = r() * Math.PI * 2, d = r() * 4;
    if (o) { Object.assign(o, { x: Math.cos(a) * d, z: Math.sin(a) * d, vx: 0, vz: 0, y: 3, falling: 0 }); return; }
    const m = mesh(new THREE.SphereGeometry(0.55, 16, 12), mat(['#e2a23b', '#c43d3d', '#7cb342'][orbs.length % 3], { flatShading: false, roughness: 0.5 }));
    orbs.push(body('orb', Math.cos(a) * d, Math.sin(a) * d, 0.55, 0.6, m, { damp: 0.9, y: 2 }));
  }
  if (cfg.kind === 'stones') for (let k = 0; k < 4; k++) stones.push(body('stone', 0, 0, 0.95, 4, mesh(new THREE.IcosahedronGeometry(0.95, 1), mat('#6f6a7a')), { damp: 0.05, wait: k * 2.2 }));
  if (cfg.kind === 'stones') for (let k = 0; k < 4; k++) addMote();
  function addMote() { const a = r() * Math.PI * 2, d = 2 + r() * (R - 3); const m = mote(); m.position.set(Math.cos(a) * d, 1, Math.sin(a) * d); scene.add(m); motes.push(m); }
  if (cfg.kind === 'pads') {
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2, d = k === 0 ? 0 : 6.5; const x = k === 0 ? 0 : Math.cos(a) * d, z = k === 0 ? 0 : Math.sin(a) * d;
      const pm = new THREE.MeshStandardMaterial({ color: '#9aa6b5', emissive: '#7fe0ff', emissiveIntensity: 0, flatShading: true });
      const m = mesh(new THREE.CylinderGeometry(1.2, 1.3, 0.3, 8), pm, { x, y: 0.15, z, receive: true });
      const ring = mesh(new THREE.TorusGeometry(1.35, 0.08, 6, 30), glow('#7fe0ff', 2), { x, y: 0.35, z, rx: Math.PI / 2, cast: false }); ring.visible = false;
      scene.add(m, ring); pads.push({ x, z, m, ring });
    }
  }
  if (cfg.kind === 'lanterns') {
    pile = new THREE.Group(); scene.add(pile);
    for (let k = 0; k < 6; k++) { const l = mesh(G.oct, glow('#ffc56b', 1.6), { x: Math.cos(k) * 0.7, y: 0.5, z: Math.sin(k) * 0.7, s: [0.6, 0.9, 0.6], cast: false }); pile.add(l); }
    for (let k = 0; k < cfg.target; k++) {
      const a = (k / cfg.target) * Math.PI * 2 + 0.3, x = Math.cos(a) * (R - 1.4), z = Math.sin(a) * (R - 1.4);
      const g = new THREE.Group(); g.position.set(x, 0, z);
      g.add(mesh(G.cyl, mat('#6b4a2e'), { y: 1, s: [0.2, 2, 0.2] }));
      const lamp = mesh(G.oct, new THREE.MeshStandardMaterial({ color: '#5a4a3a', emissive: '#ffc56b', emissiveIntensity: 0 }), { y: 2.3, s: [0.6, 0.9, 0.6], cast: false });
      g.add(lamp); scene.add(g); stands.push({ x, z, lamp, lit: false, g });
    }
    for (let k = 0; k < 4; k++) { const f = mesh(new THREE.SphereGeometry(0.85, 16, 12), mat(['#f5a3c7', '#9bd5bd', '#7fb2e5', '#f3c66d'][k], { flatShading: false, roughness: 0.4 })); const a = (k / 4) * Math.PI * 2; floats.push(body('float', Math.cos(a) * 5, Math.sin(a) * 5, 0.85, 2.5, f, { damp: 0, vx: Math.cos(a + 1.6) * 3, vz: Math.sin(a + 1.6) * 3 })); }
  }
  const carryMesh = mesh(G.oct, glow('#ffc56b', 2.2), { s: [0.5, 0.75, 0.5], cast: false }); carryMesh.visible = false; scene.add(carryMesh);

  ctx.hud({ title: stage.name, mode: 'arena', timer: st.time, score: [0, cfg.target], progress: 0 });
  ctx.controls('arena');
  ctx.toast({ orbs: 'Push the orbs into your gold basket. Dash (Shift / ⚡) for a stronger push!', stones: 'Keep your footing! Dodge the rolling stones and gather the motes.', pads: 'Step on the glowing stone before its light fades.', lanterns: 'Walk to the lantern pile, then carry each lantern to a dark stand.' }[cfg.kind], 'info', 5000);

  // ── physics ────────────────────────────────────────────────────
  function step(dt, t) {
    // the player
    const camYaw = 0;
    const ax = input.move.x, az = -input.move.y;
    const speedMul = st.carry ? 0.72 : 1;
    if (!me.falling) {
      me.vx += ax * 26 * dt * speedMul; me.vz += az * 26 * dt * speedMul;
      const sp = Math.hypot(me.vx, me.vz), max = 6.2 * speedMul;
      if (sp > max) { me.vx *= max / sp; me.vz *= max / sp; }
      if (take('dash') && st.dash <= 0) { const d = Math.hypot(ax, az) > 0.1 ? [ax, az] : [Math.sin(hero.rotation.y), Math.cos(hero.rotation.y)]; const n = Math.hypot(...d); me.vx += (d[0] / n) * 9; me.vz += (d[1] / n) * 9; st.dash = 1.1; sfx.dash(); }
    }
    st.dash = Math.max(0, st.dash - dt); ctx.hud({ dash: st.dash });
    // wind (pads): a steady push that changes direction
    if (cfg.kind === 'pads') {
      st.wind.t -= dt;
      if (st.wind.t <= 0) { const a = r() * Math.PI * 2, s = (2 + r() * 2.5) * fx.wind; st.wind = { x: Math.cos(a) * s, z: Math.sin(a) * s, t: 3 + r() * 3 }; ctx.hud({ wind: Math.atan2(st.wind.x, st.wind.z) }); }
      if (!me.falling) { me.vx += st.wind.x * dt; me.vz += st.wind.z * dt; }
    }
    // the rival: go round behind the nearest orb and push it towards their basket
    for (const rv of rivals) {
      if (rv.falling) continue;
      const bk = baskets.find((b) => b.owner === 'rival');
      if (!rv.target || rv.target.falling || r() < 0.005) rv.target = orbs.filter((o) => !o.falling).sort((a, b) => Math.hypot(a.x - rv.x, a.z - rv.z) - Math.hypot(b.x - rv.x, b.z - rv.z))[0];
      const o = rv.target; if (!o) continue;
      const dx = bk.x - o.x, dz = bk.z - o.z, dl = Math.hypot(dx, dz) || 1;
      const gx = o.x - (dx / dl) * 1.1, gz = o.z - (dz / dl) * 1.1;
      const behind = Math.hypot(gx - rv.x, gz - rv.z) < 0.6;
      const tx = behind ? o.x + (dx / dl) : gx, tz = behind ? o.z + (dz / dl) : gz;
      const ex = tx - rv.x, ez = tz - rv.z, el = Math.hypot(ex, ez) || 1;
      rv.vx += (ex / el) * 15 * dt; rv.vz += (ez / el) * 15 * dt;   // a little slower than you
      const sp = Math.hypot(rv.vx, rv.vz); if (sp > 4.6) { rv.vx *= 4.6 / sp; rv.vz *= 4.6 / sp; }
    }
    // rolling stones: wait, then roll across from the edge
    for (const s of stones) {
      if (s.falling) continue;
      if (s.wait > 0) { s.wait -= dt; s.obj.visible = false; s.x = 99; continue; }
      if (!s.rolling) { const a = r() * Math.PI * 2; s.x = Math.cos(a) * (R - 1); s.z = Math.sin(a) * (R - 1); const aim = a + Math.PI + (r() - 0.5) * 0.8, sp = 5 + (cfg.time - st.time) * 0.06 + r() * 2; s.vx = Math.cos(aim) * sp; s.vz = Math.sin(aim) * sp; s.rolling = true; s.obj.visible = true; }
    }
    // floats drift and bounce about inside the rim
    for (const f of floats) { const d = Math.hypot(f.x, f.z); if (d > R - 1.4) { const nx = f.x / d, nz = f.z / d, dot = f.vx * nx + f.vz * nz; if (dot > 0) { f.vx -= 2 * dot * nx; f.vz -= 2 * dot * nz; } } const sp = Math.hypot(f.vx, f.vz) || 1; f.vx *= 3 / sp; f.vz *= 3 / sp; }

    for (const b of bodies) {
      if (b.falling) continue;
      b.x += b.vx * dt; b.z += b.vz * dt;
      const k = Math.exp(-b.damp * dt); b.vx *= k; b.vz *= k;
    }
    // collisions between bodies: separate, then exchange momentum (bouncy, never harmful)
    for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i], b = bodies[j];
      if (a.falling || b.falling || (a.kind === 'stone' && a.wait > 0) || (b.kind === 'stone' && b.wait > 0)) continue;
      const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz), min = a.r + b.r;
      if (d >= min || d < 1e-5) continue;
      const nx = dx / d, nz = dz / d, over = min - d, im = 1 / a.m + 1 / b.m;
      a.x -= nx * over * (1 / a.m) / im; a.z -= nz * over * (1 / a.m) / im;
      b.x += nx * over * (1 / b.m) / im; b.z += nz * over * (1 / b.m) / im;
      const rv = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz;
      if (rv < 0) {
        const e = 0.55, jimp = (-(1 + e) * rv) / im;
        a.vx -= (jimp / a.m) * nx; a.vz -= (jimp / a.m) * nz; b.vx += (jimp / b.m) * nx; b.vz += (jimp / b.m) * nz;
        if ((a === me || b === me) && Math.abs(rv) > 3) { sfx.bump(); ctx.shake(Math.min(0.3, Math.abs(rv) * 0.03)); }
      }
    }
    // the edge: over it, a body falls, then floats back
    for (const b of bodies) {
      if (b.falling) {
        b.falling -= dt; b.vy -= 20 * dt; b.y += b.vy * dt;
        if (b.falling <= 0) respawn(b);
        continue;
      }
      if (Math.hypot(b.x, b.z) > R + 0.1 && !(b.kind === 'stone' && b.wait > 0)) {
        b.falling = b.kind === 'me' ? 1.3 : 1; b.vy = 1;
        if (b === me) { st.falls++; sfx.splash(); ctx.toast('Whoops! Floating you back…'); if (st.carry) { st.carry = null; carryMesh.visible = false; } }
        if (b.kind === 'stone') { b.rolling = false; b.wait = 0.6 + r() * 1.5; b.falling = 0.8; }
      }
    }
  }
  function respawn(b) {
    b.y = 0; b.vy = 0; b.vx = 0; b.vz = 0; b.falling = 0;
    if (b.kind === 'orb') spawnOrb(b);
    else if (b.kind === 'stone') { b.x = 99; b.obj.visible = false; }
    else if (b.kind === 'float') { b.x = (r() - 0.5) * 4; b.z = (r() - 0.5) * 4; b.vx = 3; b.vz = 0; }
    else { b.x = (r() - 0.5) * 2; b.z = 2 + r(); b.y = 2.5; }
  }

  // ── rules of each challenge ────────────────────────────────────
  function rules(dt, t) {
    if (cfg.kind === 'orbs') for (const o of orbs) {
      if (o.falling) continue;
      for (const b of baskets) if (Math.hypot(o.x - b.x, o.z - b.z) < b.r - 0.2) {
        burst(scene, new THREE.Vector3(o.x, 1, o.z), b.owner === 'me' ? '#f3c66d' : '#7fb2e5', 24);
        if (b.owner === 'me') { st.score++; sfx.right(); ctx.hud({ score: [st.score, cfg.target] }); } else { st.rivalScore++; ctx.hud({ rival: st.rivalScore }); }
        spawnOrb(o);
      }
    }
    if (cfg.kind === 'stones' || cfg.kind === 'pads' || cfg.kind === 'lanterns') {
      for (let i = motes.length - 1; i >= 0; i--) { const m = motes[i]; spinMote(m, dt, t); if (Math.hypot(m.position.x - me.x, m.position.z - me.z) < fx.magnet && !me.falling) { scene.remove(m); motes.splice(i, 1); st.score++; sfx.mote(); ctx.hud({ score: [st.score, cfg.target] }); addMote(); } }
    }
    if (cfg.kind === 'pads') {
      padT -= dt;
      if (padIdx < 0 || padT <= 0) {
        if (padIdx >= 0) { pads[padIdx].ring.visible = false; pads[padIdx].m.material.emissiveIntensity = 0; }
        let n; do n = Math.floor(r() * pads.length); while (n === padIdx);
        padIdx = n; const life = Math.max(1.6, 3.2 - (cfg.time - st.time) * 0.025); padT = life; pads[n].life = life;
        pads[n].ring.visible = true;
      }
      const pd = pads[padIdx]; const k = Math.max(0, padT / pd.life);
      pd.m.material.emissiveIntensity = 1.6 * k; pd.ring.scale.setScalar(0.4 + k * 0.6);
      if (!me.falling && Math.hypot(me.x - pd.x, me.z - pd.z) < 1.25) {
        st.score++; sfx.right(); burst(scene, new THREE.Vector3(pd.x, 0.8, pd.z), '#7fe0ff', 20); ctx.hud({ score: [st.score, cfg.target] });
        pd.ring.visible = false; pd.m.material.emissiveIntensity = 0; padT = 0;
      }
    }
    if (cfg.kind === 'lanterns') {
      if (!st.carry && !me.falling && Math.hypot(me.x, me.z) < 1.8 && stands.some((s) => !s.lit)) { st.carry = true; carryMesh.visible = true; sfx.click(); ctx.toast('Lantern in hand — find a dark stand!'); }
      if (st.carry) {
        carryMesh.position.set(me.x, 2.6 + Math.sin(t * 4) * 0.08, me.z);
        for (const s of stands) if (!s.lit && Math.hypot(me.x - s.x, me.z - s.z) < 1.9) {
          s.lit = true; s.lamp.material.emissiveIntensity = 2.6; st.carry = null; carryMesh.visible = false; st.score++;
          sfx.gateOpen(); burst(scene, new THREE.Vector3(s.x, 2.4, s.z), '#ffc56b', 30); ctx.hud({ score: [st.score, cfg.target] });
          const pl = new THREE.PointLight('#ffc56b', 20, 10, 1.5); pl.position.set(s.x, 2.6, s.z); scene.add(pl);
        }
      }
      pile.children.forEach((c, k) => { c.visible = k < cfg.target - st.score - (st.carry ? 1 : 0); c.rotation.y += dt; });
    }
  }

  // ── each frame ─────────────────────────────────────────────────
  let acc = 0;
  const cam = new THREE.Vector3(0, 16, 16);
  function update(dt, t) {
    if (take('pause')) ctx.pause();
    take('jump'); take('slide'); take('left'); take('right'); take('hop'); take('act'); take('tap');
    if (!st.done) {
      acc += dt; while (acc > 1 / 120) { step(1 / 120, t); acc -= 1 / 120; }
      rules(dt, t);
      st.time -= dt; ctx.hud({ timer: Math.max(0, st.time), progress: 1 - st.time / cfg.time });
      // now and then: say SubhanAllah for ten more seconds
      st.rushT -= dt;
      if (st.rushT <= 0) { st.rushT = 30; ctx.listenPhrase('subhanallah', 'Say it for 10 more seconds').then((ok) => { if (ok && !st.done) { st.time += 10; sfx.right(); ctx.toast('SubhanAllah! +10 seconds', 'good'); } }); }
      const won = st.score >= cfg.target && (cfg.kind === 'orbs' || cfg.kind === 'lanterns' || cfg.kind === 'pads');
      if (st.time <= 0 || won) end(won || st.score >= cfg.target);
    }
    // draw
    for (const b of bodies) {
      if (!b.obj) continue;
      b.obj.position.set(b.x, b.y + (b.kind === 'orb' || b.kind === 'stone' || b.kind === 'float' ? b.r : 0) - (b.falling ? 0 : 0), b.z);
      if (b.kind === 'orb' || b.kind === 'stone') { b.obj.rotation.x += b.vz * dt / b.r; b.obj.rotation.z -= b.vx * dt / b.r; }
      if (b.kind === 'float') b.obj.position.y = b.r + 0.3 + Math.sin(t * 2 + b.x) * 0.15;
      if (b.kind === 'me' || b.kind === 'rival') {
        const sp = Math.hypot(b.vx, b.vz);
        if (sp > 0.4) b.obj.rotation.y = Math.atan2(b.vx, b.vz);
        animate(b.obj, b.falling ? 'jump' : st.done && b === me ? 'wave' : b === me && st.carry ? 'carry' : sp > 0.6 ? 'run' : 'idle', dt, sp / 6);
      }
    }
    cam.lerp(new THREE.Vector3(me.x * 0.55, 15, me.z * 0.55 + 13.5), Math.min(1, dt * 3));
    ctx.camera.position.copy(cam); ctx.camera.lookAt(me.x * 0.6, 0, me.z * 0.6 - 0.5);
    env.follow(new THREE.Vector3(0, 0, 0));
    env.update(dt, t, ctx.camera);
  }
  function end(won) {
    st.done = true;
    ctx.hud({ timer: 0 });
    if (won) sfx.win();
    // ★ for completing, ★ for reaching the target, ★ for style: no slips off the edge (stones) or time to spare
    const bonus = cfg.kind === 'stones' ? (st.falls === 0 ? 1 : 0) : st.time > cfg.time * 0.25 ? 1 : 0;
    const stars = won ? 2 + bonus : 0;
    setTimeout(() => {
      if (!won) { ctx.fail('Nearly there!', `You scored ${st.score} of ${cfg.target}. Friendly challenges are about trying again with a calm heart — have another go!`); return; }
      const lines = [[`${st.score} / ${cfg.target}`, { orbs: 'orbs in your basket', stones: 'motes gathered', pads: 'stones stepped on', lanterns: 'lanterns lit' }[cfg.kind]], [`${st.falls}`, 'slides off the edge']];
      if (cfg.kind === 'orbs') lines.push([`${st.rivalScore}`, 'your friend’s orbs (just for fun)']);
      ctx.finish({ stars: Math.min(3, stars), xp: 30 + st.score * 6 + Math.round(Math.max(0, st.time)), lines, run: { stage: stage.id, motes: st.score * 3, stars: Math.min(3, stars), secs: Math.round(cfg.time - st.time), path: [] } });
    }, 900);
  }

  return { scene, env, update, me, st, stands, pads, dispose() {} };
}
