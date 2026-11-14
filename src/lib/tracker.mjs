// Qāf tracker: follows a reader through a known text using the Qāf model's letter probabilities.
//
// Every update it re-aligns the most recent few seconds of audio frames against a window of the text around
// where the reader is (a semi-global CTC alignment: the reader may be anywhere in the window). Because the whole
// recent stretch is re-aligned each time, an early mistake by the tracker is corrected a moment later instead
// of sending it off course. Things a real reader does are allowed for:
//   pauses and held vowels (blank frames), starting further on, going back to repeat words, and saying
//   something that is not in the text at all (a "filler" path: coughs, a wrong word, the teacher talking).
// Pure JavaScript, no imports: used by the app (in a Web Worker) and by the Node test harness.
//
//   const t = createTracker({ letters, blank, words: ['بسم', 'الله', …] })   plain words of the whole passage
//   t.push(logprobs, n)       n frames (25 a second), each C = letters.length + 1 values
//   t.update() → { pos, frac, word, events, back, wrong }
//      pos     the next word not yet read (everything before it is committed)
//      word    the word the reader is in right now, frac how far into it (0–1): the live cursor. It can be behind
//              pos (back: true) when the reader goes back to repeat words; nothing is committed while they do
//      events  [{ index, kind: 'read' | 'weak' | 'unclear' | 'missed', score }] words committed by this update
//              (missed: left out, or something else said in its place; unclear: run into a neighbour)
//      wrong   true once when the reader has been saying something that is not the text for a few words
//
// Words only move the page on when they were really said: each letter of the word is looked for at its clearest
// moment, and the word the reader lands on must score well. A wrong word or a wrong ayah therefore never turns
// the page green; the words stay waiting until the reader recites them (or marked missed if they go on past).
//   t.moveTo(i)               the page jumped (a new start point): follow from word i

