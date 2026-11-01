"""Makes the Sheikh's voice clips for Alif Ba and the classroom.

Run once on a developer machine (not in CI). The clips are committed to public/audio/voice/.

    pip install onnxruntime numpy pyworld
    # voice: Piper "ar_JO-kareem-medium", from the sherpa-onnx release "tts-models":
    #   https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-ar_JO-kareem-medium.tar.bz2
    python scripts/voice/make_voice.py /path/to/vits-piper-ar_JO-kareem-medium

Sound-first letters (f-<letter>): the letters that can be held are held for about a second and a quarter
(ن "nnn", م "mmm", س "sss", ف "fff"), made from the voice's own sound and steadied; the letters that cannot be
held (ب ت د ق ك …) are said short and crisp. Every other clip is reshaped to a calmer, deeper delivery
(half the pitch movement, a semitone and a half lower).

Every clip is written from hand-checked phonemes (IPA, the same notation the voice was trained on),
not from Arabic text, so each letter is articulated exactly as listed below. A teacher's own
recording always replaces a clip (see README, "The Sheikh's voice").

Needs ffmpeg on the PATH.
"""
import json, os, subprocess, sys, wave
import numpy as np
import onnxruntime as ort
import pyworld as pw

LETTER_PACE = float(os.environ.get('LETTER_PACE', '1.4'))  # a little slower than speech
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'public', 'audio', 'voice')

# letter key, consonant phonemes, emphatic (heavy) letter
# The keys match src/lib/alifba.mjs. Alif carries the hamza sound when it has a vowel.
CONS = [
    ('alif', 'ʔ', 0), ('ba', 'b', 0), ('ta', 't', 0), ('tha', 'θ', 0), ('jim', 'dʒ', 0), ('ha-hollow', 'ħ', 0),
    ('kha', 'χ', 0), ('dal', 'd', 0), ('dhal', 'ð', 0), ('ra', 'r', 0), ('zay', 'z', 0), ('sin', 's', 0),
    ('shin', 'ʃ', 0), ('sad', 's̪', 1), ('dad', 'dˤ', 1), ('ta-heavy', 't̪', 1), ('dha-heavy', 'ð', 1), ('ayn', 'ʕ', 0),
    ('ghayn', 'ɣ', 0), ('fa', 'f', 0), ('qaf', 'q', 0), ('kaf', 'k', 0), ('lam', 'l', 0), ('mim', 'm', 0),
    ('nun', 'n', 0), ('ha', 'h', 0), ('waw', 'w', 0), ('ya', 'j', 0),
]
NAMES = {
    'alif': 'ʔˈalif', 'ba': 'bˈaːʔ', 'ta': 'tˈaːʔ', 'tha': 'θˈaːʔ', 'jim': 'dʒˈiːm', 'ha-hollow': 'ħˈaːʔ', 'kha': 'χˈaːʔ',
    'dal': 'dˈaːl', 'dhal': 'ðˈaːl', 'ra': 'rˈaːʔ', 'zay': 'zˈaːj', 'sin': 'sˈiːn', 'shin': 'ʃˈiːn', 'sad': 's̪ˈa.ːd',
    'dad': 'dˤˈa.ːd', 'ta-heavy': 't̪ˈa.ːʔ', 'dha-heavy': 'ðˈa.ːʔ', 'ayn': 'ʕˈajn', 'ghayn': 'ɣˈajn', 'fa': 'fˈaːʔ',
    'qaf': 'qˈaːf', 'kaf': 'kˈaːf', 'lam': 'lˈaːm', 'mim': 'mˈiːm', 'nun': 'nˈuːn', 'ha': 'hˈaːʔ', 'waw': 'wˈaːw', 'ya': 'jˈaːʔ',
}

def syllables():
    """Every letter with each vowel sign: the clips for Lessons 1, 4, 5 and 7."""
    out = {}
    for key, c, heavy in CONS:
        d = '.' if heavy else ''
        for v, ph in [('a', 'a'), ('i', 'i'), ('u', 'u')]:
            out[f's-{key}-{v}'] = f'{c}ˈ{ph}{d}'                     # بَ  بِ  بُ
            out[f's-{key}-{v}{v}'] = f'{c}ˈ{ph}{d}ː'                 # بَا بِي بُو (madd, one alif)
            out[f's-{key}-{v}n'] = f'{c}ˈ{ph}{d}n'                   # بً  بٍ  بٌ (tanween)
        pure = {'waw': 'w', 'ya': 'j'}.get(key, c)
        out[f's-{key}-sk'] = f'ʔˈa{d}{pure}'                          # أَبْ: the letter's own sound (sukun)
        out[f's-{key}-sh'] = f'ʔˈa{d}{pure}ːa{d}'                    # أَبَّ (shadda: the letter held, then read again)
        out[f'n-{key}'] = NAMES[key]
    return out

