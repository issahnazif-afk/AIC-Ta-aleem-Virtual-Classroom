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
//   INTROS     the lines he says before each kind of quotation (one is chosen each time)
//   INTENTS    everyday things a student might say, and his answer (for the free, on-device understanding)

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
  // more ways to say the same things, so he does not sound the same every time
  'c-lovely-question': 'What a lovely question.',
  'c-let-me-share': 'Let me share something beautiful with you.',
  'c-ask-teacher-2': 'I want to tell you only what is right, and I do not have that one in our books. Your teacher will be happy to answer it, in sha’ Allah.',
  'c-memorise': 'A good way to memorise is a few ayat at a time. Listen first, repeat them many times, then recite them from memory.',
  'c-revise': 'Keep going over what you have already learnt, a little every day, so it stays with you.',
  'c-proud-2': 'Masha’Allah! Well done. Keep it up.',
  'c-sorry-2': 'Oh, I am sorry. I hope things feel better soon, in sha’ Allah.',
  'c-thanks-2': 'Thank you for sharing that with me.',
  'c-nice': 'That sounds lovely.',
  'c-you-too': 'And may Allah bless you too.',
};

// The library's quotations come with these openings; the classroom picks one each time, for variety.
export const INTROS = {
  hadith: ['Let me tell you what the Prophet ﷺ taught us.', 'Listen to this beautiful hadith.', 'The Prophet ﷺ said something lovely about this.'],
  ayah: ['Allah says in the Qur’an:', 'Listen to what Allah tells us in the Qur’an:'],
  seerah: ['Ibn Kathir tells us in his book of history:', 'Here is what Ibn Kathir wrote in his history:'],
};

// What each of the 40 extra hadith is about, in a few words. Used only to find the right hadith for what a student
// asks (never shown or said).
export const TOPICS = {
  'bukhari:68': 'learning a little at a time so we do not get bored', 'bukhari:75': 'a dua for knowledge and understanding of the Quran',
  'bukhari:77': 'the Prophet played with a little boy', 'bukhari:5027': 'the best people learn the Quran and teach it',
  'bukhari:5031': 'keeping the Quran you have memorised by revising it', 'bukhari:5033': 'revising the Quran so you do not forget it',
  'bukhari:5037': 'hearing someone recite reminded the Prophet of verses', 'bukhari:5049': 'the Prophet loved listening to others recite the Quran',
  'bukhari:5054': 'how long to take to finish reading the whole Quran', 'bukhari:5997': 'mercy and kindness to children, kissing children',
  'bukhari:6011': 'Muslims are like one body caring for each other', 'bukhari:6012': 'planting a tree or plant is charity',
  'bukhari:6065': 'do not hate or be jealous of each other, be like brothers', 'bukhari:6114': 'controlling your anger is real strength',
  'bukhari:6116': 'do not get angry', 'bukhari:6125': 'make things easy for people, not hard',
  'bukhari:6129': 'the Prophet was playful and kind with a child and his pet bird', 'bukhari:6136': 'be good to neighbours and guests, speak good or stay quiet',
  'bukhari:6168': 'you will be with the people you love', 'bukhari:6221': 'say alhamdulillah when you sneeze',
  'bukhari:6234': 'who should say salam first', 'bukhari:6236': 'feed people and say salam to everyone',
  'bukhari:6237': 'making up with a friend after a fight, the best one says salam first', 'bukhari:6244': 'repeating words so people understand',
  'bukhari:6464': 'small good deeds done every day are most loved by Allah', 'bukhari:6465': 'regular good deeds even if few, do what you can manage',
  'bukhari:6484': 'do not hurt others with your words or your hands', 'muslim:1914': 'moving something harmful out of the path',
  'muslim:2168': 'the Prophet said salam to children', 'muslim:2548': 'who deserves our kindness most: mother, mother, mother, then father',
  'muslim:2552': 'being kind to the friends of your father', 'muslim:2553': 'good character, and how to know right from wrong',
  'muslim:2564': 'Allah looks at your heart and deeds, not your looks or money', 'muslim:2588': 'charity, forgiving others and being humble',
  'muslim:2618': 'removing harm from the road', 'muslim:2624': 'being kind to neighbours',
  'muslim:2626': 'a cheerful smiling face is a good deed', 'muslim:2694': 'SubhanAllah wa bihamdihi, words light on the tongue and heavy on the scale',
  'muslim:2708': 'a dua when arriving at a new place', 'muslim:2732': 'making dua for your friend when they are not there',
};

