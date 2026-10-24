const IMAGE = /!\[[^\]]*\]\([^)]*\)/g;
const LINK = /\[([^\]]*)\]\([^)]*\)/g;
const BLOCK_MARKS =
  /^(?:\s*(?:#{1,6}\s|>\s?|[-*+]\s(?:\[[ xX]\]\s)?|\d+[.)]\s))+/gm;
const INLINE_MARKS = /[*_~`]+/g;
const RULE = /^\s*(?:[-*_]\s*){3,}$/;
// Headings name a part of the page; the excerpt is its words
const HEADINGS_ONLY = /^(?:\s*#{1,6}\s[^\n]*(?:\n|$))+$/;
const LINE_ENDINGS = /\r\n?/g;
const SPACES = /\s+/g;
const PARAGRAPH_BREAK = /\n\s*\n/;

/**
 * The page's first paragraph with words in it, as plain text and cut at a word
 * near `max` characters: what a card shows of a day, such as "one year ago today".
 */
export function pageExcerpt(markdown: string, max = 180) {
  const paragraphs = markdown
    .replace(LINE_ENDINGS, "\n")
    .replace(IMAGE, "")
    .replace(LINK, "$1")
    .split(PARAGRAPH_BREAK);
  for (const paragraph of paragraphs) {
    if (RULE.test(paragraph) || HEADINGS_ONLY.test(paragraph)) {
      continue;
    }
    const text = paragraph
      .replace(BLOCK_MARKS, "")
      .replace(INLINE_MARKS, "")
      .replace(SPACES, " ")
      .trim();
    if (text === "") {
      continue;
    }
    if (text.length <= max) {
      return text;
    }
    const cut = text.slice(0, max);
    const lastSpace = cut.lastIndexOf(" ");
    return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
  }
  return "";
}
