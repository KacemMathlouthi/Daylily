import { describe, expect, it } from "vitest";
import {
  type DayFile,
  readDayFile,
  updateFrontmatter,
  type WriteStamp,
  writeDayFile,
} from "./day-file";

// A line feed without the carriage return before it
const BARE_LF = /[^\r]\n/;
const HASH = `sha256:${"9f2c".repeat(16)}`;

const SEALED = `---
title: The long way home
cover: cover.jpg
created: 2026-10-21T19:02:11+01:00
updated: 2026-10-21T23:40:05+01:00
tz: Africa/Tunis
words: 612
sealed: 2026-10-22T04:00:00+01:00
hash: ${HASH}
app: daylily/0.1.0
---

We took the river path.
`;

const stamp = (iso: string, timeZone = "Africa/Tunis"): WriteStamp => ({
  app: "daylily/0.1.0",
  now: new Date(iso),
  timeZone,
});

function read(text: string): DayFile {
  const day = readDayFile(text);
  if (!day.ok) {
    throw new Error(`Unreadable: ${JSON.stringify(day.error)}`);
  }
  return day.value;
}

function written(...args: Parameters<typeof writeDayFile>) {
  const file = writeDayFile(...args);
  if (!file.ok) {
    throw new Error(`Not written: ${JSON.stringify(file.error)}`);
  }
  return file.value;
}

const EMPTY_META = {
  cover: null,
  created: null,
  hash: null,
  sealed: null,
  title: "",
  tz: null,
  updated: null,
  words: null,
};

describe("readDayFile", () => {
  it("reads every field and the page", () => {
    expect(read(SEALED)).toEqual({
      body: "We took the river path.\n",
      meta: {
        cover: "cover.jpg",
        created: "2026-10-21T19:02:11+01:00",
        hash: HASH,
        sealed: "2026-10-22T04:00:00+01:00",
        title: "The long way home",
        tz: "Africa/Tunis",
        updated: "2026-10-21T23:40:05+01:00",
        words: 612,
      },
    });
  });

  it("reads a plain markdown file as a page with no fields", () => {
    expect(read("Just some words.\n")).toEqual({
      body: "Just some words.\n",
      meta: EMPTY_META,
    });
  });

  it("reads a rule on the first line as part of the page", () => {
    expect(read("---\nAfter a line.\n").body).toBe("---\nAfter a line.\n");
  });

  it("reads empty frontmatter as no fields", () => {
    expect(read("---\n---\nHello\n")).toEqual({
      body: "Hello\n",
      meta: EMPTY_META,
    });
  });

  it("reads files saved on Windows, with a byte order mark", () => {
    const day = read("﻿---\r\ntitle: Rain\r\n...\r\n\r\nWet.\r\n");
    expect(day.meta.title).toBe("Rain");
    expect(day.body).toBe("Wet.\r\n");
  });

  it("reads a title YAML takes for a number as text", () => {
    expect(read("---\ntitle: 1984\n---\n").meta.title).toBe("1984");
  });

  it("reads fields it can't use as empty, without failing", () => {
    const day = read(`---
title: [a, list]
cover: ../../secret.jpg
created: yesterday
tz: Mars/Olympus_Mons
words: -3
hash: md5:abc
---
Still here.
`);
    expect(day).toEqual({ body: "Still here.\n", meta: EMPTY_META });
  });

  it("refuses frontmatter that isn't readable YAML", () => {
    const day = readDayFile("---\ntitle: [unclosed\n---\nWords\n");
    expect(day.ok).toBe(false);
    expect(!day.ok && day.error.kind).toBe("malformed");
  });

  it("refuses frontmatter that isn't a set of fields", () => {
    expect(readDayFile("---\n- one\n- two\n---\n").ok).toBe(false);
  });
});

