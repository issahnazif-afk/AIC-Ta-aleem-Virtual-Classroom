// The Alif Ba games beyond Noor Lanterns. Each builds inside `stage` (the night courtyard screen)
// and reports through `ui`, like lanterns.mjs:
//   Rain of Mercy  · hear a sound, catch its raindrop before it reaches the garden (Lessons 4, 5, 7)
//   Mosaic Maker   · each right answer lays a tile of an eight-pointed star (Lessons 2, 3, 8, 12)
//   Date Baskets   · put each date (a Qur'an example) in the basket of its rule (Lessons 6, 9–11, 13–16)
//   String of Pearls · put the lines of a supplication in order (Lesson 17)
import { LEVEL_GAME } from './alifba.mjs';
import { phrase, speak, stopVoice } from './phrases.mjs';
import { glow, soft } from './ambience.mjs';
import { say, playUrl, stopSound } from './voice.mjs';
import { audioUrl } from './client.mjs';

export const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export const shuffle = (xs) => { const a = [...xs]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
// with ?test=1 in the address, the answer is marked on the page for the automated tests
const TEST = typeof location !== 'undefined' && /[?&]test=1\b/.test(location.search);
export const mark = (node, v) => { if (TEST) node.dataset.answer = String(v); };
export const pick = (xs, n, not = []) => shuffle(xs.filter((x) => !not.includes(x))).slice(0, n);

// play the reciter's ayah for a Qur'an example (refs look like "2:27")
export function playAyah(ref, reciter) {
  const [s, a] = ref.split(':').map(Number);
  return playUrl(audioUrl(reciter, s, a), 45000);
}

// What every game shares: rounds, first-try answers, praise, and the end.
export function round0({ level, gender, ui, rounds }) {
  const cfg = LEVEL_GAME[level] ?? LEVEL_GAME[1];
  const g = { cfg, n: rounds ?? cfg.rounds, round: 0, first: 0, score: 0, streak: 0, done: false, attempts: 0, practise: new Set(), t0: Date.now() };
  g.status = () => ui.status?.({ round: g.round, rounds: g.n, first: g.first, score: g.score, streak: g.streak, showScore: cfg.score });
  g.right = async (label) => {
    glow();
    const firstTry = g.attempts === 0;
    if (firstTry) { g.first++; g.streak++; } else g.streak = 0;
    if (cfg.score) g.score += firstTry ? 100 + 25 * Math.min(g.streak, 8) : 40;
    const pr = phrase(g.streak >= 3 && firstTry ? 'mumtaz' : 'ahsant', gender);
    ui.sheikh?.('stop', pr.ar, pr.en);
    ui.feedback?.(firstTry ? `${pr.en} ${label ?? ''}` : (label ?? ''), 'good');
    g.status();
    if (level <= 2) await speak(pr); else await wait(800);
  };
  g.wrong = (miss, text) => { soft(); g.attempts++; g.streak = 0; if (miss) g.practise.add(miss); ui.feedback?.(text, 'bad'); g.status(); };
  g.finish = (extra = {}) => {
    if (g.done) return; g.done = true; stopVoice(); stopSound();
    ui.finished?.({ rounds: g.n, first: g.first, accuracy: Math.round((g.first / g.n) * 100), score: cfg.score ? g.score : null,
      practise: [...g.practise], minutes: Math.max(1, Math.round((Date.now() - g.t0) / 60000)), ...extra });
  };
  return g;
}

// ── Rain of Mercy ───────────────────────────────────────────────
// items: [{ ar, id, latin }] (syllables). One is said; its raindrop must be caught.
export function createRain({ stage, items, level = 1, gender, ui }) {
  const g = round0({ level, gender, ui });
  const fall = { 1: 11, 2: 9, 3: 7, 4: 5.5 }[level] ?? 9;   // seconds to reach the garden
  const drops = Math.min(6, g.cfg.lanterns + (level >= 3 ? 0 : 0));
  let target = null, timer = null, prev = null;
  stage.replaceChildren(); stage.dataset.type = 'rain';
  const sky = el('div', 'rain-sky'), garden = el('div', 'rain-garden');
  stage.append(sky, garden);

  async function next() {
    if (g.done) return;
    clearTimeout(timer);
    g.round++; g.attempts = 0; g.status();
    if (g.round > g.n) return g.finish();
    target = pick(items, 1, prev ? [prev] : [])[0]; prev = target;
    // choose look-alikes from the same letter or the same vowel, so the ear has to work
    const near = items.filter((x) => x !== target && (x.L === target.L || x.v === target.v));
    const others = shuffle([...pick(near, drops - 1), ...pick(items, drops, [target])]).filter((x, i, a) => a.indexOf(x) === i).slice(0, drops - 1);
    const choice = shuffle([target, ...others]);
    sky.replaceChildren();
    ui.feedback?.('', '');
    choice.forEach((it, i) => {
      const b = el('button', 'drop');
      b.type = 'button'; b.setAttribute('aria-label', `Raindrop ${it.latin}`);
      b.style.left = `${8 + (84 / Math.max(1, choice.length - 1)) * i}%`;
      b.style.animationDuration = `${fall + (i % 2) * 0.6}s`;
      b.style.animationDelay = `${(i % 3) * 0.25}s`;
      b.append(el('span', 'drop-t', it.ar));
      b.addEventListener('click', () => choose(b, it));
      sky.append(b);
    });
    sky.classList.remove('falling'); void sky.offsetWidth;
    mark(stage, target.ar);
    ui.sheikh?.('speaking', target.ar, 'Listen');
    await say(target.id, target.ar);
    if (g.done || !target) return;
    sky.classList.add('falling');
    ui.sheikh?.('listening', target.ar, 'Catch its raindrop');
    timer = setTimeout(missed, (fall + 0.8) * 1000);
  }
  async function choose(b, it) {
    if (g.done || b.disabled) return;
    if (it === target) {
      clearTimeout(timer);
      sky.querySelectorAll('.drop').forEach((x) => (x.disabled = true));
      b.classList.add('caught'); sky.classList.add('paused');
      garden.append(el('span', 'bloom'));
      const t = target; target = null;
      await g.right(`${t.ar} · ${t.latin}`);
      next();
    } else {
      b.disabled = true; b.classList.add('splash');
      g.wrong(target.ar, `That was ${it.latin}. Listen again.`);
      if (level <= 2) say(target.id, target.ar);
    }
  }
  async function missed() {
    if (g.done || !target) return;
    sky.querySelectorAll('.drop').forEach((x) => { x.disabled = true; if (x.textContent === target.ar) x.classList.add('shown'); });
    sky.classList.add('paused');
    g.attempts++; g.wrong(target.ar, `It reached the garden. This was ${target.ar}, ${target.latin}.`);
    await say(target.id, target.ar); await wait(900);
    next();
  }
  return { start: next, replay: () => target && say(target.id, target.ar), stop: () => { g.done = true; clearTimeout(timer); stopSound(); }, get config() { return g.cfg; } };
}

// ── Mosaic Maker ────────────────────────────────────────────────
// questions: [{ prompt: { ar?, text?, ref?, id? }, ask, choices: [{ show, key }], answer, label, say? }]
const STAR_TILES = 9;
function starSvg() {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '-110 -110 220 220'); svg.setAttribute('class', 'mosaic-star'); svg.setAttribute('aria-hidden', 'true');
  let html = '';
  for (let k = 0; k < 8; k++) html += `<path class="tile" data-k="${k}" transform="rotate(${k * 45})" d="M0 -100 L22 -40 L0 -30 L-22 -40 Z"/>`;
  html += '<path class="tile" data-k="8" d="M0 -30 L21 -21 L30 0 L21 21 L0 30 L-21 21 L-30 0 L-21 -21 Z"/>';
  svg.innerHTML = html + '<circle cx="0" cy="0" r="104" fill="none" stroke="#C29F4B" stroke-width="1.5" opacity=".6"/>';
  return svg;
}
export function createMosaic({ stage, questions, level = 1, gender, ui, reciter }) {
  const g = round0({ level, gender, ui, rounds: Math.min(STAR_TILES, questions.length) });
  const qs = shuffle(questions).slice(0, g.n);
  let q = null;
  stage.replaceChildren(); stage.dataset.type = 'mosaic';
  const star = starSvg(), board = el('div', 'mosaic-q');
  stage.append(star, board);
  const tiles = [...star.querySelectorAll('.tile')];

  const hear = (x) => (x?.ref ? playAyah(x.ref, reciter) : x?.id ? say(x.id, x.ar) : Promise.resolve());
  async function next() {
    if (g.done) return;
    g.round++; g.attempts = 0; g.status();
    if (g.round > g.n) return g.finish();
    q = qs[g.round - 1];
    board.replaceChildren();
    ui.feedback?.('', '');
    const p = el('div', 'mq-prompt');
    if (q.prompt.ar) p.append(el('span', 'mq-ar', q.prompt.ar));
    if (q.prompt.text) p.append(el('span', 'mq-text', q.prompt.text));
    if (q.prompt.ref || q.prompt.id) { const h = el('button', 'btn mq-hear', 'Hear it again'); h.type = 'button'; h.addEventListener('click', () => hear(q.prompt)); p.append(h); }
    const opts = el('div', 'mq-opts');
    const choices = shuffle(q.choices).slice(0, Math.max(2, Math.min(q.choices.length, g.cfg.lanterns)));
    if (!choices.includes(q.choices.find((c) => c.key === q.answer))) choices[0] = q.choices.find((c) => c.key === q.answer);
    shuffle(choices).forEach((c) => {
      const b = el('button', 'mq-opt' + (/[؀-ۿ]/.test(c.show) ? ' ar' : ''), c.show);
      b.type = 'button'; b.dataset.key = c.key;
      b.addEventListener('click', () => choose(b, c));
      opts.append(b);
    });
    board.append(el('p', 'mq-ask', q.ask), p, opts);
    mark(stage, q.answer);
    ui.sheikh?.('speaking', q.prompt.ar ?? '', q.ask);
    await hear(q.prompt);
    if (!g.done) ui.sheikh?.('listening', q.prompt.ar ?? '', q.ask);
  }
  async function choose(b, c) {
    if (g.done || b.disabled) return;
    if (c.key === q.answer) {
      board.querySelectorAll('.mq-opt').forEach((x) => (x.disabled = true));
      b.classList.add('right');
      tiles[g.round - 1]?.classList.add('laid', g.attempts === 0 ? 'gold' : 'green');
      if (q.say) await say(q.say.id, q.say.ar);
      await g.right(q.label ?? '');
      next();
    } else {
      b.disabled = true; b.classList.add('nope');
      g.wrong(q.label ?? q.prompt.ar, q.hint ?? 'Not this one. Look again.');
    }
  }
  return { start: next, replay: () => q && hear(q.prompt), stop: () => { g.done = true; stopSound(); }, get config() { return g.cfg; } };
}

