// The expected sounds of every ayah, for the Sheikh's tajweed ear (src/lib/tajweed-ear/): copied from
// sources/tajweed-ref/ (made by scripts/quran/tajweed_ref.py with the quran_transcript phonetizer, Hafs) into
// public/quran/data/tajweed-ref/. Without them the site still builds; tajweed checking then says it is unavailable.
import fs from 'node:fs';
import path from 'node:path';
const SRC = 'sources/tajweed-ref', OUT = 'public/quran/data/tajweed-ref';
try {
  fs.mkdirSync(OUT, { recursive: true });
  const files = fs.readdirSync(SRC).filter((f) => /^\d{3}\.json$/.test(f));
  for (const f of files) fs.copyFileSync(path.join(SRC, f), path.join(OUT, f));
  console.log(`✓ Tajweed ear: expected sounds of ${files.length} surahs`);
} catch (e) { console.log('Tajweed ear: no expected sounds copied (' + e.message + ')'); }
