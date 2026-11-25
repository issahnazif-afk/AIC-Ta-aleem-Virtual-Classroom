// The all-time leaderboards for Levels 1 to 4: healthy competition in every activity.
// "So for this let the competitors compete" (al-Mutaffifin 83:26).
// Points are for practice (worked out by the Apps Script, see apps-script/Code.gs "the leaderboards"): finishing,
// steady work and a strong result, at most 100 per activity per day. Points never reset: the more a student practises,
// the higher they climb.
//
//   headlines(data)                  → [{ icon, text, act }]: the news that flies around after signing in
//   mountNews(bar, items, { onOpen }) the ticker along the bottom of the home screens
//   flyIn(item, { onOpen })          one "breaking news" card that flies across once, after signing in
//   renderLeaders(root, data, { act, scope, onChange }) the leaderboards screen

export const ACTS = {
  hifz: { title: 'Hifz test', icon: '📖' },
  recite: { title: 'Recite', icon: '🎙️' },
  alifba: { title: 'Alif Ba', icon: '🔤' },
  learn: { title: 'Play & Learn', icon: '🧩' },
  stories: { title: 'Story Time', icon: '📚' },
  reading: { title: 'Reading & Books', icon: '📘' },
  seerah: { title: 'The Seerah Quest', icon: '🐪' },
  guardians: { title: 'Guardians of Light', icon: '🏮' },
  maze: { title: 'Mazes', icon: '🧭' },
  adventure: { title: "Ta'aleem Adventure", icon: '⛰️' },
  trail: { title: 'Noor Trail', icon: '🗺️' },
  deen: { title: 'My Deen', icon: '🤲' },
  games: { title: 'Play & Make', icon: '🎨' },
};
const ORDER = Object.keys(ACTS);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const ord = (n) => `#${n}`;
const lv = (x) => `Level ${x.level}`;

// ── the headlines ──
export function headlines(data) {
  // every student sees the leader of every activity across all levels (the "headline" lines, always all of them, in
  // the activities' order), then their own news, then a few extras (their level's leader, close races)
  if (!data?.ok || !data.acts) return [];
  const lead = [], mine = [], extra = [];
  const L = data.level >= 1 && data.level <= 4 ? data.level : 0;
  for (const act of ORDER) {
    const b = data.acts?.[act] ?? { all: [], level: [] };
    const { title, icon } = ACTS[act];
    const top = b.all?.[0], second = b.all?.[1];
    if (top?.me) mine.push({ icon: '🌟', act, text: `MashaAllah! You lead ${title} across all four levels, with ${top.points} points.` });
    if (top) lead.push({ icon, act, text: `${title}: ${top.me ? 'you lead' : `${top.name} (${lv(top)}) leads`} across all levels with ${top.points} points.` });
    else lead.push({ icon, act, text: `${title}: no leader yet. Be the first!` });
    const lt = b.level?.[0];
    if (L && lt && lt.me && !top?.me) mine.push({ icon: '🌟', act, text: `You are top of Level ${L} in ${title}! Keep it up.` });
    else if (L && lt && !lt.me && lt.name !== top?.name) extra.push({ icon, act, text: `In Level ${L}, ${lt.name} is top of ${title}.` });
    if (top && second && top.points - second.points <= 10 && top.points > 0)
      extra.push({ icon: '🔥', act, text: `Neck and neck in ${title}: ${top.name} and ${second.name} are only ${top.points - second.points || 'a few'} points apart!` });
    if (L && b.me && b.me.rankLevel > 1) {
      const ahead = b.level.find((x) => x.rank === b.me.rankLevel - 1) ?? b.level[b.me.rankLevel - 2];
      const gap = ahead ? ahead.points - b.me.points : 0;
      mine.push({ icon: '🚀', act, text: gap > 0 ? `You are ${ord(b.me.rankLevel)} in Level ${L} for ${title}, just ${gap} points behind ${ord(b.me.rankLevel - 1)}. You can do it!` : `You are ${ord(b.me.rankLevel)} in Level ${L} for ${title}. Keep going!` });
    }
  }
  if (data.players > 1) extra.push({ icon: '🌙', act: null, text: `${data.players} students are racing to do good. May Allah reward every one of them.` });
  const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
  return [...shuffle(mine).slice(0, 3), ...lead, ...shuffle(extra).slice(0, 8)];
}

