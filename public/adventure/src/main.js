// Ta'aleem Adventure v1.1 — the game shell: one 3D canvas, the screens over it, and the loop.
import { createRenderer, disposeTree, THREE } from './engine/renderer.js';
import { save, persist, isOpen, isDone, nextStage, recordStage, starsAvailable, buy, toggleEquip, resetAll } from './engine/save.js';
import { input, attachSwipe, attachLook, attachStick, attachButtons, clearActions } from './engine/input.js';
import { sfx, unlockAudio } from './engine/audio.js';
import { REGIONS, STAGES, LESSONS, QUESTIONS, STORIES, LOOK, GEAR, TEAM, hakimLines } from './content.js';
import { hakim as speakHakim, stopHakim, listen, hearPhrase, hearAnswer, canRecite, canHearEnglish, warmRecitation, PHRASES } from './engine/voice.js';
import { online, onClass, here, sendRun } from './engine/online.js';
import { tokenize } from '../vendor/qaaf/recite.mjs';
import { createRunner } from './modes/runner.js';
import { createExplore } from './modes/explore.js';
import { createArena } from './modes/arena.js';
import { createStory, createBackdrop, createDressingRoom } from './modes/scenes.js';

const $ = (id) => document.getElementById(id);
const canvas = $('world');
const R = createRenderer(canvas);
const camera = R.camera;

