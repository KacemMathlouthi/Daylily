import { join } from "node:path";
import { systemClock } from "@daylily/core/clock";
import { app, BrowserWindow, shell } from "electron";
import { registerIpc, whenAppReady } from "./ipc";
import { registerJournalIpc } from "./journal/ipc";
import { registerJournalScheme, serveJournalAssets } from "./journal/protocol";
import { createJournal } from "./journal/store";
import { deviceSettings } from "./settings";
import { loadPage, openSplash } from "./splash";

const PAPER = "#f4eee3";

// Packaged builds carry the icon as a resource; in development it sits in resources/
const ICON = app.isPackaged
  ? join(process.resourcesPath, "icon.png")
  : join(import.meta.dirname, "../../build/icon.png");

/** What a link may open outside the app: web pages, and mail from links in a page. */
const EXTERNAL_LINK = /^(https?:\/\/|mailto:)/i;

/** If the app never says it's ready (an error on load), show it anyway after this long. */
const READY_FALLBACK_MS = 10_000;

function createWindow() {
  const window = new BrowserWindow({
    backgroundColor: PAPER,
    height: 860,
    icon: ICON,
    minHeight: 600,
    minWidth: 900,
    show: false,
    title: "Daylily",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    trafficLightPosition: { x: 18, y: 18 },
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(import.meta.dirname, "../preload/index.js"),
      sandbox: true,
    },
    width: 1320,
  });

  // Links leave the app for the system browser; the window itself never navigates away
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (EXTERNAL_LINK.test(url)) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });
  window.webContents.on("will-navigate", (event) => event.preventDefault());

  loadPage(window, "index");
  return window;
}

/** Opens the app behind the splash, which follows its loading and hands over when it has painted. */
async function launch() {
  const splash = openSplash({ background: PAPER, icon: ICON });
  await splash.shown;
  const window = createWindow();
  splash.progress(15);
  window.webContents.once("did-start-loading", () => splash.progress(35));
  window.webContents.once("dom-ready", () => splash.progress(70));

  let fallback: ReturnType<typeof setTimeout> | undefined;
  const stopWaiting = whenAppReady(window.webContents, () => {
    clearTimeout(fallback);
    splash.handOver(window);
  });
  fallback = setTimeout(() => {
    stopWaiting();
    splash.handOver(window);
  }, READY_FALLBACK_MS);
}

/** Opens the journal this computer uses, and the door to it from the page. */
async function openJournal() {
  const settings = deviceSettings(app.getPath("userData"));
  const journal = createJournal({
    app: `daylily/${app.getVersion()}`,
    clock: systemClock,
    root: await settings.journalPath(),
  });
  registerJournalIpc(journal);
  serveJournalAssets(journal);
}

registerJournalScheme();

app.whenReady().then(async () => {
  registerIpc();
  await openJournal();
  launch();

  // macOS keeps apps alive without windows; clicking the dock icon opens one again
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      launch();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
