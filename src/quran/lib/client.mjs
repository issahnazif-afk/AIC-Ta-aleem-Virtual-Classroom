// Browser-side helpers shared by every page: settings, bookmarks, audio.
import cfg from '../config.mjs';
import { u } from './url.mjs';
import { recitersFor, reciterFor, chooseReciter, clipFor, playClip, stopClips, riwayahName } from './rw-audio.mjs';

export const pad = (n) => String(n).padStart(3, '0');
export const dataUrl = (p) => u('data/' + p);

const store = {
  get(k, fallback) {
    try { const v = localStorage.getItem('ql-' + k); return v === null ? fallback : JSON.parse(v); }
    catch { return fallback; }
  },
  set(k, v) { try { localStorage.setItem('ql-' + k, JSON.stringify(v)); } catch {} },
};
export { store };

export const settings = {
  get translation() { return store.get('translation', cfg.defaultTranslation); },
  set translation(v) { store.set('translation', v); },
  get reciter() { return store.get('reciter', cfg.defaultReciter); },
  set reciter(v) { store.set('reciter', v); },
  get wbw() { return store.get('wbw', false); },
  set wbw(v) { store.set('wbw', v); },
};

export const bookmarks = {
  all() { return store.get('bookmarks', []); },
  has(k) { return this.all().includes(k); },
  toggle(k) {
    const list = this.all();
    const i = list.indexOf(k);
    if (i >= 0) list.splice(i, 1); else list.unshift(k);
    store.set('bookmarks', list);
    return i < 0;
  },
};

export const lastRead = {
  get() { return store.get('last-read', null); },
  set(v) { store.set('last-read', v); },
};

const jsonCache = new Map();
export function getJson(p) {
  if (!jsonCache.has(p)) {
    jsonCache.set(p, fetch(dataUrl(p)).then((r) => {
      if (!r.ok) throw new Error(`Could not load ${p} (HTTP ${r.status})`);
      return r.json();
    }));
  }
  return jsonCache.get(p);
}

export const audioUrl = (reciter, s, a) => `https://everyayah.com/data/${reciter}/${pad(s)}${pad(a)}.mp3`;

