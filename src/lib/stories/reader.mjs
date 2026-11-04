// Story Time: the shelf of books and the reader.
//   mountShelf(root, { stories, progress, onOpen })
//   openStory(root, story, { reciter, onDone, onExit })  → onDone({ right }) when the child reaches the end
import { scene } from './art.mjs';
import QURAN from '../../data/stories-quran.json';
import { audioUrl } from '../client.mjs';
import { qpc } from '../recite.mjs';
import { narrate, hush as stopNarration } from '../narration.mjs';
import { STORY_LINES } from '../narration-text.mjs';

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const TEST = typeof location !== 'undefined' && /[?&]test=1\b/.test(location.search);

// ── reading aloud: the recorded natural voice (src/lib/narration.mjs), one line after another ──
let queue = 0;
function speak(text, words, onEnd) { queue++; narrate(text, { voice: 'story', words, onEnd }); }
async function speakAll(lines) { const q = ++queue; for (const [text, words] of lines) { if (q !== queue) return; await new Promise((r) => narrate(text, { voice: 'story', words: words ?? [], onEnd: r })); } }
const hush = () => { queue++; stopNarration(); };

// a tappable thing gets an invisible box around it, so a small finger anywhere on it counts
function hitArea(g) {
  try {
    const b = g.getBBox(), pad = 14;
    const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    Object.entries({ x: b.x - pad, y: b.y - pad, width: b.width + pad * 2, height: b.height + pad * 2, fill: 'transparent' }).forEach(([k, v]) => r.setAttribute(k, v));
    g.append(r);
  } catch {}
}

function wordsOf(text) {
  const p = el('p', 'st-text');
  const words = text.split(/(\s+)/).map((w) => { if (/^\s+$/.test(w)) return document.createTextNode(w); const s = el('span', 'w', w); return s; });
  p.append(...words);
  return { p, words: words.filter((w) => w.nodeType === 1) };
}

// ── the shelf ───────────────────────────────────────────────
export function mountShelf(root, { stories, progress, onOpen }) {
  root.replaceChildren();
  stories.forEach((st, i) => {
    const done = progress?.[st.id]?.done;
    const b = el('button', 'st-cover' + (done ? ' done' : '')); b.type = 'button'; b.dataset.story = st.id;
    b.style.setProperty('--book', st.color);
    const art = el('div', 'st-cover-art'); art.innerHTML = scene(st.pages[0].art);
    const n = el('span', 'st-cover-n', String(i + 1));
    const t = el('b', null, st.title);
    const th = el('span', 'st-cover-theme', st.theme);
    b.append(art, n, t, th);
    if (done) b.append(el('span', 'st-cover-star', '★ Read'));
    b.addEventListener('click', () => onOpen(st));
    root.append(b);
  });
}

