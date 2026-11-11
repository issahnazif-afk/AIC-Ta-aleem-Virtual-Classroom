// The Seerah Quest runner: plays an episode's steps in the 3D world, with the narration, missions and
// knowledge challenge. History is always shown with its source (Ibn Kathir, al-Bidaya wa'l-Nihaya).
// The student plays their own explorer in third person: running, jumping and climbing, collecting lights
// and knowledge scrolls, and lighting the lantern at the top of each climbing challenge.
import SRC from '../../data/seerah/sources.json';
import { createWorld } from './world.mjs';
import { makeProps } from './props.mjs';
import { makeAvatar } from './avatar.mjs';
import { EPISODES, scrollIds, stepIds } from './episodes.mjs';
import { STAGES, MODES, TEXT, sfx as play, soundOn, setSound, showBadge, iconUrl, defaultAvatar } from './game.mjs';
import { audioUrl } from '../client.mjs';
import { narrate, hush as stopNarration } from '../narration.mjs';

const SOURCES = Object.fromEntries(SRC.passages.map((p) => [p.id, p]));
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const shuffle = (xs) => { const a = [...xs]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const TEST = typeof location !== 'undefined' && /[?&]test=1\b/.test(location.search);
export const cite = (p) => `al-Bidaya wa'l-Nihaya ${p.vol}/${p.page}`;
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
// ﷺ in its own span, so it can be given a font that has it
const withSawText = (node, text) => String(text).split('ﷺ').forEach((part, i) => { if (i) node.append(el('span', 'saw', 'ﷺ')); node.append(part); });

export { scrollIds };
export const lanternCount = (ep) => ep.steps.filter((s) => s.do === 'parkour').length;

// the narrator: subtitles always; read aloud by the recorded narrator voice if the student keeps narration on
let narrator = true;
function speakEn(text) { if (narrator) narrate(text, { voice: 'seerah' }); }
const hush = () => stopNarration();

export function playEpisode(root, { n, quality = 'medium', reciter, saved = {}, shared = {}, mode = 'explorer', gentle = false, avatar = null, archive = [], onStep, onSave, onBadge, onDone, onExit }) {
  const ep = EPISODES.find((e) => e.n === n);
  const M = MODES[mode] ?? MODES.explorer;
  const courseMode = gentle ? 'gentle' : mode;
  saved.scrolls ??= []; saved.lanterns ??= [];
  const allScrolls = scrollIds(ep), allLanterns = lanternCount(ep);
  root.replaceChildren();
  root.className = 'sq-play';
  const canvas = el('canvas', 'sq-canvas');
  // ── the HUD ──
  const top = el('div', 'sq-top');
  const title = el('div', 'sq-title'); const stageEl = el('span', 'sq-stage-l');
  title.append(el('b', null, `Episode ${ep.n} · ${ep.title}`), stageEl);
  const counters = el('div', 'sq-counters');
  const cLight = el('span', 'sq-c'), cScroll = el('span', 'sq-c'), cLantern = el('span', 'sq-c');
  const ico = (src, alt) => { const i = el('img'); i.src = src; i.alt = alt; i.width = 22; i.height = 22; return i; };
  const lightIco = el('i', 'sq-light-ico'); lightIco.setAttribute('aria-hidden', 'true');
  const lightN = el('b'), scrollN = el('b'), lanternN = el('b');
  cLight.append(lightIco, lightN, el('span', 'sq-sr', ' lights')); cLight.title = 'Lights';
  cScroll.append(ico(iconUrl('scroll'), 'Scrolls'), scrollN); cScroll.title = 'Knowledge scrolls';
  cLantern.append(ico(iconUrl('lantern'), 'Lanterns'), lanternN); cLantern.title = 'Lanterns lit';
  // building materials (from the training yard), shown once the student has any
  const cMats = el('span', 'sq-c sq-mats'); cMats.title = 'Building materials'; cMats.hidden = true;
  counters.append(cLight, cScroll, cLantern, cMats);
  const tools = el('div', 'sq-tools');
  const tool = (label, short) => { const b = el('button', 'sq-tool'); b.type = 'button'; b.append(el('span', 'sq-tool-l', label)); if (short) b.dataset.short = short; return b; };
  const archBtn = tool('Archive'), sndBtn = tool(`Sound: ${soundOn() ? 'on' : 'off'}`), narr = tool('Narration: on'), exit = tool('Leave');
  sndBtn.addEventListener('click', () => { setSound(!soundOn()); sndBtn.firstChild.textContent = `Sound: ${soundOn() ? 'on' : 'off'}`; sndBtn.blur(); });
  narr.addEventListener('click', () => { narrator = !narrator; narr.firstChild.textContent = `Narration: ${narrator ? 'on' : 'off'}`; if (!narrator) hush(); narr.blur(); });
  tools.append(archBtn, sndBtn, narr, exit);
  top.append(title, counters, tools);
  const tracker = el('div', 'sq-tracker'); tracker.hidden = true;
  const trH = el('p', 'sq-tr-h', 'Quest'), trO = el('p', 'sq-tr-o'), trP = el('p', 'sq-tr-p'), trT = el('p', 'sq-tr-t'), trBar = el('div', 'sq-tr-bar'), trFill = el('i');
  trBar.append(trFill); trT.hidden = true;
  const skip = el('button', 'sq-skip', 'Skip this climb'); skip.type = 'button'; skip.hidden = true;
  tracker.append(trH, trO, trP, trBar, trT, skip);
  const mapC = el('canvas', 'sq-minimap'); mapC.width = mapC.height = 150; mapC.setAttribute('aria-label', 'Map: you are the arrow in the middle, north is up');
  const near = el('button', 'sq-near'); near.type = 'button'; near.hidden = true;
  const toast = el('div', 'sq-toast'); toast.setAttribute('role', 'status');
  const banner = el('div', 'sq-banner'); banner.hidden = true;
  const panel = el('div', 'sq-panel'); panel.hidden = true;
  const touch = el('div', 'sq-touch');
  const stick = el('div', 'sq-stick'), knob = el('i', 'sq-knob'); stick.append(knob); stick.setAttribute('aria-label', 'Move');
  const btns = el('div', 'sq-btns');
  const jumpB = el('button', 'sq-jump', 'Jump'); jumpB.type = 'button';
  const useB = el('button', 'sq-use', 'Look'); useB.type = 'button'; useB.disabled = true;
  const smashB = el('button', 'sq-smash', 'Smash'); smashB.type = 'button'; smashB.hidden = true;
  btns.append(smashB, useB, jumpB); touch.append(stick, btns);
  // the build bar (only while building)
  const buildBar = el('div', 'sq-buildbar'); buildBar.hidden = true;
  const loading = el('div', 'sq-loading', 'Preparing the valley of Makkah…');
  root.append(canvas, top, tracker, mapC, near, toast, banner, buildBar, panel, touch, loading);

  let world, props, stopped = false;
  try { world = createWorld(canvas, { quality }); props = makeProps(world); }
  catch (err) { loading.textContent = 'This computer could not start the 3D view (WebGL). Try another browser, or ask your teacher.'; return { stop() {} }; }
  smashB.addEventListener('pointerdown', (e) => { e.preventDefault(); world.strike(); });
  // building materials are kept with the student's progress, shared by every episode
  const mats = () => (shared.build ??= { pieces: [], have: { bricks: 24, wood: 10 } }).have;
  const drawMats = () => { const h = mats(); cMats.hidden = false; cMats.textContent = `Bricks ${h.bricks ?? 0} · Wood ${h.wood ?? 0}`; };
  if (shared.build) drawMats();
  world.setAvatar(makeAvatar(avatar ?? defaultAvatar(''), { shadows: quality === 'high' }));
  world.setGlow(M.glow);
  world.place(0, 40, 0, 0);

  // ── counters ──
  let lights = 0;
  const draw = () => { lightN.textContent = String(lights); scrollN.textContent = `${saved.scrolls.length}/${allScrolls.length}`; lanternN.textContent = `${saved.lanterns.length}/${allLanterns}`; };
  draw();
  world.onLight = () => { lights++; saved.lightsBest = Math.max(saved.lightsBest ?? 0, lights); play('light'); draw(); onSave?.({ light: 1 }); };
  world.onJump = () => play('jump');
  world.onLand = () => play('land');
  let calmSaid = 0;
  world.onCalm = (inCalm) => { if (inCalm && Date.now() - calmSaid > 20000) { calmSaid = Date.now(); say(TEXT.calm, 4200); } };
  world.onCalmJump = () => say(TEXT.calm, 3000);
  function say(t, ms = 2400) { toast.textContent = t; toast.classList.add('on'); clearTimeout(say.t); say.t = setTimeout(() => toast.classList.remove('on'), ms); }
  function award(id) { if (onBadge?.(id)) showBadge(root, id, play); }
  function addArchive(id) { if (id && !archive.includes(id)) { archive.push(id); onSave?.({}); } }

  // ── touch controls: a stick to move (push it all the way to run), Jump, and Look for the markers ──
  let stickId = null;
  const stickMove = (e) => {
    const r = stick.getBoundingClientRect(), R = r.width / 2;
    let dx = (e.clientX - r.left - R) / R, dy = (e.clientY - r.top - R) / R; const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; }
    knob.style.transform = `translate(${dx * R * 0.55}px, ${dy * R * 0.55}px)`;
    world.setPad(-dy, dx, l > 0.92);
  };
  stick.addEventListener('pointerdown', (e) => { stickId = e.pointerId; try { stick.setPointerCapture(e.pointerId); } catch {} stickMove(e); e.preventDefault(); });
  stick.addEventListener('pointermove', (e) => { if (e.pointerId === stickId) stickMove(e); });
  const stickEnd = (e) => { if (e.pointerId !== stickId) return; stickId = null; knob.style.transform = ''; world.setPad(0, 0); };
  stick.addEventListener('pointerup', stickEnd); stick.addEventListener('pointercancel', stickEnd);
  jumpB.addEventListener('pointerdown', (e) => { e.preventDefault(); world.jump(); });
  useB.addEventListener('click', () => near.click());

  world.start();
  if (TEST) {   // test hooks: "tap" a hotspot by id, read the explorer, move them, press keys
    const spots = {}, add = world.addHotspot;
    world.addHotspot = (o) => (spots[o.id] = add(o));
    window.__sq = {
      hit: (id) => world.onHotspot?.(spots[id] ?? { id }),
      me: () => world.player(), tp: (x, z, y) => world.teleport(x, z, y), world,
      course: () => { const c = world.course; return c && { active: c.active, falls: c.falls, last: c.cps.indexOf(c.last), cps: c.cps.map((p) => [p.x, p.y, p.z]), plats: c.plats.map((p) => [p.x, p.y, p.z, p.s]), pit: c.pit }; },
      fps: () => world.fps(), lights: () => lights, saved: () => saved,
    };
  }
  setTimeout(() => loading.remove(), 400);
  exit.addEventListener('click', () => { stop(); onExit?.(); });

  // ── the mini-map: north up, the explorer in the middle; golden markers for the Explorer, plain dots for the Master Explorer ──
  const g2 = mapC.getContext('2d');
  function drawMap(t) {
    const W = mapC.width, C = W / 2, S = C / 60, me = world.player(), d = world.mapData();
    const at = (x, z) => [C + (x - me.x) * S, C + (z - me.z) * S];
    g2.clearRect(0, 0, W, W);
    g2.save(); g2.beginPath(); g2.arc(C, C, C - 3, 0, Math.PI * 2); g2.clip();
    g2.fillStyle = '#E8D6B0'; g2.fillRect(0, 0, W, W);
    const rect = (x0, z0, x1, z1, col) => { const [a, b] = at(x0, z0), [c, e] = at(x1, z1); g2.fillStyle = col; g2.fillRect(a, b, c - a, e - b); };
    if (d.course) { const p = d.course.pit; rect(p.x0, p.z0, p.x1, p.z1, 'rgba(150,110,70,.35)'); for (const q of d.course.plats) rect(q.x - q.s / 2, q.z - q.s / 2, q.x + q.s / 2, q.z + q.s / 2, '#C9B08A'); }
    rect(-5, -6, 5, 6, '#2B2B2B');
    rect(world.ARCHIVE.x - 6, world.ARCHIVE.z - 6.6, world.ARCHIVE.x + 5, world.ARCHIVE.z + 6.6, '#8A6A45');
    const marks = [...d.hotspots.map((h) => [h.x, h.z]), ...d.pickups.map((p) => [p.x, p.z])];
    if (d.course?.active) marks.push([d.course.goal.x, d.course.goal.z]);
    for (const [x, z] of marks) {
      let [mx, mz] = at(x, z); const dx = mx - C, dz = mz - C, l = Math.hypot(dx, dz), edge = C - 12;
      if (l > edge) { if (!M.glow) continue; mx = C + (dx / l) * edge; mz = C + (dz / l) * edge; }
      if (M.glow) {
        const k = 0.5 + 0.5 * Math.sin(t * 4);
        const gr = g2.createRadialGradient(mx, mz, 0, mx, mz, 13); gr.addColorStop(0, `rgba(255,214,90,${0.75 + 0.25 * k})`); gr.addColorStop(1, 'rgba(255,214,90,0)');
        g2.fillStyle = gr; g2.beginPath(); g2.arc(mx, mz, 13, 0, Math.PI * 2); g2.fill();
        g2.fillStyle = '#C98A00'; g2.beginPath(); g2.arc(mx, mz, 4.5, 0, Math.PI * 2); g2.fill();
      } else { g2.fillStyle = '#fff'; g2.strokeStyle = '#5A4632'; g2.lineWidth = 1.5; g2.beginPath(); g2.arc(mx, mz, 3.5, 0, Math.PI * 2); g2.fill(); g2.stroke(); }
    }
    g2.restore();
    // the explorer: an arrow pointing the way they face
    g2.save(); g2.translate(C, C); g2.rotate(-me.yaw + Math.PI);
    g2.fillStyle = '#0E6B4E'; g2.strokeStyle = '#fff'; g2.lineWidth = 2;
    g2.beginPath(); g2.moveTo(0, 9); g2.lineTo(6.5, -6); g2.lineTo(0, -2.5); g2.lineTo(-6.5, -6); g2.closePath(); g2.fill(); g2.stroke(); g2.restore();
    g2.strokeStyle = '#C9A24A'; g2.lineWidth = 4; g2.beginPath(); g2.arc(C, C, C - 3, 0, Math.PI * 2); g2.stroke();
    g2.fillStyle = '#5A3E10'; g2.font = 'bold 13px system-ui, sans-serif'; g2.textAlign = 'center'; g2.fillText('N', C, 16);
  }
  let mapT = 0;
  world.every((dt, t) => { mapT += dt; if (mapT > 0.12) { mapT = 0; drawMap(t); } });
  drawMap(0);

  // ── the panel: narration, choices, overlays ──
  function openPanel(cls) { panel.className = 'sq-panel ' + (cls || ''); panel.replaceChildren(); panel.hidden = false; world.lock(true); return panel; }
  function closePanel() { panel.hidden = true; panel.replaceChildren(); world.lock(false); hush(); document.activeElement?.blur?.(); }
  const nextBtn = (label = 'Continue') => { const b = el('button', 'btn btn-primary big sq-next', label); b.type = 'button'; return b; };
  function sourceBits(p, src, reported) {
    const c = el('p', 'sq-cite', `${reported ? 'Reported · the book marks this as uncertain or as an addition · ' : ''}${cite(src)}`);
    const show = el('button', 'sq-src', 'Show the source'); show.type = 'button';
    const ar = el('p', 'sq-ar', src.ar); ar.lang = 'ar'; ar.dir = 'rtl'; ar.hidden = true;
    show.addEventListener('click', () => { ar.hidden = !ar.hidden; show.textContent = ar.hidden ? 'Show the source' : 'Hide the source'; });
    p.append(c, show, ar);
  }
  function card({ kicker, title: t, arTitle, text, src, reported, extra, note }) {
    return new Promise((resolve) => {
      const p = openPanel(reported ? 'reported' : '');
      if (kicker) p.append(el('p', 'sq-kicker', kicker));
      if (t) p.append(el('h2', 'sq-h', t));
      if (arTitle) { const a = el('p', 'sq-quote-ar', arTitle); a.lang = 'ar'; a.dir = 'rtl'; p.append(a); }
      if (note) p.append(el('p', 'sq-modern', note));
      p.append(el('p', 'sq-text', text));
      if (src) { sourceBits(p, src, reported); addArchive(src.id); }
      if (extra) p.append(el('p', 'sq-good', extra));
      const b = nextBtn(); b.addEventListener('click', () => { closePanel(); resolve(); });
      p.append(b); b.focus({ preventScroll: true });
      speakEn(text);
    });
  }
  let objective = '';
  function setObjective(t, prog = '', k = null) {
    objective = t || '';
    tracker.hidden = !t; trO.textContent = objective; trP.textContent = prog; trP.hidden = !prog;
    trBar.hidden = k == null; if (k != null) trFill.style.width = `${Math.round(k * 100)}%`;
  }
  // markers in reach: the Look button, the E key or a tap
  function nearLabel(prefix) { return (x) => { near.hidden = !x; useB.disabled = !x; if (x) near.textContent = `${prefix}: ${x.label}  (E)`; }; }

  // the Knowledge Archive: every passage of this episode the student has read or found, with its page and the Arabic
  function archivePanel(withContinue) {
    return new Promise((resolve) => {
      const p = openPanel('archive');
      p.append(el('p', 'sq-kicker', 'The Knowledge Archive'), el('h2', 'sq-h', `Episode ${ep.n}: ${ep.title}`), el('p', 'sq-text', TEXT.archive));
      const ids = [...new Set(ep.steps.flatMap(stepIds))];
      const mine = ids.filter((id) => archive.includes(id));
      p.append(el('p', 'sq-cite', `${mine.length} passages so far (this episode has ${ids.length}) · scrolls found: ${saved.scrolls.length} of ${allScrolls.length}`));
      const list = el('div', 'sq-arch');
      for (const id of mine) {
        const src = SOURCES[id], d = el('details', 'sq-rec' + (src.class === 'reported' ? ' rep' : '')), sm = el('summary');
        sm.append(el('span', 'sq-rec-k', saved.scrolls.includes(id) ? 'Scroll' : src.class === 'reported' ? 'A report' : 'Record'), el('span', null, src.en.length > 90 ? src.en.slice(0, 88).replace(/\s+\S*$/, '') + '…' : src.en));
        d.append(sm, el('p', 'sq-text', src.en));
        sourceBits(d, src, src.class === 'reported');
        list.append(d);
      }
      if (!mine.length) list.append(el('p', 'sq-text muted', TEXT.archiveEmpty));
      p.append(list);
      const b = nextBtn(withContinue ? 'Continue' : 'Close'); b.addEventListener('click', () => { closePanel(); resolve(); }); p.append(b);
    });
  }
  archBtn.addEventListener('click', () => { archBtn.blur(); if (panel.hidden) archivePanel(false); });

  // ── the steps ──
  const wells = {};
  const run = {
    async stage(s) {
      stageEl.textContent = `Stage ${s.id} · ${STAGES[s.id]}`;
      banner.replaceChildren(el('span', null, `Stage ${s.id}`), el('b', null, STAGES[s.id]));
      banner.hidden = false; banner.classList.remove('out'); void banner.offsetWidth; banner.classList.add('in');
      setTimeout(() => banner.classList.add('out'), 2200); setTimeout(() => { banner.hidden = true; banner.classList.remove('in', 'out'); }, 2800);
      await wait(TEST ? 50 : 900);
    },
    async scene(s) { world.setTime(s.time); if (s.at) world.place(s.at[0], s.at[1], s.at[2], s.at[3]); await wait(150); },
    async fly(s) {
      await world.fly(TEST ? s.shots.map(([a, b, t]) => [a, b, t * 0.1]) : s.shots);
      // the opening flight ends where the explorer starts walking
      const [pos, look] = s.shots[s.shots.length - 1];
      if (pos[1] - world.heightAt(pos[0], pos[2]) < 8) world.place(pos[0], pos[2], look[0], look[2], { snap: false });
    },
    async guide(s) { await card({ kicker: 'Explorer’s guide', title: s.title, text: s.text }); },
    async narrate(s) { for (const id of s.ids) { const p = SOURCES[id]; await card({ kicker: 'From the history', text: p.en, src: p }); } },
    async note(s) { for (const id of s.ids) { const p = SOURCES[id]; await card({ kicker: 'A report', text: p.en, src: p, reported: true }); } },
    async quote(s) {
      await new Promise((resolve) => {
        const p = openPanel('quote');
        const ar = el('p', 'sq-quote-ar', s.ar); ar.lang = 'ar'; ar.dir = 'rtl';
        p.append(el('p', 'sq-kicker', 'His words'), ar, el('p', 'sq-quote-en', s.en), el('p', 'sq-cite', cite(SOURCES[s.src])));
        const b = nextBtn(); b.addEventListener('click', () => { closePanel(); resolve(); }); p.append(b);
        speakEn(s.en);
      });
    },
    goto(s) {
      return new Promise((resolve) => {
        const h = world.addHotspot({ id: s.id, x: s.x, z: s.z, label: s.label });
        setObjective(s.objective);
        const done = () => { world.removeHotspot(s.id); world.onHotspot = null; world.onNear = null; near.hidden = true; useB.disabled = true; setObjective(''); resolve(); };
        world.onHotspot = (x) => { if (x === h) done(); };
        world.onNear = nearLabel('Look closer');
        near.onclick = () => { if (world.near() === h) done(); };
        if (TEST) root.dataset.target = s.id;
      });
    },
    search(s) {
      return new Promise((resolve) => {
        setObjective(s.objective);
        const hs = s.spots.map((p) => ({ p, h: world.addHotspot({ id: p.id, x: p.x, z: p.z, label: p.label }) }));
        const visit = async (h) => {
          const x = hs.find((k) => k.h === h); if (!x) return;
          world.onHotspot = null;
          await card({ kicker: 'Searching', title: x.p.label, text: x.p.note });
          if (x.p.right) { hs.forEach((k) => world.removeHotspot(k.p.id)); world.onNear = null; near.hidden = true; useB.disabled = true; setObjective(''); resolve(); }
          else { world.removeHotspot(x.p.id); hs.splice(hs.indexOf(x), 1); world.onHotspot = visit; }
        };
        world.onHotspot = visit;
        world.onNear = nearLabel('Look closer');
        near.onclick = () => { const x = world.near(); if (x) visit(x); };
        if (TEST) root.dataset.target = s.spots.find((p) => p.right).id;
      });
    },
    // a scroll hunt: scrolls of passages already read, with a trail of lights towards each
    async scrolls(s) {
      const left = s.items.filter((x) => !saved.scrolls.includes(x.src));
      if (!left.length) return;
      await card({ kicker: 'Explorer’s guide', title: s.title, text: s.text });
      const me = world.player(), pts = [];
      for (const it of left) { const d = Math.hypot(it.x - me.x, it.z - me.z), k = Math.max(2, Math.floor(d / 3)); for (let i = 1; i < k; i++) { const x = me.x + ((it.x - me.x) * i) / k, z = me.z + ((it.z - me.z) * i) / k; if (Math.hypot(x, z) > 9) pts.push([x, world.heightAt(x, z) + 1, z]); } }
      world.addLights(pts, `hunt${ep.n}`);
      let got = s.items.length - left.length;
      const prog = () => setObjective(s.objective, `${got}/${s.items.length} scrolls`, got / s.items.length);
      prog();
      if (TEST) root.dataset.scrolls = JSON.stringify(left.map((x) => [x.x, x.z]));
      await new Promise((resolve) => {
        for (const it of left) {
          world.addScroll(it.x, it.z, null, async () => {
            got++; prog(); play('scroll');
            await takeScroll(it.src);
            if (got >= s.items.length) { setObjective(''); resolve(); }
          }, it.src);
        }
      });
    },
    // the climbing challenge (obby)
    async parkour(s) {
      await card({ kicker: 'Explorer’s guide', title: s.title, text: s.text, extra: M.timer && !gentle ? TEXT.timer : gentle ? TEXT.gentle : null });
      const info = world.buildCourse({ ...s.course, mode: courseMode, scrolls: s.scrolls.length });
      s.scrolls.forEach((x, i) => { if (!saved.scrolls.includes(x.src)) world.addScroll(...[info.spots[i][0], info.spots[i][2], info.spots[i][1]], async () => { play('scroll'); await takeScroll(x.src); }, x.src); });
      world.place(info.start.x, info.start.z, info.goal.x, info.goal.z);
      const target = info.plats * 5 + 15;
      let flags = 0, t0 = null, time = 0;
      const prog = () => setObjective(s.objective, `Flags ${flags}/${info.checkpoints}`, info.checkpoints ? flags / info.checkpoints : null);
      prog();
      const timer = M.timer && !gentle;
      const c = world.course;
      const tick = world.every((dt) => {
        if (!c.started && !t0) return;
        if (t0 == null) t0 = performance.now();
        time = (performance.now() - t0) / 1000;
        if (timer) { trT.hidden = false; trT.textContent = `Time ${mmss(time)} · beat ${mmss(target)}`; trT.classList.toggle('over', time > target); }
      });
      await new Promise((resolve) => {
        c.onCheckpoint = (i, of) => { flags = Math.max(flags, i); play('checkpoint'); say('Checkpoint! If you fall, you come back here.'); prog(); };
        c.onFall = (falls) => {
          play('poof'); say(falls === 1 ? TEXT.fall : `Poof! Back to the flag. (${falls})`);
          if (falls === 6 && courseMode !== 'master') { world.helpCourse(); say(TEXT.helpers, 3800); }
          if (falls >= 10) skip.hidden = false;
        };
        skip.onclick = () => { skip.hidden = true; c.active = false; resolve(false); };
        c.onGoal = () => resolve(true);
        if (TEST) window.__sq.goal = () => c.onGoal?.();
      }).then(async (won) => {
        tick(); trT.hidden = true; skip.hidden = true; setObjective('');
        if (!won) return;
        play('lantern');
        if (!saved.lanterns.includes(s.course.seed)) saved.lanterns.push(s.course.seed);
        const best = saved.best ?? null; if (timer && (best == null || time < best)) saved.best = Math.round(time);
        draw(); onSave?.({});
        award('explorer');
        const beat = timer ? (time <= target ? `You beat the time: ${mmss(time)}.` : `Your time: ${mmss(time)}. Try to beat ${mmss(target)} next time.`) : '';
        await card({ kicker: 'Lantern lit', title: TEXT.lanternTitle, text: `${TEXT.lanternText} ${beat}`.trim() });
      });
    },
    async archive(s) {
      const a = world.ARCHIVE;
      await new Promise((resolve) => {
        const h = world.addHotspot({ id: 'archive', x: a.x - 1, z: a.z, label: 'The Knowledge Archive', radius: 4.5 });
        setObjective(s.objective);
        const done = () => { world.removeHotspot('archive'); world.onHotspot = null; world.onNear = null; near.hidden = true; useB.disabled = true; setObjective(''); resolve(); };
        world.onHotspot = (x) => { if (x === h) done(); };
        world.onNear = nearLabel('Go in');
        near.onclick = () => { if (world.near() === h) done(); };
        if (TEST) root.dataset.target = 'archive';
      });
      await archivePanel(true);
    },
    order(s) {
      return new Promise((resolve) => {
        const p = openPanel('order');
        p.append(el('p', 'sq-kicker', 'Mission'), el('h2', 'sq-h', s.title), el('p', 'sq-text', s.text));
        const line = el('ol', 'sq-line'), pool = el('div', 'sq-pool');
        let at = 0, tries = 0;
        shuffle(s.items.map((t, k) => ({ t, k }))).forEach((x) => {
          const b = el('button', 'sq-chip', x.t); b.type = 'button'; if (TEST) b.dataset.answer = x.k;
          b.addEventListener('click', () => {
            if (x.k === at) { b.remove(); line.append(el('li', null, x.t)); at++; if (at === s.items.length) { score.order += tries === 0 ? 1 : 0; const n = nextBtn(); n.addEventListener('click', () => { closePanel(); resolve(); }); p.append(el('p', 'sq-good', 'That is the order in the history.'), n); } }
            else { tries++; b.classList.add('nope'); setTimeout(() => b.classList.remove('nope'), 450); }
          });
          pool.append(b);
        });
        p.append(line, pool, el('p', 'sq-cite', cite(SOURCES[s.src])));
      });
    },
    choice(s) {
      return new Promise((resolve) => {
        const p = openPanel('choice');
        p.append(el('p', 'sq-kicker', 'Think'), el('h2', 'sq-h', s.q));
        const opts = el('div', 'sq-opts');
        const after = el('div');
        let settled = false;
        s.options.forEach((o, i) => {
          const b = el('button', 'sq-opt', o); b.type = 'button'; if (TEST) b.dataset.answer = String(i === s.answer);
          b.addEventListener('click', () => {
            if (settled) return;
            if (i === s.answer) {
              settled = true; b.classList.add('right'); opts.querySelectorAll('button').forEach((x) => (x.disabled = true));
              if (s.explain) after.append(el('p', 'sq-text', s.explain));
              after.append(el('p', 'sq-cite', cite(SOURCES[s.src])));
              const n = nextBtn(); n.addEventListener('click', () => { closePanel(); resolve(); }); after.append(n);
            } else { b.disabled = true; b.classList.add('nope'); }
          });
          opts.append(b);
        });
        p.append(opts, after);
        speakEn(s.q);
      });
    },
    dig(s) {
      return new Promise((resolve) => {
        const w = (wells[`${s.x},${s.z}`] = world.well(s.x, s.z));
        world.place(s.x - 6, s.z + 6, s.x, s.z);
        setObjective(s.objective);
        const bar = el('div', 'sq-dig'); const fill = el('i'); bar.append(fill);
        const btn = el('button', 'btn btn-primary big sq-digbtn', 'Hold to dig'); btn.type = 'button';
        const box = el('div', 'sq-digbox'); box.append(bar, btn);
        root.append(box);
        let k = 0, holding = false;
        const on = () => (holding = true), off = () => (holding = false);
        btn.addEventListener('pointerdown', on); addEventListener('pointerup', off); btn.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') on(); }); btn.addEventListener('keyup', off);
        const stopU = world.every((dt) => {
          if (!holding) return;
          k = Math.min(1, k + dt / (TEST ? 1 : 5)); w.progress(k); fill.style.width = `${k * 100}%`;
          if (k >= 1) { stopU(); box.remove(); setObjective(''); removeEventListener('pointerup', off); resolve(); }
        });
      });
    },
    journey(s) {
      return new Promise((resolve) => {
        const p = openPanel('journey');
        p.append(el('p', 'sq-kicker', 'Mission'), el('h2', 'sq-h', 'Across the desert'), el('p', 'sq-text', 'The caravan rides north towards the highlands of al-Sham to find the judge. Tap “Ride on” to travel each stage, and watch the water.'));
        const map = el('div', 'sq-desert'); const stages = 5; let at = 0;
        for (let i = 0; i <= stages; i++) map.append(el('span', 'sq-stage' + (i === 0 ? ' on' : '')));
        const water = el('div', 'sq-water'); water.append(el('span', null, 'Water'), el('i'));
        const go = el('button', 'btn btn-primary big', 'Ride on'); go.type = 'button';
        p.append(map, water, go);
        const level = () => { water.querySelector('i').style.width = `${Math.max(0, 100 - at * 34)}%`; };
        level();
        go.addEventListener('click', async () => {
          at++; map.children[at].classList.add('on'); level();
          if (at >= 3) {
            go.remove(); closePanel();
            for (const id of s.src) { const x = SOURCES[id]; await card({ kicker: 'From the history', text: x.en, src: x }); }
            resolve();
          }
        });
      });
    },
    async spring() {
      world.setTime('day');
      world.place(160, 160, 150, 150);
      const camel = world.creature('camel', 150, 150, 1.2);
      const lanterns = [[143, 156], [156, 160], [146, 144]].map(([x, z]) => world.lantern(x, z));
      await card({ kicker: 'Watch', text: 'ʿAbd al-Muttalib makes his camel rise…' });
      const sp = world.spring(150.5, 151);
      const u = world.every((dt) => sp.update(dt));
      await world.fly([[[156, world.heightAt(156, 156) + 3, 157], [150, world.heightAt(150, 150) + 1, 150], 3]]);
      await wait(2500);
      u(); void camel; void lanterns;
    },
    async fillwell(s) { (wells[`${s.x},${s.z}`] ?? (wells[`${s.x},${s.z}`] = world.well(s.x, s.z))).progress(1); wells[`${s.x},${s.z}`].fill(); await wait(1200); },
    route(s) {
      return new Promise((resolve) => {
        const p = openPanel('route');
        p.append(el('p', 'sq-kicker', 'Mission'), el('h2', 'sq-h', s.title), el('p', 'sq-text', s.text));
        const map = el('div', 'sq-map');
        map.innerHTML = '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M30 2 Q20 30 26 50 Q40 80 70 98 L100 98 L100 0 Z" fill="#E8D6B0"/><path d="M30 2 Q20 30 26 50 Q40 80 70 98" fill="none" stroke="#7FB3C8" stroke-width="2.5"/><text x="3" y="72" font-size="3.4" fill="#5C93A8">Red Sea</text></svg>';
        let at = 0, tries = 0;
        const trail = [];
        s.stops.forEach((st, k) => {
          const b = el('button', 'sq-pin', st.name); b.type = 'button'; b.style.left = `${st.x}%`; b.style.top = `${st.y}%`; if (TEST) b.dataset.answer = k;
          b.addEventListener('click', async () => {
            if (k !== at) { tries++; b.classList.add('nope'); setTimeout(() => b.classList.remove('nope'), 450); return; }
            b.classList.add('done'); trail.push(st); at++;
            panel.hidden = true;
            await card({ kicker: st.name, text: SOURCES[st.src].en, src: SOURCES[st.src] });
            panel.replaceChildren(...keep); panel.hidden = false; world.lock(true);
            if (at === s.stops.length) { score.order += tries === 0 ? 1 : 0; const n = nextBtn(); n.addEventListener('click', () => { closePanel(); resolve(); }); panel.append(n); }
          });
          map.append(b);
        });
        p.append(map, el('p', 'sq-cite', 'A simple map, not to scale.'));
        const keep = [...p.children];
      });
    },
    guide_groups(s) {
      return new Promise((resolve) => {
        setObjective(s.objective);
        world.setTime('dusk');
        world.place(0, 70, 0, 0);
        const groups = [];
        for (let i = 0; i < s.n; i++) {
          const a = -0.9 + (i / (s.n - 1)) * 1.8, x = Math.sin(a) * 40, z = 40 + Math.cos(a) * 10;
          const id = `g${i}`;
          world.addHotspot({ id, x, z, label: 'A family of Makkah', color: 0xffc46b, radius: 6 });
          groups.push({ id, x, z, l: world.lantern(x, z) });
        }
        let safe = 0;
        const send = (h) => {
          const g = groups.find((x) => x.id === h.id); if (!g || g.sent) return;
          g.sent = true; world.removeHotspot(g.id);
          const tx = g.x * 5 + (Math.random() - 0.5) * 40, tz = -260 + Math.random() * 60;
          const sx = g.x, sz = g.z; let t = 0;
          const u = world.every((dt) => { t = Math.min(1, t + dt / 6); const x = sx + (tx - sx) * t, z = sz + (tz - sz) * t; g.l.position.set(x, world.heightAt(x, z), z); if (t >= 1) u(); });
          safe++; setObjective(`${s.objective}  (${safe} of ${s.n} safe)`);
          if (safe === s.n) { world.onHotspot = null; world.onNear = null; near.hidden = true; useB.disabled = true; setTimeout(() => { setObjective(''); resolve(); }, 1200); }
        };
        world.onHotspot = send;
        world.onNear = nearLabel('Lead them up');
        near.onclick = () => { const x = world.near(); if (x) send(x); };
        if (TEST) root.dataset.groups = groups.map((g) => g.id).join(',');
        run._groups = { send: (id) => send({ id }) };
      });
    },
    async elephant() {
      world.place(-40, 200, 0, 130);
      const camp = [];
      for (let i = 0; i < 40; i++) camp.push(world.lantern(-70 + Math.random() * 140, 230 + Math.random() * 60, { color: 0xff9a4a }));
      const el2 = world.creature('elephant', 0, 175, 1.3);
      el2.rotation.y = Math.PI / 2;
      run._camp = camp;
      await world.fly([[[-26, world.heightAt(-26, 160) + 6, 160], [0, world.heightAt(0, 175) + 3, 175], 4]]);
      // it kneels: the body lowers and the front legs fold
      let t = 0; const y0 = el2.position.y;
      await new Promise((r) => { const u = world.every((dt) => { t = Math.min(1, t + dt / 2.5); el2.position.y = y0 - 1.6 * t; el2.rotation.z = -0.12 * t; if (t >= 1) { u(); r(); } }); });
      await wait(800);
    },
    async birds() {
      world.setTime('day');
      await card({ kicker: 'Watch', text: 'What happened next was from Allah alone. No one could take part in it. Watch, and listen.' });
      const f1 = world.flock(TEST ? 60 : 260, { x: -700, z: -200 }, { x: 0, z: 260 }, { height: 70, spread: 90 });
      const f2 = world.flock(TEST ? 40 : 180, { x: -800, z: -60 }, { x: 40, z: 280 }, { height: 85, spread: 70 });
      let t = 0;
      const u = world.every((dt) => { t += dt / 9; f1.update(t); f2.update(t * 0.95); });
      await world.fly([[[-60, world.heightAt(-60, 120) + 30, 120], [0, 60, 240], 5], [[-60, world.heightAt(-60, 120) + 30, 120], [0, 40, 260], 4]]);
      // the camp's lights scatter and go back the way they came
      const camp = run._camp ?? [];
      let k = 0;
      const u2 = world.every((dt) => { k = Math.min(1, k + dt / 5); camp.forEach((l, i) => { l.position.z += dt * (14 + (i % 5) * 4); l.children.forEach((m) => { m.material.transparent = true; m.material.opacity = 1 - k; }); }); if (k >= 1) u2(); });
      await wait(TEST ? 800 : 5000);
      u(); f1.remove(); f2.remove();
    },
    recite(s) {
      return new Promise((resolve) => {
        const p = openPanel('recite');
        p.append(el('p', 'sq-kicker', 'The Qurʾan'), el('h2', 'sq-h', 'Surah al-Fil'), el('p', 'sq-text', 'Listen to the reciter. (The Qurʾan is recited from the reciter, never narrated by the game.)'));
        const play = el('button', 'btn', '▶ Listen to the surah'); play.type = 'button';
        let a = null;
        play.addEventListener('click', async () => {
          for (let i = 1; i <= s.ayahs && !panel.hidden; i++) { a = new Audio(audioUrl(reciter, s.surah, i)); await new Promise((r) => { a.onended = r; a.onerror = r; a.play().catch(r); }); }
        });
        const n = nextBtn(); n.addEventListener('click', () => { a?.pause(); closePanel(); resolve(); });
        p.append(play, n);
      });
    },
    // lantern records: each person from the book is a lantern in the valley (never a figure); walking up to one
    // lights it and opens the passage about them
    lanterns(s) {
      return new Promise((resolve) => {
        const left = new Map();
        for (const p of s.people) {
          const h = world.addHotspot({ id: `lan-${p.id}`, x: p.x, z: p.z, label: p.name, color: 0xffc46b, radius: 3.6 });
          const l = world.lantern(p.x, p.z, { color: 0x8a7a5a, height: 2.2 });
          const tag = props.label(p.name, { w: 3.2 }); tag.position.set(p.x, world.heightAt(p.x, p.z) + 3.6, p.z); world.scene.add(tag);
          left.set(h, { p, l });
        }
        const total = s.people.length;
        const prog = () => setObjective(s.objective, `${total - left.size}/${total} lanterns`, (total - left.size) / total);
        prog();
        const visit = async (h) => {
          const x = left.get(h); if (!x) return;
          left.delete(h); world.removeHotspot(h.id); world.onHotspot = null;
          x.l.children.forEach((m) => m.material.color.setHex(0xffd36b)); play('lantern');
          const src = SOURCES[x.p.src];
          await card({ kicker: 'Lantern record', title: x.p.name, arTitle: x.p.ar, text: src.en, src, reported: src.class === 'reported', extra: x.p.role });
          prog();
          if (!left.size) { world.onNear = null; near.hidden = true; useB.disabled = true; setObjective(''); resolve(); }
          else world.onHotspot = visit;
        };
        world.onHotspot = visit; world.onNear = nearLabel('Light the lantern');
        near.onclick = () => { const h = world.near(); if (h) visit(h); };
        if (TEST) root.dataset.targets = [...left.keys()].map((h) => h.id).join(',');
      });
    },
    // the family tree: tap a name, then the place it belongs (every relationship is in a passage already read)
    tree(s) {
      return new Promise((resolve) => {
        const p = openPanel('tree');
        p.append(el('p', 'sq-kicker', 'Mission'), el('h2', 'sq-h', s.title), el('p', 'sq-text', s.text));
        const chart = el('div', 'sq-tree'), pool = el('div', 'sq-pool');
        let pick = null, left = s.slots.length;
        const slots = new Map();
        for (const row of s.rows) {
          const r = el('div', 'sq-tree-row');
          for (const id of row) {
            if (id === 'me') { const c = el('div', 'sq-tree-me'); withSawText(c, s.centre); r.append(c); continue; }
            const sl = s.slots.find((x) => x.id === id);
            const b = el('button', 'sq-tree-slot'); b.type = 'button'; b.append(el('span', 'sq-tree-l', sl.label), el('b', null, '?'));
            if (TEST) b.dataset.answer = sl.answer;
            b.addEventListener('click', () => {
              if (b.disabled || !pick) return;
              if (pick.dataset.name === sl.answer) {
                b.disabled = true; b.classList.add('right'); b.lastChild.textContent = sl.answer; pick.remove(); pick = null; play('plate'); left--;
                if (!left) { const n = nextBtn(); n.addEventListener('click', () => { closePanel(); resolve(); }); p.append(el('p', 'sq-good', 'The family is complete, as the book gives it.'), ...s.srcs.map((x) => el('p', 'sq-cite', cite(SOURCES[x]))), n); n.focus({ preventScroll: true }); }
              } else { b.classList.add('nope'); setTimeout(() => b.classList.remove('nope'), 450); play('wrong'); }
            });
            slots.set(id, b); r.append(b);
          }
          chart.append(r);
        }
        shuffle(s.slots.map((x) => x.answer)).forEach((name) => {
          const c = el('button', 'sq-chip', name); c.type = 'button'; c.dataset.name = name;
          c.addEventListener('click', () => { pool.querySelectorAll('.sq-chip').forEach((x) => x.classList.toggle('picked', x === c)); pick = c; });
          pool.append(c);
        });
        p.append(chart, el('p', 'sq-text muted', 'Tap a name, then tap its place in the family.'), pool);
      });
    },
    // sort the passages: what the book states firmly, and what it gives as one view among several
    classify(s) {
      return new Promise((resolve) => {
        const ids = shuffle(s.ids); let i = 0, right = 0;
        const next = () => {
          if (i >= ids.length) {
            const p = openPanel('classify');
            p.append(el('p', 'sq-kicker', 'Evidence check'), el('h2', 'sq-h', `${right} of ${ids.length} sorted right first time`), el('p', 'sq-text', s.done));
            const n = nextBtn(); n.addEventListener('click', () => { closePanel(); resolve(); }); p.append(n); n.focus({ preventScroll: true });
            return;
          }
          const id = ids[i], src = SOURCES[id], want = src.class === 'established' ? 0 : 1;
          const p = openPanel('classify');
          p.append(el('p', 'sq-kicker', `Evidence check · ${i + 1} of ${ids.length}`), el('h2', 'sq-h', s.title), el('blockquote', 'sq-quote-en', src.en));
          const opts = el('div', 'sq-opts two'), after = el('div');
          let tried = false, settled = false;
          s.bins.forEach((b, k) => {
            const btn = el('button', 'sq-opt', b); btn.type = 'button'; if (TEST) btn.dataset.answer = String(k === want);
            btn.addEventListener('click', () => {
              if (settled) return;
              if (k === want) {
                settled = true; if (!tried) right++; btn.classList.add('right'); opts.querySelectorAll('button').forEach((x) => (x.disabled = true)); addArchive(id);
                after.append(el('p', 'sq-text', want ? `The book gives this as one view: ${src.note || 'it says “it was said”, or reports it with doubt.'}` : 'The book states this without casting doubt on it.'));
                sourceBits(after, src, want === 1);
                const n = nextBtn(); n.addEventListener('click', () => { i++; next(); }); after.append(n); n.focus({ preventScroll: true });
              } else { tried = true; btn.disabled = true; btn.classList.add('nope'); play('wrong'); }
            });
            opts.append(btn);
          });
          p.append(opts, after);
          speakEn(src.en);
        };
        next();
      });
    },
    // match pairs: tap something on the left, then its partner on the right
    match(s) {
      return new Promise((resolve) => {
        const p = openPanel('match');
        p.append(el('p', 'sq-kicker', 'Mission'), el('h2', 'sq-h', s.title), el('p', 'sq-text', s.text));
        const cols = el('div', 'sq-match'), L = el('div', 'sq-match-col'), R = el('div', 'sq-match-col');
        let pick = null, left = s.pairs.length, tries = 0;
        s.pairs.forEach(([a], k) => { const b = el('button', 'sq-chip', a); b.type = 'button'; b.dataset.k = k; b.addEventListener('click', () => { if (b.disabled) return; L.querySelectorAll('.sq-chip').forEach((x) => x.classList.toggle('picked', x === b)); pick = b; }); L.append(b); });
        shuffle(s.pairs.map(([, r], k) => ({ r, k }))).forEach(({ r, k }) => {
          const b = el('button', 'sq-chip', r); b.type = 'button'; if (TEST) b.dataset.answer = k;
          b.addEventListener('click', () => {
            if (b.disabled || !pick) return;
            if (Number(pick.dataset.k) === k) {
              b.disabled = pick.disabled = true; b.classList.add('right'); pick.classList.add('right'); pick.classList.remove('picked'); pick = null; play('plate'); left--;
              if (!left) { score.order += tries === 0 ? 1 : 0; const n = nextBtn(); n.addEventListener('click', () => { closePanel(); resolve(); }); p.append(el('p', 'sq-good', s.good ?? 'All matched.'), el('p', 'sq-cite', cite(SOURCES[s.src])), n); n.focus({ preventScroll: true }); }
            } else { tries++; b.classList.add('nope'); setTimeout(() => b.classList.remove('nope'), 450); play('wrong'); }
          });
          R.append(b);
        });
        cols.append(L, R); p.append(cols);
      });
    },
    // practice scenarios from today, clearly labelled as not from the Seerah
    scenario(s) {
      return new Promise((resolve) => {
        let i = 0, best = 0;
        const next = () => {
          if (i >= s.cases.length) {
            const all = best === s.cases.length;
            const p = openPanel('scenario');
            p.append(el('p', 'sq-kicker', s.title), el('h2', 'sq-h', all ? 'Trustworthy every time' : `${best} of ${s.cases.length} trustworthy first time`), el('p', 'sq-text', s.done));
            const n = nextBtn(); n.addEventListener('click', () => { closePanel(); if (all && s.badge) award(s.badge); resolve(); }); p.append(n); n.focus({ preventScroll: true });
            return;
          }
          const c = s.cases[i];
          const p = openPanel('scenario');
          p.append(el('p', 'sq-kicker', `${s.title} · ${i + 1} of ${s.cases.length}`), el('p', 'sq-modern', TEXT.modern), el('h2', 'sq-h', c.q));
          const opts = el('div', 'sq-opts'), after = el('div'); let tried = false, settled = false;
          c.options.forEach((o, k) => {
            const b = el('button', 'sq-opt', o); b.type = 'button'; if (TEST) b.dataset.answer = String(k === c.best);
            b.addEventListener('click', () => {
              if (settled) return;
              if (k === c.best) { settled = true; if (!tried) best++; b.classList.add('right'); opts.querySelectorAll('button').forEach((x) => (x.disabled = true)); after.append(el('p', 'sq-text', c.why)); const n = nextBtn(); n.addEventListener('click', () => { i++; next(); }); after.append(n); n.focus({ preventScroll: true }); }
              else { tried = true; b.disabled = true; b.classList.add('nope'); after.replaceChildren(el('p', 'sq-text muted', c.hint ?? 'Think again: which choice keeps the trust?')); }
            });
            opts.append(b);
          });
          p.append(opts, after);
          speakEn(c.q);
        };
        next();
      });
    },
    // the training yard: smash practice pots and crates for lights and building materials; some hide a scroll
    async smash(s) {
      await card({ kicker: 'Explorer’s guide', title: s.title, text: s.text, extra: TEXT.yardNote });
      const yd = props.yard(s.x, s.z, s.n, { seed: s.seed ?? 3, prizes: (s.scrolls ?? []).length });
      world.place(s.x, s.z + 11, s.x, s.z);
      drawMats(); smashB.hidden = false;
      let broken = 0, pending = 0;
      const total = yd.list.length;
      const prog = () => setObjective(s.objective, `${broken}/${total} smashed`, broken / total);
      prog(); say(TEXT.smash, 4200);
      await new Promise((resolve) => {
        const check = () => { if (broken >= total && pending === 0) { world.onStrike = null; smashB.hidden = true; setObjective(''); resolve(); } };
        const broke = (b) => {
          play('smash'); broken++;
          const pts = []; for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; pts.push([b.x + Math.cos(a) * 1.4, b.y + 0.9, b.z + Math.sin(a) * 1.4]); }
          world.addLights(pts, 'yard');
          const h = mats(), kind = b.kind === 'crate' ? 'wood' : 'bricks'; h[kind] = (h[kind] ?? 0) + 2; drawMats(); say(`+2 ${kind}`, 1400);
          const it = b.prize != null ? s.scrolls[b.prize] : null;
          if (it && !saved.scrolls.includes(it.src)) { pending++; world.addScroll(b.x, b.z, b.y + 1.1, async () => { play('scroll'); await takeScroll(it.src); pending--; check(); }, it.src); }
          onSave?.({}); prog(); check();
        };
        world.onStrike = () => { play('swing'); const r = props.hitNearest(); if (!r) return; if (r.broke) broke(r.b); else play('hit'); };
        if (TEST) window.__sq.smashAll = () => yd.list.filter((b) => !b.broken).forEach((b) => { props.breakIt(b); broke(b); });
      });
    },
    // the puzzle vault: step on the plates in the order of the history; a stone door opens on a chest
    async vault(s) {
      await card({ kicker: 'Explorer’s guide', title: s.title, text: s.text, extra: TEXT.vault });
      const v = props.vault(s.x, s.z, s.plates);
      world.place(v.entrance.x, v.entrance.z, v.centre.x, v.centre.z);
      const n = s.plates.length; let at = 0, wrong = 0, last = null;
      const prog = () => setObjective(s.objective, `Plates ${at}/${n}`, at / n);
      prog();
      if (TEST) root.dataset.plates = JSON.stringify(v.plates.map((p) => [p.li, p.x, p.z]));
      await new Promise((resolve) => {
        const u = world.every(() => {
          const p = v.plateUnder(); if (p === last) return; last = p;
          if (!p || p.state === 'on') return;
          if (p.li === at) { v.setPlate(p, 'on'); play('plate'); at++; prog(); if (at === n) { u(); resolve(); } }
          else { wrong++; play('wrong'); say(TEXT.vaultWrong, 2600); v.plates.forEach((q) => v.setPlate(q, 'wrong')); setTimeout(() => v.plates.forEach((q) => v.setPlate(q, 'off')), 700); at = 0; prog(); }
        });
      });
      setObjective(''); play('door'); v.openDoor(); say(TEXT.vaultOpen, 3600);
      await card({ kicker: 'Puzzle solved', title: s.solvedTitle ?? 'The right order', text: s.plates.map((t, i) => `${i + 1}. ${t}`).join('   '), extra: wrong ? null : 'No wrong plates: a perfect solve.' });
      await new Promise((resolve) => {
        const h = world.addHotspot({ id: 'chest', x: v.chestAt.x, z: v.chestAt.z, label: 'The chest', radius: 3 });
        setObjective(s.chestObjective ?? 'Open the chest in the hidden room.');
        const done = () => { world.removeHotspot('chest'); world.onHotspot = null; world.onNear = null; near.hidden = true; useB.disabled = true; setObjective(''); resolve(); };
        world.onHotspot = (x) => { if (x === h) done(); };
        world.onNear = nearLabel('Open');
        near.onclick = () => { if (world.near() === h) done(); };
        if (TEST) root.dataset.target = 'chest';
      });
      v.openChest(); play('lantern'); award('treasure'); if (!wrong) award('puzzle');
      const me = world.player(); const pts = []; for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; pts.push([me.x + Math.cos(a) * 1.6, me.y + 1.2, me.z + Math.sin(a) * 1.6]); }
      world.addLights(pts, 'chest');
      for (const it of s.scrolls ?? []) if (!saved.scrolls.includes(it.src)) { play('scroll'); await takeScroll(it.src); }
    },
    // carry blocks from the pile to the wooden learning model; each block raises it by one course
    async carry(s) {
      await card({ kicker: 'Explorer’s guide', title: s.title, text: s.text, extra: TEXT.carry });
      const m = props.model(s.x, s.z, { courses: s.n });
      world.place(m.pileAt.x + 1, m.pileAt.z + 5, m.pileAt.x, m.pileAt.z);
      let holding = false;
      const prog = () => setObjective(holding ? s.objective2 ?? 'Carry the block to the model.' : s.objective, `Courses ${m.built}/${s.n}`, m.built / s.n);
      prog();
      await new Promise((resolve) => {
        const pile = world.addHotspot({ id: 'pile', x: m.pileAt.x, z: m.pileAt.z, label: 'Pick up a block', radius: 3.2, color: 0xe8d2a6 });
        const mod = world.addHotspot({ id: 'model', x: m.at.x, z: m.at.z + 2.6, label: 'Set the block on the model', radius: 3.4, color: 0x9fe6ff });
        const use = (h) => {
          if (h === pile && !holding) { holding = true; world.setCarry(true); play('pick'); prog(); }
          else if (h === mod && holding) {
            holding = false; world.setCarry(false); m.addCourse(); play('place'); prog();
            if (m.built >= s.n) { world.removeHotspot('pile'); world.removeHotspot('model'); world.onHotspot = null; world.onNear = null; near.hidden = true; useB.disabled = true; setObjective(''); if (s.roof) m.roof(); resolve(); }
          } else say(holding ? 'Take the block to the model first.' : 'Pick up a block from the pile first.', 1800);
        };
        world.onHotspot = use; world.onNear = (x) => { near.hidden = !x; useB.disabled = !x; if (x) near.textContent = `${x.label}  (E)`; };
        near.onclick = () => { const x = world.near(); if (x) use(x); };
        if (TEST) window.__sq.carryAll = () => { for (let i = m.built; i < s.n; i++) { use(pile); use(mod); } };
      });
    },
    // the build plot: free building with the materials from the training yard
    async build(s) {
      await card({ kicker: 'Explorer’s guide', title: s.title, text: `${s.text} ${TEXT.build}`, extra: TEXT.buildNote });
      const B = (shared.build ??= { pieces: [], have: { bricks: 24, wood: 10 } });
      const startCount = B.pieces.length;
      const pl = props.plot(s.x, s.z, { saved: B.pieces, budget: B.have, onChange: (pieces, have) => { B.pieces = pieces; B.have = have; drawMats(); onSave?.({}); if (pieces.length >= 20) award('builder'); prog(); } });
      B.have = pl.have; drawMats();
      world.place(s.x, s.z + pl.half + 3, s.x, s.z);
      smashB.hidden = true;
      const goal = s.goal ?? 6, placedNow = () => Math.max(0, pl.count - startCount);
      const prog = () => { setObjective(s.objective, `${Math.min(goal, placedNow())}/${goal} pieces placed`, Math.min(1, placedNow() / goal)); doneB.disabled = placedNow() < goal && pl.count < goal; };
      // the bar: pieces with their cost, then Turn, Take off, Undo and Done
      buildBar.replaceChildren(); buildBar.hidden = false;
      const kinds = Object.keys(pl.PIECES), btnFor = {};
      const paintKinds = () => kinds.forEach((k) => btnFor[k].setAttribute('aria-pressed', String(pl.kind === k)));
      kinds.forEach((k, i) => {
        const P0 = pl.PIECES[k], b = el('button', 'sq-bb'); b.type = 'button';
        b.append(el('b', null, `${i + 1} ${P0.name}`), el('span', null, Object.entries(P0.cost).map(([m, v]) => `${v} ${m}`).join(' ')));
        b.addEventListener('click', () => { pl.setKind(k); paintKinds(); b.blur(); });
        btnFor[k] = b; buildBar.append(b);
      });
      const act = (label, fn, cls = 'sq-bb sq-bb-act') => { const b = el('button', cls, label); b.type = 'button'; b.addEventListener('click', () => { fn(); b.blur(); }); buildBar.append(b); return b; };
      const doPlace = () => { const r = pl.place(); if (r === 'ok') play('place'); else if (r === 'no-materials') { play('wrong'); say(TEXT.noMaterials, 3000); } else play('wrong'); };
      act('Place', doPlace, 'sq-bb sq-bb-act go'); act('Turn', () => pl.rotate()); act('Take off', () => { if (pl.remove()) play('hit'); }); act('Undo', () => { if (pl.undo()) play('hit'); });
      const doneB = act('Done', () => finish(), 'sq-bb sq-bb-act done');
      paintKinds(); prog(); say(TEXT.buildKeys, 5000);
      let finish;
      await new Promise((resolve) => {
        finish = () => { if (doneB.disabled) return; resolve(); };
        world.onKey = (k) => {
          if (k === 'b' || k === 'enter') doPlace(); else if (k === 'x') { if (pl.remove()) play('hit'); } else if (k === 'r') pl.rotate(); else if (k === 'z') { if (pl.undo()) play('hit'); }
          else if (/^[1-8]$/.test(k)) { pl.setKind(kinds[Number(k) - 1]); paintKinds(); }
        };
        const u = world.every(() => pl.setActive(pl.inside()));
        finish.u = u;
        if (TEST) window.__sq.plot = pl;
      });
      finish.u?.(); pl.setActive(false); world.onKey = null; buildBar.hidden = true; setObjective('');
    },
    quiz(s) {
      return new Promise((resolve) => {
        const qs = s.questions;
        let i = 0, right = 0;
        const ask = () => {
          if (i >= qs.length) {
            score.quiz = { right, of: qs.length };
            const p = openPanel('quiz');
            p.append(el('p', 'sq-kicker', 'Knowledge challenge'), el('h2', 'sq-h', `${right} of ${qs.length} right first time`), el('p', 'sq-text', right >= Math.ceil(qs.length * 0.66) ? 'Masha’Allah. You know what happened, and why.' : 'Good effort. You can play the episode again to learn it better.'));
            const n = nextBtn(); n.addEventListener('click', () => { closePanel(); resolve(); }); p.append(n);
            return;
          }
          const q = qs[i];
          const p = openPanel('quiz');
          p.append(el('p', 'sq-kicker', `Knowledge challenge · ${i + 1} of ${qs.length}`), el('h2', 'sq-h', q.q));
          const opts = el('div', 'sq-opts'); let tried = false, settled = false;
          shuffle([q.a, ...q.w]).forEach((o) => {
            const b = el('button', 'sq-opt', o); b.type = 'button'; if (TEST) b.dataset.answer = String(o === q.a);
            b.addEventListener('click', () => {
              if (settled) return;
              if (o === q.a) {
                settled = true; if (!tried) right++; b.classList.add('right'); opts.querySelectorAll('button').forEach((x) => (x.disabled = true));
                const n = nextBtn(); n.addEventListener('click', () => { i++; ask(); }); p.append(el('p', 'sq-cite', cite(SOURCES[q.src])), n);
              } else { tried = true; b.disabled = true; b.classList.add('nope'); }
            });
            opts.append(b);
          });
          p.append(opts);
        };
        ask();
      });
    },
    reflect(s) {
      return new Promise((resolve) => {
        const p = openPanel('reflect');
        p.append(el('p', 'sq-kicker', 'Reflection'), el('h2', 'sq-h', s.prompt));
        const opts = el('div', 'sq-opts');
        s.options.forEach((o) => { const b = el('button', 'sq-opt', o); b.type = 'button'; b.addEventListener('click', () => { opts.querySelectorAll('button').forEach((x) => x.classList.toggle('right', x === b)); n.disabled = false; }); opts.append(b); });
        const n = nextBtn('Finish the episode'); n.disabled = true; n.addEventListener('click', () => { closePanel(); resolve(); });
        p.append(opts, el('p', 'sq-text muted', 'There is no wrong answer here. Think about it, and choose.'), n);
        speakEn(s.prompt);
      });
    },
  };

  // a knowledge scroll: the passage again, with its page; it goes into the archive and counts towards Knowledge Seeker
  async function takeScroll(id) {
    const src = SOURCES[id];
    if (!saved.scrolls.includes(id)) saved.scrolls.push(id);
    addArchive(id); draw(); onSave?.({});
    await card({ kicker: 'Knowledge scroll', text: src.en, src, reported: src.class === 'reported', extra: 'Added to your Knowledge Archive.' });
    if (allScrolls.every((x) => saved.scrolls.includes(x))) award('seeker');
  }

  const score = { order: 0, quiz: null };
  async function go() {
    const start = Math.min(saved.step ?? 0, ep.steps.length - 1);
    // when resuming, set the scene and the stage from the last ones before the saved step
    if (start > 0) {
      const before = [...ep.steps.slice(0, start)].reverse();
      const sc = before.find((s) => s.do === 'scene'); if (sc) await run.scene(sc);
      const st = before.find((s) => s.do === 'stage'); if (st) stageEl.textContent = `Stage ${st.id} · ${STAGES[st.id]}`;
    }
    for (let i = start; i < ep.steps.length && !stopped; i++) {
      const s = ep.steps[i];
      if (TEST) { root.dataset.step = s.do; root.dataset.index = String(i); }
      await run[s.do](s);
      if (stopped) return;
      onStep?.(i + 1);
    }
    if (!stopped) onDone?.({ quiz: score.quiz, order: score.order, lights, scrolls: saved.scrolls.length, of: allScrolls.length });
  }
  go();
  function stop() { stopped = true; hush(); world?.dispose(); root.replaceChildren(); if (TEST) delete window.__sq; }
  return { stop, world, test: run };
}
