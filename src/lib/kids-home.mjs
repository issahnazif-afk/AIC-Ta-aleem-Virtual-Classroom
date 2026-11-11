// The Classroom home for every level: one calm scene (a forest night sky over a mosque and palm skyline, drawn for
// Ta'aleem) with a short greeting and big labelled places to tap. Nothing else is on the page: details appear only
// after a place is opened (the redesign kit, Phase 2: "what should I do next?" first, everything else one tap away).
//   mountKidsHome(root, { level, name, hijri, special, places, next, onClassic }) → { stop() }
//     places: [{ id, title, ar?, text?, icon (html), open?, children?: places }]
//     next:   { title, open } — the one prominent next action (the last activity opened), or null
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

export function mountKidsHome(root, { level = 1, name = '', hijri = '', special = [], places = [], next = null, onClassic } = {}) {
  const young = level <= 2;
  root.replaceChildren();
  root.className = 'kh kh-l' + level + (young ? ' kh-young' : ' kh-older');
  const stage = el('div', 'kh-stage');
  stage.innerHTML = young ? picture() : scene();
  const top = el('div', 'kh-top');
  const hi = el('h1', 'kh-hi'); hi.append('Assalamu alaikum', name ? ', ' : '', el('em', null, name ? `${name}` : ''));
  top.append(hi);
  if (hijri) top.append(el('p', 'kh-date', hijri));
  for (const s of special) top.append(el('p', 'kh-special', `Today: ${s.title}`));
  if (next?.open) {
    const b = el('button', 'kh-next'); b.type = 'button';
    b.append(el('span', 'kh-next-k', 'Continue'), el('b', null, next.title));
    b.addEventListener('click', () => { hush(); next.open(); });
    top.append(b);
  }
  const head = el('div', 'kh-group'); head.hidden = true;
  const grid = el('div', 'kh-places');
  stage.append(top, head, grid);
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
  function render(list, parent) {
    grid.replaceChildren();
    armed = null;
    top.hidden = !!parent;
    head.hidden = !parent;
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
    for (const p of list) {
      const b = el('button', 'kh-place'); b.type = 'button'; b.dataset.place = p.id;
      const ic = el('span', 'kh-ic'); ic.innerHTML = p.icon ?? icon('stories');
      if (p.color) ic.style.setProperty('--c', p.color);
      const label = el('span', 'kh-label'); label.append(el('b', null, p.title));
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
      grid.append(b);
    }
  }
  render(places, null);
  return { stop() { hush(); } };
}
