// Tries the Sheikh's free on-device understanding (src/lib/sheikh-local.mjs) on sentences a child might say, and
// checks each reply. Run after `node scripts/sheikh/library.mjs`:   node scripts/sheikh/try.mjs [--all]
//   want: the first quotation or line he should say (a prefix such as 'h-' means "any hadith"), or a list of
//   acceptable ones; 'teacher' means he sends the question to the teacher; answer: the button for the answer phase.
import fs from 'node:fs';
import * as ort from 'onnxruntime-web';
import { embedder } from '../../src/lib/sheikh-embed.mjs';
import { createLocalMind, CLOSE } from '../../src/lib/sheikh-local.mjs';
import { SYN } from '../../src/lib/listen-en.mjs';

const dir = new URL('../../public/', import.meta.url);
const data = JSON.parse(fs.readFileSync(new URL('data/sheikh-library.json', dir), 'utf8'));
const vectors = new Float32Array(fs.readFileSync(new URL('data/sheikh-vectors.bin', dir)).buffer.slice(0));
ort.env.wasm.numThreads = 1;
const { embed } = await embedder({ ort, model: new Uint8Array(fs.readFileSync(new URL('models/minilm/model.onnx', dir))), vocab: fs.readFileSync(new URL('models/minilm/vocab.txt', dir), 'utf8') });
const mind = createLocalMind({ data, vectors, embed, phrases: SYN });
const lib = Object.fromEntries(data.lines.map((x) => [x.id, x]));

