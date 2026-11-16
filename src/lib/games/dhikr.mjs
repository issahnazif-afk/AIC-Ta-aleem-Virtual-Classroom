// The dhikr the Play & Make games ask a child to say aloud, and the listener that hears it.
// The listening is the Qāf tracker (track-recognition.mjs), on the device: the audio never leaves it. The tracker's
// model must be ready before the microphone opens (otherwise the recogniser would lend the browser's own speech
// service while it loads, which sends audio away), so listenFor() waits for it, as Ta'aleem Adventure does.
//
// Each phrase: the Arabic, the transliteration and the meaning are the ones Ustadh Issah approved for My Deen
// (src/lib/deen/duas.mjs) and Ta'aleem Adventure (PHRASES); `src` is the hadith that teaches when to say it in the
// way the game uses it (docs/games-plan.md). A game card shows the phrase, its meaning and that reference only, never
// a retelling of the hadith; the hadith texts wait for approval in scripts/sheikh/candidates/game-powers.json.
import { TrackRecognition, preloadTracker } from '../track-recognition.mjs';
import { tokenize } from '../recite.mjs';
import { u } from '../url.mjs';

export const DHIKR = {
  bismillah: { ar: 'بِسْمِ ٱللَّهِ', tr: 'Bismillah', en: 'In the name of Allah', src: { c: 'bukhari', n: 5376 } },
  subhanallah: { ar: 'سُبْحَانَ ٱللَّهِ', tr: 'SubhanAllah', en: 'Glory be to Allah', src: { c: 'bukhari', n: 2993 } },
  alhamdulillah: { ar: 'ٱلْحَمْدُ لِلَّهِ', tr: 'Alhamdulillah', en: 'All praise is for Allah', src: { c: 'muslim', n: 2734 } },
  allahuakbar: { ar: 'اللَّهُ أَكْبَرُ', tr: 'Allahu Akbar', en: 'Allah is the Greatest', src: { c: 'bukhari', n: 2993 } },
  audhu: { ar: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ', tr: "A'udhu billahi minash-shaytanir-rajim", en: 'I ask Allah to keep me safe from the Shaytan, the rejected one.', src: { c: 'bukhari', n: 3282 } },
  lahawla: { ar: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', tr: 'La hawla wa la quwwata illa billah', en: 'There is no power and no strength except with Allah.', src: { c: 'bukhari', n: 6384 } },
  hasbunallah: { ar: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', tr: "Hasbunallahu wa ni'mal-wakil", en: 'Allah is enough for us, and He is the best One to trust.', src: { c: 'bukhari', n: 4563 } },
};

let ok = null;
// can this device listen? (a microphone, Web Audio, and the tracker's files on the site)
export function canListen() {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia || !(window.AudioContext || window.webkitAudioContext) || typeof AudioWorkletNode === 'undefined') return Promise.resolve(false);
  return (ok ??= fetch(u('models/vocab.json'), { cache: 'force-cache' }).then((r) => r.ok).catch(() => false));
}
// start loading the model early (when a game opens), so the first dhikr is heard at once
export const warmListening = () => canListen().then((x) => { if (x) preloadTracker().catch(() => {}); return x; });

// Listen for one phrase. Resolves 'ok' (every word heard), 'no' (something else was said, or not all of it in time),
// 'unavailable' (no microphone or no model), 'denied' (the microphone was refused) or 'stopped'.
//   onState('loading' | 'listening')
export function listenFor(id, { ms = 6500, onState } = {}) {
  const words = tokenize(DHIKR[id].ar).map((w) => w.plain);
  let rec = null, pos = 0, missed = 0, stopped = false, timer = null, done;
  const finished = new Promise((r) => (done = r));
  const end = (why) => {
    if (stopped) return;
    stopped = true; clearTimeout(timer);
    try { rec?.stop(); } catch {}
    done(why ?? (pos >= words.length && missed === 0 ? 'ok' : 'no'));
  };
  (async () => {
    if (!(await canListen())) return end('unavailable');
    onState?.('loading');
    try { await preloadTracker(); } catch { return end('unavailable'); }
    if (stopped) return;
    rec = new TrackRecognition();
    rec.getExpected = () => words.slice(pos);
    rec.onerror = (e) => { if (e.error === 'not-allowed') end('denied'); };
    rec.onend = () => { if (!stopped) setTimeout(() => { try { if (!stopped) rec.start(); } catch {} }, 250); };
    rec.onresult = (e) => {
      const res = e.results[e.resultIndex];
      if (!res?.track) return;
      for (const t of res.track) {
        if (pos >= words.length) break;
        if ((t.kind ?? 'read') === 'missed') missed++;
        pos++;
      }
      if (pos >= words.length) end();
    };
    try { await rec.start(); } catch { return end('unavailable'); }
    if (stopped) return;
    onState?.('listening');
    timer = setTimeout(() => end(), ms);
  })();
  return { finished, stop: () => end('stopped') };
}
