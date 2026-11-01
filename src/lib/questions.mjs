// The question bank for Match the Deen, Journey to Knowledge, Salah Master, Akhlaq Heroes and the daily
// character missions. Teachers keep it in the "Question bank" tab of the admin sheet; only rows a teacher has
// approved are sent. In demo mode (no class log connected) the starter set is used, marked as a preview.
import STARTER from '../data/question-bank.json';
import { fetchQuestions } from './classlog.mjs';
import { store } from './client.mjs';

let bank = null, preview = false;

// "1-4" → [1,2,3,4]; "3" → [3]; "2,4" → [2,4]
export function levelsOf(text) {
  const out = new Set();
  for (const part of String(text || '1-4').split(',')) {
    const [a, b] = part.split('-').map((x) => parseInt(x, 10));
    if (!a) continue;
    for (let n = a; n <= (b || a); n++) out.add(n);
  }
  return out.size ? out : new Set([1, 2, 3, 4]);
}

export async function loadBank(token) {
  const r = await fetchQuestions({ token });
  if (r.demo) { bank = STARTER; preview = true; }
  else if (r.ok) { bank = r.questions; preview = false; store.set('bank', bank); }
  else { bank = store.get('bank', []); preview = false; }   // offline: the last list this computer received
  bank = bank.map((q) => ({ ...q, lv: levelsOf(q.levels) }));
  return bank;
}
export const isPreview = () => preview;
export function questions({ game, kind, topic, level }) {
  return (bank ?? []).filter((q) => q.game === game && (!kind || q.kind === kind) && (!topic || q.topic === topic) && (!level || q.lv.has(level)));
}
export function topics(game, level, kind) {
  const by = new Map();
  for (const q of questions({ game, kind, level })) by.set(q.topic, (by.get(q.topic) ?? 0) + 1);
  return [...by].map(([topic, n]) => ({ topic, n }));
}
