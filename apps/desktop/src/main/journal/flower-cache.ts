import { readFile, rm, stat } from "node:fs/promises";
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

/** A cover file's size and time: a colour sampled from an older cover isn't reused. Null if it's missing. */
export async function fileStamp(path: string) {
  try {
    const { mtimeMs, size } = await stat(path);
    return `${size}-${Math.round(mtimeMs)}`;
  } catch {
    return null;
  }
}

/** Many colours arrive together on the first launch; they're written once things settle. */
const WRITE_AFTER_MS = 1000;

/**
 * Flower colours sampled from covers, in `.daylily/cache/flowers.json`. Each is
 * kept with a stamp of the cover file it came from, so a changed cover is sampled
 * again. Derived data: deleting the file only means sampling again.
 */
export function flowerCache(root: string) {
  const path = join(root, ".daylily", "cache", "flowers.json");
  type Entries = z.infer<typeof cacheSchema>;
  // One read shared by everyone who asks, so days read at once never each start their own
  let loading: Promise<Entries> | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function load() {
    loading ??= readFile(path, "utf8")
      .then((text) => cacheSchema.parse(JSON.parse(text)))
      .catch((): Entries => ({}));
    return loading;
  }

  async function flush() {
    clearTimeout(timer);
    timer = undefined;
    if (loading === null) {
      return;
    }
    const entries = await loading;
    if (Object.keys(entries).length === 0) {
      await rm(path, { force: true });
    } else {
      await writeFileAtomic(path, `${JSON.stringify(entries)}\n`);
    }
  }

  return {
    flush,
    /** Drops days' colours, such as for days that are gone. */
    async forget(days: Iterable<string>) {
      const current = await load();
      for (const day of days) {
        delete current[day];
      }
      await flush();
    },
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
