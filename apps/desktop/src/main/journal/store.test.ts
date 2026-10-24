import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Clock } from "@daylily/core/clock";
import { type DayKey, parseDayKey } from "@daylily/core/day";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createJournal, type Journal } from "./store";

const ZONE = "Africa/Tunis";
/** The morning after the 21st, once it has ended. */
const NEXT_MORNING = new Date("2026-10-22T05:00:00+01:00");

const key = (text: string): DayKey => {
  const day = parseDayKey(text);
  if (!day) {
    throw new Error(`Not a day: ${text}`);
  }
  return day;
};

const page = (body: string, title = "") => ({ body, cover: null, title });

let root: string;
let now: Date;
let zone: string;
let journal: Journal;

const clock: Clock = { now: () => now, timeZone: () => zone };
const file = (day: string) => {
  const [year = "", month = "", date = ""] = day.split("-");
  return join(root, year, month, date, `${day}.md`);
};

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "daylily-journal-"));
  now = new Date("2026-10-21T20:00:00+01:00");
  zone = ZONE;
  journal = createJournal({ app: "daylily/0.1.0", clock, root });
});

afterEach(async () => {
  // Colours are written a moment later; write them before the folder goes
  await journal.flushCache();
  await rm(root, { force: true, recursive: true });
});

describe("writeDay", () => {
  it("starts today's folder and file on the first save", async () => {
    const saved = await journal.writeDay(
      key("2026-10-21"),
      page("We took the river path.", "The long way home")
    );
    expect(saved).toMatchObject({
      ok: true,
      value: { state: "open", title: "The long way home", words: 5 },
    });
    expect(await readFile(file("2026-10-21"), "utf8")).toContain(
      "title: The long way home\n"
    );
  });

  it("leaves no trace for an empty page on a day never written", async () => {
    expect(await journal.writeDay(key("2026-10-21"), page("  "))).toEqual({
      ok: true,
      value: null,
    });
    expect(await readdir(root)).toEqual([]);
  });

  it("refuses days ahead of today", async () => {
    const saved = await journal.writeDay(key("2026-10-22"), page("Too soon"));
    expect(saved).toEqual({
      error: { day: "2026-10-22", kind: "not-writable" },
      ok: false,
    });
  });

  it("never starts a day that has already ended", async () => {
    const saved = await journal.writeDay(key("2026-10-20"), page("Too late"));
    expect(saved.ok).toBe(false);
    expect(await readdir(root)).toEqual([]);
  });

  it("takes a save still on its way after 4am, until the day seals", async () => {
    const day = key("2026-10-21");
    await journal.writeDay(day, page("Before four."));
    now = new Date("2026-10-22T04:00:01+01:00");
    expect((await journal.writeDay(day, page("Just after four."))).ok).toBe(
      true
    );
    await journal.sealDay(day, null);
    expect(await journal.writeDay(day, page("Too late now."))).toEqual({
      error: { kind: "sealed" },
      ok: false,
    });
  });

  it("keeps the last of many quick saves", async () => {
    const day = key("2026-10-21");
    await Promise.all(
      Array.from({ length: 10 }, (_, index) =>
        journal.writeDay(day, page(`Draft ${index}`))
      )
    );
    const read = await journal.readDay(day);
    expect(read.ok && read.value?.body).toBe("Draft 9\n");
  });
});

describe("readDay", () => {
  it("is null for a day with nothing written", async () => {
    expect(await journal.readDay(key("2026-10-01"))).toEqual({
      ok: true,
      value: null,
    });
  });

  it("reads a day with its page", async () => {
    const day = key("2026-10-21");
    await journal.writeDay(day, page("Rain all morning.", "Rain"));
    expect(await journal.readDay(day)).toEqual({
      ok: true,
      value: {
        body: "Rain all morning.\n",
        color: null,
        cover: null,
        coverStamp: null,
        day,
        excerpt: "Rain all morning.",
        // Written at 20:00 in Tunis
        hour: 20,
        state: "open",
        title: "Rain",
        words: 3,
      },
    });
  });
});

