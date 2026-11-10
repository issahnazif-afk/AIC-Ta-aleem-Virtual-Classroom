// Every fact the Play & Make games show, with its source. scripts/games/check.mjs checks each hadith reference
// against the hadith text (the same hadith-api as My Deen: the number exists, the key Arabic words are in it, and a
// hadith outside Bukhari and Muslim is graded sahih or hasan by al-Albani), runs the English through the writing
// check, and writes docs/activities-review.md, where Ustadh Issah approves each entry (scripts/games/approved.json).
//   src  { c, n }   a hadith (sunnah.com numbering), with key: Arabic words that must be in it
//   book '...'      a standard book of seerah or a Qur'an reference, for plain facts of history
// The wording is the school's own. Nothing is copied from the worksheets that gave the ideas for these games.

export const FACTS = {
  hijrah: {
    text: 'The Prophet ﷺ and Abu Bakr hid in the cave of Thawr for three nights. Then they rode to Quba, where he ﷺ stayed for more than ten nights and built a masjid. After that he rode on to Madinah, and his camel knelt down at the place where his masjid was built.',
    src: { c: 'bukhari', n: 3906 }, key: 'بضع عشرة ليلة وأسس المسجد الذي أسس على التقوى',
    also: { c: 'bukhari', n: 3905 }, alsoKey: 'بغار في جبل ثور فكمنا فيه ثلاث ليال',
  },
  hijrah63: {
    text: 'The Prophet ﷺ received the revelation at forty. He stayed in Makkah for thirteen years, then made the Hijrah and lived ten years in Madinah. He was sixty-three when he died.',
    src: { c: 'bukhari', n: 3902 }, key: 'فمكث بمكة ثلاث عشرة سنة يوحى إليه ثم أمر بالهجرة فهاجر عشر سنين',
  },
  tarawih: {
    text: 'The Prophet ﷺ said: "Whoever stands in prayer at night in Ramadan, with faith and hoping for Allah\'s reward, will have his past sins forgiven."',
    src: { c: 'bukhari', n: 37 }, key: 'من قام رمضان إيمانا واحتسابا غفر له ما تقدم من ذنبه',
  },
};

// for the review sheet: one entry per fact (each game's data file adds its own REVIEW list)
export const REVIEW = Object.entries(FACTS).map(([id, f]) => ({ id: `fact:${id}`, title: `Fact card: ${id}`, ...f }));
export const TEXTS = Object.entries(FACTS).map(([id, f]) => [`fact ${id}`, f.text, f.level ?? 3]);
