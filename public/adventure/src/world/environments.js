// The five lands: sky, light, fog, ground and a kit of low-poly props for each, plus drifting particles.
// All geometry is made in code (no model files), so the game stays small and loads fast on GitHub Pages.
import { THREE, mat, glow, mesh } from '../engine/renderer.js';

export const PALETTES = {
  desert:   { skyTop: '#4f9ad6', skyBottom: '#f8dcae', fog: '#e9c99a', fogNear: 40, fogFar: 230, sun: '#fff1d0', sunI: 2.6, hemiSky: '#bfe0ff', hemiGround: '#b98a5a', hemiI: 1.1, ground: '#d9a96b', track: '#b98552', edge: '#7a5236' },
  oasis:    { skyTop: '#5aaee0', skyBottom: '#e6f2d6', fog: '#cfe5cf', fogNear: 40, fogFar: 220, sun: '#fff6dd', sunI: 2.4, hemiSky: '#cfefff', hemiGround: '#5f8a4a', hemiI: 1.2, ground: '#7fae5c', track: '#a98a62', edge: '#5a4632' },
  caves:    { skyTop: '#0d0f1d', skyBottom: '#1f2540', fog: '#141a30', fogNear: 14, fogFar: 95, sun: '#8fb6ff', sunI: 0.8, hemiSky: '#7f93d8', hemiGround: '#3a2f48', hemiI: 1.05, ground: '#4a4560', track: '#5f5874', edge: '#2a2535' },
  mountain: { skyTop: '#7fb0e8', skyBottom: '#e8eef5', fog: '#dfe7f0', fogNear: 30, fogFar: 200, sun: '#ffffff', sunI: 2.2, hemiSky: '#e6f0ff', hemiGround: '#8a96a8', hemiI: 1.25, ground: '#eef3f8', track: '#9aa6b5', edge: '#5c6675' },
  harbour:  { skyTop: '#16224a', skyBottom: '#4a4f86', fog: '#2e3566', fogNear: 30, fogFar: 170, sun: '#c3ceff', sunI: 1.4, hemiSky: '#8a9ae8', hemiGround: '#4a3f5a', hemiI: 1.55, ground: '#6a6278', track: '#867a88', edge: '#3a3242' },
};

