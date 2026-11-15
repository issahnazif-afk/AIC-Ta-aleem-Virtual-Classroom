// The explorer (customisable), the guide Ustadh Hakim and friendly rivals — low-poly figures made from simple
// shapes, with a few hand-made animations (idle, run, jump, slide, stumble, wave, carry).
// All are fictional characters. No figure in the game represents a prophet or a companion.
import { THREE, mat, glow, mesh } from '../engine/renderer.js';

const geo = {
  limb: new THREE.CapsuleGeometry(0.11, 0.42, 3, 8),
  arm: new THREE.CapsuleGeometry(0.09, 0.36, 3, 8),
  head: new THREE.SphereGeometry(0.27, 16, 12),
  eye: new THREE.SphereGeometry(0.035, 6, 6),
  torso: new THREE.CylinderGeometry(0.26, 0.32, 0.62, 10),
  robe: new THREE.CylinderGeometry(0.27, 0.42, 1.05, 12),
  box: new THREE.BoxGeometry(1, 1, 1),
  kufi: new THREE.CylinderGeometry(0.25, 0.27, 0.16, 14),
  turban: new THREE.TorusGeometry(0.22, 0.09, 8, 16),
  dome: new THREE.SphereGeometry(0.28, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2),
  brim: new THREE.CylinderGeometry(0.45, 0.45, 0.04, 16),
  hand: new THREE.SphereGeometry(0.075, 8, 6),
  boot: new THREE.BoxGeometry(0.2, 0.14, 0.32),
  beard: new THREE.ConeGeometry(0.2, 0.32, 8),
  cape: new THREE.PlaneGeometry(0.7, 0.95, 1, 4),
  oct: new THREE.OctahedronGeometry(0.12, 0),
};
for (const g of Object.values(geo)) g.userData.shared = true;   // used by every figure: never disposed with a scene

// look: { skin, outfit, accent, head, style }, gear: ids being worn
export function makeExplorer(look, gear = []) {
  const root = new THREE.Group();
  const body = new THREE.Group(); root.add(body);   // the body bobs and leans; root holds position and heading
  const skin = mat(look.skin, { flatShading: false, roughness: 0.7 });
  const cloth = mat(look.outfit);
  const accent = mat(look.accent);
  const dark = mat('#2b2420');

  const hip = new THREE.Group(); hip.position.y = 0.78; body.add(hip);
  const legs = [-0.12, 0.12].map((x) => {
    const g = new THREE.Group(); g.position.set(x, 0, 0); hip.add(g);
    g.add(mesh(geo.limb, cloth, { y: -0.32 }));
    g.add(mesh(geo.boot, gear.includes('boots') ? mat('#7a4b2a') : dark, { y: -0.68, z: 0.05 }));
    return g;
  });
  const chest = new THREE.Group(); chest.position.y = 0.78; body.add(chest);
  if (look.style === 'thobe') chest.add(mesh(geo.robe, cloth, { y: 0.05 }));
  chest.add(mesh(geo.torso, cloth, { y: 0.32 }));
  chest.add(mesh(geo.box, accent, { y: 0.06, s: [0.6, 0.08, 0.58] }));   // belt / sash
  if (look.style === 'jacket') {
    chest.add(mesh(geo.box, mat('#6b4a2e'), { y: 0.36, z: 0.02, s: [0.58, 0.55, 0.5] }));
    chest.add(mesh(geo.box, accent, { y: 0.36, z: 0.27, s: [0.06, 0.5, 0.02] }));
  }
  const arms = [-1, 1].map((side) => {
    const g = new THREE.Group(); g.position.set(side * 0.34, 0.56, 0); chest.add(g);
    g.add(mesh(geo.arm, cloth, { y: -0.24 }));
    g.add(mesh(geo.hand, skin, { y: -0.5 }));
    return g;
  });
  const head = new THREE.Group(); head.position.y = 0.92; chest.add(head);
  head.add(mesh(geo.head, skin, { y: 0.2 }));
  for (const x of [-0.09, 0.09]) head.add(mesh(geo.eye, dark, { x, y: 0.24, z: 0.245, cast: false }));
  addHeadwear(head, look, accent, cloth);

  // gear on the body
  if (gear.includes('satchel')) {
    chest.add(mesh(geo.box, mat('#8a5a34'), { x: 0, y: 0.32, z: -0.33, s: [0.42, 0.46, 0.18] }));
    chest.add(mesh(geo.box, mat('#6e4527'), { y: 0.36, s: [0.66, 0.06, 0.62], rz: 0.6 }));
  }
  if (gear.includes('scarf')) chest.add(mesh(new THREE.TorusGeometry(0.2, 0.07, 6, 14), mat('#d9534f'), { y: 0.66, rx: Math.PI / 2 }));
  if (gear.includes('magnet')) chest.add(mesh(geo.oct, glow('#9bd5bd', 1.4), { y: 0.5, z: 0.29, cast: false }));
  let lamp = null;
  if (gear.includes('lantern')) {
    lamp = mesh(geo.oct, glow('#ffc56b', 2.4), { y: -0.62, s: [1.3, 1.8, 1.3], cast: false });
    arms[1].add(lamp);
  }
  let cape = null;
  if (gear.includes('cape')) {
    cape = mesh(geo.cape, new THREE.MeshStandardMaterial({ color: look.accent, emissive: look.accent, emissiveIntensity: 0.35, side: THREE.DoubleSide, roughness: 0.6 }), { y: 0.15, z: -0.3 });
    chest.add(cape);
  }

  root.userData = { body, hip, chest, legs, arms, head, cape, lamp, t: 0 };
  root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return root;
}

