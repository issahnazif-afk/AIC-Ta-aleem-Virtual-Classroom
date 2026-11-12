// A word with the Sheikh before every recitation (Hifz test, Follow my recitation, Mujawwadah, Recite).
//
// The Sheikh builds a bond with the student over time. Everything he learns is kept in the student's own progress
// (progress.sheikh, saved to the class server with the rest of their progress, so it follows them to any device):
//   • he greets the student by name and asks how they are; next time he asks about it again ("Last time you were
//     feeling tired. How are you now?")
//   • after 2 or more days away he says "I observe you have missed your recitation for N days. What could be the
//     reason?", saves the answer, and asks after it next time ("Are you feeling better now?")
//   • one getting-to-know-you question per visit (a goal surah, who helps at home, a favourite time to recite),
//     remembered and brought up later
//   • he reads the student's recitation history (progress.recits) for their most common difficulty (stopping and
//     needing the next word, wrong words, going back, unclear words, or one ayah that keeps being tricky) and
//     starts a step-by-step plan to fix it; at each visit he asks about the current step and moves on when it is done
//   • advice is only ever an ayah or a hadith that is already in the site's checked sources (see ADVICE), shown with
//     its reference; the Sheikh never adds religious claims of his own
// He never scolds and never compares the student with anyone. The student can skip at any time.
//
//   history(progress) / remember(progress, entry)       the recitation history (newest last, the last 30 kept)
//   observations({ progress, mode, range })            what the Sheikh has noticed (used by the chat; tested alone)
//   sheikhChat(host, { name, mode, range, label, progress, onSave, micButton, onMic }) → Promise (resolves when it is time to recite)
//
// He speaks with a recorded human voice (an older man; see allSpoken below), and the student can answer him out loud:
// after each question he listens (the browser's speech recognition, English), and what the student says is matched
// to one of the answers (src/lib/listen-en.mjs). The answers are always there to tap as well.
//
// When the class server has an AI key (think, below), he also understands answers in the student's own words, and
// before the recitation the student can ask him anything. An AI model chooses his reply from his library
// (src/lib/sheikh-library.mjs): everyday lines and quotations from the site's checked sources, all recorded in his
// voice. The model can only choose ids from that library, so he never says anything that is not in it.
//   think: { on() → Promise<boolean>, talk({ phase, question, options, said, recent }) → Promise<{ ok, answer, say }> }

import { VOICES, clipKey } from './narration-text.mjs';
import { canListen, listen, matchReply } from './listen-en.mjs';

const DAY = 86400000;
const dayKey = (t) => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };
const daysBetween = (a, b) => Math.round((new Date(new Date(b).toDateString()) - new Date(new Date(a).toDateString())) / DAY);
const ago = (n) => (n === 0 ? 'earlier today' : n === 1 ? 'yesterday' : `${n} days ago`);
const pick = (xs) => xs[Math.floor(Math.random() * xs.length)];

// ── the recitation history ───────────────────────────────────
export function history(progress) { return Array.isArray(progress?.recits) ? progress.recits : []; }
export function remember(progress, entry) {
  progress.recits = history(progress).concat([{ at: Date.now(), ...entry }]).slice(-30);
}
// what the Sheikh knows about the student, and what was said
function mind(progress) {
  progress.sheikh ??= {};
  const m = progress.sheikh;
  m.know ??= {}; m.notes ??= []; m.asked ??= [];
  return m;
}
function note(m, topic, q, a) { m.notes.push({ at: Date.now(), topic, q, a }); m.notes = m.notes.slice(-60); }

const overlaps = (a, b) => a && b && !(a.s2 < b.s1 || b.s2 < a.s1 || (a.s2 === b.s1 && (a.a2 ?? 999) < (b.a1 ?? 1)) || (b.s2 === a.s1 && (b.a2 ?? 999) < (a.a1 ?? 1)));

// ── the student's most common difficulty, from the last sessions ──
// Each finished recitation keeps its counts (words, wrong, prompt, hint, back, unclear) and its tricky ayahs.
export function difficulty(progress) {
  const h = history(progress).slice(-6).filter((x) => x.counts?.words);
  if (h.length < 2) return null;
  const sum = (k) => h.reduce((n, x) => n + (x.counts[k] ?? 0), 0);
  const words = sum('words') || 1;
  // an ayah that was tricky in two or more sessions
  const seen = {};
  for (const x of h) for (const w of new Set(x.weak ?? [])) seen[w] = (seen[w] ?? 0) + 1;
  const ayah = Object.entries(seen).sort((a, b) => b[1] - a[1]).find(([, n]) => n >= 2)?.[0];
  const rate = { prompt: (sum('prompt') + sum('hint')) / words, wrong: sum('wrong') / words, back: sum('back') / words, unclear: sum('unclear') / words };
  const [kind, r] = Object.entries(rate).sort((a, b) => b[1] - a[1])[0];
  if (ayah && r < 0.08) return { kind: 'ayah', ayah, sessions: seen[ayah] };
  if (r >= 0.04) return { kind, rate: Math.round(r * 100), ayah };
  if (ayah) return { kind: 'ayah', ayah, sessions: seen[ayah] };
  return null;
}

