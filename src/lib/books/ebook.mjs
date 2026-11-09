// The Al-Huda Books: the school's own books (made in Canva) as interactive digital books.
//   mountBookShelf(root, { level, progress, onOpen })                  the shelf: books for my level first, then the rest
//   openEbook(root, book, { progress, reciter, onChapter, onExit, onSave })
//      onChapter({ book, chapter, index, stars, first, total })   when a chapter is finished
//      onSave()                                                   after the reading place changes (to save progress)
//
// A book (src/lib/books/*.mjs) is { id, title, ar, level, ages, color, cover, about, chapters: [{ title, test?, pages }] }.
// The page types are described in docs/al-huda-books.md. How a book behaves follows its level:
//   Level 1 (4–6)  read aloud from the start, big buttons, questions read out, crayons on the workbook pages
//   Level 2 (7–8)  read aloud from the start; the child reads the questions (a button reads them out)
//   Level 3 (9–10) and 4 (10–14)  the child reads; tests are scored; answers to write are kept on this computer
import { narrate, hush as stopNarration } from '../narration.mjs';
import { studioUrl, playUrl, stopSound, sayLetter, browserSay } from '../voice.mjs';
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
  const mine = books.filter((b) => b.level === level || b.levels?.includes(level));
  const rest = books.filter((b) => !mine.includes(b));
  const group = (title, list) => {
    if (!list.length) return;
    root.append(el('h2', 'eb-shelf-h', title));
    const grid = el('div', 'eb-shelf');
    for (const b of list) {
      const done = doneCount(progress, b), n = chapterCount(b);
      const card = btn('eb-book'); card.dataset.book = b.id; card.style.setProperty('--book', b.color);
      const img = el('img', 'eb-cover'); img.src = u(b.cover); img.alt = ''; img.loading = 'lazy';
      const bar = el('span', 'eb-bar'); const fill = el('i'); fill.style.width = `${Math.round((done / n) * 100)}%`; bar.append(fill);
      card.append(img, el('b', 'eb-book-t', b.title));
      if (b.ar) card.append(arEl('span', 'eb-book-ar', b.ar));
      card.append(el('span', 'eb-book-meta', `Level ${b.levels ? b.levels.join('–') : b.level} · ages ${b.ages}`), bar,
        el('small', 'eb-book-done', done ? `${done} of ${n} ${b.unit ?? 'chapters'} done` : `${n} ${b.unit ?? 'chapters'}`));
      card.setAttribute('aria-label', `${b.title}. Level ${b.level}, ages ${b.ages}. ${done} of ${n} done.`);
      card.addEventListener('click', () => onOpen?.(b));
      grid.append(card);
    }
    root.append(grid);
  };
  group(mine.length ? 'Books for my class' : 'All books', mine.length ? mine : books);
  if (mine.length) group('More books from Al-Huda', rest);
}

