import {
  chmod,
  mkdir,
  mkdtemp,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Clock } from "@daylily/core/clock";
import { type DayKey, parseDayKey } from "@daylily/core/day";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { inspectFolder, tildeHome } from "./folder";
import { createJournal } from "./store";

const clock: Clock = {
  now: () => new Date("2026-10-21T20:00:00+01:00"),
  timeZone: () => "Africa/Tunis",
};

const TODAY = parseDayKey("2026-10-21") as DayKey;

let base: string;

const journalAt = (root: string) =>
  createJournal({ app: "daylily/test", clock, root });

beforeEach(async () => {
  base = await mkdtemp(join(tmpdir(), "daylily-folder-"));
});

afterEach(async () => {
  await rm(base, { force: true, recursive: true });
});

describe("inspectFolder", () => {
  it("offers a folder not made yet as a new journal, without making it", async () => {
    const root = join(base, "Daylily");
    const info = await inspectFolder(journalAt(root));
    expect(info).toMatchObject({ days: 0, path: root, writable: true });
    expect(info.config.reminder).toEqual({ enabled: true, time: "21:00" });
    expect(await readdir(base)).toEqual([]);
  });

  it("counts the days a journal holds, and reads its own preferences", async () => {
    const root = join(base, "Journal");
    const journal = journalAt(root);
    await journal.writeDay(TODAY, { body: "Words.", cover: null, title: "" });
    await mkdir(join(root, ".daylily"), { recursive: true });
    await writeFile(
      join(root, ".daylily", "config.json"),
      JSON.stringify({ reminder: { enabled: false, time: "07:30" } })
    );
    const info = await inspectFolder(journal);
    expect(info.days).toBe(1);
    expect(info.config.reminder).toEqual({ enabled: false, time: "07:30" });
  });

  // Permissions as tested here don't hold on Windows, or for root
  it.skipIf(process.platform === "win32" || process.getuid?.() === 0)(
    "says when a folder can't be written, nor a new one inside it",
    async () => {
      const root = join(base, "Locked");
      await mkdir(root);
      await chmod(root, 0o555);
      try {
        expect((await inspectFolder(journalAt(root))).writable).toBe(false);
        expect(
          (await inspectFolder(journalAt(join(root, "Daylily")))).writable
        ).toBe(false);
      } finally {
        await chmod(root, 0o755);
      }
    }
  );

  it("won't take a file for a folder", async () => {
    const root = join(base, "notes.txt");
    await writeFile(root, "not a folder");
    expect((await inspectFolder(journalAt(root))).writable).toBe(false);
  });
});

describe("tildeHome", () => {
  it("shows the home folder as ~, and only that folder", () => {
    const home = join(base, "sam");
    expect(tildeHome(home, home)).toBe("~");
    expect(tildeHome(join(home, "Daylily"), home)).toBe(
      `~${join(home, "Daylily").slice(home.length)}`
    );
    expect(tildeHome(join(`${home}uel`, "Daylily"), home)).toBe(
      join(`${home}uel`, "Daylily")
    );
  });
});
