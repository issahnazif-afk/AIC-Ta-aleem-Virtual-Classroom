"""Records every English line of Story Time and the Seerah Quest with a natural neural voice (Kokoro v1.0, Apache 2.0),
so the classroom reads like a person instead of the browser's robotic voice.

  node scripts/voice/narration-list.mjs          # writes scripts/voice/narration.json (the lines and their keys)
  python3 scripts/voice/make_narration.py /path/to/kokoro-multi-lang-v1_0

Writes public/audio/narration/<key>.mp3 and public/audio/narration/index.json ({ key: { f, d } }).
Lines that already have a clip are skipped, so only new or changed sentences are recorded.
Needs: pip install sherpa-onnx numpy soundfile, and ffmpeg.

Each line is spoken slightly slower than normal for young listeners, with a short breath of silence before and after,
gently levelled (so every clip is equally loud) and faded in and out. Sentences are spoken one at a time and joined with
a natural pause, which keeps the voice fresh and expressive on long pages.
"""
import json, os, re, subprocess, sys, tempfile
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'public', 'audio', 'narration')
LIST = os.path.join(ROOT, 'scripts', 'voice', 'narration.json')


def main(model_dir):
    import sherpa_onnx
    import soundfile as sf
    d = model_dir.rstrip('/') + '/'
    cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
        kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
            model=d + 'model.onnx', voices=d + 'voices.bin', tokens=d + 'tokens.txt', data_dir=d + 'espeak-ng-data',
            dict_dir=d + 'dict', lexicon=d + 'lexicon-us-en.txt,lexicon-zh.txt', lang='en-us'),
        num_threads=max(2, os.cpu_count() or 2)))
    tts = sherpa_onnx.OfflineTts(cfg)
    names = None
    try:
        import onnxruntime as ort
        names = ort.InferenceSession(d + 'model.onnx', providers=['CPUExecutionProvider']).get_modelmeta().custom_metadata_map['speaker_names'].split(',')
    except Exception:
        pass
    sid_of = lambda v: names.index(v) if names else {'af_heart': 3, 'bm_george': 26}[v]

    os.makedirs(OUT, exist_ok=True)
    idx_path = os.path.join(OUT, 'index.json')
    index = json.load(open(idx_path)) if os.path.exists(idx_path) else {}
    lines = json.load(open(LIST))
    keep = {x['key'] for x in lines}
    index = {k: v for k, v in index.items() if k in keep and os.path.exists(os.path.join(OUT, v['f'] + '.mp3'))}
    todo = [x for x in lines if x['key'] not in index]
    print(f'{len(lines)} lines, {len(todo)} to record')
    sr = tts.sample_rate
    for n, x in enumerate(todo, 1):
        parts = [p for p in re.split(r'(?<=[.!?…])\s+(?=[“"A-Z])', x['say']) if p.strip()]
        chunks = []
        for i, p in enumerate(parts):
            a = tts.generate(p, sid=sid_of(x['voice']), speed=x['speed'])
            s = np.asarray(a.samples, dtype=np.float32)
            s = trim(s, sr)
            chunks.append(s)
            if i < len(parts) - 1:
                chunks.append(np.zeros(int(sr * (0.45 if p.endswith('?') else 0.38)), np.float32))
        s = np.concatenate([np.zeros(int(sr * 0.12), np.float32)] + chunks + [np.zeros(int(sr * 0.25), np.float32)])
        s = level(s)
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as t:
            sf.write(t.name, s, sr)
            mp3 = os.path.join(OUT, x['key'] + '.mp3')
            subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', t.name, '-ac', '1', '-ar', '24000', '-b:a', '48k', mp3], check=True)
            os.unlink(t.name)
        index[x['key']] = {'f': x['key'], 'd': round(len(s) / sr, 2)}
        if n % 20 == 0 or n == len(todo):
            json.dump(index, open(idx_path, 'w'))
            print(f'  {n}/{len(todo)}')
    json.dump(index, open(idx_path, 'w'))
    print('done:', len(index), 'clips')


def trim(s, sr, thr=0.012):
    """Cut the silence the model leaves around a sentence, keeping 40 ms of air."""
    env = np.convolve(np.abs(s), np.ones(240) / 240, mode='same')
    on = np.where(env > thr)[0]
    if not len(on):
        return s
    pad = int(sr * 0.04)
    return s[max(0, on[0] - pad):min(len(s), on[-1] + pad)]


def level(s, target=0.16):
    """Bring every clip to the same loudness (RMS of the voiced parts), limit peaks, and fade the ends."""
    voiced = s[np.abs(s) > 0.01]
    rms = float(np.sqrt(np.mean(voiced ** 2))) if len(voiced) else 0
    if rms > 0:
        s = s * min(4.0, target / rms)
    s = np.tanh(s * 1.1) / np.tanh(1.1)          # soft limiter
    f = min(len(s) // 4, 480)
    s[:f] *= np.linspace(0, 1, f); s[-f:] *= np.linspace(1, 0, f)
    return s.astype(np.float32)


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '/tmp/kokoro-multi-lang-v1_0')
