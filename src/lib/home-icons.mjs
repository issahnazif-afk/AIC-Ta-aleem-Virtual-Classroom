// The Classroom's activity and subject icons: small paintings drawn for Ta'aleem, in the style of the subject
// pictures on the Levels 3-4 home (public/img/home/l34/): parchment, gold and deep green, with a dark outline.
// Each sits on an eight-pointed star (the Rub el Hizb shape) in a soft tone of the palette, and comes alive when its
// card is pointed at or focused: the star turns a little and one part moves (a lantern sways, the sun's rays turn,
// a page lifts, a compass needle swings, a heart beats). The motion is in src/styles/system.css (.hi-medal) and is
// switched off for anyone who asks for reduced motion.
// No emoji and no sacred text: the only letters drawn are Arabic alphabet letters (alif, ba), which are teaching
// content, never Qur'an. A mushaf is drawn closed, or open with plain lines.
//   icon(name, tone) → '<span class="hi-medal" …><svg …></svg></span>'
// Part classes for the motion: a-sway (swings from its top), a-swing (turns back and forth on its centre),
// a-bob (rises and settles), a-spin (turns), a-glow (brightens), a-beat (pulses), a-flip (a page turning on its
// left edge), a-draw (a dotted line walking).

const INK = '#173D32', GREEN = '#2F6B4F', DOME = '#2F8A5B', LEAF = '#5E9B62', GOLD = '#C9A24A', GOLDL = '#E9CC7C',
  PARCH = '#FBF3DD', PARCH2 = '#EAD6A4', CLAY = '#B5643C', BROWN = '#7A4E2D', SKY = '#2E5A86', WHITE = '#FFFDF6',
  ROSE = '#C9574F', SKIN = '#E7B993';

// the eight-pointed star: two squares, one turned 45°
const star8 = (cx, cy, r, attrs) =>
  `<rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" ${attrs}/><rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" transform="rotate(45 ${cx} ${cy})" ${attrs}/>`;
// a crescent opening to the right
// (an animated part goes on a wrapping group: CSS motion would replace the path's own rotation)
const cres = (cx, cy, r, fill = GOLD, cls = '') => {
  const p = `<path d="M${cx} ${cy - r}A${r} ${r} 0 0 0 ${cx} ${cy + r}A${(r * 0.55).toFixed(2)} ${r} 0 0 1 ${cx} ${cy - r}z" fill="${fill}" transform="rotate(-25 ${cx} ${cy})"/>`;
  return cls ? `<g class="${cls}">${p}</g>` : p;
};
// a little four-pointed sparkle
const spark = (cx, cy, r, cls = 'a-beat') =>
  `<path class="${cls}" d="M${cx} ${cy - r}Q${cx} ${cy} ${cx + r} ${cy}Q${cx} ${cy} ${cx} ${cy + r}Q${cx} ${cy} ${cx - r} ${cy}Q${cx} ${cy} ${cx} ${cy - r}z" fill="${GOLDL}" stroke="${GOLD}" stroke-width=".8"/>`;
// the letters ba (bowl and dot) and alif, drawn as strokes
const ba = (x, y, s = 1, c = INK) => `<path d="M${x} ${y}q0 ${4 * s} ${4 * s} ${4 * s}h${3 * s}q${2.2 * s} 0 ${2.2 * s}-${3 * s}" fill="none" stroke="${c}" stroke-width="${(1.9 * s).toFixed(2)}"/><circle cx="${x + 4.6 * s}" cy="${y + 7.4 * s}" r="${(1.05 * s).toFixed(2)}" fill="${c}" stroke="none"/>`;
const alif = (x, y, h, c = INK) => `<path d="M${x} ${y}v${h}" fill="none" stroke="${c}" stroke-width="2.1"/>`;
// an open book, pages white, cover in the given colour; the right page turns
const openBook = (cover) => `
  <path d="M9.5 34.5Q17 33.5 24 37Q31 33.5 38.5 34.5V37Q31 36 24 39.5Q17 36 9.5 37z" fill="${cover}"/>
  <path d="M24 16Q18 12.8 11 13.8V34Q18 33 24 36.2z" fill="${WHITE}"/>
  <path d="M13.5 18.3q3.5-.3 7.5 1.2M13.5 22.3q3.5-.3 7.5 1.2M13.5 26.3q3.5-.3 7.5 1.2" fill="none" stroke="${PARCH2}" stroke-width="1.2"/>
  <g class="a-flip"><path d="M24 16Q30 12.8 37 13.8V34Q30 33 24 36.2z" fill="${WHITE}"/><path d="M27 19.5q4-1.5 7.5-1.2M27 23.5q4-1.5 7.5-1.2M27 27.5q4-1.5 7.5-1.2" fill="none" stroke="${PARCH2}" stroke-width="1.2"/></g>`;
// the writing board (lawh)
const lawh = (inner) => `<g class="a-bob"><rect x="21" y="7.5" width="6" height="4" rx="1" fill="${BROWN}"/>
  <rect x="13.5" y="10" width="21" height="28" rx="3" fill="${BROWN}"/><rect x="16" y="12.8" width="16" height="22.4" rx="1.6" fill="${PARCH}"/>${inner}</g>`;

