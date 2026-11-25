// Noor Trail: Ta'aleem's treasure-hunt runner. Six lands, five stages each (src/lib/runner/content.mjs), a different
// Sheikh or Ustadh guiding every stage, zombie spiders, and a shield of light raised by saying "SubhanAllah" aloud
// (heard on the device by Ta'aleem's own tracker, src/lib/games/dhikr.mjs: the audio never leaves it).
// Powers are bought with Garden points (src/lib/runner/garden.mjs). Progress is kept in the student's progress
// (progress.trail), saved to the admin sheet like every other activity; a finished stage adds to the weekly
// leaderboard ("trail", or "games" until the Apps Script knows "trail") and grows a flower in My Garden.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { makeRunner } from './character.mjs';
import { makeSpider } from './spider.mjs';
import { createWorld, bend, LANE, SEG } from './world.mjs';
import { STAGES, LANDS, GUIDES, POWERS, QUEST, TIPS, TITLE } from './content.mjs';
import { guideSVG } from './guides.mjs';
import { gardenPoints, trailOf, GARDEN_RULES } from './garden.mjs';
import { configure, getProgress, saveProgress, boardAdd } from '../classlog.mjs';
import { record } from '../rewards.mjs';

const OUTFITS = ['#2F8F6B', '#3E7CB1', '#F4EFE3', '#B5523B', '#7A5BA8', '#D9A441'];
const PACKS = ['#C0392B', '#8A5A2B', '#2E6E9E', '#3C8D5A', '#E0A526', '#5B4B8A'];
const SKINS = ['#F2D3B3', '#D9A97E', '#B07A50', '#7A4E2E'];
const UPGRADES = new Set(['shield-plus', 'star-magnet', 'treasure-finder']);   // kept for good; the rest are used up
const SPIDER_RATE = { few: 0.12, some: 0.25, many: 0.4, swarm: 0.55 };
const LOCAL = 'noor-trail';
// ?quick on the local preview only: short stages and every stage open, for testing
const QUICK = import.meta.env?.DEV && typeof location !== 'undefined' && new URLSearchParams(location.search).has('quick');
const loadLocal = () => { try { return JSON.parse(localStorage.getItem(LOCAL)) ?? {}; } catch { return {}; } };
const saveLocal = (v) => { try { localStorage.setItem(LOCAL, JSON.stringify({ ...loadLocal(), ...v })); } catch {} };

// ---------- sound, made on the fly ----------
let ac = null;
function beep(f0, f1, dur, type = 'sine', vol = 0.12, delay = 0) {
  if (!ac) return;
  const t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.02);
}
const SFX = {
  star: () => { beep(1046, 1046, 0.09, 'sine', 0.07); beep(1568, 1568, 0.14, 'sine', 0.06, 0.06); },
  treasure: () => [523, 659, 784, 1046].forEach((f, i) => beep(f, f, 0.25, 'triangle', 0.1, i * 0.09)),
  jump: () => beep(320, 640, 0.18, 'triangle', 0.07),
  slide: () => beep(420, 180, 0.22, 'sawtooth', 0.03),
  lane: () => beep(700, 760, 0.05, 'triangle', 0.025),
  hit: () => { beep(200, 60, 0.4, 'square', 0.07); beep(90, 40, 0.5, 'sine', 0.18); },
  shield: () => [392, 523, 659, 784, 1046].forEach((f, i) => beep(f, f * 1.01, 0.5, 'sine', 0.08, i * 0.06)),
  knock: () => { beep(900, 200, 0.25, 'square', 0.05); beep(300, 1200, 0.15, 'sine', 0.06, 0.05); },
  win: () => [523, 659, 784, 1046, 1318].forEach((f, i) => beep(f, f, 0.4, 'triangle', 0.1, i * 0.12)),
  check: () => [659, 988].forEach((f, i) => beep(f, f, 0.3, 'sine', 0.08, i * 0.1)),
  growl: () => beep(80, 50, 0.6, 'sawtooth', 0.05),
};

const h = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (k === 'class') e.className = v; else if (k === 'html') e.innerHTML = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else if (v != null && v !== false) e.setAttribute(k, v === true ? '' : v); }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c)));
  return e;
};
const guideOf = (st) => GUIDES[st.guide] ?? Object.values(GUIDES)[0];
const fmtMin = (m) => `${Math.round(m)} min`;

