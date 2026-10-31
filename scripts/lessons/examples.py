"""Finds the Alif Ba Qur'an examples in the Tanzil text and writes them, exactly as printed, to
src/data/alifba-examples.json. Run after changing the list below:  python scripts/lessons/examples.py

Each example names its ayah and the words wanted (written plainly). The script finds those words
in that ayah of sources/tanzil/quran-uthmani.xml and copies the Uthmani text, so the lesson shows
the mushaf's own spelling and plays the right ayah. If a word is not found the script stops.
"""
import json, os, re, sys
import xml.etree.ElementTree as ET

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
OUT = os.path.join(ROOT, 'src', 'data', 'alifba-examples.json')

# group: [(ref, plain words, note)]
EXAMPLES = {
    # Lesson 2: the openings read by their letters' names
    'muqattaat': [
        ('2:1', 'الم', 'Alif Lam Mim'), ('7:1', 'المص', 'Alif Lam Mim Sad'), ('10:1', 'الر', 'Alif Lam Ra'),
        ('13:1', 'المر', 'Alif Lam Mim Ra'), ('19:1', 'كهيعص', 'Kaf Ha Ya ʿAyn Sad'), ('20:1', 'طه', 'Ta Ha'),
        ('26:1', 'طسم', 'Ta Sin Mim'), ('27:1', 'طس', 'Ta Sin'), ('36:1', 'يس', 'Ya Sin'), ('38:1', 'ص', 'Sad'),
        ('40:1', 'حم', 'Ha Mim'), ('42:2', 'عسق', 'ʿAyn Sin Qaf'), ('50:1', 'ق', 'Qaf'), ('68:1', 'ن', 'Nun'),
    ],
    # Lesson 6: the kinds of Madd
    'madd-tabii': [('1:4', 'ملك', 'One alif'), ('108:1', 'اعطينك', 'One alif'), ('2:30', 'واذ قال', 'qāla')],
    'madd-muttasil': [('110:1', 'جاء', 'jāʾa'), ('2:22', 'السماء بناء', 'as-samāʾa bināʾan'), ('2:19', 'كصيب من السماء', 'min as-samāʾ')],
    'madd-munfasil': [('108:1', 'انا اعطينك', 'innā aʿṭaynāk'), ('2:4', 'بما انزل', 'bimā unzila'), ('66:6', 'قوا انفسكم', 'qū anfusakum')],
    'madd-lazim': [('1:7', 'الضالين', 'aḍ-ḍāllīn'), ('69:1', 'الحاقة', 'al-ḥāqqah'), ('79:34', 'الطامة', 'aṭ-ṭāmmah')],
    'madd-arid': [('1:2', 'العلمين', 'stopping on al-ʿālamīn'), ('1:5', 'نستعين', 'stopping on nastaʿīn'), ('1:3', 'الرحيم', 'stopping on ar-raḥīm')],
    'madd-leen': [('106:1', 'قريش', 'stopping on quraysh'), ('106:3', 'البيت', 'stopping on al-bayt'), ('106:4', 'خوف', 'stopping on khawf')],
    # Lesson 9: the pronoun ha
    'ha-long': [('112:4', 'له', 'lahū, long'), ('2:255', 'له ما في السموت', 'lahū mā'), ('99:7', 'يره', 'yarahū')],
    'ha-short': [('2:2', 'فيه', 'fīh, not long'), ('2:156', 'اليه', 'ilayhi'), ('2:37', 'عليه', 'ʿalayh'), ('2:60', 'منه', 'minhu')],
    'hidden-alif': [('1:3', 'الرحمن', 'ar-raḥmān'), ('2:2', 'ذلك الكتب', 'dhālika l-kitāb'), ('1:2', 'العلمين', 'al-ʿālamīn')],
    # Lesson 10: the Name of Allah
    'allah-heavy': [('110:1', 'نصر الله', 'naṣru llāh'), ('112:2', 'الله الصمد', 'allāhu ṣ-ṣamad'), ('3:55', 'اذ قال الله', 'qāla llāh'), ('112:1', 'هو الله', 'huwa llāh')],
    'allah-light': [('1:1', 'بسم الله', 'bismi llāh'), ('1:2', 'الحمد لله', 'lillāh'), ('3:26', 'قل اللهم', 'quli llāhumma'), ('2:8', 'يقول ءامنا بالله', 'billāh')],
    # Lesson 11: Ra
    'ra-heavy': [('1:2', 'رب', 'rabbi, ra with fat-ha'), ('2:25', 'رزقوا', 'ruziqū, ra with dom-ma'), ('19:16', 'مريم', 'maryam, ra with sukun after fat-ha'), ('2:185', 'القرءان', 'al-qurʾān, after dom-ma')],
    'ra-light': [('24:37', 'رجال', 'rijālun, ra with kes-ra'), ('89:10', 'وفرعون', 'firʿawn, ra with sukun after kes-ra'), ('2:22', 'رزقا لكم', 'rizqan'), ('1:7', 'غير', 'ghayri, ra with kes-ra')],
    # Lessons 13 to 16: nun with sukun and tanween
    'idgham-ghunnah': [('2:8', 'من يقول', 'man yaqūl'), ('16:53', 'من نعمة', 'min niʿmah'), ('13:11', 'من وال', 'min wāl'), ('99:7', 'خيرا يره', 'khayran yarah'), ('111:5', 'من مسد', 'min masad')],
    'idgham-plain': [('2:5', 'من ربهم', 'min rabbihim'), ('2:2', 'هدى للمتقين', 'hudan lil-muttaqīn'), ('2:173', 'غفور رحيم', 'ghafūrun raḥīm'), ('104:1', 'ويل لكل', 'waylun li-kulli')],
    'iqlab': [('2:27', 'من بعد', 'min baʿd'), ('2:33', 'انبئهم', 'anbiʾhum'), ('104:4', 'لينبذن', 'layunbadhanna'), ('22:61', 'سميع بصير', 'samīʿun baṣīr')],
    'izhar': [('2:62', 'من ءامن', 'man āmana'), ('1:7', 'انعمت', 'anʿamta'), ('108:2', 'وانحر', 'wanḥar'), ('7:43', 'من غل', 'min ghill'), ('106:4', 'من خوف', 'min khawf'), ('2:10', 'عذاب اليم', 'ʿadhābun alīm')],
    'ikhfa': [('2:4', 'من قبلك', 'min qablik'), ('2:22', 'وانتم', 'wa antum'), ('113:2', 'من شر', 'min sharr'), ('2:3', 'ينفقون', 'yunfiqūn'), ('107:5', 'عن صلاتهم', 'ʿan ṣalātihim'), ('111:3', 'نارا ذات', 'nāran dhāta'), ('2:25', 'من ثمرة', 'min thamarah')],
    # Lesson 17: supplications from the Qur'an
    'rabbana': [('2:201', 'ربنا ءاتنا في الدنيا حسنة وفي الءاخرة حسنة وقنا عذاب النار', ''), ('14:41', 'ربنا اغفر لي ولولدي وللمؤمنين يوم يقوم الحساب', '')],
}

