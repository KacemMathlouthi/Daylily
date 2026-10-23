import { contextBridge, type IpcRendererEvent, ipcRenderer } from "electron";
import { CHANNELS, type DaylilyApi } from "../shared/channels";

/** The only door between the UI and the rest of the computer. Keep it small. */
const api: DaylilyApi = {
  app: {
    info: () => ipcRenderer.invoke(CHANNELS.appInfo),
    ready: () => ipcRenderer.send(CHANNELS.appReady),
  },
  cover: {
    pick: () => ipcRenderer.invoke(CHANNELS.pickCover),
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
