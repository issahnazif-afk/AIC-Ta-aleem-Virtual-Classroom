// Speaking and listening.
//
// Ustadh Hakim speaks: his recorded voice (voice/<key>.mp3, the Sheikh's natural voice, listed in voice/index.json)
// where a recording exists, otherwise the browser's own voice reads the same line. Subtitles are always shown.
//
// The player speaks:
//  • Arabic (recitation and short phrases such as Bismillah): the Qāf tracker, on the device. No audio leaves it.
//    It needs the Qāf model, which the Ta'aleem site serves (taaleem.ca/models/).
//  • English answers: the browser's speech service (Google in Chrome, Apple in Safari). Parents are told this in the
//    game's settings, and it can be switched off there.
import { TrackRecognition, preloadTracker } from '../../vendor/qaaf/track-recognition.mjs';
import { tokenize } from '../../vendor/qaaf/recite.mjs';
import { save } from './save.js';
import { playSeq, wordUrls } from './quran-audio.js';

// ── Ustadh Hakim ───────────────────────────────────────────────────
let clips = null, current = null;
const loadClips = () => (clips ??= fetch('voice/index.json').then((r) => (r.ok ? r.json() : {})).catch(() => ({})));
loadClips();
let enVoice = null;
function pickVoice() {
  const vs = speechSynthesis?.getVoices?.() ?? [];
  enVoice = vs.find((v) => /en-GB/i.test(v.lang) && /male|daniel|george|arthur/i.test(v.name)) ?? vs.find((v) => /en-GB/i.test(v.lang)) ?? vs.find((v) => /^en/i.test(v.lang)) ?? null;
}
if (typeof speechSynthesis !== 'undefined') { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }

// say a line (key from HAKIM in content.js). Resolves when it has been spoken (or at once if voice is off).
export async function hakim(key, text) {
  stopHakim();
  if (!save.settings.voice) return;
  const list = await loadClips();
  if (list[key]) {
    // a recording: one file, or a list of his parts with the reciter's words between them
    // ({ q: [surah, ayah, fromWord, toWord] }), so a Qur'an quote is always a human reciter, never a computer voice
    const urls = [list[key]].flat().flatMap((p) => (typeof p === 'string' ? [`voice/${p}`] : wordUrls(...p.q)));
    const seq = playSeq(urls); current = seq;
    await seq.done;
    if (current === seq) current = null;
    return;
  }
  return new Promise((resolve) => {
    if (typeof speechSynthesis === 'undefined' || !text) { resolve(); return; }
    const u = new SpeechSynthesisUtterance(text.replace(/[“”]/g, '').replace(/ﷺ/g, ', peace and blessings be upon him,'));
    if (enVoice) u.voice = enVoice;
    u.lang = enVoice?.lang ?? 'en-GB'; u.rate = 0.9; u.pitch = 0.82;
    u.onend = u.onerror = () => resolve();
    current = u; speechSynthesis.speak(u);
  });
}
export function stopHakim() {
  if (current instanceof Audio) current.pause();
  current?.stop?.();
  try { speechSynthesis?.cancel(); } catch {}
  current = null;
}

// ── Arabic: the Qāf tracker ────────────────────────────────────────
let modelOk = null;
// is recitation possible here? (the model is served by the Ta'aleem site; a microphone is needed)
export function canRecite() {
  if (!navigator.mediaDevices?.getUserMedia || !window.AudioContext && !window.webkitAudioContext) return Promise.resolve(false);
  return (modelOk ??= fetch('/models/vocab.json', { method: 'GET', cache: 'force-cache' }).then((r) => r.ok).catch(() => false));
}
export const warmRecitation = () => canRecite().then((ok) => { if (ok) preloadTracker().catch(() => {}); return ok; });
export const plainWords = (ar, key) => tokenize(ar, key).map((w) => w.plain);

