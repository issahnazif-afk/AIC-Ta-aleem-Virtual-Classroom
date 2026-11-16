# The Sheikh: candidate ayat for review

- **Arabic:** public/data/surah/NNN.json: Tanzil Quran Text (Uthmani, Version 1.1), CC BY 3.0, verbatim copies only. Copied by code, never typed.
- **English:** Pickthall, *The Meaning of the Glorious Koran* (1930), from https://www.gutenberg.org/ebooks/16955 (Project Gutenberg #16955, the “P:” lines; proofed against paper copies). Copied by code; only line breaks are joined.
- **Cross-check:** Tanzil `en.pickthall`. Identical for every item except those with a note (58:11).
- **Licence:** Pickthall died 1936: public domain in Canada (life + 50, expired 1986; the 2022 extension to life + 70 is not retroactive). First published 1930: public domain in the USA since 1 January 2026 (US term for works published in 1930 is 95 years from publication, whether first published in the US or abroad). Project Gutenberg marks #16955 "Public domain in the USA"; its licence asks that the "Project Gutenberg" trademark is not used for modified copies, which does not restrict quoting the text. Tanzil's Terms of Use (https://tanzil.net/trans/): "The translations provided at this page are for non-commercial purposes only. If used otherwise, you need to obtain necessary permission from the translator or the publisher. If you are using more than three of the following translations in a website or application, we require you to put a link back to this page ... Redistributing the following list in another website is not allowed, unless direct permission is granted by the Tanzil Project." Tanzil is used here only as a cross-check.
- **Archaic English:** Pickthall writes “thee”, “hath”, “Lo!”, and puts his own explanations in brackets, e.g. “(O Muhammad)”. These are his words and are kept.
- **Excluded:** every ayah already in the Reading Library (src/lib/library/*.mjs), so 2:186, 94:6, 13:28 etc. are not here.
- **Ranges:** 96:4–5, 55:1–2, 23:1–2 and 20:25–28 are one candidate each (the ayat make one sentence); they carry `a` and `to`.
- Full texts with Arabic and the questions each answers: `scripts/sheikh/candidates/quran.json` (54 items). Status of every item: **pending**. Tick the box to approve; strike out to reject.

- [ ] Qur’an 73:4 — reciting the Qur’an slowly and clearly (tartil) — Or add (a little) thereto - and chant the Qur'an in measure,  
  ⚠ Begins mid-sentence: “Or add (a little) thereto” continues 73:2–3 (keeping vigil at night).
- [ ] Qur’an 54:17 — the Qur’an is made easy to remember — And in truth We have made the Qur'an easy to remember; but is there any that remembereth?
- [ ] Qur’an 20:114 — a dua for more knowledge — Then exalted be Allah, the True King! And hasten not (O Muhammad) with the Qur'an ere its revelation hath been perfected unto thee, and say: My Lord! Increase me in knowledge.  
  ⚠ Long; the dua is its last words.
- [ ] Qur’an 75:16 — not hurrying the tongue when reciting — Stir not thy tongue herewith to hasten it.
- [ ] Qur’an 17:106 — the Qur’an was revealed in parts, to be recited bit by bit — And (it is) a Qur'an that We have divided, that thou mayst recite it unto mankind at intervals, and We have revealed it by (successive) revelation.
- [ ] Qur’an 7:204 — listening quietly when the Qur’an is recited — And when the Qur'an is recited, give ear to it and pay heed, that ye may obtain mercy.
- [ ] Qur’an 16:98 — seeking refuge in Allah before reciting — And when thou recitest the Qur'an, seek refuge in Allah from Satan the outcast.
- [ ] Qur’an 96:1 — the first word revealed: read — Read: In the name of thy Lord Who createth,
- [ ] Qur’an 96:4–5 — Allah taught by the pen what we did not know — Who teacheth by the pen, Teacheth man that which he knew not.
- [ ] Qur’an 55:1–2 — the Most Merciful taught the Qur’an — The Beneficent Hath made known the Qur'an.
- [ ] Qur’an 38:29 — the Qur’an is blessed, so think about its meaning — (This is) a Scripture that We have revealed unto thee, full of blessing, that they may ponder its revelations, and that men of understanding may reflect.
- [ ] Qur’an 47:24 — pondering the Qur’an — Will they then not meditate on the Qur'an, or are there locks on the hearts?
- [ ] Qur’an 17:82 — the Qur’an is a healing and a mercy — And We reveal of the Qur'an that which is a healing and a mercy for believers though it increase the evil-doers in naught save ruin.
- [ ] Qur’an 10:57 — the Qur’an heals what is in the hearts — O mankind! There hath come unto you an exhortation from your Lord, a balm for that which is in the breasts, a guidance and a mercy for believers.
- [ ] Qur’an 39:9 — those who know and those who do not are not equal — Is he who payeth adoration in the watches of the night, prostrate and standing, bewaring of the Hereafter and hoping for the mercy of his Lord, (to be accounted equal with a disbeliever)? Say (unto them, O Muhammad): Are those who know equal with those who know not? But only men of understanding will pay heed.
- [ ] Qur’an 58:11 — making room in gatherings; Allah raises those with knowledge — O ye who believe! when it is said unto you: Make room! in assemblies, then make room; Allah will make way for you (hereafter). And when it is said: Come up higher! go up higher; Allah will exalt those who believe among you, and those who have knowledge, to high ranks. Allah is informed of what ye do.  
  ⚠ Tanzil en.pickthall 58:11 differs: “O ye who believe! when it is said unto you, Make room! in assemblies, then make room; Allah will make way for you (hereafter). And when it is said, Come up higher! go up higher; Allah will exalt those who believe among you, and those who have knowledge, to high ranks. Allah is Informed of what ye do.”.
- [ ] Qur’an 2:153 — seek help through patience and prayer — O ye who believe! Seek help in steadfastness and prayer. Lo! Allah is with the steadfast.
- [ ] Qur’an 39:10 — the patient are rewarded without measure — Say: O My bondmen who believe! Observe your duty to your Lord. For those who do good in this world there is good, and Allah's earth is spacious. Verily the steadfast will be paid their wages without stint.
- [ ] Qur’an 94:5 — with hardship comes ease — But lo! with hardship goeth ease,
- [ ] Qur’an 16:127 — patience comes with Allah’s help — Endure thou patiently (O Muhammad). Thine endurance is only by (the help of) Allah. Grieve not for them, and be not in distress because of that which they devise.
- [ ] Qur’an 14:7 — if you are thankful, Allah gives you more — And when your Lord proclaimed: If ye give thanks, I will give you more; but if ye are thankless, lo! My punishment is dire.  
  ⚠ Ends “My punishment is dire”.
- [ ] Qur’an 2:152 — remember Allah and He remembers you; be thankful — Therefore remember Me, I will remember you. Give thanks to Me, and reject not Me.
- [ ] Qur’an 31:12 — Luqman’s wisdom: be thankful to Allah — And verily We gave Luqman wisdom, saying: Give thanks unto Allah; and whosoever giveth thanks, he giveth thanks for (the good of) his soul. And whosoever refuseth - Lo! Allah is Absolute, Owner of Praise.
- [ ] Qur’an 17:23 — kindness to parents; never say “uff” to them — Thy Lord hath decreed, that ye worship none save Him, and (that ye show) kindness to parents. If one of them or both of them attain old age with thee, say not "Fie" unto them nor repulse them, but speak unto them a gracious word.
- [ ] Qur’an 17:24 — humility to parents and a dua for them — And lower unto them the wing of submission through mercy, and say: My Lord! Have mercy on them both as they did care for me when I was little.
- [ ] Qur’an 39:53 — never lose hope in Allah’s mercy — Say: O My slaves who have been prodigal to their own hurt! Despair not of the mercy of Allah, Who forgiveth all sins. Lo! He is the Forgiving, the Merciful.
- [ ] Qur’an 21:107 — the Prophet ﷺ was sent as a mercy — We sent thee not save as a mercy for the peoples.
- [ ] Qur’an 3:159 — the Prophet’s ﷺ gentleness drew people to him — It was by the mercy of Allah that thou wast lenient with them (O Muhammad), for if thou hadst been stern and fierce of heart they would have dispersed from round about thee. So pardon them and ask forgiveness for them and consult with them upon the conduct of affairs. And when thou art resolved, then put thy trust in Allah. Lo! Allah loveth those who put their trust (in Him).
- [ ] Qur’an 6:54 — Allah has written mercy upon Himself; repenting after a mistake — And when those who believe in Our revelations come unto thee, say: Peace be unto you! Your Lord hath prescribed for Himself mercy, that whoso of you doeth evil through ignorance and repenteth afterward thereof and doeth right, (for him) lo! He is Forgiving, Merciful.
- [ ] Qur’an 98:5 — worshipping Allah sincerely — And they are ordered naught else than to serve Allah, keeping religion pure for Him, as men by nature upright, and to establish worship and to pay the poor-due. That is true religion.
- [ ] Qur’an 6:162 — all my prayer and my life are for Allah (intention) — Say: Lo! my worship and my sacrifice and my living and my dying are for Allah, Lord of the Worlds.
- [ ] Qur’an 2:83 — be good to parents, orphans and the needy, and speak kindly to people — And (remember) when We made a covenant with the Children of Israel, (saying): Worship none save Allah (only), and be good to parents and to kindred and to orphans and the needy, and speak kindly to mankind; and establish worship and pay the poor-due. Then, after that, ye slid back, save a few of you, being averse.  
  ⚠ Context: the covenant with the Children of Israel; ends “ye slid back, save a few of you”.
- [ ] Qur’an 17:53 — say what is best; Satan stirs up quarrels — Tell My bondmen to speak that which is kindlier. Lo! the devil soweth discord among them. Lo! the devil is for man an open foe.
- [ ] Qur’an 33:70 — speak words that are right and true — O ye who believe! Guard your duty to Allah, and speak words straight to the point;
- [ ] Qur’an 31:19 — Luqman’s advice: walk modestly and lower your voice — Be modest in thy bearing and subdue thy voice. Lo! the harshest of all voices is the voice of the ass.
- [ ] Qur’an 14:24 — a good word is like a good tree — Seest thou not how Allah coineth a similitude: A goodly saying, as a goodly tree, its root set firm, its branches reaching into heaven,
- [ ] Qur’an 25:63 — the servants of the Most Merciful walk humbly and answer with peace — The (faithful) slaves of the Beneficent are they who walk upon the earth modestly, and when the foolish ones address them answer: Peace;
- [ ] Qur’an 41:34 — answer bad with what is better and enemies become friends — The good deed and the evil deed are not alike. Repel the evil deed with one which is better, then lo! he, between whom and thee there was enmity (will become) as though he was a bosom friend.
- [ ] Qur’an 29:45 — prayer keeps us from bad deeds — Recite that which hath been inspired in thee of the Scripture, and establish worship. Lo! worship preserveth from lewdness and iniquity, but verily remembrance of Allah is more important. And Allah knoweth what ye do.
- [ ] Qur’an 2:238 — guard your prayers — Be guardians of your prayers, and of the midmost prayer, and stand up with devotion to Allah.
- [ ] Qur’an 23:1–2 — successful are the believers who are humble in prayer — Successful indeed are the believers Who are humble in their prayers,
- [ ] Qur’an 40:60 — call on Allah and He answers — And your Lord hath said: Pray unto Me and I will hear your prayer. Lo! those who scorn My service, they will enter hell, disgraced.  
  ⚠ Ends with a warning about Hell; may not suit young children.
- [ ] Qur’an 2:201 — the dua for good in this world and the next — And of them (also) is he who saith: "Our Lord! Give unto us in the world that which is good and in the Hereafter that which is good, and guard us from the doom of Fire."
- [ ] Qur’an 25:74 — a dua for one’s family — And who say: Our Lord! Vouchsafe us comfort of our wives and of our offspring, and make us patterns for (all) those who ward off (evil).  
  ⚠ Pickthall: “comfort of our wives and of our offspring”; check it suits a child asking about family.
- [ ] Qur’an 14:40 — Ibrahim’s dua to keep up prayer — My Lord! Make me to establish proper worship, and some of my posterity (also); our Lord! and accept my prayer.
- [ ] Qur’an 20:25–28 — Musa’s dua: ease my task and loosen my tongue — (Moses) said: My Lord! relieve my mind And ease my task for me; And loose a knot from my tongue, That they may understand my saying.
- [ ] Qur’an 50:16 — Allah is closer than our jugular vein — We verily created man and We know what his soul whispereth to him, and We are nearer to him than his jugular vein.
- [ ] Qur’an 99:7 — even an atom’s weight of good is seen — And whoso doeth good an atom's weight will see it then,
- [ ] Qur’an 4:86 — return a greeting with a better one — When ye are greeted with a greeting, greet ye with a better than it or return it. Lo! Allah taketh count of all things.
- [ ] Qur’an 2:263 — a kind word is better than charity followed by hurt — A kind word with forgiveness is better than almsgiving followed by injury. Allah is Absolute, Clement.
- [ ] Qur’an 33:41 — remember Allah often — O ye who believe! Remember Allah with much remembrance.
- [ ] Qur’an 62:2 — the Prophet ﷺ recited, purified and taught the Book and wisdom — He it is Who hath sent among the unlettered ones a messenger of their own, to recite unto them His revelations and to make them grow, and to teach them the Scripture and wisdom, though heretofore they were indeed in error manifest,
- [ ] Qur’an 68:4 — the Prophet’s ﷺ great character — And lo! thou art of a tremendous nature.
- [ ] Qur’an 33:21 — the Prophet ﷺ is the best example — Verily in the messenger of Allah ye have a good example for him who looketh unto Allah and the Last Day, and remembereth Allah much.
