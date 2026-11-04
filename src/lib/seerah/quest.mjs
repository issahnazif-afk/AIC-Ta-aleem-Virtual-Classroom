// The Seerah Quest runner: plays an episode's steps in the 3D world, with the narration, missions and
// knowledge challenge. History is always shown with its source (Ibn Kathir, al-Bidaya wa'l-Nihaya).
import SRC from '../../data/seerah/sources.json';
import { createWorld } from './world.mjs';
import { EPISODES } from './episodes.mjs';
import { audioUrl } from '../client.mjs';
import { narrate, hush as stopNarration } from '../narration.mjs';

const SOURCES = Object.fromEntries(SRC.passages.map((p) => [p.id, p]));
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const shuffle = (xs) => { const a = [...xs]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const TEST = typeof location !== 'undefined' && /[?&]test=1\b/.test(location.search);
export const cite = (p) => `al-Bidaya wa'l-Nihaya ${p.vol}/${p.page}`;

// the narrator: subtitles always; read aloud by the recorded narrator voice if the student keeps narration on
let narrator = true;
function speakEn(text) { if (narrator) narrate(text, { voice: 'seerah' }); }
const hush = () => stopNarration();

export function playEpisode(root, { n, quality = 'medium', reciter, saved = {}, onStep, onDone, onExit }) {
  const ep = EPISODES.find((e) => e.n === n);
  root.replaceChildren();
  root.className = 'sq-play';
  const canvas = el('canvas', 'sq-canvas');
  const hud = el('div', 'sq-hud');
  const title = el('div', 'sq-title'); title.append(el('b', null, `Episode ${ep.n} · ${ep.title}`), el('span', null, ep.place));
  const objective = el('div', 'sq-objective'); objective.hidden = true;
  const tools = el('div', 'sq-tools');
  const narr = el('button', 'sq-tool', 'Narration: on'); narr.type = 'button';
  narr.addEventListener('click', () => { narrator = !narrator; narr.textContent = `Narration: ${narrator ? 'on' : 'off'}`; if (!narrator) hush(); });
  const exit = el('button', 'sq-tool', 'Leave'); exit.type = 'button';
  tools.append(narr, exit);
  hud.append(title, objective, tools);
  const near = el('button', 'sq-near'); near.type = 'button'; near.hidden = true;
  const panel = el('div', 'sq-panel'); panel.hidden = true;
  const padEl = el('div', 'sq-pad');
  padEl.innerHTML = '<button data-f="1" aria-label="Forward">▲</button><button data-r="-1" aria-label="Left">◀</button><button data-f="-1" aria-label="Back">▼</button><button data-r="1" aria-label="Right">▶</button>';
  const loading = el('div', 'sq-loading', 'Preparing the valley of Makkah…');
  root.append(canvas, hud, near, panel, padEl, loading);

  let world, stopped = false;
  try { world = createWorld(canvas, { quality }); }
  catch (err) { loading.textContent = 'This computer could not start the 3D view (WebGL). Try another browser, or ask your teacher.'; return { stop() {} }; }
  padEl.querySelectorAll('button').forEach((b) => {
    const on = () => world.setPad(+b.dataset.f || 0, +b.dataset.r || 0), off = () => world.setPad(0, 0);
    b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off);
  });
  world.start();
  if (TEST) {   // a test hook: "tap" a hotspot by id
    const spots = {}, add = world.addHotspot;
    world.addHotspot = (o) => (spots[o.id] = add(o));
    window.__sq = { hit: (id) => world.onHotspot?.(spots[id] ?? { id }) };
  }
  setTimeout(() => loading.remove(), 400);
  exit.addEventListener('click', () => { stop(); onExit?.(); });

  // ── the panel: narration, choices, overlays ──
  function openPanel(cls) { panel.className = 'sq-panel ' + (cls || ''); panel.replaceChildren(); panel.hidden = false; world.lock(true); return panel; }
  function closePanel() { panel.hidden = true; panel.replaceChildren(); world.lock(false); hush(); }
  const nextBtn = (label = 'Continue') => { const b = el('button', 'btn btn-primary big sq-next', label); b.type = 'button'; return b; };
  function card({ kicker, title: t, text, src, reported }) {
    return new Promise((resolve) => {
      const p = openPanel(reported ? 'note' : '');
      if (kicker) p.append(el('p', 'sq-kicker', kicker));
      if (t) p.append(el('h2', 'sq-h', t));
      p.append(el('p', 'sq-text', text));
      if (src) {
        const c = el('p', 'sq-cite', `${reported ? 'Reported · the book marks this as uncertain or as an addition · ' : ''}${cite(src)}`);
        const show = el('button', 'sq-src', 'Show the source'); show.type = 'button';
        const ar = el('p', 'sq-ar', src.ar); ar.lang = 'ar'; ar.dir = 'rtl'; ar.hidden = true;
        show.addEventListener('click', () => { ar.hidden = !ar.hidden; show.textContent = ar.hidden ? 'Show the source' : 'Hide the source'; });
        p.append(c, show, ar);
      }
      const b = nextBtn(); b.addEventListener('click', () => { closePanel(); resolve(); });
      p.append(b); b.focus({ preventScroll: true });
      speakEn(text);
    });
  }
  const setObjective = (t) => { objective.hidden = !t; objective.textContent = t || ''; };

  // ── the steps ──
  const wells = {};
  const run = {
    async scene(s) { world.setTime(s.time); if (s.at) world.place(s.at[0], s.at[1], s.at[2], s.at[3]); await wait(150); },
    async fly(s) { await world.fly(s.shots); },
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
        const done = () => { world.removeHotspot(s.id); world.onHotspot = null; world.onNear = null; near.hidden = true; setObjective(''); resolve(); };
        world.onHotspot = (x) => { if (x === h) done(); };
        world.onNear = (x) => { near.hidden = !x; if (x) near.textContent = `Look closer: ${x.label}`; };
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
          if (x.p.right) { hs.forEach((k) => world.removeHotspot(k.p.id)); world.onNear = null; near.hidden = true; setObjective(''); resolve(); }
          else { world.removeHotspot(x.p.id); hs.splice(hs.indexOf(x), 1); world.onHotspot = visit; }
        };
        world.onHotspot = visit;
        world.onNear = (x) => { near.hidden = !x; if (x) near.textContent = `Look closer: ${x.label}`; };
        near.onclick = () => { const x = world.near(); if (x) visit(x); };
        if (TEST) root.dataset.target = s.spots.find((p) => p.right).id;
      });
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
          if (safe === s.n) { world.onHotspot = null; world.onNear = null; near.hidden = true; setTimeout(() => { setObjective(''); resolve(); }, 1200); }
        };
        world.onHotspot = send;
        world.onNear = (x) => { near.hidden = !x; if (x) near.textContent = `Lead them up: ${x.label}`; };
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

  const score = { order: 0, quiz: null };
  async function go() {
    const start = Math.min(saved.step ?? 0, ep.steps.length - 1);
    // when resuming, set the scene from the last scene step before the saved one
    if (start > 0) { const sc = [...ep.steps.slice(0, start)].reverse().find((s) => s.do === 'scene'); if (sc) await run.scene(sc); }
    for (let i = start; i < ep.steps.length && !stopped; i++) {
      const s = ep.steps[i];
      if (TEST) { root.dataset.step = s.do; root.dataset.index = String(i); }
      await run[s.do](s);
      if (stopped) return;
      onStep?.(i + 1);
    }
    if (!stopped) onDone?.({ quiz: score.quiz, order: score.order });
  }
  go();
  function stop() { stopped = true; hush(); world?.dispose(); root.replaceChildren(); }
  return { stop, world, test: run };
}
