/**
 * The IPC contract between the renderer and the main process. Channel names and
 * result types live here; their schemas live in `schemas.ts` so the sandboxed
 * preload stays free of runtime dependencies.
 */
export const CHANNELS = {
  appInfo: "app:info",
} as const;

export interface AppInfo {
  platform: string;
  version: string;
}

/** What the preload exposes to the renderer as `window.daylily`. */
export interface DaylilyApi {
  app: {
    info: () => Promise<AppInfo>;
  };
  /** The OS, available synchronously for layout (macOS keeps its traffic lights). */
  platform: string;
}