const A = {
  // the Arabic alphabet: a wooden writing board (lawh) with alif and ba
  letters: lawh(`${alif(28.5, 16.5, 12)}${ba(18.5, 22.5, 1)}`),
  alif: lawh(alif(24, 16.5, 15)),
  // du'a: two open hands raised, a crescent above
  duas: `${cres(24, 10.5, 3.6, GOLD, 'a-beat')}
    <g class="a-bob"><path d="M15 39V30Q12.5 24 14 19.5Q15 17.2 16.3 19L17.6 23 17.8 15.2Q18.6 13.2 19.8 15L20.3 22.5 21.3 17.5Q22.3 16 23 17.8L22.6 31Q21.6 37 18.6 39z" fill="${SKIN}"/>
    <path d="M33 39V30Q35.5 24 34 19.5Q33 17.2 31.7 19L30.4 23 30.2 15.2Q29.4 13.2 28.2 15L27.7 22.5 26.7 17.5Q25.7 16 25 17.8L25.4 31Q26.4 37 29.4 39z" fill="${SKIN}"/></g>`,
  // Sunnah of the day: the morning sun over the dunes, its rays turning
  sunnah: `<g class="a-spin"><path d="M24 9v4.2M24 31.8V36M11 22.5h4.2M32.8 22.5H37M14.8 13.3l3 3M30.2 28.7l3 3M14.8 31.7l3-3M30.2 16.3l3-3" fill="none" stroke="${GOLD}" stroke-width="2.2"/></g>
    <circle cx="24" cy="22.5" r="6.4" fill="${GOLDL}"/>
    <path d="M9 37.5Q17 29.5 26 33.5T39 33V39H9z" fill="${PARCH2}"/>`,
  // Our Prophet ﷺ: the green dome and minaret of the Prophet's Mosque in Madinah, lamps glowing in the windows
  prophet: `<rect x="12" y="26" width="22" height="12" fill="${PARCH}"/>
    <path d="M14.5 26Q14.5 14.5 23 13.4Q31.5 14.5 31.5 26z" fill="${DOME}"/>
    <path d="M23 13.4V9.6" fill="none"/>${cres(23, 7.6, 1.9)}
    <rect x="34.5" y="15.5" width="4.4" height="22.5" fill="${PARCH}"/><path d="M33.9 15.7 36.7 9.8 39.5 15.7z" fill="${DOME}"/><path d="M34.5 20.5h4.4" fill="none"/>
    <path d="M20.5 38v-5a2.5 2.5 0 0 1 5 0v5z" fill="${BROWN}"/>
    <g class="a-glow" fill="${GOLDL}" stroke="none"><rect x="15" y="29" width="2.6" height="3.6" rx="1.3"/><rect x="28.4" y="29" width="2.6" height="3.6" rx="1.3"/><rect x="35.6" y="23" width="2.2" height="3.4" rx="1.1"/></g>
    <path d="M10 38h30" fill="none" stroke-width="1.6"/>`,
  // Story Time: an open picture book with a crescent and star rising from it
  stories: `${openBook(CLAY)}${cres(30.5, 8.6, 3, GOLD, 'a-beat')}${spark(18, 8.5, 2.4)}`,
  // My Books: three books on a shelf, one lifting
  books: `<rect x="12.5" y="14" width="6.5" height="23.5" rx="1" fill="${GREEN}"/><path d="M12.5 18h6.5M12.5 33h6.5" fill="none" stroke="${GOLDL}" stroke-width="1.4"/>
    <g class="a-bob"><rect x="19.5" y="10.5" width="6.5" height="27" rx="1" fill="${CLAY}"/><path d="M19.5 15h6.5M19.5 33h6.5" fill="none" stroke="${GOLDL}" stroke-width="1.4"/>${star8(22.75, 24, 1.6, `fill="${GOLDL}" stroke="none"`)}</g>
    <g transform="rotate(13 32 37.5)"><rect x="27.3" y="14" width="6.5" height="23.5" rx="1" fill="${SKY}"/><path d="M27.3 18h6.5M27.3 33h6.5" fill="none" stroke="${GOLDL}" stroke-width="1.4"/></g>
    <path d="M9.5 38.2h29" fill="none" stroke="${BROWN}" stroke-width="2.4"/>`,
  // Stories of the Prophets: Nuh's ark riding the waves, a dove above
  prophets: `<g class="a-bob"><path d="M11.5 27.5h25l-3.6 6.5H15.1z" fill="${BROWN}"/><rect x="17.5" y="21" width="13" height="6.5" fill="${PARCH2}"/>
    <path d="M16.3 21.2 24 16.5l7.7 4.7z" fill="${CLAY}"/><rect x="20.5" y="23" width="2.6" height="2.6" fill="${GOLDL}" stroke="none"/><rect x="25" y="23" width="2.6" height="2.6" fill="${GOLDL}" stroke="none"/></g>
    <g class="a-sway"><path d="M8.5 35.5q3.5-3 7 0t7 0 7 0 7 0 3 0" fill="none" stroke="${SKY}" stroke-width="2.3"/></g>
    <path d="M10.5 39.5q3.5-2.4 7 0t7 0 7 0 7 0" fill="none" stroke="${SKY}" stroke-width="1.8" opacity=".7"/>
    <path class="a-beat" d="M33 11.5q2.2-2.4 4.6 0-2.3.4-2.3 2.6-.7-2.2-2.3-2.6z" fill="${WHITE}"/>`,
  // Reading Library: an arched bookcase, shaped like a mihrab
  library: `<path d="M12.5 38.5V19a11.5 11.5 0 0 1 23 0v19.5z" fill="${BROWN}"/>
    <path d="M15.2 36.5V19.3a8.8 8.8 0 0 1 17.6 0v17.2z" fill="${PARCH2}"/>
    <path d="M15.2 27h17.6M15.2 36.5h17.6" fill="none" stroke="${BROWN}" stroke-width="1.8"/>
    <rect x="17" y="19.5" width="3" height="7.5" fill="${GREEN}" stroke-width="1"/><rect x="20.3" y="18" width="3" height="9" fill="${CLAY}" stroke-width="1"/>
    <g class="a-bob"><rect x="23.8" y="19" width="3" height="8" fill="${SKY}" stroke-width="1"/></g><rect x="27.4" y="20.5" width="3" height="6.5" fill="${GOLD}" stroke-width="1"/>
    <rect x="17.5" y="29.5" width="3" height="7" fill="${SKY}" stroke-width="1"/><rect x="21" y="29" width="3" height="7.5" fill="${GOLD}" stroke-width="1"/><rect x="24.6" y="30" width="3" height="6.5" fill="${GREEN}" stroke-width="1"/><rect x="28.2" y="29.2" width="3" height="7.3" fill="${CLAY}" stroke-width="1"/>`,
  // Knowing Allah: a star of light, its rays turning slowly
  tawheed: `<g class="a-spin" fill="none" stroke="${GOLD}" stroke-width="1.8"><path d="M24 6.5v4M24 37.5v4M6.5 24h4M37.5 24h4M11.6 11.6l2.8 2.8M33.6 33.6l2.8 2.8M11.6 36.4l2.8-2.8M33.6 14.4l2.8-2.8"/></g>
    ${star8(24, 24, 9.5, `fill="${GOLDL}"`)}<circle cx="24" cy="24" r="5" fill="${WHITE}"/><circle class="a-glow" cx="24" cy="24" r="2.4" fill="${GOLD}" stroke="none"/>`,
  // Qur'an: the mushaf open on its wooden stand (rahl), plain lines, no text
  quran: `<path d="M14 38.5 34 26.5M34 38.5 14 26.5" fill="none" stroke="${BROWN}" stroke-width="3.2"/>
    <g class="a-bob">
    <path d="M24 27.5 9.5 20.2 10.6 18.3 24 25.2 37.4 18.3 38.5 20.2z" fill="${GREEN}"/>
    <path d="M24 25.2 10.6 18.3 13 13.5 24 19.3z" fill="${WHITE}"/><path d="M24 25.2 37.4 18.3 35 13.5 24 19.3z" fill="${WHITE}"/>
    <path d="M15 16.6l6.5 3.3M14 18.8l7 3.6M33 16.6l-6.5 3.3M34 18.8l-7 3.6" fill="none" stroke="${PARCH2}" stroke-width="1.1"/>
    </g><g class="a-beat">${star8(24, 9.5, 2.2, `fill="${GOLDL}" stroke="${GOLD}" stroke-width=".8"`)}</g>`,
  // Hifz: a closed mushaf with a gold star medallion and a ribbon, a star of memory above
  hifz: `<g class="a-bob"><rect x="13.5" y="10.5" width="20" height="27" rx="2" fill="${GREEN}"/><rect x="13.5" y="10.5" width="3.5" height="27" rx="1" fill="${INK}"/>
    <rect x="18.8" y="13.3" width="12.4" height="21.4" rx="1" fill="none" stroke="${GOLDL}" stroke-width="1"/>
    ${star8(25, 24, 3.6, `fill="${GOLDL}" stroke="${GOLD}" stroke-width=".8"`)}
    <path d="M28.5 37.5v4.8l2-1.5 2 1.5v-4.8z" fill="${CLAY}"/></g>${spark(36.5, 10.5, 3)}`,
  // reading from the mushaf: an open book with lines and a ribbon
  reading: `${openBook(GREEN)}<path d="M24 36.2v5l1.6-1.2 1.6 1.2v-4.6" fill="${CLAY}"/>`,
  // Recite to the Sheikh: an arch-shaped speech bubble with the voice inside
  recite: `<path d="M13 31V20a11 11 0 0 1 22 0v11a3 3 0 0 1-3 3H21l-5.5 5v-5H16a3 3 0 0 1-3-3z" fill="${PARCH}"/>
    <path d="M17 19.5a7 7 0 0 1 14 0" fill="none" stroke="${GOLD}" stroke-width="1.2"/>
    <g class="a-glow" fill="none" stroke="${GREEN}" stroke-width="2.2"><path d="M19 23.5v4M24 20v11M29 22.5v6.5"/></g>`,
  // Build the Ayah: word tiles with ayah markers, one tile dropping into place
  ayah: `<rect x="9.5" y="30" width="13" height="8" rx="2" fill="${PARCH2}"/><rect x="25.5" y="30" width="13" height="8" rx="2" fill="${PARCH2}"/>
    <circle cx="16" cy="34" r="2" fill="none" stroke="${GOLD}" stroke-width="1.3"/><circle cx="32" cy="34" r="2" fill="none" stroke="${GOLD}" stroke-width="1.3"/>
    <g class="a-bob"><rect x="16.5" y="12" width="15" height="9" rx="2" fill="${GOLDL}"/><circle cx="24" cy="16.5" r="2.2" fill="none" stroke="${BROWN}" stroke-width="1.3"/></g>
    <path d="M24 23v4.2m-1.8-1.8 1.8 1.8 1.8-1.8" fill="none" stroke="${GREEN}" stroke-width="1.6"/>`,
  // Games: four patterned tiles, one turning into place
  games: `<rect x="11" y="11" width="12" height="12" rx="2" fill="${GREEN}"/>${star8(17, 17, 2.6, `fill="${GOLDL}" stroke="none"`)}
    <rect x="11" y="25" width="12" height="12" rx="2" fill="${CLAY}"/>${star8(17, 31, 2.6, `fill="${PARCH}" stroke="none"`)}
    <rect x="25" y="25" width="12" height="12" rx="2" fill="${SKY}"/>${star8(31, 31, 2.6, `fill="${GOLDL}" stroke="none"`)}
    <g class="a-swing"><g transform="rotate(14 32 15)"><rect x="26" y="9" width="12" height="12" rx="2" fill="${GOLD}"/>${star8(32, 15, 2.6, `fill="${WHITE}" stroke="none"`)}</g></g>`,
  // a trophy with a star
  trophy: `<path d="M16 10.5h16v8a8 8 0 0 1-16 0z" fill="${GOLDL}"/><path d="M16 13h-3.5a4 4 0 0 0 4.3 6M32 13h3.5a4 4 0 0 1-4.3 6" fill="none" stroke="${GOLD}" stroke-width="2"/>
    <path d="M22 26.3h4v5h-4z" fill="${GOLD}"/><rect x="17" y="31.3" width="14" height="6" rx="1.2" fill="${BROWN}"/>${spark(24, 17.5, 3.4)}`,
  // Mazes: a maze tile with the path to a gold star
  mazes: `<rect x="11" y="11" width="26" height="26" rx="3" fill="${PARCH}"/>
    <path d="M11 18h8v7M25 11v7h6M17 37v-6h8v-7M31 25v6h6M25 31v6" fill="none" stroke="${BROWN}" stroke-width="2"/>
    ${star8(33.5, 15, 2.4, `fill="${GOLD}" stroke="none"`)}<circle class="a-bob" cx="14.5" cy="33.5" r="2.2" fill="${CLAY}"/>`,
  // Special days: a calendar page with the new crescent
  days: `<rect x="11.5" y="13" width="25" height="24.5" rx="3" fill="${WHITE}"/><path d="M11.5 16a3 3 0 0 1 3-3h19a3 3 0 0 1 3 3v4h-25z" fill="${GREEN}"/>
    <path d="M17 10v6M31 10v6" fill="none" stroke-width="2.2"/>${cres(24, 28.5, 5, GOLD, 'a-beat')}${spark(31.5, 25, 1.8)}`,
  // My Jannah Garden: a date palm, its fronds swaying, dates hanging
  garden: `<path d="M9.5 39.5Q24 31 38.5 39.5z" fill="${LEAF}"/>
    <path d="M24.5 36.5q-1.4-9 .6-18" fill="none" stroke="${BROWN}" stroke-width="3.2"/>
    <g class="a-sway"><path d="M25 18.5Q17 13 10.5 18 18 16.5 25 18.5zM25 18.5Q32 12.5 38 17.5 31 16 25 18.5zM25 18.5Q21 10 14 9.5 21 12.5 25 18.5zM25 18.5Q28.5 10 35 9.8 28.5 12.5 25 18.5zM25 18.5Q25 11 22.5 6.5 26.5 11 25 18.5z" fill="${GREEN}"/>
    <circle cx="23" cy="21" r="1.5" fill="${CLAY}"/><circle cx="26" cy="21.3" r="1.5" fill="${CLAY}"/><circle cx="24.5" cy="23.2" r="1.5" fill="${CLAY}"/></g>`,
  // stars earned
  stars: `<path class="a-beat" d="M24 9.5l4.3 8.8 9.7 1.4-7 6.8 1.6 9.6-8.6-4.6-8.6 4.6 1.6-9.6-7-6.8 9.7-1.4z" fill="${GOLDL}"/>${spark(36.5, 34.5, 2.6)}${spark(11.5, 12, 2)}`,
  // My achievements: a medal with a star, on two ribbons
  awards: `<path d="M17 9.5h6l3 11h-6zM31 9.5h-6l-3 11h6z" fill="${CLAY}"/><path d="M21.5 9.5h5l-2.5 9z" fill="${SKY}"/>
    <g class="a-sway"><circle cx="24" cy="29" r="9" fill="${GOLDL}"/><circle cx="24" cy="29" r="6.4" fill="none" stroke="${GOLD}" stroke-width="1.2"/>${star8(24, 29, 3.3, `fill="${GOLD}" stroke="none"`)}</g>`,
  // the Guardians adventure: a shield with an arch and a star
  guardians: `<path d="M24 9 35.5 13v10.5Q35.5 33.5 24 39 12.5 33.5 12.5 23.5V13z" fill="${GREEN}"/>
    <path d="M18.5 32V22.5a5.5 5.5 0 0 1 11 0V32" fill="none" stroke="${GOLDL}" stroke-width="1.6"/>
    <g class="a-glow">${star8(24, 23.5, 2.6, `fill="${GOLDL}" stroke="none"`)}</g>`,
  // Seerah: the road across the desert to Madinah, under the crescent
  seerah: `<path d="M8.5 39.5Q14 30 24 32.5T39.5 30.5V39.5z" fill="${PARCH2}"/>
    <path class="a-draw" d="M13 39q3-5 9-5.5t9.5-6.5" fill="none" stroke="${BROWN}" stroke-width="1.6" stroke-dasharray="2 2.4"/>
    <rect x="27.6" y="26.8" width="10" height="4.2" fill="${PARCH}"/><path d="M28.6 27Q28.6 21.8 32.6 21.4 36.6 21.8 36.6 27z" fill="${DOME}"/><path d="M38.4 31V21l1.2-2.6 1.2 2.6v10z" fill="${PARCH}"/>
    ${cres(16, 13.5, 4.2, GOLD, 'a-beat')}${spark(25, 10.5, 1.8)}`,
  // Hadith: an unrolled scroll
  hadith: `<rect x="14.5" y="12.5" width="19" height="23" fill="${PARCH}"/>
    <path d="M18 18h12M18 22h12M18 26h12M18 30h7" fill="none" stroke="${BROWN}" stroke-width="1.3" opacity=".75"/>
    <g class="a-bob"><rect x="12.5" y="9" width="23" height="5" rx="2.5" fill="${PARCH2}"/><rect x="10.8" y="9.9" width="2.6" height="3.2" rx="1" fill="${BROWN}"/><rect x="34.6" y="9.9" width="2.6" height="3.2" rx="1" fill="${BROWN}"/></g>
    <rect x="12.5" y="34" width="23" height="5" rx="2.5" fill="${PARCH2}"/><rect x="10.8" y="34.9" width="2.6" height="3.2" rx="1" fill="${BROWN}"/><rect x="34.6" y="34.9" width="2.6" height="3.2" rx="1" fill="${BROWN}"/>`,
  // Akhlaq: a beating heart held between two leaves
  akhlaq: `<path d="M12 37Q9.5 27 17.5 23.5 17 31 22 37z" fill="${LEAF}"/><path d="M36 37Q38.5 27 30.5 23.5 31 31 26 37z" fill="${LEAF}"/>
    <path class="a-beat" d="M24 33S14.5 27.3 14.5 20.5A5.2 5.2 0 0 1 24 17.6 5.2 5.2 0 0 1 33.5 20.5C33.5 27.3 24 33 24 33z" fill="${ROSE}"/>
    <path d="M18.5 19.6a2.6 2.6 0 0 1 2.8-1.4" fill="none" stroke="${WHITE}" stroke-width="1.3" opacity=".8"/>`,
  // Du'a & Salah: a prayer mat with its mihrab, a lamp hanging in the arch
  salah: `<rect x="14" y="8.5" width="20" height="31" rx="2" fill="${CLAY}"/><rect x="16.2" y="10.7" width="15.6" height="26.6" rx="1" fill="none" stroke="${GOLDL}" stroke-width="1.1"/>
    <path d="M18.5 35V22.5a5.5 5.5 0 0 1 11 0V35z" fill="#8E3F2A"/>
    <g class="a-sway"><path d="M24 17v3.4" fill="none" stroke="${GOLDL}" stroke-width="1"/><path d="M22.4 20.4h3.2l-.6 3.6h-2z" fill="${GOLDL}" stroke="${GOLD}" stroke-width=".7"/></g>
    <path d="M16 39.5v2M20 39.5v2M24 39.5v2M28 39.5v2M32 39.5v2" fill="none" stroke="${GOLD}" stroke-width="1.2"/>`,
  // Adventures: a compass on a map, its needle swinging
  adventures: `<path d="M9.5 15.5 18 12l12 3.5 8.5-3.5v21L30 36.5 18 33l-8.5 3.5z" fill="${PARCH2}"/>
    <circle cx="24" cy="24" r="9.5" fill="${PARCH}" stroke="${BROWN}" stroke-width="2"/>
    <path d="M24 15.8v2M24 30.2v2M15.8 24h2M30.2 24h2" fill="none" stroke="${BROWN}" stroke-width="1.2"/>
    <g class="a-swing"><path d="M24 16.8 26.3 24h-4.6z" fill="${CLAY}"/><path d="M24 31.2 21.7 24h4.6z" fill="${SKY}"/></g><circle cx="24" cy="24" r="1.2" fill="${GOLD}"/>`,
  // Today's missions: a checklist on a clipboard
  missions: `<rect x="12.5" y="10.5" width="23" height="29" rx="2.5" fill="${BROWN}"/><rect x="15" y="14" width="18" height="23" rx="1" fill="${WHITE}"/>
    <rect x="19.5" y="8.5" width="9" height="4.5" rx="1.5" fill="${GOLD}"/>
    <path d="M23 19.5h7.5M23 25.5h7.5M23 31.5h5" fill="none" stroke="${PARCH2}" stroke-width="1.6"/>
    <g class="a-beat" fill="none" stroke="${DOME}" stroke-width="2"><path d="M17.3 19.5l1.4 1.4 2.4-2.8M17.3 25.5l1.4 1.4 2.4-2.8"/></g>
    <rect x="17.3" y="29.8" width="3.4" height="3.4" rx=".6" fill="none" stroke-width="1.1"/>`,
  // Arabic: a reed pen (qalam), its ink pot and the letter ba on paper
  arabic: `<rect x="10.5" y="11.5" width="20" height="25" rx="1.5" fill="${PARCH}" transform="rotate(-6 20.5 24)"/>${ba(14.5, 20, 1.15)}
    <rect x="29.5" y="31" width="8.5" height="7.5" rx="2" fill="${INK}"/><rect x="31" y="29" width="5.5" height="2.5" rx=".8" fill="${INK}"/>
    <g class="a-sway"><path d="M33.5 30 39.5 9.5l1.6.5-5.2 20.8z" fill="${BROWN}"/><path d="M33.5 30l1.2-4.4 1.4.4z" fill="${INK}"/></g>`,
  // Letter Detective: a magnifying glass over the letter ba
  detective: `<g class="a-bob"><path d="M28.5 28.5 37 37" fill="none" stroke="${BROWN}" stroke-width="4.2"/>
    <circle cx="21" cy="21" r="10" fill="#E3EEF0" stroke="${GOLD}" stroke-width="2.6"/>${ba(16.2, 17.5, 1.05, GREEN)}
    <path d="M15.5 16.5a6.5 6.5 0 0 1 4-3" fill="none" stroke="${WHITE}" stroke-width="1.5"/></g>`,
  // Match the Deen: two cards with matching crescents, one turning over
  match: `<g transform="rotate(-10 17 24)"><rect x="9.5" y="13" width="15" height="21" rx="2" fill="${GREEN}"/>${cres(17, 23.5, 4)}</g>
    <g class="a-flip"><g transform="rotate(10 31 24)"><rect x="23.5" y="13" width="15" height="21" rx="2" fill="${GREEN}"/>${cres(31, 23.5, 4)}</g></g>${spark(24, 9.5, 2.6)}`,
  // Journey to Knowledge: a winding road to a minaret
  journey: `<path d="M9 40Q13 31 21 31.5T29.5 24 37 17" fill="none" stroke="${PARCH2}" stroke-width="5.5"/>
    <path class="a-draw" d="M9 40Q13 31 21 31.5T29.5 24 37 17" fill="none" stroke="${BROWN}" stroke-width="1.4" stroke-dasharray="1.8 2.4"/>
    <rect x="33.6" y="10.5" width="5" height="11" fill="${PARCH}"/><path d="M33 10.7 36.1 5.5l3.1 5.2z" fill="${DOME}"/><path d="M33.6 14h5" fill="none" stroke-width="1"/>
    <circle class="a-bob" cx="12.5" cy="35.5" r="2" fill="${CLAY}"/>${spark(19, 13, 2.2)}`,
  // the Tajweed classroom: a chalkboard with the tajweed colours
  tajweed: `<rect x="9.5" y="11.5" width="29" height="21" rx="2" fill="${BROWN}"/><rect x="12" y="14" width="24" height="16" rx="1" fill="#24443A"/>
    <path d="M15 19q2.5-2 5 0t5 0" fill="none" stroke="${PARCH}" stroke-width="1.4"/><path d="M15 25.5h11" fill="none" stroke="${PARCH}" stroke-width="1.4" opacity=".7"/>
    <g class="a-glow" stroke="none"><circle cx="29.5" cy="19" r="1.8" fill="#E06A5A"/><circle cx="32.5" cy="23.5" r="1.8" fill="#6FA8DC"/><circle cx="29.5" cy="27" r="1.8" fill="#7CC07E"/></g>
    <path d="M17 32.5 14.5 39M31 32.5l2.5 6.5" fill="none" stroke="${BROWN}" stroke-width="2"/>`,
  // a hanging lantern (fanous), swaying, its light glowing
  lantern: `<g class="a-sway"><path d="M24 6v4.5" fill="none" stroke-width="1.4"/><path d="M19.5 14.5 24 10.2l4.5 4.3z" fill="${GOLD}"/>
    <path d="M18.5 14.5h11l-1.8 15h-7.4z" fill="${BROWN}"/><path class="a-glow" d="M20.8 16.8h6.4l-1.3 10.5h-3.8z" fill="${GOLDL}"/>
    <path d="M20.2 29.5h7.6l-2 4h-3.6z" fill="${GOLD}"/><path d="M24 33.5v3" fill="none" stroke-width="1.4"/></g>`,
  back: '<path d="M30 12 18 24l12 12" fill="none" stroke-width="3.2"/>',

  // ── My Deen's topics (du'a categories, sunnahs, the Prophet's ﷺ character, special days) ──
  // the night: a crescent and its stars
  moon: `${cres(22, 24, 11, GOLDL, 'a-beat')}${spark(33, 15, 2.8)}${spark(35.5, 30, 2)}${spark(14.5, 11.5, 1.6)}`,
  // food: a bowl of dates
  food: `<path d="M10.5 26h27a13.5 11 0 0 1-27 0z" fill="${BROWN}"/><path d="M14 30.5h20" fill="none" stroke="${GOLDL}" stroke-width="1.2"/>
    <g class="a-bob"><ellipse cx="18" cy="23.5" rx="3.6" ry="2.6" fill="${CLAY}"/><ellipse cx="24.5" cy="22" rx="3.6" ry="2.6" fill="#8E4A2F"/><ellipse cx="30.5" cy="23.5" rx="3.6" ry="2.6" fill="${CLAY}"/><ellipse cx="21.5" cy="19" rx="3.2" ry="2.3" fill="#8E4A2F"/><ellipse cx="27.5" cy="18.8" rx="3.2" ry="2.3" fill="${CLAY}"/></g>`,
  // home: a house with an arched door and a lit window
  home: `<path d="M10 23 24 11l14 12" fill="none" stroke-width="2.4"/><path d="M13.5 21.5V38h21V21.5L24 12.6z" fill="${PARCH}"/>
    <path d="M20.5 38v-6.5a3.5 3.5 0 0 1 7 0V38z" fill="${BROWN}"/><path class="a-glow" d="M28.5 25v-1.5a2 2 0 0 1 4 0V25z" fill="${GOLDL}"/><path d="M15.5 25v-1.5a2 2 0 0 1 4 0V25z" fill="${GOLDL}"/>
    <path d="M10 38h28" fill="none" stroke-width="1.6"/>`,
  // the masjid: a gold dome between two minarets
  masjid: `<rect x="14.5" y="25" width="19" height="13" fill="${PARCH}"/><path d="M16.5 25Q16.5 15 24 14 31.5 15 31.5 25z" fill="${GOLDL}"/>
    <path d="M24 14v-3" fill="none"/>${cres(24, 9.4, 1.7)}
    <rect x="9.5" y="17" width="4" height="21" fill="${PARCH}"/><path d="M9 17.2 11.5 12l2.5 5.2z" fill="${DOME}"/><rect x="34.5" y="17" width="4" height="21" fill="${PARCH}"/><path d="M34 17.2 36.5 12l2.5 5.2z" fill="${DOME}"/>
    <path d="M21.5 38v-5a2.5 2.5 0 0 1 5 0v5z" fill="${GREEN}"/><g class="a-glow" fill="${GOLD}" stroke="none"><rect x="17.5" y="28" width="2.4" height="3.4" rx="1.2"/><rect x="28.1" y="28" width="2.4" height="3.4" rx="1.2"/></g>
    <path d="M8 38h32" fill="none" stroke-width="1.6"/>`,
  // people, family and friends: three hearts together (My Deen draws no people)
  people: `<path d="M17 33S9.5 28.5 9.5 23.2A4.1 4.1 0 0 1 17 20.9a4.1 4.1 0 0 1 7.5 2.3C24.5 28.5 17 33 17 33z" fill="${GOLDL}"/>
    <path d="M31 33S23.5 28.5 23.5 23.2A4.1 4.1 0 0 1 31 20.9a4.1 4.1 0 0 1 7.5 2.3C38.5 28.5 31 33 31 33z" fill="${LEAF}"/>
    <g class="a-beat"><path d="M24 26S15.5 21 15.5 15A4.6 4.6 0 0 1 24 12.5 4.6 4.6 0 0 1 32.5 15C32.5 21 24 26 24 26z" fill="${ROSE}"/></g>
    <path d="M13 38h22" fill="none" stroke="${GOLD}" stroke-width="1.6"/>`,
  // rain: a cloud with falling drops
  rain: `<path d="M14 27a5.5 5.5 0 0 1 1.5-10.8A8 8 0 0 1 31 15a6 6 0 0 1 3.5 12z" fill="${WHITE}"/>
    <g class="a-bob" fill="#6FA8DC"><path d="M17 31q-1.6 3 0 4.2 1.6-1.2 0-4.2z"/><path d="M24 33q-1.6 3 0 4.2 1.6-1.2 0-4.2z"/><path d="M31 31q-1.6 3 0 4.2 1.6-1.2 0-4.2z"/></g>`,
  // a gift, tied with a gold ribbon
  gift: `<rect x="12.5" y="22" width="23" height="16" rx="1.5" fill="${GREEN}"/><rect x="11" y="17" width="26" height="6" rx="1.5" fill="${DOME}"/>
    <path d="M24 17v21" fill="none" stroke="${GOLDL}" stroke-width="3"/>
    <g class="a-beat"><path d="M24 17q-7-7-8.5-2.5T24 17zM24 17q7-7 8.5-2.5T24 17z" fill="${GOLDL}" stroke="${GOLD}"/></g>`,
  // a bird (the Prophet's ﷺ kindness to animals)
  bird: `<g class="a-bob"><path d="M12 27q4-9 14-8 7 .5 9-5 2 6-3 10 0 9-12 9-7 0-8-6z" fill="${WHITE}"/>
    <path d="M18 26q5-6 11-3-4 4-11 3z" fill="${PARCH2}"/><circle cx="31.8" cy="17.4" r="1" fill="${INK}" stroke="none"/><path d="M35 16.8l3.2.8-3 1.4" fill="${GOLD}"/></g>
    <path d="M10 35.5h28" fill="none" stroke="${BROWN}" stroke-width="2"/><path d="M22 33v2.5M26 33v2.5" fill="none" stroke-width="1.2"/>`,
  // a smile (smiling is charity)
  smile: `<circle cx="24" cy="24" r="12" fill="${GOLDL}"/><circle cx="19.5" cy="21.5" r="1.4" fill="${INK}" stroke="none"/><circle cx="28.5" cy="21.5" r="1.4" fill="${INK}" stroke="none"/>
    <path class="a-beat" d="M18.5 26.5q5.5 5.5 11 0" fill="none" stroke-width="2"/><circle cx="16.5" cy="26" r="1.6" fill="${ROSE}" opacity=".45" stroke="none"/><circle cx="31.5" cy="26" r="1.6" fill="${ROSE}" opacity=".45" stroke="none"/>`,
  // a paw print (Misk the cat, and kindness to animals)
  paw: `<g class="a-bob" fill="${BROWN}"><path d="M24 25.5q6 0 8 7 1 5-4 4.5-4-.6-8 0-5 .5-4-4.5 2-7 8-7z"/><ellipse cx="15.5" cy="23" rx="2.8" ry="3.6"/><ellipse cx="20.5" cy="16.5" rx="2.8" ry="3.6"/><ellipse cx="27.5" cy="16.5" rx="2.8" ry="3.6"/><ellipse cx="32.5" cy="23" rx="2.8" ry="3.6"/></g>`,
  // a leaf, swaying
  leaf: `<g class="a-sway"><path d="M13 37Q12 14 36 11 36 35 13 37z" fill="${LEAF}"/><path d="M13 37 31 17M18 30.5h6M22 25.5h6M18.5 26v-5M23 21v-4.5" fill="none" stroke="${INK}" stroke-width="1.2"/></g>`,
  // helping hands: cupped hands holding a young plant
  hands: `<path d="M9.5 30q5.5-2 9.5 2l5 3 5-3q4-4 9.5-2-2.5 8.5-14.5 9.5-12-1-14.5-9.5z" fill="${SKIN}"/>
    <g class="a-bob"><path d="M24 32V20" fill="none" stroke="${GREEN}" stroke-width="2"/><path d="M24 23q-7-1-8-7 7 0 8 7zM24 21q6.5-1 7.5-7-6.5 0-7.5 7z" fill="${LEAF}"/></g>`,
  // the scales of fairness and honesty
  scale: `<path d="M24 11v26M17 38h14" fill="none" stroke="${BROWN}" stroke-width="2.4"/><circle cx="24" cy="10.5" r="1.8" fill="${GOLD}"/>
    <g class="a-swing"><path d="M12 15h24" fill="none" stroke="${BROWN}" stroke-width="2"/>
    <path d="M12 15l-4 9M12 15l4 9M36 15l-4 9M36 15l4 9" fill="none" stroke="${GOLD}" stroke-width="1"/>
    <path d="M7 24h10a5 3.5 0 0 1-10 0zM31 24h10a5 3.5 0 0 1-10 0z" fill="${GOLDL}"/></g>`,
  // water for wudu: an ewer (ibriq) pouring a drop
  water: `<path d="M17 18h12l2 4v10a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6V22z" fill="${GOLD}"/><path d="M19 16h8v2h-8z" fill="${BROWN}"/>
    <path d="M31 24q5-1 7-5" fill="none" stroke="${GOLD}" stroke-width="2.4"/><path d="M15 23q-4 1-3.5 6 .5 3 3.5 3" fill="none" stroke="${BROWN}" stroke-width="1.8"/>
    <path d="M18 27h10" fill="none" stroke="${GOLDL}" stroke-width="1.3"/><path class="a-bob" d="M38.5 26q-2.2 3.4 0 5 2.2-1.6 0-5z" fill="#6FA8DC"/>`,
  // patience: the mountains, with the sun over them
  mountain: `<circle class="a-glow" cx="32" cy="15" r="4.2" fill="${GOLDL}"/><path d="M7.5 38 20 17l7 11 4-5.5L41 38z" fill="${PARCH2}"/>
    <path d="M20 17l-3.6 6 2.2-1 1.4 1.6 1.4-1.6 2.2 1z" fill="${WHITE}"/><path d="M7.5 38h33.5" fill="none" stroke-width="1.6"/>`,
  // coming soon: an hourglass
  soon: `<g class="a-swing"><path d="M15 10h18M15 38h18" fill="none" stroke="${BROWN}" stroke-width="2.6"/>
    <path d="M17 10.5h14q0 8-7 13.5-7-5.5-7-13.5zM17 37.5h14q0-8-7-13.5-7 5.5-7 13.5z" fill="${WHITE}"/>
    <path d="M19.5 14h9q-1 4.5-4.5 7.5-3.5-3-4.5-7.5zM18.5 37.5h11q-1-5-5.5-6.5-4.5 1.5-5.5 6.5z" fill="${GOLDL}" stroke="none"/></g>`,
};
// the same paintings under the names other parts of the app use
Object.assign(A, { dua: A.duas, sun: A.sunnah, path: A.prophet, mushaf: A.quran, calendar: A.days, star: A.stars, heart: A.akhlaq,
  shield: A.guardians, beacon: A.guardians, maze: A.mazes, mazeNight: A.mazes });

