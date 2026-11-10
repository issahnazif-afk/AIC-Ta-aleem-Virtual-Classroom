// My Deen: My du'as, the Sunnah of the day, Our Prophet ﷺ and the special days of the Islamic calendar.
//   mountDeen(root, { tab, level, progress, reciter, earn, flash, onSave }) → { show(tab), stop() }
//     earn(kind, key) → what was earned (the classroom records the Ta'aleem Stars); flash(earned) shows it
// Content: src/lib/deen/*.mjs, checked by scripts/deen/check.mjs. Level 1 hears everything read aloud; the Arabic of
// a du'a is only ever a teacher's recording (Voice Studio), and Qur'an du'as come from the Tanzil text and the reciter.
import { DUAS, CATEGORIES } from './duas.mjs';
import { SUNNAH, sunnahOfDay } from './sunnah.mjs';
import { VIRTUES, DAY, LIFE } from './prophet.mjs';
import { hijri, hijriText, specialOn, upcoming, MONTHS } from './days.mjs';
import { refText, refUrl } from './refs.mjs';
import { narrate, hush } from '../narration.mjs';
import { studioUrl, playUrl, stopSound } from '../voice.mjs';
import { hadithClipId } from '../narration-text.mjs';
import { audioUrl } from '../client.mjs';
import { qpc } from '../recite.mjs';
import { u } from '../url.mjs';

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const btn = (cls, text, label) => { const b = el('button', cls, text); b.type = 'button'; if (label) b.setAttribute('aria-label', label); return b; };
const arEl = (tag, cls, t) => { const e = el(tag, cls, t); e.lang = 'ar'; e.dir = 'rtl'; return e; };
const today = () => new Date().toLocaleDateString('en-CA');

