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
  // reciters: who recites the riwāyah, for Listen, the Hifz test and the classroom (src/quran/lib/rw-audio.mjs):
  //   everyayah: one file per āyah, numbered like Ḥafṣ (EveryAyah.com)
  //   mp3quran:  one file per sūrah, cut to the āyah with mp3quran's published timings (the riwāyah's own āyah
  //              numbers, mapped by scripts/quran/riwayah-diff.mjs into data/riwayah/<id>-map.json)
  riwayat: [
    { id: 'warsh', name: 'Warsh ʿan Nāfiʿ', edition: 'ara-quranwarsh', font: 'uthmanic-warsh-v21.ttf', reciters: [
      { id: 'warsh/warsh_yassin_al_jazaery_64kbps', name: 'Yassin al-Jazaery', src: 'everyayah' },
      { id: 'warsh/warsh_ibrahim_aldosary_128kbps', name: 'Ibrahim al-Dosary', src: 'everyayah' },
      { id: 'warsh/warsh_Abdul_Basit_128kbps', name: 'Abdul Basit ʿAbd al-Ṣamad', src: 'everyayah' },
      { id: '120', name: 'Maḥmūd Khalīl al-Ḥuṣarī', src: 'mp3quran', folder: 'https://cdn.mp3quran.net/audio/mahmoud-husary/r3/' },
      { id: '80', name: 'ʿUmar al-Qazabrī', src: 'mp3quran', folder: 'https://cdn.mp3quran.net/audio/omar-kazabri/r1/' },
      { id: '16', name: 'al-ʿUyūn al-Kūshī', src: 'mp3quran', folder: 'https://cdn.mp3quran.net/audio/laayoun-kouchi/r1/' },
    ] },
    { id: 'qaloon', name: 'Qālūn ʿan Nāfiʿ', edition: 'ara-quranqaloon', font: 'uthmanic-qaloun-v21.ttf', reciters: [
      { id: '270', name: 'Maḥmūd Khalīl al-Ḥuṣarī', src: 'mp3quran', folder: 'https://cdn.mp3quran.net/audio/mahmoud-husary/r5/' },
      { id: '75', name: 'ʿAlī al-Ḥudhayfī', src: 'mp3quran', folder: 'https://cdn.mp3quran.net/audio/ali-hudhaifi/r2/' },
      { id: '208', name: 'ad-Dūkālī Muḥammad al-ʿĀlim', src: 'mp3quran', folder: 'https://cdn.mp3quran.net/audio/dokali-alim/r1/' },
    ] },
    { id: 'doori', name: 'Ad-Dūrī ʿan Abī ʿAmr', edition: 'ara-qurandoori', font: 'uthmanic-douri-v20.ttf', reciters: [
      { id: '269', name: 'Maḥmūd Khalīl al-Ḥuṣarī', src: 'mp3quran', folder: 'https://cdn.mp3quran.net/audio/mahmoud-husary/r4/' },
    ] },
    { id: 'soosi', name: 'As-Sūsī ʿan Abī ʿAmr', edition: 'ara-quransoosi', font: 'uthmanic-sousi-v20.ttf', reciters: [
      { id: '65', name: 'ʿAbd al-Rashīd Ṣūfī', src: 'mp3quran', folder: 'https://cdn.mp3quran.net/audio/abdulrasheed-sufi/r2/' },
    ] },
    { id: 'shouba', name: 'Shuʿbah ʿan ʿĀṣim', edition: 'ara-quranshouba', font: 'uthmanic-shouba.8.ttf', reciters: [
      { id: '305', name: 'ʿAlī al-Ḥudhayfī', src: 'mp3quran', folder: 'https://cdn.mp3quran.net/audio/ali-hudhaifi/r3/' },
    ] },
    { id: 'bazzi', name: 'Al-Bazzī ʿan Ibn Kathīr', edition: 'ara-quranbazzi', font: 'uthmanic-bazzi.7.ttf', reciters: [
      { id: '296', name: 'ʿUkāshah Kamīnī', src: 'mp3quran', folder: 'https://cdn.mp3quran.net/audio/okasha-kameny/r2/' },
    ] },
    // (no recitation of Qunbul, āyah by āyah, is openly available yet: its text only)
    { id: 'qumbul', name: 'Qunbul ʿan Ibn Kathīr', edition: 'ara-quranqumbul', font: 'uthmanic-qumbul.7.ttf', reciters: [] },
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