export async function startTrail(root, { base = '/' } = {}) {
  const $ = (id) => root.querySelector(`#${id}`);
  const canvas = $('tr-canvas');
  const local = loadLocal();
  let quality = local.quality ?? (matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency ?? 8) <= 4 ? 'lite' : 'hd');
  let soundOn = local.sound !== false;

  // ---------- who is playing: the student handed over by the Classroom (this tab only), or a guest ----------
  let me = null;
  try { me = JSON.parse(sessionStorage.getItem('trail-me') || 'null'); } catch {}
  if (me?.url) configure(me.url);
  let progress = me?.token ? await getProgress({ token: me.token, username: me.username }) : (local.guestProgress ?? {});
  const trail = () => trailOf(progress);
  const garden = () => (me ? gardenPoints(progress, me.palms ?? 0) : 0) + (local.bonus ?? 0);
  const wallet = () => Math.max(0, garden() - trail().spent);
  async function persist() {
    if (me?.token) await saveProgress({ token: me.token, username: me.username, progress });
    else saveLocal({ guestProgress: progress });
  }

  // ---------- renderer and scene ----------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const roomEnv = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 900);
  const hemi = new THREE.HemisphereLight('#CFE0FF', '#C99A6A', 0.8); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#FFD3A0', 3.0); scene.add(sun, sun.target);
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 120 });
  const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.4, 0.45, 0.92); composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // the shield of light: a soft golden bubble around the runner
  const shieldMesh = new THREE.Mesh(new THREE.SphereGeometry(1.15, 32, 20), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { t: { value: 0 }, a: { value: 1 } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; varying vec3 vP; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.0); vV = normalize(-mv.xyz); vP = position; gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform float t, a; varying vec3 vN; varying vec3 vV; varying vec3 vP; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 2.2); float bands = 0.5 + 0.5 * sin(vP.y * 14.0 - t * 5.0); vec3 c = vec3(1.0, 0.78, 0.32) * (f * 1.6 + bands * 0.06); gl_FragColor = vec4(c * a, (f * 0.9 + 0.05) * a); }',
  }));
  shieldMesh.visible = false; scene.add(shieldMesh);

  // ---------- assets (downloaded CC0 textures, sky lighting and props; the game works without them) ----------
  const assetBase = `${base}play/trail/assets/`;
  let manifest = null;
  try { const r = await fetch(assetBase + 'manifest.json'); if (r.ok) manifest = await r.json(); } catch {}
  const texCache = new Map(), modelCache = new Map(), hdrCache = new Map();
  const texLoader = new THREE.TextureLoader();
  const gltf = new GLTFLoader(); gltf.setMeshoptDecoder(MeshoptDecoder);
  const loadTex = (file, srgb) => {
    const key = file + srgb;
    if (!texCache.has(key)) texCache.set(key, new Promise((res) => texLoader.load(assetBase + file, (t) => { if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; res(t); }, undefined, () => res(null))));
    return texCache.get(key);
  };
  async function assetsFor(theme) {
    if (!manifest) return null;
    const keys = ['path', 'wall', 'sand', 'wood', 'clay', 'rock', 'marble', 'grass'];
    const tex = {};
    await Promise.all(keys.map(async (k) => {
      const m = manifest.tex?.[k]; if (!m) return;
      const [map, normalMap, roughnessMap] = await Promise.all([loadTex(m.diff, true), m.nor ? loadTex(m.nor, false) : null, (m.rough ?? m.arm) ? loadTex(m.rough ?? m.arm, false) : null]);
      if (map) tex[k] = { map, normalMap, roughnessMap };
    }));
    const models = {};
    if (quality === 'hd' || true) await Promise.all(Object.entries(manifest.models ?? {}).filter(([, m]) => !m.lands || m.lands.includes(theme)).map(async ([k, m]) => {
      if (!modelCache.has(k)) modelCache.set(k, gltf.loadAsync(assetBase + m.file).then((g) => { g.scene.traverse((c) => { if (c.isMesh) for (const mm of [].concat(c.material)) bend(mm); }); return g.scene; }).catch(() => null));
      const sc = await modelCache.get(k); if (sc) models[k] = { scene: sc, meta: m };
    }));
    let env = null;
    const hd = manifest.hdri?.[theme];
    if (hd) {
      if (!hdrCache.has(theme)) hdrCache.set(theme, new HDRLoader().loadAsync(assetBase + hd.file).then((t) => { t.mapping = THREE.EquirectangularReflectionMapping; const e = pmrem.fromEquirectangular(t).texture; t.dispose(); return e; }).catch(() => null));
      env = await hdrCache.get(theme);
    }
    return { tex, models, env };
  }

  // ---------- quality ----------
  function applyQuality() {
    const hd = quality === 'hd';
    renderer.setPixelRatio(Math.min(devicePixelRatio, hd ? 2 : 1.25));
    renderer.shadowMap.enabled = hd; sun.castShadow = hd;
    scene.traverse((o) => { if (o.material) for (const m of [].concat(o.material)) m.needsUpdate = true; });
    root.querySelectorAll('[data-q]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.q === quality)));
    resize();
  }
  function resize() {
    const w = root.clientWidth, hh = root.clientHeight;
    renderer.setSize(w, hh, false);
    composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, hh);
    camera.aspect = w / hh; camera.fov = w / hh < 0.8 ? 76 : 62; camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize);

  // ---------- the runner ----------
  let runner = null;
  function dress() {
    const l = loadLocal();
    if (runner) { scene.remove(runner.root); runner.dispose(); }
    runner = makeRunner({ girl: l.girl ?? /^(f|female|girl)$/.test(me?.gender ?? ''), outfit: OUTFITS[l.outfit ?? 0], pack: PACKS[l.outfit ?? 0], skin: SKINS[l.skin ?? 1] }, bend);
    scene.add(runner.root);
  }

  // ---------- one stage ----------
  let world = null, stage = null, run = null, state = 'loading';
  const player = { lane: 0, x: 0, y: 0, vy: 0, z: 0, slide: 0, speed: 0 };
  let chaser = null, queen = null;
  const camPos = new THREE.Vector3(1.8, 1.6, -4), camLook = new THREE.Vector3(0, 1, 0);
  let shake = 0;

  const speedAt = (t, d) => Math.min(15 + 9 * d, 10 + 5 * d + t * 0.12);
  function metresFor(st) { let m = 0; for (let t = 0; t < st.minutes * 60; t++) m += speedAt(t, st.difficulty); return Math.round(m * (QUICK ? 0.1 : 1)); }
  const ownedLevel = (id) => trail().powers[id] ?? 0;

  async function loadStage(st, fromCheckpoint = null) {
    stage = st; state = 'loading'; show('tr-loading');
    $('tr-tip').textContent = TIPS[Math.floor(Math.random() * TIPS.length)];
    const land = st.land;
    const assets = await assetsFor(land);
    world?.dispose();
    world = createWorld(scene, { lite: quality === 'lite', theme: land, assets, makeSpider });
    const TH = world.theme;
    scene.environment = assets?.env ?? roomEnv; scene.environmentIntensity = assets?.env ? (land === 'caves' ? 0.25 : 0.55) : 0.35;
    hemi.color.set(TH.hemi[0]); hemi.groundColor.set(TH.hemi[1]); hemi.intensity = TH.hemi[2];
    sun.color.set(TH.sun.color); sun.intensity = TH.sun.i; renderer.toneMappingExposure = TH.exposure;
    const metres = metresFor(st), g = st.goal;
    const nT = g.treasures ?? 0;
    const plan = {
      endZ: -metres,
      checkpointZ: [1 / 3, 2 / 3].map((f) => -Math.round(metres * f / SEG) * SEG - 10),
      treasureZ: Array.from({ length: nT }, (_, i) => -Math.round(metres * (0.08 + (0.84 * (i + 1)) / (nT + 1)))),
      difficulty: st.difficulty,
      spiderRate: st.id === '1-1' ? 0 : SPIDER_RATE[g.spiders] ?? 0.2,
      swarm: g.type === 'boss',
    };
    const from = fromCheckpoint ? Math.max(0, Math.round(-fromCheckpoint / SEG) - 1) : 0;
    world.start(plan, (Math.random() * 1e9) | 0, from);
    const keep = run && fromCheckpoint ? { treasures: run.treasures, stars: run.stars, lost: run.lost } : { treasures: 0, stars: 0, lost: 0 };
    run = {
      st, plan, metres, need: nT, ...keep, t: 0,
      maxHearts: QUICK ? 30 : 3, hearts: QUICK ? 30 : 3, inv: 0, shieldT: 0, shieldCool: 0, listening: null, mic: null,
      slowT: 0, doubleT: 0, hints: new Set(), spiderHint: false, cp: fromCheckpoint, chaserGap: 10, chaserOn: !!g.chaser,
      boss: g.type === 'boss', bossDown: false, bossZ: 0, finished: false,
    };
    if (trail().items['extra-heart'] > 0) { trail().items['extra-heart']--; run.hearts = run.maxHearts = 4; run.usedHeart = true; }
    Object.assign(player, { lane: 0, x: 0, y: 0, vy: 0, z: -from * SEG, slide: 0, speed: speedAt(0, st.difficulty) });
    runner.root.position.set(0, 0, player.z);
    camPos.set(0, 3, player.z + 8); camLook.set(0, 1, player.z - 8);
    // the giant chaser behind, and the boss ahead
    if (!chaser) { chaser = makeSpider(bend, { scale: 2.4 }); scene.add(chaser.root); }
    if (!queen) { queen = makeSpider(bend, { scale: 3.4 }); scene.add(queen.root); }
    chaser.root.visible = false; queen.root.visible = run.boss; queen.alive = true; queen.dead = 0; queen.root.rotation.set(0, 0, 0);
    run.bossZ = player.z - 40;
    applyQuality();
    hud();
    if (!run.cp) brief(); else { state = 'run'; show(null); clock.getDelta(); toast('Back at the checkpoint. Bismillah!'); }
    // start the listener loading while the student reads the brief
    import('../games/dhikr.mjs').then((D) => D.warmListening()).then((ok) => { if (run) run.mic = ok ? 'ready' : 'none'; hud(); }).catch(() => { if (run) run.mic = 'none'; });
  }

  // ---------- screens ----------
  const screens = ['tr-loading', 'tr-map', 'tr-brief', 'tr-win', 'tr-lose', 'tr-pause', 'tr-shop', 'tr-story', 'tr-look'];
  function show(id) {
    for (const s of screens) $(s).hidden = s !== id;
    $('tr-hud').hidden = !(state === 'run' || state === 'paused' || state === 'fall');
  }
  function guideCard(st, text, talking = true) {
    const gd = guideOf(st);
    return h('div', { class: 'gcard' }, h('div', { class: 'gface', html: guideSVG(gd.look, { size: 96, talking }) }),
      h('div', {}, h('b', { class: 'gname' }, gd.name), gd.trait ? h('span', { class: 'gtrait' }, gd.trait) : null, h('p', {}, text)));
  }

  function openMap() {
    state = 'map'; world && (runner.root.visible = true);
    const tr = trail(), list = $('tr-lands'); list.replaceChildren();
    let unlockedUpTo = 0;
    STAGES.forEach((s, i) => { if (i === 0 || QUICK || tr.stages[STAGES[i - 1].id]?.done) unlockedUpTo = i; });
    const totalStars = Object.values(tr.stages).reduce((a, x) => a + (x.stars ?? 0), 0);
    $('tr-map-stats').textContent = `${Object.values(tr.stages).filter((x) => x.done).length} of ${STAGES.length} stages · ${totalStars} of ${STAGES.length * 3} stars · ${wallet()} Garden points to spend`;
    for (const land of LANDS) {
      const ls = STAGES.filter((s) => s.land === land.id);
      const firstIdx = STAGES.indexOf(ls[0]), open = firstIdx <= unlockedUpTo, done = ls.every((s) => tr.stages[s.id]?.done);
      const card = h('section', { class: `land land-${land.id}${open ? '' : ' locked'}` },
        h('header', {}, h('span', { class: 'ln' }, `Land ${land.n}`), h('h3', {}, land.name), done ? h('span', { class: 'piece' }, '🗺️ map piece found') : null),
        h('p', { class: 'tag' }, open ? land.tagline : 'Finish the land before to open this one.'),
        h('div', { class: 'nodes' }, ls.map((s) => {
          const i = STAGES.indexOf(s), rec = tr.stages[s.id], can = i <= unlockedUpTo, gd = guideOf(s);
          return h('button', { class: `node${s.goal.type === 'boss' ? ' boss' : ''}${rec?.done ? ' done' : ''}`, type: 'button', disabled: !can, title: `${s.name} · ${gd.name}`, onclick: () => { loadStage(s); } },
            h('span', { class: 'nn' }, s.goal.type === 'boss' ? '👑' : s.n), h('span', { class: 'ns' }, '★'.repeat(rec?.stars ?? 0) + '☆'.repeat(3 - (rec?.stars ?? 0))),
            h('span', { class: 'nt' }, s.name));
        })));
      list.append(card);
    }
    show('tr-map');
    if (!tr.seen.intro) story(QUEST.intro, 'The quest begins', () => { tr.seen.intro = 1; persist(); openMap(); });
  }
  function story(paras, title, next) {
    $('tr-story-h').textContent = title;
    $('tr-story-body').replaceChildren(...paras.map((p) => h('p', {}, p)));
    $('tr-story-go').onclick = next; state = 'story'; show('tr-story');
  }
  function brief() {
    state = 'brief';
    const st = stage, g = st.goal, land = LANDS.find((l) => l.id === st.land);
    $('tr-brief-h').textContent = `${land.name} · Stage ${st.n}: ${st.name}`;
    const goals = [`Run about ${fmtMin(st.minutes)} to the ${g.type === 'boss' ? 'boss at the golden gate' : 'golden gate'}`];
    if (run.need) goals.push(`Find ${run.need === 1 ? '' : run.need + ' '}${st.item?.name ?? 'treasures'} ${st.item?.icon ?? ''}`);
    goals.push(g.spiders === 'swarm' ? 'A swarm of zombie spiders!' : `Zombie spiders: ${g.spiders}`);
    if (g.chaser) goals.push('A giant spider is chasing you. Do not slow down!');
    if (g.type === 'boss') goals.push('Reach the boss with your shield of light on to knock it away.');
    $('tr-brief-body').replaceChildren(guideCard(st, st.brief), h('ul', { class: 'goals' }, goals.map((x) => h('li', {}, x))),
      h('p', { class: 'muted' }, 'Shield: say "SubhanAllah" (Glory be to Allah) out loud, or press Q / the shield button.'));
    show('tr-brief');
  }
  function go() {
    if (!ac && soundOn) { try { ac = new AudioContext(); } catch {} }
    ac?.resume?.();
    state = 'run'; show(null); clock.getDelta(); perf.reset();
  }

  // ---------- the HUD ----------
  function hud() {
    if (!run) return;
    $('tr-hearts').textContent = '❤️'.repeat(Math.max(0, run.hearts)) + '🤍'.repeat(Math.max(0, run.maxHearts - run.hearts));
    $('tr-stars').textContent = run.stars;
    $('tr-tre').hidden = !run.need; $('tr-tre').textContent = `${run.st.item?.icon ?? '💎'} ${run.treasures}/${run.need}`;
    const pb = $('tr-shield');
    pb.dataset.state = run.shieldT > 0 ? 'on' : run.listening ? 'listening' : run.shieldCool > 0 ? 'cool' : 'ready';
    pb.querySelector('b').textContent = run.shieldT > 0 ? `Shield ${Math.ceil(run.shieldT)}s` : run.listening ? 'Listening… say SubhanAllah' : run.shieldCool > 0 ? 'Recharging…' : run.mic === 'none' ? 'Say SubhanAllah, then tap' : 'Say “SubhanAllah”';
    const it = trail().items;
    $('tr-p2').hidden = !(it['double-stars'] > 0); $('tr-p2').querySelector('i').textContent = it['double-stars'] ?? 0;
    $('tr-p3').hidden = !(it['slow-time'] > 0); $('tr-p3').querySelector('i').textContent = it['slow-time'] ?? 0;
  }
  function progressBar() {
    const f = Math.max(0, Math.min(1, -player.z / run.metres));
    $('tr-bar-fill').style.width = `${(f * 100).toFixed(1)}%`;
    for (const [i, cz] of run.plan.checkpointZ.entries()) $(`tr-cp${i}`).style.left = `${(-cz / run.metres * 100).toFixed(1)}%`;
    return f;
  }
  let hintTimer = 0;
  function hint(text, ms = 5200) {
    const b = $('tr-hint'); b.replaceChildren(guideCard(stage, text)); b.hidden = false; b.classList.remove('out');
    clearTimeout(hintTimer); hintTimer = setTimeout(() => { b.classList.add('out'); setTimeout(() => (b.hidden = true), 400); }, ms);
  }
  function toast(msg) { const t = $('tr-toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => (t.hidden = true), 2600); }

  // ---------- the shield of light ----------
  async function askShield() {
    if (!run || state !== 'run' || run.shieldT > 0 || run.listening || run.shieldCool > 0) return;
    if (!ac && soundOn) { try { ac = new AudioContext(); } catch {} }
    if (run.mic === 'none') { raiseShield(); return; }   // no microphone here: the student says it aloud, then taps
    const D = await import('../games/dhikr.mjs');
    run.listening = D.listenFor('subhanallah', { ms: 5000, onState: () => hud() });
    hud();
    const res = await run.listening.finished;
    if (!run) return;
    run.listening = null;
    if (res === 'ok') { run.heard = true; raiseShield(); }
    else if (res === 'unavailable' || res === 'denied') { run.mic = 'none'; toast(res === 'denied' ? 'The microphone is off. Say SubhanAllah aloud, then tap the shield.' : 'No microphone here. Say SubhanAllah aloud, then tap the shield.'); }
    else if (res !== 'stopped') toast('Not quite. Say “Sub-ha-nal-lah” clearly and try again.');
    hud();
  }
  function raiseShield() {
    run.shieldT = 6 + 2 * ownedLevel('shield-plus'); run.shieldCool = 0;
    play('shield'); toast('SubhanAllah! Your shield of light is on.'); hud();
  }

  // ---------- input ----------
  function act(a) {
    if (state !== 'run') return;
    if (a === 'left' && player.lane > -1) { player.lane--; play('lane'); }
    else if (a === 'right' && player.lane < 1) { player.lane++; play('lane'); }
    else if (a === 'up' && player.y <= 0.001) { player.vy = 9.6; player.slide = 0; play('jump'); }
    else if (a === 'down') { if (player.y > 0.001) player.vy = -16; player.slide = 0.75; play('slide'); }
    else if (a === 'shield') askShield();
    else if (a === 'p2') usePower('double-stars');
    else if (a === 'p3') usePower('slow-time');
  }
  function usePower(id) {
    const it = trail().items; if (!(it[id] > 0)) return;
    it[id]--; if (id === 'double-stars') run.doubleT = 20; if (id === 'slow-time') run.slowT = 6;
    toast(id === 'double-stars' ? 'Double Stars for 20 seconds!' : 'Slow Steps: everything slows for a moment.'); play('check'); hud(); persist();
  }
  addEventListener('keydown', (e) => {
    if (e.target.closest?.('input')) return;
    const map = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'up', w: 'up', W: 'up', ' ': 'up', ArrowDown: 'down', s: 'down', S: 'down', q: 'shield', Q: 'shield', e: 'shield', E: 'shield', 2: 'p2', 3: 'p3' };
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') { pause(state === 'run'); return; }
    if (state === 'brief' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); go(); return; }
    if (map[e.key] && state === 'run') { e.preventDefault(); act(map[e.key]); }
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
  canvas.addEventListener('pointerup', () => { touch = null; });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(true); });
  function pause(on) {
    if (on && state === 'run') { state = 'paused'; run.listening?.stop(); show('tr-pause'); }
    else if (!on && state === 'paused') { state = 'run'; show(null); clock.getDelta(); }
  }

  // ---------- hits, losing and winning ----------
  function hurt(why) {
    if (run.inv > 0) return;
    run.hearts--; run.lost++; run.inv = 1.6; shake = 0.5; play('hit');
    player.speed *= 0.55;
    if (run.chaserOn) { run.chaserGap -= 4.5; play('growl'); }
    if (navigator.vibrate) try { navigator.vibrate(100); } catch {}
    if (run.hearts <= 0) {
      if (trail().items['second-chance'] > 0) { trail().items['second-chance']--; run.hearts = 1; toast('Second Chance! Keep going, you can do it.'); persist(); }
      else { state = 'fall'; run.fallT = 0; }
    } else toast(why === 'spider' ? 'Ouch, a zombie spider! Say SubhanAllah for your shield.' : 'Bump! Watch the path.');
    hud();
  }
  function lose() {
    state = 'lose';
    const st = stage, cp = run.plan.checkpointZ.filter((z) => z > player.z - 1).sort((a, b) => a - b)[0] ?? null;
    const reached = run.plan.checkpointZ.filter((z) => player.z <= z).sort((a, b) => a - b)[0] ?? null;
    $('tr-lose-body').replaceChildren(guideCard(st, st.lose, false));
    $('tr-lose-cp').hidden = !reached; $('tr-lose-cp').onclick = () => loadStage(st, reached);
    $('tr-lose-again').onclick = () => { run = null; loadStage(st); };
    void cp; show('tr-lose');
  }
  async function win() {
    state = 'won'; play('win');
    const st = stage, tr = trail();
    const allT = run.treasures >= run.need;
    const starsEarned = run.boss ? (run.lost === 0 ? 3 : run.lost <= 2 ? 2 : 1) : (allT && run.lost <= 1 ? 3 : allT ? 2 : 1);
    const prev = tr.stages[st.id] ?? {};
    tr.stages[st.id] = { done: true, stars: Math.max(prev.stars ?? 0, starsEarned), best: Math.max(prev.best ?? 0, run.stars), plays: (prev.plays ?? 0) + 1 };
    const earned = record(progress, { kind: 'game', key: `trail:${st.id}`, score: starsEarned, good: starsEarned === 3, gardenPalms: me?.palms ?? 0 });
    const land = LANDS.find((l) => l.id === st.land), landDone = STAGES.filter((s) => s.land === st.land).every((s) => tr.stages[s.id]?.done);
    $('tr-win-h').textContent = `Complete! ${st.name}`;
    $('tr-win-body').replaceChildren(
      h('div', { class: 'bigstars' }, '★'.repeat(starsEarned) + '☆'.repeat(3 - starsEarned)),
      guideCard(st, st.win, false),
      h('div', { class: 'stats' }, h('div', {}, h('b', {}, run.stars), h('span', {}, 'stars collected')), run.need ? h('div', {}, h('b', {}, `${run.treasures}/${run.need}`), h('span', {}, st.item?.name ?? 'treasures')) : null, h('div', {}, h('b', {}, run.lost), h('span', {}, 'hearts lost'))),
      st.fact ? h('p', { class: 'fact' }, '🌙 ', st.fact) : null,
      earned?.stars ? h('p', { class: 'muted' }, `Your garden grew: +${earned.stars} Ta'aleem Stars and a new flower.`) : null,
      starsEarned < 3 ? h('p', { class: 'muted' }, run.boss ? 'Beat the boss without losing a heart for 3 stars.' : 'Find every treasure and lose no more than one heart for 3 stars.') : null);
    const next = STAGES[STAGES.indexOf(st) + 1];
    $('tr-win-next').hidden = !next; $('tr-win-next').onclick = () => { run = null; loadStage(next); };
    $('tr-win-map').onclick = () => { run = null; openMap(); };
    show('tr-win');
    const after = () => {};
    if (landDone && st.goal.type === 'boss') {
      setTimeout(() => story([land.treasure.text, ...(STAGES.at(-1) === st ? QUEST.ending : [])], land.treasure.name, () => show('tr-win')), 1800);
    }
    void after;
    await persist();
    if (me?.token) {
      const r = await boardAdd({ token: me.token, act: 'trail', good: starsEarned === 3 });
      if (r && r.ok === false && r.error === 'bad-request') boardAdd({ token: me.token, act: 'games', good: starsEarned === 3 });
    }
  }

  // ---------- the powers shop: spend Garden points ----------
  function openShop() {
    const back = state; state = 'shop';
    const list = $('tr-shop-list'); list.replaceChildren();
    $('tr-wallet').textContent = `${wallet()} Garden points to spend`;
    $('tr-shop-note').textContent = me ? `Your garden is worth ${garden()} points: ${GARDEN_RULES.map(([i, n, p]) => `${i} ${n} ${p}`).join(' · ')}. Learn on Ta'aleem to grow it.` : 'Sign in to Ta\'aleem and open Noor Trail from your home screen to spend your Garden points.';
    for (const p of POWERS) {
      const up = UPGRADES.has(p.id), have = up ? ownedLevel(p.id) : trail().items[p.id] ?? 0, full = have >= p.max, cant = wallet() < p.cost;
      list.append(h('div', { class: 'power' }, h('div', {}, h('b', {}, p.name), h('p', {}, p.text), h('span', { class: 'muted' }, up ? `Level ${have} of ${p.max}` : `You have ${have} (up to ${p.max})`)),
        h('button', { type: 'button', class: 'buy', disabled: full || cant, onclick: async () => {
          if (wallet() < p.cost) return;
          const tr = trail(); tr.spent += p.cost;
          if (up) tr.powers[p.id] = have + 1; else tr.items[p.id] = have + 1;
          play('check'); await persist(); openShop();
        } }, full ? 'Full' : `${p.cost} pts`)));
    }
    $('tr-shop-close').onclick = () => { if (back === 'map') openMap(); else { state = back; show(back === 'brief' ? 'tr-brief' : 'tr-map'); } };
    show('tr-shop');
  }

  // ---------- buttons ----------
  root.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const a = b.dataset.act;
    if (a === 'go') go();
    else if (a === 'map') { run?.listening?.stop(); run = null; openMap(); }
    else if (a === 'pause') pause(true);
    else if (a === 'resume') pause(false);
    else if (a === 'shop') openShop();
    else if (a === 'shield') askShield();
    else if (a === 'p2') usePower('double-stars');
    else if (a === 'p3') usePower('slow-time');
    else if (a === 'look') openLook();
    else if (a === 'look-done') openMap();
    else if (a === 'home') location.href = base;
    else if (b.dataset.q) { quality = b.dataset.q; saveLocal({ quality }); applyQuality(); }
    else if (a === 'sound') { soundOn = !soundOn; saveLocal({ sound: soundOn }); b.setAttribute('aria-pressed', String(soundOn)); if (soundOn && !ac) try { ac = new AudioContext(); } catch {} }
    else if (a === 'full') { const d = document; d.fullscreenElement ? d.exitFullscreen() : root.requestFullscreen?.().catch(() => {}); }
    else if (b.dataset.who) { saveLocal({ girl: b.dataset.who === 'girl' }); markLook(); dress(); }
    else if (b.dataset.outfit) { saveLocal({ outfit: +b.dataset.outfit }); markLook(); dress(); }
    else if (b.dataset.skin) { saveLocal({ skin: +b.dataset.skin }); markLook(); dress(); }
  });
  function openLook() { state = 'look'; markLook(); show('tr-look'); }
  function markLook() {
    const l = loadLocal(), girl = l.girl ?? /^(f|female|girl)$/.test(me?.gender ?? '');
    root.querySelectorAll('[data-who]').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.who === 'girl') === !!girl)));
    root.querySelectorAll('[data-outfit]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.outfit === (l.outfit ?? 0))));
    root.querySelectorAll('[data-skin]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.skin === (l.skin ?? 1))));
  }
  OUTFITS.forEach((c, i) => $('tr-outfits').append(h('button', { type: 'button', class: 'sw', 'data-outfit': i, style: `background:${c}`, 'aria-label': `Outfit ${i + 1}` })));
  SKINS.forEach((c, i) => $('tr-skins').append(h('button', { type: 'button', class: 'sw', 'data-skin': i, style: `background:${c}`, 'aria-label': `Skin tone ${i + 1}` })));
  $('tr-sound').setAttribute('aria-pressed', String(soundOn));
  $('tr-who').textContent = me ? `Assalamu alaykum, ${me.name}` : 'Playing as a guest: progress stays on this device.';
  const play = (k) => { if (soundOn && ac) SFX[k](); };

  // ---------- speed check: HD drops to Lite if the first seconds are slow ----------
  const perf = { t: 0, n: 0, done: false, reset() { this.t = 0; this.n = 0; this.done = false; } };

  // ---------- the main loop ----------
  const clock = new THREE.Clock();
  let t = 0;
  const box = (o) => {
    if (player.z - 0.3 > o.z1 || player.z + 0.3 < o.z0 || player.x + 0.3 < o.x0 || player.x - 0.3 > o.x1) return false;
    if (o.kind === 'low') return player.y < 0.62;
    if (o.kind === 'high') return player.slide <= 0;
    return true;
  };
  function step(dt) {
    run.t += dt;
    const d = stage.difficulty, slow = run.slowT > 0 ? 0.6 : 1;
    const target = speedAt(run.t, d) * slow;
    player.speed += (target - player.speed) * (1 - Math.exp(-dt * 1.5));
    player.z -= player.speed * dt;
    player.x += (player.lane * LANE - player.x) * (1 - Math.exp(-dt * 14));
    if (player.y > 0 || player.vy > 0) { player.vy -= 28 * dt; player.y = Math.max(0, player.y + player.vy * dt); if (player.y === 0) player.vy = 0; }
    if (player.slide > 0) player.slide -= dt;
    for (const k of ['inv', 'shieldT', 'shieldCool', 'slowT', 'doubleT']) if (run[k] > 0) { run[k] = Math.max(0, run[k] - dt); if (k === 'shieldT' && run[k] === 0) { run.shieldCool = 3; hud(); } }
    if (stage.id === '1-1' && -player.z > run.metres * 0.55) world.tune({ spiderRate: 0.18 });
    // obstacles
    for (const o of world.obstacles()) if (box(o)) { hurt('bump'); break; }
    // zombie spiders
    let near = false;
    for (const sp of world.spiders()) {
      if (!sp.s.alive) continue;
      const dz = sp.z - player.z;
      if (dz < 0 && dz > -40) near = true;
      const reach = run.shieldT > 0 ? 1.7 : 0.75;
      if (Math.abs(dz) < reach && Math.abs(sp.x - player.x) < (run.shieldT > 0 ? 1.8 : 0.85)) {
        if (run.shieldT > 0) { sp.s.knock(sp.x >= player.x ? 1 : -1); addStars(5); play('knock'); }
        else if (sp.drop ? player.slide <= 0 : player.y < 0.85) hurt('spider');
      }
    }
    if (near && !run.spiderHint) { run.spiderHint = true; hint(stage.hints.find((x) => /subhan/i.test(x)) ?? 'Zombie spiders ahead! Say SubhanAllah to raise your shield of light.'); }
    // stars, with the magnet
    const top = player.y + (player.slide > 0 ? 0.9 : 1.6), mag = 0.9 + ownedLevel('star-magnet') * 0.7;
    for (const s of world.stars()) {
      if (s.alive && Math.abs(s.z - player.z) < 0.9 && Math.abs(s.x - player.x) < mag && s.y > player.y - 0.3 && s.y < top + (mag > 1 ? 1 : 0)) { s.alive = false; addStars(1); play('star'); }
    }
    // treasures
    for (const tr of world.treasures()) {
      if (!tr.got && Math.abs(tr.z - player.z) < 1.1 && Math.abs(tr.x - player.x) < 1.0 && player.y < 2.2) { tr.got = true; tr.obj.visible = false; run.treasures++; play('treasure'); toast(`${stage.item?.icon ?? '💎'} You found ${stage.item?.name ?? 'a treasure'}! (${run.treasures}/${run.need})`); hud(); }
    }
    if (ownedLevel('treasure-finder') && run.need) {
      const nx = world.treasures().filter((x) => !x.got && x.z < player.z).sort((a, b) => b.z - a.z)[0];
      const c = $('tr-compass');
      if (nx && player.z - nx.z < 60 + ownedLevel('treasure-finder') * 40) { c.hidden = false; c.textContent = `🧭 ${stage.item?.icon ?? '💎'} ${['left', 'middle', 'right'][Math.round(nx.x / LANE) + 1]} lane, ${Math.round(player.z - nx.z)} m`; } else c.hidden = true;
    }
    // checkpoints
    for (const [i, cz] of run.plan.checkpointZ.entries()) if (!run.hints.has(`cp${i}`) && player.z < cz) { run.hints.add(`cp${i}`); play('check'); toast('Checkpoint! If you fall, you can start again from here.'); }
    // the guide's hints along the way
    const f = progressBar();
    [0.12, 0.35, 0.6, 0.82].forEach((at, i) => { if (f > at && !run.hints.has(i) && stage.hints[i]) { run.hints.add(i); hint(stage.hints[i]); } });
    // auto-listen when spiders come and the microphone has already been allowed
    if (near && run.mic === 'ready' && run.heard && run.shieldT <= 0 && run.shieldCool <= 0 && !run.listening) askShield();
    // the giant chaser
    if (run.chaserOn) {
      run.chaserGap = Math.min(11, run.chaserGap + dt * 0.55);
      if (run.chaserGap < 1.2) { run.chaserGap = 6; hurt('spider'); }
      const close = run.chaserGap < 6.5;
      chaser.root.visible = close;
      if (close) { chaser.root.position.set(player.x * 0.6, 0, player.z + run.chaserGap + 1.6); chaser.update(dt, 1.4); }
      if (run.shieldT > 0 && run.chaserGap < 4) { run.chaserGap = 11; play('knock'); toast('Your shield pushed the giant spider back!'); }
      $('tr-chase').hidden = !(run.chaserGap < 5);
    }
    // the boss: runs ahead, then waits at the gate; reach it with the shield on to win
    if (run.boss && !run.bossDown) {
      const stopZ = run.plan.endZ + 14;
      run.bossZ = Math.max(stopZ, Math.min(run.bossZ, player.z - 26));
      queen.root.position.set(Math.sin(run.t * 0.8) * 1.5, 0, run.bossZ); queen.root.rotation.y = 0; queen.update(dt, 1);
      if (run.bossZ <= stopZ + 0.01 && !run.hints.has('boss')) { run.hints.add('boss'); hint('The boss blocks the gate! Say SubhanAllah and run into it with your shield of light!', 6500); }
      if (player.z - run.bossZ < 1.6) {
        if (run.shieldT > 0) { run.bossDown = true; queen.knock(1); play('knock'); play('win'); toast('SubhanAllah! The boss is knocked away!'); }
        else { hurt('spider'); player.z += 22; toast('Too strong without your shield! Say SubhanAllah first.'); }
      }
    }
    if (run.bossDown && queen.dead) { if (!queen.tumble(dt)) queen.root.visible = false; }
    // reached the gate
    if (player.z <= run.plan.endZ && (!run.boss || run.bossDown)) win();
    if (quality === 'hd' && !perf.done) { perf.t += dt; perf.n++; if (perf.t > 5) { perf.done = true; if (perf.n / perf.t < 38) { quality = 'lite'; saveLocal({ quality }); applyQuality(); toast('Switched to Lite graphics for smoother play'); } } }
  }
  function addStars(n) { run.stars += n * (run.doubleT > 0 ? 2 : 1); $('tr-stars').textContent = run.stars; }

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    t += dt;
    let mode = 'idle';
    if (state === 'run') {
      step(dt);
      mode = player.y > 0.02 ? 'jump' : player.slide > 0 ? 'slide' : 'run';
      if (run.shieldT > 0 !== shieldMesh.visible) hud();
      if (Math.floor(run.t * 4) !== Math.floor((run.t - dt) * 4)) hud();
    } else if (state === 'fall') {
      run.fallT += dt; mode = 'fall';
      player.z += Math.max(0, 3 - run.fallT * 8) * dt;
      if (run.fallT > 1.3) lose();
    } else if (state === 'lose') mode = 'fall';
    if (world) world.update(player.z, t, state === 'run' ? dt : state === 'paused' ? 0 : dt * 0.3, player.x);
    if (state !== 'paused') runner.update(dt, mode, player.speed);
    runner.root.position.set(player.x, player.y, player.z);
    runner.root.visible = !(run?.inv > 0 && Math.floor(t * 12) % 2 === 0);
    const showcase = state === 'brief' || state === 'map' || state === 'look' || state === 'shop' || state === 'story' || state === 'won';
    runner.root.rotation.y = showcase ? Math.sin(t * 0.5) * 0.35 : 0;
    shieldMesh.visible = !!run && run.shieldT > 0;
    if (shieldMesh.visible) { shieldMesh.position.set(player.x, player.y + 0.85 - (player.slide > 0 ? 0.35 : 0), player.z); shieldMesh.material.uniforms.t.value = t; shieldMesh.material.uniforms.a.value = run.shieldT < 1.5 ? 0.5 + 0.5 * Math.sin(t * 20) : 1; }

    const tp = new THREE.Vector3(), tl = new THREE.Vector3();
    if (showcase) { if (camera.aspect < 0.8) { tp.set(0.9, 0.9, player.z - 4.6); tl.set(0, 0.25, player.z); } else { tp.set(1.4, 1.45, player.z - 3.6); tl.set(-0.6, 0.95, player.z); } }
    else { tp.set(player.x * 0.55, 3.0 + player.y * 0.35 - (player.slide > 0 ? 0.35 : 0), player.z + 6.3); tl.set(player.x * 0.75, 1.25 + player.y * 0.3, player.z - 8); }
    const k = 1 - Math.exp(-dt * (showcase ? 3 : 7));
    camPos.lerp(tp, k); camLook.lerp(tl, k);
    camera.position.copy(camPos); camera.lookAt(camLook);
    if (shake > 0) { shake = Math.max(0, shake - dt); camera.position.x += (Math.random() - 0.5) * shake * 0.6; camera.position.y += (Math.random() - 0.5) * shake * 0.4; }
    if (world) { const sd = world.SUN; sun.position.set(player.x + sd.x * 40, Math.max(18, sd.y * 45), player.z + sd.z * 40); sun.target.position.set(player.x, 0, player.z - 6); }
    if (quality === 'hd') composer.render(); else renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  dress();
  applyQuality();
  requestAnimationFrame(frame);
  // a world behind the map, so the map has something to look at
  world = createWorld(scene, { lite: quality === 'lite', theme: 'oasis', assets: await assetsFor('oasis'), makeSpider });
  world.start({ endZ: -1e9, treasureZ: [], checkpointZ: [], difficulty: 0, spiderRate: 0 }, 7);
  scene.environment = roomEnv; scene.environmentIntensity = 0.35;
  openMap();
  return { title: TITLE };
}
