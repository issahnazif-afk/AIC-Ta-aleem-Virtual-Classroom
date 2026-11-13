// How the recorded voice (Kokoro, an English voice) says the Arabic words in the Sheikh's lessons: each word is written
// in the classroom's simple transliteration and turned here into the sounds (IPA) the voice reads, so it says them as
// Arabic, not as English guesses them ("GUN-ah" for ghunnah, "MAK-har-idge" for makhārij).
//
// The transliteration (as written in src/lib/tajweed/course.mjs and src/quran/lib/riwayat/course.mjs):
//   aa ā   ee ī   oo ū   a   i   u (short u, as in Sunnah: never the "a" of "sun")   ay/ai   aw
//   kh  the kh of Khadījah (x)     gh  ghayn (ɣ)     dh  dh of dhālika (ð)     th  th of thumma (θ)     sh  shīn (ʃ)
//   j  jīm (dʒ)   q  qāf   y  yāʾ   '  a hamzah or ʿayn (a break)   a doubled letter is held (shaddah)
//   -  joins the article or a particle to its word (al-qamar, ash-shams, bi-hijaarah)
//   a final -ah is the tāʾ marbūṭah, said -a when stopping (Sunnah, ghunnah)
// The stress follows Arabic: a last syllable with a long vowel and a consonant (-eem, -oon), else the one before it if
// it is long or closed, else the one before that.

const DIGRAPH = [['kh', 'x'], ['gh', 'ɣ'], ['dh', 'ð'], ['th', 'θ'], ['sh', 'ʃ']];
const CONS = { b: 'b', t: 't', j: 'dʒ', h: 'h', d: 'd', r: 'ɹ', z: 'z', s: 's', f: 'f', q: 'k', k: 'k', l: 'l', m: 'm', n: 'n', w: 'w', y: 'j', g: 'ɡ', v: 'v', p: 'p', c: 'k', x: 'x' };

