// What the VoxCPM2 voices are given to read: the line as shown, made ready for speech.
//  - references in brackets "(Qur'an 2:153)" are shown on screen, not read
//  - ﷺ is read in full; quotation marks and emoji are dropped
//  - Islamic phrases are written so the voice says them as a Muslim speaker would (SAY_ISLAMIC below)
// The Qur'an is never in this text: a reciter plays it (see hakim-list.mjs).

// spelling or script for each phrase, chosen by ear in the voice audition (scripts/voice/voxcpm_audition.py)
export const SAY_ISLAMIC = [
  [/billahi minash-shaytanir-rajim/gi, 'billaahi minash shaitaanir rajeem'], [/Assalamu alaykum/gi, 'Assalaamu alaikum'], [/Wa alaykum assalam/gi, 'Wa alaikum assalaam'],
  [/Jazak(?:a|i)llahu khayran/gi, 'Jazaakallaahu khairan'], [/Masha[’']?\s?Allah/gi, 'Maashaa Allah'],
  [/In sha[’']? Allah/gi, 'In shaa Allah'], [/Alhamdulillah/gi, 'Alhamdu lillaah'], [/SubhanAllah/gi, 'Subhaan Allah'],
  [/Bismillah/gi, 'Bismillaah'], [/Allahu Akbar/gi, 'Allaahu Akbar'], [/\bdu[’']a\b/gi, 'du-aa'], [/\bayah\b/gi, 'aayah'],
  [/Ayat al-Kursi/gi, 'Aayatul Kursi'], [/\bshaytan\b/gi, 'shaitaan'], [/\bzakat\b/gi, 'zakaah'], [/Abu Hurairah/g, 'Abu Huraira'],
  [/\bYunus\b/g, 'Yoonus'], [/\bMusa\b/g, 'Moosaa'], [/Ustadh/g, 'Ustaadh'], [/Qur[’']an/g, 'Quran'],
];

// the women among the Companions named before "(ra)" in the sources: their honorific is "radiyAllaahu anha"
const WOMAN = /(Aisha|mother of the faithful|\bUmm\b|Fatimah|Khadijah|Asma|Hafsah|Zaynab|Maymunah|Safiyyah)[^()]{0,40}$/i;

export function forVoice(text, say = SAY_ISLAMIC) {
  let s = text
    .replace(/\s*\((?:[^()]*\d[^()]*)\)|\s*\[[^[\]]*\d[^[\]]*\]/g, '')   // (Sahih al-Bukhari 2272; Qur'an 17:24), [23: 51]
    // a citation at the end, [Al-Bukhari] [Muslim] or (Bukhari & Muslim); "his brother (Muslim) for…" is the translator's
    .replace(/\s*[([]\s*(?:Sahih\s+)?(?:al-)?(?:Bukhari|Muslim)(?:\s*(?:&|and)\s*(?:Sahih\s+)?Muslim)?\s*[)\]](?=\s*(?:[([]|$))/gi, '')
    .replace(/\s*\((?:ra|RA)\)/g, (m, at, all) => (WOMAN.test(all.slice(Math.max(0, at - 80), at)) ? ', radiyAllaahu anha,' : ', radiyAllaahu anhu,'))
    .replace(/\bb\.\s+(?=['‘’ʿA-Z])/g, 'bin ')        // Abdullah b. 'Umar
    .replace(/\s&\s/g, ' and ')
    .replace(/ﷺ/g, ', peace and blessings be upon him,')
    .replace(/[“”"]/g, '')
    .replace(/\p{Extended_Pictographic}️?/gu, '')
    .replace(/\s+—\s+/g, ', ')
    // a translator's words in brackets, "desert (not talk to) his brother", are read as part of the sentence. The
    // brackets themselves must go: VoxCPM2 takes "(…)" at the start of a text as a voice instruction, not words
    // (from the inside out: "[all kinds of halal (legal) foods]")
    .replace(/\s*[([]\s*([^()[\]]*?)\s*[)\]]/g, ', $1,').replace(/\s*[([]\s*([^()[\]]*?)\s*[)\]]/g, ', $1,')
    .replace(/A‘udhu/g, 'Aoodhu')
    .replace(/‘/g, '').replace(/([.!?,])’/g, '$1')    // single quotation marks (not the apostrophe in Allah’s)
    .replace(/ḥ/g, 'h').replace(/ṣ/g, 's').replace(/ā/g, 'aa').replace(/ī/g, 'ee').replace(/ū/g, 'oo').replace(/[ʿʾ]/g, '');
  for (const [re, to] of say) s = s.replace(re, to);
  return s.replace(/\s+,/g, ',').replace(/([:;.!?]),/g, '$1').replace(/,\s*([:;])/g, '$1').replace(/,\s*,/g, ',').replace(/,\s*([.!?])/g, '$1').replace(/\s+/g, ' ').replace(/^[\s,.:;—-]+/, '').trim();
}