// Questions a child might ask that a quotation answers directly. Used only for matching (never shown or said):
// each is checked to be answered by the words of that hadith or ayah.
export const ASK = {
  'h-mother': ['how should I treat my mother', 'who should I be most kind to', 'who deserves my kindness the most', 'why should I listen to my mum'],
  'h-m2548': ['who should I be good to first', 'is my mother more important than my father'],
  'h-neighbour': ['how should I treat my neighbours', 'why should I be nice to my neighbours'],
  'h-b6114': ['what should I do when I get angry', 'how do I control my anger', 'who is really strong'],
  'h-no-anger': ['is it bad to get angry', 'what did the Prophet say about anger'],
  'h-smile': ['is smiling a good deed', 'why should I smile at people', 'is a smile charity'],
  'h-truth': ['why should I tell the truth', 'is lying bad', 'why is it important to be honest'],
  'h-right-hand': ['which hand should I eat with', 'what do I say before I eat', 'how did the Prophet eat'],
  'h-praise-food': ['what do I say after I eat', 'what should I say when I finish my food'],
  'h-sit-drink': ['should I drink sitting or standing', 'can I drink standing up'],
  'h-three-sips': ['how did the Prophet drink water'],
  'h-salam': ['why do we say salam', 'why do we say assalamu alaykum'],
  'h-b6234': ['who should say salam first', 'should the younger person greet the older one first'],
  'h-b6237': ['what should I do if I had a fight with my friend', 'my friend and I are not talking, what should I do', 'how do I make up with my friend'],
  'h-animals': ['should I be kind to animals', 'what did the Prophet say about animals', 'is it good to give water to animals'],
  'h-b6012': ['is planting a tree a good deed', 'is it good to plant trees'],
  'h-learn': ['why should I learn about Islam', 'is learning about my deen good', 'why should I go to madrasa'],
  'h-b5027': ['why is it good to learn the Quran', 'who are the best people', 'is teaching the Quran good'],
  'h-b5033': ['how do I stop forgetting the Quran', 'why do I keep forgetting my surah'],
  'h-b6464': ['is a small good deed worth it', 'what deeds does Allah love most', 'is it better to do a little every day'],
  'h-help-home': ['should I help my parents at home', 'did the Prophet help at home'],
  'h-yawn': ['what should I do when I yawn'],
  'h-b6221': ['what do I say when I sneeze', 'what do we say after sneezing'],
  'h-brush': ['should I brush my teeth', 'what is a miswak'],
  'h-sleep-right': ['how should I sleep', 'what side should I sleep on', 'what should I do before I go to bed'],
  'h-clean': ['why should I be clean', 'is being clean part of Islam'],
  'h-share-food': ['should I share my food', 'is sharing food good'],
  'h-half-date': ['is giving a little charity worth it', 'can I give a small charity'],
  'h-thank-people': ['should I thank people', 'why should I say thank you'],
  'h-good-word': ['is a kind word a good deed', 'is saying something nice charity'],
  'h-gentle': ['why should I be gentle', 'is being gentle good'],
  'h-dua-others': ['can I make dua for my friend', 'should I make dua for others'],
  'h-subhanallah': ['what dhikr can I say', 'what is a good dhikr to say every day'],
  'h-jumuah': ['what is the best day of the week', 'why is Friday special'],
  'h-qadr': ['when is laylatul qadr', 'when should I look for laylat al qadr'],
  'h-monday': ['why did the Prophet fast on Mondays', 'which day was the Prophet born'],
  'h-l-63': ['how old was the Prophet when he died', 'when did the Prophet pass away'],
  'h-l-shepherd': ['did the Prophet look after sheep', 'what job did the Prophet do when he was young'],
  'h-l-hira': ['where did the Prophet go to worship before Islam', 'what is the cave of Hira'],
  'h-l-cave': ['what happened in the cave of Thawr', 'who was with the Prophet in the cave during the hijrah'],
  'h-v-children-story': ['was the Prophet kind to children', 'did the Prophet play with children'],
  'q-94-6': ['what if things are hard for me', 'will things get easier'],
  'q-2-286': ['what if I cannot do everything', 'does Allah give us more than we can handle'],
  'q-13-28': ['how can my heart feel calm', 'what makes the heart peaceful'],
  'q-112-1': ['how many gods are there', 'who is Allah'],
  'q-2-186': ['does Allah hear my dua', 'is Allah close to me'],
  'q-67-19': ['can Allah see me', 'does Allah see everything'],
  'q-39-62': ['who created everything', 'who made the world'],
  'q-17-34': ['should I keep my promises', 'is breaking a promise bad'],
  // Ibn Kathir: passages that answer a question on their own
  's-b-agreed': ['when was the Prophet born', 'which year was the Prophet born'],
  's-b-halima': ['who looked after the Prophet when he was a baby', 'who was Halima'],
  's-t-marry': ['how old was the Prophet when he married Khadija', 'when did the Prophet marry Khadija'],
  's-f-khadija': ['who was the first person to believe in the Prophet', 'who was the first Muslim'],
  's-r-ramadan': ['in which month did the revelation start', 'when did the Prophet become a prophet'],
  's-hj-when': ['when did the hijrah happen', 'when did the Prophet migrate to Madinah'],
  's-hj-quba': ['what was the first masjid', 'which masjid did the Prophet build first'],
  's-bd-313': ['how many Muslims were at Badr', 'how many companions fought at Badr'],
  's-bd-date': ['when was the battle of Badr'],
  's-ud-name': ['why is the mountain called Uhud', 'what is Uhud'],
  's-kh-dig': ['why did the Muslims dig a trench', 'what was the battle of the trench'],
  's-bl-who': ['who was Bilal'],
  's-e-meaning': ['what happened to the people of the elephant', 'why did Allah protect the Kaaba from the elephant army'],
  's-z-title': ['who dug the well of Zamzam again', 'who found Zamzam again'],
  's-k-stones': ['did the Prophet help build the Kaaba'],
  's-h-sameyear': ['what was the year of sadness', 'when did Khadija and Abu Talib die'],
  's-fw-monday': ['on which day did the Prophet pass away'],
};

