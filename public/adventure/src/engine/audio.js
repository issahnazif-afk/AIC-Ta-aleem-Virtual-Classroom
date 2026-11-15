// Small sound effects and a soft ambient pad, made in the browser (Web Audio): no audio files, nothing recorded.
// The pad uses only gentle tones; there are no instruments, so it suits families who avoid music (it can be
// switched off on its own in Settings).
import { save } from './save.js';

let ctx = null, master = null, padGain = null, pad = [];
function ac() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
    } catch { return null; }
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq, dur, { type = 'sine', vol = 0.2, at = 0, slide = 0 } = {}) {
  if (!save.settings.sound || !ac()) return;
  const t = ctx.currentTime + at;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq * slide), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur, vol = 0.15, at = 0, hp = 800) {
  if (!save.settings.sound || !ac()) return;
  const t = ctx.currentTime + at, n = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = buf; f.type = 'highpass'; f.frequency.value = hp; g.gain.value = vol;
  s.connect(f).connect(g).connect(master); s.start(t);
}

export const sfx = {
  mote: () => { tone(880, 0.12, { vol: 0.12 }); tone(1320, 0.16, { vol: 0.08, at: 0.05 }); },
  jump: () => tone(300, 0.22, { type: 'triangle', vol: 0.12, slide: 2.2 }),
  slide: () => noise(0.25, 0.08, 0, 1200),
  lane: () => tone(520, 0.06, { type: 'triangle', vol: 0.05 }),
  bump: () => { tone(140, 0.25, { type: 'triangle', vol: 0.18, slide: 0.6 }); noise(0.12, 0.08, 0, 300); },
  gateOpen: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.35, { vol: 0.1, at: i * 0.09 })),
  right: () => { tone(660, 0.18, { vol: 0.12 }); tone(990, 0.3, { vol: 0.1, at: 0.12 }); },
  wrong: () => tone(330, 0.3, { type: 'sine', vol: 0.1, slide: 0.8 }),
  discover: () => [392, 523, 659].forEach((f, i) => tone(f, 0.5, { vol: 0.09, at: i * 0.12 })),
  click: () => tone(700, 0.04, { type: 'triangle', vol: 0.05 }),
  dash: () => noise(0.18, 0.1, 0, 900),
  win: () => [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.5, { vol: 0.1, at: i * 0.11 })),
  splash: () => noise(0.5, 0.12, 0, 400),
  pad: (on) => setPad(on),
};

// a slow, quiet drone of two soft tones, changing with the region (no rhythm, no instruments)
const PADS = { desert: [146.8, 220], oasis: [164.8, 246.9], caves: [110, 164.8], mountain: [130.8, 196], harbour: [123.5, 185], storm: [98, 146.8] };
function setPad(env) {
  if (!ac()) return;
  const t = ctx.currentTime;
  if (padGain) { const old = padGain, oldPad = pad; old.gain.setTargetAtTime(0, t, 0.6); setTimeout(() => oldPad.forEach((o) => { try { o.stop(); } catch {} }), 2500); padGain = null; pad = []; }
  if (!env || !save.settings.music || !save.settings.sound) return;
  padGain = ctx.createGain(); padGain.gain.value = 0; padGain.connect(master);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; lp.connect(padGain);
  for (const f of PADS[env] ?? PADS.desert) for (const det of [-3, 3]) {
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f; o.detune.value = det; o.connect(lp); o.start(); pad.push(o);
  }
  padGain.gain.setTargetAtTime(0.05, t, 1.5);
}
export function unlockAudio() { ac(); }