const MOOD = ['Alhamdulillah, I am good', 'A little tired', 'Not so good'];
const AWAY = ['I was busy with school', 'I forgot', 'I was unwell', 'I was travelling', 'I recited with my teacher', 'I would rather not say'];
const HELP = ['My mum', 'My dad', 'My brother or sister', 'My grandparent', 'Only my teacher'];
const CASES = [
  // questions before the recitation
  ['q', 'why should I be kind to my neighbours', ['h-b6136', 'h-m2624', 'h-neighbour', 'h-']],
  ['q', 'who should I be most kind to', ['h-m2548', 'h-']],
  ['q', 'how should I treat my mother', ['h-m2548', 'h-']],
  ['q', 'what should I do when I get angry', ['h-b6114', 'h-b6116', 'h-']],
  ['q', 'is smiling a good deed', ['h-smile', 'h-m2626', 'h-']],
  ['q', 'what do I say when I sneeze', ['h-b6221', 'h-']],
  ['q', 'who is the best person', ['h-b5027', 'h-', 'teacher']],
  ['q', 'why is it good to learn the Quran', ['h-b5027', 'h-', 'teacher']],
  ['q', 'how do I stop forgetting what I memorised', ['c-revise', 'h-b5031', 'h-b5033']],
  ['q', 'what is the best way to memorise', ['c-memorise']],
  ['q', 'where was the Prophet born', ['h-l-born', 's-', 'h-', 'c-seerah']],
  ['q', 'what happened in the year of the elephant', ['s-', 'c-seerah']],
  ['q', 'tell me about the well of Zamzam', ['s-z', 'c-seerah']],
  ['q', 'who was Bilal', ['s-', 'teacher']],
  ['q', 'what happened when the first revelation came', ['s-r', 'h-l-hira', 'c-seerah', 'teacher']],
  ['q', 'how many rakahs is maghrib', ['teacher']],
  ['q', 'what is the meaning of life', ['teacher']],
  ['q', 'can I pray without wudu', ['teacher']],
  ['q', 'is music haram', ['teacher']],
  ['q', 'what will happen on the day of judgement', ['teacher']],
  ['q', 'are you a robot', ['c-computer']],
  ['q', 'who are you', ['c-who']],
  ['q', 'how are you sheikh', ['c-feel-good']],
  ['q', 'thank you sheikh', ['c-welcome']],
  ['q', 'my grandma died last week', ['c-sorry-loss']],
  ['q', 'I am sick today', ['c-get-well']],
  ['q', 'I have a big test tomorrow and I am scared', ['c-worried']],
  ['q', 'I memorised surah al mulk', ['c-proud-2']],
  ['q', 'I like playing football', ['c-nice']],
  ['q', 'my brother keeps hitting me', ['c-thanks']],
  ['q', 'someone at school is bullying me', ['c-thanks']],
  ['q', 'you are stupid', ['c-kind-words']],
  ['q', 'eid mubarak', ['c-eid']],
  ['q', 'what dua should I say before I sleep', ['c-duas', 'h-']],
  ['q', 'tell me a story', ['c-stories']],
  ['q', 'banana', ['c-again', 'c-thanks', 'c-thanks-2', 'c-nice']],
  // worded differently from the library's example questions
  ['q', 'do I have to be nice to the people next door', ['h-neighbour', 'h-m2624', 'h-b6136']],
  ['q', 'what does Islam say about getting mad', ['h-b6114', 'h-no-anger', 'h-b6116', 'q-3-134']],
  ['q', 'my friend is not talking to me after we argued', ['h-b6237', 'h-b6065', 'c-sorry-2', 'c-sorry']],
  ['q', 'is it okay to tell a small lie', ['h-truth', 'teacher']],
  ['q', 'why do we have to brush our teeth', ['h-brush']],
  ['q', 'what do muslims say before eating', ['h-right-hand', 'c-duas']],
  ['q', 'does Allah listen when I make dua', ['q-2-186']],
  ['q', 'who made the stars and the sky', ['q-39-62', 'teacher']],
  ['q', 'is it okay to eat with my left hand', ['h-right-hand']],
  ['q', 'what is jannah like', ['teacher']],
  ['q', 'why do we pray five times a day', ['teacher']],
  ['q', 'can kids fast in ramadan', ['teacher', 'c-ramadan']],
  ['q', 'who was the Prophets mother', ['s-', 'teacher']],
  ['q', 'what is the biggest sin', ['teacher']],
  ['q', 'is it haram to play video games', ['teacher']],
  ['q', 'do cats go to jannah', ['teacher']],
  ['q', 'why did the Prophet go to Madinah', ['s-', 'h-l-', 'teacher']],
  ['q', 'I do not have anything to ask', ['c-thanks', 'c-thanks-2', 'c-ready', 'c-again']],
  ['q', 'when was the Prophet born', ['s-b-agreed', 's-e-year', 'h-monday']],
  ['q', 'who was the very first Muslim', ['s-f-khadija']],
  ['q', 'how many people fought in the battle of Badr', ['s-bd-313']],
  ['q', 'what is the story of the trench', ['s-kh-dig', 'c-seerah']],
  ['q', 'who nursed the Prophet as a baby', ['s-b-halima', 'c-seerah']],
  ['q', 'what did Abu Bakr do', ['s-', 'c-seerah', 'teacher']],
  // answers to his questions
  ['a', 'I stayed up late so I am kind of sleepy', 1, MOOD],
  ['a', 'I feel great today alhamdulillah', 0, MOOD],
  ['a', 'not really well my stomach hurts', 2, MOOD],
  ['a', 'we went to visit family in Pakistan', 3, AWAY],
  ['a', 'I had lots of homework and exams', 0, AWAY],
  ['a', 'I just did not remember to do it', 1, AWAY],
  ['a', 'my nana listens to me every evening', 3, HELP],
  ['a', 'my mother helps me', 0, HELP],
];

const all = process.argv.includes('--all');
let pass = 0;
for (const [ph, said, want, options] of CASES) {
  const r = await mind.think({ phase: ph === 'q' ? 'question' : 'answer', options: options ?? [], said, recent: [] });
  let ok;
  if (ph === 'a') ok = r.answer === want;
  else {
    const first = r.say.find((id) => lib[id]?.kind !== 'line') ?? r.say.find((id) => !/question|share/.test(id)) ?? '';
    ok = want.some((w) => (w === 'teacher' ? r.say.some((id) => id.startsWith('c-ask-teacher')) : first.startsWith(w)));
  }
  if (ok) pass++;
  if (!ok || all) console.log(ok ? 'ok  ' : 'MISS', `"${said}" → ${ph === 'a' ? `answer ${r.answer} (${options[r.answer] ?? '-'}) ` : ''}${r.say.join(', ')}  ${r.say.filter((id) => lib[id]?.kind !== 'line').map((id) => '[' + lib[id].text.slice(0, 70) + ']').join(' ')}`);
}
console.log(`${pass} / ${CASES.length} as expected (close enough: ${JSON.stringify(CLOSE)})`);
