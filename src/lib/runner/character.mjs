// Noor Trail runner: the student's own explorer, an ordinary child of today, built from smooth shapes so it loads instantly.
// A boy wears a kufi and a knee-length kurta; a girl wears a hijab and a long dress. Animated in code: idle, run, jump, slide, fall.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export function makeRunner(o = {}, prep = (m) => m) {
  const { girl = false, outfit = '#2F8F6B', pack = '#C0392B', skin = '#D9A97E', shadows = true } = o;
  // a girl's hijab is a soft tint of her outfit, so it never reads as hair
  const cover = o.cover ?? (girl ? new THREE.Color(outfit).lerp(new THREE.Color('#FFF6E8'), 0.55) : '#FFFFFF');
  const mat = (color, roughness = 0.75, extra = {}) => prep(new THREE.MeshStandardMaterial({ color, roughness, ...extra }));
  const M = {
    skin: mat(skin, 0.55), cloth: mat(outfit, 0.8),
    trouser: mat(girl ? new THREE.Color(outfit).multiplyScalar(0.62) : '#3B4150', 0.85),
    shoe: mat('#F7F4EE', 0.5), sole: mat('#33363D', 0.6), pack: mat(pack, 0.6), packDark: mat(new THREE.Color(pack).multiplyScalar(0.7), 0.6),
    cover: mat(cover, 0.85), hair: mat('#2A1D15', 0.7), eye: mat('#1E1510', 0.25), white: mat('#FFFFFF', 0.3), mouth: mat('#8A3B2E', 0.6),
    trim: mat('#E2B84F', 0.4, { metalness: 0.35 }),
  };
  const root = new THREE.Group();
  const hips = new THREE.Group(); hips.position.y = 0.725; root.add(hips);
  const add = (geo, m, parent, x = 0, y = 0, z = 0) => { const k = new THREE.Mesh(geo, m); k.position.set(x, y, z); k.castShadow = shadows; parent.add(k); return k; };
  const limb = (parent, x, y, r1, l1, r2, l2, m1, m2) => {
    const upper = new THREE.Group(); upper.position.set(x, y, 0); parent.add(upper);
    add(new THREE.CapsuleGeometry(r1, Math.max(0.01, l1 - r1), 4, 12), m1, upper, 0, -l1 / 2, 0);
    const lower = new THREE.Group(); lower.position.y = -l1; upper.add(lower);
    add(new THREE.CapsuleGeometry(r2, Math.max(0.01, l2 - r2), 4, 12), m2, lower, 0, -l2 / 2, 0);
    return { upper, lower };
  };

  // legs, from the hips; shoes point forward (-z)
  const legL = limb(hips, -0.095, 0, 0.078, 0.34, 0.064, 0.3, M.trouser, M.trouser);
  const legR = limb(hips, 0.095, 0, 0.078, 0.34, 0.064, 0.3, M.trouser, M.trouser);
  for (const L of [legL, legR]) {
    add(new RoundedBoxGeometry(0.13, 0.085, 0.24, 2, 0.035), M.shoe, L.lower, 0, -0.33, -0.04);
    add(new RoundedBoxGeometry(0.135, 0.03, 0.25, 1, 0.012), M.sole, L.lower, 0, -0.37, -0.04);
  }

  // the tunic (a lathe, flattened front to back) with a gold hem and collar
  const torso = new THREE.Group(); hips.add(torso);
  const shell = new THREE.Group(); shell.scale.z = 0.78; torso.add(shell);
  const prof = girl
    ? [[0, -0.47], [0.27, -0.47], [0.25, -0.3], [0.2, -0.05], [0.16, 0.1], [0.175, 0.3], [0.155, 0.42], [0.07, 0.48], [0, 0.49]]
    : [[0, -0.22], [0.205, -0.22], [0.188, -0.08], [0.16, 0.1], [0.175, 0.3], [0.155, 0.42], [0.07, 0.48], [0, 0.49]];
  add(new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 28), M.cloth, shell);
  const ring = (r, y, tube = 0.013) => { const k = add(new THREE.TorusGeometry(r, tube, 6, 32), M.trim, shell, 0, y, 0); k.rotation.x = Math.PI / 2; };
  ring(prof[1][0] + 0.002, prof[1][1] + 0.02);
  ring(0.085, 0.462, 0.012);
  if (!girl) add(new THREE.BoxGeometry(0.028, 0.2, 0.012), M.trim, torso, 0, 0.33, -0.132);

  // backpack with a front pocket, and its straps
  add(new RoundedBoxGeometry(0.3, 0.34, 0.14, 3, 0.045), M.pack, torso, 0, 0.24, 0.205);
  add(new RoundedBoxGeometry(0.22, 0.12, 0.06, 2, 0.02), M.packDark, torso, 0, 0.14, 0.29);
  for (const s of [-1, 1]) {
    add(new RoundedBoxGeometry(0.045, 0.3, 0.022, 1, 0.01), M.packDark, torso, s * 0.085, 0.3, -0.137);
    add(new RoundedBoxGeometry(0.045, 0.022, 0.3, 1, 0.01), M.packDark, torso, s * 0.085, 0.442, 0.03);
  }

  // neck and head (the face looks along -z)
  add(new THREE.CylinderGeometry(0.05, 0.055, 0.1, 12), M.skin, torso, 0, 0.52, 0);
  const head = new THREE.Group(); head.position.y = 0.67; torso.add(head);
  add(new THREE.SphereGeometry(0.165, 28, 20), M.skin, head).scale.set(1, 1.04, 1);
  for (const s of [-1, 1]) {
    add(new THREE.SphereGeometry(0.022, 12, 8), M.eye, head, s * 0.058, 0.015, -0.146);
    add(new THREE.SphereGeometry(0.007, 8, 6), M.white, head, s * 0.051, 0.025, -0.166);
    add(new THREE.SphereGeometry(0.034, 12, 8), M.skin, head, s * 0.163, 0, 0.005);
  }
  add(new THREE.SphereGeometry(0.02, 10, 8), M.skin, head, 0, -0.022, -0.165);
  const smile = add(new THREE.TorusGeometry(0.034, 0.0075, 6, 16, Math.PI), M.mouth, head, 0, -0.06, -0.151);
  smile.rotation.z = Math.PI;
  const FRONT_GAP = (deg) => [THREE.MathUtils.degToRad(270 + deg / 2), THREE.MathUtils.degToRad(360 - deg)]; // phiStart, phiLength: an opening over the face
  if (girl) {
    add(new THREE.SphereGeometry(0.176, 28, 12, 0, Math.PI * 2, 0, Math.PI * 0.34), M.cover, head);
    add(new THREE.SphereGeometry(0.19, 32, 24, ...FRONT_GAP(128)), M.cover, head);
    add(new THREE.CylinderGeometry(0.12, 0.27, 0.24, 32), M.cover, head, 0, -0.24, 0.01).scale.z = 0.85;
  } else {
    add(new THREE.SphereGeometry(0.171, 24, 16, ...FRONT_GAP(120), 0, Math.PI * 0.6), M.hair, head);
    add(new THREE.CylinderGeometry(0.168, 0.172, 0.09, 28), M.cover, head, 0, 0.1, 0);
    add(new THREE.SphereGeometry(0.168, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2), M.cover, head, 0, 0.145, 0).scale.y = 0.45;
    const band = add(new THREE.TorusGeometry(0.172, 0.008, 6, 40), M.trim, head, 0, 0.07, 0); band.rotation.x = Math.PI / 2;
  }

  // arms, from the shoulders, with hands
  const armL = limb(torso, -0.205, 0.39, 0.056, 0.24, 0.048, 0.22, M.cloth, M.cloth);
  const armR = limb(torso, 0.205, 0.39, 0.056, 0.24, 0.048, 0.22, M.cloth, M.cloth);
  for (const A of [armL, armR]) add(new THREE.SphereGeometry(0.05, 14, 10), M.skin, A.lower, 0, -0.245, 0);

  // ---------- animation ----------
  let phase = 0, t = 0;
  const cur = { thL: 0, thR: 0, knL: 0, knR: 0, arL: 0, arR: 0, elL: 0.2, elR: 0.2, lean: 0, hipY: 0.725, armZ: 0.12, headX: 0 };
  function update(dt, mode = 'idle', speed = 12) {
    t += dt;
    const P = { thL: 0, thR: 0, knL: 0, knR: 0, arL: 0.05, arR: 0.05, elL: 0.25, elR: 0.25, lean: 0, hipY: 0.725, armZ: 0.12, headX: 0 };
    let rate = 14;
    if (mode === 'run') {
      phase += dt * (5.5 + speed * 0.42);
      const s = Math.sin(phase), c = Math.cos(phase);
      P.thL = s * 0.95; P.thR = -s * 0.95;
      P.knL = -(0.2 + 1.3 * Math.max(0, c)); P.knR = -(0.2 + 1.3 * Math.max(0, -c));
      P.arL = -s * 0.85; P.arR = s * 0.85; P.elL = P.elR = 1.35;
      P.lean = -0.2; P.hipY = 0.705 + Math.abs(c) * 0.075; P.armZ = 0.08; P.headX = 0.12;
      rate = 30;
    } else if (mode === 'jump') {
      P.thL = 1.25; P.thR = 0.35; P.knL = -1.6; P.knR = -1.05; P.arL = 2.5; P.arR = 2.2; P.elL = P.elR = 0.5; P.armZ = 0.35; P.lean = -0.12;
    } else if (mode === 'slide') {
      P.thL = P.thR = 1.25; P.knL = -0.1; P.knR = -0.35; P.arL = P.arR = -0.5; P.elL = P.elR = 0.3; P.armZ = 0.65; P.lean = 1.0; P.hipY = 0.3; P.headX = -0.5;
      rate = 22;
    } else if (mode === 'fall') {
      P.thL = 0.4; P.thR = -0.3; P.knL = -1.2; P.knR = -0.6; P.arL = 2.0; P.arR = 1.6; P.elL = P.elR = 0.6; P.lean = -1.25; P.hipY = 0.38; P.armZ = 0.4;
      rate = 9;
    } else {
      P.hipY = 0.725 + Math.sin(t * 2.2) * 0.008; P.armZ = 0.14 + Math.sin(t * 2.2) * 0.02; P.headX = Math.sin(t * 0.9) * 0.05;
    }
    const k = 1 - Math.exp(-dt * rate);
    for (const key in cur) cur[key] += (P[key] - cur[key]) * k;
    legL.upper.rotation.x = cur.thL; legR.upper.rotation.x = cur.thR;
    legL.lower.rotation.x = cur.knL; legR.lower.rotation.x = cur.knR;
    armL.upper.rotation.set(cur.arL, 0, -cur.armZ); armR.upper.rotation.set(cur.arR, 0, cur.armZ);
    armL.lower.rotation.x = cur.elL; armR.lower.rotation.x = cur.elR;
    torso.rotation.x = cur.lean; hips.position.y = cur.hipY; head.rotation.x = cur.headX;
  }
  update(1);
  return { root, update, dispose: () => root.traverse((m) => { if (m.isMesh) { m.geometry.dispose(); } }) };
}
