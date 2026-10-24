import { app, BrowserWindow } from "electron";
import { CHANNELS } from "../shared/channels";
import { windowActionSchema } from "../shared/schemas";
import { handle } from "./ipc";

const ZOOM_STEP = 0.5;
const ZOOM_LIMIT = 3;

/**
 * What the title strip's controls and menus ask of the window, on Windows and
 * Linux where Daylily draws its own frame. Edits go to the focused page, as a
 * native Edit menu would.
 */
export function registerWindowIpc() {
  handle(CHANNELS.windowAction, (event, rawAction) => {
    const action = windowActionSchema.parse(rawAction);
    const window = BrowserWindow.fromWebContents(event.sender);
    const contents = event.sender;
    switch (action) {
      case "minimize":
        window?.minimize();
        break;
      case "toggle-maximize":
        if (window?.isMaximized()) {
          window.unmaximize();
        } else {
          window?.maximize();
        }
        break;
      case "close":
        window?.close();
        break;
      case "quit":
        app.quit();
        break;
      case "zoom-in":
        contents.setZoomLevel(
          Math.min(contents.getZoomLevel() + ZOOM_STEP, ZOOM_LIMIT)
        );
        break;
      case "zoom-out":
        contents.setZoomLevel(
          Math.max(contents.getZoomLevel() - ZOOM_STEP, -ZOOM_LIMIT)
        );
        break;
      case "zoom-reset":
        contents.setZoomLevel(0);
        break;
      default:
        // undo, redo, cut, copy, paste, selectAll: the page's own editing commands
        contents[action]();
    }
  });

  handle(
    CHANNELS.windowMaximized,
    (event) =>
      BrowserWindow.fromWebContents(event.sender)?.isMaximized() ?? false
  );
}

/** Tells the page when the window is maximised or restored, so its button shows which. */
export function reportMaximized(window: BrowserWindow) {
  const send = (maximized: boolean) => {
    if (!window.isDestroyed()) {
      window.webContents.send(CHANNELS.windowMaximizedChanged, maximized);
    }
  };
  window.on("maximize", () => send(true));
  window.on("unmaximize", () => send(false));
}
