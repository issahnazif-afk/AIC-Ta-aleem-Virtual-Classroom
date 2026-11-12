// Settings for the adults' Quran Library (taaleem.ca/quran/), brought over from the Qa-af Wal Quran-ul-Majeed app.
// The site's address and the class server are in site.config.mjs (shared with the children's classroom). This file
// is also loaded in the browser, so it must not read that one, which reads build-time settings.
export default {
  appName: "Ta'aleem Quran Library",

  // Translations baked into the site (fetched once at build time from AlQuran.cloud).
  // Edition ids: https://api.alquran.cloud/v1/edition?format=text&type=translation
  translations: [
    { id: 'en.sahih', name: 'Sahih International', lang: 'en', dir: 'ltr' },
  ],
  defaultTranslation: 'en.sahih',

  // Reciters streamed from EveryAyah (folder names on everyayah.com/data/)
  reciters: [
    { id: 'Alafasy_128kbps', name: 'Mishary Rashid Alafasy' },
    { id: 'Husary_128kbps', name: 'Mahmoud Khalil Al-Husary' },
    { id: 'Abdul_Basit_Murattal_192kbps', name: 'Abdul Basit (Murattal)' },
    { id: 'Minshawy_Murattal_128kbps', name: 'Mohamed Siddiq Al-Minshawi (Murattal)' },
  ],
  defaultReciter: 'Alafasy_128kbps',

  // Other riwayat: KFGQPC texts (via the fawazahmed0 Quran API on jsDelivr) shown in KFGQPC riwayah fonts.
  // Ayahs follow the Hafs (Kufan) numbering so they line up with everything else.
  riwayat: [
    { id: 'warsh', name: 'Warsh ʿan Nāfiʿ', edition: 'ara-quranwarsh', font: 'uthmanic-warsh-v21.ttf' },
    { id: 'qaloon', name: 'Qālūn ʿan Nāfiʿ', edition: 'ara-quranqaloon', font: 'uthmanic-qaloun-v21.ttf' },
    { id: 'doori', name: 'Ad-Dūrī ʿan Abī ʿAmr', edition: 'ara-qurandoori', font: 'uthmanic-douri-v20.ttf' },
    { id: 'soosi', name: 'As-Sūsī ʿan Abī ʿAmr', edition: 'ara-quransoosi', font: 'uthmanic-sousi-v20.ttf' },
  ],

  // Optional: word-by-word from Quran Foundation (needs QF_CLIENT_ID / QF_CLIENT_SECRET
  // as GitHub Actions secrets). If they are missing, the build simply skips this step.
  quranFoundation: {
    enabled: true,
    tokenUrl: 'https://oauth2.quran.foundation/oauth2/token',
    apiBase: 'https://apis.quran.foundation/content/api/v4',
    wordTranslationLanguage: 'en',
  },
};
