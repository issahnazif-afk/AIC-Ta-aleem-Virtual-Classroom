// Candidate hadith for the Sheikh, for Ustadh Issah to review (NOT approved, NOT used by the site).
// Writes scripts/sheikh/candidates/hadith.json and docs/sheikh-review/hadith.md.
//   node scripts/sheikh/candidates/hadith-candidates.mjs
//
// Source: hadith-api by fawazahmed0 (The Unlicense), English of sunnah.com, numbering of sunnah.com, the same
// editions and the same tidy() as scripts/sheikh/hadith.mjs. Every "text" is taken from the downloaded JSON by code;
// nothing here is typed, paraphrased or translated. Below are only the choices (which hadith), a few words on what each
// is about (for search only, never shown) and the questions each one directly answers.
//
// 1. an-Nawawi's Forty: every hadith in eng-nawawi (42), numbered as in the edition.
// 2. Sahih al-Bukhari and Sahih Muslim only: chosen by keyword search over the downloaded text (each pick carries the
//    keyword that found it, and the script checks that the text really contains it). Sahih Muslim is matched on its
//    exact "arabicnumber" (e.g. 793.05), which is sunnah.com's number with a sub-letter (.01 = a, .02 = b ...).
import fs from 'node:fs';
import path from 'node:path';