// the tones of the star behind each painting, from the Ta'aleem palette (background, its outline)
export const TONES = {
  sage: ['#E3EADF', '#B9CBB5'], sand: ['#EFE8D6', '#D9C9A0'], gold: ['#F3E7C6', '#DCC48E'], clay: ['#F2DFD5', '#DDB7A3'],
  forest: ['#DCE6E0', '#AFC6BA'], stone: ['#E9E6DE', '#CFCABD'],
};

// icon(name, tone, { size, bare }): size fixes the width and height in pixels (otherwise the CSS sizes it); bare leaves
// out the star behind the painting and crops to the painting, for small chips where the star would only add clutter
export function icon(name, tone = 'sage', { size, bare } = {}) {
  const [bg, edge] = TONES[tone] ?? TONES.sage;
  const sz = size ? `;width:${size}px;height:${size}px` : '';
  return `<span class="hi-medal${bare ? ' hi-bare' : ''}" style="--m-bg:${bg};--m-edge:${edge}${sz}"><svg viewBox="${bare ? '6 5 36 37' : '0 0 48 48'}" aria-hidden="true" focusable="false">`
    + (bare ? '' : `<g class="m-back">${star8(24, 24, 16.8, `fill="${bg}" stroke="${edge}" stroke-width="1.1"`)}</g>`)
    + `<g class="m-art" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round">${A[name] || A.stories}</g></svg></span>`;
}
export const has = (name) => !!A[name];
