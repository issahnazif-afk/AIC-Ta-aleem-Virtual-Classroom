// The Guardians of Light home: the regions of Noor, the levels of each region, and what the child has earned.
// Rewards are shown with their reasons (spec/02): Noor Shards for finishing a reading or a level,
// a Mastery Seal when the Sheikh checks a reading and finds it well read. Nothing is ever taken away.
import { LEVELS, REGIONS, BADGES, unlocked } from './levels.mjs';

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

export function renderGuardiansHub(root, { level = 3, gl, onPlay }) {
  const done = gl.done ?? {};
  root.replaceChildren();
  const hero = el('div', 'gl-hero');
  const ar = el('p', 'gl-ar', 'حُرَّاسُ النُّور'); ar.lang = 'ar'; ar.dir = 'rtl';
  const counts = el('div', 'gl-counts');
  const count = (n, label, cls) => { const c = el('div', 'gl-count ' + cls); c.append(el('b', null, String(n)), el('span', null, label)); return c; };
  counts.append(count(gl.shards ?? 0, 'Noor Shards', 'shard'), count(gl.seals ?? 0, 'Mastery Seals', 'seal'));
  hero.append(ar, el('h1', 'gl-h', 'Guardians of Light'), el('p', 'gl-tag', 'Read. Remember. Grow. Restore the Light.'),
    el('p', 'gl-lead', 'The beacons of Noor have gone dim. Read to the Sheikh, and each reading brings light back to the valley.'), counts);
  root.append(hero);

  // the next level to play
  const mine = LEVELS.filter((L) => level > 2 || L.region === 1);   // Level 2 plays Region 1
  const next = mine.find((L) => !done[L.id] && unlocked(L.id, done));
  if (next) {
    const go = el('button', 'btn btn-primary big gl-go', `${done[LEVELS[0].id] ? 'Continue your journey' : 'Start your journey'}: ${next.title}`); go.type = 'button';
    go.addEventListener('click', () => onPlay(next.id));
    root.append(go);
  }

  const regions = level <= 2 ? REGIONS.slice(0, 1) : REGIONS;
  for (const R of regions) {
    const sec = el('section', 'gl-region' + (R.ready ? '' : ' later'));
    const head = el('div', 'gl-region-head');
    head.append(el('span', 'gl-region-n', `Region ${R.n}`), el('h2', 'gl-region-t', R.title), el('span', 'gl-region-theme', R.theme));
    sec.append(head, el('p', 'gl-region-text', R.text));
    if (R.ready) {
      const row = el('div', 'gl-levels');
      for (const L of LEVELS.filter((x) => x.region === R.n)) {
        const open = unlocked(L.id, done), fin = !!done[L.id];
        const b = el('button', 'gl-level' + (fin ? ' done' : open ? ' open' : ' locked')); b.type = 'button'; b.disabled = !open;
        b.append(el('span', 'gl-level-n', L.label), el('b', null, L.title), el('span', 'gl-level-b', L.blurb), el('span', 'gl-level-s', fin ? 'Finished · play again' : open ? 'Ready to play' : 'Opens after the level before'));
        b.addEventListener('click', () => onPlay(L.id));
        row.append(b);
      }
      sec.append(row);
    } else sec.append(el('p', 'gl-soon', 'Coming next, one region at a time.'));
    root.append(sec);
  }
  if (level <= 2) root.append(el('p', 'gl-note', 'Region 1 is the adventure for Level 2. More regions open in Level 3.'));

  // badges
  const bsec = el('section', 'gl-badges');
  bsec.append(el('h2', 'gl-region-t', 'Badges'));
  const brow = el('div', 'gl-badge-row');
  for (const B of BADGES.filter((b) => level > 2 || ['first-steps', 'listener', 'patience', 'beacon-1'].includes(b.id))) {
    const has = (gl.badges ?? []).includes(B.id);
    const c = el('div', 'gl-badge' + (has ? ' has' : ''));
    const img = el('img'); img.src = B.url; img.alt = ''; img.width = 72; img.height = 72;
    c.append(img, el('b', null, B.title), el('span', null, has ? 'Earned' : B.how));
    brow.append(c);
  }
  bsec.append(brow);
  root.append(bsec);

  // how rewards work (always visible, in plain words)
  const how = el('details', 'gl-how');
  how.append(el('summary', null, 'How rewards work'));
  const ul = el('ul');
  for (const t of [
    'Finish a reading with the Sheikh: 10 Noor Shards.',
    'The Sheikh finds your reading well read (70% or more right the first time): 1 Mastery Seal.',
    'Finish a level: 5 Noor Shards, and the next level opens.',
    'Mistakes never take anything away. The Sheikh gives you a tip to practise instead.',
    'Rewards are for your adventure in Noor. They do not measure your faith or your worth.',
  ]) ul.append(el('li', null, t));
  how.append(ul);
  root.append(how);
}