STRIP = re.compile('[ً-ٰٟۖ-ۭـࣰ-ࣿ]')
def skel(w):
    w = STRIP.sub('', w)
    w = re.sub('[ٱأإآا]', '', w).replace('ى', 'ي').replace('ؤ', 'و').replace('ئ', 'ي').replace('ء', '').replace('ة', 'ه')
    return re.sub('[^ء-ي]', '', w)

def load():
    root = ET.parse(os.path.join(ROOT, 'sources', 'tanzil', 'quran-uthmani.xml')).getroot()
    return {f"{s.get('index')}:{a.get('index')}": a.get('text') for s in root for a in s}

def find(text, plain):
    words, want = text.split(' '), [skel(w) for w in plain.split(' ')]
    sk = [skel(w) for w in words]
    for i in range(len(words) - len(want) + 1):
        if all(sk[i + k] == want[k] or (sk[i + k].endswith(want[k]) and len(want[k]) >= 2 and k == 0) for k in range(len(want))):
            return ' '.join(words[i:i + len(want)])
    return None

def main():
    ayahs = load()
    out, bad = {}, []
    for group, items in EXAMPLES.items():
        out[group] = []
        for ref, plain, note in items:
            hit = find(ayahs.get(ref, ''), plain)
            if not hit: bad.append(f'{group} {ref} {plain}'); continue
            out[group].append({'ref': ref, 'ar': hit, 'note': note})
    if bad:
        print('Not found (fix the list):\n  ' + '\n  '.join(bad)); sys.exit(1)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(out, open(OUT, 'w'), ensure_ascii=False, indent=1)
    print(f'{sum(len(v) for v in out.values())} examples written to {os.path.relpath(OUT, ROOT)}')

if __name__ == '__main__':
    main()
