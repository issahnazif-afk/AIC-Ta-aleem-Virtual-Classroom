// The leaderboards (docs/games-plan.md, section 4). Four boards:
//   Stage       the best time on one stage of my level's track        my class / my level
//   Game        the points in one game, on my level's track            my class / my level
//   My level    the points across every game, on my level's track      my class / my level
//   All levels  the points across every game, every level              the whole school: this week / all time
// Every level has the same number of stages and points, so the all-levels board is fair. Only ranked runs count: a
// student's own level track, played with the microphone. Dhikr and recitation are never ranked.
// Names: first name and initial with a level badge; a name hidden by a parent or teacher shows as "a Ta'aleem student".
// The top ten and your own row; the bottom of a board is never shown.
//   showBoard(host, { games: [{ id, title }], start: { game, stage, board }, fetch(query) → Promise<result>,
//                     setHidden(hide) → Promise<{ ok }>, onClose })
//   query: { board: 'stage' | 'game' | 'level' | 'all', game, stage, scope: 'class' | 'level', period: 'week' | 'all' }
//   result: { ok, rows: [{ rank, name, level, value, me }], mine: { rank, value } | null, total, unit: 'secs' | 'points',
//             label, hidden, error }
// `host` gets an overlay (inside a game) or the page itself (onClose omitted: a full page, e.g. from the home).
import { el, btn } from './kit.mjs';

