// Keeping track of a person's Qur'an reading (children and adults), and the adults' khatm quest: finish the whole
// Qur'an in 1, 2, 3, 6 or 12 months with a daily and weekly page plan. Node-safe (scripts/check-reading.mjs tests it).
//
// A reading record  { v: 1, bits, today: { d, bits }, days: { 'YYYY-MM-DD': ayahs }, last: { s, a, at } }
//   bits    every ayah ever read, a bitset over the 6236 ayahs in mushaf order (base64), so surahs show as complete or
//           in progress; today: the ayahs read today (so a re-read on the same day is not counted twice);
//           days: how many different ayahs were read each day (the last 400 days)
// A quest           { start, months, end, bits, done: { 'YYYY-MM-DD': pages }, finished, history: [...] }
//   bits    the ayahs read since the quest began; a page counts once all the ayahs that start on it are read
//   done    pages completed on each day
// Children keep the record in their progress (progress.reading, saved to the class log); adults in ql-reading and
// ql-khatm, saved to their account (src/quran/lib/account.mjs). Where reading is counted: a mushaf page open for 30 s,
// an ayah of the surah page in view for 4 s, an ayah heard to its end in Listen, every ayah recited to the Sheikh
// (Recite, Learn with the Sheikh, the Hifz test, the children's recitation), and pages an adult logs by hand (a paper
// mushaf).
import { AYAHS, PAGE_START, JUZ_START, TOTAL_AYAHS, TOTAL_PAGES } from './quran-index.mjs';
export { TOTAL_AYAHS, TOTAL_PAGES };

// ── ayah numbers ──
const SURAH_START = AYAHS.reduce((acc, n, i) => { acc.push(i ? acc[i - 1] + AYAHS[i - 1] : 0); return acc; }, []);
export const idx = (s, a) => (s >= 1 && s <= 114 && a >= 1 && a <= AYAHS[s - 1] ? SURAH_START[s - 1] + a - 1 : -1);
export function keyOf(g) {
  let lo = 0, hi = 113;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (SURAH_START[m] <= g) lo = m; else hi = m - 1; }
  return { s: lo + 1, a: g - SURAH_START[lo] + 1 };
}
const findStart = (starts, g) => { let lo = 0, hi = starts.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (starts[m] <= g) lo = m; else hi = m - 1; } return lo; };
export const pageOf = (g) => findStart(PAGE_START, g) + 1;
export const juzOf = (g) => findStart(JUZ_START, g) + 1;
export const pageRange = (p) => [PAGE_START[p - 1], p < TOTAL_PAGES ? PAGE_START[p] : TOTAL_AYAHS];   // [first, after last)
export const pageFirst = (p) => keyOf(PAGE_START[p - 1]);
export const surahAyahs = (s) => AYAHS[s - 1];
export const surahRange = (s) => [SURAH_START[s - 1], SURAH_START[s - 1] + AYAHS[s - 1]];

// ── bitsets as base64 (written by hand so it runs the same in browsers and Node) ──
const BYTES = Math.ceil(TOTAL_AYAHS / 8);
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
export function unpack(str) {
  const out = new Uint8Array(BYTES);
  if (!str) return out;
  let bits = 0, val = 0, j = 0;
  for (const c of String(str)) { const v = B64.indexOf(c); if (v < 0) continue; val = (val << 6) | v; bits += 6; if (bits >= 8) { bits -= 8; if (j < BYTES) out[j++] = (val >> bits) & 255; } }
  return out;
}
export function pack(arr) {
  let s = '', bits = 0, val = 0;
  for (const b of arr) { val = ((val << 8) | b) & 0xffffff; bits += 8; while (bits >= 6) { bits -= 6; s += B64[(val >> bits) & 63]; } }
  if (bits) s += B64[(val << (6 - bits)) & 63];
  return s;
}
const has = (arr, g) => (arr[g >> 3] >> (g & 7)) & 1;
const put = (arr, g) => { arr[g >> 3] |= 1 << (g & 7); };
export const countIn = (arr, from, to) => { let n = 0; for (let g = from; g < to; g++) n += has(arr, g); return n; };

