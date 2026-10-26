import { Document, isMap, isScalar, parseDocument } from "yaml";
import { z } from "zod";
import { fail, ok, type Result } from "./result";
import { countMarkdownWords } from "./words";
import { isoWithOffset, isTimeZone } from "./zone";

/**
 * What Daylily reads from a day's frontmatter. A field that is missing, or that
 * another tool wrote in a shape we can't use, reads as empty.
 */
export interface DayMeta {
  /** A file in the day's folder, like `cover.jpg`. */
  cover: string | null;
  created: string | null;
  hash: string | null;
  sealed: string | null;
  title: string;
  /** The IANA zone the day was written in. */
  tz: string | null;
  updated: string | null;
  words: number | null;
}

export interface DayFile {
  /** The page's markdown, as written after the frontmatter. */
  body: string;
  meta: DayMeta;
}

export type DayFileError =
  /** The frontmatter is there but isn't readable YAML, or isn't a set of fields. */
  | { kind: "malformed"; message: string }
  /** A sealed day is never rewritten. */
  | { kind: "sealed" };

/** The fields Daylily writes, in the order a new file lists them. */
const FIELDS = [
  "title",
  "cover",
  "created",
  "updated",
  "tz",
  "words",
  "sealed",
  "hash",
  "app",
] as const;
type Field = (typeof FIELDS)[number];

/** A value to write, or null to remove the field. */
export type FrontmatterChanges = Partial<Record<Field, string | number | null>>;

// A bare file name: the cover lives in the day's own folder, never elsewhere
const FILE_NAME = /^(?!\.{1,2}$)[^/\\:\0]+$/;
const HASH = /^sha256:[0-9a-f]{64}$/;

const instant = z.iso.datetime({ offset: true }).nullable().catch(null);

const metaSchema = z.object({
  cover: z.string().regex(FILE_NAME).nullable().catch(null),
  created: instant,
  hash: z.string().regex(HASH).nullable().catch(null),
  sealed: instant,
  // A title like 1984 reads as a number in YAML
  title: z
    .union([z.string(), z.number(), z.boolean()])
    .transform(String)
    .catch(""),
  tz: z.string().refine(isTimeZone).nullable().catch(null),
  updated: instant,
  words: z.int().nonnegative().nullable().catch(null),
});

const BOM = "﻿";
const OPEN = /^---[ \t]*$/;
const CLOSE = /^(?:---|\.\.\.)[ \t]*$/;
const LEADING_BLANK_LINES = /^(?:[ \t]*\r?\n)+/;
const LINE_BREAK = /\r?\n/g;
const TRAILING_CR = /\r$/;

interface Parts {
  /** Everything after the frontmatter, byte for byte. */
  body: string;
  bom: string;
  eol: "\n" | "\r\n";
  /** The YAML between the fences, or null when the file has none. */
  frontmatter: string | null;
}

/** Splits off the frontmatter. A file without a closing fence has none: its first line is a rule. */
function split(text: string): Parts {
  const bom = text.startsWith(BOM) ? BOM : "";
  const rest = text.slice(bom.length);
  const firstBreak = rest.indexOf("\n");
  const eol = rest[firstBreak - 1] === "\r" ? "\r\n" : "\n";
  const none: Parts = { body: rest, bom, eol, frontmatter: null };
  const firstLine = firstBreak === -1 ? rest : rest.slice(0, firstBreak);
  if (firstBreak === -1 || !OPEN.test(firstLine.replace(TRAILING_CR, ""))) {
    return none;
  }

  let start = firstBreak + 1;
  while (start <= rest.length) {
    const lineBreak = rest.indexOf("\n", start);
    const end = lineBreak === -1 ? rest.length : lineBreak;
    if (CLOSE.test(rest.slice(start, end).replace(TRAILING_CR, ""))) {
      return {
        body: lineBreak === -1 ? "" : rest.slice(lineBreak + 1),
        bom,
        eol,
        frontmatter: rest.slice(firstBreak + 1, start),
      };
    }
    start = end + 1;
  }
  return none;
}

function parseFrontmatter(
  source: string | null
): Result<Document, DayFileError> {
  if (source === null) {
    return ok(new Document({}));
  }
  // Widened from the parsed type so empty frontmatter can be given a map
  const doc: Document = parseDocument(source);
  const [error] = doc.errors;
  if (error) {
    return fail({ kind: "malformed", message: error.message });
  }
  if (doc.contents === null) {
    doc.contents = doc.createNode({});
  }
  if (!isMap(doc.contents)) {
    return fail({
      kind: "malformed",
      message: "The frontmatter is not a set of fields",
    });
  }
  return ok(doc);
}

