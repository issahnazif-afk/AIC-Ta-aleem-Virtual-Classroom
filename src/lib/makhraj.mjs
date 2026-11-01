// Makharij al-huruf: where each letter's sound comes from (the 17 makharij of Ibn al-Jazari's Muqaddimah),
// with a simple side-view drawing of the mouth and throat that lights up the place. The drawing is our own.

// The places, front of the mouth to the throat. x, y: the spot on the drawing; r: its size.
export const PLACES = {
  jawf:    { ar: 'الْجَوْف', en: 'the empty space of the mouth and throat', region: 'The mouth and throat (al-Jawf)' },
  'halq-deep':   { ar: 'أَقْصَى الْحَلْق', en: 'the deepest part of the throat', region: 'The throat (al-Halq)', x: 236, y: 214, r: 9 },
  'halq-mid':    { ar: 'وَسَطُ الْحَلْق', en: 'the middle of the throat', region: 'The throat (al-Halq)', x: 233, y: 172, r: 9 },
  'halq-near':   { ar: 'أَدْنَى الْحَلْق', en: 'the top of the throat, nearest the mouth', region: 'The throat (al-Halq)', x: 222, y: 128, r: 9 },
  qaf:     { ar: 'أَقْصَى اللِّسَان', en: 'the very back of the tongue, against the soft roof of the mouth', region: 'The tongue (al-Lisan)', x: 197, y: 106, r: 8 },
  kaf:     { ar: 'أَقْصَى اللِّسَان (أَسْفَلُ قَلِيلًا)', en: 'the back of the tongue, a little further forward than ق', region: 'The tongue (al-Lisan)', x: 177, y: 98, r: 8 },
  middle:  { ar: 'وَسَطُ اللِّسَان', en: 'the middle of the tongue, against the hard roof of the mouth', region: 'The tongue (al-Lisan)', x: 130, y: 93, r: 9 },
  side:    { ar: 'حَافَّةُ اللِّسَان', en: 'the side of the tongue, against the upper back teeth', region: 'The tongue (al-Lisan)', x: 150, y: 99, r: 8 },
  rim:     { ar: 'أَدْنَى حَافَّةِ اللِّسَان', en: 'the front edge of the tongue, against the gum above the front teeth', region: 'The tongue (al-Lisan)', x: 86, y: 98, r: 7 },
  nun:     { ar: 'طَرَفُ اللِّسَان', en: 'the tip of the tongue, against the gum above the front teeth', region: 'The tongue (al-Lisan)', x: 74, y: 101, r: 7 },
  ra:      { ar: 'طَرَفُ اللِّسَان (مَعَ ظَهْرِهِ)', en: 'the tip of the tongue with a little of its top, against the gum', region: 'The tongue (al-Lisan)', x: 80, y: 101, r: 7 },
  tip:     { ar: 'طَرَفُ اللِّسَان وَأُصُولُ الثَّنَايَا الْعُلْيَا', en: 'the tip of the tongue, against the roots of the upper front teeth', region: 'The tongue (al-Lisan)', x: 65, y: 106, r: 6 },
  whistle: { ar: 'طَرَفُ اللِّسَان فُوَيْقَ الثَّنَايَا السُّفْلَى', en: 'the tip of the tongue, just behind the front teeth, with a small gap for the air', region: 'The tongue (al-Lisan)', x: 62, y: 118, r: 6 },
  edges:   { ar: 'طَرَفُ اللِّسَان وَأَطْرَافُ الثَّنَايَا الْعُلْيَا', en: 'the tip of the tongue, against the edges of the upper front teeth', region: 'The tongue (al-Lisan)', x: 55, y: 115, r: 6 },
  fa:      { ar: 'بَطْنُ الشَّفَةِ السُّفْلَى وَأَطْرَافُ الثَّنَايَا الْعُلْيَا', en: 'the inside of the lower lip, against the edges of the upper front teeth', region: 'The lips (ash-Shafatan)', x: 50, y: 125, r: 6 },
  lips:    { ar: 'الشَّفَتَان', en: 'the two lips', region: 'The lips (ash-Shafatan)', x: 36, y: 119, r: 8 },
  nose:    { ar: 'الْخَيْشُوم', en: 'the nose (for the humming ghunnah)', region: 'The nose (al-Khayshum)', x: 112, y: 62, r: 9 },
};