// ── Date Baskets ────────────────────────────────────────────────
// baskets: [{ key, label }], items: [{ ar, ref, note, basket }]
export function createBaskets({ stage, baskets, items, level = 1, gender, ui, reciter }) {
  const g = round0({ level, gender, ui, rounds: Math.min(items.length, { 1: 6, 2: 8, 3: 10, 4: 12 }[level] ?? 8) });
  // every basket gets dates before any gets a second turn
  const queue = shuffle(baskets).flatMap((b) => shuffle(items.filter((x) => x.basket === b.key)));
  const order = []; const pools = baskets.map((b) => shuffle(items.filter((x) => x.basket === b.key)));
  while (order.length < g.n && pools.some((p) => p.length)) for (const p of shuffle(pools)) { if (p.length && order.length < g.n) order.push(p.shift()); }
  void queue;
  let it = null, shownAt = 0;
  stage.replaceChildren(); stage.dataset.type = 'baskets';
  const date = el('div', 'date-card'), row = el('div', 'baskets');
  const counts = {};
  baskets.forEach((b) => {
    counts[b.key] = 0;
    const x = el('button', 'basket'); x.type = 'button'; x.dataset.key = b.key;
    x.innerHTML = '<svg viewBox="0 0 120 70" aria-hidden="true"><path d="M8 18 H112 L100 66 H20 Z" fill="#8A6B3A"/><path d="M8 18 H112" stroke="#C29F4B" stroke-width="4"/><path d="M24 30 H96 M28 42 H92 M32 54 H88" stroke="#6E5420" stroke-width="2"/></svg>';
    x.append(el('span', 'b-label', b.label), el('span', 'b-count', ''));
    x.addEventListener('click', () => choose(x, b));
    row.append(x);
  });
  stage.append(date, row);

  async function next() {
    if (g.done) return;
    g.round++; g.attempts = 0; g.status();
    if (g.round > g.n || !order[g.round - 1]) return g.finish();
    it = order[g.round - 1];
    date.replaceChildren(el('span', 'date-ar', it.ar), el('span', 'date-ref', `Ayah ${it.ref}`));
    const h = el('button', 'btn mq-hear', 'Hear the ayah'); h.type = 'button'; h.addEventListener('click', () => playAyah(it.ref, reciter));
    date.append(h);
    date.classList.remove('drop-in'); void date.offsetWidth; date.classList.add('drop-in');
    mark(stage, it.basket);
    shownAt = Date.now();
    row.querySelectorAll('.basket').forEach((x) => x.classList.remove('nope'));
    ui.feedback?.('Which basket does this date belong in?', '');
    ui.sheikh?.('listening', it.ar, 'Which rule is this?');
  }
  async function choose(x, b) {
    if (g.done || !it || Date.now() - shownAt < 450) return;   // a double tap from the last date does not count
    if (b.key === it.basket) {
      counts[b.key]++; x.querySelector('.b-count').textContent = '●'.repeat(Math.min(counts[b.key], 6));
      x.classList.add('right'); setTimeout(() => x.classList.remove('right'), 700);
      const done = it; it = null;
      await g.right(`${done.ar} · ${baskets.find((k) => k.key === done.basket).label}`);
      next();
    } else {
      x.classList.add('nope');
      g.wrong(it.ar, `Not ${b.label}. Listen to the ayah and look at the letter after the nun or the Madd.`);
    }
  }
  return { start: next, replay: () => it && playAyah(it.ref, reciter), stop: () => { g.done = true; stopSound(); }, get config() { return g.cfg; } };
}

