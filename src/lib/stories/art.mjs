// Story Time pictures: every picture is drawn here, in code, in one friendly style (our own artwork).
// A page is a scene: a background, the people and animals in it, the things around them, and small effects.
//   scene({ bg: 'home', time: 'day', actors: [{ who: 'yusuf', x: 300, face: 'smile', pose: 'wave' }], props: [...], fx: [...] })
// Prophets and Companions are never drawn. People are the classroom's own made-up family and friends.

const W = 800, H = 500, GROUND = 420;
let uid = 0;
const run = Math.random().toString(36).slice(2, 6);   // ids stay unique when several pictures share a page
const id = (p) => `${p}${run}${++uid}`;
let P = null;    // the current scene's shared paint ids
function paintDefs() {
  P = { shade: id('sh'), skin: id('sk'), soft: id('so'), vig: id('vg'), hair: id('hr'), floor: id('fl') };
  return `<defs>
  <linearGradient id="${P.shade}" x1="0" y1="0" x2="1" y2="0.35"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>
  <radialGradient id="${P.skin}" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#7A3E22" stop-opacity=".18"/></radialGradient>
  <linearGradient id="${P.hair}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".15"/></linearGradient>
  <linearGradient id="${P.floor}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>
  <filter id="${P.soft}" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="2" dy="4" stdDeviation="3.5" flood-color="#2B1D14" flood-opacity=".18"/></filter>
  <radialGradient id="${P.vig}" cx=".5" cy=".45" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#2B1D14" stop-opacity=".22"/></radialGradient>
</defs>`;
}
const LINE = 'stroke="#2B1D14" stroke-opacity=".22" stroke-width="1.6" stroke-linejoin="round"';

// ── the cast ────────────────────────────────────────────────
export const CAST = {
  yusuf:   { kind: 'child', name: 'Yusuf', skin: '#E9B98F', hair: '#3A2A1E', top: '#2E8B57', legs: '#35506B', hairStyle: 'short' },
  maryam:  { kind: 'child', name: 'Maryam', skin: '#F2C79A', scarf: '#E98BB0', top: '#F6C64B', legs: '#F6C64B', girl: true },
  adam:    { kind: 'toddler', name: 'Adam', skin: '#E9B98F', hair: '#3A2A1E', top: '#4A90D9', legs: '#2F4A68', hairStyle: 'curly' },
  mama:    { kind: 'adult', name: 'Mama', skin: '#EDBE95', scarf: '#1F7A5C', top: '#7A5C8E', girl: true },
  baba:    { kind: 'adult', name: 'Baba', skin: '#D9A47A', beard: '#2B1D14', kufi: '#FFFFFF', top: '#BFD9EA' },
  grandpa: { kind: 'adult', name: 'Grandpa Musa', skin: '#D9A47A', beard: '#ECECEC', kufi: '#FFFFFF', top: '#D9C7A3', glasses: true, cane: true },
  grandma: { kind: 'adult', name: 'Teta', skin: '#EDBE95', scarf: '#B9A3D6', top: '#5E7C9A', girl: true, glasses: true },
  bilal:   { kind: 'child', name: 'Bilal', skin: '#8D5A3B', hair: '#1A1210', top: '#F08A3C', legs: '#3C3C5A', hairStyle: 'buzz' },
  zara:    { kind: 'child', name: 'Zara', skin: '#C68B5E', scarf: '#7D6BE0', top: '#3BB3A6', legs: '#3BB3A6', girl: true },
  omar:    { kind: 'child', name: 'Omar', skin: '#F4D3B5', hair: '#8A5A33', top: '#D64C4C', legs: '#3A4A5A', hairStyle: 'short' },
  huda:    { kind: 'adult', name: 'Ustadha Huda', skin: '#E3B38C', scarf: '#24476B', top: '#2C8C88', girl: true },
  salma:   { kind: 'adult', name: 'Aunty Salma', skin: '#B9835A', scarf: '#E5A33C', top: '#9C3D54', girl: true },
  hamza:   { kind: 'child', name: 'Hamza', skin: '#B07A52', hair: '#1A1210', top: '#6A8E3C', legs: '#3A3A4A', hairStyle: 'short' },
  safiya:  { kind: 'child', name: 'Safiya', skin: '#E6B48C', scarf: '#3BA7D1', top: '#F28CB2', legs: '#F28CB2', girl: true },
  idris:   { kind: 'child', name: 'Idris', skin: '#6E4630', hair: '#120C0A', top: '#2F6FA8', legs: '#2E2E3A', hairStyle: 'buzz' },
  layla:   { kind: 'child', name: 'Layla', skin: '#D9A27A', scarf: '#F2A43C', top: '#8E5CC4', legs: '#8E5CC4', girl: true },
  imam:    { kind: 'adult', name: 'Imam Rashid', skin: '#C9956A', beard: '#5A5A5A', kufi: '#FFFFFF', top: '#ECE6D6', glasses: true },
  uncle:   { kind: 'adult', name: 'Uncle Idris', skin: '#8D5A3B', beard: '#1A1210', kufi: '#C0392B', top: '#7A8B5A' },
  khadija: { kind: 'adult', name: 'Aunty Khadija', skin: '#C08A64', scarf: '#5E7C9A', top: '#9C6B4E', girl: true, glasses: true, cane: true },
  elder:   { kind: 'adult', name: 'an old lady', skin: '#D6A47E', scarf: '#9AA3AE', top: '#6B5B4B', girl: true, glasses: true, cane: true },
  driver:  { kind: 'adult', name: 'Uncle Sami', skin: '#C9956A', hair: '#2E2E2E', top: '#3D6FA8', cap: '#24476B', moustache: true },
};

// ── people ──────────────────────────────────────────────────
// poses: each arm is [upper, lower] angles in degrees from hanging straight down; + is outwards from the body.
const POSES = {
  stand: { L: [8, 0], R: [8, 0] },
  wave: { L: [8, 0], R: [150, 25] },
  wave2: { L: [150, 25], R: [150, 25] },
  give: { L: [8, 0], R: [70, 80] },
  give2: { L: [60, 80], R: [60, 80] },
  hold: { L: [8, 0], R: [35, 95] },
  hold2: { L: [35, 95], R: [35, 95] },
  dua: { L: [30, 150], R: [30, 150] },
  point: { L: [8, 0], R: [95, 5] },
  hug: { L: [55, 120], R: [55, 120] },
  think: { L: [8, 0], R: [20, 160] },
  cheer: { L: [160, 10], R: [160, 10] },
  shrug: { L: [50, 130], R: [50, 130] },
  sad: { L: [4, 0], R: [4, 0] },
  carry: { L: [20, 110], R: [20, 110] },
};
const SIZES = {
  toddler: { head: 30, body: 44, bodyW: 46, legs: 24, arm: 22 },
  child: { head: 36, body: 62, bodyW: 56, legs: 40, arm: 30 },
  adult: { head: 32, body: 128, bodyW: 64, legs: 70, arm: 44 },
};
const rad = (d) => (d * Math.PI) / 180;

function face(cx, cy, r, f, c) {
  const ex = r * 0.36, ey = cy - r * 0.05, er = r * 0.11;
  let eyes, mouth, brows = '';
  const dark = '#2B1D14';
  if (f === 'sleepy') eyes = `<path d="M${cx - ex - er} ${ey} q${er} ${er} ${er * 2} 0 M${cx + ex - er} ${ey} q${er} ${er} ${er * 2} 0" stroke="${dark}" stroke-width="${r * 0.07}" fill="none" stroke-linecap="round"/>`;
  else if (f === 'happy') eyes = `<path d="M${cx - ex - er} ${ey + er * 0.3} q${er} ${-er * 1.6} ${er * 2} 0 M${cx + ex - er} ${ey + er * 0.3} q${er} ${-er * 1.6} ${er * 2} 0" stroke="${dark}" stroke-width="${r * 0.08}" fill="none" stroke-linecap="round"/>`;
  else eyes = `<ellipse cx="${cx - ex}" cy="${ey}" rx="${er}" ry="${er * 1.25}" fill="${dark}"/><ellipse cx="${cx + ex}" cy="${ey}" rx="${er}" ry="${er * 1.25}" fill="${dark}"/><circle cx="${cx - ex + er * 0.35}" cy="${ey - er * 0.45}" r="${er * 0.35}" fill="#fff"/><circle cx="${cx + ex + er * 0.35}" cy="${ey - er * 0.45}" r="${er * 0.35}" fill="#fff"/>`;
  const my = cy + r * 0.38, mw = r * 0.32;
  if (f === 'sad') { mouth = `<path d="M${cx - mw * 0.8} ${my + r * 0.08} q${mw * 0.8} ${-r * 0.16} ${mw * 1.6} 0" stroke="${dark}" stroke-width="${r * 0.07}" fill="none" stroke-linecap="round"/>`; brows = `<path d="M${cx - ex - er * 1.4} ${ey - r * 0.2} l${er * 2.2} ${-r * 0.08} M${cx + ex + er * 1.4} ${ey - r * 0.2} l${-er * 2.2} ${-r * 0.08}" stroke="${dark}" stroke-width="${r * 0.05}" stroke-linecap="round"/>`; }
  else if (f === 'angry') { mouth = `<path d="M${cx - mw * 0.7} ${my + r * 0.05} q${mw * 0.7} ${-r * 0.1} ${mw * 1.4} 0" stroke="${dark}" stroke-width="${r * 0.07}" fill="none" stroke-linecap="round"/>`; brows = `<path d="M${cx - ex - er * 1.4} ${ey - r * 0.3} l${er * 2.2} ${r * 0.1} M${cx + ex + er * 1.4} ${ey - r * 0.3} l${-er * 2.2} ${r * 0.1}" stroke="${dark}" stroke-width="${r * 0.07}" stroke-linecap="round"/>`; }
  else if (f === 'surprised') mouth = `<ellipse cx="${cx}" cy="${my + r * 0.02}" rx="${r * 0.1}" ry="${r * 0.13}" fill="${dark}"/>`;
  else if (f === 'sleepy') mouth = `<ellipse cx="${cx}" cy="${my}" rx="${r * 0.07}" ry="${r * 0.06}" fill="${dark}"/>`;
  else if (f === 'calm') mouth = `<path d="M${cx - mw * 0.6} ${my} q${mw * 0.6} ${r * 0.1} ${mw * 1.2} 0" stroke="${dark}" stroke-width="${r * 0.06}" fill="none" stroke-linecap="round"/>`;
  else mouth = `<path d="M${cx - mw} ${my - r * 0.04} q${mw} ${r * 0.34} ${mw * 2} 0 z" fill="#8E3B3B"/><path d="M${cx - mw * 0.6} ${my + r * 0.12} q${mw * 0.6} ${r * 0.12} ${mw * 1.2} 0" fill="#E77B7B"/>`;
  const cheeks = f === 'angry' ? '' : `<circle cx="${cx - r * 0.55}" cy="${cy + r * 0.25}" r="${r * 0.14}" fill="#F08F8F" opacity=".45"/><circle cx="${cx + r * 0.55}" cy="${cy + r * 0.25}" r="${r * 0.14}" fill="#F08F8F" opacity=".45"/>`;
  const glasses = c.glasses ? `<g fill="none" stroke="#5A4A3A" stroke-width="${r * 0.05}"><circle cx="${cx - ex}" cy="${ey}" r="${er * 2.3}"/><circle cx="${cx + ex}" cy="${ey}" r="${er * 2.3}"/><path d="M${cx - ex + er * 2.3} ${ey} h${2 * ex - er * 4.6}"/></g>` : '';
  return eyes + brows + cheeks + mouth + glasses;
}

function arm(sx, sy, [a1, a2], len, side, sleeve, skin, w) {
  // side: -1 left of the picture, +1 right; angles open outwards
  const ex = sx + side * Math.sin(rad(a1)) * len, ey = sy + Math.cos(rad(a1)) * len;
  const hx = ex + side * Math.sin(rad(a1 + a2)) * len * 0.9, hy = ey + Math.cos(rad(a1 + a2)) * len * 0.9;
  const d = `M${sx} ${sy} L${ex} ${ey} L${hx} ${hy}`;
  return { svg: `<path d="${d}" stroke="#2B1D14" stroke-opacity=".22" stroke-width="${w + 3}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="${sleeve}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="#fff" stroke-opacity=".16" stroke-width="${w * 0.3}" fill="none" stroke-linecap="round" transform="translate(${-w * 0.18} ${-w * 0.12})"/><circle cx="${hx}" cy="${hy}" r="${w * 0.52}" fill="${skin}" ${LINE}/>`, hand: [hx, hy] };
}

function lyingHead(c, x, y, hr, f) {
  const parts = [];
  if (c.scarf) parts.push(`<ellipse cx="${x}" cy="${y}" rx="${hr * 1.15}" ry="${hr * 1.12}" fill="${c.scarf}"/><ellipse cx="${x}" cy="${y + hr * 0.06}" rx="${hr * 0.8}" ry="${hr * 0.86}" fill="${c.skin}"/>`);
  else {
    parts.push(`<circle cx="${x}" cy="${y}" r="${hr}" fill="${c.skin}"/>`);
    if (c.hairStyle === 'curly') parts.push([[-0.6, -0.75], [-0.15, -0.95], [0.32, -0.88], [0.72, -0.6], [-0.85, -0.35]].map(([a, b]) => `<circle cx="${x + a * hr}" cy="${y + b * hr}" r="${hr * 0.34}" fill="${c.hair}"/>`).join(''));
    else if (c.hair) parts.push(`<path d="M${x - hr * 1.02} ${y + hr * 0.05} Q${x - hr * 1.1} ${y - hr * 1.12} ${x + hr * 0.1} ${y - hr * 1.1} Q${x + hr * 1.12} ${y - hr * 1.02} ${x + hr * 1.02} ${y + hr * 0.05} Q${x + hr * 0.75} ${y - hr * 0.55} ${x + hr * 0.1} ${y - hr * 0.6} Q${x - hr * 0.2} ${y - hr * 0.3} ${x - hr * 0.7} ${y - hr * 0.5} Q${x - hr * 0.95} ${y - hr * 0.3} ${x - hr * 1.02} ${y + hr * 0.05} Z" fill="${c.hair}"/>`);
  }
  parts.push(face(x, y, hr, f, c));
  return `<g transform="rotate(-12 ${x} ${y})">${parts.join('')}</g>`;
}

