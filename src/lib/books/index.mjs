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

// Which levels see each book on their "My Books" shelf (set by the school, 12 November 2026). A student sees only the
// books for their own level. A book's own `level` (in its file) is separate: it sets how the book behaves.
export const SHELF = {
  'first-arabic-1': [1],
  'dua-activity': [1],
  'first-arabic-2': [2],
  'moral-stories': [1, 2, 3, 4],
  'alif-ba-reading': [3, 4],
  'tawheed-textbook': [3, 4],
  'book-of-hadith': [3, 4],
  'arabic-beginners': [3, 4],
};
// the books on a level's shelf, in the shelf order (no level, e.g. the Admin class: every book)
export const booksFor = (level) => (level ? BOOKS.filter((b) => SHELF[b.id]?.includes(level)) : BOOKS);
