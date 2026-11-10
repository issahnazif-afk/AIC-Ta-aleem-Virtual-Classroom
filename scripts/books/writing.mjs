// The writing rules of scripts/books/lint.mjs (Wikipedia's "Signs of AI writing" and the longest sentence for each
// level), shared with the other checks (scripts/games/check.mjs).
// ── AI writing (Wikipedia: Signs of AI writing) ──
// always flagged: the "AI vocabulary" lists of each era, and the stock words of AI fiction
export const WORDS = ['additionally', 'align with', 'aligns with', 'boasts', 'bolstered', 'crucial', 'deep dive', 'delve', 'delves', 'emphasizing', 'emphasising',
  'enduring', 'enhance', 'enhances', 'enhancing', 'foster', 'fosters', 'fostering', 'garner', 'highlights', 'highlighting', 'highlighted', 'interplay',
  'intricate', 'intricacies', 'meticulous', 'meticulously', 'pivotal', 'robust', 'showcase', 'showcases', 'showcasing', 'tapestry', 'testament',
  'underscore', 'underscores', 'underscoring', 'vibrant', 'leverage', 'multifaceted', 'prioritize', 'prioritise', 'universally', 'dependable',
  'realm', 'embark', 'embarked', 'nestled', 'bustling', 'invaluable', 'unwavering', 'resonate', 'resonates', 'beacon', 'seamless', 'seamlessly',
  'transformative', 'harness', 'elevate', 'empower', 'empowering', 'symphony', 'kaleidoscope', 'boundless', 'enchanting', 'captivating',
  'breathtaking', 'treasure trove', 'heartwarming', 'whimsical', 'tirelessly', 'indelible', 'groundbreaking', 'renowned', 'diverse array',
  'in the heart of', 'natural beauty', 'commitment to', 'exemplifies', 'navigate', 'navigating', 'landscape', 'paramount', 'profound', 'profoundly'];
