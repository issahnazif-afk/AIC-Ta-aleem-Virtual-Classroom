// Story sequences (cinematic camera shots with captions), the title backdrop, and the dressing room where the
// explorer is customised. Only the explorer and the guide appear: no figure represents a prophet.
import { THREE, mat, glow, mesh, rng } from '../engine/renderer.js';
import { buildEnv, SCATTER, pick, water, PROPS, G } from '../world/environments.js';
import { makeExplorer, makeGuide, animate } from '../world/explorer.js';
import { lookColors, save } from '../engine/save.js';

// a small stage set for a land: ground, scattered props, water where it belongs
function set(envKey, seed = 3, night = false) {
  const env = buildEnv(envKey, { night });
  const { scene } = env, r = rng(seed);
  scene.add(mesh(new THREE.CircleGeometry(160, 48), mat(env.pal.ground), { rx: -Math.PI / 2, receive: true, cast: false }));
  const list = SCATTER[envKey];
  for (let k = 0; k < 90; k++) {
    const a = r() * Math.PI * 2, d = 7 + r() * 70;
    const p = PROPS[pick(list, r)](r); p.position.set(Math.cos(a) * d, 0, Math.sin(a) * d - 10); p.rotation.y = r() * 6; scene.add(p);
  }
  if (envKey === 'oasis') { const w = water(90, 26, '#3f9ab8'); w.position.set(0, 0.15, -24); env.add(w); }
  if (envKey === 'harbour') { const w = water(200, 90, '#203c6a'); w.position.set(0, 0.2, -60); env.add(w); const lh = PROPS.lighthouse(); lh.position.set(18, 0, -30); scene.add(lh); for (let k = 0; k < 5; k++) { const b = PROPS.boat(r); b.position.set(-30 + k * 12, 0.2, -30 - r() * 20); b.rotation.y = r(); env.add(Object.assign(b, { userData: { update: (dt, t) => { b.position.y = 0.2 + Math.sin(t + k) * 0.15; } } })); } }
  if (envKey === 'caves') for (let k = 0; k < 16; k++) { const c = PROPS.crystal(r); c.position.set((r() - 0.5) * 30, 0, -r() * 20 - 2); c.scale.setScalar(1 + r() * 1.5); scene.add(c); }
  if (envKey === 'mountain') for (let k = 0; k < 8; k++) { const m = mesh(G.cone, mat(k % 2 ? '#dfe8f2' : '#c8d3e0'), { x: (k - 4) * 26 + r() * 10, y: 14, z: -90 - r() * 30, s: [40, 40 + r() * 20, 40] }); scene.add(m); }
  return env;
}

// lanterns drifting up into the night sky
function riseLanterns(env, n = 60) {
  const r = rng(11), list = [];
  for (let k = 0; k < n; k++) {
    const l = mesh(G.oct, glow(['#ffc56b', '#ffd98a', '#f5b56b'][k % 3], 2.2), { x: (r() - 0.5) * 40, y: -2 - r() * 20, z: -5 - r() * 30, s: [0.5, 0.75, 0.5], cast: false });
    l.userData.v = 1 + r() * 1.5; env.scene.add(l); list.push(l);
  }
  const lights = new THREE.Group(); env.scene.add(lights);
  env.track({ userData: { update: (dt, t) => { for (const l of list) { l.position.y += l.userData.v * dt; l.position.x += Math.sin(t + l.userData.v * 7) * dt * 0.3; } } } });
}