// ── the loop ──────────────────────────────────────────────────────
let mode = null, paused = false, last = performance.now(), clock = 0, shake = 0;
function setMode(m) {
  const old = mode;
  mode = m;
  if (old && old.scene !== m?.scene) { old.dispose?.(); disposeTree(old.scene); }
  clock = 0;
}
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (mode && !paused) {
    clock += dt;
    mode.update(dt, clock);
    if (shake > 0 && save.settings.motion) { shake -= dt; camera.position.x += (Math.random() - 0.5) * shake; camera.position.y += (Math.random() - 0.5) * shake; }
    R.watch(dt);
  }
  if (mode) R.renderer.render(mode.scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ── screens ───────────────────────────────────────────────────────
const SCREENS = ['title', 'map', 'dress', 'play', 'story'];
function show(id) {
  for (const s of SCREENS) $(s).classList.toggle('on', s === id);
  document.body.dataset.screen = id;
  stats();
}
function stats() {
  const done = STAGES.filter((s) => isDone(s.id)).length;
  document.querySelectorAll('[data-stat]').forEach((el) => {
    const k = el.dataset.stat;
    el.textContent = k === 'stars' ? save.stars : k === 'xp' ? save.xp : k === 'done' ? `${done}/${STAGES.length}` : k === 'avail' ? starsAvailable() : '';
  });
}
document.querySelectorAll('[data-back]').forEach((b) => b.addEventListener('click', () => { sfx.click(); goTitle(); }));

function goTitle() {
  const st = nextStage(), region = REGIONS.find((r) => r.id === st.region);
  setMode(createBackdrop(ctx, region.env));
  sfx.pad(region.env);
  show('title');
  here('', 'home');
  $('go-continue').textContent = Object.keys(save.stages).length ? `Continue: ${st.name} ➜` : 'Start the adventure ➜';
}
$('go-continue').addEventListener('click', () => { unlockAudio(); sfx.click(); launch(nextStage()); });
$('go-map').addEventListener('click', () => { unlockAudio(); sfx.click(); openMap(); });
$('go-dress').addEventListener('click', () => { unlockAudio(); sfx.click(); openDress(); });
$('go-how').addEventListener('click', () => { sfx.click(); howTo(); });
$('go-settings').addEventListener('click', () => { sfx.click(); settings(); });

// ── the journey map ───────────────────────────────────────────────
const MODE_ICON = { run: '🏃', explore: '🧭', arena: '⚖' };
const MODE_NAME = { run: '3D RUN', explore: 'EXPLORE & GATES', arena: 'FRIENDLY ARENA' };
const EMBLEM = { sunlit: ['☀', '#d9a96b'], garden: ['❋', '#5f9a55'], caves: ['◆', '#4d4a7a'], mountain: ['▲', '#8fa3bd'], valley: ['☂', '#5a5f86'], harbour: ['✦', '#3b4a8a'] };
let picked = null;
function openMap() {
  const ns = nextStage();
  picked ??= ns.id;
  const region = REGIONS.find((r) => r.id === STAGES.find((s) => s.id === picked).region);
  setMode(createBackdrop(ctx, region.env));
  renderMap();
  show('map');
  here('', 'map');
}
function renderMap() {
  const box = $('regions'); box.replaceChildren();
  for (const reg of REGIONS) {
    const stages = STAGES.filter((s) => s.region === reg.id);
    const open = stages.some((s) => isOpen(s.id));
    const el = document.createElement('article'); el.className = 'region' + (open ? '' : ' locked');
    const [sym, col] = EMBLEM[reg.id] ?? ['✦', '#3b4a8a'];
    el.innerHTML = `<div class="emblem" style="background:linear-gradient(160deg, ${col}, #0f2a36)">${sym}</div><div><h3>${reg.name}</h3><p>${reg.tagline}</p><div class="nodes"></div></div>`;
    const nodes = el.querySelector('.nodes');
    for (const s of stages) {
      const b = document.createElement('button');
      const stars = save.stages[s.id]?.stars ?? 0;
      b.className = 'node' + (isDone(s.id) ? ' done' : '');
      b.disabled = !isOpen(s.id);
      b.setAttribute('aria-pressed', String(picked === s.id));
      b.innerHTML = `<span class="ic">${isDone(s.id) ? '✓' : MODE_ICON[s.mode]}</span><span>${s.name}<small>${isDone(s.id) ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : MODE_NAME[s.mode]}</small></span>`;
      b.addEventListener('click', () => { sfx.click(); picked = s.id; renderMap(); });
      nodes.append(b);
    }
    box.append(el);
  }
  const s = STAGES.find((x) => x.id === picked), reg = REGIONS.find((r) => r.id === s.region);
  $('b-region').textContent = reg.name.toUpperCase();
  $('b-name').textContent = s.name;
  $('b-mode').textContent = `${MODE_ICON[s.mode]} ${MODE_NAME[s.mode]}`;
  $('b-topic').textContent = s.topic ? `Topic: ${s.topic}` : '';
  $('b-goal').textContent = s.goal;
  const rec = save.stages[s.id];
  $('b-best').textContent = rec ? `Best: ${'★'.repeat(rec.stars)}${'☆'.repeat(3 - rec.stars)}` : '';
  $('b-play').disabled = !isOpen(s.id);
  $('b-play').onclick = () => { unlockAudio(); sfx.click(); launch(s); };
}

// ── the dressing room ─────────────────────────────────────────────
let dress = null;
function openDress() {
  dress = createDressingRoom(ctx);
  setMode(dress);
  renderDress();
  show('dress');
}
document.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('[data-tab]').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
  $('tab-look').hidden = b.dataset.tab !== 'look'; $('tab-gear').hidden = b.dataset.tab !== 'gear';
  sfx.click();
}));
function renderDress() {
  const look = $('tab-look'); look.replaceChildren();
  const group = (title, items, key, render) => {
    const d = document.createElement('div'); d.className = 'opt';
    d.innerHTML = `<h4>${title}</h4><div class="${render === 'sw' ? 'swatches' : 'chips'}"></div>`;
    const row = d.firstElementChild.nextElementSibling;
    items.forEach((it, i) => {
      const b = document.createElement('button'); b.type = 'button';
      b.className = render === 'sw' ? 'sw' : 'chip';
      if (render === 'sw') { b.style.background = it; b.setAttribute('aria-label', `${title} ${i + 1}`); } else b.textContent = it.name;
      b.setAttribute('aria-pressed', String(save.look[key] === i));
      b.addEventListener('click', () => { save.look[key] = i; persist(); sfx.click(); dress.rebuild(); renderDress(); });
      row.append(b);
    });
    look.append(d);
  };
  group('SKIN TONE', LOOK.skin, 'skin', 'sw');
  group('CLOTHES', LOOK.outfit, 'outfit', 'sw');
  group('SASH & DETAILS', LOOK.accent, 'accent', 'sw');
  group('HEADWEAR', LOOK.head, 'head', 'chip');
  group('STYLE', LOOK.style, 'style', 'chip');

  const gear = $('tab-gear'); gear.replaceChildren();
  const intro = document.createElement('p'); intro.className = 'fine'; intro.style.margin = '0 0 10px';
  intro.textContent = `Stars are earned by playing stages (up to 3 each). You have ★ ${starsAvailable()} to spend. Gear is just for fun — it never changes what the lessons say.`;
  gear.append(intro);
  for (const g of GEAR) {
    const owned = save.owned.includes(g.id), on = save.equipped.includes(g.id);
    const d = document.createElement('div'); d.className = 'gear' + (on ? ' on' : '');
    d.innerHTML = `<b>${g.name}</b><p>${g.text}</p>`;
    const b = document.createElement('button'); b.className = 'btn small' + (owned ? '' : ' primary');
    b.textContent = owned ? (on ? 'Wearing ✓' : 'Wear') : `★ ${g.cost}`;
    b.disabled = !owned && starsAvailable() < g.cost;
    b.addEventListener('click', () => {
      if (owned) toggleEquip(g.id); else if (buy(g.id)) sfx.win();
      sfx.click(); dress.rebuild(); renderDress(); stats();
    });
    d.append(b); gear.append(d);
  }
  stats();
}

