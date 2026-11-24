// Noor Trail (demo): an endless runner. Swipe or use the arrow keys: left/right to change lane, up to jump, down to slide.
// Collect the golden eight-pointed stars; avoid the carts, jars, rails and banners.
// Two graphics settings: HD (shadows, glow, sharper) and Lite (for older laptops and phones). HD drops to Lite by itself
// if the game runs slowly.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { makeRunner } from './character.mjs';
import { createWorld, bend, LANE } from './world.mjs';

const OUTFITS = ['#2F8F6B', '#3E7CB1', '#F4EFE3', '#B5523B', '#7A5BA8', '#D9A441'];
const PACKS = ['#C0392B', '#8A5A2B', '#2E6E9E', '#3C8D5A', '#E0A526', '#5B4B8A'];
const KEY = 'noor-trail';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) ?? {}; } catch { return {}; } };
const save = (v) => { try { localStorage.setItem(KEY, JSON.stringify({ ...load(), ...v })); } catch {} };

// ---------- sound (made on the fly, nothing to download) ----------
let ac = null;
function beep(f0, f1, dur, type = 'sine', vol = 0.12, delay = 0) {
  if (!ac) return;
  const t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.02);
}
const SFX = {
  star: () => { beep(1046, 1046, 0.09, 'sine', 0.08); beep(1568, 1568, 0.14, 'sine', 0.07, 0.06); },
  jump: () => beep(320, 640, 0.18, 'triangle', 0.08),
  slide: () => beep(420, 180, 0.22, 'sawtooth', 0.03),
  lane: () => beep(700, 760, 0.05, 'triangle', 0.03),
  hit: () => { beep(200, 60, 0.4, 'square', 0.08); beep(90, 40, 0.5, 'sine', 0.2); },
};

