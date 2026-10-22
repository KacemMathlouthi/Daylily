/**
 * The IPC contract between the renderer and the main process. Channel names and
 * result types live here; their schemas live in `schemas.ts` so the sandboxed
 * preload stays free of runtime dependencies.
 */
export const CHANNELS = {
  appInfo: "app:info",
  saveGardenImage: "garden:save-image",
} as const;

export interface AppInfo {
  platform: string;
  /** A first name from the OS account, for greetings; null when it doesn't read as one. */
  userName: string | null;
  version: string;
}

/** A region of the window in CSS pixels, as getBoundingClientRect reports it. */
export interface CaptureRect {
  height: number;
  width: number;
  x: number;
  y: number;
}

/** What the preload exposes to the renderer as `window.daylily`. */
export interface DaylilyApi {
  app: {
    info: () => Promise<AppInfo>;
  };
  garden: {
    /** Asks where to save, then writes that region of the window as a PNG. False if cancelled. */
    saveImage: (rect: CaptureRect, name: string) => Promise<boolean>;
  };
  /** The OS, available synchronously for layout (macOS keeps its traffic lights). */
  platform: string;
}