function addHeadwear(head, look, accent, cloth) {
  const white = mat('#f2efe6');
  if (look.head === 'kufi') head.add(mesh(geo.kufi, white, { y: 0.4 }));
  if (look.head === 'turban') {
    head.add(mesh(geo.dome, mat('#f2efe6'), { y: 0.28, s: [1.05, 0.9, 1.05] }));
    head.add(mesh(geo.turban, mat('#e9e3d3'), { y: 0.32, rx: Math.PI / 2, s: [1.15, 1.15, 1.2] }));
  }
  if (look.head === 'scarf') {
    // a headscarf framing the face, falling to the shoulders
    const sc = mat(look.accent === '#f3c66d' ? '#3d5a80' : look.accent);
    head.add(mesh(new THREE.SphereGeometry(0.31, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), sc, { y: 0.2, rx: -0.35 }));
    head.add(mesh(new THREE.CylinderGeometry(0.24, 0.34, 0.34, 14, 1, true), sc, { y: -0.08 }));
  }
  if (look.head === 'hat') {
    head.add(mesh(geo.brim, mat('#a07a4a'), { y: 0.36 }));
    head.add(mesh(geo.kufi, mat('#a07a4a'), { y: 0.45, s: [1, 1.6, 1] }));
    head.add(mesh(geo.kufi, accent, { y: 0.4, s: [1.02, 0.4, 1.02] }));
  }
}

// The guide: an older man with a white beard, a long robe and a turban (fictional)
export function makeGuide() {
  const g = makeExplorer({ skin: '#c98e62', outfit: '#e7e1d2', accent: '#3d6b3a', head: 'turban', style: 'thobe' }, []);
  const { head, chest } = g.userData;
  head.add(mesh(geo.beard, mat('#f1f1ee'), { y: 0.03, z: 0.12, rx: Math.PI, s: [1, 1, 0.8] }));
  chest.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 6), mat('#6b4b32'), { x: 0.5, y: -0.1, z: 0.15 }));   // walking staff
  g.scale.setScalar(1.06);
  return g;
}

// Friendly rivals in the arena: other young explorers
export function makeFriend(i = 0) {
  const looks = [
    { skin: '#e2b48c', outfit: '#8a3b3b', accent: '#e8e2d0', head: 'kufi', style: 'tunic' },
    { skin: '#7d5236', outfit: '#2d5c8a', accent: '#f3c66d', head: 'scarf', style: 'thobe' },
    { skin: '#a8714a', outfit: '#6b4f8a', accent: '#9bd5bd', head: 'hat', style: 'jacket' },
  ];
  return makeExplorer(looks[i % looks.length], ['satchel']);
}

// Poses. state: idle | run | jump | slide | stumble | wave | carry | walk. speed 0..1 for run/walk.
export function animate(ex, state, dt, speed = 1) {
  const u = ex.userData; u.t += dt * (state === 'run' ? 11 * (0.6 + speed * 0.5) : state === 'walk' ? 7 : 2.4);
  const t = u.t, s = Math.sin(t), c = Math.cos(t);
  const L = u.legs, A = u.arms;
  const ease = (o, k, v) => { o[k] += (v - o[k]) * Math.min(1, dt * 14); };
  let bob = 0, lean = 0, crouch = 0;
  let l0 = 0, l1 = 0, a0 = 0, a1 = 0, a1z = 0;
  if (state === 'run' || state === 'walk') {
    const amp = state === 'run' ? 0.95 : 0.55;
    l0 = s * amp; l1 = -s * amp; a0 = -s * amp * 0.9; a1 = s * amp * 0.9;
    bob = Math.abs(c) * (state === 'run' ? 0.12 : 0.05); lean = state === 'run' ? 0.18 : 0.05;
  } else if (state === 'jump') { l0 = -0.9; l1 = 0.4; a0 = -2.4; a1 = -2.4; lean = 0.1; }
  else if (state === 'slide') { l0 = -1.45; l1 = -1.2; a0 = 0.6; a1 = 0.6; lean = -0.9; crouch = 0.45; }
  else if (state === 'stumble') { l0 = 0.5; l1 = -0.3; a0 = -1.2; a1 = 1.4; lean = -0.35; }
  else if (state === 'wave') { a1 = -2.7; a1z = Math.sin(t * 3) * 0.35; bob = Math.sin(t) * 0.02; }
  else if (state === 'carry') { l0 = s * 0.5; l1 = -s * 0.5; a0 = -2.6; a1 = -2.6; bob = Math.abs(c) * 0.05; }
  else { bob = Math.sin(t) * 0.025; a0 = Math.sin(t * 0.8) * 0.05; a1 = -a0; }
  ease(L[0].rotation, 'x', l0); ease(L[1].rotation, 'x', l1);
  ease(A[0].rotation, 'x', a0); ease(A[1].rotation, 'x', a1); ease(A[1].rotation, 'z', a1z);
  ease(u.body.position, 'y', bob - crouch); ease(u.body.rotation, 'x', lean);
  if (u.cape) u.cape.rotation.x = -0.15 - (state === 'run' ? 0.6 + Math.sin(t * 2) * 0.1 : 0.05 + Math.sin(t) * 0.04);
}
