import { join } from "node:path";
import { BrowserWindow } from "electron";

/** Long enough for the bloom and the name to appear, even when the app loads at once. */
const MIN_SPLASH_MS = 1400;
const FADE_MS = 280;
/** If the splash can't paint by then, the app opens without it rather than waiting. */
const SHOW_TIMEOUT_MS = 2000;
const FADE_STEPS = 14;

/** Loads one of the renderer's pages: from the dev server, or from the built files. */
export function loadPage(window: BrowserWindow, page: "index" | "splash") {
  const devUrl = process.env.ELECTRON_RENDERER_URL;
  if (devUrl) {
    return window.loadURL(page === "index" ? devUrl : `${devUrl}/${page}.html`);
  }
  return window.loadFile(join(import.meta.dirname, `../renderer/${page}.html`));
}

/**
 * Paper's "01c Launch · splash window": a small frameless card shown the instant
 * Daylily starts, so there's never a moment where nothing happens. It reports
 * real progress while the main window loads hidden behind it, then fades out.
 */
export function openSplash({
  icon,
  background,
}: {
  icon: string;
  /** The paper colour, so the window never flashes white before it paints. */
  background: string;
}) {
  // Counted from when it appears, so a slow first paint doesn't eat into the bloom
  let shownAt: number | null = null;
  let progress = 0;
  const splash = new BrowserWindow({
    backgroundColor: background,
    center: true,
    frame: false,
    fullscreenable: false,
    height: 390,
    icon,
    maximizable: false,
    minimizable: false,
    resizable: false,
    show: false,
    title: "Daylily",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    width: 300,
  });
  const shown = new Promise<void>((resolve) => {
    splash.once("ready-to-show", () => {
      if (!splash.isDestroyed()) {
        shownAt = Date.now();
        splash.show();
      }
      resolve();
    });
    setTimeout(resolve, SHOW_TIMEOUT_MS);
  });

  // Numbers only, set by this process; the page listens for the event
  const send = () => {
    if (!splash.isDestroyed()) {
      splash.webContents
        .executeJavaScript(
          `window.dispatchEvent(new CustomEvent("daylily:progress", { detail: ${progress} }))`
        )
        .catch(() => undefined);
    }
  };
  splash.webContents.on("did-finish-load", send);
  loadPage(splash, "splash");

  return {
    /** Shows the app, then fades the splash away once it has been up long enough. */
    handOver(app: BrowserWindow) {
      progress = 100;
      send();
      if (shownAt === null) {
        // It never appeared; showing it now would only flash it
        splash.destroy();
        app.show();
        return;
      }
      const wait = Math.max(0, MIN_SPLASH_MS - (Date.now() - shownAt));
      setTimeout(() => {
        // Behind the splash while it fades, then brought forward once it's gone
        if (app.isDestroyed()) {
          return;
        }
        app.showInactive();
        let step = 0;
        const fade = setInterval(() => {
          step += 1;
          if (splash.isDestroyed() || step >= FADE_STEPS) {
            clearInterval(fade);
            if (!splash.isDestroyed()) {
              splash.close();
            }
            if (!app.isDestroyed()) {
              app.focus();
            }
            return;
          }
          splash.setOpacity(1 - step / FADE_STEPS);
        }, FADE_MS / FADE_STEPS);
      }, wait);
    },
    /** Moves the bar forward; it never goes back. */
    progress(value: number) {
      progress = Math.max(progress, value);
      send();
    },
    /**
     * Resolves once the splash is on screen, or has given up trying. The app waits
     * for it, so the two never race for the machine and the splash comes first.
     */
    shown,
  };
}
