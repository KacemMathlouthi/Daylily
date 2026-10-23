import type { DayKey } from "@daylily/core/day";
import type { DayFileError } from "@daylily/core/day-file";

/** A day as the calendar and garden need it, without its page. */
export interface DaySummary {
  /** A file in the day's folder, shown through `journalAssetUrl`. */
  cover: string | null;
  day: DayKey;
  /** Open while it can still be written; edited when its seal no longer matches. */
  state: "open" | "sealed" | "edited";
  title: string;
  words: number;
}

export interface StoredDay extends DaySummary {
  body: string;
}

/** A day whose file is there but whose frontmatter can't be read. Shown, never rewritten. */
export interface UnreadableDay {
  day: DayKey;
  state: "unreadable";
}

export type ListedDay = DaySummary | UnreadableDay;

export type JournalError =
  | DayFileError
  /** Only today is written, or a day that ended and hasn't sealed yet. */
  | { kind: "not-writable"; day: DayKey }
  /** The disk said no: full, read-only, permissions. */
  | { kind: "io"; code: string };

/** The image types a cover may be, by extension. */
export const COVER_EXTENSIONS = [
  "avif",
  "gif",
  "jpeg",
  "jpg",
  "png",
  "webp",
] as const;
export type CoverExtension = (typeof COVER_EXTENSIONS)[number];

/** The journal's preferences, kept in `.daylily/config.json` so they travel with it. */
export interface JournalConfig {
  /** Whether a day sealed without a cover gets one from the gallery. */
  galleryCovers: boolean;
  ghostPrompts: boolean;
  reminder: {
    enabled: boolean;
    /** Local time, `HH:MM`. */
    time: string;
  };
}

export interface JournalInfo {
  config: JournalConfig;
  /** The journal folder, for Settings. */
  root: string;
}

/** The scheme the page loads a day's images through; nothing else in the journal is served. */
export const JOURNAL_SCHEME = "daylily-journal";

/** Where the page finds a file in a day's folder, like its cover. */
export function journalAssetUrl(day: DayKey, name: string) {
  return `${JOURNAL_SCHEME}://day/${day}/${encodeURIComponent(name)}`;
}
