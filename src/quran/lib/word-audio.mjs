// Tap a word to hear it: the word (or a phrase grown word by word) cut from the reciter's āyah recording with the word
// timings (scripts/quran/timings.mjs), played on its own audio element so the page's player keeps its place.
// A small card by the word offers: hear it again, repeat it three times, add the next word, close.
// Ḥafṣ only (the other riwāyāt have no word timings). Saved surahs play from the device (offline-audio.mjs).
import { getJson, pad, audioUrl, settings } from './client.mjs';
import { isSaved, savedUrl } from './offline-audio.mjs';

const el = typeof Audio !== 'undefined' ? new Audio() : null;
const timings = new Map();
let token = 0, raf = 0, blob = null, unlocked = false;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// iPhone and iPad only let an audio element play after it has played inside a tap: a few milliseconds of silence,
// started in the tap itself, before anything is awaited
function unlock() {
  if (unlocked || !el) return;
  unlocked = true;
  const n = 400, b = new Uint8Array(44 + n), v = new DataView(b.buffer), w = (o, s) => [...s].forEach((c, i) => (b[o + i] = c.charCodeAt(0)));
  w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); w(36, 'data'); v.setUint32(40, n, true); b.fill(128, 44);
  el.src = 'data:audio/wav;base64,' + btoa(String.fromCharCode(...b)); el.dataset.src = '';
  el.play().catch(() => {});
}

async function spanOf(s, a, w0, w1) {
  const k = `${settings.reciter}/${pad(s)}`;
  if (!timings.has(k)) timings.set(k, getJson(`timings/${k}.json`).catch(() => null));
  const segs = (await timings.get(k))?.[a];
  if (!segs) return null;
  const first = segs.find((x) => x[0] === w0), last = [...segs].reverse().find((x) => x[0] === w1);
  return first && last ? { start: first[1], end: Math.max(last[2], first[1] + 250) } : null;
}

// plays words w0..w1 of s:a `times` times; resolves false if stopped or impossible
export async function playWords(s, a, w0, w1, { times = 1, gap = 700 } = {}) {
  if (!el) return false;
  const mine = ++token;
  cancelAnimationFrame(raf); el.pause();
  const sp = await spanOf(s, a, w0, w1);
  if (!sp || mine !== token) return false;
  let url = audioUrl(settings.reciter, s, a);
  if (el.dataset.src !== url) {
    const local = isSaved(settings.reciter, s) ? await savedUrl(settings.reciter, s, a) : null;
    if (mine !== token) { if (local) URL.revokeObjectURL(local); return false; }
    if (blob) URL.revokeObjectURL(blob);
    blob = local;
    el.src = local ?? url; el.dataset.src = url;
    await new Promise((r) => { if (el.readyState >= 1) r(); else { el.addEventListener('loadedmetadata', r, { once: true }); el.addEventListener('error', r, { once: true }); } });
    if (mine !== token || el.error) return false;
  }
  for (let i = 0; i < times; i++) {
    el.currentTime = Math.max(0, (sp.start - 40) / 1000);
    try { await el.play(); } catch { return false; }
    await new Promise((r) => {
      const tick = () => { if (mine !== token) return r(); if (el.ended || el.currentTime * 1000 >= sp.end + 80) { el.pause(); return r(); } raf = requestAnimationFrame(tick); };
      tick();
    });
    if (mine !== token) return false;
    if (i < times - 1) { await sleep(gap); if (mine !== token) return false; }
  }
  return true;
}
export function stopWords() { token++; cancelAnimationFrame(raf); el?.pause(); }

// The card. box: the page element holding the word spans ([data-k][data-w]); onStart(): called as a word starts
// playing (the page pauses its own player). Returns { tap(span) → true if it handled the tap, close() }.
export function wordCard(box, { onStart = () => {} } = {}) {
  const card = document.createElement('div');
  card.className = 'word-card'; card.hidden = true; card.setAttribute('role', 'dialog'); card.setAttribute('aria-label', 'Hear this word');
  card.innerHTML = '<span class="wc-text" lang="ar" dir="rtl"></span>'
    + '<button type="button" data-c="again">Hear again</button>'
    + '<button type="button" data-c="repeat">Repeat 3×</button>'
    + '<button type="button" data-c="more" title="Add the next word, to practise a phrase">+ next word</button>'
    + '<button type="button" data-c="close" aria-label="Close">✕</button>';
  document.body.append(card);
  const text = card.querySelector('.wc-text'), repeatBtn = card.querySelector('[data-c="repeat"]'), moreBtn = card.querySelector('[data-c="more"]');
  let cur = null;   // { s, a, w0, w1 }
  const wordsOf = (c) => [...box.querySelectorAll(`[data-k="${c.s}:${c.a}"][data-w]`)].filter((x) => +x.dataset.w >= c.w0 && +x.dataset.w <= c.w1);
  const lastWord = (c) => Math.max(...[...box.querySelectorAll(`[data-k="${c.s}:${c.a}"][data-w]`)].map((x) => +x.dataset.w));
  function light(on) {
    box.querySelectorAll('.word-hear').forEach((x) => x.classList.remove('word-hear'));
    if (on && cur) wordsOf(cur).forEach((x) => x.classList.add('word-hear'));
  }
  function place(anchor) {
    const r = anchor.getBoundingClientRect(), cw = card.offsetWidth, chh = card.offsetHeight;
    const top = r.top - chh - 10 > 8 ? r.top - chh - 10 : r.bottom + 10;
    card.style.top = `${Math.round(top)}px`;
    card.style.left = `${Math.round(Math.min(innerWidth - cw - 8, Math.max(8, r.left + r.width / 2 - cw / 2)))}px`;
  }
  async function play(times) {
    if (!cur) return;
    onStart(); light(true);
    repeatBtn.textContent = times > 1 ? 'Stop' : 'Repeat 3×';
    await playWords(cur.s, cur.a, cur.w0, cur.w1, { times });
    repeatBtn.textContent = 'Repeat 3×';
    light(false);
  }
  function show(c, anchor) {
    cur = c;
    text.textContent = wordsOf(c).map((x) => x.textContent).join(' ');
    moreBtn.disabled = c.w1 >= lastWord(c);
    card.hidden = false; place(anchor);
  }
  function close() { stopWords(); light(false); card.hidden = true; cur = null; }
  card.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    e.stopPropagation(); unlock();
    const c = b.dataset.c;
    if (c === 'close') close();
    else if (c === 'again') play(1);
    else if (c === 'repeat') { if (repeatBtn.textContent === 'Stop') { stopWords(); light(false); repeatBtn.textContent = 'Repeat 3×'; } else play(3); }
    else if (c === 'more' && cur) { const words = wordsOf({ ...cur, w1: cur.w1 + 1 }); show({ ...cur, w1: cur.w1 + 1 }, words.at(-1) ?? words[0]); play(1); }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !card.hidden) close(); });
  document.addEventListener('click', (e) => { if (!card.hidden && !card.contains(e.target) && !box.contains(e.target)) close(); });
  addEventListener('scroll', () => { if (!card.hidden) close(); }, { passive: true });
  return {
    tap(span) {
      if ((document.documentElement.dataset.riwayah || 'hafs') !== 'hafs' || span.dataset.w == null) return false;
      unlock();
      const [s, a] = span.dataset.k.split(':').map(Number), w = +span.dataset.w;
      show({ s, a, w0: w, w1: w }, span);
      play(1);
      return true;
    },
    close,
  };
}