// ── String of Pearls ────────────────────────────────────────────
// duas: [{ name, lines: [...] }]. Tap the pearls in the order the supplication is said.
export function createPearls({ stage, duas, level = 1, gender, ui }) {
  const list = shuffle(duas).slice(0, { 1: 2, 2: 3, 3: 4, 4: 5 }[level] ?? 3);
  const g = round0({ level, gender, ui, rounds: list.length });
  let d = null, at = 0;
  stage.replaceChildren(); stage.dataset.type = 'pearls';
  const thread = el('div', 'thread'), loose = el('div', 'loose');
  const title = el('p', 'pearl-title');
  stage.append(title, thread, loose);
  function next() {
    if (g.done) return;
    g.round++; g.attempts = 0; g.status();
    if (g.round > g.n) return g.finish();
    d = list[g.round - 1]; at = 0;
    title.textContent = d.name;
    thread.replaceChildren(); loose.replaceChildren();
    d.lines.forEach(() => thread.append(el('span', 'slot')));
    shuffle(d.lines.map((t, i) => ({ t, i }))).forEach((p) => {
      const b = el('button', 'pearl', p.t); b.type = 'button'; b.lang = 'ar'; b.dir = 'rtl'; mark(b, p.i);
      b.addEventListener('click', () => choose(b, p));
      loose.append(b);
    });
    ui.feedback?.('Tap the lines in the order you say them.', '');
    ui.sheikh?.('listening', d.lines[0].split(' ').slice(0, 2).join(' ') + '…', d.name);
  }
  async function choose(b, p) {
    if (g.done || b.disabled) return;
    if (p.i === at) {
      b.disabled = true; b.classList.add('strung');
      thread.children[at].replaceWith(b);
      at++;
      if (at === d.lines.length) { await g.right(d.name); await wait(500); next(); }
      else ui.feedback?.('', '');
    } else {
      b.classList.add('nope'); setTimeout(() => b.classList.remove('nope'), 500);
      g.wrong(d.name, 'Not yet. Which line comes next?');
    }
  }
  return { start: next, replay: () => {}, stop: () => { g.done = true; }, get config() { return g.cfg; } };
}