// the news shown at once on signing in, before the boards arrive (or when they cannot be reached)
export function waitingNews() {
  return [{ icon: '📣', act: null, text: 'Live leaderboard news is on its way…' },
    ...ORDER.map((act) => ({ icon: ACTS[act].icon, act, text: `${ACTS[act].title}: every activity you finish earns points, and they never run out. Can you lead it?` }))];
}

// ── the ticker along the bottom ──
export function mountNews(bar, items, { onOpen } = {}) {
  bar.replaceChildren();
  if (!items.length) { bar.hidden = true; return; }
  const label = el('button', 'news-label'); label.type = 'button';
  label.append(el('span', 'news-dot'), document.createTextNode('LIVE · Leaderboard'));
  label.title = 'See the leaderboards'; label.addEventListener('click', () => onOpen?.());
  const view = el('div', 'news-view'); view.setAttribute('aria-hidden', 'true');
  const track = el('div', 'news-track');
  const line = () => items.map((it) => { const b = el('button', 'news-item'); b.type = 'button'; b.tabIndex = -1; b.append(el('span', 'news-ic', it.icon), document.createTextNode(it.text)); b.addEventListener('click', () => onOpen?.(it.act)); return b; });
  track.append(...line(), ...line());   // twice, so the loop is seamless
  track.style.setProperty('--news-secs', `${Math.max(25, items.length * 7)}s`);
  view.append(track);
  // screen readers: the same news as a plain list, read on request
  const sr = el('ul', 'sr-only'); sr.setAttribute('aria-label', 'Leaderboard headlines'); items.forEach((it) => sr.append(el('li', '', it.text)));
  const close = el('button', 'news-x', '×'); close.type = 'button'; close.setAttribute('aria-label', 'Hide the headlines');
  close.addEventListener('click', () => { bar.hidden = true; bar.dataset.closed = '1'; });
  bar.append(label, view, sr, close);
}

// ── one breaking-news card, flying in after signing in ──
export function flyIn(item, { onOpen } = {}) {
  if (!item) return;
  document.querySelector('.news-fly')?.remove();
  const c = el('button', 'news-fly'); c.type = 'button';
  c.append(el('span', 'nf-k', 'Leaderboard news'), el('span', 'nf-ic', item.icon), el('b', 'nf-t', item.text), el('span', 'nf-go', 'See the leaderboards →'));
  c.addEventListener('click', () => { c.remove(); onOpen?.(item.act); });
  document.body.append(c);
  requestAnimationFrame(() => requestAnimationFrame(() => c.classList.add('in')));
  setTimeout(() => { c.classList.add('out'); setTimeout(() => c.remove(), 700); }, 6500);
}

