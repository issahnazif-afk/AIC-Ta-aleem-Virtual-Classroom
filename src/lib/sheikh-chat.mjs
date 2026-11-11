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
//   sheikhChat(host, { name, mode, range, label, progress, onSave }) → Promise (resolves when it is time to recite)


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

// ── the voice (the computer's English voice, if the student keeps it on) ──
let enVoice = null;
function pickVoice() {
  const vs = (globalThis.speechSynthesis?.getVoices() ?? []).filter((v) => /^en/i.test(v.lang));
  const rank = (v) => (/natural|neural|online/i.test(v.name) ? 3 : 0) + (/guy|david|george|ryan|daniel|male/i.test(v.name) ? 2 : 0);
  enVoice = vs.sort((a, b) => rank(b) - rank(a))[0] ?? null;
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) { pickVoice(); speechSynthesis.addEventListener?.('voiceschanged', pickVoice); }
function talk(text, on) {
  return new Promise((resolve) => {
    if (!on || !('speechSynthesis' in window)) { setTimeout(resolve, Math.min(2400, 450 + text.length * 20)); return; }
    const ut = new SpeechSynthesisUtterance(text.replace(/’/g, "'").replace(/ﷺ/g, 'sallallahu alayhi wa sallam'));
    if (enVoice) ut.voice = enVoice; ut.lang = enVoice?.lang ?? 'en-GB'; ut.rate = 0.95; ut.pitch = 0.9;
    let done = false; const fin = () => { if (!done) { done = true; resolve(); } };
    ut.onend = fin; ut.onerror = fin; speechSynthesis.cancel(); speechSynthesis.speak(ut);
    setTimeout(fin, 900 + text.length * 90);
  });
}

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

