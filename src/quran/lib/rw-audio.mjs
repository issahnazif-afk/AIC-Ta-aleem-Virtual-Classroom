// Playing any āyah in any riwāyah: used by Listen (the audio bar), the Hifz test and the riwāyah classroom.
//
// Ḥafṣ and the EveryAyah Warsh reciters: one file per āyah, numbered like Ḥafṣ.
// The other reciters (mp3quran.net): one file per sūrah, cut to the āyah with mp3quran's published timings. Their
// āyāt follow the riwāyah's own count (Madanī, Baṣrī, Makkī…), so each Ḥafṣ āyah is looked up in
// data/riwayah/<id>-map.json (scripts/quran/riwayah-diff.mjs): [first, last] riwāyah āyah; a negative first means
// that riwāyah āyah also holds words of the next or previous Ḥafṣ āyah, so the two are heard together.
import cfg from '../config.mjs';
import { u } from './url.mjs';

const pad = (n) => String(n).padStart(3, '0');
export const riwayahOf = (id) => (cfg.riwayat ?? []).find((r) => r.id === id) ?? null;
export const riwayahName = (id) => (id === 'hafs' || !id ? 'Ḥafṣ ʿan ʿĀṣim' : riwayahOf(id)?.name ?? id);

// who recites a riwāyah (Ḥafṣ: the library's EveryAyah reciters)
export function recitersFor(rw) {
  if (!rw || rw === 'hafs') return cfg.reciters.map((r) => ({ ...r, src: 'everyayah' }));
  return riwayahOf(rw)?.reciters ?? [];
}
// the reciter chosen for a riwāyah (remembered per riwāyah), or its first
export function reciterFor(rw) {
  const list = recitersFor(rw);
  let id = null;
  try { id = JSON.parse(localStorage.getItem(rw === 'hafs' ? 'ql-reciter' : `ql-reciter-${rw}`) ?? 'null'); } catch {}
  return list.find((r) => r.id === id) ?? list[0] ?? null;
}
export function chooseReciter(rw, id) {
  try { localStorage.setItem(rw === 'hafs' ? 'ql-reciter' : `ql-reciter-${rw}`, JSON.stringify(id)); } catch {}
}

const maps = new Map();
export function rwMap(rw) {
  if (!maps.has(rw)) maps.set(rw, fetch(u(`data/riwayah/${rw}-map.json`)).then((r) => (r.ok ? r.json() : {})).catch(() => ({})));
  return maps.get(rw);
}
const timings = new Map();
function timing(reciter, s) {
  const k = `${reciter}:${s}`;
  if (!timings.has(k)) {
    timings.set(k, fetch(`https://www.mp3quran.net/api/v3/ayat_timing?surah=${s}&read=${reciter}`)
      .then((r) => (r.ok ? r.json() : [])).catch(() => []));
  }
  return timings.get(k);
}

// The recording of āyah s:a (Ḥafṣ numbers) in riwāyah rw by this reciter:
//   { url, start?, end?, with: [Ḥafṣ āyāt heard in this clip] }  or null when there is none.
// opening: for āyah 1, start from the beginning of the sūrah file (the istiʿādhah and basmalah), as in Listen
export async function clipFor(rw, reciter, s, a, { opening = false } = {}) {
  if (!reciter) return null;
  if (reciter.src === 'everyayah') return { url: `https://everyayah.com/data/${reciter.id}/${pad(s)}${pad(a)}.mp3`, with: [a] };
  const [m, t] = await Promise.all([rwMap(rw), timing(reciter.id, s)]);
  const row = m[s] ?? [];
  const url = `${reciter.folder}${pad(s)}.mp3`;
  const at = (n) => t.find((x) => x.ayah === n);
  const v = row[a - 1];
  if (!v) {
    // al-Fātiḥah's basmalah (āyah 1 in Ḥafṣ, not counted in the other riwāyāt): from the start to the first āyah
    const first = at(1);
    return first ? { url, start: 0, end: first.start_time / 1000, with: [a] } : null;
  }
  const lo = Math.abs(v[0]), hi = v[1];
  const from = at(lo), to = at(hi);
  if (!from || !to) return null;
  // every Ḥafṣ āyah heard in the same stretch (an āyah the riwāyah counts as one with its neighbour)
  const together = [];
  row.forEach((x, i) => { if (x && Math.abs(x[0]) <= hi && x[1] >= lo) together.push(i + 1); });
  return { url, start: opening && a === 1 ? 0 : from.start_time / 1000, end: to.end_time / 1000, with: together.length ? together : [a] };
}

// Play a clip on an <audio>: seeks into a sūrah file and stops at the āyah's end. Resolves true at the end, false
// if it cannot be played or another clip takes over.
let token = 0;
export function playClip(audio, clip) {
  const mine = ++token;
  return new Promise((resolve) => {
    if (!clip) { resolve(false); return; }
    let done = false;
    const end = (ok) => {
      if (done) return; done = true;
      audio.removeEventListener('timeupdate', tick); audio.removeEventListener('ended', ended); audio.removeEventListener('error', failed);
      resolve(ok);
    };
    const tick = () => { if (mine !== token) return end(false); if (clip.end && audio.currentTime >= clip.end) { audio.pause(); end(true); } };
    const ended = () => end(mine === token);
    const failed = () => end(false);
    audio.addEventListener('timeupdate', tick); audio.addEventListener('ended', ended); audio.addEventListener('error', failed);
    const go = () => { if (mine !== token) return end(false); audio.play().catch(() => end(false)); };
    const same = audio.src === clip.url;
    if (clip.start != null) {
      const seek = () => { try { audio.currentTime = clip.start; } catch {} go(); };
      if (same && audio.readyState >= 1) seek();
      else { audio.src = clip.url; audio.addEventListener('loadedmetadata', seek, { once: true }); audio.load(); }
    } else { if (!same) audio.src = clip.url; else audio.currentTime = 0; go(); }
  });
}
export const stopClips = () => { token++; };