export function startRunner(root) {
  const $ = (id) => root.querySelector(`#${id}`);
  const canvas = $('rn-canvas');
  const pref = load();
  let quality = pref.quality ?? (matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency ?? 8) <= 4 ? 'lite' : 'hd');
  let soundOn = pref.sound !== false;

  // ---------- renderer, scene, lights ----------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.35;
  const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 900);
  const hemi = new THREE.HemisphereLight('#CFE0FF', '#C99A6A', 0.8); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#FFD3A0', 3.0); scene.add(sun, sun.target);
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 120 });

  const world = createWorld(scene, { lite: quality === 'lite' });
  let runner = null;
  function dress() {
    const p = load();
    if (runner) { scene.remove(runner.root); runner.dispose(); }
    runner = makeRunner({ girl: p.girl ?? false, outfit: OUTFITS[p.outfit ?? 0], pack: PACKS[p.outfit ?? 0], skin: ['#F2D3B3', '#D9A97E', '#B07A50', '#7A4E2E'][p.skin ?? 1] }, bend);
    scene.add(runner.root); runner.root.position.set(player.x, player.y, player.z);
  }

  // ---------- post-processing (HD only) ----------
  const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.35, 0.4, 0.95); composer.addPass(bloom);
  composer.addPass(new OutputPass());

  function applyQuality() {
    const hd = quality === 'hd';
    renderer.setPixelRatio(Math.min(devicePixelRatio, hd ? 2 : 1.25));
    renderer.shadowMap.enabled = hd; sun.castShadow = hd;
    scene.traverse((o) => { if (o.material) for (const m of [].concat(o.material)) m.needsUpdate = true; });
    root.querySelectorAll('[data-q]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.q === quality)));
    resize();
  }
  function resize() {
    const w = root.clientWidth, h = root.clientHeight;
    renderer.setSize(w, h, false);
    composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h);
    camera.aspect = w / h; camera.fov = w / h < 0.8 ? 76 : 62; camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize);

  // ---------- game state ----------
  const player = { lane: 0, x: 0, y: 0, vy: 0, z: 0, slide: 0, speed: 0 };
  let state = 'title', dist = 0, starsGot = 0, runTime = 0, fallT = 0, best = pref.best ?? 0;
  const camPos = new THREE.Vector3(1.8, 1.6, -4), camLook = new THREE.Vector3(0, 1, 0);

  function newRun() {
    Object.assign(player, { lane: 0, x: 0, y: 0, vy: 0, z: 0, slide: 0, speed: 12 });
    dist = 0; starsGot = 0; runTime = 0; fallT = 0;
    world.reset((Math.random() * 1e9) | 0);
    runner.root.position.set(0, 0, 0);
  }
  function show(id) { for (const p of ['rn-title', 'rn-over', 'rn-paused']) $(p).hidden = p !== id; $('rn-hud').hidden = !(state === 'run' || state === 'paused'); }
  function go() {
    if (!ac && soundOn) { try { ac = new AudioContext(); } catch {} }
    ac?.resume?.();
    if (state === 'over') newRun();
    state = 'run'; show(null); perf.reset();
    canvas.focus?.();
  }
  function pause(on) {
    if (on && state === 'run') { state = 'paused'; show('rn-paused'); }
    else if (!on && state === 'paused') { state = 'run'; show(null); clock.getDelta(); }
  }
  function over() {
    state = 'fall'; fallT = 0; play('hit');
    if (navigator.vibrate) try { navigator.vibrate(120); } catch {}
  }
  function finish() {
    state = 'over';
    const m = Math.floor(dist);
    if (m > best) { best = m; save({ best }); }
    $('rn-over-dist').textContent = m; $('rn-over-stars').textContent = starsGot; $('rn-over-best').textContent = best;
    show('rn-over');
  }
  const play = (k) => { if (soundOn && ac) SFX[k](); };

  // ---------- input ----------
  function act(a) {
    if (state === 'title' || state === 'over') { if (a === 'go') go(); return; }
    if (state !== 'run') return;
    if (a === 'left' && player.lane > -1) { player.lane--; play('lane'); }
    else if (a === 'right' && player.lane < 1) { player.lane++; play('lane'); }
    else if ((a === 'up' || a === 'go') && player.y <= 0.001) { player.vy = 9.6; player.slide = 0; play('jump'); }
    else if (a === 'down') { if (player.y > 0.001) player.vy = -16; player.slide = 0.75; play('slide'); }
  }
  addEventListener('keydown', (e) => {
    if (e.target.closest?.('button, input')) { if (e.key !== ' ') return; }
    const map = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ' ': 'go', Enter: 'go' };
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') { pause(state === 'run'); return; }
    if (map[e.key]) { e.preventDefault(); if (state === 'paused') pause(false); else act(map[e.key]); }
  });
  let touch = null;
  canvas.addEventListener('pointerdown', (e) => { touch = { x: e.clientX, y: e.clientY, used: false }; });
  canvas.addEventListener('pointermove', (e) => {
    if (!touch || touch.used) return;
    const dx = e.clientX - touch.x, dy = e.clientY - touch.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 28) return;
    touch.used = true;
    act(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy < 0 ? 'up' : 'down');
  });
  canvas.addEventListener('pointerup', () => { if (touch && !touch.used && (state === 'title' || state === 'over')) act('go'); touch = null; });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(true); });

  // ---------- buttons ----------
  root.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.act === 'go') go();
    else if (b.dataset.act === 'pause') pause(true);
    else if (b.dataset.act === 'resume') pause(false);
    else if (b.dataset.act === 'menu') { state = 'title'; newRun(); show('rn-title'); }
    else if (b.dataset.q) { quality = b.dataset.q; save({ quality }); applyQuality(); }
    else if (b.dataset.act === 'sound') { soundOn = !soundOn; save({ sound: soundOn }); b.setAttribute('aria-pressed', String(soundOn)); if (soundOn && !ac) try { ac = new AudioContext(); } catch {} }
    else if (b.dataset.act === 'full') { const d = document; d.fullscreenElement ? d.exitFullscreen() : root.requestFullscreen?.().catch(() => {}); }
    else if (b.dataset.who) { save({ girl: b.dataset.who === 'girl' }); markChoices(); dress(); }
    else if (b.dataset.outfit) { save({ outfit: +b.dataset.outfit }); markChoices(); dress(); }
  });
  function markChoices() {
    const p = load();
    root.querySelectorAll('[data-who]').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.who === 'girl') === !!p.girl)));
    root.querySelectorAll('[data-outfit]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.outfit === (p.outfit ?? 0))));
  }
  const sw = $('rn-outfits');
  OUTFITS.forEach((c, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'sw'; b.dataset.outfit = i; b.style.background = c; b.setAttribute('aria-label', `Outfit ${i + 1}`); sw.append(b); });
  $('rn-sound').setAttribute('aria-pressed', String(soundOn));
  markChoices();

  // ---------- speed check: HD drops to Lite if the first seconds run slowly ----------
  const perf = { t: 0, n: 0, done: false, reset() { this.t = 0; this.n = 0; this.done = false; } };
  function toast(msg) { const t = $('rn-toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => (t.hidden = true), 3200); }

  // ---------- main loop ----------
  const clock = new THREE.Clock();
  let t = 0;
  const hit = (o) => {
    const px0 = player.x - 0.3, px1 = player.x + 0.3;
    if (player.z - 0.3 > o.z1 || player.z + 0.3 < o.z0 || px1 < o.x0 || px0 > o.x1) return false;
    if (o.kind === 'low') return player.y < 0.62;
    if (o.kind === 'high') return player.slide <= 0;
    return true;
  };
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    t += dt;
    let mode = 'idle';
    if (state === 'run') {
      runTime += dt;
      player.speed = Math.min(27, 12 + runTime * 0.16);
      player.z -= player.speed * dt; dist += player.speed * dt;
      player.x += (player.lane * LANE - player.x) * (1 - Math.exp(-dt * 14));
      if (player.y > 0 || player.vy > 0) { player.vy -= 28 * dt; player.y = Math.max(0, player.y + player.vy * dt); if (player.y === 0) player.vy = 0; }
      if (player.slide > 0) player.slide -= dt;
      mode = player.y > 0.02 ? 'jump' : player.slide > 0 ? 'slide' : 'run';
      for (const o of world.obstacles()) if (hit(o)) { over(); break; }
      const top = player.y + (player.slide > 0 ? 0.9 : 1.6);
      for (const s of world.stars()) {
        if (s.alive && Math.abs(s.z - player.z) < 0.9 && Math.abs(s.x - player.x) < 0.9 && s.y > player.y - 0.3 && s.y < top) { s.alive = false; starsGot++; play('star'); $('rn-stars').textContent = starsGot; }
      }
      $('rn-dist').textContent = Math.floor(dist);
      if (quality === 'hd' && !perf.done) { perf.t += dt; perf.n++; if (perf.t > 4) { perf.done = true; if (perf.n / perf.t < 40) { quality = 'lite'; save({ quality }); applyQuality(); toast('Switched to Lite graphics for smoother play'); } } }
    } else if (state === 'fall') {
      fallT += dt; mode = 'fall';
      player.z += Math.max(0, 3 - fallT * 8) * dt; // bounce back off the obstacle
      if (fallT > 1.3) finish();
    } else if (state === 'over') mode = 'fall';
    else if (state === 'paused') mode = 'none';

    const difficulty = Math.min(1, dist / 1500);
    world.update(player.z, t, difficulty);
    if (mode !== 'none') runner.update(dt, mode, player.speed);
    runner.root.position.set(player.x, player.y, player.z);
    runner.root.rotation.y = state === 'title' ? Math.sin(t * 0.5) * 0.35 : 0;

    // camera: in front of the runner on the title screen, behind and above while running
    const tp = new THREE.Vector3(), tl = new THREE.Vector3();
    if (state === 'title') { if (camera.aspect < 0.8) { tp.set(0.9, 0.9, player.z - 4.6); tl.set(0, 0.25, player.z); } else { tp.set(1.4, 1.45, player.z - 3.6); tl.set(0, 0.95, player.z); } }
    else { tp.set(player.x * 0.55, 3.0 + player.y * 0.35 - (player.slide > 0 ? 0.35 : 0), player.z + 6.3); tl.set(player.x * 0.75, 1.25 + player.y * 0.3, player.z - 8); }
    const k = 1 - Math.exp(-dt * (state === 'title' ? 3 : 7));
    camPos.lerp(tp, k); camLook.lerp(tl, k);
    camera.position.copy(camPos); camera.lookAt(camLook);

    // the sun follows the runner so the shadows stay sharp around them
    sun.position.set(player.x - 16, 30, player.z - 32); sun.target.position.set(player.x, 0, player.z - 6);

    if (quality === 'hd') composer.render(); else renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  dress();
  newRun();
  applyQuality();
  show('rn-title');
  $('rn-best').textContent = best ? `Best: ${best} m` : '';
  requestAnimationFrame(frame);
}
