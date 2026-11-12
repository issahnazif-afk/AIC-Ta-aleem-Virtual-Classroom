// The Ta’aleem Books: the school's own books (made in Canva) as interactive digital books.
//   mountBookShelf(root, { books, progress, onOpen })                  the shelf: the books given (the student's level only)
//   openEbook(root, book, { progress, reciter, onChapter, onExit, onSave })
//      onChapter({ book, chapter, index, stars, first, total })   when a chapter is finished
//      onSave()                                                   after the reading place changes (to save progress)
//
// A book (src/lib/books/*.mjs) is { id, title, ar, level, ages, color, cover, about, chapters: [{ title, test?, pages }] }.
// The page types are described in docs/books.md. How a book behaves follows its level:
//   Level 1 (4–6)  read aloud from the start, big buttons, questions read out, crayons on the workbook pages
//   Level 2 (7–8)  read aloud from the start; the child reads the questions (a button reads them out)
//   Level 3 (9–10) and 4 (10–14)  the child reads; tests are scored; answers to write are kept on this computer
//
// The reader is a flipbook (StPageFlip, MIT, in HTML mode): the whole book is one run of leaves, from a hard front
// cover to a hard back cover, with a title page, a contents page, every chapter's pages and an end card after each
// chapter. Every page is a real, live page of the book, activities included. To keep them usable inside the curl:
//   · a page turns by the arrows, the keys, the corners and the outer edge of the page (drag or swipe there);
//     reading pages (read, du'a, hadith, ayah) can also be dragged from anywhere that is not a button;
//   · clicks, crayon strokes, typing and taps inside a page never reach the page-turner (see guard());
//   · a page with an activity still to finish holds the book open until it is done (forward only).
// Only the leaves near the open page are built (about a dozen); the rest are empty shells, so a big book opens fast.
import { PageFlip } from 'page-flip/dist/js/page-flip.module.js';
// the shelf's and the reader's styles load with this module, not with the classroom's first page
import '../../styles/books.css';
import { narrate, hush as stopNarration } from '../narration.mjs';
import { studioUrl, playUrl, stopSound, sayLetter, browserSay } from '../voice.mjs';
import { sayWord, sayMeaning } from '../word-voice.mjs';
import { wordForVoice } from '../narration-text.mjs';
import { hadithClipId } from '../narration-text.mjs';
import { byLetter } from '../alifba.mjs';
import { audioUrl } from '../client.mjs';
import { qpc } from '../recite.mjs';
import { u } from '../url.mjs';

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const btn = (cls, text, label) => { const b = el('button', cls, text); b.type = 'button'; if (label) b.setAttribute('aria-label', label); return b; };
const TEST = typeof location !== 'undefined' && /[?&]test=1\b/.test(location.search);
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const isAr = (t) => /[؀-ۿ]/.test(t) && !/[A-Za-z]/.test(t);
const arEl = (tag, cls, t) => { const e = el(tag, cls, t); e.lang = 'ar'; e.dir = 'rtl'; return e; };
// a short option or label: Arabic text gets the Arabic font and direction
const label = (t) => (isAr(t) ? arEl('span', 'eb-ar-inline', t) : el('span', null, t));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const INTERACTIVE = 'button, a, input, textarea, select, canvas, label, [role="button"], .eb-tools, .eb-tap-row';

// small line icons for the reader's tool bar (drawn, so they follow the bar's colour)
const ICONS = {
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  toc: '<path d="M4 6h16M4 12h16M4 18h10"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1"/>',
  first: '<path d="M7 5v14M18 6l-7 6 7 6"/>',
  last: '<path d="M17 5v14M6 6l7 6-7 6"/>',
  zin: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5M10.5 7.5v6M7.5 10.5h6"/>',
  zout: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5M7.5 10.5h6"/>',
  sound: '<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M15.5 9a4.5 4.5 0 010 6M18 6.5a8 8 0 010 11"/>',
  mute: '<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
  full: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  unfull: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
};
const icon = (name) => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
const iconBtn = (name, text, cls = '') => { const b = btn(`eb-tb ${cls}`.trim(), null, text); b.innerHTML = icon(name); b.title = text; return b; };

// the soft sound of a paper page turning, made on the spot with Web Audio (filtered noise, no recording)
let actx = null, noise = null;
function pageSound() {
  try {
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext; if (!AC) return;
    actx ??= new AC();
    if (actx.state === 'suspended') actx.resume?.();
    const dur = 0.5, sr = actx.sampleRate;
    if (!noise) {
      noise = actx.createBuffer(1, Math.round(sr * dur), sr);
      const d = noise.getChannelData(0); let b = 0;
      for (let i = 0; i < d.length; i++) {
        // brown-ish noise with a little crackle: paper rather than hiss
        b = (b + 0.09 * (Math.random() * 2 - 1)) / 1.045;
        d[i] = b * 3.2 * (Math.random() < 0.004 ? 2.4 : 1);
      }
    }
    const t = actx.currentTime + 0.01;
    const src = actx.createBufferSource(); src.buffer = noise; src.playbackRate.value = 0.9 + Math.random() * 0.25;
    const hp = actx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 260;
    const bp = actx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.7;
    bp.frequency.setValueAtTime(2400, t); bp.frequency.exponentialRampToValueAtTime(650, t + dur);
    const g = actx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.32, t + 0.06);
    g.gain.exponentialRampToValueAtTime(0.1, t + 0.24); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(hp); hp.connect(bp); bp.connect(g); g.connect(actx.destination);
    src.start(t); src.stop(t + dur + 0.05);
  } catch {}
}

export const bookProgress = (progress, book) => {
  const all = (progress.books ??= {});
  const p = (all[book.id] ??= {});
  p.done ??= {}; p.at ??= 0; p.page ??= {};
  return p;
};
const chapterCount = (b) => b.chapters.length;
export const doneCount = (progress, b) => Object.keys(progress.books?.[b.id]?.done ?? {}).length;

// ── the shelf ───────────────────────────────────────────────
export function mountBookShelf(root, { books, level = 1, progress = {}, onOpen }) {
  root.replaceChildren();
  // the page passes only the books for the student's level (booksFor in src/lib/books/index.mjs)
  const group = (list) => {
    if (!list.length) return;
    const grid = el('div', 'eb-shelf');
    for (const b of list) {
      const done = doneCount(progress, b), n = chapterCount(b);
      const card = btn('eb-book'); card.dataset.book = b.id; card.style.setProperty('--book', b.color);
      const img = el('img', 'eb-cover'); img.src = u(b.cover); img.alt = ''; img.loading = 'lazy';
      const bar = el('span', 'eb-bar'); const fill = el('i'); fill.style.width = `${Math.round((done / n) * 100)}%`; bar.append(fill);
      card.append(img, el('b', 'eb-book-t', b.title));
      if (b.ar) card.append(arEl('span', 'eb-book-ar', b.ar));
      card.append(el('span', 'eb-book-meta', `Ages ${b.ages}`), bar,
        el('small', 'eb-book-done', done ? `${done} of ${n} ${b.unit ?? 'chapters'} done` : `${n} ${b.unit ?? 'chapters'}`));
      card.setAttribute('aria-label', `${b.title}. Ages ${b.ages}. ${done} of ${n} done.`);
      card.addEventListener('click', () => onOpen?.(b));
      grid.append(card);
    }
    root.append(grid);
  };
  group(books);
}

// page types with an activity that must be finished before the book turns on
const ACTIVITY = new Set(['quiz', 'match', 'order', 'gap', 'sort', 'find']);
// page types you read: they can be dragged from anywhere, and they can turn by themselves after reading aloud
const PLAIN = new Set(['read', 'dua', 'hadith', 'ayah']);
const NEAR = 6, FAR = 16;
// what a page with no picture is called on its thumbnail
const NAMES = { quiz: 'Check what you know', match: 'Match them', order: 'Put them in order', gap: 'Fill the gap', sort: 'Sort them', find: 'Listen and find', write: 'Your turn to write', dua: "Du'a", hadith: 'Hadith', ayah: 'Ayah' };   // leaves built on each side of the open spread, and how far away a built leaf is let go

