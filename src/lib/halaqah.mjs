// "Learn Qur'an with the Sheikh": reading from the mushaf to the Sheikh, in the way the reader chooses.
// One room, used in the classroom (Levels 1 to 4) and in the adults' Quran Library:
//
//   free     Free reading, as in Recite: the Sheikh follows every word and helps when the reader stops
//   correct  Sheikh corrects: as in a halaqah, he stops the reader at each mistake, lets them try again,
//            then says the word for them to say after him
//   teach    Teach me: the reader reads a whole page; with 4 or more mistakes the Sheikh teaches it,
//            reciting each ayah for them to repeat (correcting as above), then they read the page again
//
// The listening itself is the classroom engine (engine.mjs, listen: free | correct | teach).
//   mountHalaqah(root, { audience, level, gender, reciters, defaultReciter, localAsr, onDone(result), onExit })
//   audience: 'kids' | 'adult'; level: the class Level 1–4 (kids). onDone gets the finished session, to log it.
import { getJson, store } from './client.mjs';
import { createEngine, TEACH_AT } from './engine.mjs';
import { getSpeechRecognition } from './speech.mjs';
import { LEVELS, mistakesTotal } from './session.mjs';
import { phrase, praiseFor, stopVoice } from './phrases.mjs';
import { renderSpots } from './spots.mjs';

export const LISTEN = {
  free: { name: 'Free reading', ar: 'قِرَاءَةٌ حُرَّة', text: 'Read on your own. The Sheikh follows every word and helps only when you stop.' },
  correct: { name: 'Sheikh corrects', ar: 'ٱلشَّيْخُ يُصَحِّح', text: 'As in the halaqah: at a mistake the Sheikh stops you, lets you try again, then says the word for you to say after him.' },
  teach: { name: 'Teach me', ar: 'عَلِّمْنِي', text: `Read a whole page. With ${TEACH_AT} or more mistakes, the Sheikh teaches it: he recites each ayah, you repeat it, until the page is right.` },
};
const KEY = 'hq-last';
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const btn = (cls, text) => { const b = el('button', cls, text); b.type = 'button'; return b; };
const sex = (g) => (/^f/i.test(String(g || '')) ? 'f' : /^m/i.test(String(g || '')) ? 'm' : '');

