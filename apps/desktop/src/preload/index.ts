import { contextBridge, type IpcRendererEvent, ipcRenderer } from "electron";
import { CHANNELS, type DaylilyApi } from "../shared/channels";
import type { DeviceState } from "../shared/journal";

const THEMES = new Set(["light", "dark", "system"]);

/**
 * This computer's settings, asked of the main process once as the page starts:
 * it holds them in memory, so the answer is immediate. Checked by hand to keep
 * the preload free of dependencies.
 */
function initialDevice(): DeviceState {
  const value: Partial<DeviceState> | null = ipcRenderer.sendSync(
    CHANNELS.deviceGet
  );
  return {
    sidebarOpen:
      typeof value?.sidebarOpen === "boolean" ? value.sidebarOpen : true,
    theme: THEMES.has(value?.theme ?? "")
      ? (value?.theme as DeviceState["theme"])
      : "system",
  };
}

/** The only door between the UI and the rest of the computer. Keep it small. */
const api: DaylilyApi = {
  app: {
    info: () => ipcRenderer.invoke(CHANNELS.appInfo),
    ready: () => ipcRenderer.send(CHANNELS.appReady),
  },
  cover: {
    pick: () => ipcRenderer.invoke(CHANNELS.pickCover),
  },
  device: {
    initial: initialDevice(),
    set: (changes) => ipcRenderer.invoke(CHANNELS.deviceSet, changes),
  },
  garden: {
    saveImage: (png, name) =>
      ipcRenderer.invoke(CHANNELS.saveGardenImage, png, name),
  },
  journal: {
    info: () => ipcRenderer.invoke(CHANNELS.journalInfo),
    list: () => ipcRenderer.invoke(CHANNELS.journalList),
    onChange: (listener) => {
      // The event itself stays here: it carries the sender, which the page must not see
      const forward = (_event: IpcRendererEvent, days: string[]) =>
        listener(days);
      ipcRenderer.on(CHANNELS.journalChanged, forward);
      return () => {
        ipcRenderer.off(CHANNELS.journalChanged, forward);
      };
    },
    read: (day) => ipcRenderer.invoke(CHANNELS.journalRead, day),
    saveCover: (day, image, extension) =>
      ipcRenderer.invoke(CHANNELS.journalSaveCover, day, image, extension),
    setConfig: (changes) =>
      ipcRenderer.invoke(CHANNELS.journalSetConfig, changes),
    write: (day, page) => ipcRenderer.invoke(CHANNELS.journalWrite, day, page),
  },
  platform: process.platform,
};

contextBridge.exposeInMainWorld("daylily", api);