// ── the reader ──────────────────────────────────────────────
export function openEbook(root, book, { progress = {}, reciter = 'Husary_128kbps', onChapter, onExit, onSave }) {
  const L = book.level;
  const young = L <= 2;
  const pb = bookProgress(progress, book);
  let aloud = store.get(`qc.books.aloud.${L}`, young);
  let chapter = null, ci = 0, at = 0, score = null, cleanup = [];
  const hush = () => { stopNarration(); stopSound(); };
  const speak = (text, words) => { if (aloud && text) narrate(text, { voice: 'story', words: words ?? [] }); };

  root.replaceChildren();
  for (const k of Object.keys(root.dataset)) delete root.dataset[k];
  root.className = `eb-reader lv${L}`;
  root.style.setProperty('--book', book.color);
  const top = el('div', 'eb-top');
  const home = btn('eb-chip', 'Contents');
  const title = el('div', 'eb-title'); const tb = el('b', null, book.title); const tc = el('small'); title.append(tb, tc);
  const aloudB = btn('eb-chip');
  const setAloud = () => { aloudB.textContent = aloud ? 'Reading to me: on' : 'Reading to me: off'; aloudB.setAttribute('aria-pressed', String(aloud)); };
  setAloud();
  aloudB.addEventListener('click', () => { aloud = !aloud; store.set(`qc.books.aloud.${L}`, aloud); setAloud(); if (!aloud) hush(); else readCurrent?.(); });
  const close = btn('eb-chip', 'Close the book');
  close.addEventListener('click', () => { stop(); onExit?.(); });
  home.addEventListener('click', () => contents());
  top.append(home, title, aloudB, close);
  const stage = el('div', 'eb-stage');
  const nav = el('div', 'eb-nav');
  const back = btn('eb-btn back', '‹', 'Back');
  const where = el('span', 'eb-where');
  const bar = el('span', 'eb-bar'); const fill = el('i'); bar.append(fill);
  const next = btn('eb-btn next', '›', 'Next page');
  nav.append(back, where, bar, next);
  root.append(top, stage, nav);
  let readCurrent = null;

  const setWait = (on) => { next.disabled = !!on; next.classList.toggle('wait', !!on); };
  const clean = () => { cleanup.forEach((f) => { try { f(); } catch {} }); cleanup = []; };

  // ── contents ──
  function contents() {
    hush(); clean();
    chapter = null; readCurrent = null;
    root.dataset.view = 'contents';
    tc.textContent = book.ar ?? '';
    nav.hidden = true; home.hidden = true;
    stage.replaceChildren();
    const head = el('div', 'eb-head');
    const img = el('img', 'eb-head-cover'); img.src = u(book.cover); img.alt = `The cover of ${book.title}`;
    const info = el('div', 'eb-head-info');
    info.append(el('p', 'eb-kicker', `Level ${book.levels ? book.levels.join('–') : L} · ages ${book.ages}`), el('h1', 'eb-h1', book.title));
    if (book.ar) info.append(arEl('p', 'eb-head-ar', book.ar));
    info.append(el('p', 'eb-about', book.about));
    const resume = book.chapters.findIndex((_, i) => !pb.done[i]);
    const go = btn('btn btn-primary big', resume < 0 ? 'Read it again from the start' : resume === 0 && !pb.page[0] ? 'Start reading' : 'Carry on reading');
    go.addEventListener('click', () => openChapter(resume < 0 ? 0 : resume));
    info.append(go);
    head.append(img, info);
    const list = el('ol', 'eb-toc');
    book.chapters.forEach((c, i) => {
      const li = el('li');
      const b = btn('eb-toc-b' + (pb.done[i] ? ' done' : '') + (c.test ? ' test' : '')); b.dataset.chapter = String(i);
      if (young && c.pages[0]?.img) { const t = el('img', 'eb-toc-img'); t.src = u(c.pages[0].img); t.alt = ''; t.loading = 'lazy'; b.append(t); }
      b.append(el('span', 'eb-toc-n', String(i + 1)), el('b', null, c.title));
      if (c.ar) b.append(arEl('span', 'eb-toc-ar', c.ar));
      const s = pb.done[i]?.stars ?? 0;
      b.append(el('span', 'eb-toc-s', pb.done[i] ? '★'.repeat(s) + '☆'.repeat(3 - s) : `${c.pages.length} pages`));
      b.addEventListener('click', () => openChapter(i));
      li.append(b); list.append(li);
    });
    stage.append(head, el('h2', 'eb-toc-h', book.unit === 'units' ? 'Units and lessons' : 'Chapters'), list);
    if (book.note) stage.append(el('p', 'preview-note', book.note));
    root.scrollIntoView?.({ block: 'start' });
  }

  // ── a chapter ──
  function openChapter(i) {
    ci = i; chapter = book.chapters[i];
    score = { first: 0, total: 0 };
    pb.at = i; onSave?.();
    nav.hidden = false; home.hidden = false;
    tc.textContent = `${i + 1}. ${chapter.title}`;
    const p = pb.page[i] ?? 0;
    showPage(p > 0 && p < chapter.pages.length ? p : 0);
  }
  function showPage(i) {
    hush(); clean();
    at = i; readCurrent = null;
    root.dataset.view = 'page'; root.dataset.page = String(i);
    pb.page[ci] = i;
    const n = chapter.pages.length;
    where.textContent = `Page ${i + 1} of ${n}`;
    fill.style.width = `${Math.round(((i + 1) / n) * 100)}%`;
    back.disabled = i === 0;
    setWait(false);
    stage.replaceChildren();
    const pg = chapter.pages[i];
    const box = el('div', `eb-page t-${pg.type}`);
    stage.append(box);
    (PAGES[pg.type] ?? PAGES.read)(box, pg);
    stage.scrollTop = 0; window.scrollTo?.(0, 0);
  }
  function finishChapter() {
    hush(); clean();
    readCurrent = null;
    root.dataset.view = 'end';
    const scored = score.total > 0;
    const pct = scored ? Math.round((score.first / score.total) * 100) : 100;
    const stars = !scored ? 3 : pct >= 85 ? 3 : pct >= 50 ? 2 : 1;
    const was = pb.done[ci];
    pb.done[ci] = { stars: Math.max(stars, was?.stars ?? 0), pct: Math.max(pct, was?.pct ?? 0) };
    pb.page[ci] = 0;
    root.dataset.stars = String(stars);
    stage.replaceChildren();
    const card = el('div', 'eb-card eb-end');
    card.append(el('p', 'eb-kicker', chapter.test ? 'Test finished' : 'Chapter finished'), el('h2', 'eb-h2', chapter.title));
    const s = el('p', 'eb-stars', '★'.repeat(stars) + '☆'.repeat(3 - stars)); s.setAttribute('aria-label', `${stars} of 3 stars`);
    card.append(s);
    if (scored) card.append(el('p', 'eb-score', chapter.test || L >= 3 ? `${score.first} of ${score.total} right first time (${pct}%)` : `${score.first} of ${score.total} right first time`));
    const msg = stars === 3 ? "Masha'Allah! Well done." : stars === 2 ? 'Good work. Try it again to earn three stars.' : 'You finished it. Read it again and try once more.';
    card.append(el('p', 'eb-msg', msg));
    speak(msg);
    const row = el('div', 'eb-row');
    if (ci + 1 < book.chapters.length) { const nx = btn('btn btn-primary big', `Next: ${book.chapters[ci + 1].title}`); nx.addEventListener('click', () => openChapter(ci + 1)); row.append(nx); }
    const again = btn('btn big', 'Read this chapter again'); again.addEventListener('click', () => openChapter(ci));
    const toc = btn('btn big', 'Contents'); toc.addEventListener('click', contents);
    row.append(again, toc);
    card.append(row);
    stage.append(card);
    where.textContent = 'Finished'; fill.style.width = '100%';
    next.disabled = true; back.disabled = false;
    // after the end card is on the page, so the classroom can add the Ta'aleem Stars to it (it also saves the progress)
    if (onChapter) onChapter({ book, chapter, index: ci, stars, first: score.first, total: score.total, pct, test: !!chapter.test });
    else onSave?.();
  }
  next.addEventListener('click', () => { if (!chapter) return; if (root.dataset.view === 'end') return; if (at + 1 < chapter.pages.length) showPage(at + 1); else finishChapter(); });
  back.addEventListener('click', () => { if (!chapter) return; if (root.dataset.view === 'end') return showPage(chapter.pages.length - 1); if (at > 0) showPage(at - 1); });
  const onKey = (e) => {
    if (!root.isConnected) return removeEventListener('keydown', onKey);
    if (/^(TEXTAREA|INPUT|SELECT)$/.test(document.activeElement?.tagName ?? '')) return;
    if (e.key === 'ArrowRight' && !next.disabled && !nav.hidden) next.click();
    if (e.key === 'ArrowLeft' && !back.disabled && !nav.hidden) back.click();
  };
  addEventListener('keydown', onKey);
  // swipe (not on a page you can draw on)
  let sx = null;
  stage.addEventListener('pointerdown', (e) => { sx = e.target.closest('canvas, textarea') ? null : e.clientX; });
  stage.addEventListener('pointerup', (e) => { if (sx == null || nav.hidden) return; const d = e.clientX - sx; sx = null; if (Math.abs(d) > 80) (d < 0 ? (!next.disabled && next.click()) : (!back.disabled && back.click())); });

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
      await new Promise((r) => narrate(text, { voice: 'story', words, onEnd: r }));
    }
  }
  cleanup.push(() => { readLines.cur = null; });
  const listenBtn = (labelText, fn) => { const b = btn('btn eb-listen', labelText); b.addEventListener('click', () => { hush(); fn(); }); return b; };
  // the Arabic of a du'a or a hadith is only ever played from a teacher's recording (Voice Studio), never a computer voice
  async function arabicClip(ar) { return studioUrl(hadithClipId(ar)).catch(() => null); }

  // one multiple-choice round: opts [{ label, right }], then calls done(firstTry)
  function choices(box, opts, { done, read } = {}) {
    const row = el('div', 'eb-opts' + (opts.some((o) => isAr(o.label)) ? ' ar' : ''));
    let tries = 0;
    for (const o of shuffle(opts)) {
      const b = btn('eb-opt'); b.append(label(o.label));
      if (TEST) b.dataset.answer = String(!!o.right);
      b.addEventListener('click', () => {
        if (read && !isAr(o.label)) speak(o.label);
        if (o.right) { b.classList.add('right'); row.querySelectorAll('button').forEach((x) => (x.disabled = true)); done?.(tries === 0); }
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
  const mark = (ok) => { score.total++; if (ok) score.first++; };

  // ── the page types ──
  const PAGES = {
    // a page of the school's workbook as a picture: crayons to trace, colour, circle and join; letters and words to tap and hear
    scan(box, pg) {
      heading(box, pg);
      const fig = el('figure', 'eb-sheet');
      const img = el('img', 'eb-sheet-img'); img.src = u(pg.img); img.alt = pg.alt ?? `Page from ${book.title}`; img.draggable = false;
      fig.append(img);
      box.append(fig);
      if (pg.draw !== false) ink(fig, img, `${book.id}/${pg.img.split('/').pop()}`, box);
      if (pg.say) {
        const { p, words } = spoken(pg.say, 'eb-say');
        box.append(p);
        readCurrent = () => speak(pg.say, words);
        readCurrent();
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
            // a letter: the Sheikh's letter voice. A word: the browser's Arabic voice if the computer has one, then the meaning in English
            const L1 = t.letter ? byLetter(t.letter) : null;
            if (L1) sayLetter(L1);
            else (t.ar ? browserSay(t.ar) : Promise.resolve(false)).then(() => { if (t.en) narrate(t.en, { voice: 'story' }); });
          });
          row.append(b);
        }
        strip.append(row); box.append(strip);
      }
    },

    // words to read (a lesson, a story page), with a picture if there is one
    read(box, pg) {
      heading(box, pg);
      if (pg.img) { const f = el('figure', 'eb-fig'); const im = el('img'); im.src = u(pg.img); im.alt = pg.alt ?? ''; im.loading = 'lazy'; f.append(im); if (pg.cap) f.append(el('figcaption', null, pg.cap)); box.append(f); }
      const lines = [];
      if (pg.h && aloud && L <= 2) lines.push([pg.h, []]);
      for (const t of pg.text ?? []) {
        if (typeof t === 'string') { const { p, words } = spoken(t, 'eb-text', pg.words); box.append(p); lines.push([t, words]); }
        else if (t.ar) box.append(arEl('p', 'eb-ar', t.ar));
        else if (t.note) { const n = el('aside', 'eb-note'); if (t.note.h) n.append(el('b', null, t.note.h)); const { p, words } = spoken(t.note.t, 'eb-text'); n.append(p); box.append(n); lines.push([t.note.t, words]); }
        else if (t.list) { const ul = el(t.numbered ? 'ol' : 'ul', 'eb-list'); for (const x of t.list) { const li = el('li'); const { p, words } = spoken(x, 'eb-li'); li.append(p); ul.append(li); lines.push([x, words]); } box.append(ul); }
        else if (t.table) { const wrap = el('div', 'eb-table-wrap'); const tb = el('table', 'eb-table'); t.table.forEach((r, ri) => { const tr = el('tr'); r.forEach((c) => { const cell = el(ri === 0 && t.head !== false ? 'th' : 'td'); cell.append(label(String(c))); tr.append(cell); }); tb.append(tr); }); wrap.append(tb); box.append(wrap); }
      }
      if (pg.words?.length && L >= 2) {
        const g = el('div', 'eb-words'); g.append(el('p', 'eb-kicker', 'New words'));
        const dl = el('dl'); for (const w of pg.words) { dl.append(el('dt', null, w.w), el('dd', null, w.m)); } g.append(dl); box.append(g);
      }
      readCurrent = () => readLines(lines);
      if (aloud) readCurrent();
    },

    // questions: one at a time, two tries, then the answer is shown with why
    quiz(box, pg) {
      heading(box, pg, chapter.test ? null : 'Check what you know');
      const items = pg.shuffle ? shuffle(pg.items) : pg.items;
      const host = el('div'); box.append(host);
      let k = 0;
      setWait(true);
      const round = () => {
        host.replaceChildren();
        if (k >= items.length) { setWait(false); host.append(el('p', 'eb-msg', 'All done. Turn the page.')); speak('All done. Turn the page.'); return; }
        const it = items[k];
        host.append(el('p', 'eb-kicker', `Question ${k + 1} of ${items.length}`));
        const q = isAr(it.q) ? arEl('h3', 'eb-q ar', it.q) : el('h3', 'eb-q', it.q);
        host.append(q);
        if (young) { const r = listenBtn('Read it to me', () => narrate(it.q, { voice: 'story' })); host.append(r); }
        const why = el('p', 'eb-why'); why.hidden = true;
        choices(host, [{ label: it.a, right: true }, ...it.w.map((x) => ({ label: x }))], {
          read: L === 1,
          done: (ok) => {
            mark(ok);
            why.textContent = (ok ? 'Right! ' : "That's it. ") + (it.why ?? ''); why.hidden = false;
            if (aloud) narrate(why.textContent, { voice: 'story' });
            const nb = btn('btn btn-primary', k + 1 < items.length ? 'Next question' : 'Finish'); nb.addEventListener('click', () => { k++; round(); });
            host.append(nb); nb.focus?.();
          },
        });
        host.append(why);
        if (L === 1 && aloud) narrate(it.q, { voice: 'story' });
      };
      round();
    },

    // match: tap one on the left, then its partner on the right
    match(box, pg) {
      heading(box, pg, 'Match them');
      if (pg.prompt) box.append(el('p', 'eb-prompt', pg.prompt));
      const grid = el('div', 'eb-match');
      const left = el('div', 'eb-col'), right = el('div', 'eb-col');
      grid.append(left, right); box.append(grid);
      let pick = null, left_n = pg.pairs.length, slips = 0;
      setWait(true);
      const mk = (text, i, side) => { const b = btn('eb-m'); b.append(label(text)); b.dataset.i = String(i); b.dataset.side = side; if (TEST) b.dataset.pair = String(i); return b; };
      const L_ = shuffle(pg.pairs.map((p, i) => mk(p[0], i, 'l'))), R_ = shuffle(pg.pairs.map((p, i) => mk(p[1], i, 'r')));
      const tap = (b) => {
        if (b.disabled) return;
        if (!pick || pick.dataset.side === b.dataset.side) { pick?.classList.remove('pick'); pick = b; b.classList.add('pick'); if (L === 1 && !isAr(b.textContent)) speak(b.textContent); return; }
        if (pick.dataset.i === b.dataset.i) {
          [pick, b].forEach((x) => { x.classList.remove('pick'); x.classList.add('right'); x.disabled = true; });
          pick = null; left_n--;
          if (!left_n) { mark(slips <= Math.floor(pg.pairs.length / 3)); setWait(false); box.append(el('p', 'eb-msg', 'All matched! Turn the page.')); speak('All matched! Turn the page.'); }
        } else { slips++; b.classList.add('nope'); setTimeout(() => b.classList.remove('nope'), 500); }
      };
      [...L_, ...R_].forEach((b) => b.addEventListener('click', () => tap(b)));
      left.append(...L_); right.append(...R_);
      readCurrent = () => speak(pg.prompt ?? 'Tap one on the left, then its partner on the right.');
      readCurrent();
    },

    // order: tap them in the right order
    order(box, pg) {
      heading(box, pg, 'Put them in order');
      if (pg.prompt) box.append(el('p', 'eb-prompt', pg.prompt));
      const done = el('ol', 'eb-done'); const pool = el('div', 'eb-pool');
      box.append(done, pool);
      let want = 0, slips = 0;
      setWait(true);
      for (const [i, t] of shuffle(pg.items.map((t, i) => [i, t]))) {
        const b = btn('eb-m'); b.append(label(t)); if (TEST) b.dataset.order = String(i);
        b.addEventListener('click', () => {
          if (i === want) { want++; b.remove(); const li = el('li'); li.append(label(t)); done.append(li); if (want === pg.items.length) { mark(slips <= 1); setWait(false); box.append(el('p', 'eb-msg', "That's the right order!")); speak("That's the right order!"); } }
          else { slips++; b.classList.add('nope'); setTimeout(() => b.classList.remove('nope'), 500); }
        });
        pool.append(b);
      }
      readCurrent = () => speak(pg.prompt ?? 'Tap them in the right order.');
      readCurrent();
    },

    // fill the gap: a sentence with ___
    gap(box, pg) {
      heading(box, pg, 'Fill the gap');
      const host = el('div'); box.append(host);
      let k = 0; setWait(true);
      const round = () => {
        host.replaceChildren();
        if (k >= pg.items.length) { setWait(false); host.append(el('p', 'eb-msg', 'All done. Turn the page.')); return; }
        const it = pg.items[k];
        host.append(el('p', 'eb-kicker', `${k + 1} of ${pg.items.length}`));
        const [a, b] = it.t.split('___');
        const s = (isAr(it.t.replace('___', '')) ? arEl : el)('p', 'eb-gap'); const blank = el('span', 'eb-blank', '_____');
        s.append(a ?? '', blank, b ?? ''); host.append(s);
        choices(host, [{ label: it.a, right: true }, ...it.w.map((x) => ({ label: x }))], {
          done: (ok) => { mark(ok); blank.textContent = it.a; blank.classList.add('filled'); setTimeout(() => { k++; round(); }, 1100); },
        });
      };
      round();
    },

    // sort: tap a card, then the basket it belongs in
    sort(box, pg) {
      heading(box, pg, 'Sort them');
      if (pg.prompt) box.append(el('p', 'eb-prompt', pg.prompt));
      const baskets = el('div', 'eb-baskets');
      const pool = el('div', 'eb-pool');
      box.append(pool, baskets);
      let pick = null, left_n = pg.items.length, slips = 0;
      setWait(true);
      const bs = pg.groups.map((g, gi) => { const b = btn('eb-basket'); b.append(label(g)); const inside = el('div', 'eb-in'); b.append(inside); b.dataset.g = String(gi); baskets.append(b); return [b, inside]; });
      for (const [t, g] of shuffle(pg.items)) {
        const c = btn('eb-m'); c.append(label(t)); c.dataset.g = String(g);
        c.addEventListener('click', () => { pool.querySelectorAll('.pick').forEach((x) => x.classList.remove('pick')); pick = c; c.classList.add('pick'); if (L === 1 && !isAr(t)) speak(t); });
        pool.append(c);
      }
      bs.forEach(([b, inside], gi) => b.addEventListener('click', () => {
        if (!pick) return;
        if (+pick.dataset.g === gi) { pick.classList.remove('pick'); pick.disabled = true; inside.append(pick); pick = null; left_n--; if (!left_n) { mark(slips <= 1); setWait(false); box.append(el('p', 'eb-msg', 'All sorted! Turn the page.')); speak('All sorted! Turn the page.'); } }
        else { slips++; pick.classList.add('nope'); const p = pick; setTimeout(() => p.classList.remove('nope'), 500); }
      }));
      readCurrent = () => speak(pg.prompt ?? 'Tap a card, then the basket it goes in.');
      readCurrent();
    },

    // listen and find the letter (the Sheikh's letter voice)
    find(box, pg) {
      heading(box, pg, 'Listen and find the letter');
      const letters = pg.letters.filter((x) => byLetter(x));
      const rounds = pg.rounds ?? Math.min(6, letters.length * 2);
      const n = Math.min(letters.length, L === 1 ? 3 : 4);
      const host = el('div'); box.append(host);
      let k = 0; setWait(true);
      const order = []; while (order.length < rounds) order.push(...shuffle(letters)); order.length = rounds;
      const round = () => {
        host.replaceChildren();
        if (k >= rounds) { setWait(false); host.append(el('p', 'eb-msg', "Masha'Allah! Turn the page.")); speak('Masha Allah! Turn the page.'); return; }
        const target = order[k];
        host.append(el('p', 'eb-kicker', `${k + 1} of ${rounds}`));
        const again = btn('btn eb-listen', 'Hear it again'); again.addEventListener('click', () => sayLetter(byLetter(target)));
        host.append(again);
        const opts = [target, ...shuffle(letters.filter((x) => x !== target)).slice(0, n - 1)];
        const row = choices(host, opts.map((x) => ({ label: x, right: x === target })), { done: (ok) => { mark(ok); setTimeout(() => { k++; round(); }, 900); } });
        row.classList.add('big');
        setTimeout(() => sayLetter(byLetter(target)), 250);
      };
      round();
    },

    // something to write: kept on this computer only
    write(box, pg) {
      heading(box, pg, 'Your turn to write');
      const { p, words } = spoken(pg.prompt, 'eb-prompt'); box.append(p);
      const key = `qc.books.write.${book.id}.${ci}.${at}`;
      const ta = el('textarea', 'eb-write'); ta.rows = pg.lines ?? 4; ta.value = store.get(key, ''); ta.setAttribute('aria-label', pg.prompt);
      ta.placeholder = pg.hint ?? 'Write here…';
      const saved = el('small', 'eb-saved', 'Kept on this computer.');
      let t = null;
      ta.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => store.set(key, ta.value), 400); });
      cleanup.push(() => store.set(key, ta.value));
      box.append(ta, saved);
      readCurrent = () => speak(pg.prompt, words);
      readCurrent();
    },

    // a du'a: the Arabic, how to say it, what it means, and when we say it
    dua(box, pg) {
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
      readCurrent = () => readLines([...(pg.when ? [[pg.when, []]] : []), [pg.en, words]]);
      if (aloud) readCurrent();
    },

    // a hadith: the Arabic (a teacher's recording if there is one), the meaning, and where it is reported
    hadith(box, pg) {
      heading(box, pg);
      const card = el('div', 'eb-card eb-hadith');
      card.append(el('p', 'eb-kicker', pg.kicker ?? 'The Prophet ﷺ said:'));
      const ar = pg.ar ? arEl('p', 'eb-ar', pg.ar) : null; if (ar) card.append(ar);
      const { p, words } = spoken(`"${pg.en}"`, 'eb-en'); card.append(p);
      card.append(el('p', 'eb-src', `Reported by ${pg.src}`));
      box.append(card);
      readCurrent = async () => {
        if (!aloud) return;
        const url = pg.ar ? await arabicClip(pg.ar) : null;
        if (url && ar) { ar.classList.add('playing'); await playUrl(url, 60000); ar.classList.remove('playing'); }
        readLines([[pg.en, words]]);
      };
      readCurrent();
      if (pg.text) for (const t of pg.text) { const s = spoken(t, 'eb-text', pg.words); box.append(s.p); }
    },

    // an ayah: the Arabic straight from the Tanzil text (public/data/surah), the reciter, and the meaning
    ayah(box, pg) {
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
      readCurrent = () => readLines([[pg.en, words]]);
      if (aloud) readCurrent();
    },
  };

  // ── crayons on a workbook page ──
  function ink(fig, img, key, box) {
    const COLORS = ['#1F2937', '#D7263D', '#F49D37', '#F6C64B', '#3F8E3A', '#2C6FBB', '#8E44AD', '#8A5A33'];
    const k = `qc.books.ink.${key}`;
    let strokes = store.get(k, []);
    let color = COLORS[1], size = L <= 2 ? 14 : 8, erase = false;
    const cv = el('canvas', 'eb-ink'); cv.setAttribute('aria-label', 'Draw on the page');
    fig.append(cv);
    const ctx = cv.getContext('2d');
    const fit = () => {
      const r = img.getBoundingClientRect(); if (!r.width) return;
      const d = Math.min(2, devicePixelRatio || 1);
      cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d);
      cv.style.width = r.width + 'px'; cv.style.height = r.height + 'px';
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
    const save = () => store.set(k, strokes.slice(-400));
    let cur = null;
    const pt = (e) => { const r = cv.getBoundingClientRect(); return [Math.round(((e.clientX - r.left) / r.width) * 10000), Math.round(((e.clientY - r.top) / r.height) * 10000)]; };
    cv.addEventListener('pointerdown', (e) => { e.preventDefault(); cv.setPointerCapture?.(e.pointerId); cur = { c: color, w: erase ? size * 3 : size, e: erase || undefined, p: pt(e) }; strokes.push(cur); line(cur); });
    cv.addEventListener('pointermove', (e) => { if (!cur) return; cur.p.push(...pt(e)); redraw(); });
    const end = () => { if (cur) { cur = null; save(); } };
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end); cv.addEventListener('pointerleave', end);

    const tools = el('div', 'eb-tools'); tools.setAttribute('role', 'toolbar'); tools.setAttribute('aria-label', 'Crayons');
    const pens = COLORS.map((c) => { const b = btn('eb-crayon', '', `Crayon ${c}`); b.style.setProperty('--c', c); b.addEventListener('click', () => { color = c; erase = false; sel(b); }); return b; });
    const rub = btn('eb-tool', 'Rubber'); rub.addEventListener('click', () => { erase = true; sel(rub); });
    const thick = btn('eb-tool', size > 10 ? 'Thin' : 'Thick'); thick.addEventListener('click', () => { size = size > 10 ? 6 : 16; thick.textContent = size > 10 ? 'Thin' : 'Thick'; });
    const undo = btn('eb-tool', 'Undo'); undo.addEventListener('click', () => { strokes.pop(); redraw(); save(); });
    const clr = btn('eb-tool', 'Clear page'); clr.addEventListener('click', () => { if (clr.dataset.sure) { strokes = []; redraw(); save(); clr.textContent = 'Clear page'; delete clr.dataset.sure; } else { clr.dataset.sure = '1'; clr.textContent = 'Tap again to clear'; setTimeout(() => { clr.textContent = 'Clear page'; delete clr.dataset.sure; }, 3000); } });
    const sel = (b) => { tools.querySelectorAll('.on').forEach((x) => x.classList.remove('on')); b.classList.add('on'); };
    tools.append(...pens, rub, thick, undo, clr);
    sel(pens[1]);
    box.insertBefore(tools, fig);
    if (img.complete) fit(); else img.addEventListener('load', fit, { once: true });
    const ro = new ResizeObserver(fit); ro.observe(img);
    cleanup.push(() => { ro.disconnect(); save(); });
  }

  function stop() { hush(); clean(); removeEventListener('keydown', onKey); }
  contents();
  return { stop };
}