// ── playing a stage ───────────────────────────────────────────────
let current = null;
function launch(stage) {
  current = stage;
  const region = REGIONS.find((r) => r.id === stage.region);
  const first = STAGES.find((s) => s.region === region.id).id === stage.id;
  const then = () => (stage.story && !save.seen.includes(stage.story) ? playStory(stage.story, () => startStage(stage)) : startStage(stage));
  if (first && !save.seen.includes(region.story)) { playStory(region.story, then); return; }
  then();
}
function startStage(stage) {
  current = stage;
  const region = REGIONS.find((r) => r.id === stage.region);
  closeDialog(); paused = false; clearActions(); resetHud();
  const make = { run: createRunner, explore: createExplore, arena: createArena }[stage.mode];
  stopHakim(); cancelListening();
  if (save.settings.mic && (stage.cfg.storm || stage.cfg.cave || stage.mode === 'run')) warmRecitation();
  setMode(make(ctx, stage, region));
  sfx.pad(region.env);
  show('play');
  here(stage.id, 'playing');
  if (stage.mode !== 'run') setTimeout(() => ctx.hakim(`st-${stage.id}`), 700);   // a run greets in its start card
}

function playStory(id, then) {
  const story = STORIES[id];
  storyThen = () => { if (!save.seen.includes(id)) { save.seen.push(id); persist(); } then(); };
  setMode(createStory(ctx, story, id));
  sfx.pad(story.env);
  show('story');
}
let storyThen = null;
$('s-skip').addEventListener('click', () => { sfx.click(); stopHakim(); mode?.skip?.(); });

// ── the HUD ───────────────────────────────────────────────────────
function resetHud() {
  for (const id of ['h-motes', 'h-found', 'h-hearts', 'h-score', 'h-rival', 'h-timer', 'h-compass', 'h-wind', 'h-banner', 'h-prompt', 'h-shield', 'chip', 'startcard']) $(id).hidden = true;
  $('toasts').replaceChildren();
  $('h-prog').style.width = '0';
}
const hudState = {};
function hud(o) {
  Object.assign(hudState, o);
  if (o.title) $('h-title').textContent = o.title;
  if (o.progress !== undefined) $('h-prog').style.width = `${Math.round(o.progress * 100)}%`;
  if (o.motes) { $('h-motes').hidden = false; $('h-motes').innerHTML = `✦ <b>${o.motes[0]}</b><span class="dim">/${o.motes[1]}</span>`; }
  if (o.found) { $('h-found').hidden = false; $('h-found').innerHTML = `⌖ <b>${o.found[0]}</b><span class="dim">/${o.found[1]}</span>`; }
  if (o.hearts) { const h = $('h-hearts'); h.hidden = false; h.className = 'heart'; h.textContent = '♥'.repeat(o.hearts[0]) + '♡'.repeat(Math.max(0, o.hearts[1] - o.hearts[0])); h.setAttribute('aria-label', `${o.hearts[0]} of ${o.hearts[1]} tries left`); }
  if (o.score) { $('h-score').hidden = false; $('h-score').innerHTML = `◎ <b>${o.score[0]}</b><span class="dim">/${o.score[1]}</span>`; }
  if (o.rival !== undefined) { $('h-rival').hidden = false; $('h-rival').innerHTML = `friend <b>${o.rival}</b>`; }
  if (o.timer !== undefined) { $('h-timer').hidden = false; $('h-timer').innerHTML = `⏱ <b>${Math.ceil(o.timer)}</b>`; }
  if (o.compass !== undefined) { const c = $('h-compass'); c.hidden = false; c.firstElementChild.style.transform = `rotate(${(-o.compass * 180) / Math.PI - 90}deg)`; }
  if (o.wind !== undefined) { const w = $('h-wind'); w.hidden = false; w.firstElementChild.style.transform = `rotate(${(-o.wind * 180) / Math.PI + 90}deg)`; }
  if (o.dash !== undefined) $('dashbtn').classList.toggle('cool', o.dash > 0);
  if (o.shield !== undefined) { const s = $('h-shield'); s.hidden = !o.shield; s.innerHTML = `🛡 <b>${o.shield}</b>`; s.setAttribute('aria-label', `Shield: ${o.shield}`); }
}
function toast(text, kind = '', ms = 2600, ref = '') {
  const t = document.createElement('div'); t.className = 'toast ' + kind;
  t.textContent = text;
  if (ref) { const s = document.createElement('small'); s.textContent = `Source: ${ref}`; t.append(s); }
  const box = $('toasts'); box.append(t);
  while (box.children.length > 3) box.firstElementChild.remove();
  setTimeout(() => t.remove(), ms);
}
function banner(q, sub) {
  const b = $('h-banner');
  if (!q) { b.hidden = true; return; }
  b.querySelector('b').textContent = q; b.querySelector('em').textContent = sub ?? ''; b.hidden = false;
}
let promptAct = null;
function prompt(text) {
  const p = $('h-prompt');
  if (!text) { p.hidden = true; return; }
  if (p.dataset.t !== text) { p.dataset.t = text; p.innerHTML = `${text}<kbd>E</kbd>`; }
  p.hidden = false;
}
$('h-prompt').addEventListener('click', () => input.actions.push('act'));
function controls(kind) {
  document.querySelectorAll('[data-ctl]').forEach((c) => (c.hidden = !(c.dataset.ctl === kind || (c.dataset.ctl === 'stick' && kind !== 'run'))));
  document.querySelectorAll('[data-only]').forEach((b) => (b.hidden = b.dataset.only !== kind));
}
attachSwipe(canvas); attachLook(canvas); attachStick($('stick'), $('knob')); attachButtons($('play'));
$('h-pause').addEventListener('click', () => pause());

