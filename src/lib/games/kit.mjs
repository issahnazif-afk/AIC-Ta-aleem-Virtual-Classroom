// The shared kit for the Play & Make games (src/lib/games/): small DOM helpers, sound effects made in the browser
// (Web Audio, nothing recorded or licensed), a celebration, the stars card and read-aloud for Levels 1 and 2.
// Every game gets a ctx from mountGame() in index.mjs:
//   { level, levels, progress, say(text), sfx, earn({ kind, key, score, good }), save(), done(result), store }
import { narrate, hush } from '../narration.mjs';
import { refText, refUrl } from '../deen/refs.mjs';

// a fact's source as text and a link: a hadith { c, n } links to sunnah.com; a book is plain text
export const srcOf = (f) => (f.src ? { text: refText(f.src), url: refUrl(f.src) } : { text: f.book ?? '', url: f.url ?? '' });

export const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
export const btn = (cls, text, label) => { const b = el('button', cls, text); b.type = 'button'; if (label) b.setAttribute('aria-label', label); return b; };
export const arEl = (tag, cls, t) => { const e = el(tag, cls, t); e.lang = 'ar'; e.dir = 'rtl'; return e; };
export const svgEl = (tag, attrs = {}) => { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; };
export const shuffle = (xs, rnd = Math.random) => { const a = [...xs]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

const local = {
  get(k, d) { try { const v = localStorage.getItem('gm-' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('gm-' + k, JSON.stringify(v)); } catch {} },
};
export const store = local;

// ── sound effects: tiny synthesised blips ──
let ac = null;
let muted = local.get('muted', false);
function ctxA() {
  if (muted) return null;
  try { ac ??= new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); return ac; } catch { return null; }
}
function tone(f, t0, dur, { type = 'sine', vol = 0.18, to = null } = {}) {
  const a = ctxA(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain();
  const t = a.currentTime + t0;
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
}
export const sfx = {
  get muted() { return muted; },
  setMuted(m) { muted = !!m; local.set('muted', muted); },
  step() { tone(520, 0, 0.07, { type: 'triangle', vol: 0.08 }); },
  bump() { tone(140, 0, 0.12, { type: 'square', vol: 0.06 }); },
  pop() { tone(660, 0, 0.09, { to: 990, vol: 0.12 }); },
  snap() { tone(1200, 0, 0.04, { type: 'square', vol: 0.06 }); tone(1800, 0.05, 0.12, { vol: 0.1 }); },
  sparkle() { [1320, 1760, 2093, 2637].forEach((f, i) => tone(f, i * 0.05, 0.16, { vol: 0.06 })); },
  wrong() { tone(330, 0, 0.14, { type: 'triangle', vol: 0.1 }); tone(262, 0.12, 0.2, { type: 'triangle', vol: 0.1 }); },
  right() { tone(660, 0, 0.1, { vol: 0.14 }); tone(880, 0.09, 0.18, { vol: 0.14 }); },
  shimmer() { [880, 1108, 880, 1108].forEach((f, i) => tone(f, i * 0.07, 0.12, { vol: 0.04 })); },
  gobble() { for (let i = 0; i < 4; i++) tone(300 - i * 40, i * 0.11, 0.1, { type: 'square', vol: 0.07, to: 160 - i * 20 }); tone(700, 0.5, 0.18, { vol: 0.08, to: 300 }); },
  dice() { for (let i = 0; i < 6; i++) tone(400 + Math.random() * 500, i * 0.06, 0.04, { type: 'square', vol: 0.04 }); },
  slide() { tone(900, 0, 0.5, { type: 'sine', vol: 0.1, to: 200 }); },
  climb() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.08, 0.12, { vol: 0.1 })); },
  coin() { tone(988, 0, 0.08, { type: 'square', vol: 0.05 }); tone(1319, 0.08, 0.25, { type: 'square', vol: 0.05 }); },
  win() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.2, { vol: 0.13 })); },
};

