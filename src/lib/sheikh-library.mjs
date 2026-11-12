// Everything the Sheikh can say when a student talks to him freely (src/lib/sheikh-chat.mjs).
//
// An AI model listens to what the student said and chooses lines from this library by their id. It never writes
// a word of its own, so the Sheikh cannot make anything up: every line here is either
//   • a short, everyday line (LINES below: warmth, encouragement, "ask your teacher"), with no religious claims, or
//   • a quotation, word for word, from the site's checked sources, with its reference:
//       - the hadith of My Deen (src/lib/deen/: checked against the hadith text and approved by Ustadh Issah),
//       - the hadith in src/data/sheikh-hadith.json (Sahih al-Bukhari and Sahih Muslim, English of sunnah.com,
//         from hadith-api; see scripts/sheikh/hadith.mjs),
//       - the ayat of the Reading Library (Tanzil text, the school's own English meaning),
//       - Ibn Kathir, al-Bidaya wa'l-Nihaya (src/data/seerah/sources.json: the "established" passages only).
// Each line is recorded in the Sheikh's voice at build time (scripts/voice/narration-list.mjs), like all he says.
//
//   library() → [{ id, kind: 'line' | 'hadith' | 'ayah' | 'seerah', text, intro?, ar?, ref?, url?, topic? }]
//   INTRO      the line he says before each kind of quotation

export const LINES = {
  'c-glad': 'Alhamdulillah! I am so happy to hear that.',
  'c-proud': 'Masha’Allah! I am proud of you.',
  'c-wonderful': 'Masha’Allah, that is wonderful.',
  'c-sorry': 'I am sorry to hear that. May Allah make it easy for you.',
  'c-sorry-loss': 'I am so sorry. That is very sad. May Allah give you and your family patience and comfort.',
  'c-get-well': 'May Allah grant you a quick recovery. Rest well, and come back when you are ready.',
  'c-tired': 'That is all right. We will go gently today. Even a little, done well, is good.',
  'c-worried': 'It is normal to feel worried sometimes. Make dua, do your best, and leave the rest to Allah.',
  'c-thanks': 'Thank you for telling me.',
  'c-welcome': 'You are most welcome. May Allah bless you.',
  'c-jazak': 'Jazak Allahu khayran. That is very kind of you.',
  'c-good-question': 'That is a very good question.',
  'c-ask-teacher': 'I only tell you what I can find in our books, and I do not have an answer for that one. Please ask your teacher or your parents, in sha’ Allah.',
  'c-not-sure': 'I am not sure about that, and I do not want to tell you something that is not right. Your teacher will know.',
  'c-tell-adult': 'Thank you for telling me. That sounds important. Please tell your parents or your teacher about it today. They care about you and they can help.',
  'c-who': 'I am the Sheikh of this classroom. I listen to your recitation and help you learn, in sha’ Allah.',
  'c-computer': 'I am a computer helper made for your school. Your real teachers are the best people to ask about anything important.',
  'c-feel-good': 'Alhamdulillah, I am well, thank you for asking. And I am happy to see you here.',
  'c-smile': 'That made me smile!',
  'c-back': 'Now, let us come back to our Quran.',
  'c-keep-going': 'Keep going, step by step. Allah loves the one who keeps trying.',
  'c-every-day': 'A little every day is better than a lot once in a while.',
  'c-practice': 'The more you recite, the easier it becomes. Let us practise together.',
  'c-try': 'Let us try together. I am here to help you.',
  'c-hard': 'I know it can feel hard. We will go one small step at a time, and I will help you.',
  'c-mistakes': 'Mistakes are how we learn. Do not worry about them. I will help you fix them.',
  'c-listen-first': 'A good way to start is to listen to the reciter first, then read it yourself, slowly.',
  'c-my-deen': 'You can find that in My Deen, in the classroom. Have a look after our recitation.',
  'c-duas': 'You can learn that dua in My Deen, under My Duas.',
  'c-stories': 'You can read more stories like that in Story Time and the Reading Library.',
  'c-seerah': 'You can travel through the life of the Prophet, peace be upon him, in the Seerah Quest.',
  'c-family': 'May Allah bless your family and keep you all together.',
  'c-parents': 'May Allah reward your parents for all they do for you.',
  'c-friend': 'Good friends are a blessing. Choose friends who help you to be good.',
  'c-kind': 'Being kind is always the best choice.',
  'c-sorry-say': 'Saying sorry and making peace is brave. I am proud of you for thinking about it.',
  'c-pray': 'Remember to pray on time. It brings peace to the heart.',
  'c-ramadan': 'May Allah bless you and accept your good deeds.',
  'c-eid': 'Eid Mubarak! May Allah fill your days with happiness.',
  'c-school': 'May Allah bless your studies and make them easy for you.',
  'c-inshallah': 'In sha’ Allah, you will do well.',
  'c-ameen': 'Ameen.',
  'c-kind-words': 'Let us keep our words kind and gentle, in sha’ Allah.',
  'c-again': 'Sorry, I did not quite catch that. Could you say it again?',
  'c-ready': 'Whenever you are ready, we can begin.',
  'c-bye': 'Assalamu alaykum. May Allah keep you safe. I look forward to our next recitation.',
};