describe("writeDayFile", () => {
  const page = {
    body: "We took the river path.",
    cover: null,
    title: "The long way home",
  };

  it("starts a day's file with its fields in order", () => {
    expect(written(null, page, stamp("2026-10-21T18:02:11Z"))).toBe(`---
title: The long way home
created: 2026-10-21T19:02:11+01:00
updated: 2026-10-21T19:02:11+01:00
tz: Africa/Tunis
words: 5
app: daylily/0.1.0
---

We took the river path.
`);
  });

  it("keeps when and where the day was started", () => {
    const first = written(null, page, stamp("2026-10-21T18:02:11Z"));
    const later = written(
      first,
      { ...page, body: "We took the river path home." },
      stamp("2026-10-21T21:40:05Z", "Europe/Paris")
    );
    expect(read(later).meta).toMatchObject({
      created: "2026-10-21T19:02:11+01:00",
      tz: "Africa/Tunis",
      updated: "2026-10-21T23:40:05+02:00",
      words: 6,
    });
  });

  it("keeps fields, comments and order that other tools added", () => {
    const existing = `---
# written on the train
mood: calm
title: Old title
tags: [rain, river]
---

Old words.
`;
    const file = written(existing, page, stamp("2026-10-21T18:02:11Z"));
    expect(file).toContain("# written on the train\nmood: calm\n");
    expect(file).toContain("title: The long way home\ntags: [ rain, river ]\n");
    expect(file).toContain("\nWe took the river path.\n");
    expect(file).not.toContain("Old words.");
  });

  it("puts a title and cover added later in their place, not at the end", () => {
    const first = written(
      null,
      { ...page, title: "" },
      stamp("2026-10-21T18:02:11Z")
    );
    const later = written(
      `${first.replace("---\n", "---\nmood: calm\n")}`,
      { ...page, cover: "cover.jpg" },
      stamp("2026-10-21T18:05:00Z")
    );
    expect(
      later.startsWith(
        "---\nmood: calm\ntitle: The long way home\ncover: cover.jpg\ncreated: "
      )
    ).toBe(true);
  });

  it("removes the title and cover when they're cleared", () => {
    const withBoth = written(
      null,
      { ...page, cover: "cover.jpg" },
      stamp("2026-10-21T18:02:11Z")
    );
    expect(read(withBoth).meta.cover).toBe("cover.jpg");
    const cleared = written(
      withBoth,
      { ...page, cover: null, title: "  " },
      stamp("2026-10-21T18:05:00Z")
    );
    expect(cleared).not.toContain("title:");
    expect(cleared).not.toContain("cover:");
  });

  it("writes titles YAML would misread so they read back the same", () => {
    for (const title of [
      "1984",
      "yes",
      "#hashtag",
      "Rain: then sun",
      "'quoted'",
    ]) {
      const file = written(
        null,
        { ...page, title },
        stamp("2026-10-21T18:00:00Z")
      );
      expect(read(file).meta.title).toBe(title);
    }
  });

  it("writes a long title on one line", () => {
    const title = "A very long title ".repeat(12).trim();
    const file = written(
      null,
      { ...page, title },
      stamp("2026-10-21T18:00:00Z")
    );
    expect(file).toContain(`title: ${title}\n`);
  });

  it("trims the page and ends the file with a line break", () => {
    const file = written(
      null,
      { ...page, body: "\n\nFirst line.\n\nSecond line.  \n\n" },
      stamp("2026-10-21T18:00:00Z")
    );
    expect(file.endsWith("---\n\nFirst line.\n\nSecond line.\n")).toBe(true);
  });

  it("writes an empty page as fields only", () => {
    const file = written(
      null,
      { ...page, body: "  " },
      stamp("2026-10-21T18:00:00Z")
    );
    expect(file.endsWith("app: daylily/0.1.0\n---\n")).toBe(true);
    expect(read(file).meta.words).toBe(0);
  });

  it("keeps a Windows file's line breaks", () => {
    const existing = "---\r\ntitle: Rain\r\n---\r\n\r\nWet.\r\n";
    const file = written(
      existing,
      { ...page, body: "Wet.\nThen dry." },
      stamp("2026-10-21T18:00:00Z")
    );
    expect(file).not.toMatch(BARE_LF);
    expect(file.endsWith("\r\n\r\nWet.\r\nThen dry.\r\n")).toBe(true);
  });

  it("adds fields above a plain markdown file's words", () => {
    const file = written(
      "Written elsewhere.\n",
      { ...page, body: "Written elsewhere." },
      stamp("2026-10-21T18:00:00Z")
    );
    expect(read(file).body).toBe("Written elsewhere.\n");
    expect(read(file).meta.title).toBe("The long way home");
  });

  it("never rewrites a sealed day", () => {
    expect(writeDayFile(SEALED, page, stamp("2026-10-22T10:00:00Z"))).toEqual({
      error: { kind: "sealed" },
      ok: false,
    });
  });

  it("leaves a file with unreadable frontmatter alone", () => {
    const file = writeDayFile(
      "---\ntitle: [unclosed\n---\nWords\n",
      page,
      stamp("2026-10-21T18:00:00Z")
    );
    expect(file.ok).toBe(false);
  });
});

describe("updateFrontmatter", () => {
  it("changes fields and leaves the page byte for byte", () => {
    const body = "\n  Odd   spacing,\ttabs and trailing spaces   \n\n\n";
    const file = updateFrontmatter(`---\ntitle: Rain\n---\n${body}`, {
      sealed: "2026-10-22T04:00:00+01:00",
    });
    expect(file).toEqual({
      ok: true,
      value: `---\ntitle: Rain\nsealed: 2026-10-22T04:00:00+01:00\n---\n${body}`,
    });
  });

  it("adds frontmatter above a file that has none", () => {
    expect(updateFrontmatter("Words.\n", { title: "Rain" })).toEqual({
      ok: true,
      value: "---\ntitle: Rain\n---\n\nWords.\n",
    });
  });
});