// ── dialogs ───────────────────────────────────────────────────────
const dlg = $('dlg'), veil = $('veil');
let onClose = null;
function dialog(html, { pauseGame = true, close } = {}) {
  dlg.innerHTML = html; veil.hidden = false; onClose = close ?? null;
  if (pauseGame) paused = true;
  setTimeout(() => dlg.querySelector('button')?.focus(), 30);
}
function closeDialog() { veil.hidden = true; dlg.innerHTML = ''; const f = onClose; onClose = null; if (f) f(); }
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !veil.hidden && onClose !== 'locked') { e.stopPropagation(); } });
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function card(title, text, foot) {
  sfx.discover();
  dialog(`<p class="gate-head">✦ DISCOVERY</p><h2>${esc(title)}</h2><p>${esc(text)}</p>${foot ? `<p class="fine">${esc(foot)}</p>` : ''}<button class="btn primary" id="c-ok">Carry on ➜</button>`);
  $('c-ok').onclick = () => { sfx.click(); closeDialog(); paused = false; last = performance.now(); };
}

// A knowledge gate: one or more questions in turn. A wrong answer explains, then offers another try.
function ask(qids, done) {
  let i = 0, firstTry = true;
  const one = () => {
    const q = QUESTIONS[qids[i]];
    const order = q.a.map((_, k) => k).sort(() => Math.random() - 0.5);
    dialog(`<p class="gate-head">⛩ KNOWLEDGE GATE ${qids.length > 1 ? `· QUESTION ${i + 1} OF ${qids.length}` : ''}</p><h2>${esc(q.q)}</h2>
      <div class="answers">${order.map((k) => `<button data-k="${k}">${esc(q.a[k])}</button>`).join('')}</div>
      ${canHearEnglish() && save.settings.mic ? '<button class="btn small" id="say-it">🎤 Say my answer</button>' : ''}<div id="fb"></div>`);
    $('say-it') && ($('say-it').onclick = async () => {
      const b = $('say-it'); b.disabled = true; b.textContent = '🎤 Listening…';
      const k = await hearAnswer(order.map((i) => q.a[i]), 8000);
      if (k >= 0) dlg.querySelectorAll('[data-k]')[k]?.click(); else { b.disabled = false; b.textContent = '🎤 Didn’t catch that — try again'; }
    });
    dlg.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', () => {
      const k = Number(b.dataset.k), right = k === q.c;
      dlg.querySelectorAll('[data-k]').forEach((x) => (x.disabled = true));
      b.classList.add(right ? 'right' : 'wrong');
      if (right) {
        sfx.right();
        $('fb').innerHTML = `<div class="feedback"><p><b>That’s right!</b> ${esc(q.why)}</p><p class="src">Source: ${esc(q.ref)}</p></div><button class="btn primary" id="fb-go" style="margin-top:10px">${i + 1 < qids.length ? 'Next question ➜' : 'Open the gate ➜'}</button>`;
        $('fb-go').onclick = () => { sfx.click(); i++; if (i < qids.length) one(); else { closeDialog(); paused = false; last = performance.now(); done(firstTry); } };
      } else {
        firstTry = false; sfx.wrong();
        $('fb').innerHTML = `<div class="feedback warm"><p><b>Not quite — and that’s how we learn.</b> ${esc(q.why)}</p><p class="src">Source: ${esc(q.ref)}</p></div><button class="btn" id="fb-again" style="margin-top:10px">Try again</button>`;
        $('fb-again').onclick = () => { sfx.click(); one(); };
      }
      dlg.querySelector('#fb button')?.focus();
    }));
  };
  one();
}

function pause() {
  if (!$('play').classList.contains('on') || !veil.hidden) return;
  dialog(`<h2>Paused</h2><p>Take a breath. Your journey will be here when you return.</p>
    <div class="row"><button class="btn primary" id="p-go">Resume</button><button class="btn" id="p-re">Restart stage</button><button class="btn ghost" id="p-map">Journey map</button><button class="btn ghost" id="p-set">Settings</button></div>`);
  $('p-go').onclick = () => { closeDialog(); paused = false; last = performance.now(); };
  $('p-re').onclick = () => { closeDialog(); startStage(current); };
  $('p-map').onclick = () => { closeDialog(); paused = false; openMap(); };
  $('p-set').onclick = () => settings(true);
}