export const INTRO = {
  hadith: 'Let me tell you what the Prophet ﷺ taught us.',
  ayah: 'Allah says in the Qur’an:',
  seerah: 'Ibn Kathir tells us in his book of history:',
};

const REF = { bukhari: 'Bukhari', muslim: 'Muslim', abudawud: 'Abu Dawud', tirmidhi: 'Tirmidhi', nasai: "an-Nasa'i", ibnmajah: 'Ibn Majah' };
const ref = (r) => `${REF[r.c] ?? r.c} ${r.n}`;
const url = (r) => `https://sunnah.com/${r.c}:${r.n}`;

let built = null;
export function library() {
  built ??= (async () => {
    const out = [];
    const seen = new Set();
    for (const [id, text] of Object.entries(LINES)) out.push({ id, kind: 'line', text });

    // My Deen (approved)
    const hadith = (id, topic, who, x, src) => {
      if (!x?.en || !src) return;
      const k = `${src.c}:${src.n}:${x.en}`;
      if (seen.has(k)) return; seen.add(k);
      out.push({ id, kind: 'hadith', topic, text: `${who ?? ''} ${x.en}`.trim(), ar: x.ar, ref: ref(src), url: url(src) });
    };
    const [{ SUNNAH }, { VIRTUES, LIFE }, { DAYS }] = await Promise.all([import('./deen/sunnah.mjs'), import('./deen/prophet.mjs'), import('./deen/days.mjs')]);
    for (const s of SUNNAH) hadith(`h-${s.id}`, s.title, s.who, s, s.src[0]);
    for (const v of VIRTUES) { hadith(`h-${v.id}`, v.title, v.hadith.who, v.hadith, v.hadith.src); if (v.story) hadith(`h-${v.id}-story`, v.title, v.story.who, v.story, v.story.src); }
    for (const l of LIFE) if (l.quote) hadith(`h-${l.id}`, l.title, l.quote.who, l.quote, l.src);
    for (const d of DAYS) if (d.quote) hadith(`h-${d.id}`, d.title, d.quote.who, d.quote, d.src);

    // Sahih al-Bukhari and Sahih Muslim (src/data/sheikh-hadith.json)
    const extra = await loadJson('../data/sheikh-hadith.json');
    for (const h of extra?.hadith ?? []) {
      const k = `${h.c}:${h.n}`;
      if ([...seen].some((s) => s.startsWith(k + ':'))) continue;
      out.push({ id: `h-${h.c[0]}${h.n}`, kind: 'hadith', text: h.en, ref: ref(h), url: url(h) });
    }

    // the ayat of the Reading Library, with the school's English meaning
    const libs = await Promise.all(['level1', 'level2', 'added', 'tawheed', 'prophets'].map((f) => import(`./library/${f}.mjs`).catch(() => ({}))));
    for (const m of libs) for (const b of Object.values(m).flat()) {
      const q = b?.quran;
      if (!q?.en || !q.s) continue;
      const id = `q-${q.s}-${q.a}`;
      if (out.some((x) => x.id === id)) continue;
      out.push({ id, kind: 'ayah', topic: b.title, text: q.en, ref: `Qur’an ${q.s}:${q.a}`, url: `https://quran.com/${q.s}/${q.a}` });
    }

    // Ibn Kathir: the established passages of short enough length to say in a chat
    const src = await loadJson('../data/seerah/sources.json');
    const { EPISODES } = await import('./seerah/episodes.mjs');
    for (const p of src?.passages ?? []) {
      if (p.class !== 'established' || !p.en || p.en.length > 600) continue;
      out.push({ id: `s-${p.id}`, kind: 'seerah', topic: EPISODES[p.episode - 1]?.title ?? `episode ${p.episode}`, text: p.en, ref: `Ibn Kathir, al-Bidaya wa'l-Nihaya ${p.vol}/${p.page}` });
    }
    for (const x of out) if (x.kind !== 'line') x.intro = INTRO[x.kind];
    return out;
  })();
  return built;
}

// built at build time only (Node): scripts/sheikh/library.mjs writes it to public/data/sheikh-library.json, which
// the classroom and the class server read
async function loadJson(rel) {
  const fs = await import('node:fs');
  return JSON.parse(fs.readFileSync(new URL(rel, import.meta.url), 'utf8'));
}
