// The Qur'an in the game is only ever a human reciter, never a computer voice:
//   • a whole ayah: EveryAyah (Sheikh Husary's teaching recitation, al-Muallim, slow and clear for children)
//   • part of an ayah, or one phrase at a time: Quran.com's word-by-word recitation
// "Repeat after me" plays one phrase (up to a stop mark) and then leaves a quiet turn for the child to say it.
const pad = (n) => String(n).padStart(3, '0');
export const ayahUrl = (s, a, reciter = 'Husary_Muallim_128kbps') => `https://everyayah.com/data/${reciter}/${pad(s)}${pad(a)}.mp3`;
export const wordUrl = (s, a, w) => `https://audio.qurancdn.com/wbw/${pad(s)}_${pad(a)}_${pad(w)}.mp3`;
// words from..to (1-based, as Quran.com counts them: real words only, not the stop marks)
export const wordUrls = (s, a, from, to) => Array.from({ length: to - from + 1 }, (_, i) => wordUrl(s, a, from + i));

// The phrases of an ayah: word indexes (0-based in the shown words) split after each stop mark (ۖ ۗ ۚ …),
// and long stretches without a mark split again so no phrase is too long to repeat.
export function phrasesOf(words, max = 6) {
  const marked = []; let cur = [];
  words.forEach((w, i) => {
    cur.push(i);
    if (/[ۖ-ۜ]/.test(w.display ?? w)) { marked.push(cur); cur = []; }
  });
  if (cur.length) marked.push(cur);
  // a long phrase is cut into even parts (7 words → 4 + 3, never 6 + 1)
  return marked.flatMap((p) => {
    const n = Math.ceil(p.length / max), size = Math.ceil(p.length / n);
    return Array.from({ length: n }, (_, k) => p.slice(k * size, (k + 1) * size));
  });
}

// Play URLs one after another. onIndex(k) as each starts. Returns { done: Promise<number seconds>, stop() }.
export function playSeq(urls, { onIndex } = {}) {
  let stopped = false, a = null, t0 = performance.now();
  const done = (async () => {
    for (let k = 0; k < urls.length && !stopped; k++) {
      onIndex?.(k);
      a = new Audio(urls[k]);
      await new Promise((res) => {
        const fin = () => res();
        a.onended = fin; a.onerror = fin;
        a.play().catch(fin);
        setTimeout(fin, 15000);
      });
    }
    return (performance.now() - t0) / 1000;
  })();
  return { done, stop() { stopped = true; try { a?.pause(); } catch {} } };
}

// Repeat after me: for each phrase, the reciter says it (its words light up), then the child's turn
// (a quiet pause a little longer than the phrase took). onPhrase(k, 'listen'|'turn'|'done').
export function repeatAfterMe({ s, a, first = 1, phrases, onWord, onPhrase }) {
  let stopped = false, cur = null, timer = null;
  const done = (async () => {
    for (let k = 0; k < phrases.length && !stopped; k++) {
      onPhrase?.(k, 'listen');
      const ids = phrases[k];
      cur = playSeq(ids.map((i) => wordUrl(s, a, first + i)), { onIndex: (j) => onWord?.(ids[j]) });
      const took = await cur.done;
      if (stopped) break;
      onPhrase?.(k, 'turn');
      await new Promise((res) => { timer = setTimeout(res, Math.min(9000, took * 1000 * 1.3 + 1200)); });
    }
    onPhrase?.(-1, 'done');
  })();
  return { done, stop() { stopped = true; cur?.stop(); clearTimeout(timer); } };
}
