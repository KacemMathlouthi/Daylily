/**
 * The IPC contract between the renderer and the main process. Channel names and
 * result types live here; their schemas live in `schemas.ts` so the sandboxed
 * preload stays free of runtime dependencies.
 */
export const CHANNELS = {
  appInfo: "app:info",
  appReady: "app:ready",
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
  /** The OS, available synchronously for layout (macOS keeps its traffic lights). */
  platform: string;
}
