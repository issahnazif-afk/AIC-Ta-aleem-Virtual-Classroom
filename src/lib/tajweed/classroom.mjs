// The Tajweed classroom (src/components/TajweedRoom.astro). The Sheikh teaches each topic on the chalkboard, writing
// as he speaks (src/lib/tajweed/course.mjs, written for the student's age), shows the rule in real āyāt with a reciter
// (data/tajweed-lessons.json), has the student listen, repeat and recite while he follows, then asks questions.
// A final test closes the course. Progress is kept on this device under opts.progKey.
//
//   startTajweed({ root, aud: 'l3' | 'l4' | 'adult', progKey, exit: { label, go }, start: { topic, do } })
import { site } from '../../quran/lib/url.mjs';
import { recitersFor, reciterFor, chooseReciter, clipFor, playClip, stopClips } from '../../quran/lib/rw-audio.mjs';
import { getSpeechRecognition, tuneRecognition, preloadEngine } from '../../quran/lib/speech.mjs';
import { narrate, hush } from '../narration.mjs';
import { normalize } from '../recite.mjs';
import { AUDIENCES, RULES, COUNTS, ruleName, course, lines } from './course.mjs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const shuffle = (a) => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
const strip = (h) => h.replace(/<[^>]+>/g, '');
const iso = (t) => t.replace(/[؀-ۿݐ-ݿࢠ-ࣿ](?:[؀-ۿݐ-ݿࢠ-ࣿ ،]*[؀-ۿݐ-ݿࢠ-ࣿ])?/g, (m) => '⁨' + m + '⁩');
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const html = (tag, cls, h) => { const e = el(tag, cls); e.innerHTML = h; return e; };   // our own build data only
const hasAr = (t) => /[ء-ي]/.test(t);
// the tajweed colours shown under the āyah (the same as the library's tajweed mushaf)
const LEGEND = [['ghunnah', '#FF7E1E', 'Ghunnah'], ['ikhafa', '#9400A8', 'Ikhfāʾ'], ['idgham_ghunnah', '#169777', 'Idghām'], ['iqlab', '#26BFFD', 'Iqlāb'], ['qalaqah', '#DD0008', 'Qalqalah'], ['madda_normal', '#537FFF', 'Madd'], ['ham_wasl', '#9A9A9A', 'Silent']];

let lessonsP = null;
const lessons = () => (lessonsP ??= fetch(site('quran/data/tajweed-lessons.json')).then((r) => r.json()).then((j) => j.rules).catch(() => ({})));

