"""The Seerah Quest source record: every historical passage the game uses, copied word for word from
Ibn Kathir, al-Bidaya wa'l-Nihaya, with its volume and page.

Source policy (agreed with AICWIS): Ibn Kathir's al-Bidaya wa'l-Nihaya is the only source for the historical
narrative. Nothing is added from other books. The Arabic is never typed by hand: each passage is found in the
edition by its first and last words, and this script stops if either cannot be found.

Edition: al-Bidaya wa'l-Nihaya, ed. ʿAli Shiri, Dar Ihyaʾ al-Turath al-ʿArabi, Beirut, 1408/1988
(al-Maktaba al-Shamela no. 8376), as digitised by the OpenITI project:
  https://github.com/OpenITI/0775AH  data/0774IbnKathir/0774IbnKathir.Bidaya/0774IbnKathir.Bidaya.Shamela0008376-ara2

    git clone --depth 1 --filter=blob:none --sparse https://github.com/OpenITI/0775AH && cd 0775AH && git sparse-checkout set data/0774IbnKathir
    python scripts/seerah/sources.py path/to/0774IbnKathir.Bidaya.Shamela0008376-ara2

Writes src/data/seerah/sources.json and docs/seerah-source-record.md.

Classification (from the Seerah Quest design document):
  established  — narrated in the book without doubt cast on it: may become a full mission
  reported     — the book itself marks it as uncertain ("fima yazʿumun", "Allahu aʿlam", "yuqal"), or it is an
                 addition by a later transmitter: shown only as a labelled note, never as the main story
  excluded     — not used in the game (uncertain, graphic, or about idol worship); kept here so reviewers see it
The English translations are ours and are marked for review by the school's Islamic Studies teachers.
"""
import json, os, re, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
EDITION = {
    'work': "Ibn Kathir, al-Bidaya wa'l-Nihaya (البداية والنهاية)",
    'edition': "ed. ʿAli Shiri, Dar Ihyaʾ al-Turath al-ʿArabi, Beirut, 1408/1988 (al-Maktaba al-Shamela no. 8376)",
    'digital': 'OpenITI 0774IbnKathir.Bidaya.Shamela0008376-ara2',
}