function skyDome(top, bottom, starry) {
  const geo = new THREE.SphereGeometry(400, 32, 16);
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(top) }, bottom: { value: new THREE.Color(bottom) }, stars: { value: starry ? 1 : 0 } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform vec3 top; uniform vec3 bottom; uniform float stars; varying vec3 vP;
      float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,45.164))) * 43758.5453); }
      void main(){ float t = clamp(vP.y * 1.4 + 0.15, 0.0, 1.0); vec3 c = mix(bottom, top, t);
        if (stars > 0.5 && vP.y > 0.05) { vec3 g = floor(vP * 180.0); float s = step(0.996, h(g)); c += s * vec3(0.9, 0.9, 1.0) * smoothstep(0.05, 0.4, vP.y); }
        gl_FragColor = vec4(c, 1.0); }`,
  });
  const m = new THREE.Mesh(geo, material); m.renderOrder = -1; m.frustumCulled = false;
  return m;
}

// ── props ─────────────────────────────────────────────────────────
const G = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 8),
  cone: new THREE.ConeGeometry(0.5, 1, 7),
  ico: new THREE.IcosahedronGeometry(0.5, 0),
  sph: new THREE.SphereGeometry(0.5, 12, 8),
  dome: new THREE.SphereGeometry(0.5, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2),
  oct: new THREE.OctahedronGeometry(0.5, 0),
};
export { G };

// a pointed (Islamic-style) arch, extruded
function archGeo(w = 3, h = 4.2, thick = 0.6, depth = 0.8) {
  const s = new THREE.Shape(), r = w / 2;
  s.moveTo(-r - thick, 0); s.lineTo(-r - thick, h * 0.6);
  s.quadraticCurveTo(-r - thick, h + thick * 0.8, 0, h + thick);
  s.quadraticCurveTo(r + thick, h + thick * 0.8, r + thick, h * 0.6);
  s.lineTo(r + thick, 0); s.lineTo(r, 0); s.lineTo(r, h * 0.6);
  s.quadraticCurveTo(r, h * 0.95, 0, h); s.quadraticCurveTo(-r, h * 0.95, -r, h * 0.6); s.lineTo(-r, 0); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
  g.translate(0, 0, -depth / 2);
  return g;
}
const ARCH = archGeo();
for (const g of [...Object.values(G), ARCH]) g.userData.shared = true;   // shared: never disposed
export { archGeo };

const M = {};   // material cache per colour
const m = (c, o) => (M[c + (o ? JSON.stringify(o) : '')] ??= Object.assign(mat(c, o), { userData: { shared: true } }));

export const PROPS = {
  palm(r) {
    const g = new THREE.Group(), h = 4 + r() * 2.5, lean = (r() - 0.5) * 0.35;
    const trunk = mesh(G.cyl, m('#8a6a45'), { y: h / 2, s: [0.32, h, 0.32], rz: lean });
    g.add(trunk);
    const top = new THREE.Vector3(Math.sin(-lean) * h * 0.5, h, 0);
    for (let i = 0; i < 7; i++) {
      const leaf = mesh(G.cone, m(i % 2 ? '#3f8a4a' : '#4f9d55'), { s: [0.5, 3.2, 0.12] });
      leaf.position.copy(top); leaf.rotation.set(0, (i / 7) * Math.PI * 2, 1.15 + r() * 0.3, 'YXZ');
      leaf.translateY(1.3);
      g.add(leaf);
    }
    return g;
  },
  dune(r) { return mesh(G.sph, m('#d6a466'), { y: -1.5, s: [10 + r() * 14, 5 + r() * 4, 8 + r() * 10], receive: true, cast: false }); },
  rock(r, color = '#8b7663') { return mesh(G.ico, m(color), { y: 0.4, s: [1 + r() * 1.6, 0.8 + r() * 1.4, 1 + r() * 1.6], ry: r() * 6 }); },
  arch(r, color = '#b9845a') {
    const g = new THREE.Group();
    g.add(mesh(ARCH, m(color), { }));
    g.add(mesh(G.box, m('#9a6b47'), { y: 5, s: [4.6, 0.4, 1] }));
    return g;
  },
  tent(r) {
    const g = new THREE.Group();
    g.add(mesh(G.cone, m(['#c2553f', '#e2c48f', '#3f6f8a'][Math.floor(r() * 3)]), { y: 1.2, s: [3.4, 2.4, 3.4], ry: Math.PI / 4 }));
    return g;
  },
  house(r, color = '#e8d7b8') {
    const g = new THREE.Group(), w = 3 + r() * 2, h = 2.5 + r() * 2;
    g.add(mesh(G.box, m(color), { y: h / 2, s: [w, h, w * 0.9] }));
    g.add(mesh(G.box, m('#5b4636'), { y: 0.9, z: w * 0.45 + 0.01, s: [0.8, 1.6, 0.05] }));
    if (r() < 0.6) g.add(mesh(G.dome, m(r() < 0.5 ? '#f0e6d2' : '#3f7f8f'), { y: h, s: [w * 0.7, w * 0.6, w * 0.7] }));
    return g;
  },
  tree(r) {
    const g = new THREE.Group(), h = 2 + r() * 1.5;
    g.add(mesh(G.cyl, m('#6b4b32'), { y: h / 2, s: [0.35, h, 0.35] }));
    for (let i = 0; i < 3; i++) g.add(mesh(G.ico, m(['#3e7d43', '#4f9454', '#6aa85a'][i]), { x: (r() - 0.5) * 1.2, y: h + 0.6 + i * 0.5, z: (r() - 0.5) * 1.2, s: 2.2 - i * 0.4 }));
    return g;
  },
  bush(r) { return mesh(G.ico, m(r() < 0.5 ? '#4b8d4a' : '#5ea05a'), { y: 0.5, s: [1.4 + r(), 1 + r() * 0.6, 1.4 + r()] }); },
  flowers(r) {
    const g = new THREE.Group();
    for (let i = 0; i < 6; i++) g.add(mesh(G.sph, m(['#f2c94c', '#eb8fa8', '#f4f1ea', '#c79bf2'][i % 4]), { x: (r() - 0.5) * 2, y: 0.2, z: (r() - 0.5) * 2, s: 0.28, cast: false }));
    return g;
  },
  pine(r) {
    const g = new THREE.Group(), s = 0.8 + r() * 0.8;
    g.add(mesh(G.cyl, m('#5c4433'), { y: 0.7 * s, s: [0.3 * s, 1.4 * s, 0.3 * s] }));
    for (let i = 0; i < 3; i++) g.add(mesh(G.cone, m(i === 2 ? '#f4f8fb' : '#2f5e45'), { y: (1.6 + i * 1.1) * s, s: [(2.6 - i * 0.7) * s, 1.8 * s, (2.6 - i * 0.7) * s] }));
    return g;
  },
  snowrock(r) {
    const g = new THREE.Group(), sx = 1.2 + r() * 2;
    g.add(mesh(G.ico, m('#7d8796'), { y: 0.5, s: [sx, 1 + r() * 1.5, sx], ry: r() * 6 }));
    g.add(mesh(G.ico, m('#f4f8fb'), { y: 1.1, s: [sx * 0.8, 0.5, sx * 0.8], ry: r() * 6 }));
    return g;
  },
  cairn(r) {
    const g = new THREE.Group();
    for (let i = 0; i < 4; i++) g.add(mesh(G.ico, m('#8d8f96'), { y: 0.25 + i * 0.4, s: [0.9 - i * 0.18, 0.45, 0.8 - i * 0.15], ry: r() * 6 }));
    return g;
  },
  crystal(r, color) {
    const g = new THREE.Group(), c = color ?? ['#6fd6ff', '#9cf2b8', '#c79bf2', '#ffd27a'][Math.floor(r() * 4)];
    for (let i = 0; i < 3; i++) g.add(mesh(G.oct, glow(c, 0.9), { x: (r() - 0.5), y: 0.6 + r() * 0.5, z: (r() - 0.5), s: [0.6, 1.6 + r() * 1.5, 0.6], rz: (r() - 0.5) * 0.6, cast: false }));
    return g;
  },
  stalagmite(r) { return mesh(G.cone, m('#4a4258'), { y: 1.2, s: [1 + r(), 2.5 + r() * 3, 1 + r()] }); },
  cavewall(r) { return mesh(G.ico, m('#2e2a3a'), { y: 2, s: [4 + r() * 4, 6 + r() * 6, 4 + r() * 4], ry: r() * 6 }); },
  lantern(r, color = '#ffc56b') {
    const g = new THREE.Group();
    g.add(mesh(G.cyl, m('#3a2c22'), { y: 1.4, s: [0.08, 2.8, 0.08] }));
    g.add(mesh(G.oct, glow(color, 2.2), { y: 2.9, s: [0.5, 0.75, 0.5], cast: false }));
    return g;
  },
  hanginglamp(r, color = '#ffc56b') { return mesh(G.oct, glow(color, 2), { y: 0, s: [0.4, 0.6, 0.4], cast: false }); },
  stall(r) {
    const g = new THREE.Group(), c = ['#c2553f', '#2d6f8a', '#d8a43a', '#6b4f8a'][Math.floor(r() * 4)];
    g.add(mesh(G.box, m('#7a5a3e'), { y: 0.5, s: [3, 1, 1.6] }));
    for (const x of [-1.4, 1.4]) g.add(mesh(G.cyl, m('#5a4330'), { x, y: 1.4, z: -0.7, s: [0.1, 2.8, 0.1] }));
    g.add(mesh(G.box, m(c), { y: 2.8, z: -0.1, s: [3.4, 0.12, 2], rx: 0.25 }));
    for (let i = 0; i < 4; i++) g.add(mesh(G.sph, m(['#e2a23b', '#c43d3d', '#7cb342', '#f1e3c6'][i]), { x: -1 + i * 0.66, y: 1.15, s: 0.36 }));
    return g;
  },
  boat(r) {
    const g = new THREE.Group();
    g.add(mesh(G.box, m('#8a5a3a'), { y: 0.3, s: [1.8, 0.7, 5] }));
    g.add(mesh(G.cone, m('#8a5a3a'), { y: 0.3, z: 2.9, s: [1.8, 1.2, 0.7], rx: Math.PI / 2 }));
    g.add(mesh(G.cyl, m('#d9c9a8'), { y: 2.3, s: [0.08, 4, 0.08] }));
    g.add(mesh(G.box, m('#efe6d2'), { y: 2.6, z: 0.6, s: [0.04, 2.6, 1.6] }));
    return g;
  },
  lighthouse() {
    const g = new THREE.Group();
    g.add(mesh(G.cyl, m('#e8e0d0'), { y: 6, s: [2.4, 12, 2.4] }));
    g.add(mesh(G.cyl, m('#b84a3a'), { y: 4, s: [2.45, 1.2, 2.45] }));
    g.add(mesh(G.cyl, glow('#fff1b8', 3), { y: 12.8, s: [1.4, 1.4, 1.4], cast: false }));
    g.add(mesh(G.cone, m('#3a3242'), { y: 14.2, s: [2.2, 1.4, 2.2] }));
    return g;
  },
  crate(r) { return mesh(G.box, m('#9a6b3f'), { y: 0.5, s: 1, ry: r() * 0.4 }); },
};

// ── particles: dust, pollen, cave sparkles, snow, fireflies ─────────
let dotTex = null;
function dot() {   // a soft round dot, so particles are never square
  if (dotTex) return dotTex;
  const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d');
  const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
  dotTex = new THREE.CanvasTexture(c); dotTex.userData.shared = true; return dotTex;
}
function particles(kind) {
  const n = { desert: 120, oasis: 160, caves: 260, mountain: 700, harbour: 220 }[kind] ?? 160;
  const pos = new Float32Array(n * 3), seed = new Float32Array(n);
  for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - 0.5) * 80; pos[i * 3 + 1] = Math.random() * 20; pos[i * 3 + 2] = (Math.random() - 0.5) * 80; seed[i] = Math.random(); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const color = { desert: '#fff0cf', oasis: '#fffbe0', caves: '#9fd8ff', mountain: '#ffffff', harbour: '#ffd27a' }[kind];
  const pm = new THREE.PointsMaterial({ color, map: dot(), alphaTest: 0.02, size: kind === 'mountain' ? 0.26 : 0.14, transparent: true, opacity: kind === 'mountain' ? 0.9 : 0.7, depthWrite: false, blending: kind === 'mountain' ? THREE.NormalBlending : THREE.AdditiveBlending });
  const pts = new THREE.Points(geo, pm); pts.frustumCulled = false;
  const fall = kind === 'mountain' ? 3.2 : kind === 'desert' ? 0.2 : -0.15;
  pts.userData.update = (dt, t, cam) => {
    const p = geo.attributes.position.array;
    for (let i = 0; i < n; i++) {
      p[i * 3 + 1] -= fall * dt * (0.5 + seed[i]);
      p[i * 3] += Math.sin(t * 0.7 + seed[i] * 9) * dt * (kind === 'desert' ? 2 : 0.4);
      if (p[i * 3 + 1] < 0) p[i * 3 + 1] += 20; if (p[i * 3 + 1] > 20) p[i * 3 + 1] -= 20;
      // keep them around the camera
      const dx = p[i * 3] - cam.position.x, dz = p[i * 3 + 2] - cam.position.z;
      if (dx > 40) p[i * 3] -= 80; if (dx < -40) p[i * 3] += 80;
      if (dz > 40) p[i * 3 + 2] -= 80; if (dz < -40) p[i * 3 + 2] += 80;
    }
    geo.attributes.position.needsUpdate = true;
  };
  return pts;
}

// water with gentle waves
export function water(w, d, color = '#3f8fb0') {
  const geo = new THREE.PlaneGeometry(w, d, Math.ceil(w / 3), Math.ceil(d / 3)); geo.rotateX(-Math.PI / 2);
  const base = geo.attributes.position.array.slice();
  const wm = new THREE.MeshStandardMaterial({ color, roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.88, flatShading: true });
  const wmesh = new THREE.Mesh(geo, wm); wmesh.receiveShadow = true;
  wmesh.userData.update = (dt, t) => {
    const p = geo.attributes.position.array;
    for (let i = 0; i < p.length; i += 3) p[i + 1] = base[i + 1] + Math.sin(base[i] * 0.4 + t * 1.6) * 0.12 + Math.cos(base[i + 2] * 0.35 + t * 1.2) * 0.12;
    geo.attributes.position.needsUpdate = true;
  };
  return wmesh;
}

// Sets up a scene for one land. Returns the environment's helpers.
export function buildEnv(key, { night = false } = {}) {
  const pal = PALETTES[key];
  const scene = new THREE.Scene();
  const starry = night || key === 'harbour';
  scene.add(skyDome(night && key !== 'harbour' ? '#0e1838' : pal.skyTop, night && key !== 'harbour' ? '#2b3466' : pal.skyBottom, starry));
  scene.fog = new THREE.Fog(night && key !== 'harbour' ? '#1d2448' : pal.fog, pal.fogNear, pal.fogFar);
  const dim = night && key !== 'harbour';   // the harbour is a night land already
  const hemi = new THREE.HemisphereLight(pal.hemiSky, pal.hemiGround, dim ? pal.hemiI * 0.5 : pal.hemiI);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(pal.sun, dim ? pal.sunI * 0.4 : pal.sunI);
  sun.position.set(30, 50, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 140 });
  sun.shadow.bias = -0.0008;
  scene.add(sun, sun.target);
  const dust = particles(key); scene.add(dust);
  const updaters = [dust];
  const env = {
    key, pal, scene, sun, hemi, night: starry,
    // keep the sun's shadow box over where the action is
    follow(p) { sun.position.set(p.x + 30, p.y + 50, p.z + 20); sun.target.position.copy(p); },
    add(o) { scene.add(o); if (o.userData.update) updaters.push(o); return o; },
    track(o) { if (o.userData.update) updaters.push(o); return o; },
    update(dt, t, cam) { for (const u of updaters) u.userData.update(dt, t, cam); },
    prop(name, r, ...a) { return PROPS[name](r, ...a); },
  };
  return env;
}

// What each land scatters around its tracks and maps (prop, weight)
export const SCATTER = {
  desert: [['dune', 3], ['palm', 2], ['rock', 2], ['tent', 1], ['arch', 0.5], ['house', 0.7]],
  oasis: [['palm', 3], ['tree', 3], ['bush', 3], ['flowers', 3], ['rock', 1]],
  caves: [['cavewall', 4], ['stalagmite', 3], ['crystal', 3], ['rock', 1]],
  mountain: [['pine', 4], ['snowrock', 3], ['cairn', 1]],
  harbour: [['house', 3], ['stall', 2], ['lantern', 3], ['palm', 1], ['crate', 1]],
};
export function pick(list, r) {
  const total = list.reduce((s, [, w]) => s + w, 0); let x = r() * total;
  for (const [n, w] of list) { x -= w; if (x <= 0) return n; }
  return list[0][0];
}
