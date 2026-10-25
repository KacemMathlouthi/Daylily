/** A range of a text, `[start, end)`, in UTF-16 units as JavaScript indexes strings. */
export type TextRange = readonly [start: number, end: number];

const MARKS = /\p{M}/gu;
const WORD_CHAR = /[\p{L}\p{N}]/u;
const SPACES = /\s+/;
const SPACES_ALL = /\s+/g;
const EDGE_PUNCTUATION = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu;

/** A character as search compares it: lower case, without accents. */
function foldChar(char: string) {
  return char.normalize("NFD").replace(MARKS, "").toLowerCase();
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

/** The words of a search, folded; punctuation around them is not part of them. */
export function queryWords(query: string) {
  return query
    .split(SPACES)
    .map((word) => [...word].map(foldChar).join(""))
    .map((word) => word.replace(EDGE_PUNCTUATION, ""))
    .filter((word) => word !== "");
}

const isWordChar = (char: string | undefined) =>
  char !== undefined && WORD_CHAR.test(char);

/**
 * Where the words of `query` appear in `text`, each match a whole word that
 * starts with one of them ("walk" marks "walked"), ignoring case and accents.
 * In order, never overlapping.
 */
export function matchRanges(text: string, query: string): TextRange[] {
  const words = queryWords(query);
  if (words.length === 0) {
    return [];
  }
  const { from, value } = folded(text);
  const ranges: TextRange[] = [];
  let at = 0;
  while (at < value.length) {
    const startsWord = !isWordChar(value[at - 1]) && isWordChar(value[at]);
    const word = startsWord
      ? words.find((candidate) => value.startsWith(candidate, at))
      : undefined;
    if (!word) {
      at += 1;
      continue;
    }
    let end = at + word.length;
    while (isWordChar(value[end])) {
      end += 1;
    }
    ranges.push([from[at] ?? 0, from[end] ?? text.length]);
    at = end;
  }
  return ranges;
}

export interface Snippet {
  /** Where the query's words are in `text`, to mark them. */
  marks: TextRange[];
  text: string;
}

/** Characters shown before the first match, so it reads in context. */
const LEAD = 40;

/**
 * A line of `text` around the first match of `query`, about `max` characters,
 * cut at words, with "…" where it was cut. Without a match (a typo forgiven by
 * the index), it's the start of the text.
 */
export function searchSnippet(text: string, query: string, max = 140): Snippet {
  const line = text.replace(SPACES_ALL, " ").trim();
  const ranges = matchRanges(line, query);
  const first = ranges[0]?.[0] ?? 0;

  let start = Math.max(0, first - LEAD);
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