// How to say each letter, for children who are not native speakers. heavy: a letter of isti'la (the back of the tongue rises).
const L = {
  alif: { at: 'halq-deep', also: 'jawf', how: 'Here Alif carries a hamza (أ): a tiny catch deep in the throat, then the vowel. As a long vowel (the ا in مَا) it has no fixed place: the sound flows out from the empty space of the mouth and throat.' },
  ba: { at: 'lips', how: 'Press both lips together, then open them with a small pop.' },
  ta: { at: 'tip', how: 'Touch the tip of your tongue behind your upper front teeth, then let go: a light, clean t.' },
  tha: { at: 'edges', how: 'Put the tip of your tongue lightly against the edges of your upper front teeth and blow softly: th, as in "think".' },
  jim: { at: 'middle', how: 'Raise the middle of your tongue to the roof of your mouth, then release: j.' },
  'ha-hollow': { at: 'halq-mid', how: 'Breathe out through a narrowed middle of the throat, like fogging a window but tighter. No scratch.' },
  kha: { at: 'halq-near', heavy: true, how: 'Make a rough, scraping sound at the top of the throat, like clearing it gently.' },
  dal: { at: 'tip', how: 'Same place as ت: the tip of the tongue behind the upper front teeth, but with your voice on: d.' },
  dhal: { at: 'edges', how: 'Same place as ث, with your voice on: th, as in "this".' },
  ra: { at: 'ra', how: 'The tip of the tongue taps the gum behind your upper teeth once. Do not roll it on and on.' },
  zay: { at: 'whistle', how: 'Like س, with your voice on: a buzzing zzz.' },
  sin: { at: 'whistle', how: 'The tip of your tongue just behind your front teeth, a small gap for the air: a clear, whistling sss.' },
  shin: { at: 'middle', how: 'Raise the middle of your tongue towards the roof of your mouth and let the air spread: shhh.' },
  sad: { at: 'whistle', heavy: true, how: 'The place of س, but heavy: raise the back of your tongue so the sound is full and deep. sss, deep.' },
  dad: { at: 'side', heavy: true, how: 'Press the side of your tongue (one side or both) against your upper back teeth, and keep it heavy. The hardest letter: ask your teacher to say it with you.' },
  'ta-heavy': { at: 'tip', heavy: true, how: 'The place of ت, but heavy: the back of the tongue rises and the sound is strong and deep.' },
  'dha-heavy': { at: 'edges', heavy: true, how: 'The place of ذ, but heavy: the back of the tongue rises, voice on.' },
  ayn: { at: 'halq-mid', how: 'Tighten the middle of the throat and let your voice squeeze through. It has no sound in English: listen to the Sheikh and copy.' },
  ghayn: { at: 'halq-near', heavy: true, how: 'Like خ, with your voice on: a soft gargle at the top of the throat.' },
  fa: { at: 'fa', how: 'Rest your upper front teeth on the inside of your lower lip and blow: fff.' },
  qaf: { at: 'qaf', heavy: true, how: 'Touch the very back of your tongue to the soft roof of your mouth, deeper than ك, then release: a deep q.' },
  kaf: { at: 'kaf', how: 'Touch the back of your tongue to the roof of your mouth, a little forward of ق: a light k with a breath of air.' },
  lam: { at: 'rim', how: 'Put the front edge of your tongue on the gum behind your upper teeth and let the sound flow around it: lll.' },
  mim: { at: 'lips', nose: true, how: 'Close your lips and hum through your nose: mmm.' },
  nun: { at: 'nun', nose: true, how: 'Put the tip of your tongue on the gum behind your upper teeth and hum through your nose: nnn.' },
  ha: { at: 'halq-deep', how: 'A soft breath from the deepest part of the throat: h, as in "hat".' },
  waw: { at: 'lips', how: 'Round your lips into a small circle, without closing them: w.' },
  ya: { at: 'middle', how: 'Raise the middle of your tongue near the roof of your mouth: y, as in "yes".' },
};

