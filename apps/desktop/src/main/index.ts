import { join } from "node:path";
import { app, BrowserWindow, shell } from "electron";
import { registerIpc } from "./ipc";

const PAPER = "#f4eee3";

// Packaged builds carry the icon as a resource; in development it sits in resources/
const ICON = app.isPackaged
  ? join(process.resourcesPath, "icon.png")
  : join(import.meta.dirname, "../../build/icon.png");

/** What a link may open outside the app: web pages, and mail from links in a page. */
const EXTERNAL_LINK = /^(https?:\/\/|mailto:)/i;

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

  window.once("ready-to-show", () => window.show());

  // Links leave the app for the system browser; the window itself never navigates away
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (EXTERNAL_LINK.test(url)) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });
  window.webContents.on("will-navigate", (event) => event.preventDefault());

  const devUrl = process.env.ELECTRON_RENDERER_URL;
  if (devUrl) {
    window.loadURL(devUrl);
  } else {
    window.loadFile(join(import.meta.dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  registerIpc();
  createWindow();

  // macOS keeps apps alive without windows; clicking the dock icon opens one again
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
