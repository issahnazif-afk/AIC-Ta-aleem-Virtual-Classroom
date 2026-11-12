// Sentence meaning as numbers, on the student's own device: all-MiniLM-L6-v2 (Apache 2.0, the 8-bit ONNX of
// Xenova/all-MiniLM-L6-v2) run by onnxruntime-web. Two sentences that mean much the same thing get vectors that point
// the same way; the Sheikh uses this to find the line in his library closest to what the student said
// (src/lib/sheikh-local.mjs). Nothing the student says leaves the device.
//
// The same code runs at build time in Node (scripts/sheikh/library.mjs) to turn the library into vectors.
//   embedder({ model: Uint8Array | url, vocab: string (one token a line) }) → { embed(text) → Float32Array(384) }

const MAX_TOKENS = 256;

// ── the BERT tokenizer (uncased WordPiece), as in the model's tokenizer.json ──
function isPunct(ch) {
  const c = ch.codePointAt(0);
  if ((c >= 33 && c <= 47) || (c >= 58 && c <= 64) || (c >= 91 && c <= 96) || (c >= 123 && c <= 126)) return true;
  return /\p{P}/u.test(ch);
}
const isCjk = (c) => (c >= 0x4e00 && c <= 0x9fff) || (c >= 0x3400 && c <= 0x4dbf) || (c >= 0x20000 && c <= 0x2a6df) || (c >= 0xf900 && c <= 0xfaff) || (c >= 0x2f800 && c <= 0x2fa1f);
function basicTokens(text) {
  let t = '';
  for (const ch of String(text)) {
    const c = ch.codePointAt(0);
    if (c === 0 || c === 0xfffd || (/\p{C}/u.test(ch) && !/[\t\n\r]/.test(ch))) continue;
    if (/\s/u.test(ch)) t += ' ';
    else if (isCjk(c)) t += ` ${ch} `;
    else t += ch;
  }
  t = t.toLowerCase().normalize('NFD').replace(/\p{Mn}/gu, '');
  const out = [];
  for (const w of t.split(/\s+/)) {
    if (!w) continue;
    let cur = '';
    for (const ch of w) {
      if (isPunct(ch)) { if (cur) out.push(cur); out.push(ch); cur = ''; } else cur += ch;
    }
    if (cur) out.push(cur);
  }
  return out;
}
function wordPiece(word, vocab) {
  if ([...word].length > 100) return ['[UNK]'];
  const pieces = [];
  let start = 0;
  while (start < word.length) {
    let end = word.length, found = null;
    while (start < end) {
      const sub = (start > 0 ? '##' : '') + word.slice(start, end);
      if (vocab.has(sub)) { found = sub; break; }
      end--;
    }
    if (!found) return ['[UNK]'];
    pieces.push(found);
    start = end;
  }
  return pieces;
}

export async function embedder({ ort, model, vocab }) {
  const ids = new Map(vocab.split('\n').map((t, i) => [t.replace(/\r$/, ''), i]));
  const session = await ort.InferenceSession.create(model, { executionProviders: ['wasm'], graphOptimizationLevel: 'all' });
  const CLS = ids.get('[CLS]'), SEP = ids.get('[SEP]'), UNK = ids.get('[UNK]');
  const tokenize = (text) => {
    const t = [CLS];
    for (const w of basicTokens(text)) for (const p of wordPiece(w, ids)) { if (t.length >= MAX_TOKENS - 1) break; t.push(ids.get(p) ?? UNK); }
    t.push(SEP);
    return t;
  };
  let queue = Promise.resolve();
  async function run(text) {
    const tok = tokenize(text);
    const n = tok.length;
    const feeds = {
      input_ids: new ort.Tensor('int64', BigInt64Array.from(tok, BigInt), [1, n]),
      attention_mask: new ort.Tensor('int64', new BigInt64Array(n).fill(1n), [1, n]),
      token_type_ids: new ort.Tensor('int64', new BigInt64Array(n), [1, n]),
    };
    const out = await session.run(feeds);
    const h = (out.last_hidden_state ?? Object.values(out)[0]).data;   // [1, n, 384]
    const d = h.length / n;
    const v = new Float32Array(d);
    for (let i = 0; i < n; i++) for (let k = 0; k < d; k++) v[k] += h[i * d + k];   // mean of the tokens
    let norm = 0;
    for (let k = 0; k < d; k++) { v[k] /= n; norm += v[k] * v[k]; }
    norm = Math.sqrt(norm) || 1;
    for (let k = 0; k < d; k++) v[k] /= norm;
    return v;
  }
  // one at a time (the session is not re-entrant)
  return { embed: (text) => (queue = queue.then(() => run(text), () => run(text))) };
}

export const dot = (a, b, off = 0) => { let s = 0; for (let k = 0; k < a.length; k++) s += a[k] * b[off + k]; return s; };
