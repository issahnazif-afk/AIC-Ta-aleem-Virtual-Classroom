"""The starter question bank for Match the Deen, Journey to Knowledge, Salah Master, Akhlaq Heroes and the daily
character missions. Every row starts as "Review": teachers check it in the "Question bank" tab of the admin sheet
and change Approved to "Yes". Only approved rows are shown to students.

    python scripts/questions/starter.py
writes src/data/question-bank.json and the copy inside apps-script/Code.gs (between the STARTER markers).
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
rows = []
def add(game, kind, topic, levels, prompt, answer, wrong=(), explain=''):
    rows.append({'game': game, 'kind': kind, 'topic': topic, 'levels': levels, 'prompt': prompt, 'answer': answer, 'wrong': list(wrong), 'explain': explain})

# ── Match the Deen: pairs ─────────────────────────────────────────
for a, b in [('ٱلرَّحْمَٰن · Ar-Rahman', 'The Most Gracious'), ('ٱلرَّحِيم · Ar-Rahim', 'The Most Merciful'), ('ٱلْمَلِك · Al-Malik', 'The King'),
             ('ٱلْقُدُّوس · Al-Quddus', 'The Most Holy'), ('ٱلسَّلَام · As-Salam', 'The Source of Peace'), ('ٱلْخَالِق · Al-Khaliq', 'The Creator'),
             ('ٱلرَّزَّاق · Ar-Razzaq', 'The Provider'), ('ٱلْعَلِيم · Al-ʿAlim', 'The All-Knowing'), ('ٱلسَّمِيع · As-Samiʿ', 'The All-Hearing'),
             ('ٱلْبَصِير · Al-Basir', 'The All-Seeing'), ('ٱلْغَفُور · Al-Ghafur', 'The Most Forgiving'), ('ٱلْوَدُود · Al-Wadud', 'The Most Loving')]:
    add('match', 'pair', 'Names of Allah', '1-4', a, b)
for a, b in [('كِتَاب', 'book'), ('قَلَم', 'pen'), ('بَيْت', 'house'), ('مَسْجِد', 'masjid, place of prayer'), ('شَمْس', 'sun'), ('قَمَر', 'moon'),
             ('مَاء', 'water'), ('بَاب', 'door'), ('وَلَد', 'boy'), ('بِنْت', 'girl'), ('أُمّ', 'mother'), ('أَب', 'father')]:
    add('match', 'pair', 'Arabic words', '1-4', a, b)
for a, b in [('Prophet Adam (AS)', 'The first human, created by Allah'), ('Prophet Nuh (AS)', 'Built the Ark'),
             ('Prophet Ibrahim (AS)', 'Built the Kaʿbah with his son Ismaʿil'), ('Prophet Yusuf (AS)', 'Was thrown into a well by his brothers'),
             ('Prophet Musa (AS)', 'Was given the Tawrah'), ('Prophet Dawud (AS)', 'Was given the Zabur'),
             ('Prophet Sulayman (AS)', 'Understood the speech of birds and ants'), ('Prophet Yunus (AS)', 'Was swallowed by a great fish'),
             ('Prophet ʿIsa (AS)', 'Spoke as a baby in the cradle'), ('Prophet Muhammad ﷺ', 'The last Prophet, given the Qurʾan')]:
    add('match', 'pair', 'Prophets', '2-4', a, b)
for a, b in [('بِسْمِ ٱللَّهِ', 'Before eating'), ('ٱلْحَمْدُ لِلَّهِ', 'After eating'), ('بِٱسْمِكَ ٱللَّهُمَّ أَمُوتُ وَأَحْيَا', 'Before sleeping'),
             ('ٱلْحَمْدُ لِلَّهِ ٱلَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ ٱلنُّشُورُ', 'On waking up'),
             ('بِسْمِ ٱللَّهِ تَوَكَّلْتُ عَلَى ٱللَّهِ', 'Leaving the house'), ('ٱللَّهُمَّ ٱفْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', 'Entering the masjid'),
             ('رَبِّ زِدْنِي عِلْمًا', 'Asking for more knowledge'), ('ٱلسَّلَامُ عَلَيْكُمْ', 'Greeting a Muslim'), ('جَزَاكَ ٱللَّهُ خَيْرًا', 'Thanking someone')]:
    add('match', 'pair', 'Duas and when we say them', '1-4', a, b)
for a, b in [('Salah', 'The five daily prayers'), ('Zakah', 'Giving part of our wealth to people in need'), ('Sawm', 'Fasting in Ramadan'),
             ('Hajj', 'The pilgrimage to Makkah'), ('Shahadah', 'Declaring that there is no god but Allah and Muhammad ﷺ is His Messenger'),
             ('Wudu', 'Washing before prayer'), ('Qiblah', 'The direction of the Kaʿbah, which we face in prayer'), ('Sunnah', 'The way of the Prophet ﷺ'),
             ('Hadith', 'A report of what the Prophet ﷺ said or did'), ('Iman', 'Faith'), ('Adhan', 'The call to prayer'), ('Sadaqah', 'Charity we give freely')]:
    add('match', 'pair', 'Islamic words', '2-4', a, b)

# ── Journey to Knowledge: questions ───────────────────────────────
J = [
 ('Knowledge Garden', '1-4', 'How many pillars of Islam are there?', '5', ['3', '6', '10'], 'The five pillars are the Shahadah, Salah, Zakah, Sawm and Hajj.'),
 ('Knowledge Garden', '1-4', 'How many obligatory prayers do Muslims pray each day?', '5', ['3', '2', '7'], 'Fajr, Dhuhr, ʿAsr, Maghrib and ʿIsha.'),
 ('Knowledge Garden', '2-4', 'Which pillar is the declaration of faith?', 'Shahadah', ['Sawm', 'Hajj', 'Zakah'], 'The Shahadah is saying, and believing, that there is no god but Allah and that Muhammad ﷺ is His Messenger.'),
 ('Knowledge Garden', '1-4', 'In which month do Muslims fast?', 'Ramadan', ['Shawwal', 'Muharram', 'Rajab'], 'Fasting in Ramadan is one of the five pillars.'),
 ('Knowledge Garden', '2-4', 'Where do Muslims go for Hajj?', 'Makkah', ['Madinah', 'Jerusalem', 'Cairo'], 'Hajj is the pilgrimage to the Kaʿbah in Makkah.'),
 ('Knowledge Garden', '2-4', 'Which pillar means giving part of your wealth to people in need?', 'Zakah', ['Salah', 'Hajj', 'Shahadah'], 'Zakah purifies our wealth and helps those in need.'),
 ('Knowledge Garden', '1-4', 'What is the first surah of the Qurʾan?', 'Al-Fatihah', ['Al-Baqarah', 'An-Nas', 'Al-Ikhlas'], 'Al-Fatihah, “The Opening”, begins the Qurʾan and is recited in every rakʿah.'),
 ('Knowledge Garden', '2-4', 'How many surahs are in the Qurʾan?', '114', ['99', '30', '120'], 'The Qurʾan has 114 surahs.'),
 ('Knowledge Garden', '1-4', 'What is the last surah of the Qurʾan?', 'An-Nas', ['Al-Falaq', 'Al-Fatihah', 'Al-Ikhlas'], 'An-Nas, “Mankind”, is the 114th surah.'),
 ('Knowledge Garden', '1-4', 'To which Prophet was the Qurʾan revealed?', 'Muhammad ﷺ', ['Musa (AS)', 'ʿIsa (AS)', 'Ibrahim (AS)'], 'The Qurʾan was revealed to the Prophet Muhammad ﷺ.'),
 ('Knowledge Garden', '2-4', 'Which angel brought the revelation to the Prophet ﷺ?', 'Jibril (AS)', ['Mikaʾil (AS)', 'Israfil (AS)', 'Malik'], 'The angel Jibril brought the revelation.'),
 ('Knowledge Garden', '3-4', 'In which month did the revelation of the Qurʾan begin?', 'Ramadan', ['Dhul-Hijjah', 'Muharram', 'Shaʿban'], 'The Qurʾan began to be revealed in Ramadan.'),
 ('Knowledge Garden', '3-4', 'Which is the longest surah of the Qurʾan?', 'Al-Baqarah', ['Al-Fatihah', 'Ya-Sin', 'Al-Kahf'], 'Al-Baqarah, the second surah, is the longest.'),
 ('Knowledge Garden', '2-4', 'How many ayahs are in Surah Al-Fatihah?', '7', ['5', '6', '10'], 'Al-Fatihah has seven ayahs.'),
 ('Knowledge Garden', '1-4', 'Which surah begins “Say, He is Allah, the One”?', 'Al-Ikhlas', ['Al-Falaq', 'An-Nas', 'Al-Kawthar'], 'Surah Al-Ikhlas, the 112th surah.'),
 ('Arabic Valley', '1-4', 'How many letters are in the Arabic alphabet?', '28', ['26', '30', '24'], 'There are 28 letters, from Alif to Ya.'),
 ('Arabic Valley', '1-4', 'What does كِتَاب mean?', 'Book', ['Pen', 'House', 'Door'], 'كِتَاب (kitab) means book. The Qurʾan is called al-Kitab, the Book.'),
 ('Arabic Valley', '1-4', 'What does مَسْجِد mean?', 'Place of prayer', ['School', 'Market', 'Garden'], 'مَسْجِد (masjid) is the place where Muslims pray together.'),
 ('Arabic Valley', '1-4', 'What does مَاء mean?', 'Water', ['Moon', 'Sun', 'Tree'], 'مَاء (maʾ) means water.'),
 ('Arabic Valley', '2-4', 'Which sign makes a letter sound “i”?', 'Kes-ra', ['Fat-ha', 'Dom-ma', 'Sukun'], 'Kes-ra is written below the letter and gives the sound “i”.'),
 ('Arabic Valley', '2-4', 'Which letters are the Madd letters?', 'ا و ي', ['ب ت ث', 'ر ز س', 'ل م ن'], 'Alif, waw and ya without a vowel of their own lengthen the sound.'),
 ('Arabic Valley', '3-4', 'Which letter comes after nun with sukun in Iqlab?', 'ب', ['ل', 'م', 'ع'], 'Before ب, the nun becomes a meem sound with ghunnah.'),
 ('Seerah Library', '1-4', 'In which city was the Prophet Muhammad ﷺ born?', 'Makkah', ['Madinah', 'Taʾif', 'Jerusalem'], 'The Prophet ﷺ was born in Makkah.'),
 ('Seerah Library', '2-4', 'What was the name of the Prophet’s mother?', 'Aminah', ['Khadijah', 'Fatimah', 'Halimah'], 'His mother was Aminah bint Wahb.'),
 ('Seerah Library', '2-4', 'To which city did the Prophet ﷺ make the Hijrah?', 'Madinah', ['Taʾif', 'Jerusalem', 'Damascus'], 'The Prophet ﷺ migrated from Makkah to Madinah.'),
 ('Seerah Library', '2-4', 'Who was the first wife of the Prophet ﷺ?', 'Khadijah (RA)', ['ʿAʾishah (RA)', 'Hafsah (RA)', 'Sawdah (RA)'], 'Khadijah (RA) was his first wife and the first to believe in him.'),
 ('Seerah Library', '3-4', 'In which cave did the first revelation come?', 'Hira', ['Thawr', 'Uhud', 'ʿArafat'], 'The first revelation came in the cave of Hira, on Jabal an-Nur.'),
 ('Seerah Library', '1-4', 'Which Prophet built the Ark?', 'Nuh (AS)', ['Musa (AS)', 'Yunus (AS)', 'ʿIsa (AS)'], 'Allah commanded Prophet Nuh to build the Ark.'),
 ('Seerah Library', '1-4', 'Which Prophet was swallowed by a great fish?', 'Yunus (AS)', ['Yusuf (AS)', 'Nuh (AS)', 'Adam (AS)'], 'Prophet Yunus called on Allah from inside the fish, and Allah saved him.'),
 ('Seerah Library', '1-4', 'Who was the first human and the first Prophet?', 'Adam (AS)', ['Nuh (AS)', 'Ibrahim (AS)', 'Idris (AS)'], 'Adam (AS) was the first human, created by Allah.'),
 ('Seerah Library', '2-4', 'Which Prophet built the Kaʿbah with his son Ismaʿil?', 'Ibrahim (AS)', ['Musa (AS)', 'Dawud (AS)', 'Nuh (AS)'], 'Prophet Ibrahim and his son Ismaʿil raised the foundations of the Kaʿbah.'),
 ('Seerah Library', '2-4', 'Which Prophet was thrown into a well by his brothers?', 'Yusuf (AS)', ['Yunus (AS)', 'Ayyub (AS)', 'Harun (AS)'], 'Prophet Yusuf was patient, and Allah raised him to honour in Egypt.'),
 ('Seerah Library', '3-4', 'Which Prophet is known for his patience through a long illness?', 'Ayyub (AS)', ['Yusuf (AS)', 'Lut (AS)', 'Hud (AS)'], 'Prophet Ayyub stayed patient and thankful to Allah.'),
 ('Seerah Library', '3-4', 'Which Prophet’s brother Harun helped him?', 'Musa (AS)', ['Ismaʿil (AS)', 'Yahya (AS)', 'Shuʿayb (AS)'], 'Prophet Musa asked Allah to make his brother Harun his helper.'),
 ('Garden of Good Manners', '1-4', 'What do we say before we start eating?', 'Bismillah', ['Alhamdulillah', 'SubhanAllah', 'Allahu Akbar'], 'We begin in the Name of Allah.'),
 ('Garden of Good Manners', '1-4', 'Which hand do we eat with?', 'The right hand', ['The left hand'], 'The Prophet ﷺ taught us to eat with the right hand.'),
 ('Garden of Good Manners', '1-4', 'How do we greet another Muslim?', 'Assalamu ʿalaykum', ['Good luck', 'Jazakallahu khayran', 'Bismillah'], 'Spreading salam brings people closer together.'),
 ('Garden of Good Manners', '2-4', 'Someone sneezes and says “Alhamdulillah”. What do we reply?', 'Yarhamukallah', ['Bismillah', 'Allahu Akbar', 'Inshaʾ Allah'], 'We say “Yarhamukallah”, may Allah have mercy on you.'),
 ('Garden of Good Manners', '1-4', 'What do we say about something we plan to do later?', 'Inshaʾ Allah', ['Mashaʾ Allah', 'SubhanAllah', 'Astaghfirullah'], 'Inshaʾ Allah: if Allah wills.'),
 ('Garden of Good Manners', '1-4', 'What do we say when we see something beautiful?', 'Mashaʾ Allah', ['Astaghfirullah', 'Bismillah', 'Inshaʾ Allah'], 'Mashaʾ Allah: it is what Allah has willed.'),
 ('Garden of Good Manners', '2-4', 'What do we say when we ask Allah to forgive us?', 'Astaghfirullah', ['Alhamdulillah', 'Mashaʾ Allah', 'Inshaʾ Allah'], 'Astaghfirullah: I seek Allah’s forgiveness.'),
 ('Garden of Good Manners', '1-4', 'What must we do before we pray?', 'Make wudu', ['Eat a meal', 'Go for a run', 'Sleep'], 'Wudu, washing in the way we are taught, comes before Salah.'),
]
for t, lv, q, a, w, e in J:
    add('journey', 'choice', t, lv, q, a, w, e)

# ── Salah Master ──────────────────────────────────────────────────
add('salah', 'order', 'The steps', '1-4', 'The first rakʿah, in order',
    ' | '.join(['Make the intention (niyyah)', 'Say “Allahu Akbar” (takbir)', 'Stand and recite Subhanaka and Al-Fatihah, then a surah',
                'Bow (rukuʿ): “Subhana Rabbiyal ʿAzim”', 'Rise: “Samiʿ Allahu liman hamidah”', 'Prostrate (sujud): “Subhana Rabbiyal Aʿla”',
                'Sit between the two sujud', 'Prostrate a second time']), [], 'Please check the order and wording with your teacher’s method of teaching Salah.')
add('salah', 'order', 'The steps', '2-4', 'The end of a two-rakʿah prayer, in order',
    ' | '.join(['Second rakʿah: Al-Fatihah and a surah', 'Bow (rukuʿ)', 'Rise from rukuʿ', 'Two sujud', 'Sit and recite At-Tahiyyat',
                'Recite the Salat Ibrahimiyya', 'Make a duʿa', 'Salam to the right', 'Salam to the left']), [], '')
for a, b in [('Allahu Akbar', 'Starting the prayer (takbir)'), ('Al-Fatihah', 'Standing (qiyam)'), ('Subhana Rabbiyal ʿAzim', 'Bowing (rukuʿ)'),
             ('Samiʿ Allahu liman hamidah', 'Rising from rukuʿ'), ('Subhana Rabbiyal Aʿla', 'Prostration (sujud)'), ('At-Tahiyyat', 'Sitting at the end'),
             ('Assalamu ʿalaykum wa rahmatullah', 'Ending the prayer')]:
    add('salah', 'pair', 'What we say, and when', '1-4', a, b)
for q, a, w, e, lv in [
    ('How many obligatory (fard) rakʿahs are in Fajr?', '2', ['3', '4'], 'Fajr has two fard rakʿahs.', '1-4'),
    ('How many obligatory (fard) rakʿahs are in Dhuhr?', '4', ['2', '3'], 'Dhuhr has four fard rakʿahs.', '1-4'),
    ('How many obligatory (fard) rakʿahs are in ʿAsr?', '4', ['2', '3'], 'ʿAsr has four fard rakʿahs.', '2-4'),
    ('How many obligatory (fard) rakʿahs are in Maghrib?', '3', ['2', '4'], 'Maghrib has three fard rakʿahs.', '1-4'),
    ('How many obligatory (fard) rakʿahs are in ʿIsha?', '4', ['2', '3'], 'ʿIsha has four fard rakʿahs.', '2-4'),
    ('Which prayer is prayed before sunrise?', 'Fajr', ['Dhuhr', 'ʿIsha'], 'Fajr is the dawn prayer.', '1-4'),
    ('Which prayer is prayed just after sunset?', 'Maghrib', ['ʿAsr', 'Fajr'], 'Maghrib comes right after the sun sets.', '1-4'),
    ('Which direction do we face when we pray?', 'The Qiblah, towards the Kaʿbah', ['Any direction', 'Towards the sunrise'], 'Muslims everywhere face the Kaʿbah in Makkah.', '1-4'),
    ('What do we do before Salah to be clean?', 'Wudu', ['Eat', 'Sleep'], 'Wudu is the washing we do before prayer.', '1-4'),
]:
    add('salah', 'choice', 'Prayer facts', lv, q, a, w, e)

# ── Akhlaq Heroes: what would you do? ─────────────────────────────
for q, a, w, e, lv in [
    ('Your friend falls over in the playground. What do you do?', 'Help them up and check they are okay', ['Laugh with the others', 'Walk away', 'Tell them to watch where they go'], 'Muslims look after one another, like one body.', '1-4'),
    ('You find a wallet on the floor at the masjid. What do you do?', 'Give it to the imam or a teacher so it can be returned', ['Keep it', 'Take the money and leave the wallet', 'Hide it somewhere'], 'Returning what belongs to someone else is keeping an amanah, a trust.', '1-4'),
    ('Your mother asks for help setting the table while you are playing. What do you do?', 'Stop and help her with a smile', ['Pretend you did not hear', 'Say “later” and forget', 'Complain loudly'], 'Allah tells us to be kind and good to our parents.', '1-4'),
    ('A classmate gives a wrong answer and others laugh. What do you do?', 'Encourage them kindly', ['Laugh too', 'Tell everyone about it later', 'Make a joke about it'], 'Making fun of others hurts them; a kind word lifts them up.', '1-4'),
    ('A new student is sitting alone at lunch. What do you do?', 'Invite them to sit with you', ['Leave them alone', 'Whisper about them', 'Take their seat'], 'Welcoming others and making them feel included is good character.', '1-4'),
    ('Someone is calling another child names. What do you do?', 'Speak up kindly and tell a teacher', ['Join in', 'Laugh along', 'Film it on a phone'], 'We stand up for others and never take part in bullying.', '2-4'),
    ('You broke your sister’s toy by accident. What do you do?', 'Tell the truth and say sorry', ['Hide it', 'Blame someone else', 'Say nothing'], 'Honesty is part of a Muslim’s character, even when it is hard.', '1-4'),
    ('An elderly neighbour is carrying heavy shopping. What do you do?', 'Offer to help carry it', ['Watch from the window', 'Hurry past', 'Ask to be paid first'], 'Islam teaches us to honour our elders and be good to our neighbours.', '1-4'),
    ('You have sweets and your brother has none. What do you do?', 'Share with him', ['Eat them all quickly', 'Hide them', 'Show them off'], 'Sharing brings love between family members.', '1-4'),
    ('You hear the adhan while you are playing a game. What do you do?', 'Pause the game and get ready to pray', ['Turn up the volume', 'Keep playing until it ends', 'Say you will pray much later'], 'Answering the call to prayer shows our love for Allah.', '2-4'),
    ('Someone is rude to you. What do you do?', 'Stay calm and answer kindly', ['Shout back', 'Push them', 'Be rude to them next time'], 'Controlling our anger and answering with kindness is strength.', '2-4'),
    ('You want to use something that belongs to your friend. What do you do?', 'Ask permission first', ['Take it while they are not looking', 'Hide it for later', 'Use it and say nothing'], 'We respect what belongs to others and ask before we take.', '1-4'),
]:
    add('akhlaq', 'choice', 'What would you do?', lv, q, a, w, e)

# ── Daily character missions ──────────────────────────────────────
for d in ['Say salam to everyone in your family today', 'Help at home without being asked', 'Say Bismillah before every meal today',
          'Make duʿa for your parents', 'Smile at someone and say something kind', 'Thank someone and say “Jazakallahu khayran”',
          'Tidy your room', 'Listen to or read a short surah', 'Give something to someone who needs it',
          'Say “Alhamdulillah” for three blessings you have', 'Help a younger brother, sister or friend', 'Speak kindly all day',
          'Make wudu carefully before a prayer', 'Forgive someone who upset you']:
    add('daily', 'deed', 'Character mission', '1-4', d, '')

for i, r in enumerate(rows, 1):
    r['id'] = f"Q{i:03d}"

out = os.path.join(ROOT, 'src', 'data', 'question-bank.json')
os.makedirs(os.path.dirname(out), exist_ok=True)
json.dump(rows, open(out, 'w'), ensure_ascii=False, indent=0)

gs = os.path.join(ROOT, 'apps-script', 'Code.gs')
if os.path.exists(gs):
    s = open(gs).read()
    block = '// STARTER QUESTIONS (made by scripts/questions/starter.py)\nconst STARTER_QUESTIONS = ' + json.dumps(
        [[r['id'], r['game'], r['kind'], r['topic'], r['levels'], r['prompt'], r['answer'], ' | '.join(r['wrong']), r['explain']] for r in rows],
        ensure_ascii=False) + ';\n// END STARTER QUESTIONS'
    if '// STARTER QUESTIONS' in s:
        s = re.sub(r'// STARTER QUESTIONS.*?// END STARTER QUESTIONS', lambda m: block, s, flags=re.S)
    else:
        s = s.rstrip('\n') + '\n\n' + block + '\n'
    open(gs, 'w').write(s)
print(len(rows), 'questions:', {g: sum(1 for r in rows if r['game'] == g) for g in sorted({r['game'] for r in rows})})
