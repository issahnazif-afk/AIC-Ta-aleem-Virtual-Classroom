// Reading aloud with a natural recorded voice. Every English line of Story Time and the Seerah Quest is recorded
// at build time by scripts/voice/make_narration.py (Kokoro) into public/audio/narration/. A line without a recording
// (for example a sentence a teacher has just changed) falls back to the browser's own voice.
//   narrate(text, { voice: 'story' | 'seerah', words, onEnd }) → { stop() }
import { u } from './url.mjs';
import { VOICES, spoken, clipKey } from './narration-text.mjs';
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

function browserSay(text, words, onEnd) {
  if (!('speechSynthesis' in window)) { onEnd?.(); return { stop() {} }; }
  const u2 = new SpeechSynthesisUtterance(spoken(text));
  if (enVoice) u2.voice = enVoice; u2.lang = enVoice?.lang ?? 'en-GB'; u2.rate = 0.9;
  let timer = null, k = 0;
  u2.onstart = () => { timer = setInterval(() => { words.forEach((w, j) => w.classList.toggle('on', j === k)); k++; }, 380); };
  u2.onend = () => { clearInterval(timer); words.forEach((w) => w.classList.remove('on')); onEnd?.(); };
  u2.onerror = u2.onend;
  speechSynthesis.speak(u2);
  return { stop() { clearInterval(timer); u2.onend = null; speechSynthesis.cancel(); words.forEach((w) => w.classList.remove('on')); } };
}

// studio: the id of a teacher's recording of this line in the Voice Studio (st-<story>-<page>), used first
export async function narrate(text, { voice = 'story', words = [], onEnd, studio } = {}) {
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
  const b = browserSay(text, words, onEnd);
  mine.stop = b.stop;
  return mine;
}
