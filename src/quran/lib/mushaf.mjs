// Builds a mushaf page in the browser from the QUL line layout (604 pages × 15 lines),
// so every line breaks exactly where it does in the printed Madani mushaf.
import { tokenize, qpc } from '../../lib/recite.mjs';

const AR = '٠١٢٣٤٥٦٧٨٩';
export const arNum = (n) => String(n).replace(/\d/g, (d) => AR[d]);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

// opts: { getJson, pad, items: Map("s:a" → item), wordSpan(word) → span, markerSpan(item, ayah) → span,
//         script: 'plain' | 'tajweed', riwayah: 'hafs' | 'warsh' | … }
// Hafs pages follow the printed lines exactly. Other riwayat have their own wording, so their ayahs
// are shown as flowing text on the same pages, in the riwayah's own KFGQPC font.
// Items are the ayahs being recited (key "s:0" is a Bismillah). Everything else on the page is shown as "out".
export async function buildPaper(p, opts) {
  const { getJson, pad, items = new Map(), wordSpan, markerSpan, script = 'plain', riwayah = 'hafs' } = opts;
  const layout = await getJson(`layout/${pad(p)}.json`);
  const nums = new Set();
  for (const l of layout.lines) { if (l.t === 'a') for (const w of l.w) nums.add(w[0]); else nums.add(l.s); }
  const suras = new Map();
  await Promise.all([...nums].map(async (s) => suras.set(s, await getJson(`surah/${pad(s)}.json`))));
  // tajweed colours, one HTML snippet per word (built from Quran Foundation data)
  const tj = new Map();
  if (script === 'tajweed') {
    await Promise.all([...nums].map(async (s) => { try { tj.set(s, await getJson(`tajweed/${pad(s)}.json`)); } catch {} }));
  }
  const paint = (span, s, a, wi) => {
    span.dataset.k = `${s}:${a}`;
    const h = tj.get(s)?.[a]?.[wi];
    if (h) { span.innerHTML = h; span.classList.add('tj'); }
    return span;
  };
  const toks = new Map();
  const outWords = (s, a) => {
    const k = `${s}:${a}`;
    if (!toks.has(k)) toks.set(k, tokenize(suras.get(s).ayahs[a - 1].ar, k));
    return toks.get(k);
  };

  if (riwayah !== 'hafs') return buildFlowPaper(p, layout, suras, opts);
  const paper = el('article', 'paper mp');
  paper.lang = 'ar'; paper.dir = 'rtl';
  paper.setAttribute('aria-label', `Mushaf page ${p}`);
  const onPage = [...new Set(layout.lines.filter((l) => l.t === 'a').flatMap((l) => l.w.map((w) => w[0])))];
  const head = el('div', 'mp-head');
  head.append(el('span', null, onPage.map((s) => suras.get(s).ar).join(' · ')), el('span', null, `الجزء ${arNum(layout.juz)}`));
  const box = el('div', 'mp-lines');

  for (const l of layout.lines) {
    if (l.t === 's') { box.append(el('div', 'mp-line mp-banner', `سورة ${suras.get(l.s).ar}`)); continue; }
    if (l.t === 'b') {
      const line = el('div', 'mp-line mp-bism c');
      const bItem = items.get(`${l.s}:0`);
      if (bItem && wordSpan) bItem.words.forEach((w, i) => { if (i) line.append(' '); line.append(wordSpan(w)); });
      else line.append(el('span', items.size && !items.has(`${l.s}:1`) ? 'out' : '', qpc(suras.get(l.s).bismillah ?? '')));
      box.append(line);
      continue;
    }
    const line = el('div', 'mp-line' + (l.c ? ' c' : ''));
    l.w.forEach(([s, a, wi], k) => {
      if (k) line.append(' ');
      const it = items.get(`${s}:${a}`);
      if (wi === -1) {
        const mk = it && markerSpan ? markerSpan(it, a) : el('span', 'mk' + (items.size ? ' out' : ''), `﴿${arNum(a)}﴾`);
        mk.dataset.k = `${s}:${a}`;
        line.append(mk);
      }
      else if (it && wordSpan) line.append(paint(wordSpan(it.words[wi]), s, a, wi));
      else line.append(paint(el('span', items.size ? 'out' : '', outWords(s, a)[wi].display), s, a, wi));
    });
    box.append(line);
  }
  paper.append(head, box, el('div', 'mp-folio', arNum(p)));
  return paper;
}