export function person(spec) {
  const c = { ...(CAST[spec.who] ?? CAST.yusuf), ...spec };
  const S = SIZES[c.kind], s = spec.s ?? 1, x = spec.x, y = spec.y ?? GROUND;
  if (spec.lying) return `<g${spec.id ? ` data-id="${spec.id}" class="tap"` : ''}>${lyingHead(c, x, y, S.head * s, spec.face ?? 'sleepy')}</g>`;
  const pose = POSES[spec.pose ?? 'stand'] ?? POSES.stand;
  const legs = S.legs * s, body = S.body * s, bw = S.bodyW * s, hr = S.head * s;
  const hip = y - legs, neck = hip - body, hy = neck - hr * 0.92;
  const out = [];
  const g = `g${++uid}`;
  // shadow
  out.push(`<ellipse cx="${x}" cy="${y + 3}" rx="${bw * 0.75}" ry="${6 * s}" fill="#000" opacity=".12"/>`);
  // legs and shoes
  const shoe = '#4A3B30';
  if (c.kind === 'adult') {
    // long clothes to the ankles
    const hem = y - 8 * s;
    const robe = `M${x - bw * 0.42} ${neck + 6 * s} Q${x - bw * 0.6} ${(neck + hem) / 2} ${x - bw * 0.62} ${hem} L${x + bw * 0.62} ${hem} Q${x + bw * 0.6} ${(neck + hem) / 2} ${x + bw * 0.42} ${neck + 6 * s} Z`;
    out.push(`<path d="${robe}" fill="${c.top}" ${LINE}/><path d="${robe}" fill="url(#${P.shade})"/>`);
    out.push(`<path d="M${x - bw * 0.2} ${neck + 30 * s} Q${x - bw * 0.26} ${(neck + hem) / 2 + 20 * s} ${x - bw * 0.3} ${hem - 4 * s} M${x + bw * 0.24} ${neck + 40 * s} Q${x + bw * 0.3} ${(neck + hem) / 2 + 20 * s} ${x + bw * 0.34} ${hem - 4 * s}" stroke="#000" stroke-opacity=".08" stroke-width="${3 * s}" fill="none" stroke-linecap="round"/>`);
    out.push(`<path d="M${x - bw * 0.62} ${hem} L${x + bw * 0.62} ${hem}" stroke="#000" stroke-opacity=".12" stroke-width="${3 * s}"/>`);
    out.push(`<ellipse cx="${x - bw * 0.22}" cy="${y - 3 * s}" rx="${11 * s}" ry="${6 * s}" fill="${shoe}"/><ellipse cx="${x + bw * 0.22}" cy="${y - 3 * s}" rx="${11 * s}" ry="${6 * s}" fill="${shoe}"/>`);
    if (!c.girl) out.push(`<path d="M${x} ${neck + 8 * s} V${neck + 40 * s}" stroke="#000" stroke-opacity=".12" stroke-width="${2 * s}"/>`);
  } else {
    const lw = bw * 0.26;
    if (c.girl) {
      const dress = `M${x - bw * 0.46} ${neck + 6 * s} L${x - bw * 0.62} ${y - 12 * s} Q${x} ${y - 6 * s} ${x + bw * 0.62} ${y - 12 * s} L${x + bw * 0.46} ${neck + 6 * s} Z`;
      out.push(`<path d="${dress}" fill="${c.top}" ${LINE}/><path d="${dress}" fill="url(#${P.shade})"/><path d="M${x - bw * 0.58} ${y - 20 * s} Q${x} ${y - 13 * s} ${x + bw * 0.58} ${y - 20 * s}" stroke="#fff" stroke-opacity=".45" stroke-width="${3 * s}" fill="none" stroke-dasharray="${4 * s} ${4 * s}"/>`);
      out.push(`<rect x="${x - bw * 0.3}" y="${y - 14 * s}" width="${lw}" height="${10 * s}" fill="${c.skin}"/><rect x="${x + bw * 0.3 - lw}" y="${y - 14 * s}" width="${lw}" height="${10 * s}" fill="${c.skin}"/>`);
    } else {
      out.push(`<rect x="${x - bw * 0.34}" y="${hip - 4 * s}" width="${lw}" height="${legs}" rx="${lw / 2}" fill="${c.legs}" ${LINE}/><rect x="${x + bw * 0.34 - lw}" y="${hip - 4 * s}" width="${lw}" height="${legs}" rx="${lw / 2}" fill="${c.legs}" ${LINE}/>`);
      const tunic = `M${x - bw * 0.5} ${neck + 8 * s} Q${x - bw * 0.56} ${hip} ${x - bw * 0.52} ${hip + 6 * s} L${x + bw * 0.52} ${hip + 6 * s} Q${x + bw * 0.56} ${hip} ${x + bw * 0.5} ${neck + 8 * s} Z`;
      out.push(`<path d="${tunic}" fill="${c.top}" ${LINE}/><path d="${tunic}" fill="url(#${P.shade})"/><path d="M${x - bw * 0.14} ${neck + 9 * s} L${x} ${neck + 20 * s} L${x + bw * 0.14} ${neck + 9 * s}" stroke="#fff" stroke-opacity=".5" stroke-width="${2.5 * s}" fill="none" stroke-linejoin="round"/>`);
    }
    out.push(`<ellipse cx="${x - bw * 0.21}" cy="${y - 3 * s}" rx="${10 * s}" ry="${6 * s}" fill="${shoe}"/><ellipse cx="${x + bw * 0.21}" cy="${y - 3 * s}" rx="${10 * s}" ry="${6 * s}" fill="${shoe}"/>`);
  }
  // arms
  const sy = neck + 14 * s, sx = bw * 0.46, aw = (c.kind === 'adult' ? 15 : 13) * s;
  const flip = spec.flip ? -1 : 1;
  const left = arm(x - sx, sy, flip === 1 ? pose.L : pose.R, S.arm * s, -1, c.top, c.skin, aw);
  const right = arm(x + sx, sy, flip === 1 ? pose.R : pose.L, S.arm * s, 1, c.top, c.skin, aw);
  // head
  const head = [];
  if (c.scarf) {
    head.push(`<path d="M${x - hr * 1.25} ${neck + 26 * s} Q${x - hr * 1.3} ${hy - hr * 0.2} ${x} ${hy - hr * 1.22} Q${x + hr * 1.3} ${hy - hr * 0.2} ${x + hr * 1.25} ${neck + 26 * s} Q${x} ${neck + 40 * s} ${x - hr * 1.25} ${neck + 26 * s} Z" fill="${c.scarf}" ${LINE}/>`);
    head.push(`<path d="M${x - hr * 1.25} ${neck + 26 * s} Q${x - hr * 1.3} ${hy - hr * 0.2} ${x} ${hy - hr * 1.22} Q${x + hr * 1.3} ${hy - hr * 0.2} ${x + hr * 1.25} ${neck + 26 * s} Q${x} ${neck + 40 * s} ${x - hr * 1.25} ${neck + 26 * s} Z" fill="url(#${P.hair})"/>`);
    head.push(`<ellipse cx="${x}" cy="${hy + hr * 0.08}" rx="${hr * 0.8}" ry="${hr * 0.86}" fill="${c.skin}" ${LINE}/><ellipse cx="${x}" cy="${hy + hr * 0.08}" rx="${hr * 0.8}" ry="${hr * 0.86}" fill="url(#${P.skin})"/>`);
    head.push(`<path d="M${x - hr * 0.82} ${hy - hr * 0.1} Q${x} ${hy - hr * 1.02} ${x + hr * 0.82} ${hy - hr * 0.1}" stroke="#fff" stroke-opacity=".35" stroke-width="${4 * s}" fill="none"/>`);
  } else {
    head.push(`<circle cx="${x - hr * 0.97}" cy="${hy + hr * 0.08}" r="${hr * 0.18}" fill="${c.skin}" ${LINE}/><circle cx="${x + hr * 0.97}" cy="${hy + hr * 0.08}" r="${hr * 0.18}" fill="${c.skin}" ${LINE}/>`);
    head.push(`<circle cx="${x}" cy="${hy}" r="${hr}" fill="${c.skin}" ${LINE}/><circle cx="${x}" cy="${hy}" r="${hr}" fill="url(#${P.skin})"/>`);
    if (c.beard) head.push(`<path d="M${x - hr * 0.92} ${hy + hr * 0.05} Q${x - hr * 0.9} ${hy + hr * 1.45} ${x} ${hy + hr * 1.5} Q${x + hr * 0.9} ${hy + hr * 1.45} ${x + hr * 0.92} ${hy + hr * 0.05} Q${x + hr * 0.7} ${hy + hr * 0.75} ${x} ${hy + hr * 0.72} Q${x - hr * 0.7} ${hy + hr * 0.75} ${x - hr * 0.92} ${hy + hr * 0.05} Z" fill="${c.beard}"/>`);
    if (c.moustache) head.push(`<path d="M${x - hr * 0.38} ${hy + hr * 0.34} Q${x} ${hy + hr * 0.18} ${x + hr * 0.38} ${hy + hr * 0.34} Q${x} ${hy + hr * 0.3} ${x - hr * 0.38} ${hy + hr * 0.34} Z" fill="${c.hair}"/>`);
    if (c.kufi) head.push(`<path d="M${x - hr * 0.95} ${hy - hr * 0.38} Q${x} ${hy - hr * 1.38} ${x + hr * 0.95} ${hy - hr * 0.38} Z" fill="${c.kufi}" stroke="#D8D2C4" stroke-width="${1.5 * s}"/><path d="M${x - hr * 0.6} ${hy - hr * 0.6} h${hr * 1.2}" stroke="#D8D2C4" stroke-width="${1.5 * s}"/>`);
    else if (c.cap) head.push(`<path d="M${x - hr} ${hy - hr * 0.25} Q${x} ${hy - hr * 1.4} ${x + hr} ${hy - hr * 0.25} Z" fill="${c.cap}"/><path d="M${x - hr * 0.2} ${hy - hr * 0.28} h${hr * 1.5}" stroke="${c.cap}" stroke-width="${hr * 0.18}" stroke-linecap="round"/>`);
    else if (c.hairStyle === 'curly') head.push([[-0.6, -0.75], [-0.15, -0.95], [0.32, -0.88], [0.72, -0.6], [-0.85, -0.35]].map(([a, b]) => `<circle cx="${x + a * hr}" cy="${hy + b * hr}" r="${hr * 0.34}" fill="${c.hair}"/>`).join(''));
    else if (c.hairStyle === 'buzz') head.push(`<path d="M${x - hr * 0.98} ${hy - hr * 0.1} Q${x - hr} ${hy - hr * 1.08} ${x} ${hy - hr * 1.06} Q${x + hr} ${hy - hr * 1.08} ${x + hr * 0.98} ${hy - hr * 0.1} Q${x + hr * 0.7} ${hy - hr * 0.6} ${x} ${hy - hr * 0.62} Q${x - hr * 0.7} ${hy - hr * 0.6} ${x - hr * 0.98} ${hy - hr * 0.1} Z" fill="${c.hair}"/>`);
    else if (c.hair) head.push(`<path d="M${x - hr * 1.02} ${hy + hr * 0.05} Q${x - hr * 1.1} ${hy - hr * 1.12} ${x + hr * 0.1} ${hy - hr * 1.1} Q${x + hr * 1.12} ${hy - hr * 1.02} ${x + hr * 1.02} ${hy + hr * 0.05} Q${x + hr * 0.75} ${hy - hr * 0.55} ${x + hr * 0.1} ${hy - hr * 0.6} Q${x - hr * 0.2} ${hy - hr * 0.3} ${x - hr * 0.7} ${hy - hr * 0.5} Q${x - hr * 0.95} ${hy - hr * 0.3} ${x - hr * 1.02} ${hy + hr * 0.05} Z" fill="${c.hair}"/><path d="M${x - hr * 0.55} ${hy - hr * 0.78} Q${x - hr * 0.1} ${hy - hr * 1.0} ${x + hr * 0.35} ${hy - hr * 0.9}" stroke="#fff" stroke-opacity=".22" stroke-width="${hr * 0.12}" fill="none" stroke-linecap="round"/>`);
  }
  head.push(face(x, hy, hr, spec.face ?? 'smile', c));
  // the cane, in the left hand
  const cane = c.cane ? `<path d="M${left.hand[0]} ${left.hand[1] - 6 * s} L${left.hand[0] - 4 * s} ${y} M${left.hand[0]} ${left.hand[1] - 6 * s} q-10 -8 -18 2" stroke="#7A5230" stroke-width="${5 * s}" fill="none" stroke-linecap="round"/>` : '';
  // held things
  const held = [];
  for (const [k, hand] of [['R', right.hand], ['L', left.hand]]) {
    const what = spec.hold?.[k === 'R' ? (flip === 1 ? 'R' : 'L') : (flip === 1 ? 'L' : 'R')];
    if (what) held.push(prop({ p: what, x: hand[0], y: hand[1], s: s * (c.kind === 'adult' ? 1.1 : 1), held: true }));
  }
  const tag = spec.id ? ` data-id="${spec.id}" class="tap"` : '';
  return `<g${tag} filter="url(#${P.soft})">${out.join('')}${cane}${head.join('')}${left.svg}${right.svg}${held.join('')}</g>`;
}

// ── animals ─────────────────────────────────────────────────
function cat({ x, y = GROUND, s = 1, color = '#F2A65A', face: f = 'smile', drinking }) {
  const k = (v) => v * s;
  const hx = drinking ? x - k(46) : x - k(30), hy = drinking ? y - k(26) : y - k(70);
  return `<g filter="url(#${P.soft})"><ellipse cx="${x}" cy="${y + 2}" rx="${k(48)}" ry="${k(6)}" fill="#000" opacity=".12"/>
  <path d="M${x + k(38)} ${y - k(14)} Q${x + k(80)} ${y - k(30)} ${x + k(62)} ${y - k(78)}" stroke="${color}" stroke-width="${k(12)}" fill="none" stroke-linecap="round"/>
  <ellipse cx="${x + k(6)}" cy="${y - k(30)}" rx="${k(44)}" ry="${k(30)}" fill="${color}"/>
  <path d="M${x - k(6)} ${y - k(52)} q${k(8)} ${k(18)} 0 ${k(40)} M${x + k(14)} ${y - k(56)} q${k(8)} ${k(18)} 0 ${k(44)}" stroke="#D9843C" stroke-width="${k(5)}" fill="none" stroke-linecap="round"/>
  <ellipse cx="${x - k(22)}" cy="${y - k(4)}" rx="${k(9)}" ry="${k(6)}" fill="${color}"/><ellipse cx="${x + k(26)}" cy="${y - k(4)}" rx="${k(9)}" ry="${k(6)}" fill="${color}"/>
  <path d="M${hx - k(26)} ${hy - k(10)} L${hx - k(22)} ${hy - k(42)} L${hx - k(4)} ${hy - k(24)} Z M${hx + k(26)} ${hy - k(10)} L${hx + k(22)} ${hy - k(42)} L${hx + k(4)} ${hy - k(24)} Z" fill="${color}"/>
  <path d="M${hx - k(20)} ${hy - k(16)} L${hx - k(19)} ${hy - k(32)} L${hx - k(9)} ${hy - k(22)} Z M${hx + k(20)} ${hy - k(16)} L${hx + k(19)} ${hy - k(32)} L${hx + k(9)} ${hy - k(22)} Z" fill="#F7C9C9"/>
  <circle cx="${hx}" cy="${hy}" r="${k(28)}" fill="${color}"/>
  ${f === 'sleepy' ? `<path d="M${hx - k(14)} ${hy - k(2)} q${k(5)} ${k(5)} ${k(10)} 0 M${hx + k(4)} ${hy - k(2)} q${k(5)} ${k(5)} ${k(10)} 0" stroke="#3A2A1E" stroke-width="${k(2.5)}" fill="none"/>` : f === 'sad' ? `<circle cx="${hx - k(10)}" cy="${hy - k(2)}" r="${k(4)}" fill="#3A2A1E"/><circle cx="${hx + k(10)}" cy="${hy - k(2)}" r="${k(4)}" fill="#3A2A1E"/><path d="M${hx - k(16)} ${hy - k(12)} l${k(9)} ${k(3)} M${hx + k(16)} ${hy - k(12)} l${k(-9)} ${k(3)}" stroke="#3A2A1E" stroke-width="${k(2)}"/>` : `<ellipse cx="${hx - k(10)}" cy="${hy - k(3)}" rx="${k(4.5)}" ry="${k(6)}" fill="#3A2A1E"/><ellipse cx="${hx + k(10)}" cy="${hy - k(3)}" rx="${k(4.5)}" ry="${k(6)}" fill="#3A2A1E"/><circle cx="${hx - k(8.5)}" cy="${hy - k(5.5)}" r="${k(1.6)}" fill="#fff"/><circle cx="${hx + k(11.5)}" cy="${hy - k(5.5)}" r="${k(1.6)}" fill="#fff"/>`}
  <path d="M${hx - k(3)} ${hy + k(6)} h${k(6)} l${k(-3)} ${k(4)} Z" fill="#E77B7B"/>
  <path d="M${hx} ${hy + k(10)} q${k(-5)} ${k(6)} ${k(-10)} ${k(2)} M${hx} ${hy + k(10)} q${k(5)} ${k(6)} ${k(10)} ${k(2)}" stroke="#3A2A1E" stroke-width="${k(1.8)}" fill="none"/>
  <path d="M${hx - k(14)} ${hy + k(6)} l${k(-20)} ${k(-3)} M${hx - k(14)} ${hy + k(10)} l${k(-20)} ${k(4)} M${hx + k(14)} ${hy + k(6)} l${k(20)} ${k(-3)} M${hx + k(14)} ${hy + k(10)} l${k(20)} ${k(4)}" stroke="#7A5A3A" stroke-width="${k(1.2)}"/></g>`;
}
function bird({ x, y, s = 1, color = '#4AA3DF', flip }) {
  const d = flip ? -1 : 1, k = (v) => v * s;
  return `<g><ellipse cx="${x}" cy="${y}" rx="${k(16)}" ry="${k(12)}" fill="${color}"/><circle cx="${x + d * k(12)}" cy="${y - k(10)}" r="${k(9)}" fill="${color}"/><path d="M${x + d * k(20)} ${y - k(11)} l${d * k(9)} ${k(3)} l${-d * k(9)} ${k(3)} Z" fill="#F2B233"/><circle cx="${x + d * k(14)}" cy="${y - k(12)}" r="${k(2)}" fill="#222"/><path d="M${x - d * k(4)} ${y - k(4)} q${-d * k(14)} ${-k(14)} ${-d * k(22)} ${-k(2)} q${d * k(10)} ${k(8)} ${d * k(22)} ${k(2)}" fill="#fff" opacity=".6"/><path d="M${x - d * k(14)} ${y + k(2)} l${-d * k(12)} ${k(4)}" stroke="${color}" stroke-width="${k(5)}" stroke-linecap="round"/><path d="M${x - k(3)} ${y + k(11)} v${k(6)} M${x + k(4)} ${y + k(11)} v${k(6)}" stroke="#F2B233" stroke-width="${k(2)}"/></g>`;
}
function butterfly({ x, y, s = 1, color = '#F27FB5' }) {
  const k = (v) => v * s;
  return `<g><ellipse cx="${x - k(9)}" cy="${y - k(6)}" rx="${k(10)}" ry="${k(8)}" fill="${color}"/><ellipse cx="${x + k(9)}" cy="${y - k(6)}" rx="${k(10)}" ry="${k(8)}" fill="${color}"/><ellipse cx="${x - k(7)}" cy="${y + k(6)}" rx="${k(7)}" ry="${k(6)}" fill="#F6C64B"/><ellipse cx="${x + k(7)}" cy="${y + k(6)}" rx="${k(7)}" ry="${k(6)}" fill="#F6C64B"/><rect x="${x - k(2)}" y="${y - k(10)}" width="${k(4)}" height="${k(20)}" rx="${k(2)}" fill="#3A2A1E"/></g>`;
}

