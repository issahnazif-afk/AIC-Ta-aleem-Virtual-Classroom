"""VoxCPM2 audition for the Ta'aleem characters: Ustadh Hakim (Adventure game), the Sheikh, Grandpa Musa.

Run with the VoxCPM2 env (outside the repo; needs an NVIDIA GPU):
  C:/Users/csgrad/projects/ilm-voice/env/Scripts/python scripts/voice/voxcpm_audition.py C:/Users/csgrad/projects/ilm-voice/taaleem-audition

Each voice is DESIGNED from a description (no real person is cloned). Line 1 is spoken from the description;
lines 2 and 3 clone line 1, the way production clips are made, so you hear whether the voice stays the same.
  1  English, Islamic phrases in careful transliteration
  2  the same kind of line with the phrases in Arabic script (does the voice say them like an Arabic speaker?)
  3  Arabic only: short dhikr (never Qur'an: the Qur'an is always a human reciter)
"""
import html
import json
import sys
import time
from pathlib import Path

import numpy as np
import soundfile as sf

OUT = Path(sys.argv[1] if len(sys.argv) > 1 else "taaleem-audition")
OUT.mkdir(parents=True, exist_ok=True)

LINES = {
    "hakim": [
        "Sit with me, young explorer. The Prophet, peace and blessings be upon him, told of three men who sheltered in a cave. "
        "Begin with Bismillaah, and say it with me: Subhaan Allah. Alhamdu lillaah.",
        "أحسنت! Well done, young explorer. Say بسم الله to begin, and when you stumble, say الحمد لله and keep going. ما شاء الله, your shield is strong!",
        "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَاللَّهُ أَكْبَرُ.",
    ],
    "sheikh": [
        "Assalaamu alaikum! I am the Sheikh, and I will listen to your recitation. Take a calm breath, say Aoodhu billaahi minash shaitaanir rajeem, "
        "and begin when you are ready. Maashaa Allah, that was beautiful.",
        "السلام عليكم يا بني. Today we will practise Soorat al-Ikhlaas together. Remember the قلقلة on the letter د, and hold the مد for two counts. بارك الله فيك!",
        "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ. أَحْسَنْتَ يَا بُنَيَّ، بَارَكَ اللَّهُ فِيكَ.",
    ],
    "musa": [
        "Maashaa Allah, Yoosuf! Moving something harmful out of the way is a charity. See how it drinks? "
        "A little sip, then another. Let's learn one aayah each day, in shaa Allah.",
        "Come here, my dear. جزاك الله خيرا for helping your Teta today. Say الحمد لله, because Allah has given us so much. إن شاء الله we will visit the masjid tomorrow.",
        "الْحَمْدُ لِلَّهِ. جَزَاكَ اللَّهُ خَيْرًا يَا حَبِيبِي. إِنْ شَاءَ اللَّهُ.",
    ],
}

VOICES = [
    ("hakim", "H1", "A warm, gentle Arab man in his forties who speaks fluent English with a light Arabic accent, like a kind Islamic school teacher telling a story to children, calm, clear and expressive"),
    ("hakim", "H2", "A friendly British Muslim man in his forties with a soft British accent, a patient teacher telling a story around a campfire, warm and encouraging"),
    ("hakim", "H3", "A calm North American Muslim man in his forties, a warm storyteller and youth teacher, clear, unhurried and encouraging"),
    ("sheikh", "S1", "An older Arab sheikh in his sixties speaking fluent English with a gentle Arabic accent, slow, low, kind and reassuring, a Quran teacher listening to a child"),
    ("sheikh", "S2", "A dignified older Egyptian scholar in his sixties speaking English slowly and kindly, with a deep, calm voice, a patient Quran teacher"),
    ("sheikh", "S3", "A gentle older British Muslim imam in his sixties with a deep, soft voice, speaking slowly and warmly to a young student"),
    ("musa", "G1", "A loving grandfather in his seventies with a slight Arabic accent in English, warm, a little playful, speaking slowly and softly to his grandchildren"),
    ("musa", "G2", "A cheerful elderly grandfather in his seventies with a gentle Middle Eastern accent, kind and smiling as he talks to children"),
    ("musa", "G3", "A warm elderly British grandfather in his seventies, slow, soft and affectionate"),
]
LABEL = {"hakim": "Ustadh Hakim (Adventure game)", "sheikh": "The Sheikh (recitation & hifz)", "musa": "Grandpa Musa (story books)"}
LINE_NAME = ["1 · English + transliteration", "2 · English + Arabic script", "3 · Arabic only"]