function finish(res) {
  const stage = current, lesson = LESSONS[stage.lesson];
  cancelListening();
  if (res.run) sendRun(res.run);   // the class team goal, and a ghost for classmates (when playing from the Classroom)
  const gained = recordStage(stage.id, res.stars, res.xp);
  const nextIdx = STAGES.findIndex((s) => s.id === stage.id) + 1;
  const next = STAGES[nextIdx];
  setTimeout(() => {
    dialog(`<p class="gate-head">✦ MISSION REPORT</p><h2>${esc(stage.name)} — complete!</h2>
      <div class="stars" aria-label="${res.stars} of 3 stars">${[0, 1, 2].map((k) => `<span class="${k < res.stars ? 'on' : ''}">★</span>`).join('')}</div>
      <div class="nums">${res.lines.map(([v, l]) => `<div><b>${esc(v)}</b><small>${esc(l)}</small></div>`).join('')}<div><b>+${res.xp}</b><small>XP</small></div></div>
      ${gained ? `<p class="fine" style="text-align:center">+${gained} new star${gained > 1 ? 's' : ''} — spend stars on gear in “Explorer &amp; gear”.</p>` : ''}
      <div class="lesson"><span class="kind">${esc(lesson.kind.toUpperCase())}</span><h3>${esc(lesson.title)}</h3><p>${esc(lesson.text)}</p><p class="src">${esc(lesson.ref)}</p></div>
      <p class="fine">Stars and XP are game rewards only — they never measure faith or worth.</p>
      <div class="row">${next ? `<button class="btn primary" id="r-next">Next: ${esc(next.name)} ➜</button>` : stage.finaleStory ? '<button class="btn primary" id="r-fin">The festival of lights ➜</button>' : ''}<button class="btn" id="r-again">Play again</button><button class="btn ghost" id="r-map">Journey map</button></div>`, { pauseGame: false });
    $('r-next') && ($('r-next').onclick = () => { closeDialog(); launch(next); });
    $('r-fin') && ($('r-fin').onclick = () => { closeDialog(); playStory(stage.finaleStory, () => { goTitle(); dialog(`<h2>Journey complete</h2><p>You have crossed all five lands. Replay any stage for more stars, try on new gear, and keep learning — “My Lord, increase me in knowledge.” (Qur’an 20:114)</p><button class="btn primary" id="e-ok">Home</button>`, { pauseGame: false }); $('e-ok').onclick = closeDialog; }); });
    $('r-again').onclick = () => { closeDialog(); startStage(stage); };
    $('r-map').onclick = () => { closeDialog(); picked = next?.id ?? stage.id; openMap(); };
  }, 600);
}
function fail(title, msg) {
  setTimeout(() => {
    dialog(`<h2>${esc(title)}</h2><p>${esc(msg)}</p><div class="row"><button class="btn primary" id="f-re">Try again</button><button class="btn ghost" id="f-map">Journey map</button></div>`, { pauseGame: false });
    $('f-re').onclick = () => { closeDialog(); startStage(current); };
    $('f-map').onclick = () => { closeDialog(); openMap(); };
  }, 700);
}

function howTo() {
  dialog(`<h2>How to play</h2><div class="howgrid">
    <div><b>🏃 3D runs</b><p>Change lanes ◀ ▶ (arrow keys / A D or swipe). Jump ▲ (Up / W / Space or swipe up) over crates and gaps. Slide ▼ (Down / S or swipe down) under beams. At an <b>answer arch</b>, run through the arch with the right answer. At a fork, your lane picks the path.</p></div>
    <div><b>🧭 Exploring</b><p>Walk with W A S D / arrows or the stick. Drag to turn the camera. Look for the golden rings — each is a landmark. Press E (or ✋) to look, and to answer a knowledge gate. Space hops.</p></div>
    <div><b>⚖ Friendly arena</b><p>Move with W A S D / arrows or the stick; Shift or ⚡ dashes. Push orbs, dodge rolling stones, step on lit stones, carry lanterns. Slip off the edge and you float back.</p></div>
    <div><b>🎤 Your voice</b><p>Say <b>Bismillah</b> to start a run (the motes gather to you), <b>Alhamdulillah</b> after a stumble (your heart comes back) and <b>SubhanAllah</b> when it appears (a rush of motes). In the storm, recite <b>Ayat al-Kursi</b> at the shelter for your bubble shield. Questions can be answered out loud.</p></div>
    <div><b>👥 Your class</b><p>Opened from the Ta’aleem Classroom, you see classmates at your level who are playing, run alongside their best runs, and fill the weekly class goal together.</p></div>
    <div><b>⭐ Stars &amp; gear</b><p>Up to 3 stars per stage. Spend them on gear in “Explorer &amp; gear”. Stars and XP are game rewards only — they never measure faith or worth.</p></div>
    <div><b>📖 About the lessons</b><p>Each lesson says whether it comes from the Qur’an, a hadith, history, or is a general value, with its reference. No prophet is shown or voiced. These are starter materials: please review them with a qualified teacher.</p></div>
  </div><button class="btn primary" id="h-ok">Got it</button>`, { pauseGame: false });
  $('h-ok').onclick = closeDialog;
}

