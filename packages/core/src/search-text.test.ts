import { describe, expect, it } from "vitest";
import { pageText } from "./excerpt";
import { matchRanges, queryWords, searchSnippet } from "./search-text";

const marked = (text: string, query: string) =>
  matchRanges(text, query).map(([start, end]) => text.slice(start, end));

describe("queryWords", () => {
  it("folds case and accents and drops punctuation around words", () => {
    expect(queryWords("  Café, “Sea”!  ")).toEqual(["cafe", "sea"]);
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
    expect(marked("Overseas, the seaside", "sea")).toEqual(["seaside"]);
  });

  it("ignores case and accents in either direction", () => {
    expect(marked("Un café à Tunis", "CAFE a")).toEqual(["café", "à"]);
    expect(marked("a cafe in town", "café")).toEqual(["cafe"]);
  });

  it("keeps ranges on the original text when folding changes lengths", () => {
    const text = "İstanbul in the rain";
    expect(marked(text, "rain")).toEqual(["rain"]);
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
      "…took forever. We walked down to the sea before breakfast and…"
    );
    expect(
      snippet.marks.map(([start, end]) => snippet.text.slice(start, end))
    ).toEqual(["sea"]);
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

  it("is the start of the page when nothing matches literally", () => {
    const snippet = searchSnippet(page, "brekfast", 30);
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