// ── things ──────────────────────────────────────────────────
export function prop({ p, x, y = GROUND, s = 1, held, id: pid, color }) {
  const k = (v) => v * s;
  let out = '';
  switch (p) {
    case 'cookie': out = `<circle cx="${x}" cy="${y - (held ? 0 : k(10))}" r="${k(12)}" fill="#D9A15A"/><circle cx="${x - k(4)}" cy="${y - (held ? 3 : k(13))}" r="${k(2)}" fill="#6B3E1E"/><circle cx="${x + k(4)}" cy="${y + (held ? 2 : -k(8))}" r="${k(2)}" fill="#6B3E1E"/>`; break;
    case 'cookies': out = [-20, 0, 20].map((d) => `<circle cx="${x + k(d)}" cy="${y - k(10)}" r="${k(11)}" fill="#D9A15A"/><circle cx="${x + k(d - 3)}" cy="${y - k(12)}" r="${k(2)}" fill="#6B3E1E"/>`).join('') + `<ellipse cx="${x}" cy="${y}" rx="${k(40)}" ry="${k(7)}" fill="#fff" stroke="#D8D2C4"/>`; break;
    case 'dates': out = `<ellipse cx="${x}" cy="${y - k(8)}" rx="${k(34)}" ry="${k(12)}" fill="#C9A24A"/>${[-18, -6, 6, 18, -12, 0, 12].map((d, i) => `<ellipse cx="${x + k(d)}" cy="${y - k(i < 4 ? 14 : 22)}" rx="${k(6)}" ry="${k(9)}" fill="#6B3420" transform="rotate(${d * 2} ${x + k(d)} ${y - k(i < 4 ? 14 : 22)})"/>`).join('')}`; break;
    case 'cup': out = `<path d="M${x - k(10)} ${y - k(24)} L${x - k(8)} ${y} L${x + k(8)} ${y} L${x + k(10)} ${y - k(24)} Z" fill="#CFE8F5" stroke="#8DB9CF" stroke-width="${k(1.5)}"/><path d="M${x - k(9)} ${y - k(14)} L${x - k(8)} ${y} L${x + k(8)} ${y} L${x + k(9)} ${y - k(14)} Z" fill="#6FB6DE" opacity=".8"/>`; break;
    case 'bowl': out = `<path d="M${x - k(26)} ${y - k(16)} Q${x} ${y + k(10)} ${x + k(26)} ${y - k(16)} Z" fill="#E8E2D6" stroke="#C9C1B1"/><ellipse cx="${x}" cy="${y - k(16)}" rx="${k(24)}" ry="${k(4)}" fill="#6FB6DE"/>`; break;
    case 'plate': out = `<ellipse cx="${x}" cy="${y}" rx="${k(30)}" ry="${k(8)}" fill="#fff" stroke="#D8D2C4"/><ellipse cx="${x}" cy="${y - k(4)}" rx="${k(16)}" ry="${k(7)}" fill="${color ?? '#E3A33C'}"/>`; break;
    case 'vase': out = `<path d="M${x - k(12)} ${y - k(60)} Q${x - k(30)} ${y - k(30)} ${x - k(14)} ${y} L${x + k(14)} ${y} Q${x + k(30)} ${y - k(30)} ${x + k(12)} ${y - k(60)} Z" fill="#3B82B5"/><path d="M${x - k(18)} ${y - k(30)} h${k(36)}" stroke="#F6C64B" stroke-width="${k(4)}"/><path d="M${x} ${y - k(60)} q${k(-14)} ${k(-30)} ${k(-20)} ${k(-36)} M${x} ${y - k(60)} q${k(10)} ${k(-26)} ${k(18)} ${k(-40)}" stroke="#4E9A4E" stroke-width="${k(3)}" fill="none"/><circle cx="${x - k(20)}" cy="${y - k(98)}" r="${k(8)}" fill="#F27FB5"/><circle cx="${x + k(18)}" cy="${y - k(102)}" r="${k(8)}" fill="#F6C64B"/>`; break;
    case 'brokenvase': out = `<path d="M${x - k(30)} ${y} l${k(10)} ${k(-16)} l${k(12)} ${k(14)} Z" fill="#3B82B5"/><path d="M${x + k(4)} ${y} l${k(6)} ${k(-20)} l${k(14)} ${k(8)} l${k(-2)} ${k(12)} Z" fill="#3B82B5"/><path d="M${x + k(28)} ${y} l${k(8)} ${k(-10)} l${k(10)} ${k(10)} Z" fill="#3B82B5"/><path d="M${x - k(6)} ${y - k(2)} l${k(18)} ${k(-4)}" stroke="#F6C64B" stroke-width="${k(3)}"/><path d="M${x - k(40)} ${y - k(2)} q${k(-14)} ${k(-14)} ${k(-26)} ${k(-8)}" stroke="#4E9A4E" stroke-width="${k(3)}" fill="none"/><circle cx="${x - k(66)}" cy="${y - k(10)}" r="${k(7)}" fill="#F27FB5"/>`; break;
    case 'stone': out = `<path d="M${x - k(30)} ${y} Q${x - k(32)} ${y - k(26)} ${x - k(6)} ${y - k(30)} Q${x + k(28)} ${y - k(30)} ${x + k(30)} ${y} Z" fill="#8F8A82"/><path d="M${x - k(14)} ${y - k(20)} q${k(10)} ${k(-6)} ${k(22)} ${k(-2)}" stroke="#B5B0A8" stroke-width="${k(4)}" fill="none" stroke-linecap="round"/>`; break;
    case 'ball': out = `<circle cx="${x}" cy="${y - k(18)}" r="${k(18)}" fill="#E8503A"/><path d="M${x - k(18)} ${y - k(18)} Q${x} ${y - k(6)} ${x + k(18)} ${y - k(18)}" stroke="#fff" stroke-width="${k(3)}" fill="none"/><path d="M${x} ${y - k(36)} Q${x + k(8)} ${y - k(18)} ${x} ${y}" stroke="#fff" stroke-width="${k(3)}" fill="none"/>`; break;
    case 'gift': out = `<rect x="${x - k(22)}" y="${y - k(36)}" width="${k(44)}" height="${k(36)}" rx="${k(4)}" fill="#E85A71"/><rect x="${x - k(4)}" y="${y - k(36)}" width="${k(8)}" height="${k(36)}" fill="#F6C64B"/><rect x="${x - k(25)}" y="${y - k(44)}" width="${k(50)}" height="${k(10)}" rx="${k(3)}" fill="#D9485F"/><path d="M${x} ${y - k(44)} q${k(-16)} ${k(-16)} ${k(-18)} ${k(-2)} Z M${x} ${y - k(44)} q${k(16)} ${k(-16)} ${k(18)} ${k(-2)} Z" fill="#F6C64B"/>`; break;
    case 'book': out = `<rect x="${x - k(18)}" y="${y - k(24)}" width="${k(36)}" height="${k(26)}" rx="${k(3)}" fill="${color ?? '#1F7A5C'}"/><rect x="${x - k(14)}" y="${y - k(20)}" width="${k(28)}" height="${k(18)}" rx="${k(2)}" fill="none" stroke="#F6C64B" stroke-width="${k(1.5)}"/><path d="M${x} ${y - k(16)} l${k(5)} ${k(5)} l${k(-5)} ${k(5)} l${k(-5)} ${k(-5)} Z" fill="#F6C64B"/>`; break;
    case 'mushaf': out = `<path d="M${x - k(34)} ${y} L${x} ${y - k(30)} L${x + k(34)} ${y} M${x - k(34)} ${y - k(30)} L${x + k(34)} ${y}" stroke="#8A5A33" stroke-width="${k(6)}" stroke-linecap="round"/><path d="M${x - k(38)} ${y - k(40)} Q${x - k(20)} ${y - k(48)} ${x} ${y - k(38)} Q${x + k(20)} ${y - k(48)} ${x + k(38)} ${y - k(40)} L${x + k(38)} ${y - k(24)} Q${x + k(20)} ${y - k(32)} ${x} ${y - k(22)} Q${x - k(20)} ${y - k(32)} ${x - k(38)} ${y - k(24)} Z" fill="#FFF9EC" stroke="#C9A24A" stroke-width="${k(2)}"/><path d="M${x - k(30)} ${y - k(36)} h${k(22)} M${x - k(30)} ${y - k(31)} h${k(20)} M${x + k(8)} ${y - k(36)} h${k(22)} M${x + k(10)} ${y - k(31)} h${k(20)}" stroke="#7A8C84" stroke-width="${k(1.5)}"/>`; break;
    case 'mat': out = `<path d="M${x - k(60)} ${y} L${x - k(44)} ${y - k(26)} L${x + k(44)} ${y - k(26)} L${x + k(60)} ${y} Z" fill="#B23A48"/><path d="M${x - k(48)} ${y - k(4)} L${x - k(36)} ${y - k(22)} L${x + k(36)} ${y - k(22)} L${x + k(48)} ${y - k(4)} Z" fill="none" stroke="#F6C64B" stroke-width="${k(2)}"/><path d="M${x - k(12)} ${y - k(20)} Q${x} ${y - k(32)} ${x + k(12)} ${y - k(20)}" stroke="#F6C64B" stroke-width="${k(2)}" fill="none"/>`; break;
    case 'lantern': out = `<path d="M${x} ${y - k(70)} v${k(8)}" stroke="#8A5A12" stroke-width="${k(2)}"/><path d="M${x - k(10)} ${y - k(62)} h${k(20)} l${k(-3)} ${k(6)} h${k(-14)} Z" fill="#C9A24A"/><path d="M${x - k(10)} ${y - k(56)} h${k(20)} l${k(8)} ${k(22)} l${k(-8)} ${k(22)} h${k(-20)} l${k(-8)} ${k(-22)} Z" fill="#FBE3A6" stroke="#C9A24A" stroke-width="${k(2)}"/><circle cx="${x}" cy="${y - k(34)}" r="${k(22)}" fill="#FFD36B" opacity=".28"/>`; break;
    case 'tap': out = `<rect x="${x - k(40)}" y="${y - k(10)}" width="${k(80)}" height="${k(10)}" fill="#E8E2D6"/><path d="M${x} ${y - k(60)} v${k(-14)} h${k(24)}" stroke="#A9B4BC" stroke-width="${k(8)}" fill="none" stroke-linecap="round"/><path d="M${x - k(8)} ${y - k(80)} h${k(16)}" stroke="#A9B4BC" stroke-width="${k(5)}" stroke-linecap="round"/><path d="M${x - k(30)} ${y - k(10)} Q${x - k(30)} ${y - k(50)} ${x} ${y - k(50)} Q${x + k(30)} ${y - k(50)} ${x + k(30)} ${y - k(10)}" fill="#F2F5F7" stroke="#C8D2D8" stroke-width="${k(2)}"/>`; break;
    case 'water': out = `<path d="M${x} ${y} q${k(-4)} ${k(20)} 0 ${k(40)} q${k(4)} ${k(-20)} 0 ${k(-40)}" fill="#6FB6DE" opacity=".85"/>${[0, 1, 2].map((i) => `<path d="M${x + k(i * 6 - 6)} ${y + k(46 + i * 6)} q${k(-3)} ${k(6)} 0 ${k(8)} q${k(3)} ${k(-2)} 0 ${k(-8)}" fill="#6FB6DE"/>`).join('')}`; break;
    case 'drop': out = `<path d="M${x} ${y - k(14)} q${k(-9)} ${k(12)} 0 ${k(16)} q${k(9)} ${k(-4)} 0 ${k(-16)}" fill="#6FB6DE"/>`; break;
    case 'seed': out = `<ellipse cx="${x}" cy="${y - k(4)}" rx="${k(5)}" ry="${k(4)}" fill="#8A5A33"/>`; break;
    case 'pot': out = `<path d="M${x - k(22)} ${y - k(30)} L${x - k(16)} ${y} L${x + k(16)} ${y} L${x + k(22)} ${y - k(30)} Z" fill="#C8693C"/><rect x="${x - k(25)}" y="${y - k(36)}" width="${k(50)}" height="${k(8)}" rx="${k(3)}" fill="#B35A30"/><ellipse cx="${x}" cy="${y - k(34)}" rx="${k(20)}" ry="${k(3)}" fill="#6B4A2A"/>`; break;
    case 'sprout': out = `<path d="M${x} ${y} v${k(-24)}" stroke="#4E9A4E" stroke-width="${k(3)}"/><path d="M${x} ${y - k(18)} q${k(-16)} ${k(-12)} ${k(-20)} ${k(-2)} q${k(10)} ${k(8)} ${k(20)} ${k(2)} M${x} ${y - k(24)} q${k(16)} ${k(-14)} ${k(20)} ${k(-4)} q${k(-10)} ${k(8)} ${k(-20)} ${k(4)}" fill="#6CBF5A"/>`; break;
    case 'plant': out = `<path d="M${x} ${y} v${k(-60)}" stroke="#4E9A4E" stroke-width="${k(4)}"/>${[[-1, 20], [1, 32], [-1, 44], [1, 54]].map(([d, h]) => `<path d="M${x} ${y - k(h)} q${d * k(22)} ${k(-14)} ${d * k(28)} ${k(-2)} q${d * k(-12)} ${k(8)} ${d * k(-28)} ${k(2)}" fill="#6CBF5A"/>`).join('')}<circle cx="${x}" cy="${y - k(66)}" r="${k(9)}" fill="#F6C64B"/><circle cx="${x}" cy="${y - k(66)}" r="${k(4)}" fill="#E8503A"/>`; break;
    case 'tree': out = `<rect x="${x - k(12)}" y="${y - k(110)}" width="${k(24)}" height="${k(110)}" rx="${k(6)}" fill="#8A5A33"/><circle cx="${x}" cy="${y - k(140)}" r="${k(56)}" fill="#5DB35A"/><circle cx="${x - k(44)}" cy="${y - k(112)}" r="${k(38)}" fill="#4E9A4E"/><circle cx="${x + k(44)}" cy="${y - k(114)}" r="${k(40)}" fill="#4E9A4E"/><circle cx="${x + k(10)}" cy="${y - k(176)}" r="${k(34)}" fill="#6CBF5A"/>`; break;
    case 'fruittree': out = prop({ p: 'tree', x, y, s }) + [[-30, 150], [20, 120], [40, 160], [-10, 185], [-50, 115]].map(([dx, dy]) => `<circle cx="${x + k(dx)}" cy="${y - k(dy)}" r="${k(8)}" fill="#E8503A"/>`).join(''); break;
    case 'flowers': out = [-30, -10, 12, 32].map((d, i) => `<path d="M${x + k(d)} ${y} v${k(-22 - (i % 2) * 8)}" stroke="#4E9A4E" stroke-width="${k(2.5)}"/><circle cx="${x + k(d)}" cy="${y - k(24 + (i % 2) * 8)}" r="${k(7)}" fill="${['#F27FB5', '#F6C64B', '#8C7AE6', '#F08A3C'][i]}"/><circle cx="${x + k(d)}" cy="${y - k(24 + (i % 2) * 8)}" r="${k(2.5)}" fill="#fff"/>`).join(''); break;
    case 'bag': out = `<rect x="${x - k(20)}" y="${y - k(40)}" width="${k(40)}" height="${k(40)}" rx="${k(8)}" fill="${color ?? '#E85A71'}"/><path d="M${x - k(10)} ${y - k(40)} q${k(10)} ${k(-14)} ${k(20)} 0" stroke="${color ?? '#E85A71'}" stroke-width="${k(4)}" fill="none"/><rect x="${x - k(12)}" y="${y - k(24)}" width="${k(24)}" height="${k(12)}" rx="${k(3)}" fill="#fff" opacity=".5"/>`; break;
    case 'lunchbox': out = `<rect x="${x - k(24)}" y="${y - k(26)}" width="${k(48)}" height="${k(26)}" rx="${k(6)}" fill="${color ?? '#3BB3A6'}"/><rect x="${x - k(24)}" y="${y - k(30)}" width="${k(48)}" height="${k(8)}" rx="${k(4)}" fill="#2A8C82"/><path d="M${x - k(8)} ${y - k(30)} q${k(8)} ${k(-10)} ${k(16)} 0" stroke="#2A8C82" stroke-width="${k(3)}" fill="none"/>`; break;
    case 'sandwich': out = `<path d="M${x - k(16)} ${y} L${x} ${y - k(20)} L${x + k(16)} ${y} Z" fill="#F2D29B"/><path d="M${x - k(14)} ${y - k(3)} L${x + k(14)} ${y - k(3)}" stroke="#6CBF5A" stroke-width="${k(3)}"/>`; break;
    case 'apple': out = `<circle cx="${x}" cy="${y - k(10)}" r="${k(10)}" fill="#E8503A"/><path d="M${x} ${y - k(20)} q${k(2)} ${k(-6)} ${k(6)} ${k(-7)}" stroke="#6B4A2A" stroke-width="${k(2)}" fill="none"/><ellipse cx="${x + k(5)}" cy="${y - k(24)}" rx="${k(4)}" ry="${k(2)}" fill="#6CBF5A"/>`; break;
    case 'box': out = `<rect x="${x - k(26)}" y="${y - k(44)}" width="${k(52)}" height="${k(44)}" rx="${k(4)}" fill="#1F7A5C"/><rect x="${x - k(12)}" y="${y - k(46)}" width="${k(24)}" height="${k(5)}" rx="${k(2)}" fill="#0F2A24"/><path d="M${x} ${y - k(30)} l${k(8)} ${k(8)} l${k(-8)} ${k(8)} l${k(-8)} ${k(-8)} Z" fill="#F6C64B"/>`; break;
    case 'coin': out = `<circle cx="${x}" cy="${y}" r="${k(7)}" fill="#F6C64B" stroke="#C9A24A" stroke-width="${k(1.5)}"/>`; break;
    case 'umbrella': out = `<path d="M${x - k(50)} ${y} Q${x} ${y - k(60)} ${x + k(50)} ${y} Q${x + k(33)} ${y - k(8)} ${x + k(17)} ${y} Q${x} ${y - k(8)} ${x - k(17)} ${y} Q${x - k(33)} ${y - k(8)} ${x - k(50)} ${y} Z" fill="${color ?? '#E8503A'}"/><path d="M${x} ${y} v${k(56)} q0 ${k(10)} ${k(-10)} ${k(8)}" stroke="#3A2A1E" stroke-width="${k(3)}" fill="none"/>`; break;
    case 'puddle': out = `<ellipse cx="${x}" cy="${y}" rx="${k(60)}" ry="${k(10)}" fill="${color ?? '#7FB3D8'}" opacity=".7"/>`; break;
    case 'toycar': out = `<rect x="${x - k(26)}" y="${y - k(22)}" width="${k(52)}" height="${k(14)}" rx="${k(5)}" fill="#3B82B5"/><path d="M${x - k(14)} ${y - k(22)} l${k(6)} ${k(-10)} h${k(16)} l${k(6)} ${k(10)} Z" fill="#6FB6DE"/><circle cx="${x - k(14)}" cy="${y - k(6)}" r="${k(6)}" fill="#333"/><circle cx="${x + k(14)}" cy="${y - k(6)}" r="${k(6)}" fill="#333"/>`; break;
    case 'blocks': out = `<rect x="${x - k(30)}" y="${y - k(20)}" width="${k(20)}" height="${k(20)}" fill="#E8503A"/><rect x="${x - k(8)}" y="${y - k(20)}" width="${k(20)}" height="${k(20)}" fill="#4A90D9"/><rect x="${x - k(19)}" y="${y - k(40)}" width="${k(20)}" height="${k(20)}" fill="#F6C64B"/>`; break;
    case 'tower': { const n = s >= 1 ? Math.round(s * 4) : 3, cs = ['#E8503A', '#4A90D9', '#F6C64B', '#6CBF5A', '#8C7AE6']; out = Array.from({ length: n }, (_, i) => `<rect x="${x - 22 + (i % 2) * 4}" y="${y - 40 * (i + 1)}" width="40" height="40" rx="4" fill="${cs[i % 5]}" stroke="#000" stroke-opacity=".12" stroke-width="2"/><path d="M${x - 10 + (i % 2) * 4} ${y - 40 * i - 28} l8 8 l8 -8" stroke="#fff" stroke-opacity=".5" stroke-width="3" fill="none"/>`).join(''); break; }
    case 'tumble': out = [[-60, 0, 10], [-10, 0, -15], [40, 0, 25], [10, -40, 40], [90, 0, -5]].map(([dx, dy, r], i) => `<rect x="${x + dx - 20}" y="${y + dy - 40}" width="40" height="40" rx="4" fill="${['#E8503A', '#4A90D9', '#F6C64B', '#6CBF5A', '#8C7AE6'][i]}" transform="rotate(${r} ${x + dx} ${y + dy - 20})"/>`).join(''); break;
    case 'tapon': out = prop({ p: 'tap', x, y, s }) + prop({ p: 'water', x: x + k(24), y: y - k(70), s }); break;
    case 'crayons': out = ['#E8503A', '#4A90D9', '#6CBF5A', '#F6C64B'].map((c2, i) => `<rect x="${x - k(20) + k(i * 11)}" y="${y - k(26)}" width="${k(8)}" height="${k(26)}" rx="${k(2)}" fill="${c2}"/><path d="M${x - k(20) + k(i * 11)} ${y - k(26)} l${k(4)} ${k(-7)} l${k(4)} ${k(7)} Z" fill="${c2}"/>`).join(''); break;
    case 'paper': out = `<rect x="${x - k(26)}" y="${y - k(34)}" width="${k(52)}" height="${k(34)}" rx="${k(2)}" fill="#fff" stroke="#D8D2C4"/><circle cx="${x + k(10)}" cy="${y - k(22)}" r="${k(6)}" fill="#F6C64B"/><path d="M${x - k(20)} ${y - k(6)} l${k(12)} ${k(-12)} l${k(10)} ${k(10)} l${k(8)} ${k(-6)} l${k(10)} ${k(8)}" stroke="#6CBF5A" stroke-width="${k(3)}" fill="none"/>`; break;
    case 'torn': out = `<path d="M${x - k(26)} ${y - k(34)} h${k(24)} l${k(-4)} ${k(10)} l${k(6)} ${k(8)} l${k(-5)} ${k(16)} h${k(-21)} Z" fill="#fff" stroke="#D8D2C4"/><path d="M${x + k(4)} ${y - k(34)} h${k(22)} v${k(34)} h${k(-22)} l${k(5)} ${k(-16)} l${k(-6)} ${k(-8)} Z" fill="#fff" stroke="#D8D2C4"/>`; break;
    case 'soap': out = `<rect x="${x - k(14)}" y="${y - k(12)}" width="${k(28)}" height="${k(12)}" rx="${k(6)}" fill="#F7B6D2"/>`; break;
    case 'towel': out = `<rect x="${x - k(16)}" y="${y - k(50)}" width="${k(32)}" height="${k(50)}" rx="${k(3)}" fill="#7FC8C0"/><path d="M${x - k(16)} ${y - k(10)} h${k(32)}" stroke="#fff" stroke-width="${k(3)}"/>`; break;
    case 'bed': out = `<rect x="${x - k(110)}" y="${y - k(60)}" width="${k(220)}" height="${k(40)}" rx="${k(10)}" fill="#8A5A33"/><rect x="${x - k(104)}" y="${y - k(74)}" width="${k(208)}" height="${k(26)}" rx="${k(10)}" fill="#BFD9EA"/><rect x="${x - k(118)}" y="${y - k(110)}" width="${k(16)}" height="${k(110)}" rx="${k(6)}" fill="#7A4E2C"/><rect x="${x + k(102)}" y="${y - k(84)}" width="${k(16)}" height="${k(84)}" rx="${k(6)}" fill="#7A4E2C"/><ellipse cx="${x - k(76)}" cy="${y - k(80)}" rx="${k(26)}" ry="${k(12)}" fill="#fff"/>`; break;
    case 'blanket': out = `<path d="M${x - k(42)} ${y - k(66)} Q${x - k(54)} ${y - k(100)} ${x - k(18)} ${y - k(100)} L${x + k(104)} ${y - k(94)} L${x + k(104)} ${y - k(56)} L${x - k(42)} ${y - k(56)} Z" fill="#F6C64B"/><path d="M${x + k(4)} ${y - k(98)} v${k(42)} M${x + k(44)} ${y - k(97)} v${k(40)} M${x + k(80)} ${y - k(95)} v${k(38)}" stroke="#E8A93C" stroke-width="${k(3)}"/>`; break;
    case 'bus': out = `<rect x="${x - k(170)}" y="${y - k(150)}" width="${k(340)}" height="${k(126)}" rx="${k(22)}" fill="#F6C64B"/><rect x="${x - k(170)}" y="${y - k(52)}" width="${k(340)}" height="${k(10)}" fill="#E0A82C"/>${[0, 1, 2, 3].map((i) => `<rect x="${x - k(150) + k(i * 64)}" y="${y - k(134)}" width="${k(50)}" height="${k(44)}" rx="${k(8)}" fill="#CFE8F5"/>`).join('')}<rect x="${x + k(110)}" y="${y - k(134)}" width="${k(44)}" height="${k(90)}" rx="${k(8)}" fill="#BCD8E8" stroke="#E0A82C" stroke-width="${k(3)}"/><circle cx="${x - k(100)}" cy="${y - k(22)}" r="${k(24)}" fill="#333"/><circle cx="${x - k(100)}" cy="${y - k(22)}" r="${k(10)}" fill="#999"/><circle cx="${x + k(100)}" cy="${y - k(22)}" r="${k(24)}" fill="#333"/><circle cx="${x + k(100)}" cy="${y - k(22)}" r="${k(10)}" fill="#999"/><circle cx="${x + k(162)}" cy="${y - k(64)}" r="${k(7)}" fill="#FFF3B0"/>`; break;
    case 'table': out = `<rect x="${x - k(130)}" y="${y - k(96)}" width="${k(260)}" height="${k(14)}" rx="${k(5)}" fill="#A9733F"/><rect x="${x - k(116)}" y="${y - k(84)}" width="${k(12)}" height="${k(84)}" fill="#8A5A33"/><rect x="${x + k(104)}" y="${y - k(84)}" width="${k(12)}" height="${k(84)}" fill="#8A5A33"/>`; break;
    case 'cloth': out = `<path d="M${x - k(130)} ${y} h${k(260)} l${k(10)} ${k(22)} h${k(-280)} Z" fill="#F2E6CF" stroke="#D8C7A3"/>`; break;
    case 'desk': out = `<rect x="${x - k(60)}" y="${y - k(64)}" width="${k(120)}" height="${k(10)}" rx="${k(3)}" fill="#C99B62"/><rect x="${x - k(52)}" y="${y - k(54)}" width="${k(8)}" height="${k(54)}" fill="#8A6A44"/><rect x="${x + k(44)}" y="${y - k(54)}" width="${k(8)}" height="${k(54)}" fill="#8A6A44"/>`; break;
    case 'shoes': out = `<ellipse cx="${x - k(10)}" cy="${y - k(5)}" rx="${k(12)}" ry="${k(6)}" fill="${color ?? '#4A3B30'}"/><ellipse cx="${x + k(14)}" cy="${y - k(5)}" rx="${k(12)}" ry="${k(6)}" fill="${color ?? '#4A3B30'}"/>`; break;
    case 'shoerack': out = `<rect x="${x - k(70)}" y="${y - k(60)}" width="${k(140)}" height="${k(60)}" rx="${k(4)}" fill="#A9733F"/><path d="M${x - k(66)} ${y - k(30)} h${k(132)}" stroke="#8A5A33" stroke-width="${k(4)}"/>`; break;
    case 'heart': out = `<path d="M${x} ${y} C${x - k(26)} ${y - k(14)} ${x - k(18)} ${y - k(34)} ${x} ${y - k(22)} C${x + k(18)} ${y - k(34)} ${x + k(26)} ${y - k(14)} ${x} ${y} Z" fill="${color ?? '#E85A71'}"/>`; break;
    case 'star': out = `<path d="M${x} ${y - k(12)} l${k(3.5)} ${k(7.5)} l${k(8)} ${k(1)} l${k(-6)} ${k(5.5)} l${k(1.7)} ${k(8)} l${k(-7.2)} ${k(-4)} l${k(-7.2)} ${k(4)} l${k(1.7)} ${k(-8)} l${k(-6)} ${k(-5.5)} l${k(8)} ${k(-1)} Z" fill="${color ?? '#F6C64B'}"/>`; break;
    case 'ant': out = `<g><ellipse cx="${x - k(8)}" cy="${y - k(5)}" rx="${k(5)}" ry="${k(4)}" fill="#3A2A1E"/><ellipse cx="${x}" cy="${y - k(5)}" rx="${k(3.5)}" ry="${k(3)}" fill="#3A2A1E"/><circle cx="${x + k(6)}" cy="${y - k(7)}" r="${k(3.5)}" fill="#3A2A1E"/><path d="M${x - k(4)} ${y - k(3)} l${k(-4)} ${k(4)} M${x} ${y - k(3)} l0 ${k(4)} M${x + k(2)} ${y - k(3)} l${k(4)} ${k(4)} M${x + k(7)} ${y - k(10)} l${k(4)} ${k(-5)}" stroke="#3A2A1E" stroke-width="${k(1.2)}"/></g>`; break;
    case 'crumb': out = `<circle cx="${x}" cy="${y - k(3)}" r="${k(3)}" fill="#D9A15A"/>`; break;
    case 'bandage': out = `<rect x="${x - k(12)}" y="${y - k(5)}" width="${k(24)}" height="${k(10)}" rx="${k(5)}" fill="#F2C9A0" transform="rotate(-20 ${x} ${y})"/>`; break;
    case 'cat': out = cat({ x, y, s, color }); break;
    case 'catdrink': out = cat({ x, y, s, color, drinking: true }); break;
    case 'catsad': out = cat({ x, y, s, color, face: 'sad' }); break;
    case 'catsleep': out = cat({ x, y, s, color, face: 'sleepy' }); break;
    case 'tent': out = `<path d="M${x - k(80)} ${y} L${x} ${y - k(110)} L${x + k(80)} ${y} Z" fill="${color ?? '#E8743A'}"/><path d="M${x} ${y - k(110)} L${x + k(26)} ${y} L${x - k(18)} ${y} Z" fill="#8A3B1E" opacity=".6"/><path d="M${x} ${y - k(110)} v${k(-14)}" stroke="#6B4A2A" stroke-width="${k(4)}"/>`; break;
    case 'campfire': out = `<path d="M${x - k(30)} ${y} l${k(60)} ${k(-14)} M${x - k(30)} ${y - k(14)} l${k(60)} ${k(14)}" stroke="#7A4E2C" stroke-width="${k(9)}" stroke-linecap="round"/><path d="M${x} ${y - k(10)} q${k(-26)} ${k(-26)} ${k(-4)} ${k(-62)} q${k(4)} ${k(24)} ${k(14)} ${k(20)} q${k(4)} ${k(-14)} ${k(-2)} ${k(-26)} q${k(28)} ${k(28)} ${k(12)} ${k(68)} Z" fill="#F6A23C"/><path d="M${x} ${y - k(12)} q${k(-12)} ${k(-14)} ${k(0)} ${k(-34)} q${k(14)} ${k(18)} ${k(0)} ${k(34)} Z" fill="#FFE27A"/><circle cx="${x}" cy="${y - k(30)}" r="${k(70)}" fill="#FFB347" opacity=".14"/>`; break;
    // the Stories of the Prophets: the ark, the whale, the fire and the gourd vine (things and places only, never a person)
    case 'ark': out = `<path d="M${x - k(230)} ${y - k(120)} H${x + k(230)} Q${x + k(214)} ${y - k(14)} ${x + k(150)} ${y} H${x - k(150)} Q${x - k(214)} ${y - k(14)} ${x - k(230)} ${y - k(120)} Z" fill="#8A5A33"/>${[90, 60, 30].map((d) => `<path d="M${x - k(222 - (120 - d) * 0.5)} ${y - k(d)} H${x + k(222 - (120 - d) * 0.5)}" stroke="#6B4226" stroke-width="${k(3)}"/>`).join('')}<rect x="${x - k(236)}" y="${y - k(128)}" width="${k(472)}" height="${k(12)}" rx="${k(4)}" fill="#6B4226"/><rect x="${x - k(120)}" y="${y - k(210)}" width="${k(240)}" height="${k(84)}" fill="#B07A4A"/><path d="M${x - k(140)} ${y - k(208)} L${x} ${y - k(262)} L${x + k(140)} ${y - k(208)} Z" fill="#6B4226"/>${[-75, -25, 25, 75].map((d) => `<rect x="${x + k(d - 13)}" y="${y - k(186)}" width="${k(26)}" height="${k(26)}" rx="${k(5)}" fill="#FFE9B0" stroke="#6B4226" stroke-width="${k(3)}"/>`).join('')}<rect x="${x - k(14)}" y="${y - k(150)}" width="${k(28)}" height="${k(24)}" fill="#6B4226"/>`; break;
    case 'whale': out = `<path d="M${x + k(120)} ${y - k(70)} q${k(40)} ${k(-10)} ${k(60)} ${k(-50)} q${k(10)} ${k(30)} ${k(-14)} ${k(52)} q${k(36)} ${k(2)} ${k(60)} ${k(34)} q${k(-40)} ${k(6)} ${k(-70)} ${k(-10)} Z" fill="${color ?? '#3E6FA8'}"/><ellipse cx="${x}" cy="${y - k(60)}" rx="${k(150)}" ry="${k(62)}" fill="${color ?? '#3E6FA8'}"/><path d="M${x - k(146)} ${y - k(46)} Q${x - k(20)} ${y + k(14)} ${x + k(130)} ${y - k(40)} Q${x} ${y - k(20)} ${x - k(146)} ${y - k(46)} Z" fill="#BFD9EA"/><path d="M${x - k(150)} ${y - k(52)} q${k(26)} ${k(12)} ${k(54)} ${k(2)}" stroke="#24476B" stroke-width="${k(3)}" fill="none" stroke-linecap="round"/><circle cx="${x - k(100)}" cy="${y - k(78)}" r="${k(7)}" fill="#1A2A44"/><circle cx="${x - k(98)}" cy="${y - k(80)}" r="${k(2.2)}" fill="#fff"/><path d="M${x - k(10)} ${y - k(30)} q${k(30)} ${k(26)} ${k(60)} ${k(14)}" fill="#2F5A8E"/>${held ? '' : `<path d="M${x - k(60)} ${y - k(122)} q${k(-16)} ${k(-30)} ${k(-34)} ${k(-34)} M${x - k(60)} ${y - k(122)} q${k(0)} ${k(-34)} ${k(4)} ${k(-44)} M${x - k(60)} ${y - k(122)} q${k(16)} ${k(-30)} ${k(36)} ${k(-32)}" stroke="#BFE6FA" stroke-width="${k(5)}" fill="none" stroke-linecap="round"/>`}`; break;
    case 'bigfire': case 'coolfire': {
      const cool = p === 'coolfire', [c1, c2, c3] = cool ? ['#9ED8F0', '#CDEFFA', '#FFFFFF'] : ['#E8503A', '#F6A23C', '#FFE27A'];
      const flame = (dx, h, c) => `<path d="M${x + k(dx)} ${y - k(6)} q${k(-h * 0.42)} ${k(-h * 0.4)} ${k(-h * 0.06)} ${k(-h)} q${k(h * 0.06)} ${k(h * 0.38)} ${k(h * 0.22)} ${k(h * 0.32)} q${k(h * 0.06)} ${k(-h * 0.22)} ${k(-h * 0.03)} ${k(-h * 0.42)} q${k(h * 0.44)} ${k(h * 0.44)} ${k(h * 0.2)} ${k(h * 1.1)} Z" fill="${c}"/>`;
      out = `<circle cx="${x}" cy="${y - k(90)}" r="${k(190)}" fill="${cool ? '#BDE7F7' : '#FFB347'}" opacity="${cool ? 0.3 : 0.22}"/>`
        + [[-150, 34], [-90, 30], [-30, 36], [30, 32], [90, 30], [150, 34]].map(([dx, w]) => `<rect x="${x + k(dx - w)}" y="${y - k(16)}" width="${k(w * 2)}" height="${k(16)}" rx="${k(8)}" fill="${cool ? '#A08A72' : '#7A4E2C'}"/>`).join('')
        + [[-120, 120], [-60, 170], [0, 210], [60, 160], [120, 130]].map(([dx, h]) => flame(dx, h, c1)).join('')
        + [[-90, 100], [-30, 140], [30, 150], [90, 110]].map(([dx, h]) => flame(dx, h, c2)).join('')
        + [[-50, 80], [10, 100], [60, 70]].map(([dx, h]) => flame(dx, h, c3)).join('')
        + (cool ? [-170, -110, 110, 170].map((dx) => prop({ p: 'flowers', x: x + k(dx), y, s: s * 1.2 })).join('') : '');
      break;
    }
    case 'gourd': out = `<path d="M${x - k(150)} ${y - k(4)} Q${x - k(60)} ${y - k(90)} ${x} ${y - k(70)} T${x + k(150)} ${y - k(10)}" stroke="#4E9A4E" stroke-width="${k(6)}" fill="none" stroke-linecap="round"/>${[[-120, -40], [-70, -90], [-20, -84], [40, -96], [90, -60], [130, -30], [-40, -40], [60, -40]].map(([dx, dy], i) => `<path d="M${x + k(dx)} ${y + k(dy)} q${k(-34)} ${k(-20)} ${k(-10)} ${k(-54)} q${k(30)} ${k(6)} ${k(36)} ${k(26)} q${k(4)} ${k(22)} ${k(-26)} ${k(28)} Z" fill="${i % 2 ? '#5DB35A' : '#6CBF5A'}" stroke="#3F7F3F" stroke-width="${k(1.5)}"/>`).join('')}${[[-60, -14], [70, -12]].map(([dx, dy]) => `<ellipse cx="${x + k(dx)}" cy="${y + k(dy)}" rx="${k(22)}" ry="${k(15)}" fill="#C9D86A" stroke="#8FA03A" stroke-width="${k(2)}"/>`).join('')}`; break;
    case 'boat': out = `<path d="M${x - k(90)} ${y - k(30)} h${k(180)} l${k(-24)} ${k(36)} h${k(-132)} Z" fill="${color ?? '#B35A30'}"/><path d="M${x - k(90)} ${y - k(30)} h${k(180)}" stroke="#7A3B1E" stroke-width="${k(5)}"/><path d="M${x - k(40)} ${y - k(30)} v${k(-8)} M${x + k(40)} ${y - k(30)} v${k(-8)}" stroke="#7A3B1E" stroke-width="${k(4)}"/>`; break;
    case 'sheep': out = `<g>${[[-18, -30], [0, -38], [18, -30], [-24, -18], [24, -18], [0, -22]].map(([a, b]) => `<circle cx="${x + k(a)}" cy="${y + k(b)}" r="${k(16)}" fill="#F7F4EE" stroke="#D8D2C4" stroke-width="${k(1)}"/>`).join('')}<ellipse cx="${x - k(36)}" cy="${y - k(32)}" rx="${k(11)}" ry="${k(13)}" fill="#3A2A1E"/><circle cx="${x - k(39)}" cy="${y - k(35)}" r="${k(2)}" fill="#fff"/><path d="M${x - k(16)} ${y - k(8)} v${k(10)} M${x + k(14)} ${y - k(8)} v${k(10)}" stroke="#3A2A1E" stroke-width="${k(5)}" stroke-linecap="round"/></g>`; break;
    case 'camel': out = `<g><path d="M${x - k(50)} ${y - k(60)} q${k(20)} ${k(-40)} ${k(40)} 0 q${k(20)} ${k(-36)} ${k(40)} 0 q${k(14)} ${k(20)} 0 ${k(26)} h${k(-80)} Z" fill="#C9955A"/><path d="M${x + k(30)} ${y - k(50)} q${k(26)} ${k(-10)} ${k(26)} ${k(-50)}" stroke="#C9955A" stroke-width="${k(13)}" fill="none" stroke-linecap="round"/><ellipse cx="${x + k(64)}" cy="${y - k(100)}" rx="${k(16)}" ry="${k(9)}" fill="#C9955A"/><circle cx="${x + k(68)}" cy="${y - k(103)}" r="${k(2)}" fill="#3A2A1E"/>${[-40, -22, 14, 30].map((d) => `<path d="M${x + k(d)} ${y - k(36)} v${k(36)}" stroke="#B38246" stroke-width="${k(7)}" stroke-linecap="round"/>`).join('')}<path d="M${x - k(30)} ${y - k(78)} q${k(30)} ${k(-14)} ${k(56)} ${k(2)}" stroke="#B23A48" stroke-width="${k(8)}" fill="none"/></g>`; break;
    case 'map': out = `<path d="M${x - k(34)} ${y - k(46)} h${k(68)} v${k(46)} h${k(-68)} Z" fill="#F4E2B8" stroke="#B08C5E" stroke-width="${k(2)}"/><path d="M${x - k(26)} ${y - k(10)} q${k(14)} ${k(-20)} ${k(24)} ${k(-8)} t${k(22)} ${k(-14)}" stroke="#8A5A33" stroke-width="${k(2)}" stroke-dasharray="${k(3)} ${k(3)}" fill="none"/><path d="M${x + k(16)} ${y - k(38)} l${k(8)} ${k(8)} M${x + k(24)} ${y - k(38)} l${k(-8)} ${k(8)}" stroke="#C0392B" stroke-width="${k(3)}"/>`; break;
    case 'compass': out = `<circle cx="${x}" cy="${y - k(14)}" r="${k(14)}" fill="#F6C64B" stroke="#8A5A12" stroke-width="${k(2)}"/><path d="M${x} ${y - k(26)} l${k(4)} ${k(12)} l${k(-4)} ${k(12)} l${k(-4)} ${k(-12)} Z" fill="#C0392B"/>`; break;
    case 'kite': out = `<path d="M${x} ${y - k(60)} l${k(26)} ${k(30)} l${k(-26)} ${k(40)} l${k(-26)} ${k(-40)} Z" fill="${color ?? '#E85A71'}"/><path d="M${x} ${y - k(60)} v${k(70)} M${x - k(26)} ${y - k(30)} h${k(52)}" stroke="#fff" stroke-width="${k(2)}"/><path d="M${x} ${y + k(10)} q${k(-10)} ${k(20)} ${k(6)} ${k(36)} t${k(-4)} ${k(36)}" stroke="#3A2A1E" stroke-width="${k(2)}" fill="none"/>`; break;
    case 'snowman': out = `<circle cx="${x}" cy="${y - k(30)}" r="${k(30)}" fill="#fff" stroke="#D6E2EE" stroke-width="${k(2)}"/><circle cx="${x}" cy="${y - k(80)}" r="${k(22)}" fill="#fff" stroke="#D6E2EE" stroke-width="${k(2)}"/><circle cx="${x - k(7)}" cy="${y - k(84)}" r="${k(2.5)}" fill="#333"/><circle cx="${x + k(7)}" cy="${y - k(84)}" r="${k(2.5)}" fill="#333"/><path d="M${x} ${y - k(78)} l${k(16)} ${k(4)} l${k(-16)} ${k(3)} Z" fill="#F08A3C"/><path d="M${x - k(22)} ${y - k(62)} h${k(44)}" stroke="#C0392B" stroke-width="${k(6)}" stroke-linecap="round"/>`; break;
    case 'oillamp': out = `<path d="M${x - k(20)} ${y - k(6)} q${k(20)} ${k(-24)} ${k(36)} ${k(-6)} l${k(10)} ${k(-6)} q${k(-6)} ${k(14)} ${k(-14)} ${k(14)} q${k(-16)} ${k(8)} ${k(-32)} ${k(-2)} Z" fill="#C9A24A"/><path d="M${x + k(26)} ${y - k(18)} q${k(-6)} ${k(-10)} 0 ${k(-20)} q${k(6)} ${k(10)} 0 ${k(20)}" fill="#FFB347"/><circle cx="${x + k(26)}" cy="${y - k(26)}" r="${k(22)}" fill="#FFD36B" opacity=".25"/>`; break;
    case 'footprints': out = [0, 1, 2, 3, 4].map((i) => `<ellipse cx="${x + k(i * 34)}" cy="${y - k((i % 2) * 10)}" rx="${k(7)}" ry="${k(4)}" fill="#000" opacity=".15"/>`).join(''); break;
    case 'shell': out = `<path d="M${x - k(14)} ${y} q${k(14)} ${k(-30)} ${k(28)} 0 Z" fill="#F7C9D9" stroke="#E39AB4" stroke-width="${k(1.5)}"/><path d="M${x} ${y} v${k(-14)} M${x - k(7)} ${y} l${k(4)} ${k(-12)} M${x + k(7)} ${y} l${k(-4)} ${k(-12)}" stroke="#E39AB4" stroke-width="${k(1.2)}"/>`; break;
    case 'starfish': out = `<path d="M${x} ${y - k(20)} l${k(5)} ${k(12)} l${k(13)} ${k(1)} l${k(-10)} ${k(8)} l${k(4)} ${k(13)} l${k(-12)} ${k(-7)} l${k(-12)} ${k(7)} l${k(4)} ${k(-13)} l${k(-10)} ${k(-8)} l${k(13)} ${k(-1)} Z" fill="#F08A3C"/>`; break;
    case 'bucket': out = `<path d="M${x - k(16)} ${y - k(28)} L${x - k(12)} ${y} h${k(24)} L${x + k(16)} ${y - k(28)} Z" fill="${color ?? '#4A90D9'}"/><path d="M${x - k(16)} ${y - k(28)} q${k(16)} ${k(-22)} ${k(32)} 0" stroke="#333" stroke-width="${k(2)}" fill="none"/>`; break;
    case 'litter': out = `<path d="M${x - k(12)} ${y} l${k(6)} ${k(-14)} l${k(12)} ${k(4)} l${k(-4)} ${k(10)} Z" fill="#9AA3AE"/><rect x="${x + k(10)}" y="${y - k(10)}" width="${k(16)}" height="${k(10)}" rx="${k(2)}" fill="#E8503A"/>`; break;
    case 'binbag': out = `<path d="M${x - k(20)} ${y} q${k(-6)} ${k(-34)} ${k(8)} ${k(-40)} l${k(-4)} ${k(-8)} h${k(32)} l${k(-4)} ${k(8)} q${k(14)} ${k(6)} ${k(8)} ${k(40)} Z" fill="#3A3F47"/>`; break;
    case 'moon': out = `<circle cx="${x}" cy="${y}" r="${k(26)}" fill="#FFF3C4"/><circle cx="${x + k(10)}" cy="${y - k(6)}" r="${k(23)}" fill="${color ?? '#2A3A5E'}"/>`; break;
    case 'telescope': out = `<path d="M${x - k(30)} ${y} l${k(24)} ${k(-40)} M${x + k(10)} ${y} l${k(-4)} ${k(-40)}" stroke="#6B4A2A" stroke-width="${k(4)}"/><rect x="${x - k(30)}" y="${y - k(62)}" width="${k(64)}" height="${k(14)}" rx="${k(6)}" fill="#2F6FA8" transform="rotate(-28 ${x} ${y - k(55)})"/>`; break;
    case 'basket': out = `<path d="M${x - k(30)} ${y - k(26)} L${x - k(22)} ${y} h${k(44)} L${x + k(30)} ${y - k(26)} Z" fill="#C99B62" stroke="#8A6A44" stroke-width="${k(1.5)}"/><path d="M${x - k(24)} ${y - k(26)} q${k(24)} ${k(-36)} ${k(48)} 0" stroke="#8A6A44" stroke-width="${k(3)}" fill="none"/>${[-14, 0, 14].map((d, i) => `<circle cx="${x + k(d)}" cy="${y - k(30)}" r="${k(8)}" fill="${['#E8503A', '#F6C64B', '#6CBF5A'][i]}"/>`).join('')}`; break;
    case 'bench': out = `<rect x="${x - k(60)}" y="${y - k(40)}" width="${k(120)}" height="${k(10)}" rx="${k(3)}" fill="#8A5A33"/><rect x="${x - k(60)}" y="${y - k(66)}" width="${k(120)}" height="${k(8)}" rx="${k(3)}" fill="#8A5A33"/><path d="M${x - k(50)} ${y - k(30)} v${k(30)} M${x + k(50)} ${y - k(30)} v${k(30)}" stroke="#5A3A1E" stroke-width="${k(5)}"/>`; break;
    case 'sign': out = `<path d="M${x} ${y} v${k(-70)}" stroke="#8A5A33" stroke-width="${k(6)}"/><path d="M${x - k(4)} ${y - k(70)} h${k(60)} l${k(12)} ${k(12)} l${k(-12)} ${k(12)} h${k(-60)} Z" fill="#C99B62" stroke="#8A6A44" stroke-width="${k(1.5)}"/>`; break;
    case 'letter': out = `<rect x="${x - k(18)}" y="${y - k(26)}" width="${k(36)}" height="${k(24)}" rx="${k(2)}" fill="#fff" stroke="#C9B89C" stroke-width="${k(1.5)}"/><path d="M${x - k(18)} ${y - k(26)} l${k(18)} ${k(14)} l${k(18)} ${k(-14)}" stroke="#C9B89C" stroke-width="${k(1.5)}" fill="none"/>`; break;
    case 'cake': out = `<rect x="${x - k(28)}" y="${y - k(30)}" width="${k(56)}" height="${k(30)}" rx="${k(5)}" fill="#F7C9D9"/><path d="M${x - k(28)} ${y - k(22)} q${k(7)} ${k(8)} ${k(14)} 0 t${k(14)} 0 t${k(14)} 0 t${k(14)} 0" stroke="#fff" stroke-width="${k(4)}" fill="none"/><circle cx="${x}" cy="${y - k(36)}" r="${k(5)}" fill="#E8503A"/>`; break;
    case 'books': out = [0, 1, 2].map((i) => `<rect x="${x - k(24) + k(i * 3)}" y="${y - k(10) * (i + 1)}" width="${k(48)}" height="${k(9)}" rx="${k(2)}" fill="${['#2F6FA8', '#C0392B', '#2E8B57'][i]}"/>`).join(''); break;
    case 'fish': out = `<ellipse cx="${x}" cy="${y - k(10)}" rx="${k(16)}" ry="${k(8)}" fill="${color ?? '#F08A3C'}"/><path d="M${x + k(14)} ${y - k(10)} l${k(10)} ${k(-8)} v${k(16)} Z" fill="${color ?? '#F08A3C'}"/><circle cx="${x - k(8)}" cy="${y - k(12)}" r="${k(2)}" fill="#222"/>`; break;
    case 'castle': out = `<path d="M${x - k(70)} ${y} V${y - k(46)} h${k(16)} v${k(-10)} h${k(12)} v${k(10)} h${k(14)} V${y - k(84)} h${k(12)} v${k(-10)} h${k(12)} v${k(10)} h${k(12)} V${y - k(46)} h${k(14)} v${k(-10)} h${k(12)} v${k(10)} h${k(16)} V${y} Z" fill="#E8C27A" stroke="#B8914E" stroke-width="${k(2)}"/><path d="M${x - k(8)} ${y} v${k(-20)} a${k(8)} ${k(8)} 0 0 1 ${k(16)} 0 v${k(20)} Z" fill="#B8914E"/>${[-50, 0, 46].map((d) => `<circle cx="${x + k(d)}" cy="${y - k(d ? 30 : 64)}" r="${k(2.5)}" fill="#C9A060"/>`).join('')}<path d="M${x} ${y - k(94)} v${k(-24)}" stroke="#6B4A2A" stroke-width="${k(2)}"/><path d="M${x} ${y - k(118)} l${k(20)} ${k(6)} l${k(-20)} ${k(6)} Z" fill="#E8503A"/>`; break;
    case 'volcano': out = `<path d="M${x - k(60)} ${y} L${x - k(16)} ${y - k(80)} Q${x} ${y - k(88)} ${x + k(16)} ${y - k(80)} L${x + k(60)} ${y} Z" fill="#8A5A33" stroke="#5E3A1E" stroke-width="${k(2)}"/><path d="M${x - k(16)} ${y - k(80)} Q${x - k(8)} ${y - k(56)} ${x - k(22)} ${y - k(40)} M${x + k(14)} ${y - k(80)} Q${x + k(18)} ${y - k(50)} ${x + k(10)} ${y - k(30)}" stroke="#D9603B" stroke-width="${k(6)}" fill="none" stroke-linecap="round"/><ellipse cx="${x}" cy="${y - k(82)}" rx="${k(16)}" ry="${k(5)}" fill="#D9603B"/><rect x="${x - k(70)}" y="${y - k(4)}" width="${k(140)}" height="${k(6)}" rx="${k(2)}" fill="#C9C1B1"/>`; break;
    case 'rabbit': { const c = color ?? '#B9A28A'; out = `<ellipse cx="${x}" cy="${y - k(16)}" rx="${k(22)}" ry="${k(16)}" fill="${c}"/><circle cx="${x + k(20)}" cy="${y - k(30)}" r="${k(12)}" fill="${c}"/><ellipse cx="${x + k(16)}" cy="${y - k(54)}" rx="${k(4)}" ry="${k(14)}" fill="${c}" transform="rotate(-12 ${x + k(16)} ${y - k(54)})"/><ellipse cx="${x + k(26)}" cy="${y - k(54)}" rx="${k(4)}" ry="${k(14)}" fill="${c}" transform="rotate(12 ${x + k(26)} ${y - k(54)})"/><ellipse cx="${x + k(26)}" cy="${y - k(54)}" rx="${k(1.8)}" ry="${k(9)}" fill="#F2B8C0" transform="rotate(12 ${x + k(26)} ${y - k(54)})"/><circle cx="${x + k(25)}" cy="${y - k(32)}" r="${k(2)}" fill="#222"/><circle cx="${x + k(31)}" cy="${y - k(27)}" r="${k(1.8)}" fill="#E58A9A"/><circle cx="${x - k(22)}" cy="${y - k(20)}" r="${k(6)}" fill="#fff"/>`; break; }
    case 'well': out = `<rect x="${x - k(56)}" y="${y - k(50)}" width="${k(112)}" height="${k(50)}" rx="${k(6)}" fill="#A9A49A"/>${[0, 1].map((r) => [0, 1, 2, 3].map((i) => `<rect x="${x - k(56) + k(i * 28) + (r ? k(14) : 0)}" y="${y - k(50) + k(r * 25)}" width="${k(26)}" height="${k(23)}" rx="${k(3)}" fill="none" stroke="#7E796F" stroke-width="${k(1.5)}"/>`).join('')).join('')}<rect x="${x - k(62)}" y="${y - k(60)}" width="${k(124)}" height="${k(14)}" rx="${k(3)}" fill="#8A5A33" stroke="#5E3A1E" stroke-width="${k(1.5)}"/><path d="M${x - k(30)} ${y - k(60)} v${k(14)} M${x} ${y - k(60)} v${k(14)} M${x + k(30)} ${y - k(60)} v${k(14)}" stroke="#5E3A1E" stroke-width="${k(1.2)}"/>`; break;
    case 'train': { const c = color ?? '#7A5FA8'; out = `<rect x="${x - k(190)}" y="${y - k(140)}" width="${k(380)}" height="${k(118)}" rx="${k(26)}" fill="${c}"/><rect x="${x - k(190)}" y="${y - k(60)}" width="${k(380)}" height="${k(12)}" fill="#F6C64B"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${x - k(165) + k(i * 68)}" y="${y - k(122)}" width="${k(50)}" height="${k(42)}" rx="${k(6)}" fill="#CFE8F5" stroke="#fff" stroke-width="${k(2)}"/>`).join('')}<rect x="${x - k(200)}" y="${y - k(10)}" width="${k(400)}" height="${k(6)}" fill="#6B6B6B"/>${[-130, -60, 60, 130].map((d) => `<circle cx="${x + k(d)}" cy="${y - k(18)}" r="${k(12)}" fill="#333"/><circle cx="${x + k(d)}" cy="${y - k(18)}" r="${k(5)}" fill="#999"/>`).join('')}`; break; }
    case 'kitten': out = cat({ x, y, s: s * 0.6, color: color ?? '#C9C2B8' }); break;
    case 'bird': out = bird({ x, y, s, color }); break;
    case 'birdL': out = bird({ x, y, s, color, flip: true }); break;
    case 'butterfly': out = butterfly({ x, y, s, color }); break;
    default: out = '';
  }
  const tag = pid ? ` data-id="${pid}" class="tap"` : '';
  if (['cat', 'catdrink', 'catsad', 'catsleep', 'kitten', 'bird', 'birdL', 'butterfly'].includes(p)) return pid ? `<g${tag}>${out}</g>` : out;
  const shadow = P && !held && !['puddle', 'flowers', 'cloth', 'mat', 'water', 'drop', 'star', 'heart', 'tree', 'fruittree', 'bus'].includes(p) ? ` filter="url(#${P.soft})"` : '';
  return `<g${tag}${shadow}>${out}</g>`;
}

// ── backgrounds ─────────────────────────────────────────────
const SKY = { day: ['#9FD3F2', '#DDF0FA'], dusk: ['#F6A96B', '#FBE0B5'], night: ['#1B2A4A', '#3D4E7A'], dawn: ['#F7C6A3', '#E9E3F2'], rain: ['#9AA9B8', '#D5DDE5'] };
function sky(t) { const [a, b] = SKY[t] ?? SKY.day; const g = id('sky'); return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#${g})"/>`; }
function cloud(x, y, s = 1, c = '#fff') { return `<g fill="${c}" opacity=".95"><ellipse cx="${x}" cy="${y}" rx="${50 * s}" ry="${20 * s}"/><circle cx="${x - 20 * s}" cy="${y - 10 * s}" r="${20 * s}"/><circle cx="${x + 14 * s}" cy="${y - 16 * s}" r="${24 * s}"/></g>`; }
function sunMoon(t) {
  if (t === 'night') return `<circle cx="660" cy="80" r="34" fill="#FFF3C4"/><circle cx="676" cy="70" r="30" fill="#2A3A5E"/>${[[120, 60], [220, 110], [380, 50], [520, 120], [740, 160], [300, 150], [80, 170]].map(([x, y]) => prop({ p: 'star', x, y, s: 0.8, color: '#FFF3C4' })).join('')}`;
  if (t === 'rain') return cloud(200, 80, 1.6, '#C5CED8') + cloud(520, 60, 1.9, '#B8C2CD') + cloud(720, 100, 1.2, '#C5CED8');
  if (t === 'dusk' || t === 'dawn') return `<circle cx="640" cy="${t === 'dusk' ? 300 : 280}" r="56" fill="#FFD27A"/>` + cloud(200, 90, 1.1, '#FFF3E6');
  return `<circle cx="680" cy="80" r="40" fill="#FFE27A"/><circle cx="680" cy="80" r="56" fill="#FFE27A" opacity=".3"/>` + cloud(170, 90, 1.2) + cloud(470, 60, 1);
}
function rainFx() { let s = '', r = 7; const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280); for (let i = 0; i < 70; i++) { const x = rnd() * 810, y = rnd() * 430; s += `<path d="M${x} ${y} l-6 16" stroke="#7FA7C9" stroke-width="2.5" stroke-linecap="round" opacity=".75"/>`; } return s; }
function houseRow(y, tint = 1) { return [[30, 120, '#F2C49B'], [170, 150, '#BFD9EA'], [340, 110, '#F6D78B'], [470, 160, '#D7C4E8'], [650, 130, '#F2C49B']].map(([x, h, c]) => `<rect x="${x}" y="${y - h}" width="120" height="${h}" fill="${c}" opacity="${tint}"/><path d="M${x - 8} ${y - h} L${x + 60} ${y - h - 44} L${x + 128} ${y - h} Z" fill="#C0584A" opacity="${tint}"/><rect x="${x + 20}" y="${y - h + 24}" width="28" height="28" rx="3" fill="#fff" opacity=".85"/><rect x="${x + 72}" y="${y - h + 24}" width="28" height="28" rx="3" fill="#fff" opacity=".85"/>`).join(''); }
function windowFrame(x, y, w, h, t) { const [a, b] = SKY[t] ?? SKY.day; const g = id('win'); return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="url(#${g})" stroke="#FFFFFF" stroke-width="8"/>${t === 'night' ? `<circle cx="${x + w * 0.7}" cy="${y + h * 0.3}" r="14" fill="#FFF3C4"/><circle cx="${x + w * 0.7 + 7}" cy="${y + h * 0.3 - 4}" r="12" fill="#2A3A5E"/>` + prop({ p: 'star', x: x + w * 0.3, y: y + h * 0.4, s: 0.6, color: '#FFF3C4' }) : t === 'rain' ? `<g>${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M${x + 12 + i * (w - 24) / 6} ${y + 14 + (i % 3) * 18} l-4 12" stroke="#7FA7C9" stroke-width="2"/>`).join('')}</g>` : cloud(x + w * 0.4, y + h * 0.35, 0.5)}<path d="M${x + w / 2} ${y} v${h} M${x} ${y + h / 2} h${w}" stroke="#fff" stroke-width="6"/><path d="M${x - 16} ${y - 10} q${w * 0.18} ${h * 0.5} 0 ${h + 20} M${x + w + 16} ${y - 10} q${-w * 0.18} ${h * 0.5} 0 ${h + 20}" stroke="#E98BB0" stroke-width="22" fill="none" stroke-linecap="round" opacity=".85"/>`; }
// an eight-pointed star tile, for walls and frames (no words)
function star8(x, y, r, c) { return `<g fill="${c}"><rect x="${x - r * 0.7}" y="${y - r * 0.7}" width="${r * 1.4}" height="${r * 1.4}"/><rect x="${x - r * 0.7}" y="${y - r * 0.7}" width="${r * 1.4}" height="${r * 1.4}" transform="rotate(45 ${x} ${y})"/></g>`; }
function frameArt(x, y) { return `<rect x="${x}" y="${y}" width="90" height="70" rx="4" fill="#FFF9EC" stroke="#C9A24A" stroke-width="5"/>${star8(x + 45, y + 35, 18, '#1F7A5C')}${star8(x + 45, y + 35, 9, '#F6C64B')}`; }

