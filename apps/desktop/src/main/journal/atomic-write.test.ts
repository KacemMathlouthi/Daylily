import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { writeFileAtomic } from "./atomic-write";

const VERSION = /^Version \d+$/;

let folder: string;

beforeEach(async () => {
  folder = await mkdtemp(join(tmpdir(), "daylily-atomic-"));
});

afterEach(async () => {
  await rm(folder, { force: true, recursive: true });
});

describe("writeFileAtomic", () => {
  it("creates missing folders and writes the file", async () => {
    const path = join(folder, "2026", "10", "21", "2026-10-21.md");
    await writeFileAtomic(path, "Hello\n");
    expect(await readFile(path, "utf8")).toBe("Hello\n");
  });

  it("replaces a file that is already there", async () => {
    const path = join(folder, "day.md");
    await writeFile(path, "Old words");
    await writeFileAtomic(path, "New words");
    expect(await readFile(path, "utf8")).toBe("New words");
  });

  it("writes bytes as they are", async () => {
    const path = join(folder, "cover.jpg");
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0x00, 0x10]);
    await writeFileAtomic(path, bytes);
    expect(new Uint8Array(await readFile(path))).toEqual(bytes);
  });

  it("leaves no temp file behind", async () => {
    const path = join(folder, "day.md");
    await writeFileAtomic(path, "One");
    await writeFileAtomic(path, "Two");
    expect(await readdir(folder)).toEqual(["day.md"]);
  });

  it("keeps the old file and cleans up when the write fails", async () => {
    const path = join(folder, "day.md");
    await writeFile(path, "Safe words");
    // A folder where the file should be makes the rename fail
    const blocked = join(folder, "blocked");
    await writeFileAtomic(join(blocked, "inner.md"), "x");
    await expect(writeFileAtomic(blocked, "Lost")).rejects.toThrow();
    expect(await readFile(path, "utf8")).toBe("Safe words");
    expect((await readdir(folder)).sort()).toEqual(["blocked", "day.md"]);
  });

  it("keeps every write when many land at once", async () => {
    const writes = Array.from({ length: 20 }, (_, index) =>
      writeFileAtomic(join(folder, "day.md"), `Version ${index}`)
    );
    await Promise.all(writes);
    expect(await readFile(join(folder, "day.md"), "utf8")).toMatch(VERSION);
    expect(await readdir(folder)).toEqual(["day.md"]);
  });
});
