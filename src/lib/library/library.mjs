// The Reading Library: a reading journey for each level, the books, and the games after each book.
//   mountLibrary(root, { level, progress, onOpen })      the journey map, the passport and the level tabs
//   openBook(root, book, { reciter, onDone, onExit })    read the book (Story Time reader), then play its games
//      → onDone({ stars, right }) with 1–3 stars
// Books live in level1.mjs, level2.mjs and added.mjs (books a teacher adds, e.g. from Canva pictures).
import { LEVEL1 } from './level1.mjs';
import { LEVEL2 } from './level2.mjs';
import { ADDED } from './added.mjs';
import { prop, scene } from '../stories/art.mjs';
import { openStory, picture } from '../stories/reader.mjs';
import { narrate, hush } from '../narration.mjs';
import { LIBRARY_LINES } from '../narration-text.mjs';

export const SHELVES = {
  1: { name: 'First Readers', ages: 'Level 1 · ages 4–6', books: [...LEVEL1, ...ADDED.filter((b) => b.level === 1)] },
  2: { name: 'Adventure Readers', ages: 'Level 2 · ages 7–8', books: [...LEVEL2, ...ADDED.filter((b) => b.level === 2)] },
};
export const ALL_BOOKS = Object.values(SHELVES).flatMap((s) => s.books);
const BADGES = [[5, 'Bronze Reader'], [10, 'Silver Reader'], [15, 'Gold Reader'], [20, 'Library Star']];

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const TEST = typeof location !== 'undefined' && /[?&]test=1\b/.test(location.search);
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const today = () => new Date().toISOString().slice(0, 10);