export function sheikhChat(host, { name = '', mode = 'reading', range, label = 'this passage', progress = {}, onSave }) {
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
    snd.addEventListener('click', () => { speakOn = !speakOn; paint(); if (!speakOn) { try { speechSynthesis.cancel(); } catch {} } try { localStorage.setItem('qc-chat-voice', speakOn ? '1' : '0'); } catch {} });
    paint();
    const skip = el('button', 'sc-skip', 'Skip and recite'); skip.type = 'button';
    skip.addEventListener('click', end);
    tools.append(snd, skip);
    head.append(tools);
    const log = el('div', 'sc-log'); log.setAttribute('aria-live', 'polite');
    const replies = el('div', 'sc-replies');
    card.append(head, log, replies);
    box.append(card);
    host.append(box);

    function end() {
      if (stopped) return; stopped = true;
      try { speechSynthesis.cancel(); } catch {}
      m.lastChat = Date.now();
      onSave?.();
      box.remove(); resolve();
    }
    const add = (who, text) => { const p = el('p', 'sc-msg ' + who, text); log.append(p); log.scrollTop = log.scrollHeight; return p; };
    async function say(text) {
      if (stopped) return;
      const t = add('sheikh typing', '…');
      await new Promise((r) => setTimeout(r, 420));
      if (stopped) return;
      t.classList.remove('typing'); t.textContent = text;
      await talk(text, speakOn);
    }
    // an ayah or hadith from the checked sources, as a card with its reference
    async function quote(key) {
      const a = await advice(key);
      if (!a || stopped) return;
      await say(a.intro);
      const c = el('div', 'sc-quote');
      if (a.ar) { const ar = el('p', 'sc-quote-ar' + (a.ref.startsWith('Qur') ? ' quran' : ''), a.ar); ar.lang = 'ar'; ar.dir = 'rtl'; c.append(ar); }
      c.append(el('p', 'sc-quote-en', a.en));
      const ref = el('p', 'sc-quote-ref');
      if (a.url) { const l = el('a', null, a.ref); l.href = a.url; l.target = '_blank'; l.rel = 'noopener'; ref.append(l); } else ref.textContent = a.ref;
      c.append(ref);
      log.append(c); log.scrollTop = log.scrollHeight;
      await talk(a.en, speakOn);
    }
    function choose(options) {
      return new Promise((r) => {
        replies.replaceChildren();
        for (const text of options) {
          const b = el('button', 'sc-reply', text); b.type = 'button';
          b.addEventListener('click', () => { replies.replaceChildren(); add('me', text); r(text); });
          replies.append(b);
        }
        replies.querySelector('button')?.focus({ preventScroll: true });
      });
    }
    async function ask(topic, q, options) { await say(q); if (stopped) return null; const a = await choose(options); note(m, topic, q, a); onSave?.(); return a; }

    (async () => {
      const obs = observations({ progress, mode, range });
      const away = obs.find((o) => o.kind === 'away');
      const lastAgo = m.lastChat ? daysBetween(m.lastChat, Date.now()) : null;

      // 1. greeting, and how they are (asking after last time if it was not a good day)
      await say(m.lastChat ? `As-salamu alaykum, ${first}! It is good to see you again.` : `As-salamu alaykum, ${first}! I am the Sheikh, and I will listen to your recitation.`);
      if (m.mood && m.mood !== 'good' && lastAgo != null && lastAgo <= 14) {
        const was = m.mood === 'tired' ? 'a little tired' : 'not feeling so good';
        const a = await ask('mood-follow', `Last time you told me you were ${was}. How are you now?`, ['Much better, alhamdulillah', 'Still the same']);
        if (a == null) return;
        if (a.startsWith('Much')) { m.mood = 'good'; await say('Alhamdulillah! I am so glad to hear that.'); }
        else { await say('I am sorry. We will go gently today.'); await quote('rest'); }
      } else {
        const a = await ask('mood', 'How are you today?', ['Alhamdulillah, I am good', 'A little tired', 'Not so good']);
        if (a == null) return;
        m.mood = a.startsWith('Alhamdulillah') ? 'good' : a.startsWith('A little') ? 'tired' : 'low';
        if (m.mood === 'good') await say('Alhamdulillah! Let us make this a good recitation.');
        else if (m.mood === 'tired') await say('That is all right. We will go gently today. Even a little, done well, is good.');
        else { await say('I am sorry to hear that. May Allah make it easy for you.'); await quote('ease'); }
      }

      // 2. a follow-up on the reason they gave for being away last time
      if (m.reason && !away && m.reasonAt && daysBetween(m.reasonAt, Date.now()) <= 21 && !m.reasonFollowed) {
        const follow = { unwell: ['Last time you told me you had been unwell. Are you feeling better now?', ['Yes, alhamdulillah', 'Not fully yet']],
          busy: ['Last time you told me you were very busy. Have things calmed down?', ['Yes, a bit', 'Still busy']],
          travel: ['Last time you told me you had been travelling. Did you have a good trip?', ['Yes, it was good', 'It was tiring']],
          forgot: ['Last time we talked about remembering to recite every day. How has it been going?', ['Better, I remembered', 'I still forget sometimes']] }[m.reason];
        if (follow) {
          const a = await ask('reason-follow', follow[0], follow[1]);
          if (a == null) return;
          m.reasonFollowed = true;
          await say(/^(Yes|Better)/.test(a) ? 'Alhamdulillah, that makes me happy.' : 'That is all right. Keep going, step by step. I am proud of you for being here.');
        }
      }

      // 3. what he has noticed
      if (away) {
        const a = await ask('away', `I observe you have missed your recitation for ${away.days} days. What could be the reason?`,
          ['I was busy with school', 'I forgot', 'I was unwell', 'I was travelling', 'I recited with my teacher', 'I would rather not say']);
        if (a == null) return;
        const reason = /busy/.test(a) ? 'busy' : /forgot/.test(a) ? 'forgot' : /unwell/.test(a) ? 'unwell' : /travel/.test(a) ? 'travel' : /teacher/.test(a) ? 'teacher' : 'private';
        Object.assign(m, { reason, reasonAt: Date.now(), reasonFollowed: false });
        if (reason === 'unwell') { await say('May Allah grant you full health. I am glad you are back.'); await quote('able'); }
        else if (reason === 'teacher') await say('Masha’Allah! Reciting with your teacher is wonderful. Let us keep it strong today.');
        else if (reason === 'private') await say('That is all right. I am just happy you are here.');
        else {
          await say(reason === 'busy' ? 'Life gets busy. A few ayat each day, even on busy days, keeps the Qur’an close.' : reason === 'travel' ? 'You can recite wherever you are. Even a little while travelling counts.' : 'It happens to all of us. Choosing the same time each day makes it easier to remember.');
          await quote('regular');
        }
      } else {
        const o = obs[0];
        if (o?.kind === 'first') await say('This is our first recitation together. I will listen to every word and help you when you need it.');
        else if (o?.kind === 'run') await say(`I observe you have recited ${o.days} days in a row. Masha’Allah, keep it up!`);
        else if (o?.kind === 'again-today') await say('You are back again today. Masha’Allah, I love your hard work!');
        else if (o?.kind === 'yesterday') await say('I remember you recited yesterday too. Well done for coming back.');
      }

      // 4. something he remembers about them
      if (m.know.time && Math.random() < 0.5) await say(`You told me you like to recite ${m.know.time.toLowerCase()}. That is a good habit.`);
      else if (m.know.goal && m.know.goal !== 'I am not sure yet' && Math.random() < 0.6) {
        const a = await ask('goal-follow', `How is your goal of memorising ${m.know.goal} going?`, ['Going well', 'I have started', 'Not started yet']);
        if (a == null) return;
        await say(a === 'Going well' ? 'Masha’Allah! I am proud of you.' : a === 'I have started' ? 'Every journey starts with one step. Keep going!' : 'That is fine. When you are ready, choose its first five ayat and we will start together.');
      }

      // 5. the most common difficulty, and the plan for it
      const d = difficulty(progress);
      if (d && (!m.plan || m.plan.kind !== d.kind || (d.kind === 'ayah' && m.plan.ayah !== d.ayah))) {
        const P = PLANS[d.kind];
        const why = d.kind === 'ayah' ? `I observe that ${d.ayah} has been tricky in ${d.sessions} of your recent sessions.` : `I observe something in your last few recitations: ${P.why}`;
        await say(why);
        await say(`So I have made a plan for ${d.kind === 'ayah' ? d.ayah : P.name}. It has ${P.steps.length} steps, and we will do them one at a time.`);
        m.plan = { kind: d.kind, ayah: d.ayah ?? null, step: 0, startedAt: Date.now() };
        await say(`Step 1: ${P.steps[0]}`);
        const a = await ask('plan', 'Will you try this step before our next recitation?', ['Yes, I will', 'Can you explain more?']);
        if (a == null) return;
        if (a.startsWith('Can')) await say('Of course. Do this step on its own, before you recite the whole passage. Next time I will ask you how it went, and then I will give you the next step.');
        else await say('Excellent. I will ask you about it next time, in sha’ Allah.');
      } else if (m.plan) {
        const P = PLANS[m.plan.kind];
        const step = P?.steps[m.plan.step];
        if (step) {
          const a = await ask('plan-step', `Last time I gave you step ${m.plan.step + 1} of your plan for ${m.plan.ayah ?? P.name}: ${step} Did you manage it?`, ['Yes, I did it', 'Not yet']);
          if (a == null) return;
          if (a.startsWith('Yes')) {
            m.plan.step++;
            if (m.plan.step >= P.steps.length) { await say('Masha’Allah, you have finished the whole plan! Let us see the difference today.'); m.plan = null; }
            else await say(`Masha’Allah! Your next step is step ${m.plan.step + 1}: ${P.steps[m.plan.step]}`);
          } else await say('That is all right. Try it before our next recitation. Small steps, done often, make the biggest difference.');
        }
      } else {
        const t = obs.find((o) => o.kind === 'tricky');
        if (t) await say(`I observe that ${t.where.join(' and ')} was a little tricky ${ago(t.when)}. When you reach it, slow down. I will help you if you stop.`);
        const b = obs.find((o) => o.kind === 'before');
        if (b) await say(`Last time on ${b.label} you got ${b.pct}% of the words right the first time. Let us try to do even better today, in sha’ Allah.`);
        else if (obs.some((o) => o.kind === 'new-passage') && obs[0]?.kind !== 'first') await say(`${label} is a new passage for us. I am looking forward to hearing it.`);
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
      await say(mode === 'hifz' ? 'Today I will recite the opening of an ayah, and you carry on from memory until I stop you.'
        : mode === 'follow' ? `Today, recite ${label} from memory. I will follow every word, and give you the next word only if you stop.`
          : `Today, read ${label} from the mushaf. I will follow every word.`);
      if (Math.random() < 0.5) await quote('more');
      if (stopped) return;
      await say('Bismillah. Whenever you are ready.');
      onSave?.();
      replies.replaceChildren();
      const go = el('button', 'sc-go', 'Bismillah, let us begin'); go.type = 'button';
      go.addEventListener('click', end);
      replies.append(go); go.focus({ preventScroll: true });
    })();
  });
}
