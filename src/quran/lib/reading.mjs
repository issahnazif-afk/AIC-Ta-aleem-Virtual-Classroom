// The adult's reading record and khatm quest in this browser (ql-reading, ql-khatm), saved to their account with the
// rest of their settings (account.mjs MINE). The tracking rules and the plan are in src/lib/reading.mjs.
import * as R from '../../lib/reading.mjs';

const get = (k) => { try { return JSON.parse(localStorage.getItem('ql-' + k) || 'null'); } catch { return null; } };
const set = (k, v) => { try { v == null ? localStorage.removeItem('ql-' + k) : localStorage.setItem('ql-' + k, JSON.stringify(v)); } catch {} };

export const record = () => R.normalise(get('reading'));
export const quest = () => get('khatm');
export const activeQuest = () => { const q = quest(); return R.active(q) ? q : null; };
const changed = () => document.dispatchEvent(new CustomEvent('ql:reading'));

// count these ayahs as read ('s:a' or { s, a }); a quest under way counts them too
export function read(keys) {
  if (!keys?.length) return 0;
  const rd = record(), q = activeQuest();
  const fresh = R.markRead(rd, keys, { quest: q && !q.finished ? q : null });
  set('reading', rd);
  if (q) set('khatm', q);
  changed();
  return fresh;
}
export const readPages = (pages) => read(R.pageKeys(pages));
export function startQuest(months) { const q = R.newQuest(months, { previous: quest() }); set('khatm', q); changed(); return q; }
// stop the quest: it is kept in the history, and a new one can begin
export function endQuest() { const q = quest(); if (!R.active(q)) return; set('khatm', { history: R.newQuest(q.months, { previous: q }).history }); changed(); }

// a page or a passage counts as read after it has been in front of the reader for a while (and the tab is in view)
export function dwell(getKeys, ms) {
  let t = 0;
  const arm = () => { clearTimeout(t); t = setTimeout(fire, ms); };
  const fire = () => { if (document.visibilityState === 'visible') read(getKeys()); else arm(); };
  arm();
  return () => clearTimeout(t);
}
