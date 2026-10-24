import { describe, expect, it } from "vitest";
import { pageExcerpt } from "./excerpt";

describe("pageExcerpt", () => {
  it("is the page's first paragraph as plain text", () => {
    expect(
      pageExcerpt(
        "He skipped a **stone** _eleven_ times.\n\nThen we went home."
      )
    ).toBe("He skipped a stone eleven times.");
  });

  it("keeps a link's words and leaves out images", () => {
    expect(
      pageExcerpt(
        "![the river](image-01.jpg)\n\nRead [the essay](https://x.y) twice."
      )
    ).toBe("Read the essay twice.");
  });

  it("starts after headings, quotes and list marks", () => {
    expect(pageExcerpt("## Morning\n\n> - Rain all `day`")).toBe(
      "Rain all day"
    );
  });

  it("joins a paragraph's lines", () => {
    expect(pageExcerpt("First line\nsecond line")).toBe(
      "First line second line"
    );
  });

  it("shortens a long paragraph at a word, with an ellipsis", () => {
    const long = "word ".repeat(80).trim();
    const excerpt = pageExcerpt(long, 40);
    expect(excerpt.length).toBeLessThanOrEqual(41);
    expect(excerpt.endsWith("word…")).toBe(true);
  });

  it("is empty for a page with no words", () => {
    expect(pageExcerpt("")).toBe("");
    expect(pageExcerpt("![](image-01.jpg)\n\n---")).toBe("");
  });
});
