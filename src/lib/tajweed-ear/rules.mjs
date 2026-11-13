// Checking with tajweed: the student's choice (words only, or words and tajweed), the rules they have learnt and
// want the Sheikh to judge strictly, and what he says about each mistake, for each age.
// The rules are the Tajweed classroom's topics (src/lib/tajweed/course.mjs), so a topic passed there can be chosen here.
import { course } from '../tajweed/course.mjs';

// the topics the Sheikh's tajweed ear can hear (judge.mjs); the others are shown, greyed, with the reason
export const CHECKABLE = ['madd', 'madd_hamz', 'madd_stop', 'ghunnah', 'mim', 'idgham', 'ikhfa', 'iqlab', 'qalqalah'];
const WHY_NOT = {
  intro: null, makharij: 'Listen to your teacher for this one',
  heavy: 'Not yet: the Sheikh cannot hear heavy and light letters reliably',
  lam: 'Not yet: the sun and moon letters are checked as words',
  izhar: 'Not yet: saying the nūn clearly is checked as words',
  wasl: 'Not yet', ra: 'Not yet: the Sheikh cannot hear a heavy or light rāʾ reliably',
  waqf: 'Not yet', mithlayn: 'Not yet', sakt: 'Not yet',
};

export function topicsFor(aud) {
  return course(aud).filter((t) => !t.intro || t.id === 'makharij').map((t) => ({
    id: t.id, en: t.en, ar: t.ar, can: CHECKABLE.includes(t.id), why: CHECKABLE.includes(t.id) ? '' : WHY_NOT[t.id] ?? 'Not yet',
  })).sort((a, b) => b.can - a.can);   // the ones he can hear first, in the course's order
}

// { on: false, rules: [...] } kept on this device. With nothing saved, the rules ticked are the topics passed in the
// Tajweed classroom (or all the checkable ones, when none is passed yet).
export function loadChoice(key, aud, progKey) {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(key) || 'null'); } catch {}
  const can = topicsFor(aud).filter((t) => t.can).map((t) => t.id);
  if (saved && Array.isArray(saved.rules)) return { on: !!saved.on, rules: saved.rules.filter((r) => can.includes(r)) };
  return { on: false, rules: passed(progKey).filter((r) => can.includes(r)).length ? passed(progKey).filter((r) => can.includes(r)) : can };
}
export function saveChoice(key, choice) { try { localStorage.setItem(key, JSON.stringify(choice)); } catch {} }
export function passed(progKey) {
  try { const p = JSON.parse(localStorage.getItem(progKey) || '{}'); return Object.keys(p.done ?? {}).filter((k) => p.done[k]); } catch { return []; }
}
export function describeChoice(choice, aud) {
  if (!choice.on || !choice.rules.length) return 'words only';
  const n = choice.rules.length, all = topicsFor(aud).filter((t) => t.can).length;
  return n === all ? 'words and tajweed' : `words and ${n} tajweed rule${n === 1 ? '' : 's'}`;
}

// ── what the Sheikh says ─────────────────────────────────────────
const MADD_NAME = {
  NormalMaddRule: ['the stretch', 'natural madd'], MonfaselMaddRule: ['the long stretch before a hamzah', 'madd munfaṣil'],
  MottaselMaddRule: ['the long stretch before a hamzah', 'madd muttaṣil'], MottaselMaddPauseRule: ['the long stretch before a hamzah', 'madd muttaṣil'],
  LazemMaddRule: ['the extra-long stretch', 'madd lāzim'], AaredMaddRule: ['the stretch where you stop', 'madd ʿāriḍ'],
  LeenMaddRule: ['the soft stretch', 'madd līn'], BadalMadd: ['the stretch', 'madd badal'], LeenHamzaMadd: ['the soft stretch', 'madd līn'],
};
const counts = (n) => (n === 1 ? '1 count' : `${n} counts`);
// remark (from judge.mjs) → one short sentence. young: Level 3 wording
export function remarkText(r, young = false) {
  const name = MADD_NAME[r.rule]?.[young ? 0 : 1] ?? '';
  if (r.kind === 'madd') {
    if (r.what === 'uneven') return young ? 'Keep your long stretches the same length each time.' : `${cap(name)}: keep the same length every time (you held ${r.lens.join(', ')}).`;
    if (r.what === 'missing') return young ? `Don’t forget ${name} here.` : `${cap(name)} dropped: the vowel must be lengthened.`;
    if (r.what === 'long') return young ? `${cap(name)} was too long: about ${counts(r.want)}.` : `${cap(name)} too long: ${counts(r.heard)} instead of ${counts(r.want)}.`;
    return young ? `Stretch ${name} longer: about ${counts(r.want)}.` : `${cap(name)} too short: ${counts(r.heard)} instead of ${counts(r.want)}.`;
  }
  if (r.check === 'qalqalah') return young ? `Let the ${r.letter} bounce (qalqalah).` : `Qalqalah missing on ${r.letter}: let it bounce.`;
  if (r.check === 'iqlab') return young ? 'The nūn turns into a hidden mīm before bāʾ (iqlāb).' : 'Iqlāb: the nūn becomes a hidden mīm with ghunnah before bāʾ.';
  if (r.check === 'ikhfa') return r.what === 'izhar'
    ? (young ? 'Hide the nūn with the nose sound (ikhfāʾ); it was said clearly.' : 'Ikhfāʾ: the nūn was pronounced clearly; hide it with ghunnah.')
    : (young ? 'Hold the hidden nose sound a little longer (ikhfāʾ).' : 'Ikhfāʾ: the ghunnah is too short.');
  if (r.check === 'idgham') return r.what === 'not_merged'
    ? (young ? `Merge the nūn into the ${r.letter} (idghām).` : `Idghām: the nūn was pronounced; merge it into ${r.letter}.`)
    : (young ? 'Hold the nose sound as you merge (idghām with ghunnah).' : 'Idghām with ghunnah: the ghunnah is missing.');
  if (r.check === 'mim') return young ? 'Hold the nose sound on the mīm for 2 counts.' : 'Mīm with ghunnah: hold the nasal sound for 2 counts.';
  return young ? 'Hold the nose sound (ghunnah) for 2 counts.' : 'Ghunnah too short: hold the nasal sound for 2 counts.';
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export function topicName(check, aud) { return course(aud).find((t) => t.id === check)?.en ?? check; }
