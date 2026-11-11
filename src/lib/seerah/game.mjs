// The Seerah Quest's game layer, shared by the episode hub (no three.js) and the 3D quest:
// the explorer's look, the play modes, the badges, the six stages and the sound effects.
// The explorer is always the student: an ordinary child, never a person from the history.
// the site base, so the badge pictures load on GitHub Pages; plain '/' when the build scripts import this file
const BASE = String(import.meta.env?.BASE_URL ?? '/').replace(/\/?$/, '/');
const u = (p) => BASE + p;

// ── the six stages of every episode (from the design document) ──
export const STAGES = {
  A: 'The Arrival',
  B: 'Explore and Discover',
  C: 'The Challenge',
  D: 'The Knowledge Archive',
  E: 'The Final Quest',
  F: 'Reflection',
};

// ── the game's own sentences (instructions only, never history); scripts/seerah/lint.mjs checks them with the writing rules ──
export const TEXT = {
  calm: 'Near the House we walk calmly: no running and no jumping here.',
  archive: 'Every passage you have read or found in this episode is kept here with its page. Open one to read it again, and tap Show the source for the Arabic.',
  archiveEmpty: 'Nothing here yet. Passages appear here as soon as you read them.',
  archiveHub: 'Every passage you have read or found is kept here, episode by episode, with its volume and page.',
  timer: 'Master Explorer: the clock starts on the first roof. Beat the time for a bonus, or just enjoy the climb.',
  gentle: 'Gentle jumps are on: the gaps are short and every roof has a flag.',
  fall: 'Poof! No harm done. You are back at the last flag.',
  helpers: 'Stepping stones have appeared in the gaps to help you.',
  lanternTitle: 'You lit the lantern',
  lanternText: 'Well done. The lantern at the top is shining, and the whole climb is behind you.',
  hubLead: 'Journey through the whole Seerah, from the well of Zamzam to the Farewell Pilgrimage, in fourteen episodes. Everything you read comes from one book: al-Bidaya wa\'l-Nihaya by Imam Ibn Kathir. Each event shows its volume and page, and you can open the Arabic. Where the book says a report is uncertain, the game tells you so.',
  hubRules: 'The Prophet ﷺ, the Companions and the people of the time are never shown. People appear only as lanterns. Moments that were from Allah alone are scenes to watch, not to play. The only figure in the world is your own explorer. Only practice pots and crates can be smashed, and nothing is ever built, broken or climbed at the House.',
  smash: 'Press F or tap Smash next to a practice pot or crate. Pots take two hits and crates take three.',
  yardNote: 'Only the practice pots and crates in the yard can be smashed. They give you bricks and wood for your build plot.',
  build: 'Choose a piece, walk to a square of the plot and press B or tap Place. Stack blocks, add stairs and climb your own building.',
  buildKeys: 'Keys: B place · X take off · R turn · Z undo · 1 to 8 choose a piece.',
  buildNote: 'Your design is your own. It is a game build, not a model of any real place.',
  noMaterials: 'Not enough materials. Smash practice pots and crates in the training yard for more.',
  vault: 'Step on the glowing plates in the right order. A wrong plate puts out the lights, and you can start again.',
  vaultWrong: 'Not that one. The plates go dark: start again from the first.',
  vaultOpen: 'The stone door sinks into the floor. Go in and open the chest.',
  carry: 'Walk to the pile, press E or tap Pick up, carry a block to the model and press E again.',
  lanterns: 'Each lantern holds the record of a person from the book. Walk up to a lantern to read it.',
  modern: 'A practice scenario from today. It is not from the Seerah.',
  ladder: 'Push towards a ladder to climb it. Let go to hang on, and jump to let go.',
  hold: 'Stand inside the ring of light until the count runs out. Gold lights will appear around you. If you step out, the count starts again.',
  holdReset: 'You left your post, so the count starts again.',
  solo: 'You explore on your own: there are no other players in this world.',
  later: 'Coming after source review, in sha Allah.',
  gentleLabel: 'Gentle jumps: short gaps and a flag on every roof.',
};

// ── play modes ──
//   explorer  Level 3: golden markers on the map, more checkpoints, shorter jumps
//   master    Level 4: no glow on the markers, longer jumps that need a run, a time to beat
//   gentle    any level: very short jumps and a checkpoint on every roof (for anyone who finds the jumps hard)
export const MODES = {
  explorer: { name: 'Explorer', glow: true, timer: false, text: 'Golden markers on the map, more checkpoints and shorter jumps.' },
  master: { name: 'Master Explorer', glow: false, timer: true, text: 'No glowing markers, longer jumps that need a run, and a time to beat.' },
};
export const defaultMode = (level) => (level >= 4 ? 'master' : 'explorer');

