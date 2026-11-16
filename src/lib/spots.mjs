// The exact words a student stumbled on (engine.mjs keeps them as "spots": { s, a, wi, word, kind }).
// Shown in the report as homework and by the Sheikh at the next visit. Each word plays from the reciter
// (Quran.com's word-by-word recitation, a human voice), so the student hears it said correctly and repeats it.
import { wordAudioUrl } from './client.mjs';

let playing = null;
export function renderSpots(host, spots = []) {
  host.replaceChildren();
  for (const sp of spots) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'spot';
    b.title = `${sp.s}:${sp.a}: tap to hear it from the reciter, then say it after him`;
    const ar = document.createElement('span'); ar.lang = 'ar'; ar.dir = 'rtl'; ar.textContent = sp.word;
    const ref = document.createElement('small'); ref.textContent = `${sp.s}:${sp.a}`;
    b.append(ar, ref);
    b.onclick = () => {
      try { playing?.pause(); } catch {}
      playing = new Audio(wordAudioUrl(sp.s, sp.a, sp.wi));
      b.classList.add('on');
      const off = () => b.classList.remove('on');
      playing.onended = off; playing.onerror = off;
      playing.play().catch(off);
    };
    host.append(b);
  }
  host.hidden = !spots.length;
}