// simple pictures for the cards (no people)
const P = {
  moon: '<path d="M40 10a22 22 0 1 0 14 38A18 18 0 0 1 40 10z" fill="#FBE3A6" stroke="#C9A24A" stroke-width="2"/><circle cx="18" cy="16" r="2" fill="#C9A24A"/><circle cx="12" cy="30" r="1.5" fill="#C9A24A"/>',
  food: '<ellipse cx="32" cy="40" rx="24" ry="9" fill="#FFFDF7" stroke="#C9A24A" stroke-width="2"/><path d="M14 38 Q32 14 50 38" fill="#F6C64B" stroke="#C9A24A" stroke-width="2"/><circle cx="26" cy="30" r="3" fill="#E85A71"/><circle cx="36" cy="27" r="3" fill="#6CBF5A"/>',
  home: '<path d="M10 30 L32 12 L54 30 V54 H10 Z" fill="#FFF9EC" stroke="#0E6B4E" stroke-width="2.5"/><rect x="26" y="36" width="12" height="18" rx="2" fill="#0E6B4E"/><rect x="40" y="34" width="8" height="8" fill="#9FCFE0"/>',
  salah: '<path d="M8 54 H56 V50 Q32 42 8 50 Z" fill="#0E6B4E"/><path d="M14 50 V24 Q32 10 50 24 V50" fill="#E6F2EC" stroke="#C9A24A" stroke-width="2.5"/><path d="M26 34 q6 -6 12 0" fill="none" stroke="#4A90D9" stroke-width="3" stroke-linecap="round"/>',
  masjid: '<rect x="12" y="30" width="40" height="24" fill="#FFF9EC" stroke="#0E6B4E" stroke-width="2"/><path d="M20 30 Q32 10 44 30 Z" fill="#0E6B4E"/><rect x="50" y="14" width="6" height="40" fill="#C9A24A"/><path d="M53 8 v6" stroke="#C9A24A" stroke-width="2"/><path d="M28 54 V44 Q32 38 36 44 V54" fill="#C9A24A"/>',
  people: '<circle cx="22" cy="30" r="14" fill="#FBE3A6" stroke="#C9A24A" stroke-width="2"/><circle cx="42" cy="30" r="14" fill="#E6F2EC" stroke="#0E6B4E" stroke-width="2"/><path d="M26 44 Q32 50 38 44" fill="none" stroke="#E85A71" stroke-width="3" stroke-linecap="round"/>',
  heart: '<path d="M32 54 C 10 40 6 26 16 18 C 24 12 30 18 32 22 C 34 18 40 12 48 18 C 58 26 54 40 32 54 Z" fill="#F4B6C2" stroke="#E85A71" stroke-width="2.5"/>',
  rain: '<path d="M16 32 a12 12 0 0 1 22 -8 a10 10 0 0 1 12 14 H18 a8 8 0 0 1 -2 -6z" fill="#E6F2EC" stroke="#4A90D9" stroke-width="2"/><g stroke="#4A90D9" stroke-width="3" stroke-linecap="round"><path d="M22 46 l-2 6"/><path d="M32 46 l-2 6"/><path d="M42 46 l-2 6"/></g>',
  quran: '<path d="M8 16 Q20 12 32 18 Q44 12 56 16 V50 Q44 46 32 52 Q20 46 8 50 Z" fill="#FFFDF7" stroke="#C9A24A" stroke-width="2.5"/><path d="M32 18 V52" stroke="#C9A24A" stroke-width="2"/><g stroke="#0E6B4E" stroke-width="2" stroke-linecap="round"><path d="M14 26 H26 M14 32 H26 M38 26 H50 M38 32 H50"/></g>',
  star: '<path d="M32 6 L39 24 L58 24 L43 36 L49 55 L32 44 L15 55 L21 36 L6 24 L25 24 Z" fill="#FBE3A6" stroke="#C9A24A" stroke-width="2"/>',
  gift: '<rect x="12" y="26" width="40" height="28" rx="3" fill="#E6F2EC" stroke="#0E6B4E" stroke-width="2"/><rect x="10" y="20" width="44" height="8" rx="2" fill="#0E6B4E"/><path d="M32 20 V54" stroke="#C9A24A" stroke-width="4"/><path d="M32 20 Q22 8 18 16 Q24 20 32 20 Q42 8 46 16 Q40 20 32 20" fill="none" stroke="#C9A24A" stroke-width="2.5"/>',
  bird: '<ellipse cx="30" cy="36" rx="16" ry="12" fill="#9FCFE0" stroke="#4A90D9" stroke-width="2"/><circle cx="44" cy="26" r="8" fill="#9FCFE0" stroke="#4A90D9" stroke-width="2"/><path d="M51 26 l7 2 -7 2z" fill="#F6C64B"/><circle cx="46" cy="24" r="1.6" fill="#0F2A24"/><path d="M20 34 q8 -8 16 0" fill="none" stroke="#4A90D9" stroke-width="2"/>',
  smile: '<circle cx="32" cy="32" r="22" fill="#FBE3A6" stroke="#C9A24A" stroke-width="2.5"/><circle cx="24" cy="27" r="2.6" fill="#0F2A24"/><circle cx="40" cy="27" r="2.6" fill="#0F2A24"/><path d="M22 38 Q32 48 42 38" fill="none" stroke="#0F2A24" stroke-width="3" stroke-linecap="round"/>',
  paw: '<ellipse cx="32" cy="40" rx="12" ry="10" fill="#C9A27A"/><circle cx="18" cy="26" r="5" fill="#C9A27A"/><circle cx="27" cy="18" r="5" fill="#C9A27A"/><circle cx="37" cy="18" r="5" fill="#C9A27A"/><circle cx="46" cy="26" r="5" fill="#C9A27A"/>',
  sun: '<circle cx="32" cy="32" r="12" fill="#F6C64B"/><g stroke="#F6C64B" stroke-width="3.5" stroke-linecap="round"><path d="M32 6v8M32 50v8M6 32h8M50 32h8M13 13l6 6M45 45l6 6M13 51l6-6M45 19l6-6"/></g>',
  leaf: '<path d="M14 50 Q14 14 52 12 Q50 48 14 50 Z" fill="#6CBF5A" stroke="#2E8B57" stroke-width="2"/><path d="M14 50 L44 20" stroke="#2E8B57" stroke-width="2"/>',
  hands: '<path d="M20 54 V30 q0 -6 6 -6 V14 q0 -4 4 -4 t4 4 V24 q6 0 6 6 V54" fill="#FBE3A6" stroke="#C9A24A" stroke-width="2.5" stroke-linejoin="round"/><path d="M26 24 V36 M38 24 V36" stroke="#C9A24A" stroke-width="2"/>',
  shield: '<path d="M32 6 L54 14 V30 Q54 48 32 58 Q10 48 10 30 V14 Z" fill="#E6F2EC" stroke="#0E6B4E" stroke-width="2.5"/><path d="M24 32 l6 6 12-12" fill="none" stroke="#0E6B4E" stroke-width="3.5" stroke-linecap="round"/>',
  scale: '<path d="M32 10 V52 M18 52 H46 M12 20 H52" stroke="#8A5A12" stroke-width="3" stroke-linecap="round"/><path d="M12 20 L4 38 H20 Z M52 20 L44 38 H60 Z" fill="#FBE3A6" stroke="#C9A24A" stroke-width="2"/>',
  water: '<path d="M32 8 Q48 30 48 40 a16 16 0 0 1 -32 0 Q16 30 32 8z" fill="#9FCFE0" stroke="#4A90D9" stroke-width="2.5"/>',
  lantern: '<path d="M32 4 V10" stroke="#C9A24A" stroke-width="2"/><path d="M24 10 H40 L37 16 H27 Z" fill="#C9A24A"/><path d="M26 16 H38 L46 34 L38 52 H26 L18 34 Z" fill="#FBE3A6" stroke="#C9A24A" stroke-width="2.5"/><path d="M28 52 H36 L34 58 H30 Z" fill="#C9A24A"/>',
  mountain: '<path d="M4 54 L24 20 L34 34 L42 24 L60 54 Z" fill="#E8D6B0" stroke="#C9A24A" stroke-width="2"/><circle cx="48" cy="12" r="5" fill="#F6C64B"/>',
  dua: '<path d="M18 54 V32 q0 -8 7 -10 L26 16 q2 -4 5 -1 V30 M46 54 V32 q0 -8 -7 -10 L38 16 q-2 -4 -5 -1 V30" fill="#FBE3A6" stroke="#C9A24A" stroke-width="2.5" stroke-linejoin="round"/><circle cx="32" cy="10" r="3" fill="#C9A24A"/>',
  path: '<path d="M8 54 Q20 30 32 40 T56 12" fill="none" stroke="#C9A24A" stroke-width="3.5" stroke-dasharray="3 6" stroke-linecap="round"/><circle cx="8" cy="54" r="5" fill="#0E6B4E"/><circle cx="56" cy="12" r="5" fill="#0E6B4E"/>',
  calendar: '<rect x="8" y="12" width="48" height="44" rx="5" fill="#FFFDF7" stroke="#0E6B4E" stroke-width="2.5"/><rect x="8" y="12" width="48" height="12" rx="5" fill="#0E6B4E"/><path d="M40 34a8 8 0 1 0 6 13a7 7 0 0 1 -6 -13z" fill="#C9A24A"/>',
};
export const deenIcon = (k, size = 56) => `<svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">${P[k] ?? P.star}</svg>`;

