import { describe, expect, it } from "vitest";
import { countMarkdownWords, countWords } from "./words";

describe("countWords", () => {
  it("counts words, not spaces or punctuation", () => {
    expect(countWords("Rain all morning, then - sun!")).toBe(5);
    expect(countWords("  ")).toBe(0);
    expect(countWords("… 🌼 !!")).toBe(0);
  });

  it("counts numbers and contractions as one word each", () => {
    expect(countWords("I didn't sleep until 2am")).toBe(5);
  });

  it("counts scripts written without spaces", () => {
    expect(countWords("今日は晴れでした")).toBeGreaterThan(1);
  });
});

describe("countMarkdownWords", () => {
  it("skips markup symbols", () => {
    expect(countMarkdownWords("## A walk\n\n- **long** _way_ home")).toBe(5);
  });

  it("counts a link's text but not its address", () => {
    expect(
      countMarkdownWords(
        "Read [the essay](https://example.com/long-read) twice"
      )
    ).toBe(4);
    expect(countMarkdownWords("![the river](image-01.jpg)")).toBe(2);
  });
});
