import type { PageContent } from "@daylily/core/day-file";
import type { Result } from "@daylily/core/result";
import type {
  CoverExtension,
  JournalConfig,
  JournalError,
  JournalInfo,
  ListedDay,
  StoredDay,
} from "./journal";

/**
 * The IPC contract between the renderer and the main process. Channel names and
 * result types live here; their schemas live in `schemas.ts` so the sandboxed
 * preload stays free of runtime dependencies.
 */
export const CHANNELS = {
  appInfo: "app:info",
  appReady: "app:ready",
  journalChanged: "journal:changed",
  journalInfo: "journal:info",
  journalList: "journal:list",
  journalRead: "journal:read",
  journalSaveCover: "journal:save-cover",
  journalSetConfig: "journal:set-config",
  journalWrite: "journal:write",
  pickCover: "cover:pick",
  saveGardenImage: "garden:save-image",
} as const;

export interface AppInfo {
  platform: string;
  /** A first name from the OS account, for greetings; null when it doesn't read as one. */
  userName: string | null;
  version: string;
}

/** An image chosen from the computer, held in memory until days are saved as files. */
export interface PickedImage {
  /** The image itself, as a data: URL the page can show. */
  dataUrl: string;
  /** The file's name, for display. */
  name: string;
}

/** Fields to change; any left out, or undefined, stay as they are. */
type Changes<T> = { [K in keyof T]?: T[K] | undefined };

export type JournalConfigChanges = Changes<Omit<JournalConfig, "reminder">> & {
  reminder?: Changes<JournalConfig["reminder"]> | undefined;
};

/** What the preload exposes to the renderer as `window.daylily`. */
export interface DaylilyApi {
  app: {
    info: () => Promise<AppInfo>;
    /** Tells the main process the app has painted, so the splash can hand over. */
    ready: () => void;
  };
  cover: {
    /** Opens the system's file picker for one image. Null if cancelled. */
    pick: () => Promise<PickedImage | null>;
  };
  garden: {
    /** Asks where to save, then writes the garden's share card. False if cancelled. */
    saveImage: (png: Uint8Array, name: string) => Promise<boolean>;
  };
  /**
   * The journal folder. Days are `YYYY-MM-DD`; the main process checks every
   * one, and writes only today, or a day that ended and hasn't sealed yet.
   */
  journal: {
    info: () => Promise<JournalInfo>;
    /** Every written day, oldest first. */
    list: () => Promise<ListedDay[]>;
    /** Calls `listener` with the days that changed on disk, by any app. Returns a way to stop. */
    onChange: (listener: (days: string[]) => void) => () => void;
    /** A day's page and fields, or null when nothing was written. */
    read: (day: string) => Promise<Result<StoredDay | null, JournalError>>;
    /** Copies a cover into the day's folder; the name it returns goes in the next save. */
    saveCover: (
      day: string,
      image: Uint8Array,
      extension: CoverExtension
    ) => Promise<Result<string, JournalError>>;
    setConfig: (changes: JournalConfigChanges) => Promise<JournalConfig>;
    /** Saves a day's page. Null when an empty page left nothing to save. */
    write: (
      day: string,
      page: PageContent
    ) => Promise<Result<StoredDay | null, JournalError>>;
  };
  /** The OS, available synchronously for layout (macOS keeps its traffic lights). */
  platform: string;
}