export function startTajweed({ root, aud = 'l4', progKey = 'ql-tjc', exit, start = {} }) {
  const q = (s) => root.querySelector(s);
  const board = q('[data-board]'), boardWrap = q('[data-board-wrap]'), paper = q('[data-paper]'), dock = q('[data-dock]');
  const sayEl = q('[data-say]'), sheikh = q('.sheikh');
  root.querySelector('.tjc').dataset.aud = aud;
  const L = lines(aud), A = AUDIENCES[aud], list = course(aud), kids = aud !== 'adult';
  const audio = new Audio(); audio.preload = 'auto';
  const doneMark = aud === 'l3' ? '★' : '✓';

  // ── progress ──
  const prog = {
    get() { try { return { done: {}, final: null, ...JSON.parse(localStorage.getItem(progKey) || '{}') }; } catch { return { done: {}, final: null }; } },
    set(f) { const p = this.get(); f(p); try { localStorage.setItem(progKey, JSON.stringify(p)); } catch {} },
  };

  // ── the Sheikh speaks (his recorded voice; the browser's voice for a line not recorded yet) ──
  let scene = 0, lastLine = '';
  function speak(text, mine = scene) {
    lastLine = text; sayEl.textContent = iso(text);
    return new Promise((resolve) => {
      if (mine !== scene) { resolve(false); return; }
      sheikh.dataset.state = 'speaking';
      let done = false;
      const end = () => { if (done) return; done = true; if (sheikh.dataset.state === 'speaking') sheikh.dataset.state = 'idle'; resolve(mine === scene); };
      narrate(text, { voice: 'sheikh', onEnd: end }).catch(end);
      setTimeout(end, 4000 + text.length * 90);   // never wait for ever
    });
  }
  q('[data-again]').addEventListener('click', () => lastLine && speak(lastLine));
  function newScene() { scene++; hush(); stopClips(); audio.pause(); stopListening(false); sheikh.dataset.state = 'idle'; return scene; }

  // ── the board ──
  function clearBoard() { board.replaceChildren(); boardWrap.hidden = false; paper.hidden = true; }
  function chalk(text, cls = 'en') {
    text = text.replace(/ـ(?![ًٌٍَُِّْٰ])/g, '');
    if (cls.includes('title-ar')) text = text.replace(/ٱ/g, 'ا');
    const p = el('p', `chalk ${cls}`, text);
    if (cls.includes('title-ar') || cls.includes(' q') || cls === 'q') p.dir = 'rtl';
    const n = [...text].length, ar = p.dir === 'rtl';
    const dur = Math.min(4200, Math.max(500, n * (ar ? 80 : 45)));
    p.style.setProperty('--dur', `${dur}ms`); p.style.setProperty('--steps', String(Math.max(8, Math.round(n * 1.2))));
    p.classList.add('write'); board.append(p);
    p.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    return sleep(dur);
  }
  const dockSet = (...items) => dock.replaceChildren(...items.filter(Boolean));
  function btn(text, on, primary = false) { const b = el('button', `btn${primary ? ' btn-primary' : ''}`, text); b.type = 'button'; b.addEventListener('click', on); return b; }
  function chalkBtn(parts, on) {
    const b = el('button', 'chalk-btn'); b.type = 'button';
    for (const [cls, t] of parts) if (t != null) { const s = el('span', cls, t); if (cls === 'opt' && hasAr(t) && !/[a-z]/i.test(t)) s.classList.add('ar-opt'); b.append(s); }
    b.addEventListener('click', on); return b;
  }
  function reciterPick() {
    const rs = recitersFor('hafs'); if (rs.length < 2) return null;
    const l = el('label', '', 'Reciter'); const s = el('select');
    for (const r of rs) s.append(new Option(r.name, r.id));
    s.value = reciterFor('hafs')?.id ?? rs[0].id;
    s.addEventListener('change', () => chooseReciter('hafs', s.value));
    l.append(s); return l;
  }
  const hear = async (k) => { const [s, a] = k.split(':').map(Number); return playClip(audio, await clipFor('hafs', reciterFor('hafs'), s, a)); };
  const exitBtn = () => exit && btn(`‹ ${exit.label}`, () => { newScene(); exit.go(); });

  // examples for this audience: Juz' ʿAmma and al-Fātiḥah for the children when there are enough
  async function examplesOf(rule) {
    const all = (await lessons())[rule] ?? [];
    const short = all.filter((e) => e.j30);
    return kids && short.length >= 3 ? short : all;
  }

  // ── the syllabus on the left ──
  function syllabus(cur = -1) {
    q('[data-syl]').hidden = false;
    q('[data-syl-h]').textContent = `${A.title}: the topics`;
    const done = prog.get().done;
    q('[data-topics]').replaceChildren(...list.map((t, i) => {
      const li = el('li'), b = el('button'); b.type = 'button';
      if (done[t.id]) b.classList.add('ok');
      if (i === cur) b.setAttribute('aria-current', 'step');
      b.append(el('span', 'n', done[t.id] ? doneMark : String(i + 1)), el('span', '', t.en));
      b.addEventListener('click', () => teach(i));
      li.append(b); return li;
    }));
  }
  const setUrl = (s) => { if (start.url) history.replaceState(null, '', s ? `?${s}` : location.pathname); };

  // ── 1 · the class: what shall we do? ──
  async function home() {
    const me = newScene(); setUrl(''); clearBoard(); syllabus();
    const p = prog.get(), n = list.filter((t) => p.done[t.id]).length;
    dockSet(exitBtn());
    chalk('عِلْمُ ٱلتَّجْوِيدِ', 'title-ar');
    chalk(`${A.title} · ${A.label}`, 'title-en');
    chalk(aud === 'l3' ? 'Read the Qur’an the way it was taught, one rule at a time.' : 'Ḥafṣ ʿan ʿĀṣim, by the way of ash-Shāṭibiyyah', 'en');
    const grid = el('div', 'chalk-btns');
    const next = list.findIndex((t) => !p.done[t.id]);
    const learn = chalkBtn([['ar', 'تَعَلَّمْ'], ['en', n ? 'Carry on learning' : 'Start the first lesson'], ['small', `${n} of ${list.length} topics done`]], () => (next < 0 ? syllabusScene() : teach(next)));
    const bar = el('span', 'bar'); const bi = el('i'); bi.style.width = `${Math.round((n / list.length) * 100)}%`; bar.append(bi); learn.append(bar);
    grid.append(learn,
      chalkBtn([['ar', 'ٱلدُّرُوسُ'], ['en', 'All the topics'], ['small', 'Choose any topic to learn or revise']], () => syllabusScene()),
      chalkBtn([['ar', 'ٱلِٱخْتِبَارُ ٱلنِّهَائِيُّ'], ['en', 'Final test'], ['small', p.final != null ? `Your best: ${p.final}%` : 'Questions from every topic']], () => finalTest()));
    board.append(grid);
    await speak(L.welcome, me);
  }

  async function syllabusScene() {
    const me = newScene(); setUrl('do=learn'); clearBoard(); syllabus();
    dockSet(btn('‹ Back', home));
    chalk('عِلْمُ ٱلتَّجْوِيدِ', 'title-ar');
    chalk('The topics', 'title-en');
    const grid = el('div', 'chalk-btns'), p = prog.get();
    list.forEach((t, i) => grid.append(chalkBtn([['ar', t.ar], ['en', `${i + 1}. ${t.en}`], ['small', p.done[t.id] ? `${aud === 'l3' ? '★ ' : ''}Passed${p.done[t.id].score != null ? ` · ${p.done[t.id].score}%` : ''}` : 'Not yet']], () => teach(i))));
    board.append(grid);
    await speak(L.syllabus, me);
  }

  // ── 2 · a topic, taught on the board ──
  async function teach(i) {
    const me = newScene(); const t = list[i];
    setUrl(`topic=${t.id}`); clearBoard(); syllabus(i);
    let paused = false, at = 0, finished = false;
    const pauseBtn = btn('Pause', () => { paused = !paused; pauseBtn.textContent = paused ? 'Continue' : 'Pause'; if (paused) hush(); else run(); });
    dockSet(btn('‹ Topics', syllabusScene), pauseBtn, el('span', 'grow'), btn('Skip ›', () => after()));
    await chalk(t.ar, 'title-ar');
    if (me !== scene) return;
    chalk(`${i + 1}. ${t.en}`, 'title-en');
    async function run() {
      while (at < t.points.length) {
        if (paused || me !== scene) return;
        const [say, write] = t.points[at];
        const [ok] = await Promise.all([speak(say, me), chalk(write, 'en bullet')]);
        if (me !== scene || paused || !ok) return;
        at++; await sleep(350);
      }
      if (finished) return; finished = true;
      if (t.rules.length) {
        const p1 = speak(L.examples, me);
        const tb = el('div', 'ex-table');
        for (const r of t.rules) {
          const ex = (await examplesOf(r)).slice(0, t.rules.length > 2 ? 1 : 2);
          for (const e of ex) {
            const w = html('span', 'ex-w write', e.w.slice(e.i, e.i + e.n).join(' ')); w.dir = 'rtl'; w.lang = 'ar'; w.style.setProperty('--dur', '900ms');
            tb.append(el('span', 'ex-cap', ruleName(r, aud)), w);
          }
        }
        board.append(tb); tb.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        await p1;
      }
      if (me === scene) after();
    }
    function after() {
      if (me !== scene) return;
      hush();
      if (t.intro && !t.qs.length) {
        prog.set((p) => { p.done[t.id] = { score: null }; }); syllabus(i);
        dockSet(btn('‹ Topics', syllabusScene), btn('Explain again', () => teach(i)), el('span', 'grow'), btn(i + 1 < list.length ? 'Next topic ›' : 'Finish', () => (i + 1 < list.length ? teach(i + 1) : home()), true));
        return;
      }
      dockSet(btn('‹ Topics', syllabusScene), btn('Explain again', () => teach(i)), el('span', 'grow'),
        t.rules.length ? btn('See it in the mushaf ›', () => mushaf(i, 0, 0, true), true) : btn('Questions ›', () => quiz(i), true));
    }
    run();
  }

  // ── 3 · the rule in the mushaf: listen, repeat, recite ──
  function ayahEl(e, marks = []) {
    const p = el('p', 'ay'); p.lang = 'ar';
    e.w.forEach((w, k) => { const s = html('span', [marks[k], k >= e.i && k < e.i + e.n ? 'fw' : ''].filter(Boolean).join(' '), w); p.append(s, ' '); });
    return p;
  }
  async function mushaf(i, r = 0, x = 0, intro = false) {
    const me = newScene(); const t = list[i];
    const rule = t.rules[r % t.rules.length]; const exs = await examplesOf(rule);
    if (me !== scene) return;
    x = (x + exs.length) % exs.length; const e = exs[x];
    setUrl(`topic=${t.id}&do=mushaf`);
    boardWrap.hidden = true; paper.hidden = false; paper.replaceChildren(); syllabus(i);
    if (t.rules.length > 1) {
      const tabs = el('div', 'chips');
      t.rules.forEach((rr, k) => { const b = el('button', '', ruleName(rr, aud)); b.type = 'button'; b.setAttribute('aria-pressed', String(rr === rule)); b.addEventListener('click', () => mushaf(i, k, 0)); tabs.append(b); });
      paper.append(tabs);
    }
    const chips = el('div', 'chips');
    exs.slice(0, 12).forEach((y, k) => { const b = el('button', '', y.k); b.type = 'button'; b.setAttribute('aria-pressed', String(k === x)); b.addEventListener('click', () => mushaf(i, r, k)); chips.append(b); });
    const cap = el('div', 'cap'); cap.append(el('span', '', `Sūrah ${e.k.replace(':', ', āyah ')}`), el('span', '', t.en));
    const target = ayahEl(e);
    const ruleP = el('p', 'rule'); ruleP.append('Highlighted: ', el('b', '', ruleName(rule, aud)), RULES[rule].count ? ` · ${RULES[rule].count}` : '');
    const legend = el('div', 'legend'); for (const [, c, n] of LEGEND) { const s = el('span', '', n); s.style.setProperty('--c', c); legend.append(s); }
    const result = el('div'); result.dataset.result = '';
    paper.append(chips, cap, target, ruleP, legend, result);
    dockSet(
      btn('‹ Board', () => teach(i)),
      btn('▶ Listen', () => hear(e.k), true),
      btn('Repeat ×3', () => repeat3(e, me)),
      btn('🎙 Recite', () => recite(e, me, target)),
      btn('Next example', () => mushaf(i, r, x + 1)),
      el('span', 'grow'),
      reciterPick(),
      btn('Questions ›', () => quiz(i), true),
    );
    if (intro) { await speak(L.toMushaf, me); if (me === scene) await hear(e.k); }
  }
  async function repeat3(e, me) {
    await speak(L.repeat, me);
    const [s, a] = e.k.split(':').map(Number); const c = await clipFor('hafs', reciterFor('hafs'), s, a);
    for (let n = 1; n <= 3 && me === scene; n++) {
      sayEl.textContent = `Listen (${n} of 3)…`;
      const t0 = performance.now(); if (!(await playClip(audio, c))) return;
      sayEl.textContent = `Your turn: repeat it now (${n} of 3).`; sheikh.dataset.state = 'listening';
      await sleep(Math.min(Math.max(performance.now() - t0 + 800, 2500), 20000));
      sheikh.dataset.state = 'idle';
    }
    if (me === scene) speak(L.practiseMore, me);
  }

  // the student recites; the Sheikh follows the words (the Qāf listening model, or the browser's own recogniser)
  const SR = getSpeechRecognition();
  let rec = null, listening = false, stopTimer = 0, onStop = null, primed = false;
  function stopListening(report = true) {
    if (!listening) return; listening = false; clearTimeout(stopTimer);
    try { rec?.stop(); } catch {}
    sheikh.dataset.state = 'idle';
    const f = onStop; onStop = null; if (report && f) f();
  }
  function listen(words) {
    return new Promise((resolve) => {
      const plain = words.map((w) => normalize(strip(w))).filter(Boolean);
      const marks = [];
      if (!SR) { resolve({ marks, plain, none: true }); return; }
      if (!primed) { primed = true; preloadEngine(); }
      listening = true; sheikh.dataset.state = 'listening';
      let pos = 0;
      rec = tuneRecognition(new SR());
      rec.getExpected = () => plain.slice(pos);
      Object.assign(rec, { lang: 'ar-SA', continuous: true, interimResults: true, maxAlternatives: 3 });
      rec.onresult = (ev) => {
        for (let r = ev.resultIndex; r < ev.results.length; r++) {
          const res = ev.results[r];
          if (res.track) { for (const t of res.track) { marks[pos] = t.kind; pos++; } }
          else if (res.isFinal) {
            for (const said of normalize(res[0].transcript).split(' ')) {
              const k = plain.slice(pos, pos + 3).findIndex((p) => p === said);
              if (k >= 0) { for (let y = 0; y < k; y++) marks[pos + y] = 'missed'; marks[pos + k] = 'read'; pos += k + 1; }
            }
          }
        }
        if (pos >= plain.length) stopListening();
      };
      rec.onerror = () => {};
      rec.onend = () => { if (listening) { try { rec.start(); } catch {} } };
      onStop = () => resolve({ marks, plain });
      try { rec.start(); } catch {}
      stopTimer = setTimeout(() => stopListening(), 60000);
    });
  }
  async function recite(e, me, target) {
    if (listening) { stopListening(); return null; }
    await speak(L.yourTurn, me); if (me !== scene) return null;
    const keep = [...dock.children]; dockSet(btn('■ Finished', () => stopListening(), true));
    const r = await listen(e.w);
    dock.replaceChildren(...keep);
    if (me !== scene) return null;
    const cls = r.marks.map((m) => (m === 'read' ? 'ok' : m === 'weak' ? 'weak' : m ? 'bad' : ''));
    const fresh = ayahEl(e, cls); target.replaceWith(fresh);
    const read = r.marks.filter((m) => m === 'read').length;
    let say, pass;
    if (r.none) { say = L.noListening; pass = null; }
    else if (!r.marks.some(Boolean)) { say = L.heardNone; pass = false; }
    else { pass = read / r.plain.length >= 0.6; say = pass ? L.followed : L.readAgain; }
    paper.querySelector('[data-result]')?.replaceChildren(el('p', 'verdict', say));
    await speak(say, me);
    return pass;
  }

  // ── 4 · questions ──
  const taughtRules = (upTo) => list.slice(0, Math.max(upTo + 1, 1)).flatMap((t) => t.rules).filter((r) => RULES[r]?.name[aud === 'l3' ? 0 : 1]);
  const courseRules = () => list.flatMap((t) => t.rules).filter((r) => RULES[r]?.name[aud === 'l3' ? 0 : 1]);
  async function questionsFor(i, n = 5) {
    const t = list[i], qs = [];
    for (const c of shuffle(t.qs).slice(0, t.rules.length ? 2 : 3)) qs.push({ type: 'concept', c });
    if (t.rules.length) {
      const rules = shuffle(t.rules);
      const exA = shuffle(await examplesOf(rules[0]));
      const near = [...new Set([...t.rules, ...taughtRules(i), ...courseRules()])].filter((r) => r !== rules[0]);
      const pool = [...new Set([...t.rules.filter((r) => r !== rules[0]), ...shuffle(near)])].slice(0, 2);
      if (exA[0]) qs.push({ type: 'which', e: exA[0], rule: rules[0], wrong: pool });
      const rB = rules[1 % rules.length]; const exB = shuffle(await examplesOf(rB));
      if (exB[1] ?? exB[0]) qs.push({ type: 'spot', e: exB[1] ?? exB[0], rule: rB });
      const counted = t.rules.filter((r) => RULES[r].count);
      if (counted.length) { const rc = shuffle(counted)[0]; const ex = shuffle(await examplesOf(rc)); if (ex[0]) qs.push({ type: 'count', e: ex[0], rule: rc }); }
      if (exA[2]) qs.push({ type: 'recite', e: exA[2], rule: rules[0] });
    }
    return qs.slice(0, n);
  }
  function ask(qn, me, k, total) {
    clearBoard();
    chalk(`Question ${k} of ${total}`, 'title-en');
    return new Promise(async (resolve) => {
      const answer = (ok, picked, right) => {
        if (picked) picked.classList.add(ok ? 'right' : 'wrongpick');
        if (!ok && right) right.classList.add('right');
        board.querySelectorAll('.chalk-btn, .spot button').forEach((b) => (b.disabled = true));
        speak(ok ? L.right : L.wrong, me).then(() => sleep(500)).then(() => resolve(ok));
      };
      const options = (opts, rightOpt) => {
        const grid = el('div', 'chalk-btns'); let right = null;
        for (const o of shuffle(opts)) { const b = chalkBtn([['opt', o]], () => answer(o === rightOpt, b, right)); if (o === rightOpt) right = b; grid.append(b); }
        board.append(grid);
      };
      const focusWords = (e) => { const p = html('p', 'chalk q', e.w.slice(e.i, e.i + e.n).join(' ')); p.lang = 'ar'; board.append(p); };
      if (qn.type === 'concept') {
        chalk(qn.c.q, hasAr(qn.c.q) && !/[a-z]/i.test(qn.c.q) ? 'q' : 'en');
        options(qn.c.o, qn.c.o[qn.c.a]);
        speak(L.qConcept, me);
      } else if (qn.type === 'which') {
        chalk('Which rule is in the highlighted letters?', 'en');
        focusWords(qn.e);
        options([ruleName(qn.rule, aud), ...qn.wrong.map((r) => ruleName(r, aud))], ruleName(qn.rule, aud));
        speak(L.qWhich, me);
      } else if (qn.type === 'count') {
        chalk('How long is the highlighted sound held?', 'en');
        focusWords(qn.e);
        const pool = COUNTS[aud === 'l3' ? 'l3' : 'l4'], rightC = RULES[qn.rule].count;
        options([...new Set([rightC, ...shuffle(pool.filter((c) => c !== rightC)).slice(0, 2)])], rightC);
        speak(L.qCount, me);
      } else if (qn.type === 'spot') {
        chalk(`Tap a word with: ${ruleName(qn.rule, aud)}`, 'en');
        const p = el('p', 'chalk spot'); p.lang = 'ar'; const bs = [];
        qn.e.w.forEach((w, x) => { const b = el('button', '', strip(w)); b.type = 'button'; bs.push(b); b.addEventListener('click', () => answer(qn.e.d.includes(x), b, bs[qn.e.i])); p.append(b, ' '); });
        board.append(p);
        speak(L.qSpot, me);
      } else if (qn.type === 'recite') {
        boardWrap.hidden = true; paper.hidden = false; paper.replaceChildren();
        const cap = el('div', 'cap'); cap.append(el('span', '', `Question ${k} of ${total}: listen, then recite`), el('span', '', ruleName(qn.rule, aud)));
        const target = ayahEl(qn.e); const result = el('div'); result.dataset.result = '';
        paper.append(cap, target, result);
        const keep = [...dock.children];
        await speak(L.qRecite, me); if (me !== scene) return resolve(false);
        await hear(qn.e.k); if (me !== scene) return resolve(false);
        const pass = await recite(qn.e, me, target);
        dock.replaceChildren(...keep);
        await sleep(600);
        resolve(pass ?? true);
      }
    });
  }
  async function runQuiz(qs, me) {
    let score = 0;
    for (let k = 0; k < qs.length; k++) { if (me !== scene) return null; if (await ask(qs[k], me, k + 1, qs.length)) score++; }
    return Math.round((score / qs.length) * 100);
  }
  const stars = (pct) => el('p', 'stars', '★'.repeat(pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0).padEnd(3, '☆'));
  async function quiz(i) {
    const me = newScene(); const t = list[i];
    setUrl(`topic=${t.id}&do=quiz`); syllabus(i);
    dockSet(btn('‹ Board', () => teach(i)));
    await speak(L.quizStart, me);
    const pct = await runQuiz(await questionsFor(i), me);
    if (pct == null || me !== scene) return;
    clearBoard();
    const pass = pct >= 70;
    chalk(t.ar, 'title-ar');
    board.append(el('p', 'score', `${pct}%`)); if (kids) board.append(stars(pct));
    if (pass) prog.set((p) => { p.done[t.id] = { score: Math.max(pct, p.done[t.id]?.score ?? 0) }; });
    syllabus(i);
    const allDone = list.every((x) => prog.get().done[x.id]);
    dockSet(btn('‹ Topics', syllabusScene), btn('Explain again', () => teach(i)), btn('Questions again', () => quiz(i)), el('span', 'grow'),
      pass && i + 1 < list.length && btn('Next topic ›', () => teach(i + 1), true),
      pass && allDone && btn('Final test ›', finalTest, true));
    await speak(!pass ? L.retry : allDone ? L.courseDone : L.passed, me);
  }
  async function finalTest() {
    const me = newScene(); setUrl('do=final'); syllabus();
    dockSet(btn('‹ Back', home));
    const qs = [];
    for (let i = 0; i < list.length; i++) { const one = shuffle((await questionsFor(i, 4)).filter((x) => x.type !== 'recite'))[0]; if (one) qs.push(one); }
    await speak(L.finalStart, me);
    const pct = await runQuiz(shuffle(qs).slice(0, aud === 'l3' ? 8 : 12), me);
    if (pct == null || me !== scene) return;
    clearBoard();
    prog.set((p) => { p.final = Math.max(pct, p.final ?? 0); });
    chalk('عِلْمُ ٱلتَّجْوِيدِ', 'title-ar');
    chalk('The final test', 'title-en');
    board.append(el('p', 'score', `${pct}%`)); if (kids) board.append(stars(pct));
    dockSet(btn('‹ Back', home), el('span', 'grow'), btn('Take it again', finalTest, true));
    await speak(pct >= 70 ? L.finalPassed : L.retry, me);
  }

  // ── start: from the link (?topic=…&do=…), or the class ──
  const ti = list.findIndex((t) => t.id === start.topic);
  if (start.do === 'final') finalTest();
  else if (ti >= 0) (start.do === 'quiz' ? quiz : start.do === 'mushaf' && list[ti].rules.length ? (n) => mushaf(n) : teach)(ti);
  else if (start.do === 'learn') syllabusScene();
  else home();
  return { stop: () => newScene() };
}
