// The tajweed model's worker: hears one breath of recitation (at most 30 s of 16 kHz audio) and writes it in the
// Quran phonetic script, with the model's confidence and the time of each sound. Off the page's thread, so the
// mushaf and the live cursor never stutter while it listens.
//   in:  { type: 'load', model, ort }  then  { type: 'hear', id, audio: Float32Array }
//   out: { type: 'ready' } | { type: 'error', message } | { type: 'heard', id, heard, probs, times, ms }
import { modelInput } from './mel.mjs';

// HisnLabs tajweed-v2 config.json: blank = 0, then these symbols
const PHONEMES = ['ء', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل',
  'م', 'ن', 'ه', 'و', 'ي', 'ا', 'ۦ', 'ۥ', 'َ', 'ُ', 'ِ', '۪', 'ـ', 'ٲ', 'ڇ', 'ں', '۾', 'ۜ', 'ؙ'];
const SR = 16000, LEAD = Math.round(SR * 0.4);   // the training clips start and end with silence
let ort = null, sess = null;

async function load({ model, ort: ortUrl }) {
  try {
    ort = await import(/* @vite-ignore */ ortUrl + 'ort.wasm.min.mjs');
    ort.env.wasm.wasmPaths = ortUrl;
    ort.env.wasm.numThreads = 1;
    sess = await ort.InferenceSession.create(model, { executionProviders: ['wasm'], graphOptimizationLevel: 'all' });
    postMessage({ type: 'ready' });
  } catch (e) { postMessage({ type: 'error', message: String(e?.message ?? e) }); }
}

async function hear({ id, audio }) {
  const t0 = performance.now();
  try {
    const x = new Float32Array(Math.min(audio.length, SR * 29) + 2 * LEAD);
    x.set(audio.subarray(0, x.length - 2 * LEAD), LEAD);
    const { data, frames } = modelInput(x);
    const out = await sess.run({ mel: new ort.Tensor('float32', data, [1, 80, frames]), riwaya: new ort.Tensor('int64', BigInt64Array.from([0n]), [1]) });
    const lp = out[sess.outputNames[0]];
    const [, T, C] = lp.dims, d = lp.data;
    const step = x.length / SR / T, lead = LEAD / SR;
    let heard = '', prev = 0, last = -1;
    const probs = [], times = [];
    for (let t = 0; t < T; t++) {
      let best = 0, bv = -Infinity;
      for (let c = 0; c < C; c++) { const v = d[t * C + c]; if (v > bv) { bv = v; best = c; } }
      if (best !== 0) last = t;
      if (best !== prev && best !== 0) { heard += PHONEMES[best - 1] ?? ''; probs.push(Math.exp(bv)); times.push((t + 0.5) * step - lead); }
      prev = best;
    }
    times.push(last >= 0 ? (last + 1) * step - lead : 0);
    postMessage({ type: 'heard', id, heard, probs, times, ms: Math.round(performance.now() - t0) });
  } catch (e) { postMessage({ type: 'heard', id, error: String(e?.message ?? e) }); }
}

onmessage = (e) => {
  const m = e.data;
  if (m.type === 'load') load(m);
  else if (m.type === 'hear') hear(m);
};
