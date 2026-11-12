// Addresses in the adults' Quran Library: its pages, data and fonts live under /quran/ ("surah/1/" → /quran/surah/1/).
// The speech model, the recordings and the MediaPipe runtime are shared with the children's classroom, at the
// site's root ("models/qaaf-asr.onnx" → /models/qaaf-asr.onnx).
const SHARED = /^(models|audio|mediapipe)\//;
export const u = (p = '') => {
  const s = String(p).replace(/^\//, '');
  return import.meta.env.BASE_URL.replace(/\/?$/, '/') + (SHARED.test(s) ? '' : 'quran/') + s;
};
// the children's classroom and the rest of the site
export const site = (p = '') => import.meta.env.BASE_URL.replace(/\/?$/, '/') + String(p).replace(/^\//, '');
