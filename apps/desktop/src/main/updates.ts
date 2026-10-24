import type { Clock } from "@daylily/core/clock";
import { app, BrowserWindow } from "electron";
import electronUpdater from "electron-updater";
import {
  CHANNELS,
  type UpdateDownload,
  type UpdateState,
} from "../shared/channels";
import { flushAllPages } from "./flush";
import { handle } from "./ipc";
import type { DeviceSettingsStore } from "./settings";
import { nextUpdateState, type UpdateEvent } from "./update-state";

const { autoUpdater } = electronUpdater;

/** Often enough that a computer left on for days still hears about a release. */
const RECHECK_MS = 6 * 60 * 60 * 1000;

/**
 * Where this copy goes for a new version, or null when it replaces itself:
 * Windows and the AppImage install on quit; macOS only updates a signed app,
 * and the Debian package belongs to the system's package manager.
 */
function downloadFor(): UpdateDownload | null {
  if (process.platform === "darwin") {
    return process.arch === "arm64" ? "mac" : "mac-intel";
  }
  if (process.platform === "linux" && !process.env.APPIMAGE) {
    return "deb";
  }
  return null;
}

/**
 * Keeps Daylily up to date from its GitHub releases: looks as the splash shows,
 * then every few hours; downloads quietly where it can replace itself, and
 * installs on the next quit, or at once when asked. Never interrupts writing.
 */
export async function keepUpToDate({
  clock,
  settings,
}: {
  clock: Clock;
  settings: DeviceSettingsStore;
}) {
  const download = downloadFor();
  let dismissedVersion = (await settings.read()).dismissedUpdate;
  // A development build has no releases to compare against
  let state: UpdateState = app.isPackaged
    ? { status: "idle" }
    : { status: "off" };

  const apply = (event: UpdateEvent) => {
    state = nextUpdateState(state, event, { dismissedVersion, download });
    for (const window of BrowserWindow.getAllWindows()) {
      window.webContents.send(CHANNELS.updatesChanged, state);
    }
  };

  const check = () => {
    const busy = state.status === "checking" || state.status === "downloading";
    if (state.status === "off" || busy) {
      return;
    }
    // Failures arrive as "error" events too; this only keeps the promise quiet
    autoUpdater.checkForUpdates().catch(() => undefined);
  };

  handle(CHANNELS.updatesState, () => state);
  handle(CHANNELS.updatesCheck, () => check());
  handle(CHANNELS.updatesDismiss, async () => {
    if (state.status === "ready" || state.status === "available") {
      dismissedVersion = state.version;
      await settings.write({ dismissedUpdate: state.version });
      apply({ type: "dismissed" });
    }
  });
  handle(CHANNELS.updatesInstall, async () => {
    if (state.status !== "ready") {
      return;
    }
    // Every word on disk before the app goes away
    await flushAllPages();
    // The new version starts before this one has gone; it must not find this one holding the door
    app.releaseSingleInstanceLock();
    autoUpdater.quitAndInstall(false, true);
  });

  if (state.status === "off") {
    return { check };
  }

  autoUpdater.autoDownload = download === null;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.logger = null;
  autoUpdater.on("checking-for-update", () => apply({ type: "checking" }));
  autoUpdater.on("update-not-available", () =>
    apply({ at: clock.now().toISOString(), type: "none" })
  );
  autoUpdater.on("update-available", (info) =>
    apply({ type: "found", version: info.version })
  );
  autoUpdater.on("download-progress", (progress) =>
    apply({ percent: progress.percent, type: "progress" })
  );
  autoUpdater.on("update-downloaded", (info) =>
    apply({ type: "downloaded", version: info.version })
  );
  autoUpdater.on("error", () => apply({ type: "failed" }));

  setInterval(check, RECHECK_MS).unref();
  return { check };
}
