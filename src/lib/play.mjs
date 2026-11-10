// Play & Learn: the games from the Ta'aleem Interactive Learning Proposal.
//   Arabic Letter Detective · listen, find, name, missing letter, look-alikes; unlocks the alphabet garden in parts
//   Build the Ayah          · put an ayah's words in order, fill a missing word, choose the next ayah, order ayahs
//   Match the Deen          · memory cards from the teachers' question bank
//   Journey to Knowledge    · a board journey through four places, one question per step
//   Salah Master            · the steps of the prayer in order, what we say when, prayer facts
//   Akhlaq Heroes           · what would you do? Good choices grow a kindness garden
// Each builds inside `stage` on the night courtyard screen and reports through `ui`, like games.mjs.
// Qur'an text comes from the Tanzil data (never typed by hand); the other content comes from the question bank
// that teachers approve (questions.mjs).
import { LETTERS, lookalikes } from './alifba.mjs';
import { sayLetter, letterSpoken, stopSound } from './voice.mjs';
import { el, wait, shuffle, mark, pick, playAyah, round0 } from './games.mjs';
import { glow, soft } from './ambience.mjs';

const isAr = (t) => /[؀-ۿ]/.test(t);
const textEl = (tag, cls, t) => { const e = el(tag, cls + (isAr(t) ? ' ar' : ''), t); if (isAr(t)) { e.lang = 'ar'; e.dir = 'auto'; } return e; };

