// The Voice Studio: a teacher records the Sheikh's voice, clip by clip, in the browser.
// Each take is trimmed, evened out and saved (through the Apps Script) to the school's Google Drive. From then
// on the classroom plays the teacher's voice instead of the computer voice for that clip.
import { LETTERS } from './alifba.mjs';
import { PHRASES } from './phrases.mjs';
import { isHeld, say, studioUrl, forgetStudio, loadStudio, stopSound } from './voice.mjs';
import { syllable } from './lessons.mjs';
import { voiceCheck, voiceSave, voiceDelete } from './classlog.mjs';

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const FIRST = { alif: 'a', ba: 'b', ta: 't', tha: 'th', jim: 'j', 'ha-hollow': 'ḥ', kha: 'kh', dal: 'd', dhal: 'dh', ra: 'r', zay: 'z', sin: 's', shin: 'sh', sad: 'ṣ', dad: 'ḍ', 'ta-heavy': 'ṭ', 'dha-heavy': 'ẓ', ayn: 'ʿ', ghayn: 'gh', fa: 'f', qaf: 'q', kaf: 'k', lam: 'l', mim: 'm', nun: 'n', ha: 'h', waw: 'w', ya: 'y' };

// Every clip the classroom can use, in the order that helps students most.
export function catalogue() {
  const groups = [];
  groups.push({ key: 'first', title: 'Sound-first letters', why: 'Start here. These are what the youngest students hear most.', clips: LETTERS.map((L) => {
    const held = isHeld(L), s = FIRST[L.file];
    return { id: `f-${L.file}`, ar: L.letter, label: `${L.latin} · “${held ? s.repeat(3) : s}”`,
      how: held ? `Hold the sound steady for about a second: “${s.repeat(4)}…”. No vowel after it, and not the letter's name.` : L.file === 'alif' ? 'A short, clear “a”.' : `Short and crisp: “${s}”, with only a light release and no “uh” after it.` };
  }) });
  groups.push({ key: 'phrases', title: 'The Sheikh’s words', why: 'Praise and instructions, in a calm, gentle voice.', clips: Object.values(PHRASES).flatMap((p) => {
    const forms = [p.m, p.f, p.n].filter(Boolean);
    const seen = new Set();
    return forms.filter(([, file]) => (seen.has(file) ? false : seen.add(file))).map(([ar, file]) => ({ id: `p-${file}`, ar, label: p.en, how: 'Calm and unhurried, as you would speak to a student beside you.' }));
  }) });
  groups.push({ key: 'names', title: 'Letter names', why: 'For “Letter names” in the drop-down, and the Muqatta’at.', clips: LETTERS.map((L) => ({ id: `n-${L.file}`, ar: L.name, label: L.latin, how: 'Say the name clearly.' })) });
  const syl = (key, title, vs, how) => groups.push({ key, title, why: '', clips: LETTERS.flatMap((L) => vs.map((v) => { const x = syllable(L, v); return { id: x.id, ar: x.ar, label: x.latin, how }; })) });
  syl('harakat', 'With fat-ha, kes-ra and dom-ma', ['a', 'i', 'u'], 'One short syllable.');
  syl('sukun', 'Sukun and shadda', ['sk', 'sh'], 'As written: أَبْ, then أَبَّ.');
  syl('tanween', 'Tanween', ['an', 'in', 'un'], 'One syllable with its nun sound.');
  syl('madd', 'Madd', ['aa', 'ii', 'uu'], 'Hold the vowel for the length of one alif.');
  return groups;
}

