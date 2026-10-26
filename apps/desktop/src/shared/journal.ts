import type { DayKey } from "@daylily/core/day";
import type { DayFileError } from "@daylily/core/day-file";
import type { FlowerColor } from "@daylily/core/flower";
import type { Snippet } from "@daylily/core/search-text";
import type { Thought } from "@daylily/core/thoughts-file";

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

/** A day's thoughts, in the order written; a file that can't be read is shown, never rewritten. */
export type ThoughtDay =
  | { day: DayKey; state: "ok"; thoughts: Thought[] }
  | { day: DayKey; state: "unreadable" };

/** A few days of thoughts, newest first, and the day the next few come before. */
export interface ThoughtsPage {
  days: ThoughtDay[];
  /** Null once the earliest day with thoughts is in. */
  next: DayKey | null;
}

/** How many days of thoughts come at a time, as the screen scrolls back. */
export const THOUGHT_DAYS_PER_PAGE = 14;

/**
 * Enough for anyone to find a day; more is a list nobody reads. Search returns
 * one more, so the list can say there were more.
 */
export const MAX_SEARCH_HITS = 50;

/** The longest search: the field stops there, and the main process refuses more. */
export const MAX_QUERY_LENGTH = 200;

/** A day that holds what was searched for, with a line of it to show. */
export interface DayHit {
  color: FlowerColor | null;
  cover: string | null;
  day: DayKey;
  /** Unique among the results: the day itself. */
  id: string;
  kind: "day";
  /** The page around the first match, with the matches marked. */
  snippet: Snippet;
  state: DaySummary["state"];
  title: string;
}

/** A thought that holds what was searched for. */
export interface ThoughtHit {
  day: DayKey;
  /** Unique among the results: the day and where the thought sits in it. */
  id: string;
  /** Its place among the day's thoughts, in the order written. */
  index: number;
  kind: "thought";
  /** The thought around the first match, with the matches marked. */
  snippet: Snippet;
  /** `HH:MM`, or null for text above a day's first thought. */
  time: string | null;
}

/** Days and thoughts found together, best match first. */
export type SearchHit = DayHit | ThoughtHit;

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

/** Larger than any photo a phone takes: the most a cover or an image on the page may weigh. */
export const MAX_IMAGE_BYTES = 30 * 1024 * 1024;

/** Why an image couldn't be added to the page. */
export type ImageError =
  | JournalError
  /** Not a JPEG, PNG, GIF, WebP or AVIF; `heic` when it's an iPhone photo. */
  | { kind: "not-an-image"; heic: boolean };

/** The name a day's cover is copied in as. */
export const COVER_NAME = new RegExp(
  `^cover\\.(${COVER_EXTENSIONS.join("|")})$`
);

/** The longest name Daylily keeps for the person who writes. */
export const MAX_NAME_LENGTH = 60;

/** A reminder time, `HH:MM` on a 24-hour clock. */
export const REMINDER_TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/** The journal's preferences, kept in `.daylily/config.json` so they travel with it. */
export interface JournalConfig {
  /** Whether a day sealed without a cover gets one from the gallery. */
  galleryCovers: boolean;
  ghostPrompts: boolean;
  /** What Daylily calls the person who writes, or null for the computer's name for them. */
  name: string | null;
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

/** A folder offered as the journal while choosing one, as onboarding does. */
export interface FolderInfo {
  /** Its preferences: its own if it's a journal already, a new journal's otherwise. */
  config: JournalConfig;
  /** The days already written there; none for a new journal. */
  days: number;
  /** The folder, with the home folder as `~`. */
  displayPath: string;
  path: string;
  /** Whether Daylily can make and write files there. */
  writable: boolean;
}

/** What this computer remembers about the app, rather than the journal. */
export interface DeviceState {
  /** Whether onboarding has been through on this computer. */
  onboarded: boolean;
  sidebarOpen: boolean;
  /** A theme, or to follow the system's. */
  theme: "light" | "dark" | "system";
}

const IMAGE_TYPES = `\\.(?:${COVER_EXTENSIONS.join("|")})$`;

/** An image Daylily added to the page, `image-01.jpg` to `image-999.png`, its number captured. */
export const PAGE_IMAGE_NAME = new RegExp(`^image-(\\d{2,3})${IMAGE_TYPES}`);

/** The only files the page may load from a day's folder: its cover and its images. */
export const DAY_ASSET_NAME = new RegExp(
  `^cover${IMAGE_TYPES}|${PAGE_IMAGE_NAME.source}`
);

/** The scheme the page loads a day's images through; nothing else in the journal is served. */
export const JOURNAL_SCHEME = "daylily-journal";

/** Where the page finds a file in a day's folder, like its cover. */
export function journalAssetUrl(day: string, name: string) {
  return `${JOURNAL_SCHEME}://day/${day}/${encodeURIComponent(name)}`;
}
