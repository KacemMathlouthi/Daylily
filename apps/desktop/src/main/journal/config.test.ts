import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readConfig, writeConfig } from "./config";

const DEFAULTS = {
  galleryCovers: true,
  ghostPrompts: true,
  reminder: { enabled: true, time: "21:00" },
};

let root: string;
const path = () => join(root, ".daylily", "config.json");

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "daylily-config-"));
});

afterEach(async () => {
  await rm(root, { force: true, recursive: true });
});

describe("readConfig", () => {
  it("gives the defaults before anything is saved", async () => {
    expect(await readConfig(root)).toEqual(DEFAULTS);
  });

  it("gives the defaults for a file that isn't JSON", async () => {
    await mkdir(join(root, ".daylily"));
    await writeFile(path(), "{ not json");
    expect(await readConfig(root)).toEqual(DEFAULTS);
  });

  it("replaces only the fields it can't use", async () => {
    await mkdir(join(root, ".daylily"));
    await writeFile(
      path(),
      JSON.stringify({ ghostPrompts: false, reminder: { time: "25:00" } })
    );
    expect(await readConfig(root)).toEqual({
      ...DEFAULTS,
      ghostPrompts: false,
    });
  });
});

describe("writeConfig", () => {
  it("saves a change and keeps the rest", async () => {
    await writeConfig(root, { reminder: { time: "20:30" } });
    expect(await readConfig(root)).toEqual({
      ...DEFAULTS,
      reminder: { enabled: true, time: "20:30" },
    });
  });

  it("keeps fields from a newer version", async () => {
    await mkdir(join(root, ".daylily"));
    await writeFile(path(), JSON.stringify({ sync: { provider: "git" } }));
    await writeConfig(root, { ghostPrompts: false });
    expect(JSON.parse(await readFile(path(), "utf8"))).toMatchObject({
      ghostPrompts: false,
      sync: { provider: "git" },
    });
  });

  it("keeps both of two changes made at once", async () => {
    await Promise.all([
      writeConfig(root, { ghostPrompts: false }),
      writeConfig(root, { reminder: { enabled: false } }),
      writeConfig(root, { galleryCovers: false }),
    ]);
    expect(await readConfig(root)).toEqual({
      galleryCovers: false,
      ghostPrompts: false,
      reminder: { enabled: false, time: "21:00" },
    });
  });
});