// ── read aloud (Levels 1 and 2 only; the lines are listed in lines.mjs for the recorded voice) ──
export function sayer(level) {
  return (text) => { if (level > 2 || !text) return; hush(); narrate(text, { voice: 'story', words: [] }); };
}
export { hush };

// ── celebration: a burst of paper stars and crescents (a soft glow instead when motion is reduced) ──
export function celebrate(host) {
  const box = el('div', 'gm-confetti'); box.setAttribute('aria-hidden', 'true');
  const n = reduced() ? 0 : 36;
  const colours = ['#F6C64B', '#E85A71', '#4A90D9', '#6CBF5A', '#0E6B4E', '#C9A24A'];
  for (let i = 0; i < n; i++) {
    const p = el('i'); p.style.left = Math.random() * 100 + '%'; p.style.background = colours[i % colours.length];
    p.style.animationDelay = (Math.random() * 0.4) + 's'; p.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
    if (i % 3 === 0) p.className = 'round';
    box.append(p);
  }
  if (!n) box.classList.add('calm');
  host.append(box);
  setTimeout(() => box.remove(), 2600);
}

export const starsText = (n, of = 3) => '★'.repeat(n) + '☆'.repeat(of - n);

// The end card: stars, a short line, an optional fact with its source, and buttons.
//   endCard(host, { stars, title, line, fact: { text, src, url }, earned, again, more: [{ text, onClick }] })
export function endCard(host, { stars = 0, title = 'Masha’Allah!', line = '', fact = null, again, more = [] }) {
  const c = el('div', 'gm-end');
  c.setAttribute('role', 'status');
  c.append(el('p', 'gm-end-stars', starsText(stars)), el('h2', 'gm-end-h', title));
  if (line) c.append(el('p', 'gm-end-line', line));
  if (fact) {
    const f = el('div', 'gm-fact');
    f.append(el('p', 'gm-fact-k', 'Did you know?'), el('p', 'gm-fact-t', fact.text));
    const s = el('p', 'gm-fact-src'), src = srcOf(fact);
    if (src.url) { const a = el('a', null, src.text); a.href = src.url; a.target = '_blank'; a.rel = 'noopener'; s.append('Source: ', a); }
    else s.textContent = 'Source: ' + src.text;
    f.append(s);
    c.append(f);
  }
  const row = el('div', 'gm-row');
  if (again) { const b = btn('btn btn-primary gm-big', 'Play again'); b.addEventListener('click', again); row.append(b); }
  for (const m of more) { const b = btn('btn gm-big', m.text); b.addEventListener('click', m.onClick); row.append(b); }
  c.append(row);
  host.append(c);
  celebrate(host);
  sfx.win();
  c.querySelector('button')?.focus({ preventScroll: true });
  return c;
}

// A toast-like bubble inside the game box
export function bubble(host, text, cls = '') {
  host.querySelectorAll('.gm-bubble').forEach((b) => b.remove());
  const b = el('div', 'gm-bubble ' + cls, text); b.setAttribute('role', 'status');
  host.append(b); setTimeout(() => b.remove(), 2600);
  return b;
}

// Drag with pointer events (mouse, pen and touch). onMove(x, y, e) and onDrop(x, y, e) get client coordinates.
export function draggable(node, { onStart, onMove, onDrop } = {}) {
  let id = null;
  node.style.touchAction = 'none';
  node.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    id = e.pointerId; node.setPointerCapture(id); onStart?.(e.clientX, e.clientY, e); e.preventDefault();
  });
  node.addEventListener('pointermove', (e) => { if (e.pointerId === id) onMove?.(e.clientX, e.clientY, e); });
  const end = (e) => { if (e.pointerId !== id) return; id = null; onDrop?.(e.clientX, e.clientY, e); };
  node.addEventListener('pointerup', end);
  node.addEventListener('pointercancel', end);
}

// a seeded random number generator (for repeatable tests)
export function rng(seed = Date.now()) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
