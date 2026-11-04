"""Kokoro v1.0 run straight from its ONNX file, so Muslim names can be given their real sounds.

Used by make_narration.py. Text becomes sounds through espeak-ng (the same sounds sherpa-onnx makes); a name written
{like this} (see NAMES in src/lib/narration-text.mjs) is already sounds and goes in as it is. Needs: pip install kokoro-onnx
"""
import re
import numpy as np
import onnxruntime as ort
from kokoro_onnx.tokenizer import Tokenizer
class Kokoro:
    def __init__(self, d):
        self.sess = ort.InferenceSession(d + 'model.onnx', providers=['CPUExecutionProvider'])
        self.names = self.sess.get_modelmeta().custom_metadata_map['speaker_names'].split(',')
        self.voices = np.fromfile(d + 'voices.bin', dtype=np.float32).reshape(len(self.names), -1, 256)
        self.vocab = {}
        for l in open(d + 'tokens.txt', encoding='utf8'):
            if l.strip(): t, i = l.rstrip('\n').rsplit(' ', 1); self.vocab[t if t else ' '] = int(i)
        self.vocab.setdefault(' ', 16)
        self.tok = Tokenizer()
        self.sample_rate = 24000
    STAND_IN = 'quixotic'
    def sounds(self, text):
        # the whole sentence goes to espeak at once (so "a" and "read" keep their context), each {name} as a stand-in word,
        # then each stand-in's sounds are swapped for the name's
        names = re.findall(r'\{([^}]*)\}', text)
        plain = re.sub(r'\{[^}]*\}', self.STAND_IN, text)
        ph = self.tok.phonemize(plain, 'en-us').strip()
        mark = self.tok.phonemize(self.STAND_IN, 'en-us').strip()
        parts = ph.split(mark)
        if len(parts) != len(names) + 1:       # espeak merged the stand-in with a neighbour: fall back to piece by piece
            return self.pieces(text)
        return ''.join(p + (names[i] if i < len(names) else '') for i, p in enumerate(parts))
    def pieces(self, text):
        out = []
        for p in re.split(r'(\{[^}]*\})', text):
            if not p: continue
            if p.startswith('{'): out.append(p[1:-1]); continue
            lead, core, tail = re.match(r'^(\s*)(.*?)(\s*)$', p, re.S).groups()
            if lead: out.append(' ')
            if re.search(r'[A-Za-z0-9]', core): out.append(self.tok.phonemize(core, 'en-us').strip())
            else: out.append(''.join(c for c in core if c in self.vocab))
            if tail: out.append(' ')
        return re.sub(r' +', ' ', ''.join(out)).strip()
    def generate(self, text, voice, speed=1.0):
        ph = self.sounds(text)
        ids = [self.vocab[c] for c in ph if c in self.vocab][:510]
        style = self.voices[self.names.index(voice), len(ids)][None, :]
        audio = self.sess.run(None, {'tokens': np.array([[0, *ids, 0]], dtype=np.int64), 'style': style, 'speed': np.array([speed], dtype=np.float32)})[0]
        return np.asarray(audio, np.float32).reshape(-1), ph
