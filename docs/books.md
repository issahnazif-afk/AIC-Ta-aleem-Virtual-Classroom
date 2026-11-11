# The Ta’aleem Books

**Ta’aleem Books** is under *My Lessons*. It puts the school's own Canva books into the classroom as interactive
digital books, each one shaped for the age it was written for. A child picks a book, reads it chapter by chapter,
and does the activities on the way. Each chapter they finish gives stars (one to three) and Ta'aleem Stars.

| Book | Level | Ages | What the child does |
|---|---|---|---|
| My First Arabic Letters 1 and 2 | 1 | 4–6 | The workbook pages with crayons (trace, colour, circle, join), tap a letter to hear it, then listen-and-find games |
| My Du'a Activity Book | 1 | 4–6 | Each du'a: when we say it, the Arabic, how to say it, what it means; colour the picture; match and choose games |
| Alif Ba: I'm Learning Qur'an | 2 | 6–8 | Letters, their forms, the harakat, sukun, shadda and tanween, with the workbook pages, letter sounds and games |
| Islamic Stories for Kids | 2 | 6–9 | Grandpa Musa's stories read aloud with the book's pictures, new words, questions, the hadith, "What would you do?" |
| Arabic for Beginners | 3 | 8–10 | The textbook pages, the words with meanings, matching and fill-the-gap practice |
| The Book of Hadith | 3 | 9–11 | Each hadith with its story, the meaning of its words, questions, and a reflection to write |
| Tawheed: Islamic Monotheism | 4 | 10–14 | Six units of lessons, key words, the textbook pages, reflections, a quiz after each lesson and the unit tests |

How the reader changes with the level:

- **Level 1**: everything is read aloud from the start (the button at the top turns it off), questions and answers
  are read out, buttons are big, and workbook pages open with thick crayons.
- **Level 2**: read aloud from the start; the child reads the questions, with a *Read it to me* button.
- **Levels 3 and 4**: the child reads; reading aloud is off until they turn it on. Tests show a percentage, and
  what a student writes is kept on that computer.

Every child can open every book; the shelf shows the books for their own class first.

## The flipbook