// The plans: each step is something the student can do in the classroom, in order. The Sheikh asks about the
// current step at the next visit, and moves on when the student has done it.
const PLANS = {
  prompt: { name: 'remembering the ayat without stopping', why: 'You often stop and need me to give you the next word. That is a sign the passage needs a little more time to settle in your memory.', steps: [
    'Listen to the passage three times from the reciter: open Mujawwadah and press Listen on each ayah.',
    'Read the passage five times slowly from the mushaf in Mujawwadah, looking at every word.',
    'Recite it from memory three ayat at a time with Follow my recitation. Only move on when those three are smooth.',
    'Join the parts together: recite the whole passage with Follow my recitation.',
    'The next day, take a Hifz test on the same passage to check it has stayed.',
  ] },
  wrong: { name: 'saying every word correctly', why: 'Some words come out as a different word. That usually means reading a little too fast, or a word that was learned slightly wrong at the start.', steps: [
    'Open Mujawwadah, press Listen, and follow the reciter with your finger under every word.',
    'Look at your last report. Read each word that was marked wrong three times, slowly.',
    'Read the whole passage once more in Mujawwadah, slowly and clearly, one ayah at a time.',
    'Recite it again and try to have fewer wrong words than last time.',
  ] },
  back: { name: 'reciting smoothly without going back', why: 'You often go back and start again. It is good to correct yourself, but we want the recitation to flow.', steps: [
    'Read the passage in Mujawwadah, ayah by ayah, and finish each ayah before you stop to breathe.',
    'Listen to the reciter once and notice where he pauses.',
    'Recite the passage again and keep going even if you are not sure. I will help you if you stop.',
  ] },
  unclear: { name: 'reciting clearly so I can hear every word', why: 'I could not hear some of your words clearly.', steps: [
    'Sit in a quiet place, close to the microphone, and recite in a clear, steady voice.',
    'Read the passage slowly in Mujawwadah, giving every letter its full sound.',
    'Recite again. If a word is still unclear, slow down a little more.',
  ] },
  ayah: { name: 'one ayah that keeps being tricky', why: '', steps: [
    'Open Mujawwadah on that ayah and press Listen three times.',
    'Read that ayah five times from the mushaf, slowly.',
    'Recite it from memory five times with Follow my recitation, starting from the ayah before it so the join is strong.',
    'Recite the whole passage with that ayah in it.',
  ] },
};

// ── advice: only from the site's checked sources ─────────────
// Each item names where it is in the site, and its text is taken from there at run time (nothing is typed here).
//   hadith: a hadith in Story Time (src/lib/stories/level1.mjs) or the Sunnah set (src/lib/deen/sunnah.mjs)
//   ayah: an ayah in the Reading Library (src/lib/library/level1.mjs) or My Du'as (src/lib/deen/duas.mjs)
const ADVICE = {
  regular: { from: 'story-hadith', match: '6464', intro: 'The Prophet ﷺ said:' },
  knowledge: { from: 'sunnah', id: 'learn', intro: 'The Prophet ﷺ said:' },
  gentle: { from: 'sunnah', id: 'gentle', intro: 'The Prophet ﷺ said:' },
  rest: { from: 'library', s: 13, a: 28, intro: 'Allah says in the Qur’an:' },
  ease: { from: 'library', s: 94, a: 6, intro: 'Allah says in the Qur’an:' },
  able: { from: 'library', s: 2, a: 286, intro: 'Allah says in the Qur’an:' },
  more: { from: 'dua', id: 'knowledge', intro: 'A du’a from the Qur’an to say before we begin:' },
};
export async function advice(key) {
  const a = ADVICE[key];
  if (!a) return null;
  try {
    if (a.from === 'sunnah') {
      const [{ SUNNAH }, { refText, refUrl }] = await Promise.all([import('./deen/sunnah.mjs'), import('./deen/refs.mjs')]);
      const h = SUNNAH.find((x) => x.id === a.id);
      return h && { intro: a.intro, ar: h.ar, en: h.en, ref: h.src.map(refText).join(', '), url: refUrl(h.src[0]) };
    }
    if (a.from === 'story-hadith') {
      const { STORIES } = await import('./stories/level1.mjs');
      const h = STORIES.map((s) => s.hadith).find((x) => x?.src?.includes(a.match));
      return h && { intro: a.intro, ar: h.ar, en: h.en, ref: h.src };
    }
    if (a.from === 'library' || a.from === 'dua') {
      let q = null, en = null;
      if (a.from === 'library') {
        const { LEVEL1 } = await import('./library/level1.mjs');
        const b = LEVEL1.find((x) => x.quran?.s === a.s && x.quran?.a === a.a); q = b?.quran; en = q?.en;
      } else {
        const { DUAS } = await import('./deen/duas.mjs');
        const d = DUAS.find((x) => x.id === a.id); q = d?.quran; en = d?.en;
      }
      if (!q) return null;
      let ar = '';
      try {
        const { u } = await import('./url.mjs');
        const sura = await fetch(u(`data/surah/${String(q.s).padStart(3, '0')}.json`)).then((r) => r.json());
        const ay = sura.ayahs.find((x) => x.a === q.a)?.ar ?? '';
        ar = q.w ? ay.split(/\s+/).slice(q.w[0] - 1, q.w[1]).join(' ') : ay;
      } catch {}
      return { intro: a.intro, ar, en, ref: `Qur’an ${q.s}:${q.a}`, url: `https://quran.com/${q.s}/${q.a}` };
    }
  } catch {}
  return null;
}

