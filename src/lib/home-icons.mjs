// The home screen's icons: one family of line icons (24px grid, 1.6 stroke, round joins), drawn for Ta'aleem.
// Each sits in a round medallion of a muted tone from the palette (src/styles/system.css). No emoji, no glossy
// gradients, no sacred text: the only letters drawn are Arabic alphabet letters (alif, ba), which are teaching
// content, never Qur'an.
//   icon(name, tone) → '<span class="hi-medal" data-tone="..."><svg …></svg></span>'
const P = {
  letters: '<path d="M9 3.5h6M12 3.5V6"/><path d="M8 6h8l2.5 5L16 20H8l-2.5-9z"/><path d="M9.5 13.5c.5 1.4 4.5 1.4 5 0"/><circle cx="12" cy="16.6" r=".7" fill="currentColor"/>',
  alif: '<path d="M12 4v15"/><path d="M10 5.5c1-.8 2-1 3-.8"/><path d="M8 20h8"/>',
  duas: '<path d="M8.5 21v-4.5L5 11.5a1.6 1.6 0 0 1 2.6-1.8L10 12.5V5.5a1.4 1.4 0 0 1 2.8 0"/><path d="M15.5 21v-4.5l3.5-5a1.6 1.6 0 0 0-2.6-1.8L14 12.5V5.5a1.4 1.4 0 0 0-2.8 0"/>',
  sunnah: '<circle cx="12" cy="12" r="3.5"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
  prophet: '<path d="M4 20h16"/><path d="M6 20v-7h12v7"/><path d="M7.5 13a4.5 4.5 0 0 1 9 0"/><path d="M12 8.5V6.5"/><path d="M10.5 20v-3a1.5 1.5 0 0 1 3 0v3"/>',
  stories: '<path d="M12 6.5C10.5 5 8 4.5 4 5v13c4-.5 6.5 0 8 1.5 1.5-1.5 4-2 8-1.5V5c-4-.5-6.5 0-8 1.5z"/><path d="M12 6.5v13"/>',
  books: '<rect x="4" y="4.5" width="4" height="15" rx=".8"/><rect x="8.5" y="6.5" width="4" height="13" rx=".8"/><path d="m13.6 7.3 3.7-1 3.2 12.4-3.7 1z"/>',
  prophets: '<path d="M3 15c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0"/><path d="M5 12h14l-2 3H7z"/><path d="M12 12V5l4 4h-4"/>',
  library: '<path d="M4 4h16v16H4z"/><path d="M4 12h16"/><path d="M7 4v8M10 4v8M14.5 12v8M17 12v8"/><path d="m12 6 1.5 6"/>',
  tawheed: '<path d="M12 3l2.4 4.2L19 6l-1.2 4.6L22 13l-4.2 2.4L19 20l-4.6-1.2L12 23l-2.4-4.2L5 20l1.2-4.6L2 13l4.2-2.4L5 6l4.6 1.2z" transform="scale(.82) translate(2.6 .4)"/><circle cx="12" cy="11.2" r="2.3"/>',
  quran: '<path d="M4 18l8-5 8 5"/><path d="M6.5 16.4 12 13l5.5 3.4"/><path d="M12 13V5.5"/><path d="M6 8.5c2.5-1.5 4.5-1.5 6-3 1.5 1.5 3.5 1.5 6 3v4.5"/><path d="M6 8.5V13"/>',
  hifz: '<path d="M12 6.5C10.5 5 8 4.5 4 5v13c4-.5 6.5 0 8 1.5 1.5-1.5 4-2 8-1.5V5c-4-.5-6.5 0-8 1.5z"/><path d="m14.5 11 1.6 1.6 3-3.2"/>',
  reading: '<path d="M12 6.5C10.5 5 8 4.5 4 5v13c4-.5 6.5 0 8 1.5 1.5-1.5 4-2 8-1.5V5c-4-.5-6.5 0-8 1.5z"/><path d="M6.5 9h3M6.5 12h3M14.5 9h3M14.5 12h3"/>',
  recite: '<rect x="9" y="3.5" width="6" height="10" rx="3"/><path d="M6 11a6 6 0 0 0 12 0"/><path d="M12 17v3.5M9 20.5h6"/>',
  ayah: '<rect x="3.5" y="5" width="7" height="5" rx="1.2"/><rect x="13.5" y="5" width="7" height="5" rx="1.2"/><rect x="7" y="14" width="10" height="5" rx="1.2" stroke-dasharray="2 2"/><path d="m14 10-1.5 3"/>',
  games: '<path d="M10 4h4v3a2 2 0 1 0 0 4v3h-3a2 2 0 1 1-4 0H4v-4h0a2 2 0 1 0 0-4V4h3"/><path d="M14 14h6v6h-6zM14 17h-2"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4"/><path d="M12 13v3M9 20h6M10 16h4v4h-4z"/>',
  mazes: '<path d="M4 4h16v16H4z"/><path d="M8 4v8h4M16 8v8h-8M12 16v4"/>',
  days: '<rect x="4" y="5.5" width="16" height="14.5" rx="1.5"/><path d="M4 9.5h16M8.5 3.5v4M15.5 3.5v4"/><path d="M14 13.2a2.6 2.6 0 1 0 1.2 3.6 2.1 2.1 0 1 1-1.2-3.6z"/>',
  garden: '<path d="M12 21v-9"/><path d="M12 12C12 8 9 6 5 6c0 4 3 6 7 6z"/><path d="M12 10c0-3 2.5-5 6-5 0 3.5-2.5 5-6 5z"/><path d="M6 21h12"/>',
  stars: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z"/>',
  awards: '<circle cx="12" cy="9" r="5"/><path d="M8.5 13 7 21l5-2.5 5 2.5-1.5-8"/><path d="M12 6.8v4.4M9.8 9h4.4"/>',
  guardians: '<path d="M10 21l.8-10h2.4l.8 10"/><path d="M12 3l3 4-3 4-3-4z"/><path d="M6 8H4.5M19.5 8H18M7.5 4.5 6.5 3.5M16.5 4.5l1-1"/><path d="M7 21h10"/>',
  seerah: '<path d="M4 19c3-6 6-1 8-6s5-4 8-8"/><circle cx="4" cy="19" r="1.4"/><circle cx="12" cy="13" r="1.4"/><path d="M18 3.5h3.5V8"/>',
  hadith: '<path d="M6 4h10a2 2 0 0 1 2 2v12.5a1.5 1.5 0 0 1-1.5 1.5H6.5A2.5 2.5 0 0 1 4 17.5V6a2 2 0 0 1 2-2z"/><path d="M8 9h6M8 12.5h6M8 16h3.5"/>',
  akhlaq: '<path d="M12 20s-7-4.4-7-9.5A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.5C19 15.6 12 20 12 20z"/>',
  salah: '<path d="M7 3.5h10v17H7z"/><path d="M9.5 20.5V9a2.5 2.5 0 0 1 5 0v11.5"/><path d="M7 7h10"/>',
  adventures: '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5z"/><circle cx="12" cy="12" r=".7" fill="currentColor"/>',
  missions: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3.5 6 1.2 1.2L7 4.8M3.5 12l1.2 1.2L7 10.8"/><circle cx="5" cy="18" r="1.4"/>',
  arabic: '<path d="M6 4v13c0 2 1.5 3 3.5 3H18"/><path d="M14 8c0 2-1.5 3-3 3"/><circle cx="16.5" cy="13.5" r=".8" fill="currentColor"/>',
  detective: '<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/>',
  match: '<rect x="3.5" y="5" width="8" height="11" rx="1.2" transform="rotate(-8 7.5 10.5)"/><rect x="12.5" y="7" width="8" height="11" rx="1.2" transform="rotate(8 16.5 12.5)"/><path d="m14.6 12.6 1.5 1.5 2.4-2.8"/>',
  journey: '<path d="M4 18c4-1 3-6 8-6s4-5 8-6"/><circle cx="4" cy="18" r="1.4"/><path d="M18 3v5l2.5-1.2L18 5.5"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
};
// the tones of the medallions (background, icon colour), all from the Ta'aleem palette
export const TONES = {
  sage: ['#E3EADF', '#173D32'], sand: ['#EFE8D6', '#5B4818'], gold: ['#F1E6CA', '#6B5426'], clay: ['#F2DFD5', '#8E4A2F'],
  forest: ['#DCE6E0', '#173D32'], stone: ['#E9E6DE', '#3E443D'],
};
export function icon(name, tone = 'sage') {
  const [bg, fg] = TONES[tone] ?? TONES.sage;
  return `<span class="hi-medal" style="--m-bg:${bg};--m-fg:${fg}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] ?? P.stories}</svg></span>`;
}
export const has = (name) => !!P[name];