describe("sealDay", () => {
  const jpeg = new Uint8Array([0xff, 0xd8, 0xff]);
  const gallery = { bytes: jpeg, color: "petal", extension: "jpg" } as const;

  it("seals after any save still on its way", async () => {
    const day = key("2026-10-21");
    await journal.writeDay(day, page("Before four."));
    now = NEXT_MORNING;
    const saving = journal.writeDay(day, page("The last words."));
    const sealing = journal.sealDay(day, null);
    await Promise.all([saving, sealing]);
    const read = await journal.readDay(day);
    expect(read.ok && read.value).toMatchObject({
      body: "The last words.\n",
      state: "sealed",
    });
  });

  it("stamps the seal with the day's end where it was written", async () => {
    const day = key("2026-10-21");
    await journal.writeDay(day, page("Packed for the trip."));
    // Sealed days later, on the next launch, in another zone
    zone = "America/New_York";
    now = new Date("2026-10-25T12:00:00-04:00");
    expect(await journal.sealDay(day, null)).toEqual({
      ok: true,
      value: "sealed",
    });
    expect(await readFile(file("2026-10-21"), "utf8")).toContain(
      "sealed: 2026-10-22T04:00:00+01:00"
    );
  });

  it("leaves a day that hasn't ended open", async () => {
    const day = key("2026-10-21");
    await journal.writeDay(day, page("Still writing."));
    now = new Date("2026-10-22T03:59:00+01:00");
    expect(await journal.sealDay(day, null)).toEqual({
      ok: true,
      value: "nothing",
    });
    const read = await journal.readDay(day);
    expect(read.ok && read.value?.state).toBe("open");
  });

  it("has nothing to seal on a day never written", async () => {
    expect(await journal.sealDay(key("2026-10-20"), null)).toEqual({
      ok: true,
      value: "nothing",
    });
    expect(await readdir(root)).toEqual([]);
  });

  it("seals a day once", async () => {
    const day = key("2026-10-21");
    await journal.writeDay(day, page("Words."));
    now = NEXT_MORNING;
    await journal.sealDay(day, null);
    expect(await journal.sealDay(day, null)).toEqual({
      error: { kind: "sealed" },
      ok: false,
    });
  });

  it("gives a day written without a cover the gallery's picture and its flower", async () => {
    const day = key("2026-10-21");
    await journal.writeDay(day, page("No picture today."));
    now = NEXT_MORNING;
    await journal.sealDay(day, gallery);
    const read = await journal.readDay(day);
    expect(read.ok && read.value).toMatchObject({
      color: "petal",
      cover: "cover.jpg",
      state: "sealed",
    });
    expect(
      new Uint8Array(await readFile(journal.dayAsset(day, "cover.jpg")))
    ).toEqual(jpeg);
  });

  it("keeps the cover a day was given", async () => {
    const day = key("2026-10-21");
    const own = new Uint8Array([1, 2, 3]);
    await journal.saveCover(day, own, "png");
    await journal.writeDay(day, { ...page("Mine."), cover: "cover.png" });
    now = NEXT_MORNING;
    await journal.sealDay(day, gallery);
    const read = await journal.readDay(day);
    expect(read.ok && read.value?.cover).toBe("cover.png");
    expect(await readdir(join(root, "2026", "10", "21"))).toEqual([
      "2026-10-21.md",
      "cover.png",
    ]);
  });

  it("never writes over a file that happens to have the cover's name", async () => {
    const day = key("2026-10-21");
    await journal.writeDay(day, page("Words."));
    const theirs = new Uint8Array([9, 9, 9]);
    await writeFile(journal.dayAsset(day, "cover.jpg"), theirs);
    now = NEXT_MORNING;
    await journal.sealDay(day, gallery);
    const read = await journal.readDay(day);
    expect(read.ok && read.value).toMatchObject({
      cover: null,
      state: "sealed",
    });
    expect(
      new Uint8Array(await readFile(journal.dayAsset(day, "cover.jpg")))
    ).toEqual(theirs);
  });
});

describe("saveCover", () => {
  const jpeg = new Uint8Array([0xff, 0xd8, 0xff]);

  it("copies the cover into the day's folder", async () => {
    const day = key("2026-10-21");
    expect(await journal.saveCover(day, jpeg, "jpg")).toEqual({
      ok: true,
      value: "cover.jpg",
    });
    expect(
      new Uint8Array(await readFile(journal.dayAsset(day, "cover.jpg")))
    ).toEqual(jpeg);
  });

  it("never changes a sealed day's cover", async () => {
    const day = key("2026-10-21");
    await journal.writeDay(day, page("Words."));
    now = NEXT_MORNING;
    await journal.sealDay(day, null);
    // Back to when it was still the 21st, as after flying west
    now = new Date("2026-10-21T20:00:00+01:00");
    expect(await journal.saveCover(day, jpeg, "jpg")).toEqual({
      error: { kind: "sealed" },
      ok: false,
    });
  });
});