// the props a story needs: a campfire for Ustadh Hakim's stories, the cave and its rock, the storehouse at night,
// and storm-pods in the sky. No figure stands in for the Prophet ﷺ, a Companion, or Shaytan.
function storySet(env, story) {
  const { scene } = env, acts = new Set(story.shots.map((x) => x.act)), out = {};
  if (story.teller) {
    const fire = new THREE.Group(); fire.position.set(0.2, 0, 1.6);
    for (let k = 0; k < 4; k++) fire.add(mesh(G.cyl, mat('#5a3e2a'), { y: 0.12, s: [0.14, 1.1, 0.14], rz: Math.PI / 2, ry: (k * Math.PI) / 4 }));
    const flame = mesh(G.cone, glow('#ffae42', 2.6), { y: 0.55, s: [0.6, 0.9, 0.6], cast: false }); fire.add(flame);
    const l = new THREE.PointLight('#ffb35c', 26, 12, 1.5); l.position.y = 1.1; fire.add(l);
    scene.add(fire); env.track({ userData: { update: (dt, t) => { flame.scale.set(0.6 + Math.sin(t * 9) * 0.05, 0.9 + Math.sin(t * 13) * 0.12, 0.6); l.intensity = 24 + Math.sin(t * 11) * 4; } } });
  }
  if (acts.has('cave') || acts.has('rock')) {
    const c = new THREE.Group(); c.position.set(0, 0, -12);
    c.add(mesh(G.ico, mat('#7d7468'), { y: 2.6, s: [9, 6.5, 7], ry: 0.4 }));
    c.add(mesh(new THREE.CircleGeometry(1.9, 24), new THREE.MeshBasicMaterial({ color: '#120f0c' }), { y: 1.9, z: 3.05, cast: false }));
    out.rock = mesh(new THREE.IcosahedronGeometry(1.9, 1), mat('#9a8f80'), { y: 1.9, z: 3.4 }); c.add(out.rock);
    scene.add(c);
  }
  if (acts.has('store')) {
    const h = PROPS.house(rng(4), '#d9c7a4'); h.position.set(0, 0, -6); scene.add(h);
    for (let k = 0; k < 5; k++) scene.add(mesh(G.cyl, mat('#a0784a'), { x: -2.4 + k * 1.1, y: 0.45, z: -2.6, s: [0.8, 0.9, 0.8] }));
    const lamp = PROPS.lantern(rng(5)); lamp.position.set(2.8, 0, -2.4); scene.add(lamp);
    const l = new THREE.PointLight('#ffc56b', 18, 10, 1.6); l.position.set(2.8, 2.9, -2.4); scene.add(l);
    env.sun.intensity *= 0.35; env.hemi.intensity *= 0.55;   // night
  }
  if (acts.has('storm')) {
    const pods = [];
    for (let k = 0; k < 18; k++) { const p = mesh(G.ico, new THREE.MeshStandardMaterial({ color: '#3a2a4a', emissive: '#6a2f8a', emissiveIntensity: 0.6, flatShading: true }), { x: (Math.random() - 0.5) * 30, y: 6 + Math.random() * 20, z: -6 - Math.random() * 25, s: 0.9 }); pods.push(p); scene.add(p); }
    env.track({ userData: { update: (dt) => { for (const p of pods) { p.position.y -= dt * 7; p.rotation.x += dt * 2; if (p.position.y < 0) p.position.y += 26; } } } });
  }
  return out;
}

// ── a story sequence ─────────────────────────────────────────────
// Each shot waits for Ustadh Hakim to finish speaking (his recorded voice, or the browser's), and for its camera move.
export function createStory(ctx, story, id) {
  const env = set(story.env, 5, story.env === 'harbour');
  const { scene } = env;
  const props = storySet(env, story);
  const hero = makeExplorer(lookColors(), save.equipped); hero.position.set(0, 0, 0); scene.add(hero);
  const guide = makeGuide(); guide.position.set(-1.6, 0, 0.4); guide.rotation.y = 0.5; scene.add(guide);
  hero.rotation.y = -0.4;
  let shot = -1, st = 0, spoken = true, rockT = 0;
  const from = new THREE.Vector3(), to = new THREE.Vector3(), look = new THREE.Vector3();
  let lanternsUp = false;
  if (story.env === 'harbour') riseLanterns(env, 10);
  function next() {
    shot++; st = 0;
    if (shot >= story.shots.length) { ctx.storyDone(); return; }
    const s = story.shots[shot];
    from.set(...s.cam[0]); to.set(...s.cam[1]); look.set(...s.look);
    ctx.caption(s.text, shot === 0 ? story.title : null);
    spoken = false; const mine = shot;
    ctx.hakim(`story-${id}-${shot}`, s.text).then(() => { if (mine === shot) spoken = true; });
    if (s.act === 'lanterns' && !lanternsUp) { lanternsUp = true; riseLanterns(env, 70); }
    if (s.act === 'sunrise') env.sun.intensity = 0.2;
  }
  next();
  function update(dt, t) {
    const s = story.shots[shot]; if (!s) return;
    st += dt;
    const k = Math.min(1, st / s.t), e = k * k * (3 - 2 * k);
    ctx.camera.position.lerpVectors(from, to, e); ctx.camera.lookAt(look);
    if (s.act === 'sunrise') env.sun.intensity = Math.min(env.pal.sunI, 0.2 + st * 0.5);
    animate(hero, s.act === 'explorer' ? 'wave' : 'idle', dt);
    animate(guide, s.act === 'guide' ? 'wave' : 'idle', dt);
    env.follow(new THREE.Vector3(0, 0, 0));
    env.update(dt, t, ctx.camera);
    if (s.act === 'rock' && props.rock) { rockT = Math.min(1, rockT + dt / 4); props.rock.position.x = 3.6 * rockT; props.rock.rotation.z = -rockT * 2.2; }
    // on to the next shot when the camera move is done and he has finished speaking (never stuck for long)
    if ((st >= s.t && spoken) || st >= s.t + 30) next();
  }
  return { scene, env, update, skip: () => { shot = story.shots.length; ctx.stopVoice(); ctx.storyDone(); }, dispose() {} };
}