// ── dates (the person's own day) ──
const pad2 = (n) => String(n).padStart(2, '0');
export const dayOf = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const parseDay = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (s, n) => { const d = parseDay(s); d.setDate(d.getDate() + n); return dayOf(d); };
export const daysBetween = (a, b) => Math.round((parseDay(b) - parseDay(a)) / 864e5);
export function addMonths(s, m) { const d = parseDay(s), day = d.getDate(); d.setDate(1); d.setMonth(d.getMonth() + m); d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())); return dayOf(d); }

// ── the reading record ──
export const emptyRecord = () => ({ v: 1, bits: '', today: { d: '', bits: '' }, days: {}, last: null });
export function normalise(rd) { return rd && rd.v === 1 ? { ...emptyRecord(), ...rd, today: rd.today ?? { d: '', bits: '' }, days: rd.days ?? {} } : emptyRecord(); }

// mark ayahs as read: keys are 's:a' strings or { s, a }; returns the number of ayahs new today
export function markRead(rd, keys, { now = new Date(), quest = null, keepDays = 400 } = {}) {
  const day = dayOf(now);
  const all = unpack(rd.bits);
  const today = unpack(rd.today?.d === day ? rd.today.bits : '');
  const qbits = quest && !quest.finished ? unpack(quest.bits) : null;
  const before = qbits ? completedPages(qbits) : null;
  let fresh = 0, lastG = -1;
  for (const k of keys) {
    const [s, a] = typeof k === 'string' ? k.split(':').map(Number) : [k.s, k.a];
    const g = idx(s, a); if (g < 0) continue;
    put(all, g);
    if (!has(today, g)) { put(today, g); fresh++; }
    if (qbits) put(qbits, g);
    if (g > lastG) lastG = g;
  }
  rd.bits = pack(all);
  rd.today = { d: day, bits: pack(today) };
  if (fresh) {
    rd.days[day] = (rd.days[day] ?? 0) + fresh;
    const ks = Object.keys(rd.days).sort(); if (ks.length > keepDays) for (const k of ks.slice(0, ks.length - keepDays)) delete rd.days[k];
  }
  if (lastG >= 0) rd.last = { ...keyOf(lastG), at: now.getTime() };
  if (qbits) {
    quest.bits = pack(qbits);
    const gained = completedPages(qbits) - before;
    if (gained > 0) quest.done[day] = (quest.done[day] ?? 0) + gained;
    if (completedPages(qbits) >= TOTAL_PAGES && !quest.finished) quest.finished = day;
  }
  return fresh;
}
// every ayah that starts on these mushaf pages
export const pageKeys = (pages) => pages.flatMap((p) => { const [a, b] = pageRange(p); return Array.from({ length: b - a }, (_, i) => keyOf(a + i)); });

// what the record says: totals, surahs complete and in progress, the last days
export function summary(rd, { now = new Date(), days = 14 } = {}) {
  const all = unpack(rd.bits);
  const surahs = AYAHS.map((n, i) => { const [a, b] = surahRange(i + 1); return { s: i + 1, read: countIn(all, a, b), total: n }; });
  const read = surahs.reduce((x, y) => x + y.read, 0);
  let pages = 0; for (let p = 1; p <= TOTAL_PAGES; p++) { const [a, b] = pageRange(p); if (countIn(all, a, b) === b - a) pages++; }
  const recent = Array.from({ length: days }, (_, i) => { const d = addDays(dayOf(now), i - days + 1); return { d, n: rd.days[d] ?? 0 }; });
  // days in a row with some reading, up to today (or yesterday, when today has none yet)
  let streak = 0; for (let i = rd.days[dayOf(now)] ? 0 : 1; rd.days[addDays(dayOf(now), -i)] && streak < 4000; i++) streak++;
  return { read, total: TOTAL_AYAHS, pages, complete: surahs.filter((x) => x.read === x.total), inProgress: surahs.filter((x) => x.read && x.read < x.total), surahs, recent, today: rd.days[dayOf(now)] ?? 0, streak, last: rd.last };
}