function bg(name, t = 'day') {
  const night = t === 'night';
  switch (name) {
    case 'garden': case 'park': return sky(t) + sunMoon(t) + `<path d="M0 300 Q200 250 400 300 T800 290 V500 H0 Z" fill="${night ? '#2F5A3A' : '#8FD07A'}"/><rect y="${GROUND - 40}" width="${W}" height="${H - GROUND + 40}" fill="${night ? '#2A4E33' : '#6CBF5A'}"/>${name === 'garden' ? `<g stroke="#D9B98A" stroke-width="8">${Array.from({ length: 17 }, (_, i) => `<path d="M${i * 50 + 10} 380 v-64"/>`).join('')}<path d="M0 336 H800 M0 360 H800"/></g>` : `<path d="M600 ${GROUND - 40} l30 -120 h20 l-60 120 Z" fill="#E8503A"/><rect x="618" y="${GROUND - 170}" width="60" height="12" rx="4" fill="#F6C64B"/><path d="M670 ${GROUND - 160} v120 M700 ${GROUND - 160} v120" stroke="#3B82B5" stroke-width="8"/>`}` + prop({ p: 'flowers', x: 90, y: GROUND - 10, s: 1 }) + prop({ p: 'flowers', x: 730, y: GROUND, s: 0.9 });
    case 'street': return sky(t) + sunMoon(t) + houseRow(330) + `<rect y="330" width="${W}" height="${H - 330}" fill="#CFC7B8"/><rect y="${GROUND + 10}" width="${W}" height="${H - GROUND}" fill="#8C8C8C"/><path d="M0 ${GROUND + 45} H800" stroke="#fff" stroke-width="5" stroke-dasharray="40 30"/><path d="M0 ${GROUND + 8} H800" stroke="#A9A293" stroke-width="6"/>` + prop({ p: 'tree', x: 760, y: 336, s: 0.8 });
    case 'masjid': return sky(t) + sunMoon(t) + `<rect y="${GROUND - 50}" width="${W}" height="${H - GROUND + 50}" fill="#E6D9BF"/><rect x="250" y="170" width="300" height="${GROUND - 50 - 170}" fill="#F4EDE0"/><path d="M300 170 Q400 60 500 170 Z" fill="#2E8B57"/><path d="M400 78 v-22" stroke="#C9A24A" stroke-width="4"/><circle cx="400" cy="50" r="7" fill="#C9A24A"/><rect x="580" y="110" width="40" height="${GROUND - 50 - 110}" fill="#F4EDE0"/><path d="M574 110 L600 60 L626 110 Z" fill="#2E8B57"/><rect x="572" y="150" width="56" height="10" fill="#C9A24A"/><path d="M360 ${GROUND - 50} V280 Q400 230 440 280 V${GROUND - 50} Z" fill="#7A5230"/>${[285, 485].map((x) => `<path d="M${x} 300 V250 Q${x + 15} 228 ${x + 30} 250 V300 Z" fill="#BFD9EA"/>`).join('')}`;
    case 'masjid-in': return `<rect width="${W}" height="${H}" fill="#F6EFE2"/>${[60, 260, 460, 660].map((x) => `<path d="M${x} 330 V140 Q${x + 40} 70 ${x + 80} 140 V330" fill="none" stroke="#E2D3B5" stroke-width="16"/>`).join('')}<path d="M330 330 V170 Q400 90 470 170 V330 Z" fill="#E8DCC4" stroke="#C9A24A" stroke-width="5"/>${star8(400, 200, 16, '#C9A24A')}<rect y="330" width="${W}" height="${H - 330}" fill="#2E8B57"/>${[0, 1, 2, 3, 4].map((i) => `<path d="M${-20 + i * 180} ${H} L${20 + i * 180} 340 L${120 + i * 180} 340 L${160 + i * 180} ${H}" fill="none" stroke="#3CA66A" stroke-width="5"/>`).join('')}<path d="M0 360 H800" stroke="#C9A24A" stroke-width="3" opacity=".6"/>` + prop({ p: 'lantern', x: 150, y: 120, s: 1 }) + prop({ p: 'lantern', x: 650, y: 120, s: 1 });
    case 'class': return `<rect width="${W}" height="${H}" fill="#FBF3E2"/><rect x="190" y="60" width="420" height="180" rx="10" fill="#1F5B4A" stroke="#A9733F" stroke-width="12"/><path d="M230 120 q30 -30 60 0 t60 0" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/><text x="470" y="170" text-anchor="middle" direction="rtl" font-family="Amiri, serif" font-size="58" fill="#fff" opacity=".9">ا  ب  ت</text>${frameArt(650, 80)}<rect y="${GROUND - 40}" width="${W}" height="${H}" fill="#E3C79C"/>${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 100} ${GROUND - 40} V${H}" stroke="#D3B486" stroke-width="3"/>`).join('')}`;
    case 'bedroom': return `<rect width="${W}" height="${H}" fill="${night ? '#5D6A9A' : '#DCE7F5'}"/>` + windowFrame(520, 70, 180, 150, night ? 'night' : t) + `<rect y="${GROUND - 30}" width="${W}" height="${H}" fill="${night ? '#5A4A6A' : '#C9A77C'}"/><ellipse cx="400" cy="${GROUND + 20}" rx="260" ry="34" fill="${night ? '#7A5A8A' : '#E98BB0'}" opacity=".6"/>` + (night ? `<rect width="${W}" height="${H}" fill="#0D1530" opacity=".25"/>` : '');
    case 'kitchen': return `<rect width="${W}" height="${H}" fill="#FFF3DC"/>${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 50}" y="230" width="48" height="48" fill="${i % 2 ? '#DDEFE8' : '#fff'}"/>`).join('')}` + windowFrame(300, 60, 200, 140, t) + `<rect x="40" y="70" width="180" height="90" rx="6" fill="#A9733F"/><path d="M130 70 v90" stroke="#8A5A33" stroke-width="3"/><rect y="278" width="${W}" height="40" fill="#C99B62"/><rect y="318" width="${W}" height="${GROUND - 318 + 20}" fill="#A9733F"/>${[80, 280, 480, 680].map((x) => `<rect x="${x}" y="330" width="120" height="${GROUND - 340}" rx="6" fill="#B8834E"/><circle cx="${x + 100}" cy="${(330 + GROUND) / 2}" r="5" fill="#E3C79C"/>`).join('')}<rect y="${GROUND + 20}" width="${W}" height="${H}" fill="#D9C7A3"/>`;
    case 'bathroom': return `<rect width="${W}" height="${H}" fill="#E8F4F8"/>${Array.from({ length: 64 }, (_, i) => `<rect x="${(i % 16) * 50}" y="${Math.floor(i / 16) * 50 + 120}" width="48" height="48" fill="#D3EBF2"/>`).join('')}<rect x="500" y="70" width="170" height="130" rx="60" fill="#CFE8F5" stroke="#A9B4BC" stroke-width="8"/><rect x="470" y="300" width="230" height="${GROUND - 300}" rx="6" fill="#F4EDE0" stroke="#D8CDB8" stroke-width="3"/><rect x="460" y="292" width="250" height="14" rx="5" fill="#E3D7C2"/><circle cx="585" cy="360" r="5" fill="#C9B89C"/><rect y="${GROUND}" width="${W}" height="${H}" fill="#BCD8E0"/>`;
    case 'beach': return sky(t) + sunMoon(t) + `<path d="M0 250 H800 V350 H0 Z" fill="${night ? '#24406A' : '#4FA9D9'}"/><path d="M0 262 Q100 254 200 262 T400 262 T600 262 T800 262" stroke="#fff" stroke-opacity=".5" stroke-width="3" fill="none"/><path d="M0 300 Q120 290 240 300 T480 300 T720 300 T960 300" stroke="#fff" stroke-opacity=".4" stroke-width="3" fill="none"/><path d="M0 340 Q200 318 400 336 T800 330 V500 H0 Z" fill="#F2D9A0"/><path d="M0 344 Q200 322 400 340 T800 334" stroke="#fff" stroke-width="6" fill="none" opacity=".7"/>` + prop({ p: 'shell', x: 640, y: 470 }) + prop({ p: 'starfish', x: 140, y: 480 });
    case 'forest': return sky(t) + sunMoon(t) + `<path d="M0 300 Q200 240 400 290 T800 270 V500 H0 Z" fill="${night ? '#22402C' : '#7CBF6A'}"/>` + [40, 130, 210, 300, 520, 600, 690, 770].map((x, i) => `<path d="M${x} ${330 - (i % 3) * 20} l-46 120 h92 Z M${x} ${290 - (i % 3) * 20} l-36 90 h72 Z M${x} ${255 - (i % 3) * 20} l-26 66 h52 Z" fill="${night ? '#163322' : ['#2E7D4F', '#3B8F5A', '#2A6E46'][i % 3]}"/><rect x="${x - 7}" y="${450 - (i % 3) * 20}" width="14" height="22" fill="#6B4A2A"/>`).join('') + `<rect y="${GROUND - 30}" width="${W}" height="${H}" fill="${night ? '#2A4E33' : '#5DAA4E'}"/>`;
    case 'desert': return sky(t) + sunMoon(t) + `<path d="M0 320 Q160 260 320 310 T640 290 T960 300 V500 H0 Z" fill="#E8C27A"/><path d="M0 380 Q200 330 420 370 T800 350 V500 H0 Z" fill="#F0D28E"/><rect y="${GROUND}" width="${W}" height="${H}" fill="#EDCB85"/>` + [[690, 300], [740, 320]].map(([x, y]) => `<path d="M${x} ${y} q-6 -60 4 -110" stroke="#8A5A33" stroke-width="10" fill="none" stroke-linecap="round"/>${[-50, -20, 15, 45, 70].map((a) => `<path d="M${x + 4} ${y - 110} q${a} ${-10 + Math.abs(a) / 3} ${a * 1.5} ${25}" stroke="#3B8F5A" stroke-width="9" fill="none" stroke-linecap="round"/>`).join('')}`).join('');
    case 'snow': return sky(t === 'day' ? 'dawn' : t) + `<circle cx="680" cy="90" r="34" fill="#FFF7E0"/><path d="M0 300 Q200 250 400 290 T800 280 V500 H0 Z" fill="#EEF4FA"/>` + [60, 160, 640, 740].map((x) => `<path d="M${x} 330 l-40 100 h80 Z M${x} 300 l-30 70 h60 Z" fill="#2F6B4C"/><path d="M${x} 300 l-14 32 h28 Z M${x - 30} 372 h22 M${x + 10} 372 h22" stroke="#fff" stroke-width="6" fill="#fff"/><rect x="${x - 6}" y="430" width="12" height="18" fill="#6B4A2A"/>`).join('') + `<rect y="${GROUND - 20}" width="${W}" height="${H}" fill="#F7FAFD"/>` + Array.from({ length: 45 }, (_, i) => `<circle cx="${(i * 173) % 800}" cy="${(i * 97) % 400}" r="${2 + (i % 3)}" fill="#fff" opacity=".9"/>`).join('');
    case 'souk': return sky(t) + sunMoon(t) + `<rect y="190" width="${W}" height="${GROUND - 160}" fill="#E9D2AE"/>` + [0, 200, 400, 600].map((x, i) => `<path d="M${x + 10} 330 V230 Q${x + 100} 170 ${x + 190} 230 V330" fill="#C9A27A" opacity=".55"/><path d="M${x} 250 h200 l-20 50 h-160 Z" fill="${['#C0392B', '#2E8B57', '#2F6FA8', '#D98E1E'][i]}"/>${[0, 1, 2, 3, 4].map((k) => `<path d="M${x + 18 + k * 34} 250 h17 l-3 50 h-14 Z" fill="#fff" opacity=".85"/>`).join('')}<rect x="${x + 20}" y="300" width="160" height="40" fill="#8A5A33"/>${[0, 1, 2, 3].map((k) => `<circle cx="${x + 45 + k * 36}" cy="296" r="12" fill="${['#E8503A', '#F6C64B', '#6CBF5A', '#F08A3C'][(k + i) % 4]}"/>`).join('')}`).join('') + `<rect y="${GROUND - 50}" width="${W}" height="${H}" fill="#D8C4A2"/>${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 100} ${GROUND - 50} V${H}" stroke="#C4AE88" stroke-width="3"/>`).join('')}`;
    case 'river': return sky(t) + sunMoon(t) + `<path d="M0 250 Q200 230 400 250 T800 245 V300 H0 Z" fill="${night ? '#2F5A3A' : '#8FD07A'}"/><path d="M0 290 H800 V390 H0 Z" fill="${night ? '#24406A' : '#5DB3E0'}"/>${[310, 340, 365].map((y, i) => `<path d="M${i * 60} ${y} q40 -8 80 0 t80 0 M${400 + i * 50} ${y + 6} q40 -8 80 0 t80 0" stroke="#fff" stroke-opacity=".55" stroke-width="3" fill="none"/>`).join('')}<path d="M0 380 Q200 370 400 384 T800 378 V500 H0 Z" fill="${night ? '#2A4E33' : '#6CBF5A'}"/>` + prop({ p: 'tree', x: 760, y: 300, s: 0.6 }) + prop({ p: 'tree', x: 60, y: 300, s: 0.5 });
    case 'mountain': return sky(t) + sunMoon(t) + `<path d="M-40 330 L160 120 L300 300 L430 150 L620 330 Z" fill="${night ? '#3A4560' : '#8D9DB3'}"/><path d="M160 120 l-40 42 l20 -6 l20 14 l18 -12 l22 6 Z M430 150 l-34 36 l18 -4 l16 10 l16 -10 l18 4 Z" fill="#fff"/><path d="M380 340 L620 140 L860 340 Z" fill="${night ? '#323C55' : '#7A8BA3'}"/><path d="M620 140 l-38 40 l20 -6 l18 12 l18 -10 l20 4 Z" fill="#fff"/><path d="M0 330 Q200 300 400 330 T800 320 V500 H0 Z" fill="${night ? '#2A4E33' : '#7CBF6A'}"/><path d="M330 500 Q380 420 420 380 T470 330" stroke="#D9B98A" stroke-width="34" fill="none" stroke-linecap="round"/>` + prop({ p: 'stone', x: 160, y: 440, s: 1.2 }) + prop({ p: 'stone', x: 660, y: 450, s: 0.9 });
    // the open sea (a storm when it rains), under the sea, and the sea parted in two with a dry path between
    case 'sea': {
      const storm = t === 'rain', a = storm ? 20 : 7;
      const wave = (y, amp) => `M-40 ${y} q50 ${-amp} 100 0${' t100 0'.repeat(9)}`;
      return sky(t) + (storm ? '' : sunMoon(t)) + `<rect y="230" width="${W}" height="${H - 230}" fill="${night ? '#1E3558' : storm ? '#3E6A8A' : '#2F86C4'}"/>`
        + [[260, 0.35, '#5BA6D9'], [310, 0.5, '#3E8FCB'], [370, 0.75, '#2F7DB8'], [440, 1, '#2A6FA6']].map(([y, m, c]) => `<path d="${wave(y, a * m * 2)} V${H} H-40 Z" fill="${night ? '#24406A' : storm ? '#4F7D9C' : c}" opacity=".9"/><path d="${wave(y, a * m * 2)}" stroke="#fff" stroke-opacity="${storm ? 0.7 : 0.45}" stroke-width="3" fill="none"/>`).join('');
    }
    case 'undersea': return `<rect width="${W}" height="${H}" fill="${night ? '#0E2240' : '#1F5F8E'}"/><rect width="${W}" height="40" fill="${night ? '#24406A' : '#5BA6D9'}"/><path d="M0 40 q50 -8 100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0" stroke="#fff" stroke-opacity=".5" stroke-width="3" fill="none"/>`
      + [[120, 60], [330, 90], [560, 70]].map(([x, w]) => `<path d="M${x} 40 L${x + w} 40 L${x + w * 2.4} ${H} L${x + w * 0.6} ${H} Z" fill="#fff" opacity=".07"/>`).join('')
      + `<path d="M0 460 Q200 440 400 462 T800 455 V500 H0 Z" fill="#C9B07A"/>`
      + [60, 100, 690, 740].map((x, i) => `<path d="M${x} 470 q-14 -40 0 -80 t0 -80" stroke="${i % 2 ? '#3F9A6A' : '#2F8A5A'}" stroke-width="9" fill="none" stroke-linecap="round"/>`).join('');
    case 'parted': return sky(t) + sunMoon(t)
      + `<rect y="228" width="${W}" height="${H - 228}" fill="#2F86C4"/><path d="M340 232 L460 232 L640 500 L160 500 Z" fill="#E8C27A"/><path d="M370 260 l12 6 M420 300 l14 4 M330 380 l16 6 M470 420 l18 4 M260 470 l18 4" stroke="#C9A35A" stroke-width="4" stroke-linecap="round"/>`
      + [1, -1].map((d) => { const X = (v) => (d === 1 ? v : W - v); return `<path d="M${X(-10)} 50 Q${X(170)} 20 ${X(338)} 70 L${X(338)} 232 L${X(158)} 500 L${X(-10)} 500 Z" fill="#2A78B5"/><path d="M${X(338)} 70 L${X(338)} 232 L${X(158)} 500 L${X(200)} 500 L${X(352)} 240 L${X(352)} 80 Z" fill="#5BB0E4"/>${[90, 160, 230, 300].map((v, i) => `<path d="M${X(v - 60)} ${70 + i * 20} q${d * 30} 60 0 ${130 + i * 40} t0 ${120 + i * 30}" stroke="#fff" stroke-opacity=".3" stroke-width="4" fill="none"/>`).join('')}<path d="M${X(-10)} 50 Q${X(60)} 30 ${X(110)} 46 T${X(220)} 40 T${X(338)} 70" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" opacity=".85"/>`; }).join('');
    case 'library': return `<rect width="${W}" height="${H}" fill="#F6E9D3"/>` + [40, 300, 560].map((x) => `<rect x="${x}" y="70" width="200" height="${GROUND - 100}" fill="#8A5A33"/>${[0, 1, 2, 3].map((r) => `<rect x="${x + 8}" y="${86 + r * 70}" width="184" height="54" fill="#6B4528"/>${Array.from({ length: 11 }, (_, k) => `<rect x="${x + 12 + k * 16}" y="${92 + r * 70 + (k % 3) * 4}" width="13" height="${48 - (k % 3) * 4}" rx="2" fill="${['#C0392B', '#2E8B57', '#2F6FA8', '#D98E1E', '#7D6BE0', '#E8B33C'][(k + r + x) % 6]}"/>`).join('')}`).join('')}`).join('') + `<rect y="${GROUND - 30}" width="${W}" height="${H}" fill="#B8865A"/><ellipse cx="400" cy="${GROUND + 30}" rx="300" ry="34" fill="#2E8B57" opacity=".7"/>`;
    case 'home': default: return `<rect width="${W}" height="${H}" fill="#FBEBD3"/><rect y="0" width="${W}" height="16" fill="#E9CFA8"/>` + windowFrame(90, 80, 170, 150, t) + frameArt(560, 90) + `<rect y="${GROUND - 30}" width="${W}" height="${H}" fill="#C9A77C"/><path d="M0 ${GROUND - 30} H800" stroke="#B08C5E" stroke-width="6"/><ellipse cx="420" cy="${GROUND + 28}" rx="300" ry="36" fill="#B23A48" opacity=".75"/><ellipse cx="420" cy="${GROUND + 28}" rx="270" ry="28" fill="none" stroke="#F6C64B" stroke-width="3" opacity=".8"/><rect x="430" y="${GROUND - 120}" width="300" height="70" rx="22" fill="#3BB3A6"/><rect x="440" y="${GROUND - 160}" width="280" height="60" rx="22" fill="#47C2B4"/><rect x="420" y="${GROUND - 140}" width="34" height="90" rx="14" fill="#2A9A8E"/><rect x="706" y="${GROUND - 140}" width="34" height="90" rx="14" fill="#2A9A8E"/>` + (night ? `<rect width="${W}" height="${H}" fill="#1B2A4A" opacity=".25"/>` : '');
  }
}

