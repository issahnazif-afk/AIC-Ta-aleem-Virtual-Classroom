// The Sheikh's tajweed ear, beside the word checker: while the student recites, each breath (the audio between two
// pauses) is heard by the tajweed model (worker.mjs) and judged against the expected sounds of the words the word
// checker accepted in that breath (judge.mjs). Only the rules the student chose are judged. Audio never leaves the device.
//
//   const ear = createTajweedEar({ checks: Set(['madd', 'ghunnah', ...]), getFlat, getPos, onRemarks, onState })
//   ear.start() / ear.stop()          with the microphone
//   onRemarks([{ w: word of flat, remarks: [{ check, kind, rule, what, ... }] }])
//   onState('loading' | 'ready' | 'error', message)
// Words in flat: { item: { s, a (0: the Bismillah) }, wi, helped?, state }.
import { judge, sliceRefs, opcodes } from './judge.mjs';

const BASE = (import.meta.env?.BASE_URL ?? '/').replace(/\/?$/, '/');
export const MODEL_URL = BASE + 'models/tajweed-v2.onnx';
const ORT = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/';
const SR = 16000;

let worker = null, ready = null;
function loadWorker() {
  ready ??= new Promise((res, rej) => {
    worker = new Worker(new URL('./worker.mjs', import.meta.url), { type: 'module' });
    const on = (e) => {
      if (e.data.type === 'ready') { worker.removeEventListener('message', on); res(worker); }
      if (e.data.type === 'error') { worker.removeEventListener('message', on); rej(new Error(e.data.message)); }
    };
    worker.addEventListener('message', on);
    worker.postMessage({ type: 'load', model: new URL(MODEL_URL, location.href).href, ort: ORT });
  });
  ready.catch(() => { ready = null; worker?.terminate(); worker = null; });
  return ready;
}
let nextId = 1;
async function hearClip(audio) {
  const w = await loadWorker();
  const id = nextId++;
  return new Promise((res, rej) => {
    const on = (e) => {
      if (e.data.type !== 'heard' || e.data.id !== id) return;
      w.removeEventListener('message', on);
      e.data.error ? rej(new Error(e.data.error)) : res(e.data);
    };
    w.addEventListener('message', on);
    w.postMessage({ type: 'hear', id, audio }, [audio.buffer]);
  });
}

const refs = new Map();
function surahRefs(s) {
  if (!refs.has(s)) {
    const p = fetch(`${BASE}quran/data/tajweed-ref/${String(s).padStart(3, '0')}.json`).then((r) => { if (!r.ok) throw new Error('no ref'); return r.json(); });
    p.catch(() => refs.delete(s));
    refs.set(s, p);
  }
  return refs.get(s);
}
async function refOf(s, a) {
  if (a === 0) return s === 1 ? (await surahRefs(1)).a[1] : (await surahRefs(s)).b ?? (await surahRefs(1)).a[1];
  return (await surahRefs(s)).a[a];
}

// words (consecutive, from flat) → one reference, with which words can be judged
async function referenceFor(words) {
  const parts = [];
  for (const w of words) {
    const last = parts[parts.length - 1];
    if (last && last.it === w.item && w.wi === last.to) { last.to++; last.ws.push(w); continue; }
    parts.push({ it: w.item, from: w.wi, to: w.wi + 1, ws: [w] });
  }
  for (const p of parts) p.ref = await refOf(p.it.s, p.it.a);
  if (parts.some((p) => !p.ref || p.ref.w.length !== p.it.words.length)) return null;
  const ref = sliceRefs(parts);
  // which words to judge: not the words around a join the expected sounds cannot know (a stop inside an ayah, an
  // ayah end recited without stopping, a joining hamzah at the start of a breath), nor words shown as help
  const judgeable = [], all = parts.flatMap((p) => p.ws);
  parts.forEach((p, k) => p.ws.forEach((w, j) => {
    const lastOfBreath = k === parts.length - 1 && j === p.ws.length - 1;
    const ayahEnd = w.wi === p.it.words.length - 1;
    let ok = !w.helped;
    if (lastOfBreath && !ayahEnd) ok = false;                       // stopped inside the ayah: its pausal form differs
    if (!lastOfBreath && ayahEnd) ok = false;                       // ran on into the next ayah
    if (k === 0 && j === 0 && p.from > 0 && /^[ٱا]/.test(w.display ?? '')) ok = false;
    judgeable.push(ok);
  }));
  const ends = new Set(parts.flatMap((p, k) => (p.to === p.it.words.length || k === parts.length - 1 ? [parts.slice(0, k).reduce((t, q) => t + q.ws.length, 0) + p.ws.length - 1] : [])));
  return { ref, words: all, judgeable, ends };
}