// ── the title backdrop: a slow orbit around the explorer in the land they are in ─
export function createBackdrop(ctx, envKey) {
  const env = set(envKey, 9, envKey === 'harbour');
  const hero = makeExplorer(lookColors(), save.equipped); env.scene.add(hero);
  const guide = makeGuide(); guide.position.set(-1.8, 0, -1.2); guide.rotation.y = 0.7; env.scene.add(guide);
  if (envKey === 'harbour') riseLanterns(env, 40);
  function update(dt, t) {
    const a = t * 0.07;
    ctx.camera.position.set(Math.sin(a) * 9, 3.2 + Math.sin(t * 0.2) * 0.3, Math.cos(a) * 9);
    ctx.camera.lookAt(0, 1.6, 0);
    hero.rotation.y = a * 0.5;
    animate(hero, 'idle', dt); animate(guide, 'idle', dt);
    env.follow(new THREE.Vector3()); env.update(dt, t, ctx.camera);
  }
  return { scene: env.scene, env, update, dispose() {} };
}

// ── the dressing room: the explorer on a turntable, rebuilt when the look or gear changes ─
export function createDressingRoom(ctx) {
  const env = buildEnv('oasis');
  const { scene } = env;
  scene.fog.near = 30; scene.fog.far = 120;
  scene.add(mesh(new THREE.CylinderGeometry(2.2, 2.4, 0.4, 40), mat('#e8d7b8'), { y: -0.2, receive: true }));
  scene.add(mesh(new THREE.TorusGeometry(2.2, 0.06, 8, 48), mat('#f3c66d'), { y: 0.01, rx: Math.PI / 2 }));
  const back = PROPS.arch(rng(2), '#c9a26a'); back.position.set(0, 0, -4); back.scale.set(1.5, 1.2, 1); scene.add(back);
  for (const x of [-5, 5]) { const p = PROPS.palm(rng(x + 9)); p.position.set(x, 0, -5); scene.add(p); }
  scene.add(mesh(new THREE.CircleGeometry(80, 40), mat('#7fae5c'), { rx: -Math.PI / 2, y: -0.4, receive: true, cast: false }));
  let hero = null, spin = 0, wave = 1.5;
  function rebuild() {
    if (hero) scene.remove(hero);
    hero = makeExplorer(lookColors(), save.equipped); scene.add(hero); wave = 1.5;
  }
  rebuild();
  function update(dt, t) {
    spin += dt * 0.5;
    hero.rotation.y = Math.sin(spin) * 0.9;
    wave -= dt; animate(hero, wave > 0 ? 'wave' : 'idle', dt);
    const narrow = innerWidth < 760;
    // a phone shows the explorer above the panel; a wide screen shows them left of it
    ctx.camera.position.set(narrow ? 0 : 1.9, narrow ? 1.4 : 1.8, narrow ? 7.4 : 5.6);
    ctx.camera.lookAt(narrow ? 0 : 1.9, narrow ? -1.1 : 1.25, 0);
    env.follow(new THREE.Vector3()); env.update(dt, t, ctx.camera);
  }
  return { scene, env, update, rebuild, dispose() {} };
}