// ── what the Sheikh has noticed ───────────────────────────────
export function observations({ progress, mode, range, now = Date.now() }) {
  const h = history(progress);
  const out = [];
  if (!h.length) return [{ kind: 'first' }];
  const lastAt = Math.max(...h.map((x) => x.at));
  const gap = daysBetween(lastAt, now);
  const days = new Set(h.map((x) => dayKey(x.at)));
  let run = 0;
  while (days.has(dayKey(lastAt - run * DAY))) run++;
  if (gap >= 2) out.push({ kind: 'away', days: gap });
  else if (run >= 3) out.push({ kind: 'run', days: run });
  else if (gap === 0) out.push({ kind: 'again-today' });
  else if (gap === 1) out.push({ kind: 'yesterday' });
  const same = [...h].sort((x, y) => y.at - x.at).find((x) => overlaps(x.range, range));
  if (same) {
    if (same.weak?.length) out.push({ kind: 'tricky', where: same.weak.slice(0, 2), when: daysBetween(same.at, now) });
    if (typeof same.pct === 'number') out.push({ kind: 'before', pct: same.pct, label: same.label });
  } else out.push({ kind: 'new-passage' });
  if ((mode === 'hifz' || mode === 'follow') && h.some((x) => x.mode === 'reading' && overlaps(x.range, range))) out.push({ kind: 'read-before' });
  return out;
}

// ── getting to know the student: one question a visit, until each is answered ──
const KNOW = [
  { key: 'goal', q: 'I would love to know you better. Which surah would you love to memorise next?', replies: ['Juz ʿAmma', 'Surah al-Mulk', 'Surah Yasin', 'Surah al-Kahf', 'I am not sure yet'],
    thanks: (a) => (a === 'I am not sure yet' ? 'That is fine. We will find one together, in sha’ Allah.' : `${a}! What a beautiful goal. I will remember that.`) },
  { key: 'helper', q: 'Who helps you with the Qur’an at home?', replies: ['My mum', 'My dad', 'My brother or sister', 'My grandparent', 'Only my teacher'],
    thanks: (a) => (a === 'Only my teacher' ? 'Then we will make the most of our time together.' : `May Allah reward ${a.replace(/^My /, 'your ')} for helping you.`) },
  { key: 'time', q: 'When do you like to recite best?', replies: ['After Fajr', 'After school', 'After Maghrib', 'Before bed'],
    thanks: (a) => `${a}. I will remember that. Keeping the same time each day makes it easier to keep going.` },
  { key: 'feel', q: 'How do you feel about learning the Qur’an by heart?', replies: ['I love it', 'It is okay', 'It is hard for me'],
    thanks: (a) => (a === 'It is hard for me' ? 'Thank you for telling me. We will go step by step, and I will help you.' : a === 'I love it' ? 'Masha’Allah! That love will carry you far.' : 'That is honest. Let us make it something you enjoy, step by step.') },
];

