import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Clock } from "@daylily/core/clock";
import { type DayKey, parseDayKey } from "@daylily/core/day";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { journalSearch } from "./search";
import { createJournal, type Journal } from "./store";

const key = (text: string): DayKey => {
  const day = parseDayKey(text);
  if (!day) {
    throw new Error(`Not a day: ${text}`);
  }
  return day;
};

let root: string;
let now: Date;
let journal: Journal;
const clock: Clock = { now: () => now, timeZone: () => "Africa/Tunis" };

/** Writes a day the way the app does, on the day itself. */
async function write(day: string, body: string, title = "") {
  now = new Date(`${day}T20:00:00+01:00`);
  await journal.writeDay(key(day), { body, cover: null, title });
}

const days = (hits: { day: string }[]) => hits.map((hit) => hit.day);

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "daylily-search-"));
  journal = createJournal({ app: "daylily/0.1.0", clock, root });
  await write(
    "2025-07-12",
    "We walked down to the sea before breakfast.",
    "Mornings"
  );
  await write(
    "2025-12-20",
    "The line runs along the coast for an hour.",
    "By the sea"
  );
  await write("2026-03-03", "Un café à Tunis, then the market.", "Errands");
});

afterEach(async () => {
  await journal.flushCache();
  await rm(root, { force: true, recursive: true });
});

describe("journalSearch", () => {
  it("finds days by their words and their title, titles first", async () => {
    const search = journalSearch(journal);
    expect(days(await search.find("sea"))).toEqual([
      "2025-12-20",
      "2025-07-12",
    ]);
  });

  it("finds a word by its start, without its accents, and forgives a typo in a long word", async () => {
    const search = journalSearch(journal);
    expect(days(await search.find("walk"))).toEqual(["2025-07-12"]);
    expect(days(await search.find("cafe"))).toEqual(["2026-03-03"]);
    expect(days(await search.find("brekfast"))).toEqual(["2025-07-12"]);
  });

  it("never stretches a short word to another one", async () => {
    await write("2026-03-04", "Green tea by the window, in my seat.");
    const found = days(await journalSearch(journal).find("sea"));
    expect(found).toContain("2025-07-12");
    expect(found).not.toContain("2026-03-04");
  });

  it("forgives a typo in a long word even beside a short one", async () => {
    expect(days(await journalSearch(journal).find("sea brekfast"))).toEqual([
      "2025-07-12",
    ]);
  });

  it("leaves out common words when there's more to look for", async () => {
    const search = journalSearch(journal);
    expect(days(await search.find("the sea"))).toEqual(
      days(await search.find("sea"))
    );
  });

  it("needs every word of the search", async () => {
    const search = journalSearch(journal);
    expect(days(await search.find("sea breakfast"))).toEqual(["2025-07-12"]);
    expect(await search.find("sea market")).toEqual([]);
  });

  it("quotes the page around the match and says what to show of the day", async () => {
    const [hit] = await journalSearch(journal).find("breakfast");
    expect(hit).toMatchObject({
      cover: null,
      day: "2025-07-12",
      snippet: {
        marks: [[33, 42]],
        text: "We walked down to the sea before breakfast.",
      },
      title: "Mornings",
    });
  });

  it("finds nothing for a search with no words", async () => {
    expect(await journalSearch(journal).find(" … ")).toEqual([]);
  });

  it("follows days as they change, appear and go", async () => {
    const search = journalSearch(journal);
    await search.warm();

    await write("2026-04-01", "A lighthouse on the point.");
    await search.refresh([key("2026-04-01")]);
    expect(days(await search.find("lighthouse"))).toEqual(["2026-04-01"]);

    await write("2026-04-01", "Only rain today.");
    await search.refresh([key("2026-04-01")]);
    expect(await search.find("lighthouse")).toEqual([]);

    await rm(join(root, "2026", "04"), { force: true, recursive: true });
    await search.refresh([key("2026-04-01")]);
    expect(await search.find("rain")).toEqual([]);
  });

  it("leaves out a day it can't read", async () => {
    await mkdir(join(root, "2026", "05", "01"), { recursive: true });
    await writeFile(
      join(root, "2026", "05", "01", "2026-05-01.md"),
      "---\ntitle: [broken\n---\nThe sea again\n"
    );
    const found = days(await journalSearch(journal).find("sea"));
    expect(found).toContain("2025-07-12");
    expect(found).not.toContain("2026-05-01");
  });

  it("finds thoughts beside pages, each with its day, time and place", async () => {
    now = new Date("2025-07-12T21:00:00+01:00");
    await journal.writeThoughts(key("2025-07-12"), [
      { body: "Coffee first.", time: "08:00" },
      { body: "I could hear the sea from the hotel room.", time: "22:05" },
    ]);
    const search = journalSearch(journal);
    const hits = await search.find("hotel");
    expect(hits).toEqual([
      expect.objectContaining({
        day: "2025-07-12",
        id: "2025-07-12#1",
        index: 1,
        kind: "thought",
        time: "22:05",
      }),
    ]);
    expect((await search.find("sea")).map((hit) => hit.kind).sort()).toEqual([
      "day",
      "day",
      "thought",
    ]);
  });

  it("finds a day with only thoughts, and follows its thoughts as they change", async () => {
    now = new Date("2026-03-04T21:00:00+01:00");
    await journal.writeThoughts(key("2026-03-04"), [
      { body: "A lighthouse, far off.", time: "19:00" },
    ]);
    const search = journalSearch(journal);
    expect(await search.find("lighthouse")).toHaveLength(1);
    await journal.writeThoughts(key("2026-03-04"), [
      { body: "Only the harbour now.", time: "19:00" },
    ]);
    await search.refresh([key("2026-03-04")]);
    expect(await search.find("lighthouse")).toEqual([]);
    expect(await search.find("harbour")).toHaveLength(1);
  });
});