A book opens like a printed book on a desk. The closed hard cover (the book's first page picture) comes onto the
desk and opens; then come a title page, a contents page, every chapter with an end card after it, and the hard back
cover. The reader uses [StPageFlip](https://github.com/Nodlik/StPageFlip) (`page-flip` 2.0.7, MIT) in HTML mode,
bundled with the books (it loads only when the shelf is opened, with the books' styles).

- **Turning.** Drag a corner or the outer edge of a page, swipe it, press the arrows beside the book, or use the keys:
  left and right arrows (Page Up, Page Down), Home for the cover, End for the back cover, + and - to zoom, Escape to
  close a panel or stop zooming. A page curls over with its shadow and a soft paper sound, made on the spot with Web
  Audio (the speaker button turns it off).
- **One page or two.** Two pages side by side when they fit at a good size; one on a phone or an upright tablet.
- **The bar under the book:** the contents (jump to a chapter), all the pages as small pictures (jump to a page), the
  page number and a bar for how far through the book you are, zoom (also a double click; drag to look around), the
  page sound and full screen.
- **Activities stay on the page.** A press on a button, the crayons, a text box or the picture you draw on never turns
  the page: the page-turner only hears presses on the outer edge and the corners (and, on reading pages, anywhere that
  is not a button). Clicking does not turn a page except on a corner. A quiz, match, order, gap, sort or listen-and-find
  page holds the book open, forward only, until it is done; the arrow turns pale and a note says what to do.
- **Finishing a chapter.** When the end card of a chapter is open and every page of the chapter has been open and its
  activities done, the chapter is finished: its stars are saved and the Ta'aleem Stars appear on the card. Jumping to
  the end card does not finish a chapter; the card lists what is still to do, with a button to each page. Pages before
  the place where a child stopped last time count as read.
- **Turn pages for me** (Levels 1 and 2, when *Reading to me* is on): after the open reading pages (story, du'a,
  hadith, ayah) have been read aloud, the book turns by itself. It never turns past an activity, a workbook page or an
  end card.
- **Big books open fast.** Only the pages near the open one are built (about a dozen); the rest are empty until the
  child comes near them. The page-turner only draws while a page is moving.
- **Reduced motion.** When the computer asks for reduced motion, a page changes with a quick fade instead of a curl.
- **Under every reading theme** (Night, Yellow and the rest) the desk, the bars and the pages keep their own colours:
  paper pages with dark ink.

`?test=1` adds the answer hints (`data-answer`, `data-pair`, `data-order`) that the click-through test uses.

## Where things are

```
public/books/<id>/NNN.webp   the page pictures (from scripts/books/render.py; the PDFs are not kept in the repository)
src/lib/books/<id>.mjs       one book: its chapters and pages
src/lib/books/index.mjs      the order of the shelf
src/lib/books/ebook.mjs      the shelf and the reader
scripts/books/lint.mjs       the checks (npm run books), and docs/books-review.md for teachers
```

To change a sentence, edit the book's file and run `npm run books`. To bring in a new Canva book: export it as PDF,
add it to `BOOKS` in `scripts/books/render.py`, run `python scripts/books/render.py "<folder with the PDFs>" <id>`,
write `src/lib/books/<id>.mjs`, add it to `index.mjs`, and run `npm run books`.

## A book

```js
export default {
  id: 'dua-activity', title: "My Du'a Activity Book", ar: 'كِتَابُ أَدْعِيَتِي',
  level: 1, ages: '4–6', color: '#E8797A',
  cover: 'books/dua-activity/001.webp',
  about: 'One sentence for the shelf and the contents page.',
  unit: 'chapters',             // or 'units', 'lessons', 'stories': the word the shelf uses
  note: 'For teachers: …',      // optional, shown under the contents
  chapters: [
    { title: 'Bismillah', ar: 'بِسْمِ ٱللَّهِ', pages: [ … ] },
    { title: 'Unit One test', test: true, pages: [ … ] },   // a test: the score is shown as a percentage
  ],
};
```

## The pages

Every page has a `type`. Any page can have `h` (a heading, in sentence case) and `check` (a note for the teacher's
review sheet, for example "the hadith number needs checking").

| type | Fields | What the child sees |
|---|---|---|
| `scan` | `img`, `say?`, `draw?` (default true), `tap?`, `tapLabel?`, `alt?` | The workbook page with crayons over it. `say` is read aloud under it. `tap` is a row of buttons: `{ ar, letter?, en? }`. With `letter` (one Arabic letter, e.g. `'ب'`) the Sheikh's letter voice says it; otherwise `en` is read aloud |
| `read` | `text`, `img?`, `cap?`, `words?` | Words to read. `text` is a list of: a sentence or paragraph (string), `{ ar }` (Arabic), `{ note: { h, t } }` (a box), `{ list: [...] , numbered? }`, `{ table: [[…], …] }` (first row is the header). `words: [{ w, m }]`: the word is underlined in the text and listed with its meaning |
| `quiz` | `items: [{ q, a, w: [wrong, …], why? }]`, `shuffle?` | One question at a time. Two tries, then the answer is shown with `why` |
| `match` | `pairs: [[left, right], …]`, `prompt?` | Tap one on the left, then its partner |
| `order` | `items` (in the right order), `prompt?` | Tap them in order |
| `gap` | `items: [{ t: 'A sentence with ___ in it.', a, w: [...] }]` | Choose the missing word |
| `sort` | `groups: ['…', '…']`, `items: [[text, groupIndex], …]`, `prompt?` | Tap a card, then its basket |
| `find` | `letters: ['ب', 'ت', 'ث']`, `rounds?` | The Sheikh says a letter; the child finds it |
| `write` | `prompt`, `lines?`, `hint?` | A box to write in, kept on that computer |
| `dua` | `ar`, `tr?` (how to say it), `en`, `when?`, `src?` | A du'a card |
| `hadith` | `ar?`, `en`, `src` (collection and number), `kicker?`, `text?` | A hadith card |
| `ayah` | `s`, `a`, `w?: [first, last]`, `en` | The ayah from the Tanzil text (never typed by hand), with the reciter |

Arabic in an option, a match card or a table is shown right to left in the Arabic font automatically.

The Arabic of a hadith or a du'a is never read by a computer voice. It plays a teacher's recording from the Voice
Studio (*Hadith in Arabic* tab) when there is one; the meaning is read in English. Ayat play the class's reciter.

## Writing rules (checked by `npm run books`)

The words are the school's books, rewritten where needed so they read as a person wrote them for children.

- **Reading level.** The longest sentence: Level 1, 12 words; Level 2, 18; Level 3, 26; Level 4, 32. Mix short
  sentences with longer ones.
- **No machine-sounding writing.** The checker follows Wikipedia's guide
  [*Signs of AI writing*](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing):
  - AI vocabulary: *delve, crucial, pivotal, vibrant, foster, enhance, showcase, testament, tapestry, underscore,
    highlight* (as a verb), *intricate, robust, boasts, landscape, profound, navigate, embark, journey of …*
  - Puffing up importance: *serves as, stands as, plays a vital role, a testament to, deeply rooted, marking a …*
  - Sentences that end in an "-ing" phrase adding shallow comment: *…, highlighting the importance of …*
  - Negative parallelisms: *not just … but*, *it's not X, it's Y*, *no X, no Y, just Z*, *more than just*
  - The rule of three used again and again (*kind, gentle, and patient*)
  - Summary endings and sermons: *In the end, … / In conclusion / Remember, … / learned an important lesson*
  - Chatbot talk and hedging: *I hope this helps, Certainly!, it is important to note, worth noting*
  - Vague attributions: *experts say, scholars agree, studies show*
  - Style: headings in Title Case (use sentence case), emoji, Markdown, curly quotes (use straight `"` and `'`),
    em dashes (use a comma, colon or full stop), and every sentence the same length
- **Say it plainly.** "Allah is the Creator", not "Allah serves as the Creator". Name the thing: "Bilal was a slave
  in Makkah", not "Bilal faced many challenges".
- **The sources.** Ayat come from the Tanzil text. Each hadith gives its collection and number, from the sound
  (sahih or hasan) collections; a weak narration is left out. Stories of the Prophets and Companions are told only
  as the sources tell them, with no invented words put in their mouths. The Prophet ﷺ, his family and his
  Companions are never pictured.

`docs/books-review.md` lists every book, page by page, with each hadith, ayah and du'a. **Please have an
Islamic Studies teacher read it before the books are used in class.**