// ── the reader ──────────────────────────────────────────────
export function openEbook(root, book, { progress = {}, reciter = 'Husary_128kbps', onChapter, onExit, onSave }) {
  const L = book.level;
  const young = L <= 2;
  const pb = bookProgress(progress, book);
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let aloud = store.get(`qc.books.aloud.${L}`, young);
  let autoFlip = young && store.get(`qc.books.autoflip.${L}`, false);
  let sound = store.get('qc.books.sound', true);
  let pf = null, dead = false, ready = false, token = 0, zoom = 1, autoT = null, fadeT = null, saveT = null, kick = () => {};
  const hush = () => { stopNarration(); stopSound(); };
  const speak = (text, words) => { if (aloud && text) narrate(text, { voice: 'story', words: words ?? [] }); };
  // read aloud and wait for the end (it never ends if something else starts reading: the caller checks its token)
  const say = (text, words) => (aloud && text ? new Promise((r) => narrate(text, { voice: 'story', words: words ?? [], onEnd: r })) : Promise.resolve());

  // ── the leaves of the book ──
  const leaves = [{ kind: 'cover' }, { kind: 'title' }, { kind: 'toc' }];
  const chStart = [], chEnd = [];
  book.chapters.forEach((c, ci) => {
    chStart[ci] = leaves.length;
    c.pages.forEach((pg, pi) => leaves.push({ kind: 'page', ci, pi, pg }));
    chEnd[ci] = leaves.length;
    leaves.push({ kind: 'end', ci });
  });
  if ((leaves.length - 1) % 2) leaves.push({ kind: 'blank' });   // the back cover must fall on a left-hand page
  leaves.push({ kind: 'back' });
  const N = leaves.length;
  const pages = N - 2;          // the numbered pages, between the covers
  // what the child has done in this sitting: activities finished (by leaf), their scores, chapters finished
  const done = {}, res = {}, skipped = {}, finished = {}, seen = {};
  // activities before the place a child stopped at last time count as done (as the reader always did)
  book.chapters.forEach((c, ci) => { const p = pb.page[ci] ?? 0; for (let pi = 0; pi < p && pi < c.pages.length; pi++) skipped[chStart[ci] + pi] = true; });

  root.replaceChildren();
  for (const k of Object.keys(root.dataset)) delete root.dataset[k];
  root.className = `eb-reader lv${L}` + (reduced ? ' still' : '');
  root.style.setProperty('--book', book.color);

  // top bar
  const top = el('div', 'eb-top');
  const close = iconBtn('close', 'Close the book', 'eb-close');
  const title = el('div', 'eb-title'); const tb = el('b', null, book.title); const tc = el('small'); title.append(tb, tc);
  const aloudB = btn('eb-chip');
  const autoB = btn('eb-chip');
  const setAloud = () => { aloudB.textContent = aloud ? 'Reading to me: on' : 'Reading to me: off'; aloudB.setAttribute('aria-pressed', String(aloud)); autoB.hidden = !young || !aloud; };
  const setAuto = () => { autoB.textContent = autoFlip ? 'Turn pages for me: on' : 'Turn pages for me: off'; autoB.setAttribute('aria-pressed', String(autoFlip)); };
  setAuto(); setAloud();
  aloudB.addEventListener('click', () => { aloud = !aloud; store.set(`qc.books.aloud.${L}`, aloud); setAloud(); if (!aloud) { hush(); clearTimeout(autoT); } else readSpread(visible(), ++token); });
  autoB.addEventListener('click', () => { autoFlip = !autoFlip; store.set(`qc.books.autoflip.${L}`, autoFlip); setAuto(); if (autoFlip) readSpread(visible(), ++token); else clearTimeout(autoT); });
  close.addEventListener('click', () => { stop(); onExit?.(); });
  top.append(close, title, aloudB, autoB);

  // the desk with the book on it: desk > sizer (the scroll area when zoomed) > scaler > shift (centres a closed book) > book
  const desk = el('div', 'eb-desk');
  const sizer = el('div', 'eb-sizer'), scaler = el('div', 'eb-scaler'), shift = el('div', 'eb-shift');
  const shadow = el('div', 'eb-bookshadow'), holder = el('div', 'eb-volume');
  shift.append(shadow, holder); scaler.append(shift); sizer.append(scaler); desk.append(sizer);
  const back = btn('eb-btn back', '‹', 'Back');
  const next = btn('eb-btn next', '›', 'Next page');
  const hint = el('p', 'eb-hint', 'Finish the activity on this page, then turn the page.'); hint.hidden = true; hint.setAttribute('role', 'status');
  const stage = el('div', 'eb-stage'); stage.append(desk, back, next, hint);

  // bottom bar
  const nav = el('div', 'eb-nav');
  const tocB = iconBtn('toc', 'Contents'), thumbB = iconBtn('grid', 'All the pages');
  const firstB = iconBtn('first', 'First page', 'eb-narrow-x'), lastB = iconBtn('last', 'Last page', 'eb-narrow-x');
  const where = el('span', 'eb-where'); where.setAttribute('aria-live', 'polite');
  const bar = el('span', 'eb-bar'); const barFill = el('i'); bar.append(barFill);
  const zoomOut = iconBtn('zout', 'Zoom out'), zoomIn = iconBtn('zin', 'Zoom in');
  const soundB = iconBtn(sound ? 'sound' : 'mute', 'Page sound');
  const fullB = iconBtn('full', 'Full screen');
  const setSound = () => { soundB.innerHTML = icon(sound ? 'sound' : 'mute'); soundB.setAttribute('aria-pressed', String(sound)); soundB.title = sound ? 'Page sound: on' : 'Page sound: off'; };
  setSound();
  soundB.addEventListener('click', () => { sound = !sound; store.set('qc.books.sound', sound); setSound(); if (sound) pageSound(); });
  if (!document.fullscreenEnabled) fullB.hidden = true;
  const whereBox = el('div', 'eb-wherebox'); whereBox.append(where, bar);
  nav.append(tocB, thumbB, firstB, whereBox, lastB, zoomOut, zoomIn, soundB, fullB);

  // panels: contents, and all the pages
  const tocP = el('div', 'eb-panel eb-panel-toc'); tocP.hidden = true; tocP.setAttribute('role', 'dialog'); tocP.setAttribute('aria-label', 'Contents');
  const thumbP = el('div', 'eb-panel eb-panel-thumbs'); thumbP.hidden = true; thumbP.setAttribute('role', 'dialog'); thumbP.setAttribute('aria-label', 'All the pages');
  stage.append(tocP, thumbP);
  root.append(top, stage, nav);
  const chapterButtons = (list) => {
    book.chapters.forEach((c, i) => {
      const li = el('li');
      const b = btn('eb-toc-b' + (pb.done[i] ? ' done' : '') + (c.test ? ' test' : '')); b.dataset.chapter = String(i);
      b.append(el('span', 'eb-toc-n', String(i + 1)), el('b', null, c.title));
      if (c.ar) b.append(arEl('span', 'eb-toc-ar', c.ar));
      const s = pb.done[i]?.stars ?? 0;
      b.append(el('span', 'eb-toc-s', pb.done[i] ? '★'.repeat(s) + '☆'.repeat(3 - s) : `p. ${chStart[i]}`));
      b.addEventListener('click', () => { closePanels(); go(chStart[i]); });
      li.append(b); list.append(li);
    });
    return list;
  };
  const panelHead = (p, text) => { const h = el('div', 'eb-panel-h'); const x = iconBtn('close', 'Close'); x.addEventListener('click', () => closePanels()); h.append(el('b', null, text), x); p.append(h); };
  // the chapter list is built now (the classroom's click-through test uses it); the page grid when first opened
  const fillToc = () => {
    tocP.replaceChildren(); panelHead(tocP, book.unit === 'units' ? 'Units and lessons' : 'Contents');
    const startB = btn('eb-toc-b eb-toc-start'); startB.append(el('span', 'eb-toc-n', '·'), el('b', null, 'The title page and contents')); startB.addEventListener('click', () => { closePanels(); go(1); });
    tocP.append(startB, chapterButtons(el('ol', 'eb-toc eb-chapters')));
  };
  fillToc();
  let thumbsMade = false;
  const fillThumbs = () => {
    thumbsMade = true; thumbP.replaceChildren(); panelHead(thumbP, `All ${pages} pages`);
    const wrap = el('div', 'eb-thumbs');
    let grid = null;
    leaves.forEach((lf, g) => {
      if (g === 0 || g === 1 || (lf.kind === 'page' && lf.pi === 0) || lf.kind === 'back') {
        wrap.append(el('h3', 'eb-thumbs-h', g === 0 ? 'The cover' : g === 1 ? 'The start' : lf.kind === 'back' ? 'The back' : `${lf.ci + 1}. ${book.chapters[lf.ci].title}`));
        grid = el('div', 'eb-thumb-grid'); wrap.append(grid);
      }
      const b = btn('eb-thumb'); b.dataset.g = String(g);
      const face = el('span', 'eb-thumb-face');
      const img = lf.kind === 'cover' || lf.kind === 'back' ? book.cover : lf.pg?.img;
      if (img) { const im = el('img'); im.src = u(img); im.alt = ''; im.loading = 'lazy'; im.decoding = 'async'; face.append(im); }
      else face.append(el('span', 'eb-thumb-t', lf.kind === 'end' ? 'Chapter end' : lf.kind === 'toc' ? 'Contents' : lf.kind === 'title' ? book.title : lf.kind === 'blank' ? '' : (lf.pg.h ?? NAMES[lf.pg.type] ?? (typeof lf.pg.text?.[0] === 'string' ? lf.pg.text[0] : ''))));
      if (lf.pg && ACTIVITY.has(lf.pg.type)) face.classList.add('act');
      b.append(face, el('small', null, g === 0 ? 'Cover' : g === N - 1 ? 'Back' : String(g)));
      b.setAttribute('aria-label', g === 0 ? 'The cover' : g === N - 1 ? 'The back cover' : `Page ${g}`);
      b.addEventListener('click', () => { closePanels(); go(g); });
      grid.append(b);
    });
    thumbP.append(wrap);
  };
  const closePanels = () => { tocP.hidden = true; thumbP.hidden = true; tocB.setAttribute('aria-pressed', 'false'); thumbB.setAttribute('aria-pressed', 'false'); };
  const openPanel = (p, b) => {
    const was = !p.hidden; closePanels(); if (was) return;
    if (p === tocP) fillToc(); else if (!thumbsMade) fillThumbs();
    p.hidden = false; b.setAttribute('aria-pressed', 'true');
    p.querySelectorAll('.eb-thumb.on').forEach((t) => t.classList.remove('on'));
    for (const g of visible()) { const t = p.querySelector(`.eb-thumb[data-g="${g}"]`); if (t) { t.classList.add('on'); t.scrollIntoView?.({ block: 'center' }); } }
    p.querySelector('.eb-panel-h button')?.focus({ preventScroll: true });
  };
  tocB.addEventListener('click', () => openPanel(tocP, tocB));
  thumbB.addEventListener('click', () => openPanel(thumbP, thumbB));
  firstB.addEventListener('click', () => go(0));
  lastB.addEventListener('click', () => go(N - 1));

  // ── the leaf elements (empty shells until they come near) ──
  const leafEls = leaves.map((lf, g) => {
    const e = el('div', `eb-leaf k-${lf.kind}` + (lf.pg ? ` t-${lf.pg.type}` : ''));
    e.dataset.g = String(g);
    if (lf.kind === 'cover' || lf.kind === 'back') e.dataset.density = 'hard';
    e.addEventListener('mousedown', guard);
    e.addEventListener('touchstart', guard, { passive: true });
    lf.el = e;
    return e;
  });

  // Should a press here start a page turn? The outer edge and corners always (unless it is a button, the crayons or
  // a text box); reading pages anywhere; activities only from the edge; nothing while zoomed; and never forward past
  // an activity that is not finished.
  function turnable(e, leaf) {
    if (zoom > 1 || !pf || !ready) return false;
    const p = e.touches?.[0] ?? e;
    const r = leaf.getBoundingClientRect(); if (!r.width) return false;
    const x = p.clientX;
    const lf = leaves[+leaf.dataset.g];
    const ew = clamp(r.width * 0.1, 22, 60);
    const right = leaf.classList.contains('--right');
    const portrait = pf.getOrientation() === 'portrait';
    const edge = right ? x > r.right - ew || (portrait && x < r.left + ew) : x < r.left + ew;
    if (e.target.closest?.(INTERACTIVE)) return false;
    const plain = lf.kind === 'cover' || lf.kind === 'back' || lf.kind === 'blank' || (lf.pg && PLAIN.has(lf.pg.type));
    if (!edge && !plain) return false;
    const forward = portrait ? x - r.left > r.width * 0.4 : right;
    if (forward && gatedForward()) { nudge(); return false; }
    return true;
  }
  function guard(e) {
    clearTimeout(autoT);
    if (!turnable(e, e.currentTarget)) e.stopPropagation();   // the page-turner listens on the book, above the leaves
  }

  // ── building and letting go of a leaf ──
  function fill(g) {
    if (g < 0 || g >= N) return;
    const lf = leaves[g];
    if (lf.ctx) return;
    const x = lf.ctx = { g, ci: lf.ci, pi: lf.pi, cleanup: [], read: null, wait: false, live: false, before: !!done[g] };
    if (lf.kind === 'page' && !done[g]) res[g] = { first: 0, total: 0 };
    x.mark = (ok) => { if (x.before) return; res[g].total++; if (ok) res[g].first++; };
    const inner = el('div', 'eb-leaf-in');
    try {
      if (lf.kind === 'cover') { const im = el('img', 'eb-cover-img'); im.src = u(book.cover); im.alt = `The cover of ${book.title}`; im.draggable = false; lf.el.replaceChildren(im); return; }
      if (lf.kind === 'back') return backCover(lf.el);
      if (lf.kind === 'title') titlePage(inner);
      else if (lf.kind === 'toc') inner.append(el('h2', 'eb-toc-h', book.unit === 'units' ? 'Units and lessons' : 'Contents'), chapterButtons(el('ol', 'eb-toc')));
      else if (lf.kind === 'end') endPage(inner, x);
      else if (lf.kind === 'page') {
        const box = el('div', `eb-page t-${lf.pg.type}`);
        inner.append(box);
        (PAGES[lf.pg.type] ?? PAGES.read)(box, lf.pg, x);
      }
    } catch (err) { inner.append(el('p', 'eb-text', 'This page could not be shown.')); console.error(err); }
    const folio = el('span', 'eb-folio');
    if (lf.kind !== 'blank') folio.append(el('b', null, String(g)), ...(lf.ci != null ? [el('span', null, book.chapters[lf.ci].title)] : []));
    lf.el.replaceChildren(inner, folio);
  }
  function empty(g) {
    const lf = leaves[g];
    if (!lf.ctx) return;
    lf.ctx.cleanup.forEach((f) => { try { f(); } catch {} });
    lf.ctx = null;
    lf.el.replaceChildren();
  }

  // ── the covers, the title page, the end of a chapter ──
  function backCover(e) {
    const box = el('div', 'eb-back');
    const im = el('img', 'eb-back-img'); im.src = u(book.cover); im.alt = ''; im.draggable = false;
    box.append(im, el('b', null, book.title));
    if (book.ar) box.append(arEl('span', 'eb-back-ar', book.ar));
    box.append(el('small', null, "Ta'aleem"));
    e.replaceChildren(box);
  }
  function resumeLeaf() {
    if (pb.g > 2 && pb.g < N - 1) return pb.g;
    const ci = clamp(pb.at ?? 0, 0, book.chapters.length - 1);
    const p = pb.page[ci] ?? 0;
    return chStart[ci] + (p > 0 && p < book.chapters[ci].pages.length ? p : 0);
  }
  function titlePage(inner) {
    const box = el('div', 'eb-titlepage');
    box.append(el('p', 'eb-kicker', `Level ${book.levels ? book.levels.join('–') : L} · ages ${book.ages}`), el('h1', 'eb-h1', book.title));
    if (book.ar) box.append(arEl('p', 'eb-head-ar', book.ar));
    box.append(el('p', 'eb-about', book.about));
    const n = doneCount(progress, book), all = book.chapters.length;
    const started = n > 0 || pb.g > 2 || Object.values(pb.page).some((p) => p > 0) || pb.at > 0;
    const goB = btn('btn btn-primary big eb-go', n >= all ? 'Read it again from the start' : started ? 'Carry on reading' : 'Start reading');
    goB.addEventListener('click', () => go(n >= all || !started ? chStart[0] : resumeLeaf()));
    box.append(goB);
    if (n) box.append(el('p', 'eb-small', `${n} of ${all} ${book.unit ?? 'chapters'} done`));
    if (book.note) box.append(el('p', 'preview-note', book.note));
    inner.append(box);
  }
  // the activities of a chapter still to do (finished earlier in this sitting, or before where the child carried on, counts)
  const pendingIn = (ci) => { const out = []; for (let g = chStart[ci]; g < chEnd[ci]; g++) if (ACTIVITY.has(leaves[g].pg.type) && !done[g] && !skipped[g]) out.push(g); return out; };
  // pages of a chapter not yet open in this sitting (a chapter is finished by reading it, not by jumping to its end)
  const unseenIn = (ci) => { const out = []; for (let g = chStart[ci]; g < chEnd[ci]; g++) if (!seen[g] && !skipped[g]) out.push(g); return out; };
  const todoState = (ci) => (finished[ci] ? 'done' : `todo ${pendingIn(ci).join()} / ${unseenIn(ci).length}`);
  function endPage(inner, x) {
    const ci = x.ci, chapter = book.chapters[ci];
    const card = el('div', 'eb-card eb-endcard');
    inner.append(card);
    x.paint = () => {
      card.replaceChildren(); card.classList.remove('eb-end');
      const f = finished[ci];
      if (!f) {
        const todo = pendingIn(ci);
        card.append(el('p', 'eb-kicker', `${chapter.test ? 'Test' : 'Chapter'} ${ci + 1}`), el('h2', 'eb-h2', chapter.title));
        if (todo.length) {
          card.append(el('p', 'eb-msg', todo.length === 1 ? 'One activity is still to do. Finish it to get your stars.' : `${todo.length} activities are still to do. Finish them to get your stars.`));
          const row = el('div', 'eb-row');
          for (const g of todo.slice(0, 6)) { const b = btn('btn', `Page ${g}: ${leaves[g].pg.h ?? NAMES[leaves[g].pg.type] ?? 'activity'}`); b.addEventListener('click', () => go(g)); row.append(b); }
          card.append(row);
        } else {
          const unseen = unseenIn(ci);
          card.append(el('p', 'eb-msg', unseen.length ? 'Read every page of this chapter to get your stars.' : 'Turn to this page to finish the chapter.'));
          if (unseen.length) { const b = btn('btn', `Go to page ${unseen[0]}`); b.addEventListener('click', () => go(unseen[0])); const row = el('div', 'eb-row'); row.append(b); card.append(row); }
        }
        return;
      }
      card.append(el('p', 'eb-kicker', chapter.test ? 'Test finished' : 'Chapter finished'), el('h2', 'eb-h2', chapter.title));
      const s = el('p', 'eb-stars', '★'.repeat(f.stars) + '☆'.repeat(3 - f.stars)); s.setAttribute('aria-label', `${f.stars} of 3 stars`);
      card.append(s);
      if (f.scored) card.append(el('p', 'eb-score', chapter.test || L >= 3 ? `${f.first} of ${f.total} right first time (${f.pct}%)` : `${f.first} of ${f.total} right first time`));
      card.append(el('p', 'eb-msg', f.msg));
      const row = el('div', 'eb-row');
      if (ci + 1 < book.chapters.length) { const nx = btn('btn btn-primary big', `Next: ${book.chapters[ci + 1].title}`); nx.addEventListener('click', () => go(chStart[ci + 1])); row.append(nx); }
      const again = btn('btn big', 'Read this chapter again'); again.addEventListener('click', () => readAgain(ci));
      const toc = btn('btn big', 'Contents'); toc.addEventListener('click', () => go(2));
      row.append(again, toc);
      card.append(row);
    };
    x.paint();
  }
  // the end leaf of a chapter is open: finish the chapter if everything in it is done
  function checkEnd(ci) {
    const x = leaves[chEnd[ci]].ctx; if (!x?.live) return;
    if (finished[ci] || pendingIn(ci).length || unseenIn(ci).length) {
      // paint again only when something changed (painting again would drop the Ta'aleem Stars the classroom added)
      const state = todoState(ci);
      if (x.state !== state) { x.paint(); x.state = state; }
      if (finished[ci]) root.dataset.view = 'end';
      return;
    }
    let first = 0, total = 0;
    for (let g = chStart[ci]; g < chEnd[ci]; g++) if (res[g]) { first += res[g].first; total += res[g].total; }
    const scored = total > 0;
    const pct = scored ? Math.round((first / total) * 100) : 100;
    const stars = !scored ? 3 : pct >= 85 ? 3 : pct >= 50 ? 2 : 1;
    const msg = stars === 3 ? "Masha'Allah! Well done." : stars === 2 ? 'Good work. Try it again to earn three stars.' : 'You finished it. Read it again and try once more.';
    finished[ci] = { stars, pct, first, total, scored, msg };
    x.state = 'done';
    const was = pb.done[ci];
    pb.done[ci] = { stars: Math.max(stars, was?.stars ?? 0), pct: Math.max(pct, was?.pct ?? 0) };
    pb.page[ci] = 0;
    x.paint();
    // only this end card carries .eb-end, so the classroom puts the Ta'aleem Stars on the right one
    root.querySelectorAll('.eb-end').forEach((c) => c.classList.remove('eb-end'));
    leaves[chEnd[ci]].el.querySelector('.eb-endcard')?.classList.add('eb-end');
    root.dataset.view = 'end'; root.dataset.earned = String(stars);   // not data-stars: the classroom rewrites every [data-stars]
    speak(msg);
    // after the end card is on the page, so the classroom can add the Ta'aleem Stars to it (it also saves the progress)
    if (onChapter) onChapter({ book, chapter: book.chapters[ci], index: ci, stars, first, total, pct, test: !!book.chapters[ci].test });
    else onSave?.();
  }
  function readAgain(ci) {
    for (let g = chStart[ci]; g <= chEnd[ci]; g++) { delete done[g]; delete res[g]; delete skipped[g]; delete seen[g]; empty(g); }
    delete finished[ci]; pb.page[ci] = 0;
    for (let g = chStart[ci]; g <= chEnd[ci] && g <= chStart[ci] + NEAR; g++) fill(g);
    shown = '';
    go(chStart[ci]);
    if (visible().includes(chStart[ci])) settle();
  }
  // an activity is finished: the book may turn again, and the chapter may be finished
  function actDone(x) {
    x.wait = false;
    done[x.g] = true;
    if (x.live) { updateNav(); if (leaves[chEnd[x.ci]].ctx?.live) checkEnd(x.ci); }
  }

  // ── where the book is open ──
  const spreads = () => pf.getPageCollection().getSpread();
  const spreadIndex = () => pf.getPageCollection().getCurrentSpreadIndex();
  function visible() {
    if (!pf || !ready) return [0];
    try { const s = spreads()[spreadIndex()]; return s ? [...s] : [pf.getCurrentPageIndex()]; } catch { return [pf.getCurrentPageIndex()]; }
  }
  const gatedForward = () => visible().some((g) => leaves[g].ctx?.wait && !done[g]);
  function nudge() {
    hint.hidden = false; hint.classList.remove('shake'); void hint.offsetWidth; hint.classList.add('shake');
    for (const g of visible()) leaves[g].el.querySelector('.eb-page')?.classList.add('eb-attn');
    setTimeout(() => root.querySelectorAll('.eb-attn').forEach((e) => e.classList.remove('eb-attn')), 700);
  }
  function updateNav() {
    if (!pf || !ready) return;
    const vis = visible();
    const si = spreadIndex(), last = spreads().length - 1;
    const gated = gatedForward();
    back.disabled = si <= 0;
    next.disabled = si >= last || gated;
    next.classList.toggle('wait', gated);
    next.title = gated ? 'Finish the activity first' : '';
    hint.hidden = !gated;
    pf.getSettings().showPageCorners = !reduced && zoom === 1 && !gated;
    const lo = Math.min(...vis), hi = Math.max(...vis);
    where.textContent = lo === 0 ? 'The cover' : lo === N - 1 ? 'The back cover' : hi === N - 1 || lo === hi ? `Page ${lo} of ${pages}` : `Pages ${lo}–${hi} of ${pages}`;
    barFill.style.width = `${Math.round((hi / (N - 1)) * 100)}%`;
    const content = vis.find((g) => leaves[g].ci != null);
    tc.textContent = content != null ? `${leaves[content].ci + 1}. ${book.chapters[leaves[content].ci].title}` : book.ar ?? '';
  }
  // a closed book sits in the middle of the desk; an open one has its spine in the middle
  function placeBook(open) {
    if (!pf || !ready) return;
    const r = pf.getBoundsRect(); if (!r) return;
    const land = pf.getOrientation() === 'landscape';
    const si = spreadIndex(), last = spreads().length - 1;
    let dx = 0, vx = r.left, vw = r.width, closed = false;
    if (!land) { vx = r.left + r.pageWidth; vw = r.pageWidth; }
    else if (si === 0) { dx = -r.pageWidth / 2; vx = r.left + r.pageWidth; vw = r.pageWidth; closed = true; }
    else if (si === last && spreads()[last].length === 1) { dx = r.pageWidth / 2; vw = r.pageWidth; closed = true; }
    if (open) dx = 0;
    shift.style.transform = dx ? `translateX(${dx}px)` : '';
    Object.assign(shadow.style, { left: `${vx}px`, top: `${r.top}px`, width: `${vw}px`, height: `${r.height}px` });
    root.dataset.closed = closed && !open ? '1' : '';
  }

  // the book has come to rest on a new spread
  let shown = '';
  function settle() {
    if (!pf || dead || !ready) return;
    kick();
    const vis = visible();
    // the page-turner also reports a turn when the window is resized: the same pages, so nothing is read again
    if (vis.join() === shown) { updateNav(); placeBook(false); return; }
    shown = vis.join();
    hush(); clearTimeout(autoT);
    const tk = ++token;
    const lo = Math.min(...vis), hi = Math.max(...vis);
    for (let g = 0; g < N; g++) {
      if (g >= lo - NEAR && g <= hi + NEAR) fill(g);
      else if (g < lo - FAR || g > hi + FAR) empty(g);
      const lf = leaves[g];
      const live = vis.includes(g);
      if (live) seen[g] = true;
      if (lf.ctx) lf.ctx.live = live;
      lf.el.classList.toggle('live', live);
    }
    root.dataset.page = String(lo);
    root.dataset.view = lo === 0 ? 'cover' : 'book';
    // the reading place, kept with the progress
    const content = vis.find((g) => leaves[g].kind === 'page');
    if (content != null) {
      const lf = leaves[content];
      pb.at = lf.ci; pb.page[lf.ci] = lf.pi; pb.g = content;
      clearTimeout(saveT); saveT = setTimeout(() => { saveT = null; onSave?.(); }, 1500);
    }
    updateNav();
    placeBook(false);
    for (const g of vis) if (leaves[g].kind === 'end') checkEnd(leaves[g].ci);
    if (!thumbP.hidden) { thumbP.querySelectorAll('.eb-thumb.on').forEach((t) => t.classList.remove('on')); vis.forEach((g) => thumbP.querySelector(`.eb-thumb[data-g="${g}"]`)?.classList.add('on')); }
    readSpread(vis, tk);
  }
  // read the open pages aloud, the left one first; then, if the child asked for it, turn the page
  async function readSpread(vis, tk) {
    await new Promise((r) => setTimeout(r, reduced ? 50 : 250));
    for (const g of vis) {
      if (tk !== token) return;
      const c = leaves[g].ctx;
      if (!c?.read || (!aloud && !c.always)) continue;
      try { await c.read(); } catch {}
    }
    if (tk !== token || !autoFlip || !aloud || !young) return;
    const ok = vis.every((g) => { const lf = leaves[g]; return lf.kind === 'blank' || (lf.kind === 'page' && PLAIN.has(lf.pg.type)); });
    if (!ok || gatedForward()) return;
    autoT = setTimeout(() => { if (tk === token && zoom === 1 && tocP.hidden && thumbP.hidden) turn(1); }, 1400);
  }

  // ── turning ──
  function turn(dir) {
    if (!pf || !ready) return;
    clearTimeout(autoT);
    const si = spreadIndex(), sp = spreads();
    if (dir > 0 && gatedForward()) return nudge();
    if ((dir > 0 && si >= sp.length - 1) || (dir < 0 && si <= 0)) return;
    const target = sp[si + dir][0];
    for (let g = target - 2; g <= target + 3; g++) fill(g);
    if (reduced) return fadeTo(target);
    kick();
    byHand(() => (dir > 0 ? pf.flipNext('bottom') : pf.flipPrev('bottom')));
  }
  // a turn asked for by a button or a key: the page-turner checks its own made-up press point against the corners
  // (it lies outside the book when the book has a margin), so let it through
  function byHand(f) { const st = pf.getSettings(); st.disableFlipByClick = false; try { f(); } finally { st.disableFlipByClick = true; } }
  function go(g) {
    if (!pf || !ready) return;
    g = clamp(g, 0, N - 1);
    clearTimeout(autoT);
    if (visible().includes(g)) return;
    for (let k = g - 2; k <= g + 3; k++) fill(k);
    const si = spreadIndex();
    const ti = pf.getPageCollection().getSpreadIndexByPage(g);
    if (reduced || ti == null) return fadeTo(g);
    if (Math.abs(ti - si) === 1 && !(ti > si && gatedForward())) {
      kick(); return byHand(() => (ti > si ? pf.flipNext('bottom') : pf.flipPrev('bottom')));
    }
    kick();
    byHand(() => pf.flip(g, 'bottom'));   // one turn, from the spread next to the one asked for
  }
  function fadeTo(g) {
    clearTimeout(fadeT);
    holder.classList.add('eb-fade');
    if (sound) pageSound();
    fadeT = setTimeout(() => { if (dead) return; pf.turnToPage(g); holder.classList.remove('eb-fade'); kick(); }, 120);
  }
  next.addEventListener('click', () => turn(1));
  back.addEventListener('click', () => turn(-1));
  const onKey = (e) => {
    if (!root.isConnected) return removeEventListener('keydown', onKey);
    if (root.closest('[hidden]')) return;
    if (/^(TEXTAREA|INPUT|SELECT)$/.test(document.activeElement?.tagName ?? '') || document.activeElement?.isContentEditable) return;
    if (e.key === 'Escape') { if (!tocP.hidden || !thumbP.hidden) closePanels(); else if (zoom > 1) setZoom(1); return; }
    if (!tocP.hidden || !thumbP.hidden) return;
    const k = { ArrowRight: () => turn(1), PageDown: () => turn(1), ArrowLeft: () => turn(-1), PageUp: () => turn(-1), Home: () => go(0), End: () => go(N - 1), '+': () => zoomStep(1), '=': () => zoomStep(1), '-': () => zoomStep(-1) }[e.key];
    if (k) { e.preventDefault(); k(); }
  };
  addEventListener('keydown', onKey);
  // with reduced motion the page-turner takes no drags: a swipe turns the page with a fade instead
  if (reduced) {
    let sx = null;
    desk.addEventListener('pointerdown', (e) => { const leaf = e.target.closest?.('.eb-leaf'); sx = leaf && turnable(e, leaf) ? e.clientX : null; });
    desk.addEventListener('pointerup', (e) => { if (sx == null) return; const d = e.clientX - sx; sx = null; if (Math.abs(d) > 60) turn(d < 0 ? 1 : -1); });
  }

  // ── zoom and full screen ──
  const ZOOMS = [1, 1.5, 2, 3];
  function setZoom(z, at) {
    const W = desk.clientWidth, H = desk.clientHeight;
    const cx = at ? at[0] : (desk.scrollLeft + W / 2) / zoom, cy = at ? at[1] : (desk.scrollTop + H / 2) / zoom;
    zoom = z;
    root.classList.toggle('zoomed', z > 1);
    if (z === 1) { sizer.style.cssText = ''; scaler.style.cssText = ''; desk.scrollTo?.(0, 0); }
    else {
      sizer.style.width = `${W * z}px`; sizer.style.height = `${H * z}px`;
      scaler.style.width = `${W}px`; scaler.style.height = `${H}px`; scaler.style.transform = `scale(${z})`;
      desk.scrollLeft = cx * z - W / 2; desk.scrollTop = cy * z - H / 2;
    }
    zoomOut.disabled = z === 1; zoomIn.disabled = z === ZOOMS[ZOOMS.length - 1];
    if (pf && ready) pf.getSettings().showPageCorners = !reduced && z === 1 && !gatedForward();
    kick();
  }
  const zoomStep = (d) => setZoom(ZOOMS[clamp(ZOOMS.indexOf(zoom) + d, 0, ZOOMS.length - 1)]);
  zoomIn.addEventListener('click', () => zoomStep(1));
  zoomOut.addEventListener('click', () => zoomStep(-1));
  zoomOut.disabled = true;
  desk.addEventListener('dblclick', (e) => {
    if (e.target.closest(INTERACTIVE)) return;
    if (zoom > 1) return setZoom(1);
    const r = desk.getBoundingClientRect();
    setZoom(2, [e.clientX - r.left, e.clientY - r.top]);
  });
  // pan a zoomed page by dragging it
  let pan = null;
  desk.addEventListener('pointerdown', (e) => { if (zoom === 1 || e.target.closest(INTERACTIVE)) return; pan = [e.clientX, e.clientY, desk.scrollLeft, desk.scrollTop]; });
  desk.addEventListener('pointermove', (e) => { if (!pan) return; desk.scrollLeft = pan[2] - (e.clientX - pan[0]); desk.scrollTop = pan[3] - (e.clientY - pan[1]); });
  const endPan = () => { pan = null; };
  desk.addEventListener('pointerup', endPan); desk.addEventListener('pointercancel', endPan); desk.addEventListener('pointerleave', endPan);
  // a button inside the book can scroll the desk when it takes focus: the desk only scrolls when zoomed
  desk.addEventListener('scroll', () => { if (zoom === 1 && (desk.scrollLeft || desk.scrollTop)) desk.scrollTo(0, 0); });
  fullB.addEventListener('click', () => { if (document.fullscreenElement) document.exitFullscreen?.(); else root.requestFullscreen?.().catch(() => {}); });
  const onFull = () => { const on = document.fullscreenElement === root; fullB.innerHTML = icon(on ? 'unfull' : 'full'); fullB.title = on ? 'Leave full screen' : 'Full screen'; fullB.setAttribute('aria-label', fullB.title); fullB.setAttribute('aria-pressed', String(on)); };
  document.addEventListener('fullscreenchange', onFull);

  // ── the page-turner ──
  // one page or two: two side by side when they fit at a good size, one on a phone or an upright tablet
  let ratio = 0.72;
  const portraitFor = (W, H) => W < 560 || Math.min(W / 2, H * ratio) < 0.78 * Math.min(W, H * ratio);
  let fitted = '';
  function fit() {
    if (!pf || dead || !ready) return;
    const W = desk.offsetWidth, H = desk.offsetHeight;   // not clientWidth: scroll bars come and go with zoom
    if (!W || !H || `${W}x${H}` === fitted) return;
    fitted = `${W}x${H}`;
    if (zoom > 1) setZoom(1);
    pf.getSettings().minWidth = portraitFor(W, H) ? W : 1;
    pf.update();
    kick(); placeBook(false);
  }
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => fit()) : null;
  ro?.observe(desk);

  // the shape of the pages is the shape of the cover
  new Promise((res2) => {
    const im = new Image(); const t = setTimeout(() => res2(0), 2500);
    im.onload = () => { clearTimeout(t); res2(im.naturalWidth / im.naturalHeight); };
    im.onerror = () => { clearTimeout(t); res2(0); };
    im.src = u(book.cover);
  }).then((r) => {
    if (dead) return;
    ratio = clamp(r || 0.72, 0.62, 0.8);
    const W = holder.offsetWidth || 800, H = holder.offsetHeight || 600;
    pf = new PageFlip(holder, {
      width: 600, height: Math.round(600 / ratio), size: 'stretch', minWidth: portraitFor(W, H) ? W : 1, maxWidth: 1100, minHeight: 1, maxHeight: 1700,
      autoSize: false, showCover: true, usePortrait: true, drawShadow: true, maxShadowOpacity: 0.55, flippingTime: 850,
      mobileScrollSupport: true, clickEventForward: true, useMouseEvents: !reduced, showPageCorners: !reduced, disableFlipByClick: true, swipeDistance: 30, startPage: 0,
    });
    pf.on('flip', () => settle());
    pf.on('changeOrientation', () => { root.dataset.mode = pf.getOrientation(); settle(); });
    pf.on('changeState', (e) => {
      kick();
      if (e.data === 'flipping' || e.data === 'user_fold') { if (sound) pageSound(); placeBook(true); clearTimeout(autoT); }
      if (e.data === 'read') placeBook(false);
    });
    for (let g = 0; g <= NEAR; g++) fill(g);
    pf.loadFromHTML(leafEls);
    holder.style.minWidth = ''; holder.style.minHeight = '';
    // draw only while something moves: otherwise the page-turner restyles every leaf on every frame
    const R = pf.getRender(), draw = R.drawFrame.bind(R);
    let dirty = 8, idle = 0;
    R.drawFrame = () => { if (dead) return; if (R.animation || pf.getState() !== 'read' || dirty > 0 || ++idle > 40) { idle = 0; if (dirty > 0) dirty--; draw(); } };
    kick = () => { dirty = 8; };
    ready = true;
    fitted = `${desk.offsetWidth}x${desk.offsetHeight}`;
    root.dataset.mode = pf.getOrientation();
    root.dataset.ready = '1';
    settle();
    // open the book: the closed cover comes onto the desk, then the cover turns
    holder.classList.add('eb-opening'); shadow.classList.add('eb-opening');
    setTimeout(() => { holder.classList.remove('eb-opening'); shadow.classList.remove('eb-opening'); }, 900);
    setTimeout(() => { if (!dead && spreadIndex() === 0) { if (reduced) fadeTo(1); else byHand(() => pf.flipNext('bottom')); } }, reduced ? 250 : 1000);
  });

  // ── shared pieces of a page ──
  function heading(box, pg, fallback) {
    if (pg.h || fallback) box.append(el('h2', 'eb-h2', pg.h ?? fallback));
    if (pg.ar_h) box.append(arEl('p', 'eb-h-ar', pg.ar_h));
  }
  // words that can be read aloud with the highlight following the voice
  function spoken(text, cls = 'eb-text', glossary) {
    const p = el('p', cls);
    const parts = text.split(/(\s+)/);
    const words = [];
    for (const w of parts) {
      if (/^\s+$/.test(w) || !w) { p.append(document.createTextNode(w)); continue; }
      const s = el('span', 'w', w); words.push(s);
      const k = w.toLowerCase().replace(/[^a-z'-]/g, '');
      const g = glossary?.find((x) => k === x.w.toLowerCase() || (k.startsWith(x.w.toLowerCase()) && k.length - x.w.length <= 2));
      if (g) {
        s.classList.add('gl'); s.tabIndex = 0; s.setAttribute('role', 'button'); s.setAttribute('aria-label', `${g.w}: ${g.m}`);
        const tip = (e) => { e.stopPropagation(); p.querySelectorAll('.gl-tip').forEach((t) => t.remove()); const t = el('span', 'gl-tip', `${g.w}: ${g.m}`); s.append(t); setTimeout(() => t.remove(), 4500); };
        s.addEventListener('click', tip); s.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') tip(e); });
      }
      p.append(s);
    }
    return { p, words };
  }
  // read several lines one after another (only the English is read by the computer voice)
  async function readLines(lines) {
    const mine = {}; readLines.cur = mine;
    for (const [text, words] of lines) {
      if (readLines.cur !== mine || !aloud) return;
      await say(text, words);
    }
  }
  const listenBtn = (labelText, fn) => { const b = btn('btn eb-listen', labelText); b.addEventListener('click', () => { hush(); fn(); }); return b; };
  // the Arabic of a du'a or a hadith is only ever played from a teacher's recording (Voice Studio), never a computer voice
  async function arabicClip(ar) { return studioUrl(hadithClipId(ar)).catch(() => null); }

  // one multiple-choice round: opts [{ label, right }], then calls done(firstTry)
  function choices(box, opts, { done: onDone, read } = {}) {
    const row = el('div', 'eb-opts' + (opts.some((o) => isAr(o.label)) ? ' ar' : ''));
    let tries = 0;
    for (const o of shuffle(opts)) {
      const b = btn('eb-opt'); b.append(label(o.label));
      if (TEST) b.dataset.answer = String(!!o.right);
      b.addEventListener('click', () => {
        if (read && !isAr(o.label)) speak(o.label);
        if (o.right) { b.classList.add('right'); row.querySelectorAll('button').forEach((x) => (x.disabled = true)); onDone?.(tries === 0); }
        else {
          tries++; b.classList.add('nope'); b.disabled = true;
          if (tries >= 2) { const r = [...row.children].find((x) => x.dataset.right === '1'); r?.classList.add('show'); }
        }
      });
      if (o.right) b.dataset.right = '1';
      row.append(b);
    }
    box.append(row);
    return row;
  }

  // ── the page types ── each builds its page in box; x is the page's own state:
  //   x.read() reads it aloud when it is open, x.wait holds the book until actDone(x), x.mark(firstTry) scores it
  const PAGES = {
    // a page of the school's workbook as a picture: crayons to trace, colour, circle and join; letters and words to tap and hear
    scan(box, pg, x) {
      heading(box, pg);
      const fig = el('figure', 'eb-sheet');
      const sheet = el('div', 'eb-sheet-box');
      const img = el('img', 'eb-sheet-img'); img.src = u(pg.img); img.alt = pg.alt ?? `Page from ${book.title}`; img.draggable = false;
      sheet.append(img); fig.append(sheet);
      box.append(fig);
      // the picture is as big as the page allows, keeping its shape; the crayon layer lies exactly over it
      const size = () => {
        const W = fig.clientWidth, H = fig.clientHeight; if (!W || !H || !img.naturalWidth) return;
        const r = img.naturalWidth / img.naturalHeight;
        const w = Math.min(W, H * r);
        sheet.style.width = `${Math.floor(w)}px`; sheet.style.height = `${Math.floor(w / r)}px`;
      };
      if (img.complete) size(); else img.addEventListener('load', size, { once: true });
      const fro = typeof ResizeObserver === 'function' ? new ResizeObserver(size) : null; fro?.observe(fig);
      x.cleanup.push(() => fro?.disconnect());
      if (pg.draw !== false) ink(sheet, img, `${book.id}/${pg.img.split('/').pop()}`, box, x);
      if (pg.say) {
        const { p, words } = spoken(pg.say, 'eb-say');
        box.append(p);
        x.read = () => say(pg.say, words);
      }
      if (pg.tap?.length) {
        const strip = el('div', 'eb-taps');
        strip.append(el('p', 'eb-kicker', pg.tapLabel ?? 'Tap to hear'));
        const row = el('div', 'eb-tap-row');
        for (const t of pg.tap) {
          const b = btn('eb-tap');
          if (t.ar) b.append(arEl('span', 'eb-tap-ar', t.ar));
          if (t.en) b.append(el('small', null, t.en));
          b.setAttribute('aria-label', t.en ? `${t.ar ?? ''} ${t.en}` : t.ar ?? '');
          b.addEventListener('click', () => {
            hush(); b.classList.add('on'); setTimeout(() => b.classList.remove('on'), 700);
            // a letter: the Sheikh's letter voice. A word: its recorded Arabic (every device), then its meaning in English
            const L1 = t.letter ? byLetter(t.letter) : null;
            if (L1) sayLetter(L1);
            else (t.ar ? sayWord(t.ar) : Promise.resolve(false)).then(() => { if (t.en && !t.latin) sayMeaning(t.en, () => narrate(wordForVoice(t.en), { voice: 'story' })); });
          });
          row.append(b);
        }
        strip.append(row); box.append(strip);
      }
    },

    // words to read (a lesson, a story page), with a picture if there is one
    read(box, pg, x) {
      heading(box, pg);
      if (pg.img) { const f = el('figure', 'eb-fig'); const im = el('img'); im.src = u(pg.img); im.alt = pg.alt ?? ''; im.draggable = false; f.append(im); if (pg.cap) f.append(el('figcaption', null, pg.cap)); box.append(f); }
      const lines = [];
      if (pg.h && L <= 2) lines.push([pg.h, []]);
      for (const t of pg.text ?? []) {
        if (typeof t === 'string') { const { p, words } = spoken(t, 'eb-text', pg.words); box.append(p); lines.push([t, words]); }
        else if (t.ar) box.append(arEl('p', 'eb-ar', t.ar));
        else if (t.note) { const n = el('aside', 'eb-note'); if (t.note.h) n.append(el('b', null, t.note.h)); const { p, words } = spoken(t.note.t, 'eb-text'); n.append(p); box.append(n); lines.push([t.note.t, words]); }
        else if (t.list) { const ul = el(t.numbered ? 'ol' : 'ul', 'eb-list'); for (const s of t.list) { const li = el('li'); const { p, words } = spoken(s, 'eb-li'); li.append(p); ul.append(li); lines.push([s, words]); } box.append(ul); }
        else if (t.table) { const wrap = el('div', 'eb-table-wrap'); const tb2 = el('table', 'eb-table'); t.table.forEach((r, ri) => { const tr = el('tr'); r.forEach((c) => { const cell = el(ri === 0 && t.head !== false ? 'th' : 'td'); cell.append(label(String(c))); tr.append(cell); }); tb2.append(tr); }); wrap.append(tb2); box.append(wrap); }
      }
      if (pg.words?.length && L >= 2) {
        const g = el('div', 'eb-words'); g.append(el('p', 'eb-kicker', 'New words'));
        const dl = el('dl'); for (const w of pg.words) { dl.append(el('dt', null, w.w), el('dd', null, w.m)); } g.append(dl); box.append(g);
      }
      x.read = () => readLines(lines);
    },

    // questions: one at a time, two tries, then the answer is shown with why
    quiz(box, pg, x) {
      heading(box, pg, book.chapters[x.ci].test ? null : 'Check what you know');
      const items = pg.shuffle ? shuffle(pg.items) : pg.items;
      const host = el('div', 'eb-qhost'); box.append(host);
      let k = 0;
      x.wait = true;
      const round = () => {
        host.replaceChildren();
        if (k >= items.length) { actDone(x); host.append(el('p', 'eb-msg', 'All done. Turn the page.')); if (x.live) speak('All done. Turn the page.'); return; }
        const it = items[k];
        host.append(el('p', 'eb-kicker', `Question ${k + 1} of ${items.length}`));
        const q = isAr(it.q) ? arEl('h3', 'eb-q ar', it.q) : el('h3', 'eb-q', it.q);
        host.append(q);
        if (young) { const r = listenBtn('Read it to me', () => narrate(it.q, { voice: 'story' })); host.append(r); }
        const why = el('p', 'eb-why'); why.hidden = true;
        choices(host, [{ label: it.a, right: true }, ...it.w.map((s) => ({ label: s }))], {
          read: L === 1,
          done: (ok) => {
            x.mark(ok);
            why.textContent = (ok ? 'Right! ' : "That's it. ") + (it.why ?? ''); why.hidden = false;
            if (aloud) narrate(why.textContent, { voice: 'story' });
            const nb = btn('btn btn-primary', k + 1 < items.length ? 'Next question' : 'Finish'); nb.addEventListener('click', () => { k++; round(); });
            host.append(nb); nb.focus?.({ preventScroll: true });
          },
        });
        host.append(why);
        if (k > 0 && L === 1 && aloud && x.live) narrate(it.q, { voice: 'story' });
      };
      x.read = () => (L === 1 && k < items.length ? say(items[k].q) : null);
      round();
    },

    // match: tap one on the left, then its partner on the right
    match(box, pg, x) {
      heading(box, pg, 'Match them');
      if (pg.prompt) box.append(el('p', 'eb-prompt', pg.prompt));
      const grid = el('div', 'eb-match');
      const left = el('div', 'eb-col'), right = el('div', 'eb-col');
      grid.append(left, right); box.append(grid);
      let pick = null, leftN = pg.pairs.length, slips = 0;
      x.wait = true;
      const mk = (text, i, side) => { const b = btn('eb-m'); b.append(label(text)); b.dataset.i = String(i); b.dataset.side = side; if (TEST) b.dataset.pair = String(i); return b; };
      const L_ = shuffle(pg.pairs.map((p, i) => mk(p[0], i, 'l'))), R_ = shuffle(pg.pairs.map((p, i) => mk(p[1], i, 'r')));
      const tap = (b) => {
        if (b.disabled) return;
        if (!pick || pick.dataset.side === b.dataset.side) { pick?.classList.remove('pick'); pick = b; b.classList.add('pick'); if (L === 1 && !isAr(b.textContent)) speak(b.textContent); return; }
        if (pick.dataset.i === b.dataset.i) {
          [pick, b].forEach((y) => { y.classList.remove('pick'); y.classList.add('right'); y.disabled = true; });
          pick = null; leftN--;
          if (!leftN) { x.mark(slips <= Math.floor(pg.pairs.length / 3)); actDone(x); box.append(el('p', 'eb-msg', 'All matched! Turn the page.')); speak('All matched! Turn the page.'); }
        } else { slips++; b.classList.add('nope'); setTimeout(() => b.classList.remove('nope'), 500); }
      };
      [...L_, ...R_].forEach((b) => b.addEventListener('click', () => tap(b)));
      left.append(...L_); right.append(...R_);
      x.read = () => say(pg.prompt ?? 'Tap one on the left, then its partner on the right.');
    },

    // order: tap them in the right order
    order(box, pg, x) {
      heading(box, pg, 'Put them in order');
      if (pg.prompt) box.append(el('p', 'eb-prompt', pg.prompt));
      const doneL = el('ol', 'eb-done'); const pool = el('div', 'eb-pool');
      box.append(doneL, pool);
      let want = 0, slips = 0;
      x.wait = true;
      for (const [i, t] of shuffle(pg.items.map((t, i) => [i, t]))) {
        const b = btn('eb-m'); b.append(label(t)); if (TEST) b.dataset.order = String(i);
        b.addEventListener('click', () => {
          if (i === want) { want++; b.remove(); const li = el('li'); li.append(label(t)); doneL.append(li); if (want === pg.items.length) { x.mark(slips <= 1); actDone(x); box.append(el('p', 'eb-msg', "That's the right order!")); speak("That's the right order!"); } }
          else { slips++; b.classList.add('nope'); setTimeout(() => b.classList.remove('nope'), 500); }
        });
        pool.append(b);
      }
      x.read = () => say(pg.prompt ?? 'Tap them in the right order.');
    },

    // fill the gap: a sentence with ___
    gap(box, pg, x) {
      heading(box, pg, 'Fill the gap');
      const host = el('div', 'eb-qhost'); box.append(host);
      let k = 0; x.wait = true;
      const round = () => {
        host.replaceChildren();
        if (k >= pg.items.length) { actDone(x); host.append(el('p', 'eb-msg', 'All done. Turn the page.')); return; }
        const it = pg.items[k];
        host.append(el('p', 'eb-kicker', `${k + 1} of ${pg.items.length}`));
        const [a, b] = it.t.split('___');
        const s = (isAr(it.t.replace('___', '')) ? arEl : el)('p', 'eb-gap'); const blank = el('span', 'eb-blank', '_____');
        s.append(a ?? '', blank, b ?? ''); host.append(s);
        choices(host, [{ label: it.a, right: true }, ...it.w.map((w) => ({ label: w }))], {
          done: (ok) => { x.mark(ok); blank.textContent = it.a; blank.classList.add('filled'); setTimeout(() => { k++; round(); }, 1100); },
        });
      };
      round();
    },

    // sort: tap a card, then the basket it belongs in
    sort(box, pg, x) {
      heading(box, pg, 'Sort them');
      if (pg.prompt) box.append(el('p', 'eb-prompt', pg.prompt));
      const baskets = el('div', 'eb-baskets');
      const pool = el('div', 'eb-pool');
      box.append(pool, baskets);
      let pick = null, leftN = pg.items.length, slips = 0;
      x.wait = true;
      const bs = pg.groups.map((g, gi) => { const b = btn('eb-basket'); b.append(label(g)); const inside = el('div', 'eb-in'); b.append(inside); b.dataset.g = String(gi); baskets.append(b); return [b, inside]; });
      for (const [t, g] of shuffle(pg.items)) {
        const c = btn('eb-m'); c.append(label(t)); c.dataset.g = String(g);
        c.addEventListener('click', () => { pool.querySelectorAll('.pick').forEach((y) => y.classList.remove('pick')); pick = c; c.classList.add('pick'); if (L === 1 && !isAr(t)) speak(t); });
        pool.append(c);
      }
      bs.forEach(([b, inside], gi) => b.addEventListener('click', () => {
        if (!pick) return;
        if (+pick.dataset.g === gi) { pick.classList.remove('pick'); pick.disabled = true; inside.append(pick); pick = null; leftN--; if (!leftN) { x.mark(slips <= 1); actDone(x); box.append(el('p', 'eb-msg', 'All sorted! Turn the page.')); speak('All sorted! Turn the page.'); } }
        else { slips++; pick.classList.add('nope'); const p = pick; setTimeout(() => p.classList.remove('nope'), 500); }
      }));
      x.read = () => say(pg.prompt ?? 'Tap a card, then the basket it goes in.');
    },

    // listen and find the letter (the Sheikh's letter voice)
    find(box, pg, x) {
      heading(box, pg, 'Listen and find the letter');
      const letters = pg.letters.filter((s) => byLetter(s));
      const rounds = pg.rounds ?? Math.min(6, letters.length * 2);
      const n = Math.min(letters.length, L === 1 ? 3 : 4);
      const host = el('div', 'eb-qhost'); box.append(host);
      let k = 0; x.wait = true;
      const order = []; while (order.length < rounds) order.push(...shuffle(letters)); order.length = rounds;
      const round = () => {
        host.replaceChildren();
        if (k >= rounds) { actDone(x); host.append(el('p', 'eb-msg', "Masha'Allah! Turn the page.")); if (x.live) speak('Masha Allah! Turn the page.'); return; }
        const target = order[k];
        host.append(el('p', 'eb-kicker', `${k + 1} of ${rounds}`));
        const again = btn('btn eb-listen', 'Hear it again'); again.addEventListener('click', () => sayLetter(byLetter(target)));
        host.append(again);
        const opts = [target, ...shuffle(letters.filter((s) => s !== target)).slice(0, n - 1)];
        const row = choices(host, opts.map((s) => ({ label: s, right: s === target })), { done: (ok) => { x.mark(ok); setTimeout(() => { k++; round(); }, 900); } });
        row.classList.add('big');
        if (k > 0 && x.live) setTimeout(() => sayLetter(byLetter(target)), 250);
      };
      // the letter is said when the page opens, even when nothing else is read aloud
      x.read = () => (k < rounds ? sayLetter(byLetter(order[k])) : null);
      x.always = true;
      round();
    },

    // something to write: kept on this computer only
    write(box, pg, x) {
      heading(box, pg, 'Your turn to write');
      const { p, words } = spoken(pg.prompt, 'eb-prompt'); box.append(p);
      const key = `qc.books.write.${book.id}.${x.ci}.${x.pi}`;
      const ta = el('textarea', 'eb-write'); ta.rows = pg.lines ?? 4; ta.value = store.get(key, ''); ta.setAttribute('aria-label', pg.prompt);
      ta.placeholder = pg.hint ?? 'Write here…';
      const saved = el('small', 'eb-saved', 'Kept on this computer.');
      let t = null;
      ta.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => store.set(key, ta.value), 400); });
      x.cleanup.push(() => store.set(key, ta.value));
      box.append(ta, saved);
      x.read = () => say(pg.prompt, words);
    },

    // a du'a: the Arabic, how to say it, what it means, and when we say it
    dua(box, pg, x) {
      heading(box, pg);
      const card = el('div', 'eb-card eb-dua');
      if (pg.when) card.append(el('p', 'eb-kicker', pg.when));
      const ar = arEl('p', 'eb-ar big', pg.ar);
      card.append(ar);
      if (pg.tr) card.append(el('p', 'eb-tr', pg.tr));
      const { p, words } = spoken(pg.en, 'eb-en'); card.append(p);
      if (pg.src) card.append(el('p', 'eb-src', pg.src));
      const listen = listenBtn('Listen', async () => { const url = await arabicClip(pg.ar); if (url) { ar.classList.add('playing'); await playUrl(url, 30000); ar.classList.remove('playing'); } narrate(pg.en, { voice: 'story', words }); });
      card.append(listen);
      box.append(card);
      x.read = () => readLines([...(pg.when ? [[pg.when, []]] : []), [pg.en, words]]);
    },

    // a hadith: the Arabic (a teacher's recording if there is one), the meaning, and where it is reported
    hadith(box, pg, x) {
      heading(box, pg);
      const card = el('div', 'eb-card eb-hadith');
      card.append(el('p', 'eb-kicker', pg.kicker ?? 'The Prophet ﷺ said:'));
      const ar = pg.ar ? arEl('p', 'eb-ar', pg.ar) : null; if (ar) card.append(ar);
      const { p, words } = spoken(`"${pg.en}"`, 'eb-en'); card.append(p);
      card.append(el('p', 'eb-src', `Reported by ${pg.src}`));
      box.append(card);
      x.read = async () => {
        if (!aloud) return;
        const tk = token;
        const url = pg.ar ? await arabicClip(pg.ar) : null;
        if (tk !== token) return;
        if (url && ar) { ar.classList.add('playing'); await playUrl(url, 60000); ar.classList.remove('playing'); }
        if (tk !== token) return;
        await readLines([[pg.en, words]]);
      };
      if (pg.text) for (const t of pg.text) { const s = spoken(t, 'eb-text', pg.words); box.append(s.p); }
    },

    // an ayah: the Arabic straight from the Tanzil text (public/data/surah), the reciter, and the meaning
    ayah(box, pg, x) {
      heading(box, pg);
      const card = el('div', 'eb-card eb-ayah');
      card.append(el('p', 'eb-kicker', 'Allah says in the Qurʾan:'));
      const ar = arEl('p', 'eb-ar quran', '…'); card.append(ar);
      const { p, words } = spoken(`"${pg.en}"`, 'eb-en'); card.append(p);
      const src = el('p', 'eb-src', `Surah ${pg.s}:${pg.a}`); card.append(src);
      const listen = listenBtn('Listen to the ayah', () => playUrl(audioUrl(reciter, pg.s, pg.a), 90000)); card.append(listen);
      box.append(card);
      fetch(u(`data/surah/${String(pg.s).padStart(3, '0')}.json`)).then((r) => r.json()).then((sura) => {
        let t = sura.ayahs[pg.a - 1].ar;
        if (pg.w) t = t.split(' ').slice(pg.w[0] - 1, pg.w[1]).join(' ');
        ar.textContent = qpc(t); src.textContent = `Surah ${sura.en} ${pg.s}:${pg.a}`;
      }).catch(() => { ar.textContent = ''; });
      x.read = () => readLines([[pg.en, words]]);
    },
  };

  // ── crayons on a workbook page ──
  function ink(sheet, img, key, box, x) {
    const COLORS = ['#1F2937', '#D7263D', '#F49D37', '#F6C64B', '#3F8E3A', '#2C6FBB', '#8E44AD', '#8A5A33'];
    const k = `qc.books.ink.${key}`;
    let strokes = store.get(k, []);
    let color = COLORS[1], size = L <= 2 ? 14 : 8, erase = false;
    const cv = el('canvas', 'eb-ink'); cv.setAttribute('aria-label', 'Draw on the page');
    sheet.append(cv);
    const ctx = cv.getContext('2d');
    // the layout size (not the size on screen, which a turning or zoomed page changes)
    const fitInk = () => {
      const w = sheet.offsetWidth, h = sheet.offsetHeight; if (!w || !h) return;
      const d = Math.min(2, devicePixelRatio || 1);
      if (cv.width === Math.round(w * d) && cv.height === Math.round(h * d)) return;
      cv.width = Math.round(w * d); cv.height = Math.round(h * d);
      redraw();
    };
    const line = (s) => {
      const W = cv.width, H = cv.height, pts = s.p;
      ctx.globalCompositeOperation = s.e ? 'destination-out' : 'source-over';
      ctx.strokeStyle = s.c; ctx.fillStyle = s.c; ctx.lineWidth = (s.w / 1000) * W; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.globalAlpha = s.e ? 1 : 0.85;
      ctx.beginPath();
      ctx.moveTo((pts[0] / 10000) * W, (pts[1] / 10000) * H);
      for (let i = 2; i < pts.length; i += 2) ctx.lineTo((pts[i] / 10000) * W, (pts[i + 1] / 10000) * H);
      if (pts.length === 2) ctx.lineTo((pts[0] / 10000) * W + 0.1, (pts[1] / 10000) * H);
      ctx.stroke();
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    };
    const redraw = () => { ctx.clearRect(0, 0, cv.width, cv.height); strokes.forEach(line); };
    let changed = false;
    const save = () => { if (changed) store.set(k, strokes.slice(-400)); changed = false; };
    let cur = null;
    const pt = (e) => { const r = cv.getBoundingClientRect(); return [Math.round(((e.clientX - r.left) / r.width) * 10000), Math.round(((e.clientY - r.top) / r.height) * 10000)]; };
    cv.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); cv.setPointerCapture?.(e.pointerId); cur = { c: color, w: erase ? size * 3 : size, e: erase || undefined, p: pt(e) }; strokes.push(cur); changed = true; line(cur); });
    cv.addEventListener('pointermove', (e) => { if (!cur) return; cur.p.push(...pt(e)); redraw(); });
    const end = () => { if (cur) { cur = null; save(); } };
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end); cv.addEventListener('pointerleave', end);

    const tools = el('div', 'eb-tools'); tools.setAttribute('role', 'toolbar'); tools.setAttribute('aria-label', 'Crayons');
    const pens = COLORS.map((c) => { const b = btn('eb-crayon', '', `Crayon ${c}`); b.style.setProperty('--c', c); b.addEventListener('click', () => { color = c; erase = false; sel(b); }); return b; });
    const rub = btn('eb-tool', 'Rubber'); rub.addEventListener('click', () => { erase = true; sel(rub); });
    const thick = btn('eb-tool', size > 10 ? 'Thin' : 'Thick'); thick.addEventListener('click', () => { size = size > 10 ? 6 : 16; thick.textContent = size > 10 ? 'Thin' : 'Thick'; });
    const undo = btn('eb-tool', 'Undo'); undo.addEventListener('click', () => { strokes.pop(); changed = true; redraw(); save(); });
    const clr = btn('eb-tool', 'Clear'); clr.addEventListener('click', () => { if (clr.dataset.sure) { strokes = []; changed = true; redraw(); save(); clr.textContent = 'Clear'; delete clr.dataset.sure; } else { clr.dataset.sure = '1'; clr.textContent = 'Tap again'; setTimeout(() => { clr.textContent = 'Clear'; delete clr.dataset.sure; }, 3000); } });
    const sel = (b) => { tools.querySelectorAll('.on').forEach((y) => y.classList.remove('on')); b.classList.add('on'); };
    tools.append(...pens, rub, thick, undo, clr);
    sel(pens[1]);
    box.insertBefore(tools, sheet.parentElement);
    if (img.complete) fitInk(); else img.addEventListener('load', fitInk, { once: true });
    const ro2 = typeof ResizeObserver === 'function' ? new ResizeObserver(fitInk) : null; ro2?.observe(sheet);
    x.cleanup.push(() => { ro2?.disconnect(); save(); });
  }

  function stop() {
    if (dead) return;
    hush(); clearTimeout(autoT); clearTimeout(fadeT);
    if (saveT) { clearTimeout(saveT); saveT = null; onSave?.(); }
    for (let g = 0; g < N; g++) empty(g);
    dead = true;
    removeEventListener('keydown', onKey);
    document.removeEventListener('fullscreenchange', onFull);
    ro?.disconnect();
    if (document.fullscreenElement === root) document.exitFullscreen?.()?.catch?.(() => {});
    if (pf) {
      try { removeEventListener('resize', pf.getUI().onResize); } catch {}
      try { pf.destroy(); } catch {}
      try { pf.getRender().animation = null; } catch {}
    }
  }
  return { stop };
}
