// Offline listening: a surah's recitation saved on the device, one reciter at a time.
// The āyah files (EveryAyah allows this: it sends Access-Control-Allow-Origin: *) go into the "ql-audio" cache; the
// player plays a saved file from a blob URL, so seeking works everywhere (iPhone included) without the service worker
// having to answer byte-range requests. The text, layout, tajweed and word timings of the surah are fetched too, so
// the service worker (public/quran/sw.js) has them cached for the page to open with no connection.
import { getJson, pad, audioUrl } from './client.mjs';

const CACHE = 'ql-audio';
const INDEX = 'ql-offline';   // localStorage: { "<reciter>": { "<surah>": true } }
const ok = () => typeof caches !== 'undefined';
const index = () => { try { return JSON.parse(localStorage.getItem(INDEX) || '{}'); } catch { return {}; } };
const setIndex = (v) => { try { localStorage.setItem(INDEX, JSON.stringify(v)); } catch {} };

export const isSaved = (reciter, s) => !!index()[reciter]?.[s];
export const supported = ok;

// the saved file as a blob URL, or null (then the player streams it)
export async function savedUrl(reciter, s, a) {
  if (!ok() || !isSaved(reciter, s)) return null;
  try { const hit = await (await caches.open(CACHE)).match(audioUrl(reciter, s, a)); return hit ? URL.createObjectURL(await hit.blob()) : null; } catch { return null; }
}

async function ayahCount(s) { const meta = await getJson('meta.json'); return meta.surahs[s - 1]?.ayahs ?? 0; }

// onProgress(done, total); returns true when every file was saved
export async function save(reciter, s, onProgress = () => {}) {
  if (!ok()) return false;
  const n = await ayahCount(s), c = await caches.open(CACHE);
  const urls = Array.from({ length: n }, (_, i) => audioUrl(reciter, s, i + 1));
  if (s !== 1 && s !== 9) urls.push(audioUrl(reciter, 1, 1));   // the basmalah read before the surah
  let done = 0, failed = 0;
  onProgress(0, urls.length);
  const queue = [...urls];
  await Promise.all(Array.from({ length: 4 }, async () => {
    for (let u = queue.shift(); u; u = queue.shift()) {
      try { if (!(await c.match(u))) { const r = await fetch(u, { mode: 'cors' }); if (!r.ok) throw new Error(r.status); await c.put(u, r); } } catch { failed++; }
      onProgress(++done, urls.length);
    }
  }));
  // the page's own data, so the service worker has it for offline use
  try {
    const meta = await getJson('meta.json'), first = meta.surahs[s - 1].page, last = (meta.surahs[s]?.page ?? 605) - (meta.surahs[s]?.page > first ? 1 : 0);
    await Promise.all([`surah/${pad(s)}.json`, `tajweed/${pad(s)}.json`, `timings/${reciter}/${pad(s)}.json`,
      ...Array.from({ length: Math.max(1, last - first + 1) }, (_, i) => `layout/${pad(first + i)}.json`)].map((p) => getJson(p).catch(() => null)));
  } catch {}
  if (failed) return false;
  const ix = index(); (ix[reciter] ??= {})[s] = true; setIndex(ix);
  return true;
}

export async function remove(reciter, s) {
  const ix = index(); if (ix[reciter]) { delete ix[reciter][s]; setIndex(ix); }
  if (!ok()) return;
  const c = await caches.open(CACHE), n = await ayahCount(s);
  await Promise.all(Array.from({ length: n }, (_, i) => c.delete(audioUrl(reciter, s, i + 1))));
}

// A button that saves or removes the surah being listened to. target() → { reciter, s, name } or null.
export function offlineButton(btn, target) {
  if (!ok()) { btn.hidden = true; return { refresh() {} }; }
  let busy = false;
  const refresh = () => {
    if (busy) return;
    const t = target();
    btn.disabled = !t;
    const on = t && isSaved(t.reciter, t.s);
    btn.setAttribute('aria-pressed', String(!!on));
    btn.textContent = on ? 'Saved offline ✓' : 'Save offline';
    btn.title = t ? (on ? `${t.name} is saved on this device for this reciter. Tap to remove it.` : `Save ${t.name} on this device, to listen with no connection`) : '';
  };
  btn.addEventListener('click', async () => {
    const t = target(); if (!t || busy) return;
    busy = true; btn.disabled = true;
    if (isSaved(t.reciter, t.s)) { btn.textContent = 'Removing…'; await remove(t.reciter, t.s); }
    else {
      const good = await save(t.reciter, t.s, (d, n) => { btn.textContent = `Saving ${Math.round((100 * d) / n)}%`; });
      if (!good) { btn.textContent = 'Could not save: try again'; busy = false; btn.disabled = false; setTimeout(refresh, 2500); return; }
    }
    busy = false; btn.disabled = false; refresh();
  });
  refresh();
  return { refresh };
}
