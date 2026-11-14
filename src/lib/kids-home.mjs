// The Classroom home for every level: one calm scene (a forest night sky over a mosque and palm skyline, drawn for
// Ta'aleem) with a short greeting and big labelled places to tap. Nothing else is on the page: details appear only
// after a place is opened (the redesign kit, Phase 2: "what should I do next?" first, everything else one tap away).
//   mountKidsHome(root, { level, name, hijri, special, places, next, missions, card, onClassic }) → { stop() }
//     places:   [{ id, title, ar?, text?, icon (html), open?, children?: places }]
//     next:     { title, text?, icon?, open } — the one prominent next action (the last activity opened), or null
//     missions: { list: [{ title, done }], open } — today's missions (Levels 3 and 4)
//     card:     { name, level, stars, badges, palms } — the student card (Levels 3 and 4)
// Levels 3 and 4 have a two-column layout: the greeting, "Your next step" and the numbered subjects on the left;
// this week's moon, today's missions and the student card on the right (stacked on a phone).
// Levels 1 and 2 (young readers): pointing at a place says its name; on a touch screen the first tap says it and the
// second opens it. Levels 3 and 4: one tap opens, and an opened subject shows its activities with a line each.
import { narrate, hush } from './narration.mjs';
import { icon } from './home-icons.mjs';
import { u } from './url.mjs';

// Levels 1 and 2 (the young learners' style): the school's own Canva picture, a sunny mosque courtyard, under a soft veil
const picture = () => '<picture class="kh-scene"><source media="(max-width: 700px)" srcset="' + u('img/home/scene-phone.webp') + '"><img src="' + u('img/home/scene-wide.webp') + '" alt="" width="1600" height="992" decoding="async" fetchpriority="high"></picture><div class="kh-veil" aria-hidden="true"></div>';

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

