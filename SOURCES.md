# Sources and licences

| What | From | Licence | How it is used |
|---|---|---|---|
| Quran text (Uthmani, v1.1) | [Tanzil Project](https://tanzil.net) | CC BY 3.0, verbatim copies only | `sources/tanzil/quran-uthmani.xml`, committed unchanged. The notice is copied into every derived JSON file. |
| Mushaf layout (KFGQPC V2, 604 × 15 lines) | [QUL, Tarteel](https://qul.tarteel.ai) | As published on QUL | `sources/qul/layout-qpc-v2-15.json`. |
| KFGQPC Uthmanic Hafs font | King Fahd Glorious Quran Printing Complex | KFGQPC font licence | `public/fonts/UthmanicHafs_V22.ttf`, as in the main app. |
| Recitations (the Sheikh's voice) | [EveryAyah](https://everyayah.com) | As published by each reciter | Streamed directly; not stored. |
| Word audio (the Sheikh's prompts) | [Quran.com](https://quran.com) word-by-word audio | As published | Streamed directly; not stored. |
| Face Landmarker model and runtime | [Google MediaPipe](https://ai.google.dev/edge/mediapipe) | Apache 2.0 | Runtime from the `@mediapipe/tasks-vision` package; model downloaded at build time. |
| Speech model `qaaf-asr` (optional) | Qa-af Wal Quran-ul-Majeed | As in the main app | Copied from the main app's GitHub release at build time. |
| Logo | Al-Huda Islamic Centre | Belongs to Al-Huda Islamic Centre | `public/logo-*.png`, `icon-192.png`, `apple-touch-icon.png`, `favicon-64.png`. |
| Arabic voice *Kareem* (ar_JO, medium) | [Piper](https://github.com/rhasspy/piper) voices, via the [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx) release `tts-models`; trained on the [arabicttstrain](https://github.com/AliMokhammad/arabicttstrain) dataset | As published with the voice (see its model card) | Used once, offline, by `scripts/voice/make_voice.py` to make the clips in `public/audio/voice/`. The voice itself is not shipped. |
| Amiri font | [Amiri](https://www.amirifont.org), via `@fontsource/amiri` | SIL Open Font Licence 1.1 | The alphabet boards and games (it always dots ي). |
| Playfair Display and Manrope fonts | Google Fonts, via `@fontsource` | SIL Open Font Licence 1.1 | Headings and text, matching alhudaislamiccentre.ca. |
| Alif Ba lessons | The school's booklet *Alif Ba, Your Road to Reading Qur'an Al-Kerim* | Belongs to the school | Lesson order, rules and the reading-speed table in `src/lib/lessons.mjs`. |
| *al-Bidaya wa'l-Nihaya*, Ibn Kathir (d. 774/1373), vol. 2 | ed. ʿAli Shiri, Dar Ihyaʾ al-Turath al-ʿArabi, Beirut, 1408/1988 (al-Maktaba al-Shamela no. 8376), digital text from [OpenITI](https://github.com/OpenITI/0775AH) (`0774IbnKathir.Bidaya.Shamela0008376-ara2`) | The text is in the public domain; OpenITI's digital edition is CC BY-NC-SA 4.0 | The only source for the Seerah Quest. Short passages are quoted with volume and page in `src/data/seerah/sources.json` and `docs/seerah-source-record.md`; the English is the school's own translation, pending review. |
| three.js and its Sky / SimplexNoise add-ons | [three.js](https://threejs.org) | MIT | The Seerah Quest's 3D world (`src/lib/seerah/world.mjs`). Loaded only when a student opens an episode. |
| WORLD vocoder, via `pyworld` | [WORLD](https://github.com/mmorise/World) / [pyworld](https://github.com/JeremyCCHsu/Python-Wrapper-for-World-Vocoder) | Modified BSD / MIT | Used at build time by `make_voice.py` to calm the pitch and steady the held letter sounds. Not shipped. |
| Teachers' recordings (Voice Studio) | The school's teachers | Belong to the school | Saved in the school's Google Drive; played to students in place of the computer voice. |
