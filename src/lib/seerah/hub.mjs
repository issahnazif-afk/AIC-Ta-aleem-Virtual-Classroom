// The Seerah Quest hub: choose an episode, dress your explorer, see your badges and your Knowledge Archive.
// No three.js here: the 3D world loads only when an episode starts.
import { EPISODES, LATER, scrollIds, stepIds } from './episodes.mjs';
import { BADGES, MODES, TEXT, OUTFITS, PACKS, SKINS, COVERS, defaultAvatar, defaultMode, avatarSVG, badgeUrl, iconUrl, soundOn, setSound, sfx } from './game.mjs';

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
export const STEP_VERSION = 2;   // the step list changed when the game layer arrived: older saved places start the episode again
const percent = (ep, st) => (st?.done ? 100 : st?.v === STEP_VERSION && st.step ? Math.min(99, Math.round((st.step / ep.steps.length) * 100)) : 0);
const scrollTotal = (ep) => scrollIds(ep).length;
const lanternTotal = (ep) => ep.steps.filter((s) => s.do === 'parkour').length;
const withSaw = (node, text) => text.split('ﷺ').forEach((part, i) => { if (i) node.append(el('span', 'saw', 'ﷺ')); node.append(part); });

// small drawn pictures for the episode cards
const ART = {
  zamzam: '<svg viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="sqa1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7B267"/><stop offset=".6" stop-color="#F4845F"/><stop offset="1" stop-color="#C9A27A"/></linearGradient></defs><rect width="160" height="90" fill="url(#sqa1)"/><circle cx="122" cy="30" r="11" fill="#FFE8A8"/><path d="M0 62 L30 40 L52 56 L80 34 L112 58 L136 44 L160 60 V90 H0Z" fill="#9C6B4A"/><rect y="70" width="160" height="20" fill="#D8B88A"/><ellipse cx="70" cy="70" rx="22" ry="6" fill="#7A6A58"/><rect x="48" y="56" width="44" height="14" fill="#A89478"/><path d="M48 56 h44" stroke="#7A6A58" stroke-width="2"/><ellipse cx="70" cy="57" rx="20" ry="4" fill="#4E86A8"/><path d="M134 72 q2 -26 -2 -34" stroke="#6B4A2A" stroke-width="3" fill="none"/><path d="M132 38 q-14 -2 -20 6 M132 38 q12 -4 18 4 M132 38 q-6 -10 -16 -10 M132 38 q8 -10 16 -8" stroke="#2F6B3A" stroke-width="4" fill="none" stroke-linecap="round"/></svg>',
  elephant: '<svg viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="sqa2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FB8DE"/><stop offset=".7" stop-color="#F2C894"/><stop offset="1" stop-color="#D9B07C"/></linearGradient></defs><rect width="160" height="90" fill="url(#sqa2)"/><path d="M0 58 L24 38 L46 52 L70 30 L98 54 L126 36 L160 56 V90 H0Z" fill="#A27B58"/><rect y="70" width="160" height="20" fill="#DCC08F"/><g fill="#6E6A66"><ellipse cx="86" cy="58" rx="22" ry="14"/><circle cx="108" cy="52" r="10"/><path d="M114 56 q8 8 4 18 l-4 0 q2 -8 -4 -14z"/><rect x="70" y="62" width="7" height="12" rx="2"/><rect x="82" y="64" width="7" height="10" rx="2"/><rect x="94" y="62" width="7" height="12" rx="2"/></g><path d="M20 22 l4 -2 l4 2 M36 16 l3 -2 l3 2 M140 18 l3 -2 l3 2" stroke="#3B3B3B" stroke-width="1.5" fill="none"/></svg>',
  birth: '<svg viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="sqa3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3E4A7A"/><stop offset=".55" stop-color="#E9A27A"/><stop offset="1" stop-color="#F2D2A0"/></linearGradient></defs><rect width="160" height="90" fill="url(#sqa3)"/><circle cx="80" cy="62" r="16" fill="#FFE2A0" opacity=".85"/><path d="M0 60 L28 44 L50 56 L76 38 L104 56 L130 42 L160 58 V90 H0Z" fill="#8C5E44"/><g fill="#C9A27A"><rect x="14" y="64" width="18" height="14"/><rect x="36" y="60" width="14" height="18"/><rect x="110" y="62" width="20" height="16"/><rect x="134" y="66" width="14" height="12"/></g><rect y="76" width="160" height="14" fill="#D8B88A"/><g fill="#FFD36B"><circle cx="60" cy="72" r="3"/><circle cx="72" cy="74" r="3"/><circle cx="88" cy="74" r="3"/><circle cx="100" cy="72" r="3"/></g><circle cx="124" cy="18" r="1.6" fill="#fff"/><circle cx="30" cy="14" r="1.2" fill="#fff"/></svg>',
  amin: '<svg viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="sqa4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CC5E8"/><stop offset=".7" stop-color="#F3D7A8"/><stop offset="1" stop-color="#D9B07C"/></linearGradient></defs><rect width="160" height="90" fill="url(#sqa4)"/><path d="M0 58 L26 40 L50 54 L80 34 L110 54 L136 40 L160 56 V90 H0Z" fill="#A27B58"/><rect y="72" width="160" height="18" fill="#DCC08F"/><g stroke="#6B4226" stroke-width="2"><path d="M56 76 V40 M92 76 V40 M56 42 H92"/></g><g fill="#C9B089" stroke="#8A6A45" stroke-width="1"><rect x="60" y="64" width="28" height="8"/><rect x="60" y="56" width="28" height="8"/><rect x="60" y="48" width="28" height="8"/></g><rect x="110" y="58" width="22" height="14" rx="3" fill="#F2E1B8" stroke="#6B4226"/><path d="M112 63 h18 M112 67 h14" stroke="#8A6A45"/><circle cx="34" cy="62" r="5" fill="#FFD36B"/><rect x="32" y="66" width="4" height="8" fill="#6B4226"/></svg>',
  revelation: '<svg viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="sqa5" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#151C3A"/><stop offset=".7" stop-color="#3A3460"/><stop offset="1" stop-color="#6B4E5A"/></linearGradient></defs><rect width="160" height="90" fill="url(#sqa5)"/><g fill="#fff"><circle cx="20" cy="14" r="1.2"/><circle cx="46" cy="24" r="1"/><circle cx="130" cy="12" r="1.4"/><circle cx="146" cy="30" r="1"/><circle cx="100" cy="18" r="1"/></g><path d="M20 90 L70 30 L80 34 L92 18 L100 26 L140 90 Z" fill="#5A4636"/><path d="M92 18 L104 22 L100 30 Z" fill="#6E5644"/><rect x="83" y="40" width="9" height="11" rx="2" fill="#17110C"/><circle cx="87.5" cy="45.5" r="9" fill="#FFD9A0" opacity=".28"/><rect y="80" width="160" height="10" fill="#3E2F28"/></svg>',
  believers: '<svg viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="sqa6" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7C98B"/><stop offset=".65" stop-color="#E9A06C"/><stop offset="1" stop-color="#C98E62"/></linearGradient></defs><rect width="160" height="90" fill="url(#sqa6)"/><path d="M0 56 L30 38 L54 52 L80 32 L108 52 L134 36 L160 54 V90 H0Z" fill="#8C5E44"/><rect y="72" width="160" height="18" fill="#D8B88A"/><path d="M22 70 Q50 60 80 66 T138 62" fill="none" stroke="#FFE08A" stroke-width="1.6" stroke-dasharray="2,4"/><g><circle cx="22" cy="70" r="4" fill="#FFD36B"/><circle cx="51" cy="63" r="4" fill="#FFD36B"/><circle cx="80" cy="66" r="4" fill="#FFD36B"/><circle cx="109" cy="64" r="4" fill="#FFD36B"/><circle cx="138" cy="62" r="4" fill="#8A7A5A"/></g><g fill="#FFD36B" opacity=".3"><circle cx="22" cy="70" r="8"/><circle cx="51" cy="63" r="8"/><circle cx="80" cy="66" r="8"/><circle cx="109" cy="64" r="8"/></g></svg>',
  bilal: '<svg viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="sqa7" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4A3A5E"/><stop offset=".6" stop-color="#D98A5E"/><stop offset="1" stop-color="#E9B880"/></linearGradient></defs><rect width="160" height="90" fill="url(#sqa7)"/><path d="M0 58 L28 40 L52 54 L80 36 L106 54 L132 40 L160 56 V90 H0Z" fill="#7A5040"/><rect y="74" width="160" height="16" fill="#C99A6A"/><circle cx="80" cy="58" r="5" fill="#FFD36B"/><circle cx="80" cy="58" r="13" fill="#FFD36B" opacity=".25"/><rect x="78.5" y="62" width="3" height="12" fill="#5A3E28"/><text x="80" y="30" text-anchor="middle" font-family="Amiri, serif" font-size="18" fill="#FFF3C4">أحد</text></svg>',
  abyssinia: '<svg viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="sqa8" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CC5E8"/><stop offset=".5" stop-color="#CFE3EF"/><stop offset=".52" stop-color="#4E9EC8"/><stop offset="1" stop-color="#2F6E96"/></linearGradient></defs><rect width="160" height="90" fill="url(#sqa8)"/><path d="M0 44 Q20 38 40 44 L40 46 H0Z" fill="#2F7A3A"/><path d="M120 44 Q140 36 160 42 V46 H120Z" fill="#D9B07C"/><g stroke="#CFE9F6" stroke-width="1.4" fill="none"><path d="M10 62 q8 -4 16 0 t16 0"/><path d="M96 74 q8 -4 16 0 t16 0"/><path d="M40 82 q8 -4 16 0 t16 0"/></g><path d="M66 66 L98 66 L92 74 L72 74 Z" fill="#8B5A2B"/><path d="M82 34 V64 M82 36 L98 60 H82Z" fill="#F4EFE3" stroke="#E8D2A6"/><circle cx="30" cy="18" r="7" fill="#FFE8A8"/></svg>',
  hardship: '<svg viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="sqa9" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B3552"/><stop offset=".7" stop-color="#8C5E5A"/><stop offset="1" stop-color="#A07A5C"/></linearGradient></defs><rect width="160" height="90" fill="url(#sqa9)"/><path d="M0 40 L30 70 L60 50 L80 76 L100 52 L130 70 L160 38 V90 H0Z" fill="#5A4033"/><rect y="80" width="160" height="10" fill="#6E5040"/><path d="M112 78 V56 M104 56 H124" stroke="#6B4A2A" stroke-width="2.4"/><g fill="#3F8A3A"><ellipse cx="108" cy="54" rx="9" ry="4"/><ellipse cx="120" cy="54" rx="8" ry="4"/></g><g fill="#5B2A6E"><circle cx="110" cy="60" r="2"/><circle cx="113" cy="62" r="2"/><circle cx="118" cy="60" r="2"/></g><circle cx="50" cy="68" r="4" fill="#FFD36B"/><circle cx="50" cy="68" r="9" fill="#FFD36B" opacity=".3"/><circle cx="130" cy="18" r="6" fill="#F4EFE3" opacity=".8"/></svg>',
  hijrah: '<svg viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="sqa10" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E2A50"/><stop offset=".75" stop-color="#7A5A70"/><stop offset="1" stop-color="#B08A6A"/></linearGradient></defs><rect width="160" height="90" fill="url(#sqa10)"/><g fill="#fff"><circle cx="20" cy="14" r="1.2"/><circle cx="60" cy="10" r="1"/><circle cx="110" cy="20" r="1.3"/><circle cx="140" cy="8" r="1"/></g><circle cx="130" cy="22" r="7" fill="#F4EFE3"/><circle cx="133" cy="20" r="6" fill="#1E2A50"/><path d="M0 70 L40 34 L58 44 L76 26 L104 62 L160 54 V90 H0Z" fill="#4E3A33"/><rect x="62" y="46" width="8" height="8" rx="2" fill="#120D09"/><path d="M0 82 Q40 74 80 80 T160 76" fill="none" stroke="#E8D2A6" stroke-width="1.4" stroke-dasharray="3,4"/><circle cx="150" cy="76" r="3" fill="#FFD36B"/></svg>',
  madinah: '<svg viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="sqa11" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CC5E8"/><stop offset=".7" stop-color="#EAD9B0"/><stop offset="1" stop-color="#D9B07C"/></linearGradient></defs><rect width="160" height="90" fill="url(#sqa11)"/><rect y="70" width="160" height="20" fill="#CBB083"/><g stroke="#6B4A2A" stroke-width="2.2"><path d="M16 72 Q18 52 14 40"/><path d="M140 72 Q138 50 144 38"/><path d="M126 72 Q128 56 124 46"/></g><g stroke="#3F8A3A" stroke-width="3" fill="none" stroke-linecap="round"><path d="M14 40 q-10 -2 -14 4 M14 40 q10 -4 14 2 M14 40 q-4 -8 -10 -8 M14 40 q6 -8 12 -6"/><path d="M144 38 q-10 -2 -14 4 M144 38 q10 -4 14 2 M144 38 q-4 -8 -10 -8"/><path d="M124 46 q-8 -2 -12 4 M124 46 q8 -4 12 2"/></g><rect x="42" y="52" width="74" height="20" fill="#C8A57A"/><rect x="46" y="44" width="66" height="4" fill="#8A9A4A"/><g fill="#7A5A3A"><rect x="50" y="48" width="3" height="10"/><rect x="64" y="48" width="3" height="10"/><rect x="78" y="48" width="3" height="10"/><rect x="92" y="48" width="3" height="10"/><rect x="106" y="48" width="3" height="10"/></g><rect x="74" y="60" width="10" height="12" fill="#8A6A45"/></svg>',
  battles: '<svg viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="sqa12" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B9D3E8"/><stop offset=".7" stop-color="#E8D6B0"/><stop offset="1" stop-color="#C9A27A"/></linearGradient></defs><rect width="160" height="90" fill="url(#sqa12)"/><path d="M84 60 L112 22 L140 60 Z" fill="#8C735C"/><path d="M0 60 L30 48 L60 56 L84 60 L140 60 L160 54 V90 H0Z" fill="#A88566"/><rect y="70" width="160" height="20" fill="#CBB083"/><path d="M10 76 H74" stroke="#6E5040" stroke-width="5"/><path d="M10 72 H74" stroke="#8C6A50" stroke-width="2"/><circle cx="30" cy="40" r="6" fill="#5A4636"/><rect x="26" y="40" width="8" height="10" fill="#5A4636"/><circle cx="122" cy="14" r="5" fill="#FFF3C4"/></svg>',
  treaty: '<svg viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="sqa13" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CC5E8"/><stop offset=".7" stop-color="#F3D7A8"/><stop offset="1" stop-color="#D9B07C"/></linearGradient></defs><rect width="160" height="90" fill="url(#sqa13)"/><path d="M0 58 L28 40 L52 54 L80 36 L106 54 L132 40 L160 56 V90 H0Z" fill="#A27B58"/><rect y="74" width="160" height="16" fill="#DCC08F"/><rect x="40" y="30" width="46" height="36" rx="3" fill="#F2E1B8" stroke="#6B4226"/><path d="M46 38 h34 M46 44 h34 M46 50 h28 M46 56 h20" stroke="#8A6A45" stroke-width="1.3"/><g transform="translate(112 48)"><circle r="9" fill="#D4A017"/><rect x="7" y="-2" width="18" height="4" fill="#D4A017"/><rect x="19" y="2" width="3" height="5" fill="#D4A017"/><circle r="3.5" fill="#A27B58"/></g></svg>',
  legacy: '<svg viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="sqa14" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6C77A"/><stop offset=".6" stop-color="#E9A06C"/><stop offset="1" stop-color="#C98E62"/></linearGradient></defs><rect width="160" height="90" fill="url(#sqa14)"/><circle cx="80" cy="66" r="22" fill="#FFE8A8" opacity=".7"/><path d="M0 70 Q40 58 80 66 T160 62 V90 H0Z" fill="#B98A5E"/><path d="M66 72 Q80 52 94 72 Z" fill="#9A7454"/><rect x="46" y="26" width="68" height="30" rx="4" fill="#F2E1B8" stroke="#8A6A45"/><path d="M80 26 V56" stroke="#8A6A45"/><path d="M52 34 h22 M52 40 h22 M52 46 h18 M86 34 h22 M86 40 h22 M86 46 h18" stroke="#8A6A45" stroke-width="1.4"/></svg>',
};
const LOCK = '<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2" fill="#C9A24A"/><path d="M8 10 V7 a4 4 0 0 1 8 0 V10" stroke="#C9A24A" stroke-width="2.4" fill="none"/><circle cx="12" cy="15" r="1.8" fill="#2A2116"/></svg>';