export const TABS = [
  { id: 'duas', title: "My du'as", ar: 'أَدْعِيَتِي', icon: 'dua' },
  { id: 'sunnah', title: 'Sunnah of the day', ar: 'سُنَّةُ الْيَوْمِ', icon: 'sun' },
  { id: 'prophet', title: 'Our Prophet ﷺ', ar: 'نَبِيُّنَا ﷺ', icon: 'path' },
  { id: 'days', title: 'Special days', ar: 'أَيَّامٌ مُبَارَكَةٌ', icon: 'calendar' },
];

export function deenState(progress) {
  const d = (progress.deen ??= {});
  d.learnt ??= {}; d.fav ??= []; d.did ??= {}; d.sunnah ??= {}; d.tried ??= {};
  return d;
}

export function mountDeen(root, { tab = 'duas', level = 1, progress = {}, reciter = 'Alafasy_128kbps', earn, flash, onSave } = {}) {
  const st = deenState(progress);
  const L = level || 1;
  const aloud = L <= 2;   // Levels 1 and 2 hear the cards read aloud when they open them
  root.replaceChildren();
  root.className = 'deen';
  const tabs = el('div', 'dn-tabs'); tabs.setAttribute('role', 'tablist');
  const view = el('div', 'dn-view');
  root.append(tabs, view);
  let cur = tab;
  const cleanup = [];
  const stopAll = () => { hush(); stopSound(); };

  for (const t of TABS) {
    const b = btn('dn-tab'); b.setAttribute('role', 'tab'); b.dataset.tab = t.id;
    b.innerHTML = deenIcon(t.icon, 34);
    b.append(el('b', null, t.title), arEl('span', 'dn-tab-ar', t.ar));
    b.addEventListener('click', () => show(t.id));
    tabs.append(b);
  }

  // ── pieces ──
  function spoken(text, cls = 'dn-en') {
    const p = el('p', cls), words = [];
    for (const w of text.split(/(\s+)/)) { if (!w || /^\s+$/.test(w)) { p.append(document.createTextNode(w)); continue; } const s = el('span', 'w', w); words.push(s); p.append(s); }
    return { p, words };
  }
  // read several lines one after another
  async function read(lines) {
    stopAll();
    const mine = {}; read.cur = mine;
    for (const [text, words] of lines) {
      if (read.cur !== mine) return;
      await new Promise((r) => narrate(text, { voice: 'story', words: words ?? [], onEnd: r }));
    }
  }
  cleanup.push(() => { read.cur = null; });
  const readBtn = (fn) => { const b = btn('btn dn-listen', 'Read it to me'); b.addEventListener('click', fn); return b; };
  const srcLinks = (list) => {
    const p = el('p', 'dn-src');
    list.forEach((r, i) => { if (i) p.append(', '); const a = el('a', null, refText(r)); a.href = refUrl(r); a.target = '_blank'; a.rel = 'noopener'; a.title = 'Read it on sunnah.com'; p.append(a); });
    return p;
  };
  // an ayah from the Tanzil text (public/data/surah), with the reciter
  function ayahBox(q, { big = false } = {}) {
    const list = [q].flat();
    const box = el('div', 'dn-ayah');
    const ar = arEl('p', 'dn-ar quran' + (big ? ' big' : ''), '…');
    const ref = el('p', 'dn-src', list.map((x) => `Qur'an ${x.s}:${x.a}`).join(', '));
    box.append(ar, ref);
    Promise.all(list.map((x) => fetch(u(`data/surah/${String(x.s).padStart(3, '0')}.json`)).then((r) => r.json()).then((sura) => {
      let t = sura.ayahs[x.a - 1].ar;
      if (x.w) t = t.split(' ').slice(x.w[0] - 1, x.w[1]).join(' ');
      return { t: qpc(t), name: sura.en };
    }))).then((rs) => { ar.textContent = rs.map((r) => r.t).join(' '); ref.textContent = list.map((x, i) => `Surah ${rs[i].name} ${x.s}:${x.a}`).join(', '); }).catch(() => { ar.textContent = ''; });
    const play = btn('btn dn-play', 'Listen to the ayah');
    play.addEventListener('click', async () => { stopAll(); for (const x of list) { ar.classList.add('playing'); await playUrl(audioUrl(reciter, x.s, x.a), 90000); ar.classList.remove('playing'); } });
    box.append(play);
    return box;
  }
  function stars(e) { if (e?.stars) flash?.(e); onSave?.(); }
  function back(to) { const b = btn('btn link dn-back', '‹ Back'); b.addEventListener('click', () => { stopAll(); to(); }); return b; }
  function head(title, sub) { const h = el('div', 'dn-head'); h.append(el('h2', 'h2', title)); if (sub) h.append(el('p', 'muted', sub)); return h; }

  // ── My du'as ──
  let duaCat = '';
  function duaList() {
    view.replaceChildren(head("My du'as", 'Tap a du\'a to see it, hear it and learn it. Each one comes from the Qur\'an or a sound hadith.'));
    const mine = DUAS.filter((d) => d.level <= L);
    const chips = el('div', 'dn-chips');
    const cats = [{ id: '', title: 'All', icon: 'star' }, { id: 'fav', title: 'My favourites', icon: 'heart' }, ...CATEGORIES.filter((c) => mine.some((d) => d.cat === c.id))];
    for (const c of cats) {
      const b = btn('dn-chip' + (duaCat === c.id ? ' on' : '')); b.innerHTML = deenIcon(c.icon, 26); b.append(el('span', null, c.title));
      b.addEventListener('click', () => { duaCat = c.id; duaList(); });
      chips.append(b);
    }
    view.append(chips);
    const learnt = mine.filter((d) => st.learnt[d.id]).length;
    view.append(el('p', 'dn-count', `${learnt} of ${mine.length} du'as learnt`));
    const grid = el('div', 'dn-grid');
    const list = mine.filter((d) => (duaCat === 'fav' ? st.fav.includes(d.id) : !duaCat || d.cat === duaCat));
    if (!list.length) grid.append(el('p', 'muted', duaCat === 'fav' ? 'Tap the heart on a du\'a to keep it here.' : 'No du\'as here yet.'));
    for (const d of list) {
      const c = btn('dn-card dua' + (st.learnt[d.id] ? ' done' : ''));
      c.innerHTML = deenIcon(CATEGORIES.find((x) => x.id === d.cat)?.icon, 40);
      c.append(el('b', null, d.when));
      if (d.ar) c.append(arEl('span', 'dn-card-ar', d.ar.split('·')[0].trim()));
      else c.append(el('span', 'dn-card-q', "From the Qur'an"));
      if (st.learnt[d.id]) c.append(el('span', 'dn-tick', '✓ Learnt'));
      c.addEventListener('click', () => duaPage(d, duaList));
      c.addEventListener('pointerenter', (e) => { if (L <= 2 && e.pointerType === 'mouse') { hush(); narrate(d.when, { voice: 'story', words: [] }); } });
      grid.append(c);
    }
    view.append(grid);
  }
  function duaPage(d, ret) {
    stopAll();
    view.replaceChildren(back(ret));
    const card = el('article', 'dn-big dn-dua');
    card.append(el('p', 'dn-kicker', d.when));
    let arP = null;
    if (d.quran) card.append(ayahBox(d.quran, { big: true }));
    else { arP = arEl('p', 'dn-ar big', d.ar); card.append(arP); }
    if (d.times) card.append(el('p', 'dn-times', `Say it ${d.times} times.`));
    card.append(el('p', 'dn-tr', d.tr));
    const en = spoken(d.en); card.append(en.p);
    if (d.src?.length) card.append(srcLinks(d.src));
    const row = el('div', 'dn-row');
    if (arP) {
      const listen = btn('btn dn-play', 'Listen');
      listen.addEventListener('click', async () => {
        stopAll();
        const url = await studioUrl(hadithClipId(d.ar)).catch(() => null);
        if (url) { arP.classList.add('playing'); await playUrl(url, 30000); arP.classList.remove('playing'); }
        else { const n = el('p', 'dn-note', 'Your teacher has not recorded this du\'a yet. Ask them to say it with you.'); card.append(n); setTimeout(() => n.remove(), 5000); }
      });
      row.append(listen);
    }
    row.append(readBtn(() => read([[d.when], [d.en, en.words]])));
    const fav = btn('btn dn-fav' + (st.fav.includes(d.id) ? ' on' : ''), st.fav.includes(d.id) ? '♥ In my favourites' : '♡ Add to my favourites');
    fav.addEventListener('click', () => { st.fav = st.fav.includes(d.id) ? st.fav.filter((x) => x !== d.id) : [...st.fav, d.id]; onSave?.(); duaPage(d, ret); });
    row.append(fav);
    const done = btn('btn btn-primary dn-done', st.learnt[d.id] ? '✓ I learnt it' : 'I learnt it!');
    done.disabled = !!st.learnt[d.id];
    done.addEventListener('click', () => { st.learnt[d.id] = today(); stars(earn?.('dua', `dua:${d.id}`)); duaPage(d, ret); });
    row.append(done);
    card.append(row);
    view.append(card);
    if (aloud) read([[d.when], [d.en, en.words]]);
  }

  // ── Sunnah of the day ──
  function sunnahView() {
    const s = sunnahOfDay(L);
    view.replaceChildren(head('Sunnah of the day', 'Something the Prophet ﷺ did or taught, for you to do today.'));
    view.append(sunnahCard(s, true));
    view.append(el('h3', 'dn-h3', 'More sunnahs to try'));
    const grid = el('div', 'dn-grid');
    for (const x of SUNNAH.filter((y) => y.level <= L && y.id !== s.id)) {
      const c = btn('dn-card' + (st.did[x.id] ? ' done' : ''));
      c.innerHTML = deenIcon('sun', 34); c.append(el('b', null, x.title));
      if (st.did[x.id]) c.append(el('span', 'dn-tick', '✓ Done'));
      c.addEventListener('click', () => { view.replaceChildren(back(sunnahView), sunnahCard(x, false)); });
      grid.append(c);
    }
    view.append(grid);
  }
  function sunnahCard(s, isToday) {
    const card = el('article', 'dn-big dn-sunnah');
    if (isToday) card.append(el('p', 'dn-kicker', `Today, ${new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })}`));
    card.insertAdjacentHTML('beforeend', deenIcon('sun', 72));
    const t = spoken(s.title, 'dn-title'); card.append(t.p);
    const d = spoken(s.do, 'dn-do'); card.append(d.p);
    const h = el('div', 'dn-hadith'); const en = spoken(s.en); h.append(en.p, srcLinks(s.src)); card.append(h);
    const row = el('div', 'dn-row');
    row.append(readBtn(() => read([[s.title, t.words], [s.do, d.words], [s.en, en.words]])));
    const doneToday = st.sunnah[today()] === s.id;
    const b = btn('btn btn-primary dn-done', doneToday || (!isToday && st.did[s.id]) ? "✓ Done, masha'Allah" : 'I did it today!');
    b.disabled = doneToday;
    b.addEventListener('click', () => {
      st.did[s.id] = today();
      if (isToday) { st.sunnah[today()] = s.id; stars(earn?.('sunnah', `sunnah:${s.id}`)); } else onSave?.();
      b.textContent = "✓ Done, masha'Allah"; b.disabled = true;
    });
    row.append(b);
    card.append(row);
    if (aloud) setTimeout(() => read([[s.title, t.words], [s.do, d.words]]), 50);
    return card;
  }

  // ── Our Prophet ﷺ ──
  let pTab = 'character';
  function prophetView() {
    view.replaceChildren(head('Our Prophet Muhammad ﷺ', 'Allah sent him as the best example for us. Learn how he lived, and live a little like him today.'));
    view.append(ayahBox({ s: 33, a: 21, w: [1, 8] }));
    const sub = el('div', 'dn-chips');
    for (const [id, t, ic] of [['character', 'His character', 'heart'], ['day', 'A day like him', 'sun'], ['life', 'His life', 'path']]) {
      const b = btn('dn-chip' + (pTab === id ? ' on' : '')); b.innerHTML = deenIcon(ic, 26); b.append(el('span', null, t));
      b.addEventListener('click', () => { pTab = id; prophetView(); });
      sub.append(b);
    }
    view.append(sub);
    if (pTab === 'character') characterGrid();
    else if (pTab === 'day') dayLine();
    else lifeLine();
  }
  function characterGrid() {
    const grid = el('div', 'dn-grid virtues');
    for (const v of VIRTUES.filter((x) => x.level <= L)) {
      const c = btn('dn-card virtue' + (st.tried[v.id] ? ' done' : ''));
      c.innerHTML = deenIcon(v.icon, 48); c.append(el('b', null, v.title), arEl('span', 'dn-card-ar', v.ar));
      c.addEventListener('click', () => virtuePage(v));
      c.addEventListener('pointerenter', (e) => { if (L <= 2 && e.pointerType === 'mouse') { hush(); narrate(v.title, { voice: 'story', words: [] }); } });
      grid.append(c);
    }
    view.append(grid);
  }
  function virtuePage(v) {
    stopAll();
    view.replaceChildren(back(prophetView));
    const card = el('article', 'dn-big dn-virtue');
    card.insertAdjacentHTML('beforeend', deenIcon(v.icon, 72));
    card.append(el('h2', 'dn-title', v.title), arEl('p', 'dn-ar', v.ar));
    const t = spoken(v.text); card.append(t.p);
    if (v.quran) card.append(ayahBox(v.quran));
    const h = el('div', 'dn-hadith'); const hen = spoken(v.hadith.en); h.append(hen.p, srcLinks([v.hadith.src])); card.append(h);
    let sen = null;
    if (v.story) { const s = el('div', 'dn-story'); s.append(el('p', 'dn-kicker', 'What happened')); sen = spoken(v.story.en); s.append(sen.p, srcLinks([v.story.src])); card.append(s); }
    const todayBox = el('div', 'dn-today'); todayBox.append(el('p', 'dn-kicker', 'What can I do today?')); const td = spoken(v.today, 'dn-do'); todayBox.append(td.p); card.append(todayBox);
    const row = el('div', 'dn-row');
    const lines = () => [[v.title], [v.text, t.words], [v.hadith.en, hen.words], ...(sen ? [[v.story.en, sen.words]] : []), ['What can I do today?'], [v.today, td.words]];
    row.append(readBtn(() => read(lines())));
    const tried = st.tried[v.id] === today();
    const b = btn('btn btn-primary dn-done', tried ? "✓ In sha Allah, I'm trying it" : "I'll try it today!");
    b.disabled = tried;
    b.addEventListener('click', () => { st.tried[v.id] = today(); stars(earn?.('prophet', `prophet:${v.id}`)); b.textContent = "✓ In sha Allah, I'm trying it"; b.disabled = true; });
    row.append(b);
    card.append(row);
    view.append(card);
    if (aloud) read(lines().slice(0, 3));
  }
  const byId = (id) => DUAS.find((d) => d.id === id) ?? SUNNAH.find((s) => s.id === id);
  function dayLine() {
    const ol = el('ol', 'dn-day');
    for (const s of DAY) {
      const li = el('li', 'dn-step');
      li.append(el('span', 'dn-time', s.time), el('b', null, s.title));
      const p = spoken(s.text, 'dn-step-t'); li.append(p.p);
      const links = el('div', 'dn-links');
      for (const id of s.links ?? []) {
        const x = byId(id); if (!x) continue;
        if (x.level > L) continue;
        const isDua = DUAS.includes(x);
        const b = btn('dn-link ' + (isDua ? 'dua' : 'sunnah'), isDua ? `Du'a: ${x.when}` : `Sunnah: ${x.title}`);
        b.addEventListener('click', () => (isDua ? duaPage(x, prophetView) : view.replaceChildren(back(prophetView), sunnahCard(x, false))));
        links.append(b);
      }
      li.append(links);
      const say = btn('dn-say', '🔊', `Read: ${s.title}`); say.addEventListener('click', () => read([[s.title], [s.text, p.words]])); li.append(say);
      ol.append(li);
    }
    view.append(ol);
  }
  function lifeLine() {
    const ol = el('ol', 'dn-life');
    for (const e of LIFE.filter((x) => x.level <= L)) {
      const li = el('li', 'dn-moment');
      li.append(el('span', 'dn-place', e.place), el('b', null, e.title));
      const p = spoken(e.text); li.append(p.p);
      if (e.quran) li.append(ayahBox(e.quran));
      if (e.src) li.append(srcLinks([e.src]));
      const say = btn('dn-say', '🔊', `Read: ${e.title}`); say.addEventListener('click', () => read([[e.title], [e.text, p.words]])); li.append(say);
      ol.append(li);
    }
    view.append(ol);
    view.append(el('p', 'dn-note', 'Every moment here is from the Qur\'an or from Sahih al-Bukhari and Sahih Muslim. Levels 3 and 4 can explore more of the Seerah in the Seerah Quest.'));
  }

  // ── Special days ──
  function daysView() {
    const now = new Date(), h = hijri(now);
    view.replaceChildren(head('Special days', 'The Islamic calendar follows the moon. Here is today, and the blessed days coming up.'));
    const todayCard = el('article', 'dn-big dn-hijri');
    todayCard.insertAdjacentHTML('beforeend', deenIcon('moon', 64));
    todayCard.append(el('p', 'dn-kicker', 'Today is'), el('p', 'dn-title', h ? hijriText(h) : ''), el('p', 'muted', now.toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })));
    const sp = specialOn(now);
    for (const x of sp) { const b = el('div', 'dn-special'); b.innerHTML = deenIcon(x.icon, 40); b.append(el('b', null, x.title), el('p', null, x.text)); if (x.src) b.append(srcLinks([x.src])); todayCard.append(b); }
    if (!sp.length) todayCard.append(el('p', 'dn-do', 'A normal day: a good day to do a sunnah and learn a du\'a.'));
    const r = btn('btn dn-listen', 'Read it to me'); r.addEventListener('click', () => read([[`Today is ${hijriText(h)}.`], ...sp.map((x) => [`${x.title}. ${x.text}`])])); todayCard.append(r);
    view.append(todayCard);
    view.append(el('h3', 'dn-h3', 'Coming up'));
    const list = el('div', 'dn-up');
    for (const x of upcoming(now)) {
      const c = el('div', 'dn-upc'); c.innerHTML = deenIcon(x.day.icon, 36);
      const t = el('div'); t.append(el('b', null, x.day.title), el('span', 'dn-when', `${x.hijri ? `${x.hijri.d} ${MONTHS[x.hijri.m - 1]}` : ''} · ${x.date.toLocaleDateString('en-CA', { month: 'long', day: 'numeric' })} · ${x.inDays === 0 ? 'today' : x.inDays === 1 ? 'tomorrow' : `in ${x.inDays} days`}`), el('p', null, x.day.text));
      if (x.day.src) t.append(srcLinks([x.day.src]));
      c.append(t); list.append(c);
    }
    view.append(list);
    view.append(el('p', 'dn-note', 'Dates follow the Umm al-Qura calendar and can differ by a day from the moon-sighting where you live. Follow your masjid\'s announcement. Every Friday is Jumu\'ah, and Mondays and Thursdays are days the Prophet ﷺ liked to fast.'));
  }

  function show(id) {
    stopAll();
    cur = TABS.some((t) => t.id === id) ? id : 'duas';
    tabs.querySelectorAll('.dn-tab').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === cur)));
    if (cur === 'duas') duaList();
    else if (cur === 'sunnah') sunnahView();
    else if (cur === 'prophet') prophetView();
    else daysView();
    root.scrollIntoView?.({ block: 'start' });
  }
  show(cur);
  return { show, stop() { stopAll(); cleanup.forEach((f) => f()); } };
}
