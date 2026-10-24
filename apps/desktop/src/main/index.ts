import { join } from "node:path";
import { systemClock } from "@daylily/core/clock";
import { app, BrowserWindow, shell } from "electron";
import { registerDeviceIpc } from "./device-ipc";
import { saveBeforeClosing, saveOnSleepAndQuit } from "./flush";
import { registerIpc, whenAppReady } from "./ipc";
import { registerJournalIpc } from "./journal/ipc";
import { registerJournalScheme, serveJournalAssets } from "./journal/protocol";
import { createJournal } from "./journal/store";
import { sealAsDaysEnd } from "./seal-scheduler";
import { type DeviceSettingsStore, deviceSettings } from "./settings";
import { loadPage, openSplash } from "./splash";
import { registerWindowIpc, reportMaximized } from "./window-ipc";

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
    // macOS keeps its traffic lights; elsewhere Daylily draws its own title strip
    ...(process.platform === "darwin"
      ? { titleBarStyle: "hiddenInset" as const }
      : { frame: false }),
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

  saveBeforeClosing(window);
  reportMaximized(window);
  loadPage(window, "index");
  return window;
}

/** Opens the app behind the splash, which follows its loading and hands over when it has painted. */
async function launch(settings: DeviceSettingsStore) {
  const splash = openSplash({
    background: PAPER,
    icon: ICON,
    theme: (await settings.read()).theme,
  });
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

/**
 * Opens the journal this computer uses, the door to it from the page, and seals
 * its days as they end.
 */
async function openJournal(settings: DeviceSettingsStore) {
  const current = registerJournalIpc({
    open: (root) =>
      createJournal({
        app: `daylily/${app.getVersion()}`,
        clock: systemClock,
        root,
      }),
    root: await settings.journalPath(),
    settings,
  });
  serveJournalAssets(current);
  sealAsDaysEnd({ clock: systemClock, journal: current });
}

registerJournalScheme();

app.whenReady().then(async () => {
  const settings = deviceSettings(app.getPath("userData"));
  registerIpc();
  registerWindowIpc();
  saveOnSleepAndQuit();
  await registerDeviceIpc(settings);
  await openJournal(settings);
  launch(settings);

  // macOS keeps apps alive without windows; clicking the dock icon opens one again
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      launch(settings);
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
