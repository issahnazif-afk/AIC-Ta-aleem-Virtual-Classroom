// Noor Trail world: a stone path through arcades and gardens at golden hour, made in code (no downloads).
// The path is built from 20 m segments that are recycled ahead of the runner. A shader curves the world gently
// (down towards the horizon, and left/right) so the straight path feels like it winds.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const SEG = 20, LANE = 2.2;
export const bendU = { value: new THREE.Vector2(0, 0.0011) };
export function bend(m) {
  m.onBeforeCompile = (s) => {
    s.uniforms.uBend = bendU;
    s.vertexShader = 'uniform vec2 uBend;\n' + s.vertexShader.replace('#include <project_vertex>',
      '#include <project_vertex>\n  mvPosition.x += mvPosition.z * mvPosition.z * uBend.x;\n  mvPosition.y -= mvPosition.z * mvPosition.z * uBend.y;\n  gl_Position = projectionMatrix * mvPosition;');
  };
  m.customProgramCacheKey = () => 'bend';
  return m;
}

// ---------- seeded random, so a run can be replayed ----------
export function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------- drawn textures ----------
function canvasTex(w, h, draw, rx = 1, ry = 1) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h, rng(w * 7 + h));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8;
  return t;
}
const speckle = (g, w, h, r, n, a) => { for (let i = 0; i < n; i++) { g.fillStyle = r() < 0.5 ? `rgba(60,40,20,${a})` : `rgba(255,245,225,${a})`; g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2); } };
function star8(g, cx, cy, R) {
  g.beginPath();
  for (let i = 0; i < 16; i++) { const a = (i * Math.PI) / 8 - Math.PI / 2, r = i % 2 ? R * 0.7654 : R; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
  g.closePath();
}
function makeTextures() {
  const stone = canvasTex(512, 512, (g, w, h, r) => {
    g.fillStyle = '#7F6A4E'; g.fillRect(0, 0, w, h);
    const n = 4, s = w / n;
    for (let j = 0; j < n; j++) for (let i = -1; i < n; i++) {
      const x = i * s + (j % 2) * s / 2, y = j * s;
      g.fillStyle = `hsl(${30 + r() * 10}, ${28 + r() * 14}%, ${64 + r() * 11}%)`;
      g.beginPath(); g.roundRect(x + 4, y + 4, s - 8, s - 8, 10); g.fill();
      g.fillStyle = 'rgba(255,248,230,.25)'; g.fillRect(x + 8, y + 6, s - 16, 3);
    }
    speckle(g, w, h, r, 5000, 0.12);
  });
  const sand = canvasTex(256, 256, (g, w, h, r) => {
    g.fillStyle = '#D6AE78'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(160,110,60,${0.05 + r() * 0.06})`; g.lineWidth = 2; g.beginPath(); const y = r() * h; g.moveTo(0, y); g.bezierCurveTo(w / 3, y + 8, (2 * w) / 3, y - 8, w, y); g.stroke(); }
    speckle(g, w, h, r, 3000, 0.15);
  });
  const plaster = canvasTex(256, 256, (g, w, h, r) => { g.fillStyle = '#EAD6B2'; g.fillRect(0, 0, w, h); speckle(g, w, h, r, 2500, 0.08); });
  const zellij = canvasTex(256, 64, (g, w, h) => {
    g.fillStyle = '#F2E8D5'; g.fillRect(0, 0, w, h);
    for (let x = 32; x < w + 32; x += 64) {
      g.fillStyle = '#1F7A80'; star8(g, x, 32, 26); g.fill();
      g.fillStyle = '#E2B84F'; star8(g, x, 32, 12); g.fill();
      g.fillStyle = '#2E4057'; g.beginPath(); g.moveTo(x + 32, 18); g.lineTo(x + 44, 32); g.lineTo(x + 32, 46); g.lineTo(x + 20, 32); g.closePath(); g.fill();
    }
    g.fillStyle = '#C08A3E'; g.fillRect(0, 0, w, 4); g.fillRect(0, h - 4, w, 4);
  }, SEG / 0.55, 1);
  const banner = canvasTex(512, 128, (g, w, h) => {
    g.fillStyle = '#8E2C3C'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#E2B84F'; g.fillRect(0, 10, w, 6); g.fillRect(0, h - 16, w, 6);
    for (let x = 32; x < w; x += 64) { g.fillStyle = '#E2B84F'; star8(g, x, h / 2, 26); g.fill(); g.fillStyle = '#1F7A80'; star8(g, x, h / 2, 13); g.fill(); }
    g.fillStyle = '#E2B84F'; for (let x = 0; x < w; x += 16) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + 8, h - 10); g.lineTo(x + 16, h); g.fill(); }
  });
  const awning = canvasTex(64, 64, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#F3E6CF' : '#C0473A'; g.fillRect((i * w) / 8, 0, w / 8, h); } });
  const rug = canvasTex(512, 64, (g, w, h) => {
    g.fillStyle = '#2E4057'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#C0473A'; g.fillRect(0, 8, w, h - 16);
    for (let x = 16; x < w; x += 32) { g.fillStyle = '#E2B84F'; g.beginPath(); g.moveTo(x, 14); g.lineTo(x + 12, 32); g.lineTo(x, 50); g.lineTo(x - 12, 32); g.closePath(); g.fill(); }
  });
  return { stone, sand, plaster, zellij, banner, awning, rug };
}

// ---------- shared geometry ----------
const nonIdx = (g) => (g.index ? g.toNonIndexed() : g);
const merge = (list) => mergeGeometries(list.map(nonIdx));
const at = (g, x, y, z) => g.translate(x, y, z);

function archGeo() {
  // one bay of the arcade: a 4 m wide wall with a pointed arch through it, 0.7 m thick, facing the path
  const s = new THREE.Shape();
  s.moveTo(-2, -0.3); s.lineTo(2, -0.3); s.lineTo(2, 5.0); s.lineTo(-2, 5.0); s.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-1.45, 0); hole.lineTo(1.45, 0); hole.lineTo(1.45, 3.0); hole.quadraticCurveTo(1.45, 3.95, 0, 4.45); hole.quadraticCurveTo(-1.45, 3.95, -1.45, 3.0); hole.closePath();
  s.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.7, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 1, curveSegments: 10 });
  g.translate(0, 0, -0.35); g.rotateY(Math.PI / 2);
  // scale the shape-space UVs down so the plaster texture is not stretched
  const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 0.25, uv.getY(i) * 0.25);
  return g;
}
function arcadeGeo() {
  const a = archGeo(), parts = [];
  for (const side of [-1, 1]) {
    const X = side * 6.4;
    for (let k = 0; k < 5; k++) parts.push(at(a.clone(), X, 0, -2 - k * 4));
    parts.push(at(new THREE.BoxGeometry(0.95, 0.35, SEG), X, 5.15, -SEG / 2));          // cornice
    parts.push(at(new THREE.BoxGeometry(3.2, 0.3, SEG), side * 7.9, 5.3, -SEG / 2));   // roof of the walkway
    parts.push(at(new THREE.BoxGeometry(0.4, 5.6, SEG), side * 9.4, 2.5, -SEG / 2));   // back wall
    for (let k = 0; k < 5; k++) {
      const d = new THREE.SphereGeometry(1.05, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2); d.scale(1, 0.9, 1);
      parts.push(at(d, side * 7.9, 5.45, -2 - k * 4));
    }
  }
  return merge(parts);
}
function lanternParts() {
  const body = new THREE.CylinderGeometry(0.15, 0.12, 0.34, 8);
  const metal = merge([
    at(new THREE.ConeGeometry(0.2, 0.2, 8), 0, 0.27, 0), at(new THREE.SphereGeometry(0.04, 8, 6), 0, 0.4, 0),
    at(new THREE.ConeGeometry(0.1, 0.12, 8).rotateX(Math.PI), 0, -0.23, 0),
  ]);
  return { body, metal };
}
function arcadeLanterns() {
  const { body, metal } = lanternParts(), B = [], Mt = [];
  for (const side of [-1, 1]) for (let k = 0; k < 5; k++) {
    const x = side * 6.4, z = -2 - k * 4;
    B.push(at(body.clone(), x, 3.2, z));
    Mt.push(at(metal.clone(), x, 3.2, z), at(new THREE.CylinderGeometry(0.012, 0.012, 1.0, 4), x, 3.9, z));
  }
  return { body: merge(B), metal: merge(Mt) };
}
function gardenGeo() {
  const { body, metal } = lanternParts(), stone = [], hedge = [], water = [], B = [], Mt = [];
  for (const side of [-1, 1]) {
    for (const z0 of [-0.2, -10.2]) hedge.push(at(new RoundedBoxGeometry(0.8, 0.75, 9.6, 2, 0.25), side * 4.55, 0.37, z0 - 4.8));
    water.push(at(new THREE.BoxGeometry(0.9, 0.06, SEG), side * 5.75, 0.08, -SEG / 2));
    stone.push(at(new THREE.BoxGeometry(0.18, 0.22, SEG), side * 5.2, 0.11, -SEG / 2), at(new THREE.BoxGeometry(0.18, 0.22, SEG), side * 6.3, 0.11, -SEG / 2));
    for (const z of [-5, -15]) {
      Mt.push(at(new THREE.CylinderGeometry(0.06, 0.08, 2.4, 8), side * 3.95, 1.2, z), at(metal.clone(), side * 3.95, 2.62, z));
      B.push(at(body.clone(), side * 3.95, 2.62, z));
    }
  }
  return { stone: merge(stone), hedge: merge(hedge), water: merge(water), lampBody: merge(B), lampMetal: merge(Mt) };
}
function palmGeo() {
  const pts = [];
  for (let i = 0; i <= 20; i++) pts.push(new THREE.Vector2(0.2 - i * 0.004 + (i % 2 ? 0.028 : 0), i * 0.25));
  pts.push(new THREE.Vector2(0, 5));
  const trunk = new THREE.LatheGeometry(pts, 10);
  const p = trunk.attributes.position;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setX(i, p.getX(i) + (y / 5) ** 2 * 0.6); }
  trunk.computeVertexNormals();
  const fr = [];
  for (let k = 0; k < 10; k++) {
    const f = new THREE.PlaneGeometry(0.6, 1, 1, 8), q = f.attributes.position;
    for (let i = 0; i < q.count; i++) {
      const t = q.getY(i) + 0.5, w = q.getX(i) * (t < 0.12 ? t * 8 : 1 - (t - 0.12) * 0.95);
      q.setXYZ(i, t * 2.7, -1.0 * t * t + Math.abs(w) * 0.35, w);
    }
    f.computeVertexNormals();
    f.rotateZ(0.25 + (k % 2) * 0.25); f.rotateY((k / 10) * Math.PI * 2 + (k % 2) * 0.3);
    fr.push(at(f, 0.6, 4.95, 0));
  }
  for (let k = 0; k < 5; k++) fr.push(at(new THREE.SphereGeometry(0.09, 6, 5), 0.6 + Math.cos(k * 1.3) * 0.18, 4.75, Math.sin(k * 1.3) * 0.18));
  return { trunk, fronds: merge(fr) };
}
function backdropGeo() {
  // far silhouettes: domes and minarets of a city on the horizon, and dunes
  const r = rng(11), city = [], dunes = [];
  for (let i = 0; i < 26; i++) {
    const x = -170 + i * 13 + r() * 6, z = -300 - r() * 40, h = 8 + r() * 14, w = 8 + r() * 10;
    city.push(at(new THREE.BoxGeometry(w, h, 8), x, h / 2 - 6, z));
    if (r() < 0.55) city.push(at(new THREE.SphereGeometry(w * 0.42, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), x, h - 6, z));
    if (r() < 0.3) { const mh = h + 14 + r() * 10; city.push(at(new THREE.CylinderGeometry(1.1, 1.4, mh, 10), x + w / 2 + 2, mh / 2 - 6, z), at(new THREE.ConeGeometry(1.7, 4, 10), x + w / 2 + 2, mh - 4, z)); }
  }
  for (let i = 0; i < 14; i++) { const d = new THREE.SphereGeometry(60 + r() * 50, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2); d.scale(1, 0.18 + r() * 0.12, 0.5); dunes.push(at(d, -320 + i * 50, -8, -230 - r() * 60)); }
  return { city: merge(city), dunes: merge(dunes) };
}
function starGeo() {
  const s = new THREE.Shape();
  for (let i = 0; i < 16; i++) { const a = (i * Math.PI) / 8, r = i % 2 ? 0.3 * 0.7654 : 0.3; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 2 });
  g.translate(0, 0, -0.03);
  return g;
}

// ---------- obstacles ----------
function obstacleKit(T, mat, over = {}) {
  const wood = over.wood ?? mat('#7A5232', 0.8), woodL = over.woodL ?? mat('#A9784A', 0.8), clay = over.clay ?? mat('#B5653A', 0.85), clayD = mat('#8E4A2A', 0.85);
  const cloth = mat('#ffffff', 0.9, { map: T.awning }), bannerM = mat('#ffffff', 0.85, { map: T.banner, side: THREE.DoubleSide }), rugM = mat('#ffffff', 0.9, { map: T.rug });
  const cart = {
    wood: merge([at(new RoundedBoxGeometry(1.7, 0.75, 1.6, 2, 0.06), 0, 0.85, 0), at(new THREE.BoxGeometry(0.08, 1.4, 0.08), -0.8, 1.9, -0.7), at(new THREE.BoxGeometry(0.08, 1.4, 0.08), 0.8, 1.9, -0.7), at(new THREE.BoxGeometry(0.08, 1.4, 0.08), -0.8, 1.9, 0.7), at(new THREE.BoxGeometry(0.08, 1.4, 0.08), 0.8, 1.9, 0.7),
      at(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 16).rotateZ(Math.PI / 2), -0.9, 0.42, 0.3), at(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 16).rotateZ(Math.PI / 2), 0.9, 0.42, 0.3)]),
    crates: merge([at(new RoundedBoxGeometry(0.62, 0.5, 0.62, 2, 0.04), -0.38, 1.48, 0.25), at(new RoundedBoxGeometry(0.62, 0.5, 0.62, 2, 0.04), 0.4, 1.48, -0.2), at(new RoundedBoxGeometry(0.55, 0.45, 0.55, 2, 0.04), 0.05, 1.95, 0.05)]),
    awning: at(new THREE.BoxGeometry(1.95, 0.07, 1.85), 0, 2.62, 0),
  };
  const jar = new THREE.LatheGeometry([[0, 0], [0.32, 0.02], [0.5, 0.45], [0.48, 0.85], [0.26, 1.1], [0.2, 1.25], [0.26, 1.32], [0, 1.32]].map(([a, b]) => new THREE.Vector2(a, b)), 18);
  const jars = { clay: merge([at(jar.clone(), -0.45, 0, 0.2), at(jar.clone().scale(0.8, 0.8, 0.8), 0.5, 0, -0.25), at(jar.clone().scale(1.15, 1.25, 1.15), 0.05, 0, 0.45)]), ring: merge([at(new RoundedBoxGeometry(1.8, 0.2, 1.5, 2, 0.05), 0, 0.1, 0)]) };
  jars.clay.translate(0, 0.2, 0);
  const low = {
    wood: merge([at(new RoundedBoxGeometry(7.0, 0.22, 0.26, 2, 0.05), 0, 0.56, 0), ...[-3.3, -1.1, 1.1, 3.3].map((x) => at(new THREE.BoxGeometry(0.16, 0.7, 0.16), x, 0.35, 0))]),
    rug: at(new THREE.BoxGeometry(6.4, 0.34, 0.02), 0, 0.42, -0.14),
  };
  const high = {
    wood: merge([at(new THREE.BoxGeometry(0.22, 2.9, 0.22), -3.65, 1.45, 0), at(new THREE.BoxGeometry(0.22, 2.9, 0.22), 3.65, 1.45, 0), at(new RoundedBoxGeometry(7.7, 0.22, 0.26, 2, 0.05), 0, 2.85, 0)]),
    banner: at(new THREE.PlaneGeometry(7.1, 1.55), 0, 1.98, 0),
  };
  const mk = (geo, m, shadow = true) => { const k = new THREE.Mesh(geo, m); k.castShadow = shadow; k.receiveShadow = true; return k; };
  return {
    tall(r) {
      const g = new THREE.Group();
      if (r() < 0.55) g.add(mk(cart.wood, wood), mk(cart.crates, woodL), mk(cart.awning, cloth));
      else g.add(mk(jars.clay, clay), mk(jars.ring, clayD));
      g.rotation.y = (r() - 0.5) * 0.3;
      return g;
    },
    low() { const g = new THREE.Group(); g.add(mk(low.wood, wood), mk(low.rug, rugM)); return g; },
    high() { const g = new THREE.Group(); g.add(mk(high.wood, wood), mk(high.banner, bannerM)); return g; },
  };
}


// ---------- the six lands ----------
// kinds: which kinds of 20 m segment the land cycles through (in runs of four). sky: zenith, middle, horizon.
export const THEMES = {
  oasis: { kinds: ['garden', 'garden', 'arcade', 'garden'], side: 'grass', path: 'path', wall: 'wall', sky: ['#4E86C9', '#A9CBE8', '#EFE4CC'], fog: '#DCD3BC', far: 210, sun: { color: '#FFF0D8', i: 3.0, dir: [-0.45, 0.75, -0.5] }, hemi: ['#D8E8FF', '#A88E66', 0.85], exposure: 1.0, glow: 1.4, city: true },
  dunes: { kinds: ['dunes', 'ruins', 'dunes', 'ruins'], side: 'sand', path: 'path', wall: 'wall', sky: ['#3D5F92', '#E8A877', '#F6D3A6'], fog: '#F3C9A0', far: 210, sun: { color: '#FFD3A0', i: 3.2, dir: [-0.32, 0.38, -0.87] }, hemi: ['#CFE0FF', '#C99A6A', 0.8], exposure: 0.95, glow: 1.6, city: true },
  bazaar: { kinds: ['arcade', 'bazaar', 'arcade', 'bazaar'], side: 'sand', path: 'path', wall: 'wall', sky: ['#1F2A55', '#B0577A', '#F2A46B'], fog: '#7E5866', far: 170, sun: { color: '#FFB98A', i: 1.5, dir: [-0.3, 0.28, -0.9] }, hemi: ['#8A86C4', '#5A3A2E', 0.7], exposure: 1.1, glow: 3.0, city: true },
  caves: { kinds: ['cave'], side: 'rock', path: 'rock', wall: 'rock', sky: null, bg: '#07090B', fog: '#10161A', far: 85, sun: { color: '#9FB6CC', i: 0.7, dir: [-0.2, 0.9, -0.3] }, hemi: ['#46607A', '#1A140F', 0.55], exposure: 1.15, glow: 2.6, city: false },
  cliffs: { kinds: ['cliff'], side: 'grass', path: 'path', wall: 'rock', sky: ['#3C7CC4', '#9CC8EA', '#E6EEF0'], fog: '#C3D6E2', far: 230, sun: { color: '#FFF6E8', i: 3.2, dir: [0.35, 0.8, -0.45] }, hemi: ['#D2E6FF', '#7E8A6A', 0.9], exposure: 1.0, glow: 1.2, city: false, sea: true },
  light: { kinds: ['arcade', 'garden', 'arcade', 'garden'], side: 'marble', path: 'marble', wall: 'marble', sky: ['#060B22', '#1C2756', '#4E4677'], fog: '#25284A', far: 170, sun: { color: '#B9C9FF', i: 1.3, dir: [-0.3, 0.7, -0.6] }, hemi: ['#7C8CD0', '#2A2440', 0.75], exposure: 0.8, glow: 1.9, city: true, stars: true },
};

function rockGeo(r, seed) {
  const g = new THREE.IcosahedronGeometry(r, 2), p = g.attributes.position, R = rng(seed);
  const n = [R() * 9, R() * 9, R() * 9];
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const k = 1 + 0.18 * Math.sin(x * 3.1 + n[0]) * Math.cos(y * 2.7 + n[1]) + 0.1 * Math.sin(z * 5.3 + n[2]);
    p.setXYZ(i, x * k, Math.max(y * k * 0.75, -r * 0.2), z * k);
  }
  g.computeVertexNormals();
  return g;
}
function ruinsGeo() {
  const R = rng(5), stone = [];
  for (const side of [-1, 1]) for (let k = 0; k < 4; k++) {
    const z = -2.5 - k * 5, h = 1.2 + R() * 3.4, x = side * (4.8 + R() * 0.6);
    stone.push(at(new THREE.CylinderGeometry(0.42, 0.48, h, 14), x, h / 2, z), at(new THREE.BoxGeometry(1.15, 0.3, 1.15), x, 0.15, z));
    if (h > 3.5) stone.push(at(new THREE.BoxGeometry(1.2, 0.35, 1.2), x, h + 0.17, z));
    if (R() < 0.4) stone.push(at(new THREE.CylinderGeometry(0.42, 0.42, 1.1, 14).rotateZ(Math.PI / 2).rotateY(R() * 3), side * (6.6 + R()), 0.4, z - 2));
    if (R() < 0.5) stone.push(at(new THREE.BoxGeometry(0.6, 0.6 + R() * 1.2, 2.5 + R() * 2), side * 8.5, 0.5, z - 1));
  }
  return merge(stone);
}
function dunesGeo() {
  const R = rng(9), d = [];
  for (const side of [-1, 1]) for (let k = 0; k < 2; k++) { const s = new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2); s.scale(7 + R() * 6, 1.6 + R() * 2.4, 6 + R() * 4); d.push(at(s, side * (14 + R() * 10), -0.3, -5 - k * 10)); }
  return merge(d);
}
function bazaarGeo() {
  const wood = [], cloth = [], goods = [], house = [], win = [];
  const R = rng(17);
  for (const side of [-1, 1]) {
    for (let k = 0; k < 4; k++) {
      const z = -2.5 - k * 5, x = side * 5.2;
      wood.push(at(new THREE.BoxGeometry(2.2, 0.9, 1.4), x, 0.45, z));
      for (const dx of [-1, 1]) for (const dz of [-0.6, 0.6]) wood.push(at(new THREE.BoxGeometry(0.08, 2.4, 0.08), x + dx, 1.2, z + dz));
      cloth.push(at(new THREE.BoxGeometry(2.5, 0.06, 1.8).rotateZ(-side * 0.18), x, 2.45, z));
      for (let g = 0; g < 6; g++) goods.push(at(new THREE.SphereGeometry(0.12 + R() * 0.06, 10, 8), x - 0.8 + g * 0.32, 1.02, z + (R() - 0.5) * 0.6));
    }
    for (let k = 0; k < 3; k++) {
      const h = 6 + R() * 4, z = -3.3 - k * 6.67;
      house.push(at(new THREE.BoxGeometry(4, h, 6.4), side * 9, h / 2, z));
      for (let w = 0; w < 2; w++) win.push(at(new THREE.BoxGeometry(0.05, 0.9, 0.6), side * 6.98, 3 + w * 2, z + (R() - 0.5) * 3));
    }
  }
  for (let i = 0; i <= 16; i++) { const t = i / 16, x = -6.5 + 13 * t, y = 5.6 - Math.sin(t * Math.PI) * 0.9; win.push(at(new THREE.SphereGeometry(0.09, 8, 6), x, y, -10)); }
  return { wood: merge(wood), cloth: merge(cloth), goods: merge(goods), house: merge(house), win: merge(win) };
}
function caveGeo() {
  const g = new THREE.CylinderGeometry(7.5, 7.5, SEG, 28, 8, true, Math.PI / 2, Math.PI);
  g.rotateX(Math.PI / 2); g.translate(0, 0, -SEG / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(y, x);
    const k = 1 + 0.12 * Math.sin(a * 7 + z * 0.6283) + 0.08 * Math.sin(a * 13 - z * 0.9425) + 0.05 * Math.sin(z * 2.199 + a * 3);
    p.setXYZ(i, x * k, Math.max(-0.3, y * k * 0.85), z);
  }
  g.computeVertexNormals();
  const R = rng(23), crystals = [], tites = [];
  for (let k = 0; k < 7; k++) {
    const side = k % 2 ? 1 : -1, z = -1.5 - k * 2.8, x = side * (5.6 + R()), n = 2 + Math.floor(R() * 3);
    for (let c = 0; c < n; c++) { const h = 0.6 + R() * 1.4, cg = new THREE.ConeGeometry(0.16 + R() * 0.1, h, 6); cg.rotateZ((R() - 0.5) * 0.9); cg.rotateX((R() - 0.5) * 0.6); crystals.push(at(cg, x + (R() - 0.5) * 0.6, h / 2 - 0.05, z + (R() - 0.5) * 0.8)); }
  }
  for (let k = 0; k < 9; k++) { const h = 0.6 + R() * 1.6; tites.push(at(new THREE.ConeGeometry(0.18 + R() * 0.15, h, 7).rotateX(Math.PI), (R() - 0.5) * 9, 6.3 - h / 2, -R() * SEG)); }
  return { tunnel: g, crystals: merge(crystals), tites: merge(tites) };
}
function cliffGeo() {
  const wall = new THREE.PlaneGeometry(SEG, 14, 20, 10); wall.rotateY(Math.PI / 2);
  const p = wall.attributes.position;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i), z = p.getZ(i); p.setX(i, -5.2 - Math.max(0, y) * 0.25 - 0.6 * Math.sin(z * 0.6283 + y * 0.5) - 0.3 * Math.sin(z * 1.885 - y)); p.setY(i, y + 6.8); }
  wall.translate(0, 0, -SEG / 2); wall.computeVertexNormals();
  const parapet = merge([at(new THREE.BoxGeometry(0.5, 0.75, SEG), 4.25, 0.37, -SEG / 2), ...[0, 1, 2, 3].map((k) => at(new THREE.BoxGeometry(0.7, 1.1, 0.7), 4.25, 0.55, -2.5 - k * 5))]);
  const ledge = at(new THREE.BoxGeometry(3, 12, SEG), 6.0, -6.05, -SEG / 2);
  const sea = at(new THREE.PlaneGeometry(400, SEG).rotateX(-Math.PI / 2), 206, -5, -SEG / 2);
  return { wall, parapet, ledge, sea };
}
function gateGeo(width = 9, height = 6.4) {
  const s = new THREE.Shape(), hw = width / 2 + 1.4;
  s.moveTo(-hw, -0.2); s.lineTo(hw, -0.2); s.lineTo(hw, height + 1.4); s.lineTo(-hw, height + 1.4); s.closePath();
  const h = new THREE.Path(), w = width / 2;
  h.moveTo(-w, 0); h.lineTo(w, 0); h.lineTo(w, height * 0.62); h.quadraticCurveTo(w, height * 0.9, 0, height); h.quadraticCurveTo(-w, height * 0.9, -w, height * 0.62); h.closePath();
  s.holes.push(h);
  const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 1, curveSegments: 12 });
  g.translate(0, 0, -0.5);
  const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 0.25, uv.getY(i) * 0.25);
  return g;
}
function chestGeo() {
  const body = merge([at(new RoundedBoxGeometry(1.6, 0.9, 1.0, 2, 0.06), 0, 0.45, 0), at(new THREE.CylinderGeometry(0.5, 0.5, 1.6, 20, 1, false, 0, Math.PI).rotateZ(Math.PI / 2), 0, 0.9, 0)]);
  const trim = merge([at(new THREE.BoxGeometry(1.66, 0.1, 1.06), 0, 0.88, 0), at(new THREE.BoxGeometry(0.12, 0.94, 1.06), -0.55, 0.45, 0), at(new THREE.BoxGeometry(0.12, 0.94, 1.06), 0.55, 0.45, 0), at(new THREE.BoxGeometry(0.24, 0.3, 0.08), 0, 0.72, 0.52)]);
  return { body, trim };
}
function treasureGeo() {
  const gem = new THREE.OctahedronGeometry(0.32, 0); gem.scale(1, 1.35, 1);
  const ring = new THREE.TorusGeometry(0.46, 0.04, 8, 32);
  return { gem, ring };
}

// ---------- the world for one stage ----------
// assets (optional, from the asset manifest): { tex: { key: { map, normalMap, roughnessMap } }, models: { key: { scene, meta } } }
export function createWorld(scene, { lite = false, theme = 'oasis', assets = null, makeSpider = null } = {}) {
  const TH = THEMES[theme] ?? THEMES.oasis;
  const T = makeTextures();
  const mats = [], roots = [];
  const mat = (color, roughness = 0.8, extra = {}) => { const m = bend(new THREE.MeshStandardMaterial({ color, roughness, ...extra })); mats.push(m); return m; };
  const rep = (tex, rx, ry) => { if (!tex) return null; const t = tex.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.needsUpdate = true; return t; };
  const fallbackColor = { path: '#ffffff', wall: '#ffffff', sand: '#D6AE78', rock: '#6B6258', marble: '#EDEBE6', grass: '#5E8A43', wood: '#7A5232', clay: '#B5653A' };
  const fallbackMap = { path: T.stone, wall: T.plaster, sand: T.sand };
  // a PBR material from the downloaded textures when they are there, otherwise from the drawn ones
  function pbr(key, rx, ry, extra = {}) {
    const t = assets?.tex?.[key];
    const { color = key === 'marble' ? '#B9BECE' : '#ffffff', ...rest } = extra;
    if (t?.map) {
      const o = { map: rep(t.map, rx, ry), ...rest };
      if (t.normalMap) { o.normalMap = rep(t.normalMap, rx, ry); o.normalScale = new THREE.Vector2(1, 1); }
      if (t.roughnessMap) o.roughnessMap = rep(t.roughnessMap, rx, ry);
      return mat(color, t.roughnessMap ? 1 : rest.roughness ?? 0.85, o);
    }
    const map = fallbackMap[key] ? rep(fallbackMap[key], rx, ry) : null;
    return mat(map ? color : fallbackColor[key] ?? '#cccccc', rest.roughness ?? 0.88, { ...rest, ...(map ? { map } : {}) });
  }
  const M = {
    path: pbr(TH.path, 3.4, 10), curb: pbr(TH.wall, 0.3, 6), inlay: mat(theme === 'light' ? '#C9A24A' : '#A27E55', 0.6, { metalness: theme === 'light' ? 0.6 : 0 }),
    side: pbr(TH.side, 80, 10, TH.side === 'sand' ? { color: '#F2CE96' } : {}), wall: pbr(TH.wall, 1, 1), tile: mat('#ffffff', 0.5, { map: T.zellij }),
    lamp: mat('#FFD08A', 0.4, { emissive: '#FFB347', emissiveIntensity: 1.2 * TH.glow }), metal: mat('#3A3026', 0.45, { metalness: 0.6 }),
    hedge: pbr('grass', 6, 3, { color: '#7FB86A' }), water: mat('#4FA9C8', 0.06, { metalness: 0.1 }), trunk: mat('#8A6A45', 0.9), frond: mat('#4F8A3A', 0.8, { side: THREE.DoubleSide }),
    star: mat('#FFCF4D', 0.3, { metalness: 0.5, emissive: '#FFAA1E', emissiveIntensity: 1.1 }),
    wood: pbr('wood', 1, 1, { color: '#C9A27A' }), clay: pbr('clay', 1, 1), rock: pbr('rock', 2, 2, { side: THREE.DoubleSide }), stone: pbr(TH.wall === 'rock' ? 'rock' : TH.wall, 1, 1),
    cloth: mat('#ffffff', 0.9, { map: T.awning, side: THREE.DoubleSide }), goods: mat('#D9822B', 0.6), house: pbr('wall', 1, 1, { color: '#D8C3A0' }),
    win: mat('#FFD8A0', 0.5, { emissive: '#FFB347', emissiveIntensity: 1.6 * TH.glow }),
    crystal: mat('#8FE8FF', 0.15, { emissive: '#36C8FF', emissiveIntensity: 1.8, metalness: 0.1 }),
    sea: mat('#17577D', 0.12, { metalness: 0.1 }), gold: mat('#E7B54A', 0.3, { metalness: 0.85, emissive: '#7A5200', emissiveIntensity: 0.3 }),
    chest: pbr('wood', 1, 1, { color: '#9A6A3E' }), gem: mat('#7FF3E0', 0.1, { emissive: '#2FE0C8', emissiveIntensity: 2.2, metalness: 0.2 }),
  };
  if (theme === 'light') { M.lamp.color.set('#DDE6FF'); M.lamp.emissive.set('#9FB8FF'); M.water.color.set('#6C8BE0'); }

  const G = {
    path: at(new THREE.BoxGeometry(6.8, 0.3, SEG), 0, -0.15, -SEG / 2),
    curb: merge([at(new THREE.BoxGeometry(0.45, 0.42, SEG), -3.62, 0.06, -SEG / 2), at(new THREE.BoxGeometry(0.45, 0.42, SEG), 3.62, 0.06, -SEG / 2)]),
    inlay: merge([at(new THREE.BoxGeometry(0.07, 0.02, SEG), -LANE / 2, 0.005, -SEG / 2), at(new THREE.BoxGeometry(0.07, 0.02, SEG), LANE / 2, 0.005, -SEG / 2)]),
    side: at(new THREE.PlaneGeometry(160, SEG).rotateX(-Math.PI / 2), 0, -0.02, -SEG / 2),
    lamp: new THREE.CylinderGeometry(0.22, 0.18, 0.5, 8),
  };
  const need = new Set(TH.kinds);
  if (need.has('arcade')) { G.arcade = arcadeGeo(); G.tile = merge([at(new THREE.BoxGeometry(0.02, 0.55, SEG), -6.4 + 0.37, 4.62, -SEG / 2), at(new THREE.BoxGeometry(0.02, 0.55, SEG), 6.4 - 0.37, 4.62, -SEG / 2)]); G.lanterns = arcadeLanterns(); }
  if (need.has('garden') || need.has('dunes')) G.palm = palmGeo();
  if (need.has('garden')) G.garden = gardenGeo();
  if (need.has('ruins')) G.ruins = ruinsGeo();
  if (need.has('dunes')) G.dunes = dunesGeo();
  if (need.has('bazaar')) G.bazaar = bazaarGeo();
  if (need.has('cave')) G.cave = caveGeo();
  if (need.has('cliff')) G.cliff = cliffGeo();
  G.rocks = [rockGeo(0.7, 1), rockGeo(1.1, 2), rockGeo(0.5, 3)];
  const kit = obstacleKit(T, mat, { wood: M.wood, woodL: pbr('wood', 1, 1, { color: '#E0C29A' }), clay: M.clay });
  // downloaded props (Poly Haven scans): logs to jump, stacks of barrels or crates to dodge, and roadside scenery
  const MODEL = Object.fromEntries(Object.entries(assets?.models ?? {}).filter(([, m]) => !m.meta?.lands || m.meta.lands.includes(theme)));
  const SCALE = { boulder: [0.9, 1.6], rock: [10, 18], deadtree: [1.0, 1.4], crate: [1.4, 1.8], pot: [2.6, 3.4], vase: [2.6, 3.2], plant: [3.5, 5], basket: [2.5, 3.2], lantern: [2.4, 3], log: [0.9, 1.2], barrel: [1.1, 1.3] };
  const BIG = new Set(['boulder', 'deadtree', 'log', 'rock']);
  const boxes = new Map();
  const cloneModel = (key, s, parent = null) => {
    const m = MODEL[key], o = m.scene.clone(true);
    if (!boxes.has(key)) boxes.set(key, new THREE.Box3().setFromObject(m.scene));
    const b = boxes.get(key);
    o.scale.setScalar(s); o.position.y = -b.min.y * s;
    o.traverse((c) => { if (c.isMesh) { c.castShadow = !lite; c.receiveShadow = true; } });
    const g = parent ?? new THREE.Group(); g.add(o); return { g, o, b };
  };
  const sceneryKeys = Object.keys(MODEL);
  const tallMaker = MODEL.barrel ? (R) => {
    const g = new THREE.Group(), s = 1.25;
    for (const [x, y] of [[-0.47, 0], [0.47, 0], [0, 0.92 * s]]) { const { o } = cloneModel('barrel', s, g); o.position.x = x; o.position.y += y; o.rotation.y = R() * 6; }
    return g;
  } : MODEL.crate ? (R) => {
    const g = new THREE.Group(), s = 2;
    for (let k = 0; k < 3; k++) { const { o } = cloneModel('crate', s, g); o.position.y += k * 0.35 * s; o.rotation.y = (R() - 0.5) * 0.3; }
    return g;
  } : null;
  const lowMaker = MODEL.log ? () => { const { g, o } = cloneModel('log', 7.2 / 3.05); o.position.x = 0; return g; } : null;

  const N = lite ? 9 : 12, segs = [];
  const mesh = (geo, m, parent, cast = true, recv = true) => { const k = new THREE.Mesh(geo, m); k.castShadow = cast && !lite; k.receiveShadow = recv; parent.add(k); return k; };
  for (let i = 0; i < N; i++) {
    const g = new THREE.Group(); scene.add(g); roots.push(g);
    mesh(G.path, M.path, g, false); mesh(G.curb, M.curb, g); mesh(G.inlay, M.inlay, g, false);
    if (!need.has('cliff')) mesh(G.side, M.side, g, false);
    else mesh(G.sideLeft ??= at(new THREE.PlaneGeometry(80, SEG).rotateX(-Math.PI / 2), -44, -0.02, -SEG / 2), M.side, g, false);
    const kinds = {};
    const kindGroup = (k) => { const kg = new THREE.Group(); g.add(kg); kinds[k] = kg; return kg; };
    if (G.arcade) { const a = kindGroup('arcade'); mesh(G.arcade, M.wall, a); mesh(G.tile, M.tile, a, false); mesh(G.lanterns.body, M.lamp, a, false, false); mesh(G.lanterns.metal, M.metal, a, false); }
    let trunks = null, fronds = null;
    if (G.palm) { trunks = new THREE.InstancedMesh(G.palm.trunk, M.trunk, 6); fronds = new THREE.InstancedMesh(G.palm.fronds, M.frond, 6); for (const k of [trunks, fronds]) { k.castShadow = !lite; k.receiveShadow = true; k.frustumCulled = false; g.add(k); } }
    if (G.garden) { const a = kindGroup('garden'); mesh(G.garden.stone, M.curb, a); mesh(G.garden.hedge, M.hedge, a); mesh(G.garden.water, M.water, a, false); mesh(G.garden.lampBody, M.lamp, a, false, false); mesh(G.garden.lampMetal, M.metal, a); }
    if (G.ruins) { const a = kindGroup('ruins'); mesh(G.ruins, M.stone, a); }
    if (G.dunes) { const a = kindGroup('dunes'); mesh(G.dunes, M.side, a, false); }
    if (G.bazaar) { const a = kindGroup('bazaar'); mesh(G.bazaar.wood, M.wood, a); mesh(G.bazaar.cloth, M.cloth, a); mesh(G.bazaar.goods, M.goods, a, false); mesh(G.bazaar.house, M.house, a); mesh(G.bazaar.win, M.win, a, false, false); }
    if (G.cave) { const a = kindGroup('cave'); mesh(G.cave.tunnel, M.rock, a, false); mesh(G.cave.crystals, M.crystal, a, false, false); mesh(G.cave.tites, M.rock, a); }
    if (G.cliff) { const a = kindGroup('cliff'); mesh(G.cliff.wall, M.rock, a); mesh(G.cliff.parapet, M.stone, a); mesh(G.cliff.ledge, M.rock, a, false); mesh(G.cliff.sea, M.sea, a, false, false); }
    const deco = new THREE.Group(); g.add(deco);
    const items = new THREE.Group(); g.add(items);
    segs.push({ g, kinds, trunks, fronds, deco, items, obs: [], index: -1 });
  }

  // horizon: far city or dunes (not in the caves), the sky dome, fog
  const back = new THREE.Group(); scene.add(back); roots.push(back);
  if (TH.city) {
    const bd = backdropGeo(), hz = new THREE.Color(TH.fog);
    back.add(new THREE.Mesh(bd.dunes, new THREE.MeshBasicMaterial({ color: hz.clone().lerp(new THREE.Color('#C89F70'), theme === 'light' ? 0.15 : 0.35), fog: false })));
    back.add(new THREE.Mesh(bd.city, new THREE.MeshBasicMaterial({ color: hz.clone().lerp(new THREE.Color(theme === 'light' ? '#0E1230' : '#A0705A'), 0.3), fog: false })));
  }
  const deep = (hex) => new THREE.Color(hex).convertSRGBToLinear();
  const SUN = new THREE.Vector3(...TH.sun.dir).normalize();
  let sky = null;
  if (TH.sky) {
    sky = new THREE.Mesh(new THREE.SphereGeometry(450, 32, 16), new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { top: { value: deep(TH.sky[0]) }, mid: { value: deep(TH.sky[1]) }, hor: { value: deep(TH.sky[2]) }, sun: { value: SUN }, night: { value: TH.stars ? 1 : 0 } },
      vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `uniform vec3 top, mid, hor, sun; uniform float night; varying vec3 vDir;
        float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        void main(){ float h = vDir.y; vec3 c = mix(hor, mid, smoothstep(0.0, 0.12, h)); c = mix(c, top, smoothstep(0.1, 0.65, h));
          if (h < 0.0) c = hor; float d = max(dot(normalize(vDir), sun), 0.0);
          c += (night > 0.5 ? vec3(0.75, 0.8, 1.0) * (pow(d, 2000.0) * 2.0 + pow(d, 60.0) * 0.15) : vec3(1.0, 0.8, 0.55) * (pow(d, 900.0) * 3.0 + pow(d, 40.0) * 0.45 + pow(d, 6.0) * 0.18));
          if (night > 0.5 && h > 0.05) { vec2 q = floor(vec2(atan(vDir.z, vDir.x) * 300.0, h * 300.0)); float s = h21(q); c += vec3(step(0.997, s) * 0.9 * smoothstep(0.05, 0.3, h)); }
          gl_FragColor = vec4(c, 1.0);
          #include <colorspace_fragment>
        }`,
    }));
    scene.add(sky); roots.push(sky);
    scene.background = null;
  } else scene.background = new THREE.Color(TH.bg);
  scene.fog = new THREE.Fog(deep(TH.fog), theme === 'caves' ? 12 : 40, lite ? TH.far * 0.75 : TH.far);

  const starInst = new THREE.InstancedMesh(starGeo(), M.star, 400); starInst.frustumCulled = false; scene.add(starInst); roots.push(starInst);
  const TG = treasureGeo(), CG = chestGeo(), gateG = gateGeo();
  let stars = [], treasures = [], spiders = [], plan = { endZ: -1e9, treasureZ: [], checkpointZ: [], difficulty: 0, spiderRate: 0, swarm: false };

  // spider pool
  const spiderPool = [];
  const getSpider = () => { let s = spiderPool.find((x) => !x.used); if (!s) { s = makeSpider(bend, { shadows: !lite }); scene.add(s.root); roots.push(s.root); spiderPool.push(s); } s.used = true; s.alive = true; s.dead = 0; s.root.rotation.set(0, 0, 0); s.root.visible = true; s.thread.visible = false; return s; };

  let R = rng(1), front = 0, curSeg = null;
  const nearPlanned = (z) => [...plan.treasureZ, ...plan.checkpointZ, plan.endZ].some((p) => Math.abs(p - z) < 7);
  function fill(seg, index) {
    seg.index = index;
    const z0 = -index * SEG; seg.g.position.z = z0;
    const kind = TH.kinds[Math.floor(index / 4) % TH.kinds.length];
    for (const [k, grp] of Object.entries(seg.kinds)) grp.visible = k === kind;
    const palms = kind === 'garden' || kind === 'dunes';
    if (seg.trunks) {
      seg.trunks.visible = seg.fronds.visible = palms;
      if (palms) {
        const d = new THREE.Object3D(), n = kind === 'dunes' ? 3 : 6;
        for (let k = 0; k < 6; k++) {
          const side = k % 2 ? 1 : -1, far = k >= 4 || kind === 'dunes';
          d.position.set(side * (far ? 9 + R() * 8 : 7.2 + R() * 1.2), 0, -1.5 - ((k >> 1) * 6.5 + R() * 3));
          d.rotation.set(0, R() * Math.PI * 2, 0); d.scale.setScalar(k < n ? 0.85 + R() * 0.35 : 0.0001); d.updateMatrix();
          seg.trunks.setMatrixAt(k, d.matrix); seg.fronds.setMatrixAt(k, d.matrix);
        }
        seg.trunks.instanceMatrix.needsUpdate = seg.fronds.instanceMatrix.needsUpdate = true;
      }
    }
    seg.deco.clear(); seg.items.clear(); seg.obs = []; curSeg = seg;
    // scenery: rocks and downloaded props beside the path
    const open = kind !== 'arcade' && kind !== 'bazaar';
    for (let k = 0; k < (open ? 4 : 3); k++) {
      const side = R() < 0.5 ? -1 : 1, z = -R() * SEG;
      if (kind === 'cliff' && side > 0) continue;
      let o, key = sceneryKeys.length && R() < 0.8 ? sceneryKeys[Math.floor(R() * sceneryKeys.length)] : null;
      if (key && BIG.has(key) && !open && kind !== 'cave') key = null;
      if (key) { const [a, b] = SCALE[key] ?? [1, 1.5]; o = cloneModel(key, a + R() * (b - a)).g; o.rotation.y = R() * 6; }
      else if (open) { o = new THREE.Mesh(G.rocks[k % 3], M.rock); o.castShadow = !lite; o.receiveShadow = true; o.rotation.y = R() * 6; o.scale.setScalar(0.6 + R() * 0.8); key = 'boulder'; }
      else continue;
      const x = side * (BIG.has(key) ? 6 + R() * (kind === 'cave' ? 0.5 : 7) : kind === 'cave' ? 4.3 + R() * 0.6 : 4.15 + R() * 0.9);
      o.position.set(x, 0, z); seg.deco.add(o);
    }
    // the stage's planned treasures, checkpoints and end gate in this segment
    for (const tz of plan.treasureZ) if (tz <= z0 && tz > z0 - SEG) {
      const lane = (Math.floor(R() * 3) - 1) * LANE, t = new THREE.Group();
      t.add(new THREE.Mesh(TG.gem, M.gem), new THREE.Mesh(TG.ring, M.gold));
      t.position.set(lane, 1.1, tz - z0); seg.items.add(t);
      treasures.push({ x: lane, y: 1.1, z: tz, obj: t, got: false });
    }
    for (const cz of [...plan.checkpointZ, plan.endZ]) if (cz <= z0 && cz > z0 - SEG) {
      const end = cz === plan.endZ, gate = new THREE.Mesh(gateG, end ? M.gold : M.stone); gate.castShadow = !lite; gate.receiveShadow = true;
      gate.position.set(0, 0, cz - z0); seg.items.add(gate);
      const l1 = new THREE.Mesh(G.lamp, M.lamp); l1.position.set(0, 5.6, cz - z0); seg.items.add(l1);
      if (end) { const ch = new THREE.Group(); ch.add(new THREE.Mesh(CG.body, M.chest), new THREE.Mesh(CG.trim, M.gold)); ch.position.set(0, 0, cz - z0 - 4); ch.traverse((c) => { if (c.isMesh) c.castShadow = !lite; }); seg.items.add(ch); }
    }
    if (index < 3) { line(z0 - 6, 0, 6); return; }
    if (z0 < plan.endZ + 10) return;   // nothing after the end gate
    const d = plan.difficulty;
    const rows = d > 0.35 && R() < 0.4 + d * 0.4 ? [-5, -15] : [-10];
    for (const rz of rows) {
      const z = z0 + rz;
      if (nearPlanned(z)) { line(z + 4, (Math.floor(R() * 3) - 1) * LANE, 5); continue; }
      const roll = R();
      if (roll < 0.2) {
        place(lowMaker && R() < 0.5 ? lowMaker() : kit.low(), 0, rz, { kind: 'low', z0: z - 0.25, z1: z + 0.25, x0: -3.6, x1: 3.6 });
        arc(z, LANE * (Math.floor(R() * 3) - 1));
      } else if (roll < 0.38 && kind !== 'cave') {
        place(kit.high(), 0, rz, { kind: 'high', z0: z - 0.25, z1: z + 0.25, x0: -3.6, x1: 3.6 });
        line(z + 3, LANE * (Math.floor(R() * 3) - 1), 4, 0.55);
      } else {
        const lanes = [-1, 0, 1].sort(() => R() - 0.5), n = d > 0.25 && R() < 0.35 + d * 0.4 ? 2 : 1;
        for (let i = 0; i < n; i++) {
          const obj = tallMaker && R() < 0.5 ? tallMaker(R) : kit.tall(R);
          place(obj, lanes[i] * LANE, rz, { kind: 'tall', z0: z - 0.85, z1: z + 0.85, x0: lanes[i] * LANE - 0.9, x1: lanes[i] * LANE + 0.9 });
        }
        line(z + 4, lanes[n] * LANE, 6);
      }
    }
    // zombie spiders: crawlers on the path, and (under roofs and in caves) danglers on threads
    const rate = plan.spiderRate * (plan.swarm ? 2.2 : 1);
    for (let k = 0; k < 3; k++) {
      if (R() > rate) continue;
      const z = z0 - 3 - R() * (SEG - 6);
      if (rows.some((rz) => Math.abs(z0 + rz - z) < 4) || nearPlanned(z)) continue;
      const lane = (Math.floor(R() * 3) - 1) * LANE, roof = kind === 'cave' || kind === 'arcade' || kind === 'bazaar';
      const s = getSpider(), drop = roof && R() < 0.45;
      s.root.position.set(lane, drop ? 7 : 0, z);
      spiders.push({ s, x: lane, z, drop, y: drop ? 7 : 0, active: false, speed: 2.5 + R() * 2 + d * 3, chase: !drop && d > 0.5 && R() < 0.5 });
    }
  }
  function place(obj, x, rz, box) { obj.position.set(x, 0, rz); curSeg.items.add(obj); box.obj = obj; curSeg.obs.push(box); }
  function line(z, x, n, y = 0.75) { for (let i = 0; i < n; i++) stars.push({ x, y, z: z - i * 1.7, alive: true }); }
  function arc(z, x) { for (let i = 0; i < 7; i++) { const u = (i - 3) / 3; stars.push({ x, y: 0.75 + 1.1 * (1 - u * u), z: z + 4.5 - i * 1.5, alive: true }); } }

  // from: the segment to start at (a checkpoint restarts the run part-way along)
  function start(p, seed = 1, from = 0) {
    plan = { ...plan, ...p };
    R = rng(seed + from); stars = []; treasures = []; front = from;
    for (const sp of spiderPool) { sp.used = false; sp.root.visible = false; }
    spiders = [];
    for (const s of segs) fill(s, front++);
  }
  const dummy = new THREE.Object3D();
  function update(pz, t, dt, px = 0) {
    for (const s of segs) if (s.g.position.z - SEG > pz + 12) fill(s, front++);
    stars = stars.filter((s) => s.z < pz + 12);
    let n = 0;
    for (const s of stars) {
      if (!s.alive || n >= 400) continue;
      dummy.position.set(s.x, s.y + Math.sin(t * 3 + s.z) * 0.07, s.z); dummy.rotation.set(0, t * 2.6 + s.z * 0.3, 0); dummy.scale.setScalar(1); dummy.updateMatrix();
      starInst.setMatrixAt(n++, dummy.matrix);
    }
    starInst.count = n; starInst.instanceMatrix.needsUpdate = true;
    for (const tr of treasures) if (!tr.got) { tr.obj.rotation.y = t * 2; tr.obj.children[1].rotation.x = t * 1.3; tr.obj.position.y = 1.1 + Math.sin(t * 2.5) * 0.12; }
    // spiders wake when the runner is near
    for (const sp of spiders) {
      const s = sp.s;
      if (!s.alive) { if (s.dead && !s.tumble(dt)) { s.root.visible = false; s.dead = 0; } continue; }
      const gap = sp.z - pz;
      if (!sp.active && gap > -45 && gap < 0) sp.active = true;
      if (sp.drop) {
        if (sp.active && gap > -20) sp.y = Math.max(1.15, sp.y - dt * 14);
        s.root.position.set(sp.x, sp.y, sp.z);
        s.thread.visible = true; s.thread.position.set(0, 0.7, 0); s.thread.scale.set(1, Math.max(0.1, 7.5 - sp.y), 1);
        s.update(dt, 0.1, true); s.root.rotation.z = Math.sin(t * 2 + sp.z) * 0.15;
      } else {
        if (sp.active) { sp.z += sp.speed * dt; if (sp.chase) sp.x += Math.sign(px - sp.x) * Math.min(Math.abs(px - sp.x), dt * 1.2); }
        s.root.position.set(sp.x, 0, sp.z);
        s.update(dt, sp.active ? 1 : 0.15, false);
      }
    }
    spiders = spiders.filter((sp) => { if (sp.z > pz + 15 && !sp.s.dead) { sp.s.used = false; sp.s.root.visible = false; return false; } return true; });
    back.position.z = pz; if (sky) sky.position.z = pz;
    bendU.value.x = theme === 'caves' ? Math.sin(pz * 0.006) * 0.0012 : Math.sin(pz * 0.0045) * 0.0016 + Math.sin(pz * 0.011) * 0.0006;
    bendU.value.y = theme === 'caves' ? 0.0004 : 0.0011;
  }
  function dispose() {
    for (const r of roots) scene.remove(r);
    for (const m of mats) { for (const k of ['map', 'normalMap', 'roughnessMap']) m[k]?.dispose?.(); m.dispose(); }
  }
  return {
    theme: TH, SUN, start, update, dispose, tune: (p) => Object.assign(plan, p),
    obstacles: () => segs.flatMap((s) => s.obs), stars: () => stars, treasures: () => treasures, spiders: () => spiders,
  };
}
