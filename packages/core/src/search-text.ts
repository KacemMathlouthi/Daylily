/** A range of a text, `[start, end)`, in UTF-16 units as JavaScript indexes strings. */
export type TextRange = readonly [start: number, end: number];

const MARKS = /\p{M}/gu;
const WORD_CHAR = /^[\p{L}\p{N}]$/u;
const NOT_WORD = /[^\p{L}\p{N}]+/u;
const SPACES_ALL = /\s+/g;
// Greek writes a final sigma as ς, which upper case gives back as Σ
const FINAL_SIGMA = /ς/g;

/** A character as search compares it: lower case, without accents. */
function foldChar(char: string) {
  return char
    .normalize("NFD")
    .replace(MARKS, "")
    .toLowerCase()
    .replace(FINAL_SIGMA, "σ");
}

/**
 * `text` folded for comparing, with where each folded unit came from in the
 * original, since folding can change lengths (an accent is dropped, "İ" grows).
 */
function folded(text: string) {
  let value = "";
  const from: number[] = [];
  let index = 0;
  for (const char of text) {
    const fold = foldChar(char);
    value += fold;
    // One entry per UTF-16 unit, as strings are indexed
    from.push(...Array.from({ length: fold.length }, () => index));
    index += char.length;
  }
  from.push(index);
  return { from, value };
}

/** Words in nearly every page, which would mark everything and find nothing in particular. */
const COMMON_WORDS = new Set([
  "a",
  "an",
  "and",
  "at",
  "but",
  "by",
  "for",
  "from",
  "i",
  "in",
  "is",
  "it",
  "me",
  "my",
  "of",
  "on",
  "or",
  "so",
  "the",
  "to",
  "was",
  "we",
  "with",
]);

/**
 * The words of a search, folded, split wherever the text would be ("didn't" is
 * "didn" and "t", as on the page). Common words like "the" are left out when
 * there's anything else to look for.
 */
export function queryWords(query: string) {
  const words = [...query]
    .map(foldChar)
    .join("")
    .split(NOT_WORD)
    .filter((word) => word !== "");
  const telling = words.filter((word) => !COMMON_WORDS.has(word));
  return telling.length > 0 ? telling : words;
}

/** Shorter words match only whole, or with a plural "s": "sea" finds "seas", never "seat". */
export const PREFIX_FROM_LENGTH = 4;
/** Words this long forgive one typo, as the index does: "brekfast" finds "breakfast". */
export const TYPO_FROM_LENGTH = 5;

/** Whether `a` becomes `b` with at most one letter added, dropped or changed. */
function withinOneEdit(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) {
    return false;
  }
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) {
    i += 1;
  }
  if (a.length === b.length) {
    return a.slice(i + 1) === b.slice(i + 1);
  }
  const [shorter, longer] = a.length < b.length ? [a, b] : [b, a];
  return shorter.slice(i) === longer.slice(i + 1);
}

/** Whether `found`, a whole word of the text, is what `word` of the search asks for. */
function answers(found: string, word: string) {
  if (word.length < PREFIX_FROM_LENGTH) {
    return found === word || found === `${word}s`;
  }
  if (found.startsWith(word)) {
    return true;
  }
  // The word's start with one typo: a prefix of about its length, one edit away
  return (
    word.length >= TYPO_FROM_LENGTH &&
    [-1, 0, 1].some((change) =>
      withinOneEdit(found.slice(0, word.length + change), word)
    )
  );
}

/** The whole words of a folded text, by code point so letters beyond the BMP count, with their UTF-16 spans. */
function* foldedWords(value: string) {
  let start = -1;
  let at = 0;
  for (const char of value) {
    if (WORD_CHAR.test(char)) {
      if (start === -1) {
        start = at;
      }
    } else if (start !== -1) {
      yield [start, at] as const;
      start = -1;
    }
    at += char.length;
  }
  if (start !== -1) {
    yield [start, at] as const;
  }
}

/**
 * Where the words of `query` appear in `text`, each match a whole word that
 * starts with one of them ("walk" marks "walked"; a word of three letters or
 * fewer only itself; a long word with one typo too), ignoring case and
 * accents. In order, never overlapping.
 */
export function matchRanges(text: string, query: string): TextRange[] {
  const words = queryWords(query);
  if (words.length === 0) {
    return [];
  }
  const { from, value } = folded(text);
  const ranges: TextRange[] = [];
  for (const [start, end] of foldedWords(value)) {
    const found = value.slice(start, end);
    if (words.some((word) => answers(found, word))) {
      ranges.push([from[start] ?? 0, from[end] ?? text.length]);
    }
  }
  return ranges;
}

export interface Snippet {
  /** Where the query's words are in `text`, to mark them. */
  marks: TextRange[];
  text: string;
}

/** Characters shown before the first match: enough to read it in context, few enough that a narrow list still shows it. */
const LEAD = 24;

/**
 * A line of `text` around the first match of `query`, about `max` characters,
 * cut at words, with "…" where it was cut. Without a match (the words were
 * only in the title), it's the start of the text.
 */
export function searchSnippet(text: string, query: string, max = 140): Snippet {
  const line = text.replace(SPACES_ALL, " ").trim();
  const ranges = matchRanges(line, query);
  const first = ranges[0]?.[0] ?? 0;

  // A page that fits is quoted whole; a longer one starts just before the match
  let start = line.length <= max ? 0 : Math.max(0, first - LEAD);
  if (start > 0) {
    // Begin on a word, never in the middle of one
    const space = line.indexOf(" ", start);
    start = space === -1 || space >= first ? first : space + 1;
  }
  let end = Math.min(line.length, start + max);
  if (end < line.length) {
    const space = line.lastIndexOf(" ", end);
    end = space > first ? space : end;
  }

  const before = start > 0 ? "…" : "";
  const shift = before.length - start;
  return {
    marks: ranges
      .filter(([from, to]) => from >= start && to <= end)
      .map(([from, to]) => [from + shift, to + shift] as const),
    text: `${before}${line.slice(start, end)}${end < line.length ? "…" : ""}`,
  };
}