// ── what the Sheikh says out loud ────────────────────────────
// The Sheikh's voice is recorded at build time with the same natural voice as Story Time (an older man's voice: the
// 'sheikh' reader in scripts/voice/make_narration.py), never the browser's robotic voice. So every sentence he says
// aloud must be known when the site is built. Where the screen shows something that changes (the student's name, the
// passage, the exact ayah), he says the same sentence without it. allSpoken() lists every sentence he can say;
// scripts/voice/narration-list.mjs records each one.
export const spk = (t) => String(t).replace(/As-salamu alaykum/g, 'Assalamu alaykum').replace(/Qur’an/g, 'Quran').replace(/du’a/g, 'dua').replace(/ʿ/g, '');
const L = {
  hello: 'As-salamu alaykum! It is good to see you again.',
  helloNew: 'As-salamu alaykum! I am the Sheikh, and I will listen to your recitation.',
  howNow: { tired: 'Last time you told me you were a little tired. How are you now?', low: 'Last time you told me you were not feeling so good. How are you now?' },
  glad: 'Alhamdulillah! I am so glad to hear that.',
  sorryGently: 'I am sorry. We will go gently today.',
  howToday: 'How are you today?',
  moodGood: 'Alhamdulillah! Let us make this a good recitation.',
  moodTired: 'That is all right. We will go gently today. Even a little, done well, is good.',
  moodLow: 'I am sorry to hear that. May Allah make it easy for you.',
  follow: { unwell: 'Last time you told me you had been unwell. Are you feeling better now?', busy: 'Last time you told me you were very busy. Have things calmed down?',
    travel: 'Last time you told me you had been travelling. Did you have a good trip?', forgot: 'Last time we talked about remembering to recite every day. How has it been going?' },
  followYes: 'Alhamdulillah, that makes me happy.',
  followNo: 'That is all right. Keep going, step by step. I am proud of you for being here.',
  unwell: 'May Allah grant you full health. I am glad you are back.',
  teacher: 'Masha’Allah! Reciting with your teacher is wonderful. Let us keep it strong today.',
  private: 'That is all right. I am just happy you are here.',
  busy: 'Life gets busy. A few ayat each day, even on busy days, keeps the Qur’an close.',
  travel: 'You can recite wherever you are. Even a little while travelling counts.',
  forgot: 'It happens to all of us. Choosing the same time each day makes it easier to remember.',
  first: 'This is our first recitation together. I will listen to every word and help you when you need it.',
  againToday: 'You are back again today. Masha’Allah, I love your hard work!',
  yesterday: 'I remember you recited yesterday too. Well done for coming back.',
  goalWell: 'Masha’Allah! I am proud of you.',
  goalStarted: 'Every journey starts with one step. Keep going!',
  goalNot: 'That is fine. When you are ready, choose its first five ayat and we will start together.',
  planAsk: 'Will you try this step before our next recitation?',
  planExplain: 'Of course. Do this step on its own, before you recite the whole passage. Next time I will ask you how it went, and then I will give you the next step.',
  planYes: 'Excellent. I will ask you about it next time, in sha’ Allah.',
  planDone: 'Masha’Allah, you have finished the whole plan! Let us see the difference today.',
  planNotYet: 'That is all right. Try it before our next recitation. Small steps, done often, make the biggest difference.',
  tricky: 'I observe that one ayah in this passage was a little tricky last time. When you reach it, slow down. I will help you if you stop.',
  newPassage: 'This is a new passage for us. I am looking forward to hearing it.',
  todayHifz: 'Today I will recite the opening of an ayah, and you carry on from memory until I stop you.',
  todayFollow: 'Today, recite your passage from memory. I will follow every word, and give you the next word only if you stop.',
  todayReading: 'Today, read your passage from the mushaf. I will follow every word.',
  ready: 'Bismillah. Whenever you are ready.',
  again: 'Sorry, I did not quite catch that. Could you say it again?',
  tap: 'That is all right. You can tap your answer instead.',
  askMe: 'Before we begin, is there anything you would like to ask me? You can say it, or type it.',
  anyMore: 'Is there anything else you would like to ask me?',
  goodQ: 'That is a very good question.',
  askTeacher: 'I only tell you what I can find in our books, and I do not have an answer for that one. Please ask your teacher or your parents, in sha’ Allah.',
};
export const NO_QUESTION = 'No questions, let us begin';
const ASKED = '(asked)';
const twoWeeks = (n) => n > 14;
const S = {
  away: (n) => `I observe you have missed your recitation for ${twoWeeks(n) ? 'more than two weeks' : `${n} days`}. What could be the reason?`,
  run: (n) => (twoWeeks(n) ? 'I observe you have recited every day for more than two weeks. Masha’Allah, keep it up!' : `I observe you have recited ${n} days in a row. Masha’Allah, keep it up!`),
  before: (p) => `Last time on this passage, you got about ${Math.round(p / 5) * 5} percent of the words right the first time. Let us try to do even better today, in sha’ Allah.`,
  time: (t) => `You told me you like to recite ${t.toLowerCase()}. That is a good habit.`,
  goal: (g) => `How is your goal of memorising ${g} going?`,
  why: (kind) => (kind === 'ayah' ? 'I observe that one ayah has been tricky in several of your recent sessions.' : `I observe something in your last few recitations: ${PLANS[kind].why}`),
  plan: (kind) => `So I have made a plan for ${kind === 'ayah' ? 'that ayah' : PLANS[kind].name}. It has ${PLANS[kind].steps.length} steps, and we will do them one at a time.`,
  step1: (kind) => `Step 1: ${PLANS[kind].steps[0]}`,
  stepAsk: (kind, k) => `Last time I gave you step ${k + 1} of your plan for ${kind === 'ayah' ? 'that ayah' : PLANS[kind].name}: ${PLANS[kind].steps[k]} Did you manage it?`,
  stepNext: (kind, k) => `Masha’Allah! Your next step is step ${k + 1}: ${PLANS[kind].steps[k]}`,
};
// every sentence the Sheikh can say aloud, as the recorder is given it
export async function allSpoken() {
  const out = new Set();
  const add = (t) => { if (t) out.add(spk(t)); };
  for (const v of Object.values(L)) typeof v === 'string' ? add(v) : Object.values(v).forEach(add);
  for (let n = 2; n <= 15; n++) add(S.away(n));
  for (let n = 3; n <= 15; n++) add(S.run(n));
  for (let p = 0; p <= 100; p += 5) add(S.before(p));
  for (const k of KNOW) { add(k.q); k.replies.forEach((a) => add(k.thanks(a))); }
  KNOW.find((k) => k.key === 'time').replies.forEach((t) => add(S.time(t)));
  KNOW.find((k) => k.key === 'goal').replies.filter((g) => g !== 'I am not sure yet').forEach((g) => add(S.goal(g)));
  for (const [kind, P] of Object.entries(PLANS)) {
    add(S.why(kind)); add(S.plan(kind)); add(S.step1(kind));
    P.steps.forEach((_, k) => { add(S.stepAsk(kind, k)); if (k) add(S.stepNext(kind, k)); });
  }
  for (const key of Object.keys(ADVICE)) { const a = await advice(key); if (a) { add(a.intro); add(a.en); } }
  return [...out];
}