function readMeta(doc: Document): Result<DayMeta, DayFileError> {
  try {
    return ok(metaSchema.parse(doc.toJS()));
  } catch (error) {
    // toJS throws on YAML that parses but can't be resolved, like too many aliases
    return fail({ kind: "malformed", message: String(error) });
  }
}

/** Reads a day's markdown file: its frontmatter fields and its page. */
export function readDayFile(text: string): Result<DayFile, DayFileError> {
  const parts = split(text);
  const doc = parseFrontmatter(parts.frontmatter);
  if (!doc.ok) {
    return doc;
  }
  const meta = readMeta(doc.value);
  if (!meta.ok) {
    return meta;
  }
  return ok({
    body: parts.body.replace(LEADING_BLANK_LINES, ""),
    meta: meta.value,
  });
}

/**
 * Sets a field, and puts a new one where the spec lists it: before the first of
 * Daylily's fields that follows it, so a title added after the first words still
 * sits on top. Fields other tools added keep their places.
 */
function place(doc: Document, field: Field, value: string | number) {
  const map = doc.contents;
  if (!isMap(map) || doc.has(field)) {
    doc.set(field, value);
    return;
  }
  const later: readonly string[] = FIELDS.slice(FIELDS.indexOf(field) + 1);
  const next = map.items.findIndex(
    (item) => isScalar(item.key) && later.includes(String(item.key.value))
  );
  const pair = doc.createPair(field, value);
  if (next === -1) {
    map.items.push(pair);
  } else {
    map.items.splice(next, 0, pair);
  }
}

function rewrite(
  text: string,
  changes: FrontmatterChanges,
  body?: string
): Result<string, DayFileError> {
  const parts = split(text);
  const parsed = parseFrontmatter(parts.frontmatter);
  if (!parsed.ok) {
    return parsed;
  }
  const doc = parsed.value;
  for (const field of FIELDS) {
    const value = changes[field];
    if (value === null) {
      doc.delete(field);
    } else if (value !== undefined) {
      place(doc, field, value);
    }
  }

  const { bom, eol } = parts;
  // Long titles stay on one line rather than folding
  const yaml = doc.toString({ lineWidth: 0 }).replace(LINE_BREAK, eol);
  let after = parts.body;
  if (body !== undefined) {
    const page = body.trim().replace(LINE_BREAK, eol);
    after = page === "" ? "" : `${eol}${page}${eol}`;
  } else if (parts.frontmatter === null && after !== "") {
    after = `${eol}${after}`;
  }
  return ok(`${bom}---${eol}${yaml}---${eol}${after}`);
}

/**
 * Changes frontmatter fields and leaves everything else exactly as written:
 * other fields, comments and the page itself.
 */
export function updateFrontmatter(text: string, changes: FrontmatterChanges) {
  return rewrite(text, changes);
}

/**
 * Changes frontmatter fields and puts `body` after them, keeping other fields,
 * comments, the BOM and line endings as written. For files beside the page,
 * like the day's thoughts.
 */
export function rewriteFile(
  text: string,
  changes: FrontmatterChanges,
  body: string
) {
  return rewrite(text, changes, body);
}

export interface PageContent {
  /** The page's markdown. */
  body: string;
  /** A file in the day's folder, or null for none yet. */
  cover: string | null;
  title: string;
}

export interface WriteStamp {
  /** Who wrote it, like `daylily/0.1.0`. */
  app: string;
  now: Date;
  /** The device's current zone. */
  timeZone: string;
}

/**
 * Today's file after a save: the page, its title and cover, the word count and
 * times, keeping any fields other tools added. `existing` is the file as it is
 * on disk, or null for the day's first save. A sealed day is refused.
 */
export function writeDayFile(
  existing: string | null,
  page: PageContent,
  stamp: WriteStamp
): Result<string, DayFileError> {
  let meta: DayMeta | null = null;
  if (existing !== null) {
    const day = readDayFile(existing);
    if (!day.ok) {
      return day;
    }
    ({ meta } = day.value);
  }
  if (meta?.sealed) {
    return fail({ kind: "sealed" });
  }

  const now = isoWithOffset(stamp.now, stamp.timeZone);
  const title = page.title.trim();
  return rewrite(
    existing ?? "",
    {
      app: stamp.app,
      cover: page.cover,
      created: meta?.created ?? now,
      title: title === "" ? null : title,
      // Where it was first written, so history stays honest across travel
      tz: meta?.tz ?? stamp.timeZone,
      updated: now,
      words: countMarkdownWords(page.body),
    },
    page.body
  );
}
