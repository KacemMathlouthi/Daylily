import { join } from "node:path";
import { systemClock } from "@daylily/core/clock";
import { app, BrowserWindow, shell } from "electron";
import { CHANNELS } from "../shared/channels";
import { setMacMenu } from "./app-menu";
import { registerDeviceIpc } from "./device-ipc";
import { isQuitting, saveBeforeClosing, saveOnSleepAndQuit } from "./flush";
import { registerIpc, whenAppReady } from "./ipc";
import { registerJournalIpc } from "./journal/ipc";
import { registerJournalScheme, serveJournalAssets } from "./journal/protocol";
import { createJournal } from "./journal/store";
import { remindInTheEvening } from "./reminder-scheduler";
import { sealAsDaysEnd } from "./seal-scheduler";
import { type DeviceSettingsStore, deviceSettings } from "./settings";
import { loadPage, openSplash } from "./splash";
import { backgroundTray } from "./tray";
import { keepUpToDate } from "./updates";
import { registerWindowIpc, reportMaximized } from "./window-ipc";

const PAPER = "#f4eee3";

// Packaged builds carry the icon as a resource; in development it sits in resources/
const ICON = app.isPackaged
  ? join(process.resourcesPath, "icon.png")
  : join(import.meta.dirname, "../../resources/icon.png");

/** What a link may open outside the app: web pages, and mail from links in a page. */
const EXTERNAL_LINK = /^(https?:\/\/|mailto:)/i;

/** If the app never says it's ready (an error on load), show it anyway after this long. */
const READY_FALLBACK_MS = 10_000;

/** The app's window; it's hidden rather than closed while Daylily waits in the tray. */
let mainWindow: BrowserWindow | null = null;
/** Whether closing the window leaves Daylily running, for the evening reminder. */
let keepRunning = false;
/** Today's page was asked for while no window was there; the next one opens on it. */
let openTodayWhenReady = false;
/** Help › Welcome to Daylily was chosen while no window was there; the next one opens on it. */
let openWelcomeWhenReady = false;

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

  saveBeforeClosing(window, () => keepRunning);
  window.on("closed", () => {
    if (mainWindow === window) {
      mainWindow = null;
    }
  });
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
  mainWindow = window;
  splash.progress(15);
  window.webContents.once("did-start-loading", () => splash.progress(35));
  window.webContents.once("dom-ready", () => splash.progress(70));

  let fallback: ReturnType<typeof setTimeout> | undefined;
  const stopWaiting = whenAppReady(window.webContents, () => {
    clearTimeout(fallback);
    splash.handOver(window);
    if (openTodayWhenReady) {
      openTodayWhenReady = false;
      window.webContents.send(CHANNELS.appOpenToday);
    }
    if (openWelcomeWhenReady) {
      openWelcomeWhenReady = false;
      window.webContents.send(CHANNELS.appOpenWelcome);
    }
  });
  fallback = setTimeout(() => {
    stopWaiting();
    splash.handOver(window);
  }, READY_FALLBACK_MS);
}

/** Brings the window back, from the tray or a second launch, or opens one if there's none. */
function showWindow(settings: DeviceSettingsStore) {
  // A second launch while quitting, as when an update starts its new version, opens nothing here
  if (isQuitting()) {
    return;
  }
  if (!mainWindow || mainWindow.isDestroyed()) {
    // Unless one is on its way, behind the splash
    if (BrowserWindow.getAllWindows().length === 0) {
      launch(settings);
    }
    return;
  }
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.show();
  mainWindow.focus();
}

/**
 * Opens the journal this computer uses, the door to it from the page, seals its
 * days as they end, and reminds in the evening.
 */
async function openJournal(settings: DeviceSettingsStore) {
  const tray = backgroundTray({ icon: ICON, open: () => showWindow(settings) });
  let rescheduleReminder: () => void = () => undefined;
  const current = registerJournalIpc({
    onConfigChange: () => rescheduleReminder(),
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
  rescheduleReminder = remindInTheEvening({
    clock: systemClock,
    icon: ICON,
    journal: current,
    onEnabledChange: (enabled) => {
      keepRunning = enabled;
      tray.show(enabled);
    },
    openToday: () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        showWindow(settings);
        mainWindow.webContents.send(CHANNELS.appOpenToday);
        return;
      }
      openTodayWhenReady = true;
      showWindow(settings);
    },
  });
}

registerJournalScheme();

// One Daylily at a time: opening it again, as while it waits in the tray, shows the window
const firstInstance = app.requestSingleInstanceLock();
if (!firstInstance) {
  app.quit();
}

if (process.platform === "win32") {
  // Windows shows notifications under this id, the same the installer gives the app
  app.setAppUserModelId("app.daylily.desktop");
}

app.whenReady().then(async () => {
  if (!firstInstance) {
    return;
  }
  const settings = deviceSettings(app.getPath("userData"));
  registerIpc();
  registerWindowIpc();
  saveOnSleepAndQuit();
  await registerDeviceIpc(settings);
  await openJournal(settings);
  const updates = await keepUpToDate({ clock: systemClock, settings });
  launch(settings);
  // Looked for while the splash shows; it never holds the app up
  updates.check();
  app.on("second-instance", () => showWindow(settings));
  if (process.platform === "darwin") {
    setMacMenu(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        showWindow(settings);
        mainWindow.webContents.send(CHANNELS.appOpenWelcome);
        return;
      }
      openWelcomeWhenReady = true;
      showWindow(settings);
    });
  }

  // macOS keeps apps alive without windows; clicking the dock icon brings one back
  app.on("activate", () => showWindow(settings));
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