const time = (s) => (s >= 99999 || s == null ? '–' : s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`);
const show = (v, unit) => (unit === 'secs' ? time(v) : `${Number(v || 0).toLocaleString('en')} pts`);
const BOARDS = [['stage', 'This stage'], ['game', 'This game'], ['level', 'My level'], ['all', 'All levels']];
const NOTE = {
  stage: 'The quickest time on this stage of your level’s track.',
  game: 'The points in this game, on your level’s track: the best run of each stage.',
  level: 'The points in every game, on your level’s track.',
  all: 'Every student in the school, each on their own level’s track. Every level has the same number of stages and points.',
};

export function showBoard(host, { games, start = {}, fetch, setHidden, onClose }) {
  const overlay = !!onClose;
  const box = el('div', overlay ? 'lb-board lb-over' : 'lb-board');
  if (overlay) { box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Leaderboards'); }
  const card = el('div', 'lb-card');
  const head = el('div', 'lb-head');
  head.append(el('h3', 'lb-h', 'Leaderboards'));
  if (overlay) { const x = btn('lb-close', '×', 'Close the leaderboard'); x.addEventListener('click', close); head.append(x); }
  const q = { board: start.board ?? (start.stage ? 'stage' : 'game'), game: start.game ?? games[0].id, stage: start.stage ?? 1, scope: 'level', period: 'week' };
  const tabs = el('div', 'lb-tabs'); tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', 'Which board');
  const opts = el('div', 'lb-opts');
  const body = el('div', 'lb-body'); body.setAttribute('aria-live', 'polite');
  const note = el('p', 'lb-note');
  const own = el('label', 'lb-own');
  const tick = document.createElement('input'); tick.type = 'checkbox'; tick.checked = true;
  own.append(tick, ' Show my name on the leaderboards');
  const ownNote = el('p', 'lb-note', 'A parent or teacher can switch this off. A hidden name shows as “a Ta’aleem student”. Only your own level’s track, played with the microphone, counts. Dhikr and recitation are never ranked.');
  card.append(head, tabs, opts, body, note, own, ownNote);
  box.append(card);
  host.append(box);

  for (const [id, text] of BOARDS) {
    const t = btn('lb-tab', text); t.setAttribute('role', 'tab'); t.dataset.id = id;
    t.addEventListener('click', () => { q.board = id; load(); });
    tabs.append(t);
  }
  const chips = (label, list, get, set) => {
    const g = el('div', 'lb-chips'); g.setAttribute('role', 'radiogroup'); g.setAttribute('aria-label', label);
    for (const [v, text] of list) {
      const c = btn('lb-chip', text); c.setAttribute('role', 'radio'); c.setAttribute('aria-checked', String(get() === v));
      c.addEventListener('click', () => { set(v); load(); });
      g.append(c);
    }
    return g;
  };
  function paintOpts() {
    opts.replaceChildren();
    if (q.board === 'stage' || q.board === 'game') if (games.length > 1) opts.append(chips('Game', games.map((x) => [x.id, x.title]), () => q.game, (v) => { q.game = v; }));
    if (q.board === 'stage') {
      const lab = el('label', 'lb-stage');
      const sel = document.createElement('select');
      for (let n = 1; n <= 10; n++) { const o = document.createElement('option'); o.value = n; o.textContent = `Stage ${n}`; if (n === q.stage) o.selected = true; sel.append(o); }
      sel.addEventListener('change', () => { q.stage = Number(sel.value); load(); });
      lab.append('Stage ', sel); opts.append(lab);
    }
    if (q.board === 'all') opts.append(chips('When', [['week', 'This week'], ['all', 'All time']], () => q.period, (v) => { q.period = v; }));
    else opts.append(chips('Who', [['class', 'My class'], ['level', 'My level']], () => q.scope, (v) => { q.scope = v; }));
  }
  tick.addEventListener('change', async () => {
    tick.disabled = true;
    const r = await setHidden?.(!tick.checked).catch(() => ({ ok: false }));
    tick.disabled = false;
    if (!r?.ok) tick.checked = !tick.checked;
    load();
  });
  function onKey(e) { if (e.key === 'Escape') close(); }
  if (overlay) document.addEventListener('keydown', onKey);
  function close() { document.removeEventListener('keydown', onKey); box.remove(); onClose?.(); }

  let run = 0;
  async function load() {
    tabs.querySelectorAll('.lb-tab').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.id === q.board)));
    paintOpts();
    note.textContent = NOTE[q.board];
    body.replaceChildren(el('p', 'lb-msg', 'Loading the leaderboard…'));
    const my = ++run;
    const r = await fetch({ ...q }).catch(() => ({ ok: false }));
    if (my !== run) return;
    if (!r?.ok) { body.replaceChildren(el('p', 'lb-msg', r?.error === 'unknown-action' ? 'The leaderboards are not switched on yet. Your teacher needs to update the class server (Apps Script).' : 'The leaderboard could not be loaded. Check the internet connection and try again.')); return; }
    if (typeof r.hidden === 'boolean') tick.checked = !r.hidden;
    if (!r.rows.length) { body.replaceChildren(el('p', 'lb-msg', 'Nobody is on this board yet. Finish a stage on your own level, with the microphone, to be the first!')); return; }
    const sub = el('p', 'lb-sub', `${r.label ?? ''}${r.label ? ' · ' : ''}${r.total} player${r.total === 1 ? '' : 's'}`);
    const ol = el('ol', 'lb-list');
    for (const x of r.rows) {
      const li = el('li', 'lb-row' + (x.me ? ' me' : '') + (x.rank <= 3 ? ` top top${x.rank}` : ''));
      const medal = el('span', 'lb-rank', String(x.rank)); medal.setAttribute('aria-label', `Place ${x.rank}`);
      const lv = el('span', 'lb-lv', x.level ? `L${x.level}` : ''); if (x.level) lv.setAttribute('aria-label', `Level ${x.level}`);
      li.append(medal, el('span', 'lb-name', x.me ? `${x.name} (you)` : x.name), lv, el('span', 'lb-time', show(x.value, r.unit)));
      ol.append(li);
    }
    body.replaceChildren(sub, ol);
    if (r.mine && r.mine.rank > 10) body.append(el('p', 'lb-mine', `You are number ${r.mine.rank}: ${show(r.mine.value, r.unit)}. Keep going!`));
    else if (!r.mine) body.append(el('p', 'lb-mine', 'Finish a stage on your own level, with the microphone, to join this board.'));
  }
  load();
  return { close };
}
