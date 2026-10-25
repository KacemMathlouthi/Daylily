import { describe, expect, it } from "vitest";
import { pageText } from "./excerpt";
import { matchRanges, queryWords, searchSnippet } from "./search-text";

const marked = (text: string, query: string) =>
  matchRanges(text, query).map(([start, end]) => text.slice(start, end));

describe("queryWords", () => {
  it("folds case and accents and drops punctuation around words", () => {
    expect(queryWords("  Café, “Sea”!  ")).toEqual(["cafe", "sea"]);
  });

  it("leaves out common words when there's something else to look for", () => {
    expect(queryWords("the sea")).toEqual(["sea"]);
    expect(queryWords("the")).toEqual(["the"]);
  });

  it("splits on punctuation inside a search, like the page does", () => {
    expect(queryWords("well-known")).toEqual(["well", "known"]);
  });

  it("is empty for a query of spaces and marks", () => {
    expect(queryWords(" … ?! ")).toEqual([]);
  });
});

describe("matchRanges", () => {
  it("marks whole words that start with a query word", () => {
    expect(marked("We walked to the sea, then walking back", "walk")).toEqual([
      "walked",
      "walking",
    ]);
  });

  it("never matches inside a word", () => {
    expect(marked("Overseas, the seaside", "seas")).toEqual(["seaside"]);
  });

  it("matches a short word only whole, or with a plural s", () => {
    expect(marked("A seat by the sea, two seas, a season", "sea")).toEqual([
      "sea",
      "seas",
    ]);
  });

  it("ignores case and accents in either direction", () => {
    expect(marked("Un café à Tunis", "CAFE TÚNIS")).toEqual(["café", "Tunis"]);
    expect(marked("a cafe in town", "café")).toEqual(["cafe"]);
  });

  it("keeps ranges on the original text when folding changes lengths", () => {
    // A decomposed accent folds away, so everything after it shifts by one
    const text = "cafe\u0301 au lait";
    expect(matchRanges(text, "lait")).toEqual([[9, 13]]);
    expect(marked(text, "cafe")).toEqual(["cafe\u0301"]);
  });

  it("matches words beyond the basic plane, and a final sigma either way", () => {
    expect(marked("one 𝐰𝐨𝐫𝐝 here", "here")).toEqual(["here"]);
    expect(marked("ΟΔΟΣ", "οδος")).toEqual(["ΟΔΟΣ"]);
    expect(marked("οδός", "ΟΔΟΣ")).toEqual(["οδός"]);
  });

  it("forgives one typo in a longer word, as the index does", () => {
    expect(marked("before breakfast, after breakfasts", "brekfast")).toEqual([
      "breakfast",
      "breakfasts",
    ]);
    expect(marked("a cat and a car", "cast")).toEqual([]);
  });

  it("splits a search where the page would, so a word with an apostrophe matches", () => {
    expect(marked("I didn’t mind", "didn't")).toEqual(["didn", "t"]);
  });

  it("finds nothing for an empty query", () => {
    expect(matchRanges("anything", "  ")).toEqual([]);
  });
});

describe("searchSnippet", () => {
  const page =
    "Up before everyone. The house was still cold and the kettle took forever. We walked down to the sea before breakfast and the tide was all the way out.";

  it("quotes the words around the first match, cut at words", () => {
    const snippet = searchSnippet(page, "sea", 60);
    expect(snippet.text).toBe(
      "…We walked down to the sea before breakfast and the tide was…"
    );
    expect(
      snippet.marks.map(([start, end]) => snippet.text.slice(start, end))
    ).toEqual(["sea"]);
  });

  it("quotes a short page whole, wherever the match is", () => {
    expect(
      searchSnippet("We walked down to the sea at last.", "last").text
    ).toBe("We walked down to the sea at last.");
  });

  it("keeps the match near the start of the quote, even near the end of a long page", () => {
    const long = `${"Nothing to see here at all. ".repeat(8)}Breakfast, work, a walk.`;
    const snippet = searchSnippet(long, "breakfast");
    expect(snippet.marks[0]?.[0]).toBeLessThan(30);
  });

  it("marks every match inside the quote", () => {
    const snippet = searchSnippet("the sea, the sea, the sea", "sea");
    expect(snippet.marks).toHaveLength(3);
  });

  it("starts at the beginning when the match is near it", () => {
    expect(searchSnippet(page, "house", 40).text).toBe(
      "Up before everyone. The house was still…"
    );
  });

  it("is the start of the page when the words were only in the title", () => {
    const snippet = searchSnippet(page, "mornings", 30);
    expect(snippet.text).toBe("Up before everyone. The house…");
    expect(snippet.marks).toEqual([]);
  });

  it("reads lines as one, so a quote never breaks across them", () => {
    expect(searchSnippet("First line\nsecond line", "second").text).toBe(
      "First line second line"
    );
  });
});

describe("pageText", () => {
  it("keeps every paragraph's words, headings included, without markup", () => {
    expect(
      pageText(
        "## Morning\n\nWe **walked** to [the sea](https://x.y).\n\n![](image-01.jpg)\n\n---\n\n- bread\n- tea"
      )
    ).toBe("Morning\nWe walked to the sea.\nbread tea");
  });

  it("keeps a heading underlined with = or -", () => {
    expect(pageText("Morning\n=======\n\nRain.")).toBe("Morning\nRain.");
  });
});
