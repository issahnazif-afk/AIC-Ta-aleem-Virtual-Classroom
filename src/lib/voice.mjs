// The Sheikh's voice for Alif Ba: letters, syllables, and the clips that go with each lesson.
//
// Where a sound comes from, best first:
//   0. a teacher's recording made in the Voice Studio (kept in the school's Google Drive), then
//   1. a teacher's recording in public/audio/letters/<id>.mp3 (listed at build time), then
//   2. the clip made by scripts/voice/make_voice.py in public/audio/voice/<id>.mp3, then
//   3. the browser's own Arabic voice, if it has one (Chrome on Windows usually does not).
// Qur'an examples are never spoken by a computer voice: they play the reciter's ayah instead.
import { u } from './url.mjs';
import { voiceList, voiceClip } from './classlog.mjs';

// ── the Voice Studio recordings ──
let studio = null;                    // id → version
const studioUrls = new Map();         // id@version → blob URL
export function loadStudio(force = false) { if (force || !studio) studio = voiceList(); return studio; }
export async function studioUrl(id) {
  const list = await loadStudio();
  const v = list[id];
  if (v == null) return null;
  const k = `${id}@${v}`;
  if (!studioUrls.has(k)) {
    studioUrls.set(k, voiceClip(id).then((r) => {
      if (!r) return null;
      const bytes = Uint8Array.from(atob(r.data), (c) => c.charCodeAt(0));
      return URL.createObjectURL(new Blob([bytes], { type: r.mime || 'audio/wav' }));
    }).catch(() => null));
  }
  return studioUrls.get(k);
}
export function forgetStudio(id) { for (const k of [...studioUrls.keys()]) if (k.startsWith(id + '@')) studioUrls.delete(k); }

const list = (path) => fetch(u(path)).then((r) => (r.ok ? r.json() : []), () => []).then((xs) => new Set(xs));
let teacher = null, made = null;
const teacherSet = () => (teacher ??= list('audio/letters/recordings.json'));
const madeSet = () => (made ??= list('audio/voice/index.json'));

let current = null;
export function stopSound() { try { current?.pause(); } catch {} current = null; try { speechSynthesis.cancel(); } catch {} }

// Play one audio file; resolves when it ends (or fails, or after a safe time).
export function playUrl(url, maxMs = 30000) {
  stopSound();
  const a = new Audio(url);
  current = a;
  return new Promise((resolve) => {
    let done = false;
    const fin = (ok) => { if (!done) { done = true; resolve(ok); } };
    a.onended = () => fin(true); a.onerror = () => fin(false);
    a.play().catch(() => fin(false));
    setTimeout(() => fin(true), maxMs);
  });
}

// Is there a clip (recorded or made) for this id?
export async function hasClip(id) { return (await teacherSet()).has(id) || (await madeSet()).has(id); }

// Say a clip by id. `fallbackAr` is spoken by the browser voice only if there is no file at all.
export async function say(id, fallbackAr = '') {
  const rec = await studioUrl(id);
  if (rec && (await playUrl(rec, 8000))) return true;
  if ((await teacherSet()).has(id) && (await playUrl(u(`audio/letters/${id}.mp3`), 8000))) return true;
  if ((await madeSet()).has(id) && (await playUrl(u(`audio/voice/${id}.mp3`), 8000))) return true;
  return browserSay(fallbackAr);
}

let voice = null;
function pickVoice() {
  const vs = (globalThis.speechSynthesis?.getVoices() ?? []).filter((v) => /^ar([-_]|$)/i.test(v.lang));
  const score = (v) => (/natural|neural|online/i.test(v.name) ? 4 : 0) + (/hamed|shakir/i.test(v.name) ? 3 : 0) + (/google/i.test(v.name) ? 2 : 0);
  voice = vs.sort((a, b) => score(b) - score(a))[0] ?? null;
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) { pickVoice(); speechSynthesis.addEventListener?.('voiceschanged', pickVoice); }
export function browserSay(ar) {
  if (!ar || !voice) return Promise.resolve(false);
  return new Promise((resolve) => {
    const ut = new SpeechSynthesisUtterance(ar);
    ut.voice = voice; ut.lang = voice.lang; ut.rate = 0.7; ut.pitch = 0.92;
    ut.onend = () => resolve(true); ut.onerror = () => resolve(false);
    speechSynthesis.cancel(); speechSynthesis.speak(ut);
    setTimeout(() => resolve(true), 5000);
  });
}

// ── how the Sheikh reads a letter ─────────────────────────────
// Two ways, nothing else:
// name:  the letter's name (Alif, Ba, Ta), the default
// sound: the letter with a fat-ha (ba, ta, tha)
export const LETTER_VOICES = [
  ['name', 'Letter names (Alif, Ba, Ta)'],
  ['sound', 'With fat-ha (ba, ta, tha)'],
];
// (v3: the earlier sound-first and sukun choices are gone, so an old saved choice falls back to letter names)
const KEY3 = 'qc.letterVoice.v3';
export function letterVoice() {
  try { const v = localStorage.getItem(KEY3); return LETTER_VOICES.some(([k]) => k === v) ? v : 'name'; } catch { return 'name'; }
}
export function setLetterVoice(v) { try { localStorage.setItem(KEY3, v); } catch {} }

// The written form that matches what the Sheikh says, shown under the letter.
export function letterSpoken(L, mode = letterVoice()) {
  const base = L.letter === 'ا' ? 'أ' : L.letter;
  if (mode === 'sound') return { id: `s-${L.file}-a`, ar: `${base}َ`, latin: `${L.sound}a` };
  return { id: `n-${L.file}`, ar: L.name, latin: L.latin };
}
export function sayLetter(L, mode = letterVoice()) {
  const s = letterSpoken(L, mode);
  return say(s.id, s.ar);
}
