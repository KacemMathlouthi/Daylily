import { join } from "node:path";
import { BrowserWindow } from "electron";

/** Long enough for the bloom and the name to appear, even when the app loads at once. */
const MIN_SPLASH_MS = 1400;
const FADE_MS = 280;
/** If the splash hasn't painted by then, it shows anyway and the app starts loading. */
const SHOW_TIMEOUT_MS = 2000;
/**
 * Windows doesn't paint a hidden window, so a splash waiting for its first paint
 * would wait for nothing. There it's shown at once, fully transparent, and made
 * visible once it has drawn.
 */
const SHOW_TRANSPARENT = process.platform === "win32";
const TWO_FRAMES =
  "new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)))";
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
    opacity: SHOW_TRANSPARENT ? 0 : 1,
    resizable: false,
    show: SHOW_TRANSPARENT,
    title: "Daylily",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    width: 300,
  });
  const painted = new Promise<void>((resolve) => {
    if (SHOW_TRANSPARENT) {
      // Already on screen, so its frames run: two of them after load means it has drawn
      splash.webContents.once("did-finish-load", () => {
        splash.webContents
          .executeJavaScript(TWO_FRAMES)
          .then(() => resolve(), resolve);
      });
    } else {
      splash.once("ready-to-show", () => resolve());
    }
    setTimeout(resolve, SHOW_TIMEOUT_MS);
  });
  const shown = painted.then(() => {
    if (splash.isDestroyed()) {
      return;
    }
    shownAt = Date.now();
    if (SHOW_TRANSPARENT) {
      splash.setOpacity(1);
    } else {
      splash.show();
    }
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
        // The splash went away before it could show; the app opens on its own
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