// ── the explorer's look ──
export const OUTFITS = ['#F4EFE3', '#3E7CB1', '#2F8F6B', '#B5523B', '#7A5BA8', '#D9A441'];
export const PACKS = ['#8A5A2B', '#C0392B', '#2E6E9E', '#3C8D5A', '#E0A526', '#5B4B8A'];
export const SKINS = ['#F2D3B3', '#D9A97E', '#B07A50', '#7A4E2E'];
export function defaultAvatar(gender) {
  const girl = gender === 'f' || gender === 'girl' || gender === 'female';
  return { girl, head: girl ? 'hijab' : 'kufi', outfit: girl ? OUTFITS[4] : OUTFITS[0], pack: PACKS[0], skin: SKINS[1], cover: girl ? '#2E4057' : '#FFFFFF' };
}
export const COVERS = ['#FFFFFF', '#2E4057', '#6B4226', '#1F6F5C', '#8E3B46', '#C9A24A'];

// a front view of the explorer for the hub (SVG, no 3D needed)
export function avatarSVG(a, size = 120) {
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); const c = (s) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * k))); return `rgb(${c(16)},${c(8)},${c(0)})`; };
  const o = a.outfit, dark = shade(o, 0.8), legs = a.girl ? o : '#4B4B55';
  const head = a.head === 'hijab'
    ? `<rect x="33" y="8" width="34" height="34" rx="6" fill="${a.cover}"/><rect x="38" y="15" width="24" height="22" rx="4" fill="${a.skin}"/><path d="M30 38 L70 38 L74 52 L26 52 Z" fill="${a.cover}"/>`
    : `<rect x="37" y="12" width="26" height="26" rx="5" fill="${a.skin}"/>${a.head === 'kufi' ? `<rect x="36" y="8" width="28" height="9" rx="4" fill="${a.cover}"/>` : '<rect x="36" y="10" width="28" height="6" rx="3" fill="#2B2018"/>'}`;
  const face = '<rect x="44" y="23" width="3.5" height="4" rx="1.5" fill="#2B2018"/><rect x="52.5" y="23" width="3.5" height="4" rx="1.5" fill="#2B2018"/><path d="M45 31 Q50 34 55 31" stroke="#2B2018" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
  const body = a.girl
    ? `<path d="M31 44 H69 L73 104 H27 Z" fill="${o}"/><rect x="31" y="44" width="38" height="6" fill="${dark}"/>`
    : `<rect x="31" y="44" width="38" height="40" rx="3" fill="${o}"/><rect x="34" y="84" width="14" height="22" fill="${legs}"/><rect x="52" y="84" width="14" height="22" fill="${legs}"/><rect x="31" y="78" width="38" height="12" fill="${o}"/>`;
  const arms = `<rect x="20" y="45" width="11" height="34" rx="3" fill="${o}"/><rect x="69" y="45" width="11" height="34" rx="3" fill="${o}"/><rect x="20" y="76" width="11" height="8" rx="3" fill="${a.skin}"/><rect x="69" y="76" width="11" height="8" rx="3" fill="${a.skin}"/>`;
  const straps = `<rect x="35" y="44" width="4" height="30" fill="${a.pack}"/><rect x="61" y="44" width="4" height="30" fill="${a.pack}"/>`;
  const feet = `<rect x="33" y="104" width="15" height="6" rx="2" fill="#5A3E28"/><rect x="52" y="104" width="15" height="6" rx="2" fill="#5A3E28"/>`;
  return `<svg viewBox="0 0 100 112" width="${size}" height="${Math.round(size * 1.12)}" role="img" aria-label="Your explorer">${feet}${body}${arms}${straps}${head}${face}</svg>`;
}

// ── badges: the five from the design archive (assets/badges, shapes only: a compass, a book, a shield, stars) ──
export const BADGES = [
  { id: 'explorer', title: 'Explorer', img: 'badge_explorer.svg', how: 'Reach the lantern at the end of a climbing challenge.' },
  { id: 'seeker', title: 'Knowledge Seeker', img: 'badge_knowledge_seeker.svg', how: 'Find every knowledge scroll in one episode.' },
  { id: 'champion', title: 'Seerah Champion', img: 'badge_seerah_champion.svg', how: 'Finish Episodes 1 and 2 with two thirds of the knowledge questions right.' },
  { id: 'trust', title: 'Guardian of Trust', img: 'badge_guardian_of_trust.svg', how: 'Choose the trustworthy answer in every Trust Challenge of Episode 4.' },
  { id: 'treasure', title: 'Treasure Discoverer', img: 'badge_treasure_discoverer.svg', how: 'Open a hidden chest in a puzzle room.' },
  { id: 'puzzle', title: 'Puzzle Master', img: 'badge_puzzle_master.svg', how: 'Solve a puzzle room without stepping on a wrong plate.' },
  { id: 'builder', title: 'Master Builder', img: 'badge_master_builder.svg', how: 'Place twenty pieces on your build plot.' },
  { id: 'climber', title: 'Mountain Climber', img: 'badge_mountain_climber.svg', how: 'Reach the lantern on the mountain path in Episode 5.' },
  { id: 'navigator', title: 'Master Navigator', img: 'badge_master_navigator.svg', how: 'Sail across the sea map in Episode 8 without touching a reef.' },
  { id: 'master', title: 'Master of the Seerah', img: 'badge_master_of_seerah.svg', how: 'Finish all fourteen episodes of the Seerah Quest.' },
];
export const badgeUrl = (b) => u(`seerah/badges/${b.img}`);
export const iconUrl = (name) => u(`seerah/icons/icon_${name}.svg`);