// ── recording and tidying a take ──
function encodeWav(samples, rate) {
  const buf = new ArrayBuffer(44 + samples.length * 2), v = new DataView(buf);
  const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); v.setUint32(4, 36 + samples.length * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, samples[i])) * 32767, true);
  return new Uint8Array(buf);
}
// trim the silence at both ends, keep a little air, even out the level, soft edges, 22 kHz mono
export async function tidy(blob) {
  const ctx = new AudioContext();
  const audio = await ctx.decodeAudioData(await blob.arrayBuffer());
  ctx.close();
  const rate = 22050;
  const off = new OfflineAudioContext(1, Math.ceil(audio.duration * rate), rate);
  const src = off.createBufferSource(); src.buffer = audio; src.connect(off.destination); src.start();
  const x = (await off.startRendering()).getChannelData(0);
  const win = Math.round(rate * 0.02), n = Math.floor(x.length / win);
  const rms = Array.from({ length: n }, (_, k) => Math.sqrt(x.subarray(k * win, (k + 1) * win).reduce((a, b) => a + b * b, 0) / win));
  const peak = Math.max(...rms, 1e-6), thr = Math.max(peak * 0.06, 0.004);
  let a = rms.findIndex((r) => r > thr), b = n - 1 - [...rms].reverse().findIndex((r) => r > thr);
  if (a < 0) return null;
  a = Math.max(0, a * win - Math.round(rate * 0.12)); b = Math.min(x.length, (b + 1) * win + Math.round(rate * 0.2));
  const y = x.slice(a, b);
  let mx = 0; for (const s of y) mx = Math.max(mx, Math.abs(s));
  const gain = mx > 0 ? 0.89 / mx : 1;
  const f = Math.round(rate * 0.012);
  for (let i = 0; i < y.length; i++) { y[i] *= gain; if (i < f) y[i] *= i / f; if (i > y.length - f) y[i] *= (y.length - i) / f; }
  return { wav: encodeWav(y, rate), seconds: y.length / rate };
}
const b64 = (bytes) => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(s); };

