// The Seerah Quest's Roblox-style play props, built in the same valley as world.mjs:
//   the training yard  practice pots and crates to smash (only these can ever be broken), which drop lights and
//                      building materials, and sometimes hide a knowledge scroll
//   the puzzle vault   a stone chamber with glowing floor plates; stepping on them in the right order opens a
//                      hidden room with a chest
//   the build plot     a grid where the student builds whatever they like with blocks, walls, stairs, arches,
//                      palms and lamps (a fictional design of their own, saved with their progress)
//   the learning model a wooden practice model the student raises course by course by carrying blocks to it
// None of these is a historical object and none is ever placed on or near the House: world.protectedAt() refuses it.
import * as THREE from 'three';

// a sign or a floating label: words drawn on a canvas, always facing the camera
export function label(text, { w = 4.2, color = '#3b2a12', bg = 'rgba(255,244,214,.94)', border = '#C9A24A', font = 44 } = {}) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 160;
  const g = c.getContext('2d');
  g.fillStyle = bg; g.strokeStyle = border; g.lineWidth = 8;
  g.beginPath(); if (g.roundRect) g.roundRect(6, 6, 500, 148, 26); else g.rect(6, 6, 500, 148); g.fill(); g.stroke();
  g.fillStyle = color; g.font = `bold ${font}px system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  // up to two lines
  const words = String(text).split(' '), lines = ['']; for (const wd of words) { const t = (lines.at(-1) + ' ' + wd).trim(); if (g.measureText(t).width > 460 && lines.at(-1)) lines.push(wd); else lines[lines.length - 1] = t; }
  const L = lines.slice(0, 2); L.forEach((l, i) => g.fillText(l, 256, 80 + (i - (L.length - 1) / 2) * (font + 6)));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false }));
  s.scale.set(w, w * 160 / 512, 1); s.renderOrder = 2;
  return s;
}

function plankTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  g.fillStyle = '#9a6b3c'; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#a8774a' : '#8f6236'; g.fillRect(0, i * 32 + 2, 128, 28); }
  g.strokeStyle = '#5b3a1e'; g.lineWidth = 6; g.strokeRect(3, 3, 122, 122); g.beginPath(); g.moveTo(6, 6); g.lineTo(122, 122); g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function runeTexture(n) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  g.fillStyle = '#5d5146'; g.fillRect(0, 0, 128, 128);
  g.strokeStyle = '#e8d6b0'; g.lineWidth = 5; for (const r of [56, 40]) { g.beginPath(); g.arc(64, 64, r, 0, Math.PI * 2); g.stroke(); }
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; g.beginPath(); g.moveTo(64 + Math.cos(a) * 40, 64 + Math.sin(a) * 40); g.lineTo(64 + Math.cos(a) * 56, 64 + Math.sin(a) * 56); g.stroke(); }
  g.fillStyle = '#e8d6b0'; g.font = 'bold 44px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), 64, 66);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function makeProps(world) {
  const { scene, addSolid, removeSolid, clearAround, glowMap, stoneTex, Q, P } = world.k;
  const H = world.heightAt;
  const glowSprite = (color, s) => { const g = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap(), color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); g.scale.setScalar(s); return g; };
  const flatten = (x, z) => H(x, z);

  // ── shards: the harmless burst when a practice prop breaks ──
  function shatter(x, y, z, color, n = 14) {
    const parts = [], m = new THREE.MeshStandardMaterial({ color, roughness: 1, transparent: true });
    for (let i = 0; i < n; i++) {
      const k = new THREE.Mesh(new THREE.BoxGeometry(0.18 + Math.random() * 0.2, 0.08 + Math.random() * 0.12, 0.18 + Math.random() * 0.15), m);
      k.position.set(x, y + 0.5, z); scene.add(k);
      parts.push({ k, v: new THREE.Vector3((Math.random() - 0.5) * 6, 3 + Math.random() * 4, (Math.random() - 0.5) * 6), r: new THREE.Vector3(Math.random() * 8, Math.random() * 8, 0) });
    }
    const puff = glowSprite(0xffe9b0, 2.4); puff.position.set(x, y + 0.6, z); scene.add(puff);
    let t = 0;
    const g0 = H(x, z);
    const u = world.every((dt) => {
      t += dt;
      for (const p of parts) { p.v.y -= 18 * dt; p.k.position.addScaledVector(p.v, dt); if (p.k.position.y < g0 + 0.05) { p.k.position.y = g0 + 0.05; p.v.multiplyScalar(0.4); p.v.y = Math.abs(p.v.y) * 0.3; } p.k.rotation.x += p.r.x * dt; p.k.rotation.y += p.r.y * dt; }
      m.opacity = Math.max(0, 1 - Math.max(0, t - 0.9) / 0.6); puff.material.opacity = Math.max(0, 1 - t * 2.5); puff.scale.setScalar(2.4 + t * 4);
      if (t > 1.5) { parts.forEach((p) => scene.remove(p.k)); scene.remove(puff); u(); }
    });
  }

  // ── the training yard: practice pots and crates ──
  const potMat = new THREE.MeshStandardMaterial({ color: 0xb8643a, roughness: 0.9 }), crateMat = new THREE.MeshStandardMaterial({ map: plankTexture(), roughness: 0.95 });
  const potGeo = new THREE.LatheGeometry([[0, 0], [0.38, 0.02], [0.52, 0.35], [0.46, 0.75], [0.26, 0.92], [0.28, 1.05], [0.32, 1.1]].map(([a, b]) => new THREE.Vector2(a, b)), 16);
  const breakables = [];
  function addBreakable(x, z, kind = 'pot', { hp = kind === 'crate' ? 3 : 2, prize = null } = {}) {
    if (world.protectedAt(x, z)) return null;
    clearAround(x, z, 1.5);
    const y = flatten(x, z), g = new THREE.Group();
    let solid, color;
    if (kind === 'crate') { const m = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.1), crateMat); m.position.y = 0.55; m.castShadow = Q.shadows; g.add(m); solid = addSolid(x - 0.55, x + 0.55, z - 0.55, z + 0.55, y - 0.5, y + 1.1); color = 0x8f6236; }
    else { const m = new THREE.Mesh(potGeo, potMat); m.castShadow = Q.shadows; g.add(m); solid = addSolid(x - 0.4, x + 0.4, z - 0.4, z + 0.4, y - 0.5, y + 1.05, { climb: true }); color = 0xb8643a; }
    if (prize) { const glint = glowSprite(0xffe08a, 0.9); glint.position.y = kind === 'crate' ? 1.25 : 1.25; g.add(glint); }
    g.position.set(x, y, z); g.rotation.y = Math.random() * 6; scene.add(g);
    const b = { x, z, y, kind, hp, max: hp, group: g, solid, color, prize, shake: 0, broken: false };
    breakables.push(b); return b;
  }
  // hit the practice prop in front of the explorer (within reach); returns { b, broke } or null
  function hitNearest() {
    const me = world.player(), fx = -Math.sin(me.yaw), fz = -Math.cos(me.yaw);
    let best = null;
    for (const b of breakables) {
      if (b.broken) continue;
      const dx = b.x - me.x, dz = b.z - me.z, d = Math.hypot(dx, dz);
      if (d > 2.3 || Math.abs(b.y - me.y) > 2) continue;
      const front = (dx * fx + dz * fz) / (d || 1);
      if (d > 1.1 && front < 0.15) continue;
      if (!best || d < best.d) best = { b, d };
    }
    if (!best) return null;
    const b = best.b; b.hp--; b.shake = 0.3;
    if (b.hp > 0) return { b, broke: false };
    breakIt(b);
    return { b, broke: true };
  }
  function breakIt(b) { if (b.broken && !b.group.parent) return; b.broken = true; scene.remove(b.group); removeSolid(b.solid); shatter(b.x, b.y, b.z, b.color); }
  world.every((dt, t) => { for (const b of breakables) if (b.shake > 0) { b.shake = Math.max(0, b.shake - dt); b.group.rotation.z = Math.sin(t * 60) * 0.12 * (b.shake / 0.3); b.group.scale.setScalar(1 - 0.08 * (b.shake / 0.3)); } });
  function clearYard() { for (const b of breakables) { if (!b.broken) { scene.remove(b.group); removeSolid(b.solid); } } breakables.length = 0; }
  // a fenced practice yard with a sign
  function yard(x, z, n, { seed = 1, prizes = 0 } = {}) {
    clearAround(x, z, 11);
    const g = new THREE.Group(), y = flatten(x, z);
    const post = new THREE.MeshStandardMaterial({ color: 0x6b4226 });
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, px = x + Math.cos(a) * 9, pz = z + Math.sin(a) * 9; if (i === 4) continue; const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.1, 6), post); p.position.set(px, H(px, pz) + 0.55, pz); g.add(p); }
    const sign = label('Training yard · practice pots and crates', { w: 5.2 }); sign.position.set(x, y + 3.3, z - 9.4); g.add(sign);
    scene.add(g);
    let s = seed; const R = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const list = [];
    for (let i = 0; i < n; i++) {
      const a = R() * Math.PI * 2, r = 2 + R() * 6, kind = i % 3 === 2 ? 'crate' : 'pot';
      const b = addBreakable(x + Math.cos(a) * r, z + Math.sin(a) * r, kind, { prize: i < prizes ? i : null });
      if (b) list.push(b);
    }
    return { list, remove() { scene.remove(g); clearYard(); } };
  }

  // ── the puzzle vault: plates on the floor, a stone door that sinks, a chest behind it ──
  function vault(x, z, labels, { facing = 0 } = {}) {
    clearAround(x, z, 13);
    const y = flatten(x, z), g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
    const wallM = new THREE.MeshStandardMaterial({ map: stoneTex, color: 0x9b8a74, roughness: 1 });
    const floorM = new THREE.MeshStandardMaterial({ map: stoneTex, color: 0x6e6152, roughness: 1 });
    const solids = [];
    const W = 13, D = 13, Hh = 4.4, T = 0.6;   // the hall: open at the front (south, +z)
    const wall = (cx, cz, w, d, h = Hh) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallM); m.position.set(cx, h / 2, cz); m.castShadow = Q.shadows; g.add(m); solids.push(addSolid(x + cx - w / 2, x + cx + w / 2, z + cz - d / 2, z + cz + d / 2, y - 1, y + h, { climb: false })); return m; };
    const floor = new THREE.Mesh(new THREE.BoxGeometry(W, 0.12, D + 5), floorM); floor.position.set(0, 0.06, -2.5); g.add(floor);
    solids.push(addSolid(x - W / 2, x + W / 2, z - D / 2 - 5, z + D / 2, y - 1, y + 0.12));
    wall(-W / 2, 0, T, D); wall(W / 2, 0, T, D);
    // the back wall with a doorway into the treasure room
    wall(-W / 4 - 0.9, -D / 2, W / 2 - 1.8, T); wall(W / 4 + 0.9, -D / 2, W / 2 - 1.8, T);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.2, T), wallM); lintel.position.set(0, Hh - 0.6, -D / 2); g.add(lintel);
    // the treasure room behind
    wall(-2.4, -D / 2 - 2.6, T, 5); wall(2.4, -D / 2 - 2.6, T, 5); wall(0, -D / 2 - 5, 5.4, T);
    const door = new THREE.Mesh(new THREE.BoxGeometry(3.6, Hh - 1.2, 0.5), new THREE.MeshStandardMaterial({ map: runeTexture('?'), color: 0xb9a07e }));
    door.position.set(0, (Hh - 1.2) / 2, -D / 2); g.add(door);
    const doorSolid = addSolid(x - 1.8, x + 1.8, z - D / 2 - 0.3, z - D / 2 + 0.3, y - 1, y + Hh, { climb: false });
    // torches on the walls
    for (const [tx, tz] of [[-W / 2 + 0.5, -3], [W / 2 - 0.5, -3], [-W / 2 + 0.5, 3], [W / 2 - 0.5, 3]]) { const f = glowSprite(0xffa040, 2.2); f.position.set(tx, 3, tz); g.add(f); }
    // the chest
    const chest = new THREE.Group(); const wood = new THREE.MeshStandardMaterial({ map: plankTexture() }), gold = new THREE.MeshStandardMaterial({ color: 0xd4a017, metalness: 0.7, roughness: 0.3 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.7, 0.9), wood); base.position.y = 0.35; chest.add(base);
    const lid = new THREE.Group(); const lidM = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 0.9), wood); lidM.position.set(0, 0.15, 0.45); lid.add(lidM); lid.position.set(0, 0.7, -0.45); chest.add(lid);
    const band = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.12, 0.95), gold); band.position.y = 0.6; chest.add(band);
    const shine = glowSprite(0xffd34d, 3); shine.position.y = 1.2; shine.visible = false; chest.add(shine);
    chest.position.set(0, 0.1, -D / 2 - 3.3); g.add(chest);
    solids.push(addSolid(x - 0.7, x + 0.7, z - D / 2 - 3.75, z - D / 2 - 2.85, y - 1, y + 0.8));
    // the plates, in a shuffled ring on the floor; each has its words floating above it
    const order = labels.map((_, i) => i).sort(() => Math.random() - 0.5);
    const plates = order.map((li, k) => {
      const n = labels.length, a = Math.PI * (0.15 + (0.7 * k) / Math.max(1, n - 1)), px = Math.cos(a) * 4.4, pz = 1.2 - Math.sin(a) * 3.6;
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 0.14, 28), [new THREE.MeshStandardMaterial({ color: 0x5d5146 }), new THREE.MeshStandardMaterial({ map: runeTexture(k + 1), emissive: 0x000000 }), new THREE.MeshStandardMaterial({ color: 0x5d5146 })]);
      disc.position.set(px, 0.17, pz); g.add(disc);
      const tag = label(labels[li], { w: 3.4, font: 38 }); tag.position.set(px, 2.3, pz); g.add(tag);
      const beam = glowSprite(0x7fe0ff, 1.6); beam.position.set(px, 0.5, pz); beam.visible = false; g.add(beam);
      return { li, x: x + px, z: z + pz, disc, tag, beam, state: 'off' };
    });
    const sign = label('A game puzzle room', { w: 3.6, font: 40 }); sign.position.set(0, Hh + 0.9, D / 2 - 0.3); g.add(sign);
    function setPlate(p, state) {
      p.state = state;
      const top = p.disc.material[1];
      top.emissive.setHex(state === 'on' ? 0x2aa4d8 : state === 'wrong' ? 0xa83232 : 0x000000); top.emissiveIntensity = state === 'off' ? 0 : 0.9;
      p.beam.visible = state === 'on'; p.beam.material.color.setHex(state === 'wrong' ? 0xff6060 : 0x7fe0ff);
    }
    let doorK = 0, opening = false, lidK = 0, lidOpen = false;
    world.every((dt) => {
      if (opening && doorK < 1) { doorK = Math.min(1, doorK + dt / 2.2); door.position.y = (Hh - 1.2) / 2 - doorK * (Hh - 0.9); if (doorK >= 1) removeSolid(doorSolid); }
      if (lidOpen && lidK < 1) { lidK = Math.min(1, lidK + dt / 0.8); lid.rotation.x = -1.9 * lidK; shine.visible = true; shine.scale.setScalar(3 + Math.sin(lidK * 6) * 0.4); }
    });
    // which plate the explorer is standing on (or null)
    function plateUnder() { const me = world.player(); if (!me.grounded) return null; return plates.find((p) => Math.hypot(p.x - me.x, p.z - me.z) < 1.0 && Math.abs(me.y - y) < 1) ?? null; }
    return {
      plates, setPlate, plateUnder, entrance: { x, z: z + D / 2 + 3 }, chestAt: { x, z: z - D / 2 - 2.2 }, centre: { x, z },
      openDoor() { opening = true; }, openChest() { lidOpen = true; },
      remove() { scene.remove(g); solids.forEach(removeSolid); removeSolid(doorSolid); },
    };
  }

  // ── the build plot: a grid of cells; each cell holds a stack of pieces ──
  const PIECES = {
    block: { name: 'Block', cost: { bricks: 2 }, h: 1.6, stack: true },
    wall: { name: 'Wall', cost: { bricks: 2 }, h: 2.2, stack: true },
    slab: { name: 'Roof', cost: { wood: 1 }, h: 0.3, stack: true },
    stair: { name: 'Stairs', cost: { bricks: 3 }, h: 1.6, stack: true },
    arch: { name: 'Arch', cost: { bricks: 3 }, h: 2.6, stack: true },
    palm: { name: 'Palm', cost: { wood: 1 }, h: 0, stack: false },
    lamp: { name: 'Lamp', cost: { wood: 1 }, h: 0, stack: false },
    pool: { name: 'Pool', cost: { bricks: 4 }, h: 0.5, stack: false },
  };
  function pieceMesh(kind, cell, mats) {
    const g = new THREE.Group(), boxes = [];   // boxes: [x0,x1,z0,z1,y0,y1] in the piece's own frame (before rotation)
    const add = (geo, m, px, py, pz) => { const k = new THREE.Mesh(geo, m); k.position.set(px, py, pz); k.castShadow = Q.shadows; k.receiveShadow = Q.shadows; g.add(k); return k; };
    const c = cell, hc = c / 2;
    if (kind === 'block') { add(new THREE.BoxGeometry(c, 1.6, c), mats.brick, 0, 0.8, 0); boxes.push([-hc, hc, -hc, hc, 0, 1.6]); }
    else if (kind === 'wall') { add(new THREE.BoxGeometry(c, 2.2, 0.35), mats.brick, 0, 1.1, -hc + 0.18); boxes.push([-hc, hc, -hc, -hc + 0.35, 0, 2.2]); }
    else if (kind === 'slab') { add(new THREE.BoxGeometry(c, 0.3, c), mats.wood, 0, 0.15, 0); boxes.push([-hc, hc, -hc, hc, 0, 0.3]); }
    else if (kind === 'stair') { for (let i = 0; i < 3; i++) { const d = c / 3; add(new THREE.BoxGeometry(c, (i + 1) * 0.53, d), mats.brick, 0, ((i + 1) * 0.53) / 2, hc - d / 2 - i * d); boxes.push([-hc, hc, hc - (i + 1) * d, hc - i * d, 0, (i + 1) * 0.53]); } }
    else if (kind === 'arch') { add(new THREE.BoxGeometry(0.35, 2.6, 0.5), mats.brick, -hc + 0.18, 1.3, 0); add(new THREE.BoxGeometry(0.35, 2.6, 0.5), mats.brick, hc - 0.18, 1.3, 0); add(new THREE.BoxGeometry(c, 0.45, 0.5), mats.brick, 0, 2.38, 0); boxes.push([-hc, -hc + 0.35, -0.25, 0.25, 0, 2.6], [hc - 0.35, hc, -0.25, 0.25, 0, 2.6], [-hc, hc, -0.25, 0.25, 2.15, 2.6]); }
    else if (kind === 'palm') { add(new THREE.CylinderGeometry(0.1, 0.16, 3, 7), mats.trunk, 0, 1.5, 0); for (let i = 0; i < 6; i++) { const l = add(new THREE.BoxGeometry(1.4, 0.06, 0.35), mats.leaf, 0, 3, 0); l.rotation.y = (i / 6) * Math.PI * 2; l.rotation.z = -0.35; l.position.x = Math.cos(l.rotation.y) * 0.6; l.position.z = -Math.sin(l.rotation.y) * 0.6; } boxes.push([-0.15, 0.15, -0.15, 0.15, 0, 3]); }
    else if (kind === 'lamp') { add(new THREE.CylinderGeometry(0.06, 0.08, 2.2, 6), mats.trunk, 0, 1.1, 0); add(new THREE.BoxGeometry(0.4, 0.5, 0.4), mats.gold, 0, 2.4, 0); const s = glowSprite(0xffc46b, 2.6); s.position.y = 2.4; g.add(s); boxes.push([-0.1, 0.1, -0.1, 0.1, 0, 2.6]); }
    else if (kind === 'pool') { add(new THREE.CylinderGeometry(hc, hc, 0.5, 20), mats.brick, 0, 0.25, 0); const w = add(new THREE.CylinderGeometry(hc - 0.15, hc - 0.15, 0.06, 20), mats.water, 0, 0.48, 0); void w; boxes.push([-hc, hc, -hc, hc, 0, 0.5]); }
    return { g, boxes };
  }
  function plot(x, z, { n = 9, cell = 1.6, saved = [], budget = { bricks: 30, wood: 12 }, onChange } = {}) {
    clearAround(x, z, (n * cell) / 2 + 3);
    const y = flatten(x, z), size = n * cell, half = size / 2, g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
    const gc = document.createElement('canvas'); gc.width = gc.height = 256; const gg = gc.getContext('2d');
    gg.fillStyle = '#d8c09a'; gg.fillRect(0, 0, 256, 256); gg.strokeStyle = 'rgba(90,62,40,.45)'; gg.lineWidth = 3; for (let i = 0; i <= n; i++) { const p = (i / n) * 256; gg.beginPath(); gg.moveTo(p, 0); gg.lineTo(p, 256); gg.stroke(); gg.beginPath(); gg.moveTo(0, p); gg.lineTo(256, p); gg.stroke(); }
    const gt = new THREE.CanvasTexture(gc); gt.colorSpace = THREE.SRGBColorSpace;
    const base = new THREE.Mesh(new THREE.BoxGeometry(size, 0.2, size), [null, null, new THREE.MeshStandardMaterial({ map: gt }), null, null, null].map((m) => m ?? new THREE.MeshStandardMaterial({ color: 0x9a8a72 })));
    base.position.y = 0.1; g.add(base);
    const baseSolid = addSolid(x - half, x + half, z - half, z + half, y - 1, y + 0.2);
    const sign = label('Your build plot · a design of your own', { w: 5 }); sign.position.set(0, 3.4, -half - 0.6); g.add(sign);
    const mats = { brick: new THREE.MeshStandardMaterial({ map: stoneTex, color: 0xd9b98a, roughness: 1 }), wood: new THREE.MeshStandardMaterial({ map: plankTexture(), roughness: 0.9 }), trunk: new THREE.MeshStandardMaterial({ color: 0x6b4a2a }), leaf: new THREE.MeshStandardMaterial({ color: 0x2f7a3a, side: THREE.DoubleSide }), gold: new THREE.MeshStandardMaterial({ color: 0xd4a017, emissive: 0x6b4a10, emissiveIntensity: 0.6 }), water: new THREE.MeshStandardMaterial({ color: 0x4e9ec8, roughness: 0.1, metalness: 0.3 }) };
    const stacks = new Map(), placed = [];   // placed: { kind, i, j, rot, mesh, solids, y0 }
    const have = { ...budget };
    const top0 = y + 0.2;
    const cellAt = (wx, wz) => { const i = Math.floor((wx - (x - half)) / cell), j = Math.floor((wz - (z - half)) / cell); return i >= 0 && j >= 0 && i < n && j < n ? [i, j] : null; };
    const cellCentre = (i, j) => [x - half + (i + 0.5) * cell, z - half + (j + 0.5) * cell];
    const afford = (kind) => Object.entries(PIECES[kind].cost).every(([k, v]) => (have[k] ?? 0) >= v);
    function put(kind, i, j, rot, pay = true) {
      const P0 = PIECES[kind], key = `${i},${j}`, st = stacks.get(key) ?? { h: 0, deco: false };
      if (!P0.stack && (st.deco || st.h > 0 && kind !== 'lamp')) return false;
      if (st.deco) return false;
      if (st.h + P0.h > 9) return false;
      if (pay) { if (!afford(kind)) return false; for (const [k, v] of Object.entries(P0.cost)) have[k] -= v; }
      const [cx, cz] = cellCentre(i, j), y0 = top0 + st.h;
      const { g: m, boxes } = pieceMesh(kind, cell, mats);
      m.position.set(cx - x, y0 - y, cz - z); m.rotation.y = rot * Math.PI / 2; g.add(m);
      const solids = boxes.map(([a0, a1, b0, b1, c0, c1]) => {
        // rotate the box by quarter turns
        let [p0, p1, q0, q1] = [a0, a1, b0, b1];
        for (let r = 0; r < rot; r++) [p0, p1, q0, q1] = [q0, q1, -p1, -p0];
        return addSolid(cx + p0, cx + p1, cz + q0, cz + q1, y0 + c0, y0 + c1);
      });
      if (P0.stack) st.h += P0.h; else st.deco = true;
      stacks.set(key, st);
      placed.push({ kind, i, j, rot, mesh: m, solids, h: P0.stack ? P0.h : 0, deco: !P0.stack });
      return true;
    }
    function takeOff(p, refund = true) {
      g.remove(p.mesh); p.solids.forEach(removeSolid);
      const st = stacks.get(`${p.i},${p.j}`); if (p.deco) st.deco = false; else st.h -= p.h;
      if (refund) for (const [k, v] of Object.entries(PIECES[p.kind].cost)) have[k] += v;
      placed.splice(placed.indexOf(p), 1);
    }
    for (const [kind, i, j, rot] of saved) if (PIECES[kind]) put(kind, i, j, rot, false);
    // the ghost: where the next piece goes, the cell in front of the explorer
    let kind = 'block', rot = 0, ghost = null, ghostKind = null, active = false, target = null;
    const ghostMat = new THREE.MeshBasicMaterial({ color: 0x7fe0a0, transparent: true, opacity: 0.45, depthWrite: false });
    function frontCell() {
      const me = world.player(), fx = -Math.sin(me.yaw), fz = -Math.cos(me.yaw);
      for (const d of [1.4, 2.2, 0.6]) { const c = cellAt(me.x + fx * d, me.z + fz * d); if (c) return c; }
      return null;
    }
    world.every(() => {
      if (!active) { if (ghost) ghost.visible = false; return; }
      target = frontCell();
      if (ghostKind !== kind) { if (ghost) g.remove(ghost); ghost = pieceMesh(kind, cell, mats).g; ghost.traverse((o) => { if (o.isMesh) o.material = ghostMat; }); g.add(ghost); ghostKind = kind; }
      if (!target) { ghost.visible = false; return; }
      const [i, j] = target, [cx, cz] = cellCentre(i, j), st = stacks.get(`${i},${j}`) ?? { h: 0 };
      ghost.visible = true; ghost.position.set(cx - x, top0 + st.h - y + 0.02, cz - z); ghost.rotation.y = rot * Math.PI / 2;
      ghostMat.color.setHex(afford(kind) ? 0x7fe0a0 : 0xff7070);
    });
    const save = () => onChange?.(placed.map((p) => [p.kind, p.i, p.j, p.rot]), { ...have });
    return {
      PIECES, have, get count() { return placed.length; }, centre: { x, z }, half,
      setActive(v) { active = v; }, setKind(k) { if (PIECES[k]) kind = k; }, get kind() { return kind; },
      rotate() { rot = (rot + 1) % 4; },
      place() { if (!target) return 'no-cell'; if (!afford(kind)) return 'no-materials'; const ok = put(kind, target[0], target[1], rot); if (ok) save(); return ok ? 'ok' : 'blocked'; },
      remove() { if (!target) return false; const here = placed.filter((p) => p.i === target[0] && p.j === target[1]); const p = here.at(-1); if (!p) return false; takeOff(p); save(); return true; },
      undo() { const p = placed.at(-1); if (!p) return false; takeOff(p); save(); return true; },
      add(mat, k) { have[mat] = (have[mat] ?? 0) + k; },
      inside() { const me = world.player(); return Math.abs(me.x - x) < half + 2 && Math.abs(me.z - z) < half + 2; },
      remove_all() { scene.remove(g); placed.forEach((p) => p.solids.forEach(removeSolid)); removeSolid(baseSolid); },
    };
  }

  // ── the learning model: a wooden frame and courses of blocks that rise as the student carries blocks to it ──
  function model(x, z, { courses = 6, text = 'A wooden learning model, not the House' } = {}) {
    clearAround(x, z, 9);
    const y = flatten(x, z), g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
    const wood = new THREE.MeshStandardMaterial({ map: plankTexture(), roughness: 0.9 });
    const block = new THREE.MeshStandardMaterial({ map: stoneTex, color: 0xc9b089, roughness: 1 });
    const S = 2.4, ch = 0.36;   // a small square model, 2.4 m across, each course 36 cm high
    for (const [px, pz] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.14, courses * ch + 0.8, 0.14), wood); p.position.set(px, (courses * ch + 0.8) / 2, pz); g.add(p); }
    const sign = label(text, { w: 4.6, font: 38 }); sign.position.set(0, courses * ch + 1.8, 0); g.add(sign);
    const solid = addSolid(x - S / 2, x + S / 2, z - S / 2, z + S / 2, y - 1, y + 0.01, { climb: false });
    const layers = [];
    let built = 0;
    const pile = new THREE.Group(); for (let i = 0; i < 9; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.4), block); b.position.set((i % 3) * 0.55 - 0.55, 0.2 + Math.floor(i / 3) * 0.41, ((i * 7) % 3) * 0.1); b.rotation.y = (i * 0.37) % 0.4; pile.add(b); }
    const pileAt = { x: x + 7, z: z + 2 }; pile.position.set(7, H(pileAt.x, pileAt.z) - y, 2); g.add(pile);
    const pileSign = label('Blocks', { w: 2, font: 48 }); pileSign.position.set(7, 2.2, 2); g.add(pileSign);
    function addCourse() {
      if (built >= courses) return false;
      const m = new THREE.Mesh(new THREE.BoxGeometry(S, ch, S), block); m.position.y = built * ch + ch / 2; m.scale.set(1, 0.01, 1); g.add(m); layers.push(m);
      built++; solid.y1 = y + built * ch;
      let k = 0; const u = world.every((dt) => { k = Math.min(1, k + dt / 0.4); m.scale.y = Math.max(0.01, k); if (k >= 1) u(); });
      return true;
    }
    let roofed = false;
    function roof() { if (roofed) return; roofed = true; const r = new THREE.Mesh(new THREE.BoxGeometry(S + 0.2, 0.14, S + 0.2), wood); r.position.y = built * ch + 0.07; g.add(r); }
    return { pileAt, at: { x, z }, addCourse, roof, get built() { return built; }, courses, remove() { scene.remove(g); removeSolid(solid); } };
  }

  // ── a mountain with a leaning peak and an empty cave in the bend (Jabal al-Nour, as the book describes Hiraʾ) ──
  // a respectful, empty reconstruction: the cave can be seen but not entered, and nobody is ever shown in or near it
  function mountain(x, z, { height = 58, radius = 26, facing = 0, sign = 'Jabal al-Nour (a model)', cave = true } = {}) {
    clearAround(x, z, radius + 8);
    const y = flatten(x, z), g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = facing; scene.add(g);
    const rock = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true, vertexColors: true });
    const rock2 = new THREE.MeshStandardMaterial({ color: 0xa88566, roughness: 1, flatShading: true });
    // the body: a faceted cone, its sides broken up into ridges and gullies, its peak leaning forward over the cave
    const geo = new THREE.ConeGeometry(radius, height, 11, 8);
    const pos = geo.attributes.position, cols = [];
    const n3 = (a, b, c) => Math.sin(a * 1.7 + b * 2.3) * 0.5 + Math.sin(b * 3.1 - c * 1.3) * 0.3 + Math.sin(c * 2.7 + a * 0.9) * 0.2;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i), vy = pos.getY(i), vz = pos.getZ(i), t = (vy + height / 2) / height;   // 0 at the foot, 1 at the top
      // the front foot, where the cave is, stays smooth so the opening sits on the slope
      const front = vz > radius * 0.3 && t < 0.3 ? Math.max(0, 1 - Math.abs(vx) / (radius * 0.6)) : 0;
      const bump = 1 + n3(vx * 0.3, vy * 0.2, vz * 0.3) * 0.32 * (1 - t * 0.6) * (1 - front);
      const lean = t * t * radius * 0.42;                                                              // the peak bends towards the front (+z)
      pos.setXYZ(i, vx * bump, vy + n3(vx, vz, vy) * 1.2 * (1 - t) * (1 - front), vz * bump + lean);
      const shade = 0.82 + n3(vx * 2, vy, vz * 2) * 0.12 + t * 0.1;
      cols.push(0.6 * shade, 0.45 * shade, 0.33 * shade);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); geo.computeVertexNormals();
    const body0 = new THREE.Mesh(geo, rock); body0.position.y = height / 2 - 1; body0.castShadow = Q.shadows; body0.receiveShadow = Q.shadows; g.add(body0);
    // a few boulders round the foot
    for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2 + 0.3, b = new THREE.Mesh(new THREE.DodecahedronGeometry(2 + (i % 3), 0), rock2); b.position.set(Math.cos(a) * radius * 0.95, 1, Math.sin(a) * radius * 0.95); b.rotation.set(i, i * 2, 0); if (Math.abs(Math.cos(a)) > 0.35 || Math.sin(a) < 0) g.add(b); }
    // the cave: a dark opening in the front slope, with a rocky ledge in front of it
    const cz = radius * (1 - 3.4 / height);   // the slope at the height of the cave
    const ledge = new THREE.Mesh(new THREE.BoxGeometry(10, 1.2, 7), rock2); ledge.position.set(0, 0.6, cz + 3); if (cave) g.add(ledge);
    const frame = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.55, 6, 12, Math.PI), rock2); frame.position.set(0, 2.2, cz + 0.6); if (cave) g.add(frame);
    const mouthM = new THREE.MeshBasicMaterial({ color: 0x2a1d14 }), mouth = new THREE.Mesh(new THREE.BoxGeometry(3, 3.4, 3.2), mouthM);
    mouth.position.set(0, 2.4, cz - 0.9); if (cave) g.add(mouth);
    const radius0 = radius; radius = cz / 0.92;   // the rest of the code places things relative to the cave front
    void radius0;
    const glowIn = glowSprite(0xffd9a0, 6); glowIn.position.set(0, 2.4, radius * 0.92 + 0.9); glowIn.material.opacity = 0.0; g.add(glowIn);
    const tag = label(sign, { w: 5.2, font: 38 }); tag.position.set(0, 7.2, radius * 0.92 + 3); g.add(tag);
    // solid: nobody walks into the mountain or the cave; the ledge in front can be stood on
    const c = Math.cos(facing), s = Math.sin(facing);
    const toW = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
    const [bx, bz] = toW(0, 0), [lx, lz] = toW(0, radius * 0.92 + 2);
    const body = addSolid(bx - radius * 0.85, bx + radius * 0.85, bz - radius * 0.85, bz + radius * 0.85, y - 1, y + height, { climb: false });
    const shelf = cave ? addSolid(lx - 4.5, lx + 4.5, lz - 3, lz + 3, y - 1, y + 1.2) : null;
    let glowK = 0, glowTo = 0;
    world.every((dt) => { glowK += (glowTo - glowK) * Math.min(1, dt * 0.8); glowIn.material.opacity = glowK; mouthM.color.setRGB(0.1 + glowK * 0.35, 0.07 + glowK * 0.22, 0.05 + glowK * 0.1); });
    const [fx, fz] = toW(0, radius * 0.92 + 7);
    return { front: { x: fx, z: fz }, cave: { x: lx, z: lz, y: y + 2.6 }, top: { x: bx, y: y + height, z: bz }, glow(v) { glowTo = v ? 0.85 : 0; }, remove() { scene.remove(g); removeSolid(body); if (shelf) removeSolid(shelf); } };
  }

  // ── a garden wall with a grapevine trellis giving shade (the walled garden at al-Taʾif, a simple model) ──
  function vine(x, z, { sign = 'A walled garden (a model)' } = {}) {
    clearAround(x, z, 12);
    const y = flatten(x, z), g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
    const wallM = new THREE.MeshStandardMaterial({ map: stoneTex, color: 0xc9a77e, roughness: 1 }), wood = new THREE.MeshStandardMaterial({ color: 0x6b4a2a, roughness: 1 });
    const leaf = new THREE.MeshStandardMaterial({ color: 0x3f8a3a, roughness: 0.9, side: THREE.DoubleSide }), grape = new THREE.MeshStandardMaterial({ color: 0x5b2a6e, roughness: 0.5 });
    const solids = [];
    const wall = (cx, cz, w, d) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 2, d), wallM); m.position.set(cx, 1, cz); g.add(m); solids.push(addSolid(x + cx - w / 2, x + cx + w / 2, z + cz - d / 2, z + cz + d / 2, y - 1, y + 2, { climb: false })); };
    wall(0, -8, 18, 0.6); wall(-9, 0, 0.6, 16); wall(9, 0, 0.6, 16); wall(-5.5, 8, 7, 0.6); wall(5.5, 8, 7, 0.6);   // a gap in the front wall to walk in
    for (const [px, pz] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 2.6, 6), wood); p.position.set(px, 1.3, pz); g.add(p); }
    const roof = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.25, 7.4), leaf); roof.position.set(0, 2.7, 0); g.add(roof);
    for (let i = 0; i < 26; i++) { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.7), leaf); l.position.set(-3.4 + (i % 6) * 1.35, 2.45 - (i % 3) * 0.15, -3.4 + Math.floor(i / 6) * 1.6); l.rotation.set(Math.PI / 2 + (i % 4) * 0.2, 0, i); g.add(l); }
    for (let i = 0; i < 8; i++) { const bunch = new THREE.Group(); for (let k = 0; k < 7; k++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 5), grape); b.position.set((k % 3) * 0.12 - 0.12, -Math.floor(k / 3) * 0.13, (k % 2) * 0.08); bunch.add(b); } bunch.position.set(-2.6 + (i % 4) * 1.7, 2.35, -2 + Math.floor(i / 4) * 3.4); g.add(bunch); }
    const tag = label(sign, { w: 4.4, font: 40 }); tag.position.set(0, 4, 8.4); g.add(tag);
    return { at: { x, z }, door: { x, z: z + 11 }, remove() { scene.remove(g); solids.forEach(removeSolid); } };
  }

  // ── palm groves: date palms scattered over an area, for an oasis ──
  function palms(cx, cz, n = 40, r = 60, seed = 5) {
    let s = seed; const R = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const trunkM = new THREE.MeshStandardMaterial({ color: 0x7a5a3a, roughness: 1 }), leafM = new THREE.MeshStandardMaterial({ color: 0x3f8a3a, roughness: 0.9, side: THREE.DoubleSide });
    const trunkG = new THREE.CylinderGeometry(0.16, 0.26, 1, 7), leafG = new THREE.PlaneGeometry(2.6, 0.7);
    const g = new THREE.Group(), solids = [];
    for (let i = 0; i < n; i++) {
      const a = R() * Math.PI * 2, d = Math.sqrt(R()) * r, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
      if (world.protectedAt(x, z, 4) || Math.hypot(x - world.ARCHIVE.x, z - world.ARCHIVE.z) < 10) continue;
      const h = 5 + R() * 4, y = H(x, z), p = new THREE.Group();
      const t = new THREE.Mesh(trunkG, trunkM); t.scale.y = h; t.position.y = h / 2; t.rotation.z = (R() - 0.5) * 0.12; p.add(t);
      for (let k = 0; k < 8; k++) { const l = new THREE.Mesh(leafG, leafM); const ang = (k / 8) * Math.PI * 2; l.position.set(Math.cos(ang) * 1.1, h - 0.1, Math.sin(ang) * 1.1); l.rotation.set(-Math.PI / 2 + 0.5, -ang, 0, 'YXZ'); p.add(l); }
      p.position.set(x, y, z); g.add(p);
      solids.push(addSolid(x - 0.25, x + 0.25, z - 0.25, z + 0.25, y - 1, y + h, { climb: false }));
    }
    scene.add(g);
    return { remove() { scene.remove(g); solids.forEach(removeSolid); } };
  }

  // ── a simple model of an early mosque courtyard: mud-brick walls, palm-trunk pillars and a roof of palm branches ──
  // it is protected: nothing here can be built on, broken or changed
  function courtyard(x, z, { sign = 'A simple model of an early mosque' } = {}) {
    clearAround(x, z, 16);
    const y = flatten(x, z), g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
    const brick = new THREE.MeshStandardMaterial({ map: stoneTex, color: 0xc8a57a, roughness: 1 }), trunk = new THREE.MeshStandardMaterial({ color: 0x7a5a3a, roughness: 1 });
    const frond = new THREE.MeshStandardMaterial({ color: 0x8a9a4a, roughness: 1, side: THREE.DoubleSide });
    const solids = [];
    const W = 22, D = 18, Hh = 2.2;
    const wall = (cx, cz, w, d) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, Hh, d), brick); m.position.set(cx, Hh / 2, cz); g.add(m); solids.push(addSolid(x + cx - w / 2, x + cx + w / 2, z + cz - d / 2, z + cz + d / 2, y - 1, y + Hh, { climb: false })); };
    wall(0, -D / 2, W, 0.6); wall(-W / 2, 0, 0.6, D); wall(W / 2, 0, 0.6, D); wall(-W / 4 - 1.5, D / 2, W / 2 - 3, 0.6); wall(W / 4 + 1.5, D / 2, W / 2 - 3, 0.6);
    // the covered part along the back wall: palm-trunk pillars holding a roof of palm branches
    for (let i = -4; i <= 4; i++) for (const cz of [-D / 2 + 1.6, -D / 2 + 4.6]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 3.2, 7), trunk); p.position.set(i * 2.4, 1.6, cz); g.add(p);
      solids.push(addSolid(x + i * 2.4 - 0.22, x + i * 2.4 + 0.22, z + cz - 0.22, z + cz + 0.22, y - 1, y + 3.2, { climb: false }));
    }
    const roof = new THREE.Mesh(new THREE.BoxGeometry(W - 1, 0.18, 6.4), frond); roof.position.set(0, 3.3, -D / 2 + 3.1); g.add(roof);
    for (let i = 0; i < 18; i++) { const f = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.5), frond); f.position.set(-W / 2 + 1.5 + i * 1.15, 3.42, -D / 2 + 3.1); f.rotation.set(-Math.PI / 2, 0, 0.4 + (i % 3) * 0.3); g.add(f); }
    const tag = label(sign, { w: 5.2, font: 38 }); tag.position.set(0, 4.6, D / 2 + 0.5); g.add(tag);
    return { at: { x, z }, gate: { x, z: z + D / 2 + 4 }, inside: { x, z: z + 2 }, remove() { scene.remove(g); solids.forEach(removeSolid); } };
  }

  // a glowing seed to pick up (Guardians of Light, the Roots of Revision)
  function seed() {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 1), new THREE.MeshStandardMaterial({ color: 0xb8e07a, emissive: 0x6fae2a, emissiveIntensity: 0.6, roughness: 0.4 })));
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap(), color: 0xc8f07a, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })); halo.scale.setScalar(2.6); g.add(halo);
    return g;
  }
  // a bridge plank to pick up (Guardians of Light): a wooden board with a soft glow so it can be seen in the grass
  function plank() {
    const g = new THREE.Group();
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.18, 0.55), new THREE.MeshStandardMaterial({ map: plankTexture(), roughness: 0.9 })); b.rotation.z = 0.25; g.add(b);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap(), color: 0xffd27a, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })); halo.scale.setScalar(3); g.add(halo);
    return g;
  }
  return { label, yard, hitNearest, breakIt, vault, plot, model, mountain, vine, palms, courtyard, PIECES, shatter, plank, seed };
}
