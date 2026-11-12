// The Sheikh's free understanding, on the student's own device (no AI service, no cost, nothing sent anywhere).
// A small sentence model (src/lib/sheikh-embed.mjs) turns what the student said into a meaning, and the Sheikh answers
// with the library line closest in meaning (src/lib/sheikh-library.mjs): an everyday line, or a hadith, ayah or
// Ibn Kathir passage when one is truly close. When nothing is close enough he says it is a good question for their
// teacher. He never makes anything up: every reply is a recorded line from the library.
//
//   loadLocalMind() → Promise<mind | null>       (browser; null if the model cannot load)
//   createLocalMind({ data, vectors, embed, phrases }) → mind      (also used by the tests in Node)
//   mind.think({ phase, options, said, recent }) → Promise<{ answer, say }>   same shape as the class server's AI
import { dot, embedder } from './sheikh-embed.mjs';

// How close (0 to 1) a meaning must be. Set by trying many sentences a child might say (scripts/sheikh/try.mjs).
export const CLOSE = {
  intent: 0.62,      // an everyday thing ("are you a robot?", "my cat died")
  quote: 0.55,       // a hadith, ayah or passage that answers the question
  ask: 0.7,          // a question the library knows a quotation answers (ASK): close enough to need no shared word
  answer: 0.5,       // an answer in the student's own words, matched to a button
};

// Said aloud by a child: safety comes first and never depends on the model.
const UNSAFE = /\b(hit(s|ting)? me|hurt(s|ing)? me|beat(s|ing)? me|kick(s|ing)? me|bull(y|ies|ied|ying)|abus\w*|touch(es|ed|ing)? me|kill (my ?self|me)|hurt my ?self|want to die|not safe|unsafe|scared of (him|her|them|my (dad|father|mum|mom|mother|brother|uncle))|someone is hurting)\b/i;
const RUDE = /\b(stupid|idiot|shut up|dumb|hate you|f+u+c+k\w*|shit\w*|damn|crap|bitch\w*|ass(hole)?|bastard)\b/i;
const QUESTION = /\?|^\s*(why|what|how|who|when|where|which|is|are|can|could|should|do|does|did|will|would|tell me|explain)\b/i;
// a reply that also deserves a word, when the student answered one of his questions
const ASIDE = new Set(['c-sorry-loss', 'c-get-well', 'c-worried', 'c-proud-2', 'c-wonderful', 'c-sorry-2']);

