import { describe, expect, it } from "vitest";
import {
  isThoughtTime,
  readThoughtsFile,
  type Thought,
  type ThoughtsStamp,
  thoughtTime,
  writeThoughtsFile,
} from "./thoughts-file";

// A line feed without the carriage return before it
const BARE_LF = /[^\r]\n/;

const stamp = (iso: string, timeZone = "Africa/Tunis"): ThoughtsStamp => ({
  app: "daylily/0.7.0",
  now: new Date(iso),
  timeZone,
});

function read(text: string): Thought[] {
  const thoughts = readThoughtsFile(text);
  if (!thoughts.ok) {
    throw new Error(`Unreadable: ${JSON.stringify(thoughts.error)}`);
  }
  return thoughts.value;
}

function written(...args: Parameters<typeof writeThoughtsFile>) {
  const file = writeThoughtsFile(...args);
  if (!file.ok) {
    throw new Error(`Not written: ${JSON.stringify(file.error)}`);
  }
  return file.value;
}

const DAY = `---
created: 2026-10-26T09:40:00+01:00
updated: 2026-10-26T14:12:00+01:00
tz: Africa/Tunis
app: daylily/0.7.0
---

## 09:40

Walked by the sea before work.

## 14:10

Sam laughed at the umbrella thing.

![](image-02.jpg)
`;

describe("readThoughtsFile", () => {
  it("reads each thought under its time, in the order written", () => {
    expect(read(DAY)).toEqual([
      { body: "Walked by the sea before work.", time: "09:40" },
      {
        body: "Sam laughed at the umbrella thing.\n\n![](image-02.jpg)",
        time: "14:10",
      },
    ]);
  });

  it("keeps a heading written inside a thought as part of it", () => {
    const text = "## 08:00\n\n## The plan\n\nCall Mum.\n";
    expect(read(text)).toEqual([
      { body: "## The plan\n\nCall Mum.", time: "08:00" },
    ]);
  });

  it("never splits at a time inside a code block", () => {
    const text = "## 08:00\n\n```\n## 09:00\n```\n\nafter\n";
    expect(read(text)).toEqual([
      { body: "```\n## 09:00\n```\n\nafter", time: "08:00" },
    ]);
  });

  it("keeps text written before the first time, untimed", () => {
    expect(read("A note at the top.\n\n## 10:05\n\nThen this.\n")).toEqual([
      { body: "A note at the top.", time: null },
      { body: "Then this.", time: "10:05" },
    ]);
  });

  it("reads Windows line endings", () => {
    expect(read("## 07:30\r\n\r\nEarly.\r\n")).toEqual([
      { body: "Early.", time: "07:30" },
    ]);
  });

  it("reads two thoughts begun in the same minute as two", () => {
    expect(read("## 12:00\n\nOne.\n\n## 12:00\n\nTwo.\n")).toHaveLength(2);
  });

  it("reads a file with nothing in it as no thoughts", () => {
    expect(read("")).toEqual([]);
    expect(read("---\ntz: Africa/Tunis\n---\n")).toEqual([]);
  });

  it("treats a time that isn't one as words", () => {
    expect(read("## 25:00\n\nNot a time.\n")).toEqual([
      { body: "## 25:00\n\nNot a time.", time: null },
    ]);
  });

  it("refuses frontmatter it can't read", () => {
    const thoughts = readThoughtsFile("---\n: : :\n---\n\n## 09:00\n\nHi\n");
    expect(thoughts.ok).toBe(false);
  });
});

describe("writeThoughtsFile", () => {
  it("starts a day's file with where and when it was written", () => {
    const text = written(
      null,
      [{ body: "First.", time: "09:01" }],
      stamp("2026-10-26T08:01:00Z")
    );
    expect(text).toBe(`---
created: 2026-10-26T09:01:00+01:00
updated: 2026-10-26T09:01:00+01:00
tz: Africa/Tunis
app: daylily/0.7.0
---

## 09:01

First.
`);
  });

  it("reads back exactly what it wrote", () => {
    const thoughts: Thought[] = [
      { body: "Walked by the sea before work.", time: "09:40" },
      { body: "Bring:\n\n- the cake\n- the photos", time: "11:47" },
    ];
    const text = written(null, thoughts, stamp("2026-10-26T13:00:00Z"));
    expect(read(text)).toEqual(thoughts);
  });

  it("keeps its first time and zone, and fields other tools added", () => {
    const existing = `---
created: 2026-10-26T09:40:00+01:00
tz: Africa/Tunis
mood: calm
---

## 09:40

Old.
`;
    const text = written(
      existing,
      [{ body: "Changed.", time: "09:40" }],
      stamp("2026-10-27T10:00:00Z", "Europe/Paris")
    );
    expect(text).toContain("created: 2026-10-26T09:40:00+01:00");
    expect(text).toContain("tz: Africa/Tunis");
    expect(text).toContain("mood: calm");
    expect(text).toContain("updated: 2026-10-27T11:00:00+01:00");
  });

  it("leaves out thoughts with nothing written", () => {
    const text = written(
      null,
      [
        { body: "  ", time: "09:00" },
        { body: "Kept.", time: "09:05" },
      ],
      stamp("2026-10-26T09:00:00Z")
    );
    expect(read(text)).toEqual([{ body: "Kept.", time: "09:05" }]);
  });

  it("keeps untimed text at the top", () => {
    const thoughts: Thought[] = [
      { body: "Written elsewhere.", time: null },
      { body: "Then here.", time: "10:00" },
    ];
    const text = written(null, thoughts, stamp("2026-10-26T09:00:00Z"));
    expect(read(text)).toEqual(thoughts);
  });

  it("keeps a file's Windows line endings", () => {
    const existing =
      "---\r\ntz: Africa/Tunis\r\n---\r\n\r\n## 09:00\r\n\r\nA\r\n";
    const text = written(
      existing,
      [{ body: "A\n\nB", time: "09:00" }],
      stamp("2026-10-26T09:00:00Z")
    );
    expect(text).not.toMatch(BARE_LF);
    expect(read(text)).toEqual([{ body: "A\n\nB", time: "09:00" }]);
  });

  it("never writes over a file it can't read", () => {
    const file = writeThoughtsFile(
      "---\n: : :\n---\n",
      [],
      stamp("2026-10-26T09:00:00Z")
    );
    expect(file.ok).toBe(false);
  });
});

describe("thoughtTime", () => {
  it("is the time on the clock where it's written", () => {
    expect(thoughtTime(new Date("2026-10-26T13:10:00Z"), "Africa/Tunis")).toBe(
      "14:10"
    );
    expect(thoughtTime(new Date("2026-10-26T00:05:00Z"), "Asia/Tokyo")).toBe(
      "09:05"
    );
  });

  it("is a time a thought can begin at", () => {
    expect(isThoughtTime("09:05")).toBe(true);
    expect(isThoughtTime("9:05")).toBe(false);
    expect(isThoughtTime("24:00")).toBe(false);
  });
});
