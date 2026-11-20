/**
 * Built-in wording filter for school stories.
 *
 * - Catches profanity, insults, slurs and threats, including disguised spellings
 *   (f*ck, sh1t, fuuuck, f.u.c.k, $hit).
 * - Matches whole words only, so innocent words are never touched
 *   ("class", "assembly", "hello", "Scunthorpe", "dumbbell").
 * - Sensitive topics (bullying, abuse, racism…) are NOT removed — a parent may be
 *   writing about an anti-bullying event — but they flag the story for Admin review.
 */

/** Any word that STARTS with one of these is removed (fuck → fucking, motherfucker…). */
const PREFIX_WORDS = [
  'fuck', 'fuk', 'fck', 'phuck', 'motherfuck', 'shit', 'bullshit', 'bitch', 'bastard', 'asshole', 'arsehole',
  'dumbass', 'jackass', 'smartass', 'badass', 'cunt', 'wank', 'retard', 'idiot', 'stupid', 'moron', 'imbecile',
  'douche', 'scumbag', 'dipshit', 'nigger', 'nigga', 'faggot',
  // Common Hindi / Urdu abuse (romanised)
  'chutiy', 'bhenchod', 'behenchod', 'madarchod', 'bhosd', 'gandu', 'harami', 'kamina', 'kameena', 'lavde',
];

/** Removed only as a whole word, optionally with a normal English ending (-s, -ed, -ing, -er, -est, -y). */
const EXACT_WORDS = [
  'ass', 'arse', 'damn', 'dammit', 'goddamn', 'hell', 'crap', 'crappy', 'dick', 'dickhead', 'cock', 'prick', 'twat',
  'piss', 'pissed', 'slut', 'whore', 'hoe', 'fag', 'pussy', 'dumb', 'loser', 'ugly', 'useless', 'worthless',
  'pathetic', 'hate', 'hating', 'hateful', 'fatso', 'fatty', 'freak', 'jerk', 'scum', 'sucks', 'lame', 'stfu', 'gtfo',
  'wtf', 'omfg', 'kys', 'randi', 'lauda', 'saala', 'kutta', 'kutti',
];

/** Multi-word insults and threats. */
const PHRASES = [
  'shut up', 'shut the', 'beat you', 'beat him', 'beat her', 'kill you', 'kill yourself', 'kill him', 'kill her',
  'kill them', 'go die', 'drop dead', 'shame on you', 'screw you', 'screw this', 'nobody likes you',
  'is trash', 'are trash', 'is garbage', 'are garbage', 'is a joke', 'are a joke', 'get lost',
];

/** Flag for Admin review, but keep the words (they may describe the topic, not insult anyone). */
const SENSITIVE_TOPICS = [
  'bully', 'bullies', 'bullied', 'bullying', 'abuse', 'abused', 'abusive', 'abusing', 'racist', 'racism',
  'casteist', 'sexist', 'harass', 'harassed', 'harassment', 'suicide', 'self-harm', 'drugs', 'weapon',
];

const EMOJIS = ['🖕'];

/* Look-alike characters people use to sneak words past filters. "*" / "#" may stand for any letter after the first. */
const LOOKALIKE: Record<string, string> = {
  a: '@4', e: '3', i: '1!|', o: '0', s: '$5', t: '7+', l: '1|', g: '9', b: '8', u: 'v', c: '(k',
};

const esc = (s: string) => s.replace(/[\\\]\-^[]/g, '\\$&');

function letterPattern(ch: string, masked: boolean): string {
  const extra = (LOOKALIKE[ch] ?? '') + (masked ? '*#' : '');
  return `[${esc(ch + extra)}]+`;
}

/** "fuck" → pattern that also matches f*ck, fuuuck, f.u.c.k, phuck-style repeats. */
function wordPattern(word: string): string {
  return word
    .split(' ')
    .map((w) =>
      w
        .split('')
        .map((ch, i) => (ch === '-' ? '[-\\s]?' : letterPattern(ch, i > 0)))
        .join('[._\\-]?')
    )
    .join('\\s+');
}

const START = '(?<![\\p{L}\\p{N}])';
const END = '(?![\\p{L}\\p{N}])';
const SUFFIX = '(?:s|es|ed|d|ing|er|ers|est|y|ies)?';

const REMOVE_RULES: { label: string; re: RegExp }[] = [
  ...PREFIX_WORDS.map((w) => ({ label: w, re: new RegExp(`${START}${wordPattern(w)}\\p{L}*${END}`, 'giu') })),
  ...EXACT_WORDS.map((w) => ({ label: w, re: new RegExp(`${START}${wordPattern(w)}${SUFFIX}${END}`, 'giu') })),
  ...PHRASES.map((w) => ({ label: w, re: new RegExp(`${START}${wordPattern(w)}${END}`, 'giu') })),
  ...EMOJIS.map((e) => ({ label: 'offensive emoji', re: new RegExp(e, 'gu') })),
];

const TOPIC_RULES = SENSITIVE_TOPICS.map((w) => ({
  label: w,
  re: new RegExp(`${START}${w.replace(/-/g, '[-\\s]?')}${END}`, 'iu'),
}));

export interface FilterResult {
  cleaned: string;
  /** Unsuitable wording that was replaced with [removed]. */
  removed: string[];
  /** Sensitive topics mentioned — kept, but the story needs Admin review. */
  topics: string[];
}

export function filterText(text: string): FilterResult {
  let cleaned = text || '';
  const removed: string[] = [];
  for (const { label, re } of REMOVE_RULES) {
    re.lastIndex = 0;
    if (re.test(cleaned)) {
      removed.push(label);
      re.lastIndex = 0;
      cleaned = cleaned.replace(re, '[removed]');
    }
  }
  const topics = TOPIC_RULES.filter(({ re }) => re.test(cleaned)).map(({ label }) => label);
  return { cleaned, removed: [...new Set(removed)], topics: [...new Set(topics)] };
}
