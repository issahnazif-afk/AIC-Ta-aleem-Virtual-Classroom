// The pictures for the Play & Make games, drawn in code from simple shapes (the school's own; nothing copied).
// No people are ever drawn: travellers are a camel or a lantern, places are buildings and palms.
// Each is SVG markup in a 64×64 box, centred on 32,32, so it can be placed with a transform.

export const ART = {
  camel: '<g class="art-camel"><ellipse cx="32" cy="54" rx="20" ry="4" fill="#000" opacity=".12"/>'
    + '<path d="M14 30 Q18 18 26 24 Q30 14 36 22 Q40 26 44 26 L48 18 Q50 12 55 13 Q59 14 58 18 L56 22 Q52 24 51 30 Q50 36 46 38 L46 52 L42 52 L42 40 L24 40 L24 52 L20 52 L20 39 Q13 37 14 30 Z" fill="#D9A55B" stroke="#8A5A33" stroke-width="2" stroke-linejoin="round"/>'
    + '<path d="M22 26 Q28 20 34 26 L33 31 L23 31 Z" fill="#E85A71" stroke="#A33A4C" stroke-width="1.5"/><path d="M23 31 h10" stroke="#F6C64B" stroke-width="2"/>'
    + '<circle cx="55" cy="16" r="1.6" fill="#2A1C0C"/><path d="M57 13 l2 -3" stroke="#8A5A33" stroke-width="2" stroke-linecap="round"/></g>',
  lantern: '<g class="art-lantern"><ellipse cx="32" cy="58" rx="12" ry="3" fill="#000" opacity=".12"/><path d="M32 4 V10" stroke="#8A5A12" stroke-width="2.5"/><circle cx="32" cy="4" r="2.5" fill="none" stroke="#8A5A12" stroke-width="2"/>'
    + '<path d="M22 10 H42 L38 17 H26 Z" fill="#C9A24A" stroke="#8A5A12" stroke-width="1.5"/><path d="M24 17 H40 L48 34 L40 52 H24 L16 34 Z" fill="#FBE3A6" stroke="#C9A24A" stroke-width="2.5"/>'
    + '<path d="M32 22 Q40 34 32 46 Q24 34 32 22 Z" fill="#F6C64B"/><circle cx="32" cy="34" r="5" fill="#FFF4CC"/><path d="M26 52 H38 L35 58 H29 Z" fill="#C9A24A"/></g>',
  makkah: '<g><rect x="6" y="40" width="52" height="16" rx="2" fill="#E8D6B0"/><rect x="20" y="20" width="24" height="26" fill="#1A1A17" stroke="#C9A24A" stroke-width="1.5"/><path d="M20 27 H44" stroke="#C9A24A" stroke-width="3"/><rect x="34" y="33" width="5" height="10" fill="#C9A24A"/>'
    + '<rect x="6" y="34" width="10" height="14" fill="#F4EAD3" stroke="#B89B6A"/><rect x="48" y="36" width="10" height="12" fill="#F4EAD3" stroke="#B89B6A"/></g>',
  madinah: '<g><rect x="6" y="44" width="52" height="12" rx="2" fill="#DFF3DA"/><rect x="18" y="30" width="28" height="18" fill="#FFF9EC" stroke="#0E6B4E" stroke-width="2"/><path d="M22 30 Q32 12 42 30 Z" fill="#2E8B57" stroke="#0E6B4E" stroke-width="2"/>'
    + '<path d="M29 48 V40 Q32 36 35 40 V48" fill="#0E6B4E"/><path d="M10 48 Q9 30 12 22" stroke="#8A5A33" stroke-width="3" fill="none"/><path d="M12 22 Q4 18 2 24 M12 22 Q20 16 22 22 M12 22 Q8 12 4 14 M12 22 Q16 12 20 12" stroke="#2E8B57" stroke-width="3" fill="none" stroke-linecap="round"/>'
    + '<path d="M52 48 Q53 32 50 26" stroke="#8A5A33" stroke-width="3" fill="none"/><path d="M50 26 Q42 22 42 28 M50 26 Q58 20 60 26 M50 26 Q46 16 42 18" stroke="#2E8B57" stroke-width="3" fill="none" stroke-linecap="round"/></g>',
  home: '<g><path d="M8 32 L32 12 L56 32 V56 H8 Z" fill="#FFF9EC" stroke="#8A5A33" stroke-width="2.5" stroke-linejoin="round"/><rect x="26" y="38" width="12" height="18" rx="2" fill="#8A5A33"/><rect x="12" y="36" width="9" height="9" fill="#F6C64B" stroke="#8A5A33"/><rect x="43" y="36" width="9" height="9" fill="#F6C64B" stroke="#8A5A33"/></g>',
  masjid: '<g><rect x="12" y="32" width="40" height="24" fill="#FFF9EC" stroke="#2C3E73" stroke-width="2"/><path d="M18 32 Q32 8 46 32 Z" fill="#4A90D9" stroke="#2C3E73" stroke-width="2"/><path d="M32 12 V6" stroke="#C9A24A" stroke-width="2"/><path d="M34 4 a3 3 0 1 0 0 4 a2.4 2.4 0 1 1 0 -4z" fill="#C9A24A"/>'
    + '<rect x="52" y="16" width="7" height="40" fill="#E4ECFA" stroke="#2C3E73" stroke-width="1.5"/><path d="M52 16 L55.5 9 L59 16 Z" fill="#4A90D9"/><path d="M28 56 V46 Q32 40 36 46 V56" fill="#F6C64B"/><circle cx="20" cy="42" r="2.5" fill="#F6C64B"/><circle cx="44" cy="42" r="2.5" fill="#F6C64B"/></g>',
  // the munching monster: round, googly-eyed, no teeth. mood: 'soft' (Level 1: a sleepy smile) or 'munch'
  monster: (mood = 'munch') => `<g class="mon ${mood}"><ellipse cx="32" cy="58" rx="20" ry="4" fill="#000" opacity=".15"/>`
    + `<path d="M8 40 Q6 14 32 12 Q58 14 56 40 Q56 56 32 56 Q8 56 8 40 Z" fill="${mood === 'soft' ? '#F7A8C8' : '#8E6CD9'}" stroke="${mood === 'soft' ? '#D9709D' : '#5B3FA8'}" stroke-width="2.5"/>`
    + `<path d="M14 18 L10 8 L20 14 M50 18 L54 8 L44 14" fill="${mood === 'soft' ? '#F7A8C8' : '#8E6CD9'}" stroke="${mood === 'soft' ? '#D9709D' : '#5B3FA8'}" stroke-width="2" stroke-linejoin="round"/>`
    + (mood === 'soft'
      ? '<path d="M18 28 q5 -5 10 0 M36 28 q5 -5 10 0" stroke="#5A2440" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse class="mouth" cx="32" cy="40" rx="7" ry="4" fill="#5A2440"/><circle cx="16" cy="36" r="3.5" fill="#FF8FB8" opacity=".7"/><circle cx="48" cy="36" r="3.5" fill="#FF8FB8" opacity=".7"/>'
      : '<circle cx="23" cy="27" r="8" fill="#fff" stroke="#5B3FA8" stroke-width="1.5"/><circle cx="41" cy="25" r="9" fill="#fff" stroke="#5B3FA8" stroke-width="1.5"/><circle class="pupil" cx="25" cy="29" r="3.5" fill="#1A1033"/><circle class="pupil" cx="39" cy="27" r="4" fill="#1A1033"/>'
        + '<ellipse class="mouth" cx="32" cy="43" rx="12" ry="6" fill="#3B1F66"/><ellipse cx="32" cy="46" rx="6" ry="2.5" fill="#E85A71"/>')
    + '</g>',
  star: '<path d="M32 6 L39 24 L58 24 L43 36 L49 55 L32 44 L15 55 L21 36 L6 24 L25 24 Z" fill="#F6C64B" stroke="#C9A24A" stroke-width="2"/>',
};
export const artSvg = (k, size = 56, ...a) => `<svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">${typeof ART[k] === 'function' ? ART[k](...a) : ART[k]}</svg>`;