// ── the khatm quest ── (a stored quest without a start is only the history of past quests)
export const active = (q) => !!(q && q.start);
export const QUEST_MONTHS = [1, 2, 3, 6, 12];
export function newQuest(months, { now = new Date(), previous = null } = {}) {
  const start = dayOf(now);
  const history = previous ? [...(previous.history ?? []), ...(previous.start ? [{ start: previous.start, months: previous.months, end: previous.end, finished: previous.finished ?? null, pages: completedPages(unpack(previous.bits)) }] : [])].slice(-20) : [];
  return { start, months, end: addMonths(start, months), bits: '', done: {}, finished: null, history };
}
export function completedPages(bits) {
  let n = 0;
  for (let p = 1; p <= TOTAL_PAGES; p++) { const [a, b] = pageRange(p); let ok = true; for (let g = a; g < b; g++) if (!has(bits, g)) { ok = false; break; } if (ok) n++; }
  return n;
}
// the plan: the whole Qur'an spread evenly over the days from start to end (the end day is not a reading day)
export function questPlan(q, { now = new Date() } = {}) {
  const today = dayOf(now);
  const D = Math.max(1, daysBetween(q.start, q.end));
  const dayNo = Math.min(D, Math.max(1, daysBetween(q.start, today) + 1));   // 1 on the first day
  const planBy = (k) => Math.round((TOTAL_PAGES * Math.max(0, Math.min(k, D))) / D);   // pages planned by the end of day k
  const bits = unpack(q.bits);
  const done = completedPages(bits);
  const doneToday = q.done[today] ?? 0;
  const left = TOTAL_PAGES - done;
  const daysLeft = Math.max(1, D - dayNo + 1);   // today included
  // today, as planned at the start (pages a to b), and what keeps you on track now
  const todayFrom = planBy(dayNo - 1) + 1, todayTo = planBy(dayNo);
  const expected = planBy(dayNo);                       // where the plan says you should be by tonight
  const behind = expected - done;                        // > 0: behind; < 0: ahead
  const needToday = Math.max(0, expected - done);                                     // what puts you back on the plan by tonight
  const catchUp = Math.ceil((left + doneToday) / daysLeft);                           // or: the even pace from today to the end
  const perDay = TOTAL_PAGES / D;
  // weeks of 7 days from the start
  const weekNo = Math.floor((dayNo - 1) / 7) + 1, weeks = Math.ceil(D / 7);
  const wStart = addDays(q.start, (weekNo - 1) * 7);
  const weekPlan = planBy(Math.min(D, weekNo * 7)) - planBy((weekNo - 1) * 7);
  let weekDone = 0; for (let i = 0; i < 7; i++) weekDone += q.done[addDays(wStart, i)] ?? 0;
  // the next page to read: the first one not yet complete
  let next = 1; while (next <= TOTAL_PAGES) { const [a, b] = pageRange(next); let ok = true; for (let g = a; g < b; g++) if (!has(bits, g)) { ok = false; break; } if (!ok) break; next++; }
  const over = daysBetween(q.end, today) >= 0 && !q.finished;
  return { D, dayNo, perDay, perWeek: perDay * 7, todayFrom, todayTo: Math.max(todayFrom, todayTo), expected, done, doneToday, left, behind, needToday, catchUp, daysLeft,
    weekNo, weeks, wStart, wEnd: addDays(wStart, 6), weekPlan, weekDone, next: next <= TOTAL_PAGES ? next : null, over, finished: q.finished,
    pct: Math.round((100 * done) / TOTAL_PAGES) };
}
// the plan as weeks: [{ n, from, to, planFrom, planTo, done }] for the week list
export function questWeeks(q, { now = new Date() } = {}) {
  const D = Math.max(1, daysBetween(q.start, q.end));
  const planBy = (k) => Math.round((TOTAL_PAGES * Math.max(0, Math.min(k, D))) / D);
  const weeks = [];
  for (let w = 1; (w - 1) * 7 < D; w++) {
    const from = addDays(q.start, (w - 1) * 7), to = addDays(q.start, Math.min(D, w * 7) - 1);
    let done = 0; for (let i = 0; i < 7; i++) done += q.done[addDays(from, i)] ?? 0;
    weeks.push({ n: w, from, to, planFrom: planBy((w - 1) * 7) + 1, planTo: planBy(Math.min(D, w * 7)), done, now: dayOf(now) >= from && dayOf(now) <= to, past: dayOf(now) > to });
  }
  return weeks;
}
export const juzOfPage = (p) => juzOf(PAGE_START[p - 1]);
