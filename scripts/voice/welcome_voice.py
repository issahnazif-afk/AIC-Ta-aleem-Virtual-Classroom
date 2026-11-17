"""Record the welcome at the level doors (src/pages/index.astro) in the Sheikh's voice: the Arabic greeting, then the
English. Several takes of each; every take is checked with Whisper (the Arabic with the multilingual model) and the
clearest is kept as public/voice/welcome-ar.mp3 and public/voice/welcome-en.mp3. All the takes stay in TAKES_DIR.

  C:/Users/csgrad/projects/ilm-voice/env/Scripts/python scripts/voice/welcome_voice.py TAKES_DIR [--takes 3]

Runs on a developer machine with an NVIDIA GPU (not in CI); the two clips are committed.
"""
import argparse
import os
import re
import shutil
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(Path(__file__).parent))
from voxcpm_lines import squash  # noqa: E402

REF = ROOT / "scripts/voice/refs/sheikh.wav"
OUT = ROOT / "public/voice"
SR_OUT = 24000
# the words shown on the welcome screen (the Arabic ends at a pause, so the last word has no ending vowel)
LINES = {
    "ar": "السَّلامُ عَلَيْكُمْ. أَهْلاً وَسَهْلاً بِالدُّخُول.",
    "en": "Assalaamu alaikum, peace be upon you. You are most welcome. Please, come in.",
}


def ar_plain(s):
    s = re.sub(r"[\u064B-\u0652\u0670\u0640]", "", s)          # vowel marks and tatweel
    s = re.sub(r"[أإآٱ]", "ا", s).replace("ة", "ه").replace("ى", "ي")
    return re.sub(r"[^\u0621-\u064A]", "", s)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("takes_dir"); ap.add_argument("--takes", type=int, default=3)
    args = ap.parse_args()

    import torch
    import torchaudio.functional as AF
    from faster_whisper import WhisperModel
    from jiwer import cer
    from voxcpm import VoxCPM

    takes = Path(args.takes_dir); takes.mkdir(parents=True, exist_ok=True)
    tts = VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False, optimize=os.environ.get("VOX_OPTIMIZE") == "1")
    sr = getattr(getattr(tts, "tts_model", None), "sample_rate", None) or 48000
    made = {k: [] for k in LINES}
    for k, text in LINES.items():
        for t in range(args.takes):
            wav = np.asarray(tts.generate(text=text, reference_wav_path=str(REF), inference_timesteps=10), dtype=np.float32).squeeze()
            wav = wav / max(1e-6, np.abs(wav).max()) * 0.89
            wav = AF.resample(torch.from_numpy(wav), sr, SR_OUT).numpy()
            p = takes / f"welcome-{k}-take{t + 1}.mp3"
            sf.write(p, wav, SR_OUT, format="MP3", compression_level=0.6)
            made[k].append((p, wav))
            print("made", p.name, f"{len(wav) / SR_OUT:.1f}s", flush=True)
    del tts
    torch.cuda.empty_cache()

    ears = {"en": WhisperModel("small.en", device="cpu", compute_type="int8", cpu_threads=8),
            "ar": WhisperModel("small", device="cpu", compute_type="int8", cpu_threads=8)}
    OUT.mkdir(parents=True, exist_ok=True)
    for k, text in LINES.items():
        plain = ar_plain if k == "ar" else squash
        best = None
        for p, wav in made[k]:
            w16 = AF.resample(torch.from_numpy(wav), SR_OUT, 16000).numpy()
            heard = " ".join(s.text for s in ears[k].transcribe(w16, language=k, beam_size=5)[0]).strip()
            e = cer(plain(text), plain(heard))
            print(f"{p.name}: CER {e:.2f} heard '{heard}'", flush=True)
            if best is None or e < best[0]:
                best = (e, p)
        shutil.copyfile(best[1], OUT / f"welcome-{k}.mp3")
        print(f"kept {best[1].name} (CER {best[0]:.2f}) as public/voice/welcome-{k}.mp3", flush=True)


if __name__ == "__main__":
    sys.exit(main())
