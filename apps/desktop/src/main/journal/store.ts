import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";
import type { Clock } from "@daylily/core/clock";
import { type DayKey, dayPath, parseDayKey, today } from "@daylily/core/day";
import {
  type DayFileError,
  type PageContent,
  readDayFile,
  writeDayFile,
} from "@daylily/core/day-file";
import { pageExcerpt } from "@daylily/core/excerpt";
import type { FlowerColor } from "@daylily/core/flower";
import { fail, ok, type Result } from "@daylily/core/result";
import { sealDayFile, sealState } from "@daylily/core/seal";
import { countMarkdownWords } from "@daylily/core/words";
import type {
  CoverExtension,
  JournalError,
  ListedDay,
  StoredDay,
  UnreadableDay,
} from "../../shared/journal";
import { writeFileAtomic } from "./atomic-write";
import { fileStamp, flowerCache } from "./flower-cache";

const YEAR = /^\d{4}$/;
/** `2026-10-21T19:02:11+01:00`: the hour sits after the T, on the clock where it was written. */
const CREATED_HOUR = /T(\d{2}):/;
const TWO_DIGITS = /^\d{2}$/;

function errorCode(error: unknown) {
  return (error as NodeJS.ErrnoException).code ?? "UNKNOWN";
}

async function readIfThere(path: string) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function folderNames(path: string, pattern: RegExp) {
  try {
    const entries = await readdir(path, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory() && pattern.test(entry.name))
      .map((entry) => entry.name);
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      return [];
    }
    throw error;
  }
}

/**
 * The journal on disk: one folder per day, `YYYY/MM/DD/YYYY-MM-DD.md`, with its
 * cover beside it. The only code that touches the journal's files.
 */
