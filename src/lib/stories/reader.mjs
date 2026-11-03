// Story Time: the shelf of books and the reader.
//   mountShelf(root, { stories, progress, onOpen })
//   openStory(root, story, { reciter, onDone, onExit })  → onDone({ right }) when the child reaches the end
import { scene } from './art.mjs';
import QURAN from '../../data/stories-quran.json';
import { audioUrl } from '../client.mjs';
import { qpc } from '../recite.mjs';

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const TEST = typeof location !== 'undefined' && /[?&]test=1\b/.test(location.search);

// ── reading aloud (the browser's English voice), with the words lighting up ──
let voice = null;
function pickVoice() {
  const vs = (globalThis.speechSynthesis?.getVoices() ?? []).filter((v) => /^en/i.test(v.lang));
  const rank = (v) => (/natural|neural|online/i.test(v.name) ? 3 : 0) + (/female|samantha|jenny|aria|libby|sonia|google uk english female/i.test(v.name) ? 2 : 0) + (/en-GB|en-US/i.test(v.lang) ? 1 : 0);
  voice = vs.sort((a, b) => rank(b) - rank(a))[0] ?? null;
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) { pickVoice(); speechSynthesis.addEventListener?.('voiceschanged', pickVoice); }
const hush = () => { try { speechSynthesis.cancel(); } catch {} };
// spoken forms of the Arabic phrases, so the English voice says them properly
const SAY = [[/Assalamu alaykum/gi, 'Assalaamu alaikum'], [/Wa alaykum assalam/gi, 'Wa alaikum assalaam'], [/Jazakallahu khayran/gi, 'Jazaakallaahu khairan'], [/A‘udhu billahi minash-shaytanir-rajim/g, 'Aoodhu billaahi minash shaitaanir rajeem'], [/A‘udhu billah/g, 'Aoodhu billaah'], [/Masha’Allah/g, 'Maashaa Allah'], [/In sha Allah/g, 'In shaa Allah'], [/Alhamdulillah/gi, 'Alhamdu lillaah'], [/SubhanAllah/g, 'Subhaan Allah'], [/Bismika Allahumma amutu wa ahya/g, 'Bismika Allaahumma amootu wa ahyaa'], [/Allahumma sayyiban nafi‘a/g, 'Allaahumma sayyiban naafiaa'], [/ﷺ/g, ', peace be upon him,'], [/Ustadha/g, 'Ustaadha'], [/Jiddo/g, 'Jiddoh'], [/Teta/g, 'Tayta']];
function speak(text, words, onEnd) {
  if (!('speechSynthesis' in window)) { onEnd?.(); return; }
  hush();
  let said = text; for (const [a, b] of SAY) said = said.replace(a, b);
  const u = new SpeechSynthesisUtterance(said);
  if (voice) u.voice = voice; u.lang = voice?.lang ?? 'en-GB'; u.rate = 0.88; u.pitch = 1.05;
  // light the words in turn: by the voice's word events where it gives them, else by time
  let timer = null, k = 0;
  const light = (i) => words.forEach((w, j) => w.classList.toggle('on', j === i));
  u.onboundary = (e) => { if (e.name !== 'word') return; clearInterval(timer); timer = null; const ratio = e.charIndex / Math.max(1, said.length); light(Math.min(words.length - 1, Math.floor(ratio * words.length))); };
  u.onstart = () => { timer = setInterval(() => light(k++), 360); };
  u.onend = () => { clearInterval(timer); light(-1); onEnd?.(); };
  u.onerror = u.onend;
  speechSynthesis.speak(u);
}

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
          const why = el('p', 'st-why', `${tries ? 'Yes!' : 'Masha’Allah, that’s right!'} ${q.why}`);
          box.append(why);
          st._right = tries === 0;
          next.disabled = false; next.classList.remove('wait');
          if (readAloud) speak(why.textContent, []);
        } else { tries++; b.classList.add('nope'); b.disabled = true; if (readAloud) speak('Not quite. Try again!', []); }
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
      box.append(el('p', 'st-kicker', 'The Prophet Muhammad ﷺ said:'));
      const ar = el('p', 'st-ar', st.hadith.ar); ar.lang = 'ar'; ar.dir = 'rtl';
      box.append(ar, el('p', 'st-en', `“${st.hadith.en}”`), el('p', 'st-src', `Reported by ${st.hadith.src.replace(/, /g, ' and ')}`));
    } else {
      const q = QURAN[`${st.quran.s}:${st.quran.a}:${st.quran.w[0]}-${st.quran.w[1]}`];
      box.append(el('p', 'st-kicker', 'Allah says in the Qurʾan:'));
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
    if (readAloud) speak((st.hadith ? 'The Prophet Muhammad, peace be upon him, said: ' + st.hadith.en : 'Allah says in the Quran: ' + st.quran.en), []);
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