def main():
    from voxcpm import VoxCPM

    t0 = time.time()
    import os, torch
    # torch.compile (optimize) is faster but needs more GPU memory; on a busy 12 GB card it spills and crawls
    model = VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False, optimize=os.environ.get("VOX_OPTIMIZE") == "1")
    sr = getattr(getattr(model, "tts_model", None), "sample_rate", None) or 48000
    print(f"model loaded in {time.time() - t0:.0f}s", flush=True)

    rows = []
    for who, code, desc in VOICES:
        ref = OUT / f"{code}-ref.wav"
        for k, text in enumerate(LINES[who]):
            t = time.time()
            name = f"{code}-line{k + 1}.mp3"
            if (OUT / name).exists() and ref.exists():      # resume: already made
                rows.append({"who": who, "code": code, "desc": desc, "line": k, "file": name, "text": text})
                continue
            if k == 0:
                wav = model.generate(text=f"({desc}){text}")
            else:
                wav = model.generate(text=text, reference_wav_path=str(ref))
            wav = np.asarray(wav, dtype=np.float32).squeeze()
            wav = wav / max(1e-6, np.abs(wav).max()) * 0.89
            if k == 0:
                sf.write(ref, wav, sr)
            sf.write(OUT / name, wav, sr, format="MP3")
            print(f"{name}: {len(wav) / sr:.1f}s in {time.time() - t:.0f}s", flush=True)
            rows.append({"who": who, "code": code, "desc": desc, "line": k, "file": name, "text": text})
            torch.cuda.empty_cache()
    (OUT / "results.json").write_text(json.dumps(rows, ensure_ascii=False, indent=1), encoding="utf-8")

    parts = []
    for who in LINES:
        parts.append(f"<h2>{LABEL[who]}</h2>")
        for _, code, desc in [v for v in VOICES if v[0] == who]:
            parts.append(f"<div class=v><h3>{code}</h3><p class=d>{html.escape(desc)}</p>")
            for r in [r for r in rows if r["code"] == code]:
                parts.append(f"<div class=l><span>{LINE_NAME[r['line']]}</span><audio controls preload=none src='{r['file']}'></audio>"
                             f"<p dir=auto>{html.escape(r['text'])}</p></div>")
            parts.append("</div>")
    (OUT / "index.html").write_text(
        "<!doctype html><meta charset=utf-8><title>Ta'aleem voice audition</title><style>"
        "body{font:15px system-ui;max-width:900px;margin:24px auto;padding:0 16px;background:#fbfaf6;color:#1f2a24}"
        "h2{border-bottom:2px solid #c9a84a;padding-bottom:4px;margin-top:36px}.v{background:#fff;border:1px solid #e3e0d6;border-radius:10px;padding:12px 16px;margin:12px 0}"
        ".d{color:#5b6660;font-style:italic;margin:2px 0 8px}.l{margin:8px 0}.l span{display:inline-block;width:230px;font-weight:600}"
        "audio{vertical-align:middle;height:34px}.l p{margin:2px 0 0 0;color:#444;font-size:14px}</style>"
        "<h1>Ta'aleem voice audition (VoxCPM2)</h1><p>All voices are designed from a description, not cloned from a real person. "
        "Lines 2 and 3 are cloned from line 1. The Qur'an is never read by these voices.</p>" + "".join(parts),
        encoding="utf-8")
    print("done", time.time() - t0)


if __name__ == "__main__":
    sys.exit(main())