# Sound-first: which letters are held (continuous sounds) and which are short (stops).
HELD = {'tha', 'ha-hollow', 'kha', 'dhal', 'ra', 'zay', 'sin', 'shin', 'sad', 'dha-heavy', 'ayn', 'ghayn', 'fa', 'lam', 'mim', 'nun', 'ha'}

# The Sheikh's phrases (src/lib/phrases.mjs), written out by hand.
PHRASES = {
    'ahsanta': 'ʔˈaħsanta', 'ahsanti': 'ʔˈaħsanti',
    'mumtaz': 'mumtˈaːz', 'mumtazah': 'mumtˈaːzah',
    'jayyid-jiddan': 'dʒˈajjidun dʒˈiddaː',
    'mashaallah': 'mˈaː ʃˈaːʔa llˈaːh',
    'barakallahu-fik': 'bˈaːraka llˈaːhu fˈiːk', 'barakallahu-fiki': 'bˈaːraka llˈaːhu fˈiːki',
    'iqra-min': 'ʔˈiqraʔ min qˈawlihiː taʕˈaːlaː', 'iqrai-min': 'ʔˈiqraʔiː min qˈawlihiː taʕˈaːlaː',
    'tafaddal-iqra': 'tafˈadˤdˤa.l, ʔˈiqraʔ', 'tafaddali-iqrai': 'tafˈadˤdˤa.liː, ʔˈiqraʔiː',
    'iqra': 'ʔˈiqraʔ', 'iqrai': 'ʔˈiqraʔiː',
    'tabi': 'tˈaːbiʕ', 'tabii': 'tˈaːbiʕiː',
    'intabih': 'ʔintˈabih', 'intabihi': 'ʔintˈabihiː',
    'aid': 'ʔaʕˈid', 'aidi': 'ʔaʕˈiːdiː',
    'istami': 'ʔistˈamiʕ', 'istamii': 'ʔistˈamiʕiː',
    'unzur': 'ʔˈunðu.r ʔilˈajja', 'unzuri': 'ʔunðˈu.riː ʔilˈajja',
    'hasbuka': 'ħˈasbuka', 'hasbuki': 'ħˈasbuki',
    'raji': 'rˈaːdʒiʕ hˈaːða lmˈawdˤa.ʕ', 'rajii': 'rˈaːdʒiʕiː hˈaːða lmˈawdˤa.ʕ',
    'test-over-m': 'ʔintahˈa lixtibˈaːr, dʒazˈaːka llˈaːhu χˈajraː', 'test-over-f': 'ʔintahˈa lixtibˈaːr, dʒazˈaːki llˈaːhu χˈajraː',
}