// the scene: drawn once, with fixed star positions (no random sparkle, no animation)
let SCENE = null;
function scene() {
  if (SCENE) return SCENE;
  let seed = 7; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  let stars = '';
  for (let i = 0; i < 70; i++) { const x = r() * 1600, y = r() * 430, s = r() < 0.15 ? 1.6 : 0.9; stars += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${s}" opacity="${(0.35 + r() * 0.5).toFixed(2)}"/>`; }
  const win = (x, y) => `<path d="M${x} ${y + 26}v-16a6 6 0 0 1 12 0v16z" fill="#D9B86A" opacity=".3"/>`;
  const palm = (x, s = 1) => `<g transform="translate(${x} 760) scale(${s})"><path d="M0 0c-2-30 2-60 8-84" stroke="#0B211A" stroke-width="7" fill="none" stroke-linecap="round"/><g fill="#0B211A"><path d="M8-84c-20-8-44-2-58 14 18-6 36-8 58-14z"/><path d="M8-84c20-10 44-6 58 8-18-4-38-4-58-8z"/><path d="M8-84c-10-16-30-24-50-20 18 4 34 10 50 20z"/><path d="M8-84c8-18 26-28 46-28-16 8-30 16-46 28z"/></g></g>`;
  SCENE = `<svg class="kh-sky" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
<rect width="1600" height="900" fill="#12302A"/><rect width="1600" height="420" fill="#0E2620" opacity=".55"/>
<g fill="#F4ECD6">${stars}</g>
<path d="M1490 52a30 30 0 1 0 22 51 25 25 0 1 1-22-51z" fill="#E6D3A0"/>
<path d="M0 790c180-40 340-46 520-26s400 10 560-14 360-30 520 2V900H0z" fill="#0F2A22"/>
<g fill="#0D241D">
  <rect x="610" y="640" width="380" height="150"/>
  <path d="M680 640a120 110 0 0 1 240 0z"/><rect x="797" y="512" width="6" height="22"/>
  <path d="M610 676a42 38 0 0 1 84 0zM906 676a42 38 0 0 1 84 0z"/>
  <rect x="560" y="560" width="30" height="230"/><path d="M556 560h38l-19-44z"/><rect x="1010" y="560" width="30" height="230"/><path d="M1006 560h38l-19-44z"/>
  <rect x="300" y="700" width="140" height="90"/><path d="M318 700a52 46 0 0 1 104 0z"/><rect x="1180" y="706" width="130" height="84"/><path d="M1196 706a49 44 0 0 1 98 0z"/>
</g>
${win(650, 700)}${win(690, 700)}${win(898, 700)}${win(938, 700)}<path d="M782 790v-44a18 18 0 0 1 36 0v44z" fill="#D9B86A" opacity=".28"/>
${palm(200, 1.1)}${palm(470, .85)}${palm(1120, .9)}${palm(1420, 1.15)}
<rect y="786" width="1600" height="114" fill="#0B211A"/>
</svg>`;
  return SCENE;
}

// the moon on a Hijri day (1 to 30): a lit part drawn from the phase, waxing on the right
function moonSvg(day) {
  const f = Math.min(Math.max((day - 0.5) / 29.53, 0), 1);
  const rx = (Math.abs(Math.cos(2 * Math.PI * f)) * 10).toFixed(2);
  const waxing = f <= 0.5, crescent = f < 0.25 || f > 0.75;
  const outer = waxing ? 1 : 0, term = waxing ? (crescent ? 0 : 1) : (crescent ? 1 : 0);
  return `<svg viewBox="-12 -12 24 24" width="24" height="24" aria-hidden="true" focusable="false"><circle r="10" fill="rgba(247,244,234,.12)"/><path d="M0 -10A10 10 0 0 ${outer} 0 10A${rx} 10 0 0 ${term} 0 -10z" fill="#DCC48E"/></svg>`;
}
const hijriDay = (d) => { try { return Number(new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric' }).format(d)); } catch { return 0; } };
// this week, Saturday to Friday, with today marked
function moonWeek() {
  const box = el('section', 'kh-box kh-moon'); box.setAttribute('aria-labelledby', 'kh-moon-h');
  const h = el('h2', 'kh-box-h', "This week's moon"); h.id = 'kh-moon-h';
  const ol = el('ol', 'kh-week');
  const today = new Date(); today.setHours(12, 0, 0, 0);
  const sat = new Date(today); sat.setDate(today.getDate() - ((today.getDay() + 1) % 7));
  for (let i = 0; i < 7; i++) {
    const d = new Date(sat); d.setDate(sat.getDate() + i);
    const hd = hijriDay(d);
    const li = el('li', 'kh-day');
    if (d.toDateString() === today.toDateString()) { li.classList.add('today'); li.setAttribute('aria-current', 'date'); }
    li.innerHTML = hd ? moonSvg(hd) : '';
    li.append(el('span', 'kh-day-w', d.toLocaleDateString('en-GB', { weekday: 'short' })));
    if (hd) li.append(el('span', 'kh-day-n', String(hd)));
    li.title = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    ol.append(li);
  }
  box.append(h, ol);
  return box;
}

export function mountKidsHome(root, { level = 1, name = '', hijri = '', special = [], places = [], next = null, missions = null, card = null, onClassic } = {}) {
  const young = level <= 2;
  root.replaceChildren();
  root.className = 'kh kh-l' + level + (young ? ' kh-young' : ' kh-older');
  const stage = el('div', 'kh-stage');
  stage.innerHTML = young ? picture() : scene();
  const top = el('div', 'kh-top');
  if (!young && hijri) top.append(el('p', 'kh-kicker', `${new Date().toLocaleDateString('en-GB', { weekday: 'long' })} · ${hijri}`));
  const hi = el('h1', 'kh-hi'); hi.append('Assalamu alaikum', name ? ', ' : '', el('em', null, name ? `${name}` : ''));
  top.append(hi);
  if (young && hijri) top.append(el('p', 'kh-date', hijri));
  for (const s of special) top.append(el('p', 'kh-special', `Today: ${s.title}`));
  const head = el('div', 'kh-group'); head.hidden = true;
  const grid = el('div', 'kh-places');
  let render;   // set below
  let shelf = null;
  if (young) {
    // Levels 1 and 2: a greeting that speaks, one big "Play again", the main places on a gentle wave and the
    // smaller places (those marked shelf) on a shelf underneath
    const wrap = el('div', 'kh-ywrap');
    const left = el('div', 'kh-yleft kh-hide-sub');
    const bubble = el('div', 'kh-bubble');
    const words = el('div', 'kh-bubble-w');
    words.append(top);
    const tip = el('p', 'kh-tip', 'Tap a picture to hear it.');
    words.append(tip);
    const say = el('button', 'kh-say'); say.type = 'button'; say.setAttribute('aria-label', 'Say it');
    say.innerHTML = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
    say.addEventListener('click', () => { hush(); narrate(`Assalamu alaikum${name ? ', ' + name : ''}! Tap a picture to hear it.`, { voice: 'story', words: [] }); });
    bubble.append(words, say);
    left.append(bubble);
    const first = places.find((p) => !p.shelf && p.open);
    const again = next?.open ? next : first ? { title: first.title, ar: first.ar, icon: first.icon, open: first.open } : null;
    if (again) {
      const card = el('div', 'kh-again');
      if (again.icon) { const pic = el('span', 'kh-again-pic'); pic.innerHTML = again.icon; card.append(pic); }
      card.append(el('span', 'kh-again-k', next?.open ? 'Play again' : 'Start here'), el('b', 'kh-again-t', again.title));
      if (again.ar && level >= 2) { const a = el('span', 'kh-again-ar', again.ar); a.lang = 'ar'; a.dir = 'rtl'; card.append(a); }
      const play = el('button', 'kh-again-go'); play.type = 'button'; play.setAttribute('aria-label', `Play ${again.title}`);
      play.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z"/></svg>';
      play.append('Play');
      play.addEventListener('click', () => { hush(); again.open(); });
      card.append(play);
      left.append(card);
    }
    const right = el('div', 'kh-yright');
    shelf = el('div', 'kh-shelf kh-hide-sub');
    right.append(head, grid, shelf);
    wrap.append(left, right);
    stage.append(wrap);
  } else {
    // Levels 3 and 4: the next step, the subjects, and the side column
    const wrap = el('div', 'kh-wrap');
    const main = el('div', 'kh-main');
    const step = el('section', 'kh-step'); step.setAttribute('aria-labelledby', 'kh-step-h');
    const firstSubject = places.find((p) => p.children?.length);
    const go = next?.open ? next : firstSubject ? { title: `Start with ${firstSubject.title}`, text: firstSubject.text, icon: firstSubject.icon, open: () => render(firstSubject.children, firstSubject) } : null;
    if (go) {
      const words = el('div', 'kh-step-words');
      words.append(el('span', 'kh-step-k', next?.open ? 'Your next step' : 'Begin here'));
      const sh = el('h2', 'kh-step-h', go.title); sh.id = 'kh-step-h'; words.append(sh);
      if (go.text) words.append(el('p', 'kh-step-t', go.text));
      const acts = el('div', 'kh-step-acts');
      const b = el('button', 'kh-step-go'); b.type = 'button'; b.append(next?.open ? 'Carry on' : 'Open');
      b.addEventListener('click', () => { hush(); go.open(); });
      const other = el('button', 'kh-step-other', 'Choose something else'); other.type = 'button';
      other.addEventListener('click', () => grid.querySelector('.kh-place')?.focus());
      acts.append(b, other);
      words.append(acts);
      step.append(words);
      if (go.icon) { const ic = el('span', 'kh-step-ic'); ic.innerHTML = go.icon; step.append(ic); }
    } else { step.hidden = true; step.dataset.off = '1'; }
    const subH = el('h2', 'kh-box-h kh-subjects-h', 'All subjects');
    main.append(top, step, subH, head, grid);
    const side = el('aside', 'kh-side'); side.setAttribute('aria-label', 'This week');
    side.append(moonWeek());
    if (missions?.list?.length) {
      const box = el('section', 'kh-box kh-missions'); box.setAttribute('aria-labelledby', 'kh-mis-h');
      const hh = el('div', 'kh-box-row');
      const h2 = el('h2', 'kh-box-h', "Today's missions"); h2.id = 'kh-mis-h';
      const done = missions.list.filter((m) => m.done).length;
      hh.append(h2, el('span', 'kh-box-n', `${done} of ${missions.list.length}`));
      const ul = el('ul', 'kh-mis');
      for (const m of missions.list) {
        const li = el('li', m.done ? 'done' : '');
        const tick = el('span', 'kh-tick');
        if (m.done) { tick.setAttribute('role', 'img'); tick.setAttribute('aria-label', 'Done'); }
        const words = el('span', 'kh-mis-w'); words.append(el('b', null, m.title));
        if (m.text) words.append(el('small', null, m.text));
        li.append(tick, words);
        ul.append(li);
      }
      box.append(hh, ul);
      if (missions.open) { const ob = el('button', 'kh-box-link', 'See the missions'); ob.type = 'button'; ob.addEventListener('click', () => { hush(); missions.open(); }); box.append(ob); }
      side.append(box);
    }
    if (card) {
      const c = el('section', 'kh-card'); c.setAttribute('aria-label', 'My student card');
      const row = el('div', 'kh-card-top');
      const logo = el('img', 'kh-card-logo'); logo.src = u('img/taaleem-logo.webp'); logo.alt = ''; logo.width = 36; logo.height = 38;
      const who = el('div', 'kh-card-who'); who.append(el('span', 'kh-card-k', 'Student card'), el('b', null, card.name));
      row.append(logo, who, el('span', 'kh-card-lv', card.level));
      const dl = el('dl', 'kh-card-figs');
      for (const [k, v] of [['Stars', card.stars], ['Badges', card.badges], ['Palms grown', card.palms]]) { const d = el('div'); d.append(el('dt', null, k), el('dd', null, String(v ?? 0))); dl.append(d); }
      c.append(row, dl);
      side.append(c);
    }
    wrap.append(main, side);
    stage.append(wrap);
  }
  root.append(stage);
  if (onClassic) {
    const c = el('button', 'btn link kh-classic', 'Grown-up view: see every activity as a list');
    c.type = 'button'; c.addEventListener('click', () => { hush(); onClassic(); });
    root.append(c);
  }

  let armed = null, lastPointer = 'mouse';
  const sayIt = (p, b) => {
    if (!young) return;
    hush();
    b.classList.remove('bounce'); void b.offsetWidth; b.classList.add('bounce');
    narrate(p.say ?? p.title.replace('ﷺ', 'sallallahu alayhi wa sallam'), { voice: 'story', words: [] });
  };
  render = function (list, parent) {
    grid.replaceChildren();
    armed = null;
    top.hidden = !!parent;
    head.hidden = !parent;
    stage.querySelectorAll('.kh-step, .kh-subjects-h, .kh-hide-sub').forEach((x) => { if (!x.dataset.off) x.hidden = !!parent; });
    if (shelf) shelf.replaceChildren();
    grid.classList.toggle('kh-sub', !!parent);
    if (parent) {
      head.replaceChildren();
      const back = el('button', 'kh-backbtn'); back.type = 'button';
      back.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
      back.append(young ? 'Back' : 'All subjects');
      back.addEventListener('click', () => { hush(); render(places, null); grid.querySelector(`[data-place="${parent.id}"]`)?.focus(); });
      const h = el('h2', 'kh-group-h', parent.title);
      head.append(back, h);
      if (parent.ar) { const a = el('p', 'kh-group-ar', parent.ar); a.lang = 'ar'; a.dir = 'rtl'; head.append(a); }
      if (parent.text) head.append(el('p', 'kh-group-t', parent.text));
      setTimeout(() => back.focus({ preventScroll: true }), 0);
    }
    list.forEach((p, i) => {
      const b = el('button', 'kh-place'); b.type = 'button'; b.dataset.place = p.id;
      if (!young && !parent) b.append(el('span', 'kh-n', String(i + 1).padStart(2, '0')));
      // Levels 3 and 4: a subject with its own painting (art) is shown as the picture alone; its name pops up when
      // the pointer rests on it or it has keyboard focus (on a touch screen, where nothing hovers, it sits on the picture)
      const art = !young && !parent && p.art;
      if (art) b.classList.add('kh-art');
      const ic = el('span', 'kh-ic');
      if (art) { const img = el('img'); img.src = p.art; img.alt = ''; img.width = 166; img.height = 248; img.decoding = 'async'; ic.append(img); }
      else ic.innerHTML = p.icon ?? icon('stories');
      if (p.color) ic.style.setProperty('--c', p.color);
      const label = el('span', 'kh-label' + (p.logo ? ' kh-sr' : '') + (art ? ' kh-pop' : '')); label.append(el('b', null, p.title));   // a picture that carries its own name: the label is for screen readers
      if (p.pic) ic.classList.add('kh-pic');
      if (p.ar && level >= 2) { const a = el('span', 'kh-ar', p.ar); a.lang = 'ar'; a.dir = 'rtl'; label.append(a); }
      if (parent && p.text && !young) label.append(el('span', 'kh-text', p.text));
      b.append(ic, label);
      if (p.children) b.setAttribute('aria-label', `${p.title}: ${p.children.length} activities`);
      b.addEventListener('pointerdown', (e) => { lastPointer = e.pointerType; });
      b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') sayIt(p, b); });
      b.addEventListener('click', () => {
        // young readers on a touch screen: the first tap says the name, the second opens it
        if (young && lastPointer === 'touch' && armed !== p.id) { armed = p.id; grid.querySelectorAll('.kh-place').forEach((x) => x.classList.toggle('armed', x === b)); sayIt(p, b); return; }
        hush();
        if (p.children) render(p.children, p);
        else p.open?.();
      });
      (shelf && !parent && p.shelf ? shelf : grid).append(b);
    });
  };
  render(places, null);
  return { stop() { hush(); } };
}