// A quotation found by its own words must also share a real word with the question (the model alone links
// anything about "the Prophet" ﷺ to anything else about him). One found by a question it answers (ASK) need not.
const COMMON = new Set('a an the and or but if of to in on at for with from by as is are was were be been being am do does did doing have has had i me my we our you your he him his she her they them their it its this that these those what who whom which why how when where can could should would will shall may might must not no yes so very too also just about tell say said says know like want get got make made go went come came happen happened happens thing things good bad best way sort really much many more most some any all there here than then out up down over after before again ok okay please sheikh prophet prophets allah muhammad messenger islam muslim muslims quran pbuh peace upon him day people person us let lets'.split(' '));
const SAME = { mad: 'anger', angry: 'anger', anger: 'anger', mum: 'mother', mom: 'mother', mommy: 'mother', mother: 'mother', dad: 'father', father: 'father', lie: 'truth', lying: 'truth', liar: 'truth', honest: 'truth', truth: 'truth', truthful: 'truth', kid: 'child', kids: 'child', child: 'child', children: 'child', neighbor: 'neighbour', neighbors: 'neighbour', neighbour: 'neighbour', neighbours: 'neighbour', smiling: 'smile', smiled: 'smile', smile: 'smile', kindness: 'kind', kind: 'kind' };
const stem = (w) => SAME[w] ?? w.replace(/'s$/, '').replace(/(ing|ed|es|s)$/, '').slice(0, 7);
const words = (t) => new Set(String(t).toLowerCase().replace(/[’']/g, "'").split(/[^a-z']+/).filter((w) => w.length > 2 && !COMMON.has(w)).map(stem));
const shares = (a, b) => { for (const w of a) if (b.has(w)) return true; return false; };
// what kind of question it is: "when" is not answered by "where", nor "how many" by "when"
const whOf = (t) => (String(t).toLowerCase().match(/\b(how many|how old|how long|how much|when|where|why|who|what|which|how)\b/) ?? [])[1] ?? null;

const POINTERS = new Set(['c-seerah', 'c-duas', 'c-stories', 'c-my-deen', 'c-memorise', 'c-revise']);
const pickFresh = (ids, recent) => ids.find((id) => !recent.includes(id)) ?? ids[0];

export function createLocalMind({ data, vectors, embed, phrases = {} }) {
  const D = 384;
  const quotes = data.match.quotes;
  const intents = [];
  data.match.intents.forEach((it, k) => it.ex.forEach(() => intents.push(k)));
  const asks = data.match.asks ?? [];
  const qRow = (i) => i * D, iRow = (j) => (quotes.length + j) * D, aRow = (k) => (quotes.length + intents.length + k) * D;
  const kindOf = Object.fromEntries(data.lines.map((x) => [x.id, x]));
  const phraseVec = new Map();
  const vecOf = async (t) => { if (!phraseVec.has(t)) phraseVec.set(t, embed(t)); return phraseVec.get(t); };

  function bestIntent(v) {
    let best = -1, score = -1;
    intents.forEach((k, j) => { const s = dot(v, vectors, iRow(j)); if (s > score) { score = s; best = k; } });
    return { say: data.match.intents[best]?.say ?? [], score };
  }
  const wordsOf = new Map();
  const quoteWords = (id) => { if (!wordsOf.has(id)) wordsOf.set(id, words(`${kindOf[id].topic ?? ''} ${kindOf[id].text}`)); return wordsOf.get(id); };
  // the quotation that answers the question: closest in meaning to its own words (and sharing a word with the
  // question), or to a question it answers (ASK in the library). Also says whether the question is about the Seerah.
  const askText = data.match.askText ?? [];
  function bestQuote(v, text, recent) {
    const score = new Map(), viaAsk = new Set();
    const see = (id, s, ask) => { if (recent.includes(id)) return; if (s > (score.get(id) ?? -1)) { score.set(id, s); if (ask) viaAsk.add(id); else viaAsk.delete(id); } };
    quotes.forEach((id, i) => see(id, dot(v, vectors, qRow(i)), false));
    // a question the library knows (ASK) counts only when it is the same kind of question and shares a real word
    const mineWh = whOf(text), mineW = words(text);
    asks.forEach((id, k) => {
      const s = dot(v, vectors, aRow(k)) + 0.03;
      if (s < CLOSE.ask) return;
      const wh = whOf(askText[k]);
      if (mineWh && wh && mineWh !== wh) return;
      if (!shares(mineW, words(askText[k]))) return;
      see(id, s, true);
    });
    const ranked = [...score].sort((a, b) => b[1] - a[1]);
    const mine = words(text);
    const seerahNear = ranked.some(([x, t]) => kindOf[x]?.kind === 'seerah' && t >= CLOSE.quote);
    for (const [id, s] of ranked.slice(0, 8)) {
      const seerah = kindOf[id]?.kind === 'seerah';
      const asked = viaAsk.has(id);
      // Ibn Kathir's passages are parts of one long story, so one is said only when it answers a question the
      // library knows; otherwise he points the student to the whole story in the Seerah Quest
      if (seerah && !asked) continue;
      if (!asked && (s < CLOSE.quote || !shares(mine, quoteWords(id)))) continue;
      return { id, score: s, seerahNear };
    }
    return { id: null, score: ranked[0]?.[1] ?? -1, seerahNear };
  }

  async function think({ phase = 'question', options = [], said = '', recent = [] }) {
    const text = String(said).trim();
    if (!text) return { answer: -1, say: [] };
    if (UNSAFE.test(text)) return { answer: -1, say: ['c-thanks', 'c-tell-adult'] };
    if (RUDE.test(text)) return { answer: -1, say: ['c-kind-words'] };
    const v = await embed(text);
    const it = bestIntent(v);

    if (phase === 'answer') {
      // the button the student meant: each answer and the ways a child might say it
      let answer = -1, top = -1, second = -1;
      for (let i = 0; i < options.length; i++) {
        let s = -1;
        for (const p of [options[i], ...(phrases[options[i]] ?? [])]) s = Math.max(s, dot(v, await vecOf(p)));
        if (s > top) { second = top; top = s; answer = i; } else if (s > second) second = s;
      }
      if (top < CLOSE.answer || top - second < 0.04) answer = -1;
      const aside = it.score >= CLOSE.intent && it.say.every((id) => ASIDE.has(id)) ? it.say.filter((id) => !recent.includes(id)) : [];
      if (answer < 0 && !aside.length) return { answer: -1, say: [] };
      return { answer, say: aside };
    }

    // a question or a remark, before the recitation
    const q = bestQuote(v, text, recent);
    const asked = QUESTION.test(text);
    const lead = pickFresh(['c-good-question', 'c-lovely-question'], recent);
    // where to find it in the classroom: after "What a lovely question", when it was a question
    const withLead = (say) => (asked && say.length === 1 && POINTERS.has(say[0]) ? [lead, ...say] : say);
    if (it.score >= CLOSE.intent && it.score >= q.score - 0.03) return { answer: -1, say: withLead(it.say) };
    if (q.id) {
      const say = [pickFresh(['c-good-question', 'c-lovely-question', 'c-let-me-share'], recent), q.id];
      if (kindOf[q.id]?.kind === 'seerah' && !recent.includes('c-seerah')) say.push('c-seerah');   // where to hear the whole story
      return { answer: -1, say };
    }
    if (asked && q.seerahNear && !recent.includes('c-seerah')) return { answer: -1, say: [lead, 'c-seerah'] };   // the whole story is in the Seerah Quest
    if (asked) return { answer: -1, say: [lead, pickFresh(['c-ask-teacher', 'c-ask-teacher-2'], recent)] };
    if (it.score >= CLOSE.intent - 0.08) return { answer: -1, say: withLead(it.say) };
    if (text.split(/\s+/).length <= 2) return { answer: -1, say: ['c-again'] };
    return { answer: -1, say: [pickFresh(['c-thanks-2', 'c-thanks'], recent)] };
  }
  return { think, embed };
}

// ── in the browser ──
const ORT = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/';
const loadScript = (src) => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.append(s); });
let mindP = null;
export function loadLocalMind() {
  mindP ??= (async () => {
    try {
      const { u } = await import('./url.mjs');
      if (!window.ort) await loadScript(ORT + 'ort.min.js');
      window.ort.env.wasm.wasmPaths = ORT;
      window.ort.env.wasm.numThreads = 1;
      const [data, vec, vocab, { SYN }] = await Promise.all([
        fetch(u('data/sheikh-library.json')).then((r) => r.json()),
        fetch(u('data/sheikh-vectors.bin')).then((r) => r.arrayBuffer()),
        fetch(u('models/minilm/vocab.txt')).then((r) => r.text()),
        import('./listen-en.mjs'),
      ]);
      const { embed } = await embedder({ ort: window.ort, model: u('models/minilm/model.onnx'), vocab });
      await embed('hello');   // warm up, so the first real answer is quick
      return createLocalMind({ data, vectors: new Float32Array(vec), embed, phrases: SYN });
    } catch (e) {
      console.warn('[sheikh] the on-device understanding could not load:', e?.message ?? e);
      return null;
    }
  })();
  return mindP;
}
