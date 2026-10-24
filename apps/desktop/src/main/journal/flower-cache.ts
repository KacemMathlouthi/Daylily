import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { FlowerColor } from "@daylily/core/flower";
import { z } from "zod";
import { writeFileAtomic } from "./atomic-write";

const cacheSchema = z.record(
  z.string(),
  z.object({
    color: z.enum(["daylily", "petal", "saffron", "cornflower"]),
    stamp: z.string(),
  })
);

/** Many colours arrive together on the first launch; they're written once things settle. */
const WRITE_AFTER_MS = 1000;

/**
 * Flower colours sampled from covers, in `.daylily/cache/flowers.json`. Each is
 * kept with a stamp of the cover file it came from, so a changed cover is sampled
 * again. Derived data: deleting the file only means sampling again.
 */
export function flowerCache(root: string) {
  const path = join(root, ".daylily", "cache", "flowers.json");
  let entries: z.infer<typeof cacheSchema> | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;

  async function load() {
    if (entries === null) {
      try {
        entries = cacheSchema.parse(JSON.parse(await readFile(path, "utf8")));
      } catch {
        entries = {};
      }
    }
    return entries;
  }

  async function flush() {
    clearTimeout(timer);
    timer = undefined;
    if (entries !== null) {
      await writeFileAtomic(path, `${JSON.stringify(entries)}\n`);
    }
  }

  return {
    flush,
    /** The colour sampled from this cover, or null if it hasn't been yet. */
    async get(day: string, stamp: string): Promise<FlowerColor | null> {
      const entry = (await load())[day];
      return entry?.stamp === stamp ? entry.color : null;
    },
    async set(day: string, stamp: string, color: FlowerColor) {
      (await load())[day] = { color, stamp };
      clearTimeout(timer);
      timer = setTimeout(() => {
        flush().catch((error) =>
          console.error("Could not cache flower colours", error)
        );
      }, WRITE_AFTER_MS);
    },
  };
}
