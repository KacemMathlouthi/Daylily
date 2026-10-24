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

type Entries = z.infer<typeof cacheSchema>;

/**
 * A cover file's size and time, so a colour sampled from an older cover isn't
 * reused. The time is kept to the fraction, as two saves can share a millisecond.
 * Null if it's missing.
 */
export async function fileStamp(path: string) {
  try {
    const { mtimeMs, size } = await stat(path);
    return `${size}-${mtimeMs}`;
  } catch {
    return null;
  }
}

/** Many colours arrive together on the first launch; they're written once things settle. */
const WRITE_AFTER_MS = 1000;

const isMissing = (error: unknown) =>
  (error as NodeJS.ErrnoException).code === "ENOENT";

/**
 * Flower colours sampled from covers, in `.daylily/cache/flowers.json`. Each is
 * kept with a stamp of the cover file it came from, so a changed cover is sampled
 * again. Derived data: deleting the file only means sampling again.
 */
export function flowerCache(root: string) {
  const path = join(root, ".daylily", "cache", "flowers.json");
  // One read shared by everyone who asks, so days read at once never each start their own
  let loading: Promise<Entries> | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let unsaved = false;

  /**
   * The colours on disk. A missing or garbled file is an empty cache; any other
   * failure, such as a file briefly locked on Windows, is tried again next time
   * rather than saved over.
   */
  function load() {
    loading ??= readFile(path, "utf8").then(
      (text) => {
        try {
          return cacheSchema.parse(JSON.parse(text));
        } catch {
          return {};
        }
      },
      (error: unknown) => {
        if (isMissing(error)) {
          return {};
        }
        loading = null;
        throw error;
      }
    );
    return loading;
  }

  /** Writes unsaved colours now, such as before quitting. */
  async function flush() {
    clearTimeout(timer);
    timer = undefined;
    if (!(unsaved && loading)) {
      return;
    }
    unsaved = false;
    const entries = await loading;
    if (Object.keys(entries).length === 0) {
      await rm(path, { force: true });
    } else {
      await writeFileAtomic(path, `${JSON.stringify(entries)}\n`);
    }
  }

  /** Changes the colours, unless the cache can't be read just now: they're sampled again later. */
  async function change(update: (entries: Entries) => void) {
    try {
      update(await load());
      unsaved = true;
      return true;
    } catch (error) {
      console.error("Could not read the flower colours", error);
      return false;
    }
  }

  return {
    flush,
    /** Drops days' colours, such as for days that are gone. */
    async forget(days: Iterable<string>) {
      const changed = await change((entries) => {
        for (const day of days) {
          delete entries[day];
        }
      });
      if (changed) {
        await flush();
      }
    },
    /** The colour sampled from this cover, or null if it hasn't been yet. */
    async get(day: string, stamp: string): Promise<FlowerColor | null> {
      try {
        const entry = (await load())[day];
        return entry?.stamp === stamp ? entry.color : null;
      } catch {
        return null;
      }
    },
    async set(day: string, stamp: string, color: FlowerColor) {
      const changed = await change((entries) => {
        entries[day] = { color, stamp };
      });
      if (changed) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          flush().catch((error) =>
            console.error("Could not cache flower colours", error)
          );
        }, WRITE_AFTER_MS);
      }
    },
  };
}
