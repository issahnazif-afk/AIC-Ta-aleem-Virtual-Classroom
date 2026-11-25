// Garden points: what a student's My Garden is worth in Noor Trail, where they buy powers with it.
// Worked out from the same progress the garden is drawn from (src/pages/index.astro, openGarden), without its caps:
//   2 per flower (any finished activity), 3 per Qur'an tree, 5 per Alif Ba palm, 3 per kindness flower,
//   10 per badge lantern, and 10 for the fountain (three days of learning in a row).
// Powers bought are kept in progress.trail.spent, so the garden itself never shrinks.
import { rewardsOf } from '../rewards.mjs';

export const GARDEN_RULES = [['🌸', 'flower', 2], ['🌳', "Qur'an tree", 3], ['🌴', 'Alif Ba palm', 5], ['💗', 'kindness flower', 3], ['🏮', 'badge lantern', 10], ['⛲', 'fountain', 10]];

export function gardenPoints(progress, palms = 0) {
  const r = rewardsOf(progress), c = r.counts;
  const flowers = Math.max(0, (c.all ?? 0) - (c.quran ?? 0)), trees = c.quran ?? 0, kind = c.kindness ?? 0, lanterns = Object.keys(r.badges).length;
  return flowers * 2 + trees * 3 + palms * 5 + kind * 3 + lanterns * 10 + (r.streak >= 3 ? 10 : 0);
}

export function trailOf(progress) {
  const t = (progress.trail ??= {});
  t.stages ??= {}; t.spent ??= 0; t.powers ??= {}; t.items ??= {}; t.seen ??= {};
  return t;
}
