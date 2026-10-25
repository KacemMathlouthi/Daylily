import {
  app,
  BrowserWindow,
  type IpcMainEvent,
  ipcMain,
  powerMonitor,
} from "electron";
import { CHANNELS } from "../shared/channels";

/** Long enough for a save; short enough that a stuck page never keeps the app open. */
const FLUSH_TIMEOUT_MS = 3000;

/** Asks the page to write anything unsaved; resolves when it has, or after a while. */
function flushPage(window: BrowserWindow) {
  return new Promise<void>((resolve) => {
    const contents = window.webContents;
    const done = () => {
      clearTimeout(timer);
      ipcMain.off(CHANNELS.appFlushed, listener);
      resolve();
    };
    const listener = (event: IpcMainEvent) => {
      if (event.sender === contents) {
        done();
      }
    };
    const timer = setTimeout(done, FLUSH_TIMEOUT_MS);
    ipcMain.on(CHANNELS.appFlushed, listener);
    contents.send(CHANNELS.appFlush);
  });
}

/** Asks every window to save what's unsaved, such as before the journal moves. */
export async function flushAllPages() {
  await Promise.all(BrowserWindow.getAllWindows().map(flushPage));
}

let quitting = false;

/** Whether Daylily is on its way out, so nothing should open a window again. */
export function isQuitting() {
  return quitting;
}

/** Saves before the computer sleeps and remembers a quit, so it can resume after saving. */
export function saveOnSleepAndQuit() {
  app.on("before-quit", () => {
    quitting = true;
  });
  powerMonitor.on("suspend", () => {
    for (const window of BrowserWindow.getAllWindows()) {
      flushPage(window);
    }
  });
}

/**
 * Holds a window open until its page has saved, then closes it, and carries on
 * quitting if that's why it closed. While `keepRunning` says so, closing only
 * hides it, so Daylily stays in the tray for the evening reminder.
 */
export function saveBeforeClosing(
  window: BrowserWindow,
  keepRunning: () => boolean
) {
  let saved = false;
  let saving = false;
  window.on("close", (event) => {
    if (saved || window.webContents.isDestroyed()) {
      return;
    }
    if (!quitting && keepRunning()) {
      event.preventDefault();
      flushPage(window);
      window.hide();
      return;
    }
    event.preventDefault();
    if (saving) {
      return;
    }
    saving = true;
    flushPage(window).then(() => {
      saved = true;
      if (quitting) {
        app.quit();
      } else if (!window.isDestroyed()) {
        window.close();
      }
    });
  });
}
