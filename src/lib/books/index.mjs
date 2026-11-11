// The Ta’aleem Books: the school's own Canva books as interactive digital books (docs/books.md).
// The shelf shows them in this order. To add a book: render its pages (scripts/books/render.py), write
// src/lib/books/<id>.mjs, add it here, and run  npm run books.
import firstArabic1 from './first-arabic-1.mjs';
import firstArabic2 from './first-arabic-2.mjs';
import duaActivity from './dua-activity.mjs';
import alifBa from './alif-ba-reading.mjs';
import moralStories from './moral-stories.mjs';
import arabicBeginners from './arabic-beginners.mjs';
import bookOfHadith from './book-of-hadith.mjs';
import tawheed from './tawheed-textbook.mjs';

export const BOOKS = [firstArabic1, firstArabic2, duaActivity, alifBa, moralStories, arabicBeginners, bookOfHadith, tawheed];