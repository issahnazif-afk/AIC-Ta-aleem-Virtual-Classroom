# The expected sounds of every ayah for the Sheikh's tajweed ear (src/lib/tajweed-ear/), Hafs. Made once and kept in
# sources/tajweed-ref/ (scripts/quran/tajweed-ref.mjs copies them into the site).
# Needs: pip install quran-transcript levenshtein, and imam.py from https://huggingface.co/Hisnlabs/tajweed-v2 (Apache-2.0)
# Usage: python -I -X utf8 scripts/quran/tajweed_ref.py <folder with imam.py> . [surah numbers]
#        → public/quran/data/tajweed-ref/NNN.json, then copy them to sources/tajweed-ref/
import sys, os, json, re, time
MODEL, REPO = sys.argv[1], sys.argv[2]; sys.path.insert(0, MODEL)
import imam
from quran_transcript import Aya
OUT = os.path.join(REPO, 'public/quran/data/tajweed-ref'); os.makedirs(OUT, exist_ok=True)
LETTER = re.compile('[\u0621-\u064A\u0671-\u06D3]')
KINDS = ['madd', 'qalqalah', 'ikhfa', 'iqlab', 'ghunnah', 'idgham_ghunnah', 'shadda', 'idgham']
RULES = list(imam.MADD.keys())
def our_words(ar):
    n = 0
    for t in ar.split():
        if LETTER.search(t) or n == 0: n += 1
    return n
def ref_of(words):
    r = imam.expected(words)
    return {'p': r.phonemes, 'w': [list(s) for s in r.spans],
            'u': [[u.s, u.e, KINDS.index(u.kind), u.word, u.golden, RULES.index(u.rule) if u.rule else -1, u.char] for u in r.units]}
bad, t0 = [], time.time()
only = [int(x) for x in sys.argv[3:]]
for s in (only or range(1, 115)):
    sura = json.load(open(os.path.join(REPO, f'public/quran/data/surah/{s:03d}.json'), encoding='utf8'))
    out = {'v': 1, 'kinds': KINDS, 'rules': RULES, 'a': {}}
    for ay in sura['ayahs']:
        a = ay['a']
        words = Aya(s, a).get().uthmani.split(' ')
        n = our_words(ay['ar']) - (1 if (s, a) == (37, 130) else 0)
        if len(words) != n and (s, a) != (37, 130): bad.append((s, a, len(words), n)); continue
        if (s, a) == (37, 130):  # «إِلْ يَاسِينَ» is one word in the app
            r = ref_of(words); r['w'][2:4] = [[r['w'][2][0], r['w'][3][1]]]
            r['u'] = [x[:3] + [x[3] - (x[3] >= 3)] + x[4:] for x in r['u']]; out['a'][a] = r; continue
        try: out['a'][a] = ref_of(words)
        except Exception as e: bad.append((s, a, 'err', repr(e)[:80]))
    if s == 1 or sura.get('bismillah'):
        out['b'] = ref_of(Aya(1, 1).get().uthmani.split(' ')) if s != 9 else None
    json.dump(out, open(os.path.join(OUT, f'{s:03d}.json'), 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
    print(s, len(out['a']), f'{time.time()-t0:.0f}s', flush=True)
print('mismatched', len(bad), bad[:30])
