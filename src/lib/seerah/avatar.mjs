// The student's explorer in 3D: a blocky child made of boxes, about 1.5 m tall, with a kufi or a hijab,
// a long tunic and a backpack. It is the student, an ordinary child of today, never a person from the history.
import * as THREE from 'three';

function faceTexture(skin) {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = skin; g.fillRect(0, 0, 64, 64);
  g.fillStyle = '#2B2018'; g.fillRect(19, 24, 7, 9); g.fillRect(38, 24, 7, 9);
  g.fillStyle = '#fff'; g.fillRect(21, 25, 2, 3); g.fillRect(40, 25, 2, 3);
  g.strokeStyle = '#2B2018'; g.lineWidth = 3; g.lineCap = 'round';
  g.beginPath(); g.moveTo(23, 42); g.quadraticCurveTo(32, 49, 41, 42); g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter;
  return t;
}

export function makeAvatar(a, { shadows = false } = {}) {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const mat = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
  const skin = mat(a.skin), cloth = mat(a.outfit), pack = mat(a.pack), cover = mat(a.cover), shoe = mat('#5A3E28'), trouser = mat(a.girl ? a.outfit : '#4B4B55');
  const box = (w, h, d, m, x, y, z, parent = body) => { const k = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); k.position.set(x, y, z); k.castShadow = shadows; parent.add(k); return k; };
  // legs hang from the hips so they can swing
  const leg = (x) => { const g = new THREE.Group(); g.position.set(x, 0.62, 0); body.add(g); box(0.24, 0.5, 0.26, trouser, 0, -0.3, 0, g); box(0.26, 0.12, 0.32, shoe, 0, -0.56, 0.03, g); return g; };
  const legL = leg(-0.14), legR = leg(0.14);
  // the tunic: a long thobe for a boy, a long dress for a girl
  box(0.56, 0.62, 0.32, cloth, 0, 0.95, 0);
  if (a.girl) box(0.62, 0.5, 0.36, cloth, 0, 0.42, 0);
  else box(0.56, 0.22, 0.32, cloth, 0, 0.56, 0);
  // arms hang from the shoulders
  const arm = (x) => { const g = new THREE.Group(); g.position.set(x, 1.22, 0); body.add(g); box(0.2, 0.52, 0.24, cloth, 0, -0.24, 0, g); box(0.18, 0.12, 0.2, skin, 0, -0.55, 0, g); return g; };
  const armL = arm(-0.39), armR = arm(0.39);
  // the backpack and its straps
  box(0.42, 0.46, 0.2, pack, 0, 0.98, -0.26);
  box(0.36, 0.14, 0.06, mat(new THREE.Color(a.pack).multiplyScalar(0.75)), 0, 1.12, -0.38);
  box(0.06, 0.5, 0.04, pack, -0.17, 0.98, 0.17); box(0.06, 0.5, 0.04, pack, 0.17, 0.98, 0.17);
  // the head, with a face on the front only
  const faceMats = [skin, skin, skin, skin, new THREE.MeshStandardMaterial({ map: faceTexture(a.skin), roughness: 0.9 }), skin];
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.42, 0.42), faceMats); head.position.set(0, 1.5, 0); head.castShadow = shadows; body.add(head);
  if (a.head === 'kufi') box(0.46, 0.12, 0.44, cover, 0, 0.24, 0, head);
  else if (a.head === 'hijab') {
    box(0.52, 0.1, 0.5, cover, 0, 0.24, -0.01, head);        // top
    box(0.52, 0.5, 0.08, cover, 0, 0.0, -0.24, head);        // back
    box(0.06, 0.5, 0.48, cover, -0.25, 0.0, -0.01, head);    // sides
    box(0.06, 0.5, 0.48, cover, 0.25, 0.0, -0.01, head);
    box(0.52, 0.06, 0.08, cover, 0, 0.17, 0.21, head);       // the band over the forehead
    box(0.52, 0.1, 0.08, cover, 0, -0.22, 0.21, head);       // under the chin
    box(0.66, 0.2, 0.42, cover, 0, 1.22, 0);                 // over the shoulders
  } else box(0.46, 0.08, 0.44, mat('#2B2018'), 0, 0.23, 0, head);
  // the soft round shadow under the feet (cheaper than real shadows, and it helps to judge a jump)
  const blob = new THREE.Mesh(new THREE.CircleGeometry(0.42, 20), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false }));
  blob.rotation.x = -Math.PI / 2; blob.renderOrder = 1;

  let phase = 0;
  // pose: speed 0..1 (walking to running), air: in the air, climb: climbing a ledge
  function animate(dt, { speed = 0, air = false, climb = false, t = 0 }) {
    if (climb) { armL.rotation.x = armR.rotation.x = -2.6; legL.rotation.x = -0.9; legR.rotation.x = 0.2; body.position.y = 0; return; }
    if (air) { armL.rotation.x = armR.rotation.x = -2.4; legL.rotation.x = -0.6; legR.rotation.x = 0.35; body.position.y = 0; return; }
    if (speed > 0.05) {
      phase += dt * (6 + speed * 7);
      const k = 0.5 + speed * 0.45, s = Math.sin(phase);
      legL.rotation.x = s * k; legR.rotation.x = -s * k; armL.rotation.x = -s * k * 0.9; armR.rotation.x = s * k * 0.9;
      body.position.y = Math.abs(Math.cos(phase)) * 0.05 * speed;
    } else {
      const ease = 1 - Math.min(1, dt * 10);
      legL.rotation.x *= ease; legR.rotation.x *= ease; armL.rotation.x *= ease; armR.rotation.x *= ease;
      body.position.y = Math.sin(t * 2) * 0.012;
    }
  }
  return { root, blob, animate, dispose() { root.traverse((o) => { o.geometry?.dispose(); }); } };
}