// the recordings: public/audio/narration/index.json, the same store as Story Time's
let idxP = null, uFn = null;
async function clipSrc(text) {
  try {
    uFn ??= (await import('./url.mjs')).u;
    idxP ??= fetch(uFn('audio/narration/index.json')).then((r) => (r.ok ? r.json() : {}), () => ({}));
    const c = (await idxP)[clipKey(VOICES.sheikh, spk(text))];
    return c ? uFn(`audio/narration/${c.f}.mp3`) : null;
  } catch { return null; }
}
// sentences with no recording yet (shown, not spoken), for the tests
export const unrecorded = [];

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const MIC_SVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"></rect><path d="M5 11a7 7 0 0 0 14 0M12 18v3"></path></svg>';

// micButton: the classroom's own microphone button, which talks to the Sheikh while the chat is open;
// onMic(on): told when the Sheikh is listening, so that button can show it
// the Sheikh's library (public/data/sheikh-library.json, made by scripts/sheikh/library.mjs), by id
let libP = null;
function libraryById() {
  libP ??= (async () => {
    const { u } = await import('./url.mjs');
    const j = await fetch(u('data/sheikh-library.json')).then((r) => (r.ok ? r.json() : null), () => null);
    return Object.fromEntries((j?.lines ?? []).map((x) => [x.id, x]));
  })();
  return libP;
}

