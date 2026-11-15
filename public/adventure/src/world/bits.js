// Small shared pieces: text drawn onto signs in the world, light motes (the collectible), gentle bursts.
import { THREE, glow, mesh } from '../engine/renderer.js';

// A sign with text (canvas texture), wrapped to fit. Arabic or English.
export function textSign(text, { w = 3, h = 1.2, bg = '#173d32', fg = '#f7f1df', border = '#f3c66d', size = 64 } = {}) {
  const cw = 512, ch = Math.round(512 * (h / w));
  const c = document.createElement('canvas'); c.width = cw; c.height = ch;
  const g = c.getContext('2d');
  g.fillStyle = bg; roundRect(g, 4, 4, cw - 8, ch - 8, 26); g.fill();
  g.lineWidth = 8; g.strokeStyle = border; roundRect(g, 10, 10, cw - 20, ch - 20, 22); g.stroke();
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  let fs = size, lines;
  for (;;) {
    g.font = `700 ${fs}px "DM Sans", system-ui, sans-serif`;
    lines = wrap(g, text, cw - 60);
    if (lines.length * fs * 1.15 <= ch - 40 || fs <= 22) break;
    fs -= 4;
  }
  lines.forEach((l, i) => g.fillText(l, cw / 2, ch / 2 + (i - (lines.length - 1) / 2) * fs * 1.15));
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, fog: false }));
  return m;
}
function wrap(g, text, max) {
  const words = String(text).split(' '), out = []; let line = '';
  for (const w of words) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > max && line) { out.push(line); line = w; } else line = t; }
  if (line) out.push(line);
  return out;
}
function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

// A light mote: a small glowing star (fiction — never a sacred object)
const moteGeo = new THREE.OctahedronGeometry(0.32, 0);
moteGeo.userData.shared = true;
const moteMat = Object.assign(glow('#ffc94a', 1.1), { userData: { shared: true } });
export function mote() {
  const g = new THREE.Group();
  g.add(mesh(moteGeo, moteMat, { cast: false }));
  g.userData.spin = Math.random() * 6;
  return g;
}
export function spinMote(m, dt, t) { m.rotation.y += dt * 2.4; m.children[0].position.y = Math.sin(t * 3 + m.userData.spin) * 0.15; }

// A short sparkle burst where something was collected or opened
export function burst(scene, pos, color = '#ffe29a', n = 14) {
  const geo = new THREE.BufferGeometry(), p = new Float32Array(n * 3), v = [];
  for (let i = 0; i < n; i++) { p.set([pos.x, pos.y, pos.z], i * 3); v.push(new THREE.Vector3((Math.random() - 0.5) * 5, Math.random() * 5, (Math.random() - 0.5) * 5)); }
  geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color, size: 0.25, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  let life = 0.7;
  pts.userData.update = (dt) => {
    life -= dt; const a = geo.attributes.position.array;
    for (let i = 0; i < n; i++) { v[i].y -= 9 * dt; a[i * 3] += v[i].x * dt; a[i * 3 + 1] += v[i].y * dt; a[i * 3 + 2] += v[i].z * dt; }
    geo.attributes.position.needsUpdate = true; pts.material.opacity = Math.max(0, life / 0.7);
    if (life <= 0) { pts.parent?.remove(pts); geo.dispose(); pts.material.dispose(); pts.userData.dead = true; }
  };
  scene.add(pts);
  return pts;
}

// A shimmering barrier for knowledge gates
export function barrier(w = 3, h = 4) {
  const material = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { t: { value: 0 }, c: { value: new THREE.Color('#9bd5bd') }, fade: { value: 1 } },
    vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform float t; uniform vec3 c; uniform float fade; varying vec2 vU;
      void main(){ float l = 0.35 + 0.25 * sin(vU.y * 24.0 - t * 3.0) + 0.2 * sin(vU.x * 18.0 + t * 2.0);
        float edge = smoothstep(0.0, 0.08, vU.x) * smoothstep(1.0, 0.92, vU.x);
        gl_FragColor = vec4(c * (0.8 + l), (0.25 + l * 0.35) * edge * fade); }`,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  m.userData.update = (dt, t) => { material.uniforms.t.value = t; };
  return m;
}