// one part (no hyphens) → [{ c: consonant } | { v: vowel, long }]
function units(part) {
  let w = part.toLowerCase().replace(/[’'`ʿʾ]/g, '');
  w = w.replace(/ah$/, 'a');                                   // the tāʾ marbūṭah, stopping
  const out = [];
  for (let i = 0; i < w.length;) {
    const rest = w.slice(i);
    let m;
    if ((m = /^a{2,}/.exec(rest))) { out.push({ v: 'ɑː', long: true }); i += m[0].length; continue; }
    if ((m = /^e{2,}|^ii+|^ie/.exec(rest))) { out.push({ v: 'iː', long: true }); i += m[0].length; continue; }
    if ((m = /^o{2,}|^uu+/.exec(rest))) { out.push({ v: 'uː', long: true }); i += m[0].length; continue; }
    if (/^(ay|ai)(?![aeiou])/.test(rest)) { out.push({ v: 'aɪ', long: true }); i += 2; continue; }
    if (/^aw(?![aeiou])/.test(rest)) { out.push({ v: 'aʊ', long: true }); i += 2; continue; }
    if (/^ou/.test(rest)) { out.push({ v: 'ʊ' }); i += 2; continue; }
    if (rest[0] === 'a') { out.push({ v: 'a' }); i++; continue; }
    if (rest[0] === 'i' || rest[0] === 'e') { out.push({ v: 'i' }); i++; continue; }
    if (rest[0] === 'u' || rest[0] === 'o') { out.push({ v: 'ʊ' }); i++; continue; }
    const d = DIGRAPH.find(([k]) => rest.startsWith(k));
    if (d) { out.push({ c: d[1] }); i += 2; continue; }
    if (CONS[rest[0]]) { out.push({ c: CONS[rest[0]] }); i++; continue; }
    i++;                                                         // anything else is not a sound
  }
  return out;
}

// the units of a word → IPA with the stress mark
function stressed(us) {
  // syllables: each vowel takes the one consonant before it as its onset (all of them at the start of the word);
  // the other consonants close the syllable before
  const V = us.map((u, k) => (u.v ? k : -1)).filter((k) => k >= 0);
  if (!V.length) return us.map((u) => u.c).join('');
  const starts = V.map((v, s) => (s === 0 ? 0 : v - 1 > V[s - 1] ? v - 1 : v));
  const syl = V.map((v, s) => ({ on: us.slice(starts[s], v), v: us[v], coda: us.slice(v + 1, s + 1 < V.length ? starts[s + 1] : us.length) }));
  const heavy = (s) => s.v?.long || s.coda.length > 0;
  const n = syl.length;
  let at;
  const last = syl[n - 1];
  if (n === 1) at = 0;
  else if ((last.v?.long && last.coda.length) || last.coda.length > 1) at = n - 1;
  else if (heavy(syl[n - 2])) at = n - 2;
  else at = Math.max(0, n - 3);
  // the stress mark goes just before the stressed vowel, as the voice writes it (kʊɹˈɑːn)
  return syl.map((s, k) => [...s.on.map((u) => u.c), (k === at ? 'ˈ' : '') + s.v.v, ...s.coda.map((u) => u.c)].join('')).join('');
}

// the sounds of a transliterated word or phrase ("al-qamar", "qutbu jad")
const PARTICLES = new Set(['al', 'an', 'as', 'ash', 'ad', 'ar', 'at', 'adh', 'az', 'ath', 'li', 'lil', 'lis', 'bi', 'wal', 'wa', 'fa', 'ka', 'la']);
// words whose sound the spelling cannot show (a final hamzah, a long vowel written short)
const FIXED = { ikhfaa: 'ixfˈɑː', istilaa: 'istilˈɑː', madinah: 'madˈiːna', riwayah: 'ɹiwˈɑːja', riwayat: 'ɹiwaːjˈɑːt', ijazah: 'idʒˈɑːza', jaaiz: 'dʒˈɑːiz', 'iz-haar': 'izhˈɑːɹ', aarid: 'ˈɑːɹid', tabeei: 'tabˈiːi', 'as-samaaa-u': 'assamˈɑːu', 'as-samaa-i': 'assamˈɑːi',
  fathah: 'fˈatha', 'al-fatihah': 'alfˈɑːtiha', nafi: 'nˈɑːfi', kufa: 'kˈuːfa', yaseen: 'jɑːsˈiːn', dawud: 'dɑːwˈuːd', 'al-atfal': 'alatfˈɑːl',
  'ash-shatibiyyah': 'aʃʃɑːtibˈijja', 'al-jamzuri': 'aldʒamzˈuːɹi', 'ash-shuara': 'aʃʃʊaɹˈɑː', qaloon: 'kɑːlˈuːn', 'ra-aa': 'ɹaˈɑː',
  imraah: 'imɹˈaʔa', ayyash: 'ajjˈɑːʃ', salamah: 'salˈama' };
export function arabicSounds(text) {
  return text.trim().split(/\s+/).map((word) => {
    if (FIXED[word.toLowerCase()]) return FIXED[word.toLowerCase()];
    // the article and the particles lean on the word after them, unstressed; other parts make one word
    const parts = word.split('-').filter(Boolean);
    let lead = '';
    while (parts.length > 1 && PARTICLES.has(parts[0].toLowerCase())) lead += units(parts.shift()).map((u) => u.c ?? u.v).join('');
    return lead + stressed(parts.flatMap(units));
  }).join(' ');
}

// the Arabic words the Sheikh says in his lessons, as they are written there. Only these are turned into sounds:
// English words (moon, see, look) are left to the voice. A word written with capitals is matched without them.
export const ARABIC_WORDS = `
tajweed tarteel ghunnah sunnah makhraj makhaarij qalqalah idghaam ikhfaa iqlaab izhaar iz-haar halqi shafawi haqeeqi
madd tabeei muttasil munfasil waajib jaaiz aarid lis-sukoon sukoon saakinah laazim al-leen leen badal al-badal
tafkheem tarqeeq istilaa itbaq shaddah shiddah mushaddadah tanween fathah kasrah dammah hamzah hamzat al-wasl wasl
waqf saktah mithlayn mutajaanisayn mutaqaaribayn shamsiyyah ash-shamsiyyah qamariyyah al-qamariyyah maqsoorah marbootah
riwayah riwaayah riwayat ijazah talaqqi
Hafs Aasim ash-Shatibiyyah al-Jazari al-Jamzuri Tuhfat al-Atfal Muqaddimah Jibreel an-Nashr Tayyibat
Warsh Qaloon Nafi ad-Doori as-Soosi Shoubah al-Bazzi Katheer Qunbul Kufa Basra Madinah al-Yazeedi Ayyash Eesa Meena
Yaseen al-Fatihah al-Mutaffifeen al-Qiyaamah ash-Shuara at-Tirmidhi Dawud Salamah
alif baa taa thaa jeem khaa daal dhaal raa saad daad dhaa ghain faa qaaf kaaf laam meem noon waaw yaa laa
yarmaloon yanmoo qutbu khussa daghtin qidh ibghi hajjaka khaf aqeemah
dunyaa bunyaan sinwaan qinwaan wal-quran wal-qalam
al-qamar ash-shams al-hamdu al-falaq al-haqq al-fajr al-qitr ar-raheem ar-raheemi as-samaa as-samaa-i as-samaaa-u
ad-daaalleen al-kaafireen lil-muttaqeen an-amta khayr khawf qaala yaqoolu qeela rizqan rijaal firq mirsaadaa irjiee
qadeer mustaqeem nastaeen tarmeehim bihijaarah anzalnaahu innaa innaaa a-taynaaka ahadaa aamanoo ambiaahum iltaqaa
alhaakum ibnah imraah imshoo iqdoo ibnoo kafaroo iwajaa qayyimaa marqadinaa haadhaa raaq raan bi-asaaka qad
athqalat daawaa dhaalik maanaa nakhlukkum qur aaal-aan ra-aa adraaka qul laaam meeem
`.trim().split(/\s+/);
