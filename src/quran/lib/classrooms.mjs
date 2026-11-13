// The riwāyah classrooms (src/quran/components/Classroom.astro): one per riwāyah that has open, authentic sources
// for both the text (KFGQPC) and the recitation, āyah by āyah.
import { LESSONS as WARSH_LESSONS, WARSH_RECITERS } from './warsh.mjs';
import { LESSONS as QALOON_LESSONS, QALOON_RECITERS } from './qaloon.mjs';

export const CLASSROOMS = {
  warsh: {
    id: 'warsh', short: 'Warsh', name: 'Warsh ʿan Nāfiʿ', ar: 'رِوَايَةُ وَرْشٍ عَنْ نَافِعٍ',
    lessons: WARSH_LESSONS, reciters: WARSH_RECITERS,
    // āyah by āyah from EveryAyah.com, numbered like Ḥafṣ
    audio: 'everyayah', audioSource: 'EveryAyah.com',
    notes: [],
  },
  qaloon: {
    id: 'qaloon', short: 'Qālūn', name: 'Qālūn ʿan Nāfiʿ', ar: 'رِوَايَةُ قَالُونَ عَنْ نَافِعٍ',
    lessons: QALOON_LESSONS, reciters: QALOON_RECITERS,
    // whole sūrahs from mp3quran.net, cut to one āyah with mp3quran's published timings (Madanī numbering)
    audio: 'mp3quran', audioSource: 'mp3quran.net (with its published āyah timings)',
    notes: ['The plural mīm (عَلَيْهِمْ، أَنتُمْ) is shown with a sukūn in the official Qālūn mushaf. Qālūn is also transmitted with it joined to a wāw (عَلَيْهِمُو); both are correct, and your teacher will tell you which to use.'],
  },
};

export const classFor = (riwayah) => CLASSROOMS[riwayah] ?? null;
