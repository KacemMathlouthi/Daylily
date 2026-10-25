import { contextBridge, type IpcRendererEvent, ipcRenderer } from "electron";
import {
  CHANNELS,
  type DaylilyApi,
  type UpdateState,
} from "../shared/channels";
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
    // Unknown, the app opens as usual rather than asking again
    onboarded: typeof value?.onboarded === "boolean" ? value.onboarded : true,
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
    onFlush: (save) => {
      ipcRenderer.on(CHANNELS.appFlush, async () => {
        try {
          await save();
        } finally {
          ipcRenderer.send(CHANNELS.appFlushed);
        }
      });
    },
    onOpenToday: (listener) => {
      const forward = () => listener();
      ipcRenderer.on(CHANNELS.appOpenToday, forward);
      return () => {
        ipcRenderer.off(CHANNELS.appOpenToday, forward);
      };
    },
    onOpenWelcome: (listener) => {
      const forward = () => listener();
      ipcRenderer.on(CHANNELS.appOpenWelcome, forward);
      return () => {
        ipcRenderer.off(CHANNELS.appOpenWelcome, forward);
      };
    },
    ready: () => ipcRenderer.send(CHANNELS.appReady),
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
    addImage: (day, image) =>
      ipcRenderer.invoke(CHANNELS.journalAddImage, day, image),
    change: () => ipcRenderer.invoke(CHANNELS.journalChange),
    flowerColor: (day, stamp, color) =>
      ipcRenderer.invoke(CHANNELS.journalFlowerColor, day, stamp, color),
    folder: () => ipcRenderer.invoke(CHANNELS.journalFolder),
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
    onSwitch: (listener) => {
      const forward = () => listener();
      ipcRenderer.on(CHANNELS.journalSwitched, forward);
      return () => {
        ipcRenderer.off(CHANNELS.journalSwitched, forward);
      };
    },
    pickCover: (day) => ipcRenderer.invoke(CHANNELS.journalPickCover, day),
    pickFolder: () => ipcRenderer.invoke(CHANNELS.journalPickFolder),
    read: (day) => ipcRenderer.invoke(CHANNELS.journalRead, day),
    saveCover: (day, image, extension, color) =>
      ipcRenderer.invoke(
        CHANNELS.journalSaveCover,
        day,
        image,
        extension,
        color
      ),
    search: (query) => ipcRenderer.invoke(CHANNELS.journalSearch, query),
    setConfig: (changes) =>
      ipcRenderer.invoke(CHANNELS.journalSetConfig, changes),
    show: (day?: string) => ipcRenderer.invoke(CHANNELS.journalShow, day),
    stats: () => ipcRenderer.invoke(CHANNELS.journalStats),
    use: (path) => ipcRenderer.invoke(CHANNELS.journalUse, path),
    write: (day, page) => ipcRenderer.invoke(CHANNELS.journalWrite, day, page),
  },
  platform: process.platform,
  updates: {
    check: () => ipcRenderer.invoke(CHANNELS.updatesCheck),
    dismiss: () => ipcRenderer.invoke(CHANNELS.updatesDismiss),
    install: () => ipcRenderer.invoke(CHANNELS.updatesInstall),
    onChange: (listener) => {
      const forward = (_event: IpcRendererEvent, state: UpdateState) =>
        listener(state);
      ipcRenderer.on(CHANNELS.updatesChanged, forward);
      return () => {
        ipcRenderer.off(CHANNELS.updatesChanged, forward);
      };
    },
    state: () => ipcRenderer.invoke(CHANNELS.updatesState),
  },
  window: {
    act: (action) => ipcRenderer.invoke(CHANNELS.windowAction, action),
    isMaximized: () => ipcRenderer.invoke(CHANNELS.windowMaximized),
    onMaximizedChange: (listener) => {
      const forward = (_event: IpcRendererEvent, maximized: boolean) =>
        listener(maximized);
      ipcRenderer.on(CHANNELS.windowMaximizedChanged, forward);
      return () => {
        ipcRenderer.off(CHANNELS.windowMaximizedChanged, forward);
      };
    },
  },
};

contextBridge.exposeInMainWorld("daylily", api);
