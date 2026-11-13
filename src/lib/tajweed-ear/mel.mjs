// Whisper's 80-band log-mel spectrogram, the input of the tajweed model (HisnLabs tajweed-v2), computed exactly as
// faster-whisper's FeatureExtractor does with padding=0: 400-sample periodic Hann window, hop 160, centred frames
// (reflect padding), the last frame dropped, slaney-style mel filters, log10, floor at max − 8, then (x + 4) / 4.
// No imports: used in the browser and checked against Python in Node.
const SR = 16000, N = 400, HOP = 160, BINS = N / 2 + 1, MELS = 80;

let tables = null;
function makeTables() {
  const win = new Float64Array(N);
  for (let i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / N);   // np.hanning(N + 1)[:-1]
  const cos = new Float64Array(BINS * N), sin = new Float64Array(BINS * N);
  for (let k = 0; k < BINS; k++) for (let i = 0; i < N; i++) {
    const a = (2 * Math.PI * k * i) / N;
    cos[k * N + i] = Math.cos(a); sin[k * N + i] = Math.sin(a);
  }
  // the filters (faster_whisper.feature_extractor.get_mel_filters)
  const maxMel = 45.245640471924965, fsp = 200 / 3, minLogHz = 1000, minLogMel = minLogHz / fsp, logstep = Math.log(6.4) / 27;
  const freqs = Array.from({ length: MELS + 2 }, (_, i) => {
    const m = (maxMel * i) / (MELS + 1);
    return m >= minLogMel ? minLogHz * Math.exp(logstep * (m - minLogMel)) : fsp * m;
  });
  const fft = Array.from({ length: BINS }, (_, k) => (k * SR) / N);
  const fb = [];
  for (let m = 0; m < MELS; m++) {
    const row = new Float64Array(BINS), enorm = 2 / (freqs[m + 2] - freqs[m]);
    let lo = BINS, hi = 0;
    for (let k = 0; k < BINS; k++) {
      const lower = (fft[k] - freqs[m]) / (freqs[m + 1] - freqs[m]);
      const upper = (freqs[m + 2] - fft[k]) / (freqs[m + 2] - freqs[m + 1]);
      const v = Math.max(0, Math.min(lower, upper)) * enorm;
      row[k] = v; if (v > 0) { lo = Math.min(lo, k); hi = k; }
    }
    fb.push({ row, lo, hi });
  }
  return { win, cos, sin, fb };
}

// x: Float32Array of 16 kHz samples → { data: Float32Array [80 × frames] (row-major, band by band), frames }
export function logMel(x) {
  tables ??= makeTables();
  const { win, cos, sin, fb } = tables;
  const pad = N / 2, len = x.length;
  const y = new Float64Array(len + 2 * pad);
  for (let i = 0; i < len; i++) y[pad + i] = x[i];
  for (let i = 1; i <= pad; i++) { y[pad - i] = x[Math.min(i, len - 1)]; y[pad + len - 1 + i] = x[Math.max(0, len - 1 - i)]; }   // reflect
  const all = 1 + Math.floor((y.length - N) / HOP);
  const T = Math.max(1, all - 1);                                   // the last frame is dropped
  const out = new Float32Array(MELS * T);
  const frame = new Float64Array(N), pw = new Float64Array(BINS);
  let top = -Infinity;
  for (let t = 0; t < T; t++) {
    const o = t * HOP;
    for (let i = 0; i < N; i++) frame[i] = y[o + i] * win[i];
    for (let k = 0; k < BINS; k++) {
      let re = 0, im = 0; const b = k * N;
      for (let i = 0; i < N; i++) { re += frame[i] * cos[b + i]; im -= frame[i] * sin[b + i]; }
      pw[k] = re * re + im * im;
    }
    for (let m = 0; m < MELS; m++) {
      const { row, lo, hi } = fb[m];
      let acc = 0; for (let k = lo; k <= hi; k++) acc += row[k] * pw[k];
      const v = Math.log10(Math.max(acc, 1e-10));
      out[m * T + t] = v; if (v > top) top = v;
    }
  }
  for (let i = 0; i < out.length; i++) out[i] = (Math.max(out[i], top - 8) + 4) / 4;
  return { data: out, frames: T };
}

// the frames the model takes: an even number, at most 3000 (30 s)
export function modelInput(x) {
  const { data, frames } = logMel(x);
  const T = Math.min(3000, Math.floor(frames / 2) * 2);
  if (T === frames) return { data, frames };
  const cut = new Float32Array(MELS * T);
  for (let m = 0; m < MELS; m++) cut.set(data.subarray(m * frames, m * frames + T), m * T);
  return { data: cut, frames: T };
}
