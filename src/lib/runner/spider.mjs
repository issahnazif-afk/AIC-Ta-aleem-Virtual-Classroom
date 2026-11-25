// Noor Trail villains: cartoon "zombie spiders". Spooky-funny, never gory: a mottled grey-green body with glowing
// green cracks, pale bony ribs, six glowing eyes and eight legs that really walk (an alternating four-and-four gait).
// One shared set of geometry and materials; makeSpider() returns a light object with its own animation state.
import * as THREE from 'three';

let KIT = null;
function kit(prep) {
  if (KIT) return KIT;
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#56644C'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) { const v = Math.random(); g.fillStyle = v < 0.5 ? `rgba(30,40,28,${0.15 + Math.random() * 0.25})` : `rgba(140,160,120,${0.08 + Math.random() * 0.15})`; const r = 2 + Math.random() * 9; g.beginPath(); g.arc(Math.random() * 256, Math.random() * 256, r, 0, 7); g.fill(); }
  const e = document.createElement('canvas'); e.width = e.height = 256;
  const h = e.getContext('2d'); h.fillStyle = '#000'; h.fillRect(0, 0, 256, 256);
  h.strokeStyle = '#7CFF3A'; h.lineCap = 'round';
  for (let i = 0; i < 14; i++) { h.lineWidth = 1 + Math.random() * 2.5; h.beginPath(); let x = Math.random() * 256, y = Math.random() * 256; h.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (Math.random() - 0.5) * 50; y += (Math.random() - 0.5) * 50; h.lineTo(x, y); } h.stroke(); }
  const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace;
  const emap = new THREE.CanvasTexture(e); emap.colorSpace = THREE.SRGBColorSpace;
  const M = (o) => prep(new THREE.MeshStandardMaterial(o));
  KIT = {
    body: M({ map, emissiveMap: emap, emissive: '#7CFF3A', emissiveIntensity: 0.9, roughness: 0.75 }),
    head: M({ color: '#3F4A39', roughness: 0.6 }),
    leg: M({ color: '#2E3529', roughness: 0.7 }),
    bone: M({ color: '#E8E2CF', roughness: 0.55 }),
    eye: M({ color: '#B6FF6A', emissive: '#8CFF2E', emissiveIntensity: 3.2, roughness: 0.2 }),
    fang: M({ color: '#F1EADB', roughness: 0.4 }),
    thread: new THREE.MeshBasicMaterial({ color: '#E9F2E4', transparent: true, opacity: 0.55 }),
    g: {
      abdomen: new THREE.SphereGeometry(1, 24, 18), thorax: new THREE.SphereGeometry(1, 20, 14),
      femur: new THREE.CapsuleGeometry(0.055, 0.5, 4, 8).translate(0, 0.3, 0), tibia: new THREE.CapsuleGeometry(0.045, 0.74, 4, 8).translate(0, -0.43, 0),
      knee: new THREE.SphereGeometry(0.07, 10, 8), eye: new THREE.SphereGeometry(0.045, 10, 8), fang: new THREE.ConeGeometry(0.035, 0.16, 8).rotateX(Math.PI),
      rib: new THREE.TorusGeometry(0.33, 0.022, 6, 20, Math.PI), thread: new THREE.CylinderGeometry(0.008, 0.008, 1, 4).translate(0, 0.5, 0),
    },
  };
  return KIT;
}

export function makeSpider(prep = (m) => m, { scale = 1, shadows = true } = {}) {
  const K = kit(prep), G = K.g;
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const mesh = (geo, m, parent, x = 0, y = 0, z = 0) => { const k = new THREE.Mesh(geo, m); k.position.set(x, y, z); k.castShadow = shadows; parent.add(k); return k; };
  // the spider faces +z (towards the runner, who runs along -z)
  mesh(G.abdomen, K.body, body, 0, 0.62, -0.42).scale.set(0.46, 0.4, 0.56);
  for (let i = 0; i < 3; i++) { const r = mesh(G.rib, K.bone, body, 0, 0.66, -0.25 - i * 0.18); r.rotation.y = Math.PI / 2; r.scale.set(1 - i * 0.12, 1.05 - i * 0.1, 1); }
  mesh(G.thorax, K.head, body, 0, 0.55, 0.22).scale.set(0.3, 0.24, 0.32);
  for (const [x, y, z] of [[-0.09, 0.66, 0.48], [0.09, 0.66, 0.48], [-0.16, 0.62, 0.43], [0.16, 0.62, 0.43], [-0.05, 0.72, 0.44], [0.05, 0.72, 0.44]]) mesh(G.eye, K.eye, body, x, y, z);
  for (const s of [-1, 1]) { const f = mesh(G.fang, K.fang, body, s * 0.06, 0.42, 0.5); f.rotation.z = s * 0.25; }
  const legs = [];
  for (let i = 0; i < 8; i++) {
    const side = i < 4 ? -1 : 1, k = i % 4;
    const hip = new THREE.Group(); hip.position.set(side * 0.2, 0.58, 0.32 - k * 0.14); body.add(hip);
    // yaw turns the leg's local +x outwards; the front pair reaches forward (+z), the back pair backward
    const spread = 0.75 - k * 0.5, base = side > 0 ? -spread : Math.PI + spread;
    const femur = new THREE.Group(); hip.add(femur);
    mesh(G.femur, K.leg, femur);
    const knee = new THREE.Group(); knee.position.y = 0.6; femur.add(knee);
    mesh(G.knee, K.bone, knee);
    mesh(G.tibia, K.leg, knee);
    legs.push({ hip, femur, knee, side, base, group: (k + (side > 0 ? 1 : 0)) % 2 });
  }
  const thread = new THREE.Mesh(G.thread, K.thread); thread.visible = false; root.add(thread);
  root.scale.setScalar(scale);
  let phase = Math.random() * 6;
  const s = {
    root, thread, alive: true, dead: 0,
    // speed: how fast the legs move (0 = still); hang: a dangling spider pulls its legs in
    update(dt, speed = 1, hang = false) {
      phase += dt * (4 + speed * 9);
      for (const L of legs) {
        const p = phase + (L.group ? Math.PI : 0), sw = Math.sin(p), lift = Math.max(0, Math.cos(p));
        L.hip.rotation.y = L.base + (hang ? 0 : sw * 0.35 * -L.side);
        L.femur.rotation.z = hang ? -0.25 : -(1.05 + lift * 0.35 * Math.min(1, speed));
        L.knee.rotation.z = hang ? 2.3 : 1.35 - lift * 0.3;
      }
      body.position.y = hang ? 0 : Math.abs(Math.sin(phase)) * 0.03;
      body.rotation.z = Math.sin(phase * 0.5) * 0.04;
    },
    // knocked away by the shield of light: it flips and tumbles off the path
    knock(dir = 1) { s.alive = false; s.dead = 0.001; s.spin = dir; },
    tumble(dt) {
      s.dead += dt;
      root.position.y += dt * (6 - s.dead * 12); root.position.x += dt * 7 * s.spin;
      root.rotation.x += dt * 9; root.rotation.z += dt * 6 * s.spin;
      return s.dead < 1.2;
    },
  };
  s.update(0.016, 0);
  return s;
}
