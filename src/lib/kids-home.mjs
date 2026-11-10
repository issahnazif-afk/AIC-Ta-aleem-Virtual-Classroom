// The picture home for Levels 1 and 2: one bright scene with big places to tap, for children who are just learning
// to read. Pointing at a place (or tapping it once on a tablet) says its name and makes it bounce; clicking it, or
// tapping it a second time, opens it. A place with `children` opens a smaller scene of its own (e.g. the games).
//   mountKidsHome(root, { level, name, hijri, special, places, onClassic }) → { stop() }
//     places: [{ id, title, ar?, icon (svg), color, open?, children?: places }]
// The art is drawn here from simple shapes (no people), until the school's Canva pictures replace it.
import { narrate, hush } from './narration.mjs';

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

function scene(hour) {
  const night = hour < 6 || hour >= 19, dusk = !night && hour >= 17;
  const sky = night ? ['#132A4A', '#27466E'] : dusk ? ['#F6B26B', '#FBE3A6'] : ['#8FD3F4', '#D8F1FB'];
  const orb = night
    ? '<path d="M1060 70a46 46 0 1 0 30 80a38 38 0 0 1 -30 -80z" fill="#FBE3A6"/><g fill="#FBE3A6"><circle cx="200" cy="60" r="3"/><circle cx="420" cy="110" r="2"/><circle cx="760" cy="50" r="2.5"/><circle cx="930" cy="140" r="2"/><circle cx="330" cy="30" r="2"/></g>'
    : `<circle cx="1060" cy="100" r="52" fill="${dusk ? '#F59E42' : '#F6C64B'}"/><circle cx="1060" cy="100" r="70" fill="${dusk ? '#F59E42' : '#F6C64B'}" opacity=".25"/>`;
  const cloud = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity="${night ? 0.15 : 0.9}"><ellipse cx="0" cy="0" rx="50" ry="22"/><ellipse cx="40" cy="-14" rx="36" ry="24"/><ellipse cx="80" cy="0" rx="44" ry="20"/></g>`;
  const palm = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-4 120 Q-8 60 0 0 L6 0 Q2 60 6 120Z" fill="#8A5A12"/><g fill="#2E8B57"><path d="M3 0 Q-36 -24 -62 -2 Q-30 -10 3 6Z"/><path d="M3 0 Q42 -24 66 -2 Q34 -10 3 6Z"/><path d="M3 0 Q-16 -44 -42 -44 Q-14 -28 0 6Z"/><path d="M3 0 Q22 -44 48 -44 Q20 -28 6 6Z"/></g><g fill="#C9A24A"><circle cx="-2" cy="8" r="5"/><circle cx="9" cy="8" r="5"/></g></g>`;
  return `<svg class="kh-scene" viewBox="0 0 1200 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="khsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs>
    <rect width="1200" height="520" fill="url(#khsky)"/>${orb}${cloud(140, 90, 1)}${cloud(620, 60, 0.8)}
    <path d="M0 360 Q200 300 420 340 T860 320 T1200 330 V520 H0Z" fill="${night ? '#1F4A3A' : '#8CCB7E'}"/>
    <g transform="translate(560 214)" fill="${night ? '#E8EDE9' : '#FFF9EC'}" stroke="${night ? '#C9A24A' : '#C9A24A'}" stroke-width="3">
      <rect x="0" y="60" width="160" height="90"/><path d="M30 60 Q80 -10 130 60Z"/><rect x="170" y="10" width="20" height="140"/><path d="M180 -12 V10" stroke-width="4"/>
      <path d="M62 150 V112 Q80 92 98 112 V150Z" fill="#0E6B4E"/><circle cx="80" cy="18" r="5" fill="#C9A24A"/>
    </g>
    ${palm(120, 290, 1)}${palm(1040, 280, 1.1)}${palm(330, 330, 0.7)}
    <path d="M0 420 Q300 390 600 410 T1200 400 V520 H0Z" fill="${night ? '#183C2F' : '#6CBF5A'}"/>
    <g fill="${night ? '#F4B6C2' : '#E85A71'}" opacity=".9"><circle cx="210" cy="440" r="6"/><circle cx="470" cy="452" r="6"/><circle cx="780" cy="446" r="6"/><circle cx="980" cy="456" r="6"/></g>
  </svg>`;
}

export function mountKidsHome(root, { level = 1, name = '', hijri = '', special = [], places = [], onClassic } = {}) {
  root.replaceChildren();
  root.className = 'kh kh-l' + level;
  const stage = el('div', 'kh-stage');
  stage.innerHTML = scene(new Date().getHours());
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
