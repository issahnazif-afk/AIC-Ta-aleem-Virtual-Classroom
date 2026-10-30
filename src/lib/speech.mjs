// Speech recognition for the classroom.
// When the Qāf model (qaaf-asr) has been published to public/models/, it runs on the computer itself
// and no audio leaves it. Otherwise the browser's own Web Speech API is used (Chrome and Edge send
// the audio to Google's speech service; nothing is stored by this site).
import { LocalRecognition } from './asr-local.mjs';

export function getSpeechRecognition({ localAsr = false } = {}) {
  if (localAsr && navigator.mediaDevices?.getUserMedia) return { SR: LocalRecognition, engine: 'qaaf' };
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  return { SR, engine: SR ? 'browser' : null };
}

// Chrome can recognise speech on the device itself where an Arabic language pack is installed.
let localSpeech = false;
(async () => {
  try {
    const S = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (S?.available) localSpeech = (await S.available({ langs: ['ar-SA'], processLocally: true })) === 'available';
  } catch {}
})();
export function tuneRecognition(rec) {
  try { if (localSpeech && 'processLocally' in rec) rec.processLocally = true; } catch {}
  return rec;
}
