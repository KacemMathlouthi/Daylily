import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Clock } from "@daylily/core/clock";
import { type DayKey, parseDayKey } from "@daylily/core/day";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sealEndedDays } from "./seal";
import { createJournal, type Journal } from "./store";

const key = (text: string): DayKey => {
  const day = parseDayKey(text);
  if (!day) {
    throw new Error(`Not a day: ${text}`);
  }
  return day;
};

const page = (body: string) => ({ body, cover: null, title: "" });
const jpeg = new Uint8Array([0xff, 0xd8, 0xff]);

let root: string;
let now: Date;
let journal: Journal;
const clock: Clock = { now: () => now, timeZone: () => "Africa/Tunis" };

/** Writes a day's page while it is that day, in the evening. */
async function writeOn(day: string, body: string) {
  now = new Date(`${day}T20:00:00+01:00`);
  await journal.writeDay(key(day), page(body));
}

async function read(day: string) {
  const result = await journal.readDay(key(day));
  return result.ok ? result.value : null;
}

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "daylily-seal-"));
  journal = createJournal({ app: "daylily/0.1.0", clock, root });
});

afterEach(async () => {
  await journal.flushCache();
  await rm(root, { force: true, recursive: true });
});

describe("sealEndedDays", () => {
  it("seals the days that ended and leaves today open", async () => {
    await writeOn("2026-10-19", "Monday.");
    await writeOn("2026-10-20", "Tuesday.");
    await writeOn("2026-10-21", "Today, still going.");

    const sealed = await sealEndedDays({
      clock,
      flush: async () => undefined,
      galleryCover: async () => null,
      journal,
    });

    expect(sealed.sort()).toEqual(["2026-10-19", "2026-10-20"]);
    expect((await read("2026-10-19"))?.state).toBe("sealed");
    expect((await read("2026-10-20"))?.state).toBe("sealed");
    expect((await read("2026-10-21"))?.state).toBe("open");
  });

  it("seals days left open while the app was closed, at their own 4am", async () => {
    await writeOn("2026-10-19", "Before the trip.");
    // Opened again a week later
    now = new Date("2026-10-26T09:00:00+01:00");

    await sealEndedDays({
      clock,
      flush: async () => undefined,
      galleryCover: async () => null,
      journal,
    });

    const text = await readFile(
      join(root, "2026", "10", "19", "2026-10-19.md"),
      "utf8"
    );
    expect(text).toContain("sealed: 2026-10-20T04:00:00+01:00");
  });

  it("asks the page to save its last words first, only when a day has ended", async () => {
    const flush = vi.fn(async () => undefined);
    await writeOn("2026-10-21", "Still today.");
    await sealEndedDays({
      clock,
      flush,
      galleryCover: async () => null,
      journal,
    });
    expect(flush).not.toHaveBeenCalled();

    now = new Date("2026-10-22T04:00:01+01:00");
    flush.mockImplementation(async () => {
      // The words typed just before four, saved on the way to the seal
      await journal.writeDay(key("2026-10-21"), page("Still today. The end."));
    });
    await sealEndedDays({
      clock,
      flush,
      galleryCover: async () => null,
      journal,
    });
    expect(flush).toHaveBeenCalledOnce();
    expect(await read("2026-10-21")).toMatchObject({
      body: "Still today. The end.\n",
      state: "sealed",
    });
  });

  it("gives a gallery cover only to days written without one", async () => {
    await writeOn("2026-10-19", "No picture.");
    now = new Date("2026-10-20T20:00:00+01:00");
    await journal.saveCover(key("2026-10-20"), new Uint8Array([1]), "png");
    await journal.writeDay(key("2026-10-20"), {
      ...page("My own picture."),
      cover: "cover.png",
    });
    now = new Date("2026-10-22T09:00:00+01:00");
    const galleryCover = vi.fn(async () => ({
      bytes: jpeg,
      color: "cornflower" as const,
      extension: "jpg" as const,
    }));

    await sealEndedDays({
      clock,
      flush: async () => undefined,
      galleryCover,
      journal,
    });

    expect(galleryCover).toHaveBeenCalledOnce();
    expect(await read("2026-10-19")).toMatchObject({
      color: "cornflower",
      cover: "cover.jpg",
    });
    expect((await read("2026-10-20"))?.cover).toBe("cover.png");
  });

  it("passes over sealed and unreadable days, and seals the rest", async () => {
    await writeOn("2026-10-18", "Already sealed.");
    now = new Date("2026-10-19T09:00:00+01:00");
    await journal.sealDay(key("2026-10-18"), null);
    await mkdir(join(root, "2026", "10", "19"), { recursive: true });
    await writeFile(
      join(root, "2026", "10", "19", "2026-10-19.md"),
      "---\ntitle: [broken\n---\nWords\n"
    );
    await writeOn("2026-10-20", "Open.");
    now = new Date("2026-10-22T09:00:00+01:00");

    const sealed = await sealEndedDays({
      clock,
      flush: async () => undefined,
      galleryCover: async () => null,
      journal,
    });

    expect(sealed).toEqual(["2026-10-20"]);
    expect(
      await readFile(join(root, "2026", "10", "19", "2026-10-19.md"), "utf8")
    ).toBe("---\ntitle: [broken\n---\nWords\n");
  });
});
