// Madani Classic: the standard 15-line page, always whole on the screen, its words as large as the screen allows.
// Shared by the classroom (src/lib/mushaf.mjs) and the adults' Quran Library (src/quran/lib/mushaf.mjs).
//
// The page is not drawn as a portrait sheet of fixed proportions (on a laptop or a phone that left the words small).
// Instead:
//   1. the text size is the largest at which the longest printed line fits the width AND the 15 lines fit the height;
//   2. the page is then made only as wide as its longest line, so a wide screen does not stretch the word gaps;
//   3. spare height stays between the lines (at most `maxLh` line-heights apart), so the page fills the screen.
// The paper starts at the full size of its panel (CSS), and this function narrows it (and, rarely, shortens it).
//
// paper: the page element; box: its lines' container; opts.natural(line, fs): the line's natural width in px at the
// current size (the classroom's lines are flex rows, the adults' are justified text, so each side measures its own).
// opts.measure(on): switches the lines to their natural width while they are measured (the adults' justified lines).
export function classicFit(paper, box, { rows = 15, minLh = 1.62, maxLh = 2.7, min = 12, max = 64, natural, measure } = {}) {
  paper.style.removeProperty('width'); paper.style.removeProperty('height'); paper.style.removeProperty('--mfs');
  const lines = [...box.querySelectorAll('.mp-line:not(.mp-banner)')];
  const W = box.clientWidth, H = box.clientHeight;
  if (!W || !H || !lines.length) return 0;
  // measure every line once at a reference size: widths grow in step with the text size
  const ref = 40;
  paper.style.setProperty('--mfs', `${ref}px`);
  measure?.(true);
  const widest = Math.max(1, ...lines.map((l) => natural(l, ref)));
  measure?.(false);
  const byWidth = (ref * W) / (widest * 1.015);
  const byHeight = H / (rows * minLh);
  const fs = Math.max(min, Math.min(max, byWidth, byHeight));
  paper.style.setProperty('--mfs', `${fs}px`);
  // 2. only as wide as the longest line (plus a little air)
  const want = Math.ceil((widest * fs) / ref * 1.03);
  // (important: the adults' full-page view sizes the paper with !important rules)
  if (want < W) paper.style.setProperty('width', `${paper.offsetWidth - (W - want)}px`, 'important');
  // 3. lines no further apart than maxLh
  const most = rows * fs * maxLh;
  if (H > most) paper.style.setProperty('height', `${Math.floor(paper.offsetHeight - (H - most))}px`, 'important');
  return fs;
}

// The natural width of a line laid out as a flex row of words (the classroom): the line packed tight (its smallest
// gaps), from the edge of its first word to the edge of its last. Measured on the page itself, so the words' own
// padding and negative margins count exactly as they lay out. (A right-to-left flex line overflows to the left,
// which scrollWidth does not count.)
export function flexLineWidth(l) {
  const was = l.style.justifyContent;
  l.style.justifyContent = 'flex-start';
  let lo = Infinity, hi = -Infinity;
  for (const c of l.children) { const r = c.getBoundingClientRect(); if (r.width) { lo = Math.min(lo, r.left); hi = Math.max(hi, r.right); } }
  l.style.justifyContent = was;
  return hi > lo ? hi - lo : 0;
}