# id, episode, first words, last words, classification, English translation, note
P = [
 # ── Episode 1 · The Secret of Zamzam ──
 ('z-title', 1, 'تجديد حفر زمزم على يدي عبد المطلب', 'إلى زمانه.', 'established',
  'The renewed digging of Zamzam by ʿAbd al-Muttalib ibn Hashim. Its traces had been worn away after the tribe of Jurhum filled it in, and so it remained until his time.',
  'Chapter heading.'),
 ('z-dream', 1, 'قال قال عبد المطلب إني لنائم في الحجر', 'عند قرية النمل.', 'established',
  'ʿAbd al-Muttalib said: “I was sleeping in al-Hijr when someone came to me and said, ‘Dig Tayba.’ I said, ‘What is Tayba?’ Then he left me. The next day I went back to my bed and slept, and he came to me and said, ‘Dig Barra.’ I said, ‘What is Barra?’ Then he left me. The next day I went back to my bed and slept, and he came to me and said, ‘Dig al-Madnuna.’ I said, ‘What is al-Madnuna?’ Then he left me. The next day I went back to my bed and slept in it, and he came to me and said, ‘Dig Zamzam.’ I said, ‘What is Zamzam?’ He said, ‘It never runs dry and never fails. It gives water to the great gathering of pilgrims. It is between the dung and the blood, at the pecking place of the crow with the white mark, at the colony of the ants.’”',
  'Narrated by Ibn Ishaq from ʿAli ibn Abi Talib, with its chain. The edition prints the first word as “طببة”; the next line has “طيبة” (Tayba).'),
 ('z-dig', 1, 'قال: فلما بين لي شأنها ودل على موضعها', 'فعرفت قريش أنه قد أدرك حاجته.', 'established',
  'When its matter had been made clear to him and its place had been shown to him, and he knew he had been told the truth, he set out in the morning with his pickaxe, and with him his son al-Harith ibn ʿAbd al-Muttalib, who was his only son at that time. He dug, and when the stone lining of the old well appeared, ʿAbd al-Muttalib called out “Allahu akbar”, and Quraysh knew that he had found what he was looking for.',
  'The edition reads “الطمي”, the stone casing of the well.'),
 ('z-claim', 1, 'فقاموا إليه فقالوا: يا عبد المطلب إنها بئر أبينا إسماعيل', 'حتى نخاصمك فيها.', 'established',
  'They came to him and said: “ʿAbd al-Muttalib, this is the well of our father Ismaʿil, and we have a right to it. Give us a share in it with you.” He said: “I will not. This matter was given to me alone, out of all of you.” They said: “Then be fair to us, for we will not leave you until we have taken you to judgement over it.”',
  ''),
 ('z-journey', 1, 'قال: فاجعلوا بيني وبينكم من شئتم أحاكمكم إليه', 'نخشى على أنفسنا مثل ما أصابكم', 'established',
  'He said: “Choose whomever you wish to judge between us.” They said: “The soothsayer of Banu Saʿd ibn Hudhaym.” He agreed. She lived in the highlands of al-Sham. ʿAbd al-Muttalib rode out with a group of his family, and a group rode from every clan of Quraysh. In those days the land between was open desert. When they were part of the way, ʿAbd al-Muttalib and his companions ran out of water. They grew so thirsty that they were sure they would die. They asked the others for water, but they refused, saying: “We are in the desert, and we fear for ourselves what has happened to you.”',
  ''),
 ('z-graves', 1, 'فقال عبد المطلب إني أرى أن يحفر كل رجل منكم حفرته', 'ثم قعدوا ينتظرون الموت عطشى', 'established',
  'ʿAbd al-Muttalib said: “I think each of you should dig his own grave while you still have the strength, so that whenever one dies his companions can bury him, until only one man is left. The loss of one man is easier than the loss of a whole caravan.” They said: “What you advise is good.” Each man dug a grave for himself, and they sat waiting for death, thirsty.',
  'Told gently in the game, as the moment they had given up hope.'),
 ('z-spring', 1, 'ثم إن عبد المطلب قال لأصحابه ألقينا بأيدينا', 'فقد سقانا الله فجاؤوا فشربوا واستقوا', 'established',
  'Then ʿAbd al-Muttalib said to his companions: “Have we thrown ourselves into the hands of death like this, without travelling on and seeking for ourselves, out of weakness? Perhaps Allah will provide us with water somewhere in the land.” So they set off. When ʿAbd al-Muttalib made his camel rise, a spring of sweet water burst out from under its hoof. ʿAbd al-Muttalib said “Allahu akbar”, and his companions said it too. He dismounted and drank, and his companions drank, and they filled their water-skins. Then he called the clans of Quraysh, who had been watching all of this: “Come to the water, for Allah has given us water.” They came and drank and filled their water-skins.',
  ''),
 ('z-verdict', 1, 'كلهم ثم قالوا قد والله قضي لك علينا', 'وخلوا بينه وبين زمزم.', 'established',
  'All of them. Then they said: “By Allah, the judgement has been given for you against us. By Allah, we will never dispute with you over Zamzam. The One who gave you this water in this desert is the One who gave you Zamzam. Go back to your watering of the pilgrims, rightly guided.” He went back and they went back with him. They never reached the soothsayer, and they left him and Zamzam alone.',
  ''),
 ('z-where', 1, 'قال ابن إسحاق: فزعموا أن عبد المطلب', 'فالله أعلم أي ذلك كان.', 'reported',
  'Ibn Ishaq said: They claim that when this was said to him, ʿAbd al-Muttalib asked: “And where is it?” He was told: “At the colony of the ants, where the crow will peck tomorrow.” Allah knows best which of these it was.',
  'Ibn Ishaq and Ibn Kathir mark this as uncertain (“fazaʿamu”, “Allahu aʿlam”). Shown only as a labelled note.'),
 ('z-umawi', 1, 'زاد الأموي ومولاه أصرم', 'ووجد فيها أسيافا قلعية وأدرعا.', 'reported',
  'Al-Umawi adds that ʿAbd al-Muttalib found the colony of the ants and the crow pecking beside it, between two idols of Quraysh. Quraysh objected to his digging there; he told his son al-Harith to keep them back, and when they saw he would not give up, they left him to dig. As he dug deeper he found two gazelles of gold that Jurhum had buried, with swords and coats of armour.',
  'An addition by al-Umawi. Shown only as a labelled note. The idols are named in the book; the game does not depict them.'),
 ('z-arrows', 1, 'فقالت له قريش: يا عبد المطلب لنا معك في هذا شرك', 'فيما يزعون.', 'excluded',
  'Quraysh claimed a share of what he found; it was settled by casting arrows before an idol, and the gold gazelles were later set on the door of the Kaʿbah.',
  'Excluded: the settling by divining arrows at an idol is not something the game should have students take part in, and the book marks the last detail “fima yazʿumun”.'),
 ('z-siqaya', 1, 'ثم إن عبد المطلب أقام سقاية زمزم للحاج', 'ولأنها بئر إسماعيل بن إبراهيم', 'established',
  'Then ʿAbd al-Muttalib set up the watering of the pilgrims from Zamzam. Ibn Ishaq and others mention that there were many wells in Makkah before Zamzam appeared in the time of ʿAbd al-Muttalib … and Zamzam surpassed all the wells, and all the people turned to it, because of its place by the Sacred Mosque, its excellence over all other water, and because it is the well of Ismaʿil son of Ibrahim.',
  'The list of the other wells is left out (marked …).'),
 # ── Episode 2 · The Year of the Elephant ──
 ('e-qullays', 2, 'قال ابن إسحاق ثم إن أبرهة بنى القليس', 'حتى أصرف إليها حج العرب.', 'established',
  'Ibn Ishaq said: Then Abraha built al-Qullays in Sanaʿa, a church whose like had not been seen anywhere on earth in its time, and he wrote to the Negus: “I have built for you a church like none ever built for a king before you, and I will not stop until I have turned the pilgrimage of the Arabs to it.”',
  ''),
 ('e-anger', 2, 'قال ابن إسحاق فلما تحدثت العرب بكتاب أبرهة', 'وحلف ليسيرن إلى البيت حتى يهدمه.', 'established',
  'When the Arabs spoke of Abraha’s letter to the Negus, a man of Kinanah was angered. He went to al-Qullays and showed his contempt for it, then went back to his own land. Abraha was told that a man from the people of the House in Makkah had done this when he heard of Abraha’s plan to turn the pilgrimage away from it. Abraha was enraged, and swore that he would march on the House and destroy it.',
  'The man’s act is described in the book plainly; the game says only that he showed his contempt.'),
 ('e-march', 2, 'ثم أمر الحبشة فتهيأت وتجهزت.', 'فأتي به أسيرا.', 'established',
  'Then he ordered the Abyssinians to prepare, and they made ready. He set out, taking the elephant with him. The Arabs heard of it and were horrified, and they saw it as their duty to fight him when they heard that he meant to destroy the Kaʿbah, the Sacred House of Allah. A man of the nobles and kings of Yemen called Dhu Nafr called his people and other Arabs to fight Abraha and defend the Sacred House. He met him in battle, but Dhu Nafr and his men were defeated, and Dhu Nafr was taken captive.',
  ''),
 ('e-nufayl', 2, 'حتى إذا كان بأرض خثعم عرض له نفيل', 'فخلى سبيله', 'established',
  'When Abraha reached the land of Khathʿam, Nufayl ibn Habib al-Khathʿami came against him with the two tribes of Khathʿam and the Arabs who followed him. Abraha defeated him and took him captive. When he meant to kill him, Nufayl said: “O king, do not kill me, for I will be your guide in the land of the Arabs.” So Abraha let him go.',
  ''),
 ('e-taif', 2, 'وخرج به معه يدله حتى إذا مر بالطائف', 'حتى أنزله بالمغمس', 'established',
  'He took him along as his guide. When he passed by al-Taʾif, Masʿud ibn Muʿattib came out to him with men of Thaqif and said: “O king, we will not oppose you. This house of ours is not the House you want. You want the House in Makkah, and we will send someone with you to guide you to it.” They sent Abu Righal with him to show him the way to Makkah. Abraha set out with Abu Righal until he brought him to al-Mughammas.',
  'The house of Thaqif is named in the book (an idol-house); the game does not name or show it.'),
 ('e-camels', 2, 'قال ابن إسحاق فلما نزل أبرهة بالمغمس بعث رجلا', 'ثم عرفوا أنه لا طاقة لهم به فتركوا', 'established',
  'When Abraha camped at al-Mughammas, he sent an Abyssinian called al-Aswad ibn Mafsud with horsemen to Makkah. He drove off to Abraha the wealth of the people of Tihama, from Quraysh and others, and among it were two hundred camels of ʿAbd al-Muttalib ibn Hashim, who was then the eldest and leader of Quraysh. Quraysh, Kinanah, Hudhayl and the others in the Haram thought of fighting him; then they knew they had no power to fight him, and they left it.',
  ''),
 ('e-hunata', 2, 'وبعث أبرهة حناطة الحميري إلى مكة', 'فوالله ما عندنا دفع عنه.', 'established',
  'Abraha sent Hunata al-Himyari to Makkah and told him: “Ask for the leader and noblest man of this land and tell him: The king says, I have not come to fight you. I have come only to destroy this House. If you do not stand against us to defend it, I have no need of your blood.” When Hunata entered Makkah he asked for the leader of Quraysh, and was told: ʿAbd al-Muttalib ibn Hashim. He went to him and told him what Abraha had said. ʿAbd al-Muttalib said: “By Allah, we do not want to fight him, and we have no power to do so. This is the Sacred House of Allah and the house of His Khalil Ibrahim, peace be upon him. If He protects it from him, it is His Sanctuary and His House; and if He leaves it to him, by Allah, we have no way to defend it.”',
  'The book adds “or as he said” to the words of ʿAbd al-Muttalib.'),
 ('e-friends', 2, 'فقال له حناطة فانطلق معي إليه', 'فأذن له أبرهة', 'established',
  'Hunata said: “Then come with me to him, for he has ordered me to bring you.” ʿAbd al-Muttalib went with him, with some of his sons, until he reached the camp. He asked for Dhu Nafr, who was his friend, and went in to him in his prison. Dhu Nafr said: “What help can a captive be, who expects the king to kill him morning or evening? But Unays, the keeper of the elephant, is my friend. I will send for him, commend you to him, and ask him to get you leave to see the king.” Unays spoke to Abraha: “O king, the leader of Quraysh is at your door asking to see you. He is the master of the well of Makkah, who feeds people in the plain and the wild animals on the mountain tops.” Abraha gave him leave.',
  ''),
 ('e-meeting', 2, 'قال وكان عبد الملطب أوسم الناس', 'فرد على عبد المطلب إبله.', 'established',
  'ʿAbd al-Muttalib was the most handsome and dignified of men. When Abraha saw him he honoured him, and he would not seat him below himself, nor let the Abyssinians see him seat him on his throne. So he came down from his throne and sat on his carpet, and seated ʿAbd al-Muttalib beside him. He said to his interpreter: “Ask him what he needs.” ʿAbd al-Muttalib said: “My need is that the king return to me two hundred camels he has taken from me.” Abraha said to his interpreter: “Tell him: I admired you when I saw you, but I think less of you now that you have spoken. You speak to me about two hundred camels I took from you, and say nothing of a House that is your religion and the religion of your fathers, which I have come to destroy?” ʿAbd al-Muttalib said: “I am the lord of the camels, and the House has a Lord who will protect it.” Abraha said: “He will not protect it from me.” He said: “That is between you and Him.” And Abraha returned his camels to him.',
  'The edition prints “عبد الملطب” here, a printing slip for عبد المطلب.'),
 ('e-offer', 2, 'قال ابن إسحاق ويقال إنه كان قد دخل مع عبد المطلب', 'فالله أعلم أكان ذلك أم لا.', 'excluded',
  'It is said that leaders of Bakr and Hudhayl went in with him and offered Abraha a third of the wealth of Tihama to turn back, and he refused.',
  'Excluded: Ibn Ishaq says “it is said”, and Ibn Kathir adds “Allah knows best whether that happened or not.”'),
 ('e-mountains', 2, 'فلما انصرفوا عنه انصرف عبد المطلب إلى قريش', 'يدعون الله ويستنصرونه على أبرهة وجنده.', 'established',
  'ʿAbd al-Muttalib went back to Quraysh, told them the news, and ordered them to leave Makkah and take refuge on the mountain tops, out of fear of the harm the army would do to them. Then ʿAbd al-Muttalib stood and took hold of the ring of the door of the Kaʿbah, and a group of Quraysh stood with him, calling on Allah and asking Him for help against Abraha and his army.',
  ''),
 ('e-dua', 2, 'وقال عبد المطلب', 'هذا ما صح له منها', 'established',
  'And ʿAbd al-Muttalib said, holding the ring of the door of the Kaʿbah: “O Allah, a man protects his own dwelling, so protect Your dwelling. Let their cross and their might never overcome Your might tomorrow. And if You leave them and our qibla, then command what You will.” Ibn Hisham said: this is what is authentic of it.',
  'Verses; Ibn Hisham confirms these lines are the authentic part.'),
 ('e-peaks', 2, 'وقال ابن إسحاق ثم أرسل عبد المطلب حلقة باب الكعبة', 'فينتظرون ما أبرهة فاعل', 'established',
  'Then ʿAbd al-Muttalib let go of the ring of the door of the Kaʿbah, and he and the Quraysh with him went off to the mountain peaks to shelter there and wait to see what Abraha would do.',
  ''),
 ('e-elephant', 2, 'فلما أصبح أبرهة تهيأ لدخول مكة', 'ووجهوه إلى مكة فبرك.', 'established',
  'In the morning Abraha prepared to enter Makkah. He made his elephant ready and drew up his army; the elephant’s name was Mahmud. When they turned the elephant towards Makkah, Nufayl ibn Habib came and stood beside it, took hold of its ear and said: “Kneel, Mahmud, and go back safely to where you came from, for you are in the Sacred Land of Allah.” And he let go of its ear. The elephant knelt. Nufayl ran off and climbed the mountain. They beat the elephant to make it stand, but it refused. They turned it back towards Yemen, and it got up and hurried off. They turned it towards al-Sham and it did the same, and towards the east and it did the same. They turned it towards Makkah, and it knelt.',
  'The book describes how they beat the elephant; the game says only that they tried to force it up.'),
 ('e-birds', 2, 'وأرسل الله عليهم طيرا من البحر', 'يبتدرون الطريق التي منها جاؤوا.', 'established',
  'And Allah sent upon them birds from the sea, like swallows, each bird carrying three stones: one in its beak and two in its feet, like chickpeas and lentils. No one they struck escaped, though not all of them were struck. They fled, rushing back along the road by which they had come.',
  'Shown only as a cinematic: no one plays a part in it, and nothing graphic is shown.'),
 ('e-abraha', 2, 'وأصيب أبرهة في جسده', 'وخرجوا به معهم', 'established',
  'Abraha was struck in his body, and they took him away with them.',
  'The book goes on to describe his illness on the way back to Sanaʿa and his death there, part of it marked “fima yazʿumun”; that description is not used.'),
 ('e-surah', 2, 'قال ابن إسحاق: فلما بعث الله محمدا صلى الله عليه وسلم كان مما يعدد الله على قريش', 'فقال تعالى:', 'established',
  'Ibn Ishaq said: When Allah sent Muhammad ﷺ, among the blessings Allah reminded Quraysh of was His turning back the Abyssinians from them, for the sake of their survival. He, the Most High, said: [Surah al-Fil]',
  'The surah itself is recited from the Qurʾan by the reciter, not narrated.'),
 ('e-meaning', 2, 'ولم يكن ما فعله بأصحاب الفيل نصرة لقريش', 'وتوطئة لبعثة محمد صلى الله عليه وسلم.', 'established',
  'What Allah did to the People of the Elephant was not a victory for Quraysh … rather, the victory was for the Sacred House, as a sign and a preparation for the sending of Muhammad ﷺ.',
  'Ibn Kathir’s own words. A clause about the Abyssinians is left out (marked …).'),
 ('e-year', 2, 'قلت وفي عامها ولد رسول الله صلى الله عليه وسلم على المشهور.', 'على المشهور.', 'established',
  'I say: in its year the Messenger of Allah ﷺ was born, according to the well-known view.',
  'Ibn Kathir’s own words; he notes that some said it was years before his birth.'),
]