// small effects over the picture
function fx(list = []) {
  return list.map((f) => {
    const [kind, x = 400, y = 120] = Array.isArray(f) ? f : [f];
    if (kind === 'hearts') return [[0, 0, 1], [36, -26, 0.7], [-30, -34, 0.6]].map(([dx, dy, s]) => prop({ p: 'heart', x: x + dx, y: y + dy, s })).join('');
    if (kind === 'sparkles') return [[0, 0, 1], [40, 20, 0.6], [-36, 26, 0.7], [20, -30, 0.5]].map(([dx, dy, s]) => prop({ p: 'star', x: x + dx, y: y + dy, s, color: '#FFD84D' })).join('');
    if (kind === 'zzz') return `<g font-family="Manrope, sans-serif" font-weight="800" fill="#FFF3C4"><text x="${x}" y="${y}" font-size="30">z</text><text x="${x + 22}" y="${y - 22}" font-size="24">z</text><text x="${x + 40}" y="${y - 40}" font-size="18">z</text></g>`;
    if (kind === 'question') return `<g><circle cx="${x}" cy="${y}" r="24" fill="#fff" stroke="#C9A24A" stroke-width="3"/><text x="${x}" y="${y + 11}" text-anchor="middle" font-family="Manrope, sans-serif" font-weight="800" font-size="32" fill="#8A5A12">?</text></g>`;
    if (kind === 'idea') return `<g><circle cx="${x}" cy="${y}" r="22" fill="#FFE27A"/><rect x="${x - 8}" y="${y + 18}" width="16" height="10" rx="3" fill="#A9B4BC"/>${[0, 60, 120, 180, 240, 300].map((a) => `<path d="M${x + Math.cos(rad(a)) * 30} ${y + Math.sin(rad(a)) * 30} L${x + Math.cos(rad(a)) * 40} ${y + Math.sin(rad(a)) * 40}" stroke="#FFD84D" stroke-width="4" stroke-linecap="round"/>`).join('')}</g>`;
    if (kind === 'steam') return `<path d="M${x} ${y} q-10 -14 0 -28 t0 -28 M${x + 16} ${y + 4} q-10 -14 0 -28 t0 -28" stroke="#E8503A" stroke-width="6" fill="none" stroke-linecap="round" opacity=".7"/>`;
    if (kind === 'bubbles') return [[0, 0, 14], [24, -20, 10], [-20, -30, 8], [40, 10, 7], [-36, 4, 11]].map(([dx, dy, r]) => `<circle cx="${x + dx}" cy="${y + dy}" r="${r}" fill="#fff" fill-opacity=".55" stroke="#9FD3F2" stroke-width="2"/>`).join('');
    if (kind === 'notes') return `<g fill="#8A5A12"><circle cx="${x}" cy="${y}" r="7"/><path d="M${x + 6} ${y} V${y - 30} l14 6" stroke="#8A5A12" stroke-width="3" fill="none"/></g>`;
    if (kind === 'rain') return rainFx();
    if (kind === 'tear') return `<path d="M${x} ${y} q-5 8 0 12 q5 -4 0 -12" fill="#6FB6DE"/>`;
    if (kind === 'crack') return `<path d="M${x} ${y} l12 -10 l-6 -8 l14 -12" stroke="#3A2A1E" stroke-width="3" fill="none"/>`;
    if (kind === 'speech') { const [, sx, sy, text] = f; return `<g><path d="M${sx - 70} ${sy - 50} h140 a14 14 0 0 1 14 14 v28 a14 14 0 0 1 -14 14 h-110 l-18 16 l4 -16 h-16 a14 14 0 0 1 -14 -14 v-28 a14 14 0 0 1 14 -14 Z" fill="#fff" stroke="#C9A24A" stroke-width="3"/><text x="${sx}" y="${sy - 22}" text-anchor="middle" font-family="Manrope, sans-serif" font-weight="800" font-size="19" fill="#14211B">${text}</text></g>`; }
    if (kind === 'speechAr') { const [, sx, sy, text] = f; return `<g><path d="M${sx - 80} ${sy - 54} h160 a14 14 0 0 1 14 14 v34 a14 14 0 0 1 -14 14 h-120 l-18 16 l4 -16 h-26 a14 14 0 0 1 -14 -14 v-34 a14 14 0 0 1 14 -14 Z" fill="#fff" stroke="#C9A24A" stroke-width="3"/><text x="${sx}" y="${sy - 18}" text-anchor="middle" direction="rtl" font-family="Amiri, serif" font-weight="700" font-size="26" fill="#0E6B4E">${text}</text></g>`; }
    return '';
  }).join('');
}

