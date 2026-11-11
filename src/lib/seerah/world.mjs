// The Seerah Quest: the 3D world of the Makkah valley, built in the browser with Three.js.
// Everything is made from simple shapes and drawn textures, so it loads quickly on a school laptop.
// No person from the history is ever drawn: people of the time appear as lanterns and torch-lights. Idols are never shown.
// The only figure is the student's own explorer (avatar.mjs): an ordinary child of today. There are no other players.
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

export function createWorld(canvas, { quality = 'medium', theme = 'makkah' } = {}) {
  const CANOPY = theme === 'canopy', CITY = theme === 'city';
  const NOOR = theme === 'noor' || CANOPY || CITY;   // Guardians of Light: the green valley of Noor (no Kaʿbah, no houses of Makkah)
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
    const P = NOOR ? { day: [50, 200, 0.0014, 0xc4dccf, 2.6, 0.95, 0.66], dusk: [8, 250, 0.0022, 0xd6a27a, 1.8, 0.7, 0.56], dawn: [10, 95, 0.002, 0xf0c9a6, 2.1, 0.85, 0.64], night: [-12, 230, 0.003, 0x1b2a36, 0.12, 0.25, 0.24] }[t] ?? [50, 200] : { day: [55, 200, 0.0018, 0xd8c3a0, 2.4, 0.75, 0.55], dusk: [6, 250, 0.0026, 0xc48a5a, 1.4, 0.5, 0.42], dawn: [5, 95, 0.0024, 0xd9a07a, 1.2, 0.5, 0.45], night: [-12, 230, 0.003, 0x1b2236, 0.12, 0.22, 0.22] }[t] ?? [55, 200];
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
  // Noor: a stream crosses the valley north of the pavilion; the beacon stands on a low hill beyond it
  const streamZ = (x) => -46 + Math.sin(x / 35) * 5;
  const heightAt = NOOR ? (x, z) => {
    const r = Math.hypot(x * 0.9, z * 1.1);
    const ring = THREE.MathUtils.smoothstep(r, 210, 480);
    const m = (noise.noise(x / 200, z / 200) * 0.5 + 0.5) * 90 + noise.noise(x / 70, z / 70) * 14;
    const d = Math.abs(z - streamZ(x)), chan = !CANOPY && !CITY && Math.abs(x) < 420 ? -2.6 * (1 - THREE.MathUtils.smoothstep(d, 3.6, 6.2)) : 0;
    const hill = CANOPY || CITY ? 0 : 9 * Math.exp(-((x * x) + (z + 150) * (z + 150)) / 1400);
    const flat = CITY ? THREE.MathUtils.smoothstep(Math.hypot(x, z), 56, 84) : 1;   // the city square is level
    return ring * m + (1 - ring) * (noise.noise(x / 50, z / 50) * 0.8 * flat + hill + chan);
  } : (x, z) => {
    const r = Math.hypot(x * 0.9, z * 1.25);
    const ring = THREE.MathUtils.smoothstep(r, 170, 420);           // the valley floor, then the mountains
    const m = (noise.noise(x / 180, z / 180) * 0.5 + 0.5) * 120 + noise.noise(x / 60, z / 60) * 18 + noise.noise(x / 18, z / 18) * 3;
    return ring * m + (1 - ring) * noise.noise(x / 40, z / 40) * 0.6;
  };
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), h = heightAt(x, z); pos.setY(i, h);
    const rock = THREE.MathUtils.smoothstep(h, NOOR ? 14 : 6, 40);
    const c = NOOR
      ? (h < -0.8 ? new THREE.Color(0x8a7a5c) : new THREE.Color(CANOPY ? 0x4f8a3a : 0x6aa548).lerp(new THREE.Color(CANOPY ? 0x3d6e2c : 0x4f8a3a), Math.random() * 0.5).lerp(new THREE.Color(0x7d7a6c), rock)).multiplyScalar(0.92 + Math.random() * 0.1)
      : new THREE.Color(0xc8a272).lerp(new THREE.Color(0x6e5a48), rock).multiplyScalar(0.9 + Math.random() * 0.12);
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
  if (!NOOR) scene.add(kaaba);


  // ── solids: upright boxes the explorer stands on and bumps into (all lined up with the x and z axes) ──
  const solids = [];
  function addSolid(x0, x1, z0, z1, y0, y1, { climb = true, mesh = null } = {}) { const s = { x0, x1, z0, z1, y0, y1, climb, mesh }; solids.push(s); return s; }
  function removeSolid(s) { const i = solids.indexOf(s); if (i >= 0) solids.splice(i, 1); }
  // the House is solid, and nobody climbs it: it is far too tall to jump, and it can never be climbed
  if (!NOOR) addSolid(-5, 5, -6, 6, -1, 11, { climb: false });

  // a few dwellings of Makkah, low and plain, set back from the House
  const homeMat = new THREE.MeshStandardMaterial({ color: 0xd2b48c, roughness: 1, map: stoneTex });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xe8d2a6, roughness: 1 });
  const homes = [];
  for (let i = 0; i < (NOOR ? 0 : 46); i++) {
    const a = (i / 46) * Math.PI * 2 + Math.random() * 0.1, r = 80 + Math.random() * 70;
    const x = Math.cos(a) * r * 1.1, z = Math.sin(a) * r * 0.8;
    const w = 6 + Math.random() * 6, d = 6 + Math.random() * 6, h = 3 + Math.random() * 3, base = heightAt(x, z);
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h + 1, d), [homeMat, homeMat, roofMat, homeMat, homeMat, homeMat]);
    b.position.set(x, base + (h - 1) / 2, z); b.castShadow = Q.shadows; b.receiveShadow = Q.shadows; scene.add(b);
    homes.push({ mesh: b, solid: addSolid(x - w / 2, x + w / 2, z - d / 2, z + d / 2, base - 1, base + h) });
  }

  // a scroll or a marker never sits inside a house: clear the houses around it
  function clearAround(x, z, r = 4) {
    for (const h of homes) { const s = h.solid; if (s.x1 > x - r && s.x0 < x + r && s.z1 > z - r && s.z0 < z + r) { h.mesh.visible = false; removeSolid(s); } }
  }

  // ── the Knowledge Archive: a small stone hall with shelves and a reading stand, open on the side facing the House ──
  const ARCHIVE = { x: -50, z: 18 };
  if (!NOOR) (() => {
    const { x, z } = ARCHIVE, y = heightAt(x, z), H = 4.6;
    const wall = (x0, x1, z0, z1) => { const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, H, z1 - z0), homeMat); m.position.set((x0 + x1) / 2, y + H / 2, (z0 + z1) / 2); scene.add(m); addSolid(x0, x1, z0, z1, y - 1, y + H, { climb: false }); };
    wall(x - 6, x - 5.4, z - 6, z + 6); wall(x - 6, x + 5, z - 6.6, z - 6); wall(x - 6, x + 5, z + 6, z + 6.6);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.5, 13.6), roofMat); roof.position.set(x - 0.5, y + H + 0.25, z); scene.add(roof);
    const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d');
    g.fillStyle = '#5a3d22'; g.fillRect(0, 0, 256, 128);
    const cols = ['#8e3b46', '#2e4057', '#1f6f5c', '#c9a24a', '#6b4226', '#e8d6b0'];
    for (let row = 0; row < 3; row++) for (let bx = 4; bx < 252;) { const w = 6 + Math.random() * 8; g.fillStyle = cols[Math.floor(Math.random() * cols.length)]; g.fillRect(bx, row * 42 + 6 + Math.random() * 6, w - 1, 30); bx += w; }
    const books = new THREE.CanvasTexture(c); books.colorSpace = THREE.SRGBColorSpace;
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.6, 3, 10), [new THREE.MeshStandardMaterial({ map: books }), homeMat, homeMat, homeMat, homeMat, homeMat]);
    shelf.position.set(x - 5, y + 1.5, z); scene.add(shelf);
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 1.2), new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.9 })); stand.position.set(x - 2, y + 0.55, z); scene.add(stand);
    const page = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 1.3), new THREE.MeshStandardMaterial({ color: 0xf4ead2 })); page.position.set(x - 2, y + 1.15, z); page.rotation.z = 0.25; scene.add(page);
    const lamp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap(), color: 0xffc46b, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); lamp.scale.setScalar(4); lamp.position.set(x - 2, y + 3.4, z); scene.add(lamp);
  })();

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
  function addHotspot({ id, x, z, y: hy = null, label, color = 0xfbe3a6, radius = 4.5 }) {
    const g = new THREE.Group();
    const y = hy ?? heightAt(x, z);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.4, 18, 24, 1, true), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false, fog: false }));
    beam.position.y = 9; g.add(beam);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.45, 20, 16), new THREE.MeshBasicMaterial({ color })); orb.position.y = 1.4; g.add(orb);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap(), color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); halo.scale.setScalar(3.5); halo.position.y = 1.4; g.add(halo);
    g.position.set(x, y, z);
    scene.add(g);
    const h = { id, group: g, label, radius, x, z, y: hy, active: true, orb };
    hotspots.push(h); return h;
  }
  function removeHotspot(id) { const i = hotspots.findIndex((h) => h.id === id); if (i >= 0) { scene.remove(hotspots[i].group); hotspots.splice(i, 1); } }
  function clearHotspots() { while (hotspots.length) removeHotspot(hotspots[0].id); }

  // lanterns for people (never figures): a warm light that can move
  function lantern(x, z, { color = 0xffc46b, height = 1.3, y = null } = {}) {
    const g = new THREE.Group();
    const glass = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), new THREE.MeshBasicMaterial({ color }));
    glass.position.y = height; g.add(glass);
    // a soft halo instead of a real light: dozens of real lights would make older computers struggle
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap(), color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.scale.setScalar(2.4); halo.position.y = height; g.add(halo);
    g.position.set(x, y ?? heightAt(x, z), z); scene.add(g); return g;
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

  // ── collectibles: lights (like coins), knowledge scrolls and the lantern at the end of a climb ──
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MAXL = 480;
  const orbMesh = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.22), new THREE.MeshBasicMaterial({ color: 0xffd34d }), MAXL);
  orbMesh.count = 0; orbMesh.frustumCulled = false; scene.add(orbMesh);
  const orbs = [];   // { x, y, z, on, tag }
  function addLights(points, tag = '') { for (const [x, y, z] of points) if (orbs.length < MAXL && !solids.some((q) => over(q, x, z, 0.5) && q.y1 > y - 1 && q.y0 < y)) orbs.push({ x, y, z, on: true, tag }); orbMesh.count = orbs.length; return orbs.filter((o) => o.tag === tag).length; }
  const pickups = [];   // { x, y, z, r, obj, kind, onTake }
  function scrollObj() {
    const g = new THREE.Group();
    const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.62, 14), new THREE.MeshStandardMaterial({ color: 0xf2e1b8, roughness: 0.8, emissive: 0x6b4a10, emissiveIntensity: 0.35 }));
    roll.rotation.z = Math.PI / 2; g.add(roll);
    for (const s of [-1, 1]) { const end = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.16, 8), new THREE.MeshStandardMaterial({ color: 0x6b4226 })); end.rotation.z = Math.PI / 2; end.position.x = s * 0.38; g.add(end); }
    const tie = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.025, 6, 16), new THREE.MeshStandardMaterial({ color: 0xc0392b })); tie.rotation.y = Math.PI / 2; g.add(tie);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap(), color: 0xffe08a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); halo.scale.setScalar(1.8); g.add(halo);
    return g;
  }
  function addScroll(x, z, y = null, onTake = null, id = '') {
    if (y == null) clearAround(x, z);
    const obj = scrollObj(), yy = y ?? heightAt(x, z) + 1.1;
    obj.position.set(x, yy, z); scene.add(obj);
    const p = { x, y: yy, z, r: 1.3, obj, kind: 'scroll', id, onTake };
    pickups.push(p); return p;
  }
  function addThing(obj, x, z, y = null, onTake = null, id = '') {
    const yy = y ?? heightAt(x, z) + 1.1;
    obj.position.set(x, yy, z); scene.add(obj);
    const p = { x, y: yy, z, r: 1.4, obj, kind: 'thing', id, onTake };
    pickups.push(p); return p;
  }
  function removePickup(p) { const i = pickups.indexOf(p); if (i >= 0) pickups.splice(i, 1); scene.remove(p.obj); }
  // a hanging lamp on a post: dark until the explorer reaches it, then it shines
  function lampPost(x, z, base) {
    const g = new THREE.Group(), bronze = new THREE.MeshStandardMaterial({ color: 0x8b5e0a, metalness: 0.6, roughness: 0.4 });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.8, 8), new THREE.MeshStandardMaterial({ color: 0x5a3e28 })); post.position.y = 1.4; g.add(post);
    const armM = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.08), bronze); armM.position.set(0.4, 2.75, 0); g.add(armM);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.5), bronze); frame.position.set(0.8, 2.25, 0); g.add(frame);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.56, 0.52), new THREE.MeshBasicMaterial({ color: 0x5a4a30 })); glass.position.copy(frame.position); g.add(glass);
    const glass2 = glass.clone(); glass2.scale.set(1.24, 1, 0.8); g.add(glass2);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap(), color: 0xffc46b, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); halo.scale.setScalar(5); halo.position.copy(frame.position); halo.visible = false; g.add(halo);
    g.position.set(x, base, z); scene.add(g);
    return { group: g, light() { glass.material.color.setHex(0xffe066); halo.visible = true; } };
  }
  // a small burst of light where the explorer fell (no harm: they go back to the last checkpoint)
  function poof(x, y, z) {
    if (reduced) return;
    const parts = [];
    for (let i = 0; i < 16; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap(), color: i % 2 ? 0xffffff : 0xffe08a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
      s.position.set(x, y + 0.6, z); s.scale.setScalar(0.9); scene.add(s);
      parts.push({ s, v: new THREE.Vector3((Math.random() - 0.5) * 5, Math.random() * 4, (Math.random() - 0.5) * 5) });
    }
    let t = 0;
    const u = every((dt) => { t += dt; for (const p of parts) { p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = Math.max(0, 1 - t / 0.6); } if (t >= 0.6) { parts.forEach((p) => scene.remove(p.s)); u(); } });
  }

  // ── climbing challenges (obby): rooftops or rocky ledges, checkpoints, and a lantern at the top ──
  //   gentle: very short jumps and a checkpoint on every roof · explorer: easy jumps · master: long jumps that need a run
  const COURSE = {
    gentle: { n: 8, gap: [0.6, 1.1], rise: [0, 0.45], size: 3.6, cp: 1, lat: 1.4 },
    explorer: { n: 10, gap: [1.2, 2.0], rise: [-0.2, 0.8], size: 3.0, cp: 2, lat: 2.0 },
    master: { n: 13, gap: [2.4, 3.4], rise: [-0.3, 1.05], size: 2.2, cp: 5, lat: 2.6 },
  };
  let course = null;
  function rng(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }
  function buildCourse({ x, z, axis = 'x', kind = 'roof', mode = 'explorer', seed = 7, scrolls = 0 }) {
    clearCourse();
    const C = COURSE[mode] ?? COURSE.explorer, R = rng(seed);
    const toW = (u, v) => (axis === 'x' ? [x + u, z + v] : [x + v, z - u]);
    const plats = [];
    let u = 2.6, v = 0, top = 0.9, half = 0;
    for (let i = 0; i < C.n; i++) {
      const s = C.size * (0.85 + R() * 0.3), g = C.gap[0] + R() * (C.gap[1] - C.gap[0]);
      u += half + (i ? g : 0) + s / 2; half = s / 2;
      if (i) { v = THREE.MathUtils.clamp(v + (R() - 0.5) * 2 * C.lat, -6, 6); top = THREE.MathUtils.clamp(top + C.rise[0] + R() * (C.rise[1] - C.rise[0]), 0.9, 10); }
      plats.push({ u, v, s, top, cp: i > 0 && i % C.cp === 0 && i < C.n - 1 });
    }
    { const g = C.gap[0] + R() * (C.gap[1] - C.gap[0]); u += half + g + 2.4; top = Math.min(11, top + 0.5); plats.push({ u, v: v * 0.5, s: 4.8, top, goal: true }); }
    // the soft sand: falling onto it sends the explorer back to the last checkpoint
    const [pa, pb] = [toW(plats[0].u - plats[0].s / 2, -10), toW(u + 4, 10)];
    const pit = { x0: Math.min(pa[0], pb[0]), x1: Math.max(pa[0], pb[0]), z0: Math.min(pa[1], pb[1]), z1: Math.max(pa[1], pb[1]) };
    // clear the houses that stand in the way
    for (const h of homes) { const q = h.solid; if (q.x1 > pit.x0 - 4 && q.x0 < pit.x1 + 4 && q.z1 > pit.z0 - 4 && q.z0 < pit.z1 + 4) { h.mesh.visible = false; removeSolid(q); } }
    const group = new THREE.Group(); scene.add(group);
    let sandY = -Infinity;
    for (let sx = pit.x0; sx <= pit.x1; sx += 4) for (let sz = pit.z0; sz <= pit.z1; sz += 4) sandY = Math.max(sandY, heightAt(sx, sz));
    const sand = new THREE.Mesh(new THREE.PlaneGeometry(pit.x1 - pit.x0, pit.z1 - pit.z0), new THREE.MeshStandardMaterial({ color: kind === 'rock' ? 0x8a6f52 : 0xa77c4c, roughness: 1, transparent: true, opacity: 0.85 }));
    sand.rotation.x = -Math.PI / 2; sand.position.set((pit.x0 + pit.x1) / 2, sandY + 0.06, (pit.z0 + pit.z1) / 2); group.add(sand);
    const sideM = kind === 'rock' ? new THREE.MeshStandardMaterial({ color: 0x8a7560, roughness: 1, map: stoneTex }) : homeMat;
    const topM = kind === 'rock' ? new THREE.MeshStandardMaterial({ color: 0xb9a07e, roughness: 1 }) : roofMat;
    const cpM = new THREE.MeshStandardMaterial({ color: 0xe0a526, roughness: 0.6 });
    const movM = new THREE.MeshStandardMaterial({ color: 0x7a5a3a, roughness: 0.9 }), movTop = new THREE.MeshStandardMaterial({ color: 0x5fa8c8, roughness: 0.7, emissive: 0x1d4a5e, emissiveIntensity: 0.4 });
    const cps = [];
    const [sx0, sz0] = toW(0, 0);
    const startY = heightAt(sx0, sz0);
    const ringGeo = new THREE.TorusGeometry(1, 0.08, 6, 28);
    const ring = (wx, wy, wz, r) => { const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xffe08a })); m.rotation.x = Math.PI / 2; m.scale.setScalar(r); m.position.set(wx, wy + 0.06, wz); group.add(m); return m; };
    cps.push({ x: sx0, z: sz0, y: startY, ring: ring(sx0, startY, sz0, 1.4), reached: true });
    const lights = [];
    // Roblox-style extras, never in Gentle jumps: a platform or two that slides from side to side, a narrow plank
    // bridge across one gap, and a tall tower near the end with a ladder up its side
    if (mode !== 'gentle' && plats.length > 6) {
      // the moving stones go on platforms without a flag, away from the start and the end
      const free = plats.map((p, i) => i).filter((i) => i >= 3 && i < plats.length - 3 && !plats[i].cp && !plats[i].goal);
      const movers = mode === 'master' ? [free[0], free[Math.floor(free.length / 2) + 1] ?? free.at(-1)] : [free[Math.floor(free.length / 2)]];
      for (const i of new Set(movers)) if (i != null) plats[i].move = { amp: mode === 'master' ? 2.4 : 1.6, speed: mode === 'master' ? 1.1 : 0.8, ph: R() * 6 };
      const b = plats.findIndex((p, i) => i > 1 && !p.cp && !p.move && !plats[i - 1].move && !plats[i - 1].cp && i < plats.length - 3);
      if (b > 0) {
        const a = plats[b - 1], q = plats[b], extra = mode === 'master' ? 2.2 : 3.2;
        for (let k = b; k < plats.length; k++) plats[k].u += extra;
        q.v = a.v; q.top = a.top; q.bridge = true;
      }
      // the tower: a tall platform just before the goal, too tall to jump, with a ladder on the side facing the climb
      const g = plats[plats.length - 1], pre = plats[plats.length - 2];
      const tw = { u: pre.u + pre.s / 2 + 0.15 + 1.3, v: pre.v, s: 2.6, top: Math.min(13, pre.top + 3.6), ladder: true };
      plats.splice(plats.length - 1, 0, tw);
      g.u = tw.u + 1.3 + (C.gap[0] + C.gap[1]) / 2 + g.s / 2; g.v = tw.v; g.top = Math.min(14, tw.top + 0.3);
      u = g.u;
    }
    plats.forEach((p, i) => {
      const [wx, wz] = toW(p.u, p.v), gy = Math.min(heightAt(wx, wz), sandY) - 0.6, top = sandY + p.top;
      const m = new THREE.Mesh(new THREE.BoxGeometry(p.s, top - gy, p.s), [sideM, sideM, topM, sideM, sideM, sideM]);
      m.position.set(wx, (top + gy) / 2, wz); m.castShadow = Q.shadows; m.receiveShadow = Q.shadows; group.add(m);
      p.x = wx; p.z = wz; p.y = top; p.x0 = wx; p.z0 = wz; p.mesh = m;
      p.solid = addSolid(wx - p.s / 2, wx + p.s / 2, wz - p.s / 2, wz + p.s / 2, gy, top, { mesh: m });
      if (p.move) { m.material = [movM, movM, movTop, movM, movM, movM]; }
      if (p.ladder) {
        p.solid.ladder = true;
        // two rails and the rungs, on the face towards the start
        const [lx, lz] = toW(p.u - p.s / 2 - 0.06, p.v), lad = new THREE.Group(), wood = new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.9 });
        const H = top - sandY;
        for (const s of [-0.45, 0.45]) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.1, H, 0.1), wood); r.position.set(s, H / 2, 0); lad.add(r); }
        for (let y = 0.4; y < H; y += 0.45) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.07, 0.08), wood); r.position.set(0, y, 0); lad.add(r); }
        lad.position.set(lx, sandY, lz); if (axis === 'x') lad.rotation.y = Math.PI / 2; group.add(lad);
      }
      if (p.bridge) {
        // a plank from the platform before it, just wide enough to walk along
        const a = plats[i - 1], [ax, az] = toW(a.u + a.s / 2, a.v), [bx, bz] = toW(p.u - p.s / 2, p.v);
        const len = Math.hypot(bx - ax, bz - az), plank = new THREE.Mesh(new THREE.BoxGeometry(axis === 'x' ? len : 0.8, 0.2, axis === 'x' ? 0.8 : len), new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 }));
        plank.position.set((ax + bx) / 2, top - 0.1, (az + bz) / 2); group.add(plank);
        const hw = axis === 'x' ? [len / 2, 0.4] : [0.4, len / 2];
        p.plank = addSolid((ax + bx) / 2 - hw[0], (ax + bx) / 2 + hw[0], (az + bz) / 2 - hw[1], (az + bz) / 2 + hw[1], top - 0.2, top);
      }
      if (p.cp) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 6), new THREE.MeshStandardMaterial({ color: 0x5a3e28 }));
        pole.position.set(wx + p.s / 2 - 0.3, top + 1.1, wz - p.s / 2 + 0.3); group.add(pole);
        const flag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.5, 0.8), cpM.clone()); flag.position.set(pole.position.x, top + 1.9, pole.position.z + 0.42); group.add(flag);
        cps.push({ x: wx, z: wz, y: top, plat: p, flag, ring: ring(wx, top, wz, p.s * 0.32) });
      }
      if (!p.move) lights.push([wx, top + 1.0, wz]);
      if (p.ladder) for (let y = sandY + 1.5; y < top; y += 1.5) { const [lx, lz] = toW(p.u - p.s / 2 - 0.5, p.v); lights.push([lx, y, lz]); }
      const q = plats[i + 1];
      if (q && !p.move && !q.move && !q.ladder) { const [qx, qz] = toW(q.u, q.v); lights.push([(wx + qx) / 2, Math.max(top, sandY + q.top) + 1.6, (wz + qz) / 2]); }
    });
    const goal = plats[plats.length - 1];
    const lamp = lampPost(goal.x, goal.z, goal.y);
    const nLights = addLights(lights, 'course');
    // scrolls along the way, on roofs a third and two thirds of the way up (never on a moving platform)
    const spots = [];
    for (let k = 0; k < scrolls; k++) {
      let j = Math.min(plats.length - 2, Math.round(((k + 1) * (plats.length - 1)) / (scrolls + 1)));
      while (j > 1 && (plats[j].move || plats[j].ladder)) j--;
      const p = plats[j]; spots.push([p.x + p.s * 0.2, p.y + 1.1, p.z - p.s * 0.2]);
    }
    course = { plats, pit, cps, last: cps[0], goal, lamp, group, active: true, started: false, falls: 0, onFall: null, onCheckpoint: null, onGoal: null, helpers: null, t: 0, axis };
    return { start: { x: sx0, z: sz0 }, goal: { x: goal.x, z: goal.z }, lights: nLights, spots, plats: plats.length, checkpoints: cps.length - 1 };
  }
  function clearCourse() {
    if (!course) return;
    scene.remove(course.group); course.lamp.group.parent?.remove(course.lamp.group);
    for (const p of course.plats) { removeSolid(p.solid); if (p.plank) removeSolid(p.plank); }
    for (const h of course.helpers ?? []) removeSolid(h);
    for (let i = orbs.length - 1; i >= 0; i--) if (orbs[i].tag === 'course') orbs.splice(i, 1);
    orbMesh.count = orbs.length; course = null;
  }
  // after many falls (Explorer only): extra stepping stones appear in the widest gaps
  function helpCourse() {
    if (!course || course.helpers) return;
    course.helpers = [];
    const m = new THREE.MeshStandardMaterial({ color: 0xe8d2a6, roughness: 1 });
    for (let i = 0; i < course.plats.length - 1; i++) {
      const a = course.plats[i], b = course.plats[i + 1];
      const mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2, y = Math.min(a.y, b.y), gy = y - 4;
      const k = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4, 1.2), m); k.position.set(mx, y - 2, mz); course.group.add(k);
      course.helpers.push(addSolid(mx - 0.6, mx + 0.6, mz - 0.6, mz + 0.6, gy, y));
    }
  }

  // ── the explorer: third person, with walking, running, jumping and climbing onto ledges ──
  const P = { pos: new THREE.Vector3(0, 0, 40), vy: 0, vx: 0, vz: 0, yaw: 0, grounded: true, onSolid: null, coyote: 0, jumpQ: 0, climb: null, push: 0, air: 0 };
  const PR = 0.38, STEP = 0.5, G = 28, JUMP = 9.6, WALK = 5.2, RUN = 9.2, CLIMB = 1.95, CALM = NOOR ? 0 : 17;
  let avatar = null;
  function setAvatar(av) {
    if (avatar) { scene.remove(avatar.root); scene.remove(avatar.blob); avatar.dispose(); }
    avatar = av; scene.add(av.root); scene.add(av.blob);
  }
  const cam = { yaw: 0, pitch: 0.32, dist: 7.5 };
  const over = (s, x, z, r) => x + r > s.x0 && x - r < s.x1 && z + r > s.z0 && z - r < s.z1;
  // the highest floor under the explorer that they can stand on from feet height y
  function floorAt(x, z, y) {
    let f = heightAt(x, z), on = null;
    for (const s of solids) if (s.y1 <= y + STEP + 0.01 && s.y1 > f && over(s, x, z, PR * 0.55)) { f = s.y1; on = s; }
    return [f, on];
  }
  const keys = new Set();
  let locked = false, run = false;
  const pad = { f: 0, r: 0, run: false };
  function setPad(f, r, rn = false) { pad.f = f; pad.r = r; pad.run = rn; }
  function jump() { if (!locked) P.jumpQ = 0.15; }
  const calm = () => Math.hypot(P.pos.x, P.pos.z) < CALM;
  let wasCalm = false;
  function updatePlayer(dt) {
    let f = (keys.has('w') || keys.has('arrowup') ? 1 : 0) - (keys.has('s') || keys.has('arrowdown') ? 1 : 0) + pad.f;
    let r = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0) + pad.r;
    if (locked) f = r = 0;
    let mx = -Math.sin(cam.yaw) * f + Math.cos(cam.yaw) * r, mz = -Math.cos(cam.yaw) * f - Math.sin(cam.yaw) * r;
    const mag = Math.min(1, Math.hypot(mx, mz));
    const isCalm = calm();
    if (isCalm !== wasCalm) { wasCalm = isCalm; world.onCalm?.(isCalm); }
    const running = (run || pad.run) && !isCalm;
    const speed = (running ? RUN : WALK) * mag;
    if (mag > 0.01) { const l = Math.hypot(mx, mz); mx /= l; mz /= l; const want = Math.atan2(-mx, -mz); let d = want - P.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); P.yaw += d * Math.min(1, dt * 12); }
    // climbing a ledge: a short lift onto the top
    if (P.climb) {
      const c = P.climb; c.t = Math.min(1, c.t + dt / 0.38);
      P.pos.y = c.y0 + (c.y1 - c.y0) * Math.min(1, c.t * 1.6);
      if (c.t > 0.55) { P.pos.x += (c.tx - P.pos.x) * Math.min(1, dt * 14); P.pos.z += (c.tz - P.pos.z) * Math.min(1, dt * 14); }
      if (c.t >= 1) { P.pos.set(c.tx, c.y1, c.tz); P.climb = null; P.vy = 0; P.grounded = true; P.onSolid = c.s ?? P.onSolid; }
      return { speed: 0, climb: true };
    }
    const acc = P.grounded ? 14 : 5;
    P.vx += (mx * speed - P.vx) * Math.min(1, dt * acc); P.vz += (mz * speed - P.vz) * Math.min(1, dt * acc);
    const feet = P.pos.y;
    let blocked = null;
    const tryMove = (nx, nz) => {
      for (const s of solids) {
        if (!over(s, nx, nz, PR) || feet >= s.y1 - 0.01 || feet + 1.5 <= s.y0) continue;
        if (s.y1 - feet <= STEP && s.climb !== false && (P.grounded || P.vy <= 0)) continue;   // a small step: walk up it
        blocked = s; return false;
      }
      return Math.hypot(nx, nz) < BOUND;
    };
    const nx = P.pos.x + P.vx * dt; if (tryMove(nx, P.pos.z)) P.pos.x = nx; else P.vx = 0;
    const nz = P.pos.z + P.vz * dt; if (tryMove(P.pos.x, nz)) P.pos.z = nz; else P.vz = 0;
    // a ladder: push towards it to climb, let go of the keys to hang on, jump to let go
    if (blocked?.ladder && mag > 0.3) P.ladder = blocked;
    if (P.ladder) {
      const s = P.ladder, rise = s.y1 - P.pos.y;
      if (!over(s, P.pos.x, P.pos.z, PR + 0.15) || rise <= 0 || P.jumpQ > 0) { P.ladder = null; P.jumpQ = 0; }
      else if (rise > CLIMB) {
        if (mag > 0.3) P.pos.y += dt * 3.4;
        P.vx = P.vz = 0; P.vy = 0; P.grounded = false; P.air = 0;
        return { speed: 0, climb: true };
      } else {
        // the top of the ladder: pull up onto the tower
        P.ladder = null;
        if (mag > 0.3) {
          const tx = THREE.MathUtils.clamp(P.pos.x + mx * 0.9, s.x0 + PR, s.x1 - PR), tz = THREE.MathUtils.clamp(P.pos.z + mz * 0.9, s.z0 + PR, s.z1 - PR);
          P.climb = { t: 0, y0: P.pos.y, y1: s.y1, tx, tz, s }; P.vy = 0;
          return { speed: 0, climb: true };
        }
      }
    }
    // pressing on into a ledge that is low enough: climb up onto it
    if (blocked && blocked.climb && mag > 0.3) {
      const rise = blocked.y1 - feet;
      P.push += dt;
      if (rise <= CLIMB && (P.push > 0.12 || !P.grounded)) {
        const tx = THREE.MathUtils.clamp(P.pos.x + mx * 0.7, blocked.x0 + PR, blocked.x1 - PR), tz = THREE.MathUtils.clamp(P.pos.z + mz * 0.7, blocked.z0 + PR, blocked.z1 - PR);
        P.climb = { t: 0, y0: feet, y1: blocked.y1, tx, tz, s: blocked }; P.push = 0; P.vy = 0;
        return { speed: 0, climb: true };
      }
    } else P.push = 0;
    // jumping and falling
    P.jumpQ -= dt; P.coyote = P.grounded ? 0.12 : P.coyote - dt;
    if (P.jumpQ > 0 && P.coyote > 0 && !isCalm) { P.vy = JUMP; P.grounded = false; P.coyote = 0; P.jumpQ = 0; world.onJump?.(); }
    else if (P.jumpQ > 0 && isCalm && P.grounded) { P.jumpQ = 0; world.onCalmJump?.(); }
    P.vy -= G * dt;
    const prev = P.pos.y;
    P.pos.y += P.vy * dt;
    const [fl, on] = floorAt(P.pos.x, P.pos.z, prev);
    const was = P.grounded;
    if (P.pos.y <= fl) {
      if (!was && P.air > 0.25) world.onLand?.();
      P.pos.y = fl; P.vy = 0; P.grounded = true; P.onSolid = on; P.air = 0;
    } else if (was && P.vy < 0 && prev - fl >= 0 && prev - fl < 0.35) { P.pos.y = fl; P.vy = 0; P.onSolid = on; }   // down a gentle slope or a small step
    else { P.grounded = false; P.air += dt; }
    return { speed: Math.hypot(P.vx, P.vz) / RUN, air: !P.grounded && P.air > 0.08 };
  }
  // moving platforms slide from side to side, and carry the explorer standing on them
  function updateMovers(dt) {
    const c = course; if (!c) return;
    c.t += dt;
    for (const p of c.plats) {
      if (!p.move) continue;
      const off = Math.sin(c.t * p.move.speed + p.move.ph) * p.move.amp;
      const nx = c.axis === 'x' ? p.x0 : p.x0 + off, nz = c.axis === 'x' ? p.z0 + off : p.z0, dx = nx - p.x, dz = nz - p.z;
      p.x = nx; p.z = nz; p.mesh.position.x = nx; p.mesh.position.z = nz;
      const s = p.solid; s.x0 += dx; s.x1 += dx; s.z0 += dz; s.z1 += dz;
      if (P.onSolid === s && P.grounded && !locked) { P.pos.x += dx; P.pos.z += dz; }
    }
  }
  // the course: checkpoints, falls and the lantern
  function updateCourse() {
    const c = course; if (!c || !c.active || locked) return;
    const { x, z } = P.pos;
    if (P.grounded && !P.onSolid && x > c.pit.x0 && x < c.pit.x1 && z > c.pit.z0 && z < c.pit.z1) {
      // a fall: a puff of light, then back to the last checkpoint
      c.falls++;
      const at = P.pos.clone();
      poof(at.x, at.y, at.z);
      P.pos.set(c.last.x, c.last.y + 0.05, c.last.z); P.vx = P.vz = P.vy = 0;
      snapCam();
      c.onFall?.(c.falls, at);
      return;
    }
    if (P.grounded && P.onSolid) {
      for (const cp of c.cps) if (!cp.reached && cp.plat && P.onSolid === cp.plat.solid) { cp.reached = true; c.last = cp; cp.flag.material.color.setHex(0x3cb371); cp.ring.material.color.setHex(0x7fe0a0); c.onCheckpoint?.(c.cps.indexOf(cp), c.cps.length - 1); }
      if (P.onSolid === c.goal.solid && c.active) { c.active = false; c.lamp.light(); c.onGoal?.(); }
      if (!c.started && c.plats.some((p) => p.solid === P.onSolid)) c.started = true;
    }
  }

  // ── the chase camera: drag to look around, wheel or pinch to zoom ──
  const camTarget = new THREE.Vector3(), camWant = new THREE.Vector3();
  function camGoal() {
    camTarget.set(P.pos.x, P.pos.y + 1.35, P.pos.z);
    const cp = Math.cos(cam.pitch);
    camWant.set(camTarget.x + Math.sin(cam.yaw) * cp * cam.dist, camTarget.y + Math.sin(cam.pitch) * cam.dist, camTarget.z + Math.cos(cam.yaw) * cp * cam.dist);
    const gy = heightAt(camWant.x, camWant.z) + 0.5;
    if (camWant.y < gy) camWant.y = gy;
  }
  function snapCam() { camGoal(); camera.position.copy(camWant); camera.lookAt(camTarget); }
  const pointers = new Map();
  let pinch = 0, downAt = null;
  const onKey = (e) => {
    const tag = e.target?.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    run = e.shiftKey;
    if (locked) { keys.clear(); return; }
    const k = e.key.toLowerCase(), down = e.type === 'keydown';
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) { down ? keys.add(k) : keys.delete(k); e.preventDefault(); }
    else if (k === ' ' || k === 'spacebar') { if (down && !e.repeat) jump(); e.preventDefault(); }
    else if (k === 'e' && down && !e.repeat && near) world.onHotspot?.(near);
    else if (k === 'f' && down && !e.repeat) strike();
    else if (down && !e.repeat) world.onKey?.(k);
  };
  // a strike (F, or the Smash button): the arm swings; what it hits is decided by the quest (only practice props)
  function strike() { if (locked || P.swing > 0 || P.climb || P.ladder) return; P.swing = 0.001; world.onStrike?.(); }
  addEventListener('keydown', onKey); addEventListener('keyup', onKey);
  const blurKeys = () => { keys.clear(); run = false; };
  addEventListener('blur', blurKeys);
  canvas.addEventListener('pointerdown', (e) => { pointers.set(e.pointerId, [e.clientX, e.clientY]); downAt = [e.clientX, e.clientY]; if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = Math.hypot(a[0] - b[0], a[1] - b[1]); } try { canvas.setPointerCapture(e.pointerId); } catch {} });
  const onUp = (e) => {
    if (!pointers.has(e.pointerId)) return;
    if (pointers.size === 1 && downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) < 6) tap(e);
    pointers.delete(e.pointerId); if (pointers.size < 2) pinch = 0;
  };
  canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('pointermove', (e) => {
    const p = pointers.get(e.pointerId); if (!p) return;
    if (pointers.size === 2) {
      pointers.set(e.pointerId, [e.clientX, e.clientY]);
      const [a, b] = [...pointers.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (pinch) cam.dist = THREE.MathUtils.clamp(cam.dist * (pinch / d), 3, 16); pinch = d; return;
    }
    if (!cine) { hold = false; cam.yaw -= (e.clientX - p[0]) * 0.006; cam.pitch = THREE.MathUtils.clamp(cam.pitch + (e.clientY - p[1]) * 0.004, -0.15, 1.2); }
    pointers.set(e.pointerId, [e.clientX, e.clientY]);
  });
  canvas.addEventListener('wheel', (e) => { e.preventDefault(); cam.dist = THREE.MathUtils.clamp(cam.dist * (1 + Math.sign(e.deltaY) * 0.1), 3, 16); }, { passive: false });
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function tap(e) {
    if (locked) return;
    const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(hotspots.map((h) => h.group), true)[0];
    if (hit) { const h = hotspots.find((x) => x.group === hit.object.parent || x.group === hit.object); if (h) world.onHotspot?.(h); }
  }
  const BOUND = 230;

  // markers: golden glow (Explorer) or plain (Master Explorer)
  let glowOn = true;
  function styleHotspot(h) { const [beam, , halo] = h.group.children; beam.material.opacity = glowOn ? 0.22 : 0.07; halo.visible = glowOn; }
  const addHotspot0 = addHotspot;
  function addHotspotStyled(o) { clearAround(o.x, o.z, (o.radius ?? 4.5) + 1); const h = addHotspot0(o); styleHotspot(h); return h; }
  function setGlow(on) { glowOn = on; hotspots.forEach(styleHotspot); }

  // camera moves for cinematics: a list of [position, lookAt, seconds]
  let cine = null;
  // after a cinematic the camera stays where it ended until the explorer moves or is placed somewhere
  let hold = false;
  function fly(shots) { return new Promise((resolve) => { cine = { shots, i: 0, t: 0, resolve }; }); }
  // put the explorer at (x, z), facing (lx, lz), with the camera behind
  function place(x, z, lx, lz, { snap = true } = {}) {
    P.pos.set(x, heightAt(x, z), z); P.vx = P.vz = P.vy = 0; P.climb = null; P.ladder = null; hold = false;
    const [fl] = floorAt(x, z, P.pos.y + 20); P.pos.y = fl;
    if (lx != null) { P.yaw = Math.atan2(-(lx - x), -(lz - z)); cam.yaw = P.yaw; }
    cam.pitch = 0.32; if (snap) snapCam();
  }
  function teleport(x, z, y = null) { P.pos.set(x, y ?? floorAt(x, z, 200)[0], z); P.vx = P.vz = P.vy = 0; P.climb = null; P.grounded = y == null; hold = false; snapCam(); }

  // ── the loop ──
  const updaters = new Set();
  let lastT = performance.now(), elapsed = 0;
  function every(fn) { updaters.add(fn); return () => updaters.delete(fn); }
  let running = true, near = null, lastDraw = 0, fps = 60, frames = 0, fpsT = 0;
  function resize() { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  const ro = new ResizeObserver(resize); ro.observe(canvas);
  const dummy = new THREE.Object3D();
  function frame() {
    if (!running) return;
    const now = performance.now(), dt = Math.min(0.1, (now - lastT) / 1000); lastT = now; elapsed += dt; const t = elapsed;   // at most a tenth of a second a frame, so a slow frame never jumps through a roof
    frames++; fpsT += dt; if (fpsT >= 1) { fps = frames / fpsT; frames = 0; fpsT = 0; }
    let pose = { speed: 0 };
    if (cine) {
      const s = cine.shots[cine.i], prev = cine.i ? cine.shots[cine.i - 1] : [camera.position.toArray(), null, 0];
      cine.t += dt;
      const k = s[2] ? THREE.MathUtils.smootherstep(Math.min(1, cine.t / s[2]), 0, 1) : 1;
      const from = new THREE.Vector3(...(cine.from ??= prev[0])), to = new THREE.Vector3(...s[0]);
      camera.position.lerpVectors(from, to, k);
      if (s[1]) camera.lookAt(...s[1]);
      if (cine.t >= s[2]) { cine.i++; cine.t = 0; cine.from = s[0]; if (cine.i >= cine.shots.length) { const r = cine.resolve; cine = null; hold = true; r(); } }
    } else {
      updateMovers(dt);
      pose = updatePlayer(dt);
      updateCourse();
      if (hold && (pose.speed > 0.02 || pose.air || pose.climb)) hold = false;
      if (!hold) {
        camGoal();
        camera.position.lerp(camWant, 1 - Math.exp(-dt * 10));
        camera.lookAt(camTarget);
      }
      // the nearest marker within reach
      let best = null;
      for (const h of hotspots) { const d = Math.hypot(h.x - P.pos.x, h.z - P.pos.z); if (d < h.radius && (h.y == null || Math.abs(P.pos.y - h.y) < 3) && (!best || d < best.d)) best = { h, d }; }
      if ((best?.h ?? null) !== near) { near = best?.h ?? null; world.onNear?.(near); }
      // collecting
      if (!locked) {
        const cy = P.pos.y + 0.8;
        for (const o of orbs) if (o.on && Math.abs(o.x - P.pos.x) < 1.1 && Math.abs(o.z - P.pos.z) < 1.1 && Math.abs(o.y - cy) < 1.4) { o.on = false; world.onLight?.(o); }
        for (const p of [...pickups]) if (Math.hypot(p.x - P.pos.x, p.z - P.pos.z) < p.r && Math.abs(p.y - cy) < 1.8) { removePickup(p); p.onTake?.(p); }
      }
    }
    if (P.swing > 0) { P.swing += dt / 0.32; if (P.swing >= 1) P.swing = 0; }
    if (avatar) {
      avatar.root.position.copy(P.pos); avatar.root.rotation.y = P.yaw + Math.PI;
      avatar.animate(dt, { ...pose, t, swing: P.swing, carry: P.carry });
      const [fl] = floorAt(P.pos.x, P.pos.z, P.pos.y);
      avatar.blob.position.set(P.pos.x, fl + 0.03, P.pos.z);
      const k = THREE.MathUtils.clamp(1 - (P.pos.y - fl) / 6, 0.3, 1); avatar.blob.scale.setScalar(k);
    }
    for (const h of hotspots) { h.orb.position.y = 1.4 + Math.sin(t * 2 + h.x) * 0.15; }
    for (let i = 0; i < orbs.length; i++) {
      const o = orbs[i];
      dummy.position.set(o.x, o.y + Math.sin(t * 2.4 + i) * 0.12, o.z); dummy.rotation.set(0, t * 2 + i, 0); dummy.scale.setScalar(o.on ? 1 : 0); dummy.updateMatrix(); orbMesh.setMatrixAt(i, dummy.matrix);
    }
    if (orbs.length) orbMesh.instanceMatrix.needsUpdate = true;
    for (const p of pickups) { p.obj.rotation.y = t * 1.6; p.obj.position.y = p.y + Math.sin(t * 2 + p.x) * 0.12; }
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
  const noor = CITY ? buildCity() : CANOPY ? buildCanopy() : NOOR ? buildNoor() : null;
  function buildCity() {
    const stone = new THREE.MeshStandardMaterial({ color: 0xE2D6BE, roughness: 0.95 });   // light sandstone
    const white = new THREE.MeshStandardMaterial({ color: 0xF2EDE2, roughness: 0.9 });
    const sand = new THREE.MeshStandardMaterial({ color: 0xE3CFA8, roughness: 0.95 });
    const roofM = new THREE.MeshStandardMaterial({ color: 0xD9CBB0, roughness: 0.95 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x5A4632, roughness: 0.9 });
    const teal = new THREE.MeshStandardMaterial({ color: 0x2F6F62, roughness: 0.7 });
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x4F9FC0, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.85 });
    const add = (m, x, y, z) => { m.position.set(x, y, z); m.castShadow = Q.shadows; m.receiveShadow = Q.shadows; scene.add(m); return m; };
    const H = (x, z) => heightAt(x, z);
    // the plaza and its fountain
    add(new THREE.Mesh(new THREE.CylinderGeometry(50, 50, 0.3, 64), stone), 0, H(0, 0) + 0.15, 0);
    const fy = H(0, 0);
    add(new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.6, 0.9, 32), white), 0, fy + 0.6, 0); addSolid(-4.2, 4.2, -4.2, 4.2, fy - 1, fy + 1.05, { climb: false });
    add(new THREE.Mesh(new THREE.CylinderGeometry(3.9, 3.9, 0.1, 32), waterMat), 0, fy + 1.0, 0);
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 2.6, 12), white), 0, fy + 2.1, 0);
    add(new THREE.Mesh(new THREE.CylinderGeometry(1.6, 0.6, 0.5, 20), white), 0, fy + 3.4, 0);
    // water gardens: long pools with low rims, and cypress trees
    for (const [px, pz, w, d] of [[-24, 14, 6, 18], [24, -14, 6, 18], [-24, -18, 6, 14]]) {
      const y = H(px, pz);
      add(new THREE.Mesh(new THREE.BoxGeometry(w + 1, 0.5, d + 1), white), px, y + 0.25, pz);
      add(new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, d), waterMat), px, y + 0.52, pz);
      addSolid(px - (w + 1) / 2, px + (w + 1) / 2, pz - (d + 1) / 2, pz + (d + 1) / 2, y - 1, y + 0.55);
    }
    const cyp = new THREE.MeshStandardMaterial({ color: 0x2F6B3A, roughness: 0.9, flatShading: true });
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2, r = 52 + (i % 3) * 2.5, x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (x > 20 && z > 0 && z < 34) continue;   // the lane to the rooftop climb
      const y = H(x, z);
      add(new THREE.Mesh(new THREE.ConeGeometry(1.4, 8, 8), cyp), x, y + 4.4, z); addSolid(x - 0.6, x + 0.6, z - 0.6, z + 0.6, y - 1, y + 7, { climb: false });
    }
    // houses around the plaza: white and sand boxes with a dark door and a roof rim, kept off the lane and the great buildings
    let seed = 13; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2 + rnd() * 0.05, r = 66 + rnd() * 50, x = Math.cos(a) * r, z = Math.sin(a) * r;
      if ((x > 18 && z > -6 && z < 40) || Math.hypot(x, z + 86) < 26 || Math.hypot(x + 56, z + 6) < 26) continue;
      const w = 9 + rnd() * 7, d = 8 + rnd() * 6, h = 5 + rnd() * 6, y = H(x, z);
      const m = add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), rnd() < 0.5 ? white : sand), x, y + h / 2, z);
      m.rotation.y = 0;
      add(new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.5, d + 0.6), roofM), x, y + h + 0.25, z);
      const toC = Math.atan2(-x, -z), dx = Math.sin(toC), dz = Math.cos(toC);
      add(new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.6, 1.6), dark), x + dx * (d / 2), y + 1.3, z + dz * (d / 2));
      addSolid(x - w / 2, x + w / 2, z - d / 2, z + d / 2, y - 1, y + h + 0.5);
    }
    // the learning hall: a raised floor, a row of columns and a pediment, open towards the plaza
    const HL = { x: -56, z: -6 }, hy = H(HL.x, HL.z);
    add(new THREE.Mesh(new THREE.BoxGeometry(18, 0.8, 28), stone), HL.x, hy + 0.4, HL.z); addSolid(HL.x - 9, HL.x + 9, HL.z - 14, HL.z + 14, hy - 1, hy + 0.8);
    add(new THREE.Mesh(new THREE.BoxGeometry(12, 10, 26), white), HL.x - 3, hy + 5.8, HL.z); addSolid(HL.x - 9, HL.x + 3, HL.z - 13, HL.z + 13, hy, hy + 10.8, { climb: false });
    for (let k = 0; k < 6; k++) { const cz = HL.z - 11 + k * 4.4; add(new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 9, 12), white), HL.x + 7.5, hy + 5.3, cz); addSolid(HL.x + 6.9, HL.x + 8.1, cz - 0.6, cz + 0.6, hy + 0.8, hy + 9.8, { climb: false }); }
    add(new THREE.Mesh(new THREE.BoxGeometry(18, 1, 28), white), HL.x, hy + 10.3, HL.z);
    add(new THREE.Mesh(new THREE.BoxGeometry(14, 1.2, 24), roofM), HL.x - 1, hy + 11.4, HL.z);
    add(new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.2, 6), dark), HL.x + 3.2, hy + 2.4, HL.z);
    // the three stations: small pavilions with a lantern, around the plaza
    const STATIONS = [{ x: 16, z: -30 }, { x: -18, z: 30 }, { x: 34, z: 4 }];
    for (const st of STATIONS) {
      const y = H(st.x, st.z);
      add(new THREE.Mesh(new THREE.BoxGeometry(5, 0.4, 5), stone), st.x, y + 0.2, st.z);
      for (const [cx, cz] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) add(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 3.6, 8), white), st.x + cx, y + 2.2, st.z + cz);
      add(new THREE.Mesh(new THREE.ConeGeometry(3.8, 2, 4), teal), st.x, y + 5, st.z).rotation.y = Math.PI / 4;
      st.y = y;
    }
    // the observatory: a round tower and a dome, with the beacon above it
    const OB = { x: 0, z: -86 }, oy = H(OB.x, OB.z);
    add(new THREE.Mesh(new THREE.CylinderGeometry(8, 9, 16, 24), white), OB.x, oy + 8, OB.z); addSolid(OB.x - 8.5, OB.x + 8.5, OB.z - 8.5, OB.z + 8.5, oy - 1, oy + 16, { climb: false });
    add(new THREE.Mesh(new THREE.SphereGeometry(8.4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), teal), OB.x, oy + 16, OB.z);
    add(new THREE.Mesh(new THREE.BoxGeometry(1.2, 6, 0.4), dark), OB.x, oy + 18, OB.z + 7.6).rotation.x = -0.5;
    add(new THREE.Mesh(new THREE.BoxGeometry(3, 4, 0.5), dark), OB.x, oy + 2, OB.z + 8.8);
    const by = oy + 28;
    const crystalMat = new THREE.MeshStandardMaterial({ color: 0x9fb4c8, emissive: 0xffd27a, emissiveIntensity: 0.05, roughness: 0.2 });
    const crystal = add(new THREE.Mesh(new THREE.OctahedronGeometry(2, 0), crystalMat), OB.x, by, OB.z);
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 3.6, 8), white), OB.x, oy + 25, OB.z);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0xffcf5a, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, fog: false });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(1, 0.45, 90, 16, 1, true), beamMat); beam.position.set(OB.x, by + 45, OB.z); scene.add(beam);
    let beaconK = 0;
    every((dt) => {
      crystalMat.emissiveIntensity += (0.05 + beaconK * 2.2 - crystalMat.emissiveIntensity) * Math.min(1, dt * 1.5);
      beamMat.opacity += (beaconK * 0.55 - beamMat.opacity) * Math.min(1, dt * 1.5); beam.visible = beamMat.opacity > 0.01;
      crystal.rotation.y += dt * 0.5;
    });
    return {
      streamZ: () => -1e9, beacon: { x: OB.x, z: OB.z, y: by }, hall: { ...HL, y: hy, door: { x: HL.x + 12, z: HL.z } }, observatory: { ...OB, y: oy, door: { x: OB.x, z: OB.z + 13 } },
      stations: STATIONS, fountain: { x: 0, z: 0 },
      setBeacon(k) { beaconK = THREE.MathUtils.clamp(k, 0, 1); },
      turnWheel() {}, mendBridge() {},
      protectedAt: (x, z, r = 0) => Math.hypot(x, z) < 8 + r || Math.hypot(x - HL.x, z - HL.z) < 18 + r || Math.hypot(x - OB.x, z - OB.z) < 14 + r || STATIONS.some((st) => Math.hypot(x - st.x, z - st.z) < 5 + r),
    };
  }
  function buildCanopy() {
    const bark = new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: 1, map: stoneTex });
    const wood = new THREE.MeshStandardMaterial({ color: 0x9a6a3c, roughness: 0.9 });
    const rope = new THREE.MeshStandardMaterial({ color: 0xd8c39a, roughness: 1 });
    const stone = new THREE.MeshStandardMaterial({ color: 0xcfc6b4, roughness: 0.95, map: stoneTex });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2f7a3a, roughness: 0.85, flatShading: true });
    const add = (m, x, y, z) => { m.position.set(x, y, z); m.castShadow = Q.shadows; m.receiveShadow = Q.shadows; scene.add(m); return m; };
    const DECK = 20;   // the height of the decks and walkways
    const TREES = { great: { x: 0, z: -44 }, west: { x: -42, z: -22 }, east: { x: 42, z: -22 }, hollow: { x: -34, z: -82 }, roots: { x: 34, z: -80 } };
    const glowLeaves = [];
    for (const [key, t] of Object.entries(TREES)) {
      const by = heightAt(t.x, t.z), R = key === 'great' ? 4.6 : 3.6;
      add(new THREE.Mesh(new THREE.CylinderGeometry(R * 0.85, R * 1.25, 62, 14), bark), t.x, by + 31, t.z);
      addSolid(t.x - R, t.x + R, t.z - R, t.z + R, by - 1, by + 62, { climb: false });
      // big roots at the foot
      for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.3; const r = add(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.1, 7, 6), bark), t.x + Math.cos(a) * (R + 1.6), by + 0.6, t.z + Math.sin(a) * (R + 1.6)); r.rotation.set(Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2); }
      // the crown: clusters of leaves high above the decks
      for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; const c = add(new THREE.Mesh(new THREE.IcosahedronGeometry(9 + Math.random() * 4, 0), leafMat), t.x + Math.cos(a) * 11, by + 50 + Math.random() * 8, t.z + Math.sin(a) * 11); c.castShadow = false; }
      add(new THREE.Mesh(new THREE.IcosahedronGeometry(14, 0), leafMat), t.x, by + 60, t.z).castShadow = false;
      // spiral steps around the trunk, just outside the deck: each one a little jump higher, the last one level with the deck
      const n = Math.round(DECK / 1.05);
      for (let i = 1; i <= n; i++) {
        const a = i * 0.26 + (key === 'west' ? 1.6 : key === 'east' ? -1.6 : 0), rr = R + 5.8, sx = t.x + Math.cos(a) * rr, sz = t.z + Math.sin(a) * rr, sy = by + i * (DECK / n);
        const st = add(new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.45, 2.1), wood), sx, sy - 0.22, sz); st.rotation.y = -a;
        addSolid(sx - 1.15, sx + 1.15, sz - 1.15, sz + 1.15, sy - 0.45, sy);
      }
      // the deck: a square platform around the trunk, with a low rail
      const D = R + 4.5;
      add(new THREE.Mesh(new THREE.BoxGeometry(D * 2, 0.5, D * 2), wood), t.x, by + DECK - 0.25, t.z);
      addSolid(t.x - D, t.x + D, t.z - D, t.z + D, by + DECK - 0.5, by + DECK);
      for (const [dx, dz, w, d] of [[0, -D, D * 2, 0.15], [0, D, D * 2, 0.15], [-D, 0, 0.15, D * 2], [D, 0, 0.15, D * 2]]) add(new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, d), rope), t.x + dx, by + DECK + 1, t.z + dz);
      t.y = by + DECK; t.R = R; t.D = D;
      // glowing leaves drifting around the deck
      for (let i = 0; i < 10; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap(), color: 0xc8f07a, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })); sp.scale.setScalar(1.4); const a = Math.random() * 6.3, r = D + Math.random() * 6; sp.position.set(t.x + Math.cos(a) * r, by + DECK + 2 + Math.random() * 12, t.z + Math.sin(a) * r); sp.userData = { a, r, y0: sp.position.y, t: t }; scene.add(sp); glowLeaves.push(sp); }
    }
    // walkways between the decks (a row of planks; the solid is a chain of small boxes along the way)
    const walk = (A, B) => {
      const dx = B.x - A.x, dz = B.z - A.z, L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L;
      const x0 = A.x + ux * A.D, z0 = A.z + uz * A.D, x1 = B.x - ux * B.D, z1 = B.z - uz * B.D, len = Math.hypot(x1 - x0, z1 - z0), y = (A.y + B.y) / 2;
      const m = add(new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, len + 1), wood), (x0 + x1) / 2, y - 0.15, (z0 + z1) / 2); m.rotation.y = Math.atan2(dx, dz);
      for (const side of [-1, 1]) { const r = add(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, len + 1), rope), (x0 + x1) / 2 - uz * side * 1.25, y + 1, (z0 + z1) / 2 + ux * side * 1.25); r.rotation.y = Math.atan2(dx, dz); }
      for (let k = 0; k <= len; k += 0.8) { const x = x0 + ux * k, z = z0 + uz * k; addSolid(x - 1.1, x + 1.1, z - 1.1, z + 1.1, y - 0.3, y); }
    };
    walk(TREES.west, TREES.great); walk(TREES.great, TREES.east); walk(TREES.great, TREES.hollow); walk(TREES.great, TREES.roots);
    // the memory courtyard on the forest floor: a ring of stone with six standing stones
    const CY = { x: 0, z: 6 }, cy = heightAt(CY.x, CY.z);
    add(new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 0.3, 40), stone), CY.x, cy + 0.15, CY.z);
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; add(new THREE.Mesh(new THREE.BoxGeometry(1.1, 3.2, 0.8), stone), CY.x + Math.cos(a) * 8, cy + 1.6, CY.z + Math.sin(a) * 8).rotation.y = -a; addSolid(CY.x + Math.cos(a) * 8 - 0.6, CY.x + Math.cos(a) * 8 + 0.6, CY.z + Math.sin(a) * 8 - 0.6, CY.z + Math.sin(a) * 8 + 0.6, cy - 1, cy + 3.2, { climb: false }); }
    add(new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 1, 12), wood), CY.x, cy + 0.5, CY.z);   // a reading stump
    // smaller trees all around, so the giants stand in a forest
    const keep = (x, z) => Object.values(TREES).some((t) => Math.hypot(x - t.x, z - t.z) < 16) || Math.hypot(x - CY.x, z - CY.z) < 14 || (Math.abs(x) < 10 && z > 0 && z < 50);
    const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.4, 0.6, 6, 6), bark, 160);
    const crowns = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(3.4, 0), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, flatShading: true }), 160);
    const dd = new THREE.Object3D(); let n = 0, tries = 0;
    while (n < 160 && tries++ < 4000) {
      const a = Math.random() * Math.PI * 2, r = 24 + Math.random() * 220, x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (keep(x, z)) continue;
      const h = heightAt(x, z), sc = 0.9 + Math.random() * 0.8;
      dd.position.set(x, h + 3 * sc, z); dd.scale.set(sc, sc, sc); dd.rotation.set(0, Math.random() * 6, 0); dd.updateMatrix(); trunks.setMatrixAt(n, dd.matrix);
      dd.position.set(x, h + 7 * sc, z); dd.updateMatrix(); crowns.setMatrixAt(n, dd.matrix);
      crowns.setColorAt(n, new THREE.Color(0x2f7a3a).offsetHSL((Math.random() - 0.5) * 0.05, 0, (Math.random() - 0.5) * 0.12));
      if (r < 110) addSolid(x - 0.6, x + 0.6, z - 0.6, z + 0.6, h - 1, h + 5, { climb: false });
      n++;
    }
    trunks.count = crowns.count = n; scene.add(trunks, crowns);
    // the second beacon: a crystal on a stone stand on the great tree's deck
    const G = TREES.great, bx = G.x + G.D - 2, bz = G.z;
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.1, 2.4, 8), stone), bx, G.y + 1.2, bz);
    addSolid(bx - 0.9, bx + 0.9, bz - 0.9, bz + 0.9, G.y, G.y + 2.4, { climb: false });
    const crystalMat = new THREE.MeshStandardMaterial({ color: 0x9fc8b4, emissive: 0xffd27a, emissiveIntensity: 0.05, roughness: 0.2 });
    const crystal = add(new THREE.Mesh(new THREE.OctahedronGeometry(1.3, 0), crystalMat), bx, G.y + 3.8, bz);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0xffcf5a, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, fog: false });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.4, 70, 16, 1, true), beamMat); beam.position.set(bx, G.y + 3.8 + 35, bz); scene.add(beam);
    let beaconK = 0;
    every((dt, t) => {
      crystalMat.emissiveIntensity += (0.05 + beaconK * 2.2 - crystalMat.emissiveIntensity) * Math.min(1, dt * 1.5);
      beamMat.opacity += (beaconK * 0.55 - beamMat.opacity) * Math.min(1, dt * 1.5); beam.visible = beamMat.opacity > 0.01;
      crystal.rotation.y += dt * 0.5;
      for (const sp of glowLeaves) { const u = sp.userData; u.a += dt * 0.15; sp.position.set(u.t.x + Math.cos(u.a) * u.r, u.y0 + Math.sin(t * 0.8 + u.a * 3) * 0.8, u.t.z + Math.sin(u.a) * u.r); }
    });
    // whoever falls from the trees lands softly on the forest floor (nothing is lost; climb again)
    const deckOf = (k) => ({ x: TREES[k].x, z: TREES[k].z, y: TREES[k].y, D: TREES[k].D, R: TREES[k].R });
    return {
      streamZ: () => -1e9, courtyard: { ...CY, y: cy }, beacon: { x: bx, z: bz, y: G.y + 3.8 }, trees: Object.fromEntries(Object.keys(TREES).map((k) => [k, deckOf(k)])), deck: DECK,
      setBeacon(k) { beaconK = THREE.MathUtils.clamp(k, 0, 1); },
      turnWheel() {}, mendBridge() {},
      // the foot of a tree's spiral steps, to start a climb
      stairFoot(k) { const t = TREES[k], a = 0.26 + (k === 'west' ? 1.6 : k === 'east' ? -1.6 : 0), rr = t.R + 5.8; return { x: t.x + Math.cos(a) * (rr + 2.5), z: t.z + Math.sin(a) * (rr + 2.5) }; },
      protectedAt: (x, z, r = 0) => Object.values(TREES).some((t) => Math.hypot(x - t.x, z - t.z) < t.D + 2 + r) || Math.hypot(x - CY.x, z - CY.z) < 10 + r,
    };
  }
  function buildNoor() {
    const wood = new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.9 });
    const stone = new THREE.MeshStandardMaterial({ color: 0xcfc6b4, roughness: 0.95, map: stoneTex });
    const pale = new THREE.MeshStandardMaterial({ color: 0xece4d2, roughness: 0.9 });
    const add = (m, x, y, z) => { m.position.set(x, y, z); m.castShadow = Q.shadows; m.receiveShadow = Q.shadows; scene.add(m); return m; };
    // the stream: a ribbon of water following the channel
    const W = 4.4, wp = [], wi = [];
    let i0 = 0;
    for (let x = -420; x <= 420; x += 6, i0++) { const z = streamZ(x); wp.push(x, -0.9, z - W, x, -0.9, z + W); if (i0) { const a = (i0 - 1) * 2; wi.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
    const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(wp, 3)); wg.setIndex(wi); wg.computeVertexNormals();
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x4fa3c7, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.82, side: THREE.DoubleSide });
    scene.add(new THREE.Mesh(wg, waterMat));
    // trees, kept off the path, the stream and the learning places
    const keep = (x, z) => (Math.abs(x) < 16 && z > -30 && z < 60) || Math.abs(z - streamZ(x)) < 10 || Math.hypot(x, z + 150) < 26 || Math.hypot(x + 30, z + 34) < 16 || Math.hypot(x - 26, z + 46) < 14;
    const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.35, 0.5, 4, 6), wood, 170);
    const crowns = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(2.8, 0), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, flatShading: true }), 170);
    const d = new THREE.Object3D(); let n = 0, tries = 0;
    while (n < 170 && tries++ < 4000) {
      const a = Math.random() * Math.PI * 2, r = 30 + Math.random() * 230, x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (keep(x, z)) continue;
      const h = heightAt(x, z), s = 0.8 + Math.random() * 0.7;
      d.position.set(x, h + 2 * s, z); d.scale.set(s, s, s); d.rotation.set(0, Math.random() * 6, 0); d.updateMatrix(); trunks.setMatrixAt(n, d.matrix);
      d.position.set(x, h + 5.2 * s, z); d.scale.set(s, s * (0.9 + Math.random() * 0.4), s); d.updateMatrix(); crowns.setMatrixAt(n, d.matrix);
      crowns.setColorAt(n, new THREE.Color(0x3f8a3c).offsetHSL((Math.random() - 0.5) * 0.06, 0, (Math.random() - 0.5) * 0.12));
      if (r < 120) addSolid(x - 0.5, x + 0.5, z - 0.5, z + 0.5, h - 1, h + 3.5, { climb: false });
      n++;
    }
    trunks.count = crowns.count = n; trunks.castShadow = crowns.castShadow = Q.shadows; scene.add(trunks, crowns);
    // the stone path from the meadow to the pavilion
    for (let z = 40; z > -2; z -= 2.2) add(new THREE.Mesh(new THREE.BoxGeometry(3 + Math.random() * 0.6, 0.16, 1.8), stone), Math.sin(z / 9) * 1.4, heightAt(0, z) + 0.06, z);
    // the learning pavilion: a raised floor, eight pillars and a roof, open on every side
    const PV = { x: 0, z: -12 }, py = heightAt(PV.x, PV.z);
    add(new THREE.Mesh(new THREE.BoxGeometry(14, 0.5, 14), stone), PV.x, py + 0.25, PV.z); addSolid(PV.x - 7, PV.x + 7, PV.z - 7, PV.z + 7, py - 1, py + 0.5);
    for (const [cx, cz] of [[-6, -6], [6, -6], [-6, 6], [6, 6], [0, -6], [-6, 0], [6, 0]]) {
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 5, 10), pale), PV.x + cx, py + 3, PV.z + cz);
      addSolid(PV.x + cx - 0.45, PV.x + cx + 0.45, PV.z + cz - 0.45, PV.z + cz + 0.45, py + 0.5, py + 5.5, { climb: false });
    }
    add(new THREE.Mesh(new THREE.BoxGeometry(15, 0.6, 15), pale), PV.x, py + 5.8, PV.z);
    add(new THREE.Mesh(new THREE.ConeGeometry(10.4, 3.6, 4), new THREE.MeshStandardMaterial({ color: 0x2f6f62, roughness: 0.7 })), PV.x, py + 7.9, PV.z).rotation.y = Math.PI / 4;
    add(new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 1), wood), PV.x, py + 0.95, PV.z - 2);
    add(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 0.8), new THREE.MeshStandardMaterial({ color: 0x2e4057 })), PV.x, py + 1.45, PV.z - 2).rotation.x = -0.3;
    // the beacon on its hill: a stone tower and a crystal that gathers light as the valley is restored
    const BX = 0, BZ = -150, by = heightAt(BX, BZ);
    add(new THREE.Mesh(new THREE.CylinderGeometry(2.2, 3.4, 16, 8), stone), BX, by + 8, BZ); addSolid(BX - 2.6, BX + 2.6, BZ - 2.6, BZ + 2.6, by - 1, by + 16, { climb: false });
    const crystalMat = new THREE.MeshStandardMaterial({ color: 0x9fb4c8, emissive: 0xffd27a, emissiveIntensity: 0.05, roughness: 0.2 });
    const crystal = add(new THREE.Mesh(new THREE.OctahedronGeometry(2.2, 0), crystalMat), BX, by + 19, BZ);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap(), color: 0xffd27a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.scale.setScalar(26); halo.position.set(BX, by + 19, BZ); scene.add(halo);
    // a column of light rises from the crystal as the beacon gathers light (seen even against a bright sky)
    const beamMat = new THREE.MeshBasicMaterial({ color: 0xffcf5a, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, fog: false });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 0.5, 90, 16, 1, true), beamMat); beam.position.set(BX, by + 19 + 45, BZ); scene.add(beam);
    let beaconK = 0;
    // the waterwheel beside the stream, with a dry channel that fills when it turns
    const WX = -30, wz = streamZ(WX) + 5.4, wheel = new THREE.Group();
    wheel.add(new THREE.Mesh(new THREE.TorusGeometry(3, 0.25, 8, 28), wood));
    for (let i = 0; i < 8; i++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.2, 6, 0.2), wood); sp.rotation.z = (i / 8) * Math.PI; wheel.add(sp); const pd = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 1.4), wood); const a = (i / 8) * Math.PI * 2; pd.position.set(Math.cos(a) * 3, Math.sin(a) * 3, 0); pd.rotation.z = a; wheel.add(pd); }
    wheel.rotation.y = Math.PI / 2; wheel.position.set(WX, 2.2, wz - 2.5); scene.add(wheel);
    add(new THREE.Mesh(new THREE.BoxGeometry(0.6, 3, 0.6), wood), WX - 0.2, 1.2, wz - 1); add(new THREE.Mesh(new THREE.BoxGeometry(0.6, 3, 0.6), wood), WX - 0.2, 1.2, wz - 4);
    const canalY = heightAt(WX, wz + 8) + 0.05;
    add(new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 18), new THREE.MeshStandardMaterial({ color: 0x8a7a5c, roughness: 1 })), WX, canalY, wz + 9);
    const canal = add(new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 18), waterMat), WX, canalY + 0.06, wz + 9); canal.scale.z = 0.001; canal.visible = false;
    let spin = 0;
    // the broken bridge: two stone ends, and planks; three are missing until the bridge is mended
    const BRX = 26, bz = streamZ(BRX);
    add(new THREE.Mesh(new THREE.BoxGeometry(6, 0.8, 2.4), stone), BRX, heightAt(BRX, bz + 7) + 0.1, bz + 6.6);
    add(new THREE.Mesh(new THREE.BoxGeometry(6, 0.8, 2.4), stone), BRX, heightAt(BRX, bz - 7) + 0.1, bz - 6.6);
    const planks = [];
    for (let i = 0; i < 9; i++) { const p = add(new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.25, 1.15), wood), BRX, 0.35, bz - 4.6 + i * 1.15); p.userData.y = 0.35; planks.push(p); }
    const broken = [planks[1], planks[4], planks[7]];
    broken.forEach((p) => { p.visible = false; });
    let mended = false;
    // the fast water: anyone who steps into the stream is helped back to the bank they came from
    let lastBank = 1;
    every(() => {
      const zs = streamZ(P.pos.x), side = Math.sign(P.pos.z - zs) || 1;
      if (Math.abs(P.pos.z - zs) > 6.5) lastBank = side;
      if (P.pos.y < -1.2 && !locked && !cine) { teleport(P.pos.x, zs + lastBank * 8); world.onSplash?.(); }
    });
    every((dt) => {
      if (spin) wheel.rotation.x -= dt * spin;
      if (canal.visible && canal.scale.z < 1) canal.scale.z = Math.min(1, canal.scale.z + dt * 0.4);
      halo.material.opacity += (beaconK * 0.95 - halo.material.opacity) * Math.min(1, dt * 1.5);
      crystalMat.emissiveIntensity += (0.05 + beaconK * 2.2 - crystalMat.emissiveIntensity) * Math.min(1, dt * 1.5);
      crystal.rotation.y += dt * 0.4;
      beamMat.opacity += (beaconK * 0.55 - beamMat.opacity) * Math.min(1, dt * 1.5); beam.visible = beamMat.opacity > 0.01;
    });
    return {
      streamZ, pavilion: { ...PV, y: py }, beacon: { x: BX, z: BZ, y: by + 19 }, wheel: { x: WX, z: wz }, bridge: { x: BRX, z: bz },
      setBeacon(k) { beaconK = THREE.MathUtils.clamp(k, 0, 1); },
      turnWheel(on = true) { spin = on ? 1.6 : 0; if (on) canal.visible = true; if (on && !canal.scale.z) canal.scale.z = 0.001; },
      mendBridge(instant = false) {
        if (mended) return; mended = true;
        addSolid(BRX - 2.8, BRX + 2.8, bz - 5.2, bz + 5.2, -3, 0.48);
        broken.forEach((p, i) => {
          p.visible = true;
          if (instant) return;
          p.position.y = 6; const t0 = performance.now() + i * 450;
          const off = every(() => { const k = Math.min(1, Math.max(0, (performance.now() - t0) / 700)); p.position.y = 6 + (p.userData.y - 6) * k; if (k >= 1) off(); });
        });
      },
      get mended() { return mended; },
      protectedAt: (x, z, r = 0) => Math.hypot(x - PV.x, z - PV.z) < 10 + r || Math.hypot(x - BX, z - BZ) < 8 + r || Math.abs(z - streamZ(x)) < 8 + r,
    };
  }
  const world = {
    THREE, scene, camera, renderer, heightAt, setTime, addHotspot: addHotspotStyled, removeHotspot, clearHotspots, lantern, creature, flock, spring, well,
    fly, place, teleport, setPad, jump, setAvatar, setGlow, kaaba, ring, onHotspot: null, onNear: null, time: 'day', ARCHIVE,
    addLights, addScroll, addThing, removePickup, poof, buildCourse, clearCourse, helpCourse,
    get course() { return course; },
    strike, setCarry(v) { P.carry = !!v; },
    // the House and the ground around it are protected: nothing is built, broken or climbed there
    protectedAt: (x, z, r = 0) => (NOOR ? noor.protectedAt(x, z, r) : Math.hypot(x, z) < CALM + 6 + r),
    noor,
    // the parts the props (props.mjs) build with
    k: { scene, addSolid, removeSolid, clearAround, glowMap, stoneTex, homeMat, roofMat, Q, P, over, floorAt, get locked() { return locked; } },
    lock(v) { locked = v; if (v) { keys.clear(); P.vx = P.vz = 0; } },
    every,
    near: () => near,
    player: () => ({ x: P.pos.x, y: P.pos.y, z: P.pos.z, yaw: P.yaw, grounded: P.grounded, onSolid: !!P.onSolid, camYaw: cam.yaw, climbing: !!P.climb }),
    lightsLeft: (tag) => orbs.filter((o) => o.on && (tag == null || o.tag === tag)).length,
    mapData: () => ({ hotspots, pickups, course, orbs }),
    fps: () => fps,
    aim(x, z) { cam.yaw = Math.atan2(-(x - P.pos.x), -(z - P.pos.z)); hold = false; },   // turn the camera (and so the stick) towards a point
    start() { resize(); snapCam(); requestAnimationFrame(frame); },
    pause(v) { if (v) { running = false; return; } if (!running) { running = true; lastT = performance.now(); resize(); requestAnimationFrame(frame); } },
    dispose() { running = false; ro.disconnect(); removeEventListener('keydown', onKey); removeEventListener('keyup', onKey); removeEventListener('blur', blurKeys); renderer.dispose(); },
  };
  setTime('day');
  return world;
}
