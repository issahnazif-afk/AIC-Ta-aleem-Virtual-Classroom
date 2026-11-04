# The Reading Library

The Reading Library is under **My Lessons**. Each level has its own shelf and reading journey:

| Shelf | Who | Books | Each book |
|---|---|---|---|
| First Readers | Level 1, ages 4–6 | 20 | 6 pages, short sentences (12 words at most), lots of sounds to say aloud |
| Adventure Readers | Level 2, ages 7–8 | 20 | 8 pages, an adventure with a problem to solve, new words with meanings |

Every book has one page where the reader has to tap something to move the story on. After the last page come
"What would you do?", the hadith or ayah, and then the **story games**:

| Game | Level 1 | Level 2 |
|---|---|---|
| Word game | Look at the picture, choose its word (the word is read aloud) | Read the word, choose its meaning |
| Story quiz | Two questions, read aloud | Three questions, the child reads them |
| Fill the gap | | A sentence from the book with one of its new words missing |
| Story order | Tap three pictures from the book in the order they happened | the same |

Each book earns 1 to 3 stars, a passport stamp and a Ta'aleem Star (it counts as the daily *character* mission).
There is a day streak, and badges at 5, 10, 15 and 20 books: Bronze, Silver and Gold Reader, then Library Star.
Level 2 words that the book teaches are underlined with dots in the story, and a tap shows what they mean.

Students in Levels 3 and 4 see both shelves until their own books are written.

## How the books were written

The books are written for the school. Monkey Pen and the Ata Yayıncılık books were looked at for the *kind* of story
(adventures, a problem, a brave choice) and the page format only; no text, plot or picture was taken from them.

Writing rules (checked by `npm run books`):

- Short, plain sentences, mixed long and short, with sounds children enjoy saying (*whoosh, splosh, glug*).
- The story shows the good manner through what the character does; it never preaches.
- No machine-sounding writing. The checker follows Wikipedia's *Signs of AI writing* guide. It flags words such as
  *delve, vibrant, embark* and *bustling*; "not just … but"; stacked lists of three; summary endings such as
  "In the end," and "From that day on"; stock phrases such as "a sense of" and "couldn't help but"; and em dashes.
- Each hadith is quoted with its collection and number. Ayahs come from the Tanzil text, never typed by hand.

`docs/reading-library-review.md` lists every book, page by page, with its hadith or ayah, for a teacher to check.

## Adding a book

Books a teacher adds go in `src/lib/library/added.mjs`. The comment at the top of that file shows a whole book.

1. **Pictures.** Make a folder `public/library/<book-id>/` and put the pages in it as `01.jpg`, `02.jpg`, …
   From Canva: open the design, **Share → Download → JPG**, choose all pages, then unzip the download into the folder.
   Pages that are only text in Canva can be left out: the words go in the book instead.
2. **The book.** Copy the example in `added.mjs`. Give it a short `id` (for example `add-honest-ibrahim`), its `level`,
   and one `{ img, t }` for each page. `t` is the sentence shown above the picture.
3. **The games.** Add three or four `words` (Level 1: `p` is the name of a picture from `src/lib/stories/art.mjs`;
   Level 2: `m` is the meaning), two or three `quiz` questions, one `choose`, and a `hadith` or `quran`.
4. **Check it.** Run `npm run books`. It lists anything missing or machine-sounding, takes the ayah's Arabic from
   Tanzil, and updates the review sheet. Fix what it lists, then build as usual.
5. **Voice.** The next deploy records the new pages with the storyteller voice. A teacher can also record them in the
   Voice Studio, under *Library Level 1* or *Library Level 2*.

A book made of picture files cannot have a tap page (there is nothing drawn to tap), but every game still works.