const BIG = new Set(['ark', 'whale', 'bigfire', 'coolfire', 'gourd', 'castle', 'train', 'well', 'tent', 'campfire', 'boat', 'camel', 'sheep', 'snowman', 'bench', 'sign', 'telescope', 'footprints', 'kitten', 'tree', 'fruittree', 'bus', 'bed', 'blanket', 'table', 'cloth', 'desk', 'shoerack', 'mat', 'tap', 'tapon', 'tower', 'tumble', 'puddle', 'umbrella', 'flowers', 'cat', 'catdrink', 'catsad', 'catsleep', 'lantern']);
const TOP = { undersea: '#5BA6D9', home: '#FBEBD3', kitchen: '#FFF3DC', bathroom: '#E8F4F8', class: '#FBF3E2', 'masjid-in': '#F6EFE2', library: '#F6E9D3' };
export const ROOM = 120;   // extra space above the picture, where the words sit
// light and texture laid over a background: window light on the floor, shade at the bottom, grass blades
function atmosphere(name, t) {
  const night = t === 'night', out = [];
  let r = 11; const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  const indoor = ['home', 'kitchen', 'class', 'bedroom', 'bathroom', 'masjid-in', 'library'].includes(name);
  if (indoor) {
    if (!night && (name === 'home' || name === 'bedroom' || name === 'kitchen')) {
      const wx = name === 'home' ? 90 : name === 'kitchen' ? 300 : 520, ww = name === 'kitchen' ? 200 : 175;
      out.push(`<path d="M${wx} ${name === 'kitchen' ? 318 : 230} L${wx + ww} ${name === 'kitchen' ? 318 : 230} L${wx + ww + 140} ${H} L${wx + 60} ${H} Z" fill="#FFF7D6" opacity="${t === 'dusk' ? 0.12 : 0.2}"/>`);
    }
    if (name === 'home' || name === 'bedroom') for (let i = 0; i < 9; i++) out.push(`<path d="M${i * 95 + 20} ${GROUND - 26} L${i * 110 - 60} ${H}" stroke="#000" stroke-opacity=".05" stroke-width="2"/>`);
    out.push(`<rect y="${GROUND - 40}" width="${W}" height="${H - GROUND + 40}" fill="url(#${P.floor})"/>`);
  } else {
    if (name === 'garden' || name === 'park' || name === 'forest' || name === 'river' || name === 'mountain') for (let i = 0; i < 70; i++) { const x = rnd() * W, y = GROUND - 30 + rnd() * (H - GROUND + 20), h = 6 + rnd() * 8; out.push(`<path d="M${x} ${y} l-3 ${-h} M${x} ${y} l2 ${-h * 0.9} M${x} ${y} l6 ${-h * 0.7}" stroke="${night ? '#1F3A26' : '#4E9A4E'}" stroke-width="2" stroke-linecap="round" opacity=".55"/>`); }
    if (name === 'street') out.push(`<rect y="${GROUND + 10}" width="${W}" height="${H - GROUND}" fill="url(#${P.floor})"/>`);
    out.push(`<rect y="${GROUND - 50}" width="${W}" height="${H - GROUND + 50}" fill="url(#${P.floor})"/>`);
  }
  return out.join('');
}

