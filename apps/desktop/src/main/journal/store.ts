import { readdir, readFile, rename, rm, stat } from "node:fs/promises";
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
import {
  isNoteName,
  NOTE_IMAGES_FOLDER,
  NOTES_FOLDER,
  type NoteContent,
  noteFileName,
  readNoteFile,
  writeNoteFile,
} from "@daylily/core/note-file";
import { fail, ok, type Result } from "@daylily/core/result";
import { hasEnded, sealDayFile, sealState, sealTime } from "@daylily/core/seal";
import {
  readThoughtsFile,
  THOUGHTS_FILE,
  type Thought,
  type ThoughtsStamp,
  thoughtTime,
  writeThoughtsFile,
} from "@daylily/core/thoughts-file";
import { countMarkdownWords } from "@daylily/core/words";
import {
  type CoverExtension,
  type JournalError,
  type ListedDay,
  type ListedNote,
  PAGE_IMAGE_NAME,
  type StoredDay,
  type StoredNote,
  type ThoughtDay,
  type ThoughtsPage,
  type UnreadableDay,
} from "../../shared/journal";
import { createFileAtomic, writeFileAtomic } from "./atomic-write";
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

const isBlank = (thought: Thought) => thought.body.trim() === "";

/**
 * A day's thoughts file after `change`, and the thoughts as they now read; null
 * when there's no file and nothing to keep, so the day is left without a trace.
 */
function changedThoughts(
  existing: string | null,
  change: (current: readonly Thought[]) => readonly Thought[],
  stamp: ThoughtsStamp
): Result<{ text: string; thoughts: Thought[] } | null, DayFileError> {
  const current = existing === null ? ok([]) : readThoughtsFile(existing);
  if (!current.ok) {
    return current;
  }
  const thoughts = change(current.value);
  if (existing === null && thoughts.every(isBlank)) {
    return ok(null);
  }
  const text = writeThoughtsFile(existing, thoughts, stamp);
  if (!text.ok) {
    return text;
  }
  const saved = readThoughtsFile(text.value);
  return saved.ok ? ok({ text: text.value, thoughts: saved.value }) : saved;
}

/** A gallery picture for a day sealed without a cover, with the flower it grows. */
export interface SealCover {
  bytes: Uint8Array;
  color: FlowerColor;
  extension: CoverExtension;
}

