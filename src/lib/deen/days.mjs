// Special days of the Islamic (Hijri) calendar, with what the Prophet ﷺ taught about each.
// The Hijri date is the Umm al-Qura calendar of the student's browser; local moon-sighting may differ by a day,
// so every date is shown as "about" and the class teacher's announcement comes first.
//   month (1 Muharram … 12 Dhul-Hijjah), day or days, weekday (0 Sunday … 6 Saturday) for weekly days
export const MONTHS = ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Akhir', 'Jumada al-Ula', 'Jumada al-Akhirah', 'Rajab', "Sha'ban", 'Ramadan', 'Shawwal', "Dhul-Qa'dah", 'Dhul-Hijjah'];

export const DAYS = [
  { id: 'jumuah', weekday: 5, title: "Jumu'ah (Friday)", icon: 'masjid',
    text: 'The best day of the week. We have a bath, wear clean clothes, go to the Jumu\'ah prayer and send many salawat on the Prophet ﷺ.',
    src: { c: 'muslim', n: 854 }, key: 'خير يوم طلعت عليه الشمس يوم الجمعه' },
  { id: 'mon-thu', weekday: [1, 4], title: 'Monday and Thursday', icon: 'moon',
    text: 'The Prophet ﷺ liked to fast on Mondays and Thursdays. He said that deeds are shown to Allah on these days.',
    src: { c: 'tirmidhi', n: 747 }, key: 'تعرض الاعمال يوم الاثنين والخميس' },
  { id: 'white', day: [13, 14, 15], title: 'The white days', icon: 'moon',
    text: 'The 13th, 14th and 15th of every Islamic month, when the moon is full and bright. The Prophet ﷺ taught us to fast these three days.',
    src: { c: 'tirmidhi', n: 761 }, key: 'فصم ثلاث عشره واربع عشره وخمس عشره' },
  { id: 'muharram', month: 1, day: [1], title: 'The Islamic New Year', icon: 'star',
    text: 'Muharram is the first month. The Prophet ﷺ called it the month of Allah, and said the best fasting after Ramadan is in Muharram.',
    src: { c: 'muslim', n: 1163 }, key: 'افضل الصيام بعد رمضان شهر الله المحرم' },
  { id: 'ashura', month: 1, day: [10], title: 'Ashura', icon: 'water',
    text: 'The 10th of Muharram. The Prophet ﷺ fasted on this day and said that Allah forgives the year before for it.',
    src: { c: 'muslim', n: 1162 }, key: 'وصيام يوم عاشوراء احتسب علي الله ان يكفر السنه التي قبله' },
  { id: 'ramadan', month: 9, title: 'Ramadan', icon: 'lantern',
    text: 'The month of fasting, when the Qur\'an was first sent down. We fast, pray, read the Qur\'an and give charity.',
    quran: { s: 2, a: 185, w: [1, 12] } },
  { id: 'qadr', month: 9, day: [21, 23, 25, 27, 29], title: 'The last ten nights of Ramadan', icon: 'star',
    text: 'Laylat al-Qadr is better than a thousand months. The Prophet ﷺ told us to look for it in the odd nights of the last ten.',
    src: { c: 'bukhari', n: 2017 }, key: 'تحروا ليله القدر في الوتر من العشر الاواخر', quran: { s: 97, a: 3 } },
  { id: 'fitr', month: 10, day: [1], title: 'Eid al-Fitr', icon: 'gift',
    text: 'The Eid after Ramadan, a day of joy. The Prophet ﷺ said that Allah has given us two days of celebration: Eid al-Adha and Eid al-Fitr.',
    src: { c: 'abudawud', n: 1134 }, key: 'ان الله قد ابدلكم بهما خيرا منهما يوم الاضحي ويوم الفطر' },
  { id: 'dhulhijjah', month: 12, day: [1, 2, 3, 4, 5, 6, 7, 8], title: 'The first ten days of Dhul-Hijjah', icon: 'star',
    text: 'The best days of the year for good deeds, the Prophet ﷺ said. Say "Allahu akbar" often and do extra good.',
    src: { c: 'bukhari', n: 969 }, key: 'ما العمل في ايام العشر افضل من العمل في هذه' },
  { id: 'arafah', month: 12, day: [9], title: 'The Day of Arafah', icon: 'mountain',
    text: 'The day the pilgrims stand at Arafah. The Prophet ﷺ said that fasting this day wipes away the sins of the year before and the year after.',
    src: { c: 'muslim', n: 1162 }, key: 'صيام يوم عرفه احتسب علي الله ان يكفر السنه التي قبله والسنه التي بعده' },
  { id: 'adha', month: 12, day: [10], title: 'Eid al-Adha', icon: 'gift',
    text: 'The Eid of the sacrifice, remembering Prophet Ibrahim. A day of prayer, family and sharing meat with the poor.',
    src: { c: 'abudawud', n: 1134 }, key: 'يوم الاضحي ويوم الفطر' },
];

// The Hijri date of a day: { d, m, y } (Umm al-Qura, as the browser calculates it)
export function hijri(date = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(date);
    const g = (t) => Number(parts.find((p) => p.type === t)?.value);
    return { d: g('day'), m: g('month'), y: g('year') };
  } catch { return null; }
}
export const hijriText = (h) => (h ? `${h.d} ${MONTHS[h.m - 1]} ${h.y}` : '');

// the special days that fall on a date
export function specialOn(date = new Date()) {
  const h = hijri(date); if (!h) return [];
  return DAYS.filter((x) => {
    if (x.weekday != null) return [x.weekday].flat().includes(date.getDay());
    if (x.month && x.month !== h.m) return false;
    if (x.day) return x.day.includes(h.d);
    return !!x.month;
  });
}

// the next date (from today, up to a year ahead) of each yearly day
export function upcoming(from = new Date()) {
  const out = [];
  const seen = new Set();
  for (let i = 0; i < 400 && seen.size < DAYS.length; i++) {
    const t = new Date(from); t.setDate(t.getDate() + i);
    for (const x of specialOn(t)) if (!seen.has(x.id) && x.weekday == null) { seen.add(x.id); out.push({ day: x, date: t, hijri: hijri(t), inDays: i }); }
  }
  return out.filter((x) => x.day.id !== 'white' || x.inDays < 31);
}
