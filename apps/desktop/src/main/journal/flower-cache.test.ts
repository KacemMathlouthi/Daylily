import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { flowerCache } from "./flower-cache";

let root: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "daylily-flowers-"));
});

afterEach(async () => {
  await rm(root, { force: true, recursive: true });
});

describe("flowerCache", () => {
  it("knows nothing before a colour is sampled", async () => {
    expect(await flowerCache(root).get("2026-10-21", "120-1")).toBeNull();
  });

  it("keeps a colour for the cover it was sampled from", async () => {
    const cache = flowerCache(root);
    await cache.set("2026-10-21", "120-1", "petal");
    expect(await cache.get("2026-10-21", "120-1")).toBe("petal");
    // A different cover file needs sampling again
    expect(await cache.get("2026-10-21", "480-2")).toBeNull();
    await cache.flush();
  });

  it("never saves over colours it couldn't read", async () => {
    const file = join(root, ".daylily", "cache", "flowers.json");
    // A folder where the file should be: reading fails, and not as "missing"
    await mkdir(file, { recursive: true });
    const cache = flowerCache(root);
    await cache.set("2026-10-21", "1-1", "petal");
    await cache.flush();
    expect(await cache.get("2026-10-21", "1-1")).toBeNull();
  });

  it("keeps every colour set at once", async () => {
    const cache = flowerCache(root);
    const days = Array.from(
      { length: 30 },
      (_, index) => `2026-01-${String(index + 1).padStart(2, "0")}`
    );
    await Promise.all(days.map((day) => cache.set(day, "1-1", "saffron")));
    await cache.flush();
    const reread = flowerCache(root);
    const colors = await Promise.all(days.map((day) => reread.get(day, "1-1")));
    expect(colors.every((color) => color === "saffron")).toBe(true);
  });

  it("removes its file once it holds nothing", async () => {
    const cache = flowerCache(root);
    await cache.set("2026-10-21", "1-1", "petal");
    await cache.flush();
    await cache.forget(["2026-10-21"]);
    await expect(
      readFile(join(root, ".daylily", "cache", "flowers.json"))
    ).rejects.toThrow();
  });

  it("writes to .daylily/cache, where the next launch reads it", async () => {
    const cache = flowerCache(root);
    await cache.set("2026-10-21", "120-1", "cornflower");
    await cache.flush();
    const file = join(root, ".daylily", "cache", "flowers.json");
    expect(JSON.parse(await readFile(file, "utf8"))).toEqual({
      "2026-10-21": { color: "cornflower", stamp: "120-1" },
    });
    expect(await flowerCache(root).get("2026-10-21", "120-1")).toBe(
      "cornflower"
    );
  });
});