async function buildFlowPaper(p, layout, suras, { getJson, pad, items = new Map(), wordSpan, markerSpan, riwayah }) {
  const rw = new Map();
  await Promise.all([...suras.keys()].map(async (s) => rw.set(s, await getJson(`riwayah/${riwayah}/${pad(s)}.json`))));
  const fatiha = await getJson(`riwayah/${riwayah}/001.json`);
  const paper = el('article', 'paper mp mp-flowpage');
  paper.lang = 'ar'; paper.dir = 'rtl';
  paper.setAttribute('aria-label', `Mushaf page ${p}`);
  const onPage = [...new Set(layout.lines.filter((l) => l.t === 'a').flatMap((l) => l.w.map((w) => w[0])))];
  const head = el('div', 'mp-head');
  head.append(el('span', null, onPage.map((s) => suras.get(s).ar).join(' · ')), el('span', null, `الجزء ${arNum(layout.juz)}`));
  const box = el('div', 'mp-lines');
  let flow = null;
  const seen = new Set();
  for (const l of layout.lines) {
    if (l.t === 's') { box.append(el('div', 'mp-line mp-banner', `سورة ${suras.get(l.s).ar}`)); flow = null; continue; }
    if (l.t === 'b') {
      const line = el('div', 'mp-line mp-bism c rw');
      const bItem = items.get(`${l.s}:0`);
      if (bItem && wordSpan) bItem.words.forEach((w, i) => { if (i) line.append(' '); line.append(wordSpan(w)); });
      else line.append(el('span', items.size && !items.has(`${l.s}:1`) ? 'out' : '', fatiha['1'] ?? ''));
      box.append(line);
      flow = null;
      continue;
    }
    for (const [s, a, wi] of l.w) {
      if (wi !== 0 || seen.has(`${s}:${a}`)) continue;   // each ayah is drawn on the page where it starts
      seen.add(`${s}:${a}`);
      if (!flow) { flow = el('div', 'mp-flow rw'); box.append(flow); }
      const it = items.get(`${s}:${a}`);
      if (it && wordSpan) it.words.forEach((w) => { const sp = wordSpan(w); sp.dataset.k = `${s}:${a}`; flow.append(sp, ' '); });
      else for (const w of tokenize(rw.get(s)?.[a] ?? '', `${s}:${a}`, { raw: true })) { const sp = el('span', items.size ? 'out' : '', w.display); sp.dataset.k = `${s}:${a}`; flow.append(sp, ' '); }
      const mk = it && markerSpan ? markerSpan(it, a) : el('span', 'mk' + (items.size ? ' out' : ''), `﴿${arNum(a)}﴾`);
      mk.dataset.k = `${s}:${a}`;
      flow.append(mk, ' ');
    }
  }
  paper.append(head, box, el('div', 'mp-folio', arNum(p)));
  return paper;
}

// Size the text to the page's width, as large as reads well.
// The printed mushaf's lines are all one width, but in this font some lines come out wider than others. Sizing the
// whole page by its widest line made every line small (about 16px on a phone). Instead the page takes the size at
// which most lines fit, and only the few wider lines are set a little smaller, each just enough to fit.
const MIN_LINE = 0.8;   // a wide line is never set smaller than this share of the page's size
export async function fitPaper(paper) {
  if (!paper?.isConnected) return;
  try { await document.fonts.load('24px "KFGQPC Hafs"'); } catch {}
  const box = paper.querySelector('.mp-lines');
  if (!box) return;
  if (paper.classList.contains('mp-flowpage')) { paper.style.setProperty('--mfs', `${Math.min(32, Math.max(18, box.clientWidth / 18))}px`); return; }
  const lines = [...box.querySelectorAll('.mp-line:not(.mp-banner)')];
  const W = box.clientWidth;
  if (!W || !lines.length) return;
  const fs0 = Math.min(44, Math.max(14, W / 13));   // 44px: large on a laptop, while a page is not many screens tall
  paper.style.setProperty('--mfs', `${fs0}px`);
  lines.forEach((l) => { l.style.fontSize = ''; });
  // each line's natural width at fs0 (allowing for the small padding around each word on the Recite and Hifz pages)
  box.classList.add('mp-measure');
  const room = W - Math.max(2, fs0 * 0.2);
  const ratio = lines.map((l) => Math.min(1, room / Math.max(1, l.scrollWidth)));
  box.classList.remove('mp-measure');
  const sorted = [...ratio].sort((a, b) => a - b);
  const q = sorted[Math.floor(sorted.length * 0.3)] ?? 1;           // the size at which about 70% of lines fit
  const fs = fs0 * Math.min(1, Math.max(q, sorted[0] / MIN_LINE));  // ...but never so large that a line needs less than MIN_LINE
  paper.style.setProperty('--mfs', `${fs}px`);
  lines.forEach((l, i) => { const r = (fs0 * ratio[i]) / fs; if (r < 0.999) l.style.fontSize = `${r.toFixed(3)}em`; });
  // rounding and justification: a last check, shrinking only the lines that still overflow
  for (const l of lines) {
    for (let k = 0; k < 12 && l.scrollWidth > l.clientWidth + Math.max(2, fs * 0.2); k++) {
      l.style.fontSize = `${((parseFloat(l.style.fontSize) || 1) * 0.97).toFixed(3)}em`;
    }
  }
  // A page drawn while the screen is still settling (fonts, the bars around it) can measure a little off: look again
  // shortly after, and fit once more if any line has come out wider than the page.
  const tries = paper.__fitTries ?? 0;
  if (tries < 3) setTimeout(() => {
    if (!paper.isConnected) return;
    const over = lines.some((l) => l.scrollWidth > l.clientWidth + Math.max(2, fs * 0.2));
    paper.__fitTries = over ? tries + 1 : 0;
    if (over) fitPaper(paper);
  }, 300);
}
