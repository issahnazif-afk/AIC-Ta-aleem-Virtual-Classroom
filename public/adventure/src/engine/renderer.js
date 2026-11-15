// One WebGL renderer for the whole game. Quality adapts to the device: phones get a lower pixel ratio and no
// shadows; if frames run slow, quality steps down by itself.
import * as THREE from '../../vendor/three.module.min.js';
import { save } from './save.js';

export { THREE };
export const isMobile = matchMedia('(pointer: coarse)').matches || /Android|iPhone|iPad/i.test(navigator.userAgent);

export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 600);
  const state = { renderer, camera, level: 'high', slow: 0, scene: null };

  function applyQuality() {
    const q = save.settings.quality === 'auto' ? (isMobile ? 'medium' : state.level) : save.settings.quality;
    const pr = q === 'low' ? 1 : q === 'medium' ? Math.min(devicePixelRatio, 1.5) : Math.min(devicePixelRatio, 2);
    renderer.setPixelRatio(pr);
    renderer.shadowMap.enabled = q === 'high';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    state.quality = q;
    resize();
  }
  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // narrow phone screens see a little wider, so the lanes either side stay in view
    camera.fov = w / h < 0.8 ? 74 : 62;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  addEventListener('resize', resize);
  applyQuality();

  // frame time watch: if the game runs slowly for a few seconds, drop to the next quality level
  state.watch = (dt) => {
    if (save.settings.quality !== 'auto') return;
    state.slow = dt > 1 / 40 ? state.slow + dt : Math.max(0, state.slow - dt * 0.5);
    if (state.slow > 3 && state.level !== 'low') { state.level = state.level === 'high' ? 'medium' : 'low'; state.slow = 0; applyQuality(); }
  };
  state.applyQuality = applyQuality;
  state.resize = resize;
  return state;
}

// shared helpers
export const mat = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.02, flatShading: true, ...opts });
export const glow = (color, intensity = 1.6) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: 0.4 });
export function mesh(geo, material, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1, cast = true, receive = false } = {}) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z); m.rotation.set(rx, ry, rz);
  if (typeof s === 'number') m.scale.setScalar(s); else m.scale.set(...s);
  m.castShadow = cast; m.receiveShadow = receive;
  return m;
}
export function disposeTree(obj) {
  obj.traverse((o) => {
    if (o.geometry && !o.geometry.userData.shared) o.geometry.dispose();
    if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (m.userData?.shared) return; if (!m.map?.userData?.shared) m.map?.dispose(); m.dispose(); });
  });
}
// a seeded random, so each stage's world is the same every time it is played
export function rng(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
}
