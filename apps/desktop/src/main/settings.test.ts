import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_JOURNAL, deviceSettings } from "./settings";

let folder: string;

beforeEach(async () => {
  folder = await mkdtemp(join(tmpdir(), "daylily-settings-"));
});

afterEach(async () => {
  await rm(folder, { force: true, recursive: true });
});

describe("deviceSettings", () => {
  it("keeps the journal in ~/Daylily until another is chosen", async () => {
    const settings = deviceSettings(folder);
    expect(await settings.journalPath()).toBe(DEFAULT_JOURNAL);
    const chosen = join(folder, "Elsewhere");
    await settings.write({ journalPath: chosen });
    expect(await settings.journalPath()).toBe(chosen);
  });

  it("ignores a journal path that isn't absolute", async () => {
    await writeFile(
      join(folder, "settings.json"),
      JSON.stringify({ journalPath: "relative/journal" })
    );
    expect(await deviceSettings(folder).journalPath()).toBe(DEFAULT_JOURNAL);
  });

  it("starts over from a file that isn't JSON", async () => {
    await writeFile(join(folder, "settings.json"), "nope");
    expect(await deviceSettings(folder).read()).toEqual({ journalPath: null });
  });
});
