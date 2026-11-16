"""Record a list of lines with one VoxCPM2 voice (cloned from a reference take chosen in the audition), check each
English chunk with Whisper, and write <out>/<key>.mp3 + <out>/index.json. Resumable: a line whose text and voice
have not changed is skipped.

  C:/Users/csgrad/projects/ilm-voice/env/Scripts/python scripts/voice/voxcpm_lines.py LIST.json REF.wav OUT_DIR [--limit N] [--only k1,k2]

LIST.json: [{ "key": "...", "parts": [{ "text": "..." } | { "q": [surah, ayah, from, to] }] }]
index.json: { key: "key.mp3" | ["key-0.mp3", {"q": [...]}, "key-1.mp3"] }  (the reciter plays the q parts)
Runs on a developer machine with an NVIDIA GPU (not in CI); the clips are committed.
"""
import argparse
import hashlib
import os
import json
import re
import sys
import time
from pathlib import Path

import numpy as np
import soundfile as sf

SR_OUT = 24000
MAX_WORDS = 38
WER_OK = 0.08   # character error rate on the squashed text
TRIES = 3
GAP = 0.3


def chunks_of(text):
    sents = re.findall(r"[^.!?]+[.!?]+['’\")\]]*|[^.!?]+$", text.strip())
    out, cur = [], []
    for s in (x.strip() for x in sents if x.strip()):
        if cur and len(" ".join(cur + [s]).split()) > MAX_WORDS:
            out.append(" ".join(cur)); cur = []
        cur.append(s)
    if cur:
        out.append(" ".join(cur))
    return out


def norm(s):
    s = s.lower().replace("’", "'").replace("-", " ")
    s = re.sub(r"[^a-z0-9' ]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def squash(s):
    # spelling-tolerant form: transliterations (Bismillaah / Bismillah, Alhamdu lillaah / Alhamdulillah) and
    # Whisper's spellings differ in doubled letters and spaces, not in what was said
    s = norm(s).replace("'", "").replace(" ", "").replace("ee", "i").replace("oo", "u")
    return re.sub(r"(.)\1+", r"\1", s)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("list"); ap.add_argument("ref"); ap.add_argument("out")
    ap.add_argument("--limit", type=int, default=0); ap.add_argument("--only", default="")
    ap.add_argument("--steps", type=int, default=10)
    args = ap.parse_args()

    import torch
    import torchaudio.functional as AF
    from faster_whisper import WhisperModel
    from jiwer import cer
    from voxcpm import VoxCPM

    lines = json.loads(Path(args.list).read_text(encoding="utf-8"))
    if args.only:
        keep = set(args.only.split(","))
        lines = [l for l in lines if l["key"] in keep]
    out = Path(args.out); out.mkdir(parents=True, exist_ok=True)
    index_p, sig_p = out / "index.json", Path(args.list).with_suffix(".done.json")
    index = json.loads(index_p.read_text(encoding="utf-8")) if index_p.exists() else {}
    sigs = json.loads(sig_p.read_text(encoding="utf-8")) if sig_p.exists() else {}
    ref_sig = hashlib.md5(Path(args.ref).read_bytes()).hexdigest()[:8]

    tts = VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False, optimize=os.environ.get("VOX_OPTIMIZE") == "1")
    sr = getattr(getattr(tts, "tts_model", None), "sample_rate", None) or 48000
    asr = WhisperModel("small.en", device="cpu", compute_type="int8", cpu_threads=8)

    def say(text):
        best = None
        latin = not re.search(r"[\u0600-\u06FF]", text)
        for _ in range(TRIES):
            wav = np.asarray(tts.generate(text=text, reference_wav_path=args.ref, inference_timesteps=args.steps), dtype=np.float32).squeeze()
            if not latin:
                return wav, 0.0, "(Arabic: not checked)"
            w16 = AF.resample(torch.from_numpy(wav), sr, 16000).numpy()
            heard = " ".join(s.text for s in asr.transcribe(w16, language="en", beam_size=1)[0])
            e = cer(squash(text), squash(heard)) if squash(text) else 0.0
            if best is None or e < best[1]:
                best = (wav, e, heard)
            if e <= WER_OK:
                break
        return best

    done, t0 = 0, time.time()
    for line in lines:
        key = line["key"]
        sig = hashlib.md5(json.dumps([line["parts"], ref_sig], ensure_ascii=False).encode()).hexdigest()[:12]
        if sigs.get(key) == sig and key in index:
            continue
        texts = [p for p in line["parts"] if "text" in p]
        entry, k, worst = [], 0, 0.0
        for p in line["parts"]:
            if "q" in p:
                entry.append({"q": p["q"]}); continue
            pieces = []
            for i, ch in enumerate(chunks_of(p["text"])):
                if i:
                    pieces.append(np.zeros(int(sr * GAP), np.float32))
                wav, e, heard = say(ch)
                worst = max(worst, e)
                if e > WER_OK:
                    print(f"  ! {key} WER {e:.2f}: '{ch[:70]}' heard '{heard[:70]}'", flush=True)
                pieces.append(wav)
            audio = np.concatenate(pieces)
            audio = audio / max(1e-6, np.abs(audio).max()) * 0.89
            audio = AF.resample(torch.from_numpy(audio), sr, SR_OUT).numpy()
            name = f"{key}.mp3" if len(texts) == 1 else f"{key}-{k}.mp3"
            k += 1
            sf.write(out / name, audio, SR_OUT, format="MP3", compression_level=0.6)
            entry.append(name)
        index[key] = entry[0] if len(entry) == 1 else entry
        sigs[key] = sig
        index_p.write_text(json.dumps(index, ensure_ascii=False, indent=0, sort_keys=True), encoding="utf-8")
        sig_p.write_text(json.dumps(sigs, indent=0, sort_keys=True), encoding="utf-8")
        done += 1
        print(f"[{done}] {key} worst WER {worst:.2f} · {(time.time() - t0) / 60:.1f} min", flush=True)
        if args.limit and done >= args.limit:
            break
    print("finished", done)


if __name__ == "__main__":
    sys.exit(main())