def main(model_dir):
    cfg = json.load(open(os.path.join(model_dir, 'ar_JO-kareem-medium.onnx.json')))
    idmap = cfg['phoneme_id_map']
    sess = ort.InferenceSession(os.path.join(model_dir, 'ar_JO-kareem-medium.onnx'), providers=['CPUExecutionProvider'])
    rate = cfg['audio']['sample_rate']
    os.makedirs(OUT, exist_ok=True)

    def ids(ph):
        out = idmap['^'] + idmap['_']
        for ch in ph:
            if ch not in idmap: raise ValueError(f'phoneme {ch!r} in {ph!r} is not in the voice')
            out += idmap[ch] + idmap['_']
        return out + idmap['$']

    def synth(ph, length, noise_w=0.6, noise=0.5):
        x = np.array([ids(ph)], dtype=np.int64)
        audio = sess.run(None, {'input': x, 'input_lengths': np.array([x.shape[1]], dtype=np.int64),
                                'scales': np.array([noise, length, noise_w], dtype=np.float32)})[0].squeeze()
        return audio.astype(np.float32)

    # A lone sound comes out rushed and blurred. Said after "هذا حرفٌ،" it is articulated as in real
    # speech; the voice pauses at the comma, and the sound is cut out at that pause.
    CARRIER = 'hˈaːða ħˈarfun,'
    def synth_alone(ph, length):
        full = synth(f'{CARRIER} {ph}', length, 0.0, 0.4)
        pre = synth(CARRIER, length, 0.0, 0.4)
        fr = int(rate * 0.01)
        e = np.array([np.sqrt(np.mean(full[i:i + fr] ** 2)) for i in range(0, len(full) - fr, fr)])
        quiet = e < 0.02 * e.max()
        p = len(pre) // fr
        lo, hi = int(p * 0.55), min(len(e) - int(0.15 * rate / fr), int(p * 1.1))
        best, i = None, lo
        while i < hi:
            if quiet[i]:
                j = i
                while j < hi and quiet[j]: j += 1
                if best is None or j - i > best[1] - best[0]: best = (i, j)
                i = j
            else: i += 1
        start = (best[1] * fr - int(0.02 * rate)) if best else p * fr
        w = full[start:]
        loud = np.where(np.abs(w) > 0.03 * np.abs(w).max())[0]
        w = w[max(0, loud[0] - 200): loud[-1] + 400].copy()
        a, b = int(rate * 0.008), int(rate * 0.04)            # soft edges: no click where it was cut
        w[:a] *= np.linspace(0, 1, a); w[-b:] *= np.linspace(1, 0, b)
        return w

    # ── calmer, deeper delivery: keep half of the pitch movement, 1.5 semitones lower ──
    def calm(audio, keep=0.5, shift=-1.5):
        x = audio.astype(np.float64)
        f0, t = pw.harvest(x, rate, f0_floor=60, f0_ceil=300, frame_period=5)
        sp = pw.cheaptrick(x, f0, t, rate); ap = pw.d4c(x, f0, t, rate)
        v = f0 > 0
        if v.any():
            med = np.median(f0[v])
            f0[v] = med * 2 ** ((12 * np.log2(f0[v] / med) * keep + shift) / 12)
        return pw.synthesize(f0, sp, ap, rate, frame_period=5).astype(np.float32)

    # ── a held sound ("nnn"): the voice says the consonant many times in a row, which it renders as one
    #    continuous sound; its loudness and pitch are then steadied, with a soft start and a gentle fade ──
    def held(c, secs=1.25):
        k = 30
        for _ in range(6):
            a = synth(c * k, 1.3, 0.3, 0.33).astype(np.float64)
            if abs(len(a) / rate - secs) < 0.12: break
            k = max(6, int(k * secs / max(0.2, len(a) / rate)))
        f0, t = pw.harvest(a, rate, f0_floor=60, f0_ceil=300, frame_period=5)
        sp = pw.cheaptrick(a, f0, t, rate); ap = pw.d4c(a, f0, t, rate)
        en = sp.sum(axis=1); on = np.where(en > 0.03 * en.max())[0]
        sp, ap, f0 = sp[on[0]:on[-1] + 1], ap[on[0]:on[-1] + 1], f0[on[0]:on[-1] + 1]
        en = sp.sum(axis=1); n = len(en); i = np.arange(n)
        target = np.median(en) * np.maximum(np.minimum(1, i / 16) * np.minimum(1, (n - i) / 40), 1e-3)
        sp = sp * (target / np.maximum(en, 1e-12))[:, None]
        v = f0 > 0
        if v.sum() > n * 0.3: f0[:] = np.median(f0[v]) * 2 ** (-1.5 / 12)
        return pw.synthesize(f0, np.ascontiguousarray(sp), np.ascontiguousarray(ap), rate, frame_period=5).astype(np.float32)

    # ── a short sound ("b"): the consonant with only the first breath of its vowel ──
    def short(ph):
        w = synth_alone(ph, 1.3)
        keep = int(0.16 * rate); w = w[:keep].copy()
        f = int(0.06 * rate); w[-f:] *= np.linspace(1, 0, f) ** 2
        return w

    def write(name, audio, before=0.18, after=0.32):
        audio = np.concatenate([np.zeros(int(rate * before)), audio, np.zeros(int(rate * after))])
        fade = int(rate * 0.012)
        audio[:fade] *= np.linspace(0, 1, fade); audio[-fade:] *= np.linspace(1, 0, fade)
        pcm = (np.clip(audio / max(1e-6, np.abs(audio).max()) * 0.9, -1, 1) * 32767).astype(np.int16)
        tmp = os.path.join(OUT, f'{name}.wav')
        with wave.open(tmp, 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate); w.writeframes(pcm.tobytes())
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-af', 'loudnorm=I=-18:TP=-2,highpass=f=70',
                        '-ac', '1', '-ar', '22050', '-b:a', '48k', os.path.join(OUT, f'{name}.mp3')], check=True)
        os.remove(tmp)

    made = []
    # letters and syllables: slower and clearer, so each sound is easy for a child to hear
    for name, ph in syllables().items():
        write(name, calm(synth_alone(ph, LETTER_PACE))); made.append(name)
    # sound-first letters
    for key, c, heavy in CONS:
        d = '.' if heavy else ''
        if key in HELD: audio = held(c)
        elif key == 'alif': audio = calm(synth_alone('ʔˈa', 1.4))[: int(0.35 * rate)]
        else:
            cons = {'waw': 'w', 'ya': 'j'}.get(key, c)
            audio = short(f'{cons}ˈa{d}')
        write(f'f-{key}', audio); made.append(f'f-{key}')
    for name, ph in PHRASES.items():
        audio = calm(synth(ph, 1.15) if ' ' in ph.strip() else synth_alone(ph, 1.2))
        write(f'p-{name}', audio, 0.08, 0.2); made.append(f'p-{name}')
    json.dump(sorted(made), open(os.path.join(OUT, 'index.json'), 'w'))
    print(f'{len(made)} clips in {os.path.relpath(OUT)}')

if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '.')