export function scene(sc) {
  const t = sc.time ?? 'day';
  const defs = paintDefs();
  const parts = [defs, bg(sc.bg, sc.rain ? 'rain' : t), atmosphere(sc.bg, sc.rain ? 'rain' : t)];
  if (sc.rain) parts.push(rainFx());
  // things behind the people, then people and animals (sorted so the nearer ones are in front), then things in front
  const back = (sc.props ?? []).filter((p) => p.back), front = (sc.props ?? []).filter((p) => !p.back);
  parts.push(back.map(prop).join(''));
  const all = [...(sc.actors ?? []).map((a) => ({ a, y: (a.y ?? GROUND) + (a.z ?? 0) })), ...front.map((p) => ({ p, y: (p.y ?? GROUND) + (p.z ?? 0) }))].sort((m, n) => m.y - n.y);
  const grow = (p) => (BIG.has(p.p) ? p : { ...p, s: (p.s ?? 1) * 1.35 });
  parts.push(all.map((m) => (m.a ? person(m.a) : prop(grow(m.p)))).join(''));
  parts.push(fx(sc.fx));
  const top = sc.bg === 'snow' && t === 'day' ? SKY.dawn[0] : sc.bg === 'bedroom' ? (t === 'night' ? '#5D6A9A' : '#DCE7F5') : TOP[sc.bg] ?? (SKY[sc.rain ? 'rain' : t] ?? SKY.day)[0];
  const z = 1.12, cx = 400, cy = 440;
  return `<svg viewBox="0 ${-ROOM} ${W} ${H + ROOM}" xmlns="http://www.w3.org/2000/svg" class="st-art" role="img" aria-hidden="true"><rect y="${-ROOM}" width="${W}" height="${H + ROOM}" fill="${top}"/><g transform="translate(${cx * (1 - z)} ${cy * (1 - z)}) scale(${z})">${parts.join('')}</g><rect y="${-ROOM}" width="${W}" height="${H + ROOM}" fill="url(#${P.vig})" pointer-events="none"/></svg>`;
}
