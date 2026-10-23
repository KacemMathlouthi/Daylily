const WORD = /\p{L}|\p{N}/u;
const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });
// The address in a link or image is markup, not words the person wrote
const LINK_TARGET = /\]\([^)]*\)/g;

/** Words as a reader would count them, in any script (Japanese has no spaces). */
export function countWords(text: string) {
  let words = 0;
  for (const segment of segmenter.segment(text)) {
    if (segment.isWordLike && WORD.test(segment.segment)) {
      words += 1;
    }
  }
  return words;
}

/** The words a page of markdown reads as, leaving out link and image addresses. */
export function countMarkdownWords(markdown: string) {
  return countWords(markdown.replace(LINK_TARGET, "]"));
}