const root = new URL('../../../', import.meta.url);
const file = (p) => path.join(new URL(p, root).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const cache = file('node_modules/.cache/hadith-api/');
fs.mkdirSync(cache, { recursive: true });

async function edition(c) {
  const f = path.join(cache, `eng-${c}.json`);
  if (!fs.existsSync(f)) {
    const r = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-${c}.min.json`);
    if (!r.ok) throw new Error(`eng-${c}: ${r.status}`);
    fs.writeFileSync(f, await r.text());
  }
  return JSON.parse(fs.readFileSync(f, 'utf8')).hadiths;
}
// exactly the tidy() of scripts/sheikh/hadith.mjs
const tidy = (t) => {
  let s = t.replace(/`/g, 'ʿ').replace(/\s*\(ﷺ\)/g, ' ﷺ').replace(/\(may Allah's peace upon him\)/g, 'ﷺ').replace(/:(?=\S)/g, ': ').replace(/\s+/g, ' ').replace(/ﷺ\s+([,.;:])/g, 'ﷺ$1').trim();
  if ((s.match(/"/g) ?? []).length % 2) s += '"';
  return s;
};

// ---- an-Nawawi's Forty: [topic, ask, note for the reviewer (optional)]
const NAWAWI = {
  1: ['actions are judged by intentions', ['why does my intention matter', 'what is niyyah', 'are deeds judged by intentions']],
  2: ['Jibril asks about Islam, iman and ihsan', ['what is ihsan', 'what is iman', 'what are the pillars of Islam'], 'long'],
  3: ['the five pillars of Islam', ['what are the five pillars of Islam', 'what is Islam built on']],
  4: ['creation in the womb and what is written for each person', [], 'about the womb and the end of life; may not suit young children'],
  5: ['new things added to the religion are rejected', ['can we add new things to the religion']],
  6: ['halal and haram are clear, avoid doubtful things, the heart', ['what should I do with doubtful things', 'what is the most important part of the body']],
  7: ['the religion is sincere advice', ['what is naseehah', 'what does the religion is sincerity mean']],
  8: ['ordered to fight until people testify', [], 'about fighting; may not suit children'],
  9: ['avoid what is forbidden, do what you can of what is commanded', ['what if I cannot do everything I am told', 'should I ask too many questions']],
  10: ['Allah is Good and accepts only what is good, halal food and dua', ['why is my dua not answered', 'does Allah accept only good things']],
  11: ['leave what makes you doubt for what does not', ['what should I do if I am not sure something is right']],
  12: ['leaving what does not concern you', ['should I get involved in things that do not concern me', 'what is part of being a good Muslim']],
  13: ['love for your brother what you love for yourself', ['how should I treat my friends', 'what does it mean to truly believe']],
  14: ['when the blood of a Muslim may be spilled', [], 'about capital punishment; not for children'],
  15: ['speak good or stay silent, honour neighbour and guest', ['when should I stay quiet', 'how should I treat my guests', 'how should I treat my neighbours']],
  16: ['do not become angry', ['what advice did the Prophet give about anger', 'is it bad to get angry']],
  17: ['excellence in everything, even with animals', ['should I do everything well', 'how should we treat animals'], 'mentions killing and slaughter'],
  18: ['taqwa, follow a bad deed with a good one, good character', ['what should I do after I make a mistake', 'how should I treat people']],
  19: ['advice to the young Ibn Abbas: be mindful of Allah, ask Allah alone', ['who should I ask for help', 'what did the Prophet teach Ibn Abbas when he was young', 'what if everyone tried to harm me']],
  20: ['modesty: if you feel no shame do as you wish', ['what is haya', 'what did the earlier prophets teach']],
  21: ['say I believe in Allah and then be steadfast', ['what is a short advice about Islam']],
  22: ['doing the obligations is enough to enter Paradise', ['will I go to Paradise if I pray and fast']],
  23: ['purity is half of faith, alhamdulillah fills the scale, prayer is light, patience', ['what fills the scales', 'is the Quran for me or against me', 'what is half of faith']],
  24: ['O My servants: oppression forbidden, ask Allah for guidance and forgiveness', ['who should I ask for guidance', 'does Allah forgive all sins'], 'long'],
  25: ['every tasbih and good word is charity', ['can poor people give charity', 'is saying subhanallah charity']],
  26: ['every joint owes a charity each day; good words and helping are charity', ['what counts as charity', 'is a kind word charity', 'is helping someone charity']],
  27: ['righteousness is good character; consult your heart', ['what is righteousness', 'how do I know if something is wrong']],
  28: ['hold on to the Sunnah, obey, avoid new things', ['what did the Prophet advise at the end', 'what should we hold on to'], 'long'],
  29: ['deeds that lead to Paradise; guard your tongue', ['what deeds take me to Paradise', 'why should I be careful what I say'], 'long'],
  30: ['do not neglect obligations, do not go past limits', ['why are some things not explained in Islam']],
  31: ['how to be loved by Allah and by people', ['how can I make Allah love me', 'how can I make people love me']],
  32: ['no harming and no returning harm', ['can I hurt someone who hurt me']],
  33: ['the claimant must bring proof', [], 'court and legal claims'],
  34: ['change evil with your hand, tongue or heart', ['what should I do if I see something wrong']],
  35: ['do not envy, hate or turn away; Muslims are brothers', ['why should I not be jealous', 'how should Muslims treat each other']],
  36: ['relieving others, covering faults, the path of knowledge, gatherings for the Quran', ['what reward is there for helping someone', 'is seeking knowledge rewarded', 'what happens when people gather to read the Quran'], 'long'],
  37: ['good and bad deeds are written; intending good is rewarded', ['do I get a reward for intending to do good', 'what if I wanted to do a bad deed but did not']],
  38: ['the wali of Allah; drawing near through obligations and extra deeds', ['how can I get close to Allah'], 'mentions declaring war'],
  39: ['mistakes, forgetfulness and what one is forced to do are pardoned', ['will Allah punish me for a mistake', 'what if I forget']],
  40: ['be in this world like a stranger or a traveller', ['how should I live in this world']],
  41: ['true belief: desires following what the Prophet brought', ['what does it mean to truly believe']],
  42: ['O son of Adam: Allah forgives as long as you ask', ['will Allah forgive me', 'can my sins be too many to forgive']],
};

// ---- Sahih al-Bukhari and Sahih Muslim, found by keyword. a = the edition's arabicnumber (exact).
const PICKS = [
  // learning and teaching the Qur'an
  { theme: 'Learning and teaching the Qur’an', c: 'bukhari', a: '5035', kw: /learnt/, topic: 'Ibn Abbas learnt Quran surahs as a boy of ten', ask: ['how old was Ibn Abbas when he learnt the Quran', 'can children learn the Quran'] },
  { theme: 'Learning and teaching the Qur’an', c: 'bukhari', a: '4999', kw: /learn/, topic: 'learn the Quran from four companions', ask: ['who did the Prophet say to learn the Quran from'] },
  { theme: 'Learning and teaching the Qur’an', c: 'muslim', a: '873.02', kw: /learned/, topic: 'Umm Hisham learnt Surah Qaf from the Prophet in the Friday sermon', ask: ['which surah did the Prophet recite on Fridays', 'how did the companions learn surahs'] },
  { theme: 'Learning and teaching the Qur’an', c: 'bukhari', a: '7141', kw: /teaches/, topic: 'wish only to be like one who acts on the Quran and teaches it', ask: ['who should I wish to be like', 'is it good to teach what I learn'] },
  { theme: 'Learning and teaching the Qur’an', c: 'bukhari', a: '5025', kw: /knowledge of the Book/, topic: 'wish only to be like one who recites the Book at night', ask: ['is it good to recite the Quran at night'] },
  { theme: 'Learning and teaching the Qur’an', c: 'muslim', a: '799.01', kw: /recite the Qur'an/, topic: 'Ubayy wept when told Allah mentioned him by name', ask: ['why did Ubayy ibn Kab cry'] },
  { theme: 'Learning and teaching the Qur’an', c: 'bukhari', a: '5013', kw: /reciting/, topic: 'Surah al-Ikhlas is equal to a third of the Quran', ask: ['what surah is equal to a third of the Quran', 'is it good to repeat Surah al-Ikhlas'] },
  { theme: 'Learning and teaching the Qur’an', c: 'bukhari', a: '5017', kw: /reciting Surat/, topic: 'reciting Ikhlas, Falaq and Nas before sleeping', ask: ['what should I recite before I sleep', 'what did the Prophet do before going to bed'] },
  { theme: 'Learning and teaching the Qur’an', c: 'muslim', a: '2667.01', kw: /Recite the Qur'an/, topic: 'recite while your hearts agree, stop when they differ', ask: ['when should I stop reciting the Quran'] },
  // reciting beautifully
  { theme: 'Reciting beautifully', c: 'bukhari', a: '5023', kw: /pleasant tone/, topic: 'reciting the Quran in a pleasant voice', ask: ['should I recite the Quran in a nice voice', 'does Allah like a beautiful recitation'] },
  { theme: 'Reciting beautifully', c: 'bukhari', a: '7527', kw: /nice voice/, topic: 'recite the Quran in a nice voice', ask: ['should I recite the Quran in a nice voice'] },
  { theme: 'Reciting beautifully', c: 'bukhari', a: '5048', kw: /melodious/, topic: 'Abu Musa was given a beautiful voice like the family of Dawud', ask: ['who had a beautiful voice for the Quran'] },
  { theme: 'Reciting beautifully', c: 'muslim', a: '793.05', kw: /sweet voice/, topic: 'the Prophet listened to Abu Musa recite at night and praised his voice', ask: ['did the Prophet listen to others recite', 'who had a beautiful voice for the Quran'] },
  { theme: 'Reciting beautifully', c: 'bukhari', a: '4835', kw: /pleasant voice/, topic: 'the Prophet recited Surah al-Fath in a pleasant voice', ask: ['how did the Prophet recite the Quran'] },
  { theme: 'Reciting beautifully', c: 'bukhari', a: '5046', kw: /prolongation/, topic: 'the Prophet stretched the sounds when reciting bismillah (madd)', ask: ['how did the Prophet recite the Quran', 'did the Prophet stretch the sounds when reciting', 'how did the Prophet say bismillah'] },
  // when reciting is hard
  { theme: 'When reciting is hard', c: 'bukhari', a: '4937', kw: /great difficulty/, topic: 'the one who recites with difficulty gets a double reward', ask: ['what if reading the Quran is hard for me', 'do I get a reward if I find the Quran difficult', 'what reward is there for memorising the Quran'] },
  { theme: 'When reciting is hard', c: 'muslim', a: '798.01', kw: /difficult/, topic: 'the one who falters in the Quran gets two rewards', ask: ['what if I keep making mistakes when I read the Quran', 'what if reading the Quran is hard for me'] },
  // revising and forgetting
  { theme: 'Revising and forgetting', c: 'bukhari', a: '5032', kw: /forgotten/, topic: 'do not say I forgot a verse, keep reciting', ask: ['what should I say if I forget a verse', 'how do I stop forgetting the Quran'] },
  { theme: 'Revising and forgetting', c: 'bukhari', a: '3648', kw: /forget/, topic: 'Abu Huraira forgot narrations and the Prophet made dua with his sheet', ask: ['did the companions forget things too'] },
  // seeking knowledge
  { theme: 'Seeking knowledge', c: 'bukhari', a: '71', kw: /comprehend the religion/, topic: 'when Allah wants good for someone He gives understanding of the religion', ask: ['why is understanding the religion good'] },
  { theme: 'Seeking knowledge', c: 'muslim', a: '1631', kw: /knowledge/, topic: 'three things continue after death: charity, useful knowledge, a righteous child', ask: ['what good deeds continue after we die', 'why is teaching useful knowledge good'] },
  // intention and sincerity
  { theme: 'Intention and sincerity', c: 'bukhari', a: '6467', kw: /sincerely/, topic: 'do good deeds sincerely and moderately; Allah’s mercy', ask: ['how should I do good deeds', 'will my good deeds alone take me to Paradise'] },
  { theme: 'Intention and sincerity', c: 'muslim', a: '2985', kw: /partner/, topic: 'Allah needs no partner; do deeds for Him alone', ask: ['why should I do good deeds only for Allah'] },
  // patience
  { theme: 'Patience', c: 'muslim', a: '2999', kw: /patiently/, topic: 'the believer is thankful in good times and patient in hard times', ask: ['what should I do when something bad happens', 'why should I be patient', 'what should I do when something good happens'] },
  { theme: 'Patience', c: 'bukhari', a: '1302', kw: /patience/, topic: 'real patience is at the first moment of a hardship', ask: ['what is real patience'] },
  { theme: 'Patience', c: 'bukhari', a: '5641', kw: /sorrow/, topic: 'tiredness, sadness and even a thorn prick wipe away sins', ask: ['is there a reward when I am sad or ill', 'does a small hurt wipe away sins'] },
  { theme: 'Patience', c: 'bukhari', a: '6340', kw: /impatience/, topic: 'dua is answered if you are not impatient', ask: ['why has my dua not been answered yet', 'should I keep making dua'] },
  // gentleness and kindness in teaching
  { theme: 'Gentleness and kindness in teaching', c: 'muslim', a: '2593', kw: /kindness/, topic: 'Allah is kind and loves kindness', ask: ['does Allah love kindness', 'why should I be gentle'] },
  { theme: 'Gentleness and kindness in teaching', c: 'muslim', a: '2592.01', kw: /deprived/, topic: 'one without gentleness is deprived of good', ask: ['why should I be gentle'] },
  { theme: 'Gentleness and kindness in teaching', c: 'muslim', a: '1734', kw: /leniency/, topic: 'be lenient, not hard; give good news, do not drive people away', ask: ['how should we teach others', 'should we make religion hard for people'] },
  { theme: 'Gentleness and kindness in teaching', c: 'bukhari', a: '39', kw: /easy/, topic: 'the religion is easy, do not overburden yourself', ask: ['is Islam hard', 'should I do more than I can manage'] },
  { theme: 'Gentleness and kindness in teaching', c: 'bukhari', a: '6035', kw: /character/, topic: 'the best of you are the best in character; the Prophet never used bad language', ask: ['who are the best people', 'did the Prophet use bad words'] },
  // mistakes and repentance
  { theme: 'Mistakes and repentance', c: 'bukhari', a: '6309', kw: /repentance/, topic: 'Allah is happier with repentance than a man who finds his lost camel', ask: ['is Allah happy when I say sorry', 'what should I do after I sin'] },
  { theme: 'Mistakes and repentance', c: 'bukhari', a: '6307', kw: /forgiveness/, topic: 'the Prophet asked forgiveness more than seventy times a day', ask: ['how often did the Prophet say astaghfirullah', 'should I say astaghfirullah every day'] },
  { theme: 'Mistakes and repentance', c: 'muslim', a: '2702.02', kw: /repentance/, topic: 'seek repentance; the Prophet did so a hundred times a day', ask: ['how often did the Prophet say astaghfirullah'] },
  { theme: 'Mistakes and repentance', c: 'muslim', a: '2751.02', kw: /mercy/, topic: 'Allah’s mercy is greater than His anger', ask: ['is Allah’s mercy bigger than His anger', 'will Allah be merciful to me'] },
  // manners with elders and teachers
  { theme: 'Manners with elders and teachers', c: 'bukhari', a: '72', kw: /youngest/, topic: 'Ibn Umar stayed quiet as the youngest; the tree like a Muslim is the date palm', ask: ['which tree is like a Muslim', 'why did Ibn Umar stay quiet'] },
  // honesty
  { theme: 'Honesty', c: 'bukhari', a: '6095', kw: /lie/, topic: 'the three signs of a hypocrite: lying, breaking promises, betraying trust', ask: ['is breaking a promise bad', 'what are the signs of a hypocrite', 'is lying bad'] },
  // parents
  { theme: 'Parents', c: 'muslim', a: '2551.02', kw: /parents/, topic: 'losing out by not serving parents in their old age', ask: ['why should I look after my parents when they are old'] },
  { theme: 'Parents', c: 'bukhari', a: '5973', kw: /parents/, topic: 'insulting someone’s parents is like cursing your own', ask: ['is it bad to insult someone’s parents', 'how can a person curse his own parents'] },
  // mercy to children
  { theme: 'Mercy to children', c: 'bukhari', a: '6003', kw: /Merciful/, topic: 'the Prophet hugged Usama and al-Hasan and prayed for mercy for them', ask: ['did the Prophet hug children', 'did the Prophet love children'] },
  { theme: 'Mercy to children', c: 'bukhari', a: '5998', kw: /mercy/, topic: 'kissing children; mercy in the heart', ask: ['is it good to kiss children'] },
  { theme: 'Mercy to children', c: 'bukhari', a: '6013', kw: /merciful/, topic: 'whoever is not merciful will not be shown mercy', ask: ['why should I be merciful', 'will Allah be merciful to me'] },
  { theme: 'Mercy to children', c: 'bukhari', a: '6000', kw: /merciful/, topic: 'Allah’s mercy in a hundred parts; a mother animal lifts her hoof from her baby', ask: ['why are mothers kind to their babies', 'how much mercy does Allah have'] },
  { theme: 'Mercy to children', c: 'bukhari', a: '707', kw: /child/, topic: 'the Prophet shortened prayer when he heard a child crying', ask: ['what did the Prophet do when a baby cried in prayer'] },
  { theme: 'Mercy to children', c: 'bukhari', a: '1798', kw: /boys/, topic: 'the Prophet let two boys ride with him on his mount', ask: ['was the Prophet kind to children'] },
  { theme: 'Mercy to children', c: 'bukhari', a: '3874', kw: /young girl/, topic: 'the Prophet praised a young girl’s new dress: Sanah, good', ask: ['did the Prophet make children happy'] },
];

// ---- already in the Sheikh's library (approved hadith and the deen data): never repeat them
const used = new Set();
const approved = JSON.parse(fs.readFileSync(file('src/data/sheikh-hadith.json'), 'utf8'));
for (const h of approved.hadith) used.add(`${h.c}:${h.n}`);
const deen = file('src/lib/deen/');
for (const f of fs.existsSync(deen) ? fs.readdirSync(deen) : []) {
  const s = fs.readFileSync(path.join(deen, f), 'utf8');
  for (const m of s.matchAll(/c:\s*'(\w+)',\s*n:\s*(\d+)/g)) used.add(`${m[1]}:${m[2]}`);
}

const NAME = { bukhari: 'Bukhari', muslim: 'Muslim' };
const out = [];
const nw = await edition('nawawi');
for (const h of nw) {
  if (!h.text) continue;
  const n = Number(h.hadithnumber);
  const meta = NAWAWI[n];
  if (!meta) throw new Error(`nawawi ${n}: no topic`);
  if (Number(h.arabicnumber) !== n) console.warn(`nawawi ${n}: arabicnumber ${h.arabicnumber}`);
  out.push({
    id: `h-n${n}`, kind: 'hadith', c: 'nawawi', n, text: tidy(h.text), ref: `an-Nawawi's Forty ${n}`,
    url: `https://sunnah.com/nawawi40:${n}`, topic: meta[0], ask: meta[1],
    ...(h.grades?.length ? { grade: h.grades } : {}), ...(meta[2] ? { note: meta[2] } : {}),
    theme: "an-Nawawi's Forty", status: 'pending',
  });
}
if (out.length !== Object.keys(NAWAWI).length) throw new Error(`nawawi: ${out.length} hadith`);

const eds = { bukhari: await edition('bukhari'), muslim: await edition('muslim') };
for (const p of PICKS) {
  const hs = eds[p.c].filter((x) => String(x.arabicnumber) === p.a);
  if (hs.length !== 1 || !hs[0].text) throw new Error(`${p.c} ${p.a}: ${hs.length} matches`);
  const h = hs[0];
  const [whole, dec] = p.a.split('.');
  const n = Number(whole);
  if (used.has(`${p.c}:${n}`)) throw new Error(`${p.c} ${n} is already in the Sheikh's library`);
  if (!p.kw.test(h.text)) throw new Error(`${p.c} ${p.a}: keyword ${p.kw} not in text`);
  const letter = dec ? 'abcdefghijklmnopqrstuvwxyz'[Number(dec) - 1] : '';
  const text = tidy(h.text);
  if (text.length > 450) console.warn(`${p.c} ${p.a}: ${text.length} characters`);
  out.push({
    id: `h-${p.c[0]}${n}`, kind: 'hadith', c: p.c, n, text, ref: `${NAME[p.c]} ${n}${letter}`,
    url: `https://sunnah.com/${p.c}:${n}${letter}`, topic: p.topic, ask: p.ask,
    ...(h.grades?.length ? { grade: h.grades } : {}),
    edition: { hadithnumber: h.hadithnumber, arabicnumber: h.arabicnumber, inbook: h.reference },
    keyword: String(p.kw), theme: p.theme, status: 'pending',
  });
}
const ids = new Set();
for (const x of out) { if (ids.has(x.id)) throw new Error(`duplicate id ${x.id}`); ids.add(x.id); }

const source = 'hadith-api by fawazahmed0 (The Unlicense), https://github.com/fawazahmed0/hadith-api; English of sunnah.com, numbering of sunnah.com';
fs.writeFileSync(file('scripts/sheikh/candidates/hadith.json'), JSON.stringify({
  source, status: 'Candidates for review by Ustadh Issah. None is approved; none is used by the site.',
  generated: new Date().toISOString().slice(0, 10), hadith: out,
}, null, 1) + '\n');

// ---- the review checklist
const words = (t, k = 25) => { const w = t.split(' '); return w.length > k ? w.slice(0, k).join(' ') + '…' : t; };
const groups = new Map();
for (const x of out) { if (!groups.has(x.theme)) groups.set(x.theme, []); groups.get(x.theme).push(x); }
let md = `# The Sheikh: candidate hadith for review\n\n`;
md += `- **Source:** [hadith-api](https://github.com/fawazahmed0/hadith-api) by fawazahmed0 (licence: The Unlicense). `;
md += `The English is sunnah.com's, with sunnah.com's numbering. Editions: \`eng-nawawi\`, \`eng-bukhari\`, \`eng-muslim\`.\n`;
md += `- **How the text was made:** taken from the downloaded edition by \`scripts/sheikh/candidates/hadith-candidates.mjs\`; only spacing is tidied, a backtick becomes ʿ, "(ﷺ)" becomes ﷺ and a missing closing quotation mark is added (the same tidy as the 40 approved hadith). Nothing is paraphrased or translated. Full texts: \`scripts/sheikh/candidates/hadith.json\`.\n`;
md += `- **Sahih Muslim numbers** carry sunnah.com's sub-letter (a = the edition's .01, b = .02 …). Please check the link opens the same text.\n`;
md += `- **an-Nawawi's Forty** is included whole (${out.filter((x) => x.c === 'nawawi').length} hadith). Some are not from Bukhari or Muslim; the source and grade are in the last words of each text. Items marked ⚠ may not suit children.\n`;
md += `- Status of every item: **pending**. Tick the box to approve; strike out to reject.\n\n`;
let i = 0;
for (const [theme, xs] of groups) {
  md += `## ${theme} (${xs.length})\n\n`;
  for (const x of xs) md += `- [ ] ${++i}) ${x.ref} — ${x.topic}${x.note ? ` ⚠ ${x.note}` : ''} — ${words(x.text)} (${x.url})\n`;
  md += '\n';
}
fs.mkdirSync(file('docs/sheikh-review/'), { recursive: true });
fs.writeFileSync(file('docs/sheikh-review/hadith.md'), md);
const count = (c) => out.filter((x) => x.c === c).length;
console.log(`${out.length} candidates: nawawi ${count('nawawi')}, bukhari ${count('bukhari')}, muslim ${count('muslim')}`);
