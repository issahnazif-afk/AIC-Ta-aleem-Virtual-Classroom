// Reading aloud with a natural recorded voice. Every English line of Story Time and the Seerah Quest is recorded
// at build time by scripts/voice/make_narration.py (Kokoro) into public/audio/narration/. A line without a recording
// (for example a sentence a teacher has just changed) falls back to the browser's own voice.
//   narrate(text, { voice: 'story' | 'seerah', words, onEnd, studio, where }) → { stop() }
//   where: the line's place ("story:page" or "story:page:say"), so the browser's voice can tell who says each quote
import { u } from './url.mjs';
import { VOICES, spoken, clipKey, parts } from './narration-text.mjs';
import { studioUrl } from './voice.mjs';

let index = null;
const load = () => (index ??= fetch(u('audio/narration/index.json')).then((r) => (r.ok ? r.json() : {}), () => ({})));
load();

let current = null;
export function hush() { try { current?.stop(); } catch {} current = null; try { speechSynthesis.cancel(); } catch {} }

// light the words in step with the voice: each word's share of the time follows its length, with a pause after
// commas and full stops (the recording has no word timings, but this keeps the highlight close to the voice)
function weights(words) {
  return words.map((w) => { const t = w.textContent; return t.replace(/[^\p{L}\p{N}]/gu, '').length + 2 + (/[.!?…”]$/.test(t) ? 6 : /[,;:]$/.test(t) ? 3 : 0); });
}
function lighter(words, dur, lead = 0.12) {
  const ws = weights(words), total = ws.reduce((a, b) => a + b, 0) || 1, ends = [];
  let acc = 0; for (const w of ws) { acc += w; ends.push(acc / total); }
  return (t) => { const k = (t - lead) / Math.max(0.5, dur - lead - 0.25); const i = k < 0 || k > 1 ? -1 : ends.findIndex((e) => k <= e); words.forEach((w, j) => w.classList.toggle('on', j === i)); };
}

let enVoice = null;
function pickVoice() {
  const vs = (globalThis.speechSynthesis?.getVoices() ?? []).filter((v) => /^en/i.test(v.lang));
  const rank = (v) => (/natural|neural|online/i.test(v.name) ? 3 : 0) + (/female|samantha|jenny|aria|libby|sonia/i.test(v.name) ? 1 : 0);
  enVoice = vs.sort((a, b) => rank(b) - rank(a))[0] ?? null;
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) { pickVoice(); speechSynthesis.addEventListener?.('voiceschanged', pickVoice); }

// The browser's own voice has one speaker, so each character is told apart by pitch and pace (1 = the voice as it is):
// children higher and quicker, the grandparents lower and slower. The kinds are VOICE_KINDS in narration-text.mjs.
export const BROWSER_VOICE = {
  narrator: [1, 0.9], girl: [1.45, 1.0], boy: [1.25, 1.0], cat: [1.7, 0.95], mama: [1.1, 0.9], woman: [1.05, 0.92], teacher: [1.0, 0.92],
  teta: [0.85, 0.8], man: [0.75, 0.88], imam: [0.7, 0.85], grandpa: [0.6, 0.78],
};
function browserSay(text, words, onEnd, { voice = 'story', where } = {}) {
  if (!('speechSynthesis' in window)) { onEnd?.(); return { stop() {} }; }
  const ps = voice === 'story' ? parts(text, where) : [['narrator', text]];
  let timer = null, k = 0, i = 0, stopped = false;
  const clear = () => { clearInterval(timer); words.forEach((w) => w.classList.remove('on')); };
  const next = () => {
    if (stopped) return;
    if (i >= ps.length) { clear(); onEnd?.(); return; }
    const [who, w] = ps[i++];
    const u2 = new SpeechSynthesisUtterance(spoken(w));
    if (enVoice) u2.voice = enVoice; u2.lang = enVoice?.lang ?? 'en-GB';
    [u2.pitch, u2.rate] = BROWSER_VOICE[who] ?? BROWSER_VOICE.narrator;
    u2.onstart = () => { timer ??= setInterval(() => { words.forEach((x, j) => x.classList.toggle('on', j === k)); k++; }, 380); };
    u2.onend = next; u2.onerror = next;
    speechSynthesis.speak(u2);
  };
  next();
  return { stop() { stopped = true; speechSynthesis.cancel(); clear(); } };
}

// studio: the id of a teacher's recording of this line in the Voice Studio (st-<story>-<page>), used first
export async function narrate(text, { voice = 'story', words = [], onEnd, studio, where } = {}) {
  hush();
  const mine = {};
  current = mine;
  const [idx, own] = await Promise.all([load(), studio ? studioUrl(studio).catch(() => null) : null]);
  if (current !== mine) return mine;     // something else started while we were loading
  const made = idx[clipKey(VOICES[voice], text)];
  const clip = own ? { src: own } : made ? { src: u(`audio/narration/${made.f}.mp3`), d: made.d } : null;
  if (clip) {
    const a = new Audio(clip.src);
    a.addEventListener('loadedmetadata', () => { if (!clip.d && isFinite(a.duration)) clip.d = a.duration; });
    let light = null;
    const relight = () => { light = words.length ? lighter(words, clip.d || a.duration || 5) : null; };
    relight(); a.addEventListener('loadedmetadata', relight);
    let ended = false;
    const finish = () => { if (ended) return; ended = true; words.forEach((w) => w.classList.remove('on')); onEnd?.(); };
    a.addEventListener('timeupdate', () => light?.(a.currentTime));
    a.addEventListener('ended', finish);
    mine.stop = () => { ended = true; a.pause(); words.forEach((w) => w.classList.remove('on')); };
    try { await a.play(); return mine; } catch { /* blocked or missing: use the browser voice */ }
  }
  const b = browserSay(text, words, onEnd, { voice, where });
  mine.stop = b.stop;
  return mine;
}
