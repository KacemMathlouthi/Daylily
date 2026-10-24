import type { PageContent } from "@daylily/core/day-file";
import type { FlowerColor } from "@daylily/core/flower";
import type { Result } from "@daylily/core/result";
import type {
  CoverExtension,
  DeviceState,
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
  appFlush: "app:flush",
  appFlushed: "app:flushed",
  appInfo: "app:info",
  appReady: "app:ready",
  deviceGet: "device:get",
  deviceSet: "device:set",
  journalChanged: "journal:changed",
  journalFlowerColor: "journal:flower-color",
  journalInfo: "journal:info",
  journalList: "journal:list",
  journalPickCover: "journal:pick-cover",
  journalRead: "journal:read",
  journalSaveCover: "journal:save-cover",
  journalSetConfig: "journal:set-config",
  journalWrite: "journal:write",
  saveGardenImage: "garden:save-image",
} as const;

export interface AppInfo {
  platform: string;
  /** A first name from the OS account, for greetings; null when it doesn't read as one. */
  userName: string | null;
  version: string;
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
    /**
     * Runs `save` when the app is about to close or the computer to sleep, so
     * nothing unsaved is lost; the window waits for it, up to a few seconds.
     */
    onFlush: (save: () => Promise<void>) => void;
    /** Tells the main process the app has painted, so the splash can hand over. */
    ready: () => void;
  };
  /**
   * What this computer remembers, such as the theme: read from the main process
   * as the page starts, so it never waits on its own storage, and saved through here.
   */
  device: {
    initial: DeviceState;
    set: (changes: Partial<DeviceState>) => Promise<void>;
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
    /** Keeps the flower colour sampled from a day's cover, stamped with the cover file it came from. */
    flowerColor: (
      day: string,
      stamp: string,
      color: FlowerColor
    ) => Promise<void>;
    info: () => Promise<JournalInfo>;
    /** Every written day, oldest first. */
    list: () => Promise<ListedDay[]>;
    /** Calls `listener` with the days that changed on disk, by any app. Returns a way to stop. */
    onChange: (listener: (days: string[]) => void) => () => void;
    /**
     * Opens the system's picker for one image and copies it into the day's folder.
     * Null if cancelled; otherwise the cover's name, for the next save.
     */
    pickCover: (day: string) => Promise<Result<string, JournalError> | null>;
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