export function createJournal({
  app,
  clock,
  root,
}: {
  /** Who writes, like `daylily/0.1.0`. */
  app: string;
  clock: Clock;
  root: string;
}) {
  const journalRoot = resolve(root);
  const flowers = flowerCache(journalRoot);
  // One write at a time per file, so a save and the seal never interleave
  const queues = new Map<string, Promise<unknown>>();

  function inJournal(...segments: string[]) {
    const path = resolve(journalRoot, ...segments);
    const inside = relative(journalRoot, path);
    if (inside === "" || inside.startsWith(`..${sep}`) || inside === "..") {
      throw new Error(`Refused a path outside the journal: ${path}`);
    }
    return path;
  }

  const dayFile = (day: DayKey) => inJournal(...dayPath(day));
  const dayAsset = (day: DayKey, name: string) =>
    inJournal(...dayPath(day).slice(0, 3), name);

  function queued<T>(path: string, task: () => Promise<T>): Promise<T> {
    const previous = queues.get(path) ?? Promise.resolve();
    const next = previous.then(task, task);
    const settled = next.catch(() => undefined);
    queues.set(path, settled);
    settled.then(() => {
      if (queues.get(path) === settled) {
        queues.delete(path);
      }
    });
    return next;
  }

  const coverStamp = (day: DayKey, cover: string | null) =>
    cover === null ? Promise.resolve(null) : fileStamp(dayAsset(day, cover));

  async function toStored(day: DayKey, text: string) {
    const file = readDayFile(text);
    if (!file.ok) {
      return file;
    }
    const { body, meta } = file.value;
    const stamp = await coverStamp(day, meta.cover);
    const hour = meta.created
      ? CREATED_HOUR.exec(meta.created)?.[1]
      : undefined;
    return ok<StoredDay>({
      body,
      color: stamp ? await flowers.get(day, stamp) : null,
      cover: meta.cover,
      coverStamp: stamp,
      day,
      excerpt: pageExcerpt(body),
      hour: hour === undefined ? null : Number(hour),
      state: await sealState(file.value),
      title: meta.title,
      // Counted from the page, since another app may have changed it since
      words: countMarkdownWords(body),
    });
  }

  /**
   * A day may be written while it is today. A day that has ended may still take
   * a save that was on its way, until it seals; it is never started late.
   */
  function writable(day: DayKey, existing: string | null) {
    const now = today(clock);
    return day === now || (day < now && existing !== null);
  }

  /** Why a day's cover can't change now, or null when it can. */
  function coverLocked(
    day: DayKey,
    existing: string | null
  ): JournalError | null {
    if (!writable(day, existing)) {
      return { day, kind: "not-writable" };
    }
    if (existing === null) {
      return null;
    }
    const file = readDayFile(existing);
    if (!file.ok) {
      return file.error;
    }
    return file.value.meta.sealed ? { kind: "sealed" } : null;
  }

  async function guarded<T>(
    work: () => Promise<Result<T, JournalError>>
  ): Promise<Result<T, JournalError>> {
    try {
      return await work();
    } catch (error) {
      const code = errorCode(error);
      if (code === "UNKNOWN") {
        throw error;
      }
      return fail({ code, kind: "io" });
    }
  }

  return {
    /** Where a file in a day's folder lives, for showing its cover. */
    dayAsset,

    /** How much the journal folder holds, every file in it, in bytes. */
    async diskUsage(): Promise<number> {
      try {
        const entries = await readdir(journalRoot, {
          recursive: true,
          withFileTypes: true,
        });
        const sizes = await Promise.all(
          entries
            .filter((entry) => entry.isFile())
            .map((entry) =>
              stat(join(entry.parentPath, entry.name)).then(
                (file) => file.size,
                () => 0
              )
            )
        );
        return sizes.reduce((total, size) => total + size, 0);
      } catch (error) {
        if (errorCode(error) === "ENOENT") {
          return 0;
        }
        throw error;
      }
    },

    /** Writes any flower colours not yet saved, such as before quitting. */
    flushCache: () => flowers.flush(),

    /** Every day with a file, oldest first. Days without one are bare soil. */
    async listDays(): Promise<ListedDay[]> {
      const years = await folderNames(journalRoot, YEAR);
      const months = await Promise.all(
        years.map(async (year) =>
          (await folderNames(join(journalRoot, year), TWO_DIGITS)).map(
            (month) => [year, month] as const
          )
        )
      );
      const dates = await Promise.all(
        months
          .flat()
          .map(async ([year, month]) =>
            (await folderNames(join(journalRoot, year, month), TWO_DIGITS)).map(
              (date) => parseDayKey(`${year}-${month}-${date}`)
            )
          )
      );
      const days = dates.flat().filter((day) => day !== null);
      const listed = await Promise.all(
        days.sort().map(async (day) => {
          const text = await readIfThere(dayFile(day));
          if (text === null) {
            return null;
          }
          const stored = await toStored(day, text);
          if (!stored.ok) {
            return { day, state: "unreadable" } satisfies UnreadableDay;
          }
          const { body: _, ...summary } = stored.value;
          return summary;
        })
      );
      return listed.filter((day) => day !== null);
    },

    /** A day's page and fields, or null when nothing was written that day. */
    async readDay(
      day: DayKey
    ): Promise<Result<StoredDay | null, DayFileError>> {
      const text = await readIfThere(dayFile(day));
      return text === null ? ok(null) : toStored(day, text);
    },

    root: journalRoot,

    /**
     * Copies a cover image into a day's folder as `cover.<ext>`, returning its
     * name. The page's next save records it. A sealed day's cover never changes.
     * A gallery cover brings its flower colour, so it isn't sampled.
     */
    saveCover(
      day: DayKey,
      bytes: Uint8Array,
      extension: CoverExtension,
      color?: FlowerColor
    ): Promise<Result<string, JournalError>> {
      const path = dayFile(day);
      return queued(path, () =>
        guarded(async () => {
          const locked = coverLocked(day, await readIfThere(path));
          if (locked) {
            return fail(locked);
          }
          const name = `cover.${extension}`;
          await writeFileAtomic(dayAsset(day, name), bytes);
          const stamp = await coverStamp(day, name);
          if (color && stamp) {
            await flowers.set(day, stamp, color);
          }
          return ok(name);
        })
      );
    },

    /**
     * Seals a day: its cover if it had none, the time and the hash. Finishes any
     * save still on its way first. A day without a file has nothing to seal.
     */
    sealDay(
      day: DayKey,
      seal: { cover: string | null; sealed: string }
    ): Promise<Result<"sealed" | "nothing", JournalError>> {
      const path = dayFile(day);
      return queued(path, () =>
        guarded(async () => {
          const text = await readIfThere(path);
          if (text === null) {
            return ok("nothing" as const);
          }
          const sealed = await sealDayFile(text, seal);
          if (!sealed.ok) {
            return sealed;
          }
          await writeFileAtomic(path, sealed.value);
          return ok("sealed" as const);
        })
      );
    },

    /** Keeps the flower colour the page sampled from a day's cover. */
    setFlowerColor: (day: DayKey, stamp: string, color: FlowerColor) =>
      flowers.set(day, stamp, color),

    /**
     * Saves a day's page, starting its folder on the first save. An empty page
     * on a day never written leaves no trace.
     */
    writeDay(
      day: DayKey,
      page: PageContent
    ): Promise<Result<StoredDay | null, JournalError>> {
      const path = dayFile(day);
      return queued(path, () =>
        guarded(async () => {
          const existing = await readIfThere(path);
          if (!writable(day, existing)) {
            return fail({ day, kind: "not-writable" });
          }
          const empty =
            page.body.trim() === "" &&
            page.title.trim() === "" &&
            page.cover === null;
          if (existing === null && empty) {
            return ok(null);
          }
          const text = writeDayFile(existing, page, {
            app,
            now: clock.now(),
            timeZone: clock.timeZone(),
          });
          if (!text.ok) {
            return text;
          }
          await writeFileAtomic(path, text.value);
          return toStored(day, text.value);
        })
      );
    },
  };
}

export type Journal = ReturnType<typeof createJournal>;
