// The choice in each recitation section's settings: the Sheikh checks the words only, or the words and tajweed; and
// with tajweed, which of the rules the student has learnt he should judge strictly. Kept on this device.
//   const pick = tajweedPicker(container, { aud: 'l3' | 'l4' | 'adult', key, progKey })
//   pick.get() → { on, rules: [topic ids] }   pick.checks() → Set of rules to judge, or null (words only)
import { topicsFor, loadChoice, saveChoice, passed } from './rules.mjs';

const CSS = `
.tjk { border: 1px solid var(--line, #DDE3DF); border-radius: 14px; padding: 12px 14px; margin: 0; display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.tjk legend { padding: 0 6px; font-weight: 700; font-size: 14px; }
.tjk-seg { display: inline-flex; flex-wrap: wrap; gap: 4px; padding: 4px; border-radius: 12px; background: var(--accent-soft, #E6F2EC); align-self: flex-start; }
.tjk-seg button { border: 0; background: transparent; color: inherit; font: inherit; font-size: 14px; font-weight: 600; padding: 8px 14px; border-radius: 9px; cursor: pointer; min-height: 40px; }
.tjk-seg button[aria-pressed="true"] { background: var(--surface, #fff); box-shadow: 0 1px 3px rgba(0,0,0,.15); }
.tjk-rules { display: flex; flex-direction: column; gap: 8px; }
.tjk-rules[hidden] { display: none; }
.tjk-help { margin: 0; font-size: 13px; color: var(--muted, #4F5B56); }
.tjk-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 4px 14px; }
.tjk-list label { display: flex; align-items: flex-start; gap: 8px; font-size: 14px; line-height: 1.35; padding: 4px 0; cursor: pointer; }
.tjk-list input { width: 18px; height: 18px; margin: 1px 0 0; flex: none; }
.tjk-list label.off { opacity: .55; cursor: default; }
.tjk-list small { display: block; font-size: 12px; color: var(--muted, #4F5B56); }
.tjk-list .learnt { color: var(--accent, #0E6B4E); font-weight: 600; }
.tjk-btns { display: flex; flex-wrap: wrap; gap: 6px; }
.tjk-btns button { font: inherit; font-size: 13px; padding: 6px 12px; border-radius: 999px; border: 1px solid var(--line, #DDE3DF); background: transparent; color: inherit; cursor: pointer; min-height: 34px; }
`;
let styled = false;
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

export function tajweedPicker(box, { aud = 'adult', key, progKey }) {
  if (!styled) { const st = document.createElement('style'); st.textContent = CSS; document.head.append(st); styled = true; }
  const young = aud === 'l3';
  let choice = loadChoice(key, aud, progKey);
  const learnt = new Set(passed(progKey));
  const fs = el('fieldset', 'tjk');
  fs.append(el('legend', null, young ? 'How should the Sheikh listen?' : 'The Sheikh checks'));
  const seg = el('div', 'tjk-seg'); seg.setAttribute('role', 'group');
  const bWords = el('button', null, young ? 'My words' : 'Words only');
  const bTj = el('button', null, young ? 'My words and tajweed' : 'Words and tajweed');
  [bWords, bTj].forEach((b) => { b.type = 'button'; seg.append(b); });
  const rules = el('div', 'tjk-rules');
  rules.append(el('p', 'tjk-help', young
    ? 'Tick the tajweed rules you have learnt. The Sheikh will listen for them carefully and tell you when one needs fixing.'
    : 'Tick the rules you have learnt. The Sheikh judges these strictly: a rule broken counts as a mistake on that word.'));
  const list = el('div', 'tjk-list');
  const boxes = [];
  for (const t of topicsFor(aud)) {
    const lab = el('label', t.can ? '' : 'off');
    const cb = el('input'); cb.type = 'checkbox'; cb.value = t.id; cb.disabled = !t.can;
    cb.checked = t.can && choice.rules.includes(t.id);
    const txt = el('span'); txt.append(t.en);
    if (!t.can) txt.append(el('small', null, t.why));
    else if (learnt.has(t.id)) txt.append(el('small', 'learnt', young ? 'You learnt this ✓' : 'Passed in the Tajweed classroom ✓'));
    lab.append(cb, txt); list.append(lab);
    if (t.can) boxes.push(cb);
  }
  const btns = el('div', 'tjk-btns');
  const bAll = el('button', null, 'All the rules'), bLearnt = el('button', null, young ? 'Only what I learnt' : 'Only the ones I passed');
  [bAll, bLearnt].forEach((b) => { b.type = 'button'; btns.append(b); });
  if (!learnt.size) bLearnt.hidden = true;
  rules.append(list, btns,
    el('p', 'tjk-help', young
      ? 'The Sheikh is still learning to hear young voices. If he marks something you are sure is right, listen to the reciter and ask your teacher.'
      : 'Tajweed is heard on this device by a listening model that can sometimes be wrong, more often with children’s and higher voices. If a mark seems wrong, listen to the reciter and ask your teacher.'));
  fs.append(seg, rules);
  box.replaceChildren(fs);

  function sync() {
    bWords.setAttribute('aria-pressed', String(!choice.on));
    bTj.setAttribute('aria-pressed', String(choice.on));
    rules.hidden = !choice.on;
  }
  function save() { choice = { on: choice.on, rules: boxes.filter((b) => b.checked).map((b) => b.value) }; saveChoice(key, choice); }
  bWords.addEventListener('click', () => { choice.on = false; save(); sync(); });
  bTj.addEventListener('click', () => { choice.on = true; save(); sync(); });
  boxes.forEach((b) => b.addEventListener('change', save));
  bAll.addEventListener('click', () => { boxes.forEach((b) => (b.checked = true)); save(); });
  bLearnt.addEventListener('click', () => { boxes.forEach((b) => (b.checked = learnt.has(b.value))); save(); });
  sync();
  return {
    get: () => ({ ...choice }),
    checks: () => (choice.on && choice.rules.length ? new Set(choice.rules) : null),
  };
}