// Everyday things a student might say, with what he answers. The examples are matched by meaning, not word for word.
export const INTENTS = [
  { say: ['c-who'], ex: ['who are you', 'what is your name', 'what do you do', 'are you my teacher'] },
  { say: ['c-computer'], ex: ['are you a robot', 'are you real', 'are you a real person', 'are you a computer', 'are you AI', 'is this a recording'] },
  { say: ['c-feel-good'], ex: ['how are you', 'how are you sheikh', 'how is your day', 'are you okay'] },
  { say: ['c-welcome'], ex: ['thank you', 'thanks sheikh', 'jazakallah khair', 'thank you so much'] },
  { say: ['c-jazak'], ex: ['you are nice', 'I like you sheikh', 'you are the best', 'you are kind'] },
  { say: ['c-you-too'], ex: ['may Allah bless you', 'Allah bless you sheikh', 'may Allah reward you'] },
  { say: ['c-bye'], ex: ['goodbye', 'bye sheikh', 'see you later', 'I have to go now'] },
  { say: ['c-sorry-loss'], ex: ['my grandma died', 'my grandfather passed away', 'someone in my family died', 'my cat died', 'my pet died'] },
  { say: ['c-get-well'], ex: ['I am sick', 'I have a fever', 'I have a cold', 'my tummy hurts', 'I have a headache', 'I feel ill'] },
  { say: ['c-worried'], ex: ['I am scared of my test', 'I am nervous', 'I am worried', 'I have an exam tomorrow and I am scared'] },
  { say: ['c-sorry-2'], ex: ['I am sad', 'I feel sad today', 'I had a bad day', 'I am upset'] },
  { say: ['c-proud-2'], ex: ['I got good marks', 'I won a prize', 'I finished my surah', 'I memorised a new surah', 'I prayed all five prayers'] },
  { say: ['c-wonderful'], ex: ['my baby sister was born', 'we have a new baby', 'I am going to umrah', 'I went to the masjid'] },
  { say: ['c-nice', 'c-back'], ex: ['I like football', 'I played a game today', 'I had pizza', 'I like drawing', 'we went to the park'] },
  { say: ['c-memorise'], ex: ['how can I memorise better', 'how do I memorise the Quran', 'what is the best way to memorise', 'memorising is hard'] },
  { say: ['c-revise'], ex: ['I keep forgetting my surah', 'how do I stop forgetting', 'I forgot what I memorised'] },
  { say: ['c-hard'], ex: ['this is too hard', 'I cannot do it', 'reciting is difficult for me'] },
  { say: ['c-duas'], ex: ['what dua do I say before sleeping', 'teach me a dua', 'what dua do I say before eating', 'what is the dua for'] },
  { say: ['c-seerah'], ex: ['tell me about the life of the Prophet', 'tell me a story about the Prophet', 'what happened in the seerah'] },
  { say: ['c-stories'], ex: ['tell me a story', 'can you tell me a story', 'I want a story'] },
  { say: ['c-eid'], ex: ['eid mubarak', 'it is eid', 'happy eid'] },
  { say: ['c-ramadan'], ex: ['ramadan mubarak', 'I am fasting today', 'I fasted today'] },
  { say: ['c-school'], ex: ['I have a lot of homework', 'school is hard', 'I started a new school'] },
  { say: ['c-ready'], ex: ['let us start', 'I am ready', 'can we start now', 'start the recitation'] },
];



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
      out.push({ id: `h-${h.c[0]}${h.n}`, kind: 'hadith', topic: TOPICS[k], text: h.en, ref: ref(h), url: url(h) });
    }

    // the ayat of the Reading Library, with the school's English meaning
    const libs = await Promise.all(['level1', 'level2', 'added', 'tawheed', 'prophets'].map((f) => import(`./library/${f}.mjs`).catch(() => ({}))));
    for (const m of libs) for (const b of Object.values(m).flat()) {
      const q = b?.quran;
      if (!q?.en || !q.s) continue;
      const id = `q-${q.s}-${q.a}`;
      if (out.some((x) => x.id === id)) continue;
      out.push({ id, kind: 'ayah', text: q.en, ref: `Qur’an ${q.s}:${q.a}`, url: `https://quran.com/${q.s}/${q.a}` });
    }

    // Ibn Kathir: the established passages of short enough length to say in a chat
    const src = await loadJson('../data/seerah/sources.json');
    const { EPISODES } = await import('./seerah/episodes.mjs');
    for (const p of src?.passages ?? []) {
      if (p.class !== 'established' || !p.en || p.en.length > 600) continue;
      out.push({ id: `s-${p.id}`, kind: 'seerah', topic: EPISODES[p.episode - 1]?.title ?? `episode ${p.episode}`, text: p.en, ref: `Ibn Kathir, al-Bidaya wa'l-Nihaya ${p.vol}/${p.page}` });
    }
    for (const x of out) if (x.kind !== 'line') x.intro = INTROS[x.kind][0];
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