function settings(fromPause) {
  const s = save.settings;
  dialog(`<h2>Settings</h2>
    <label class="set">Graphics quality <select id="st-q"><option value="auto">Automatic</option><option value="high">High (shadows)</option><option value="medium">Medium</option><option value="low">Low (older phones)</option></select></label>
    <label class="set">Sound effects <input type="checkbox" id="st-s"></label>
    <label class="set">Soft background tones <input type="checkbox" id="st-m"></label>
    <label class="set">Screen shake <input type="checkbox" id="st-sh"></label>
    <label class="set">Ustadh Hakim’s voice <input type="checkbox" id="st-v"></label>
    <label class="set">Microphone (recitation and Bismillah, Alhamdulillah, SubhanAllah) <input type="checkbox" id="st-mic"></label>
    <label class="set">Answer questions out loud (English) <input type="checkbox" id="st-sp"></label>
    <p class="fine">Arabic recitation and phrases are heard by Ta’aleem’s own model, on this device: no audio leaves it. English answers out loud use the browser’s speech service, which sends the audio to Google (Chrome) or Apple (Safari). Switch that off above if you prefer.</p>
    <p class="fine">Progress is saved only in this browser. No account, no data sent anywhere, nothing recorded.</p>
    <div class="row"><button class="btn primary" id="st-ok">Done</button><button class="btn ghost" id="st-reset">Reset progress</button></div>`, { pauseGame: !!fromPause });
  $('st-q').value = s.quality; $('st-s').checked = s.sound; $('st-m').checked = s.music; $('st-sh').checked = s.motion;
  $('st-v').checked = s.voice; $('st-mic').checked = s.mic; $('st-sp').checked = s.speech;
  $('st-v').onchange = (e) => { s.voice = e.target.checked; persist(); if (!s.voice) stopHakim(); };
  $('st-mic').onchange = (e) => { s.mic = e.target.checked; persist(); };
  $('st-sp').onchange = (e) => { s.speech = e.target.checked; persist(); };
  $('st-q').onchange = (e) => { s.quality = e.target.value; persist(); R.applyQuality(); };
  $('st-s').onchange = (e) => { s.sound = e.target.checked; persist(); sfx.pad(document.body.dataset.screen === 'title' ? 'desert' : null); };
  $('st-m').onchange = (e) => { s.music = e.target.checked; persist(); sfx.pad(e.target.checked ? 'desert' : null); };
  $('st-sh').onchange = (e) => { s.motion = e.target.checked; persist(); };
  $('st-ok').onclick = () => { closeDialog(); if (fromPause) pause(); };
  $('st-reset').onclick = () => { if (confirm('Reset all progress, stars and gear on this device?')) resetAll(); };
}

// ── Ustadh Hakim's subtitles and voice ───────────────────────────
const LINES = hakimLines();
let subT = 0;
function hakimSay(key, text) {
  const line = text ?? LINES[key];
  if (!line) return Promise.resolve();
  if (!$('story').classList.contains('on')) {   // stories show their own caption
    const sb = $('sub'); sb.querySelector('p').textContent = line; sb.hidden = false;
    clearTimeout(subT); subT = setTimeout(() => (sb.hidden = true), Math.max(3500, line.length * 70));
  }
  return speakHakim(key, line);
}

// ── listening: one thing at a time ────────────────────────────────
let listening = null;
function cancelListening() { listening?.cancel?.(); listening = null; $('chip').hidden = true; }
// a short phrase (Bismillah, Alhamdulillah, SubhanAllah), shown as a chip; resolves true when it was said
function listenPhrase(id, hint) {
  if (!save.settings.mic || listening) return Promise.resolve(false);
  const ph = PHRASES[id], chip = $('chip');
  chip.innerHTML = `<span class="mic">🎤</span><span><b lang="ar" dir="rtl">${ph.ar}</b> Say “${ph.say}”<small>${esc(hint ?? ph.en)}</small></span>`;
  chip.hidden = false; chip.className = 'chip-say';
  let cancelled = false;
  const job = { cancel: () => { cancelled = true; } };
  listening = job;
  return hearPhrase(id, 7500, (stt) => { if (stt === 'listening') chip.classList.add('live'); }).then((ok) => {
    if (listening === job) { listening = null; chip.hidden = true; }
    if (ok && !cancelled) { sfx.right(); chip.hidden = true; }
    return ok && !cancelled;
  });
}
// an English answer out loud (the answer arches); resolves with the option's index or -1
function listenAnswer(options) {
  if (!save.settings.mic || !canHearEnglish() || listening) return Promise.resolve(-1);
  const job = { cancel: () => {} }; listening = job;
  $('h-banner').classList.add('live');
  return hearAnswer(options, 9000).then((k) => { if (listening === job) listening = null; $('h-banner').classList.remove('live'); return k; });
}