FOOT = re.compile(r'\s*\(\d+\)\s*')

def load(path):
    raw = open(path, encoding='utf8').read()
    t = re.sub(r'\n~~', ' ', raw)
    t = re.sub(r'(?m)^#+ ?', '', t)
    t = re.sub(r'ms\d+', '', t)
    t = FOOT.sub(' ', t)                 # the editor's footnote numbers, (1) (2) …, are not part of the text
    t = re.sub(r'[ \t]+', ' ', t)
    return t

def find(text, first, last, after=0):
    i = text.find(first, after)
    if i < 0: raise SystemExit(f'Not found: {first}')
    j = text.find(last, i)
    if j < 0: raise SystemExit(f'End not found after {first}: {last}')
    return i, j + len(last)

def page_at(text, pos):
    m = re.compile(r'PageV(\d\d)P(\d+)').search(text, pos)
    return int(m.group(1)), int(m.group(2))

def clean(s):
    s = re.sub(r'PageV\d\dP\d+', ' ', s)
    s = FOOT.sub(' ', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def main(path):
    text = load(path)
    anchor = text.find('سبب قصد أبرهة بالفيل مكة')
    out = []
    for pid, ep, first, last, cls, en, note in P:
        start = text.find('تجديد حفر زمزم على يدي') if ep == 1 else anchor
        i, j = find(text, first, last, start)
        v1, p1 = page_at(text, i); v2, p2 = page_at(text, j - 1)
        out.append({'id': pid, 'episode': ep, 'vol': v1, 'page': p1 if p1 == p2 else f'{p1}–{p2}', 'class': cls,
                    'ar': clean(text[i:j]), 'en': en, 'note': note, 'review': 'pending'})
    os.makedirs(os.path.join(ROOT, 'src', 'data', 'seerah'), exist_ok=True)
    json.dump({'edition': EDITION, 'passages': out}, open(os.path.join(ROOT, 'src', 'data', 'seerah', 'sources.json'), 'w'), ensure_ascii=False, indent=1)
    os.makedirs(os.path.join(ROOT, 'docs'), exist_ok=True)
    md = ['# The Seerah Quest · source record', '',
          f"Every historical passage used in the game, from {EDITION['work']}, {EDITION['edition']}; digital text: {EDITION['digital']}.",
          'The Arabic is copied mechanically from the edition by `scripts/seerah/sources.py`. Translations are ours; please review them.',
          'Classification: **established** (may become a mission) · **reported** (labelled note only) · **excluded** (not used).', '',
          '| ID | Episode | Vol./page | Class | Reviewer |', '|---|---|---|---|---|']
    md += [f"| {p['id']} | {p['episode']} | {p['vol']}/{p['page']} | {p['class']} | {p['review']} |" for p in out]
    for p in out:
        md += ['', f"## {p['id']} · vol. {p['vol']}, p. {p['page']} · {p['class']}", '', p['ar'], '', f"> {p['en']}"]
        if p['note']: md += ['', f"*Note:* {p['note']}"]
    open(os.path.join(ROOT, 'docs', 'seerah-source-record.md'), 'w').write('\n'.join(md) + '\n')
    print(len(out), 'passages:', ', '.join(f"{p['id']} {p['vol']}/{p['page']}" for p in out))

if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '/tmp/openiti/0775AH/data/0774IbnKathir/0774IbnKathir.Bidaya/0774IbnKathir.Bidaya.Shamela0008376-ara2')
