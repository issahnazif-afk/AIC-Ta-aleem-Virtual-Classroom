// The maze leaderboard: the student's own class, each classmate once (first name and initial), ranked by the highest
// stage reached and then the quickest time on it. Recitation is never ranked.
//   showBoard(host, { mazes: [{ id, title }], start, fetch: (mazeId) => Promise<{ ok, rows, mine, total, className }> , onClose })
// `host` gets an overlay (inside a game) or the page itself (onClose omitted: a full page, e.g. from the home).
import { el, btn } from './kit.mjs';

const time = (s) => (s >= 99999 || s == null ? '–' : s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`);

export function showBoard(host, { mazes, start, fetch, onClose }) {
  const overlay = !!onClose;
  const box = el('div', overlay ? 'lb-board lb-over' : 'lb-board');
  if (overlay) { box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Class leaderboard'); }
  const card = el('div', 'lb-card');
  const head = el('div', 'lb-head');
  head.append(el('h3', 'lb-h', 'Class leaderboard'));
  if (overlay) { const x = btn('lb-close', '×', 'Close the leaderboard'); x.addEventListener('click', close); head.append(x); }
  const tabs = el('div', 'lb-tabs'); tabs.setAttribute('role', 'tablist');
  const body = el('div', 'lb-body'); body.setAttribute('aria-live', 'polite');
  card.append(head);
  if (mazes.length > 1) card.append(tabs);
  card.append(body, el('p', 'lb-note', 'Ranked by the highest stage reached, then the quickest time on it. Names show the first name and the first letter of the family name.'));
  box.append(card);
  host.append(box);

  let cur = start ?? mazes[0].id;
  for (const m of mazes) {
    const t = btn('lb-tab', m.title); t.setAttribute('role', 'tab'); t.dataset.id = m.id;
    t.addEventListener('click', () => { cur = m.id; load(); });
    tabs.append(t);
  }
  function onKey(e) { if (e.key === 'Escape') close(); }
  if (overlay) document.addEventListener('keydown', onKey);
  function close() { document.removeEventListener('keydown', onKey); box.remove(); onClose?.(); }

  async function load() {
    tabs.querySelectorAll('.lb-tab').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.id === cur)));
    body.replaceChildren(el('p', 'lb-msg', 'Loading the leaderboard…'));
    const my = cur;
    const r = await fetch(cur).catch(() => ({ ok: false }));
    if (my !== cur) return;
    if (!r?.ok) { body.replaceChildren(el('p', 'lb-msg', r?.error === 'unknown-action' ? 'The leaderboard is not switched on yet. Your teacher needs to update the class server (Apps Script).' : 'The leaderboard could not be loaded. Check the internet connection and try again.')); return; }
    if (!r.rows.length) { body.replaceChildren(el('p', 'lb-msg', 'Nobody in your class has finished a stage yet. Be the first!')); return; }
    const sub = el('p', 'lb-sub', `${r.className}${r.demo ? '' : ''} · ${r.total} player${r.total === 1 ? '' : 's'}`);
    const ol = el('ol', 'lb-list');
    for (const x of r.rows) {
      const li = el('li', 'lb-row' + (x.me ? ' me' : '') + (x.rank <= 3 ? ` top top${x.rank}` : ''));
      const medal = el('span', 'lb-rank', String(x.rank)); medal.setAttribute('aria-label', `Place ${x.rank}`);
      li.append(medal, el('span', 'lb-name', x.me ? `${x.name} (you)` : x.name), el('span', 'lb-stage', `Stage ${x.stage}`), el('span', 'lb-time', time(x.secs)));
      ol.append(li);
    }
    body.replaceChildren(sub, ol);
    if (r.mine && r.mine.rank > 10) body.append(el('p', 'lb-mine', `You are number ${r.mine.rank}: stage ${r.mine.stage}, ${time(r.mine.secs)}. Keep going!`));
    else if (!r.mine) body.append(el('p', 'lb-mine', 'Finish a stage to join the leaderboard.'));
  }
  load();
  return { close };
}
