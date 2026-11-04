// Books a teacher adds to the Reading Library. See docs/reading-library.md for the full guide.
// Each book goes on the shelf for its `level` (1 or 2), after the school's own books.
//
// A picture book (for example pages exported from Canva as JPG) puts its pictures in
// public/library/<book-id>/ and gives each page `img` instead of `art`:
//
//   {
//     id: 'add-honest-ibrahim', level: 2, title: 'Honest Ibrahim', theme: 'Honesty', color: '#4A90D9',
//     pages: [
//       { img: 'library/add-honest-ibrahim/01.jpg', t: 'Ibrahim found a coin under the bench.' },
//       { img: 'library/add-honest-ibrahim/02.jpg', t: '…' },
//     ],
//     words: [{ w: 'honest', m: 'telling the truth' }, { w: 'bench', m: 'a long seat' }, { w: 'owner', m: 'the person something belongs to' }],
//     quiz: [{ q: 'What did Ibrahim find?', a: 'A coin', w: ['A cat', 'A book'] }],
//     choose: { q: 'You find money at school. What do you do?', options: ['Keep it', 'Give it to a teacher'], answer: 1, why: '…' },
//     hadith: { ar: '…', en: '…', src: 'Bukhari 0000' },   // or quran: { s, a, w: [first, last], en }
//   },
//
// Level 1 words use `p` (the name of a picture in src/lib/stories/art.mjs) instead of `m`.
// Check a new book with:  node scripts/stories/lint.mjs   (and node scripts/stories/quran.mjs for an ayah)
export const ADDED = [];
