"""Turns the school's Canva PDFs into the page pictures of the Al-Huda Books (public/books/<id>/NNN.webp).

    python scripts/books/render.py "C:/path/to/AL-HUDA BOOKS"            # every book
    python scripts/books/render.py "C:/path/to/AL-HUDA BOOKS" dua-activity  # one book

Needs PyMuPDF and Pillow (pip install pymupdf pillow). The PDFs themselves are not kept in the repository:
they are large (the Moral Stories alone is 480 MB), and the site only needs the pictures.
Pages are 900 px wide WebP, which keeps a whole workbook to a few megabytes.
Which pages each book keeps is set in BOOKS below: text pages that the classroom shows as real text
(the Moral Stories' words, the Book of Hadith, the Tawheed textbook's words) are left out or kept only as pictures.
"""
import io
import os
import sys

import pymupdf
from PIL import Image

WIDTH = 900
QUALITY = 70

# id: (PDF file name, which pages to keep: 'all' | 'pictures' (pages with no text) | list of 1-based page numbers)
BOOKS = {
    'first-arabic-1': ('My First Arabic Letter I.pdf', 'all'),
    'first-arabic-2': ('My First Arabic Letter II.pdf', 'all'),
    'alif-ba-reading': ("Alif-Ba I_m reading Qurán.pdf", 'all'),
    'dua-activity': ('L1- Dua_Activity Book.pdf', 'all'),
    'moral-stories': ('Islamic Moral Stories.pdf', 'pictures'),
    'arabic-beginners': ('L3-Arabic for Beginners.pdf', 'all'),
    'book-of-hadith': ('L3-The Book of Hadith.pdf', [1, 2]),
    'tawheed-textbook': ('Tawheed Textbook for Ages 10–14.pdf', 'all'),
}


def render(src_dir, book_id, out_root):
    name, keep = BOOKS[book_id]
    path = os.path.join(src_dir, name)
    if not os.path.exists(path):
        # the file names have accents that some systems store differently: match on the start of the name
        stem = name[:12]
        found = [f for f in os.listdir(src_dir) if f.startswith(stem)]
        if not found:
            print(f'{book_id}: {name} not found in {src_dir}')
            return
        path = os.path.join(src_dir, found[0])
    doc = pymupdf.open(path)
    out = os.path.join(out_root, book_id)
    os.makedirs(out, exist_ok=True)
    n = 0
    for i, page in enumerate(doc):
        if keep == 'pictures' and (page.get_text().strip() and i > 0):
            continue
        if isinstance(keep, list) and (i + 1) not in keep:
            continue
        zoom = WIDTH / page.rect.width
        pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=False)
        img = Image.open(io.BytesIO(pix.tobytes('png')))
        img.save(os.path.join(out, f'{i + 1:03d}.webp'), 'WEBP', quality=QUALITY, method=6)
        n += 1
    size = sum(os.path.getsize(os.path.join(out, f)) for f in os.listdir(out))
    print(f'{book_id}: {n} pages, {size / 1e6:.1f} MB')


if __name__ == '__main__':
    src_dir = sys.argv[1]
    only = sys.argv[2:] or list(BOOKS)
    out_root = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'books')
    for b in only:
        render(src_dir, b, out_root)