export function sheikhChat(host, { name = '', mode = 'reading', range, label = 'this passage', progress = {}, onSave, micButton, onMic, think } = {}) {
  return new Promise((resolve) => {
    const m = mind(progress);
    const first = name.split(' ')[0] || 'my student';
    let stopped = false;
    const box = el('div', 'sc-chat'); box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'A word with the Sheikh before you recite');
    const card = el('div', 'sc-card');
    const head = el('div', 'sc-head');
    head.append(el('b', null, 'A word with the Sheikh'));
    const tools = el('div', 'sc-tools');
    const snd = el('button', 'sc-sound'); snd.type = 'button';
    let speakOn = true;
    try { const v = localStorage.getItem('qc-chat-voice'); if (v) speakOn = v === '1'; } catch {}
    const paint = () => { snd.textContent = speakOn ? 'Voice on' : 'Voice off'; snd.setAttribute('aria-pressed', String(speakOn)); };
    snd.addEventListener('click', () => { speakOn = !speakOn; paint(); if (!speakOn) hushAudio(); try { localStorage.setItem('qc-chat-voice', speakOn ? '1' : '0'); } catch {} });
    paint();
    const skip = el('button', 'sc-skip', 'Skip and recite'); skip.type = 'button';
    skip.addEventListener('click', end);
    tools.append(snd, skip);
    head.append(tools);
    const log = el('div', 'sc-log'); log.setAttribute('aria-live', 'polite');
    const heard = el('p', 'sc-heard'); heard.hidden = true; heard.setAttribute('aria-live', 'polite');
    const replies = el('div', 'sc-replies');
    card.append(head, log, heard, replies);
    box.append(card);
    host.append(box);

    // ── his voice ──
    const audio = typeof Audio === 'function' ? new Audio() : null;
    let playing = null;
    function hushAudio() { try { audio?.pause(); } catch {} playing?.(); }
    function talk(text) {
      return new Promise((done) => {
        const pause = () => setTimeout(done, Math.min(2600, 500 + text.length * 22));   // time to read it on screen
        if (!speakOn || stopped || !audio) return pause();
        clipSrc(text).then((src) => {
          if (stopped) return done();
          if (!src) { unrecorded.push(spk(text)); console.warn('[sheikh] no recording yet for:', spk(text)); return pause(); }
          let over = false;
          const fin = () => { if (over) return; over = true; playing = null; done(); };
          playing = fin;
          audio.onended = fin; audio.onerror = fin;
          audio.src = src;
          audio.play().catch(() => { if (over) return; over = true; playing = null; pause(); });
          setTimeout(fin, 40000);
        });
      });
    }

    // ── his ears: the student answers out loud (or taps) ──
    const ears = canListen();
    let autoListen = ears;
    try { const v = localStorage.getItem('qc-chat-mic'); if (v) autoListen = ears && v === '1'; } catch {}
    let rec = null, listenNow = null;
    const setMic = (on) => { onMic?.(on); };
    const outerMic = (e) => { if (!listenNow) return; e.stopImmediatePropagation(); e.preventDefault(); listenNow(); };
    micButton?.addEventListener('click', outerMic, true);
    if (ears) setMic(false);

    function end() {
      if (stopped) return; stopped = true;
      hushAudio(); rec?.stop(); rec = null; setMic(false);
      micButton?.removeEventListener('click', outerMic, true);
      m.lastChat = Date.now();
      onSave?.();
      box.remove(); resolve();
    }
    const add = (who, text) => { const p = el('p', 'sc-msg ' + who, text); log.append(p); log.scrollTop = log.scrollHeight; return p; };
    // shown: what is on the screen; aloud: the same sentence as recorded (without a name or passage that changes)
    async function say(shown, aloud = shown) {
      if (stopped) return;
      const t = add('sc-sheikh typing', '…');
      await new Promise((r) => setTimeout(r, 420));
      if (stopped) return;
      t.classList.remove('typing'); t.textContent = shown;
      await talk(aloud);
    }
    // an ayah or hadith from the checked sources, as a card with its reference
    async function quote(key) {
      const a = await advice(key);
      if (!a || stopped) return;
      await say(a.intro);
      await quoteCard(a);
    }
    async function quoteCard(a) {
      if (stopped) return;
      const c = el('div', 'sc-quote');
      if (a.ar) { const ar = el('p', 'sc-quote-ar' + (a.ref.startsWith('Qur') ? ' quran' : ''), a.ar); ar.lang = 'ar'; ar.dir = 'rtl'; c.append(ar); }
      c.append(el('p', 'sc-quote-en', a.en));
      const ref = el('p', 'sc-quote-ref');
      if (a.url) { const l = el('a', null, a.ref); l.href = a.url; l.target = '_blank'; l.rel = 'noopener'; ref.append(l); } else ref.textContent = a.ref;
      c.append(ref);
      log.append(c); log.scrollTop = log.scrollHeight;
      await talk(a.en);
    }

    // ── his mind: the AI chooses lines from his library (only when the class server has it turned on) ──
    const mindP = think?.on ? Promise.resolve().then(() => think.on()).then((v) => !!v, () => false) : Promise.resolve(false);
    let mindOn = false;
    mindP.then((v) => { mindOn = v; if (v) libraryById(); });
    const recent = [];
    async function thinkAbout(phase, question, options, said) {
      if (!mindOn) return null;
      const dots = add('sc-sheikh typing', '…');
      try {
        const r = await think.talk({ phase, question: spk(question ?? ''), options, said, recent: recent.slice(-12) });
        if (!r?.ok) return null;
        const lib = await libraryById();
        return { answer: Number.isInteger(r.answer) ? r.answer : -1, say: (r.say ?? []).filter((id) => lib[id]) };
      } catch { return null; } finally { dots.remove(); }
    }
    async function sayLines(ids) {
      const lib = await libraryById();
      for (const id of ids) {
        const x = lib[id];
        if (!x || stopped) continue;
        recent.push(id);
        if (x.kind === 'line') await say(x.text);
        else { await say(x.intro); await quoteCard({ ar: x.ar, en: x.text, ref: x.ref, url: x.url }); }
      }
    }
    // the answers as buttons, and the Sheikh listening for the student to say one
    // q: the question he asked (as he said it); ask: the student may ask him anything (choose then resolves to
    // ASKED once he has replied, or to the one option when they have nothing to ask)
    const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
    function choose(options, { go = false, q = '', ask = false } = {}) {
      return new Promise((resolveChoice) => {
        let typed = null;
        const r = (v) => { typed?.remove(); resolveChoice(v); };
        replies.replaceChildren();
        let answered = false, tries = 0, mic = null, busy = false;
        const settle = () => { answered = true; listenNow = null; rec?.stop(); rec = null; setMic(false); heard.hidden = true; replies.replaceChildren(); };
        const answer = async (opt, said, lines = []) => {
          if (answered) return;
          settle();
          if (!go) add('sc-me', said && said.length > 1 ? cap(said) : opt);
          if (lines.length) await sayLines(lines);
          r(opt);
        };
        // what the student said that the answer buttons do not cover: the AI chooses his reply.
        // Returns false when there was no reply (the usual "say it again" follows).
        async function understand(said, matched) {
          if (busy || answered || stopped) return true;
          busy = true;
          heard.textContent = `“${said}”`;
          const res = await thinkAbout(ask ? 'question' : 'answer', q, options, said);
          busy = false;
          if (answered || stopped) return true;
          if (!res) {                                        // no reply from the class server
            if (matched) { answer(matched, said); return true; }
            if (ask) { settle(); add('sc-me', cap(said)); await say(L.goodQ); await say(L.askTeacher); r(ASKED); return true; }
            return false;
          }
          if (res.answer >= 0 && options[res.answer]) { answer(options[res.answer], said, res.say); return true; }
          if (matched && !ask) { answer(matched, said, res.say); return true; }
          if (!res.say.length || res.say.every((id) => id === 'c-again')) return false;
          if (ask) { settle(); add('sc-me', cap(said)); await sayLines(res.say); r(ASKED); return true; }
          add('sc-me', cap(said)); heard.hidden = true;      // a reply, then he waits for the answer again
          await sayLines(res.say);
          if (!answered && !stopped && autoListen) hear();
          return true;
        }
        if (ask) {                                           // or type the question
          typed = el('form', 'sc-type');
          const inp = el('input'); inp.type = 'text'; inp.maxLength = 200; inp.placeholder = 'Type your question'; inp.setAttribute('aria-label', 'Type your question for the Sheikh');
          const send = el('button', 'sc-reply', 'Ask'); send.type = 'submit';
          typed.append(inp, send);
          typed.addEventListener('submit', async (e) => {
            e.preventDefault();
            const t = inp.value.trim(); if (!t || answered || busy) return;
            inp.value = ''; rec?.stop();
            if (!(await understand(t, null)) && !answered) { add('sc-me', cap(t)); await say(L.goodQ); await say(L.askTeacher); settle(); r(ASKED); }
          });
          replies.after(typed);
        }
        for (const text of options) {
          const b = el('button', go ? 'sc-go' : 'sc-reply', text); b.type = 'button';
          b.addEventListener('click', () => answer(text));
          replies.append(b);
        }
        const idle = () => { if (!mic) return; mic.classList.remove('on'); mic.setAttribute('aria-pressed', 'false'); mic.lastChild.textContent = 'Tap and speak'; };
        async function hear() {
          if (answered || stopped) return;
          if (rec) { rec.stop(); autoListen = false; try { localStorage.setItem('qc-chat-mic', '0'); } catch {} return; }   // tapped again: stop listening
          hushAudio();
          mic.classList.add('on'); mic.setAttribute('aria-pressed', 'true'); mic.lastChild.textContent = 'Listening… speak now';
          setMic(true); heard.hidden = false; heard.textContent = 'The Sheikh is listening…';
          const me = listen({ onWords: (w) => { heard.textContent = `“${w}”`; } });
          rec = me;
          const res = await me.done;
          if (rec === me) rec = null;
          setMic(false);
          if (answered || stopped) return;
          idle();
          if (res.error === 'not-allowed' || res.error === 'service-not-allowed' || res.error === 'audio-capture') {
            autoListen = false;
            heard.textContent = 'The microphone is not allowed for talking to the Sheikh. Allow it in the address bar, or tap your answer.';
            return;
          }
          const said = (res.heard ?? [])[0] ?? '';
          const opt = said ? matchReply(res.heard, options) : null;
          const words = said.split(/\s+/).filter(Boolean).length;
          // a short answer that fits a button is enough; anything longer or unmatched goes to his mind, when it is on
          if (opt && (go || !mindOn || words <= (ask ? 3 : 5))) return answer(opt, go ? '' : said);
          if (!said) { heard.hidden = true; return; }    // silence: he waits; the student can tap or press the microphone
          if (mindOn && !go && await understand(said, opt)) return;
          if (answered || stopped) return;
          if (opt) return answer(opt, said);
          heard.textContent = `“${said}”`;
          tries++;
          if (tries <= 2) { await say(L.again); if (!answered && !stopped) hear(); }
          else await say(L.tap);
        }
        if (ears) {
          mic = el('button', 'sc-mic'); mic.type = 'button'; mic.setAttribute('aria-pressed', 'false');
          mic.innerHTML = MIC_SVG; mic.append(el('span', null, 'Tap and speak'));
          mic.addEventListener('click', () => { autoListen = true; try { localStorage.setItem('qc-chat-mic', '1'); } catch {} hear(); });
          replies.append(mic);
          listenNow = () => { autoListen = true; hear(); };
          if (autoListen) hear();
        }
        replies.querySelector('button')?.focus({ preventScroll: true });
      });
    }
    async function ask(topic, q, options, aloud = q) { await say(q, aloud); if (stopped) return null; const a = await choose(options, { q: aloud }); note(m, topic, q, a); onSave?.(); return a; }

    (async () => {
      const obs = observations({ progress, mode, range });
      const away = obs.find((o) => o.kind === 'away');
      const lastAgo = m.lastChat ? daysBetween(m.lastChat, Date.now()) : null;

      // 1. greeting, and how they are (asking after last time if it was not a good day)
      if (m.lastChat) await say(`As-salamu alaykum, ${first}! It is good to see you again.`, L.hello);
      else await say(`As-salamu alaykum, ${first}! I am the Sheikh, and I will listen to your recitation.`, L.helloNew);
      if (m.mood && m.mood !== 'good' && lastAgo != null && lastAgo <= 14) {
        const a = await ask('mood-follow', L.howNow[m.mood === 'tired' ? 'tired' : 'low'], ['Much better, alhamdulillah', 'Still the same']);
        if (a == null) return;
        if (a.startsWith('Much')) { m.mood = 'good'; await say(L.glad); }
        else { await say(L.sorryGently); await quote('rest'); }
      } else {
        const a = await ask('mood', L.howToday, ['Alhamdulillah, I am good', 'A little tired', 'Not so good']);
        if (a == null) return;
        m.mood = a.startsWith('Alhamdulillah') ? 'good' : a.startsWith('A little') ? 'tired' : 'low';
        if (m.mood === 'good') await say(L.moodGood);
        else if (m.mood === 'tired') await say(L.moodTired);
        else { await say(L.moodLow); await quote('ease'); }
      }

      // 2. a follow-up on the reason they gave for being away last time
      if (m.reason && !away && m.reasonAt && daysBetween(m.reasonAt, Date.now()) <= 21 && !m.reasonFollowed) {
        const replies2 = { unwell: ['Yes, alhamdulillah', 'Not fully yet'], busy: ['Yes, a bit', 'Still busy'], travel: ['Yes, it was good', 'It was tiring'], forgot: ['Better, I remembered', 'I still forget sometimes'] }[m.reason];
        if (replies2) {
          const a = await ask('reason-follow', L.follow[m.reason], replies2);
          if (a == null) return;
          m.reasonFollowed = true;
          await say(/^(Yes|Better)/.test(a) ? L.followYes : L.followNo);
        }
      }

      // 3. what he has noticed
      if (away) {
        const q = S.away(away.days);
        const a = await ask('away', twoWeeks(away.days) ? `I observe you have missed your recitation for ${away.days} days. What could be the reason?` : q,
          ['I was busy with school', 'I forgot', 'I was unwell', 'I was travelling', 'I recited with my teacher', 'I would rather not say'], q);
        if (a == null) return;
        const reason = /busy/.test(a) ? 'busy' : /forgot/.test(a) ? 'forgot' : /unwell/.test(a) ? 'unwell' : /travel/.test(a) ? 'travel' : /teacher/.test(a) ? 'teacher' : 'private';
        Object.assign(m, { reason, reasonAt: Date.now(), reasonFollowed: false });
        if (reason === 'unwell') { await say(L.unwell); await quote('able'); }
        else if (reason === 'teacher') await say(L.teacher);
        else if (reason === 'private') await say(L.private);
        else { await say(L[reason]); await quote('regular'); }
      } else {
        const o = obs[0];
        if (o?.kind === 'first') await say(L.first);
        else if (o?.kind === 'run') await say(twoWeeks(o.days) ? `I observe you have recited ${o.days} days in a row. Masha’Allah, keep it up!` : S.run(o.days), S.run(o.days));
        else if (o?.kind === 'again-today') await say(L.againToday);
        else if (o?.kind === 'yesterday') await say(L.yesterday);
      }

      // 4. something he remembers about them
      if (m.know.time && Math.random() < 0.5) await say(S.time(m.know.time));
      else if (m.know.goal && m.know.goal !== 'I am not sure yet' && Math.random() < 0.6) {
        const a = await ask('goal-follow', S.goal(m.know.goal), ['Going well', 'I have started', 'Not started yet']);
        if (a == null) return;
        await say(a === 'Going well' ? L.goalWell : a === 'I have started' ? L.goalStarted : L.goalNot);
      }

      // 5. the most common difficulty, and the plan for it
      const d = difficulty(progress);
      if (d && (!m.plan || m.plan.kind !== d.kind || (d.kind === 'ayah' && m.plan.ayah !== d.ayah))) {
        const P = PLANS[d.kind];
        await say(d.kind === 'ayah' ? `I observe that ${d.ayah} has been tricky in ${d.sessions} of your recent sessions.` : S.why(d.kind), S.why(d.kind));
        await say(d.kind === 'ayah' ? `So I have made a plan for ${d.ayah}. It has ${P.steps.length} steps, and we will do them one at a time.` : S.plan(d.kind), S.plan(d.kind));
        m.plan = { kind: d.kind, ayah: d.ayah ?? null, step: 0, startedAt: Date.now() };
        await say(S.step1(d.kind));
        const a = await ask('plan', L.planAsk, ['Yes, I will', 'Can you explain more?']);
        if (a == null) return;
        await say(a.startsWith('Can') ? L.planExplain : L.planYes);
      } else if (m.plan) {
        const P = PLANS[m.plan.kind];
        const k = m.plan.step;
        if (P?.steps[k]) {
          const shown = m.plan.kind === 'ayah' && m.plan.ayah ? `Last time I gave you step ${k + 1} of your plan for ${m.plan.ayah}: ${P.steps[k]} Did you manage it?` : S.stepAsk(m.plan.kind, k);
          const a = await ask('plan-step', shown, ['Yes, I did it', 'Not yet'], S.stepAsk(m.plan.kind, k));
          if (a == null) return;
          if (a.startsWith('Yes')) {
            m.plan.step++;
            if (m.plan.step >= P.steps.length) { await say(L.planDone); m.plan = null; }
            else await say(S.stepNext(m.plan.kind, m.plan.step));
          } else await say(L.planNotYet);
        }
      } else {
        const t = obs.find((o) => o.kind === 'tricky');
        if (t) await say(`I observe that ${t.where.join(' and ')} was a little tricky ${ago(t.when)}. When you reach it, slow down. I will help you if you stop.`, L.tricky);
        const b = obs.find((o) => o.kind === 'before');
        if (b) { const r5 = Math.round(b.pct / 5) * 5; await say(`Last time on ${b.label} you got about ${r5}% of the words right the first time. Let us try to do even better today, in sha’ Allah.`, S.before(b.pct)); }
        else if (obs.some((o) => o.kind === 'new-passage') && obs[0]?.kind !== 'first') await say(`${label} is a new passage for us. I am looking forward to hearing it.`, L.newPassage);
      }

      // 6. one getting-to-know-you question a visit
      const k = KNOW.find((x) => !m.know[x.key] && !m.asked.includes(x.key + ':' + dayKey(Date.now())));
      if (k) {
        m.asked = [...m.asked, k.key + ':' + dayKey(Date.now())].slice(-20);
        const a = await ask('know-' + k.key, k.q, k.replies);
        if (a == null) return;
        m.know[k.key] = a;
        await say(k.thanks(a));
        if (k.key === 'feel' && a === 'It is hard for me') await quote('able');
      }

      // 7. how it works today, a du'a, and Bismillah
      if (mode === 'hifz') await say(L.todayHifz);
      else if (mode === 'follow') await say(`Today, recite ${label} from memory. I will follow every word, and give you the next word only if you stop.`, L.todayFollow);
      else await say(`Today, read ${label} from the mushaf. I will follow every word.`, L.todayReading);
      if (Math.random() < 0.5) await quote('more');
      if (stopped) return;

      // 8. anything the student would like to ask him (when his mind is on): up to three questions
      if (await mindP && !stopped) {
        await say(L.askMe);
        for (let i = 0; i < 3 && !stopped; i++) {
          const a = await choose([NO_QUESTION], { q: i ? L.anyMore : L.askMe, ask: true });
          if (a !== ASKED || stopped) break;
          if (i < 2) await say(L.anyMore);
        }
      }
      if (stopped) return;
      await say(L.ready);
      onSave?.();
      if (stopped) return;
      await choose(['Bismillah, let us begin'], { go: true });
      end();
    })();
  });
}
