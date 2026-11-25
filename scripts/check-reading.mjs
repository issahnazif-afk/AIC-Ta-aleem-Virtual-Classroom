// Tests for the reading tracker and the khatm quest (src/lib/reading.mjs). node scripts/check-reading.mjs
import * as R from '../src/lib/reading.mjs';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };

// ayah numbers and pages
ok(R.idx(1, 1) === 0 && R.idx(114, 6) === 6235 && R.idx(2, 1) === 7, 'idx');
ok(R.idx(1, 8) === -1 && R.idx(115, 1) === -1, 'idx out of range');
for (const g of [0, 6, 7, 293, 3000, 6235]) { const k = R.keyOf(g); ok(R.idx(k.s, k.a) === g, `keyOf ${g}`); }
ok(R.pageOf(0) === 1 && R.pageOf(6235) === 604 && R.pageOf(R.idx(2, 1)) === 2, 'pageOf');
ok(R.juzOf(R.idx(2, 142)) === 2 && R.juzOf(R.idx(78, 1)) === 30, 'juzOf');
let sum = 0; for (let p = 1; p <= 604; p++) { const [a, b] = R.pageRange(p); ok(b > a, `page ${p} has ayahs`); sum += b - a; }
ok(sum === 6236, 'pages cover every ayah once');

// bitsets survive packing
const bits = R.unpack(''); for (const g of [0, 5, 7, 8, 100, 6235]) bits[g >> 3] |= 1 << (g & 7);
const back = R.unpack(R.pack(bits)); ok(back.every((x, i) => x === bits[i]), 'pack/unpack');
ok(R.pack(R.unpack('')).length < 1100, 'packed size');

// marking: a re-read on the same day is not counted twice; surahs complete; pages complete
const rd = R.emptyRecord(), day1 = new Date(2026, 10, 25, 9), day2 = new Date(2026, 10, 26, 9);
ok(R.markRead(rd, ['1:1', '1:2', '1:3', '1:4', '1:5', '1:6', '1:7'], { now: day1 }) === 7, 'mark new');
ok(R.markRead(rd, ['1:1'], { now: day1 }) === 0, 'same day re-read');
ok(R.markRead(rd, ['1:1'], { now: day2 }) === 1, 'next day counts');
let s = R.summary(rd, { now: day2 });
ok(s.complete.length === 1 && s.complete[0].s === 1 && s.pages === 1 && s.read === 7 && s.streak === 2, `summary ${JSON.stringify({ c: s.complete.length, p: s.pages, r: s.read, st: s.streak })}`);
R.markRead(rd, [{ s: 2, a: 1 }], { now: day2 });
s = R.summary(rd, { now: day2 });
ok(s.inProgress.length === 1 && s.inProgress[0].s === 2, 'in progress');
ok(rd.last.s === 2 && rd.last.a === 1, 'last read');

// the quest: one month from 1 Dec, 31 days
const q = R.newQuest(1, { now: new Date(2026, 11, 1, 8) });
ok(q.end === '2027-01-01', `end ${q.end}`);
let p = R.questPlan(q, { now: new Date(2026, 11, 1, 20) });
ok(R.questPlan(q, { now: new Date(2026, 11, 1, 20) }).needToday === 19, 'day 1 need');
ok(p.D === 31 && p.dayNo === 1 && p.todayFrom === 1 && p.todayTo === 19 && p.done === 0 && p.next === 1, `day 1 plan ${JSON.stringify(p)}`);
ok(p.weekPlan === 136 && p.weeks === 5, `week plan ${p.weekPlan} ${p.weeks}`);
// reading pages 1 to 20 on day 1: ahead by one page, next page 21
const r2 = R.emptyRecord();
R.markRead(r2, R.pageKeys(Array.from({ length: 20 }, (_, i) => i + 1)), { now: new Date(2026, 11, 1, 21), quest: q });
p = R.questPlan(q, { now: new Date(2026, 11, 1, 22) });
ok(p.needToday === 0, `planned pages done, nothing more needed (${p.needToday})`);
ok(p.done === 20 && p.doneToday === 20 && p.behind === -1 && p.next === 21, `after 20 pages ${JSON.stringify({ d: p.done, t: p.doneToday, b: p.behind, n: p.next })}`);
// nothing on days 2 and 3: behind on day 3, and today's need goes up
p = R.questPlan(q, { now: new Date(2026, 11, 3, 10) });
ok(p.dayNo === 3 && p.behind > 30 && p.needToday > 19, `day 3 behind ${p.behind} need ${p.needToday}`);
// every page: finished
R.markRead(r2, R.pageKeys(Array.from({ length: 604 }, (_, i) => i + 1)), { now: new Date(2026, 11, 20), quest: q });
ok(q.finished === '2026-12-20' && R.questPlan(q, { now: new Date(2026, 11, 20) }).done === 604, 'finished');
// a year: about 1.65 pages a day, 52 or 53 weeks
const y = R.newQuest(12, { now: new Date(2026, 0, 1) }); const py = R.questPlan(y, { now: new Date(2026, 0, 1) });
ok(py.D === 365 && Math.abs(py.perDay - 604 / 365) < 1e-9 && R.questWeeks(y).length === 53, `year ${py.D} ${R.questWeeks(y).length}`);
ok(R.questWeeks(y).at(-1).planTo === 604, 'the weeks end at page 604');
for (const m of R.QUEST_MONTHS) { const qq = R.newQuest(m, { now: new Date(2026, 4, 31) }); const ws = R.questWeeks(qq); ok(ws[0].planFrom === 1 && ws.at(-1).planTo === 604, `months ${m}: weeks cover 1 to 604`); }
ok(R.addMonths('2026-01-31', 1) === '2026-02-28', 'month end');

if (fails.length) { console.error('✗ reading:\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('✓ reading tracker and khatm quest');