// the start of a run: "Say Bismillah to begin" (or tap). Resolves true when Bismillah was said.
function startPrompt() {
  return new Promise((resolve) => {
    const card = $('startcard'); card.hidden = false;
    let done = false;
    const go = (said) => { if (done) return; done = true; card.hidden = true; cancelListening(); removeEventListener('keydown', key); resolve(said); };
    const key = (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); go(false); } };
    addEventListener('keydown', key);
    $('sc-go').onclick = () => { sfx.click(); go(false); };
    $('sc-mic').hidden = true;
    hakimSay(`st-${current.id}`).then(() => { if (!done) return hakimSay('say-bismillah'); }).then(() => {
      if (done || !save.settings.mic) return;
      canRecite().then((ok) => {
        if (!ok || done) return;
        $('sc-mic').hidden = false;
        const once = () => listenPhrase('bismillah', 'Say it to begin').then((said) => { if (said) { hakimSay('bismillah-yes'); go(true); } else if (!done) $('sc-mic').textContent = '🎤 Didn’t hear it — tap to try again'; });
        $('sc-mic').onclick = () => { $('sc-mic').textContent = '🎤 Listening…'; once(); };
        once();
      });
    });
  });
}

// ── recitation: Ayat al-Kursi at the storm shelters, the du'a for parents at the cave ──
const RECITE = {
  kursi: { title: 'Ayat al-Kursi', ref: 'Al-Baqarah 2:255', key: '2:255', audio: 'https://everyayah.com/data/Husary_128kbps/002255.mp3',
    ar: 'ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَـٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ',
    prompt: 'kursi-prompt', intro: 'Recite it from beginning to end. Each word lights up as you say it. Your shield grows with every word.' },
  parents: { title: 'The du’a for parents', ref: 'Al-Isra 17:24', key: null, audio: 'https://everyayah.com/data/Husary_128kbps/017024.mp3',
    ar: 'رَّبِّ ٱرْحَمْهُمَا كَمَا رَبَّيَانِى صَغِيرًا', en: '“My Lord, have mercy on them as they raised me when I was small.”',
    prompt: 'parents-prompt', intro: 'Recite the du’a for your parents, and the rock will roll from the cave.' },
};
function recite(kind) {
  const R = RECITE[kind];
  const words = tokenize(R.ar, R.key, { raw: true });
  return new Promise((resolve) => {
    dialog(`<p class="gate-head">🎤 RECITE · ${esc(R.ref)}</p><h2>${esc(R.title)}</h2><p>${esc(R.intro)}</p>
      <p class="recite" lang="ar" dir="rtl">${words.map((w, i) => `<span data-w="${i}">${esc(w.display)}</span>`).join(' ')}</p>
      ${R.en ? `<p class="fine" style="text-align:center">${esc(R.en)}</p>` : ''}
      <div class="rbar"><span id="rc-bar"></span></div><p class="fine" id="rc-state"></p>
      <div class="row"><button class="btn primary" id="rc-go">🎤 Start reciting</button><button class="btn" id="rc-hear">▶ Listen first</button><button class="btn ghost" id="rc-done" hidden>I have finished</button><button class="btn ghost" id="rc-skip">I can’t use a microphone</button></div>`);
    let l = null, audio = null, settled = false;
    const finishWith = (res) => { if (settled) return; settled = true; l?.stop(); audio?.pause(); closeDialog(); paused = false; last = performance.now(); resolve(res); };
    const spans = [...dlg.querySelectorAll('[data-w]')];
    $('rc-hear').onclick = () => { sfx.click(); audio?.pause(); audio = new Audio(R.audio); audio.play().catch(() => {}); $('rc-hear').textContent = '▶ Playing…'; audio.onended = () => ($('rc-hear').textContent = '▶ Listen again'); };
    $('rc-skip').onclick = () => {
      // no microphone: listen along with the reciter; the reward is smaller, and the game says so kindly
      sfx.click(); $('rc-state').textContent = 'Listen along with the reciter, and say it with him quietly.';
      const skipped = () => finishWith({ read: 0, missed: 0, total: words.length, skipped: true });
      audio?.pause(); audio = new Audio(R.audio);
      audio.onended = skipped; audio.onerror = () => setTimeout(skipped, 1500);
      audio.play().catch(() => setTimeout(skipped, 1500));   // no sound here (offline, or blocked): carry on
      setTimeout(skipped, 75000);
      $('rc-skip').hidden = true; $('rc-go').hidden = true;
    };
    $('rc-go').onclick = () => {
      sfx.click(); audio?.pause();
      $('rc-go').hidden = true; $('rc-done').hidden = false; $('rc-state').textContent = 'Getting the listener ready… (the first time can take a minute)';
      let read = 0;
      l = listen(words.map((w) => w.plain), {
        onState: (stt) => {
          if (stt === 'listening') $('rc-state').textContent = 'Listening — recite now.';
          if (stt === 'unavailable') { $('rc-state').textContent = 'Recitation is heard on the Ta’aleem site (taaleem.ca). Here, listen along instead.'; $('rc-skip').click(); }
          if (stt === 'denied') { $('rc-state').textContent = 'The microphone is blocked. Allow it in the browser, or listen along instead.'; $('rc-go').hidden = false; $('rc-done').hidden = true; }
        },
        onWord: (i, kind) => {
          spans[i]?.classList.add(kind === 'missed' ? 'miss' : kind === 'read' ? 'ok' : 'soft');
          if (kind !== 'missed') read++;
          $('rc-bar').style.width = `${Math.round(((i + 1) / words.length) * 100)}%`;
        },
      });
      l.finished.then((res) => finishWith(res));
    };
    $('rc-done').onclick = () => { sfx.click(); l?.stop(); };
    hakimSay(R.prompt);
  });
}