export function makhrajOf(file) {
  const m = L[file];
  if (!m) return null;
  return { ...m, place: PLACES[m.at], alsoPlace: m.also ? PLACES[m.also] : null };
}

// the side view: the face looks left; nose, lips, teeth, palate, tongue, throat
export function makhrajSvg(file) {
  const m = makhrajOf(file);
  if (!m) return '';
  const p = m.place, jawf = m.at === 'jawf' || m.also === 'jawf';
  const spot = (q, cls) => `<circle class="mk-glow ${cls}" cx="${q.x}" cy="${q.y}" r="${q.r * 2.2}"/><circle class="mk-dot ${cls}" cx="${q.x}" cy="${q.y}" r="${q.r * 0.6}"/>`;
  return `<svg class="mk-svg" viewBox="0 0 280 250" role="img" aria-label="Where the sound comes from: ${p.en}">
  <path class="mk-face" d="M118 6 Q70 8 52 46 Q46 60 34 78 Q26 90 38 94 Q44 96 44 100 Q30 104 30 112 Q30 120 34 122 Q30 130 34 140 Q40 150 54 150 Q56 172 72 186 Q100 204 150 204 L160 248 L272 248 L272 6 Z"/>
  <path class="mk-nasal" d="M58 74 Q100 50 190 58 Q206 62 208 78 Q160 74 120 78 Q86 80 58 84 Z"/>
  <path class="mk-throat" d="M206 104 Q214 150 220 248 L250 248 Q244 160 240 80 Q228 70 208 78 Z"/>
  <path class="mk-cavity" d="M60 104 Q96 82 150 84 Q190 86 206 100 L210 160 Q140 158 64 126 Z"/>
  <path class="mk-palate" d="M60 104 Q96 82 150 84 Q190 86 204 100 Q210 108 206 120"/>
  <path class="mk-lip" d="M46 92 Q30 98 32 110 Q40 114 56 110 Z"/>
  <path class="mk-lip" d="M58 128 Q36 126 34 137 Q42 148 60 142 Z"/>
  <path class="mk-tooth" d="M53 103 L61 103 L59 118 L54 117 Z"/>
  <path class="mk-tooth" d="M55 136 L63 136 L62 123 L56 122 Z"/>
  <path class="mk-tongue${m.heavy ? ' heavy' : ''}" d="${m.heavy ? 'M64 121 Q70 112 92 111 Q130 104 168 98 Q196 96 202 130 L198 172 Q140 156 80 144 Q62 138 64 121 Z' : 'M64 121 Q70 112 92 111 Q130 100 168 106 Q194 112 200 146 L198 172 Q140 156 80 144 Q62 138 64 121 Z'}"/>
  <path class="mk-folds" d="M222 210 Q236 206 246 212"/>
  ${jawf ? '<path class="mk-air" d="M236 230 Q228 150 200 112 Q150 96 44 117"/>' : ''}
  ${p.x ? spot(p, 'main') : ''}
  ${m.nose ? spot(PLACES.nose, 'nose') : ''}
  <text class="mk-lab" x="112" y="44">nose</text><text class="mk-lab" x="8" y="104">lips</text><text class="mk-lab" x="112" y="128">tongue</text><text class="mk-lab" x="252" y="150" transform="rotate(90 252 150)">throat</text>
</svg>`;
}