// ── Audio player (one per page) ───────────────────────────────
// Markup comes from src/components/Player.astro. It plays the riwāyah chosen in the Quran menu: Ḥafṣ from the
// library's reciters, the other riwāyāt from their own reciters (src/quran/lib/rw-audio.mjs).
export function initPlayer({ lazy = false } = {}) {
  const bar = document.getElementById('player');
  if (!bar) return null;
  const audio = new Audio();
  audio.preload = 'auto';
  const playBtn = bar.querySelector('[data-p="play"]');
  const title = bar.querySelector('[data-p="title"]');
  const sub = bar.querySelector('[data-p="sub"]');
  const fill = bar.querySelector('[data-p="fill"]');
  const repeatBtn = bar.querySelector('[data-p="repeat"]');
  const speedBtn = bar.querySelector('[data-p="speed"]');
  const reciterSel = bar.querySelector('[data-p="reciter"]');
  const err = bar.querySelector('[data-p="error"]');
  const errText = err.textContent;
  let queue = [], idx = -1, repeat = false, loopAll = false, clip = null, loadNo = 0;
  // past the end of the queue: back to its start when looping it all
  const after = (i) => (i >= queue.length && loopAll ? 0 : i);
  const speeds = [1, 1.25, 1.5, 0.75];

  const rw = () => document.documentElement.dataset.riwayah || 'hafs';
  // the reciters of the riwāyah in the select (Ḥafṣ: the library's own list, as built into the page)
  const hafsOptions = [...reciterSel.options].map((o) => [o.value, o.textContent]);
  function fillReciters() {
    const r = rw();
    const list = r === 'hafs' ? hafsOptions.map(([id, name]) => ({ id, name })) : recitersFor(r);
    reciterSel.replaceChildren(...list.map((x) => new Option(x.name, x.id)));
    reciterSel.disabled = !list.length;
    if (r === 'hafs') reciterSel.value = settings.reciter;
    else reciterSel.value = reciterFor(r)?.id ?? '';
  }
  fillReciters();
  const reciterName = () => reciterSel.selectedOptions[0]?.textContent ?? '';

  function setPlaying(on) {
    playBtn.setAttribute('aria-label', on ? 'Pause' : 'Play');
    playBtn.querySelector('[data-i="play"]').hidden = on;
    playBtn.querySelector('[data-i="pause"]').hidden = !on;
  }
  function failed(text) {
    err.textContent = text ?? errText;
    err.hidden = false;
    setPlaying(false);
  }
  async function load(i) {
    show();
    idx = i;
    const item = queue[idx];
    if (!item) { stop(); return; }
    err.hidden = true;
    const r = rw(), mine = ++loadNo;
    title.textContent = item.label ?? `${item.s}:${item.a}`;
    sub.textContent = r === 'hafs' ? reciterName() : `${reciterName()} · ${riwayahName(r)}`;
    document.dispatchEvent(new CustomEvent('ql:ayah', { detail: { key: `${item.s}:${item.a}` } }));
    if (r === 'hafs') {
      clip = null; stopClips();
      audio.src = audioUrl(settings.reciter, item.s, item.a);
      audio.play().catch(() => {});
      return;
    }
    // another riwāyah: its reciter, cut to this āyah
    const rec = recitersFor(r).find((x) => x.id === reciterSel.value) ?? reciterFor(r);
    if (!rec) { clip = null; failed(`No recitation of ${riwayahName(r)} is openly available yet: the text is shown, without audio.`); return; }
    const c = await clipFor(r, rec, item.s, item.a, { opening: true });
    if (mine !== loadNo) return;
    if (!c) { clip = null; failed(); return; }
    clip = c;
    const rate = audio.playbackRate;
    const ok = await playClip(audio, c);
    audio.playbackRate = rate;
    if (mine !== loadNo) return;
    if (!ok) { if (audio.error) failed(); return; }
    // on to the next āyah not already heard in this clip (a riwāyah may count two Ḥafṣ āyāt as one)
    if (repeat) { load(idx); return; }
    let n = idx + 1;
    while (queue[n] && queue[n].s === item.s && c.with.includes(queue[n].a) && queue[n].a !== item.a) n++;
    load(after(n));
  }
  function stop() {
    loadNo++; stopClips();
    audio.pause();
    setPlaying(false);
    document.dispatchEvent(new CustomEvent('ql:ayah', { detail: { key: null } }));
  }

  audio.addEventListener('play', () => setPlaying(true));
  audio.addEventListener('pause', () => setPlaying(false));
  audio.addEventListener('timeupdate', () => {
    const [a0, a1] = clip ? [clip.start ?? 0, clip.end ?? audio.duration] : [0, audio.duration];
    fill.style.width = a1 > a0 ? `${Math.min(100, Math.max(0, ((audio.currentTime - a0) / (a1 - a0)) * 100))}%` : '0';
  });
  // Ḥafṣ: one file per āyah, so the end of the file is the end of the āyah (other riwāyāt move on in load())
  audio.addEventListener('ended', () => { if (clip) return; repeat ? load(idx) : load(after(idx + 1)); });
  audio.addEventListener('error', () => {
    if (!audio.src) return;
    failed();
  });

  playBtn.addEventListener('click', () => {
    if (idx < 0) return load(0);
    if (!audio.paused) { audio.pause(); return; }
    // a clip that was stopped part-way carries on from where it is
    if (clip && audio.src && (clip.end == null || audio.currentTime < clip.end)) audio.play().catch(() => {});
    else if (clip) load(idx);
    else audio.play().catch(() => {});
  });
  bar.querySelector('[data-p="next"]').addEventListener('click', () => load(Math.min(idx + 1, queue.length - 1)));
  bar.querySelector('[data-p="prev"]').addEventListener('click', () => load(Math.max(idx - 1, 0)));
  repeatBtn.addEventListener('click', () => {
    repeat = !repeat;
    repeatBtn.setAttribute('aria-pressed', String(repeat));
  });
  speedBtn.addEventListener('click', () => {
    const next = speeds[(speeds.indexOf(audio.playbackRate) + 1) % speeds.length];
    audio.playbackRate = next;
    speedBtn.textContent = `${next}×`;
  });
  reciterSel.addEventListener('change', () => {
    if (rw() === 'hafs') settings.reciter = reciterSel.value;
    else chooseReciter(rw(), reciterSel.value);
    if (idx >= 0) load(idx);
  });
  // the riwāyah changed in the Quran menu: its own reciters, from the same āyah
  document.addEventListener('ql:riwayah', () => {
    const playing = !audio.paused;
    fillReciters();
    if (idx >= 0) { if (playing) load(idx); else { stop(); err.hidden = true; } }
  });

  const show = () => { bar.hidden = false; document.body.classList.add('has-player'); };
  if (!lazy) show();

  return {
    // a new queue; the ayah playing now keeps its place in it (if it is there), so playback carries on undisturbed
    setQueue(list) {
      const cur = queue[idx];
      queue = list;
      if (cur) idx = list.findIndex((q) => q.s === cur.s && q.a === cur.a);
    },
    playAt(key) {
      const i = queue.findIndex((q) => `${q.s}:${q.a}` === key);
      if (i >= 0) load(i);
    },
    playAll() { load(0); },
    // for the app's own controls at the bottom of the screen
    toggle() { playBtn.click(); },
    prev() { if (idx >= 0) load(Math.max(idx - 1, 0)); },
    next() { if (idx >= 0) load(after(Math.min(idx + 1, loopAll ? queue.length : queue.length - 1))); },
    stop() { stop(); idx = -1; },
    // loop: 'off', 'ayah' (the same ayah again and again) or 'all' (the whole queue, then from its start)
    setLoop(mode) {
      repeat = mode === 'ayah';
      loopAll = mode === 'all';
      repeatBtn.setAttribute('aria-pressed', String(repeat));
    },
    get active() { return idx >= 0; },
  };
}