export function renderHub(root, { level = 3, gender = '', sq, quality, onQuality, onPlay, onSave }) {
  sq.avatar ??= defaultAvatar(gender);
  sq.mode ??= defaultMode(level);
  sq.badges ??= []; sq.archive ??= [];
  root.replaceChildren();
  const hub = el('div', 'sqh');

  // ── the banner ──
  const hero = el('header', 'sqh-hero');
  const words = el('div', 'sqh-words');
  words.append(el('p', 'sqh-kicker', 'The Seerah Quest'), el('h1', 'sqh-title', 'From Darkness to Light'), el('p', 'sqh-tag', 'Explore · Learn · Discover'));
  const lead = el('p', 'sqh-lead'); withSaw(lead, TEXT.hubLead); words.append(lead);
  const next = EPISODES.find((ep) => !(sq[ep.n]?.done) && (ep.n === 1 || sq[ep.n - 1]?.done)) ?? EPISODES[0];
  const go = el('button', 'sqh-go'); go.type = 'button';
  go.textContent = sq[next.n]?.step && sq[next.n]?.v === STEP_VERSION ? `Continue Episode ${next.n}` : `Start Episode ${next.n}`;
  go.addEventListener('click', () => onPlay(next.n));
  words.append(go);
  const me = el('div', 'sqh-me'); me.innerHTML = avatarSVG(sq.avatar, 110);
  hero.append(words, me);
  hub.append(hero);

  const grid = el('div', 'sqh-grid');
  // ── the episodes ──
  const eps = el('section', 'sqh-panel sqh-eps');
  eps.append(el('h2', 'sqh-h', 'Select an episode'));
  const cards = el('div', 'sqh-cards');
  for (const ep of EPISODES) {
    const st = sq[ep.n] ?? {}, locked = ep.n > 1 && !sq[ep.n - 1]?.done, pc = percent(ep, st);
    const c = el('button', 'sqh-card' + (locked ? ' locked' : '') + (st.done ? ' done' : '')); c.type = 'button'; c.disabled = locked;
    const art = el('div', 'sqh-art'); art.innerHTML = ART[ep.key] ?? '';
    if (locked) { const lk = el('span', 'sqh-lock'); lk.innerHTML = LOCK; art.append(lk); }
    const tt = el('b', 'sqh-t'); withSaw(tt, ep.title);
    c.append(art, el('span', 'sqh-n', `Episode ${ep.n}`), tt);
    const ar = el('span', 'sqh-ar', ep.ar); ar.lang = 'ar'; ar.dir = 'rtl'; c.append(ar);
    c.append(el('span', 'sqh-blurb', locked ? `Finish Episode ${ep.n - 1} first.` : ep.blurb));
    const bar = el('span', 'sqh-bar'); const fill = el('i'); fill.style.width = `${pc}%`; bar.append(fill);
    c.append(bar, el('span', 'sqh-pc', st.done ? `Complete · knowledge ${st.best ?? 0}%` : `${pc}% complete`));
    const stats = el('span', 'sqh-stats');
    const stat = (icon, t) => { const s = el('span'); const i = el('img'); i.src = iconUrl(icon); i.alt = ''; i.width = 18; i.height = 18; s.append(i, t); return s; };
    stats.append(stat('scroll', ` ${(st.scrolls ?? []).length}/${scrollTotal(ep)}`), stat('lantern', ` ${(st.lanterns ?? []).length}/${lanternTotal(ep)}`));
    stats.append(el('span', null, `al-Bidaya ${ep.sources}`));
    c.append(stats);
    c.append(el('span', 'sqh-btn', locked ? 'Locked' : st.done ? 'Play again' : pc ? 'Continue' : 'Start'));
    c.addEventListener('click', () => onPlay(ep.n));
    cards.append(c);
  }
  LATER.forEach((t, i) => {
    const c = el('div', 'sqh-card soon');
    const art = el('div', 'sqh-art'); const lk = el('span', 'sqh-lock'); lk.innerHTML = LOCK; art.append(lk);
    const b = el('b', 'sqh-t'); withSaw(b, t);
    c.append(art, el('span', 'sqh-n', `Episode ${i + EPISODES.length + 1}`), b, el('span', 'sqh-blurb', TEXT.later));
    cards.append(c);
  });
  eps.append(cards);

  // ── the side: my explorer, badges, settings, the archive ──
  const side = el('aside', 'sqh-side');
  const mine = el('section', 'sqh-panel sqh-mine');
  mine.append(el('h2', 'sqh-h', 'My explorer'));
  const prev = el('div', 'sqh-preview');
  const edit = el('div', 'sqh-edit');
  const redraw = () => { prev.innerHTML = avatarSVG(sq.avatar, 96); me.innerHTML = avatarSVG(sq.avatar, 110); };
  const save = () => { redraw(); onSave?.(); };
  const row = (label, node) => { const r = el('div', 'sqh-row'); r.append(el('span', 'sqh-rl', label), node); edit.append(r); return r; };
  const choice = (opts, get, set) => {
    const box = el('div', 'sqh-choice');
    const paint = () => box.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === String(get()))));
    for (const [v, label] of opts) { const b = el('button', 'sqh-opt', label); b.type = 'button'; b.dataset.v = v; b.addEventListener('click', () => { set(v); paint(); }); box.append(b); }
    paint(); return { box, paint };
  };
  const swatches = (cols, key) => {
    const box = el('div', 'sqh-sw');
    const paint = () => box.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.c === sq.avatar[key])));
    cols.forEach((c, i) => { const b = el('button'); b.type = 'button'; b.dataset.c = c; b.style.background = c; b.setAttribute('aria-label', `Colour ${i + 1}`); b.addEventListener('click', () => { sq.avatar[key] = c; paint(); save(); }); box.append(b); });
    paint(); return box;
  };
  let headCh;
  const who = choice([['boy', 'Boy'], ['girl', 'Girl']], () => (sq.avatar.girl ? 'girl' : 'boy'), (v) => {
    const girl = v === 'girl'; if (girl === sq.avatar.girl) return;
    sq.avatar.girl = girl; sq.avatar.head = girl ? 'hijab' : 'kufi'; if (girl && sq.avatar.cover === '#FFFFFF') sq.avatar.cover = COVERS[1];
    headRow.replaceChildren(el('span', 'sqh-rl', 'Head'), (headCh = headChoice()).box); save();
  });
  const headChoice = () => choice(sq.avatar.girl ? [['hijab', 'Hijab']] : [['kufi', 'Kufi'], ['none', 'No cap']], () => sq.avatar.head, (v) => { sq.avatar.head = v; save(); });
  row('I am a', who.box);
  const headRow = row('Head', (headCh = headChoice()).box);
  row('Kufi or hijab', swatches(COVERS, 'cover'));
  row('Outfit', swatches(OUTFITS, 'outfit'));
  row('Backpack', swatches(PACKS, 'pack'));
  row('Skin', swatches(SKINS, 'skin'));
  const custom = el('button', 'sqh-small', 'Change my explorer'); custom.type = 'button';
  edit.hidden = true;
  custom.addEventListener('click', () => { edit.hidden = !edit.hidden; custom.textContent = edit.hidden ? 'Change my explorer' : 'Done'; });
  redraw();
  mine.append(prev, custom, edit);

  const bad = el('section', 'sqh-panel sqh-badges');
  bad.append(el('h2', 'sqh-h', 'Badges'));
  const bl = el('div', 'sqh-blist');
  for (const b of BADGES) {
    const got = sq.badges.includes(b.id);
    const d = el('div', 'sqh-badge' + (got ? ' got' : '') + (b.later ? ' later' : ''));
    const i = el('img'); i.src = badgeUrl(b); i.alt = ''; i.width = 64; i.height = 64;
    d.append(i, el('b', null, b.title), el('span', null, got ? 'Earned' : b.how));
    bl.append(d);
  }
  bad.append(bl);

  const set = el('section', 'sqh-panel sqh-set');
  set.append(el('h2', 'sqh-h', 'Settings'));
  const modeCh = choice(Object.entries(MODES).map(([k, m]) => [k, m.name]), () => sq.mode, (v) => { sq.mode = v; modeText.textContent = MODES[v].text; onSave?.(); });
  const modeText = el('p', 'sqh-note', MODES[sq.mode].text);
  set.append(el('p', 'sqh-rl', 'Mode'), modeCh.box, modeText);
  const lab = (input, text) => { const l = el('label', 'sqh-check'); l.append(input, el('span', null, text)); return l; };
  const gentle = el('input'); gentle.type = 'checkbox'; gentle.checked = !!sq.gentle; gentle.addEventListener('change', () => { sq.gentle = gentle.checked; onSave?.(); });
  const snd = el('input'); snd.type = 'checkbox'; snd.checked = soundOn(); snd.addEventListener('change', () => { setSound(snd.checked); if (snd.checked) sfx('light'); });
  set.append(lab(gentle, TEXT.gentleLabel), lab(snd, 'Sound effects'));
  const q = el('select', 'sqh-sel'); q.id = 'sq-quality';
  for (const [v, t] of [['low', 'Low (older computers, tablets)'], ['medium', 'Medium'], ['high', 'High']]) q.append(new Option(t, v));
  q.value = quality; q.addEventListener('change', () => onQuality?.(q.value));
  const ql = el('label', 'sqh-q'); ql.append(el('span', 'sqh-rl', 'Picture quality'), q); set.append(ql);
  set.append(el('p', 'sqh-note', TEXT.solo));

  const arch = el('section', 'sqh-panel sqh-archive');
  arch.append(el('h2', 'sqh-h', 'Knowledge Archive'));
  arch.append(el('p', 'sqh-note', `${sq.archive.length} passages kept · ${sq.light ?? 0} lights collected`));
  const open = el('button', 'sqh-small', 'Open the archive'); open.type = 'button';
  open.addEventListener('click', () => openArchive(root, sq));
  arch.append(open);

  side.append(mine, bad, arch, set);
  grid.append(eps, side);
  hub.append(grid);
  const rules = el('p', 'sqh-rules'); withSaw(rules, TEXT.hubRules); hub.append(rules);
  hub.append(el('p', 'sqh-preview-note', 'Preview: the English translations are waiting for an Islamic Studies teacher\'s review.'));
  root.append(hub);
  return { quality: () => q.value };
}