// ── the class: who is playing at my level, and the team goal ──────
const STAGE_NAME = Object.fromEntries(STAGES.map((s) => [s.id, s.name]));
onClass((o) => {
  for (const box of document.querySelectorAll('[data-class]')) {
    if (!o.on) { box.innerHTML = '<p class="fine">Open the game from your Ta’aleem Classroom to see classmates at your level and play for your class team.</p>'; continue; }
    const others = o.players.filter((p) => !p.me);
    const team = o.team, pct = team ? Math.min(100, Math.round((team.total / TEAM.weekly) * 100)) : 0;
    box.innerHTML = `<p class="kicker">${esc(o.className || 'YOUR CLASS')} · ONLINE NOW</p>
      ${others.length ? `<ul class="mates">${others.map((p) => `<li><span class="dot" style="background:${LOOK.outfit[p.look?.outfit ?? 0]}"></span><b>${esc(p.name)}</b><small>${p.stage ? esc(STAGE_NAME[p.stage] ?? '') : p.doing === 'map' ? 'choosing a stage' : 'on the journey'}</small></li>`).join('')}</ul>` : '<p class="fine">No classmates playing right now. Your runs still count for the class!</p>'}
      ${team ? `<p class="kicker" style="margin-top:8px">TEAM GOAL · ${esc(TEAM.title.toUpperCase())}</p><div class="rbar"><span style="width:${pct}%"></span></div><p class="fine">${team.total} / ${TEAM.weekly} light motes this week, from ${team.players} classmate${team.players === 1 ? '' : 's'}${team.top?.length ? ` · top: ${team.top.slice(0, 3).map((t) => esc(t.name)).join(', ')}` : ''}</p>` : ''}`;
  }
  const n = o.on ? o.players.filter((p) => !p.me).length : 0;
  const m = $('h-mates'); m.hidden = !n; m.innerHTML = `👥 <b>${n}</b>`; m.title = `${n} classmate${n === 1 ? '' : 's'} playing`;
});

// ── what the modes can call ───────────────────────────────────────
const ctx = {
  camera, hud, toast, banner, prompt, controls, card, ask, finish, fail, pause,
  hakim: hakimSay, stopVoice: stopHakim, listenPhrase, listenAnswer, startPrompt, recite,
  canSpeak: () => save.settings.mic && canHearEnglish(),
  shake: (a) => { shake = Math.max(shake, a); },
  caption: (text, title) => { $('s-text').textContent = text; $('s-text').style.animation = 'none'; void $('s-text').offsetWidth; $('s-text').style.animation = ''; $('s-title').textContent = title ?? ''; },
  storyDone: () => { const f = storyThen; storyThen = null; f?.(); },
};

// keyboard pause, and the prompt key
addEventListener('keydown', (e) => { if ((e.key === 'Escape' || e.key === 'p') && $('play').classList.contains('on') && veil.hidden) { e.preventDefault(); } });

// a hook for automated testing, only with ?debug in the address
if (new URLSearchParams(location.search).has('debug')) window.__dbg = { get mode() { return mode; }, camera, play: (id) => startStage(STAGES.find((s) => s.id === id)), story: (id) => playStory(id, goTitle), dress: () => openDress(), map: () => openMap() };
// opened from the Ta'aleem Classroom: a way back to it
if (location.pathname.includes('/adventure/')) { const b = $('go-class'); b.hidden = false; b.style.display = 'inline-flex'; b.style.alignItems = 'center'; b.style.textDecoration = 'none'; }

// ── start ─────────────────────────────────────────────────────────
goTitle();
setTimeout(() => $('loading').classList.add('gone'), 300);
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
