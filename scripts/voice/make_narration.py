"""Records every English line of Story Time and the Seerah Quest as a warm, slow storyteller would read it.

  node scripts/voice/narration-list.mjs          # writes scripts/voice/narration.json (lines, speakers, keys)
  python3 scripts/voice/make_narration.py /path/to/kokoro-multi-lang-v1_0

Writes public/audio/narration/<key>.mp3 and public/audio/narration/index.json ({ key: { f, d } }).
Lines that already have a clip are skipped, so only new or changed sentences are recorded.
Needs: pip install sherpa-onnx==1.12.40 onnxruntime numpy soundfile pyworld scipy, and ffmpeg.
(sherpa-onnx 2.x reads Kokoro differently and skips English words; the script stops if that happens.)

The voice is Kokoro v1.0 (Apache 2.0). It reads quickly and evenly on its own, so each sentence is directed:
  - slow, with real pauses: after a sentence, longer after a question or an exclamation, longest after "…"
  - every sentence shaped by its kind (WORLD vocoder): the melody widened so the voice rises and falls like a
    storyteller's; exclamations brighter and louder; questions lifted at the end; quiet lines (sleepy, slowly,
    tired, "…") lower, softer and slower
  - the characters' words in their own voices: children lighter and higher, Mama and Teta, Baba and Jiddo, the
    teacher; the narrator is a warm female storyteller (af_heart)
  - a warm finish: a little body in the low voice, a soft top, a touch of room, and every clip equally loud
The Seerah Quest is read by a calm male narrator (bm_george), slower and steadier, without character voices.
"""
import json, os, re, subprocess, sys, tempfile
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'public', 'audio', 'narration')
LIST = os.path.join(ROOT, 'scripts', 'voice', 'narration.json')

# who: (Kokoro voice, speed, pitch shift in semitones, liveliness = how much the melody is widened)
CAST = {
    'story': {
        'narrator': ('af_heart', 0.80, -0.5, 1.25),
        'girl': ('af_sky', 0.88, 2.5, 1.45), 'boy': ('af_sky', 0.88, 1.0, 1.4), 'cat': ('af_sky', 0.8, 4.0, 1.5),
        'mama': ('bf_emma', 0.84, 0.0, 1.25), 'teta': ('bf_isabella', 0.80, -1.5, 1.2), 'teacher': ('af_sarah', 0.84, 0.0, 1.25),
        'man': ('am_michael', 0.84, -0.5, 1.2), 'jiddo': ('bm_george', 0.78, -1.5, 1.15),
    },
    'seerah': {'narrator': ('bm_george', 0.84, -0.5, 1.15)},
}
QUIET = re.compile(r'\b(slowly|softly|quiet|quietly|yawn|yawned|sleep|sleepy|asleep|whisper|whispered|tired|sighed|goodnight)\b', re.I)


def kind_of(s):
    t = s.rstrip('”"’ ')
    if t.endswith('!'):
        return '!'
    if t.endswith('?'):
        return '?'
    if '…' in s or '...' in s or QUIET.search(s):
        return 'soft'
    return '.'


