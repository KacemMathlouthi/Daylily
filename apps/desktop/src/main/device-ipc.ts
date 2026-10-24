import { ipcMain } from "electron";
import { CHANNELS } from "../shared/channels";
import type { DeviceState } from "../shared/journal";
import { deviceChangesSchema } from "../shared/schemas";
import { handle, isTrustedSender } from "./ipc";
import type { DeviceSettingsStore } from "./settings";

/**
 * This computer's settings for the page: held in memory so a page starting up
 * gets them at once (its own storage can take seconds to open on Windows), and
 * saved when it changes them.
 */
export async function registerDeviceIpc(settings: DeviceSettingsStore) {
  const { sidebarOpen, theme } = await settings.read();
  let current: DeviceState = { sidebarOpen, theme };

  ipcMain.on(CHANNELS.deviceGet, (event) => {
    event.returnValue = isTrustedSender(event) ? current : null;
  });

  handle(CHANNELS.deviceSet, async (_event, changes) => {
    const saved = await settings.write(deviceChangesSchema.parse(changes));
    current = { sidebarOpen: saved.sidebarOpen, theme: saved.theme };
  });
}
