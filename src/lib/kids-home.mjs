// The Classroom home for every level: one calm scene (a forest night sky over a mosque and palm skyline, drawn for
// Ta'aleem) with a short greeting and big labelled places to tap. Nothing else is on the page: details appear only
// after a place is opened (the redesign kit, Phase 2: "what should I do next?" first, everything else one tap away).
//   mountKidsHome(root, { level, name, hijri, special, places, next, missions, card, onClassic }) → { stop() }
//     places:   [{ id, title, ar?, text?, icon (html), open?, children?: places }]
//     next:     { title, text?, icon?, open } — the one prominent next action (the last activity opened), or null
//     missions: { list: [{ title, done }], open } — today's missions (Levels 3 and 4)
//     card:     { name, level, stars, badges, palms } — the student card (Levels 3 and 4)
// Levels 3 and 4 have a two-column layout: the greeting, "Your next step" and the subjects as picture cards on the
// left; this week's moon, today's missions and the student card on the right (stacked on a phone).
//     card.open: opens My achievements (the card is then a button)
// Levels 1 and 2 (young readers): pointing at a place says its name; on a touch screen the first tap says it and the
// second opens it. Levels 3 and 4: one tap opens, and an opened subject shows its activities with a line each.
import { narrate, hush } from './narration.mjs';
import { icon } from './home-icons.mjs';
import { u } from './url.mjs';

// Levels 1 and 2 (the young learners' style): the school's own Canva picture, a sunny mosque courtyard, under a soft veil
const picture = () => '<picture class="kh-scene"><source media="(max-width: 700px)" srcset="' + u('img/home/scene-phone.webp') + '"><img src="' + u('img/home/scene-wide.webp') + '" alt="" width="1600" height="992" decoding="async" fetchpriority="high"></picture><div class="kh-veil" aria-hidden="true"></div>';

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

