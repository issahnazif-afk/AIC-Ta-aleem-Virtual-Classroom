// The Sheikh's recitation engine for the classroom, taken from the Hifz test page of
// Qa-af Wal Quran-ul-Majeed (src/pages/test/index.astro) and extended for two kinds of session:
//
//   hifz     The Sheikh recites the opening of a random ayah; the words are hidden and appear as the
//            student recites them from memory, until the Sheikh stops them. Several questions.
//   reading  Mujawwadah: the mushaf page is shown; the student reads from the start of the range and
//            each word turns green as it is read correctly. One pass through the range.
//
// The Sheikh listens in one of three ways (listen, for "Learn Qur'an with the Sheikh"):
//   free     as above: he follows every word, stops the reader at a mistake once and helps when they stop
//   correct  as a teacher in a halaqah: at each mistake he stops them and holds them at that word: "Intabih", then he
//            says the word and has them say it, and only then gives it and lets them go on
//   teach    page by page, as a teacher teaches the Qur'an (talqin): he recites each ayah and they repeat it after him,
//            stopped and corrected as in "correct" (an ayah with mistakes is recited again, up to three times); then
//            they read the whole page to him, and with 4 or more mistakes he teaches the ayahs that still had them and
//            hears the page again, until it is right (at most three rounds a page, then it is kept for next time).
//            readFirst: they read the page first, and he teaches it only if that reading has 4 or more mistakes.
// All drawing outside the mushaf page is done by the page through the `ui` callbacks.
import { getJson, pad, audioUrl, wordAudioUrl } from './client.mjs';
import { tokenize, normalize, matchAt, THRESHOLDS } from './recite.mjs';
import { createFollower } from './follow.mjs';
import { tuneRecognition, setExpected, phrasesRefused } from './speech.mjs';
import { buildPaper, fitPaper } from './mushaf.mjs';
import { LEVELS, newTally } from './session.mjs';
import { phrase, praiseFor, speak, stopVoice } from './phrases.mjs';
import { createTajweedEar } from './tajweed-ear/ear.mjs';
import { remarkText } from './tajweed-ear/rules.mjs';

const AR = '٠١٢٣٤٥٦٧٨٩';
const arNum = (n) => String(n).replace(/\d/g, (d) => AR[d]);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const STANDARD_WORDS = 60;   // roughly half a mushaf page

