// The picture home for Levels 1 and 2: one bright scene with big places to tap, for children who are just learning
// to read. Pointing at a place (or tapping it once on a tablet) says its name and makes it bounce; clicking it, or
// tapping it a second time, opens it. A place with `children` opens a smaller scene of its own (e.g. the games).
//   mountKidsHome(root, { level, name, hijri, special, places, onClassic }) → { stop() }
//     places: [{ id, title, ar?, icon (svg), color, open?, children?: places }]
// The background and some of the places are the school's own Canva pictures (public/img/home/).
import { narrate, hush } from './narration.mjs';
import { u } from './url.mjs';

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

// the school's picture (Canva): a wide one for computers and a square one for phones, under a soft veil so the
// greeting and the places stay easy to read
function scene() {
  return `<picture class="kh-scene"><source media="(max-width: 700px)" srcset="${u('img/home/scene-phone.webp')}">`
    + `<img src="${u('img/home/scene-wide.webp')}" alt="" width="1600" height="992" decoding="async" fetchpriority="high"></picture>`
    + '<div class="kh-veil" aria-hidden="true"></div>';
}

export function mountKidsHome(root, { level = 1, name = '', hijri = '', special = [], places = [], onClassic } = {}) {
  root.replaceChildren();
  root.className = 'kh kh-l' + level;
  const stage = el('div', 'kh-stage');
  stage.innerHTML = scene();
  const top = el('div', 'kh-top');
  const hi = el('h1', 'kh-hi'); hi.append('Assalamu alaikum', el('em', null, name ? `, ${name}!` : '!'));
  const date = el('p', 'kh-date', hijri);
  top.append(hi, date);
  for (const s of special) { const c = el('span', 'kh-special', `Today: ${s.title}`); top.append(c); }
  stage.append(top);
  const grid = el('div', 'kh-places');
  stage.append(grid);
  root.append(stage);
  if (onClassic) {
    const c = el('button', 'btn link kh-classic', 'Grown-up view: see every activity as a list');
    c.type = 'button'; c.addEventListener('click', () => { hush(); onClassic(); });
    root.append(c);
  }

  let armed = null, lastPointer = 'mouse';
  const sayIt = (p, b) => {
    hush();
    b.classList.remove('bounce'); void b.offsetWidth; b.classList.add('bounce');
    narrate(p.say ?? p.title.replace('ﷺ', 'sallallahu alayhi wa sallam'), { voice: 'story', words: [] });
  };
  function render(list, parent) {
    grid.replaceChildren();
    armed = null;
    if (parent) {
      const back = el('button', 'kh-place kh-back'); back.type = 'button';
      back.innerHTML = '<span class="kh-ic" style="--c:#F7F8F6"><svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true"><path d="M40 14 L20 32 L40 50" fill="none" stroke="#0E6B4E" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
      back.append(el('b', null, 'Back'));
      back.addEventListener('click', () => { hush(); render(places, null); });
      grid.append(back);
    }
    for (const p of list) {
      const b = el('button', 'kh-place'); b.type = 'button'; b.dataset.place = p.id;
      const ic = el('span', 'kh-ic'); ic.style.setProperty('--c', p.color ?? '#FFF9EC'); ic.innerHTML = p.icon ?? '';
      b.append(ic, el('b', null, p.title));
      if (p.ar && level >= 2) { const a = el('span', 'kh-ar', p.ar); a.lang = 'ar'; a.dir = 'rtl'; b.append(a); }
      b.setAttribute('aria-label', p.title);
      b.addEventListener('pointerdown', (e) => { lastPointer = e.pointerType; });
      b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') sayIt(p, b); });
      b.addEventListener('focus', () => { if (lastPointer !== 'touch') b.classList.add('lit'); });
      b.addEventListener('blur', () => b.classList.remove('lit'));
      b.addEventListener('click', () => {
        // on a touch screen the first tap only says the name; the second opens it
        if (lastPointer === 'touch' && armed !== p.id) { armed = p.id; grid.querySelectorAll('.kh-place').forEach((x) => x.classList.toggle('armed', x === b)); sayIt(p, b); return; }
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
