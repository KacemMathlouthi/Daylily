import type { DayKey } from "@daylily/core/day";
import type { DayFileError } from "@daylily/core/day-file";
import type { FlowerColor } from "@daylily/core/flower";

/** A day as the calendar and garden need it, without its page. */
interface DaySummary {
  /** The flower's colour, sampled from the cover; null until it has been. */
  color: FlowerColor | null;
  /** A file in the day's folder, shown through `journalAssetUrl`. */
  cover: string | null;
  /** Which version of the cover file this is, for caching what's sampled from it. */
  coverStamp: string | null;
  day: DayKey;
  /** The page's opening words, for cards that quote the day. */
  excerpt: string;
  /** The hour writing began where it was written, 0 to 23; null if unknown. */
  hour: number | null;
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

/** The name a day's cover is copied in as. */
export const COVER_NAME = new RegExp(
  `^cover\\.(${COVER_EXTENSIONS.join("|")})$`
);

/** A reminder time, `HH:MM` on a 24-hour clock. */
export const REMINDER_TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

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
  /** The journal folder, with the home folder as `~`, for showing where things are. */
  displayRoot: string;
  /** The journal folder, for Settings. */
  root: string;
  /** This system's path separator, for showing paths the way it writes them. */
  separator: string;
}

/** What this computer remembers about the app, rather than the journal. */
export interface DeviceState {
  sidebarOpen: boolean;
  /** A theme, or to follow the system's. */
  theme: "light" | "dark" | "system";
}

/** The scheme the page loads a day's images through; nothing else in the journal is served. */
export const JOURNAL_SCHEME = "daylily-journal";

/** Where the page finds a file in a day's folder, like its cover. */
export function journalAssetUrl(day: string, name: string) {
  return `${JOURNAL_SCHEME}://day/${day}/${encodeURIComponent(name)}`;
}