def main(model_dir):
    import sherpa_onnx, soundfile as sf, pyworld as pw, scipy.signal as ss
    d = model_dir.rstrip('/') + '/'
    tts = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
        kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
            model=d + 'model.onnx', voices=d + 'voices.bin', tokens=d + 'tokens.txt', data_dir=d + 'espeak-ng-data',
            dict_dir=d + 'dict', lexicon=d + 'lexicon-us-en.txt,lexicon-zh.txt', lang='en-us'),
        num_threads=max(2, os.cpu_count() or 2))))
    import onnxruntime as ort
    names = ort.InferenceSession(d + 'model.onnx', providers=['CPUExecutionProvider']).get_modelmeta().custom_metadata_map['speaker_names'].split(',')
    SR = tts.sample_rate

    def trim(s, thr=0.01):
        env = np.convolve(np.abs(s), np.ones(240) / 240, mode='same'); on = np.where(env > thr)[0]
        return s if not len(on) else s[max(0, on[0] - int(SR * 0.03)):on[-1] + int(SR * 0.06)]

    def shape(x, kind, shift, live):
        x = x.astype(np.float64)
        f0, sp, ap = pw.wav2world(x, SR, frame_period=5.0)
        v = f0 > 0
        if v.sum() > 5:
            m = np.exp(np.mean(np.log(f0[v])))
            k = live * (1.18 if kind == '!' else 0.85 if kind == 'soft' else 1.0)
            f0[v] = m * (f0[v] / m) ** k
            f0[v] *= 2 ** ((shift + (1.2 if kind == '!' else -1.0 if kind == 'soft' else 0)) / 12)
            if kind == '?':
                idx = np.where(v)[0]; tail = idx[int(len(idx) * 0.75):]
                f0[tail] *= np.linspace(1, 2 ** (2.5 / 12), len(tail))
        y = pw.synthesize(f0, sp, ap, SR, frame_period=5.0)
        return (y * (1.12 if kind == '!' else 0.8 if kind == 'soft' else 1.0)).astype(np.float32)

    def warm(s):
        b, a = ss.butter(2, 9000 / (SR / 2), 'low'); s = ss.lfilter(b, a, s)
        b, a = ss.butter(2, [120 / (SR / 2), 400 / (SR / 2)], 'band'); s = s + 0.35 * ss.lfilter(b, a, s)
        n = int(SR * 0.35)
        ir = np.random.default_rng(1).standard_normal(n) * np.exp(-np.linspace(0, 9, n)); ir[0] = 0
        wet = ss.fftconvolve(s, ir)[:len(s)]; wet /= (np.max(np.abs(wet)) + 1e-9)
        s = s + 0.06 * wet * np.max(np.abs(s))
        voiced = s[np.abs(s) > 0.01]
        s = s * (0.17 / (np.sqrt(np.mean(voiced ** 2)) + 1e-9)) if len(voiced) else s
        s = np.tanh(s * 1.1) / np.tanh(1.1)
        f = min(len(s) // 4, 480); s[:f] *= np.linspace(0, 1, f); s[-f:] *= np.linspace(1, 0, f)
        return s.astype(np.float32)

    def read(x):
        cast = CAST[x['reader']]
        out = [np.zeros(int(SR * 0.2), np.float32)]
        for who, words in x['parts']:
            voice, speed, shift, live = cast.get(who, cast['narrator'])
            for s in [t for t in re.split(r'(?<=[.!?…])\s+', words) if t.strip()]:
                k = kind_of(s)
                a = tts.generate(s, sid=names.index(voice), speed=speed * (0.9 if k == 'soft' else 1.0))
                out.append(shape(trim(np.asarray(a.samples, np.float32)), k, shift, live))
                out.append(np.zeros(int(SR * (0.95 if '…' in s else 0.7 if k in '!?' else 0.6)), np.float32))
            out.append(np.zeros(int(SR * 0.12), np.float32))
        return warm(np.concatenate(out))

    os.makedirs(OUT, exist_ok=True)
    idx_path = os.path.join(OUT, 'index.json')
    index = json.load(open(idx_path)) if os.path.exists(idx_path) else {}
    lines = json.load(open(LIST))
    keep = {x['key'] for x in lines}
    for k in list(index):                        # clips no longer used are removed
        if k not in keep:
            try: os.unlink(os.path.join(OUT, index[k]['f'] + '.mp3'))
            except OSError: pass
            del index[k]
    index = {k: v for k, v in index.items() if os.path.exists(os.path.join(OUT, v['f'] + '.mp3'))}
    todo = [x for x in lines if x['key'] not in index]
    print(f'{len(lines)} lines, {len(todo)} to record')
    def check(x, s):
        # a clip must be long enough for its words (about 0.2 s a word at the least): if the speech library could not
        # read the words it gives a second or two of noise, and that must never reach the classroom
        words = sum(len(w.split()) for _, w in x['parts'])
        if len(s) / SR < 0.2 * words + 0.4:
            raise SystemExit(f'The voice did not read this line (got {len(s) / SR:.1f} s for {words} words): {x["text"][:80]!r}. '
                             f'Check the sherpa-onnx version (this script is tested with 1.12.40).')

    for n, x in enumerate(todo, 1):
        s = read(x)
        check(x, s)
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as t:
            sf.write(t.name, s, SR)
            subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', t.name, '-ac', '1', '-ar', '24000', '-b:a', '64k',
                            os.path.join(OUT, x['key'] + '.mp3')], check=True)
            os.unlink(t.name)
        index[x['key']] = {'f': x['key'], 'd': round(len(s) / SR, 2)}
        if n % 20 == 0 or n == len(todo):
            json.dump(index, open(idx_path, 'w'))
            print(f'  {n}/{len(todo)}', flush=True)
    json.dump(index, open(idx_path, 'w'))
    print('done:', len(index), 'clips')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '/tmp/kokoro-multi-lang-v1_0')