// ── the leaderboards screen ──
export function renderLeaders(root, data, { act, scope = 'level', onChange } = {}) {
  root.replaceChildren();
  if (!data?.ok) { root.append(el('p', 'muted', data?.error === 'network' ? 'The leaderboards could not be reached. Check the connection and try again.' : 'The leaderboards are not available right now.')); return; }
  if (!data.level) { root.append(el('p', 'muted', 'The leaderboards are for Levels 1 to 4.')); return; }
  const acts = ORDER.filter((a) => data.acts?.[a]);
  if (data.demo) root.append(el('p', 'lb-demo', 'Sample board: the class log is not connected here, so these names and points are made up.'));
  if (!acts.length) { root.append(el('p', 'lb-empty', 'No points yet. Finish any activity to be the first on the board, in sha Allah!')); return; }
  act = acts.includes(act) ? act : acts[0];
  const b = data.acts[act];

  // my level / all levels
  const sc = el('div', 'lb-scope'); sc.setAttribute('role', 'tablist'); sc.setAttribute('aria-label', 'Which board');
  for (const [id, label] of [['level', `My level (Level ${data.level})`], ['all', 'All levels, 1 to 4']]) {
    const t = el('button', 'lb-scope-b', label); t.type = 'button'; t.setAttribute('role', 'tab'); t.setAttribute('aria-selected', String(scope === id));
    t.addEventListener('click', () => onChange?.({ act, scope: id })); sc.append(t);
  }
  // the activities
  const chips = el('div', 'lb-acts'); chips.setAttribute('role', 'tablist'); chips.setAttribute('aria-label', 'Activities');
  for (const a of acts) {
    const t = el('button', 'lb-act'); t.type = 'button'; t.setAttribute('role', 'tab'); t.setAttribute('aria-selected', String(a === act));
    t.append(el('span', 'lb-act-ic', ACTS[a].icon), document.createTextNode(ACTS[a].title));
    t.addEventListener('click', () => onChange?.({ act: a, scope })); chips.append(t);
  }
  root.append(sc, chips);

  const list = scope === 'all' ? b.all : b.level;
  const card = el('section', 'lb-card'); card.setAttribute('aria-label', `${ACTS[act].title}, ${scope === 'all' ? 'all levels' : 'Level ' + data.level}`);
  const head = el('div', 'lb-head');
  head.append(el('span', 'lb-big-ic', ACTS[act].icon), el('h2', 'lb-title', ACTS[act].title), el('span', 'lb-count', `${scope === 'all' ? b.players : b.levelPlayers} taking part`));
  card.append(head);
  if (!list.length) card.append(el('p', 'lb-empty', `No one in Level ${data.level} has points here yet. Be the first!`));
  // the podium: the top three
  const pod = el('div', 'lb-podium');
  const medal = ['🥇', '🥈', '🥉'];
  [1, 0, 2].forEach((i) => {
    const x = list[i]; if (!x) return;
    const p = el('div', `lb-pod lb-pod-${i + 1}${x.me ? ' me' : ''}`);
    p.append(el('span', 'lb-medal', medal[Math.min(2, x.rank - 1)] ?? ''), el('b', 'lb-pod-name', x.me ? `${x.name} (you)` : x.name), el('span', 'lb-pod-lv', lv(x)), el('span', 'lb-pod-pts', `${x.points} pts`), el('span', 'lb-step', ord(x.rank)));
    pod.append(p);
  });
  if (list.length) card.append(pod);
  // 4th to 10th
  const ol = el('ol', 'lb-list');
  for (const x of list.slice(3)) {
    const li = el('li', x.me ? 'me' : '');
    li.append(el('span', 'lb-rank', ord(x.rank)), el('b', 'lb-name', x.me ? `${x.name} (you)` : x.name), el('span', 'lb-lv', lv(x)), el('span', 'lb-pts', `${x.points} pts`));
    ol.append(li);
  }
  if (ol.children.length) card.append(ol);
  // where am I
  const m = b.me;
  const meRank = m ? (scope === 'all' ? m.rankAll : m.rankLevel) : 0;
  const you = el('p', 'lb-you');
  if (m && meRank) {
    const ahead = meRank > 1 ? list.find((x) => x.rank === meRank - 1) : null;
    you.textContent = meRank === 1 ? `You are ${ord(1)} with ${m.points} points. MashaAllah! Stay humble and keep going.`
      : `You are ${ord(meRank)} with ${m.points} points${ahead && ahead.points > m.points ? `, ${ahead.points - m.points} behind ${ord(meRank - 1)}` : ''}.`;
  } else you.textContent = `You have no points in ${ACTS[act].title} yet. Finish it once to join the race!`;
  card.append(you);
  root.append(card);

}
