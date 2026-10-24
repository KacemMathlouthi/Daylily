const IMAGE = /!\[[^\]]*\]\([^)]*\)/g;
const LINK = /\[([^\]]*)\]\([^)]*\)/g;
const BLOCK_MARKS =
  /^(?:\s*(?:#{1,6}\s|>\s?|[-*+]\s(?:\[[ xX]\]\s)?|\d+[.)]\s))+/gm;
// Only marks that wrap words: a lone ~ or * and snake_case are the writing itself
const CODE = /`+([^`]+?)`+/g;
const STRONG_OR_EMPHASIS = /(\*\*|\*)(?=\S)(.*?\S)\1/g;
const UNDERSCORES =
  /(?<![\p{L}\p{N}_])(__|_)(?=\S)(.*?\S)\1(?![\p{L}\p{N}_])/gu;
const STRIKETHROUGH = /~~(?=\S)(.*?\S)~~/g;
// A heading underlined on the next line, with = or -
const SETEXT_HEADING = /^(?:[^\n]+\n)+[ \t]*(?:=+|-+)[ \t]*(?:\n|$)/;
const RULE = /^\s*(?:[-*_]\s*){3,}$/;
// Headings name a part of the page; the excerpt is its words
const HEADINGS_ONLY = /^(?:\s*#{1,6}\s[^\n]*(?:\n|$))+$/;
const LINE_ENDINGS = /\r\n?/g;
const SPACES = /\s+/g;
const PARAGRAPH_BREAK = /\n\s*\n/;
const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });

function plainText(paragraph: string) {
  return paragraph
    .replace(BLOCK_MARKS, "")
    .replace(CODE, "$1")
    .replace(STRONG_OR_EMPHASIS, "$2")
    .replace(UNDERSCORES, "$2")
    .replace(STRIKETHROUGH, "$1")
    .replace(SPACES, " ")
    .trim();
}

/** As much of `text` as fits in `max`, never splitting a character such as an emoji. */
function fitting(text: string, max: number) {
  let kept = "";
  for (const { segment } of graphemes.segment(text)) {
    if (kept.length + segment.length > max) {
      break;
    }
    kept += segment;
  }
  return kept;
}

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
    const body = paragraph.replace(SETEXT_HEADING, "");
    if (RULE.test(body) || HEADINGS_ONLY.test(body)) {
      continue;
    }
    const text = plainText(body);
    if (text === "") {
      continue;
    }
    if (text.length <= max) {
      return text;
    }
    const cut = fitting(text, max);
    const lastSpace = cut.lastIndexOf(" ");
    return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
  }
  return "";
}
