// The Seerah Quest: the 3D world of the Makkah valley, built in the browser with Three.js.
// Everything is made from simple shapes and drawn textures, so it loads quickly on a school laptop.
// No person is ever drawn: people appear as lanterns and torch-lights. Idols are never shown.
import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';

export const QUALITY = {
  low: { ratio: 0.75, shadows: false, dust: 250, size: 128 },
  medium: { ratio: 1, shadows: false, dust: 700, size: 192 },
  high: { ratio: Math.min(2, globalThis.devicePixelRatio || 1), shadows: true, dust: 1400, size: 256 },
};

// a stone texture drawn on a canvas: courses of rough blocks
function stoneTexture(base = '#6f6458', size = 512) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, size, size);
  const rows = 9;
  for (let r = 0; r < rows; r++) {
    const h = size / rows; let x = -(r % 2) * 30;
    while (x < size) {
      const w = 50 + Math.random() * 60, shade = 0.82 + Math.random() * 0.3;
      g.fillStyle = `rgba(${Math.round(110 * shade)},${Math.round(100 * shade)},${Math.round(88 * shade)},1)`;
      g.fillRect(x + 2, r * h + 2, w - 4, h - 4);
      for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.08})`; g.fillRect(x + Math.random() * w, r * h + Math.random() * h, 2, 2); }
      x += w;
    }
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function sandTexture(size = 512) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d');
  g.fillStyle = '#c9a676'; g.fillRect(0, 0, size, size);
  for (let i = 0; i < 9000; i++) { const v = Math.random(); g.fillStyle = v > 0.5 ? 'rgba(255,240,210,.18)' : 'rgba(90,60,30,.12)'; g.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random() * 2, 1 + Math.random() * 2); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(60, 60); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

let glow = null;
function glowMap() {
  if (glow) return glow;
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.3, 'rgba(255,255,255,.45)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  return (glow = new THREE.CanvasTexture(c));
}

export function createWorld(canvas, { quality = 'medium' } = {}) {
  const Q = QUALITY[quality] ?? QUALITY.medium;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: quality !== 'low', powerPreference: 'high-performance' });
  renderer.setPixelRatio(Q.ratio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = Q.shadows;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 4000);
  camera.position.set(0, 1.7, 60);

  // ── sky, sun, fog ──
  const sky = new Sky(); sky.scale.setScalar(4500); scene.add(sky);
  const su = sky.material.uniforms;
  su.turbidity.value = 6; su.rayleigh.value = 1.6; su.mieCoefficient.value = 0.006; su.mieDirectionalG.value = 0.85;
  const sun = new THREE.DirectionalLight(0xfff1d6, 2.2); sun.castShadow = Q.shadows;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -120, right: 120, top: 120, bottom: -120, far: 900 });
  scene.add(sun);
  const hemi = new THREE.HemisphereLight(0xbfd4ff, 0x8a6a45, 0.7); scene.add(hemi);
  const fill = new THREE.AmbientLight(0xfff0dc, 0.8); scene.add(fill);   // so walls in the shade are stone, not black
  scene.fog = new THREE.FogExp2(0xd8c3a0, 0.0022);
  const sunDir = new THREE.Vector3();
  const stars = (() => {
    const g = new THREE.BufferGeometry(), n = 1500, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const th = Math.random() * Math.PI * 2, ph = Math.random() * Math.PI * 0.45; p.set([Math.cos(th) * Math.sin(ph) * 2000, Math.cos(ph) * 2000, Math.sin(th) * Math.sin(ph) * 2000], i * 3); }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    const s = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false }));
    scene.add(s); return s;
  })();
  // time of day: 'dusk' | 'night' | 'dawn' | 'day'
  function setTime(t) {
    const P = { day: [55, 200, 0.0018, 0xd8c3a0, 2.4, 0.75, 0.55], dusk: [6, 250, 0.0026, 0xc48a5a, 1.4, 0.5, 0.42], dawn: [5, 95, 0.0024, 0xd9a07a, 1.2, 0.5, 0.45], night: [-12, 230, 0.003, 0x1b2236, 0.12, 0.22, 0.22] }[t] ?? [55, 200];
    const [elev, az, fog, fogColor, sunI, hemiI, exp] = P;
    sunDir.setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - elev), THREE.MathUtils.degToRad(az));
    su.sunPosition.value.copy(sunDir);
    sun.position.copy(sunDir).multiplyScalar(400); sun.intensity = sunI;
    hemi.intensity = hemiI * 2.2; fill.intensity = hemiI * 1.4; scene.fog.density = fog; scene.fog.color.setHex(fogColor);
    renderer.toneMappingExposure = exp;
    stars.material.opacity = t === 'night' ? 0.9 : t === 'dawn' || t === 'dusk' ? 0.15 : 0;
    sky.visible = true;
    world.time = t;
  }

  // ── the valley: a flat floor between rocky mountains ──
  const noise = new SimplexNoise();
  const SIZE = 1600, SEG = Q.size;
  const tg = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG); tg.rotateX(-Math.PI / 2);
  const pos = tg.attributes.position, col = [];
  const heightAt = (x, z) => {
    const r = Math.hypot(x * 0.9, z * 1.25);
    const ring = THREE.MathUtils.smoothstep(r, 170, 420);           // the valley floor, then the mountains
    const m = (noise.noise(x / 180, z / 180) * 0.5 + 0.5) * 120 + noise.noise(x / 60, z / 60) * 18 + noise.noise(x / 18, z / 18) * 3;
    return ring * m + (1 - ring) * noise.noise(x / 40, z / 40) * 0.6;
  };
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), h = heightAt(x, z); pos.setY(i, h);
    const rock = THREE.MathUtils.smoothstep(h, 6, 40);
    const c = new THREE.Color(0xc8a272).lerp(new THREE.Color(0x6e5a48), rock).multiplyScalar(0.9 + Math.random() * 0.12);
    col.push(c.r, c.g, c.b);
  }
  tg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); tg.computeVertexNormals();
  const ground = new THREE.Mesh(tg, new THREE.MeshStandardMaterial({ vertexColors: true, map: sandTexture(), roughness: 1 }));
  ground.receiveShadow = true; scene.add(ground);

  // ── the Kaʿbah: a stone house with a raised door and its ring; al-Hijr, the low curved wall ──
  const kaaba = new THREE.Group();
  const stoneTex = stoneTexture(); stoneTex.repeat.set(2, 2);
  const house = new THREE.Mesh(new THREE.BoxGeometry(10, 11, 12), new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.95, color: 0xc9b89c }));
  house.position.y = 5.5; house.castShadow = true; house.receiveShadow = true; kaaba.add(house);
  const door = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.6, 0.3), new THREE.MeshStandardMaterial({ color: 0x4a3420, roughness: 0.8 }));
  door.position.set(-2.2, 4.2, 6.05); kaaba.add(door);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 10, 24), new THREE.MeshStandardMaterial({ color: 0xc29f4b, metalness: 0.8, roughness: 0.3 }));
  ring.position.set(-1.6, 4.1, 6.25); kaaba.add(ring);
  const hijr = new THREE.Mesh(new THREE.TorusGeometry(7.5, 0.5, 8, 40, Math.PI), new THREE.MeshStandardMaterial({ map: stoneTex, color: 0x9a8b78 }));
  hijr.rotation.x = Math.PI / 2; hijr.rotation.z = Math.PI; hijr.position.set(0, 0.4, -6); hijr.scale.set(1, 1, 1.6); kaaba.add(hijr);
  scene.add(kaaba);

  // a few dwellings of Makkah, low and plain, set back from the House
  const homeMat = new THREE.MeshStandardMaterial({ color: 0xd2b48c, roughness: 1, map: stoneTex });
  for (let i = 0; i < 46; i++) {
    const a = (i / 46) * Math.PI * 2 + Math.random() * 0.1, r = 80 + Math.random() * 70;
    const x = Math.cos(a) * r * 1.1, z = Math.sin(a) * r * 0.8;
    const h = 3 + Math.random() * 3, b = new THREE.Mesh(new THREE.BoxGeometry(6 + Math.random() * 6, h, 6 + Math.random() * 6), homeMat);
    b.position.set(x, h / 2 + heightAt(x, z), z); b.rotation.y = Math.random(); b.castShadow = Q.shadows; scene.add(b);
  }

  // drifting dust, for the wind
  const dust = (() => {
    const n = Q.dust, g = new THREE.BufferGeometry(), p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) p.set([(Math.random() - 0.5) * 300, Math.random() * 20, (Math.random() - 0.5) * 300], i * 3);
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    const m = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xe9d3a8, size: 0.25, transparent: true, opacity: 0.5, depthWrite: false }));
    scene.add(m); return m;
  })();

  // ── hotspots: soft columns of light with a label; the student walks to them or taps them ──
  const hotspots = [];
  function addHotspot({ id, x, z, label, color = 0xfbe3a6, radius = 4.5 }) {
    const g = new THREE.Group();
    const y = heightAt(x, z);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.4, 18, 24, 1, true), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false, fog: false }));
    beam.position.y = 9; g.add(beam);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.45, 20, 16), new THREE.MeshBasicMaterial({ color })); orb.position.y = 1.4; g.add(orb);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap(), color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); halo.scale.setScalar(3.5); halo.position.y = 1.4; g.add(halo);
    g.position.set(x, y, z);
    scene.add(g);
    const h = { id, group: g, label, radius, x, z, active: true, orb };
    hotspots.push(h); return h;
  }
  function removeHotspot(id) { const i = hotspots.findIndex((h) => h.id === id); if (i >= 0) { scene.remove(hotspots[i].group); hotspots.splice(i, 1); } }
  function clearHotspots() { while (hotspots.length) removeHotspot(hotspots[0].id); }

  // lanterns for people (never figures): a warm light that can move
  function lantern(x, z, { color = 0xffc46b, height = 1.3 } = {}) {
    const g = new THREE.Group();
    const glass = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), new THREE.MeshBasicMaterial({ color }));
    glass.position.y = height; g.add(glass);
    // a soft halo instead of a real light: dozens of real lights would make older computers struggle
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap(), color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.scale.setScalar(2.4); halo.position.y = height; g.add(halo);
    g.position.set(x, heightAt(x, z), z); scene.add(g); return g;
  }
  // a simple animal shape in the distance (a camel or the elephant), made of rounded blocks
  function creature(kind, x, z, s = 1) {
    const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: kind === 'elephant' ? 0x5c5a58 : 0x9c7a52, roughness: 1 });
    const part = (geo, px, py, pz, rx = 0) => { const k = new THREE.Mesh(geo, m); k.position.set(px, py, pz); k.rotation.x = rx; k.castShadow = Q.shadows; g.add(k); return k; };
    if (kind === 'elephant') {
      part(new THREE.SphereGeometry(2.2, 18, 14), 0, 3.4, 0).scale.set(1.4, 1, 1);
      part(new THREE.SphereGeometry(1.3, 16, 12), 3.2, 4.2, 0);
      const trunk = part(new THREE.CylinderGeometry(0.35, 0.2, 3.2, 10), 4.2, 2.6, 0); trunk.rotation.z = 0.25;
      for (const [lx, lz] of [[-1.6, -0.9], [-1.6, 0.9], [1.6, -0.9], [1.6, 0.9]]) part(new THREE.CylinderGeometry(0.45, 0.45, 2.2, 10), lx, 1.1, lz);
      g.userData.legs = g.children.slice(-4);
    } else {
      part(new THREE.SphereGeometry(1, 14, 10), 0, 2.1, 0).scale.set(1.5, 0.8, 0.7);
      part(new THREE.SphereGeometry(0.45, 12, 10), 0, 2.9, 0);
      const neck = part(new THREE.CylinderGeometry(0.22, 0.3, 1.6, 8), 1.4, 2.6, 0); neck.rotation.z = -0.7;
      part(new THREE.SphereGeometry(0.35, 10, 8), 2, 3.2, 0).scale.set(1.4, 0.8, 0.8);
      for (const [lx, lz] of [[-0.9, -0.35], [-0.9, 0.35], [0.9, -0.35], [0.9, 0.35]]) part(new THREE.CylinderGeometry(0.12, 0.1, 1.6, 6), lx, 0.8, lz);
    }
    g.scale.setScalar(s); g.position.set(x, heightAt(x, z), z); scene.add(g); return g;
  }
  // birds: a flock of small dark shapes
  function flock(n, from, to, { spread = 60, height = 60 } = {}) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([-0.9, 0, 0.3, 0, 0, -0.4, 0.9, 0, 0.3, 0, 0.12, 0], 3)); geo.setIndex([0, 1, 3, 1, 2, 3]);
    const mat = new THREE.MeshBasicMaterial({ color: 0x1b1712, side: THREE.DoubleSide });
    const im = new THREE.InstancedMesh(geo, mat, n);
    const seeds = Array.from({ length: n }, () => [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, Math.random()]);
    scene.add(im);
    const d = new THREE.Object3D();
    return { mesh: im, update(t) {
      for (let i = 0; i < n; i++) {
        const [a, b, c, s] = seeds[i]; const k = THREE.MathUtils.clamp(t * (0.8 + s * 0.4) - s * 0.2, 0, 1);
        d.position.set(THREE.MathUtils.lerp(from.x, to.x, k) + a * spread, height + b * 18 + Math.sin(t * 20 + i) * 0.6, THREE.MathUtils.lerp(from.z, to.z, k) + c * spread);
        d.rotation.set(0, Math.atan2(to.x - from.x, to.z - from.z), Math.sin(t * 40 + i) * 0.5); d.scale.setScalar(1.6); d.updateMatrix(); im.setMatrixAt(i, d.matrix);
      }
      im.instanceMatrix.needsUpdate = true;
    }, remove() { scene.remove(im); } };
  }
  // water bursting from the ground (the spring)
  function spring(x, z) {
    const n = 500, g = new THREE.BufferGeometry(), p = new Float32Array(n * 3), v = [];
    for (let i = 0; i < n; i++) { p.set([x, heightAt(x, z), z], i * 3); v.push([(Math.random() - 0.5) * 2, 3 + Math.random() * 4, (Math.random() - 0.5) * 2, Math.random()]); }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0x9fd8f0, size: 0.18, transparent: true, opacity: 0.85 }));
    scene.add(pts);
    const pool = new THREE.Mesh(new THREE.CircleGeometry(0.1, 32), new THREE.MeshStandardMaterial({ color: 0x5fa8c8, roughness: 0.15, metalness: 0.2 }));
    pool.rotation.x = -Math.PI / 2; pool.position.set(x, heightAt(x, z) + 0.05, z); scene.add(pool);
    let t = 0;
    return { update(dt) { t += dt; pool.scale.setScalar(Math.min(30, 1 + t * 10)); for (let i = 0; i < n; i++) { const [vx, vy, vz, s] = v[i]; const k = ((t + s * 1.2) % 1.2); p[i * 3] = x + vx * k; p[i * 3 + 1] = heightAt(x, z) + vy * k - 4.9 * k * k; p[i * 3 + 2] = z + vz * k; } g.attributes.position.needsUpdate = true; } };
  }
  // the dug well: a stone ring that rises out of the ground as the student digs
  function well(x, z) {
    const g = new THREE.Group();
    const lining = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 1.2, 28, 1, true), new THREE.MeshStandardMaterial({ map: stoneTex, color: 0x8f8170, side: THREE.DoubleSide }));
    const pit = new THREE.Mesh(new THREE.CircleGeometry(1.55, 28), new THREE.MeshStandardMaterial({ color: 0x2a2018 }));
    pit.rotation.x = -Math.PI / 2; pit.position.y = 0.02;
    const mound = new THREE.Mesh(new THREE.ConeGeometry(2.6, 0.9, 24), new THREE.MeshStandardMaterial({ color: 0xb08b5c, roughness: 1 }));
    mound.position.set(3.2, 0.45, 1);
    g.add(lining, pit, mound); g.position.set(x, heightAt(x, z), z);
    lining.position.y = -0.6; mound.scale.setScalar(0.01);
    scene.add(g);
    const water = new THREE.Mesh(new THREE.CircleGeometry(1.5, 28), new THREE.MeshStandardMaterial({ color: 0x3f86a8, roughness: 0.1, metalness: 0.3 }));
    water.rotation.x = -Math.PI / 2; water.position.y = -0.4; water.visible = false; g.add(water);
    return { group: g, progress(k) { lining.position.y = -0.6 + 0.9 * k; mound.scale.setScalar(Math.max(0.01, k)); }, fill() { water.visible = true; } };
  }

  // ── first-person movement: keys or the on-screen pad, drag to look ──
  const keys = new Set();
  let yaw = 0, pitch = 0, dragging = false, last = null, locked = false;
  const onKey = (e) => { if (locked) return; const k = e.key.toLowerCase(); if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) { e.type === 'keydown' ? keys.add(k) : keys.delete(k); e.preventDefault(); } };
  addEventListener('keydown', onKey); addEventListener('keyup', onKey);
  canvas.addEventListener('pointerdown', (e) => { dragging = true; last = [e.clientX, e.clientY, e.clientX, e.clientY]; });
  addEventListener('pointerup', (e) => { if (dragging && last && Math.hypot(e.clientX - last[2], e.clientY - last[3]) < 6) tap(e); dragging = false; });
  addEventListener('pointermove', (e) => { if (!dragging || locked) return; yaw -= (e.clientX - last[0]) * 0.0042; pitch = THREE.MathUtils.clamp(pitch - (e.clientY - last[1]) * 0.003, -0.6, 0.5); last[0] = e.clientX; last[1] = e.clientY; });
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function tap(e) {
    if (locked) return;
    const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(hotspots.map((h) => h.group), true)[0];
    if (hit) { const h = hotspots.find((x) => x.group === hit.object.parent || x.group === hit.object); if (h) world.onHotspot?.(h); }
  }
  const pad = { f: 0, r: 0 };
  function setPad(f, r) { pad.f = f; pad.r = r; }
  const BOUND = 230;

  // camera moves for cinematics: a list of [position, lookAt, seconds]
  let cine = null;
  function fly(shots) { return new Promise((resolve) => { cine = { shots, i: 0, t: 0, resolve }; locked = true; }); }
  function lookAt(x, y, z) { const d = new THREE.Vector3(x, y, z).sub(camera.position); yaw = Math.atan2(-d.x, -d.z); pitch = Math.atan2(d.y, Math.hypot(d.x, d.z)); }
  function place(x, z, lx, lz) { camera.position.set(x, heightAt(x, z) + 1.7, z); if (lx != null) lookAt(lx, heightAt(lx, lz) + 1.6, lz); }

  // ── the loop ──
  const clock = new THREE.Clock(), updaters = new Set();
  let running = true, near = null, lastDraw = 0;
  function resize() { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  const ro = new ResizeObserver(resize); ro.observe(canvas);
  function frame() {
    if (!running) return;
    const dt = Math.min(0.25, clock.getDelta()), t = clock.elapsedTime;   // real time, so slow computers are not slowed down further
    if (cine) {
      const s = cine.shots[cine.i], prev = cine.i ? cine.shots[cine.i - 1] : [camera.position.toArray(), null, 0];
      cine.t += dt;
      const k = s[2] ? THREE.MathUtils.smootherstep(Math.min(1, cine.t / s[2]), 0, 1) : 1;
      const from = new THREE.Vector3(...(cine.from ??= prev[0])), to = new THREE.Vector3(...s[0]);
      camera.position.lerpVectors(from, to, k);
      if (s[1]) camera.lookAt(...s[1]);
      if (cine.t >= s[2]) { cine.i++; cine.t = 0; cine.from = s[0]; if (cine.i >= cine.shots.length) { const r = cine.resolve; const e = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ'); yaw = e.y; pitch = e.x; cine = null; locked = false; r(); } }
    } else {
      const f = (keys.has('w') || keys.has('arrowup') ? 1 : 0) - (keys.has('s') || keys.has('arrowdown') ? 1 : 0) + pad.f;
      const rr = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0) + pad.r;
      if (!locked && (f || rr)) {
        const sp = 11 * Math.min(0.1, dt);
        const nx = camera.position.x - Math.sin(yaw) * f * sp + Math.cos(yaw) * rr * sp;
        const nz = camera.position.z - Math.cos(yaw) * f * sp - Math.sin(yaw) * rr * sp;
        const inside = Math.abs(nx) < 6.5 && Math.abs(nz) < 7.5;   // walk around the House, not through it
        if (Math.hypot(nx, nz) < BOUND && !inside) { camera.position.x = nx; camera.position.z = nz; }
      }
      camera.position.y += ((heightAt(camera.position.x, camera.position.z) + 1.7) - camera.position.y) * 0.3;
      camera.rotation.set(pitch, yaw, 0, 'YXZ');
      // nearest hotspot within reach
      let best = null;
      for (const h of hotspots) { const d = Math.hypot(h.x - camera.position.x, h.z - camera.position.z); if (d < h.radius && (!best || d < best.d)) best = { h, d }; }
      if ((best?.h ?? null) !== near) { near = best?.h ?? null; world.onNear?.(near); }
    }
    for (const h of hotspots) { h.orb.position.y = 1.4 + Math.sin(t * 2 + h.x) * 0.15; }
    const dp = dust.geometry.attributes.position;
    for (let i = 0; i < dp.count; i++) { let x = dp.getX(i) + dt * 3; if (x > 150) x -= 300; dp.setX(i, x); }
    dp.needsUpdate = true;
    for (const u of updaters) u(dt, t);
    // while a card covers the view and nothing moves, draw only twice a second (kinder to batteries and older computers)
    if (locked && !cine && !updaters.size && t - lastDraw < 0.5) { requestAnimationFrame(frame); return; }
    lastDraw = t;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  const world = {
    THREE, scene, camera, renderer, heightAt, setTime, addHotspot, removeHotspot, clearHotspots, lantern, creature, flock, spring, well,
    fly, place, lookAt, setPad, kaaba, ring, onHotspot: null, onNear: null, time: 'day',
    lock(v) { locked = v; if (v) keys.clear(); },
    every(fn) { updaters.add(fn); return () => updaters.delete(fn); },
    near: () => near,
    start() { resize(); requestAnimationFrame(frame); },
    dispose() { running = false; ro.disconnect(); removeEventListener('keydown', onKey); removeEventListener('keyup', onKey); renderer.dispose(); },
  };
  setTime('day');
  return world;
}