/** The names in a folder, or none when it isn't there yet. */
async function listFolder(path: string) {
  try {
    return await readdir(path);
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      return [];
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

/** The last number `PAGE_IMAGE_NAME` allows: past it, a name couldn't be served. */
const MAX_IMAGE_NUMBER = 999;

/** One past the highest image number in a folder, or 1 in a new one. */
async function nextImageNumber(folder: string) {
  let highest = 0;
  for (const entry of await listFolder(folder)) {
    const number = Number(PAGE_IMAGE_NAME.exec(entry)?.[1] ?? 0);
    highest = Math.max(highest, number);
  }
  return highest + 1;
}

/**
 * Copies an image into `folder` as the next `image-NN.<ext>`, untouched, and
 * returns its name. Names already taken, by Daylily or anyone, are skipped,
 * never written over.
 */
async function copyImageIn(
  folder: string,
  bytes: Uint8Array,
  extension: CoverExtension
): Promise<Result<string, JournalError>> {
  for (
    let number = await nextImageNumber(folder);
    number <= MAX_IMAGE_NUMBER;
    number += 1
  ) {
    const name = `image-${String(number).padStart(2, "0")}.${extension}`;
    // biome-ignore lint/performance/noAwaitInLoops: the next name is tried only once this one is taken
    if (await createFileAtomic(join(folder, name), bytes)) {
      return ok(name);
    }
  }
  // Every name to image-999 is taken: said as the disk refusing one more
  return fail({ code: "EEXIST", kind: "io" });
}

/** A save stamps a note's frontmatter a moment before the disk stamps its file. */
const SAVE_SLACK_MS = 2000;

/** When a note last changed: as its file says, or as the disk does for one written elsewhere. */
async function noteUpdated(path: string, written: string | null) {
  const changed = (await stat(path)).mtime;
  // Another app's edit moves the file's time on, not the frontmatter's
  return written !== null &&
    Date.parse(written) >= changed.getTime() - SAVE_SLACK_MS
    ? written
    : changed.toISOString();
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
  const thoughtsFile = (day: DayKey) => dayAsset(day, THOUGHTS_FILE);
  const notesFolder = inJournal(NOTES_FOLDER);
  const noteImagesFolder = inJournal(NOTES_FOLDER, NOTE_IMAGES_FOLDER);

  /** Where a note lives; only a note's own name, never a path elsewhere. */
  function noteFile(name: string) {
    if (!isNoteName(name)) {
      throw new Error(`Refused a note name: ${name}`);
    }
    return inJournal(NOTES_FOLDER, name);
  }

  /** The notes in the folder, by name, as the disk lists them. */
  async function noteNames() {
    try {
      const entries = await readdir(notesFolder, { withFileTypes: true });
      return entries
        .filter((entry) => entry.isFile() && isNoteName(entry.name))
        .map((entry) => entry.name);
    } catch (error) {
      if (errorCode(error) === "ENOENT") {
        return [];
      }
      throw error;
    }
  }

  /** A note as read from its file, or why it can't be. */
  async function toStoredNote(
    name: string,
    text: string
  ): Promise<Result<StoredNote, DayFileError>> {
    const note = readNoteFile(text, name);
    if (!note.ok) {
      return note;
    }
    const { body, pinned, title, updated } = note.value;
    return ok({
      body,
      name,
      pinned,
      title,
      updated: await noteUpdated(noteFile(name), updated),
    });
  }

  /**
   * Gives a saved note the name its title asks for, if it's free: written whole
   * under the new name first, so the words are never only half in either.
   */
  async function renameNote(name: string, text: string, title: string) {
    const others = new Set(
      (await noteNames())
        .filter((other) => other !== name)
        .map((other) => other.toLowerCase())
    );
    for (;;) {
      const wanted = noteFileName(title, (each) =>
        others.has(each.toLowerCase())
      );
      if (wanted === name) {
        return name;
      }
      if (wanted.toLowerCase() === name.toLowerCase()) {
        // The same file where names ignore case: only the letters change
        // biome-ignore lint/performance/noAwaitInLoops: the loop ends here
        await rename(noteFile(name), noteFile(wanted));
        return wanted;
      }
      if (await createFileAtomic(noteFile(wanted), text)) {
        await rm(noteFile(name), { force: true });
        return wanted;
      }
      others.add(wanted.toLowerCase());
    }
  }

  /**
   * The name a note's file has on disk: where names ignore case (macOS,
   * Windows), `Books.md` may be asked for as `books.md`.
   */
  async function spelledOnDisk(name: string) {
    const names = await noteNames();
    if (names.includes(name)) {
      return name;
    }
    return (
      names.find((each) => each.toLowerCase() === name.toLowerCase()) ?? name
    );
  }

  /**
   * Writes a note that has a file, and gives it the name `title` asks for, when
   * one is given. A note whose file went while it was open is written again,
   * words and all.
   */
  async function saveExisting(
    name: string,
    text: string,
    title: string | false
  ) {
    await writeFileAtomic(noteFile(name), text);
    return title === false ? name : await renameNote(name, text, title);
  }

  /** Writes a new note under a free name from its title, and returns the name. */
  async function createNote(title: string, text: string) {
    const taken = new Set(
      (await noteNames()).map((each) => each.toLowerCase())
    );
    for (;;) {
      const name = noteFileName(title, (each) => taken.has(each.toLowerCase()));
      // biome-ignore lint/performance/noAwaitInLoops: a name taken this moment by another app is skipped
      if (await createFileAtomic(noteFile(name), text)) {
        return name;
      }
      taken.add(name.toLowerCase());
    }
  }

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

  /**
   * Why a day's thoughts can't change now, or null when they can: they never
   * seal, so any day that has begun takes them.
   */
  function thoughtsLocked(day: DayKey): JournalError | null {
    return day > today(clock) ? { day, kind: "not-writable" } : null;
  }

  /** Why a day's cover or images can't change now, or null when they can. */
  function mediaLocked(
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

  /**
   * Copies a gallery picture into a day's folder as its cover, returning its
   * name. A file already there under that name is someone's, so it's left alone
   * and the day keeps no cover.
   */
  async function giveCover(day: DayKey, cover: SealCover) {
    const name = `cover.${cover.extension}`;
    if (!(await createFileAtomic(dayAsset(day, name), cover.bytes))) {
      return null;
    }
    const stamp = await coverStamp(day, name);
    if (stamp) {
      await flowers.set(day, stamp, cover.color);
    }
    return name;
  }

  /** A day's file as sealed: its end where it was written, a cover if it had none. */
  async function sealText(
    day: DayKey,
    text: string,
    cover: SealCover | null
  ): Promise<Result<string, JournalError>> {
    const file = readDayFile(text);
    if (!file.ok) {
      return file;
    }
    const { meta } = file.value;
    if (meta.sealed) {
      return fail({ kind: "sealed" });
    }
    const given =
      meta.cover === null && cover ? await giveCover(day, cover) : null;
    return sealDayFile(text, {
      cover: given,
      sealed: sealTime(day, meta.tz ?? clock.timeZone()),
    });
  }

  /** Every day with a folder, oldest first, whatever it holds. */
  async function dayFolders(): Promise<DayKey[]> {
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
    return dates
      .flat()
      .filter((day) => day !== null)
      .sort();
  }

  /** A day's thoughts as the screen shows them, or null when it has none. */
  async function readThoughtDay(day: DayKey): Promise<ThoughtDay | null> {
    const text = await readIfThere(thoughtsFile(day));
    if (text === null) {
      return null;
    }
    const thoughts = readThoughtsFile(text);
    if (!thoughts.ok) {
      return { day, state: "unreadable" };
    }
    // A file whose last thought was deleted is kept, but holds none
    return thoughts.value.length > 0
      ? { day, state: "ok", thoughts: thoughts.value }
      : null;
  }

  /** Writes a day's thoughts as given; none on a day without a file leaves no trace. */
  function saveThoughts(
    day: DayKey,
    change: (current: readonly Thought[]) => readonly Thought[]
  ): Promise<Result<Thought[] | null, JournalError>> {
    const path = thoughtsFile(day);
    return queued(path, () =>
      guarded(async () => {
        const locked = thoughtsLocked(day);
        if (locked) {
          return fail(locked);
        }
        const next = changedThoughts(await readIfThere(path), change, {
          app,
          now: clock.now(),
          timeZone: clock.timeZone(),
        });
        if (!next.ok) {
          return next;
        }
        if (next.value === null) {
          return ok(null);
        }
        await writeFileAtomic(path, next.value.text);
        return ok(next.value.thoughts);
      })
    );
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
    /**
     * Copies an image into a day's folder as the next `image-NN.<ext>`, untouched,
     * returning the name the page links to. Names already taken, by Daylily or
     * anyone, are skipped, never written over. Only a day that can still be
     * written takes one.
     */
    addImage(
      day: DayKey,
      bytes: Uint8Array,
      extension: CoverExtension,
      /** Thoughts never seal, so their images go into any day that has begun. */
      owner: "page" | "thoughts" = "page"
    ): Promise<Result<string, JournalError>> {
      const path = owner === "page" ? dayFile(day) : thoughtsFile(day);
      return queued(path, () =>
        guarded(async () => {
          const locked =
            owner === "page"
              ? mediaLocked(day, await readIfThere(path))
              : thoughtsLocked(day);
          if (locked) {
            return fail(locked);
          }
          return copyImageIn(
            inJournal(...dayPath(day).slice(0, 3)),
            bytes,
            extension
          );
        })
      );
    },

    /**
     * Copies an image into `notes/images` as the next `image-NN.<ext>`,
     * returning the path a note links it by, like `images/image-01.jpg`.
     */
    addNoteImage: (
      bytes: Uint8Array,
      extension: CoverExtension
    ): Promise<Result<string, JournalError>> =>
      guarded(async () => {
        const added = await copyImageIn(noteImagesFolder, bytes, extension);
        return added.ok ? ok(`${NOTE_IMAGES_FOLDER}/${added.value}`) : added;
      }),

    /**
     * Adds thoughts after today's, begun now, as when the feature's own notes are
     * given; `make` is told the time they're stamped with.
     */
    addThoughts: (make: (time: string) => readonly Thought[]) =>
      saveThoughts(today(clock), (current) => [
        ...current,
        ...make(thoughtTime(clock.now(), clock.timeZone())),
      ]),
    /** Where a file in a day's folder lives, for showing its cover. */
    dayAsset,

    /** Where a day's page lives, for showing it in the file manager. */
    dayFile,

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
      const listed = await Promise.all(
        (await dayFolders()).map(async (day) => {
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

    /** Every note in the notes folder, in no order; the screen sorts them. */
    async listNotes(): Promise<ListedNote[]> {
      const listed = await Promise.all(
        (await noteNames()).map(async (name): Promise<ListedNote | null> => {
          const path = noteFile(name);
          try {
            const note = await toStoredNote(name, await readFile(path, "utf8"));
            if (!note.ok) {
              return {
                name,
                state: "unreadable",
                updated: await noteUpdated(path, null),
              };
            }
            const { body, ...summary } = note.value;
            return { ...summary, excerpt: pageExcerpt(body), state: "ok" };
          } catch (error) {
            // Gone between listing the folder and reading it, by another app
            if (errorCode(error) === "ENOENT") {
              return null;
            }
            throw error;
          }
        })
      );
      return listed.filter((note) => note !== null);
    },

    /** Where an image on a note lives, for showing it. */
    noteAsset: (name: string) =>
      inJournal(NOTES_FOLDER, NOTE_IMAGES_FOLDER, name),

    /** Where a note lives, for showing it in the file manager or moving it to the Trash. */
    noteFile,

    /** A day's page and fields, or null when nothing was written that day. */
    async readDay(
      day: DayKey
    ): Promise<Result<StoredDay | null, DayFileError>> {
      const text = await readIfThere(dayFile(day));
      return text === null ? ok(null) : toStored(day, text);
    },

    /** A note and its words, under its name as spelled on disk, or null when there's no such note. */
    async readNote(
      name: string
    ): Promise<Result<StoredNote | null, DayFileError>> {
      const text = await readIfThere(noteFile(name));
      return text === null
        ? ok(null)
        : toStoredNote(await spelledOnDisk(name), text);
    },

    /** A day's thoughts, or null when it has none. */
    readThoughts: readThoughtDay,

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
          const locked = mediaLocked(day, await readIfThere(path));
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
     * Seals a day that has ended: the time it ended where it was written, the
     * hash, and `cover` if it had none. Finishes any save still on its way first.
     * A day without a file, or one not over yet, has nothing to seal.
     */
    sealDay(
      day: DayKey,
      cover: SealCover | null
    ): Promise<Result<"sealed" | "nothing", JournalError>> {
      const path = dayFile(day);
      return queued(path, () =>
        guarded(async () => {
          const text = await readIfThere(path);
          if (text === null || !hasEnded(day, clock.now(), clock.timeZone())) {
            return ok("nothing" as const);
          }
          const sealed = await sealText(day, text, cover);
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
     * Days with thoughts, newest first, a few at a time: those before `before`
     * (or from the newest), and where the next few start, or null at the first.
     */
    async thoughtsPage(
      before: DayKey | null,
      limit: number
    ): Promise<ThoughtsPage> {
      const folders = (await dayFolders()).reverse();
      const days: ThoughtDay[] = [];
      let index =
        before === null ? 0 : folders.findIndex((day) => day < before);
      if (index === -1) {
        return { days, next: null };
      }
      for (; index < folders.length && days.length < limit; index += 1) {
        const day = folders[index];
        // biome-ignore lint/performance/noAwaitInLoops: read until enough days have thoughts
        const found = day ? await readThoughtDay(day) : null;
        if (found) {
          days.push(found);
        }
      }
      const last = days.at(-1);
      const more = folders.slice(index).length > 0;
      return { days, next: more && last ? last.day : null };
    },

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

    /**
     * Saves a note: a new one (`name` null) under a free name from its title,
     * starting the notes folder, or nothing while it's empty; one that exists where it is, or under a name
     * from its title when `rename` asks, once its title has settled. Notes never
     * seal. A file that can't be read is never written over.
     */
    writeNote(
      name: string | null,
      note: NoteContent,
      { rename: renaming = false }: { rename?: boolean } = {}
    ): Promise<Result<StoredNote | null, JournalError>> {
      // One queue for every note: a rename looks at the names the others hold
      return queued(notesFolder, () =>
        guarded(async () => {
          // A new note with nothing in it leaves no trace
          if (
            name === null &&
            note.title.trim() === "" &&
            note.body.trim() === ""
          ) {
            return ok(null);
          }
          const existing =
            name === null ? null : await readIfThere(noteFile(name));
          const text = writeNoteFile(existing, note, {
            app,
            now: clock.now(),
            timeZone: clock.timeZone(),
          });
          if (!text.ok) {
            return text;
          }
          const saved =
            name === null
              ? await createNote(note.title, text.value)
              : await saveExisting(name, text.value, renaming && note.title);
          return toStoredNote(saved, text.value);
        })
      );
    },

    /** Saves a day's thoughts, in the order written; any day that has begun takes them. */
    writeThoughts: (day: DayKey, thoughts: readonly Thought[]) =>
      saveThoughts(day, () => thoughts),
  };
}

export type Journal = ReturnType<typeof createJournal>;
