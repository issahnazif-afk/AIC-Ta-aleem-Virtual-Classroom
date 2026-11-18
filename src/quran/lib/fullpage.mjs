// The app's full-page Quran view, shared by Mushaf, Listen, Recite and the Hifz test.
// The whole mushaf page always fits between the app bar and the controls at the bottom, so nothing needs scrolling:
// fullPage() measures the room left and gives it to the page (--q-avail); fitPaper() then sizes the text to it.
// Also here: the controls' Mistakes, Tajweed and Riwayah buttons, the Mistakes sheet (how mistakes are detected and
// shown, past mistakes, similar phrases), and the alerts a mistake gives (vibration, a sound).
import { store, getJson, pad, lastRead } from './client.mjs';
import { u } from './url.mjs';
import { tajweedPicker } from '../../lib/tajweed-ear/picker.mjs';

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const isApp = () => document.documentElement.dataset.app === '1';
const svg = (d, size = 20) => `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

// ── the page fits the screen ─────────────────────────────────────
// stage: the element the page sits in. bottoms: the bars fixed at the bottom of the screen (their height is left free).
export function fullPage({ stage, bottoms = [] }) {
  if (!isApp() || !stage) return () => {};
  const root = document.documentElement;
  root.classList.add('qfull');
  let last = 0, t = null;
  const measure = () => {
    const bot = Math.max(0, ...bottoms.map((b) => (typeof b === 'string' ? document.querySelector(b) : b)).filter((b) => b && b.getClientRects().length).map((b) => b.offsetHeight));
    root.style.setProperty('--q-bot', `${bot}px`);
    const top = stage.getBoundingClientRect().top + scrollY;
    const avail = Math.max(260, Math.floor(innerHeight - top - bot - 6));
    root.style.setProperty('--q-avail', `${avail}px`);
    if (Math.abs(avail - last) > 3) {
      last = avail;
      clearTimeout(t);
      t = setTimeout(() => dispatchEvent(new Event('resize')), 60);   // the pages lay themselves out again at the new size
    }
  };
  const ro = new ResizeObserver(() => requestAnimationFrame(measure));
  for (const b of [document.getElementById('appbar'), ...bottoms]) { const x = typeof b === 'string' ? document.querySelector(b) : b; if (x) ro.observe(x); }
  for (let x = stage.previousElementSibling; x; x = x.previousElementSibling) ro.observe(x);   // whatever sits above the page
  addEventListener('resize', () => requestAnimationFrame(measure));
  measure();
  return measure;
}

// ── mistakes: how they are shown, and remembered ────────────────
const OPTS = { red: true, vibrate: true, sound: true };
export const mistakeOpts = {
  get() { return { ...OPTS, ...store.get('mistake-opts', {}) }; },
  set(k, v) { const o = this.get(); o[k] = v; store.set('mistake-opts', o); applyOpts(); },
};
function applyOpts() { document.documentElement.classList.toggle('no-red', !mistakeOpts.get().red); }
applyOpts();

let actx = null;
// a short, soft low double tone: noticeable, never harsh
function tone() {
  try {
    actx ??= new (window.AudioContext || window.webkitAudioContext)();
    const t0 = actx.currentTime;
    for (const [f, at] of [[330, 0], [262, 0.11]]) {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0 + at);
      g.gain.exponentialRampToValueAtTime(0.18, t0 + at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + at + 0.14);
      o.connect(g).connect(actx.destination);
      o.start(t0 + at); o.stop(t0 + at + 0.16);
    }
  } catch {}
}
// a word was recited wrongly: the alerts the reader chose, and a note of it for "Past mistakes"
export function onMistake({ key, word } = {}) {
  const o = mistakeOpts.get();
  if (o.vibrate) try { navigator.vibrate?.(120); } catch {}
  if (o.sound) tone();
  if (key && word) {
    const list = store.get('mistakes', []).filter((m) => !(m.k === key && m.w === word));
    list.unshift({ k: key, w: word, t: Date.now() });
    store.set('mistakes', list.slice(0, 300));
  }
}

// ── the sheet ────────────────────────────────────────────────────
// mode: 'mushaf' | 'listen' | 'recite' | 'hifz'. settings: the page's own settings (moved into the sheet).
// start: what "Get started" does. Returns { open, close }.
export function mistakesSheet({ mode, settings = null, scope = '', start, startLabel = 'Bismillah, begin', tajweed = true }) {
  const bg = el('div', 'qsheet-bg'); bg.hidden = true;
  const sh = el('section', 'qsheet');
  sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true'); sh.setAttribute('aria-labelledby', 'qs-title');
  bg.append(sh);
  document.body.append(bg);

  const head = el('div', 'qs-head');
  const close = el('button', 'qs-x'); close.type = 'button'; close.setAttribute('aria-label', 'Close'); close.textContent = '×';
  head.append(el('span', 'qs-grip'), close);
  const body = el('div', 'qs-body');
  const foot = el('div', 'qs-foot');
  const go = el('button', 'qs-go', startLabel); go.type = 'button';
  foot.append(go);
  sh.append(head, body, foot);

  // the main panel
  const main = el('div', 'qs-panel');
  // Ta'aleem's own arch, with the microphone the Sheikh listens through
  const badge = el('div', 'qs-badge'); badge.innerHTML = svg('<rect x="9" y="3" width="6" height="11" rx="3"></rect><path d="M5 11a7 7 0 0 0 14 0M12 18v3"></path>', 30);
  // Recite and the Hifz test lead with what to read (from surah to surah, or ayah to ayah; or following the reader):
  // readers took the sheet for a list of mistake settings and could not find their choice of surahs
  const HEAD = {
    recite: ['ماذا تقرأ', 'What will you recite?', 'Choose a surah and the ayahs, or let the Sheikh follow your recitation from wherever you begin. He follows you word by word, as a teacher would sitting beside you. Ta’aleem never records or keeps your voice.'],
    hifz: ['اختبار الحفظ', 'Set up your Hifz test', 'Choose what the test covers: from surah to surah, or from ayah to ayah within a surah. The Sheikh recites an opening; you carry on from memory. Ta’aleem never records or keeps your voice.'],
  }[settings ? mode : ''] ?? ['كيف يستمع الشيخ', 'How the Sheikh listens', 'Recite from memory and the Sheikh follows you word by word, as a teacher would sitting beside you. Ta’aleem never records or keeps your voice.'];
  const kicker = el('p', 'qs-kicker', HEAD[0]); kicker.lang = 'ar'; kicker.dir = 'rtl';
  const title = el('h2', null, HEAD[1]); title.id = 'qs-title';
  main.append(badge, kicker, title, el('p', 'qs-lede', HEAD[2]));

  const group = (label) => { const g = el('div', 'qs-group'); g.append(el('h3', null, label)); main.append(g); return g; };
  const row = (g, icon, text, { on, locked, soon, note, onChange } = {}) => {
    const r = el('label', 'qs-row' + (soon ? ' soon' : ''));
    const ic = el('span', 'qs-ic'); ic.innerHTML = icon;
    const tx = el('span', 'qs-tx'); tx.append(el('b', null, text)); if (note) tx.append(el('small', null, note));
    const sw = el('input'); sw.type = 'checkbox'; sw.className = 'qs-sw'; sw.setAttribute('role', 'switch');
    sw.checked = !!on; sw.disabled = !!(locked || soon);
    if (onChange) sw.addEventListener('change', () => onChange(sw.checked));
    r.append(ic, tx, sw); g.append(r);
    return sw;
  };
  // the page's own settings (what to recite, how strictly) come first
  if (settings) {
    const g4 = group(mode === 'hifz' ? 'What the test covers' : 'What to recite');
    if (scope) g4.className += ' ' + scope;   // the page's own styles for its settings still apply
    g4.append(settings);
    settings.hidden = false;
  }
  const CHECK = svg('<circle cx="12" cy="12" r="9"></circle><path d="M8 12l3 3 5-6"></path>');
  const g1 = group('What the Sheikh checks');
  row(g1, CHECK, 'Every word, in its place', { on: true, locked: true, note: 'A word is written onto the page only once you say it. A word skipped, changed or added is caught at once.' });
  row(g1, CHECK, 'Ḥarakāt (the vowel marks)', { soon: true, note: 'Coming, in shā’ Allāh, once the listening model can hear them.' });
  // tajweed: whether the Sheikh checks the rules too (the same choice as in Recite and the Hifz test)
  const tjBox = el('div', 'qs-tj');
  g1.append(tjBox);
  if (!settings && tajweed) tajweedPicker(tjBox, { aud: 'adult', key: 'ql-tjcheck', progKey: 'ql-tjc' });   // (a page with its own choice says tajweed: false)

  const o = mistakeOpts.get();
  const g2 = group('When you slip');
  row(g2, svg('<path d="M4 20l4-1L19 8l-3-3L5 16z"></path><path d="M14 7l3 3"></path>'), 'Mark the word in red', { on: o.red, note: 'So you can see at a glance where to go back to.', onChange: (v) => mistakeOpts.set('red', v) });
  const canVibrate = 'vibrate' in navigator;
  row(g2, svg('<rect x="8" y="3" width="8" height="18" rx="2"></rect><path d="M4 8v8M20 8v8"></path>'), 'A gentle buzz', { on: o.vibrate && canVibrate, soon: !canVibrate, note: canVibrate ? 'The phone vibrates briefly.' : 'This device or browser cannot vibrate.', onChange: (v) => mistakeOpts.set('vibrate', v) });
  row(g2, svg('<path d="M4 10v4h4l5 4V6L8 10z"></path><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"></path>'), 'A soft tone', { on: o.sound, note: 'Two quiet, low notes.', onChange: (v) => { mistakeOpts.set('sound', v); if (v) tone(); } });

  const g3 = group('Make it stay with you');
  const link = (icon, text, note, fn) => { const b = el('button', 'qs-row qs-link'); b.type = 'button'; const ic = el('span', 'qs-ic'); ic.innerHTML = icon; const tx = el('span', 'qs-tx'); tx.append(el('b', null, text), el('small', null, note)); b.append(ic, tx, el('i', null, '›')); b.addEventListener('click', fn); g3.append(b); };
  link(svg('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path><path d="M3 3v5h5M12 7v5l3 2"></path>'), 'Words to go back over', 'Every word you slipped on, kept on this device.', () => show(pastPanel()));
  link(svg('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"></path>'), 'Ayahs that look alike (Mutashābihāt)', 'The places most easily mixed up with the ayah you are on.', () => show(similarPanel()));

  // the tajweed choice sits with what is detected (it is inside the page's settings on Recite and Hifz)
  const pageTj = settings?.querySelector('#p-tajweed, #t-tajweed');
  if (pageTj) tjBox.append(pageTj);

  body.append(main);
  function show(panel) { body.replaceChildren(panel); body.scrollTop = 0; foot.hidden = panel !== main; }
  const back = () => { const b = el('button', 'qs-back', '‹ Back'); b.type = 'button'; b.addEventListener('click', () => show(main)); return b; };

  function pastPanel() {
    const p = el('div', 'qs-panel');
    p.append(back(), el('h2', null, 'Words to go back over'));
    const list = store.get('mistakes', []);
    if (!list.length) { p.append(el('p', 'qs-lede', 'Nothing here yet. When you slip on a word in Recite or the Hifz test, it is kept here so you can come back to it.')); return p; }
    p.append(el('p', 'qs-lede', 'Newest first. Tap one to recite that ayah to the Sheikh again.'));
    const byAyah = new Map();
    for (const m of list) { if (!byAyah.has(m.k)) byAyah.set(m.k, []); byAyah.get(m.k).push(m); }
    const ul = el('div', 'qs-list');
    for (const [k, ms] of [...byAyah].slice(0, 60)) {
      const [s, a] = k.split(':').map(Number);
      const it = el('a', 'qs-item'); it.href = u(`practice/?s=${s}&from=${a || 1}&to=${a || 1}`);
      const ar = el('span', 'qs-ar bad', ms.map((m) => m.w).join(' · ')); ar.lang = 'ar'; ar.dir = 'rtl';
      const ref = el('small', null, `${k} · ${ago(ms[0].t)}`);
      getJson(`surah/${pad(s)}.json`).then((x) => { ref.textContent = `${x.en} ${k} · ${ago(ms[0].t)}`; }).catch(() => {});
      it.append(ar, ref); ul.append(it);
    }
    const clear = el('button', 'qs-clear', 'Clear the list'); clear.type = 'button';
    clear.addEventListener('click', () => { if (confirm('Clear this list on this device?')) { store.set('mistakes', []); show(pastPanel()); } });
    p.append(ul, clear);
    return p;
  }

  function similarPanel() {
    const p = el('div', 'qs-panel');
    p.append(back(), el('h2', null, 'Ayahs that look alike'));
    const cur = here ?? lastRead.get() ?? { s: 1, a: 1 };
    const key = `${cur.s}:${cur.a}`;
    const lede = el('p', 'qs-lede', 'Loading…');
    const ul = el('div', 'qs-list');
    p.append(lede, ul);
    (async () => {
      try {
        const [all, sura] = await Promise.all([getJson('mutashabihat.json'), getJson(`surah/${pad(cur.s)}.json`)]);
        const mine = el('div', 'qs-item me');
        const ar = el('span', 'qs-ar', sura.ayahs[cur.a - 1]?.ar ?? ''); ar.lang = 'ar'; ar.dir = 'rtl';
        mine.append(ar, el('small', null, `${sura.en} ${key}: the ayah you are on`));
        const like = all[key] ?? [];
        lede.textContent = like.length
          ? `Ayahs that share a run of the same words with ${sura.en} ${key}, the places most easily mixed up when reciting from memory.`
          : `${sura.en} ${key} has no close look-alikes elsewhere in the Quran.`;
        ul.append(mine);
        for (const [k, n] of like) {
          const [s, a] = k.split(':').map(Number);
          const x = await getJson(`surah/${pad(s)}.json`);
          const it = el('a', 'qs-item'); it.href = u(`page/${x.ayahs[a - 1].page}/?k=${k}`);
          const t = el('span', 'qs-ar', x.ayahs[a - 1].ar); t.lang = 'ar'; t.dir = 'rtl';
          it.append(t, el('small', null, `${x.en} ${k} · ${n} words the same in a row`));
          ul.append(it);
        }
      } catch { lede.textContent = 'The similar phrases could not be loaded. Check your connection and try again.'; }
    })();
    return p;
  }

  let here = null;
  document.addEventListener('ql:pos', (e) => { here = e.detail; });

  let opener = null;
  function open() {
    opener = document.activeElement;
    show(main);
    bg.hidden = false;
    requestAnimationFrame(() => bg.classList.add('on'));
    document.documentElement.classList.add('qsheet-open');
    go.focus({ preventScroll: true });
  }
  function shut() {
    bg.classList.remove('on');
    document.documentElement.classList.remove('qsheet-open');
    setTimeout(() => { bg.hidden = true; }, 220);
    opener?.focus?.({ preventScroll: true });
  }
  close.addEventListener('click', shut);
  bg.addEventListener('click', (e) => { if (e.target === bg) shut(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !bg.hidden) shut(); });
  go.addEventListener('click', () => { store.set('mistakes-seen', true); shut(); start?.(); });
  return { open, close: shut, mode, hasSettings: !!settings, get seen() { return store.get('mistakes-seen', false); } };
}

function ago(t) {
  const d = Math.floor((Date.now() - t) / 86400000);
  return d <= 0 ? 'today' : d === 1 ? 'yesterday' : d < 30 ? `${d} days ago` : new Date(t).toLocaleDateString();
}

// ── the buttons above the controls: Mistakes, Tajweed, Riwayah ──
export function trayPills(box, { sheet, extra = [] } = {}) {
  const make = (label, icon) => { const b = el('button', 'qp'); b.type = 'button'; b.innerHTML = icon; b.append(el('span', null, label)); return b; };
  const out = {};
  if (sheet) {
    // with the page's own settings in it, the pill says what it holds: the surahs and ayahs come first there
    out.mistakes = make(sheet.hasSettings ? (sheet.mode === 'hifz' ? 'Test settings' : 'Surah & ayahs') : 'Mistakes', svg('<path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z"></path><path d="M8.5 12l2.5 2.5 4.5-5"></path>', 16));
    out.mistakes.addEventListener('click', () => sheet.open());
    box.append(out.mistakes);
  }
  // Tajweed colours on the page (Hafs only)
  const scriptSel = document.getElementById('qb-script');
  if (scriptSel) {
    out.tajweed = make('Tajweed', svg('<circle cx="7" cy="8" r="2.5" fill="currentColor"></circle><circle cx="17" cy="8" r="2.5"></circle><circle cx="12" cy="16" r="2.5" fill="currentColor"></circle>', 16));
    const sync = () => {
      const opt = scriptSel.querySelector('option[value="tajweed"]');
      out.tajweed.disabled = !!opt?.disabled;
      out.tajweed.title = opt?.disabled ? 'Tajweed colours are shown for the riwāyah of Ḥafṣ' : 'Tajweed colours';
      out.tajweed.setAttribute('aria-pressed', String(scriptSel.value === 'tajweed'));
    };
    out.tajweed.addEventListener('click', () => {
      scriptSel.value = scriptSel.value === 'tajweed' ? 'plain' : 'tajweed';
      scriptSel.dispatchEvent(new Event('change'));
      sync();
    });
    document.addEventListener('ql:riwayah', sync);
    sync();
    box.append(out.tajweed);
  }
  // Riwayah: a short list to choose from; the page and any recitation playing change at once
  const rwSel = document.getElementById('qb-riwayah');
  if (rwSel) {
    const wrap = el('div', 'qp-wrap');
    out.riwayah = make('Riwayah', svg('<path d="M4 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H4z"></path><path d="M20 5h-4a3 3 0 0 0-3 3"></path>', 16));
    out.riwayah.setAttribute('aria-haspopup', 'true'); out.riwayah.setAttribute('aria-expanded', 'false');
    const menu = el('div', 'qp-menu'); menu.hidden = true; menu.setAttribute('role', 'menu');
    const name = () => rwSel.selectedOptions[0]?.textContent ?? 'Riwayah';
    const label = out.riwayah.querySelector('span');
    const syncName = () => { label.textContent = rwSel.value === 'hafs' ? 'Riwayah' : name().split(' ')[0]; out.riwayah.title = `Riwāyah: ${name()}`; };
    const fill = () => menu.replaceChildren(...[...rwSel.options].map((o) => {
      const b = el('button', 'qp-opt', o.textContent); b.type = 'button'; b.setAttribute('role', 'menuitemradio');
      b.setAttribute('aria-checked', String(o.value === rwSel.value));
      b.addEventListener('click', () => {
        toggle(false);
        if (rwSel.value === o.value) return;
        rwSel.value = o.value; rwSel.dispatchEvent(new Event('change'));
        syncName();
      });
      return b;
    }));
    const toggle = (on) => { menu.hidden = !on; out.riwayah.setAttribute('aria-expanded', String(on)); if (on) { fill(); menu.querySelector('[aria-checked="true"]')?.focus(); } };
    out.riwayah.addEventListener('click', (e) => { e.stopPropagation(); toggle(menu.hidden); });
    document.addEventListener('click', (e) => { if (!menu.hidden && !wrap.contains(e.target)) toggle(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { toggle(false); out.riwayah.focus(); } });
    document.addEventListener('ql:riwayah', syncName);
    syncName();
    wrap.append(out.riwayah, menu);
    box.append(wrap);
  }
  for (const x of extra) box.append(x);
  return out;
}