describe("flower colours", () => {
  it("keeps a colour sampled from the cover until the cover changes", async () => {
    const day = key("2026-10-21");
    await journal.saveCover(day, new Uint8Array([1, 2, 3]), "jpg");
    await journal.writeDay(day, { ...page("Words."), cover: "cover.jpg" });
    const first = await journal.readDay(day);
    const stamp = first.ok ? first.value?.coverStamp : null;
    expect(stamp).toBeTruthy();
    await journal.setFlowerColor(day, stamp ?? "", "petal");
    const coloured = await journal.readDay(day);
    expect(coloured.ok && coloured.value?.color).toBe("petal");

    await journal.saveCover(day, new Uint8Array([4, 5, 6, 7]), "jpg");
    const changed = await journal.readDay(day);
    expect(changed.ok && changed.value?.color).toBeNull();
  });
});

describe("gallery colours", () => {
  it("keeps the colour a gallery cover brings, without sampling", async () => {
    const day = key("2026-10-21");
    await journal.saveCover(
      day,
      new Uint8Array([1, 2, 3]),
      "jpg",
      "cornflower"
    );
    await journal.writeDay(day, { ...page("Words."), cover: "cover.jpg" });
    const read = await journal.readDay(day);
    expect(read.ok && read.value?.color).toBe("cornflower");
  });
});

describe("listDays", () => {
  it("is empty before the journal folder exists", async () => {
    const missing = createJournal({
      app: "daylily/0.1.0",
      clock,
      root: join(root, "not-yet"),
    });
    expect(await missing.listDays()).toEqual([]);
  });

  it("lists written days oldest first, skipping anything else", async () => {
    now = new Date("2026-10-20T12:00:00+01:00");
    await journal.writeDay(key("2026-10-20"), page("One two three."));
    now = new Date("2025-03-02T12:00:00+01:00");
    await journal.writeDay(key("2025-03-02"), page("Earlier."));
    // Things that aren't days: other folders, impossible dates, temp files
    await mkdir(join(root, "notes"), { recursive: true });
    await mkdir(join(root, "2026", "02", "30"), { recursive: true });
    await mkdir(join(root, "2026", "10", "19"), { recursive: true });
    await writeFile(join(root, "2026", "10", "19", "draft.md"), "Not a day");

    const blank = { color: null, cover: null, coverStamp: null, title: "" };
    expect(await journal.listDays()).toEqual([
      {
        ...blank,
        day: "2025-03-02",
        excerpt: "Earlier.",
        hour: 12,
        state: "open",
        words: 1,
      },
      {
        ...blank,
        day: "2026-10-20",
        excerpt: "One two three.",
        hour: 12,
        state: "open",
        words: 3,
      },
    ]);
  });

  it("marks sealed days edited in another app, and unreadable ones", async () => {
    const day = key("2026-10-21");
    await journal.writeDay(day, page("The water was high."));
    now = NEXT_MORNING;
    await journal.sealDay(day, null);
    const text = await readFile(file("2026-10-21"), "utf8");
    await writeFile(file("2026-10-21"), text.replace("high", "low"));
    await mkdir(join(root, "2026", "10", "15"), { recursive: true });
    await writeFile(file("2026-10-15"), "---\ntitle: [broken\n---\nWords\n");

    expect(await journal.listDays()).toEqual([
      { day: "2026-10-15", state: "unreadable" },
      expect.objectContaining({ day: "2026-10-21", state: "edited" }),
    ]);
  });
});

describe("diskUsage", () => {
  it("adds up every file in the journal", async () => {
    expect(await journal.diskUsage()).toBe(0);
    await journal.saveCover(key("2026-10-21"), new Uint8Array(1000), "jpg");
    await writeFile(join(root, "notes.md"), "12345");
    expect(await journal.diskUsage()).toBe(1005);
  });

  it("is nothing before the folder exists", async () => {
    const missing = createJournal({
      app: "daylily/0.1.0",
      clock,
      root: join(root, "not-yet"),
    });
    expect(await missing.diskUsage()).toBe(0);
  });
});

describe("dayAsset", () => {
  it("refuses a name that leads out of the journal", () => {
    const day = key("2026-10-21");
    expect(() => journal.dayAsset(day, "../../../../outside.jpg")).toThrow();
    expect(() => journal.dayAsset(day, "../../../..")).toThrow();
  });
});
