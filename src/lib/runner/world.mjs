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
function obstacleKit(T, mat) {
  const wood = mat('#7A5232', 0.8), woodL = mat('#A9784A', 0.8), clay = mat('#B5653A', 0.85), clayD = mat('#8E4A2A', 0.85);
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

// ---------- the world ----------
export function createWorld(scene, { lite = false } = {}) {
  const T = makeTextures();
  const mats = [];
  const mat = (color, roughness = 0.8, extra = {}) => { const m = bend(new THREE.MeshStandardMaterial({ color, roughness, ...extra })); mats.push(m); return m; };
  const M = {
    path: mat('#ffffff', 0.85, { map: T.stone }), curb: mat('#D9C29A', 0.8, { map: T.plaster }), inlay: mat('#A27E55', 0.7),
    sand: mat('#ffffff', 1, { map: T.sand }), plaster: mat('#ffffff', 0.9, { map: T.plaster }), tile: mat('#ffffff', 0.5, { map: T.zellij }),
    lamp: mat('#FFD08A', 0.4, { emissive: '#FFB347', emissiveIntensity: 2.4 }), metal: mat('#3A3026', 0.45, { metalness: 0.6 }),
    hedge: mat('#3E7A3B', 0.9), water: mat('#5EC0D8', 0.08, { metalness: 0.2 }), trunk: mat('#8A6A45', 0.9), frond: mat('#4F8A3A', 0.8, { side: THREE.DoubleSide }),
    star: mat('#FFCF4D', 0.3, { metalness: 0.5, emissive: '#FFAA1E', emissiveIntensity: 1.1 }),
  };
  T.stone.repeat.set(1, SEG / 6.8); T.sand.repeat.set(160 / 12, SEG / 12);

  // shared geometry for every segment
  const G = {
    path: at(new THREE.BoxGeometry(6.8, 0.3, SEG), 0, -0.15, -SEG / 2),
    curb: merge([at(new THREE.BoxGeometry(0.45, 0.42, SEG), -3.62, 0.06, -SEG / 2), at(new THREE.BoxGeometry(0.45, 0.42, SEG), 3.62, 0.06, -SEG / 2)]),
    inlay: merge([at(new THREE.BoxGeometry(0.07, 0.02, SEG), -LANE / 2, 0.005, -SEG / 2), at(new THREE.BoxGeometry(0.07, 0.02, SEG), LANE / 2, 0.005, -SEG / 2)]),
    sand: at(new THREE.PlaneGeometry(160, SEG).rotateX(-Math.PI / 2), 0, -0.02, -SEG / 2),
    arcade: arcadeGeo(),
    tile: merge([at(new THREE.BoxGeometry(0.02, 0.55, SEG), -6.4 + 0.37, 4.62, -SEG / 2), at(new THREE.BoxGeometry(0.02, 0.55, SEG), 6.4 - 0.37, 4.62, -SEG / 2)]),
    lanterns: arcadeLanterns(), garden: gardenGeo(), palm: palmGeo(),
  };
  const kit = obstacleKit(T, mat);

  const N = lite ? 9 : 12;
  const segs = [];
  const mesh = (geo, m, parent, cast = true, recv = true) => { const k = new THREE.Mesh(geo, m); k.castShadow = cast; k.receiveShadow = recv; parent.add(k); return k; };
  for (let i = 0; i < N; i++) {
    const g = new THREE.Group(); scene.add(g);
    mesh(G.path, M.path, g, false); mesh(G.curb, M.curb, g); mesh(G.inlay, M.inlay, g, false); mesh(G.sand, M.sand, g, false);
    const arcade = new THREE.Group(); g.add(arcade);
    mesh(G.arcade, M.plaster, arcade); mesh(G.tile, M.tile, arcade, false); mesh(G.lanterns.body, M.lamp, arcade, false, false); mesh(G.lanterns.metal, M.metal, arcade, false);
    const garden = new THREE.Group(); g.add(garden);
    mesh(G.garden.stone, M.curb, garden); mesh(G.garden.hedge, M.hedge, garden); mesh(G.garden.water, M.water, garden, false);
    mesh(G.garden.lampBody, M.lamp, garden, false, false); mesh(G.garden.lampMetal, M.metal, garden);
    const trunks = new THREE.InstancedMesh(G.palm.trunk, M.trunk, 6), fronds = new THREE.InstancedMesh(G.palm.fronds, M.frond, 6);
    for (const k of [trunks, fronds]) { k.castShadow = true; k.receiveShadow = true; k.frustumCulled = false; garden.add(k); }
    segs.push({ g, arcade, garden, trunks, fronds, obs: [], props: new THREE.Group(), index: -1 });
    g.add(segs[i].props);
  }

  // backdrop (follows the runner, so it stays on the horizon) and sky
  const bd = backdropGeo(), back = new THREE.Group(); scene.add(back);
  back.add(new THREE.Mesh(bd.dunes, new THREE.MeshBasicMaterial({ color: '#E2B98C', fog: false })));
  back.add(new THREE.Mesh(bd.city, new THREE.MeshBasicMaterial({ color: '#D9AE8E', fog: false })));
  // the sky and fog use deepened colours: a richer golden-hour look, the same in HD and Lite
  const deep = (hex) => new THREE.Color(hex).convertSRGBToLinear();
  const SUN = new THREE.Vector3(-0.32, 0.2, -0.93).normalize();
  const sky = new THREE.Mesh(new THREE.SphereGeometry(450, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: deep('#3D5F92') }, mid: { value: deep('#E8A877') }, hor: { value: deep('#F6D3A6') }, sun: { value: SUN } },
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform vec3 top, mid, hor, sun; varying vec3 vDir;
      void main(){ float h = vDir.y; vec3 c = mix(hor, mid, smoothstep(0.0, 0.12, h)); c = mix(c, top, smoothstep(0.1, 0.65, h));
        if (h < 0.0) c = hor; float d = max(dot(normalize(vDir), sun), 0.0);
        c += vec3(1.0, 0.8, 0.55) * (pow(d, 900.0) * 3.0 + pow(d, 40.0) * 0.45 + pow(d, 6.0) * 0.18);
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  }));
  scene.add(sky);
  scene.fog = new THREE.Fog(deep('#F3C9A0'), 40, lite ? 150 : 205);

  // collectible stars (one instanced mesh for all of them)
  const starInst = new THREE.InstancedMesh(starGeo(), M.star, 400); starInst.frustumCulled = false; starInst.castShadow = false; scene.add(starInst);
  let stars = [];

  // ---------- filling a segment ----------
  let R = rng(1);
  function fill(seg, index, difficulty) {
    seg.index = index;
    const z0 = -index * SEG;
    seg.g.position.z = z0;
    const garden = Math.floor(index / 4) % 2 === 1;
    seg.arcade.visible = !garden; seg.garden.visible = garden;
    if (garden) {
      const d = new THREE.Object3D();
      for (let k = 0; k < 6; k++) {
        const side = k % 2 ? 1 : -1, far = k >= 4;
        d.position.set(side * (far ? 11 + R() * 6 : 7.2 + R() * 1.2), 0, -1.5 - ((k >> 1) * 6.5 + R() * 3));
        d.rotation.set(0, R() * Math.PI * 2, 0); d.scale.setScalar(0.85 + R() * 0.35); d.updateMatrix();
        seg.trunks.setMatrixAt(k, d.matrix); seg.fronds.setMatrixAt(k, d.matrix);
      }
      seg.trunks.instanceMatrix.needsUpdate = seg.fronds.instanceMatrix.needsUpdate = true;
    }
    seg.props.clear(); seg.obs = [];
    if (index < 3) { line(z0 - 6, 0, 6); return; }
    const rows = difficulty > 0.45 && R() < 0.6 ? [-5, -15] : [-10];
    for (const rz of rows) {
      const z = z0 + rz, roll = R();
      if (roll < 0.22 && difficulty > 0.05) {
        add(kit.low(), 0, rz, { kind: 'low', z0: z - 0.25, z1: z + 0.25, x0: -3.6, x1: 3.6 });
        arc(z, LANE * (Math.floor(R() * 3) - 1));
      } else if (roll < 0.42 && difficulty > 0.1) {
        add(kit.high(), 0, rz, { kind: 'high', z0: z - 0.25, z1: z + 0.25, x0: -3.6, x1: 3.6 });
        line(z + 3, LANE * (Math.floor(R() * 3) - 1), 4, 0.55);
      } else {
        const lanes = [-1, 0, 1].sort(() => R() - 0.5), n = difficulty > 0.3 && R() < 0.5 ? 2 : 1;
        for (let i = 0; i < n; i++) add(kit.tall(R), lanes[i] * LANE, rz, { kind: 'tall', z0: z - 0.85, z1: z + 0.85, x0: lanes[i] * LANE - 0.9, x1: lanes[i] * LANE + 0.9 });
        line(z + 4, lanes[n] * LANE, 6);
      }
    }
  }
  function add(obj, x, rz, box) { obj.position.set(x, 0, rz); seg_(obj); box.obj = obj; curSeg.obs.push(box); }
  let curSeg = null; const seg_ = (o) => curSeg.props.add(o);
  function line(z, x, n, y = 0.75) { for (let i = 0; i < n; i++) stars.push({ x, y, z: z - i * 1.7, alive: true }); }
  function arc(z, x) { for (let i = 0; i < 7; i++) { const u = (i - 3) / 3; stars.push({ x, y: 0.75 + 1.1 * (1 - u * u), z: z + 4.5 - i * 1.5, alive: true }); } }

  let front = 0;
  function reset(seed = 1) {
    R = rng(seed); stars = []; front = 0;
    for (const s of segs) { curSeg = s; fill(s, front++, 0); }
  }
  const dummy = new THREE.Object3D();
  function update(pz, t, difficulty) {
    // recycle segments the runner has passed
    for (const s of segs) if (s.g.position.z - SEG > pz + 12) { curSeg = s; fill(s, front++, difficulty); }
    stars = stars.filter((s) => s.z < pz + 12);
    let n = 0;
    for (const s of stars) {
      if (!s.alive || n >= 400) continue;
      dummy.position.set(s.x, s.y + Math.sin(t * 3 + s.z) * 0.07, s.z); dummy.rotation.set(0, t * 2.6 + s.z * 0.3, 0); dummy.scale.setScalar(1); dummy.updateMatrix();
      starInst.setMatrixAt(n++, dummy.matrix);
    }
    starInst.count = n; starInst.instanceMatrix.needsUpdate = true;
    back.position.z = pz; sky.position.z = pz;
    bendU.value.x = Math.sin(pz * 0.0045) * 0.0016 + Math.sin(pz * 0.011) * 0.0006;
  }
  const obstacles = () => segs.flatMap((s) => s.obs);
  return { reset, update, obstacles, stars: () => stars, mats, SUN, sky, dispose() { for (const m of mats) m.dispose(); } };
}