export function createTracker({ letters, blank, words = [], opts = {} }) {
  const o = {
    history: 100,        // frames re-aligned each time (4 s)
    ahead: 25,           // words of text after the committed position that the reader may be in
    behind: 30,          // words before it: a reader going back to repeat words or a whole ayah
    filler: -2.2,        // per frame cost of "not in the text" (vs. the best letter)
    toFiller: -4, fromFiller: -2,
    jump: -0.6,          // per word, cost of starting away from the committed position
    weak: -1.6,          // average letter margin below which a word counts as weakly read
    bad: -3.2,           // ... and below which it was not really said (another word in its place)
    wrongAfter: 12,      // letters heard that are not the text (about two words) before the reader is told
    endBlanks: 5,        // blank frames after a word's last letter that end it (200 ms): the end of an ayah
    ...opts,
  };
  const C = letters.length + 1, space = letters.indexOf(' ');
  const idx = new Map(letters.map((c, i) => [c, i]));
  const toIds = (w) => { const a = [...w].map((c) => idx.get(c)).filter((x) => x !== undefined && x !== space); return a.length ? a : [idx.get('ا')]; };
  // What is written is not always what is said. opt: letters that may go unheard — the alif of ال when joined to
  // the word before (also after و ف ب ك), and its ل before a sun letter ("ar-raḥmān", "wan-nās"); the path may
  // pass them by, and they are not needed for a word to count as said. alt: a final ه (the page writes ة as ه) is
  // also accepted as ت, as it is said when joined to the next word ("al-jinnati wa…").
  const SUN = new Set([...'تثدذرزسشصضطظلن'].map((c) => idx.get(c)));
  const A = idx.get('ا'), L = idx.get('ل'), H = idx.get('ه'), T = idx.get('ت'), PRE = new Set([...'وفبك'].map((c) => idx.get(c)));
  const metaOf = (a) => {
    const opt = new Set(), alt = new Map();
    const k = a[0] === A && a[1] === L ? 0 : PRE.has(a[0]) && a[1] === A && a[2] === L ? 1 : -1;
    if (k >= 0 && a.length > k + 2) { opt.add(k); if (SUN.has(a[k + 2])) opt.add(k + 1); }
    if (a.length > 1 && a[a.length - 1] === H && T !== undefined) alt.set(a.length - 1, T);
    return { opt, alt };
  };
  words = words.slice();
  let ids = words.map(toIds), meta = ids.map(metaOf);
  const need = (w) => Math.max(1, ids[w].length - meta[w].opt.size);
  const cover = (w, r) => Math.min(1, [...r.letters].filter((li) => !meta[w].opt.has(li)).length / need(w));

  const frames = [];       // rolling log-prob frames (Float32Array each)
  let dropped = 0;         // frames already removed from the front (frames[i] is absolute frame dropped + i)
  let anchor = 0;          // absolute frame just before the last committed word ended: the look-back starts here
  let pos = 0;             // committed: words before pos are done
  let started = false;     // a jump forward is only trusted when the reader first begins
  let live = { word: 0, frac: 0 };
  let offTold = false, wrongNow = false;   // the reader is saying something that is not the text
  let endSeen = -1;        // absolute frame of the reader's voice in the passage's last word (see the end of update)

  function push(lp, n) { write(dropped + frames.length, lp, n); }
  // write n frames starting at absolute frame `at`: frames already there are replaced (a later look at the audio,
  // having heard more after them, judges them better), new ones are added
  function write(at, lp, n) {
    for (let t = 0; t < n; t++) {
      const k = at + t - dropped;
      if (k < 0) continue;
      const row = lp.slice(t * C, (t + 1) * C);
      if (k < frames.length) frames[k] = row; else { while (frames.length < k) frames.push(row); frames.push(row); }
    }
    const keep = o.history * 3;
    if (frames.length > keep) { const k = frames.length - keep; frames.splice(0, k); dropped += k; }
  }
  function moveTo(i) { endSeen = -1; pos = Math.max(0, Math.min(words.length, i)); dropped += frames.length; frames.length = 0; anchor = dropped; started = false; live = { word: pos, frac: 0 }; }

  // emissions of one frame: blank (blank or space) and the best free choice
  function emis(f) {
    const b = f[blank], s = space >= 0 ? f[space] : -Infinity;
    const eB = Math.max(b, s) + Math.log1p(Math.exp(-Math.abs(b - s)));
    let free = eB; for (let c = 0; c < C - 1; c++) if (c !== space && f[c] > free) free = f[c];
    return { eB, free };
  }

  function update() {
    const events = [];
    if (!frames.length || pos >= words.length) return { pos, word: live.word, frac: live.frac, events };
    const w0 = Math.max(0, pos - o.behind), w1 = Math.min(words.length, pos + o.ahead);
    // states: 0 = filler; then per word: [letter, blank] × letters (blank after each letter)
    const tok = [0], wOf = [-1], liOf = [-1], nOf = [0], altS = [-1], optS = [false], entryS = [false], first = [], last = [];
    for (let w = w0; w < w1; w++) {
      first[w] = tok.length;
      let allOpt = true;   // every letter so far may go unheard: the word can be entered here
      ids[w].forEach((id, li) => {
        tok.push(id, -1); wOf.push(w, w); liOf.push(li, li); nOf.push(ids[w].length, ids[w].length);
        altS.push(meta[w].alt.get(li) ?? -1, -1); optS.push(meta[w].opt.has(li), false); entryS.push(allOpt, false);
        allOpt = allOpt && meta[w].opt.has(li);
      });
      last[w] = tok.length - 2;
    }
    const em = (f, s) => (altS[s] >= 0 ? Math.max(f[tok[s]], f[altS[s]]) : f[tok[s]]);
    const S = tok.length;
    const base = Math.max(frames.length - o.history, anchor - dropped, 0), F = frames.length - base;
    if (F < 3) return { pos, word: live.word, frac: live.frac, events };
    let d = new Float64Array(S).fill(-Infinity), nd = new Float64Array(S);
    const bp = new Int32Array(F * S);
    // start: anywhere in the window (a word's first letter), the filler, or the blank before the committed word
    const startCost = (w) => (w >= pos ? (w - pos) * (started ? 4 : 1) : (pos - w)) * o.jump;
    const reenter = (w) => o.fromFiller + (w >= pos ? Math.max(0, w - pos - 1) * 1.5 : (pos - w) * 0.5) * o.jump * 2;
    const e0 = emis(frames[base]);
    d[0] = o.toFiller + e0.free + o.filler;
    for (let w = w0; w < w1; w++) for (let s = first[w]; s <= last[w] && entryS[s]; s += 2) d[s] = startCost(w) + em(frames[base], s) - e0.free;
    if (pos > w0) { const s = last[pos - 1] + 1; d[s] = Math.max(d[s], e0.eB - e0.free); }
    for (let t = 1; t < F; t++) {
      const f = frames[base + t], { eB, free } = emis(f);
      for (let s = 0; s < S; s++) {
        let best = d[s], arg = s;
        if (s === 0) {                                   // filler: from itself, or out of any state
          for (let r = 1; r < S; r++) if (d[r] + o.toFiller > best) { best = d[r] + o.toFiller; arg = r; }
          nd[0] = best + free + o.filler - free; bp[t * S] = arg; continue;
        }
        if (s >= 2 && d[s - 1] > best) { best = d[s - 1]; arg = s - 1; }                       // advance
        if (tok[s] >= 0 && s >= 3 && tok[s - 2] >= 0 && tok[s - 2] !== tok[s] && d[s - 2] > best) { best = d[s - 2]; arg = s - 2; }  // skip a blank
        // pass by letters that may go unheard: from the letter (or its blank) before them
        if (tok[s] >= 0 && liOf[s] > 0) for (let j = s - 2; j >= 3 && optS[j] && liOf[j] > 0; j -= 2) {
          if (d[j - 2] > best) { best = d[j - 2]; arg = j - 2; }
          if (d[j - 1] > best) { best = d[j - 1]; arg = j - 1; }
        }
        if (tok[s] >= 0 && entryS[s]) {
          const w = wOf[s];
          if (w > w0) {                                  // from the end of the previous word (letter or its blank)
            const a = last[w - 1];
            if (d[a] > best) { best = d[a]; arg = a; }
            if (d[a + 1] > best) { best = d[a + 1]; arg = a + 1; }
          }
          const v = d[0] + reenter(w);
          if (v > best) { best = v; arg = 0; }
        }
        nd[s] = best + (tok[s] >= 0 ? em(f, s) : eB) - free; bp[t * S + s] = arg;
      }
      [d, nd] = [nd, d];
    }
    // where is the reader now: the best final state
    let end = 0; for (let s = 1; s < S; s++) if (d[s] > d[end]) end = s;
    // trace back: which frames went to which word, and how well
    const path = new Int32Array(F); path[F - 1] = end;
    for (let t = F - 1; t > 0; t--) path[t - 1] = bp[t * S + path[t]];
    const seen = new Map();    // word → { score, frames, letters: Set, lastT }
    const fillerBefore = new Map();   // word → filler frames just before the path reached it
    let blanksAtEnd = 0, fill = 0;
    for (let t = 0; t < F; t++) {
      const s = path[t]; if (s === 0) { fill++; continue; }
      if (fill) { const w = wOf[s]; fillerBefore.set(w, (fillerBefore.get(w) ?? 0) + fill); fill = 0; }
      const w = wOf[s]; let r = seen.get(w); if (!r) seen.set(w, (r = { score: 0, n: 0, letters: new Set(), lb: new Map(), firstT: t, lastT: t }));
      const f = frames[base + t], { eB, free } = emis(f);
      if (tok[s] >= 0) { r.score += em(f, s) - free; r.n++; r.letters.add(liOf[s]); }
      // each letter's clearest moment anywhere while the reader was in this word (CTC may fold a letter into a
      // neighbour's frames, so it is looked for across the whole word, not only on its own frames)
      ids[w].forEach((id, li) => { const al = meta[w].alt.get(li); const m = (al === undefined ? f[id] : Math.max(f[id], f[al])) - free; if (m > (r.lb.get(li) ?? -Infinity)) r.lb.set(li, m); });
      r.lastT = t;
    }
    for (let t = F - 1; t >= 0 && path[t] !== 0 && tok[path[t]] < 0; t--) blanksAtEnd++;

    // how well a word was said: each of its letters at its clearest moment (0 = the model's first choice), averaged
    // (the weakest letter is left out of longer words: a long vowel or a hamza is often folded into its neighbour)
    const lsc = (w) => {
      const r = seen.get(w); if (!r?.n) return -10;
      const v = ids[w].map((_, i) => i).filter((i) => !meta[w].opt.has(i)).map((i) => Math.max(-8, r.lb.get(i) ?? -8)).sort((a, b) => a - b);
      if (v.length >= 3) v.shift();
      return v.reduce((a, b) => a + b, 0) / v.length;
    };
    const said = (w) => { const r = seen.get(w); return r && r.n >= 2 && cover(w, r) >= 0.6 && lsc(w) >= o.weak; };
    // The last word of the passage has no next word to confirm it, and some of its written letters are never heard
    // (the ل of ال before a sun letter: "aḍ-ḍāllīn"; a long madd held past the look-back). So once the reader has
    // paused in it, it is finished when fewer of its letters were heard, as long as those were heard well.
    const isLast = (w) => w === words.length - 1;
    const saidLast = (w) => { const r = seen.get(w); return isLast(w) && r && r.n >= 2 && cover(w, r) >= 0.4 && lsc(w) >= o.weak; };
    // letters of a word the path did not go through, looked for between the words around it (and a little into them)
    const gapScore = (w) => {
      // (frames are counted from the look-back start; with no word before it on the path, it may have been said
      // just before the look-back began, run into the word committed last, so a second before that is searched too)
      let a = -25, b = F - 1;
      for (let k = w - 1; k >= pos; k--) { const r = seen.get(k); if (r?.n) { a = r.lastT - 3; break; } }
      for (let k = w + 1; k < w1; k++) { const r = seen.get(k); if (r?.n) { b = Math.min(F - 1, r.firstT + 3); break; } }
      let best = ids[w].map(() => -8);
      for (let t = Math.max(a, -base); t <= b; t++) { const f = frames[base + t], { free } = emis(f); ids[w].forEach((id, li) => { const al = meta[w].alt.get(li); best[li] = Math.max(best[li], (al === undefined ? f[id] : Math.max(f[id], f[al])) - free); }); }
      best = best.filter((_, li) => !meta[w].opt.has(li));
      best.sort((x, y) => x - y); if (best.length >= 3) best.shift();
      return best.reduce((x, y) => x + y, 0) / best.length;
    };
    const sNow = end, wNow = sNow === 0 ? live.word : wOf[sNow];
    const n = nOf[sNow] || 1;
    let frac = sNow === 0 ? live.frac : (liOf[sNow] + (tok[sNow] >= 0 ? 0.5 : 1)) / n;
    // finished a word: at its blank after the last letter for a moment, or already in a later word
    let doneUpTo = wNow - 1;
    if (sNow > 0 && tok[sNow] < 0 && liOf[sNow] === n - 1 && blanksAtEnd >= o.endBlanks) doneUpTo = wNow;
    // a longer pause inside the last word's blank, with all its letters heard: the reader has finished it too
    else if (sNow > 0 && tok[sNow] < 0 && blanksAtEnd >= o.endBlanks * 3 && said(wNow)) doneUpTo = wNow;
    // the last word of the passage, then a pause (0.6 s): finished (see saidLast)
    else if (sNow > 0 && tok[sNow] < 0 && blanksAtEnd >= o.endBlanks * 3 && saidLast(wNow)) doneUpTo = wNow;
    // The end of the passage: the reader is in its last word, has been saying it (voiced frames on it), and has
    // stopped (0.6 s). Nothing else is coming to confirm it, so the passage is finished; words the model could not
    // follow letter by letter (silent letters it does not hear, a long madd) are marked unclear, never green.
    // (remembered between looks: once silence follows, the alignment may change its mind about the last words)
    let voiced = 0, lastVoiced = -1;
    for (let t = 0; t < F; t++) if (path[t] && isLast(wOf[path[t]]) && frames[base + t][blank] < -0.7) { voiced++; lastVoiced = t; }
    if (voiced >= 2) endSeen = Math.max(endSeen, dropped + base + lastVoiced);   // (the model's letters are short peaks: two frames of voice)
    let quiet = 0; for (let t = F - 1; t >= 0 && frames[base + t][blank] >= -0.7; t--) quiet++;
    const endOfPassage = endSeen >= 0 && pos < words.length && quiet >= o.endBlanks * 3 && dropped + base + F - quiet <= endSeen + 3;
    if (endOfPassage) doneUpTo = words.length - 1;
    if (sNow > 0 && wNow <= pos + 3) live = frac >= 1 && doneUpTo === wNow ? { word: wNow + 1, frac: 0 } : { word: wNow, frac: Math.min(1, frac) };
    // the reader may be behind the committed words (repeating): the cursor follows them back

    // commit, never backwards. Only words the reader really said move the page on: the word the path ends on
    // must be clearly heard (its letters, with a fair score). Words the path ran over badly, or jumped over while
    // the reader said something else, are mistakes; nothing is committed while the reader is off the text.
    let target = doneUpTo;
    while (!endOfPassage && target >= pos && !said(target) && !(target === doneUpTo && saidLast(target))) target--;   // the last word that was really said
    if (target >= pos) {
      // landing beyond the next word: the two words it lands on must both be said, one after the other
      const solid = target === pos || (said(target - 1) && target - 1 >= pos) || (target === pos + 1 && seen.get(pos)?.n) || endOfPassage;
      if (solid) for (let w = pos; w <= target; w++) {
        const r = seen.get(w);
        if (!r || !r.n) {
          // not on the path: were its letters heard around where it should be (run into its neighbours, as in
          // "bismillāh"), or was it left out / something else said in its place?
          const g = gapScore(w);
          // at the end of the passage the reader went on to its last word: a word not followed is unclear, not missed
          events.push({ index: w, kind: g >= o.weak || endOfPassage ? 'unclear' : 'missed', score: g });
        } else {
          const sc = lsc(w), cov = cover(w, r);
          const low = isLast(w) ? 0.25 : 0.34, part = isLast(w) ? 0.4 : 0.5;   // the last word: as in saidLast
          let kind = sc < o.bad || cov < low ? 'missed' : sc < o.weak || cov < part ? 'weak' : 'read';
          if (endOfPassage && kind !== 'read' && !said(w) && !saidLast(w)) kind = 'unclear';   // not followed letter by letter: worth checking
          events.push({ index: w, kind, score: sc });
        }
        pos = w + 1;
      }
      if (pos > target) {
        started = true;
        const r = seen.get(target);
        if (r) anchor = dropped + base + Math.max(0, r.lastT - 2);
      }
    }
    // the reader has been saying something that is not the text for a while (not silence: silence is blank)
    // speech since the last committed word that is not the text: voiced frames (not blank: a pause to think is
    // never a mistake) other than those of words the reader really said, including words repeated behind
    let off = 0;
    for (let t = 0; t < F; t++) {
      const s = path[t];
      if (s !== 0 && said(wOf[s])) continue;
      if (frames[base + t][blank] < -0.7) off++;
    }
    if (events.length) offTold = false;
    wrongNow = off >= o.wrongAfter && !offTold;
    if (wrongNow) offTold = true;
    return { pos, word: live.word, frac: live.frac, events, inFiller: sNow === 0, back: live.word < pos, wrong: wrongNow };
  }

  // The page supplies the words from its own position on. extend(): same place, more words (or corrected ones)
  // from the committed position; advance(k): the page moved on k words by itself (the Sheikh said them, a hint).
  function extend(list) { const n = words.length; words = words.slice(0, pos).concat(list); ids = words.map(toIds); meta = ids.map(metaOf); if (words.length !== n) endSeen = -1; }
  function advance(k) { endSeen = -1; pos = Math.min(words.length, pos + k); live = { word: pos, frac: 0 }; const a = dropped + frames.length - 2; if (a > anchor) anchor = a; }
  function reset(list) { endSeen = -1; words = list.slice(); ids = words.map(toIds); meta = ids.map(metaOf); pos = 0; dropped += frames.length; frames.length = 0; anchor = dropped; started = false; live = { word: 0, frac: 0 }; }

  return { push, write, update, moveTo, extend, advance, reset, get pos() { return pos; }, get words() { return words; } };
}