// Judge one clip. words: the words the breath may hold, in order (those the word checker gave it and the ones
// expected next). The breath's own span is the one whose expected sounds match what was heard best: the word
// checker may have credited it with words just before (a Bismillah gone straight past), and may accept its last
// words only seconds later. → { words: [{ w, remarks }], used: [from, to) in words, heard } (also used by the tests)
export async function checkClip(audio, words, { checks, tempo = [] } = {}) {
  const h = await hearClip(audio);
  let best = null;
  for (let k = 0; k < Math.min(words.length, 8); k++) {
    for (let e = k + 1; e <= Math.min(words.length, k + 30); e++) {
      const r = await referenceFor(words.slice(k, e));
      if (!r || !r.ref.p.length) continue;
      const d = opcodes(r.ref.p, h.heard).distance;
      if (!best || d < best.d) best = { r, d, k, e };
      if (r.ref.p.length > h.heard.length * 1.6) break;          // longer spans only add words not heard
    }
  }
  // a breath that does not match the words (another passage, or a wrong word): say nothing
  if (!best || best.d > 0.35 * best.r.ref.p.length) return { words: [], used: null, heard: h, skipped: true };
  const { r } = best;
  const res = judge(r.ref, h.heard, h.probs, h.times, { kinds: checks, ends: r.ends, tempo });
  return { words: r.words.map((w, i) => ({ w, remarks: r.judgeable[i] ? res.words[i] : [] })).filter((x) => x.remarks.length), used: [best.k, best.e], heard: h };
}

export function preloadEar() { return loadWorker(); }

export function createTajweedEar({ checks, getFlat, getPos, onRemarks, onState }) {
  let stream = null, ctx = null, proc = null, running = false;
  let seg = [], segLen = 0, pre = [], silent = 0, speaking = false, floor = 0.004, ratio = 1;
  let fromPos = null, chain = Promise.resolve();
  const tempo = [];
  onState?.('loading');
  loadWorker().then(() => onState?.('ready'), (e) => onState?.('error', String(e?.message ?? e)));

  function close() {
    const audio = new Float32Array(segLen);
    let o = 0; for (const c of seg) { audio.set(c, o); o += c.length; }
    seg = []; segLen = 0; speaking = false;
    // judged one breath after another; each starts where the one before ended (once that is known)
    // the words as they are now: a new question may bring new words before this breath is judged
    const startP = fromPos, flat = getFlat(), posNow = getPos();
    let done; fromPos = new Promise((r) => { done = r; });
    chain = chain.then(async () => {
      const start = Math.max(0, (await startP) ?? posNow);
      // the words this breath may hold: from where the last one ended to a little past the word checker
      const idx = [];
      for (let i = start; i < Math.min(flat.length, Math.max(flat === getFlat() ? getPos() : posNow, start) + 16); i++) if (flat[i].state !== 'skipped') idx.push(i);
      if (audio.length < SR * 0.6 || !idx.length) { done(start); return; }
      const words = idx.map((i) => flat[i]);
      const r = await checkClip(audio, words, { checks, tempo });
      done(r?.used ? idx[r.used[1] - 1] + 1 : Math.max(start, flat === getFlat() ? getPos() : posNow));
      // for diagnostics (and the tests): what was heard and judged
      window.dispatchEvent(new CustomEvent('ql:tajweed', { detail: { words: r?.used ? words.slice(...r.used).map((w) => w.display).join(' ') : '', heard: r?.heard?.heard, ms: r?.heard?.ms, skipped: !!r?.skipped, remarks: r?.words.map((x) => [x.w.display, x.remarks.map((m) => m.check + ':' + m.what)]) ?? null } }));
      if (r?.words.length) onRemarks?.(r.words);
    }).catch((e) => { done(null); window.dispatchEvent(new CustomEvent('ql:tajweed', { detail: { error: String(e?.message ?? e) } })); });
  }
  function push(input) {
    let x;
    if (ratio !== 1) {
      const n = Math.floor(input.length / ratio); x = new Float32Array(n);
      for (let i = 0; i < n; i++) x[i] = input[Math.min(input.length - 1, Math.round(i * ratio))];
    } else x = Float32Array.from(input);
    let e = 0; for (let i = 0; i < x.length; i++) e += x[i] * x[i];
    const rms = Math.sqrt(e / x.length);
    const loud = rms > Math.max(0.0035, floor * 2.5);
    if (!loud) floor = 0.95 * floor + 0.05 * rms;
    const ms = (x.length / SR) * 1000;
    if (loud) {
      if (!speaking) { seg = [...pre]; segLen = seg.reduce((t, c) => t + c.length, 0); fromPos ??= Promise.resolve(getPos()); }
      speaking = true; silent = 0;
    } else silent += ms;
    if (speaking) { seg.push(x); segLen += x.length; }
    pre.push(x); if (pre.length > 3) pre.shift();
    if (speaking && (silent > 700 || segLen > SR * 27)) close();   // a very long breath is judged in parts
  }
  return {
    async start() {
      if (running) return;
      running = true;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: false, noiseSuppression: false, autoGainControl: true } });
      } catch { running = false; onState?.('error', 'microphone'); return; }
      if (!running) { stream.getTracks().forEach((t) => t.stop()); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      try { ctx = new AC({ sampleRate: SR }); } catch { ctx = new AC(); }
      if (ctx.state === 'suspended') { try { await ctx.resume(); } catch {} }
      ratio = ctx.sampleRate / SR;
      const src = ctx.createMediaStreamSource(stream);
      proc = ctx.createScriptProcessor(4096, 1, 1);
      src.connect(proc); proc.connect(ctx.destination);
      proc.onaudioprocess = (e) => { if (running) push(e.inputBuffer.getChannelData(0)); };
      fromPos = null;
    },
    stop() {
      if (!running) return;
      running = false;
      if (speaking) close();
      seg = []; segLen = 0; speaking = false; fromPos = null;
      try { proc?.disconnect(); } catch {}
      stream?.getTracks().forEach((t) => t.stop());
      ctx?.close().catch(() => {});
    },
  };
}