// The scene (Levels 3 and 4): a green night over a mosque by the water, with lit windows, palms and their reflection.
// Drawn once, with fixed star positions; nothing moves.
let SCENE = null;
function scene() {
  if (SCENE) return SCENE;
  let seed = 7; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  let stars = '', sparks = '';
  for (let i = 0; i < 90; i++) { const x = r() * 1600, y = r() * 470, s = r() < 0.15 ? 1.7 : 0.9; stars += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${s}" opacity="${(0.3 + r() * 0.55).toFixed(2)}"/>`; }
  for (const [x, y, s] of [[110, 60, 9], [1040, 54, 7], [1552, 140, 8], [40, 150, 5], [640, 120, 5], [1250, 300, 6], [1500, 420, 5], [300, 380, 4]]) sparks += `<path d="M${x} ${y - s}Q${x + s * 0.18} ${y - s * 0.18} ${x + s} ${y}Q${x + s * 0.18} ${y + s * 0.18} ${x} ${y + s}Q${x - s * 0.18} ${y + s * 0.18} ${x - s} ${y}Q${x - s * 0.18} ${y - s * 0.18} ${x} ${y - s}z"/>`;
  // an onion dome standing on (x, y) with half-width w, and its crescent finial
  const dome = (x, y, w, h = w * 1.45) => `<path d="M${x - w} ${y}C${x - w} ${y - h * 0.55} ${x - w * 0.25} ${y - h * 0.78} ${x} ${y - h}C${x + w * 0.25} ${y - h * 0.78} ${x + w} ${y - h * 0.55} ${x + w} ${y}z"/><rect x="${x - 1.5}" y="${y - h - 16}" width="3" height="16"/><circle cx="${x}" cy="${y - h - 20}" r="4"/>`;
  const minaret = (x, top, w = 13) => `<rect x="${x - w}" y="${top + 40}" width="${w * 2}" height="${800 - top - 40}"/><rect x="${x - w - 6}" y="${top + 70}" width="${w * 2 + 12}" height="8"/><rect x="${x - w - 4}" y="${top + 150}" width="${w * 2 + 8}" height="7"/>${dome(x, top + 40, w + 2, 40)}`;
  const arch = (x, y, w, h) => `<path d="M${x} ${y + h}v-${h - w / 2}a${w / 2} ${w / 2} 0 0 1 ${w} 0v${h - w / 2}z"/>`;
  const palm = (x, base, s = 1) => `<g transform="translate(${x} ${base}) scale(${s})"><path d="M0 0c-3-34 2-70 10-100" stroke="currentColor" stroke-width="7" fill="none" stroke-linecap="round"/><g><path d="M10-100c-22-10-50-4-66 16 20-8 42-10 66-16z"/><path d="M10-100c22-12 50-8 66 8-20-4-44-4-66-8z"/><path d="M10-100c-12-18-34-28-58-24 20 4 40 12 58 24z"/><path d="M10-100c10-20 30-32 54-32-18 9-36 18-54 32z"/><path d="M10-100c-4-16-2-30 8-44-2 14-4 28-8 44z"/></g></g>`;
  // the town: one group, drawn again upside down in the water
  const town = `<g id="kh-town" fill="#0A3324" color="#0A3324">
  <rect x="560" y="690" width="480" height="110"/><rect x="640" y="640" width="320" height="60"/>
  ${dome(800, 645, 105, 150)}${dome(668, 690, 46, 70)}${dome(932, 690, 46, 70)}${minaret(585, 455)}${minaret(1015, 455)}
  <rect x="250" y="728" width="190" height="72"/>${dome(345, 730, 58, 86)}${minaret(255, 610, 10)}
  <rect x="1160" y="722" width="210" height="78"/>${dome(1265, 724, 62, 92)}${minaret(1385, 600, 10)}
  ${palm(60, 800, 1.25)}${palm(170, 800, 0.95)}${palm(480, 800, 0.8)}${palm(1110, 800, 0.85)}${palm(1470, 800, 1.2)}${palm(1560, 800, 0.95)}
</g>`;
  const lit = `<g fill="#F2C76A">
  ${[600, 632, 664, 920, 952, 984].map((x) => arch(x, 722, 16, 34)).join('')}${arch(781, 712, 38, 88)}
  ${[704, 738, 846, 880].map((x) => arch(x, 660, 12, 24)).join('')}
  ${[290, 322, 356, 388].map((x) => arch(x, 752, 11, 26)).join('')}${[1205, 1237, 1285, 1317].map((x) => arch(x, 748, 11, 28)).join('')}
  ${[579, 1009].map((x) => arch(x, 560, 12, 22)).join('')}
</g>`;
  SCENE = `<svg class="kh-sky" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
<defs>
  <linearGradient id="kh-g-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#01241A"/><stop offset=".5" stop-color="#03301F"/><stop offset=".78" stop-color="#0F5232"/><stop offset=".88" stop-color="#1B6A3F"/><stop offset="1" stop-color="#0A2E20"/></linearGradient>
  <radialGradient id="kh-g-glow" cx=".5" cy=".82" r=".55"><stop offset="0" stop-color="#3FA066" stop-opacity=".45"/><stop offset="1" stop-color="#3FA066" stop-opacity="0"/></radialGradient>
  <linearGradient id="kh-g-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0E3D29"/><stop offset="1" stop-color="#061C13"/></linearGradient>
  <filter id="kh-f-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<rect width="1600" height="900" fill="url(#kh-g-sky)"/><rect width="1600" height="900" fill="url(#kh-g-glow)"/>
<g fill="#F6EFD8">${stars}</g><g fill="#F6EFD8" opacity=".85">${sparks}</g>
<path d="M0 790c160-20 300-24 470-12s380 4 540-6 380-18 590 3V830H0z" fill="#0C3F2A" opacity=".7"/>
<g transform="translate(800 830) scale(.62) translate(-800 -800)">
  ${town}
  <g filter="url(#kh-f-glow)" opacity=".9">${lit}</g>
</g>
<g transform="translate(-200 830) scale(.62) translate(-800 -800)" opacity=".9"><use href="#kh-town"/></g>
<g transform="translate(1800 830) scale(.62) translate(-800 -800)" opacity=".9"><use href="#kh-town"/></g>
<rect y="830" width="1600" height="70" fill="url(#kh-g-water)"/>
<g opacity=".22" transform="translate(800 830) scale(.62 -.62) translate(-800 -800)"><use href="#kh-town"/><g opacity=".6">${lit}</g></g>
<g stroke="#F2C76A" stroke-linecap="round" opacity=".3"><path d="M770 846h60M750 860h30M820 860h40M780 874h44M640 850h24M940 850h24" stroke-width="2"/></g>
<rect y="830" width="1600" height="2" fill="#2F7A4E" opacity=".5"/>
</svg>`;
  return SCENE;
}
// small line icons for the Levels 3 and 4 home
const SVG = (d, w = 20) => `<svg viewBox="0 0 24 24" width="${w}" height="${w}" aria-hidden="true" focusable="false">${d}</svg>`;
const ICO = {
  sun: SVG('<circle cx="12" cy="12" r="4.5" fill="#F2C14E"/><g stroke="#F2C14E" stroke-width="2" stroke-linecap="round"><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/></g>'),
  cap: SVG('<path d="M12 4 1.5 9 12 14l8.5-4v6h2V9z" fill="#14402F"/><path d="M5.5 12.2v4.3c0 1.7 3 3.5 6.5 3.5s6.5-1.8 6.5-3.5v-4.3L12 15.3z" fill="#14402F"/>', 34),
  star: SVG('<path d="m12 2.6 2.9 6 6.5.8-4.8 4.5 1.2 6.5L12 17.2l-5.8 3.2 1.2-6.5L2.6 9.4l6.5-.8z" fill="#F2B632"/>', 22),
  trophy: SVG('<path d="M7 3h10v5a5 5 0 0 1-10 0z" fill="#E0A526"/><path d="M7 5H3.5v1.5A3.5 3.5 0 0 0 7 10M17 5h3.5v1.5A3.5 3.5 0 0 1 17 10" stroke="#E0A526" stroke-width="1.8" fill="none"/><path d="M10.5 13h3v4h-3z" fill="#C98F1B"/><rect x="7.5" y="17" width="9" height="3.5" rx="1" fill="#C98F1B"/>', 22),
  sprout: SVG('<path d="M12 21v-9" stroke="#2E8B57" stroke-width="2" stroke-linecap="round"/><path d="M12 12C12 7 8.5 4.5 3.5 4.5 3.5 9.5 7 12 12 12zM12 12c0-4 3-6.5 8.5-6.5 0 4.5-3.5 6.5-8.5 6.5z" fill="#2E8B57"/>', 22),
};

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
  for (const s of special) { const p = el('p', 'kh-special', `Today: ${s.title}`); if (!young) p.insertAdjacentHTML('afterbegin', ICO.sun); top.append(p); }
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
      // the picture: the Qur'an on its stand in a green mihrab arch, the same for every next step
      const pic = el('span', 'kh-step-pic');
      const im = el('img'); im.src = u('img/home/l34/night/step-arch.webp'); im.alt = ''; im.width = 206; im.height = 200; im.decoding = 'async';
      pic.append(im);
      step.append(pic, words);
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
      if (missions.open) { const ob = el('button', 'kh-box-link', 'See the missions'); ob.type = 'button'; ob.insertAdjacentHTML('beforeend', '<span aria-hidden="true">→</span>'); ob.addEventListener('click', () => { hush(); missions.open(); }); box.append(ob); }
      side.append(box);
    }
    if (card) {
      // the student card; tapping it opens My achievements
      const c = el(card.open ? 'button' : 'section', 'kh-card');
      if (card.open) { c.type = 'button'; c.setAttribute('aria-label', `My student card: ${card.stars ?? 0} stars, ${card.badges ?? 0} badges, ${card.palms ?? 0} palms grown. Open my achievements`); c.addEventListener('click', () => { hush(); card.open(); }); }
      else c.setAttribute('aria-label', 'My student card');
      const row = el('span', 'kh-card-top');
      const cap = el('span', 'kh-card-cap'); cap.innerHTML = ICO.cap;
      const who = el('span', 'kh-card-who'); who.append(el('span', 'kh-card-k', 'Student card'), el('b', null, card.name));
      row.append(cap, who, el('span', 'kh-card-lv', card.level));
      const figs = el('span', 'kh-card-figs');
      for (const [k, v, ic] of [['Stars', card.stars, 'star'], ['Badges', card.badges, 'trophy'], ['Palms grown', card.palms, 'sprout']]) {
        const d = el('span', 'kh-fig'); const t = el('span', 'kh-fig-k', k); t.insertAdjacentHTML('afterbegin', ICO[ic]);
        d.append(t, el('span', 'kh-fig-v', String(v ?? 0))); figs.append(d);
      }
      c.append(row, figs);
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
      // Levels 3 and 4: a subject with its own picture (art) is a picture card: the level badge in the corner, the
      // name on the picture and a round arrow
      const art = !young && !parent && p.art;
      if (art) {
        b.classList.add('kh-tile');
        const img = el('img'); img.src = p.art; img.alt = ''; img.width = 428; img.height = 250; img.decoding = 'async'; img.loading = i > 7 ? 'lazy' : 'eager';
        const shade = el('span', 'kh-tile-shade'); shade.setAttribute('aria-hidden', 'true');
        const badge = el('span', 'kh-badge', `L${level}`); badge.setAttribute('aria-hidden', 'true');
        const name = el('b', 'kh-tile-name', p.title);
        const arrow = el('span', 'kh-tile-go'); arrow.setAttribute('aria-hidden', 'true');
        b.append(img, shade, badge, name, arrow);
        b.setAttribute('aria-label', p.children ? `${p.title}: ${p.children.length} ${p.children.length === 1 ? 'activity' : 'activities'}` : p.title);
        b.addEventListener('click', () => { hush(); if (p.children) render(p.children, p); else p.open?.(); });
        grid.append(b);
        return;
      }
      if (!young && !parent) b.append(el('span', 'kh-n', String(i + 1).padStart(2, '0')));
      const ic = el('span', 'kh-ic');
      ic.innerHTML = p.icon ?? icon('stories');
      if (p.color) ic.style.setProperty('--c', p.color);
      const label = el('span', 'kh-label' + (p.logo ? ' kh-sr' : '')); label.append(el('b', null, p.title));   // a picture that carries its own name: the label is for screen readers
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
