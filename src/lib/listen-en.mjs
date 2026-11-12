// Talking to the Sheikh: the student answers his questions out loud, in English.
// Uses the browser's own speech recognition (Chrome, Edge, Safari on iPad/iPhone/Mac). Where there is none
// (Firefox) the student taps the answer instead. The words heard are matched to one of the Sheikh's answers.
//
//   canListen()                                   is there speech recognition in this browser?
//   listen({ onWords, maxMs }) → { done: Promise<{ heard: string[] } | { error }>, stop() }
//   matchReply(heard, options) → the option the student meant, or null
const Rec = () => (typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null);
export const canListen = () => !!Rec();

export function listen({ onWords, maxMs = 9000, lang = 'en-US' } = {}) {
  const R = Rec();
  if (!R) return { done: Promise.resolve({ error: 'unsupported' }), stop() {} };
  const rec = new R();
  rec.lang = lang; rec.continuous = false; rec.interimResults = true; rec.maxAlternatives = 4;
  let finals = [], last = '', error = null, settled = false, timer = null;
  let resolve;
  const done = new Promise((r) => (resolve = r));
  const finish = () => {
    if (settled) return; settled = true; clearTimeout(timer);
    if (finals.length) resolve({ heard: finals });
    else if (last) resolve({ heard: [last] });
    else resolve(error ? { error } : { heard: [] });
  };
  rec.onresult = (e) => {
    let text = '';
    for (let i = 0; i < e.results.length; i++) {
      const r = e.results[i];
      text += r[0].transcript;
      if (r.isFinal) finals = Array.from(r).map((a) => a.transcript.trim()).filter(Boolean);
    }
    last = text.trim();
    onWords?.(last);
  };
  rec.onerror = (e) => { error = e.error || 'error'; };
  rec.onend = finish;
  try { rec.start(); } catch { error = 'not-allowed'; finish(); }
  timer = setTimeout(() => { try { rec.stop(); } catch {} setTimeout(finish, 1200); }, maxMs);
  return { done, stop() { try { rec.abort(); } catch {} finish(); } };
}