// common words the guide lists for newer models: flagged only when a chapter leans on them
export const SOFT = ['challenge', 'clearer', 'echoed', 'matters', 'practical', 'quietly', 'steady', 'key', 'valuable', 'rich', 'journey', 'truly', 'deeply', 'vital'];
export const PHRASES = [
  // undue emphasis on significance and legacy
  [/\b(?:stands|serves|functions|operates) as\b/i, 'avoids plain "is" ("serves as / stands as")'],
  [/\bis a (?:testament|reminder)\b/i, 'puffery ("is a testament / reminder")'],
  [/\b(?:a )?(?:crucial|pivotal|vital|significant|key|important) (?:role|moment)\b/i, 'puffery ("a vital role / pivotal moment")'],
  [/\b(?:setting the stage|marking (?:a|the)|shaping the|represents a shift|key turning point|focal point|deeply rooted|reflects (?:a )?broader|lasting legacy|enduring legacy)\b/i, 'puffery about significance'],
  [/\b(?:symboli[sz]es|symboli[sz]ing)\b/i, 'shallow analysis ("symbolizing")'],
  // superficial "-ing" tails
  [/,\s(?:highlighting|underscoring|emphasi[sz]ing|ensuring|reflecting|contributing to|cultivating|fostering|encompassing|showcasing|demonstrating|illustrating)\b/i, '"-ing" tail adding shallow analysis'],
  [/\bvaluable (?:insights?|lessons?)\b/i, 'stock phrase ("valuable lesson / insights")'],
  // vague connection, weasel words, challenges formula
  [/\bin (?:connection|association) with\b/i, 'vague connection ("in connection with")'],
  [/\b(?:experts|scholars|observers|researchers|studies|many people) (?:say|argue|agree|believe|suggest|show|have noted)\b/i, 'vague attribution (weasel words)'],
  [/\bdespite (?:these|its|their|the) challenges\b|\bfaces? (?:several |many |numerous )?challenges\b|\bfuture (?:outlook|prospects)\b/i, '"despite these challenges" formula'],
  // negative parallelisms
  [/\bnot (?:just|only|merely|simply)\b/i, 'negative parallelism ("not just / not only")'],
  [/\b(?:isn'?t|is not|wasn'?t|was not|aren'?t|are not) (?:just|only|merely|about)\b/i, 'negative parallelism ("is not just / about")'],
  [/\b(?:it'?s|it is|this is|that'?s|that is) not\b[^.!?]{1,50}[,;:]\s*(?:it'?s|it is|but)\b/i, 'negative parallelism ("it\'s not X, it\'s Y")'],
  [/\bno [a-z]+, no [a-z]+, (?:just|only)\b/i, 'negative parallelism ("no X, no Y, just Z")'],
  [/\bmore than just\b/i, '"more than just"'],
  // summaries, sermons, hedges, chatbot talk
  [/\b(?:in the end|in conclusion|in summary|to sum up|overall|ultimately),/i, 'summary ending'],
  [/^remember,/i, 'sermon opening ("Remember, …")'],
  [/\b(?:it'?s|it is) (?:important|worth|essential|crucial) to (?:note|remember|mention|understand)\b|\bworth (?:noting|mentioning)\b/i, 'hedging ("it is important to note")'],
  [/\b(?:it'?s|it is) important to\b/i, '"it is important to"'],
  [/\b(?:i hope this helps|certainly!|of course!|let me know|would you like|here is a|here are some|great question)\b/i, 'chatbot talk'],
  [/\bbased on (?:the )?available\b|\bnot widely (?:documented|available|known)\b/i, 'hedging about sources'],
  [/\blearned (?:an? )?(?:important|valuable) lesson\b/i, 'stated moral ("learned an important lesson")'],
  [/\bthe (?:true|real) (?:meaning|treasure|strength|secret|power)\b|\bthe power of\b/i, 'stated moral ("the true meaning / the power of")'],
  [/\bfrom that day (?:on|forward)\b|\bever since that day\b/i, 'formula ending ("from that day on")'],
  [/\b(?:heart|chest) (?:swelled|swell|bloomed|soared)\b/i, 'stock emotion ("heart swelled")'],
  [/\bcouldn'?t help but\b|\blittle did (?:he|she|they)\b|\ba sense of\b|\bin today'?s (?:world|fast-paced)\b|\bfast-paced\b/i, 'stock phrase'],
  [/\b(?:moreover|furthermore|consequently|notably),/i, 'essay transition'],
  [/\bjourney of\b|\bon a journey\b/i, 'stock metaphor ("a journey of")'],
  // typography and markup
  [/—/, 'em dash (use a comma, a colon or a full stop)'],
  [/[“”‘’]/, 'curly quotes: use straight quotes (" and \')'],
  [/\*\*|__|^#+\s|^---|```|\[[^\]]+\]\([^)]+\)/m, 'Markdown'],
  [/\p{Extended_Pictographic}/u, 'emoji in the text'],
  [/\b(?:TODO|lorem ipsum|insert [a-z ]+ here|\[insert|xx-xx)\b/i, 'placeholder text'],
];
export const LIMIT = { 1: 12, 2: 18, 3: 26, 4: 32 };   // longest sentence, in words

// every problem in one piece of the school's English, for a reader of that level
export function lintText(t, level = 4) {
  const out = [];
  for (const x of WORDS) if (new RegExp(`\\b${x}\\b`, 'i').test(t)) out.push(`AI word "${x}"`);
  for (const [re, msg] of PHRASES) if (re.test(t)) out.push(msg);
  for (const s of t.split(/(?<=[.!?…])\s+/)) {
    const n = s.split(/\s+/).filter(Boolean).length;
    if (n > LIMIT[level]) out.push(`sentence of ${n} words is long for Level ${level}: "${s.slice(0, 60)}…"`);
  }
  return out;
}