// the whole archive, episode by episode (the passages load only when it is opened)
async function openArchive(root, sq) {
  const { default: SRC } = await import('../../data/seerah/sources.json');
  const by = Object.fromEntries(SRC.passages.map((p) => [p.id, p]));
  const shade = el('div', 'sqh-modal'); shade.setAttribute('role', 'dialog'); shade.setAttribute('aria-label', 'Knowledge Archive');
  const box = el('div', 'sqh-modal-box');
  box.append(el('p', 'sqh-kicker', 'Knowledge Archive'), el('h2', 'sqh-h', 'Everything you have read'), el('p', 'sqh-note', TEXT.archiveHub));
  for (const ep of EPISODES) {
    const ids = [...new Set(ep.steps.flatMap(stepIds))].filter((id) => sq.archive.includes(id));
    box.append(el('h3', 'sqh-h3', `Episode ${ep.n}: ${ep.title} (${ids.length})`));
    if (!ids.length) box.append(el('p', 'sqh-note', 'Play this episode to fill its shelf.'));
    for (const id of ids) {
      const p = by[id], d = el('details', 'sq-rec' + (p.class === 'reported' ? ' rep' : '')), sm = el('summary');
      sm.append(el('span', 'sq-rec-k', (sq[ep.n]?.scrolls ?? []).includes(id) ? 'Scroll' : p.class === 'reported' ? 'A report' : 'Record'), el('span', null, p.en.length > 90 ? p.en.slice(0, 88).replace(/\s+\S*$/, '') + '…' : p.en));
      const ar = el('p', 'sq-ar', p.ar); ar.lang = 'ar'; ar.dir = 'rtl'; ar.hidden = true;
      const show = el('button', 'sq-src', 'Show the source'); show.type = 'button';
      show.addEventListener('click', () => { ar.hidden = !ar.hidden; show.textContent = ar.hidden ? 'Show the source' : 'Hide the source'; });
      d.append(sm, el('p', 'sq-text', p.en), el('p', 'sq-cite', `${p.class === 'reported' ? 'Reported · the book marks this as uncertain or as an addition · ' : ''}al-Bidaya wa'l-Nihaya ${p.vol}/${p.page}`), show, ar);
      box.append(d);
    }
  }
  const close = el('button', 'sqh-go', 'Close'); close.type = 'button';
  const end = () => { shade.remove(); removeEventListener('keydown', esc); };
  const esc = (e) => { if (e.key === 'Escape') end(); };
  close.addEventListener('click', end); shade.addEventListener('click', (e) => { if (e.target === shade) end(); }); addEventListener('keydown', esc);
  box.append(close); shade.append(box); root.append(shade); close.focus({ preventScroll: true });
}