export function mountHalaqah(root, opts = {}) {
  const { audience = 'kids', level = 1, reciters = [], defaultReciter = reciters[0]?.id, localAsr = false, onDone, onExit } = opts;
  const gender = sex(opts.gender);
  const kids = audience === 'kids';
  const young = kids && level <= 2;
  let meta = null, engine = null, started = 0, timer = 0;
  const last = { listen: 'correct', page: 1, pages: 1, reciter: defaultReciter, check: kids ? (young ? 'beginner' : 'intermediate') : 'advanced', ...store.get(KEY, {}) };
  root.classList.add('hq');
  root.replaceChildren();

  // ── 1 · choose ──
  const setup = el('section', 'hq-setup');
  const head = el('div', 'hq-head');
  head.append(el('p', 'hq-kicker', kids ? `Level ${level} · Qur'an` : 'Quran Library'), el('h1', 'hq-h', "Learn Qur'an with the Sheikh"));
  const arT = el('p', 'hq-ar', 'تَعَلَّمِ ٱلْقُرْآنَ مَعَ ٱلشَّيْخ'); arT.lang = 'ar'; arT.dir = 'rtl'; head.append(arT);
  head.append(el('p', 'hq-lede', 'Read from the mushaf to the Sheikh. First choose how he should listen.'));
  const modes = el('div', 'hq-modes'); modes.setAttribute('role', 'radiogroup'); modes.setAttribute('aria-label', 'How the Sheikh listens');
  Object.entries(LISTEN).forEach(([id, m], i) => {
    const b = btn('hq-mode'); b.setAttribute('role', 'radio'); b.dataset.listen = id;
    const n = el('span', 'hq-mode-n', String(i + 1));
    const a = el('span', 'hq-mode-ar', m.ar); a.lang = 'ar'; a.dir = 'rtl';
    b.append(n, el('b', null, m.name), a, el('span', 'hq-mode-t', m.text));
    b.addEventListener('click', () => pick(id));
    modes.append(b);
  });
  const pick = (id) => { last.listen = id; modes.querySelectorAll('.hq-mode').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.listen === id))); };
  const fields = el('div', 'hq-fields');
  const fld = (label, input) => { const l = el('label', 'hq-fld'); l.append(el('span', null, label), input); fields.append(l); return input; };
  const surahSel = fld('Surah', el('select'));
  const pageIn = fld('Mushaf page', Object.assign(el('input'), { type: 'number', min: 1, max: 604, value: last.page }));
  const pagesSel = fld('How many pages', el('select'));
  [1, 2, 3, 5].forEach((n) => pagesSel.append(new Option(n === 1 ? '1 page' : `${n} pages`, n)));
  pagesSel.value = String(last.pages);
  const voiceSel = fld("The Sheikh's recitation", el('select'));
  reciters.forEach((r) => voiceSel.append(new Option(r.name, r.id)));
  if (last.reciter && reciters.some((r) => r.id === last.reciter)) voiceSel.value = last.reciter;
  const checkSel = fld('How strict', el('select'));
  ['beginner', 'intermediate', 'advanced', 'ijazah'].forEach((k) => checkSel.append(new Option(LEVELS[k].name, k)));
  checkSel.value = last.check;
  const where = el('p', 'hq-where');
  const err = el('p', 'hq-err'); err.setAttribute('role', 'alert');
  const go = btn('hq-go', 'Begin, bismillah'), back = btn('hq-back', 'Back');
  const row = el('div', 'hq-row'); row.append(go, back);
  setup.append(head, el('h2', 'hq-h2', 'How should the Sheikh listen?'), modes, el('h2', 'hq-h2', 'What will you read?'), fields, where, err, row);

  // the surah's first page, and the ayahs of a run of pages
  const pageOf = (s) => { let p = 1; meta.pages.forEach((x, i) => { if (x.s < s || (x.s === s && x.a <= 1)) p = i + 1; }); return p; };
  const before = (s, a) => (a > 1 ? { s, a: a - 1 } : s > 1 ? { s: s - 1, a: meta.surahs[s - 2].ayahs } : { s: 1, a: 1 });
  function rangeOf(p, n) {
    const a = meta.pages[p - 1];
    const next = meta.pages[p - 1 + n];
    const b = next ? before(next.s, next.a) : { s: 114, a: 6 };
    return { s1: a.s, a1: a.a, s2: b.s, a2: b.a };
  }
  const nameOf = (s) => meta.surahs[s - 1]?.en ?? `Surah ${s}`;
  function describe() {
    const p = Math.min(604, Math.max(1, Number(pageIn.value) || 1)), n = Number(pagesSel.value);
    const r = rangeOf(p, Math.min(n, 605 - p));
    where.textContent = `Page ${p}${n > 1 ? `–${Math.min(604, p + n - 1)}` : ''}: ${nameOf(r.s1)} ${r.s1}:${r.a1} to ${r.s1 === r.s2 ? '' : nameOf(r.s2) + ' '}${r.s2}:${r.a2}`;
    const s = meta.pages[p - 1].s; if (Number(surahSel.value) !== s) surahSel.value = String(s);
  }
  surahSel.addEventListener('change', () => { pageIn.value = String(pageOf(Number(surahSel.value))); describe(); });
  pageIn.addEventListener('input', describe); pagesSel.addEventListener('change', describe);
  back.addEventListener('click', () => onExit?.());
  pick(last.listen);
  getJson('meta.json').then((m) => {
    meta = m;
    meta.surahs.forEach((s) => surahSel.append(new Option(`${s.n}. ${s.en}`, s.n)));
    describe();
  }).catch(() => { err.textContent = 'The mushaf could not be loaded. Check the connection and try again.'; });

  // ── 2 · the room ──
  const room = el('section', 'hq-room'); room.hidden = true;
  const bar = el('div', 'hq-bar');
  const title = el('b', 'hq-title'), step = el('span', 'hq-step'), clock = el('span', 'hq-clock', '00:00');
  const size = el('div', 'hq-size'); size.setAttribute('role', 'radiogroup'); size.setAttribute('aria-label', 'Text size');
  let textSize = store.get('hq-size', young ? 'large' : 'page');
  [['page', 'Page'], ['large', 'A+'], ['xl', 'A++']].forEach(([id, t]) => {
    const b = btn('hq-size-b', t); b.setAttribute('role', 'radio'); b.dataset.size = id; b.setAttribute('aria-checked', String(id === textSize));
    b.addEventListener('click', () => { textSize = id; store.set('hq-size', id); size.querySelectorAll('button').forEach((x) => x.setAttribute('aria-checked', String(x.dataset.size === id))); engine?.relayout(); });
    size.append(b);
  });
  const end = btn('hq-end', 'End');
  bar.append(title, step, size, clock, end);
  const side = el('aside', 'hq-side');
  const sheikhBox = el('div', 'hq-sheikh'); sheikhBox.dataset.state = 'idle';
  const badge = el('div', 'hq-badge'); badge.setAttribute('aria-hidden', 'true'); badge.append(el('i'), el('i'), el('i'));
  const sAr = el('p', 'hq-s-ar'); sAr.lang = 'ar'; sAr.dir = 'rtl';
  const sEn = el('p', 'hq-s-en');
  sheikhBox.append(badge, el('span', 'hq-s-k', 'The Sheikh'), sAr, sEn);
  const statusP = el('p', 'hq-status'); statusP.setAttribute('aria-live', 'polite');
  const whereP = el('p', 'hq-at');
  const tools = el('div', 'hq-tools');
  const mic = btn('hq-mic', 'Microphone'), hear = btn('hq-tool', '🔊 Hear this ayah'), hint = btn('hq-tool', 'Show the next word');
  tools.append(mic, hear, hint);
  const legend = el('p', 'hq-legend');
  legend.innerHTML = '<span class="g">■ read</span> <span class="r">■ mistake</span> <span class="a">■ shown or given</span>';
  side.append(sheikhBox, statusP, whereP, tools, legend);
  const stage = el('div', 'stage hq-stage');
  const main = el('div', 'hq-main'); main.append(side, stage);
  room.append(bar, main);

  // ── 3 · the report ──
  const report = el('section', 'hq-report'); report.hidden = true;

  root.append(setup, room, report);

  const ui = {
    sheikh(state, ar, en) { sheikhBox.dataset.state = state; sAr.textContent = ar ?? ''; sEn.textContent = en ?? ''; },
    status(text, kind = '') { statusP.textContent = text; statusP.dataset.kind = kind; },
    where(w) { whereP.textContent = w?.label ?? ''; },
    mic(on) { mic.setAttribute('aria-pressed', String(!!on)); mic.textContent = on ? '● Listening' : 'Microphone paused'; },
    progress(p) {
      const st = p.step;
      if (!st) { step.textContent = ''; return; }
      step.textContent = st.kind === 'ayah' ? `Page ${st.page} · learning ${st.label}${st.tries > 1 ? ` · try ${st.tries}` : ''}`
        : st.round > 0 ? `Page ${st.page} · reading it again (round ${st.round})` : `Page ${st.page} · first reading`;
      room.dataset.step = st.kind;
    },
    textSize: () => textSize,
    finished: (res) => done(res),
  };

  go.addEventListener('click', async () => {
    err.textContent = '';
    if (!meta) return;
    const { SR } = getSpeechRecognition({ localAsr, track: true });
    if (!SR) { err.textContent = 'Listening needs Chrome or Edge on a computer, with a microphone.'; return; }
    const p = Math.min(604, Math.max(1, Number(pageIn.value) || 1)), n = Math.min(Number(pagesSel.value), 605 - p);
    Object.assign(last, { page: p, pages: n, reciter: voiceSel.value, check: checkSel.value });
    store.set(KEY, last);
    const range = rangeOf(p, n);
    setup.hidden = true; report.hidden = true; room.hidden = false;
    room.dataset.listen = last.listen;
    title.textContent = LISTEN[last.listen].name;
    hint.hidden = !LEVELS[last.check].hints;
    engine = createEngine({ stage, SR, level: last.check, reciter: last.reciter, gender, ui, young, listen: last.listen });
    started = Date.now();
    clearInterval(timer);
    timer = setInterval(() => { const s = Math.floor((Date.now() - started) / 1000); clock.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }, 1000);
    try { await engine.startReading(range); }
    catch (e) { room.hidden = true; setup.hidden = false; err.textContent = e.message || 'Could not start.'; }
    room.scrollIntoView({ block: 'start' });
  });
  mic.addEventListener('click', () => engine?.toggleMic());
  hear.addEventListener('click', () => engine?.listen());
  hint.addEventListener('click', () => engine?.hint());
  end.addEventListener('click', () => engine?.end());

  async function done(res) {
    clearInterval(timer);
    stopVoice();
    const t = res.tally;
    const pct = t.words ? Math.round((t.first / t.words) * 100) : 0;
    const total = mistakesTotal(t, last.check);
    report.replaceChildren();
    const pr = phrase(t.words ? praiseFor(t.words ? t.first / t.words : 0, t.prompt, t.hint) : 'ahsant', gender);
    const prEl = el('p', 'hq-praise', t.words ? pr.ar : ''); prEl.lang = 'ar'; prEl.dir = 'rtl';
    report.append(el('p', 'hq-kicker', LISTEN[res.listen ?? last.listen].name), el('h2', 'hq-h', t.words ? 'Session complete' : 'No recitation was heard'), prEl);
    const stats = el('div', 'hq-stats');
    for (const [k, v] of [['Ayahs read', res.ayahCount], ['Words', t.words], ['Right first time', `${pct}%`], ['Mistakes', total], ['Minutes', Math.max(1, Math.round(res.ms / 60000))]]) {
      const d = el('div', 'hq-stat'); d.append(el('b', null, String(v)), el('span', null, k)); stats.append(d);
    }
    report.append(stats);
    if (res.pages?.length) {
      const ul = el('ul', 'hq-pages');
      for (const pg of res.pages) {
        const li = el('li', pg.passed ? 'ok' : 'again');
        li.append(el('b', null, `Page ${pg.page}`), el('span', null,
          pg.first < TEACH_AT ? `${pg.first} mistake${pg.first === 1 ? '' : 's'}: read well the first time`
            : pg.passed ? `${pg.first} mistakes at first; taught (${pg.rounds} round${pg.rounds === 1 ? '' : 's'}), then read well`
              : `${pg.first} mistakes at first; taught ${pg.rounds} rounds: go over it again next time`));
        ul.append(li);
      }
      report.append(el('h3', 'hq-h3', 'The pages'), ul);
    }
    if (res.spots?.length) {
      const sp = el('div', 'hq-spots spots');
      report.append(el('h3', 'hq-h3', 'Words to practise'), el('p', 'hq-note', 'Tap a word to hear it from the reciter, then say it after him.'), sp);
      renderSpots(sp, res.spots);
    }
    const sent = el('p', 'hq-note');
    const again = btn('hq-go', 'Read again'), fin = btn('hq-back', 'Done');
    const r2 = el('div', 'hq-row'); r2.append(again, fin);
    report.append(sent, r2);
    again.addEventListener('click', () => { report.hidden = true; setup.hidden = false; root.scrollIntoView({ block: 'start' }); });
    fin.addEventListener('click', () => onExit?.());
    room.hidden = true; report.hidden = false;
    root.scrollIntoView({ block: 'start' });
    engine = null;
    if (onDone && t.words) {
      sent.textContent = kids ? 'Sending to your teacher…' : 'Saving to your account…';
      try { const m = await onDone({ ...res, listen: res.listen ?? last.listen, check: last.check, pct, mistakes: total, minutes: Math.max(1, Math.round(res.ms / 60000)) }); sent.textContent = m || ''; }
      catch { sent.textContent = ''; }
    }
  }

  return {
    stop() { clearInterval(timer); try { engine?.pause(); } catch {} stopVoice(); engine = null; },
    get running() { return !!engine; },
  };
}