// tajweed: null (the words only), or { checks: Set of the rules chosen, young: Level 3 wording }
// young: Levels 1 and 2 (gentle correction); otherwise the Sheikh corrects as in a halaqah (see correct())
export const TEACH_AT = 4;          // mistakes on a page that make the Sheikh teach it
const TEACH_ROUNDS = 3, AYAH_TRIES = 3;
export function createEngine({ stage, SR, level = 'intermediate', reciter, gender = '', speakInstructions = true, ui, tajweed = null, young = false, listen: listenMode = 'free', teachReciter = 'Husary_Muallim_128kbps', readFirst = false }) {
  const L = LEVELS[level] ?? LEVELS.intermediate;
  const threshold = () => THRESHOLDS[L.checking] ?? THRESHOLDS.normal;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let mode = 'hifz';
  let byHeart = false;         // reading flow, words hidden: "Follow my recitation"
  const shown = () => mode === 'reading' && !byHeart;   // the words are on the page before they are read
  let meta = null;
  let scopeAyahs = [];
  let questions = [];
  let qi = -1;
  let phase = 'idle';    // idle | sheikh | answer | paused | stopped | done
  let pausedFrom = null;
  let items = [], flat = [], pos = 0, shownPage = 0, wrongStreak = 0;
  let q = null;
  const tally = newTally();
  const ayahMarks = new Map();   // "s:a" → { label, marks: Set }
  let inReplay = false;
  let startedAt = 0;
  const strict = () => listenMode === 'correct' || (listenMode === 'teach' && !!q?.strict);
  const pagesDone = [];   // teach: { page, first, rounds, passed }

  const markAyah = (w, kind) => {
    const it = w.item;
    if (!it.a) return;
    if (!ayahMarks.has(it.key)) ayahMarks.set(it.key, { s: it.s, a: it.a, label: it.label, marks: new Set() });
    if (kind) ayahMarks.get(it.key).marks.add(kind);
  };
  const note = (kind, w, extra = {}) => ui.note?.({ kind, word: w?.display ?? '', key: w ? `${w.item.s}:${w.item.a}` : '', label: w?.item.label ?? '', ayah: w?.item.a ?? 0, ...extra });

  // ── building questions ──────────────────────────────────────
  function makeItem(s, sura, ay, isBism) {
    const it = isBism
      ? { s, a: 0, key: `${s}:0`, label: `${sura.en}, Bismillah`, ar: sura.bismillah, page: ay.page }
      : { s, a: ay.a, key: `${s}:${ay.a}`, label: `${sura.en} ${s}:${ay.a}`, ar: ay.ar, page: ay.page };
    it.words = tokenize(it.ar, it.a ? it.key : null);
    it.words.forEach((w, i) => Object.assign(w, { item: it, wi: i, state: shown() ? 'todo' : 'hidden', page: it.page, mistake: false }));
    return it;
  }
  function buildQuestion(qn) {
    const out = [];
    let ayahs = 0, words = 0;
    for (let k = qn.start; k < scopeAyahs.length && k <= qn.end; k++) {
      const { s, sura, ay } = scopeAyahs[k];
      if (k > qn.start && ay.a === 1 && sura.bismillah && s !== 1) out.push(makeItem(s, sura, ay, true));
      if (mode === 'reading' && !qn.noBism && k === qn.start && ay.a === 1 && sura.bismillah && s !== 1) out.push(makeItem(s, sura, ay, true));
      const it = makeItem(s, sura, ay, false);
      out.push(it);
      ayahs++; words += it.words.length;
      if (mode === 'hifz' && qn.span && (ayahs >= qn.span || (qn.standard && words >= STANDARD_WORDS))) break;
    }
    return out;
  }

  async function loadScope(range) {
    meta ??= await getJson('meta.json');
    const out = [];
    let { s1, s2, a1 = 1, a2 = null } = range;
    if (s2 < s1) [s1, s2] = [s2, s1];
    for (let s = s1; s <= s2; s++) {
      const sura = await getJson(`surah/${pad(s)}.json`);
      for (const ay of sura.ayahs) {
        if (s === s1 && ay.a < a1) continue;
        if (s === s2 && a2 && ay.a > a2) continue;
        out.push({ s, sura, ay });
      }
    }
    return out;
  }

  // ── starting ────────────────────────────────────────────────
  async function startHifz(range, { questionsN = null, span = null } = {}) {
    mode = 'hifz'; byHeart = false;
    scopeAyahs = await loadScope(range);
    if (!scopeAyahs.length) throw new Error('There are no ayahs in that range.');
    const pages = new Set(scopeAyahs.map((x) => x.ay.page)).size;
    let n = questionsN ? Math.min(20, Math.max(1, questionsN)) : Math.min(10, Math.max(1, Math.round(pages / 2)));
    const sp = span || 5;
    n = Math.max(1, Math.min(n, Math.floor(scopeAyahs.length / sp) || 1));
    const starts = [];
    for (let k = 0; k < n; k++) {
      const lo = Math.floor((k * scopeAyahs.length) / n);
      const hi = Math.max(lo, Math.floor(((k + 1) * scopeAyahs.length) / n) - 1);
      const last = Math.max(lo, hi - sp + 1);
      starts.push(lo + Math.floor(Math.random() * (last - lo + 1)));
    }
    questions = starts.map((start, k) => ({ start, end: Math.max(start, Math.floor(((k + 1) * scopeAyahs.length) / n) - 1), span: sp, standard: !span }));
    for (let k = questions.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [questions[k], questions[j]] = [questions[j], questions[k]]; }
    qi = -1;
    startedAt = Date.now();
    nextQuestion();
    return { questions: questions.length };
  }

  async function startFollow(range) { const r = await startReading(range, true); return r; }
  async function startReading(range, hide = false) {
    mode = 'reading'; byHeart = hide;
    scopeAyahs = await loadScope(range);
    if (!scopeAyahs.length) throw new Error('There are no ayahs in that range.');
    questions = [{ start: 0, end: scopeAyahs.length - 1 }];
    if (listenMode === 'teach' && !hide) {   // one read-through per mushaf page
      questions = [];
      const pages = [];
      scopeAyahs.forEach((x, k) => { const last = pages[pages.length - 1]; if (last && last.page === x.ay.page) last.end = k; else pages.push({ page: x.ay.page, start: k, end: k }); });
      for (const pg of pages) {
        if (readFirst) { questions.push({ kind: 'page', ...pg, round: 0 }); continue; }
        for (let k = pg.start; k <= pg.end; k++) questions.push({ kind: 'ayah', page: pg.page, start: k, end: k, strict: true, noBism: true, tries: 1, round: 1, intro: k === pg.start });
        questions.push({ kind: 'page', ...pg, round: 1, strict: true });
      }
    }
    qi = -1;
    startedAt = Date.now();
    nextQuestion();
    return { questions: questions.length };
  }

  async function nextQuestion() {
    stopListening();
    clearSilence();
    qi++;
    if (qi >= questions.length) return finish();
    q = questions[qi];
    q.items = buildQuestion(q);
    q.stats = { words: 0, first: 0, prompts: 0, help: 0, skipped: false };
    items = q.items; flat = items.flatMap((it) => it.words);
    q.flat = flat;
    pos = 0; wrongStreak = 0; queue.length = 0; follower.clearBack();
    ui.progress?.({ qi, n: questions.length, mode: byHeart ? 'follow' : mode, step: q.kind ? { kind: q.kind, page: q.page, round: q.round ?? 0, tries: q.tries ?? 0, label: items.find((it) => it.a)?.label ?? '' } : null });
    await renderPage(flat[0].page, qi > 0);
    if (mode === 'hifz') await sheikhRecites();
    else if (q.kind === 'ayah') await sheikhTeaches();
    else beginReading();
  }

  function beginReading() {
    phase = 'answer';
    const first = items.find((it) => it.a) ?? items[0];
    if (q?.kind === 'page' && q.round > 0) {
      say('listening', 'read', `Now read the whole page to me, from ${first.label}. I will stop you at any mistake.`);
      status('Read the whole page again. The Sheikh stops you at each mistake.');
    } else if (q?.kind === 'page') {
      say('listening', 'read', `Read this page to me, from ${first.label}. If there are ${TEACH_AT} or more mistakes, we will learn it together.`);
      status('Read the whole page. The Sheikh is listening.');
    } else if (listenMode === 'correct') {
      say('listening', 'read', `Read from ${first.label}. I will stop you at each mistake, as in the halaqah.`);
      status('Read aloud. At a mistake the Sheikh stops you: try again, then say the word after him.');
    } else if (byHeart) {
      say('listening', 'read', `Recite from memory, from ${first.label}. The Sheikh is following you.`);
      status('Recite from memory. Each word appears as you say it. If you stop, the Sheikh gives you the next word.');
    } else {
      say('listening', 'read', `Read from ${first.label}. The Sheikh is listening.`);
      status('Read aloud from the highlighted word. Each word changes colour when it is read correctly.');
    }
    updateCurrent();
    startListening();
    armSilence();
  }

  // ── the Sheikh ──────────────────────────────────────────────
  function sheikh(state, ar, en) { ui.sheikh?.(state, ar, en); }
  function status(text, kind = '') { ui.status?.(text, kind); }

  // the Sheikh's words, in the student's gender (see phrases.mjs)
  const P = (key) => phrase(key, gender);
  const say = (state, key, en) => { const p = P(key); sheikh(state, p.ar, en ?? p.en); return p; };
  const speakP = (p) => speak(p, { enabled: speakInstructions });
  function openingWords(it) {
    const n = it.words.length;
    if (n <= 2) return n;
    return Math.min(6, n - 1, Math.max(1, Math.ceil(n / 3)));
  }
  function openingShare(it, k) {
    const len = (w) => w.plain.length + 1;
    const part = it.words.slice(0, k).reduce((t, w) => t + len(w), 0);
    return part / it.words.reduce((t, w) => t + len(w), 0);
  }

  const voice = new Audio();
  async function sheikhRecites(again) {
    phase = 'sheikh';
    stopListening();
    const first = items[0];
    if (!again) {
      const p = say('speaking', 'recitefrom');
      status('The Sheikh is about to recite an ayah. Listen, then start from that same ayah.');
      await speakP(p);
    }
    if (phase === 'done' || phase === 'paused') return;
    const k = openingWords(first);
    sheikh('speaking', P('recitefrom').ar + '…', k < first.words.length ? 'Listen to the opening of the ayah.' : 'Listen to the ayah.');
    const ok = await playAudio(audioUrl(reciter, first.s, first.a), k < first.words.length ? openingShare(first, k) : 1);
    if (phase === 'done' || phase === 'paused') return;
    if (!ok) {
      sheikh('listening', first.words.slice(0, k).map((w) => w.display).join(' ') + ' …', 'The recitation could not be played, so here are the opening words.');
      status('The recitation could not be played. Check your connection.', 'bad');
    } else {
      say('listening', 'goahead', 'Go ahead. Recite that ayah from its start and carry on.');
      status('Your turn. Start from the beginning of the ayah you just heard.');
    }
    phase = 'answer';
    updateCurrent();
    startListening();
    armSilence();
  }

  // teach: the Sheikh recites the ayah (the teaching recitation), then the student repeats it after him
  async function sheikhTeaches() {
    phase = 'sheikh';
    stopListening();
    const it = items.find((x) => x.a) ?? items[0];
    const src = audioUrl(teachReciter, it.s, it.a);
    const mapped = voiceMap(src);   // fetched and mapped while he introduces it
    const nx = questions[qi + 1], na = nx?.kind === 'ayah' ? scopeAyahs[nx.start] : null;
    if (na?.ay?.a) voiceMap(audioUrl(teachReciter, na.s, na.ay.a));   // and the next ayah, ready in turn
    // he says "Istami'" only to begin the teaching, and before an ayah he recites again to correct it;
    // otherwise he goes straight on to the next ayah, as a teacher does once the lesson is under way
    const fixing = q.tries > 1 || q.fix;
    if (fixing || q.intro) {
      const p = say('speaking', 'listen', fixing ? `Listen again to ${it.label}, carefully, then repeat it after me.` : `Let us learn page ${q.page} together, ayah by ayah. Listen to ${it.label}, then repeat it after me.`);
      status(fixing ? 'Listen again carefully, then repeat it.' : 'The Sheikh recites the ayah. Listen, then repeat it after him.');
      await speakP(p);
      if (phase !== 'sheikh' || questions[qi] !== q) return;
    } else status('The Sheikh recites the next ayah. Listen, then repeat it after him.');
    items.forEach((x) => x.words.forEach((w) => w.el?.classList.add('teaching')));
    sheikh('speaking', it.words.map((w) => w.display).join(' '), `The Sheikh recites ${it.label}.`);
    const map = await Promise.race([mapped, new Promise((r) => setTimeout(() => r(null), 2500))]);
    if (phase !== 'sheikh' || questions[qi] !== q) return;
    let ok = await playAudio(map?.url ?? src, 1, map);
    if (!ok && phase === 'sheikh' && teachReciter !== reciter) ok = await playAudio(audioUrl(reciter, it.s, it.a));
    items.forEach((x) => x.words.forEach((w) => w.el?.classList.remove('teaching')));
    if (phase !== 'sheikh' || questions[qi] !== q) return;
    if (!ok) status('The recitation could not be played. Check your connection, then read the ayah from the page.', 'bad');
    // the student's turn comes the moment he stops: the microphone opens at once, with a soft two-note sign (a spoken
    // "A'id" would keep them waiting, and would be heard by the microphone as words); his "A'id" is shown, not said
    say('listening', 'again', 'Your turn: repeat the ayah after me.');
    status('Your turn: repeat the ayah now. The Sheikh stops you at any mistake.', 'good');
    phase = 'answer';
    updateCurrent();
    startListening();
    armSilence();
    yourTurn();
  }

  // ── the teaching recitation, without its pauses ─────────────
  // The teaching recordings (al-Husary, al-Mu'allim) leave 4 to 6 seconds of silence after each phrase, for a class
  // to repeat it. Here the student repeats the whole ayah after him, so those pauses are only waiting: each recording
  // is fetched once and mapped, and played from that same download with its long pauses shortened to a breath and the
  // silence at its end cut off, so the student's turn comes the moment the Sheikh's voice stops.
  const voiceMaps = new Map();
  function voiceMap(src) {
    if (voiceMaps.has(src)) return voiceMaps.get(src);
    const job = (async () => {
      try {
        const res = await fetch(src);
        if (!res.ok) return null;
        const buf = await res.arrayBuffer();
        const url = URL.createObjectURL(new Blob([buf], { type: 'audio/mpeg' }));
        const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        if (!OAC) return { url, gaps: [], start: 0, end: null };
        const audio = await new OAC(1, 1, 44100).decodeAudioData(buf.slice(0));
        return { url, ...silences(audio) };
      } catch { return null; }
    })();
    voiceMaps.set(src, job);
    if (voiceMaps.size > 30) {   // keep the last few dozen
      const [old, oldJob] = voiceMaps.entries().next().value;
      voiceMaps.delete(old);
      oldJob.then((m) => { if (m?.url) URL.revokeObjectURL(m.url); });
    }
    return job;
  }
  function silences(audio) {
    const d = audio.getChannelData(0), hop = Math.max(1, Math.round(audio.sampleRate * 0.02));
    const n = Math.floor(d.length / hop), rms = new Float32Array(n);
    for (let k = 0; k < n; k++) { let e = 0; for (let i = k * hop, z = i + hop; i < z; i++) e += d[i] * d[i]; rms[k] = Math.sqrt(e / hop); }
    const loud = Array.from(rms).sort((x, y) => x - y)[Math.floor(n * 0.95)] || 0;
    const quiet = Math.max(loud * 0.03, 0.002);          // 30 dB below his voice
    const t = (k) => (k * hop) / audio.sampleRate;
    let a = 0; while (a < n && rms[a] <= quiet) a++;
    let b = n - 1; while (b > a && rms[b] <= quiet) b--;
    if (a >= n) return { gaps: [], start: 0, end: null };
    const gaps = [];
    for (let k = a, run = -1; k <= b; k++) {
      if (rms[k] <= quiet) { if (run < 0) run = k; }
      else { if (run >= 0 && t(k - run) >= 1.2) gaps.push([t(run), t(k)]); run = -1; }   // a breath is kept, a long pause is not
    }
    return { gaps, start: Math.max(0, t(a) - 0.15), end: t(b + 1) + 0.15 };
  }

  const LEAD = 0.3, TAIL = 0.3;
  function playAudio(src, share = 1, map = null) {
    return new Promise((resolve) => {
      let stopAt = null, fading = false, finished = false;
      const timer = setInterval(() => {
        if (map && !finished) {
          const at = voice.currentTime;
          if (map.end !== null && at >= map.end) { end(true); return; }        // his voice has ended: no waiting
          const gap = map.gaps.find(([g0, g1]) => at >= g0 + 0.3 && at < g1 - 0.3);
          if (gap) { try { voice.currentTime = gap[1] - 0.3; } catch {} }      // a long pause becomes a short one
        }
        if (share >= 1 || stopAt === null || fading) return;
        if (voice.currentTime >= stopAt) {
          fading = true;
          let v = 1;
          const fade = setInterval(() => {
            v -= 0.12;
            try { voice.volume = Math.max(0, v); } catch {}
            if (v <= 0) { clearInterval(fade); end(true); }
          }, 35);
        }
      }, 40);
      function end(ok) {
        if (finished) return;
        finished = true;
        clearInterval(timer);
        voice.pause();
        try { voice.volume = 1; } catch {}
        resolve(ok);
      }
      voice.loop = false;
      voice.onloadedmetadata = () => {
        if (map?.start) { try { voice.currentTime = map.start; } catch {} }
        const d = voice.duration;
        if (Number.isFinite(d) && d > 0) stopAt = Math.min(d, LEAD + Math.max(0, d - LEAD - TAIL) * share + 0.25);
      };
      voice.onended = () => end(true);
      voice.onerror = () => end(false);
      voice.onpause = () => { if (!finished && !fading && voice.currentTime > 0 && !voice.ended) end(true); };
      try { voice.volume = 1; } catch {}
      voice.src = src;
      voice.play().catch(() => end(false));
    });
  }

  // ── the mushaf page ─────────────────────────────────────────
  function wordSpan(w) {
    let cls = 'w hidden';
    if (w.state === 'shown') cls = 'w read';
    else if (w.state === 'skipped') cls = 'w out';
    else if (w.state === 'todo' || w.state === 'queued') cls = shown() ? 'w todo' : 'w hidden';
    const sp = el('span', cls, w.display);
    if (w.state === 'shown') { if (w.helped) sp.classList.add('helped'); else if (w.mistake) sp.classList.add('weak'); else if (w.unclear) sp.classList.add('unclear'); if (w.tajweed) sp.classList.add('tj'); }
    else if (w.mistake && !w.tajweed) sp.classList.add('missed');
    sp.__w = w;
    w.el = sp;
    return sp;
  }
  function markerSpan(it, a) {
    const mk = el('span', 'mk w' + (it.done || shown() ? '' : ' hidden'), `﴿${arNum(a)}﴾`);
    it.mk = mk;
    return mk;
  }
  // The page the reader is about to reach is built ahead of time (preparePage), so turning the page is instant:
  // the new page is already laid out and slides in over the old one, which then fades away.
  const ready = new Map();      // page → Promise<paper>, for the current question
  let readyFor = null;
  const sizeNow = () => ui.textSize?.() ?? 'page';
  function makePaper(p) {
    const map = new Map(items.map((it) => [it.key, it]));
    const size = sizeNow();
    return buildPaper(p, { getJson, pad, items: map, wordSpan, markerSpan, script: 'plain', layout: size === 'page' ? 'fixed' : 'flow' }).then((paper) => {
      paper.classList.add(shown() ? 'context' : 'outlines', size === 'page' ? 'mp-fixed' : 'mp-big');
      if (size !== 'page') paper.dataset.size = size;
      return paper;
    });
  }
  function preparePage(p) {
    if (readyFor !== items) { ready.clear(); readyFor = items; }
    if (p === shownPage || ready.has(p)) return;
    ready.set(p, makePaper(p).catch(() => null));
  }
  async function renderPage(p, animate) {
    if (readyFor !== items) { ready.clear(); readyFor = items; }
    const made = ready.get(p); ready.delete(p);
    const paper = (made && (await made)) || (await makePaper(p));
    await swapPaper(paper, animate);
    shownPage = p;
    ui.page?.(p);
  }
  async function swapPaper(paper, animate) {
    const old = stage.querySelector('.paper');
    if (animate && old && !reduceMotion && typeof paper.animate === 'function') {
      paper.classList.add('turning');
      stage.append(paper);
      await fitPaper(paper);
      try {
        old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'forwards' });
        await paper.animate([{ opacity: 0, transform: 'translateX(-24px)' }, { opacity: 1, transform: 'none' }], { duration: 240, easing: 'cubic-bezier(.2,.7,.2,1)' }).finished;
      } catch {}
      old.remove();
      paper.classList.remove('turning');
    } else {
      stage.replaceChildren(paper);
      await fitPaper(paper);
    }
    stage.scrollTop = 0;
  }
  // a different text size: lay the page out again (keeping where the reader is)
  async function relayout() { ready.clear(); if (shownPage) { await renderPage(shownPage, false); updateCurrent(); } }
  let fitT;
  const onResize = () => { clearTimeout(fitT); fitT = setTimeout(() => { ready.clear(); fitPaper(stage.querySelector('.paper')); }, 150); };
  addEventListener('resize', onResize);

  let lastFollow = 0;
  function follow(node) {
    if (!node) return;
    const now = Date.now();
    if (now - lastFollow < 300) return;
    const r = node.getBoundingClientRect(), box = stage.getBoundingClientRect();
    if (r.top < box.top + 40 || r.bottom > box.bottom - 60) {
      lastFollow = now;
      stage.scrollBy({ top: r.top - (box.top + box.height * 0.35), behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }

  // ── writing words ───────────────────────────────────────────
  const queue = [];
  let running = false;
  function enqueue(fn) { queue.push(fn); if (!running) drain(); }
  async function drain() {
    running = true;
    while (queue.length) await queue.shift()();
    running = false;
    updateCurrent();
    if (phase === 'answer' && pos >= flat.length) sheikhStops();
  }
  function revealStep(w) {
    return async () => {
      if (w.page !== shownPage) await renderPage(w.page, true);
      if (!w.el?.isConnected) await renderPage(w.page, false);
      const sp = w.el;
      if (!sp) return;
      const dur = 0;   // words appear the moment they are heard
      sp.classList.remove('hidden', 'todo', 'hint', 'current', 'wrong', 'missed');
      sp.classList.add(w.helped ? 'helped' : w.mistake ? 'weak' : 'fresh');
      if (w.unclear && !w.mistake && !w.helped) sp.classList.add('unclear');
      if (w.tajweed) sp.classList.add('tj');
      sp.style.setProperty('--dur', `${dur}ms`);
      sp.classList.add('ink');
      follow(sp);
      w.state = 'shown';
      setTimeout(() => { sp.classList.remove('ink'); sp.style.removeProperty('--dur'); }, dur + 20);
      setTimeout(() => { sp.classList.remove('fresh'); sp.classList.add('read'); if (w.helped) sp.classList.add('helped'); else if (w.mistake) sp.classList.add('weak'); }, dur + 650);
      if (w.wi === w.item.words.length - 1) {
        const it = w.item;
        it.done = true;
        if (it.a && phase === 'answer' && listenMode !== 'teach' && it.words.every((x) => !x.mistake && !x.helped)) { const p = P('ahsant'); sheikh('listening', p.ar, `${p.en} Carry on.`); }
        setTimeout(() => it.mk?.classList.remove('hidden'), dur * 0.6);
      }
    };
  }

  let lastPos = '';
  function updateCurrent() {
    stage.querySelectorAll('.w.current').forEach((x) => x.classList.remove('current'));
    const w = flat[pos];
    if (!w || phase !== 'answer') return;
    if (w.page === shownPage && !w.el?.isConnected && !running) { renderPage(shownPage, false).then(updateCurrent); return; }
    if (w.page !== shownPage && !running && mode === 'reading') { renderPage(w.page, true).then(updateCurrent); return; }
    if (w.page === shownPage) { w.el?.classList.add('current'); follow(w.el); }
    const k = `${w.item.s}:${w.item.a}`;
    if (k !== lastPos) { lastPos = k; ui.where?.({ label: w.item.label, s: w.item.s, a: w.item.a }); setExpected(rec, upcoming()); }
  }

  // kind: undefined (read correctly) | 'help' (hint) | 'prompt' (Sheikh said it) | 'unclear'
  function accept(count, kind) {
    for (let k = 0; k < count && pos < flat.length; k++) {
      const w = flat[pos];
      w.state = 'queued';
      if (kind === 'help') { w.helped = true; q.stats.help++; tally.hint++; markAyah(w, 'hint'); note('hint', w); }
      else if (kind === 'prompt') { w.mistake = true; tally.prompt++; markAyah(w, 'prompt'); note('prompt', w); addSpot(w, 'prompt'); }
      else if (kind === 'unclear') {
        w.unclear = true; tally.unclear++; markAyah(w, 'unclear'); note('unclear', w);
        if (L.unclearIsMistake) w.mistake = true;
        else if (!w.mistake) { q.stats.first++; tally.first++; }
      }
      else { if (!w.mistake) { q.stats.first++; tally.first++; } markAyah(w); }
      q.stats.words++; tally.words++;
      pos++;
      enqueue(revealStep(w));
    }
    wrongStreak = 0;
    if (kind !== 'prompt') status(kind === 'help' ? 'Shown. Carry on.' : 'Correct. Keep going.', 'good');
    if ((!kind || kind === 'unclear') && phase === 'answer') say('listening', 'carryon');
    updateCurrent();
    armSilence();
  }
  // A wrong word. The Sheikh corrects as a teacher in a halaqah does, step by step, giving the student the chance
  // to put it right themselves first:
  //   halaqah (Levels 3-4 and adults)                    gentle (Levels 1-2)
  //   1. he stops them: "Intabih" (take care), listens     1. "Intabih", listens again
  //   2. he cues them: the reciter says the words just     2. he gives the word (the reciter), and they carry on
  //      before the mistake, so they hear the run-up
  //   3. he gives the word (the reciter), then asks them
  //      to repeat the ayah from its start ("A'id al-ayah")
  // Going back to repeat when he asked is not counted as a mistake. Every spot is kept (spots) for the report and
  // for the next visit, where he brings them up again.
  let correcting = false, askedRepeat = false;
  function reject(heard) {
    const w = flat[pos];
    if (!w || correcting || phase !== 'answer') return;
    if (!w.mistake) { tally.wrong++; markAyah(w, 'wrong'); note('wrong', w, { heard }); addSpot(w, 'wrong'); }
    w.mistake = true;
    wrongStreak++;
    if (w.el) { w.el.classList.add('current', 'wrong', 'missed'); setTimeout(() => w.el?.classList.remove('wrong'), 800); }
    status(`Heard “${heard}”. That is not the next word.`, 'bad');
    correct(w);
  }
  async function correct(w) {
    correcting = true;
    clearSilence();
    phase = 'sheikh';
    stopListening();
    const back = () => { correcting = false; if (phase === 'sheikh') { phase = 'answer'; updateCurrent(); startListening(); armSilence(); } };
    try {
      if (strict()) {
        // "Sheikh corrects": 1. "Intabih", they try the word again; 2. he says the word and they say it after him;
        // 3. he gives it and they carry on (Levels 3, 4 and adults: from the start of the ayah)
        if (wrongStreak === 1) {
          const p = say('stop', 'takecare', 'Stop. That is not right. Try that word again.');
          await speakP(p);
          status('The Sheikh stopped you. Try that word again.', 'bad');
          return back();
        }
        if (wrongStreak === 2 && w.item.a) {
          sheikh('prompt', w.display, 'Say it like this.');
          status('Listen to the word, then say it yourself and carry on.');
          const ok = await playAudio(wordAudioUrl(w.item.s, w.item.a, w.wi));
          if (phase !== 'sheikh') return;
          if (!ok) await wait(1200);
          const p = say('listening', 'again', `Now you: ${w.display}.`);
          await speakP(p);
          return back();
        }
      }
      if (wrongStreak === 1) {
        const p = say('listening', 'takecare', 'Take care, that is not right. Try that word again.');
        await speakP(p);
        status('Try that word again.', 'bad');
        return back();
      }
      if (wrongStreak === 2 && !young && !strict()) {
        // the run-up: up to three words before the mistake, in the same ayah, from the reciter
        const from = Math.max(0, w.wi - 3), run = w.item.words.slice(from, w.wi);
        if (run.length && w.item.a) {
          sheikh('speaking', run.map((x) => x.display).join(' ') + ' …', 'Listen to the words just before it, then carry on.');
          status('The Sheikh says the words just before it. Carry on from there.');
          for (let i = from; i < w.wi && phase === 'sheikh'; i++) await playAudio(wordAudioUrl(w.item.s, w.item.a, i));
          return back();
        }
      }
      // give the word
      correcting = false; phase = 'answer';
      await sheikhPrompts();
      if (!young && w.item.a && w.wi > 0 && phase === 'answer') {
        askedRepeat = true;
        const p = say('listening', 'repeatayah', 'Now repeat the ayah from its start, with the word in its place.');
        status('Repeat the ayah from its start.', 'good');
        speakP(p);
        setTimeout(() => { askedRepeat = false; }, 20000);
      }
    } finally { if (correcting) correcting = false; }
  }
  const spots = [];
  function addSpot(w, kind) {
    if (!w?.item.a || spots.some((x) => x.s === w.item.s && x.a === w.item.a && x.wi === w.wi)) return;
    spots.push({ s: w.item.s, a: w.item.a, wi: w.wi, word: w.display, kind });
  }

  let silenceTimer = null;
  function clearSilence() { clearTimeout(silenceTimer); silenceTimer = null; }
  function armSilence() {
    clearSilence();
    if (phase !== 'answer') return;
    silenceTimer = setTimeout(() => { if (phase === 'answer' && !running) sheikhPrompts(); else armSilence(); }, L.silenceMs);
  }
  async function sheikhPrompts() {
    if (phase !== 'answer' || pos >= flat.length) return;
    clearSilence();
    const w = flat[pos];
    q.stats.prompts++;
    phase = 'sheikh';
    stopListening();
    sheikh('prompt', w.display, 'The Sheikh gives you the next word.');
    status('The Sheikh is prompting you with the next word.');
    const ok = w.item.a ? await playAudio(wordAudioUrl(w.item.s, w.item.a, w.wi)) : false;
    if (!ok) await wait(1200);
    if (phase === 'done' || phase === 'paused') return;
    accept(1, 'prompt');
    phase = 'answer';
    say('listening', 'carryon', 'Carry on from there.');
    status('Carry on from there.');
    startListening();
    armSilence();
  }
  // teach: what the Sheikh does when a page read-through or a repeated ayah is finished.
  // He praises only when it is earned, as a teacher does, not after every ayah:
  //   1. an ayah that had mistakes, recited again after him and now right;
  //   2. the whole page repeated after him, ayah by ayah, with every ayah right in the end;
  //   3. the page read to him with few or no mistakes, after he has taught it.
  // Otherwise he simply goes on to the next ayah.
  const talqinOk = new Map();   // "page:round" → every ayah of that round ended right
  const mistakesIn = (qq) => (qq.flat ?? []).filter((w) => w.mistake && w.item.a).length;
  async function teachStops() {
    phase = 'stopped';
    clearSilence();
    await untilQuiet();
    if (phase !== 'stopped' || questions[qi] !== q) return;
    stopListening();
    const m = mistakesIn(q);
    ui.questionDone?.({ qi, n: questions.length });
    const after = (list) => { questions.splice(qi + 1, 0, ...list); };
    let p1 = null, p2 = null, en = '';
    if (q.kind === 'page') {
      const pg = pagesDone.find((x) => x.page === q.page) ?? (pagesDone.push({ page: q.page, first: m, rounds: 0, passed: false, last: m }), pagesDone[pagesDone.length - 1]);
      pg.last = m; pg.rounds = Math.max(pg.rounds, q.round);
      if (m < TEACH_AT) {
        pg.passed = true;
        if (q.round > 0) { p1 = P(m === 0 ? 'mumtaz' : 'ahsant'); p2 = P('barakallah'); }   // 3
        else p1 = P('barakallah');
        en = m === 0 ? 'The page is right, with no mistakes. Masha Allah.' : `The page is good: ${m} mistake${m === 1 ? '' : 's'}, fewer than ${TEACH_AT}.`;
      } else if (q.round < TEACH_ROUNDS) {
        pg.rounds = q.round + 1;
        // the first time: every ayah of the page; after that, the ayahs that still had mistakes
        const weak = new Set((q.flat ?? []).filter((w) => w.mistake && w.item.a).map((w) => w.item.key));
        const ks = [];
        for (let k = q.start; k <= q.end; k++) { const x = scopeAyahs[k]; if (q.round === 0 || weak.has(`${x.s}:${x.ay.a}`)) ks.push(k); }
        after([...ks.map((k, j) => ({ kind: 'ayah', page: q.page, start: k, end: k, strict: true, noBism: true, tries: 1, round: q.round + 1, intro: q.round === 0 && j === 0, fix: q.round > 0 })),
          { kind: 'page', page: q.page, start: q.start, end: q.end, round: q.round + 1, strict: true }]);
        p1 = P('listen');
        en = q.round === 0 ? `${m} mistakes on this page. Let us learn it together: I recite each ayah, and you repeat it after me.` : `${m} mistakes still. Let us go over the ayahs that need it again, then read the page once more.`;
      } else {
        p1 = P('revise');
        en = 'We will come back to this page next time, in sha Allah. Keep going over it.';
      }
    } else {   // a repeated ayah
      const key = `${q.page}:${q.round}`;
      if (!talqinOk.has(key)) talqinOk.set(key, true);
      const roundEnds = questions[qi + 1]?.kind !== 'ayah' || questions[qi + 1].page !== q.page;
      if (m > 0 && q.tries < AYAH_TRIES) {
        after([{ ...q, tries: q.tries + 1, items: null, flat: null, stats: null }]);
        en = 'That ayah needs another go.';
      } else {
        if (m > 0) talqinOk.set(key, false);
        const pageRight = roundEnds && talqinOk.get(key);
        if (pageRight) { p1 = P('ahsant'); en = 'You have repeated the whole page after me. Now read it to me.'; }   // 2
        else if (m === 0 && q.tries > 1) { p1 = P('ahsant'); en = 'That is right now. On to the next.'; }      // 1
        else if (m === 0) en = 'On to the next ayah.';
        else { p1 = P('carryon'); en = 'We go on. It will come with practice.'; }
      }
    }
    const praised = p1?.file === P('ahsant').file || p1?.file === P('mumtaz').file;
    sheikh(p1?.file === P('again').file || p1?.file === P('listen').file ? 'speaking' : 'idle', [p1?.ar, p2?.ar].filter(Boolean).join('، '), en);
    status(en, praised ? 'good' : '');
    if (praised && q.kind === 'page') chime();
    if (p1) await speakP(p1);
    if (p2) await speakP(p2);
    await wait(q.kind === 'page' ? 1800 : p1 ? 900 : 350);
    if (phase !== 'stopped' || questions[qi] !== q) return;
    if (qi + 1 < questions.length) nextQuestion(); else finish();
  }
  async function sheikhStops() {
    if (listenMode === 'teach' && q?.kind) return teachStops();
    phase = 'stopped';
    clearSilence();
    stopListening();
    const st = q.stats;
    const ratio = st.words ? st.first / st.words : 0;
    // praise in the student's gender: Mumtaaz(a), Jayyid jiddan or Ahsanta/Ahsanti, then the Sheikh's word
    const praise = P(praiseFor(ratio, st.prompts, st.help));
    const tail = mode === 'reading' ? P('barakallah') : ratio >= 0.85 ? P('barakallah') : P('revise');
    const head = mode === 'reading' ? null : P('enough');
    const ar = [head?.ar, praise.ar, tail.ar].filter(Boolean).join('، ');
    const en = [mode === 'reading' ? (byHeart ? 'You have recited to the end of the passage from memory.' : 'You have reached the end of the passage.') : head.en, praise.en, tail.en].join(' ');
    sheikh('stop', ar, en);
    status(mode === 'reading' ? (byHeart ? 'Recitation complete.' : 'Reading complete.') : 'Question complete.', 'good');
    ui.questionDone?.({ qi, n: questions.length });
    chime();
    if (head) await speakP(head);
    await speakP(praise);
    await speakP(tail);
    if (qi + 1 < questions.length) {
      await wait(2500);
      if (phase === 'stopped' && questions[qi] === q) nextQuestion();
    } else {
      await wait(1500);
      if (phase === 'stopped') {
        if (mode === 'hifz') { const p = say('stop', 'testover'); await speakP(p); }
        if (phase === 'stopped') finish();
      }
    }
  }
  function chime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = 660;
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.65);
    } catch {}
  }

  // a soft rising two-note sign: "your turn"
  function yourTurn() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [[523, 0], [784, 0.11]].forEach(([hz, at]) => {
        const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + at;
        o.type = 'sine'; o.frequency.value = hz;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.1, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
        o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.18);
      });
      setTimeout(() => ctx.close?.(), 600);
    } catch {}
  }

  // ── the end ─────────────────────────────────────────────────
  function passageText() {
    const bySurah = new Map();
    for (const x of questions) for (const w of x.flat ?? []) {
      if (w.state !== 'shown' || !w.item.a) continue;
      if (!bySurah.has(w.item.s)) bySurah.set(w.item.s, { en: scopeAyahs.find((y) => y.s === w.item.s)?.sura.en ?? String(w.item.s), ayahs: new Set() });
      bySurah.get(w.item.s).ayahs.add(w.item.a);
    }
    const parts = [];
    let count = 0;
    for (const [, v] of [...bySurah].sort((a, b) => a[0] - b[0])) {
      const xs = [...v.ayahs].sort((a, b) => a - b);
      count += xs.length;
      const runs = [];
      for (const a of xs) { const r = runs[runs.length - 1]; if (r && a === r[1] + 1) r[1] = a; else runs.push([a, a]); }
      parts.push(`${v.en} ${runs.map(([a, b]) => (a === b ? `${a}` : `${a}–${b}`)).join(', ')}`);
    }
    return { text: parts.join('; '), count };
  }
  function finish() {
    if (phase === 'done') return;
    phase = 'done';
    clearSilence(); stopListening(); voice.pause(); stopVoice();
    removeEventListener('resize', onResize);
    removeEventListener('ql:align', onAlign);
    removeEventListener('ql:offtext', onOffText);
    const asked = questions.filter((x) => x.stats);
    const passage = passageText();
    const perAyah = [...ayahMarks.values()].sort((a, b) => a.s - b.s || a.a - b.a).map((x) => ({ ...x, marks: [...x.marks] }));
    const weakAyahs = perAyah.filter((x) => x.marks.some((m) => m === 'wrong' || m === 'prompt')).map((x) => `${x.s}:${x.a}`);
    // the reading tracker (src/lib/reading.mjs) counts every ayah recited, for children and adults alike
    try { if (perAyah.length) globalThis.dispatchEvent?.(new CustomEvent('ta:recited', { detail: { keys: perAyah.map((x) => `${x.s}:${x.a}`) } })); } catch {}
    ui.finished?.({ mode: byHeart ? 'follow' : mode, tally: { ...tally }, questions: asked.length, passage: passage.text, ayahCount: passage.count, perAyah, weakAyahs, spots: spots.slice(0, 12), ms: Date.now() - startedAt, listen: listenMode, pages: pagesDone.map((x) => ({ ...x })) });
  }

  // ── the live cursor ─────────────────────────────────────────
  // With the Qāf tracker the page knows, several times a second, which word the reader is in and how far into
  // it: that word fills as it is said, before it is confirmed. A hidden word (Hifz) shows only its outline filling.
  let liveEl = null, lastAt = '';
  const clearLive = () => { if (liveEl) { liveEl.classList.remove('live'); liveEl.style.removeProperty('--p'); liveEl = null; } };
  const onAlign = (e) => {
    if (phase !== 'answer' || !listening) return clearLive();
    const d = e.detail, w = flat[pos + d.offset];
    const elw = w && (w.state !== 'shown' || d.offset < 0) && w.page === shownPage && w.el?.isConnected ? w.el : null;
    if (elw !== liveEl) { clearLive(); if (elw) { elw.classList.add('live'); liveEl = elw; } }
    // the reader went back to repeat: the words they repeat light up again, and the page waits for them
    if (d.offset < 0 && w) {
      if (!goingBack) { goingBack = true; status('Going back over it…', 'good'); }
      if (elw) elw.classList.add('replay');
    } else if (goingBack && d.offset >= 0) { goingBack = false; setTimeout(() => stage.querySelectorAll('.w.replay').forEach((x) => x.classList.remove('replay')), 900); }
    if (liveEl) { const p = (Math.round(Math.min(1, Math.max(0.1, d.frac)) * 50) / 50).toString(); if (liveEl.style.getPropertyValue('--p') !== p) liveEl.style.setProperty('--p', p); }   // only when it moves (each write restyles the page)
    // the reader is still reciting (the cursor is moving through the text): the Sheikh does not step in
    const at = `${d.offset}:${d.frac.toFixed(2)}`;
    if (at !== lastAt && !d.filler) { lastAt = at; armSilence(); }
    // nearing the end of the page: get the next page ready, so turning it is instant
    const k = flat.findIndex((x, i) => i >= pos && x.page !== shownPage);
    if (k > 0 && k - pos <= 6) preparePage(flat[k].page);
  };
  addEventListener('ql:align', onAlign);
  // the tracker heard a few words that are not the next words (not a mistake yet: one is only marked once the
  // reader goes on past it)
  let goingBack = false;
  const onOffText = () => { if (phase === 'answer' && listening) status('That did not sound like the next words. Carry on from the highlighted word.', 'bad'); };
  addEventListener('ql:offtext', onOffText);

  // ── listening ───────────────────────────────────────────────
  let rec = null, listening = false, heardAt = 0;
  // the Sheikh does not speak over the student: wait until nothing has been heard for a moment (at most a few seconds)
  async function untilQuiet(ms = 800, most = 4000) {
    const t0 = performance.now();
    while (listening && performance.now() - heardAt < ms && performance.now() - t0 < most) await wait(100);
  }
  const upcoming = () => flat.slice(pos, pos + 40).map((w) => w.display);
  const follower = createFollower({
    getFlat: () => flat,
    getPos: () => pos,
    threshold,
    accept: (n, kind) => accept(n, kind),
    wrong: (heard) => reject(heard),
    hold: () => strict(),
    replay: (idx) => {
      // going back because the Sheikh asked them to repeat the ayah is not a mistake
      if (!inReplay) { inReplay = true; if (!askedRepeat) { tally.back++; const w = flat[idx]; if (w) { markAyah(w, 'back'); note('back', w); } } }
      const w = flat[idx]; if (w?.el && w.page === shownPage) w.el.classList.add('replay');
      status('Going back over it…', 'good');
    },
    endReplay: () => { inReplay = false; askedRepeat = false; setTimeout(() => stage.querySelectorAll('.w.replay').forEach((x) => x.classList.remove('replay')), 900); },
    skipOptional: (spoken, i, th) => {
      const w = flat[pos];
      if (!w || w.item.a !== 0 || w.wi !== 0) return null;
      const after = pos + w.item.words.length;
      if (!flat[after] || !matchAt(spoken, i, flat, after, th).n) return null;
      w.item.words.forEach((x) => { x.state = 'skipped'; if (x.el) x.el.className = 'w out'; });
      pos = after;
      return pos;
    },
  });
  // ── the tajweed ear: judges each breath for the rules the student chose, beside the word checker ──
  let ear = null;
  function startEar() {
    if (!tajweed?.checks) return;
    ear ??= createTajweedEar({
      checks: tajweed.checks, getFlat: () => flat, getPos: () => pos,
      onState: (st) => { if (st === 'error') status('Tajweed could not be checked on this device. The words are still checked.', ''); },
      onRemarks: (list) => {
        let lastText = '';
        for (const { w, remarks } of list) {
          if (w.helped || w.tajweed) continue;
          w.tajweed = remarks;
          // a word already written loses its "right first time"; one not yet accepted is marked when it is written
          const written = w.state === 'queued' || w.state === 'shown';
          if (!w.mistake && written) {
            const owner = questions.find((x) => x.flat?.includes(w));
            if (owner?.stats) owner.stats.first = Math.max(0, owner.stats.first - 1);
            tally.first = Math.max(0, tally.first - 1);
          }
          w.mistake = true;
          tally.tajweed += remarks.length;
          markAyah(w, 'tajweed');
          for (const r of remarks) { lastText = remarkText(r, tajweed.young); note('tajweed', w, { text: lastText }); }
          if (written && w.el) { w.el.classList.add('tj', 'weak'); w.el.classList.remove('read'); }
        }
        if (lastText && phase === 'answer') status(`Tajweed: ${lastText}`, 'bad');
      },
    });
    ear.start();
  }
  // a word marked for tajweed: tap it to see what to fix
  stage.addEventListener('click', (e) => {
    const w = e.target.closest('.w.tj')?.__w;
    if (w?.tajweed) status(`Tajweed, ${w.display}: ${w.tajweed.map((r) => remarkText(r, tajweed?.young)).join(' ')}`, 'bad');
  });

  function startListening() {
    if (!SR || listening) return;
    rec = tuneRecognition(new SR(), { expect: upcoming() });
    rec.getExpected = () => flat.slice(pos, pos + 40).map((w) => w.plain);   // the Qāf tracker follows these
    rec.lang = 'ar-SA';
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 3;
    follower.reset();
    const me = rec;
    rec.onresult = (e) => { if (me === rec) heardAt = performance.now(); if (me === rec && phase === 'answer') { armSilence(); follower.handle(e.results, e.resultIndex); } };
    rec.onerror = (e) => {
      if (phrasesRefused(e)) return;   // biasing not supported here: the restart below carries on without it
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { listening = false; ui.mic?.(false); status('Microphone access is blocked. Allow the microphone for this site in the browser settings.', 'bad'); }
      else if (e.error === 'network') status('The speech service could not be reached. Check your internet connection.', 'bad');
    };
    // Chrome ends a session every so often: restart at once, re-aimed at the words now expected,
    // and retry straight away if the browser was not quite ready (so no recitation is lost)
    rec.onend = () => {
      if (!listening || me !== rec) return;
      follower.reset();
      setExpected(rec, upcoming());
      try { rec.start(); } catch { setTimeout(() => { try { if (listening && me === rec) rec.start(); } catch {} }, 60); }
    };
    try { rec.start(); listening = true; ui.mic?.(true); startEar(); } catch { status('Could not start the microphone. Reload the page and try again.', 'bad'); }
  }
  function stopListening() {
    listening = false;
    ear?.stop();
    clearLive();
    try { rec?.stop(); } catch {}
    ui.mic?.(false);
  }

  // ── controls the page can call ──────────────────────────────
  return {
    startHifz, startReading, startFollow, relayout,
    get phase() { return phase; },
    get mode() { return byHeart ? 'follow' : mode; },
    get listen() { return listenMode; },
    get hintsAllowed() { return L.hints; },
    hint() { if (L.hints && phase === 'answer' && pos < flat.length) accept(1, 'help'); },
    async repeatOpening() { if (mode === 'hifz' && phase === 'answer') { clearSilence(); await sheikhRecites(true); } },
    async listen() {
      // reading mode: hear the current ayah from the Sheikh's voice
      if (phase !== 'answer') return;
      const w = flat[pos];
      if (!w?.item.a) return;
      clearSilence(); stopListening(); phase = 'sheikh';
      say('speaking', 'listen', `Listen to ${w.item.label}.`);
      await playAudio(audioUrl(reciter, w.item.s, w.item.a));
      if (phase !== 'sheikh') return;
      phase = 'answer';
      say('listening', 'goahead', 'Now read it yourself.');
      startListening(); armSilence();
    },
    restartAyah() {
      if (phase !== 'answer' || mode !== 'reading') return;
      const w = flat[pos];
      if (!w) return;
      follower.reset();
      status(`Start ${w.item.label} again from its first word.`);
    },
    skip() { if (q && phase !== 'done' && mode === 'hifz') { q.stats.skipped = true; nextQuestion(); } },
    toggleMic() {
      if (listening) { stopListening(); clearSilence(); status('Microphone paused. Press it to carry on.'); }
      else if (phase === 'answer') { startListening(); armSilence(); status('Listening. Carry on.'); }
    },
    pause(reason) {
      if (phase === 'done' || phase === 'paused') return false;
      pausedFrom = phase === 'answer' || phase === 'sheikh' ? 'answer' : phase;
      phase = 'paused';
      clearSilence(); stopListening(); voice.pause(); stopVoice();
      if (reason === 'away') { tally.lookAways++; const w = flat[pos]; if (w) markAyah(w, 'away'); note('away', w); }
      return true;
    },
    resume() {
      if (phase !== 'paused') return;
      phase = pausedFrom === 'stopped' ? 'stopped' : 'answer';
      if (phase === 'answer') { say('listening', 'carryon', 'Carry on from where you stopped.'); status('Carry on from where you stopped.'); updateCurrent(); startListening(); armSilence(); }
    },
    addAwayTime(ms) { tally.awayMs += ms; },
    end() { finish(); },
  };
}