// ── the reader ──────────────────────────────────────────────
export function openStory(root, st, { reciter, onDone, onExit }) {
  hush();
  st._right = undefined;
  root.replaceChildren();
  for (const k of Object.keys(root.dataset)) delete root.dataset[k];
  root.className = 'st-reader';
  root.style.setProperty('--book', st.color);
  let readAloud = true;
  try { readAloud = localStorage.getItem('qc.story.read') !== 'off'; } catch {}
  const top = el('div', 'st-top');
  const title = el('b', 'st-title', st.title);
  const aloud = el('button', 'st-chip', ''); aloud.type = 'button';
  const setAloud = () => { aloud.textContent = readAloud ? '🔊 Reading to me' : '🔈 I’ll read myself'; aloud.setAttribute('aria-pressed', String(readAloud)); };
  setAloud();
  aloud.addEventListener('click', () => { readAloud = !readAloud; try { localStorage.setItem('qc.story.read', readAloud ? 'on' : 'off'); } catch {} setAloud(); if (!readAloud) hush(); else readPage(); });
  const close = el('button', 'st-chip', 'Close the book'); close.type = 'button';
  close.addEventListener('click', () => { hush(); onExit?.(); });
  top.append(title, aloud, close);

  const stage = el('div', 'st-stage');
  const art = el('div', 'st-art-wrap');
  const words = el('div', 'st-words');
  const prompt = el('div', 'st-prompt'); prompt.hidden = true;
  stage.append(art, words, prompt);

  const nav = el('div', 'st-nav');
  const back = el('button', 'st-btn back', '‹'); back.type = 'button'; back.setAttribute('aria-label', 'Back');
  const dots = el('div', 'st-dots');
  const next = el('button', 'st-btn next', '›'); next.type = 'button'; next.setAttribute('aria-label', 'Next page');
  nav.append(back, dots, next);
  root.append(top, stage, nav);

  const total = st.pages.length;
  for (let i = 0; i < total + 2; i++) dots.append(el('span'));
  let at = 0, cur = null, tapped = new Set();

  function readPage(extra) {
    if (!readAloud || !cur) return;
    speak(extra ?? cur.text, extra ? cur.extraWords : cur.words);
  }
  function setDots() { [...dots.children].forEach((d, i) => d.classList.toggle('on', i === at)); }

  function showPage(i) {
    hush();
    at = i; setDots();
    back.disabled = i === 0;
    prompt.hidden = true;
    root.dataset.page = String(i);
    if (i < total) return page(st.pages[i]);
    if (i === total) return question();
    return lesson();
  }

  function page(p) {
    stage.className = 'st-stage';
    art.innerHTML = scene(p.art);
    const { p: para, words: ws } = wordsOf(p.t);
    words.replaceChildren(para);
    cur = { text: p.t, words: ws };
    const needsTap = p.tap && !tapped.has(at);
    next.disabled = !!needsTap;
    next.classList.toggle('wait', !!needsTap);
    if (p.tap) {
      const target = art.querySelector(`[data-id="${p.tap.id}"]`);
      if (needsTap && target) {
        hitArea(target);
        prompt.textContent = '👆 ' + p.tap.prompt; prompt.hidden = false;
        target.classList.add('glow');
        if (TEST) root.dataset.tap = p.tap.id;
        const go = (e) => {
          e.stopPropagation();
          tapped.add(at);
          if (p.tap.after) art.innerHTML = scene(p.tap.after);
          const extra = wordsOf(p.tap.say);
          extra.p.classList.add('said');
          words.append(extra.p);
          cur.extraWords = extra.words;
          prompt.hidden = true;
          next.disabled = false; next.classList.remove('wait');
          stage.classList.add('cheer');
          setTimeout(() => stage.classList.remove('cheer'), 900);
          if (TEST) delete root.dataset.tap;
          readPage(p.tap.say);
        };
        target.addEventListener('click', go, { once: true });
        target.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') go(e); });
        target.setAttribute('tabindex', '0'); target.setAttribute('role', 'button'); target.setAttribute('aria-label', p.tap.prompt);
      } else if (tapped.has(at) && p.tap.after) {
        art.innerHTML = scene(p.tap.after);
        const extra = wordsOf(p.tap.say); extra.p.classList.add('said'); words.append(extra.p);
      }
    }
    readPage();
  }

  function question() {
    stage.className = 'st-stage card-page';
    cur = null;
    const q = st.ask;
    const box = el('div', 'st-card');
    box.append(el('p', 'st-kicker', 'Think about the story'), el('h2', 'st-q', q.q));
    const opts = el('div', 'st-opts');
    let tries = 0;
    q.options.forEach((o, i) => {
      const b = el('button', 'st-opt', o); b.type = 'button'; if (TEST) b.dataset.answer = String(i === q.answer);
      b.addEventListener('click', () => {
        if (i === q.answer) {
          b.classList.add('right'); opts.querySelectorAll('button').forEach((x) => (x.disabled = true));
          const lead = tries ? STORY_LINES.yes : STORY_LINES.right;
          const why = el('p', 'st-why', `${lead} ${q.why}`);
          box.append(why);
          st._right = tries === 0;
          next.disabled = false; next.classList.remove('wait');
          if (readAloud) speakAll([[lead], [q.why]]);
        } else { tries++; b.classList.add('nope'); b.disabled = true; if (readAloud) speak(STORY_LINES.again, []); }
      });
      opts.append(b);
    });
    box.append(opts);
    art.innerHTML = ''; words.replaceChildren(box);
    next.disabled = true; next.classList.add('wait');
    if (readAloud) speak(q.q + ' ' + q.options.join('? ') + '?', []);
  }

  function lesson() {
    stage.className = 'st-stage card-page';
    cur = null;
    const box = el('div', 'st-card lesson');
    if (st.hadith) {
      box.append(el('p', 'st-kicker', STORY_LINES.prophet));
      const ar = el('p', 'st-ar', st.hadith.ar); ar.lang = 'ar'; ar.dir = 'rtl';
      box.append(ar, el('p', 'st-en', `“${st.hadith.en}”`), el('p', 'st-src', `Reported by ${st.hadith.src.replace(/, /g, ' and ')}`));
    } else {
      const q = QURAN[`${st.quran.s}:${st.quran.a}:${st.quran.w[0]}-${st.quran.w[1]}`];
      box.append(el('p', 'st-kicker', STORY_LINES.quran));
      const ar = el('p', 'st-ar quran', qpc(q.ar)); ar.lang = 'ar'; ar.dir = 'rtl';
      const listen = el('button', 'btn st-listen', '▶ Listen to the ayah'); listen.type = 'button';
      let a = null;
      listen.addEventListener('click', () => { hush(); a?.pause(); a = new Audio(audioUrl(reciter, q.s, q.a)); a.play().catch(() => {}); });
      root._stopAudio = () => a?.pause();
      box.append(ar, el('p', 'st-en', `“${st.quran.en}”`), el('p', 'st-src', `Surah ${q.surah} ${q.s}:${q.a}`), listen);
    }
    const end = el('button', 'btn btn-primary big st-finish', 'I finished the story! ★'); end.type = 'button';
    end.addEventListener('click', () => { hush(); root._stopAudio?.(); onDone?.({ right: st._right !== false }); });
    box.append(end);
    art.innerHTML = ''; words.replaceChildren(box);
    next.disabled = true; next.classList.add('wait');
    if (readAloud) speakAll([[st.hadith ? STORY_LINES.prophet : STORY_LINES.quran], [st.hadith ? st.hadith.en : st.quran.en]]);
  }

  next.addEventListener('click', () => { if (at < total + 1) showPage(at + 1); });
  back.addEventListener('click', () => { if (at > 0) showPage(at - 1); });
  // swipe and keyboard
  let sx = null;
  stage.addEventListener('pointerdown', (e) => { sx = e.clientX; });
  stage.addEventListener('pointerup', (e) => { if (sx == null) return; const d = e.clientX - sx; sx = null; if (Math.abs(d) > 70) (d < 0 ? (!next.disabled && next.click()) : (!back.disabled && back.click())); });
  const onKey = (e) => { if (!root.isConnected) return removeEventListener('keydown', onKey); if (e.key === 'ArrowRight' && !next.disabled) next.click(); if (e.key === 'ArrowLeft' && !back.disabled) back.click(); };
  addEventListener('keydown', onKey);
  showPage(0);
  return { stop() { hush(); root._stopAudio?.(); removeEventListener('keydown', onKey); } };
}