// ── the screen ──
export function mountStudio(root, { onExit }) {
  let password = '', by = '', stream = null, list = {}, group = 'first';
  root.replaceChildren();
  const signin = el('form', 'st-signin card');
  signin.innerHTML = '<h2 class="h2">Voice Studio sign-in</h2><p class="muted">For teachers. The password is in the Settings tab of the admin sheet.</p>';
  const nameF = el('label', 'fld'); nameF.append(el('span', null, 'Your name'), Object.assign(el('input'), { id: 'st-by', autocomplete: 'name', placeholder: 'Ustadh …' }));
  const pwF = el('label', 'fld'); pwF.append(el('span', null, 'Voice Studio password'), Object.assign(el('input'), { id: 'st-pw', type: 'password', autocomplete: 'off' }));
  const err = el('p', 'err'); err.setAttribute('role', 'alert');
  const go = el('button', 'btn btn-primary big', 'Open the studio'); go.type = 'submit';
  const back = el('button', 'btn link', 'Back'); back.type = 'button'; back.addEventListener('click', () => { stop(); onExit(); });
  signin.append(nameF, pwF, err, go, back);
  root.append(signin);
  signin.addEventListener('submit', async (e) => {
    e.preventDefault(); err.textContent = '';
    go.disabled = true;
    const r = await voiceCheck(signin.querySelector('#st-pw').value);
    go.disabled = false;
    if (!r.ok) { err.textContent = r.error === 'network' ? 'Could not reach the class log. Check the connection and try again.' : 'That password is not right.'; return; }
    password = signin.querySelector('#st-pw').value; by = signin.querySelector('#st-by').value.trim();
    list = await loadStudio(true);
    renderStudio();
  });

  function stop() { stream?.getTracks().forEach((t) => t.stop()); stream = null; stopSound(); }

  function renderStudio() {
    root.replaceChildren();
    const groups = catalogue();
    const done = (g) => g.clips.filter((c) => list[c.id] != null).length;
    const head = el('div', 'st-head');
    head.append(el('p', 'muted lead', 'Record in a quiet room, about a hand’s width from the microphone, in a calm, steady voice. Press Record, say the clip, press Stop, listen, then Save. You can record again at any time.'));
    const tabs = el('div', 'st-tabs'); tabs.setAttribute('role', 'tablist');
    for (const g of groups) {
      const t = el('button', 'st-tab' + (g.key === group ? ' on' : ''), `${g.title} · ${done(g)}/${g.clips.length}`); t.type = 'button';
      t.addEventListener('click', () => { group = g.key; renderStudio(); });
      tabs.append(t);
    }
    const g = groups.find((x) => x.key === group);
    const intro = el('p', 'muted', g.why);
    const rows = el('div', 'st-rows');
    for (const c of g.clips) rows.append(row(c));
    const exit = el('button', 'btn', 'Leave the studio'); exit.type = 'button'; exit.addEventListener('click', () => { stop(); onExit(); });
    root.append(head, tabs, intro, rows, exit);
  }

  function row(c) {
    const r = el('div', 'st-row' + (list[c.id] != null ? ' has' : ''));
    const ar = el('span', 'st-ar', c.ar); ar.lang = 'ar'; ar.dir = 'rtl';
    const info = el('div', 'st-info'); info.append(el('b', null, c.label), el('span', 'muted small', c.how));
    const state = el('span', 'st-state', list[c.id] != null ? 'Teacher’s voice ✓' : 'Computer voice');
    const hear = el('button', 'btn small-btn', 'Hear now'); hear.type = 'button';
    hear.addEventListener('click', () => say(c.id, c.ar));
    const rec = el('button', 'btn small-btn st-rec', '● Record'); rec.type = 'button';
    const take = el('button', 'btn small-btn', '▶ My take'); take.type = 'button'; take.hidden = true;
    const save = el('button', 'btn btn-primary small-btn', 'Save'); save.type = 'button'; save.hidden = true;
    const del = el('button', 'btn link small', 'Remove recording'); del.type = 'button'; del.hidden = list[c.id] == null;
    const msg = el('span', 'small st-msg');
    let recorder = null, chunks = [], result = null;
    rec.addEventListener('click', async () => {
      if (recorder?.state === 'recording') { recorder.stop(); return; }
      try {
        stream ??= await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: true, autoGainControl: false } });
      } catch { msg.textContent = 'The microphone is not available. Allow it in the browser and try again.'; return; }
      chunks = []; result = null; take.hidden = true; save.hidden = true;
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        rec.textContent = '● Record again'; rec.classList.remove('live');
        result = await tidy(new Blob(chunks, { type: recorder.mimeType })).catch(() => null);
        if (!result) { msg.textContent = 'Nothing was heard. Try again, a little closer to the microphone.'; return; }
        msg.textContent = `${result.seconds.toFixed(1)} s`; take.hidden = false; save.hidden = false;
      };
      recorder.start(); rec.textContent = '■ Stop'; rec.classList.add('live'); msg.textContent = 'Recording…';
    });
    take.addEventListener('click', () => { if (result) new Audio(URL.createObjectURL(new Blob([result.wav], { type: 'audio/wav' }))).play(); });
    save.addEventListener('click', async () => {
      if (!result) return;
      save.disabled = true; msg.textContent = 'Saving…';
      const r2 = await voiceSave({ password, id: c.id, data: b64(result.wav), by });
      save.disabled = false;
      if (!r2.ok) { msg.textContent = r2.error === 'password' ? 'The password has changed. Sign in again.' : 'Could not save. Try again.'; return; }
      forgetStudio(c.id); list = await loadStudio(true);
      msg.textContent = 'Saved'; state.textContent = 'Teacher’s voice ✓'; r.classList.add('has'); del.hidden = false; save.hidden = true;
    });
    del.addEventListener('click', async () => {
      const r2 = await voiceDelete({ password, id: c.id });
      if (r2.ok) { forgetStudio(c.id); list = await loadStudio(true); state.textContent = 'Computer voice'; r.classList.remove('has'); del.hidden = true; msg.textContent = 'Removed'; }
    });
    const btns = el('div', 'st-btns'); btns.append(hear, rec, take, save, del, msg);
    r.append(ar, info, state, btns);
    return r;
  }
  return { stop };
}
export { studioUrl };
