// My Qur'an (children, Levels 1 to 4): every ayah the child has recited to the Sheikh, in any activity, with the surahs
// they have completed and the ones in progress. The record is progress.reading (src/lib/reading.mjs), saved with the
// rest of the child's progress to the class log.
import { summary, normalise, surahRange, unpack } from './reading.mjs';

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

// names: [{ n, ar, en, ayahs }] (the page's surah list); onRecite(s, a): open recitation at that place
export function renderMyQuran(root, reading, names, { young = false, onRecite } = {}) {
  root.replaceChildren();
  const rd = normalise(reading);
  const s = summary(rd, { days: 7 });
  const nameOf = (n) => names.find((x) => x.n === n) ?? { en: `Surah ${n}`, ar: '' };

  const stats = el('div', 'mq-stats');
  const stat = (big, small) => { const d = el('div', 'mq-stat'); d.append(el('b', '', big), el('span', '', small)); return d; };
  stats.append(stat(String(s.read), s.read === 1 ? 'ayah recited' : 'ayahs recited'), stat(String(s.complete.length), s.complete.length === 1 ? 'surah complete' : 'surahs complete'), stat(String(s.streak), s.streak === 1 ? 'day in a row' : 'days in a row'));
  root.append(stats);

  if (!s.read) {
    root.append(el('p', 'mq-empty', young ? 'Recite to the Sheikh, and every ayah you say will shine here!' : 'Nothing yet. Every ayah you recite to the Sheikh (Recite, the Hifz test, Learn with the Sheikh) is counted here.'));
    return;
  }

  // keep going: the surahs started but not finished, nearest to the end first
  if (s.inProgress.length) {
    root.append(el('h2', 'mq-h', young ? 'Keep going!' : 'In progress'));
    const list = el('ul', 'mq-list');
    const bits = unpack(rd.bits);
    for (const x of [...s.inProgress].sort((a, b) => b.read / b.total - a.read / a.total).slice(0, 10)) {
      const nm = nameOf(x.s);
      const li = el('li', 'mq-item');
      const top = el('div', 'mq-top');
      top.append(el('b', '', `${x.s}. ${nm.en}`), el('span', 'mq-ar', nm.ar));
      top.lastChild.lang = 'ar'; top.lastChild.dir = 'rtl';
      const bar = el('span', 'mq-bar'); const fill = el('i'); fill.style.width = `${(100 * x.read) / x.total}%`; bar.append(fill);
      li.append(top, bar, el('small', 'mq-note', `${x.read} of ${x.total} ayahs`));
      if (onRecite) {
        const [a0] = surahRange(x.s); let next = 1; for (let i = 0; i < x.total; i++) if (!((bits[(a0 + i) >> 3] >> ((a0 + i) & 7)) & 1)) { next = i + 1; break; }
        const b = el('button', 'mq-go', young ? 'Recite more' : 'Recite to the Sheikh'); b.type = 'button';
        b.addEventListener('click', () => onRecite(x.s, next));
        li.append(b);
      }
      list.append(li);
    }
    root.append(list);
  }

  // completed surahs, as stars
  if (s.complete.length) {
    root.append(el('h2', 'mq-h', young ? 'Surahs you finished' : 'Complete'));
    const wrap = el('div', 'mq-done');
    for (const x of s.complete) {
      const nm = nameOf(x.s);
      const c = el('span', 'mq-chip'); c.append(el('span', 'mq-star', '★'), document.createTextNode(` ${nm.en}`));
      c.title = `${x.s}. ${nm.en}: all ${x.total} ayahs`;
      wrap.append(c);
    }
    root.append(wrap);
  }

  // this week
  root.append(el('h2', 'mq-h', 'This week'));
  const days = el('div', 'mq-days');
  const max = Math.max(1, ...s.recent.map((x) => x.n));
  for (const x of s.recent) {
    const [y, m, d] = x.d.split('-').map(Number);
    const col = el('div', 'mq-day'); col.title = `${x.n} ayahs`;
    const b = el('i', x.n ? '' : 'zero'); b.style.height = `${x.n ? Math.max(8, (100 * x.n) / max) : 4}%`;
    col.append(el('small', 'mq-n', x.n ? String(x.n) : ''), b, el('small', '', new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short' })));
    days.append(col);
  }
  root.append(days);
}
