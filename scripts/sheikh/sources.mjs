// The Sheikh's further sources: candidates gathered word for word into scripts/sheikh/candidates/*.json
// (hadith.json: sunnah.com via hadith-api; ghazali.json: public-domain translations; quran.json: a public-domain
// English meaning; bidaya.json: Ibn Kathir, with draft English for review), merged into src/data/sheikh-sources.json.
// Nothing reaches the Sheikh until Ustadh Issah approves it: src/lib/sheikh-library.mjs only takes "approved" items.
//
//   node scripts/sheikh/sources.mjs                       merge new candidates (approvals already given are kept)
//   node scripts/sheikh/sources.mjs approve h-n13,g-anger  approve these ids (records today's date)
//   node scripts/sheikh/sources.mjs reject h-b1234         keep it out for good
//   node scripts/sheikh/sources.mjs list [pending|approved|rejected]
// A Bidaya passage has only a draft English ("draft_en"); approving it means the reviewer accepts that English,
// which then becomes its text.
import fs from 'node:fs';

const dir = new URL('./candidates/', import.meta.url);
const outUrl = new URL('../../src/data/sheikh-sources.json', import.meta.url);
const db = fs.existsSync(outUrl) ? JSON.parse(fs.readFileSync(outUrl, 'utf8')) : { note: '', sources: {}, items: [] };
db.note = 'Further quotations for the Sheikh. Only items with "status": "approved" are used (src/lib/sheikh-library.mjs). Made by scripts/sheikh/sources.mjs.';
const byId = new Map(db.items.map((x) => [x.id, x]));
const [cmd = 'merge', arg = ''] = process.argv.slice(2);
const today = new Date().toISOString().slice(0, 10);

if (cmd === 'merge') {
  let added = 0, updated = 0;
  for (const f of fs.existsSync(dir) ? fs.readdirSync(dir).filter((x) => x.endsWith('.json')) : []) {
    const j = JSON.parse(fs.readFileSync(new URL(f, dir), 'utf8'));
    const items = Array.isArray(j) ? j : j.items ?? j.hadith ?? j.passages ?? [];
    const src = f.replace(/\.json$/, '');
    db.sources[src] = { ...(j.sources ? { works: j.sources } : {}), ...(j.translation ? { translation: j.translation } : {}), file: `scripts/sheikh/candidates/${f}` };
    for (const c of items) {
      const it = { ...c, source: src, kind: c.kind ?? 'seerah' };
      if (!it.text && it.draft_en) it.text = '';                 // a draft is not a text until it is approved
      if (!it.ref && it.vol) it.ref = `Ibn Kathir, al-Bidaya wa'l-Nihaya ${it.vol}/${it.page}`;
      const old = byId.get(it.id);
      if (!old) { it.status = 'pending'; byId.set(it.id, it); added++; continue; }
      // the words of an approved item never change silently: a changed text goes back to review
      const changed = (old.text || old.draft_en) !== (it.text || it.draft_en);
      Object.assign(old, { ...it, status: changed ? 'pending' : old.status, approved: changed ? undefined : old.approved });
      if (changed) updated++;
    }
  }
  db.items = [...byId.values()];
  save();
  console.log(`${added} new, ${updated} changed (back to review); ${count('approved')} approved, ${count('pending')} pending, ${count('rejected')} rejected`);
} else if (cmd === 'approve' || cmd === 'reject') {
  for (const id of arg.split(',').filter(Boolean)) {
    const it = byId.get(id);
    if (!it) { console.error('unknown id: ' + id); process.exitCode = 1; continue; }
    it.status = cmd === 'approve' ? 'approved' : 'rejected';
    if (cmd === 'approve') { it.approved = `Ustadh Issah, ${today}`; if (!it.text && it.draft_en) it.text = it.draft_en; }
  }
  save();
  console.log(`${count('approved')} approved, ${count('pending')} pending, ${count('rejected')} rejected`);
} else if (cmd === 'list') {
  for (const it of db.items.filter((x) => !arg || x.status === arg)) console.log(`${it.status.padEnd(9)} ${it.id.padEnd(16)} ${it.ref} — ${(it.text || it.draft_en || '').slice(0, 90)}`);
} else {
  console.error('commands: merge | approve ids | reject ids | list [status]');
  process.exitCode = 1;
}

function count(s) { return db.items.filter((x) => x.status === s).length; }
function save() { fs.writeFileSync(outUrl, JSON.stringify(db, null, 1) + '\n'); }
