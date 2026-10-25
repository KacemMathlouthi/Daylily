import type { PageContent } from "@daylily/core/day-file";
import type { FlowerColor } from "@daylily/core/flower";
import type { Result } from "@daylily/core/result";
import type {
  CoverExtension,
  DeviceState,
  FolderInfo,
  ImageError,
  JournalConfig,
  JournalError,
  JournalInfo,
  ListedDay,
  SearchHit,
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
  appOpenToday: "app:open-today",
  appOpenWelcome: "app:open-welcome",
  appReady: "app:ready",
  deviceGet: "device:get",
  deviceSet: "device:set",
  journalAddImage: "journal:add-image",
  journalChange: "journal:change",
  journalChanged: "journal:changed",
  journalFlowerColor: "journal:flower-color",
  journalFolder: "journal:folder",
  journalInfo: "journal:info",
  journalList: "journal:list",
  journalPickCover: "journal:pick-cover",
  journalPickFolder: "journal:pick-folder",
  journalRead: "journal:read",
  journalSaveCover: "journal:save-cover",
  journalSearch: "journal:search",
  journalSetConfig: "journal:set-config",
  journalShow: "journal:show",
  journalStats: "journal:stats",
  journalSwitched: "journal:switched",
  journalUse: "journal:use",
  journalWrite: "journal:write",
  saveGardenImage: "garden:save-image",
  updatesChanged: "updates:changed",
  updatesCheck: "updates:check",
  updatesDismiss: "updates:dismiss",
  updatesInstall: "updates:install",
  updatesState: "updates:state",
  windowAction: "window:action",
  windowMaximized: "window:maximized",
  windowMaximizedChanged: "window:maximized-changed",
} as const;

export interface AppInfo {
  platform: string;
  /** A first name from the OS account, for greetings; null when it doesn't read as one. */
  userName: string | null;
  version: string;
}

/** Where to send someone whose copy can't replace itself: the website's stable download links. */
export type UpdateDownload = "deb" | "mac" | "mac-intel";

/**
 * Where updating stands. `ready` and `available` both mean a new version: the
 * first has downloaded and installs on quit (Windows, the AppImage); the second
 * is for copies that can't replace themselves (macOS until it's signed, the
 * Debian package) and points to the download. `dismissed` hides the sidebar's
 * card for that version.
 */
export type UpdateState =
  | { status: "off" }
  | { status: "idle" }
  | { status: "checking" }
  | { status: "latest"; checkedAt: string }
  | { status: "downloading"; percent: number; version: string }
  | { status: "ready"; dismissed: boolean; version: string }
  | {
      status: "available";
      dismissed: boolean;
      download: UpdateDownload;
      version: string;
    }
  /** `offline` when the computer had no connection, the one cause worth naming. */
  | { offline: boolean; status: "error" };

/** Fields to change; any left out, or undefined, stay as they are. */
type Changes<T> = { [K in keyof T]?: T[K] | undefined };

export type JournalConfigChanges = Changes<Omit<JournalConfig, "reminder">> & {
  reminder?: Changes<JournalConfig["reminder"]> | undefined;
};

/** What the title strip asks of the window: its controls, and the Edit and View menus. */
export const WINDOW_ACTIONS = [
  "minimize",
  "toggle-maximize",
  "close",
  "quit",
  "undo",
  "redo",
  "cut",
  "copy",
  "paste",
  "selectAll",
  "zoom-in",
  "zoom-out",
  "zoom-reset",
] as const;
export type WindowAction = (typeof WINDOW_ACTIONS)[number];

/** What the preload exposes to the renderer as `window.daylily`. */
export interface DaylilyApi {
  app: {
    info: () => Promise<AppInfo>;
    /**
     * Runs `save` when the app is about to close or the computer to sleep, so
     * nothing unsaved is lost; the window waits for it, up to a few seconds.
     */
    onFlush: (save: () => Promise<void>) => void;
    /** Calls `listener` when the app is asked to open today's page, as from the reminder. Returns a way to stop. */
    onOpenToday: (listener: () => void) => () => void;
    /** Calls `listener` when Help › Welcome to Daylily is chosen from the native menu. Returns a way to stop. */
    onOpenWelcome: (listener: () => void) => () => void;
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
    /**
     * Copies a pasted or dropped image into today's folder, untouched, as the
     * next `image-NN.<ext>`; the name it returns goes in the page. What the file
     * is comes from its bytes, not its name.
     */
    addImage: (
      day: string,
      image: Uint8Array
    ) => Promise<Result<string, ImageError>>;
    /** Keeps the flower colour sampled from a day's cover, stamped with the cover file it came from. */
    flowerColor: (
      day: string,
      stamp: string,
      color: FlowerColor
    ) => Promise<void>;
    /**
     * Asks for another folder and moves the journal there: Daylily reads from the
     * new place, and nothing in the old one moves or goes. False if cancelled.
     */
    change: () => Promise<boolean>;
    /** The folder the journal is in now, as a choice: its days, whether it can be written, its preferences. */
    folder: () => Promise<FolderInfo>;
    /** Asks for a folder, without moving to it: null if cancelled. */
    pickFolder: () => Promise<FolderInfo | null>;
    /**
     * Moves the journal to a folder offered by `folder` or `pickFolder`, as
     * `change` does; any other path is refused. Staying put does nothing.
     */
    use: (path: string) => Promise<void>;
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
    /**
     * Copies a cover into the day's folder; the name it returns goes in the next
     * save. A gallery cover passes its set flower colour.
     */
    saveCover: (
      day: string,
      image: Uint8Array,
      extension: CoverExtension,
      color?: FlowerColor
    ) => Promise<Result<string, JournalError>>;
    /**
     * Days whose title or page holds every word of `query`: by a word's start,
     * short words whole, accents ignored, one typo forgiven in long words. Best
     * first, up to `MAX_SEARCH_HITS` and one more to tell there were more. Each
     * comes with a line of its page around the first match, or the page's start
     * when only the title matched. Searched on this computer only.
     */
    search: (query: string) => Promise<SearchHit[]>;
    /** Calls `listener` when the journal moves to another folder. Returns a way to stop. */
    onSwitch: (listener: () => void) => () => void;
    setConfig: (changes: JournalConfigChanges) => Promise<JournalConfig>;
    /** Opens the journal folder in the system's file manager, or shows a day's file in it. */
    show: (day?: string) => Promise<void>;
    /** How much the journal takes on disk. */
    stats: () => Promise<{ bytes: number }>;
    /** Saves a day's page. Null when an empty page left nothing to save. */
    write: (
      day: string,
      page: PageContent
    ) => Promise<Result<StoredDay | null, JournalError>>;
  };
  /** The OS, available synchronously for layout (macOS keeps its traffic lights). */
  platform: string;
  /** New versions of Daylily, looked for at launch and every few hours. */
  updates: {
    /** Looks now, unless a look or a download is already under way. */
    check: () => Promise<void>;
    /** Hides the sidebar's card until a newer version comes. */
    dismiss: () => Promise<void>;
    /** Saves every page, then quits and installs the downloaded version. */
    install: () => Promise<void>;
    /** Calls `listener` whenever the state changes. Returns a way to stop. */
    onChange: (listener: (state: UpdateState) => void) => () => void;
    state: () => Promise<UpdateState>;
  };
  /**
   * The window itself, for the title strip Daylily draws on Windows and Linux.
   * `onMaximizedChange` returns a way to stop listening.
   */
  window: {
    act: (action: WindowAction) => Promise<void>;
    isMaximized: () => Promise<boolean>;
    onMaximizedChange: (listener: (maximized: boolean) => void) => () => void;
  };
}