// days in a row with a book read, ending today or yesterday
export function streakOf(days = []) {
  const set = new Set(days);
  const d = new Date(); if (!set.has(today())) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(d.toISOString().slice(0, 10))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
export function noteRead(progress, book, stars) {
  const lp = (progress.library ??= {});
  const was = lp[book.id];
  lp[book.id] = { done: true, stars: Math.max(stars, was?.stars ?? 0), times: (was?.times ?? 0) + 1 };
  const days = (progress.libraryDays ??= []);
  if (!days.includes(today())) days.push(today());
  if (days.length > 60) days.splice(0, days.length - 60);
  return lp[book.id];
}

// ── the journey map ─────────────────────────────────────────
export function mountLibrary(root, { level = 1, progress = {}, onOpen, onLevel }) {
  root.replaceChildren();
  const lp = progress.library ?? {};
  const tabs = el('div', 'lb-tabs'); tabs.setAttribute('role', 'tablist');
  for (const [n, sh] of Object.entries(SHELVES)) {
    const t = el('button', 'lb-tab' + (+n === level ? ' on' : '')); t.type = 'button'; t.setAttribute('role', 'tab'); t.setAttribute('aria-selected', String(+n === level));
    t.append(el('b', null, sh.name), el('small', null, sh.ages));
    t.dataset.level = n;
    t.addEventListener('click', () => onLevel?.(+n));
    tabs.append(t);
  }
  const shelf = SHELVES[level] ?? SHELVES[1];
  const read = shelf.books.filter((b) => lp[b.id]?.done).length;
  const stars = shelf.books.reduce((a, b) => a + (lp[b.id]?.stars ?? 0), 0);
  const streak = streakOf(progress.libraryDays);
  const badge = [...BADGES].reverse().find(([n]) => read >= n);
  const nextBadge = BADGES.find(([n]) => read < n);

  const pass = el('div', 'lb-passport');
  const stat = (big, small) => { const s = el('div', 'lb-stat'); s.append(el('b', null, big), el('small', null, small)); return s; };
  pass.append(stat(`${read}/${shelf.books.length}`, 'books read'), stat(`★ ${stars}`, 'stars'), stat(`🔥 ${streak}`, streak === 1 ? 'day in a row' : 'days in a row'));
  const goal = el('p', 'lb-goal', badge ? `🏅 ${badge[1]}! ` : '');
  if (nextBadge) goal.append(`Read ${nextBadge[0] - read} more ${nextBadge[0] - read === 1 ? 'book' : 'books'} to become a ${nextBadge[1]}.`);
  else goal.append('You have read every book on this shelf. Masha’Allah!');
  pass.append(goal);
  const stamps = el('div', 'lb-stamps'); stamps.setAttribute('aria-label', 'Passport stamps');
  shelf.books.forEach((b) => { const s = el('span', 'lb-stamp' + (lp[b.id]?.done ? ' on' : '')); s.style.setProperty('--book', b.color); s.title = b.title; stamps.append(s); });
  pass.append(stamps);

  const next = shelf.books.find((b) => !lp[b.id]?.done);
  const path = el('ol', 'lb-path');
  shelf.books.forEach((b, i) => {
    const li = el('li', 'lb-stop' + (lp[b.id]?.done ? ' done' : '') + (b === next ? ' next' : ''));
    li.style.setProperty('--book', b.color);
    const btn = el('button', 'lb-book'); btn.type = 'button'; btn.dataset.book = b.id;
    const art = el('div', 'lb-cover'); art.innerHTML = picture(b.pages[0]);
    const n = el('span', 'lb-n', String(i + 1));
    const s = lp[b.id]?.stars ?? 0;
    btn.append(art, n, el('b', 'lb-title', b.title), el('span', 'lb-theme', b.theme), el('span', 'lb-stars', '★'.repeat(s) + '☆'.repeat(3 - s)));
    if (b === next) btn.append(el('span', 'lb-flag', i ? 'Next adventure' : 'Start here'));
    btn.setAttribute('aria-label', `${i + 1}. ${b.title}. ${b.theme}. ${s} of 3 stars.`);
    btn.addEventListener('click', () => onOpen?.(b));
    li.append(btn);
    path.append(li);
    const m = BADGES.find(([k]) => k === i + 1);
    if (m && i + 1 < shelf.books.length) { const f = el('li', 'lb-mile' + (read >= m[0] ? ' on' : ''), `🏅 ${m[1]}`); f.setAttribute('aria-hidden', 'true'); path.append(f); }
  });
  root.append(tabs, pass, path);
}

// ── a book, then its games ──────────────────────────────────
export function openBook(root, book, { reciter, onDone, onExit }) {
  const st = { ...book, ask: book.choose, askKicker: 'What would you do?' };
  let reader = openStory(root, st, {
    reciter, onExit, glossary: book.level === 2 || /^l2-/.test(book.id) ? book.words : null,
    finish: 'Play the story games ▶',
    onDone: ({ right }) => { reader = null; games(root, book, { right, onDone, onExit }); },
  });
  return { stop() { reader?.stop(); hush(); } };
}

function say(text) { narrate(text, { voice: 'story' }); }

function games(root, book, { right, onDone, onExit }) {
  hush();
  root.replaceChildren();
  for (const k of Object.keys(root.dataset)) delete root.dataset[k];
  root.className = 'st-reader lb-games';
  root.style.setProperty('--book', book.color);
  const L2 = book.level === 2 || /^l2-/.test(book.id);
  const top = el('div', 'st-top');
  const close = el('button', 'st-chip', 'Close the book'); close.type = 'button';
  close.addEventListener('click', () => { hush(); onExit?.(); });
  top.append(el('b', 'st-title', `${book.title} · Story games`), close);
  const stage = el('div', 'st-stage card-page');
  const dots = el('div', 'st-dots');
  root.append(top, stage, dots);

  const plan = [wordGame, quizGame, orderGame];
  const NAME = new Map([[wordGame, 'words'], [quizGame, 'quiz'], [gapGame, 'gap'], [orderGame, 'order']]);
  if (L2 && gapItems(book).length) plan.splice(2, 0, gapGame);
  plan.forEach(() => dots.append(el('span')));
  let step = 0, first = 0, total = 0;
  const mark = (ok) => { total++; if (ok) first++; };

  const card = (kicker, title) => {
    const box = el('div', 'st-card lb-card');
    box.append(el('p', 'st-kicker', kicker));
    if (title) box.append(el('h2', 'st-q', title));
    const w = el('div', 'st-words'); w.append(box); stage.replaceChildren(w);
    [...dots.children].forEach((d, i) => d.classList.toggle('on', i === step));
    root.dataset.game = NAME.get(plan[step]);
    return box;
  };
  const go = () => { step++; if (step < plan.length) plan[step](); else finish(); };
  const nextBtn = (box, label = 'Next game ›') => { const b = el('button', 'btn btn-primary big lb-next', step === plan.length - 1 ? 'See my stars ★' : label); b.type = 'button'; b.addEventListener('click', go); box.append(b); b.focus?.(); };

  // one multiple-choice round. opts: [{ label, html?, right }]
  function ask(box, opts, { onRight, speakOnTap } = {}) {
    const row = el('div', 'st-opts lb-opts');
    let tries = 0;
    for (const o of shuffle(opts)) {
      const b = el('button', 'st-opt'); b.type = 'button';
      if (o.html) { const pic = el('span', 'lb-pic'); pic.innerHTML = o.html; b.append(pic); }
      if (o.label) b.append(el('span', null, o.label));
      if (TEST) b.dataset.answer = String(!!o.right);
      b.addEventListener('click', () => {
        if (speakOnTap && o.label) say(o.label);
        if (o.right) { b.classList.add('right'); row.querySelectorAll('button').forEach((x) => (x.disabled = true)); mark(tries === 0); onRight?.(); }
        else { tries++; b.classList.add('nope'); b.disabled = true; if (!speakOnTap) say(LIBRARY_LINES.again); }
      });
      row.append(b);
    }
    box.append(row);
  }

  // 1. Level 1: which word goes with the picture?  Level 2: what does the word mean?
  function wordGame() {
    const items = shuffle(book.words);
    let i = 0;
    const round = () => {
      if (i >= items.length) return go();
      const w = items[i++];
      if (!L2) {
        const box = card(`Word game · ${i} of ${items.length}`, 'Which word goes with the picture?');
        const pic = el('div', 'lb-big-pic'); pic.innerHTML = `<svg viewBox="-70 -110 140 130" width="150" height="140" role="img" aria-label="A picture"><g>${prop({ p: w.p, x: 0, y: 0, s: 1.4 })}</g></svg>`;
        box.append(pic);
        try { const svg = pic.firstElementChild, b = svg.firstElementChild.getBBox(), pad = Math.max(b.width, b.height) * 0.15; svg.setAttribute('viewBox', `${b.x - pad} ${b.y - pad} ${b.width + pad * 2} ${b.height + pad * 2}`); } catch {}
        ask(box, book.words.map((x) => ({ label: x.w, right: x === w })), { speakOnTap: true, onRight: () => setTimeout(round, 900) });
        if (i === 1) say(LIBRARY_LINES.pictureWord);
      } else {
        const box = card(`Word game · ${i} of ${items.length}`, `What does “${w.w}” mean?`);
        const wrong = shuffle(book.words.filter((x) => x !== w)).slice(0, 2);
        ask(box, [w, ...wrong].map((x) => ({ label: x.m, right: x === w })), { onRight: () => setTimeout(round, 900) });
        if (i === 1) say(LIBRARY_LINES.wordMeaning);
      }
    };
    round();
  }

  // 2. questions about the story
  function quizGame() {
    let i = 0;
    const round = () => {
      if (i >= book.quiz.length) return go();
      const q = book.quiz[i++];
      const box = card(`Story quiz · ${i} of ${book.quiz.length}`, q.q);
      ask(box, [{ label: q.a, right: true }, ...q.w.map((x) => ({ label: x }))], { onRight: () => setTimeout(round, 900) });
      if (!L2) say(q.q);
    };
    round();
  }

  // 3 (Level 2). fill the gap in a sentence from the book
  function gapGame() {
    const items = gapItems(book);
    let i = 0;
    const round = () => {
      if (i >= items.length) return go();
      const { before, word, after } = items[i++];
      const box = card(`Fill the gap · ${i} of ${items.length}`, 'Which word is missing?');
      const p = el('p', 'lb-gap'); p.append(before, el('span', 'lb-blank', '_____'), after);
      box.append(p);
      const wrong = shuffle(book.words.filter((x) => x.w !== word.w && !x.w.includes(' '))).slice(0, 2);
      ask(box, [word, ...wrong].map((x) => ({ label: x.w, right: x === word })), { onRight: () => { p.querySelector('.lb-blank').textContent = word.shown; setTimeout(round, 1200); } });
      if (i === 1) say(LIBRARY_LINES.gap);
    };
    round();
  }

  // 4. put three pictures from the story in order
  function orderGame() {
    const picks = [0, Math.floor(book.pages.length / 2), book.pages.length - 1];
    const box = card('Story order', 'What happened first? Tap the pictures in order.');
    const row = el('div', 'lb-order');
    let want = 0, slips = 0;
    for (const k of shuffle(picks)) {
      const b = el('button', 'lb-frame'); b.type = 'button';
      b.innerHTML = picture(book.pages[k]);
      const badge = el('span', 'lb-num'); b.append(badge);
      if (TEST) b.dataset.order = String(picks.indexOf(k));
      b.addEventListener('click', () => {
        if (picks.indexOf(k) === want) {
          b.classList.add('right'); b.disabled = true; badge.textContent = String(++want);
          if (want === picks.length) { mark(slips === 0); say(LIBRARY_LINES.right); nextBtn(box); }
        } else { slips++; b.classList.add('nope'); setTimeout(() => b.classList.remove('nope'), 500); say(LIBRARY_LINES.again); }
      });
      row.append(b);
    }
    box.append(row);
    say(LIBRARY_LINES.order);
  }

  function finish() {
    hush();
    const score = (first + (right ? 1 : 0)) / (total + 1);
    const stars = score >= 0.85 ? 3 : score >= 0.5 ? 2 : 1;
    const box = card('Well done!', `You finished “${book.title}”`);
    root.dataset.game = 'done'; root.dataset.stars = String(stars);
    [...dots.children].forEach((d) => d.classList.add('on'));
    const s = el('p', 'lb-earned', '★'.repeat(stars) + '☆'.repeat(3 - stars)); s.setAttribute('aria-label', `${stars} of 3 stars`);
    box.append(s, el('p', 'st-why', stars === 3 ? LIBRARY_LINES.three : stars === 2 ? LIBRARY_LINES.two : LIBRARY_LINES.one));
    const b = el('button', 'btn btn-primary big st-finish', 'Back to my reading journey'); b.type = 'button';
    b.addEventListener('click', () => { hush(); onDone?.({ stars, right }); });
    box.append(b);
    say(stars === 3 ? LIBRARY_LINES.three : stars === 2 ? LIBRARY_LINES.two : LIBRARY_LINES.one);
  }
  plan[0]();
}

// sentences from the book that hold one of its (single) words, for the gap game: up to three
export function gapItems(book) {
  const out = [], used = new Set();
  for (const w of book.words) {
    if (w.w.includes(' ') || out.length >= 3) continue;
    for (const p of book.pages) {
      const m = p.t.match(new RegExp(`^(.*?\\b)(${w.w}[a-z]{0,2})(\\b.*)$`, 'i'));
      if (m && !used.has(p.t)) { used.add(p.t); out.push({ before: m[1], word: { ...w, shown: m[2] }, after: m[3] }); break; }
    }
  }
  return out;
}