// The ways a child might say each answer. The answer's own words always count too; a longer phrase that matches
// beats a shorter one, so "not good" goes to "Not so good" and not to "I am good".
const SYN = {
  'Alhamdulillah, I am good': ['good', 'fine', 'great', 'well', 'alhamdulillah', 'okay', 'ok', 'happy', 'awesome', 'amazing', 'im good', 'very good'],
  'A little tired': ['tired', 'sleepy', 'exhausted', 'a bit tired', 'little tired'],
  'Not so good': ['not good', 'not so good', 'not great', 'not well', 'not fine', 'not okay', 'bad', 'sad', 'sick', 'unwell', 'upset', 'ill'],
  'Much better, alhamdulillah': ['better', 'much better', 'good', 'fine', 'great', 'yes', 'yeah', 'alhamdulillah'],
  'Still the same': ['same', 'still', 'not better', 'no', 'not really', 'still tired'],
  'Yes, alhamdulillah': ['yes', 'yeah', 'yep', 'better', 'fine', 'good', 'alhamdulillah'],
  'Not fully yet': ['not yet', 'not fully', 'no', 'still', 'not really', 'a bit', 'a little'],
  'Yes, a bit': ['yes', 'yeah', 'yep', 'calmer', 'a bit', 'better'],
  'Still busy': ['still busy', 'busy', 'no', 'not really'],
  'Yes, it was good': ['yes', 'yeah', 'good', 'great', 'fun', 'nice', 'amazing', 'lovely'],
  'It was tiring': ['tiring', 'tired', 'long', 'exhausting', 'not good', 'not really'],
  'Better, I remembered': ['better', 'remembered', 'yes', 'yeah', 'good', 'i remember'],
  'I still forget sometimes': ['forget', 'forgot', 'sometimes', 'not really', 'no'],
  'I was busy with school': ['busy', 'school', 'homework', 'exam', 'exams', 'test', 'tests', 'studying'],
  'I forgot': ['forgot', 'forget', 'didnt remember', 'did not remember'],
  'I was unwell': ['sick', 'ill', 'unwell', 'fever', 'cold', 'flu', 'hospital', 'not well', 'poorly', 'doctor'],
  'I was travelling': ['travel', 'travelling', 'traveling', 'travelled', 'traveled', 'trip', 'holiday', 'vacation', 'visiting', 'away'],
  'I recited with my teacher': ['teacher', 'class', 'madrasa', 'madrasah', 'masjid', 'mosque', 'ustadh', 'ustadha', 'sheikh'],
  'I would rather not say': ['rather not', 'dont want', 'do not want', 'not say', 'private', 'no reason', 'nothing', 'secret'],
  'Going well': ['well', 'good', 'great', 'yes', 'fine', 'going well'],
  'I have started': ['started', 'start', 'starting', 'beginning', 'a little', 'some'],
  'Not started yet': ['not started', 'not yet', 'havent', 'have not', 'no'],
  'Yes, I will': ['yes', 'yeah', 'yep', 'sure', 'okay', 'ok', 'i will', 'alright', 'inshallah', 'in sha allah', 'insha allah', 'of course'],
  'Can you explain more?': ['explain', 'dont understand', 'do not understand', 'what do you mean', 'how', 'more', 'again', 'confused', 'what'],
  'Yes, I did it': ['yes', 'yeah', 'yep', 'did', 'done', 'finished', 'managed', 'i did'],
  'Not yet': ['not yet', 'no', 'didnt', 'did not', 'nope', 'forgot', 'not really'],
  'Juz ʿAmma': ['juz', 'amma', 'juz amma', 'jazz', 'last juz', 'thirtieth'],
  'Surah al-Mulk': ['mulk', 'al mulk', 'mulke', 'milk'],
  'Surah Yasin': ['yasin', 'yaseen', 'ya seen', 'yasseen', 'yassin'],
  'Surah al-Kahf': ['kahf', 'al kahf', 'kaf', 'calf', 'cave'],
  'I am not sure yet': ['not sure', 'dont know', 'do not know', 'no idea', 'maybe', 'unsure'],
  'My mum': ['mum', 'mom', 'mother', 'mommy', 'mummy', 'ummi', 'mama', 'ammi'],
  'My dad': ['dad', 'father', 'daddy', 'baba', 'abi', 'abbu', 'papa'],
  'My brother or sister': ['brother', 'sister', 'sibling', 'siblings'],
  'My grandparent': ['grandma', 'grandpa', 'grandmother', 'grandfather', 'nana', 'nani', 'teta', 'granny', 'grandparent', 'grandparents', 'jiddo', 'dada'],
  'Only my teacher': ['teacher', 'nobody', 'no one', 'only', 'ustadh', 'ustadha', 'sheikh'],
  'After Fajr': ['fajr', 'fudger', 'fajar', 'morning', 'dawn'],
  'After school': ['school', 'afternoon'],
  'After Maghrib': ['maghrib', 'magrib', 'evening', 'sunset'],
  'Before bed': ['bed', 'night', 'sleep', 'bedtime', 'sleeping'],
  'I love it': ['love', 'like', 'enjoy', 'great', 'fun', 'amazing'],
  'It is okay': ['okay', 'ok', 'fine', 'alright', 'its ok', 'not bad'],
  'It is hard for me': ['hard', 'difficult', 'tough', 'not easy', 'struggle'],
  'No questions, let us begin': ['no', 'nope', 'nothing', 'no questions', 'no question', 'no thanks', 'no thank you', 'not really', 'begin', 'start', 'lets begin', 'lets start', 'bismillah', 'ready'],
  'Bismillah, let us begin': ['bismillah', 'begin', 'start', 'ready', 'go', 'lets go', 'lets start', 'yes', 'yeah', 'ok', 'okay'],
};
const norm = (s) => ' ' + String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ’'ʿ]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
const STOP = new Set(['a', 'i', 'am', 'is', 'it', 'my', 'me', 'the', 'was', 'with', 'or', 'for', 'can', 'you', 'us', 'let', 'have', 'surah', 'al']);

export function matchReply(heard, options) {
  let best = null, score = 0;
  for (const alt of heard ?? []) {
    const h = norm(alt);
    if (!h.trim()) continue;
    for (const opt of options) {
      const own = norm(opt).trim();
      const phrases = [own, ...(SYN[opt] ?? []).map((p) => norm(p).trim()), ...own.split(' ').filter((w) => w.length > 2 && !STOP.has(w))];
      let s = 0;
      for (const p of phrases) if (p && h.includes(' ' + p + ' ')) s = Math.max(s, p.split(' ').length * 2 + (p === own ? 4 : 0));
      if (s > score) { score = s; best = opt; }
    }
    if (best) break;    // the recogniser's first guess that matches anything wins
  }
  return best;
}