// Audio instructions for young readers: the question read aloud in English (Arabic parts are left out).
let enVoice = null;
function pickEn() { enVoice = (globalThis.speechSynthesis?.getVoices() ?? []).filter((v) => /^en/i.test(v.lang)).sort((a, b) => (/natural|google|online/i.test(b.name) ? 1 : 0) - (/natural|google|online/i.test(a.name) ? 1 : 0))[0] ?? null; }
if (typeof window !== 'undefined' && 'speechSynthesis' in window) { pickEn(); speechSynthesis.addEventListener?.('voiceschanged', pickEn); }
export function readAloud(text) {
  const t = String(text).replace(/[؀-ۿݐ-ݿࢠ-ࣿ]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!t || !('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(t); if (enVoice) u.voice = enVoice; u.lang = enVoice?.lang ?? 'en-GB'; u.rate = 0.92;
  speechSynthesis.cancel(); speechSynthesis.speak(u);
}

// A question with choices, then a short explanation and Next. Two wrong tries show the answer.
function askChoice(g, box, { prompt, ar, choices, answer, explain, label, onRight, onReveal, readable = true }) {
  return new Promise((resolve) => {
    box.replaceChildren();
    const card = el('div', 'qz');
    const q = el('div', 'qz-q');
    if (ar) q.append(textEl('p', 'qz-ar', ar));
    q.append(textEl('p', 'qz-text', prompt));
    if (readable) { const r = el('button', 'btn qz-read', 'Read it to me'); r.type = 'button'; r.addEventListener('click', () => readAloud(`${prompt}. ${choices.join('. ')}`)); q.append(r); }
    const opts = el('div', 'qz-opts');
    const after = el('div', 'qz-after');
    let tries = 0, settled = false;
    const finish = (right) => {
      settled = true;
      opts.querySelectorAll('button').forEach((b) => { b.disabled = true; if (b.dataset.key === answer) b.classList.add('right'); });
      after.replaceChildren();
      if (explain) after.append(textEl('p', 'qz-explain', explain));
      const n = el('button', 'btn btn-primary big qz-next', 'Next'); n.type = 'button';
      n.addEventListener('click', () => resolve(right));
      after.append(n);
      n.focus({ preventScroll: true });
    };
    shuffle(choices).forEach((c) => {
      const b = textEl('button', 'qz-opt', c); b.type = 'button'; b.dataset.key = c;
      b.addEventListener('click', async () => {
        if (settled || b.disabled) return;
        if (c === answer) {   // lock at once: a double tap while the Sheikh praises must not count twice
          settled = true; opts.querySelectorAll('button').forEach((x) => (x.disabled = true));
          b.classList.add('right'); await g.right(label ?? ''); onRight?.(); finish(true);
        }
        else {
          b.disabled = true; b.classList.add('nope'); tries++;
          g.wrong(label ?? prompt, tries >= 2 ? 'Here is the answer. Read the explanation.' : 'Not quite. Think again.');
          if (tries >= 2) { onReveal?.(); finish(false); }
        }
      });
      opts.append(b);
    });
    mark(box, answer);
    card.append(q, opts, after);
    box.append(card);
  });
}

// ── Arabic Letter Detective ────────────────────────────────────
// The alphabet garden opens in four parts of seven letters; finishing a round well opens the next part.
export function createDetective({ stage, level = 1, gender, ui, progress }) {
  const d = progress.detective ??= { part: level >= 3 ? 4 : 1, miss: {} };
  const g = round0({ level, gender, ui });
  const pool = LETTERS.slice(0, d.part * 7);
  const modes = level <= 1 ? ['listen', 'listen', 'missing'] : ['listen', 'name', 'which', 'missing', 'similar'];
  stage.replaceChildren(); stage.dataset.type = 'detective';
  const path = el('div', 'det-path'), board = el('div', 'det-board');
  for (let i = 0; i < g.n; i++) path.append(el('span', 'det-stone'));
  const walker = el('span', 'det-lantern'); path.append(walker);
  stage.append(path, board);
  let cur = null;
  const weight = (L) => 1 + 2 * (d.miss[L.letter] ?? 0);   // letters the student finds hard come up more
  function target() {
    const total = pool.reduce((a, L) => a + weight(L), 0);
    let x = Math.random() * total;
    for (const L of pool) { x -= weight(L); if (x <= 0) return L; }
    return pool[0];
  }
  const nChoices = Math.min(pool.length, g.cfg.lanterns);
  function letterChoices(T, similar) {
    const near = similar ? lookalikes(T.letter).map((l) => LETTERS.find((x) => x.letter === l)) : [];
    const rest = shuffle(pool.filter((L) => L !== T && !near.includes(L)));
    return shuffle([T, ...near, ...rest].slice(0, Math.max(3, similar ? Math.min(near.length + 1, 4) : nChoices)));
  }
  async function next() {
    if (g.done) return;
    g.round++; g.attempts = 0; g.status();
    path.style.setProperty('--at', String(Math.min(g.round - 1, g.n - 1) / Math.max(1, g.n - 1)));
    path.querySelectorAll('.det-stone').forEach((s, i) => s.classList.toggle('lit', i < g.round - 1));
    if (g.round > g.n) return g.finish({ detectivePart: d.part });
    let mode = modes[(g.round - 1) % modes.length];
    const T = target();
    if (mode === 'similar' && !lookalikes(T.letter).length) mode = 'listen';
    cur = { T, mode };
    board.replaceChildren();
    ui.feedback?.('', '');
    const ask = el('p', 'det-ask');
    const show = el('div', 'det-show');
    const opts = el('div', 'det-opts');
    let choices, answerKey = T.letter, label = (c) => c.letter;
    if (mode === 'listen' || mode === 'similar') {
      ask.textContent = mode === 'similar' ? 'Careful: these letters look alike. Which one did the Sheikh say?' : 'Listen. Which letter did the Sheikh say?';
      const h = el('button', 'det-hear', '🔊'); h.type = 'button'; h.setAttribute('aria-label', 'Hear it again'); h.addEventListener('click', () => sayLetter(T)); show.append(h);
      choices = letterChoices(T, mode === 'similar');
    } else if (mode === 'name') {
      ask.textContent = 'Find the letter with this name.';
      show.append(textEl('span', 'det-big', T.name), el('span', 'det-small', T.latin));
      choices = letterChoices(T, false);
    } else if (mode === 'which') {
      ask.textContent = 'What is this letter called?';
      show.append(textEl('span', 'det-big letter', T.letter));
      choices = letterChoices(T, false); answerKey = T.name; label = (c) => c.name;
    } else {
      ask.textContent = 'Which letter is missing?';
      const i = Math.max(0, Math.min(LETTERS.length - 5, T.i - 2));
      const seq = LETTERS.slice(i, i + 5);
      const row = el('div', 'det-seq'); row.dir = 'rtl';
      seq.forEach((L) => row.append(el('span', L === T ? 'gap' : '', L === T ? '?' : L.letter)));
      show.append(row);
      choices = letterChoices(T, true);
    }
    choices.forEach((c) => {
      const b = textEl('button', 'det-opt', label(c)); b.type = 'button'; b.dataset.key = label(c);
      b.addEventListener('click', () => choose(b, c, answerKey));
      opts.append(b);
    });
    mark(stage, answerKey);
    board.append(ask, show, opts);
    ui.sheikh?.('speaking', letterSpoken(T).ar, ask.textContent);
    if (mode === 'listen' || mode === 'similar') await sayLetter(T);
    if (!g.done) ui.sheikh?.('listening', mode === 'which' ? T.letter : '', ask.textContent);
  }
  async function choose(b, c, answerKey) {
    if (g.done || b.disabled || !cur) return;
    const { T } = cur;
    if ((cur.mode === 'which' ? c.name : c.letter) === answerKey) {
      board.querySelectorAll('.det-opt').forEach((x) => (x.disabled = true));
      b.classList.add('right');
      if (g.attempts === 0 && d.miss[T.letter]) d.miss[T.letter] = Math.max(0, d.miss[T.letter] - 1);
      cur = null;
      await sayLetter(T);
      await g.right(`${T.latin} · ${T.letter}`);
      next();
    } else {
      b.disabled = true; b.classList.add('nope');
      d.miss[T.letter] = Math.min(5, (d.miss[T.letter] ?? 0) + 1);
      g.wrong(T.letter, `That is ${c.latin}. Look again.`);
      if (cur.mode === 'listen' || cur.mode === 'similar') sayLetter(T);
    }
  }
  return {
    start: next, replay: () => cur && sayLetter(cur.T), stop: () => { g.done = true; stopSound(); }, get config() { return g.cfg; },
    // called by the page after the round: a strong round opens the next part of the alphabet garden
    unlock(accuracy) { if (accuracy >= 80 && d.part < 4) { d.part++; return LETTERS.slice((d.part - 1) * 7, d.part * 7).map((L) => L.letter).join(' '); } return ''; },
  };
}

// ── Build the Ayah ─────────────────────────────────────────────
// Short surahs for each level; the picker shows them, the student chooses one.
export const AYAH_SURAHS = {
  1: [1, 112, 113, 114, 108, 103],
  2: [1, 112, 113, 114, 108, 103, 110, 111, 106, 105, 107, 109],
  3: [1, ...Array.from({ length: 22 }, (_, i) => 114 - i)],
  4: [1, ...Array.from({ length: 37 }, (_, i) => 114 - i)],
};
// ayah text into words; pause marks (ۚ ۖ …) stay with the word before them
function words(ar) {
  const out = [];
  for (const w of ar.split(/\s+/).filter(Boolean)) { if (!/[ء-يٱ]/.test(w) && out.length) out[out.length - 1] += ' ' + w; else out.push(w); }
  return out;
}
export function createBuildAyah({ stage, level = 2, gender, ui, reciter, surah }) {
  const g = round0({ level, gender, ui, rounds: 1 });
  const maxWords = { 1: 5, 2: 7, 3: 10, 4: 14 }[level] ?? 7;
  stage.replaceChildren(); stage.dataset.type = 'ayah';
  const head = el('p', 'ay-title', `Surah ${surah.en} · ${surah.ar}`);
  const box = el('div', 'ay-box');
  stage.append(head, box);
  const ayahs = surah.ayahs;
  // the rounds: every ayah once, in order; long ayahs become “missing word”, and from Level 3 some “what comes next”
  const plan = [];
  ayahs.forEach((a, i) => {
    const w = words(a.ar);
    if (level >= 3 && i > 0 && i % 3 === 0 && ayahs.length > 3) plan.push({ mode: 'next', i });
    else plan.push({ mode: w.length <= maxWords ? 'arrange' : 'missing', i });
  });
  if (level >= 4 && ayahs.length >= 4) { const s = Math.floor(Math.random() * (ayahs.length - 3)); plan.push({ mode: 'order', i: s }); }
  const rounds = plan.slice(0, Math.max(3, { 1: 5, 2: 7, 3: 10, 4: 12 }[level] ?? 8));
  g.n = rounds.length;
  let cur = null;
  const ref = (i) => `${surah.n}:${ayahs[i].a}`;

  async function next() {
    if (g.done) return;
    g.round++; g.attempts = 0; g.status();
    if (g.round > g.n) return g.finish({ surah: surah.n });
    cur = rounds[g.round - 1];
    box.replaceChildren(); ui.feedback?.('', '');
    const { mode, i } = cur;
    const tag = el('p', 'ay-ref', `Ayah ${ayahs[i].a}`);
    if (mode === 'arrange') {
      const w = words(ayahs[i].ar);
      ui.sheikh?.('listening', '', 'Put the words of the ayah in order.');
      box.append(el('p', 'ay-ask', 'Put the words of the ayah in order. Start from the right.'), tag);
      await chain(w.map((t) => t), 'ayah');
    } else if (mode === 'missing') {
      const w = words(ayahs[i].ar);
      const k = 1 + Math.floor(Math.random() * (w.length - 1));
      const others = [...new Set(ayahs.flatMap((a) => words(a.ar)))].filter((x) => x !== w[k] && x.replace(/[^ء-ي]/g, '') !== w[k].replace(/[^ء-ي]/g, ''));
      const shown = w.map((x, j) => (j === k ? '﴾ … ﴿' : x)).join(' ');
      ui.sheikh?.('listening', '', 'Which word is missing?');
      box.append(el('p', 'ay-ask', 'Which word is missing?'), tag);
      const holder = el('div'); box.append(holder);
      const ok = await askChoice(g, holder, { ar: shown, prompt: '', choices: [w[k], ...pick(others, Math.min(3, others.length))], answer: w[k], label: w[k], readable: false });
      void ok;
    } else if (mode === 'next') {
      const nextOf = (j) => words(ayahs[j].ar).slice(0, 4).join(' ') + ' …';
      const wrong = shuffle(ayahs.map((_, j) => j).filter((j) => j !== i && j !== i - 1)).slice(0, 2).map(nextOf);
      ui.sheikh?.('listening', '', 'Which ayah comes next?');
      box.append(el('p', 'ay-ask', 'Which ayah comes next?'), el('p', 'ay-ref', `After ayah ${ayahs[i - 1].a}`));
      const holder = el('div'); box.append(holder);
      await askChoice(g, holder, { ar: ayahs[i - 1].ar, prompt: '', choices: [nextOf(i), ...wrong], answer: nextOf(i), label: `Ayah ${ayahs[i].a}`, readable: false });
    } else {
      const set = ayahs.slice(i, i + 4).map((a) => a.ar);
      ui.sheikh?.('listening', '', 'Put these ayahs in order.');
      box.append(el('p', 'ay-ask', 'Put these ayahs in order.'), el('p', 'ay-ref', `Ayahs ${ayahs[i].a}–${ayahs[i + 3].a}`));
      await chain(set, 'ayahs');
    }
    // hear the ayah from the reciter, then go on
    if (!g.done && cur.mode !== 'order') { ui.sheikh?.('speaking', '', 'Listen to the ayah.'); await playAyah(ref(cur.mode === 'next' ? i : i), reciter); }
    next();
  }
  // tap the pieces in order (right to left for words)
  function chain(pieces, kind) {
    return new Promise((resolve) => {
      let at = 0;
      const line = el('div', 'ay-line ' + kind); line.dir = 'rtl'; line.lang = 'ar';
      pieces.forEach(() => line.append(el('span', 'ay-slot')));
      const pool = el('div', 'ay-pool ' + kind); pool.dir = 'rtl';
      shuffle(pieces.map((t, k) => ({ t, k }))).forEach((p) => {
        const b = el('button', 'ay-word', p.t); b.type = 'button'; b.lang = 'ar'; mark(b, p.k);
        b.addEventListener('click', async () => {
          if (g.done || b.disabled) return;
          if (p.t === pieces[at]) {   // the same word may appear twice: either copy is right
            b.disabled = true; b.classList.add('placed');
            line.children[at].replaceWith(b); at++;
            if (at === pieces.length) { await g.right(kind === 'ayah' ? 'The ayah is complete.' : 'In order.'); resolve(true); }
          } else { b.classList.add('nope'); setTimeout(() => b.classList.remove('nope'), 450); g.wrong(pieces[at], 'Not this one yet. Which word comes next?'); }
        });
        pool.append(b);
      });
      box.append(line, pool);
    });
  }
  return { start: next, replay: () => cur && playAyah(ref(cur.i), reciter), stop: () => { g.done = true; stopSound(); }, get config() { return g.cfg; } };
}

// ── Match the Deen ─────────────────────────────────────────────
export function createMatch({ stage, level = 1, gender, ui, pairs }) {
  const n = Math.min(pairs.length, { 1: 4, 2: 6, 3: 8, 4: 10 }[level] ?? 6);
  const set = shuffle(pairs).slice(0, n);
  const g = round0({ level, gender, ui, rounds: n });
  let open = [], moves = 0, matched = 0, busy = false;
  stage.replaceChildren(); stage.dataset.type = 'match';
  const grid = el('div', 'mt-grid'); grid.style.setProperty('--cols', String(n >= 10 ? 5 : 4));
  const cards = shuffle(set.flatMap((p, k) => [{ k, t: p.prompt }, { k, t: p.answer }]));
  cards.forEach((c) => {
    const b = el('button', 'mt-card'); b.type = 'button'; b.dataset.k = String(c.k);
    // "ٱلرَّحْمَٰن · Ar-Rahman": the Arabic and its transliteration on their own lines, so neither is reordered
    const parts = c.t.split(' · ');
    let face;
    if (parts.length === 2 && isAr(parts[0]) !== isAr(parts[1])) {
      face = el('span', 'mt-face two');
      const [arT, enT] = isAr(parts[0]) ? parts : [parts[1], parts[0]];
      face.append(textEl('span', 'mt-ar', arT), el('span', 'mt-en', enT));
    } else face = textEl('span', 'mt-face', c.t);
    b.append(el('span', 'mt-back'), face);
    b.addEventListener('click', () => flip(b, c));
    grid.append(b);
  });
  const info = el('p', 'mt-info', 'Turn over two cards to find a pair.');
  stage.append(grid, info);
  const seen = new Set();
  async function flip(b, c) {
    if (g.done || busy || b.classList.contains('up')) return;
    b.classList.add('up'); open.push({ b, c });
    if (open.length < 2) return;
    moves++; busy = true;
    const [x, y] = open; open = [];
    if (x.c.k === y.c.k) {
      x.b.classList.add('done'); y.b.classList.add('done'); matched++;
      g.round = matched; g.attempts = seen.has(x.c.k) ? 1 : 0;
      glow();
      if (g.attempts === 0) g.first++;
      g.status();
      info.textContent = `${matched} of ${n} pairs found · ${moves} tries`;
      busy = false;
      if (matched === n) { await wait(600); g.first = Math.min(g.first, n); g.finish({ moves }); }
    } else {
      seen.add(x.c.k); seen.add(y.c.k);
      soft();
      await wait(1100);
      x.b.classList.remove('up'); y.b.classList.remove('up');
      info.textContent = `${matched} of ${n} pairs found · ${moves} tries`;
      busy = false;
    }
  }
  ui.sheikh?.('listening', '', 'Find the pairs.');
  ui.feedback?.('', '');
  return { start: () => g.status(), replay: () => {}, stop: () => { g.done = true; }, get config() { return g.cfg; } };
}

// ── Journey to Knowledge ───────────────────────────────────────
export const PLACES = ['Knowledge Garden', 'Arabic Valley', 'Seerah Library', 'Garden of Good Manners'];
export function createJourney({ stage, level = 1, gender, ui, items }) {
  const SPACES = 20, per = SPACES / PLACES.length;
  const g = round0({ level, gender, ui, rounds: SPACES });
  let pos = 0, asked = 0;
  const left = new Map(PLACES.map((p) => [p, shuffle(items.filter((q) => q.topic === p))]));
  const spare = shuffle(items.filter((q) => !PLACES.includes(q.topic)));
  stage.replaceChildren(); stage.dataset.type = 'journey';
  const NS = 'http://www.w3.org/2000/svg';
  const board = document.createElementNS(NS, 'svg');
  board.setAttribute('viewBox', '0 0 1000 200'); board.setAttribute('class', 'jr-board'); board.setAttribute('aria-hidden', 'true');
  const pts = Array.from({ length: SPACES + 1 }, (_, i) => [40 + i * 46, 120 + Math.sin(i / 1.6) * 46]);
  let html = `<path d="M${pts.map((p) => p.join(' ')).join(' L')}" fill="none" stroke="rgba(194,159,75,.45)" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round"/>`;
  pts.forEach(([x, y], i) => { html += `<circle class="jr-sp${i && i % per === 0 ? ' place' : ''}" data-i="${i}" cx="${x}" cy="${y}" r="${i && i % per === 0 ? 15 : 10}"/>`; });
  PLACES.forEach((p, k) => { const [x, y] = pts[(k + 1) * per]; html += `<text x="${x}" y="${k % 2 ? y + 38 : y - 26}" text-anchor="${k === 3 ? 'end' : 'middle'}" class="jr-label">${p}</text>`; });
  html += `<g class="jr-token"><circle r="13" fill="#FBE3A6"/><circle r="6" fill="#C29F4B"/></g>`;
  board.innerHTML = html;
  const box = el('div', 'jr-box');
  stage.append(board, box);
  const token = board.querySelector('.jr-token');
  const place = () => PLACES[Math.min(PLACES.length - 1, Math.floor(pos / per))];
  function move(to) {
    pos = Math.min(SPACES, to);
    const [x, y] = pts[pos];
    token.setAttribute('transform', `translate(${x} ${y})`);
    board.querySelectorAll('.jr-sp').forEach((c) => c.classList.toggle('done', +c.dataset.i <= pos));
  }
  move(0);
  async function next() {
    if (g.done) return;
    if (pos >= SPACES || asked >= 26) { g.n = Math.max(1, asked); return g.finish({ reached: pos, asked }); }
    const here = place();
    const q = left.get(here)?.shift() ?? [...left.values()].find((l) => l.length)?.shift() ?? spare.shift();
    if (!q) { g.n = Math.max(1, asked); return g.finish({ reached: pos, asked }); }
    asked++; g.round = asked; g.n = Math.max(g.n, asked); g.attempts = 0; g.status();
    ui.feedback?.(`${here} · step ${pos + 1} of ${SPACES}`, '');
    ui.sheikh?.('listening', '', q.prompt);
    const right = await askChoice(g, box, { prompt: q.prompt, choices: [q.answer, ...q.wrong], answer: q.answer, explain: q.explain, label: q.answer,
      onRight: () => { move(pos + 1); if (pos % 5 === 0 && pos < SPACES) { move(pos + 1); ui.feedback?.(`A bonus step! You reached ${place()}.`, 'good'); } } });
    void right;
    next();
  }
  return { start: next, replay: () => {}, stop: () => { g.done = true; speechSynthesis?.cancel?.(); }, get config() { return g.cfg; } };
}

// ── Salah Master ───────────────────────────────────────────────
export function createSalah({ stage, level = 1, gender, ui, items }) {
  const orders = items.filter((q) => q.kind === 'order');
  const pairs = items.filter((q) => q.kind === 'pair');
  const facts = items.filter((q) => q.kind === 'choice');
  const plan = [
    ...shuffle(orders).slice(0, level >= 3 ? 2 : 1).map((q) => ({ type: 'order', q })),
    ...shuffle(pairs).slice(0, { 1: 3, 2: 4, 3: 5, 4: 6 }[level] ?? 4).map((q) => ({ type: 'pair', q })),
    ...shuffle(facts).slice(0, { 1: 3, 2: 4, 3: 5, 4: 6 }[level] ?? 4).map((q) => ({ type: 'fact', q })),
  ];
  const g = round0({ level, gender, ui, rounds: plan.length });
  stage.replaceChildren(); stage.dataset.type = 'salah';
  const box = el('div', 'sl-box'); stage.append(box);
  async function next() {
    if (g.done) return;
    g.round++; g.attempts = 0; g.status();
    if (g.round > g.n) return g.finish();
    const { type, q } = plan[g.round - 1];
    ui.feedback?.('', '');
    if (type === 'order') {
      const steps = q.answer.split('|').map((x) => x.trim()).filter(Boolean);
      ui.sheikh?.('listening', '', q.prompt);
      await orderSteps(q.prompt, steps, q.explain);
    } else if (type === 'pair') {
      const others = pairs.filter((p) => p !== q).map((p) => p.answer);
      await askChoice(g, box, { prompt: `When do we say “${q.prompt}”?`, choices: [q.answer, ...pick(others, 2)], answer: q.answer, label: q.prompt, explain: q.explain });
    } else {
      await askChoice(g, box, { prompt: q.prompt, choices: [q.answer, ...q.wrong], answer: q.answer, label: q.answer, explain: q.explain });
    }
    next();
  }
  function orderSteps(title, steps, explain) {
    return new Promise((resolve) => {
      box.replaceChildren();
      let at = 0;
      const head = el('p', 'sl-title', title);
      const r = el('button', 'btn qz-read', 'Read it to me'); r.type = 'button'; r.addEventListener('click', () => readAloud(`${title}. Tap the steps in order.`));
      const done = el('ol', 'sl-done');
      const pool = el('div', 'sl-pool');
      shuffle(steps.map((t, k) => ({ t, k }))).forEach((p) => {
        const b = el('button', 'sl-step', p.t); b.type = 'button'; mark(b, p.k);
        b.addEventListener('click', async () => {
          if (g.done || b.disabled) return;
          if (p.k === at) {
            b.disabled = true; const li = el('li', null, p.t); done.append(li); b.remove(); at++;
            if (at === steps.length) {
              await g.right('Every step in order.');
              if (explain) box.append(el('p', 'qz-explain', explain));
              const n = el('button', 'btn btn-primary big qz-next', 'Next'); n.type = 'button'; n.addEventListener('click', () => resolve()); box.append(n);
            }
          } else { b.classList.add('nope'); setTimeout(() => b.classList.remove('nope'), 450); g.wrong(title, 'Not yet. Which step comes next?'); }
        });
        pool.append(b);
      });
      box.append(head, r, done, pool);
    });
  }
  return { start: next, replay: () => {}, stop: () => { g.done = true; speechSynthesis?.cancel?.(); }, get config() { return g.cfg; } };
}

// ── Akhlaq Heroes ──────────────────────────────────────────────
export function createAkhlaq({ stage, level = 1, gender, ui, items }) {
  const set = shuffle(items).slice(0, { 1: 5, 2: 6, 3: 8, 4: 8 }[level] ?? 6);
  const g = round0({ level, gender, ui, rounds: set.length });
  stage.replaceChildren(); stage.dataset.type = 'akhlaq';
  const box = el('div', 'ak-box'), garden = el('div', 'ak-garden');
  garden.append(el('span', 'ak-label', 'Kindness garden'));
  stage.append(box, garden);
  async function next() {
    if (g.done) return;
    g.round++; g.attempts = 0; g.status();
    if (g.round > g.n) return g.finish({ kindness: garden.querySelectorAll('.bloom').length });
    const q = set[g.round - 1];
    ui.feedback?.('', '');
    ui.sheikh?.('listening', '', 'What would you do?');
    await askChoice(g, box, { prompt: q.prompt, choices: [q.answer, ...q.wrong], answer: q.answer, label: '', explain: q.explain,
      onRight: () => { if (g.attempts === 0) garden.append(el('span', 'bloom')); } });
    next();
  }
  return { start: next, replay: () => {}, stop: () => { g.done = true; speechSynthesis?.cancel?.(); }, get config() { return g.cfg; } };
}