// the "Achievement unlocked" pop-up
export function showBadge(host, id, sfx) {
  const b = BADGES.find((x) => x.id === id); if (!b) return;
  const box = document.createElement('div'); box.className = 'sq-award'; box.setAttribute('role', 'status');
  const img = document.createElement('img'); img.src = badgeUrl(b); img.alt = ''; img.width = 96; img.height = 96;
  const k = document.createElement('p'); k.className = 'sq-award-k'; k.textContent = 'Achievement unlocked!';
  const t = document.createElement('p'); t.className = 'sq-award-t'; t.textContent = b.title;
  const h = document.createElement('p'); h.className = 'sq-award-h'; h.textContent = b.how;
  box.append(img, k, t, h);
  host.append(box);
  sfx?.('award');
  setTimeout(() => box.classList.add('out'), 3600);
  setTimeout(() => box.remove(), 4200);
}

// ── sound effects, made in the browser (no sound files to download) ──
let ctx = null;
const SOUND_KEY = 'seerahSound';
export const soundOn = () => { try { return localStorage.getItem(SOUND_KEY) !== 'off'; } catch { return true; } };
export const setSound = (on) => { try { localStorage.setItem(SOUND_KEY, on ? 'on' : 'off'); } catch {} };
function tone(at, freq, dur, { type = 'sine', vol = 0.18, to = null } = {}) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, at); if (to) o.frequency.exponentialRampToValueAtTime(to, at + dur);
  g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g).connect(ctx.destination); o.start(at); o.stop(at + dur + 0.05);
}
function noise(at, dur, vol = 0.2, freq = 900) {
  const n = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq; g.gain.value = vol;
  s.connect(f).connect(g).connect(ctx.destination); s.start(at);
}
export function sfx(kind) {
  if (!soundOn()) return;
  try { ctx ??= new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); } catch { return; }
  const t = ctx.currentTime + 0.01;
  if (kind === 'jump') tone(t, 300, 0.18, { type: 'square', vol: 0.06, to: 620 });
  else if (kind === 'land') noise(t, 0.08, 0.08, 400);
  else if (kind === 'light') { tone(t, 880, 0.12, { vol: 0.1 }); tone(t + 0.06, 1320, 0.16, { vol: 0.08 }); }
  else if (kind === 'scroll') [523, 659, 784, 1047].forEach((f, i) => tone(t + i * 0.07, f, 0.25, { type: 'triangle', vol: 0.12 }));
  else if (kind === 'checkpoint') { tone(t, 660, 0.2, { type: 'triangle', vol: 0.14 }); tone(t + 0.12, 990, 0.3, { type: 'triangle', vol: 0.12 }); }
  else if (kind === 'poof') { noise(t, 0.35, 0.25, 700); tone(t, 500, 0.3, { vol: 0.06, to: 180 }); }
  else if (kind === 'award') [523, 659, 784, 1047, 1319].forEach((f, i) => { tone(t + i * 0.09, f, 0.5, { type: 'triangle', vol: 0.12 }); tone(t + i * 0.09, f / 2, 0.5, { vol: 0.05 }); });
  else if (kind === 'lantern') [392, 523, 659, 784].forEach((f, i) => tone(t + i * 0.1, f, 0.6, { type: 'sine', vol: 0.12 }));
  else if (kind === 'swing') noise(t, 0.12, 0.1, 1800);
  else if (kind === 'hit') { noise(t, 0.1, 0.22, 500); tone(t, 180, 0.12, { type: 'square', vol: 0.05, to: 120 }); }
  else if (kind === 'smash') { noise(t, 0.4, 0.3, 900); noise(t + 0.05, 0.3, 0.2, 2400); tone(t, 220, 0.25, { type: 'triangle', vol: 0.08, to: 90 }); }
  else if (kind === 'place') { tone(t, 330, 0.08, { type: 'square', vol: 0.06 }); noise(t, 0.06, 0.12, 300); }
  else if (kind === 'plate') { tone(t, 523, 0.25, { type: 'sine', vol: 0.12 }); tone(t + 0.08, 784, 0.35, { type: 'sine', vol: 0.1 }); }
  else if (kind === 'wrong') { tone(t, 220, 0.3, { type: 'sawtooth', vol: 0.06, to: 140 }); }
  else if (kind === 'door') { noise(t, 1.6, 0.18, 160); tone(t, 90, 1.6, { type: 'triangle', vol: 0.08, to: 60 }); }
  else if (kind === 'pick') { tone(t, 440, 0.1, { type: 'triangle', vol: 0.1, to: 660 }); }
}
