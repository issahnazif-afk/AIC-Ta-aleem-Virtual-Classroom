// The sentence model the Sheikh uses on the student's device (src/lib/sheikh-embed.mjs): all-MiniLM-L6-v2 (Apache 2.0),
// the 8-bit ONNX file published by Xenova, at a fixed revision. Downloaded once into public/models/minilm/
// (model.onnx and vocab.txt, one token a line), checked against its SHA-256.
import fs from 'node:fs';
import crypto from 'node:crypto';

const REV = '751bff37182d3f1213fa05d7196b954e230abad9';
const BASE = `https://huggingface.co/Xenova/all-MiniLM-L6-v2/resolve/${REV}/`;
const SHA = 'afdb6f1a0e45b715d0bb9b11772f032c399babd23bfc31fed1c170afc848bdb1';
export const DIR = new URL('../../public/models/minilm/', import.meta.url);

async function get(url) {
  for (let i = 0; i < 3; i++) {
    try { const r = await fetch(url); if (r.ok) return Buffer.from(await r.arrayBuffer()); } catch {}
    await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
  }
  throw new Error('could not download ' + url);
}

export async function ensureModel() {
  fs.mkdirSync(DIR, { recursive: true });
  const model = new URL('model.onnx', DIR), vocab = new URL('vocab.txt', DIR);
  const ok = (f) => fs.existsSync(f) && crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex') === SHA;
  if (!ok(model)) {
    const b = await get(BASE + 'onnx/model_quantized.onnx');
    if (crypto.createHash('sha256').update(b).digest('hex') !== SHA) throw new Error('the sentence model is not the expected file');
    fs.writeFileSync(model, b);
  }
  if (!fs.existsSync(vocab)) {
    const tj = JSON.parse((await get(BASE + 'tokenizer.json')).toString('utf8'));
    fs.writeFileSync(vocab, Object.entries(tj.model.vocab).sort((a, b) => a[1] - b[1]).map(([t]) => t).join('\n'));
  }
  return { model: new Uint8Array(fs.readFileSync(model)), vocab: fs.readFileSync(vocab, 'utf8') };
}
