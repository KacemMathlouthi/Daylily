import { describe, expect, it } from "vitest";
import { parseDayKey } from "./day";
import { type DayFile, readDayFile } from "./day-file";
import { hasEnded, sealDayFile, sealHash, sealState, sealTime } from "./seal";

const key = (text: string) => {
  const day = parseDayKey(text);
  if (!day) {
    throw new Error(`Not a day: ${text}`);
  }
  return day;
};

function read(text: string): DayFile {
  const day = readDayFile(text);
  if (!day.ok) {
    throw new Error("Unreadable day");
  }
  return day.value;
}

async function sealed(text: string, cover: string | null = null) {
  const file = await sealDayFile(text, {
    cover,
    sealed: "2026-10-22T04:00:00+01:00",
  });
  if (!file.ok) {
    throw new Error(`Not sealed: ${JSON.stringify(file.error)}`);
  }
  return file.value;
}

const HASH_LINE = /hash: .*\n/;

const CONTENT = {
  body: "We took the river path.\n\nThe water was high.",
  cover: "cover.jpg",
  title: "The long way home",
};

const OPEN_DAY = `---
title: The long way home
created: 2026-10-21T19:02:11+01:00
updated: 2026-10-21T23:40:05+01:00
tz: Africa/Tunis
words: 9
app: daylily/0.1.0
---

We took the river path.

The water was high.
`;

describe("hasEnded", () => {
  const day = key("2026-10-21");
  const tunis = "Africa/Tunis";

  it("is open until 4am the next morning", () => {
    expect(hasEnded(day, new Date("2026-10-22T03:59:59+01:00"), tunis)).toBe(
      false
    );
    expect(hasEnded(day, new Date("2026-10-22T04:00:00+01:00"), tunis)).toBe(
      true
    );
  });

  it("has ended for any day before today, however long the app was closed", () => {
    expect(hasEnded(day, new Date("2027-03-01T12:00:00Z"), tunis)).toBe(true);
  });

  it("follows the zone the device is in now", () => {
    // 04:30 in Tunis is still 23:30 the night before in New York
    const now = new Date("2026-10-22T04:30:00+01:00");
    expect(hasEnded(day, now, tunis)).toBe(true);
    expect(hasEnded(day, now, "America/New_York")).toBe(false);
  });
});

describe("sealTime", () => {
  it("is the day's 4am boundary with the offset where it was written", () => {
    expect(sealTime(key("2026-10-21"), "Africa/Tunis")).toBe(
      "2026-10-22T04:00:00+01:00"
    );
  });

  it("takes the new offset when clocks change that night", () => {
    expect(sealTime(key("2026-03-28"), "Europe/Paris")).toBe(
      "2026-03-29T04:00:00+02:00"
    );
    expect(sealTime(key("2026-10-24"), "Europe/Paris")).toBe(
      "2026-10-25T04:00:00+01:00"
    );
  });
});

describe("sealHash", () => {
  it("never changes for the same content", async () => {
    // Sealed files on disk depend on this exact value
    expect(await sealHash(CONTENT)).toBe(
      "sha256:294227a7f3d8304adbbdbaa3099055cc112926be9fb5eb134f4add28b40230b4"
    );
  });

  it("ignores line endings and trailing whitespace", async () => {
    const hash = await sealHash(CONTENT);
    expect(
      await sealHash({
        ...CONTENT,
        body: "\r\nWe took the river path.   \r\n\r\nThe water was high.\t\r\n\r\n",
      })
    ).toBe(hash);
  });

  it("changes when a word, the title or the cover changes", async () => {
    const hash = await sealHash(CONTENT);
    const changed = [
      { ...CONTENT, body: "We took the river path.\n\nThe water was low." },
      { ...CONTENT, title: "The short way home" },
      { ...CONTENT, cover: "cover.png" },
      { ...CONTENT, cover: null },
    ];
    const hashes = await Promise.all(changed.map(sealHash));
    expect(hashes).not.toContain(hash);
    expect(new Set(hashes).size).toBe(changed.length);
  });

  it("tells the title from the page", async () => {
    expect(await sealHash({ body: "b", cover: null, title: "a" })).not.toBe(
      await sealHash({ body: "", cover: null, title: "a b" })
    );
  });

  it("keeps spacing inside a line", async () => {
    expect(await sealHash({ ...CONTENT, body: "a  b" })).not.toBe(
      await sealHash({ ...CONTENT, body: "a b" })
    );
  });
});

describe("sealDayFile", () => {
  it("records the time and hash, and keeps the page as written", async () => {
    const file = await sealed(OPEN_DAY, "cover.jpg");
    // In the spec's order: the cover after the title, the seal before the app
    expect(file).toContain("title: The long way home\ncover: cover.jpg\n");
    expect(file).toContain(
      "words: 9\nsealed: 2026-10-22T04:00:00+01:00\nhash: sha256:"
    );
    expect(
      file.endsWith("\n---\n\nWe took the river path.\n\nThe water was high.\n")
    ).toBe(true);
    expect(read(file).meta).toMatchObject({
      cover: "cover.jpg",
      hash: await sealHash(CONTENT),
      sealed: "2026-10-22T04:00:00+01:00",
    });
  });

  it("keeps the cover that was chosen", async () => {
    const chosen = OPEN_DAY.replace("tz:", "cover: cover.png\ntz:");
    expect(read(await sealed(chosen, "cover.jpg")).meta.cover).toBe(
      "cover.png"
    );
  });

  it("seals without a cover when there is none to give", async () => {
    const file = await sealed(OPEN_DAY);
    expect(file).not.toContain("cover:");
    expect(await sealState(read(file))).toBe("sealed");
  });

  it("refuses a day that is already sealed", async () => {
    const file = await sealed(OPEN_DAY);
    expect(
      await sealDayFile(file, {
        cover: null,
        sealed: "2026-10-23T04:00:00+01:00",
      })
    ).toEqual({ error: { kind: "sealed" }, ok: false });
  });
});

describe("sealState", () => {
  it("is open until sealed", async () => {
    expect(await sealState(read(OPEN_DAY))).toBe("open");
  });

  it("is sealed when the content matches its hash", async () => {
    expect(await sealState(read(await sealed(OPEN_DAY, "cover.jpg")))).toBe(
      "sealed"
    );
  });

  it("notices words changed in another app", async () => {
    const file = await sealed(OPEN_DAY, "cover.jpg");
    const edited = file.replace("was high", "was low");
    expect(await sealState(read(edited))).toBe("edited");
  });

  it("notices a removed hash", async () => {
    const file = await sealed(OPEN_DAY, "cover.jpg");
    const edited = file.replace(HASH_LINE, "");
    expect(await sealState(read(edited))).toBe("edited");
  });

  it("stays sealed through harmless changes", async () => {
    const file = await sealed(OPEN_DAY, "cover.jpg");
    const harmless = file
      .replace("words: 9", "words: 10\nmood: calm")
      .replace(
        "updated: 2026-10-21T23:40:05+01:00",
        "updated: 2026-11-02T10:00:00Z"
      )
      .replaceAll("\n", "\r\n")
      .concat("\r\n\r\n");
    expect(await sealState(read(harmless))).toBe("sealed");
  });
});
