import { contextBridge, ipcRenderer } from "electron";
import { CHANNELS, type DaylilyApi } from "../shared/channels";

/** The only door between the UI and the rest of the computer. Keep it small. */
const api: DaylilyApi = {
  app: {
    info: () => ipcRenderer.invoke(CHANNELS.appInfo),
  },
  platform: process.platform,
};

contextBridge.exposeInMainWorld("daylily", api);
