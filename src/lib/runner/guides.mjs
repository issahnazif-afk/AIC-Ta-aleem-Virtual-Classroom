// Portraits of the Noor Trail guides: each stage's Sheikh or Ustadh, drawn in the same style as Ta'aleem's Sheikh
// (src/lib/sheikh-avatar.mjs), from a "look" in content.mjs: skin, beard (or none, for a young Ustadh), headwear
// (imama, kufi or ghutra), thobe and bisht colours, glasses. They are fictional teachers of today.
const shade = (hex, k) => {
  const n = parseInt(hex.slice(1), 16), f = (v) => Math.max(0, Math.min(255, Math.round(v * k)));
  return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map((v) => v.toString(16).padStart(2, '0')).join('');
};

export function guideSVG(look = {}, { size = 120, talking = false } = {}) {
  const skin = look.skin ?? '#C68B5E', sk2 = shade(skin, 0.92), line = shade(skin, 0.72);
  const thobe = look.thobe ?? '#FBFBF8', bisht = look.bisht ?? null, turban = look.turban ?? '#FFFFFF', beard = look.beard ?? null;
  const hat = look.hat ?? 'imama';
  let s = `<svg viewBox="0 0 240 250" width="${size}" height="${size * 250 / 240}" aria-hidden="true" focusable="false">`;
  s += `<circle cx="120" cy="125" r="118" fill="#F3E6C8"/>`;
  if (hat === 'imama') s += `<path d="M86 92 C70 120 66 160 72 200 L86 200 C84 165 88 128 98 102 Z" fill="${turban}" stroke="${shade(turban, 0.85)}" stroke-width="1.5"/>`;
  if (hat === 'ghutra') s += `<path d="M74 86 C60 130 58 190 50 250 L190 250 C182 190 180 130 166 86 Z" fill="${turban}"/>`;
  s += `<path d="M36 250 C40 196 78 176 120 176 C162 176 200 196 204 250 Z" fill="${thobe}" stroke="${shade(thobe, 0.85)}" stroke-width="1.5"/>`;
  if (bisht) s += `<path d="M36 250 C40 200 66 182 98 177 L90 250 Z" fill="${bisht}"/><path d="M204 250 C200 200 174 182 142 177 L150 250 Z" fill="${bisht}"/><path d="M98 177 L90 250 M142 177 L150 250" stroke="#C9A24A" stroke-width="3" fill="none"/>`;
  s += `<path d="M112 178 L120 196 L128 178" fill="none" stroke="${shade(thobe, 0.8)}" stroke-width="2"/>`;
  s += `<rect x="107" y="150" width="26" height="30" rx="8" fill="${sk2}"/>`;
  s += `<ellipse cx="82" cy="118" rx="6" ry="10" fill="${sk2}"/><ellipse cx="158" cy="118" rx="6" ry="10" fill="${sk2}"/>`;
  s += `<ellipse cx="120" cy="116" rx="38" ry="44" fill="${skin}"/>`;
  if (beard) {
    s += `<path d="M83 112 C82 156 100 178 120 180 C140 178 158 156 157 112 C150 136 136 142 120 142 C104 142 90 136 83 112 Z" fill="${beard}" stroke="${shade(beard, 0.9)}" stroke-width="1"/>`;
    s += `<path d="M104 140 C110 134 116 135 120 138 C124 135 130 134 136 140 C130 142 124 141 120 140 C116 141 110 142 104 140 Z" fill="${shade(beard, 0.95)}"/>`;
  }
  s += talking ? `<ellipse cx="120" cy="148" rx="8" ry="5" fill="#5A2E22"><animate attributeName="ry" values="2;6;3;5;2" dur="0.6s" repeatCount="indefinite"/></ellipse>` : `<path d="M110 146 Q120 154 130 146" fill="none" stroke="#5A2E22" stroke-width="3" stroke-linecap="round"/>`;
  s += `<path d="M120 112 C117 122 116 127 120 129 C123 129 124 127 123 125" fill="none" stroke="${line}" stroke-width="2" stroke-linecap="round"/>`;
  const brow = beard ? shade(beard, 0.9) : '#2A211B';
  s += `<path d="M97 99 C102 95 109 95 113 98" fill="none" stroke="${brow}" stroke-width="3.2" stroke-linecap="round"/><path d="M127 98 C131 95 138 95 143 99" fill="none" stroke="${brow}" stroke-width="3.2" stroke-linecap="round"/>`;
  s += `<ellipse cx="105" cy="108" rx="3.6" ry="3.8" fill="#2A211B"/><ellipse cx="135" cy="108" rx="3.6" ry="3.8" fill="#2A211B"/>`;
  if (look.glasses) s += `<g fill="none" stroke="#3A3026" stroke-width="2.4"><circle cx="105" cy="108" r="11"/><circle cx="135" cy="108" r="11"/><path d="M116 108 H124"/></g>`;
  if (hat === 'imama') s += `<path d="M78 98 C70 56 96 40 120 40 C144 40 170 56 162 98 C150 86 136 80 120 80 C104 80 90 86 78 98 Z" fill="${turban}" stroke="${shade(turban, 0.85)}" stroke-width="1.5"/><path d="M82 84 C98 70 142 70 158 84 M86 70 C104 58 136 58 154 70 M96 56 C110 50 130 50 144 56" fill="none" stroke="${shade(turban, 0.88)}" stroke-width="2"/>`;
  else if (hat === 'kufi') s += `<path d="M84 88 C84 62 100 52 120 52 C140 52 156 62 156 88 Z" fill="${turban}" stroke="${shade(turban, 0.85)}" stroke-width="1.5"/><path d="M86 80 H154" stroke="${shade(turban, 0.8)}" stroke-width="2"/>`;
  else if (hat === 'ghutra') s += `<path d="M76 100 C70 56 96 44 120 44 C144 44 170 56 164 100 C150 84 136 78 120 78 C104 78 90 84 76 100 Z" fill="${turban}" stroke="${shade(turban, 0.85)}" stroke-width="1.5"/><path d="M80 66 C100 56 140 56 160 66" stroke="#222" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  return s + '</svg>';
}