// Listen to a passage (or a short phrase). onWord(i, kind) as each word is judged: read | weak | unclear | missed.
// Resolves with { read, missed, total } when every word has been passed, or when stopped.
export function listen(words, { onWord, onState } = {}) {
  let rec = null, pos = 0, missed = 0, read = 0, stopped = false, done;
  const finished = new Promise((r) => (done = r));
  const end = () => { if (stopped) return; stopped = true; try { rec?.stop(); } catch {} done({ read, missed, total: words.length }); };
  (async () => {
    if (!(await canRecite())) { onState?.('unavailable'); stopped = true; done({ read: 0, missed: 0, total: words.length, unavailable: true }); return; }
    // Wait for Ta'aleem's own model before listening. (Without this, the recogniser would lend the browser's speech
    // service while the model loads — that sends audio to Google or Apple, and its results are not used here.)
    onState?.('loading');
    try { await preloadTracker(); } catch { onState?.('unavailable'); stopped = true; done({ read: 0, missed: 0, total: words.length, unavailable: true }); return; }
    if (stopped) return;
    rec = new TrackRecognition();
    rec.getExpected = () => words.slice(pos);
    rec.onstart = () => onState?.('listening');
    rec.onerror = (e) => { onState?.(e.error === 'not-allowed' ? 'denied' : 'error'); if (e.error === 'not-allowed') end(); };
    rec.onend = () => { if (!stopped) setTimeout(() => { try { if (!stopped) rec.start(); } catch {} }, 300); };
    rec.onresult = (e) => {
      const res = e.results[e.resultIndex];
      if (!res?.track) return;   // the browser's own recognition while the model loads: wait for the tracker
      for (const t of res.track) {
        if (pos >= words.length) break;
        const kind = t.kind ?? 'read';
        if (kind === 'missed') missed++; else read++;
        onWord?.(pos, kind, t.heard);
        pos++;
      }
      if (pos >= words.length) end();
    };
    try { rec.start(); } catch { onState?.('error'); end(); }
  })();
  return { finished, stop: end, get pos() { return pos; } };
}

// The short phrases the game listens for (with their meaning, shown to the player)
export const PHRASES = {
  bismillah: { ar: 'بِسْمِ ٱللَّهِ', say: 'Bismillah', en: 'In the name of Allah' },
  alhamdulillah: { ar: 'ٱلْحَمْدُ لِلَّهِ', say: 'Alhamdulillah', en: 'All praise is for Allah' },
  subhanallah: { ar: 'سُبْحَانَ ٱللَّهِ', say: 'SubhanAllah', en: 'Glory be to Allah' },
};
// listen for one phrase, for a few seconds: resolves true when it was said
export function hearPhrase(id, ms = 7000, onState) {
  const words = plainWords(PHRASES[id].ar);
  const l = listen(words, { onState });
  const t = setTimeout(() => l.stop(), ms);
  return l.finished.then((r) => { clearTimeout(t); return !r.unavailable && r.read >= words.length - 0 && r.missed === 0; });
}

// ── English answers: the browser's speech service ──────────────────
export const canHearEnglish = () => !!(window.SpeechRecognition || window.webkitSpeechRecognition) && save.settings.speech;
// listen for one of the given answers; resolves with its index, or -1
export function hearAnswer(options, ms = 8000, onState) {
  return new Promise((resolve) => {
    const S = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!S || !save.settings.speech) { resolve(-1); return; }
    const r = new S(); let settled = false;
    Object.assign(r, { lang: 'en-GB', continuous: false, interimResults: true, maxAlternatives: 4 });
    const finish = (i) => { if (settled) return; settled = true; clearTimeout(t); try { r.stop(); } catch {} onState?.('idle'); resolve(i); };
    const t = setTimeout(() => finish(-1), ms);
    const norm = (s) => s.toLowerCase().replace(/[‘’'“”".,!?()]/g, '').replace(/\s+/g, ' ').trim();
    r.onresult = (e) => {
      for (let k = e.resultIndex; k < e.results.length; k++) for (let a = 0; a < e.results[k].length; a++) {
        const said = norm(e.results[k][a].transcript);
        const i = matchOption(said, options.map(norm));
        if (i >= 0) { finish(i); return; }
      }
    };
    r.onerror = () => finish(-1);
    r.onend = () => finish(-1);
    try { r.start(); onState?.('listening'); } catch { finish(-1); }
  });
}
// the option whose words were said (most of its words, in any order), or a number/letter said
function matchOption(said, opts) {
  const w = new Set(said.split(' '));
  let best = -1, bs = 0;
  opts.forEach((o, i) => {
    const ow = o.split(' ').filter((x) => x.length > 2 || /^\d+$/.test(x));
    if (!ow.length) return;
    const hit = ow.filter((x) => w.has(x) || said.includes(x)).length / ow.length;
    if (hit > bs) { bs = hit; best = i; }
  });
  if (bs >= 0.6) return best;
  const ord = ['first', 'second', 'third'].findIndex((x) => w.has(x));
  return ord;
}
