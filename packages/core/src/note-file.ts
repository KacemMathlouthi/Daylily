import { z } from "zod";
import { type DayFileError, readFrontmatter, rewriteFile } from "./day-file";
import { ok, type Result } from "./result";
import { isoWithOffset } from "./zone";

/** The folder notes are kept in, at the top of the journal. */
export const NOTES_FOLDER = "notes";

/** Where images on notes go, inside the notes folder, shared by every note. */
export const NOTE_IMAGES_FOLDER = "images";

/** What a note holds: a title, its words as markdown, and whether it's pinned. */
export interface NoteContent {
  body: string;
  pinned: boolean;
  title: string;
}

export interface NoteFile extends NoteContent {
  created: string | null;
  updated: string | null;
}

const instant = z.iso.datetime({ offset: true }).nullable().catch(null);

const fieldsSchema = z.object({
  created: instant,
  pinned: z.boolean().catch(false),
  // A title like 1984 reads as a number in YAML; absent, it's null
  title: z
    .union([z.string(), z.number(), z.boolean()])
    .transform(String)
    .nullable()
    .catch(null),
  updated: instant,
});

const MARKDOWN = /\.md$/i;
/** What a file name can't hold on some system, and quotes, which only get in the way. */
const UNSAFE = /[<>:"/\\|?*'‘’“”\p{Cc}]/gu;
const SEPARATORS = /[\s-]+/g;
const EDGES = /^[-.]+|[-.]+$/g;
/** Names Windows keeps for devices, whatever follows them after a dot. */
const RESERVED = /^(?:con|prn|aux|nul|com\d|lpt\d)(?:\.|$)/i;
/** Long enough for any title someone reads at a glance. */
const MAX_STEM = 80;
/**
 * Most systems allow 255 bytes in a name; this leaves room for a number and
 * `.md`, and for the temp name a save writes beside it.
 */
const MAX_STEM_BYTES = 180;
const utf8 = new TextEncoder();
const BEFORE_DOT = /^[^.]*/;
const NOTE_NAME = /^(?![.])[^<>:"/\\|?*\p{Cc}]{1,250}\.md$/iu;

/**
 * Whether `name` is a note's file: markdown, directly in the notes folder, not
 * hidden, and not a name Windows keeps for a device.
 */
export function isNoteName(name: string) {
  return NOTE_NAME.test(name) && !RESERVED.test(name);
}

/** As much of `stem` as fits in `MAX_STEM_BYTES`, never splitting a character. */
function fitting(stem: string) {
  let kept = "";
  for (const character of [...stem].slice(0, MAX_STEM)) {
    if (utf8.encode(kept + character).length > MAX_STEM_BYTES) {
      break;
    }
    kept += character;
  }
  return kept;
}

/**
 * Reads a note's file. Its title is the frontmatter's; a file written in another
 * app without one is titled by its name.
 */
export function readNoteFile(
  text: string,
  name: string
): Result<NoteFile, DayFileError> {
  const file = readFrontmatter(text);
  if (!file.ok) {
    return file;
  }
  const fields = fieldsSchema.parse(file.value.fields);
  return ok({
    body: file.value.body,
    created: fields.created,
    pinned: fields.pinned,
    title: fields.title ?? name.replace(MARKDOWN, ""),
    updated: fields.updated,
  });
}

export interface NoteStamp {
  /** Who wrote it, like `daylily/0.9.0`. */
  app: string;
  now: Date;
  /** The device's current zone. */
  timeZone: string;
}

/**
 * A note's file after a save, keeping fields other tools added. An empty title
 * is still written, so the note isn't titled by its file's name; `pinned` is
 * there only while it's pinned. `existing` is the file on disk, or null for a
 * new note.
 */
export function writeNoteFile(
  existing: string | null,
  note: NoteContent,
  stamp: NoteStamp
): Result<string, DayFileError> {
  let created: string | null = null;
  if (existing !== null) {
    const file = readFrontmatter(existing);
    if (!file.ok) {
      return file;
    }
    ({ created } = fieldsSchema.parse(file.value.fields));
  }
  const now = isoWithOffset(stamp.now, stamp.timeZone);
  return rewriteFile(
    existing ?? "",
    {
      app: stamp.app,
      created: created ?? now,
      pinned: note.pinned ? true : null,
      title: note.title.trim(),
      updated: now,
    },
    note.body
  );
}

/**
 * The name a note's file takes from its title, readable in any file manager:
 * `Books to read` is `books-to-read`. Safe on every system; `untitled` when
 * nothing is left of the title.
 */
export function noteStem(title: string) {
  const stem = title
    .normalize("NFC")
    .toLowerCase()
    .replace(UNSAFE, "")
    .replace(SEPARATORS, "-")
    .replace(EDGES, "");
  const short = fitting(stem).replace(EDGES, "");
  if (short === "") {
    return "untitled";
  }
  // A device's name, even before a dot (`con.txt`), takes a word after it
  return RESERVED.test(short) ? short.replace(BEFORE_DOT, "$&-note") : short;
}

/**
 * A free file name for a note titled `title`: `books-to-read.md`, then
 * `books-to-read-2.md` and on while `taken` says the name is in use.
 */
export function noteFileName(title: string, taken: (name: string) => boolean) {
  const stem = noteStem(title);
  for (let number = 1; ; number += 1) {
    const name = number === 1 ? `${stem}.md` : `${stem}-${number}.md`;
    if (!taken(name)) {
      return name;
    }
  }
}
